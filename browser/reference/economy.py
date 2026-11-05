"""Resources as an economy.

Every tile may hold up to three deposits. Settlements work the deposits inside their claim,
nearest first, to feed their people and supply wood, stone, metal and luxuries. A deposit that
is worked down to nothing is *exhausted*: it refills slowly and cannot be worked again until it
is completely full. Goods go into national stockpiles, spoil, are traded between peaceful
neighbors at prices set by scarcity, are taxed by the government, and feed back into food,
construction, weapons, stability and prosperity.
"""

from geography import W, H, RESOURCE_INFO, FEATURE_NAMES, world, _inhabited, reach, settlement_counts, contested_cells, dist, contacts
import governments
from technology import effects as tech_effects

FOOD = ["grain", "pasture", "fish", "game"]
MATERIALS = ["timber", "stone", "clay"]
METALS = ["iron", "copper", "coal"]
LUXURIES = ["gold", "furs", "salt"]
KINDS = FOOD + MATERIALS + METALS + LUXURIES
SPOIL = {"grain": .30, "pasture": .30, "fish": .40, "game": .40, "timber": .03, "stone": .0, "clay": .0,
         "iron": .005, "copper": .005, "coal": .01, "gold": .0, "furs": .06, "salt": .0}
FOOD_TECHS = {"irrigation", "crop rotation", "granaries", "watermills", "pottery"}
YEARLY_SHARE = .5  # at most this share of a deposit can be worked in a year
CAPACITY_SHARE = .5  # share of the land's yearly food regrowth that can feed people sustainably
FOOD_NEED = .35  # tons of food per person per year (sum of the food needs below)


def _state(sim):
    state = getattr(sim, "deposit_state", None)
    if state is None:
        state = {}
        sim.deposit_state = state
    return state


def _econ(sim):
    econ = getattr(sim, "econ", None)
    if econ is None:
        econ = {}
        sim.econ = econ
    return econ


def label(kind):
    return RESOURCE_INFO[kind][0]


def deposit_level(sim, key, slot, cap):
    """(amount, exhausted) for one deposit; untouched deposits are full."""
    entry = _state(sim).get(key * 4 + slot)
    if entry is None:
        return float(cap), False
    return entry[0], bool(entry[1])


def tile_deposits(sim, x, y):
    """Rows for one tile: kind, capacity, current amount, exhausted, regrowth share."""
    geo = world(sim)
    rows = []
    key = y * W + x
    slot = 0
    for kind, cap in geo["deposits"].get(key, []):
        amount, locked = deposit_level(sim, key, slot, cap)
        rows.append({"kind": kind, "cap": cap, "amount": amount, "locked": locked, "rate": RESOURCE_INFO[kind][2]})
        slot += 1
    return rows


# ---------------------------------------------------------------- yearly cycle
def regrow(sim):
    """Every worked deposit refills a little; exhausted ones stay locked until completely full."""
    geo = world(sim)
    state = _state(sim)
    refilled = []
    for idx in sorted(state):
        entry = state[idx]
        key = idx // 4
        slot = idx % 4
        kind, cap = geo["deposits"][key][slot]
        entry[0] = min(float(cap), entry[0] + cap * RESOURCE_INFO[kind][2])
        if entry[0] >= cap:
            if entry[1] and cap >= 100:
                refilled.append((entry[2], kind, key))
            del state[idx]
    for sid, kind, key in refilled[:2]:
        s = sim.settlements.get(sid)
        if s is not None and s.abandoned is None:
            sim.record(f"The {label(kind).lower()} near {s.name} has fully recovered and can be worked again.", "economy")


def _sites(sim, counts, blocked):
    """Which deposits each settlement works: (distance, cell, slot, kind, cap), nearest first."""
    geo = world(sim)
    comp = geo["land"]
    deposits = geo["deposits"]
    best = {}
    for s in sorted(_inhabited(sim), key=lambda x: x.id):
        r = int(min(reach(counts.get(s.id, 1)), 9.0))
        home = comp[s.gy][s.gx]
        for y in range(max(0, s.gy - r), min(H, s.gy + r + 1)):
            for x in range(max(0, s.gx - r), min(W, s.gx + r + 1)):
                key = y * W + x
                if key not in deposits or key in blocked or comp[y][x] != home:
                    continue
                d = dist(s.gx, s.gy, x, y)
                if d > r:
                    continue
                if key not in best or d < best[key][0]:
                    best[key] = (d, s.id)
    sites = {}
    for key in sorted(best):
        d, sid = best[key]
        slot = 0
        for kind, cap in deposits[key]:
            sites.setdefault(sid, []).append((d, key, slot, kind, cap))
            slot += 1
    for sid in sites:
        sites[sid] = sorted(sites[sid], key=lambda row: (row[0], row[1], row[2]))
    return sites


