"""How a civilization's systems shape one another.

Politics, science, culture, economy, health, war, construction and geography are not
separate meters. Each year every country's state is analysed once; the results (and a
note explaining each effect) are used by research, disease, war, disaster and settlement
code, so a change anywhere ripples through the rest.
"""

from collections import Counter
from geography import contacts, profile, settlement_counts, dist, _inhabited, resources_near
from development import building_counts
import governments
from technology import effects as tech_effects
from economy import of as economy_of


def _clamp(value):
    return max(0.0, min(100.0, value))


def _add(notes, label, value):
    if abs(value) >= .004:
        notes.append([label, int(value * 1000) / 1000])
    return value


def _mul(notes, label, factor):
    if abs(factor - 1.0) >= .004:
        notes.append([label, int((factor - 1.0) * 1000) / 1000])
    return factor


def census(sim):
    """One pass over everyone: country -> [residents, infected, jobs of adults]."""
    table = {}
    for p in sim.people.values():
        row = table.get(p.country)
        if row is None:
            row = [0, 0, Counter()]
            table[p.country] = row
        row[0] += 1
        if p.infection:
            row[1] += 1
        if p.age >= 18:
            row[2][p.job] += 1
    return table


def analyze(sim, cid, counted=None):
    """Everything that affects, and is affected by, one country this year."""
    country = sim.countries[cid]
    land, sea = contacts(sim, False)
    prof = profile(sim, cid)
    b = building_counts(sim, cid)
    if counted is None:
        counted = census(sim)
    row = counted.get(cid, [0, 0, Counter()])
    residents = row[0]
    infected = row[1]
    jobs = row[2]
    residents = max(1, residents)
    share = infected / residents
    wars = [pair for pair in sim.wars if cid in pair]
    at_war = len(wars) > 0
    exhaustion = 0.0
    details = getattr(sim, "war_details", {})
    for pair in wars:
        detail = details.get(pair)
        if detail:
            exhaustion = max(exhaustion, detail["exhaustion"][0 if pair[0] == cid else 1])
    techs = country.technologies
    roads = getattr(sim, "roads", {})
    road_len = sum([1 for v in roads.values() if v == cid])
    peaceful = [n for n in land.get(cid, set()) if tuple(sorted([cid, n])) not in sim.wars]
    sea_contacts = len(sea.get(cid, set())) if "sailing" in techs else 0
    fx = tech_effects(techs)
    trade = (1 + fx["trade"]) * governments.trait(country, "trade") * min(5.0, .5 * b["bank"] + 1.0 * b["station"] + .6 * b["market"] + .8 * b["harbor"] + .6 * b["lighthouse"] + .015 * road_len + .35 * len(peaceful) + .5 * sea_contacts)
    culture = getattr(country, "culture", 0.0)
    level = min(5.0, culture / 40)
    monarchy = country.government in governments.AUTHORITY
    form = governments.info(country.government)["label"]
    eco = economy_of(sim, cid)
    treasury = getattr(country, "treasury", 0.0)
    places = [s for s in _inhabited(sim) if s.country == cid]
    frontier = False
    for s in places:
        for o in _inhabited(sim):
            if o.country != cid and dist(s.gx, s.gy, o.gx, o.gy) <= 16:
                frontier = True
    last_disaster = getattr(country, "last_disaster_year", None)
    recent_disaster = last_disaster is not None and sim.year - last_disaster <= 2
    notes = {}

    # Science: shaped by institutions, trade, culture, politics, health, war and geography.
    n = []
    notes["research"] = n
    r = 1.0
    r += _add(n, "Schools", .10 * b["school"] ** .8)
    r += _add(n, "Libraries", .16 * b["library"] ** .8)
    r += _add(n, "Universities", .28 * b["university"] ** .8)
    r += _add(n, "Observatories", .18 * b["observatory"] ** .8)
    r += _add(n, "Grand academy", .25 * b["grand_academy"])
    r += _add(n, "Trade carries ideas", .07 * trade)
    r += _add(n, "Culture and learning", .07 * level)
    r += _add(n, "Political stability", (country.stability - 50) / 250)
    r += _add(n, form + " government", governments.trait(country, "research"))
    r += _add(n, "Open markets", .04 if getattr(country, "economic_system", "mixed") == "capitalism" else 0)
    r += _add(n, "Epidemic disruption", -min(.3, share * 3))
    r += _add(n, "Isolation in the highlands", -.12 if (not land.get(cid) and prof["mountain"] > .5) else 0)
    r += _add(n, "Treasury patronage", .08 * min(1.0, max(0.0, treasury) / 5000))
    boost = max(0.0, r - 1.0)
    research = max(.4, min(2.4, (1.0 + boost / (1 + boost / 1.1)) if r >= 1.0 else r))  # diminishing returns

    # Culture: made by performers, teachers and cultural buildings, funded by prosperity and peace.
    n = []
    notes["culture"] = n
    gain = jobs["performer"] * .03 + jobs["teacher"] * .015 + 1.8 * b["theater"] + .8 * b["monument"] + .7 * b["library"] + .4 * b["school"] + 1.0 * b["university"] + 2.5 * (b["palace"] + b["grand_academy"] + b["lighthouse"] + b["fortress"])
    gain *= (.5 + country.prosperity / 100) * (.6 + country.stability / 150) * (.6 if at_war else 1.0) * governments.trait(country, "culture") * (1 + fx["cult"])
    _add(n, form + " shapes the arts", gain * (1 - 1 / governments.trait(country, "culture")) if governments.trait(country, "culture") != 1.0 else 0)
    _add(n, "Performers and teachers", (jobs["performer"] * .03 + jobs["teacher"] * .015))
    _add(n, "Theaters, monuments and libraries", 1.8 * b["theater"] + .8 * b["monument"] + .7 * b["library"])
    _add(n, "War suppresses the arts", -gain * .4 / .6 if at_war else 0)

    # Politics: stability reacts to culture, buildings, war, disease, disaster and expansion.
    n = []
    notes["stability"] = n
    s = 0.0
    s += _add(n, "Monuments", min(.8, .22 * b["monument"] * (1.4 if monarchy else 1.0)))
    s += _add(n, form + " rule", governments.trait(country, "stability"))
    s += _add(n, "Faith, law and civic life", fx["stab"])
    if eco is not None:
        s += _add(n, "Hunger", -1.4 * (1.0 - eco["food_ratio"]))
        s += _add(n, "Luxuries in the markets", .25 * eco["luxury_cover"] * min(1.0, eco["made"].get("gold", 0.0) + eco["made"].get("furs", 0.0) + eco["imports"].get("gold", 0.0) + eco["imports"].get("furs", 0.0)))
    s += _add(n, "Royal palace", .5 * b["palace"])
    s += _add(n, "National pride from culture", .04 * level)
    s += _add(n, "Defensible towns", min(.3, .1 * b["walls"]) if (at_war or frontier) else 0)
    s += _add(n, "War exhaustion", -exhaustion / 60 if at_war else 0)
    s += _add(n, "Epidemic fear", -share * 14)
    s += _add(n, "Recent disaster", -1.2 if recent_disaster else 0)
    s += _add(n, "New towns raise confidence", .4 if sim.year - getattr(country, "last_expansion", -99) <= 3 else 0)
    s += _add(n, "Empty treasury", -.3 if treasury < 0 else 0)
    if s > 0:
        s *= max(.1, 1 - country.stability / 105)  # hard to improve what is already excellent
    stability_delta = max(-1.5, min(1.2, s))

    # Economy: markets, harbors, roads and mines against disease and war.
    n = []
    notes["prosperity"] = n
    p_delta = 0.0
    p_delta += _add(n, "Markets", .12 * b["market"] ** .8)
    p_delta += _add(n, "Harbors", .16 * b["harbor"])
    p_delta += _add(n, "Trade routes", .05 * trade)
    p_delta += _add(n, "Mines", .08 * b["mine"])
    p_delta += _add(n, "Forges", .06 * b["forge"])
    p_delta += _add(n, "Banks", .1 * b["bank"])
    p_delta += _add(n, "Factories", .15 * b["factory"])
    p_delta += _add(n, "Mills", .06 * b["mill"])
    p_delta += _add(n, "Culture draws visitors", .08 * level)
    p_delta += _add(n, "Epidemic costs", -share * 8)
    p_delta += _add(n, "War costs", -.6 if at_war else 0)
    if eco is not None:
        p_delta += _add(n, "Resource wealth", min(.5, eco["gdp"] / max(1.0, residents) * .25))
        p_delta += _add(n, "Shortages of building materials", -.6 * (1.0 - eco["material_cover"]))
        p_delta += _add(n, "Hunger", -1.0 * (1.0 - eco["food_ratio"]))
        p_delta += _add(n, "Trade profits", min(.4, eco["trade_income"] / max(1.0, residents) * .1))
    if p_delta > 0:
        p_delta *= max(.1, 1 - country.prosperity / 110)
    prosperity_delta = max(-2.0, min(1.5, p_delta))

    n = []
    notes["food"] = n
    food_delta = 0.0
    food_delta += _add(n, "Granaries", min(6.0, 2.2 * b["granary"] ** .8))
    food_delta += _add(n, "Mills", 1.5 * b["mill"] ** .8)
    food_delta += _add(n, "Harbor fisheries", 1.0 * b["harbor"] ** .8 * (1 + prof["coastal"]))
    food_delta += _add(n, "Wells and aqueducts (irrigation)", .6 * (b["well"] + b["aqueduct"]) ** .7)

    # Health: water works and clinics against trade, crowding and war.
    n = []
    notes["infection"] = n
    infection = 1.0
    infection *= _mul(n, "Wells", max(.6, 1 - .06 * b["well"]))
    infection *= _mul(n, "Aqueducts", max(.6, 1 - .09 * b["aqueduct"]))
    infection *= _mul(n, "Trade carries disease", 1 + .04 * trade)
    crowd = min(2.0, max(0.0, residents / max(1, len(places)) - 250) / 300)
    infection *= _mul(n, "Crowded towns", 1 + .15 * crowd)
    infection *= _mul(n, "Camp fever in wartime", 1.2 if at_war else 1.0)
    death_mult = (.93 ** b["clinic"]) * (.85 ** b["hospital"])
    care_bonus = 6 * b["clinic"] + 18 * b["hospital"]
    cure_mult = 1 + .10 * b["clinic"] + .15 * b["hospital"] + .10 * b["university"] + .08 * b["library"]

    # War: weapons, walls, roads, culture and terrain.
    n = []
    notes["military"] = n
    power = 1.0
    power *= _mul(n, "Mines supply arms", 1 + .05 * b["mine"])
    power *= _mul(n, form + " army", governments.trait(country, "military"))
    if eco is not None:
        power *= _mul(n, "Iron, copper and coal in stock", .88 + .16 * eco["metal_cover"])
    power *= _mul(n, "Morale from national culture", 1 + .03 * level)
    power *= _mul(n, "Unpaid soldiers", .85 if treasury < 0 else 1.0)
    power *= _mul(n, "Forges and barracks", 1 + .04 * b["forge"] + .06 * b["barracks"])
    power *= _mul(n, "Roads move armies", 1 + min(.12, .003 * road_len))
    defense = _mul(n, "City walls", .96 ** b["walls"]) * _mul(n, "Great fortress", .9 ** b["fortress"])
    supply_bonus = min(.3, .004 * road_len + .05 * b["harbor"] + .05 * b["station"])

    # Expansion: how strongly the country wants to found new towns.
    n = []
    notes["expansion"] = n
    drive = 1.0
    drive *= _mul(n, form + " seeks territory", governments.trait(country, "expansion") * (1.2 if monarchy else 1.0))
    drive *= _mul(n, "Hunger pushes people out", 1 + (.35 * (1.0 - eco["food_ratio"]) if eco is not None else 0))
    drive *= _mul(n, "Royal palace", 1 + .1 * b["palace"])
    drive *= _mul(n, "Food surplus", 1 + (country.food - 50) / 150)
    size = residents / max(1, len(places))
    drive *= _mul(n, "Crowded towns", 1 + max(0.0, min(.6, (size - 250) / 500)))
    drive *= _mul(n, "Unrest", .6 if country.stability < 35 else 1.0)
    drive *= _mul(n, "Treasury", 1.15 if treasury > 2000 else (.6 if treasury < 0 else 1.0))
    drive *= _mul(n, "War", .3 if at_war else 1.0)
    drive *= _mul(n, "Quarantine", .5 if country.quarantine else 1.0)
    drive *= _mul(n, "Roads and trade", 1 + min(.3, .01 * road_len + .03 * trade))

    return {
        "year": sim.year, "research": research, "culture_gain": gain, "culture": culture, "culture_level": level,
        "stability_delta": stability_delta, "prosperity_delta": prosperity_delta, "food_delta": food_delta,
        "trade": trade, "expansion": max(.15, min(3.0, drive)), "power_mult": power, "defense_mult": defense,
        "supply_bonus": supply_bonus, "infection_mult": infection, "death_mult": death_mult,
        "care_bonus": care_bonus, "cure_mult": cure_mult, "infected_share": share, "at_war": at_war,
        "road_len": road_len, "frontier": frontier, "performers": jobs["performer"],
        "scientists": jobs["scientist"], "merchants": jobs["merchant"], "healers": jobs["healer"], "builders": jobs["laborer"] + jobs["artisan"],
        "residents": residents, "settlements": len(places), "buildings": {k: v for k, v in b.items()},
        "government": country.government, "neighbors": sorted(land.get(cid, set())), "sea_neighbors": sorted(sea.get(cid, set())), "notes": notes,
    }


