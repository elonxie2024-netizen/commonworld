"""The technology tree: fifteen ages, eight branches, and what each discovery changes.

Every discovery carries numeric effects. War, disease, travel, trade, farming and research all
read the owned technologies through `effects`, so the world changes as the ages turn: spears give
way to legions, knights and muskets; water wheels to steam and rails; herbs to germ theory.
"""

ERAS = ["Old Stone Age", "New Stone Age", "Early Bronze Age", "Late Bronze Age", "Early Iron Age", "Late Iron Age", "Classical Age", "Late Antiquity",
        "Early Middle Ages", "High Middle Ages", "Renaissance", "Age of Reason", "Industrial Age", "Age of Steel", "Electric Age"]
# the broad age (0-6) each finer age belongs to: sprites, budgets and the like follow the broad age
ERA_GROUP = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 6]
BRANCHES = ["agriculture", "industry", "energy", "construction", "warfare", "seafaring", "trade", "knowledge", "culture", "medicine", "governance"]

# effect keys:
#  prod research trade food          multipliers/bonuses on the economy
#  mil siege log                     army strength, siege strength, supplies (added to a base of 1 / 0)
#  dfn wnd                           defender losses and wound deaths (multiplied)
#  inf wat air con dth               infection overall, waterborne, airborne, contact, disease deaths (multiplied)
#  care cure                         extra hospital capacity share, extra cure speed (added)
#  land sea                          travel speed bonus on land and water (added)
#  weapon ship cart                  unit tiers shown on the map and used in war (highest owned wins)
COST_SCALE = 3.2  # research points per listed cost unit (dear on its own; settlers, trade and conquest bring the rest)
T = {}


def _t(name, needs, cost, blurb, era, branch, effects):
    T[name] = (set(needs), int(cost * COST_SCALE), blurb, era, branch, effects)


