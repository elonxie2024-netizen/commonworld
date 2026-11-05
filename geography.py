"""Terrain, rivers, resources, territory, travel routes, and natural hazards.

The world is a fixed grid generated from the simulation seed with its own hash noise, so
it never consumes the main random generator. Several continents and scattered islands sit in
the sea. Settlements occupy land cells. A settlement claims land around it (its reach grows
with population); two countries border each other when their claims meet on one landmass,
and are sea neighbors when separated by water. Terrain, rivers, resources and roads shape
wars, disease travel, disasters, food, settlement sites, construction, and sea voyages.
"""

from collections import Counter

W = 120
H = 72
SEA_LEVEL = .44
SEA_RANGE = 34
CELL_COST = {"plains": 1.0, "forest": 1.6, "hills": 2.0, "mountains": 4.0, "desert": 2.0,
             "swamp": 3.0, "tundra": 2.0}
FERTILITY = {"plains": 1.15, "forest": .95, "hills": .9, "mountains": .65, "desert": .55,
             "swamp": .8, "tundra": .45, "lake": 0, "ocean": 0}
DEFENSE = {"plains": 1.0, "forest": 1.04, "hills": 1.08, "mountains": 1.15, "desert": .97,
           "swamp": 1.05, "tundra": .98, "lake": 1.0, "ocean": 1.0}
WATER = ("ocean", "lake")
# kind: (label, class, share of capacity that regrows each year, typical deposit capacity, base price)
RESOURCE_INFO = {
    "grain": ("Grain", "food", .25, 160, 1.0),
    "pasture": ("Pasture", "food", .18, 120, 1.2),
    "fish": ("Fish", "food", .14, 130, 1.1),
    "game": ("Game", "food", .10, 90, 1.3),
    "timber": ("Timber", "material", .06, 200, 1.0),
    "stone": ("Stone", "material", .02, 260, 1.1),
    "clay": ("Clay", "material", .08, 150, .9),
    "iron": ("Iron ore", "metal", .015, 180, 2.4),
    "copper": ("Copper", "metal", .015, 150, 2.2),
    "coal": ("Coal", "fuel", .012, 220, 1.8),
    "gold": ("Gold", "luxury", .01, 70, 9.0),
    "salt": ("Salt", "trade", .03, 140, 2.0),
    "furs": ("Furs", "luxury", .07, 80, 3.0),
}
FEATURE_NAMES = {"f": "floodplain", "d": "river delta", "b": "natural harbor", "o": "oasis", "s": "spring", "p": "mountain pass"}
OFFSETS = ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1))
_CACHE = {}
_HAZARDS = {}
_ROUTES = {}


def _hash(x, y, seed, salt):
    n = (x * 374761 + y * 668265 + (seed % 100003) * 2713 + salt * 9176) % 1000003
    n = (n * n + 12345) % 1000003
    n = (n * 7919 + x * 31 + y * 17) % 1000003
    return n / 1000003


def _lattice(seed, salt, scale):
    cols = int(W / scale) + 3
    rows = int(H / scale) + 3
    return [[_hash(i, j, seed, salt) for i in range(cols)] for j in range(rows)]


def _sample(lat, x, y, scale):
    gx = x / scale
    gy = y / scale
    i = int(gx)
    j = int(gy)
    fx = gx - i
    fy = gy - j
    fx = fx * fx * (3 - 2 * fx)
    fy = fy * fy * (3 - 2 * fy)
    top = lat[j][i] + (lat[j][i + 1] - lat[j][i]) * fx
    bottom = lat[j + 1][i] + (lat[j + 1][i + 1] - lat[j + 1][i]) * fx
    return top + (bottom - top) * fy


def _integral(grid):
    """Summed-area table so any rectangle can be counted in constant time."""
    table = [[0] * (W + 1)]
    for y in range(H):
        run = 0
        row = [0]
        for x in range(W):
            run += 1 if grid[y][x] else 0
            row.append(table[y][x + 1] + run)
        table.append(row)
    return table


def _count(table, x, y, r):
    x1 = max(0, x - r)
    y1 = max(0, y - r)
    x2 = min(W, x + r + 1)
    y2 = min(H, y + r + 1)
    return table[y2][x2] - table[y1][x2] - table[y2][x1] + table[y1][x1]


def _continents(seed):
    """Three large landmasses (and sometimes a smaller fourth) laid out across the map, jittered by the seed."""
    slots = [(31, 35, 18, 22), (89, 17, 13, 16), (86, 57, 13, 16), (57, 62, 9, 11)]
    out = []
    for i in range(4):
        if i == 3 and _hash(2, 2, seed, 62) < .5:
            continue
        cx = slots[i][0] + (_hash(i, 1, seed, 63) - .5) * 8
        cy = slots[i][1] + (_hash(i, 2, seed, 64) - .5) * 5
        out.append((cx, cy, slots[i][2] + _hash(i, 3, seed, 65) * (slots[i][3] - slots[i][2])))
    return out


