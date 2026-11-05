"""Validated, atomic sandbox interventions between simulated years."""
import copy
import math
import shlex
from dataclasses import replace

from inspection import resolve_entity


EDIT_HELP = """Editing commands (no command advances the year):
Use names from people/settlements/countries. Quote names containing spaces.
Include Roman numerals and the country suffix when needed to distinguish people.
set person PERSON name|age|wealth|fame|job|lineage|settlement|country VALUE
set country COUNTRY name|government|economy|food|prosperity|stability|research|treasury|capacity|ruler|quarantine VALUE
set settlement SETTLEMENT name|country VALUE
set simulation war_chance|country_chance|lineage_chance|disaster_chance VALUE
add person SETTLEMENT [name=Ada age=0 surname=Vale lineage=LINEAGE parent=PERSON]
  Choose surname OR lineage OR parent; parent may contain two comma-separated names in quotes.
delete person PERSON  (records a death; ancestry and the person's archive remain)
move person PERSON SETTLEMENT
add settlement COUNTRY [name=Newtown founder=PERSON residents=10]
  Relocates existing residents; default is one adult founder.
delete settlement SETTLEMENT to=DESTINATION  (relocates residents; keeps its history)
add country SETTLEMENT [name=Newland]  (the settlement secedes)
delete country COUNTRY to=DESTINATION  (merges population and territory)
add lineage PERSON [surname=Vale]  (found a family branch)
add disease NAME [course=acute infection=.35 death=.02 recovery=.85 transmission=contact immunity=8]
set disease NAME course|infection|death|recovery|transmission|immunity VALUE
infect PERSON DISEASE | cure PERSON | outbreak COUNTRY DISEASE [cases=5]
eradicate DISEASE | delete disease NAME  (needs a 100% cure and no current infections; keeps records)
set disease NAME cure 0-100  (scientists and healers raise cure progress each year)
grant COUNTRY DISCOVERY_NAME | revoke COUNTRY DISCOVERY_NAME
  grant requires prerequisites; revoke also removes dependent discoveries.
catalog [QUERY] [page=N] | diseases | wars | changes  (information only)
war COUNTRY COUNTRY [force=true] | peace COUNTRY COUNTRY [years=5]
  force=true explicitly breaks an existing truce.
trade science COUNTRY COUNTRY  (each learns part of a discovery the other holds; not during a war)
trade pact COUNTRY COUNTRY | trade end COUNTRY COUNTRY  (a standing science pact; war ends it)
trigger COUNTRY Famine|Drought|Panic|Health|Calm|Safety|Abundance
disaster COUNTRY flood|storm|wildfire|earthquake|landslide|blizzard [severity=minor|major|severe] [at=SETTLEMENT]
  The disaster is centered on that settlement (default: the country's riskiest) and can reach neighbors.
build SETTLEMENT KIND [force=true] | build SETTLEMENT road to=SETTLEMENT
  KIND: well granary market school library university observatory clinic hospital aqueduct walls harbor
  levee firebreak foundations monument theater mine mill. Needs technology unless force=true.
settle SETTLEMENT [x=CELL y=CELL] [size=N]  (send settlers to found a new town; they travel for years)
undo  (restore the most recent edit; unavailable after advancing a year)
Examples (substitute names from your world):
  set person "Mara Vale II of Arden" wealth 500
  add person "River Town" name=Ada age=25 surname=Vale
Names are the normal controls. Optional advanced shortcut: ids person Mara looks up numeric IDs.
Editing is immediate. Natural yearly births/deaths remain separate from editor additions/deaths."""

EDIT_VERBS = {"set", "add", "delete", "remove", "eradicate", "move", "infect", "cure", "outbreak",
              "grant", "revoke", "war", "peace", "trade", "trigger", "disaster", "build", "settle", "undo"}


def _number(value, low=0, high=None, integer=False):
    try:
        result = int(value) if integer else float(value)
    except (TypeError, ValueError):
        raise ValueError("Expected " + ("an integer" if integer else "a number") + f", got {value!r}.") from None
    if (not integer and not math.isfinite(result)) or result < low or (high is not None and result > high):
        raise ValueError(f"Value must be finite and between {low} and {high if high is not None else 'no upper limit'}.")
    return result


def _name(value):
    value = value.strip()
    if not 2 <= len(value) <= 80 or any(ord(c) < 32 or c in "{}" for c in value):
        raise ValueError("Names must contain 2-80 characters, with no braces or control characters.")
    return value


def _choice(value, choices):
    value = value.lower()
    if value not in choices:
        raise ValueError("Choose one of: " + ", ".join(sorted(choices)) + ".")
    return value


