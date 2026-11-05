"""Annual campaigns, limited recruitment, supply, conquest, and truces."""

from society import technology_modifiers, boosted_of, end_pact
from technology import LETHALITY, UNIT_NAMES


def outclassed(own, foe):
    """Casualty multiplier from the gap in weapons: spearmen against muskets die faster, and the reverse."""
    return max(.6, min(1.6, 1 + .15 * (foe - own)))


def siege_odds(attacker_mods, defender_mods):
    """How much easier or harder walls are to take: siege engines and cannon against castles and bastions."""
    return max(.4, min(2.0, (1 + attacker_mods["siege"]) * defender_mods["defense"]))


def _transfer(sim, victor, defeated, settlement=None):
    for person in sim.people.values():
        if person.country == defeated and (settlement is None or person.settlement == settlement.id):
            person.country = victor
    for place in sim.settlements.values():
        if place.country == defeated and (settlement is None or place.id == settlement.id):
            place.country = victor
    losing = sim.countries[defeated]
    if sim.countries[victor].capital is None:
        sim.countries[victor].capital = next((s.id for s in sim.settlements.values()
                                             if s.country == victor and s.abandoned is None), None)
    if settlement is None:
        losing.capital = None
        losing.ended = sim.year
        sim.countries[victor].capacity += losing.capacity
        winning = sim.countries[victor]
        # The conquerors do not simply own the loser's discoveries; they research each of them twice as fast.
        studied = 0
        for name in sorted(losing.technologies):
            if name not in winning.technologies and name not in boosted_of(winning):
                boosted_of(winning).add(name)
                studied += 1
        if studied:
            sim.record(f"Scholars of {winning.name} began studying {studied} discoveries of {losing.name}; "
                       "researching them will go twice as fast.", "discovery")
        if not hasattr(winning, "innovations"):
            winning.innovations = {}
        for key in getattr(losing, "innovations", {}):
            winning.innovations.setdefault(key, sim.year)
        winning.treasury = getattr(winning, "treasury", 0) + getattr(losing, "treasury", 0)
        losing.treasury = 0
        losing.absorbed_by = victor
        losing.offices = {}
        losing.ruler = None
    elif losing.capital == settlement.id:
        losing.capital = next((s.id for s in sim.settlements.values()
                               if s.country == defeated and s.abandoned is None), None)


def _objective(sim, attacker, target):
    """The enemy settlement closest to the attacker's own territory."""
    from geography import distance_to_country
    best = None
    best_distance = 1000.0
    for place in sorted(sim.settlements.values(), key=lambda s: s.id):
        if place.country == target and place.abandoned is None:
            distance = distance_to_country(sim, place, attacker)
            if distance < best_distance:
                best_distance = distance
                best = place.id
    return best