DIRECTIONS = ((1, 0), (.92, .38), (.71, .71), (.38, .92), (0, 1), (-.38, .92), (-.71, .71), (-.92, .38),
              (-1, 0), (-.92, -.38), (-.71, -.71), (-.38, -.92), (0, -1), (.38, -.92), (.71, -.71), (.92, -.38))


def _satellites(seed, continents):
    """Lobes around each continent's core, giving it peninsulas, bays and an irregular coast."""
    lobes = []
    for i in range(len(continents)):
        cx, cy, r = continents[i]
        for j in range(5 + int(_hash(i, 20, seed, 91) * 3)):
            dx, dy = DIRECTIONS[int(_hash(i * 10 + j, 21, seed, 92) * 16) % 16]
            off = r * (.55 + .45 * _hash(i * 10 + j, 22, seed, 93))
            lobes.append((max(6.0, min(W - 6.0, cx + dx * off)), max(6.0, min(H - 6.0, cy + dy * off)),
                          r * (.38 + .27 * _hash(i * 10 + j, 23, seed, 94))))
    return lobes


def _sea_room(x, y, continents):
    """How many cells of open sea lie between a point and the nearest continent's coast."""
    room = 999.0
    for cx, cy, r in continents:
        edge = ((x - cx) ** 2 + (y - cy) ** 2) ** .5 - r * .85
        if edge < room:
            room = edge
    return room


def _archipelagos(seed, continents):
    """Chains of islands out in the open sea, kept clear of the continents."""
    islands = []
    centers = []
    for a in range(80):
        if len(centers) >= 5:
            break
        cx = 8 + _hash(a, 1, seed, 71) * (W - 16)
        cy = 6 + _hash(a, 2, seed, 72) * (H - 12)
        if _sea_room(cx, cy, continents) < 9:
            continue
        ok = True
        for ox, oy in centers:
            if ((cx - ox) ** 2 + (cy - oy) ** 2) ** .5 < 22:
                ok = False
        if not ok:
            continue
        centers.append((cx, cy))
        for j in range(5 + int(_hash(a, 3, seed, 73) * 4)):
            ix = cx + (_hash(a * 10 + j, 4, seed, 74) - .5) * 20
            iy = cy + (_hash(a * 10 + j, 5, seed, 75) - .5) * 10
            ir = 3.6 + _hash(a * 10 + j, 6, seed, 76) * 4.0
            if _sea_room(ix, iy, continents) >= ir + 2:
                islands.append((ix, iy, ir))
    return islands


def _layout_deposits(rows, river, soil, feat, near_water, seed):
    """Which resources lie in which tile, and how rich each deposit is (up to three per tile)."""
    out = {}
    for y in range(H):
        for x in range(W):
            t = rows[y][x]
            if t in WATER:
                continue
            tile_soil = soil[y][x]
            f = feat[y][x]
            by_river = _near_flag(river, x, y, 1)
            rolls = []
            if t == "plains":
                rolls = [("grain", .35 + .35 * tile_soil), ("pasture", .28), ("clay", .14 if by_river else .03), ("game", .06)]
            elif t == "forest":
                rolls = [("timber", .78), ("game", .38), ("furs", .12), ("pasture", .05)]
            elif t == "hills":
                rolls = [("stone", .5), ("pasture", .25), ("iron", .17), ("copper", .15), ("coal", .08), ("game", .08)]
            elif t == "mountains":
                rolls = [("stone", .6), ("iron", .25), ("copper", .19), ("coal", .16), ("gold", .075)]
            elif t == "desert":
                rolls = [("salt", .14), ("stone", .18), ("copper", .07), ("gold", .03)]
            elif t == "swamp":
                rolls = [("clay", .5), ("timber", .25), ("game", .2), ("fish", .2)]
            elif t == "tundra":
                rolls = [("furs", .35), ("game", .3), ("coal", .08), ("stone", .1)]
            if near_water[y][x]:
                rolls.append(("fish", .5))
                rolls.append(("salt", .09))
            elif by_river:
                rolls.append(("fish", .3))
            chosen = []
            kinds = []
            for i in range(len(rolls)):
                kind, chance = rolls[i]
                if len(chosen) >= 3:
                    break
                if kind not in kinds and _hash(x, y, seed, 100 + i) < chance:
                    cap = RESOURCE_INFO[kind][3] * (.55 + .9 * _hash(x, y, seed, 200 + i))
                    if kind == "grain":
                        cap = cap * (.6 + .8 * tile_soil) * (1.3 if "f" in f else 1.0)
                    if kind == "fish" and "d" in f:
                        cap = cap * 1.3
                    kinds.append(kind)
                    chosen.append((kind, int(cap)))
            if chosen:
                out[y * W + x] = chosen
    return out


