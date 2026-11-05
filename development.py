"""Settler expeditions that cross the map, and construction projects that build things.

Settlers stay residents of their home settlement while they travel; only when they arrive
does a new town exist. Buildings are built by a settlement's workers, paid from the national
treasury, and then change how the country's other systems behave.
"""

from collections import Counter
from governments import AUTHORITY
from technology import effects as tech_effects
from economy import materials_pace, use_materials
from geography import (W, H, world, dist, find_path, find_sea_route, cached_route, coast_cell, step_cost, site_quality,
                       claim_owner, claims_list, reach, settlement_counts, hazards_at, ensure_placed, resources_near,
                       _near_flag, _inhabited, contacts)

SPEED = 9.0
SEA_SPEED = 14.0
ARMY_SPEED = 11.0
CARAVAN_SPEED = 10.0
CARAVAN_SEA_SPEED = 15.0
BUILDINGS = {
    "well": ("Wells and cisterns", 100, set(), 40, "", "cleaner water and less waterborne disease", False),
    "granary": ("Granary", 160, {"granaries"}, 60, "", "food reserves that soften famine", False),
    "market": ("Market", 200, {"pottery"}, 80, "", "trade, prosperity and treasury income", False),
    "school": ("School", 260, {"writing"}, 80, "", "faster research and more creative work", False),
    "library": ("Library", 380, {"paper"}, 120, "", "research and shared knowledge", False),
    "university": ("University", 700, {"universities"}, 200, "", "major research gains", False),
    "observatory": ("Observatory", 560, {"astronomy"}, 150, "", "research and navigation", False),
    "clinic": ("Clinic", 280, {"medicine"}, 70, "", "treatment: fewer deaths and more care capacity", False),
    "hospital": ("Hospital", 500, {"surgery"}, 150, "", "strong care and faster cures", False),
    "aqueduct": ("Aqueduct", 440, {"aqueducts"}, 120, "", "clean water at scale", False),
    "walls": ("City walls", 440, {"fortification"}, 100, "", "defense in war and sieges", False),
    "harbor": ("Harbor", 320, {"sailing"}, 80, "coast", "sea trade and fishing, but also a path for disease", False),
    "levee": ("Levee and seawall", 240, {"irrigation"}, 60, "water", "protection from floods and storms", False),
    "firebreak": ("Firebreak", 140, set(), 60, "", "protection from wildfires", False),
    "foundations": ("Reinforced hall", 320, {"fortification"}, 80, "", "protection from earthquakes and landslides", False),
    "monument": ("Monument", 440, {"writing"}, 100, "", "stability and national pride", False),
    "theater": ("Theater", 340, {"writing"}, 100, "", "culture and creative works", False),
    "mine": ("Mine", 300, {"bronze tools"}, 60, "ore", "prosperity and weapons", False),
    "mill": ("Mill", 280, {"watermills"}, 80, "river", "food and prosperity", False),
    "forge": ("Forge", 360, {"ironworking"}, 100, "", "weapons, tools and prosperity", False),
    "bank": ("Bank", 520, {"banking"}, 200, "", "treasury income and trade", False),
    "barracks": ("Barracks", 480, {"military drill"}, 150, "", "stronger armies and sturdier defense", False),
    "factory": ("Factory", 900, {"steam power"}, 250, "", "mass production and prosperity", False),
    "station": ("Railway station", 800, {"railways"}, 250, "", "rail trade and swift supply", False),
    "palace": ("Royal palace", 900, {"writing"}, 150, "capital", "the seat of government: stability, taxes and settler drive", True),
    "grand_academy": ("Grand academy", 1500, {"universities"}, 250, "university", "a great center of learning", True),
    "lighthouse": ("Lighthouse", 420, {"navigation"}, 100, "harbor", "safer sea voyages and busier trade", True),
    "fortress": ("Great fortress", 1300, {"steelmaking"}, 200, "walls", "a nearly impregnable stronghold", True),
}
WORK = {"laborer": 1.0, "artisan": 1.0, "farmer": .25, "scientist": .2}
TRAVEL_RISK = {"ocean": .009, "mountains": .012, "desert": .008, "swamp": .008, "tundra": .007, "hills": .003, "forest": .003}


def _list(sim, name):
    value = getattr(sim, name, None)
    if value is None:
        value = []
        setattr(sim, name, value)
    return value


def _drop(items, target):
    """Remove the entry with the same id (list.remove is not available everywhere)."""
    for i in range(len(items)):
        if items[i]["id"] == target["id"]:
            items.pop(i)
            return


def _next(sim, name):
    value = getattr(sim, name, 1)
    setattr(sim, name, value + 1)
    return value


def building_counts(sim, cid):
    counts = Counter()
    for s in sim.settlements.values():
        if s.country == cid and s.abandoned is None:
            for kind in getattr(s, "buildings", {}):
                counts[kind] += 1
    return counts


# ---------------------------------------------------------------- expeditions

