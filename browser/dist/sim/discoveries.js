/**
 * Applied innovations: 100 real technique families x 10 relevant applications.
 *
 * These are fictional local adaptations, not claims of 1,000 separate historical
 * first inventions. Each field has ten techniques and ten application contexts.
 * Foundation prerequisites gate the field; advanced techniques need more foundations.
 */

import {capitalize, enumerate, format, isSubset, round, zip} from './runtime.js';

export class Innovation {
  constructor({id, name, field, prerequisites, cost, effects, modifiers, description}) {
    this.id = id;
    this.name = name;
    this.field = field;
    this.prerequisites = prerequisites;
    this.cost = cost;
    this.effects = effects;
    this.modifiers = modifiers;
    this.description = description;
    Object.freeze(this);
  }
}
// field: [foundations, techniques, applications, immediate effects, persistent bonus]
export const FIELDS = new Map([
  ['agriculture', [
    ['irrigation', 'crop rotation'],
    'contour planting|seed selection|composting|mulching|drainage channels|water scheduling|intercropping|fallow management|terracing|soil amendments',
    'river farms|hillside farms|dryland farms|village gardens|orchards|pastures|vegetable plots|grain fields|seed nurseries|estate farms',
    [3, 1, 0, 0],
    ['production', .009]
  ]],
  ['food preservation', [
    ['pottery', 'granaries'],
    'drying racks|salt curing|smoking chambers|sealed jars|cool cellars|fermentation|pest exclusion|moisture checks|stock rotation|raised storage',
    'grain depots|fishing ports|market stores|army kitchens|village pantries|fruit stores|vegetable stores|winter provisions|caravan provisions|public kitchens',
    [3, 1, 0, 1],
    ['production', .007]
  ]],
  ['water engineering', [
    ['irrigation', 'aqueducts'],
    'settling basins|sand filtration|covered conduits|sluice gates|cistern lining|leak detection|gravity channels|overflow drains|inspection shafts|water lifting',
    'town wells|village wells|market districts|bathhouses|public fountains|hill settlements|fortresses|river settlements|workshop districts|farm settlements',
    [2, 1, 0, 1],
    ['infection', -.007]
  ]],
  ['medical care', [
    ['medicine', 'surgery'],
    'wound cleaning|patient observation|splint fitting|clean dressing|symptom recording|rest scheduling|caregiver training|instrument cleaning|recovery monitoring|patient triage',
    'rural clinics|town clinics|field hospitals|port clinics|child care wards|elder care wards|traveler shelters|mining clinics|workshop infirmaries|public hospitals',
    [0, 0, 1, 2],
    ['disease_death', -.009]
  ]],
  ['public health', [
    ['medicine', 'public sanitation'],
    'waste collection|latrine maintenance|water inspection|case reporting|ventilation|food inspection|vermin control|laundry routines|isolation planning|burial safeguards',
    'market districts|army camps|port districts|schools|crowded housing|caravan stops|prisons|public kitchens|mining settlements|refugee shelters',
    [0, 1, 1, 2],
    ['infection', -.009]
  ]],
  ['manufacturing', [
    ['bronze tools', 'ironworking'],
    'standard gauges|tool sharpening|jig fixtures|quality sampling|workshop scheduling|material sorting|furnace insulation|pattern templates|repair manuals|batch production',
    'woodworking|masonry|metalworking|pottery workshops|textile workshops|leatherworking|shipbuilding|cart building|toolmaking|mill construction',
    [0, 3, 1, 0],
    ['production', .009]
  ]],
  ['transport', [
    ['roads', 'navigation'],
    'route surveying|load balancing|waystation planning|drainage maintenance|distance markers|traffic scheduling|cargo records|repair depots|hazard mapping|relay services',
    'coastal routes|river routes|mountain routes|forest routes|grain routes|military routes|postal routes|market routes|mining routes|frontier routes',
    [1, 2, 0, 1],
    ['logistics', .01]
  ]],
  ['military engineering', [
    ['fortification', 'military logistics'],
    'defensive surveying|supply accounting|equipment inspection|signal drills|camp layout|bridge planning|field entrenchment|reserve provisioning|evacuation routes|unit coordination',
    'border garrisons|river defenses|mountain defenses|coastal defenses|capital defenses|frontier patrols|field armies|siege forces|convoy escorts|militia formations',
    [0, 1, 1, 1],
    ['military', .007]
  ]],
  ['scholarship', [
    ['writing', 'universities'],
    'indexed records|comparative observations|error checking|worked examples|standard notation|translation glossaries|teaching demonstrations|catalog systems|measurement tables|replicated trials',
    'agricultural schools|medical schools|navigation schools|engineering schools|astronomical study|mathematical study|craft schools|military schools|merchant schools|public libraries',
    [0, 1, 3, 1],
    ['research', .01]
  ]],
  ['administration', [
    ['writing', 'banking'],
    'audited accounts|standard contracts|duplicate archives|public registers|appeal procedures|scheduled inspections|budget forecasts|inventory ledgers|receipt systems|appointment records',
    'tax offices|grain boards|market authorities|public works offices|army supply offices|port authorities|village councils|land registries|relief offices|trade courts',
    [1, 2, 1, 2],
    ['logistics', .007]
  ]]
]);

