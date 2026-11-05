/**
 * Terrain, rivers, resources, territory, travel routes, and natural hazards.
 *
 * The world is a fixed grid generated from the simulation seed with its own hash noise, so
 * it never consumes the main random generator. Several continents and scattered islands sit in
 * the sea. Settlements occupy land cells. A settlement claims land around it (its reach grows
 * with population); two countries border each other when their claims meet on one landmass,
 * and are sea neighbors when separated by water. Terrain, rivers, resources and roads shape
 * wars, disease travel, disasters, food, settlement sites, construction, and sea voyages.
 */

import {Counter, TupleMap, TupleSet, fixed, format, getOr, intersection, range, setdefault, sorted, str, sum, zip} from './runtime.js';

export const W = 120;
export const H = 72;
export const SEA_LEVEL = .44;
export const SEA_RANGE = 34;
export const CELL_COST = new Map([
  ['plains', 1],
  ['forest', 1.6],
  ['hills', 2],
  ['mountains', 4],
  ['desert', 2],
  ['swamp', 3],
  ['tundra', 2]
]);
export const FERTILITY = new Map([
  ['plains', 1.15],
  ['forest', .95],
  ['hills', .9],
  ['mountains', .65],
  ['desert', .55],
  ['swamp', .8],
  ['tundra', .45],
  ['lake', 0],
  ['ocean', 0]
]);
export const DEFENSE = new Map([
  ['plains', 1],
  ['forest', 1.04],
  ['hills', 1.08],
  ['mountains', 1.15],
  ['desert', .97],
  ['swamp', 1.05],
  ['tundra', .98],
  ['lake', 1],
  ['ocean', 1]
]);
export const WATER = ['ocean', 'lake'];
// kind: (label, class, share of capacity that regrows each year, typical deposit capacity, base price)
export const RESOURCE_INFO = new Map([
  ['grain', ['Grain', 'food', .25, 160, 1]],
  ['pasture', ['Pasture', 'food', .18, 120, 1.2]],
  ['fish', ['Fish', 'food', .14, 130, 1.1]],
  ['game', ['Game', 'food', .10, 90, 1.3]],
  ['timber', ['Timber', 'material', .06, 200, 1]],
  ['stone', ['Stone', 'material', .02, 260, 1.1]],
  ['clay', ['Clay', 'material', .08, 150, .9]],
  ['iron', ['Iron ore', 'metal', .015, 180, 2.4]],
  ['copper', ['Copper', 'metal', .015, 150, 2.2]],
  ['coal', ['Coal', 'fuel', .012, 220, 1.8]],
  ['gold', ['Gold', 'luxury', .01, 70, 9]],
  ['salt', ['Salt', 'trade', .03, 140, 2]],
  ['furs', ['Furs', 'luxury', .07, 80, 3]]
]);
export const FEATURE_NAMES = new Map([
  ['f', 'floodplain'],
  ['d', 'river delta'],
  ['b', 'natural harbor'],
  ['o', 'oasis'],
  ['s', 'spring'],
  ['p', 'mountain pass']
]);
export const OFFSETS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
export const _CACHE = new TupleMap();
export const _HAZARDS = new TupleMap();
export const _ROUTES = new TupleMap();

export function _hash(x, y, seed, salt) {
  let n = (x * 374761 + y * 668265 + seed % 100003 * 2713 + salt * 9176) % 1000003;
  n = (n * n + 12345) % 1000003;
  n = (n * 7919 + x * 31 + y * 17) % 1000003;
  return n / 1000003;
}

export function _lattice(seed, salt, scale) {
  const cols = Math.trunc(W / scale) + 3;
  const rows = Math.trunc(H / scale) + 3;
  return range(rows).map(j => range(cols).map(i => _hash(i, j, seed, salt)));
}

export function _sample(lat, x, y, scale) {
  const gx = x / scale;
  const gy = y / scale;
  const i = Math.trunc(gx);
  const j = Math.trunc(gy);
  let fx = gx - i;
  let fy = gy - j;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const top = lat[j][i] + (lat[j][i + 1] - lat[j][i]) * fx;
  const bottom = lat[j + 1][i] + (lat[j + 1][i + 1] - lat[j + 1][i]) * fx;
  return top + (bottom - top) * fy;
}

/** Summed-area table so any rectangle can be counted in constant time. */
export function _integral(grid) {
  const table = [new Array(W + 1).fill(0)];
  for (let y = 0; y < H; y++) {
    let run = 0;
    const row = [0];
    for (let x = 0; x < W; x++) {
      run += grid[y][x] ? 1 : 0;
      row.push(table[y][x + 1] + run);
    }
    table.push(row);
  }
  return table;
}

export function _count(table, x, y, r) {
  const x1 = Math.max(0, x - r);
  const y1 = Math.max(0, y - r);
  const x2 = Math.min(W, x + r + 1);
  const y2 = Math.min(H, y + r + 1);
  return table[y2][x2] - table[y1][x2] - table[y2][x1] + table[y1][x1];
}

/** Three large landmasses (and sometimes a smaller fourth) laid out across the map, jittered by the seed. */
export function _continents(seed) {
  const slots = [[31, 35, 18, 22], [89, 17, 13, 16], [86, 57, 13, 16], [57, 62, 9, 11]];
  const out = [];
  for (let i = 0; i < 4; i++) {
    if (i === 3 && _hash(2, 2, seed, 62) < .5) {
      continue;
    }
    const cx = slots[i][0] + (_hash(i, 1, seed, 63) - .5) * 8;
    const cy = slots[i][1] + (_hash(i, 2, seed, 64) - .5) * 5;
    out.push([cx, cy, slots[i][2] + _hash(i, 3, seed, 65) * (slots[i][3] - slots[i][2])]);
  }
  return out;
}

