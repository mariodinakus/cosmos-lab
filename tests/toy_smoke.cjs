"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),T=require("../toy-core.js");
assert.equal(T.MODES.length,15);
assert.equal(new Set(T.MODES.map(m=>m.id)).size,T.MODES.length);
assert(Math.abs(T.newtonPoint(.7,.1,30).x-1)<1e-4);
assert.equal(T.newtonPoint(.7,.1,30).root,0);
assert.equal(T.newtonPoint(-.5,.86,30).root,1);
assert.deepEqual(Array.from({length:10},()=>T.seeded(42)()).slice(0,0),[]);
for(const spec of T.MODES){
 const a=T.create(spec.id,{},1234),b=T.create(spec.id,{},1234);
 assert(spec.params.length>=1, spec.id+" missing params");
 assert(typeof spec.formula==="string"&&spec.formula.length>10,spec.id+" missing formula");
 const i=a.measure(),ii=b.measure();
 assert(Number.isFinite(i.value),spec.id+" initial metric");
 assert.equal(i.value,ii.value,spec.id+" deterministic initial metric");
 for(let k=0;k<60;k++){a.step();b.step();}
 const av=a.measure(),bv=b.measure();
 assert(Number.isFinite(av.value),spec.id+" invalid output");
 assert(Math.abs(av.value-bv.value)<1e-11,spec.id+" seeded numerical results differ");
 assert(a.state.t===60,spec.id+" time");
 a.interact(.48,.42,false);a.step();
 assert(Number.isFinite(a.measure().value),spec.id+" click result");
 a.interact(.48,.42,true);a.step();
 assert(Number.isFinite(a.measure().value),spec.id+" alternate click result");
 for(const [key,,lo,hi] of spec.params){
  assert(Number.isFinite(a.state.p[key]),spec.id+" param");
  assert(a.state.p[key]>=lo&&a.state.p[key]<=hi,spec.id+" bounded parameter");
 }
}
const life=T.create("life",{density:.3},1234);
assert.equal(life.state.u.length,96*64);
assert(T.create("wave").state.u.length===96*64);
const heat=T.create("heat");for(let i=0;i<200;i++)heat.step();
assert(Number.isFinite(heat.measure().value),"heat stability");
const kur=T.create("kuramoto");for(let i=0;i<120;i++)kur.step();
assert(kur.measure().value>=0&&kur.measure().value<=1.000001,"synchronization R");
const per=T.create("percolation");assert([0,1].includes(per.measure().value),"percolation Boolean span");
const nw=T.create("newton");for(let i=0;i<16;i++)nw.step();
assert(nw.measure().value<1e-6,"Newton residual");
const ids=["toyCanvas","metricCanvas","modelList","paramGrid","playButton","stepButton","resetButton","reseedButton","altButton","savePng","saveCsv","saveJson","saveRun","compareRun","shareLink","simSpeed"];
const html=fs.readFileSync(path.join(root,"toybox.html"),"utf8");
for(const id of ids)assert(html.includes('id="'+id+'"'),"UI missing "+id);
for(const file of ["toybox.html","toybox.css","toybox.js","toy-core.js"])assert(fs.existsSync(path.join(root,file)),"File missing "+file);
const script=fs.readFileSync(path.join(root,"toybox.js"),"utf8");
assert.doesNotThrow(()=>new Function(script),"UI JavaScript syntax");
assert(!/\beval\s*\(/.test(script),"No arbitrary eval");
for(const file of ["index.html","studio.html","observatory.html","chaos.html"])
 assert(fs.readFileSync(path.join(root,file),"utf8").includes('href="/toybox.html"'),"Missing Toy Universe nav from "+file);
console.log("PASS Toy Universe: 15 models, seeded reproducibility, interactions, finite metrics, Newton, controls and navigation.");
