'use strict';const assert=require('node:assert/strict');const G=require('../genesis-core.js');
const near=(a,b,tol,msg)=>assert(Math.abs(a-b)<=tol,`${msg}: got ${a}, expected ${b}±${tol}`);
// 1. Friedmann: matter+Lambda closed form vs numerical integral (radiation off)
let p=G.params({H0:67.4,Om:0.315,OL:0.685,Or:0});
const closed=2/(3*Math.sqrt(p.OL))*Math.asinh(Math.sqrt(p.OL/p.Om))*G.H0_TO_INV_GYR/p.H0;
near(G.ageGyr(p),closed,2e-3,'age numeric vs closed form');
near(G.flatLcdmA(p,closed),1,1e-9,'a(t0)=1');
p=G.params({H0:67.4,Om:0.315,OL:0.685});near(G.ageGyr(p),13.8,0.15,'flat LCDM age with radiation');
const ep=G.epochs(p);near(ep.zEq,3400,350,'matter-radiation equality z');near(ep.zAcc,0.63,0.05,'acceleration onset z');
const tab=G.expansionTable(p);const j=tab.findIndex(r=>r.a>=1),r0=tab[j-1],r1=tab[j],fr=(0-Math.log(r0.a))/(Math.log(r1.a)-Math.log(r0.a));near(r0.tGyr+fr*(r1.tGyr-r0.tGyr),G.ageGyr(p),0.03,'table t(a=1) matches age');
// 2. Slow roll phi^2 and Starobinsky
const pw=G.POTENTIALS.power(2),run=G.inflationRun(pw,16);near(run.Nend,63.5,1.2,'phi^2 total e-folds');
const pr=G.predict(pw,run,60);near(pr.ns,0.967,0.004,'phi^2 ns');near(pr.r,0.132,0.01,'phi^2 r');
const st=G.POTENTIALS.starobinsky(),rs=G.inflationRun(st,5.5),ps=G.predict(st,rs,55);assert(ps);near(ps.ns,0.964,0.006,'Starobinsky ns');assert(ps.r<0.01,'Starobinsky r small');
// 3. Stochastic inflation
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const gauss=r=>{let u=0;while(u===0)u=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*r());};
const quiet=G.ensemble({Vs:1e-30,p:2,phi0:10,n:20,Nmax:500,dN:0.05},mulberry(1),gauss);near(quiet.Nexit[0],(100-2)/4,0.4,'noise-free e-folds');
near(G.eternalThreshold(0.5*(6e-6)**2,2),2265,40,'eternal-inflation threshold phi (m=6e-6)');
const hot=G.ensemble({Vs:0.5*0.01**2,p:2,phi0:80,n:60,Nmax:1500,dN:0.25},mulberry(7),gauss);assert(hot.capped>0,'eternal regime leaves patches that never exit');
const vs=G.volumeStats(G.ensemble({Vs:0.5*0.01**2,p:2,phi0:40,n:200,Nmax:1500,dN:0.25},mulberry(3),gauss).Nexit);assert(vs.share1>0&&vs.share1<=1,'volume share valid');
// 4. de Sitter entropy
const S=G.dsEntropyToday(0.674,0.685);assert(S>1e122&&S<1e123,'dS entropy today ~1e122: '+S);
near(G.wavefunctionWeights(100).log10HH,-G.wavefunctionWeights(100).log10Vilenkin,1e-12,'HH and Vilenkin exponents are opposite');
near(G.dsEntropyFromScale(G.M_PL_GEV*0.1),24*Math.PI**2*1e4,1,'dS entropy at rho=0.1 M');
// 5. bubble
const b=G.bubble(1,1);near(b.B,27*Math.PI**2/2,1e-9,'thin-wall B');near(b.Rc,3,1e-12,'critical radius');
console.log('OK: genesis core — Friedmann, slow roll, stochastic inflation, dS entropy, bubble nucleation.');
