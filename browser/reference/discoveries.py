"""Applied innovations: 100 real technique families x 10 relevant applications.

These are fictional local adaptations, not claims of 1,000 separate historical
first inventions. Each field has ten techniques and ten application contexts.
Foundation prerequisites gate the field; advanced techniques need more foundations.
"""
from dataclasses import dataclass

@dataclass(frozen=True)
class Innovation:
    id: str
    name: str
    field: str
    prerequisites: frozenset
    cost: float
    effects: tuple
    modifiers: tuple
    description: str

# field: foundations, techniques, applications, immediate effects, persistent bonus
FIELDS = {
 'agriculture': (
  ('irrigation', 'crop rotation'),
  'contour planting|seed selection|composting|mulching|drainage channels|water scheduling|intercropping|fallow management|terracing|soil amendments',
  'river farms|hillside farms|dryland farms|village gardens|orchards|pastures|vegetable plots|grain fields|seed nurseries|estate farms',
  (3,1,0,0), ('production', .009)),
 'food preservation': (
  ('pottery', 'granaries'),
  'drying racks|salt curing|smoking chambers|sealed jars|cool cellars|fermentation|pest exclusion|moisture checks|stock rotation|raised storage',
  'grain depots|fishing ports|market stores|army kitchens|village pantries|fruit stores|vegetable stores|winter provisions|caravan provisions|public kitchens',
  (3,1,0,1), ('production', .007)),
 'water engineering': (
  ('irrigation', 'aqueducts'),
  'settling basins|sand filtration|covered conduits|sluice gates|cistern lining|leak detection|gravity channels|overflow drains|inspection shafts|water lifting',
  'town wells|village wells|market districts|bathhouses|public fountains|hill settlements|fortresses|river settlements|workshop districts|farm settlements',
  (2,1,0,1), ('infection', -.007)),
 'medical care': (
  ('medicine', 'surgery'),
  'wound cleaning|patient observation|splint fitting|clean dressing|symptom recording|rest scheduling|caregiver training|instrument cleaning|recovery monitoring|patient triage',
  'rural clinics|town clinics|field hospitals|port clinics|child care wards|elder care wards|traveler shelters|mining clinics|workshop infirmaries|public hospitals',
  (0,0,1,2), ('disease_death', -.009)),
 'public health': (
  ('medicine', 'public sanitation'),
  'waste collection|latrine maintenance|water inspection|case reporting|ventilation|food inspection|vermin control|laundry routines|isolation planning|burial safeguards',
  'market districts|army camps|port districts|schools|crowded housing|caravan stops|prisons|public kitchens|mining settlements|refugee shelters',
  (0,1,1,2), ('infection', -.009)),
 'manufacturing': (
  ('bronze tools', 'ironworking'),
  'standard gauges|tool sharpening|jig fixtures|quality sampling|workshop scheduling|material sorting|furnace insulation|pattern templates|repair manuals|batch production',
  'woodworking|masonry|metalworking|pottery workshops|textile workshops|leatherworking|shipbuilding|cart building|toolmaking|mill construction',
  (0,3,1,0), ('production', .009)),
 'transport': (
  ('roads', 'navigation'),
  'route surveying|load balancing|waystation planning|drainage maintenance|distance markers|traffic scheduling|cargo records|repair depots|hazard mapping|relay services',
  'coastal routes|river routes|mountain routes|forest routes|grain routes|military routes|postal routes|market routes|mining routes|frontier routes',
  (1,2,0,1), ('logistics', .01)),
 'military engineering': (
  ('fortification', 'military logistics'),
  'defensive surveying|supply accounting|equipment inspection|signal drills|camp layout|bridge planning|field entrenchment|reserve provisioning|evacuation routes|unit coordination',
  'border garrisons|river defenses|mountain defenses|coastal defenses|capital defenses|frontier patrols|field armies|siege forces|convoy escorts|militia formations',
  (0,1,1,1), ('military', .007)),
 'scholarship': (
  ('writing', 'universities'),
  'indexed records|comparative observations|error checking|worked examples|standard notation|translation glossaries|teaching demonstrations|catalog systems|measurement tables|replicated trials',
  'agricultural schools|medical schools|navigation schools|engineering schools|astronomical study|mathematical study|craft schools|military schools|merchant schools|public libraries',
  (0,1,3,1), ('research', .01)),
 'administration': (
  ('writing', 'banking'),
  'audited accounts|standard contracts|duplicate archives|public registers|appeal procedures|scheduled inspections|budget forecasts|inventory ledgers|receipt systems|appointment records',
  'tax offices|grain boards|market authorities|public works offices|army supply offices|port authorities|village councils|land registries|relief offices|trade courts',
  (1,2,1,2), ('logistics', .007)),
}