export const DIRECTIONS = [
  [1, 0],
  [.92, .38],
  [.71, .71],
  [.38, .92],
  [0, 1],
  [-.38, .92],
  [-.71, .71],
  [-.92, .38],
  [-1, 0],
  [-.92, -.38],
  [-.71, -.71],
  [-.38, -.92],
  [0, -1],
  [.38, -.92],
  [.71, -.71],
  [.92, -.38]
];

/** Lobes around each continent's core, giving it peninsulas, bays and an irregular coast. */
export function _satellites(seed, continents) {
  const lobes = [];
  for (let i = 0, end = continents.length; i < end; i++) {
    const [cx, cy, r] = continents[i];
    for (let j = 0, end = 5 + Math.trunc(_hash(i, 20, seed, 91) * 3); j < end; j++) {
      const [dx, dy] = DIRECTIONS[Math.trunc(_hash(i * 10 + j, 21, seed, 92) * 16) % 16];
      const off = r * (.55 + .45 * _hash(i * 10 + j, 22, seed, 93));
      lobes.push([
        Math.max(6, Math.min(W - 6, cx + dx * off)),
        Math.max(6, Math.min(H - 6, cy + dy * off)),
        r * (.38 + .27 * _hash(i * 10 + j, 23, seed, 94))
      ]);
    }
  }
  return lobes;
}

/** How many cells of open sea lie between a point and the nearest continent's coast. */
export function _sea_room(x, y, continents) {
  let room = 999;
  for (const [cx, cy, r] of continents) {
    const edge = ((x - cx) ** 2 + (y - cy) ** 2) ** .5 - r * .85;
    if (edge < room) {
      room = edge;
    }
  }
  return room;
}

/** Chains of islands out in the open sea, kept clear of the continents. */
export function _archipelagos(seed, continents) {
  const islands = [];
  const centers = [];
  for (let a = 0; a < 80; a++) {
    if (centers.length >= 5) {
      break;
    }
    const cx = 8 + _hash(a, 1, seed, 71) * (W - 16);
    const cy = 6 + _hash(a, 2, seed, 72) * (H - 12);
    if (_sea_room(cx, cy, continents) < 9) {
      continue;
    }
    let ok = true;
    for (const [ox, oy] of centers) {
      if (((cx - ox) ** 2 + (cy - oy) ** 2) ** .5 < 22) {
        ok = false;
      }
    }
    if (!ok) {
      continue;
    }
    centers.push([cx, cy]);
    for (let j = 0, end = 5 + Math.trunc(_hash(a, 3, seed, 73) * 4); j < end; j++) {
      const ix = cx + (_hash(a * 10 + j, 4, seed, 74) - .5) * 20;
      const iy = cy + (_hash(a * 10 + j, 5, seed, 75) - .5) * 10;
      const ir = 3.6 + _hash(a * 10 + j, 6, seed, 76) * 4;
      if (_sea_room(ix, iy, continents) >= ir + 2) {
        islands.push([ix, iy, ir]);
      }
    }
  }
  return islands;
}

/** Which resources lie in which tile, and how rich each deposit is (up to three per tile). */
export function _layout_deposits(rows, river, soil, feat, near_water, seed) {
  const out = new Map();
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t = rows[y][x];
      if (WATER.includes(t)) {
        continue;
      }
      const tile_soil = soil[y][x];
      const f = feat[y][x];
      const by_river = _near_flag(river, x, y, 1);
      let rolls = [];
      if (t === 'plains') {
        rolls = [
          ['grain', .35 + .35 * tile_soil],
          ['pasture', .28],
          ['clay', by_river ? .14 : .03],
          ['game', .06]
        ];
      } else if (t === 'forest') {
        rolls = [['timber', .78], ['game', .38], ['furs', .12], ['pasture', .05]];
      } else if (t === 'hills') {
        rolls = [['stone', .5], ['pasture', .25], ['iron', .17], ['copper', .15], ['coal', .08], ['game', .08]];
      } else if (t === 'mountains') {
        rolls = [['stone', .6], ['iron', .25], ['copper', .19], ['coal', .16], ['gold', .075]];
      } else if (t === 'desert') {
        rolls = [['salt', .14], ['stone', .18], ['copper', .07], ['gold', .03]];
      } else if (t === 'swamp') {
        rolls = [['clay', .5], ['timber', .25], ['game', .2], ['fish', .2]];
      } else if (t === 'tundra') {
        rolls = [['furs', .35], ['game', .3], ['coal', .08], ['stone', .1]];
      }
      if (near_water[y][x]) {
        rolls.push(['fish', .5]);
        rolls.push(['salt', .09]);
      } else if (by_river) {
        rolls.push(['fish', .3]);
      }
      const chosen = [];
      const kinds = [];
      for (let i = 0, end = rolls.length; i < end; i++) {
        const [kind, chance] = rolls[i];
        if (chosen.length >= 3) {
          break;
        }
        if (!kinds.includes(kind) && _hash(x, y, seed, 100 + i) < chance) {
          let cap = RESOURCE_INFO.get(kind)[3] * (.55 + .9 * _hash(x, y, seed, 200 + i));
          if (kind === 'grain') {
            cap = cap * (.6 + .8 * tile_soil) * (f.includes('f') ? 1.3 : 1);
          }
          if (kind === 'fish' && f.includes('d')) {
            cap = cap * 1.3;
          }
          kinds.push(kind);
          chosen.push([kind, Math.trunc(cap)]);
        }
      }
      if (chosen.length > 0) {
        out.set(y * W + x, chosen);
      }
    }
  }
  return out;
}