# ---- Stone Age
_t('stone tools', [], 8, 'sharper tools and steadier work', 0, 'industry', {"prod": 0.03})
_t('spear making', [], 8, 'hunting and defense with spears', 0, 'warfare', {"mil": 0.04, "weapon": 0})
_t('weaving', [], 9, 'cloth, nets and baskets', 0, 'industry', {"prod": 0.02, "food": 1})
_t('pottery', [], 10, 'safer food storage', 0, 'agriculture', {"food": 2, "prod": 0.02})
_t('animal husbandry', [], 12, 'more reliable food and transport', 0, 'agriculture', {"food": 2, "prod": 0.03, "land": 0.03})
_t('granaries', ['pottery'], 11, 'food reserves for lean years', 1, 'agriculture', {"food": 3})
# ---- Bronze Age
_t('irrigation', ['seed gathering', 'stone tools'], 14, 'more reliable harvests', 2, 'agriculture', {"food": 3, "prod": 0.03})
_t('writing', ['counting'], 16, 'records and faster research', 2, 'knowledge', {"research": 0.1})
_t('bronze tools', ['alloying'], 18, 'more productive workshops', 3, 'industry', {"prod": 0.06, "mil": 0.06})
_t('bronze weapons', ['bronze tools', 'spear making'], 20, 'bronze spears, axes and shields', 3, 'warfare', {"mil": 0.1, "weapon": 1})
_t('masonry', ['stone tools'], 18, 'stone buildings and walls', 2, 'industry', {"prod": 0.03, "dfn": 0.96})
_t('roads', ['bronze tools', 'wheel'], 20, 'better trade routes', 3, 'trade', {"trade": 0.1, "land": 0.1, "prod": 0.04, "cart": 1})
_t('sailing', ['reed boats'], 22, 'coastal trade', 3, 'seafaring', {"sea": 0.1, "trade": 0.06, "ship": 1})
_t('fortification', ['masonry'], 22, 'defensible settlements', 2, 'warfare', {"dfn": 0.88})
_t('currency', ['barter', 'weights and measures', 'writing', 'smelting'], 24, 'coins make trade simple', 2, 'trade', {"trade": 0.12, "prod": 0.03})
_t('calendar', ['star lore'], 20, 'the seasons planned in advance', 2, 'knowledge', {"food": 2, "research": 0.04})
# ---- Iron Age
_t('ironworking', ['bronze tools', 'bellows'], 30, 'stronger tools and weapons', 4, 'warfare', {"mil": 0.12, "prod": 0.06, "weapon": 2})
_t('crop rotation', ['irrigation', 'composting'], 28, 'larger sustainable harvests', 4, 'agriculture', {"food": 3, "prod": 0.03})
_t('iron plow', ['crop rotation', 'ironworking', 'ard plow'], 32, 'deep furrows in heavy soil', 4, 'agriculture', {"food": 3, "prod": 0.04})
_t('aqueducts', ['roads', 'irrigation', 'surveying'], 30, 'cleaner water', 4, 'medicine', {"inf": 0.96, "wat": 0.85})
_t('medicine', ['writing', 'herb lore'], 28, 'better treatment of illness', 4, 'medicine', {"dth": 0.92, "care": 0.02, "cure": 0.2})
_t('mathematics', ['writing'], 28, 'more precise scientific work', 4, 'knowledge', {"research": 0.08})
_t('soapmaking', ['pottery', 'animal husbandry'], 22, 'cleaner hands and households', 4, 'medicine', {"inf": 0.93, "con": 0.88})
_t('shipbuilding', ['sailing', 'timber framing'], 32, 'stout ships with sails and oars', 5, 'seafaring', {"sea": 0.15, "ship": 2})
_t('cavalry', ['ironworking', 'horse domestication'], 34, 'mounted warriors', 5, 'warfare', {"mil": 0.08, "land": 0.05, "log": 0.05})
_t('law codes', ['currency', 'kingship'], 30, 'written laws and courts', 5, 'governance', {"research": 0.03, "trade": 0.05})
_t('siege craft', ['ironworking', 'fortification'], 34, 'rams, towers and sappers', 5, 'warfare', {"siege": 0.2})
# ---- Classical Age
_t('steelmaking', ['crucible furnaces'], 40, 'durable equipment', 7, 'industry', {"mil": 0.12, "prod": 0.06})
_t('military drill', ['ironworking', 'roads', 'tax collection'], 38, 'disciplined legions and standing armies', 6, 'warfare', {"mil": 0.1, "log": 0.06, "weapon": 3})
_t('military logistics', ['roads', 'writing'], 38, 'more reliable army supplies', 6, 'warfare', {"log": 0.2})
_t('watermills', ['roads', 'irrigation', 'wheelwrights'], 36, 'productive grain milling', 6, 'industry', {"food": 2, "prod": 0.06})
_t('engineering', ['masonry', 'surveying'], 40, 'arches, bridges and machines', 6, 'industry', {"prod": 0.05, "siege": 0.1, "dfn": 0.97})
_t('paper', ['writing', 'weaving'], 34, 'cheaper preservation of knowledge', 6, 'knowledge', {"research": 0.08})
_t('public sanitation', ['aqueducts', 'medicine'], 42, 'lower mortality', 6, 'medicine', {"inf": 0.92, "wat": 0.76, "dth": 0.97})
_t('surgery', ['medicine', 'ironworking'], 40, 'better survival after injury', 6, 'medicine', {"dth": 0.95, "wnd": 0.8, "care": 0.02, "cure": 0.1})
_t('herbal pharmacology', ['medicine'], 36, 'more effective remedies', 6, 'medicine', {"dth": 0.92, "care": 0.02, "cure": 0.2})
_t('astronomy', ['mathematics', 'star lore'], 38, 'better calendars and navigation', 6, 'knowledge', {"research": 0.06, "sea": 0.05})
_t('navigation', ['sailing', 'astronomy'], 44, 'safer long-distance trade', 6, 'seafaring', {"sea": 0.12, "trade": 0.08})
_t('bureaucracy', ['law codes', 'paper', 'tax collection'], 42, 'officials keep the realm running', 6, 'governance', {"research": 0.04, "trade": 0.06, "prod": 0.03})
# ---- Medieval Age
_t('quarantine', ['medicine'], 48, 'slower epidemic transmission', 8, 'medicine', {"inf": 0.9, "air": 0.85, "con": 0.92})
_t('universities', ['paper', 'mathematics'], 52, 'organized research and teaching', 8, 'knowledge', {"research": 0.14})
_t('banking', ['minted coinage', 'double-entry bookkeeping', 'paper'], 50, 'investment in workshops', 8, 'trade', {"trade": 0.12, "prod": 0.05})
_t('mechanical clocks', ['mathematics', 'screw and lathe'], 54, 'precise timekeeping', 9, 'industry', {"prod": 0.05, "research": 0.04})
_t('heavy cavalry', ['steelmaking', 'stirrups'], 52, 'armored knights and chivalry', 8, 'warfare', {"mil": 0.12, "weapon": 4})
_t('castles', ['fortification', 'engineering'], 50, 'keeps and curtain walls', 8, 'warfare', {"dfn": 0.82})
_t('crossbows', ['steelmaking', 'military drill'], 50, 'bolts that pierce armor', 8, 'warfare', {"mil": 0.08, "dfn": 0.97})
_t('three-field system', ['iron plow'], 48, 'land rests and feeds more people', 8, 'agriculture', {"food": 4, "prod": 0.04})
_t('lenses', ['glassmaking', 'mathematics'], 46, 'improved observation', 8, 'knowledge', {"research": 0.06})
_t('guilds', ['market regulation', 'bureaucracy'], 52, 'crafts organized and taxed', 8, 'governance', {"prod": 0.06, "trade": 0.06})
_t('hospitals', ['medicine', 'universities'], 56, 'organized care for the sick', 9, 'medicine', {"dth": 0.94, "care": 0.03, "cure": 0.15})
_t('cog ships', ['navigation', 'lateen sails'], 52, 'deep-hulled merchant ships', 8, 'seafaring', {"sea": 0.18, "ship": 3})
# ---- Renaissance
_t('printing', ['paper', 'screw and lathe'], 64, 'faster diffusion of ideas', 10, 'knowledge', {"research": 0.14})
_t('chemistry', ['ironworking', 'universities', 'alchemy'], 66, 'elements, acids and powders', 10, 'knowledge', {"research": 0.08, "prod": 0.04})
_t('gunpowder', ['alchemy', 'steelmaking'], 70, 'an explosive that changes war', 10, 'warfare', {"mil": 0.1, "siege": 0.3})
_t('musketry', ['gunpowder', 'military drill', 'blast furnace'], 74, 'volleys of musket fire', 11, 'warfare', {"mil": 0.25, "weapon": 5, "wnd": 1.1})
_t('bastion forts', ['castles', 'ballistics'], 74, 'angled walls that shrug off cannon', 11, 'warfare', {"dfn": 0.78})
_t('microscopy', ['lenses', 'universities'], 64, 'investigation of invisible organisms', 10, 'medicine', {"cure": 0.2, "research": 0.04})
_t('anatomy', ['surgery', 'printing'], 66, 'the body mapped by dissection', 10, 'medicine', {"dth": 0.93, "care": 0.02, "wnd": 0.9})
_t('scientific method', ['printing', 'universities'], 76, 'experiment and open publication', 10, 'knowledge', {"research": 0.2})
_t('ocean ships', ['cog ships', 'sternpost rudder'], 70, 'caravels and carracks cross oceans', 10, 'seafaring', {"sea": 0.22, "ship": 4})
_t('joint-stock companies', ['banking', 'ocean ships'], 72, 'shared risk, shared profit', 10, 'trade', {"trade": 0.15, "prod": 0.05})
_t('crop exchange', ['three-field system', 'ocean ships'], 70, 'new crops cross the seas', 10, 'agriculture', {"food": 5, "prod": 0.04})
# ---- Industrial Age
_t('steam power', ['steelmaking', 'watermills', 'mine pumps'], 84, 'mechanized production', 12, 'industry', {"prod": 0.14})
_t('railways', ['machine tools'], 94, 'iron roads for steam trains', 13, 'trade', {"trade": 0.2, "land": 0.5, "log": 0.2, "cart": 2, "prod": 0.05})
_t('steamships', ['steam power', 'ocean ships', 'iron hulls'], 94, 'ships that ignore the wind', 12, 'seafaring', {"sea": 0.4, "ship": 5})
_t('germ theory', ['microscopy', 'public sanitation', 'chemistry'], 90, 'targeted prevention of infection', 12, 'medicine', {"inf": 0.88, "air": 0.9, "con": 0.9, "dth": 0.88, "care": 0.02, "cure": 0.3})
_t('vaccination', ['germ theory', 'herbal pharmacology'], 96, 'protection from severe epidemics', 12, 'medicine', {"inf": 0.9, "air": 0.85, "dth": 0.92, "cure": 0.3})
_t('public health', ['germ theory', 'bureaucracy'], 100, 'sewers, inspection and clean milk', 12, 'medicine', {"wat": 0.7, "inf": 0.92, "care": 0.03})
_t('rifled firearms', ['musketry', 'steam power', 'ballistics'], 100, 'accurate breech-loading rifles', 13, 'warfare', {"mil": 0.3, "weapon": 6, "wnd": 1.1})
_t('artillery', ['steam power', 'ballistics'], 100, 'rifled guns that smash any wall', 13, 'warfare', {"siege": 0.5, "mil": 0.1})
_t('fertilizers', ['chemistry', 'crop exchange', 'selective breeding'], 92, 'factory nitrates feed the fields', 12, 'agriculture', {"food": 6, "prod": 0.05})
_t('electricity', ['magnetism', 'scientific method', 'chemistry'], 104, 'power and the telegraph', 12, 'knowledge', {"research": 0.25, "prod": 0.08})
_t('factory system', ['guilds', 'machine tools'], 98, 'mass production in great mills', 13, 'governance', {"prod": 0.14, "trade": 0.06})