def _needs(sim, s, pop, country, built, projects, at_war):
    """What one settlement wants each year, in tons."""
    techs = country.technologies
    need = {}
    need["grain"] = pop * .22
    need["pasture"] = pop * .05
    need["fish"] = pop * .05
    need["game"] = pop * .03
    need["timber"] = pop * .05 + 2.0 * built + 4.0 * projects
    need["stone"] = pop * .02 + 2.0 * built + 5.0 * projects
    need["clay"] = pop * .015 + 1.0 * built + 2.0 * projects
    if "ironworking" in techs:
        need["iron"] = pop * .03 * (2.0 if at_war else 1.0)
        need["copper"] = pop * .008
        need["coal"] = pop * (.02 if "steelmaking" in techs else .008)
    elif "bronze tools" in techs:
        need["copper"] = pop * .03 * (2.0 if at_war else 1.0)
    if "gunpowder" in techs:
        need["coal"] = need.get("coal", 0.0) + pop * .01
        need["salt"] = pop * .01
    if "steam power" in techs:
        need["coal"] = need.get("coal", 0.0) + pop * .03
        need["iron"] = need.get("iron", 0.0) + pop * .01
    if "railways" in techs:
        need["iron"] = need.get("iron", 0.0) + pop * .02
    need["salt"] = need.get("salt", 0.0) + pop * .01
    need["furs"] = pop * .004
    need["gold"] = pop * (.002 if "banking" in techs else .001)
    return need


