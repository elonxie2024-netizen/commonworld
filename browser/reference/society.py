"""Politics, trade, and gradual technological development for the simulation."""

from discoveries import advance_innovations, innovation_modifiers, share_innovation

import technology
from technology import effects as tech_effects, era_index, ERAS, BRANCHES, met as tech_met, MAX_LEAD

# Inventions require earlier discoveries; costs are accumulated research points.
# The full tree (eras, branches, and what each discovery changes) lives in technology.py.
TECHNOLOGIES = {name: (entry[0], entry[1], entry[2]) for name, entry in technology.TECH.items()}
FOOD_TECHS = {name for name, entry in technology.TECH.items() if entry[4] == "agriculture"}
INDUSTRY_TECHS = {name for name, entry in technology.TECH.items() if entry[4] in ("industry", "trade", "seafaring")}
KNOWLEDGE_TECHS = {name for name, entry in technology.TECH.items() if entry[4] == "knowledge"}
CARE_TECHS = {name for name, entry in technology.TECH.items() if entry[4] == "medicine"}


def technology_modifiers(country):
    """Persistent modifiers consumed by disease, warfare, travel and economy systems."""
    fx = tech_effects(country.technologies)
    result = {
        "infection": fx["inf"], "disease_death": fx["dth"], "military": 1 + fx["mil"], "defense": fx["dfn"],
        "wound_death": fx["wnd"], "water": fx["wat"], "air": fx["air"], "contact": fx["con"], "care": fx["care"],
        "cure": fx["cure"], "siege": fx["siege"], "trade": fx["trade"], "land": fx["land"], "sea": fx["sea"],
        "food": fx["food"], "weapon": fx["weapon"], "ship": fx["ship"], "cart": fx["cart"],
    }
    applied = innovation_modifiers(country)
    for key in ("infection", "disease_death", "military"):
        result[key] *= applied[key]
    result.update({key: applied[key] for key in ("production", "research", "logistics")})
    result["production"] *= 1 + fx["prod"]
    result["research"] *= 1 + fx["research"]
    result["logistics"] *= 1 + fx["log"]
    result["wound_death"] *= applied["disease_death"]
    return result


def insight_of(country):
    """Part-way knowledge of discoveries the country does not hold yet: {discovery: research points}."""
    if not hasattr(country, "insight"):
        country.insight = {}
    return country.insight


def boosted_of(country):
    """Discoveries a conquered country held; the conqueror researches them twice as fast."""
    if not hasattr(country, "boosted"):
        country.boosted = set()
    return country.boosted


def pacts_of(country):
    """Ids of the countries this one shares learning with year after year."""
    if not hasattr(country, "pacts"):
        country.pacts = set()
    return country.pacts


def end_pact(sim, a, b):
    """Drop a science pact between two countries (both sides keep the same record)."""
    pacts_of(a).discard(b.id)
    pacts_of(b).discard(a.id)


def learn(sim, country, name, points):
    """Credit research toward a discovery that others already hold; the country's own research power scales it."""
    if name in country.technologies or not tech_met(name, country.technologies):
        return 0.0
    gain = points * technology_modifiers(country)["research"]
    if name in boosted_of(country):
        gain *= 2
    gain = min(gain, TECHNOLOGIES[name][1])
    store = insight_of(country)
    store[name] = store.get(name, 0.0) + gain
    return gain


def pass_on_knowledge(sim, giver, taker, fraction):
    """Carry some of one discovery the giver holds and the taker lacks across; returns (name, share of its cost) or None.

    `fraction` is the share of the discovery's cost the carriers could pass on, scaled by the giver's production and then
    by the taker's research power."""
    ideas = technology.learnable(taker.technologies, giver.technologies)
    if not ideas:
        return None
    name = sim.rng.choice(ideas)
    project = getattr(taker, "research_project", None)
    if project in ideas and sim.rng.random() < .5:
        name = project
    cost = TECHNOLOGIES[name][1]
    gain = learn(sim, taker, name, min(.8, fraction * technology_modifiers(giver)["production"]) * cost)
    if gain <= 0:
        return None
    return name, gain / cost


def settle_insight(sim, country, adults):
    """Insight that adds up to a whole discovery is simply learned."""
    store = insight_of(country)
    for name in sorted(store):
        if name in country.technologies:
            store.pop(name, None)
        elif store[name] >= TECHNOLOGIES[name][1] and tech_met(name, country.technologies):
            store.pop(name, None)
            unlock(sim, country, name, sim.rng.choice(adults), borrowed=True)


def choose_project(sim, country, available, busy):
    """Pick what to research next from needs, geography, government and the shape of the tree."""
    favoured = [t for t in available if t in boosted_of(country)]
    if favoured and sim.rng.random() < .6:
        return sim.rng.choice(sorted(favoured))  # a conquered people's knowledge is cheap to take up
    from geography import profile
    from governments import trait
    prof = profile(sim, country.id)
    need = {b: 0.0 for b in BRANCHES}
    need["agriculture"] = 3.0 if (country.food < 55 or "Famine" in country.conditions) else .5
    need["medicine"] = 3.5 if country.sickness else .6
    need["warfare"] = 3.5 if country.id in busy else .3 + (1.0 if country.government in ("junta", "empire", "tyranny", "tribal") else 0)
    need["industry"] = .6 + 1.5 * prof["mountain"]
    need["seafaring"] = 2.2 * prof["coastal"]
    need["trade"] = 1.5 if getattr(country, "treasury", 0.0) < 500 else .6
    need["knowledge"] = 1.0 + max(0.0, trait(country, "research")) * 8
    need["governance"] = 1.8 if country.stability < 50 else .4
    need["energy"] = .5 + 1.2 * prof["mountain"] + .6 * prof["forest"]
    recent = getattr(country, "last_disaster_year", None)
    need["construction"] = 1.8 if (recent is not None and sim.year - recent <= 6) else .7
    need["culture"] = .8 + (1.6 if country.stability < 45 else 0)
    era = era_index(country.technologies)
    return technology.choose(sim.rng, available, country.technologies, need, era)


