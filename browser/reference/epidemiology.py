"""Quarterly infection, immunity, treatment, and imported outbreaks."""

from collections import Counter
from dataclasses import replace
from society import technology_modifiers


CURE_TECH = {"medicine", "surgery", "herbal pharmacology", "germ theory", "vaccination"}


def cure_progress(sim):
    """Disease name -> cure percentage (0-100), built by scientists and healers."""
    if not hasattr(sim, "cure_progress"):
        sim.cure_progress = {}
    return sim.cure_progress


def advance_cures(sim):
    """Each year scientists and healers add to every disease's cure percentage.

    Healers count fully where a disease is active and a little elsewhere; scientists work
    everywhere at half weight. Medical technology multiplies effort; chronic and endemic
    diseases are harder. Dormant diseases progress more slowly."""
    from systems import state
    progress = cure_progress(sim)
    total = max(1, len(sim.people))
    scientists = {}
    healers = {}
    active = {}
    for person in sim.people.values():
        if person.age >= 18:
            if person.job == "scientist":
                scientists[person.country] = scientists.get(person.country, 0) + 1
            elif person.job == "healer":
                healers[person.country] = healers.get(person.country, 0) + 1
        if person.infection:
            key = (person.country, person.infection)
            active[key] = active.get(key, 0) + 1
    for name in sorted(sim.sicknesses):
        disease = sim.sicknesses[name]
        effort = 0.0
        for cid in sorted(set(list(scientists) + list(healers))):
            multiplier = (1 + technology_modifiers(sim.countries[cid])["cure"]) * state(sim, cid)["cure_mult"]
            weight = 1.0 if active.get((cid, name), 0) else .3
            effort += (scientists.get(cid, 0) * .5 + healers.get(cid, 0) * weight) * multiplier
        difficulty = {"acute": 1.0, "chronic": 2.0, "endemic": 1.5}.get(getattr(disease, "course", "acute"), 1.0)
        circulating = any(count for (cid, disease_name), count in active.items() if disease_name == name)
        gain = 100 * effort / total / difficulty * (1.0 if circulating else .4)
        before = progress.get(name, 0.0)
        progress[name] = min(100.0, before + gain)
        if before < 100 <= progress[name]:
            sim.record(f"Scientists and healers completed a cure for {name}; it will be eradicated as soon as no one is infected.", "sickness")


def retire_disease(sim, name):
    """Remove a disease from play, keeping its history. Callers check the cure and infections first."""
    for c in sim.countries.values():
        if c.sickness == name:
            c.sickness = None
            c.conditions.discard("Disease")
        local = getattr(c, "disease_outbreaks", {}).pop(name, None)
        if local is not None:
            if not hasattr(c, "retired_outbreaks"):
                c.retired_outbreaks = {}
            c.retired_outbreaks[name] = local
    if not hasattr(sim, "retired_sicknesses"):
        sim.retired_sicknesses = {}
    sim.retired_sicknesses[name] = sim.sicknesses.pop(name)


def auto_eradicate(sim):
    """A disease with a complete cure and no one infected is eradicated at once."""
    progress = cure_progress(sim)
    sick = Counter(p.infection for p in sim.people.values() if p.infection)
    for name in sorted(sim.sicknesses):
        if progress.get(name, 0.0) >= 100 and sick[name] == 0:
            retire_disease(sim, name)
            sim.record(f"{name} has been eradicated: the cure is complete and the last patient has recovered.", "sickness")


def _profile(sim, name):
    """Return a stable course for each disease, stored outside frozen Sickness."""
    profiles = getattr(sim, "disease_profiles", None)
    if profiles is None:
        profiles = sim.disease_profiles = {}
    if name not in profiles:
        disease = sim.sicknesses[name]
        # A seeded draw keeps the mix varied while making the course stable.
        course = getattr(disease, "course", None)
        if course not in {"acute", "chronic", "endemic"}:
            course = sim.rng.choices(("acute", "chronic", "endemic"), (72, 10, 18))[0]
        if getattr(disease, "recurring", False):
            course = "endemic"
        profiles[name] = {"course": course}
    return profiles[name]