def yearly(sim):
    """Regrow, work, consume, spoil, trade and tax. Called once per simulated year."""
    from systems import state as system_state
    regrow(sim)
    counts = settlement_counts(sim)
    econ = _econ(sim)
    previous = dict(econ)
    contested = contested_cells(sim)
    sites = _sites(sim, counts, contested)
    projects = {}
    for p in getattr(sim, "projects", []):
        projects[p["settlement"]] = projects.get(p["settlement"], 0) + 1
    state = _state(sim)
    geo = world(sim)
    places = {}
    for s in sorted(_inhabited(sim), key=lambda x: x.id):
        places.setdefault(s.country, []).append(s)
    fresh = {}
    exhausted_now = []
    for cid in sorted(places):
        country = sim.countries[cid]
        st = system_state(sim, cid)
        at_war = st["at_war"]
        stock = getattr(country, "stock", None)
        if stock is None:
            stock = {}
            country.stock = stock
        for kind in KINDS:
            stock.setdefault(kind, 0.0)
        need = {}
        local = {}
        for s in places[cid]:
            built = len(getattr(s, "buildings", {}) or {})
            row = _needs(sim, s, counts.get(s.id, 1), country, built, projects.get(s.id, 0), at_war)
            local[s.id] = row
            for kind in row:
                need[kind] = need.get(kind, 0.0) + row[kind]
        # Neighbours that ran short last year give exporters a reason to dig a little deeper.
        pull = {}
        for other in st["neighbors"] + st["sea_neighbors"]:
            theirs = previous.get(other)
            if theirs is not None and tuple(sorted([cid, other])) not in sim.wars:
                for kind in theirs["deficit"]:
                    pull[kind] = pull.get(kind, 0.0) + theirs["deficit"][kind] * .5
        system = getattr(country, "economic_system", "mixed")
        quota = governments.trait(country, "quota")
        output = governments.trait(country, "output")
        skill = 1.0 + .5 * min(1.5, tech_effects(country.technologies)["prod"])  # better tools and methods yield more per ton dug
        if not getattr(country, "capacity_manual", False):
            # The land sets how many people a country can feed: yearly regrowth of its food deposits, scaled by farming skill.
            regrowth = 0.0
            for s in places[cid]:
                for d, key, slot, kind, cap in sites.get(s.id, []):
                    if kind in FOOD:
                        regrowth += cap * RESOURCE_INFO[kind][2]
            target = max(150, int(CAPACITY_SHARE * regrowth * skill / FOOD_NEED))
            residents = sum([counts.get(s.id, 0) for s in places[cid]])
            if country.capacity > 20 * target:
                country.capacity = max(target, int(residents * 1.5))
            else:
                country.capacity = max(150, int(country.capacity + (target - country.capacity) * .15))
        want = {}
        for kind in need:
            drive = 1.4
            if system == "capitalism" and kind not in FOOD:
                drive = 1.7
            if system == "communism" and kind in FOOD:
                drive = 1.6
            want[kind] = max(0.0, need[kind] * drive * quota - stock[kind] * .8) + min(pull.get(kind, 0.0), need[kind] * 1.5)
        made = {}
        worked = 0
        for s in places[cid]:
            row = local[s.id]
            mine = need_share(row, need)
            for d, key, slot, kind, cap in sites.get(s.id, []):
                goal = want.get(kind, 0.0) * mine.get(kind, 0.0)
                if goal <= .01:
                    continue
                idx = key * 4 + slot
                entry = state.get(idx)
                if entry is None:
                    entry = [float(cap), False, s.id]
                elif entry[1]:
                    continue
                effort = min(goal / (skill * output), entry[0], cap * YEARLY_SHARE)
                if effort <= 0:
                    continue
                entry[0] -= effort
                entry[2] = s.id
                gained = effort * skill * output
                want[kind] = max(0.0, want[kind] - gained)
                made[kind] = made.get(kind, 0.0) + gained
                stock[kind] += gained
                worked += 1
                if entry[0] <= .5:
                    entry[0] = 0.0
                    entry[1] = True
                    exhausted_now.append((cid, s.id, kind, cap))
                state[idx] = entry
        deficit = {}
        food_need = sum([need[k] for k in FOOD])
        food_short = food_need - sum([stock[k] for k in FOOD])
        if food_short > .5:
            for kind in FOOD:
                deficit[kind] = food_short
        for kind in MATERIALS + METALS + LUXURIES:
            short = need.get(kind, 0.0) - stock[kind]
            if short > .5:
                deficit[kind] = short
        fresh[cid] = {"need": need, "made": made, "deficit": deficit, "food_ratio": 1.0, "material_cover": 1.0,
                      "metal_cover": 1.0, "luxury_cover": 1.0, "worked": worked, "imports": {}, "exports": {},
                      "trade_income": 0.0, "trade_cost": 0.0, "gdp": 0.0, "tax": 0.0, "prices": {}, "cover": {}}
    econ.clear()
    for cid in fresh:
        econ[cid] = fresh[cid]
    for cid in sorted(econ):
        e = econ[cid]
        stock = sim.countries[cid].stock
        for kind in KINDS:
            scarcity = e["need"].get(kind, 0.0) / (e["need"].get(kind, 0.0) + stock[kind] * .7 + 1.0)
            e["prices"][kind] = RESOURCE_INFO[kind][4] * (.55 + 1.45 * scarcity)
    trade(sim)
    consume(sim)
    for cid in sorted(econ):
        e = econ[cid]
        country = sim.countries[cid]
        base = 0.0
        for kind in e["made"]:
            base += e["made"][kind] * RESOURCE_INFO[kind][4]
        e["gdp"] = base + e["trade_income"]
        system = getattr(country, "economic_system", "mixed")
        rate = .05 * governments.trait(country, "tax") * (1.15 if system == "communism" else (.9 if system == "capitalism" else 1.0))
        e["tax"] = e["gdp"] * rate
        treasury = getattr(country, "treasury", 0.0) + e["tax"] - max(0.0, getattr(country, "treasury", 0.0)) * governments.trait(country, "corruption")
        country.treasury = treasury
    for cid, sid, kind, cap in exhausted_now[:3]:
        s = sim.settlements.get(sid)
        if cap >= 100 and s is not None:
            sim.record(f"The {label(kind).lower()} deposit near {s.name} is exhausted; {sim.countries[cid].name} cannot work it until it refills.", "economy")
    sim.deposit_stats = _deposit_stats(sim)


