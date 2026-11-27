// Who you are beyond numbers: traits (what you are like) and perks (what you have learned to do well).
// Both only nudge a handful of multipliers, read by mods(pl):
//   income   more (or less) of every wage and profit      fame   more fame from everything you do
//   learn    skill and knowledge grow faster               social contacts grow faster
//   luck     added to the odds of ventures and contests    upkeep what your holdings cost to keep
// A person's traits are plain ids stored on the player record, so a save keeps them.

/** Traits you can be born with or grow into. `born` ones are drawn at the start of a life. */
export const TRAITS = {
  shrewd:        {label: 'Shrewd', born: true, text: 'Quick with figures: earns a little more from everything.', mods: {income: 0.1}},
  charming:      {label: 'Charming', born: true, text: 'People like you: contacts come quickly.', mods: {social: 0.3}},
  scholarly:     {label: 'Scholarly', born: true, text: 'A quick mind: you learn faster.', mods: {learn: 0.3}},
  bold:          {label: 'Bold', born: true, text: 'Fortune favours you in risky ventures.', mods: {luck: 0.05}},
  generous:      {label: 'Generous', born: true, text: 'Free with what you have: more fame, a lighter purse.', mods: {fame: 0.2, income: -0.05}},
  frugal:        {label: 'Frugal', born: true, text: 'You waste nothing: holdings cost far less to keep.', mods: {upkeep: -0.4}},
  patient:       {label: 'Patient', born: true, text: 'Good things come: you learn and earn a little more steadily.', mods: {learn: 0.12, income: 0.04}},
  // earned through what you do
  veteran:       {label: 'Veteran', text: 'You have seen war: respected, and hard to rattle.', mods: {fame: 0.1, luck: 0.02}},
  philanthropist:{label: 'Philanthropist', text: 'Known for giving in hard times.', mods: {fame: 0.15, social: 0.1}},
  miser:         {label: 'Miser', text: 'Known for keeping what you have.', mods: {income: 0.06, fame: -0.1}},
  steadfast:     {label: 'Steadfast', text: 'You stayed when others fled.', mods: {fame: 0.08, social: 0.08}},
  schemer:       {label: 'Schemer', text: 'You buy people. It works, and people know it.', mods: {social: 0.2, fame: -0.05}},
  tycoon:        {label: 'Tycoon', text: 'You built a fortune.', mods: {income: 0.1}},
  celebrated:    {label: 'Celebrated', text: 'Your name is known far and wide.', mods: {fame: 0.2}},
  master:        {label: 'Master of the craft', text: 'Nobody does it better.', mods: {income: 0.08, luck: 0.03}},
  sage:          {label: 'Sage', text: 'A great mind.', mods: {learn: 0.2}},
  beloved:       {label: 'Beloved', text: 'Everyone seems to be your friend.', mods: {social: 0.3}},
  upright:       {label: 'Upright', text: 'A reputation for honest dealing.', mods: {fame: 0.1, luck: 0.02}},
  statesman:     {label: 'Statesman', text: 'You rose to high office.', mods: {fame: 0.15, social: 0.15}},
  landowner:     {label: 'Landowner', text: 'You own a good deal of the country.', mods: {income: 0.05, upkeep: -0.15}},
  founder:       {label: 'Founder of a line', text: 'A family that will outlive you.', mods: {fame: 0.1}},
  patron:        {label: 'Patron', text: 'You see great things through.', mods: {fame: 0.1, learn: 0.1}},
  spouse:        {label: 'Married', text: 'You have a partner at your side.', mods: {luck: 0.02, social: 0.05}},
  wary:          {label: 'Wary', text: 'Robbed once, never twice.', mods: {luck: 0.02}}
};
export const MAX_TRAITS = 7;

/** Perks: bought with points (one point every three years of play, one for each ambition you fulfil). */
export const PERKS = {
  haggler:   {label: 'Haggler', cost: 1, text: 'Earn 8% more from every wage and profit.', mods: {income: 0.08}},
  quick:     {label: 'Quick study', cost: 1, text: 'Skill and knowledge grow 25% faster.', mods: {learn: 0.25}},
  tongue:    {label: 'Silver tongue', cost: 1, text: 'Contacts grow 25% faster.', mods: {social: 0.25}},
  name:      {label: 'A name that carries', cost: 1, text: 'Everything you do earns 20% more fame.', mods: {fame: 0.2}},
  thrifty:   {label: 'Thrifty', cost: 1, text: 'Holdings cost 30% less to keep.', mods: {upkeep: -0.3}},
  lucky:     {label: 'Lucky star', cost: 2, text: '+4% on every venture and contest.', mods: {luck: 0.04}},
  hand:      {label: 'Master’s hand', cost: 2, text: 'Earn 12% more. Needs skill 50.', mods: {income: 0.12}, need: ['skill', 50]},
  mind:      {label: 'Great mind', cost: 2, text: 'Learn 25% faster still. Needs knowledge 50.', mods: {learn: 0.25}, need: ['knowledge', 50]},
  web:       {label: 'Web of friends', cost: 2, text: 'Contacts grow 30% faster and your friendships never drift. Needs connections 50.', mods: {social: 0.3}, need: ['connections', 50]},
  grace:     {label: 'Good graces', cost: 2, text: 'Fame grows 20% faster still. Needs honor 25.', mods: {fame: 0.2}, need: ['honor', 25]}
};

/** The summed multipliers of everything this person is and has learned. */
export function mods(pl) {
  const m = {income: 0, fame: 0, learn: 0, social: 0, luck: 0, upkeep: 0};
  for (const id of pl?.traits ?? []) for (const k in TRAITS[id]?.mods ?? {}) m[k] += TRAITS[id].mods[k];
  for (const id of pl?.perks ?? []) for (const k in PERKS[id]?.mods ?? {}) m[k] += PERKS[id].mods[k];
  m.upkeep = Math.max(-0.8, m.upkeep);
  return m;
}
export const hasTrait = (pl, id) => (pl?.traits ?? []).includes(id);

/** Give a trait (once); returns true if it was new. The oldest earned trait makes room when the list is full. */
export function gainTrait(pl, id) {
  if (!TRAITS[id]) return false;
  pl.traits ??= [];
  if (pl.traits.includes(id)) return false;
  pl.traits.push(id);
  while (pl.traits.length > MAX_TRAITS) { const i = pl.traits.findIndex(t => !TRAITS[t].born); pl.traits.splice(i < 0 ? 0 : i, 1); }
  return true;
}
