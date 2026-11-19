"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const dir=path.resolve(__dirname,".."),load=x=>fs.readFileSync(path.join(dir,x),"utf8");
const C=require("../open-core.js");
assert.equal(C.SPECS.length,13);
assert.equal(C.DOMAINS.length,6);
assert.equal(C.QUESTIONS.length,31);
assert.equal(new Set(C.SPECS.map(x=>x.id)).size,13);
assert.deepEqual([...new Set(C.QUESTIONS.map(x=>x.domain))].sort(),["biology","chemistry","economics","math","physics","psychology"].sort());
for(const spec of C.SPECS){
 const a=C.create(spec.id,{},12345),b=C.create(spec.id,{},12345);
 for(let i=0;i<150;i++){a.step();b.step();}
 assert(Number.isFinite(a.metric().value),spec.id+" invalid metric");
 assert.equal(a.metric().value,b.metric().value,spec.id+" deterministic model");
 assert(a.state.history.length>2,spec.id+" history missing");
 a.interact(.33,.52);
 assert(Number.isFinite(a.metric().value),spec.id+" invalid after click");
 assert(spec.description.length>25&&spec.limit.length>40,spec.id+" lacks caveat");
 for(const [key,,min,max]of spec.params)assert(a.state.p[key]>=min&&a.state.p[key]<=max,spec.id+" unbounded "+key);
}
const dormant=C.create("universe",{chance:.2,threshold:1},12);
for(let i=0;i<350;i++)dormant.step();
assert.equal(dormant.state.active,false,"activation threshold should affect toy behavior");
const collatz=C.create("collatz",{n:27},12);
for(let i=0;i<115;i++)collatz.step();
assert(collatz.state.finished&&collatz.state.value===1,"Collatz toy 27 reaches 1");
assert.equal(collatz.state.sequence.length,112);
const chemical=C.create("reaction",{},42);
for(let i=0;i<150;i++)chemical.step();
assert.equal(chemical.state.v.length,55*55);
assert([...chemical.state.v].every(Number.isFinite),"reaction diffusion finite");
const life=C.create("autocatalysis",{},27);
for(let i=0;i<80;i++)life.step();
assert(life.state.B>0&&life.state.A>=0,"autocatalysis simulation");
const memory=C.create("memory",{},5);
for(let i=0;i<80;i++)memory.step();
const before=memory.state.memory;memory.interact(.5,.4);
assert(memory.state.memory>before&&memory.state.recalls===1,"recall interaction");
const genes=C.create("genetics",{pop:10,selection:0,mutation:0},120);
for(let i=0;i<300;i++){genes.step();assert(genes.state.frequency>=0&&genes.state.frequency<=1,"allele frequency bound");}
const q=C.create("workspace",{threshold:1},7);
for(let i=0;i<70;i++)q.step();
assert(q.metric().value>=0&&q.metric().value<=25,"broadcast count in bounds");
const names=["world","chart","modelList","modelFilter","domainTabs","questionCards","paramControls","play","step","reseed","reset","exportJson","exportCsv","share"];
for(const id of names)assert(load("open.html").includes('id="'+id+'"'),"Missing UI "+id);
assert.doesNotThrow(()=>new Function(load("open.js")),"UI syntax");
assert(!load("open.js").includes("innerHTML"),"Untrusted question data must not use innerHTML");
const w={window:{}};vm.runInNewContext(load("hub-catalog.js"),w);
const all=w.window.COSMOS_HUB_MODELS;
assert.equal(all.length,54,"full hub includes preexisting models + 13 open toys");
const entries=all.filter(q=>q.category==="open");assert.equal(entries.length,13);
for(const m of C.SPECS){const q=entries.find(x=>x.id===m.id);assert(q);assert.equal(q.href,"/open.html?model="+m.id);}
for(const name of ["hub.html","index.html","radar.html","reality.html","gravity.html","frontier.html","toybox.html","chaos.html","studio.html","observatory.html"])assert(load(name).includes('href="/open.html"'),"No open problems navigation "+name);
for(const source of ["/open","/open-problems"])assert(JSON.parse(load("vercel.json")).rewrites.some(x=>x.source===source&&x.destination==="/open.html"),"Missing route "+source);
console.log("PASS Open Problems: 13 finite reproducible toy models; 31 open questions, 6 domains, 54-model hub, mobile UI and navigations");