# ======================================================================== wider tree: more topics, more steps
# ---- Stone Age
_t("seed gathering", [], 8, "wild grain is gathered and saved", 0, "agriculture", {"food": 1})
_t("fishing nets", ["weaving"], 9, "nets and traps feed the coast", 1, "agriculture", {"food": 1})
_t("smoking and drying", ["pottery"], 10, "meat and fish keep through winter", 1, "agriculture", {"food": 1, "spoil": .92})
_t("fire making", [], 8, "warmth, light and cooked food", 0, "energy", {"prod": .02, "inf": .98})
_t("bone tools", ["stone tools"], 9, "needles, hooks and awls", 1, "industry", {"prod": .02})
_t("oral tradition", [], 8, "stories carry knowledge between generations", 0, "culture", {"cult": .05, "research": .01})
_t("cave painting", ["oral tradition"], 9, "images tell the tribe who it is", 1, "culture", {"cult": .05})
_t("burial rites", ["oral tradition"], 9, "the dead are honored and the living bound together", 1, "culture", {"stab": .03})
_t("thatched huts", [], 8, "sturdier homes against the weather", 0, "construction", {"build": .03})
_t("wooden palisade", ['thatched huts', 'stone tools'], 10, "stakes around the camp", 1, "construction", {"dfn": .97})
_t("counting", [], 8, "tallies of days, herds and goods", 0, "knowledge", {"research": .03})
_t("herb lore", [], 8, "plants for wounds and fevers", 0, "medicine", {"dth": .98})
_t("midwifery", ["herb lore"], 9, "safer births", 1, "medicine", {"care": .01, "dth": .99})
_t("slings and bows", ['spear making', 'weaving'], 10, "hunting and fighting at a distance", 1, "warfare", {"mil": .02})
_t("tribal council", [], 9, "elders settle disputes", 0, "governance", {"stab": .03})
_t("dugout canoes", ['fire making', 'stone tools'], 10, "hollowed logs on rivers and coasts", 1, "seafaring", {"sea": .04})
_t("barter", ['oral tradition'], 8, "goods swapped between camps", 1, "trade", {"trade": .04})
# ---- Bronze Age
_t("charcoal burning", ["fire making"], 14, "hot, steady fires for metal", 2, "energy", {"prod": .03})
_t("kiln firing", ["pottery", "fire making"], 14, "hard bricks and pots", 2, "industry", {"prod": .03})
_t("mud brick", ["thatched huts", "kiln firing"], 14, "walls that last", 2, "construction", {"build": .04})
_t("smelting", ['charcoal burning', 'kiln firing', 'stone tools'], 16, "metal from ore", 2, "industry", {"prod": .04})
_t("prospecting", ["smelting"], 16, "finding ore by its signs", 3, "industry", {"prod": .02})
_t("priesthood", ["burial rites", "calendar"], 16, "specialists tend the sacred", 2, "culture", {"cult": .06, "stab": .03})
_t("temple building", ['priesthood'], 18, "houses for the gods", 3, "culture", {"cult": .06})
_t("epic poetry", ["oral tradition", "writing"], 16, "long songs of heroes and kings", 2, "culture", {"cult": .08})
_t("weights and measures", ["counting"], 14, "fair trade needs fair scales", 2, "trade", {"trade": .04})
_t("caravan routes", ["roads", "barter"], 18, "regular trade over long distances", 3, "trade", {"trade": .06, "land": .04})
_t("ard plow", ['animal husbandry', 'seed gathering', 'stone tools'], 16, "oxen pull a scratch plow", 2, "agriculture", {"food": 2, "prod": .02})
_t("orchards and bees", ['irrigation'], 14, "fruit, honey and wax", 2, "agriculture", {"food": 2})
_t("salt curing", ["smoking and drying"], 14, "salt keeps food for months", 2, "agriculture", {"spoil": .9, "food": 1})
_t("healing shrines", ["herb lore", "priesthood"], 16, "the sick are brought to the temple", 3, "medicine", {"dth": .97, "care": .01, "stab": .01})
_t("watchtowers", ["fortification"], 16, "early warning on the frontier", 3, "warfare", {"dfn": .98})
_t("war chariots", ['bronze weapons', 'wheel', 'horse domestication'], 20, "fast, shocking charges", 3, "warfare", {"mil": .05, "land": .03})
_t("reed boats", ["dugout canoes", "weaving"], 14, "light boats for rivers and lakes", 3, "seafaring", {"sea": .05})
_t("coastal pilotage", ['sailing', 'star lore'], 16, "landmarks and soundings", 3, "seafaring", {"sea": .04})
_t("city planning", ["mud brick", "roads"], 18, "streets, squares and drains laid out", 3, "construction", {"build": .04, "stab": .02})
_t("tax collection", ['weights and measures', 'writing', 'kingship'], 18, "the state counts and collects", 3, "governance", {"trade": .03, "stab": .02})
_t("kingship", ["tribal council", "priesthood"], 18, "one ruler, one realm", 3, "governance", {"stab": .04})
# ---- Iron Age
_t("forging", ['ironworking'], 30, "hammered iron and steel edges", 5, "industry", {"prod": .04, "mil": .03})
_t("mining shafts", ["prospecting", "bronze tools"], 28, "ore from deep underground", 5, "industry", {"prod": .05})
_t("wheelwrights", ["animal husbandry", "bronze tools", 'wheel'], 26, "spoked wheels and strong carts", 4, "industry", {"land": .04, "prod": .02})
_t("glassmaking", ['bellows'], 28, "clear glass for windows and vessels", 5, "industry", {"prod": .03})
_t("arches and vaults", ['city planning', 'lime mortar'], 28, "stone spans and roofs", 5, "construction", {"build": .05, "haz": .97})
_t("paved roads", ["roads", "masonry"], 28, "stone roads that last", 5, "trade", {"land": .06, "trade": .05})
_t("harbors and docks", ["sailing", "masonry"], 28, "quays, breakwaters and warehouses", 5, "seafaring", {"sea": .05, "trade": .03})
_t("sundials", ["calendar", "mathematics"], 26, "time measured by shadow", 4, "knowledge", {"research": .04})
_t("philosophy", ['mathematics'], 30, "questions about the world and how to live", 4, "knowledge", {"research": .07, "cult": .06})
_t("drama and theater", ["epic poetry", "city planning", 'music and dance'], 28, "plays before the whole city", 5, "culture", {"cult": .08})
_t("sculpture", ["temple building", "masonry"], 26, "marble and bronze figures", 5, "culture", {"cult": .06})
_t("state religion", ['law codes'], 30, "one faith binds the realm", 5, "culture", {"cult": .05, "stab": .05})
_t("phalanx", ["bronze weapons", "fortification"], 26, "locked shields and long spears", 5, "warfare", {"mil": .04, "dfn": .98})
_t("iron armor", ['forging'], 30, "mail and helmets", 5, "warfare", {"wnd": .95, "mil": .02})
_t("clinical observation", ['medicine'], 28, "patients watched and records kept", 4, "medicine", {"dth": .95, "cure": .1})
_t("latrines and drains", ["aqueducts", "masonry"], 28, "waste carried away from homes", 5, "medicine", {"wat": .9, "inf": .97})
_t("selective breeding", ["animal husbandry", "seed gathering"], 26, "the best animals and seed are kept", 4, "agriculture", {"food": 2, "prod": .03})
_t("olive and wine", ["orchards and bees", "kiln firing"], 26, "oil and wine for trade", 4, "agriculture", {"food": 1, "trade": .03})
_t("grain silos", ["granaries", "masonry"], 24, "dry stone storage", 4, "agriculture", {"spoil": .9, "food": 1})
_t("courts", ["law codes"], 28, "judges hear disputes openly", 5, "governance", {"stab": .05})
_t("census", ["tax collection", "mathematics"], 28, "the realm counted by name", 4, "governance", {"research": .02, "stab": .02, "trade": .02})
_t("minted coinage", ['currency'], 26, "stamped coins of fixed weight", 4, "trade", {"trade": .06})
# ---- Classical Age
_t("cast iron", ["forging", "mining shafts"], 38, "iron poured into molds", 7, "industry", {"prod": .05})
_t("windmills", ['watermills', 'weaving'], 38, "wind turns the grindstone", 6, "energy", {"prod": .05, "food": 1})
_t("coal mining", ['mining shafts'], 38, "black rock that burns hot", 6, "energy", {"prod": .05})
_t("concrete", ['arches and vaults'], 40, "stone poured and set", 7, "construction", {"build": .06, "haz": .97})
_t("sewers", ["latrines and drains", "arches and vaults"], 40, "covered channels beneath the streets", 7, "medicine", {"wat": .88, "inf": .95})
_t("public baths", ['latrines and drains'], 36, "bathing for the whole town", 7, "medicine", {"con": .9, "inf": .97, "stab": .01})
_t("civil service", ["census", "bureaucracy"], 44, "trained officials", 7, "governance", {"prod": .04, "research": .03})
_t("historiography", ["philosophy", "paper"], 38, "the past written down and argued over", 6, "culture", {"cult": .07, "research": .03})
_t("cartography", ["astronomy", "paper", 'surveying'], 40, "maps of coasts and roads", 6, "knowledge", {"sea": .05, "research": .03})
_t("algebra", ['astronomy'], 40, "unknowns solved by rule", 6, "knowledge", {"research": .07})
_t("mechanics", ['engineering'], 42, "levers, gears and pulleys explained", 6, "knowledge", {"research": .05, "prod": .03})
_t("stirrups", ["cavalry", "forging"], 38, "riders fight from the saddle", 6, "warfare", {"mil": .05, "land": .02})
_t("catapults", ["siege craft", "engineering"], 42, "stone and bolts hurled over walls", 6, "warfare", {"siege": .1})
_t("legionary camps", ["military drill", "engineering"], 42, "armies fortify every night", 7, "warfare", {"log": .1, "dfn": .98})
_t("war galleys", ["shipbuilding", "iron armor"], 38, "rams and boarding bridges", 7, "seafaring", {"mil": .03, "sea": .05})
_t("lighthouse engineering", ["harbors and docks", "engineering"], 40, "tall towers guide ships home", 7, "seafaring", {"sea": .05, "haz": .99})
_t("market regulation", ["minted coinage", "courts"], 38, "inspectors keep trade honest", 7, "trade", {"trade": .07})
_t("imperial roads", ["paved roads", "bureaucracy"], 44, "a road network across the realm", 7, "trade", {"land": .1, "log": .05})
_t("heavy plow", ["iron plow", "wheelwrights"], 38, "turns the thick northern soil", 7, "agriculture", {"food": 2, "prod": .04})
_t("monasteries", ["state religion", "paper"], 42, "communities of prayer, books and farming", 7, "culture", {"cult": .07, "research": .03, "stab": .02})
_t("classical architecture", ["sculpture", "arches and vaults", 'mathematics'], 40, "columns, domes and proportion", 7, "construction", {"build": .04, "cult": .04})
_t("building codes", ['arches and vaults', 'law codes'], 38, "rules against fire and collapse", 7, "construction", {"haz": .95})
# ---- Medieval Age
_t("blast furnace", ["cast iron", "coal mining"], 54, "continuous iron at scale", 8, "industry", {"prod": .06, "mil": .03})
_t("spinning wheel", ['weaving', 'wheelwrights'], 48, "thread spun many times faster", 8, "industry", {"prod": .05, "trade": .03})
_t("gothic architecture", ["classical architecture", "concrete", 'stone quarrying'], 54, "pointed arches and soaring cathedrals", 9, "construction", {"build": .06, "cult": .06, "stab": .02})
_t("stone bridges", ["arches and vaults", "imperial roads", 'surveying'], 50, "rivers crossed for good", 9, "construction", {"land": .05, "build": .04})
_t("dikes and polders", ["concrete", "heavy plow", 'surveying'], 52, "land won back from the water", 9, "construction", {"haz": .93, "food": 2})
_t("scholasticism", ["universities", "philosophy"], 56, "faith and reason debated in the schools", 9, "knowledge", {"research": .08, "cult": .04})
_t("illuminated manuscripts", ['monasteries'], 50, "books as works of art", 9, "culture", {"cult": .07})
_t("chivalric orders", ["heavy cavalry", "state religion"], 54, "knights bound by oath and rule", 9, "culture", {"cult": .04, "mil": .04, "stab": .02})
_t("troubadours", ["epic poetry", "monasteries", 'music and dance'], 46, "songs and stories carried from court to court", 9, "culture", {"cult": .06})
_t("longbows", ['slings and bows', 'military drill'], 52, "volleys that break charges", 9, "warfare", {"mil": .06})
_t("plate armor", ["blast furnace", "iron armor"], 58, "full steel harness", 9, "warfare", {"wnd": .9, "mil": .04})
_t("pike formations", ['longbows'], 54, "forests of spears against horse", 9, "warfare", {"mil": .05})
_t("trebuchets", ['catapults'], 54, "counterweight siege engines", 8, "warfare", {"siege": .12})
_t("magnetic compass", ["navigation", "cartography", 'magnetism'], 52, "the needle points the way", 8, "seafaring", {"sea": .08})
_t("customs houses", ["harbors and docks", "market regulation", 'treaties and envoys'], 52, "ports tax and inspect", 9, "seafaring", {"trade": .06})
_t("bills of exchange", ["banking", "market regulation"], 54, "credit across distance", 9, "trade", {"trade": .08})
_t("trade fairs", ["market regulation", "imperial roads"], 50, "merchants gather at fixed times", 9, "trade", {"trade": .06})
_t("representative assemblies", ['courts', 'bureaucracy'], 56, "estates meet to advise and consent", 8, "governance", {"stab": .05, "research": .02})
_t("common law", ["courts", "civil service"], 54, "precedent builds the law", 9, "governance", {"stab": .05, "trade": .03})
_t("medical schools", ["medicine", "universities"], 58, "physicians trained by text and teacher", 9, "medicine", {"cure": .1, "dth": .96})
_t("pharmacies", ['herbal pharmacology', 'alchemy'], 52, "prepared remedies on every street", 8, "medicine", {"cure": .12})
_t("town water conduits", ["sewers", "concrete"], 54, "clean water piped to the town", 9, "medicine", {"wat": .88})
_t("horse collar", ['heavy plow', 'stirrups'], 48, "horses plow and haul", 8, "agriculture", {"food": 3, "land": .03})
_t("herring fisheries", ["salt curing", "cog ships"], 50, "salted fish feed the interior", 9, "agriculture", {"food": 3, "trade": .03, "spoil": .9})
# ---- Renaissance
_t("textile manufactories", ["spinning wheel", "mechanical clocks"], 68, "workshops under one roof", 10, "industry", {"prod": .06})
_t("precision instruments", ['mechanical clocks', 'lenses'], 70, "fine gears, scales and scopes", 11, "knowledge", {"research": .06, "sea": .04})
_t("telescopes", ["lenses", "astronomy"], 68, "the heavens brought near", 10, "knowledge", {"research": .06})
_t("natural philosophy", ["scholasticism", "printing"], 72, "nature studied by measurement", 11, "knowledge", {"research": .08})
_t("insurance", ['bills of exchange', 'ocean ships'], 74, "shared risk for voyages", 11, "trade", {"trade": .08, "haz": .99})
_t("mercantilism", ["joint-stock companies", "customs houses"], 76, "the state steers trade for profit", 11, "trade", {"trade": .08, "prod": .03})
_t("perspective painting", ['illuminated manuscripts', 'algebra'], 66, "the eye deceived by geometry", 10, "culture", {"cult": .08})
_t("humanism", ["historiography", "printing"], 70, "learning from the ancients and from people", 11, "culture", {"cult": .08, "research": .04})
_t("opera and theaters", ['troubadours', 'printing'], 68, "music and drama in great houses", 11, "culture", {"cult": .07})
_t("domed architecture", ["gothic architecture", "mechanics"], 70, "great domes and wide halls", 10, "construction", {"build": .06, "cult": .04})
_t("civil engineering", ['stone bridges', 'mechanics'], 72, "canals, bridges and harbors by design", 10, "construction", {"build": .06, "prod": .03, "haz": .96})
_t("deep mining", ['blast furnace', 'mine pumps'], 72, "pumps keep deep mines dry", 10, "energy", {"prod": .06})
_t("coke smelting", ['blast furnace'], 74, "coal turned into hotter fuel", 10, "energy", {"prod": .06, "mil": .02})
_t("flintlocks", ["musketry", "precision instruments"], 78, "reliable, quick-firing muskets", 11, "warfare", {"mil": .08})
_t("field artillery", ['trebuchets', 'ballistics'], 72, "light guns on the battlefield", 11, "warfare", {"siege": .15, "mil": .05})
_t("standing armies", ['pike formations', 'bureaucracy'], 74, "professional soldiers paid all year", 11, "warfare", {"log": .1, "mil": .06})
_t("galleons", ["ocean ships", "gunpowder"], 76, "armed ships that cross oceans", 11, "seafaring", {"sea": .06, "mil": .02})
_t("chronometers", ["magnetic compass", "precision instruments"], 74, "longitude found at sea", 11, "seafaring", {"sea": .1})
_t("overseas trade posts", ['mercantilism'], 76, "fortified stations on distant coasts", 11, "seafaring", {"trade": .08})
_t("national treasuries", ["bills of exchange", "common law"], 70, "the state keeps ledgers and credit", 10, "governance", {"trade": .04, "stab": .03})
_t("rights and liberties", ["common law", "humanism"], 76, "limits on rulers written down", 11, "governance", {"stab": .04, "research": .03})
_t("inoculation", ["pharmacies", "microscopy"], 78, "a mild dose against the great disease", 11, "medicine", {"inf": .95, "dth": .94, "cure": .1})
_t("clinical medicine", ["anatomy", "medical schools"], 76, "teaching hospitals and case records", 11, "medicine", {"dth": .94, "care": .02})
_t("lazarettos", ["quarantine", "customs houses"], 70, "ports hold ships until they are safe", 10, "medicine", {"air": .9, "inf": .95})
_t("scientific agronomy", ["crop exchange", "natural philosophy", 'seed drill'], 76, "farming by experiment", 11, "agriculture", {"food": 4, "prod": .04})
# ---- Industrial Age
_t("mass steel", ["steam power", "coke smelting", 'chemistry'], 96, "cheap steel by the ton", 12, "industry", {"prod": .08, "mil": .04})
_t("machine tools", ['steam power', 'precision instruments'], 96, "machines that make machines", 12, "industry", {"prod": .08})
_t("interchangeable parts", ["machine tools"], 100, "standard pieces, fast repair", 13, "industry", {"prod": .06})
_t("petroleum", ["coke smelting", "chemistry", 'thermodynamics'], 100, "oil for lamps and engines", 13, "energy", {"prod": .08})
_t("power grids", ["electricity", "machine tools"], 110, "electric power in every town", 13, "energy", {"prod": .1, "research": .05})
_t("telegraph networks", ['electricity', 'precision instruments'], 104, "news in minutes", 13, "trade", {"trade": .1, "log": .1})
_t("steel-frame buildings", ["mass steel", "civil engineering", 'scaffolding and cranes'], 104, "towers that scrape the sky", 13, "construction", {"build": .08, "haz": .95})
_t("reinforced concrete", ["concrete", "mass steel"], 104, "steel inside stone", 13, "construction", {"build": .08, "haz": .93})
_t("modern sewers", ["public health", "civil engineering"], 100, "clean water in, waste out, for the whole city", 14, "medicine", {"wat": .8, "inf": .93})
_t("refrigeration", ['electricity', 'thermodynamics'], 108, "food kept cold for weeks", 14, "agriculture", {"spoil": .6, "food": 3})
_t("canning", ['mass steel'], 98, "food sealed for years", 14, "agriculture", {"spoil": .7, "food": 2, "log": .05})
_t("steam reapers", ['scientific agronomy', 'machine tools'], 100, "machines harvest the plains", 14, "agriculture", {"food": 4, "prod": .04})
_t("mass literacy", ["printing", "factory system"], 98, "cheap newspapers and schooling", 14, "culture", {"cult": .08, "research": .05, "stab": .02})
_t("photography", ["chemistry", "precision instruments"], 100, "light fixed on glass and paper", 12, "culture", {"cult": .08})
_t("museums and symphonies", ["opera and theaters", "mass literacy"], 100, "art for the public", 14, "culture", {"cult": .08})
_t("public education", ["mass literacy", "national treasuries"], 104, "schools for every child", 14, "governance", {"research": .08, "stab": .03})
_t("constitutional government", ["rights and liberties", "mass literacy"], 108, "written constitutions and elections", 14, "governance", {"stab": .05, "research": .03})
_t("labor laws", ['constitutional government'], 108, "limits on hours and danger", 14, "governance", {"stab": .04, "prod": .03})
_t("machine guns", ['rifled firearms', 'interchangeable parts'], 110, "sustained fire from one crew", 14, "warfare", {"mil": .12, "weapon": 7})
_t("ironclads", ['steamships', 'mass steel', 'artillery'], 110, "armored steam warships", 14, "seafaring", {"sea": .1, "mil": .03, "ship": 6})
_t("antisepsis", ['germ theory', 'surgery'], 100, "clean hands and clean wounds", 13, "medicine", {"wnd": .7, "dth": .93})
_t("anesthesia", ["surgery", "chemistry"], 96, "surgery without agony", 12, "medicine", {"wnd": .85, "dth": .95})
_t("medical imaging", ["electricity", "anatomy", 'photography'], 108, "the body seen from outside", 14, "medicine", {"dth": .94, "cure": .1})
_t("bacteriology labs", ['germ theory'], 100, "disease traced to its source", 13, "medicine", {"cure": .2})