def consume(sim):
    """People eat, workshops and forges use their share, and the rest spoils."""
    econ = _econ(sim)
    for cid in sorted(econ):
        e = econ[cid]
        country = sim.countries[cid]
        stock = country.stock
        need = e["need"]
        eaten = 0.0
        food_need = sum([need[k] for k in FOOD])
        for kind in FOOD:
            take = min(stock[kind], max(0.0, need[kind]))
            stock[kind] -= take
            eaten += take
        if eaten < food_need:
            for kind in FOOD:
                take = min(stock[kind], food_need - eaten)
                stock[kind] -= take
                eaten += take
        cover = {}
        for kind in MATERIALS + METALS + LUXURIES:
            if need.get(kind, 0.0) <= 0:
                cover[kind] = 1.0
                continue
            used = min(stock[kind], need[kind])
            stock[kind] -= used
            cover[kind] = used / need[kind]
        spoil_tech = tech_effects(country.technologies)["spoil"]  # drying, salting, canning, refrigeration
        spoil_cut = 1.0
        if need.get("salt", 0.0) > 0 and stock["salt"] > need["salt"] * .5:
            spoil_cut = .5
        for kind in KINDS:
            rate = SPOIL[kind] * ((spoil_cut * spoil_tech) if kind in FOOD else 1.0)
            stock[kind] = max(0.0, stock[kind] * (1 - rate))
        e["food_ratio"] = 1.0 if food_need <= 0 else min(1.0, eaten / food_need)
        e["material_cover"] = sum([cover[k] for k in MATERIALS]) / 3
        metal = 1.0
        if "ironworking" in country.technologies:
            metal = (cover["iron"] * 2 + cover["copper"] + cover["coal"]) / 4
        elif "bronze tools" in country.technologies:
            metal = cover["copper"]
        e["metal_cover"] = metal
        e["luxury_cover"] = (cover["gold"] + cover["furs"] + cover["salt"]) / 3
        e["cover"] = cover


def need_share(row, total):
    out = {}
    for kind in row:
        out[kind] = row[kind] / total[kind] if total.get(kind, 0.0) > 0 else 0.0
    return out


def _deposit_stats(sim):
    geo = world(sim)
    total = 0
    for key in geo["deposits"]:
        total += len(geo["deposits"][key])
    locked = len([1 for e in _state(sim).values() if e[1]])
    return {"total": total, "exhausted": locked, "worked": len(_state(sim))}


def trade(sim):
    """Peaceful neighbors swap surplus for shortage, paying at the average of their prices."""
    from systems import state as system_state
    econ = _econ(sim)
    land, sea = contacts(sim)
    flows = []
    done = set()
    notable = 0
    for a in sorted(econ):
        partners = set(land.get(a, set()))
        if "sailing" in sim.countries[a].technologies:
            partners.update(sea.get(a, set()))
        for b in sorted(partners):
            pair = (min(a, b), max(a, b))
            if b not in econ or pair in done or pair in sim.wars:
                continue
            done.add(pair)
            ca, cb = sim.countries[a], sim.countries[b]
            if "sailing" not in ca.technologies and b not in land.get(a, set()):
                continue
            left = (12.0 + 14.0 * (system_state(sim, a)["trade"] + system_state(sim, b)["trade"])) * governments.trait(ca, "trade") * governments.trait(cb, "trade")
            for seller, buyer in ((a, b), (b, a)):
                s_country, b_country = sim.countries[seller], sim.countries[buyer]
                s_econ, b_econ = econ[seller], econ[buyer]
                for kind in KINDS:
                    if left <= 0:
                        break
                    spare = s_country.stock[kind] - s_econ["need"].get(kind, 0.0) * 1.3
                    lack = b_econ["deficit"].get(kind, 0.0)
                    if spare <= .5 or lack <= .5:
                        continue
                    qty = min(spare, lack, left)
                    price = (s_econ["prices"][kind] + b_econ["prices"][kind]) / 2
                    money = max(0.0, getattr(b_country, "treasury", 0.0)) * .5
                    if price * qty > money:
                        qty = money / price
                    if qty <= .5:
                        continue
                    value = qty * price
                    s_country.stock[kind] -= qty
                    b_country.stock[kind] += qty
                    for same in (FOOD if kind in FOOD else [kind]):
                        b_econ["deficit"][same] = max(0.0, lack - qty)
                    s_country.treasury = getattr(s_country, "treasury", 0.0) + value
                    b_country.treasury = getattr(b_country, "treasury", 0.0) - value
                    s_econ["exports"][kind] = s_econ["exports"].get(kind, 0.0) + qty
                    b_econ["imports"][kind] = b_econ["imports"].get(kind, 0.0) + qty
                    s_econ["trade_income"] += value
                    b_econ["trade_cost"] += value
                    left -= qty
                    flows.append({"from": seller, "to": buyer, "kind": kind, "qty": round(qty, 1), "value": round(value, 1)})
                    if value >= 120 and notable < 2 and RESOURCE_INFO[kind][4] >= 1.8:
                        notable += 1
                        sim.record(f"Merchants carried {qty:.0f} tons of {label(kind).lower()} from {s_country.name} to {b_country.name}, earning {value:.0f} coins.", "economy")
    sim.trade_flows = flows[:40]