def advance_research(sim, country, adults, groups, busy):
    """One funded project per country; progress is a view of saved research."""
    settle_insight(sim, country, adults)
    available = technology.researchable(country.technologies)
    country.research_focus = ("medicine" if country.sickness else "military" if country.id in busy else "civilian")
    project = getattr(country, "research_project", None)
    if project not in available:
        project = choose_project(sim, country, available, busy) if available else None
        country.research_project = project
        if project:
            sim.record(f"{country.name} began a research project on {project} {technology.reason(technology.branch_of(project))}.", "discovery")
    country.research_focus = ("medicine" if country.sickness else "military" if country.id in busy else "civilian")
    country.research_budget = min(2.5, .2 + country.prosperity / 50)
    country.prosperity = clamp(country.prosperity - country.research_budget * .2)
    rate = (.5 + min(5, len(adults) / 80)) * (0.5 + country.prosperity / 100)
    rate *= technology_modifiers(country)["research"]
    from systems import state
    rate *= state(sim, country.id)["research"]
    country.research += rate * (.65 if country.id in busy else 1) * (2 if project in boosted_of(country) else 1)
    roll = sim.rng.random()
    if project and roll < .14:
        bonus = sim.rng.uniform(2, 7)
        country.research += bonus
        sim.record(f"An experiment in {country.name} advanced {project} by {bonus:.1f} research points.", "discovery")
    elif project and roll < .22:
        loss = min(country.research, sim.rng.uniform(1, 4))
        country.research -= loss
        sim.record(f"Failed trials in {country.name} cost {loss:.1f} research points on {project}.", "discovery")
    banked = insight_of(country).get(project, 0.0) if project else 0.0
    if project and country.research + banked >= TECHNOLOGIES[project][1]:
        used = min(banked, TECHNOLOGIES[project][1])
        country.research = max(0.0, country.research - (TECHNOLOGIES[project][1] - used))
        unlock(sim, country, project, sim.rng.choice(adults))
        country.research_project = None
    country.research_progress = country.research
    # Exchanges require peaceful inhabited partners and the recipient's prerequisites.
    # Ideas travel along borders and sea lanes, helped by trade.
    from geography import contacts
    land, sea = contacts(sim)
    reachable = set(land.get(country.id, set()))
    if "sailing" in country.technologies:
        reachable.update(sea.get(country.id, set()))
    partners = [sim.countries[cid] for cid in groups if cid != country.id and cid in reachable
                and cid not in busy and country.id not in busy]
    if partners and sim.rng.random() < .18 * min(2.5, .6 + .5 * state(sim, country.id)["trade"]):
        partner = sim.rng.choice(partners)
        share_innovation(sim, partner, country, adults)
        top = era_index(country.technologies) + MAX_LEAD
        ideas = [t for t in partner.technologies - country.technologies
                 if technology.met(t, country.technologies) and technology.era_of_tech(t) <= top]
        if ideas:
            idea = sim.rng.choice(sorted(ideas))
            unlock(sim, country, idea, sim.rng.choice(adults), borrowed=True)
            sim.record(f"Teachers from {partner.name} shared methods with {country.name}; both gained research experience.", "discovery")
            country.research += 1
            partner.research += 1
    # Day-to-day contact across the border: neighbors pass on a little of what they know (no news; it adds up).
    if partners and sim.rng.random() < .85:
        pass_on_knowledge(sim, sim.rng.choice(partners), country, .7)
    # Standing pacts: partners share even without a border, as long as there is peace.
    for pid in sorted(pacts_of(country)):
        friend = sim.countries.get(pid)
        if friend is None or friend.ended is not None or tuple(sorted((pid, country.id))) in sim.wars:
            continue
        if sim.rng.random() < .9:
            pass_on_knowledge(sim, friend, country, .5)
    if partners and sim.rng.random() < .015:
        friend = sim.rng.choice(partners)
        if friend.id not in pacts_of(country):
            pacts_of(country).add(friend.id)
            pacts_of(friend).add(country.id)
            sim.record(f"{country.name} and {friend.name} agreed to share what they learn.", "discovery")



def clamp(value):
    return max(0, min(100, value))


def choose_ruler(sim, country, adults):
    from governments import info
    form = info(country.government)
    previous = sim.archive.get(country.ruler)
    heirs = ([p for p in adults if previous.id in p.parents]
             if previous and form["succession"] == "hereditary" else [])
    if heirs:
        ruler = max(heirs, key=lambda p: p.age)
    elif form["succession"] in ("fame", "seizure"):
        ruler = max(adults, key=lambda p: (getattr(p, "fame", 0), p.id))
    elif form["succession"] == "wealth":
        ruler = max(adults, key=lambda p: (getattr(p, "wealth", 0), p.id))
    elif form["succession"] == "divine":
        clergy = [p for p in adults if getattr(p, "job", "") in ("healer", "teacher", "scientist", "scholar")]
        ruler = sim.rng.choice(clergy if clergy else adults)
    else:
        ruler = sim.rng.choice(adults)
    country.ruler = ruler.id
    country.last_election = sim.year
    action = form.get("heir", form["verb"]) if heirs else form["verb"]
    sim.record(f"{sim.person_reference(ruler)} {action} in {country.name}.")