_t("bellows", ['smelting'], 14, "forced air makes fires hotter", 3, "energy", {"prod": .02})
_t("stone quarrying", ["masonry", "bronze tools"], 16, "blocks cut and hauled", 3, "construction", {"build": .03})
_t("oil lamps", ['olive and wine'], 24, "light after dark", 4, "energy", {"prod": .02, "research": .01})
_t("timber framing", ["thatched huts", "ironworking"], 26, "strong wooden skeletons for houses and halls", 5, "construction", {"build": .03})
_t("scaffolding and cranes", ["wheelwrights", "arches and vaults"], 30, "tall walls raised safely", 5, "construction", {"build": .04})
_t("housing blocks", ['concrete', 'building codes'], 40, "many families under one roof", 7, "construction", {"build": .03, "stab": .01})
_t("tide mills", ['watermills', 'harbors and docks'], 44, "the sea turns the wheel", 8, "energy", {"prod": .04})
_t("gas lighting", ['coke smelting', 'chemistry'], 92, "lit streets and long evenings", 12, "energy", {"prod": .04, "stab": .02})
_t("steam turbines", ['power grids', 'thermodynamics'], 118, "spinning steam drives generators", 14, "energy", {"prod": .1})

# ---- Supporting systems: bases that other chains build on
_t('horse domestication', ['animal husbandry'], 16, 'horses to ride and to pull', 2, 'agriculture', {'food': 1, 'land': 0.05})
_t("potter's wheel", ['pottery'], 16, 'a spinning table that shapes even vessels', 2, 'industry', {'prod': 0.03})
_t('wheel', ["potter's wheel"], 16, 'turning discs become carts and wheelbarrows', 3, 'trade', {'land': 0.08})
_t('star lore', ['counting'], 16, 'the sky as clock and compass', 2, 'knowledge', {'research': 0.01, 'sea': 0.03})
_t('alloying', ['smelting'], 16, 'mixing metals for hardness', 3, 'industry', {'prod': 0.03, 'mil': 0.02})
_t('composting', ['animal husbandry', 'seed gathering'], 28, 'rotting waste feeds the soil', 4, 'agriculture', {'food': 2})
_t('lime mortar', ['kiln firing', 'masonry'], 28, 'burnt lime binds stone', 4, 'construction', {'build': 0.04})
_t('surveying', ['mathematics', 'weights and measures'], 28, 'measuring land, slopes and distances', 4, 'knowledge', {'research': 0.01, 'build': 0.03})
_t('music and dance', ['oral tradition', 'bone tools'], 16, 'rhythm, pipes and drums', 3, 'culture', {'cult': 0.04})
_t('crucible furnaces', ['forging'], 40, 'closed pots that melt metal evenly', 7, 'industry', {'prod': 0.04})
_t('lateen sails', ['shipbuilding'], 40, 'triangular sails that sail against the wind', 7, 'seafaring', {'sea': 0.06})
_t('alchemy', ['glassmaking', 'philosophy'], 40, 'patient experiments with substances', 7, 'knowledge', {'research': 0.02})
_t('magnetism', ['ironworking', 'mathematics'], 40, 'lodestones and the pull of iron', 6, 'knowledge', {'research': 0.015})
_t('treaties and envoys', ['courts'], 52, 'diplomacy backed by written terms', 8, 'governance', {'stab': 0.02, 'trade': 0.03})
_t('double-entry bookkeeping', ['currency', 'mathematics'], 52, 'ledgers that always balance', 8, 'trade', {'trade': 0.05})
_t('sternpost rudder', ['shipbuilding'], 52, 'steering from the back of the ship', 8, 'seafaring', {'sea': 0.05})
_t('screw and lathe', ['steelmaking', 'wheelwrights'], 52, 'turned and threaded parts', 9, 'industry', {'prod': 0.04})
_t('seed drill', ['mechanics', 'three-field system'], 72, 'seeds placed in even rows', 10, 'agriculture', {'food': 3})
_t('mine pumps', ['coal mining', 'mechanics'], 72, 'engines that drain deep mines', 10, 'energy', {'prod': 0.03})
_t('ballistics', ['gunpowder'], 72, 'calculating where a shot will land', 11, 'warfare', {'mil': 0.04, 'siege': 0.05})
_t('iron hulls', ['shipbuilding', 'steelmaking'], 100, 'ships built of metal plates', 12, 'seafaring', {'sea': 0.05, 'mil': 0.02})
_t('thermodynamics', ['scientific method', 'steam power'], 100, 'the science of heat and work', 13, 'knowledge', {'research': 0.04})

