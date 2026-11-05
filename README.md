# Commonworld

Open `civsim.py` from this folder in Thonny and press Run. Enter the number of
years to simulate. At each yearly prompt, press Enter to advance one year or
type a command. Inspection commands do not advance time, consume random numbers,
or change the simulation. Editing commands change the world immediately without
advancing time. `quit` stops early and prints the summary.

The default remains 2,000 people across four countries. No packages need installing.

## Commands

| Command | View |
| --- | --- |
| `help` | Available commands |
| `help edit` | Complete editing syntax and supported fields |
| `people [QUERY] [page=N]` | Searchable directory of living and deceased people by name |
| `person NAME` | A person's family, age, wealth, occupation, roles, health and recorded history |
| `settlements [QUERY] [page=N]` | Settlement names, populations and countries |
| `settlement NAME` | Founder, settlement status, residents, capital status and recorded history |
| `demographics [COUNTRY]` | Population, age bands, occupations, wealth, health and birth/death records |
| `wars [COUNTRY]` | Campaigns, mobilization, supply, exhaustion, territorial objectives and truces |
| `diseases [COUNTRY]` | Disease types and current case counts, including retired types |
| `disease NAME` | Disease course, annual baseline risks, current cases, immunity, health events and annual trends |
| `countries` | Country populations, governments, economies and conditions |
| `country NAME` | Country details, leader, treasury, discoveries and settlements |
| `rich` or `richest` | Twenty richest living people and their actual wealth |
| `roles` or `government` | Rulers and public offices |
| `notables` | Living public figures (`people` now opens the full directory) |
| `inventions`, `discoveries` or `innovations` | Acquired foundations, applied innovations, effects and research projects |
| `lineage` or `lineages` | Family branches, founders and living membership |
| `catalog [QUERY] [page=N]` | Discovery names and prerequisites for use with `grant` |
| `changes` | Manual interventions and their population effects |
| `undo` | Restore the most recent edit, including the random state |
| Enter, `next` or `continue` | Advance one year |
| `quit` or `exit` | Stop |

Add a country name to `rich`, `roles`, `notables` or `discoveries` to filter the
view, for example `discoveries NAME`. Country matching ignores case and accepts
partial names. `lineages NAME` filters family-tree blocks by matching text.
Routine lineage announcements and automatic final trees are hidden; ancestry
and historical founders are still retained.

Use `people country=Arden page=2` to browse a country or `people settlement="River Town"` to
find records associated with a settlement. The directory includes deceased
people and labels their status; settlement population counts include only living
residents. `settlements country=Arden` filters by country name. Directories show
50 records per page. Names are the normal way to use every command. For example,
`person Mara Vale II of Arden` shows that individual. A unique short name such as
`person Mara Vale II` also works; Roman I never silently selects Roman II or III.
If a name is ambiguous, the command shows full names you can copy, including
Roman numerals and country suffixes. Use names that exist in your current world.

## Editing the world

Type `help edit` in the simulator for the complete reference. These examples use
illustrative names; substitute the names shown in your current simulation:

```text
set person "Mara Vale II of Arden" wealth 500
set person "Mara Vale II of Arden" job scientist
move person "Mara Vale II of Arden" "River Town"
add person "River Town" name=Ada age=25 surname=Vale
add person "River Town" name=Mara age=0 parent="Mara Vale II of Arden"
delete person "Mara Vale II of Arden"
add settlement Arden name=Newhaven founder="Mara Vale II of Arden" residents=40
set settlement Newhaven name="River Town"
add country "River Town" name=Newland
set country Arden economy communism
set country Arden government council
set country Arden ruler "Mara Vale II of Arden"
delete settlement Newhaven to="River Town"
delete country Newland to=Arden
add lineage "Mara Vale II of Arden" surname=Branch
add disease "Glass fever" course=acute infection=.4 death=.02 recovery=.85
outbreak Arden "Glass fever" cases=5
set disease "Glass fever" recovery .95
infect "Mara Vale II of Arden" "Glass fever"
cure "Mara Vale II of Arden"
delete disease "Glass fever"
grant Arden irrigation
grant Arden "crop rotation"
revoke Arden irrigation
war Arden Newland
peace Arden Newland years=5
trigger Arden Famine
trigger Arden Abundance
disaster Arden flood severity=major
set simulation war_chance .25
undo
```

These are separate examples, not a script to paste in sequence. Multiword names
in editing commands need quotes. Parent, founder, ruler, lineage and destination
options also accept names. For two parents, use `parent="Mara Vale II of Arden,Dalen Vale of Arden"`.
Use `catalog` to find discovery names for `grant`. Founding a settlement relocates existing
residents; founding a country makes an inhabited settlement secede. These manual
actions bypass random founding chances and thresholds but still need adult
founders and valid destinations. Village/town/city status follows population.

Deleting a person records a death, distributes their estate, and retains the
person in the archive. Removing an inhabited settlement requires a receiving
settlement; removing a country requires a receiving country. Diseases are
eradicated while their historical records remain inspectable. Revoking a
foundation also removes discoveries that require it. Age changes must preserve
parent/child chronology, and a country ruler must be a living adult resident.
Balances/research accept finite values up to one trillion, country scores and
fame use 0-100, and probabilities use 0-1.

`war` respects existing truces; use `war Arden Newland force=true` to deliberately break
one. `trigger` can override a crisis cooldown, but repeated rolls do not extend
an active famine/drought beyond its normal limit. Natural processes can change
edited conditions, offices, quarantine, or fortunes in subsequent years.