def refresh(sim):
    """Analyse every living country once at the start of the year."""
    contacts(sim)  # compute and remember this year's borders once
    counted = census(sim)
    sim.systems_state = {"year": sim.year, "countries": {cid: analyze(sim, cid, counted) for cid in sorted(sim.countries)
                                                         if sim.countries[cid].ended is None}}


def state(sim, cid):
    cache = getattr(sim, "systems_state", None)
    if cache is not None and cache["year"] == sim.year and cid in cache["countries"]:
        return cache["countries"][cid]
    return analyze(sim, cid)


def apply_yearly(sim):
    """Apply this year's cross-system effects to the shared national meters."""
    cache = getattr(sim, "systems_state", None)
    if cache is None or cache["year"] != sim.year:
        return
    for cid in sorted(cache["countries"]):
        st = cache["countries"][cid]
        country = sim.countries[cid]
        if country.ended is not None:
            continue
        country.culture = getattr(country, "culture", 0.0) * .96 + st["culture_gain"]
        country.stability = _clamp(country.stability + st["stability_delta"])
        country.prosperity = _clamp(country.prosperity + st["prosperity_delta"])
        country.treasury = getattr(country, "treasury", 0.0) + 2.0 * st["trade"] * st["residents"] ** .5 * (1.5 if getattr(country, "economic_system", "mixed") == "capitalism" else 1.0)