# ---------------------------------------------------------------- effects used elsewhere
def of(sim, cid):
    table = getattr(sim, "econ", None)
    return table.get(cid) if table is not None else None


def food_effect(sim, cid):
    e = of(sim, cid)
    if e is None:
        return 0.0
    return -40.0 * (1.0 - e["food_ratio"]) + (3.0 if e["food_ratio"] >= 1.0 else 0.0)


def materials_pace(country):
    stock = getattr(country, "stock", None)
    if stock is None:
        return 1.0
    have = stock["timber"] + stock["stone"] + stock["clay"] if "timber" in stock else 0.0
    return .35 + .65 * min(1.0, have / 30.0)


def use_materials(country, amount):
    stock = getattr(country, "stock", None)
    if stock is None:
        return
    for kind in MATERIALS:
        if kind in stock:
            stock[kind] = max(0.0, stock[kind] - amount / 3)


def damage(sim, disaster, cx, cy, radius):
    """Disasters destroy part of the deposits they strike (mines collapse, fires burn timber)."""
    geo = world(sim)
    hits = {"flood": {"grain": .35, "clay": .2, "pasture": .3},
            "storm": {"fish": .35, "timber": .15},
            "wildfire": {"timber": .5, "game": .3, "pasture": .35, "furs": .3},
            "earthquake": {"stone": .3, "iron": .3, "copper": .3, "coal": .3, "gold": .2},
            "landslide": {"stone": .3, "iron": .35, "copper": .35, "coal": .35, "gold": .25},
            "blizzard": {"game": .3, "furs": .25, "pasture": .25}}[disaster]
    state = _state(sim)
    r = int(radius * .7)
    lost = 0
    for y in range(max(0, cy - r), min(H, cy + r + 1)):
        for x in range(max(0, cx - r), min(W, cx + r + 1)):
            key = y * W + x
            if key not in geo["deposits"] or dist(cx, cy, x, y) > r:
                continue
            slot = 0
            for kind, cap in geo["deposits"][key]:
                share = hits.get(kind, 0.0)
                if share > 0:
                    idx = key * 4 + slot
                    entry = state.get(idx)
                    if entry is None:
                        entry = [float(cap), False, 0]
                    if not entry[1]:
                        entry[0] = max(0.0, entry[0] - cap * share)
                        if entry[0] <= .5:
                            entry[0] = 0.0
                            entry[1] = True
                        state[idx] = entry
                        lost += 1
                slot += 1
    return lost


# ---------------------------------------------------------------- the public budget
ADMIN = {"tribal": .5, "monarchy": 1.0, "council": .9, "republic": 1.0, "democracy": 1.2, "theocracy": 1.0, "junta": .9,
         "oligarchy": .8, "empire": 1.3, "merchant": .85, "tyranny": 1.0}


def spend(sim):
    """Governments pay for administration, standing armies, upkeep of every building, and hunger relief.
    Debts hurt: stability and prosperity fall, soldiers go unpaid, and buildings fall into ruin."""
    from systems import state as system_state
    from development import building_counts, BUILDINGS, damage_buildings
    from technology import era_index, ERA_GROUP
    for cid in sorted(sim.countries):
        country = sim.countries[cid]
        if country.ended is not None:
            continue
        st = system_state(sim, cid)
        r = st["residents"]
        fx = tech_effects(country.technologies)
        era = ERA_GROUP[era_index(country.technologies)]
        e = _econ(sim).get(cid)
        built = building_counts(sim, cid)
        upkeep = sum([BUILDINGS[k][1] * n for k, n in built.items()]) * .02
        admin = r * .6 * ADMIN.get(country.government, 1.0) * (1 + .15 * era)
        army = r * (.06 + .06 * fx["weapon"]) * (2.5 if st["at_war"] else 1.0) * governments.trait(country, "military")
        relief = 0.0
        if e is not None and e["food_ratio"] < 1.0:
            relief = r * .3 * (1.0 - e["food_ratio"])
        austerity = .8 if getattr(country, "debt_years", 0) > 0 else 1.0
        total = (admin + army + upkeep + relief) * austerity
        country.treasury = getattr(country, "treasury", 0.0) - total
        if relief > 0:
            country.food = min(100, country.food + min(5.0, relief / max(1.0, r * .1)))
        if e is not None:
            e["budget"] = {"admin": admin * austerity, "army": army * austerity, "buildings": upkeep * austerity, "relief": relief * austerity, "total": total}
        if country.treasury < 0:
            country.debt_years = getattr(country, "debt_years", 0) + 1
            country.stability = max(0, country.stability - 1.2)
            country.prosperity = max(0, country.prosperity - .5)
            if country.debt_years == 1 and r >= 200 and getattr(country, "debt_notice", -99) < sim.year - 10:
                country.debt_notice = sim.year
                sim.record(f"{country.name} ran out of money; soldiers and officials go unpaid.", "political")
            if country.debt_years >= 3:
                for s in sorted(_inhabited(sim), key=lambda x: x.id):
                    if s.country == cid and sim.rng.random() < .04:
                        damage_buildings(sim, s, .25, "Neglect")
        else:
            country.debt_years = 0
            if country.treasury > 6 * total:
                excess = (country.treasury - 6 * total) * .15
                country.treasury -= excess
                country.prosperity = min(100, country.prosperity + excess / max(1.0, r * 20))
                country.stability = min(100, country.stability + .3)


