"""Create behavioral fixtures using the untouched Python simulator."""
import pathlib,sys,json,random
ROOT=pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT))
from civsim import Simulation
from civic import command
def clean(v):
    if isinstance(v,random.Random): return {'random':clean(v.getstate())}
    if isinstance(v,dict): return {'dict':sorted([[clean(k),clean(x)] for k,x in v.items()],key=lambda p:json.dumps(p[0],sort_keys=True))}
    if isinstance(v,(set,frozenset)): return {'set':sorted([clean(x) for x in v],key=lambda p:json.dumps(p,sort_keys=True))}
    if isinstance(v,(tuple,list)): return [clean(x) for x in v]
    if hasattr(v,'__dict__'): return {'class':type(v).__name__,'attrs':clean(v.__dict__)}
    return v
commands=['help','help edit','help ids','people','person 1','ids person Az','settlements','settlement 1','countries','country 1','demographics','wars','diseases','richest','government','notables','lineages','discoveries','catalog page=2','set person 1 wealth 123.5','set person 1 age 44','set country 1 economy communism','set simulation war_chance 0.25','set person 1 wealth nan','undo','add person 1 name=Testchild age=0 parent=1','set person 1 wealth 100','delete person 1','move person 2 3','add settlement 1 name=Newhaven residents=40','delete settlement Newhaven to=1','add country 2 name=Testland','delete country Testland to=2','add lineage 3 surname=Tester','add disease Testfever course=acute infection=0.3 death=0.01 recovery=0.9','infect 3 Testfever','cure 3','outbreak 2 Testfever cases=7','disease Testfever','delete disease Testfever','grant 1 "crop rotation"','grant 1 "stone tools"','grant 1 "seed gathering"','grant 1 irrigation','grant 1 "animal husbandry"','grant 1 "seed gathering"','grant 1 composting','grant 1 "crop rotation"','grant 1 01-01-01','revoke 1 irrigation','war 1 2','peace 1 2 years=5','war 1 2','war 1 2 force=true','trigger 1 Famine','trigger 1 Abundance','disaster 2 storm severity=minor','changes','undo']
fixtures={'commands':[],'annual':[]}
s=Simulation(seed=42)
fixtures['initial']=clean(s)
for text in commands:
    result=command(s,text)
    fixtures['commands'].append({'text':text,'result':result})
fixtures['after_commands']=clean(s)
s=Simulation(seed=42)
for i in range(30):
    s.tick(False)
    fixtures['annual'].append({'population':len(s.people),'report':clean(s.yearly_reports[-1]),'rng':clean(s.rng)})
fixtures['final']=clean(s)
out=ROOT/'browser'/'tests';out.mkdir(exist_ok=True)
(out/'reference.json').write_text(json.dumps(fixtures,ensure_ascii=True),encoding='utf8')
print('Python reference fixtures: initial/final state, 54 commands, 20 years')