# Alternatives: each group needs at least ONE of its members (used sparingly).
ANY = {
    "temple building": [["mud brick", "masonry"]],
    "castles": [["stone quarrying", "concrete"]],
    "universities": [["monasteries", "philosophy"]],
    "hospitals": [["monasteries", "medical schools"]],
    "ocean ships": [["magnetic compass", "cartography"]],
    "steam power": [["deep mining", "coke smelting"]],
    "rifled firearms": [["machine tools", "screw and lathe"]],
}

TECH = T
DEFAULT = {"prod": 0.0, "research": 0.0, "trade": 0.0, "food": 0.0, "mil": 0.0, "siege": 0.0, "log": 0.0, "dfn": 1.0, "wnd": 1.0,
           "inf": 1.0, "wat": 1.0, "air": 1.0, "con": 1.0, "dth": 1.0, "care": 0.0, "cure": 0.0, "land": 0.0, "sea": 0.0,
           "cult": 0.0, "stab": 0.0, "build": 0.0, "haz": 1.0, "spoil": 1.0}
ADDED = ["prod", "research", "trade", "food", "mil", "siege", "log", "care", "cure", "land", "sea", "cult", "stab", "build"]
MULTIPLIED = ["dfn", "wnd", "inf", "wat", "air", "con", "dth", "haz", "spoil"]
# Many small discoveries add up, so each total bends toward a ceiling (and each reduction toward a floor)
# instead of growing without limit.
CEILING = {"prod": 2.2, "research": 2.4, "trade": 2.0, "food": 45.0, "mil": 3.5, "siege": 2.0, "log": .9, "care": .35, "cure": 1.6,
           "land": 1.5, "sea": 1.5, "cult": 1.6, "stab": .35, "build": 1.2}
