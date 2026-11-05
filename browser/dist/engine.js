// Generated from the original simulator. Rebuild with tools/compile_engine.py.
import {Env,PD,PS,$tuple,$dict,$slice,$iter,$entries,$get,$set,$item,$setitem,$del,$truth,$bin,$aug,$un,$boolop,$compare,$call,$fn,$class,$fmt,$isinstance,$register,$import} from "./python-runtime.js";
$register("civsim",e=>{e.set("random",$import("random"));e.set("re",$import("re"));e.set("Counter",$get($import("collections"),"Counter"));e.set("dataclass",$get($import("dataclasses"),"dataclass"));e.set("field",$get($import("dataclasses"),"field"));e.set("develop_societies",$get($import("society"),"develop_societies"));e.set("maintain_rulers",$get($import("society"),"maintain_rulers"));e.set("social_rates",$get($import("society"),"social_rates"));e.set("ensure_year_events",$get($import("society"),"ensure_year_events"));e.set("import_infections",$get($import("epidemiology"),"import_infections"));e.set("resolve_disease",$get($import("epidemiology"),"resolve_disease"));e.set("resolve_campaigns",$get($import("warfare"),"resolve_wars"));e.set("initialize_civic",$get($import("civic"),"initialize_civic"));e.set("annual_civic",$get($import("civic"),"annual_civic"));e.set("refresh_public_roles",$get($import("civic"),"refresh_public_roles"));e.set("command",$get($import("civic"),"command"));{const $t1=$dict([]);e.set("_WEIGHTED",$t1);}
e.set("weighted",$fn("weighted",e,[],[],null,"weights",[],[],e=>{{const $t2=$call(e.get("tuple"),[$call($get(e.get("weights"),"items"),[],$dict([]))],$dict([]));e.set("key",$t2);}
if($truth($compare([()=>e.get("key"),()=>e.get("_WEIGHTED")], ["NotIn"]))){{const $t3=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t5 of $iter($call($get(e.get("weights"),"items"),[],$dict([])))){{const $t6=Array.from($iter($t5));e.set("value",$t6[0]);e.set("weight",$t6[1]);}for(const $t4 of $iter($call(e.get("range"),[e.get("weight")],$dict([])))){e.set("_",$t4);yield e.get("value");}}})();})(e));$setitem(e.get("_WEIGHTED"),e.get("key"),$t3);}
}else{}
return $item(e.get("_WEIGHTED"),e.get("key"));return null;}));
e.set("roman",$fn("roman",e,["number"],[undefined],null,null,[],[],e=>{{const $t7="";e.set("result",$t7);}
for(const $t8 of $iter([$tuple([1000,"M"]),$tuple([900,"CM"]),$tuple([500,"D"]),$tuple([400,"CD"]),$tuple([100,"C"]),$tuple([90,"XC"]),$tuple([50,"L"]),$tuple([40,"XL"]),$tuple([10,"X"]),$tuple([9,"IX"]),$tuple([5,"V"]),$tuple([4,"IV"]),$tuple([1,"I"])])){{const $t9=Array.from($iter($t8));e.set("value",$t9[0]);e.set("symbol",$t9[1]);}{const $t10=$call(e.get("divmod"),[e.get("number"),e.get("value")],$dict([]));{const $t11=Array.from($iter($t10));e.set("count",$t11[0]);e.set("number",$t11[1]);}}
e.set("result",$aug("Add",e.get("result"),$bin("Mult",e.get("symbol"),e.get("count"))));}
return e.get("result");return null;}));
e.set("NameGenerator",$class("NameGenerator",e,[],false,e=>{e.set("__init__",$fn("__init__",e,["self", "rng"],[undefined,undefined],null,null,[],[],e=>{{const $t12=e.get("rng");$set(e.get("self"),"rng",$t12);}
{const $t13=$call(e.get("set"),[],$dict([]));$set(e.get("self"),"used_countries",$t13);}
return null;}));
e.set("make",$fn("make",e,["self", "kind"],[undefined,undefined],null,null,[],[],e=>{if($truth($compare([()=>e.get("kind"),()=>"country"], ["Eq"]))){{const $t14=$call(e.get("weighted"),[],$dict([["V",1],["CV",5],["CVC",2],["VC",1]]));e.set("formats",$t14);}
{const $t15=$call(e.get("weighted"),[],$dict([["b",1],["d",2],["g",1],["h",1],["k",1],["l",3],["m",2],["n",3],["r",3],["s",2],["t",2],["v",2],["z",1],["th",2],["kh",1],["sh",1],["ph",1],["br",1],["dr",1],["tr",1]]));e.set("starters",$t15);}
{const $t16=$call(e.get("weighted"),[],$dict([["n",4],["r",3],["s",2],["l",2],["m",2],["t",1],["k",1],["d",1],["nd",1]]));e.set("enders",$t16);}
{const $t17=$call(e.get("weighted"),[],$dict([["a",5],["e",3],["i",2],["o",3],["u",2],["ae",2],["ai",1],["au",1]]));e.set("vowels",$t17);}
{const $t18=[1,2,2,2,2,2,3,3];e.set("counts",$t18);}
{const $t19=["","","","ia","ia","ia","a","a","ion","ar","ar","um","os","is","on","ea","eth"];e.set("endings",$t19);}
}else{{const $t20=$call(e.get("weighted"),[],$dict([["V",1],["CV",4],["CVC",3],["VC",2]]));e.set("formats",$t20);}
{const $t21=$call(e.get("weighted"),[],$dict([["b",2],["c",1],["d",2],["f",2],["g",2],["h",2],["j",1],["k",2],["l",3],["m",3],["n",3],["p",2],["r",3],["s",3],["t",3],["v",2],["w",1],["y",1],["z",1],["bl",1],["br",1],["cl",1],["cr",1],["dr",1],["fl",1],["fr",1],["gl",1],["gr",1],["pl",1],["pr",1],["sl",1],["st",1],["tr",1],["ch",1],["sh",1],["th",1]]));e.set("starters",$t21);}
{const $t22=$call(e.get("weighted"),[],$dict([["b",1],["d",2],["f",1],["g",1],["k",2],["l",3],["m",2],["n",4],["p",1],["r",3],["s",3],["t",3],["v",1],["z",1],["ch",1],["sh",1],["th",1],["nd",1],["nt",1],["ng",1],["rd",1],["rn",1]]));e.set("enders",$t22);}
{const $t23=$call(e.get("weighted"),[],$dict([["a",5],["e",5],["i",4],["o",4],["u",2],["ai",1],["ay",1],["ea",1],["ee",1],["ei",1],["ie",1],["oa",1],["oo",1],["ou",1],["au",1]]));e.set("vowels",$t23);}
{const $t24=($truth($compare([()=>e.get("kind"),()=>"first"], ["Eq"]))?[1,1,2,2,2,2,2,3]:[1,1,1,2,2,2,2,3,3]);e.set("counts",$t24);}
{const $t25=$bin("Add",$bin("Mult",[""],10),($truth($compare([()=>e.get("kind"),()=>"first"], ["Eq"]))?["a","a","e","o","y","an","en","in","on","el","ie","ey","er","ina"]:["s","s","er","er","son","ton","ley","en","on","in","ar","o","es","al","ez","ov","ic","i","ell"]));e.set("endings",$t25);}
}
e.set("smooth",$fn("smooth",e,["text"],[undefined],null,null,[],[],e=>{{const $t26=0;e.set("vowel_run",$t26);e.set("consonant_run",$t26);}
for(const $t27 of $iter(e.get("text"))){e.set("char",$t27);if($truth($compare([()=>e.get("char"),()=>"aeiouy"], ["In"]))){e.set("vowel_run",$aug("Add",e.get("vowel_run"),1));{const $t28=0;e.set("consonant_run",$t28);}
}else{e.set("consonant_run",$aug("Add",e.get("consonant_run"),1));{const $t29=0;e.set("vowel_run",$t29);}
}
if($truth($boolop("Or",[()=>$compare([()=>e.get("vowel_run"),()=>2], ["Gt"]),()=>$compare([()=>e.get("consonant_run"),()=>3], ["Gt"])]))){return false;}else{}
}
return true;return null;}));
for(const $t30 of $iter($call(e.get("range"),[100],$dict([])))){e.set("_",$t30);{const $t31=[];e.set("parts",$t31);}
for(const $t32 of $iter($call(e.get("range"),[$call($get($get(e.get("self"),"rng"),"choice"),[e.get("counts")],$dict([]))],$dict([])))){e.set("_",$t32);{const $t33=$call($get($get(e.get("self"),"rng"),"choice"),[e.get("formats")],$dict([]));e.set("pattern",$t33);}
$call($get(e.get("parts"),"append"),[$call($get("","join"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t34 of $iter($call(e.get("enumerate"),[e.get("pattern")],$dict([])))){{const $t35=Array.from($iter($t34));e.set("i",$t35[0]);e.set("char",$t35[1]);}yield $call($get($get(e.get("self"),"rng"),"choice"),[($truth($compare([()=>e.get("char"),()=>"V"], ["Eq"]))?e.get("vowels"):($truth($compare([()=>e.get("i"),()=>0], ["Eq"]))?e.get("starters"):e.get("enders")))],$dict([]));}})();})(e)],$dict([]))],$dict([]));
}
{const $t36=$call($get("","join"),[e.get("parts")],$dict([]));e.set("name",$t36);}
{const $t37=$call($get($get(e.get("self"),"rng"),"choice"),[e.get("endings")],$dict([]));e.set("ending",$t37);}
if($truth(e.get("ending"))){if($truth($compare([()=>$item(e.get("ending"),0),()=>"aeiou"], ["In"]))){{const $t38=$boolop("Or",[()=>$call($get(e.get("name"),"rstrip"),["aeiou"],$dict([])),()=>e.get("name")]);e.set("name",$t38);}
}else{}
if($truth($compare([()=>$item(e.get("name"),$un("USub",1)),()=>$item(e.get("ending"),0)], ["Eq"]))){{const $t39=$item(e.get("ending"),$slice(1,null,null));e.set("ending",$t39);}
}else{}
e.set("name",$aug("Add",e.get("name"),e.get("ending")));}else{}
if($truth($boolop("And",[()=>$compare([()=>$call(e.get("len"),[e.get("name")],$dict([])),()=>2], ["GtE"]),()=>$call(e.get("smooth"),[e.get("name")],$dict([]))]))){return $call($get(e.get("name"),"capitalize"),[],$dict([]));}else{}
}
return $call($get($get(e.get("self"),"rng"),"choice"),[["Mara","Dalen","Sora","Bren"]],$dict([]));return null;}));
e.set("country",$fn("country",e,["self", "founder_name"],[undefined,null],null,null,[],[],e=>{if($truth(e.get("founder_name"))){{const $t40=$boolop("Or",[()=>$call($get($call($get(e.get("founder_name"),"lower"),[],$dict([])),"rstrip"),["aeiouy"],$dict([])),()=>$call($get(e.get("founder_name"),"lower"),[],$dict([]))]);e.set("stem",$t40);}
{const $t41=$call($get($get(e.get("self"),"rng"),"choice"),[["ia","ia","ia","ia","a","ar","on","os","um"]],$dict([]));e.set("ending",$t41);}
{const $t42=$call($get($bin("Add",e.get("stem"),e.get("ending")),"capitalize"),[],$dict([]));e.set("base",$t42);}
}else{{const $t43=$call($get(e.get("self"),"make"),["country"],$dict([]));e.set("base",$t43);}
}
{const $t44=e.get("base");e.set("name",$t44);}
{const $t45=2;e.set("number",$t45);}
while($truth($compare([()=>e.get("name"),()=>$get(e.get("self"),"used_countries")], ["In"]))){{const $t46=($fmt(e.get("base"),-1,null)+" "+$fmt($call(e.get("roman"),[e.get("number")],$dict([])),-1,null));e.set("name",$t46);}
e.set("number",$aug("Add",e.get("number"),1));}
$call($get($get(e.get("self"),"used_countries"),"add"),[e.get("name")],$dict([]));
return e.get("name");return null;}));
e.set("sickness",$fn("sickness",e,["self"],[undefined],null,null,[],[],e=>{{const $t47=$call($get($get(e.get("self"),"rng"),"choice"),[["pox","pox","cough","cough","fever","fever","chill","rot","blight","shivers"]],$dict([]));e.set("suffix",$t47);}
if($truth($compare([()=>$call($get($get(e.get("self"),"rng"),"random"),[],$dict([])),()=>0.5], ["Lt"]))){{const $t48=$call($get($get(e.get("self"),"rng"),"choice"),[["gray","red","black","white","ashen","marsh","river","winter","dust","thorn","swamp","silver","night","bitter","bongo"]],$dict([]));e.set("root",$t48);}
}else{{const $t49=$call($get("","join"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t50 of $iter($call(e.get("range"),[$call($get($get(e.get("self"),"rng"),"choice"),[[1,2,2,2,3]],$dict([]))],$dict([])))){e.set("_",$t50);yield $bin("Add",$call($get($get(e.get("self"),"rng"),"choice"),[["b","d","g","k","l","m","n","r","s","t","v"]],$dict([])),$call($get($get(e.get("self"),"rng"),"choice"),[["a","e","i","o","u"]],$dict([])));}})();})(e)],$dict([]));e.set("root",$t49);}
}
return $call($get($bin("Add",e.get("root"),e.get("suffix")),"capitalize"),[],$dict([]));return null;}));
}));
e.set("Person",$class("Person",e,[["id",undefined],["first",undefined],["age",undefined],["lineage",undefined],["country",undefined],["born",undefined],["parents",$tuple([])],["died",null],["infection",null],["immunity",$call(e.get("field"),[],$dict([["default_factory",e.get("set")]]))],["settlement",null],["infection_steps",0],["immunity_until",$call(e.get("field"),[],$dict([["default_factory",e.get("dict")]]))],["cause_of_death",null]],true,e=>{}));
e.set("Settlement",$class("Settlement",e,[["id",undefined],["name",undefined],["country",undefined],["founder",undefined],["founded",undefined],["kind","village"],["abandoned",null]],true,e=>{}));
e.set("Sickness",$class("Sickness",e,[["name",undefined],["infection_chance",undefined],["death_chance",undefined],["recovery_chance",undefined],["transmission","contact"],["incubation_steps",0],["immunity_years",8],["mutation_chance",0.02],["course","acute"],["recurring",false]],true,e=>{}));
e.set("Lineage",$class("Lineage",e,[["id",undefined],["surname",undefined],["founder",undefined],["founded",undefined],["parent_lineage",null],["births",0],["deaths",0],["founder_country",1]],true,e=>{}));
e.set("Country",$class("Country",e,[["id",undefined],["name",undefined],["founder",undefined],["founded",undefined],["parent_country",null],["conditions",$call(e.get("field"),[],$dict([["default_factory",e.get("set")]]))],["capacity",1000000],["ended",null],["sickness",null],["ruler",null],["government","monarchy"],["last_election",0],["food",60],["prosperity",50],["stability",60],["research",0],["technologies",$call(e.get("field"),[],$dict([["default_factory",e.get("set")]]))],["insight",$call(e.get("field"),[],$dict([["default_factory",e.get("dict")]]))],["pacts",$call(e.get("field"),[],$dict([["default_factory",e.get("set")]]))],["boosted",$call(e.get("field"),[],$dict([["default_factory",e.get("set")]]))],["last_catalog_events",$call(e.get("field"),[],$dict([["default_factory",e.get("dict")]]))],["last_disaster_year",null],["capital",null],["quarantine",false],["crisis_until",$call(e.get("field"),[],$dict([["default_factory",e.get("dict")]]))],["crisis_cooldown",$call(e.get("field"),[],$dict([["default_factory",e.get("dict")]]))]],true,e=>{}));
e.set("Simulation",$class("Simulation",e,[],false,e=>{{const $t51=["Famine","Drought","Disease","Panic","Growth","Abundance","Health","Calm","Safety","Nothing"];e.set("events",$t51);}
e.set("__init__",$fn("__init__",e,["self", "population", "seed", "capacity", "lineage_chance", "country_chance", "war_chance", "disaster_chance"],[undefined,2000,null,1000000,0.002,0.04,0.1,0.02],null,null,[],[],e=>{if($truth($boolop("Or",[()=>$compare([()=>e.get("population"),()=>1], ["Lt"]),()=>$compare([()=>e.get("capacity"),()=>1], ["Lt"])]))){throw $call(e.get("ValueError"),["Population and capacity must be positive"],$dict([]));}else{}
if($truth($boolop("Or",[()=>$un("Not",$compare([()=>0,()=>e.get("lineage_chance"),()=>1], ["LtE", "LtE"])),()=>$un("Not",$compare([()=>0,()=>e.get("country_chance"),()=>1], ["LtE", "LtE"]))]))){throw $call(e.get("ValueError"),["Lineage and country chances must be between 0 and 1"],$dict([]));}else{}
if($truth($un("Not",$compare([()=>0,()=>e.get("war_chance"),()=>1], ["LtE", "LtE"])))){throw $call(e.get("ValueError"),["War chance must be between 0 and 1"],$dict([]));}else{}
if($truth($un("Not",$compare([()=>0,()=>e.get("disaster_chance"),()=>1], ["LtE", "LtE"])))){throw $call(e.get("ValueError"),["Disaster chance must be between 0 and 1"],$dict([]));}else{}
{const $t52=$call($get(e.get("random"),"Random"),[e.get("seed")],$dict([]));$set(e.get("self"),"rng",$t52);}
{const $t53=$boolop("Or",[()=>e.get("seed"),()=>0]);$set(e.get("self"),"geo_seed",$t53);}
{const $t54=$call(e.get("NameGenerator"),[$get(e.get("self"),"rng")],$dict([]));$set(e.get("self"),"names",$t54);}
{const $t55=$dict([]);$set(e.get("self"),"people",$t55);}
{const $t56=$dict([]);$set(e.get("self"),"archive",$t56);}
{const $t57=$dict([]);$set(e.get("self"),"name_holders",$t57);}
{const $t58=$dict([]);$set(e.get("self"),"lineages",$t58);}
{const $t59=$dict([]);$set(e.get("self"),"countries",$t59);}
{const $t60=$dict([]);$set(e.get("self"),"settlements",$t60);}
{const $t61=[];$set(e.get("self"),"history",$t61);}
{const $t62=[];$set(e.get("self"),"history_categories",$t62);}
{const $t63=[];$set(e.get("self"),"yearly_reports",$t63);}
{const $t64=$dict([]);$set(e.get("self"),"sicknesses",$t64);}
{const $t65=0;$set(e.get("self"),"year",$t65);}
{const $t66=1;$set(e.get("self"),"next_person",$t66);}
{const $t67=e.get("lineage_chance");$set(e.get("self"),"lineage_chance",$t67);}
{const $t68=e.get("country_chance");$set(e.get("self"),"country_chance",$t68);}
{const $t69=e.get("war_chance");$set(e.get("self"),"war_chance",$t69);}
{const $t70=e.get("disaster_chance");$set(e.get("self"),"disaster_chance",$t70);}
{const $t71=$dict([]);$set(e.get("self"),"wars",$t71);}
{const $t72=$bin("Mult",[0.0],200);$set(e.get("self"),"bp",$t72);}
{const $t73=$bin("Mult",[0.0],200);$set(e.get("self"),"dp",$t73);}
for(const $t74 of $iter([$tuple([18,30,0.08]),$tuple([31,45,0.1]),$tuple([46,55,0.025]),$tuple([56,60,0.005])])){{const $t75=Array.from($iter($t74));e.set("low",$t75[0]);e.set("high",$t75[1]);e.set("probability",$t75[2]);}{const $t76=$bin("Mult",[e.get("probability")],$bin("Add",$bin("Sub",e.get("high"),e.get("low")),1));$setitem($get(e.get("self"),"bp"),$slice(e.get("low"),$bin("Add",e.get("high"),1),null),$t76);}
}
for(const $t77 of $iter([$tuple([0,0,0.015]),$tuple([1,10,0.003]),$tuple([11,45,0.002]),$tuple([46,60,0.009]),$tuple([61,75,0.035]),$tuple([76,90,0.08]),$tuple([91,150,0.18]),$tuple([151,199,1])])){{const $t78=Array.from($iter($t77));e.set("low",$t78[0]);e.set("high",$t78[1]);e.set("probability",$t78[2]);}{const $t79=$bin("Mult",[e.get("probability")],$bin("Add",$bin("Sub",e.get("high"),e.get("low")),1));$setitem($get(e.get("self"),"dp"),$slice(e.get("low"),$bin("Add",e.get("high"),1),null),$t79);}
}
for(const $t80 of $iter($call(e.get("range"),[e.get("population")],$dict([])))){e.set("i",$t80);if($truth($compare([()=>$bin("Mod",e.get("i"),4),()=>0], ["Eq"]))){{const $t81=$call($get(e.get("self"),"new_lineage"),[$get(e.get("self"),"next_person")],$dict([]));e.set("lid",$t81);}
}else{}
{const $t82=$item($call($get($get(e.get("self"),"rng"),"choices"),[[$tuple([0,17]),$tuple([18,45]),$tuple([46,65]),$tuple([66,85])],[20,60,15,5]],$dict([])),0);e.set("age_range",$t82);}
{const $t83=($truth($compare([()=>e.get("population"),()=>1], ["Eq"]))?0:$call($get($get(e.get("self"),"rng"),"randint"),[...$iter(e.get("age_range"))],$dict([])));e.set("age",$t83);}
if($truth($boolop("And",[()=>$compare([()=>e.get("population"),()=>1], ["Gt"]),()=>$compare([()=>$bin("Mod",e.get("i"),4),()=>0], ["Eq"])]))){{const $t84=$call($get($get(e.get("self"),"rng"),"randint"),[18,45],$dict([]));e.set("age",$t84);}
}else{}
$call($get(e.get("self"),"add_person"),[e.get("age"),e.get("lid"),1],$dict([]));
}
{const $t85=$call(e.get("min"),[4,$call(e.get("max"),[1,$bin("FloorDiv",e.get("population"),500)],$dict([]))],$dict([]));e.set("initial_countries",$t85);}
{const $t86=$call(e.get("list"),[$call($get($get(e.get("self"),"people"),"values"),[],$dict([]))],$dict([]));e.set("everyone",$t86);}
for(const $t87 of $iter($call(e.get("range"),[e.get("initial_countries")],$dict([])))){e.set("index",$t87);{const $t88=$item(e.get("everyone"),$slice($bin("FloorDiv",$bin("Mult",e.get("index"),e.get("population")),e.get("initial_countries")),$bin("FloorDiv",$bin("Mult",$bin("Add",e.get("index"),1),e.get("population")),e.get("initial_countries")),null));e.set("residents",$t88);}
{const $t89=$call(e.get("next"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t90 of $iter(e.get("residents"))){e.set("p",$t90);if($truth($compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"]))){yield e.get("p");}}})();})(e),$item(e.get("residents"),0)],$dict([]));e.set("founder",$t89);}
{const $t91=$bin("Add",e.get("index"),1);e.set("cid",$t91);}
{const $t92=$call(e.get("Country"),[e.get("cid"),$call($get(e.get("self"),"founder_country_name"),[e.get("founder")],$dict([])),$get(e.get("founder"),"id"),0],$dict([["capacity",e.get("capacity")]]));$setitem($get(e.get("self"),"countries"),e.get("cid"),$t92);}
if($truth($compare([()=>e.get("capacity"),()=>1000000], ["NotEq"]))){{const $t93=true;$set($item($get(e.get("self"),"countries"),e.get("cid")),"capacity_manual",$t93);}
}else{}
for(const $t94 of $iter(e.get("residents"))){e.set("person",$t94);{const $t95=e.get("cid");$set(e.get("person"),"country",$t95);}
if($truth($compare([()=>$get($item($get(e.get("self"),"lineages"),$get(e.get("person"),"lineage")),"founder"),()=>$get(e.get("person"),"id")], ["Eq"]))){{const $t96=e.get("cid");$set($item($get(e.get("self"),"lineages"),$get(e.get("person"),"lineage")),"founder_country",$t96);}
}else{}
}
if($truth($compare([()=>$get(e.get("founder"),"age"),()=>18], ["GtE"]))){{const $t97=$get(e.get("founder"),"id");$set($item($get(e.get("self"),"countries"),e.get("cid")),"ruler",$t97);}
}else{}
$call($get(e.get("self"),"record"),[($fmt($call($get(e.get("self"),"person_reference"),[e.get("founder")],$dict([])),-1,null)+" founded "+$fmt($get($item($get(e.get("self"),"countries"),e.get("cid")),"name"),-1,null)+" with "+$fmt($call(e.get("len"),[e.get("residents")],$dict([])),-1,null)+" people.")],$dict([]));
for(const $t98 of $iter($call(e.get("range"),[0,$call(e.get("len"),[e.get("residents")],$dict([])),250],$dict([])))){e.set("offset",$t98);{const $t99=$item(e.get("residents"),$slice(e.get("offset"),$bin("Add",e.get("offset"),250),null));e.set("locals_",$t99);}
{const $t100=$call(e.get("next"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t101 of $iter(e.get("locals_"))){e.set("p",$t101);if($truth($compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"]))){yield e.get("p");}}})();})(e),$item(e.get("locals_"),0)],$dict([]));e.set("local_founder",$t100);}
$call($get(e.get("self"),"found_settlement"),[e.get("cid"),e.get("local_founder"),e.get("locals_")],$dict([]));
}
}
$call(e.get("initialize_civic"),[e.get("self")],$dict([]));
$call(e.get("refresh_public_roles"),[e.get("self")],$dict([["announce",false]]));
$call($get($get(e.get("self"),"yearly_reports"),"append"),[$call(e.get("dict"),[],$dict([["year",0],["states",Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t102 of $iter($call($get($get(e.get("self"),"countries"),"values"),[],$dict([])))){e.set("c",$t102);yield ($fmt($get(e.get("c"),"name"),-1,null)+": Normal");}})();})(e))],["start",0],["end",$call(e.get("len"),[$get(e.get("self"),"history")],$dict([]))],["population",e.get("population")],["births",0],["deaths",0]]))],$dict([]));
return null;}));
e.set("record",$fn("record",e,["self", "message", "category"],[undefined,undefined,"political"],null,null,[],[],e=>{$call($get($get(e.get("self"),"history"),"append"),[$tuple([$get(e.get("self"),"year"),e.get("message")])],$dict([]));
$call($get($get(e.get("self"),"history_categories"),"append"),[e.get("category")],$dict([]));
return null;}));
e.set("format_year",$fn("format_year",e,["self", "report"],[undefined,undefined],null,null,[],[],e=>{{const $t103=[$call($get("\n","join"),[[("Year "+$fmt($item(e.get("report"),"year"),-1,null)),...$iter($item(e.get("report"),"states"))]],$dict([]))];e.set("sections",$t103);}
for(const $t104 of $iter($tuple(["discovery","political","creative","war","sickness","disaster"]))){e.set("category",$t104);{const $t105=[];e.set("lines",$t105);}
for(const $t106 of $iter($call(e.get("range"),[$item(e.get("report"),"start"),$item(e.get("report"),"end")],$dict([])))){e.set("index",$t106);if($truth($compare([()=>$item($get(e.get("self"),"history_categories"),e.get("index")),()=>e.get("category")], ["Eq"]))){$call($get(e.get("lines"),"append"),[$call($get(e.get("self"),"render_history"),[$item($item($get(e.get("self"),"history"),e.get("index")),1)],$dict([]))],$dict([]));
}else{}
}
if($truth(e.get("lines"))){$call($get(e.get("sections"),"append"),[$call($get("\n","join"),[e.get("lines")],$dict([]))],$dict([]));
}else{}
}
{const $t107=("Population: "+$fmt($item(e.get("report"),"population"),-1,null)+" | Births: "+$fmt($item(e.get("report"),"births"),-1,null)+" | Deaths: "+$fmt($item(e.get("report"),"deaths"),-1,null));e.set("summary",$t107);}
if($truth($compare([()=>"death_causes",()=>e.get("report")], ["In"]))){{const $t108=$item(e.get("report"),"death_causes");e.set("causes",$t108);}
e.set("summary",$aug("Add",e.get("summary"),(" (ordinary "+$fmt($item(e.get("causes"),"ordinary"),-1,null)+", sickness "+$fmt($item(e.get("causes"),"sickness"),-1,null)+", war "+$fmt($item(e.get("causes"),"war"),-1,null)+", disasters "+$fmt($item(e.get("causes"),"disaster"),-1,null)+")")));}else{}
{const $t109=$call($get(e.get("report"),"get"),["interventions",$dict([])],$dict([]));e.set("interventions",$t109);}
if($truth($boolop("Or",[()=>$call($get(e.get("interventions"),"get"),["added"],$dict([])),()=>$call($get(e.get("interventions"),"get"),["deaths"],$dict([]))]))){e.set("summary",$aug("Add",e.get("summary"),("\nBefore this year: editor additions "+$fmt($call($get(e.get("interventions"),"get"),["added",0],$dict([])),-1,null)+", editor deaths "+$fmt($call($get(e.get("interventions"),"get"),["deaths",0],$dict([])),-1,null)+" (separate from yearly totals).")));}else{}
$call($get(e.get("sections"),"append"),[e.get("summary")],$dict([]));
{const $t110=$call($get($call($get("\n\n","join"),[e.get("sections")],$dict([])),"splitlines"),[],$dict([]));e.set("lines",$t110);}
return $call($get("\n","join"),[$bin("Add",[$item(e.get("lines"),0)],Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t111 of $iter($item(e.get("lines"),$slice(1,null,null)))){e.set("line",$t111);yield ($truth(e.get("line"))?$bin("Add","    ",e.get("line")):"");}})();})(e)))],$dict([]));return null;}));
e.set("founder_country_name",$fn("founder_country_name",e,["self", "founder"],[undefined,undefined],null,null,[],[],e=>{{const $t112=$call($get($get(e.get("self"),"rng"),"choice"),[[$get(e.get("founder"),"first"),$get(e.get("founder"),"first"),$get($item($get(e.get("self"),"lineages"),$get(e.get("founder"),"lineage")),"surname")]],$dict([]));e.set("root",$t112);}
return $call($get($get(e.get("self"),"names"),"country"),[e.get("root")],$dict([]));return null;}));
e.set("new_lineage",$fn("new_lineage",e,["self", "founder", "parent"],[undefined,undefined,null],null,null,[],[],e=>{{const $t113=$bin("Add",$call(e.get("len"),[$get(e.get("self"),"lineages")],$dict([])),1);e.set("lid",$t113);}
{const $t114=$call(e.get("Lineage"),[e.get("lid"),$call($get($get(e.get("self"),"names"),"make"),["last"],$dict([])),e.get("founder"),$get(e.get("self"),"year"),e.get("parent")],$dict([]));$setitem($get(e.get("self"),"lineages"),e.get("lid"),$t114);}
if($truth($compare([()=>e.get("founder"),()=>$get(e.get("self"),"archive")], ["In"]))){{const $t115=$get($item($get(e.get("self"),"archive"),e.get("founder")),"country");$set($item($get(e.get("self"),"lineages"),e.get("lid")),"founder_country",$t115);}
}else{}
return e.get("lid");return null;}));
e.set("add_person",$fn("add_person",e,["self", "age", "lineage", "country", "parents"],[undefined,undefined,undefined,undefined,$tuple([])],null,null,[],[],e=>{{const $t116=$get(e.get("self"),"next_person");e.set("pid",$t116);}
$set(e.get("self"),"next_person",$aug("Add",$get(e.get("self"),"next_person"),1));{const $t117=$call(e.get("Person"),[e.get("pid"),$call($get($get(e.get("self"),"names"),"make"),["first"],$dict([])),e.get("age"),e.get("lineage"),e.get("country"),$bin("Sub",$get(e.get("self"),"year"),e.get("age")),e.get("parents")],$dict([]));e.set("person",$t117);}
{const $t118=($truth(e.get("parents"))?$call($get($get(e.get("self"),"archive"),"get"),[$item(e.get("parents"),0)],$dict([])):null);e.set("parent",$t118);}
if($truth($boolop("And",[()=>e.get("parent"),()=>$compare([()=>$get(e.get("parent"),"country"),()=>e.get("country")], ["Eq"])]))){{const $t119=$get(e.get("parent"),"settlement");$set(e.get("person"),"settlement",$t119);}
}else{if($truth($compare([()=>e.get("country"),()=>$get(e.get("self"),"countries")], ["In"]))){{const $t120=$get($item($get(e.get("self"),"countries"),e.get("country")),"capital");$set(e.get("person"),"settlement",$t120);}
}else{}
}
{const $t121=e.get("person");$setitem($get(e.get("self"),"people"),e.get("pid"),$t121);}
{const $t122=e.get("person");$setitem($get(e.get("self"),"archive"),e.get("pid"),$t122);}
$call($get(e.get("self"),"register_name"),[e.get("person")],$dict([]));
$set($item($get(e.get("self"),"lineages"),e.get("lineage")),"births",$aug("Add",$get($item($get(e.get("self"),"lineages"),e.get("lineage")),"births"),1));return e.get("person");return null;}));
e.set("settlement_kind",Object.assign($fn("settlement_kind",e,["population"],[undefined],null,null,[],[],e=>{if($truth($compare([()=>e.get("population"),()=>1000], ["GtE"]))){return "city";}else{}
if($truth($compare([()=>e.get("population"),()=>100], ["GtE"]))){return "town";}else{}
return "village";return null;}),{static:true}));
e.set("found_settlement",$fn("found_settlement",e,["self", "cid", "founder", "residents", "name", "cell"],[undefined,undefined,undefined,undefined,null,null],null,null,[],[],e=>{{const $t123=$bin("Add",$call(e.get("len"),[$get(e.get("self"),"settlements")],$dict([])),1);e.set("sid",$t123);}
if($truth($compare([()=>e.get("name"),()=>null], ["Is"]))){{const $t124=$boolop("Or",[()=>$call($get($call($get($call($get($get(e.get("self"),"names"),"make"),["first"],$dict([])),"lower"),[],$dict([])),"rstrip"),["aeiou"],$dict([])),()=>"al"]);e.set("root",$t124);}
{const $t125=$call($get($bin("Add",e.get("root"),$call($get($get(e.get("self"),"rng"),"choice"),[["ford","ton","wick","haven","vale","bury","a"]],$dict([]))),"capitalize"),[],$dict([]));e.set("base",$t125);}
{const $t126=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t127 of $iter($call($get($get(e.get("self"),"settlements"),"values"),[],$dict([])))){e.set("s",$t127);yield $get(e.get("s"),"name");}})();})(e));e.set("existing",$t126);}
{const $t128=e.get("base");e.set("name",$t128);}
{const $t129=2;e.set("number",$t129);}
while($truth($compare([()=>e.get("name"),()=>e.get("existing")], ["In"]))){{const $t130=($fmt(e.get("base"),-1,null)+" "+$fmt($call(e.get("roman"),[e.get("number")],$dict([])),-1,null));e.set("name",$t130);}
e.set("number",$aug("Add",e.get("number"),1));}
}else{}
{const $t131=$call(e.get("Settlement"),[e.get("sid"),e.get("name"),e.get("cid"),$get(e.get("founder"),"id"),$get(e.get("self"),"year"),$call($get(e.get("self"),"settlement_kind"),[$call(e.get("len"),[e.get("residents")],$dict([]))],$dict([]))],$dict([]));e.set("settlement",$t131);}
{const $t132=e.get("settlement");$setitem($get(e.get("self"),"settlements"),e.get("sid"),$t132);}
e.set("place_settlement",$get($import("geography"),"place_settlement"));e.set("_placed",$get($import("geography"),"_placed"));{const $t133=$call($get($get(e.get("self"),"settlements"),"get"),[$get(e.get("founder"),"settlement")],$dict([]));e.set("home",$t133);}
{const $t134=($truth($boolop("And",[()=>$compare([()=>e.get("home"),()=>null], ["IsNot"]),()=>$call(e.get("_placed"),[e.get("home")],$dict([])),()=>$compare([()=>$get(e.get("home"),"id"),()=>e.get("sid")], ["NotEq"])]))?$tuple([$get(e.get("home"),"gx"),$get(e.get("home"),"gy")]):null);e.set("anchor",$t134);}
$call(e.get("place_settlement"),[e.get("self"),e.get("settlement"),e.get("cell"),e.get("anchor")],$dict([]));
for(const $t135 of $iter(e.get("residents"))){e.set("person",$t135);{const $t136=e.get("sid");$set(e.get("person"),"settlement",$t136);}
}
if($truth($compare([()=>$get($item($get(e.get("self"),"countries"),e.get("cid")),"capital"),()=>null], ["Is"]))){{const $t137=e.get("sid");$set($item($get(e.get("self"),"countries"),e.get("cid")),"capital",$t137);}
}else{}
$call($get(e.get("self"),"record"),[($fmt($call($get(e.get("self"),"person_reference"),[e.get("founder")],$dict([])),-1,null)+" established the "+$fmt($get(e.get("settlement"),"kind"),-1,null)+" of "+$fmt(e.get("name"),-1,null)+" in "+$fmt($get($item($get(e.get("self"),"countries"),e.get("cid")),"name"),-1,null)+" with "+$fmt($call(e.get("len"),[e.get("residents")],$dict([])),-1,null)+" residents.")],$dict([]));
return e.get("settlement");return null;}));
e.set("update_settlements",$fn("update_settlements",e,["self", "allow_migration"],[undefined,true],null,null,[],[],e=>{{const $t138=$dict([]);e.set("groups",$t138);}
for(const $t139 of $iter($call($get($get(e.get("self"),"people"),"values"),[],$dict([])))){e.set("person",$t139);$call($get($call($get(e.get("groups"),"setdefault"),[$get(e.get("person"),"settlement"),[]],$dict([])),"append"),[e.get("person")],$dict([]));
}
{const $t140=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t142 of $iter($get(e.get("self"),"wars"))){e.set("pair",$t142);for(const $t141 of $iter(e.get("pair"))){e.set("cid",$t141);yield e.get("cid");}}})();})(e));e.set("at_war",$t140);}
if($truth(e.get("allow_migration"))){for(const $t143 of $iter($call(e.get("list"),[$call($get(e.get("groups"),"items"),[],$dict([]))],$dict([])))){{const $t144=Array.from($iter($t143));e.set("sid",$t144[0]);e.set("residents",$t144[1]);}{const $t145=$item($get(e.get("self"),"settlements"),e.get("sid"));e.set("settlement",$t145);}
{const $t146=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t147 of $iter(e.get("residents"))){e.set("p",$t147);if($truth($compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"]))){yield e.get("p");}}})();})(e));e.set("adults",$t146);}
if($truth($boolop("Or",[()=>$compare([()=>$get(e.get("settlement"),"country"),()=>e.get("at_war")], ["In"]),()=>$un("Not",e.get("adults"))]))){continue;}else{}
e.set("system_state",$get($import("systems"),"state"));{const $t148=$item($call(e.get("system_state"),[e.get("self"),$get(e.get("settlement"),"country")],$dict([])),"expansion");e.set("drive",$t148);}
if($truth($boolop("And",[()=>$compare([()=>$call(e.get("len"),[e.get("residents")],$dict([])),()=>120], ["GtE"]),()=>$compare([()=>$call($get($get(e.get("self"),"rng"),"random"),[],$dict([])),()=>$bin("Mult",0.012,e.get("drive"))], ["Lt"])]))){e.set("launch_expedition",$get($import("development"),"launch_expedition"));$call(e.get("launch_expedition"),[e.get("self"),e.get("settlement")],$dict([]));
}else{if($truth($boolop("And",[()=>$compare([()=>$call(e.get("len"),[e.get("residents")],$dict([])),()=>10], ["GtE"]),()=>$compare([()=>$call($get($get(e.get("self"),"rng"),"random"),[],$dict([])),()=>0.02], ["Lt"])]))){{const $t149=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t150 of $iter($call($get($get(e.get("self"),"settlements"),"values"),[],$dict([])))){e.set("s",$t150);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("s"),"country"),()=>$get(e.get("settlement"),"country")], ["Eq"]),()=>$compare([()=>$get(e.get("s"),"id"),()=>e.get("sid")], ["NotEq"]),()=>$compare([()=>$call(e.get("len"),[$call($get(e.get("groups"),"get"),[$get(e.get("s"),"id"),[]],$dict([]))],$dict([])),()=>$call(e.get("len"),[e.get("residents")],$dict([]))], ["Gt"])]))){yield e.get("s");}}})();})(e));e.set("destinations",$t149);}
if($truth(e.get("destinations"))){{const $t151=$call(e.get("max"),[e.get("destinations")],$dict([["key",$fn("<lambda>",e,["s"],[undefined],null,null,[],[],e=>{return $call(e.get("len"),[$call($get(e.get("groups"),"get"),[$get(e.get("s"),"id"),[]],$dict([]))],$dict([]));return null;})]]));e.set("target",$t151);}
{const $t152=$call($get($get(e.get("self"),"rng"),"choice"),[e.get("adults")],$dict([]));e.set("migrant",$t152);}
{const $t153=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t154 of $iter(e.get("residents"))){e.set("p",$t154);if($truth($compare([()=>$get(e.get("p"),"lineage"),()=>$get(e.get("migrant"),"lineage")], ["Eq"]))){yield e.get("p");}}})();})(e));e.set("family",$t153);}
e.set("launch_migration",$get($import("development"),"launch_migration"));{const $t155=$call(e.get("launch_migration"),[e.get("self"),e.get("settlement"),e.get("target"),e.get("family")],$dict([]));e.set("journey",$t155);}
$call($get(e.get("self"),"record"),[($fmt($call(e.get("len"),[e.get("family")],$dict([])),-1,null)+" residents "+$fmt(($truth(e.get("journey"))?"set out":"moved"),-1,null)+" from "+$fmt($get(e.get("settlement"),"name"),-1,null)+" to "+$fmt($get(e.get("target"),"name"),-1,null)+" in "+$fmt($get($item($get(e.get("self"),"countries"),$get(e.get("settlement"),"country")),"name"),-1,null)+".")],$dict([]));
}else{}
}else{if($truth($boolop("And",[()=>$compare([()=>$call(e.get("len"),[e.get("residents")],$dict([])),()=>25], ["GtE"]),()=>$compare([()=>$call($get($get(e.get("self"),"rng"),"random"),[],$dict([])),()=>0.04], ["Lt"])]))){e.set("launch_emigration",$get($import("development"),"launch_emigration"));$call(e.get("launch_emigration"),[e.get("self"),e.get("settlement"),e.get("groups")],$dict([]));
}else{}
}
}
}
}else{}
{const $t156=$call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t157 of $iter($call($get($get(e.get("self"),"people"),"values"),[],$dict([])))){e.set("p",$t157);yield $get(e.get("p"),"settlement");}})();})(e)],$dict([]));e.set("counts",$t156);}
for(const $t158 of $iter($call($get($get(e.get("self"),"settlements"),"items"),[],$dict([])))){{const $t159=Array.from($iter($t158));e.set("sid",$t159[0]);e.set("settlement",$t159[1]);}{const $t160=$item(e.get("counts"),e.get("sid"));e.set("count",$t160);}
if($truth($un("Not",e.get("count")))){if($truth($compare([()=>$get(e.get("settlement"),"abandoned"),()=>null], ["Is"]))){{const $t161=$get(e.get("self"),"year");$set(e.get("settlement"),"abandoned",$t161);}
$call($get(e.get("self"),"record"),[($fmt($get(e.get("settlement"),"name"),-1,null)+" in "+$fmt($get($item($get(e.get("self"),"countries"),$get(e.get("settlement"),"country")),"name"),-1,null)+" was abandoned.")],$dict([]));
}else{}
continue;}else{}
if($truth($compare([()=>$get(e.get("settlement"),"abandoned"),()=>null], ["IsNot"]))){{const $t162=null;$set(e.get("settlement"),"abandoned",$t162);}
$call($get(e.get("self"),"record"),[($fmt($get(e.get("settlement"),"name"),-1,null)+" was resettled.")],$dict([]));
}else{}
{const $t163=$call($get(e.get("self"),"settlement_kind"),[e.get("count")],$dict([]));e.set("kind",$t163);}
if($truth($compare([()=>e.get("kind"),()=>$get(e.get("settlement"),"kind")], ["NotEq"]))){{const $t164=$get(e.get("settlement"),"kind");e.set("old_kind",$t164);}
{const $t165=e.get("kind");$set(e.get("settlement"),"kind",$t165);}
$call($get(e.get("self"),"record"),[($fmt($get(e.get("settlement"),"name"),-1,null)+" changed from "+$fmt(e.get("old_kind"),-1,null)+" to "+$fmt(e.get("kind"),-1,null)+", with "+$fmt(e.get("count"),-1,null)+" residents.")],$dict([]));
}else{}
}
for(const $t166 of $iter($call($get($get(e.get("self"),"countries"),"items"),[],$dict([])))){{const $t167=Array.from($iter($t166));e.set("cid",$t167[0]);e.set("country",$t167[1]);}{const $t168=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t169 of $iter($call($get($get(e.get("self"),"settlements"),"values"),[],$dict([])))){e.set("s",$t169);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("s"),"country"),()=>e.get("cid")], ["Eq"]),()=>$item(e.get("counts"),$get(e.get("s"),"id"))]))){yield e.get("s");}}})();})(e));e.set("inhabited",$t168);}
if($truth($un("Not",e.get("inhabited")))){{const $t170=null;$set(e.get("country"),"capital",$t170);}
}else{if($truth($boolop("Or",[()=>$compare([()=>$get(e.get("country"),"capital"),()=>null], ["Is"]),()=>$un("Not",$item(e.get("counts"),$get(e.get("country"),"capital")))]))){{const $t171=$call(e.get("max"),[e.get("inhabited")],$dict([["key",$fn("<lambda>",e,["s"],[undefined],null,null,[],[],e=>{return $item(e.get("counts"),$get(e.get("s"),"id"));return null;})]]));e.set("capital",$t171);}
{const $t172=$get(e.get("capital"),"id");$set(e.get("country"),"capital",$t172);}
$call($get(e.get("self"),"record"),[($fmt($get(e.get("capital"),"name"),-1,null)+" became the capital of "+$fmt($get(e.get("country"),"name"),-1,null)+".")],$dict([]));
}else{}
}
}
return null;}));
e.set("register_name",$fn("register_name",e,["self", "person"],[undefined,undefined],null,null,[],[],e=>{{const $t173=($fmt($get(e.get("person"),"first"),-1,null)+" "+$fmt($get($item($get(e.get("self"),"lineages"),$get(e.get("person"),"lineage")),"surname"),-1,null));e.set("name",$t173);}
$call($get($call($get($get(e.get("self"),"name_holders"),"setdefault"),[e.get("name"),$call(e.get("set"),[],$dict([]))],$dict([])),"add"),[$get(e.get("person"),"id")],$dict([]));
return null;}));
e.set("full_name",$fn("full_name",e,["self", "person", "lineage", "country"],[undefined,undefined,null,null],null,null,[],[],e=>{{const $t174=($truth($compare([()=>e.get("lineage"),()=>null], ["Is"]))?$get(e.get("person"),"lineage"):e.get("lineage"));e.set("lid",$t174);}
{const $t175=($fmt($get(e.get("person"),"first"),-1,null)+" "+$fmt($get($item($get(e.get("self"),"lineages"),e.get("lid")),"surname"),-1,null));e.set("name",$t175);}
{const $t176=$call(e.get("sorted"),[$bin("BitOr",$call($get($get(e.get("self"),"name_holders"),"get"),[e.get("name"),$call(e.get("set"),[],$dict([]))],$dict([])),new PS([$get(e.get("person"),"id")]))],$dict([]));e.set("holders",$t176);}
if($truth($compare([()=>$call(e.get("len"),[e.get("holders")],$dict([])),()=>1], ["Gt"]))){e.set("name",$aug("Add",e.get("name"),(" "+$fmt($call(e.get("roman"),[$bin("Add",$call($get(e.get("holders"),"index"),[$get(e.get("person"),"id")],$dict([])),1)],$dict([])),-1,null))));}else{}
{const $t177=($truth($compare([()=>e.get("country"),()=>null], ["Is"]))?$get(e.get("person"),"country"):e.get("country"));e.set("cid",$t177);}
return ($fmt(e.get("name"),-1,null)+" of "+$fmt($get($item($get(e.get("self"),"countries"),e.get("cid")),"name"),-1,null));return null;}));
e.set("lineage_name",$fn("lineage_name",e,["self", "lid"],[undefined,undefined],null,null,[],[],e=>{{const $t178=$get($item($get(e.get("self"),"lineages"),e.get("lid")),"surname");e.set("name",$t178);}
{const $t179=$call(e.get("sorted"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t180 of $iter($call($get($get(e.get("self"),"lineages"),"items"),[],$dict([])))){{const $t181=Array.from($iter($t180));e.set("i",$t181[0]);e.set("family",$t181[1]);}if($truth($compare([()=>$get(e.get("family"),"surname"),()=>e.get("name")], ["Eq"]))){yield e.get("i");}}})();})(e)],$dict([]));e.set("holders",$t179);}
return ($truth($compare([()=>$call(e.get("len"),[e.get("holders")],$dict([])),()=>1], ["Eq"]))?e.get("name"):($fmt(e.get("name"),-1,null)+" "+$fmt($call(e.get("roman"),[$bin("Add",$call($get(e.get("holders"),"index"),[e.get("lid")],$dict([])),1)],$dict([])),-1,null)));return null;}));
e.set("person_reference",$fn("person_reference",e,["self", "person"],[undefined,undefined],null,null,[],[],e=>{return ("{person:"+$fmt($get(e.get("person"),"id"),-1,null)+":"+$fmt($get(e.get("person"),"lineage"),-1,null)+":"+$fmt($get(e.get("person"),"country"),-1,null)+"}");return null;}));
e.set("render_history",$fn("render_history",e,["self", "message"],[undefined,undefined],null,null,[],[],e=>{{const $t182=$call($get(e.get("re"),"sub"),["\\{person:(\\d+):(\\d+):(\\d+)\\}",$fn("<lambda>",e,["m"],[undefined],null,null,[],[],e=>{return $call($get(e.get("self"),"full_name"),[$item($get(e.get("self"),"archive"),$call(e.get("int"),[$item(e.get("m"),1)],$dict([]))),$call(e.get("int"),[$item(e.get("m"),2)],$dict([])),$call(e.get("int"),[$item(e.get("m"),3)],$dict([]))],$dict([]));return null;}),e.get("message")],$dict([]));e.set("message",$t182);}
return $call($get(e.get("re"),"sub"),["\\{lineage:(\\d+)\\}",$fn("<lambda>",e,["m"],[undefined],null,null,[],[],e=>{return $call($get(e.get("self"),"lineage_name"),[$call(e.get("int"),[$item(e.get("m"),1)],$dict([]))],$dict([]));return null;}),e.get("message")],$dict([]));return null;}));
e.set("pickevent",$fn("pickevent",e,["self", "country", "forced_event"],[undefined,undefined,null],null,null,[],[],e=>{for(const $t183 of $iter($tuple(["Famine","Drought"]))){e.set("crisis",$t183);if($truth($compare([()=>e.get("crisis"),()=>$get(e.get("country"),"conditions")], ["In"]))){$call($get($get(e.get("country"),"crisis_until"),"setdefault"),[e.get("crisis"),$bin("Add",$get(e.get("self"),"year"),2)],$dict([]));
if($truth($compare([()=>$get(e.get("self"),"year"),()=>$item($get(e.get("country"),"crisis_until"),e.get("crisis"))], ["GtE"]))){$call($get(e.get("self"),"end_crisis"),[e.get("country"),e.get("crisis")],$dict([]));
}else{}
}else{}
}
{const $t184=($truth($compare([()=>e.get("forced_event"),()=>null], ["IsNot"]))?e.get("forced_event"):($truth($compare([()=>$call($get($get(e.get("self"),"rng"),"random"),[],$dict([])),()=>0.4], ["Gt"]))?$call($get($get(e.get("self"),"rng"),"choice"),[$get(e.get("self"),"events")],$dict([])):"Nothing"));e.set("event",$t184);}
if($truth($compare([()=>e.get("forced_event"),()=>null], ["Is"]))){e.set("profile",$get($import("geography"),"profile"));{const $t185=$call(e.get("profile"),[e.get("self"),$get(e.get("country"),"id")],$dict([]));e.set("terrain",$t185);}
if($truth($boolop("And",[()=>$compare([()=>e.get("event"),()=>"Drought"], ["Eq"]),()=>$compare([()=>$call($get($get(e.get("self"),"rng"),"random"),[],$dict([])),()=>$bin("Mult",$bin("Mult",0.5,$item(e.get("terrain"),"coastal")),$bin("Sub",1,$item(e.get("terrain"),"dry")))], ["Lt"])]))){{const $t186="Nothing";e.set("event",$t186);}
}else{if($truth($boolop("And",[()=>$compare([()=>e.get("event"),()=>"Nothing"], ["Eq"]),()=>$compare([()=>$call($get($get(e.get("self"),"rng"),"random"),[],$dict([])),()=>$bin("Mult",0.12,$item(e.get("terrain"),"dry"))], ["Lt"])]))){{const $t187="Drought";e.set("event",$t187);}
}else{}
}
}else{}
if($truth($compare([()=>e.get("event"),()=>new PS(["Famine","Drought"])], ["In"]))){if($truth($compare([()=>$get(e.get("self"),"year"),()=>$call($get($get(e.get("country"),"crisis_cooldown"),"get"),[e.get("event"),0],$dict([]))], ["Lt"]))){{const $t188="Nothing";e.set("event",$t188);}
}else{if($truth($compare([()=>e.get("event"),()=>$get(e.get("country"),"conditions")], ["NotIn"]))){{const $t189=$call($get($get(e.get("self"),"rng"),"randint"),[2,($truth($compare([()=>e.get("event"),()=>"Famine"], ["Eq"]))?4:3)],$dict([]));e.set("duration",$t189);}
{const $t190=$bin("Add",$get(e.get("self"),"year"),e.get("duration"));$setitem($get(e.get("country"),"crisis_until"),e.get("event"),$t190);}
$call($get(e.get("self"),"record"),[($fmt($get(e.get("country"),"name"),-1,null)+" entered a "+$fmt($call($get(e.get("event"),"lower"),[],$dict([])),-1,null)+" episode; relief and recovery are expected within "+$fmt(e.get("duration"),-1,null)+" years."),"disaster"],$dict([]));
}else{}
}
}else{}
if($truth($compare([()=>e.get("event"),()=>new PS(["Famine","Drought","Disease","Panic"])], ["In"]))){$call($get($get(e.get("country"),"conditions"),"add"),[e.get("event")],$dict([]));
}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("event"),()=>"Disease"], ["Eq"]),()=>$compare([()=>$get(e.get("country"),"sickness"),()=>null], ["Is"])]))){{const $t191=$call($get($get(e.get("self"),"names"),"sickness"),[],$dict([]));$set(e.get("country"),"sickness",$t191);}
if($truth($compare([()=>$get(e.get("country"),"sickness"),()=>$call(e.get("getattr"),[e.get("self"),"retired_sicknesses",$dict([])],$dict([]))], ["In"]))){{const $t192=$get(e.get("country"),"sickness");e.set("base",$t192);}
{const $t193=2;e.set("number",$t193);}
while($truth($boolop("Or",[()=>$compare([()=>$get(e.get("country"),"sickness"),()=>$get(e.get("self"),"sicknesses")], ["In"]),()=>$compare([()=>$get(e.get("country"),"sickness"),()=>$get(e.get("self"),"retired_sicknesses")], ["In"])]))){{const $t194=($fmt(e.get("base"),-1,null)+" strain "+$fmt(e.get("number"),-1,null));$set(e.get("country"),"sickness",$t194);}
e.set("number",$aug("Add",e.get("number"),1));}
}else{}
if($truth($compare([()=>$get(e.get("country"),"sickness"),()=>$get(e.get("self"),"sicknesses")], ["NotIn"]))){{const $t195=$item($call($get($get(e.get("self"),"rng"),"choices"),[["acute","chronic","endemic"],[70,10,20]],$dict([])),0);e.set("course",$t195);}
{const $t196=($truth($compare([()=>e.get("course"),()=>"acute"], ["Eq"]))?$call($get($get(e.get("self"),"rng"),"uniform"),[0.005,0.08],$dict([])):($truth($compare([()=>e.get("course"),()=>"chronic"], ["Eq"]))?$call($get($get(e.get("self"),"rng"),"uniform"),[0.01,0.04],$dict([])):$call($get($get(e.get("self"),"rng"),"uniform"),[0.0001,0.001],$dict([]))));e.set("fatality",$t196);}
{const $t197=($truth($compare([()=>e.get("course"),()=>"chronic"], ["Eq"]))?$call($get($get(e.get("self"),"rng"),"uniform"),[0.1,0.3],$dict([])):$call($get($get(e.get("self"),"rng"),"uniform"),[0.75,0.98],$dict([])));e.set("recovery",$t197);}
{const $t198=$call(e.get("Sickness"),[$get(e.get("country"),"sickness"),$call($get($get(e.get("self"),"rng"),"uniform"),[0.15,0.55],$dict([])),e.get("fatality"),e.get("recovery")],$dict([["transmission",$call($get($get(e.get("self"),"rng"),"choice"),[["respiratory","waterborne","contact"]],$dict([]))],["incubation_steps",1],["immunity_years",($truth($compare([()=>e.get("course"),()=>"endemic"], ["Eq"]))?1:$call($get($get(e.get("self"),"rng"),"randint"),[4,12],$dict([])))],["course",e.get("course")],["recurring",$compare([()=>e.get("course"),()=>"endemic"], ["Eq"])]]));$setitem($get(e.get("self"),"sicknesses"),$get(e.get("country"),"sickness"),$t198);}
}else{}
{const $t199=$item($get(e.get("self"),"sicknesses"),$get(e.get("country"),"sickness"));e.set("disease",$t199);}
$call($get(e.get("self"),"record"),[("An outbreak of "+$fmt($get(e.get("country"),"sickness"),-1,null)+" ("+$fmt($get(e.get("disease"),"course"),-1,null)+") began in "+$fmt($get(e.get("country"),"name"),-1,null)+": baseline annual transmission chance "+$fmt($get(e.get("disease"),"infection_chance"),-1,(".0%"))+", death chance when infected "+$fmt($get(e.get("disease"),"death_chance"),-1,(".0%"))+", recovery chance after surviving "+$fmt($get(e.get("disease"),"recovery_chance"),-1,(".0%"))+"."),"sickness"],$dict([]));
}else{}
if($truth($compare([()=>e.get("event"),()=>new PS(["Health","Safety"])], ["In"]))){$call($get($get(e.get("country"),"conditions"),"discard"),["Disease"],$dict([]));
if($truth($compare([()=>$get(e.get("country"),"sickness"),()=>null], ["IsNot"]))){$call($get(e.get("self"),"record"),[($fmt($get(e.get("country"),"name"),-1,null)+" contained the external source of "+$fmt($get(e.get("country"),"sickness"),-1,null)+"; existing patients can still spread the sickness until they recover."),"sickness"],$dict([]));
{const $t200=null;$set(e.get("country"),"sickness",$t200);}
}else{}
}else{}
if($truth($compare([()=>e.get("event"),()=>new PS(["Calm","Safety"])], ["In"]))){$call($get($get(e.get("country"),"conditions"),"discard"),["Panic"],$dict([]));
}else{}
if($truth($compare([()=>e.get("event"),()=>new PS(["Growth","Abundance","Safety"])], ["In"]))){for(const $t201 of $iter($tuple(["Famine","Drought"]))){e.set("crisis",$t201);if($truth($compare([()=>e.get("crisis"),()=>$get(e.get("country"),"conditions")], ["In"]))){$call($get(e.get("self"),"end_crisis"),[e.get("country"),e.get("crisis")],$dict([]));
}else{}
}
}else{}
return e.get("event");return null;}));
e.set("end_crisis",$fn("end_crisis",e,["self", "country", "crisis"],[undefined,undefined,undefined],null,null,[],[],e=>{$call($get($get(e.get("country"),"conditions"),"discard"),[e.get("crisis")],$dict([]));
$call($get($get(e.get("country"),"crisis_until"),"pop"),[e.get("crisis"),null],$dict([]));
{const $t202=$bin("Add",$get(e.get("self"),"year"),4);$setitem($get(e.get("country"),"crisis_cooldown"),e.get("crisis"),$t202);}
{const $t203=$call(e.get("min"),[100,$call(e.get("max"),[40,$bin("Add",$get(e.get("country"),"food"),12)],$dict([]))],$dict([]));$set(e.get("country"),"food",$t203);}
$call($get(e.get("self"),"record"),[($fmt($get(e.get("country"),"name"),-1,null)+"'s "+$fmt($call($get(e.get("crisis"),"lower"),[],$dict([])),-1,null)+" ended as harvests and relief supplies recovered; reserves will buffer the next four years."),"disaster"],$dict([]));
return null;}));
e.set("apply",Object.assign($fn("apply",e,["country", "event"],[undefined,undefined],null,null,[],[],e=>{{const $t204=1.0;e.set("bm",$t204);e.set("dm",$t204);}
for(const $t205 of $iter($call(e.get("sorted"),[$get(e.get("country"),"conditions")],$dict([])))){e.set("condition",$t205);{const $t206=$item($dict([["Famine",$tuple([0.5,1.3])],["Drought",$tuple([0.8,1.2])],["Disease",$tuple([1,1])],["Panic",$tuple([0.9,1.1])]]),e.get("condition"));{const $t207=Array.from($iter($t206));e.set("b",$t207[0]);e.set("d",$t207[1]);}}
e.set("bm",$aug("Mult",e.get("bm"),e.get("b")));e.set("dm",$aug("Mult",e.get("dm"),e.get("d")));}
{const $t208=$call($get($dict([["Growth",$tuple([1.2,1])],["Abundance",$tuple([1.5,1])],["Health",$tuple([1,0.8])]]),"get"),[e.get("event"),$tuple([1,1])],$dict([]));{const $t209=Array.from($iter($t208));e.set("b",$t209[0]);e.set("d",$t209[1]);}}
return $tuple([$bin("Mult",e.get("bm"),e.get("b")),$bin("Mult",e.get("dm"),e.get("d"))]);return null;}),{static:true}));
e.set("resolve_sickness",$fn("resolve_sickness",e,["self", "country", "residents"],[undefined,undefined,undefined],null,null,[],[],e=>{return $call(e.get("resolve_disease"),[e.get("self"),e.get("country"),e.get("residents")],$dict([]));return null;}));
e.set("resolve_disasters",$fn("resolve_disasters",e,["self"],[undefined],null,null,[],[],e=>{e.set("resolve",$get($import("disasters"),"resolve"));return $call(e.get("resolve"),[e.get("self")],$dict([]));return null;}));
e.set("resolve_wars",$fn("resolve_wars",e,["self"],[undefined],null,null,[],[],e=>{return $call(e.get("resolve_campaigns"),[e.get("self")],$dict([]));return null;}));
e.set("tick",$fn("tick",e,["self", "verbose"],[undefined,true],null,null,[],[],e=>{$call($get($get(e.get("self"),"__dict__"),"pop"),["_command_undo",null],$dict([]));
{const $t210=$call(e.get("dict"),[$call(e.get("getattr"),[e.get("self"),"pending_interventions",$dict([["added",0],["deaths",0]])],$dict([]))],$dict([]));e.set("interventions",$t210);}
{const $t211=$dict([["added",0],["deaths",0]]);$set(e.get("self"),"pending_interventions",$t211);}
$set(e.get("self"),"year",$aug("Add",$get(e.get("self"),"year"),1));e.set("refresh",$get($import("systems"),"refresh"));e.set("apply_yearly",$get($import("systems"),"apply_yearly"));$call(e.get("refresh"),[e.get("self")],$dict([]));
e.set("advance_cures",$get($import("epidemiology"),"advance_cures"));$call(e.get("advance_cures"),[e.get("self")],$dict([]));
{const $t212=$call(e.get("len"),[$get(e.get("self"),"history")],$dict([]));e.set("history_start",$t212);}
{const $t213=$call(e.get("len"),[$get(e.get("self"),"people")],$dict([]));e.set("before",$t213);}
$call(e.get("import_infections"),[e.get("self")],$dict([]));
$call(e.get("develop_societies"),[e.get("self")],$dict([]));
$call(e.get("apply_yearly"),[e.get("self")],$dict([]));
e.set("economy_yearly",$get($import("economy"),"yearly"));$call(e.get("economy_yearly"),[e.get("self")],$dict([]));
{const $t214=$dict([]);e.set("groups",$t214);}
for(const $t215 of $iter($call($get($get(e.get("self"),"people"),"values"),[],$dict([])))){e.set("person",$t215);$call($get($call($get(e.get("groups"),"setdefault"),[$get(e.get("person"),"country"),[]],$dict([])),"append"),[e.get("person")],$dict([]));
}
{const $t216=0;e.set("births",$t216);e.set("deaths",$t216);}
{const $t217=$call(e.get("dict"),[],$dict([["ordinary",0],["sickness",0],["war",0],["disaster",0]]));e.set("causes",$t217);}
{const $t218=[];e.set("states",$t218);}
for(const $t219 of $iter($call($get(e.get("groups"),"items"),[],$dict([])))){{const $t220=Array.from($iter($t219));e.set("cid",$t220[0]);e.set("residents",$t220[1]);}{const $t221=$item($get(e.get("self"),"countries"),e.get("cid"));e.set("country",$t221);}
{const $t222=$call($get(e.get("self"),"pickevent"),[e.get("country")],$dict([]));e.set("event",$t222);}
{const $t223=$call(e.get("set"),[$get(e.get("country"),"conditions")],$dict([]));e.set("labels",$t223);}
$call($get(e.get("labels"),"discard"),["Disease"],$dict([]));
if($truth($get(e.get("country"),"sickness"))){$call($get(e.get("labels"),"add"),[$get(e.get("country"),"sickness")],$dict([]));
}else{}
if($truth($compare([()=>e.get("event"),()=>new PS(["Nothing","Disease"])], ["NotIn"]))){$call($get(e.get("labels"),"add"),[e.get("event")],$dict([]));
}else{}
$call($get(e.get("states"),"append"),[($fmt($get(e.get("country"),"name"),-1,null)+": "+$fmt($boolop("Or",[()=>$call($get(", ","join"),[$call(e.get("sorted"),[e.get("labels")],$dict([]))],$dict([])),()=>"Normal"]),-1,null))],$dict([]));
{const $t224=$call($get(e.get("self"),"resolve_sickness"),[e.get("country"),e.get("residents")],$dict([]));e.set("sickness_deaths",$t224);}
e.set("deaths",$aug("Add",e.get("deaths"),e.get("sickness_deaths")));$setitem(e.get("causes"),"sickness",$aug("Add",$item(e.get("causes"),"sickness"),e.get("sickness_deaths")));{const $t225=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t226 of $iter(e.get("residents"))){e.set("p",$t226);if($truth($compare([()=>$get(e.get("p"),"id"),()=>$get(e.get("self"),"people")], ["In"]))){yield e.get("p");}}})();})(e));e.set("residents",$t225);}
{const $t227=$call($get(e.get("self"),"apply"),[e.get("country"),e.get("event")],$dict([]));{const $t228=Array.from($iter($t227));e.set("bm",$t228[0]);e.set("dm",$t228[1]);}}
{const $t229=$call(e.get("social_rates"),[e.get("country")],$dict([]));{const $t230=Array.from($iter($t229));e.set("social_birth",$t230[0]);e.set("social_death",$t230[1]);}}
e.set("bm",$aug("Mult",e.get("bm"),e.get("social_birth")));e.set("dm",$aug("Mult",e.get("dm"),e.get("social_death")));{const $t231=$call(e.get("max"),[0,$bin("Sub",1,$bin("Div",$call(e.get("len"),[e.get("residents")],$dict([])),$get(e.get("country"),"capacity")))],$dict([]));e.set("crowd",$t231);}
{const $t232=$bin("Mult",e.get("dm"),$bin("Add",1,$bin("Div",$call(e.get("len"),[e.get("residents")],$dict([])),$get(e.get("country"),"capacity"))));e.set("mortality",$t232);}
{const $t233=[];e.set("survivors",$t233);}
for(const $t234 of $iter(e.get("residents"))){e.set("person",$t234);if($truth($compare([()=>$call($get($get(e.get("self"),"rng"),"random"),[],$dict([])),()=>$call(e.get("min"),[1,$bin("Mult",$item($get(e.get("self"),"dp"),$get(e.get("person"),"age")),e.get("mortality"))],$dict([]))], ["Lt"]))){e.set("deaths",$aug("Add",e.get("deaths"),1));$setitem(e.get("causes"),"ordinary",$aug("Add",$item(e.get("causes"),"ordinary"),1));$set($item($get(e.get("self"),"lineages"),$get(e.get("person"),"lineage")),"deaths",$aug("Add",$get($item($get(e.get("self"),"lineages"),$get(e.get("person"),"lineage")),"deaths"),1));{const $t235=$get(e.get("self"),"year");$set(e.get("person"),"died",$t235);}
{const $t236=($truth($compare([()=>$get(e.get("person"),"age"),()=>65], ["GtE"]))?"old age":"ordinary mortality");$set(e.get("person"),"cause_of_death",$t236);}
$del($get(e.get("self"),"people"),$get(e.get("person"),"id"));}else{$call($get(e.get("survivors"),"append"),[e.get("person")],$dict([]));
}
}
{const $t237=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t238 of $iter(e.get("survivors"))){e.set("p",$t238);if($truth($compare([()=>21,()=>$get(e.get("p"),"age"),()=>60], ["LtE", "LtE"]))){yield e.get("p");}}})();})(e));e.set("adults",$t237);}
for(const $t239 of $iter(e.get("survivors"))){e.set("person",$t239);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("person"),"age"),()=>18], ["GtE"]),()=>$compare([()=>$call($get($get(e.get("self"),"rng"),"random"),[],$dict([])),()=>$get(e.get("self"),"lineage_chance")], ["Lt"])]))){{const $t240=$get(e.get("person"),"lineage");e.set("old",$t240);}
{const $t241=$call($get(e.get("self"),"new_lineage"),[$get(e.get("person"),"id"),e.get("old")],$dict([]));$set(e.get("person"),"lineage",$t241);}
$call($get(e.get("self"),"register_name"),[e.get("person")],$dict([]));
$call($get(e.get("self"),"record"),[($fmt($call($get(e.get("self"),"person_reference"),[e.get("person")],$dict([])),-1,null)+" starts lineage {lineage:"+$fmt($get(e.get("person"),"lineage"),-1,null)+"}, a branch of {lineage:"+$fmt(e.get("old"),-1,null)+"}."),"lineage"],$dict([]));
}else{}
if($truth($compare([()=>$call($get($get(e.get("self"),"rng"),"random"),[],$dict([])),()=>$call(e.get("min"),[1,$bin("Mult",$bin("Mult",$item($get(e.get("self"),"bp"),$get(e.get("person"),"age")),e.get("bm")),e.get("crowd"))],$dict([]))], ["Lt"]))){{const $t242=null;e.set("partner",$t242);}
for(const $t243 of $iter($call(e.get("range"),[8],$dict([])))){e.set("_",$t243);{const $t244=($truth(e.get("adults"))?$call($get($get(e.get("self"),"rng"),"choice"),[e.get("adults")],$dict([])):null);e.set("candidate",$t244);}
if($truth($boolop("And",[()=>e.get("candidate"),()=>$compare([()=>$get(e.get("candidate"),"id"),()=>$get(e.get("person"),"id")], ["NotEq"]),()=>$compare([()=>$get(e.get("candidate"),"lineage"),()=>$get(e.get("person"),"lineage")], ["NotEq"])]))){{const $t245=e.get("candidate");e.set("partner",$t245);}
break;}else{}
}
{const $t246=($truth($compare([()=>e.get("partner"),()=>null], ["Is"]))?$tuple([$get(e.get("person"),"id")]):$tuple([$get(e.get("person"),"id"),$get(e.get("partner"),"id")]));e.set("parents",$t246);}
$call($get(e.get("self"),"add_person"),[0,$get(e.get("person"),"lineage"),e.get("cid"),e.get("parents")],$dict([]));
e.set("births",$aug("Add",e.get("births"),1));}else{}
$set(e.get("person"),"age",$aug("Add",$get(e.get("person"),"age"),1));}
}
{const $t247=$dict([]);e.set("current",$t247);}
for(const $t248 of $iter($call($get($get(e.get("self"),"people"),"values"),[],$dict([])))){e.set("person",$t248);$call($get($call($get(e.get("current"),"setdefault"),[$get(e.get("person"),"country"),[]],$dict([])),"append"),[e.get("person")],$dict([]));
}
for(const $t249 of $iter($call($get(e.get("current"),"items"),[],$dict([])))){{const $t250=Array.from($iter($t249));e.set("cid",$t250[0]);e.set("residents",$t250[1]);}{const $t251=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t252 of $iter(e.get("residents"))){e.set("p",$t252);if($truth($compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"]))){yield e.get("p");}}})();})(e));e.set("adults",$t251);}
if($truth($boolop("Or",[()=>$compare([()=>$call(e.get("len"),[e.get("residents")],$dict([])),()=>80], ["Lt"]),()=>$un("Not",e.get("adults")),()=>$compare([()=>$call($get($get(e.get("self"),"rng"),"random"),[],$dict([])),()=>$get(e.get("self"),"country_chance")], ["GtE"])]))){continue;}else{}
{const $t253=$call($get($get(e.get("self"),"rng"),"choice"),[e.get("adults")],$dict([]));e.set("founder",$t253);}
{const $t254=$call($get($get(e.get("self"),"rng"),"randint"),[10,$call(e.get("max"),[10,$bin("FloorDiv",$call(e.get("len"),[e.get("residents")],$dict([])),3)],$dict([]))],$dict([]));e.set("target",$t254);}
{const $t255=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t256 of $iter(e.get("residents"))){e.set("p",$t256);if($truth($compare([()=>$get(e.get("p"),"lineage"),()=>$get(e.get("founder"),"lineage")], ["Eq"]))){yield e.get("p");}}})();})(e));e.set("followers",$t255);}
{const $t257=$bin("Add",[e.get("founder")],$item(Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t258 of $iter(e.get("followers"))){e.set("p",$t258);if($truth($compare([()=>$get(e.get("p"),"id"),()=>$get(e.get("founder"),"id")], ["NotEq"]))){yield e.get("p");}}})();})(e)),$slice(null,$bin("Sub",e.get("target"),1),null)));e.set("followers",$t257);}
{const $t259=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t260 of $iter(e.get("followers"))){e.set("p",$t260);yield $get(e.get("p"),"id");}})();})(e));e.set("selected",$t259);}
{const $t261=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t262 of $iter(e.get("residents"))){e.set("p",$t262);if($truth($compare([()=>$get(e.get("p"),"id"),()=>e.get("selected")], ["NotIn"]))){yield e.get("p");}}})();})(e));e.set("others",$t261);}
e.set("followers",$aug("Add",e.get("followers"),$call($get($get(e.get("self"),"rng"),"sample"),[e.get("others"),$call(e.get("min"),[$bin("Sub",e.get("target"),$call(e.get("len"),[e.get("followers")],$dict([]))),$call(e.get("len"),[e.get("others")],$dict([]))],$dict([]))],$dict([]))));{const $t263=$bin("Add",$call(e.get("len"),[$get(e.get("self"),"countries")],$dict([])),1);e.set("new_id",$t263);}
{const $t264=$call(e.get("Country"),[e.get("new_id"),$call($get(e.get("self"),"founder_country_name"),[e.get("founder")],$dict([])),$get(e.get("founder"),"id"),$get(e.get("self"),"year"),e.get("cid")],$dict([["capacity",$get($item($get(e.get("self"),"countries"),e.get("cid")),"capacity")]]));$setitem($get(e.get("self"),"countries"),e.get("new_id"),$t264);}
{const $t265=$get(e.get("founder"),"id");$set($item($get(e.get("self"),"countries"),e.get("new_id")),"ruler",$t265);}
{const $t266=$call(e.get("set"),[$get($item($get(e.get("self"),"countries"),e.get("cid")),"technologies")],$dict([]));$set($item($get(e.get("self"),"countries"),e.get("new_id")),"technologies",$t266);}
{const $t267=$call(e.get("dict"),[$call(e.get("getattr"),[$item($get(e.get("self"),"countries"),e.get("cid")),"innovations",$dict([])],$dict([]))],$dict([]));$set($item($get(e.get("self"),"countries"),e.get("new_id")),"innovations",$t267);}
{const $t268=$get($item($get(e.get("self"),"countries"),e.get("cid")),"government");$set($item($get(e.get("self"),"countries"),e.get("new_id")),"government",$t268);}
if($truth($compare([()=>$call($get($get(e.get("self"),"rng"),"random"),[],$dict([])),()=>0.25], ["Lt"]))){e.set("INITIAL",$get($import("governments"),"INITIAL"));{const $t269=$call($get($get(e.get("self"),"rng"),"choice"),[$call(e.get("list"),[e.get("INITIAL")],$dict([]))],$dict([]));$set($item($get(e.get("self"),"countries"),e.get("new_id")),"government",$t269);}
}else{}
{const $t270=$get(e.get("self"),"year");$set($item($get(e.get("self"),"countries"),e.get("new_id")),"government_since",$t270);}
if($truth($call(e.get("getattr"),[$item($get(e.get("self"),"countries"),e.get("cid")),"capacity_manual",false],$dict([])))){{const $t271=true;$set($item($get(e.get("self"),"countries"),e.get("new_id")),"capacity_manual",$t271);}
}else{}
{const $t272=$get(e.get("self"),"year");$set($item($get(e.get("self"),"countries"),e.get("new_id")),"last_election",$t272);}
$call($get(e.get("states"),"append"),[($fmt($get($item($get(e.get("self"),"countries"),e.get("new_id")),"name"),-1,null)+": Newly founded")],$dict([]));
for(const $t273 of $iter(e.get("followers"))){e.set("person",$t273);{const $t274=e.get("new_id");$set(e.get("person"),"country",$t274);}
}
$call($get(e.get("self"),"record"),[($fmt($call($get(e.get("self"),"person_reference"),[e.get("founder")],$dict([])),-1,null)+" founded "+$fmt($get($item($get(e.get("self"),"countries"),e.get("new_id")),"name"),-1,null)+" with "+$fmt($call(e.get("len"),[e.get("followers")],$dict([])),-1,null)+" settlers from "+$fmt($get($item($get(e.get("self"),"countries"),e.get("cid")),"name"),-1,null)+".")],$dict([]));
$call($get(e.get("self"),"found_settlement"),[e.get("new_id"),e.get("founder"),e.get("followers")],$dict([]));
}
{const $t275=$call($get(e.get("self"),"resolve_disasters"),[],$dict([]));e.set("disaster_deaths",$t275);}
e.set("deaths",$aug("Add",e.get("deaths"),e.get("disaster_deaths")));{const $t276=e.get("disaster_deaths");$setitem(e.get("causes"),"disaster",$t276);}
{const $t277=$call($get(e.get("self"),"resolve_wars"),[],$dict([]));e.set("war_deaths",$t277);}
e.set("deaths",$aug("Add",e.get("deaths"),e.get("war_deaths")));{const $t278=e.get("war_deaths");$setitem(e.get("causes"),"war",$t278);}
e.set("advance_expeditions",$get($import("development"),"advance_expeditions"));e.set("advance_armies",$get($import("development"),"advance_armies"));e.set("advance_caravans",$get($import("development"),"advance_caravans"));$call(e.get("advance_armies"),[e.get("self")],$dict([]));
$call(e.get("advance_caravans"),[e.get("self")],$dict([]));
{const $t279=$call(e.get("advance_expeditions"),[e.get("self")],$dict([]));e.set("journey_deaths",$t279);}
e.set("deaths",$aug("Add",e.get("deaths"),e.get("journey_deaths")));$setitem(e.get("causes"),"ordinary",$aug("Add",$item(e.get("causes"),"ordinary"),e.get("journey_deaths")));{const $t280=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t281 of $iter($call($get($get(e.get("self"),"people"),"values"),[],$dict([])))){e.set("p",$t281);yield $get(e.get("p"),"country");}})();})(e));e.set("occupied",$t280);}
for(const $t282 of $iter($call($get($get(e.get("self"),"countries"),"values"),[],$dict([])))){e.set("country",$t282);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("country"),"ended"),()=>null], ["Is"]),()=>$compare([()=>$get(e.get("country"),"id"),()=>e.get("occupied")], ["NotIn"])]))){{const $t283=$get(e.get("self"),"year");$set(e.get("country"),"ended",$t283);}
$call($get(e.get("self"),"record"),[($fmt($get(e.get("country"),"name"),-1,null)+" becomes uninhabited.")],$dict([]));
}else{}
}
e.set("evolve_governments",$get($import("governments"),"evolve"));$call(e.get("evolve_governments"),[e.get("self")],$dict([]));
$call(e.get("maintain_rulers"),[e.get("self")],$dict([]));
$call($get(e.get("self"),"update_settlements"),[],$dict([]));
e.set("plan_projects",$get($import("development"),"plan_projects"));e.set("advance_projects",$get($import("development"),"advance_projects"));$call(e.get("plan_projects"),[e.get("self")],$dict([]));
$call(e.get("advance_projects"),[e.get("self")],$dict([]));
e.set("auto_eradicate",$get($import("epidemiology"),"auto_eradicate"));$call(e.get("auto_eradicate"),[e.get("self")],$dict([]));
$call(e.get("annual_civic"),[e.get("self")],$dict([]));
e.set("economy_spend",$get($import("economy"),"spend"));$call(e.get("economy_spend"),[e.get("self")],$dict([]));
$call(e.get("ensure_year_events"),[e.get("self"),e.get("history_start")],$dict([["minimum",10]]));
{const $t284=$call(e.get("len"),[$get(e.get("self"),"people")],$dict([]));e.set("after",$t284);}
if($truth($compare([()=>e.get("after"),()=>e.get("before")], ["NotEq"]))){{const $t285=($truth($compare([()=>e.get("after"),()=>e.get("before")], ["Gt"]))?"increased":"decreased");e.set("direction",$t285);}
$call($get(e.get("self"),"record"),[("Population "+$fmt(e.get("direction"),-1,null)+" from "+$fmt(e.get("before"),-1,null)+" to "+$fmt(e.get("after"),-1,null)+"."),"population"],$dict([]));
}else{}
{const $t286=$call(e.get("dict"),[],$dict([["year",$get(e.get("self"),"year")],["states",e.get("states")],["start",e.get("history_start")],["end",$call(e.get("len"),[$get(e.get("self"),"history")],$dict([]))],["population",e.get("after")],["births",e.get("births")],["deaths",e.get("deaths")],["death_causes",e.get("causes")],["interventions",e.get("interventions")]]));e.set("report",$t286);}
$call($get($get(e.get("self"),"yearly_reports"),"append"),[e.get("report")],$dict([]));
if($truth(e.get("verbose"))){$call(e.get("print"),[$bin("Add","\n",$call($get(e.get("self"),"format_year"),[e.get("report")],$dict([])))],$dict([]));
}else{}
return $tuple([e.get("births"),e.get("deaths")]);return null;}));
e.set("lineage_tree",$fn("lineage_tree",e,["self"],[undefined],null,null,[],[],e=>{{const $t287=$call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t288 of $iter($call($get($get(e.get("self"),"people"),"values"),[],$dict([])))){e.set("p",$t288);yield $get(e.get("p"),"lineage");}})();})(e)],$dict([]));e.set("living",$t287);}
{const $t289=$dict([]);e.set("children",$t289);}
for(const $t290 of $iter($call($get($get(e.get("self"),"lineages"),"items"),[],$dict([])))){{const $t291=Array.from($iter($t290));e.set("lid",$t291[0]);e.set("family",$t291[1]);}$call($get($call($get(e.get("children"),"setdefault"),[$get(e.get("family"),"parent_lineage"),[]],$dict([])),"append"),[e.get("lid")],$dict([]));
}
e.set("label",$fn("label",e,["lid"],[undefined],null,null,[],[],e=>{{const $t292=$item($get(e.get("self"),"lineages"),e.get("lid"));e.set("family",$t292);}
{const $t293=$item($get(e.get("self"),"archive"),$get(e.get("family"),"founder"));e.set("founder",$t293);}
{const $t294=$call($get(e.get("self"),"full_name"),[e.get("founder")],$dict([["lineage",e.get("lid")],["country",$get(e.get("family"),"founder_country")]]));e.set("name",$t294);}
{const $t295=($truth($item(e.get("living"),e.get("lid")))?($fmt($item(e.get("living"),e.get("lid")),-1,null)+" living"):"no living members");e.set("status",$t295);}
return ($fmt($call($get(e.get("self"),"lineage_name"),[e.get("lid")],$dict([])),-1,null)+" - founder: "+$fmt(e.get("name"),-1,null)+" | year "+$fmt($get(e.get("family"),"founded"),-1,null)+" | "+$fmt(e.get("status"),-1,null));return null;}));
{const $t296=[];e.set("lines",$t296);}
for(const $t297 of $iter($call($get(e.get("children"),"get"),[null,[]],$dict([])))){e.set("root",$t297);if($truth(e.get("lines"))){$call($get(e.get("lines"),"append"),[""],$dict([]));
}else{}
$call($get(e.get("lines"),"append"),[$call(e.get("label"),[e.get("root")],$dict([]))],$dict([]));
{const $t298=$call($get(e.get("children"),"get"),[e.get("root"),[]],$dict([]));e.set("branches",$t298);}
{const $t299=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t300 of $iter($call(e.get("reversed"),[$call(e.get("list"),[$call(e.get("enumerate"),[e.get("branches")],$dict([]))],$dict([]))],$dict([])))){{const $t301=Array.from($iter($t300));e.set("i",$t301[0]);e.set("lid",$t301[1]);}yield $tuple([e.get("lid"),"",$compare([()=>e.get("i"),()=>$bin("Sub",$call(e.get("len"),[e.get("branches")],$dict([])),1)], ["Eq"])]);}})();})(e));e.set("stack",$t299);}
while($truth(e.get("stack"))){{const $t302=$call($get(e.get("stack"),"pop"),[],$dict([]));{const $t303=Array.from($iter($t302));e.set("lid",$t303[0]);e.set("prefix",$t303[1]);e.set("last",$t303[2]);}}
$call($get(e.get("lines"),"append"),[$bin("Add",$bin("Add",e.get("prefix"),($truth(e.get("last"))?"`-- ":"|-- ")),$call(e.get("label"),[e.get("lid")],$dict([])))],$dict([]));
{const $t304=$bin("Add",e.get("prefix"),($truth(e.get("last"))?"    ":"|   "));e.set("next_prefix",$t304);}
{const $t305=$call($get(e.get("children"),"get"),[e.get("lid"),[]],$dict([]));e.set("branches",$t305);}
$call($get(e.get("stack"),"extend"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t306 of $iter($call(e.get("reversed"),[$call(e.get("list"),[$call(e.get("enumerate"),[e.get("branches")],$dict([]))],$dict([]))],$dict([])))){{const $t307=Array.from($iter($t306));e.set("i",$t307[0]);e.set("child",$t307[1]);}yield $tuple([e.get("child"),e.get("next_prefix"),$compare([()=>e.get("i"),()=>$bin("Sub",$call(e.get("len"),[e.get("branches")],$dict([])),1)], ["Eq"])]);}})();})(e)],$dict([]));
}
}
return $boolop("Or",[()=>$call($get("\n","join"),[e.get("lines")],$dict([])),()=>"No lineages."]);return null;}));
e.set("report",$fn("report",e,["self", "show_history"],[undefined,false],null,null,[],[],e=>{if($truth(e.get("show_history"))){for(const $t308 of $iter($get(e.get("self"),"yearly_reports"))){e.set("report",$t308);$call(e.get("print"),[$bin("Add","\n",$call($get(e.get("self"),"format_year"),[e.get("report")],$dict([])))],$dict([]));
}
}else{}
{const $t309=$call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t310 of $iter($call($get($get(e.get("self"),"people"),"values"),[],$dict([])))){e.set("p",$t310);yield $get(e.get("p"),"country");}})();})(e)],$dict([]));e.set("countries",$t309);}
{const $t311=$call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t312 of $iter($call($get($get(e.get("self"),"people"),"values"),[],$dict([])))){e.set("p",$t312);yield $get(e.get("p"),"settlement");}})();})(e)],$dict([]));e.set("settlement_counts",$t311);}
{const $t313=$call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t314 of $iter($call($get($get(e.get("self"),"people"),"values"),[],$dict([])))){e.set("p",$t314);yield $get(e.get("p"),"lineage");}})();})(e)],$dict([]));e.set("families",$t313);}
$call(e.get("print"),[("\nLiving population: "+$fmt($call(e.get("len"),[$get(e.get("self"),"people")],$dict([])),-1,null))],$dict([]));
$call(e.get("print"),[("Countries: "+$fmt($call(e.get("len"),[e.get("countries")],$dict([])),-1,null)+" inhabited, "+$fmt($call(e.get("len"),[$get(e.get("self"),"countries")],$dict([])),-1,null)+" founded")],$dict([]));
for(const $t315 of $iter($call($get(e.get("countries"),"most_common"),[],$dict([])))){{const $t316=Array.from($iter($t315));e.set("cid",$t316[0]);e.set("count",$t316[1]);}{const $t317=$item($get(e.get("self"),"countries"),e.get("cid"));e.set("country",$t317);}
{const $t318=($truth($get(e.get("country"),"sickness"))?(" | outbreak: "+$fmt($get(e.get("country"),"sickness"),-1,null)):"");e.set("illness",$t318);}
$call(e.get("print"),[("  "+$fmt($get(e.get("country"),"name"),-1,null)+": "+$fmt(e.get("count"),-1,null)+$fmt(e.get("illness"),-1,null))],$dict([]));
{const $t319=$call($get($get(e.get("self"),"people"),"get"),[$get(e.get("country"),"ruler")],$dict([]));e.set("ruler",$t319);}
{const $t320=($truth(e.get("ruler"))?$call($get(e.get("self"),"full_name"),[e.get("ruler")],$dict([])):"no adult ruler");e.set("leader",$t320);}
$call(e.get("print"),[("    "+$fmt($call($get($get(e.get("country"),"government"),"capitalize"),[],$dict([])),-1,null)+" | Economy: "+$fmt($get(e.get("country"),"economic_system"),-1,null)+" | Leader: "+$fmt(e.get("leader"),-1,null))],$dict([]));
$call(e.get("print"),[("    Food: "+$fmt($get(e.get("country"),"food"),-1,(".0f"))+"/100 | Prosperity: "+$fmt($get(e.get("country"),"prosperity"),-1,(".0f"))+"/100 | Stability: "+$fmt($get(e.get("country"),"stability"),-1,(".0f"))+"/100")],$dict([]));
$call(e.get("print"),[$bin("Add","    Discoveries: ",$boolop("Or",[()=>$call($get(", ","join"),[$call(e.get("sorted"),[$get(e.get("country"),"technologies")],$dict([]))],$dict([])),()=>"none yet"]))],$dict([]));
$call(e.get("print"),[("    Applied innovations: "+$fmt($call(e.get("len"),[$call(e.get("getattr"),[e.get("country"),"innovations",$dict([])],$dict([]))],$dict([])),-1,null)+" | Treasury: "+$fmt($get(e.get("country"),"treasury"),-1,(",.1f")))],$dict([]));
{const $t321=$call(e.get("getattr"),[e.get("country"),"research_project",null],$dict([]));e.set("project",$t321);}
if($truth(e.get("project"))){$call(e.get("print"),[("    Research: "+$fmt(e.get("project"),-1,null)+" | Saved points: "+$fmt($get(e.get("country"),"research"),-1,(".1f"))+" | Focus: "+$fmt($get(e.get("country"),"research_focus"),-1,null))],$dict([]));
}else{}
for(const $t322 of $iter($call($get($get(e.get("self"),"settlements"),"values"),[],$dict([])))){e.set("settlement",$t322);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("settlement"),"country"),()=>e.get("cid")], ["Eq"]),()=>$item(e.get("settlement_counts"),$get(e.get("settlement"),"id"))]))){{const $t323=($truth($compare([()=>$get(e.get("settlement"),"id"),()=>$get(e.get("country"),"capital")], ["Eq"]))?" (capital)":"");e.set("capital",$t323);}
$call(e.get("print"),[("    "+$fmt($call($get($get(e.get("settlement"),"kind"),"capitalize"),[],$dict([])),-1,null)+" of "+$fmt($get(e.get("settlement"),"name"),-1,null)+$fmt(e.get("capital"),-1,null)+": "+$fmt($item(e.get("settlement_counts"),$get(e.get("settlement"),"id")),-1,null)+" residents")],$dict([]));
}else{}
}
}
$call(e.get("print"),[("Lineages: "+$fmt($call(e.get("len"),[e.get("families")],$dict([])),-1,null)+" living, "+$fmt($call(e.get("len"),[$get(e.get("self"),"lineages")],$dict([])),-1,null)+" founded")],$dict([]));
$call(e.get("print"),["Type lineages between years to inspect family trees."],$dict([]));
return null;}));
}));
});
$register("society",e=>{e.set("advance_innovations",$get($import("discoveries"),"advance_innovations"));e.set("innovation_modifiers",$get($import("discoveries"),"innovation_modifiers"));e.set("share_innovation",$get($import("discoveries"),"share_innovation"));e.set("technology",$import("technology"));e.set("tech_effects",$get($import("technology"),"effects"));e.set("era_index",$get($import("technology"),"era_index"));e.set("ERAS",$get($import("technology"),"ERAS"));e.set("BRANCHES",$get($import("technology"),"BRANCHES"));e.set("tech_met",$get($import("technology"),"met"));e.set("MAX_LEAD",$get($import("technology"),"MAX_LEAD"));{const $t324=new PD(((parent)=>{const e=new Env(parent);return (function*(){for(const $t325 of $iter($call($get($get(e.get("technology"),"TECH"),"items"),[],$dict([])))){{const $t326=Array.from($iter($t325));e.set("name",$t326[0]);e.set("entry",$t326[1]);}yield $tuple([e.get("name"),$tuple([$item(e.get("entry"),0),$item(e.get("entry"),1),$item(e.get("entry"),2)])]);}})();})(e));e.set("TECHNOLOGIES",$t324);}
{const $t327=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t328 of $iter($call($get($get(e.get("technology"),"TECH"),"items"),[],$dict([])))){{const $t329=Array.from($iter($t328));e.set("name",$t329[0]);e.set("entry",$t329[1]);}if($truth($compare([()=>$item(e.get("entry"),4),()=>"agriculture"], ["Eq"]))){yield e.get("name");}}})();})(e));e.set("FOOD_TECHS",$t327);}
{const $t330=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t331 of $iter($call($get($get(e.get("technology"),"TECH"),"items"),[],$dict([])))){{const $t332=Array.from($iter($t331));e.set("name",$t332[0]);e.set("entry",$t332[1]);}if($truth($compare([()=>$item(e.get("entry"),4),()=>$tuple(["industry","trade","seafaring"])], ["In"]))){yield e.get("name");}}})();})(e));e.set("INDUSTRY_TECHS",$t330);}
{const $t333=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t334 of $iter($call($get($get(e.get("technology"),"TECH"),"items"),[],$dict([])))){{const $t335=Array.from($iter($t334));e.set("name",$t335[0]);e.set("entry",$t335[1]);}if($truth($compare([()=>$item(e.get("entry"),4),()=>"knowledge"], ["Eq"]))){yield e.get("name");}}})();})(e));e.set("KNOWLEDGE_TECHS",$t333);}
{const $t336=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t337 of $iter($call($get($get(e.get("technology"),"TECH"),"items"),[],$dict([])))){{const $t338=Array.from($iter($t337));e.set("name",$t338[0]);e.set("entry",$t338[1]);}if($truth($compare([()=>$item(e.get("entry"),4),()=>"medicine"], ["Eq"]))){yield e.get("name");}}})();})(e));e.set("CARE_TECHS",$t336);}
e.set("technology_modifiers",$fn("technology_modifiers",e,["country"],[undefined],null,null,[],[],e=>{{const $t339=$call(e.get("tech_effects"),[$get(e.get("country"),"technologies")],$dict([]));e.set("fx",$t339);}
{const $t340=$dict([["infection",$item(e.get("fx"),"inf")],["disease_death",$item(e.get("fx"),"dth")],["military",$bin("Add",1,$item(e.get("fx"),"mil"))],["defense",$item(e.get("fx"),"dfn")],["wound_death",$item(e.get("fx"),"wnd")],["water",$item(e.get("fx"),"wat")],["air",$item(e.get("fx"),"air")],["contact",$item(e.get("fx"),"con")],["care",$item(e.get("fx"),"care")],["cure",$item(e.get("fx"),"cure")],["siege",$item(e.get("fx"),"siege")],["trade",$item(e.get("fx"),"trade")],["land",$item(e.get("fx"),"land")],["sea",$item(e.get("fx"),"sea")],["food",$item(e.get("fx"),"food")],["weapon",$item(e.get("fx"),"weapon")],["ship",$item(e.get("fx"),"ship")],["cart",$item(e.get("fx"),"cart")]]);e.set("result",$t340);}
{const $t341=$call(e.get("innovation_modifiers"),[e.get("country")],$dict([]));e.set("applied",$t341);}
for(const $t342 of $iter($tuple(["infection","disease_death","military"]))){e.set("key",$t342);$setitem(e.get("result"),e.get("key"),$aug("Mult",$item(e.get("result"),e.get("key")),$item(e.get("applied"),e.get("key"))));}
$call($get(e.get("result"),"update"),[new PD(((parent)=>{const e=new Env(parent);return (function*(){for(const $t343 of $iter($tuple(["production","research","logistics"]))){e.set("key",$t343);yield $tuple([e.get("key"),$item(e.get("applied"),e.get("key"))]);}})();})(e))],$dict([]));
$setitem(e.get("result"),"production",$aug("Mult",$item(e.get("result"),"production"),$bin("Add",1,$item(e.get("fx"),"prod"))));$setitem(e.get("result"),"research",$aug("Mult",$item(e.get("result"),"research"),$bin("Add",1,$item(e.get("fx"),"research"))));$setitem(e.get("result"),"logistics",$aug("Mult",$item(e.get("result"),"logistics"),$bin("Add",1,$item(e.get("fx"),"log"))));$setitem(e.get("result"),"wound_death",$aug("Mult",$item(e.get("result"),"wound_death"),$item(e.get("applied"),"disease_death")));return e.get("result");return null;}));
e.set("insight_of",$fn("insight_of",e,["country"],[undefined],null,null,[],[],e=>{if($truth($un("Not",$call(e.get("hasattr"),[e.get("country"),"insight"],$dict([]))))){{const $t344=$dict([]);$set(e.get("country"),"insight",$t344);}
}else{}
return $get(e.get("country"),"insight");return null;}));
e.set("boosted_of",$fn("boosted_of",e,["country"],[undefined],null,null,[],[],e=>{if($truth($un("Not",$call(e.get("hasattr"),[e.get("country"),"boosted"],$dict([]))))){{const $t345=$call(e.get("set"),[],$dict([]));$set(e.get("country"),"boosted",$t345);}
}else{}
return $get(e.get("country"),"boosted");return null;}));
e.set("pacts_of",$fn("pacts_of",e,["country"],[undefined],null,null,[],[],e=>{if($truth($un("Not",$call(e.get("hasattr"),[e.get("country"),"pacts"],$dict([]))))){{const $t346=$call(e.get("set"),[],$dict([]));$set(e.get("country"),"pacts",$t346);}
}else{}
return $get(e.get("country"),"pacts");return null;}));
e.set("end_pact",$fn("end_pact",e,["sim", "a", "b"],[undefined,undefined,undefined],null,null,[],[],e=>{$call($get($call(e.get("pacts_of"),[e.get("a")],$dict([])),"discard"),[$get(e.get("b"),"id")],$dict([]));
$call($get($call(e.get("pacts_of"),[e.get("b")],$dict([])),"discard"),[$get(e.get("a"),"id")],$dict([]));
return null;}));
e.set("learn",$fn("learn",e,["sim", "country", "name", "points"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{if($truth($boolop("Or",[()=>$compare([()=>e.get("name"),()=>$get(e.get("country"),"technologies")], ["In"]),()=>$un("Not",$call(e.get("tech_met"),[e.get("name"),$get(e.get("country"),"technologies")],$dict([])))]))){return 0.0;}else{}
{const $t347=$bin("Mult",e.get("points"),$item($call(e.get("technology_modifiers"),[e.get("country")],$dict([])),"research"));e.set("gain",$t347);}
if($truth($compare([()=>e.get("name"),()=>$call(e.get("boosted_of"),[e.get("country")],$dict([]))], ["In"]))){e.set("gain",$aug("Mult",e.get("gain"),2));}else{}
{const $t348=$call(e.get("min"),[e.get("gain"),$item($item(e.get("TECHNOLOGIES"),e.get("name")),1)],$dict([]));e.set("gain",$t348);}
{const $t349=$call(e.get("insight_of"),[e.get("country")],$dict([]));e.set("store",$t349);}
{const $t350=$bin("Add",$call($get(e.get("store"),"get"),[e.get("name"),0.0],$dict([])),e.get("gain"));$setitem(e.get("store"),e.get("name"),$t350);}
return e.get("gain");return null;}));
e.set("pass_on_knowledge",$fn("pass_on_knowledge",e,["sim", "giver", "taker", "fraction"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t351=$call($get(e.get("technology"),"learnable"),[$get(e.get("taker"),"technologies"),$get(e.get("giver"),"technologies")],$dict([]));e.set("ideas",$t351);}
if($truth($un("Not",e.get("ideas")))){return null;}else{}
{const $t352=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("ideas")],$dict([]));e.set("name",$t352);}
{const $t353=$call(e.get("getattr"),[e.get("taker"),"research_project",null],$dict([]));e.set("project",$t353);}
if($truth($boolop("And",[()=>$compare([()=>e.get("project"),()=>e.get("ideas")], ["In"]),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.5], ["Lt"])]))){{const $t354=e.get("project");e.set("name",$t354);}
}else{}
{const $t355=$item($item(e.get("TECHNOLOGIES"),e.get("name")),1);e.set("cost",$t355);}
{const $t356=$call(e.get("learn"),[e.get("sim"),e.get("taker"),e.get("name"),$bin("Mult",$call(e.get("min"),[0.8,$bin("Mult",e.get("fraction"),$item($call(e.get("technology_modifiers"),[e.get("giver")],$dict([])),"production"))],$dict([])),e.get("cost"))],$dict([]));e.set("gain",$t356);}
if($truth($compare([()=>e.get("gain"),()=>0], ["LtE"]))){return null;}else{}
return $tuple([e.get("name"),$bin("Div",e.get("gain"),e.get("cost"))]);return null;}));
e.set("settle_insight",$fn("settle_insight",e,["sim", "country", "adults"],[undefined,undefined,undefined],null,null,[],[],e=>{{const $t357=$call(e.get("insight_of"),[e.get("country")],$dict([]));e.set("store",$t357);}
for(const $t358 of $iter($call(e.get("sorted"),[e.get("store")],$dict([])))){e.set("name",$t358);if($truth($compare([()=>e.get("name"),()=>$get(e.get("country"),"technologies")], ["In"]))){$call($get(e.get("store"),"pop"),[e.get("name"),null],$dict([]));
}else{if($truth($boolop("And",[()=>$compare([()=>$item(e.get("store"),e.get("name")),()=>$item($item(e.get("TECHNOLOGIES"),e.get("name")),1)], ["GtE"]),()=>$call(e.get("tech_met"),[e.get("name"),$get(e.get("country"),"technologies")],$dict([]))]))){$call($get(e.get("store"),"pop"),[e.get("name"),null],$dict([]));
$call(e.get("unlock"),[e.get("sim"),e.get("country"),e.get("name"),$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("adults")],$dict([]))],$dict([["borrowed",true]]));
}else{}
}
}
return null;}));
e.set("choose_project",$fn("choose_project",e,["sim", "country", "available", "busy"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t359=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t360 of $iter(e.get("available"))){e.set("t",$t360);if($truth($compare([()=>e.get("t"),()=>$call(e.get("boosted_of"),[e.get("country")],$dict([]))], ["In"]))){yield e.get("t");}}})();})(e));e.set("favoured",$t359);}
if($truth($boolop("And",[()=>e.get("favoured"),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.6], ["Lt"])]))){return $call($get($get(e.get("sim"),"rng"),"choice"),[$call(e.get("sorted"),[e.get("favoured")],$dict([]))],$dict([]));}else{}
e.set("profile",$get($import("geography"),"profile"));e.set("trait",$get($import("governments"),"trait"));{const $t361=$call(e.get("profile"),[e.get("sim"),$get(e.get("country"),"id")],$dict([]));e.set("prof",$t361);}
{const $t362=new PD(((parent)=>{const e=new Env(parent);return (function*(){for(const $t363 of $iter(e.get("BRANCHES"))){e.set("b",$t363);yield $tuple([e.get("b"),0.0]);}})();})(e));e.set("need",$t362);}
{const $t364=($truth($boolop("Or",[()=>$compare([()=>$get(e.get("country"),"food"),()=>55], ["Lt"]),()=>$compare([()=>"Famine",()=>$get(e.get("country"),"conditions")], ["In"])]))?3.0:0.5);$setitem(e.get("need"),"agriculture",$t364);}
{const $t365=($truth($get(e.get("country"),"sickness"))?3.5:0.6);$setitem(e.get("need"),"medicine",$t365);}
{const $t366=($truth($compare([()=>$get(e.get("country"),"id"),()=>e.get("busy")], ["In"]))?3.5:$bin("Add",0.3,($truth($compare([()=>$get(e.get("country"),"government"),()=>$tuple(["junta","empire","tyranny","tribal"])], ["In"]))?1.0:0)));$setitem(e.get("need"),"warfare",$t366);}
{const $t367=$bin("Add",0.6,$bin("Mult",1.5,$item(e.get("prof"),"mountain")));$setitem(e.get("need"),"industry",$t367);}
{const $t368=$bin("Mult",2.2,$item(e.get("prof"),"coastal"));$setitem(e.get("need"),"seafaring",$t368);}
{const $t369=($truth($compare([()=>$call(e.get("getattr"),[e.get("country"),"treasury",0.0],$dict([])),()=>500], ["Lt"]))?1.5:0.6);$setitem(e.get("need"),"trade",$t369);}
{const $t370=$bin("Add",1.0,$bin("Mult",$call(e.get("max"),[0.0,$call(e.get("trait"),[e.get("country"),"research"],$dict([]))],$dict([])),8));$setitem(e.get("need"),"knowledge",$t370);}
{const $t371=($truth($compare([()=>$get(e.get("country"),"stability"),()=>50], ["Lt"]))?1.8:0.4);$setitem(e.get("need"),"governance",$t371);}
{const $t372=$bin("Add",$bin("Add",0.5,$bin("Mult",1.2,$item(e.get("prof"),"mountain"))),$bin("Mult",0.6,$item(e.get("prof"),"forest")));$setitem(e.get("need"),"energy",$t372);}
{const $t373=$call(e.get("getattr"),[e.get("country"),"last_disaster_year",null],$dict([]));e.set("recent",$t373);}
{const $t374=($truth($boolop("And",[()=>$compare([()=>e.get("recent"),()=>null], ["IsNot"]),()=>$compare([()=>$bin("Sub",$get(e.get("sim"),"year"),e.get("recent")),()=>6], ["LtE"])]))?1.8:0.7);$setitem(e.get("need"),"construction",$t374);}
{const $t375=$bin("Add",0.8,($truth($compare([()=>$get(e.get("country"),"stability"),()=>45], ["Lt"]))?1.6:0));$setitem(e.get("need"),"culture",$t375);}
{const $t376=$call(e.get("era_index"),[$get(e.get("country"),"technologies")],$dict([]));e.set("era",$t376);}
return $call($get(e.get("technology"),"choose"),[$get(e.get("sim"),"rng"),e.get("available"),$get(e.get("country"),"technologies"),e.get("need"),e.get("era")],$dict([]));return null;}));
e.set("advance_research",$fn("advance_research",e,["sim", "country", "adults", "groups", "busy"],[undefined,undefined,undefined,undefined,undefined],null,null,[],[],e=>{$call(e.get("settle_insight"),[e.get("sim"),e.get("country"),e.get("adults")],$dict([]));
{const $t377=$call($get(e.get("technology"),"researchable"),[$get(e.get("country"),"technologies")],$dict([]));e.set("available",$t377);}
{const $t378=($truth($get(e.get("country"),"sickness"))?"medicine":($truth($compare([()=>$get(e.get("country"),"id"),()=>e.get("busy")], ["In"]))?"military":"civilian"));$set(e.get("country"),"research_focus",$t378);}
{const $t379=$call(e.get("getattr"),[e.get("country"),"research_project",null],$dict([]));e.set("project",$t379);}
if($truth($compare([()=>e.get("project"),()=>e.get("available")], ["NotIn"]))){{const $t380=($truth(e.get("available"))?$call(e.get("choose_project"),[e.get("sim"),e.get("country"),e.get("available"),e.get("busy")],$dict([])):null);e.set("project",$t380);}
{const $t381=e.get("project");$set(e.get("country"),"research_project",$t381);}
if($truth(e.get("project"))){$call($get(e.get("sim"),"record"),[($fmt($get(e.get("country"),"name"),-1,null)+" began a research project on "+$fmt(e.get("project"),-1,null)+" "+$fmt($call($get(e.get("technology"),"reason"),[$call($get(e.get("technology"),"branch_of"),[e.get("project")],$dict([]))],$dict([])),-1,null)+"."),"discovery"],$dict([]));
}else{}
}else{}
{const $t382=($truth($get(e.get("country"),"sickness"))?"medicine":($truth($compare([()=>$get(e.get("country"),"id"),()=>e.get("busy")], ["In"]))?"military":"civilian"));$set(e.get("country"),"research_focus",$t382);}
{const $t383=$call(e.get("min"),[2.5,$bin("Add",0.2,$bin("Div",$get(e.get("country"),"prosperity"),50))],$dict([]));$set(e.get("country"),"research_budget",$t383);}
{const $t384=$call(e.get("clamp"),[$bin("Sub",$get(e.get("country"),"prosperity"),$bin("Mult",$get(e.get("country"),"research_budget"),0.2))],$dict([]));$set(e.get("country"),"prosperity",$t384);}
{const $t385=$bin("Mult",$bin("Add",0.5,$call(e.get("min"),[5,$bin("Div",$call(e.get("len"),[e.get("adults")],$dict([])),80)],$dict([]))),$bin("Add",0.5,$bin("Div",$get(e.get("country"),"prosperity"),100)));e.set("rate",$t385);}
e.set("rate",$aug("Mult",e.get("rate"),$item($call(e.get("technology_modifiers"),[e.get("country")],$dict([])),"research")));e.set("state",$get($import("systems"),"state"));e.set("rate",$aug("Mult",e.get("rate"),$item($call(e.get("state"),[e.get("sim"),$get(e.get("country"),"id")],$dict([])),"research")));$set(e.get("country"),"research",$aug("Add",$get(e.get("country"),"research"),$bin("Mult",$bin("Mult",e.get("rate"),($truth($compare([()=>$get(e.get("country"),"id"),()=>e.get("busy")], ["In"]))?0.65:1)),($truth($compare([()=>e.get("project"),()=>$call(e.get("boosted_of"),[e.get("country")],$dict([]))], ["In"]))?2:1))));{const $t386=$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([]));e.set("roll",$t386);}
if($truth($boolop("And",[()=>e.get("project"),()=>$compare([()=>e.get("roll"),()=>0.14], ["Lt"])]))){{const $t387=$call($get($get(e.get("sim"),"rng"),"uniform"),[2,7],$dict([]));e.set("bonus",$t387);}
$set(e.get("country"),"research",$aug("Add",$get(e.get("country"),"research"),e.get("bonus")));$call($get(e.get("sim"),"record"),[("An experiment in "+$fmt($get(e.get("country"),"name"),-1,null)+" advanced "+$fmt(e.get("project"),-1,null)+" by "+$fmt(e.get("bonus"),-1,(".1f"))+" research points."),"discovery"],$dict([]));
}else{if($truth($boolop("And",[()=>e.get("project"),()=>$compare([()=>e.get("roll"),()=>0.22], ["Lt"])]))){{const $t388=$call(e.get("min"),[$get(e.get("country"),"research"),$call($get($get(e.get("sim"),"rng"),"uniform"),[1,4],$dict([]))],$dict([]));e.set("loss",$t388);}
$set(e.get("country"),"research",$aug("Sub",$get(e.get("country"),"research"),e.get("loss")));$call($get(e.get("sim"),"record"),[("Failed trials in "+$fmt($get(e.get("country"),"name"),-1,null)+" cost "+$fmt(e.get("loss"),-1,(".1f"))+" research points on "+$fmt(e.get("project"),-1,null)+"."),"discovery"],$dict([]));
}else{}
}
{const $t389=($truth(e.get("project"))?$call($get($call(e.get("insight_of"),[e.get("country")],$dict([])),"get"),[e.get("project"),0.0],$dict([])):0.0);e.set("banked",$t389);}
if($truth($boolop("And",[()=>e.get("project"),()=>$compare([()=>$bin("Add",$get(e.get("country"),"research"),e.get("banked")),()=>$item($item(e.get("TECHNOLOGIES"),e.get("project")),1)], ["GtE"])]))){{const $t390=$call(e.get("min"),[e.get("banked"),$item($item(e.get("TECHNOLOGIES"),e.get("project")),1)],$dict([]));e.set("used",$t390);}
{const $t391=$call(e.get("max"),[0.0,$bin("Sub",$get(e.get("country"),"research"),$bin("Sub",$item($item(e.get("TECHNOLOGIES"),e.get("project")),1),e.get("used")))],$dict([]));$set(e.get("country"),"research",$t391);}
$call(e.get("unlock"),[e.get("sim"),e.get("country"),e.get("project"),$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("adults")],$dict([]))],$dict([]));
{const $t392=null;$set(e.get("country"),"research_project",$t392);}
}else{}
{const $t393=$get(e.get("country"),"research");$set(e.get("country"),"research_progress",$t393);}
e.set("contacts",$get($import("geography"),"contacts"));{const $t394=$call(e.get("contacts"),[e.get("sim")],$dict([]));{const $t395=Array.from($iter($t394));e.set("land",$t395[0]);e.set("sea",$t395[1]);}}
{const $t396=$call(e.get("set"),[$call($get(e.get("land"),"get"),[$get(e.get("country"),"id"),$call(e.get("set"),[],$dict([]))],$dict([]))],$dict([]));e.set("reachable",$t396);}
if($truth($compare([()=>"sailing",()=>$get(e.get("country"),"technologies")], ["In"]))){$call($get(e.get("reachable"),"update"),[$call($get(e.get("sea"),"get"),[$get(e.get("country"),"id"),$call(e.get("set"),[],$dict([]))],$dict([]))],$dict([]));
}else{}
{const $t397=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t398 of $iter(e.get("groups"))){e.set("cid",$t398);if($truth($boolop("And",[()=>$compare([()=>e.get("cid"),()=>$get(e.get("country"),"id")], ["NotEq"]),()=>$compare([()=>e.get("cid"),()=>e.get("reachable")], ["In"]),()=>$compare([()=>e.get("cid"),()=>e.get("busy")], ["NotIn"]),()=>$compare([()=>$get(e.get("country"),"id"),()=>e.get("busy")], ["NotIn"])]))){yield $item($get(e.get("sim"),"countries"),e.get("cid"));}}})();})(e));e.set("partners",$t397);}
if($truth($boolop("And",[()=>e.get("partners"),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>$bin("Mult",0.18,$call(e.get("min"),[2.5,$bin("Add",0.6,$bin("Mult",0.5,$item($call(e.get("state"),[e.get("sim"),$get(e.get("country"),"id")],$dict([])),"trade")))],$dict([])))], ["Lt"])]))){{const $t399=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("partners")],$dict([]));e.set("partner",$t399);}
$call(e.get("share_innovation"),[e.get("sim"),e.get("partner"),e.get("country"),e.get("adults")],$dict([]));
{const $t400=$bin("Add",$call(e.get("era_index"),[$get(e.get("country"),"technologies")],$dict([])),e.get("MAX_LEAD"));e.set("top",$t400);}
{const $t401=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t402 of $iter($bin("Sub",$get(e.get("partner"),"technologies"),$get(e.get("country"),"technologies")))){e.set("t",$t402);if($truth($boolop("And",[()=>$call($get(e.get("technology"),"met"),[e.get("t"),$get(e.get("country"),"technologies")],$dict([])),()=>$compare([()=>$call($get(e.get("technology"),"era_of_tech"),[e.get("t")],$dict([])),()=>e.get("top")], ["LtE"])]))){yield e.get("t");}}})();})(e));e.set("ideas",$t401);}
if($truth(e.get("ideas"))){{const $t403=$call($get($get(e.get("sim"),"rng"),"choice"),[$call(e.get("sorted"),[e.get("ideas")],$dict([]))],$dict([]));e.set("idea",$t403);}
$call(e.get("unlock"),[e.get("sim"),e.get("country"),e.get("idea"),$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("adults")],$dict([]))],$dict([["borrowed",true]]));
$call($get(e.get("sim"),"record"),[("Teachers from "+$fmt($get(e.get("partner"),"name"),-1,null)+" shared methods with "+$fmt($get(e.get("country"),"name"),-1,null)+"; both gained research experience."),"discovery"],$dict([]));
$set(e.get("country"),"research",$aug("Add",$get(e.get("country"),"research"),1));$set(e.get("partner"),"research",$aug("Add",$get(e.get("partner"),"research"),1));}else{}
}else{}
if($truth($boolop("And",[()=>e.get("partners"),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.85], ["Lt"])]))){$call(e.get("pass_on_knowledge"),[e.get("sim"),$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("partners")],$dict([])),e.get("country"),0.7],$dict([]));
}else{}
for(const $t404 of $iter($call(e.get("sorted"),[$call(e.get("pacts_of"),[e.get("country")],$dict([]))],$dict([])))){e.set("pid",$t404);{const $t405=$call($get($get(e.get("sim"),"countries"),"get"),[e.get("pid")],$dict([]));e.set("friend",$t405);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("friend"),()=>null], ["Is"]),()=>$compare([()=>$get(e.get("friend"),"ended"),()=>null], ["IsNot"]),()=>$compare([()=>$call(e.get("tuple"),[$call(e.get("sorted"),[$tuple([e.get("pid"),$get(e.get("country"),"id")])],$dict([]))],$dict([])),()=>$get(e.get("sim"),"wars")], ["In"])]))){continue;}else{}
if($truth($compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.9], ["Lt"]))){$call(e.get("pass_on_knowledge"),[e.get("sim"),e.get("friend"),e.get("country"),0.5],$dict([]));
}else{}
}
if($truth($boolop("And",[()=>e.get("partners"),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.015], ["Lt"])]))){{const $t406=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("partners")],$dict([]));e.set("friend",$t406);}
if($truth($compare([()=>$get(e.get("friend"),"id"),()=>$call(e.get("pacts_of"),[e.get("country")],$dict([]))], ["NotIn"]))){$call($get($call(e.get("pacts_of"),[e.get("country")],$dict([])),"add"),[$get(e.get("friend"),"id")],$dict([]));
$call($get($call(e.get("pacts_of"),[e.get("friend")],$dict([])),"add"),[$get(e.get("country"),"id")],$dict([]));
$call($get(e.get("sim"),"record"),[($fmt($get(e.get("country"),"name"),-1,null)+" and "+$fmt($get(e.get("friend"),"name"),-1,null)+" agreed to share what they learn."),"discovery"],$dict([]));
}else{}
}else{}
return null;}));
e.set("clamp",$fn("clamp",e,["value"],[undefined],null,null,[],[],e=>{return $call(e.get("max"),[0,$call(e.get("min"),[100,e.get("value")],$dict([]))],$dict([]));return null;}));
e.set("choose_ruler",$fn("choose_ruler",e,["sim", "country", "adults"],[undefined,undefined,undefined],null,null,[],[],e=>{e.set("info",$get($import("governments"),"info"));{const $t407=$call(e.get("info"),[$get(e.get("country"),"government")],$dict([]));e.set("form",$t407);}
{const $t408=$call($get($get(e.get("sim"),"archive"),"get"),[$get(e.get("country"),"ruler")],$dict([]));e.set("previous",$t408);}
{const $t409=($truth($boolop("And",[()=>e.get("previous"),()=>$compare([()=>$item(e.get("form"),"succession"),()=>"hereditary"], ["Eq"])]))?Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t410 of $iter(e.get("adults"))){e.set("p",$t410);if($truth($compare([()=>$get(e.get("previous"),"id"),()=>$get(e.get("p"),"parents")], ["In"]))){yield e.get("p");}}})();})(e)):[]);e.set("heirs",$t409);}
if($truth(e.get("heirs"))){{const $t411=$call(e.get("max"),[e.get("heirs")],$dict([["key",$fn("<lambda>",e,["p"],[undefined],null,null,[],[],e=>{return $get(e.get("p"),"age");return null;})]]));e.set("ruler",$t411);}
}else{if($truth($compare([()=>$item(e.get("form"),"succession"),()=>$tuple(["fame","seizure"])], ["In"]))){{const $t412=$call(e.get("max"),[e.get("adults")],$dict([["key",$fn("<lambda>",e,["p"],[undefined],null,null,[],[],e=>{return $tuple([$call(e.get("getattr"),[e.get("p"),"fame",0],$dict([])),$get(e.get("p"),"id")]);return null;})]]));e.set("ruler",$t412);}
}else{if($truth($compare([()=>$item(e.get("form"),"succession"),()=>"wealth"], ["Eq"]))){{const $t413=$call(e.get("max"),[e.get("adults")],$dict([["key",$fn("<lambda>",e,["p"],[undefined],null,null,[],[],e=>{return $tuple([$call(e.get("getattr"),[e.get("p"),"wealth",0],$dict([])),$get(e.get("p"),"id")]);return null;})]]));e.set("ruler",$t413);}
}else{if($truth($compare([()=>$item(e.get("form"),"succession"),()=>"divine"], ["Eq"]))){{const $t414=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t415 of $iter(e.get("adults"))){e.set("p",$t415);if($truth($compare([()=>$call(e.get("getattr"),[e.get("p"),"job",""],$dict([])),()=>$tuple(["healer","teacher","scientist","scholar"])], ["In"]))){yield e.get("p");}}})();})(e));e.set("clergy",$t414);}
{const $t416=$call($get($get(e.get("sim"),"rng"),"choice"),[($truth(e.get("clergy"))?e.get("clergy"):e.get("adults"))],$dict([]));e.set("ruler",$t416);}
}else{{const $t417=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("adults")],$dict([]));e.set("ruler",$t417);}
}
}
}
}
{const $t418=$get(e.get("ruler"),"id");$set(e.get("country"),"ruler",$t418);}
{const $t419=$get(e.get("sim"),"year");$set(e.get("country"),"last_election",$t419);}
{const $t420=($truth(e.get("heirs"))?$call($get(e.get("form"),"get"),["heir",$item(e.get("form"),"verb")],$dict([])):$item(e.get("form"),"verb"));e.set("action",$t420);}
$call($get(e.get("sim"),"record"),[($fmt($call($get(e.get("sim"),"person_reference"),[e.get("ruler")],$dict([])),-1,null)+" "+$fmt(e.get("action"),-1,null)+" in "+$fmt($get(e.get("country"),"name"),-1,null)+".")],$dict([]));
return null;}));
e.set("maintain_rulers",$fn("maintain_rulers",e,["sim"],[undefined],null,null,[],[],e=>{{const $t421=$dict([]);e.set("groups",$t421);}
for(const $t422 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("person",$t422);if($truth($compare([()=>$get(e.get("person"),"age"),()=>18], ["GtE"]))){$call($get($call($get(e.get("groups"),"setdefault"),[$get(e.get("person"),"country"),[]],$dict([])),"append"),[e.get("person")],$dict([]));
}else{}
}
for(const $t423 of $iter($call($get($get(e.get("sim"),"countries"),"values"),[],$dict([])))){e.set("country",$t423);if($truth($compare([()=>$get(e.get("country"),"ended"),()=>null], ["IsNot"]))){{const $t424=null;$set(e.get("country"),"ruler",$t424);}
continue;}else{}
{const $t425=$call($get($get(e.get("sim"),"people"),"get"),[$get(e.get("country"),"ruler")],$dict([]));e.set("current",$t425);}
if($truth($boolop("And",[()=>e.get("current"),()=>$compare([()=>$get(e.get("current"),"country"),()=>$get(e.get("country"),"id")], ["Eq"])]))){continue;}else{}
{const $t426=$call($get(e.get("groups"),"get"),[$get(e.get("country"),"id"),[]],$dict([]));e.set("adults",$t426);}
if($truth(e.get("adults"))){$call(e.get("choose_ruler"),[e.get("sim"),e.get("country"),e.get("adults")],$dict([]));
}else{{const $t427=null;$set(e.get("country"),"ruler",$t427);}
}
}
return null;}));
e.set("unlock",$fn("unlock",e,["sim", "country", "technology", "actor", "borrowed"],[undefined,undefined,undefined,undefined,false],null,null,[],[],e=>{if($truth($boolop("Or",[()=>$compare([()=>e.get("technology"),()=>$get(e.get("country"),"technologies")], ["In"]),()=>$un("Not",$call(e.get("tech_met"),[e.get("technology"),$get(e.get("country"),"technologies")],$dict([])))]))){return false;}else{}
$call($get($get(e.get("country"),"technologies"),"add"),[e.get("technology")],$dict([]));
$call($get($call(e.get("insight_of"),[e.get("country")],$dict([])),"pop"),[e.get("technology"),null],$dict([]));
{const $t428=$bin("Sub",$call(e.get("boosted_of"),[e.get("country")],$dict([])),new PS([e.get("technology")]));$set(e.get("country"),"boosted",$t428);}
{const $t429=$call(e.get("era_index"),[$bin("Sub",$get(e.get("country"),"technologies"),new PS([e.get("technology")]))],$dict([]));e.set("before_era",$t429);}
if($truth($compare([()=>e.get("technology"),()=>e.get("FOOD_TECHS")], ["In"]))){{const $t430=$call(e.get("max"),[1,$call(e.get("int"),[$bin("Mult",$get(e.get("country"),"capacity"),1.05)],$dict([]))],$dict([]));$set(e.get("country"),"capacity",$t430);}
{const $t431=$call(e.get("clamp"),[$bin("Add",$get(e.get("country"),"food"),8)],$dict([]));$set(e.get("country"),"food",$t431);}
}else{}
if($truth($compare([()=>e.get("technology"),()=>e.get("INDUSTRY_TECHS")], ["In"]))){{const $t432=$call(e.get("clamp"),[$bin("Add",$get(e.get("country"),"prosperity"),4)],$dict([]));$set(e.get("country"),"prosperity",$t432);}
}else{}
if($truth($compare([()=>e.get("technology"),()=>e.get("KNOWLEDGE_TECHS")], ["In"]))){$set(e.get("country"),"research",$aug("Add",$get(e.get("country"),"research"),1));}else{}
if($truth($boolop("Or",[()=>$compare([()=>e.get("technology"),()=>e.get("CARE_TECHS")], ["In"]),()=>$compare([()=>e.get("technology"),()=>"quarantine"], ["Eq"])]))){{const $t433=$call(e.get("clamp"),[$bin("Add",$get(e.get("country"),"stability"),3)],$dict([]));$set(e.get("country"),"stability",$t433);}
}else{}
{const $t434=($truth(e.get("borrowed"))?"introduced":"developed");e.set("verb",$t434);}
{const $t435=$call(e.get("min"),[100,$bin("Add",$call(e.get("getattr"),[e.get("actor"),"fame",0],$dict([])),($truth(e.get("borrowed"))?5:12))],$dict([]));$set(e.get("actor"),"fame",$t435);}
{const $t436="scholar";$set(e.get("actor"),"job",$t436);}
$call($get(e.get("sim"),"record"),[($fmt($call($get(e.get("sim"),"person_reference"),[e.get("actor")],$dict([])),-1,null)+" "+$fmt(e.get("verb"),-1,null)+" "+$fmt(e.get("technology"),-1,null)+" in "+$fmt($get(e.get("country"),"name"),-1,null)+", bringing "+$fmt($item($item(e.get("TECHNOLOGIES"),e.get("technology")),2),-1,null)+"."),"discovery"],$dict([]));
{const $t437=$call(e.get("era_index"),[$get(e.get("country"),"technologies")],$dict([]));e.set("after_era",$t437);}
if($truth($compare([()=>e.get("after_era"),()=>e.get("before_era")], ["Gt"]))){$call($get(e.get("sim"),"record"),[($fmt($get(e.get("country"),"name"),-1,null)+" entered the "+$fmt($item(e.get("ERAS"),e.get("after_era")),-1,null)+"."),"discovery"],$dict([]));
}else{}
return true;return null;}));
e.set("develop_societies",$fn("develop_societies",e,["sim"],[undefined],null,null,[],[],e=>{$call(e.get("maintain_rulers"),[e.get("sim")],$dict([]));
{const $t438=$dict([]);e.set("groups",$t438);}
for(const $t439 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("person",$t439);$call($get($call($get(e.get("groups"),"setdefault"),[$get(e.get("person"),"country"),[]],$dict([])),"append"),[e.get("person")],$dict([]));
}
{const $t440=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t442 of $iter($get(e.get("sim"),"wars"))){e.set("pair",$t442);for(const $t441 of $iter(e.get("pair"))){e.set("cid",$t441);yield e.get("cid");}}})();})(e));e.set("busy",$t440);}
for(const $t443 of $iter($call($get(e.get("groups"),"items"),[],$dict([])))){{const $t444=Array.from($iter($t443));e.set("cid",$t444[0]);e.set("residents",$t444[1]);}{const $t445=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t445);}
{const $t446=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t447 of $iter(e.get("residents"))){e.set("p",$t447);if($truth($compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"]))){yield e.get("p");}}})();})(e));e.set("adults",$t446);}
if($truth($un("Not",e.get("adults")))){continue;}else{}
{const $t448=$bin("Add",60,$call(e.get("min"),[22,$item($call(e.get("technology_modifiers"),[e.get("country")],$dict([])),"food")],$dict([])));e.set("food_target",$t448);}
e.set("food_target",$aug("Sub",e.get("food_target"),$bin("Mult",25,$call(e.get("bool"),[$bin("BitAnd",$get(e.get("country"),"conditions"),new PS(["Famine","Drought"]))],$dict([])))));e.set("food_target",$aug("Sub",e.get("food_target"),$bin("Mult",10,$compare([()=>e.get("cid"),()=>e.get("busy")], ["In"]))));{const $t449=$item($call(e.get("technology_modifiers"),[e.get("country")],$dict([])),"production");e.set("production",$t449);}
e.set("food_target",$aug("Add",e.get("food_target"),$call(e.get("min"),[14,$bin("Mult",$bin("Sub",e.get("production"),1),10)],$dict([]))));e.set("profile",$get($import("geography"),"profile"));e.set("contacts",$get($import("geography"),"contacts"));e.set("food_effect",$get($import("economy"),"food_effect"));e.set("system_state",$get($import("systems"),"state"));e.set("food_target",$aug("Add",e.get("food_target"),$item($call(e.get("system_state"),[e.get("sim"),e.get("cid")],$dict([])),"food_delta")));e.set("food_target",$aug("Add",e.get("food_target"),$call(e.get("food_effect"),[e.get("sim"),e.get("cid")],$dict([]))));e.set("food_target",$aug("Add",e.get("food_target"),$bin("Mult",$bin("Sub",$item($call(e.get("profile"),[e.get("sim"),e.get("cid")],$dict([])),"fertility"),1.0),25)));{const $t450=$call(e.get("clamp"),[$bin("Add",$get(e.get("country"),"food"),$bin("Mult",$bin("Sub",e.get("food_target"),$get(e.get("country"),"food")),0.15))],$dict([]));$set(e.get("country"),"food",$t450);}
{const $t451=$call(e.get("clamp"),[$bin("Add",$get(e.get("country"),"prosperity"),($truth($compare([()=>e.get("cid"),()=>e.get("busy")], ["NotIn"]))?$bin("Mult",0.5,e.get("production")):$un("USub",2)))],$dict([]));$set(e.get("country"),"prosperity",$t451);}
{const $t452=$call(e.get("clamp"),[$bin("Sub",$bin("Add",$get(e.get("country"),"stability"),($truth($compare([()=>$get(e.get("country"),"food"),()=>40], ["GtE"]))?0.5:$un("USub",2))),($truth($compare([()=>e.get("cid"),()=>e.get("busy")], ["In"]))?2:0))],$dict([]));$set(e.get("country"),"stability",$t452);}
e.set("government_info",$get($import("governments"),"info"));{const $t453=$item($call(e.get("government_info"),[$get(e.get("country"),"government")],$dict([])),"term");e.set("term",$t453);}
if($truth($boolop("And",[()=>e.get("term"),()=>$compare([()=>$bin("Sub",$get(e.get("sim"),"year"),$get(e.get("country"),"last_election")),()=>e.get("term")], ["GtE"])]))){$call(e.get("choose_ruler"),[e.get("sim"),e.get("country"),e.get("adults")],$dict([]));
}else{}
$call(e.get("advance_research"),[e.get("sim"),e.get("country"),e.get("adults"),e.get("groups"),e.get("busy")],$dict([]));
$call(e.get("advance_innovations"),[e.get("sim"),e.get("country"),e.get("adults")],$dict([]));
if($truth($compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.7], ["GtE"]))){continue;}else{}
if($truth($compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.85], ["Lt"]))){$call(e.get("run_catalog_event"),[e.get("sim"),e.get("country"),e.get("adults"),e.get("groups"),e.get("busy")],$dict([]));
continue;}else{}
{const $t454=["harvest","festival","corruption","reform","tax","poem"];e.set("choices",$t454);}
if($truth($compare([()=>$get(e.get("country"),"food"),()=>45], ["Lt"]))){e.set("choices",$aug("Add",e.get("choices"),["relief","relief"]));}else{}
if($truth($compare([()=>$get(e.get("country"),"stability"),()=>40], ["Lt"]))){e.set("choices",$aug("Add",e.get("choices"),["protest","protest"]));}else{}
if($truth($boolop("And",[()=>$compare([()=>$get(e.get("country"),"stability"),()=>25], ["Lt"]),()=>$compare([()=>$get(e.get("country"),"government"),()=>$tuple(["monarchy","empire","tyranny","tribal"])], ["In"])]))){e.set("choices",$aug("Add",e.get("choices"),["revolution"]));}else{}
if($truth($boolop("And",[()=>$compare([()=>$get(e.get("country"),"prosperity"),()=>45], ["GtE"]),()=>$compare([()=>"writing",()=>$get(e.get("country"),"technologies")], ["In"])]))){e.set("choices",$aug("Add",e.get("choices"),["school"]));}else{}
{const $t455=$call(e.get("contacts"),[e.get("sim")],$dict([]));{const $t456=Array.from($iter($t455));e.set("land",$t456[0]);e.set("sea",$t456[1]);}}
{const $t457=$call(e.get("set"),[$call($get(e.get("land"),"get"),[e.get("cid"),$call(e.get("set"),[],$dict([]))],$dict([]))],$dict([]));e.set("reachable",$t457);}
if($truth($compare([()=>"sailing",()=>$get(e.get("country"),"technologies")], ["In"]))){$call($get(e.get("reachable"),"update"),[$call($get(e.get("sea"),"get"),[e.get("cid"),$call(e.get("set"),[],$dict([]))],$dict([]))],$dict([]));
}else{}
{const $t458=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t459 of $iter(e.get("groups"))){e.set("other",$t459);if($truth($boolop("And",[()=>$compare([()=>e.get("other"),()=>e.get("cid")], ["NotEq"]),()=>$compare([()=>e.get("other"),()=>e.get("reachable")], ["In"]),()=>$compare([()=>e.get("other"),()=>e.get("busy")], ["NotIn"]),()=>$compare([()=>e.get("cid"),()=>e.get("busy")], ["NotIn"])]))){yield e.get("other");}}})();})(e));e.set("partners",$t458);}
if($truth(e.get("partners"))){e.set("choices",$aug("Add",e.get("choices"),["trade","trade"]));}else{}
{const $t460=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("choices")],$dict([]));e.set("event",$t460);}
{const $t461=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("adults")],$dict([]));e.set("actor",$t461);}
{const $t462=$call($get(e.get("sim"),"person_reference"),[e.get("actor")],$dict([]));e.set("who",$t462);}
{const $t463=$get(e.get("country"),"name");e.set("place",$t463);}
if($truth($compare([()=>e.get("event"),()=>"harvest"], ["Eq"]))){$set(e.get("country"),"food",$aug("Add",$get(e.get("country"),"food"),12));{const $t464=("Farmers in "+$fmt(e.get("place"),-1,null)+" gathered an exceptional harvest; food reserves grew.");e.set("message",$t464);}
}else{if($truth($compare([()=>e.get("event"),()=>"festival"], ["Eq"]))){$set(e.get("country"),"prosperity",$aug("Sub",$get(e.get("country"),"prosperity"),2));$set(e.get("country"),"stability",$aug("Add",$get(e.get("country"),"stability"),6));{const $t465=("A public festival in "+$fmt(e.get("place"),-1,null)+" eased local tensions.");e.set("message",$t465);}
}else{if($truth($compare([()=>e.get("event"),()=>"corruption"], ["Eq"]))){$set(e.get("country"),"prosperity",$aug("Sub",$get(e.get("country"),"prosperity"),6));$set(e.get("country"),"stability",$aug("Sub",$get(e.get("country"),"stability"),8));{const $t466=("Officials in "+$fmt(e.get("place"),-1,null)+" were caught diverting public funds; trust in government fell.");e.set("message",$t466);}
}else{if($truth($compare([()=>e.get("event"),()=>"reform"], ["Eq"]))){$set(e.get("country"),"stability",$aug("Add",$get(e.get("country"),"stability"),7));$set(e.get("country"),"prosperity",$aug("Sub",$get(e.get("country"),"prosperity"),3));{const $t467=($fmt(e.get("place"),-1,null)+" established public hearings for legal disputes.");e.set("message",$t467);}
}else{if($truth($compare([()=>e.get("event"),()=>"tax"], ["Eq"]))){$set(e.get("country"),"prosperity",$aug("Sub",$get(e.get("country"),"prosperity"),5));$set(e.get("country"),"stability",$aug("Sub",$get(e.get("country"),"stability"),6));$set(e.get("country"),"research",$aug("Add",$get(e.get("country"),"research"),2));{const $t468=($fmt(e.get("place"),-1,null)+" imposed new taxes to fund public works, provoking resentment.");e.set("message",$t468);}
}else{if($truth($compare([()=>e.get("event"),()=>"poem"], ["Eq"]))){$set(e.get("country"),"stability",$aug("Add",$get(e.get("country"),"stability"),3));{const $t469=($fmt(e.get("who"),-1,null)+" composed an epic that became popular across "+$fmt(e.get("place"),-1,null)+".");e.set("message",$t469);}
}else{if($truth($compare([()=>e.get("event"),()=>"relief"], ["Eq"]))){$set(e.get("country"),"food",$aug("Add",$get(e.get("country"),"food"),15));$set(e.get("country"),"prosperity",$aug("Sub",$get(e.get("country"),"prosperity"),8));$set(e.get("country"),"stability",$aug("Add",$get(e.get("country"),"stability"),4));{const $t470=($fmt(e.get("place"),-1,null)+" distributed emergency food supplies at public expense.");e.set("message",$t470);}
}else{if($truth($compare([()=>e.get("event"),()=>"protest"], ["Eq"]))){$set(e.get("country"),"stability",$aug("Sub",$get(e.get("country"),"stability"),5));$set(e.get("country"),"prosperity",$aug("Sub",$get(e.get("country"),"prosperity"),3));{const $t471=("Protesters in "+$fmt(e.get("place"),-1,null)+" disrupted markets and demanded political reform.");e.set("message",$t471);}
}else{if($truth($compare([()=>e.get("event"),()=>"revolution"], ["Eq"]))){e.set("government_info",$get($import("governments"),"info"));{const $t472=$call($get($item($call(e.get("government_info"),[$get(e.get("country"),"government")],$dict([])),"label"),"lower"),[],$dict([]));e.set("old_form",$t472);}
{const $t473=$call($get($get(e.get("sim"),"rng"),"choice"),[["council","republic","oligarchy","junta"]],$dict([]));$set(e.get("country"),"government",$t473);}
{const $t474=$get(e.get("sim"),"year");$set(e.get("country"),"government_since",$t474);}
{const $t475=45;$set(e.get("country"),"stability",$t475);}
$set(e.get("country"),"prosperity",$aug("Sub",$get(e.get("country"),"prosperity"),10));{const $t476=("An uprising in "+$fmt(e.get("place"),-1,null)+" replaced the "+$fmt(e.get("old_form"),-1,null)+" with a "+$fmt($call($get($item($call(e.get("government_info"),[$get(e.get("country"),"government")],$dict([])),"label"),"lower"),[],$dict([])),-1,null)+".");e.set("message",$t476);}
$call($get(e.get("sim"),"record"),[e.get("message")],$dict([]));
$call(e.get("choose_ruler"),[e.get("sim"),e.get("country"),e.get("adults")],$dict([]));
{const $t477=null;e.set("message",$t477);}
}else{if($truth($compare([()=>e.get("event"),()=>"school"], ["Eq"]))){$set(e.get("country"),"prosperity",$aug("Sub",$get(e.get("country"),"prosperity"),5));$set(e.get("country"),"research",$aug("Add",$get(e.get("country"),"research"),5));{const $t478=($fmt(e.get("who"),-1,null)+" opened a school in "+$fmt(e.get("place"),-1,null)+", helping preserve and share knowledge.");e.set("message",$t478);}
}else{{const $t479=$item($get(e.get("sim"),"countries"),$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("partners")],$dict([])));e.set("partner",$t479);}
{const $t480=($truth($compare([()=>"roads",()=>$get(e.get("country"),"technologies")], ["In"]))?7:4);e.set("bonus",$t480);}
$set(e.get("country"),"prosperity",$aug("Add",$get(e.get("country"),"prosperity"),e.get("bonus")));{const $t481=$call(e.get("clamp"),[$bin("Add",$get(e.get("partner"),"prosperity"),e.get("bonus"))],$dict([]));$set(e.get("partner"),"prosperity",$t481);}
{const $t482=("Merchants exchanged goods between "+$fmt(e.get("place"),-1,null)+" and "+$fmt($get(e.get("partner"),"name"),-1,null)+"; both economies benefited.");e.set("message",$t482);}
{const $t483=$bin("Add",$call(e.get("era_index"),[$get(e.get("country"),"technologies")],$dict([])),e.get("MAX_LEAD"));e.set("top",$t483);}
{const $t484=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t485 of $iter(e.get("TECHNOLOGIES"))){e.set("tech",$t485);if($truth($boolop("And",[()=>$compare([()=>e.get("tech"),()=>$get(e.get("partner"),"technologies")], ["In"]),()=>$compare([()=>e.get("tech"),()=>$get(e.get("country"),"technologies")], ["NotIn"]),()=>$call(e.get("tech_met"),[e.get("tech"),$get(e.get("country"),"technologies")],$dict([])),()=>$compare([()=>$call($get(e.get("technology"),"era_of_tech"),[e.get("tech")],$dict([])),()=>e.get("top")], ["LtE"])]))){yield e.get("tech");}}})();})(e));e.set("ideas",$t484);}
if($truth($boolop("And",[()=>e.get("ideas"),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.35], ["Lt"])]))){$call(e.get("unlock"),[e.get("sim"),e.get("country"),$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("ideas")],$dict([])),e.get("actor")],$dict([["borrowed",true]]));
}else{}
for(const $t486 of $iter($tuple([$tuple([e.get("partner"),e.get("country")]),$tuple([e.get("country"),e.get("partner")])]))){{const $t487=Array.from($iter($t486));e.set("giver",$t487[0]);e.set("taker",$t487[1]);}{const $t488=$call(e.get("pass_on_knowledge"),[e.get("sim"),e.get("giver"),e.get("taker"),0.4],$dict([]));e.set("got",$t488);}
if($truth(e.get("got"))){$call($get(e.get("sim"),"record"),[("Merchants carried word of "+$fmt($item(e.get("got"),0),-1,null)+" from "+$fmt($get(e.get("giver"),"name"),-1,null)+" to "+$fmt($get(e.get("taker"),"name"),-1,null)+"."),"discovery"],$dict([]));
}else{}
}
}
}
}
}
}
}
}
}
}
}
if($truth(e.get("message"))){$call($get(e.get("sim"),"record"),[e.get("message"),($truth($compare([()=>e.get("event"),()=>new PS(["poem","festival"])], ["In"]))?"creative":($truth($compare([()=>e.get("event"),()=>"school"], ["Eq"]))?"discovery":"political"))],$dict([]));
}else{}
{const $t489=$call(e.get("clamp"),[$get(e.get("country"),"food")],$dict([]));$set(e.get("country"),"food",$t489);}
{const $t490=$call(e.get("clamp"),[$get(e.get("country"),"prosperity")],$dict([]));$set(e.get("country"),"prosperity",$t490);}
{const $t491=$call(e.get("clamp"),[$get(e.get("country"),"stability")],$dict([]));$set(e.get("country"),"stability",$t491);}
}
return null;}));
e.set("social_rates",$fn("social_rates",e,["country"],[undefined],null,null,[],[],e=>{{const $t492=$bin("Add",$bin("Add",0.85,$bin("Div",$get(e.get("country"),"food"),400)),$bin("Div",$get(e.get("country"),"prosperity"),1000));e.set("birth",$t492);}
{const $t493=$bin("Add",$bin("Add",1,$bin("Div",$call(e.get("max"),[0,$bin("Sub",40,$get(e.get("country"),"food"))],$dict([])),80)),$bin("Div",$call(e.get("max"),[0,$bin("Sub",30,$get(e.get("country"),"stability"))],$dict([])),100));e.set("death",$t493);}
e.set("death",$aug("Mult",e.get("death"),$bin("Pow",0.92,$call(e.get("len"),[$bin("BitAnd",$get(e.get("country"),"technologies"),e.get("CARE_TECHS"))],$dict([])))));return $tuple([e.get("birth"),e.get("death")]);return null;}));
e.set("build_event_catalog",$fn("build_event_catalog",e,["domains"],[undefined],null,null,[],[],e=>{{const $t494=[];e.set("catalog",$t494);}
for(const $t495 of $iter($call($get(e.get("domains"),"items"),[],$dict([])))){{const $t496=Array.from($iter($t495));e.set("domain_id",$t496[0]);e.set("domain",$t496[1]);}for(const $t497 of $iter($call(e.get("enumerate"),[$item(e.get("domain"),"situations")],$dict([])))){{const $t498=Array.from($iter($t497));e.set("situation_index",$t498[0]);e.set("situation",$t498[1]);}for(const $t499 of $iter($call(e.get("enumerate"),[$item(e.get("domain"),"outcomes")],$dict([])))){{const $t500=Array.from($iter($t499));e.set("outcome_index",$t500[0]);e.set("outcome",$t500[1]);}$call($get(e.get("catalog"),"append"),[$dict([["id",($fmt(e.get("domain_id"),-1,null)+"."+$fmt($bin("Add",e.get("situation_index"),1),-1,null)+"."+$fmt($bin("Add",e.get("outcome_index"),1),-1,null))],["situation_id",($fmt(e.get("domain_id"),-1,null)+"."+$fmt($bin("Add",e.get("situation_index"),1),-1,null))],["domain",e.get("domain_id")],["category",$item(e.get("domain"),"category")],["requires",$call(e.get("frozenset"),[$item(e.get("domain"),"requires")],$dict([]))],["gate",$item(e.get("domain"),"gate")],["text",$bin("Add",$bin("Add",e.get("situation")," "),$item(e.get("outcome"),"text"))],["effects",$call(e.get("dict"),[$item(e.get("outcome"),"effects")],$dict([]))],["weight",$item(e.get("outcome"),"weight")]])],$dict([]));
}
}
}
return $call(e.get("tuple"),[e.get("catalog")],$dict([]));return null;}));
e.set("eligible_catalog_events",$fn("eligible_catalog_events",e,["sim", "country", "residents", "groups", "busy"],[undefined,undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t501=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t502 of $iter(e.get("groups"))){e.set("cid",$t502);if($truth($boolop("And",[()=>$compare([()=>e.get("cid"),()=>$get(e.get("country"),"id")], ["NotEq"]),()=>$compare([()=>e.get("cid"),()=>e.get("busy")], ["NotIn"])]))){yield e.get("cid");}}})();})(e));e.set("partners",$t501);}
{const $t503=$dict([["any",true],["peace",$compare([()=>$get(e.get("country"),"id"),()=>e.get("busy")], ["NotIn"])],["shortage",$compare([()=>$get(e.get("country"),"food"),()=>45], ["Lt"])],["unrest",$compare([()=>$get(e.get("country"),"stability"),()=>40], ["Lt"])],["war",$compare([()=>$get(e.get("country"),"id"),()=>e.get("busy")], ["In"])],["sickness",$call(e.get("bool"),[$boolop("Or",[()=>$get(e.get("country"),"sickness"),()=>$call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t504 of $iter(e.get("residents"))){e.set("p",$t504);yield $get(e.get("p"),"infection");}})();})(e)],$dict([]))])],$dict([]))],["disaster",$boolop("And",[()=>$compare([()=>$get(e.get("country"),"last_disaster_year"),()=>null], ["IsNot"]),()=>$compare([()=>0,()=>$bin("Sub",$get(e.get("sim"),"year"),$get(e.get("country"),"last_disaster_year")),()=>5], ["LtE", "LtE"])])],["partner",$boolop("And",[()=>$call(e.get("bool"),[e.get("partners")],$dict([])),()=>$compare([()=>$get(e.get("country"),"id"),()=>e.get("busy")], ["NotIn"])])]]);e.set("gates",$t503);}
return Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t505 of $iter(e.get("EVENT_CATALOG"))){e.set("event",$t505);if($truth($boolop("And",[()=>$compare([()=>$item(e.get("event"),"requires"),()=>$get(e.get("country"),"technologies")], ["LtE"]),()=>$item(e.get("gates"),$item(e.get("event"),"gate")),()=>$compare([()=>$bin("Sub",$get(e.get("sim"),"year"),$call($get($get(e.get("country"),"last_catalog_events"),"get"),[$item(e.get("event"),"situation_id"),$un("USub",100)],$dict([]))),()=>1], ["GtE"])]))){yield e.get("event");}}})();})(e));return null;}));
e.set("apply_catalog_event",$fn("apply_catalog_event",e,["sim", "country", "actor", "event"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{for(const $t506 of $iter($call($get($item(e.get("event"),"effects"),"items"),[],$dict([])))){{const $t507=Array.from($iter($t506));e.set("stat",$t507[0]);e.set("amount",$t507[1]);}{const $t508=$call(e.get("getattr"),[e.get("country"),e.get("stat")],$dict([]));e.set("current",$t508);}
$call(e.get("setattr"),[e.get("country"),e.get("stat"),($truth($compare([()=>e.get("stat"),()=>"research"], ["Eq"]))?$call(e.get("max"),[0,$bin("Add",e.get("current"),e.get("amount"))],$dict([])):$call(e.get("clamp"),[$bin("Add",e.get("current"),e.get("amount"))],$dict([])))],$dict([]));
}
{const $t509=$get(e.get("sim"),"year");$setitem($get(e.get("country"),"last_catalog_events"),$item(e.get("event"),"situation_id"),$t509);}
{const $t510=$call($get($item(e.get("event"),"text"),"format"),[],$dict([["actor",$call($get(e.get("sim"),"person_reference"),[e.get("actor")],$dict([]))],["country",$get(e.get("country"),"name")]]));e.set("message",$t510);}
if($truth($compare([()=>"{actor}",()=>$item(e.get("event"),"text")], ["In"]))){{const $t511=$call(e.get("min"),[100,$bin("Add",$call(e.get("getattr"),[e.get("actor"),"fame",0],$dict([])),2)],$dict([]));$set(e.get("actor"),"fame",$t511);}
}else{}
$call($get(e.get("sim"),"record"),[e.get("message"),$item(e.get("event"),"category")],$dict([]));
return null;}));
e.set("run_catalog_event",$fn("run_catalog_event",e,["sim", "country", "adults", "groups", "busy"],[undefined,undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t512=$call(e.get("eligible_catalog_events"),[e.get("sim"),e.get("country"),$item(e.get("groups"),$get(e.get("country"),"id")),e.get("groups"),e.get("busy")],$dict([]));e.set("eligible",$t512);}
{const $t513=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t516 of $iter(e.get("eligible"))){e.set("event",$t516);if($truth($call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t514 of $iter($call($get($item(e.get("event"),"effects"),"items"),[],$dict([])))){{const $t515=Array.from($iter($t514));e.set("stat",$t515[0]);e.set("amount",$t515[1]);}yield $boolop("Or",[()=>$boolop("And",[()=>$compare([()=>e.get("amount"),()=>0], ["Gt"]),()=>$boolop("Or",[()=>$compare([()=>e.get("stat"),()=>"research"], ["Eq"]),()=>$compare([()=>$call(e.get("getattr"),[e.get("country"),e.get("stat")],$dict([])),()=>100], ["Lt"])])]),()=>$boolop("And",[()=>$compare([()=>e.get("amount"),()=>0], ["Lt"]),()=>$compare([()=>$call(e.get("getattr"),[e.get("country"),e.get("stat")],$dict([])),()=>0], ["Gt"])])]);}})();})(e)],$dict([])))){yield e.get("event");}}})();})(e));e.set("eligible",$t513);}
if($truth($un("Not",e.get("eligible")))){return null;}else{}
{const $t517=$dict([]);e.set("by_domain",$t517);}
for(const $t518 of $iter(e.get("eligible"))){e.set("event",$t518);$call($get($call($get(e.get("by_domain"),"setdefault"),[$item(e.get("event"),"domain"),[]],$dict([])),"append"),[e.get("event")],$dict([]));
}
{const $t519=$call($get($get(e.get("sim"),"rng"),"choice"),[$call(e.get("list"),[e.get("by_domain")],$dict([]))],$dict([]));e.set("domain",$t519);}
{const $t520=$dict([]);e.set("by_situation",$t520);}
for(const $t521 of $iter($item(e.get("by_domain"),e.get("domain")))){e.set("event",$t521);$call($get($call($get(e.get("by_situation"),"setdefault"),[$item(e.get("event"),"situation_id"),[]],$dict([])),"append"),[e.get("event")],$dict([]));
}
{const $t522=$call($get($get(e.get("sim"),"rng"),"choice"),[$call(e.get("list"),[$call($get(e.get("by_situation"),"values"),[],$dict([]))],$dict([]))],$dict([]));e.set("outcomes",$t522);}
{const $t523=$item($call($get($get(e.get("sim"),"rng"),"choices"),[e.get("outcomes")],$dict([["weights",Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t524 of $iter(e.get("outcomes"))){e.set("item",$t524);yield $item(e.get("item"),"weight");}})();})(e))],["k",1]])),0);e.set("event",$t523);}
{const $t525=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t526 of $iter(e.get("adults"))){e.set("p",$t526);if($truth($boolop("Or",[()=>$call(e.get("getattr"),[e.get("p"),"public_role",""],$dict([])),()=>$compare([()=>$call(e.get("getattr"),[e.get("p"),"fame",0],$dict([])),()=>40], ["GtE"])]))){yield e.get("p");}}})();})(e));e.set("notable",$t525);}
{const $t527=$call($get($get(e.get("sim"),"rng"),"choice"),[($truth($boolop("And",[()=>e.get("notable"),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.75], ["Lt"])]))?e.get("notable"):e.get("adults"))],$dict([]));e.set("actor",$t527);}
$call(e.get("apply_catalog_event"),[e.get("sim"),e.get("country"),e.get("actor"),e.get("event")],$dict([]));
return $item(e.get("event"),"id");return null;}));
{const $t528=$dict([["agriculture",$dict([["category","political"],["requires",$tuple([])],["gate","peace"],["situations",$tuple(["Farmers in {country} tested planting dates agreed upon at a village council.","{actor} organized a trial of communal grain reserves in {country}.","Villages in {country} attempted to restore neglected field boundaries.","Growers in {country} experimented with selecting seed from their strongest plants.","{actor} sponsored a trial of shared ox teams for small farms in {country}.","Farmers in {country} tried planting legumes on exhausted plots.","Households in {country} attempted to coordinate harvest work across neighboring farms.","{actor} backed an experiment in protecting stored grain from damp in {country}.","Shepherds and farmers in {country} negotiated a trial schedule for grazing fallow fields.","Villagers in {country} attempted to reclaim abandoned gardens for food production."])],["outcomes",$tuple([$dict([["text","The trial produced a reliable surplus, and neighboring villages adopted the practice."],["effects",$dict([["food",9.0],["prosperity",2.0]])],["weight",4]]),$dict([["text","The trial yielded a modest improvement without demanding much additional labor."],["effects",$dict([["food",4.0]])],["weight",5]]),$dict([["text","Food supplies improved, but disputes over the extra work weakened local cooperation."],["effects",$dict([["food",5.0],["stability",$un("USub",4.0)]])],["weight",3]]),$dict([["text","The effort consumed scarce resources and brought no useful gain."],["effects",$dict([["prosperity",$un("USub",4.0)]])],["weight",2]]),$dict([["text","Poor coordination disrupted ordinary work and left food reserves smaller than expected."],["effects",$dict([["food",$un("USub",6.0)],["stability",$un("USub",2.0)]])],["weight",2]])])]])],["commerce",$dict([["category","political"],["requires",$tuple([])],["gate","peace"],["situations",$tuple(["Merchants in {country} proposed a common set of market weights.","{actor} backed a trial of regular market days in {country}.","Traders in {country} attempted to pool the cost of guards for their goods.","Market elders in {country} tried a public process for settling payment disputes.","{actor} proposed clearer rules for stall fees in {country}.","Craft sellers in {country} attempted to establish shared standards of workmanship.","Merchants in {country} organized a trial system of witnesses for large exchanges.","Village traders in {country} attempted to combine small loads for longer journeys.","{actor} encouraged a trial exchange fair between inland communities in {country}.","Traders in {country} proposed shared responsibility for damaged goods in transit."])],["outcomes",$tuple([$dict([["text","The arrangement earned trust and drew substantial new trade."],["effects",$dict([["prosperity",8.0],["stability",2.0]])],["weight",4]]),$dict([["text","A limited trial reduced everyday trading costs."],["effects",$dict([["prosperity",4.0]])],["weight",5]]),$dict([["text","Wealthy merchants gained most of the benefits, provoking resentment among small sellers."],["effects",$dict([["prosperity",5.0],["stability",$un("USub",4.0)]])],["weight",3]]),$dict([["text","Arguments over responsibility stalled the effort after participants had spent their savings."],["effects",$dict([["prosperity",$un("USub",4.0)],["stability",$un("USub",2.0)]])],["weight",2]]),$dict([["text","Dishonest intermediaries exploited the arrangement before it was abandoned."],["effects",$dict([["prosperity",$un("USub",6.0)],["stability",$un("USub",4.0)]])],["weight",2]])])]])],["civic_infrastructure",$dict([["category","political"],["requires",$tuple([])],["gate","peace"],["situations",$tuple(["{actor} sought labor for repairing public wells in {country}.","Residents of {country} proposed clearing blocked paths between settlements.","Town elders in {country} attempted to organize repairs to communal meeting shelters.","{actor} backed a plan to shore up an eroding river landing in {country}.","Villagers in {country} sought to replace a dangerous footbridge.","Households in {country} proposed improving drainage around crowded dwellings.","{actor} requested materials for a communal storehouse in {country}.","Settlements in {country} attempted to establish sheltered resting places along busy paths.","Residents of {country} organized an effort to repair livestock watering troughs.","Town elders in {country} proposed rebuilding a damaged marketplace shelter."])],["outcomes",$tuple([$dict([["text","Skilled supervision brought the work to completion and made daily life easier."],["effects",$dict([["prosperity",6.0],["stability",4.0]])],["weight",4]]),$dict([["text","Volunteers completed a smaller version that still met the most urgent needs."],["effects",$dict([["stability",4.0]])],["weight",5]]),$dict([["text","The work succeeded, but its demands drained household savings."],["effects",$dict([["stability",5.0],["prosperity",$un("USub",4.0)]])],["weight",3]]),$dict([["text","A shortage of skilled workers left the project unfinished and its materials wasted."],["effects",$dict([["prosperity",$un("USub",5.0)]])],["weight",2]]),$dict([["text","Coerced labor and missing supplies turned the project into a source of public anger."],["effects",$dict([["stability",$un("USub",7.0)],["prosperity",$un("USub",3.0)]])],["weight",2]])])]])],["scholarship",$dict([["category","discovery"],["requires",$tuple(["writing"])],["gate","any"],["situations",$tuple(["Scholars in {country} compared records of seasonal flooding.","{actor} sponsored an inquiry into more consistent methods of measuring land in {country}.","Teachers in {country} tested a new sequence for teaching arithmetic.","Observers in {country} attempted to reconcile conflicting records of the stars.","{actor} supported the comparison of medicinal plant descriptions in {country}.","Scribes in {country} investigated errors that accumulated when copying accounts.","Scholars in {country} attempted to compare regional systems of weights and lengths.","{actor} commissioned a study of records describing past harvest failures in {country}.","Teachers in {country} tried a new method of checking apprentices' calculations.","Scholars in {country} gathered craftworkers' observations for a practical handbook."])],["outcomes",$tuple([$dict([["text","Careful comparisons revealed a useful principle that other investigators could reproduce."],["effects",$dict([["research",9.0]])],["weight",3]]),$dict([["text","The work corrected several persistent mistakes and improved instruction."],["effects",$dict([["research",4.0]])],["weight",5]]),$dict([["text","A promising finding emerged, although sustaining the inquiry strained its sponsors' resources."],["effects",$dict([["research",6.0],["prosperity",$un("USub",3.0)]])],["weight",3]]),$dict([["text","Inconsistent evidence prevented a firm conclusion, but investigators documented their methods."],["effects",$dict([["research",1.5],["prosperity",$un("USub",1.0)]])],["weight",3]]),$dict([["text","An influential patron insisted on an unsupported conclusion, discouraging further inquiry."],["effects",$dict([["research",$un("USub",3.0)],["stability",$un("USub",2.0)]])],["weight",1]])])]])],["arts",$dict([["category","creative"],["requires",$tuple([])],["gate","any"],["situations",$tuple(["{actor} sponsored the composition of an epic about the ancestors of {country}.","Performers in {country} rehearsed a new cycle of harvest songs.","Craftworkers in {country} attempted an elaborate ceremonial carving.","Storytellers in {country} prepared a public retelling of a disputed founding legend.","{actor} commissioned a decorated vessel for public ceremonies in {country}.","Dancers in {country} devised a performance honoring departed relatives.","Musicians in {country} experimented with a new arrangement for familiar songs.","Artisans in {country} planned a woven panel depicting everyday village life.","{actor} supported a dramatic performance about justice and obligation in {country}.","Poets in {country} attempted a shared collection of verses about travel and homecoming."])],["outcomes",$tuple([$dict([["text","The finished work found a wide audience and became a source of shared pride."],["effects",$dict([["stability",7.0],["prosperity",2.0]])],["weight",4]]),$dict([["text","The work pleased a modest audience and encouraged younger artists."],["effects",$dict([["stability",3.0],["research",1.0]])],["weight",5]]),$dict([["text","The work won admiration, but rival patrons argued over whose contribution deserved recognition."],["effects",$dict([["prosperity",3.0],["stability",$un("USub",2.0)]])],["weight",3]]),$dict([["text","Costs mounted, and the effort ended before the work could be presented."],["effects",$dict([["prosperity",$un("USub",3.0)]])],["weight",2]]),$dict([["text","The work offended powerful families, whose demands for punishment divided the community."],["effects",$dict([["stability",$un("USub",6.0)]])],["weight",2]])])]])]]);e.set("EVENT_DOMAINS_A",$t528);}
{const $t529=$dict([["political_reform",$dict([["category","political"],["requires",$tuple([])],["gate","any"],["situations",$tuple(["{actor} convened a council in {country} to discuss fairer harvest levies.","{actor} heard petitions in {country} about abuses by local officials.","{actor} proposed clearer rules for communal grazing in {country}.","{actor} brought village delegates together in {country} to review public obligations.","{actor} opened negotiations in {country} over service owed to the ruling household.","{actor} called for an inquiry into disputed market tolls in {country}.","{actor} assembled elders in {country} to discuss how grievances should be heard.","{actor} asked the settlements of {country} to reconsider exemptions from communal labor.","{actor} sponsored a public debate in {country} about the duties of tax collectors.","{actor} arranged talks in {country} on settling boundary disputes without private feuds."])],["outcomes",$tuple([$dict([["text","A modest compromise won broad support and made local administration more predictable."],["effects",$dict([["stability",5],["prosperity",2]])],["weight",4]]),$dict([["text","The council agreed to a limited trial, spending public resources to ease longstanding tensions."],["effects",$dict([["stability",3],["prosperity",$un("USub",2)]])],["weight",3]]),$dict([["text","Influential households blocked agreement, and disappointed petitioners returned home resentful."],["effects",$dict([["stability",$un("USub",4)]])],["weight",2]]),$dict([["text","A hurried settlement favored the wealthiest households, improving collections but deepening resentment."],["effects",$dict([["prosperity",3],["stability",$un("USub",3)]])],["weight",2]]),$dict([["text","Careful testimony exposed inconsistencies and helped officials understand local needs."],["effects",$dict([["research",2],["stability",2]])],["weight",3]])])]])],["diplomacy",$dict([["category","political"],["requires",$tuple([])],["gate","partner"],["situations",$tuple(["{actor} welcomed foreign envoys to {country} for discussions about frontier customs.","{actor} sent representatives from {country} to discuss the treatment of traveling merchants.","{actor} hosted talks in {country} about access to seasonal markets.","{actor} sought foreign advice in {country} on resolving disputed tolls.","{actor} arranged a ceremonial meeting in {country} to discuss borderland grievances.","{actor} invited neighboring officials to {country} to compare trading practices.","{actor} prepared a diplomatic delegation in {country} to seek clearer rules for caravans.","{actor} received visitors in {country} seeking a shared understanding of river passage.","{actor} organized discussions in {country} about protecting messengers on public roads.","{actor} offered hospitality in {country} to delegates discussing disputed market privileges."])],["outcomes",$tuple([$dict([["text","The exchange clarified expectations and encouraged merchants to invest with greater confidence."],["effects",$dict([["prosperity",4],["stability",2]])],["weight",4]]),$dict([["text","The visitors shared useful practical knowledge, although gifts and hospitality proved expensive."],["effects",$dict([["research",4],["prosperity",$un("USub",2)]])],["weight",3]]),$dict([["text","The talks stalled over precedence and ceremonial honors, wasting resources and embarrassing the hosts."],["effects",$dict([["prosperity",$un("USub",3)],["stability",$un("USub",2)]])],["weight",2]]),$dict([["text","Only a narrow understanding emerged, but the respectful exchange reassured local communities."],["effects",$dict([["stability",3]])],["weight",4]]),$dict([["text","Rumors of secret concessions spread faster than the delegates could explain their work."],["effects",$dict([["stability",$un("USub",4)],["prosperity",$un("USub",1)]])],["weight",2]])])]])],["wartime_logistics",$dict([["category","war"],["requires",$tuple([])],["gate","war"],["situations",$tuple(["{actor} gathered quartermasters in {country} to review the movement of military supplies.","{actor} asked village elders in {country} to coordinate deliveries to the army.","{actor} inspected the wartime storehouses of {country} and proposed improvements.","{actor} convened wagon owners in {country} to discuss military transport.","{actor} reviewed demands for pack animals across {country}.","{actor} organized discussions in {country} about supplying distant garrisons.","{actor} sought ways to distribute military requisitions more evenly in {country}.","{actor} assembled camp suppliers in {country} to reconsider their delivery schedules.","{actor} called a meeting in {country} about protecting provisions from spoilage during transport.","{actor} asked officials in {country} to examine the burden of feeding troops through winter."])],["outcomes",$tuple([$dict([["text","Better coordination reduced waste and left more provisions available to local households."],["effects",$dict([["food",5],["stability",2]])],["weight",4]]),$dict([["text","The new arrangements demanded costly equipment but eased confusion and public complaints."],["effects",$dict([["prosperity",$un("USub",3)],["stability",3]])],["weight",3]]),$dict([["text","Conflicting orders caused deliveries to spoil and increased pressure on civilian reserves."],["effects",$dict([["food",$un("USub",5)],["stability",$un("USub",3)]])],["weight",2]]),$dict([["text","Experienced suppliers developed useful methods, though the immediate work strained local markets."],["effects",$dict([["research",3],["prosperity",$un("USub",2)]])],["weight",3]]),$dict([["text","Well-connected suppliers secured favorable terms while ordinary households carried the heavier burden."],["effects",$dict([["prosperity",2],["food",$un("USub",2)],["stability",$un("USub",4)]])],["weight",2]])])]])],["public_health",$dict([["category","sickness"],["requires",$tuple([])],["gate","sickness"],["situations",$tuple(["{actor} brought healers together in {country} to compare their observations of the outbreak.","{actor} organized discussions in {country} about supporting households unable to work.","{actor} asked community elders in {country} to review arrangements for nursing the sick.","{actor} convened attendants in {country} to discuss the supply of bedding and clean water.","{actor} sought proposals in {country} for keeping essential markets supplied during the outbreak.","{actor} invited experienced caregivers in {country} to share practical advice.","{actor} arranged a council in {country} about the rising cost of household care.","{actor} appealed to the storekeepers of {country} to consider relief for afflicted families.","{actor} asked officials in {country} to investigate rumors surrounding the sickness.","{actor} gathered local leaders in {country} to discuss shortages among exhausted caregivers."])],["outcomes",$tuple([$dict([["text","Shared observations improved practical knowledge and reassured worried households."],["effects",$dict([["research",4],["stability",2]])],["weight",4]]),$dict([["text","A relief effort drew on communal stores and eased public distress."],["effects",$dict([["food",$un("USub",3)],["stability",4]])],["weight",4]]),$dict([["text","Competing explanations turned into accusations, unsettling the markets and deepening fear."],["effects",$dict([["stability",$un("USub",5)],["prosperity",$un("USub",2)]])],["weight",2]]),$dict([["text","Supplies were purchased at high prices, supporting household care while straining public resources."],["effects",$dict([["prosperity",$un("USub",4)],["stability",2]])],["weight",3]]),$dict([["text","The discussions exposed gaps in local knowledge, prompting careful observation at considerable expense."],["effects",$dict([["research",3],["prosperity",$un("USub",2)]])],["weight",3]])])]])],["disaster_recovery",$dict([["category","disaster"],["requires",$tuple([])],["gate","disaster"],["situations",$tuple(["{actor} gathered builders in {country} to assess damage left by the disaster.","{actor} convened a relief council in {country} to consider the needs of displaced households.","{actor} asked settlements across {country} to discuss sharing reconstruction labor.","{actor} brought storekeepers together in {country} to review emergency supplies.","{actor} organized discussions in {country} about reopening damaged market spaces.","{actor} sought advice in {country} on restoring essential paths and crossings.","{actor} assembled craftspeople in {country} to plan repairs after the disaster.","{actor} called on local elders in {country} to settle competing requests for rebuilding materials.","{actor} arranged a survey in {country} of the work needed before normal trade could resume.","{actor} asked households in {country} to coordinate temporary shelter and repair work."])],["outcomes",$tuple([$dict([["text","Cooperation reduced waste and helped ordinary commerce resume more steadily."],["effects",$dict([["prosperity",4],["stability",3]])],["weight",4]]),$dict([["text","Urgent work consumed food reserves but restored confidence in the community's ability to recover."],["effects",$dict([["food",$un("USub",4)],["stability",4]])],["weight",3]]),$dict([["text","Disputes over priority delayed useful work and left families angry at local officials."],["effects",$dict([["prosperity",$un("USub",3)],["stability",$un("USub",4)]])],["weight",2]]),$dict([["text","Craftspeople learned from the damage and tested sturdier methods at substantial cost."],["effects",$dict([["research",4],["prosperity",$un("USub",3)]])],["weight",3]]),$dict([["text","Materials proved scarcer than expected, and emergency purchases strained already limited reserves."],["effects",$dict([["prosperity",$un("USub",4)],["food",$un("USub",2)]])],["weight",2]])])]])]]);e.set("EVENT_DOMAINS_B",$t529);}
{const $t530=$tuple(["river villages","hill villages","market towns","farming communities","craft districts","frontier settlements","crowded neighborhoods","outlying hamlets","regional centers","the capital's households"]);e.set("COMMUNITY_CONTEXTS",$t530);}
{const $t531=$tuple([$tuple(["housing","repairing unsafe homes","prosperity"]),$tuple(["workplace_safety","reducing injuries at work","stability"]),$tuple(["apprenticeships","funding apprenticeships","research"]),$tuple(["fire_safety","organizing fire watches","stability"]),$tuple(["food_prices","publishing fair food prices","food"]),$tuple(["land_rights","mediating land claims","stability"]),$tuple(["childcare","supporting shared child care","prosperity"]),$tuple(["eldercare","supporting elderly households","stability"]),$tuple(["animal_care","improving livestock care","food"]),$tuple(["forestry","managing timber cutting","prosperity"]),$tuple(["fisheries","protecting fishing grounds","food"]),$tuple(["craft_fairs","holding craft exhibitions","prosperity"]),$tuple(["oral_history","preserving local oral histories","research"]),$tuple(["music_teaching","training young musicians","stability"]),$tuple(["public_games","organizing public games","stability"]),$tuple(["debt_relief","mediating household debts","prosperity"]),$tuple(["water_rights","sharing access to water","food"]),$tuple(["refugee_aid","helping displaced families","stability"]),$tuple(["surveying","mapping paths and property boundaries","research"]),$tuple(["market_fraud","investigating dishonest market practices","prosperity"])]);e.set("POLICY_SUBJECTS",$t531);}
{const $t532=$dict([]);e.set("EVENT_DOMAINS_C",$t532);}
for(const $t533 of $iter(e.get("POLICY_SUBJECTS"))){{const $t534=Array.from($iter($t533));e.set("domain",$t534[0]);e.set("subject",$t534[1]);e.set("stat",$t534[2]);}{const $t535=$dict([[e.get("stat"),3]]);e.set("trial_effects",$t535);}
{const $t536=$bin("Sub",$call($get(e.get("trial_effects"),"get"),["prosperity",0],$dict([])),1);$setitem(e.get("trial_effects"),"prosperity",$t536);}
{const $t537=$dict([["category",($truth($compare([()=>e.get("domain"),()=>$tuple(["craft_fairs","oral_history","music_teaching","public_games"])], ["In"]))?"creative":"political")],["requires",$tuple([])],["gate","any"],["situations",$call(e.get("tuple"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t538 of $iter(e.get("COMMUNITY_CONTEXTS"))){e.set("context",$t538);yield $bin("Add",$bin("Add",$bin("Add",$bin("Add","{actor} led a public initiative for ",e.get("subject"))," among "),e.get("context"))," in {country}.");}})();})(e)],$dict([]))],["outcomes",$tuple([$dict([["text","Broad participation made the effort successful and brought lasting local benefits."],["effects",$dict([[e.get("stat"),5]])],["weight",4]]),$dict([["text","A small trial succeeded, although its costs strained local savings."],["effects",e.get("trial_effects")],["weight",4]]),$dict([["text","Disagreements stalled the work and reduced trust in its organizers."],["effects",$dict([["stability",$un("USub",3)]])],["weight",2]]),$dict([["text","Volunteers documented useful lessons even though the original effort failed."],["effects",$dict([["research",2],["prosperity",$un("USub",2)]])],["weight",3]]),$dict([["text","An audit uncovered favoritism, and angry residents demanded new leadership."],["effects",$dict([["prosperity",$un("USub",2)],["stability",$un("USub",4)]])],["weight",2]])])]]);$setitem(e.get("EVENT_DOMAINS_C"),e.get("domain"),$t537);}
}
{const $t539=$call(e.get("build_event_catalog"),[$dict([...$entries(e.get("EVENT_DOMAINS_A")),...$entries(e.get("EVENT_DOMAINS_B")),...$entries(e.get("EVENT_DOMAINS_C"))])],$dict([]));e.set("EVENT_CATALOG",$t539);}
e.set("ensure_year_events",$fn("ensure_year_events",e,["sim", "start_index", "minimum"],[undefined,undefined,10],null,null,[],[],e=>{{const $t540=$dict([]);e.set("groups",$t540);}
for(const $t541 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("person",$t541);$call($get($call($get(e.get("groups"),"setdefault"),[$get(e.get("person"),"country"),[]],$dict([])),"append"),[e.get("person")],$dict([]));
}
if($truth($un("Not",e.get("groups")))){return null;}else{}
{const $t542=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t544 of $iter($get(e.get("sim"),"wars"))){e.set("pair",$t544);for(const $t543 of $iter(e.get("pair"))){e.set("cid",$t543);yield e.get("cid");}}})();})(e));e.set("busy",$t542);}
{const $t545=new PS(["discovery","political","creative","war","sickness","disaster"]);e.set("categories",$t545);}
{const $t546=$call(e.get("sum"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t547 of $iter($item($get(e.get("sim"),"history_categories"),$slice(e.get("start_index"),null,null)))){e.set("c",$t547);yield $compare([()=>e.get("c"),()=>e.get("categories")], ["In"]);}})();})(e)],$dict([]));e.set("count",$t546);}
{const $t548=$call(e.get("list"),[e.get("groups")],$dict([]));e.set("countries",$t548);}
$call($get($get(e.get("sim"),"rng"),"shuffle"),[e.get("countries")],$dict([]));
{const $t549=[$tuple(["Wild fruit ripened near homes","food",2,"political"]),$tuple(["Stored grain spoiled in damp shelters","food",$un("USub",2),"political"]),$tuple(["A nearby spring ran clearer after rainfall","food",1,"political"]),$tuple(["Cold nights damaged household supplies","prosperity",$un("USub",1),"political"]),$tuple(["Early shoots replenished nearby edible plants","food",1,"political"]),$tuple(["Insects damaged stored bedding","prosperity",$un("USub",1),"political"]),$tuple(["Mild weather reduced shelter needs","prosperity",1,"political"]),$tuple(["Animal tracks revealed a nearby water source","research",0.2,"discovery"]),$tuple(["Fallen branches damaged an empty shelter","prosperity",$un("USub",1),"political"]),$tuple(["New grass improved local grazing grounds","food",1,"political"]),$tuple(["A dry spell preserved household stores","food",1,"political"]),$tuple(["Wind scattered exposed supplies","food",$un("USub",1),"political"]),$tuple(["Rain filled household water jars","food",1,"political"]),$tuple(["Frost cracked exposed storage vessels","prosperity",$un("USub",1),"political"]),$tuple(["A quiet season spared household reserves","food",1,"political"]),$tuple(["Mice consumed grain left in open baskets","food",$un("USub",1),"political"]),$tuple(["Reeds regrew around nearby shelters","prosperity",1,"political"]),$tuple(["Rot weakened unused fences","prosperity",$un("USub",1),"political"]),$tuple(["Fallen fruit supplemented local food supplies","food",1,"political"]),$tuple(["Leaks soaked stored firewood","prosperity",$un("USub",1),"political"]),$tuple(["Dry weather reduced losses from damp","prosperity",1,"political"]),$tuple(["Straying animals consumed garden plants","food",$un("USub",1),"political"]),$tuple(["Sheltered gardens retained moisture","food",1,"political"]),$tuple(["Loose roof coverings deteriorated","prosperity",$un("USub",1),"political"])];e.set("household_events",$t549);}
{const $t550=new PD(((parent)=>{const e=new Env(parent);return (function*(){for(const $t551 of $iter(e.get("countries"))){e.set("cid",$t551);yield $tuple([e.get("cid"),$call(e.get("set"),[],$dict([]))]);}})();})(e));e.set("used",$t550);}
while($truth($compare([()=>e.get("count"),()=>e.get("minimum")], ["Lt"]))){{const $t552=false;e.set("made_progress",$t552);}
for(const $t553 of $iter(e.get("countries"))){e.set("cid",$t553);{const $t554=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t554);}
{const $t555=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t556 of $iter($item(e.get("groups"),e.get("cid")))){e.set("p",$t556);if($truth($compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"]))){yield e.get("p");}}})();})(e));e.set("adults",$t555);}
if($truth($boolop("And",[()=>e.get("adults"),()=>$call(e.get("run_catalog_event"),[e.get("sim"),e.get("country"),e.get("adults"),e.get("groups"),e.get("busy")],$dict([]))]))){e.set("count",$aug("Add",e.get("count"),1));{const $t557=true;e.set("made_progress",$t557);}
}else{{const $t558=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t559 of $iter($call(e.get("range"),[$call(e.get("len"),[e.get("household_events")],$dict([]))],$dict([])))){e.set("i",$t559);if($truth($compare([()=>e.get("i"),()=>$item(e.get("used"),e.get("cid"))], ["NotIn"]))){yield e.get("i");}}})();})(e));e.set("candidates",$t558);}
if($truth($un("Not",e.get("candidates")))){continue;}else{}
{const $t560=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("candidates")],$dict([]));e.set("index",$t560);}
$call($get($item(e.get("used"),e.get("cid")),"add"),[e.get("index")],$dict([]));
{const $t561=$item(e.get("household_events"),e.get("index"));{const $t562=Array.from($iter($t561));e.set("text",$t562[0]);e.set("stat",$t562[1]);e.set("amount",$t562[2]);e.set("category",$t562[3]);}}
{const $t563=$call(e.get("getattr"),[e.get("country"),e.get("stat")],$dict([]));e.set("before",$t563);}
{const $t564=($truth($compare([()=>e.get("stat"),()=>"research"], ["Eq"]))?$call(e.get("max"),[0,$bin("Add",e.get("before"),e.get("amount"))],$dict([])):$call(e.get("clamp"),[$bin("Add",e.get("before"),e.get("amount"))],$dict([])));e.set("after",$t564);}
if($truth($compare([()=>e.get("before"),()=>e.get("after")], ["Eq"]))){continue;}else{}
$call(e.get("setattr"),[e.get("country"),e.get("stat"),e.get("after")],$dict([]));
$call($get(e.get("sim"),"record"),[($fmt(e.get("text"),-1,null)+" in "+$fmt($get(e.get("country"),"name"),-1,null)+" ("+$fmt(e.get("stat"),-1,null)+" "+$fmt($bin("Sub",e.get("after"),e.get("before")),-1,("+.1f"))+")."),e.get("category")],$dict([]));
e.set("count",$aug("Add",e.get("count"),1));{const $t565=true;e.set("made_progress",$t565);}
}
if($truth($compare([()=>e.get("count"),()=>e.get("minimum")], ["GtE"]))){break;}else{}
}
if($truth($un("Not",e.get("made_progress")))){if($truth($call(e.get("all"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t566 of $iter(e.get("countries"))){e.set("cid",$t566);yield $compare([()=>$call(e.get("len"),[$item(e.get("used"),e.get("cid"))],$dict([])),()=>$call(e.get("len"),[e.get("household_events")],$dict([]))], ["Eq"]);}})();})(e)],$dict([])))){break;}else{}
}else{}
}
return null;}));
});
$register("discoveries",e=>{e.set("dataclass",$get($import("dataclasses"),"dataclass"));e.set("Innovation",$class("Innovation",e,[["id",undefined],["name",undefined],["field",undefined],["prerequisites",undefined],["cost",undefined],["effects",undefined],["modifiers",undefined],["description",undefined]],true,e=>{}));
{const $t567=$dict([["agriculture",$tuple([$tuple(["irrigation","crop rotation"]),"contour planting|seed selection|composting|mulching|drainage channels|water scheduling|intercropping|fallow management|terracing|soil amendments","river farms|hillside farms|dryland farms|village gardens|orchards|pastures|vegetable plots|grain fields|seed nurseries|estate farms",$tuple([3,1,0,0]),$tuple(["production",0.009])])],["food preservation",$tuple([$tuple(["pottery","granaries"]),"drying racks|salt curing|smoking chambers|sealed jars|cool cellars|fermentation|pest exclusion|moisture checks|stock rotation|raised storage","grain depots|fishing ports|market stores|army kitchens|village pantries|fruit stores|vegetable stores|winter provisions|caravan provisions|public kitchens",$tuple([3,1,0,1]),$tuple(["production",0.007])])],["water engineering",$tuple([$tuple(["irrigation","aqueducts"]),"settling basins|sand filtration|covered conduits|sluice gates|cistern lining|leak detection|gravity channels|overflow drains|inspection shafts|water lifting","town wells|village wells|market districts|bathhouses|public fountains|hill settlements|fortresses|river settlements|workshop districts|farm settlements",$tuple([2,1,0,1]),$tuple(["infection",$un("USub",0.007)])])],["medical care",$tuple([$tuple(["medicine","surgery"]),"wound cleaning|patient observation|splint fitting|clean dressing|symptom recording|rest scheduling|caregiver training|instrument cleaning|recovery monitoring|patient triage","rural clinics|town clinics|field hospitals|port clinics|child care wards|elder care wards|traveler shelters|mining clinics|workshop infirmaries|public hospitals",$tuple([0,0,1,2]),$tuple(["disease_death",$un("USub",0.009)])])],["public health",$tuple([$tuple(["medicine","public sanitation"]),"waste collection|latrine maintenance|water inspection|case reporting|ventilation|food inspection|vermin control|laundry routines|isolation planning|burial safeguards","market districts|army camps|port districts|schools|crowded housing|caravan stops|prisons|public kitchens|mining settlements|refugee shelters",$tuple([0,1,1,2]),$tuple(["infection",$un("USub",0.009)])])],["manufacturing",$tuple([$tuple(["bronze tools","ironworking"]),"standard gauges|tool sharpening|jig fixtures|quality sampling|workshop scheduling|material sorting|furnace insulation|pattern templates|repair manuals|batch production","woodworking|masonry|metalworking|pottery workshops|textile workshops|leatherworking|shipbuilding|cart building|toolmaking|mill construction",$tuple([0,3,1,0]),$tuple(["production",0.009])])],["transport",$tuple([$tuple(["roads","navigation"]),"route surveying|load balancing|waystation planning|drainage maintenance|distance markers|traffic scheduling|cargo records|repair depots|hazard mapping|relay services","coastal routes|river routes|mountain routes|forest routes|grain routes|military routes|postal routes|market routes|mining routes|frontier routes",$tuple([1,2,0,1]),$tuple(["logistics",0.01])])],["military engineering",$tuple([$tuple(["fortification","military logistics"]),"defensive surveying|supply accounting|equipment inspection|signal drills|camp layout|bridge planning|field entrenchment|reserve provisioning|evacuation routes|unit coordination","border garrisons|river defenses|mountain defenses|coastal defenses|capital defenses|frontier patrols|field armies|siege forces|convoy escorts|militia formations",$tuple([0,1,1,1]),$tuple(["military",0.007])])],["scholarship",$tuple([$tuple(["writing","universities"]),"indexed records|comparative observations|error checking|worked examples|standard notation|translation glossaries|teaching demonstrations|catalog systems|measurement tables|replicated trials","agricultural schools|medical schools|navigation schools|engineering schools|astronomical study|mathematical study|craft schools|military schools|merchant schools|public libraries",$tuple([0,1,3,1]),$tuple(["research",0.01])])],["administration",$tuple([$tuple(["writing","banking"]),"audited accounts|standard contracts|duplicate archives|public registers|appeal procedures|scheduled inspections|budget forecasts|inventory ledgers|receipt systems|appointment records","tax offices|grain boards|market authorities|public works offices|army supply offices|port authorities|village councils|land registries|relief offices|trade courts",$tuple([1,2,1,2]),$tuple(["logistics",0.007])])]]);e.set("FIELDS",$t567);}
{const $t568=$dict([]);e.set("INNOVATIONS",$t568);}
for(const $t569 of $iter($call(e.get("enumerate"),[$call($get(e.get("FIELDS"),"items"),[],$dict([]))],$dict([])))){{const $t570=Array.from($iter($t569));e.set("field_index",$t570[0]);{const $t571=Array.from($iter($t570[1]));e.set("field",$t571[0]);e.set("data",$t571[1]);}}{const $t572=e.get("data");{const $t573=Array.from($iter($t572));e.set("foundations",$t573[0]);e.set("techniques",$t573[1]);e.set("contexts",$t573[2]);e.set("effects",$t573[3]);e.set("modifier",$t573[4]);}}
for(const $t574 of $iter($call(e.get("enumerate"),[$call($get(e.get("techniques"),"split"),["|"],$dict([]))],$dict([])))){{const $t575=Array.from($iter($t574));e.set("ti",$t575[0]);e.set("technique",$t575[1]);}for(const $t576 of $iter($call(e.get("enumerate"),[$call($get(e.get("contexts"),"split"),["|"],$dict([]))],$dict([])))){{const $t577=Array.from($iter($t576));e.set("ci",$t577[0]);e.set("context",$t577[1]);}{const $t578=($fmt(e.get("field_index"),-1,("02d"))+"-"+$fmt(e.get("ti"),-1,("02d"))+"-"+$fmt(e.get("ci"),-1,("02d")));e.set("key",$t578);}
{const $t579=$call(e.get("frozenset"),[($truth($compare([()=>e.get("ti"),()=>5], ["Lt"]))?$item(e.get("foundations"),$slice(null,1,null)):e.get("foundations"))],$dict([]));e.set("req",$t579);}
{const $t580=$bin("Add",1,$bin("Div",e.get("ci"),20));e.set("strength",$t580);}
{const $t581=$call(e.get("Innovation"),[e.get("key"),($fmt($call($get(e.get("technique"),"capitalize"),[],$dict([])),-1,null)+" for "+$fmt(e.get("context"),-1,null)),e.get("field"),e.get("req"),$bin("Add",$bin("Add",9,$bin("Mult",e.get("ti"),2)),e.get("ci")),$call(e.get("tuple"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t582 of $iter(e.get("effects"))){e.set("v",$t582);yield $call(e.get("round"),[$bin("Mult",e.get("v"),e.get("strength")),2],$dict([]));}})();})(e)],$dict([])),$tuple([$tuple([$item(e.get("modifier"),0),$bin("Mult",$item(e.get("modifier"),1),e.get("strength"))])]),("Local specialists adapt "+$fmt(e.get("technique"),-1,null)+" to the practical needs of "+$fmt(e.get("context"),-1,null)+".")],$dict([]));$setitem(e.get("INNOVATIONS"),e.get("key"),$t581);}
}
}
}
e.set("acquired_innovations",$fn("acquired_innovations",e,["country"],[undefined],null,null,[],[],e=>{return Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t583 of $iter($call(e.get("getattr"),[e.get("country"),"innovations",$dict([])],$dict([])))){e.set("key",$t583);if($truth($compare([()=>e.get("key"),()=>e.get("INNOVATIONS")], ["In"]))){yield $item(e.get("INNOVATIONS"),e.get("key"));}}})();})(e));return null;}));
e.set("catalog_for",$fn("catalog_for",e,["country", "acquired"],[undefined,true],null,null,[],[],e=>{if($truth(e.get("acquired"))){return $call(e.get("acquired_innovations"),[e.get("country")],$dict([]));}else{}
{const $t584=$call(e.get("getattr"),[e.get("country"),"innovations",$dict([])],$dict([]));e.set("owned",$t584);}
return Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t585 of $iter($call($get(e.get("INNOVATIONS"),"items"),[],$dict([])))){{const $t586=Array.from($iter($t585));e.set("key",$t586[0]);e.set("item",$t586[1]);}if($truth($boolop("And",[()=>$compare([()=>e.get("key"),()=>e.get("owned")], ["NotIn"]),()=>$compare([()=>$get(e.get("item"),"prerequisites"),()=>$get(e.get("country"),"technologies")], ["LtE"])]))){yield e.get("item");}}})();})(e));return null;}));
e.set("innovation_modifiers",$fn("innovation_modifiers",e,["country"],[undefined],null,null,[],[],e=>{{const $t587=new PD(((parent)=>{const e=new Env(parent);return (function*(){for(const $t588 of $iter($tuple(["production","infection","disease_death","military","logistics","research"]))){e.set("key",$t588);yield $tuple([e.get("key"),0.0]);}})();})(e));e.set("totals",$t587);}
for(const $t589 of $iter($call(e.get("acquired_innovations"),[e.get("country")],$dict([])))){e.set("item",$t589);for(const $t590 of $iter($get(e.get("item"),"modifiers"))){{const $t591=Array.from($iter($t590));e.set("key",$t591[0]);e.set("value",$t591[1]);}$setitem(e.get("totals"),e.get("key"),$aug("Add",$item(e.get("totals"),e.get("key")),e.get("value")));}
}
return new PD(((parent)=>{const e=new Env(parent);return (function*(){for(const $t592 of $iter($call($get(e.get("totals"),"items"),[],$dict([])))){{const $t593=Array.from($iter($t592));e.set("key",$t593[0]);e.set("value",$t593[1]);}yield $tuple([e.get("key"),($truth($compare([()=>e.get("key"),()=>$tuple(["infection","disease_death"])], ["In"]))?$call(e.get("max"),[0.45,$bin("Add",1,e.get("value"))],$dict([])):$call(e.get("min"),[($truth($compare([()=>e.get("key"),()=>$tuple(["production","research"])], ["In"]))?2.5:1.8),$bin("Add",1,e.get("value"))],$dict([])))]);}})();})(e));return null;}));
e.set("advance_innovations",$fn("advance_innovations",e,["sim", "country", "adults"],[undefined,undefined,undefined],null,null,[],[],e=>{if($truth($boolop("Or",[()=>$un("Not",e.get("adults")),()=>$compare([()=>$call(e.get("getattr"),[e.get("country"),"ended",null],$dict([])),()=>null], ["IsNot"])]))){return null;}else{}
if($truth($un("Not",$call(e.get("hasattr"),[e.get("country"),"innovations"],$dict([]))))){{const $t594=$dict([]);$set(e.get("country"),"innovations",$t594);}
}else{}
{const $t595=$call(e.get("catalog_for"),[e.get("country")],$dict([["acquired",false]]));e.set("available",$t595);}
if($truth($un("Not",e.get("available")))){return null;}else{}
{const $t596=$call(e.get("getattr"),[e.get("country"),"innovation_project",null],$dict([]));e.set("project_id",$t596);}
{const $t597=$call(e.get("next"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t598 of $iter(e.get("available"))){e.set("i",$t598);if($truth($compare([()=>$get(e.get("i"),"id"),()=>e.get("project_id")], ["Eq"]))){yield e.get("i");}}})();})(e),null],$dict([]));e.set("project",$t597);}
if($truth($compare([()=>e.get("project"),()=>null], ["Is"]))){{const $t599=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t600 of $iter(e.get("available"))){e.set("i",$t600);yield ($truth($boolop("Or",[()=>$boolop("And",[()=>$compare([()=>$get(e.get("country"),"food"),()=>45], ["Lt"]),()=>$compare([()=>$get(e.get("i"),"field"),()=>$tuple(["agriculture","food preservation"])], ["In"])]),()=>$boolop("And",[()=>$call(e.get("getattr"),[e.get("country"),"sickness",null],$dict([])),()=>$compare([()=>$get(e.get("i"),"field"),()=>$tuple(["medical care","public health"])], ["In"])])]))?4:1);}})();})(e));e.set("weights",$t599);}
{const $t601=$item($call($get($get(e.get("sim"),"rng"),"choices"),[e.get("available")],$dict([["weights",e.get("weights")],["k",1]])),0);e.set("project",$t601);}
{const $t602=$get(e.get("project"),"id");$set(e.get("country"),"innovation_project",$t602);}
{const $t603=0.0;$set(e.get("country"),"innovation_progress",$t603);}
}else{}
{const $t604=$call(e.get("min"),[1.5,$call(e.get("max"),[0.1,$bin("Div",$get(e.get("country"),"prosperity"),60)],$dict([]))],$dict([]));e.set("budget",$t604);}
{const $t605=$call(e.get("max"),[0,$bin("Sub",$get(e.get("country"),"prosperity"),$bin("Mult",e.get("budget"),0.25))],$dict([]));$set(e.get("country"),"prosperity",$t605);}
{const $t606=$bin("Mult",$bin("Add",1,$call(e.get("min"),[7,$bin("Div",$call(e.get("len"),[e.get("adults")],$dict([])),70)],$dict([]))),e.get("budget"));e.set("rate",$t606);}
e.set("rate",$aug("Mult",e.get("rate"),$bin("Mult",$item($call(e.get("innovation_modifiers"),[e.get("country")],$dict([])),"research"),$call($get($get(e.get("sim"),"rng"),"uniform"),[0.55,1.5],$dict([])))));{const $t607=$bin("Add",$call(e.get("getattr"),[e.get("country"),"innovation_progress",0],$dict([])),e.get("rate"));$set(e.get("country"),"innovation_progress",$t607);}
if($truth($compare([()=>$get(e.get("country"),"innovation_progress"),()=>$get(e.get("project"),"cost")], ["Lt"]))){return null;}else{}
{const $t608=$call($get($get(e.get("sim"),"rng"),"choice"),[$boolop("Or",[()=>Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t609 of $iter(e.get("adults"))){e.set("p",$t609);if($truth($compare([()=>$call(e.get("getattr"),[e.get("p"),"job",""],$dict([])),()=>$tuple(["scientist","scholar"])], ["In"]))){yield e.get("p");}}})();})(e)),()=>e.get("adults")])],$dict([]));e.set("actor",$t608);}
$call(e.get("award_innovation"),[e.get("sim"),e.get("country"),e.get("project"),e.get("actor")],$dict([]));
{const $t610=$call(e.get("max"),[0,$bin("Sub",$get(e.get("country"),"innovation_progress"),$get(e.get("project"),"cost"))],$dict([]));$set(e.get("country"),"innovation_progress",$t610);}
{const $t611=null;$set(e.get("country"),"innovation_project",$t611);}
return null;}));
e.set("award_innovation",$fn("award_innovation",e,["sim", "country", "project", "actor", "borrowed"],[undefined,undefined,undefined,undefined,false],null,null,[],[],e=>{if($truth($un("Not",$call(e.get("hasattr"),[e.get("country"),"innovations"],$dict([]))))){{const $t612=$dict([]);$set(e.get("country"),"innovations",$t612);}
}else{}
if($truth($boolop("Or",[()=>$compare([()=>$get(e.get("project"),"id"),()=>$get(e.get("country"),"innovations")], ["In"]),()=>$un("Not",$compare([()=>$get(e.get("project"),"prerequisites"),()=>$get(e.get("country"),"technologies")], ["LtE"]))]))){return false;}else{}
{const $t613=$get(e.get("sim"),"year");$setitem($get(e.get("country"),"innovations"),$get(e.get("project"),"id"),$t613);}
for(const $t614 of $iter($call(e.get("zip"),[$tuple(["food","prosperity","research","stability"]),$get(e.get("project"),"effects")],$dict([])))){{const $t615=Array.from($iter($t614));e.set("attribute",$t615[0]);e.set("gain",$t615[1]);}{const $t616=$bin("Add",$call(e.get("getattr"),[e.get("country"),e.get("attribute"),0],$dict([])),e.get("gain"));e.set("value",$t616);}
$call(e.get("setattr"),[e.get("country"),e.get("attribute"),($truth($compare([()=>e.get("attribute"),()=>"research"], ["Eq"]))?e.get("value"):$call(e.get("min"),[100,e.get("value")],$dict([])))],$dict([]));
}
{const $t617=$call(e.get("min"),[100,$bin("Add",$call(e.get("getattr"),[e.get("actor"),"fame",0],$dict([])),($truth(e.get("borrowed"))?4:10))],$dict([]));$set(e.get("actor"),"fame",$t617);}
{const $t618="scientist";$set(e.get("actor"),"job",$t618);}
{const $t619=($truth(e.get("borrowed"))?"introduced":"developed");e.set("verb",$t619);}
$call($get(e.get("sim"),"record"),[($fmt($call($get(e.get("sim"),"person_reference"),[e.get("actor")],$dict([])),-1,null)+" "+$fmt(e.get("verb"),-1,null)+" "+$fmt($call($get($get(e.get("project"),"name"),"lower"),[],$dict([])),-1,null)+" in "+$fmt($get(e.get("country"),"name"),-1,null)+"; "+$fmt($get(e.get("project"),"description"),-1,null)+" Its benefits now persist."),"discovery"],$dict([]));
return true;return null;}));
e.set("share_innovation",$fn("share_innovation",e,["sim", "donor", "recipient", "adults"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t620=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t621 of $iter($call(e.get("acquired_innovations"),[e.get("donor")],$dict([])))){e.set("item",$t621);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("item"),"id"),()=>$call(e.get("getattr"),[e.get("recipient"),"innovations",$dict([])],$dict([]))], ["NotIn"]),()=>$compare([()=>$get(e.get("item"),"prerequisites"),()=>$get(e.get("recipient"),"technologies")], ["LtE"])]))){yield e.get("item");}}})();})(e));e.set("ideas",$t620);}
if($truth($boolop("And",[()=>e.get("ideas"),()=>e.get("adults")]))){return $call(e.get("award_innovation"),[e.get("sim"),e.get("recipient"),$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("ideas")],$dict([])),$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("adults")],$dict([])),true],$dict([]));}else{}
return false;return null;}));
});
$register("epidemiology",e=>{e.set("Counter",$get($import("collections"),"Counter"));e.set("replace",$get($import("dataclasses"),"replace"));e.set("technology_modifiers",$get($import("society"),"technology_modifiers"));{const $t622=new PS(["medicine","surgery","herbal pharmacology","germ theory","vaccination"]);e.set("CURE_TECH",$t622);}
e.set("cure_progress",$fn("cure_progress",e,["sim"],[undefined],null,null,[],[],e=>{if($truth($un("Not",$call(e.get("hasattr"),[e.get("sim"),"cure_progress"],$dict([]))))){{const $t623=$dict([]);$set(e.get("sim"),"cure_progress",$t623);}
}else{}
return $get(e.get("sim"),"cure_progress");return null;}));
e.set("advance_cures",$fn("advance_cures",e,["sim"],[undefined],null,null,[],[],e=>{e.set("state",$get($import("systems"),"state"));{const $t624=$call(e.get("cure_progress"),[e.get("sim")],$dict([]));e.set("progress",$t624);}
{const $t625=$call(e.get("max"),[1,$call(e.get("len"),[$get(e.get("sim"),"people")],$dict([]))],$dict([]));e.set("total",$t625);}
{const $t626=$dict([]);e.set("scientists",$t626);}
{const $t627=$dict([]);e.set("healers",$t627);}
{const $t628=$dict([]);e.set("active",$t628);}
for(const $t629 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("person",$t629);if($truth($compare([()=>$get(e.get("person"),"age"),()=>18], ["GtE"]))){if($truth($compare([()=>$get(e.get("person"),"job"),()=>"scientist"], ["Eq"]))){{const $t630=$bin("Add",$call($get(e.get("scientists"),"get"),[$get(e.get("person"),"country"),0],$dict([])),1);$setitem(e.get("scientists"),$get(e.get("person"),"country"),$t630);}
}else{if($truth($compare([()=>$get(e.get("person"),"job"),()=>"healer"], ["Eq"]))){{const $t631=$bin("Add",$call($get(e.get("healers"),"get"),[$get(e.get("person"),"country"),0],$dict([])),1);$setitem(e.get("healers"),$get(e.get("person"),"country"),$t631);}
}else{}
}
}else{}
if($truth($get(e.get("person"),"infection"))){{const $t632=$tuple([$get(e.get("person"),"country"),$get(e.get("person"),"infection")]);e.set("key",$t632);}
{const $t633=$bin("Add",$call($get(e.get("active"),"get"),[e.get("key"),0],$dict([])),1);$setitem(e.get("active"),e.get("key"),$t633);}
}else{}
}
for(const $t634 of $iter($call(e.get("sorted"),[$get(e.get("sim"),"sicknesses")],$dict([])))){e.set("name",$t634);{const $t635=$item($get(e.get("sim"),"sicknesses"),e.get("name"));e.set("disease",$t635);}
{const $t636=0.0;e.set("effort",$t636);}
for(const $t637 of $iter($call(e.get("sorted"),[$call(e.get("set"),[$bin("Add",$call(e.get("list"),[e.get("scientists")],$dict([])),$call(e.get("list"),[e.get("healers")],$dict([])))],$dict([]))],$dict([])))){e.set("cid",$t637);{const $t638=$bin("Mult",$bin("Add",1,$item($call(e.get("technology_modifiers"),[$item($get(e.get("sim"),"countries"),e.get("cid"))],$dict([])),"cure")),$item($call(e.get("state"),[e.get("sim"),e.get("cid")],$dict([])),"cure_mult"));e.set("multiplier",$t638);}
{const $t639=($truth($call($get(e.get("active"),"get"),[$tuple([e.get("cid"),e.get("name")]),0],$dict([])))?1.0:0.3);e.set("weight",$t639);}
e.set("effort",$aug("Add",e.get("effort"),$bin("Mult",$bin("Add",$bin("Mult",$call($get(e.get("scientists"),"get"),[e.get("cid"),0],$dict([])),0.5),$bin("Mult",$call($get(e.get("healers"),"get"),[e.get("cid"),0],$dict([])),e.get("weight"))),e.get("multiplier"))));}
{const $t640=$call($get($dict([["acute",1.0],["chronic",2.0],["endemic",1.5]]),"get"),[$call(e.get("getattr"),[e.get("disease"),"course","acute"],$dict([])),1.0],$dict([]));e.set("difficulty",$t640);}
{const $t641=$call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t642 of $iter($call($get(e.get("active"),"items"),[],$dict([])))){{const $t643=Array.from($iter($t642));{const $t644=Array.from($iter($t643[0]));e.set("cid",$t644[0]);e.set("disease_name",$t644[1]);}e.set("count",$t643[1]);}if($truth($compare([()=>e.get("disease_name"),()=>e.get("name")], ["Eq"]))){yield e.get("count");}}})();})(e)],$dict([]));e.set("circulating",$t641);}
{const $t645=$bin("Mult",$bin("Div",$bin("Div",$bin("Mult",100,e.get("effort")),e.get("total")),e.get("difficulty")),($truth(e.get("circulating"))?1.0:0.4));e.set("gain",$t645);}
{const $t646=$call($get(e.get("progress"),"get"),[e.get("name"),0.0],$dict([]));e.set("before",$t646);}
{const $t647=$call(e.get("min"),[100.0,$bin("Add",e.get("before"),e.get("gain"))],$dict([]));$setitem(e.get("progress"),e.get("name"),$t647);}
if($truth($compare([()=>e.get("before"),()=>100,()=>$item(e.get("progress"),e.get("name"))], ["Lt", "LtE"]))){$call($get(e.get("sim"),"record"),[("Scientists and healers completed a cure for "+$fmt(e.get("name"),-1,null)+"; it will be eradicated as soon as no one is infected."),"sickness"],$dict([]));
}else{}
}
return null;}));
e.set("retire_disease",$fn("retire_disease",e,["sim", "name"],[undefined,undefined],null,null,[],[],e=>{for(const $t648 of $iter($call($get($get(e.get("sim"),"countries"),"values"),[],$dict([])))){e.set("c",$t648);if($truth($compare([()=>$get(e.get("c"),"sickness"),()=>e.get("name")], ["Eq"]))){{const $t649=null;$set(e.get("c"),"sickness",$t649);}
$call($get($get(e.get("c"),"conditions"),"discard"),["Disease"],$dict([]));
}else{}
{const $t650=$call($get($call(e.get("getattr"),[e.get("c"),"disease_outbreaks",$dict([])],$dict([])),"pop"),[e.get("name"),null],$dict([]));e.set("local",$t650);}
if($truth($compare([()=>e.get("local"),()=>null], ["IsNot"]))){if($truth($un("Not",$call(e.get("hasattr"),[e.get("c"),"retired_outbreaks"],$dict([]))))){{const $t651=$dict([]);$set(e.get("c"),"retired_outbreaks",$t651);}
}else{}
{const $t652=e.get("local");$setitem($get(e.get("c"),"retired_outbreaks"),e.get("name"),$t652);}
}else{}
}
if($truth($un("Not",$call(e.get("hasattr"),[e.get("sim"),"retired_sicknesses"],$dict([]))))){{const $t653=$dict([]);$set(e.get("sim"),"retired_sicknesses",$t653);}
}else{}
{const $t654=$call($get($get(e.get("sim"),"sicknesses"),"pop"),[e.get("name")],$dict([]));$setitem($get(e.get("sim"),"retired_sicknesses"),e.get("name"),$t654);}
return null;}));
e.set("auto_eradicate",$fn("auto_eradicate",e,["sim"],[undefined],null,null,[],[],e=>{{const $t655=$call(e.get("cure_progress"),[e.get("sim")],$dict([]));e.set("progress",$t655);}
{const $t656=$call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t657 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t657);if($truth($get(e.get("p"),"infection"))){yield $get(e.get("p"),"infection");}}})();})(e)],$dict([]));e.set("sick",$t656);}
for(const $t658 of $iter($call(e.get("sorted"),[$get(e.get("sim"),"sicknesses")],$dict([])))){e.set("name",$t658);if($truth($boolop("And",[()=>$compare([()=>$call($get(e.get("progress"),"get"),[e.get("name"),0.0],$dict([])),()=>100], ["GtE"]),()=>$compare([()=>$item(e.get("sick"),e.get("name")),()=>0], ["Eq"])]))){$call(e.get("retire_disease"),[e.get("sim"),e.get("name")],$dict([]));
$call($get(e.get("sim"),"record"),[($fmt(e.get("name"),-1,null)+" has been eradicated: the cure is complete and the last patient has recovered."),"sickness"],$dict([]));
}else{}
}
return null;}));
e.set("_profile",$fn("_profile",e,["sim", "name"],[undefined,undefined],null,null,[],[],e=>{{const $t659=$call(e.get("getattr"),[e.get("sim"),"disease_profiles",null],$dict([]));e.set("profiles",$t659);}
if($truth($compare([()=>e.get("profiles"),()=>null], ["Is"]))){{const $t660=$dict([]);e.set("profiles",$t660);$set(e.get("sim"),"disease_profiles",$t660);}
}else{}
if($truth($compare([()=>e.get("name"),()=>e.get("profiles")], ["NotIn"]))){{const $t661=$item($get(e.get("sim"),"sicknesses"),e.get("name"));e.set("disease",$t661);}
{const $t662=$call(e.get("getattr"),[e.get("disease"),"course",null],$dict([]));e.set("course",$t662);}
if($truth($compare([()=>e.get("course"),()=>new PS(["acute","chronic","endemic"])], ["NotIn"]))){{const $t663=$item($call($get($get(e.get("sim"),"rng"),"choices"),[$tuple(["acute","chronic","endemic"]),$tuple([72,10,18])],$dict([])),0);e.set("course",$t663);}
}else{}
if($truth($call(e.get("getattr"),[e.get("disease"),"recurring",false],$dict([])))){{const $t664="endemic";e.set("course",$t664);}
}else{}
{const $t665=$dict([["course",e.get("course")]]);$setitem(e.get("profiles"),e.get("name"),$t665);}
}else{}
return $item(e.get("profiles"),e.get("name"));return null;}));
e.set("_history",$fn("_history",e,["person", "kind", "name", "year"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t666=$call(e.get("getattr"),[e.get("person"),"infection_history",null],$dict([]));e.set("history",$t666);}
if($truth($compare([()=>e.get("history"),()=>null], ["Is"]))){{const $t667=[];e.set("history",$t667);$set(e.get("person"),"infection_history",$t667);}
}else{}
$call($get(e.get("history"),"append"),[$dict([["event",e.get("kind")],["disease",e.get("name")],["year",e.get("year")]])],$dict([]));
return null;}));
e.set("_local_outbreak",$fn("_local_outbreak",e,["sim", "country", "name"],[undefined,undefined,undefined],null,null,[],[],e=>{if($truth($un("Not",$call(e.get("hasattr"),[e.get("country"),"disease_outbreaks"],$dict([]))))){{const $t668=$dict([]);$set(e.get("country"),"disease_outbreaks",$t668);}
}else{}
return $call($get($get(e.get("country"),"disease_outbreaks"),"setdefault"),[e.get("name"),$dict([["age",0],["last_year",null],["cooldown_until",0],["episodes",0],["annual",[]],["seasonal",[]],["source",$compare([()=>$get(e.get("country"),"sickness"),()=>e.get("name")], ["Eq"])]])],$dict([]));return null;}));
e.set("_expire_immunity",$fn("_expire_immunity",e,["person", "year"],[undefined,undefined],null,null,[],[],e=>{for(const $t669 of $iter($call(e.get("list"),[$call($get($get(e.get("person"),"immunity_until"),"items"),[],$dict([]))],$dict([])))){{const $t670=Array.from($iter($t669));e.set("name",$t670[0]);e.set("expiry",$t670[1]);}if($truth($compare([()=>e.get("expiry"),()=>e.get("year")], ["LtE"]))){$call($get($get(e.get("person"),"immunity"),"discard"),[e.get("name")],$dict([]));
$del($get(e.get("person"),"immunity_until"),e.get("name"));}else{}
}
return null;}));
e.set("import_infections",$fn("import_infections",e,["sim"],[undefined],null,null,[],[],e=>{for(const $t671 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("person",$t671);$call(e.get("_expire_immunity"),[e.get("person"),$get(e.get("sim"),"year")],$dict([]));
}
{const $t672=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t673 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t673);if($truth($get(e.get("p"),"infection"))){yield e.get("p");}}})();})(e));e.set("infected",$t672);}
if($truth($un("Not",e.get("infected")))){return null;}else{}
e.set("neighbors",$get($import("geography"),"neighbors"));{const $t674=$call(e.get("neighbors"),[e.get("sim")],$dict([]));{const $t675=Array.from($iter($t674));e.set("land",$t675[0]);e.set("sea",$t675[1]);}}
{const $t676=$dict([]);e.set("by_country",$t676);}
for(const $t677 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("person",$t677);$call($get($call($get(e.get("by_country"),"setdefault"),[$get(e.get("person"),"country"),[]],$dict([])),"append"),[e.get("person")],$dict([]));
}
for(const $t678 of $iter($call($get(e.get("by_country"),"items"),[],$dict([])))){{const $t679=Array.from($iter($t678));e.set("cid",$t679[0]);e.set("residents",$t679[1]);}{const $t680=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t680);}
if($truth($boolop("Or",[()=>$get(e.get("country"),"quarantine"),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.15], ["GtE"])]))){continue;}else{}
{const $t681=$call(e.get("set"),[$call($get(e.get("land"),"get"),[e.get("cid"),$call(e.get("set"),[],$dict([]))],$dict([]))],$dict([]));e.set("reachable",$t681);}
if($truth($compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.3], ["Lt"]))){$call($get(e.get("reachable"),"update"),[$call($get(e.get("sea"),"get"),[e.get("cid"),$call(e.get("set"),[],$dict([]))],$dict([]))],$dict([]));
}else{}
{const $t682=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t683 of $iter(e.get("infected"))){e.set("p",$t683);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("p"),"country"),()=>e.get("reachable")], ["In"]),()=>$un("Not",$get($item($get(e.get("sim"),"countries"),$get(e.get("p"),"country")),"quarantine"))]))){yield e.get("p");}}})();})(e));e.set("sources",$t682);}
if($truth($un("Not",e.get("sources")))){continue;}else{}
{const $t684=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("sources")],$dict([]));e.set("source",$t684);}
{const $t685=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t686 of $iter(e.get("residents"))){e.set("p",$t686);if($truth($boolop("And",[()=>$un("Not",$get(e.get("p"),"infection")),()=>$compare([()=>$get(e.get("source"),"infection"),()=>$get(e.get("p"),"immunity")], ["NotIn"])]))){yield e.get("p");}}})();})(e));e.set("candidates",$t685);}
if($truth(e.get("candidates"))){{const $t687=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("candidates")],$dict([]));e.set("patient",$t687);}
{const $t688=$get(e.get("source"),"infection");$set(e.get("patient"),"infection",$t688);}
{const $t689=0;$set(e.get("patient"),"infection_steps",$t689);}
$call(e.get("_profile"),[e.get("sim"),$get(e.get("source"),"infection")],$dict([]));
$call(e.get("_history"),[e.get("patient"),"infected",$get(e.get("source"),"infection"),$get(e.get("sim"),"year")],$dict([]));
$call($get(e.get("sim"),"record"),[("Travelers brought "+$fmt($get(e.get("source"),"infection"),-1,null)+" from "+$fmt($get($item($get(e.get("sim"),"countries"),$get(e.get("source"),"country")),"name"),-1,null)+" to "+$fmt($get(e.get("country"),"name"),-1,null)+"; a new case was identified."),"sickness"],$dict([]));
}else{}
}
return null;}));
e.set("resolve_disease",$fn("resolve_disease",e,["sim", "country", "residents"],[undefined,undefined,undefined],null,null,[],[],e=>{{const $t690=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t691 of $iter(e.get("residents"))){e.set("p",$t691);if($truth($compare([()=>$get(e.get("p"),"id"),()=>$get(e.get("sim"),"people")], ["In"]))){yield e.get("p");}}})();})(e));e.set("residents",$t690);}
if($truth($un("Not",e.get("residents")))){return 0;}else{}
for(const $t692 of $iter(e.get("residents"))){e.set("person",$t692);$call(e.get("_expire_immunity"),[e.get("person"),$get(e.get("sim"),"year")],$dict([]));
}
{const $t693=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t694 of $iter(e.get("residents"))){e.set("p",$t694);if($truth($get(e.get("p"),"infection"))){yield $get(e.get("p"),"infection");}}})();})(e));e.set("local_names",$t693);}
$call($get(e.get("local_names"),"update"),[$call(e.get("getattr"),[e.get("country"),"disease_outbreaks",$dict([])],$dict([]))],$dict([]));
if($truth($get(e.get("country"),"sickness"))){$call($get(e.get("local_names"),"add"),[$get(e.get("country"),"sickness")],$dict([]));
}else{}
for(const $t695 of $iter(e.get("local_names"))){e.set("name",$t695);{const $t696=$call(e.get("_local_outbreak"),[e.get("sim"),e.get("country"),e.get("name")],$dict([]));e.set("state",$t696);}
if($truth($compare([()=>$get(e.get("country"),"sickness"),()=>e.get("name")], ["Eq"]))){{const $t697=true;$setitem(e.get("state"),"source",$t697);}
}else{}
if($truth($compare([()=>$item(e.get("state"),"last_year"),()=>$get(e.get("sim"),"year")], ["NotEq"]))){$setitem(e.get("state"),"age",$aug("Add",$item(e.get("state"),"age"),1));{const $t698=$get(e.get("sim"),"year");$setitem(e.get("state"),"last_year",$t698);}
}else{}
}
{const $t699=$call(e.get("getattr"),[e.get("sim"),"cure_progress",$dict([])],$dict([]));e.set("cures",$t699);}
{const $t700=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t701 of $iter(e.get("residents"))){e.set("p",$t701);if($truth($get(e.get("p"),"infection"))){yield e.get("p");}}})();})(e));e.set("initially_infected",$t700);}
{const $t702=$compare([()=>$bin("Div",$call(e.get("len"),[e.get("initially_infected")],$dict([])),$call(e.get("len"),[e.get("residents")],$dict([]))),()=>0.05], ["GtE"]);e.set("should_quarantine",$t702);}
if($truth($compare([()=>e.get("should_quarantine"),()=>$get(e.get("country"),"quarantine")], ["NotEq"]))){{const $t703=e.get("should_quarantine");$set(e.get("country"),"quarantine",$t703);}
$call($get(e.get("sim"),"record"),[($fmt($get(e.get("country"),"name"),-1,null)+" "+$fmt(($truth(e.get("should_quarantine"))?"restricted gatherings and travel":"lifted its quarantine"),-1,null)+"."),"sickness"],$dict([]));
}else{}
if($truth($get(e.get("country"),"quarantine"))){{const $t704=$call(e.get("max"),[0,$bin("Sub",$get(e.get("country"),"prosperity"),2)],$dict([]));$set(e.get("country"),"prosperity",$t704);}
}else{}
if($truth(e.get("initially_infected"))){{const $t705=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("initially_infected")],$dict([]));e.set("patient",$t705);}
{const $t706=$item($get(e.get("sim"),"sicknesses"),$get(e.get("patient"),"infection"));e.set("disease",$t706);}
if($truth($compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>$get(e.get("disease"),"mutation_chance")], ["Lt"]))){{const $t707=2;e.set("number",$t707);}
{const $t708=$item($call($get($get(e.get("disease"),"name"),"split"),[" strain "],$dict([])),0);e.set("root",$t708);}
{const $t709=($fmt(e.get("root"),-1,null)+" strain "+$fmt(e.get("number"),-1,null));e.set("name",$t709);}
while($truth($compare([()=>e.get("name"),()=>$get(e.get("sim"),"sicknesses")], ["In"]))){e.set("number",$aug("Add",e.get("number"),1));{const $t710=($fmt(e.get("root"),-1,null)+" strain "+$fmt(e.get("number"),-1,null));e.set("name",$t710);}
}
{const $t711=$call(e.get("replace"),[e.get("disease")],$dict([["name",e.get("name")],["infection_chance",$call(e.get("min"),[0.85,$bin("Mult",$get(e.get("disease"),"infection_chance"),$call($get($get(e.get("sim"),"rng"),"uniform"),[0.85,1.25],$dict([])))],$dict([]))],["death_chance",$call(e.get("min"),[0.2,$bin("Mult",$get(e.get("disease"),"death_chance"),$call($get($get(e.get("sim"),"rng"),"uniform"),[0.7,1.3],$dict([])))],$dict([]))]]));$setitem($get(e.get("sim"),"sicknesses"),e.get("name"),$t711);}
{const $t712=$call(e.get("_profile"),[e.get("sim"),$get(e.get("patient"),"infection")],$dict([]));e.set("parent_profile",$t712);}
{const $t713=$call(e.get("dict"),[e.get("parent_profile")],$dict([]));$setitem($get(e.get("sim"),"disease_profiles"),e.get("name"),$t713);}
{const $t714=$bin("Mult",$call($get($call(e.get("cure_progress"),[e.get("sim")],$dict([])),"get"),[$get(e.get("disease"),"name"),0.0],$dict([])),0.5);$setitem($call(e.get("cure_progress"),[e.get("sim")],$dict([])),e.get("name"),$t714);}
{const $t715=e.get("name");$set(e.get("patient"),"infection",$t715);}
{const $t716=0;$set(e.get("patient"),"infection_steps",$t716);}
$call(e.get("_history"),[e.get("patient"),"variant",e.get("name"),$get(e.get("sim"),"year")],$dict([]));
$call($get(e.get("sim"),"record"),[("A new variant, "+$fmt(e.get("name"),-1,null)+", emerged in "+$fmt($get(e.get("country"),"name"),-1,null)+"; immunity to earlier strains may not protect residents."),"sickness"],$dict([]));
}else{}
}else{}
{const $t717=$dict([]);e.set("counts",$t717);}
{const $t718=$call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t719 of $iter(e.get("initially_infected"))){e.set("p",$t719);if($truth($get(e.get("p"),"infection"))){yield $get(e.get("p"),"infection");}}})();})(e)],$dict([]));e.set("disease_starting_counts",$t718);}
{const $t720=0;e.set("deaths",$t720);}
{const $t721=$get(e.get("country"),"technologies");e.set("technology",$t721);}
{const $t722=$call(e.get("technology_modifiers"),[e.get("country")],$dict([]));e.set("modifiers",$t722);}
e.set("state",$get($import("systems"),"state"));{const $t723=$call(e.get("state"),[e.get("sim"),$get(e.get("country"),"id")],$dict([]));e.set("st",$t723);}
{const $t724=$item(e.get("modifiers"),"disease_death");e.set("medical",$t724);}
e.set("profile",$get($import("geography"),"profile"));{const $t725=$item($call(e.get("profile"),[e.get("sim"),$get(e.get("country"),"id")],$dict([])),"coastal");e.set("coastal",$t725);}
{const $t726=$item(e.get("modifiers"),"water");e.set("sanitation",$t726);}
{const $t727=$bin("Add",0.04,$item(e.get("modifiers"),"care"));e.set("care_fraction",$t727);}
{const $t728=$bin("Add",$call(e.get("max"),[5,$call(e.get("int"),[$bin("Mult",$call(e.get("len"),[e.get("residents")],$dict([])),e.get("care_fraction"))],$dict([]))],$dict([])),$item(e.get("st"),"care_bonus"));e.set("capacity",$t728);}
if($truth($compare([()=>"vaccination",()=>e.get("technology")], ["In"]))){{const $t729=$call(e.get("sorted"),[$bin("BitOr",new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t730 of $iter(e.get("residents"))){e.set("p",$t730);if($truth($get(e.get("p"),"infection"))){yield $get(e.get("p"),"infection");}}})();})(e)),($truth($get(e.get("country"),"sickness"))?new PS([$get(e.get("country"),"sickness")]):$call(e.get("set"),[],$dict([]))))],$dict([]));e.set("known",$t729);}
for(const $t731 of $iter(e.get("known"))){e.set("name",$t731);{const $t732=0;e.set("vaccinated",$t732);}
for(const $t733 of $iter(e.get("residents"))){e.set("person",$t733);if($truth($boolop("And",[()=>$un("Not",$get(e.get("person"),"infection")),()=>$compare([()=>e.get("name"),()=>$get(e.get("person"),"immunity")], ["NotIn"]),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.2], ["Lt"])]))){$call($get($get(e.get("person"),"immunity"),"add"),[e.get("name")],$dict([]));
{const $t734=$bin("Add",$get(e.get("sim"),"year"),$get($item($get(e.get("sim"),"sicknesses"),e.get("name")),"immunity_years"));$setitem($get(e.get("person"),"immunity_until"),e.get("name"),$t734);}
$call(e.get("_history"),[e.get("person"),"vaccinated",e.get("name"),$get(e.get("sim"),"year")],$dict([]));
e.set("vaccinated",$aug("Add",e.get("vaccinated"),1));}else{}
}
if($truth(e.get("vaccinated"))){{const $t735=$call(e.get("max"),[0,$bin("Sub",$get(e.get("country"),"prosperity"),1)],$dict([]));$set(e.get("country"),"prosperity",$t735);}
$call($get(e.get("sim"),"record"),[("A vaccination campaign in "+$fmt($get(e.get("country"),"name"),-1,null)+" protected "+$fmt(e.get("vaccinated"),-1,null)+" residents against "+$fmt(e.get("name"),-1,null)+"."),"sickness"],$dict([]));
}else{}
}
}else{}
for(const $t736 of $iter($call(e.get("range"),[4],$dict([])))){e.set("season",$t736);{const $t737=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t738 of $iter(e.get("residents"))){e.set("p",$t738);if($truth($compare([()=>$get(e.get("p"),"id"),()=>$get(e.get("sim"),"people")], ["In"]))){yield e.get("p");}}})();})(e));e.set("active",$t737);}
{const $t739=$call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t740 of $iter(e.get("active"))){e.set("p",$t740);if($truth($boolop("And",[()=>$get(e.get("p"),"infection"),()=>$compare([()=>$get(e.get("p"),"infection_steps"),()=>$get($item($get(e.get("sim"),"sicknesses"),$get(e.get("p"),"infection")),"incubation_steps")], ["GtE"])]))){yield $get(e.get("p"),"infection");}}})();})(e)],$dict([]));e.set("infectious",$t739);}
{const $t741=$call(e.get("set"),[e.get("infectious")],$dict([]));e.set("names",$t741);}
$call($get(e.get("names"),"update"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t742 of $iter(e.get("active"))){e.set("p",$t742);if($truth($get(e.get("p"),"infection"))){yield $get(e.get("p"),"infection");}}})();})(e)],$dict([]));
if($truth($get(e.get("country"),"sickness"))){$call($get(e.get("names"),"add"),[$get(e.get("country"),"sickness")],$dict([]));
}else{}
$call($get(e.get("names"),"update"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t743 of $iter($call($get($call(e.get("getattr"),[e.get("country"),"disease_outbreaks",$dict([])],$dict([])),"items"),[],$dict([])))){{const $t744=Array.from($iter($t743));e.set("name",$t744[0]);e.set("state",$t744[1]);}if($truth($boolop("And",[()=>$compare([()=>$item($call(e.get("_profile"),[e.get("sim"),e.get("name")],$dict([])),"course"),()=>"endemic"], ["Eq"]),()=>$item(e.get("state"),"source")]))){yield e.get("name");}}})();})(e)],$dict([]));
for(const $t745 of $iter(e.get("names"))){e.set("name",$t745);$call($get(e.get("counts"),"setdefault"),[e.get("name"),[0,0,0]],$dict([]));
}
{const $t746=$bin("Add",1,$bin("Mult",$call(e.get("min"),[1,$bin("Div",$call(e.get("max"),[0,$bin("Sub",$call(e.get("sum"),[$call($get(e.get("infectious"),"values"),[],$dict([]))],$dict([])),e.get("capacity"))],$dict([])),e.get("capacity"))],$dict([])),0.5));e.set("overload",$t746);}
{const $t747=$dict([]);e.set("season_prob",$t747);}
{const $t748=$compare([()=>$bin("Div",$call(e.get("sum"),[$call($get(e.get("infectious"),"values"),[],$dict([]))],$dict([])),$call(e.get("max"),[1,$call(e.get("len"),[e.get("active")],$dict([]))],$dict([]))),()=>0.08], ["GtE"]);e.set("seasonal_quarantine",$t748);}
for(const $t749 of $iter(e.get("active"))){e.set("person",$t749);{const $t750=false;e.set("newly_infected",$t750);}
if($truth($compare([()=>$get(e.get("person"),"infection"),()=>null], ["Is"]))){{const $t751=$call(e.get("sorted"),[$bin("Sub",e.get("names"),$get(e.get("person"),"immunity"))],$dict([]));e.set("candidates",$t751);}
if($truth($compare([()=>$call(e.get("len"),[e.get("candidates")],$dict([])),()=>1], ["Gt"]))){$call($get($get(e.get("sim"),"rng"),"shuffle"),[e.get("candidates")],$dict([]));
}else{}
for(const $t752 of $iter(e.get("candidates"))){e.set("name",$t752);{const $t753=$call($get(e.get("season_prob"),"get"),[e.get("name")],$dict([]));e.set("infection_probability",$t753);}
if($truth($compare([()=>e.get("infection_probability"),()=>null], ["Is"]))){{const $t754=$item($get(e.get("sim"),"sicknesses"),e.get("name"));e.set("disease",$t754);}
{const $t755=$call(e.get("_profile"),[e.get("sim"),e.get("name")],$dict([]));e.set("course",$t755);}
{const $t756=$call(e.get("_local_outbreak"),[e.get("sim"),e.get("country"),e.get("name")],$dict([]));e.set("local",$t756);}
{const $t757=($truth($compare([()=>$item(e.get("course"),"course"),()=>"acute"], ["Eq"]))?12:($truth($compare([()=>$item(e.get("course"),"course"),()=>"endemic"], ["Eq"]))?6:3));e.set("contacts",$t757);}
{const $t758=$call(e.get("min"),[4,$bin("Mult",$bin("Div",$item(e.get("infectious"),e.get("name")),$call(e.get("max"),[1,$call(e.get("len"),[e.get("active")],$dict([]))],$dict([]))),e.get("contacts"))],$dict([]));e.set("pressure",$t758);}
if($truth($boolop("Or",[()=>$compare([()=>$get(e.get("country"),"sickness"),()=>e.get("name")], ["Eq"]),()=>$boolop("And",[()=>$compare([()=>$item(e.get("course"),"course"),()=>"endemic"], ["Eq"]),()=>$item(e.get("local"),"source")])]))){if($truth($compare([()=>$item(e.get("course"),"course"),()=>"endemic"], ["Eq"]))){if($truth($compare([()=>$get(e.get("sim"),"year"),()=>$item(e.get("local"),"cooldown_until")], ["GtE"]))){{const $t759=$call(e.get("max"),[e.get("pressure"),($truth($compare([()=>e.get("season"),()=>$tuple([0,3])], ["In"]))?0.1:0.02)],$dict([]));e.set("pressure",$t759);}
}else{}
}else{if($truth($boolop("And",[()=>$compare([()=>$item(e.get("course"),"course"),()=>"acute"], ["Eq"]),()=>$compare([()=>$item(e.get("local"),"age"),()=>2], ["LtE"])]))){{const $t760=$call(e.get("max"),[e.get("pressure"),$bin("Div",0.18,$item(e.get("local"),"age"))],$dict([]));e.set("pressure",$t760);}
}else{if($truth($boolop("And",[()=>$compare([()=>$item(e.get("course"),"course"),()=>"chronic"], ["Eq"]),()=>$compare([()=>$item(e.get("local"),"age"),()=>2], ["LtE"])]))){{const $t761=$call(e.get("max"),[e.get("pressure"),0.12],$dict([]));e.set("pressure",$t761);}
}else{}
}
}
}else{}
if($truth($boolop("Or",[()=>$get(e.get("country"),"quarantine"),()=>e.get("seasonal_quarantine")]))){e.set("pressure",$aug("Mult",e.get("pressure"),0.55));}else{}
e.set("pressure",$aug("Mult",e.get("pressure"),$item(e.get("modifiers"),"infection")));e.set("pressure",$aug("Mult",e.get("pressure"),$item(e.get("st"),"infection_mult")));if($truth($boolop("And",[()=>$compare([()=>$get(e.get("disease"),"transmission"),()=>"waterborne"], ["Eq"]),()=>$compare([()=>$call(e.get("getattr"),[e.get("country"),"last_disaster_type",null],$dict([])),()=>"flood"], ["Eq"]),()=>$compare([()=>$bin("Sub",$get(e.get("sim"),"year"),$boolop("Or",[()=>$get(e.get("country"),"last_disaster_year"),()=>$un("USub",9)])),()=>2], ["LtE"])]))){e.set("pressure",$aug("Mult",e.get("pressure"),1.4));}else{}
e.set("pressure",$aug("Mult",e.get("pressure"),$bin("Sub",1,$bin("Div",$bin("Mult",0.4,$call($get(e.get("cures"),"get"),[e.get("name"),0],$dict([]))),100))));if($truth($compare([()=>$get(e.get("disease"),"transmission"),()=>"waterborne"], ["Eq"]))){e.set("pressure",$aug("Mult",e.get("pressure"),$bin("Mult",$bin("Mult",e.get("sanitation"),($truth($compare([()=>e.get("season"),()=>$tuple([1,2])], ["In"]))?1.3:0.8)),$bin("Add",1,$bin("Mult",0.3,e.get("coastal"))))));}else{if($truth($compare([()=>$get(e.get("disease"),"transmission"),()=>"respiratory"], ["Eq"]))){e.set("pressure",$aug("Mult",e.get("pressure"),$bin("Mult",($truth($compare([()=>e.get("season"),()=>$tuple([0,3])], ["In"]))?1.3:0.8),$item(e.get("modifiers"),"air"))));}else{e.set("pressure",$aug("Mult",e.get("pressure"),$item(e.get("modifiers"),"contact")));}
}
{const $t762=$bin("Sub",1,$bin("Pow",$bin("Sub",1,$get(e.get("disease"),"infection_chance")),$bin("Div",e.get("pressure"),4)));e.set("infection_probability",$t762);}
{const $t763=e.get("infection_probability");$setitem(e.get("season_prob"),e.get("name"),$t763);}
}else{}
if($truth($compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>e.get("infection_probability")], ["Lt"]))){{const $t764=e.get("name");$set(e.get("person"),"infection",$t764);}
{const $t765=0;$set(e.get("person"),"infection_steps",$t765);}
$call(e.get("_history"),[e.get("person"),"infected",e.get("name"),$get(e.get("sim"),"year")],$dict([]));
$setitem($item(e.get("counts"),e.get("name")),0,$aug("Add",$item($item(e.get("counts"),e.get("name")),0),1));{const $t766=true;e.set("newly_infected",$t766);}
break;}else{}
}
}else{}
if($truth($boolop("Or",[()=>$compare([()=>$get(e.get("person"),"infection"),()=>null], ["Is"]),()=>e.get("newly_infected")]))){continue;}else{}
{const $t767=$get(e.get("person"),"infection");e.set("name",$t767);}
{const $t768=$item($get(e.get("sim"),"sicknesses"),e.get("name"));e.set("disease",$t768);}
$set(e.get("person"),"infection_steps",$aug("Add",$get(e.get("person"),"infection_steps"),1));if($truth($compare([()=>$get(e.get("person"),"infection_steps"),()=>$get(e.get("disease"),"incubation_steps")], ["LtE"]))){continue;}else{}
{const $t769=($truth($boolop("Or",[()=>$compare([()=>$get(e.get("person"),"age"),()=>5], ["Lt"]),()=>$compare([()=>$get(e.get("person"),"age"),()=>65], ["GtE"])]))?1.35:1);e.set("vulnerability",$t769);}
{const $t770=$bin("Div",$call($get(e.get("cures"),"get"),[e.get("name"),0],$dict([])),100);e.set("cure",$t770);}
{const $t771=$bin("Sub",1,$bin("Pow",$bin("Sub",1,$get(e.get("disease"),"death_chance")),$bin("Div",$bin("Mult",$bin("Mult",$bin("Mult",$bin("Mult",e.get("medical"),e.get("overload")),e.get("vulnerability")),$bin("Sub",1,$bin("Mult",0.6,e.get("cure")))),$item(e.get("st"),"death_mult")),4)));e.set("hazard",$t771);}
if($truth($compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>e.get("hazard")], ["Lt"]))){{const $t772=$get(e.get("sim"),"year");$set(e.get("person"),"died",$t772);}
{const $t773=e.get("name");$set(e.get("person"),"cause_of_death",$t773);}
$call(e.get("_history"),[e.get("person"),"died",e.get("name"),$get(e.get("sim"),"year")],$dict([]));
$set($item($get(e.get("sim"),"lineages"),$get(e.get("person"),"lineage")),"deaths",$aug("Add",$get($item($get(e.get("sim"),"lineages"),$get(e.get("person"),"lineage")),"deaths"),1));$del($get(e.get("sim"),"people"),$get(e.get("person"),"id"));$setitem($item(e.get("counts"),e.get("name")),1,$aug("Add",$item($item(e.get("counts"),e.get("name")),1),1));e.set("deaths",$aug("Add",e.get("deaths"),1));}else{if($truth($compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>$bin("Sub",1,$bin("Pow",$bin("Sub",1,$get(e.get("disease"),"recovery_chance")),$bin("Div",$bin("Mult",0.25,$bin("Add",1,e.get("cure"))),e.get("medical"))))], ["Lt"]))){{const $t774=null;$set(e.get("person"),"infection",$t774);}
{const $t775=0;$set(e.get("person"),"infection_steps",$t775);}
$call($get($get(e.get("person"),"immunity"),"add"),[e.get("name")],$dict([]));
{const $t776=$bin("Add",$get(e.get("sim"),"year"),$get(e.get("disease"),"immunity_years"));$setitem($get(e.get("person"),"immunity_until"),e.get("name"),$t776);}
$call(e.get("_history"),[e.get("person"),"recovered",e.get("name"),$get(e.get("sim"),"year")],$dict([]));
$setitem($item(e.get("counts"),e.get("name")),2,$aug("Add",$item($item(e.get("counts"),e.get("name")),2),1));}else{}
}
}
{const $t777=$call(e.get("Counter"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t778 of $iter(e.get("residents"))){e.set("p",$t778);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("p"),"id"),()=>$get(e.get("sim"),"people")], ["In"]),()=>$get(e.get("p"),"infection")]))){yield $get(e.get("p"),"infection");}}})();})(e))],$dict([]));e.set("still",$t777);}
for(const $t779 of $iter(e.get("names"))){e.set("name",$t779);{const $t780=$call(e.get("_local_outbreak"),[e.get("sim"),e.get("country"),e.get("name")],$dict([]));e.set("local",$t780);}
$call($get($item(e.get("local"),"seasonal"),"append"),[$dict([["year",$get(e.get("sim"),"year")],["season",$bin("Add",e.get("season"),1)],["active",$item(e.get("still"),e.get("name"))],["infections",$item($item(e.get("counts"),e.get("name")),0)],["deaths",$item($item(e.get("counts"),e.get("name")),1)],["recoveries",$item($item(e.get("counts"),e.get("name")),2)]])],$dict([]));
}
}
{const $t781=$call(e.get("Counter"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t782 of $iter(e.get("residents"))){e.set("p",$t782);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("p"),"id"),()=>$get(e.get("sim"),"people")], ["In"]),()=>$get(e.get("p"),"infection")]))){yield $get(e.get("p"),"infection");}}})();})(e))],$dict([]));e.set("final",$t781);}
for(const $t783 of $iter($call(e.get("sorted"),[$call($get(e.get("counts"),"items"),[],$dict([]))],$dict([])))){{const $t784=Array.from($iter($t783));e.set("name",$t784[0]);{const $t785=Array.from($iter($t784[1]));e.set("infected",$t785[0]);e.set("killed",$t785[1]);e.set("recovered",$t785[2]);}}{const $t786=$item(e.get("final"),e.get("name"));e.set("remaining",$t786);}
{const $t787=$call(e.get("_local_outbreak"),[e.get("sim"),e.get("country"),e.get("name")],$dict([]));e.set("local",$t787);}
{const $t788=($truth($item(e.get("local"),"annual"))?$item($item($item(e.get("local"),"annual"),$un("USub",1)),"infections"):0);e.set("previous",$t788);}
{const $t789=($truth($compare([()=>e.get("infected"),()=>e.get("previous")], ["Gt"]))?"growing":($truth($compare([()=>e.get("infected"),()=>e.get("previous")], ["Lt"]))?"declining":"steady"));e.set("phase",$t789);}
$call($get($item(e.get("local"),"annual"),"append"),[$dict([["year",$get(e.get("sim"),"year")],["infections",e.get("infected")],["deaths",e.get("killed")],["recoveries",e.get("recovered")],["active",e.get("remaining")],["phase",e.get("phase")]])],$dict([]));
$call($get(e.get("sim"),"record"),[($fmt(e.get("name"),-1,null)+" in "+$fmt($get(e.get("country"),"name"),-1,null)+": "+$fmt(e.get("infected"),-1,null)+" new infections, "+$fmt(e.get("killed"),-1,null)+" deaths, "+$fmt(e.get("recovered"),-1,null)+" recoveries, "+$fmt(e.get("remaining"),-1,null)+" still infected; "+$fmt(e.get("phase"),-1,null)+"; care capacity "+$fmt(e.get("capacity"),-1,null)+"."),"sickness"],$dict([]));
if($truth($compare([()=>e.get("remaining"),()=>0], ["Eq"]))){{const $t790=$call(e.get("_profile"),[e.get("sim"),e.get("name")],$dict([]));e.set("course",$t790);}
if($truth($boolop("Or",[()=>$item(e.get("disease_starting_counts"),e.get("name")),()=>$item($item(e.get("counts"),e.get("name")),0)]))){$setitem(e.get("local"),"episodes",$aug("Add",$item(e.get("local"),"episodes"),1));{const $t791=($truth($compare([()=>$item(e.get("course"),"course"),()=>"endemic"], ["Eq"]))?$bin("Add",$get(e.get("sim"),"year"),2):$get(e.get("sim"),"year"));$setitem(e.get("local"),"cooldown_until",$t791);}
}else{}
if($truth($compare([()=>$get(e.get("country"),"sickness"),()=>e.get("name")], ["Eq"]))){if($truth($compare([()=>$item(e.get("course"),"course"),()=>"endemic"], ["NotEq"]))){{const $t792=null;$set(e.get("country"),"sickness",$t792);}
$call($get($get(e.get("country"),"conditions"),"discard"),["Disease"],$dict([]));
}else{}
}else{}
if($truth($boolop("Or",[()=>$item(e.get("disease_starting_counts"),e.get("name")),()=>$item($item(e.get("counts"),e.get("name")),0),()=>$item($item(e.get("counts"),e.get("name")),1),()=>$item($item(e.get("counts"),e.get("name")),2)]))){$call($get(e.get("sim"),"record"),[("The "+$fmt(e.get("name"),-1,null)+" outbreak in "+$fmt($get(e.get("country"),"name"),-1,null)+" ended."),"sickness"],$dict([]));
}else{}
}else{}
}
return e.get("deaths");return null;}));
});
$register("warfare",e=>{e.set("technology_modifiers",$get($import("society"),"technology_modifiers"));e.set("boosted_of",$get($import("society"),"boosted_of"));e.set("end_pact",$get($import("society"),"end_pact"));e.set("LETHALITY",$get($import("technology"),"LETHALITY"));e.set("UNIT_NAMES",$get($import("technology"),"UNIT_NAMES"));e.set("outclassed",$fn("outclassed",e,["own", "foe"],[undefined,undefined],null,null,[],[],e=>{return $call(e.get("max"),[0.6,$call(e.get("min"),[1.6,$bin("Add",1,$bin("Mult",0.15,$bin("Sub",e.get("foe"),e.get("own"))))],$dict([]))],$dict([]));return null;}));
e.set("siege_odds",$fn("siege_odds",e,["attacker_mods", "defender_mods"],[undefined,undefined],null,null,[],[],e=>{return $call(e.get("max"),[0.4,$call(e.get("min"),[2.0,$bin("Mult",$bin("Add",1,$item(e.get("attacker_mods"),"siege")),$item(e.get("defender_mods"),"defense"))],$dict([]))],$dict([]));return null;}));
e.set("_transfer",$fn("_transfer",e,["sim", "victor", "defeated", "settlement"],[undefined,undefined,undefined,null],null,null,[],[],e=>{for(const $t793 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("person",$t793);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("person"),"country"),()=>e.get("defeated")], ["Eq"]),()=>$boolop("Or",[()=>$compare([()=>e.get("settlement"),()=>null], ["Is"]),()=>$compare([()=>$get(e.get("person"),"settlement"),()=>$get(e.get("settlement"),"id")], ["Eq"])])]))){{const $t794=e.get("victor");$set(e.get("person"),"country",$t794);}
}else{}
}
for(const $t795 of $iter($call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([])))){e.set("place",$t795);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("place"),"country"),()=>e.get("defeated")], ["Eq"]),()=>$boolop("Or",[()=>$compare([()=>e.get("settlement"),()=>null], ["Is"]),()=>$compare([()=>$get(e.get("place"),"id"),()=>$get(e.get("settlement"),"id")], ["Eq"])])]))){{const $t796=e.get("victor");$set(e.get("place"),"country",$t796);}
}else{}
}
{const $t797=$item($get(e.get("sim"),"countries"),e.get("defeated"));e.set("losing",$t797);}
if($truth($compare([()=>$get($item($get(e.get("sim"),"countries"),e.get("victor")),"capital"),()=>null], ["Is"]))){{const $t798=$call(e.get("next"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t799 of $iter($call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([])))){e.set("s",$t799);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("s"),"country"),()=>e.get("victor")], ["Eq"]),()=>$compare([()=>$get(e.get("s"),"abandoned"),()=>null], ["Is"])]))){yield $get(e.get("s"),"id");}}})();})(e),null],$dict([]));$set($item($get(e.get("sim"),"countries"),e.get("victor")),"capital",$t798);}
}else{}
if($truth($compare([()=>e.get("settlement"),()=>null], ["Is"]))){{const $t800=null;$set(e.get("losing"),"capital",$t800);}
{const $t801=$get(e.get("sim"),"year");$set(e.get("losing"),"ended",$t801);}
$set($item($get(e.get("sim"),"countries"),e.get("victor")),"capacity",$aug("Add",$get($item($get(e.get("sim"),"countries"),e.get("victor")),"capacity"),$get(e.get("losing"),"capacity")));{const $t802=$item($get(e.get("sim"),"countries"),e.get("victor"));e.set("winning",$t802);}
{const $t803=0;e.set("studied",$t803);}
for(const $t804 of $iter($call(e.get("sorted"),[$get(e.get("losing"),"technologies")],$dict([])))){e.set("name",$t804);if($truth($boolop("And",[()=>$compare([()=>e.get("name"),()=>$get(e.get("winning"),"technologies")], ["NotIn"]),()=>$compare([()=>e.get("name"),()=>$call(e.get("boosted_of"),[e.get("winning")],$dict([]))], ["NotIn"])]))){$call($get($call(e.get("boosted_of"),[e.get("winning")],$dict([])),"add"),[e.get("name")],$dict([]));
e.set("studied",$aug("Add",e.get("studied"),1));}else{}
}
if($truth(e.get("studied"))){$call($get(e.get("sim"),"record"),[("Scholars of "+$fmt($get(e.get("winning"),"name"),-1,null)+" began studying "+$fmt(e.get("studied"),-1,null)+" discoveries of "+$fmt($get(e.get("losing"),"name"),-1,null)+"; researching them will go twice as fast."),"discovery"],$dict([]));
}else{}
if($truth($un("Not",$call(e.get("hasattr"),[e.get("winning"),"innovations"],$dict([]))))){{const $t805=$dict([]);$set(e.get("winning"),"innovations",$t805);}
}else{}
for(const $t806 of $iter($call(e.get("getattr"),[e.get("losing"),"innovations",$dict([])],$dict([])))){e.set("key",$t806);$call($get($get(e.get("winning"),"innovations"),"setdefault"),[e.get("key"),$get(e.get("sim"),"year")],$dict([]));
}
{const $t807=$bin("Add",$call(e.get("getattr"),[e.get("winning"),"treasury",0],$dict([])),$call(e.get("getattr"),[e.get("losing"),"treasury",0],$dict([])));$set(e.get("winning"),"treasury",$t807);}
{const $t808=0;$set(e.get("losing"),"treasury",$t808);}
{const $t809=e.get("victor");$set(e.get("losing"),"absorbed_by",$t809);}
{const $t810=$dict([]);$set(e.get("losing"),"offices",$t810);}
{const $t811=null;$set(e.get("losing"),"ruler",$t811);}
}else{if($truth($compare([()=>$get(e.get("losing"),"capital"),()=>$get(e.get("settlement"),"id")], ["Eq"]))){{const $t812=$call(e.get("next"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t813 of $iter($call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([])))){e.set("s",$t813);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("s"),"country"),()=>e.get("defeated")], ["Eq"]),()=>$compare([()=>$get(e.get("s"),"abandoned"),()=>null], ["Is"])]))){yield $get(e.get("s"),"id");}}})();})(e),null],$dict([]));$set(e.get("losing"),"capital",$t812);}
}else{}
}
return null;}));
e.set("_objective",$fn("_objective",e,["sim", "attacker", "target"],[undefined,undefined,undefined],null,null,[],[],e=>{e.set("distance_to_country",$get($import("geography"),"distance_to_country"));{const $t814=null;e.set("best",$t814);}
{const $t815=1000.0;e.set("best_distance",$t815);}
for(const $t816 of $iter($call(e.get("sorted"),[$call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([]))],$dict([["key",$fn("<lambda>",e,["s"],[undefined],null,null,[],[],e=>{return $get(e.get("s"),"id");return null;})]])))){e.set("place",$t816);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("place"),"country"),()=>e.get("target")], ["Eq"]),()=>$compare([()=>$get(e.get("place"),"abandoned"),()=>null], ["Is"])]))){{const $t817=$call(e.get("distance_to_country"),[e.get("sim"),e.get("place"),e.get("attacker")],$dict([]));e.set("distance",$t817);}
if($truth($compare([()=>e.get("distance"),()=>e.get("best_distance")], ["Lt"]))){{const $t818=e.get("distance");e.set("best_distance",$t818);}
{const $t819=$get(e.get("place"),"id");e.set("best",$t819);}
}else{}
}else{}
}
return e.get("best");return null;}));
e.set("resolve_wars",$fn("resolve_wars",e,["sim"],[undefined],null,null,[],[],e=>{if($truth($un("Not",$call(e.get("hasattr"),[e.get("sim"),"war_details"],$dict([]))))){{const $t820=$dict([]);$set(e.get("sim"),"war_details",$t820);}
}else{}
if($truth($un("Not",$call(e.get("hasattr"),[e.get("sim"),"truces"],$dict([]))))){{const $t821=$dict([]);$set(e.get("sim"),"truces",$t821);}
}else{}
for(const $t822 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("person",$t822);if($truth($compare([()=>$call(e.get("getattr"),[e.get("person"),"wounded_until",0],$dict([])),()=>$get(e.get("sim"),"year")], ["LtE"]))){{const $t823=0;$set(e.get("person"),"wounded_until",$t823);}
}else{}
}
{const $t824=$dict([]);e.set("residents",$t824);}
for(const $t825 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("person",$t825);$call($get($call($get(e.get("residents"),"setdefault"),[$get(e.get("person"),"country"),[]],$dict([])),"append"),[e.get("person")],$dict([]));
}
{const $t826=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t828 of $iter($get(e.get("sim"),"wars"))){e.set("pair",$t828);for(const $t827 of $iter(e.get("pair"))){e.set("cid",$t827);yield e.get("cid");}}})();})(e));e.set("busy",$t826);}
{const $t829=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t831 of $iter($call($get(e.get("residents"),"items"),[],$dict([])))){{const $t832=Array.from($iter($t831));e.set("cid",$t832[0]);e.set("people",$t832[1]);}if($truth($boolop("And",[()=>$compare([()=>e.get("cid"),()=>e.get("busy")], ["NotIn"]),()=>$compare([()=>$get($item($get(e.get("sim"),"countries"),e.get("cid")),"ended"),()=>null], ["Is"]),()=>$compare([()=>$call(e.get("sum"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t830 of $iter(e.get("people"))){e.set("p",$t830);yield $compare([()=>18,()=>$get(e.get("p"),"age"),()=>60], ["LtE", "LtE"]);}})();})(e)],$dict([])),()=>5], ["GtE"])]))){yield e.get("cid");}}})();})(e));e.set("available",$t829);}
$call($get($get(e.get("sim"),"rng"),"shuffle"),[e.get("available")],$dict([]));
e.set("contacts",$get($import("geography"),"contacts"));e.set("defense",$get($import("geography"),"defense"));e.set("state",$get($import("systems"),"state"));e.set("war_friction",$get($import("systems"),"war_friction"));e.set("damage_buildings",$get($import("development"),"damage_buildings"));e.set("besieging",$get($import("development"),"besieging"));{const $t833=$call(e.get("contacts"),[e.get("sim")],$dict([]));{const $t834=Array.from($iter($t833));e.set("bordering",$t834[0]);e.set("_sea",$t834[1]);}}
{const $t835=$call(e.get("set"),[],$dict([]));e.set("paired",$t835);}
for(const $t836 of $iter(e.get("available"))){e.set("cid",$t836);if($truth($compare([()=>e.get("cid"),()=>e.get("paired")], ["In"]))){continue;}else{}
{const $t837=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t838 of $iter(e.get("available"))){e.set("o",$t838);if($truth($boolop("And",[()=>$compare([()=>e.get("o"),()=>e.get("cid")], ["NotEq"]),()=>$compare([()=>e.get("o"),()=>e.get("paired")], ["NotIn"]),()=>$compare([()=>e.get("o"),()=>$call($get(e.get("bordering"),"get"),[e.get("cid"),$call(e.get("set"),[],$dict([]))],$dict([]))], ["In"])]))){yield e.get("o");}}})();})(e));e.set("options",$t837);}
if($truth($un("Not",e.get("options")))){continue;}else{}
{const $t839=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("options")],$dict([]));e.set("other",$t839);}
$call($get(e.get("paired"),"add"),[e.get("cid")],$dict([]));
$call($get(e.get("paired"),"add"),[e.get("other")],$dict([]));
{const $t840=$call(e.get("tuple"),[$call(e.get("sorted"),[[e.get("cid"),e.get("other")]],$dict([]))],$dict([]));e.set("pair",$t840);}
if($truth($compare([()=>$call($get($get(e.get("sim"),"truces"),"get"),[e.get("pair"),$un("USub",1)],$dict([])),()=>$get(e.get("sim"),"year")], ["Gt"]))){continue;}else{}
{const $t841=$call(e.get("war_friction"),[e.get("sim"),$item(e.get("pair"),0),$item(e.get("pair"),1)],$dict([]));{const $t842=Array.from($iter($t841));e.set("friction",$t842[0]);e.set("envy",$t842[1]);}}
if($truth($compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>$bin("Mult",$get(e.get("sim"),"war_chance"),e.get("friction"))], ["Lt"]))){{const $t843=$get(e.get("sim"),"year");$setitem($get(e.get("sim"),"wars"),e.get("pair"),$t843);}
$call(e.get("end_pact"),[e.get("sim"),$item($get(e.get("sim"),"countries"),$item(e.get("pair"),0)),$item($get(e.get("sim"),"countries"),$item(e.get("pair"),1))],$dict([]));
{const $t844=["a disputed frontier","raids on merchants","rival claims to farmland","a broken tribute agreement"];e.set("causes",$t844);}
if($truth(e.get("envy"))){e.set("causes",$aug("Add",e.get("causes"),["control of the ore hills","control of the ore hills"]));}else{}
{const $t845=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("causes")],$dict([]));e.set("cause",$t845);}
$call($get(e.get("sim"),"record"),[($fmt($get($item($get(e.get("sim"),"countries"),$item(e.get("pair"),0)),"name"),-1,null)+" declared war on "+$fmt($get($item($get(e.get("sim"),"countries"),$item(e.get("pair"),1)),"name"),-1,null)+" over "+$fmt(e.get("cause"),-1,null)+"."),"war"],$dict([]));
}else{}
}
{const $t846=0;e.set("deaths",$t846);}
for(const $t847 of $iter($call(e.get("list"),[$call($get($get(e.get("sim"),"wars"),"items"),[],$dict([]))],$dict([])))){{const $t848=Array.from($iter($t847));e.set("pair",$t848[0]);e.set("started",$t848[1]);}{const $t849=e.get("pair");{const $t850=Array.from($iter($t849));e.set("a",$t850[0]);e.set("b",$t850[1]);}}
{const $t851=[$item($get(e.get("sim"),"countries"),e.get("a")),$item($get(e.get("sim"),"countries"),e.get("b"))];e.set("countries",$t851);}
{const $t852=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t854 of $iter(e.get("pair"))){e.set("cid",$t854);yield Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t853 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t853);if($truth($compare([()=>$get(e.get("p"),"country"),()=>e.get("cid")], ["Eq"]))){yield e.get("p");}}})();})(e));}})();})(e));e.set("sides",$t852);}
{const $t855=$call($get($get(e.get("sim"),"war_details"),"setdefault"),[e.get("pair"),$dict([["exhaustion",[0.0,0.0]],["score",0.0]])],$dict([]));e.set("detail",$t855);}
$call($get(e.get("detail"),"setdefault"),["captures",[0,0]],$dict([]));
$call($get(e.get("detail"),"setdefault"),["objectives",Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t856 of $iter($call(e.get("range"),[2],$dict([])))){e.set("i",$t856);yield $call(e.get("_objective"),[e.get("sim"),$item(e.get("pair"),e.get("i")),$item(e.get("pair"),$bin("Sub",1,e.get("i")))],$dict([]));}})();})(e))],$dict([]));
if($truth($boolop("Or",[()=>$un("Not",$call(e.get("all"),[e.get("sides")],$dict([]))),()=>$call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t857 of $iter(e.get("countries"))){e.set("c",$t857);yield $compare([()=>$get(e.get("c"),"ended"),()=>null], ["IsNot"]);}})();})(e)],$dict([]))]))){$call($get(e.get("sim"),"record"),[("War between "+$fmt($get($item(e.get("countries"),0),"name"),-1,null)+" and "+$fmt($get($item(e.get("countries"),1),"name"),-1,null)+" ended: one country has no residents."),"war"],$dict([]));
$del($get(e.get("sim"),"wars"),e.get("pair"));$call($get($get(e.get("sim"),"war_details"),"pop"),[e.get("pair"),null],$dict([]));
continue;}else{}
{const $t858=[];e.set("armies",$t858);}
{const $t859=[];e.set("supplies",$t859);}
{const $t860=[];e.set("powers",$t860);}
for(const $t861 of $iter($call(e.get("enumerate"),[$call(e.get("zip"),[e.get("countries"),e.get("sides")],$dict([]))],$dict([])))){{const $t862=Array.from($iter($t861));e.set("i",$t862[0]);{const $t863=Array.from($iter($t862[1]));e.set("country",$t863[0]);e.set("side",$t863[1]);}}{const $t864=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t865 of $iter(e.get("side"))){e.set("p",$t865);if($truth($boolop("And",[()=>$compare([()=>18,()=>$get(e.get("p"),"age"),()=>55], ["LtE", "LtE"]),()=>$compare([()=>$get(e.get("p"),"infection"),()=>null], ["Is"]),()=>$compare([()=>$call(e.get("getattr"),[e.get("p"),"wounded_until",0],$dict([])),()=>$get(e.get("sim"),"year")], ["LtE"])]))){yield e.get("p");}}})();})(e));e.set("adults",$t864);}
{const $t866=$call(e.get("technology_modifiers"),[e.get("country")],$dict([]));e.set("innovation",$t866);}
{const $t867=$call(e.get("state"),[e.get("sim"),$get(e.get("country"),"id")],$dict([]));e.set("st",$t867);}
{const $t868=$call(e.get("min"),[$call(e.get("int"),[$bin("Mult",$call(e.get("len"),[e.get("adults")],$dict([])),0.22)],$dict([])),$call(e.get("int"),[$bin("Mult",$call(e.get("len"),[e.get("side")],$dict([])),0.08)],$dict([])),$call(e.get("int"),[$bin("Mult",$bin("Mult",$bin("Mult",$call(e.get("len"),[e.get("side")],$dict([])),0.1),$call(e.get("min"),[1,$bin("Div",$get(e.get("country"),"food"),60)],$dict([]))),$item(e.get("innovation"),"logistics"))],$dict([]))],$dict([]));e.set("levy",$t868);}
$call($get(e.get("armies"),"append"),[$call($get($get(e.get("sim"),"rng"),"sample"),[e.get("adults"),e.get("levy")],$dict([]))],$dict([]));
{const $t869=0.0;e.set("supply_bonus",$t869);}
{const $t870=$call(e.get("max"),[0.25,$call(e.get("min"),[1.2,$bin("Add",$bin("Add",$bin("Mult",$bin("Div",$get(e.get("country"),"food"),65),$item(e.get("innovation"),"logistics")),e.get("supply_bonus")),$item(e.get("st"),"supply_bonus"))],$dict([]))],$dict([]));e.set("supply",$t870);}
$call($get(e.get("supplies"),"append"),[e.get("supply")],$dict([]));
{const $t871=$item(e.get("innovation"),"military");e.set("technology",$t871);}
{const $t872=$call(e.get("max"),[0.3,$bin("Sub",$bin("Add",0.65,$bin("Div",$get(e.get("country"),"stability"),100)),$bin("Div",$item($item(e.get("detail"),"exhaustion"),e.get("i")),150))],$dict([]));e.set("morale",$t872);}
$call($get(e.get("powers"),"append"),[$bin("Mult",$bin("Mult",$bin("Mult",$bin("Mult",$bin("Mult",$bin("Mult",e.get("levy"),e.get("supply")),e.get("technology")),e.get("morale")),$call(e.get("defense"),[e.get("sim"),$get(e.get("country"),"id")],$dict([]))),$item(e.get("st"),"power_mult")),$call($get($get(e.get("sim"),"rng"),"uniform"),[0.75,1.25],$dict([])))],$dict([]));
{const $t873=$call(e.get("max"),[0,$bin("Sub",$bin("Sub",$get(e.get("country"),"food"),1),$bin("Div",$bin("Mult",45,e.get("levy")),$call(e.get("max"),[1,$call(e.get("len"),[e.get("side")],$dict([]))],$dict([]))))],$dict([]));$set(e.get("country"),"food",$t873);}
{const $t874=$call(e.get("max"),[0,$bin("Sub",$get(e.get("country"),"prosperity"),2)],$dict([]));$set(e.get("country"),"prosperity",$t874);}
{const $t875=$call(e.get("max"),[0,$bin("Sub",$get(e.get("country"),"stability"),1)],$dict([]));$set(e.get("country"),"stability",$t875);}
}
{const $t876=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t877 of $iter(e.get("armies"))){e.set("army",$t877);yield $call(e.get("len"),[e.get("army")],$dict([]));}})();})(e));$setitem(e.get("detail"),"mobilized",$t876);}
{const $t878=$item(e.get("supplies"),$slice(null,null,null));$setitem(e.get("detail"),"supplies",$t878);}
{const $t879=$call($get($get(e.get("sim"),"rng"),"choice"),[["border raids","field battle","field battle","siege","supply campaign"]],$dict([]));e.set("mode",$t879);}
if($truth($un("Not",$call(e.get("any"),[e.get("armies")],$dict([]))))){$call($get(e.get("sim"),"record"),[($fmt($get($item(e.get("countries"),0),"name"),-1,null)+" and "+$fmt($get($item(e.get("countries"),1),"name"),-1,null)+" suspended hostilities: neither could recruit a healthy adult force; a four-year truce began."),"war"],$dict([]));
{const $t880=$bin("Add",$get(e.get("sim"),"year"),4);$setitem($get(e.get("sim"),"truces"),$call(e.get("tuple"),[$call(e.get("sorted"),[e.get("pair")],$dict([]))],$dict([])),$t880);}
$del($get(e.get("sim"),"wars"),e.get("pair"));$call($get($get(e.get("sim"),"war_details"),"pop"),[e.get("pair"),null],$dict([]));
continue;}else{}
{const $t881=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t882 of $iter(e.get("countries"))){e.set("c",$t882);yield $call(e.get("technology_modifiers"),[e.get("c")],$dict([]));}})();})(e));e.set("mods",$t881);}
if($truth($compare([()=>e.get("mode"),()=>"siege"], ["Eq"]))){for(const $t883 of $iter($call(e.get("range"),[2],$dict([])))){e.set("i",$t883);$setitem(e.get("powers"),e.get("i"),$aug("Mult",$item(e.get("powers"),e.get("i")),$bin("Mult",$bin("Add",1,$bin("Mult",$bin("Sub",1,$item($item(e.get("mods"),e.get("i")),"defense")),1.6)),$bin("Add",1,$bin("Mult",$item($item(e.get("mods"),e.get("i")),"siege"),0.5)))));}
}else{}
{const $t884=$item($dict([["border raids",0.06],["field battle",0.12],["siege",0.09],["supply campaign",0.025]]),e.get("mode"));e.set("intensity",$t884);}
{const $t885=[$item($item(e.get("mods"),0),"weapon"),$item($item(e.get("mods"),1),"weapon")];e.set("tiers",$t885);}
e.set("intensity",$aug("Mult",e.get("intensity"),$item(e.get("LETHALITY"),$call(e.get("max"),[e.get("tiers")],$dict([])))));{const $t886=[];e.set("losses",$t886);}
{const $t887=[];e.set("wounded",$t887);}
for(const $t888 of $iter($call(e.get("enumerate"),[e.get("armies")],$dict([])))){{const $t889=Array.from($iter($t888));e.set("i",$t889[0]);e.set("army",$t889[1]);}{const $t890=$call(e.get("min"),[2.5,$bin("Div",$item(e.get("powers"),$bin("Sub",1,e.get("i"))),$call(e.get("max"),[1,$item(e.get("powers"),e.get("i"))],$dict([])))],$dict([]));e.set("pressure",$t890);}
{const $t891=$call(e.get("min"),[0.5,$bin("Add",$bin("Mult",e.get("intensity"),e.get("pressure")),$bin("Mult",0.035,$bin("Sub",1,$call(e.get("min"),[1,$item(e.get("supplies"),e.get("i"))],$dict([])))))],$dict([]));e.set("risk",$t891);}
{const $t892=$call(e.get("technology_modifiers"),[$item(e.get("countries"),e.get("i"))],$dict([]));e.set("modifiers",$t892);}
e.set("risk",$aug("Mult",e.get("risk"),$bin("Mult",$bin("Mult",$item(e.get("modifiers"),"defense"),$item(e.get("modifiers"),"wound_death")),$item($call(e.get("state"),[e.get("sim"),$get($item(e.get("countries"),e.get("i")),"id")],$dict([])),"defense_mult"))));e.set("risk",$aug("Mult",e.get("risk"),$call(e.get("outclassed"),[$item(e.get("tiers"),e.get("i")),$item(e.get("tiers"),$bin("Sub",1,e.get("i")))],$dict([]))));{const $t893=[];e.set("killed",$t893);}
{const $t894=[];e.set("injuries",$t894);}
for(const $t895 of $iter(e.get("army"))){e.set("person",$t895);{const $t896=$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([]));e.set("roll",$t896);}
if($truth($compare([()=>e.get("roll"),()=>e.get("risk")], ["Lt"]))){$call($get(e.get("killed"),"append"),[e.get("person")],$dict([]));
}else{if($truth($compare([()=>e.get("roll"),()=>$call(e.get("min"),[0.8,$bin("Mult",e.get("risk"),3)],$dict([]))], ["Lt"]))){{const $t897=$bin("Add",$get(e.get("sim"),"year"),$call($get($get(e.get("sim"),"rng"),"randint"),[1,3],$dict([])));$set(e.get("person"),"wounded_until",$t897);}
$call($get(e.get("injuries"),"append"),[e.get("person")],$dict([]));
}else{}
}
}
$call($get(e.get("wounded"),"append"),[$call(e.get("len"),[e.get("injuries")],$dict([]))],$dict([]));
for(const $t898 of $iter(e.get("killed"))){e.set("person",$t898);{const $t899=$get(e.get("sim"),"year");$set(e.get("person"),"died",$t899);}
{const $t900="war";$set(e.get("person"),"cause_of_death",$t900);}
$set($item($get(e.get("sim"),"lineages"),$get(e.get("person"),"lineage")),"deaths",$aug("Add",$get($item($get(e.get("sim"),"lineages"),$get(e.get("person"),"lineage")),"deaths"),1));$del($get(e.get("sim"),"people"),$get(e.get("person"),"id"));}
$call($get(e.get("losses"),"append"),[$call(e.get("len"),[e.get("killed")],$dict([]))],$dict([]));
$setitem($item(e.get("detail"),"exhaustion"),e.get("i"),$aug("Add",$item($item(e.get("detail"),"exhaustion"),e.get("i")),$bin("Add",$bin("Add",$bin("Add",5,$bin("Mult",$bin("Div",$call(e.get("len"),[e.get("killed")],$dict([])),$call(e.get("max"),[1,$call(e.get("len"),[e.get("army")],$dict([]))],$dict([]))),40)),$bin("Mult",$bin("Sub",1,$call(e.get("min"),[1,$item(e.get("supplies"),e.get("i"))],$dict([]))),8)),$bin("Mult",1.2,$call(e.get("max"),[e.get("tiers")],$dict([]))))));}
e.set("deaths",$aug("Add",e.get("deaths"),$call(e.get("sum"),[e.get("losses")],$dict([]))));{const $t901=($truth($compare([()=>$item(e.get("powers"),0),()=>$item(e.get("powers"),1)], ["Gt"]))?0:1);e.set("winner",$t901);}
$setitem(e.get("detail"),"score",$aug("Add",$item(e.get("detail"),"score"),$bin("Mult",($truth($compare([()=>e.get("winner"),()=>0], ["Eq"]))?1:$un("USub",1)),$call(e.get("min"),[3,$bin("Div",$call(e.get("max"),[e.get("powers")],$dict([])),$call(e.get("max"),[1,$call(e.get("min"),[e.get("powers")],$dict([]))],$dict([])))],$dict([])))));$call($get(e.get("sim"),"record"),[("War update (year "+$fmt($bin("Add",$bin("Sub",$get(e.get("sim"),"year"),e.get("started")),1),-1,null)+"): "+$fmt(e.get("mode"),-1,null)+"; "+$fmt($get($item(e.get("countries"),0),"name"),-1,null)+" lost "+$fmt($item(e.get("losses"),0),-1,null)+" of "+$fmt($call(e.get("len"),[$item(e.get("armies"),0)],$dict([])),-1,null)+" levies, "+$fmt($get($item(e.get("countries"),1),"name"),-1,null)+" lost "+$fmt($item(e.get("losses"),1),-1,null)+" of "+$fmt($call(e.get("len"),[$item(e.get("armies"),1)],$dict([])),-1,null)+"; "+$fmt($get($item(e.get("countries"),e.get("winner")),"name"),-1,null)+" held the advantage. Wounded "+$fmt($item(e.get("wounded"),0),-1,null)+"/"+$fmt($item(e.get("wounded"),1),-1,null)+"; supply "+$fmt($item(e.get("supplies"),0),-1,(".0%"))+"/"+$fmt($item(e.get("supplies"),1),-1,(".0%"))+"; war exhaustion "+$fmt($item($item(e.get("detail"),"exhaustion"),0),-1,(".0f"))+"/"+$fmt($item($item(e.get("detail"),"exhaustion"),1),-1,(".0f"))+". Armies: "+$fmt($item($item(e.get("UNIT_NAMES"),"weapon"),$item(e.get("tiers"),0)),-1,null)+" against "+$fmt($item($item(e.get("UNIT_NAMES"),"weapon"),$item(e.get("tiers"),1)),-1,null)+"."),"war"],$dict([]));
{const $t902=$call(e.get("getattr"),[e.get("sim"),"war_log",null],$dict([]));e.set("log",$t902);}
if($truth($compare([()=>e.get("log"),()=>null], ["Is"]))){{const $t903=[];e.set("log",$t903);}
{const $t904=e.get("log");$set(e.get("sim"),"war_log",$t904);}
}else{}
$call($get(e.get("log"),"append"),[$dict([["year",$get(e.get("sim"),"year")],["pair",$call(e.get("list"),[e.get("pair")],$dict([]))],["tiers",e.get("tiers")],["losses",e.get("losses")],["levies",Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t905 of $iter(e.get("armies"))){e.set("a",$t905);yield $call(e.get("len"),[e.get("a")],$dict([]));}})();})(e))],["winner",e.get("winner")],["mode",e.get("mode")]])],$dict([]));
while($truth($compare([()=>$call(e.get("len"),[e.get("log")],$dict([])),()=>300], ["Gt"]))){$call($get(e.get("log"),"pop"),[0],$dict([]));
}
{const $t906=$tuple([$item(e.get("pair"),e.get("winner")),$item(e.get("pair"),$bin("Sub",1,e.get("winner")))]);{const $t907=Array.from($iter($t906));e.set("victor",$t907[0]);e.set("defeated",$t907[1]);}}
{const $t908=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t910 of $iter(e.get("armies"))){e.set("army",$t910);yield $call(e.get("sum"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t909 of $iter(e.get("army"))){e.set("p",$t909);yield $boolop("And",[()=>$compare([()=>$get(e.get("p"),"id"),()=>$get(e.get("sim"),"people")], ["In"]),()=>$compare([()=>$call(e.get("getattr"),[e.get("p"),"wounded_until",0],$dict([])),()=>$get(e.get("sim"),"year")], ["LtE"])]);}})();})(e)],$dict([]));}})();})(e));e.set("survivor_adults",$t908);}
{const $t911=$compare([()=>$item(e.get("powers"),e.get("winner")),()=>$bin("Mult",$call(e.get("max"),[1,$item(e.get("powers"),$bin("Sub",1,e.get("winner")))],$dict([])),4)], ["GtE"]);e.set("overwhelming",$t911);}
{const $t912=false;e.set("conquered",$t912);}
{const $t913=($truth($compare([()=>e.get("winner"),()=>0], ["Eq"]))?$compare([()=>$item(e.get("detail"),"score"),()=>6], ["GtE"]):$compare([()=>$item(e.get("detail"),"score"),()=>$un("USub",6)], ["LtE"]));e.set("sustained_advantage",$t913);}
{const $t914=$call(e.get("sum"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t915 of $iter($item(e.get("sides"),$bin("Sub",1,e.get("winner"))))){e.set("p",$t915);yield $boolop("And",[()=>$compare([()=>$get(e.get("p"),"id"),()=>$get(e.get("sim"),"people")], ["In"]),()=>$compare([()=>18,()=>$get(e.get("p"),"age"),()=>60], ["LtE", "LtE"]),()=>$un("Not",$get(e.get("p"),"infection")),()=>$compare([()=>$call(e.get("getattr"),[e.get("p"),"wounded_until",0],$dict([])),()=>$get(e.get("sim"),"year")], ["LtE"])]);}})();})(e)],$dict([]));e.set("defeated_reserves",$t914);}
{const $t916=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t917 of $iter($call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([])))){e.set("s",$t917);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("s"),"country"),()=>e.get("defeated")], ["Eq"]),()=>$compare([()=>$get(e.get("s"),"abandoned"),()=>null], ["Is"])]))){yield e.get("s");}}})();})(e));e.set("defeated_places",$t916);}
if($truth($boolop("And",[()=>$item(e.get("survivor_adults"),e.get("winner")),()=>$compare([()=>$call(e.get("len"),[e.get("defeated_places")],$dict([])),()=>1], ["LtE"]),()=>$compare([()=>$bin("Sub",$get(e.get("sim"),"year"),e.get("started")),()=>2], ["GtE"]),()=>e.get("sustained_advantage"),()=>$boolop("Or",[()=>e.get("overwhelming"),()=>$un("Not",e.get("defeated_reserves"))])]))){$call(e.get("_transfer"),[e.get("sim"),e.get("victor"),e.get("defeated")],$dict([]));
$call($get(e.get("sim"),"record"),[($fmt($get($item($get(e.get("sim"),"countries"),e.get("victor")),"name"),-1,null)+" conquered "+$fmt($get($item($get(e.get("sim"),"countries"),e.get("defeated")),"name"),-1,null)+"; survivors joined the victorious country."),"war"],$dict([]));
{const $t918=true;e.set("conquered",$t918);}
}else{if($truth($boolop("And",[()=>$compare([()=>e.get("mode"),()=>"siege"], ["Eq"]),()=>$item(e.get("survivor_adults"),e.get("winner")),()=>$compare([()=>$item(e.get("supplies"),e.get("winner")),()=>0.65], ["GtE"]),()=>($truth($compare([()=>e.get("winner"),()=>0], ["Eq"]))?$compare([()=>$item(e.get("detail"),"score"),()=>3], ["GtE"]):$compare([()=>$item(e.get("detail"),"score"),()=>$un("USub",3)], ["LtE"])),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>$bin("Mult",$bin("Mult",0.45,($truth($call(e.get("besieging"),[e.get("sim"),e.get("pair"),e.get("winner")],$dict([])))?1.3:1.0)),$call(e.get("siege_odds"),[$item(e.get("mods"),e.get("winner")),$item(e.get("mods"),$bin("Sub",1,e.get("winner")))],$dict([])))], ["Lt"])]))){{const $t919=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t921 of $iter($call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([])))){e.set("s",$t921);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("s"),"country"),()=>e.get("defeated")], ["Eq"]),()=>$call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t920 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t920);yield $boolop("And",[()=>$compare([()=>$get(e.get("p"),"settlement"),()=>$get(e.get("s"),"id")], ["Eq"]),()=>$compare([()=>$get(e.get("p"),"country"),()=>e.get("defeated")], ["Eq"])]);}})();})(e)],$dict([]))]))){yield e.get("s");}}})();})(e));e.set("targets",$t919);}
if($truth($compare([()=>$call(e.get("len"),[e.get("targets")],$dict([])),()=>1], ["Gt"]))){{const $t922=$call(e.get("next"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t923 of $iter(e.get("targets"))){e.set("s",$t923);if($truth($compare([()=>$get(e.get("s"),"id"),()=>$item($item(e.get("detail"),"objectives"),e.get("winner"))], ["Eq"]))){yield e.get("s");}}})();})(e),$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("targets")],$dict([]))],$dict([]));e.set("target",$t922);}
$setitem($item(e.get("detail"),"captures"),e.get("winner"),$aug("Add",$item($item(e.get("detail"),"captures"),e.get("winner")),1));$call(e.get("_transfer"),[e.get("sim"),e.get("victor"),e.get("defeated"),e.get("target")],$dict([]));
$call(e.get("damage_buildings"),[e.get("sim"),e.get("target"),0.35,"The assault"],$dict([]));
$call($get(e.get("sim"),"record"),[($fmt($get($item($get(e.get("sim"),"countries"),e.get("victor")),"name"),-1,null)+" captured "+$fmt($get(e.get("target"),"name"),-1,null)+"; its surviving residents changed allegiance."),"war"],$dict([]));
}else{}
}else{}
}
{const $t924=$boolop("Or",[()=>$compare([()=>$call(e.get("max"),[$item(e.get("detail"),"captures")],$dict([])),()=>1], ["GtE"]),()=>$compare([()=>$bin("Sub",$get(e.get("sim"),"year"),e.get("started")),()=>7], ["GtE"]),()=>$compare([()=>$call(e.get("max"),[$item(e.get("detail"),"exhaustion")],$dict([])),()=>80], ["GtE"]),()=>$un("Not",$call(e.get("any"),[e.get("survivor_adults")],$dict([]))),()=>$boolop("And",[()=>$compare([()=>$get(e.get("sim"),"year"),()=>e.get("started")], ["Gt"]),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.12], ["Lt"])])]);e.set("peace",$t924);}
if($truth($boolop("Or",[()=>e.get("conquered"),()=>e.get("peace")]))){if($truth($un("Not",e.get("conquered")))){{const $t925=$call($get($get(e.get("sim"),"rng"),"randint"),[4,9],$dict([]));e.set("duration",$t925);}
{const $t926=$bin("Add",$get(e.get("sim"),"year"),e.get("duration"));$setitem($get(e.get("sim"),"truces"),$call(e.get("tuple"),[$call(e.get("sorted"),[e.get("pair")],$dict([]))],$dict([])),$t926);}
{const $t927=($truth($call(e.get("any"),[$item(e.get("detail"),"captures")],$dict([])))?"recognized the new frontier":"accepted the existing borders");e.set("terms",$t927);}
if($truth($boolop("And",[()=>$un("Not",$call(e.get("any"),[$item(e.get("detail"),"captures")],$dict([]))),()=>$compare([()=>$call(e.get("abs"),[$item(e.get("detail"),"score")],$dict([])),()=>4], ["GtE"])]))){{const $t928=($truth($compare([()=>$item(e.get("detail"),"score"),()=>0], ["Gt"]))?0:1);e.set("beneficiary",$t928);}
{const $t929=$call(e.get("min"),[5,$bin("Mult",$get($item(e.get("countries"),$bin("Sub",1,e.get("beneficiary"))),"prosperity"),0.08)],$dict([]));e.set("tribute",$t929);}
$set($item(e.get("countries"),$bin("Sub",1,e.get("beneficiary"))),"prosperity",$aug("Sub",$get($item(e.get("countries"),$bin("Sub",1,e.get("beneficiary"))),"prosperity"),e.get("tribute")));{const $t930=$call(e.get("min"),[100,$bin("Add",$get($item(e.get("countries"),e.get("beneficiary")),"prosperity"),e.get("tribute"))],$dict([]));$set($item(e.get("countries"),e.get("beneficiary")),"prosperity",$t930);}
e.set("terms",$aug("Add",e.get("terms")," with limited reparations"));}else{}
$call($get(e.get("sim"),"record"),[($fmt($get($item(e.get("countries"),0),"name"),-1,null)+" and "+$fmt($get($item(e.get("countries"),1),"name"),-1,null)+" "+$fmt(e.get("terms"),-1,null)+", signed peace and a "+$fmt(e.get("duration"),-1,null)+"-year truce."),"war"],$dict([]));
}else{}
$del($get(e.get("sim"),"wars"),e.get("pair"));$call($get($get(e.get("sim"),"war_details"),"pop"),[e.get("pair"),null],$dict([]));
}else{}
}
return e.get("deaths");return null;}));
});
$register("civic",e=>{e.set("Counter",$get($import("collections"),"Counter"));e.set("technology_modifiers",$get($import("society"),"technology_modifiers"));e.set("all_titles",$get($import("governments"),"all_titles"));e.set("title_of",$get($import("governments"),"title_of"));e.set("HEREDITARY",$get($import("governments"),"HEREDITARY"));{const $t931=$tuple(["farmer","farmer","farmer","laborer","laborer","artisan","merchant","healer","teacher","scientist","performer","soldier","politician"]);e.set("JOBS",$t931);}
{const $t932=$dict([["farmer",10],["laborer",9],["artisan",14],["merchant",19],["healer",15],["teacher",12],["scientist",13],["scholar",13],["performer",11],["soldier",11],["politician",12]]);e.set("PAY",$t932);}
{const $t933=$tuple(["mixed","capitalism","communism"]);e.set("SYSTEMS",$t933);}
e.set("initialize_civic",$fn("initialize_civic",e,["sim"],[undefined],null,null,[],[],e=>{for(const $t934 of $iter($call($get($get(e.get("sim"),"countries"),"values"),[],$dict([])))){e.set("country",$t934);if($truth($un("Not",$call(e.get("hasattr"),[e.get("country"),"economic_system"],$dict([]))))){{const $t935=$call($get($get(e.get("sim"),"countries"),"get"),[$get(e.get("country"),"parent_country")],$dict([]));e.set("parent",$t935);}
{const $t936=($truth(e.get("parent"))?$call(e.get("getattr"),[e.get("parent"),"economic_system","mixed"],$dict([])):$item(e.get("SYSTEMS"),$bin("Mod",$bin("Sub",$get(e.get("country"),"id"),1),$call(e.get("len"),[e.get("SYSTEMS")],$dict([])))));$set(e.get("country"),"economic_system",$t936);}
{const $t937=$get(e.get("sim"),"year");$set(e.get("country"),"economic_since",$t937);}
{const $t938=0.0;$set(e.get("country"),"treasury",$t938);}
{const $t939=$dict([]);$set(e.get("country"),"offices",$t939);}
}else{}
}
for(const $t940 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("person",$t940);if($truth($un("Not",$call(e.get("hasattr"),[e.get("person"),"wealth"],$dict([]))))){{const $t941=$call(e.get("round"),[($truth($compare([()=>$get(e.get("person"),"age"),()=>18], ["GtE"]))?$call($get($get(e.get("sim"),"rng"),"uniform"),[5,90],$dict([])):0),2],$dict([]));$set(e.get("person"),"wealth",$t941);}
{const $t942=($truth($compare([()=>$get(e.get("person"),"age"),()=>18], ["GtE"]))?$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("JOBS")],$dict([])):"child");$set(e.get("person"),"job",$t942);}
{const $t943=0.0;$set(e.get("person"),"fame",$t943);}
{const $t944="";$set(e.get("person"),"public_role",$t944);}
}else{}
}
return null;}));
{const $t945=$tuple([$tuple(["treasurer","merchant"]),$tuple(["chief scholar","scientist"]),$tuple(["chief physician","healer"]),$tuple(["minister","politician"])]);e.set("OFFICES",$t945);}
e.set("refresh_public_roles",$fn("refresh_public_roles",e,["sim", "announce"],[undefined,true],null,null,[],[],e=>{{const $t946=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t947 of $iter(e.get("OFFICES"))){{const $t948=Array.from($iter($t947));e.set("title",$t948[0]);e.set("_",$t948[1]);}yield e.get("title");}})();})(e));e.set("official_titles",$t946);}
for(const $t949 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("person",$t949);if($truth($compare([()=>$get(e.get("person"),"public_role"),()=>$bin("BitOr",$bin("BitOr",e.get("official_titles"),$call(e.get("all_titles"),[],$dict([]))),new PS(["royal family"]))], ["In"]))){{const $t950="";$set(e.get("person"),"public_role",$t950);}
}else{}
}
{const $t951=$dict([]);e.set("groups",$t951);}
for(const $t952 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("person",$t952);$call($get($call($get(e.get("groups"),"setdefault"),[$get(e.get("person"),"country"),[]],$dict([])),"append"),[e.get("person")],$dict([]));
}
for(const $t953 of $iter($call($get($get(e.get("sim"),"countries"),"items"),[],$dict([])))){{const $t954=Array.from($iter($t953));e.set("cid",$t954[0]);e.set("country",$t954[1]);}{const $t955=$call($get(e.get("groups"),"get"),[e.get("cid"),[]],$dict([]));e.set("residents",$t955);}
{const $t956=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t957 of $iter(e.get("residents"))){e.set("p",$t957);if($truth($compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"]))){yield e.get("p");}}})();})(e));e.set("adults",$t956);}
{const $t958=$call($get($get(e.get("sim"),"people"),"get"),[$get(e.get("country"),"ruler")],$dict([]));e.set("ruler",$t958);}
if($truth($boolop("And",[()=>e.get("ruler"),()=>$compare([()=>$get(e.get("ruler"),"country"),()=>e.get("cid")], ["Eq"])]))){{const $t959=$call(e.get("title_of"),[$get(e.get("country"),"government")],$dict([]));$set(e.get("ruler"),"public_role",$t959);}
{const $t960=$call(e.get("max"),[85,$get(e.get("ruler"),"fame")],$dict([]));$set(e.get("ruler"),"fame",$t960);}
if($truth($compare([()=>$get(e.get("country"),"government"),()=>e.get("HEREDITARY")], ["In"]))){for(const $t961 of $iter(e.get("residents"))){e.set("person",$t961);if($truth($compare([()=>$get(e.get("ruler"),"id"),()=>$get(e.get("person"),"parents")], ["In"]))){{const $t962="royal family";$set(e.get("person"),"public_role",$t962);}
{const $t963=$call(e.get("max"),[60,$get(e.get("person"),"fame")],$dict([]));$set(e.get("person"),"fame",$t963);}
}else{}
}
}else{}
}else{}
for(const $t964 of $iter(e.get("OFFICES"))){{const $t965=Array.from($iter($t964));e.set("title",$t965[0]);e.set("profession",$t965[1]);}{const $t966=$call($get($get(e.get("sim"),"people"),"get"),[$call($get($get(e.get("country"),"offices"),"get"),[e.get("title")],$dict([]))],$dict([]));e.set("current",$t966);}
if($truth($boolop("And",[()=>e.get("current"),()=>$compare([()=>$get(e.get("current"),"country"),()=>e.get("cid")], ["Eq"]),()=>$compare([()=>$get(e.get("current"),"age"),()=>18], ["GtE"]),()=>$un("Not",$get(e.get("current"),"public_role"))]))){{const $t967=e.get("title");$set(e.get("current"),"public_role",$t967);}
continue;}else{}
$call($get($get(e.get("country"),"offices"),"pop"),[e.get("title"),null],$dict([]));
if($truth($compare([()=>$call(e.get("len"),[e.get("adults")],$dict([])),()=>30], ["Lt"]))){continue;}else{}
{const $t968=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t969 of $iter(e.get("adults"))){e.set("p",$t969);if($truth($boolop("And",[()=>$un("Not",$get(e.get("p"),"public_role")),()=>$compare([()=>$get(e.get("p"),"job"),()=>e.get("profession")], ["Eq"])]))){yield e.get("p");}}})();})(e));e.set("candidates",$t968);}
if($truth($un("Not",e.get("candidates")))){continue;}else{}
{const $t970=$call(e.get("max"),[e.get("candidates")],$dict([["key",$fn("<lambda>",e,["p"],[undefined],null,null,[],[],e=>{return $tuple([$get(e.get("p"),"fame"),$get(e.get("p"),"age")]);return null;})]]));e.set("appointee",$t970);}
{const $t971=$get(e.get("appointee"),"id");$setitem($get(e.get("country"),"offices"),e.get("title"),$t971);}
{const $t972=e.get("title");$set(e.get("appointee"),"public_role",$t972);}
{const $t973=$call(e.get("max"),[65,$get(e.get("appointee"),"fame")],$dict([]));$set(e.get("appointee"),"fame",$t973);}
if($truth(e.get("announce"))){$call($get(e.get("sim"),"record"),[($fmt($call($get(e.get("sim"),"person_reference"),[e.get("appointee")],$dict([])),-1,null)+" was appointed "+$fmt(e.get("title"),-1,null)+" of "+$fmt($get(e.get("country"),"name"),-1,null)+"."),"political"],$dict([]));
}else{}
}
}
return null;}));
e.set("annual_civic",$fn("annual_civic",e,["sim"],[undefined],null,null,[],[],e=>{$call(e.get("initialize_civic"),[e.get("sim")],$dict([]));
if($truth($compare([()=>$call(e.get("getattr"),[e.get("sim"),"_civic_year",null],$dict([])),()=>$get(e.get("sim"),"year")], ["Eq"]))){return null;}else{}
{const $t974=$get(e.get("sim"),"year");$set(e.get("sim"),"_civic_year",$t974);}
{const $t975=$dict([]);e.set("heirs_by_parent",$t975);}
for(const $t976 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("child",$t976);for(const $t977 of $iter($get(e.get("child"),"parents"))){e.set("parent",$t977);$call($get($call($get(e.get("heirs_by_parent"),"setdefault"),[e.get("parent"),[]],$dict([])),"append"),[e.get("child")],$dict([]));
}
}
for(const $t978 of $iter($call($get($get(e.get("sim"),"archive"),"values"),[],$dict([])))){e.set("person",$t978);if($truth($boolop("Or",[()=>$compare([()=>$get(e.get("person"),"died"),()=>null], ["Is"]),()=>$call(e.get("getattr"),[e.get("person"),"estate_settled",false],$dict([]))]))){continue;}else{}
{const $t979=true;$set(e.get("person"),"estate_settled",$t979);}
{const $t980=$call(e.get("getattr"),[e.get("person"),"wealth",0.0],$dict([]));e.set("fortune",$t980);}
{const $t981=($truth(e.get("fortune"))?$call($get(e.get("heirs_by_parent"),"get"),[$get(e.get("person"),"id"),[]],$dict([])):[]);e.set("heirs",$t981);}
if($truth(e.get("heirs"))){for(const $t982 of $iter(e.get("heirs"))){e.set("heir",$t982);$set(e.get("heir"),"wealth",$aug("Add",$get(e.get("heir"),"wealth"),$bin("Div",e.get("fortune"),$call(e.get("len"),[e.get("heirs")],$dict([])))));}
}else{if($truth($compare([()=>$get(e.get("person"),"country"),()=>$get(e.get("sim"),"countries")], ["In"]))){{const $t983=$item($get(e.get("sim"),"countries"),$get(e.get("person"),"country"));e.set("beneficiary",$t983);}
while($truth($compare([()=>$call(e.get("getattr"),[e.get("beneficiary"),"absorbed_by",null],$dict([])),()=>null], ["IsNot"]))){{const $t984=$item($get(e.get("sim"),"countries"),$get(e.get("beneficiary"),"absorbed_by"));e.set("beneficiary",$t984);}
}
$set(e.get("beneficiary"),"treasury",$aug("Add",$get(e.get("beneficiary"),"treasury"),e.get("fortune")));}else{}
}
{const $t985=0.0;$set(e.get("person"),"wealth",$t985);}
{const $t986=$call(e.get("getattr"),[e.get("person"),"public_role",""],$dict([]));e.set("role",$t986);}
if($truth($boolop("Or",[()=>e.get("role"),()=>$compare([()=>$call(e.get("getattr"),[e.get("person"),"fame",0],$dict([])),()=>65], ["GtE"])]))){{const $t987=$boolop("Or",[()=>$call(e.get("getattr"),[e.get("person"),"cause_of_death",null],$dict([])),()=>"natural causes"]);e.set("cause",$t987);}
$call($get(e.get("sim"),"record"),[($fmt($call($get(e.get("sim"),"person_reference"),[e.get("person")],$dict([])),-1,null)+", "+$fmt($boolop("Or",[()=>e.get("role"),()=>$get(e.get("person"),"job")]),-1,null)+", died aged "+$fmt($get(e.get("person"),"age"),-1,null)+" ("+$fmt(e.get("cause"),-1,null)+")."),"political"],$dict([]));
}else{}
}
{const $t988=$dict([]);e.set("groups",$t988);}
for(const $t989 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("person",$t989);$call($get($call($get(e.get("groups"),"setdefault"),[$get(e.get("person"),"country"),[]],$dict([])),"append"),[e.get("person")],$dict([]));
if($truth($boolop("And",[()=>$compare([()=>$get(e.get("person"),"age"),()=>18], ["GtE"]),()=>$compare([()=>$get(e.get("person"),"job"),()=>"child"], ["Eq"])]))){{const $t990=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("JOBS")],$dict([]));$set(e.get("person"),"job",$t990);}
}else{}
$set(e.get("person"),"fame",$aug("Mult",$get(e.get("person"),"fame"),0.98));}
for(const $t991 of $iter($call($get(e.get("groups"),"items"),[],$dict([])))){{const $t992=Array.from($iter($t991));e.set("cid",$t992[0]);e.set("residents",$t992[1]);}{const $t993=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t993);}
{const $t994=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t995 of $iter(e.get("residents"))){e.set("p",$t995);if($truth($compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"]))){yield e.get("p");}}})();})(e));e.set("adults",$t994);}
if($truth($un("Not",e.get("adults")))){continue;}else{}
if($truth($boolop("And",[()=>$compare([()=>$bin("Sub",$get(e.get("sim"),"year"),$get(e.get("country"),"economic_since")),()=>20], ["GtE"]),()=>$compare([()=>"writing",()=>$get(e.get("country"),"technologies")], ["In"]),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.025], ["Lt"])]))){{const $t996=$get(e.get("country"),"economic_system");e.set("previous",$t996);}
{const $t997=$call($get($get(e.get("sim"),"rng"),"choice"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t998 of $iter(e.get("SYSTEMS"))){e.set("s",$t998);if($truth($compare([()=>e.get("s"),()=>e.get("previous")], ["NotEq"]))){yield e.get("s");}}})();})(e))],$dict([]));$set(e.get("country"),"economic_system",$t997);}
{const $t999=$get(e.get("sim"),"year");$set(e.get("country"),"economic_since",$t999);}
$call($get(e.get("sim"),"record"),[($fmt($get(e.get("country"),"name"),-1,null)+" adopted "+$fmt($get(e.get("country"),"economic_system"),-1,null)+", replacing "+$fmt(e.get("previous"),-1,null)+"; taxation and the distribution of income changed."),"political"],$dict([]));
}else{}
{const $t1000=$get(e.get("country"),"economic_system");e.set("system",$t1000);}
{const $t1001=$item($dict([["capitalism",0.15],["mixed",0.3],["communism",1.0]]),e.get("system"));e.set("tax_rate",$t1001);}
{const $t1002=0.0;e.set("public_income",$t1002);}
{const $t1003=$bin("Mult",$bin("Add",0.5,$bin("Div",$get(e.get("country"),"prosperity"),100)),$item($call(e.get("technology_modifiers"),[e.get("country")],$dict([])),"production"));e.set("productivity",$t1003);}
if($truth($compare([()=>"Famine",()=>$get(e.get("country"),"conditions")], ["In"]))){e.set("productivity",$aug("Mult",e.get("productivity"),0.6));}else{}
if($truth($get(e.get("country"),"quarantine"))){e.set("productivity",$aug("Mult",e.get("productivity"),0.85));}else{}
for(const $t1004 of $iter(e.get("adults"))){e.set("person",$t1004);{const $t1005=$bin("Mult",$bin("Mult",$call($get(e.get("PAY"),"get"),[$get(e.get("person"),"job"),10],$dict([])),e.get("productivity")),$call($get($get(e.get("sim"),"rng"),"uniform"),[0.7,1.3],$dict([])));e.set("income",$t1005);}
if($truth($boolop("Or",[()=>$compare([()=>$call(e.get("getattr"),[e.get("person"),"wounded_until",0],$dict([])),()=>$get(e.get("sim"),"year")], ["Gt"]),()=>$get(e.get("person"),"infection")]))){e.set("income",$aug("Mult",e.get("income"),0.65));}else{}
if($truth($compare([()=>e.get("system"),()=>"capitalism"], ["Eq"]))){e.set("income",$aug("Add",e.get("income"),$bin("Mult",$get(e.get("person"),"wealth"),$call($get($get(e.get("sim"),"rng"),"uniform"),[$un("USub",0.015),0.05],$dict([])))));}else{if($truth($compare([()=>e.get("system"),()=>"mixed"], ["Eq"]))){e.set("income",$aug("Add",e.get("income"),$bin("Mult",$get(e.get("person"),"wealth"),$call($get($get(e.get("sim"),"rng"),"uniform"),[$un("USub",0.005),0.015],$dict([])))));}else{}
}
{const $t1006=$call(e.get("max"),[0,e.get("income")],$dict([]));e.set("income",$t1006);}
e.set("public_income",$aug("Add",e.get("public_income"),$bin("Mult",e.get("income"),e.get("tax_rate"))));{const $t1007=$call(e.get("max"),[0,$bin("Sub",$bin("Add",$get(e.get("person"),"wealth"),$bin("Mult",e.get("income"),$bin("Sub",1,e.get("tax_rate")))),6)],$dict([]));$set(e.get("person"),"wealth",$t1007);}
}
{const $t1008=$bin("Mult",e.get("public_income"),$item($dict([["capitalism",0.25],["mixed",0.65],["communism",0.9]]),e.get("system")));e.set("redistribution",$t1008);}
$set(e.get("country"),"treasury",$aug("Add",$get(e.get("country"),"treasury"),$bin("Sub",e.get("public_income"),e.get("redistribution"))));{const $t1009=($truth($compare([()=>e.get("system"),()=>"communism"], ["Eq"]))?e.get("residents"):$item($call(e.get("sorted"),[e.get("residents")],$dict([["key",$fn("<lambda>",e,["p"],[undefined],null,null,[],[],e=>{return $get(e.get("p"),"wealth");return null;})]])),$slice(null,$call(e.get("max"),[1,$bin("FloorDiv",$call(e.get("len"),[e.get("residents")],$dict([])),2)],$dict([])),null)));e.set("recipients",$t1009);}
for(const $t1010 of $iter(e.get("recipients"))){e.set("person",$t1010);$set(e.get("person"),"wealth",$aug("Add",$get(e.get("person"),"wealth"),$bin("Div",e.get("redistribution"),$call(e.get("len"),[e.get("recipients")],$dict([])))));}
{const $t1011=$call(e.get("max"),[0,$call(e.get("min"),[100,$bin("Add",$get(e.get("country"),"prosperity"),$bin("Div",$bin("Sub",e.get("public_income"),e.get("redistribution")),$bin("Mult",$call(e.get("len"),[e.get("residents")],$dict([])),20)))],$dict([]))],$dict([]));$set(e.get("country"),"prosperity",$t1011);}
{const $t1012=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1013 of $iter(e.get("adults"))){e.set("p",$t1013);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("p"),"job"),()=>"performer"], ["Eq"]),()=>$compare([()=>$get(e.get("p"),"fame"),()=>65], ["Lt"])]))){yield e.get("p");}}})();})(e));e.set("performers",$t1012);}
if($truth($boolop("And",[()=>e.get("performers"),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.12], ["Lt"])]))){{const $t1014=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("performers")],$dict([]));e.set("artist",$t1014);}
{const $t1015=80;$set(e.get("artist"),"fame",$t1015);}
{const $t1016="celebrated artist";$set(e.get("artist"),"public_role",$t1016);}
$call($get(e.get("sim"),"record"),[($fmt($call($get(e.get("sim"),"person_reference"),[e.get("artist")],$dict([])),-1,null)+" earned national acclaim for "+$fmt($call($get($get(e.get("sim"),"rng"),"choice"),[["a tragic play","a cycle of songs","a historical epic","a public sculpture"]],$dict([])),-1,null)+"."),"creative"],$dict([]));
}else{}
}
$call(e.get("refresh_public_roles"),[e.get("sim")],$dict([]));
return null;}));
e.set("command",$fn("command",e,["sim", "text"],[undefined,undefined],null,null,[],[],e=>{{const $t1017=$call($get(e.get("text"),"strip"),[],$dict([]));e.set("raw",$t1017);}
if($truth($boolop("Or",[()=>$un("Not",e.get("raw")),()=>$compare([()=>$call($get(e.get("raw"),"lower"),[],$dict([])),()=>new PS(["next","continue"])], ["In"])]))){return $tuple(["","next"]);}else{}
{const $t1018=$call($get(e.get("raw"),"split"),[],$dict([["maxsplit",1]]));e.set("parts",$t1018);}
{const $t1019=$tuple([$call($get($item(e.get("parts"),0),"lower"),[],$dict([])),($truth($compare([()=>$call(e.get("len"),[e.get("parts")],$dict([])),()=>1], ["Gt"]))?$call($get($call($get($call($get($item(e.get("parts"),1),"strip"),[],$dict([])),"strip"),["\""],$dict([])),"lower"),[],$dict([])):"")]);{const $t1020=Array.from($iter($t1019));e.set("name",$t1020[0]);e.set("query",$t1020[1]);}}
if($truth($compare([()=>e.get("name"),()=>new PS(["quit","exit"])], ["In"]))){return $tuple(["Simulation stopped.","quit"]);}else{}
if($truth($compare([()=>e.get("name"),()=>"help"], ["Eq"]))){e.set("EDIT_HELP",$get($import("edit_commands"),"EDIT_HELP"));if($truth($compare([()=>e.get("query"),()=>"ids"], ["Eq"]))){return $tuple(["Optional advanced ID lookup: ids [person|country|settlement|lineage|discovery] [SEARCH] [page=N]\nExample: ids person Mara\nUse the ID in brackets as an alternative to a name; numeric IDs also accept #. Names remain the normal controls.","inspect"]);}else{}
if($truth($compare([()=>e.get("query"),()=>new PS(["edit","editing","commands","sandbox"])], ["In"]))){return $tuple([e.get("EDIT_HELP"),"inspect"]);}else{}
return $tuple(["Enter/next: advance one year | quit: stop\npeople [QUERY] [page=N] | person NAME | settlements [QUERY] [page=N] | settlement NAME\ncountries | country NAME | rich [COUNTRY] | inventions [COUNTRY]\nroles [COUNTRY] | notables [COUNTRY] | lineages [NAME]\ndemographics [COUNTRY] | wars [COUNTRY] | diseases [COUNTRY] | disease NAME\ncatalog [QUERY] [page=N] | changes | help edit (all editing commands) | undo\nborders [COUNTRY] | geography: terrain, land borders, and sea neighbors.\nprojects [COUNTRY] | expeditions [COUNTRY] | systems [COUNTRY] | hazards SETTLEMENT\nAliases: richest, discoveries, innovations, government, individual, persons.\n34 foundations + 1,000 composed technique/application innovations, with prerequisites and effects.\nUse displayed names, including Roman numerals when shown. Quote multiword names in edits.\nOptional advanced ID lookup: help ids. Person views include deceased records. Wealth uses simulation units.\nInspection is read-only; edits take effect immediately. Neither advances the year.","inspect"]);}else{}
e.set("inspect_command",$get($import("inspection"),"inspect_command"));e.set("edit_command",$get($import("edit_commands"),"edit_command"));{const $t1021=$call(e.get("inspect_command"),[e.get("sim"),e.get("raw")],$dict([]));e.set("inspected",$t1021);}
if($truth($compare([()=>e.get("inspected"),()=>null], ["IsNot"]))){return e.get("inspected");}else{}
{const $t1022=$call(e.get("edit_command"),[e.get("sim"),e.get("raw")],$dict([]));e.set("edited",$t1022);}
if($truth($compare([()=>e.get("edited"),()=>null], ["IsNot"]))){return e.get("edited");}else{}
if($truth($compare([()=>e.get("name"),()=>new PS(["lineage","lineages"])], ["In"]))){{const $t1023=$call($get(e.get("sim"),"lineage_tree"),[],$dict([]));e.set("tree",$t1023);}
if($truth(e.get("query"))){{const $t1024=$call($get("\n\n","join"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1025 of $iter($call($get(e.get("tree"),"split"),["\n\n"],$dict([])))){e.set("block",$t1025);if($truth($compare([()=>e.get("query"),()=>$call($get(e.get("block"),"lower"),[],$dict([]))], ["In"]))){yield e.get("block");}}})();})(e)],$dict([]));e.set("tree",$t1024);}
}else{}
return $tuple([$boolop("Or",[()=>e.get("tree"),()=>"No matching lineage."]),"inspect"]);}else{}
{const $t1026=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1027 of $iter($call($get($get(e.get("sim"),"countries"),"values"),[],$dict([])))){e.set("c",$t1027);if($truth($compare([()=>$get(e.get("c"),"ended"),()=>null], ["Is"]))){yield e.get("c");}}})();})(e));e.set("countries",$t1026);}
if($truth(e.get("query"))){{const $t1028=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1029 of $iter(e.get("countries"))){e.set("c",$t1029);if($truth($boolop("Or",[()=>$compare([()=>$call($get($get(e.get("c"),"name"),"lower"),[],$dict([])),()=>e.get("query")], ["Eq"]),()=>$compare([()=>e.get("query"),()=>new PS([$call(e.get("str"),[$get(e.get("c"),"id")],$dict([])),$bin("Add","#",$call(e.get("str"),[$get(e.get("c"),"id")],$dict([])))])], ["In"])]))){yield e.get("c");}}})();})(e));e.set("exact",$t1028);}
{const $t1030=$boolop("Or",[()=>e.get("exact"),()=>Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1031 of $iter(e.get("countries"))){e.set("c",$t1031);if($truth($compare([()=>e.get("query"),()=>$call($get($get(e.get("c"),"name"),"lower"),[],$dict([]))], ["In"]))){yield e.get("c");}}})();})(e))]);e.set("countries",$t1030);}
}else{}
if($truth($un("Not",e.get("countries")))){return $tuple(["No matching inhabited country.","inspect"]);}else{}
{const $t1032=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1033 of $iter(e.get("countries"))){e.set("c",$t1033);yield $get(e.get("c"),"id");}})();})(e));e.set("cids",$t1032);}
{const $t1034=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1035 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1035);if($truth($compare([()=>$get(e.get("p"),"country"),()=>e.get("cids")], ["In"]))){yield e.get("p");}}})();})(e));e.set("people",$t1034);}
if($truth($compare([()=>e.get("name"),()=>new PS(["rich","richest"])], ["In"]))){{const $t1036=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1037 of $iter($call(e.get("enumerate"),[$item($call(e.get("sorted"),[e.get("people")],$dict([["key",$fn("<lambda>",e,["p"],[undefined],null,null,[],[],e=>{return $call(e.get("getattr"),[e.get("p"),"wealth",0],$dict([]));return null;})],["reverse",true]])),$slice(null,20,null)),1],$dict([])))){{const $t1038=Array.from($iter($t1037));e.set("i",$t1038[0]);e.set("p",$t1038[1]);}yield ($fmt(e.get("i"),-1,null)+". "+$fmt($call($get(e.get("sim"),"full_name"),[e.get("p")],$dict([])),-1,null)+": "+$fmt($call(e.get("getattr"),[e.get("p"),"wealth",0],$dict([])),-1,(",.1f"))+" ("+$fmt($call(e.get("getattr"),[e.get("p"),"job","unassigned"],$dict([])),-1,null)+")");}})();})(e));e.set("rows",$t1036);}
return $tuple([$bin("Add","Richest living people (wealth units):\n",$call($get("\n","join"),[e.get("rows")],$dict([]))),"inspect"]);}else{}
if($truth($compare([()=>e.get("name"),()=>new PS(["inventions","discoveries","innovations"])], ["In"]))){{const $t1039=[];e.set("rows",$t1039);}
for(const $t1040 of $iter(e.get("countries"))){e.set("c",$t1040);$call($get(e.get("rows"),"append"),[$bin("Add",($fmt($get(e.get("c"),"name"),-1,null)+"\n  Foundational discoveries: "),$boolop("Or",[()=>$call($get(", ","join"),[$call(e.get("sorted"),[$get(e.get("c"),"technologies")],$dict([]))],$dict([])),()=>"none"]))],$dict([]));
e.set("INNOVATIONS",$get($import("discoveries"),"INNOVATIONS"));{const $t1041=$call(e.get("getattr"),[e.get("c"),"innovations",$dict([])],$dict([]));e.set("acquired",$t1041);}
$call($get(e.get("rows"),"extend"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1044 of $iter($call($get(e.get("acquired"),"items"),[],$dict([])))){{const $t1045=Array.from($iter($t1044));e.set("key",$t1045[0]);e.set("year",$t1045[1]);}if($truth($compare([()=>e.get("key"),()=>e.get("INNOVATIONS")], ["In"]))){yield $bin("Add",("  "+$fmt($get($item(e.get("INNOVATIONS"),e.get("key")),"name"),-1,null)+" (year "+$fmt(e.get("year"),-1,null)+"): "),$call($get(", ","join"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1042 of $iter($get($item(e.get("INNOVATIONS"),e.get("key")),"modifiers"))){{const $t1043=Array.from($iter($t1042));e.set("effect",$t1043[0]);e.set("value",$t1043[1]);}yield ($fmt($call($get(e.get("effect"),"replace"),["_"," "],$dict([])),-1,null)+" "+$fmt(e.get("value"),-1,("+.1%")));}})();})(e)],$dict([])));}}})();})(e)],$dict([]));
if($truth($un("Not",e.get("acquired")))){$call($get(e.get("rows"),"append"),["  Specialized innovations: none yet"],$dict([]));
}else{}
{const $t1046=$call(e.get("getattr"),[e.get("c"),"research_project",null],$dict([]));e.set("project",$t1046);}
if($truth(e.get("project"))){$call($get(e.get("rows"),"append"),[("  Foundation project: "+$fmt(e.get("project"),-1,null)+" ("+$fmt($get(e.get("c"),"research"),-1,(".1f"))+" points)")],$dict([]));
}else{}
{const $t1047=$call($get(e.get("INNOVATIONS"),"get"),[$call(e.get("getattr"),[e.get("c"),"innovation_project",null],$dict([]))],$dict([]));e.set("applied",$t1047);}
if($truth(e.get("applied"))){$call($get(e.get("rows"),"append"),[("  Applied project: "+$fmt($get(e.get("applied"),"name"),-1,null)+" ("+$fmt($call(e.get("getattr"),[e.get("c"),"innovation_progress",0],$dict([])),-1,(".1f"))+"/"+$fmt($get(e.get("applied"),"cost"),-1,(".1f"))+")")],$dict([]));
}else{}
}
return $tuple([$call($get("\n","join"),[e.get("rows")],$dict([])),"inspect"]);}else{}
if($truth($compare([()=>e.get("name"),()=>new PS(["roles","government"])], ["In"]))){{const $t1048=[];e.set("rows",$t1048);}
for(const $t1049 of $iter(e.get("countries"))){e.set("c",$t1049);$call($get(e.get("rows"),"append"),[($fmt($get(e.get("c"),"name"),-1,null)+": "+$fmt($get(e.get("c"),"government"),-1,null)+"; economy: "+$fmt($call(e.get("getattr"),[e.get("c"),"economic_system","mixed"],$dict([])),-1,null))],$dict([]));
{const $t1050=$call($get($get(e.get("sim"),"people"),"get"),[$get(e.get("c"),"ruler")],$dict([]));e.set("ruler",$t1050);}
$call($get(e.get("rows"),"append"),[$bin("Add","  Ruler: ",($truth(e.get("ruler"))?$call($get(e.get("sim"),"full_name"),[e.get("ruler")],$dict([])):"vacant"))],$dict([]));
$call($get(e.get("rows"),"extend"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1051 of $iter($call($get($call(e.get("getattr"),[e.get("c"),"offices",$dict([])],$dict([])),"items"),[],$dict([])))){{const $t1052=Array.from($iter($t1051));e.set("role",$t1052[0]);e.set("pid",$t1052[1]);}if($truth($boolop("And",[()=>$compare([()=>e.get("pid"),()=>$get(e.get("sim"),"people")], ["In"]),()=>$compare([()=>$get($item($get(e.get("sim"),"people"),e.get("pid")),"country"),()=>$get(e.get("c"),"id")], ["Eq"])]))){yield ("  "+$fmt(e.get("role"),-1,null)+": "+$fmt($call($get(e.get("sim"),"full_name"),[$item($get(e.get("sim"),"people"),e.get("pid"))],$dict([])),-1,null));}}})();})(e)],$dict([]));
}
return $tuple([$call($get("\n","join"),[e.get("rows")],$dict([])),"inspect"]);}else{}
if($truth($compare([()=>e.get("name"),()=>new PS(["people","notables"])], ["In"]))){{const $t1053=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1054 of $iter(e.get("people"))){e.set("p",$t1054);if($truth($boolop("Or",[()=>$call(e.get("getattr"),[e.get("p"),"public_role",""],$dict([])),()=>$compare([()=>$call(e.get("getattr"),[e.get("p"),"fame",0],$dict([])),()=>65], ["GtE"])]))){yield e.get("p");}}})();})(e));e.set("notable",$t1053);}
return $tuple([$boolop("Or",[()=>$call($get("\n","join"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1055 of $iter($call(e.get("sorted"),[e.get("notable")],$dict([["key",$fn("<lambda>",e,["p"],[undefined],null,null,[],[],e=>{return $get(e.get("p"),"fame");return null;})],["reverse",true]])))){e.set("p",$t1055);yield ($fmt($call($get(e.get("sim"),"full_name"),[e.get("p")],$dict([])),-1,null)+": "+$fmt($boolop("Or",[()=>$call(e.get("getattr"),[e.get("p"),"public_role",""],$dict([])),()=>$get(e.get("p"),"job")]),-1,null)+", age "+$fmt($get(e.get("p"),"age"),-1,null));}})();})(e)],$dict([])),()=>"No public figures yet."]),"inspect"]);}else{}
if($truth($compare([()=>e.get("name"),()=>new PS(["country","countries"])], ["In"]))){{const $t1056=$call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1057 of $iter(e.get("people"))){e.set("p",$t1057);yield $get(e.get("p"),"country");}})();})(e)],$dict([]));e.set("counts",$t1056);}
{const $t1058=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1059 of $iter(e.get("countries"))){e.set("c",$t1059);yield ($fmt($get(e.get("c"),"name"),-1,null)+": "+$fmt($item(e.get("counts"),$get(e.get("c"),"id")),-1,null)+" residents | "+$fmt($get(e.get("c"),"government"),-1,null)+" | "+$fmt($call(e.get("getattr"),[e.get("c"),"economic_system","mixed"],$dict([])),-1,null)+" | food "+$fmt($get(e.get("c"),"food"),-1,(".0f"))+", prosperity "+$fmt($get(e.get("c"),"prosperity"),-1,(".0f"))+", stability "+$fmt($get(e.get("c"),"stability"),-1,(".0f"))+" | "+$fmt($boolop("Or",[()=>$call($get(", ","join"),[$call(e.get("sorted"),[$get(e.get("c"),"conditions")],$dict([]))],$dict([])),()=>"normal conditions"]),-1,null));}})();})(e));e.set("rows",$t1058);}
if($truth($compare([()=>e.get("name"),()=>"country"], ["Eq"]))){for(const $t1060 of $iter(e.get("countries"))){e.set("c",$t1060);{const $t1061=$call($get($get(e.get("sim"),"people"),"get"),[$get(e.get("c"),"ruler")],$dict([]));e.set("ruler",$t1061);}
$call($get(e.get("rows"),"append"),[$bin("Add",$bin("Add",($fmt($get(e.get("c"),"name"),-1,null)+": founded year "+$fmt($get(e.get("c"),"founded"),-1,null)+"; leader "),($truth(e.get("ruler"))?$call($get(e.get("sim"),"full_name"),[e.get("ruler")],$dict([])):"vacant")),("; treasury "+$fmt($get(e.get("c"),"treasury"),-1,(",.1f"))+"; "+$fmt($call(e.get("len"),[$get(e.get("c"),"technologies")],$dict([])),-1,null)+" foundations, "+$fmt($call(e.get("len"),[$call(e.get("getattr"),[e.get("c"),"innovations",$dict([])],$dict([]))],$dict([])),-1,null)+" innovations"))],$dict([]));
{const $t1062=$call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1063 of $iter(e.get("people"))){e.set("p",$t1063);if($truth($compare([()=>$get(e.get("p"),"country"),()=>$get(e.get("c"),"id")], ["Eq"]))){yield $get(e.get("p"),"settlement");}}})();})(e)],$dict([]));e.set("populations",$t1062);}
$call($get(e.get("rows"),"extend"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1064 of $iter($call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([])))){e.set("s",$t1064);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("s"),"country"),()=>$get(e.get("c"),"id")], ["Eq"]),()=>$item(e.get("populations"),$get(e.get("s"),"id"))]))){yield $bin("Add",("  "+$fmt($call($get($get(e.get("s"),"kind"),"capitalize"),[],$dict([])),-1,null)+" "+$fmt($get(e.get("s"),"name"),-1,null)+": "+$fmt($item(e.get("populations"),$get(e.get("s"),"id")),-1,null)+" residents"),($truth($compare([()=>$get(e.get("c"),"capital"),()=>$get(e.get("s"),"id")], ["Eq"]))?" (capital)":""));}}})();})(e)],$dict([]));
}
}else{}
return $tuple([$call($get("\n","join"),[e.get("rows")],$dict([])),"inspect"]);}else{}
return $tuple(["Unknown command. Type help for commands.","inspect"]);return null;}));
});
$register("inspection",e=>{e.set("shlex",$import("shlex"));e.set("re",$import("re"));e.set("Counter",$get($import("collections"),"Counter"));e.set("median",$get($import("statistics"),"median"));e.set("_country_scope",$fn("_country_scope",e,["sim", "query"],[undefined,undefined],null,null,[],[],e=>{return ($truth(e.get("query"))?$get($call(e.get("resolve_entity"),[$get(e.get("sim"),"countries"),e.get("query"),"country"],$dict([])),"id"):null);return null;}));
e.set("_demographics",$fn("_demographics",e,["sim", "query"],[undefined,undefined],null,null,[],[],e=>{{const $t1065=$call(e.get("_country_scope"),[e.get("sim"),e.get("query")],$dict([]));e.set("cid",$t1065);}
{const $t1066=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1067 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1067);if($truth($boolop("Or",[()=>$compare([()=>e.get("cid"),()=>null], ["Is"]),()=>$compare([()=>$get(e.get("p"),"country"),()=>e.get("cid")], ["Eq"])]))){yield e.get("p");}}})();})(e));e.set("people",$t1066);}
{const $t1068=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1069 of $iter($call($get($get(e.get("sim"),"archive"),"values"),[],$dict([])))){e.set("p",$t1069);if($truth($boolop("Or",[()=>$compare([()=>e.get("cid"),()=>null], ["Is"]),()=>$compare([()=>$get(e.get("p"),"country"),()=>e.get("cid")], ["Eq"])]))){yield e.get("p");}}})();})(e));e.set("archived",$t1068);}
{const $t1070=($truth($compare([()=>e.get("cid"),()=>null], ["IsNot"]))?$get($item($get(e.get("sim"),"countries"),e.get("cid")),"name"):"World");e.set("title",$t1070);}
{const $t1071=[("Demographics: "+$fmt(e.get("title"),-1,null)+", year "+$fmt($get(e.get("sim"),"year"),-1,null)),("Living population: "+$fmt($call(e.get("len"),[e.get("people")],$dict([])),-1,null)),("Children (under 18): "+$fmt($call(e.get("sum"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1072 of $iter(e.get("people"))){e.set("p",$t1072);yield $compare([()=>$get(e.get("p"),"age"),()=>18], ["Lt"]);}})();})(e)],$dict([])),-1,null)+"; adults: "+$fmt($call(e.get("sum"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1073 of $iter(e.get("people"))){e.set("p",$t1073);yield $compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"]);}})();})(e)],$dict([])),-1,null)),"Age bands:"];e.set("lines",$t1071);}
for(const $t1074 of $iter($tuple([$tuple([0,5]),$tuple([6,17]),$tuple([18,35]),$tuple([36,55]),$tuple([56,75]),$tuple([76,199])]))){{const $t1075=Array.from($iter($t1074));e.set("low",$t1075[0]);e.set("high",$t1075[1]);}{const $t1076=$call(e.get("sum"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1077 of $iter(e.get("people"))){e.set("p",$t1077);yield $compare([()=>e.get("low"),()=>$get(e.get("p"),"age"),()=>e.get("high")], ["LtE", "LtE"]);}})();})(e)],$dict([]));e.set("count",$t1076);}
$call($get(e.get("lines"),"append"),[("  "+$fmt(e.get("low"),-1,null)+"-"+$fmt(e.get("high"),-1,null)+": "+$fmt(e.get("count"),-1,null))],$dict([]));
}
{const $t1078=$call(e.get("sum"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1079 of $iter(e.get("archived"))){e.set("p",$t1079);yield $compare([()=>$get(e.get("p"),"born"),()=>$get(e.get("sim"),"year")], ["Eq"]);}})();})(e)],$dict([]));e.set("born",$t1078);}
{const $t1080=$call(e.get("sum"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1081 of $iter(e.get("archived"))){e.set("p",$t1081);yield $compare([()=>$get(e.get("p"),"died"),()=>$get(e.get("sim"),"year")], ["Eq"]);}})();})(e)],$dict([]));e.set("dead",$t1080);}
$call($get(e.get("lines"),"append"),[("Archived records dated this year: births "+$fmt(e.get("born"),-1,null)+"; deaths "+$fmt(e.get("dead"),-1,null)+" (includes initial residents born in year 0 and editor additions).")],$dict([]));
$call($get(e.get("lines"),"append"),[("All archived people: "+$fmt($call(e.get("len"),[e.get("archived")],$dict([])),-1,null)+"; deceased: "+$fmt($call(e.get("sum"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1082 of $iter(e.get("archived"))){e.set("p",$t1082);yield $compare([()=>$get(e.get("p"),"died"),()=>null], ["IsNot"]);}})();})(e)],$dict([])),-1,null))],$dict([]));
if($truth($compare([()=>e.get("cid"),()=>null], ["Is"]))){{const $t1083=$call(e.get("next"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1084 of $iter($call(e.get("reversed"),[$get(e.get("sim"),"yearly_reports")],$dict([])))){e.set("r",$t1084);if($truth($compare([()=>$item(e.get("r"),"year"),()=>$get(e.get("sim"),"year")], ["Eq"]))){yield e.get("r");}}})();})(e),null],$dict([]));e.set("report",$t1083);}
if($truth(e.get("report"))){$call($get(e.get("lines"),"append"),[("Annual simulation report: births "+$fmt($item(e.get("report"),"births"),-1,null)+"; deaths "+$fmt($item(e.get("report"),"deaths"),-1,null)+" (before subsequent edits).")],$dict([]));
}else{}
}else{$call($get(e.get("lines"),"append"),["Birth/death records are grouped by current or last country, not historical citizenship."],$dict([]));
}
$call($get(e.get("lines"),"append"),["Country distribution:"],$dict([]));
for(const $t1085 of $iter($call(e.get("sorted"),[$call($get($call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1086 of $iter(e.get("people"))){e.set("p",$t1086);yield $get(e.get("p"),"country");}})();})(e)],$dict([])),"items"),[],$dict([]))],$dict([])))){{const $t1087=Array.from($iter($t1085));e.set("country_id",$t1087[0]);e.set("count",$t1087[1]);}$call($get(e.get("lines"),"append"),[("  "+$fmt($get($item($get(e.get("sim"),"countries"),e.get("country_id")),"name"),-1,null)+": "+$fmt(e.get("count"),-1,null))],$dict([]));
}
$call($get(e.get("lines"),"append"),["Settlement distribution:"],$dict([]));
for(const $t1088 of $iter($call(e.get("sorted"),[$call($get($call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1089 of $iter(e.get("people"))){e.set("p",$t1089);yield $get(e.get("p"),"settlement");}})();})(e)],$dict([])),"items"),[],$dict([]))],$dict([["key",$fn("<lambda>",e,["pair"],[undefined],null,null,[],[],e=>{return $tuple([$compare([()=>$item(e.get("pair"),0),()=>null], ["Is"]),$boolop("Or",[()=>$item(e.get("pair"),0),()=>0])]);return null;})]])))){{const $t1090=Array.from($iter($t1088));e.set("sid",$t1090[0]);e.set("count",$t1090[1]);}{const $t1091=$call($get($get(e.get("sim"),"settlements"),"get"),[e.get("sid")],$dict([]));e.set("place",$t1091);}
$call($get(e.get("lines"),"append"),[("  "+$fmt(($truth(e.get("place"))?$get(e.get("place"),"name"):"No settlement"),-1,null)+": "+$fmt(e.get("count"),-1,null))],$dict([]));
}
$call($get(e.get("lines"),"append"),[$bin("Add","Occupations: ",$boolop("Or",[()=>$call($get(", ","join"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1092 of $iter($call(e.get("sorted"),[$call($get($call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1093 of $iter(e.get("people"))){e.set("p",$t1093);yield $call(e.get("getattr"),[e.get("p"),"job","unrecorded"],$dict([]));}})();})(e)],$dict([])),"items"),[],$dict([]))],$dict([])))){{const $t1094=Array.from($iter($t1092));e.set("job",$t1094[0]);e.set("count",$t1094[1]);}yield ($fmt(e.get("job"),-1,null)+": "+$fmt(e.get("count"),-1,null));}})();})(e)],$dict([])),()=>"none"]))],$dict([]));
{const $t1095=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1096 of $iter(e.get("people"))){e.set("p",$t1096);yield $call(e.get("getattr"),[e.get("p"),"wealth",0],$dict([]));}})();})(e));e.set("wealth",$t1095);}
$call($get(e.get("lines"),"append"),[("Wealth: total "+$fmt($call(e.get("sum"),[e.get("wealth")],$dict([])),-1,(",.2f"))+"; mean "+$fmt(($truth(e.get("wealth"))?$bin("Div",$call(e.get("sum"),[e.get("wealth")],$dict([])),$call(e.get("len"),[e.get("wealth")],$dict([]))):0),-1,(",.2f"))+"; median "+$fmt(($truth(e.get("wealth"))?$call(e.get("median"),[e.get("wealth")],$dict([])):0),-1,(",.2f"))+"; maximum "+$fmt($call(e.get("max"),[e.get("wealth")],$dict([["default",0]])),-1,(",.2f")))],$dict([]));
{const $t1097=$call(e.get("sum"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1099 of $iter(e.get("people"))){e.set("p",$t1099);yield $call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1098 of $iter($get(e.get("p"),"immunity"))){e.set("name",$t1098);yield $compare([()=>$call($get($get(e.get("p"),"immunity_until"),"get"),[e.get("name"),$call(e.get("float"),["inf"],$dict([]))],$dict([])),()=>$get(e.get("sim"),"year")], ["Gt"]);}})();})(e)],$dict([]));}})();})(e)],$dict([]));e.set("immune",$t1097);}
$call($get(e.get("lines"),"append"),[("Currently infected: "+$fmt($call(e.get("sum"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1100 of $iter(e.get("people"))){e.set("p",$t1100);yield $call(e.get("bool"),[$get(e.get("p"),"infection")],$dict([]));}})();})(e)],$dict([])),-1,null)+"; people with unexpired immunity: "+$fmt(e.get("immune"),-1,null))],$dict([]));
return $call($get("\n","join"),[e.get("lines")],$dict([]));return null;}));
e.set("_wars",$fn("_wars",e,["sim", "query"],[undefined,undefined],null,null,[],[],e=>{{const $t1101=$call(e.get("_country_scope"),[e.get("sim"),e.get("query")],$dict([]));e.set("cid",$t1101);}
{const $t1102=["Current wars:"];e.set("lines",$t1102);}
for(const $t1103 of $iter($call(e.get("sorted"),[$call($get($get(e.get("sim"),"wars"),"items"),[],$dict([]))],$dict([])))){{const $t1104=Array.from($iter($t1103));e.set("pair",$t1104[0]);e.set("started",$t1104[1]);}if($truth($boolop("And",[()=>$compare([()=>e.get("cid"),()=>null], ["IsNot"]),()=>$compare([()=>e.get("cid"),()=>e.get("pair")], ["NotIn"])]))){continue;}else{}
{const $t1105=$call($get($call(e.get("getattr"),[e.get("sim"),"war_details",$dict([])],$dict([])),"get"),[e.get("pair"),$dict([])],$dict([]));e.set("detail",$t1105);}
$call($get(e.get("lines"),"append"),[("  "+$fmt($get($item($get(e.get("sim"),"countries"),$item(e.get("pair"),0)),"name"),-1,null)+" versus "+$fmt($get($item($get(e.get("sim"),"countries"),$item(e.get("pair"),1)),"name"),-1,null)+": began year "+$fmt(e.get("started"),-1,null)+"; "+$fmt($bin("Sub",$get(e.get("sim"),"year"),e.get("started")),-1,null)+" elapsed years")],$dict([]));
$call($get(e.get("lines"),"append"),[("    Campaign score: "+$fmt($call($get(e.get("detail"),"get"),["score",0],$dict([])),-1,(".2f"))+" (positive favors first country)")],$dict([]));
for(const $t1106 of $iter($call(e.get("enumerate"),[e.get("pair")],$dict([])))){{const $t1107=Array.from($iter($t1106));e.set("index",$t1107[0]);e.set("country_id",$t1107[1]);}{const $t1108=[];e.set("metrics",$t1108);}
for(const $t1109 of $iter($tuple(["mobilized","supplies","exhaustion","captures"]))){e.set("key",$t1109);{const $t1110=$call($get(e.get("detail"),"get"),[e.get("key")],$dict([]));e.set("values",$t1110);}
{const $t1111=($truth($boolop("And",[()=>e.get("values"),()=>$compare([()=>$call(e.get("len"),[e.get("values")],$dict([])),()=>e.get("index")], ["Gt"])]))?$item(e.get("values"),e.get("index")):"not recorded");e.set("value",$t1111);}
$call($get(e.get("metrics"),"append"),[($fmt(e.get("key"),-1,null)+": "+$fmt(e.get("value"),-1,null))],$dict([]));
}
{const $t1112=$call($get(e.get("detail"),"get"),["objectives",[]],$dict([]));e.set("targets",$t1112);}
{const $t1113=($truth($compare([()=>$call(e.get("len"),[e.get("targets")],$dict([])),()=>e.get("index")], ["Gt"]))?$call($get($get(e.get("sim"),"settlements"),"get"),[$item(e.get("targets"),e.get("index"))],$dict([])):null);e.set("target",$t1113);}
$call($get(e.get("metrics"),"append"),[$bin("Add","objective: ",($truth(e.get("target"))?$get(e.get("target"),"name"):"none recorded"))],$dict([]));
$call($get(e.get("lines"),"append"),[$bin("Add",("    "+$fmt($get($item($get(e.get("sim"),"countries"),e.get("country_id")),"name"),-1,null)+": "),$call($get("; ","join"),[e.get("metrics")],$dict([])))],$dict([]));
}
}
if($truth($compare([()=>$call(e.get("len"),[e.get("lines")],$dict([])),()=>1], ["Eq"]))){$call($get(e.get("lines"),"append"),["  No current wars."],$dict([]));
}else{}
$call($get(e.get("lines"),"append"),["Truces (including expired records):"],$dict([]));
{const $t1114=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1115 of $iter($call(e.get("sorted"),[$call($get($call(e.get("getattr"),[e.get("sim"),"truces",$dict([])],$dict([])),"items"),[],$dict([]))],$dict([])))){{const $t1116=Array.from($iter($t1115));e.set("pair",$t1116[0]);e.set("expiry",$t1116[1]);}if($truth($boolop("Or",[()=>$compare([()=>e.get("cid"),()=>null], ["Is"]),()=>$compare([()=>e.get("cid"),()=>e.get("pair")], ["In"])]))){yield $tuple([e.get("pair"),e.get("expiry")]);}}})();})(e));e.set("truces",$t1114);}
for(const $t1117 of $iter(e.get("truces"))){{const $t1118=Array.from($iter($t1117));e.set("pair",$t1118[0]);e.set("expiry",$t1118[1]);}$call($get(e.get("lines"),"append"),[("  "+$fmt($get($item($get(e.get("sim"),"countries"),$item(e.get("pair"),0)),"name"),-1,null)+" / "+$fmt($get($item($get(e.get("sim"),"countries"),$item(e.get("pair"),1)),"name"),-1,null)+": expires year "+$fmt(e.get("expiry"),-1,null)+"; "+$fmt(($truth($compare([()=>e.get("expiry"),()=>$get(e.get("sim"),"year")], ["Gt"]))?"active":"expired"),-1,null))],$dict([]));
}
if($truth($un("Not",e.get("truces")))){$call($get(e.get("lines"),"append"),["  none"],$dict([]));
}else{}
return $call($get("\n","join"),[e.get("lines")],$dict([]));return null;}));
e.set("_diseases",$fn("_diseases",e,["sim", "query", "detailed"],[undefined,undefined,false],null,null,[],[],e=>{{const $t1119=$dict([...$entries($call(e.get("getattr"),[e.get("sim"),"retired_sicknesses",$dict([])],$dict([]))),...$entries($get(e.get("sim"),"sicknesses"))]);e.set("known",$t1119);}
if($truth(e.get("detailed"))){{const $t1120=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1121 of $iter(e.get("known"))){e.set("name",$t1121);if($truth($compare([()=>$call($get(e.get("name"),"casefold"),[],$dict([])),()=>$call($get(e.get("query"),"casefold"),[],$dict([]))], ["Eq"]))){yield e.get("name");}}})();})(e));e.set("exact",$t1120);}
{const $t1122=$boolop("Or",[()=>e.get("exact"),()=>Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1123 of $iter(e.get("known"))){e.set("name",$t1123);if($truth($compare([()=>$call($get(e.get("query"),"casefold"),[],$dict([])),()=>$call($get(e.get("name"),"casefold"),[],$dict([]))], ["In"]))){yield e.get("name");}}})();})(e))]);e.set("matches",$t1122);}
if($truth($boolop("Or",[()=>$un("Not",e.get("query")),()=>$un("Not",e.get("matches"))]))){throw $call(e.get("ValueError"),["Specify a known disease name. Use diseases to list them."],$dict([]));}else{}
if($truth($compare([()=>$call(e.get("len"),[e.get("matches")],$dict([])),()=>1], ["Gt"]))){throw $call(e.get("ValueError"),[$bin("Add",$bin("Add","Ambiguous disease: ",$call($get(", ","join"),[e.get("matches")],$dict([]))),". Use its full name.")],$dict([]));}else{}
{const $t1124=$item(e.get("known"),$item(e.get("matches"),0));e.set("disease",$t1124);}
{const $t1125=$get(e.get("disease"),"name");e.set("name",$t1125);}
{const $t1126=$call($get($call($get($call(e.get("getattr"),[e.get("sim"),"disease_profiles",$dict([])],$dict([])),"get"),[e.get("name"),$dict([])],$dict([])),"get"),["course",$get(e.get("disease"),"course")],$dict([]));e.set("course",$t1126);}
{const $t1127=[("Disease: "+$fmt(e.get("name"),-1,null)+$fmt(($truth($compare([()=>e.get("name"),()=>$get(e.get("sim"),"sicknesses")], ["NotIn"]))?" (retired)":""),-1,null)),("Course: "+$fmt(e.get("course"),-1,null)+"; recurring: "+$fmt($get(e.get("disease"),"recurring"),-1,null)+"; transmission: "+$fmt($get(e.get("disease"),"transmission"),-1,null)),("Baseline annual probabilities: infection "+$fmt($get(e.get("disease"),"infection_chance"),-1,(".2%"))+"; death "+$fmt($get(e.get("disease"),"death_chance"),-1,(".2%"))+"; recovery "+$fmt($get(e.get("disease"),"recovery_chance"),-1,(".2%"))),("Incubation steps: "+$fmt($get(e.get("disease"),"incubation_steps"),-1,null)+"; immunity years: "+$fmt($get(e.get("disease"),"immunity_years"),-1,null)+"; mutation chance: "+$fmt($get(e.get("disease"),"mutation_chance"),-1,(".2%"))),"Actual risks also depend on disease phase, care, immunity, and country conditions.","Current cases by country:"];e.set("lines",$t1127);}
for(const $t1128 of $iter($call(e.get("sorted"),[$call($get($call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1129 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1129);if($truth($compare([()=>$get(e.get("p"),"infection"),()=>e.get("name")], ["Eq"]))){yield $get(e.get("p"),"country");}}})();})(e)],$dict([])),"items"),[],$dict([]))],$dict([])))){{const $t1130=Array.from($iter($t1128));e.set("cid",$t1130[0]);e.set("count",$t1130[1]);}$call($get(e.get("lines"),"append"),[("  "+$fmt($get($item($get(e.get("sim"),"countries"),e.get("cid")),"name"),-1,null)+": "+$fmt(e.get("count"),-1,null))],$dict([]));
}
{const $t1131=$call(e.get("sum"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1132 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1132);yield $compare([()=>$get(e.get("p"),"infection"),()=>e.get("name")], ["Eq"]);}})();})(e)],$dict([]));e.set("active",$t1131);}
{const $t1133=$call(e.get("sum"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1134 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1134);yield $boolop("And",[()=>$compare([()=>e.get("name"),()=>$get(e.get("p"),"immunity")], ["In"]),()=>$compare([()=>$call($get($get(e.get("p"),"immunity_until"),"get"),[e.get("name"),$call(e.get("float"),["inf"],$dict([]))],$dict([])),()=>$get(e.get("sim"),"year")], ["Gt"])]);}})();})(e)],$dict([]));e.set("immune",$t1133);}
{const $t1135=$call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1137 of $iter($call($get($get(e.get("sim"),"archive"),"values"),[],$dict([])))){e.set("p",$t1137);for(const $t1136 of $iter($call(e.get("getattr"),[e.get("p"),"infection_history",[]],$dict([])))){e.set("entry",$t1136);if($truth($compare([()=>$call($get(e.get("entry"),"get"),["disease"],$dict([])),()=>e.get("name")], ["Eq"]))){yield $call($get(e.get("entry"),"get"),["event"],$dict([]));}}}})();})(e)],$dict([]));e.set("outcomes",$t1135);}
$call($get(e.get("lines"),"append"),[("Active cases: "+$fmt(e.get("active"),-1,null)+"; living people with unexpired immunity: "+$fmt(e.get("immune"),-1,null))],$dict([]));
{const $t1138=$call($get($call(e.get("getattr"),[e.get("sim"),"cure_progress",$dict([])],$dict([])),"get"),[e.get("name"),0],$dict([]));e.set("cure",$t1138);}
{const $t1139=$call(e.get("sum"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1140 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1140);yield $boolop("And",[()=>$compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"]),()=>$compare([()=>$get(e.get("p"),"job"),()=>new PS(["scientist","healer"])], ["In"])]);}})();})(e)],$dict([]));e.set("researchers",$t1139);}
$call($get(e.get("lines"),"append"),[$bin("Add",("Cure progress: "+$fmt(e.get("cure"),-1,(".1f"))+"% ("+$fmt(e.get("researchers"),-1,null)+" scientists and healers at work); "),($truth($compare([()=>e.get("cure"),()=>100], ["GtE"]))?"eradication is possible once no one is infected.":"eradication requires 100%."))],$dict([]));
$call($get(e.get("lines"),"append"),[$bin("Add","Recorded lifetime health events: ",$boolop("Or",[()=>$call($get(", ","join"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1141 of $iter($call(e.get("sorted"),[$call($get(e.get("outcomes"),"items"),[],$dict([]))],$dict([])))){{const $t1142=Array.from($iter($t1141));e.set("event",$t1142[0]);e.set("count",$t1142[1]);}yield ($fmt(e.get("event"),-1,null)+": "+$fmt(e.get("count"),-1,null));}})();})(e)],$dict([])),()=>"none"]))],$dict([]));
$call($get(e.get("lines"),"append"),["Local annual trends (last 10 recorded years per country):"],$dict([]));
for(const $t1143 of $iter($call($get($get(e.get("sim"),"countries"),"values"),[],$dict([])))){e.set("country",$t1143);{const $t1144=$call($get($call($get($dict([...$entries($call(e.get("getattr"),[e.get("country"),"retired_outbreaks",$dict([])],$dict([]))),...$entries($call(e.get("getattr"),[e.get("country"),"disease_outbreaks",$dict([])],$dict([])))]),"get"),[e.get("name"),$dict([])],$dict([])),"get"),["annual",[]],$dict([]));e.set("records",$t1144);}
for(const $t1145 of $iter($item(e.get("records"),$slice($un("USub",10),null,null)))){e.set("record",$t1145);$call($get(e.get("lines"),"append"),[("  "+$fmt($get(e.get("country"),"name"),-1,null)+", year "+$fmt($item(e.get("record"),"year"),-1,null)+": infections "+$fmt($item(e.get("record"),"infections"),-1,null)+"; deaths "+$fmt($item(e.get("record"),"deaths"),-1,null)+"; recoveries "+$fmt($item(e.get("record"),"recoveries"),-1,null)+"; active "+$fmt($item(e.get("record"),"active"),-1,null)+"; "+$fmt($call($get(e.get("record"),"get"),["phase","unrecorded phase"],$dict([])),-1,null))],$dict([]));
}
}
return $call($get("\n","join"),[e.get("lines")],$dict([]));}else{}
{const $t1146=$call(e.get("_country_scope"),[e.get("sim"),e.get("query")],$dict([]));e.set("cid",$t1146);}
{const $t1147=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1148 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1148);if($truth($boolop("Or",[()=>$compare([()=>e.get("cid"),()=>null], ["Is"]),()=>$compare([()=>$get(e.get("p"),"country"),()=>e.get("cid")], ["Eq"])]))){yield e.get("p");}}})();})(e));e.set("people",$t1147);}
{const $t1149=$call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1150 of $iter(e.get("people"))){e.set("p",$t1150);if($truth($get(e.get("p"),"infection"))){yield $get(e.get("p"),"infection");}}})();})(e)],$dict([]));e.set("cases",$t1149);}
{const $t1151=[$bin("Add",$bin("Add","Known disease types",($truth($compare([()=>e.get("cid"),()=>null], ["IsNot"]))?(" (case counts in "+$fmt($get($item($get(e.get("sim"),"countries"),e.get("cid")),"name"),-1,null)+")"):" (world case counts)")),":")];e.set("lines",$t1151);}
for(const $t1152 of $iter($call(e.get("sorted"),[$call($get(e.get("known"),"items"),[],$dict([]))],$dict([])))){{const $t1153=Array.from($iter($t1152));e.set("name",$t1153[0]);e.set("disease",$t1153[1]);}{const $t1154=$call($get($call($get($call(e.get("getattr"),[e.get("sim"),"disease_profiles",$dict([])],$dict([])),"get"),[e.get("name"),$dict([])],$dict([])),"get"),["course",$get(e.get("disease"),"course")],$dict([]));e.set("course",$t1154);}
$call($get(e.get("lines"),"append"),[("  "+$fmt(e.get("name"),-1,null)+": "+$fmt(e.get("course"),-1,null)+"; cases "+$fmt($item(e.get("cases"),e.get("name")),-1,null)+$fmt(($truth($compare([()=>e.get("name"),()=>$get(e.get("sim"),"sicknesses")], ["NotIn"]))?" | retired":""),-1,null))],$dict([]));
}
if($truth($un("Not",e.get("known")))){$call($get(e.get("lines"),"append"),["  No known disease types."],$dict([]));
}else{}
return $call($get("\n","join"),[e.get("lines")],$dict([]));return null;}));
e.set("resolve_entity",$fn("resolve_entity",e,["mapping", "query", "label", "name_fn"],[undefined,undefined,undefined,null],null,null,[],[],e=>{{const $t1155=$boolop("Or",[()=>e.get("name_fn"),()=>$fn("<lambda>",e,["item"],[undefined],null,null,[],[],e=>{return $get(e.get("item"),"name");return null;})]);e.set("name_fn",$t1155);}
{const $t1156=$call($get($call(e.get("str"),[e.get("query")],$dict([])),"strip"),[],$dict([]));e.set("query",$t1156);}
if($truth($un("Not",e.get("query")))){throw $call(e.get("ValueError"),[("Specify a "+$fmt(e.get("label"),-1,null)+" name.")],$dict([]));}else{}
if($truth($compare([()=>e.get("query"),()=>e.get("mapping")], ["In"]))){return $item(e.get("mapping"),e.get("query"));}else{}
{const $t1157=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1158 of $iter($call($get(e.get("mapping"),"items"),[],$dict([])))){{const $t1159=Array.from($iter($t1158));e.set("key",$t1159[0]);e.set("item",$t1159[1]);}if($truth($boolop("And",[()=>$call(e.get("isinstance"),[e.get("key"),e.get("str")],$dict([])),()=>$compare([()=>$call($get(e.get("key"),"casefold"),[],$dict([])),()=>$call($get(e.get("query"),"casefold"),[],$dict([]))], ["Eq"])]))){yield e.get("item");}}})();})(e));e.set("key_matches",$t1157);}
if($truth($compare([()=>$call(e.get("len"),[e.get("key_matches")],$dict([])),()=>1], ["Eq"]))){return $item(e.get("key_matches"),0);}else{}
{const $t1160=$call($get(e.get("query"),"lstrip"),["#"],$dict([]));e.set("number",$t1160);}
if($truth($call($get(e.get("number"),"isdecimal"),[],$dict([])))){{const $t1161=$call($get(e.get("mapping"),"get"),[$call(e.get("int"),[e.get("number")],$dict([]))],$dict([]));e.set("item",$t1161);}
if($truth($compare([()=>e.get("item"),()=>null], ["Is"]))){throw $call(e.get("ValueError"),[("No "+$fmt(e.get("label"),-1,null)+" with ID #"+$fmt(e.get("number"),-1,null)+".")],$dict([]));}else{}
return e.get("item");}else{}
{const $t1162=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1163 of $iter($call($get(e.get("mapping"),"values"),[],$dict([])))){e.set("item",$t1163);if($truth($compare([()=>$call($get($call(e.get("name_fn"),[e.get("item")],$dict([])),"casefold"),[],$dict([])),()=>$call($get(e.get("query"),"casefold"),[],$dict([]))], ["Eq"]))){yield e.get("item");}}})();})(e));e.set("exact",$t1162);}
{const $t1164=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1165 of $iter($call($get(e.get("mapping"),"values"),[],$dict([])))){e.set("item",$t1165);if($truth($compare([()=>$call($get($item($call($get($call(e.get("name_fn"),[e.get("item")],$dict([])),"rsplit"),[" of ",1],$dict([])),0),"casefold"),[],$dict([])),()=>$call($get(e.get("query"),"casefold"),[],$dict([]))], ["Eq"]))){yield e.get("item");}}})();})(e));e.set("short",$t1164);}
{const $t1166=$call($get(e.get("re"),"compile"),[$bin("Add",$bin("Add","(?<!\\w)",$call($get(e.get("re"),"escape"),[$call($get(e.get("query"),"casefold"),[],$dict([]))],$dict([]))),"(?!\\w)")],$dict([]));e.set("pattern",$t1166);}
{const $t1167=$call($get(e.get("re"),"fullmatch"),["[ivxlcdm]+",$call($get($item($call($get(e.get("query"),"split"),[],$dict([])),$un("USub",1)),"casefold"),[],$dict([]))],$dict([]));e.set("numbered",$t1167);}
{const $t1168=$boolop("Or",[()=>e.get("exact"),()=>e.get("short"),()=>Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1169 of $iter($call($get(e.get("mapping"),"values"),[],$dict([])))){e.set("item",$t1169);if($truth(($truth(e.get("numbered"))?$call($get(e.get("pattern"),"search"),[$call($get($call(e.get("name_fn"),[e.get("item")],$dict([])),"casefold"),[],$dict([]))],$dict([])):$compare([()=>$call($get(e.get("query"),"casefold"),[],$dict([])),()=>$call($get($call(e.get("name_fn"),[e.get("item")],$dict([])),"casefold"),[],$dict([]))], ["In"])))){yield e.get("item");}}})();})(e))]);e.set("matches",$t1168);}
if($truth($un("Not",e.get("matches")))){throw $call(e.get("ValueError"),[("No "+$fmt(e.get("label"),-1,null)+" matching "+$fmt(e.get("query"),114,null)+".")],$dict([]));}else{}
if($truth($compare([()=>$call(e.get("len"),[e.get("matches")],$dict([])),()=>1], ["Gt"]))){{const $t1170=$call($get("; ","join"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1171 of $iter($item(e.get("matches"),$slice(null,20,null)))){e.set("item",$t1171);yield $call($get(e.get("shlex"),"quote"),[$call(e.get("name_fn"),[e.get("item")],$dict([]))],$dict([]));}})();})(e)],$dict([]));e.set("candidates",$t1170);}
{const $t1172=($truth($compare([()=>$call(e.get("len"),[e.get("matches")],$dict([])),()=>20], ["Gt"]))?("; and "+$fmt($bin("Sub",$call(e.get("len"),[e.get("matches")],$dict([])),20),-1,null)+" more"):"");e.set("suffix",$t1172);}
throw $call(e.get("ValueError"),[("Ambiguous "+$fmt(e.get("label"),-1,null)+": "+$fmt(e.get("candidates"),-1,null)+$fmt(e.get("suffix"),-1,null)+". Use one of these full names, including its Roman numeral and country when shown.")],$dict([]));}else{}
return $item(e.get("matches"),0);return null;}));
e.set("_person_ref",$fn("_person_ref",e,["sim", "pid"],[undefined,undefined],null,null,[],[],e=>{{const $t1173=$call($get($get(e.get("sim"),"archive"),"get"),[e.get("pid")],$dict([]));e.set("person",$t1173);}
return ($truth(e.get("person"))?$call($get(e.get("sim"),"full_name"),[e.get("person")],$dict([])):"Unrecorded person");return null;}));
e.set("_person_detail",$fn("_person_detail",e,["sim", "person"],[undefined,undefined],null,null,[],[],e=>{{const $t1174=$item($get(e.get("sim"),"countries"),$get(e.get("person"),"country"));e.set("country",$t1174);}
{const $t1175=$call($get($get(e.get("sim"),"settlements"),"get"),[$get(e.get("person"),"settlement")],$dict([]));e.set("settlement",$t1175);}
{const $t1176=$item($get(e.get("sim"),"lineages"),$get(e.get("person"),"lineage"));e.set("lineage",$t1176);}
{const $t1177=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1178 of $iter($call($get($get(e.get("sim"),"archive"),"values"),[],$dict([])))){e.set("p",$t1178);if($truth($compare([()=>$get(e.get("person"),"id"),()=>$get(e.get("p"),"parents")], ["In"]))){yield e.get("p");}}})();})(e));e.set("children",$t1177);}
{const $t1179=[("Person: "+$fmt($call($get(e.get("sim"),"full_name"),[e.get("person")],$dict([])),-1,null)),("Status: "+$fmt(($truth($compare([()=>$get(e.get("person"),"id"),()=>$get(e.get("sim"),"people")], ["In"]))?"living":"deceased"),-1,null)+"; age: "+$fmt($get(e.get("person"),"age"),-1,null)+"; born: year "+$fmt($get(e.get("person"),"born"),-1,null)),("Country: "+$fmt($get(e.get("country"),"name"),-1,null)),("Settlement: "+$fmt(($truth(e.get("settlement"))?$get(e.get("settlement"),"name"):"none"),-1,null)),("Lineage: "+$fmt($call($get(e.get("sim"),"lineage_name"),[$get(e.get("lineage"),"id")],$dict([])),-1,null)),("Wealth: "+$fmt($call(e.get("getattr"),[e.get("person"),"wealth",0],$dict([])),-1,(",.2f"))+"; occupation: "+$fmt($call(e.get("getattr"),[e.get("person"),"job","none"],$dict([])),-1,null)),("Public role: "+$fmt($boolop("Or",[()=>$call(e.get("getattr"),[e.get("person"),"public_role",""],$dict([])),()=>"none"]),-1,null)+"; fame: "+$fmt($call(e.get("getattr"),[e.get("person"),"fame",0],$dict([])),-1,(".1f"))),$bin("Add","Parents: ",$boolop("Or",[()=>$call($get("; ","join"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1180 of $iter($get(e.get("person"),"parents"))){e.set("pid",$t1180);yield $call(e.get("_person_ref"),[e.get("sim"),e.get("pid")],$dict([]));}})();})(e)],$dict([])),()=>"unrecorded"])),$bin("Add","Children: ",$boolop("Or",[()=>$call($get("; ","join"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1181 of $iter(e.get("children"))){e.set("p",$t1181);yield $call(e.get("_person_ref"),[e.get("sim"),$get(e.get("p"),"id")],$dict([]));}})();})(e)],$dict([])),()=>"none"])),($fmt(($truth($compare([()=>$get(e.get("person"),"died"),()=>null], ["Is"]))?"Current infection":"Infection at death"),-1,null)+": "+$fmt($boolop("Or",[()=>$get(e.get("person"),"infection"),()=>"none"]),-1,null)+"; infection steps: "+$fmt($get(e.get("person"),"infection_steps"),-1,null)),("Wounds: "+$fmt(($truth($compare([()=>$call(e.get("getattr"),[e.get("person"),"wounded_until",0],$dict([])),()=>$get(e.get("sim"),"year")], ["Gt"]))?$bin("Add","recovering until year ",$call(e.get("str"),[$get(e.get("person"),"wounded_until")],$dict([]))):"none active"),-1,null)),$bin("Add","Immunity records: ",$boolop("Or",[()=>$call($get(", ","join"),[$call(e.get("sorted"),[$get(e.get("person"),"immunity")],$dict([]))],$dict([])),()=>"none"])),$bin("Add","Immunity expiry years: ",$boolop("Or",[()=>$call($get(", ","join"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1182 of $iter($call(e.get("sorted"),[$call($get($get(e.get("person"),"immunity_until"),"items"),[],$dict([]))],$dict([])))){{const $t1183=Array.from($iter($t1182));e.set("name",$t1183[0]);e.set("year",$t1183[1]);}yield ($fmt(e.get("name"),-1,null)+": "+$fmt(e.get("year"),-1,null));}})();})(e)],$dict([])),()=>"none"]))];e.set("lines",$t1179);}
if($truth($compare([()=>$get(e.get("person"),"died"),()=>null], ["IsNot"]))){$call($get(e.get("lines"),"append"),[("Died: year "+$fmt($get(e.get("person"),"died"),-1,null)+"; cause: "+$fmt($boolop("Or",[()=>$get(e.get("person"),"cause_of_death"),()=>"unrecorded"]),-1,null))],$dict([]));
}else{}
{const $t1184=$call(e.get("getattr"),[e.get("person"),"infection_history",[]],$dict([]));e.set("health",$t1184);}
$call($get(e.get("lines"),"append"),["Health history:"],$dict([]));
$call($get(e.get("lines"),"extend"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1185 of $iter(e.get("health"))){e.set("entry",$t1185);yield ("  Year "+$fmt($call($get(e.get("entry"),"get"),["year","?"],$dict([])),-1,null)+": "+$fmt($call($get(e.get("entry"),"get"),["event","?"],$dict([])),-1,null)+" - "+$fmt($call($get(e.get("entry"),"get"),["disease","?"],$dict([])),-1,null));}})();})(e)],$dict([]));
if($truth($un("Not",e.get("health")))){$call($get(e.get("lines"),"append"),["  No recorded infections or vaccinations."],$dict([]));
}else{}
{const $t1186=("{person:"+$fmt($get(e.get("person"),"id"),-1,null)+":");e.set("marker",$t1186);}
{const $t1187=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1188 of $iter($get(e.get("sim"),"history"))){{const $t1189=Array.from($iter($t1188));e.set("year",$t1189[0]);e.set("message",$t1189[1]);}if($truth($compare([()=>e.get("marker"),()=>e.get("message")], ["In"]))){yield $tuple([e.get("year"),e.get("message")]);}}})();})(e));e.set("events",$t1187);}
$call($get(e.get("lines"),"append"),["Recorded public history:"],$dict([]));
$call($get(e.get("lines"),"extend"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1190 of $iter(e.get("events"))){{const $t1191=Array.from($iter($t1190));e.set("year",$t1191[0]);e.set("message",$t1191[1]);}yield ("  Year "+$fmt(e.get("year"),-1,null)+": "+$fmt($call($get(e.get("sim"),"render_history"),[e.get("message")],$dict([])),-1,null));}})();})(e)],$dict([]));
if($truth($un("Not",e.get("events")))){$call($get(e.get("lines"),"append"),["  No public events recorded."],$dict([]));
}else{}
return $call($get("\n","join"),[e.get("lines")],$dict([]));return null;}));
e.set("_directory",$fn("_directory",e,["rows", "title", "page", "footer"],[undefined,undefined,undefined,"Use page=N to browse; inspect a record using its displayed name."],null,null,[],[],e=>{{const $t1192=$call(e.get("max"),[1,$bin("FloorDiv",$bin("Add",$call(e.get("len"),[e.get("rows")],$dict([])),49),50)],$dict([]));e.set("pages",$t1192);}
if($truth($compare([()=>e.get("page"),()=>e.get("pages")], ["Gt"]))){throw $call(e.get("ValueError"),[("Page "+$fmt(e.get("page"),-1,null)+" does not exist; choose 1 through "+$fmt(e.get("pages"),-1,null)+".")],$dict([]));}else{}
return $bin("Add",$bin("Add",$bin("Add",($fmt(e.get("title"),-1,null)+" ("+$fmt($call(e.get("len"),[e.get("rows")],$dict([])),-1,null)+" matches; page "+$fmt(e.get("page"),-1,null)+"/"+$fmt(e.get("pages"),-1,null)+"):\n"),$boolop("Or",[()=>$call($get("\n","join"),[$item(e.get("rows"),$slice($bin("Mult",$bin("Sub",e.get("page"),1),50),$bin("Mult",e.get("page"),50),null))],$dict([])),()=>"No matches."])),"\n"),e.get("footer"));return null;}));
e.set("_id_search",$fn("_id_search",e,["sim", "tokens"],[undefined,undefined],null,null,[],[],e=>{{const $t1193=$dict([["person","person"],["people","person"],["persons","person"],["individual","person"],["country","country"],["countries","country"],["settlement","settlement"],["settlements","settlement"],["lineage","lineage"],["lineages","lineage"],["discovery","discovery"],["discoveries","discovery"],["innovation","discovery"]]);e.set("aliases",$t1193);}
{const $t1194=($truth(e.get("tokens"))?$call($get(e.get("aliases"),"get"),[$call($get($item(e.get("tokens"),0),"casefold"),[],$dict([]))],$dict([])):null);e.set("kind",$t1194);}
{const $t1195=($truth(e.get("kind"))?$item(e.get("tokens"),$slice(1,null,null)):e.get("tokens"));e.set("tokens",$t1195);}
{const $t1196=$tuple([[],1]);{const $t1197=Array.from($iter($t1196));e.set("terms",$t1197[0]);e.set("page",$t1197[1]);}}
for(const $t1198 of $iter(e.get("tokens"))){e.set("token",$t1198);if($truth($call($get($call($get(e.get("token"),"casefold"),[],$dict([])),"startswith"),["page="],$dict([])))){try{{const $t1199=$call(e.get("int"),[$item(e.get("token"),$slice(5,null,null))],$dict([]));e.set("page",$t1199);}
}catch($error){if($isinstance($error,e.get("ValueError"))){throw $call(e.get("ValueError"),["Page must be a positive integer."],$dict([]));}else{throw $error;}}if($truth($compare([()=>e.get("page"),()=>1], ["Lt"]))){throw $call(e.get("ValueError"),["Page must be a positive integer."],$dict([]));}else{}
}else{$call($get(e.get("terms"),"append"),[e.get("token")],$dict([]));
}
}
{const $t1200=$call($get($call($get(" ","join"),[e.get("terms")],$dict([])),"casefold"),[],$dict([]));e.set("query",$t1200);}
{const $t1201=[];e.set("entries",$t1201);}
if($truth($compare([()=>e.get("kind"),()=>$tuple([null,"person"])], ["In"]))){$call($get(e.get("entries"),"extend"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1202 of $iter($call($get($get(e.get("sim"),"archive"),"values"),[],$dict([])))){e.set("p",$t1202);yield $tuple(["person",$call(e.get("str"),[$get(e.get("p"),"id")],$dict([])),$bin("Add",$call($get(e.get("sim"),"full_name"),[e.get("p")],$dict([])),($truth($compare([()=>$get(e.get("p"),"died"),()=>null], ["IsNot"]))?" [deceased]":""))]);}})();})(e)],$dict([]));
}else{}
if($truth($compare([()=>e.get("kind"),()=>$tuple([null,"country"])], ["In"]))){$call($get(e.get("entries"),"extend"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1203 of $iter($call($get($get(e.get("sim"),"countries"),"values"),[],$dict([])))){e.set("c",$t1203);yield $tuple(["country",$call(e.get("str"),[$get(e.get("c"),"id")],$dict([])),$bin("Add",$get(e.get("c"),"name"),($truth($compare([()=>$get(e.get("c"),"ended"),()=>null], ["IsNot"]))?" [ended]":""))]);}})();})(e)],$dict([]));
}else{}
if($truth($compare([()=>e.get("kind"),()=>$tuple([null,"settlement"])], ["In"]))){$call($get(e.get("entries"),"extend"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1204 of $iter($call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([])))){e.set("s",$t1204);yield $tuple(["settlement",$call(e.get("str"),[$get(e.get("s"),"id")],$dict([])),$bin("Add",$get(e.get("s"),"name"),($truth($compare([()=>$get(e.get("s"),"abandoned"),()=>null], ["IsNot"]))?" [abandoned]":""))]);}})();})(e)],$dict([]));
}else{}
if($truth($compare([()=>e.get("kind"),()=>$tuple([null,"lineage"])], ["In"]))){$call($get(e.get("entries"),"extend"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1205 of $iter($call($get($get(e.get("sim"),"lineages"),"values"),[],$dict([])))){e.set("l",$t1205);yield $tuple(["lineage",$call(e.get("str"),[$get(e.get("l"),"id")],$dict([])),$call($get(e.get("sim"),"lineage_name"),[$get(e.get("l"),"id")],$dict([]))]);}})();})(e)],$dict([]));
}else{}
if($truth($compare([()=>e.get("kind"),()=>"discovery"], ["Eq"]))){e.set("INNOVATIONS",$get($import("discoveries"),"INNOVATIONS"));e.set("TECHNOLOGIES",$get($import("society"),"TECHNOLOGIES"));$call($get(e.get("entries"),"extend"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1206 of $iter($call($get(e.get("INNOVATIONS"),"values"),[],$dict([])))){e.set("i",$t1206);yield $tuple(["innovation",$get(e.get("i"),"id"),$get(e.get("i"),"name")]);}})();})(e)],$dict([]));
$call($get(e.get("entries"),"extend"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1207 of $iter(e.get("TECHNOLOGIES"))){e.set("name",$t1207);yield $tuple(["foundation",e.get("name"),e.get("name")]);}})();})(e)],$dict([]));
}else{}
{const $t1208=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1209 of $iter(e.get("entries"))){{const $t1210=Array.from($iter($t1209));e.set("label",$t1210[0]);e.set("key",$t1210[1]);e.set("name",$t1210[2]);}if($truth($boolop("Or",[()=>$compare([()=>e.get("query"),()=>$call($get(e.get("name"),"casefold"),[],$dict([]))], ["In"]),()=>$compare([()=>$call($get(e.get("query"),"lstrip"),["#"],$dict([])),()=>$call($get(e.get("key"),"casefold"),[],$dict([]))], ["Eq"])]))){yield ($fmt(e.get("label"),-1,null)+" ["+$fmt(e.get("key"),-1,null)+"]: "+$fmt(e.get("name"),-1,null));}}})();})(e));e.set("rows",$t1208);}
return $call(e.get("_directory"),[e.get("rows"),"Advanced ID lookup",e.get("page"),"Names work in all commands. Alternatively use the ID in brackets (without brackets); numeric IDs may also use #. Use page=N to browse."],$dict([]));return null;}));
e.set("inspect_command",$fn("inspect_command",e,["sim", "text"],[undefined,undefined],null,null,[],[],e=>{{const $t1211=$call($get($call($get(e.get("text"),"strip"),[],$dict([])),"split"),[],$dict([["maxsplit",1]]));e.set("head",$t1211);}
if($truth($boolop("Or",[()=>$un("Not",e.get("head")),()=>$compare([()=>$call($get($item(e.get("head"),0),"casefold"),[],$dict([])),()=>new PS(["person","individual","people","persons","individuals","settlement","settlements","demographics","wars","disease","diseases","ids","borders","geography","projects","expeditions","systems","hazards","economy","tile","governments"])], ["NotIn"])]))){return null;}else{}
try{{const $t1212=$call($get(e.get("shlex"),"split"),[e.get("text")],$dict([]));e.set("tokens",$t1212);}
{const $t1213=$call($get($call($get(e.get("tokens"),"pop"),[0],$dict([])),"casefold"),[],$dict([]));e.set("command",$t1213);}
if($truth($compare([()=>e.get("command"),()=>"ids"], ["Eq"]))){return $tuple([$call(e.get("_id_search"),[e.get("sim"),e.get("tokens")],$dict([])),"inspect"]);}else{}
if($truth($compare([()=>e.get("command"),()=>"projects"], ["Eq"]))){e.set("projects_report",$get($import("development"),"projects_report"));return $tuple([$call(e.get("projects_report"),[e.get("sim"),$call($get($call($get(" ","join"),[e.get("tokens")],$dict([])),"casefold"),[],$dict([]))],$dict([])),"inspect"]);}else{}
if($truth($compare([()=>e.get("command"),()=>"expeditions"], ["Eq"]))){e.set("expeditions_report",$get($import("development"),"expeditions_report"));return $tuple([$call(e.get("expeditions_report"),[e.get("sim"),$call($get($call($get(" ","join"),[e.get("tokens")],$dict([])),"casefold"),[],$dict([]))],$dict([])),"inspect"]);}else{}
if($truth($compare([()=>e.get("command"),()=>"systems"], ["Eq"]))){e.set("systems_report",$get($import("systems"),"report"));return $tuple([$call(e.get("systems_report"),[e.get("sim"),$call($get($call($get(" ","join"),[e.get("tokens")],$dict([])),"casefold"),[],$dict([]))],$dict([])),"inspect"]);}else{}
if($truth($compare([()=>e.get("command"),()=>"economy"], ["Eq"]))){e.set("economy_report",$get($import("economy"),"report"));return $tuple([$call(e.get("economy_report"),[e.get("sim"),$call($get($call($get(" ","join"),[e.get("tokens")],$dict([])),"casefold"),[],$dict([]))],$dict([])),"inspect"]);}else{}
if($truth($compare([()=>e.get("command"),()=>"governments"], ["Eq"]))){e.set("governments_report",$get($import("governments"),"describe"));return $tuple([$call(e.get("governments_report"),[e.get("sim"),$call($get($call($get(" ","join"),[e.get("tokens")],$dict([])),"casefold"),[],$dict([]))],$dict([])),"inspect"]);}else{}
if($truth($compare([()=>e.get("command"),()=>"tile"], ["Eq"]))){e.set("tile_report",$get($import("economy"),"tile_report"));if($truth($boolop("Or",[()=>$compare([()=>$call(e.get("len"),[e.get("tokens")],$dict([])),()=>2], ["NotEq"]),()=>$un("Not",$call(e.get("all"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1214 of $iter(e.get("tokens"))){e.set("t",$t1214);yield $call($get($call($get(e.get("t"),"lstrip"),["-"],$dict([])),"isdigit"),[],$dict([]));}})();})(e)],$dict([])))]))){throw $call(e.get("ValueError"),["Usage: tile X Y"],$dict([]));}else{}
return $tuple([$call(e.get("tile_report"),[e.get("sim"),$call(e.get("int"),[$item(e.get("tokens"),0)],$dict([])),$call(e.get("int"),[$item(e.get("tokens"),1)],$dict([]))],$dict([])),"inspect"]);}else{}
if($truth($compare([()=>e.get("command"),()=>"hazards"], ["Eq"]))){e.set("hazard_report",$get($import("systems"),"hazard_report"));return $tuple([$call(e.get("hazard_report"),[e.get("sim"),$call(e.get("resolve_entity"),[$get(e.get("sim"),"settlements"),$call($get(" ","join"),[e.get("tokens")],$dict([])),"settlement"],$dict([]))],$dict([])),"inspect"]);}else{}
if($truth($compare([()=>e.get("command"),()=>new PS(["borders","geography"])], ["In"]))){e.set("report",$get($import("geography"),"report"));{const $t1215=$call($get($call($get(" ","join"),[e.get("tokens")],$dict([])),"casefold"),[],$dict([]));e.set("query",$t1215);}
return $tuple([$call(e.get("report"),[e.get("sim"),e.get("query")],$dict([])),"inspect"]);}else{}
if($truth($compare([()=>e.get("command"),()=>"demographics"], ["Eq"]))){return $tuple([$call(e.get("_demographics"),[e.get("sim"),$call($get(" ","join"),[e.get("tokens")],$dict([]))],$dict([])),"inspect"]);}else{}
if($truth($compare([()=>e.get("command"),()=>"wars"], ["Eq"]))){return $tuple([$call(e.get("_wars"),[e.get("sim"),$call($get(" ","join"),[e.get("tokens")],$dict([]))],$dict([])),"inspect"]);}else{}
if($truth($compare([()=>e.get("command"),()=>new PS(["disease","diseases"])], ["In"]))){return $tuple([$call(e.get("_diseases"),[e.get("sim"),$call($get(" ","join"),[e.get("tokens")],$dict([]))],$dict([["detailed",$compare([()=>e.get("command"),()=>"disease"], ["Eq"])]])),"inspect"]);}else{}
if($truth($compare([()=>e.get("command"),()=>new PS(["person","individual"])], ["In"]))){return $tuple([$call(e.get("_person_detail"),[e.get("sim"),$call(e.get("resolve_entity"),[$get(e.get("sim"),"archive"),$call($get(" ","join"),[e.get("tokens")],$dict([])),"person",$get(e.get("sim"),"full_name")],$dict([]))],$dict([])),"inspect"]);}else{}
if($truth($compare([()=>e.get("command"),()=>"settlement"], ["Eq"]))){{const $t1216=$call(e.get("resolve_entity"),[$get(e.get("sim"),"settlements"),$call($get(" ","join"),[e.get("tokens")],$dict([])),"settlement"],$dict([]));e.set("place",$t1216);}
{const $t1217=$call(e.get("sorted"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1218 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1218);if($truth($compare([()=>$get(e.get("p"),"settlement"),()=>$get(e.get("place"),"id")], ["Eq"]))){yield e.get("p");}}})();})(e)],$dict([["key",$fn("<lambda>",e,["p"],[undefined],null,null,[],[],e=>{return $get(e.get("p"),"id");return null;})]]));e.set("residents",$t1217);}
{const $t1219=$item($get(e.get("sim"),"countries"),$get(e.get("place"),"country"));e.set("country",$t1219);}
e.set("describe",$get($import("geography"),"describe"));{const $t1220=[("Settlement: "+$fmt($get(e.get("place"),"name"),-1,null)),("Country: "+$fmt($get(e.get("country"),"name"),-1,null)+"; kind: "+$fmt($get(e.get("place"),"kind"),-1,null)),("Terrain: "+$fmt($call(e.get("describe"),[e.get("sim"),e.get("place")],$dict([])),-1,null)+" (map cell "+$fmt($get(e.get("place"),"gx"),-1,null)+", "+$fmt($get(e.get("place"),"gy"),-1,null)+")"),$bin("Add","Buildings: ",$boolop("Or",[()=>$call($get(", ","join"),[$call(e.get("sorted"),[$call(e.get("getattr"),[e.get("place"),"buildings",$dict([])],$dict([]))],$dict([]))],$dict([])),()=>"none"])),("Founded: year "+$fmt($get(e.get("place"),"founded"),-1,null)+"; founder: "+$fmt($call(e.get("_person_ref"),[e.get("sim"),$get(e.get("place"),"founder")],$dict([])),-1,null)),("Abandoned: "+$fmt(($truth($compare([()=>$get(e.get("place"),"abandoned"),()=>null], ["IsNot"]))?$bin("Add","year ",$call(e.get("str"),[$get(e.get("place"),"abandoned")],$dict([]))):"no"),-1,null)),("Removed by editor: "+$fmt(($truth($compare([()=>$call(e.get("getattr"),[e.get("place"),"demolished",null],$dict([])),()=>null], ["IsNot"]))?$bin("Add","year ",$call(e.get("str"),[$get(e.get("place"),"demolished")],$dict([]))):"no"),-1,null)),("Population: "+$fmt($call(e.get("len"),[e.get("residents")],$dict([])),-1,null)+"; capital: "+$fmt(($truth($compare([()=>$get(e.get("country"),"capital"),()=>$get(e.get("place"),"id")], ["Eq"]))?"yes":"no"),-1,null)),"Residents:"];e.set("lines",$t1220);}
$call($get(e.get("lines"),"extend"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1221 of $iter($item(e.get("residents"),$slice(null,50,null)))){e.set("p",$t1221);yield $bin("Add","  ",$call(e.get("_person_ref"),[e.get("sim"),$get(e.get("p"),"id")],$dict([])));}})();})(e)],$dict([]));
if($truth($un("Not",e.get("residents")))){$call($get(e.get("lines"),"append"),["  none"],$dict([]));
}else{}
if($truth($compare([()=>$call(e.get("len"),[e.get("residents")],$dict([])),()=>50], ["Gt"]))){$call($get(e.get("lines"),"append"),[("  Showing 50 of "+$fmt($call(e.get("len"),[e.get("residents")],$dict([])),-1,null)+". Use people settlement="+$fmt($call($get(e.get("shlex"),"quote"),[$get(e.get("place"),"name")],$dict([])),-1,null)+" page=N for more.")],$dict([]));
}else{}
$call($get(e.get("lines"),"append"),["Recorded history (name mentions):"],$dict([]));
{const $t1222=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1223 of $iter($get(e.get("sim"),"history"))){{const $t1224=Array.from($iter($t1223));e.set("year",$t1224[0]);e.set("message",$t1224[1]);}if($truth($compare([()=>$call($get($get(e.get("place"),"name"),"casefold"),[],$dict([])),()=>$call($get(e.get("message"),"casefold"),[],$dict([]))], ["In"]))){yield $tuple([e.get("year"),e.get("message")]);}}})();})(e));e.set("events",$t1222);}
$call($get(e.get("lines"),"extend"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1225 of $iter(e.get("events"))){{const $t1226=Array.from($iter($t1225));e.set("year",$t1226[0]);e.set("message",$t1226[1]);}yield ("  Year "+$fmt(e.get("year"),-1,null)+": "+$fmt($call($get(e.get("sim"),"render_history"),[e.get("message")],$dict([])),-1,null));}})();})(e)],$dict([]));
if($truth($un("Not",e.get("events")))){$call($get(e.get("lines"),"append"),["  No events recorded."],$dict([]));
}else{}
return $tuple([$call($get("\n","join"),[e.get("lines")],$dict([])),"inspect"]);}else{}
{const $t1227=1;e.set("page",$t1227);}
{const $t1228=[];e.set("query_parts",$t1228);}
{const $t1229=null;e.set("settlement_id",$t1229);}
{const $t1230=null;e.set("country_id",$t1230);}
for(const $t1231 of $iter(e.get("tokens"))){e.set("token",$t1231);if($truth($call($get($call($get(e.get("token"),"casefold"),[],$dict([])),"startswith"),["page="],$dict([])))){try{{const $t1232=$call(e.get("int"),[$item(e.get("token"),$slice(5,null,null))],$dict([]));e.set("page",$t1232);}
}catch($error){if($isinstance($error,e.get("ValueError"))){throw $call(e.get("ValueError"),["Page must be a positive integer."],$dict([]));}else{throw $error;}}if($truth($compare([()=>e.get("page"),()=>1], ["Lt"]))){throw $call(e.get("ValueError"),["Page must be a positive integer."],$dict([]));}else{}
}else{if($truth($boolop("And",[()=>$call($get($call($get(e.get("token"),"casefold"),[],$dict([])),"startswith"),["settlement="],$dict([])),()=>$compare([()=>e.get("command"),()=>"settlements"], ["NotEq"])]))){{const $t1233=$get($call(e.get("resolve_entity"),[$get(e.get("sim"),"settlements"),$item($call($get(e.get("token"),"split"),["=",1],$dict([])),1),"settlement"],$dict([])),"id");e.set("settlement_id",$t1233);}
}else{if($truth($call($get($call($get(e.get("token"),"casefold"),[],$dict([])),"startswith"),["country="],$dict([])))){{const $t1234=$get($call(e.get("resolve_entity"),[$get(e.get("sim"),"countries"),$item($call($get(e.get("token"),"split"),["=",1],$dict([])),1),"country"],$dict([])),"id");e.set("country_id",$t1234);}
}else{$call($get(e.get("query_parts"),"append"),[e.get("token")],$dict([]));
}
}
}
}
{const $t1235=$call($get($call($get(" ","join"),[e.get("query_parts")],$dict([])),"casefold"),[],$dict([]));e.set("query",$t1235);}
if($truth($compare([()=>e.get("command"),()=>"settlements"], ["Eq"]))){{const $t1236=[];e.set("rows",$t1236);}
for(const $t1237 of $iter($call(e.get("sorted"),[$call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([]))],$dict([["key",$fn("<lambda>",e,["s"],[undefined],null,null,[],[],e=>{return $get(e.get("s"),"id");return null;})]])))){e.set("place",$t1237);if($truth($boolop("And",[()=>$compare([()=>e.get("country_id"),()=>null], ["IsNot"]),()=>$compare([()=>$get(e.get("place"),"country"),()=>e.get("country_id")], ["NotEq"])]))){continue;}else{}
{const $t1238=$item($get(e.get("sim"),"countries"),$get(e.get("place"),"country"));e.set("country",$t1238);}
if($truth($boolop("And",[()=>e.get("query"),()=>$compare([()=>e.get("query"),()=>$call($get($get(e.get("place"),"name"),"casefold"),[],$dict([]))], ["NotIn"]),()=>$compare([()=>e.get("query"),()=>$call($get($get(e.get("country"),"name"),"casefold"),[],$dict([]))], ["NotIn"]),()=>$compare([()=>e.get("query"),()=>new PS([$call(e.get("str"),[$get(e.get("place"),"id")],$dict([])),$bin("Add","#",$call(e.get("str"),[$get(e.get("place"),"id")],$dict([])))])], ["NotIn"])]))){continue;}else{}
{const $t1239=$call(e.get("sum"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1240 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1240);yield $compare([()=>$get(e.get("p"),"settlement"),()=>$get(e.get("place"),"id")], ["Eq"]);}})();})(e)],$dict([]));e.set("population",$t1239);}
$call($get(e.get("rows"),"append"),[$bin("Add",($fmt($get(e.get("place"),"name"),-1,null)+" | "+$fmt($get(e.get("country"),"name"),-1,null)+" | "+$fmt($get(e.get("place"),"kind"),-1,null)+" | population "+$fmt(e.get("population"),-1,null)),($truth($compare([()=>$get(e.get("place"),"abandoned"),()=>null], ["IsNot"]))?" | abandoned":""))],$dict([]));
}
return $tuple([$call(e.get("_directory"),[e.get("rows"),"Settlements",e.get("page")],$dict([])),"inspect"]);}else{}
{const $t1241=[];e.set("rows",$t1241);}
for(const $t1242 of $iter($call(e.get("sorted"),[$call($get($get(e.get("sim"),"archive"),"values"),[],$dict([]))],$dict([["key",$fn("<lambda>",e,["p"],[undefined],null,null,[],[],e=>{return $get(e.get("p"),"id");return null;})]])))){e.set("person",$t1242);if($truth($boolop("And",[()=>$compare([()=>e.get("country_id"),()=>null], ["IsNot"]),()=>$compare([()=>$get(e.get("person"),"country"),()=>e.get("country_id")], ["NotEq"])]))){continue;}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("settlement_id"),()=>null], ["IsNot"]),()=>$compare([()=>$get(e.get("person"),"settlement"),()=>e.get("settlement_id")], ["NotEq"])]))){continue;}else{}
{const $t1243=$call($get(e.get("sim"),"full_name"),[e.get("person")],$dict([]));e.set("name",$t1243);}
if($truth($boolop("And",[()=>e.get("query"),()=>$compare([()=>e.get("query"),()=>$call($get(e.get("name"),"casefold"),[],$dict([]))], ["NotIn"]),()=>$compare([()=>e.get("query"),()=>new PS([$call(e.get("str"),[$get(e.get("person"),"id")],$dict([])),$bin("Add","#",$call(e.get("str"),[$get(e.get("person"),"id")],$dict([])))])], ["NotIn"])]))){continue;}else{}
$call($get(e.get("rows"),"append"),[($fmt(e.get("name"),-1,null)+" | age "+$fmt($get(e.get("person"),"age"),-1,null)+" | "+$fmt(($truth($compare([()=>$get(e.get("person"),"id"),()=>$get(e.get("sim"),"people")], ["In"]))?"living":"deceased"),-1,null))],$dict([]));
}
return $tuple([$call(e.get("_directory"),[e.get("rows"),"People (living and deceased)",e.get("page")],$dict([])),"inspect"]);}catch($error){if($isinstance($error,e.get("ValueError"))){e.set("error",$error);return $tuple([$call(e.get("str"),[e.get("error")],$dict([])),"inspect"]);}else{throw $error;}}return null;}));
});
$register("edit_commands",e=>{e.set("copy",$import("copy"));e.set("math",$import("math"));e.set("shlex",$import("shlex"));e.set("replace",$get($import("dataclasses"),"replace"));e.set("resolve_entity",$get($import("inspection"),"resolve_entity"));{const $t1244="Editing commands (no command advances the year):\nUse names from people/settlements/countries. Quote names containing spaces.\nInclude Roman numerals and the country suffix when needed to distinguish people.\nset person PERSON name|age|wealth|fame|job|lineage|settlement|country VALUE\nset country COUNTRY name|government|economy|food|prosperity|stability|research|treasury|capacity|ruler|quarantine VALUE\nset settlement SETTLEMENT name|country VALUE\nset simulation war_chance|country_chance|lineage_chance|disaster_chance VALUE\nadd person SETTLEMENT [name=Ada age=0 surname=Vale lineage=LINEAGE parent=PERSON]\n  Choose surname OR lineage OR parent; parent may contain two comma-separated names in quotes.\ndelete person PERSON  (records a death; ancestry and the person's archive remain)\nmove person PERSON SETTLEMENT\nadd settlement COUNTRY [name=Newtown founder=PERSON residents=10]\n  Relocates existing residents; default is one adult founder.\ndelete settlement SETTLEMENT to=DESTINATION  (relocates residents; keeps its history)\nadd country SETTLEMENT [name=Newland]  (the settlement secedes)\ndelete country COUNTRY to=DESTINATION  (merges population and territory)\nadd lineage PERSON [surname=Vale]  (found a family branch)\nadd disease NAME [course=acute infection=.35 death=.02 recovery=.85 transmission=contact immunity=8]\nset disease NAME course|infection|death|recovery|transmission|immunity VALUE\ninfect PERSON DISEASE | cure PERSON | outbreak COUNTRY DISEASE [cases=5]\neradicate DISEASE | delete disease NAME  (needs a 100% cure and no current infections; keeps records)\nset disease NAME cure 0-100  (scientists and healers raise cure progress each year)\ngrant COUNTRY DISCOVERY_NAME | revoke COUNTRY DISCOVERY_NAME\n  grant requires prerequisites; revoke also removes dependent discoveries.\ncatalog [QUERY] [page=N] | diseases | wars | changes  (information only)\nwar COUNTRY COUNTRY [force=true] | peace COUNTRY COUNTRY [years=5]\n  force=true explicitly breaks an existing truce.\ntrade science COUNTRY COUNTRY  (each learns part of a discovery the other holds; not during a war)\ntrade pact COUNTRY COUNTRY | trade end COUNTRY COUNTRY  (a standing science pact; war ends it)\ntrigger COUNTRY Famine|Drought|Panic|Health|Calm|Safety|Abundance\ndisaster COUNTRY flood|storm|wildfire|earthquake|landslide|blizzard [severity=minor|major|severe] [at=SETTLEMENT]\n  The disaster is centered on that settlement (default: the country's riskiest) and can reach neighbors.\nbuild SETTLEMENT KIND [force=true] | build SETTLEMENT road to=SETTLEMENT\n  KIND: well granary market school library university observatory clinic hospital aqueduct walls harbor\n  levee firebreak foundations monument theater mine mill. Needs technology unless force=true.\nsettle SETTLEMENT [x=CELL y=CELL] [size=N]  (send settlers to found a new town; they travel for years)\nundo  (restore the most recent edit; unavailable after advancing a year)\nExamples (substitute names from your world):\n  set person \"Mara Vale II of Arden\" wealth 500\n  add person \"River Town\" name=Ada age=25 surname=Vale\nNames are the normal controls. Optional advanced shortcut: ids person Mara looks up numeric IDs.\nEditing is immediate. Natural yearly births/deaths remain separate from editor additions/deaths.";e.set("EDIT_HELP",$t1244);}
{const $t1245=new PS(["set","add","delete","remove","eradicate","move","infect","cure","outbreak","grant","revoke","war","peace","trade","trigger","disaster","build","settle","undo"]);e.set("EDIT_VERBS",$t1245);}
e.set("_number",$fn("_number",e,["value", "low", "high", "integer"],[undefined,0,null,false],null,null,[],[],e=>{try{{const $t1246=($truth(e.get("integer"))?$call(e.get("int"),[e.get("value")],$dict([])):$call(e.get("float"),[e.get("value")],$dict([])));e.set("result",$t1246);}
}catch($error){if($isinstance($error,$tuple([e.get("TypeError"),e.get("ValueError")]))){throw $call(e.get("ValueError"),[$bin("Add",$bin("Add","Expected ",($truth(e.get("integer"))?"an integer":"a number")),(", got "+$fmt(e.get("value"),114,null)+"."))],$dict([]));}else{throw $error;}}if($truth($boolop("Or",[()=>$boolop("And",[()=>$un("Not",e.get("integer")),()=>$un("Not",$call($get(e.get("math"),"isfinite"),[e.get("result")],$dict([])))]),()=>$compare([()=>e.get("result"),()=>e.get("low")], ["Lt"]),()=>$boolop("And",[()=>$compare([()=>e.get("high"),()=>null], ["IsNot"]),()=>$compare([()=>e.get("result"),()=>e.get("high")], ["Gt"])])]))){throw $call(e.get("ValueError"),[("Value must be finite and between "+$fmt(e.get("low"),-1,null)+" and "+$fmt(($truth($compare([()=>e.get("high"),()=>null], ["IsNot"]))?e.get("high"):"no upper limit"),-1,null)+".")],$dict([]));}else{}
return e.get("result");return null;}));
e.set("_name",$fn("_name",e,["value"],[undefined],null,null,[],[],e=>{{const $t1247=$call($get(e.get("value"),"strip"),[],$dict([]));e.set("value",$t1247);}
if($truth($boolop("Or",[()=>$un("Not",$compare([()=>2,()=>$call(e.get("len"),[e.get("value")],$dict([])),()=>80], ["LtE", "LtE"])),()=>$call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1248 of $iter(e.get("value"))){e.set("c",$t1248);yield $boolop("Or",[()=>$compare([()=>$call(e.get("ord"),[e.get("c")],$dict([])),()=>32], ["Lt"]),()=>$compare([()=>e.get("c"),()=>"{}"], ["In"])]);}})();})(e)],$dict([]))]))){throw $call(e.get("ValueError"),["Names must contain 2-80 characters, with no braces or control characters."],$dict([]));}else{}
return e.get("value");return null;}));
e.set("_choice",$fn("_choice",e,["value", "choices"],[undefined,undefined],null,null,[],[],e=>{{const $t1249=$call($get(e.get("value"),"lower"),[],$dict([]));e.set("value",$t1249);}
if($truth($compare([()=>e.get("value"),()=>e.get("choices")], ["NotIn"]))){throw $call(e.get("ValueError"),[$bin("Add",$bin("Add","Choose one of: ",$call($get(", ","join"),[$call(e.get("sorted"),[e.get("choices")],$dict([]))],$dict([]))),".")],$dict([]));}else{}
return e.get("value");return null;}));
e.set("_options",$fn("_options",e,["tokens", "allowed"],[undefined,undefined],null,null,[],[],e=>{{const $t1250=$dict([]);e.set("options",$t1250);}
for(const $t1251 of $iter(e.get("tokens"))){e.set("token",$t1251);{const $t1252=$call($get(e.get("token"),"partition"),["="],$dict([]));{const $t1253=Array.from($iter($t1252));e.set("key",$t1253[0]);e.set("sep",$t1253[1]);e.set("value",$t1253[2]);}}
{const $t1254=$call($get(e.get("key"),"lower"),[],$dict([]));e.set("key",$t1254);}
if($truth($boolop("Or",[()=>$un("Not",e.get("sep")),()=>$un("Not",e.get("value")),()=>$compare([()=>e.get("key"),()=>e.get("allowed")], ["NotIn"]),()=>$compare([()=>e.get("key"),()=>e.get("options")], ["In"])]))){throw $call(e.get("ValueError"),[$bin("Add","Options must be unique key=value entries; allowed: ",$call($get(", ","join"),[$call(e.get("sorted"),[e.get("allowed")],$dict([]))],$dict([])))],$dict([]));}else{}
{const $t1255=e.get("value");$setitem(e.get("options"),e.get("key"),$t1255);}
}
return e.get("options");return null;}));
e.set("_arity",$fn("_arity",e,["tokens", "count", "usage"],[undefined,undefined,undefined],null,null,[],[],e=>{if($truth($compare([()=>$call(e.get("len"),[e.get("tokens")],$dict([])),()=>e.get("count")], ["NotEq"]))){throw $call(e.get("ValueError"),[$bin("Add",$bin("Add","Usage: ",e.get("usage")),". Quote names containing spaces.")],$dict([]));}else{}
return null;}));
e.set("_person",$fn("_person",e,["sim", "query"],[undefined,undefined],null,null,[],[],e=>{return $call(e.get("resolve_entity"),[$get(e.get("sim"),"people"),e.get("query"),"living person",$get(e.get("sim"),"full_name")],$dict([]));return null;}));
e.set("_country",$fn("_country",e,["sim", "query"],[undefined,undefined],null,null,[],[],e=>{return $call(e.get("resolve_entity"),[new PD(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1256 of $iter($call($get($get(e.get("sim"),"countries"),"items"),[],$dict([])))){{const $t1257=Array.from($iter($t1256));e.set("k",$t1257[0]);e.set("c",$t1257[1]);}if($truth($compare([()=>$get(e.get("c"),"ended"),()=>null], ["Is"]))){yield $tuple([e.get("k"),e.get("c")]);}}})();})(e)),e.get("query"),"country"],$dict([]));return null;}));
e.set("_settlement",$fn("_settlement",e,["sim", "query"],[undefined,undefined],null,null,[],[],e=>{return $call(e.get("resolve_entity"),[new PD(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1258 of $iter($call($get($get(e.get("sim"),"settlements"),"items"),[],$dict([])))){{const $t1259=Array.from($iter($t1258));e.set("k",$t1259[0]);e.set("s",$t1259[1]);}if($truth($boolop("And",[()=>$compare([()=>$call(e.get("getattr"),[e.get("s"),"demolished",null],$dict([])),()=>null], ["Is"]),()=>$compare([()=>$get($item($get(e.get("sim"),"countries"),$get(e.get("s"),"country")),"ended"),()=>null], ["Is"])]))){yield $tuple([e.get("k"),e.get("s")]);}}})();})(e)),e.get("query"),"settlement"],$dict([]));return null;}));
e.set("_disease",$fn("_disease",e,["sim", "query"],[undefined,undefined],null,null,[],[],e=>{return $call(e.get("resolve_entity"),[$get(e.get("sim"),"sicknesses"),e.get("query"),"disease"],$dict([]));return null;}));
e.set("_eradication_check",$fn("_eradication_check",e,["sim", "disease"],[undefined,undefined],null,null,[],[],e=>{{const $t1260=$call($get($call(e.get("getattr"),[e.get("sim"),"cure_progress",$dict([])],$dict([])),"get"),[$get(e.get("disease"),"name"),0],$dict([]));e.set("progress",$t1260);}
{const $t1261=$call(e.get("sum"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1262 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1262);yield $compare([()=>$get(e.get("p"),"infection"),()=>$get(e.get("disease"),"name")], ["Eq"]);}})();})(e)],$dict([]));e.set("infected",$t1261);}
{const $t1263=[];e.set("problems",$t1263);}
if($truth($compare([()=>e.get("progress"),()=>100], ["Lt"]))){$call($get(e.get("problems"),"append"),[("the cure is only "+$fmt(e.get("progress"),-1,(".0f"))+"% complete (100% required)")],$dict([]));
}else{}
if($truth(e.get("infected"))){$call($get(e.get("problems"),"append"),[($fmt(e.get("infected"),-1,null)+" "+$fmt(($truth($compare([()=>e.get("infected"),()=>1], ["Eq"]))?"person is":"people are"),-1,null)+" still infected")],$dict([]));
}else{}
if($truth(e.get("problems"))){throw $call(e.get("ValueError"),[$bin("Add",$bin("Add",("Cannot eradicate "+$fmt($get(e.get("disease"),"name"),-1,null)+": "),$call($get(" and ","join"),[e.get("problems")],$dict([]))),".")],$dict([]));}else{}
return null;}));
e.set("_unique_name",$fn("_unique_name",e,["objects", "name", "exclude"],[undefined,undefined,null],null,null,[],[],e=>{{const $t1264=$call(e.get("_name"),[e.get("name")],$dict([]));e.set("name",$t1264);}
if($truth($call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1265 of $iter(e.get("objects"))){e.set("obj",$t1265);yield $boolop("And",[()=>$compare([()=>$call($get($get(e.get("obj"),"name"),"casefold"),[],$dict([])),()=>$call($get(e.get("name"),"casefold"),[],$dict([]))], ["Eq"]),()=>$compare([()=>e.get("obj"),()=>e.get("exclude")], ["IsNot"])]);}})();})(e)],$dict([])))){throw $call(e.get("ValueError"),[("The name "+$fmt(e.get("name"),114,null)+" is already in use.")],$dict([]));}else{}
return e.get("name");return null;}));
e.set("_kill",$fn("_kill",e,["sim", "person", "cause"],[undefined,undefined,undefined],null,null,[],[],e=>{if($truth($compare([()=>$get(e.get("person"),"id"),()=>$get(e.get("sim"),"people")], ["NotIn"]))){throw $call(e.get("ValueError"),["This person is already deceased."],$dict([]));}else{}
{const $t1266=$get(e.get("sim"),"year");$set(e.get("person"),"died",$t1266);}
{const $t1267=e.get("cause");$set(e.get("person"),"cause_of_death",$t1267);}
$set($item($get(e.get("sim"),"lineages"),$get(e.get("person"),"lineage")),"deaths",$aug("Add",$get($item($get(e.get("sim"),"lineages"),$get(e.get("person"),"lineage")),"deaths"),1));$del($get(e.get("sim"),"people"),$get(e.get("person"),"id"));{const $t1268=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1269 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1269);if($truth($compare([()=>$get(e.get("person"),"id"),()=>$get(e.get("p"),"parents")], ["In"]))){yield e.get("p");}}})();})(e));e.set("heirs",$t1268);}
{const $t1270=$call(e.get("getattr"),[e.get("person"),"wealth",0],$dict([]));e.set("fortune",$t1270);}
if($truth(e.get("heirs"))){for(const $t1271 of $iter(e.get("heirs"))){e.set("heir",$t1271);$set(e.get("heir"),"wealth",$aug("Add",$get(e.get("heir"),"wealth"),$bin("Div",e.get("fortune"),$call(e.get("len"),[e.get("heirs")],$dict([])))));}
}else{{const $t1272=$item($get(e.get("sim"),"countries"),$get(e.get("person"),"country"));e.set("country",$t1272);}
while($truth($compare([()=>$call(e.get("getattr"),[e.get("country"),"absorbed_by",null],$dict([])),()=>null], ["IsNot"]))){{const $t1273=$item($get(e.get("sim"),"countries"),$get(e.get("country"),"absorbed_by"));e.set("country",$t1273);}
}
$set(e.get("country"),"treasury",$aug("Add",$get(e.get("country"),"treasury"),e.get("fortune")));}
{const $t1274=0;$set(e.get("person"),"wealth",$t1274);}
{const $t1275=true;$set(e.get("person"),"estate_settled",$t1275);}
return null;}));
e.set("_cure",$fn("_cure",e,["sim", "person", "immunity"],[undefined,undefined,true],null,null,[],[],e=>{e.set("_history",$get($import("epidemiology"),"_history"));if($truth($un("Not",$get(e.get("person"),"infection")))){throw $call(e.get("ValueError"),["This person has no active infection."],$dict([]));}else{}
{const $t1276=$get(e.get("person"),"infection");e.set("name",$t1276);}
{const $t1277=null;$set(e.get("person"),"infection",$t1277);}
{const $t1278=0;$set(e.get("person"),"infection_steps",$t1278);}
if($truth(e.get("immunity"))){$call($get($get(e.get("person"),"immunity"),"add"),[e.get("name")],$dict([]));
{const $t1279=$bin("Add",$get(e.get("sim"),"year"),$get($item($get(e.get("sim"),"sicknesses"),e.get("name")),"immunity_years"));$setitem($get(e.get("person"),"immunity_until"),e.get("name"),$t1279);}
}else{}
$call(e.get("_history"),[e.get("person"),"recovered",e.get("name"),$get(e.get("sim"),"year")],$dict([]));
return null;}));
e.set("_infect",$fn("_infect",e,["sim", "person", "disease"],[undefined,undefined,undefined],null,null,[],[],e=>{e.set("_history",$get($import("epidemiology"),"_history"));if($truth($get(e.get("person"),"infection"))){throw $call(e.get("ValueError"),["This person is already infected; cure them before replacing the infection."],$dict([]));}else{}
$call($get($get(e.get("person"),"immunity"),"discard"),[$get(e.get("disease"),"name")],$dict([]));
$call($get($get(e.get("person"),"immunity_until"),"pop"),[$get(e.get("disease"),"name"),null],$dict([]));
{const $t1280=$get(e.get("disease"),"name");$set(e.get("person"),"infection",$t1280);}
{const $t1281=0;$set(e.get("person"),"infection_steps",$t1281);}
$call(e.get("_history"),[e.get("person"),"infected",$get(e.get("disease"),"name"),$get(e.get("sim"),"year")],$dict([]));
return null;}));
e.set("_reconcile",$fn("_reconcile",e,["sim", "refresh", "elect"],[undefined,true,true],null,null,[],[],e=>{e.set("initialize_civic",$get($import("civic"),"initialize_civic"));e.set("refresh_public_roles",$get($import("civic"),"refresh_public_roles"));e.set("maintain_rulers",$get($import("society"),"maintain_rulers"));$call(e.get("initialize_civic"),[e.get("sim")],$dict([]));
{const $t1282=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1283 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1283);yield $get(e.get("p"),"country");}})();})(e));e.set("occupied",$t1282);}
for(const $t1284 of $iter($call($get($get(e.get("sim"),"countries"),"values"),[],$dict([])))){e.set("c",$t1284);if($truth($compare([()=>$get(e.get("c"),"id"),()=>e.get("occupied")], ["NotIn"]))){{const $t1285=($truth($compare([()=>$get(e.get("c"),"ended"),()=>null], ["Is"]))?$get(e.get("sim"),"year"):$get(e.get("c"),"ended"));$set(e.get("c"),"ended",$t1285);}
{const $t1286=null;$set(e.get("c"),"ruler",$t1286);}
{const $t1287=$dict([]);$set(e.get("c"),"offices",$t1287);}
}else{}
{const $t1288=$call($get($get(e.get("sim"),"people"),"get"),[$get(e.get("c"),"ruler")],$dict([]));e.set("ruler",$t1288);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("ruler"),()=>null], ["Is"]),()=>$compare([()=>$get(e.get("ruler"),"country"),()=>$get(e.get("c"),"id")], ["NotEq"]),()=>$compare([()=>$get(e.get("ruler"),"age"),()=>18], ["Lt"])]))){{const $t1289=null;$set(e.get("c"),"ruler",$t1289);}
}else{}
}
$call($get(e.get("sim"),"update_settlements"),[],$dict([["allow_migration",false]]));
for(const $t1290 of $iter($call(e.get("list"),[$get(e.get("sim"),"wars")],$dict([])))){e.set("pair",$t1290);if($truth($call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1291 of $iter(e.get("pair"))){e.set("cid",$t1291);yield $compare([()=>$get($item($get(e.get("sim"),"countries"),e.get("cid")),"ended"),()=>null], ["IsNot"]);}})();})(e)],$dict([])))){$del($get(e.get("sim"),"wars"),e.get("pair"));$call($get($call(e.get("getattr"),[e.get("sim"),"war_details",$dict([])],$dict([])),"pop"),[e.get("pair"),null],$dict([]));
}else{}
}
if($truth(e.get("refresh"))){if($truth(e.get("elect"))){$call(e.get("maintain_rulers"),[e.get("sim")],$dict([]));
}else{}
$call(e.get("refresh_public_roles"),[e.get("sim")],$dict([["announce",false]]));
}else{}
return null;}));
e.set("_set",$fn("_set",e,["sim", "args"],[undefined,undefined],null,null,[],[],e=>{if($truth($compare([()=>$call(e.get("len"),[e.get("args")],$dict([])),()=>3], ["Lt"]))){throw $call(e.get("ValueError"),["Usage: set TYPE NAME FIELD VALUE; or set simulation FIELD VALUE."],$dict([]));}else{}
{const $t1292=$call($get($item(e.get("args"),0),"lower"),[],$dict([]));e.set("kind",$t1292);}
if($truth($compare([()=>e.get("kind"),()=>"simulation"], ["Eq"]))){$call(e.get("_arity"),[e.get("args"),3,"set simulation FIELD VALUE"],$dict([]));
{const $t1293=$call(e.get("_choice"),[$item(e.get("args"),1),new PS(["war_chance","country_chance","lineage_chance","disaster_chance"])],$dict([]));e.set("field",$t1293);}
$call(e.get("setattr"),[e.get("sim"),e.get("field"),$call(e.get("_number"),[$item(e.get("args"),2),0,1],$dict([]))],$dict([]));
return ("Simulation "+$fmt(e.get("field"),-1,null)+" is now "+$fmt($call(e.get("getattr"),[e.get("sim"),e.get("field")],$dict([])),-1,null)+".");}else{}
$call(e.get("_arity"),[e.get("args"),4,"set TYPE NAME FIELD VALUE"],$dict([]));
{const $t1294=e.get("args");{const $t1295=Array.from($iter($t1294));e.set("_",$t1295[0]);e.set("target",$t1295[1]);e.set("field",$t1295[2]);e.set("value",$t1295[3]);}}
{const $t1296=$call($get(e.get("field"),"lower"),[],$dict([]));e.set("field",$t1296);}
if($truth($compare([()=>e.get("kind"),()=>new PS(["person","individual"])], ["In"]))){{const $t1297=$call(e.get("_person"),[e.get("sim"),e.get("target")],$dict([]));e.set("p",$t1297);}
if($truth($compare([()=>e.get("field"),()=>new PS(["name","first"])], ["In"]))){{const $t1298=$get(e.get("p"),"first");e.set("old",$t1298);}
{const $t1299=$call(e.get("_name"),[e.get("value")],$dict([]));$set(e.get("p"),"first",$t1299);}
for(const $t1300 of $iter($call(e.get("list"),[$call($get($get(e.get("sim"),"name_holders"),"items"),[],$dict([]))],$dict([])))){{const $t1301=Array.from($iter($t1300));e.set("key",$t1301[0]);e.set("holders",$t1301[1]);}if($truth($boolop("And",[()=>$call($get(e.get("key"),"startswith"),[$bin("Add",e.get("old")," ")],$dict([])),()=>$compare([()=>$get(e.get("p"),"id"),()=>e.get("holders")], ["In"])]))){$call($get($call($get($get(e.get("sim"),"name_holders"),"setdefault"),[$bin("Add",$get(e.get("p"),"first"),$item(e.get("key"),$slice($call(e.get("len"),[e.get("old")],$dict([])),null,null))),$call(e.get("set"),[],$dict([]))],$dict([])),"add"),[$get(e.get("p"),"id")],$dict([]));
}else{}
}
$call($get(e.get("sim"),"register_name"),[e.get("p")],$dict([]));
}else{if($truth($compare([()=>e.get("field"),()=>"age"], ["Eq"]))){{const $t1302=$call(e.get("_number"),[e.get("value"),0,150,true],$dict([]));e.set("age",$t1302);}
{const $t1303=$bin("Sub",$get(e.get("sim"),"year"),e.get("age"));e.set("born",$t1303);}
if($truth($call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1304 of $iter($get(e.get("p"),"parents"))){e.set("parent",$t1304);yield $compare([()=>$bin("Add",$get($item($get(e.get("sim"),"archive"),e.get("parent")),"born"),16),()=>e.get("born")], ["Gt"]);}})();})(e)],$dict([])))){throw $call(e.get("ValueError"),["That age would make this person less than 16 years younger than a parent."],$dict([]));}else{}
if($truth($call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1305 of $iter($call($get($get(e.get("sim"),"archive"),"values"),[],$dict([])))){e.set("child",$t1305);if($truth($compare([()=>$get(e.get("p"),"id"),()=>$get(e.get("child"),"parents")], ["In"]))){yield $compare([()=>$get(e.get("child"),"born"),()=>$bin("Add",e.get("born"),16)], ["Lt"]);}}})();})(e)],$dict([])))){throw $call(e.get("ValueError"),["That age would make this person less than 16 years older than a child."],$dict([]));}else{}
{const $t1306=e.get("age");$set(e.get("p"),"age",$t1306);}
{const $t1307=$bin("Sub",$get(e.get("sim"),"year"),$get(e.get("p"),"age"));$set(e.get("p"),"born",$t1307);}
if($truth($compare([()=>$get(e.get("p"),"age"),()=>18], ["Lt"]))){{const $t1308="child";$set(e.get("p"),"job",$t1308);}
}else{if($truth($compare([()=>$get(e.get("p"),"job"),()=>"child"], ["Eq"]))){{const $t1309="laborer";$set(e.get("p"),"job",$t1309);}
}else{}
}
{const $t1310=($truth($compare([()=>$get(e.get("p"),"age"),()=>18], ["Lt"]))?"":$get(e.get("p"),"public_role"));$set(e.get("p"),"public_role",$t1310);}
}else{if($truth($compare([()=>e.get("field"),()=>new PS(["wealth","fame"])], ["In"]))){$call(e.get("setattr"),[e.get("p"),e.get("field"),$call(e.get("_number"),[e.get("value"),0,($truth($compare([()=>e.get("field"),()=>"fame"], ["Eq"]))?100:1000000000000.0)],$dict([]))],$dict([]));
}else{if($truth($compare([()=>e.get("field"),()=>"job"], ["Eq"]))){e.set("PAY",$get($import("civic"),"PAY"));{const $t1311=$call(e.get("_choice"),[e.get("value"),$bin("BitOr",$call(e.get("set"),[e.get("PAY")],$dict([])),new PS(["child"]))],$dict([]));e.set("job",$t1311);}
if($truth($compare([()=>$compare([()=>$get(e.get("p"),"age"),()=>18], ["Lt"]),()=>$compare([()=>e.get("job"),()=>"child"], ["Eq"])], ["NotEq"]))){throw $call(e.get("ValueError"),["Children use job=child; adults need an adult occupation."],$dict([]));}else{}
{const $t1312=e.get("job");$set(e.get("p"),"job",$t1312);}
}else{if($truth($compare([()=>e.get("field"),()=>"lineage"], ["Eq"]))){{const $t1313=$call(e.get("resolve_entity"),[$get(e.get("sim"),"lineages"),e.get("value"),"lineage",$fn("<lambda>",e,["l"],[undefined],null,null,[],[],e=>{return $call($get(e.get("sim"),"lineage_name"),[$get(e.get("l"),"id")],$dict([]));return null;})],$dict([]));e.set("lineage",$t1313);}
{const $t1314=$get(e.get("lineage"),"id");$set(e.get("p"),"lineage",$t1314);}
$call($get(e.get("sim"),"register_name"),[e.get("p")],$dict([]));
}else{if($truth($compare([()=>e.get("field"),()=>new PS(["settlement","country"])], ["In"]))){{const $t1315=($truth($compare([()=>e.get("field"),()=>"settlement"], ["Eq"]))?$call(e.get("_settlement"),[e.get("sim"),e.get("value")],$dict([])):$item($get(e.get("sim"),"settlements"),$get($call(e.get("_country"),[e.get("sim"),e.get("value")],$dict([])),"capital")));e.set("place",$t1315);}
{const $t1316=$tuple([$get(e.get("place"),"id"),$get(e.get("place"),"country")]);{const $t1317=Array.from($iter($t1316));$set(e.get("p"),"settlement",$t1317[0]);$set(e.get("p"),"country",$t1317[1]);}}
}else{throw $call(e.get("ValueError"),["Person fields: name, age, wealth, fame, job, lineage, settlement, country."],$dict([]));}
}
}
}
}
}
return ($fmt($call($get(e.get("sim"),"full_name"),[e.get("p")],$dict([])),-1,null)+": "+$fmt(e.get("field"),-1,null)+" set to "+$fmt(e.get("value"),-1,null)+".");}else{}
if($truth($compare([()=>e.get("kind"),()=>"country"], ["Eq"]))){{const $t1318=$call(e.get("_country"),[e.get("sim"),e.get("target")],$dict([]));e.set("c",$t1318);}
if($truth($compare([()=>e.get("field"),()=>"name"], ["Eq"]))){{const $t1319=$call(e.get("_unique_name"),[$call($get($get(e.get("sim"),"countries"),"values"),[],$dict([])),e.get("value"),e.get("c")],$dict([]));$set(e.get("c"),"name",$t1319);}
$call($get($get($get(e.get("sim"),"names"),"used_countries"),"add"),[$get(e.get("c"),"name")],$dict([]));
}else{if($truth($compare([()=>e.get("field"),()=>new PS(["food","prosperity","stability"])], ["In"]))){$call(e.get("setattr"),[e.get("c"),e.get("field"),$call(e.get("_number"),[e.get("value"),0,100],$dict([]))],$dict([]));
}else{if($truth($compare([()=>e.get("field"),()=>new PS(["research","treasury"])], ["In"]))){$call(e.get("setattr"),[e.get("c"),e.get("field"),$call(e.get("_number"),[e.get("value"),0,1000000000000.0],$dict([]))],$dict([]));
}else{if($truth($compare([()=>e.get("field"),()=>"capacity"], ["Eq"]))){{const $t1320=$call(e.get("_number"),[e.get("value"),1,1000000000,true],$dict([]));$set(e.get("c"),"capacity",$t1320);}
{const $t1321=true;$set(e.get("c"),"capacity_manual",$t1321);}
}else{if($truth($compare([()=>e.get("field"),()=>"government"], ["Eq"]))){e.set("GOVERNMENTS",$get($import("governments"),"GOVERNMENTS"));{const $t1322=$call(e.get("_choice"),[e.get("value"),$call(e.get("set"),[e.get("GOVERNMENTS")],$dict([]))],$dict([]));$set(e.get("c"),"government",$t1322);}
{const $t1323=$get(e.get("sim"),"year");$set(e.get("c"),"government_since",$t1323);}
{const $t1324=$get(e.get("sim"),"year");$set(e.get("c"),"last_election",$t1324);}
}else{if($truth($compare([()=>e.get("field"),()=>new PS(["economy","economic_system"])], ["In"]))){e.set("SYSTEMS",$get($import("civic"),"SYSTEMS"));{const $t1325=$call(e.get("_choice"),[e.get("value"),e.get("SYSTEMS")],$dict([]));$set(e.get("c"),"economic_system",$t1325);}
{const $t1326=$get(e.get("sim"),"year");$set(e.get("c"),"economic_since",$t1326);}
}else{if($truth($compare([()=>e.get("field"),()=>"ruler"], ["Eq"]))){{const $t1327=($truth($compare([()=>$call($get(e.get("value"),"lower"),[],$dict([])),()=>"none"], ["Eq"]))?null:$call(e.get("_person"),[e.get("sim"),e.get("value")],$dict([])));e.set("p",$t1327);}
if($truth($boolop("And",[()=>e.get("p"),()=>$boolop("Or",[()=>$compare([()=>$get(e.get("p"),"country"),()=>$get(e.get("c"),"id")], ["NotEq"]),()=>$compare([()=>$get(e.get("p"),"age"),()=>18], ["Lt"])])]))){throw $call(e.get("ValueError"),["A ruler must be a living adult in this country."],$dict([]));}else{}
{const $t1328=($truth(e.get("p"))?$get(e.get("p"),"id"):null);$set(e.get("c"),"ruler",$t1328);}
{const $t1329=$get(e.get("sim"),"year");$set(e.get("c"),"last_election",$t1329);}
}else{if($truth($compare([()=>e.get("field"),()=>"quarantine"], ["Eq"]))){{const $t1330=$compare([()=>$call(e.get("_choice"),[e.get("value"),new PS(["true","false","on","off"])],$dict([])),()=>new PS(["true","on"])], ["In"]);$set(e.get("c"),"quarantine",$t1330);}
}else{throw $call(e.get("ValueError"),["Unknown country field. Type help edit for supported fields."],$dict([]));}
}
}
}
}
}
}
}
return ($fmt($get(e.get("c"),"name"),-1,null)+": "+$fmt(e.get("field"),-1,null)+" set to "+$fmt(e.get("value"),-1,null)+".");}else{}
if($truth($compare([()=>e.get("kind"),()=>"settlement"], ["Eq"]))){{const $t1331=$call(e.get("_settlement"),[e.get("sim"),e.get("target")],$dict([]));e.set("s",$t1331);}
if($truth($compare([()=>e.get("field"),()=>"name"], ["Eq"]))){{const $t1332=$call(e.get("_unique_name"),[$call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([])),e.get("value"),e.get("s")],$dict([]));$set(e.get("s"),"name",$t1332);}
}else{if($truth($compare([()=>e.get("field"),()=>"country"], ["Eq"]))){e.set("_transfer",$get($import("warfare"),"_transfer"));{const $t1333=$call(e.get("_country"),[e.get("sim"),e.get("value")],$dict([]));e.set("c",$t1333);}
if($truth($compare([()=>$get(e.get("c"),"id"),()=>$get(e.get("s"),"country")], ["Eq"]))){throw $call(e.get("ValueError"),["This settlement already belongs to that country."],$dict([]));}else{}
{const $t1334=$call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1335 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1335);yield $boolop("And",[()=>$compare([()=>$get(e.get("p"),"country"),()=>$get(e.get("s"),"country")], ["Eq"]),()=>$compare([()=>$get(e.get("p"),"settlement"),()=>$get(e.get("s"),"id")], ["NotEq"])]);}})();})(e)],$dict([]));e.set("residents_elsewhere",$t1334);}
$call(e.get("_transfer"),[e.get("sim"),$get(e.get("c"),"id"),$get(e.get("s"),"country"),($truth(e.get("residents_elsewhere"))?e.get("s"):null)],$dict([]));
}else{throw $call(e.get("ValueError"),["Settlement fields: name, country. Village/town/city status follows population."],$dict([]));}
}
return ($fmt($get(e.get("s"),"name"),-1,null)+": "+$fmt(e.get("field"),-1,null)+" set to "+$fmt(e.get("value"),-1,null)+".");}else{}
if($truth($compare([()=>e.get("kind"),()=>"disease"], ["Eq"]))){{const $t1336=$call(e.get("_disease"),[e.get("sim"),e.get("target")],$dict([]));e.set("disease",$t1336);}
{const $t1337=$dict([["infection","infection_chance"],["death","death_chance"],["recovery","recovery_chance"]]);e.set("fields",$t1337);}
if($truth($compare([()=>e.get("field"),()=>"cure"], ["Eq"]))){e.set("cure_progress",$get($import("epidemiology"),"cure_progress"));{const $t1338=$call(e.get("_number"),[e.get("value"),0,100],$dict([]));$setitem($call(e.get("cure_progress"),[e.get("sim")],$dict([])),$get(e.get("disease"),"name"),$t1338);}
return ("Disease "+$fmt($get(e.get("disease"),"name"),-1,null)+": cure progress set to "+$fmt(e.get("value"),-1,null)+"%.");}else{}
if($truth($compare([()=>e.get("field"),()=>e.get("fields")], ["In"]))){{const $t1339=$dict([[$item(e.get("fields"),e.get("field")),$call(e.get("_number"),[e.get("value"),0,1],$dict([]))]]);e.set("changes",$t1339);}
}else{if($truth($compare([()=>e.get("field"),()=>"immunity"], ["Eq"]))){{const $t1340=$dict([["immunity_years",$call(e.get("_number"),[e.get("value"),1,100,true],$dict([]))]]);e.set("changes",$t1340);}
}else{if($truth($compare([()=>e.get("field"),()=>"course"], ["Eq"]))){{const $t1341=$call(e.get("_choice"),[e.get("value"),new PS(["acute","chronic","endemic"])],$dict([]));e.set("course",$t1341);}
{const $t1342=$dict([["course",e.get("course")],["recurring",$compare([()=>e.get("course"),()=>"endemic"], ["Eq"])]]);e.set("changes",$t1342);}
}else{if($truth($compare([()=>e.get("field"),()=>"transmission"], ["Eq"]))){{const $t1343=$dict([["transmission",$call(e.get("_choice"),[e.get("value"),new PS(["contact","respiratory","waterborne"])],$dict([]))]]);e.set("changes",$t1343);}
}else{throw $call(e.get("ValueError"),["Disease fields: infection, death, recovery, immunity, course, transmission, cure."],$dict([]));}
}
}
}
{const $t1344=$call(e.get("replace"),[e.get("disease")],$dict([...$entries(e.get("changes"))]));$setitem($get(e.get("sim"),"sicknesses"),$get(e.get("disease"),"name"),$t1344);}
$call($get($call(e.get("getattr"),[e.get("sim"),"disease_profiles",$dict([])],$dict([])),"pop"),[$get(e.get("disease"),"name"),null],$dict([]));
return ("Disease "+$fmt($get(e.get("disease"),"name"),-1,null)+": "+$fmt(e.get("field"),-1,null)+" set to "+$fmt(e.get("value"),-1,null)+".");}else{}
throw $call(e.get("ValueError"),["Editable types: person, country, settlement, disease, simulation."],$dict([]));return null;}));
e.set("_add",$fn("_add",e,["sim", "args"],[undefined,undefined],null,null,[],[],e=>{if($truth($compare([()=>$call(e.get("len"),[e.get("args")],$dict([])),()=>2], ["Lt"]))){throw $call(e.get("ValueError"),["Usage: add TYPE TARGET [key=value ...]. Type help edit."],$dict([]));}else{}
{const $t1345=$tuple([$call($get($item(e.get("args"),0),"lower"),[],$dict([])),$item(e.get("args"),1)]);{const $t1346=Array.from($iter($t1345));e.set("kind",$t1346[0]);e.set("target",$t1346[1]);}}
if($truth($compare([()=>e.get("kind"),()=>new PS(["person","individual"])], ["In"]))){e.set("initialize_civic",$get($import("civic"),"initialize_civic"));{const $t1347=$call(e.get("_settlement"),[e.get("sim"),e.get("target")],$dict([]));e.set("place",$t1347);}
{const $t1348=$call(e.get("_options"),[$item(e.get("args"),$slice(2,null,null)),new PS(["name","age","surname","lineage","parent"])],$dict([]));e.set("options",$t1348);}
{const $t1349=$call(e.get("_number"),[$call($get(e.get("options"),"get"),["age","0"],$dict([])),0,150,true],$dict([]));e.set("age",$t1349);}
{const $t1350=($truth($compare([()=>"name",()=>e.get("options")], ["In"]))?$call(e.get("_name"),[$item(e.get("options"),"name")],$dict([])):null);e.set("first",$t1350);}
if($truth($compare([()=>$call(e.get("sum"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1351 of $iter($tuple(["surname","lineage","parent"]))){e.set("k",$t1351);yield $compare([()=>e.get("k"),()=>e.get("options")], ["In"]);}})();})(e)],$dict([])),()=>1], ["Gt"]))){throw $call(e.get("ValueError"),["Choose only one of surname, lineage, or parent."],$dict([]));}else{}
{const $t1352=$call(e.get("tuple"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1353 of $iter($call($get($call($get(e.get("options"),"get"),["parent",""],$dict([])),"split"),[","],$dict([])))){e.set("q",$t1353);if($truth(e.get("q"))){yield $call(e.get("_person"),[e.get("sim"),e.get("q")],$dict([]));}}})();})(e)],$dict([]));e.set("parents",$t1352);}
if($truth($boolop("Or",[()=>$compare([()=>$call(e.get("len"),[e.get("parents")],$dict([])),()=>2], ["Gt"]),()=>$compare([()=>$call(e.get("len"),[new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1354 of $iter(e.get("parents"))){e.set("p",$t1354);yield $get(e.get("p"),"id");}})();})(e))],$dict([])),()=>$call(e.get("len"),[e.get("parents")],$dict([]))], ["NotEq"])]))){throw $call(e.get("ValueError"),["Use one or two distinct parents."],$dict([]));}else{}
if($truth($call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1355 of $iter(e.get("parents"))){e.set("p",$t1355);yield $boolop("Or",[()=>$compare([()=>$get(e.get("p"),"age"),()=>18], ["Lt"]),()=>$compare([()=>$bin("Sub",$get(e.get("p"),"age"),e.get("age")),()=>16], ["Lt"])]);}})();})(e)],$dict([])))){throw $call(e.get("ValueError"),["Parents must be adults and at least 16 years older than the child."],$dict([]));}else{}
if($truth(e.get("parents"))){{const $t1356=$get($item(e.get("parents"),0),"lineage");e.set("lid",$t1356);}
}else{if($truth($compare([()=>"lineage",()=>e.get("options")], ["In"]))){{const $t1357=$get($call(e.get("resolve_entity"),[$get(e.get("sim"),"lineages"),$item(e.get("options"),"lineage"),"lineage",$fn("<lambda>",e,["l"],[undefined],null,null,[],[],e=>{return $call($get(e.get("sim"),"lineage_name"),[$get(e.get("l"),"id")],$dict([]));return null;})],$dict([])),"id");e.set("lid",$t1357);}
}else{{const $t1358=($truth($compare([()=>"surname",()=>e.get("options")], ["In"]))?$call(e.get("_name"),[$item(e.get("options"),"surname")],$dict([])):null);e.set("surname",$t1358);}
{const $t1359=$call($get(e.get("sim"),"new_lineage"),[$get(e.get("sim"),"next_person")],$dict([]));e.set("lid",$t1359);}
{const $t1360=$get(e.get("place"),"country");$set($item($get(e.get("sim"),"lineages"),e.get("lid")),"founder_country",$t1360);}
if($truth(e.get("surname"))){{const $t1361=e.get("surname");$set($item($get(e.get("sim"),"lineages"),e.get("lid")),"surname",$t1361);}
}else{}
}
}
{const $t1362=$call($get(e.get("sim"),"add_person"),[e.get("age"),e.get("lid"),$get(e.get("place"),"country"),$call(e.get("tuple"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1363 of $iter(e.get("parents"))){e.set("p",$t1363);yield $get(e.get("p"),"id");}})();})(e)],$dict([]))],$dict([]));e.set("person",$t1362);}
{const $t1364=$get(e.get("place"),"id");$set(e.get("person"),"settlement",$t1364);}
if($truth(e.get("first"))){{const $t1365=($fmt($get(e.get("person"),"first"),-1,null)+" "+$fmt($get($item($get(e.get("sim"),"lineages"),e.get("lid")),"surname"),-1,null));e.set("generated",$t1365);}
$call($get($item($get(e.get("sim"),"name_holders"),e.get("generated")),"discard"),[$get(e.get("person"),"id")],$dict([]));
{const $t1366=e.get("first");$set(e.get("person"),"first",$t1366);}
$call($get(e.get("sim"),"register_name"),[e.get("person")],$dict([]));
}else{}
$call(e.get("initialize_civic"),[e.get("sim")],$dict([]));
return ("Added "+$fmt($call($get(e.get("sim"),"full_name"),[e.get("person")],$dict([])),-1,null)+", age "+$fmt(e.get("age"),-1,null)+", to "+$fmt($get(e.get("place"),"name"),-1,null)+".");}else{}
if($truth($compare([()=>e.get("kind"),()=>"settlement"], ["Eq"]))){{const $t1367=$call(e.get("_country"),[e.get("sim"),e.get("target")],$dict([]));e.set("c",$t1367);}
{const $t1368=$call(e.get("_options"),[$item(e.get("args"),$slice(2,null,null)),new PS(["name","founder","residents"])],$dict([]));e.set("options",$t1368);}
{const $t1369=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1370 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1370);if($truth($compare([()=>$get(e.get("p"),"country"),()=>$get(e.get("c"),"id")], ["Eq"]))){yield e.get("p");}}})();})(e));e.set("residents",$t1369);}
{const $t1371=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1372 of $iter(e.get("residents"))){e.set("p",$t1372);if($truth($compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"]))){yield e.get("p");}}})();})(e));e.set("adults",$t1371);}
if($truth($un("Not",e.get("adults")))){throw $call(e.get("ValueError"),["A settlement needs an adult founder in its country."],$dict([]));}else{}
{const $t1373=($truth($compare([()=>"founder",()=>e.get("options")], ["In"]))?$call(e.get("_person"),[e.get("sim"),$item(e.get("options"),"founder")],$dict([])):$call(e.get("max"),[e.get("adults")],$dict([["key",$fn("<lambda>",e,["p"],[undefined],null,null,[],[],e=>{return $get(e.get("p"),"age");return null;})]])));e.set("founder",$t1373);}
if($truth($boolop("Or",[()=>$compare([()=>$get(e.get("founder"),"country"),()=>$get(e.get("c"),"id")], ["NotEq"]),()=>$compare([()=>$get(e.get("founder"),"age"),()=>18], ["Lt"])]))){throw $call(e.get("ValueError"),["The founder must be an adult in this country."],$dict([]));}else{}
{const $t1374=$call(e.get("_number"),[$call($get(e.get("options"),"get"),["residents","1"],$dict([])),1,$call(e.get("len"),[e.get("residents")],$dict([])),true],$dict([]));e.set("count",$t1374);}
{const $t1375=($truth($compare([()=>"name",()=>e.get("options")], ["In"]))?$call(e.get("_unique_name"),[$call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([])),$item(e.get("options"),"name")],$dict([])):null);e.set("name",$t1375);}
{const $t1376=$bin("Add",[e.get("founder")],$call($get($get(e.get("sim"),"rng"),"sample"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1377 of $iter(e.get("residents"))){e.set("p",$t1377);if($truth($compare([()=>$get(e.get("p"),"id"),()=>$get(e.get("founder"),"id")], ["NotEq"]))){yield e.get("p");}}})();})(e)),$bin("Sub",e.get("count"),1)],$dict([])));e.set("selected",$t1376);}
{const $t1378=$call($get(e.get("sim"),"found_settlement"),[$get(e.get("c"),"id"),e.get("founder"),e.get("selected")],$dict([["name",e.get("name")]]));e.set("place",$t1378);}
return ("Founded "+$fmt($get(e.get("place"),"name"),-1,null)+" with "+$fmt(e.get("count"),-1,null)+" relocated residents.");}else{}
if($truth($compare([()=>e.get("kind"),()=>"country"], ["Eq"]))){e.set("Country",$get($import("civsim"),"Country"));e.set("_transfer",$get($import("warfare"),"_transfer"));{const $t1379=$call(e.get("_settlement"),[e.get("sim"),e.get("target")],$dict([]));e.set("place",$t1379);}
{const $t1380=$call(e.get("_options"),[$item(e.get("args"),$slice(2,null,null)),new PS(["name"])],$dict([]));e.set("options",$t1380);}
{const $t1381=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1382 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1382);if($truth($compare([()=>$get(e.get("p"),"settlement"),()=>$get(e.get("place"),"id")], ["Eq"]))){yield e.get("p");}}})();})(e));e.set("residents",$t1381);}
{const $t1383=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1384 of $iter(e.get("residents"))){e.set("p",$t1384);if($truth($compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"]))){yield e.get("p");}}})();})(e));e.set("adults",$t1383);}
if($truth($un("Not",e.get("adults")))){throw $call(e.get("ValueError"),["A new country needs an inhabited settlement with an adult founder."],$dict([]));}else{}
{const $t1385=$call(e.get("max"),[e.get("adults")],$dict([["key",$fn("<lambda>",e,["p"],[undefined],null,null,[],[],e=>{return $get(e.get("p"),"age");return null;})]]));e.set("founder",$t1385);}
{const $t1386=($truth($compare([()=>"name",()=>e.get("options")], ["In"]))?$call(e.get("_unique_name"),[$call($get($get(e.get("sim"),"countries"),"values"),[],$dict([])),$item(e.get("options"),"name")],$dict([])):$call($get(e.get("sim"),"founder_country_name"),[e.get("founder")],$dict([])));e.set("name",$t1386);}
{const $t1387=$item($get(e.get("sim"),"countries"),$get(e.get("place"),"country"));e.set("parent",$t1387);}
{const $t1388=$bin("Add",$call(e.get("max"),[$get(e.get("sim"),"countries")],$dict([["default",0]])),1);e.set("cid",$t1388);}
{const $t1389=$call(e.get("Country"),[e.get("cid"),e.get("name"),$get(e.get("founder"),"id"),$get(e.get("sim"),"year"),$get(e.get("parent"),"id")],$dict([["capacity",$get(e.get("parent"),"capacity")]]));e.set("c",$t1389);}
{const $t1390=$get(e.get("founder"),"id");$set(e.get("c"),"ruler",$t1390);}
{const $t1391=$get(e.get("parent"),"government");$set(e.get("c"),"government",$t1391);}
{const $t1392=$get(e.get("sim"),"year");$set(e.get("c"),"last_election",$t1392);}
{const $t1393=$call(e.get("set"),[$get(e.get("parent"),"technologies")],$dict([]));$set(e.get("c"),"technologies",$t1393);}
{const $t1394=$call(e.get("dict"),[$call(e.get("getattr"),[e.get("parent"),"innovations",$dict([])],$dict([]))],$dict([]));$set(e.get("c"),"innovations",$t1394);}
{const $t1395=e.get("c");$setitem($get(e.get("sim"),"countries"),e.get("cid"),$t1395);}
$call($get($get($get(e.get("sim"),"names"),"used_countries"),"add"),[e.get("name")],$dict([]));
$call(e.get("_transfer"),[e.get("sim"),e.get("cid"),$get(e.get("parent"),"id"),e.get("place")],$dict([]));
return ($fmt($get(e.get("place"),"name"),-1,null)+" seceded to form "+$fmt(e.get("name"),-1,null)+", with "+$fmt($call(e.get("len"),[e.get("residents")],$dict([])),-1,null)+" residents.");}else{}
if($truth($compare([()=>e.get("kind"),()=>"lineage"], ["Eq"]))){{const $t1396=$call(e.get("_person"),[e.get("sim"),e.get("target")],$dict([]));e.set("p",$t1396);}
if($truth($compare([()=>$get(e.get("p"),"age"),()=>18], ["Lt"]))){throw $call(e.get("ValueError"),["A lineage founder must be an adult."],$dict([]));}else{}
{const $t1397=$call(e.get("_options"),[$item(e.get("args"),$slice(2,null,null)),new PS(["surname"])],$dict([]));e.set("options",$t1397);}
{const $t1398=($truth($compare([()=>"surname",()=>e.get("options")], ["In"]))?$call(e.get("_name"),[$item(e.get("options"),"surname")],$dict([])):null);e.set("surname",$t1398);}
{const $t1399=$call($get(e.get("sim"),"new_lineage"),[$get(e.get("p"),"id"),$get(e.get("p"),"lineage")],$dict([]));e.set("lid",$t1399);}
if($truth(e.get("surname"))){{const $t1400=e.get("surname");$set($item($get(e.get("sim"),"lineages"),e.get("lid")),"surname",$t1400);}
}else{}
{const $t1401=e.get("lid");$set(e.get("p"),"lineage",$t1401);}
$call($get(e.get("sim"),"register_name"),[e.get("p")],$dict([]));
return ($fmt($call($get(e.get("sim"),"full_name"),[e.get("p")],$dict([])),-1,null)+" founded lineage "+$fmt($call($get(e.get("sim"),"lineage_name"),[e.get("lid")],$dict([])),-1,null)+"; existing relatives retain their lineages.");}else{}
if($truth($compare([()=>e.get("kind"),()=>"disease"], ["Eq"]))){e.set("Sickness",$get($import("civsim"),"Sickness"));{const $t1402=$call(e.get("_options"),[$item(e.get("args"),$slice(2,null,null)),new PS(["course","infection","death","recovery","transmission","immunity"])],$dict([]));e.set("options",$t1402);}
{const $t1403=$bin("Add",$call(e.get("list"),[$call($get($get(e.get("sim"),"sicknesses"),"values"),[],$dict([]))],$dict([])),$call(e.get("list"),[$call($get($call(e.get("getattr"),[e.get("sim"),"retired_sicknesses",$dict([])],$dict([])),"values"),[],$dict([]))],$dict([])));e.set("all_diseases",$t1403);}
{const $t1404=$call(e.get("_unique_name"),[e.get("all_diseases"),e.get("target")],$dict([]));e.set("name",$t1404);}
{const $t1405=$call(e.get("_choice"),[$call($get(e.get("options"),"get"),["course","acute"],$dict([])),new PS(["acute","chronic","endemic"])],$dict([]));e.set("course",$t1405);}
{const $t1406=$call(e.get("Sickness"),[e.get("name"),$call(e.get("_number"),[$call($get(e.get("options"),"get"),["infection",".35"],$dict([])),0,1],$dict([])),$call(e.get("_number"),[$call($get(e.get("options"),"get"),["death",($truth($compare([()=>e.get("course"),()=>"endemic"], ["Eq"]))?".001":".02")],$dict([])),0,1],$dict([])),$call(e.get("_number"),[$call($get(e.get("options"),"get"),["recovery",($truth($compare([()=>e.get("course"),()=>"chronic"], ["Eq"]))?".15":".85")],$dict([])),0,1],$dict([]))],$dict([["transmission",$call(e.get("_choice"),[$call($get(e.get("options"),"get"),["transmission","contact"],$dict([])),new PS(["contact","respiratory","waterborne"])],$dict([]))],["incubation_steps",1],["immunity_years",$call(e.get("_number"),[$call($get(e.get("options"),"get"),["immunity",($truth($compare([()=>e.get("course"),()=>"endemic"], ["Eq"]))?"1":"8")],$dict([])),1,100,true],$dict([]))],["course",e.get("course")],["recurring",$compare([()=>e.get("course"),()=>"endemic"], ["Eq"])]]));e.set("disease",$t1406);}
{const $t1407=e.get("disease");$setitem($get(e.get("sim"),"sicknesses"),e.get("name"),$t1407);}
return ("Added "+$fmt(e.get("course"),-1,null)+" disease "+$fmt(e.get("name"),-1,null)+". Use infect or outbreak to introduce it.");}else{}
throw $call(e.get("ValueError"),["Add types: person, settlement, country, lineage, disease."],$dict([]));return null;}));
e.set("_delete",$fn("_delete",e,["sim", "args"],[undefined,undefined],null,null,[],[],e=>{if($truth($compare([()=>$call(e.get("len"),[e.get("args")],$dict([])),()=>2], ["Lt"]))){throw $call(e.get("ValueError"),["Usage: delete person NAME; delete settlement/country NAME to=DESTINATION; delete disease NAME."],$dict([]));}else{}
{const $t1408=$tuple([$call($get($item(e.get("args"),0),"lower"),[],$dict([])),$item(e.get("args"),1)]);{const $t1409=Array.from($iter($t1408));e.set("kind",$t1409[0]);e.set("target",$t1409[1]);}}
if($truth($compare([()=>e.get("kind"),()=>new PS(["person","individual"])], ["In"]))){$call(e.get("_arity"),[e.get("args"),2,"delete person NAME"],$dict([]));
{const $t1410=$call(e.get("_person"),[e.get("sim"),e.get("target")],$dict([]));e.set("p",$t1410);}
$call(e.get("_kill"),[e.get("sim"),e.get("p"),"editor intervention"],$dict([]));
return ($fmt($call($get(e.get("sim"),"full_name"),[e.get("p")],$dict([])),-1,null)+" died; their history and ancestry remain in the archive.");}else{}
if($truth($compare([()=>e.get("kind"),()=>new PS(["settlement","country"])], ["In"]))){{const $t1411=$call(e.get("_options"),[$item(e.get("args"),$slice(2,null,null)),new PS(["to"])],$dict([]));e.set("options",$t1411);}
if($truth($compare([()=>e.get("kind"),()=>"country"], ["Eq"]))){e.set("_transfer",$get($import("warfare"),"_transfer"));{const $t1412=$call(e.get("_country"),[e.get("sim"),e.get("target")],$dict([]));e.set("source",$t1412);}
if($truth($compare([()=>"to",()=>e.get("options")], ["NotIn"]))){throw $call(e.get("ValueError"),["Deleting a country requires to=COUNTRY to receive its residents and territory."],$dict([]));}else{}
{const $t1413=$call(e.get("_country"),[e.get("sim"),$item(e.get("options"),"to")],$dict([]));e.set("destination",$t1413);}
if($truth($compare([()=>$get(e.get("source"),"id"),()=>$get(e.get("destination"),"id")], ["Eq"]))){throw $call(e.get("ValueError"),["Choose a different receiving country."],$dict([]));}else{}
$call(e.get("_transfer"),[e.get("sim"),$get(e.get("destination"),"id"),$get(e.get("source"),"id")],$dict([]));
return ($fmt($get(e.get("source"),"name"),-1,null)+" merged into "+$fmt($get(e.get("destination"),"name"),-1,null)+"; its people, settlements and knowledge were transferred.");}else{}
{const $t1414=$call(e.get("_settlement"),[e.get("sim"),e.get("target")],$dict([]));e.set("source",$t1414);}
{const $t1415=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1416 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1416);if($truth($compare([()=>$get(e.get("p"),"settlement"),()=>$get(e.get("source"),"id")], ["Eq"]))){yield e.get("p");}}})();})(e));e.set("residents",$t1415);}
if($truth($boolop("And",[()=>e.get("residents"),()=>$compare([()=>"to",()=>e.get("options")], ["NotIn"])]))){throw $call(e.get("ValueError"),["This settlement is inhabited. Supply to=SETTLEMENT to relocate its residents."],$dict([]));}else{}
if($truth($compare([()=>"to",()=>e.get("options")], ["In"]))){{const $t1417=$call(e.get("_settlement"),[e.get("sim"),$item(e.get("options"),"to")],$dict([]));e.set("destination",$t1417);}
if($truth($compare([()=>$get(e.get("source"),"id"),()=>$get(e.get("destination"),"id")], ["Eq"]))){throw $call(e.get("ValueError"),["Choose a different receiving settlement."],$dict([]));}else{}
for(const $t1418 of $iter(e.get("residents"))){e.set("p",$t1418);{const $t1419=$tuple([$get(e.get("destination"),"country"),$get(e.get("destination"),"id")]);{const $t1420=Array.from($iter($t1419));$set(e.get("p"),"country",$t1420[0]);$set(e.get("p"),"settlement",$t1420[1]);}}
}
}else{}
{const $t1421=$get(e.get("sim"),"year");$set(e.get("source"),"abandoned",$t1421);$set(e.get("source"),"demolished",$t1421);}
return ($fmt($get(e.get("source"),"name"),-1,null)+" was removed; "+$fmt($call(e.get("len"),[e.get("residents")],$dict([])),-1,null)+" residents relocated and its history retained.");}else{}
if($truth($compare([()=>e.get("kind"),()=>"disease"], ["Eq"]))){$call(e.get("_arity"),[e.get("args"),2,"delete disease NAME"],$dict([]));
{const $t1422=$call(e.get("_disease"),[e.get("sim"),e.get("target")],$dict([]));e.set("disease",$t1422);}
$call(e.get("_eradication_check"),[e.get("sim"),e.get("disease")],$dict([]));
e.set("retire_disease",$get($import("epidemiology"),"retire_disease"));$call(e.get("retire_disease"),[e.get("sim"),$get(e.get("disease"),"name")],$dict([]));
return ("Eradicated "+$fmt($get(e.get("disease"),"name"),-1,null)+"; patients recovered and historical records remain available.");}else{}
throw $call(e.get("ValueError"),["Delete types: person, settlement, country, disease. Historical ancestry is retained."],$dict([]));return null;}));
e.set("_knowledge",$fn("_knowledge",e,["sim", "verb", "args"],[undefined,undefined,undefined],null,null,[],[],e=>{e.set("TECHNOLOGIES",$get($import("society"),"TECHNOLOGIES"));e.set("FOOD_TECHS",$get($import("society"),"FOOD_TECHS"));e.set("unlock",$get($import("society"),"unlock"));e.set("ANY",$get($import("technology"),"ANY"));e.set("tech_met",$get($import("technology"),"met"));e.set("INNOVATIONS",$get($import("discoveries"),"INNOVATIONS"));e.set("award_innovation",$get($import("discoveries"),"award_innovation"));$call(e.get("_arity"),[e.get("args"),2,$bin("Add",e.get("verb")," COUNTRY TECHNOLOGY_OR_INNOVATION")],$dict([]));
{const $t1423=$call(e.get("_country"),[e.get("sim"),$item(e.get("args"),0)],$dict([]));e.set("c",$t1423);}
{const $t1424=$call($get($item(e.get("args"),1),"casefold"),[],$dict([]));e.set("query",$t1424);}
{const $t1425=$call(e.get("next"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1426 of $iter(e.get("TECHNOLOGIES"))){e.set("name",$t1426);if($truth($compare([()=>$call($get(e.get("name"),"casefold"),[],$dict([])),()=>e.get("query")], ["Eq"]))){yield e.get("name");}}})();})(e),null],$dict([]));e.set("foundation",$t1425);}
{const $t1427=$call($get(e.get("INNOVATIONS"),"get"),[e.get("query")],$dict([]));e.set("innovation",$t1427);}
if($truth($boolop("And",[()=>$un("Not",e.get("foundation")),()=>$compare([()=>e.get("innovation"),()=>null], ["Is"])]))){{const $t1428=$call(e.get("resolve_entity"),[e.get("INNOVATIONS"),$item(e.get("args"),1),"innovation"],$dict([]));e.set("innovation",$t1428);}
}else{}
{const $t1429=$boolop("Or",[()=>e.get("foundation"),()=>$get(e.get("innovation"),"id")]);e.set("key",$t1429);}
{const $t1430=($truth(e.get("foundation"))?$get(e.get("c"),"technologies"):$call(e.get("getattr"),[e.get("c"),"innovations",$dict([])],$dict([])));e.set("owned",$t1430);}
if($truth($compare([()=>e.get("verb"),()=>"grant"], ["Eq"]))){if($truth($compare([()=>e.get("key"),()=>e.get("owned")], ["In"]))){throw $call(e.get("ValueError"),["This country already knows that discovery."],$dict([]));}else{}
{const $t1431=($truth(e.get("foundation"))?$item($item(e.get("TECHNOLOGIES"),e.get("foundation")),0):$get(e.get("innovation"),"prerequisites"));e.set("prerequisites",$t1431);}
{const $t1432=$bin("Sub",e.get("prerequisites"),$get(e.get("c"),"technologies"));e.set("missing",$t1432);}
if($truth(e.get("missing"))){throw $call(e.get("ValueError"),[$bin("Add","Missing prerequisites: ",$call($get(", ","join"),[$call(e.get("sorted"),[e.get("missing")],$dict([]))],$dict([])))],$dict([]));}else{}
if($truth(e.get("foundation"))){for(const $t1433 of $iter($call($get(e.get("ANY"),"get"),[e.get("foundation"),[]],$dict([])))){e.set("group",$t1433);{const $t1434=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1435 of $iter(e.get("group"))){e.set("other",$t1435);if($truth($compare([()=>e.get("other"),()=>$get(e.get("c"),"technologies")], ["In"]))){yield e.get("other");}}})();})(e));e.set("have",$t1434);}
if($truth($un("Not",e.get("have")))){throw $call(e.get("ValueError"),[$bin("Add","Missing one of: ",$call($get(", ","join"),[$call(e.get("sorted"),[e.get("group")],$dict([]))],$dict([])))],$dict([]));}else{}
}
}else{}
{const $t1436=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1437 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1437);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("p"),"country"),()=>$get(e.get("c"),"id")], ["Eq"]),()=>$compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"])]))){yield e.get("p");}}})();})(e));e.set("adults",$t1436);}
if($truth($un("Not",e.get("adults")))){throw $call(e.get("ValueError"),["An adult researcher is needed to introduce this knowledge."],$dict([]));}else{}
{const $t1438=$call(e.get("max"),[e.get("adults")],$dict([["key",$fn("<lambda>",e,["p"],[undefined],null,null,[],[],e=>{return $call(e.get("getattr"),[e.get("p"),"fame",0],$dict([]));return null;})]]));e.set("actor",$t1438);}
if($truth(e.get("foundation"))){$call(e.get("unlock"),[e.get("sim"),e.get("c"),e.get("foundation"),e.get("actor")],$dict([]));
}else{$call(e.get("award_innovation"),[e.get("sim"),e.get("c"),e.get("innovation"),e.get("actor")],$dict([]));
}
return ("Granted "+$fmt($boolop("Or",[()=>e.get("foundation"),()=>$get(e.get("innovation"),"name")]),-1,null)+" to "+$fmt($get(e.get("c"),"name"),-1,null)+".");}else{}
if($truth($compare([()=>e.get("key"),()=>e.get("owned")], ["NotIn"]))){throw $call(e.get("ValueError"),["This country does not know that discovery."],$dict([]));}else{}
{const $t1439=$call(e.get("set"),[],$dict([]));e.set("removed",$t1439);}
if($truth(e.get("foundation"))){$call($get(e.get("removed"),"add"),[e.get("foundation")],$dict([]));
while($truth(true)){{const $t1440=$bin("Sub",$get(e.get("c"),"technologies"),e.get("removed"));e.set("remaining",$t1440);}
{const $t1441=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1442 of $iter(e.get("remaining"))){e.set("name",$t1442);if($truth($un("Not",$call(e.get("tech_met"),[e.get("name"),e.get("remaining")],$dict([]))))){yield e.get("name");}}})();})(e));e.set("dependents",$t1441);}
if($truth($un("Not",e.get("dependents")))){break;}else{}
$call($get(e.get("removed"),"update"),[e.get("dependents")],$dict([]));
}
$call($get($get(e.get("c"),"technologies"),"difference_update"),[e.get("removed")],$dict([]));
{const $t1443=$call(e.get("max"),[1,$call(e.get("round"),[$bin("Div",$get(e.get("c"),"capacity"),$bin("Pow",1.05,$call(e.get("len"),[$bin("BitAnd",e.get("removed"),e.get("FOOD_TECHS"))],$dict([]))))],$dict([]))],$dict([]));$set(e.get("c"),"capacity",$t1443);}
{const $t1444=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1445 of $iter($call(e.get("getattr"),[e.get("c"),"innovations",$dict([])],$dict([])))){e.set("k",$t1445);if($truth($un("Not",$compare([()=>$get($item(e.get("INNOVATIONS"),e.get("k")),"prerequisites"),()=>$get(e.get("c"),"technologies")], ["LtE"])))){yield e.get("k");}}})();})(e));e.set("applied",$t1444);}
}else{{const $t1446=[$get(e.get("innovation"),"id")];e.set("applied",$t1446);}
}
for(const $t1447 of $iter(e.get("applied"))){e.set("k",$t1447);$call($get($get(e.get("c"),"innovations"),"pop"),[e.get("k"),null],$dict([]));
}
{const $t1448=$call(e.get("getattr"),[e.get("c"),"research_project",null],$dict([]));e.set("project",$t1448);}
if($truth($boolop("And",[()=>e.get("project"),()=>$un("Not",$call(e.get("tech_met"),[e.get("project"),$get(e.get("c"),"technologies")],$dict([])))]))){{const $t1449=null;$set(e.get("c"),"research_project",$t1449);}
}else{}
{const $t1450=$call($get(e.get("INNOVATIONS"),"get"),[$call(e.get("getattr"),[e.get("c"),"innovation_project",null],$dict([]))],$dict([]));e.set("project",$t1450);}
if($truth($boolop("And",[()=>e.get("project"),()=>$un("Not",$compare([()=>$get(e.get("project"),"prerequisites"),()=>$get(e.get("c"),"technologies")], ["LtE"]))]))){{const $t1451=null;$set(e.get("c"),"innovation_project",$t1451);}
{const $t1452=0;$set(e.get("c"),"innovation_progress",$t1452);}
}else{}
return ($fmt($get(e.get("c"),"name"),-1,null)+" lost "+$fmt($call(e.get("len"),[e.get("removed")],$dict([])),-1,null)+" foundational discoveries and "+$fmt($call(e.get("len"),[e.get("applied")],$dict([])),-1,null)+" applied innovations; dependent knowledge was removed.");return null;}));
e.set("_execute",$fn("_execute",e,["sim", "verb", "args"],[undefined,undefined,undefined],null,null,[],[],e=>{if($truth($compare([()=>e.get("verb"),()=>"set"], ["Eq"]))){return $call(e.get("_set"),[e.get("sim"),e.get("args")],$dict([]));}else{}
if($truth($compare([()=>e.get("verb"),()=>"add"], ["Eq"]))){return $call(e.get("_add"),[e.get("sim"),e.get("args")],$dict([]));}else{}
if($truth($compare([()=>e.get("verb"),()=>new PS(["delete","remove"])], ["In"]))){return $call(e.get("_delete"),[e.get("sim"),e.get("args")],$dict([]));}else{}
if($truth($compare([()=>e.get("verb"),()=>"eradicate"], ["Eq"]))){$call(e.get("_arity"),[e.get("args"),1,"eradicate DISEASE"],$dict([]));
return $call(e.get("_delete"),[e.get("sim"),["disease",$item(e.get("args"),0)]],$dict([]));}else{}
if($truth($compare([()=>e.get("verb"),()=>"move"], ["Eq"]))){$call(e.get("_arity"),[e.get("args"),3,"move person NAME SETTLEMENT"],$dict([]));
if($truth($compare([()=>$call($get($item(e.get("args"),0),"lower"),[],$dict([])),()=>new PS(["person","individual"])], ["NotIn"]))){throw $call(e.get("ValueError"),["Use move person NAME SETTLEMENT."],$dict([]));}else{}
return $call(e.get("_set"),[e.get("sim"),["person",$item(e.get("args"),1),"settlement",$item(e.get("args"),2)]],$dict([]));}else{}
if($truth($compare([()=>e.get("verb"),()=>new PS(["grant","revoke"])], ["In"]))){return $call(e.get("_knowledge"),[e.get("sim"),e.get("verb"),e.get("args")],$dict([]));}else{}
if($truth($compare([()=>e.get("verb"),()=>new PS(["infect","cure"])], ["In"]))){$call(e.get("_arity"),[e.get("args"),($truth($compare([()=>e.get("verb"),()=>"infect"], ["Eq"]))?2:1),($truth($compare([()=>e.get("verb"),()=>"infect"], ["Eq"]))?"infect PERSON DISEASE":"cure PERSON")],$dict([]));
{const $t1453=$call(e.get("_person"),[e.get("sim"),$item(e.get("args"),0)],$dict([]));e.set("p",$t1453);}
if($truth($compare([()=>e.get("verb"),()=>"infect"], ["Eq"]))){{const $t1454=$call(e.get("_disease"),[e.get("sim"),$item(e.get("args"),1)],$dict([]));e.set("disease",$t1454);}
$call(e.get("_infect"),[e.get("sim"),e.get("p"),e.get("disease")],$dict([]));
return ($fmt($call($get(e.get("sim"),"full_name"),[e.get("p")],$dict([])),-1,null)+" contracted "+$fmt($get(e.get("disease"),"name"),-1,null)+".");}else{}
{const $t1455=$get(e.get("p"),"infection");e.set("name",$t1455);}
$call(e.get("_cure"),[e.get("sim"),e.get("p")],$dict([]));
return ($fmt($call($get(e.get("sim"),"full_name"),[e.get("p")],$dict([])),-1,null)+" recovered from "+$fmt(e.get("name"),-1,null)+" and gained immunity.");}else{}
if($truth($compare([()=>e.get("verb"),()=>"outbreak"], ["Eq"]))){if($truth($compare([()=>$call(e.get("len"),[e.get("args")],$dict([])),()=>2], ["Lt"]))){throw $call(e.get("ValueError"),["Usage: outbreak COUNTRY DISEASE [cases=5]"],$dict([]));}else{}
{const $t1456=$tuple([$call(e.get("_country"),[e.get("sim"),$item(e.get("args"),0)],$dict([])),$call(e.get("_disease"),[e.get("sim"),$item(e.get("args"),1)],$dict([]))]);{const $t1457=Array.from($iter($t1456));e.set("c",$t1457[0]);e.set("disease",$t1457[1]);}}
{const $t1458=$call(e.get("_options"),[$item(e.get("args"),$slice(2,null,null)),new PS(["cases"])],$dict([]));e.set("options",$t1458);}
{const $t1459=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1460 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1460);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("p"),"country"),()=>$get(e.get("c"),"id")], ["Eq"]),()=>$un("Not",$get(e.get("p"),"infection")),()=>$boolop("Or",[()=>$compare([()=>$get(e.get("disease"),"name"),()=>$get(e.get("p"),"immunity")], ["NotIn"]),()=>$compare([()=>$call($get($get(e.get("p"),"immunity_until"),"get"),[$get(e.get("disease"),"name"),$get(e.get("math"),"inf")],$dict([])),()=>$get(e.get("sim"),"year")], ["LtE"])])]))){yield e.get("p");}}})();})(e));e.set("residents",$t1459);}
{const $t1461=$call(e.get("_number"),[$call($get(e.get("options"),"get"),["cases","5"],$dict([])),1,$call(e.get("len"),[e.get("residents")],$dict([])),true],$dict([]));e.set("count",$t1461);}
for(const $t1462 of $iter($call($get($get(e.get("sim"),"rng"),"sample"),[e.get("residents"),e.get("count")],$dict([])))){e.set("p",$t1462);$call(e.get("_infect"),[e.get("sim"),e.get("p"),e.get("disease")],$dict([]));
}
{const $t1463=$get(e.get("disease"),"name");$set(e.get("c"),"sickness",$t1463);}
$call($get($get(e.get("c"),"conditions"),"add"),["Disease"],$dict([]));
e.set("_local_outbreak",$get($import("epidemiology"),"_local_outbreak"));{const $t1464=$call(e.get("_local_outbreak"),[e.get("sim"),e.get("c"),$get(e.get("disease"),"name")],$dict([]));e.set("local",$t1464);}
$call($get(e.get("local"),"update"),[],$dict([["age",0],["last_year",null],["cooldown_until",0],["source",true]]));
return ("Introduced "+$fmt(e.get("count"),-1,null)+" cases of "+$fmt($get(e.get("disease"),"name"),-1,null)+" in "+$fmt($get(e.get("c"),"name"),-1,null)+".");}else{}
if($truth($compare([()=>e.get("verb"),()=>new PS(["war","peace"])], ["In"]))){if($truth($compare([()=>$call(e.get("len"),[e.get("args")],$dict([])),()=>2], ["Lt"]))){throw $call(e.get("ValueError"),["Usage: war COUNTRY COUNTRY; peace COUNTRY COUNTRY [years=5]"],$dict([]));}else{}
{const $t1465=$tuple([$call(e.get("_country"),[e.get("sim"),$item(e.get("args"),0)],$dict([])),$call(e.get("_country"),[e.get("sim"),$item(e.get("args"),1)],$dict([]))]);{const $t1466=Array.from($iter($t1465));e.set("a",$t1466[0]);e.set("b",$t1466[1]);}}
if($truth($compare([()=>$get(e.get("a"),"id"),()=>$get(e.get("b"),"id")], ["Eq"]))){throw $call(e.get("ValueError"),["Choose two different countries."],$dict([]));}else{}
{const $t1467=$call(e.get("_options"),[$item(e.get("args"),$slice(2,null,null)),($truth($compare([()=>e.get("verb"),()=>"peace"], ["Eq"]))?new PS(["years"]):new PS(["force"]))],$dict([]));e.set("options",$t1467);}
{const $t1468=$call(e.get("tuple"),[$call(e.get("sorted"),[$tuple([$get(e.get("a"),"id"),$get(e.get("b"),"id")])],$dict([]))],$dict([]));e.set("pair",$t1468);}
if($truth($compare([()=>e.get("verb"),()=>"war"], ["Eq"]))){{const $t1469=$compare([()=>$call(e.get("_choice"),[$call($get(e.get("options"),"get"),["force","false"],$dict([])),new PS(["true","false"])],$dict([])),()=>"true"], ["Eq"]);e.set("force",$t1469);}
if($truth($boolop("And",[()=>$compare([()=>$call($get($call(e.get("getattr"),[e.get("sim"),"truces",$dict([])],$dict([])),"get"),[e.get("pair"),$un("USub",1)],$dict([])),()=>$get(e.get("sim"),"year")], ["Gt"]),()=>$un("Not",e.get("force"))]))){throw $call(e.get("ValueError"),["These countries have an active truce. Use force=true to deliberately break it."],$dict([]));}else{}
if($truth($call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1470 of $iter($get(e.get("sim"),"wars"))){e.set("active",$t1470);yield $boolop("Or",[()=>$compare([()=>$get(e.get("a"),"id"),()=>e.get("active")], ["In"]),()=>$compare([()=>$get(e.get("b"),"id"),()=>e.get("active")], ["In"])]);}})();})(e)],$dict([])))){throw $call(e.get("ValueError"),["One of these countries is already at war; make peace first."],$dict([]));}else{}
{const $t1471=$get(e.get("sim"),"year");$setitem($get(e.get("sim"),"wars"),e.get("pair"),$t1471);}
e.set("end_pact",$get($import("society"),"end_pact"));$call(e.get("end_pact"),[e.get("sim"),e.get("a"),e.get("b")],$dict([]));
$call($get($call(e.get("getattr"),[e.get("sim"),"truces",$dict([])],$dict([])),"pop"),[e.get("pair"),null],$dict([]));
return ($fmt($get(e.get("a"),"name"),-1,null)+" declared war on "+$fmt($get(e.get("b"),"name"),-1,null)+"; campaigns begin next year.");}else{}
{const $t1472=$call(e.get("_number"),[$call($get(e.get("options"),"get"),["years","5"],$dict([])),1,100,true],$dict([]));e.set("years",$t1472);}
$call($get($get(e.get("sim"),"wars"),"pop"),[e.get("pair"),null],$dict([]));
$call($get($call(e.get("getattr"),[e.get("sim"),"war_details",$dict([])],$dict([])),"pop"),[e.get("pair"),null],$dict([]));
if($truth($un("Not",$call(e.get("hasattr"),[e.get("sim"),"truces"],$dict([]))))){{const $t1473=$dict([]);$set(e.get("sim"),"truces",$t1473);}
}else{}
{const $t1474=$bin("Add",$get(e.get("sim"),"year"),e.get("years"));$setitem($get(e.get("sim"),"truces"),e.get("pair"),$t1474);}
return ($fmt($get(e.get("a"),"name"),-1,null)+" and "+$fmt($get(e.get("b"),"name"),-1,null)+" agreed to peace and a "+$fmt(e.get("years"),-1,null)+"-year truce.");}else{}
if($truth($compare([()=>e.get("verb"),()=>"trade"], ["Eq"]))){if($truth($boolop("Or",[()=>$compare([()=>$call(e.get("len"),[e.get("args")],$dict([])),()=>3], ["NotEq"]),()=>$compare([()=>$call($get($item(e.get("args"),0),"lower"),[],$dict([])),()=>new PS(["science","pact","end"])], ["NotIn"])]))){throw $call(e.get("ValueError"),["Usage: trade science|pact|end COUNTRY COUNTRY"],$dict([]));}else{}
{const $t1475=$tuple([$call(e.get("_country"),[e.get("sim"),$item(e.get("args"),1)],$dict([])),$call(e.get("_country"),[e.get("sim"),$item(e.get("args"),2)],$dict([]))]);{const $t1476=Array.from($iter($t1475));e.set("a",$t1476[0]);e.set("b",$t1476[1]);}}
if($truth($compare([()=>$get(e.get("a"),"id"),()=>$get(e.get("b"),"id")], ["Eq"]))){throw $call(e.get("ValueError"),["Choose two different countries."],$dict([]));}else{}
if($truth($compare([()=>$call(e.get("tuple"),[$call(e.get("sorted"),[$tuple([$get(e.get("a"),"id"),$get(e.get("b"),"id")])],$dict([]))],$dict([])),()=>$get(e.get("sim"),"wars")], ["In"]))){throw $call(e.get("ValueError"),["Countries at war do not trade science; make peace first."],$dict([]));}else{}
e.set("pass_on_knowledge",$get($import("society"),"pass_on_knowledge"));e.set("pacts_of",$get($import("society"),"pacts_of"));e.set("end_pact",$get($import("society"),"end_pact"));if($truth($compare([()=>$call($get($item(e.get("args"),0),"lower"),[],$dict([])),()=>"pact"], ["Eq"]))){$call($get($call(e.get("pacts_of"),[e.get("a")],$dict([])),"add"),[$get(e.get("b"),"id")],$dict([]));
$call($get($call(e.get("pacts_of"),[e.get("b")],$dict([])),"add"),[$get(e.get("a"),"id")],$dict([]));
return ($fmt($get(e.get("a"),"name"),-1,null)+" and "+$fmt($get(e.get("b"),"name"),-1,null)+" will share what they learn every year, until war or an end to the pact.");}else{}
if($truth($compare([()=>$call($get($item(e.get("args"),0),"lower"),[],$dict([])),()=>"end"], ["Eq"]))){if($truth($compare([()=>$get(e.get("b"),"id"),()=>$call(e.get("pacts_of"),[e.get("a")],$dict([]))], ["NotIn"]))){throw $call(e.get("ValueError"),[($fmt($get(e.get("a"),"name"),-1,null)+" and "+$fmt($get(e.get("b"),"name"),-1,null)+" have no science pact.")],$dict([]));}else{}
$call(e.get("end_pact"),[e.get("sim"),e.get("a"),e.get("b")],$dict([]));
return ("The science pact between "+$fmt($get(e.get("a"),"name"),-1,null)+" and "+$fmt($get(e.get("b"),"name"),-1,null)+" has ended.");}else{}
{const $t1477=[];e.set("lines",$t1477);}
for(const $t1478 of $iter($tuple([$tuple([e.get("a"),e.get("b")]),$tuple([e.get("b"),e.get("a")])]))){{const $t1479=Array.from($iter($t1478));e.set("giver",$t1479[0]);e.set("taker",$t1479[1]);}{const $t1480=$call(e.get("pass_on_knowledge"),[e.get("sim"),e.get("giver"),e.get("taker"),0.3],$dict([]));e.set("got",$t1480);}
$call($get(e.get("lines"),"append"),[($truth(e.get("got"))?($fmt($get(e.get("taker"),"name"),-1,null)+" learned "+$fmt($bin("Mult",$item(e.get("got"),1),100),-1,(".0f"))+"% of "+$fmt($item(e.get("got"),0),-1,null)+" from "+$fmt($get(e.get("giver"),"name"),-1,null)+"."):($fmt($get(e.get("giver"),"name"),-1,null)+" had nothing new that "+$fmt($get(e.get("taker"),"name"),-1,null)+" could use."))],$dict([]));
}
return $call($get(" ","join"),[e.get("lines")],$dict([]));}else{}
if($truth($compare([()=>e.get("verb"),()=>"trigger"], ["Eq"]))){$call(e.get("_arity"),[e.get("args"),2,"trigger COUNTRY EVENT"],$dict([]));
{const $t1481=$call(e.get("_country"),[e.get("sim"),$item(e.get("args"),0)],$dict([]));e.set("c",$t1481);}
{const $t1482=$call($get($call(e.get("_choice"),[$item(e.get("args"),1),new PS(["famine","drought","panic","health","calm","safety","abundance"])],$dict([])),"capitalize"),[],$dict([]));e.set("event",$t1482);}
if($truth($compare([()=>e.get("event"),()=>new PS(["Famine","Drought"])], ["In"]))){$call($get($get(e.get("c"),"crisis_cooldown"),"pop"),[e.get("event"),null],$dict([]));
}else{}
$call($get(e.get("sim"),"pickevent"),[e.get("c")],$dict([["forced_event",e.get("event")]]));
if($truth($compare([()=>e.get("event"),()=>"Abundance"], ["Eq"]))){{const $t1483=$call(e.get("min"),[100,$bin("Add",$get(e.get("c"),"food"),15)],$dict([]));$set(e.get("c"),"food",$t1483);}
}else{}
return ("Triggered "+$fmt(e.get("event"),-1,null)+" in "+$fmt($get(e.get("c"),"name"),-1,null)+". Crises retain their normal duration limits.");}else{}
if($truth($compare([()=>e.get("verb"),()=>"disaster"], ["Eq"]))){if($truth($compare([()=>$call(e.get("len"),[e.get("args")],$dict([])),()=>2], ["Lt"]))){throw $call(e.get("ValueError"),["Usage: disaster COUNTRY TYPE [severity=major] [at=SETTLEMENT]"],$dict([]));}else{}
{const $t1484=$call(e.get("_country"),[e.get("sim"),$item(e.get("args"),0)],$dict([]));e.set("c",$t1484);}
e.set("KINDS",$get($import("disasters"),"KINDS"));e.set("strike",$get($import("disasters"),"strike"));e.set("describe",$get($import("disasters"),"describe"));e.set("ensure_placed",$get($import("geography"),"ensure_placed"));e.set("hazards_at",$get($import("geography"),"hazards_at"));{const $t1485=$call(e.get("_choice"),[$item(e.get("args"),1),$call(e.get("set"),[e.get("KINDS")],$dict([]))],$dict([]));e.set("disaster",$t1485);}
{const $t1486=$call(e.get("_options"),[$item(e.get("args"),$slice(2,null,null)),new PS(["severity","at"])],$dict([]));e.set("options",$t1486);}
{const $t1487=$call(e.get("_choice"),[$call($get(e.get("options"),"get"),["severity","major"],$dict([])),new PS(["minor","major","severe"])],$dict([]));e.set("severity",$t1487);}
$call(e.get("ensure_placed"),[e.get("sim")],$dict([]));
if($truth($compare([()=>"at",()=>e.get("options")], ["In"]))){{const $t1488=$call(e.get("_settlement"),[e.get("sim"),$item(e.get("options"),"at")],$dict([]));e.set("site",$t1488);}
}else{{const $t1489=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1490 of $iter($call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([])))){e.set("s",$t1490);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("s"),"country"),()=>$get(e.get("c"),"id")], ["Eq"]),()=>$compare([()=>$get(e.get("s"),"abandoned"),()=>null], ["Is"])]))){yield e.get("s");}}})();})(e));e.set("places",$t1489);}
if($truth($un("Not",e.get("places")))){throw $call(e.get("ValueError"),[($fmt($get(e.get("c"),"name"),-1,null)+" has no inhabited settlement to strike.")],$dict([]));}else{}
{const $t1491=$call(e.get("max"),[e.get("places")],$dict([["key",$fn("<lambda>",e,["s"],[undefined],null,null,[],[],e=>{return $item($call(e.get("hazards_at"),[e.get("sim"),$get(e.get("s"),"gx"),$get(e.get("s"),"gy")],$dict([])),e.get("disaster"));return null;})]]));e.set("site",$t1491);}
}
{const $t1492=$call(e.get("strike"),[e.get("sim"),e.get("disaster"),e.get("severity"),$get(e.get("site"),"gx"),$get(e.get("site"),"gy")],$dict([]));e.set("summary",$t1492);}
return $call(e.get("describe"),[e.get("sim"),e.get("disaster"),e.get("severity"),e.get("summary"),e.get("c")],$dict([]));}else{}
if($truth($compare([()=>e.get("verb"),()=>"build"], ["Eq"]))){if($truth($compare([()=>$call(e.get("len"),[e.get("args")],$dict([])),()=>2], ["Lt"]))){throw $call(e.get("ValueError"),["Usage: build SETTLEMENT KIND [force=true]; build SETTLEMENT road to=SETTLEMENT"],$dict([]));}else{}
e.set("BUILDINGS",$get($import("development"),"BUILDINGS"));e.set("start_project",$get($import("development"),"start_project"));{const $t1493=$call(e.get("_settlement"),[e.get("sim"),$item(e.get("args"),0)],$dict([]));e.set("s",$t1493);}
{const $t1494=$call($get($item(e.get("args"),1),"lower"),[],$dict([]));e.set("kind",$t1494);}
{const $t1495=$call(e.get("_options"),[$item(e.get("args"),$slice(2,null,null)),new PS(["to","force"])],$dict([]));e.set("options",$t1495);}
if($truth($compare([()=>e.get("kind"),()=>"road"], ["Eq"]))){if($truth($compare([()=>"to",()=>e.get("options")], ["NotIn"]))){throw $call(e.get("ValueError"),["Roads need a destination: build SETTLEMENT road to=SETTLEMENT."],$dict([]));}else{}
{const $t1496=$call(e.get("_settlement"),[e.get("sim"),$item(e.get("options"),"to")],$dict([]));e.set("other",$t1496);}
if($truth($compare([()=>$call(e.get("start_project"),[e.get("sim"),e.get("s"),"road"],$dict([["target",e.get("other")]])),()=>null], ["Is"]))){throw $call(e.get("ValueError"),["Those settlements are not linked by land within one country."],$dict([]));}else{}
return ("Road work began between "+$fmt($get(e.get("s"),"name"),-1,null)+" and "+$fmt($get(e.get("other"),"name"),-1,null)+".");}else{}
$call(e.get("_choice"),[e.get("kind"),$call(e.get("set"),[e.get("BUILDINGS")],$dict([]))],$dict([]));
{const $t1497=$compare([()=>$call($get($call($get(e.get("options"),"get"),["force","false"],$dict([])),"lower"),[],$dict([])),()=>new PS(["true","yes","on"])], ["In"]);e.set("force",$t1497);}
if($truth($compare([()=>$call(e.get("start_project"),[e.get("sim"),e.get("s"),e.get("kind")],$dict([["forced",e.get("force")]])),()=>null], ["Is"]))){{const $t1498=$item(e.get("BUILDINGS"),e.get("kind"));e.set("spec",$t1498);}
{const $t1499=$boolop("Or",[()=>$call($get(", ","join"),[$call(e.get("sorted"),[$item(e.get("spec"),2)],$dict([]))],$dict([])),()=>"none"]);e.set("need",$t1499);}
throw $call(e.get("ValueError"),[($fmt($get(e.get("s"),"name"),-1,null)+" cannot build a "+$fmt($call($get($item(e.get("spec"),0),"lower"),[],$dict([])),-1,null)+" now. It needs technology ("+$fmt(e.get("need"),-1,null)+"), at least "+$fmt($item(e.get("spec"),3),-1,null)+" residents, suitable terrain, and none already built or pending. Use force=true to override.")],$dict([]));}else{}
return ("Construction of a "+$fmt($call($get($item($item(e.get("BUILDINGS"),e.get("kind")),0),"lower"),[],$dict([])),-1,null)+" began in "+$fmt($get(e.get("s"),"name"),-1,null)+".");}else{}
if($truth($compare([()=>e.get("verb"),()=>"settle"], ["Eq"]))){if($truth($un("Not",e.get("args")))){throw $call(e.get("ValueError"),["Usage: settle SETTLEMENT [x=CELL y=CELL] [size=N]"],$dict([]));}else{}
e.set("launch_expedition",$get($import("development"),"launch_expedition"));e.set("W",$get($import("geography"),"W"));e.set("H",$get($import("geography"),"H"));e.set("world",$get($import("geography"),"world"));e.set("WATER",$get($import("geography"),"WATER"));{const $t1500=$call(e.get("_settlement"),[e.get("sim"),$item(e.get("args"),0)],$dict([]));e.set("s",$t1500);}
{const $t1501=$call(e.get("_options"),[$item(e.get("args"),$slice(1,null,null)),new PS(["x","y","size"])],$dict([]));e.set("options",$t1501);}
{const $t1502=null;e.set("target",$t1502);}
if($truth($boolop("Or",[()=>$compare([()=>"x",()=>e.get("options")], ["In"]),()=>$compare([()=>"y",()=>e.get("options")], ["In"])]))){if($truth($boolop("Or",[()=>$compare([()=>"x",()=>e.get("options")], ["NotIn"]),()=>$compare([()=>"y",()=>e.get("options")], ["NotIn"])]))){throw $call(e.get("ValueError"),["Give both x and y, or neither."],$dict([]));}else{}
{const $t1503=$tuple([$call(e.get("_number"),[$item(e.get("options"),"x"),0,$bin("Sub",e.get("W"),1),true],$dict([])),$call(e.get("_number"),[$item(e.get("options"),"y"),0,$bin("Sub",e.get("H"),1),true],$dict([]))]);e.set("target",$t1503);}
if($truth($compare([()=>$item($item($item($call(e.get("world"),[e.get("sim")],$dict([])),"terrain"),$item(e.get("target"),1)),$item(e.get("target"),0)),()=>e.get("WATER")], ["In"]))){throw $call(e.get("ValueError"),["That cell is water."],$dict([]));}else{}
}else{}
{const $t1504=($truth($compare([()=>"size",()=>e.get("options")], ["In"]))?$call(e.get("_number"),[$item(e.get("options"),"size"),6,60,true],$dict([])):null);e.set("size",$t1504);}
{const $t1505=$call(e.get("launch_expedition"),[e.get("sim"),e.get("s")],$dict([["size",e.get("size")],["target",e.get("target")],["forced",true]]));e.set("exp",$t1505);}
if($truth($compare([()=>e.get("exp"),()=>null], ["Is"]))){throw $call(e.get("ValueError"),[($fmt($get(e.get("s"),"name"),-1,null)+" cannot send settlers: it needs at least 20 residents and a reachable site on its landmass.")],$dict([]));}else{}
return ($fmt($call(e.get("len"),[$item(e.get("exp"),"people")],$dict([])),-1,null)+" settlers set out from "+$fmt($get(e.get("s"),"name"),-1,null)+" toward cell "+$fmt($item($item(e.get("exp"),"target"),0),-1,null)+","+$fmt($item($item(e.get("exp"),"target"),1),-1,null)+".");}else{}
throw $call(e.get("ValueError"),["Unknown edit. Type help edit."],$dict([]));return null;}));
e.set("_information",$fn("_information",e,["sim", "verb", "args"],[undefined,undefined,undefined],null,null,[],[],e=>{if($truth($compare([()=>e.get("verb"),()=>"changes"], ["Eq"]))){$call(e.get("_arity"),[e.get("args"),0,"changes"],$dict([]));
{const $t1506=$call(e.get("getattr"),[e.get("sim"),"interventions",[]],$dict([]));e.set("rows",$t1506);}
return $boolop("Or",[()=>$call($get("\n","join"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1507 of $iter(e.get("rows"))){e.set("row",$t1507);yield ("Year "+$fmt($item(e.get("row"),"year"),-1,null)+": "+$fmt($item(e.get("row"),"message"),-1,null)+" (added "+$fmt($item(e.get("row"),"added"),-1,null)+", deaths "+$fmt($item(e.get("row"),"deaths"),-1,null)+")");}})();})(e)],$dict([])),()=>"No editor interventions yet."]);}else{}
e.set("TECHNOLOGIES",$get($import("society"),"TECHNOLOGIES"));e.set("INNOVATIONS",$get($import("discoveries"),"INNOVATIONS"));{const $t1508=1;e.set("page",$t1508);}
{const $t1509=[];e.set("terms",$t1509);}
for(const $t1510 of $iter(e.get("args"))){e.set("token",$t1510);if($truth($call($get(e.get("token"),"startswith"),["page="],$dict([])))){{const $t1511=$call(e.get("_number"),[$item(e.get("token"),$slice(5,null,null)),1,100000,true],$dict([]));e.set("page",$t1511);}
}else{$call($get(e.get("terms"),"append"),[e.get("token")],$dict([]));
}
}
{const $t1512=$call($get($call($get(" ","join"),[e.get("terms")],$dict([])),"casefold"),[],$dict([]));e.set("query",$t1512);}
{const $t1513=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1514 of $iter($call($get(e.get("TECHNOLOGIES"),"items"),[],$dict([])))){{const $t1515=Array.from($iter($t1514));e.set("name",$t1515[0]);{const $t1516=Array.from($iter($t1515[1]));e.set("req",$t1516[0]);e.set("_",$t1516[1]);e.set("effect",$t1516[2]);}}if($truth($compare([()=>e.get("query"),()=>$call($get(e.get("name"),"casefold"),[],$dict([]))], ["In"]))){yield ($fmt(e.get("name"),-1,null)+": prerequisites "+$fmt($boolop("Or",[()=>$call($get(", ","join"),[$call(e.get("sorted"),[e.get("req")],$dict([]))],$dict([])),()=>"none"]),-1,null)+"; "+$fmt(e.get("effect"),-1,null));}}})();})(e));e.set("rows",$t1513);}
e.set("rows",$aug("Add",e.get("rows"),Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1517 of $iter($call($get(e.get("INNOVATIONS"),"values"),[],$dict([])))){e.set("i",$t1517);if($truth($boolop("Or",[()=>$compare([()=>e.get("query"),()=>$call($get($get(e.get("i"),"name"),"casefold"),[],$dict([]))], ["In"]),()=>$compare([()=>e.get("query"),()=>$get(e.get("i"),"id")], ["Eq"])]))){yield ($fmt($get(e.get("i"),"name"),-1,null)+"; prerequisites "+$fmt($call($get(", ","join"),[$call(e.get("sorted"),[$get(e.get("i"),"prerequisites")],$dict([]))],$dict([])),-1,null));}}})();})(e))));{const $t1518=$item(e.get("rows"),$slice($bin("Mult",$bin("Sub",e.get("page"),1),40),$bin("Mult",e.get("page"),40),null));e.set("selected",$t1518);}
return $bin("Add",("Discovery catalog: "+$fmt($call(e.get("len"),[e.get("rows")],$dict([])),-1,null)+" matches, page "+$fmt(e.get("page"),-1,null)+"/"+$fmt($call(e.get("max"),[1,$call($get(e.get("math"),"ceil"),[$bin("Div",$call(e.get("len"),[e.get("rows")],$dict([])),40)],$dict([]))],$dict([])),-1,null)+"\n"),$call($get("\n","join"),[$boolop("Or",[()=>e.get("selected"),()=>["No entries on this page."]])],$dict([])));return null;}));
e.set("edit_command",$fn("edit_command",e,["sim", "text"],[undefined,undefined],null,null,[],[],e=>{{const $t1519=($truth($call($get(e.get("text"),"strip"),[],$dict([])))?$call($get($item($call($get($call($get(e.get("text"),"strip"),[],$dict([])),"split"),[],$dict([["maxsplit",1]])),0),"lower"),[],$dict([])):"");e.set("first",$t1519);}
if($truth($compare([()=>e.get("first"),()=>$bin("BitOr",e.get("EDIT_VERBS"),new PS(["changes","catalog"]))], ["NotIn"]))){return null;}else{}
try{{const $t1520=$call($get(e.get("shlex"),"split"),[e.get("text")],$dict([]));e.set("tokens",$t1520);}
{const $t1521=$tuple([$call($get($item(e.get("tokens"),0),"lower"),[],$dict([])),$item(e.get("tokens"),$slice(1,null,null))]);{const $t1522=Array.from($iter($t1521));e.set("verb",$t1522[0]);e.set("args",$t1522[1]);}}
if($truth($compare([()=>e.get("verb"),()=>new PS(["changes","catalog"])], ["In"]))){return $tuple([$call(e.get("_information"),[e.get("sim"),e.get("verb"),e.get("args")],$dict([])),"inspect"]);}else{}
if($truth($compare([()=>e.get("verb"),()=>"undo"], ["Eq"]))){$call(e.get("_arity"),[e.get("args"),0,"undo"],$dict([]));
{const $t1523=$call(e.get("getattr"),[e.get("sim"),"_command_undo",null],$dict([]));e.set("snapshot",$t1523);}
if($truth($compare([()=>e.get("snapshot"),()=>null], ["Is"]))){throw $call(e.get("ValueError"),["No edit to undo. Undo covers only the latest edit before advancing a year."],$dict([]));}else{}
$call($get($get(e.get("sim"),"__dict__"),"clear"),[],$dict([]));
$call($get($get(e.get("sim"),"__dict__"),"update"),[e.get("snapshot")],$dict([]));
return $tuple(["Undid the most recent edit; simulation state and random generator restored.","edit"]);}else{}
}catch($error){if($isinstance($error,e.get("ValueError"))){e.set("exc",$error);return $tuple([$bin("Add","Command error: ",$call(e.get("str"),[e.get("exc")],$dict([]))),"inspect"]);}else{throw $error;}}{const $t1524=e.get("sim");e.set("target_sim",$t1524);}
{const $t1525=new PD(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1526 of $iter($call($get($get(e.get("sim"),"__dict__"),"items"),[],$dict([])))){{const $t1527=Array.from($iter($t1526));e.set("k",$t1527[0]);e.set("v",$t1527[1]);}if($truth($compare([()=>e.get("k"),()=>"_command_undo"], ["NotEq"]))){yield $tuple([e.get("k"),e.get("v")]);}}})();})(e));e.set("snapshot",$t1525);}
{const $t1528=$call($get(e.get("copy"),"copy"),[e.get("target_sim")],$dict([]));e.set("sim",$t1528);}
{const $t1529=$call($get(e.get("copy"),"deepcopy"),[e.get("snapshot")],$dict([]));$set(e.get("sim"),"__dict__",$t1529);}
{const $t1530=$call(e.get("len"),[$get(e.get("sim"),"people")],$dict([]));e.set("population",$t1530);}
try{{const $t1531=$call(e.get("_execute"),[e.get("sim"),e.get("verb"),e.get("args")],$dict([]));e.set("message",$t1531);}
{const $t1532=$un("Not",$boolop("And",[()=>$compare([()=>e.get("verb"),()=>"set"], ["Eq"]),()=>$boolop("Or",[()=>$compare([()=>$call($get($item(e.get("args"),0),"lower"),[],$dict([])),()=>"simulation"], ["Eq"]),()=>$boolop("And",[()=>$compare([()=>$call(e.get("len"),[e.get("args")],$dict([])),()=>4], ["Eq"]),()=>$compare([()=>$call($get($item(e.get("args"),2),"lower"),[],$dict([])),()=>new PS(["wealth","fame","job","name","first","food","prosperity","stability","research","treasury","capacity","economy","economic_system","quarantine"])], ["In"])])])]));e.set("refresh",$t1532);}
{const $t1533=$un("Not",$boolop("And",[()=>$compare([()=>e.get("verb"),()=>"set"], ["Eq"]),()=>$compare([()=>$call(e.get("len"),[e.get("args")],$dict([])),()=>4], ["Eq"]),()=>$compare([()=>$call($get($item(e.get("args"),0),"lower"),[],$dict([])),()=>"country"], ["Eq"]),()=>$compare([()=>$call($get($item(e.get("args"),2),"lower"),[],$dict([])),()=>"ruler"], ["Eq"]),()=>$compare([()=>$call($get($item(e.get("args"),3),"lower"),[],$dict([])),()=>"none"], ["Eq"])]));e.set("elect",$t1533);}
$call(e.get("_reconcile"),[e.get("sim"),e.get("refresh"),e.get("elect")],$dict([]));
{const $t1534=null;$set(e.get("sim"),"contact_cache",$t1534);}
{const $t1535=null;$set(e.get("sim"),"systems_state",$t1535);}
{const $t1536=$bin("Sub",$call(e.get("len"),[$get(e.get("sim"),"people")],$dict([])),e.get("population"));e.set("delta",$t1536);}
if($truth($un("Not",$call(e.get("hasattr"),[e.get("sim"),"interventions"],$dict([]))))){{const $t1537=[];$set(e.get("sim"),"interventions",$t1537);}
}else{}
$call($get($get(e.get("sim"),"interventions"),"append"),[$call(e.get("dict"),[],$dict([["year",$get(e.get("sim"),"year")],["message",e.get("message")],["added",$call(e.get("max"),[0,e.get("delta")],$dict([]))],["deaths",$call(e.get("max"),[0,$un("USub",e.get("delta"))],$dict([]))]]))],$dict([]));
if($truth($un("Not",$call(e.get("hasattr"),[e.get("sim"),"pending_interventions"],$dict([]))))){{const $t1538=$dict([["added",0],["deaths",0]]);$set(e.get("sim"),"pending_interventions",$t1538);}
}else{}
$setitem($get(e.get("sim"),"pending_interventions"),"added",$aug("Add",$item($get(e.get("sim"),"pending_interventions"),"added"),$call(e.get("max"),[0,e.get("delta")],$dict([]))));$setitem($get(e.get("sim"),"pending_interventions"),"deaths",$aug("Add",$item($get(e.get("sim"),"pending_interventions"),"deaths"),$call(e.get("max"),[0,$un("USub",e.get("delta"))],$dict([]))));$call($get(e.get("sim"),"record"),[$bin("Add","Intervention: ",e.get("message")),"political"],$dict([]));
{const $t1539=e.get("snapshot");$set(e.get("sim"),"_command_undo",$t1539);}
$call($get($get(e.get("target_sim"),"__dict__"),"clear"),[],$dict([]));
$call($get($get(e.get("target_sim"),"__dict__"),"update"),[$get(e.get("sim"),"__dict__")],$dict([]));
return $tuple([$bin("Add",e.get("message")," (Year unchanged; undo is available.)"),"edit"]);}catch($error){if($isinstance($error,e.get("Exception"))){e.set("exc",$error);if($truth($call(e.get("isinstance"),[e.get("exc"),$tuple([e.get("ValueError"),e.get("KeyError")])],$dict([])))){return $tuple([$bin("Add","Command error: ",$call(e.get("str"),[e.get("exc")],$dict([]))),"inspect"]);}else{}
throw $error;}else{throw $error;}}return null;}));
});
$register("geography",e=>{e.set("Counter",$get($import("collections"),"Counter"));{const $t1540=120;e.set("W",$t1540);}
{const $t1541=72;e.set("H",$t1541);}
{const $t1542=0.44;e.set("SEA_LEVEL",$t1542);}
{const $t1543=34;e.set("SEA_RANGE",$t1543);}
{const $t1544=$dict([["plains",1.0],["forest",1.6],["hills",2.0],["mountains",4.0],["desert",2.0],["swamp",3.0],["tundra",2.0]]);e.set("CELL_COST",$t1544);}
{const $t1545=$dict([["plains",1.15],["forest",0.95],["hills",0.9],["mountains",0.65],["desert",0.55],["swamp",0.8],["tundra",0.45],["lake",0],["ocean",0]]);e.set("FERTILITY",$t1545);}
{const $t1546=$dict([["plains",1.0],["forest",1.04],["hills",1.08],["mountains",1.15],["desert",0.97],["swamp",1.05],["tundra",0.98],["lake",1.0],["ocean",1.0]]);e.set("DEFENSE",$t1546);}
{const $t1547=$tuple(["ocean","lake"]);e.set("WATER",$t1547);}
{const $t1548=$dict([["grain",$tuple(["Grain","food",0.25,160,1.0])],["pasture",$tuple(["Pasture","food",0.18,120,1.2])],["fish",$tuple(["Fish","food",0.14,130,1.1])],["game",$tuple(["Game","food",0.1,90,1.3])],["timber",$tuple(["Timber","material",0.06,200,1.0])],["stone",$tuple(["Stone","material",0.02,260,1.1])],["clay",$tuple(["Clay","material",0.08,150,0.9])],["iron",$tuple(["Iron ore","metal",0.015,180,2.4])],["copper",$tuple(["Copper","metal",0.015,150,2.2])],["coal",$tuple(["Coal","fuel",0.012,220,1.8])],["gold",$tuple(["Gold","luxury",0.01,70,9.0])],["salt",$tuple(["Salt","trade",0.03,140,2.0])],["furs",$tuple(["Furs","luxury",0.07,80,3.0])]]);e.set("RESOURCE_INFO",$t1548);}
{const $t1549=$dict([["f","floodplain"],["d","river delta"],["b","natural harbor"],["o","oasis"],["s","spring"],["p","mountain pass"]]);e.set("FEATURE_NAMES",$t1549);}
{const $t1550=$tuple([$tuple([1,0]),$tuple([$un("USub",1),0]),$tuple([0,1]),$tuple([0,$un("USub",1)]),$tuple([1,1]),$tuple([$un("USub",1),$un("USub",1)]),$tuple([1,$un("USub",1)]),$tuple([$un("USub",1),1])]);e.set("OFFSETS",$t1550);}
{const $t1551=$dict([]);e.set("_CACHE",$t1551);}
{const $t1552=$dict([]);e.set("_HAZARDS",$t1552);}
{const $t1553=$dict([]);e.set("_ROUTES",$t1553);}
e.set("_hash",$fn("_hash",e,["x", "y", "seed", "salt"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t1554=$bin("Mod",$bin("Add",$bin("Add",$bin("Add",$bin("Mult",e.get("x"),374761),$bin("Mult",e.get("y"),668265)),$bin("Mult",$bin("Mod",e.get("seed"),100003),2713)),$bin("Mult",e.get("salt"),9176)),1000003);e.set("n",$t1554);}
{const $t1555=$bin("Mod",$bin("Add",$bin("Mult",e.get("n"),e.get("n")),12345),1000003);e.set("n",$t1555);}
{const $t1556=$bin("Mod",$bin("Add",$bin("Add",$bin("Mult",e.get("n"),7919),$bin("Mult",e.get("x"),31)),$bin("Mult",e.get("y"),17)),1000003);e.set("n",$t1556);}
return $bin("Div",e.get("n"),1000003);return null;}));
e.set("_lattice",$fn("_lattice",e,["seed", "salt", "scale"],[undefined,undefined,undefined],null,null,[],[],e=>{{const $t1557=$bin("Add",$call(e.get("int"),[$bin("Div",e.get("W"),e.get("scale"))],$dict([])),3);e.set("cols",$t1557);}
{const $t1558=$bin("Add",$call(e.get("int"),[$bin("Div",e.get("H"),e.get("scale"))],$dict([])),3);e.set("rows",$t1558);}
return Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1560 of $iter($call(e.get("range"),[e.get("rows")],$dict([])))){e.set("j",$t1560);yield Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1559 of $iter($call(e.get("range"),[e.get("cols")],$dict([])))){e.set("i",$t1559);yield $call(e.get("_hash"),[e.get("i"),e.get("j"),e.get("seed"),e.get("salt")],$dict([]));}})();})(e));}})();})(e));return null;}));
e.set("_sample",$fn("_sample",e,["lat", "x", "y", "scale"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t1561=$bin("Div",e.get("x"),e.get("scale"));e.set("gx",$t1561);}
{const $t1562=$bin("Div",e.get("y"),e.get("scale"));e.set("gy",$t1562);}
{const $t1563=$call(e.get("int"),[e.get("gx")],$dict([]));e.set("i",$t1563);}
{const $t1564=$call(e.get("int"),[e.get("gy")],$dict([]));e.set("j",$t1564);}
{const $t1565=$bin("Sub",e.get("gx"),e.get("i"));e.set("fx",$t1565);}
{const $t1566=$bin("Sub",e.get("gy"),e.get("j"));e.set("fy",$t1566);}
{const $t1567=$bin("Mult",$bin("Mult",e.get("fx"),e.get("fx")),$bin("Sub",3,$bin("Mult",2,e.get("fx"))));e.set("fx",$t1567);}
{const $t1568=$bin("Mult",$bin("Mult",e.get("fy"),e.get("fy")),$bin("Sub",3,$bin("Mult",2,e.get("fy"))));e.set("fy",$t1568);}
{const $t1569=$bin("Add",$item($item(e.get("lat"),e.get("j")),e.get("i")),$bin("Mult",$bin("Sub",$item($item(e.get("lat"),e.get("j")),$bin("Add",e.get("i"),1)),$item($item(e.get("lat"),e.get("j")),e.get("i"))),e.get("fx")));e.set("top",$t1569);}
{const $t1570=$bin("Add",$item($item(e.get("lat"),$bin("Add",e.get("j"),1)),e.get("i")),$bin("Mult",$bin("Sub",$item($item(e.get("lat"),$bin("Add",e.get("j"),1)),$bin("Add",e.get("i"),1)),$item($item(e.get("lat"),$bin("Add",e.get("j"),1)),e.get("i"))),e.get("fx")));e.set("bottom",$t1570);}
return $bin("Add",e.get("top"),$bin("Mult",$bin("Sub",e.get("bottom"),e.get("top")),e.get("fy")));return null;}));
e.set("_integral",$fn("_integral",e,["grid"],[undefined],null,null,[],[],e=>{{const $t1571=[$bin("Mult",[0],$bin("Add",e.get("W"),1))];e.set("table",$t1571);}
for(const $t1572 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("y",$t1572);{const $t1573=0;e.set("run",$t1573);}
{const $t1574=[0];e.set("row",$t1574);}
for(const $t1575 of $iter($call(e.get("range"),[e.get("W")],$dict([])))){e.set("x",$t1575);e.set("run",$aug("Add",e.get("run"),($truth($item($item(e.get("grid"),e.get("y")),e.get("x")))?1:0)));$call($get(e.get("row"),"append"),[$bin("Add",$item($item(e.get("table"),e.get("y")),$bin("Add",e.get("x"),1)),e.get("run"))],$dict([]));
}
$call($get(e.get("table"),"append"),[e.get("row")],$dict([]));
}
return e.get("table");return null;}));
e.set("_count",$fn("_count",e,["table", "x", "y", "r"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t1576=$call(e.get("max"),[0,$bin("Sub",e.get("x"),e.get("r"))],$dict([]));e.set("x1",$t1576);}
{const $t1577=$call(e.get("max"),[0,$bin("Sub",e.get("y"),e.get("r"))],$dict([]));e.set("y1",$t1577);}
{const $t1578=$call(e.get("min"),[e.get("W"),$bin("Add",$bin("Add",e.get("x"),e.get("r")),1)],$dict([]));e.set("x2",$t1578);}
{const $t1579=$call(e.get("min"),[e.get("H"),$bin("Add",$bin("Add",e.get("y"),e.get("r")),1)],$dict([]));e.set("y2",$t1579);}
return $bin("Add",$bin("Sub",$bin("Sub",$item($item(e.get("table"),e.get("y2")),e.get("x2")),$item($item(e.get("table"),e.get("y1")),e.get("x2"))),$item($item(e.get("table"),e.get("y2")),e.get("x1"))),$item($item(e.get("table"),e.get("y1")),e.get("x1")));return null;}));
e.set("_continents",$fn("_continents",e,["seed"],[undefined],null,null,[],[],e=>{{const $t1580=[$tuple([31,35,18,22]),$tuple([89,17,13,16]),$tuple([86,57,13,16]),$tuple([57,62,9,11])];e.set("slots",$t1580);}
{const $t1581=[];e.set("out",$t1581);}
for(const $t1582 of $iter($call(e.get("range"),[4],$dict([])))){e.set("i",$t1582);if($truth($boolop("And",[()=>$compare([()=>e.get("i"),()=>3], ["Eq"]),()=>$compare([()=>$call(e.get("_hash"),[2,2,e.get("seed"),62],$dict([])),()=>0.5], ["Lt"])]))){continue;}else{}
{const $t1583=$bin("Add",$item($item(e.get("slots"),e.get("i")),0),$bin("Mult",$bin("Sub",$call(e.get("_hash"),[e.get("i"),1,e.get("seed"),63],$dict([])),0.5),8));e.set("cx",$t1583);}
{const $t1584=$bin("Add",$item($item(e.get("slots"),e.get("i")),1),$bin("Mult",$bin("Sub",$call(e.get("_hash"),[e.get("i"),2,e.get("seed"),64],$dict([])),0.5),5));e.set("cy",$t1584);}
$call($get(e.get("out"),"append"),[$tuple([e.get("cx"),e.get("cy"),$bin("Add",$item($item(e.get("slots"),e.get("i")),2),$bin("Mult",$call(e.get("_hash"),[e.get("i"),3,e.get("seed"),65],$dict([])),$bin("Sub",$item($item(e.get("slots"),e.get("i")),3),$item($item(e.get("slots"),e.get("i")),2))))])],$dict([]));
}
return e.get("out");return null;}));
{const $t1585=$tuple([$tuple([1,0]),$tuple([0.92,0.38]),$tuple([0.71,0.71]),$tuple([0.38,0.92]),$tuple([0,1]),$tuple([$un("USub",0.38),0.92]),$tuple([$un("USub",0.71),0.71]),$tuple([$un("USub",0.92),0.38]),$tuple([$un("USub",1),0]),$tuple([$un("USub",0.92),$un("USub",0.38)]),$tuple([$un("USub",0.71),$un("USub",0.71)]),$tuple([$un("USub",0.38),$un("USub",0.92)]),$tuple([0,$un("USub",1)]),$tuple([0.38,$un("USub",0.92)]),$tuple([0.71,$un("USub",0.71)]),$tuple([0.92,$un("USub",0.38)])]);e.set("DIRECTIONS",$t1585);}
e.set("_satellites",$fn("_satellites",e,["seed", "continents"],[undefined,undefined],null,null,[],[],e=>{{const $t1586=[];e.set("lobes",$t1586);}
for(const $t1587 of $iter($call(e.get("range"),[$call(e.get("len"),[e.get("continents")],$dict([]))],$dict([])))){e.set("i",$t1587);{const $t1588=$item(e.get("continents"),e.get("i"));{const $t1589=Array.from($iter($t1588));e.set("cx",$t1589[0]);e.set("cy",$t1589[1]);e.set("r",$t1589[2]);}}
for(const $t1590 of $iter($call(e.get("range"),[$bin("Add",5,$call(e.get("int"),[$bin("Mult",$call(e.get("_hash"),[e.get("i"),20,e.get("seed"),91],$dict([])),3)],$dict([])))],$dict([])))){e.set("j",$t1590);{const $t1591=$item(e.get("DIRECTIONS"),$bin("Mod",$call(e.get("int"),[$bin("Mult",$call(e.get("_hash"),[$bin("Add",$bin("Mult",e.get("i"),10),e.get("j")),21,e.get("seed"),92],$dict([])),16)],$dict([])),16));{const $t1592=Array.from($iter($t1591));e.set("dx",$t1592[0]);e.set("dy",$t1592[1]);}}
{const $t1593=$bin("Mult",e.get("r"),$bin("Add",0.55,$bin("Mult",0.45,$call(e.get("_hash"),[$bin("Add",$bin("Mult",e.get("i"),10),e.get("j")),22,e.get("seed"),93],$dict([])))));e.set("off",$t1593);}
$call($get(e.get("lobes"),"append"),[$tuple([$call(e.get("max"),[6.0,$call(e.get("min"),[$bin("Sub",e.get("W"),6.0),$bin("Add",e.get("cx"),$bin("Mult",e.get("dx"),e.get("off")))],$dict([]))],$dict([])),$call(e.get("max"),[6.0,$call(e.get("min"),[$bin("Sub",e.get("H"),6.0),$bin("Add",e.get("cy"),$bin("Mult",e.get("dy"),e.get("off")))],$dict([]))],$dict([])),$bin("Mult",e.get("r"),$bin("Add",0.38,$bin("Mult",0.27,$call(e.get("_hash"),[$bin("Add",$bin("Mult",e.get("i"),10),e.get("j")),23,e.get("seed"),94],$dict([])))))])],$dict([]));
}
}
return e.get("lobes");return null;}));
e.set("_sea_room",$fn("_sea_room",e,["x", "y", "continents"],[undefined,undefined,undefined],null,null,[],[],e=>{{const $t1594=999.0;e.set("room",$t1594);}
for(const $t1595 of $iter(e.get("continents"))){{const $t1596=Array.from($iter($t1595));e.set("cx",$t1596[0]);e.set("cy",$t1596[1]);e.set("r",$t1596[2]);}{const $t1597=$bin("Sub",$bin("Pow",$bin("Add",$bin("Pow",$bin("Sub",e.get("x"),e.get("cx")),2),$bin("Pow",$bin("Sub",e.get("y"),e.get("cy")),2)),0.5),$bin("Mult",e.get("r"),0.85));e.set("edge",$t1597);}
if($truth($compare([()=>e.get("edge"),()=>e.get("room")], ["Lt"]))){{const $t1598=e.get("edge");e.set("room",$t1598);}
}else{}
}
return e.get("room");return null;}));
e.set("_archipelagos",$fn("_archipelagos",e,["seed", "continents"],[undefined,undefined],null,null,[],[],e=>{{const $t1599=[];e.set("islands",$t1599);}
{const $t1600=[];e.set("centers",$t1600);}
for(const $t1601 of $iter($call(e.get("range"),[80],$dict([])))){e.set("a",$t1601);if($truth($compare([()=>$call(e.get("len"),[e.get("centers")],$dict([])),()=>5], ["GtE"]))){break;}else{}
{const $t1602=$bin("Add",8,$bin("Mult",$call(e.get("_hash"),[e.get("a"),1,e.get("seed"),71],$dict([])),$bin("Sub",e.get("W"),16)));e.set("cx",$t1602);}
{const $t1603=$bin("Add",6,$bin("Mult",$call(e.get("_hash"),[e.get("a"),2,e.get("seed"),72],$dict([])),$bin("Sub",e.get("H"),12)));e.set("cy",$t1603);}
if($truth($compare([()=>$call(e.get("_sea_room"),[e.get("cx"),e.get("cy"),e.get("continents")],$dict([])),()=>9], ["Lt"]))){continue;}else{}
{const $t1604=true;e.set("ok",$t1604);}
for(const $t1605 of $iter(e.get("centers"))){{const $t1606=Array.from($iter($t1605));e.set("ox",$t1606[0]);e.set("oy",$t1606[1]);}if($truth($compare([()=>$bin("Pow",$bin("Add",$bin("Pow",$bin("Sub",e.get("cx"),e.get("ox")),2),$bin("Pow",$bin("Sub",e.get("cy"),e.get("oy")),2)),0.5),()=>22], ["Lt"]))){{const $t1607=false;e.set("ok",$t1607);}
}else{}
}
if($truth($un("Not",e.get("ok")))){continue;}else{}
$call($get(e.get("centers"),"append"),[$tuple([e.get("cx"),e.get("cy")])],$dict([]));
for(const $t1608 of $iter($call(e.get("range"),[$bin("Add",5,$call(e.get("int"),[$bin("Mult",$call(e.get("_hash"),[e.get("a"),3,e.get("seed"),73],$dict([])),4)],$dict([])))],$dict([])))){e.set("j",$t1608);{const $t1609=$bin("Add",e.get("cx"),$bin("Mult",$bin("Sub",$call(e.get("_hash"),[$bin("Add",$bin("Mult",e.get("a"),10),e.get("j")),4,e.get("seed"),74],$dict([])),0.5),20));e.set("ix",$t1609);}
{const $t1610=$bin("Add",e.get("cy"),$bin("Mult",$bin("Sub",$call(e.get("_hash"),[$bin("Add",$bin("Mult",e.get("a"),10),e.get("j")),5,e.get("seed"),75],$dict([])),0.5),10));e.set("iy",$t1610);}
{const $t1611=$bin("Add",3.6,$bin("Mult",$call(e.get("_hash"),[$bin("Add",$bin("Mult",e.get("a"),10),e.get("j")),6,e.get("seed"),76],$dict([])),4.0));e.set("ir",$t1611);}
if($truth($compare([()=>$call(e.get("_sea_room"),[e.get("ix"),e.get("iy"),e.get("continents")],$dict([])),()=>$bin("Add",e.get("ir"),2)], ["GtE"]))){$call($get(e.get("islands"),"append"),[$tuple([e.get("ix"),e.get("iy"),e.get("ir")])],$dict([]));
}else{}
}
}
return e.get("islands");return null;}));
e.set("_layout_deposits",$fn("_layout_deposits",e,["rows", "river", "soil", "feat", "near_water", "seed"],[undefined,undefined,undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t1612=$dict([]);e.set("out",$t1612);}
for(const $t1613 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("y",$t1613);for(const $t1614 of $iter($call(e.get("range"),[e.get("W")],$dict([])))){e.set("x",$t1614);{const $t1615=$item($item(e.get("rows"),e.get("y")),e.get("x"));e.set("t",$t1615);}
if($truth($compare([()=>e.get("t"),()=>e.get("WATER")], ["In"]))){continue;}else{}
{const $t1616=$item($item(e.get("soil"),e.get("y")),e.get("x"));e.set("tile_soil",$t1616);}
{const $t1617=$item($item(e.get("feat"),e.get("y")),e.get("x"));e.set("f",$t1617);}
{const $t1618=$call(e.get("_near_flag"),[e.get("river"),e.get("x"),e.get("y"),1],$dict([]));e.set("by_river",$t1618);}
{const $t1619=[];e.set("rolls",$t1619);}
if($truth($compare([()=>e.get("t"),()=>"plains"], ["Eq"]))){{const $t1620=[$tuple(["grain",$bin("Add",0.35,$bin("Mult",0.35,e.get("tile_soil")))]),$tuple(["pasture",0.28]),$tuple(["clay",($truth(e.get("by_river"))?0.14:0.03)]),$tuple(["game",0.06])];e.set("rolls",$t1620);}
}else{if($truth($compare([()=>e.get("t"),()=>"forest"], ["Eq"]))){{const $t1621=[$tuple(["timber",0.78]),$tuple(["game",0.38]),$tuple(["furs",0.12]),$tuple(["pasture",0.05])];e.set("rolls",$t1621);}
}else{if($truth($compare([()=>e.get("t"),()=>"hills"], ["Eq"]))){{const $t1622=[$tuple(["stone",0.5]),$tuple(["pasture",0.25]),$tuple(["iron",0.17]),$tuple(["copper",0.15]),$tuple(["coal",0.08]),$tuple(["game",0.08])];e.set("rolls",$t1622);}
}else{if($truth($compare([()=>e.get("t"),()=>"mountains"], ["Eq"]))){{const $t1623=[$tuple(["stone",0.6]),$tuple(["iron",0.25]),$tuple(["copper",0.19]),$tuple(["coal",0.16]),$tuple(["gold",0.075])];e.set("rolls",$t1623);}
}else{if($truth($compare([()=>e.get("t"),()=>"desert"], ["Eq"]))){{const $t1624=[$tuple(["salt",0.14]),$tuple(["stone",0.18]),$tuple(["copper",0.07]),$tuple(["gold",0.03])];e.set("rolls",$t1624);}
}else{if($truth($compare([()=>e.get("t"),()=>"swamp"], ["Eq"]))){{const $t1625=[$tuple(["clay",0.5]),$tuple(["timber",0.25]),$tuple(["game",0.2]),$tuple(["fish",0.2])];e.set("rolls",$t1625);}
}else{if($truth($compare([()=>e.get("t"),()=>"tundra"], ["Eq"]))){{const $t1626=[$tuple(["furs",0.35]),$tuple(["game",0.3]),$tuple(["coal",0.08]),$tuple(["stone",0.1])];e.set("rolls",$t1626);}
}else{}
}
}
}
}
}
}
if($truth($item($item(e.get("near_water"),e.get("y")),e.get("x")))){$call($get(e.get("rolls"),"append"),[$tuple(["fish",0.5])],$dict([]));
$call($get(e.get("rolls"),"append"),[$tuple(["salt",0.09])],$dict([]));
}else{if($truth(e.get("by_river"))){$call($get(e.get("rolls"),"append"),[$tuple(["fish",0.3])],$dict([]));
}else{}
}
{const $t1627=[];e.set("chosen",$t1627);}
{const $t1628=[];e.set("kinds",$t1628);}
for(const $t1629 of $iter($call(e.get("range"),[$call(e.get("len"),[e.get("rolls")],$dict([]))],$dict([])))){e.set("i",$t1629);{const $t1630=$item(e.get("rolls"),e.get("i"));{const $t1631=Array.from($iter($t1630));e.set("kind",$t1631[0]);e.set("chance",$t1631[1]);}}
if($truth($compare([()=>$call(e.get("len"),[e.get("chosen")],$dict([])),()=>3], ["GtE"]))){break;}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("kind"),()=>e.get("kinds")], ["NotIn"]),()=>$compare([()=>$call(e.get("_hash"),[e.get("x"),e.get("y"),e.get("seed"),$bin("Add",100,e.get("i"))],$dict([])),()=>e.get("chance")], ["Lt"])]))){{const $t1632=$bin("Mult",$item($item(e.get("RESOURCE_INFO"),e.get("kind")),3),$bin("Add",0.55,$bin("Mult",0.9,$call(e.get("_hash"),[e.get("x"),e.get("y"),e.get("seed"),$bin("Add",200,e.get("i"))],$dict([])))));e.set("cap",$t1632);}
if($truth($compare([()=>e.get("kind"),()=>"grain"], ["Eq"]))){{const $t1633=$bin("Mult",$bin("Mult",e.get("cap"),$bin("Add",0.6,$bin("Mult",0.8,e.get("tile_soil")))),($truth($compare([()=>"f",()=>e.get("f")], ["In"]))?1.3:1.0));e.set("cap",$t1633);}
}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("kind"),()=>"fish"], ["Eq"]),()=>$compare([()=>"d",()=>e.get("f")], ["In"])]))){{const $t1634=$bin("Mult",e.get("cap"),1.3);e.set("cap",$t1634);}
}else{}
$call($get(e.get("kinds"),"append"),[e.get("kind")],$dict([]));
$call($get(e.get("chosen"),"append"),[$tuple([e.get("kind"),$call(e.get("int"),[e.get("cap")],$dict([]))])],$dict([]));
}else{}
}
if($truth(e.get("chosen"))){{const $t1635=e.get("chosen");$setitem(e.get("out"),$bin("Add",$bin("Mult",e.get("y"),e.get("W")),e.get("x")),$t1635);}
}else{}
}
}
return e.get("out");return null;}));
e.set("_build",$fn("_build",e,["seed"],[undefined],null,null,[],[],e=>{{const $t1636=$call(e.get("_lattice"),[e.get("seed"),1,30],$dict([]));e.set("l1",$t1636);}
{const $t1637=$call(e.get("_lattice"),[e.get("seed"),2,15],$dict([]));e.set("l2",$t1637);}
{const $t1638=$call(e.get("_lattice"),[e.get("seed"),3,8],$dict([]));e.set("l3",$t1638);}
{const $t1639=$call(e.get("_lattice"),[e.get("seed"),12,4],$dict([]));e.set("l4",$t1639);}
{const $t1640=$call(e.get("_lattice"),[e.get("seed"),9,20],$dict([]));e.set("warp_x",$t1640);}
{const $t1641=$call(e.get("_lattice"),[e.get("seed"),10,20],$dict([]));e.set("warp_y",$t1641);}
{const $t1642=$call(e.get("_lattice"),[e.get("seed"),6,22],$dict([]));e.set("ridge",$t1642);}
{const $t1643=$call(e.get("_lattice"),[e.get("seed"),4,24],$dict([]));e.set("wet1",$t1643);}
{const $t1644=$call(e.get("_lattice"),[e.get("seed"),5,9],$dict([]));e.set("wet2",$t1644);}
{const $t1645=$call(e.get("_lattice"),[e.get("seed"),7,18],$dict([]));e.set("heat",$t1645);}
{const $t1646=$call(e.get("_continents"),[e.get("seed")],$dict([]));e.set("continents",$t1646);}
{const $t1647=$call(e.get("_satellites"),[e.get("seed"),e.get("continents")],$dict([]));e.set("lobes",$t1647);}
{const $t1648=$call(e.get("_archipelagos"),[e.get("seed"),$bin("Add",e.get("continents"),e.get("lobes"))],$dict([]));e.set("islands",$t1648);}
{const $t1649=[];e.set("gulfs",$t1649);}
for(const $t1650 of $iter($call(e.get("range"),[$call(e.get("len"),[e.get("continents")],$dict([]))],$dict([])))){e.set("i",$t1650);{const $t1651=$item(e.get("continents"),e.get("i"));{const $t1652=Array.from($iter($t1651));e.set("cx",$t1652[0]);e.set("cy",$t1652[1]);e.set("r",$t1652[2]);}}
if($truth($compare([()=>e.get("r"),()=>17], ["Gt"]))){$call($get(e.get("gulfs"),"append"),[$tuple([$bin("Add",e.get("cx"),$bin("Mult",$bin("Mult",$bin("Sub",$call(e.get("_hash"),[e.get("i"),7,e.get("seed"),81],$dict([])),0.5),e.get("r")),0.9)),$bin("Add",e.get("cy"),$bin("Mult",$bin("Mult",$bin("Sub",$call(e.get("_hash"),[e.get("i"),8,e.get("seed"),82],$dict([])),0.5),e.get("r")),0.9)),$bin("Add",3.5,$bin("Mult",$call(e.get("_hash"),[e.get("i"),9,e.get("seed"),83],$dict([])),4.5))])],$dict([]));
}else{}
}
{const $t1653=[];e.set("elev",$t1653);}
for(const $t1654 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("y",$t1654);{const $t1655=[];e.set("row",$t1655);}
for(const $t1656 of $iter($call(e.get("range"),[e.get("W")],$dict([])))){e.set("x",$t1656);{const $t1657=$bin("Add",$bin("Add",e.get("x"),$bin("Mult",$bin("Sub",$call(e.get("_sample"),[e.get("warp_x"),e.get("x"),e.get("y"),20],$dict([])),0.5),14)),$bin("Mult",$bin("Sub",$call(e.get("_sample"),[e.get("l4"),e.get("x"),e.get("y"),4],$dict([])),0.5),4));e.set("wx",$t1657);}
{const $t1658=$bin("Add",$bin("Add",e.get("y"),$bin("Mult",$bin("Sub",$call(e.get("_sample"),[e.get("warp_y"),e.get("x"),e.get("y"),20],$dict([])),0.5),14)),$bin("Mult",$bin("Sub",$call(e.get("_sample"),[e.get("l3"),e.get("x"),e.get("y"),8],$dict([])),0.5),4));e.set("wy",$t1658);}
{const $t1659=0.0;e.set("field",$t1659);}
for(const $t1660 of $iter($bin("Add",e.get("continents"),e.get("lobes")))){{const $t1661=Array.from($iter($t1660));e.set("cx",$t1661[0]);e.set("cy",$t1661[1]);e.set("r",$t1661[2]);}{const $t1662=$bin("Div",$bin("Pow",$bin("Add",$bin("Pow",$bin("Sub",e.get("wx"),e.get("cx")),2),$bin("Pow",$bin("Sub",e.get("wy"),e.get("cy")),2)),0.5),e.get("r"));e.set("d",$t1662);}
if($truth($boolop("And",[()=>$compare([()=>e.get("d"),()=>1], ["Lt"]),()=>$compare([()=>$bin("Sub",1,$bin("Mult",e.get("d"),e.get("d"))),()=>e.get("field")], ["Gt"])]))){{const $t1663=$bin("Sub",1,$bin("Mult",e.get("d"),e.get("d")));e.set("field",$t1663);}
}else{}
}
for(const $t1664 of $iter(e.get("islands"))){{const $t1665=Array.from($iter($t1664));e.set("cx",$t1665[0]);e.set("cy",$t1665[1]);e.set("r",$t1665[2]);}{const $t1666=$bin("Div",$bin("Pow",$bin("Add",$bin("Pow",$bin("Sub",e.get("wx"),e.get("cx")),2),$bin("Pow",$bin("Sub",e.get("wy"),e.get("cy")),2)),0.5),e.get("r"));e.set("d",$t1666);}
if($truth($boolop("And",[()=>$compare([()=>e.get("d"),()=>1], ["Lt"]),()=>$compare([()=>$bin("Mult",$bin("Sub",1,$bin("Mult",e.get("d"),e.get("d"))),0.95),()=>e.get("field")], ["Gt"])]))){{const $t1667=$bin("Mult",$bin("Sub",1,$bin("Mult",e.get("d"),e.get("d"))),0.95);e.set("field",$t1667);}
}else{}
}
for(const $t1668 of $iter(e.get("gulfs"))){{const $t1669=Array.from($iter($t1668));e.set("cx",$t1669[0]);e.set("cy",$t1669[1]);e.set("r",$t1669[2]);}{const $t1670=$bin("Div",$bin("Pow",$bin("Add",$bin("Pow",$bin("Sub",e.get("wx"),e.get("cx")),2),$bin("Pow",$bin("Sub",e.get("wy"),e.get("cy")),2)),0.5),e.get("r"));e.set("d",$t1670);}
if($truth($compare([()=>e.get("d"),()=>1], ["Lt"]))){e.set("field",$aug("Sub",e.get("field"),$bin("Mult",$bin("Sub",1,$bin("Mult",e.get("d"),e.get("d"))),0.75)));}else{}
}
if($truth($compare([()=>e.get("field"),()=>0], ["Lt"]))){{const $t1671=0.0;e.set("field",$t1671);}
}else{}
{const $t1672=$bin("Add",$bin("Add",$bin("Add",$bin("Mult",0.4,$call(e.get("_sample"),[e.get("l1"),e.get("x"),e.get("y"),30],$dict([]))),$bin("Mult",0.3,$call(e.get("_sample"),[e.get("l2"),e.get("x"),e.get("y"),15],$dict([])))),$bin("Mult",0.2,$call(e.get("_sample"),[e.get("l3"),e.get("x"),e.get("y"),8],$dict([])))),$bin("Mult",0.1,$call(e.get("_sample"),[e.get("l4"),e.get("x"),e.get("y"),4],$dict([]))));e.set("fbm",$t1672);}
{const $t1673=$bin("Sub",1,$call(e.get("abs"),[$bin("Sub",$bin("Mult",2,$call(e.get("_sample"),[e.get("ridge"),e.get("x"),e.get("y"),22],$dict([]))),1)],$dict([])));e.set("spine",$t1673);}
$call($get(e.get("row"),"append"),[$bin("Add",$bin("Add",$bin("Sub",$bin("Add",$bin("Mult",0.44,e.get("field")),$bin("Mult",0.56,e.get("fbm"))),0.02),$bin("Mult",$bin("Mult",$bin("Mult",$call(e.get("max"),[0,$bin("Sub",e.get("field"),0.5)],$dict([])),e.get("spine")),e.get("spine")),0.25)),$bin("Mult",$bin("Mult",$call(e.get("max"),[0,$bin("Sub",e.get("field"),0.3)],$dict([])),$bin("Pow",e.get("spine"),3)),0.45))],$dict([]));
}
$call($get(e.get("elev"),"append"),[e.get("row")],$dict([]));
}
{const $t1674=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1676 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("y",$t1676);yield Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1675 of $iter($call(e.get("range"),[e.get("W")],$dict([])))){e.set("x",$t1675);yield $compare([()=>$item($item(e.get("elev"),e.get("y")),e.get("x")),()=>e.get("SEA_LEVEL")], ["Lt"]);}})();})(e));}})();})(e));e.set("sea",$t1674);}
{const $t1677=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1678 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("_",$t1678);yield $bin("Mult",[false],e.get("W"));}})();})(e));e.set("reached",$t1677);}
{const $t1679=[];e.set("stack",$t1679);}
for(const $t1680 of $iter($call(e.get("range"),[e.get("W")],$dict([])))){e.set("x",$t1680);for(const $t1681 of $iter($tuple([0,$bin("Sub",e.get("H"),1)]))){e.set("y",$t1681);if($truth($boolop("And",[()=>$item($item(e.get("sea"),e.get("y")),e.get("x")),()=>$un("Not",$item($item(e.get("reached"),e.get("y")),e.get("x")))]))){{const $t1682=true;$setitem($item(e.get("reached"),e.get("y")),e.get("x"),$t1682);}
$call($get(e.get("stack"),"append"),[$tuple([e.get("x"),e.get("y")])],$dict([]));
}else{}
}
}
for(const $t1683 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("y",$t1683);for(const $t1684 of $iter($tuple([0,$bin("Sub",e.get("W"),1)]))){e.set("x",$t1684);if($truth($boolop("And",[()=>$item($item(e.get("sea"),e.get("y")),e.get("x")),()=>$un("Not",$item($item(e.get("reached"),e.get("y")),e.get("x")))]))){{const $t1685=true;$setitem($item(e.get("reached"),e.get("y")),e.get("x"),$t1685);}
$call($get(e.get("stack"),"append"),[$tuple([e.get("x"),e.get("y")])],$dict([]));
}else{}
}
}
while($truth(e.get("stack"))){{const $t1686=$call($get(e.get("stack"),"pop"),[],$dict([]));{const $t1687=Array.from($iter($t1686));e.set("cx",$t1687[0]);e.set("cy",$t1687[1]);}}
for(const $t1688 of $iter($tuple([$tuple([$bin("Add",e.get("cx"),1),e.get("cy")]),$tuple([$bin("Sub",e.get("cx"),1),e.get("cy")]),$tuple([e.get("cx"),$bin("Add",e.get("cy"),1)]),$tuple([e.get("cx"),$bin("Sub",e.get("cy"),1)])]))){{const $t1689=Array.from($iter($t1688));e.set("nx",$t1689[0]);e.set("ny",$t1689[1]);}if($truth($boolop("And",[()=>$compare([()=>0,()=>e.get("nx"),()=>e.get("W")], ["LtE", "Lt"]),()=>$compare([()=>0,()=>e.get("ny"),()=>e.get("H")], ["LtE", "Lt"]),()=>$item($item(e.get("sea"),e.get("ny")),e.get("nx")),()=>$un("Not",$item($item(e.get("reached"),e.get("ny")),e.get("nx")))]))){{const $t1690=true;$setitem($item(e.get("reached"),e.get("ny")),e.get("nx"),$t1690);}
$call($get(e.get("stack"),"append"),[$tuple([e.get("nx"),e.get("ny")])],$dict([]));
}else{}
}
}
{const $t1691=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1692 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("_",$t1692);yield $bin("Mult",[$un("USub",1)],e.get("W"));}})();})(e));e.set("water_dist",$t1691);}
{const $t1693=[];e.set("frontier",$t1693);}
for(const $t1694 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("y",$t1694);for(const $t1695 of $iter($call(e.get("range"),[e.get("W")],$dict([])))){e.set("x",$t1695);if($truth($item($item(e.get("sea"),e.get("y")),e.get("x")))){{const $t1696=0;$setitem($item(e.get("water_dist"),e.get("y")),e.get("x"),$t1696);}
$call($get(e.get("frontier"),"append"),[$tuple([e.get("x"),e.get("y")])],$dict([]));
}else{}
}
}
while($truth(e.get("frontier"))){{const $t1697=[];e.set("following",$t1697);}
for(const $t1698 of $iter(e.get("frontier"))){{const $t1699=Array.from($iter($t1698));e.set("cx",$t1699[0]);e.set("cy",$t1699[1]);}for(const $t1700 of $iter($tuple([$tuple([$bin("Add",e.get("cx"),1),e.get("cy")]),$tuple([$bin("Sub",e.get("cx"),1),e.get("cy")]),$tuple([e.get("cx"),$bin("Add",e.get("cy"),1)]),$tuple([e.get("cx"),$bin("Sub",e.get("cy"),1)])]))){{const $t1701=Array.from($iter($t1700));e.set("nx",$t1701[0]);e.set("ny",$t1701[1]);}if($truth($boolop("And",[()=>$compare([()=>0,()=>e.get("nx"),()=>e.get("W")], ["LtE", "Lt"]),()=>$compare([()=>0,()=>e.get("ny"),()=>e.get("H")], ["LtE", "Lt"]),()=>$compare([()=>$item($item(e.get("water_dist"),e.get("ny")),e.get("nx")),()=>0], ["Lt"])]))){{const $t1702=$bin("Add",$item($item(e.get("water_dist"),e.get("cy")),e.get("cx")),1);$setitem($item(e.get("water_dist"),e.get("ny")),e.get("nx"),$t1702);}
$call($get(e.get("following"),"append"),[$tuple([e.get("nx"),e.get("ny")])],$dict([]));
}else{}
}
}
{const $t1703=e.get("following");e.set("frontier",$t1703);}
}
{const $t1704=[];e.set("rows",$t1704);}
{const $t1705=[];e.set("temps",$t1705);}
{const $t1706=[];e.set("wets",$t1706);}
for(const $t1707 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("y",$t1707);{const $t1708=[];e.set("row",$t1708);}
{const $t1709=[];e.set("trow",$t1709);}
{const $t1710=[];e.set("wrow",$t1710);}
{const $t1711=$bin("Div",$call(e.get("abs"),[$bin("Add",$bin("Sub",e.get("y"),$bin("Div",e.get("H"),2)),0.5)],$dict([])),$bin("Div",e.get("H"),2));e.set("latitude",$t1711);}
for(const $t1712 of $iter($call(e.get("range"),[e.get("W")],$dict([])))){e.set("x",$t1712);{const $t1713=$item($item(e.get("elev"),e.get("y")),e.get("x"));e.set("e",$t1713);}
{const $t1714=$bin("Add",$bin("Sub",$bin("Sub",1.05,$bin("Mult",e.get("latitude"),0.9)),$bin("Mult",$call(e.get("max"),[0,$bin("Sub",e.get("e"),0.62)],$dict([])),1.2)),$bin("Mult",$bin("Sub",$call(e.get("_sample"),[e.get("heat"),e.get("x"),e.get("y"),18],$dict([])),0.5),0.35));e.set("temp",$t1714);}
{const $t1715=$bin("Add",$bin("Add",$bin("Mult",0.34,$call(e.get("_sample"),[e.get("wet1"),e.get("x"),e.get("y"),24],$dict([]))),$bin("Mult",0.14,$call(e.get("_sample"),[e.get("wet2"),e.get("x"),e.get("y"),9],$dict([])))),$bin("Mult",0.52,$call(e.get("max"),[0.0,$bin("Sub",1,$bin("Div",$item($item(e.get("water_dist"),e.get("y")),e.get("x")),12))],$dict([]))));e.set("wet",$t1715);}
$call($get(e.get("trow"),"append"),[e.get("temp")],$dict([]));
$call($get(e.get("wrow"),"append"),[e.get("wet")],$dict([]));
if($truth($item($item(e.get("sea"),e.get("y")),e.get("x")))){$call($get(e.get("row"),"append"),[($truth($item($item(e.get("reached"),e.get("y")),e.get("x")))?"ocean":"lake")],$dict([]));
}else{if($truth($compare([()=>e.get("e"),()=>0.84], ["Gt"]))){$call($get(e.get("row"),"append"),["mountains"],$dict([]));
}else{if($truth($compare([()=>e.get("e"),()=>0.72], ["Gt"]))){$call($get(e.get("row"),"append"),["hills"],$dict([]));
}else{if($truth($compare([()=>e.get("temp"),()=>0.26], ["Lt"]))){$call($get(e.get("row"),"append"),["tundra"],$dict([]));
}else{if($truth($boolop("And",[()=>$compare([()=>e.get("wet"),()=>0.3], ["Lt"]),()=>$compare([()=>e.get("temp"),()=>0.42], ["Gt"])]))){$call($get(e.get("row"),"append"),["desert"],$dict([]));
}else{if($truth($boolop("And",[()=>$compare([()=>e.get("wet"),()=>0.72], ["Gt"]),()=>$compare([()=>e.get("e"),()=>0.56], ["Lt"])]))){$call($get(e.get("row"),"append"),["swamp"],$dict([]));
}else{if($truth($compare([()=>e.get("wet"),()=>0.58], ["Gt"]))){$call($get(e.get("row"),"append"),["forest"],$dict([]));
}else{$call($get(e.get("row"),"append"),["plains"],$dict([]));
}
}
}
}
}
}
}
}
$call($get(e.get("rows"),"append"),[e.get("row")],$dict([]));
$call($get(e.get("temps"),"append"),[e.get("trow")],$dict([]));
$call($get(e.get("wets"),"append"),[e.get("wrow")],$dict([]));
}
{const $t1716=[];e.set("slope",$t1716);}
for(const $t1717 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("y",$t1717);{const $t1718=[];e.set("srow",$t1718);}
for(const $t1719 of $iter($call(e.get("range"),[e.get("W")],$dict([])))){e.set("x",$t1719);{const $t1720=$item($item(e.get("elev"),e.get("y")),e.get("x"));e.set("e",$t1720);}
{const $t1721=0.0;e.set("top",$t1721);}
for(const $t1722 of $iter($tuple([$tuple([$bin("Add",e.get("x"),1),e.get("y")]),$tuple([$bin("Sub",e.get("x"),1),e.get("y")]),$tuple([e.get("x"),$bin("Add",e.get("y"),1)]),$tuple([e.get("x"),$bin("Sub",e.get("y"),1)])]))){{const $t1723=Array.from($iter($t1722));e.set("nx",$t1723[0]);e.set("ny",$t1723[1]);}if($truth($boolop("And",[()=>$compare([()=>0,()=>e.get("nx"),()=>e.get("W")], ["LtE", "Lt"]),()=>$compare([()=>0,()=>e.get("ny"),()=>e.get("H")], ["LtE", "Lt"])]))){{const $t1724=$call(e.get("abs"),[$bin("Sub",$item($item(e.get("elev"),e.get("ny")),e.get("nx")),e.get("e"))],$dict([]));e.set("d",$t1724);}
if($truth($compare([()=>e.get("d"),()=>e.get("top")], ["Gt"]))){{const $t1725=e.get("d");e.set("top",$t1725);}
}else{}
}else{}
}
$call($get(e.get("srow"),"append"),[e.get("top")],$dict([]));
}
$call($get(e.get("slope"),"append"),[e.get("srow")],$dict([]));
}
{const $t1726=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1727 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("_",$t1727);yield $bin("Mult",[false],e.get("W"));}})();})(e));e.set("river",$t1726);}
for(const $t1728 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("y",$t1728);for(const $t1729 of $iter($call(e.get("range"),[e.get("W")],$dict([])))){e.set("x",$t1729);if($truth($boolop("And",[()=>$compare([()=>$item($item(e.get("rows"),e.get("y")),e.get("x")),()=>$tuple(["hills","mountains"])], ["In"]),()=>$compare([()=>$item($item(e.get("elev"),e.get("y")),e.get("x")),()=>0.72], ["Gt"]),()=>$compare([()=>$call(e.get("_hash"),[e.get("x"),e.get("y"),e.get("seed"),11],$dict([])),()=>0.035], ["Lt"])]))){{const $t1730=e.get("x");e.set("cx",$t1730);}
{const $t1731=e.get("y");e.set("cy",$t1731);}
for(const $t1732 of $iter($call(e.get("range"),[180],$dict([])))){e.set("_",$t1732);{const $t1733=true;$setitem($item(e.get("river"),e.get("cy")),e.get("cx"),$t1733);}
{const $t1734=null;e.set("best",$t1734);}
{const $t1735=$item($item(e.get("elev"),e.get("cy")),e.get("cx"));e.set("lowest",$t1735);}
for(const $t1736 of $iter(e.get("OFFSETS"))){{const $t1737=Array.from($iter($t1736));e.set("nx",$t1737[0]);e.set("ny",$t1737[1]);}e.set("nx",$aug("Add",e.get("nx"),e.get("cx")));e.set("ny",$aug("Add",e.get("ny"),e.get("cy")));if($truth($boolop("And",[()=>$compare([()=>0,()=>e.get("nx"),()=>e.get("W")], ["LtE", "Lt"]),()=>$compare([()=>0,()=>e.get("ny"),()=>e.get("H")], ["LtE", "Lt"])]))){{const $t1738=$bin("Sub",$item($item(e.get("elev"),e.get("ny")),e.get("nx")),$bin("Mult",$call(e.get("_hash"),[e.get("nx"),e.get("ny"),e.get("seed"),12],$dict([])),0.004));e.set("level",$t1738);}
if($truth($compare([()=>e.get("level"),()=>e.get("lowest")], ["Lt"]))){{const $t1739=e.get("level");e.set("lowest",$t1739);}
{const $t1740=$tuple([e.get("nx"),e.get("ny")]);e.set("best",$t1740);}
}else{}
}else{}
}
if($truth($compare([()=>e.get("best"),()=>null], ["Is"]))){break;}else{}
{const $t1741=e.get("best");{const $t1742=Array.from($iter($t1741));e.set("cx",$t1742[0]);e.set("cy",$t1742[1]);}}
if($truth($boolop("Or",[()=>$compare([()=>$item($item(e.get("rows"),e.get("cy")),e.get("cx")),()=>e.get("WATER")], ["In"]),()=>$item($item(e.get("river"),e.get("cy")),e.get("cx"))]))){break;}else{}
}
}else{}
}
}
{const $t1743=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1744 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("_",$t1744);yield $bin("Mult",[0],e.get("W"));}})();})(e));e.set("comp",$t1743);}
{const $t1745=$dict([]);e.set("sizes",$t1745);}
{const $t1746=0;e.set("count",$t1746);}
for(const $t1747 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("y",$t1747);for(const $t1748 of $iter($call(e.get("range"),[e.get("W")],$dict([])))){e.set("x",$t1748);if($truth($boolop("Or",[()=>$compare([()=>$item($item(e.get("rows"),e.get("y")),e.get("x")),()=>e.get("WATER")], ["In"]),()=>$item($item(e.get("comp"),e.get("y")),e.get("x"))]))){continue;}else{}
e.set("count",$aug("Add",e.get("count"),1));{const $t1749=e.get("count");$setitem($item(e.get("comp"),e.get("y")),e.get("x"),$t1749);}
{const $t1750=1;e.set("total",$t1750);}
{const $t1751=[$tuple([e.get("x"),e.get("y")])];e.set("stack",$t1751);}
while($truth(e.get("stack"))){{const $t1752=$call($get(e.get("stack"),"pop"),[],$dict([]));{const $t1753=Array.from($iter($t1752));e.set("cx",$t1753[0]);e.set("cy",$t1753[1]);}}
for(const $t1754 of $iter($tuple([$tuple([$bin("Add",e.get("cx"),1),e.get("cy")]),$tuple([$bin("Sub",e.get("cx"),1),e.get("cy")]),$tuple([e.get("cx"),$bin("Add",e.get("cy"),1)]),$tuple([e.get("cx"),$bin("Sub",e.get("cy"),1)])]))){{const $t1755=Array.from($iter($t1754));e.set("nx",$t1755[0]);e.set("ny",$t1755[1]);}if($truth($boolop("And",[()=>$compare([()=>0,()=>e.get("nx"),()=>e.get("W")], ["LtE", "Lt"]),()=>$compare([()=>0,()=>e.get("ny"),()=>e.get("H")], ["LtE", "Lt"]),()=>$compare([()=>$item($item(e.get("rows"),e.get("ny")),e.get("nx")),()=>e.get("WATER")], ["NotIn"]),()=>$un("Not",$item($item(e.get("comp"),e.get("ny")),e.get("nx")))]))){{const $t1756=e.get("count");$setitem($item(e.get("comp"),e.get("ny")),e.get("nx"),$t1756);}
e.set("total",$aug("Add",e.get("total"),1));$call($get(e.get("stack"),"append"),[$tuple([e.get("nx"),e.get("ny")])],$dict([]));
}else{}
}
}
{const $t1757=e.get("total");$setitem(e.get("sizes"),e.get("count"),$t1757);}
}
}
{const $t1758=[];e.set("soil",$t1758);}
{const $t1759=[];e.set("feat",$t1759);}
{const $t1760=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1762 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("y",$t1762);yield Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1761 of $iter($call(e.get("range"),[e.get("W")],$dict([])))){e.set("x",$t1761);yield $call(e.get("_near_water"),[e.get("rows"),e.get("x"),e.get("y"),1],$dict([]));}})();})(e));}})();})(e));e.set("near_water",$t1760);}
{const $t1763=$dict([["plains",0.2],["forest",0.05],["swamp",0.1],["hills",$un("USub",0.1)],["mountains",$un("USub",0.25)],["desert",$un("USub",0.3)],["tundra",$un("USub",0.25)]]);e.set("adjust",$t1763);}
for(const $t1764 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("y",$t1764);{const $t1765=[];e.set("srow",$t1765);}
{const $t1766=[];e.set("frow",$t1766);}
for(const $t1767 of $iter($call(e.get("range"),[e.get("W")],$dict([])))){e.set("x",$t1767);{const $t1768=$item($item(e.get("rows"),e.get("y")),e.get("x"));e.set("t",$t1768);}
if($truth($compare([()=>e.get("t"),()=>e.get("WATER")], ["In"]))){$call($get(e.get("srow"),"append"),[0.0],$dict([]));
$call($get(e.get("frow"),"append"),[""],$dict([]));
continue;}else{}
{const $t1769=$call(e.get("_near_flag"),[e.get("river"),e.get("x"),e.get("y"),1],$dict([]));e.set("by_river",$t1769);}
$call($get(e.get("srow"),"append"),[$call(e.get("max"),[0.0,$call(e.get("min"),[1.0,$bin("Add",$bin("Add",$bin("Add",0.25,$bin("Mult",$item($item(e.get("wets"),e.get("y")),e.get("x")),0.5)),($truth(e.get("by_river"))?0.25:0)),$item(e.get("adjust"),e.get("t")))],$dict([]))],$dict([]))],$dict([]));
{const $t1770="";e.set("tags",$t1770);}
{const $t1771=$call(e.get("_hash"),[e.get("x"),e.get("y"),e.get("seed"),31],$dict([]));e.set("h",$t1771);}
{const $t1772=0;e.set("water8",$t1772);}
{const $t1773=0;e.set("mountains8",$t1773);}
for(const $t1774 of $iter(e.get("OFFSETS"))){{const $t1775=Array.from($iter($t1774));e.set("dx",$t1775[0]);e.set("dy",$t1775[1]);}{const $t1776=$bin("Add",e.get("x"),e.get("dx"));e.set("nx",$t1776);}
{const $t1777=$bin("Add",e.get("y"),e.get("dy"));e.set("ny",$t1777);}
if($truth($boolop("And",[()=>$compare([()=>0,()=>e.get("nx"),()=>e.get("W")], ["LtE", "Lt"]),()=>$compare([()=>0,()=>e.get("ny"),()=>e.get("H")], ["LtE", "Lt"])]))){if($truth($compare([()=>$item($item(e.get("rows"),e.get("ny")),e.get("nx")),()=>e.get("WATER")], ["In"]))){e.set("water8",$aug("Add",e.get("water8"),1));}else{}
if($truth($compare([()=>$item($item(e.get("rows"),e.get("ny")),e.get("nx")),()=>"mountains"], ["Eq"]))){e.set("mountains8",$aug("Add",e.get("mountains8"),1));}else{}
}else{}
}
if($truth($boolop("And",[()=>$compare([()=>e.get("t"),()=>$tuple(["plains","swamp"])], ["In"]),()=>e.get("by_river"),()=>$compare([()=>e.get("h"),()=>0.75], ["Lt"])]))){e.set("tags",$aug("Add",e.get("tags"),"f"));}else{}
if($truth($boolop("And",[()=>$item($item(e.get("river"),e.get("y")),e.get("x")),()=>$compare([()=>e.get("water8"),()=>0], ["Gt"])]))){e.set("tags",$aug("Add",e.get("tags"),"d"));}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("water8"),()=>$tuple([3,4,5])], ["In"]),()=>$compare([()=>e.get("h"),()=>0.45], ["Gt"])]))){e.set("tags",$aug("Add",e.get("tags"),"b"));}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("t"),()=>"desert"], ["Eq"]),()=>$boolop("Or",[()=>e.get("by_river"),()=>$compare([()=>e.get("h"),()=>0.05], ["Lt"])])]))){e.set("tags",$aug("Add",e.get("tags"),"o"));}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("t"),()=>$tuple(["hills","mountains"])], ["In"]),()=>$compare([()=>$call(e.get("_hash"),[e.get("x"),e.get("y"),e.get("seed"),32],$dict([])),()=>0.045], ["Lt"])]))){e.set("tags",$aug("Add",e.get("tags"),"s"));}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("t"),()=>"hills"], ["Eq"]),()=>$compare([()=>e.get("mountains8"),()=>3], ["GtE"])]))){e.set("tags",$aug("Add",e.get("tags"),"p"));}else{}
$call($get(e.get("frow"),"append"),[e.get("tags")],$dict([]));
}
$call($get(e.get("soil"),"append"),[e.get("srow")],$dict([]));
$call($get(e.get("feat"),"append"),[e.get("frow")],$dict([]));
}
{const $t1778=$call(e.get("_layout_deposits"),[e.get("rows"),e.get("river"),e.get("soil"),e.get("feat"),e.get("near_water"),e.get("seed")],$dict([]));e.set("deposits",$t1778);}
{const $t1779=$dict([["forest",$call(e.get("_integral"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1781 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("y",$t1781);yield Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1780 of $iter($call(e.get("range"),[e.get("W")],$dict([])))){e.set("x",$t1780);yield $compare([()=>$item($item(e.get("rows"),e.get("y")),e.get("x")),()=>"forest"], ["Eq"]);}})();})(e));}})();})(e))],$dict([]))],["wild",$call(e.get("_integral"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1783 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("y",$t1783);yield Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1782 of $iter($call(e.get("range"),[e.get("W")],$dict([])))){e.set("x",$t1782);yield $compare([()=>$item($item(e.get("rows"),e.get("y")),e.get("x")),()=>$tuple(["forest","desert"])], ["In"]);}})();})(e));}})();})(e))],$dict([]))],["high",$call(e.get("_integral"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1785 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("y",$t1785);yield Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1784 of $iter($call(e.get("range"),[e.get("W")],$dict([])))){e.set("x",$t1784);yield $compare([()=>$item($item(e.get("rows"),e.get("y")),e.get("x")),()=>$tuple(["hills","mountains"])], ["In"]);}})();})(e));}})();})(e))],$dict([]))],["river",$call(e.get("_integral"),[e.get("river")],$dict([]))],["lake",$call(e.get("_integral"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1787 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("y",$t1787);yield Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1786 of $iter($call(e.get("range"),[e.get("W")],$dict([])))){e.set("x",$t1786);yield $compare([()=>$item($item(e.get("rows"),e.get("y")),e.get("x")),()=>"lake"], ["Eq"]);}})();})(e));}})();})(e))],$dict([]))],["ocean",$call(e.get("_integral"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1789 of $iter($call(e.get("range"),[e.get("H")],$dict([])))){e.set("y",$t1789);yield Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1788 of $iter($call(e.get("range"),[e.get("W")],$dict([])))){e.set("x",$t1788);yield $compare([()=>$item($item(e.get("rows"),e.get("y")),e.get("x")),()=>"ocean"], ["Eq"]);}})();})(e));}})();})(e))],$dict([]))]]);e.set("hz",$t1779);}
return $dict([["terrain",e.get("rows")],["land",e.get("comp")],["elev",e.get("elev")],["river",e.get("river")],["deposits",e.get("deposits")],["soil",e.get("soil")],["feat",e.get("feat")],["wet",e.get("wets")],["slope",e.get("slope")],["temp",e.get("temps")],["size",e.get("sizes")],["hz",e.get("hz")]]);return null;}));
e.set("_near_flag",$fn("_near_flag",e,["grid", "x", "y", "r"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{for(const $t1790 of $iter($call(e.get("range"),[$call(e.get("max"),[0,$bin("Sub",e.get("y"),e.get("r"))],$dict([])),$call(e.get("min"),[e.get("H"),$bin("Add",$bin("Add",e.get("y"),e.get("r")),1)],$dict([]))],$dict([])))){e.set("yy",$t1790);for(const $t1791 of $iter($call(e.get("range"),[$call(e.get("max"),[0,$bin("Sub",e.get("x"),e.get("r"))],$dict([])),$call(e.get("min"),[e.get("W"),$bin("Add",$bin("Add",e.get("x"),e.get("r")),1)],$dict([]))],$dict([])))){e.set("xx",$t1791);if($truth($item($item(e.get("grid"),e.get("yy")),e.get("xx")))){return true;}else{}
}
}
return false;return null;}));
e.set("_near_water",$fn("_near_water",e,["rows", "x", "y", "r"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{for(const $t1792 of $iter($call(e.get("range"),[$call(e.get("max"),[0,$bin("Sub",e.get("y"),e.get("r"))],$dict([])),$call(e.get("min"),[e.get("H"),$bin("Add",$bin("Add",e.get("y"),e.get("r")),1)],$dict([]))],$dict([])))){e.set("yy",$t1792);for(const $t1793 of $iter($call(e.get("range"),[$call(e.get("max"),[0,$bin("Sub",e.get("x"),e.get("r"))],$dict([])),$call(e.get("min"),[e.get("W"),$bin("Add",$bin("Add",e.get("x"),e.get("r")),1)],$dict([]))],$dict([])))){e.set("xx",$t1793);if($truth($compare([()=>$item($item(e.get("rows"),e.get("yy")),e.get("xx")),()=>e.get("WATER")], ["In"]))){return true;}else{}
}
}
return false;return null;}));
e.set("world",$fn("world",e,["sim"],[undefined],null,null,[],[],e=>{{const $t1794=$call(e.get("getattr"),[e.get("sim"),"geo_seed",0],$dict([]));e.set("seed",$t1794);}
if($truth($compare([()=>e.get("seed"),()=>e.get("_CACHE")], ["NotIn"]))){{const $t1795=$call(e.get("_build"),[e.get("seed")],$dict([]));$setitem(e.get("_CACHE"),e.get("seed"),$t1795);}
}else{}
return $item(e.get("_CACHE"),e.get("seed"));return null;}));
e.set("_placed",$fn("_placed",e,["settlement"],[undefined],null,null,[],[],e=>{return $compare([()=>$call(e.get("getattr"),[e.get("settlement"),"gx",null],$dict([])),()=>null], ["IsNot"]);return null;}));
e.set("dist",$fn("dist",e,["ax", "ay", "bx", "by"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{return $bin("Pow",$bin("Add",$bin("Pow",$bin("Sub",e.get("ax"),e.get("bx")),2),$bin("Pow",$bin("Sub",e.get("ay"),e.get("by")),2)),0.5);return null;}));
e.set("reach",$fn("reach",e,["population"],[undefined],null,null,[],[],e=>{return $call(e.get("min"),[16.0,$bin("Add",4.0,$bin("Mult",$bin("Pow",e.get("population"),0.5),0.55))],$dict([]));return null;}));
e.set("settlement_counts",$fn("settlement_counts",e,["sim"],[undefined],null,null,[],[],e=>{return $call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t1796 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t1796);yield $get(e.get("p"),"settlement");}})();})(e)],$dict([]));return null;}));
e.set("_inhabited",$fn("_inhabited",e,["sim"],[undefined],null,null,[],[],e=>{$call(e.get("ensure_placed"),[e.get("sim")],$dict([]));
return Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1797 of $iter($call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([])))){e.set("s",$t1797);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("s"),"abandoned"),()=>null], ["Is"]),()=>$compare([()=>$get($item($get(e.get("sim"),"countries"),$get(e.get("s"),"country")),"ended"),()=>null], ["Is"])]))){yield e.get("s");}}})();})(e));return null;}));
e.set("claims_list",$fn("claims_list",e,["sim", "counts"],[undefined,undefined],null,null,[],[],e=>{{const $t1798=$item($call(e.get("world"),[e.get("sim")],$dict([])),"land");e.set("comp",$t1798);}
return Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1799 of $iter($call(e.get("_inhabited"),[e.get("sim")],$dict([])))){e.set("s",$t1799);yield $tuple([$get(e.get("s"),"country"),$get(e.get("s"),"gx"),$get(e.get("s"),"gy"),$call(e.get("reach"),[$call($get(e.get("counts"),"get"),[$get(e.get("s"),"id"),1],$dict([]))],$dict([])),$item($item(e.get("comp"),$get(e.get("s"),"gy")),$get(e.get("s"),"gx"))]);}})();})(e));return null;}));
e.set("cell_features",$fn("cell_features",e,["sim", "x", "y"],[undefined,undefined,undefined],null,null,[],[],e=>{{const $t1800=$call(e.get("world"),[e.get("sim")],$dict([]));e.set("geo",$t1800);}
return $dict([["terrain",$item($item($item(e.get("geo"),"terrain"),e.get("y")),e.get("x"))],["river",$item($item($item(e.get("geo"),"river"),e.get("y")),e.get("x"))],["deposits",$call($get($item(e.get("geo"),"deposits"),"get"),[$bin("Add",$bin("Mult",e.get("y"),e.get("W")),e.get("x")),[]],$dict([]))],["features",$item($item($item(e.get("geo"),"feat"),e.get("y")),e.get("x"))],["soil",$item($item($item(e.get("geo"),"soil"),e.get("y")),e.get("x"))],["coastal",$call(e.get("_near_water"),[$item(e.get("geo"),"terrain"),e.get("x"),e.get("y"),1],$dict([]))]]);return null;}));
e.set("resources_near",$fn("resources_near",e,["sim", "x", "y", "r"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t1801=$call(e.get("world"),[e.get("sim")],$dict([]));e.set("geo",$t1801);}
{const $t1802=$call(e.get("Counter"),[],$dict([]));e.set("found",$t1802);}
for(const $t1803 of $iter($call(e.get("range"),[$call(e.get("max"),[0,$bin("Sub",e.get("y"),e.get("r"))],$dict([])),$call(e.get("min"),[e.get("H"),$bin("Add",$bin("Add",e.get("y"),e.get("r")),1)],$dict([]))],$dict([])))){e.set("yy",$t1803);for(const $t1804 of $iter($call(e.get("range"),[$call(e.get("max"),[0,$bin("Sub",e.get("x"),e.get("r"))],$dict([])),$call(e.get("min"),[e.get("W"),$bin("Add",$bin("Add",e.get("x"),e.get("r")),1)],$dict([]))],$dict([])))){e.set("xx",$t1804);for(const $t1805 of $iter($call($get($item(e.get("geo"),"deposits"),"get"),[$bin("Add",$bin("Mult",e.get("yy"),e.get("W")),e.get("xx")),[]],$dict([])))){{const $t1806=Array.from($iter($t1805));e.set("kind",$t1806[0]);e.set("cap",$t1806[1]);}$setitem(e.get("found"),e.get("kind"),$aug("Add",$item(e.get("found"),e.get("kind")),1));}
}
}
return e.get("found");return null;}));
e.set("hazards_at",$fn("hazards_at",e,["sim", "x", "y"],[undefined,undefined,undefined],null,null,[],[],e=>{{const $t1807=$call(e.get("world"),[e.get("sim")],$dict([]));e.set("geo",$t1807);}
{const $t1808=$call(e.get("getattr"),[e.get("sim"),"geo_seed",0],$dict([]));e.set("seed",$t1808);}
{const $t1809=$tuple([e.get("seed"),e.get("x"),e.get("y")]);e.set("key",$t1809);}
if($truth($compare([()=>e.get("key"),()=>e.get("_HAZARDS")], ["In"]))){return $item(e.get("_HAZARDS"),e.get("key"));}else{}
{const $t1810=$item(e.get("geo"),"terrain");e.set("rows",$t1810);}
{const $t1811=$item(e.get("geo"),"hz");e.set("hz",$t1811);}
{const $t1812=$item($item(e.get("rows"),e.get("y")),e.get("x"));e.set("here",$t1812);}
{const $t1813=$item($item($item(e.get("geo"),"elev"),e.get("y")),e.get("x"));e.set("e",$t1813);}
{const $t1814=$bin("Mult",$bin("Sub",$call(e.get("min"),[e.get("W"),$bin("Add",e.get("x"),4)],$dict([])),$call(e.get("max"),[0,$bin("Sub",e.get("x"),3)],$dict([]))),$bin("Sub",$call(e.get("min"),[e.get("H"),$bin("Add",e.get("y"),4)],$dict([])),$call(e.get("max"),[0,$bin("Sub",e.get("y"),3)],$dict([]))));e.set("window",$t1814);}
{const $t1815=$call(e.get("_count"),[$item(e.get("hz"),"forest"),e.get("x"),e.get("y"),3],$dict([]));e.set("forest",$t1815);}
{const $t1816=$call(e.get("_count"),[$item(e.get("hz"),"wild"),e.get("x"),e.get("y"),3],$dict([]));e.set("wild",$t1816);}
{const $t1817=$call(e.get("_count"),[$item(e.get("hz"),"high"),e.get("x"),e.get("y"),3],$dict([]));e.set("highland",$t1817);}
{const $t1818=($truth($call(e.get("_count"),[$item(e.get("hz"),"river"),e.get("x"),e.get("y"),1],$dict([])))?1:0);e.set("river",$t1818);}
{const $t1819=($truth($call(e.get("_count"),[$item(e.get("hz"),"lake"),e.get("x"),e.get("y"),1],$dict([])))?1:0);e.set("lake",$t1819);}
{const $t1820=($truth($call(e.get("_count"),[$item(e.get("hz"),"ocean"),e.get("x"),e.get("y"),2],$dict([])))?1:0);e.set("ocean",$t1820);}
{const $t1821=($truth($boolop("Or",[()=>e.get("ocean"),()=>e.get("lake")]))?1:0);e.set("coast",$t1821);}
{const $t1822=$item($item($item(e.get("geo"),"slope"),e.get("y")),e.get("x"));e.set("slope",$t1822);}
{const $t1823=$call(e.get("max"),[0,$bin("Sub",0.4,$item($item($item(e.get("geo"),"temp"),e.get("y")),e.get("x")))],$dict([]));e.set("cold",$t1823);}
{const $t1824=$dict([["flood",$bin("Sub",$bin("Add",$bin("Add",$bin("Add",$bin("Add",0.2,$bin("Mult",1.7,e.get("river"))),$bin("Mult",1.0,e.get("lake"))),($truth($boolop("And",[()=>e.get("coast"),()=>$compare([()=>e.get("e"),()=>0.55], ["Lt"])]))?0.9:0)),($truth($compare([()=>e.get("here"),()=>"swamp"], ["Eq"]))?1.1:0)),($truth($compare([()=>e.get("e"),()=>0.64], ["Gt"]))?0.9:0))],["storm",$bin("Sub",$bin("Add",$bin("Add",$bin("Add",0.15,$bin("Mult",1.9,e.get("ocean"))),$bin("Mult",0.4,e.get("coast"))),($truth($compare([()=>e.get("here"),()=>"plains"], ["Eq"]))?0.5:0)),($truth($compare([()=>e.get("here"),()=>"forest"], ["Eq"]))?0.4:0))],["wildfire",$bin("Add",$bin("Add",$bin("Add",0.1,$bin("Div",$bin("Mult",2.2,e.get("forest")),e.get("window"))),($truth($compare([()=>e.get("here"),()=>"desert"], ["Eq"]))?1.6:0)),$bin("Div",$bin("Mult",0.9,e.get("wild")),e.get("window")))],["earthquake",$bin("Add",$bin("Add",0.08,$bin("Div",$bin("Mult",2.6,e.get("highland")),e.get("window"))),$bin("Mult",5.0,e.get("slope")))],["landslide",$bin("Add",0.03,$bin("Mult",$bin("Mult",6.0,e.get("slope")),($truth($compare([()=>e.get("here"),()=>$tuple(["hills","mountains"])], ["In"]))?1:0.3)))],["blizzard",$bin("Add",$bin("Add",0.02,$bin("Mult",4.0,e.get("cold"))),($truth($compare([()=>e.get("here"),()=>"mountains"], ["Eq"]))?0.7:0))]]);e.set("result",$t1824);}
for(const $t1825 of $iter(e.get("result"))){e.set("kind",$t1825);{const $t1826=$call(e.get("max"),[0.02,$item(e.get("result"),e.get("kind"))],$dict([]));$setitem(e.get("result"),e.get("kind"),$t1826);}
}
{const $t1827=e.get("result");$setitem(e.get("_HAZARDS"),e.get("key"),$t1827);}
return e.get("result");return null;}));
e.set("site_quality",$fn("site_quality",e,["sim", "x", "y"],[undefined,undefined,undefined],null,null,[],[],e=>{{const $t1828=$call(e.get("world"),[e.get("sim")],$dict([]));e.set("geo",$t1828);}
{const $t1829=$item($item($item(e.get("geo"),"terrain"),e.get("y")),e.get("x"));e.set("t",$t1829);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("t"),()=>e.get("WATER")], ["In"]),()=>$compare([()=>e.get("t"),()=>"mountains"], ["Eq"])]))){return $un("USub",50.0);}else{}
{const $t1830=$bin("Mult",$item(e.get("FERTILITY"),e.get("t")),2.0);e.set("score",$t1830);}
if($truth($call(e.get("_count"),[$item($item(e.get("geo"),"hz"),"river"),e.get("x"),e.get("y"),1],$dict([])))){e.set("score",$aug("Add",e.get("score"),0.8));}else{}
if($truth($call(e.get("_near_water"),[$item(e.get("geo"),"terrain"),e.get("x"),e.get("y"),1],$dict([])))){e.set("score",$aug("Add",e.get("score"),0.35));}else{}
{const $t1831=$dict([["grain",0.35],["pasture",0.2],["fish",0.25],["game",0.12],["timber",0.15],["stone",0.12],["clay",0.08],["iron",0.2],["copper",0.15],["coal",0.1],["gold",0.25],["salt",0.12],["furs",0.1]]);e.set("values",$t1831);}
for(const $t1832 of $iter($call($get($call(e.get("resources_near"),[e.get("sim"),e.get("x"),e.get("y"),2],$dict([])),"items"),[],$dict([])))){{const $t1833=Array.from($iter($t1832));e.set("kind",$t1833[0]);e.set("n",$t1833[1]);}e.set("score",$aug("Add",e.get("score"),$bin("Mult",$call(e.get("min"),[e.get("n"),2],$dict([])),$item(e.get("values"),e.get("kind")))));}
{const $t1834=$item($item($item(e.get("geo"),"feat"),e.get("y")),e.get("x"));e.set("tags",$t1834);}
e.set("score",$aug("Add",e.get("score"),$bin("Add",$bin("Add",$bin("Add",($truth($compare([()=>"f",()=>e.get("tags")], ["In"]))?0.5:0),($truth($compare([()=>"b",()=>e.get("tags")], ["In"]))?0.4:0)),($truth($compare([()=>"o",()=>e.get("tags")], ["In"]))?0.3:0)),($truth($compare([()=>"s",()=>e.get("tags")], ["In"]))?0.15:0))));{const $t1835=$call(e.get("hazards_at"),[e.get("sim"),e.get("x"),e.get("y")],$dict([]));e.set("risk",$t1835);}
e.set("score",$aug("Sub",e.get("score"),$bin("Mult",$bin("Add",$bin("Add",$bin("Add",$item(e.get("risk"),"flood"),$item(e.get("risk"),"earthquake")),$item(e.get("risk"),"wildfire")),$item(e.get("risk"),"landslide")),0.12)));return e.get("score");return null;}));
e.set("claim_owner",$fn("claim_owner",e,["sim", "x", "y", "counts", "exclude"],[undefined,undefined,undefined,undefined,null],null,null,[],[],e=>{{const $t1836=$item($call(e.get("world"),[e.get("sim")],$dict([])),"land");e.set("comp",$t1836);}
{const $t1837=$item($item(e.get("comp"),e.get("y")),e.get("x"));e.set("land",$t1837);}
{const $t1838=0;e.set("best",$t1838);}
{const $t1839=999.0;e.set("best_dist",$t1839);}
for(const $t1840 of $iter($call(e.get("_inhabited"),[e.get("sim")],$dict([])))){e.set("s",$t1840);if($truth($boolop("And",[()=>$compare([()=>e.get("exclude"),()=>null], ["IsNot"]),()=>$compare([()=>$get(e.get("s"),"id"),()=>e.get("exclude")], ["Eq"])]))){continue;}else{}
if($truth($compare([()=>$item($item(e.get("comp"),$get(e.get("s"),"gy")),$get(e.get("s"),"gx")),()=>e.get("land")], ["NotEq"]))){continue;}else{}
{const $t1841=$call(e.get("dist"),[$get(e.get("s"),"gx"),$get(e.get("s"),"gy"),e.get("x"),e.get("y")],$dict([]));e.set("d",$t1841);}
if($truth($boolop("And",[()=>$compare([()=>e.get("d"),()=>$call(e.get("reach"),[$call($get(e.get("counts"),"get"),[$get(e.get("s"),"id"),1],$dict([]))],$dict([]))], ["LtE"]),()=>$compare([()=>e.get("d"),()=>e.get("best_dist")], ["Lt"])]))){{const $t1842=e.get("d");e.set("best_dist",$t1842);}
{const $t1843=$get(e.get("s"),"country");e.set("best",$t1843);}
}else{}
}
return e.get("best");return null;}));
e.set("place_settlement",$fn("place_settlement",e,["sim", "settlement", "cell", "anchor"],[undefined,undefined,null,null],null,null,[],[],e=>{{const $t1844=$call(e.get("world"),[e.get("sim")],$dict([]));e.set("geo",$t1844);}
{const $t1845=$item(e.get("geo"),"land");e.set("comp",$t1845);}
{const $t1846=$item(e.get("geo"),"size");e.set("sizes",$t1846);}
{const $t1847=$call(e.get("getattr"),[e.get("sim"),"geo_seed",0],$dict([]));e.set("seed",$t1847);}
if($truth($compare([()=>e.get("cell"),()=>null], ["IsNot"]))){{const $t1848=$item(e.get("cell"),0);$set(e.get("settlement"),"gx",$t1848);}
{const $t1849=$item(e.get("cell"),1);$set(e.get("settlement"),"gy",$t1849);}
return null;}else{}
{const $t1850=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1851 of $iter($call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([])))){e.set("s",$t1851);if($truth($boolop("And",[()=>$compare([()=>e.get("s"),()=>e.get("settlement")], ["IsNot"]),()=>$call(e.get("_placed"),[e.get("s")],$dict([]))]))){yield e.get("s");}}})();})(e));e.set("others",$t1850);}
{const $t1852=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1853 of $iter(e.get("others"))){e.set("s",$t1853);if($truth($compare([()=>$get(e.get("s"),"country"),()=>$get(e.get("settlement"),"country")], ["Eq"]))){yield e.get("s");}}})();})(e));e.set("mine",$t1852);}
{const $t1854=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1855 of $iter(e.get("others"))){e.set("s",$t1855);yield $tuple([$get(e.get("s"),"gx"),$get(e.get("s"),"gy")]);}})();})(e));e.set("taken",$t1854);}
{const $t1856=($truth($boolop("And",[()=>$compare([()=>e.get("anchor"),()=>null], ["IsNot"]),()=>$un("Not",e.get("mine"))]))?$call(e.get("claims_list"),[e.get("sim"),$call(e.get("settlement_counts"),[e.get("sim")],$dict([]))],$dict([])):[]);e.set("claims",$t1856);}
{const $t1857=$dict([]);e.set("candidates",$t1857);}
if($truth($boolop("And",[()=>$compare([()=>e.get("anchor"),()=>null], ["IsNot"]),()=>$un("Not",e.get("mine"))]))){for(const $t1858 of $iter($call(e.get("range"),[$call(e.get("max"),[1,$bin("Sub",$item(e.get("anchor"),1),24)],$dict([])),$call(e.get("min"),[$bin("Sub",e.get("H"),1),$bin("Add",$item(e.get("anchor"),1),25)],$dict([])),2],$dict([])))){e.set("y",$t1858);for(const $t1859 of $iter($call(e.get("range"),[$call(e.get("max"),[1,$bin("Sub",$item(e.get("anchor"),0),24)],$dict([])),$call(e.get("min"),[$bin("Sub",e.get("W"),1),$bin("Add",$item(e.get("anchor"),0),25)],$dict([])),2],$dict([])))){e.set("x",$t1859);{const $t1860=1;$setitem(e.get("candidates"),$tuple([e.get("x"),e.get("y")]),$t1860);}
}
}
}else{if($truth(e.get("mine"))){for(const $t1861 of $iter(e.get("mine"))){e.set("s",$t1861);for(const $t1862 of $iter($call(e.get("range"),[$call(e.get("max"),[0,$bin("Sub",$get(e.get("s"),"gy"),14)],$dict([])),$call(e.get("min"),[e.get("H"),$bin("Add",$get(e.get("s"),"gy"),15)],$dict([])),2],$dict([])))){e.set("y",$t1862);for(const $t1863 of $iter($call(e.get("range"),[$call(e.get("max"),[0,$bin("Sub",$get(e.get("s"),"gx"),14)],$dict([])),$call(e.get("min"),[e.get("W"),$bin("Add",$get(e.get("s"),"gx"),15)],$dict([])),2],$dict([])))){e.set("x",$t1863);{const $t1864=1;$setitem(e.get("candidates"),$tuple([e.get("x"),e.get("y")]),$t1864);}
}
}
}
}else{for(const $t1865 of $iter($call(e.get("range"),[2,$bin("Sub",e.get("H"),1),4],$dict([])))){e.set("y",$t1865);for(const $t1866 of $iter($call(e.get("range"),[2,$bin("Sub",e.get("W"),1),4],$dict([])))){e.set("x",$t1866);{const $t1867=1;$setitem(e.get("candidates"),$tuple([e.get("x"),e.get("y")]),$t1867);}
}
}
}
}
{const $t1868=($truth(e.get("mine"))?$item($item(e.get("comp"),$get($item(e.get("mine"),0),"gy")),$get($item(e.get("mine"),0),"gx")):($truth($compare([()=>e.get("anchor"),()=>null], ["IsNot"]))?$item($item(e.get("comp"),$item(e.get("anchor"),1)),$item(e.get("anchor"),0)):null));e.set("home",$t1868);}
{const $t1869=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1870 of $iter(e.get("others"))){e.set("s",$t1870);yield $item($item(e.get("comp"),$get(e.get("s"),"gy")),$get(e.get("s"),"gx"));}})();})(e));e.set("occupied",$t1869);}
{const $t1871=null;e.set("best",$t1871);}
{const $t1872=$un("USub",1000000.0);e.set("best_score",$t1872);}
for(const $t1873 of $iter($call(e.get("sorted"),[e.get("candidates")],$dict([])))){e.set("key",$t1873);{const $t1874=e.get("key");{const $t1875=Array.from($iter($t1874));e.set("x",$t1875[0]);e.set("y",$t1875[1]);}}
{const $t1876=$item($item(e.get("comp"),e.get("y")),e.get("x"));e.set("land",$t1876);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("key"),()=>e.get("taken")], ["In"]),()=>$compare([()=>e.get("land"),()=>0], ["Eq"])]))){continue;}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("home"),()=>null], ["IsNot"]),()=>$compare([()=>e.get("land"),()=>e.get("home")], ["NotEq"])]))){continue;}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("home"),()=>null], ["Is"]),()=>$compare([()=>$item(e.get("sizes"),e.get("land")),()=>220], ["Lt"])]))){continue;}else{}
{const $t1877=$bin("Add",$call(e.get("site_quality"),[e.get("sim"),e.get("x"),e.get("y")],$dict([])),$bin("Mult",$call(e.get("_hash"),[e.get("x"),e.get("y"),e.get("seed"),9],$dict([])),0.8));e.set("score",$t1877);}
if($truth($compare([()=>e.get("score"),()=>$un("USub",20)], ["Lt"]))){continue;}else{}
{const $t1878=99.0;e.set("nearest",$t1878);}
for(const $t1879 of $iter(e.get("others"))){e.set("s",$t1879);{const $t1880=$call(e.get("dist"),[$get(e.get("s"),"gx"),$get(e.get("s"),"gy"),e.get("x"),e.get("y")],$dict([]));e.set("d",$t1880);}
if($truth($compare([()=>e.get("d"),()=>e.get("nearest")], ["Lt"]))){{const $t1881=e.get("d");e.set("nearest",$t1881);}
}else{}
}
if($truth($compare([()=>e.get("nearest"),()=>4], ["Lt"]))){e.set("score",$aug("Sub",e.get("score"),8));}else{}
if($truth(e.get("mine"))){{const $t1882=$call(e.get("min"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1883 of $iter(e.get("mine"))){e.set("s",$t1883);yield $call(e.get("dist"),[$get(e.get("s"),"gx"),$get(e.get("s"),"gy"),e.get("x"),e.get("y")],$dict([]));}})();})(e))],$dict([]));e.set("close",$t1882);}
e.set("score",$aug("Sub",e.get("score"),$bin("Mult",$call(e.get("abs"),[$bin("Sub",e.get("close"),8)],$dict([])),0.3)));}else{if($truth($compare([()=>e.get("anchor"),()=>null], ["IsNot"]))){for(const $t1884 of $iter(e.get("claims"))){{const $t1885=Array.from($iter($t1884));e.set("owner",$t1885[0]);e.set("sx",$t1885[1]);e.set("sy",$t1885[2]);e.set("r",$t1885[3]);e.set("other_land",$t1885[4]);}if($truth($boolop("And",[()=>$compare([()=>e.get("other_land"),()=>e.get("land")], ["Eq"]),()=>$compare([()=>$call(e.get("dist"),[e.get("sx"),e.get("sy"),e.get("x"),e.get("y")],$dict([])),()=>e.get("r")], ["LtE"])]))){e.set("score",$aug("Sub",e.get("score"),20));break;}else{}
}
e.set("score",$aug("Sub",e.get("score"),$bin("Add",$bin("Mult",$call(e.get("abs"),[$bin("Sub",e.get("nearest"),11)],$dict([])),0.25),$bin("Mult",$call(e.get("dist"),[e.get("x"),e.get("y"),$item(e.get("anchor"),0),$item(e.get("anchor"),1)],$dict([])),0.05))));}else{e.set("score",$aug("Sub",e.get("score"),$bin("Mult",$call(e.get("abs"),[$bin("Sub",$call(e.get("min"),[e.get("nearest"),60],$dict([])),26)],$dict([])),0.08)));if($truth($compare([()=>e.get("land"),()=>e.get("occupied")], ["NotIn"]))){e.set("score",$aug("Add",e.get("score"),3.0));}else{}
}
}
if($truth($compare([()=>e.get("score"),()=>e.get("best_score")], ["Gt"]))){{const $t1886=e.get("score");e.set("best_score",$t1886);}
{const $t1887=$tuple([e.get("x"),e.get("y")]);e.set("best",$t1887);}
}else{}
}
if($truth($compare([()=>e.get("best"),()=>null], ["Is"]))){{const $t1888=$tuple([$bin("FloorDiv",e.get("W"),2),$bin("FloorDiv",e.get("H"),2)]);e.set("best",$t1888);}
}else{}
{const $t1889=$item(e.get("best"),0);$set(e.get("settlement"),"gx",$t1889);}
{const $t1890=$item(e.get("best"),1);$set(e.get("settlement"),"gy",$t1890);}
return null;}));
e.set("ensure_placed",$fn("ensure_placed",e,["sim"],[undefined],null,null,[],[],e=>{for(const $t1891 of $iter($call(e.get("sorted"),[$call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([]))],$dict([["key",$fn("<lambda>",e,["s"],[undefined],null,null,[],[],e=>{return $get(e.get("s"),"id");return null;})]])))){e.set("settlement",$t1891);if($truth($un("Not",$call(e.get("_placed"),[e.get("settlement")],$dict([]))))){$call(e.get("place_settlement"),[e.get("sim"),e.get("settlement")],$dict([]));
}else{}
}
return null;}));
e.set("terrain_of",$fn("terrain_of",e,["sim", "settlement"],[undefined,undefined],null,null,[],[],e=>{$call(e.get("ensure_placed"),[e.get("sim")],$dict([]));
return $item($item($item($call(e.get("world"),[e.get("sim")],$dict([])),"terrain"),$get(e.get("settlement"),"gy")),$get(e.get("settlement"),"gx"));return null;}));
e.set("is_coastal",$fn("is_coastal",e,["sim", "settlement"],[undefined,undefined],null,null,[],[],e=>{$call(e.get("ensure_placed"),[e.get("sim")],$dict([]));
return $call(e.get("_near_water"),[$item($call(e.get("world"),[e.get("sim")],$dict([])),"terrain"),$get(e.get("settlement"),"gx"),$get(e.get("settlement"),"gy"),1],$dict([]));return null;}));
e.set("on_river",$fn("on_river",e,["sim", "settlement"],[undefined,undefined],null,null,[],[],e=>{$call(e.get("ensure_placed"),[e.get("sim")],$dict([]));
return $call(e.get("_near_flag"),[$item($call(e.get("world"),[e.get("sim")],$dict([])),"river"),$get(e.get("settlement"),"gx"),$get(e.get("settlement"),"gy"),1],$dict([]));return null;}));
e.set("describe",$fn("describe",e,["sim", "settlement"],[undefined,undefined],null,null,[],[],e=>{{const $t1892=$call(e.get("terrain_of"),[e.get("sim"),e.get("settlement")],$dict([]));e.set("terrain",$t1892);}
{const $t1893=[($truth($call(e.get("is_coastal"),[e.get("sim"),e.get("settlement")],$dict([])))?"coastal":"inland")];e.set("words",$t1893);}
if($truth($call(e.get("on_river"),[e.get("sim"),e.get("settlement")],$dict([])))){$call($get(e.get("words"),"append"),["riverside"],$dict([]));
}else{}
return $bin("Add",$bin("Add",$call($get(" ","join"),[e.get("words")],$dict([]))," "),e.get("terrain"));return null;}));
e.set("neighbors",$fn("neighbors",e,["sim"],[undefined],null,null,[],[],e=>{{const $t1894=$item($call(e.get("world"),[e.get("sim")],$dict([])),"land");e.set("comp",$t1894);}
{const $t1895=$call(e.get("_inhabited"),[e.get("sim")],$dict([]));e.set("places",$t1895);}
{const $t1896=$call(e.get("settlement_counts"),[e.get("sim")],$dict([]));e.set("counts",$t1896);}
{const $t1897=$dict([]);e.set("land",$t1897);}
{const $t1898=$dict([]);e.set("sea",$t1898);}
for(const $t1899 of $iter($call(e.get("range"),[$call(e.get("len"),[e.get("places")],$dict([]))],$dict([])))){e.set("i",$t1899);{const $t1900=$item(e.get("places"),e.get("i"));e.set("a",$t1900);}
for(const $t1901 of $iter($call(e.get("range"),[$bin("Add",e.get("i"),1),$call(e.get("len"),[e.get("places")],$dict([]))],$dict([])))){e.set("j",$t1901);{const $t1902=$item(e.get("places"),e.get("j"));e.set("b",$t1902);}
if($truth($compare([()=>$get(e.get("a"),"country"),()=>$get(e.get("b"),"country")], ["Eq"]))){continue;}else{}
{const $t1903=$call(e.get("dist"),[$get(e.get("a"),"gx"),$get(e.get("a"),"gy"),$get(e.get("b"),"gx"),$get(e.get("b"),"gy")],$dict([]));e.set("d",$t1903);}
if($truth($compare([()=>$item($item(e.get("comp"),$get(e.get("a"),"gy")),$get(e.get("a"),"gx")),()=>$item($item(e.get("comp"),$get(e.get("b"),"gy")),$get(e.get("b"),"gx"))], ["Eq"]))){{const $t1904=($truth($compare([()=>e.get("d"),()=>$bin("Add",$bin("Add",$call(e.get("reach"),[$call($get(e.get("counts"),"get"),[$get(e.get("a"),"id"),1],$dict([]))],$dict([])),$call(e.get("reach"),[$call($get(e.get("counts"),"get"),[$get(e.get("b"),"id"),1],$dict([]))],$dict([]))),2)], ["LtE"]))?e.get("land"):null);e.set("target",$t1904);}
}else{{const $t1905=($truth($compare([()=>e.get("d"),()=>e.get("SEA_RANGE")], ["LtE"]))?e.get("sea"):null);e.set("target",$t1905);}
}
if($truth($compare([()=>e.get("target"),()=>null], ["IsNot"]))){$call($get($call($get(e.get("target"),"setdefault"),[$get(e.get("a"),"country"),$call(e.get("set"),[],$dict([]))],$dict([])),"add"),[$get(e.get("b"),"country")],$dict([]));
$call($get($call($get(e.get("target"),"setdefault"),[$get(e.get("b"),"country"),$call(e.get("set"),[],$dict([]))],$dict([])),"add"),[$get(e.get("a"),"country")],$dict([]));
}else{}
}
}
return $tuple([e.get("land"),e.get("sea")]);return null;}));
e.set("contacts",$fn("contacts",e,["sim", "store"],[undefined,true],null,null,[],[],e=>{{const $t1906=$call(e.get("getattr"),[e.get("sim"),"contact_cache",null],$dict([]));e.set("cache",$t1906);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("cache"),()=>null], ["Is"]),()=>$compare([()=>$call($get(e.get("cache"),"get"),["year"],$dict([])),()=>$get(e.get("sim"),"year")], ["NotEq"])]))){{const $t1907=$call(e.get("neighbors"),[e.get("sim")],$dict([]));{const $t1908=Array.from($iter($t1907));e.set("land",$t1908[0]);e.set("sea",$t1908[1]);}}
{const $t1909=$dict([["year",$get(e.get("sim"),"year")],["land",e.get("land")],["sea",e.get("sea")]]);e.set("cache",$t1909);}
if($truth(e.get("store"))){{const $t1910=e.get("cache");$set(e.get("sim"),"contact_cache",$t1910);}
}else{}
}else{}
return $tuple([$item(e.get("cache"),"land"),$item(e.get("cache"),"sea")]);return null;}));
e.set("profile",$fn("profile",e,["sim", "cid"],[undefined,undefined],null,null,[],[],e=>{{const $t1911=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1912 of $iter($call(e.get("_inhabited"),[e.get("sim")],$dict([])))){e.set("s",$t1912);if($truth($compare([()=>$get(e.get("s"),"country"),()=>e.get("cid")], ["Eq"]))){yield e.get("s");}}})();})(e));e.set("places",$t1911);}
{const $t1913=$dict([["fertility",1.0],["coastal",0.0],["mountain",0.0],["forest",0.0],["dry",0.0],["river",0.0],["swamp",0.0],["cold",0.0]]);e.set("empty",$t1913);}
if($truth($un("Not",e.get("places")))){return e.get("empty");}else{}
{const $t1914=$call(e.get("world"),[e.get("sim")],$dict([]));e.set("geo",$t1914);}
{const $t1915=$item(e.get("geo"),"terrain");e.set("rows",$t1915);}
{const $t1916=$call(e.get("len"),[e.get("places")],$dict([]));e.set("n",$t1916);}
{const $t1917=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1918 of $iter(e.get("places"))){e.set("s",$t1918);yield $item($item(e.get("rows"),$get(e.get("s"),"gy")),$get(e.get("s"),"gx"));}})();})(e));e.set("kinds",$t1917);}
{const $t1919=$bin("Div",$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1920 of $iter(e.get("places"))){e.set("s",$t1920);yield $call(e.get("_near_water"),[e.get("rows"),$get(e.get("s"),"gx"),$get(e.get("s"),"gy"),1],$dict([]));}})();})(e))],$dict([])),e.get("n"));e.set("coastal",$t1919);}
{const $t1921=$bin("Div",$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1922 of $iter(e.get("places"))){e.set("s",$t1922);yield $call(e.get("_near_flag"),[$item(e.get("geo"),"river"),$get(e.get("s"),"gx"),$get(e.get("s"),"gy"),1],$dict([]));}})();})(e))],$dict([])),e.get("n"));e.set("rivers",$t1921);}
{const $t1923=$get($item($get(e.get("sim"),"countries"),e.get("cid")),"technologies");e.set("techs",$t1923);}
{const $t1924=$call(e.get("len"),[$bin("BitAnd",e.get("techs"),new PS(["irrigation","crop rotation","watermills"]))],$dict([]));e.set("farming",$t1924);}
{const $t1925=0.0;e.set("total",$t1925);}
for(const $t1926 of $iter($call(e.get("zip"),[e.get("kinds"),e.get("places")],$dict([])))){{const $t1927=Array.from($iter($t1926));e.set("k",$t1927[0]);e.set("s",$t1927[1]);}{const $t1928=$item(e.get("FERTILITY"),e.get("k"));e.set("value",$t1928);}
if($truth($compare([()=>e.get("k"),()=>$tuple(["desert","hills","tundra","mountains"])], ["In"]))){e.set("value",$aug("Add",e.get("value"),$bin("Mult",0.07,e.get("farming"))));}else{}
if($truth($call(e.get("_near_flag"),[$item(e.get("geo"),"river"),$get(e.get("s"),"gx"),$get(e.get("s"),"gy"),1],$dict([])))){e.set("value",$aug("Add",e.get("value"),0.22));}else{}
e.set("total",$aug("Add",e.get("total"),e.get("value")));}
return $dict([["fertility",$bin("Add",$bin("Div",e.get("total"),e.get("n")),$bin("Mult",0.1,e.get("coastal")))],["coastal",e.get("coastal")],["mountain",$bin("Div",$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1929 of $iter(e.get("kinds"))){e.set("k",$t1929);yield $compare([()=>e.get("k"),()=>$tuple(["mountains","hills"])], ["In"]);}})();})(e))],$dict([])),e.get("n"))],["forest",$bin("Div",$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1930 of $iter(e.get("kinds"))){e.set("k",$t1930);yield $compare([()=>e.get("k"),()=>"forest"], ["Eq"]);}})();})(e))],$dict([])),e.get("n"))],["dry",$bin("Div",$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1931 of $iter(e.get("kinds"))){e.set("k",$t1931);yield $compare([()=>e.get("k"),()=>"desert"], ["Eq"]);}})();})(e))],$dict([])),e.get("n"))],["river",e.get("rivers")],["swamp",$bin("Div",$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1932 of $iter(e.get("kinds"))){e.set("k",$t1932);yield $compare([()=>e.get("k"),()=>"swamp"], ["Eq"]);}})();})(e))],$dict([])),e.get("n"))],["cold",$bin("Div",$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1933 of $iter(e.get("kinds"))){e.set("k",$t1933);yield $compare([()=>e.get("k"),()=>"tundra"], ["Eq"]);}})();})(e))],$dict([])),e.get("n"))]]);return null;}));
e.set("defense",$fn("defense",e,["sim", "cid"],[undefined,undefined],null,null,[],[],e=>{{const $t1934=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1935 of $iter($call(e.get("_inhabited"),[e.get("sim")],$dict([])))){e.set("s",$t1935);if($truth($compare([()=>$get(e.get("s"),"country"),()=>e.get("cid")], ["Eq"]))){yield e.get("s");}}})();})(e));e.set("places",$t1934);}
if($truth($un("Not",e.get("places")))){return 1.0;}else{}
{const $t1936=$item($call(e.get("world"),[e.get("sim")],$dict([])),"terrain");e.set("rows",$t1936);}
return $bin("Div",$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1937 of $iter(e.get("places"))){e.set("s",$t1937);yield $item(e.get("DEFENSE"),$item($item(e.get("rows"),$get(e.get("s"),"gy")),$get(e.get("s"),"gx")));}})();})(e))],$dict([])),$call(e.get("len"),[e.get("places")],$dict([])));return null;}));
e.set("distance_to_country",$fn("distance_to_country",e,["sim", "place", "cid"],[undefined,undefined,undefined],null,null,[],[],e=>{$call(e.get("ensure_placed"),[e.get("sim")],$dict([]));
{const $t1938=999.0;e.set("best",$t1938);}
for(const $t1939 of $iter($call(e.get("_inhabited"),[e.get("sim")],$dict([])))){e.set("s",$t1939);if($truth($compare([()=>$get(e.get("s"),"country"),()=>e.get("cid")], ["Eq"]))){{const $t1940=$call(e.get("dist"),[$get(e.get("s"),"gx"),$get(e.get("s"),"gy"),$get(e.get("place"),"gx"),$get(e.get("place"),"gy")],$dict([]));e.set("d",$t1940);}
if($truth($compare([()=>e.get("d"),()=>e.get("best")], ["Lt"]))){{const $t1941=e.get("d");e.set("best",$t1941);}
}else{}
}else{}
}
return e.get("best");return null;}));
e.set("step_cost",$fn("step_cost",e,["sim", "x", "y", "nx", "ny"],[undefined,undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t1942=$call(e.get("world"),[e.get("sim")],$dict([]));e.set("geo",$t1942);}
{const $t1943=$item($item($item(e.get("geo"),"terrain"),e.get("ny")),e.get("nx"));e.set("t",$t1943);}
if($truth($compare([()=>e.get("t"),()=>e.get("WATER")], ["In"]))){return null;}else{}
{const $t1944=$call(e.get("getattr"),[e.get("sim"),"roads",$dict([])],$dict([]));e.set("road",$t1944);}
{const $t1945=$item(e.get("CELL_COST"),e.get("t"));e.set("cost",$t1945);}
if($truth($compare([()=>$bin("Add",$bin("Mult",e.get("ny"),e.get("W")),e.get("nx")),()=>e.get("road")], ["In"]))){{const $t1946=$call(e.get("min"),[e.get("cost"),0.5],$dict([]));e.set("cost",$t1946);}
}else{if($truth($boolop("And",[()=>$item($item($item(e.get("geo"),"river"),e.get("ny")),e.get("nx")),()=>$un("Not",$item($item($item(e.get("geo"),"river"),e.get("y")),e.get("x")))]))){e.set("cost",$aug("Add",e.get("cost"),1.5));}else{}
}
if($truth($boolop("And",[()=>$compare([()=>e.get("nx"),()=>e.get("x")], ["NotEq"]),()=>$compare([()=>e.get("ny"),()=>e.get("y")], ["NotEq"])]))){e.set("cost",$aug("Mult",e.get("cost"),1.41));}else{}
return e.get("cost");return null;}));
e.set("_search",$fn("_search",e,["sim", "start", "goal", "sea"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t1947=$call(e.get("world"),[e.get("sim")],$dict([]));e.set("geo",$t1947);}
{const $t1948=$item(e.get("geo"),"terrain");e.set("terrain",$t1948);}
{const $t1949=$item(e.get("geo"),"river");e.set("river",$t1949);}
{const $t1950=($truth(e.get("sea"))?$dict([]):$call(e.get("getattr"),[e.get("sim"),"roads",$dict([])],$dict([])));e.set("roads",$t1950);}
{const $t1951=$item(e.get("goal"),0);e.set("gx",$t1951);}
{const $t1952=$item(e.get("goal"),1);e.set("gy",$t1952);}
{const $t1953=$dict([[$bin("Add",$bin("Mult",$item(e.get("start"),1),e.get("W")),$item(e.get("start"),0)),0.0]]);e.set("best",$t1953);}
{const $t1954=$dict([]);e.set("prev",$t1954);}
{const $t1955=$dict([[0,[$tuple([0.0,$item(e.get("start"),0),$item(e.get("start"),1)])]]]);e.set("buckets",$t1955);}
{const $t1956=0;e.set("level",$t1956);}
{const $t1957=0;e.set("expanded",$t1957);}
{const $t1958=($truth(e.get("sea"))?9000:6000);e.set("limit",$t1958);}
while($truth($compare([()=>e.get("level"),()=>2400], ["LtE"]))){{const $t1959=$call($get(e.get("buckets"),"get"),[e.get("level")],$dict([]));e.set("queue",$t1959);}
if($truth($un("Not",e.get("queue")))){e.set("level",$aug("Add",e.get("level"),1));continue;}else{}
{const $t1960=0;e.set("index",$t1960);}
while($truth($compare([()=>e.get("index"),()=>$call(e.get("len"),[e.get("queue")],$dict([]))], ["Lt"]))){{const $t1961=$item(e.get("queue"),e.get("index"));{const $t1962=Array.from($iter($t1961));e.set("g",$t1962[0]);e.set("x",$t1962[1]);e.set("y",$t1962[2]);}}
e.set("index",$aug("Add",e.get("index"),1));{const $t1963=$bin("Add",$bin("Mult",e.get("y"),e.get("W")),e.get("x"));e.set("key",$t1963);}
if($truth($compare([()=>e.get("g"),()=>$bin("Add",$item(e.get("best"),e.get("key")),0.0001)], ["Gt"]))){continue;}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("x"),()=>e.get("gx")], ["Eq"]),()=>$compare([()=>e.get("y"),()=>e.get("gy")], ["Eq"])]))){{const $t1964=[$tuple([e.get("x"),e.get("y")])];e.set("cells",$t1964);}
while($truth($compare([()=>e.get("key"),()=>e.get("prev")], ["In"]))){{const $t1965=$item(e.get("prev"),e.get("key"));e.set("key",$t1965);}
$call($get(e.get("cells"),"append"),[$tuple([$bin("Mod",e.get("key"),e.get("W")),$bin("FloorDiv",e.get("key"),e.get("W"))])],$dict([]));
}
{const $t1966=$call(e.get("list"),[$call(e.get("reversed"),[e.get("cells")],$dict([]))],$dict([]));e.set("cells",$t1966);}
return $tuple([e.get("cells"),e.get("g")]);}else{}
e.set("expanded",$aug("Add",e.get("expanded"),1));if($truth($compare([()=>e.get("expanded"),()=>e.get("limit")], ["Gt"]))){return null;}else{}
for(const $t1967 of $iter(e.get("OFFSETS"))){{const $t1968=Array.from($iter($t1967));e.set("dx",$t1968[0]);e.set("dy",$t1968[1]);}{const $t1969=$bin("Add",e.get("x"),e.get("dx"));e.set("nx",$t1969);}
{const $t1970=$bin("Add",e.get("y"),e.get("dy"));e.set("ny",$t1970);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("nx"),()=>0], ["Lt"]),()=>$compare([()=>e.get("ny"),()=>0], ["Lt"]),()=>$compare([()=>e.get("nx"),()=>e.get("W")], ["GtE"]),()=>$compare([()=>e.get("ny"),()=>e.get("H")], ["GtE"])]))){continue;}else{}
{const $t1971=$item($item(e.get("terrain"),e.get("ny")),e.get("nx"));e.set("t",$t1971);}
{const $t1972=$bin("Add",$bin("Mult",e.get("ny"),e.get("W")),e.get("nx"));e.set("nkey",$t1972);}
if($truth(e.get("sea"))){if($truth($compare([()=>e.get("t"),()=>"ocean"], ["NotEq"]))){continue;}else{}
{const $t1973=1.0;e.set("cost",$t1973);}
}else{if($truth($boolop("Or",[()=>$compare([()=>e.get("t"),()=>"ocean"], ["Eq"]),()=>$compare([()=>e.get("t"),()=>"lake"], ["Eq"])]))){continue;}else{}
{const $t1974=$item(e.get("CELL_COST"),e.get("t"));e.set("cost",$t1974);}
if($truth($compare([()=>e.get("nkey"),()=>e.get("roads")], ["In"]))){{const $t1975=0.5;e.set("cost",$t1975);}
}else{if($truth($boolop("And",[()=>$item($item(e.get("river"),e.get("ny")),e.get("nx")),()=>$un("Not",$item($item(e.get("river"),e.get("y")),e.get("x")))]))){e.set("cost",$aug("Add",e.get("cost"),1.5));}else{}
}
}
if($truth($boolop("And",[()=>$compare([()=>e.get("dx"),()=>0], ["NotEq"]),()=>$compare([()=>e.get("dy"),()=>0], ["NotEq"])]))){e.set("cost",$aug("Mult",e.get("cost"),1.41));}else{}
{const $t1976=$bin("Add",e.get("g"),e.get("cost"));e.set("ng",$t1976);}
{const $t1977=$call($get(e.get("best"),"get"),[e.get("nkey")],$dict([]));e.set("old",$t1977);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("old"),()=>null], ["Is"]),()=>$compare([()=>e.get("ng"),()=>$bin("Sub",e.get("old"),0.0001)], ["Lt"])]))){{const $t1978=e.get("ng");$setitem(e.get("best"),e.get("nkey"),$t1978);}
{const $t1979=e.get("key");$setitem(e.get("prev"),e.get("nkey"),$t1979);}
{const $t1980=$call(e.get("int"),[$bin("Mult",$bin("Add",e.get("ng"),$bin("Mult",$bin("Pow",$bin("Add",$bin("Pow",$bin("Sub",e.get("nx"),e.get("gx")),2),$bin("Pow",$bin("Sub",e.get("ny"),e.get("gy")),2)),0.5),0.8)),2)],$dict([]));e.set("slot",$t1980);}
if($truth($compare([()=>e.get("slot"),()=>e.get("level")], ["Lt"]))){{const $t1981=e.get("level");e.set("slot",$t1981);}
}else{}
$call($get($call($get(e.get("buckets"),"setdefault"),[e.get("slot"),[]],$dict([])),"append"),[$tuple([e.get("ng"),e.get("nx"),e.get("ny")])],$dict([]));
}else{}
}
}
{const $t1982=[];$setitem(e.get("buckets"),e.get("level"),$t1982);}
e.set("level",$aug("Add",e.get("level"),1));}
return null;return null;}));
e.set("find_path",$fn("find_path",e,["sim", "start", "goal"],[undefined,undefined,undefined],null,null,[],[],e=>{{const $t1983=$item($call(e.get("world"),[e.get("sim")],$dict([])),"land");e.set("comp",$t1983);}
if($truth($boolop("Or",[()=>$compare([()=>$item($item(e.get("comp"),$item(e.get("start"),1)),$item(e.get("start"),0)),()=>$item($item(e.get("comp"),$item(e.get("goal"),1)),$item(e.get("goal"),0))], ["NotEq"]),()=>$compare([()=>$item($item(e.get("comp"),$item(e.get("start"),1)),$item(e.get("start"),0)),()=>0], ["Eq"])]))){return null;}else{}
return $call(e.get("_search"),[e.get("sim"),e.get("start"),e.get("goal"),false],$dict([]));return null;}));
e.set("coast_cell",$fn("coast_cell",e,["sim", "x", "y"],[undefined,undefined,undefined],null,null,[],[],e=>{{const $t1984=$item($call(e.get("world"),[e.get("sim")],$dict([])),"terrain");e.set("rows",$t1984);}
for(const $t1985 of $iter(e.get("OFFSETS"))){{const $t1986=Array.from($iter($t1985));e.set("dx",$t1986[0]);e.set("dy",$t1986[1]);}{const $t1987=$bin("Add",e.get("x"),e.get("dx"));e.set("nx",$t1987);}
{const $t1988=$bin("Add",e.get("y"),e.get("dy"));e.set("ny",$t1988);}
if($truth($boolop("And",[()=>$compare([()=>0,()=>e.get("nx"),()=>e.get("W")], ["LtE", "Lt"]),()=>$compare([()=>0,()=>e.get("ny"),()=>e.get("H")], ["LtE", "Lt"]),()=>$compare([()=>$item($item(e.get("rows"),e.get("ny")),e.get("nx")),()=>"ocean"], ["Eq"])]))){return $tuple([e.get("nx"),e.get("ny")]);}else{}
}
return null;return null;}));
e.set("find_sea_route",$fn("find_sea_route",e,["sim", "a", "b"],[undefined,undefined,undefined],null,null,[],[],e=>{{const $t1989=$call(e.get("coast_cell"),[e.get("sim"),$item(e.get("a"),0),$item(e.get("a"),1)],$dict([]));e.set("start",$t1989);}
{const $t1990=$call(e.get("coast_cell"),[e.get("sim"),$item(e.get("b"),0),$item(e.get("b"),1)],$dict([]));e.set("goal",$t1990);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("start"),()=>null], ["Is"]),()=>$compare([()=>e.get("goal"),()=>null], ["Is"])]))){return null;}else{}
{const $t1991=$call(e.get("_search"),[e.get("sim"),e.get("start"),e.get("goal"),true],$dict([]));e.set("found",$t1991);}
if($truth($compare([()=>e.get("found"),()=>null], ["Is"]))){return null;}else{}
{const $t1992=e.get("found");{const $t1993=Array.from($iter($t1992));e.set("cells",$t1993[0]);e.set("cost",$t1993[1]);}}
return $tuple([$bin("Add",$bin("Add",[$tuple([$item(e.get("a"),0),$item(e.get("a"),1)])],e.get("cells")),[$tuple([$item(e.get("b"),0),$item(e.get("b"),1)])]),$bin("Add",e.get("cost"),2.0)]);return null;}));
e.set("cached_route",$fn("cached_route",e,["sim", "a", "b", "sea"],[undefined,undefined,undefined,false],null,null,[],[],e=>{{const $t1994=$call(e.get("getattr"),[e.get("sim"),"roads",$dict([])],$dict([]));e.set("roads",$t1994);}
{const $t1995=$tuple([$call(e.get("getattr"),[e.get("sim"),"geo_seed",0],$dict([])),e.get("a"),e.get("b"),e.get("sea"),$call(e.get("len"),[e.get("roads")],$dict([])),$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t1996 of $iter(e.get("roads"))){e.set("k",$t1996);yield e.get("k");}})();})(e))],$dict([]))]);e.set("key",$t1995);}
if($truth($compare([()=>e.get("key"),()=>e.get("_ROUTES")], ["NotIn"]))){if($truth($compare([()=>$call(e.get("len"),[e.get("_ROUTES")],$dict([])),()=>300], ["Gt"]))){$call($get(e.get("_ROUTES"),"clear"),[],$dict([]));
}else{}
{const $t1997=($truth(e.get("sea"))?$call(e.get("find_sea_route"),[e.get("sim"),e.get("a"),e.get("b")],$dict([])):$call(e.get("find_path"),[e.get("sim"),e.get("a"),e.get("b")],$dict([])));$setitem(e.get("_ROUTES"),e.get("key"),$t1997);}
}else{}
return $item(e.get("_ROUTES"),e.get("key"));return null;}));
e.set("contested_cells",$fn("contested_cells",e,["sim"],[undefined],null,null,[],[],e=>{{const $t1998=$dict([]);e.set("cells",$t1998);}
if($truth($un("Not",$get(e.get("sim"),"wars")))){return e.get("cells");}else{}
{const $t1999=$item($call(e.get("world"),[e.get("sim")],$dict([])),"land");e.set("comp",$t1999);}
{const $t2000=$call(e.get("settlement_counts"),[e.get("sim")],$dict([]));e.set("counts",$t2000);}
{const $t2001=$call(e.get("_inhabited"),[e.get("sim")],$dict([]));e.set("places",$t2001);}
for(const $t2002 of $iter($call(e.get("sorted"),[$get(e.get("sim"),"wars")],$dict([])))){e.set("pair",$t2002);for(const $t2003 of $iter(e.get("places"))){e.set("x",$t2003);if($truth($compare([()=>$get(e.get("x"),"country"),()=>$item(e.get("pair"),0)], ["NotEq"]))){continue;}else{}
{const $t2004=$bin("Add",$call(e.get("reach"),[$call($get(e.get("counts"),"get"),[$get(e.get("x"),"id"),1],$dict([]))],$dict([])),2);e.set("rx",$t2004);}
{const $t2005=$item($item(e.get("comp"),$get(e.get("x"),"gy")),$get(e.get("x"),"gx"));e.set("land",$t2005);}
for(const $t2006 of $iter(e.get("places"))){e.set("y",$t2006);if($truth($boolop("Or",[()=>$compare([()=>$get(e.get("y"),"country"),()=>$item(e.get("pair"),1)], ["NotEq"]),()=>$compare([()=>$item($item(e.get("comp"),$get(e.get("y"),"gy")),$get(e.get("y"),"gx")),()=>e.get("land")], ["NotEq"])]))){continue;}else{}
{const $t2007=$bin("Add",$call(e.get("reach"),[$call($get(e.get("counts"),"get"),[$get(e.get("y"),"id"),1],$dict([]))],$dict([])),2);e.set("ry",$t2007);}
if($truth($compare([()=>$call(e.get("dist"),[$get(e.get("x"),"gx"),$get(e.get("x"),"gy"),$get(e.get("y"),"gx"),$get(e.get("y"),"gy")],$dict([])),()=>$bin("Add",e.get("rx"),e.get("ry"))], ["Gt"]))){continue;}else{}
for(const $t2008 of $iter($call(e.get("range"),[$call(e.get("max"),[0,$call(e.get("int"),[$bin("Sub",$get(e.get("y"),"gy"),e.get("ry"))],$dict([]))],$dict([])),$call(e.get("min"),[e.get("H"),$bin("Add",$call(e.get("int"),[$bin("Add",$get(e.get("y"),"gy"),e.get("ry"))],$dict([])),2)],$dict([]))],$dict([])))){e.set("cy",$t2008);for(const $t2009 of $iter($call(e.get("range"),[$call(e.get("max"),[0,$call(e.get("int"),[$bin("Sub",$get(e.get("y"),"gx"),e.get("ry"))],$dict([]))],$dict([])),$call(e.get("min"),[e.get("W"),$bin("Add",$call(e.get("int"),[$bin("Add",$get(e.get("y"),"gx"),e.get("ry"))],$dict([])),2)],$dict([]))],$dict([])))){e.set("cx",$t2009);if($truth($boolop("And",[()=>$compare([()=>$item($item(e.get("comp"),e.get("cy")),e.get("cx")),()=>e.get("land")], ["Eq"]),()=>$compare([()=>$call(e.get("dist"),[e.get("cx"),e.get("cy"),$get(e.get("x"),"gx"),$get(e.get("x"),"gy")],$dict([])),()=>e.get("rx")], ["LtE"]),()=>$compare([()=>$call(e.get("dist"),[e.get("cx"),e.get("cy"),$get(e.get("y"),"gx"),$get(e.get("y"),"gy")],$dict([])),()=>e.get("ry")], ["LtE"])]))){{const $t2010=e.get("pair");$setitem(e.get("cells"),$bin("Add",$bin("Mult",e.get("cy"),e.get("W")),e.get("cx")),$t2010);}
}else{}
}
}
}
}
}
return e.get("cells");return null;}));
e.set("report",$fn("report",e,["sim", "query"],[undefined,""],null,null,[],[],e=>{{const $t2011=$call(e.get("contacts"),[e.get("sim")],$dict([]));{const $t2012=Array.from($iter($t2011));e.set("land",$t2012[0]);e.set("sea",$t2012[1]);}}
{const $t2013=$item($call(e.get("world"),[e.get("sim")],$dict([])),"land");e.set("comp",$t2013);}
{const $t2014=$item($call(e.get("world"),[e.get("sim")],$dict([])),"size");e.set("sizes",$t2014);}
{const $t2015=$call(e.get("len"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2016 of $iter(e.get("sizes"))){e.set("k",$t2016);if($truth($compare([()=>$item(e.get("sizes"),e.get("k")),()=>150], ["GtE"]))){yield e.get("k");}}})();})(e))],$dict([]));e.set("big",$t2015);}
{const $t2017=["Geography: terrain, rivers, resources and roads shape food, hazards, disease, travel and battles; borders decide who can fight.",("The world is "+$fmt(e.get("W"),-1,null)+"x"+$fmt(e.get("H"),-1,null)+" cells with "+$fmt(e.get("big"),-1,null)+" large landmasses and "+$fmt($bin("Sub",$call(e.get("len"),[e.get("sizes")],$dict([])),e.get("big")),-1,null)+" smaller islands. A settlement claims land out to its reach (4 cells plus population-based growth); claims that meet are land borders. Sea neighbors lie within "+$fmt(e.get("SEA_RANGE"),-1,null)+" cells across water.")];e.set("lines",$t2017);}
for(const $t2018 of $iter($call(e.get("sorted"),[$get(e.get("sim"),"countries")],$dict([])))){e.set("cid",$t2018);{const $t2019=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t2019);}
if($truth($boolop("Or",[()=>$compare([()=>$get(e.get("country"),"ended"),()=>null], ["IsNot"]),()=>$boolop("And",[()=>e.get("query"),()=>$compare([()=>e.get("query"),()=>$call($get($get(e.get("country"),"name"),"casefold"),[],$dict([]))], ["NotIn"])])]))){continue;}else{}
{const $t2020=$call(e.get("profile"),[e.get("sim"),e.get("cid")],$dict([]));e.set("p",$t2020);}
{const $t2021=$boolop("Or",[()=>$call($get(", ","join"),[$call(e.get("sorted"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2022 of $iter($call($get(e.get("land"),"get"),[e.get("cid"),$call(e.get("set"),[],$dict([]))],$dict([])))){e.set("n",$t2022);yield $get($item($get(e.get("sim"),"countries"),e.get("n")),"name");}})();})(e))],$dict([]))],$dict([])),()=>"none"]);e.set("by_land",$t2021);}
{const $t2023=$boolop("Or",[()=>$call($get(", ","join"),[$call(e.get("sorted"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2024 of $iter($call($get(e.get("sea"),"get"),[e.get("cid"),$call(e.get("set"),[],$dict([]))],$dict([])))){e.set("n",$t2024);yield $get($item($get(e.get("sim"),"countries"),e.get("n")),"name");}})();})(e))],$dict([]))],$dict([])),()=>"none"]);e.set("by_sea",$t2023);}
$call($get(e.get("lines"),"append"),[($fmt($get(e.get("country"),"name"),-1,null)+": borders "+$fmt(e.get("by_land"),-1,null)+"; sea neighbors "+$fmt(e.get("by_sea"),-1,null))],$dict([]));
$call($get(e.get("lines"),"append"),[("  fertility "+$fmt($item(e.get("p"),"fertility"),-1,(".2f"))+"; coastal "+$fmt($item(e.get("p"),"coastal"),-1,(".0%"))+"; river "+$fmt($item(e.get("p"),"river"),-1,(".0%"))+"; highland "+$fmt($item(e.get("p"),"mountain"),-1,(".0%"))+"; forest "+$fmt($item(e.get("p"),"forest"),-1,(".0%"))+"; desert "+$fmt($item(e.get("p"),"dry"),-1,(".0%"))+"; swamp "+$fmt($item(e.get("p"),"swamp"),-1,(".0%"))+"; defensive terrain x"+$fmt($call(e.get("defense"),[e.get("sim"),e.get("cid")],$dict([])),-1,(".2f")))],$dict([]));
}
return $call($get("\n","join"),[e.get("lines")],$dict([]));return null;}));
});
$register("development",e=>{e.set("Counter",$get($import("collections"),"Counter"));e.set("AUTHORITY",$get($import("governments"),"AUTHORITY"));e.set("tech_effects",$get($import("technology"),"effects"));e.set("materials_pace",$get($import("economy"),"materials_pace"));e.set("use_materials",$get($import("economy"),"use_materials"));e.set("W",$get($import("geography"),"W"));e.set("H",$get($import("geography"),"H"));e.set("world",$get($import("geography"),"world"));e.set("dist",$get($import("geography"),"dist"));e.set("find_path",$get($import("geography"),"find_path"));e.set("find_sea_route",$get($import("geography"),"find_sea_route"));e.set("cached_route",$get($import("geography"),"cached_route"));e.set("coast_cell",$get($import("geography"),"coast_cell"));e.set("step_cost",$get($import("geography"),"step_cost"));e.set("site_quality",$get($import("geography"),"site_quality"));e.set("claim_owner",$get($import("geography"),"claim_owner"));e.set("claims_list",$get($import("geography"),"claims_list"));e.set("reach",$get($import("geography"),"reach"));e.set("settlement_counts",$get($import("geography"),"settlement_counts"));e.set("hazards_at",$get($import("geography"),"hazards_at"));e.set("ensure_placed",$get($import("geography"),"ensure_placed"));e.set("resources_near",$get($import("geography"),"resources_near"));e.set("_near_flag",$get($import("geography"),"_near_flag"));e.set("_inhabited",$get($import("geography"),"_inhabited"));e.set("contacts",$get($import("geography"),"contacts"));{const $t2025=9.0;e.set("SPEED",$t2025);}
{const $t2026=14.0;e.set("SEA_SPEED",$t2026);}
{const $t2027=11.0;e.set("ARMY_SPEED",$t2027);}
{const $t2028=10.0;e.set("CARAVAN_SPEED",$t2028);}
{const $t2029=15.0;e.set("CARAVAN_SEA_SPEED",$t2029);}
{const $t2030=$dict([["well",$tuple(["Wells and cisterns",100,$call(e.get("set"),[],$dict([])),40,"","cleaner water and less waterborne disease",false])],["granary",$tuple(["Granary",160,new PS(["granaries"]),60,"","food reserves that soften famine",false])],["market",$tuple(["Market",200,new PS(["pottery"]),80,"","trade, prosperity and treasury income",false])],["school",$tuple(["School",260,new PS(["writing"]),80,"","faster research and more creative work",false])],["library",$tuple(["Library",380,new PS(["paper"]),120,"","research and shared knowledge",false])],["university",$tuple(["University",700,new PS(["universities"]),200,"","major research gains",false])],["observatory",$tuple(["Observatory",560,new PS(["astronomy"]),150,"","research and navigation",false])],["clinic",$tuple(["Clinic",280,new PS(["medicine"]),70,"","treatment: fewer deaths and more care capacity",false])],["hospital",$tuple(["Hospital",500,new PS(["surgery"]),150,"","strong care and faster cures",false])],["aqueduct",$tuple(["Aqueduct",440,new PS(["aqueducts"]),120,"","clean water at scale",false])],["walls",$tuple(["City walls",440,new PS(["fortification"]),100,"","defense in war and sieges",false])],["harbor",$tuple(["Harbor",320,new PS(["sailing"]),80,"coast","sea trade and fishing, but also a path for disease",false])],["levee",$tuple(["Levee and seawall",240,new PS(["irrigation"]),60,"water","protection from floods and storms",false])],["firebreak",$tuple(["Firebreak",140,$call(e.get("set"),[],$dict([])),60,"","protection from wildfires",false])],["foundations",$tuple(["Reinforced hall",320,new PS(["fortification"]),80,"","protection from earthquakes and landslides",false])],["monument",$tuple(["Monument",440,new PS(["writing"]),100,"","stability and national pride",false])],["theater",$tuple(["Theater",340,new PS(["writing"]),100,"","culture and creative works",false])],["mine",$tuple(["Mine",300,new PS(["bronze tools"]),60,"ore","prosperity and weapons",false])],["mill",$tuple(["Mill",280,new PS(["watermills"]),80,"river","food and prosperity",false])],["forge",$tuple(["Forge",360,new PS(["ironworking"]),100,"","weapons, tools and prosperity",false])],["bank",$tuple(["Bank",520,new PS(["banking"]),200,"","treasury income and trade",false])],["barracks",$tuple(["Barracks",480,new PS(["military drill"]),150,"","stronger armies and sturdier defense",false])],["factory",$tuple(["Factory",900,new PS(["steam power"]),250,"","mass production and prosperity",false])],["station",$tuple(["Railway station",800,new PS(["railways"]),250,"","rail trade and swift supply",false])],["palace",$tuple(["Royal palace",900,new PS(["writing"]),150,"capital","the seat of government: stability, taxes and settler drive",true])],["grand_academy",$tuple(["Grand academy",1500,new PS(["universities"]),250,"university","a great center of learning",true])],["lighthouse",$tuple(["Lighthouse",420,new PS(["navigation"]),100,"harbor","safer sea voyages and busier trade",true])],["fortress",$tuple(["Great fortress",1300,new PS(["steelmaking"]),200,"walls","a nearly impregnable stronghold",true])]]);e.set("BUILDINGS",$t2030);}
{const $t2031=$dict([["laborer",1.0],["artisan",1.0],["farmer",0.25],["scientist",0.2]]);e.set("WORK",$t2031);}
{const $t2032=$dict([["ocean",0.009],["mountains",0.012],["desert",0.008],["swamp",0.008],["tundra",0.007],["hills",0.003],["forest",0.003]]);e.set("TRAVEL_RISK",$t2032);}
e.set("_list",$fn("_list",e,["sim", "name"],[undefined,undefined],null,null,[],[],e=>{{const $t2033=$call(e.get("getattr"),[e.get("sim"),e.get("name"),null],$dict([]));e.set("value",$t2033);}
if($truth($compare([()=>e.get("value"),()=>null], ["Is"]))){{const $t2034=[];e.set("value",$t2034);}
$call(e.get("setattr"),[e.get("sim"),e.get("name"),e.get("value")],$dict([]));
}else{}
return e.get("value");return null;}));
e.set("_drop",$fn("_drop",e,["items", "target"],[undefined,undefined],null,null,[],[],e=>{for(const $t2035 of $iter($call(e.get("range"),[$call(e.get("len"),[e.get("items")],$dict([]))],$dict([])))){e.set("i",$t2035);if($truth($compare([()=>$item($item(e.get("items"),e.get("i")),"id"),()=>$item(e.get("target"),"id")], ["Eq"]))){$call($get(e.get("items"),"pop"),[e.get("i")],$dict([]));
return null;}else{}
}
return null;}));
e.set("_next",$fn("_next",e,["sim", "name"],[undefined,undefined],null,null,[],[],e=>{{const $t2036=$call(e.get("getattr"),[e.get("sim"),e.get("name"),1],$dict([]));e.set("value",$t2036);}
$call(e.get("setattr"),[e.get("sim"),e.get("name"),$bin("Add",e.get("value"),1)],$dict([]));
return e.get("value");return null;}));
e.set("building_counts",$fn("building_counts",e,["sim", "cid"],[undefined,undefined],null,null,[],[],e=>{{const $t2037=$call(e.get("Counter"),[],$dict([]));e.set("counts",$t2037);}
for(const $t2038 of $iter($call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([])))){e.set("s",$t2038);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("s"),"country"),()=>e.get("cid")], ["Eq"]),()=>$compare([()=>$get(e.get("s"),"abandoned"),()=>null], ["Is"])]))){for(const $t2039 of $iter($call(e.get("getattr"),[e.get("s"),"buildings",$dict([])],$dict([])))){e.set("kind",$t2039);$setitem(e.get("counts"),e.get("kind"),$aug("Add",$item(e.get("counts"),e.get("kind")),1));}
}else{}
}
return e.get("counts");return null;}));
e.set("choose_site",$fn("choose_site",e,["sim", "origin", "around", "radius", "sea"],[undefined,undefined,null,40,false],null,null,[],[],e=>{$call(e.get("ensure_placed"),[e.get("sim")],$dict([]));
{const $t2040=$call(e.get("world"),[e.get("sim")],$dict([]));e.set("geo",$t2040);}
{const $t2041=$item(e.get("geo"),"land");e.set("comp",$t2041);}
{const $t2042=$item(e.get("geo"),"terrain");e.set("terrain",$t2042);}
{const $t2043=$item(e.get("geo"),"size");e.set("sizes",$t2043);}
{const $t2044=$call(e.get("settlement_counts"),[e.get("sim")],$dict([]));e.set("counts",$t2044);}
{const $t2045=($truth(e.get("around"))?e.get("around"):$tuple([$get(e.get("origin"),"gx"),$get(e.get("origin"),"gy")]));{const $t2046=Array.from($iter($t2045));e.set("cx",$t2046[0]);e.set("cy",$t2046[1]);}}
{const $t2047=$item($item(e.get("comp"),$get(e.get("origin"),"gy")),$get(e.get("origin"),"gx"));e.set("land",$t2047);}
{const $t2048=$compare([()=>$get($item($get(e.get("sim"),"countries"),$get(e.get("origin"),"country")),"government"),()=>e.get("AUTHORITY")], ["In"]);e.set("monarchy",$t2048);}
{const $t2049=$call(e.get("claims_list"),[e.get("sim"),e.get("counts")],$dict([]));e.set("claims",$t2049);}
{const $t2050=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2051 of $iter(e.get("claims"))){e.set("c",$t2051);yield $item(e.get("c"),4);}})();})(e));e.set("occupied",$t2050);}
{const $t2052=($truth(e.get("sea"))?22:14);e.set("prefer",$t2052);}
{const $t2053=null;e.set("best",$t2053);}
{const $t2054=$un("USub",1000000.0);e.set("best_score",$t2054);}
{const $t2055=$bin("Add",e.get("radius"),($truth(e.get("sea"))?25:0));e.set("reach_limit",$t2055);}
for(const $t2056 of $iter($call(e.get("range"),[$call(e.get("max"),[1,$bin("Sub",e.get("cy"),e.get("reach_limit"))],$dict([])),$call(e.get("min"),[$bin("Sub",e.get("H"),1),$bin("Add",$bin("Add",e.get("cy"),e.get("reach_limit")),1)],$dict([])),3],$dict([])))){e.set("y",$t2056);for(const $t2057 of $iter($call(e.get("range"),[$call(e.get("max"),[1,$bin("Sub",e.get("cx"),e.get("reach_limit"))],$dict([])),$call(e.get("min"),[$bin("Sub",e.get("W"),1),$bin("Add",$bin("Add",e.get("cx"),e.get("reach_limit")),1)],$dict([])),3],$dict([])))){e.set("x",$t2057);{const $t2058=$item($item(e.get("comp"),e.get("y")),e.get("x"));e.set("here",$t2058);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("here"),()=>0], ["Eq"]),()=>$compare([()=>$item($item(e.get("terrain"),e.get("y")),e.get("x")),()=>"mountains"], ["Eq"])]))){continue;}else{}
if($truth($boolop("And",[()=>e.get("sea"),()=>$boolop("Or",[()=>$compare([()=>e.get("here"),()=>e.get("land")], ["Eq"]),()=>$compare([()=>$item(e.get("sizes"),e.get("here")),()=>25], ["Lt"])])]))){continue;}else{}
if($truth($boolop("And",[()=>$un("Not",e.get("sea")),()=>$compare([()=>e.get("here"),()=>e.get("land")], ["NotEq"])]))){continue;}else{}
{const $t2059=99.0;e.set("nearest",$t2059);}
{const $t2060=99.0;e.set("rival",$t2060);}
{const $t2061=false;e.set("claimed",$t2061);}
for(const $t2062 of $iter(e.get("claims"))){{const $t2063=Array.from($iter($t2062));e.set("country",$t2063[0]);e.set("sx",$t2063[1]);e.set("sy",$t2063[2]);e.set("r",$t2063[3]);e.set("other_land",$t2063[4]);}{const $t2064=$bin("Pow",$bin("Add",$bin("Pow",$bin("Sub",e.get("sx"),e.get("x")),2),$bin("Pow",$bin("Sub",e.get("sy"),e.get("y")),2)),0.5);e.set("d",$t2064);}
if($truth($compare([()=>e.get("d"),()=>e.get("nearest")], ["Lt"]))){{const $t2065=e.get("d");e.set("nearest",$t2065);}
}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("country"),()=>$get(e.get("origin"),"country")], ["NotEq"]),()=>$compare([()=>e.get("d"),()=>e.get("rival")], ["Lt"])]))){{const $t2066=e.get("d");e.set("rival",$t2066);}
}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("d"),()=>$bin("Add",e.get("r"),1)], ["LtE"]),()=>$compare([()=>e.get("other_land"),()=>e.get("here")], ["Eq"])]))){{const $t2067=true;e.set("claimed",$t2067);}
}else{}
}
if($truth($boolop("Or",[()=>$compare([()=>e.get("nearest"),()=>7], ["Lt"]),()=>e.get("claimed")]))){continue;}else{}
if($truth($boolop("And",[()=>e.get("sea"),()=>$compare([()=>$call(e.get("coast_cell"),[e.get("sim"),e.get("x"),e.get("y")],$dict([])),()=>null], ["Is"])]))){continue;}else{}
{const $t2068=$call(e.get("site_quality"),[e.get("sim"),e.get("x"),e.get("y")],$dict([]));e.set("quality",$t2068);}
if($truth($compare([()=>e.get("quality"),()=>0.8], ["Lt"]))){continue;}else{}
{const $t2069=$bin("Sub",e.get("quality"),$bin("Mult",$call(e.get("abs"),[$bin("Sub",$call(e.get("dist"),[$get(e.get("origin"),"gx"),$get(e.get("origin"),"gy"),e.get("x"),e.get("y")],$dict([])),e.get("prefer"))],$dict([])),0.08));e.set("score",$t2069);}
if($truth($boolop("And",[()=>e.get("sea"),()=>$compare([()=>e.get("here"),()=>e.get("occupied")], ["NotIn"])]))){e.set("score",$aug("Add",e.get("score"),1.5));}else{}
if($truth($compare([()=>e.get("rival"),()=>18], ["Lt"]))){e.set("score",$aug("Add",e.get("score"),($truth(e.get("monarchy"))?0.6:$un("USub",0.3))));}else{}
if($truth($compare([()=>e.get("score"),()=>e.get("best_score")], ["Gt"]))){{const $t2070=e.get("score");e.set("best_score",$t2070);}
{const $t2071=$tuple([e.get("x"),e.get("y")]);e.set("best",$t2071);}
}else{}
}
}
return e.get("best");return null;}));
e.set("_path_costs",$fn("_path_costs",e,["sim", "cells"],[undefined,undefined],null,null,[],[],e=>{{const $t2072=[];e.set("costs",$t2072);}
for(const $t2073 of $iter($call(e.get("range"),[1,$call(e.get("len"),[e.get("cells")],$dict([]))],$dict([])))){e.set("i",$t2073);$call($get(e.get("costs"),"append"),[$call(e.get("step_cost"),[e.get("sim"),$item($item(e.get("cells"),$bin("Sub",e.get("i"),1)),0),$item($item(e.get("cells"),$bin("Sub",e.get("i"),1)),1),$item($item(e.get("cells"),e.get("i")),0),$item($item(e.get("cells"),e.get("i")),1)],$dict([]))],$dict([]));
}
return e.get("costs");return null;}));
e.set("_sea_costs",$fn("_sea_costs",e,["cells"],[undefined],null,null,[],[],e=>{{const $t2074=[];e.set("costs",$t2074);}
for(const $t2075 of $iter($call(e.get("range"),[1,$call(e.get("len"),[e.get("cells")],$dict([]))],$dict([])))){e.set("i",$t2075);{const $t2076=$boolop("And",[()=>$compare([()=>$item($item(e.get("cells"),e.get("i")),0),()=>$item($item(e.get("cells"),$bin("Sub",e.get("i"),1)),0)], ["NotEq"]),()=>$compare([()=>$item($item(e.get("cells"),e.get("i")),1),()=>$item($item(e.get("cells"),$bin("Sub",e.get("i"),1)),1)], ["NotEq"])]);e.set("diagonal",$t2076);}
$call($get(e.get("costs"),"append"),[($truth(e.get("diagonal"))?1.41:1.0)],$dict([]));
}
return e.get("costs");return null;}));
e.set("_can_sail",$fn("_can_sail",e,["sim", "origin"],[undefined,undefined],null,null,[],[],e=>{return $boolop("And",[()=>$compare([()=>"sailing",()=>$get($item($get(e.get("sim"),"countries"),$get(e.get("origin"),"country")),"technologies")], ["In"]),()=>$call(e.get("_coast"),[e.get("sim"),e.get("origin")],$dict([]))]);return null;}));
e.set("launch_expedition",$fn("launch_expedition",e,["sim", "origin", "kind", "size", "target", "forced"],[undefined,undefined,"found",null,null,false],null,null,[],[],e=>{$call(e.get("ensure_placed"),[e.get("sim")],$dict([]));
{const $t2077=$call(e.get("_list"),[e.get("sim"),"expeditions"],$dict([]));e.set("exps",$t2077);}
{const $t2078=$item($get(e.get("sim"),"countries"),$get(e.get("origin"),"country"));e.set("country",$t2078);}
if($truth($un("Not",e.get("forced")))){if($truth($boolop("Or",[()=>$compare([()=>$call(e.get("len"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2079 of $iter(e.get("exps"))){e.set("e",$t2079);if($truth($compare([()=>$item(e.get("e"),"country"),()=>$get(e.get("origin"),"country")], ["Eq"]))){yield e.get("e");}}})();})(e))],$dict([])),()=>1], ["GtE"]),()=>$compare([()=>$call(e.get("len"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2080 of $iter(e.get("exps"))){e.set("e",$t2080);if($truth($compare([()=>$item(e.get("e"),"kind"),()=>"found"], ["Eq"]))){yield e.get("e");}}})();})(e))],$dict([])),()=>2], ["GtE"])]))){return null;}else{}
if($truth($compare([()=>$bin("Sub",$get(e.get("sim"),"year"),$call(e.get("getattr"),[e.get("country"),"last_launch",$un("USub",99)],$dict([]))),()=>6], ["Lt"]))){return null;}else{}
}else{}
{const $t2081=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2082 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t2082);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("p"),"settlement"),()=>$get(e.get("origin"),"id")], ["Eq"]),()=>$un("Not",$call(e.get("getattr"),[e.get("p"),"expedition",null],$dict([])))]))){yield e.get("p");}}})();})(e));e.set("residents",$t2081);}
{const $t2083=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2084 of $iter(e.get("residents"))){e.set("p",$t2084);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"]),()=>$compare([()=>$get(e.get("p"),"infection"),()=>null], ["Is"])]))){yield e.get("p");}}})();})(e));e.set("adults",$t2083);}
if($truth($boolop("Or",[()=>$compare([()=>$call(e.get("len"),[e.get("residents")],$dict([])),()=>20], ["Lt"]),()=>$un("Not",e.get("adults"))]))){return null;}else{}
{const $t2085="land";e.set("mode",$t2085);}
{const $t2086=null;e.set("site",$t2086);}
{const $t2087=null;e.set("route",$t2087);}
if($truth($compare([()=>e.get("target"),()=>null], ["IsNot"]))){{const $t2088=e.get("target");e.set("site",$t2088);}
{const $t2089=$call(e.get("find_path"),[e.get("sim"),$tuple([$get(e.get("origin"),"gx"),$get(e.get("origin"),"gy")]),$tuple([$item(e.get("site"),0),$item(e.get("site"),1)])],$dict([]));e.set("route",$t2089);}
if($truth($boolop("And",[()=>$compare([()=>e.get("route"),()=>null], ["Is"]),()=>$call(e.get("_can_sail"),[e.get("sim"),e.get("origin")],$dict([]))]))){{const $t2090=$call(e.get("find_sea_route"),[e.get("sim"),$tuple([$get(e.get("origin"),"gx"),$get(e.get("origin"),"gy")]),$tuple([$item(e.get("site"),0),$item(e.get("site"),1)])],$dict([]));e.set("route",$t2090);}
{const $t2091="sea";e.set("mode",$t2091);}
}else{}
}else{{const $t2092=$boolop("And",[()=>$call(e.get("_can_sail"),[e.get("sim"),e.get("origin")],$dict([])),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.35], ["Lt"])]);e.set("by_sea_first",$t2092);}
for(const $t2093 of $iter(($truth(e.get("by_sea_first"))?["sea","land"]:["land","sea"]))){e.set("attempt",$t2093);if($truth($boolop("And",[()=>$compare([()=>e.get("attempt"),()=>"sea"], ["Eq"]),()=>$un("Not",$call(e.get("_can_sail"),[e.get("sim"),e.get("origin")],$dict([])))]))){continue;}else{}
{const $t2094=$call(e.get("choose_site"),[e.get("sim"),e.get("origin")],$dict([["sea",$compare([()=>e.get("attempt"),()=>"sea"], ["Eq"])]]));e.set("found",$t2094);}
if($truth($compare([()=>e.get("found"),()=>null], ["Is"]))){continue;}else{}
{const $t2095=($truth($compare([()=>e.get("attempt"),()=>"sea"], ["Eq"]))?$call(e.get("find_sea_route"),[e.get("sim"),$tuple([$get(e.get("origin"),"gx"),$get(e.get("origin"),"gy")]),e.get("found")],$dict([])):$call(e.get("find_path"),[e.get("sim"),$tuple([$get(e.get("origin"),"gx"),$get(e.get("origin"),"gy")]),e.get("found")],$dict([])));e.set("route",$t2095);}
if($truth($compare([()=>e.get("route"),()=>null], ["IsNot"]))){{const $t2096=e.get("found");e.set("site",$t2096);}
{const $t2097=e.get("attempt");e.set("mode",$t2097);}
break;}else{}
}
}
if($truth($boolop("Or",[()=>$compare([()=>e.get("site"),()=>null], ["Is"]),()=>$compare([()=>e.get("route"),()=>null], ["Is"])]))){return null;}else{}
{const $t2098=e.get("route");{const $t2099=Array.from($iter($t2098));e.set("cells",$t2099[0]);e.set("total",$t2099[1]);}}
{const $t2100=$call(e.get("min"),[$boolop("Or",[()=>e.get("size"),()=>$call(e.get("min"),[25,$call(e.get("max"),[8,$bin("FloorDiv",$call(e.get("len"),[e.get("residents")],$dict([])),4)],$dict([]))],$dict([]))]),$bin("Sub",$call(e.get("len"),[e.get("residents")],$dict([])),10)],$dict([]));e.set("limit",$t2100);}
if($truth($compare([()=>e.get("limit"),()=>6], ["Lt"]))){return null;}else{}
{const $t2101=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("adults")],$dict([]));e.set("founder",$t2101);}
{const $t2102=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2103 of $iter(e.get("residents"))){e.set("p",$t2103);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("p"),"lineage"),()=>$get(e.get("founder"),"lineage")], ["Eq"]),()=>$compare([()=>$get(e.get("p"),"id"),()=>$get(e.get("founder"),"id")], ["NotEq"]),()=>$compare([()=>$get(e.get("p"),"infection"),()=>null], ["Is"])]))){yield e.get("p");}}})();})(e));e.set("family",$t2102);}
{const $t2104=$bin("Add",[e.get("founder")],$item(e.get("family"),$slice(null,$bin("Sub",e.get("limit"),1),null)));e.set("selected",$t2104);}
{const $t2105=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2106 of $iter(e.get("selected"))){e.set("p",$t2106);yield $get(e.get("p"),"id");}})();})(e));e.set("chosen",$t2105);}
{const $t2107=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2108 of $iter(e.get("residents"))){e.set("p",$t2108);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("p"),"id"),()=>e.get("chosen")], ["NotIn"]),()=>$compare([()=>$get(e.get("p"),"infection"),()=>null], ["Is"])]))){yield e.get("p");}}})();})(e));e.set("others",$t2107);}
{const $t2109=$boolop("Or",[()=>e.get("size"),()=>10]);e.set("wanted",$t2109);}
e.set("selected",$aug("Add",e.get("selected"),$call($get($get(e.get("sim"),"rng"),"sample"),[e.get("others"),$call(e.get("min"),[$call(e.get("max"),[0,$bin("Sub",e.get("wanted"),$call(e.get("len"),[e.get("selected")],$dict([])))],$dict([])),$call(e.get("len"),[e.get("others")],$dict([]))],$dict([]))],$dict([]))));{const $t2110=$call(e.get("tech_effects"),[$get(e.get("country"),"technologies")],$dict([]));e.set("fx",$t2110);}
{const $t2111=($truth($compare([()=>e.get("mode"),()=>"sea"], ["Eq"]))?$bin("Mult",e.get("SEA_SPEED"),$bin("Add",1,$item(e.get("fx"),"sea"))):$bin("Mult",e.get("SPEED"),$bin("Add",1,$item(e.get("fx"),"land"))));e.set("speed",$t2111);}
{const $t2112=$dict([["id",$call(e.get("_next"),[e.get("sim"),"next_expedition"],$dict([]))],["kind",e.get("kind")],["mode",e.get("mode")],["speed",e.get("speed")],["country",$get(e.get("origin"),"country")],["origin",$get(e.get("origin"),"id")],["target",[$item(e.get("site"),0),$item(e.get("site"),1)]],["path",Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2113 of $iter(e.get("cells"))){{const $t2114=Array.from($iter($t2113));e.set("x",$t2114[0]);e.set("y",$t2114[1]);}yield [e.get("x"),e.get("y")];}})();})(e))],["costs",($truth($compare([()=>e.get("mode"),()=>"sea"], ["Eq"]))?$call(e.get("_sea_costs"),[e.get("cells")],$dict([])):$call(e.get("_path_costs"),[e.get("sim"),e.get("cells")],$dict([])))],["index",0],["carry",0.0],["people",Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2115 of $iter(e.get("selected"))){e.set("p",$t2115);yield $get(e.get("p"),"id");}})();})(e))],["leader",$get(e.get("founder"),"id")],["start",$get(e.get("sim"),"year")],["total",e.get("total")]]);e.set("exp",$t2112);}
for(const $t2116 of $iter(e.get("selected"))){e.set("p",$t2116);{const $t2117=$item(e.get("exp"),"id");$set(e.get("p"),"expedition",$t2117);}
}
$call($get(e.get("exps"),"append"),[e.get("exp")],$dict([]));
{const $t2118=$get(e.get("sim"),"year");$set(e.get("country"),"last_launch",$t2118);}
{const $t2119=$item($item($item($call(e.get("world"),[e.get("sim")],$dict([])),"terrain"),$item(e.get("site"),1)),$item(e.get("site"),0));e.set("terrain",$t2119);}
{const $t2120=$call($get(e.get("sim"),"person_reference"),[e.get("founder")],$dict([]));e.set("ref",$t2120);}
{const $t2121=($truth($compare([()=>e.get("mode"),()=>"sea"], ["Eq"]))?($fmt(e.get("ref"),-1,null)+" sailed from "+$fmt($get(e.get("origin"),"name"),-1,null)+" with "+$fmt($call(e.get("len"),[e.get("selected")],$dict([])),-1,null)+" settlers"):($fmt(e.get("ref"),-1,null)+" led "+$fmt($call(e.get("len"),[e.get("selected")],$dict([])),-1,null)+" settlers out of "+$fmt($get(e.get("origin"),"name"),-1,null)));e.set("opening",$t2121);}
$call($get(e.get("sim"),"record"),[($fmt(e.get("opening"),-1,null)+" to found a new "+$fmt($get(e.get("country"),"name"),-1,null)+" town on "+$fmt(e.get("terrain"),-1,null)+" land"+$fmt(($truth($compare([()=>e.get("mode"),()=>"sea"], ["Eq"]))?" across the sea":""),-1,null)+"; the journey should take about "+$fmt($bin("Add",$call(e.get("int"),[$bin("Div",e.get("total"),e.get("speed"))],$dict([])),1),-1,null)+" years."),"political"],$dict([]));
return e.get("exp");return null;}));
e.set("launch_migration",$fn("launch_migration",e,["sim", "origin", "target", "members", "kind"],[undefined,undefined,undefined,undefined,"migrate"],null,null,[],[],e=>{$call(e.get("ensure_placed"),[e.get("sim")],$dict([]));
{const $t2122=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2123 of $iter(e.get("members"))){e.set("p",$t2123);if($truth($un("Not",$call(e.get("getattr"),[e.get("p"),"expedition",null],$dict([]))))){yield e.get("p");}}})();})(e));e.set("members",$t2122);}
if($truth($un("Not",e.get("members")))){return null;}else{}
{const $t2124=null;e.set("route",$t2124);}
if($truth($compare([()=>$call(e.get("dist"),[$get(e.get("origin"),"gx"),$get(e.get("origin"),"gy"),$get(e.get("target"),"gx"),$get(e.get("target"),"gy")],$dict([])),()=>4], ["Gt"]))){{const $t2125=$call(e.get("find_path"),[e.get("sim"),$tuple([$get(e.get("origin"),"gx"),$get(e.get("origin"),"gy")]),$tuple([$get(e.get("target"),"gx"),$get(e.get("target"),"gy")])],$dict([]));e.set("route",$t2125);}
}else{}
if($truth($compare([()=>e.get("route"),()=>null], ["Is"]))){for(const $t2126 of $iter(e.get("members"))){e.set("p",$t2126);{const $t2127=$get(e.get("target"),"id");$set(e.get("p"),"settlement",$t2127);}
}
return null;}else{}
{const $t2128=e.get("route");{const $t2129=Array.from($iter($t2128));e.set("cells",$t2129[0]);e.set("total",$t2129[1]);}}
{const $t2130=$dict([["id",$call(e.get("_next"),[e.get("sim"),"next_expedition"],$dict([]))],["kind",e.get("kind")],["country",$get(e.get("origin"),"country")],["origin",$get(e.get("origin"),"id")],["target",[$get(e.get("target"),"gx"),$get(e.get("target"),"gy")]],["target_settlement",$get(e.get("target"),"id")],["path",Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2131 of $iter(e.get("cells"))){{const $t2132=Array.from($iter($t2131));e.set("x",$t2132[0]);e.set("y",$t2132[1]);}yield [e.get("x"),e.get("y")];}})();})(e))],["costs",$call(e.get("_path_costs"),[e.get("sim"),e.get("cells")],$dict([]))],["index",0],["carry",0.0],["people",Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2133 of $iter(e.get("members"))){e.set("p",$t2133);yield $get(e.get("p"),"id");}})();})(e))],["leader",$get($item(e.get("members"),0),"id")],["start",$get(e.get("sim"),"year")],["total",e.get("total")]]);e.set("exp",$t2130);}
for(const $t2134 of $iter(e.get("members"))){e.set("p",$t2134);{const $t2135=$item(e.get("exp"),"id");$set(e.get("p"),"expedition",$t2135);}
}
$call($get($call(e.get("_list"),[e.get("sim"),"expeditions"],$dict([])),"append"),[e.get("exp")],$dict([]));
return e.get("exp");return null;}));
e.set("launch_emigration",$fn("launch_emigration",e,["sim", "origin", "groups"],[undefined,undefined,undefined],null,null,[],[],e=>{$call(e.get("ensure_placed"),[e.get("sim")],$dict([]));
{const $t2136=$call(e.get("contacts"),[e.get("sim")],$dict([]));{const $t2137=Array.from($iter($t2136));e.set("land",$t2137[0]);e.set("sea",$t2137[1]);}}
{const $t2138=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2139 of $iter($call(e.get("sorted"),[$call($get(e.get("land"),"get"),[$get(e.get("origin"),"country"),$call(e.get("set"),[],$dict([]))],$dict([]))],$dict([])))){e.set("n",$t2139);if($truth($boolop("And",[()=>$compare([()=>$call(e.get("tuple"),[$call(e.get("sorted"),[[$get(e.get("origin"),"country"),e.get("n")]],$dict([]))],$dict([])),()=>$get(e.get("sim"),"wars")], ["NotIn"]),()=>$compare([()=>$get($item($get(e.get("sim"),"countries"),e.get("n")),"ended"),()=>null], ["Is"])]))){yield e.get("n");}}})();})(e));e.set("neighbors",$t2138);}
if($truth($un("Not",e.get("neighbors")))){return null;}else{}
{const $t2140=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("neighbors")],$dict([]));e.set("host",$t2140);}
{const $t2141=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2142 of $iter($call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([])))){e.set("s",$t2142);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("s"),"country"),()=>e.get("host")], ["Eq"]),()=>$compare([()=>$get(e.get("s"),"abandoned"),()=>null], ["Is"]),()=>$call($get(e.get("groups"),"get"),[$get(e.get("s"),"id")],$dict([]))]))){yield e.get("s");}}})();})(e));e.set("towns",$t2141);}
if($truth($un("Not",e.get("towns")))){return null;}else{}
{const $t2143=$item(e.get("towns"),0);e.set("target",$t2143);}
for(const $t2144 of $iter(e.get("towns"))){e.set("s",$t2144);if($truth($compare([()=>$call(e.get("dist"),[$get(e.get("s"),"gx"),$get(e.get("s"),"gy"),$get(e.get("origin"),"gx"),$get(e.get("origin"),"gy")],$dict([])),()=>$call(e.get("dist"),[$get(e.get("target"),"gx"),$get(e.get("target"),"gy"),$get(e.get("origin"),"gx"),$get(e.get("origin"),"gy")],$dict([]))], ["Lt"]))){{const $t2145=e.get("s");e.set("target",$t2145);}
}else{}
}
{const $t2146=$call(e.get("find_path"),[e.get("sim"),$tuple([$get(e.get("origin"),"gx"),$get(e.get("origin"),"gy")]),$tuple([$get(e.get("target"),"gx"),$get(e.get("target"),"gy")])],$dict([]));e.set("route",$t2146);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("route"),()=>null], ["Is"]),()=>$compare([()=>$call(e.get("len"),[$item(e.get("route"),0)],$dict([])),()=>2], ["Lt"])]))){return null;}else{}
{const $t2147=$get($item($get(e.get("sim"),"countries"),$get(e.get("origin"),"country")),"ruler");e.set("ruler",$t2147);}
{const $t2148=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2149 of $iter($call($get(e.get("groups"),"get"),[$get(e.get("origin"),"id"),[]],$dict([])))){e.set("p",$t2149);if($truth($boolop("And",[()=>$un("Not",$call(e.get("getattr"),[e.get("p"),"expedition",null],$dict([]))),()=>$compare([()=>$get(e.get("p"),"id"),()=>e.get("ruler")], ["NotEq"]),()=>$compare([()=>$get(e.get("p"),"infection"),()=>null], ["Is"])]))){yield e.get("p");}}})();})(e));e.set("residents",$t2148);}
{const $t2150=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2151 of $iter(e.get("residents"))){e.set("p",$t2151);if($truth($compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"]))){yield e.get("p");}}})();})(e));e.set("adults",$t2150);}
if($truth($un("Not",e.get("adults")))){return null;}else{}
{const $t2152=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("adults")],$dict([]));e.set("migrant",$t2152);}
{const $t2153=$item(Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2154 of $iter(e.get("residents"))){e.set("p",$t2154);if($truth($compare([()=>$get(e.get("p"),"lineage"),()=>$get(e.get("migrant"),"lineage")], ["Eq"]))){yield e.get("p");}}})();})(e)),$slice(null,12,null));e.set("members",$t2153);}
{const $t2155=e.get("route");{const $t2156=Array.from($iter($t2155));e.set("cells",$t2156[0]);e.set("total",$t2156[1]);}}
{const $t2157=$dict([["id",$call(e.get("_next"),[e.get("sim"),"next_expedition"],$dict([]))],["kind","emigrant"],["country",$get(e.get("origin"),"country")],["origin",$get(e.get("origin"),"id")],["target",[$get(e.get("target"),"gx"),$get(e.get("target"),"gy")]],["target_settlement",$get(e.get("target"),"id")],["path",Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2158 of $iter(e.get("cells"))){{const $t2159=Array.from($iter($t2158));e.set("x",$t2159[0]);e.set("y",$t2159[1]);}yield [e.get("x"),e.get("y")];}})();})(e))],["costs",$call(e.get("_path_costs"),[e.get("sim"),e.get("cells")],$dict([]))],["index",0],["carry",0.0],["people",Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2160 of $iter(e.get("members"))){e.set("p",$t2160);yield $get(e.get("p"),"id");}})();})(e))],["leader",$get(e.get("migrant"),"id")],["start",$get(e.get("sim"),"year")],["total",e.get("total")]]);e.set("exp",$t2157);}
for(const $t2161 of $iter(e.get("members"))){e.set("p",$t2161);{const $t2162=$item(e.get("exp"),"id");$set(e.get("p"),"expedition",$t2162);}
}
$call($get($call(e.get("_list"),[e.get("sim"),"expeditions"],$dict([])),"append"),[e.get("exp")],$dict([]));
$call($get(e.get("sim"),"record"),[($fmt($call(e.get("len"),[e.get("members")],$dict([])),-1,null)+" people from "+$fmt($get(e.get("origin"),"name"),-1,null)+" set out for "+$fmt($get(e.get("target"),"name"),-1,null)+" in "+$fmt($get($item($get(e.get("sim"),"countries"),e.get("host")),"name"),-1,null)+"."),"population"],$dict([]));
return e.get("exp");return null;}));
e.set("_arrive_abroad",$fn("_arrive_abroad",e,["sim", "exp", "members", "origin", "country", "destination"],[undefined,undefined,undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t2163=$item($get(e.get("sim"),"countries"),$get(e.get("destination"),"country"));e.set("host",$t2163);}
{const $t2164=$call(e.get("tuple"),[$call(e.get("sorted"),[[$get(e.get("country"),"id"),$get(e.get("host"),"id")]],$dict([]))],$dict([]));e.set("pair",$t2164);}
if($truth($boolop("Or",[()=>$compare([()=>$get(e.get("destination"),"abandoned"),()=>null], ["IsNot"]),()=>$compare([()=>$get(e.get("host"),"ended"),()=>null], ["IsNot"]),()=>$compare([()=>e.get("pair"),()=>$get(e.get("sim"),"wars")], ["In"])]))){$call(e.get("_release"),[e.get("sim"),e.get("exp")],$dict([]));
return null;}else{}
{const $t2165=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2166 of $iter(e.get("members"))){e.set("p",$t2166);if($truth($compare([()=>$get(e.get("p"),"id"),()=>$get(e.get("country"),"ruler")], ["NotEq"]))){yield e.get("p");}}})();})(e));e.set("movers",$t2165);}
for(const $t2167 of $iter(e.get("members"))){e.set("person",$t2167);{const $t2168=null;$set(e.get("person"),"expedition",$t2168);}
}
for(const $t2169 of $iter(e.get("movers"))){e.set("person",$t2169);{const $t2170=$get(e.get("destination"),"id");$set(e.get("person"),"settlement",$t2170);}
{const $t2171=$get(e.get("host"),"id");$set(e.get("person"),"country",$t2171);}
}
$call(e.get("_drop"),[$call(e.get("_list"),[e.get("sim"),"expeditions"],$dict([])),e.get("exp")],$dict([]));
if($truth($un("Not",e.get("movers")))){return null;}else{}
$call($get(e.get("sim"),"record"),[($fmt($call(e.get("len"),[e.get("movers")],$dict([])),-1,null)+" newcomers from "+$fmt($get(e.get("country"),"name"),-1,null)+" ("+$fmt($get(e.get("origin"),"name"),-1,null)+") settled in "+$fmt($get(e.get("destination"),"name"),-1,null)+" in "+$fmt($get(e.get("host"),"name"),-1,null)+"."),"population"],$dict([]));
e.set("pass_on_knowledge",$get($import("society"),"pass_on_knowledge"));{const $t2172=$call(e.get("pass_on_knowledge"),[e.get("sim"),e.get("country"),e.get("host"),$call(e.get("min"),[0.8,$bin("Mult",0.08,$call(e.get("len"),[e.get("movers")],$dict([])))],$dict([]))],$dict([]));e.set("got",$t2172);}
if($truth(e.get("got"))){$call($get(e.get("sim"),"record"),[("Settlers from "+$fmt($get(e.get("country"),"name"),-1,null)+" brought knowledge of "+$fmt($item(e.get("got"),0),-1,null)+" to "+$fmt($get(e.get("host"),"name"),-1,null)+"."),"discovery"],$dict([]));
}else{}
return null;}));
e.set("_release",$fn("_release",e,["sim", "exp"],[undefined,undefined],null,null,[],[],e=>{for(const $t2173 of $iter($item(e.get("exp"),"people"))){e.set("pid",$t2173);{const $t2174=$call($get($get(e.get("sim"),"people"),"get"),[e.get("pid")],$dict([]));e.set("person",$t2174);}
if($truth($compare([()=>e.get("person"),()=>null], ["IsNot"]))){{const $t2175=null;$set(e.get("person"),"expedition",$t2175);}
}else{}
}
{const $t2176=$call(e.get("_list"),[e.get("sim"),"expeditions"],$dict([]));e.set("exps",$t2176);}
$call(e.get("_drop"),[e.get("exps"),e.get("exp")],$dict([]));
return null;}));
e.set("_kill_traveler",$fn("_kill_traveler",e,["sim", "person"],[undefined,undefined],null,null,[],[],e=>{{const $t2177=$get(e.get("sim"),"year");$set(e.get("person"),"died",$t2177);}
{const $t2178="hardships of the journey";$set(e.get("person"),"cause_of_death",$t2178);}
$set($item($get(e.get("sim"),"lineages"),$get(e.get("person"),"lineage")),"deaths",$aug("Add",$get($item($get(e.get("sim"),"lineages"),$get(e.get("person"),"lineage")),"deaths"),1));$del($get(e.get("sim"),"people"),$get(e.get("person"),"id"));return null;}));
e.set("advance_expeditions",$fn("advance_expeditions",e,["sim"],[undefined],null,null,[],[],e=>{{const $t2179=$call(e.get("_list"),[e.get("sim"),"expeditions"],$dict([]));e.set("exps",$t2179);}
if($truth($un("Not",e.get("exps")))){return 0;}else{}
$call(e.get("ensure_placed"),[e.get("sim")],$dict([]));
{const $t2180=$item($call(e.get("world"),[e.get("sim")],$dict([])),"terrain");e.set("rows",$t2180);}
{const $t2181=0;e.set("died",$t2181);}
for(const $t2182 of $iter($call(e.get("list"),[e.get("exps")],$dict([])))){e.set("exp",$t2182);{const $t2183=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2184 of $iter($item(e.get("exp"),"people"))){e.set("i",$t2184);if($truth($compare([()=>e.get("i"),()=>$get(e.get("sim"),"people")], ["In"]))){yield $item($get(e.get("sim"),"people"),e.get("i"));}}})();})(e));e.set("members",$t2183);}
if($truth(e.get("members"))){{const $t2185=$boolop("Or",[()=>$call($get($get(e.get("sim"),"people"),"get"),[$item(e.get("exp"),"leader")],$dict([])),()=>$item(e.get("members"),0)]);e.set("leader",$t2185);}
{const $t2186=$get(e.get("leader"),"country");$setitem(e.get("exp"),"country",$t2186);}
{const $t2187=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2188 of $iter(e.get("members"))){e.set("p",$t2188);if($truth($compare([()=>$get(e.get("p"),"country"),()=>$item(e.get("exp"),"country")], ["Eq"]))){yield e.get("p");}}})();})(e));e.set("members",$t2187);}
}else{}
{const $t2189=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2190 of $iter($item(e.get("exp"),"people"))){e.set("i",$t2190);if($truth($boolop("And",[()=>$compare([()=>e.get("i"),()=>$get(e.get("sim"),"people")], ["In"]),()=>$compare([()=>$item($get(e.get("sim"),"people"),e.get("i")),()=>e.get("members")], ["NotIn"])]))){yield $item($get(e.get("sim"),"people"),e.get("i"));}}})();})(e));e.set("released",$t2189);}
for(const $t2191 of $iter(e.get("released"))){e.set("person",$t2191);{const $t2192=null;$set(e.get("person"),"expedition",$t2192);}
}
{const $t2193=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2194 of $iter(e.get("members"))){e.set("p",$t2194);yield $get(e.get("p"),"id");}})();})(e));$setitem(e.get("exp"),"people",$t2193);}
{const $t2195=$item($get(e.get("sim"),"settlements"),$item(e.get("exp"),"origin"));e.set("origin",$t2195);}
{const $t2196=($truth($compare([()=>$item(e.get("exp"),"kind"),()=>"found"], ["Eq"]))?4:1);e.set("minimum",$t2196);}
if($truth($boolop("Or",[()=>$compare([()=>$call(e.get("len"),[e.get("members")],$dict([])),()=>e.get("minimum")], ["Lt"]),()=>$compare([()=>$get($item($get(e.get("sim"),"countries"),$item(e.get("exp"),"country")),"ended"),()=>null], ["IsNot"])]))){$call($get(e.get("sim"),"record"),[("The expedition from "+$fmt($get(e.get("origin"),"name"),-1,null)+" dissolved on the road."),"political"],$dict([]));
$call(e.get("_release"),[e.get("sim"),e.get("exp")],$dict([]));
continue;}else{}
{const $t2197=$bin("Add",$call($get(e.get("exp"),"get"),["speed",e.get("SPEED")],$dict([])),$call($get(e.get("exp"),"get"),["carry",0.0],$dict([])));e.set("budget",$t2197);}
{const $t2198=$item(e.get("exp"),"index");e.set("index",$t2198);}
{const $t2199=$item(e.get("exp"),"path");e.set("path",$t2199);}
{const $t2200=$item(e.get("exp"),"costs");e.set("costs",$t2200);}
while($truth($boolop("And",[()=>$compare([()=>e.get("index"),()=>$bin("Sub",$call(e.get("len"),[e.get("path")],$dict([])),1)], ["Lt"]),()=>$compare([()=>e.get("budget"),()=>$item(e.get("costs"),e.get("index"))], ["GtE"])]))){e.set("budget",$aug("Sub",e.get("budget"),$item(e.get("costs"),e.get("index"))));e.set("index",$aug("Add",e.get("index"),1));}
{const $t2201=$call(e.get("min"),[e.get("budget"),6.0],$dict([]));$setitem(e.get("exp"),"carry",$t2201);}
{const $t2202=e.get("index");$setitem(e.get("exp"),"index",$t2202);}
{const $t2203=$item($item(e.get("rows"),$item($item(e.get("path"),e.get("index")),1)),$item($item(e.get("path"),e.get("index")),0));e.set("here",$t2203);}
{const $t2204=$call($get(e.get("TRAVEL_RISK"),"get"),[e.get("here"),0.0015],$dict([]));e.set("risk",$t2204);}
if($truth($compare([()=>e.get("here"),()=>"ocean"], ["Eq"]))){e.set("risk",$aug("Mult",e.get("risk"),$call(e.get("max"),[0.35,$bin("Sub",1,$bin("Mult",0.8,$item($call(e.get("tech_effects"),[$get($item($get(e.get("sim"),"countries"),$item(e.get("exp"),"country")),"technologies")],$dict([])),"sea")))],$dict([]))));if($truth($item($call(e.get("building_counts"),[e.get("sim"),$item(e.get("exp"),"country")],$dict([])),"lighthouse"))){e.set("risk",$aug("Mult",e.get("risk"),0.5));}else{}
}else{}
{const $t2205=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2206 of $iter(e.get("members"))){e.set("p",$t2206);if($truth($compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>e.get("risk")], ["Lt"]))){yield e.get("p");}}})();})(e));e.set("lost",$t2205);}
for(const $t2207 of $iter(e.get("lost"))){e.set("person",$t2207);$call(e.get("_kill_traveler"),[e.get("sim"),e.get("person")],$dict([]));
}
e.set("died",$aug("Add",e.get("died"),$call(e.get("len"),[e.get("lost")],$dict([]))));{const $t2208=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2209 of $iter(e.get("members"))){e.set("p",$t2209);if($truth($compare([()=>$get(e.get("p"),"id"),()=>$get(e.get("sim"),"people")], ["In"]))){yield e.get("p");}}})();})(e));e.set("members",$t2208);}
{const $t2210=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2211 of $iter(e.get("members"))){e.set("p",$t2211);yield $get(e.get("p"),"id");}})();})(e));$setitem(e.get("exp"),"people",$t2210);}
if($truth($compare([()=>$call(e.get("len"),[e.get("members")],$dict([])),()=>e.get("minimum")], ["Lt"]))){$call($get(e.get("sim"),"record"),[("The party from "+$fmt($get(e.get("origin"),"name"),-1,null)+" turned back after the "+$fmt(e.get("here"),-1,null)+" claimed too many lives."),"political"],$dict([]));
$call(e.get("_release"),[e.get("sim"),e.get("exp")],$dict([]));
continue;}else{}
if($truth($compare([()=>e.get("index"),()=>$bin("Sub",$call(e.get("len"),[e.get("path")],$dict([])),1)], ["GtE"]))){$call(e.get("_arrive"),[e.get("sim"),e.get("exp"),e.get("members")],$dict([]));
}else{}
}
return e.get("died");return null;}));
e.set("_arrive",$fn("_arrive",e,["sim", "exp", "members"],[undefined,undefined,undefined],null,null,[],[],e=>{{const $t2212=$item($get(e.get("sim"),"settlements"),$item(e.get("exp"),"origin"));e.set("origin",$t2212);}
{const $t2213=$item($get(e.get("sim"),"countries"),$item(e.get("exp"),"country"));e.set("country",$t2213);}
{const $t2214=$call(e.get("max"),[1,$bin("Sub",$get(e.get("sim"),"year"),$item(e.get("exp"),"start"))],$dict([]));e.set("years",$t2214);}
if($truth($compare([()=>$item(e.get("exp"),"kind"),()=>"found"], ["Eq"]))){{const $t2215=$tuple([$item($item(e.get("exp"),"target"),0),$item($item(e.get("exp"),"target"),1)]);e.set("target",$t2215);}
{const $t2216=$call(e.get("settlement_counts"),[e.get("sim")],$dict([]));e.set("counts",$t2216);}
{const $t2217=$call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t2218 of $iter($call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([])))){e.set("s",$t2218);if($truth($compare([()=>$get(e.get("s"),"abandoned"),()=>null], ["Is"]))){yield $boolop("And",[()=>$compare([()=>$get(e.get("s"),"gx"),()=>$item(e.get("target"),0)], ["Eq"]),()=>$compare([()=>$get(e.get("s"),"gy"),()=>$item(e.get("target"),1)], ["Eq"])]);}}})();})(e)],$dict([]));e.set("occupied",$t2217);}
{const $t2219=$call(e.get("claim_owner"),[e.get("sim"),$item(e.get("target"),0),$item(e.get("target"),1),e.get("counts")],$dict([]));e.set("owner",$t2219);}
if($truth($boolop("Or",[()=>e.get("occupied"),()=>$boolop("And",[()=>e.get("owner"),()=>$compare([()=>e.get("owner"),()=>$item(e.get("exp"),"country")], ["NotEq"])])]))){{const $t2220=$call(e.get("choose_site"),[e.get("sim"),e.get("origin")],$dict([["around",e.get("target")],["radius",8],["sea",$compare([()=>$call($get(e.get("exp"),"get"),["mode"],$dict([])),()=>"sea"], ["Eq"])]]));e.set("alt",$t2220);}
if($truth($compare([()=>e.get("alt"),()=>null], ["Is"]))){$call($get(e.get("sim"),"record"),[("Settlers from "+$fmt($get(e.get("origin"),"name"),-1,null)+" found their destination taken and returned home."),"political"],$dict([]));
$call(e.get("_release"),[e.get("sim"),e.get("exp")],$dict([]));
return null;}else{}
{const $t2221=e.get("alt");e.set("target",$t2221);}
}else{}
{const $t2222=$boolop("Or",[()=>$call($get($get(e.get("sim"),"people"),"get"),[$item(e.get("exp"),"leader")],$dict([])),()=>$item(e.get("members"),0)]);e.set("leader",$t2222);}
$call($get(e.get("sim"),"record"),[("A party of "+$fmt($call(e.get("len"),[e.get("members")],$dict([])),-1,null)+" settlers from "+$fmt($get(e.get("origin"),"name"),-1,null)+" reached the site of a new "+$fmt($get(e.get("country"),"name"),-1,null)+" town after "+$fmt(e.get("years"),-1,null)+" years on the road."),"political"],$dict([]));
{const $t2223=$call(e.get("_list"),[e.get("sim"),"expeditions"],$dict([]));e.set("exps",$t2223);}
$call(e.get("_drop"),[e.get("exps"),e.get("exp")],$dict([]));
{const $t2224=$call($get(e.get("sim"),"found_settlement"),[$item(e.get("exp"),"country"),e.get("leader"),e.get("members")],$dict([["cell",e.get("target")]]));e.set("place",$t2224);}
for(const $t2225 of $iter(e.get("members"))){e.set("person",$t2225);{const $t2226=null;$set(e.get("person"),"expedition",$t2226);}
}
{const $t2227=$get(e.get("sim"),"year");$set(e.get("country"),"last_expansion",$t2227);}
return null;}else{}
{const $t2228=$call($get($get(e.get("sim"),"settlements"),"get"),[$call($get(e.get("exp"),"get"),["target_settlement"],$dict([]))],$dict([]));e.set("destination",$t2228);}
if($truth($boolop("And",[()=>$compare([()=>$item(e.get("exp"),"kind"),()=>"emigrant"], ["Eq"]),()=>$compare([()=>e.get("destination"),()=>null], ["IsNot"]),()=>$compare([()=>$get(e.get("destination"),"country"),()=>$item(e.get("exp"),"country")], ["NotEq"])]))){$call(e.get("_arrive_abroad"),[e.get("sim"),e.get("exp"),e.get("members"),e.get("origin"),e.get("country"),e.get("destination")],$dict([]));
return null;}else{}
if($truth($boolop("Or",[()=>$compare([()=>e.get("destination"),()=>null], ["Is"]),()=>$compare([()=>$get(e.get("destination"),"country"),()=>$item(e.get("exp"),"country")], ["NotEq"]),()=>$compare([()=>$get(e.get("destination"),"abandoned"),()=>null], ["IsNot"])]))){$call(e.get("_release"),[e.get("sim"),e.get("exp")],$dict([]));
return null;}else{}
for(const $t2229 of $iter(e.get("members"))){e.set("person",$t2229);{const $t2230=$get(e.get("destination"),"id");$set(e.get("person"),"settlement",$t2230);}
{const $t2231=null;$set(e.get("person"),"expedition",$t2231);}
}
$call(e.get("_drop"),[$call(e.get("_list"),[e.get("sim"),"expeditions"],$dict([])),e.get("exp")],$dict([]));
{const $t2232=($truth($compare([()=>$item(e.get("exp"),"kind"),()=>"refugee"], ["Eq"]))?"Refugees":"Migrants");e.set("verb",$t2232);}
$call($get(e.get("sim"),"record"),[($fmt(e.get("verb"),-1,null)+" from "+$fmt($get(e.get("origin"),"name"),-1,null)+" ("+$fmt($call(e.get("len"),[e.get("members")],$dict([])),-1,null)+" people) settled in "+$fmt($get(e.get("destination"),"name"),-1,null)+" in "+$fmt($get(e.get("country"),"name"),-1,null)+"."),"population"],$dict([]));
return null;}));
e.set("_available",$fn("_available",e,["sim", "s", "kind", "counts_here"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t2233=$item(e.get("BUILDINGS"),e.get("kind"));{const $t2234=Array.from($iter($t2233));e.set("label",$t2234[0]);e.set("cost",$t2234[1]);e.set("tech",$t2234[2]);e.set("minimum",$t2234[3]);e.set("need",$t2234[4]);e.set("blurb",$t2234[5]);e.set("wonder",$t2234[6]);}}
{const $t2235=$item($get(e.get("sim"),"countries"),$get(e.get("s"),"country"));e.set("country",$t2235);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("kind"),()=>$call(e.get("getattr"),[e.get("s"),"buildings",$dict([])],$dict([]))], ["In"]),()=>$un("Not",$compare([()=>e.get("tech"),()=>$get(e.get("country"),"technologies")], ["LtE"])),()=>$compare([()=>e.get("counts_here"),()=>e.get("minimum")], ["Lt"])]))){return false;}else{}
if($truth($boolop("And",[()=>e.get("wonder"),()=>$boolop("Or",[()=>$item($call(e.get("building_counts"),[e.get("sim"),$get(e.get("s"),"country")],$dict([])),e.get("kind")),()=>$call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t2236 of $iter($call(e.get("_list"),[e.get("sim"),"projects"],$dict([])))){e.set("p",$t2236);yield $boolop("And",[()=>$compare([()=>$item(e.get("p"),"country"),()=>$get(e.get("s"),"country")], ["Eq"]),()=>$compare([()=>$item(e.get("p"),"kind"),()=>e.get("kind")], ["Eq"])]);}})();})(e)],$dict([]))])]))){return false;}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("need"),()=>"capital"], ["Eq"]),()=>$compare([()=>$get(e.get("country"),"capital"),()=>$get(e.get("s"),"id")], ["NotEq"])]))){return false;}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("need"),()=>$tuple(["university","harbor","walls"])], ["In"]),()=>$compare([()=>e.get("need"),()=>$call(e.get("getattr"),[e.get("s"),"buildings",$dict([])],$dict([]))], ["NotIn"])]))){return false;}else{}
if($truth($call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t2237 of $iter($call(e.get("_list"),[e.get("sim"),"projects"],$dict([])))){e.set("p",$t2237);yield $boolop("And",[()=>$compare([()=>$item(e.get("p"),"settlement"),()=>$get(e.get("s"),"id")], ["Eq"]),()=>$compare([()=>$item(e.get("p"),"kind"),()=>e.get("kind")], ["Eq"])]);}})();})(e)],$dict([])))){return false;}else{}
{const $t2238=$call(e.get("world"),[e.get("sim")],$dict([]));e.set("features",$t2238);}
if($truth($boolop("And",[()=>$compare([()=>e.get("need"),()=>"coast"], ["Eq"]),()=>$un("Not",$call(e.get("_coast"),[e.get("sim"),e.get("s")],$dict([])))]))){return false;}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("need"),()=>"water"], ["Eq"]),()=>$un("Not",$boolop("Or",[()=>$call(e.get("_coast"),[e.get("sim"),e.get("s")],$dict([])),()=>$call(e.get("_near_flag"),[$item(e.get("features"),"river"),$get(e.get("s"),"gx"),$get(e.get("s"),"gy"),1],$dict([]))]))]))){return false;}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("need"),()=>"river"], ["Eq"]),()=>$un("Not",$call(e.get("_near_flag"),[$item(e.get("features"),"river"),$get(e.get("s"),"gx"),$get(e.get("s"),"gy"),1],$dict([])))]))){return false;}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("need"),()=>"ore"], ["Eq"]),()=>$compare([()=>$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2239 of $iter($tuple(["iron","copper","gold","coal","stone"]))){e.set("k",$t2239);yield $item($call(e.get("resources_near"),[e.get("sim"),$get(e.get("s"),"gx"),$get(e.get("s"),"gy"),3],$dict([])),e.get("k"));}})();})(e))],$dict([])),()=>0], ["Eq"])]))){return false;}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("kind"),()=>"hospital"], ["Eq"]),()=>$compare([()=>"clinic",()=>$call(e.get("getattr"),[e.get("s"),"buildings",$dict([])],$dict([]))], ["NotIn"])]))){return false;}else{}
return true;return null;}));
e.set("_coast",$fn("_coast",e,["sim", "s"],[undefined,undefined],null,null,[],[],e=>{{const $t2240=$item($call(e.get("world"),[e.get("sim")],$dict([])),"terrain");e.set("rows",$t2240);}
for(const $t2241 of $iter($call(e.get("range"),[$call(e.get("max"),[0,$bin("Sub",$get(e.get("s"),"gy"),1)],$dict([])),$call(e.get("min"),[e.get("H"),$bin("Add",$get(e.get("s"),"gy"),2)],$dict([]))],$dict([])))){e.set("yy",$t2241);for(const $t2242 of $iter($call(e.get("range"),[$call(e.get("max"),[0,$bin("Sub",$get(e.get("s"),"gx"),1)],$dict([])),$call(e.get("min"),[e.get("W"),$bin("Add",$get(e.get("s"),"gx"),2)],$dict([]))],$dict([])))){e.set("xx",$t2242);if($truth($compare([()=>$item($item(e.get("rows"),e.get("yy")),e.get("xx")),()=>$tuple(["ocean","lake"])], ["In"]))){return true;}else{}
}
}
return false;return null;}));
e.set("start_project",$fn("start_project",e,["sim", "s", "kind", "forced", "target"],[undefined,undefined,undefined,false,null],null,null,[],[],e=>{{const $t2243=$call(e.get("_list"),[e.get("sim"),"projects"],$dict([]));e.set("projects",$t2243);}
if($truth($compare([()=>e.get("kind"),()=>"road"], ["Eq"]))){if($truth($boolop("Or",[()=>$compare([()=>e.get("target"),()=>null], ["Is"]),()=>$compare([()=>$get(e.get("target"),"country"),()=>$get(e.get("s"),"country")], ["NotEq"])]))){return null;}else{}
{const $t2244=$call(e.get("find_path"),[e.get("sim"),$tuple([$get(e.get("s"),"gx"),$get(e.get("s"),"gy")]),$tuple([$get(e.get("target"),"gx"),$get(e.get("target"),"gy")])],$dict([]));e.set("route",$t2244);}
if($truth($compare([()=>e.get("route"),()=>null], ["Is"]))){return null;}else{}
{const $t2245=e.get("route");{const $t2246=Array.from($iter($t2245));e.set("cells",$t2246[0]);e.set("total",$t2246[1]);}}
{const $t2247=$dict([["id",$call(e.get("_next"),[e.get("sim"),"next_project"],$dict([]))],["settlement",$get(e.get("s"),"id")],["country",$get(e.get("s"),"country")],["kind","road"],["label",("Road to "+$fmt($get(e.get("target"),"name"),-1,null))],["start",$get(e.get("sim"),"year")],["progress",0.0],["cost",$bin("Add",40,$bin("Mult",e.get("total"),9))],["workers",0.0],["cells",Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2248 of $iter(e.get("cells"))){{const $t2249=Array.from($iter($t2248));e.set("x",$t2249[0]);e.set("y",$t2249[1]);}yield [e.get("x"),e.get("y")];}})();})(e))],["target",$get(e.get("target"),"id")]]);e.set("project",$t2247);}
$call($get(e.get("projects"),"append"),[e.get("project")],$dict([]));
$call($get(e.get("sim"),"record"),[("Work began on a road linking "+$fmt($get(e.get("s"),"name"),-1,null)+" and "+$fmt($get(e.get("target"),"name"),-1,null)+" in "+$fmt($get($item($get(e.get("sim"),"countries"),$get(e.get("s"),"country")),"name"),-1,null)+"."),"political"],$dict([]));
return e.get("project");}else{}
{const $t2250=$call($get(e.get("BUILDINGS"),"get"),[e.get("kind")],$dict([]));e.set("spec",$t2250);}
if($truth($compare([()=>e.get("spec"),()=>null], ["Is"]))){return null;}else{}
{const $t2251=$call(e.get("settlement_counts"),[e.get("sim")],$dict([]));e.set("counts",$t2251);}
if($truth($boolop("And",[()=>$un("Not",e.get("forced")),()=>$un("Not",$call(e.get("_available"),[e.get("sim"),e.get("s"),e.get("kind"),$call($get(e.get("counts"),"get"),[$get(e.get("s"),"id"),0],$dict([]))],$dict([])))]))){return null;}else{}
if($truth($boolop("And",[()=>e.get("forced"),()=>$boolop("Or",[()=>$compare([()=>e.get("kind"),()=>$call(e.get("getattr"),[e.get("s"),"buildings",$dict([])],$dict([]))], ["In"]),()=>$call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t2252 of $iter(e.get("projects"))){e.set("p",$t2252);yield $boolop("And",[()=>$compare([()=>$item(e.get("p"),"settlement"),()=>$get(e.get("s"),"id")], ["Eq"]),()=>$compare([()=>$item(e.get("p"),"kind"),()=>e.get("kind")], ["Eq"])]);}})();})(e)],$dict([]))])]))){return null;}else{}
{const $t2253=$dict([["id",$call(e.get("_next"),[e.get("sim"),"next_project"],$dict([]))],["settlement",$get(e.get("s"),"id")],["country",$get(e.get("s"),"country")],["kind",e.get("kind")],["label",$item(e.get("spec"),0)],["start",$get(e.get("sim"),"year")],["progress",0.0],["cost",$item(e.get("spec"),1)],["workers",0.0]]);e.set("project",$t2253);}
$call($get(e.get("projects"),"append"),[e.get("project")],$dict([]));
$call($get(e.get("sim"),"record"),[("Construction began on a "+$fmt($call($get($item(e.get("spec"),0),"lower"),[],$dict([])),-1,null)+" in "+$fmt($get(e.get("s"),"name"),-1,null)+", "+$fmt($get($item($get(e.get("sim"),"countries"),$get(e.get("s"),"country")),"name"),-1,null)+"."),"political"],$dict([]));
return e.get("project");return null;}));
e.set("_weight",$fn("_weight",e,["sim", "s", "kind", "st", "built", "haz", "country"],[undefined,undefined,undefined,undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t2254=1.0;e.set("w",$t2254);}
{const $t2255=$item(e.get("st"),"infected_share");e.set("sick",$t2255);}
{const $t2256=$item(e.get("st"),"at_war");e.set("war",$t2256);}
{const $t2257=$compare([()=>$get(e.get("country"),"government"),()=>e.get("AUTHORITY")], ["In"]);e.set("monarchy",$t2257);}
if($truth($compare([()=>e.get("kind"),()=>"well"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),($truth($compare([()=>e.get("sick"),()=>0.005], ["Gt"]))?2.5:0)));e.set("w",$aug("Add",e.get("w"),($truth($call(e.get("_near_flag"),[$item($call(e.get("world"),[e.get("sim")],$dict([])),"river"),$get(e.get("s"),"gx"),$get(e.get("s"),"gy"),1],$dict([])))?1.0:0)));}else{if($truth($compare([()=>e.get("kind"),()=>"granary"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),($truth($boolop("Or",[()=>$compare([()=>$get(e.get("country"),"food"),()=>55], ["Lt"]),()=>$compare([()=>"Famine",()=>$get(e.get("country"),"conditions")], ["In"]),()=>$compare([()=>"Drought",()=>$get(e.get("country"),"conditions")], ["In"])]))?3.0:0)));}else{if($truth($compare([()=>e.get("kind"),()=>"market"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),($truth($compare([()=>$call(e.get("getattr"),[e.get("country"),"economic_system","mixed"],$dict([])),()=>"capitalism"], ["Eq"]))?1.5:0.5)));}else{if($truth($compare([()=>e.get("kind"),()=>$tuple(["school","library","university","observatory"])], ["In"]))){e.set("w",$aug("Add",e.get("w"),($truth($un("Not",e.get("monarchy")))?1.4:0.2)));e.set("w",$aug("Add",e.get("w"),($truth($compare([()=>$call(e.get("getattr"),[e.get("country"),"economic_system","mixed"],$dict([])),()=>"communism"], ["Eq"]))?1.0:0)));}else{if($truth($compare([()=>e.get("kind"),()=>$tuple(["clinic","hospital"])], ["In"]))){e.set("w",$aug("Add",e.get("w"),($truth($compare([()=>e.get("sick"),()=>0.01], ["Gt"]))?3.5:($truth($compare([()=>e.get("sick"),()=>0], ["Gt"]))?1.0:0))));}else{if($truth($compare([()=>e.get("kind"),()=>"aqueduct"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),($truth($compare([()=>"well",()=>$call(e.get("getattr"),[e.get("s"),"buildings",$dict([])],$dict([]))], ["In"]))?1.5:0)));}else{if($truth($compare([()=>e.get("kind"),()=>"walls"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),($truth(e.get("war"))?3.5:($truth($item(e.get("st"),"frontier"))?1.0:0))));e.set("w",$aug("Add",e.get("w"),($truth(e.get("monarchy"))?1.5:0)));}else{if($truth($compare([()=>e.get("kind"),()=>"harbor"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),($truth($compare([()=>$call(e.get("getattr"),[e.get("country"),"economic_system","mixed"],$dict([])),()=>"capitalism"], ["Eq"]))?2.0:0.6)));}else{if($truth($compare([()=>e.get("kind"),()=>"levee"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),$bin("Add",$bin("Mult",$item(e.get("haz"),"flood"),1.2),$bin("Mult",$item(e.get("haz"),"storm"),0.8))));}else{if($truth($compare([()=>e.get("kind"),()=>"firebreak"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),$bin("Mult",$item(e.get("haz"),"wildfire"),1.6)));}else{if($truth($compare([()=>e.get("kind"),()=>"foundations"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),$bin("Add",$bin("Mult",$item(e.get("haz"),"earthquake"),1.6),$bin("Mult",$item(e.get("haz"),"landslide"),1.2))));}else{if($truth($compare([()=>e.get("kind"),()=>"monument"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),($truth(e.get("monarchy"))?2.5:0.3)));e.set("w",$aug("Add",e.get("w"),($truth($compare([()=>$get(e.get("country"),"stability"),()=>45], ["Lt"]))?2.0:0)));}else{if($truth($compare([()=>e.get("kind"),()=>"theater"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),($truth($compare([()=>$item(e.get("st"),"performers"),()=>3], ["GtE"]))?1.0:0)));e.set("w",$aug("Add",e.get("w"),($truth($un("Not",e.get("monarchy")))?0.8:0)));}else{if($truth($compare([()=>e.get("kind"),()=>"mine"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),$bin("Add",1.5,($truth(e.get("war"))?2.0:0))));}else{if($truth($compare([()=>e.get("kind"),()=>"mill"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),1.0));}else{if($truth($compare([()=>e.get("kind"),()=>"palace"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),($truth(e.get("monarchy"))?3.0:1.0)));}else{if($truth($compare([()=>e.get("kind"),()=>"grand_academy"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),($truth($un("Not",e.get("monarchy")))?2.5:0.8)));}else{if($truth($compare([()=>e.get("kind"),()=>"lighthouse"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),$bin("Add",1.5,($truth($compare([()=>$call(e.get("getattr"),[e.get("country"),"economic_system","mixed"],$dict([])),()=>"capitalism"], ["Eq"]))?1.5:0))));}else{if($truth($compare([()=>e.get("kind"),()=>"fortress"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),($truth(e.get("war"))?3.5:($truth($item(e.get("st"),"frontier"))?1.5:0))));}else{if($truth($compare([()=>e.get("kind"),()=>"forge"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),$bin("Add",1.0,($truth(e.get("war"))?1.5:0))));}else{if($truth($compare([()=>e.get("kind"),()=>"bank"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),($truth($compare([()=>$call(e.get("getattr"),[e.get("country"),"economic_system","mixed"],$dict([])),()=>"capitalism"], ["Eq"]))?1.5:0.6)));}else{if($truth($compare([()=>e.get("kind"),()=>"barracks"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),$bin("Add",($truth(e.get("war"))?2.5:0.3),($truth($compare([()=>$get(e.get("country"),"government"),()=>$tuple(["junta","empire","tyranny"])], ["In"]))?1.0:0))));}else{if($truth($compare([()=>e.get("kind"),()=>"factory"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),$bin("Add",1.5,($truth($compare([()=>$call(e.get("getattr"),[e.get("country"),"economic_system","mixed"],$dict([])),()=>"capitalism"], ["Eq"]))?1.0:0))));}else{if($truth($compare([()=>e.get("kind"),()=>"station"], ["Eq"]))){e.set("w",$aug("Add",e.get("w"),1.5));}else{}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
return $call(e.get("max"),[0.0,$bin("Mult",e.get("w"),$bin("Pow",0.7,$item(e.get("built"),e.get("kind"))))],$dict([]));return null;}));
e.set("plan_projects",$fn("plan_projects",e,["sim"],[undefined],null,null,[],[],e=>{e.set("state",$get($import("systems"),"state"));{const $t2258=$call(e.get("_list"),[e.get("sim"),"projects"],$dict([]));e.set("projects",$t2258);}
{const $t2259=$call(e.get("settlement_counts"),[e.get("sim")],$dict([]));e.set("counts",$t2259);}
for(const $t2260 of $iter($call(e.get("sorted"),[$get(e.get("sim"),"countries")],$dict([])))){e.set("cid",$t2260);{const $t2261=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t2261);}
if($truth($boolop("Or",[()=>$compare([()=>$get(e.get("country"),"ended"),()=>null], ["IsNot"]),()=>$compare([()=>$call(e.get("getattr"),[e.get("country"),"treasury",0.0],$dict([])),()=>150], ["Lt"])]))){continue;}else{}
{const $t2262=$call(e.get("state"),[e.get("sim"),e.get("cid")],$dict([]));e.set("st",$t2262);}
{const $t2263=$call(e.get("building_counts"),[e.get("sim"),e.get("cid")],$dict([]));e.set("built",$t2263);}
for(const $t2264 of $iter($call(e.get("sorted"),[$call(e.get("_inhabited"),[e.get("sim")],$dict([]))],$dict([["key",$fn("<lambda>",e,["x"],[undefined],null,null,[],[],e=>{return $get(e.get("x"),"id");return null;})]])))){e.set("s",$t2264);if($truth($compare([()=>$get(e.get("s"),"country"),()=>e.get("cid")], ["NotEq"]))){continue;}else{}
{const $t2265=$call($get(e.get("counts"),"get"),[$get(e.get("s"),"id"),0],$dict([]));e.set("pop",$t2265);}
{const $t2266=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2267 of $iter(e.get("projects"))){e.set("p",$t2267);if($truth($compare([()=>$item(e.get("p"),"settlement"),()=>$get(e.get("s"),"id")], ["Eq"]))){yield e.get("p");}}})();})(e));e.set("active",$t2266);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("pop"),()=>40], ["Lt"]),()=>$compare([()=>$call(e.get("len"),[e.get("active")],$dict([])),()=>($truth($compare([()=>e.get("pop"),()=>400], ["GtE"]))?2:1)], ["GtE"]),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.3], ["GtE"])]))){continue;}else{}
{const $t2268=$call(e.get("hazards_at"),[e.get("sim"),$get(e.get("s"),"gx"),$get(e.get("s"),"gy")],$dict([]));e.set("haz",$t2268);}
{const $t2269=[];e.set("kinds",$t2269);}
{const $t2270=[];e.set("weights",$t2270);}
for(const $t2271 of $iter(e.get("BUILDINGS"))){e.set("kind",$t2271);if($truth($boolop("And",[()=>$call(e.get("_available"),[e.get("sim"),e.get("s"),e.get("kind"),e.get("pop")],$dict([])),()=>$compare([()=>$bin("Mult",$item($item(e.get("BUILDINGS"),e.get("kind")),1),0.6),()=>$get(e.get("country"),"treasury")], ["LtE"])]))){{const $t2272=$call(e.get("_weight"),[e.get("sim"),e.get("s"),e.get("kind"),e.get("st"),e.get("built"),e.get("haz"),e.get("country")],$dict([]));e.set("weight",$t2272);}
if($truth($compare([()=>e.get("weight"),()=>0], ["Gt"]))){$call($get(e.get("kinds"),"append"),[e.get("kind")],$dict([]));
$call($get(e.get("weights"),"append"),[e.get("weight")],$dict([]));
}else{}
}else{}
}
if($truth(e.get("kinds"))){$call(e.get("start_project"),[e.get("sim"),e.get("s"),$item($call($get($get(e.get("sim"),"rng"),"choices"),[e.get("kinds"),e.get("weights")],$dict([])),0)],$dict([]));
}else{}
}
if($truth($boolop("And",[()=>$compare([()=>"roads",()=>$get(e.get("country"),"technologies")], ["In"]),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.1], ["Lt"])]))){{const $t2273=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2274 of $iter($call(e.get("_inhabited"),[e.get("sim")],$dict([])))){e.set("s",$t2274);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("s"),"country"),()=>e.get("cid")], ["Eq"]),()=>$compare([()=>$call($get(e.get("counts"),"get"),[$get(e.get("s"),"id"),0],$dict([])),()=>60], ["GtE"])]))){yield e.get("s");}}})();})(e));e.set("mine",$t2273);}
{const $t2275=$call(e.get("getattr"),[e.get("sim"),"roads",$dict([])],$dict([]));e.set("roads",$t2275);}
{const $t2276=null;e.set("best",$t2276);}
{const $t2277=999.0;e.set("best_gap",$t2277);}
for(const $t2278 of $iter($call(e.get("range"),[$call(e.get("len"),[e.get("mine")],$dict([]))],$dict([])))){e.set("i",$t2278);for(const $t2279 of $iter($call(e.get("range"),[$bin("Add",e.get("i"),1),$call(e.get("len"),[e.get("mine")],$dict([]))],$dict([])))){e.set("j",$t2279);{const $t2280=$call(e.get("dist"),[$get($item(e.get("mine"),e.get("i")),"gx"),$get($item(e.get("mine"),e.get("i")),"gy"),$get($item(e.get("mine"),e.get("j")),"gx"),$get($item(e.get("mine"),e.get("j")),"gy")],$dict([]));e.set("d",$t2280);}
{const $t2281=$call(e.get("any"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t2282 of $iter(e.get("projects"))){e.set("p",$t2282);yield $boolop("And",[()=>$compare([()=>$item(e.get("p"),"kind"),()=>"road"], ["Eq"]),()=>$boolop("Or",[()=>$boolop("And",[()=>$compare([()=>$item(e.get("p"),"settlement"),()=>$get($item(e.get("mine"),e.get("i")),"id")], ["Eq"]),()=>$compare([()=>$item(e.get("p"),"target"),()=>$get($item(e.get("mine"),e.get("j")),"id")], ["Eq"])]),()=>$boolop("And",[()=>$compare([()=>$item(e.get("p"),"settlement"),()=>$get($item(e.get("mine"),e.get("j")),"id")], ["Eq"]),()=>$compare([()=>$item(e.get("p"),"target"),()=>$get($item(e.get("mine"),e.get("i")),"id")], ["Eq"])])])]);}})();})(e)],$dict([]));e.set("linked",$t2281);}
{const $t2283=$tuple([$call(e.get("int"),[$bin("Div",$bin("Add",$get($item(e.get("mine"),e.get("i")),"gx"),$get($item(e.get("mine"),e.get("j")),"gx")),2)],$dict([])),$call(e.get("int"),[$bin("Div",$bin("Add",$get($item(e.get("mine"),e.get("i")),"gy"),$get($item(e.get("mine"),e.get("j")),"gy")),2)],$dict([]))]);e.set("midpoint",$t2283);}
{const $t2284=$compare([()=>$bin("Add",$bin("Mult",$item(e.get("midpoint"),1),e.get("W")),$item(e.get("midpoint"),0)),()=>e.get("roads")], ["In"]);e.set("covered",$t2284);}
if($truth($boolop("And",[()=>$compare([()=>e.get("d"),()=>e.get("best_gap")], ["Lt"]),()=>$compare([()=>4,()=>e.get("d"),()=>48], ["Lt", "Lt"]),()=>$un("Not",e.get("linked")),()=>$un("Not",e.get("covered"))]))){{const $t2285=e.get("d");e.set("best_gap",$t2285);}
{const $t2286=$tuple([$item(e.get("mine"),e.get("i")),$item(e.get("mine"),e.get("j"))]);e.set("best",$t2286);}
}else{}
}
}
if($truth($compare([()=>e.get("best"),()=>null], ["IsNot"]))){$call(e.get("start_project"),[e.get("sim"),$item(e.get("best"),0),"road"],$dict([["target",$item(e.get("best"),1)]]));
}else{}
}else{}
}
return null;}));
e.set("advance_projects",$fn("advance_projects",e,["sim"],[undefined],null,null,[],[],e=>{{const $t2287=$call(e.get("_list"),[e.get("sim"),"projects"],$dict([]));e.set("projects",$t2287);}
if($truth($un("Not",e.get("projects")))){return null;}else{}
{const $t2288=$dict([]);e.set("workers",$t2288);}
for(const $t2289 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t2289);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"]),()=>$compare([()=>$get(e.get("p"),"infection"),()=>null], ["Is"]),()=>$compare([()=>$call(e.get("getattr"),[e.get("p"),"wounded_until",0],$dict([])),()=>$get(e.get("sim"),"year")], ["LtE"])]))){{const $t2290=$call($get(e.get("WORK"),"get"),[$get(e.get("p"),"job"),0.0],$dict([]));e.set("weight",$t2290);}
if($truth(e.get("weight"))){{const $t2291=$bin("Add",$call($get(e.get("workers"),"get"),[$get(e.get("p"),"settlement"),0.0],$dict([])),e.get("weight"));$setitem(e.get("workers"),$get(e.get("p"),"settlement"),$t2291);}
}else{}
}else{}
}
{const $t2292=$call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t2293 of $iter(e.get("projects"))){e.set("p",$t2293);yield $item(e.get("p"),"settlement");}})();})(e)],$dict([]));e.set("shares",$t2292);}
{const $t2294=new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2296 of $iter($get(e.get("sim"),"wars"))){e.set("pair",$t2296);for(const $t2295 of $iter(e.get("pair"))){e.set("cid",$t2295);yield e.get("cid");}}})();})(e));e.set("busy",$t2294);}
for(const $t2297 of $iter($call(e.get("list"),[e.get("projects")],$dict([])))){e.set("project",$t2297);{const $t2298=$item($get(e.get("sim"),"settlements"),$item(e.get("project"),"settlement"));e.set("s",$t2298);}
{const $t2299=$item($get(e.get("sim"),"countries"),$get(e.get("s"),"country"));e.set("country",$t2299);}
if($truth($boolop("Or",[()=>$compare([()=>$get(e.get("s"),"abandoned"),()=>null], ["IsNot"]),()=>$compare([()=>$get(e.get("country"),"ended"),()=>null], ["IsNot"])]))){$call(e.get("_drop"),[e.get("projects"),e.get("project")],$dict([]));
continue;}else{}
{const $t2300=$bin("Div",$call($get(e.get("workers"),"get"),[$get(e.get("s"),"id"),0.0],$dict([])),$item(e.get("shares"),$get(e.get("s"),"id")));e.set("crew",$t2300);}
{const $t2301=1.0;e.set("pace",$t2301);}
if($truth($compare([()=>$get(e.get("s"),"country"),()=>e.get("busy")], ["In"]))){e.set("pace",$aug("Mult",e.get("pace"),0.4));}else{}
if($truth($compare([()=>"Famine",()=>$get(e.get("country"),"conditions")], ["In"]))){e.set("pace",$aug("Mult",e.get("pace"),0.6));}else{}
if($truth($get(e.get("country"),"quarantine"))){e.set("pace",$aug("Mult",e.get("pace"),0.7));}else{}
if($truth($compare([()=>$call(e.get("getattr"),[e.get("country"),"treasury",0.0],$dict([])),()=>0], ["Lt"]))){e.set("pace",$aug("Mult",e.get("pace"),0.3));}else{}
e.set("pace",$aug("Mult",e.get("pace"),$call(e.get("materials_pace"),[e.get("country")],$dict([]))));{const $t2302=$bin("Mult",$bin("Mult",$bin("Mult",e.get("crew"),e.get("pace")),($truth($compare([()=>"roads",()=>$get(e.get("country"),"technologies")], ["In"]))?1.15:1.0)),$bin("Add",1,$item($call(e.get("tech_effects"),[$get(e.get("country"),"technologies")],$dict([])),"build")));e.set("done",$t2302);}
{const $t2303=$bin("Div",$call(e.get("int"),[$bin("Mult",e.get("crew"),10)],$dict([])),10);$setitem(e.get("project"),"workers",$t2303);}
$setitem(e.get("project"),"progress",$aug("Add",$item(e.get("project"),"progress"),$bin("Div",e.get("done"),$item(e.get("project"),"cost"))));{const $t2304=$bin("Sub",$call(e.get("getattr"),[e.get("country"),"treasury",0.0],$dict([])),$bin("Mult",e.get("done"),0.6));$set(e.get("country"),"treasury",$t2304);}
$call(e.get("use_materials"),[e.get("country"),$bin("Mult",e.get("done"),0.15)],$dict([]));
if($truth($compare([()=>$item(e.get("project"),"progress"),()=>1.0], ["GtE"]))){$call(e.get("_drop"),[e.get("projects"),e.get("project")],$dict([]));
$call(e.get("_complete"),[e.get("sim"),e.get("s"),e.get("country"),e.get("project")],$dict([]));
}else{}
}
return null;}));
e.set("_complete",$fn("_complete",e,["sim", "s", "country", "project"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{if($truth($compare([()=>$item(e.get("project"),"kind"),()=>"road"], ["Eq"]))){{const $t2305=$call(e.get("getattr"),[e.get("sim"),"roads",null],$dict([]));e.set("roads",$t2305);}
if($truth($compare([()=>e.get("roads"),()=>null], ["Is"]))){{const $t2306=$dict([]);e.set("roads",$t2306);}
{const $t2307=e.get("roads");$set(e.get("sim"),"roads",$t2307);}
}else{}
for(const $t2308 of $iter($item(e.get("project"),"cells"))){{const $t2309=Array.from($iter($t2308));e.set("x",$t2309[0]);e.set("y",$t2309[1]);}{const $t2310=$get(e.get("s"),"country");$setitem(e.get("roads"),$bin("Add",$bin("Mult",e.get("y"),e.get("W")),e.get("x")),$t2310);}
}
{const $t2311=$call($get($get(e.get("sim"),"settlements"),"get"),[$item(e.get("project"),"target")],$dict([]));e.set("other",$t2311);}
$call($get(e.get("sim"),"record"),[("A road linking "+$fmt($get(e.get("s"),"name"),-1,null)+" and "+$fmt(($truth(e.get("other"))?$get(e.get("other"),"name"):"a neighboring town"),-1,null)+" was completed in "+$fmt($get(e.get("country"),"name"),-1,null)+"."),"political"],$dict([]));
{const $t2312=$call(e.get("min"),[100,$bin("Add",$get(e.get("country"),"prosperity"),1)],$dict([]));$set(e.get("country"),"prosperity",$t2312);}
return null;}else{}
{const $t2313=$call(e.get("getattr"),[e.get("s"),"buildings",null],$dict([]));e.set("buildings",$t2313);}
if($truth($compare([()=>e.get("buildings"),()=>null], ["Is"]))){{const $t2314=$dict([]);e.set("buildings",$t2314);}
{const $t2315=e.get("buildings");$set(e.get("s"),"buildings",$t2315);}
}else{}
{const $t2316=$get(e.get("sim"),"year");$setitem(e.get("buildings"),$item(e.get("project"),"kind"),$t2316);}
{const $t2317=$item(e.get("BUILDINGS"),$item(e.get("project"),"kind"));e.set("spec",$t2317);}
{const $t2318=$call(e.get("min"),[100,$bin("Add",$get(e.get("country"),"stability"),($truth($compare([()=>$item(e.get("project"),"kind"),()=>"monument"], ["Eq"]))?2.0:1.0))],$dict([]));$set(e.get("country"),"stability",$t2318);}
{const $t2319=$call(e.get("min"),[100,$bin("Add",$get(e.get("country"),"prosperity"),1)],$dict([]));$set(e.get("country"),"prosperity",$t2319);}
$call($get(e.get("sim"),"record"),[($fmt($item(e.get("spec"),0),-1,null)+" completed in "+$fmt($get(e.get("s"),"name"),-1,null)+", "+$fmt($get(e.get("country"),"name"),-1,null)+": "+$fmt($item(e.get("spec"),5),-1,null)+"."),"political"],$dict([]));
return null;}));
e.set("damage_buildings",$fn("damage_buildings",e,["sim", "s", "chance", "cause"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t2320=$call(e.get("getattr"),[e.get("s"),"buildings",null],$dict([]));e.set("built",$t2320);}
{const $t2321=[];e.set("lost",$t2321);}
if($truth($un("Not",e.get("built")))){return e.get("lost");}else{}
for(const $t2322 of $iter($call(e.get("sorted"),[e.get("built")],$dict([])))){e.set("kind",$t2322);if($truth($compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>e.get("chance")], ["Lt"]))){$call($get(e.get("lost"),"append"),[e.get("kind")],$dict([]));
}else{}
}
for(const $t2323 of $iter(e.get("lost"))){e.set("kind",$t2323);$del(e.get("built"),e.get("kind"));}
if($truth(e.get("lost"))){{const $t2324=$call($get(", ","join"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2325 of $iter(e.get("lost"))){e.set("k",$t2325);yield $call($get($item($item(e.get("BUILDINGS"),e.get("k")),0),"lower"),[],$dict([]));}})();})(e))],$dict([]));e.set("names",$t2324);}
$call($get(e.get("sim"),"record"),[($fmt(e.get("cause"),-1,null)+" destroyed the "+$fmt(e.get("names"),-1,null)+" in "+$fmt($get(e.get("s"),"name"),-1,null)+"."),"disaster"],$dict([]));
}else{}
return e.get("lost");return null;}));
e.set("projects_report",$fn("projects_report",e,["sim", "query"],[undefined,""],null,null,[],[],e=>{{const $t2326=$call(e.get("_list"),[e.get("sim"),"projects"],$dict([]));e.set("projects",$t2326);}
{const $t2327=["Construction projects (workers build; the national treasury pays):"];e.set("lines",$t2327);}
{const $t2328=0;e.set("shown",$t2328);}
for(const $t2329 of $iter(e.get("projects"))){e.set("project",$t2329);{const $t2330=$item($get(e.get("sim"),"settlements"),$item(e.get("project"),"settlement"));e.set("s",$t2330);}
{const $t2331=$item($get(e.get("sim"),"countries"),$get(e.get("s"),"country"));e.set("country",$t2331);}
if($truth($boolop("And",[()=>e.get("query"),()=>$compare([()=>e.get("query"),()=>$call($get($get(e.get("country"),"name"),"casefold"),[],$dict([]))], ["NotIn"]),()=>$compare([()=>e.get("query"),()=>$call($get($get(e.get("s"),"name"),"casefold"),[],$dict([]))], ["NotIn"])]))){continue;}else{}
e.set("shown",$aug("Add",e.get("shown"),1));$call($get(e.get("lines"),"append"),[("  #"+$fmt($item(e.get("project"),"id"),-1,null)+" "+$fmt($item(e.get("project"),"label"),-1,null)+" in "+$fmt($get(e.get("s"),"name"),-1,null)+" ("+$fmt($get(e.get("country"),"name"),-1,null)+"): "+$fmt($item(e.get("project"),"progress"),-1,(".0%"))+" done; "+$fmt($item(e.get("project"),"workers"),-1,null)+" workers")],$dict([]));
}
if($truth($un("Not",e.get("shown")))){$call($get(e.get("lines"),"append"),["  none under way"],$dict([]));
}else{}
$call($get(e.get("lines"),"append"),["Completed buildings:"],$dict([]));
{const $t2332=0;e.set("total",$t2332);}
for(const $t2333 of $iter($call(e.get("sorted"),[$call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([]))],$dict([["key",$fn("<lambda>",e,["x"],[undefined],null,null,[],[],e=>{return $get(e.get("x"),"id");return null;})]])))){e.set("s",$t2333);{const $t2334=$call(e.get("getattr"),[e.get("s"),"buildings",$dict([])],$dict([]));e.set("built",$t2334);}
{const $t2335=$item($get(e.get("sim"),"countries"),$get(e.get("s"),"country"));e.set("country",$t2335);}
if($truth($boolop("And",[()=>e.get("built"),()=>$boolop("Or",[()=>$un("Not",e.get("query")),()=>$compare([()=>e.get("query"),()=>$call($get($get(e.get("country"),"name"),"casefold"),[],$dict([]))], ["In"]),()=>$compare([()=>e.get("query"),()=>$call($get($get(e.get("s"),"name"),"casefold"),[],$dict([]))], ["In"])])]))){e.set("total",$aug("Add",e.get("total"),$call(e.get("len"),[e.get("built")],$dict([]))));$call($get(e.get("lines"),"append"),[$bin("Add",("  "+$fmt($get(e.get("s"),"name"),-1,null)+" ("+$fmt($get(e.get("country"),"name"),-1,null)+"): "),$call($get(", ","join"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2336 of $iter($call(e.get("sorted"),[e.get("built")],$dict([])))){e.set("k",$t2336);yield $call($get($item($item(e.get("BUILDINGS"),e.get("k")),0),"lower"),[],$dict([]));}})();})(e))],$dict([])))],$dict([]));
}else{}
}
if($truth($un("Not",e.get("total")))){$call($get(e.get("lines"),"append"),["  none yet"],$dict([]));
}else{}
{const $t2337=$call(e.get("getattr"),[e.get("sim"),"roads",$dict([])],$dict([]));e.set("roads",$t2337);}
$call($get(e.get("lines"),"append"),[("Road cells: "+$fmt($call(e.get("len"),[e.get("roads")],$dict([])),-1,null))],$dict([]));
return $call($get("\n","join"),[e.get("lines")],$dict([]));return null;}));
e.set("expeditions_report",$fn("expeditions_report",e,["sim", "query"],[undefined,""],null,null,[],[],e=>{{const $t2338=["Settler parties on the road:"];e.set("lines",$t2338);}
{const $t2339=0;e.set("shown",$t2339);}
for(const $t2340 of $iter($call(e.get("_list"),[e.get("sim"),"expeditions"],$dict([])))){e.set("exp",$t2340);{const $t2341=$item($get(e.get("sim"),"countries"),$item(e.get("exp"),"country"));e.set("country",$t2341);}
if($truth($boolop("And",[()=>e.get("query"),()=>$compare([()=>e.get("query"),()=>$call($get($get(e.get("country"),"name"),"casefold"),[],$dict([]))], ["NotIn"])]))){continue;}else{}
{const $t2342=$item($get(e.get("sim"),"settlements"),$item(e.get("exp"),"origin"));e.set("origin",$t2342);}
{const $t2343=$bin("Sub",$bin("Sub",$call(e.get("len"),[$item(e.get("exp"),"path")],$dict([])),1),$item(e.get("exp"),"index"));e.set("left",$t2343);}
{const $t2344=($truth($compare([()=>$item(e.get("exp"),"kind"),()=>"found"], ["Eq"]))?"to found a new town":$bin("Add","to ",$get($item($get(e.get("sim"),"settlements"),$item(e.get("exp"),"target_settlement")),"name")));e.set("aim",$t2344);}
e.set("shown",$aug("Add",e.get("shown"),1));$call($get(e.get("lines"),"append"),[("  "+$fmt($get(e.get("country"),"name"),-1,null)+": "+$fmt($call(e.get("len"),[$item(e.get("exp"),"people")],$dict([])),-1,null)+" people from "+$fmt($get(e.get("origin"),"name"),-1,null)+" "+$fmt(e.get("aim"),-1,null)+"; "+$fmt($item(e.get("exp"),"index"),-1,null)+" of "+$fmt($bin("Sub",$call(e.get("len"),[$item(e.get("exp"),"path")],$dict([])),1),-1,null)+" steps done, "+$fmt(e.get("left"),-1,null)+" to go (left in year "+$fmt($item(e.get("exp"),"start"),-1,null)+")")],$dict([]));
}
if($truth($un("Not",e.get("shown")))){$call($get(e.get("lines"),"append"),["  none"],$dict([]));
}else{}
return $call($get("\n","join"),[e.get("lines")],$dict([]));return null;}));
e.set("besieging",$fn("besieging",e,["sim", "pair", "side"],[undefined,undefined,undefined],null,null,[],[],e=>{for(const $t2345 of $iter($call(e.get("_list"),[e.get("sim"),"armies"],$dict([])))){e.set("army",$t2345);if($truth($boolop("And",[()=>$compare([()=>$item($item(e.get("army"),"war"),0),()=>$item(e.get("pair"),0)], ["Eq"]),()=>$compare([()=>$item($item(e.get("army"),"war"),1),()=>$item(e.get("pair"),1)], ["Eq"]),()=>$compare([()=>$item(e.get("army"),"side"),()=>e.get("side")], ["Eq"]),()=>$compare([()=>$item(e.get("army"),"state"),()=>"besieging"], ["Eq"])]))){return true;}else{}
}
return false;return null;}));
e.set("advance_armies",$fn("advance_armies",e,["sim"],[undefined],null,null,[],[],e=>{$call(e.get("ensure_placed"),[e.get("sim")],$dict([]));
{const $t2346=$call(e.get("_list"),[e.get("sim"),"armies"],$dict([]));e.set("armies",$t2346);}
{const $t2347=$call(e.get("getattr"),[e.get("sim"),"war_details",$dict([])],$dict([]));e.set("details",$t2347);}
{const $t2348=[];e.set("keep",$t2348);}
for(const $t2349 of $iter($call(e.get("sorted"),[$get(e.get("sim"),"wars")],$dict([])))){e.set("pair",$t2349);{const $t2350=$call($get(e.get("details"),"get"),[e.get("pair")],$dict([]));e.set("detail",$t2350);}
if($truth($un("Not",e.get("detail")))){continue;}else{}
for(const $t2351 of $iter($tuple([0,1]))){e.set("side",$t2351);{const $t2352=$item(e.get("pair"),e.get("side"));e.set("cid",$t2352);}
{const $t2353=$item(e.get("pair"),$bin("Sub",1,e.get("side")));e.set("enemy",$t2353);}
{const $t2354=$item($call($get(e.get("detail"),"get"),["mobilized",[0,0]],$dict([])),e.get("side"));e.set("men",$t2354);}
{const $t2355=$boolop("Or",[()=>$call($get(e.get("detail"),"get"),["objectives"],$dict([])),()=>[null,null]]);e.set("objectives",$t2355);}
{const $t2356=$call($get($get(e.get("sim"),"settlements"),"get"),[$item(e.get("objectives"),e.get("side"))],$dict([]));e.set("objective",$t2356);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("men"),()=>0], ["LtE"]),()=>$compare([()=>e.get("objective"),()=>null], ["Is"]),()=>$compare([()=>$get(e.get("objective"),"country"),()=>e.get("enemy")], ["NotEq"]),()=>$compare([()=>$get(e.get("objective"),"abandoned"),()=>null], ["IsNot"])]))){continue;}else{}
{const $t2357=null;e.set("army",$t2357);}
for(const $t2358 of $iter(e.get("armies"))){e.set("a",$t2358);if($truth($boolop("And",[()=>$compare([()=>$item($item(e.get("a"),"war"),0),()=>$item(e.get("pair"),0)], ["Eq"]),()=>$compare([()=>$item($item(e.get("a"),"war"),1),()=>$item(e.get("pair"),1)], ["Eq"]),()=>$compare([()=>$item(e.get("a"),"side"),()=>e.get("side")], ["Eq"])]))){{const $t2359=e.get("a");e.set("army",$t2359);}
}else{}
}
if($truth($compare([()=>e.get("army"),()=>null], ["Is"]))){{const $t2360=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2361 of $iter($call(e.get("_inhabited"),[e.get("sim")],$dict([])))){e.set("s",$t2361);if($truth($compare([()=>$get(e.get("s"),"country"),()=>e.get("cid")], ["Eq"]))){yield e.get("s");}}})();})(e));e.set("mine",$t2360);}
if($truth($un("Not",e.get("mine")))){continue;}else{}
{const $t2362=$item(e.get("mine"),0);e.set("home",$t2362);}
for(const $t2363 of $iter(e.get("mine"))){e.set("s",$t2363);if($truth($compare([()=>$call(e.get("dist"),[$get(e.get("s"),"gx"),$get(e.get("s"),"gy"),$get(e.get("objective"),"gx"),$get(e.get("objective"),"gy")],$dict([])),()=>$call(e.get("dist"),[$get(e.get("home"),"gx"),$get(e.get("home"),"gy"),$get(e.get("objective"),"gx"),$get(e.get("objective"),"gy")],$dict([]))], ["Lt"]))){{const $t2364=e.get("s");e.set("home",$t2364);}
}else{}
}
{const $t2365=$call(e.get("cached_route"),[e.get("sim"),$tuple([$get(e.get("home"),"gx"),$get(e.get("home"),"gy")]),$tuple([$get(e.get("objective"),"gx"),$get(e.get("objective"),"gy")])],$dict([]));e.set("route",$t2365);}
if($truth($compare([()=>e.get("route"),()=>null], ["Is"]))){continue;}else{}
{const $t2366=$item(e.get("route"),0);e.set("cells",$t2366);}
{const $t2367=$call(e.get("max"),[0,$bin("Sub",$call(e.get("len"),[e.get("cells")],$dict([])),3)],$dict([]));e.set("stop",$t2367);}
{const $t2368=$dict([["id",$call(e.get("_next"),[e.get("sim"),"next_army"],$dict([]))],["country",e.get("cid")],["enemy",e.get("enemy")],["war",[$item(e.get("pair"),0),$item(e.get("pair"),1)]],["side",e.get("side")],["objective",$get(e.get("objective"),"id")],["origin",$get(e.get("home"),"id")],["men",e.get("men")],["path",Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2369 of $iter($item(e.get("cells"),$slice(null,$bin("Add",e.get("stop"),1),null)))){{const $t2370=Array.from($iter($t2369));e.set("x",$t2370[0]);e.set("y",$t2370[1]);}yield [e.get("x"),e.get("y")];}})();})(e))],["costs",$call(e.get("_path_costs"),[e.get("sim"),$item(e.get("cells"),$slice(null,$bin("Add",e.get("stop"),1),null))],$dict([]))],["index",0],["carry",0.0],["state","marching"],["start",$get(e.get("sim"),"year")]]);e.set("army",$t2368);}
$call($get(e.get("armies"),"append"),[e.get("army")],$dict([]));
$call($get(e.get("sim"),"record"),[($fmt($get($item($get(e.get("sim"),"countries"),e.get("cid")),"name"),-1,null)+" mobilized "+$fmt(e.get("men"),-1,null)+" soldiers, who marched out of "+$fmt($get(e.get("home"),"name"),-1,null)+" toward "+$fmt($get(e.get("objective"),"name"),-1,null)+"."),"war"],$dict([]));
}else{}
{const $t2371=e.get("men");$setitem(e.get("army"),"men",$t2371);}
{const $t2372=$get(e.get("objective"),"id");$setitem(e.get("army"),"objective",$t2372);}
if($truth($compare([()=>$item(e.get("army"),"state"),()=>"marching"], ["Eq"]))){{const $t2373=$bin("Add",$bin("Mult",e.get("ARMY_SPEED"),$bin("Add",1,$item($call(e.get("tech_effects"),[$get($item($get(e.get("sim"),"countries"),e.get("cid")),"technologies")],$dict([])),"land"))),$item(e.get("army"),"carry"));e.set("budget",$t2373);}
{const $t2374=$item(e.get("army"),"index");e.set("index",$t2374);}
while($truth($boolop("And",[()=>$compare([()=>e.get("index"),()=>$bin("Sub",$call(e.get("len"),[$item(e.get("army"),"path")],$dict([])),1)], ["Lt"]),()=>$compare([()=>e.get("budget"),()=>$item($item(e.get("army"),"costs"),e.get("index"))], ["GtE"])]))){e.set("budget",$aug("Sub",e.get("budget"),$item($item(e.get("army"),"costs"),e.get("index"))));e.set("index",$aug("Add",e.get("index"),1));}
{const $t2375=$call(e.get("min"),[e.get("budget"),6.0],$dict([]));$setitem(e.get("army"),"carry",$t2375);}
{const $t2376=e.get("index");$setitem(e.get("army"),"index",$t2376);}
if($truth($compare([()=>e.get("index"),()=>$bin("Sub",$call(e.get("len"),[$item(e.get("army"),"path")],$dict([])),1)], ["GtE"]))){{const $t2377="besieging";$setitem(e.get("army"),"state",$t2377);}
$call($get(e.get("sim"),"record"),[("The "+$fmt($get($item($get(e.get("sim"),"countries"),e.get("cid")),"name"),-1,null)+" army of "+$fmt(e.get("men"),-1,null)+" soldiers laid siege to "+$fmt($get(e.get("objective"),"name"),-1,null)+"."),"war"],$dict([]));
}else{}
}else{}
$call($get(e.get("keep"),"append"),[$item(e.get("army"),"id")],$dict([]));
}
}
{const $t2378=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2379 of $iter(e.get("armies"))){e.set("a",$t2379);if($truth($compare([()=>$item(e.get("a"),"id"),()=>e.get("keep")], ["In"]))){yield e.get("a");}}})();})(e));$set(e.get("sim"),"armies",$t2378);}
return null;}));
{const $t2380=$dict([["grain","grain"],["pasture","wool"],["fish","salted fish"],["game","meat"],["timber","timber"],["stone","stone"],["clay","pottery clay"],["iron","iron"],["copper","copper"],["coal","coal"],["gold","gold"],["salt","salt"],["furs","furs"]]);e.set("CARGO",$t2380);}
e.set("_caravan_spawn",$fn("_caravan_spawn",e,["sim", "cid", "st", "caravans", "land", "sea"],[undefined,undefined,undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t2381=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t2381);}
{const $t2382=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2383 of $iter($call(e.get("sorted"),[$call($get(e.get("land"),"get"),[e.get("cid"),$call(e.get("set"),[],$dict([]))],$dict([]))],$dict([])))){e.set("n",$t2383);if($truth($compare([()=>$call(e.get("tuple"),[$call(e.get("sorted"),[[e.get("cid"),e.get("n")]],$dict([]))],$dict([])),()=>$get(e.get("sim"),"wars")], ["NotIn"]))){yield e.get("n");}}})();})(e));e.set("partners",$t2382);}
if($truth($compare([()=>"sailing",()=>$get(e.get("country"),"technologies")], ["In"]))){e.set("partners",$aug("Add",e.get("partners"),Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2384 of $iter($call(e.get("sorted"),[$call($get(e.get("sea"),"get"),[e.get("cid"),$call(e.get("set"),[],$dict([]))],$dict([]))],$dict([])))){e.set("n",$t2384);if($truth($compare([()=>e.get("n"),()=>e.get("partners")], ["NotIn"]))){yield e.get("n");}}})();})(e))));}else{}
if($truth($un("Not",e.get("partners")))){return null;}else{}
{const $t2385=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("partners")],$dict([]));e.set("other",$t2385);}
{const $t2386=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2387 of $iter($call(e.get("_inhabited"),[e.get("sim")],$dict([])))){e.set("s",$t2387);if($truth($compare([()=>$get(e.get("s"),"country"),()=>e.get("cid")], ["Eq"]))){yield e.get("s");}}})();})(e));e.set("mine",$t2386);}
{const $t2388=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2389 of $iter($call(e.get("_inhabited"),[e.get("sim")],$dict([])))){e.set("s",$t2389);if($truth($compare([()=>$get(e.get("s"),"country"),()=>e.get("other")], ["Eq"]))){yield e.get("s");}}})();})(e));e.set("theirs",$t2388);}
if($truth($boolop("Or",[()=>$un("Not",e.get("mine")),()=>$un("Not",e.get("theirs"))]))){return null;}else{}
{const $t2390=$call(e.get("settlement_counts"),[e.get("sim")],$dict([]));e.set("counts",$t2390);}
{const $t2391=$call(e.get("max"),[e.get("mine")],$dict([["key",$fn("<lambda>",e,["s"],[undefined],null,null,[],[],e=>{return $bin("Add",$bin("Add",$call($get(e.get("counts"),"get"),[$get(e.get("s"),"id"),0],$dict([])),$bin("Mult",40,$compare([()=>"market",()=>$call(e.get("getattr"),[e.get("s"),"buildings",$dict([])],$dict([]))], ["In"]))),$bin("Mult",40,$compare([()=>"harbor",()=>$call(e.get("getattr"),[e.get("s"),"buildings",$dict([])],$dict([]))], ["In"])));return null;})]]));e.set("origin",$t2391);}
{const $t2392=$item($call(e.get("world"),[e.get("sim")],$dict([])),"land");e.set("comp",$t2392);}
{const $t2393=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2394 of $iter(e.get("theirs"))){e.set("s",$t2394);if($truth($compare([()=>$item($item(e.get("comp"),$get(e.get("s"),"gy")),$get(e.get("s"),"gx")),()=>$item($item(e.get("comp"),$get(e.get("origin"),"gy")),$get(e.get("origin"),"gx"))], ["Eq"]))){yield e.get("s");}}})();})(e));e.set("same",$t2393);}
{const $t2395=$un("Not",e.get("same"));e.set("by_sea",$t2395);}
{const $t2396=($truth(e.get("by_sea"))?e.get("theirs"):e.get("same"));e.set("pool",$t2396);}
if($truth(e.get("by_sea"))){{const $t2397=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2398 of $iter(e.get("pool"))){e.set("s",$t2398);if($truth($call(e.get("_coast"),[e.get("sim"),e.get("s")],$dict([])))){yield e.get("s");}}})();})(e));e.set("pool",$t2397);}
if($truth($boolop("Or",[()=>$un("Not",e.get("pool")),()=>$un("Not",$call(e.get("_coast"),[e.get("sim"),e.get("origin")],$dict([])))]))){return null;}else{}
}else{}
{const $t2399=$item(e.get("pool"),0);e.set("dest",$t2399);}
for(const $t2400 of $iter(e.get("pool"))){e.set("s",$t2400);if($truth($compare([()=>$call(e.get("dist"),[$get(e.get("s"),"gx"),$get(e.get("s"),"gy"),$get(e.get("origin"),"gx"),$get(e.get("origin"),"gy")],$dict([])),()=>$call(e.get("dist"),[$get(e.get("dest"),"gx"),$get(e.get("dest"),"gy"),$get(e.get("origin"),"gx"),$get(e.get("origin"),"gy")],$dict([]))], ["Lt"]))){{const $t2401=e.get("s");e.set("dest",$t2401);}
}else{}
}
{const $t2402=$call(e.get("cached_route"),[e.get("sim"),$tuple([$get(e.get("origin"),"gx"),$get(e.get("origin"),"gy")]),$tuple([$get(e.get("dest"),"gx"),$get(e.get("dest"),"gy")]),e.get("by_sea")],$dict([]));e.set("route",$t2402);}
if($truth($compare([()=>e.get("route"),()=>null], ["Is"]))){return null;}else{}
{const $t2403=$item(e.get("route"),0);e.set("cells",$t2403);}
{const $t2404=$call(e.get("max"),[4,$call(e.get("min"),[90,$bin("Add",$bin("FloorDiv",$item(e.get("st"),"merchants"),3),$bin("Mult",4,$bin("Add",$call($get($item(e.get("st"),"buildings"),"get"),["market",0],$dict([])),$call($get($item(e.get("st"),"buildings"),"get"),["harbor",0],$dict([])))))],$dict([]))],$dict([]));e.set("size",$t2404);}
{const $t2405=null;e.set("carries",$t2405);}
if($truth($compare([()=>$item(e.get("st"),"infected_share"),()=>0.02], ["GtE"]))){{const $t2406=$call(e.get("Counter"),[((parent)=>{const e=new Env(parent);return (function*(){for(const $t2407 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t2407);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("p"),"country"),()=>e.get("cid")], ["Eq"]),()=>$get(e.get("p"),"infection")]))){yield $get(e.get("p"),"infection");}}})();})(e)],$dict([]));e.set("sick",$t2406);}
if($truth(e.get("sick"))){{const $t2408=$item($item($call($get(e.get("sick"),"most_common"),[1],$dict([])),0),0);e.set("carries",$t2408);}
}else{}
}else{}
{const $t2409=$call(e.get("resources_near"),[e.get("sim"),$get(e.get("origin"),"gx"),$get(e.get("origin"),"gy"),4],$dict([]));e.set("near",$t2409);}
{const $t2410=($truth(e.get("near"))?$item(e.get("CARGO"),$item($item($call($get(e.get("near"),"most_common"),[1],$dict([])),0),0)):"cloth");e.set("cargo",$t2410);}
{const $t2411=$dict([["id",$call(e.get("_next"),[e.get("sim"),"next_caravan"],$dict([]))],["country",e.get("cid")],["partner",e.get("other")],["origin",$get(e.get("origin"),"id")],["dest",$get(e.get("dest"),"id")],["mode",($truth(e.get("by_sea"))?"sea":"land")],["path",Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2412 of $iter(e.get("cells"))){{const $t2413=Array.from($iter($t2412));e.set("x",$t2413[0]);e.set("y",$t2413[1]);}yield [e.get("x"),e.get("y")];}})();})(e))],["costs",($truth(e.get("by_sea"))?$call(e.get("_sea_costs"),[e.get("cells")],$dict([])):$call(e.get("_path_costs"),[e.get("sim"),e.get("cells")],$dict([])))],["index",0],["carry",0.0],["size",e.get("size")],["cargo",e.get("cargo")],["carries",e.get("carries")],["start",$get(e.get("sim"),"year")],["large",$compare([()=>e.get("size"),()=>40], ["GtE"])]]);e.set("caravan",$t2411);}
$call($get(e.get("caravans"),"append"),[e.get("caravan")],$dict([]));
if($truth($boolop("Or",[()=>$compare([()=>e.get("size"),()=>40], ["GtE"]),()=>e.get("carries")]))){$call($get(e.get("sim"),"record"),[($fmt(($truth($compare([()=>e.get("size"),()=>40], ["GtE"]))?"A large band":"A band"),-1,null)+" of "+$fmt(e.get("size"),-1,null)+" "+$fmt($get(e.get("country"),"name"),-1,null)+" merchants left "+$fmt($get(e.get("origin"),"name"),-1,null)+" for "+$fmt($get(e.get("dest"),"name"),-1,null)+" with "+$fmt(e.get("cargo"),-1,null)+$fmt(($truth(e.get("carries"))?$bin("Add",", some of them sick with ",e.get("carries")):""),-1,null)+"."),"political"],$dict([]));
}else{}
return null;}));
e.set("advance_caravans",$fn("advance_caravans",e,["sim"],[undefined],null,null,[],[],e=>{e.set("state",$get($import("systems"),"state"));$call(e.get("ensure_placed"),[e.get("sim")],$dict([]));
{const $t2414=$call(e.get("_list"),[e.get("sim"),"caravans"],$dict([]));e.set("caravans",$t2414);}
{const $t2415=$call(e.get("contacts"),[e.get("sim")],$dict([]));{const $t2416=Array.from($iter($t2415));e.set("land",$t2416[0]);e.set("sea",$t2416[1]);}}
{const $t2417=[];e.set("arrived",$t2417);}
for(const $t2418 of $iter(e.get("caravans"))){e.set("c",$t2418);{const $t2419=$call(e.get("tech_effects"),[$get($item($get(e.get("sim"),"countries"),$item(e.get("c"),"country")),"technologies")],$dict([]));e.set("cfx",$t2419);}
{const $t2420=($truth($compare([()=>$item(e.get("c"),"mode"),()=>"sea"], ["Eq"]))?$bin("Mult",e.get("CARAVAN_SEA_SPEED"),$bin("Add",1,$item(e.get("cfx"),"sea"))):$bin("Mult",e.get("CARAVAN_SPEED"),$bin("Add",1,$item(e.get("cfx"),"land"))));e.set("speed",$t2420);}
{const $t2421=$bin("Add",e.get("speed"),$item(e.get("c"),"carry"));e.set("budget",$t2421);}
{const $t2422=$item(e.get("c"),"index");e.set("index",$t2422);}
while($truth($boolop("And",[()=>$compare([()=>e.get("index"),()=>$bin("Sub",$call(e.get("len"),[$item(e.get("c"),"path")],$dict([])),1)], ["Lt"]),()=>$compare([()=>e.get("budget"),()=>$item($item(e.get("c"),"costs"),e.get("index"))], ["GtE"])]))){e.set("budget",$aug("Sub",e.get("budget"),$item($item(e.get("c"),"costs"),e.get("index"))));e.set("index",$aug("Add",e.get("index"),1));}
{const $t2423=$call(e.get("min"),[e.get("budget"),6.0],$dict([]));$setitem(e.get("c"),"carry",$t2423);}
{const $t2424=e.get("index");$setitem(e.get("c"),"index",$t2424);}
if($truth($compare([()=>e.get("index"),()=>$bin("Sub",$call(e.get("len"),[$item(e.get("c"),"path")],$dict([])),1)], ["GtE"]))){$call($get(e.get("arrived"),"append"),[e.get("c")],$dict([]));
}else{}
}
for(const $t2425 of $iter(e.get("arrived"))){e.set("c",$t2425);$call(e.get("_drop"),[e.get("caravans"),e.get("c")],$dict([]));
{const $t2426=$item($get(e.get("sim"),"countries"),$item(e.get("c"),"country"));e.set("home",$t2426);}
{const $t2427=$item($get(e.get("sim"),"countries"),$item(e.get("c"),"partner"));e.set("away",$t2427);}
{const $t2428=$call($get($get(e.get("sim"),"settlements"),"get"),[$item(e.get("c"),"dest")],$dict([]));e.set("dest",$t2428);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("dest"),()=>null], ["Is"]),()=>$compare([()=>$get(e.get("away"),"ended"),()=>null], ["IsNot"]),()=>$compare([()=>$get(e.get("home"),"ended"),()=>null], ["IsNot"])]))){continue;}else{}
{const $t2429=$call(e.get("min"),[2.0,$bin("Div",$item(e.get("c"),"size"),40)],$dict([]));e.set("gain",$t2429);}
for(const $t2430 of $iter($tuple([e.get("home"),e.get("away")]))){e.set("country",$t2430);{const $t2431=$call(e.get("min"),[100,$bin("Add",$get(e.get("country"),"prosperity"),$bin("Mult",e.get("gain"),0.5))],$dict([]));$set(e.get("country"),"prosperity",$t2431);}
{const $t2432=$bin("Add",$call(e.get("getattr"),[e.get("country"),"treasury",0.0],$dict([])),$bin("Mult",$item(e.get("c"),"size"),3));$set(e.get("country"),"treasury",$t2432);}
}
e.set("pass_on_knowledge",$get($import("society"),"pass_on_knowledge"));for(const $t2433 of $iter($tuple([$tuple([e.get("home"),e.get("away")]),$tuple([e.get("away"),e.get("home")])]))){{const $t2434=Array.from($iter($t2433));e.set("giver",$t2434[0]);e.set("taker",$t2434[1]);}{const $t2435=$call(e.get("pass_on_knowledge"),[e.get("sim"),e.get("giver"),e.get("taker"),$call(e.get("min"),[0.6,$bin("Mult",0.02,$item(e.get("c"),"size"))],$dict([]))],$dict([]));e.set("got",$t2435);}
if($truth($boolop("And",[()=>e.get("got"),()=>$compare([()=>$item(e.get("c"),"size"),()=>40], ["GtE"])]))){$call($get(e.get("sim"),"record"),[("Merchants from "+$fmt($get(e.get("giver"),"name"),-1,null)+" taught "+$fmt($get(e.get("taker"),"name"),-1,null)+" about "+$fmt($item(e.get("got"),0),-1,null)+" in "+$fmt($get(e.get("dest"),"name"),-1,null)+"."),"discovery"],$dict([]));
}else{}
}
if($truth($boolop("And",[()=>$item(e.get("c"),"carries"),()=>$compare([()=>$item(e.get("c"),"carries"),()=>$get(e.get("sim"),"sicknesses")], ["In"]),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.6], ["Lt"])]))){{const $t2436=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2437 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t2437);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("p"),"settlement"),()=>$get(e.get("dest"),"id")], ["Eq"]),()=>$compare([()=>$get(e.get("p"),"infection"),()=>null], ["Is"]),()=>$compare([()=>$item(e.get("c"),"carries"),()=>$get(e.get("p"),"immunity")], ["NotIn"])]))){yield e.get("p");}}})();})(e));e.set("residents",$t2436);}
if($truth(e.get("residents"))){e.set("_history",$get($import("epidemiology"),"_history"));{const $t2438=$call($get($get(e.get("sim"),"rng"),"choice"),[e.get("residents")],$dict([]));e.set("patient",$t2438);}
{const $t2439=$item(e.get("c"),"carries");$set(e.get("patient"),"infection",$t2439);}
{const $t2440=0;$set(e.get("patient"),"infection_steps",$t2440);}
$call(e.get("_history"),[e.get("patient"),"infected",$item(e.get("c"),"carries"),$get(e.get("sim"),"year")],$dict([]));
$call($get(e.get("sim"),"record"),[("Merchants from "+$fmt($get(e.get("home"),"name"),-1,null)+" brought "+$fmt($item(e.get("c"),"carries"),-1,null)+" to "+$fmt($get(e.get("dest"),"name"),-1,null)+" in "+$fmt($get(e.get("away"),"name"),-1,null)+"."),"sickness"],$dict([]));
}else{}
}else{}
}
if($truth($compare([()=>$call(e.get("len"),[e.get("caravans")],$dict([])),()=>8], ["GtE"]))){return null;}else{}
for(const $t2441 of $iter($call(e.get("sorted"),[$get(e.get("sim"),"countries")],$dict([])))){e.set("cid",$t2441);{const $t2442=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t2442);}
if($truth($boolop("Or",[()=>$compare([()=>$get(e.get("country"),"ended"),()=>null], ["IsNot"]),()=>$compare([()=>$call(e.get("len"),[$call(e.get("_list"),[e.get("sim"),"caravans"],$dict([]))],$dict([])),()=>8], ["GtE"])]))){continue;}else{}
{const $t2443=$call(e.get("state"),[e.get("sim"),e.get("cid")],$dict([]));e.set("st",$t2443);}
if($truth($boolop("Or",[()=>$compare([()=>$item(e.get("st"),"trade"),()=>0.6], ["Lt"]),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>$call(e.get("min"),[0.4,$bin("Add",0.05,$bin("Mult",0.06,$item(e.get("st"),"trade")))],$dict([]))], ["GtE"])]))){continue;}else{}
$call(e.get("_caravan_spawn"),[e.get("sim"),e.get("cid"),e.get("st"),e.get("caravans"),e.get("land"),e.get("sea")],$dict([]));
}
return null;}));
});
$register("systems",e=>{e.set("Counter",$get($import("collections"),"Counter"));e.set("contacts",$get($import("geography"),"contacts"));e.set("profile",$get($import("geography"),"profile"));e.set("settlement_counts",$get($import("geography"),"settlement_counts"));e.set("dist",$get($import("geography"),"dist"));e.set("_inhabited",$get($import("geography"),"_inhabited"));e.set("resources_near",$get($import("geography"),"resources_near"));e.set("building_counts",$get($import("development"),"building_counts"));e.set("governments",$import("governments"));e.set("tech_effects",$get($import("technology"),"effects"));e.set("economy_of",$get($import("economy"),"of"));e.set("_clamp",$fn("_clamp",e,["value"],[undefined],null,null,[],[],e=>{return $call(e.get("max"),[0.0,$call(e.get("min"),[100.0,e.get("value")],$dict([]))],$dict([]));return null;}));
e.set("_add",$fn("_add",e,["notes", "label", "value"],[undefined,undefined,undefined],null,null,[],[],e=>{if($truth($compare([()=>$call(e.get("abs"),[e.get("value")],$dict([])),()=>0.004], ["GtE"]))){$call($get(e.get("notes"),"append"),[[e.get("label"),$bin("Div",$call(e.get("int"),[$bin("Mult",e.get("value"),1000)],$dict([])),1000)]],$dict([]));
}else{}
return e.get("value");return null;}));
e.set("_mul",$fn("_mul",e,["notes", "label", "factor"],[undefined,undefined,undefined],null,null,[],[],e=>{if($truth($compare([()=>$call(e.get("abs"),[$bin("Sub",e.get("factor"),1.0)],$dict([])),()=>0.004], ["GtE"]))){$call($get(e.get("notes"),"append"),[[e.get("label"),$bin("Div",$call(e.get("int"),[$bin("Mult",$bin("Sub",e.get("factor"),1.0),1000)],$dict([])),1000)]],$dict([]));
}else{}
return e.get("factor");return null;}));
e.set("census",$fn("census",e,["sim"],[undefined],null,null,[],[],e=>{{const $t2444=$dict([]);e.set("table",$t2444);}
for(const $t2445 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t2445);{const $t2446=$call($get(e.get("table"),"get"),[$get(e.get("p"),"country")],$dict([]));e.set("row",$t2446);}
if($truth($compare([()=>e.get("row"),()=>null], ["Is"]))){{const $t2447=[0,0,$call(e.get("Counter"),[],$dict([]))];e.set("row",$t2447);}
{const $t2448=e.get("row");$setitem(e.get("table"),$get(e.get("p"),"country"),$t2448);}
}else{}
$setitem(e.get("row"),0,$aug("Add",$item(e.get("row"),0),1));if($truth($get(e.get("p"),"infection"))){$setitem(e.get("row"),1,$aug("Add",$item(e.get("row"),1),1));}else{}
if($truth($compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"]))){$setitem($item(e.get("row"),2),$get(e.get("p"),"job"),$aug("Add",$item($item(e.get("row"),2),$get(e.get("p"),"job")),1));}else{}
}
return e.get("table");return null;}));
e.set("analyze",$fn("analyze",e,["sim", "cid", "counted"],[undefined,undefined,null],null,null,[],[],e=>{{const $t2449=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t2449);}
{const $t2450=$call(e.get("contacts"),[e.get("sim"),false],$dict([]));{const $t2451=Array.from($iter($t2450));e.set("land",$t2451[0]);e.set("sea",$t2451[1]);}}
{const $t2452=$call(e.get("profile"),[e.get("sim"),e.get("cid")],$dict([]));e.set("prof",$t2452);}
{const $t2453=$call(e.get("building_counts"),[e.get("sim"),e.get("cid")],$dict([]));e.set("b",$t2453);}
if($truth($compare([()=>e.get("counted"),()=>null], ["Is"]))){{const $t2454=$call(e.get("census"),[e.get("sim")],$dict([]));e.set("counted",$t2454);}
}else{}
{const $t2455=$call($get(e.get("counted"),"get"),[e.get("cid"),[0,0,$call(e.get("Counter"),[],$dict([]))]],$dict([]));e.set("row",$t2455);}
{const $t2456=$item(e.get("row"),0);e.set("residents",$t2456);}
{const $t2457=$item(e.get("row"),1);e.set("infected",$t2457);}
{const $t2458=$item(e.get("row"),2);e.set("jobs",$t2458);}
{const $t2459=$call(e.get("max"),[1,e.get("residents")],$dict([]));e.set("residents",$t2459);}
{const $t2460=$bin("Div",e.get("infected"),e.get("residents"));e.set("share",$t2460);}
{const $t2461=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2462 of $iter($get(e.get("sim"),"wars"))){e.set("pair",$t2462);if($truth($compare([()=>e.get("cid"),()=>e.get("pair")], ["In"]))){yield e.get("pair");}}})();})(e));e.set("wars",$t2461);}
{const $t2463=$compare([()=>$call(e.get("len"),[e.get("wars")],$dict([])),()=>0], ["Gt"]);e.set("at_war",$t2463);}
{const $t2464=0.0;e.set("exhaustion",$t2464);}
{const $t2465=$call(e.get("getattr"),[e.get("sim"),"war_details",$dict([])],$dict([]));e.set("details",$t2465);}
for(const $t2466 of $iter(e.get("wars"))){e.set("pair",$t2466);{const $t2467=$call($get(e.get("details"),"get"),[e.get("pair")],$dict([]));e.set("detail",$t2467);}
if($truth(e.get("detail"))){{const $t2468=$call(e.get("max"),[e.get("exhaustion"),$item($item(e.get("detail"),"exhaustion"),($truth($compare([()=>$item(e.get("pair"),0),()=>e.get("cid")], ["Eq"]))?0:1))],$dict([]));e.set("exhaustion",$t2468);}
}else{}
}
{const $t2469=$get(e.get("country"),"technologies");e.set("techs",$t2469);}
{const $t2470=$call(e.get("getattr"),[e.get("sim"),"roads",$dict([])],$dict([]));e.set("roads",$t2470);}
{const $t2471=$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2472 of $iter($call($get(e.get("roads"),"values"),[],$dict([])))){e.set("v",$t2472);if($truth($compare([()=>e.get("v"),()=>e.get("cid")], ["Eq"]))){yield 1;}}})();})(e))],$dict([]));e.set("road_len",$t2471);}
{const $t2473=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2474 of $iter($call($get(e.get("land"),"get"),[e.get("cid"),$call(e.get("set"),[],$dict([]))],$dict([])))){e.set("n",$t2474);if($truth($compare([()=>$call(e.get("tuple"),[$call(e.get("sorted"),[[e.get("cid"),e.get("n")]],$dict([]))],$dict([])),()=>$get(e.get("sim"),"wars")], ["NotIn"]))){yield e.get("n");}}})();})(e));e.set("peaceful",$t2473);}
{const $t2475=($truth($compare([()=>"sailing",()=>e.get("techs")], ["In"]))?$call(e.get("len"),[$call($get(e.get("sea"),"get"),[e.get("cid"),$call(e.get("set"),[],$dict([]))],$dict([]))],$dict([])):0);e.set("sea_contacts",$t2475);}
{const $t2476=$call(e.get("tech_effects"),[e.get("techs")],$dict([]));e.set("fx",$t2476);}
{const $t2477=$bin("Mult",$bin("Mult",$bin("Add",1,$item(e.get("fx"),"trade")),$call($get(e.get("governments"),"trait"),[e.get("country"),"trade"],$dict([]))),$call(e.get("min"),[5.0,$bin("Add",$bin("Add",$bin("Add",$bin("Add",$bin("Add",$bin("Add",$bin("Add",$bin("Mult",0.5,$item(e.get("b"),"bank")),$bin("Mult",1.0,$item(e.get("b"),"station"))),$bin("Mult",0.6,$item(e.get("b"),"market"))),$bin("Mult",0.8,$item(e.get("b"),"harbor"))),$bin("Mult",0.6,$item(e.get("b"),"lighthouse"))),$bin("Mult",0.015,e.get("road_len"))),$bin("Mult",0.35,$call(e.get("len"),[e.get("peaceful")],$dict([])))),$bin("Mult",0.5,e.get("sea_contacts")))],$dict([])));e.set("trade",$t2477);}
{const $t2478=$call(e.get("getattr"),[e.get("country"),"culture",0.0],$dict([]));e.set("culture",$t2478);}
{const $t2479=$call(e.get("min"),[5.0,$bin("Div",e.get("culture"),40)],$dict([]));e.set("level",$t2479);}
{const $t2480=$compare([()=>$get(e.get("country"),"government"),()=>$get(e.get("governments"),"AUTHORITY")], ["In"]);e.set("monarchy",$t2480);}
{const $t2481=$item($call($get(e.get("governments"),"info"),[$get(e.get("country"),"government")],$dict([])),"label");e.set("form",$t2481);}
{const $t2482=$call(e.get("economy_of"),[e.get("sim"),e.get("cid")],$dict([]));e.set("eco",$t2482);}
{const $t2483=$call(e.get("getattr"),[e.get("country"),"treasury",0.0],$dict([]));e.set("treasury",$t2483);}
{const $t2484=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2485 of $iter($call(e.get("_inhabited"),[e.get("sim")],$dict([])))){e.set("s",$t2485);if($truth($compare([()=>$get(e.get("s"),"country"),()=>e.get("cid")], ["Eq"]))){yield e.get("s");}}})();})(e));e.set("places",$t2484);}
{const $t2486=false;e.set("frontier",$t2486);}
for(const $t2487 of $iter(e.get("places"))){e.set("s",$t2487);for(const $t2488 of $iter($call(e.get("_inhabited"),[e.get("sim")],$dict([])))){e.set("o",$t2488);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("o"),"country"),()=>e.get("cid")], ["NotEq"]),()=>$compare([()=>$call(e.get("dist"),[$get(e.get("s"),"gx"),$get(e.get("s"),"gy"),$get(e.get("o"),"gx"),$get(e.get("o"),"gy")],$dict([])),()=>16], ["LtE"])]))){{const $t2489=true;e.set("frontier",$t2489);}
}else{}
}
}
{const $t2490=$call(e.get("getattr"),[e.get("country"),"last_disaster_year",null],$dict([]));e.set("last_disaster",$t2490);}
{const $t2491=$boolop("And",[()=>$compare([()=>e.get("last_disaster"),()=>null], ["IsNot"]),()=>$compare([()=>$bin("Sub",$get(e.get("sim"),"year"),e.get("last_disaster")),()=>2], ["LtE"])]);e.set("recent_disaster",$t2491);}
{const $t2492=$dict([]);e.set("notes",$t2492);}
{const $t2493=[];e.set("n",$t2493);}
{const $t2494=e.get("n");$setitem(e.get("notes"),"research",$t2494);}
{const $t2495=1.0;e.set("r",$t2495);}
e.set("r",$aug("Add",e.get("r"),$call(e.get("_add"),[e.get("n"),"Schools",$bin("Mult",0.1,$bin("Pow",$item(e.get("b"),"school"),0.8))],$dict([]))));e.set("r",$aug("Add",e.get("r"),$call(e.get("_add"),[e.get("n"),"Libraries",$bin("Mult",0.16,$bin("Pow",$item(e.get("b"),"library"),0.8))],$dict([]))));e.set("r",$aug("Add",e.get("r"),$call(e.get("_add"),[e.get("n"),"Universities",$bin("Mult",0.28,$bin("Pow",$item(e.get("b"),"university"),0.8))],$dict([]))));e.set("r",$aug("Add",e.get("r"),$call(e.get("_add"),[e.get("n"),"Observatories",$bin("Mult",0.18,$bin("Pow",$item(e.get("b"),"observatory"),0.8))],$dict([]))));e.set("r",$aug("Add",e.get("r"),$call(e.get("_add"),[e.get("n"),"Grand academy",$bin("Mult",0.25,$item(e.get("b"),"grand_academy"))],$dict([]))));e.set("r",$aug("Add",e.get("r"),$call(e.get("_add"),[e.get("n"),"Trade carries ideas",$bin("Mult",0.07,e.get("trade"))],$dict([]))));e.set("r",$aug("Add",e.get("r"),$call(e.get("_add"),[e.get("n"),"Culture and learning",$bin("Mult",0.07,e.get("level"))],$dict([]))));e.set("r",$aug("Add",e.get("r"),$call(e.get("_add"),[e.get("n"),"Political stability",$bin("Div",$bin("Sub",$get(e.get("country"),"stability"),50),250)],$dict([]))));e.set("r",$aug("Add",e.get("r"),$call(e.get("_add"),[e.get("n"),$bin("Add",e.get("form")," government"),$call($get(e.get("governments"),"trait"),[e.get("country"),"research"],$dict([]))],$dict([]))));e.set("r",$aug("Add",e.get("r"),$call(e.get("_add"),[e.get("n"),"Open markets",($truth($compare([()=>$call(e.get("getattr"),[e.get("country"),"economic_system","mixed"],$dict([])),()=>"capitalism"], ["Eq"]))?0.04:0)],$dict([]))));e.set("r",$aug("Add",e.get("r"),$call(e.get("_add"),[e.get("n"),"Epidemic disruption",$un("USub",$call(e.get("min"),[0.3,$bin("Mult",e.get("share"),3)],$dict([])))],$dict([]))));e.set("r",$aug("Add",e.get("r"),$call(e.get("_add"),[e.get("n"),"Isolation in the highlands",($truth($boolop("And",[()=>$un("Not",$call($get(e.get("land"),"get"),[e.get("cid")],$dict([]))),()=>$compare([()=>$item(e.get("prof"),"mountain"),()=>0.5], ["Gt"])]))?$un("USub",0.12):0)],$dict([]))));e.set("r",$aug("Add",e.get("r"),$call(e.get("_add"),[e.get("n"),"Treasury patronage",$bin("Mult",0.08,$call(e.get("min"),[1.0,$bin("Div",$call(e.get("max"),[0.0,e.get("treasury")],$dict([])),5000)],$dict([])))],$dict([]))));{const $t2496=$call(e.get("max"),[0.0,$bin("Sub",e.get("r"),1.0)],$dict([]));e.set("boost",$t2496);}
{const $t2497=$call(e.get("max"),[0.4,$call(e.get("min"),[2.4,($truth($compare([()=>e.get("r"),()=>1.0], ["GtE"]))?$bin("Add",1.0,$bin("Div",e.get("boost"),$bin("Add",1,$bin("Div",e.get("boost"),1.1)))):e.get("r"))],$dict([]))],$dict([]));e.set("research",$t2497);}
{const $t2498=[];e.set("n",$t2498);}
{const $t2499=e.get("n");$setitem(e.get("notes"),"culture",$t2499);}
{const $t2500=$bin("Add",$bin("Add",$bin("Add",$bin("Add",$bin("Add",$bin("Add",$bin("Add",$bin("Mult",$item(e.get("jobs"),"performer"),0.03),$bin("Mult",$item(e.get("jobs"),"teacher"),0.015)),$bin("Mult",1.8,$item(e.get("b"),"theater"))),$bin("Mult",0.8,$item(e.get("b"),"monument"))),$bin("Mult",0.7,$item(e.get("b"),"library"))),$bin("Mult",0.4,$item(e.get("b"),"school"))),$bin("Mult",1.0,$item(e.get("b"),"university"))),$bin("Mult",2.5,$bin("Add",$bin("Add",$bin("Add",$item(e.get("b"),"palace"),$item(e.get("b"),"grand_academy")),$item(e.get("b"),"lighthouse")),$item(e.get("b"),"fortress"))));e.set("gain",$t2500);}
e.set("gain",$aug("Mult",e.get("gain"),$bin("Mult",$bin("Mult",$bin("Mult",$bin("Mult",$bin("Add",0.5,$bin("Div",$get(e.get("country"),"prosperity"),100)),$bin("Add",0.6,$bin("Div",$get(e.get("country"),"stability"),150))),($truth(e.get("at_war"))?0.6:1.0)),$call($get(e.get("governments"),"trait"),[e.get("country"),"culture"],$dict([]))),$bin("Add",1,$item(e.get("fx"),"cult")))));$call(e.get("_add"),[e.get("n"),$bin("Add",e.get("form")," shapes the arts"),($truth($compare([()=>$call($get(e.get("governments"),"trait"),[e.get("country"),"culture"],$dict([])),()=>1.0], ["NotEq"]))?$bin("Mult",e.get("gain"),$bin("Sub",1,$bin("Div",1,$call($get(e.get("governments"),"trait"),[e.get("country"),"culture"],$dict([]))))):0)],$dict([]));
$call(e.get("_add"),[e.get("n"),"Performers and teachers",$bin("Add",$bin("Mult",$item(e.get("jobs"),"performer"),0.03),$bin("Mult",$item(e.get("jobs"),"teacher"),0.015))],$dict([]));
$call(e.get("_add"),[e.get("n"),"Theaters, monuments and libraries",$bin("Add",$bin("Add",$bin("Mult",1.8,$item(e.get("b"),"theater")),$bin("Mult",0.8,$item(e.get("b"),"monument"))),$bin("Mult",0.7,$item(e.get("b"),"library")))],$dict([]));
$call(e.get("_add"),[e.get("n"),"War suppresses the arts",($truth(e.get("at_war"))?$bin("Div",$bin("Mult",$un("USub",e.get("gain")),0.4),0.6):0)],$dict([]));
{const $t2501=[];e.set("n",$t2501);}
{const $t2502=e.get("n");$setitem(e.get("notes"),"stability",$t2502);}
{const $t2503=0.0;e.set("s",$t2503);}
e.set("s",$aug("Add",e.get("s"),$call(e.get("_add"),[e.get("n"),"Monuments",$call(e.get("min"),[0.8,$bin("Mult",$bin("Mult",0.22,$item(e.get("b"),"monument")),($truth(e.get("monarchy"))?1.4:1.0))],$dict([]))],$dict([]))));e.set("s",$aug("Add",e.get("s"),$call(e.get("_add"),[e.get("n"),$bin("Add",e.get("form")," rule"),$call($get(e.get("governments"),"trait"),[e.get("country"),"stability"],$dict([]))],$dict([]))));e.set("s",$aug("Add",e.get("s"),$call(e.get("_add"),[e.get("n"),"Faith, law and civic life",$item(e.get("fx"),"stab")],$dict([]))));if($truth($compare([()=>e.get("eco"),()=>null], ["IsNot"]))){e.set("s",$aug("Add",e.get("s"),$call(e.get("_add"),[e.get("n"),"Hunger",$bin("Mult",$un("USub",1.4),$bin("Sub",1.0,$item(e.get("eco"),"food_ratio")))],$dict([]))));e.set("s",$aug("Add",e.get("s"),$call(e.get("_add"),[e.get("n"),"Luxuries in the markets",$bin("Mult",$bin("Mult",0.25,$item(e.get("eco"),"luxury_cover")),$call(e.get("min"),[1.0,$bin("Add",$bin("Add",$bin("Add",$call($get($item(e.get("eco"),"made"),"get"),["gold",0.0],$dict([])),$call($get($item(e.get("eco"),"made"),"get"),["furs",0.0],$dict([]))),$call($get($item(e.get("eco"),"imports"),"get"),["gold",0.0],$dict([]))),$call($get($item(e.get("eco"),"imports"),"get"),["furs",0.0],$dict([])))],$dict([])))],$dict([]))));}else{}
e.set("s",$aug("Add",e.get("s"),$call(e.get("_add"),[e.get("n"),"Royal palace",$bin("Mult",0.5,$item(e.get("b"),"palace"))],$dict([]))));e.set("s",$aug("Add",e.get("s"),$call(e.get("_add"),[e.get("n"),"National pride from culture",$bin("Mult",0.04,e.get("level"))],$dict([]))));e.set("s",$aug("Add",e.get("s"),$call(e.get("_add"),[e.get("n"),"Defensible towns",($truth($boolop("Or",[()=>e.get("at_war"),()=>e.get("frontier")]))?$call(e.get("min"),[0.3,$bin("Mult",0.1,$item(e.get("b"),"walls"))],$dict([])):0)],$dict([]))));e.set("s",$aug("Add",e.get("s"),$call(e.get("_add"),[e.get("n"),"War exhaustion",($truth(e.get("at_war"))?$bin("Div",$un("USub",e.get("exhaustion")),60):0)],$dict([]))));e.set("s",$aug("Add",e.get("s"),$call(e.get("_add"),[e.get("n"),"Epidemic fear",$bin("Mult",$un("USub",e.get("share")),14)],$dict([]))));e.set("s",$aug("Add",e.get("s"),$call(e.get("_add"),[e.get("n"),"Recent disaster",($truth(e.get("recent_disaster"))?$un("USub",1.2):0)],$dict([]))));e.set("s",$aug("Add",e.get("s"),$call(e.get("_add"),[e.get("n"),"New towns raise confidence",($truth($compare([()=>$bin("Sub",$get(e.get("sim"),"year"),$call(e.get("getattr"),[e.get("country"),"last_expansion",$un("USub",99)],$dict([]))),()=>3], ["LtE"]))?0.4:0)],$dict([]))));e.set("s",$aug("Add",e.get("s"),$call(e.get("_add"),[e.get("n"),"Empty treasury",($truth($compare([()=>e.get("treasury"),()=>0], ["Lt"]))?$un("USub",0.3):0)],$dict([]))));if($truth($compare([()=>e.get("s"),()=>0], ["Gt"]))){e.set("s",$aug("Mult",e.get("s"),$call(e.get("max"),[0.1,$bin("Sub",1,$bin("Div",$get(e.get("country"),"stability"),105))],$dict([]))));}else{}
{const $t2504=$call(e.get("max"),[$un("USub",1.5),$call(e.get("min"),[1.2,e.get("s")],$dict([]))],$dict([]));e.set("stability_delta",$t2504);}
{const $t2505=[];e.set("n",$t2505);}
{const $t2506=e.get("n");$setitem(e.get("notes"),"prosperity",$t2506);}
{const $t2507=0.0;e.set("p_delta",$t2507);}
e.set("p_delta",$aug("Add",e.get("p_delta"),$call(e.get("_add"),[e.get("n"),"Markets",$bin("Mult",0.12,$bin("Pow",$item(e.get("b"),"market"),0.8))],$dict([]))));e.set("p_delta",$aug("Add",e.get("p_delta"),$call(e.get("_add"),[e.get("n"),"Harbors",$bin("Mult",0.16,$item(e.get("b"),"harbor"))],$dict([]))));e.set("p_delta",$aug("Add",e.get("p_delta"),$call(e.get("_add"),[e.get("n"),"Trade routes",$bin("Mult",0.05,e.get("trade"))],$dict([]))));e.set("p_delta",$aug("Add",e.get("p_delta"),$call(e.get("_add"),[e.get("n"),"Mines",$bin("Mult",0.08,$item(e.get("b"),"mine"))],$dict([]))));e.set("p_delta",$aug("Add",e.get("p_delta"),$call(e.get("_add"),[e.get("n"),"Forges",$bin("Mult",0.06,$item(e.get("b"),"forge"))],$dict([]))));e.set("p_delta",$aug("Add",e.get("p_delta"),$call(e.get("_add"),[e.get("n"),"Banks",$bin("Mult",0.1,$item(e.get("b"),"bank"))],$dict([]))));e.set("p_delta",$aug("Add",e.get("p_delta"),$call(e.get("_add"),[e.get("n"),"Factories",$bin("Mult",0.15,$item(e.get("b"),"factory"))],$dict([]))));e.set("p_delta",$aug("Add",e.get("p_delta"),$call(e.get("_add"),[e.get("n"),"Mills",$bin("Mult",0.06,$item(e.get("b"),"mill"))],$dict([]))));e.set("p_delta",$aug("Add",e.get("p_delta"),$call(e.get("_add"),[e.get("n"),"Culture draws visitors",$bin("Mult",0.08,e.get("level"))],$dict([]))));e.set("p_delta",$aug("Add",e.get("p_delta"),$call(e.get("_add"),[e.get("n"),"Epidemic costs",$bin("Mult",$un("USub",e.get("share")),8)],$dict([]))));e.set("p_delta",$aug("Add",e.get("p_delta"),$call(e.get("_add"),[e.get("n"),"War costs",($truth(e.get("at_war"))?$un("USub",0.6):0)],$dict([]))));if($truth($compare([()=>e.get("eco"),()=>null], ["IsNot"]))){e.set("p_delta",$aug("Add",e.get("p_delta"),$call(e.get("_add"),[e.get("n"),"Resource wealth",$call(e.get("min"),[0.5,$bin("Mult",$bin("Div",$item(e.get("eco"),"gdp"),$call(e.get("max"),[1.0,e.get("residents")],$dict([]))),0.25)],$dict([]))],$dict([]))));e.set("p_delta",$aug("Add",e.get("p_delta"),$call(e.get("_add"),[e.get("n"),"Shortages of building materials",$bin("Mult",$un("USub",0.6),$bin("Sub",1.0,$item(e.get("eco"),"material_cover")))],$dict([]))));e.set("p_delta",$aug("Add",e.get("p_delta"),$call(e.get("_add"),[e.get("n"),"Hunger",$bin("Mult",$un("USub",1.0),$bin("Sub",1.0,$item(e.get("eco"),"food_ratio")))],$dict([]))));e.set("p_delta",$aug("Add",e.get("p_delta"),$call(e.get("_add"),[e.get("n"),"Trade profits",$call(e.get("min"),[0.4,$bin("Mult",$bin("Div",$item(e.get("eco"),"trade_income"),$call(e.get("max"),[1.0,e.get("residents")],$dict([]))),0.1)],$dict([]))],$dict([]))));}else{}
if($truth($compare([()=>e.get("p_delta"),()=>0], ["Gt"]))){e.set("p_delta",$aug("Mult",e.get("p_delta"),$call(e.get("max"),[0.1,$bin("Sub",1,$bin("Div",$get(e.get("country"),"prosperity"),110))],$dict([]))));}else{}
{const $t2508=$call(e.get("max"),[$un("USub",2.0),$call(e.get("min"),[1.5,e.get("p_delta")],$dict([]))],$dict([]));e.set("prosperity_delta",$t2508);}
{const $t2509=[];e.set("n",$t2509);}
{const $t2510=e.get("n");$setitem(e.get("notes"),"food",$t2510);}
{const $t2511=0.0;e.set("food_delta",$t2511);}
e.set("food_delta",$aug("Add",e.get("food_delta"),$call(e.get("_add"),[e.get("n"),"Granaries",$call(e.get("min"),[6.0,$bin("Mult",2.2,$bin("Pow",$item(e.get("b"),"granary"),0.8))],$dict([]))],$dict([]))));e.set("food_delta",$aug("Add",e.get("food_delta"),$call(e.get("_add"),[e.get("n"),"Mills",$bin("Mult",1.5,$bin("Pow",$item(e.get("b"),"mill"),0.8))],$dict([]))));e.set("food_delta",$aug("Add",e.get("food_delta"),$call(e.get("_add"),[e.get("n"),"Harbor fisheries",$bin("Mult",$bin("Mult",1.0,$bin("Pow",$item(e.get("b"),"harbor"),0.8)),$bin("Add",1,$item(e.get("prof"),"coastal")))],$dict([]))));e.set("food_delta",$aug("Add",e.get("food_delta"),$call(e.get("_add"),[e.get("n"),"Wells and aqueducts (irrigation)",$bin("Mult",0.6,$bin("Pow",$bin("Add",$item(e.get("b"),"well"),$item(e.get("b"),"aqueduct")),0.7))],$dict([]))));{const $t2512=[];e.set("n",$t2512);}
{const $t2513=e.get("n");$setitem(e.get("notes"),"infection",$t2513);}
{const $t2514=1.0;e.set("infection",$t2514);}
e.set("infection",$aug("Mult",e.get("infection"),$call(e.get("_mul"),[e.get("n"),"Wells",$call(e.get("max"),[0.6,$bin("Sub",1,$bin("Mult",0.06,$item(e.get("b"),"well")))],$dict([]))],$dict([]))));e.set("infection",$aug("Mult",e.get("infection"),$call(e.get("_mul"),[e.get("n"),"Aqueducts",$call(e.get("max"),[0.6,$bin("Sub",1,$bin("Mult",0.09,$item(e.get("b"),"aqueduct")))],$dict([]))],$dict([]))));e.set("infection",$aug("Mult",e.get("infection"),$call(e.get("_mul"),[e.get("n"),"Trade carries disease",$bin("Add",1,$bin("Mult",0.04,e.get("trade")))],$dict([]))));{const $t2515=$call(e.get("min"),[2.0,$bin("Div",$call(e.get("max"),[0.0,$bin("Sub",$bin("Div",e.get("residents"),$call(e.get("max"),[1,$call(e.get("len"),[e.get("places")],$dict([]))],$dict([]))),250)],$dict([])),300)],$dict([]));e.set("crowd",$t2515);}
e.set("infection",$aug("Mult",e.get("infection"),$call(e.get("_mul"),[e.get("n"),"Crowded towns",$bin("Add",1,$bin("Mult",0.15,e.get("crowd")))],$dict([]))));e.set("infection",$aug("Mult",e.get("infection"),$call(e.get("_mul"),[e.get("n"),"Camp fever in wartime",($truth(e.get("at_war"))?1.2:1.0)],$dict([]))));{const $t2516=$bin("Mult",$bin("Pow",0.93,$item(e.get("b"),"clinic")),$bin("Pow",0.85,$item(e.get("b"),"hospital")));e.set("death_mult",$t2516);}
{const $t2517=$bin("Add",$bin("Mult",6,$item(e.get("b"),"clinic")),$bin("Mult",18,$item(e.get("b"),"hospital")));e.set("care_bonus",$t2517);}
{const $t2518=$bin("Add",$bin("Add",$bin("Add",$bin("Add",1,$bin("Mult",0.1,$item(e.get("b"),"clinic"))),$bin("Mult",0.15,$item(e.get("b"),"hospital"))),$bin("Mult",0.1,$item(e.get("b"),"university"))),$bin("Mult",0.08,$item(e.get("b"),"library")));e.set("cure_mult",$t2518);}
{const $t2519=[];e.set("n",$t2519);}
{const $t2520=e.get("n");$setitem(e.get("notes"),"military",$t2520);}
{const $t2521=1.0;e.set("power",$t2521);}
e.set("power",$aug("Mult",e.get("power"),$call(e.get("_mul"),[e.get("n"),"Mines supply arms",$bin("Add",1,$bin("Mult",0.05,$item(e.get("b"),"mine")))],$dict([]))));e.set("power",$aug("Mult",e.get("power"),$call(e.get("_mul"),[e.get("n"),$bin("Add",e.get("form")," army"),$call($get(e.get("governments"),"trait"),[e.get("country"),"military"],$dict([]))],$dict([]))));if($truth($compare([()=>e.get("eco"),()=>null], ["IsNot"]))){e.set("power",$aug("Mult",e.get("power"),$call(e.get("_mul"),[e.get("n"),"Iron, copper and coal in stock",$bin("Add",0.88,$bin("Mult",0.16,$item(e.get("eco"),"metal_cover")))],$dict([]))));}else{}
e.set("power",$aug("Mult",e.get("power"),$call(e.get("_mul"),[e.get("n"),"Morale from national culture",$bin("Add",1,$bin("Mult",0.03,e.get("level")))],$dict([]))));e.set("power",$aug("Mult",e.get("power"),$call(e.get("_mul"),[e.get("n"),"Unpaid soldiers",($truth($compare([()=>e.get("treasury"),()=>0], ["Lt"]))?0.85:1.0)],$dict([]))));e.set("power",$aug("Mult",e.get("power"),$call(e.get("_mul"),[e.get("n"),"Forges and barracks",$bin("Add",$bin("Add",1,$bin("Mult",0.04,$item(e.get("b"),"forge"))),$bin("Mult",0.06,$item(e.get("b"),"barracks")))],$dict([]))));e.set("power",$aug("Mult",e.get("power"),$call(e.get("_mul"),[e.get("n"),"Roads move armies",$bin("Add",1,$call(e.get("min"),[0.12,$bin("Mult",0.003,e.get("road_len"))],$dict([])))],$dict([]))));{const $t2522=$bin("Mult",$call(e.get("_mul"),[e.get("n"),"City walls",$bin("Pow",0.96,$item(e.get("b"),"walls"))],$dict([])),$call(e.get("_mul"),[e.get("n"),"Great fortress",$bin("Pow",0.9,$item(e.get("b"),"fortress"))],$dict([])));e.set("defense",$t2522);}
{const $t2523=$call(e.get("min"),[0.3,$bin("Add",$bin("Add",$bin("Mult",0.004,e.get("road_len")),$bin("Mult",0.05,$item(e.get("b"),"harbor"))),$bin("Mult",0.05,$item(e.get("b"),"station")))],$dict([]));e.set("supply_bonus",$t2523);}
{const $t2524=[];e.set("n",$t2524);}
{const $t2525=e.get("n");$setitem(e.get("notes"),"expansion",$t2525);}
{const $t2526=1.0;e.set("drive",$t2526);}
e.set("drive",$aug("Mult",e.get("drive"),$call(e.get("_mul"),[e.get("n"),$bin("Add",e.get("form")," seeks territory"),$bin("Mult",$call($get(e.get("governments"),"trait"),[e.get("country"),"expansion"],$dict([])),($truth(e.get("monarchy"))?1.2:1.0))],$dict([]))));e.set("drive",$aug("Mult",e.get("drive"),$call(e.get("_mul"),[e.get("n"),"Hunger pushes people out",$bin("Add",1,($truth($compare([()=>e.get("eco"),()=>null], ["IsNot"]))?$bin("Mult",0.35,$bin("Sub",1.0,$item(e.get("eco"),"food_ratio"))):0))],$dict([]))));e.set("drive",$aug("Mult",e.get("drive"),$call(e.get("_mul"),[e.get("n"),"Royal palace",$bin("Add",1,$bin("Mult",0.1,$item(e.get("b"),"palace")))],$dict([]))));e.set("drive",$aug("Mult",e.get("drive"),$call(e.get("_mul"),[e.get("n"),"Food surplus",$bin("Add",1,$bin("Div",$bin("Sub",$get(e.get("country"),"food"),50),150))],$dict([]))));{const $t2527=$bin("Div",e.get("residents"),$call(e.get("max"),[1,$call(e.get("len"),[e.get("places")],$dict([]))],$dict([])));e.set("size",$t2527);}
e.set("drive",$aug("Mult",e.get("drive"),$call(e.get("_mul"),[e.get("n"),"Crowded towns",$bin("Add",1,$call(e.get("max"),[0.0,$call(e.get("min"),[0.6,$bin("Div",$bin("Sub",e.get("size"),250),500)],$dict([]))],$dict([])))],$dict([]))));e.set("drive",$aug("Mult",e.get("drive"),$call(e.get("_mul"),[e.get("n"),"Unrest",($truth($compare([()=>$get(e.get("country"),"stability"),()=>35], ["Lt"]))?0.6:1.0)],$dict([]))));e.set("drive",$aug("Mult",e.get("drive"),$call(e.get("_mul"),[e.get("n"),"Treasury",($truth($compare([()=>e.get("treasury"),()=>2000], ["Gt"]))?1.15:($truth($compare([()=>e.get("treasury"),()=>0], ["Lt"]))?0.6:1.0))],$dict([]))));e.set("drive",$aug("Mult",e.get("drive"),$call(e.get("_mul"),[e.get("n"),"War",($truth(e.get("at_war"))?0.3:1.0)],$dict([]))));e.set("drive",$aug("Mult",e.get("drive"),$call(e.get("_mul"),[e.get("n"),"Quarantine",($truth($get(e.get("country"),"quarantine"))?0.5:1.0)],$dict([]))));e.set("drive",$aug("Mult",e.get("drive"),$call(e.get("_mul"),[e.get("n"),"Roads and trade",$bin("Add",1,$call(e.get("min"),[0.3,$bin("Add",$bin("Mult",0.01,e.get("road_len")),$bin("Mult",0.03,e.get("trade")))],$dict([])))],$dict([]))));return $dict([["year",$get(e.get("sim"),"year")],["research",e.get("research")],["culture_gain",e.get("gain")],["culture",e.get("culture")],["culture_level",e.get("level")],["stability_delta",e.get("stability_delta")],["prosperity_delta",e.get("prosperity_delta")],["food_delta",e.get("food_delta")],["trade",e.get("trade")],["expansion",$call(e.get("max"),[0.15,$call(e.get("min"),[3.0,e.get("drive")],$dict([]))],$dict([]))],["power_mult",e.get("power")],["defense_mult",e.get("defense")],["supply_bonus",e.get("supply_bonus")],["infection_mult",e.get("infection")],["death_mult",e.get("death_mult")],["care_bonus",e.get("care_bonus")],["cure_mult",e.get("cure_mult")],["infected_share",e.get("share")],["at_war",e.get("at_war")],["road_len",e.get("road_len")],["frontier",e.get("frontier")],["performers",$item(e.get("jobs"),"performer")],["scientists",$item(e.get("jobs"),"scientist")],["merchants",$item(e.get("jobs"),"merchant")],["healers",$item(e.get("jobs"),"healer")],["builders",$bin("Add",$item(e.get("jobs"),"laborer"),$item(e.get("jobs"),"artisan"))],["residents",e.get("residents")],["settlements",$call(e.get("len"),[e.get("places")],$dict([]))],["buildings",new PD(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2528 of $iter($call($get(e.get("b"),"items"),[],$dict([])))){{const $t2529=Array.from($iter($t2528));e.set("k",$t2529[0]);e.set("v",$t2529[1]);}yield $tuple([e.get("k"),e.get("v")]);}})();})(e))],["government",$get(e.get("country"),"government")],["neighbors",$call(e.get("sorted"),[$call($get(e.get("land"),"get"),[e.get("cid"),$call(e.get("set"),[],$dict([]))],$dict([]))],$dict([]))],["sea_neighbors",$call(e.get("sorted"),[$call($get(e.get("sea"),"get"),[e.get("cid"),$call(e.get("set"),[],$dict([]))],$dict([]))],$dict([]))],["notes",e.get("notes")]]);return null;}));
e.set("refresh",$fn("refresh",e,["sim"],[undefined],null,null,[],[],e=>{$call(e.get("contacts"),[e.get("sim")],$dict([]));
{const $t2530=$call(e.get("census"),[e.get("sim")],$dict([]));e.set("counted",$t2530);}
{const $t2531=$dict([["year",$get(e.get("sim"),"year")],["countries",new PD(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2532 of $iter($call(e.get("sorted"),[$get(e.get("sim"),"countries")],$dict([])))){e.set("cid",$t2532);if($truth($compare([()=>$get($item($get(e.get("sim"),"countries"),e.get("cid")),"ended"),()=>null], ["Is"]))){yield $tuple([e.get("cid"),$call(e.get("analyze"),[e.get("sim"),e.get("cid"),e.get("counted")],$dict([]))]);}}})();})(e))]]);$set(e.get("sim"),"systems_state",$t2531);}
return null;}));
e.set("state",$fn("state",e,["sim", "cid"],[undefined,undefined],null,null,[],[],e=>{{const $t2533=$call(e.get("getattr"),[e.get("sim"),"systems_state",null],$dict([]));e.set("cache",$t2533);}
if($truth($boolop("And",[()=>$compare([()=>e.get("cache"),()=>null], ["IsNot"]),()=>$compare([()=>$item(e.get("cache"),"year"),()=>$get(e.get("sim"),"year")], ["Eq"]),()=>$compare([()=>e.get("cid"),()=>$item(e.get("cache"),"countries")], ["In"])]))){return $item($item(e.get("cache"),"countries"),e.get("cid"));}else{}
return $call(e.get("analyze"),[e.get("sim"),e.get("cid")],$dict([]));return null;}));
e.set("apply_yearly",$fn("apply_yearly",e,["sim"],[undefined],null,null,[],[],e=>{{const $t2534=$call(e.get("getattr"),[e.get("sim"),"systems_state",null],$dict([]));e.set("cache",$t2534);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("cache"),()=>null], ["Is"]),()=>$compare([()=>$item(e.get("cache"),"year"),()=>$get(e.get("sim"),"year")], ["NotEq"])]))){return null;}else{}
for(const $t2535 of $iter($call(e.get("sorted"),[$item(e.get("cache"),"countries")],$dict([])))){e.set("cid",$t2535);{const $t2536=$item($item(e.get("cache"),"countries"),e.get("cid"));e.set("st",$t2536);}
{const $t2537=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t2537);}
if($truth($compare([()=>$get(e.get("country"),"ended"),()=>null], ["IsNot"]))){continue;}else{}
{const $t2538=$bin("Add",$bin("Mult",$call(e.get("getattr"),[e.get("country"),"culture",0.0],$dict([])),0.96),$item(e.get("st"),"culture_gain"));$set(e.get("country"),"culture",$t2538);}
{const $t2539=$call(e.get("_clamp"),[$bin("Add",$get(e.get("country"),"stability"),$item(e.get("st"),"stability_delta"))],$dict([]));$set(e.get("country"),"stability",$t2539);}
{const $t2540=$call(e.get("_clamp"),[$bin("Add",$get(e.get("country"),"prosperity"),$item(e.get("st"),"prosperity_delta"))],$dict([]));$set(e.get("country"),"prosperity",$t2540);}
{const $t2541=$bin("Add",$call(e.get("getattr"),[e.get("country"),"treasury",0.0],$dict([])),$bin("Mult",$bin("Mult",$bin("Mult",2.0,$item(e.get("st"),"trade")),$bin("Pow",$item(e.get("st"),"residents"),0.5)),($truth($compare([()=>$call(e.get("getattr"),[e.get("country"),"economic_system","mixed"],$dict([])),()=>"capitalism"], ["Eq"]))?1.5:1.0)));$set(e.get("country"),"treasury",$t2541);}
}
return null;}));
e.set("_ore",$fn("_ore",e,["sim", "place"],[undefined,undefined],null,null,[],[],e=>{{const $t2542=$call(e.get("resources_near"),[e.get("sim"),$get(e.get("place"),"gx"),$get(e.get("place"),"gy"),3],$dict([]));e.set("found",$t2542);}
return $bin("Add",$bin("Add",$bin("Add",$item(e.get("found"),"iron"),$item(e.get("found"),"copper")),$item(e.get("found"),"gold")),$item(e.get("found"),"coal"));return null;}));
e.set("war_friction",$fn("war_friction",e,["sim", "a", "b"],[undefined,undefined,undefined],null,null,[],[],e=>{{const $t2543=$item($get(e.get("sim"),"countries"),e.get("a"));e.set("ca",$t2543);}
{const $t2544=$item($get(e.get("sim"),"countries"),e.get("b"));e.set("cb",$t2544);}
{const $t2545=$call(e.get("state"),[e.get("sim"),e.get("a")],$dict([]));e.set("sa",$t2545);}
{const $t2546=$call(e.get("state"),[e.get("sim"),e.get("b")],$dict([]));e.set("sb",$t2546);}
{const $t2547=$call(e.get("_inhabited"),[e.get("sim")],$dict([]));e.set("places",$t2547);}
{const $t2548=0;e.set("close",$t2548);}
for(const $t2549 of $iter(e.get("places"))){e.set("x",$t2549);if($truth($compare([()=>$get(e.get("x"),"country"),()=>e.get("a")], ["Eq"]))){for(const $t2550 of $iter(e.get("places"))){e.set("y",$t2550);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("y"),"country"),()=>e.get("b")], ["Eq"]),()=>$compare([()=>$call(e.get("dist"),[$get(e.get("x"),"gx"),$get(e.get("x"),"gy"),$get(e.get("y"),"gx"),$get(e.get("y"),"gy")],$dict([])),()=>12], ["LtE"])]))){e.set("close",$aug("Add",e.get("close"),1));}else{}
}
}else{}
}
{const $t2551=$bin("Add",1,$call(e.get("min"),[1.0,$bin("Mult",0.12,e.get("close"))],$dict([])));e.set("f",$t2551);}
{const $t2552=$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2553 of $iter(e.get("places"))){e.set("x",$t2553);if($truth($compare([()=>$get(e.get("x"),"country"),()=>e.get("a")], ["Eq"]))){yield $call(e.get("_ore"),[e.get("sim"),e.get("x")],$dict([]));}}})();})(e))],$dict([]));e.set("ore_a",$t2552);}
{const $t2554=$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2555 of $iter(e.get("places"))){e.set("x",$t2555);if($truth($compare([()=>$get(e.get("x"),"country"),()=>e.get("b")], ["Eq"]))){yield $call(e.get("_ore"),[e.get("sim"),e.get("x")],$dict([]));}}})();})(e))],$dict([]));e.set("ore_b",$t2554);}
if($truth($compare([()=>$compare([()=>e.get("ore_a"),()=>0], ["Eq"]),()=>$compare([()=>e.get("ore_b"),()=>0], ["Eq"])], ["NotEq"]))){e.set("f",$aug("Mult",e.get("f"),1.25));}else{}
e.set("f",$aug("Div",e.get("f"),$bin("Add",1,$bin("Mult",0.12,$call(e.get("min"),[$item(e.get("sa"),"trade"),$item(e.get("sb"),"trade")],$dict([]))))));e.set("f",$aug("Mult",e.get("f"),$bin("Sub",1,$bin("Mult",0.04,$call(e.get("min"),[$item(e.get("sa"),"culture_level"),$item(e.get("sb"),"culture_level")],$dict([]))))));{const $t2556=$call(e.get("min"),[$get(e.get("ca"),"stability"),$get(e.get("cb"),"stability")],$dict([]));e.set("low",$t2556);}
if($truth($compare([()=>e.get("low"),()=>60], ["Lt"]))){e.set("f",$aug("Mult",e.get("f"),$bin("Add",1,$bin("Div",$bin("Sub",60,e.get("low")),200))));}else{}
if($truth($boolop("And",[()=>$compare([()=>$get(e.get("ca"),"government"),()=>"monarchy"], ["Eq"]),()=>$compare([()=>$get(e.get("cb"),"government"),()=>"monarchy"], ["Eq"])]))){e.set("f",$aug("Mult",e.get("f"),1.15));}else{}
e.set("f",$aug("Mult",e.get("f"),$bin("Div",$bin("Add",$call($get(e.get("governments"),"trait"),[e.get("ca"),"war"],$dict([])),$call($get(e.get("governments"),"trait"),[e.get("cb"),"war"],$dict([]))),2)));{const $t2557=$call(e.get("abs"),[$bin("Sub",$item($call(e.get("tech_effects"),[$get(e.get("ca"),"technologies")],$dict([])),"weapon"),$item($call(e.get("tech_effects"),[$get(e.get("cb"),"technologies")],$dict([])),"weapon"))],$dict([]));e.set("gap",$t2557);}
e.set("f",$aug("Mult",e.get("f"),$bin("Add",1,$bin("Mult",0.08,$call(e.get("min"),[3,e.get("gap")],$dict([]))))));if($truth($boolop("And",[()=>$compare([()=>$get(e.get("ca"),"government"),()=>$tuple(["democracy","republic"])], ["In"]),()=>$compare([()=>$get(e.get("cb"),"government"),()=>$tuple(["democracy","republic"])], ["In"])]))){e.set("f",$aug("Mult",e.get("f"),0.6));}else{}
return $tuple([$call(e.get("max"),[0.2,$call(e.get("min"),[3.0,e.get("f")],$dict([]))],$dict([])),$compare([()=>$compare([()=>e.get("ore_a"),()=>0], ["Eq"]),()=>$compare([()=>e.get("ore_b"),()=>0], ["Eq"])], ["NotEq"])]);return null;}));
e.set("_signed",$fn("_signed",e,["value"],[undefined],null,null,[],[],e=>{return $bin("Add",($truth($compare([()=>e.get("value"),()=>0], ["GtE"]))?"+":""),($fmt(e.get("value"),-1,(".2f"))));return null;}));
e.set("report",$fn("report",e,["sim", "query"],[undefined,""],null,null,[],[],e=>{{const $t2558=["Systems: how each country's politics, science, culture, economy, health, war, buildings and geography shape one another."];e.set("lines",$t2558);}
for(const $t2559 of $iter($call(e.get("sorted"),[$get(e.get("sim"),"countries")],$dict([])))){e.set("cid",$t2559);{const $t2560=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t2560);}
if($truth($boolop("Or",[()=>$compare([()=>$get(e.get("country"),"ended"),()=>null], ["IsNot"]),()=>$boolop("And",[()=>e.get("query"),()=>$compare([()=>e.get("query"),()=>$call($get($get(e.get("country"),"name"),"casefold"),[],$dict([]))], ["NotIn"])])]))){continue;}else{}
{const $t2561=$call(e.get("state"),[e.get("sim"),e.get("cid")],$dict([]));e.set("st",$t2561);}
$call($get(e.get("lines"),"append"),[($fmt($get(e.get("country"),"name"),-1,null)+": research x"+$fmt($item(e.get("st"),"research"),-1,(".2f"))+"; culture "+$fmt($item(e.get("st"),"culture"),-1,(".0f"))+" ("+$fmt($call(e.get("_signed"),[$item(e.get("st"),"culture_gain")],$dict([])),-1,null)+"/yr); stability "+$fmt($call(e.get("_signed"),[$item(e.get("st"),"stability_delta")],$dict([])),-1,null)+"/yr; prosperity "+$fmt($call(e.get("_signed"),[$item(e.get("st"),"prosperity_delta")],$dict([])),-1,null)+"/yr; trade "+$fmt($item(e.get("st"),"trade"),-1,(".1f"))+"; expansion x"+$fmt($item(e.get("st"),"expansion"),-1,(".2f"))+"; infection x"+$fmt($item(e.get("st"),"infection_mult"),-1,(".2f"))+"; military x"+$fmt($item(e.get("st"),"power_mult"),-1,(".2f")))],$dict([]));
for(const $t2562 of $iter($tuple(["research","stability","prosperity","expansion","infection","military"]))){e.set("topic",$t2562);{const $t2563=$call($get($item(e.get("st"),"notes"),"get"),[e.get("topic"),[]],$dict([]));e.set("notes",$t2563);}
if($truth(e.get("notes"))){$call($get(e.get("lines"),"append"),[$bin("Add",$bin("Add",$bin("Add","  ",e.get("topic")),": "),$call($get("; ","join"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2564 of $iter(e.get("notes"))){{const $t2565=Array.from($iter($t2564));e.set("label",$t2565[0]);e.set("value",$t2565[1]);}yield ($fmt(e.get("label"),-1,null)+" "+$fmt($call(e.get("_signed"),[e.get("value")],$dict([])),-1,null));}})();})(e))],$dict([])))],$dict([]));
}else{}
}
}
return $call($get("\n","join"),[e.get("lines")],$dict([]));return null;}));
e.set("hazard_report",$fn("hazard_report",e,["sim", "settlement"],[undefined,undefined],null,null,[],[],e=>{e.set("hazards_at",$get($import("geography"),"hazards_at"));e.set("ensure_placed",$get($import("geography"),"ensure_placed"));e.set("describe",$get($import("geography"),"describe"));$call(e.get("ensure_placed"),[e.get("sim")],$dict([]));
{const $t2566=$call(e.get("hazards_at"),[e.get("sim"),$get(e.get("settlement"),"gx"),$get(e.get("settlement"),"gy")],$dict([]));e.set("risk",$t2566);}
{const $t2567=[("Natural hazards at "+$fmt($get(e.get("settlement"),"name"),-1,null)+" ("+$fmt($call(e.get("describe"),[e.get("sim"),e.get("settlement")],$dict([])),-1,null)+", cell "+$fmt($get(e.get("settlement"),"gx"),-1,null)+","+$fmt($get(e.get("settlement"),"gy"),-1,null)+"):")];e.set("lines",$t2567);}
for(const $t2568 of $iter($call(e.get("sorted"),[e.get("risk")],$dict([["key",$fn("<lambda>",e,["k"],[undefined],null,null,[],[],e=>{return $un("USub",$item(e.get("risk"),e.get("k")));return null;})]])))){e.set("kind",$t2568);$call($get(e.get("lines"),"append"),[$bin("Add",("  "+$fmt(e.get("kind"),-1,null)+": "+$fmt($item(e.get("risk"),e.get("kind")),-1,(".2f"))+" "),$bin("Mult","#",$call(e.get("int"),[$bin("Mult",$item(e.get("risk"),e.get("kind")),4)],$dict([]))))],$dict([]));
}
return $call($get("\n","join"),[e.get("lines")],$dict([]));return null;}));
});
$register("disasters",e=>{e.set("tech_effects",$get($import("technology"),"effects"));e.set("H",$get($import("geography"),"H"));e.set("W",$get($import("geography"),"W"));e.set("hazards_at",$get($import("geography"),"hazards_at"));e.set("ensure_placed",$get($import("geography"),"ensure_placed"));e.set("dist",$get($import("geography"),"dist"));e.set("_inhabited",$get($import("geography"),"_inhabited"));e.set("settlement_counts",$get($import("geography"),"settlement_counts"));e.set("damage_buildings",$get($import("development"),"damage_buildings"));e.set("launch_migration",$get($import("development"),"launch_migration"));e.set("_list",$get($import("development"),"_list"));{const $t2569=["flood","storm","wildfire","earthquake","landslide","blizzard"];e.set("KINDS",$t2569);}
{const $t2570=$dict([["minor",$tuple([0.0,0.01])],["major",$tuple([0.01,0.05])],["severe",$tuple([0.05,0.15])]]);e.set("SEVERITY_RATE",$t2570);}
{const $t2571=$dict([["minor",5],["major",10],["severe",16]]);e.set("RADIUS",$t2571);}
{const $t2572=$dict([["minor",3],["major",8],["severe",18]]);e.set("DAMAGE",$t2572);}
{const $t2573=$dict([["minor",0.04],["major",0.12],["severe",0.28]]);e.set("BUILDING_LOSS",$t2573);}
{const $t2574=$dict([["flood","levee"],["storm","levee"],["wildfire","firebreak"],["earthquake","foundations"],["landslide","foundations"],["blizzard","granary"]]);e.set("PROTECTION",$t2574);}
e.set("strike",$fn("strike",e,["sim", "kind", "severity", "cx", "cy"],[undefined,undefined,undefined,undefined,undefined],null,null,[],[],e=>{$call(e.get("ensure_placed"),[e.get("sim")],$dict([]));
{const $t2575=$call($get($get(e.get("sim"),"rng"),"uniform"),[...$iter($item(e.get("SEVERITY_RATE"),e.get("severity")))],$dict([]));e.set("rate",$t2575);}
{const $t2576=$item(e.get("RADIUS"),e.get("severity"));e.set("radius",$t2576);}
{const $t2577=$dict([]);e.set("by_place",$t2577);}
for(const $t2578 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("person",$t2578);$call($get($call($get(e.get("by_place"),"setdefault"),[$get(e.get("person"),"settlement"),[]],$dict([])),"append"),[e.get("person")],$dict([]));
}
{const $t2579=$item(e.get("PROTECTION"),e.get("kind"));e.set("protection",$t2579);}
{const $t2580=[];e.set("affected",$t2580);}
{const $t2581=0;e.set("deaths",$t2581);}
{const $t2582=0;e.set("lost_buildings",$t2582);}
{const $t2583=$dict([]);e.set("share",$t2583);}
for(const $t2584 of $iter($call(e.get("sorted"),[$call(e.get("_inhabited"),[e.get("sim")],$dict([]))],$dict([["key",$fn("<lambda>",e,["x"],[undefined],null,null,[],[],e=>{return $get(e.get("x"),"id");return null;})]])))){e.set("s",$t2584);{const $t2585=$call(e.get("dist"),[$get(e.get("s"),"gx"),$get(e.get("s"),"gy"),e.get("cx"),e.get("cy")],$dict([]));e.set("d",$t2585);}
if($truth($compare([()=>e.get("d"),()=>e.get("radius")], ["Gt"]))){continue;}else{}
{const $t2586=$item($call(e.get("hazards_at"),[e.get("sim"),$get(e.get("s"),"gx"),$get(e.get("s"),"gy")],$dict([])),e.get("kind"));e.set("risk",$t2586);}
{const $t2587=$bin("Mult",$bin("Sub",1,$bin("Mult",$bin("Div",e.get("d"),$bin("Add",e.get("radius"),1)),0.7)),$call(e.get("min"),[1.6,$bin("Add",0.5,$bin("Mult",e.get("risk"),0.45))],$dict([])));e.set("intensity",$t2587);}
{const $t2588=($truth($compare([()=>e.get("protection"),()=>$call(e.get("getattr"),[e.get("s"),"buildings",$dict([])],$dict([]))], ["In"]))?0.5:0.0);e.set("shield",$t2588);}
{const $t2589=$call($get(e.get("by_place"),"get"),[$get(e.get("s"),"id"),[]],$dict([]));e.set("residents",$t2589);}
{const $t2590=$item($call(e.get("tech_effects"),[$get($item($get(e.get("sim"),"countries"),$get(e.get("s"),"country")),"technologies")],$dict([])),"haz");e.set("resilience",$t2590);}
{const $t2591=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2592 of $iter(e.get("residents"))){e.set("p",$t2592);if($truth($compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>$bin("Mult",$bin("Mult",$bin("Mult",e.get("rate"),e.get("intensity")),$bin("Sub",1,e.get("shield"))),e.get("resilience"))], ["Lt"]))){yield e.get("p");}}})();})(e));e.set("victims",$t2591);}
for(const $t2593 of $iter(e.get("victims"))){e.set("person",$t2593);{const $t2594=$get(e.get("sim"),"year");$set(e.get("person"),"died",$t2594);}
{const $t2595="natural disaster";$set(e.get("person"),"cause_of_death",$t2595);}
$set($item($get(e.get("sim"),"lineages"),$get(e.get("person"),"lineage")),"deaths",$aug("Add",$get($item($get(e.get("sim"),"lineages"),$get(e.get("person"),"lineage")),"deaths"),1));$del($get(e.get("sim"),"people"),$get(e.get("person"),"id"));}
e.set("deaths",$aug("Add",e.get("deaths"),$call(e.get("len"),[e.get("victims")],$dict([]))));{const $t2596=$call(e.get("damage_buildings"),[e.get("sim"),e.get("s"),$bin("Mult",$bin("Mult",$bin("Mult",$item(e.get("BUILDING_LOSS"),e.get("severity")),e.get("intensity")),$bin("Sub",1,e.get("shield"))),e.get("resilience")),("The "+$fmt(e.get("kind"),-1,null))],$dict([]));e.set("lost",$t2596);}
e.set("lost_buildings",$aug("Add",e.get("lost_buildings"),$call(e.get("len"),[e.get("lost")],$dict([]))));$call($get(e.get("affected"),"append"),[$dict([["settlement",$get(e.get("s"),"id")],["deaths",$call(e.get("len"),[e.get("victims")],$dict([]))],["population",$call(e.get("len"),[e.get("residents")],$dict([]))]])],$dict([]));
{const $t2597=$call($get(e.get("share"),"setdefault"),[$get(e.get("s"),"country"),[0,0]],$dict([]));e.set("row",$t2597);}
$setitem(e.get("row"),0,$aug("Add",$item(e.get("row"),0),$call(e.get("len"),[e.get("residents")],$dict([]))));$setitem(e.get("row"),1,$aug("Add",$item(e.get("row"),1),$call(e.get("len"),[e.get("victims")],$dict([]))));}
for(const $t2598 of $iter($call(e.get("sorted"),[e.get("share")],$dict([])))){e.set("cid",$t2598);{const $t2599=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t2599);}
{const $t2600=$call(e.get("max"),[1,$bin("Add",$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2601 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t2601);if($truth($compare([()=>$get(e.get("p"),"country"),()=>e.get("cid")], ["Eq"]))){yield 1;}}})();})(e))],$dict([])),$item($item(e.get("share"),e.get("cid")),1))],$dict([]));e.set("total",$t2600);}
{const $t2602=$call(e.get("min"),[1.0,$bin("Div",$item($item(e.get("share"),e.get("cid")),0),e.get("total"))],$dict([]));e.set("fraction",$t2602);}
{const $t2603=$call(e.get("max"),[0,$bin("Sub",$get(e.get("country"),"food"),$bin("Mult",$item(e.get("DAMAGE"),e.get("severity")),e.get("fraction")))],$dict([]));$set(e.get("country"),"food",$t2603);}
{const $t2604=$call(e.get("max"),[0,$bin("Sub",$get(e.get("country"),"prosperity"),$bin("Mult",$item(e.get("DAMAGE"),e.get("severity")),e.get("fraction")))],$dict([]));$set(e.get("country"),"prosperity",$t2604);}
{const $t2605=$get(e.get("sim"),"year");$set(e.get("country"),"last_disaster_year",$t2605);}
{const $t2606=e.get("kind");$set(e.get("country"),"last_disaster_type",$t2606);}
}
e.set("damage_deposits",$get($import("economy"),"damage"));{const $t2607=$call(e.get("damage_deposits"),[e.get("sim"),e.get("kind"),e.get("cx"),e.get("cy"),e.get("radius")],$dict([]));e.set("damaged",$t2607);}
{const $t2608=$call(e.get("_list"),[e.get("sim"),"disaster_log"],$dict([]));e.set("log",$t2608);}
$call($get(e.get("log"),"append"),[$dict([["year",$get(e.get("sim"),"year")],["kind",e.get("kind")],["severity",e.get("severity")],["x",e.get("cx")],["y",e.get("cy")],["radius",e.get("radius")],["deaths",e.get("deaths")],["settlements",Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2609 of $iter(e.get("affected"))){e.set("a",$t2609);yield $item(e.get("a"),"settlement");}})();})(e))],["deposits",e.get("damaged")]])],$dict([]));
while($truth($compare([()=>$call(e.get("len"),[e.get("log")],$dict([])),()=>25], ["Gt"]))){$call($get(e.get("log"),"pop"),[0],$dict([]));
}
for(const $t2610 of $iter(e.get("affected"))){e.set("a",$t2610);{const $t2611=$item($get(e.get("sim"),"settlements"),$item(e.get("a"),"settlement"));e.set("s",$t2611);}
{const $t2612=$bin("Sub",$item(e.get("a"),"population"),$item(e.get("a"),"deaths"));e.set("left",$t2612);}
if($truth($boolop("And",[()=>$item(e.get("a"),"population"),()=>$compare([()=>$bin("Div",$item(e.get("a"),"deaths"),$item(e.get("a"),"population")),()=>0.12], ["GtE"]),()=>$compare([()=>e.get("left"),()=>30], ["GtE"])]))){{const $t2613=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2615 of $iter($call(e.get("_inhabited"),[e.get("sim")],$dict([])))){e.set("t",$t2615);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("t"),"country"),()=>$get(e.get("s"),"country")], ["Eq"]),()=>$compare([()=>$get(e.get("t"),"id"),()=>$get(e.get("s"),"id")], ["NotEq"]),()=>$compare([()=>$get(e.get("t"),"id"),()=>Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2614 of $iter(e.get("affected"))){e.set("x",$t2614);yield $item(e.get("x"),"settlement");}})();})(e))], ["NotIn"])]))){yield e.get("t");}}})();})(e));e.set("safer",$t2613);}
if($truth(e.get("safer"))){{const $t2616=$call(e.get("min"),[e.get("safer")],$dict([["key",$fn("<lambda>",e,["t"],[undefined],null,null,[],[],e=>{return $call(e.get("dist"),[$get(e.get("t"),"gx"),$get(e.get("t"),"gy"),$get(e.get("s"),"gx"),$get(e.get("s"),"gy")],$dict([]));return null;})]]));e.set("target",$t2616);}
{const $t2617=$item(Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2618 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t2618);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("p"),"settlement"),()=>$get(e.get("s"),"id")], ["Eq"]),()=>$compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"])]))){yield e.get("p");}}})();})(e)),$slice(null,$call(e.get("max"),[5,$bin("FloorDiv",e.get("left"),5)],$dict([])),null));e.set("movers",$t2617);}
$call(e.get("launch_migration"),[e.get("sim"),e.get("s"),e.get("target"),e.get("movers"),"refugee"],$dict([]));
}else{}
}else{}
}
return $dict([["deaths",e.get("deaths")],["affected",e.get("affected")],["buildings",e.get("lost_buildings")],["radius",e.get("radius")]]);return null;}));
e.set("describe",$fn("describe",e,["sim", "kind", "severity", "summary", "country"],[undefined,undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t2619=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2620 of $iter($item(e.get("summary"),"affected"))){e.set("a",$t2620);yield $get($item($get(e.get("sim"),"settlements"),$item(e.get("a"),"settlement")),"name");}})();})(e));e.set("names",$t2619);}
{const $t2621=$bin("Add",$call($get(", ","join"),[$item(e.get("names"),$slice(null,3,null))],$dict([])),($truth($compare([()=>$call(e.get("len"),[e.get("names")],$dict([])),()=>3], ["Gt"]))?(" and "+$fmt($bin("Sub",$call(e.get("len"),[e.get("names")],$dict([])),3),-1,null)+" more"):""));e.set("where",$t2621);}
{const $t2622=$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2623 of $iter($item(e.get("summary"),"affected"))){e.set("a",$t2623);yield $bin("Sub",$item(e.get("a"),"population"),$item(e.get("a"),"deaths"));}})();})(e))],$dict([]));e.set("survivors",$t2622);}
{const $t2624=("A "+$fmt(e.get("severity"),-1,null)+" "+$fmt(e.get("kind"),-1,null)+" struck "+$fmt($get(e.get("country"),"name"),-1,null)+": "+$fmt($item(e.get("summary"),"deaths"),-1,null)+" deaths, "+$fmt(e.get("survivors"),-1,null)+" survivors");e.set("text",$t2624);}
if($truth(e.get("where"))){e.set("text",$aug("Add",e.get("text"),(" (affecting "+$fmt(e.get("where"),-1,null)+")")));}else{}
if($truth($item(e.get("summary"),"buildings"))){e.set("text",$aug("Add",e.get("text"),("; "+$fmt($item(e.get("summary"),"buildings"),-1,null)+" buildings lost")));}else{}
return $bin("Add",e.get("text"),".");return null;}));
e.set("resolve",$fn("resolve",e,["sim"],[undefined],null,null,[],[],e=>{$call(e.get("ensure_placed"),[e.get("sim")],$dict([]));
{const $t2625=$dict([]);e.set("groups",$t2625);}
for(const $t2626 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("person",$t2626);$call($get($call($get(e.get("groups"),"setdefault"),[$get(e.get("person"),"country"),[]],$dict([])),"append"),[e.get("person")],$dict([]));
}
{const $t2627=0;e.set("deaths",$t2627);}
for(const $t2628 of $iter($call(e.get("list"),[e.get("groups")],$dict([])))){e.set("cid",$t2628);if($truth($compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>$get(e.get("sim"),"disaster_chance")], ["GtE"]))){continue;}else{}
{const $t2629=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t2629);}
{const $t2630=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2631 of $iter($call(e.get("_inhabited"),[e.get("sim")],$dict([])))){e.set("s",$t2631);if($truth($compare([()=>$get(e.get("s"),"country"),()=>e.get("cid")], ["Eq"]))){yield e.get("s");}}})();})(e));e.set("places",$t2630);}
if($truth($un("Not",e.get("places")))){continue;}else{}
{const $t2632=$compare([()=>"Drought",()=>$get(e.get("country"),"conditions")], ["In"]);e.set("drought",$t2632);}
{const $t2633=[];e.set("pairs",$t2633);}
{const $t2634=[];e.set("weights",$t2634);}
for(const $t2635 of $iter(e.get("places"))){e.set("s",$t2635);{const $t2636=$call(e.get("hazards_at"),[e.get("sim"),$get(e.get("s"),"gx"),$get(e.get("s"),"gy")],$dict([]));e.set("risk",$t2636);}
for(const $t2637 of $iter(e.get("KINDS"))){e.set("kind",$t2637);$call($get(e.get("pairs"),"append"),[$tuple([e.get("s"),e.get("kind")])],$dict([]));
$call($get(e.get("weights"),"append"),[$bin("Mult",$item(e.get("risk"),e.get("kind")),($truth($boolop("And",[()=>$compare([()=>e.get("kind"),()=>"wildfire"], ["Eq"]),()=>e.get("drought")]))?1.8:1.0))],$dict([]));
}
}
{const $t2638=$item($call($get($get(e.get("sim"),"rng"),"choices"),[e.get("pairs"),e.get("weights")],$dict([])),0);{const $t2639=Array.from($iter($t2638));e.set("s",$t2639[0]);e.set("kind",$t2639[1]);}}
{const $t2640=$call($get($get(e.get("sim"),"rng"),"choice"),[["minor","minor","minor","major","major","severe"]],$dict([]));e.set("severity",$t2640);}
{const $t2641=$call(e.get("max"),[0,$call(e.get("min"),[$bin("Sub",e.get("W"),1),$bin("Add",$get(e.get("s"),"gx"),$call($get($get(e.get("sim"),"rng"),"randint"),[$un("USub",2),2],$dict([])))],$dict([]))],$dict([]));e.set("cx",$t2641);}
{const $t2642=$call(e.get("max"),[0,$call(e.get("min"),[$bin("Sub",e.get("H"),1),$bin("Add",$get(e.get("s"),"gy"),$call($get($get(e.get("sim"),"rng"),"randint"),[$un("USub",2),2],$dict([])))],$dict([]))],$dict([]));e.set("cy",$t2642);}
{const $t2643=$call(e.get("strike"),[e.get("sim"),e.get("kind"),e.get("severity"),e.get("cx"),e.get("cy")],$dict([]));e.set("summary",$t2643);}
e.set("deaths",$aug("Add",e.get("deaths"),$item(e.get("summary"),"deaths")));$call($get(e.get("sim"),"record"),[$call(e.get("describe"),[e.get("sim"),e.get("kind"),e.get("severity"),e.get("summary"),e.get("country")],$dict([])),"disaster"],$dict([]));
}
return e.get("deaths");return null;}));
});
$register("economy",e=>{e.set("W",$get($import("geography"),"W"));e.set("H",$get($import("geography"),"H"));e.set("RESOURCE_INFO",$get($import("geography"),"RESOURCE_INFO"));e.set("FEATURE_NAMES",$get($import("geography"),"FEATURE_NAMES"));e.set("world",$get($import("geography"),"world"));e.set("_inhabited",$get($import("geography"),"_inhabited"));e.set("reach",$get($import("geography"),"reach"));e.set("settlement_counts",$get($import("geography"),"settlement_counts"));e.set("contested_cells",$get($import("geography"),"contested_cells"));e.set("dist",$get($import("geography"),"dist"));e.set("contacts",$get($import("geography"),"contacts"));e.set("governments",$import("governments"));e.set("tech_effects",$get($import("technology"),"effects"));{const $t2644=["grain","pasture","fish","game"];e.set("FOOD",$t2644);}
{const $t2645=["timber","stone","clay"];e.set("MATERIALS",$t2645);}
{const $t2646=["iron","copper","coal"];e.set("METALS",$t2646);}
{const $t2647=["gold","furs","salt"];e.set("LUXURIES",$t2647);}
{const $t2648=$bin("Add",$bin("Add",$bin("Add",e.get("FOOD"),e.get("MATERIALS")),e.get("METALS")),e.get("LUXURIES"));e.set("KINDS",$t2648);}
{const $t2649=$dict([["grain",0.3],["pasture",0.3],["fish",0.4],["game",0.4],["timber",0.03],["stone",0.0],["clay",0.0],["iron",0.005],["copper",0.005],["coal",0.01],["gold",0.0],["furs",0.06],["salt",0.0]]);e.set("SPOIL",$t2649);}
{const $t2650=new PS(["irrigation","crop rotation","granaries","watermills","pottery"]);e.set("FOOD_TECHS",$t2650);}
{const $t2651=0.5;e.set("YEARLY_SHARE",$t2651);}
{const $t2652=0.5;e.set("CAPACITY_SHARE",$t2652);}
{const $t2653=0.35;e.set("FOOD_NEED",$t2653);}
e.set("_state",$fn("_state",e,["sim"],[undefined],null,null,[],[],e=>{{const $t2654=$call(e.get("getattr"),[e.get("sim"),"deposit_state",null],$dict([]));e.set("state",$t2654);}
if($truth($compare([()=>e.get("state"),()=>null], ["Is"]))){{const $t2655=$dict([]);e.set("state",$t2655);}
{const $t2656=e.get("state");$set(e.get("sim"),"deposit_state",$t2656);}
}else{}
return e.get("state");return null;}));
e.set("_econ",$fn("_econ",e,["sim"],[undefined],null,null,[],[],e=>{{const $t2657=$call(e.get("getattr"),[e.get("sim"),"econ",null],$dict([]));e.set("econ",$t2657);}
if($truth($compare([()=>e.get("econ"),()=>null], ["Is"]))){{const $t2658=$dict([]);e.set("econ",$t2658);}
{const $t2659=e.get("econ");$set(e.get("sim"),"econ",$t2659);}
}else{}
return e.get("econ");return null;}));
e.set("label",$fn("label",e,["kind"],[undefined],null,null,[],[],e=>{return $item($item(e.get("RESOURCE_INFO"),e.get("kind")),0);return null;}));
e.set("deposit_level",$fn("deposit_level",e,["sim", "key", "slot", "cap"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t2660=$call($get($call(e.get("_state"),[e.get("sim")],$dict([])),"get"),[$bin("Add",$bin("Mult",e.get("key"),4),e.get("slot"))],$dict([]));e.set("entry",$t2660);}
if($truth($compare([()=>e.get("entry"),()=>null], ["Is"]))){return $tuple([$call(e.get("float"),[e.get("cap")],$dict([])),false]);}else{}
return $tuple([$item(e.get("entry"),0),$call(e.get("bool"),[$item(e.get("entry"),1)],$dict([]))]);return null;}));
e.set("tile_deposits",$fn("tile_deposits",e,["sim", "x", "y"],[undefined,undefined,undefined],null,null,[],[],e=>{{const $t2661=$call(e.get("world"),[e.get("sim")],$dict([]));e.set("geo",$t2661);}
{const $t2662=[];e.set("rows",$t2662);}
{const $t2663=$bin("Add",$bin("Mult",e.get("y"),e.get("W")),e.get("x"));e.set("key",$t2663);}
{const $t2664=0;e.set("slot",$t2664);}
for(const $t2665 of $iter($call($get($item(e.get("geo"),"deposits"),"get"),[e.get("key"),[]],$dict([])))){{const $t2666=Array.from($iter($t2665));e.set("kind",$t2666[0]);e.set("cap",$t2666[1]);}{const $t2667=$call(e.get("deposit_level"),[e.get("sim"),e.get("key"),e.get("slot"),e.get("cap")],$dict([]));{const $t2668=Array.from($iter($t2667));e.set("amount",$t2668[0]);e.set("locked",$t2668[1]);}}
$call($get(e.get("rows"),"append"),[$dict([["kind",e.get("kind")],["cap",e.get("cap")],["amount",e.get("amount")],["locked",e.get("locked")],["rate",$item($item(e.get("RESOURCE_INFO"),e.get("kind")),2)]])],$dict([]));
e.set("slot",$aug("Add",e.get("slot"),1));}
return e.get("rows");return null;}));
e.set("regrow",$fn("regrow",e,["sim"],[undefined],null,null,[],[],e=>{{const $t2669=$call(e.get("world"),[e.get("sim")],$dict([]));e.set("geo",$t2669);}
{const $t2670=$call(e.get("_state"),[e.get("sim")],$dict([]));e.set("state",$t2670);}
{const $t2671=[];e.set("refilled",$t2671);}
for(const $t2672 of $iter($call(e.get("sorted"),[e.get("state")],$dict([])))){e.set("idx",$t2672);{const $t2673=$item(e.get("state"),e.get("idx"));e.set("entry",$t2673);}
{const $t2674=$bin("FloorDiv",e.get("idx"),4);e.set("key",$t2674);}
{const $t2675=$bin("Mod",e.get("idx"),4);e.set("slot",$t2675);}
{const $t2676=$item($item($item(e.get("geo"),"deposits"),e.get("key")),e.get("slot"));{const $t2677=Array.from($iter($t2676));e.set("kind",$t2677[0]);e.set("cap",$t2677[1]);}}
{const $t2678=$call(e.get("min"),[$call(e.get("float"),[e.get("cap")],$dict([])),$bin("Add",$item(e.get("entry"),0),$bin("Mult",e.get("cap"),$item($item(e.get("RESOURCE_INFO"),e.get("kind")),2)))],$dict([]));$setitem(e.get("entry"),0,$t2678);}
if($truth($compare([()=>$item(e.get("entry"),0),()=>e.get("cap")], ["GtE"]))){if($truth($boolop("And",[()=>$item(e.get("entry"),1),()=>$compare([()=>e.get("cap"),()=>100], ["GtE"])]))){$call($get(e.get("refilled"),"append"),[$tuple([$item(e.get("entry"),2),e.get("kind"),e.get("key")])],$dict([]));
}else{}
$del(e.get("state"),e.get("idx"));}else{}
}
for(const $t2679 of $iter($item(e.get("refilled"),$slice(null,2,null)))){{const $t2680=Array.from($iter($t2679));e.set("sid",$t2680[0]);e.set("kind",$t2680[1]);e.set("key",$t2680[2]);}{const $t2681=$call($get($get(e.get("sim"),"settlements"),"get"),[e.get("sid")],$dict([]));e.set("s",$t2681);}
if($truth($boolop("And",[()=>$compare([()=>e.get("s"),()=>null], ["IsNot"]),()=>$compare([()=>$get(e.get("s"),"abandoned"),()=>null], ["Is"])]))){$call($get(e.get("sim"),"record"),[("The "+$fmt($call($get($call(e.get("label"),[e.get("kind")],$dict([])),"lower"),[],$dict([])),-1,null)+" near "+$fmt($get(e.get("s"),"name"),-1,null)+" has fully recovered and can be worked again."),"economy"],$dict([]));
}else{}
}
return null;}));
e.set("_sites",$fn("_sites",e,["sim", "counts", "blocked"],[undefined,undefined,undefined],null,null,[],[],e=>{{const $t2682=$call(e.get("world"),[e.get("sim")],$dict([]));e.set("geo",$t2682);}
{const $t2683=$item(e.get("geo"),"land");e.set("comp",$t2683);}
{const $t2684=$item(e.get("geo"),"deposits");e.set("deposits",$t2684);}
{const $t2685=$dict([]);e.set("best",$t2685);}
for(const $t2686 of $iter($call(e.get("sorted"),[$call(e.get("_inhabited"),[e.get("sim")],$dict([]))],$dict([["key",$fn("<lambda>",e,["x"],[undefined],null,null,[],[],e=>{return $get(e.get("x"),"id");return null;})]])))){e.set("s",$t2686);{const $t2687=$call(e.get("int"),[$call(e.get("min"),[$call(e.get("reach"),[$call($get(e.get("counts"),"get"),[$get(e.get("s"),"id"),1],$dict([]))],$dict([])),9.0],$dict([]))],$dict([]));e.set("r",$t2687);}
{const $t2688=$item($item(e.get("comp"),$get(e.get("s"),"gy")),$get(e.get("s"),"gx"));e.set("home",$t2688);}
for(const $t2689 of $iter($call(e.get("range"),[$call(e.get("max"),[0,$bin("Sub",$get(e.get("s"),"gy"),e.get("r"))],$dict([])),$call(e.get("min"),[e.get("H"),$bin("Add",$bin("Add",$get(e.get("s"),"gy"),e.get("r")),1)],$dict([]))],$dict([])))){e.set("y",$t2689);for(const $t2690 of $iter($call(e.get("range"),[$call(e.get("max"),[0,$bin("Sub",$get(e.get("s"),"gx"),e.get("r"))],$dict([])),$call(e.get("min"),[e.get("W"),$bin("Add",$bin("Add",$get(e.get("s"),"gx"),e.get("r")),1)],$dict([]))],$dict([])))){e.set("x",$t2690);{const $t2691=$bin("Add",$bin("Mult",e.get("y"),e.get("W")),e.get("x"));e.set("key",$t2691);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("key"),()=>e.get("deposits")], ["NotIn"]),()=>$compare([()=>e.get("key"),()=>e.get("blocked")], ["In"]),()=>$compare([()=>$item($item(e.get("comp"),e.get("y")),e.get("x")),()=>e.get("home")], ["NotEq"])]))){continue;}else{}
{const $t2692=$call(e.get("dist"),[$get(e.get("s"),"gx"),$get(e.get("s"),"gy"),e.get("x"),e.get("y")],$dict([]));e.set("d",$t2692);}
if($truth($compare([()=>e.get("d"),()=>e.get("r")], ["Gt"]))){continue;}else{}
if($truth($boolop("Or",[()=>$compare([()=>e.get("key"),()=>e.get("best")], ["NotIn"]),()=>$compare([()=>e.get("d"),()=>$item($item(e.get("best"),e.get("key")),0)], ["Lt"])]))){{const $t2693=$tuple([e.get("d"),$get(e.get("s"),"id")]);$setitem(e.get("best"),e.get("key"),$t2693);}
}else{}
}
}
}
{const $t2694=$dict([]);e.set("sites",$t2694);}
for(const $t2695 of $iter($call(e.get("sorted"),[e.get("best")],$dict([])))){e.set("key",$t2695);{const $t2696=$item(e.get("best"),e.get("key"));{const $t2697=Array.from($iter($t2696));e.set("d",$t2697[0]);e.set("sid",$t2697[1]);}}
{const $t2698=0;e.set("slot",$t2698);}
for(const $t2699 of $iter($item(e.get("deposits"),e.get("key")))){{const $t2700=Array.from($iter($t2699));e.set("kind",$t2700[0]);e.set("cap",$t2700[1]);}$call($get($call($get(e.get("sites"),"setdefault"),[e.get("sid"),[]],$dict([])),"append"),[$tuple([e.get("d"),e.get("key"),e.get("slot"),e.get("kind"),e.get("cap")])],$dict([]));
e.set("slot",$aug("Add",e.get("slot"),1));}
}
for(const $t2701 of $iter(e.get("sites"))){e.set("sid",$t2701);{const $t2702=$call(e.get("sorted"),[$item(e.get("sites"),e.get("sid"))],$dict([["key",$fn("<lambda>",e,["row"],[undefined],null,null,[],[],e=>{return $tuple([$item(e.get("row"),0),$item(e.get("row"),1),$item(e.get("row"),2)]);return null;})]]));$setitem(e.get("sites"),e.get("sid"),$t2702);}
}
return e.get("sites");return null;}));
e.set("_needs",$fn("_needs",e,["sim", "s", "pop", "country", "built", "projects", "at_war"],[undefined,undefined,undefined,undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t2703=$get(e.get("country"),"technologies");e.set("techs",$t2703);}
{const $t2704=$dict([]);e.set("need",$t2704);}
{const $t2705=$bin("Mult",e.get("pop"),0.22);$setitem(e.get("need"),"grain",$t2705);}
{const $t2706=$bin("Mult",e.get("pop"),0.05);$setitem(e.get("need"),"pasture",$t2706);}
{const $t2707=$bin("Mult",e.get("pop"),0.05);$setitem(e.get("need"),"fish",$t2707);}
{const $t2708=$bin("Mult",e.get("pop"),0.03);$setitem(e.get("need"),"game",$t2708);}
{const $t2709=$bin("Add",$bin("Add",$bin("Mult",e.get("pop"),0.05),$bin("Mult",2.0,e.get("built"))),$bin("Mult",4.0,e.get("projects")));$setitem(e.get("need"),"timber",$t2709);}
{const $t2710=$bin("Add",$bin("Add",$bin("Mult",e.get("pop"),0.02),$bin("Mult",2.0,e.get("built"))),$bin("Mult",5.0,e.get("projects")));$setitem(e.get("need"),"stone",$t2710);}
{const $t2711=$bin("Add",$bin("Add",$bin("Mult",e.get("pop"),0.015),$bin("Mult",1.0,e.get("built"))),$bin("Mult",2.0,e.get("projects")));$setitem(e.get("need"),"clay",$t2711);}
if($truth($compare([()=>"ironworking",()=>e.get("techs")], ["In"]))){{const $t2712=$bin("Mult",$bin("Mult",e.get("pop"),0.03),($truth(e.get("at_war"))?2.0:1.0));$setitem(e.get("need"),"iron",$t2712);}
{const $t2713=$bin("Mult",e.get("pop"),0.008);$setitem(e.get("need"),"copper",$t2713);}
{const $t2714=$bin("Mult",e.get("pop"),($truth($compare([()=>"steelmaking",()=>e.get("techs")], ["In"]))?0.02:0.008));$setitem(e.get("need"),"coal",$t2714);}
}else{if($truth($compare([()=>"bronze tools",()=>e.get("techs")], ["In"]))){{const $t2715=$bin("Mult",$bin("Mult",e.get("pop"),0.03),($truth(e.get("at_war"))?2.0:1.0));$setitem(e.get("need"),"copper",$t2715);}
}else{}
}
if($truth($compare([()=>"gunpowder",()=>e.get("techs")], ["In"]))){{const $t2716=$bin("Add",$call($get(e.get("need"),"get"),["coal",0.0],$dict([])),$bin("Mult",e.get("pop"),0.01));$setitem(e.get("need"),"coal",$t2716);}
{const $t2717=$bin("Mult",e.get("pop"),0.01);$setitem(e.get("need"),"salt",$t2717);}
}else{}
if($truth($compare([()=>"steam power",()=>e.get("techs")], ["In"]))){{const $t2718=$bin("Add",$call($get(e.get("need"),"get"),["coal",0.0],$dict([])),$bin("Mult",e.get("pop"),0.03));$setitem(e.get("need"),"coal",$t2718);}
{const $t2719=$bin("Add",$call($get(e.get("need"),"get"),["iron",0.0],$dict([])),$bin("Mult",e.get("pop"),0.01));$setitem(e.get("need"),"iron",$t2719);}
}else{}
if($truth($compare([()=>"railways",()=>e.get("techs")], ["In"]))){{const $t2720=$bin("Add",$call($get(e.get("need"),"get"),["iron",0.0],$dict([])),$bin("Mult",e.get("pop"),0.02));$setitem(e.get("need"),"iron",$t2720);}
}else{}
{const $t2721=$bin("Add",$call($get(e.get("need"),"get"),["salt",0.0],$dict([])),$bin("Mult",e.get("pop"),0.01));$setitem(e.get("need"),"salt",$t2721);}
{const $t2722=$bin("Mult",e.get("pop"),0.004);$setitem(e.get("need"),"furs",$t2722);}
{const $t2723=$bin("Mult",e.get("pop"),($truth($compare([()=>"banking",()=>e.get("techs")], ["In"]))?0.002:0.001));$setitem(e.get("need"),"gold",$t2723);}
return e.get("need");return null;}));
e.set("yearly",$fn("yearly",e,["sim"],[undefined],null,null,[],[],e=>{e.set("system_state",$get($import("systems"),"state"));$call(e.get("regrow"),[e.get("sim")],$dict([]));
{const $t2724=$call(e.get("settlement_counts"),[e.get("sim")],$dict([]));e.set("counts",$t2724);}
{const $t2725=$call(e.get("_econ"),[e.get("sim")],$dict([]));e.set("econ",$t2725);}
{const $t2726=$call(e.get("dict"),[e.get("econ")],$dict([]));e.set("previous",$t2726);}
{const $t2727=$call(e.get("contested_cells"),[e.get("sim")],$dict([]));e.set("contested",$t2727);}
{const $t2728=$call(e.get("_sites"),[e.get("sim"),e.get("counts"),e.get("contested")],$dict([]));e.set("sites",$t2728);}
{const $t2729=$dict([]);e.set("projects",$t2729);}
for(const $t2730 of $iter($call(e.get("getattr"),[e.get("sim"),"projects",[]],$dict([])))){e.set("p",$t2730);{const $t2731=$bin("Add",$call($get(e.get("projects"),"get"),[$item(e.get("p"),"settlement"),0],$dict([])),1);$setitem(e.get("projects"),$item(e.get("p"),"settlement"),$t2731);}
}
{const $t2732=$call(e.get("_state"),[e.get("sim")],$dict([]));e.set("state",$t2732);}
{const $t2733=$call(e.get("world"),[e.get("sim")],$dict([]));e.set("geo",$t2733);}
{const $t2734=$dict([]);e.set("places",$t2734);}
for(const $t2735 of $iter($call(e.get("sorted"),[$call(e.get("_inhabited"),[e.get("sim")],$dict([]))],$dict([["key",$fn("<lambda>",e,["x"],[undefined],null,null,[],[],e=>{return $get(e.get("x"),"id");return null;})]])))){e.set("s",$t2735);$call($get($call($get(e.get("places"),"setdefault"),[$get(e.get("s"),"country"),[]],$dict([])),"append"),[e.get("s")],$dict([]));
}
{const $t2736=$dict([]);e.set("fresh",$t2736);}
{const $t2737=[];e.set("exhausted_now",$t2737);}
for(const $t2738 of $iter($call(e.get("sorted"),[e.get("places")],$dict([])))){e.set("cid",$t2738);{const $t2739=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t2739);}
{const $t2740=$call(e.get("system_state"),[e.get("sim"),e.get("cid")],$dict([]));e.set("st",$t2740);}
{const $t2741=$item(e.get("st"),"at_war");e.set("at_war",$t2741);}
{const $t2742=$call(e.get("getattr"),[e.get("country"),"stock",null],$dict([]));e.set("stock",$t2742);}
if($truth($compare([()=>e.get("stock"),()=>null], ["Is"]))){{const $t2743=$dict([]);e.set("stock",$t2743);}
{const $t2744=e.get("stock");$set(e.get("country"),"stock",$t2744);}
}else{}
for(const $t2745 of $iter(e.get("KINDS"))){e.set("kind",$t2745);$call($get(e.get("stock"),"setdefault"),[e.get("kind"),0.0],$dict([]));
}
{const $t2746=$dict([]);e.set("need",$t2746);}
{const $t2747=$dict([]);e.set("local",$t2747);}
for(const $t2748 of $iter($item(e.get("places"),e.get("cid")))){e.set("s",$t2748);{const $t2749=$call(e.get("len"),[$boolop("Or",[()=>$call(e.get("getattr"),[e.get("s"),"buildings",$dict([])],$dict([])),()=>$dict([])])],$dict([]));e.set("built",$t2749);}
{const $t2750=$call(e.get("_needs"),[e.get("sim"),e.get("s"),$call($get(e.get("counts"),"get"),[$get(e.get("s"),"id"),1],$dict([])),e.get("country"),e.get("built"),$call($get(e.get("projects"),"get"),[$get(e.get("s"),"id"),0],$dict([])),e.get("at_war")],$dict([]));e.set("row",$t2750);}
{const $t2751=e.get("row");$setitem(e.get("local"),$get(e.get("s"),"id"),$t2751);}
for(const $t2752 of $iter(e.get("row"))){e.set("kind",$t2752);{const $t2753=$bin("Add",$call($get(e.get("need"),"get"),[e.get("kind"),0.0],$dict([])),$item(e.get("row"),e.get("kind")));$setitem(e.get("need"),e.get("kind"),$t2753);}
}
}
{const $t2754=$dict([]);e.set("pull",$t2754);}
for(const $t2755 of $iter($bin("Add",$item(e.get("st"),"neighbors"),$item(e.get("st"),"sea_neighbors")))){e.set("other",$t2755);{const $t2756=$call($get(e.get("previous"),"get"),[e.get("other")],$dict([]));e.set("theirs",$t2756);}
if($truth($boolop("And",[()=>$compare([()=>e.get("theirs"),()=>null], ["IsNot"]),()=>$compare([()=>$call(e.get("tuple"),[$call(e.get("sorted"),[[e.get("cid"),e.get("other")]],$dict([]))],$dict([])),()=>$get(e.get("sim"),"wars")], ["NotIn"])]))){for(const $t2757 of $iter($item(e.get("theirs"),"deficit"))){e.set("kind",$t2757);{const $t2758=$bin("Add",$call($get(e.get("pull"),"get"),[e.get("kind"),0.0],$dict([])),$bin("Mult",$item($item(e.get("theirs"),"deficit"),e.get("kind")),0.5));$setitem(e.get("pull"),e.get("kind"),$t2758);}
}
}else{}
}
{const $t2759=$call(e.get("getattr"),[e.get("country"),"economic_system","mixed"],$dict([]));e.set("system",$t2759);}
{const $t2760=$call($get(e.get("governments"),"trait"),[e.get("country"),"quota"],$dict([]));e.set("quota",$t2760);}
{const $t2761=$call($get(e.get("governments"),"trait"),[e.get("country"),"output"],$dict([]));e.set("output",$t2761);}
{const $t2762=$bin("Add",1.0,$bin("Mult",0.5,$call(e.get("min"),[1.5,$item($call(e.get("tech_effects"),[$get(e.get("country"),"technologies")],$dict([])),"prod")],$dict([]))));e.set("skill",$t2762);}
if($truth($un("Not",$call(e.get("getattr"),[e.get("country"),"capacity_manual",false],$dict([]))))){{const $t2763=0.0;e.set("regrowth",$t2763);}
for(const $t2764 of $iter($item(e.get("places"),e.get("cid")))){e.set("s",$t2764);for(const $t2765 of $iter($call($get(e.get("sites"),"get"),[$get(e.get("s"),"id"),[]],$dict([])))){{const $t2766=Array.from($iter($t2765));e.set("d",$t2766[0]);e.set("key",$t2766[1]);e.set("slot",$t2766[2]);e.set("kind",$t2766[3]);e.set("cap",$t2766[4]);}if($truth($compare([()=>e.get("kind"),()=>e.get("FOOD")], ["In"]))){e.set("regrowth",$aug("Add",e.get("regrowth"),$bin("Mult",e.get("cap"),$item($item(e.get("RESOURCE_INFO"),e.get("kind")),2))));}else{}
}
}
{const $t2767=$call(e.get("max"),[150,$call(e.get("int"),[$bin("Div",$bin("Mult",$bin("Mult",e.get("CAPACITY_SHARE"),e.get("regrowth")),e.get("skill")),e.get("FOOD_NEED"))],$dict([]))],$dict([]));e.set("target",$t2767);}
{const $t2768=$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2769 of $iter($item(e.get("places"),e.get("cid")))){e.set("s",$t2769);yield $call($get(e.get("counts"),"get"),[$get(e.get("s"),"id"),0],$dict([]));}})();})(e))],$dict([]));e.set("residents",$t2768);}
if($truth($compare([()=>$get(e.get("country"),"capacity"),()=>$bin("Mult",20,e.get("target"))], ["Gt"]))){{const $t2770=$call(e.get("max"),[e.get("target"),$call(e.get("int"),[$bin("Mult",e.get("residents"),1.5)],$dict([]))],$dict([]));$set(e.get("country"),"capacity",$t2770);}
}else{{const $t2771=$call(e.get("max"),[150,$call(e.get("int"),[$bin("Add",$get(e.get("country"),"capacity"),$bin("Mult",$bin("Sub",e.get("target"),$get(e.get("country"),"capacity")),0.15))],$dict([]))],$dict([]));$set(e.get("country"),"capacity",$t2771);}
}
}else{}
{const $t2772=$dict([]);e.set("want",$t2772);}
for(const $t2773 of $iter(e.get("need"))){e.set("kind",$t2773);{const $t2774=1.4;e.set("drive",$t2774);}
if($truth($boolop("And",[()=>$compare([()=>e.get("system"),()=>"capitalism"], ["Eq"]),()=>$compare([()=>e.get("kind"),()=>e.get("FOOD")], ["NotIn"])]))){{const $t2775=1.7;e.set("drive",$t2775);}
}else{}
if($truth($boolop("And",[()=>$compare([()=>e.get("system"),()=>"communism"], ["Eq"]),()=>$compare([()=>e.get("kind"),()=>e.get("FOOD")], ["In"])]))){{const $t2776=1.6;e.set("drive",$t2776);}
}else{}
{const $t2777=$bin("Add",$call(e.get("max"),[0.0,$bin("Sub",$bin("Mult",$bin("Mult",$item(e.get("need"),e.get("kind")),e.get("drive")),e.get("quota")),$bin("Mult",$item(e.get("stock"),e.get("kind")),0.8))],$dict([])),$call(e.get("min"),[$call($get(e.get("pull"),"get"),[e.get("kind"),0.0],$dict([])),$bin("Mult",$item(e.get("need"),e.get("kind")),1.5)],$dict([])));$setitem(e.get("want"),e.get("kind"),$t2777);}
}
{const $t2778=$dict([]);e.set("made",$t2778);}
{const $t2779=0;e.set("worked",$t2779);}
for(const $t2780 of $iter($item(e.get("places"),e.get("cid")))){e.set("s",$t2780);{const $t2781=$item(e.get("local"),$get(e.get("s"),"id"));e.set("row",$t2781);}
{const $t2782=$call(e.get("need_share"),[e.get("row"),e.get("need")],$dict([]));e.set("mine",$t2782);}
for(const $t2783 of $iter($call($get(e.get("sites"),"get"),[$get(e.get("s"),"id"),[]],$dict([])))){{const $t2784=Array.from($iter($t2783));e.set("d",$t2784[0]);e.set("key",$t2784[1]);e.set("slot",$t2784[2]);e.set("kind",$t2784[3]);e.set("cap",$t2784[4]);}{const $t2785=$bin("Mult",$call($get(e.get("want"),"get"),[e.get("kind"),0.0],$dict([])),$call($get(e.get("mine"),"get"),[e.get("kind"),0.0],$dict([])));e.set("goal",$t2785);}
if($truth($compare([()=>e.get("goal"),()=>0.01], ["LtE"]))){continue;}else{}
{const $t2786=$bin("Add",$bin("Mult",e.get("key"),4),e.get("slot"));e.set("idx",$t2786);}
{const $t2787=$call($get(e.get("state"),"get"),[e.get("idx")],$dict([]));e.set("entry",$t2787);}
if($truth($compare([()=>e.get("entry"),()=>null], ["Is"]))){{const $t2788=[$call(e.get("float"),[e.get("cap")],$dict([])),false,$get(e.get("s"),"id")];e.set("entry",$t2788);}
}else{if($truth($item(e.get("entry"),1))){continue;}else{}
}
{const $t2789=$call(e.get("min"),[$bin("Div",e.get("goal"),$bin("Mult",e.get("skill"),e.get("output"))),$item(e.get("entry"),0),$bin("Mult",e.get("cap"),e.get("YEARLY_SHARE"))],$dict([]));e.set("effort",$t2789);}
if($truth($compare([()=>e.get("effort"),()=>0], ["LtE"]))){continue;}else{}
$setitem(e.get("entry"),0,$aug("Sub",$item(e.get("entry"),0),e.get("effort")));{const $t2790=$get(e.get("s"),"id");$setitem(e.get("entry"),2,$t2790);}
{const $t2791=$bin("Mult",$bin("Mult",e.get("effort"),e.get("skill")),e.get("output"));e.set("gained",$t2791);}
{const $t2792=$call(e.get("max"),[0.0,$bin("Sub",$item(e.get("want"),e.get("kind")),e.get("gained"))],$dict([]));$setitem(e.get("want"),e.get("kind"),$t2792);}
{const $t2793=$bin("Add",$call($get(e.get("made"),"get"),[e.get("kind"),0.0],$dict([])),e.get("gained"));$setitem(e.get("made"),e.get("kind"),$t2793);}
$setitem(e.get("stock"),e.get("kind"),$aug("Add",$item(e.get("stock"),e.get("kind")),e.get("gained")));e.set("worked",$aug("Add",e.get("worked"),1));if($truth($compare([()=>$item(e.get("entry"),0),()=>0.5], ["LtE"]))){{const $t2794=0.0;$setitem(e.get("entry"),0,$t2794);}
{const $t2795=true;$setitem(e.get("entry"),1,$t2795);}
$call($get(e.get("exhausted_now"),"append"),[$tuple([e.get("cid"),$get(e.get("s"),"id"),e.get("kind"),e.get("cap")])],$dict([]));
}else{}
{const $t2796=e.get("entry");$setitem(e.get("state"),e.get("idx"),$t2796);}
}
}
{const $t2797=$dict([]);e.set("deficit",$t2797);}
{const $t2798=$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2799 of $iter(e.get("FOOD"))){e.set("k",$t2799);yield $item(e.get("need"),e.get("k"));}})();})(e))],$dict([]));e.set("food_need",$t2798);}
{const $t2800=$bin("Sub",e.get("food_need"),$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2801 of $iter(e.get("FOOD"))){e.set("k",$t2801);yield $item(e.get("stock"),e.get("k"));}})();})(e))],$dict([])));e.set("food_short",$t2800);}
if($truth($compare([()=>e.get("food_short"),()=>0.5], ["Gt"]))){for(const $t2802 of $iter(e.get("FOOD"))){e.set("kind",$t2802);{const $t2803=e.get("food_short");$setitem(e.get("deficit"),e.get("kind"),$t2803);}
}
}else{}
for(const $t2804 of $iter($bin("Add",$bin("Add",e.get("MATERIALS"),e.get("METALS")),e.get("LUXURIES")))){e.set("kind",$t2804);{const $t2805=$bin("Sub",$call($get(e.get("need"),"get"),[e.get("kind"),0.0],$dict([])),$item(e.get("stock"),e.get("kind")));e.set("short",$t2805);}
if($truth($compare([()=>e.get("short"),()=>0.5], ["Gt"]))){{const $t2806=e.get("short");$setitem(e.get("deficit"),e.get("kind"),$t2806);}
}else{}
}
{const $t2807=$dict([["need",e.get("need")],["made",e.get("made")],["deficit",e.get("deficit")],["food_ratio",1.0],["material_cover",1.0],["metal_cover",1.0],["luxury_cover",1.0],["worked",e.get("worked")],["imports",$dict([])],["exports",$dict([])],["trade_income",0.0],["trade_cost",0.0],["gdp",0.0],["tax",0.0],["prices",$dict([])],["cover",$dict([])]]);$setitem(e.get("fresh"),e.get("cid"),$t2807);}
}
$call($get(e.get("econ"),"clear"),[],$dict([]));
for(const $t2808 of $iter(e.get("fresh"))){e.set("cid",$t2808);{const $t2809=$item(e.get("fresh"),e.get("cid"));$setitem(e.get("econ"),e.get("cid"),$t2809);}
}
for(const $t2810 of $iter($call(e.get("sorted"),[e.get("econ")],$dict([])))){e.set("cid",$t2810);{const $t2811=$item(e.get("econ"),e.get("cid"));e.set("e",$t2811);}
{const $t2812=$get($item($get(e.get("sim"),"countries"),e.get("cid")),"stock");e.set("stock",$t2812);}
for(const $t2813 of $iter(e.get("KINDS"))){e.set("kind",$t2813);{const $t2814=$bin("Div",$call($get($item(e.get("e"),"need"),"get"),[e.get("kind"),0.0],$dict([])),$bin("Add",$bin("Add",$call($get($item(e.get("e"),"need"),"get"),[e.get("kind"),0.0],$dict([])),$bin("Mult",$item(e.get("stock"),e.get("kind")),0.7)),1.0));e.set("scarcity",$t2814);}
{const $t2815=$bin("Mult",$item($item(e.get("RESOURCE_INFO"),e.get("kind")),4),$bin("Add",0.55,$bin("Mult",1.45,e.get("scarcity"))));$setitem($item(e.get("e"),"prices"),e.get("kind"),$t2815);}
}
}
$call(e.get("trade"),[e.get("sim")],$dict([]));
$call(e.get("consume"),[e.get("sim")],$dict([]));
for(const $t2816 of $iter($call(e.get("sorted"),[e.get("econ")],$dict([])))){e.set("cid",$t2816);{const $t2817=$item(e.get("econ"),e.get("cid"));e.set("e",$t2817);}
{const $t2818=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t2818);}
{const $t2819=0.0;e.set("base",$t2819);}
for(const $t2820 of $iter($item(e.get("e"),"made"))){e.set("kind",$t2820);e.set("base",$aug("Add",e.get("base"),$bin("Mult",$item($item(e.get("e"),"made"),e.get("kind")),$item($item(e.get("RESOURCE_INFO"),e.get("kind")),4))));}
{const $t2821=$bin("Add",e.get("base"),$item(e.get("e"),"trade_income"));$setitem(e.get("e"),"gdp",$t2821);}
{const $t2822=$call(e.get("getattr"),[e.get("country"),"economic_system","mixed"],$dict([]));e.set("system",$t2822);}
{const $t2823=$bin("Mult",$bin("Mult",0.05,$call($get(e.get("governments"),"trait"),[e.get("country"),"tax"],$dict([]))),($truth($compare([()=>e.get("system"),()=>"communism"], ["Eq"]))?1.15:($truth($compare([()=>e.get("system"),()=>"capitalism"], ["Eq"]))?0.9:1.0)));e.set("rate",$t2823);}
{const $t2824=$bin("Mult",$item(e.get("e"),"gdp"),e.get("rate"));$setitem(e.get("e"),"tax",$t2824);}
{const $t2825=$bin("Sub",$bin("Add",$call(e.get("getattr"),[e.get("country"),"treasury",0.0],$dict([])),$item(e.get("e"),"tax")),$bin("Mult",$call(e.get("max"),[0.0,$call(e.get("getattr"),[e.get("country"),"treasury",0.0],$dict([]))],$dict([])),$call($get(e.get("governments"),"trait"),[e.get("country"),"corruption"],$dict([]))));e.set("treasury",$t2825);}
{const $t2826=e.get("treasury");$set(e.get("country"),"treasury",$t2826);}
}
for(const $t2827 of $iter($item(e.get("exhausted_now"),$slice(null,3,null)))){{const $t2828=Array.from($iter($t2827));e.set("cid",$t2828[0]);e.set("sid",$t2828[1]);e.set("kind",$t2828[2]);e.set("cap",$t2828[3]);}{const $t2829=$call($get($get(e.get("sim"),"settlements"),"get"),[e.get("sid")],$dict([]));e.set("s",$t2829);}
if($truth($boolop("And",[()=>$compare([()=>e.get("cap"),()=>100], ["GtE"]),()=>$compare([()=>e.get("s"),()=>null], ["IsNot"])]))){$call($get(e.get("sim"),"record"),[("The "+$fmt($call($get($call(e.get("label"),[e.get("kind")],$dict([])),"lower"),[],$dict([])),-1,null)+" deposit near "+$fmt($get(e.get("s"),"name"),-1,null)+" is exhausted; "+$fmt($get($item($get(e.get("sim"),"countries"),e.get("cid")),"name"),-1,null)+" cannot work it until it refills."),"economy"],$dict([]));
}else{}
}
{const $t2830=$call(e.get("_deposit_stats"),[e.get("sim")],$dict([]));$set(e.get("sim"),"deposit_stats",$t2830);}
return null;}));
e.set("consume",$fn("consume",e,["sim"],[undefined],null,null,[],[],e=>{{const $t2831=$call(e.get("_econ"),[e.get("sim")],$dict([]));e.set("econ",$t2831);}
for(const $t2832 of $iter($call(e.get("sorted"),[e.get("econ")],$dict([])))){e.set("cid",$t2832);{const $t2833=$item(e.get("econ"),e.get("cid"));e.set("e",$t2833);}
{const $t2834=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t2834);}
{const $t2835=$get(e.get("country"),"stock");e.set("stock",$t2835);}
{const $t2836=$item(e.get("e"),"need");e.set("need",$t2836);}
{const $t2837=0.0;e.set("eaten",$t2837);}
{const $t2838=$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2839 of $iter(e.get("FOOD"))){e.set("k",$t2839);yield $item(e.get("need"),e.get("k"));}})();})(e))],$dict([]));e.set("food_need",$t2838);}
for(const $t2840 of $iter(e.get("FOOD"))){e.set("kind",$t2840);{const $t2841=$call(e.get("min"),[$item(e.get("stock"),e.get("kind")),$call(e.get("max"),[0.0,$item(e.get("need"),e.get("kind"))],$dict([]))],$dict([]));e.set("take",$t2841);}
$setitem(e.get("stock"),e.get("kind"),$aug("Sub",$item(e.get("stock"),e.get("kind")),e.get("take")));e.set("eaten",$aug("Add",e.get("eaten"),e.get("take")));}
if($truth($compare([()=>e.get("eaten"),()=>e.get("food_need")], ["Lt"]))){for(const $t2842 of $iter(e.get("FOOD"))){e.set("kind",$t2842);{const $t2843=$call(e.get("min"),[$item(e.get("stock"),e.get("kind")),$bin("Sub",e.get("food_need"),e.get("eaten"))],$dict([]));e.set("take",$t2843);}
$setitem(e.get("stock"),e.get("kind"),$aug("Sub",$item(e.get("stock"),e.get("kind")),e.get("take")));e.set("eaten",$aug("Add",e.get("eaten"),e.get("take")));}
}else{}
{const $t2844=$dict([]);e.set("cover",$t2844);}
for(const $t2845 of $iter($bin("Add",$bin("Add",e.get("MATERIALS"),e.get("METALS")),e.get("LUXURIES")))){e.set("kind",$t2845);if($truth($compare([()=>$call($get(e.get("need"),"get"),[e.get("kind"),0.0],$dict([])),()=>0], ["LtE"]))){{const $t2846=1.0;$setitem(e.get("cover"),e.get("kind"),$t2846);}
continue;}else{}
{const $t2847=$call(e.get("min"),[$item(e.get("stock"),e.get("kind")),$item(e.get("need"),e.get("kind"))],$dict([]));e.set("used",$t2847);}
$setitem(e.get("stock"),e.get("kind"),$aug("Sub",$item(e.get("stock"),e.get("kind")),e.get("used")));{const $t2848=$bin("Div",e.get("used"),$item(e.get("need"),e.get("kind")));$setitem(e.get("cover"),e.get("kind"),$t2848);}
}
{const $t2849=$item($call(e.get("tech_effects"),[$get(e.get("country"),"technologies")],$dict([])),"spoil");e.set("spoil_tech",$t2849);}
{const $t2850=1.0;e.set("spoil_cut",$t2850);}
if($truth($boolop("And",[()=>$compare([()=>$call($get(e.get("need"),"get"),["salt",0.0],$dict([])),()=>0], ["Gt"]),()=>$compare([()=>$item(e.get("stock"),"salt"),()=>$bin("Mult",$item(e.get("need"),"salt"),0.5)], ["Gt"])]))){{const $t2851=0.5;e.set("spoil_cut",$t2851);}
}else{}
for(const $t2852 of $iter(e.get("KINDS"))){e.set("kind",$t2852);{const $t2853=$bin("Mult",$item(e.get("SPOIL"),e.get("kind")),($truth($compare([()=>e.get("kind"),()=>e.get("FOOD")], ["In"]))?$bin("Mult",e.get("spoil_cut"),e.get("spoil_tech")):1.0));e.set("rate",$t2853);}
{const $t2854=$call(e.get("max"),[0.0,$bin("Mult",$item(e.get("stock"),e.get("kind")),$bin("Sub",1,e.get("rate")))],$dict([]));$setitem(e.get("stock"),e.get("kind"),$t2854);}
}
{const $t2855=($truth($compare([()=>e.get("food_need"),()=>0], ["LtE"]))?1.0:$call(e.get("min"),[1.0,$bin("Div",e.get("eaten"),e.get("food_need"))],$dict([])));$setitem(e.get("e"),"food_ratio",$t2855);}
{const $t2856=$bin("Div",$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2857 of $iter(e.get("MATERIALS"))){e.set("k",$t2857);yield $item(e.get("cover"),e.get("k"));}})();})(e))],$dict([])),3);$setitem(e.get("e"),"material_cover",$t2856);}
{const $t2858=1.0;e.set("metal",$t2858);}
if($truth($compare([()=>"ironworking",()=>$get(e.get("country"),"technologies")], ["In"]))){{const $t2859=$bin("Div",$bin("Add",$bin("Add",$bin("Mult",$item(e.get("cover"),"iron"),2),$item(e.get("cover"),"copper")),$item(e.get("cover"),"coal")),4);e.set("metal",$t2859);}
}else{if($truth($compare([()=>"bronze tools",()=>$get(e.get("country"),"technologies")], ["In"]))){{const $t2860=$item(e.get("cover"),"copper");e.set("metal",$t2860);}
}else{}
}
{const $t2861=e.get("metal");$setitem(e.get("e"),"metal_cover",$t2861);}
{const $t2862=$bin("Div",$bin("Add",$bin("Add",$item(e.get("cover"),"gold"),$item(e.get("cover"),"furs")),$item(e.get("cover"),"salt")),3);$setitem(e.get("e"),"luxury_cover",$t2862);}
{const $t2863=e.get("cover");$setitem(e.get("e"),"cover",$t2863);}
}
return null;}));
e.set("need_share",$fn("need_share",e,["row", "total"],[undefined,undefined],null,null,[],[],e=>{{const $t2864=$dict([]);e.set("out",$t2864);}
for(const $t2865 of $iter(e.get("row"))){e.set("kind",$t2865);{const $t2866=($truth($compare([()=>$call($get(e.get("total"),"get"),[e.get("kind"),0.0],$dict([])),()=>0], ["Gt"]))?$bin("Div",$item(e.get("row"),e.get("kind")),$item(e.get("total"),e.get("kind"))):0.0);$setitem(e.get("out"),e.get("kind"),$t2866);}
}
return e.get("out");return null;}));
e.set("_deposit_stats",$fn("_deposit_stats",e,["sim"],[undefined],null,null,[],[],e=>{{const $t2867=$call(e.get("world"),[e.get("sim")],$dict([]));e.set("geo",$t2867);}
{const $t2868=0;e.set("total",$t2868);}
for(const $t2869 of $iter($item(e.get("geo"),"deposits"))){e.set("key",$t2869);e.set("total",$aug("Add",e.get("total"),$call(e.get("len"),[$item($item(e.get("geo"),"deposits"),e.get("key"))],$dict([]))));}
{const $t2870=$call(e.get("len"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2871 of $iter($call($get($call(e.get("_state"),[e.get("sim")],$dict([])),"values"),[],$dict([])))){e.set("e",$t2871);if($truth($item(e.get("e"),1))){yield 1;}}})();})(e))],$dict([]));e.set("locked",$t2870);}
return $dict([["total",e.get("total")],["exhausted",e.get("locked")],["worked",$call(e.get("len"),[$call(e.get("_state"),[e.get("sim")],$dict([]))],$dict([]))]]);return null;}));
e.set("trade",$fn("trade",e,["sim"],[undefined],null,null,[],[],e=>{e.set("system_state",$get($import("systems"),"state"));{const $t2872=$call(e.get("_econ"),[e.get("sim")],$dict([]));e.set("econ",$t2872);}
{const $t2873=$call(e.get("contacts"),[e.get("sim")],$dict([]));{const $t2874=Array.from($iter($t2873));e.set("land",$t2874[0]);e.set("sea",$t2874[1]);}}
{const $t2875=[];e.set("flows",$t2875);}
{const $t2876=$call(e.get("set"),[],$dict([]));e.set("done",$t2876);}
{const $t2877=0;e.set("notable",$t2877);}
for(const $t2878 of $iter($call(e.get("sorted"),[e.get("econ")],$dict([])))){e.set("a",$t2878);{const $t2879=$call(e.get("set"),[$call($get(e.get("land"),"get"),[e.get("a"),$call(e.get("set"),[],$dict([]))],$dict([]))],$dict([]));e.set("partners",$t2879);}
if($truth($compare([()=>"sailing",()=>$get($item($get(e.get("sim"),"countries"),e.get("a")),"technologies")], ["In"]))){$call($get(e.get("partners"),"update"),[$call($get(e.get("sea"),"get"),[e.get("a"),$call(e.get("set"),[],$dict([]))],$dict([]))],$dict([]));
}else{}
for(const $t2880 of $iter($call(e.get("sorted"),[e.get("partners")],$dict([])))){e.set("b",$t2880);{const $t2881=$tuple([$call(e.get("min"),[e.get("a"),e.get("b")],$dict([])),$call(e.get("max"),[e.get("a"),e.get("b")],$dict([]))]);e.set("pair",$t2881);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("b"),()=>e.get("econ")], ["NotIn"]),()=>$compare([()=>e.get("pair"),()=>e.get("done")], ["In"]),()=>$compare([()=>e.get("pair"),()=>$get(e.get("sim"),"wars")], ["In"])]))){continue;}else{}
$call($get(e.get("done"),"add"),[e.get("pair")],$dict([]));
{const $t2882=$tuple([$item($get(e.get("sim"),"countries"),e.get("a")),$item($get(e.get("sim"),"countries"),e.get("b"))]);{const $t2883=Array.from($iter($t2882));e.set("ca",$t2883[0]);e.set("cb",$t2883[1]);}}
if($truth($boolop("And",[()=>$compare([()=>"sailing",()=>$get(e.get("ca"),"technologies")], ["NotIn"]),()=>$compare([()=>e.get("b"),()=>$call($get(e.get("land"),"get"),[e.get("a"),$call(e.get("set"),[],$dict([]))],$dict([]))], ["NotIn"])]))){continue;}else{}
{const $t2884=$bin("Mult",$bin("Mult",$bin("Add",12.0,$bin("Mult",14.0,$bin("Add",$item($call(e.get("system_state"),[e.get("sim"),e.get("a")],$dict([])),"trade"),$item($call(e.get("system_state"),[e.get("sim"),e.get("b")],$dict([])),"trade")))),$call($get(e.get("governments"),"trait"),[e.get("ca"),"trade"],$dict([]))),$call($get(e.get("governments"),"trait"),[e.get("cb"),"trade"],$dict([])));e.set("left",$t2884);}
for(const $t2885 of $iter($tuple([$tuple([e.get("a"),e.get("b")]),$tuple([e.get("b"),e.get("a")])]))){{const $t2886=Array.from($iter($t2885));e.set("seller",$t2886[0]);e.set("buyer",$t2886[1]);}{const $t2887=$tuple([$item($get(e.get("sim"),"countries"),e.get("seller")),$item($get(e.get("sim"),"countries"),e.get("buyer"))]);{const $t2888=Array.from($iter($t2887));e.set("s_country",$t2888[0]);e.set("b_country",$t2888[1]);}}
{const $t2889=$tuple([$item(e.get("econ"),e.get("seller")),$item(e.get("econ"),e.get("buyer"))]);{const $t2890=Array.from($iter($t2889));e.set("s_econ",$t2890[0]);e.set("b_econ",$t2890[1]);}}
for(const $t2891 of $iter(e.get("KINDS"))){e.set("kind",$t2891);if($truth($compare([()=>e.get("left"),()=>0], ["LtE"]))){break;}else{}
{const $t2892=$bin("Sub",$item($get(e.get("s_country"),"stock"),e.get("kind")),$bin("Mult",$call($get($item(e.get("s_econ"),"need"),"get"),[e.get("kind"),0.0],$dict([])),1.3));e.set("spare",$t2892);}
{const $t2893=$call($get($item(e.get("b_econ"),"deficit"),"get"),[e.get("kind"),0.0],$dict([]));e.set("lack",$t2893);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("spare"),()=>0.5], ["LtE"]),()=>$compare([()=>e.get("lack"),()=>0.5], ["LtE"])]))){continue;}else{}
{const $t2894=$call(e.get("min"),[e.get("spare"),e.get("lack"),e.get("left")],$dict([]));e.set("qty",$t2894);}
{const $t2895=$bin("Div",$bin("Add",$item($item(e.get("s_econ"),"prices"),e.get("kind")),$item($item(e.get("b_econ"),"prices"),e.get("kind"))),2);e.set("price",$t2895);}
{const $t2896=$bin("Mult",$call(e.get("max"),[0.0,$call(e.get("getattr"),[e.get("b_country"),"treasury",0.0],$dict([]))],$dict([])),0.5);e.set("money",$t2896);}
if($truth($compare([()=>$bin("Mult",e.get("price"),e.get("qty")),()=>e.get("money")], ["Gt"]))){{const $t2897=$bin("Div",e.get("money"),e.get("price"));e.set("qty",$t2897);}
}else{}
if($truth($compare([()=>e.get("qty"),()=>0.5], ["LtE"]))){continue;}else{}
{const $t2898=$bin("Mult",e.get("qty"),e.get("price"));e.set("value",$t2898);}
$setitem($get(e.get("s_country"),"stock"),e.get("kind"),$aug("Sub",$item($get(e.get("s_country"),"stock"),e.get("kind")),e.get("qty")));$setitem($get(e.get("b_country"),"stock"),e.get("kind"),$aug("Add",$item($get(e.get("b_country"),"stock"),e.get("kind")),e.get("qty")));for(const $t2899 of $iter(($truth($compare([()=>e.get("kind"),()=>e.get("FOOD")], ["In"]))?e.get("FOOD"):[e.get("kind")]))){e.set("same",$t2899);{const $t2900=$call(e.get("max"),[0.0,$bin("Sub",e.get("lack"),e.get("qty"))],$dict([]));$setitem($item(e.get("b_econ"),"deficit"),e.get("same"),$t2900);}
}
{const $t2901=$bin("Add",$call(e.get("getattr"),[e.get("s_country"),"treasury",0.0],$dict([])),e.get("value"));$set(e.get("s_country"),"treasury",$t2901);}
{const $t2902=$bin("Sub",$call(e.get("getattr"),[e.get("b_country"),"treasury",0.0],$dict([])),e.get("value"));$set(e.get("b_country"),"treasury",$t2902);}
{const $t2903=$bin("Add",$call($get($item(e.get("s_econ"),"exports"),"get"),[e.get("kind"),0.0],$dict([])),e.get("qty"));$setitem($item(e.get("s_econ"),"exports"),e.get("kind"),$t2903);}
{const $t2904=$bin("Add",$call($get($item(e.get("b_econ"),"imports"),"get"),[e.get("kind"),0.0],$dict([])),e.get("qty"));$setitem($item(e.get("b_econ"),"imports"),e.get("kind"),$t2904);}
$setitem(e.get("s_econ"),"trade_income",$aug("Add",$item(e.get("s_econ"),"trade_income"),e.get("value")));$setitem(e.get("b_econ"),"trade_cost",$aug("Add",$item(e.get("b_econ"),"trade_cost"),e.get("value")));e.set("left",$aug("Sub",e.get("left"),e.get("qty")));$call($get(e.get("flows"),"append"),[$dict([["from",e.get("seller")],["to",e.get("buyer")],["kind",e.get("kind")],["qty",$call(e.get("round"),[e.get("qty"),1],$dict([]))],["value",$call(e.get("round"),[e.get("value"),1],$dict([]))]])],$dict([]));
if($truth($boolop("And",[()=>$compare([()=>e.get("value"),()=>120], ["GtE"]),()=>$compare([()=>e.get("notable"),()=>2], ["Lt"]),()=>$compare([()=>$item($item(e.get("RESOURCE_INFO"),e.get("kind")),4),()=>1.8], ["GtE"])]))){e.set("notable",$aug("Add",e.get("notable"),1));$call($get(e.get("sim"),"record"),[("Merchants carried "+$fmt(e.get("qty"),-1,(".0f"))+" tons of "+$fmt($call($get($call(e.get("label"),[e.get("kind")],$dict([])),"lower"),[],$dict([])),-1,null)+" from "+$fmt($get(e.get("s_country"),"name"),-1,null)+" to "+$fmt($get(e.get("b_country"),"name"),-1,null)+", earning "+$fmt(e.get("value"),-1,(".0f"))+" coins."),"economy"],$dict([]));
}else{}
}
}
}
}
{const $t2905=$item(e.get("flows"),$slice(null,40,null));$set(e.get("sim"),"trade_flows",$t2905);}
return null;}));
e.set("of",$fn("of",e,["sim", "cid"],[undefined,undefined],null,null,[],[],e=>{{const $t2906=$call(e.get("getattr"),[e.get("sim"),"econ",null],$dict([]));e.set("table",$t2906);}
return ($truth($compare([()=>e.get("table"),()=>null], ["IsNot"]))?$call($get(e.get("table"),"get"),[e.get("cid")],$dict([])):null);return null;}));
e.set("food_effect",$fn("food_effect",e,["sim", "cid"],[undefined,undefined],null,null,[],[],e=>{{const $t2907=$call(e.get("of"),[e.get("sim"),e.get("cid")],$dict([]));e.set("e",$t2907);}
if($truth($compare([()=>e.get("e"),()=>null], ["Is"]))){return 0.0;}else{}
return $bin("Add",$bin("Mult",$un("USub",40.0),$bin("Sub",1.0,$item(e.get("e"),"food_ratio"))),($truth($compare([()=>$item(e.get("e"),"food_ratio"),()=>1.0], ["GtE"]))?3.0:0.0));return null;}));
e.set("materials_pace",$fn("materials_pace",e,["country"],[undefined],null,null,[],[],e=>{{const $t2908=$call(e.get("getattr"),[e.get("country"),"stock",null],$dict([]));e.set("stock",$t2908);}
if($truth($compare([()=>e.get("stock"),()=>null], ["Is"]))){return 1.0;}else{}
{const $t2909=($truth($compare([()=>"timber",()=>e.get("stock")], ["In"]))?$bin("Add",$bin("Add",$item(e.get("stock"),"timber"),$item(e.get("stock"),"stone")),$item(e.get("stock"),"clay")):0.0);e.set("have",$t2909);}
return $bin("Add",0.35,$bin("Mult",0.65,$call(e.get("min"),[1.0,$bin("Div",e.get("have"),30.0)],$dict([]))));return null;}));
e.set("use_materials",$fn("use_materials",e,["country", "amount"],[undefined,undefined],null,null,[],[],e=>{{const $t2910=$call(e.get("getattr"),[e.get("country"),"stock",null],$dict([]));e.set("stock",$t2910);}
if($truth($compare([()=>e.get("stock"),()=>null], ["Is"]))){return null;}else{}
for(const $t2911 of $iter(e.get("MATERIALS"))){e.set("kind",$t2911);if($truth($compare([()=>e.get("kind"),()=>e.get("stock")], ["In"]))){{const $t2912=$call(e.get("max"),[0.0,$bin("Sub",$item(e.get("stock"),e.get("kind")),$bin("Div",e.get("amount"),3))],$dict([]));$setitem(e.get("stock"),e.get("kind"),$t2912);}
}else{}
}
return null;}));
e.set("damage",$fn("damage",e,["sim", "disaster", "cx", "cy", "radius"],[undefined,undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t2913=$call(e.get("world"),[e.get("sim")],$dict([]));e.set("geo",$t2913);}
{const $t2914=$item($dict([["flood",$dict([["grain",0.35],["clay",0.2],["pasture",0.3]])],["storm",$dict([["fish",0.35],["timber",0.15]])],["wildfire",$dict([["timber",0.5],["game",0.3],["pasture",0.35],["furs",0.3]])],["earthquake",$dict([["stone",0.3],["iron",0.3],["copper",0.3],["coal",0.3],["gold",0.2]])],["landslide",$dict([["stone",0.3],["iron",0.35],["copper",0.35],["coal",0.35],["gold",0.25]])],["blizzard",$dict([["game",0.3],["furs",0.25],["pasture",0.25]])]]),e.get("disaster"));e.set("hits",$t2914);}
{const $t2915=$call(e.get("_state"),[e.get("sim")],$dict([]));e.set("state",$t2915);}
{const $t2916=$call(e.get("int"),[$bin("Mult",e.get("radius"),0.7)],$dict([]));e.set("r",$t2916);}
{const $t2917=0;e.set("lost",$t2917);}
for(const $t2918 of $iter($call(e.get("range"),[$call(e.get("max"),[0,$bin("Sub",e.get("cy"),e.get("r"))],$dict([])),$call(e.get("min"),[e.get("H"),$bin("Add",$bin("Add",e.get("cy"),e.get("r")),1)],$dict([]))],$dict([])))){e.set("y",$t2918);for(const $t2919 of $iter($call(e.get("range"),[$call(e.get("max"),[0,$bin("Sub",e.get("cx"),e.get("r"))],$dict([])),$call(e.get("min"),[e.get("W"),$bin("Add",$bin("Add",e.get("cx"),e.get("r")),1)],$dict([]))],$dict([])))){e.set("x",$t2919);{const $t2920=$bin("Add",$bin("Mult",e.get("y"),e.get("W")),e.get("x"));e.set("key",$t2920);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("key"),()=>$item(e.get("geo"),"deposits")], ["NotIn"]),()=>$compare([()=>$call(e.get("dist"),[e.get("cx"),e.get("cy"),e.get("x"),e.get("y")],$dict([])),()=>e.get("r")], ["Gt"])]))){continue;}else{}
{const $t2921=0;e.set("slot",$t2921);}
for(const $t2922 of $iter($item($item(e.get("geo"),"deposits"),e.get("key")))){{const $t2923=Array.from($iter($t2922));e.set("kind",$t2923[0]);e.set("cap",$t2923[1]);}{const $t2924=$call($get(e.get("hits"),"get"),[e.get("kind"),0.0],$dict([]));e.set("share",$t2924);}
if($truth($compare([()=>e.get("share"),()=>0], ["Gt"]))){{const $t2925=$bin("Add",$bin("Mult",e.get("key"),4),e.get("slot"));e.set("idx",$t2925);}
{const $t2926=$call($get(e.get("state"),"get"),[e.get("idx")],$dict([]));e.set("entry",$t2926);}
if($truth($compare([()=>e.get("entry"),()=>null], ["Is"]))){{const $t2927=[$call(e.get("float"),[e.get("cap")],$dict([])),false,0];e.set("entry",$t2927);}
}else{}
if($truth($un("Not",$item(e.get("entry"),1)))){{const $t2928=$call(e.get("max"),[0.0,$bin("Sub",$item(e.get("entry"),0),$bin("Mult",e.get("cap"),e.get("share")))],$dict([]));$setitem(e.get("entry"),0,$t2928);}
if($truth($compare([()=>$item(e.get("entry"),0),()=>0.5], ["LtE"]))){{const $t2929=0.0;$setitem(e.get("entry"),0,$t2929);}
{const $t2930=true;$setitem(e.get("entry"),1,$t2930);}
}else{}
{const $t2931=e.get("entry");$setitem(e.get("state"),e.get("idx"),$t2931);}
e.set("lost",$aug("Add",e.get("lost"),1));}else{}
}else{}
e.set("slot",$aug("Add",e.get("slot"),1));}
}
}
return e.get("lost");return null;}));
{const $t2932=$dict([["tribal",0.5],["monarchy",1.0],["council",0.9],["republic",1.0],["democracy",1.2],["theocracy",1.0],["junta",0.9],["oligarchy",0.8],["empire",1.3],["merchant",0.85],["tyranny",1.0]]);e.set("ADMIN",$t2932);}
e.set("spend",$fn("spend",e,["sim"],[undefined],null,null,[],[],e=>{e.set("system_state",$get($import("systems"),"state"));e.set("building_counts",$get($import("development"),"building_counts"));e.set("BUILDINGS",$get($import("development"),"BUILDINGS"));e.set("damage_buildings",$get($import("development"),"damage_buildings"));e.set("era_index",$get($import("technology"),"era_index"));e.set("ERA_GROUP",$get($import("technology"),"ERA_GROUP"));for(const $t2933 of $iter($call(e.get("sorted"),[$get(e.get("sim"),"countries")],$dict([])))){e.set("cid",$t2933);{const $t2934=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t2934);}
if($truth($compare([()=>$get(e.get("country"),"ended"),()=>null], ["IsNot"]))){continue;}else{}
{const $t2935=$call(e.get("system_state"),[e.get("sim"),e.get("cid")],$dict([]));e.set("st",$t2935);}
{const $t2936=$item(e.get("st"),"residents");e.set("r",$t2936);}
{const $t2937=$call(e.get("tech_effects"),[$get(e.get("country"),"technologies")],$dict([]));e.set("fx",$t2937);}
{const $t2938=$item(e.get("ERA_GROUP"),$call(e.get("era_index"),[$get(e.get("country"),"technologies")],$dict([])));e.set("era",$t2938);}
{const $t2939=$call($get($call(e.get("_econ"),[e.get("sim")],$dict([])),"get"),[e.get("cid")],$dict([]));e.set("e",$t2939);}
{const $t2940=$call(e.get("building_counts"),[e.get("sim"),e.get("cid")],$dict([]));e.set("built",$t2940);}
{const $t2941=$bin("Mult",$call(e.get("sum"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2942 of $iter($call($get(e.get("built"),"items"),[],$dict([])))){{const $t2943=Array.from($iter($t2942));e.set("k",$t2943[0]);e.set("n",$t2943[1]);}yield $bin("Mult",$item($item(e.get("BUILDINGS"),e.get("k")),1),e.get("n"));}})();})(e))],$dict([])),0.02);e.set("upkeep",$t2941);}
{const $t2944=$bin("Mult",$bin("Mult",$bin("Mult",e.get("r"),0.6),$call($get(e.get("ADMIN"),"get"),[$get(e.get("country"),"government"),1.0],$dict([]))),$bin("Add",1,$bin("Mult",0.15,e.get("era"))));e.set("admin",$t2944);}
{const $t2945=$bin("Mult",$bin("Mult",$bin("Mult",e.get("r"),$bin("Add",0.06,$bin("Mult",0.06,$item(e.get("fx"),"weapon")))),($truth($item(e.get("st"),"at_war"))?2.5:1.0)),$call($get(e.get("governments"),"trait"),[e.get("country"),"military"],$dict([])));e.set("army",$t2945);}
{const $t2946=0.0;e.set("relief",$t2946);}
if($truth($boolop("And",[()=>$compare([()=>e.get("e"),()=>null], ["IsNot"]),()=>$compare([()=>$item(e.get("e"),"food_ratio"),()=>1.0], ["Lt"])]))){{const $t2947=$bin("Mult",$bin("Mult",e.get("r"),0.3),$bin("Sub",1.0,$item(e.get("e"),"food_ratio")));e.set("relief",$t2947);}
}else{}
{const $t2948=($truth($compare([()=>$call(e.get("getattr"),[e.get("country"),"debt_years",0],$dict([])),()=>0], ["Gt"]))?0.8:1.0);e.set("austerity",$t2948);}
{const $t2949=$bin("Mult",$bin("Add",$bin("Add",$bin("Add",e.get("admin"),e.get("army")),e.get("upkeep")),e.get("relief")),e.get("austerity"));e.set("total",$t2949);}
{const $t2950=$bin("Sub",$call(e.get("getattr"),[e.get("country"),"treasury",0.0],$dict([])),e.get("total"));$set(e.get("country"),"treasury",$t2950);}
if($truth($compare([()=>e.get("relief"),()=>0], ["Gt"]))){{const $t2951=$call(e.get("min"),[100,$bin("Add",$get(e.get("country"),"food"),$call(e.get("min"),[5.0,$bin("Div",e.get("relief"),$call(e.get("max"),[1.0,$bin("Mult",e.get("r"),0.1)],$dict([])))],$dict([])))],$dict([]));$set(e.get("country"),"food",$t2951);}
}else{}
if($truth($compare([()=>e.get("e"),()=>null], ["IsNot"]))){{const $t2952=$dict([["admin",$bin("Mult",e.get("admin"),e.get("austerity"))],["army",$bin("Mult",e.get("army"),e.get("austerity"))],["buildings",$bin("Mult",e.get("upkeep"),e.get("austerity"))],["relief",$bin("Mult",e.get("relief"),e.get("austerity"))],["total",e.get("total")]]);$setitem(e.get("e"),"budget",$t2952);}
}else{}
if($truth($compare([()=>$get(e.get("country"),"treasury"),()=>0], ["Lt"]))){{const $t2953=$bin("Add",$call(e.get("getattr"),[e.get("country"),"debt_years",0],$dict([])),1);$set(e.get("country"),"debt_years",$t2953);}
{const $t2954=$call(e.get("max"),[0,$bin("Sub",$get(e.get("country"),"stability"),1.2)],$dict([]));$set(e.get("country"),"stability",$t2954);}
{const $t2955=$call(e.get("max"),[0,$bin("Sub",$get(e.get("country"),"prosperity"),0.5)],$dict([]));$set(e.get("country"),"prosperity",$t2955);}
if($truth($boolop("And",[()=>$compare([()=>$get(e.get("country"),"debt_years"),()=>1], ["Eq"]),()=>$compare([()=>e.get("r"),()=>200], ["GtE"]),()=>$compare([()=>$call(e.get("getattr"),[e.get("country"),"debt_notice",$un("USub",99)],$dict([])),()=>$bin("Sub",$get(e.get("sim"),"year"),10)], ["Lt"])]))){{const $t2956=$get(e.get("sim"),"year");$set(e.get("country"),"debt_notice",$t2956);}
$call($get(e.get("sim"),"record"),[($fmt($get(e.get("country"),"name"),-1,null)+" ran out of money; soldiers and officials go unpaid."),"political"],$dict([]));
}else{}
if($truth($compare([()=>$get(e.get("country"),"debt_years"),()=>3], ["GtE"]))){for(const $t2957 of $iter($call(e.get("sorted"),[$call(e.get("_inhabited"),[e.get("sim")],$dict([]))],$dict([["key",$fn("<lambda>",e,["x"],[undefined],null,null,[],[],e=>{return $get(e.get("x"),"id");return null;})]])))){e.set("s",$t2957);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("s"),"country"),()=>e.get("cid")], ["Eq"]),()=>$compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>0.04], ["Lt"])]))){$call(e.get("damage_buildings"),[e.get("sim"),e.get("s"),0.25,"Neglect"],$dict([]));
}else{}
}
}else{}
}else{{const $t2958=0;$set(e.get("country"),"debt_years",$t2958);}
if($truth($compare([()=>$get(e.get("country"),"treasury"),()=>$bin("Mult",6,e.get("total"))], ["Gt"]))){{const $t2959=$bin("Mult",$bin("Sub",$get(e.get("country"),"treasury"),$bin("Mult",6,e.get("total"))),0.15);e.set("excess",$t2959);}
$set(e.get("country"),"treasury",$aug("Sub",$get(e.get("country"),"treasury"),e.get("excess")));{const $t2960=$call(e.get("min"),[100,$bin("Add",$get(e.get("country"),"prosperity"),$bin("Div",e.get("excess"),$call(e.get("max"),[1.0,$bin("Mult",e.get("r"),20)],$dict([]))))],$dict([]));$set(e.get("country"),"prosperity",$t2960);}
{const $t2961=$call(e.get("min"),[100,$bin("Add",$get(e.get("country"),"stability"),0.3)],$dict([]));$set(e.get("country"),"stability",$t2961);}
}else{}
}
}
return null;}));
e.set("tile_report",$fn("tile_report",e,["sim", "x", "y"],[undefined,undefined,undefined],null,null,[],[],e=>{e.set("ensure_placed",$get($import("geography"),"ensure_placed"));e.set("cell_features",$get($import("geography"),"cell_features"));e.set("claim_owner",$get($import("geography"),"claim_owner"));$call(e.get("ensure_placed"),[e.get("sim")],$dict([]));
{const $t2962=$call(e.get("world"),[e.get("sim")],$dict([]));e.set("geo",$t2962);}
if($truth($un("Not",$boolop("And",[()=>$compare([()=>0,()=>e.get("x"),()=>e.get("W")], ["LtE", "Lt"]),()=>$compare([()=>0,()=>e.get("y"),()=>e.get("H")], ["LtE", "Lt"])])))){return "That cell is outside the map.";}else{}
{const $t2963=$call(e.get("cell_features"),[e.get("sim"),e.get("x"),e.get("y")],$dict([]));e.set("info",$t2963);}
{const $t2964=$call(e.get("claim_owner"),[e.get("sim"),e.get("x"),e.get("y"),$call(e.get("settlement_counts"),[e.get("sim")],$dict([]))],$dict([]));e.set("owner",$t2964);}
{const $t2965=[$bin("Add",("Cell "+$fmt(e.get("x"),-1,null)+","+$fmt(e.get("y"),-1,null)+": "+$fmt($item(e.get("info"),"terrain"),-1,null)+$fmt(($truth($compare([()=>$item(e.get("info"),"river"),()=>"1"], ["Eq"]))?", river":""),-1,null)+", soil "+$fmt($call(e.get("float"),[$item(e.get("info"),"soil")],$dict([])),-1,(".2f"))),($truth(e.get("owner"))?(", "+$fmt($get($item($get(e.get("sim"),"countries"),e.get("owner")),"name"),-1,null)+" territory"):", unclaimed"))];e.set("lines",$t2965);}
{const $t2966=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2967 of $iter($item(e.get("info"),"features"))){e.set("c",$t2967);yield $item(e.get("FEATURE_NAMES"),e.get("c"));}})();})(e));e.set("tags",$t2966);}
if($truth(e.get("tags"))){$call($get(e.get("lines"),"append"),[$bin("Add","  features: ",$call($get(", ","join"),[e.get("tags")],$dict([])))],$dict([]));
}else{}
if($truth($compare([()=>$bin("Add",$bin("Mult",e.get("y"),e.get("W")),e.get("x")),()=>$call(e.get("contested_cells"),[e.get("sim")],$dict([]))], ["In"]))){$call($get(e.get("lines"),"append"),["  contested: fought over in an active war (cannot be worked)"],$dict([]));
}else{}
{const $t2968=$call(e.get("tile_deposits"),[e.get("sim"),e.get("x"),e.get("y")],$dict([]));e.set("rows",$t2968);}
if($truth($un("Not",e.get("rows")))){$call($get(e.get("lines"),"append"),["  no deposits"],$dict([]));
}else{}
for(const $t2969 of $iter(e.get("rows"))){e.set("row",$t2969);{const $t2970=($truth($item(e.get("row"),"locked"))?"EXHAUSTED, refilling; locked until full":($truth($compare([()=>$item(e.get("row"),"amount"),()=>$item(e.get("row"),"cap")], ["GtE"]))?"full":"partly worked"));e.set("status",$t2970);}
{const $t2971=($truth($compare([()=>$item(e.get("row"),"amount"),()=>$item(e.get("row"),"cap")], ["Lt"]))?$call(e.get("int"),[$bin("Add",$bin("Div",$bin("Sub",$item(e.get("row"),"cap"),$item(e.get("row"),"amount")),$bin("Mult",$item(e.get("row"),"cap"),$item(e.get("row"),"rate"))),0.99)],$dict([])):0);e.set("years",$t2971);}
$call($get(e.get("lines"),"append"),[$bin("Add",("  "+$fmt($call(e.get("label"),[$item(e.get("row"),"kind")],$dict([])),-1,null)+": "+$fmt($item(e.get("row"),"amount"),-1,(".0f"))+"/"+$fmt($item(e.get("row"),"cap"),-1,null)+" ("+$fmt(e.get("status"),-1,null)+"); refills "+$fmt($bin("Mult",$item(e.get("row"),"rate"),100),-1,(".1f"))+"% of capacity per year"),($truth(e.get("years"))?("; about "+$fmt(e.get("years"),-1,null)+" years to full"):""))],$dict([]));
}
return $call($get("\n","join"),[e.get("lines")],$dict([]));return null;}));
e.set("report",$fn("report",e,["sim", "query"],[undefined,""],null,null,[],[],e=>{{const $t2972=$call(e.get("_econ"),[e.get("sim")],$dict([]));e.set("econ",$t2972);}
{const $t2973=$boolop("Or",[()=>$call(e.get("getattr"),[e.get("sim"),"deposit_stats",null],$dict([])),()=>$call(e.get("_deposit_stats"),[e.get("sim")],$dict([]))]);e.set("stats",$t2973);}
{const $t2974=[("Economy, year "+$fmt($get(e.get("sim"),"year"),-1,null)+": "+$fmt($item(e.get("stats"),"worked"),-1,null)+" deposits worked, "+$fmt($item(e.get("stats"),"exhausted"),-1,null)+" exhausted of "+$fmt($item(e.get("stats"),"total"),-1,null)+" in the world.")];e.set("lines",$t2974);}
for(const $t2975 of $iter($call(e.get("sorted"),[e.get("econ")],$dict([])))){e.set("cid",$t2975);{const $t2976=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t2976);}
if($truth($boolop("Or",[()=>$compare([()=>$get(e.get("country"),"ended"),()=>null], ["IsNot"]),()=>$boolop("And",[()=>e.get("query"),()=>$compare([()=>e.get("query"),()=>$call($get($get(e.get("country"),"name"),"casefold"),[],$dict([]))], ["NotIn"])])]))){continue;}else{}
{const $t2977=$item(e.get("econ"),e.get("cid"));e.set("e",$t2977);}
$call($get(e.get("lines"),"append"),[($fmt($get(e.get("country"),"name"),-1,null)+" ("+$fmt($item($call($get(e.get("governments"),"info"),[$get(e.get("country"),"government")],$dict([])),"label"),-1,null)+", "+$fmt($call(e.get("getattr"),[e.get("country"),"economic_system","mixed"],$dict([])),-1,null)+"): GDP "+$fmt($item(e.get("e"),"gdp"),-1,(".0f"))+", tax "+$fmt($item(e.get("e"),"tax"),-1,(".0f"))+", treasury "+$fmt($call(e.get("getattr"),[e.get("country"),"treasury",0.0],$dict([])),-1,(".0f"))+"; fed "+$fmt($bin("Mult",$item(e.get("e"),"food_ratio"),100),-1,(".0f"))+"%, materials "+$fmt($bin("Mult",$item(e.get("e"),"material_cover"),100),-1,(".0f"))+"%, metal "+$fmt($bin("Mult",$item(e.get("e"),"metal_cover"),100),-1,(".0f"))+"%")],$dict([]));
if($truth($call($get(e.get("e"),"get"),["budget"],$dict([])))){{const $t2978=$item(e.get("e"),"budget");e.set("b",$t2978);}
$call($get(e.get("lines"),"append"),[("  budget: administration "+$fmt($item(e.get("b"),"admin"),-1,(".0f"))+", army "+$fmt($item(e.get("b"),"army"),-1,(".0f"))+", buildings "+$fmt($item(e.get("b"),"buildings"),-1,(".0f"))+", relief "+$fmt($item(e.get("b"),"relief"),-1,(".0f"))+" = "+$fmt($item(e.get("b"),"total"),-1,(".0f"))+" a year")],$dict([]));
}else{}
{const $t2979=$get(e.get("country"),"stock");e.set("stock",$t2979);}
$call($get(e.get("lines"),"append"),[$bin("Add","  stock: ",$call($get(", ","join"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2980 of $iter(e.get("KINDS"))){e.set("k",$t2980);if($truth($compare([()=>$item(e.get("stock"),e.get("k")),()=>1], ["GtE"]))){yield ($fmt($call($get($call(e.get("label"),[e.get("k")],$dict([])),"lower"),[],$dict([])),-1,null)+" "+$fmt($item(e.get("stock"),e.get("k")),-1,(".0f")));}}})();})(e))],$dict([])))],$dict([]));
if($truth($item(e.get("e"),"imports"))){$call($get(e.get("lines"),"append"),[$bin("Add",$bin("Add","  imports: ",$call($get(", ","join"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2981 of $iter($call($get($item(e.get("e"),"imports"),"items"),[],$dict([])))){{const $t2982=Array.from($iter($t2981));e.set("k",$t2982[0]);e.set("v",$t2982[1]);}yield ($fmt($call($get($call(e.get("label"),[e.get("k")],$dict([])),"lower"),[],$dict([])),-1,null)+" "+$fmt(e.get("v"),-1,(".0f")));}})();})(e))],$dict([]))),(" (spent "+$fmt($item(e.get("e"),"trade_cost"),-1,(".0f"))+")"))],$dict([]));
}else{}
if($truth($item(e.get("e"),"exports"))){$call($get(e.get("lines"),"append"),[$bin("Add",$bin("Add","  exports: ",$call($get(", ","join"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2983 of $iter($call($get($item(e.get("e"),"exports"),"items"),[],$dict([])))){{const $t2984=Array.from($iter($t2983));e.set("k",$t2984[0]);e.set("v",$t2984[1]);}yield ($fmt($call($get($call(e.get("label"),[e.get("k")],$dict([])),"lower"),[],$dict([])),-1,null)+" "+$fmt(e.get("v"),-1,(".0f")));}})();})(e))],$dict([]))),(" (earned "+$fmt($item(e.get("e"),"trade_income"),-1,(".0f"))+")"))],$dict([]));
}else{}
{const $t2985=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2986 of $iter($item(e.get("e"),"deficit"))){e.set("k",$t2986);yield $call($get($call(e.get("label"),[e.get("k")],$dict([])),"lower"),[],$dict([]));}})();})(e));e.set("short",$t2985);}
if($truth(e.get("short"))){$call($get(e.get("lines"),"append"),[$bin("Add","  short of: ",$call($get(", ","join"),[e.get("short")],$dict([])))],$dict([]));
}else{}
}
return $call($get("\n","join"),[e.get("lines")],$dict([]));return null;}));
});
$register("governments",e=>{{const $t2987=$dict([["research",0.0],["culture",1.0],["trade",1.0],["stability",0.0],["war",1.0],["military",1.0],["expansion",1.0],["output",1.0],["quota",1.0],["tax",1.0],["corruption",0.0]]);e.set("DEFAULT_TRAITS",$t2987);}
{const $t2988=$dict([["tribal",$dict([["label","Tribal confederacy"],["title","chief"],["succession","fame"],["term",0],["verb","was chosen as war chief"],["blurb","Clans under a chief. Little administration, hardy and eager for land."],["traits",$dict([["research",$un("USub",0.06)],["expansion",1.15],["stability",0.12],["tax",0.6],["output",0.95],["war",1.1],["military",1.05]])]])],["monarchy",$dict([["label","Monarchy"],["title","monarch"],["succession","hereditary"],["term",0],["verb","was crowned"],["heir","inherited the throne"],["blurb","Hereditary rule. Stable dynasties, ambitious courts."],["traits",$dict([["expansion",1.1],["culture",1.05],["war",1.05],["stability",0.05],["corruption",0.008]])]])],["council",$dict([["label","Council"],["title","council leader"],["succession","election"],["term",8],["verb","was elected to lead the council"],["blurb","A council of notables chooses a leader every few years."],["traits",$dict([["research",0.06],["war",0.95]])]])],["republic",$dict([["label","Republic"],["title","president"],["succession","election"],["term",6],["verb","was elected president"],["blurb","Elected office under law. Trade and learning flourish; wars are harder to start."],["traits",$dict([["research",0.06],["trade",1.1],["war",0.85],["expansion",0.9],["culture",1.1],["corruption",0.004]])]])],["democracy",$dict([["label","Democracy"],["title","prime minister"],["succession","election"],["term",4],["verb","won the national vote"],["blurb","Broad participation. Strong science and culture, reluctant to fight, protective of resources."],["traits",$dict([["research",0.1],["trade",1.12],["war",0.6],["expansion",0.8],["culture",1.2],["tax",0.9],["stability",$un("USub",0.05)],["quota",0.85]])]])],["theocracy",$dict([["label","Theocracy"],["title","high priest"],["succession","divine"],["term",0],["verb","was proclaimed high priest"],["blurb","Priests rule. Very stable and devout, slow to learn, quick to fight over faith."],["traits",$dict([["research",$un("USub",0.1)],["culture",1.2],["stability",0.2],["war",1.15],["military",1.03],["tax",1.1],["output",0.97]])]])],["junta",$dict([["label","Military junta"],["title","general"],["succession","seizure"],["term",0],["verb","seized power in a coup"],["blurb","Officers rule. Strong armies and eager to expand; poor for learning and the arts; drains resources."],["traits",$dict([["military",1.15],["war",1.5],["research",$un("USub",0.08)],["culture",0.75],["expansion",1.25],["stability",0.1],["output",1.1],["quota",1.2],["corruption",0.01],["tax",1.15]])]])],["oligarchy",$dict([["label","Oligarchy"],["title","chief magistrate"],["succession","wealth"],["term",10],["verb","was installed by the wealthy families"],["blurb","The richest families rule. Good for trade, light on taxes, prone to corruption."],["traits",$dict([["trade",1.15],["tax",0.8],["corruption",0.012],["war",0.95],["culture",0.95]])]])],["empire",$dict([["label","Empire"],["title","emperor"],["succession","hereditary"],["term",0],["verb","was crowned emperor"],["heir","inherited the imperial crown"],["blurb","A vast realm under an emperor. Heavy taxes and armies, restless provinces."],["traits",$dict([["military",1.08],["war",1.3],["expansion",1.2],["tax",1.25],["stability",$un("USub",0.08)],["culture",1.1],["output",1.05],["corruption",0.01]])]])],["merchant",$dict([["label","Merchant republic"],["title","doge"],["succession","election"],["term",6],["verb","was elected doge by the guilds"],["blurb","Guilds and ports rule. The best traders, peaceful, with modest armies."],["traits",$dict([["trade",1.3],["war",0.7],["military",0.92],["research",0.05],["tax",0.85],["culture",1.05],["expansion",0.95]])]])],["tyranny",$dict([["label","Tyranny"],["title","dictator"],["succession","seizure"],["term",0],["verb","seized absolute power"],["blurb","One strongman rules by fear. Fierce taxes and output, little freedom for science or art."],["traits",$dict([["stability",0.15],["war",1.3],["tax",1.3],["corruption",0.02],["research",$un("USub",0.1)],["culture",0.7],["military",1.1],["output",1.15],["quota",1.3]])]])]]);e.set("GOVERNMENTS",$t2988);}
{const $t2989=$tuple(["monarchy","empire"]);e.set("HEREDITARY",$t2989);}
{const $t2990=$tuple(["tribal","monarchy","empire","junta","tyranny"]);e.set("AUTHORITY",$t2990);}
{const $t2991=$tuple(["tribal","monarchy","council","theocracy","oligarchy"]);e.set("INITIAL",$t2991);}
e.set("info",$fn("info",e,["government"],[undefined],null,null,[],[],e=>{return $call($get(e.get("GOVERNMENTS"),"get"),[e.get("government"),$item(e.get("GOVERNMENTS"),"monarchy")],$dict([]));return null;}));
e.set("trait",$fn("trait",e,["country", "name"],[undefined,undefined],null,null,[],[],e=>{return $call($get($item($call(e.get("info"),[$get(e.get("country"),"government")],$dict([])),"traits"),"get"),[e.get("name"),$item(e.get("DEFAULT_TRAITS"),e.get("name"))],$dict([]));return null;}));
e.set("title_of",$fn("title_of",e,["government"],[undefined],null,null,[],[],e=>{return $item($call(e.get("info"),[e.get("government")],$dict([])),"title");return null;}));
e.set("all_titles",$fn("all_titles",e,[],[],null,null,[],[],e=>{return new PS(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2992 of $iter($call($get(e.get("GOVERNMENTS"),"values"),[],$dict([])))){e.set("g",$t2992);yield $item(e.get("g"),"title");}})();})(e));return null;}));
e.set("inequality",$fn("inequality",e,["sim", "cid"],[undefined,undefined],null,null,[],[],e=>{{const $t2993=$call(e.get("sorted"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t2994 of $iter($call($get($get(e.get("sim"),"people"),"values"),[],$dict([])))){e.set("p",$t2994);if($truth($boolop("And",[()=>$compare([()=>$get(e.get("p"),"country"),()=>e.get("cid")], ["Eq"]),()=>$compare([()=>$get(e.get("p"),"age"),()=>18], ["GtE"])]))){yield $call(e.get("getattr"),[e.get("p"),"wealth",0.0],$dict([]));}}})();})(e))],$dict([]));e.set("wealth",$t2993);}
{const $t2995=$call(e.get("len"),[e.get("wealth")],$dict([]));e.set("n",$t2995);}
if($truth($boolop("Or",[()=>$compare([()=>e.get("n"),()=>10], ["Lt"]),()=>$compare([()=>$call(e.get("sum"),[e.get("wealth")],$dict([])),()=>0], ["LtE"])]))){return 0.0;}else{}
{const $t2996=$call(e.get("max"),[1,$bin("FloorDiv",e.get("n"),120)],$dict([]));e.set("step",$t2996);}
{const $t2997=$item(e.get("wealth"),$slice(null,null,e.get("step")));e.set("sample",$t2997);}
{const $t2998=$call(e.get("sum"),[e.get("sample")],$dict([]));e.set("total",$t2998);}
{const $t2999=0.0;e.set("running",$t2999);}
for(const $t3000 of $iter($call(e.get("range"),[$call(e.get("len"),[e.get("sample")],$dict([]))],$dict([])))){e.set("i",$t3000);e.set("running",$aug("Add",e.get("running"),$bin("Mult",$bin("Add",e.get("i"),1),$item(e.get("sample"),e.get("i")))));}
return $call(e.get("max"),[0.0,$call(e.get("min"),[1.0,$bin("Sub",$bin("Div",$bin("Mult",2,e.get("running")),$bin("Mult",$call(e.get("len"),[e.get("sample")],$dict([])),e.get("total"))),$bin("Div",$bin("Add",$call(e.get("len"),[e.get("sample")],$dict([])),1),$call(e.get("len"),[e.get("sample")],$dict([]))))],$dict([]))],$dict([]));return null;}));
e.set("_options",$fn("_options",e,["sim", "country", "st", "places"],[undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t3001=$get(e.get("country"),"government");e.set("gov",$t3001);}
{const $t3002=$get(e.get("country"),"technologies");e.set("techs",$t3002);}
{const $t3003=$get(e.get("country"),"stability");e.set("stab",$t3003);}
{const $t3004=$call(e.get("getattr"),[e.get("country"),"culture",0.0],$dict([]));e.set("culture",$t3004);}
{const $t3005=$item(e.get("st"),"residents");e.set("pop",$t3005);}
{const $t3006=$item(e.get("st"),"at_war");e.set("war",$t3006);}
{const $t3007=[];e.set("options",$t3007);}
e.set("add",$fn("add",e,["target", "weight"],[undefined,undefined],null,null,[],[],e=>{if($truth($compare([()=>e.get("weight"),()=>0], ["Gt"]))){$call($get(e.get("options"),"append"),[$tuple([e.get("target"),e.get("weight")])],$dict([]));
}else{}
return null;}));
if($truth($compare([()=>e.get("gov"),()=>"tribal"], ["Eq"]))){$call(e.get("add"),["monarchy",($truth($compare([()=>e.get("pop"),()=>500], ["GtE"]))?3:1)],$dict([]));
$call(e.get("add"),["council",($truth($compare([()=>"writing",()=>e.get("techs")], ["In"]))?2:0)],$dict([]));
$call(e.get("add"),["theocracy",1.5],$dict([]));
$call(e.get("add"),["oligarchy",($truth($compare([()=>"pottery",()=>e.get("techs")], ["In"]))?1:0)],$dict([]));
}else{if($truth($compare([()=>e.get("gov"),()=>"monarchy"], ["Eq"]))){$call(e.get("add"),["empire",($truth($boolop("And",[()=>$compare([()=>e.get("places"),()=>5], ["GtE"]),()=>$compare([()=>e.get("pop"),()=>2500], ["GtE"]),()=>$compare([()=>"bronze tools",()=>e.get("techs")], ["In"])]))?3:0)],$dict([]));
$call(e.get("add"),["council",($truth($boolop("And",[()=>$compare([()=>"writing",()=>e.get("techs")], ["In"]),()=>$compare([()=>e.get("stab"),()=>55], ["Gt"])]))?1.2:0)],$dict([]));
$call(e.get("add"),["republic",($truth($boolop("And",[()=>$compare([()=>e.get("stab"),()=>40], ["Lt"]),()=>$compare([()=>"writing",()=>e.get("techs")], ["In"])]))?2.2:0)],$dict([]));
$call(e.get("add"),["theocracy",($truth($compare([()=>e.get("stab"),()=>50], ["Lt"]))?1.5:0)],$dict([]));
$call(e.get("add"),["oligarchy",($truth($compare([()=>e.get("stab"),()=>45], ["Lt"]))?1.2:0)],$dict([]));
$call(e.get("add"),["junta",($truth($boolop("And",[()=>e.get("war"),()=>$compare([()=>e.get("stab"),()=>40], ["Lt"])]))?2:0)],$dict([]));
}else{if($truth($compare([()=>e.get("gov"),()=>"council"], ["Eq"]))){$call(e.get("add"),["republic",($truth($boolop("And",[()=>$compare([()=>"writing",()=>e.get("techs")], ["In"]),()=>$compare([()=>e.get("stab"),()=>55], ["Gt"])]))?2.5:0)],$dict([]));
$call(e.get("add"),["merchant",($truth($compare([()=>$item(e.get("st"),"trade"),()=>2.5], ["GtE"]))?2:0)],$dict([]));
$call(e.get("add"),["oligarchy",($truth($compare([()=>$call(e.get("inequality"),[e.get("sim"),$get(e.get("country"),"id")],$dict([])),()=>0.5], ["Gt"]))?2:0)],$dict([]));
$call(e.get("add"),["tyranny",($truth($boolop("And",[()=>$compare([()=>e.get("stab"),()=>30], ["Lt"]),()=>e.get("war")]))?1.5:0)],$dict([]));
$call(e.get("add"),["monarchy",($truth($compare([()=>e.get("stab"),()=>35], ["Lt"]))?1:0)],$dict([]));
}else{if($truth($compare([()=>e.get("gov"),()=>"republic"], ["Eq"]))){$call(e.get("add"),["democracy",($truth($boolop("And",[()=>$boolop("Or",[()=>$compare([()=>"printing",()=>e.get("techs")], ["In"]),()=>$compare([()=>"universities",()=>e.get("techs")], ["In"])]),()=>$compare([()=>e.get("culture"),()=>30], ["GtE"]),()=>$compare([()=>e.get("stab"),()=>60], ["Gt"])]))?3:0)],$dict([]));
$call(e.get("add"),["oligarchy",($truth($compare([()=>$call(e.get("inequality"),[e.get("sim"),$get(e.get("country"),"id")],$dict([])),()=>0.55], ["Gt"]))?2:0)],$dict([]));
$call(e.get("add"),["junta",($truth($compare([()=>e.get("stab"),()=>30], ["Lt"]))?2.5:0)],$dict([]));
$call(e.get("add"),["merchant",($truth($compare([()=>$item(e.get("st"),"trade"),()=>3], ["GtE"]))?1.5:0)],$dict([]));
$call(e.get("add"),["empire",($truth($boolop("And",[()=>$compare([()=>e.get("places"),()=>6], ["GtE"]),()=>e.get("war")]))?1:0)],$dict([]));
}else{if($truth($compare([()=>e.get("gov"),()=>"democracy"], ["Eq"]))){$call(e.get("add"),["republic",($truth($compare([()=>e.get("stab"),()=>35], ["Lt"]))?2:0)],$dict([]));
$call(e.get("add"),["oligarchy",($truth($compare([()=>$call(e.get("inequality"),[e.get("sim"),$get(e.get("country"),"id")],$dict([])),()=>0.6], ["Gt"]))?1.5:0)],$dict([]));
$call(e.get("add"),["junta",($truth($boolop("And",[()=>$compare([()=>e.get("stab"),()=>25], ["Lt"]),()=>e.get("war")]))?2:0)],$dict([]));
$call(e.get("add"),["tyranny",($truth($compare([()=>e.get("stab"),()=>20], ["Lt"]))?1.5:0)],$dict([]));
}else{if($truth($compare([()=>e.get("gov"),()=>"theocracy"], ["Eq"]))){$call(e.get("add"),["monarchy",($truth($compare([()=>e.get("stab"),()=>40], ["Lt"]))?2:0)],$dict([]));
$call(e.get("add"),["republic",($truth($boolop("And",[()=>$compare([()=>e.get("culture"),()=>40], ["GtE"]),()=>$compare([()=>"universities",()=>e.get("techs")], ["In"])]))?2:0)],$dict([]));
$call(e.get("add"),["junta",($truth(e.get("war"))?1:0)],$dict([]));
}else{if($truth($compare([()=>e.get("gov"),()=>"junta"], ["Eq"]))){$call(e.get("add"),["tyranny",($truth($compare([()=>e.get("stab"),()=>60], ["Gt"]))?2:0)],$dict([]));
$call(e.get("add"),["republic",($truth($boolop("And",[()=>$compare([()=>e.get("stab"),()=>65], ["Gt"]),()=>$compare([()=>$get(e.get("country"),"prosperity"),()=>55], ["Gt"])]))?1.5:0)],$dict([]));
$call(e.get("add"),["monarchy",1],$dict([]));
}else{if($truth($compare([()=>e.get("gov"),()=>"oligarchy"], ["Eq"]))){$call(e.get("add"),["merchant",($truth($compare([()=>$item(e.get("st"),"trade"),()=>2], ["GtE"]))?1.5:0)],$dict([]));
$call(e.get("add"),["republic",($truth($compare([()=>e.get("stab"),()=>35], ["Lt"]))?2:0)],$dict([]));
$call(e.get("add"),["monarchy",1],$dict([]));
$call(e.get("add"),["tyranny",1],$dict([]));
}else{if($truth($compare([()=>e.get("gov"),()=>"empire"], ["Eq"]))){$call(e.get("add"),["monarchy",($truth($compare([()=>e.get("stab"),()=>30], ["Lt"]))?3:0)],$dict([]));
$call(e.get("add"),["junta",($truth(e.get("war"))?1.5:0)],$dict([]));
$call(e.get("add"),["republic",($truth($compare([()=>e.get("stab"),()=>40], ["Lt"]))?0.6:0)],$dict([]));
}else{if($truth($compare([()=>e.get("gov"),()=>"merchant"], ["Eq"]))){$call(e.get("add"),["republic",1],$dict([]));
$call(e.get("add"),["oligarchy",($truth($compare([()=>$call(e.get("inequality"),[e.get("sim"),$get(e.get("country"),"id")],$dict([])),()=>0.5], ["Gt"]))?2:0)],$dict([]));
$call(e.get("add"),["monarchy",($truth(e.get("war"))?0.5:0)],$dict([]));
}else{if($truth($compare([()=>e.get("gov"),()=>"tyranny"], ["Eq"]))){$call(e.get("add"),["junta",1.5],$dict([]));
$call(e.get("add"),["republic",($truth($compare([()=>e.get("stab"),()=>20], ["Lt"]))?2:0)],$dict([]));
$call(e.get("add"),["monarchy",1],$dict([]));
}else{}
}
}
}
}
}
}
}
}
}
}
return e.get("options");return null;}));
e.set("evolve",$fn("evolve",e,["sim"],[undefined],null,null,[],[],e=>{e.set("state",$get($import("systems"),"state"));{const $t3008=$dict([]);e.set("places",$t3008);}
for(const $t3009 of $iter($call($get($get(e.get("sim"),"settlements"),"values"),[],$dict([])))){e.set("s",$t3009);if($truth($compare([()=>$get(e.get("s"),"abandoned"),()=>null], ["Is"]))){{const $t3010=$bin("Add",$call($get(e.get("places"),"get"),[$get(e.get("s"),"country"),0],$dict([])),1);$setitem(e.get("places"),$get(e.get("s"),"country"),$t3010);}
}else{}
}
for(const $t3011 of $iter($call(e.get("sorted"),[$get(e.get("sim"),"countries")],$dict([])))){e.set("cid",$t3011);{const $t3012=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t3012);}
if($truth($boolop("Or",[()=>$compare([()=>$get(e.get("country"),"ended"),()=>null], ["IsNot"]),()=>$compare([()=>$bin("Sub",$get(e.get("sim"),"year"),$call(e.get("getattr"),[e.get("country"),"government_since",0],$dict([]))),()=>10], ["Lt"])]))){continue;}else{}
{const $t3013=$bin("Add",0.012,$bin("Mult",$call(e.get("max"),[0,$bin("Sub",45,$get(e.get("country"),"stability"))],$dict([])),0.005));e.set("chance",$t3013);}
if($truth($compare([()=>$call($get($get(e.get("sim"),"rng"),"random"),[],$dict([])),()=>e.get("chance")], ["GtE"]))){continue;}else{}
{const $t3014=$call(e.get("_options"),[e.get("sim"),e.get("country"),$call(e.get("state"),[e.get("sim"),e.get("cid")],$dict([])),$call($get(e.get("places"),"get"),[e.get("cid"),0],$dict([]))],$dict([]));e.set("options",$t3014);}
if($truth($un("Not",e.get("options")))){continue;}else{}
{const $t3015=$item($call($get($get(e.get("sim"),"rng"),"choices"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t3016 of $iter(e.get("options"))){e.set("o",$t3016);yield $item(e.get("o"),0);}})();})(e)),Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t3017 of $iter(e.get("options"))){e.set("o",$t3017);yield $item(e.get("o"),1);}})();})(e))],$dict([])),0);e.set("target",$t3015);}
{const $t3018=$get(e.get("country"),"government");e.set("old",$t3018);}
{const $t3019=e.get("target");$set(e.get("country"),"government",$t3019);}
{const $t3020=$get(e.get("sim"),"year");$set(e.get("country"),"government_since",$t3020);}
{const $t3021=$get(e.get("sim"),"year");$set(e.get("country"),"last_election",$t3021);}
{const $t3022=null;$set(e.get("country"),"ruler",$t3022);}
if($truth($compare([()=>$get(e.get("country"),"stability"),()=>45], ["Lt"]))){{const $t3023=$call(e.get("min"),[60,$bin("Add",$get(e.get("country"),"stability"),12)],$dict([]));$set(e.get("country"),"stability",$t3023);}
}else{}
{const $t3024=($truth($compare([()=>$get(e.get("country"),"stability"),()=>55], ["Lt"]))?"An uprising":"A reform movement");e.set("how",$t3024);}
$call($get(e.get("sim"),"record"),[($fmt(e.get("how"),-1,null)+" in "+$fmt($get(e.get("country"),"name"),-1,null)+" replaced the "+$fmt($call($get($item($call(e.get("info"),[e.get("old")],$dict([])),"label"),"lower"),[],$dict([])),-1,null)+" with a "+$fmt($call($get($item($call(e.get("info"),[e.get("target")],$dict([])),"label"),"lower"),[],$dict([])),-1,null)+"."),"political"],$dict([]));
}
return null;}));
e.set("describe",$fn("describe",e,["sim", "query"],[undefined,""],null,null,[],[],e=>{{const $t3025=["Forms of government:"];e.set("lines",$t3025);}
for(const $t3026 of $iter($call($get(e.get("GOVERNMENTS"),"items"),[],$dict([])))){{const $t3027=Array.from($iter($t3026));e.set("key",$t3027[0]);e.set("g",$t3027[1]);}{const $t3028=$call($get(", ","join"),[Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t3029 of $iter($call($get($item(e.get("g"),"traits"),"items"),[],$dict([])))){{const $t3030=Array.from($iter($t3029));e.set("k",$t3030[0]);e.set("v",$t3030[1]);}yield ($truth($compare([()=>e.get("k"),()=>$tuple(["research","stability","corruption"])], ["In"]))?($fmt(e.get("k"),-1,null)+" "+$fmt(e.get("v"),-1,("+.2f"))):($fmt(e.get("k"),-1,null)+" x"+$fmt(e.get("v"),-1,(".2f"))));}})();})(e))],$dict([]));e.set("traits",$t3028);}
$call($get(e.get("lines"),"append"),[("  "+$fmt($item(e.get("g"),"label"),-1,null)+" ("+$fmt(e.get("key"),-1,null)+"): rules as "+$fmt($item(e.get("g"),"title"),-1,null)+"; chosen by "+$fmt($item(e.get("g"),"succession"),-1,null)+"; "+$fmt($item(e.get("g"),"blurb"),-1,null)+" ["+$fmt(e.get("traits"),-1,null)+"]")],$dict([]));
}
$call($get(e.get("lines"),"append"),["Countries:"],$dict([]));
for(const $t3031 of $iter($call(e.get("sorted"),[$get(e.get("sim"),"countries")],$dict([])))){e.set("cid",$t3031);{const $t3032=$item($get(e.get("sim"),"countries"),e.get("cid"));e.set("country",$t3032);}
if($truth($boolop("And",[()=>$compare([()=>$get(e.get("country"),"ended"),()=>null], ["Is"]),()=>$boolop("Or",[()=>$un("Not",e.get("query")),()=>$compare([()=>e.get("query"),()=>$call($get($get(e.get("country"),"name"),"casefold"),[],$dict([]))], ["In"])])]))){$call($get(e.get("lines"),"append"),[("  "+$fmt($get(e.get("country"),"name"),-1,null)+": "+$fmt($item($call(e.get("info"),[$get(e.get("country"),"government")],$dict([])),"label"),-1,null)+" (since year "+$fmt($call(e.get("getattr"),[e.get("country"),"government_since",0],$dict([])),-1,null)+")")],$dict([]));
}else{}
}
return $call($get("\n","join"),[e.get("lines")],$dict([]));return null;}));
});
$register("technology",e=>{{const $t3033=["Old Stone Age","New Stone Age","Early Bronze Age","Late Bronze Age","Early Iron Age","Late Iron Age","Classical Age","Late Antiquity","Early Middle Ages","High Middle Ages","Renaissance","Age of Reason","Industrial Age","Age of Steel","Electric Age"];e.set("ERAS",$t3033);}
{const $t3034=[0,0,1,1,2,2,3,3,4,4,5,5,6,6,6];e.set("ERA_GROUP",$t3034);}
{const $t3035=["agriculture","industry","energy","construction","warfare","seafaring","trade","knowledge","culture","medicine","governance"];e.set("BRANCHES",$t3035);}
{const $t3036=3.2;e.set("COST_SCALE",$t3036);}
{const $t3037=$dict([]);e.set("T",$t3037);}
e.set("_t",$fn("_t",e,["name", "needs", "cost", "blurb", "era", "branch", "effects"],[undefined,undefined,undefined,undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t3038=$tuple([$call(e.get("set"),[e.get("needs")],$dict([])),$call(e.get("int"),[$bin("Mult",e.get("cost"),e.get("COST_SCALE"))],$dict([])),e.get("blurb"),e.get("era"),e.get("branch"),e.get("effects")]);$setitem(e.get("T"),e.get("name"),$t3038);}
return null;}));
$call(e.get("_t"),["stone tools",[],8,"sharper tools and steadier work",0,"industry",$dict([["prod",0.03]])],$dict([]));
$call(e.get("_t"),["spear making",[],8,"hunting and defense with spears",0,"warfare",$dict([["mil",0.04],["weapon",0]])],$dict([]));
$call(e.get("_t"),["weaving",[],9,"cloth, nets and baskets",0,"industry",$dict([["prod",0.02],["food",1]])],$dict([]));
$call(e.get("_t"),["pottery",[],10,"safer food storage",0,"agriculture",$dict([["food",2],["prod",0.02]])],$dict([]));
$call(e.get("_t"),["animal husbandry",[],12,"more reliable food and transport",0,"agriculture",$dict([["food",2],["prod",0.03],["land",0.03]])],$dict([]));
$call(e.get("_t"),["granaries",["pottery"],11,"food reserves for lean years",1,"agriculture",$dict([["food",3]])],$dict([]));
$call(e.get("_t"),["irrigation",["seed gathering","stone tools"],14,"more reliable harvests",2,"agriculture",$dict([["food",3],["prod",0.03]])],$dict([]));
$call(e.get("_t"),["writing",["counting"],16,"records and faster research",2,"knowledge",$dict([["research",0.1]])],$dict([]));
$call(e.get("_t"),["bronze tools",["alloying"],18,"more productive workshops",3,"industry",$dict([["prod",0.06],["mil",0.06]])],$dict([]));
$call(e.get("_t"),["bronze weapons",["bronze tools","spear making"],20,"bronze spears, axes and shields",3,"warfare",$dict([["mil",0.1],["weapon",1]])],$dict([]));
$call(e.get("_t"),["masonry",["stone tools"],18,"stone buildings and walls",2,"industry",$dict([["prod",0.03],["dfn",0.96]])],$dict([]));
$call(e.get("_t"),["roads",["bronze tools","wheel"],20,"better trade routes",3,"trade",$dict([["trade",0.1],["land",0.1],["prod",0.04],["cart",1]])],$dict([]));
$call(e.get("_t"),["sailing",["reed boats"],22,"coastal trade",3,"seafaring",$dict([["sea",0.1],["trade",0.06],["ship",1]])],$dict([]));
$call(e.get("_t"),["fortification",["masonry"],22,"defensible settlements",2,"warfare",$dict([["dfn",0.88]])],$dict([]));
$call(e.get("_t"),["currency",["barter","weights and measures","writing","smelting"],24,"coins make trade simple",2,"trade",$dict([["trade",0.12],["prod",0.03]])],$dict([]));
$call(e.get("_t"),["calendar",["star lore"],20,"the seasons planned in advance",2,"knowledge",$dict([["food",2],["research",0.04]])],$dict([]));
$call(e.get("_t"),["ironworking",["bronze tools","bellows"],30,"stronger tools and weapons",4,"warfare",$dict([["mil",0.12],["prod",0.06],["weapon",2]])],$dict([]));
$call(e.get("_t"),["crop rotation",["irrigation","composting"],28,"larger sustainable harvests",4,"agriculture",$dict([["food",3],["prod",0.03]])],$dict([]));
$call(e.get("_t"),["iron plow",["crop rotation","ironworking","ard plow"],32,"deep furrows in heavy soil",4,"agriculture",$dict([["food",3],["prod",0.04]])],$dict([]));
$call(e.get("_t"),["aqueducts",["roads","irrigation","surveying"],30,"cleaner water",4,"medicine",$dict([["inf",0.96],["wat",0.85]])],$dict([]));
$call(e.get("_t"),["medicine",["writing","herb lore"],28,"better treatment of illness",4,"medicine",$dict([["dth",0.92],["care",0.02],["cure",0.2]])],$dict([]));
$call(e.get("_t"),["mathematics",["writing"],28,"more precise scientific work",4,"knowledge",$dict([["research",0.08]])],$dict([]));
$call(e.get("_t"),["soapmaking",["pottery","animal husbandry"],22,"cleaner hands and households",4,"medicine",$dict([["inf",0.93],["con",0.88]])],$dict([]));
$call(e.get("_t"),["shipbuilding",["sailing","timber framing"],32,"stout ships with sails and oars",5,"seafaring",$dict([["sea",0.15],["ship",2]])],$dict([]));
$call(e.get("_t"),["cavalry",["ironworking","horse domestication"],34,"mounted warriors",5,"warfare",$dict([["mil",0.08],["land",0.05],["log",0.05]])],$dict([]));
$call(e.get("_t"),["law codes",["currency","kingship"],30,"written laws and courts",5,"governance",$dict([["research",0.03],["trade",0.05]])],$dict([]));
$call(e.get("_t"),["siege craft",["ironworking","fortification"],34,"rams, towers and sappers",5,"warfare",$dict([["siege",0.2]])],$dict([]));
$call(e.get("_t"),["steelmaking",["crucible furnaces"],40,"durable equipment",7,"industry",$dict([["mil",0.12],["prod",0.06]])],$dict([]));
$call(e.get("_t"),["military drill",["ironworking","roads","tax collection"],38,"disciplined legions and standing armies",6,"warfare",$dict([["mil",0.1],["log",0.06],["weapon",3]])],$dict([]));
$call(e.get("_t"),["military logistics",["roads","writing"],38,"more reliable army supplies",6,"warfare",$dict([["log",0.2]])],$dict([]));
$call(e.get("_t"),["watermills",["roads","irrigation","wheelwrights"],36,"productive grain milling",6,"industry",$dict([["food",2],["prod",0.06]])],$dict([]));
$call(e.get("_t"),["engineering",["masonry","surveying"],40,"arches, bridges and machines",6,"industry",$dict([["prod",0.05],["siege",0.1],["dfn",0.97]])],$dict([]));
$call(e.get("_t"),["paper",["writing","weaving"],34,"cheaper preservation of knowledge",6,"knowledge",$dict([["research",0.08]])],$dict([]));
$call(e.get("_t"),["public sanitation",["aqueducts","medicine"],42,"lower mortality",6,"medicine",$dict([["inf",0.92],["wat",0.76],["dth",0.97]])],$dict([]));
$call(e.get("_t"),["surgery",["medicine","ironworking"],40,"better survival after injury",6,"medicine",$dict([["dth",0.95],["wnd",0.8],["care",0.02],["cure",0.1]])],$dict([]));
$call(e.get("_t"),["herbal pharmacology",["medicine"],36,"more effective remedies",6,"medicine",$dict([["dth",0.92],["care",0.02],["cure",0.2]])],$dict([]));
$call(e.get("_t"),["astronomy",["mathematics","star lore"],38,"better calendars and navigation",6,"knowledge",$dict([["research",0.06],["sea",0.05]])],$dict([]));
$call(e.get("_t"),["navigation",["sailing","astronomy"],44,"safer long-distance trade",6,"seafaring",$dict([["sea",0.12],["trade",0.08]])],$dict([]));
$call(e.get("_t"),["bureaucracy",["law codes","paper","tax collection"],42,"officials keep the realm running",6,"governance",$dict([["research",0.04],["trade",0.06],["prod",0.03]])],$dict([]));
$call(e.get("_t"),["quarantine",["medicine"],48,"slower epidemic transmission",8,"medicine",$dict([["inf",0.9],["air",0.85],["con",0.92]])],$dict([]));
$call(e.get("_t"),["universities",["paper","mathematics"],52,"organized research and teaching",8,"knowledge",$dict([["research",0.14]])],$dict([]));
$call(e.get("_t"),["banking",["minted coinage","double-entry bookkeeping","paper"],50,"investment in workshops",8,"trade",$dict([["trade",0.12],["prod",0.05]])],$dict([]));
$call(e.get("_t"),["mechanical clocks",["mathematics","screw and lathe"],54,"precise timekeeping",9,"industry",$dict([["prod",0.05],["research",0.04]])],$dict([]));
$call(e.get("_t"),["heavy cavalry",["steelmaking","stirrups"],52,"armored knights and chivalry",8,"warfare",$dict([["mil",0.12],["weapon",4]])],$dict([]));
$call(e.get("_t"),["castles",["fortification","engineering"],50,"keeps and curtain walls",8,"warfare",$dict([["dfn",0.82]])],$dict([]));
$call(e.get("_t"),["crossbows",["steelmaking","military drill"],50,"bolts that pierce armor",8,"warfare",$dict([["mil",0.08],["dfn",0.97]])],$dict([]));
$call(e.get("_t"),["three-field system",["iron plow"],48,"land rests and feeds more people",8,"agriculture",$dict([["food",4],["prod",0.04]])],$dict([]));
$call(e.get("_t"),["lenses",["glassmaking","mathematics"],46,"improved observation",8,"knowledge",$dict([["research",0.06]])],$dict([]));
$call(e.get("_t"),["guilds",["market regulation","bureaucracy"],52,"crafts organized and taxed",8,"governance",$dict([["prod",0.06],["trade",0.06]])],$dict([]));
$call(e.get("_t"),["hospitals",["medicine","universities"],56,"organized care for the sick",9,"medicine",$dict([["dth",0.94],["care",0.03],["cure",0.15]])],$dict([]));
$call(e.get("_t"),["cog ships",["navigation","lateen sails"],52,"deep-hulled merchant ships",8,"seafaring",$dict([["sea",0.18],["ship",3]])],$dict([]));
$call(e.get("_t"),["printing",["paper","screw and lathe"],64,"faster diffusion of ideas",10,"knowledge",$dict([["research",0.14]])],$dict([]));
$call(e.get("_t"),["chemistry",["ironworking","universities","alchemy"],66,"elements, acids and powders",10,"knowledge",$dict([["research",0.08],["prod",0.04]])],$dict([]));
$call(e.get("_t"),["gunpowder",["alchemy","steelmaking"],70,"an explosive that changes war",10,"warfare",$dict([["mil",0.1],["siege",0.3]])],$dict([]));
$call(e.get("_t"),["musketry",["gunpowder","military drill","blast furnace"],74,"volleys of musket fire",11,"warfare",$dict([["mil",0.25],["weapon",5],["wnd",1.1]])],$dict([]));
$call(e.get("_t"),["bastion forts",["castles","ballistics"],74,"angled walls that shrug off cannon",11,"warfare",$dict([["dfn",0.78]])],$dict([]));
$call(e.get("_t"),["microscopy",["lenses","universities"],64,"investigation of invisible organisms",10,"medicine",$dict([["cure",0.2],["research",0.04]])],$dict([]));
$call(e.get("_t"),["anatomy",["surgery","printing"],66,"the body mapped by dissection",10,"medicine",$dict([["dth",0.93],["care",0.02],["wnd",0.9]])],$dict([]));
$call(e.get("_t"),["scientific method",["printing","universities"],76,"experiment and open publication",10,"knowledge",$dict([["research",0.2]])],$dict([]));
$call(e.get("_t"),["ocean ships",["cog ships","sternpost rudder"],70,"caravels and carracks cross oceans",10,"seafaring",$dict([["sea",0.22],["ship",4]])],$dict([]));
$call(e.get("_t"),["joint-stock companies",["banking","ocean ships"],72,"shared risk, shared profit",10,"trade",$dict([["trade",0.15],["prod",0.05]])],$dict([]));
$call(e.get("_t"),["crop exchange",["three-field system","ocean ships"],70,"new crops cross the seas",10,"agriculture",$dict([["food",5],["prod",0.04]])],$dict([]));
$call(e.get("_t"),["steam power",["steelmaking","watermills","mine pumps"],84,"mechanized production",12,"industry",$dict([["prod",0.14]])],$dict([]));
$call(e.get("_t"),["railways",["machine tools"],94,"iron roads for steam trains",13,"trade",$dict([["trade",0.2],["land",0.5],["log",0.2],["cart",2],["prod",0.05]])],$dict([]));
$call(e.get("_t"),["steamships",["steam power","ocean ships","iron hulls"],94,"ships that ignore the wind",12,"seafaring",$dict([["sea",0.4],["ship",5]])],$dict([]));
$call(e.get("_t"),["germ theory",["microscopy","public sanitation","chemistry"],90,"targeted prevention of infection",12,"medicine",$dict([["inf",0.88],["air",0.9],["con",0.9],["dth",0.88],["care",0.02],["cure",0.3]])],$dict([]));
$call(e.get("_t"),["vaccination",["germ theory","herbal pharmacology"],96,"protection from severe epidemics",12,"medicine",$dict([["inf",0.9],["air",0.85],["dth",0.92],["cure",0.3]])],$dict([]));
$call(e.get("_t"),["public health",["germ theory","bureaucracy"],100,"sewers, inspection and clean milk",12,"medicine",$dict([["wat",0.7],["inf",0.92],["care",0.03]])],$dict([]));
$call(e.get("_t"),["rifled firearms",["musketry","steam power","ballistics"],100,"accurate breech-loading rifles",13,"warfare",$dict([["mil",0.3],["weapon",6],["wnd",1.1]])],$dict([]));
$call(e.get("_t"),["artillery",["steam power","ballistics"],100,"rifled guns that smash any wall",13,"warfare",$dict([["siege",0.5],["mil",0.1]])],$dict([]));
$call(e.get("_t"),["fertilizers",["chemistry","crop exchange","selective breeding"],92,"factory nitrates feed the fields",12,"agriculture",$dict([["food",6],["prod",0.05]])],$dict([]));
$call(e.get("_t"),["electricity",["magnetism","scientific method","chemistry"],104,"power and the telegraph",12,"knowledge",$dict([["research",0.25],["prod",0.08]])],$dict([]));
$call(e.get("_t"),["factory system",["guilds","machine tools"],98,"mass production in great mills",13,"governance",$dict([["prod",0.14],["trade",0.06]])],$dict([]));
$call(e.get("_t"),["seed gathering",[],8,"wild grain is gathered and saved",0,"agriculture",$dict([["food",1]])],$dict([]));
$call(e.get("_t"),["fishing nets",["weaving"],9,"nets and traps feed the coast",1,"agriculture",$dict([["food",1]])],$dict([]));
$call(e.get("_t"),["smoking and drying",["pottery"],10,"meat and fish keep through winter",1,"agriculture",$dict([["food",1],["spoil",0.92]])],$dict([]));
$call(e.get("_t"),["fire making",[],8,"warmth, light and cooked food",0,"energy",$dict([["prod",0.02],["inf",0.98]])],$dict([]));
$call(e.get("_t"),["bone tools",["stone tools"],9,"needles, hooks and awls",1,"industry",$dict([["prod",0.02]])],$dict([]));
$call(e.get("_t"),["oral tradition",[],8,"stories carry knowledge between generations",0,"culture",$dict([["cult",0.05],["research",0.01]])],$dict([]));
$call(e.get("_t"),["cave painting",["oral tradition"],9,"images tell the tribe who it is",1,"culture",$dict([["cult",0.05]])],$dict([]));
$call(e.get("_t"),["burial rites",["oral tradition"],9,"the dead are honored and the living bound together",1,"culture",$dict([["stab",0.03]])],$dict([]));
$call(e.get("_t"),["thatched huts",[],8,"sturdier homes against the weather",0,"construction",$dict([["build",0.03]])],$dict([]));
$call(e.get("_t"),["wooden palisade",["thatched huts","stone tools"],10,"stakes around the camp",1,"construction",$dict([["dfn",0.97]])],$dict([]));
$call(e.get("_t"),["counting",[],8,"tallies of days, herds and goods",0,"knowledge",$dict([["research",0.03]])],$dict([]));
$call(e.get("_t"),["herb lore",[],8,"plants for wounds and fevers",0,"medicine",$dict([["dth",0.98]])],$dict([]));
$call(e.get("_t"),["midwifery",["herb lore"],9,"safer births",1,"medicine",$dict([["care",0.01],["dth",0.99]])],$dict([]));
$call(e.get("_t"),["slings and bows",["spear making","weaving"],10,"hunting and fighting at a distance",1,"warfare",$dict([["mil",0.02]])],$dict([]));
$call(e.get("_t"),["tribal council",[],9,"elders settle disputes",0,"governance",$dict([["stab",0.03]])],$dict([]));
$call(e.get("_t"),["dugout canoes",["fire making","stone tools"],10,"hollowed logs on rivers and coasts",1,"seafaring",$dict([["sea",0.04]])],$dict([]));
$call(e.get("_t"),["barter",["oral tradition"],8,"goods swapped between camps",1,"trade",$dict([["trade",0.04]])],$dict([]));
$call(e.get("_t"),["charcoal burning",["fire making"],14,"hot, steady fires for metal",2,"energy",$dict([["prod",0.03]])],$dict([]));
$call(e.get("_t"),["kiln firing",["pottery","fire making"],14,"hard bricks and pots",2,"industry",$dict([["prod",0.03]])],$dict([]));
$call(e.get("_t"),["mud brick",["thatched huts","kiln firing"],14,"walls that last",2,"construction",$dict([["build",0.04]])],$dict([]));
$call(e.get("_t"),["smelting",["charcoal burning","kiln firing","stone tools"],16,"metal from ore",2,"industry",$dict([["prod",0.04]])],$dict([]));
$call(e.get("_t"),["prospecting",["smelting"],16,"finding ore by its signs",3,"industry",$dict([["prod",0.02]])],$dict([]));
$call(e.get("_t"),["priesthood",["burial rites","calendar"],16,"specialists tend the sacred",2,"culture",$dict([["cult",0.06],["stab",0.03]])],$dict([]));
$call(e.get("_t"),["temple building",["priesthood"],18,"houses for the gods",3,"culture",$dict([["cult",0.06]])],$dict([]));
$call(e.get("_t"),["epic poetry",["oral tradition","writing"],16,"long songs of heroes and kings",2,"culture",$dict([["cult",0.08]])],$dict([]));
$call(e.get("_t"),["weights and measures",["counting"],14,"fair trade needs fair scales",2,"trade",$dict([["trade",0.04]])],$dict([]));
$call(e.get("_t"),["caravan routes",["roads","barter"],18,"regular trade over long distances",3,"trade",$dict([["trade",0.06],["land",0.04]])],$dict([]));
$call(e.get("_t"),["ard plow",["animal husbandry","seed gathering","stone tools"],16,"oxen pull a scratch plow",2,"agriculture",$dict([["food",2],["prod",0.02]])],$dict([]));
$call(e.get("_t"),["orchards and bees",["irrigation"],14,"fruit, honey and wax",2,"agriculture",$dict([["food",2]])],$dict([]));
$call(e.get("_t"),["salt curing",["smoking and drying"],14,"salt keeps food for months",2,"agriculture",$dict([["spoil",0.9],["food",1]])],$dict([]));
$call(e.get("_t"),["healing shrines",["herb lore","priesthood"],16,"the sick are brought to the temple",3,"medicine",$dict([["dth",0.97],["care",0.01],["stab",0.01]])],$dict([]));
$call(e.get("_t"),["watchtowers",["fortification"],16,"early warning on the frontier",3,"warfare",$dict([["dfn",0.98]])],$dict([]));
$call(e.get("_t"),["war chariots",["bronze weapons","wheel","horse domestication"],20,"fast, shocking charges",3,"warfare",$dict([["mil",0.05],["land",0.03]])],$dict([]));
$call(e.get("_t"),["reed boats",["dugout canoes","weaving"],14,"light boats for rivers and lakes",3,"seafaring",$dict([["sea",0.05]])],$dict([]));
$call(e.get("_t"),["coastal pilotage",["sailing","star lore"],16,"landmarks and soundings",3,"seafaring",$dict([["sea",0.04]])],$dict([]));
$call(e.get("_t"),["city planning",["mud brick","roads"],18,"streets, squares and drains laid out",3,"construction",$dict([["build",0.04],["stab",0.02]])],$dict([]));
$call(e.get("_t"),["tax collection",["weights and measures","writing","kingship"],18,"the state counts and collects",3,"governance",$dict([["trade",0.03],["stab",0.02]])],$dict([]));
$call(e.get("_t"),["kingship",["tribal council","priesthood"],18,"one ruler, one realm",3,"governance",$dict([["stab",0.04]])],$dict([]));
$call(e.get("_t"),["forging",["ironworking"],30,"hammered iron and steel edges",5,"industry",$dict([["prod",0.04],["mil",0.03]])],$dict([]));
$call(e.get("_t"),["mining shafts",["prospecting","bronze tools"],28,"ore from deep underground",5,"industry",$dict([["prod",0.05]])],$dict([]));
$call(e.get("_t"),["wheelwrights",["animal husbandry","bronze tools","wheel"],26,"spoked wheels and strong carts",4,"industry",$dict([["land",0.04],["prod",0.02]])],$dict([]));
$call(e.get("_t"),["glassmaking",["bellows"],28,"clear glass for windows and vessels",5,"industry",$dict([["prod",0.03]])],$dict([]));
$call(e.get("_t"),["arches and vaults",["city planning","lime mortar"],28,"stone spans and roofs",5,"construction",$dict([["build",0.05],["haz",0.97]])],$dict([]));
$call(e.get("_t"),["paved roads",["roads","masonry"],28,"stone roads that last",5,"trade",$dict([["land",0.06],["trade",0.05]])],$dict([]));
$call(e.get("_t"),["harbors and docks",["sailing","masonry"],28,"quays, breakwaters and warehouses",5,"seafaring",$dict([["sea",0.05],["trade",0.03]])],$dict([]));
$call(e.get("_t"),["sundials",["calendar","mathematics"],26,"time measured by shadow",4,"knowledge",$dict([["research",0.04]])],$dict([]));
$call(e.get("_t"),["philosophy",["mathematics"],30,"questions about the world and how to live",4,"knowledge",$dict([["research",0.07],["cult",0.06]])],$dict([]));
$call(e.get("_t"),["drama and theater",["epic poetry","city planning","music and dance"],28,"plays before the whole city",5,"culture",$dict([["cult",0.08]])],$dict([]));
$call(e.get("_t"),["sculpture",["temple building","masonry"],26,"marble and bronze figures",5,"culture",$dict([["cult",0.06]])],$dict([]));
$call(e.get("_t"),["state religion",["law codes"],30,"one faith binds the realm",5,"culture",$dict([["cult",0.05],["stab",0.05]])],$dict([]));
$call(e.get("_t"),["phalanx",["bronze weapons","fortification"],26,"locked shields and long spears",5,"warfare",$dict([["mil",0.04],["dfn",0.98]])],$dict([]));
$call(e.get("_t"),["iron armor",["forging"],30,"mail and helmets",5,"warfare",$dict([["wnd",0.95],["mil",0.02]])],$dict([]));
$call(e.get("_t"),["clinical observation",["medicine"],28,"patients watched and records kept",4,"medicine",$dict([["dth",0.95],["cure",0.1]])],$dict([]));
$call(e.get("_t"),["latrines and drains",["aqueducts","masonry"],28,"waste carried away from homes",5,"medicine",$dict([["wat",0.9],["inf",0.97]])],$dict([]));
$call(e.get("_t"),["selective breeding",["animal husbandry","seed gathering"],26,"the best animals and seed are kept",4,"agriculture",$dict([["food",2],["prod",0.03]])],$dict([]));
$call(e.get("_t"),["olive and wine",["orchards and bees","kiln firing"],26,"oil and wine for trade",4,"agriculture",$dict([["food",1],["trade",0.03]])],$dict([]));
$call(e.get("_t"),["grain silos",["granaries","masonry"],24,"dry stone storage",4,"agriculture",$dict([["spoil",0.9],["food",1]])],$dict([]));
$call(e.get("_t"),["courts",["law codes"],28,"judges hear disputes openly",5,"governance",$dict([["stab",0.05]])],$dict([]));
$call(e.get("_t"),["census",["tax collection","mathematics"],28,"the realm counted by name",4,"governance",$dict([["research",0.02],["stab",0.02],["trade",0.02]])],$dict([]));
$call(e.get("_t"),["minted coinage",["currency"],26,"stamped coins of fixed weight",4,"trade",$dict([["trade",0.06]])],$dict([]));
$call(e.get("_t"),["cast iron",["forging","mining shafts"],38,"iron poured into molds",7,"industry",$dict([["prod",0.05]])],$dict([]));
$call(e.get("_t"),["windmills",["watermills","weaving"],38,"wind turns the grindstone",6,"energy",$dict([["prod",0.05],["food",1]])],$dict([]));
$call(e.get("_t"),["coal mining",["mining shafts"],38,"black rock that burns hot",6,"energy",$dict([["prod",0.05]])],$dict([]));
$call(e.get("_t"),["concrete",["arches and vaults"],40,"stone poured and set",7,"construction",$dict([["build",0.06],["haz",0.97]])],$dict([]));
$call(e.get("_t"),["sewers",["latrines and drains","arches and vaults"],40,"covered channels beneath the streets",7,"medicine",$dict([["wat",0.88],["inf",0.95]])],$dict([]));
$call(e.get("_t"),["public baths",["latrines and drains"],36,"bathing for the whole town",7,"medicine",$dict([["con",0.9],["inf",0.97],["stab",0.01]])],$dict([]));
$call(e.get("_t"),["civil service",["census","bureaucracy"],44,"trained officials",7,"governance",$dict([["prod",0.04],["research",0.03]])],$dict([]));
$call(e.get("_t"),["historiography",["philosophy","paper"],38,"the past written down and argued over",6,"culture",$dict([["cult",0.07],["research",0.03]])],$dict([]));
$call(e.get("_t"),["cartography",["astronomy","paper","surveying"],40,"maps of coasts and roads",6,"knowledge",$dict([["sea",0.05],["research",0.03]])],$dict([]));
$call(e.get("_t"),["algebra",["astronomy"],40,"unknowns solved by rule",6,"knowledge",$dict([["research",0.07]])],$dict([]));
$call(e.get("_t"),["mechanics",["engineering"],42,"levers, gears and pulleys explained",6,"knowledge",$dict([["research",0.05],["prod",0.03]])],$dict([]));
$call(e.get("_t"),["stirrups",["cavalry","forging"],38,"riders fight from the saddle",6,"warfare",$dict([["mil",0.05],["land",0.02]])],$dict([]));
$call(e.get("_t"),["catapults",["siege craft","engineering"],42,"stone and bolts hurled over walls",6,"warfare",$dict([["siege",0.1]])],$dict([]));
$call(e.get("_t"),["legionary camps",["military drill","engineering"],42,"armies fortify every night",7,"warfare",$dict([["log",0.1],["dfn",0.98]])],$dict([]));
$call(e.get("_t"),["war galleys",["shipbuilding","iron armor"],38,"rams and boarding bridges",7,"seafaring",$dict([["mil",0.03],["sea",0.05]])],$dict([]));
$call(e.get("_t"),["lighthouse engineering",["harbors and docks","engineering"],40,"tall towers guide ships home",7,"seafaring",$dict([["sea",0.05],["haz",0.99]])],$dict([]));
$call(e.get("_t"),["market regulation",["minted coinage","courts"],38,"inspectors keep trade honest",7,"trade",$dict([["trade",0.07]])],$dict([]));
$call(e.get("_t"),["imperial roads",["paved roads","bureaucracy"],44,"a road network across the realm",7,"trade",$dict([["land",0.1],["log",0.05]])],$dict([]));
$call(e.get("_t"),["heavy plow",["iron plow","wheelwrights"],38,"turns the thick northern soil",7,"agriculture",$dict([["food",2],["prod",0.04]])],$dict([]));
$call(e.get("_t"),["monasteries",["state religion","paper"],42,"communities of prayer, books and farming",7,"culture",$dict([["cult",0.07],["research",0.03],["stab",0.02]])],$dict([]));
$call(e.get("_t"),["classical architecture",["sculpture","arches and vaults","mathematics"],40,"columns, domes and proportion",7,"construction",$dict([["build",0.04],["cult",0.04]])],$dict([]));
$call(e.get("_t"),["building codes",["arches and vaults","law codes"],38,"rules against fire and collapse",7,"construction",$dict([["haz",0.95]])],$dict([]));
$call(e.get("_t"),["blast furnace",["cast iron","coal mining"],54,"continuous iron at scale",8,"industry",$dict([["prod",0.06],["mil",0.03]])],$dict([]));
$call(e.get("_t"),["spinning wheel",["weaving","wheelwrights"],48,"thread spun many times faster",8,"industry",$dict([["prod",0.05],["trade",0.03]])],$dict([]));
$call(e.get("_t"),["gothic architecture",["classical architecture","concrete","stone quarrying"],54,"pointed arches and soaring cathedrals",9,"construction",$dict([["build",0.06],["cult",0.06],["stab",0.02]])],$dict([]));
$call(e.get("_t"),["stone bridges",["arches and vaults","imperial roads","surveying"],50,"rivers crossed for good",9,"construction",$dict([["land",0.05],["build",0.04]])],$dict([]));
$call(e.get("_t"),["dikes and polders",["concrete","heavy plow","surveying"],52,"land won back from the water",9,"construction",$dict([["haz",0.93],["food",2]])],$dict([]));
$call(e.get("_t"),["scholasticism",["universities","philosophy"],56,"faith and reason debated in the schools",9,"knowledge",$dict([["research",0.08],["cult",0.04]])],$dict([]));
$call(e.get("_t"),["illuminated manuscripts",["monasteries"],50,"books as works of art",9,"culture",$dict([["cult",0.07]])],$dict([]));
$call(e.get("_t"),["chivalric orders",["heavy cavalry","state religion"],54,"knights bound by oath and rule",9,"culture",$dict([["cult",0.04],["mil",0.04],["stab",0.02]])],$dict([]));
$call(e.get("_t"),["troubadours",["epic poetry","monasteries","music and dance"],46,"songs and stories carried from court to court",9,"culture",$dict([["cult",0.06]])],$dict([]));
$call(e.get("_t"),["longbows",["slings and bows","military drill"],52,"volleys that break charges",9,"warfare",$dict([["mil",0.06]])],$dict([]));
$call(e.get("_t"),["plate armor",["blast furnace","iron armor"],58,"full steel harness",9,"warfare",$dict([["wnd",0.9],["mil",0.04]])],$dict([]));
$call(e.get("_t"),["pike formations",["longbows"],54,"forests of spears against horse",9,"warfare",$dict([["mil",0.05]])],$dict([]));
$call(e.get("_t"),["trebuchets",["catapults"],54,"counterweight siege engines",8,"warfare",$dict([["siege",0.12]])],$dict([]));
$call(e.get("_t"),["magnetic compass",["navigation","cartography","magnetism"],52,"the needle points the way",8,"seafaring",$dict([["sea",0.08]])],$dict([]));
$call(e.get("_t"),["customs houses",["harbors and docks","market regulation","treaties and envoys"],52,"ports tax and inspect",9,"seafaring",$dict([["trade",0.06]])],$dict([]));
$call(e.get("_t"),["bills of exchange",["banking","market regulation"],54,"credit across distance",9,"trade",$dict([["trade",0.08]])],$dict([]));
$call(e.get("_t"),["trade fairs",["market regulation","imperial roads"],50,"merchants gather at fixed times",9,"trade",$dict([["trade",0.06]])],$dict([]));
$call(e.get("_t"),["representative assemblies",["courts","bureaucracy"],56,"estates meet to advise and consent",8,"governance",$dict([["stab",0.05],["research",0.02]])],$dict([]));
$call(e.get("_t"),["common law",["courts","civil service"],54,"precedent builds the law",9,"governance",$dict([["stab",0.05],["trade",0.03]])],$dict([]));
$call(e.get("_t"),["medical schools",["medicine","universities"],58,"physicians trained by text and teacher",9,"medicine",$dict([["cure",0.1],["dth",0.96]])],$dict([]));
$call(e.get("_t"),["pharmacies",["herbal pharmacology","alchemy"],52,"prepared remedies on every street",8,"medicine",$dict([["cure",0.12]])],$dict([]));
$call(e.get("_t"),["town water conduits",["sewers","concrete"],54,"clean water piped to the town",9,"medicine",$dict([["wat",0.88]])],$dict([]));
$call(e.get("_t"),["horse collar",["heavy plow","stirrups"],48,"horses plow and haul",8,"agriculture",$dict([["food",3],["land",0.03]])],$dict([]));
$call(e.get("_t"),["herring fisheries",["salt curing","cog ships"],50,"salted fish feed the interior",9,"agriculture",$dict([["food",3],["trade",0.03],["spoil",0.9]])],$dict([]));
$call(e.get("_t"),["textile manufactories",["spinning wheel","mechanical clocks"],68,"workshops under one roof",10,"industry",$dict([["prod",0.06]])],$dict([]));
$call(e.get("_t"),["precision instruments",["mechanical clocks","lenses"],70,"fine gears, scales and scopes",11,"knowledge",$dict([["research",0.06],["sea",0.04]])],$dict([]));
$call(e.get("_t"),["telescopes",["lenses","astronomy"],68,"the heavens brought near",10,"knowledge",$dict([["research",0.06]])],$dict([]));
$call(e.get("_t"),["natural philosophy",["scholasticism","printing"],72,"nature studied by measurement",11,"knowledge",$dict([["research",0.08]])],$dict([]));
$call(e.get("_t"),["insurance",["bills of exchange","ocean ships"],74,"shared risk for voyages",11,"trade",$dict([["trade",0.08],["haz",0.99]])],$dict([]));
$call(e.get("_t"),["mercantilism",["joint-stock companies","customs houses"],76,"the state steers trade for profit",11,"trade",$dict([["trade",0.08],["prod",0.03]])],$dict([]));
$call(e.get("_t"),["perspective painting",["illuminated manuscripts","algebra"],66,"the eye deceived by geometry",10,"culture",$dict([["cult",0.08]])],$dict([]));
$call(e.get("_t"),["humanism",["historiography","printing"],70,"learning from the ancients and from people",11,"culture",$dict([["cult",0.08],["research",0.04]])],$dict([]));
$call(e.get("_t"),["opera and theaters",["troubadours","printing"],68,"music and drama in great houses",11,"culture",$dict([["cult",0.07]])],$dict([]));
$call(e.get("_t"),["domed architecture",["gothic architecture","mechanics"],70,"great domes and wide halls",10,"construction",$dict([["build",0.06],["cult",0.04]])],$dict([]));
$call(e.get("_t"),["civil engineering",["stone bridges","mechanics"],72,"canals, bridges and harbors by design",10,"construction",$dict([["build",0.06],["prod",0.03],["haz",0.96]])],$dict([]));
$call(e.get("_t"),["deep mining",["blast furnace","mine pumps"],72,"pumps keep deep mines dry",10,"energy",$dict([["prod",0.06]])],$dict([]));
$call(e.get("_t"),["coke smelting",["blast furnace"],74,"coal turned into hotter fuel",10,"energy",$dict([["prod",0.06],["mil",0.02]])],$dict([]));
$call(e.get("_t"),["flintlocks",["musketry","precision instruments"],78,"reliable, quick-firing muskets",11,"warfare",$dict([["mil",0.08]])],$dict([]));
$call(e.get("_t"),["field artillery",["trebuchets","ballistics"],72,"light guns on the battlefield",11,"warfare",$dict([["siege",0.15],["mil",0.05]])],$dict([]));
$call(e.get("_t"),["standing armies",["pike formations","bureaucracy"],74,"professional soldiers paid all year",11,"warfare",$dict([["log",0.1],["mil",0.06]])],$dict([]));
$call(e.get("_t"),["galleons",["ocean ships","gunpowder"],76,"armed ships that cross oceans",11,"seafaring",$dict([["sea",0.06],["mil",0.02]])],$dict([]));
$call(e.get("_t"),["chronometers",["magnetic compass","precision instruments"],74,"longitude found at sea",11,"seafaring",$dict([["sea",0.1]])],$dict([]));
$call(e.get("_t"),["overseas trade posts",["mercantilism"],76,"fortified stations on distant coasts",11,"seafaring",$dict([["trade",0.08]])],$dict([]));
$call(e.get("_t"),["national treasuries",["bills of exchange","common law"],70,"the state keeps ledgers and credit",10,"governance",$dict([["trade",0.04],["stab",0.03]])],$dict([]));
$call(e.get("_t"),["rights and liberties",["common law","humanism"],76,"limits on rulers written down",11,"governance",$dict([["stab",0.04],["research",0.03]])],$dict([]));
$call(e.get("_t"),["inoculation",["pharmacies","microscopy"],78,"a mild dose against the great disease",11,"medicine",$dict([["inf",0.95],["dth",0.94],["cure",0.1]])],$dict([]));
$call(e.get("_t"),["clinical medicine",["anatomy","medical schools"],76,"teaching hospitals and case records",11,"medicine",$dict([["dth",0.94],["care",0.02]])],$dict([]));
$call(e.get("_t"),["lazarettos",["quarantine","customs houses"],70,"ports hold ships until they are safe",10,"medicine",$dict([["air",0.9],["inf",0.95]])],$dict([]));
$call(e.get("_t"),["scientific agronomy",["crop exchange","natural philosophy","seed drill"],76,"farming by experiment",11,"agriculture",$dict([["food",4],["prod",0.04]])],$dict([]));
$call(e.get("_t"),["mass steel",["steam power","coke smelting","chemistry"],96,"cheap steel by the ton",12,"industry",$dict([["prod",0.08],["mil",0.04]])],$dict([]));
$call(e.get("_t"),["machine tools",["steam power","precision instruments"],96,"machines that make machines",12,"industry",$dict([["prod",0.08]])],$dict([]));
$call(e.get("_t"),["interchangeable parts",["machine tools"],100,"standard pieces, fast repair",13,"industry",$dict([["prod",0.06]])],$dict([]));
$call(e.get("_t"),["petroleum",["coke smelting","chemistry","thermodynamics"],100,"oil for lamps and engines",13,"energy",$dict([["prod",0.08]])],$dict([]));
$call(e.get("_t"),["power grids",["electricity","machine tools"],110,"electric power in every town",13,"energy",$dict([["prod",0.1],["research",0.05]])],$dict([]));
$call(e.get("_t"),["telegraph networks",["electricity","precision instruments"],104,"news in minutes",13,"trade",$dict([["trade",0.1],["log",0.1]])],$dict([]));
$call(e.get("_t"),["steel-frame buildings",["mass steel","civil engineering","scaffolding and cranes"],104,"towers that scrape the sky",13,"construction",$dict([["build",0.08],["haz",0.95]])],$dict([]));
$call(e.get("_t"),["reinforced concrete",["concrete","mass steel"],104,"steel inside stone",13,"construction",$dict([["build",0.08],["haz",0.93]])],$dict([]));
$call(e.get("_t"),["modern sewers",["public health","civil engineering"],100,"clean water in, waste out, for the whole city",14,"medicine",$dict([["wat",0.8],["inf",0.93]])],$dict([]));
$call(e.get("_t"),["refrigeration",["electricity","thermodynamics"],108,"food kept cold for weeks",14,"agriculture",$dict([["spoil",0.6],["food",3]])],$dict([]));
$call(e.get("_t"),["canning",["mass steel"],98,"food sealed for years",14,"agriculture",$dict([["spoil",0.7],["food",2],["log",0.05]])],$dict([]));
$call(e.get("_t"),["steam reapers",["scientific agronomy","machine tools"],100,"machines harvest the plains",14,"agriculture",$dict([["food",4],["prod",0.04]])],$dict([]));
$call(e.get("_t"),["mass literacy",["printing","factory system"],98,"cheap newspapers and schooling",14,"culture",$dict([["cult",0.08],["research",0.05],["stab",0.02]])],$dict([]));
$call(e.get("_t"),["photography",["chemistry","precision instruments"],100,"light fixed on glass and paper",12,"culture",$dict([["cult",0.08]])],$dict([]));
$call(e.get("_t"),["museums and symphonies",["opera and theaters","mass literacy"],100,"art for the public",14,"culture",$dict([["cult",0.08]])],$dict([]));
$call(e.get("_t"),["public education",["mass literacy","national treasuries"],104,"schools for every child",14,"governance",$dict([["research",0.08],["stab",0.03]])],$dict([]));
$call(e.get("_t"),["constitutional government",["rights and liberties","mass literacy"],108,"written constitutions and elections",14,"governance",$dict([["stab",0.05],["research",0.03]])],$dict([]));
$call(e.get("_t"),["labor laws",["constitutional government"],108,"limits on hours and danger",14,"governance",$dict([["stab",0.04],["prod",0.03]])],$dict([]));
$call(e.get("_t"),["machine guns",["rifled firearms","interchangeable parts"],110,"sustained fire from one crew",14,"warfare",$dict([["mil",0.12],["weapon",7]])],$dict([]));
$call(e.get("_t"),["ironclads",["steamships","mass steel","artillery"],110,"armored steam warships",14,"seafaring",$dict([["sea",0.1],["mil",0.03],["ship",6]])],$dict([]));
$call(e.get("_t"),["antisepsis",["germ theory","surgery"],100,"clean hands and clean wounds",13,"medicine",$dict([["wnd",0.7],["dth",0.93]])],$dict([]));
$call(e.get("_t"),["anesthesia",["surgery","chemistry"],96,"surgery without agony",12,"medicine",$dict([["wnd",0.85],["dth",0.95]])],$dict([]));
$call(e.get("_t"),["medical imaging",["electricity","anatomy","photography"],108,"the body seen from outside",14,"medicine",$dict([["dth",0.94],["cure",0.1]])],$dict([]));
$call(e.get("_t"),["bacteriology labs",["germ theory"],100,"disease traced to its source",13,"medicine",$dict([["cure",0.2]])],$dict([]));
$call(e.get("_t"),["bellows",["smelting"],14,"forced air makes fires hotter",3,"energy",$dict([["prod",0.02]])],$dict([]));
$call(e.get("_t"),["stone quarrying",["masonry","bronze tools"],16,"blocks cut and hauled",3,"construction",$dict([["build",0.03]])],$dict([]));
$call(e.get("_t"),["oil lamps",["olive and wine"],24,"light after dark",4,"energy",$dict([["prod",0.02],["research",0.01]])],$dict([]));
$call(e.get("_t"),["timber framing",["thatched huts","ironworking"],26,"strong wooden skeletons for houses and halls",5,"construction",$dict([["build",0.03]])],$dict([]));
$call(e.get("_t"),["scaffolding and cranes",["wheelwrights","arches and vaults"],30,"tall walls raised safely",5,"construction",$dict([["build",0.04]])],$dict([]));
$call(e.get("_t"),["housing blocks",["concrete","building codes"],40,"many families under one roof",7,"construction",$dict([["build",0.03],["stab",0.01]])],$dict([]));
$call(e.get("_t"),["tide mills",["watermills","harbors and docks"],44,"the sea turns the wheel",8,"energy",$dict([["prod",0.04]])],$dict([]));
$call(e.get("_t"),["gas lighting",["coke smelting","chemistry"],92,"lit streets and long evenings",12,"energy",$dict([["prod",0.04],["stab",0.02]])],$dict([]));
$call(e.get("_t"),["steam turbines",["power grids","thermodynamics"],118,"spinning steam drives generators",14,"energy",$dict([["prod",0.1]])],$dict([]));
$call(e.get("_t"),["horse domestication",["animal husbandry"],16,"horses to ride and to pull",2,"agriculture",$dict([["food",1],["land",0.05]])],$dict([]));
$call(e.get("_t"),["potter's wheel",["pottery"],16,"a spinning table that shapes even vessels",2,"industry",$dict([["prod",0.03]])],$dict([]));
$call(e.get("_t"),["wheel",["potter's wheel"],16,"turning discs become carts and wheelbarrows",3,"trade",$dict([["land",0.08]])],$dict([]));
$call(e.get("_t"),["star lore",["counting"],16,"the sky as clock and compass",2,"knowledge",$dict([["research",0.01],["sea",0.03]])],$dict([]));
$call(e.get("_t"),["alloying",["smelting"],16,"mixing metals for hardness",3,"industry",$dict([["prod",0.03],["mil",0.02]])],$dict([]));
$call(e.get("_t"),["composting",["animal husbandry","seed gathering"],28,"rotting waste feeds the soil",4,"agriculture",$dict([["food",2]])],$dict([]));
$call(e.get("_t"),["lime mortar",["kiln firing","masonry"],28,"burnt lime binds stone",4,"construction",$dict([["build",0.04]])],$dict([]));
$call(e.get("_t"),["surveying",["mathematics","weights and measures"],28,"measuring land, slopes and distances",4,"knowledge",$dict([["research",0.01],["build",0.03]])],$dict([]));
$call(e.get("_t"),["music and dance",["oral tradition","bone tools"],16,"rhythm, pipes and drums",3,"culture",$dict([["cult",0.04]])],$dict([]));
$call(e.get("_t"),["crucible furnaces",["forging"],40,"closed pots that melt metal evenly",7,"industry",$dict([["prod",0.04]])],$dict([]));
$call(e.get("_t"),["lateen sails",["shipbuilding"],40,"triangular sails that sail against the wind",7,"seafaring",$dict([["sea",0.06]])],$dict([]));
$call(e.get("_t"),["alchemy",["glassmaking","philosophy"],40,"patient experiments with substances",7,"knowledge",$dict([["research",0.02]])],$dict([]));
$call(e.get("_t"),["magnetism",["ironworking","mathematics"],40,"lodestones and the pull of iron",6,"knowledge",$dict([["research",0.015]])],$dict([]));
$call(e.get("_t"),["treaties and envoys",["courts"],52,"diplomacy backed by written terms",8,"governance",$dict([["stab",0.02],["trade",0.03]])],$dict([]));
$call(e.get("_t"),["double-entry bookkeeping",["currency","mathematics"],52,"ledgers that always balance",8,"trade",$dict([["trade",0.05]])],$dict([]));
$call(e.get("_t"),["sternpost rudder",["shipbuilding"],52,"steering from the back of the ship",8,"seafaring",$dict([["sea",0.05]])],$dict([]));
$call(e.get("_t"),["screw and lathe",["steelmaking","wheelwrights"],52,"turned and threaded parts",9,"industry",$dict([["prod",0.04]])],$dict([]));
$call(e.get("_t"),["seed drill",["mechanics","three-field system"],72,"seeds placed in even rows",10,"agriculture",$dict([["food",3]])],$dict([]));
$call(e.get("_t"),["mine pumps",["coal mining","mechanics"],72,"engines that drain deep mines",10,"energy",$dict([["prod",0.03]])],$dict([]));
$call(e.get("_t"),["ballistics",["gunpowder"],72,"calculating where a shot will land",11,"warfare",$dict([["mil",0.04],["siege",0.05]])],$dict([]));
$call(e.get("_t"),["iron hulls",["shipbuilding","steelmaking"],100,"ships built of metal plates",12,"seafaring",$dict([["sea",0.05],["mil",0.02]])],$dict([]));
$call(e.get("_t"),["thermodynamics",["scientific method","steam power"],100,"the science of heat and work",13,"knowledge",$dict([["research",0.04]])],$dict([]));
{const $t3039=$dict([["temple building",[["mud brick","masonry"]]],["castles",[["stone quarrying","concrete"]]],["universities",[["monasteries","philosophy"]]],["hospitals",[["monasteries","medical schools"]]],["ocean ships",[["magnetic compass","cartography"]]],["steam power",[["deep mining","coke smelting"]]],["rifled firearms",[["machine tools","screw and lathe"]]]]);e.set("ANY",$t3039);}
{const $t3040=e.get("T");e.set("TECH",$t3040);}
{const $t3041=$dict([["prod",0.0],["research",0.0],["trade",0.0],["food",0.0],["mil",0.0],["siege",0.0],["log",0.0],["dfn",1.0],["wnd",1.0],["inf",1.0],["wat",1.0],["air",1.0],["con",1.0],["dth",1.0],["care",0.0],["cure",0.0],["land",0.0],["sea",0.0],["cult",0.0],["stab",0.0],["build",0.0],["haz",1.0],["spoil",1.0]]);e.set("DEFAULT",$t3041);}
{const $t3042=["prod","research","trade","food","mil","siege","log","care","cure","land","sea","cult","stab","build"];e.set("ADDED",$t3042);}
{const $t3043=["dfn","wnd","inf","wat","air","con","dth","haz","spoil"];e.set("MULTIPLIED",$t3043);}
{const $t3044=$dict([["prod",2.2],["research",2.4],["trade",2.0],["food",45.0],["mil",3.5],["siege",2.0],["log",0.9],["care",0.35],["cure",1.6],["land",1.5],["sea",1.5],["cult",1.6],["stab",0.35],["build",1.2]]);e.set("CEILING",$t3044);}
{const $t3045=$dict([["dfn",0.35],["wnd",0.3],["inf",0.3],["wat",0.25],["air",0.3],["con",0.3],["dth",0.25],["haz",0.4],["spoil",0.35]]);e.set("FLOOR",$t3045);}
{const $t3046=["weapon","ship","cart"];e.set("TIERS",$t3046);}
{const $t3047=$dict([["weapon",["hunters with spears","bronze spearmen","iron swordsmen","legionaries","armored knights","musketeers","riflemen","machine-gun crews"]],["ship",["rafts","sailing boats","galleys","cogs","caravels","steamships","ironclads"]],["cart",["pack animals","ox carts","freight trains"]]]);e.set("UNIT_NAMES",$t3047);}
{const $t3048=[1.0,1.04,1.1,1.16,1.24,1.5,1.9,2.3];e.set("LETHALITY",$t3048);}
e.set("tech_names",$fn("tech_names",e,[],[],null,null,[],[],e=>{return $call(e.get("list"),[e.get("T")],$dict([]));return null;}));
e.set("era_of_tech",$fn("era_of_tech",e,["name"],[undefined],null,null,[],[],e=>{return $item($item(e.get("T"),e.get("name")),3);return null;}));
e.set("branch_of",$fn("branch_of",e,["name"],[undefined],null,null,[],[],e=>{return $item($item(e.get("T"),e.get("name")),4);return null;}));
{const $t3049=new PD(((parent)=>{const e=new Env(parent);return (function*(){for(const $t3050 of $iter($call(e.get("enumerate"),[e.get("T")],$dict([])))){{const $t3051=Array.from($iter($t3050));e.set("i",$t3051[0]);e.set("name",$t3051[1]);}yield $tuple([e.get("name"),$bin("Add",e.get("i"),1)]);}})();})(e));e.set("INDEX",$t3049);}
{const $t3052=$dict([]);e.set("_CACHE",$t3052);}
e.set("effects",$fn("effects",e,["owned"],[undefined],null,null,[],[],e=>{{const $t3053=0;e.set("count",$t3053);}
{const $t3054=0;e.set("total",$t3054);}
{const $t3055=0;e.set("squares",$t3055);}
for(const $t3056 of $iter(e.get("owned"))){e.set("name",$t3056);{const $t3057=$call($get(e.get("INDEX"),"get"),[e.get("name")],$dict([]));e.set("i",$t3057);}
if($truth($compare([()=>e.get("i"),()=>null], ["IsNot"]))){e.set("count",$aug("Add",e.get("count"),1));e.set("total",$aug("Add",e.get("total"),e.get("i")));e.set("squares",$aug("Add",e.get("squares"),$bin("Mult",e.get("i"),e.get("i"))));}else{}
}
{const $t3058=$tuple([e.get("count"),e.get("total"),e.get("squares")]);e.set("key",$t3058);}
{const $t3059=$call($get(e.get("_CACHE"),"get"),[e.get("key")],$dict([]));e.set("cached",$t3059);}
if($truth($compare([()=>e.get("cached"),()=>null], ["IsNot"]))){return e.get("cached");}else{}
{const $t3060=$call(e.get("dict"),[e.get("DEFAULT")],$dict([]));e.set("out",$t3060);}
{const $t3061=$dict([["weapon",0],["ship",0],["cart",0]]);e.set("tiers",$t3061);}
for(const $t3062 of $iter($call(e.get("sorted"),[e.get("owned")],$dict([])))){e.set("name",$t3062);{const $t3063=$call($get(e.get("T"),"get"),[e.get("name")],$dict([]));e.set("entry",$t3063);}
if($truth($compare([()=>e.get("entry"),()=>null], ["Is"]))){continue;}else{}
for(const $t3064 of $iter($call($get($item(e.get("entry"),5),"items"),[],$dict([])))){{const $t3065=Array.from($iter($t3064));e.set("k",$t3065[0]);e.set("value",$t3065[1]);}if($truth($compare([()=>e.get("k"),()=>e.get("tiers")], ["In"]))){{const $t3066=$call(e.get("max"),[$item(e.get("tiers"),e.get("k")),e.get("value")],$dict([]));$setitem(e.get("tiers"),e.get("k"),$t3066);}
}else{if($truth($compare([()=>e.get("k"),()=>e.get("MULTIPLIED")], ["In"]))){{const $t3067=$bin("Mult",$item(e.get("out"),e.get("k")),e.get("value"));$setitem(e.get("out"),e.get("k"),$t3067);}
}else{{const $t3068=$bin("Add",$item(e.get("out"),e.get("k")),e.get("value"));$setitem(e.get("out"),e.get("k"),$t3068);}
}
}
}
}
for(const $t3069 of $iter(e.get("ADDED"))){e.set("k",$t3069);{const $t3070=$bin("Div",$item(e.get("out"),e.get("k")),$bin("Add",1,$bin("Div",$item(e.get("out"),e.get("k")),$item(e.get("CEILING"),e.get("k")))));$setitem(e.get("out"),e.get("k"),$t3070);}
}
for(const $t3071 of $iter(e.get("MULTIPLIED"))){e.set("k",$t3071);{const $t3072=$call(e.get("max"),[$item(e.get("FLOOR"),e.get("k")),$item(e.get("out"),e.get("k"))],$dict([]));$setitem(e.get("out"),e.get("k"),$t3072);}
}
$call($get(e.get("out"),"update"),[e.get("tiers")],$dict([]));
{const $t3073=e.get("out");$setitem(e.get("_CACHE"),e.get("key"),$t3073);}
return e.get("out");return null;}));
{const $t3074=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t3075 of $iter(e.get("ERAS"))){e.set("_",$t3075);yield 0;}})();})(e));e.set("ERA_TOTAL",$t3074);}
for(const $t3076 of $iter(e.get("T"))){e.set("_name",$t3076);$setitem(e.get("ERA_TOTAL"),$item($item(e.get("T"),e.get("_name")),3),$aug("Add",$item(e.get("ERA_TOTAL"),$item($item(e.get("T"),e.get("_name")),3)),1));}
{const $t3077=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t3078 of $iter(e.get("ERA_TOTAL"))){e.set("n",$t3078);yield $call(e.get("max"),[3,$call(e.get("int"),[$bin("Add",$bin("Mult",0.34,e.get("n")),0.999)],$dict([]))],$dict([]));}})();})(e));e.set("ERA_NEED",$t3077);}
e.set("era_index",$fn("era_index",e,["owned"],[undefined],null,null,[],[],e=>{{const $t3079=Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t3080 of $iter(e.get("ERAS"))){e.set("_",$t3080);yield 0;}})();})(e));e.set("counts",$t3079);}
for(const $t3081 of $iter(e.get("owned"))){e.set("name",$t3081);{const $t3082=$call($get(e.get("T"),"get"),[e.get("name")],$dict([]));e.set("entry",$t3082);}
if($truth($compare([()=>e.get("entry"),()=>null], ["IsNot"]))){$setitem(e.get("counts"),$item(e.get("entry"),3),$aug("Add",$item(e.get("counts"),$item(e.get("entry"),3)),1));}else{}
}
{const $t3083=0;e.set("era",$t3083);}
for(const $t3084 of $iter($call(e.get("range"),[$call(e.get("len"),[e.get("ERAS")],$dict([]))],$dict([])))){e.set("e",$t3084);if($truth($compare([()=>$item(e.get("counts"),e.get("e")),()=>$item(e.get("ERA_NEED"),e.get("e"))], ["GtE"]))){{const $t3085=e.get("e");e.set("era",$t3085);}
}else{}
}
return e.get("era");return null;}));
e.set("era_name",$fn("era_name",e,["owned"],[undefined],null,null,[],[],e=>{return $item(e.get("ERAS"),$call(e.get("era_index"),[e.get("owned")],$dict([])));return null;}));
e.set("units",$fn("units",e,["owned"],[undefined],null,null,[],[],e=>{{const $t3086=$call(e.get("effects"),[e.get("owned")],$dict([]));e.set("fx",$t3086);}
return $dict([["weapon",$item(e.get("fx"),"weapon")],["ship",$item(e.get("fx"),"ship")],["cart",$item(e.get("fx"),"cart")],["era",$call(e.get("era_index"),[e.get("owned")],$dict([]))],["age",$item(e.get("ERA_GROUP"),$call(e.get("era_index"),[e.get("owned")],$dict([])))],["army",$item($item(e.get("UNIT_NAMES"),"weapon"),$item(e.get("fx"),"weapon"))],["fleet",$item($item(e.get("UNIT_NAMES"),"ship"),$item(e.get("fx"),"ship"))],["wagons",$item($item(e.get("UNIT_NAMES"),"cart"),$item(e.get("fx"),"cart"))]]);return null;}));
e.set("_leads_to",$fn("_leads_to",e,["name", "other"],[undefined,undefined],null,null,[],[],e=>{if($truth($compare([()=>e.get("name"),()=>$item($item(e.get("T"),e.get("other")),0)], ["In"]))){return true;}else{}
for(const $t3087 of $iter($call($get(e.get("ANY"),"get"),[e.get("other"),[]],$dict([])))){e.set("group",$t3087);if($truth($compare([()=>e.get("name"),()=>e.get("group")], ["In"]))){return true;}else{}
}
return false;return null;}));
{const $t3088=new PD(((parent)=>{const e=new Env(parent);return (function*(){for(const $t3090 of $iter(e.get("T"))){e.set("name",$t3090);yield $tuple([e.get("name"),Array.from(((parent)=>{const e=new Env(parent);return (function*(){for(const $t3089 of $iter(e.get("T"))){e.set("other",$t3089);if($truth($call(e.get("_leads_to"),[e.get("name"),e.get("other")],$dict([])))){yield e.get("other");}}})();})(e))]);}})();})(e));e.set("DEPENDENTS",$t3088);}
{const $t3091=3;e.set("MAX_LEAD",$t3091);}
e.set("dependents",$fn("dependents",e,["name"],[undefined],null,null,[],[],e=>{return $item(e.get("DEPENDENTS"),e.get("name"));return null;}));
e.set("met",$fn("met",e,["name", "owned"],[undefined,undefined],null,null,[],[],e=>{if($truth($un("Not",$compare([()=>$item($item(e.get("T"),e.get("name")),0),()=>e.get("owned")], ["LtE"])))){return false;}else{}
for(const $t3092 of $iter($call($get(e.get("ANY"),"get"),[e.get("name"),[]],$dict([])))){e.set("group",$t3092);{const $t3093=false;e.set("found",$t3093);}
for(const $t3094 of $iter(e.get("group"))){e.set("other",$t3094);if($truth($compare([()=>e.get("other"),()=>e.get("owned")], ["In"]))){{const $t3095=true;e.set("found",$t3095);}
}else{}
}
if($truth($un("Not",e.get("found")))){return false;}else{}
}
return true;return null;}));
e.set("researchable",$fn("researchable",e,["owned"],[undefined],null,null,[],[],e=>{{const $t3096=$bin("Add",$call(e.get("era_index"),[e.get("owned")],$dict([])),e.get("MAX_LEAD"));e.set("top",$t3096);}
{const $t3097=[];e.set("out",$t3097);}
for(const $t3098 of $iter(e.get("T"))){e.set("name",$t3098);if($truth($boolop("And",[()=>$compare([()=>e.get("name"),()=>e.get("owned")], ["NotIn"]),()=>$compare([()=>$item($item(e.get("T"),e.get("name")),3),()=>e.get("top")], ["LtE"]),()=>$call(e.get("met"),[e.get("name"),e.get("owned")],$dict([]))]))){$call($get(e.get("out"),"append"),[e.get("name")],$dict([]));
}else{}
}
return e.get("out");return null;}));
e.set("learnable",$fn("learnable",e,["owned", "other"],[undefined,undefined],null,null,[],[],e=>{{const $t3099=$bin("Add",$call(e.get("era_index"),[e.get("owned")],$dict([])),e.get("MAX_LEAD"));e.set("top",$t3099);}
{const $t3100=[];e.set("out",$t3100);}
for(const $t3101 of $iter($call(e.get("sorted"),[e.get("other")],$dict([])))){e.set("name",$t3101);if($truth($boolop("And",[()=>$compare([()=>e.get("name"),()=>e.get("owned")], ["NotIn"]),()=>$compare([()=>e.get("name"),()=>e.get("T")], ["In"]),()=>$compare([()=>$item($item(e.get("T"),e.get("name")),3),()=>e.get("top")], ["LtE"]),()=>$call(e.get("met"),[e.get("name"),e.get("owned")],$dict([]))]))){$call($get(e.get("out"),"append"),[e.get("name")],$dict([]));
}else{}
}
return e.get("out");return null;}));
e.set("choose",$fn("choose",e,["rng", "available", "owned", "need", "era"],[undefined,undefined,undefined,undefined,undefined],null,null,[],[],e=>{{const $t3102=[];e.set("weights",$t3102);}
for(const $t3103 of $iter(e.get("available"))){e.set("name",$t3103);{const $t3104=$item(e.get("T"),e.get("name"));{const $t3105=Array.from($iter($t3104));e.set("_",$t3105[0]);e.set("cost",$t3105[1]);e.set("_",$t3105[2]);e.set("tech_era",$t3105[3]);e.set("branch",$t3105[4]);e.set("_",$t3105[5]);}}
{const $t3106=$bin("Add",1.0,$call($get(e.get("need"),"get"),[e.get("branch"),0.0],$dict([])));e.set("w",$t3106);}
e.set("w",$aug("Add",e.get("w"),$bin("Mult",0.3,$call(e.get("len"),[$call(e.get("dependents"),[e.get("name")],$dict([]))],$dict([])))));if($truth($compare([()=>e.get("tech_era"),()=>$bin("Add",e.get("era"),1)], ["Gt"]))){e.set("w",$aug("Mult",e.get("w"),0.3));}else{if($truth($compare([()=>e.get("tech_era"),()=>e.get("era")], ["Lt"]))){e.set("w",$aug("Mult",e.get("w"),1.3));}else{}
}
e.set("w",$aug("Div",e.get("w"),$bin("Pow",$bin("Div",e.get("cost"),40.0),0.5)));$call($get(e.get("weights"),"append"),[$call(e.get("max"),[0.05,e.get("w")],$dict([]))],$dict([]));
}
return $item($call($get(e.get("rng"),"choices"),[e.get("available"),e.get("weights")],$dict([])),0);return null;}));
e.set("reason",$fn("reason",e,["branch"],[undefined],null,null,[],[],e=>{return $item($dict([["agriculture","to feed its people"],["industry","to improve its workshops"],["warfare","to strengthen its army"],["seafaring","to master the sea"],["trade","to grow its commerce"],["knowledge","to advance learning"],["medicine","to protect its people's health"],["governance","to govern better"],["energy","to power its workshops"],["construction","to build bigger and safer"],["culture","to enrich its culture"]]),e.get("branch"));return null;}));
e.set("validate",$fn("validate",e,[],[],null,null,[],[],e=>{{const $t3107=[];e.set("problems",$t3107);}
for(const $t3108 of $iter($call($get(e.get("T"),"items"),[],$dict([])))){{const $t3109=Array.from($iter($t3108));e.set("name",$t3109[0]);{const $t3110=Array.from($iter($t3109[1]));e.set("needs",$t3110[0]);e.set("cost",$t3110[1]);e.set("blurb",$t3110[2]);e.set("era",$t3110[3]);e.set("branch",$t3110[4]);e.set("fx",$t3110[5]);}}{const $t3111=$call(e.get("list"),[e.get("needs")],$dict([]));e.set("every",$t3111);}
for(const $t3112 of $iter($call($get(e.get("ANY"),"get"),[e.get("name"),[]],$dict([])))){e.set("group",$t3112);$call($get(e.get("every"),"extend"),[e.get("group")],$dict([]));
}
for(const $t3113 of $iter(e.get("every"))){e.set("n",$t3113);if($truth($compare([()=>e.get("n"),()=>e.get("T")], ["NotIn"]))){$call($get(e.get("problems"),"append"),[($fmt(e.get("name"),-1,null)+" needs unknown "+$fmt(e.get("n"),-1,null))],$dict([]));
}else{if($truth($compare([()=>$item($item(e.get("T"),e.get("n")),3),()=>e.get("era")], ["Gt"]))){$call($get(e.get("problems"),"append"),[($fmt(e.get("name"),-1,null)+" (era "+$fmt(e.get("era"),-1,null)+") needs "+$fmt(e.get("n"),-1,null)+" from era "+$fmt($item($item(e.get("T"),e.get("n")),3),-1,null))],$dict([]));
}else{}
}
}
if($truth($compare([()=>e.get("branch"),()=>e.get("BRANCHES")], ["NotIn"]))){$call($get(e.get("problems"),"append"),[($fmt(e.get("name"),-1,null)+" has unknown branch "+$fmt(e.get("branch"),-1,null))],$dict([]));
}else{}
}
return e.get("problems");return null;}));
});
export {$import,$call,$get};