def _build(seed):
    l1 = _lattice(seed, 1, 30)
    l2 = _lattice(seed, 2, 15)
    l3 = _lattice(seed, 3, 8)
    l4 = _lattice(seed, 12, 4)
    warp_x = _lattice(seed, 9, 20)
    warp_y = _lattice(seed, 10, 20)
    ridge = _lattice(seed, 6, 22)
    wet1 = _lattice(seed, 4, 24)
    wet2 = _lattice(seed, 5, 9)
    heat = _lattice(seed, 7, 18)
    continents = _continents(seed)
    lobes = _satellites(seed, continents)
    islands = _archipelagos(seed, continents + lobes)
    gulfs = []
    for i in range(len(continents)):
        cx, cy, r = continents[i]
        if r > 17:
            gulfs.append((cx + (_hash(i, 7, seed, 81) - .5) * r * .9, cy + (_hash(i, 8, seed, 82) - .5) * r * .9,
                          3.5 + _hash(i, 9, seed, 83) * 4.5))
    elev = []
    for y in range(H):
        row = []
        for x in range(W):
            wx = x + (_sample(warp_x, x, y, 20) - .5) * 14 + (_sample(l4, x, y, 4) - .5) * 4
            wy = y + (_sample(warp_y, x, y, 20) - .5) * 14 + (_sample(l3, x, y, 8) - .5) * 4
            field = 0.0
            for cx, cy, r in continents + lobes:
                d = ((wx - cx) ** 2 + (wy - cy) ** 2) ** .5 / r
                if d < 1 and 1 - d * d > field:
                    field = 1 - d * d
            for cx, cy, r in islands:
                d = ((wx - cx) ** 2 + (wy - cy) ** 2) ** .5 / r
                if d < 1 and (1 - d * d) * .95 > field:
                    field = (1 - d * d) * .95
            for cx, cy, r in gulfs:
                d = ((wx - cx) ** 2 + (wy - cy) ** 2) ** .5 / r
                if d < 1:
                    field -= (1 - d * d) * .75
            if field < 0:
                field = 0.0
            fbm = .4 * _sample(l1, x, y, 30) + .3 * _sample(l2, x, y, 15) + .2 * _sample(l3, x, y, 8) + .1 * _sample(l4, x, y, 4)
            spine = 1 - abs(2 * _sample(ridge, x, y, 22) - 1)
            row.append(.44 * field + .56 * fbm - .02 + max(0, field - .5) * spine * spine * .25 + max(0, field - .3) * spine ** 3 * .45)
        elev.append(row)
    # Water connected to the map edge is ocean; enclosed water is a lake.
    sea = [[elev[y][x] < SEA_LEVEL for x in range(W)] for y in range(H)]
    reached = [[False] * W for _ in range(H)]
    stack = []
    for x in range(W):
        for y in (0, H - 1):
            if sea[y][x] and not reached[y][x]:
                reached[y][x] = True
                stack.append((x, y))
    for y in range(H):
        for x in (0, W - 1):
            if sea[y][x] and not reached[y][x]:
                reached[y][x] = True
                stack.append((x, y))
    while stack:
        cx, cy = stack.pop()
        for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
            if 0 <= nx < W and 0 <= ny < H and sea[ny][nx] and not reached[ny][nx]:
                reached[ny][nx] = True
                stack.append((nx, ny))
    # Distance to the nearest water: coasts are wet, continental interiors are dry.
    water_dist = [[-1] * W for _ in range(H)]
    frontier = []
    for y in range(H):
        for x in range(W):
            if sea[y][x]:
                water_dist[y][x] = 0
                frontier.append((x, y))
    while frontier:
        following = []
        for cx, cy in frontier:
            for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                if 0 <= nx < W and 0 <= ny < H and water_dist[ny][nx] < 0:
                    water_dist[ny][nx] = water_dist[cy][cx] + 1
                    following.append((nx, ny))
        frontier = following
    rows = []
    temps = []
    wets = []
    for y in range(H):
        row = []
        trow = []
        wrow = []
        latitude = abs(y - H / 2 + .5) / (H / 2)
        for x in range(W):
            e = elev[y][x]
            temp = 1.05 - latitude * .9 - max(0, e - .62) * 1.2 + (_sample(heat, x, y, 18) - .5) * .35
            wet = .34 * _sample(wet1, x, y, 24) + .14 * _sample(wet2, x, y, 9) + .52 * max(0.0, 1 - water_dist[y][x] / 12)
            trow.append(temp)
            wrow.append(wet)
            if sea[y][x]:
                row.append("ocean" if reached[y][x] else "lake")
            elif e > .84:
                row.append("mountains")
            elif e > .72:
                row.append("hills")
            elif temp < .26:
                row.append("tundra")
            elif wet < .30 and temp > .42:
                row.append("desert")
            elif wet > .72 and e < .56:
                row.append("swamp")
            elif wet > .58:
                row.append("forest")
            else:
                row.append("plains")
        rows.append(row)
        temps.append(trow)
        wets.append(wrow)
    slope = []
    for y in range(H):
        srow = []
        for x in range(W):
            e = elev[y][x]
            top = 0.0
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < W and 0 <= ny < H:
                    d = abs(elev[ny][nx] - e)
                    if d > top:
                        top = d
            srow.append(top)
        slope.append(srow)
    # Rivers rise in the highlands and run downhill to the sea or a lake.
    river = [[False] * W for _ in range(H)]
    for y in range(H):
        for x in range(W):
            if rows[y][x] in ("hills", "mountains") and elev[y][x] > .72 and _hash(x, y, seed, 11) < .035:
                cx = x
                cy = y
                for _ in range(180):
                    river[cy][cx] = True
                    best = None
                    lowest = elev[cy][cx]
                    for nx, ny in OFFSETS:
                        nx += cx
                        ny += cy
                        if 0 <= nx < W and 0 <= ny < H:
                            level = elev[ny][nx] - _hash(nx, ny, seed, 12) * .004
                            if level < lowest:
                                lowest = level
                                best = (nx, ny)
                    if best is None:
                        break
                    cx, cy = best
                    if rows[cy][cx] in WATER or river[cy][cx]:
                        break
    comp = [[0] * W for _ in range(H)]
    sizes = {}
    count = 0
    for y in range(H):
        for x in range(W):
            if rows[y][x] in WATER or comp[y][x]:
                continue
            count += 1
            comp[y][x] = count
            total = 1
            stack = [(x, y)]
            while stack:
                cx, cy = stack.pop()
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < W and 0 <= ny < H and rows[ny][nx] not in WATER and not comp[ny][nx]:
                        comp[ny][nx] = count
                        total += 1
                        stack.append((nx, ny))
            sizes[count] = total
    # Soil quality, then tile features (floodplains, deltas, natural harbors, oases, springs, passes).
    soil = []
    feat = []
    near_water = [[_near_water(rows, x, y, 1) for x in range(W)] for y in range(H)]
    adjust = {"plains": .2, "forest": .05, "swamp": .1, "hills": -.1, "mountains": -.25, "desert": -.3, "tundra": -.25}
    for y in range(H):
        srow = []
        frow = []
        for x in range(W):
            t = rows[y][x]
            if t in WATER:
                srow.append(0.0)
                frow.append("")
                continue
            by_river = _near_flag(river, x, y, 1)
            srow.append(max(0.0, min(1.0, .25 + wets[y][x] * .5 + (.25 if by_river else 0) + adjust[t])))
            tags = ""
            h = _hash(x, y, seed, 31)
            water8 = 0
            mountains8 = 0
            for dx, dy in OFFSETS:
                nx = x + dx
                ny = y + dy
                if 0 <= nx < W and 0 <= ny < H:
                    if rows[ny][nx] in WATER:
                        water8 += 1
                    if rows[ny][nx] == "mountains":
                        mountains8 += 1
            if t in ("plains", "swamp") and by_river and h < .75:
                tags += "f"
            if river[y][x] and water8 > 0:
                tags += "d"
            if water8 in (3, 4, 5) and h > .45:
                tags += "b"
            if t == "desert" and (by_river or h < .05):
                tags += "o"
            if t in ("hills", "mountains") and _hash(x, y, seed, 32) < .045:
                tags += "s"
            if t == "hills" and mountains8 >= 3:
                tags += "p"
            frow.append(tags)
        soil.append(srow)
        feat.append(frow)
    deposits = _layout_deposits(rows, river, soil, feat, near_water, seed)
    hz = {
        "forest": _integral([[rows[y][x] == "forest" for x in range(W)] for y in range(H)]),
        "wild": _integral([[rows[y][x] in ("forest", "desert") for x in range(W)] for y in range(H)]),
        "high": _integral([[rows[y][x] in ("hills", "mountains") for x in range(W)] for y in range(H)]),
        "river": _integral(river),
        "lake": _integral([[rows[y][x] == "lake" for x in range(W)] for y in range(H)]),
        "ocean": _integral([[rows[y][x] == "ocean" for x in range(W)] for y in range(H)]),
    }
    return {"terrain": rows, "land": comp, "elev": elev, "river": river, "deposits": deposits, "soil": soil,
            "feat": feat, "wet": wets, "slope": slope, "temp": temps, "size": sizes, "hz": hz}