export function _build(seed) {
  let e, srow, nx, x, ny, row, cx, r, cy, d;

  const l1 = _lattice(seed, 1, 30);
  const l2 = _lattice(seed, 2, 15);
  const l3 = _lattice(seed, 3, 8);
  const l4 = _lattice(seed, 12, 4);
  const warp_x = _lattice(seed, 9, 20);
  const warp_y = _lattice(seed, 10, 20);
  const ridge = _lattice(seed, 6, 22);
  const wet1 = _lattice(seed, 4, 24);
  const wet2 = _lattice(seed, 5, 9);
  const heat = _lattice(seed, 7, 18);
  const continents = _continents(seed);
  const lobes = _satellites(seed, continents);
  const islands = _archipelagos(seed, [...continents, ...lobes]);
  const gulfs = [];
  for (let i = 0, end = continents.length; i < end; i++) {
    [cx, cy, r] = continents[i];
    if (r > 17) {
      gulfs.push([
        cx + (_hash(i, 7, seed, 81) - .5) * r * .9,
        cy + (_hash(i, 8, seed, 82) - .5) * r * .9,
        3.5 + _hash(i, 9, seed, 83) * 4.5
      ]);
    }
  }
  const elev = [];
  let y;
  for (y = 0; y < H; y++) {
    row = [];
    for (x = 0; x < W; x++) {
      const wx = x + (_sample(warp_x, x, y, 20) - .5) * 14 + (_sample(l4, x, y, 4) - .5) * 4;
      const wy = y + (_sample(warp_y, x, y, 20) - .5) * 14 + (_sample(l3, x, y, 8) - .5) * 4;
      let field = 0;
      for ([cx, cy, r] of [...continents, ...lobes]) {
        d = ((wx - cx) ** 2 + (wy - cy) ** 2) ** .5 / r;
        if (d < 1 && 1 - d * d > field) {
          field = 1 - d * d;
        }
      }
      for ([cx, cy, r] of islands) {
        d = ((wx - cx) ** 2 + (wy - cy) ** 2) ** .5 / r;
        if (d < 1 && (1 - d * d) * .95 > field) {
          field = (1 - d * d) * .95;
        }
      }
      for ([cx, cy, r] of gulfs) {
        d = ((wx - cx) ** 2 + (wy - cy) ** 2) ** .5 / r;
        if (d < 1) {
          field -= (1 - d * d) * .75;
        }
      }
      if (field < 0) {
        field = 0;
      }
      const fbm = .4 * _sample(l1, x, y, 30) + .3 * _sample(l2, x, y, 15) + .2 * _sample(l3, x, y, 8) + .1 * _sample(l4, x, y, 4);
      const spine = 1 - Math.abs(2 * _sample(ridge, x, y, 22) - 1);
      row.push(.44 * field + .56 * fbm - .02 + Math.max(0, field - .5) * spine * spine * .25 + Math.max(0, field - .3) * spine ** 3 * .45);
    }
    elev.push(row);
  }
  // Water connected to the map edge is ocean; enclosed water is a lake.
  const sea = range(H).map(y => range(W).map(x => elev[y][x] < SEA_LEVEL));
  const reached = range(H).map(_ => new Array(W).fill(false));
  let stack = [];
  for (x = 0; x < W; x++) {
    for (y of [0, H - 1]) {
      if (sea[y][x] && !reached[y][x]) {
        reached[y][x] = true;
        stack.push([x, y]);
      }
    }
  }
  for (y = 0; y < H; y++) {
    for (x of [0, W - 1]) {
      if (sea[y][x] && !reached[y][x]) {
        reached[y][x] = true;
        stack.push([x, y]);
      }
    }
  }
  while (stack.length > 0) {
    [cx, cy] = stack.pop();
    for ([nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
      if ((0 <= nx && nx < W) && (0 <= ny && ny < H) && sea[ny][nx] && !reached[ny][nx]) {
        reached[ny][nx] = true;
        stack.push([nx, ny]);
      }
    }
  }
  // Distance to the nearest water: coasts are wet, continental interiors are dry.
  const water_dist = range(H).map(_ => new Array(W).fill(-1));
  let frontier = [];
  for (y = 0; y < H; y++) {
    for (x = 0; x < W; x++) {
      if (sea[y][x]) {
        water_dist[y][x] = 0;
        frontier.push([x, y]);
      }
    }
  }
  while (frontier.length > 0) {
    const following = [];
    for ([cx, cy] of frontier) {
      for ([nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
        if ((0 <= nx && nx < W) && (0 <= ny && ny < H) && water_dist[ny][nx] < 0) {
          water_dist[ny][nx] = water_dist[cy][cx] + 1;
          following.push([nx, ny]);
        }
      }
    }
    frontier = following;
  }
  const rows = [];
  const temps = [];
  const wets = [];
  for (y = 0; y < H; y++) {
    row = [];
    const trow = [];
    const wrow = [];
    const latitude = Math.abs(y - H / 2 + .5) / (H / 2);
    for (x = 0; x < W; x++) {
      e = elev[y][x];
      const temp = 1.05 - latitude * .9 - Math.max(0, e - .62) * 1.2 + (_sample(heat, x, y, 18) - .5) * .35;
      const wet = .34 * _sample(wet1, x, y, 24) + .14 * _sample(wet2, x, y, 9) + .52 * Math.max(0, 1 - water_dist[y][x] / 12);
      trow.push(temp);
      wrow.push(wet);
      if (sea[y][x]) {
        row.push(reached[y][x] ? 'ocean' : 'lake');
      } else if (e > .84) {
        row.push('mountains');
      } else if (e > .72) {
        row.push('hills');
      } else if (temp < .26) {
        row.push('tundra');
      } else if (wet < .30 && temp > .42) {
        row.push('desert');
      } else if (wet > .72 && e < .56) {
        row.push('swamp');
      } else if (wet > .58) {
        row.push('forest');
      } else {
        row.push('plains');
      }
    }
    rows.push(row);
    temps.push(trow);
    wets.push(wrow);
  }
  const slope = [];
  for (y = 0; y < H; y++) {
    srow = [];
    for (x = 0; x < W; x++) {
      e = elev[y][x];
      let top = 0;
      for ([nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if ((0 <= nx && nx < W) && (0 <= ny && ny < H)) {
          d = Math.abs(elev[ny][nx] - e);
          if (d > top) {
            top = d;
          }
        }
      }
      srow.push(top);
    }
    slope.push(srow);
  }
  // Rivers rise in the highlands and run downhill to the sea or a lake.
  const river = range(H).map(_ => new Array(W).fill(false));
  for (y = 0; y < H; y++) {
    for (x = 0; x < W; x++) {
      if (['hills', 'mountains'].includes(rows[y][x]) && elev[y][x] > .72 && _hash(x, y, seed, 11) < .035) {
        cx = x;
        cy = y;
        for (let _ = 0; _ < 180; _++) {
          river[cy][cx] = true;
          let best = null;
          let lowest = elev[cy][cx];
          for ([nx, ny] of OFFSETS) {
            nx += cx;
            ny += cy;
            if ((0 <= nx && nx < W) && (0 <= ny && ny < H)) {
              const level = elev[ny][nx] - _hash(nx, ny, seed, 12) * .004;
              if (level < lowest) {
                lowest = level;
                best = [nx, ny];
              }
            }
          }
          if (best == null) {
            break;
          }
          [cx, cy] = best;
          if (WATER.includes(rows[cy][cx]) || river[cy][cx]) {
            break;
          }
        }
      }
    }
  }
  const comp = range(H).map(_ => new Array(W).fill(0));
  const sizes = new Map();
  let count = 0;
  for (y = 0; y < H; y++) {
    for (x = 0; x < W; x++) {
      if (WATER.includes(rows[y][x]) || comp[y][x]) {
        continue;
      }
      count += 1;
      comp[y][x] = count;
      let total = 1;
      stack = [[x, y]];
      while (stack.length > 0) {
        [cx, cy] = stack.pop();
        for ([nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
          if ((0 <= nx && nx < W) && (0 <= ny && ny < H) && !WATER.includes(rows[ny][nx]) && !comp[ny][nx]) {
            comp[ny][nx] = count;
            total += 1;
            stack.push([nx, ny]);
          }
        }
      }
      sizes.set(count, total);
    }
  }
  // Soil quality, then tile features (floodplains, deltas, natural harbors, oases, springs, passes).
  const soil = [];
  const feat = [];
  const near_water = range(H).map(y => range(W).map(x => _near_water(rows, x, y, 1)));
  const adjust = new Map([
    ['plains', .2],
    ['forest', .05],
    ['swamp', .1],
    ['hills', -.1],
    ['mountains', -.25],
    ['desert', -.3],
    ['tundra', -.25]
  ]);
  for (y = 0; y < H; y++) {
    srow = [];
    const frow = [];
    for (x = 0; x < W; x++) {
      const t = rows[y][x];
      if (WATER.includes(t)) {
        srow.push(0);
        frow.push('');
        continue;
      }
      const by_river = _near_flag(river, x, y, 1);
      srow.push(Math.max(0, Math.min(1, .25 + wets[y][x] * .5 + (by_river ? .25 : 0) + adjust.get(t))));
      let tags = '';
      const h = _hash(x, y, seed, 31);
      let water8 = 0;
      let mountains8 = 0;
      for (const [dx, dy] of OFFSETS) {
        nx = x + dx;
        ny = y + dy;
        if ((0 <= nx && nx < W) && (0 <= ny && ny < H)) {
          if (WATER.includes(rows[ny][nx])) {
            water8 += 1;
          }
          if (rows[ny][nx] === 'mountains') {
            mountains8 += 1;
          }
        }
      }
      if (['plains', 'swamp'].includes(t) && by_river && h < .75) {
        tags += 'f';
      }
      if (river[y][x] && water8 > 0) {
        tags += 'd';
      }
      if ([3, 4, 5].includes(water8) && h > .45) {
        tags += 'b';
      }
      if (t === 'desert' && (by_river || h < .05)) {
        tags += 'o';
      }
      if (['hills', 'mountains'].includes(t) && _hash(x, y, seed, 32) < .045) {
        tags += 's';
      }
      if (t === 'hills' && mountains8 >= 3) {
        tags += 'p';
      }
      frow.push(tags);
    }
    soil.push(srow);
    feat.push(frow);
  }
  const deposits = _layout_deposits(rows, river, soil, feat, near_water, seed);
  const hz = new Map([
    ['forest', _integral(range(H).map(y => range(W).map(x => rows[y][x] === 'forest')))],
    ['wild', _integral(range(H).map(y => range(W).map(x => ['forest', 'desert'].includes(rows[y][x]))))],
    ['high', _integral(range(H).map(y => range(W).map(x => ['hills', 'mountains'].includes(rows[y][x]))))],
    ['river', _integral(river)],
    ['lake', _integral(range(H).map(y => range(W).map(x => rows[y][x] === 'lake')))],
    ['ocean', _integral(range(H).map(y => range(W).map(x => rows[y][x] === 'ocean')))]
  ]);
  return new Map([
    ['terrain', rows],
    ['land', comp],
    ['elev', elev],
    ['river', river],
    ['deposits', deposits],
    ['soil', soil],
    ['feat', feat],
    ['wet', wets],
    ['slope', slope],
    ['temp', temps],
    ['size', sizes],
    ['hz', hz]
  ]);
}

export function _near_flag(grid, x, y, r) {
  for (let yy = Math.max(0, y - r), end = Math.min(H, y + r + 1); yy < end; yy++) {
    for (let xx = Math.max(0, x - r), end = Math.min(W, x + r + 1); xx < end; xx++) {
      if (grid[yy][xx]) {
        return true;
      }
    }
  }
  return false;
}

export function _near_water(rows, x, y, r) {
  for (let yy = Math.max(0, y - r), end = Math.min(H, y + r + 1); yy < end; yy++) {
    for (let xx = Math.max(0, x - r), end = Math.min(W, x + r + 1); xx < end; xx++) {
      if (WATER.includes(rows[yy][xx])) {
        return true;
      }
    }
  }
  return false;
}

export function world(sim) {
  const seed = (sim.geo_seed ?? 0);
  if (!_CACHE.has(seed)) {
    _CACHE.set(seed, _build(seed));
  }
  return _CACHE.get(seed);
}

export function _placed(settlement) {
  return (settlement.gx ?? null) != null;
}

export function dist(ax, ay, bx, by) {
  return ((ax - bx) ** 2 + (ay - by) ** 2) ** .5;
}

/** How far (in cells) a settlement's claim extends. */
export function reach(population) {
  return Math.min(16, 4 + population ** .5 * .55);
}

export function settlement_counts(sim) {
  return new Counter([...sim.people.values()].map(p => p.settlement));
}

export function _inhabited(sim) {
  ensure_placed(sim);
  return [...sim.settlements.values()].filter(s => (s.abandoned == null && sim.countries.get(s.country).ended == null));
}

/** (country, x, y, reach, landmass) for every inhabited settlement. */
export function claims_list(sim, counts) {
  const comp = world(sim).get('land');
  return _inhabited(sim).map(s => [s.country, s.gx, s.gy, reach(getOr(counts, s.id, 1)), comp[s.gy][s.gx]]);
}

/** Resources, river and coast information for one cell. */
export function cell_features(sim, x, y) {
  const geo = world(sim);
  return new Map([
    ['terrain', geo.get('terrain')[y][x]],
    ['river', geo.get('river')[y][x]],
    ['deposits', geo.get('deposits').get(y * W + x) ?? []],
    ['features', geo.get('feat')[y][x]],
    ['soil', geo.get('soil')[y][x]],
    ['coastal', _near_water(geo.get('terrain'), x, y, 1)]
  ]);
}

export function resources_near(sim, x, y, r) {
  const geo = world(sim);
  const found = new Counter();
  for (let yy = Math.max(0, y - r), end = Math.min(H, y + r + 1); yy < end; yy++) {
    for (let xx = Math.max(0, x - r), end = Math.min(W, x + r + 1); xx < end; xx++) {
      for (const [kind, cap] of (geo.get('deposits').get(yy * W + xx) ?? [])) {
        found.set(kind, found.get(kind) + 1);
      }
    }
  }
  return found;
}

/** Relative risk (about 0..4) of each natural disaster at a cell, from geography alone. */
export function hazards_at(sim, x, y) {
  const geo = world(sim);
  const seed = (sim.geo_seed ?? 0);
  const key = [seed, x, y];
  if (_HAZARDS.has(key)) {
    return _HAZARDS.get(key);
  }
  const rows = geo.get('terrain');
  const hz = geo.get('hz');
  const here = rows[y][x];
  const e = geo.get('elev')[y][x];
  const window = (Math.min(W, x + 4) - Math.max(0, x - 3)) * (Math.min(H, y + 4) - Math.max(0, y - 3));
  const forest = _count(hz.get('forest'), x, y, 3);
  const wild = _count(hz.get('wild'), x, y, 3);
  const highland = _count(hz.get('high'), x, y, 3);
  const river = _count(hz.get('river'), x, y, 1) ? 1 : 0;
  const lake = _count(hz.get('lake'), x, y, 1) ? 1 : 0;
  const ocean = _count(hz.get('ocean'), x, y, 2) ? 1 : 0;
  const coast = ocean || lake ? 1 : 0;
  const slope = geo.get('slope')[y][x];
  const cold = Math.max(0, .4 - geo.get('temp')[y][x]);
  const result = new Map([
    ['flood', .2 + 1.7 * river + 1 * lake + (coast && e < .55 ? .9 : 0) + (here === 'swamp' ? 1.1 : 0) - (e > .64 ? .9 : 0)],
    ['storm', .15 + 1.9 * ocean + .4 * coast + (here === 'plains' ? .5 : 0) - (here === 'forest' ? .4 : 0)],
    ['wildfire', .1 + 2.2 * forest / window + (here === 'desert' ? 1.6 : 0) + .9 * wild / window],
    ['earthquake', .08 + 2.6 * highland / window + 5 * slope],
    ['landslide', .03 + 6 * slope * (['hills', 'mountains'].includes(here) ? 1 : .3)],
    ['blizzard', .02 + 4 * cold + (here === 'mountains' ? .7 : 0)]
  ]);
  for (const kind of result.keys()) {
    result.set(kind, Math.max(.02, result.get(kind)));
  }
  _HAZARDS.set(key, result);
  return result;
}

/** How good a place is to settle, from terrain, water, resources, and hazards. */
export function site_quality(sim, x, y) {
  const geo = world(sim);
  const t = geo.get('terrain')[y][x];
  if (WATER.includes(t) || t === 'mountains') {
    return -50;
  }
  let score = FERTILITY.get(t) * 2;
  if (_count(geo.get('hz').get('river'), x, y, 1)) {
    score += .8;
  }
  if (_near_water(geo.get('terrain'), x, y, 1)) {
    score += .35;
  }
  const values = new Map([
    ['grain', .35],
    ['pasture', .2],
    ['fish', .25],
    ['game', .12],
    ['timber', .15],
    ['stone', .12],
    ['clay', .08],
    ['iron', .2],
    ['copper', .15],
    ['coal', .1],
    ['gold', .25],
    ['salt', .12],
    ['furs', .1]
  ]);
  for (const [kind, n] of resources_near(sim, x, y, 2)) {
    score += Math.min(n, 2) * values.get(kind);
  }
  const tags = geo.get('feat')[y][x];
  score += (tags.includes('f') ? .5 : 0) + (tags.includes('b') ? .4 : 0) + (tags.includes('o') ? .3 : 0) + (tags.includes('s') ? .15 : 0);
  const risk = hazards_at(sim, x, y);
  score -= (risk.get('flood') + risk.get('earthquake') + risk.get('wildfire') + risk.get('landslide')) * .12;
  return score;
}

/** Country whose settlement claims a cell, or 0. */
export function claim_owner(sim, x, y, counts, exclude = null) {
  const comp = world(sim).get('land');
  const land = comp[y][x];
  let best = 0;
  let best_dist = 999;
  for (const s of _inhabited(sim)) {
    if (exclude != null && s.id === exclude) {
      continue;
    }
    if (comp[s.gy][s.gx] !== land) {
      continue;
    }
    const d = dist(s.gx, s.gy, x, y);
    if (d <= reach(getOr(counts, s.id, 1)) && d < best_dist) {
      best_dist = d;
      best = s.country;
    }
  }
  return best;
}

/** Put a settlement on the map: at the given cell, near its country, or in fresh land. */
export function place_settlement(sim, settlement, cell = null, anchor = null) {
  let s, x, y;

  const geo = world(sim);
  const comp = geo.get('land');
  const sizes = geo.get('size');
  const seed = (sim.geo_seed ?? 0);
  if (cell != null) {
    settlement.gx = cell[0];
    settlement.gy = cell[1];
    return;
  }
  const others = [...sim.settlements.values()].filter(s => (s !== settlement && _placed(s)));
  const mine = others.filter(s => s.country === settlement.country);
  const taken = new TupleSet(others.map(s => [s.gx, s.gy]));
  const claims = anchor != null && mine.length === 0 ? claims_list(sim, settlement_counts(sim)) : [];
  const candidates = new TupleMap();
  if (anchor != null && mine.length === 0) {
    for (y of range(Math.max(1, anchor[1] - 24), Math.min(H - 1, anchor[1] + 25), 2)) {
      for (x of range(Math.max(1, anchor[0] - 24), Math.min(W - 1, anchor[0] + 25), 2)) {
        candidates.set([x, y], 1);
      }
    }
  } else if (mine.length > 0) {
    for (s of mine) {
      for (y of range(Math.max(0, s.gy - 14), Math.min(H, s.gy + 15), 2)) {
        for (x of range(Math.max(0, s.gx - 14), Math.min(W, s.gx + 15), 2)) {
          candidates.set([x, y], 1);
        }
      }
    }
  } else {
    for (y of range(2, H - 1, 4)) {
      for (x of range(2, W - 1, 4)) {
        candidates.set([x, y], 1);
      }
    }
  }
  const home = mine.length > 0 ? comp[mine[0].gy][mine[0].gx] : anchor != null ? comp[anchor[1]][anchor[0]] : null;
  const occupied = new Set(others.map(s => comp[s.gy][s.gx]));
  let best = null;
  let best_score = -1000000;
  for (const key of sorted(candidates.keys())) { // each country starts on a landmass of its own when there are enough

    [x, y] = key;
    const land = comp[y][x];
    if (taken.has(key) || land === 0) {
      continue;
    }
    if (home != null && land !== home) {
      continue;
    }
    if (home == null && sizes.get(land) < 220) {
      continue;
    }
    let score = site_quality(sim, x, y) + _hash(x, y, seed, 9) * .8;
    if (score < -20) {
      continue;
    }
    let nearest = 99;
    for (s of others) {
      const d = dist(s.gx, s.gy, x, y);
      if (d < nearest) {
        nearest = d;
      }
    }
    if (nearest < 4) {
      score -= 8;
    }
    if (mine.length > 0) {
      const close = Math.min(...mine.map(s => dist(s.gx, s.gy, x, y)));
      score -= Math.abs(close - 8) * .3;
    } else if (anchor != null) {
      for (const [owner, sx, sy, r, other_land] of claims) {
        if (other_land === land && dist(sx, sy, x, y) <= r) {
          score -= 20;
          break;
        }
      }
      score -= Math.abs(nearest - 11) * .25 + dist(x, y, anchor[0], anchor[1]) * .05;
    } else {
      score -= Math.abs(Math.min(nearest, 60) - 26) * .08;
      if (!occupied.has(land)) {
        score += 3;
      }
    }
    if (score > best_score) {
      best_score = score;
      best = [x, y];
    }
  }
  if (best == null) {
    best = [Math.floor(W / 2), Math.floor(H / 2)];
  }
  settlement.gx = best[0];
  settlement.gy = best[1];
}

export function ensure_placed(sim) {
  for (const settlement of sorted(sim.settlements.values(), {key: (s => s.id)})) {
    if (!_placed(settlement)) {
      place_settlement(sim, settlement);
    }
  }
}

export function terrain_of(sim, settlement) {
  ensure_placed(sim);
  return world(sim).get('terrain')[settlement.gy][settlement.gx];
}

export function is_coastal(sim, settlement) {
  ensure_placed(sim);
  return _near_water(world(sim).get('terrain'), settlement.gx, settlement.gy, 1);
}

export function on_river(sim, settlement) {
  ensure_placed(sim);
  return _near_flag(world(sim).get('river'), settlement.gx, settlement.gy, 1);
}

export function describe(sim, settlement) {
  const terrain = terrain_of(sim, settlement);
  const words = [is_coastal(sim, settlement) ? 'coastal' : 'inland'];
  if (on_river(sim, settlement)) {
    words.push('riverside');
  }
  return words.join(' ') + ' ' + terrain;
}

/** Return (land, sea): each maps country id -> set of country ids. */
export function neighbors(sim) {
  let target;

  const comp = world(sim).get('land');
  const places = _inhabited(sim);
  const counts = settlement_counts(sim);
  const land = new Map();
  const sea = new Map();
  for (let i = 0, end = places.length; i < end; i++) {
    const a = places[i];
    for (let j = i + 1, end = places.length; j < end; j++) {
      const b = places[j];
      if (a.country === b.country) {
        continue;
      }
      const d = dist(a.gx, a.gy, b.gx, b.gy);
      if (comp[a.gy][a.gx] === comp[b.gy][b.gx]) {
        target = d <= reach(getOr(counts, a.id, 1)) + reach(getOr(counts, b.id, 1)) + 2 ? land : null;
      } else {
        target = d <= SEA_RANGE ? sea : null;
      }
      if (target != null) {
        setdefault(target, a.country, new Set()).add(b.country);
        setdefault(target, b.country, new Set()).add(a.country);
      }
    }
  }
  return [land, sea];
}

/** Neighbor map cached for the current year (invalidated by edits). store=False never changes the simulation. */
export function contacts(sim, store = true) {
  let cache = (sim.contact_cache ?? null);
  if (cache == null || cache.get('year') !== sim.year) {
    const [land, sea] = neighbors(sim);
    cache = new Map([['year', sim.year], ['land', land], ['sea', sea]]);
    if (store) {
      sim.contact_cache = cache;
    }
  }
  return [cache.get('land'), cache.get('sea')];
}

/** Terrain shares across a country's inhabited settlements, plus an adjusted fertility. */
export function profile(sim, cid) {
  const places = _inhabited(sim).filter(s => s.country === cid);
  const empty = new Map([
    ['fertility', 1],
    ['coastal', 0],
    ['mountain', 0],
    ['forest', 0],
    ['dry', 0],
    ['river', 0],
    ['swamp', 0],
    ['cold', 0]
  ]);
  if (places.length === 0) {
    return empty;
  }
  const geo = world(sim);
  const rows = geo.get('terrain');
  const n = places.length;
  const kinds = places.map(s => rows[s.gy][s.gx]);
  const coastal = sum(places.map(s => _near_water(rows, s.gx, s.gy, 1))) / n;
  const rivers = sum(places.map(s => _near_flag(geo.get('river'), s.gx, s.gy, 1))) / n;
  const techs = sim.countries.get(cid).technologies;
  const farming = intersection(techs, new Set(['irrigation', 'crop rotation', 'watermills'])).size;
  let total = 0;
  for (const [k, s] of zip(kinds, places)) {
    let value = FERTILITY.get(k);
    if (['desert', 'hills', 'tundra', 'mountains'].includes(k)) {
      value += .07 * farming;
    }
    if (_near_flag(geo.get('river'), s.gx, s.gy, 1)) {
      value += .22;
    }
    total += value;
  }
  return new Map([
    ['fertility', total / n + .1 * coastal],
    ['coastal', coastal],
    ['mountain', sum(kinds.map(k => ['mountains', 'hills'].includes(k))) / n],
    ['forest', sum(kinds.map(k => k === 'forest')) / n],
    ['dry', sum(kinds.map(k => k === 'desert')) / n],
    ['river', rivers],
    ['swamp', sum(kinds.map(k => k === 'swamp')) / n],
    ['cold', sum(kinds.map(k => k === 'tundra')) / n]
  ]);
}

export function defense(sim, cid) {
  const places = _inhabited(sim).filter(s => s.country === cid);
  if (places.length === 0) {
    return 1;
  }
  const rows = world(sim).get('terrain');
  return sum(places.map(s => DEFENSE.get(rows[s.gy][s.gx]))) / places.length;
}

/** Distance from a settlement to the nearest inhabited settlement of a country. */
export function distance_to_country(sim, place, cid) {
  ensure_placed(sim);
  let best = 999;
  for (const s of _inhabited(sim)) {
    if (s.country === cid) {
      const d = dist(s.gx, s.gy, place.gx, place.gy);
      if (d < best) {
        best = d;
      }
    }
  }
  return best;
}

export function step_cost(sim, x, y, nx, ny) {
  const geo = world(sim);
  const t = geo.get('terrain')[ny][nx];
  if (WATER.includes(t)) {
    return null;
  }
  const road = (sim.roads ?? new Map());
  let cost = CELL_COST.get(t);
  if (road.has(ny * W + nx)) {
    cost = Math.min(cost, .5);
  } else if (geo.get('river')[ny][nx] && !geo.get('river')[y][x]) {
    cost += 1.5;
  }
  if (nx !== x && ny !== y) {
    cost *= 1.41;
  }
  return cost;
}

/** Bucketed A* over land cells, or over ocean cells when sea is true. */
export function _search(sim, start, goal, sea) {
  let cost;

  const geo = world(sim);
  const terrain = geo.get('terrain');
  const river = geo.get('river');
  const roads = sea ? new Map() : (sim.roads ?? new Map());
  const gx = goal[0];
  const gy = goal[1];
  const best = new Map([[start[1] * W + start[0], 0]]);
  const prev = new Map();
  const buckets = new Map([[0, [[0, start[0], start[1]]]]]);
  let level = 0;
  let expanded = 0;
  const limit = sea ? 9000 : 6000;
  while (level <= 2400) {
    const queue = buckets.get(level);
    if (!queue?.length) {
      level += 1;
      continue;
    }
    let index = 0;
    while (index < queue.length) {
      const [g, x, y] = queue[index];
      index += 1;
      let key = y * W + x;
      if (g > best.get(key) + .0001) {
        continue;
      }
      if (x === gx && y === gy) {
        let cells = [[x, y]];
        while (prev.has(key)) {
          key = prev.get(key);
          cells.push([key % W, Math.floor(key / W)]);
        }
        cells = [...[...cells].reverse()];
        return [cells, g];
      }
      expanded += 1;
      if (expanded > limit) {
        return null;
      }
      for (const [dx, dy] of OFFSETS) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) {
          continue;
        }
        const t = terrain[ny][nx];
        const nkey = ny * W + nx;
        if (sea) {
          if (t !== 'ocean') {
            continue;
          }
          cost = 1;
        } else {
          if (t === 'ocean' || t === 'lake') {
            continue;
          }
          cost = CELL_COST.get(t);
          if (roads.has(nkey)) {
            cost = .5;
          } else if (river[ny][nx] && !river[y][x]) {
            cost += 1.5;
          }
        }
        if (dx !== 0 && dy !== 0) {
          cost *= 1.41;
        }
        const ng = g + cost;
        const old = best.get(nkey);
        if (old == null || ng < old - .0001) {
          best.set(nkey, ng);
          prev.set(nkey, key);
          let slot = Math.trunc((ng + ((nx - gx) ** 2 + (ny - gy) ** 2) ** .5 * .8) * 2);
          if (slot < level) {
            slot = level;
          }
          setdefault(buckets, slot, []).push([ng, nx, ny]);
        }
      }
    }
    buckets.set(level, []);
    level += 1;
  }
  return null;
}

/** Cheapest overland route between two cells, or None. Returns (cells, total cost). */
export function find_path(sim, start, goal) {
  const comp = world(sim).get('land');
  if (comp[start[1]][start[0]] !== comp[goal[1]][goal[0]] || comp[start[1]][start[0]] === 0) {
    return null;
  }
  return _search(sim, start, goal, false);
}

/** An ocean cell touching a land cell, or None. */
export function coast_cell(sim, x, y) {
  const rows = world(sim).get('terrain');
  for (const [dx, dy] of OFFSETS) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < W && ny >= 0 && ny < H && rows[ny][nx] === 'ocean') {
      return [nx, ny];
    }
  }
  return null;
}