def choose_site(sim, origin, around=None, radius=40, sea=False):
    """Best unclaimed place for a new town. By land: on the origin's landmass. By sea: on another landmass."""
    ensure_placed(sim)
    geo = world(sim)
    comp = geo["land"]
    terrain = geo["terrain"]
    sizes = geo["size"]
    counts = settlement_counts(sim)
    cx, cy = around if around else (origin.gx, origin.gy)
    land = comp[origin.gy][origin.gx]
    monarchy = sim.countries[origin.country].government in AUTHORITY
    claims = claims_list(sim, counts)
    occupied = {c[4] for c in claims}
    prefer = 22 if sea else 14
    best = None
    best_score = -1000000.0
    reach_limit = radius + (25 if sea else 0)
    for y in range(max(1, cy - reach_limit), min(H - 1, cy + reach_limit + 1), 3):
        for x in range(max(1, cx - reach_limit), min(W - 1, cx + reach_limit + 1), 3):
            here = comp[y][x]
            if here == 0 or terrain[y][x] == "mountains":
                continue
            if sea and (here == land or sizes[here] < 25):
                continue
            if not sea and here != land:
                continue
            nearest = 99.0
            rival = 99.0
            claimed = False
            for country, sx, sy, r, other_land in claims:
                d = ((sx - x) ** 2 + (sy - y) ** 2) ** .5
                if d < nearest:
                    nearest = d
                if country != origin.country and d < rival:
                    rival = d
                if d <= r + 1 and other_land == here:
                    claimed = True
            if nearest < 7 or claimed:
                continue  # new towns are founded only on unclaimed land
            if sea and coast_cell(sim, x, y) is None:
                continue
            quality = site_quality(sim, x, y)
            if quality < .8:
                continue
            score = quality - abs(dist(origin.gx, origin.gy, x, y) - prefer) * .08
            if sea and here not in occupied:
                score += 1.5  # an empty land across the water
            if rival < 18:
                score += .6 if monarchy else -.3  # a monarchy stakes claims on the frontier
            if score > best_score:
                best_score = score
                best = (x, y)
    return best


def _path_costs(sim, cells):
    costs = []
    for i in range(1, len(cells)):
        costs.append(step_cost(sim, cells[i - 1][0], cells[i - 1][1], cells[i][0], cells[i][1]))
    return costs


def _sea_costs(cells):
    costs = []
    for i in range(1, len(cells)):
        diagonal = cells[i][0] != cells[i - 1][0] and cells[i][1] != cells[i - 1][1]
        costs.append(1.41 if diagonal else 1.0)
    return costs


def _can_sail(sim, origin):
    return "sailing" in sim.countries[origin.country].technologies and _coast(sim, origin)