Invalid edits leave the world and random state unchanged. `undo` restores only
the most recent successful edit and expires when you advance a year. Inspections
and rejected edits do not consume undo. Past yearly report data stays intact;
the next report separately lists editor additions/deaths before that year.
`changes` keeps a manual intervention log. Undo and intervention logs are held
in memory for the current run; they are not a save/load system.

Demographic historical counts use current/last citizenship because the simulation
does not maintain every past residence. Disease trend rows show recorded annual
processing; current cases and health-event totals reflect edits immediately.

### Optional advanced ID lookup

If you prefer internal IDs, `ids person Mara` searches people and shows their IDs
beside their full names. Other examples are `ids settlement "River Town"`,
`ids country Arden`, `ids lineage Vale`, and `ids discovery "seed selection"`.
Use `ids SEARCH` to search people, countries, settlements and lineages together,
or add `page=2` to browse further results. IDs are only shown in this advanced view.

The ID in brackets can replace a name in commands: for example, `person 12`
or `set person #12 wealth 500`. Do not type the display brackets. Numeric IDs
accept either plain numbers or a `#` prefix. `help ids` explains this optional
shortcut; you never need IDs for ordinary name-based commands.

## Expanded systems

- Personal wealth changes through production, consumption, returns on capital,
  taxation, redistribution and inheritance. Offices include treasurer, chief
  scholar, chief physician and minister. Monarchs' children have royal status;
  discoveries and creative successes can make people famous.
- Political government and economic system are separate. The starting countries
  demonstrate mixed, capitalist and communist economies. Capitalism permits
  private capital returns and lighter taxation; the mixed economy redistributes
  more income; communism pools production and distributes equal per-resident
  shares, retaining a public investment portion. These are simplified fictional
  mechanics. Institutions may change over time independently of monarchy/council.
- There are 34 foundational technologies plus 1,000 **composed** applied
  innovations: ten fields, ten techniques per field, and ten applications per
  technique. These are not 1,000 individually authored historical inventions.
  Prerequisites gate research and peaceful sharing. Persistent effects influence
  production, health, research, army supply and combat, with bounded bonuses.
- The event catalog contains 1,500 composed situation/outcome variations, with
  consequences, eligibility conditions and repeat cooldowns. Events favor public
  figures. At least ten visible events are supplied per inhabited simulated year.
- Diseases have acute, chronic or endemic courses. Seasonal transmission,
  susceptibility, finite external introductions, containment and recovery create
  waves. Chronic cases can last years and can recover. Mild endemic diseases can
  recur after immunity wanes. People retain infection, recovery, vaccination and
  disease-death history; outbreak histories are tracked independently by country.
- Famines last at most four active years; droughts at most three. Relief can end
  either earlier. Recovery raises food reserves and gives four clear years before
  the same crisis can recur. Repeated event rolls do not extend an episode.
- Campaigns mobilize at most 8% of residents and 22% of eligible healthy adults,
  further constrained by food and logistics. Wounds keep people out of combat for
  one to three years. Technology, supply, morale and exhaustion affect fighting.
  Sieges can secure territorial objectives; peace can recognize new borders or
  impose limited reparations. Annexation requires a sustained advantage against
  a country's final inhabited territory. Transfers preserve surviving residents
  and settlement allegiance.
- Generated first names and surnames contain at least two letters. Duplicate
  names still use Roman numerals and end with `of [country]`.

## Files, backups and verification

`civsim.py` remains the entry point. Supporting modules are `society.py`,
`epidemiology.py`, `warfare.py`, `civic.py`, `discoveries.py`, `inspection.py`,
and `edit_commands.py`.
Pre-expansion copies of all six sources are in
`backups/expansion_20261021_153653/`. Earlier backups were retained.
The version before this command expansion is retained in
`backups/commands_20261021_190641/`.
The version before the name-first controls and advanced ID lookup is retained in
`backups/name_commands_20261022_154658/`.

Run the regression suite from this folder in PowerShell:

```powershell
python -m unittest discover -v
```

Verified on October 23, 2026: **all 73 tests passed** using that executable,
including inspection, editing, undo and continuation regressions. Checks
include all inspection commands preserving complete state and RNG state; the
actual interactive entry point; wealth, inheritance and economic distribution;
bounded famine/drought episodes; prerequisite validity and sharing; epidemic
growth, peak, deaths, decline and endemic recurrence; recruitment limits; forced
conquest and settlement transfers; and population/death accounting over three
30-year runs starting with 2,000 people. Additional checks cover all new inspection
views, ambiguous inputs, full rollback and undo, manual additions/deaths,
inheritance, country and settlement edits followed by natural years, eradication
of an established disease, and an actual interactive command/edit session.
Tests are kept alongside the simulator.
Name-command checks also cover Roman-numeral selection, ambiguous-name hints,
name-based options, read-only ID search, and backward-compatible numeric controls.

## Running it from a fresh clone

- Install [Node.js](https://nodejs.org) and run `node browser/serve.mjs`, then open http://127.0.0.1:8765 (on Windows, `Start Civilization.cmd` does both).
- The Python tests need only Python 3: `python -m unittest discover -p "test_*.py"`.
- After changing the Python rules, copy the modules to `browser/reference/`, run `python browser/tools/compile_engine.py`, then regenerate the parity fixtures with `browser/tools/reference_fixtures.py` and `browser/tools/reference_long.py` (they write `browser/tests/*.json`, which is not committed) before running `npm test` in `browser/`.
