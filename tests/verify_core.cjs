'use strict';const assert=require('node:assert/strict');global.window=global.window||{};require('../data-pantheonplus.js');const V=require('../verify-core.js');
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
// 6. Supernovae: acceleration; matter-only and empty universes far worse
const d=V.sneData(window.PANTHEON_PLUS,0.01),sf=V.sneFit(d);assert(sf.Om>0.25&&sf.Om<0.42,'Om '+sf.Om);assert(V.sneChi2(d,1).chi2-sf.chi2>300);assert(V.sneChi2(d,0,true).chi2-sf.chi2>10);
assert(Math.abs(V.ageGyr(67.4,0.315)-13.8)<0.1);
// 7. Hydrogen: Rydberg within 50 ppm, lines within 10 ppm; p != 2 fails
const hb=V.balmerFit(2);assert(Math.abs(hb.R/V.R_H-1)<5e-5);assert(hb.rmsppm<10);assert(V.balmerFit(2.1).rmsppm>1000);
// 8. Light bending: GR fits, Newton excluded
assert(V.lightChi2(1)<11);assert(V.lightChi2(0)>1e6);
// 9. Climate: Earth Teq ~254 K, Mars within 5%, Venus needs >50 layers
const cl=V.climate();assert(Math.abs(cl[1].te-254)<3);assert(Math.abs(cl[2].err)<0.05);assert(cl[0].layers>50);
// 10. Population: logistic beats exponential
const pm=V.popModels();assert(pm.logistic.loss<pm.exp.loss);assert(pm.logistic.K>9&&pm.logistic.K<30);
// 11. Regge: alpha' ~0.8-0.95 GeV^-2
const rg=V.regge(2);assert(rg.alphaP>0.8&&rg.alphaP<0.95);
// 12. LIV: linear bound above Planck
assert(V.livBound(1)/V.E_PLANCK>1);assert(V.livDelay(31,0.903,V.E_PLANCK,1)>0.859);
// 13. Area theorem holds for all mergers
assert(V.areaTest(0).every(r=>r.ratio>1));
// 14. ADD: n=2, 1 TeV gives sub-mm R (~0.5 mm) excluded; n=1 astronomically large
assert(Math.abs(V.addModel(2,1).R-4.8e-4)<1e-4);assert(!V.addModel(2,1).allowed);assert(V.addModel(1,1).R>1e9);assert(V.addModel(3,1).allowed);
console.log('OK: Toy→Reality core — T='+p.T.toFixed(5)+' K, Mercury '+t[0].gr.toFixed(2)+'″/cy, Kepler slope '+k.fit.b.toFixed(5)+', LV loss '+f.f.toFixed(2)+', OFC b '+b1.toFixed(2)+'→'+b2.toFixed(2)+'.');