def _near_flag(grid, x, y, r):
    for yy in range(max(0, y - r), min(H, y + r + 1)):
        for xx in range(max(0, x - r), min(W, x + r + 1)):
            if grid[yy][xx]:
                return True
    return False


def _near_water(rows, x, y, r):
    for yy in range(max(0, y - r), min(H, y + r + 1)):
        for xx in range(max(0, x - r), min(W, x + r + 1)):
            if rows[yy][xx] in WATER:
                return True
    return False


def world(sim):
    seed = getattr(sim, "geo_seed", 0)
    if seed not in _CACHE:
        _CACHE[seed] = _build(seed)
    return _CACHE[seed]


def _placed(settlement):
    return getattr(settlement, "gx", None) is not None


def dist(ax, ay, bx, by):
    return ((ax - bx) ** 2 + (ay - by) ** 2) ** .5


def reach(population):
    """How far (in cells) a settlement's claim extends."""
    return min(16.0, 4.0 + population ** .5 * .55)


def settlement_counts(sim):
    return Counter(p.settlement for p in sim.people.values())


def _inhabited(sim):
    ensure_placed(sim)
    return [s for s in sim.settlements.values() if s.abandoned is None
            and sim.countries[s.country].ended is None]


def claims_list(sim, counts):
    """(country, x, y, reach, landmass) for every inhabited settlement."""
    comp = world(sim)["land"]
    return [(s.country, s.gx, s.gy, reach(counts.get(s.id, 1)), comp[s.gy][s.gx]) for s in _inhabited(sim)]


