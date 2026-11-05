# Commonworld — Civilization in your browser

Double-click **Start Civilization.cmd** in the parent Civilization sim folder. It opens the dashboard at http://127.0.0.1:8765 using the included portable Node server. No Python process runs the browser simulation. Keep the `browser` folder beside the launcher. The launcher reuses an existing local server.

The original Python files and coursework are preserved. A pre-port backup is in `../backups/before_browser_20261024_104028`.

## Using the dashboard

- **Time:** Next year (or Enter), +5 / +10 years, Play/Stop with speed. Undo reverts the latest edit.
- **World map (Overview):** every living person is a dot, every cluster a settlement. Color people by country, age, wealth, health, or occupation. Hover to identify, click a dot or settlement name to open it. Positions are illustrative only.
- **Pages:** Overview, Countries, Settlements, People, Demographics, Discoveries, Health, Wars, Event log, Workshop. People and Settlements search by name or `#ID`.
- **Click anything** (person, settlement, country, disease) for a detail window with inline editing: sliders, dropdowns, move/infect/cure, triggers, disasters, war and peace.
- **Workshop:** a form for every editing command, with name autocomplete and a live preview of the exact command it will run.
- **Console (bottom bar):** the original command grammar. Names first, quote multiword names; Tab completes names; Up/Down recalls history; `/` focuses it. `ids` gives optional numeric IDs. Inspection never advances time.
- **Save / Open** download and restore a full world including random state.

Examples (a new random seed is chosen each time the page starts; type a seed in the Seed box under New simulation (or in the New simulation dialog) to repeat a world, and that box always shows the current one; these examples assume seed 42):

```text
help
help edit
person "Az Ee of Azar"
settlement Chianona
country Azar
demographics Azar
diseases
wars
discoveries Azar
lineages
richest
ids person Az
set person "Az Ee of Azar" wealth 123
trigger Azar Abundance
add person Chianona name=Ada surname=Vale age=25
undo
```

All existing add/set/delete/move, disease, research, war/peace, disaster, and lineage commands remain available through `help edit`. An edit does not advance the year. Undo restores the most recent edit, including random state; advancing a year expires it. `quit` stops automatic running; the browser remains available for inspection.

## Implementation and verification

`dist/` is a self-contained static HTML/CSS/JavaScript application. `engine.js` contains the generated JavaScript for all eight original simulation modules. The compilation tool converts Python syntax to JavaScript functions, loops, expressions, and classes; it does not send Python source to an interpreter in the browser. `python-runtime.js` supplies collection, calling, copying, formatting, and other language semantics, and `python-random.js` implements the CPython MT19937 random sequence. A Web Worker runs the engine so the dashboard stays responsive.

The compiler intentionally supports the syntax used by this simulator, not arbitrary Python projects. Unsupported syntax fails the build. `reference/` preserves the source modules used for the port. When maintained beside the original simulator, the compiler reads the original modules; it falls back to these copies for a standalone browser checkout.

Verified with Thonny's Python and the included Node:

- 79 parity scenarios: full initial state; 54 command outputs/actions; 20 annual reports, populations and RNG states; full final state; save/load future continuity; read-only inspection; exact undo. Floating point state comparisons allow a relative tolerance of 1e-9. Error-message comparisons ignore insignificant integer-versus-float `.0` display suffixes.
- 34 additional checks covering disease courses and epidemic growth/decline, famine duration/cooldown, conquest ownership, rejected-edit atomicity, and duplicate Roman-numeral names.
- Original 73 Python regression tests remain passing.
- Chrome checks at desktop and mobile sizes: navigation, dialogs, name commands, inspection, edit/undo, year advancement, no horizontal mobile overflow or JavaScript errors.

From the parent simulator folder, regenerate and test with:

```powershell
python browser\tools\compile_engine.py
python browser\tools\reference_fixtures.py
& browser\tools\node.exe browser\tests\parity.mjs
& browser\tools\node.exe browser\tests\invariants.mjs
```

