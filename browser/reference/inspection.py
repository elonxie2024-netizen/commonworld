"""Read-only directories and detailed inspection of simulation records."""
import shlex
import re
from collections import Counter
from statistics import median


def _country_scope(sim, query):
    return resolve_entity(sim.countries, query, 'country').id if query else None


def _demographics(sim, query):
    cid = _country_scope(sim, query)
    people = [p for p in sim.people.values() if cid is None or p.country == cid]
    archived = [p for p in sim.archive.values() if cid is None or p.country == cid]
    title = sim.countries[cid].name if cid is not None else 'World'
    lines = [f'Demographics: {title}, year {sim.year}', f'Living population: {len(people)}',
             f'Children (under 18): {sum(p.age < 18 for p in people)}; adults: {sum(p.age >= 18 for p in people)}', 'Age bands:']
    for low, high in ((0, 5), (6, 17), (18, 35), (36, 55), (56, 75), (76, 199)):
        count = sum(low <= p.age <= high for p in people)
        lines.append(f'  {low}-{high}: {count}')
    born = sum(p.born == sim.year for p in archived)
    dead = sum(p.died == sim.year for p in archived)
    lines.append(f'Archived records dated this year: births {born}; deaths {dead} (includes initial residents born in year 0 and editor additions).')
    lines.append(f'All archived people: {len(archived)}; deceased: {sum(p.died is not None for p in archived)}')
    if cid is None:
        report = next((r for r in reversed(sim.yearly_reports) if r['year'] == sim.year), None)
        if report:
            lines.append(f"Annual simulation report: births {report['births']}; deaths {report['deaths']} (before subsequent edits).")
    else:
        lines.append('Birth/death records are grouped by current or last country, not historical citizenship.')
    lines.append('Country distribution:')
    for country_id, count in sorted(Counter(p.country for p in people).items()):
        lines.append(f'  {sim.countries[country_id].name}: {count}')
    lines.append('Settlement distribution:')
    for sid, count in sorted(Counter(p.settlement for p in people).items(), key=lambda pair: (pair[0] is None, pair[0] or 0)):
        place = sim.settlements.get(sid)
        lines.append(f"  {place.name if place else 'No settlement'}: {count}")
    lines.append('Occupations: ' + (', '.join(f'{job}: {count}' for job, count in sorted(Counter(getattr(p, 'job', 'unrecorded') for p in people).items())) or 'none'))
    wealth = [getattr(p, 'wealth', 0) for p in people]
    lines.append(f'Wealth: total {sum(wealth):,.2f}; mean {sum(wealth)/len(wealth) if wealth else 0:,.2f}; median {median(wealth) if wealth else 0:,.2f}; maximum {max(wealth, default=0):,.2f}')
    immune = sum(any(p.immunity_until.get(name, float('inf')) > sim.year for name in p.immunity) for p in people)
    lines.append(f'Currently infected: {sum(bool(p.infection) for p in people)}; people with unexpired immunity: {immune}')
    return '\n'.join(lines)


def _wars(sim, query):
    cid = _country_scope(sim, query)
    lines = ['Current wars:']
    for pair, started in sorted(sim.wars.items()):
        if cid is not None and cid not in pair:
            continue
        detail = getattr(sim, 'war_details', {}).get(pair, {})
        lines.append(f"  {sim.countries[pair[0]].name} versus {sim.countries[pair[1]].name}: began year {started}; {sim.year-started} elapsed years")
        lines.append(f"    Campaign score: {detail.get('score', 0):.2f} (positive favors first country)")
        for index, country_id in enumerate(pair):
            metrics = []
            for key in ('mobilized', 'supplies', 'exhaustion', 'captures'):
                values = detail.get(key)
                value = values[index] if values and len(values) > index else 'not recorded'
                metrics.append(f'{key}: {value}')
            targets = detail.get('objectives', [])
            target = sim.settlements.get(targets[index]) if len(targets) > index else None
            metrics.append('objective: ' + (target.name if target else 'none recorded'))
            lines.append(f"    {sim.countries[country_id].name}: " + '; '.join(metrics))
    if len(lines) == 1:
        lines.append('  No current wars.')
    lines.append('Truces (including expired records):')
    truces = [(pair, expiry) for pair, expiry in sorted(getattr(sim, 'truces', {}).items()) if cid is None or cid in pair]
    for pair, expiry in truces:
        lines.append(f"  {sim.countries[pair[0]].name} / {sim.countries[pair[1]].name}: expires year {expiry}; {'active' if expiry > sim.year else 'expired'}")
    if not truces:
        lines.append('  none')
    return '\n'.join(lines)