def _ore(sim, place):
    found = resources_near(sim, place.gx, place.gy, 3)
    return found["iron"] + found["copper"] + found["gold"] + found["coal"]


def war_friction(sim, a, b):
    """How likely two particular neighbors are to come to blows."""
    ca = sim.countries[a]
    cb = sim.countries[b]
    sa = state(sim, a)
    sb = state(sim, b)
    places = _inhabited(sim)
    close = 0
    for x in places:
        if x.country == a:
            for y in places:
                if y.country == b and dist(x.gx, x.gy, y.gx, y.gy) <= 12:
                    close += 1
    f = 1 + min(1.0, .12 * close)
    ore_a = sum([_ore(sim, x) for x in places if x.country == a])
    ore_b = sum([_ore(sim, x) for x in places if x.country == b])
    if (ore_a == 0) != (ore_b == 0):
        f *= 1.25
    f /= 1 + .12 * min(sa["trade"], sb["trade"])
    f *= 1 - .04 * min(sa["culture_level"], sb["culture_level"])
    low = min(ca.stability, cb.stability)
    if low < 60:
        f *= 1 + (60 - low) / 200
    if ca.government == "monarchy" and cb.government == "monarchy":
        f *= 1.15
    f *= (governments.trait(ca, "war") + governments.trait(cb, "war")) / 2
    gap = abs(tech_effects(ca.technologies)["weapon"] - tech_effects(cb.technologies)["weapon"])
    f *= 1 + .08 * min(3, gap)  # the better armed neighbor is tempted
    if ca.government in ("democracy", "republic") and cb.government in ("democracy", "republic"):
        f *= .6  # democracies rarely fight each other
    return max(.2, min(3.0, f)), (ore_a == 0) != (ore_b == 0)