def _options(tokens, allowed):
    options = {}
    for token in tokens:
        key, sep, value = token.partition("=")
        key = key.lower()
        if not sep or not value or key not in allowed or key in options:
            raise ValueError("Options must be unique key=value entries; allowed: " + ", ".join(sorted(allowed)))
        options[key] = value
    return options


def _arity(tokens, count, usage):
    if len(tokens) != count:
        raise ValueError("Usage: " + usage + ". Quote names containing spaces.")


def _person(sim, query):
    return resolve_entity(sim.people, query, "living person", sim.full_name)


def _country(sim, query):
    return resolve_entity({k: c for k, c in sim.countries.items() if c.ended is None}, query, "country")


def _settlement(sim, query):
    return resolve_entity({k: s for k, s in sim.settlements.items()
                           if getattr(s, "demolished", None) is None and sim.countries[s.country].ended is None},
                          query, "settlement")


def _disease(sim, query):
    return resolve_entity(sim.sicknesses, query, "disease")


def _eradication_check(sim, disease):
    """Eradication needs a complete cure and no one currently infected."""
    progress = getattr(sim, "cure_progress", {}).get(disease.name, 0)
    infected = sum(p.infection == disease.name for p in sim.people.values())
    problems = []
    if progress < 100:
        problems.append(f"the cure is only {progress:.0f}% complete (100% required)")
    if infected:
        problems.append(f"{infected} {'person is' if infected == 1 else 'people are'} still infected")
    if problems:
        raise ValueError(f"Cannot eradicate {disease.name}: " + " and ".join(problems) + ".")


def _unique_name(objects, name, exclude=None):
    name = _name(name)
    if any(obj.name.casefold() == name.casefold() and obj is not exclude for obj in objects):
        raise ValueError(f"The name {name!r} is already in use.")
    return name


def _kill(sim, person, cause):
    """One archived death and one estate transfer, without running annual income."""
    if person.id not in sim.people:
        raise ValueError("This person is already deceased.")
    person.died = sim.year
    person.cause_of_death = cause
    sim.lineages[person.lineage].deaths += 1
    del sim.people[person.id]
    heirs = [p for p in sim.people.values() if person.id in p.parents]
    fortune = getattr(person, "wealth", 0)
    if heirs:
        for heir in heirs:
            heir.wealth += fortune / len(heirs)
    else:
        country = sim.countries[person.country]
        while getattr(country, "absorbed_by", None) is not None:
            country = sim.countries[country.absorbed_by]
        country.treasury += fortune
    person.wealth = 0
    person.estate_settled = True


def _cure(sim, person, immunity=True):
    from epidemiology import _history
    if not person.infection:
        raise ValueError("This person has no active infection.")
    name = person.infection
    person.infection = None
    person.infection_steps = 0
    if immunity:
        person.immunity.add(name)
        person.immunity_until[name] = sim.year + sim.sicknesses[name].immunity_years
    _history(person, "recovered", name, sim.year)


def _infect(sim, person, disease):
    from epidemiology import _history
    if person.infection:
        raise ValueError("This person is already infected; cure them before replacing the infection.")
    person.immunity.discard(disease.name)
    person.immunity_until.pop(disease.name, None)
    person.infection = disease.name
    person.infection_steps = 0
    _history(person, "infected", disease.name, sim.year)


def _reconcile(sim, refresh=True, elect=True):
    from civic import initialize_civic, refresh_public_roles
    from society import maintain_rulers
    initialize_civic(sim)
    occupied = {p.country for p in sim.people.values()}
    for c in sim.countries.values():
        if c.id not in occupied:
            c.ended = sim.year if c.ended is None else c.ended
            c.ruler = None
            c.offices = {}
        ruler = sim.people.get(c.ruler)
        if ruler is None or ruler.country != c.id or ruler.age < 18:
            c.ruler = None
    sim.update_settlements(allow_migration=False)
    for pair in list(sim.wars):
        if any(sim.countries[cid].ended is not None for cid in pair):
            del sim.wars[pair]
            getattr(sim, "war_details", {}).pop(pair, None)
    if refresh:
        if elect:
            maintain_rulers(sim)
        refresh_public_roles(sim, announce=False)