def maintain_rulers(sim):
    groups = {}
    for person in sim.people.values():
        if person.age >= 18:
            groups.setdefault(person.country, []).append(person)
    for country in sim.countries.values():
        if country.ended is not None:
            country.ruler = None
            continue
        current = sim.people.get(country.ruler)
        if current and current.country == country.id:
            continue
        adults = groups.get(country.id, [])
        if adults:
            choose_ruler(sim, country, adults)
        else:
            country.ruler = None


def unlock(sim, country, technology, actor, borrowed=False):
    if technology in country.technologies or not tech_met(technology, country.technologies):
        return False
    country.technologies.add(technology)
    insight_of(country).pop(technology, None)
    country.boosted = boosted_of(country) - {technology}
    before_era = era_index(country.technologies - {technology})
    if technology in FOOD_TECHS:
        country.capacity = max(1, int(country.capacity * 1.05))
        country.food = clamp(country.food + 8)
    if technology in INDUSTRY_TECHS:
        country.prosperity = clamp(country.prosperity + 4)
    if technology in KNOWLEDGE_TECHS:
        country.research += 1
    if technology in CARE_TECHS or technology == "quarantine":
        country.stability = clamp(country.stability + 3)
    verb = "introduced" if borrowed else "developed"
    actor.fame = min(100, getattr(actor, "fame", 0) + (5 if borrowed else 12))
    actor.job = "scholar"
    sim.record(f"{sim.person_reference(actor)} {verb} {technology} in {country.name}, "
               f"bringing {TECHNOLOGIES[technology][2]}.", "discovery")
    after_era = era_index(country.technologies)
    if after_era > before_era:
        sim.record(f"{country.name} entered the {ERAS[after_era]}.", "discovery")
    return True


def develop_societies(sim):
    maintain_rulers(sim)
    groups = {}
    for person in sim.people.values():
        groups.setdefault(person.country, []).append(person)
    busy = {cid for pair in sim.wars for cid in pair}
    for cid, residents in groups.items():
        country = sim.countries[cid]
        adults = [p for p in residents if p.age >= 18]
        if not adults:
            continue
        # Conditions recover gradually; wars and crises put continuous pressure on them.
        food_target = 60 + min(22, technology_modifiers(country)["food"])
        food_target -= 25 * bool(country.conditions & {"Famine", "Drought"})
        food_target -= 10 * (cid in busy)
        production = technology_modifiers(country)["production"]
        food_target += min(14, (production - 1) * 10)
        from geography import profile, contacts
        from economy import food_effect
        from systems import state as system_state
        food_target += system_state(sim, cid)["food_delta"]  # granaries, mills, harbors
        food_target += food_effect(sim, cid)  # harvested and stored food, or the lack of it
        food_target += (profile(sim, cid)["fertility"] - 1.0) * 25  # fertile plains feed more than deserts and peaks
        country.food = clamp(country.food + (food_target - country.food) * .15)
        country.prosperity = clamp(country.prosperity + (.5 * production if cid not in busy else -2))
        country.stability = clamp(country.stability + (.5 if country.food >= 40 else -2)
                                  - (2 if cid in busy else 0))
        from governments import info as government_info
        term = government_info(country.government)["term"]
        if term and sim.year - country.last_election >= term:
            choose_ruler(sim, country, adults)

        advance_research(sim, country, adults, groups, busy)
        advance_innovations(sim, country, adults)

        # Most years have no additional political/economic event.
        if sim.rng.random() >= .70:
            continue
        # The catalog supplies most events; retain occasional government changes
        # and international exchanges with their specialized mechanics below.
        if sim.rng.random() < .85:
            run_catalog_event(sim, country, adults, groups, busy)
            continue
        choices = ["harvest", "festival", "corruption", "reform", "tax", "poem"]
        if country.food < 45:
            choices += ["relief", "relief"]
        if country.stability < 40:
            choices += ["protest", "protest"]
        if country.stability < 25 and country.government in ("monarchy", "empire", "tyranny", "tribal"):
            choices += ["revolution"]
        if country.prosperity >= 45 and "writing" in country.technologies:
            choices += ["school"]
        land, sea = contacts(sim)
        reachable = set(land.get(cid, set()))
        if "sailing" in country.technologies:
            reachable.update(sea.get(cid, set()))
        partners = [other for other in groups if other != cid and other in reachable and other not in busy and cid not in busy]
        if partners:
            choices += ["trade", "trade"]
        event = sim.rng.choice(choices)
        actor = sim.rng.choice(adults)
        who = sim.person_reference(actor)
        place = country.name
        if event == "harvest":
            country.food += 12
            message = f"Farmers in {place} gathered an exceptional harvest; food reserves grew."
        elif event == "festival":
            country.prosperity -= 2
            country.stability += 6
            message = f"A public festival in {place} eased local tensions."
        elif event == "corruption":
            country.prosperity -= 6
            country.stability -= 8
            message = f"Officials in {place} were caught diverting public funds; trust in government fell."
        elif event == "reform":
            country.stability += 7
            country.prosperity -= 3
            message = f"{place} established public hearings for legal disputes."
        elif event == "tax":
            country.prosperity -= 5
            country.stability -= 6
            country.research += 2
            message = f"{place} imposed new taxes to fund public works, provoking resentment."
        elif event == "poem":
            country.stability += 3
            message = f"{who} composed an epic that became popular across {place}."
        elif event == "relief":
            country.food += 15
            country.prosperity -= 8
            country.stability += 4
            message = f"{place} distributed emergency food supplies at public expense."
        elif event == "protest":
            country.stability -= 5
            country.prosperity -= 3
            message = f"Protesters in {place} disrupted markets and demanded political reform."
        elif event == "revolution":
            from governments import info as government_info
            old_form = government_info(country.government)["label"].lower()
            country.government = sim.rng.choice(["council", "republic", "oligarchy", "junta"])
            country.government_since = sim.year
            country.stability = 45
            country.prosperity -= 10
            message = f"An uprising in {place} replaced the {old_form} with a {government_info(country.government)['label'].lower()}."
            sim.record(message)
            choose_ruler(sim, country, adults)
            message = None
        elif event == "school":
            country.prosperity -= 5
            country.research += 5
            message = f"{who} opened a school in {place}, helping preserve and share knowledge."
        else:
            partner = sim.countries[sim.rng.choice(partners)]
            bonus = 7 if "roads" in country.technologies else 4
            country.prosperity += bonus
            partner.prosperity = clamp(partner.prosperity + bonus)
            message = f"Merchants exchanged goods between {place} and {partner.name}; both economies benefited."
            top = era_index(country.technologies) + MAX_LEAD
            ideas = [tech for tech in TECHNOLOGIES if tech in partner.technologies
                     and tech not in country.technologies and tech_met(tech, country.technologies)
                     and technology.era_of_tech(tech) <= top]
            if ideas and sim.rng.random() < .35:
                unlock(sim, country, sim.rng.choice(ideas), actor, borrowed=True)
            for giver, taker in ((partner, country), (country, partner)):
                got = pass_on_knowledge(sim, giver, taker, .4)
                if got:
                    sim.record(f"Merchants carried word of {got[0]} from {giver.name} to {taker.name}.", "discovery")
        if message:
            sim.record(message, "creative" if event in {"poem", "festival"} else
                       "discovery" if event == "school" else "political")
        country.food = clamp(country.food)
        country.prosperity = clamp(country.prosperity)
        country.stability = clamp(country.stability)


