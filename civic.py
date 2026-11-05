"""Personal fortunes, public offices and read-only commands for the simulator."""
from collections import Counter
from society import technology_modifiers
from governments import all_titles, title_of, HEREDITARY

JOBS = ("farmer", "farmer", "farmer", "laborer", "laborer", "artisan",
        "merchant", "healer", "teacher", "scientist", "performer", "soldier", "politician")
PAY = {"farmer": 10, "laborer": 9, "artisan": 14, "merchant": 19,
       "healer": 15, "teacher": 12, "scientist": 13, "scholar": 13,
       "performer": 11, "soldier": 11, "politician": 12}
SYSTEMS = ("mixed", "capitalism", "communism")


def initialize_civic(sim):
    for country in sim.countries.values():
        if not hasattr(country, "economic_system"):
            parent = sim.countries.get(country.parent_country)
            country.economic_system = (getattr(parent, "economic_system", "mixed") if parent else
                                       SYSTEMS[(country.id - 1) % len(SYSTEMS)])
            country.economic_since = sim.year
            country.treasury = 0.0
            country.offices = {}
    for person in sim.people.values():
        if not hasattr(person, "wealth"):
            person.wealth = round(sim.rng.uniform(5, 90) if person.age >= 18 else 0, 2)
            person.job = sim.rng.choice(JOBS) if person.age >= 18 else "child"
            person.fame = 0.0
            person.public_role = ""


OFFICES = (("treasurer", "merchant"), ("chief scholar", "scientist"),
           ("chief physician", "healer"), ("minister", "politician"))


def refresh_public_roles(sim, announce=True):
    """Keep public offices local and royal titles tied to the living dynasty."""
    official_titles = {title for title, _ in OFFICES}
    for person in sim.people.values():
        if person.public_role in official_titles | all_titles() | {"royal family"}:
            person.public_role = ""
    groups = {}
    for person in sim.people.values():
        groups.setdefault(person.country, []).append(person)
    for cid, country in sim.countries.items():
        residents = groups.get(cid, [])
        adults = [p for p in residents if p.age >= 18]
        ruler = sim.people.get(country.ruler)
        if ruler and ruler.country == cid:
            ruler.public_role = title_of(country.government)
            ruler.fame = max(85, ruler.fame)
            if country.government in HEREDITARY:
                for person in residents:
                    if ruler.id in person.parents:
                        person.public_role = "royal family"
                        person.fame = max(60, person.fame)
        for title, profession in OFFICES:
            current = sim.people.get(country.offices.get(title))
            if current and current.country == cid and current.age >= 18 and not current.public_role:
                current.public_role = title
                continue
            country.offices.pop(title, None)
            if len(adults) < 30:
                continue
            candidates = [p for p in adults if not p.public_role and p.job == profession]
            if not candidates:
                continue
            appointee = max(candidates, key=lambda p: (p.fame, p.age))
            country.offices[title] = appointee.id
            appointee.public_role = title
            appointee.fame = max(65, appointee.fame)
            if announce:
                sim.record(f"{sim.person_reference(appointee)} was appointed {title} of {country.name}.", "political")


