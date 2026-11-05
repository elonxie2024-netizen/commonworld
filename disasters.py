"""Natural disasters whose kind, place, reach and damage come from geography.

Rivers and low coasts flood, open coasts take storms, forests and deserts burn, highlands
shake and slide, cold peaks bring blizzards. A disaster has an epicenter and a radius, so it
can strike several settlements, even across a border. Protective buildings reduce the harm,
buildings can be destroyed, and badly hit towns send refugees away.
"""

from technology import effects as tech_effects
from geography import H, W, hazards_at, ensure_placed, dist, _inhabited, settlement_counts
from development import damage_buildings, launch_migration, _list

KINDS = ["flood", "storm", "wildfire", "earthquake", "landslide", "blizzard"]
SEVERITY_RATE = {"minor": (.0, .01), "major": (.01, .05), "severe": (.05, .15)}
RADIUS = {"minor": 5, "major": 10, "severe": 16}
DAMAGE = {"minor": 3, "major": 8, "severe": 18}
BUILDING_LOSS = {"minor": .04, "major": .12, "severe": .28}
PROTECTION = {"flood": "levee", "storm": "levee", "wildfire": "firebreak",
              "earthquake": "foundations", "landslide": "foundations", "blizzard": "granary"}


def strike(sim, kind, severity, cx, cy):
    """Apply a disaster centered on a cell. Returns a summary used for reports and the map."""
    ensure_placed(sim)
    rate = sim.rng.uniform(*SEVERITY_RATE[severity])
    radius = RADIUS[severity]
    by_place = {}
    for person in sim.people.values():
        by_place.setdefault(person.settlement, []).append(person)
    protection = PROTECTION[kind]
    affected = []
    deaths = 0
    lost_buildings = 0
    share = {}
    for s in sorted(_inhabited(sim), key=lambda x: x.id):
        d = dist(s.gx, s.gy, cx, cy)
        if d > radius:
            continue
        risk = hazards_at(sim, s.gx, s.gy)[kind]
        intensity = (1 - d / (radius + 1) * .7) * min(1.6, .5 + risk * .45)
        shield = .5 if protection in getattr(s, "buildings", {}) else 0.0
        residents = by_place.get(s.id, [])
        resilience = tech_effects(sim.countries[s.country].technologies)["haz"]  # building codes, levees, insurance
        victims = [p for p in residents if sim.rng.random() < rate * intensity * (1 - shield) * resilience]
        for person in victims:
            person.died = sim.year
            person.cause_of_death = "natural disaster"
            sim.lineages[person.lineage].deaths += 1
            del sim.people[person.id]
        deaths += len(victims)
        lost = damage_buildings(sim, s, BUILDING_LOSS[severity] * intensity * (1 - shield) * resilience, f"The {kind}")
        lost_buildings += len(lost)
        affected.append({"settlement": s.id, "deaths": len(victims), "population": len(residents)})
        row = share.setdefault(s.country, [0, 0])
        row[0] += len(residents)
        row[1] += len(victims)
    for cid in sorted(share):
        country = sim.countries[cid]
        total = max(1, sum([1 for p in sim.people.values() if p.country == cid]) + share[cid][1])
        fraction = min(1.0, share[cid][0] / total)
        country.food = max(0, country.food - DAMAGE[severity] * fraction)
        country.prosperity = max(0, country.prosperity - DAMAGE[severity] * fraction)
        country.last_disaster_year = sim.year
        country.last_disaster_type = kind
    from economy import damage as damage_deposits
    damaged = damage_deposits(sim, kind, cx, cy, radius)
    log = _list(sim, "disaster_log")
    log.append({"year": sim.year, "kind": kind, "severity": severity, "x": cx, "y": cy, "radius": radius,
                "deaths": deaths, "settlements": [a["settlement"] for a in affected], "deposits": damaged})
    while len(log) > 25:
        log.pop(0)
    # Survivors of a devastated town may leave for a safer one.
    for a in affected:
        s = sim.settlements[a["settlement"]]
        left = a["population"] - a["deaths"]
        if a["population"] and a["deaths"] / a["population"] >= .12 and left >= 30:
            safer = [t for t in _inhabited(sim) if t.country == s.country and t.id != s.id
                     and t.id not in [x["settlement"] for x in affected]]
            if safer:
                target = min(safer, key=lambda t: dist(t.gx, t.gy, s.gx, s.gy))
                movers = [p for p in sim.people.values() if p.settlement == s.id and p.age >= 18][:max(5, left // 5)]
                launch_migration(sim, s, target, movers, "refugee")
    return {"deaths": deaths, "affected": affected, "buildings": lost_buildings, "radius": radius}


def describe(sim, kind, severity, summary, country):
    names = [sim.settlements[a["settlement"]].name for a in summary["affected"]]
    where = ", ".join(names[:3]) + (f" and {len(names) - 3} more" if len(names) > 3 else "")
    survivors = sum([a["population"] - a["deaths"] for a in summary["affected"]])
    text = f"A {severity} {kind} struck {country.name}: {summary['deaths']} deaths, {survivors} survivors"
    if where:
        text += f" (affecting {where})"
    if summary["buildings"]:
        text += f"; {summary['buildings']} buildings lost"
    return text + "."


def resolve(sim):
    """At most one disaster per inhabited country per year, placed by geographic risk."""
    ensure_placed(sim)
    groups = {}
    for person in sim.people.values():
        groups.setdefault(person.country, []).append(person)
    deaths = 0
    for cid in list(groups):
        if sim.rng.random() >= sim.disaster_chance:
            continue
        country = sim.countries[cid]
        places = [s for s in _inhabited(sim) if s.country == cid]
        if not places:
            continue
        drought = "Drought" in country.conditions
        pairs = []
        weights = []
        for s in places:
            risk = hazards_at(sim, s.gx, s.gy)
            for kind in KINDS:
                pairs.append((s, kind))
                weights.append(risk[kind] * (1.8 if kind == "wildfire" and drought else 1.0))
        s, kind = sim.rng.choices(pairs, weights)[0]
        severity = sim.rng.choice(["minor", "minor", "minor", "major", "major", "severe"])
        cx = max(0, min(W - 1, s.gx + sim.rng.randint(-2, 2)))
        cy = max(0, min(H - 1, s.gy + sim.rng.randint(-2, 2)))
        summary = strike(sim, kind, severity, cx, cy)
        deaths += summary["deaths"]
        sim.record(describe(sim, kind, severity, summary, country), "disaster")
    return deaths