def cell_features(sim, x, y):
    """Resources, river and coast information for one cell."""
    geo = world(sim)
    return {"terrain": geo["terrain"][y][x], "river": geo["river"][y][x],
            "deposits": geo["deposits"].get(y * W + x, []), "features": geo["feat"][y][x],
            "soil": geo["soil"][y][x], "coastal": _near_water(geo["terrain"], x, y, 1)}


def resources_near(sim, x, y, r):
    geo = world(sim)
    found = Counter()
    for yy in range(max(0, y - r), min(H, y + r + 1)):
        for xx in range(max(0, x - r), min(W, x + r + 1)):
            for kind, cap in geo["deposits"].get(yy * W + xx, []):
                found[kind] += 1
    return found


def hazards_at(sim, x, y):
    """Relative risk (about 0..4) of each natural disaster at a cell, from geography alone."""
    geo = world(sim)
    seed = getattr(sim, "geo_seed", 0)
    key = (seed, x, y)
    if key in _HAZARDS:
        return _HAZARDS[key]
    rows = geo["terrain"]
    hz = geo["hz"]
    here = rows[y][x]
    e = geo["elev"][y][x]
    window = (min(W, x + 4) - max(0, x - 3)) * (min(H, y + 4) - max(0, y - 3))
    forest = _count(hz["forest"], x, y, 3)
    wild = _count(hz["wild"], x, y, 3)
    highland = _count(hz["high"], x, y, 3)
    river = 1 if _count(hz["river"], x, y, 1) else 0
    lake = 1 if _count(hz["lake"], x, y, 1) else 0
    ocean = 1 if _count(hz["ocean"], x, y, 2) else 0
    coast = 1 if ocean or lake else 0
    slope = geo["slope"][y][x]
    cold = max(0, .4 - geo["temp"][y][x])
    result = {
        "flood": .2 + 1.7 * river + 1.0 * lake + (.9 if coast and e < .55 else 0) + (1.1 if here == "swamp" else 0) - (.9 if e > .64 else 0),
        "storm": .15 + 1.9 * ocean + .4 * coast + (.5 if here == "plains" else 0) - (.4 if here == "forest" else 0),
        "wildfire": .1 + 2.2 * forest / window + (1.6 if here == "desert" else 0) + .9 * wild / window,
        "earthquake": .08 + 2.6 * highland / window + 5.0 * slope,
        "landslide": .03 + 6.0 * slope * (1 if here in ("hills", "mountains") else .3),
        "blizzard": .02 + 4.0 * cold + (.7 if here == "mountains" else 0),
    }
    for kind in result:
        result[kind] = max(.02, result[kind])
    _HAZARDS[key] = result
    return result


def site_quality(sim, x, y):
    """How good a place is to settle, from terrain, water, resources, and hazards."""
    geo = world(sim)
    t = geo["terrain"][y][x]
    if t in WATER or t == "mountains":
        return -50.0
    score = FERTILITY[t] * 2.0
    if _count(geo["hz"]["river"], x, y, 1):
        score += .8
    if _near_water(geo["terrain"], x, y, 1):
        score += .35
    values = {"grain": .35, "pasture": .2, "fish": .25, "game": .12, "timber": .15, "stone": .12, "clay": .08,
              "iron": .2, "copper": .15, "coal": .1, "gold": .25, "salt": .12, "furs": .1}
    for kind, n in resources_near(sim, x, y, 2).items():
        score += min(n, 2) * values[kind]
    tags = geo["feat"][y][x]
    score += (.5 if "f" in tags else 0) + (.4 if "b" in tags else 0) + (.3 if "o" in tags else 0) + (.15 if "s" in tags else 0)
    risk = hazards_at(sim, x, y)
    score -= (risk["flood"] + risk["earthquake"] + risk["wildfire"] + risk["landslide"]) * .12
    return score


