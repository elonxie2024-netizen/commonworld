"""Forms of government: who rules, how they are chosen, what each form is good and bad at,
and how countries slide from one form into another."""

# traits: research (+/-), culture (x), trade (x), stability (+/- per year), war (x chance of war),
# military (x), expansion (x), output (x resource output), quota (x share of a deposit taken each year),
# tax (x revenue collected), corruption (share of the treasury lost each year)
DEFAULT_TRAITS = {"research": 0.0, "culture": 1.0, "trade": 1.0, "stability": 0.0, "war": 1.0, "military": 1.0,
                  "expansion": 1.0, "output": 1.0, "quota": 1.0, "tax": 1.0, "corruption": 0.0}

GOVERNMENTS = {
    "tribal": {"label": "Tribal confederacy", "title": "chief", "succession": "fame", "term": 0, "verb": "was chosen as war chief",
               "blurb": "Clans under a chief. Little administration, hardy and eager for land.",
               "traits": {"research": -.06, "expansion": 1.15, "stability": .12, "tax": .6, "output": .95, "war": 1.1, "military": 1.05}},
    "monarchy": {"label": "Monarchy", "title": "monarch", "succession": "hereditary", "term": 0, "verb": "was crowned",
                 "heir": "inherited the throne", "blurb": "Hereditary rule. Stable dynasties, ambitious courts.",
                 "traits": {"expansion": 1.1, "culture": 1.05, "war": 1.05, "stability": .05, "corruption": .008}},
    "council": {"label": "Council", "title": "council leader", "succession": "election", "term": 8, "verb": "was elected to lead the council",
                "blurb": "A council of notables chooses a leader every few years.",
                "traits": {"research": .06, "war": .95}},
    "republic": {"label": "Republic", "title": "president", "succession": "election", "term": 6, "verb": "was elected president",
                 "blurb": "Elected office under law. Trade and learning flourish; wars are harder to start.",
                 "traits": {"research": .06, "trade": 1.1, "war": .85, "expansion": .9, "culture": 1.1, "corruption": .004}},
    "democracy": {"label": "Democracy", "title": "prime minister", "succession": "election", "term": 4, "verb": "won the national vote",
                  "blurb": "Broad participation. Strong science and culture, reluctant to fight, protective of resources.",
                  "traits": {"research": .1, "trade": 1.12, "war": .6, "expansion": .8, "culture": 1.2, "tax": .9, "stability": -.05, "quota": .85}},
    "theocracy": {"label": "Theocracy", "title": "high priest", "succession": "divine", "term": 0, "verb": "was proclaimed high priest",
                  "blurb": "Priests rule. Very stable and devout, slow to learn, quick to fight over faith.",
                  "traits": {"research": -.1, "culture": 1.2, "stability": .2, "war": 1.15, "military": 1.03, "tax": 1.1, "output": .97}},
    "junta": {"label": "Military junta", "title": "general", "succession": "seizure", "term": 0, "verb": "seized power in a coup",
              "blurb": "Officers rule. Strong armies and eager to expand; poor for learning and the arts; drains resources.",
              "traits": {"military": 1.15, "war": 1.5, "research": -.08, "culture": .75, "expansion": 1.25, "stability": .1, "output": 1.1, "quota": 1.2, "corruption": .01, "tax": 1.15}},
    "oligarchy": {"label": "Oligarchy", "title": "chief magistrate", "succession": "wealth", "term": 10, "verb": "was installed by the wealthy families",
                  "blurb": "The richest families rule. Good for trade, light on taxes, prone to corruption.",
                  "traits": {"trade": 1.15, "tax": .8, "corruption": .012, "war": .95, "culture": .95}},
    "empire": {"label": "Empire", "title": "emperor", "succession": "hereditary", "term": 0, "verb": "was crowned emperor",
               "heir": "inherited the imperial crown", "blurb": "A vast realm under an emperor. Heavy taxes and armies, restless provinces.",
               "traits": {"military": 1.08, "war": 1.3, "expansion": 1.2, "tax": 1.25, "stability": -.08, "culture": 1.1, "output": 1.05, "corruption": .01}},
    "merchant": {"label": "Merchant republic", "title": "doge", "succession": "election", "term": 6, "verb": "was elected doge by the guilds",
                 "blurb": "Guilds and ports rule. The best traders, peaceful, with modest armies.",
                 "traits": {"trade": 1.3, "war": .7, "military": .92, "research": .05, "tax": .85, "culture": 1.05, "expansion": .95}},
    "tyranny": {"label": "Tyranny", "title": "dictator", "succession": "seizure", "term": 0, "verb": "seized absolute power",
                "blurb": "One strongman rules by fear. Fierce taxes and output, little freedom for science or art.",
                "traits": {"stability": .15, "war": 1.3, "tax": 1.3, "corruption": .02, "research": -.1, "culture": .7, "military": 1.1, "output": 1.15, "quota": 1.3}},
}
HEREDITARY = ("monarchy", "empire")
AUTHORITY = ("tribal", "monarchy", "empire", "junta", "tyranny")
INITIAL = ("tribal", "monarchy", "council", "theocracy", "oligarchy")


def info(government):
    return GOVERNMENTS.get(government, GOVERNMENTS["monarchy"])


def trait(country, name):
    return info(country.government)["traits"].get(name, DEFAULT_TRAITS[name])


def title_of(government):
    return info(government)["title"]


def all_titles():
    return {g["title"] for g in GOVERNMENTS.values()}


