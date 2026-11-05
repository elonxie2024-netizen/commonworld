"""Long-run behavioral fixture: 120 years from one seed, with yearly aggregates, from the Python simulator."""
import pathlib, sys, json
ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from civsim import Simulation
SEED, YEARS = 7, 120
sim = Simulation(population=2000, seed=SEED)
rows = []
for _ in range(YEARS):
    sim.tick(False)
    alive = [c for c in sim.countries.values() if c.ended is None]
    rows.append({
        'year': sim.year, 'population': len(sim.people), 'countries': len(alive),
        'treasury': sum(getattr(c, 'treasury', 0.0) for c in alive),
        'techs': sum(len(c.technologies) for c in alive),
        'wars': len(sim.wars),
        'settlements': len([s for s in sim.settlements.values() if s.abandoned is None]),
        'exhausted': sim.deposit_stats['exhausted'] if hasattr(sim, 'deposit_stats') else 0,
        'rng': sum(sim.rng.getstate()[1]) % 1000003,
    })
out = ROOT / 'browser' / 'tests' / 'reference_long.json'
out.write_text(json.dumps({'seed': SEED, 'rows': rows}), encoding='utf8')
print(f'Long fixture: seed {SEED}, {YEARS} years, final population {rows[-1]["population"]}')