/** A boat's route from one coastal cell to another: land, open water, land. Returns (cells, cost) or None. */
export function find_sea_route(sim, a, b) {
  const start = coast_cell(sim, a[0], a[1]);
  const goal = coast_cell(sim, b[0], b[1]);
  if (start == null || goal == null) {
    return null;
  }
  const found = _search(sim, start, goal, true);
  if (found == null) {
    return null;
  }
  const [cells, cost] = found;
  return [
    [[a[0], a[1]], ...cells, [b[0], b[1]]],
    cost + 2
  ];
}

/** find_path / find_sea_route with a memo, for trade and war routes that repeat. */
export function cached_route(sim, a, b, sea = false) {
  const roads = (sim.roads ?? new Map());
  const key = [(sim.geo_seed ?? 0), a, b, sea, roads.size, sum([...roads.keys()])];
  if (!_ROUTES.has(key)) {
    if (_ROUTES.size > 300) {
      _ROUTES.clear();
    }
    _ROUTES.set(key, sea ? find_sea_route(sim, a, b) : find_path(sim, a, b));
  }
  return _ROUTES.get(key);
}

/** Land cells claimed by both sides of an active war, as {cell key: (country a, country b)}. */
export function contested_cells(sim) {
  const cells = new Map();
  if (sim.wars.size === 0) {
    return cells;
  }
  const comp = world(sim).get('land');
  const counts = settlement_counts(sim);
  const places = _inhabited(sim);
  for (const pair of sorted(sim.wars.keys())) {
    for (const x of places) {
      if (x.country !== pair[0]) {
        continue;
      }
      const rx = reach(getOr(counts, x.id, 1)) + 2;
      const land = comp[x.gy][x.gx];
      for (const y of places) {
        if (y.country !== pair[1] || comp[y.gy][y.gx] !== land) {
          continue;
        }
        const ry = reach(getOr(counts, y.id, 1)) + 2;
        if (dist(x.gx, x.gy, y.gx, y.gy) > rx + ry) {
          continue;
        }
        for (let cy = Math.max(0, Math.trunc(y.gy - ry)), end = Math.min(H, Math.trunc(y.gy + ry) + 2); cy < end; cy++) {
          for (let cx = Math.max(0, Math.trunc(y.gx - ry)), end = Math.min(W, Math.trunc(y.gx + ry) + 2); cx < end; cx++) {
            if (comp[cy][cx] === land && dist(cx, cy, x.gx, x.gy) <= rx && dist(cx, cy, y.gx, y.gy) <= ry) {
              cells.set(cy * W + cx, pair);
            }
          }
        }
      }
    }
  }
  return cells;
}