def social_rates(country):
    birth = .85 + country.food / 400 + country.prosperity / 1000
    death = 1 + max(0, 40 - country.food) / 80 + max(0, 30 - country.stability) / 100
    death *= .92 ** len(country.technologies & CARE_TECHS)
    return birth, death


def build_event_catalog(domains):
    catalog = []
    for domain_id, domain in domains.items():
        for situation_index, situation in enumerate(domain["situations"]):
            for outcome_index, outcome in enumerate(domain["outcomes"]):
                catalog.append({
                    "id": f"{domain_id}.{situation_index + 1}.{outcome_index + 1}",
                    "situation_id": f"{domain_id}.{situation_index + 1}",
                    "domain": domain_id,
                    "category": domain["category"],
                    "requires": frozenset(domain["requires"]),
                    "gate": domain["gate"],
                    "text": situation + " " + outcome["text"],
                    "effects": dict(outcome["effects"]),
                    "weight": outcome["weight"],
                })
    return tuple(catalog)


def eligible_catalog_events(sim, country, residents, groups, busy):
    partners = [cid for cid in groups if cid != country.id and cid not in busy]
    gates = {
        "any": True,
        "peace": country.id not in busy,
        "shortage": country.food < 45,
        "unrest": country.stability < 40,
        "war": country.id in busy,
        "sickness": bool(country.sickness or any(p.infection for p in residents)),
        "disaster": (country.last_disaster_year is not None
                     and 0 <= sim.year - country.last_disaster_year <= 5),
        "partner": bool(partners) and country.id not in busy,
    }
    return [event for event in EVENT_CATALOG
            if event["requires"] <= country.technologies and gates[event["gate"]]
            and sim.year - country.last_catalog_events.get(event["situation_id"], -100) >= 1]


def apply_catalog_event(sim, country, actor, event):
    for stat, amount in event["effects"].items():
        current = getattr(country, stat)
        setattr(country, stat, max(0, current + amount) if stat == "research"
                else clamp(current + amount))
    country.last_catalog_events[event["situation_id"]] = sim.year
    # str.format preserves the person reference inserted by this substitution;
    # it is resolved when the yearly report is displayed.
    message = event["text"].format(actor=sim.person_reference(actor), country=country.name)
    if "{actor}" in event["text"]:
        actor.fame = min(100, getattr(actor, "fame", 0) + 2)
    sim.record(message, event["category"])


def run_catalog_event(sim, country, adults, groups, busy):
    eligible = eligible_catalog_events(sim, country, groups[country.id], groups, busy)
    eligible = [event for event in eligible if any(
        (amount > 0 and (stat == "research" or getattr(country, stat) < 100))
        or (amount < 0 and getattr(country, stat) > 0)
        for stat, amount in event["effects"].items())]
    if not eligible:
        return None
    by_domain = {}
    for event in eligible:
        by_domain.setdefault(event["domain"], []).append(event)
    # Choose a domain first so five outcomes do not make a situation five times
    # as likely; outcome weights only decide how that situation turns out.
    domain = sim.rng.choice(list(by_domain))
    by_situation = {}
    for event in by_domain[domain]:
        by_situation.setdefault(event["situation_id"], []).append(event)
    outcomes = sim.rng.choice(list(by_situation.values()))
    event = sim.rng.choices(outcomes, weights=[item["weight"] for item in outcomes], k=1)[0]
    notable = [p for p in adults if getattr(p, "public_role", "") or getattr(p, "fame", 0) >= 40]
    actor = sim.rng.choice(notable if notable and sim.rng.random() < .75 else adults)
    apply_catalog_event(sim, country, actor, event)
    return event["id"]


"""Preindustrial event situations and outcomes: five domains, 250 combinations."""

