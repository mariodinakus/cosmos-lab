"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const F=require("../frontier-core.js"),root=path.resolve(__dirname,"..");
assert.equal(F.MODES.length,13);
assert.equal(new Set(F.MODES.map(x=>x.id)).size,10);
for(const spec of F.MODES){
 const a=F.make(spec.id,{},12345),b=F.make(spec.id,{},12345);
 assert(spec.title.length>8, spec.id+" title");
 assert(spec.what.length>30&&spec.limit.length>40,spec.id+" guardrails missing");
 assert(spec.params.every(([key,,min,max])=>a.state.p[key]>=min&&a.state.p[key]<=max),spec.id+" bounded params");
 assert(Number.isFinite(a.metric().value),spec.id+" initial numeric metric");
 for(let i=0;i<90;i++){a.step();b.step();}
 assert(Number.isFinite(a.metric().value),spec.id+" nonfinite post-step");
 assert(Math.abs(a.metric().value-b.metric().value)<1e-10,spec.id+" seeded determinism");
 a.interact(.35,.55,false);a.step();assert(Number.isFinite(a.metric().value),spec.id+" interaction invalid");
 assert(a.state.step===91,spec.id+" incorrect step count");
}
assert.equal(F.ruleStep(Uint8Array.from([0,0,0,1,0,0,0]),90)[2],1,"elementary CA 90 neighborhood");
const p=F.make("intervene",{},1111),initial=p.metric().value;assert.equal(initial,0);
p.interact(.4,.5);assert(p.metric().value>0,"manual intervention should change one world");
assert.equal(F.transmission(.9,3,0,1),1,"barrier zero width");
assert(F.transmission(.8,3,1,1)>0&&F.transmission(.8,3,1,1)<1,"below barrier tunnelling");
assert(Math.abs(F.transmission(2,2,1,1)-.5)<1e-10,"barrier at threshold");
assert(Math.abs(F.gup(2,.5)-2)<1e-12,"GUP formula");
assert.equal(F.gup(-1,1),NaN);
assert(Math.abs(F.gup(.5,1)-1)<1e-12);
assert(Math.abs(F.gravityQuantum(Math.SQRT1_2).ratio-1)<1e-12);
assert(Math.abs(F.correlate(0,1,1)-1)<1e-12);
assert(F.correlate(6,.7,1)<F.correlate(3,.7,1));
assert(Math.abs(F.gauge(Math.log10(91.1876))[0]-59.01924)<1e-3,"SU(5) alpha1 normalization");
const sm=F.gauge(16);assert(sm.every(Number.isFinite));
const smSpread=Math.max(...sm)-Math.min(...sm);assert(smSpread>1,"SM one-loop running does not exactly unify");
const empty=F.make("vacuum");for(let i=0;i<100;i++)empty.step();assert.equal(empty.state.count,100);
assert(empty.state.samples.length===100);
const infl=F.make("inflation");const phi0=infl.state.phi;for(let i=0;i<20;i++)infl.step();
assert(infl.state.N>0&&infl.state.phi<phi0);
const entropy=F.make("entropy");for(let i=0;i<200;i++)entropy.step();
assert(entropy.metric().value>=0&&entropy.metric().value<=1.000001);

const bary=F.make("baryogenesis",{},712);
for(let i=0;i<110;i++)bary.step();
assert(bary.metric().value>0,"positive source generates positive proxy");
assert(bary.state.X<1,"decaying parent abundance");
for(const overrides of [{epsilon:0},{violation:0},{departure:0}]){
 const closed=F.make("baryogenesis",overrides);
 for(let i=0;i<100;i++)closed.step();
 assert(Math.abs(closed.metric().value)<1e-12,"Missing Sakharov source ingredient: "+JSON.stringify(overrides));
}
const flipped=F.make("baryogenesis",{epsilon:-.12});for(let i=0;i<90;i++)flipped.step();
assert(flipped.metric().value<0,"sign of CP-asymmetry source");
const noEnvironment=F.make("decoherence",{gamma:0,omega:1});
for(let i=0;i<100;i++)noEnvironment.step();
assert.equal(noEnvironment.metric().value,1,"coherence preserved with gamma=0");
const deco=F.make("decoherence",{gamma:.6,omega:2});for(let i=0;i<130;i++)deco.step();
assert(deco.metric().value<.002,"dephasing suppresses coherence");
deco.interact(.65,.3);assert(deco.state.phase0>0&&deco.state.time===0,"phase reset");
deco.step();assert(deco.state.phase>deco.state.phase0,"phase rotates after click");
const bell=F.make("bell",{visibility:1,shots:20},10);
for(let i=0;i<400;i++)bell.step();
const empirical=bell.metric().value,Tsirelson=2*Math.SQRT2;
assert(Math.abs(empirical-Tsirelson)<.07,"Large-sample CHSH matches ideal quantum prediction");
assert.equal(bell.state.measured.total,400*4*20);
const whiteNoise=F.make("bell",{visibility:0,shots:20},10);
for(let i=0;i<400;i++)whiteNoise.step();
assert(Math.abs(whiteNoise.metric().value)<.12,"No correlation when visibility vanishes");
bell.interact(.99,.5);assert.equal(bell.state.focus,3,"pair focus selection");

const page=fs.readFileSync(path.join(root,"frontier.html"),"utf8");
for(const id of ["modeList","world","chart","parameters","play","step","reset","reseed","nothingSelect","positionDescription","metric","share","exportCsv","exportPng"])assert(page.includes('id="'+id+'"'),id+" missing");
const js=fs.readFileSync(path.join(root,"frontier.js"),"utf8");assert.doesNotThrow(()=>new Function(js));
assert(page.includes("Physical")||page.includes("physical"));
for(const file of ["frontier.html","frontier.css","frontier.js","frontier-core.js"])assert(fs.existsSync(path.join(root,file)),"missing "+file);
for(const file of ["index.html","toybox.html","chaos.html","observatory.html","studio.html"]){
 const src=fs.readFileSync(path.join(root,file),"utf8");assert(src.includes('href="/frontier.html"'),"Missing navigation from "+file);
}
console.log("PASS: 13 Frontier Questions models, deterministic calculations, epistemic labels, source references, interactions, chart scripts and navigation");
