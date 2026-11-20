'use strict';const assert=require('node:assert/strict');const R=require('../riemann-core.js');
const zs=R.findZeros(10,300,0.04);
// published zeros (Odlyzko), cross-checked against mpmath.zetazero
R.KNOWN.forEach((k,i)=>assert(Math.abs(zs[i]-k)<1e-9,'zero '+(i+1)+' off by '+Math.abs(zs[i]-k)));
// exact counts of zeros with 0 < gamma <= T
const N=T=>zs.filter(z=>z<=T).length;assert.equal(N(100),29);assert.equal(N(200),79);assert.equal(N(300),138);
// Riemann–von Mangoldt: N(T) = theta(T)/pi + 1 + S(T), |S(T)| small at this height
for(const T of [100,200,299.5]){assert(Math.abs(N(T)-R.Nsmooth(T))<1.6,'N(T) vs smooth at '+T+': '+N(T)+' vs '+R.Nsmooth(T));}
// Z(t) is real and |Z| = |zeta| on the critical line
for(const t of [20.3,77.7,150.1]){assert(Math.abs(Math.abs(R.Z(t))-R.absZeta(t))<1e-9);}
// zeta(2)-type sanity through the same code path (sigma=1/2 only is the product use; check sigma=0.5, t=0 -> zeta(1/2)=-1.4603545088)
assert(Math.abs(R.zeta(.5,0).re+1.4603545088095868)<1e-10);
// spacing statistics: level repulsion, mean ~1, variance far below Poisson (1.0), near GUE (~0.18)
const sp=R.spacings(R.findZeros(100,600,0.04)),mean=sp.reduce((a,b)=>a+b,0)/sp.length,v=sp.reduce((a,b)=>a+(b-mean)**2,0)/sp.length;
assert(Math.abs(mean-1)<0.06,'mean spacing '+mean);assert(v>0.1&&v<0.3,'spacing variance '+v);assert(sp.filter(s=>s<0.2).length/sp.length<0.06,'level repulsion');
console.log('OK: Riemann core — 10 published zeros, exact N(100)=29 and N(200)=79, N(T) smooth law, Z real, GUE-like spacings (var '+v.toFixed(3)+').');