def _diseases(sim, query, detailed=False):
    known = {**getattr(sim, 'retired_sicknesses', {}), **sim.sicknesses}
    if detailed:
        exact = [name for name in known if name.casefold() == query.casefold()]
        matches = exact or [name for name in known if query.casefold() in name.casefold()]
        if not query or not matches:
            raise ValueError('Specify a known disease name. Use diseases to list them.')
        if len(matches) > 1:
            raise ValueError('Ambiguous disease: ' + ', '.join(matches) + '. Use its full name.')
        disease = known[matches[0]]
        name = disease.name
        course = getattr(sim, 'disease_profiles', {}).get(name, {}).get('course', disease.course)
        lines = [f"Disease: {name}{' (retired)' if name not in sim.sicknesses else ''}",
                 f'Course: {course}; recurring: {disease.recurring}; transmission: {disease.transmission}',
                 f'Baseline annual probabilities: infection {disease.infection_chance:.2%}; death {disease.death_chance:.2%}; recovery {disease.recovery_chance:.2%}',
                 f'Incubation steps: {disease.incubation_steps}; immunity years: {disease.immunity_years}; mutation chance: {disease.mutation_chance:.2%}',
                 'Actual risks also depend on disease phase, care, immunity, and country conditions.', 'Current cases by country:']
        for cid, count in sorted(Counter(p.country for p in sim.people.values() if p.infection == name).items()):
            lines.append(f'  {sim.countries[cid].name}: {count}')
        active = sum(p.infection == name for p in sim.people.values())
        immune = sum(name in p.immunity and p.immunity_until.get(name, float('inf')) > sim.year for p in sim.people.values())
        outcomes = Counter(entry.get('event') for p in sim.archive.values() for entry in getattr(p, 'infection_history', []) if entry.get('disease') == name)
        lines.append(f'Active cases: {active}; living people with unexpired immunity: {immune}')
        cure = getattr(sim, 'cure_progress', {}).get(name, 0)
        researchers = sum(p.age >= 18 and p.job in {'scientist', 'healer'} for p in sim.people.values())
        lines.append(f'Cure progress: {cure:.1f}% ({researchers} scientists and healers at work); '
                     + ('eradication is possible once no one is infected.' if cure >= 100 else 'eradication requires 100%.'))
        lines.append('Recorded lifetime health events: ' + (', '.join(f'{event}: {count}' for event, count in sorted(outcomes.items())) or 'none'))
        lines.append('Local annual trends (last 10 recorded years per country):')
        for country in sim.countries.values():
            records = {**getattr(country, 'retired_outbreaks', {}), **getattr(country, 'disease_outbreaks', {})}.get(name, {}).get('annual', [])
            for record in records[-10:]:
                lines.append(f"  {country.name}, year {record['year']}: infections {record['infections']}; deaths {record['deaths']}; recoveries {record['recoveries']}; active {record['active']}; {record.get('phase', 'unrecorded phase')}")
        return '\n'.join(lines)
    cid = _country_scope(sim, query)
    people = [p for p in sim.people.values() if cid is None or p.country == cid]
    cases = Counter(p.infection for p in people if p.infection)
    lines = ['Known disease types' + (f' (case counts in {sim.countries[cid].name})' if cid is not None else ' (world case counts)') + ':']
    for name, disease in sorted(known.items()):
        course = getattr(sim, 'disease_profiles', {}).get(name, {}).get('course', disease.course)
        lines.append(f"  {name}: {course}; cases {cases[name]}{' | retired' if name not in sim.sicknesses else ''}")
    if not known:
        lines.append('  No known disease types.')
    return '\n'.join(lines)