def _history(person, kind, name, year):
    """Keep a per-person record without changing the public Person constructor."""
    history = getattr(person, "infection_history", None)
    if history is None:
        history = person.infection_history = []
    history.append({"event": kind, "disease": name, "year": year})


def _local_outbreak(sim, country, name):
    if not hasattr(country, "disease_outbreaks"):
        country.disease_outbreaks = {}
    return country.disease_outbreaks.setdefault(name, {
        "age": 0, "last_year": None, "cooldown_until": 0, "episodes": 0,
        "annual": [], "seasonal": [], "source": country.sickness == name,
    })


def _expire_immunity(person, year):
    for name, expiry in list(person.immunity_until.items()):
        if expiry <= year:
            person.immunity.discard(name)
            del person.immunity_until[name]


def import_infections(sim):
    for person in sim.people.values():
        _expire_immunity(person, sim.year)
    infected = [p for p in sim.people.values() if p.infection]
    if not infected:
        return
    from geography import neighbors
    land, sea = neighbors(sim)
    by_country = {}
    for person in sim.people.values():
        by_country.setdefault(person.country, []).append(person)
    for cid, residents in by_country.items():
        country = sim.countries[cid]
        if country.quarantine or sim.rng.random() >= .15:
            continue
        # Disease travels over land borders, and only sometimes across a strait.
        reachable = set(land.get(cid, set()))
        if sim.rng.random() < .3:
            reachable.update(sea.get(cid, set()))
        sources = [p for p in infected if p.country in reachable and not sim.countries[p.country].quarantine]
        if not sources:
            continue
        source = sim.rng.choice(sources)
        candidates = [p for p in residents if not p.infection and source.infection not in p.immunity]
        if candidates:
            patient = sim.rng.choice(candidates)
            patient.infection = source.infection
            patient.infection_steps = 0
            _profile(sim, source.infection)
            _history(patient, "infected", source.infection, sim.year)
            sim.record(f"Travelers brought {source.infection} from {sim.countries[source.country].name} "
                       f"to {country.name}; a new case was identified.", "sickness")