def resolve_wars(sim):
    if not hasattr(sim, "war_details"):
        sim.war_details = {}
    if not hasattr(sim, "truces"):
        sim.truces = {}
    # Wounds recover after one to three years; casualties remain individual people.
    for person in sim.people.values():
        if getattr(person, "wounded_until", 0) <= sim.year:
            person.wounded_until = 0
    residents = {}
    for person in sim.people.values():
        residents.setdefault(person.country, []).append(person)
    busy = {cid for pair in sim.wars for cid in pair}
    available = [cid for cid, people in residents.items() if cid not in busy
                 and sim.countries[cid].ended is None
                 and sum(18 <= p.age <= 60 for p in people) >= 5]
    sim.rng.shuffle(available)
    # Only countries that share a land border can fight; sea and distance keep the rest at peace.
    from geography import contacts, defense
    from systems import state, war_friction
    from development import damage_buildings, besieging
    bordering, _sea = contacts(sim)
    paired = set()
    for cid in available:
        if cid in paired:
            continue
        options = [o for o in available if o != cid and o not in paired and o in bordering.get(cid, set())]
        if not options:
            continue
        other = sim.rng.choice(options)
        paired.add(cid)
        paired.add(other)
        pair = tuple(sorted([cid, other]))
        if sim.truces.get(pair, -1) > sim.year:
            continue
        friction, envy = war_friction(sim, pair[0], pair[1])
        if sim.rng.random() < sim.war_chance * friction:
            sim.wars[pair] = sim.year
            end_pact(sim, sim.countries[pair[0]], sim.countries[pair[1]])
            causes = ["a disputed frontier", "raids on merchants", "rival claims to farmland", "a broken tribute agreement"]
            if envy:
                causes += ["control of the ore hills", "control of the ore hills"]
            cause = sim.rng.choice(causes)
            sim.record(f"{sim.countries[pair[0]].name} declared war on "
                       f"{sim.countries[pair[1]].name} over {cause}.", "war")

    deaths = 0
    for pair, started in list(sim.wars.items()):
        a, b = pair
        countries = [sim.countries[a], sim.countries[b]]
        sides = [[p for p in sim.people.values() if p.country == cid] for cid in pair]
        detail = sim.war_details.setdefault(pair, {"exhaustion": [0., 0.], "score": 0.})
        detail.setdefault("captures", [0, 0])
        detail.setdefault("objectives", [_objective(sim, pair[i], pair[1-i]) for i in range(2)])
        if not all(sides) or any(c.ended is not None for c in countries):
            sim.record(f"War between {countries[0].name} and {countries[1].name} ended: "
                       "one country has no residents.", "war")
            del sim.wars[pair]
            sim.war_details.pop(pair, None)
            continue
        armies = []
        supplies = []
        powers = []
        for i, (country, side) in enumerate(zip(countries, sides)):
            adults = [p for p in side if 18 <= p.age <= 55 and p.infection is None
                      and getattr(p, "wounded_until", 0) <= sim.year]
            innovation = technology_modifiers(country)
            st = state(sim, country.id)
            # Leave most working adults at home and never mobilize over 8% of residents.
            levy = min(int(len(adults) * .22), int(len(side) * .08),
                       int(len(side) * .10 * min(1, country.food / 60) * innovation["logistics"]))
            armies.append(sim.rng.sample(adults, levy))
            supply_bonus = 0.0  # logistics techs already raise innovation["logistics"]
            supply = max(.25, min(1.2, country.food / 65 * innovation["logistics"] + supply_bonus + st["supply_bonus"]))
            supplies.append(supply)
            technology = innovation["military"]
            morale = max(.3, .65 + country.stability / 100 - detail["exhaustion"][i] / 150)
            powers.append(levy * supply * technology * morale * defense(sim, country.id) * st["power_mult"] * sim.rng.uniform(.75, 1.25))
            country.food = max(0, country.food - 1 - 45 * levy / max(1, len(side)))
            country.prosperity = max(0, country.prosperity - 2)
            country.stability = max(0, country.stability - 1)
        detail["mobilized"] = [len(army) for army in armies]
        detail["supplies"] = supplies[:]
        mode = sim.rng.choice(["border raids", "field battle", "field battle", "siege", "supply campaign"])
        if not any(armies):
            sim.record(f"{countries[0].name} and {countries[1].name} suspended hostilities: "
                       "neither could recruit a healthy adult force; a four-year truce began.", "war")
            sim.truces[tuple(sorted(pair))] = sim.year + 4
            del sim.wars[pair]
            sim.war_details.pop(pair, None)
            continue
        mods = [technology_modifiers(c) for c in countries]
        if mode == "siege":
            for i in range(2):
                powers[i] *= (1 + (1 - mods[i]["defense"]) * 1.6) * (1 + mods[i]["siege"] * .5)
        intensity = {"border raids": .06, "field battle": .12, "siege": .09, "supply campaign": .025}[mode]
        tiers = [mods[0]["weapon"], mods[1]["weapon"]]
        intensity *= LETHALITY[max(tiers)]  # gunpowder kills more than spears
        losses = []
        wounded = []
        for i, army in enumerate(armies):
            pressure = min(2.5, powers[1-i] / max(1, powers[i]))
            risk = min(.5, intensity * pressure + .035 * (1 - min(1, supplies[i])))
            modifiers = technology_modifiers(countries[i])
            risk *= modifiers["defense"] * modifiers["wound_death"] * state(sim, countries[i].id)["defense_mult"]
            risk *= outclassed(tiers[i], tiers[1 - i])
            killed = []
            injuries = []
            for person in army:
                roll = sim.rng.random()
                if roll < risk:
                    killed.append(person)
                elif roll < min(.8, risk * 3):
                    person.wounded_until = sim.year + sim.rng.randint(1, 3)
                    injuries.append(person)
            wounded.append(len(injuries))
            for person in killed:
                person.died = sim.year
                person.cause_of_death = "war"
                sim.lineages[person.lineage].deaths += 1
                del sim.people[person.id]
            losses.append(len(killed))
            detail["exhaustion"][i] += 5 + len(killed) / max(1, len(army)) * 40 + (1 - min(1, supplies[i])) * 8 + 1.2 * max(tiers)  # modern wars wear a nation out faster
        deaths += sum(losses)
        winner = 0 if powers[0] > powers[1] else 1
        detail["score"] += (1 if winner == 0 else -1) * min(3, max(powers) / max(1, min(powers)))
        sim.record(f"War update (year {sim.year - started + 1}): {mode}; "
                   f"{countries[0].name} lost {losses[0]} of {len(armies[0])} levies, "
                   f"{countries[1].name} lost {losses[1]} of {len(armies[1])}; "
                   f"{countries[winner].name} held the advantage. "
                   f"Wounded {wounded[0]}/{wounded[1]}; supply {supplies[0]:.0%}/{supplies[1]:.0%}; "
                   f"war exhaustion {detail['exhaustion'][0]:.0f}/{detail['exhaustion'][1]:.0f}. "
                   f"Armies: {UNIT_NAMES['weapon'][tiers[0]]} against {UNIT_NAMES['weapon'][tiers[1]]}.", "war")
        log = getattr(sim, "war_log", None)
        if log is None:
            log = []
            sim.war_log = log
        log.append({"year": sim.year, "pair": list(pair), "tiers": tiers, "losses": losses, "levies": [len(a) for a in armies], "winner": winner, "mode": mode})
        while len(log) > 300:
            log.pop(0)
        victor, defeated = pair[winner], pair[1-winner]
        survivor_adults = [sum(p.id in sim.people and getattr(p, "wounded_until", 0) <= sim.year for p in army) for army in armies]
        overwhelming = powers[winner] >= max(1, powers[1-winner]) * 4
        conquered = False
        sustained_advantage = detail["score"] >= 6 if winner == 0 else detail["score"] <= -6
        defeated_reserves = sum(p.id in sim.people and 18 <= p.age <= 60 and not p.infection
                                and getattr(p, "wounded_until", 0) <= sim.year
                                for p in sides[1-winner])
        defeated_places = [s for s in sim.settlements.values()
                           if s.country == defeated and s.abandoned is None]
        # Full annexation requires a sustained campaign against the final territory.
        if (survivor_adults[winner] and len(defeated_places) <= 1
                and sim.year - started >= 2 and sustained_advantage
                and (overwhelming or not defeated_reserves)):
            _transfer(sim, victor, defeated)
            sim.record(f"{sim.countries[victor].name} conquered {sim.countries[defeated].name}; "
                       "survivors joined the victorious country.", "war")
            conquered = True
        elif (mode == "siege" and survivor_adults[winner] and supplies[winner] >= .65
              and (detail["score"] >= 3 if winner == 0 else detail["score"] <= -3)
              and sim.rng.random() < .45 * (1.3 if besieging(sim, pair, winner) else 1.0) * siege_odds(mods[winner], mods[1 - winner])):
            targets = [s for s in sim.settlements.values() if s.country == defeated
                       and any(p.settlement == s.id and p.country == defeated for p in sim.people.values())]
            if len(targets) > 1:
                target = next((s for s in targets if s.id == detail["objectives"][winner]),
                              sim.rng.choice(targets))
                detail["captures"][winner] += 1
                _transfer(sim, victor, defeated, target)
                damage_buildings(sim, target, .35, "The assault")
                sim.record(f"{sim.countries[victor].name} captured {target.name}; "
                           "its surviving residents changed allegiance.", "war")
        peace = (max(detail["captures"]) >= 1 or sim.year - started >= 7 or max(detail["exhaustion"]) >= 80
                 or not any(survivor_adults)
                 or (sim.year > started and sim.rng.random() < .12))
        if conquered or peace:
            if not conquered:
                duration = sim.rng.randint(4, 9)
                sim.truces[tuple(sorted(pair))] = sim.year + duration
                terms = "recognized the new frontier" if any(detail["captures"]) else "accepted the existing borders"
                if not any(detail["captures"]) and abs(detail["score"]) >= 4:
                    beneficiary = 0 if detail["score"] > 0 else 1
                    tribute = min(5, countries[1-beneficiary].prosperity * .08)
                    countries[1-beneficiary].prosperity -= tribute
                    countries[beneficiary].prosperity = min(100, countries[beneficiary].prosperity + tribute)
                    terms += " with limited reparations"
                sim.record(f"{countries[0].name} and {countries[1].name} {terms}, signed peace "
                           f"and a {duration}-year truce.", "war")
            del sim.wars[pair]
            sim.war_details.pop(pair, None)
    return deaths