def _signed(value):
    return ("+" if value >= 0 else "") + f"{value:.2f}"


def report(sim, query=""):
    lines = ["Systems: how each country's politics, science, culture, economy, health, war, buildings and geography shape one another."]
    for cid in sorted(sim.countries):
        country = sim.countries[cid]
        if country.ended is not None or (query and query not in country.name.casefold()):
            continue
        st = state(sim, cid)
        lines.append(f"{country.name}: research x{st['research']:.2f}; culture {st['culture']:.0f} ({_signed(st['culture_gain'])}/yr); "
                     f"stability {_signed(st['stability_delta'])}/yr; prosperity {_signed(st['prosperity_delta'])}/yr; "
                     f"trade {st['trade']:.1f}; expansion x{st['expansion']:.2f}; infection x{st['infection_mult']:.2f}; "
                     f"military x{st['power_mult']:.2f}")
        for topic in ("research", "stability", "prosperity", "expansion", "infection", "military"):
            notes = st["notes"].get(topic, [])
            if notes:
                lines.append("  " + topic + ": " + "; ".join([f"{label} {_signed(value)}" for label, value in notes]))
    return "\n".join(lines)


def hazard_report(sim, settlement):
    from geography import hazards_at, ensure_placed, describe
    ensure_placed(sim)
    risk = hazards_at(sim, settlement.gx, settlement.gy)
    lines = [f"Natural hazards at {settlement.name} ({describe(sim, settlement)}, cell {settlement.gx},{settlement.gy}):"]
    for kind in sorted(risk, key=lambda k: -risk[k]):
        lines.append(f"  {kind}: {risk[kind]:.2f} " + "#" * int(risk[kind] * 4))
    return "\n".join(lines)