def _set(sim, args):
    if len(args) < 3:
        raise ValueError("Usage: set TYPE NAME FIELD VALUE; or set simulation FIELD VALUE.")
    kind = args[0].lower()
    if kind == "simulation":
        _arity(args, 3, "set simulation FIELD VALUE")
        field = _choice(args[1], {"war_chance", "country_chance", "lineage_chance", "disaster_chance"})
        setattr(sim, field, _number(args[2], 0, 1))
        return f"Simulation {field} is now {getattr(sim, field)}."
    _arity(args, 4, "set TYPE NAME FIELD VALUE")
    _, target, field, value = args
    field = field.lower()
    if kind in {"person", "individual"}:
        p = _person(sim, target)
        if field in {"name", "first"}:
            old = p.first
            p.first = _name(value)
            # Preserve duplicate numbering for every surname this person held.
            for key, holders in list(sim.name_holders.items()):
                if key.startswith(old + " ") and p.id in holders:
                    sim.name_holders.setdefault(p.first + key[len(old):], set()).add(p.id)
            sim.register_name(p)
        elif field == "age":
            age = _number(value, 0, 150, True)
            born = sim.year - age
            if any(sim.archive[parent].born + 16 > born for parent in p.parents):
                raise ValueError("That age would make this person less than 16 years younger than a parent.")
            if any(child.born < born + 16 for child in sim.archive.values() if p.id in child.parents):
                raise ValueError("That age would make this person less than 16 years older than a child.")
            p.age = age
            p.born = sim.year - p.age
            if p.age < 18:
                p.job = "child"
            elif p.job == "child":
                p.job = "laborer"
            p.public_role = "" if p.age < 18 else p.public_role
        elif field in {"wealth", "fame"}:
            setattr(p, field, _number(value, 0, 100 if field == "fame" else 1e12))
        elif field == "job":
            from civic import PAY
            job = _choice(value, set(PAY) | {"child"})
            if (p.age < 18) != (job == "child"):
                raise ValueError("Children use job=child; adults need an adult occupation.")
            p.job = job
        elif field == "lineage":
            lineage = resolve_entity(sim.lineages, value, "lineage", lambda l: sim.lineage_name(l.id))
            p.lineage = lineage.id
            sim.register_name(p)
        elif field in {"settlement", "country"}:
            place = _settlement(sim, value) if field == "settlement" else sim.settlements[_country(sim, value).capital]
            p.settlement, p.country = place.id, place.country
        else:
            raise ValueError("Person fields: name, age, wealth, fame, job, lineage, settlement, country.")
        return f"{sim.full_name(p)}: {field} set to {value}."
    if kind == "country":
        c = _country(sim, target)
        if field == "name":
            c.name = _unique_name(sim.countries.values(), value, c)
            sim.names.used_countries.add(c.name)
        elif field in {"food", "prosperity", "stability"}:
            setattr(c, field, _number(value, 0, 100))
        elif field in {"research", "treasury"}:
            setattr(c, field, _number(value, 0, 1e12))
        elif field == "capacity":
            c.capacity = _number(value, 1, 1000000000, True)
            c.capacity_manual = True
        elif field == "government":
            from governments import GOVERNMENTS
            c.government = _choice(value, set(GOVERNMENTS))
            c.government_since = sim.year
            c.last_election = sim.year
        elif field in {"economy", "economic_system"}:
            from civic import SYSTEMS
            c.economic_system = _choice(value, SYSTEMS)
            c.economic_since = sim.year
        elif field == "ruler":
            p = None if value.lower() == "none" else _person(sim, value)
            if p and (p.country != c.id or p.age < 18):
                raise ValueError("A ruler must be a living adult in this country.")
            c.ruler = p.id if p else None
            c.last_election = sim.year
        elif field == "quarantine":
            c.quarantine = _choice(value, {"true", "false", "on", "off"}) in {"true", "on"}
        else:
            raise ValueError("Unknown country field. Type help edit for supported fields.")
        return f"{c.name}: {field} set to {value}."
    if kind == "settlement":
        s = _settlement(sim, target)
        if field == "name":
            s.name = _unique_name(sim.settlements.values(), value, s)
        elif field == "country":
            from warfare import _transfer
            c = _country(sim, value)
            if c.id == s.country:
                raise ValueError("This settlement already belongs to that country.")
            residents_elsewhere = any(p.country == s.country and p.settlement != s.id for p in sim.people.values())
            _transfer(sim, c.id, s.country, s if residents_elsewhere else None)
        else:
            raise ValueError("Settlement fields: name, country. Village/town/city status follows population.")
        return f"{s.name}: {field} set to {value}."
    if kind == "disease":
        disease = _disease(sim, target)
        fields = {"infection": "infection_chance", "death": "death_chance", "recovery": "recovery_chance"}
        if field == "cure":
            from epidemiology import cure_progress
            cure_progress(sim)[disease.name] = _number(value, 0, 100)
            return f"Disease {disease.name}: cure progress set to {value}%."
        if field in fields:
            changes = {fields[field]: _number(value, 0, 1)}
        elif field == "immunity":
            changes = {"immunity_years": _number(value, 1, 100, True)}
        elif field == "course":
            course = _choice(value, {"acute", "chronic", "endemic"})
            changes = {"course": course, "recurring": course == "endemic"}
        elif field == "transmission":
            changes = {"transmission": _choice(value, {"contact", "respiratory", "waterborne"})}
        else:
            raise ValueError("Disease fields: infection, death, recovery, immunity, course, transmission, cure.")
        sim.sicknesses[disease.name] = replace(disease, **changes)
        getattr(sim, "disease_profiles", {}).pop(disease.name, None)
        return f"Disease {disease.name}: {field} set to {value}."
    raise ValueError("Editable types: person, country, settlement, disease, simulation.")