def launch_expedition(sim, origin, kind="found", size=None, target=None, forced=False):
    """Send settlers from a settlement to found a new town for their country, on foot or by boat."""
    ensure_placed(sim)
    exps = _list(sim, "expeditions")
    country = sim.countries[origin.country]
    if not forced:
        if len([e for e in exps if e["country"] == origin.country]) >= 1 or len([e for e in exps if e["kind"] == "found"]) >= 2:
            return None
        if sim.year - getattr(country, "last_launch", -99) < 6:
            return None
    residents = [p for p in sim.people.values() if p.settlement == origin.id and not getattr(p, "expedition", None)]
    adults = [p for p in residents if p.age >= 18 and p.infection is None]
    if len(residents) < 20 or not adults:
        return None
    mode = "land"
    site = None
    route = None
    if target is not None:
        site = target
        route = find_path(sim, (origin.gx, origin.gy), (site[0], site[1]))
        if route is None and _can_sail(sim, origin):
            route = find_sea_route(sim, (origin.gx, origin.gy), (site[0], site[1]))
            mode = "sea"
    else:
        by_sea_first = _can_sail(sim, origin) and sim.rng.random() < .35
        for attempt in (["sea", "land"] if by_sea_first else ["land", "sea"]):
            if attempt == "sea" and not _can_sail(sim, origin):
                continue
            found = choose_site(sim, origin, sea=(attempt == "sea"))
            if found is None:
                continue
            route = find_sea_route(sim, (origin.gx, origin.gy), found) if attempt == "sea" else find_path(sim, (origin.gx, origin.gy), found)
            if route is not None:
                site = found
                mode = attempt
                break
    if site is None or route is None:
        return None
    cells, total = route
    limit = min(size or min(25, max(8, len(residents) // 4)), len(residents) - 10)
    if limit < 6:
        return None
    founder = sim.rng.choice(adults)
    family = [p for p in residents if p.lineage == founder.lineage and p.id != founder.id and p.infection is None]
    selected = [founder] + family[:limit - 1]
    chosen = {p.id for p in selected}
    others = [p for p in residents if p.id not in chosen and p.infection is None]
    wanted = size or 10
    selected += sim.rng.sample(others, min(max(0, wanted - len(selected)), len(others)))
    fx = tech_effects(country.technologies)
    speed = SEA_SPEED * (1 + fx["sea"]) if mode == "sea" else SPEED * (1 + fx["land"])
    exp = {"id": _next(sim, "next_expedition"), "kind": kind, "mode": mode, "speed": speed, "country": origin.country,
           "origin": origin.id, "target": [site[0], site[1]], "path": [[x, y] for x, y in cells],
           "costs": _sea_costs(cells) if mode == "sea" else _path_costs(sim, cells),
           "index": 0, "carry": 0.0, "people": [p.id for p in selected], "leader": founder.id,
           "start": sim.year, "total": total}
    for p in selected:
        p.expedition = exp["id"]
    exps.append(exp)
    country.last_launch = sim.year
    terrain = world(sim)["terrain"][site[1]][site[0]]
    ref = sim.person_reference(founder)
    opening = f"{ref} sailed from {origin.name} with {len(selected)} settlers" if mode == "sea" else f"{ref} led {len(selected)} settlers out of {origin.name}"
    sim.record(f"{opening} to found a new {country.name} town on {terrain} land{' across the sea' if mode == 'sea' else ''}; "
               f"the journey should take about {int(total / speed) + 1} years.", "political")
    return exp


def launch_migration(sim, origin, target, members, kind="migrate"):
    """Move a group between two settlements of one country; far journeys take years."""
    ensure_placed(sim)
    members = [p for p in members if not getattr(p, "expedition", None)]
    if not members:
        return None
    route = None
    if dist(origin.gx, origin.gy, target.gx, target.gy) > 4:
        route = find_path(sim, (origin.gx, origin.gy), (target.gx, target.gy))
    if route is None:
        for p in members:
            p.settlement = target.id
        return None
    cells, total = route
    exp = {"id": _next(sim, "next_expedition"), "kind": kind, "country": origin.country, "origin": origin.id,
           "target": [target.gx, target.gy], "target_settlement": target.id, "path": [[x, y] for x, y in cells],
           "costs": _path_costs(sim, cells), "index": 0, "carry": 0.0, "people": [p.id for p in members],
           "leader": members[0].id, "start": sim.year, "total": total}
    for p in members:
        p.expedition = exp["id"]
    _list(sim, "expeditions").append(exp)
    return exp


def launch_emigration(sim, origin, groups):
    """A family sets out for a town of a neighboring country, carrying what its people know."""
    ensure_placed(sim)
    land, sea = contacts(sim)
    neighbors = [n for n in sorted(land.get(origin.country, set()))
                 if tuple(sorted([origin.country, n])) not in sim.wars and sim.countries[n].ended is None]
    if not neighbors:
        return None
    host = sim.rng.choice(neighbors)
    towns = [s for s in sim.settlements.values() if s.country == host and s.abandoned is None and groups.get(s.id)]
    if not towns:
        return None
    target = towns[0]
    for s in towns:
        if dist(s.gx, s.gy, origin.gx, origin.gy) < dist(target.gx, target.gy, origin.gx, origin.gy):
            target = s
    route = find_path(sim, (origin.gx, origin.gy), (target.gx, target.gy))
    if route is None or len(route[0]) < 2:
        return None
    ruler = sim.countries[origin.country].ruler
    residents = [p for p in groups.get(origin.id, []) if not getattr(p, "expedition", None) and p.id != ruler and p.infection is None]
    adults = [p for p in residents if p.age >= 18]
    if not adults:
        return None
    migrant = sim.rng.choice(adults)
    members = [p for p in residents if p.lineage == migrant.lineage][:12]
    cells, total = route
    exp = {"id": _next(sim, "next_expedition"), "kind": "emigrant", "country": origin.country, "origin": origin.id,
           "target": [target.gx, target.gy], "target_settlement": target.id, "path": [[x, y] for x, y in cells],
           "costs": _path_costs(sim, cells), "index": 0, "carry": 0.0, "people": [p.id for p in members],
           "leader": migrant.id, "start": sim.year, "total": total}
    for p in members:
        p.expedition = exp["id"]
    _list(sim, "expeditions").append(exp)
    sim.record(f"{len(members)} people from {origin.name} set out for {target.name} in {sim.countries[host].name}.", "population")
    return exp


def _arrive_abroad(sim, exp, members, origin, country, destination):
    """Newcomers settle in a foreign town; the host learns a little of what their homeland knows."""
    host = sim.countries[destination.country]
    pair = tuple(sorted([country.id, host.id]))
    if destination.abandoned is not None or host.ended is not None or pair in sim.wars:
        _release(sim, exp)
        return
    movers = [p for p in members if p.id != country.ruler]
    for person in members:
        person.expedition = None
    for person in movers:
        person.settlement = destination.id
        person.country = host.id
    _drop(_list(sim, "expeditions"), exp)
    if not movers:
        return
    sim.record(f"{len(movers)} newcomers from {country.name} ({origin.name}) settled in {destination.name} in {host.name}.", "population")
    from society import pass_on_knowledge
    got = pass_on_knowledge(sim, country, host, min(.8, .08 * len(movers)))
    if got:
        sim.record(f"Settlers from {country.name} brought knowledge of {got[0]} to {host.name}.", "discovery")


def _release(sim, exp):
    for pid in exp["people"]:
        person = sim.people.get(pid)
        if person is not None:
            person.expedition = None
    exps = _list(sim, "expeditions")
    _drop(exps, exp)


def _kill_traveler(sim, person):
    person.died = sim.year
    person.cause_of_death = "hardships of the journey"
    sim.lineages[person.lineage].deaths += 1
    del sim.people[person.id]


def advance_expeditions(sim):
    exps = _list(sim, "expeditions")
    if not exps:
        return 0
    ensure_placed(sim)
    rows = world(sim)["terrain"]
    died = 0
    for exp in list(exps):
        members = [sim.people[i] for i in exp["people"] if i in sim.people]
        if members:
            leader = sim.people.get(exp["leader"]) or members[0]
            exp["country"] = leader.country
            members = [p for p in members if p.country == exp["country"]]
        released = [sim.people[i] for i in exp["people"] if i in sim.people and sim.people[i] not in members]
        for person in released:
            person.expedition = None
        exp["people"] = [p.id for p in members]
        origin = sim.settlements[exp["origin"]]
        minimum = 4 if exp["kind"] == "found" else 1
        if len(members) < minimum or sim.countries[exp["country"]].ended is not None:
            sim.record(f"The expedition from {origin.name} dissolved on the road.", "political")
            _release(sim, exp)
            continue
        budget = exp.get("speed", SPEED) + exp.get("carry", 0.0)
        index = exp["index"]
        path = exp["path"]
        costs = exp["costs"]
        while index < len(path) - 1 and budget >= costs[index]:
            budget -= costs[index]
            index += 1
        exp["carry"] = min(budget, 6.0)
        exp["index"] = index
        here = rows[path[index][1]][path[index][0]]
        risk = TRAVEL_RISK.get(here, .0015)
        if here == "ocean":
            risk *= max(.35, 1 - .8 * tech_effects(sim.countries[exp["country"]].technologies)["sea"])  # better ships, safer seas
            if building_counts(sim, exp["country"])["lighthouse"]:
                risk *= .5  # a lighthouse guides the boats home
        lost = [p for p in members if sim.rng.random() < risk]
        for person in lost:
            _kill_traveler(sim, person)
        died += len(lost)
        members = [p for p in members if p.id in sim.people]
        exp["people"] = [p.id for p in members]
        if len(members) < minimum:
            sim.record(f"The party from {origin.name} turned back after the {here} claimed too many lives.", "political")
            _release(sim, exp)
            continue
        if index >= len(path) - 1:
            _arrive(sim, exp, members)
    return died


def _arrive(sim, exp, members):
    origin = sim.settlements[exp["origin"]]
    country = sim.countries[exp["country"]]
    years = max(1, sim.year - exp["start"])
    if exp["kind"] == "found":
        target = (exp["target"][0], exp["target"][1])
        counts = settlement_counts(sim)
        occupied = any(s.gx == target[0] and s.gy == target[1] for s in sim.settlements.values() if s.abandoned is None)
        owner = claim_owner(sim, target[0], target[1], counts)
        if occupied or (owner and owner != exp["country"]):
            alt = choose_site(sim, origin, around=target, radius=8, sea=(exp.get("mode") == "sea"))
            if alt is None:
                sim.record(f"Settlers from {origin.name} found their destination taken and returned home.", "political")
                _release(sim, exp)
                return
            target = alt
        leader = sim.people.get(exp["leader"]) or members[0]
        sim.record(f"A party of {len(members)} settlers from {origin.name} reached the site of a new {country.name} town after {years} years on the road.", "political")
        exps = _list(sim, "expeditions")
        _drop(exps, exp)
        place = sim.found_settlement(exp["country"], leader, members, cell=target)
        for person in members:
            person.expedition = None
        country.last_expansion = sim.year
        return
    destination = sim.settlements.get(exp.get("target_settlement"))
    if exp["kind"] == "emigrant" and destination is not None and destination.country != exp["country"]:
        _arrive_abroad(sim, exp, members, origin, country, destination)
        return
    if destination is None or destination.country != exp["country"] or destination.abandoned is not None:
        _release(sim, exp)
        return
    for person in members:
        person.settlement = destination.id
        person.expedition = None
    _drop(_list(sim, "expeditions"), exp)
    verb = "Refugees" if exp["kind"] == "refugee" else "Migrants"
    sim.record(f"{verb} from {origin.name} ({len(members)} people) settled in {destination.name} in {country.name}.", "population")


# ---------------------------------------------------------------- construction

def _available(sim, s, kind, counts_here):
    label, cost, tech, minimum, need, blurb, wonder = BUILDINGS[kind]
    country = sim.countries[s.country]
    if kind in getattr(s, "buildings", {}) or not tech <= country.technologies or counts_here < minimum:
        return False
    if wonder and (building_counts(sim, s.country)[kind] or any(p["country"] == s.country and p["kind"] == kind for p in _list(sim, "projects"))):
        return False  # one of each wonder per country
    if need == "capital" and country.capital != s.id:
        return False
    if need in ("university", "harbor", "walls") and need not in getattr(s, "buildings", {}):
        return False
    if any(p["settlement"] == s.id and p["kind"] == kind for p in _list(sim, "projects")):
        return False
    features = world(sim)
    if need == "coast" and not _coast(sim, s):
        return False
    if need == "water" and not (_coast(sim, s) or _near_flag(features["river"], s.gx, s.gy, 1)):
        return False
    if need == "river" and not _near_flag(features["river"], s.gx, s.gy, 1):
        return False
    if need == "ore" and sum([resources_near(sim, s.gx, s.gy, 3)[k] for k in ("iron", "copper", "gold", "coal", "stone")]) == 0:
        return False
    if kind == "hospital" and "clinic" not in getattr(s, "buildings", {}):
        return False
    return True


def _coast(sim, s):
    rows = world(sim)["terrain"]
    for yy in range(max(0, s.gy - 1), min(H, s.gy + 2)):
        for xx in range(max(0, s.gx - 1), min(W, s.gx + 2)):
            if rows[yy][xx] in ("ocean", "lake"):
                return True
    return False


def start_project(sim, s, kind, forced=False, target=None):
    """Begin building something. Returns the project, or None if it cannot be built."""
    projects = _list(sim, "projects")
    if kind == "road":
        if target is None or target.country != s.country:
            return None
        route = find_path(sim, (s.gx, s.gy), (target.gx, target.gy))
        if route is None:
            return None
        cells, total = route
        project = {"id": _next(sim, "next_project"), "settlement": s.id, "country": s.country, "kind": "road",
                   "label": f"Road to {target.name}", "start": sim.year, "progress": 0.0,
                   "cost": 40 + total * 9, "workers": 0.0, "cells": [[x, y] for x, y in cells], "target": target.id}
        projects.append(project)
        sim.record(f"Work began on a road linking {s.name} and {target.name} in {sim.countries[s.country].name}.", "political")
        return project
    spec = BUILDINGS.get(kind)
    if spec is None:
        return None
    counts = settlement_counts(sim)
    if not forced and not _available(sim, s, kind, counts.get(s.id, 0)):
        return None
    if forced and (kind in getattr(s, "buildings", {}) or any(p["settlement"] == s.id and p["kind"] == kind for p in projects)):
        return None
    project = {"id": _next(sim, "next_project"), "settlement": s.id, "country": s.country, "kind": kind,
               "label": spec[0], "start": sim.year, "progress": 0.0, "cost": spec[1], "workers": 0.0}
    projects.append(project)
    sim.record(f"Construction began on a {spec[0].lower()} in {s.name}, {sim.countries[s.country].name}.", "political")
    return project


def _weight(sim, s, kind, st, built, haz, country):
    """How much a country wants a particular building in a particular place."""
    w = 1.0
    sick = st["infected_share"]
    war = st["at_war"]
    monarchy = country.government in AUTHORITY
    if kind == "well":
        w += 2.5 if sick > .005 else 0
        w += 1.0 if _near_flag(world(sim)["river"], s.gx, s.gy, 1) else 0
    elif kind == "granary":
        w += 3.0 if (country.food < 55 or "Famine" in country.conditions or "Drought" in country.conditions) else 0
    elif kind == "market":
        w += 1.5 if getattr(country, "economic_system", "mixed") == "capitalism" else .5
    elif kind in ("school", "library", "university", "observatory"):
        w += 1.4 if not monarchy else .2
        w += 1.0 if getattr(country, "economic_system", "mixed") == "communism" else 0
    elif kind in ("clinic", "hospital"):
        w += 3.5 if sick > .01 else (1.0 if sick > 0 else 0)
    elif kind == "aqueduct":
        w += 1.5 if "well" in getattr(s, "buildings", {}) else 0
    elif kind == "walls":
        w += 3.5 if war else (1.0 if st["frontier"] else 0)
        w += 1.5 if monarchy else 0
    elif kind == "harbor":
        w += 2.0 if getattr(country, "economic_system", "mixed") == "capitalism" else .6
    elif kind == "levee":
        w += haz["flood"] * 1.2 + haz["storm"] * .8
    elif kind == "firebreak":
        w += haz["wildfire"] * 1.6
    elif kind == "foundations":
        w += haz["earthquake"] * 1.6 + haz["landslide"] * 1.2
    elif kind == "monument":
        w += 2.5 if monarchy else .3
        w += 2.0 if country.stability < 45 else 0
    elif kind == "theater":
        w += 1.0 if st["performers"] >= 3 else 0
        w += .8 if not monarchy else 0
    elif kind == "mine":
        w += 1.5 + (2.0 if war else 0)
    elif kind == "mill":
        w += 1.0
    elif kind == "palace":
        w += 3.0 if monarchy else 1.0
    elif kind == "grand_academy":
        w += 2.5 if not monarchy else .8
    elif kind == "lighthouse":
        w += 1.5 + (1.5 if getattr(country, "economic_system", "mixed") == "capitalism" else 0)
    elif kind == "fortress":
        w += 3.5 if war else (1.5 if st["frontier"] else 0)
    elif kind == "forge":
        w += 1.0 + (1.5 if war else 0)
    elif kind == "bank":
        w += 1.5 if getattr(country, "economic_system", "mixed") == "capitalism" else .6
    elif kind == "barracks":
        w += (2.5 if war else .3) + (1.0 if country.government in ("junta", "empire", "tyranny") else 0)
    elif kind == "factory":
        w += 1.5 + (1.0 if getattr(country, "economic_system", "mixed") == "capitalism" else 0)
    elif kind == "station":
        w += 1.5
    return max(0.0, w * (.7 ** built[kind]))


def plan_projects(sim):
    """Each year idle settlements may start something their country needs."""
    from systems import state
    projects = _list(sim, "projects")
    counts = settlement_counts(sim)
    for cid in sorted(sim.countries):
        country = sim.countries[cid]
        if country.ended is not None or getattr(country, "treasury", 0.0) < 150:
            continue
        st = state(sim, cid)
        built = building_counts(sim, cid)
        for s in sorted(_inhabited(sim), key=lambda x: x.id):
            if s.country != cid:
                continue
            pop = counts.get(s.id, 0)
            active = [p for p in projects if p["settlement"] == s.id]
            if pop < 40 or len(active) >= (2 if pop >= 400 else 1) or sim.rng.random() >= .30:
                continue
            haz = hazards_at(sim, s.gx, s.gy)
            kinds = []
            weights = []
            for kind in BUILDINGS:
                if _available(sim, s, kind, pop) and BUILDINGS[kind][1] * .6 <= country.treasury:
                    weight = _weight(sim, s, kind, st, built, haz, country)
                    if weight > 0:
                        kinds.append(kind)
                        weights.append(weight)
            if kinds:
                start_project(sim, s, sim.rng.choices(kinds, weights)[0])
        # Roads between a country's own towns, once it knows how.
        if "roads" in country.technologies and sim.rng.random() < .10:
            mine = [s for s in _inhabited(sim) if s.country == cid and counts.get(s.id, 0) >= 60]
            roads = getattr(sim, "roads", {})
            best = None
            best_gap = 999.0
            for i in range(len(mine)):
                for j in range(i + 1, len(mine)):
                    d = dist(mine[i].gx, mine[i].gy, mine[j].gx, mine[j].gy)
                    linked = any(p["kind"] == "road" and ((p["settlement"] == mine[i].id and p["target"] == mine[j].id)
                                 or (p["settlement"] == mine[j].id and p["target"] == mine[i].id)) for p in projects)
                    midpoint = (int((mine[i].gx + mine[j].gx) / 2), int((mine[i].gy + mine[j].gy) / 2))
                    covered = (midpoint[1] * W + midpoint[0]) in roads
                    if d < best_gap and 4 < d < 48 and not linked and not covered:
                        best_gap = d
                        best = (mine[i], mine[j])
            if best is not None:
                start_project(sim, best[0], "road", target=best[1])


def advance_projects(sim):
    projects = _list(sim, "projects")
    if not projects:
        return
    workers = {}
    for p in sim.people.values():
        if p.age >= 18 and p.infection is None and getattr(p, "wounded_until", 0) <= sim.year:
            weight = WORK.get(p.job, 0.0)
            if weight:
                workers[p.settlement] = workers.get(p.settlement, 0.0) + weight
    shares = Counter(p["settlement"] for p in projects)
    busy = {cid for pair in sim.wars for cid in pair}
    for project in list(projects):
        s = sim.settlements[project["settlement"]]
        country = sim.countries[s.country]
        if s.abandoned is not None or country.ended is not None:
            _drop(projects, project)
            continue
        crew = workers.get(s.id, 0.0) / shares[s.id]
        pace = 1.0
        if s.country in busy:
            pace *= .4
        if "Famine" in country.conditions:
            pace *= .6
        if country.quarantine:
            pace *= .7
        if getattr(country, "treasury", 0.0) < 0:
            pace *= .3
        pace *= materials_pace(country)  # no timber, stone or clay in the stockpile: work crawls
        done = crew * pace * (1.15 if "roads" in country.technologies else 1.0) * (1 + tech_effects(country.technologies)["build"])
        project["workers"] = int(crew * 10) / 10
        project["progress"] += done / project["cost"]
        country.treasury = getattr(country, "treasury", 0.0) - done * .6
        use_materials(country, done * .15)
        if project["progress"] >= 1.0:
            _drop(projects, project)
            _complete(sim, s, country, project)


def _complete(sim, s, country, project):
    if project["kind"] == "road":
        roads = getattr(sim, "roads", None)
        if roads is None:
            roads = {}
            sim.roads = roads
        for x, y in project["cells"]:
            roads[y * W + x] = s.country
        other = sim.settlements.get(project["target"])
        sim.record(f"A road linking {s.name} and {other.name if other else 'a neighboring town'} was completed in {country.name}.", "political")
        country.prosperity = min(100, country.prosperity + 1)
        return
    buildings = getattr(s, "buildings", None)
    if buildings is None:
        buildings = {}
        s.buildings = buildings
    buildings[project["kind"]] = sim.year
    spec = BUILDINGS[project["kind"]]
    country.stability = min(100, country.stability + (2.0 if project["kind"] == "monument" else 1.0))
    country.prosperity = min(100, country.prosperity + 1)
    sim.record(f"{spec[0]} completed in {s.name}, {country.name}: {spec[5]}.", "political")


def damage_buildings(sim, s, chance, cause):
    """A settlement may lose buildings to disaster or war. Returns the names lost."""
    built = getattr(s, "buildings", None)
    lost = []
    if not built:
        return lost
    for kind in sorted(built):
        if sim.rng.random() < chance:
            lost.append(kind)
    for kind in lost:
        del built[kind]
    if lost:
        names = ", ".join([BUILDINGS[k][0].lower() for k in lost])
        sim.record(f"{cause} destroyed the {names} in {s.name}.", "disaster")
    return lost


def projects_report(sim, query=""):
    projects = _list(sim, "projects")
    lines = ["Construction projects (workers build; the national treasury pays):"]
    shown = 0
    for project in projects:
        s = sim.settlements[project["settlement"]]
        country = sim.countries[s.country]
        if query and query not in country.name.casefold() and query not in s.name.casefold():
            continue
        shown += 1
        lines.append(f"  #{project['id']} {project['label']} in {s.name} ({country.name}): "
                     f"{project['progress']:.0%} done; {project['workers']} workers")
    if not shown:
        lines.append("  none under way")
    lines.append("Completed buildings:")
    total = 0
    for s in sorted(sim.settlements.values(), key=lambda x: x.id):
        built = getattr(s, "buildings", {})
        country = sim.countries[s.country]
        if built and (not query or query in country.name.casefold() or query in s.name.casefold()):
            total += len(built)
            lines.append(f"  {s.name} ({country.name}): " + ", ".join([BUILDINGS[k][0].lower() for k in sorted(built)]))
    if not total:
        lines.append("  none yet")
    roads = getattr(sim, "roads", {})
    lines.append(f"Road cells: {len(roads)}")
    return "\n".join(lines)


def expeditions_report(sim, query=""):
    lines = ["Settler parties on the road:"]
    shown = 0
    for exp in _list(sim, "expeditions"):
        country = sim.countries[exp["country"]]
        if query and query not in country.name.casefold():
            continue
        origin = sim.settlements[exp["origin"]]
        left = len(exp["path"]) - 1 - exp["index"]
        aim = "to found a new town" if exp["kind"] == "found" else "to " + sim.settlements[exp["target_settlement"]].name
        shown += 1
        lines.append(f"  {country.name}: {len(exp['people'])} people from {origin.name} {aim}; "
                     f"{exp['index']} of {len(exp['path']) - 1} steps done, {left} to go (left in year {exp['start']})")
    if not shown:
        lines.append("  none")
    return "\n".join(lines)


# ---------------------------------------------------------------- armies

def besieging(sim, pair, side):
    """Is this side's army standing at the walls of its objective?"""
    for army in _list(sim, "armies"):
        if army["war"][0] == pair[0] and army["war"][1] == pair[1] and army["side"] == side and army["state"] == "besieging":
            return True
    return False


def advance_armies(sim):
    """Armies march from their own towns to the enemy settlement they are fighting for."""
    ensure_placed(sim)
    armies = _list(sim, "armies")
    details = getattr(sim, "war_details", {})
    keep = []
    for pair in sorted(sim.wars):
        detail = details.get(pair)
        if not detail:
            continue
        for side in (0, 1):
            cid = pair[side]
            enemy = pair[1 - side]
            men = detail.get("mobilized", [0, 0])[side]
            objectives = detail.get("objectives") or [None, None]
            objective = sim.settlements.get(objectives[side])
            if men <= 0 or objective is None or objective.country != enemy or objective.abandoned is not None:
                continue
            army = None
            for a in armies:
                if a["war"][0] == pair[0] and a["war"][1] == pair[1] and a["side"] == side:
                    army = a
            if army is None:
                mine = [s for s in _inhabited(sim) if s.country == cid]
                if not mine:
                    continue
                home = mine[0]
                for s in mine:
                    if dist(s.gx, s.gy, objective.gx, objective.gy) < dist(home.gx, home.gy, objective.gx, objective.gy):
                        home = s
                route = cached_route(sim, (home.gx, home.gy), (objective.gx, objective.gy))
                if route is None:
                    continue
                cells = route[0]
                stop = max(0, len(cells) - 3)
                army = {"id": _next(sim, "next_army"), "country": cid, "enemy": enemy, "war": [pair[0], pair[1]], "side": side,
                        "objective": objective.id, "origin": home.id, "men": men, "path": [[x, y] for x, y in cells[:stop + 1]],
                        "costs": _path_costs(sim, cells[:stop + 1]), "index": 0, "carry": 0.0, "state": "marching", "start": sim.year}
                armies.append(army)
                sim.record(f"{sim.countries[cid].name} mobilized {men} soldiers, who marched out of {home.name} toward {objective.name}.", "war")
            army["men"] = men
            army["objective"] = objective.id
            if army["state"] == "marching":
                budget = ARMY_SPEED * (1 + tech_effects(sim.countries[cid].technologies)["land"]) + army["carry"]
                index = army["index"]
                while index < len(army["path"]) - 1 and budget >= army["costs"][index]:
                    budget -= army["costs"][index]
                    index += 1
                army["carry"] = min(budget, 6.0)
                army["index"] = index
                if index >= len(army["path"]) - 1:
                    army["state"] = "besieging"
                    sim.record(f"The {sim.countries[cid].name} army of {men} soldiers laid siege to {objective.name}.", "war")
            keep.append(army["id"])
    sim.armies = [a for a in armies if a["id"] in keep]


# ---------------------------------------------------------------- merchant caravans

CARGO = {"grain": "grain", "pasture": "wool", "fish": "salted fish", "game": "meat", "timber": "timber", "stone": "stone", "clay": "pottery clay",
         "iron": "iron", "copper": "copper", "coal": "coal", "gold": "gold", "salt": "salt", "furs": "furs"}


def _caravan_spawn(sim, cid, st, caravans, land, sea):
    country = sim.countries[cid]
    partners = [n for n in sorted(land.get(cid, set())) if tuple(sorted([cid, n])) not in sim.wars]
    if "sailing" in country.technologies:
        partners += [n for n in sorted(sea.get(cid, set())) if n not in partners]
    if not partners:
        return
    other = sim.rng.choice(partners)
    mine = [s for s in _inhabited(sim) if s.country == cid]
    theirs = [s for s in _inhabited(sim) if s.country == other]
    if not mine or not theirs:
        return
    counts = settlement_counts(sim)
    origin = max(mine, key=lambda s: counts.get(s.id, 0) + 40 * ("market" in getattr(s, "buildings", {})) + 40 * ("harbor" in getattr(s, "buildings", {})))
    comp = world(sim)["land"]
    same = [s for s in theirs if comp[s.gy][s.gx] == comp[origin.gy][origin.gx]]
    by_sea = not same
    pool = theirs if by_sea else same
    if by_sea:
        pool = [s for s in pool if _coast(sim, s)]
        if not pool or not _coast(sim, origin):
            return
    dest = pool[0]
    for s in pool:
        if dist(s.gx, s.gy, origin.gx, origin.gy) < dist(dest.gx, dest.gy, origin.gx, origin.gy):
            dest = s
    route = cached_route(sim, (origin.gx, origin.gy), (dest.gx, dest.gy), by_sea)
    if route is None:
        return
    cells = route[0]
    size = max(4, min(90, st["merchants"] // 3 + 4 * (st["buildings"].get("market", 0) + st["buildings"].get("harbor", 0))))
    carries = None
    if st["infected_share"] >= .02:
        sick = Counter(p.infection for p in sim.people.values() if p.country == cid and p.infection)
        if sick:
            carries = sick.most_common(1)[0][0]
    near = resources_near(sim, origin.gx, origin.gy, 4)
    cargo = CARGO[near.most_common(1)[0][0]] if near else "cloth"
    caravan = {"id": _next(sim, "next_caravan"), "country": cid, "partner": other, "origin": origin.id, "dest": dest.id,
               "mode": "sea" if by_sea else "land", "path": [[x, y] for x, y in cells],
               "costs": _sea_costs(cells) if by_sea else _path_costs(sim, cells), "index": 0, "carry": 0.0,
               "size": size, "cargo": cargo, "carries": carries, "start": sim.year, "large": size >= 40}
    caravans.append(caravan)
    if size >= 40 or carries:
        sim.record(f"{'A large band' if size >= 40 else 'A band'} of {size} {country.name} merchants left {origin.name} "
                   f"for {dest.name} with {cargo}{', some of them sick with ' + carries if carries else ''}.", "political")


def advance_caravans(sim):
    """Merchants carry goods, ideas and sometimes disease between towns."""
    from systems import state
    ensure_placed(sim)
    caravans = _list(sim, "caravans")
    land, sea = contacts(sim)
    arrived = []
    for c in caravans:
        cfx = tech_effects(sim.countries[c["country"]].technologies)
        speed = CARAVAN_SEA_SPEED * (1 + cfx["sea"]) if c["mode"] == "sea" else CARAVAN_SPEED * (1 + cfx["land"])
        budget = speed + c["carry"]
        index = c["index"]
        while index < len(c["path"]) - 1 and budget >= c["costs"][index]:
            budget -= c["costs"][index]
            index += 1
        c["carry"] = min(budget, 6.0)
        c["index"] = index
        if index >= len(c["path"]) - 1:
            arrived.append(c)
    for c in arrived:
        _drop(caravans, c)
        home = sim.countries[c["country"]]
        away = sim.countries[c["partner"]]
        dest = sim.settlements.get(c["dest"])
        if dest is None or away.ended is not None or home.ended is not None:
            continue
        gain = min(2.0, c["size"] / 40)
        for country in (home, away):
            country.prosperity = min(100, country.prosperity + gain * .5)
            country.treasury = getattr(country, "treasury", 0.0) + c["size"] * 3
        # Merchants swap know-how both ways: more traders and a more productive giver pass on more.
        from society import pass_on_knowledge
        for giver, taker in ((home, away), (away, home)):
            got = pass_on_knowledge(sim, giver, taker, min(.6, .02 * c["size"]))
            if got and c["size"] >= 40:
                sim.record(f"Merchants from {giver.name} taught {taker.name} about {got[0]} in {dest.name}.", "discovery")
        if c["carries"] and c["carries"] in sim.sicknesses and sim.rng.random() < .6:
            residents = [p for p in sim.people.values() if p.settlement == dest.id and p.infection is None
                         and c["carries"] not in p.immunity]
            if residents:
                from epidemiology import _history
                patient = sim.rng.choice(residents)
                patient.infection = c["carries"]
                patient.infection_steps = 0
                _history(patient, "infected", c["carries"], sim.year)
                sim.record(f"Merchants from {home.name} brought {c['carries']} to {dest.name} in {away.name}.", "sickness")
    if len(caravans) >= 8:
        return
    for cid in sorted(sim.countries):
        country = sim.countries[cid]
        if country.ended is not None or len(_list(sim, "caravans")) >= 8:
            continue
        st = state(sim, cid)
        if st["trade"] < .6 or sim.rng.random() >= min(.4, .05 + .06 * st["trade"]):
            continue
        _caravan_spawn(sim, cid, st, caravans, land, sea)