def inequality(sim, cid):
    """Gini coefficient of personal wealth among a country's adults (sampled for speed)."""
    wealth = sorted([getattr(p, "wealth", 0.0) for p in sim.people.values() if p.country == cid and p.age >= 18])
    n = len(wealth)
    if n < 10 or sum(wealth) <= 0:
        return 0.0
    step = max(1, n // 120)
    sample = wealth[::step]
    total = sum(sample)
    running = 0.0
    for i in range(len(sample)):
        running += (i + 1) * sample[i]
    return max(0.0, min(1.0, (2 * running) / (len(sample) * total) - (len(sample) + 1) / len(sample)))


def _options(sim, country, st, places):
    """Governments this country could realistically turn into, with weights."""
    gov = country.government
    techs = country.technologies
    stab = country.stability
    culture = getattr(country, "culture", 0.0)
    pop = st["residents"]
    war = st["at_war"]
    options = []

    def add(target, weight):
        if weight > 0:
            options.append((target, weight))

    if gov == "tribal":
        add("monarchy", 3 if pop >= 500 else 1)
        add("council", 2 if "writing" in techs else 0)
        add("theocracy", 1.5)
        add("oligarchy", 1 if "pottery" in techs else 0)
    elif gov == "monarchy":
        add("empire", 3 if places >= 5 and pop >= 2500 and "bronze tools" in techs else 0)
        add("council", 1.2 if "writing" in techs and stab > 55 else 0)
        add("republic", 2.2 if stab < 40 and "writing" in techs else 0)
        add("theocracy", 1.5 if stab < 50 else 0)
        add("oligarchy", 1.2 if stab < 45 else 0)
        add("junta", 2 if war and stab < 40 else 0)
    elif gov == "council":
        add("republic", 2.5 if "writing" in techs and stab > 55 else 0)
        add("merchant", 2 if st["trade"] >= 2.5 else 0)
        add("oligarchy", 2 if inequality(sim, country.id) > .5 else 0)
        add("tyranny", 1.5 if stab < 30 and war else 0)
        add("monarchy", 1 if stab < 35 else 0)
    elif gov == "republic":
        add("democracy", 3 if ("printing" in techs or "universities" in techs) and culture >= 30 and stab > 60 else 0)
        add("oligarchy", 2 if inequality(sim, country.id) > .55 else 0)
        add("junta", 2.5 if stab < 30 else 0)
        add("merchant", 1.5 if st["trade"] >= 3 else 0)
        add("empire", 1 if places >= 6 and war else 0)
    elif gov == "democracy":
        add("republic", 2 if stab < 35 else 0)
        add("oligarchy", 1.5 if inequality(sim, country.id) > .6 else 0)
        add("junta", 2 if stab < 25 and war else 0)
        add("tyranny", 1.5 if stab < 20 else 0)
    elif gov == "theocracy":
        add("monarchy", 2 if stab < 40 else 0)
        add("republic", 2 if culture >= 40 and "universities" in techs else 0)
        add("junta", 1 if war else 0)
    elif gov == "junta":
        add("tyranny", 2 if stab > 60 else 0)
        add("republic", 1.5 if stab > 65 and country.prosperity > 55 else 0)
        add("monarchy", 1)
    elif gov == "oligarchy":
        add("merchant", 1.5 if st["trade"] >= 2 else 0)
        add("republic", 2 if stab < 35 else 0)
        add("monarchy", 1)
        add("tyranny", 1)
    elif gov == "empire":
        add("monarchy", 3 if stab < 30 else 0)
        add("junta", 1.5 if war else 0)
        add("republic", .6 if stab < 40 else 0)
    elif gov == "merchant":
        add("republic", 1)
        add("oligarchy", 2 if inequality(sim, country.id) > .5 else 0)
        add("monarchy", .5 if war else 0)
    elif gov == "tyranny":
        add("junta", 1.5)
        add("republic", 2 if stab < 20 else 0)
        add("monarchy", 1)
    return options


def evolve(sim):
    """Each year an unstable or changed country may switch its form of government."""
    from systems import state
    places = {}
    for s in sim.settlements.values():
        if s.abandoned is None:
            places[s.country] = places.get(s.country, 0) + 1
    for cid in sorted(sim.countries):
        country = sim.countries[cid]
        if country.ended is not None or sim.year - getattr(country, "government_since", 0) < 10:
            continue
        chance = .012 + max(0, 45 - country.stability) * .005
        if sim.rng.random() >= chance:
            continue
        options = _options(sim, country, state(sim, cid), places.get(cid, 0))
        if not options:
            continue
        target = sim.rng.choices([o[0] for o in options], [o[1] for o in options])[0]
        old = country.government
        country.government = target
        country.government_since = sim.year
        country.last_election = sim.year
        country.ruler = None
        if country.stability < 45:
            country.stability = min(60, country.stability + 12)
        how = "An uprising" if country.stability < 55 else "A reform movement"
        sim.record(f"{how} in {country.name} replaced the {info(old)['label'].lower()} with a {info(target)['label'].lower()}.", "political")


def describe(sim, query=""):
    lines = ["Forms of government:"]
    for key, g in GOVERNMENTS.items():
        traits = ", ".join([f"{k} {v:+.2f}" if k in ("research", "stability", "corruption") else f"{k} x{v:.2f}" for k, v in g["traits"].items()])
        lines.append(f"  {g['label']} ({key}): rules as {g['title']}; chosen by {g['succession']}; {g['blurb']} [{traits}]")
    lines.append("Countries:")
    for cid in sorted(sim.countries):
        country = sim.countries[cid]
        if country.ended is None and (not query or query in country.name.casefold()):
            lines.append(f"  {country.name}: {info(country.government)['label']} (since year {getattr(country, 'government_since', 0)})")
    return "\n".join(lines)