def _add(sim, args):
    if len(args) < 2:
        raise ValueError("Usage: add TYPE TARGET [key=value ...]. Type help edit.")
    kind, target = args[0].lower(), args[1]
    if kind in {"person", "individual"}:
        from civic import initialize_civic
        place = _settlement(sim, target)
        options = _options(args[2:], {"name", "age", "surname", "lineage", "parent"})
        age = _number(options.get("age", "0"), 0, 150, True)
        first = _name(options["name"]) if "name" in options else None
        if sum(k in options for k in ("surname", "lineage", "parent")) > 1:
            raise ValueError("Choose only one of surname, lineage, or parent.")
        parents = tuple(_person(sim, q) for q in options.get("parent", "").split(",") if q)
        if len(parents) > 2 or len({p.id for p in parents}) != len(parents):
            raise ValueError("Use one or two distinct parents.")
        if any(p.age < 18 or p.age - age < 16 for p in parents):
            raise ValueError("Parents must be adults and at least 16 years older than the child.")
        if parents:
            lid = parents[0].lineage
        elif "lineage" in options:
            lid = resolve_entity(sim.lineages, options["lineage"], "lineage", lambda l: sim.lineage_name(l.id)).id
        else:
            surname = _name(options["surname"]) if "surname" in options else None
            lid = sim.new_lineage(sim.next_person)
            sim.lineages[lid].founder_country = place.country
            if surname:
                sim.lineages[lid].surname = surname
        person = sim.add_person(age, lid, place.country, tuple(p.id for p in parents))
        person.settlement = place.id
        if first:
            # add_person reserved a generated name; remove that unused reservation.
            generated = f"{person.first} {sim.lineages[lid].surname}"
            sim.name_holders[generated].discard(person.id)
            person.first = first
            sim.register_name(person)
        initialize_civic(sim)
        return f"Added {sim.full_name(person)}, age {age}, to {place.name}."
    if kind == "settlement":
        c = _country(sim, target)
        options = _options(args[2:], {"name", "founder", "residents"})
        residents = [p for p in sim.people.values() if p.country == c.id]
        adults = [p for p in residents if p.age >= 18]
        if not adults:
            raise ValueError("A settlement needs an adult founder in its country.")
        founder = _person(sim, options["founder"]) if "founder" in options else max(adults, key=lambda p: p.age)
        if founder.country != c.id or founder.age < 18:
            raise ValueError("The founder must be an adult in this country.")
        count = _number(options.get("residents", "1"), 1, len(residents), True)
        name = _unique_name(sim.settlements.values(), options["name"]) if "name" in options else None
        selected = [founder] + sim.rng.sample([p for p in residents if p.id != founder.id], count - 1)
        place = sim.found_settlement(c.id, founder, selected, name=name)
        return f"Founded {place.name} with {count} relocated residents."
    if kind == "country":
        from civsim import Country
        from warfare import _transfer
        place = _settlement(sim, target)
        options = _options(args[2:], {"name"})
        residents = [p for p in sim.people.values() if p.settlement == place.id]
        adults = [p for p in residents if p.age >= 18]
        if not adults:
            raise ValueError("A new country needs an inhabited settlement with an adult founder.")
        founder = max(adults, key=lambda p: p.age)
        name = (_unique_name(sim.countries.values(), options["name"]) if "name" in options else
                sim.founder_country_name(founder))
        parent = sim.countries[place.country]
        cid = max(sim.countries, default=0) + 1
        c = Country(cid, name, founder.id, sim.year, parent.id, capacity=parent.capacity)
        c.ruler = founder.id
        c.government = parent.government
        c.last_election = sim.year
        c.technologies = set(parent.technologies)
        c.innovations = dict(getattr(parent, "innovations", {}))
        sim.countries[cid] = c
        sim.names.used_countries.add(name)
        _transfer(sim, cid, parent.id, place)
        return f"{place.name} seceded to form {name}, with {len(residents)} residents."
    if kind == "lineage":
        p = _person(sim, target)
        if p.age < 18:
            raise ValueError("A lineage founder must be an adult.")
        options = _options(args[2:], {"surname"})
        surname = _name(options["surname"]) if "surname" in options else None
        lid = sim.new_lineage(p.id, p.lineage)
        if surname:
            sim.lineages[lid].surname = surname
        p.lineage = lid
        sim.register_name(p)
        return f"{sim.full_name(p)} founded lineage {sim.lineage_name(lid)}; existing relatives retain their lineages."
    if kind == "disease":
        from civsim import Sickness
        options = _options(args[2:], {"course", "infection", "death", "recovery", "transmission", "immunity"})
        all_diseases = list(sim.sicknesses.values()) + list(getattr(sim, "retired_sicknesses", {}).values())
        name = _unique_name(all_diseases, target)
        course = _choice(options.get("course", "acute"), {"acute", "chronic", "endemic"})
        disease = Sickness(name, _number(options.get("infection", ".35"), 0, 1),
            _number(options.get("death", ".001" if course == "endemic" else ".02"), 0, 1),
            _number(options.get("recovery", ".15" if course == "chronic" else ".85"), 0, 1),
            transmission=_choice(options.get("transmission", "contact"), {"contact", "respiratory", "waterborne"}),
            incubation_steps=1, immunity_years=_number(options.get("immunity", "1" if course == "endemic" else "8"), 1, 100, True),
            course=course, recurring=course == "endemic")
        sim.sicknesses[name] = disease
        return f"Added {course} disease {name}. Use infect or outbreak to introduce it."
    raise ValueError("Add types: person, settlement, country, lineage, disease.")


