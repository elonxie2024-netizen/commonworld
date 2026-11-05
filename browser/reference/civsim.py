"""A fictional population simulation. Run with Python 3.10 or newer."""

import argparse
import random
import re
from collections import Counter
from dataclasses import dataclass, field
from society import develop_societies, maintain_rulers, social_rates, ensure_year_events
from epidemiology import import_infections, resolve_disease
from warfare import resolve_wars as resolve_campaigns
from civic import initialize_civic, annual_civic, refresh_public_roles, command


_WEIGHTED = {}


def weighted(**weights):
    key = tuple(weights.items())
    if key not in _WEIGHTED:
        _WEIGHTED[key] = [value for value, weight in weights.items() for _ in range(weight)]
    return _WEIGHTED[key]


def roman(number):
    result = ""
    for value, symbol in [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"),
                          (100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
                          (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]:
        count, number = divmod(number, value)
        result += symbol * count
    return result


class NameGenerator:
    def __init__(self, rng):
        self.rng = rng
        self.used_countries = set()

    def make(self, kind):
        if kind == "country":
            formats = weighted(V=1, CV=5, CVC=2, VC=1)
            starters = weighted(b=1, d=2, g=1, h=1, k=1, l=3, m=2,
                                n=3, r=3, s=2, t=2, v=2, z=1,
                                th=2, kh=1, sh=1, ph=1, br=1, dr=1, tr=1)
            enders = weighted(n=4, r=3, s=2, l=2, m=2, t=1, k=1, d=1, nd=1)
            vowels = weighted(a=5, e=3, i=2, o=3, u=2, ae=2, ai=1, au=1)
            counts = [1, 2, 2, 2, 2, 2, 3, 3]
            endings = ["", "", "", "ia", "ia", "ia", "a", "a",
                       "ion", "ar", "ar", "um", "os", "is", "on", "ea", "eth"]
        else:
            formats = weighted(V=1, CV=4, CVC=3, VC=2)
            starters = weighted(b=2, c=1, d=2, f=2, g=2, h=2, j=1, k=2,
                                l=3, m=3, n=3, p=2, r=3, s=3, t=3, v=2,
                                w=1, y=1, z=1, bl=1, br=1, cl=1, cr=1,
                                dr=1, fl=1, fr=1, gl=1, gr=1, pl=1, pr=1,
                                sl=1, st=1, tr=1, ch=1, sh=1, th=1)
            enders = weighted(b=1, d=2, f=1, g=1, k=2, l=3, m=2, n=4,
                               p=1, r=3, s=3, t=3, v=1, z=1, ch=1,
                               sh=1, th=1, nd=1, nt=1, ng=1, rd=1, rn=1)
            vowels = weighted(a=5, e=5, i=4, o=4, u=2, ai=1, ay=1,
                               ea=1, ee=1, ei=1, ie=1, oa=1, oo=1, ou=1, au=1)
            counts = ([1, 1, 2, 2, 2, 2, 2, 3] if kind == "first"
                      else [1, 1, 1, 2, 2, 2, 2, 3, 3])
            endings = [""] * 10 + (
                ["a", "a", "e", "o", "y", "an", "en", "in", "on", "el", "ie", "ey", "er", "ina"]
                if kind == "first" else
                ["s", "s", "er", "er", "son", "ton", "ley", "en", "on", "in", "ar", "o", "es", "al", "ez", "ov", "ic", "i", "ell"])

        def smooth(text):
            vowel_run = consonant_run = 0
            for char in text:
                if char in "aeiouy":
                    vowel_run += 1
                    consonant_run = 0
                else:
                    consonant_run += 1
                    vowel_run = 0
                if vowel_run > 2 or consonant_run > 3:
                    return False
            return True

        for _ in range(100):
            parts = []
            for _ in range(self.rng.choice(counts)):
                pattern = self.rng.choice(formats)
                parts.append("".join(self.rng.choice(vowels if char == "V" else
                             starters if i == 0 else enders)
                             for i, char in enumerate(pattern)))
            name = "".join(parts)
            ending = self.rng.choice(endings)
            if ending:
                if ending[0] in "aeiou":
                    name = name.rstrip("aeiou") or name
                if name[-1] == ending[0]:
                    ending = ending[1:]
                name += ending
            if len(name) >= 2 and smooth(name):
                return name.capitalize()
        return self.rng.choice(["Mara", "Dalen", "Sora", "Bren"])

    def country(self, founder_name=None):
        if founder_name:
            # Bob -> Bobia, Mara -> Maria; preserve a recognizable name root.
            stem = founder_name.lower().rstrip("aeiouy") or founder_name.lower()
            ending = self.rng.choice(["ia", "ia", "ia", "ia", "a", "ar", "on", "os", "um"])
            base = (stem + ending).capitalize()
        else:
            base = self.make("country")
        name = base
        number = 2
        while name in self.used_countries:
            name = f"{base} {roman(number)}"
            number += 1
        self.used_countries.add(name)
        return name

    def sickness(self):
        suffix = self.rng.choice(["pox", "pox", "cough", "cough", "fever",
                                  "fever", "chill", "rot", "blight", "shivers"])
        if self.rng.random() < .5:
            root = self.rng.choice(["gray", "red", "black", "white", "ashen",
                                    "marsh", "river", "winter", "dust", "thorn",
                                    "swamp", "silver", "night", "bitter", "bongo"])
        else:
            # Short invented roots keep the illness suffix recognizable.
            root = "".join(self.rng.choice(["b", "d", "g", "k", "l", "m", "n", "r", "s", "t", "v"])
                           + self.rng.choice(["a", "e", "i", "o", "u"])
                           for _ in range(self.rng.choice([1, 2, 2, 2, 3])))
        return (root + suffix).capitalize()


@dataclass
class Person:
    id: int
    first: str
    age: int
    lineage: int
    country: int
    born: int
    parents: tuple = ()
    died: int | None = None
    infection: str | None = None
    immunity: set = field(default_factory=set)
    settlement: int | None = None
    infection_steps: int = 0
    immunity_until: dict = field(default_factory=dict)
    cause_of_death: str | None = None


@dataclass
class Settlement:
    id: int
    name: str
    country: int
    founder: int
    founded: int
    kind: str = "village"
    abandoned: int | None = None


@dataclass(frozen=True)
class Sickness:
    name: str
    infection_chance: float
    death_chance: float
    recovery_chance: float
    transmission: str = "contact"
    incubation_steps: int = 0
    immunity_years: int = 8
    mutation_chance: float = .02
    course: str = "acute"
    recurring: bool = False


@dataclass
class Lineage:
    id: int
    surname: str
    founder: int
    founded: int
    parent_lineage: int | None = None
    births: int = 0
    deaths: int = 0
    founder_country: int = 1


@dataclass
class Country:
    id: int
    name: str
    founder: int
    founded: int
    parent_country: int | None = None
    conditions: set = field(default_factory=set)
    capacity: int = 1_000_000
    ended: int | None = None
    sickness: str | None = None
    ruler: int | None = None
    government: str = "monarchy"
    last_election: int = 0
    food: float = 60
    prosperity: float = 50
    stability: float = 60
    research: float = 0
    technologies: set = field(default_factory=set)
    insight: dict = field(default_factory=dict)  # part-way knowledge of discoveries others hold: {discovery: research points}
    pacts: set = field(default_factory=set)  # countries it has a standing science-sharing pact with
    boosted: set = field(default_factory=set)  # discoveries of conquered countries, researched twice as fast
    last_catalog_events: dict = field(default_factory=dict)
    last_disaster_year: int | None = None
    capital: int | None = None
    quarantine: bool = False
    crisis_until: dict = field(default_factory=dict)
    crisis_cooldown: dict = field(default_factory=dict)


class Simulation:
    events = ["Famine", "Drought", "Disease", "Panic", "Growth",
              "Abundance", "Health", "Calm", "Safety", "Nothing"]

    def __init__(self, population=2000, seed=None, capacity=1_000_000,
                 lineage_chance=0.002, country_chance=0.04, war_chance=0.10,
                 disaster_chance=0.02):
        if population < 1 or capacity < 1:
            raise ValueError("Population and capacity must be positive")
        if not 0 <= lineage_chance <= 1 or not 0 <= country_chance <= 1:
            raise ValueError("Lineage and country chances must be between 0 and 1")
        if not 0 <= war_chance <= 1:
            raise ValueError("War chance must be between 0 and 1")
        if not 0 <= disaster_chance <= 1:
            raise ValueError("Disaster chance must be between 0 and 1")
        self.rng = random.Random(seed)
        self.geo_seed = seed or 0  # terrain uses its own hash noise, not the main generator
        self.names = NameGenerator(self.rng)
        self.people = {}
        self.archive = {}  # Includes deceased people so parent IDs stay traceable.
        self.name_holders = {}  # Names ever held, including earlier family names.
        self.lineages = {}
        self.countries = {}
        self.settlements = {}
        self.history = []
        self.history_categories = []
        self.yearly_reports = []
        self.sicknesses = {}
        self.year = 0
        self.next_person = 1
        self.lineage_chance = lineage_chance
        self.country_chance = country_chance
        self.war_chance = war_chance
        self.disaster_chance = disaster_chance
        self.wars = {}  # (country, country) -> year started; one war per country.
        self.bp = [0.0] * 200
        self.dp = [0.0] * 200
        for low, high, probability in [(18, 30, .08), (31, 45, .10), (46, 55, .025), (56, 60, .005)]:
            self.bp[low:high + 1] = [probability] * (high - low + 1)
        for low, high, probability in [(0, 0, .015), (1, 10, .003), (11, 45, .002),
                                       (46, 60, .009), (61, 75, .035), (76, 90, .08),
                                       (91, 150, .18), (151, 199, 1)]:
            self.dp[low:high + 1] = [probability] * (high - low + 1)
        for i in range(population):
            # Small founding families; a one-person start matches the original.
            if i % 4 == 0:
                lid = self.new_lineage(self.next_person)
            age_range = self.rng.choices([(0, 17), (18, 45), (46, 65), (66, 85)], [20, 60, 15, 5])[0]
            age = 0 if population == 1 else self.rng.randint(*age_range)
            if population > 1 and i % 4 == 0:
                age = self.rng.randint(18, 45)
            self.add_person(age, lid, 1)
        initial_countries = min(4, max(1, population // 500))
        everyone = list(self.people.values())
        for index in range(initial_countries):
            residents = everyone[index * population // initial_countries:(index + 1) * population // initial_countries]
            founder = next((p for p in residents if p.age >= 18), residents[0])
            cid = index + 1
            self.countries[cid] = Country(cid, self.founder_country_name(founder), founder.id, 0, capacity=capacity)
            if capacity != 1_000_000:
                self.countries[cid].capacity_manual = True
            for person in residents:
                person.country = cid
                if self.lineages[person.lineage].founder == person.id:
                    self.lineages[person.lineage].founder_country = cid
            if founder.age >= 18:
                self.countries[cid].ruler = founder.id
            self.record(f"{self.person_reference(founder)} founded {self.countries[cid].name} "
                        f"with {len(residents)} people.")
            for offset in range(0, len(residents), 250):
                locals_ = residents[offset:offset + 250]
                local_founder = next((p for p in locals_ if p.age >= 18), locals_[0])
                self.found_settlement(cid, local_founder, locals_)
        initialize_civic(self)
        refresh_public_roles(self, announce=False)
        self.yearly_reports.append(dict(year=0, states=[f"{c.name}: Normal" for c in self.countries.values()],
                                       start=0, end=len(self.history), population=population,
                                       births=0, deaths=0))

    def record(self, message, category="political"):
        self.history.append((self.year, message))
        self.history_categories.append(category)

    def format_year(self, report):
        sections = ["\n".join([f"Year {report['year']}", *report['states']])]
        for category in ("discovery", "political", "creative", "war", "sickness", "disaster"):
            lines = []
            for index in range(report["start"], report["end"]):
                if self.history_categories[index] == category:
                    lines.append(self.render_history(self.history[index][1]))
            if lines:
                sections.append("\n".join(lines))
        summary = f"Population: {report['population']} | Births: {report['births']} | Deaths: {report['deaths']}"
        if "death_causes" in report:
            causes = report["death_causes"]
            summary += (f" (ordinary {causes['ordinary']}, sickness {causes['sickness']}, "
                        f"war {causes['war']}, disasters {causes['disaster']})")
        interventions = report.get("interventions", {})
        if interventions.get("added") or interventions.get("deaths"):
            summary += (f"\nBefore this year: editor additions {interventions.get('added', 0)}, "
                        f"editor deaths {interventions.get('deaths', 0)} (separate from yearly totals).")
        sections.append(summary)
        lines = "\n\n".join(sections).splitlines()
        return "\n".join([lines[0]] + ["    " + line if line else "" for line in lines[1:]])

    def founder_country_name(self, founder):
        root = self.rng.choice([founder.first, founder.first,
                                self.lineages[founder.lineage].surname])
        return self.names.country(root)

    def new_lineage(self, founder, parent=None):
        lid = len(self.lineages) + 1
        self.lineages[lid] = Lineage(lid, self.names.make("last"), founder, self.year, parent)
        if founder in self.archive:
            self.lineages[lid].founder_country = self.archive[founder].country
        return lid

    def add_person(self, age, lineage, country, parents=()):
        pid = self.next_person
        self.next_person += 1
        person = Person(pid, self.names.make("first"), age, lineage, country,
                        self.year - age, parents)
        parent = self.archive.get(parents[0]) if parents else None
        if parent and parent.country == country:
            person.settlement = parent.settlement
        elif country in self.countries:
            person.settlement = self.countries[country].capital
        self.people[pid] = person
        self.archive[pid] = person
        self.register_name(person)
        self.lineages[lineage].births += 1
        return person

    @staticmethod
    def settlement_kind(population):
        if population >= 1000:
            return "city"
        if population >= 100:
            return "town"
        return "village"

    def found_settlement(self, cid, founder, residents, name=None, cell=None):
        sid = len(self.settlements) + 1
        if name is None:
            root = self.names.make("first").lower().rstrip("aeiou") or "al"
            base = (root + self.rng.choice(["ford", "ton", "wick", "haven", "vale", "bury", "a"])).capitalize()
            existing = {s.name for s in self.settlements.values()}
            name = base
            number = 2
            while name in existing:
                name = f"{base} {roman(number)}"
                number += 1
        settlement = Settlement(sid, name, cid, founder.id, self.year,
                                self.settlement_kind(len(residents)))
        self.settlements[sid] = settlement
        from geography import place_settlement, _placed
        home = self.settlements.get(founder.settlement)
        anchor = (home.gx, home.gy) if (home is not None and _placed(home) and home.id != sid) else None
        place_settlement(self, settlement, cell, anchor)
        for person in residents:
            person.settlement = sid
        if self.countries[cid].capital is None:
            self.countries[cid].capital = sid
        self.record(f"{self.person_reference(founder)} established the {settlement.kind} of "
                    f"{name} in {self.countries[cid].name} with {len(residents)} residents.")
        return settlement

    def update_settlements(self, allow_migration=True):
        groups = {}
        for person in self.people.values():
            groups.setdefault(person.settlement, []).append(person)
        at_war = {cid for pair in self.wars for cid in pair}
        # Families establish new villages inside their country, without creating
        # a new nation. Larger settlements occasionally attract nearby families.
        if allow_migration:
            for sid, residents in list(groups.items()):
                settlement = self.settlements[sid]
                adults = [p for p in residents if p.age >= 18]
                if settlement.country in at_war or not adults:
                    continue
                from systems import state as system_state
                drive = system_state(self, settlement.country)["expansion"]
                if len(residents) >= 120 and self.rng.random() < .012 * drive:
                    # Settlers walk to a site chosen from the geography; the town exists when they arrive.
                    from development import launch_expedition
                    launch_expedition(self, settlement)
                elif len(residents) >= 10 and self.rng.random() < .02:
                    destinations = [s for s in self.settlements.values()
                                    if s.country == settlement.country and s.id != sid
                                    and len(groups.get(s.id, [])) > len(residents)]
                    if destinations:
                        target = max(destinations, key=lambda s: len(groups.get(s.id, [])))
                        migrant = self.rng.choice(adults)
                        family = [p for p in residents if p.lineage == migrant.lineage]
                        from development import launch_migration
                        journey = launch_migration(self, settlement, target, family)
                        self.record(f"{len(family)} residents {'set out' if journey else 'moved'} from {settlement.name} "
                                    f"to {target.name} in {self.countries[settlement.country].name}.")
                elif len(residents) >= 25 and self.rng.random() < .04:
                    from development import launch_emigration
                    launch_emigration(self, settlement, groups)
        counts = Counter(p.settlement for p in self.people.values())
        for sid, settlement in self.settlements.items():
            count = counts[sid]
            if not count:
                if settlement.abandoned is None:
                    settlement.abandoned = self.year
                    self.record(f"{settlement.name} in {self.countries[settlement.country].name} was abandoned.")
                continue
            if settlement.abandoned is not None:
                settlement.abandoned = None
                self.record(f"{settlement.name} was resettled.")
            kind = self.settlement_kind(count)
            if kind != settlement.kind:
                old_kind = settlement.kind
                settlement.kind = kind
                self.record(f"{settlement.name} changed from {old_kind} to {kind}, with {count} residents.")
        for cid, country in self.countries.items():
            inhabited = [s for s in self.settlements.values() if s.country == cid and counts[s.id]]
            if not inhabited:
                country.capital = None
            elif country.capital is None or not counts[country.capital]:
                capital = max(inhabited, key=lambda s: counts[s.id])
                country.capital = capital.id
                self.record(f"{capital.name} became the capital of {country.name}.")

    def register_name(self, person):
        name = f"{person.first} {self.lineages[person.lineage].surname}"
        self.name_holders.setdefault(name, set()).add(person.id)

    def full_name(self, person, lineage=None, country=None):
        lid = person.lineage if lineage is None else lineage
        name = f"{person.first} {self.lineages[lid].surname}"
        holders = sorted(self.name_holders.get(name, set()) | {person.id})
        if len(holders) > 1:
            name += f" {roman(holders.index(person.id) + 1)}"
        cid = person.country if country is None else country
        return f"{name} of {self.countries[cid].name}"

    def lineage_name(self, lid):
        name = self.lineages[lid].surname
        holders = sorted(i for i, family in self.lineages.items() if family.surname == name)
        return name if len(holders) == 1 else f"{name} {roman(holders.index(lid) + 1)}"

    def person_reference(self, person):
        return f"{{person:{person.id}:{person.lineage}:{person.country}}}"

    def render_history(self, message):
        # Resolve names at display time so later duplicates also number earlier entries.
        message = re.sub(r"\{person:(\d+):(\d+):(\d+)\}",
                         lambda m: self.full_name(self.archive[int(m[1])], int(m[2]), int(m[3])), message)
        return re.sub(r"\{lineage:(\d+)\}",
                      lambda m: self.lineage_name(int(m[1])), message)

    def pickevent(self, country, forced_event=None):
        # Episodes never extend when the same crisis is rolled again. Recovery
        # guarantees four complete years free of that crisis before recurrence.
        for crisis in ("Famine", "Drought"):
            if crisis in country.conditions:
                country.crisis_until.setdefault(crisis, self.year + 2)
                if self.year >= country.crisis_until[crisis]:
                    self.end_crisis(country, crisis)
        event = forced_event if forced_event is not None else (
            self.rng.choice(self.events) if self.rng.random() > .4 else "Nothing")
        if forced_event is None:
            # Dry countries suffer more droughts; wet coastal ones suffer fewer.
            from geography import profile
            terrain = profile(self, country.id)
            if event == "Drought" and self.rng.random() < .5 * terrain["coastal"] * (1 - terrain["dry"]):
                event = "Nothing"
            elif event == "Nothing" and self.rng.random() < .12 * terrain["dry"]:
                event = "Drought"
        if event in {"Famine", "Drought"}:
            if self.year < country.crisis_cooldown.get(event, 0):
                event = "Nothing"
            elif event not in country.conditions:
                duration = self.rng.randint(2, 4 if event == "Famine" else 3)
                country.crisis_until[event] = self.year + duration
                self.record(f"{country.name} entered a {event.lower()} episode; relief and "
                            f"recovery are expected within {duration} years.", "disaster")
        if event in {"Famine", "Drought", "Disease", "Panic"}:
            country.conditions.add(event)
        if event == "Disease" and country.sickness is None:
            country.sickness = self.names.sickness()
            if country.sickness in getattr(self, "retired_sicknesses", {}):
                base = country.sickness
                number = 2
                while country.sickness in self.sicknesses or country.sickness in self.retired_sicknesses:
                    country.sickness = f"{base} strain {number}"
                    number += 1
            if country.sickness not in self.sicknesses:
                course = self.rng.choices(["acute", "chronic", "endemic"], [70, 10, 20])[0]
                fatality = self.rng.uniform(.005, .08) if course == "acute" else (
                    self.rng.uniform(.01, .04) if course == "chronic" else self.rng.uniform(.0001, .001))
                recovery = self.rng.uniform(.1, .3) if course == "chronic" else self.rng.uniform(.75, .98)
                self.sicknesses[country.sickness] = Sickness(
                    country.sickness, self.rng.uniform(.15, .55),
                    fatality, recovery,
                    transmission=self.rng.choice(["respiratory", "waterborne", "contact"]),
                    incubation_steps=1, immunity_years=1 if course == "endemic" else self.rng.randint(4, 12),
                    course=course, recurring=course == "endemic")
            disease = self.sicknesses[country.sickness]
            self.record(f"An outbreak of {country.sickness} ({disease.course}) began in {country.name}: "
                        f"baseline annual transmission chance {disease.infection_chance:.0%}, "
                        f"death chance when infected {disease.death_chance:.0%}, "
                        f"recovery chance after surviving {disease.recovery_chance:.0%}.", "sickness")
        if event in {"Health", "Safety"}:
            country.conditions.discard("Disease")
            if country.sickness is not None:
                self.record(f"{country.name} contained the external source of {country.sickness}; "
                            "existing patients can still spread the sickness until they recover.", "sickness")
                country.sickness = None
        if event in {"Calm", "Safety"}:
            country.conditions.discard("Panic")
        if event in {"Growth", "Abundance", "Safety"}:
            for crisis in ("Famine", "Drought"):
                if crisis in country.conditions:
                    self.end_crisis(country, crisis)
        return event

    def end_crisis(self, country, crisis):
        country.conditions.discard(crisis)
        country.crisis_until.pop(crisis, None)
        country.crisis_cooldown[crisis] = self.year + 4
        country.food = min(100, max(40, country.food + 12))
        self.record(f"{country.name}'s {crisis.lower()} ended as harvests and relief supplies "
                    "recovered; reserves will buffer the next four years.", "disaster")

    @staticmethod
    def apply(country, event):
        # Recompute each year: positive events are temporary, crises persist.
        bm = dm = 1.0
        for condition in sorted(country.conditions):
            b, d = {"Famine": (.5, 1.3), "Drought": (.8, 1.2),
                    "Disease": (1, 1), "Panic": (.9, 1.1)}[condition]
            bm *= b
            dm *= d
        b, d = {"Growth": (1.2, 1), "Abundance": (1.5, 1),
                "Health": (1, .8)}.get(event, (1, 1))
        return bm * b, dm * d

    def resolve_sickness(self, country, residents):
        return resolve_disease(self, country, residents)

    def resolve_disasters(self):
        """At most one disaster per inhabited country per year, placed by geographic risk."""
        from disasters import resolve
        return resolve(self)

    def resolve_wars(self):
        return resolve_campaigns(self)

    def tick(self, verbose=True):
        self.__dict__.pop("_command_undo", None)
        interventions = dict(getattr(self, "pending_interventions", {"added": 0, "deaths": 0}))
        self.pending_interventions = {"added": 0, "deaths": 0}
        self.year += 1
        from systems import refresh, apply_yearly
        refresh(self)
        from epidemiology import advance_cures
        advance_cures(self)
        history_start = len(self.history)
        before = len(self.people)
        import_infections(self)
        develop_societies(self)
        apply_yearly(self)
        from economy import yearly as economy_yearly
        economy_yearly(self)
        groups = {}
        for person in self.people.values():
            groups.setdefault(person.country, []).append(person)
        births = deaths = 0
        causes = dict(ordinary=0, sickness=0, war=0, disaster=0)
        states = []
        for cid, residents in groups.items():
            country = self.countries[cid]
            event = self.pickevent(country)
            labels = set(country.conditions)
            labels.discard("Disease")
            if country.sickness:
                labels.add(country.sickness)
            if event not in {"Nothing", "Disease"}:
                labels.add(event)
            states.append(f"{country.name}: {', '.join(sorted(labels)) or 'Normal'}")
            sickness_deaths = self.resolve_sickness(country, residents)
            deaths += sickness_deaths
            causes["sickness"] += sickness_deaths
            residents = [p for p in residents if p.id in self.people]
            bm, dm = self.apply(country, event)
            social_birth, social_death = social_rates(country)
            bm *= social_birth
            dm *= social_death
            crowd = max(0, 1 - len(residents) / country.capacity)
            mortality = dm * (1 + len(residents) / country.capacity)
            survivors = []
            for person in residents:
                if self.rng.random() < min(1, self.dp[person.age] * mortality):
                    deaths += 1
                    causes["ordinary"] += 1
                    self.lineages[person.lineage].deaths += 1
                    person.died = self.year
                    person.cause_of_death = "old age" if person.age >= 65 else "ordinary mortality"
                    del self.people[person.id]
                else:
                    survivors.append(person)
            adults = [p for p in survivors if 21 <= p.age <= 60]
            for person in survivors:
                if person.age >= 18 and self.rng.random() < self.lineage_chance:
                    old = person.lineage
                    person.lineage = self.new_lineage(person.id, old)
                    self.register_name(person)
                    # The founder transfers affiliation; earlier children keep theirs.
                    self.record(f"{self.person_reference(person)} starts lineage "
                                f"{{lineage:{person.lineage}}}, a branch of {{lineage:{old}}}.", "lineage")
                if self.rng.random() < min(1, self.bp[person.age] * bm * crowd):
                    # Optional second parent; births remain per-person as in the original.
                    partner = None
                    for _ in range(8):
                        candidate = self.rng.choice(adults) if adults else None
                        if candidate and candidate.id != person.id and candidate.lineage != person.lineage:
                            partner = candidate
                            break
                    parents = (person.id,) if partner is None else (person.id, partner.id)
                    self.add_person(0, person.lineage, cid, parents)
                    births += 1
                person.age += 1

        # Migration is evaluated after births, once per original country each year.
        current = {}
        for person in self.people.values():
            current.setdefault(person.country, []).append(person)
        for cid, residents in current.items():
            adults = [p for p in residents if p.age >= 18]
            if len(residents) < 80 or not adults or self.rng.random() >= self.country_chance:
                continue
            founder = self.rng.choice(adults)
            target = self.rng.randint(10, max(10, len(residents) // 3))
            followers = [p for p in residents if p.lineage == founder.lineage]
            # Keep both countries populated, even if the founder's family is huge.
            followers = [founder] + [p for p in followers if p.id != founder.id][:target - 1]
            selected = {p.id for p in followers}
            others = [p for p in residents if p.id not in selected]
            followers += self.rng.sample(others, min(target - len(followers), len(others)))
            new_id = len(self.countries) + 1
            self.countries[new_id] = Country(new_id, self.founder_country_name(founder), founder.id,
                                             self.year, cid, capacity=self.countries[cid].capacity)
            self.countries[new_id].ruler = founder.id
            self.countries[new_id].technologies = set(self.countries[cid].technologies)
            self.countries[new_id].innovations = dict(getattr(self.countries[cid], "innovations", {}))
            self.countries[new_id].government = self.countries[cid].government
            if self.rng.random() < .25:
                from governments import INITIAL
                self.countries[new_id].government = self.rng.choice(list(INITIAL))
            self.countries[new_id].government_since = self.year
            if getattr(self.countries[cid], "capacity_manual", False):
                self.countries[new_id].capacity_manual = True
            self.countries[new_id].last_election = self.year
            states.append(f"{self.countries[new_id].name}: Newly founded")
            for person in followers:
                person.country = new_id
            self.record(f"{self.person_reference(founder)} founded "
                        f"{self.countries[new_id].name} with {len(followers)} settlers "
                        f"from {self.countries[cid].name}.")
            self.found_settlement(new_id, founder, followers)

        disaster_deaths = self.resolve_disasters()
        deaths += disaster_deaths
        causes["disaster"] = disaster_deaths
        war_deaths = self.resolve_wars()
        deaths += war_deaths
        causes["war"] = war_deaths
        from development import advance_expeditions, advance_armies, advance_caravans
        advance_armies(self)
        advance_caravans(self)
        journey_deaths = advance_expeditions(self)
        deaths += journey_deaths
        causes["ordinary"] += journey_deaths
        occupied = {p.country for p in self.people.values()}
        for country in self.countries.values():
            if country.ended is None and country.id not in occupied:
                country.ended = self.year
                self.record(f"{country.name} becomes uninhabited.")
        from governments import evolve as evolve_governments
        evolve_governments(self)
        maintain_rulers(self)
        self.update_settlements()
        from development import plan_projects, advance_projects
        plan_projects(self)
        advance_projects(self)
        from epidemiology import auto_eradicate
        auto_eradicate(self)
        annual_civic(self)
        from economy import spend as economy_spend
        economy_spend(self)
        ensure_year_events(self, history_start, minimum=10)
        after = len(self.people)
        if after != before:
            direction = "increased" if after > before else "decreased"
            self.record(f"Population {direction} from {before} to {after}.", "population")
        report = dict(year=self.year, states=states, start=history_start, end=len(self.history),
                      population=after, births=births, deaths=deaths, death_causes=causes,
                      interventions=interventions)
        self.yearly_reports.append(report)
        if verbose:
            print("\n" + self.format_year(report))
        return births, deaths

    def lineage_tree(self):
        """Show family branches, including lineages with no living members."""
        living = Counter(p.lineage for p in self.people.values())
        children = {}
        for lid, family in self.lineages.items():
            children.setdefault(family.parent_lineage, []).append(lid)

        def label(lid):
            family = self.lineages[lid]
            founder = self.archive[family.founder]
            # Use the founder's surname when this branch began, even if changed later.
            name = self.full_name(founder, lineage=lid, country=family.founder_country)
            status = f"{living[lid]} living" if living[lid] else "no living members"
            return (f"{self.lineage_name(lid)} - founder: {name} "
                    f"| year {family.founded} | {status}")

        lines = []
        for root in children.get(None, []):
            if lines:
                lines.append("")
            lines.append(label(root))
            branches = children.get(root, [])
            stack = [(lid, "", i == len(branches) - 1)
                     for i, lid in reversed(list(enumerate(branches)))]
            # Iterative traversal also handles long simulations with deep ancestry.
            while stack:
                lid, prefix, last = stack.pop()
                lines.append(prefix + ("`-- " if last else "|-- ") + label(lid))
                next_prefix = prefix + ("    " if last else "|   ")
                branches = children.get(lid, [])
                stack.extend((child, next_prefix, i == len(branches) - 1)
                             for i, child in reversed(list(enumerate(branches))))
        return "\n".join(lines) or "No lineages."

    def report(self, show_history=False):
        if show_history:
            for report in self.yearly_reports:
                print("\n" + self.format_year(report))
        countries = Counter(p.country for p in self.people.values())
        settlement_counts = Counter(p.settlement for p in self.people.values())
        families = Counter(p.lineage for p in self.people.values())
        print(f"\nLiving population: {len(self.people)}")
        print(f"Countries: {len(countries)} inhabited, {len(self.countries)} founded")
        for cid, count in countries.most_common():
            country = self.countries[cid]
            illness = f" | outbreak: {country.sickness}" if country.sickness else ""
            print(f"  {country.name}: {count}{illness}")
            ruler = self.people.get(country.ruler)
            leader = self.full_name(ruler) if ruler else "no adult ruler"
            print(f"    {country.government.capitalize()} | Economy: {country.economic_system} | Leader: {leader}")
            print(f"    Food: {country.food:.0f}/100 | Prosperity: {country.prosperity:.0f}/100 "
                  f"| Stability: {country.stability:.0f}/100")
            print("    Discoveries: " + (", ".join(sorted(country.technologies)) or "none yet"))
            print(f"    Applied innovations: {len(getattr(country, 'innovations', {}))} | Treasury: {country.treasury:,.1f}")
            project = getattr(country, "research_project", None)
            if project:
                print(f"    Research: {project} | Saved points: {country.research:.1f} "
                      f"| Focus: {country.research_focus}")
            for settlement in self.settlements.values():
                if settlement.country == cid and settlement_counts[settlement.id]:
                    capital = " (capital)" if settlement.id == country.capital else ""
                    print(f"    {settlement.kind.capitalize()} of {settlement.name}{capital}: "
                          f"{settlement_counts[settlement.id]} residents")
        print(f"Lineages: {len(families)} living, {len(self.lineages)} founded")
        print("Type lineages between years to inspect family trees.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--years", type=int)
    parser.add_argument("--population", type=int, default=2000)
    parser.add_argument("--seed", type=int)
    parser.add_argument("--capacity", type=int, default=1_000_000)
    parser.add_argument("--war-chance", type=float, default=.10,
                        help="Yearly war probability per eligible country pair (0 to 1)")
    parser.add_argument("--disaster-chance", type=float, default=.02,
                        help="Yearly disaster probability per inhabited country (0 to 1)")
    parser.add_argument("--quiet", action="store_true", help="Only print final summary")
    args = parser.parse_args()
    years = args.years if args.years is not None else int(input("Years to simulate: "))
    if years < 0 or args.population < 1 or args.capacity < 1:
        parser.error("Years must be nonnegative; population and capacity must be positive")
    if not 0 <= args.war_chance <= 1:
        parser.error("War chance must be between 0 and 1")
    if not 0 <= args.disaster_chance <= 1:
        parser.error("Disaster chance must be between 0 and 1")
    sim = Simulation(args.population, args.seed, args.capacity, war_chance=args.war_chance,
                     disaster_chance=args.disaster_chance)
    if not args.quiet:
        print(sim.format_year(sim.yearly_reports[0]))
    print("\n    Enter advances one year. Type help for inspection commands, or quit to stop.")
    for _ in range(years):
        while True:
            try:
                text = input(f"\n    Year {sim.year + 1} — Enter or command: ")
            except (EOFError, KeyboardInterrupt):
                print("\nSimulation stopped.")
                sim.report()
                return
            output, action = command(sim, text)
            if output:
                print("\n".join("    " + line if line else "" for line in output.splitlines()))
            if action == "quit":
                sim.report()
                return
            if action == "next":
                break
        sim.tick(verbose=not args.quiet)
        if not sim.people:
            print("The population has died out.")
            break
    sim.report()


if __name__ == "__main__":
    main()