def resolve_disease(sim, country, residents):
    residents = [p for p in residents if p.id in sim.people]
    if not residents:
        return 0
    for person in residents:
        _expire_immunity(person, sim.year)
    local_names = {p.infection for p in residents if p.infection}
    local_names.update(getattr(country, "disease_outbreaks", {}))
    if country.sickness:
        local_names.add(country.sickness)
    for name in local_names:
        state = _local_outbreak(sim, country, name)
        if country.sickness == name:
            state["source"] = True
        if state["last_year"] != sim.year:
            state["age"] += 1
            state["last_year"] = sim.year
    cures = getattr(sim, "cure_progress", {})
    initially_infected = [p for p in residents if p.infection]
    should_quarantine = len(initially_infected) / len(residents) >= .05
    if should_quarantine != country.quarantine:
        country.quarantine = should_quarantine
        sim.record(f"{country.name} {'restricted gatherings and travel' if should_quarantine else 'lifted its quarantine'}.", "sickness")
    if country.quarantine:
        country.prosperity = max(0, country.prosperity - 2)
    if initially_infected:
        patient = sim.rng.choice(initially_infected)
        disease = sim.sicknesses[patient.infection]
        if sim.rng.random() < disease.mutation_chance:
            number = 2
            root = disease.name.split(" strain ")[0]
            name = f"{root} strain {number}"
            while name in sim.sicknesses:
                number += 1
                name = f"{root} strain {number}"
            sim.sicknesses[name] = replace(disease, name=name,
                infection_chance=min(.85, disease.infection_chance * sim.rng.uniform(.85, 1.25)),
                death_chance=min(.2, disease.death_chance * sim.rng.uniform(.7, 1.3)))
            parent_profile = _profile(sim, patient.infection)
            sim.disease_profiles[name] = dict(parent_profile)
            cure_progress(sim)[name] = cure_progress(sim).get(disease.name, 0.0) * .5
            patient.infection = name
            patient.infection_steps = 0
            _history(patient, "variant", name, sim.year)
            sim.record(f"A new variant, {name}, emerged in {country.name}; immunity to earlier strains may not protect residents.", "sickness")

    counts = {}
    disease_starting_counts = Counter(p.infection for p in initially_infected if p.infection)
    deaths = 0
    technology = country.technologies
    modifiers = technology_modifiers(country)
    from systems import state
    st = state(sim, country.id)
    medical = modifiers["disease_death"]
    from geography import profile
    coastal = profile(sim, country.id)["coastal"]
    sanitation = modifiers["water"]
    care_fraction = .04 + modifiers["care"]
    capacity = max(5, int(len(residents) * care_fraction)) + st["care_bonus"]
    if "vaccination" in technology:
        known = sorted({p.infection for p in residents if p.infection} | ({country.sickness} if country.sickness else set()))
        for name in known:
            vaccinated = 0
            for person in residents:
                if not person.infection and name not in person.immunity and sim.rng.random() < .2:
                    person.immunity.add(name)
                    person.immunity_until[name] = sim.year + sim.sicknesses[name].immunity_years
                    _history(person, "vaccinated", name, sim.year)
                    vaccinated += 1
            if vaccinated:
                country.prosperity = max(0, country.prosperity - 1)
                sim.record(f"A vaccination campaign in {country.name} protected {vaccinated} residents against {name}.", "sickness")
    # Annual probabilities become quarterly hazards; incubation delays outcomes.
    for season in range(4):
        active = [p for p in residents if p.id in sim.people]
        infectious = Counter(p.infection for p in active
                             if p.infection and p.infection_steps >= sim.sicknesses[p.infection].incubation_steps)
        names = set(infectious)
        names.update(p.infection for p in active if p.infection)
        if country.sickness:
            names.add(country.sickness)
        names.update(name for name, state in getattr(country, "disease_outbreaks", {}).items()
                     if _profile(sim, name)["course"] == "endemic" and state["source"])
        for name in names:
            counts.setdefault(name, [0, 0, 0])
        overload = 1 + min(1, max(0, sum(infectious.values()) - capacity) / capacity) * .5
        season_prob = {}
        # Restrictions respond within the year, allowing early growth followed
        # by containment and immunity-driven decline rather than a fixed plateau.
        seasonal_quarantine = sum(infectious.values()) / max(1, len(active)) >= .08
        for person in active:
            newly_infected = False
            if person.infection is None:
                candidates = sorted(names - person.immunity)
                if len(candidates) > 1:
                    sim.rng.shuffle(candidates)
                for name in candidates:
                    # Everything here is the same for every resident in a season, so work it out once per disease.
                    infection_probability = season_prob.get(name)
                    if infection_probability is None:
                        disease = sim.sicknesses[name]
                        course = _profile(sim, name)
                        local = _local_outbreak(sim, country, name)
                        contacts = 12 if course["course"] == "acute" else 6 if course["course"] == "endemic" else 3
                        pressure = min(4, infectious[name] / max(1, len(active)) * contacts)
                        if country.sickness == name or (course["course"] == "endemic" and local["source"]):
                            # Acute introductions burn out; endemic sources recur at
                            # a low level after the initial wave has subsided.
                            if course["course"] == "endemic":
                                if sim.year >= local["cooldown_until"]:
                                    pressure = max(pressure, .10 if season in (0, 3) else .02)
                            elif course["course"] == "acute" and local["age"] <= 2:
                                pressure = max(pressure, .18 / local["age"])
                            elif course["course"] == "chronic" and local["age"] <= 2:
                                pressure = max(pressure, .12)
                        if country.quarantine or seasonal_quarantine:
                            pressure *= .55
                        pressure *= modifiers["infection"]
                        pressure *= st["infection_mult"]  # trade, crowding, wells, war
                        if (disease.transmission == "waterborne" and getattr(country, "last_disaster_type", None) == "flood"
                                and sim.year - (country.last_disaster_year or -9) <= 2):
                            pressure *= 1.4  # floodwater spreads waterborne disease
                        pressure *= 1 - .4 * cures.get(name, 0) / 100
                        if disease.transmission == "waterborne":
                            pressure *= sanitation * (1.3 if season in (1, 2) else .8) * (1 + .3 * coastal)
                        elif disease.transmission == "respiratory":
                            pressure *= (1.3 if season in (0, 3) else .8) * modifiers["air"]
                        else:
                            pressure *= modifiers["contact"]
                        infection_probability = 1 - (1 - disease.infection_chance) ** (pressure / 4)
                        season_prob[name] = infection_probability
                    if sim.rng.random() < infection_probability:
                        person.infection = name
                        person.infection_steps = 0
                        _history(person, "infected", name, sim.year)
                        counts[name][0] += 1
                        newly_infected = True
                        break
            if person.infection is None or newly_infected:
                continue
            name = person.infection
            disease = sim.sicknesses[name]
            person.infection_steps += 1
            if person.infection_steps <= disease.incubation_steps:
                continue
            vulnerability = 1.35 if person.age < 5 or person.age >= 65 else 1
            cure = cures.get(name, 0) / 100
            hazard = 1 - (1 - disease.death_chance) ** (medical * overload * vulnerability * (1 - .6 * cure) * st["death_mult"] / 4)
            if sim.rng.random() < hazard:
                person.died = sim.year
                person.cause_of_death = name
                _history(person, "died", name, sim.year)
                sim.lineages[person.lineage].deaths += 1
                del sim.people[person.id]
                counts[name][1] += 1
                deaths += 1
            elif sim.rng.random() < 1 - (1 - disease.recovery_chance) ** (.25 * (1 + cure) / medical):
                person.infection = None
                person.infection_steps = 0
                person.immunity.add(name)
                person.immunity_until[name] = sim.year + disease.immunity_years
                _history(person, "recovered", name, sim.year)
                counts[name][2] += 1
        still = Counter([p.infection for p in residents if p.id in sim.people and p.infection])
        for name in names:
            local = _local_outbreak(sim, country, name)
            local["seasonal"].append({"year": sim.year, "season": season + 1,
                "active": still[name],
                "infections": counts[name][0], "deaths": counts[name][1], "recoveries": counts[name][2]})
    final = Counter([p.infection for p in residents if p.id in sim.people and p.infection])
    for name, (infected, killed, recovered) in sorted(counts.items()):
        remaining = final[name]
        local = _local_outbreak(sim, country, name)
        previous = local["annual"][-1]["infections"] if local["annual"] else 0
        phase = "growing" if infected > previous else "declining" if infected < previous else "steady"
        local["annual"].append({"year": sim.year, "infections": infected, "deaths": killed,
                                "recoveries": recovered, "active": remaining, "phase": phase})
        sim.record(f"{name} in {country.name}: {infected} new infections, {killed} deaths, "
                   f"{recovered} recoveries, {remaining} still infected; {phase}; care capacity {capacity}.", "sickness")
        if remaining == 0:
            course = _profile(sim, name)
            if disease_starting_counts[name] or counts[name][0]:
                local["episodes"] += 1
                local["cooldown_until"] = sim.year + 2 if course["course"] == "endemic" else sim.year
            if country.sickness == name:
                if course["course"] != "endemic":
                    country.sickness = None
                    country.conditions.discard("Disease")
            if disease_starting_counts[name] or counts[name][0] or counts[name][1] or counts[name][2]:
                sim.record(f"The {name} outbreak in {country.name} ended.", "sickness")
    return deaths