FLOOR = {"dfn": .35, "wnd": .3, "inf": .3, "wat": .25, "air": .3, "con": .3, "dth": .25, "haz": .4, "spoil": .35}
TIERS = ["weapon", "ship", "cart"]

UNIT_NAMES = {
    "weapon": ["hunters with spears", "bronze spearmen", "iron swordsmen", "legionaries", "armored knights", "musketeers", "riflemen", "machine-gun crews"],
    "ship": ["rafts", "sailing boats", "galleys", "cogs", "caravels", "steamships", "ironclads"],
    "cart": ["pack animals", "ox carts", "freight trains"],
}
LETHALITY = [1.0, 1.04, 1.1, 1.16, 1.24, 1.5, 1.9, 2.3]


def tech_names():
    return list(T)


def era_of_tech(name):
    return T[name][3]


def branch_of(name):
    return T[name][4]


INDEX = {name: i + 1 for i, name in enumerate(T)}
_CACHE = {}


def effects(owned):
    """Combined effects of a set of technologies (remembered, since war, disease and trade ask all the time)."""
    count = 0
    total = 0
    squares = 0
    for name in owned:
        i = INDEX.get(name)
        if i is not None:
            count += 1
            total += i
            squares += i * i
    key = (count, total, squares)
    cached = _CACHE.get(key)
    if cached is not None:
        return cached
    out = dict(DEFAULT)
    tiers = {"weapon": 0, "ship": 0, "cart": 0}
    for name in sorted(owned):
        entry = T.get(name)
        if entry is None:
            continue
        for k, value in entry[5].items():
            if k in tiers:
                tiers[k] = max(tiers[k], value)
            elif k in MULTIPLIED:
                out[k] = out[k] * value
            else:
                out[k] = out[k] + value
    for k in ADDED:
        out[k] = out[k] / (1 + out[k] / CEILING[k])
    for k in MULTIPLIED:
        out[k] = max(FLOOR[k], out[k])
    out.update(tiers)
    _CACHE[key] = out
    return out