EVENT_DOMAINS_A = {
    "agriculture": {
        "category": "political",
        "requires": (),
        "gate": "peace",
        "situations": (
            "Farmers in {country} tested planting dates agreed upon at a village council.",
            "{actor} organized a trial of communal grain reserves in {country}.",
            "Villages in {country} attempted to restore neglected field boundaries.",
            "Growers in {country} experimented with selecting seed from their strongest plants.",
            "{actor} sponsored a trial of shared ox teams for small farms in {country}.",
            "Farmers in {country} tried planting legumes on exhausted plots.",
            "Households in {country} attempted to coordinate harvest work across neighboring farms.",
            "{actor} backed an experiment in protecting stored grain from damp in {country}.",
            "Shepherds and farmers in {country} negotiated a trial schedule for grazing fallow fields.",
            "Villagers in {country} attempted to reclaim abandoned gardens for food production.",
        ),
        "outcomes": (
            {"text": "The trial produced a reliable surplus, and neighboring villages adopted the practice.", "effects": {"food": 9.0, "prosperity": 2.0}, "weight": 4},
            {"text": "The trial yielded a modest improvement without demanding much additional labor.", "effects": {"food": 4.0}, "weight": 5},
            {"text": "Food supplies improved, but disputes over the extra work weakened local cooperation.", "effects": {"food": 5.0, "stability": -4.0}, "weight": 3},
            {"text": "The effort consumed scarce resources and brought no useful gain.", "effects": {"prosperity": -4.0}, "weight": 2},
            {"text": "Poor coordination disrupted ordinary work and left food reserves smaller than expected.", "effects": {"food": -6.0, "stability": -2.0}, "weight": 2},
        ),
    },
    "commerce": {
        "category": "political",
        "requires": (),
        "gate": "peace",
        "situations": (
            "Merchants in {country} proposed a common set of market weights.",
            "{actor} backed a trial of regular market days in {country}.",
            "Traders in {country} attempted to pool the cost of guards for their goods.",
            "Market elders in {country} tried a public process for settling payment disputes.",
            "{actor} proposed clearer rules for stall fees in {country}.",
            "Craft sellers in {country} attempted to establish shared standards of workmanship.",
            "Merchants in {country} organized a trial system of witnesses for large exchanges.",
            "Village traders in {country} attempted to combine small loads for longer journeys.",
            "{actor} encouraged a trial exchange fair between inland communities in {country}.",
            "Traders in {country} proposed shared responsibility for damaged goods in transit.",
        ),
        "outcomes": (
            {"text": "The arrangement earned trust and drew substantial new trade.", "effects": {"prosperity": 8.0, "stability": 2.0}, "weight": 4},
            {"text": "A limited trial reduced everyday trading costs.", "effects": {"prosperity": 4.0}, "weight": 5},
            {"text": "Wealthy merchants gained most of the benefits, provoking resentment among small sellers.", "effects": {"prosperity": 5.0, "stability": -4.0}, "weight": 3},
            {"text": "Arguments over responsibility stalled the effort after participants had spent their savings.", "effects": {"prosperity": -4.0, "stability": -2.0}, "weight": 2},
            {"text": "Dishonest intermediaries exploited the arrangement before it was abandoned.", "effects": {"prosperity": -6.0, "stability": -4.0}, "weight": 2},
        ),
    },
    "civic_infrastructure": {
        "category": "political",
        "requires": (),
        "gate": "peace",
        "situations": (
            "{actor} sought labor for repairing public wells in {country}.",
            "Residents of {country} proposed clearing blocked paths between settlements.",
            "Town elders in {country} attempted to organize repairs to communal meeting shelters.",
            "{actor} backed a plan to shore up an eroding river landing in {country}.",
            "Villagers in {country} sought to replace a dangerous footbridge.",
            "Households in {country} proposed improving drainage around crowded dwellings.",
            "{actor} requested materials for a communal storehouse in {country}.",
            "Settlements in {country} attempted to establish sheltered resting places along busy paths.",
            "Residents of {country} organized an effort to repair livestock watering troughs.",
            "Town elders in {country} proposed rebuilding a damaged marketplace shelter.",
        ),
        "outcomes": (
            {"text": "Skilled supervision brought the work to completion and made daily life easier.", "effects": {"prosperity": 6.0, "stability": 4.0}, "weight": 4},
            {"text": "Volunteers completed a smaller version that still met the most urgent needs.", "effects": {"stability": 4.0}, "weight": 5},
            {"text": "The work succeeded, but its demands drained household savings.", "effects": {"stability": 5.0, "prosperity": -4.0}, "weight": 3},
            {"text": "A shortage of skilled workers left the project unfinished and its materials wasted.", "effects": {"prosperity": -5.0}, "weight": 2},
            {"text": "Coerced labor and missing supplies turned the project into a source of public anger.", "effects": {"stability": -7.0, "prosperity": -3.0}, "weight": 2},
        ),
    },
    "scholarship": {
        "category": "discovery",
        "requires": ("writing",),
        "gate": "any",
        "situations": (
            "Scholars in {country} compared records of seasonal flooding.",
            "{actor} sponsored an inquiry into more consistent methods of measuring land in {country}.",
            "Teachers in {country} tested a new sequence for teaching arithmetic.",
            "Observers in {country} attempted to reconcile conflicting records of the stars.",
            "{actor} supported the comparison of medicinal plant descriptions in {country}.",
            "Scribes in {country} investigated errors that accumulated when copying accounts.",
            "Scholars in {country} attempted to compare regional systems of weights and lengths.",
            "{actor} commissioned a study of records describing past harvest failures in {country}.",
            "Teachers in {country} tried a new method of checking apprentices' calculations.",
            "Scholars in {country} gathered craftworkers' observations for a practical handbook.",
        ),
        "outcomes": (
            {"text": "Careful comparisons revealed a useful principle that other investigators could reproduce.", "effects": {"research": 9.0}, "weight": 3},
            {"text": "The work corrected several persistent mistakes and improved instruction.", "effects": {"research": 4.0}, "weight": 5},
            {"text": "A promising finding emerged, although sustaining the inquiry strained its sponsors' resources.", "effects": {"research": 6.0, "prosperity": -3.0}, "weight": 3},
            {"text": "Inconsistent evidence prevented a firm conclusion, but investigators documented their methods.", "effects": {"research": 1.5, "prosperity": -1.0}, "weight": 3},
            {"text": "An influential patron insisted on an unsupported conclusion, discouraging further inquiry.", "effects": {"research": -3.0, "stability": -2.0}, "weight": 1},
        ),
    },
    "arts": {
        "category": "creative",
        "requires": (),
        "gate": "any",
        "situations": (
            "{actor} sponsored the composition of an epic about the ancestors of {country}.",
            "Performers in {country} rehearsed a new cycle of harvest songs.",
            "Craftworkers in {country} attempted an elaborate ceremonial carving.",
            "Storytellers in {country} prepared a public retelling of a disputed founding legend.",
            "{actor} commissioned a decorated vessel for public ceremonies in {country}.",
            "Dancers in {country} devised a performance honoring departed relatives.",
            "Musicians in {country} experimented with a new arrangement for familiar songs.",
            "Artisans in {country} planned a woven panel depicting everyday village life.",
            "{actor} supported a dramatic performance about justice and obligation in {country}.",
            "Poets in {country} attempted a shared collection of verses about travel and homecoming.",
        ),
        "outcomes": (
            {"text": "The finished work found a wide audience and became a source of shared pride.", "effects": {"stability": 7.0, "prosperity": 2.0}, "weight": 4},
            {"text": "The work pleased a modest audience and encouraged younger artists.", "effects": {"stability": 3.0, "research": 1.0}, "weight": 5},
            {"text": "The work won admiration, but rival patrons argued over whose contribution deserved recognition.", "effects": {"prosperity": 3.0, "stability": -2.0}, "weight": 3},
            {"text": "Costs mounted, and the effort ended before the work could be presented.", "effects": {"prosperity": -3.0}, "weight": 2},
            {"text": "The work offended powerful families, whose demands for punishment divided the community.", "effects": {"stability": -6.0}, "weight": 2},
        ),
    },
}



