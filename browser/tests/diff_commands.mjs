// Replays tools/diff_commands.py's command list on the JavaScript simulator and compares every output with Python's.
import fs from 'node:fs';
import {Simulation} from '../dist/sim/civsim.js';
import {command} from '../dist/sim/civic.js';
const cases = JSON.parse(fs.readFileSync(new URL('./diff_commands.json', import.meta.url), 'utf8'));
const fix = s => s.replace(/(\d)\.0(?=\D|$)/g, '$1');
let total = 0, bad = 0;
for (const [key, expected] of Object.entries(cases)) {
  const [seed, years] = key.split(':').map(Number);
  const sim = new Simulation(seed === 42 ? 800 : 2000, seed);
  for (let y = 0; y < years; y++) sim.tick(false);
  const texts = expected.map(e => e[0]);
  const split = (texts.length - 75) ;
  for (let i = 0; i < expected.length; i++) {
    if (i === split) for (let y = 0; y < 5; y++) sim.tick(false);
    let got;
    try { got = command(sim, expected[i][0]); got = [got[0], got[1]]; }
    catch (e) { got = ['EXCEPTION ' + e.name + ': ' + e.message, 'error']; }
    total++;
    if (got[1] !== expected[i][2] || fix(got[0]) !== fix(expected[i][1])) {
      bad++;
      if (bad <= (Number(process.env.SHOW) || 8)) console.log(`MISMATCH [${key}] ${expected[i][0]}\n  js: ${got[0].slice(0, 300)}\n  py: ${expected[i][1].slice(0, 300)}`);
    }
  }
}
console.log(bad ? `${bad}/${total} command outputs differ` : `PASS: ${total} command outputs match Python`);
process.exit(bad ? 1 : 0);