ERA_TOTAL = [0 for _ in ERAS]
for _name in T:
    ERA_TOTAL[T[_name][3]] += 1
# an age arrives once a society holds about a third of that age's discoveries
ERA_NEED = [max(3, int(.34 * n + .999)) for n in ERA_TOTAL]


def era_index(owned):
    """The age a society has reached: the highest era in which it holds about a third of the discoveries."""
    counts = [0 for _ in ERAS]
    for name in owned:
        entry = T.get(name)
        if entry is not None:
            counts[entry[3]] += 1
    era = 0
    for e in range(len(ERAS)):
        if counts[e] >= ERA_NEED[e]:
            era = e
    return era


def era_name(owned):
    return ERAS[era_index(owned)]


def units(owned):
    fx = effects(owned)
    return {"weapon": fx["weapon"], "ship": fx["ship"], "cart": fx["cart"], "era": era_index(owned), "age": ERA_GROUP[era_index(owned)],
            "army": UNIT_NAMES["weapon"][fx["weapon"]], "fleet": UNIT_NAMES["ship"][fx["ship"]], "wagons": UNIT_NAMES["cart"][fx["cart"]]}


def _leads_to(name, other):
    if name in T[other][0]:
        return True
    for group in ANY.get(other, []):
        if name in group:
            return True
    return False