def _delete(sim, args):
    if len(args) < 2:
        raise ValueError("Usage: delete person NAME; delete settlement/country NAME to=DESTINATION; delete disease NAME.")
    kind, target = args[0].lower(), args[1]
    if kind in {"person", "individual"}:
        _arity(args, 2, "delete person NAME")
        p = _person(sim, target)
        _kill(sim, p, "editor intervention")
        return f"{sim.full_name(p)} died; their history and ancestry remain in the archive."
    if kind in {"settlement", "country"}:
        options = _options(args[2:], {"to"})
        if kind == "country":
            from warfare import _transfer
            source = _country(sim, target)
            if "to" not in options:
                raise ValueError("Deleting a country requires to=COUNTRY to receive its residents and territory.")
            destination = _country(sim, options["to"])
            if source.id == destination.id:
                raise ValueError("Choose a different receiving country.")
            _transfer(sim, destination.id, source.id)
            return f"{source.name} merged into {destination.name}; its people, settlements and knowledge were transferred."
        source = _settlement(sim, target)
        residents = [p for p in sim.people.values() if p.settlement == source.id]
        if residents and "to" not in options:
            raise ValueError("This settlement is inhabited. Supply to=SETTLEMENT to relocate its residents.")
        if "to" in options:
            destination = _settlement(sim, options["to"])
            if source.id == destination.id:
                raise ValueError("Choose a different receiving settlement.")
            for p in residents:
                p.country, p.settlement = destination.country, destination.id
        source.abandoned = source.demolished = sim.year
        return f"{source.name} was removed; {len(residents)} residents relocated and its history retained."
    if kind == "disease":
        _arity(args, 2, "delete disease NAME")
        disease = _disease(sim, target)
        _eradication_check(sim, disease)
        from epidemiology import retire_disease
        retire_disease(sim, disease.name)
        return f"Eradicated {disease.name}; patients recovered and historical records remain available."
    raise ValueError("Delete types: person, settlement, country, disease. Historical ancestry is retained.")


def _knowledge(sim, verb, args):
    from society import TECHNOLOGIES, FOOD_TECHS, unlock
    from technology import ANY, met as tech_met
    from discoveries import INNOVATIONS, award_innovation
    _arity(args, 2, verb + " COUNTRY TECHNOLOGY_OR_INNOVATION")
    c = _country(sim, args[0])
    query = args[1].casefold()
    foundation = next((name for name in TECHNOLOGIES if name.casefold() == query), None)
    innovation = INNOVATIONS.get(query)
    if not foundation and innovation is None:
        innovation = resolve_entity(INNOVATIONS, args[1], "innovation")
    key = foundation or innovation.id
    owned = c.technologies if foundation else getattr(c, "innovations", {})
    if verb == "grant":
        if key in owned:
            raise ValueError("This country already knows that discovery.")
        prerequisites = TECHNOLOGIES[foundation][0] if foundation else innovation.prerequisites
        missing = prerequisites - c.technologies
        if missing:
            raise ValueError("Missing prerequisites: " + ", ".join(sorted(missing)))
        if foundation:
            for group in ANY.get(foundation, []):
                have = [other for other in group if other in c.technologies]
                if not have:
                    raise ValueError("Missing one of: " + ", ".join(sorted(group)))
        adults = [p for p in sim.people.values() if p.country == c.id and p.age >= 18]
        if not adults:
            raise ValueError("An adult researcher is needed to introduce this knowledge.")
        actor = max(adults, key=lambda p: getattr(p, "fame", 0))
        if foundation:
            unlock(sim, c, foundation, actor)
        else:
            award_innovation(sim, c, innovation, actor)
        return f"Granted {foundation or innovation.name} to {c.name}."
    if key not in owned:
        raise ValueError("This country does not know that discovery.")
    removed = set()
    if foundation:
        removed.add(foundation)
        while True:
            remaining = c.technologies - removed
            dependents = {name for name in remaining if not tech_met(name, remaining)}
            if not dependents:
                break
            removed.update(dependents)
        c.technologies.difference_update(removed)
        c.capacity = max(1, round(c.capacity / 1.05 ** len(removed & FOOD_TECHS)))
        applied = [k for k in getattr(c, "innovations", {}) if not INNOVATIONS[k].prerequisites <= c.technologies]
    else:
        applied = [innovation.id]
    for k in applied:
        c.innovations.pop(k, None)
    project = getattr(c, "research_project", None)
    if project and not tech_met(project, c.technologies):
        c.research_project = None
    project = INNOVATIONS.get(getattr(c, "innovation_project", None))
    if project and not project.prerequisites <= c.technologies:
        c.innovation_project = None
        c.innovation_progress = 0
    return f"{c.name} lost {len(removed)} foundational discoveries and {len(applied)} applied innovations; dependent knowledge was removed."