"""Preindustrial civic event material: five domains with fifty variants each."""

EVENT_DOMAINS_B = {
    "political_reform": {
        "category": "political",
        "requires": (),
        "gate": "any",
        "situations": (
            "{actor} convened a council in {country} to discuss fairer harvest levies.",
            "{actor} heard petitions in {country} about abuses by local officials.",
            "{actor} proposed clearer rules for communal grazing in {country}.",
            "{actor} brought village delegates together in {country} to review public obligations.",
            "{actor} opened negotiations in {country} over service owed to the ruling household.",
            "{actor} called for an inquiry into disputed market tolls in {country}.",
            "{actor} assembled elders in {country} to discuss how grievances should be heard.",
            "{actor} asked the settlements of {country} to reconsider exemptions from communal labor.",
            "{actor} sponsored a public debate in {country} about the duties of tax collectors.",
            "{actor} arranged talks in {country} on settling boundary disputes without private feuds.",
        ),
        "outcomes": (
            {"text": "A modest compromise won broad support and made local administration more predictable.", "effects": {"stability": 5, "prosperity": 2}, "weight": 4},
            {"text": "The council agreed to a limited trial, spending public resources to ease longstanding tensions.", "effects": {"stability": 3, "prosperity": -2}, "weight": 3},
            {"text": "Influential households blocked agreement, and disappointed petitioners returned home resentful.", "effects": {"stability": -4}, "weight": 2},
            {"text": "A hurried settlement favored the wealthiest households, improving collections but deepening resentment.", "effects": {"prosperity": 3, "stability": -3}, "weight": 2},
            {"text": "Careful testimony exposed inconsistencies and helped officials understand local needs.", "effects": {"research": 2, "stability": 2}, "weight": 3},
        ),
    },
    "diplomacy": {
        "category": "political",
        "requires": (),
        "gate": "partner",
        "situations": (
            "{actor} welcomed foreign envoys to {country} for discussions about frontier customs.",
            "{actor} sent representatives from {country} to discuss the treatment of traveling merchants.",
            "{actor} hosted talks in {country} about access to seasonal markets.",
            "{actor} sought foreign advice in {country} on resolving disputed tolls.",
            "{actor} arranged a ceremonial meeting in {country} to discuss borderland grievances.",
            "{actor} invited neighboring officials to {country} to compare trading practices.",
            "{actor} prepared a diplomatic delegation in {country} to seek clearer rules for caravans.",
            "{actor} received visitors in {country} seeking a shared understanding of river passage.",
            "{actor} organized discussions in {country} about protecting messengers on public roads.",
            "{actor} offered hospitality in {country} to delegates discussing disputed market privileges.",
        ),
        "outcomes": (
            {"text": "The exchange clarified expectations and encouraged merchants to invest with greater confidence.", "effects": {"prosperity": 4, "stability": 2}, "weight": 4},
            {"text": "The visitors shared useful practical knowledge, although gifts and hospitality proved expensive.", "effects": {"research": 4, "prosperity": -2}, "weight": 3},
            {"text": "The talks stalled over precedence and ceremonial honors, wasting resources and embarrassing the hosts.", "effects": {"prosperity": -3, "stability": -2}, "weight": 2},
            {"text": "Only a narrow understanding emerged, but the respectful exchange reassured local communities.", "effects": {"stability": 3}, "weight": 4},
            {"text": "Rumors of secret concessions spread faster than the delegates could explain their work.", "effects": {"stability": -4, "prosperity": -1}, "weight": 2},
        ),
    },
    "wartime_logistics": {
        "category": "war",
        "requires": (),
        "gate": "war",
        "situations": (
            "{actor} gathered quartermasters in {country} to review the movement of military supplies.",
            "{actor} asked village elders in {country} to coordinate deliveries to the army.",
            "{actor} inspected the wartime storehouses of {country} and proposed improvements.",
            "{actor} convened wagon owners in {country} to discuss military transport.",
            "{actor} reviewed demands for pack animals across {country}.",
            "{actor} organized discussions in {country} about supplying distant garrisons.",
            "{actor} sought ways to distribute military requisitions more evenly in {country}.",
            "{actor} assembled camp suppliers in {country} to reconsider their delivery schedules.",
            "{actor} called a meeting in {country} about protecting provisions from spoilage during transport.",
            "{actor} asked officials in {country} to examine the burden of feeding troops through winter.",
        ),
        "outcomes": (
            {"text": "Better coordination reduced waste and left more provisions available to local households.", "effects": {"food": 5, "stability": 2}, "weight": 4},
            {"text": "The new arrangements demanded costly equipment but eased confusion and public complaints.", "effects": {"prosperity": -3, "stability": 3}, "weight": 3},
            {"text": "Conflicting orders caused deliveries to spoil and increased pressure on civilian reserves.", "effects": {"food": -5, "stability": -3}, "weight": 2},
            {"text": "Experienced suppliers developed useful methods, though the immediate work strained local markets.", "effects": {"research": 3, "prosperity": -2}, "weight": 3},
            {"text": "Well-connected suppliers secured favorable terms while ordinary households carried the heavier burden.", "effects": {"prosperity": 2, "food": -2, "stability": -4}, "weight": 2},
        ),
    },
    "public_health": {
        "category": "sickness",
        "requires": (),
        "gate": "sickness",
        "situations": (
            "{actor} brought healers together in {country} to compare their observations of the outbreak.",
            "{actor} organized discussions in {country} about supporting households unable to work.",
            "{actor} asked community elders in {country} to review arrangements for nursing the sick.",
            "{actor} convened attendants in {country} to discuss the supply of bedding and clean water.",
            "{actor} sought proposals in {country} for keeping essential markets supplied during the outbreak.",
            "{actor} invited experienced caregivers in {country} to share practical advice.",
            "{actor} arranged a council in {country} about the rising cost of household care.",
            "{actor} appealed to the storekeepers of {country} to consider relief for afflicted families.",
            "{actor} asked officials in {country} to investigate rumors surrounding the sickness.",
            "{actor} gathered local leaders in {country} to discuss shortages among exhausted caregivers.",
        ),
        "outcomes": (
            {"text": "Shared observations improved practical knowledge and reassured worried households.", "effects": {"research": 4, "stability": 2}, "weight": 4},
            {"text": "A relief effort drew on communal stores and eased public distress.", "effects": {"food": -3, "stability": 4}, "weight": 4},
            {"text": "Competing explanations turned into accusations, unsettling the markets and deepening fear.", "effects": {"stability": -5, "prosperity": -2}, "weight": 2},
            {"text": "Supplies were purchased at high prices, supporting household care while straining public resources.", "effects": {"prosperity": -4, "stability": 2}, "weight": 3},
            {"text": "The discussions exposed gaps in local knowledge, prompting careful observation at considerable expense.", "effects": {"research": 3, "prosperity": -2}, "weight": 3},
        ),
    },
    "disaster_recovery": {
        "category": "disaster",
        "requires": (),
        "gate": "disaster",
        "situations": (
            "{actor} gathered builders in {country} to assess damage left by the disaster.",
            "{actor} convened a relief council in {country} to consider the needs of displaced households.",
            "{actor} asked settlements across {country} to discuss sharing reconstruction labor.",
            "{actor} brought storekeepers together in {country} to review emergency supplies.",
            "{actor} organized discussions in {country} about reopening damaged market spaces.",
            "{actor} sought advice in {country} on restoring essential paths and crossings.",
            "{actor} assembled craftspeople in {country} to plan repairs after the disaster.",
            "{actor} called on local elders in {country} to settle competing requests for rebuilding materials.",
            "{actor} arranged a survey in {country} of the work needed before normal trade could resume.",
            "{actor} asked households in {country} to coordinate temporary shelter and repair work.",
        ),
        "outcomes": (
            {"text": "Cooperation reduced waste and helped ordinary commerce resume more steadily.", "effects": {"prosperity": 4, "stability": 3}, "weight": 4},
            {"text": "Urgent work consumed food reserves but restored confidence in the community's ability to recover.", "effects": {"food": -4, "stability": 4}, "weight": 3},
            {"text": "Disputes over priority delayed useful work and left families angry at local officials.", "effects": {"prosperity": -3, "stability": -4}, "weight": 2},
            {"text": "Craftspeople learned from the damage and tested sturdier methods at substantial cost.", "effects": {"research": 4, "prosperity": -3}, "weight": 3},
            {"text": "Materials proved scarcer than expected, and emergency purchases strained already limited reserves.", "effects": {"prosperity": -4, "food": -2}, "weight": 2},
        ),
    },
}