def resolve_entity(mapping, query, label, name_fn=None):
    """Names are primary; numeric IDs remain an optional advanced shortcut."""
    name_fn = name_fn or (lambda item: item.name)
    query = str(query).strip()
    if not query:
        raise ValueError(f"Specify a {label} name.")
    if query in mapping:
        return mapping[query]
    key_matches = [item for key, item in mapping.items() if isinstance(key, str) and key.casefold() == query.casefold()]
    if len(key_matches) == 1:
        return key_matches[0]
    number = query.lstrip('#')
    if number.isdecimal():
        item = mapping.get(int(number))
        if item is None:
            raise ValueError(f"No {label} with ID #{number}.")
        return item
    exact = [item for item in mapping.values() if name_fn(item).casefold() == query.casefold()]
    # Allow a personal name without its country suffix, keeping I distinct from
    # II/III. Never let a missing "Mara Vale I" silently target "Mara Vale II".
    short = [item for item in mapping.values()
             if name_fn(item).rsplit(' of ', 1)[0].casefold() == query.casefold()]
    pattern = re.compile(r'(?<!\w)' + re.escape(query.casefold()) + r'(?!\w)')
    numbered = re.fullmatch(r'[ivxlcdm]+', query.split()[-1].casefold())
    matches = exact or short or [item for item in mapping.values()
        if (pattern.search(name_fn(item).casefold()) if numbered else query.casefold() in name_fn(item).casefold())]
    if not matches:
        raise ValueError(f"No {label} matching {query!r}.")
    if len(matches) > 1:
        candidates = '; '.join(shlex.quote(name_fn(item)) for item in matches[:20])
        suffix = f"; and {len(matches)-20} more" if len(matches) > 20 else ''
        raise ValueError(f"Ambiguous {label}: {candidates}{suffix}. Use one of these full names, including its Roman numeral and country when shown.")
    return matches[0]


def _person_ref(sim, pid):
    person = sim.archive.get(pid)
    return sim.full_name(person) if person else "Unrecorded person"


def _person_detail(sim, person):
    country = sim.countries[person.country]
    settlement = sim.settlements.get(person.settlement)
    lineage = sim.lineages[person.lineage]
    children = [p for p in sim.archive.values() if person.id in p.parents]
    lines = [f"Person: {sim.full_name(person)}",
             f"Status: {'living' if person.id in sim.people else 'deceased'}; age: {person.age}; born: year {person.born}",
             f"Country: {country.name}",
             f"Settlement: {settlement.name if settlement else 'none'}",
             f"Lineage: {sim.lineage_name(lineage.id)}",
             f"Wealth: {getattr(person, 'wealth', 0):,.2f}; occupation: {getattr(person, 'job', 'none')}",
             f"Public role: {getattr(person, 'public_role', '') or 'none'}; fame: {getattr(person, 'fame', 0):.1f}",
             "Parents: " + ('; '.join(_person_ref(sim, pid) for pid in person.parents) or 'unrecorded'),
             "Children: " + ('; '.join(_person_ref(sim, p.id) for p in children) or 'none'),
             f"{'Current infection' if person.died is None else 'Infection at death'}: {person.infection or 'none'}; infection steps: {person.infection_steps}",
             f"Wounds: {'recovering until year ' + str(person.wounded_until) if getattr(person, 'wounded_until', 0) > sim.year else 'none active'}",
             "Immunity records: " + (', '.join(sorted(person.immunity)) or 'none'),
             "Immunity expiry years: " + (', '.join(f"{name}: {year}" for name, year in sorted(person.immunity_until.items())) or 'none')]
    if person.died is not None:
        lines.append(f"Died: year {person.died}; cause: {person.cause_of_death or 'unrecorded'}")
    health = getattr(person, 'infection_history', [])
    lines.append('Health history:')
    lines.extend(f"  Year {entry.get('year', '?')}: {entry.get('event', '?')} - {entry.get('disease', '?')}" for entry in health)
    if not health:
        lines.append('  No recorded infections or vaccinations.')
    marker = f"{{person:{person.id}:"
    events = [(year, message) for year, message in sim.history if marker in message]
    lines.append('Recorded public history:')
    lines.extend(f"  Year {year}: {sim.render_history(message)}" for year, message in events)
    if not events:
        lines.append('  No public events recorded.')
    return '\n'.join(lines)