# ---------------------------------------------------------------- reports
def tile_report(sim, x, y):
    from geography import ensure_placed, cell_features, claim_owner
    ensure_placed(sim)
    geo = world(sim)
    if not (0 <= x < W and 0 <= y < H):
        return "That cell is outside the map."
    info = cell_features(sim, x, y)
    owner = claim_owner(sim, x, y, settlement_counts(sim))
    lines = [f"Cell {x},{y}: {info['terrain']}{', river' if info['river'] == '1' else ''}, soil {float(info['soil']):.2f}"
             + (f", {sim.countries[owner].name} territory" if owner else ", unclaimed")]
    tags = [FEATURE_NAMES[c] for c in info["features"]]
    if tags:
        lines.append("  features: " + ", ".join(tags))
    if (y * W + x) in contested_cells(sim):
        lines.append("  contested: fought over in an active war (cannot be worked)")
    rows = tile_deposits(sim, x, y)
    if not rows:
        lines.append("  no deposits")
    for row in rows:
        status = "EXHAUSTED, refilling; locked until full" if row["locked"] else ("full" if row["amount"] >= row["cap"] else "partly worked")
        years = int((row["cap"] - row["amount"]) / (row["cap"] * row["rate"]) + .99) if row["amount"] < row["cap"] else 0
        lines.append(f"  {label(row['kind'])}: {row['amount']:.0f}/{row['cap']} ({status}); refills {row['rate'] * 100:.1f}% of capacity per year"
                     + (f"; about {years} years to full" if years else ""))
    return "\n".join(lines)


def report(sim, query=""):
    econ = _econ(sim)
    stats = getattr(sim, "deposit_stats", None) or _deposit_stats(sim)
    lines = [f"Economy, year {sim.year}: {stats['worked']} deposits worked, {stats['exhausted']} exhausted of {stats['total']} in the world."]
    for cid in sorted(econ):
        country = sim.countries[cid]
        if country.ended is not None or (query and query not in country.name.casefold()):
            continue
        e = econ[cid]
        lines.append(f"{country.name} ({governments.info(country.government)['label']}, {getattr(country, 'economic_system', 'mixed')}): "
                     f"GDP {e['gdp']:.0f}, tax {e['tax']:.0f}, treasury {getattr(country, 'treasury', 0.0):.0f}; "
                     f"fed {e['food_ratio'] * 100:.0f}%, materials {e['material_cover'] * 100:.0f}%, metal {e['metal_cover'] * 100:.0f}%")
        if e.get("budget"):
            b = e["budget"]
            lines.append(f"  budget: administration {b['admin']:.0f}, army {b['army']:.0f}, buildings {b['buildings']:.0f}, relief {b['relief']:.0f} = {b['total']:.0f} a year")
        stock = country.stock
        lines.append("  stock: " + ", ".join([f"{label(k).lower()} {stock[k]:.0f}" for k in KINDS if stock[k] >= 1]))
        if e["imports"]:
            lines.append("  imports: " + ", ".join([f"{label(k).lower()} {v:.0f}" for k, v in e["imports"].items()]) + f" (spent {e['trade_cost']:.0f})")
        if e["exports"]:
            lines.append("  exports: " + ", ".join([f"{label(k).lower()} {v:.0f}" for k, v in e["exports"].items()]) + f" (earned {e['trade_income']:.0f})")
        short = [label(k).lower() for k in e["deficit"]]
        if short:
            lines.append("  short of: " + ", ".join(short))
    return "\n".join(lines)