The disease catalog retains acute, chronic, and endemic rules; discoveries retain 34 foundations and 1,000 composed technique/application innovations, plus 1,500 event variants. This is the existing simulation, with its rules and limitations, presented visually. Very large populations and long histories require more processing and memory; save files grow with the archive.

## Geography, health, and news (latest additions)

- **Geography is part of the simulation.** A 40×24 terrain grid (ocean, plains, forest, hills, mountains, desert) is generated from the seed with its own hash noise, so it never disturbs the main random generator. Every settlement sits on a land cell. Countries share a **land border** when their settlements are within 14 cells on one landmass; across water within 12 cells they are **sea neighbors**.
- **What geography changes:** wars can only start between bordering countries and target the nearest enemy settlement; defensive terrain (hills, mountains, forest) strengthens defenders; disease only travels over land borders (and sometimes across a strait); waterborne disease spreads faster on coasts; coasts flood and storm, forests and deserts burn, highlands shake; deserts bring droughts; fertile land raises food. Inspect it with `borders [COUNTRY]` or `settlement NAME`.
- **Map views (Overview):** *Settlements* (people as dots, colored by country, age, wealth, health, or occupation) and *Geography* (terrain, territory, borders, war fronts in red, settlement markers; toggle Terrain, Borders, Names).
- **Health:** per disease and per country, how many are infected now, have recovered, and have died, with cases per year.
- **Cures:** scientists and healers raise each disease's cure percentage every year (healers count fully where the disease is active; medical technology helps; chronic diseases are slower). A partial cure lowers spread and deaths. A disease is **eradicated automatically** at the end of the year once its cure reaches 100% and nobody is infected, and the news says so. `eradicate DISEASE` (or `delete disease`) does it early, but still only at 100% cure with nobody infected. `set disease NAME cure 0-100` is the tinkering override.
- **Breaking news (top right of the Overview):** the lead story and recent headlines, written from the event log and ranked by importance. Click one for the original text.
- Changing the simulation means the browser reference fixtures were regenerated; run the compile, fixture, parity, and invariant commands above after any Python change. The Python suite now has 74 tests.

## A living map: geography, settlers, construction, disasters, and cross-system effects

- **Bigger world.** The map is now 120×72 cells with oceans, lakes, plains, forest, hills, mountains, desert, swamp and tundra, rivers that run from the highlands to the sea, and resources (ore, timber, grain, fish, game). Each seed gives a different continent layout. Open **World map** for the full-size view (Geography has layer toggles, a hazard heat map for each disaster type, and a map key), or use the smaller map on the Overview.
- **Settlers you can watch.** When a town is large, stable and its country wants land, a party leaves and **walks** across the map for years (rough terrain, rivers and mountains slow and endanger them; roads speed them up). Only when they arrive does the new town exist. Family migrations and refugees travel the same way. Console: `expeditions`, `settle TOWN [x= y= size=]`.
- **Buildings.** Workers build granaries, markets, schools, libraries, universities, clinics, hospitals, aqueducts, walls, harbors, levees, firebreaks, reinforced halls, monuments, theaters, mines, mills and roads, paid from the national treasury. Under construction they show a progress ring. Console: `projects`, `build TOWN KIND`, `build TOWN road to=OTHER`. Roads are drawn on the map and make travel faster.
- **Disasters from geography.** Floods follow rivers and low coasts, storms hit open coasts, fires burn forests and deserts, earthquakes and landslides follow steep highlands, blizzards hit cold peaks. A disaster has an epicenter and radius, can strike several towns across borders, and is pulsed on the map. Levees, firebreaks and reinforced halls protect; buildings can be destroyed; ruined towns send refugees. Console: `hazards TOWN`, `disaster COUNTRY TYPE [severity=] [at=TOWN]`.
- **Systems influence each other.** Every year each country's politics, science, culture, economy, health, military and expansion are analysed together, and every effect is explained on the **Systems** page. For example: schools and trade raise research; epidemics cut stability and research; monuments and the arts raise stability; war slows building and the arts and spreads camp fever; trade and crowding spread disease; floods spread waterborne disease; neighbors with ore, low stability and shared borders raise the chance of war; stable monarchies expand fastest. Console: `systems [COUNTRY]`.
- **Verification.** `geography.py`, `development.py`, `systems.py` and `disasters.py` are compiled with the rest of the engine. The Python suite has 88 tests; the JavaScript engine matches Python exactly over 30 simulated years (89 parity checks).