def _directory(rows, title, page, footer='Use page=N to browse; inspect a record using its displayed name.'):
    pages = max(1, (len(rows) + 49) // 50)
    if page > pages:
        raise ValueError(f"Page {page} does not exist; choose 1 through {pages}.")
    return f"{title} ({len(rows)} matches; page {page}/{pages}):\n" + ('\n'.join(rows[(page-1)*50:page*50]) or 'No matches.') + '\n' + footer


def _id_search(sim, tokens):
    """Optional ID directory, separate from normal name-based views."""
    aliases = {'person': 'person', 'people': 'person', 'persons': 'person',
               'individual': 'person', 'country': 'country', 'countries': 'country',
               'settlement': 'settlement', 'settlements': 'settlement',
               'lineage': 'lineage', 'lineages': 'lineage',
               'discovery': 'discovery', 'discoveries': 'discovery', 'innovation': 'discovery'}
    kind = aliases.get(tokens[0].casefold()) if tokens else None
    tokens = tokens[1:] if kind else tokens
    terms, page = [], 1
    for token in tokens:
        if token.casefold().startswith('page='):
            try:
                page = int(token[5:])
            except ValueError:
                raise ValueError('Page must be a positive integer.') from None
            if page < 1:
                raise ValueError('Page must be a positive integer.')
        else:
            terms.append(token)
    query = ' '.join(terms).casefold()
    entries = []
    if kind in (None, 'person'):
        entries.extend(('person', str(p.id), sim.full_name(p) + (' [deceased]' if p.died is not None else ''))
                       for p in sim.archive.values())
    if kind in (None, 'country'):
        entries.extend(('country', str(c.id), c.name + (' [ended]' if c.ended is not None else '')) for c in sim.countries.values())
    if kind in (None, 'settlement'):
        entries.extend(('settlement', str(s.id), s.name + (' [abandoned]' if s.abandoned is not None else '')) for s in sim.settlements.values())
    if kind in (None, 'lineage'):
        entries.extend(('lineage', str(l.id), sim.lineage_name(l.id)) for l in sim.lineages.values())
    if kind == 'discovery':
        from discoveries import INNOVATIONS
        from society import TECHNOLOGIES
        entries.extend(('innovation', i.id, i.name) for i in INNOVATIONS.values())
        entries.extend(('foundation', name, name) for name in TECHNOLOGIES)
    rows = [f'{label} [{key}]: {name}' for label, key, name in entries
            if query in name.casefold() or query.lstrip('#') == key.casefold()]
    return _directory(rows, 'Advanced ID lookup', page,
        'Names work in all commands. Alternatively use the ID in brackets (without brackets); numeric IDs may also use #. Use page=N to browse.')


def inspect_command(sim, text):
    """Return (display, 'inspect') for supported commands, otherwise None."""
    head = text.strip().split(maxsplit=1)
    if not head or head[0].casefold() not in {'person', 'individual', 'people', 'persons', 'individuals', 'settlement', 'settlements', 'demographics', 'wars', 'disease', 'diseases', 'ids', 'borders', 'geography', 'projects', 'expeditions', 'systems', 'hazards', 'economy', 'tile', 'governments'}:
        return None
    try:
        tokens = shlex.split(text)
        command = tokens.pop(0).casefold()
        if command == 'ids':
            return _id_search(sim, tokens), 'inspect'
        if command == 'projects':
            from development import projects_report
            return projects_report(sim, ' '.join(tokens).casefold()), 'inspect'
        if command == 'expeditions':
            from development import expeditions_report
            return expeditions_report(sim, ' '.join(tokens).casefold()), 'inspect'
        if command == 'systems':
            from systems import report as systems_report
            return systems_report(sim, ' '.join(tokens).casefold()), 'inspect'
        if command == 'economy':
            from economy import report as economy_report
            return economy_report(sim, ' '.join(tokens).casefold()), 'inspect'
        if command == 'governments':
            from governments import describe as governments_report
            return governments_report(sim, ' '.join(tokens).casefold()), 'inspect'
        if command == 'tile':
            from economy import tile_report
            if len(tokens) != 2 or not all(t.lstrip('-').isdigit() for t in tokens):
                raise ValueError('Usage: tile X Y')
            return tile_report(sim, int(tokens[0]), int(tokens[1])), 'inspect'
        if command == 'hazards':
            from systems import hazard_report
            return hazard_report(sim, resolve_entity(sim.settlements, ' '.join(tokens), 'settlement')), 'inspect'
        if command in {'borders', 'geography'}:
            from geography import report
            query = ' '.join(tokens).casefold()
            return report(sim, query), 'inspect'
        if command == 'demographics':
            return _demographics(sim, ' '.join(tokens)), 'inspect'
        if command == 'wars':
            return _wars(sim, ' '.join(tokens)), 'inspect'
        if command in {'disease', 'diseases'}:
            return _diseases(sim, ' '.join(tokens), detailed=command == 'disease'), 'inspect'
        if command in {'person', 'individual'}:
            return _person_detail(sim, resolve_entity(sim.archive, ' '.join(tokens), 'person', sim.full_name)), 'inspect'
        if command == 'settlement':
            place = resolve_entity(sim.settlements, ' '.join(tokens), 'settlement')
            residents = sorted((p for p in sim.people.values() if p.settlement == place.id), key=lambda p: p.id)
            country = sim.countries[place.country]
            from geography import describe
            lines = [f"Settlement: {place.name}", f"Country: {country.name}; kind: {place.kind}",
                     f"Terrain: {describe(sim, place)} (map cell {place.gx}, {place.gy})",
                     'Buildings: ' + (', '.join(sorted(getattr(place, 'buildings', {}))) or 'none'),
                     f"Founded: year {place.founded}; founder: {_person_ref(sim, place.founder)}",
                     f"Abandoned: {('year ' + str(place.abandoned)) if place.abandoned is not None else 'no'}",
                     f"Removed by editor: {('year ' + str(place.demolished)) if getattr(place, 'demolished', None) is not None else 'no'}",
                     f"Population: {len(residents)}; capital: {'yes' if country.capital == place.id else 'no'}", 'Residents:']
            lines.extend('  ' + _person_ref(sim, p.id) for p in residents[:50])
            if not residents:
                lines.append('  none')
            if len(residents) > 50:
                lines.append(f'  Showing 50 of {len(residents)}. Use people settlement={shlex.quote(place.name)} page=N for more.')
            lines.append('Recorded history (name mentions):')
            events = [(year, message) for year, message in sim.history if place.name.casefold() in message.casefold()]
            lines.extend(f'  Year {year}: {sim.render_history(message)}' for year, message in events)
            if not events:
                lines.append('  No events recorded.')
            return '\n'.join(lines), 'inspect'
        page = 1
        query_parts = []
        settlement_id = None
        country_id = None
        for token in tokens:
            if token.casefold().startswith('page='):
                try:
                    page = int(token[5:])
                except ValueError:
                    raise ValueError('Page must be a positive integer.') from None
                if page < 1:
                    raise ValueError('Page must be a positive integer.')
            elif token.casefold().startswith('settlement=') and command != 'settlements':
                settlement_id = resolve_entity(sim.settlements, token.split('=', 1)[1], 'settlement').id
            elif token.casefold().startswith('country='):
                country_id = resolve_entity(sim.countries, token.split('=', 1)[1], 'country').id
            else:
                query_parts.append(token)
        query = ' '.join(query_parts).casefold()
        if command == 'settlements':
            rows = []
            for place in sorted(sim.settlements.values(), key=lambda s: s.id):
                if country_id is not None and place.country != country_id:
                    continue
                country = sim.countries[place.country]
                if query and query not in place.name.casefold() and query not in country.name.casefold() and query not in {str(place.id), '#' + str(place.id)}:
                    continue
                population = sum(p.settlement == place.id for p in sim.people.values())
                rows.append(f"{place.name} | {country.name} | {place.kind} | population {population}" + (' | abandoned' if place.abandoned is not None else ''))
            return _directory(rows, 'Settlements', page), 'inspect'
        rows = []
        for person in sorted(sim.archive.values(), key=lambda p: p.id):
            if country_id is not None and person.country != country_id:
                continue
            if settlement_id is not None and person.settlement != settlement_id:
                continue
            name = sim.full_name(person)
            if query and query not in name.casefold() and query not in {str(person.id), '#' + str(person.id)}:
                continue
            rows.append(f"{name} | age {person.age} | {'living' if person.id in sim.people else 'deceased'}")
        return _directory(rows, 'People (living and deceased)', page), 'inspect'
    except ValueError as error:
        return str(error), 'inspect'