# Additional fictional civic patterns: 20 policy subjects x 10 community contexts
# x 5 consequential outcomes. These are composed variations, not 1,000 news stories.
COMMUNITY_CONTEXTS = (
    "river villages", "hill villages", "market towns", "farming communities",
    "craft districts", "frontier settlements", "crowded neighborhoods",
    "outlying hamlets", "regional centers", "the capital's households",
)
POLICY_SUBJECTS = (
    ("housing", "repairing unsafe homes", "prosperity"),
    ("workplace_safety", "reducing injuries at work", "stability"),
    ("apprenticeships", "funding apprenticeships", "research"),
    ("fire_safety", "organizing fire watches", "stability"),
    ("food_prices", "publishing fair food prices", "food"),
    ("land_rights", "mediating land claims", "stability"),
    ("childcare", "supporting shared child care", "prosperity"),
    ("eldercare", "supporting elderly households", "stability"),
    ("animal_care", "improving livestock care", "food"),
    ("forestry", "managing timber cutting", "prosperity"),
    ("fisheries", "protecting fishing grounds", "food"),
    ("craft_fairs", "holding craft exhibitions", "prosperity"),
    ("oral_history", "preserving local oral histories", "research"),
    ("music_teaching", "training young musicians", "stability"),
    ("public_games", "organizing public games", "stability"),
    ("debt_relief", "mediating household debts", "prosperity"),
    ("water_rights", "sharing access to water", "food"),
    ("refugee_aid", "helping displaced families", "stability"),
    ("surveying", "mapping paths and property boundaries", "research"),
    ("market_fraud", "investigating dishonest market practices", "prosperity"),
)
EVENT_DOMAINS_C = {}
for domain, subject, stat in POLICY_SUBJECTS:
    trial_effects = {stat: 3}
    trial_effects["prosperity"] = trial_effects.get("prosperity", 0) - 1
    EVENT_DOMAINS_C[domain] = {
        "category": "creative" if domain in ("craft_fairs", "oral_history", "music_teaching", "public_games") else "political",
        "requires": (), "gate": "any",
        "situations": tuple("{actor} led a public initiative for " + subject + " among "
                            + context + " in {country}." for context in COMMUNITY_CONTEXTS),
        "outcomes": (
            {"text": "Broad participation made the effort successful and brought lasting local benefits.", "effects": {stat: 5}, "weight": 4},
            {"text": "A small trial succeeded, although its costs strained local savings.", "effects": trial_effects, "weight": 4},
            {"text": "Disagreements stalled the work and reduced trust in its organizers.", "effects": {"stability": -3}, "weight": 2},
            {"text": "Volunteers documented useful lessons even though the original effort failed.", "effects": {"research": 2, "prosperity": -2}, "weight": 3},
            {"text": "An audit uncovered favoritism, and angry residents demanded new leadership.", "effects": {"prosperity": -2, "stability": -4}, "weight": 2},
        ),
    }