## Continents, islands, boats, armies, merchants, wonders, and epidemics on the map

- **Bigger, more varied world.** 120×72 cells with four to six continents and scattered islands, all different for each seed. Open **World map** for the full-size view; zoom in for terrain detail, resources, building icons and labels.
- **Settlers are rare and need free land.** Town-founding parties leave only a few times a century, and only settle **unclaimed** land (never inside any country's claim). Countries that know sailing may send a **boat** across the sea to an island or another continent; you can watch it sail with its wake and a "settlers · by sea" label. Small family migrations are drawn as small dots.
- **Soldiers on the march.** Every war sends labelled armies (country, soldier count) along real routes to the enemy town they are fighting for; an army at the walls is marked as a siege and improves its side's odds of capturing the town.
- **Merchant bands.** Caravans (wagons by land, ships by sea) carry cargo between trading countries. Large bands get a gold ring and a label, and a band with sick merchants carries its disease into the town it reaches.
- **Epidemics.** Towns with outbreaks get a dashed ring and a "☣ N sick" label; a disease first seen in the last three years is flagged **NEW** with its name. The Epidemics panel lists them.
- **Wonders and landmarks.** Each country can build one Royal palace, Grand academy, Lighthouse and Great fortress, drawn as gold diamonds with their name. Universities, hospitals, observatories, monuments, harbors, libraries, theaters and mines show as icons above their town even when zoomed out.
- Commands: `expeditions`, `settle TOWN [x= y= size=]` (sails if the target is overseas and the country knows sailing), `projects`, `systems`.

## Resources, economy and governments

- Every land tile holds up to three deposits (grain, pasture, fish, game, timber, stone, clay, iron, copper, coal, gold, salt, furs). Click a tile on the Geography map for its deposits.
- Towns work the deposits in their claim, nearest first. A deposit worked down to nothing is **exhausted**: it refills slowly and cannot be worked again until completely full. Contested war tiles cannot be worked; disasters destroy part of the deposits they hit.
- Goods go into national stockpiles, spoil, are traded between peaceful neighbors at scarcity prices, and are taxed. Hunger, missing building materials and missing metal feed back into food, stability, prosperity, construction speed, and army strength. See the **Economy** page, or the `economy [COUNTRY]`, `tile X Y` and `governments` commands.
- Eleven forms of government (tribal, monarchy, council, republic, democracy, theocracy, junta, oligarchy, empire, merchant republic, tyranny) change war, trade, science, culture, taxes, resource quotas and how rulers are chosen. Countries drift between them. The Countries page lists each form.

## Technology, ages and settlements you can see

- **259 discoveries in 15 ages** (Old and New Stone, Early and Late Bronze, Early and Late Iron, Classical, Late Antiquity, Early and High Middle Ages, Renaissance, Age of Reason, Industrial, Age of Steel, Electric) across 11 topics: agriculture, industry, energy, construction, warfare, seafaring, trade, knowledge, culture, medicine and governance. The **Tech tree** page draws the whole tree: ages are vertical bands, topics are horizontal lanes, and every prerequisite is a curved line from what a discovery needs to the discovery (a gray web, black for the discovery you hover). Hover a discovery to follow its lines; drag to scroll. A country's age arrives once it knows about a third of that age's discoveries, and the ages come slowly: in test runs the first Bronze Age is around year 100 to 150 and the Iron Age 50 to 100 years later. Small effects add up toward a ceiling, so a huge tree does not make countries all-powerful. Chains lean on each other: metallurgy needs fuel, bellows and furnaces; ships need sails, rudders, hulls and engines; gunpowder needs alchemy; a few discoveries need "one of" two alternatives (the tooltip says so). A country can only research discoveries up to three ages beyond the age it has reached (`MAX_LEAD`), so a single deep path cannot leap ahead. New kinds of effect: culture, stability, building speed, disaster damage and food spoilage.
- **Knowledge crosses borders**: discoveries are dear to work out alone, but countries pick up what their neighbors already know, a little at a time, as part-way knowledge of a specific discovery (shown on the tree as "% learned"). It comes from three places, each scaled by the sending country's production and then by the receiving country's research power: **settlers** from a neighboring country who move in, **merchants** (caravans and trade events), and the **Trade science** tool (`trade science COUNTRY COUNTRY`; not during a war). When the pieces add up to a whole discovery it is simply learned, and any part counts toward a project already under way. If you **conquer** a country you do not receive its discoveries; instead you research each one the conquered people held **twice as fast** (marked 2× on the tree), and your scholars favor them. A **science pact** (`trade pact COUNTRY COUNTRY`, the Science pact tool, or the country's Diplomacy section) makes two countries share what they learn every year, even without a shared border, until war breaks it; neighbors also form pacts now and then on their own. The country page lists what it is currently learning, and on the tree the search box and the Ready / Learning / 2× chips dim everything else. Gold bulbs on the map mark caravans and newcomers carrying know-how across a border. Map art follows each country's age, all 15 of them: houses, halls, other buildings, the ground under a town, armies, ships, caravans and settler parties get new colours and a new feature (smoke, tiled roofs, chimneys, steel, solar panels) and a new style of banner every time the country enters a new age, so two neighbors in different ages look different.
- **Research is steered, not random**: hunger pushes farming, epidemics push medicine, war pushes weapons, coasts push seafaring, treasuries push trade, and techs that unlock many others rank higher.
- **Every discovery changes the numbers**: army strength, siege power and fortification (spears, legions, knights, muskets, rifles, castles, bastions, artillery), battle lethality, waterborne, airborne and contact disease, hospital capacity and cure speed, ship and wagon speed, farming yields, trade and research. Metal, coal and salt demand rises with gunpowder, steam and rails.
- **The map shows the age**: soldiers, ships and wagons are drawn differently in each age, and buildings change style from thatched huts to marble halls, timber and slate, brick and factories.
- **Settlements are drawn as places**: a village is one tile with a couple of huts; a town is a cross of tiles with houses and workshops; a city is a 3×3 block with its seat of government in the middle (named for its form of government) and two or three buildings on each surrounding tile. Walls ring towns and cities. Buildings are unlabeled; hover one to read its name.

## Testing

- `python tools/reference_fixtures.py` and `python tools/reference_long.py` rebuild the Python reference data (30-year state and 54 commands; 120 years of yearly aggregates). Rebuild both after any change to the simulation, then `python tools/compile_engine.py`.
- `npm test` (or run the files by hand with `tools\node.exe`) checks that the browser engine matches Python exactly: full state and RNG for 30 years (`parity.mjs`), 120 years of population, treasuries, techs, wars, settlements, depleted deposits and RNG (`parity_long.mjs`), and rule invariants (`invariants.mjs`).
- `python tests/browser_qa.py` drives Chrome through every page, runs 40 years, toggles every map layer, checks that resources stay off until asked for, hovers and clicks buildings, and checks the political map, the Economy and Tech pages, and mobile layout.
- Python unit tests: `python -m unittest discover -p "test_*.py"` in the project folder (about three minutes).