def claim_owner(sim, x, y, counts, exclude=None):
    """Country whose settlement claims a cell, or 0."""
    comp = world(sim)["land"]
    land = comp[y][x]
    best = 0
    best_dist = 999.0
    for s in _inhabited(sim):
        if exclude is not None and s.id == exclude:
            continue
        if comp[s.gy][s.gx] != land:
            continue
        d = dist(s.gx, s.gy, x, y)
        if d <= reach(counts.get(s.id, 1)) and d < best_dist:
            best_dist = d
            best = s.country
    return best


def place_settlement(sim, settlement, cell=None, anchor=None):
    """Put a settlement on the map: at the given cell, near its country, or in fresh land."""
    geo = world(sim)
    comp = geo["land"]
    sizes = geo["size"]
    seed = getattr(sim, "geo_seed", 0)
    if cell is not None:
        settlement.gx = cell[0]
        settlement.gy = cell[1]
        return
    others = [s for s in sim.settlements.values() if s is not settlement and _placed(s)]
    mine = [s for s in others if s.country == settlement.country]
    taken = {(s.gx, s.gy) for s in others}
    claims = claims_list(sim, settlement_counts(sim)) if (anchor is not None and not mine) else []
    candidates = {}
    if anchor is not None and not mine:
        for y in range(max(1, anchor[1] - 24), min(H - 1, anchor[1] + 25), 2):
            for x in range(max(1, anchor[0] - 24), min(W - 1, anchor[0] + 25), 2):
                candidates[(x, y)] = 1
    elif mine:
        for s in mine:
            for y in range(max(0, s.gy - 14), min(H, s.gy + 15), 2):
                for x in range(max(0, s.gx - 14), min(W, s.gx + 15), 2):
                    candidates[(x, y)] = 1
    else:
        for y in range(2, H - 1, 4):
            for x in range(2, W - 1, 4):
                candidates[(x, y)] = 1
    home = comp[mine[0].gy][mine[0].gx] if mine else (comp[anchor[1]][anchor[0]] if anchor is not None else None)
    occupied = {comp[s.gy][s.gx] for s in others}
    best = None
    best_score = -1000000.0
    for key in sorted(candidates):
        x, y = key
        land = comp[y][x]
        if key in taken or land == 0:
            continue
        if home is not None and land != home:
            continue
        if home is None and sizes[land] < 220:
            continue
        score = site_quality(sim, x, y) + _hash(x, y, seed, 9) * .8
        if score < -20:
            continue
        nearest = 99.0
        for s in others:
            d = dist(s.gx, s.gy, x, y)
            if d < nearest:
                nearest = d
        if nearest < 4:
            score -= 8
        if mine:
            close = min([dist(s.gx, s.gy, x, y) for s in mine])
            score -= abs(close - 8) * .3
        elif anchor is not None:
            for owner, sx, sy, r, other_land in claims:
                if other_land == land and dist(sx, sy, x, y) <= r:
                    score -= 20
                    break
            score -= abs(nearest - 11) * .25 + dist(x, y, anchor[0], anchor[1]) * .05
        else:
            score -= abs(min(nearest, 60) - 26) * .08
            if land not in occupied:
                score += 3.0  # each country starts on a landmass of its own when there are enough
        if score > best_score:
            best_score = score
            best = (x, y)
    if best is None:
        best = (W // 2, H // 2)
    settlement.gx = best[0]
    settlement.gy = best[1]


def ensure_placed(sim):
    for settlement in sorted(sim.settlements.values(), key=lambda s: s.id):
        if not _placed(settlement):
            place_settlement(sim, settlement)


def terrain_of(sim, settlement):
    ensure_placed(sim)
    return world(sim)["terrain"][settlement.gy][settlement.gx]


def is_coastal(sim, settlement):
    ensure_placed(sim)
    return _near_water(world(sim)["terrain"], settlement.gx, settlement.gy, 1)


def on_river(sim, settlement):
    ensure_placed(sim)
    return _near_flag(world(sim)["river"], settlement.gx, settlement.gy, 1)


def describe(sim, settlement):
    terrain = terrain_of(sim, settlement)
    words = ["coastal" if is_coastal(sim, settlement) else "inland"]
    if on_river(sim, settlement):
        words.append("riverside")
    return " ".join(words) + " " + terrain


def neighbors(sim):
    """Return (land, sea): each maps country id -> set of country ids."""
    comp = world(sim)["land"]
    places = _inhabited(sim)
    counts = settlement_counts(sim)
    land = {}
    sea = {}
    for i in range(len(places)):
        a = places[i]
        for j in range(i + 1, len(places)):
            b = places[j]
            if a.country == b.country:
                continue
            d = dist(a.gx, a.gy, b.gx, b.gy)
            if comp[a.gy][a.gx] == comp[b.gy][b.gx]:
                target = land if d <= reach(counts.get(a.id, 1)) + reach(counts.get(b.id, 1)) + 2 else None
            else:
                target = sea if d <= SEA_RANGE else None
            if target is not None:
                target.setdefault(a.country, set()).add(b.country)
                target.setdefault(b.country, set()).add(a.country)
    return land, sea


def contacts(sim, store=True):
    """Neighbor map cached for the current year (invalidated by edits). store=False never changes the simulation."""
    cache = getattr(sim, "contact_cache", None)
    if cache is None or cache.get("year") != sim.year:
        land, sea = neighbors(sim)
        cache = {"year": sim.year, "land": land, "sea": sea}
        if store:
            sim.contact_cache = cache
    return cache["land"], cache["sea"]


def profile(sim, cid):
    """Terrain shares across a country's inhabited settlements, plus an adjusted fertility."""
    places = [s for s in _inhabited(sim) if s.country == cid]
    empty = {"fertility": 1.0, "coastal": 0.0, "mountain": 0.0, "forest": 0.0, "dry": 0.0,
             "river": 0.0, "swamp": 0.0, "cold": 0.0}
    if not places:
        return empty
    geo = world(sim)
    rows = geo["terrain"]
    n = len(places)
    kinds = [rows[s.gy][s.gx] for s in places]
    coastal = sum([_near_water(rows, s.gx, s.gy, 1) for s in places]) / n
    rivers = sum([_near_flag(geo["river"], s.gx, s.gy, 1) for s in places]) / n
    techs = sim.countries[cid].technologies
    farming = len(techs & {"irrigation", "crop rotation", "watermills"})
    total = 0.0
    for k, s in zip(kinds, places):
        value = FERTILITY[k]
        if k in ("desert", "hills", "tundra", "mountains"):
            value += .07 * farming
        if _near_flag(geo["river"], s.gx, s.gy, 1):
            value += .22
        total += value
    return {"fertility": total / n + .1 * coastal, "coastal": coastal,
            "mountain": sum([k in ("mountains", "hills") for k in kinds]) / n,
            "forest": sum([k == "forest" for k in kinds]) / n,
            "dry": sum([k == "desert" for k in kinds]) / n,
            "river": rivers, "swamp": sum([k == "swamp" for k in kinds]) / n,
            "cold": sum([k == "tundra" for k in kinds]) / n}


def defense(sim, cid):
    places = [s for s in _inhabited(sim) if s.country == cid]
    if not places:
        return 1.0
    rows = world(sim)["terrain"]
    return sum([DEFENSE[rows[s.gy][s.gx]] for s in places]) / len(places)


def distance_to_country(sim, place, cid):
    """Distance from a settlement to the nearest inhabited settlement of a country."""
    ensure_placed(sim)
    best = 999.0
    for s in _inhabited(sim):
        if s.country == cid:
            d = dist(s.gx, s.gy, place.gx, place.gy)
            if d < best:
                best = d
    return best


def step_cost(sim, x, y, nx, ny):
    geo = world(sim)
    t = geo["terrain"][ny][nx]
    if t in WATER:
        return None
    road = getattr(sim, "roads", {})
    cost = CELL_COST[t]
    if (ny * W + nx) in road:
        cost = min(cost, .5)
    elif geo["river"][ny][nx] and not geo["river"][y][x]:
        cost += 1.5
    if nx != x and ny != y:
        cost *= 1.41
    return cost


def _search(sim, start, goal, sea):
    """Bucketed A* over land cells, or over ocean cells when sea is true."""
    geo = world(sim)
    terrain = geo["terrain"]
    river = geo["river"]
    roads = {} if sea else getattr(sim, "roads", {})
    gx = goal[0]
    gy = goal[1]
    best = {start[1] * W + start[0]: 0.0}
    prev = {}
    buckets = {0: [(0.0, start[0], start[1])]}
    level = 0
    expanded = 0
    limit = 9000 if sea else 6000
    while level <= 2400:
        queue = buckets.get(level)
        if not queue:
            level += 1
            continue
        index = 0
        while index < len(queue):
            g, x, y = queue[index]
            index += 1
            key = y * W + x
            if g > best[key] + .0001:
                continue
            if x == gx and y == gy:
                cells = [(x, y)]
                while key in prev:
                    key = prev[key]
                    cells.append((key % W, key // W))
                cells = list(reversed(cells))
                return cells, g
            expanded += 1
            if expanded > limit:
                return None
            for dx, dy in OFFSETS:
                nx = x + dx
                ny = y + dy
                if nx < 0 or ny < 0 or nx >= W or ny >= H:
                    continue
                t = terrain[ny][nx]
                nkey = ny * W + nx
                if sea:
                    if t != "ocean":
                        continue
                    cost = 1.0
                else:
                    if t == "ocean" or t == "lake":
                        continue
                    cost = CELL_COST[t]
                    if nkey in roads:
                        cost = .5
                    elif river[ny][nx] and not river[y][x]:
                        cost += 1.5
                if dx != 0 and dy != 0:
                    cost *= 1.41
                ng = g + cost
                old = best.get(nkey)
                if old is None or ng < old - .0001:
                    best[nkey] = ng
                    prev[nkey] = key
                    slot = int((ng + ((nx - gx) ** 2 + (ny - gy) ** 2) ** .5 * .8) * 2)
                    if slot < level:
                        slot = level
                    buckets.setdefault(slot, []).append((ng, nx, ny))
        buckets[level] = []
        level += 1
    return None


def find_path(sim, start, goal):
    """Cheapest overland route between two cells, or None. Returns (cells, total cost)."""
    comp = world(sim)["land"]
    if comp[start[1]][start[0]] != comp[goal[1]][goal[0]] or comp[start[1]][start[0]] == 0:
        return None
    return _search(sim, start, goal, False)


def coast_cell(sim, x, y):
    """An ocean cell touching a land cell, or None."""
    rows = world(sim)["terrain"]
    for dx, dy in OFFSETS:
        nx = x + dx
        ny = y + dy
        if 0 <= nx < W and 0 <= ny < H and rows[ny][nx] == "ocean":
            return (nx, ny)
    return None


def find_sea_route(sim, a, b):
    """A boat's route from one coastal cell to another: land, open water, land. Returns (cells, cost) or None."""
    start = coast_cell(sim, a[0], a[1])
    goal = coast_cell(sim, b[0], b[1])
    if start is None or goal is None:
        return None
    found = _search(sim, start, goal, True)
    if found is None:
        return None
    cells, cost = found
    return [(a[0], a[1])] + cells + [(b[0], b[1])], cost + 2.0


def cached_route(sim, a, b, sea=False):
    """find_path / find_sea_route with a memo, for trade and war routes that repeat."""
    roads = getattr(sim, "roads", {})
    key = (getattr(sim, "geo_seed", 0), a, b, sea, len(roads), sum([k for k in roads]))
    if key not in _ROUTES:
        if len(_ROUTES) > 300:
            _ROUTES.clear()
        _ROUTES[key] = find_sea_route(sim, a, b) if sea else find_path(sim, a, b)
    return _ROUTES[key]


def contested_cells(sim):
    """Land cells claimed by both sides of an active war, as {cell key: (country a, country b)}."""
    cells = {}
    if not sim.wars:
        return cells
    comp = world(sim)["land"]
    counts = settlement_counts(sim)
    places = _inhabited(sim)
    for pair in sorted(sim.wars):
        for x in places:
            if x.country != pair[0]:
                continue
            rx = reach(counts.get(x.id, 1)) + 2
            land = comp[x.gy][x.gx]
            for y in places:
                if y.country != pair[1] or comp[y.gy][y.gx] != land:
                    continue
                ry = reach(counts.get(y.id, 1)) + 2
                if dist(x.gx, x.gy, y.gx, y.gy) > rx + ry:
                    continue
                for cy in range(max(0, int(y.gy - ry)), min(H, int(y.gy + ry) + 2)):
                    for cx in range(max(0, int(y.gx - ry)), min(W, int(y.gx + ry) + 2)):
                        if comp[cy][cx] == land and dist(cx, cy, x.gx, x.gy) <= rx and dist(cx, cy, y.gx, y.gy) <= ry:
                            cells[cy * W + cx] = pair
    return cells


def report(sim, query=""):
    land, sea = contacts(sim)
    comp = world(sim)["land"]
    sizes = world(sim)["size"]
    big = len([k for k in sizes if sizes[k] >= 150])
    lines = ["Geography: terrain, rivers, resources and roads shape food, hazards, disease, travel and battles; borders decide who can fight.",
             f"The world is {W}x{H} cells with {big} large landmasses and {len(sizes) - big} smaller islands. A settlement claims land out to its reach (4 cells plus population-based growth); "
             f"claims that meet are land borders. Sea neighbors lie within {SEA_RANGE} cells across water."]
    for cid in sorted(sim.countries):
        country = sim.countries[cid]
        if country.ended is not None or (query and query not in country.name.casefold()):
            continue
        p = profile(sim, cid)
        by_land = ", ".join(sorted([sim.countries[n].name for n in land.get(cid, set())])) or "none"
        by_sea = ", ".join(sorted([sim.countries[n].name for n in sea.get(cid, set())])) or "none"
        lines.append(f"{country.name}: borders {by_land}; sea neighbors {by_sea}")
        lines.append(f"  fertility {p['fertility']:.2f}; coastal {p['coastal']:.0%}; river {p['river']:.0%}; highland {p['mountain']:.0%}; "
                     f"forest {p['forest']:.0%}; desert {p['dry']:.0%}; swamp {p['swamp']:.0%}; defensive terrain x{defense(sim, cid):.2f}")
    return "\n".join(lines)