INNOVATIONS = {}
for field_index, (field, data) in enumerate(FIELDS.items()):
    foundations, techniques, contexts, effects, modifier = data
    for ti, technique in enumerate(techniques.split('|')):
        for ci, context in enumerate(contexts.split('|')):
            key = f'{field_index:02d}-{ti:02d}-{ci:02d}'
            # First five techniques are early adaptations; others need advanced knowledge.
            req = frozenset(foundations[:1] if ti < 5 else foundations)
            strength = 1 + ci / 20
            INNOVATIONS[key] = Innovation(
                key, f'{technique.capitalize()} for {context}', field, req,
                9 + ti * 2 + ci,
                tuple(round(v * strength, 2) for v in effects),
                ((modifier[0], modifier[1] * strength),),
                f'Local specialists adapt {technique} to the practical needs of {context}.')


def acquired_innovations(country):
    return [INNOVATIONS[key] for key in getattr(country, 'innovations', {}) if key in INNOVATIONS]


def catalog_for(country, acquired=True):
    if acquired:
        return acquired_innovations(country)
    owned = getattr(country, 'innovations', {})
    return [item for key, item in INNOVATIONS.items()
            if key not in owned and item.prerequisites <= country.technologies]


def innovation_modifiers(country):
    """Multipliers: production/research/logistics/military >=1; infection/death <=1.

    Caps prevent hundreds of improvements from causing immortality or runaway armies.
    Production applies to carrying capacity or economic output; logistics to supply.
    """
    totals = {key: 0.0 for key in ('production', 'infection', 'disease_death',
                                  'military', 'logistics', 'research')}
    for item in acquired_innovations(country):
        for key, value in item.modifiers:
            totals[key] += value
    return {key: (max(.45, 1 + value) if key in ('infection', 'disease_death')
                  else min(2.5 if key in ('production', 'research') else 1.8, 1 + value))
            for key, value in totals.items()}


def advance_innovations(sim, country, adults):
    """Fund one applied research project annually; unlock at most one per year."""
    if not adults or getattr(country, 'ended', None) is not None:
        return
    if not hasattr(country, 'innovations'):
        country.innovations = {}
    available = catalog_for(country, acquired=False)
    if not available:
        return
    project_id = getattr(country, 'innovation_project', None)
    project = next((i for i in available if i.id == project_id), None)
    if project is None:
        weights = [4 if (country.food < 45 and i.field in ('agriculture', 'food preservation'))
                   or (getattr(country, 'sickness', None) and i.field in ('medical care', 'public health'))
                   else 1 for i in available]
        project = sim.rng.choices(available, weights=weights, k=1)[0]
        country.innovation_project = project.id
        country.innovation_progress = 0.0
    budget = min(1.5, max(.1, country.prosperity / 60))
    country.prosperity = max(0, country.prosperity - budget * .25)
    rate = (1 + min(7, len(adults) / 70)) * budget
    rate *= innovation_modifiers(country)['research'] * sim.rng.uniform(.55, 1.5)
    country.innovation_progress = getattr(country, 'innovation_progress', 0) + rate
    if country.innovation_progress < project.cost:
        return
    actor = sim.rng.choice([p for p in adults if getattr(p, 'job', '') in ('scientist', 'scholar')] or adults)
    award_innovation(sim, country, project, actor)
    country.innovation_progress = max(0, country.innovation_progress - project.cost)
    country.innovation_project = None


def award_innovation(sim, country, project, actor, borrowed=False):
    """Apply effects once, and reject duplicate or prerequisite-invalid transfers."""
    if not hasattr(country, 'innovations'):
        country.innovations = {}
    if project.id in country.innovations or not project.prerequisites <= country.technologies:
        return False
    country.innovations[project.id] = sim.year
    for attribute, gain in zip(('food', 'prosperity', 'research', 'stability'), project.effects):
        value = getattr(country, attribute, 0) + gain
        setattr(country, attribute, value if attribute == 'research' else min(100, value))
    actor.fame = min(100, getattr(actor, 'fame', 0) + (4 if borrowed else 10))
    actor.job = 'scientist'
    verb = 'introduced' if borrowed else 'developed'
    sim.record(f'{sim.person_reference(actor)} {verb} {project.name.lower()} in {country.name}; '
               f'{project.description} Its benefits now persist.', 'discovery')
    return True


def share_innovation(sim, donor, recipient, adults):
    ideas = [item for item in acquired_innovations(donor)
             if item.id not in getattr(recipient, 'innovations', {})
             and item.prerequisites <= recipient.technologies]
    if ideas and adults:
        return award_innovation(sim, recipient, sim.rng.choice(ideas), sim.rng.choice(adults), True)
    return False