EVENT_CATALOG = build_event_catalog({**EVENT_DOMAINS_A, **EVENT_DOMAINS_B, **EVENT_DOMAINS_C})



def ensure_year_events(sim, start_index, minimum=10):
    """Fill quiet inhabited years with distinct, consequential local events."""
    groups = {}
    for person in sim.people.values():
        groups.setdefault(person.country, []).append(person)
    if not groups:
        return
    busy = {cid for pair in sim.wars for cid in pair}
    categories = {"discovery", "political", "creative", "war", "sickness", "disaster"}
    count = sum(c in categories for c in sim.history_categories[start_index:])
    countries = list(groups)
    sim.rng.shuffle(countries)
    # Passive household/environment developments also work for orphan communities:
    # no infant is assigned an adult profession or political office.
    household_events = [
        ("Wild fruit ripened near homes", "food", 2, "political"),
        ("Stored grain spoiled in damp shelters", "food", -2, "political"),
        ("A nearby spring ran clearer after rainfall", "food", 1, "political"),
        ("Cold nights damaged household supplies", "prosperity", -1, "political"),
        ("Early shoots replenished nearby edible plants", "food", 1, "political"),
        ("Insects damaged stored bedding", "prosperity", -1, "political"),
        ("Mild weather reduced shelter needs", "prosperity", 1, "political"),
        ("Animal tracks revealed a nearby water source", "research", .2, "discovery"),
        ("Fallen branches damaged an empty shelter", "prosperity", -1, "political"),
        ("New grass improved local grazing grounds", "food", 1, "political"),
        ("A dry spell preserved household stores", "food", 1, "political"),
        ("Wind scattered exposed supplies", "food", -1, "political"),
        ("Rain filled household water jars", "food", 1, "political"),
        ("Frost cracked exposed storage vessels", "prosperity", -1, "political"),
        ("A quiet season spared household reserves", "food", 1, "political"),
        ("Mice consumed grain left in open baskets", "food", -1, "political"),
        ("Reeds regrew around nearby shelters", "prosperity", 1, "political"),
        ("Rot weakened unused fences", "prosperity", -1, "political"),
        ("Fallen fruit supplemented local food supplies", "food", 1, "political"),
        ("Leaks soaked stored firewood", "prosperity", -1, "political"),
        ("Dry weather reduced losses from damp", "prosperity", 1, "political"),
        ("Straying animals consumed garden plants", "food", -1, "political"),
        ("Sheltered gardens retained moisture", "food", 1, "political"),
        ("Loose roof coverings deteriorated", "prosperity", -1, "political"),
    ]
    used = {cid: set() for cid in countries}
    while count < minimum:
        made_progress = False
        for cid in countries:
            country = sim.countries[cid]
            adults = [p for p in groups[cid] if p.age >= 18]
            if adults and run_catalog_event(sim, country, adults, groups, busy):
                count += 1
                made_progress = True
            else:
                candidates = [i for i in range(len(household_events)) if i not in used[cid]]
                if not candidates:
                    continue
                index = sim.rng.choice(candidates)
                used[cid].add(index)
                text, stat, amount, category = household_events[index]
                before = getattr(country, stat)
                after = max(0, before + amount) if stat == "research" else clamp(before + amount)
                # Saturated stats must not produce pretend consequences.
                if before == after:
                    continue
                setattr(country, stat, after)
                sim.record(f"{text} in {country.name} ({stat} {after - before:+.1f}).", category)
                count += 1
                made_progress = True
            if count >= minimum:
                break
        if not made_progress:
            # Try other unused household developments; end only when all exhausted.
            if all(len(used[cid]) == len(household_events) for cid in countries):
                break