DEPENDENTS = {name: [other for other in T if _leads_to(name, other)] for name in T}

# A society may only research discoveries up to this many ages beyond the age it has reached, so one
# deep path cannot leap ahead of the rest of the tree.
MAX_LEAD = 3


def dependents(name):
    return DEPENDENTS[name]


def met(name, owned):
    """True when every prerequisite is known and each "needs one of" group has a known member."""
    if not T[name][0] <= owned:
        return False
    for group in ANY.get(name, []):
        found = False
        for other in group:
            if other in owned:
                found = True
        if not found:
            return False
    return True


def researchable(owned):
    """Discoveries a society can start now: prerequisites met and no more than MAX_LEAD ages ahead."""
    top = era_index(owned) + MAX_LEAD
    out = []
    for name in T:
        if name not in owned and T[name][3] <= top and met(name, owned):
            out.append(name)
    return out


def learnable(owned, other):
    """What a society could pick up from another: held there, missing here, prerequisites in hand and not too far ahead."""
    top = era_index(owned) + MAX_LEAD
    out = []
    for name in sorted(other):
        if name not in owned and name in T and T[name][3] <= top and met(name, owned):
            out.append(name)
    return out


def choose(rng, available, owned, need, era):
    """Pick the next research project: needs, geography and the shape of the tree decide, with some chance."""
    weights = []
    for name in available:
        _, cost, _, tech_era, branch, _ = T[name]
        w = 1.0 + need.get(branch, 0.0)
        w += .3 * len(dependents(name))
        if tech_era > era + 1:
            w *= .3
        elif tech_era < era:
            w *= 1.3
        w /= (cost / 40.0) ** .5
        weights.append(max(.05, w))
    return rng.choices(available, weights)[0]


def reason(branch):
    return {"agriculture": "to feed its people", "industry": "to improve its workshops", "warfare": "to strengthen its army",
            "seafaring": "to master the sea", "trade": "to grow its commerce", "knowledge": "to advance learning",
            "medicine": "to protect its people's health", "governance": "to govern better", "energy": "to power its workshops",
            "construction": "to build bigger and safer", "culture": "to enrich its culture"}[branch]


def validate():
    """Every prerequisite must exist and no tech may need a later era's discovery."""
    problems = []
    for name, (needs, cost, blurb, era, branch, fx) in T.items():
        every = list(needs)
        for group in ANY.get(name, []):
            every.extend(group)
        for n in every:
            if n not in T:
                problems.append(f"{name} needs unknown {n}")
            elif T[n][3] > era:
                problems.append(f"{name} (era {era}) needs {n} from era {T[n][3]}")
        if branch not in BRANCHES:
            problems.append(f"{name} has unknown branch {branch}")
    return problems