export function report(sim, query = '') {
  const [land, sea] = contacts(sim);
  const sizes = world(sim).get('size');
  const big = [...sizes.values()].filter(size => size >= 150).length;
  const lines = [
    'Geography: terrain, rivers, resources and roads shape food, hazards, disease, travel and battles; borders decide who can fight.',
    `The world is ${str(W)}x${str(H)} cells with ${str(big)} large landmasses and ${str(sizes.size - big)} smaller islands. A settlement claims land out to its reach (4 cells plus population-based growth); claims that meet are land borders. Sea neighbors lie within ${str(SEA_RANGE)} cells across water.`
  ];
  for (const cid of sorted(sim.countries.keys())) {
    const country = sim.countries.get(cid);
    if (country.ended != null || query && !country.name.toLowerCase().includes(query)) {
      continue;
    }
    const p = profile(sim, cid);
    const by_land = sorted([...(land.get(cid) ?? new Set())].map(n => sim.countries.get(n).name)).join(', ') || 'none';
    const by_sea = sorted([...(sea.get(cid) ?? new Set())].map(n => sim.countries.get(n).name)).join(', ') || 'none';
    lines.push(`${country.name}: borders ${str(by_land)}; sea neighbors ${str(by_sea)}`);
    lines.push(`  fertility ${fixed(p.get('fertility'), 2)}; coastal ${format(p.get('coastal'), '.0%')}; river ${format(p.get('river'), '.0%')}; highland ${format(p.get('mountain'), '.0%')}; forest ${format(p.get('forest'), '.0%')}; desert ${format(p.get('dry'), '.0%')}; swamp ${format(p.get('swamp'), '.0%')}; defensive terrain x${fixed(defense(sim, cid), 2)}`);
  }
  return lines.join('\n');
}