def _execute(sim, verb, args):
    if verb == "set":
        return _set(sim, args)
    if verb == "add":
        return _add(sim, args)
    if verb in {"delete", "remove"}:
        return _delete(sim, args)
    if verb == "eradicate":
        _arity(args, 1, "eradicate DISEASE")
        return _delete(sim, ["disease", args[0]])
    if verb == "move":
        _arity(args, 3, "move person NAME SETTLEMENT")
        if args[0].lower() not in {"person", "individual"}:
            raise ValueError("Use move person NAME SETTLEMENT.")
        return _set(sim, ["person", args[1], "settlement", args[2]])
    if verb in {"grant", "revoke"}:
        return _knowledge(sim, verb, args)
    if verb in {"infect", "cure"}:
        _arity(args, 2 if verb == "infect" else 1, "infect PERSON DISEASE" if verb == "infect" else "cure PERSON")
        p = _person(sim, args[0])
        if verb == "infect":
            disease = _disease(sim, args[1])
            _infect(sim, p, disease)
            return f"{sim.full_name(p)} contracted {disease.name}."
        name = p.infection
        _cure(sim, p)
        return f"{sim.full_name(p)} recovered from {name} and gained immunity."
    if verb == "outbreak":
        if len(args) < 2:
            raise ValueError("Usage: outbreak COUNTRY DISEASE [cases=5]")
        c, disease = _country(sim, args[0]), _disease(sim, args[1])
        options = _options(args[2:], {"cases"})
        residents = [p for p in sim.people.values() if p.country == c.id and not p.infection
                     and (disease.name not in p.immunity or p.immunity_until.get(disease.name, math.inf) <= sim.year)]
        count = _number(options.get("cases", "5"), 1, len(residents), True)
        for p in sim.rng.sample(residents, count):
            _infect(sim, p, disease)
        c.sickness = disease.name
        c.conditions.add("Disease")
        from epidemiology import _local_outbreak
        local = _local_outbreak(sim, c, disease.name)
        local.update(age=0, last_year=None, cooldown_until=0, source=True)
        return f"Introduced {count} cases of {disease.name} in {c.name}."
    if verb in {"war", "peace"}:
        if len(args) < 2:
            raise ValueError("Usage: war COUNTRY COUNTRY; peace COUNTRY COUNTRY [years=5]")
        a, b = _country(sim, args[0]), _country(sim, args[1])
        if a.id == b.id:
            raise ValueError("Choose two different countries.")
        options = _options(args[2:], {"years"} if verb == "peace" else {"force"})
        pair = tuple(sorted((a.id, b.id)))
        if verb == "war":
            force = _choice(options.get("force", "false"), {"true", "false"}) == "true"
            if getattr(sim, "truces", {}).get(pair, -1) > sim.year and not force:
                raise ValueError("These countries have an active truce. Use force=true to deliberately break it.")
            if any(a.id in active or b.id in active for active in sim.wars):
                raise ValueError("One of these countries is already at war; make peace first.")
            sim.wars[pair] = sim.year
            from society import end_pact
            end_pact(sim, a, b)
            getattr(sim, "truces", {}).pop(pair, None)
            return f"{a.name} declared war on {b.name}; campaigns begin next year."
        years = _number(options.get("years", "5"), 1, 100, True)
        sim.wars.pop(pair, None)
        getattr(sim, "war_details", {}).pop(pair, None)
        if not hasattr(sim, "truces"):
            sim.truces = {}
        sim.truces[pair] = sim.year + years
        return f"{a.name} and {b.name} agreed to peace and a {years}-year truce."
    if verb == "trade":
        if len(args) != 3 or args[0].lower() not in {"science", "pact", "end"}:
            raise ValueError("Usage: trade science|pact|end COUNTRY COUNTRY")
        a, b = _country(sim, args[1]), _country(sim, args[2])
        if a.id == b.id:
            raise ValueError("Choose two different countries.")
        if tuple(sorted((a.id, b.id))) in sim.wars:
            raise ValueError("Countries at war do not trade science; make peace first.")
        from society import pass_on_knowledge, pacts_of, end_pact
        if args[0].lower() == "pact":
            pacts_of(a).add(b.id)
            pacts_of(b).add(a.id)
            return f"{a.name} and {b.name} will share what they learn every year, until war or an end to the pact."
        if args[0].lower() == "end":
            if b.id not in pacts_of(a):
                raise ValueError(f"{a.name} and {b.name} have no science pact.")
            end_pact(sim, a, b)
            return f"The science pact between {a.name} and {b.name} has ended."
        lines = []
        for giver, taker in ((a, b), (b, a)):
            got = pass_on_knowledge(sim, giver, taker, .3)
            lines.append(f"{taker.name} learned {got[1] * 100:.0f}% of {got[0]} from {giver.name}." if got
                         else f"{giver.name} had nothing new that {taker.name} could use.")
        return " ".join(lines)
    if verb == "trigger":
        _arity(args, 2, "trigger COUNTRY EVENT")
        c = _country(sim, args[0])
        event = _choice(args[1], {"famine", "drought", "panic", "health", "calm", "safety", "abundance"}).capitalize()
        if event in {"Famine", "Drought"}:
            c.crisis_cooldown.pop(event, None)
        sim.pickevent(c, forced_event=event)
        if event == "Abundance":
            c.food = min(100, c.food + 15)
        return f"Triggered {event} in {c.name}. Crises retain their normal duration limits."
    if verb == "disaster":
        if len(args) < 2:
            raise ValueError("Usage: disaster COUNTRY TYPE [severity=major] [at=SETTLEMENT]")
        c = _country(sim, args[0])
        from disasters import KINDS, strike, describe
        from geography import ensure_placed, hazards_at
        disaster = _choice(args[1], set(KINDS))
        options = _options(args[2:], {"severity", "at"})
        severity = _choice(options.get("severity", "major"), {"minor", "major", "severe"})
        ensure_placed(sim)
        if "at" in options:
            site = _settlement(sim, options["at"])
        else:
            places = [s for s in sim.settlements.values() if s.country == c.id and s.abandoned is None]
            if not places:
                raise ValueError(f"{c.name} has no inhabited settlement to strike.")
            site = max(places, key=lambda s: hazards_at(sim, s.gx, s.gy)[disaster])
        summary = strike(sim, disaster, severity, site.gx, site.gy)
        return describe(sim, disaster, severity, summary, c)
    if verb == "build":
        if len(args) < 2:
            raise ValueError("Usage: build SETTLEMENT KIND [force=true]; build SETTLEMENT road to=SETTLEMENT")
        from development import BUILDINGS, start_project
        s = _settlement(sim, args[0])
        kind = args[1].lower()
        options = _options(args[2:], {"to", "force"})
        if kind == "road":
            if "to" not in options:
                raise ValueError("Roads need a destination: build SETTLEMENT road to=SETTLEMENT.")
            other = _settlement(sim, options["to"])
            if start_project(sim, s, "road", target=other) is None:
                raise ValueError("Those settlements are not linked by land within one country.")
            return f"Road work began between {s.name} and {other.name}."
        _choice(kind, set(BUILDINGS))
        force = options.get("force", "false").lower() in {"true", "yes", "on"}
        if start_project(sim, s, kind, forced=force) is None:
            spec = BUILDINGS[kind]
            need = ", ".join(sorted(spec[2])) or "none"
            raise ValueError(f"{s.name} cannot build a {spec[0].lower()} now. It needs technology ({need}), "
                             f"at least {spec[3]} residents, suitable terrain, and none already built or pending. "
                             "Use force=true to override.")
        return f"Construction of a {BUILDINGS[kind][0].lower()} began in {s.name}."
    if verb == "settle":
        if not args:
            raise ValueError("Usage: settle SETTLEMENT [x=CELL y=CELL] [size=N]")
        from development import launch_expedition
        from geography import W, H, world, WATER
        s = _settlement(sim, args[0])
        options = _options(args[1:], {"x", "y", "size"})
        target = None
        if "x" in options or "y" in options:
            if "x" not in options or "y" not in options:
                raise ValueError("Give both x and y, or neither.")
            target = (_number(options["x"], 0, W - 1, True), _number(options["y"], 0, H - 1, True))
            if world(sim)["terrain"][target[1]][target[0]] in WATER:
                raise ValueError("That cell is water.")
        size = _number(options["size"], 6, 60, True) if "size" in options else None
        exp = launch_expedition(sim, s, size=size, target=target, forced=True)
        if exp is None:
            raise ValueError(f"{s.name} cannot send settlers: it needs at least 20 residents and a reachable site on its landmass.")
        return f"{len(exp['people'])} settlers set out from {s.name} toward cell {exp['target'][0]},{exp['target'][1]}."
    raise ValueError("Unknown edit. Type help edit.")