export const INNOVATIONS = new Map();
for (const [field_index, [field, data]] of enumerate(FIELDS)) {
  const [foundations, techniques, contexts, effects, modifier] = data;
  for (const [ti, technique] of techniques.split('|').entries()) {
    for (const [ci, context] of contexts.split('|').entries()) {
      const key = [field_index, ti, ci].map(n => format(n, '02d')).join('-');
      // First five techniques are early adaptations; others need advanced knowledge.
      const req = new Set(ti < 5 ? foundations.slice(0, 1) : foundations);
      const strength = 1 + ci / 20;
      INNOVATIONS.set(key, new Innovation({
        id: key,
        name: `${capitalize(technique)} for ${context}`,
        field,
        prerequisites: req,
        cost: 9 + ti * 2 + ci,
        effects: effects.map(v => round(v * strength, 2)),
        modifiers: [[modifier[0], modifier[1] * strength]],
        description: `Local specialists adapt ${technique} to the practical needs of ${context}.`
      }));
    }
  }
}

export function acquired_innovations(country) {
  return [...(country.innovations ?? new Map()).keys()].filter(key => INNOVATIONS.has(key)).map(key => INNOVATIONS.get(key));
}

export function catalog_for(country, acquired = true) {
  if (acquired) return acquired_innovations(country);
  const owned = country.innovations ?? new Map();
  return [...INNOVATIONS]
    .filter(([key, item]) => !owned.has(key) && isSubset(item.prerequisites, country.technologies))
    .map(([, item]) => item);
}

/**
 * Multipliers: production/research/logistics/military >=1; infection/death <=1.
 *
 * Caps prevent hundreds of improvements from causing immortality or runaway armies.
 * Production applies to carrying capacity or economic output; logistics to supply.
 */
export function innovation_modifiers(country) {
  const totals = new Map(['production', 'infection', 'disease_death', 'military', 'logistics', 'research'].map(key => [key, 0]));
  for (const item of acquired_innovations(country)) {
    for (const [key, value] of item.modifiers) totals.set(key, totals.get(key) + value);
  }
  return new Map([...totals].map(([key, value]) => {
    if (['infection', 'disease_death'].includes(key)) return [key, Math.max(.45, 1 + value)];
    const cap = ['production', 'research'].includes(key) ? 2.5 : 1.8;
    return [key, Math.min(cap, 1 + value)];
  }));
}

/** Fund one applied research project annually; unlock at most one per year. */
export function advance_innovations(sim, country, adults) {
  if (adults.length === 0 || country.ended != null) return;
  if (!('innovations' in country)) {
    country.innovations = new Map();
  }
  const available = catalog_for(country, false);
  if (available.length === 0) return;
  let project = available.find(i => i.id === country.innovation_project);
  if (project == null) {
    const weights = available.map(i => (country.food < 45 && ['agriculture', 'food preservation'].includes(i.field))
      || (country.sickness && ['medical care', 'public health'].includes(i.field)) ? 4 : 1);
    project = sim.rng.choices(available, weights, 1)[0];
    country.innovation_project = project.id;
    country.innovation_progress = 0;
  }
  const budget = Math.min(1.5, Math.max(.1, country.prosperity / 60));
  country.prosperity = Math.max(0, country.prosperity - budget * .25);
  let rate = (1 + Math.min(7, adults.length / 70)) * budget;
  rate *= innovation_modifiers(country).get('research') * sim.rng.uniform(.55, 1.5);
  country.innovation_progress = (country.innovation_progress ?? 0) + rate;
  if (country.innovation_progress < project.cost) return;
  const scholars = adults.filter(p => ['scientist', 'scholar'].includes(p.job ?? ''));
  const actor = sim.rng.choice(scholars.length > 0 ? scholars : adults);
  award_innovation(sim, country, project, actor);
  country.innovation_progress = Math.max(0, country.innovation_progress - project.cost);
  country.innovation_project = null;
}

/** Apply effects once, and reject duplicate or prerequisite-invalid transfers. */
export function award_innovation(sim, country, project, actor, borrowed = false) {
  if (!('innovations' in country)) {
    country.innovations = new Map();
  }
  if (country.innovations.has(project.id) || !isSubset(project.prerequisites, country.technologies)) {
    return false;
  }
  country.innovations.set(project.id, sim.year);
  for (const [attribute, gain] of zip(['food', 'prosperity', 'research', 'stability'], project.effects)) {
    const value = (country[attribute] ?? 0) + gain;
    country[attribute] = attribute === 'research' ? value : Math.min(100, value);
  }
  actor.fame = Math.min(100, (actor.fame ?? 0) + (borrowed ? 4 : 10));
  actor.job = 'scientist';
  const verb = borrowed ? 'introduced' : 'developed';
  sim.record(`${sim.person_reference(actor)} ${verb} ${project.name.toLowerCase()} in ${country.name}; ${project.description} Its benefits now persist.`, 'discovery');
  return true;
}

export function share_innovation(sim, donor, recipient, adults) {
  const owned = recipient.innovations ?? new Map();
  const ideas = acquired_innovations(donor).filter(item => !owned.has(item.id) && isSubset(item.prerequisites, recipient.technologies));
  if (ideas.length === 0 || adults.length === 0) return false;
  return award_innovation(sim, recipient, sim.rng.choice(ideas), sim.rng.choice(adults), true);
}
