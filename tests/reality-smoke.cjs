"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const C=require("../reality-core.js"),root=path.resolve(__dirname,"..");
assert.equal(C.MODULES.length,10);
assert.equal(new Set(C.MODULES.map(m=>m.id)).size,10);
for(const mod of C.MODULES){assert(mod.what.length>45&&mod.limit.length>45,mod.id+" requires explicit evidence limitations");
 const a=C.create(mod.id,{},8765),b=C.create(mod.id,{},8765);
 for(let i=0;i<85;i++){a.step();b.step();}
 assert(Number.isFinite(a.metric().value),mod.id+" finite metric");
 assert(Math.abs(a.metric().value-b.metric().value)<1e-10,mod.id+" deterministic seed");
 a.interact(.48,.52);assert(Number.isFinite(a.metric().value),mod.id+" finite after click");
 for(const [key,,min,max]of mod.params){assert(a.state.p[key]>=min&&a.state.p[key]<=max,mod.id+" bounded "+key);}
}
const sine=C.syntheticData(1234,.06,1.4),ranking=C.rankModels(sine,3);
assert(ranking.length>=5);
assert.equal(ranking[0].name,"sinusoid","sine recovery in correctly specified library");
assert(ranking[0].testRMSE<.13);
assert.equal(C.parseCSV("x,y\\n0,1\\n1,2\\n2,3\\n3,4\\n4,5\\n5,6\\n6,7\\n7,8\\n8,9\\n9,10\\n10,11\\n11,12".replaceAll("\\n","\n")).length,12);
assert.throws(()=>C.parseCSV("a,b\n0,1\n0,2\n1,3\n2,4\n3,5\n4,6\n5,7\n6,8\n7,9\n8,10\n9,11\n10,12"),/Duplicate/);
assert.throws(()=>C.parseCSV("x,y\n0,1\ninvalid,wat\n1,2"),/Invalid/);
const q=C.create("quantum");assert.equal(q.metric().value,0);
q.act("H0");q.act("CNOT");assert(Math.abs(q.metric().value-1)<1e-10,"Bell state has one ebit");
for(const gate of ["H1","X0","RZ0","RX1","CNOT","MEASURE","BELL"]){q.act(gate);const total=q.state.amp.reduce((z,a)=>z+a.r*a.r+a.i*a.i,0);assert(Math.abs(total-1)<1e-10,"quantum gates unitary / normalized "+gate);}
const orbitFar=C.rkSchwarzschild(20,1),orbitNear=C.rkSchwarzschild(5,1);
assert(orbitFar.escaped&&orbitNear.escaped);
assert(orbitFar.alpha>0&&orbitNear.alpha>orbitFar.alpha,"light deflection increases toward photon sphere");
assert(orbitFar.points.length>20);
const fail=C.create("break",{dt:.15,k:2});for(let i=0;i<100;i++)fail.step();
assert(fail.metric().value>0,"Euler error nonzero");
const inferred=C.estimateK(C.oscillatorSeries(2.1,.03,1234),140);
assert(Math.abs(inferred.best.k-2.1)<.07,"recover known toy spring coefficient");
const t=C.create("tournament",{},77,sine);assert(t.state.imported&&t.state.rows.length===100);
assert.equal(t.state.ranking[0].name,"sinusoid");
const initialA=C.create("initial",{},123),initialB=C.create("initial",{},123);
for(let i=0;i<25;i++){initialA.step();initialB.step();}
assert.deepEqual(initialA.field(),initialB.field());
const emerge=C.create("emergent",{disorder:0,strength:.5,shortcuts:0},123);
assert(emerge.metric().value>=0);
const doc=fs.readFileSync(path.join(root,"reality.html"),"utf8");
for(const id of ["worldCanvas","chartCanvas","modelList","paramList","play","step","reset","reseed","saveA","compareB","csvFile","downloadCsv","downloadJson","downloadPng","share"])
 assert(doc.includes('id="'+id+'"'),"Missing interactive control "+id);
assert.doesNotThrow(()=>new Function(fs.readFileSync(path.join(root,"reality.js"),"utf8")));
for(const f of ["reality-core.js","reality.js","reality.css","reality.html"])assert(fs.existsSync(path.join(root,f)),f+" missing");
for(const f of ["index.html","studio.html","observatory.html","chaos.html","toybox.html","frontier.html","gravity.html"])assert(fs.readFileSync(path.join(root,f),"utf8").includes('href="/reality.html"'),"No integration in "+f);
const vercel=JSON.parse(fs.readFileSync(path.join(root,"vercel.json"),"utf8"));
assert(vercel.rewrites.some(x=>x.source==="/reality"&&x.destination==="/reality.html"));
console.log("PASS Reality Engine: 10 modules, seeded reproducibility, imports, fitting, Schwarzschild, quantum gates, sweeps, UI and navigation");