def _information(sim, verb, args):
    if verb == "changes":
        _arity(args, 0, "changes")
        rows = getattr(sim, "interventions", [])
        return "\n".join(f"Year {row['year']}: {row['message']} (added {row['added']}, deaths {row['deaths']})"
                         for row in rows) or "No editor interventions yet."
    from society import TECHNOLOGIES
    from discoveries import INNOVATIONS
    page = 1
    terms = []
    for token in args:
        if token.startswith("page="):
            page = _number(token[5:], 1, 100000, True)
        else:
            terms.append(token)
    query = " ".join(terms).casefold()
    rows = [f"{name}: prerequisites {', '.join(sorted(req)) or 'none'}; {effect}"
            for name, (req, _, effect) in TECHNOLOGIES.items() if query in name.casefold()]
    rows += [f"{i.name}; prerequisites {', '.join(sorted(i.prerequisites))}"
             for i in INNOVATIONS.values() if query in i.name.casefold() or query == i.id]
    selected = rows[(page - 1) * 40:page * 40]
    return (f"Discovery catalog: {len(rows)} matches, page {page}/{max(1, math.ceil(len(rows)/40))}\n" +
            "\n".join(selected or ["No entries on this page."]))


def edit_command(sim, text):
    """Return None if unhandled; failed edits preserve state including RNG/undo."""
    first = text.strip().split(maxsplit=1)[0].lower() if text.strip() else ""
    if first not in EDIT_VERBS | {"changes", "catalog"}:
        return None
    try:
        tokens = shlex.split(text)
        verb, args = tokens[0].lower(), tokens[1:]
        if verb in {"changes", "catalog"}:
            return _information(sim, verb, args), "inspect"
        if verb == "undo":
            _arity(args, 0, "undo")
            snapshot = getattr(sim, "_command_undo", None)
            if snapshot is None:
                raise ValueError("No edit to undo. Undo covers only the latest edit before advancing a year.")
            sim.__dict__.clear()
            sim.__dict__.update(snapshot)
            return "Undid the most recent edit; simulation state and random generator restored.", "edit"
    except ValueError as exc:
        return "Command error: " + str(exc), "inspect"
    # Execute on a detached world. A rejected operation never mutates the
    # original object graph (including sharing between state and undo history).
    target_sim = sim
    snapshot = {k: v for k, v in sim.__dict__.items() if k != "_command_undo"}
    sim = copy.copy(target_sim)
    sim.__dict__ = copy.deepcopy(snapshot)
    population = len(sim.people)
    try:
        message = _execute(sim, verb, args)
        refresh = not (verb == "set" and (args[0].lower() == "simulation" or
                       (len(args) == 4 and args[2].lower() in {"wealth", "fame", "job", "name", "first",
                        "food", "prosperity", "stability", "research", "treasury", "capacity", "economy",
                        "economic_system", "quarantine"})))
        elect = not (verb == "set" and len(args) == 4 and args[0].lower() == "country"
                     and args[2].lower() == "ruler" and args[3].lower() == "none")
        _reconcile(sim, refresh, elect)
        sim.contact_cache = None
        sim.systems_state = None
        delta = len(sim.people) - population
        if not hasattr(sim, "interventions"):
            sim.interventions = []
        sim.interventions.append(dict(year=sim.year, message=message, added=max(0, delta), deaths=max(0, -delta)))
        if not hasattr(sim, "pending_interventions"):
            sim.pending_interventions = {"added": 0, "deaths": 0}
        sim.pending_interventions["added"] += max(0, delta)
        sim.pending_interventions["deaths"] += max(0, -delta)
        sim.record("Intervention: " + message, "political")
        sim._command_undo = snapshot
        target_sim.__dict__.clear()
        target_sim.__dict__.update(sim.__dict__)
        return message + " (Year unchanged; undo is available.)", "edit"
    except Exception as exc:
        if isinstance(exc, (ValueError, KeyError)):
            return "Command error: " + str(exc), "inspect"
        # Discard the working world, but expose programmer errors during testing.
        raise
