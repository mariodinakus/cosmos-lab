'use strict';const assert=require('node:assert/strict');const V=require('../verify-core.js');
// 1. Planck's law reproduces the FIRAS monopole; classical laws fail
const p=V.fitCMB('planck');assert(Math.abs(p.T-2.725)<2e-4,'T '+p.T);assert(p.chi2/p.dof<2,'planck chi2/dof '+p.chi2/p.dof);
assert(V.fitCMB('wien').chi2/42>1e4);assert(V.fitCMB('rj').chi2/42>1e6);
assert(Math.abs(V.radiance(2.27,2.725)-200.723+0.005)<0.02,'radiance at 2.27');
// 2. Perihelion: integrator matches 6piGM/(c^2 a(1-e^2)); Mercury ~42.98"/cy within 1 sigma of observation
const t=V.perihelionTable();for(const r of t){assert(Math.abs(r.gr-r.analytic)/r.analytic<1e-3,r.name+' numeric vs analytic');assert(Math.abs(r.numErr)<1e-3,r.name+' newton drift');assert(Math.abs(r.pull)<2,r.name+' pull '+r.pull);}
assert(Math.abs(t[0].gr-42.98)<0.02,'Mercury '+t[0].gr);
// 3. Kepler: slope 1.5, Sun and Jupiter masses
const k=V.kepler(2);assert(Math.abs(k.fit.b-1.5)<1e-3);assert(Math.abs(k.Msun/1.989e30-1)<2e-3,'Msun');assert(Math.abs(k.Mjup/1.898e27-1)<3e-3,'Mjup');assert(V.kepler(3).rmsLog>0.1);
// 4. Lotka-Volterra beats constant populations by a wide margin
const f=V.fitLV(400);assert(f.f<0.25*V.lvBaseline(),'LV loss '+f.f);
// 5. OFC: dissipation steepens the distribution; conservative limit is flatter
const b1=V.ofcB(V.ofc(24,0.17,3000,3),4).b,b2=V.ofcB(V.ofc(24,0.23,3000,3),4).b;assert(b1>b2,'b(alpha) decreasing '+b1+' '+b2);
// Aki b on a synthetic exponential catalogue with b = 1
let s=12345;const r=()=>{s=(s*1103515245+12345)%2147483648;return s/2147483648;};const m=[];for(let i=0;i<20000;i++)m.push(Math.round((3.95-Math.log10(1-r()))*10)/10);
const bb=V.bValue(m,4,0.1);assert(Math.abs(bb.b-1)<0.05,'synthetic b '+bb.b);
console.log('OK: Toy→Reality core — T='+p.T.toFixed(5)+' K, Mercury '+t[0].gr.toFixed(2)+'″/cy, Kepler slope '+k.fit.b.toFixed(5)+', LV loss '+f.f.toFixed(2)+', OFC b '+b1.toFixed(2)+'→'+b2.toFixed(2)+'.');
