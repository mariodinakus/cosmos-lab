'use strict';const assert=require('node:assert/strict'),fs=require('fs');
global.window={};eval(fs.readFileSync(__dirname+'/../data-pantheonplus.js','utf8'));const P=window.PANTHEON_PLUS,D=require('../data-core.js');
assert.equal(P.rows.length,1701);assert.equal(P.meta.n,1701);
const d=D.fromPantheon(P,0.01);assert(d.zhd.length>1500&&d.zhd.length<1600,'N after cuts '+d.zhd.length);
// comoving distance: low-z Hubble law and a closed form for the empty/Einstein-de Sitter limit
let T=D.comovingTable(1,-1);const z=1,edsD=2*(1-1/Math.sqrt(1+z));assert(Math.abs(D.Dc(T,z)-edsD)<1e-5,'EdS D_C(z=1)');
T=D.comovingTable(0.3,-1);assert(Math.abs(D.Dc(T,0.01)-0.01)<1e-4,'Hubble law at low z');
// fit: LCDM Omega_m close to the published 0.334 (diagonal errors only, so allow a wide window)
const Oms=D.linspace(0.05,0.7,66),ws=D.linspace(-2,-0.2,73);
const L=D.fitLcdm(d,Oms);assert(L.best.Om>0.26&&L.best.Om<0.40,'LCDM Om '+L.best.Om);
const S=D.scan(d,Oms,ws);assert(S.best.w>-1.3&&S.best.w<-0.6,'wCDM w '+S.best.w);
const eds=D.chi2(1,-1,d).chi2;assert(eds-L.best.chi2>100,'Einstein-de Sitter strongly disfavoured, dchi2='+(eds-L.best.chi2));
assert(S.best.chi2<=L.best.chi2+1e-6,'wCDM nests LCDM');
// offset marginalisation: shifting all magnitudes must not change chi2
const sh={...d,m:d.m.map(x=>x+0.37)};assert(Math.abs(D.chi2(.33,-1,sh).chi2-D.chi2(.33,-1,d).chi2)<1e-6,'offset invariance');
console.log('OK: data core — LCDM Om='+L.best.Om.toFixed(3)+' ('+L.lo.toFixed(3)+'–'+L.hi.toFixed(3)+'), wCDM best (Om='+S.best.Om.toFixed(2)+', w='+S.best.w.toFixed(2)+'), chi2='+L.best.chi2.toFixed(1)+' for N='+d.zhd.length+'; EdS dchi2='+(eds-L.best.chi2).toFixed(0));