def annual_civic(sim):
    """Run once after this year's deaths and ruler maintenance, before rendering."""
    initialize_civic(sim)
    if getattr(sim, "_civic_year", None) == sim.year:
        return
    sim._civic_year = sim.year
    # Settled estates go to surviving children; otherwise the public treasury.
    heirs_by_parent = {}
    for child in sim.people.values():
        for parent in child.parents:
            heirs_by_parent.setdefault(parent, []).append(child)
    for person in sim.archive.values():
        if person.died is None or getattr(person, "estate_settled", False):
            continue
        person.estate_settled = True
        fortune = getattr(person, "wealth", 0.0)
        heirs = heirs_by_parent.get(person.id, []) if fortune else []
        if heirs:
            for heir in heirs:
                heir.wealth += fortune / len(heirs)
        elif person.country in sim.countries:
            beneficiary = sim.countries[person.country]
            while getattr(beneficiary, "absorbed_by", None) is not None:
                beneficiary = sim.countries[beneficiary.absorbed_by]
            beneficiary.treasury += fortune
        person.wealth = 0.0
        role = getattr(person, "public_role", "")
        if role or getattr(person, "fame", 0) >= 65:
            cause = getattr(person, "cause_of_death", None) or "natural causes"
            sim.record(f"{sim.person_reference(person)}, {role or person.job}, died aged "
                       f"{person.age} ({cause}).", "political")

    groups = {}
    for person in sim.people.values():
        groups.setdefault(person.country, []).append(person)
        if person.age >= 18 and person.job == "child":
            person.job = sim.rng.choice(JOBS)
        person.fame *= .98
    for cid, residents in groups.items():
        country = sim.countries[cid]
        adults = [p for p in residents if p.age >= 18]
        if not adults:
            continue
        # Economic institutions need literacy and a sustained political history.
        if (sim.year - country.economic_since >= 20 and "writing" in country.technologies
                and sim.rng.random() < .025):
            previous = country.economic_system
            country.economic_system = sim.rng.choice([s for s in SYSTEMS if s != previous])
            country.economic_since = sim.year
            sim.record(f"{country.name} adopted {country.economic_system}, replacing {previous}; "
                       "taxation and the distribution of income changed.", "political")
        system = country.economic_system
        # Communal production enters the public pool before equal household
        # shares; private systems retain wages and allow returns on capital.
        tax_rate = {"capitalism": .15, "mixed": .30, "communism": 1.0}[system]
        public_income = 0.0
        productivity = (.5 + country.prosperity / 100) * technology_modifiers(country)["production"]
        if "Famine" in country.conditions:
            productivity *= .6
        if country.quarantine:
            productivity *= .85
        for person in adults:
            income = PAY.get(person.job, 10) * productivity * sim.rng.uniform(.7, 1.3)
            if getattr(person, "wounded_until", 0) > sim.year or person.infection:
                income *= .65
            if system == "capitalism":
                income += person.wealth * sim.rng.uniform(-.015, .05)
            elif system == "mixed":
                income += person.wealth * sim.rng.uniform(-.005, .015)
            income = max(0, income)
            public_income += income * tax_rate
            person.wealth = max(0, person.wealth + income * (1 - tax_rate) - 6)
        redistribution = public_income * {"capitalism": .25, "mixed": .65, "communism": .90}[system]
        country.treasury += public_income - redistribution
        recipients = residents if system == "communism" else sorted(residents, key=lambda p: p.wealth)[:max(1, len(residents)//2)]
        for person in recipients:
            person.wealth += redistribution / len(recipients)
        country.prosperity = max(0, min(100, country.prosperity + (public_income - redistribution) / (len(residents) * 20)))
        performers = [p for p in adults if p.job == "performer" and p.fame < 65]
        if performers and sim.rng.random() < .12:
            artist = sim.rng.choice(performers)
            artist.fame = 80
            artist.public_role = "celebrated artist"
            sim.record(f"{sim.person_reference(artist)} earned national acclaim for "
                       f"{sim.rng.choice(['a tragic play', 'a cycle of songs', 'a historical epic', 'a public sculpture'])}.", "creative")
    refresh_public_roles(sim)


def command(sim, text):
    """Return (output, action); only 'next' advances time; edits return 'edit'."""
    raw = text.strip()
    if not raw or raw.lower() in {"next", "continue"}:
        return "", "next"
    parts = raw.split(maxsplit=1)
    name, query = parts[0].lower(), parts[1].strip().strip('"').lower() if len(parts) > 1 else ""
    if name in {"quit", "exit"}:
        return "Simulation stopped.", "quit"
    if name == "help":
        from edit_commands import EDIT_HELP
        if query == "ids":
            return ("Optional advanced ID lookup: ids [person|country|settlement|lineage|discovery] [SEARCH] [page=N]\n"
                    "Example: ids person Mara\n"
                    "Use the ID in brackets as an alternative to a name; numeric IDs also accept #. Names remain the normal controls.", "inspect")
        if query in {"edit", "editing", "commands", "sandbox"}:
            return EDIT_HELP, "inspect"
        return ("Enter/next: advance one year | quit: stop\n"
                "people [QUERY] [page=N] | person NAME | settlements [QUERY] [page=N] | settlement NAME\n"
                "countries | country NAME | rich [COUNTRY] | inventions [COUNTRY]\n"
                "roles [COUNTRY] | notables [COUNTRY] | lineages [NAME]\n"
                "demographics [COUNTRY] | wars [COUNTRY] | diseases [COUNTRY] | disease NAME\n"
                "catalog [QUERY] [page=N] | changes | help edit (all editing commands) | undo\n"
                "borders [COUNTRY] | geography: terrain, land borders, and sea neighbors.\n"
                "projects [COUNTRY] | expeditions [COUNTRY] | systems [COUNTRY] | hazards SETTLEMENT\n"
                "Aliases: richest, discoveries, innovations, government, individual, persons.\n"
                "34 foundations + 1,000 composed technique/application innovations, with prerequisites and effects.\n"
                "Use displayed names, including Roman numerals when shown. Quote multiword names in edits.\n"
                "Optional advanced ID lookup: help ids. Person views include deceased records. Wealth uses simulation units.\n"
                "Inspection is read-only; edits take effect immediately. Neither advances the year.", "inspect")
    from inspection import inspect_command
    from edit_commands import edit_command
    inspected = inspect_command(sim, raw)
    if inspected is not None:
        return inspected
    edited = edit_command(sim, raw)
    if edited is not None:
        return edited
    if name in {"lineage", "lineages"}:
        tree = sim.lineage_tree()
        if query:
            tree = "\n\n".join(block for block in tree.split("\n\n") if query in block.lower())
        return tree or "No matching lineage.", "inspect"
    countries = [c for c in sim.countries.values() if c.ended is None]
    if query:
        exact = [c for c in countries if c.name.lower() == query or query in {str(c.id), '#' + str(c.id)}]
        countries = exact or [c for c in countries if query in c.name.lower()]
    if not countries:
        return "No matching inhabited country.", "inspect"
    cids = {c.id for c in countries}
    people = [p for p in sim.people.values() if p.country in cids]
    if name in {"rich", "richest"}:
        rows = [f"{i}. {sim.full_name(p)}: {getattr(p, 'wealth', 0):,.1f} "
                f"({getattr(p, 'job', 'unassigned')})"
                for i, p in enumerate(sorted(people, key=lambda p: getattr(p, 'wealth', 0), reverse=True)[:20], 1)]
        return "Richest living people (wealth units):\n" + "\n".join(rows), "inspect"
    if name in {"inventions", "discoveries", "innovations"}:
        rows = []
        for c in countries:
            rows.append(f"{c.name}\n  Foundational discoveries: " + (", ".join(sorted(c.technologies)) or "none"))
            from discoveries import INNOVATIONS
            acquired = getattr(c, "innovations", {})
            rows.extend(f"  {INNOVATIONS[key].name} (year {year}): " +
                        ", ".join(f"{effect.replace('_', ' ')} {value:+.1%}" for effect, value in INNOVATIONS[key].modifiers)
                        for key, year in acquired.items() if key in INNOVATIONS)
            if not acquired:
                rows.append("  Specialized innovations: none yet")
            project = getattr(c, "research_project", None)
            if project:
                rows.append(f"  Foundation project: {project} ({c.research:.1f} points)")
            applied = INNOVATIONS.get(getattr(c, "innovation_project", None))
            if applied:
                rows.append(f"  Applied project: {applied.name} ({getattr(c, 'innovation_progress', 0):.1f}/{applied.cost:.1f})")
        return "\n".join(rows), "inspect"
    if name in {"roles", "government"}:
        rows = []
        for c in countries:
            rows.append(f"{c.name}: {c.government}; economy: {getattr(c, 'economic_system', 'mixed')}")
            ruler = sim.people.get(c.ruler)
            rows.append("  Ruler: " + (sim.full_name(ruler) if ruler else "vacant"))
            rows.extend(f"  {role}: {sim.full_name(sim.people[pid])}" for role, pid in getattr(c, "offices", {}).items()
                        if pid in sim.people and sim.people[pid].country == c.id)
        return "\n".join(rows), "inspect"
    if name in {"people", "notables"}:
        notable = [p for p in people if getattr(p, "public_role", "") or getattr(p, "fame", 0) >= 65]
        return "\n".join(f"{sim.full_name(p)}: {getattr(p, 'public_role', '') or p.job}, age {p.age}"
                         for p in sorted(notable, key=lambda p: p.fame, reverse=True)) or "No public figures yet.", "inspect"
    if name in {"country", "countries"}:
        counts = Counter(p.country for p in people)
        rows = [f"{c.name}: {counts[c.id]} residents | {c.government} | "
                          f"{getattr(c, 'economic_system', 'mixed')} | food {c.food:.0f}, "
                          f"prosperity {c.prosperity:.0f}, stability {c.stability:.0f} | "
                          f"{', '.join(sorted(c.conditions)) or 'normal conditions'}" for c in countries]
        if name == "country":
            for c in countries:
                ruler = sim.people.get(c.ruler)
                rows.append(f"{c.name}: founded year {c.founded}; leader " +
                            (sim.full_name(ruler) if ruler else "vacant") +
                            f"; treasury {c.treasury:,.1f}; {len(c.technologies)} foundations, "
                            f"{len(getattr(c, 'innovations', {}))} innovations")
                populations = Counter(p.settlement for p in people if p.country == c.id)
                rows.extend(f"  {s.kind.capitalize()} {s.name}: {populations[s.id]} residents" +
                            (" (capital)" if c.capital == s.id else "")
                            for s in sim.settlements.values() if s.country == c.id and populations[s.id])
        return "\n".join(rows), "inspect"
    return "Unknown command. Type help for commands.", "inspect"
