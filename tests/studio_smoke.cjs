'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const E=require('../studio-engine.js');
assert.equal(E.MODES.length,10);
assert.equal(new Set(E.MODES.map(x=>x.id)).size,10);
for(const d of E.MODES){
  assert(d.formula.length>5);
  const scene=E.createScene(d.id);
  for(let i=0;i<280;i++){
    const metric=scene.step(.02);
    assert(Number.isFinite(metric.value),d.id+' nonfinite at step '+i);
  }
  const s=scene.snapshot();
  assert(s.time>5,'Time failed: '+d.id);
  assert(s.history.length>40,'History missing: '+d.id);
  assert(s.history.every(pair=>pair.every(Number.isFinite)),'Bad history: '+d.id);
  console.log('PASS',d.id,s.metric.name,s.metric.value.toFixed(6));
}
for(const id of ['pendulum','gravity']){
  const scene=E.createScene(id);
  for(let i=0;i<600;i++)scene.step(.015);
  assert(scene.snapshot().metric.value<1,'Unexpected energy drift in '+id);
}
const q=E.createScene('bloch');
for(let i=0;i<500;i++)q.step(.02);
assert(Math.abs(q.snapshot().metric.value-Math.sin(1.2))<1e-10,'Bloch coherence invariant failed');
for(const name of ['studio.html','studio.css','studio-engine.js','studio.js']){
  assert(fs.existsSync(path.join(__dirname,'..',name)),name+' missing');
}
console.log('PASS: ten simulation engines and required assets');
