// Long-run parity: the engine must follow the Python simulator for 120 years (not just the first 30).
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Engine} from '../dist/engine-api.js';
const ref = JSON.parse(fs.readFileSync(new URL('./reference_long.json', import.meta.url), 'utf8'));
const e = new Engine(); e.create({seed: ref.seed});
const rngDigest = () => e.sim.rng.getstate()[1].reduce((a, b) => a + b, 0) % 1000003;
let checked = 0;
for (const row of ref.rows) {
  const s = e.step();
  const alive = s.countries.filter(c => c.ended === null);
  const got = {population: s.population, countries: alive.length, techs: alive.reduce((n, c) => n + c.technologies.length, 0), wars: s.wars.length,
    settlements: s.settlements.filter(x => !x.abandoned).length, exhausted: s.depositStats ? s.depositStats.exhausted : 0, rng: rngDigest()};
  for (const k of Object.keys(got)) assert.equal(got[k], row[k], `year ${row.year}: ${k} ${got[k]} != ${row[k]}`);
  const treasury = alive.reduce((n, c) => n + (c.treasury || 0), 0);
  assert.ok(Math.abs(treasury - row.treasury) <= 1e-7 * Math.max(1, Math.abs(row.treasury)), `year ${row.year}: treasury ${treasury} != ${row.treasury}`);
  checked++;
}
console.log(`PASS: ${checked} years of long-run parity (population, countries, treasuries, techs, wars, settlements, exhausted deposits, RNG).`);
