/* COSMOS LAB Genesis core: Friedmann expansion, slow-roll inflation, stochastic (eternal) inflation,
   de Sitter entropy / wave-function weights, and thin-wall vacuum-bubble nucleation.
   Units: reduced Planck mass M = 1 for inflation modules. All results are model calculations. */
(function(root){"use strict";
const H0_TO_INV_GYR=977.792;           // 1/(km s^-1 Mpc^-1) in Gyr
const M_PL_GEV=2.435e18;               // reduced Planck mass, GeV
const H100_GEV=2.1332e-42;             // 100 km/s/Mpc in GeV (hbar=c=1)

/* ---------- 1. Friedmann expansion: H^2/H0^2 = Or a^-4 + Om a^-3 + Ok a^-2 + OL ---------- */
function params(o){const Om=o.Om,OL=o.OL,Or=o.Or??9.2e-5;return{H0:o.H0,Om,OL,Or,Ok:1-Om-OL-Or};}
/* a*E(a) = sqrt(Or/a^2 + Om/a + Ok + OL a^2); dimensionless da/dtau with tau = H0 t */
function aE(a,p){const v=p.Or/(a*a)+p.Om/a+p.Ok+p.OL*a*a;return v>0?Math.sqrt(v):NaN;}
function ageGyr(p){const n=20000,h=1/n;let s=0;
  for(let i=0;i<=n;i++){const a=i*h,f=i===0?0:1/aE(a,p),w=i===0||i===n?1:i%2?4:2;if(!Number.isFinite(f))return NaN;s+=w*f;}
  return s*h/3*H0_TO_INV_GYR/p.H0;}
/* time table on a log grid in a: t(a) by cumulative trapezoid in ln a */
function expansionTable(p,aMin=1e-9,aMax=4,n=900){
  const la0=Math.log(aMin),la1=Math.log(aMax),dl=(la1-la0)/(n-1),rows=[];let tau=0;
  // t(aMin): radiation era a ~ sqrt(2 sqrt(Or) tau)  => tau = a^2/(2 sqrt(Or)); fall back to Om/OL if Or=0
  tau=p.Or>0?aMin*aMin/(2*Math.sqrt(p.Or)):(2/3)*Math.pow(aMin,1.5)/Math.sqrt(p.Om);
  let prevF=null;
  for(let i=0;i<n;i++){const a=Math.exp(la0+i*dl),f=a/aE(a,p);
    if(prevF!==null&&Number.isFinite(f))tau+=0.5*(f+prevF)*dl;prevF=f;
    const E=aE(a,p)/a;rows.push({a,z:1/a-1,tGyr:tau*H0_TO_INV_GYR/p.H0,H:p.H0*E,T:2.7255/a});}
  return rows;}
function epochs(p){
  const aEq=p.Or/p.Om,aLM=Math.pow(p.Om/p.OL,1/3),aAcc=Math.pow(p.Om/(2*p.OL),1/3);
  return{aEq,zEq:1/aEq-1,aLM:p.OL>0?aLM:NaN,zLM:p.OL>0?1/aLM-1:NaN,aAcc:p.OL>0?aAcc:NaN,zAcc:p.OL>0?1/aAcc-1:NaN};}
/* closed form for flat matter+Lambda (radiation neglected): a(t)=(Om/OL)^(1/3) sinh^(2/3)(1.5 sqrt(OL) H0 t) */
function flatLcdmA(p,tGyr){const x=1.5*Math.sqrt(p.OL)*p.H0*tGyr/H0_TO_INV_GYR;return Math.pow(p.Om/p.OL,1/3)*Math.pow(Math.sinh(x),2/3);}

/* ---------- 2. Slow-roll inflation in e-fold time ----------
   phi_NN + (3-eps) phi_N + (3-eps) V'/V = 0 ,  eps = phi_N^2/2  (M = 1, independent of the overall V scale) */
const POTENTIALS={
  power:p=>({name:"V ∝ φ^"+p,dlnV:f=>p/f,eta:f=>p*(p-1)/(f*f),phiEnd:p/Math.SQRT2}),
  starobinsky:()=>{const k=Math.sqrt(2/3);return{name:"Starobinsky V=(1−e^{−√(2/3)φ})²",
    dlnV:f=>{const u=Math.exp(-k*f);return 2*k*u/(1-u);},
    eta:f=>{const u=Math.exp(-k*f);return -2*k*k*u*(1-2*u)/((1-u)*(1-u));},phiEnd:0.62};}
};
function inflationRun(pot,phi0,opts={}){
  const h=opts.h||0.01,Nmax=opts.Nmax||400,out={N:[],phi:[],eps:[],epsSR:[]};
  let f=phi0,v=-pot.dlnV(phi0),N=0;
  const rhs=(f,v)=>{const e=v*v/2;return[v,-(3-e)*v-(3-e)*pot.dlnV(f)];};
  while(N<Nmax){const e=v*v/2;out.N.push(N);out.phi.push(f);out.eps.push(e);out.epsSR.push(0.5*Math.pow(pot.dlnV(f),2));
    if(e>=1){out.Nend=N;out.phiEnd=f;return out;}
    const k1=rhs(f,v),k2=rhs(f+h/2*k1[0],v+h/2*k1[1]),k3=rhs(f+h/2*k2[0],v+h/2*k2[1]),k4=rhs(f+h*k3[0],v+h*k3[1]);
    f+=h/6*(k1[0]+2*k2[0]+2*k3[0]+k4[0]);v+=h/6*(k1[1]+2*k2[1]+2*k3[1]+k4[1]);N+=h;
    if(!Number.isFinite(f))break;}
  out.Nend=null;out.phiEnd=f;return out;}
/* predictions at N* e-folds before the end: ns = 1 - 6 eps + 2 eta ; r = 16 eps */
function predict(pot,run,Nstar){
  if(run.Nend==null||run.Nend<Nstar)return null;
  const target=run.Nend-Nstar;let i=0;while(i<run.N.length-1&&run.N[i]<target)i++;
  const f=run.phi[i],eps=0.5*Math.pow(pot.dlnV(f),2),eta=pot.eta(f);
  return{phiStar:f,eps,eta,ns:1-6*eps+2*eta,r:16*eps};}
function e2(x){return x*x;}

/* ---------- 3. Stochastic inflation: eternal-inflation ensemble (V = Vs phi^p, M=1) ----------
   dphi = -(p/phi) dN + (H/2pi) sqrt(dN) xi ,  H = sqrt(V/3) ;  patch exits when eps=(p/phi)^2/2 = 1 */
function hubble(Vs,p,phi){return Math.sqrt(Vs*Math.pow(Math.abs(phi),p)/3);}
function quantumToClassical(Vs,p,phi){return hubble(Vs,p,phi)/(2*Math.PI)/(p/phi);}  // >1 : quantum kicks beat classical roll
function eternalThreshold(Vs,p){let lo=1,hi=1e7;for(let i=0;i<200;i++){const mid=Math.sqrt(lo*hi);if(quantumToClassical(Vs,p,mid)>1)hi=mid;else lo=mid;}return Math.sqrt(lo*hi);}
function ensemble(o,rand,gauss){
  const{Vs,p,phi0,n,Nmax,dN}=o,phiEnd=p/Math.SQRT2,sq=Math.sqrt(dN),Nexit=new Float64Array(n);let capped=0;
  for(let k=0;k<n;k++){let f=phi0,N=0,done=false;
    while(N<Nmax){if(f<=phiEnd){done=true;break;}
      f+=-(p/f)*dN+hubble(Vs,p,f)/(2*Math.PI)*sq*gauss(rand);N+=dN;if(f>1e9)break;}
    if(done)Nexit[k]=N;else{Nexit[k]=Infinity;capped++;}}
  return{Nexit,capped};}
/* volume statistics: a patch that inflates N e-folds before exit has volume ~ exp(3N) */
function volumeStats(Nexit){
  const fin=Array.from(Nexit).filter(Number.isFinite).sort((a,b)=>b-a);if(!fin.length)return{share1:NaN,shareTop10:NaN,meanN:NaN,volMeanN:NaN};
  const mx=fin[0],w=fin.map(v=>Math.exp(3*(v-mx))),W=w.reduce((a,b)=>a+b,0);
  const meanN=fin.reduce((a,b)=>a+b,0)/fin.length,volMeanN=fin.reduce((a,v,i)=>a+v*w[i],0)/W;
  return{share1:w[0]/W,shareTop10:w.slice(0,10).reduce((a,b)=>a+b,0)/W,meanN,volMeanN,maxN:mx};}

/* ---------- 4. de Sitter entropy and wave-function weights ----------
   S = 8 pi^2 M^2 / H^2 = 24 pi^2 M^4 / V ;  Hartle-Hawking ~ e^{+S}, Vilenkin tunnelling ~ e^{-S} */
function dsEntropyFromScale(rhoGeV){const r=rhoGeV/M_PL_GEV;return 24*Math.PI*Math.PI/Math.pow(r,4);}
function dsEntropyToday(h,OL){const H=h*H100_GEV*Math.sqrt(OL);return 8*Math.PI*Math.PI*M_PL_GEV*M_PL_GEV/(H*H);}
const LOG10E=Math.LOG10E;
function wavefunctionWeights(S){return{log10HH:S*LOG10E,log10Vilenkin:-S*LOG10E};}

/* ---------- 5. Thin-wall vacuum-bubble nucleation (flat space, Coleman 1977) ----------
   B = 27 pi^2 sigma^4 / (2 eps^3) ; R_c = 3 sigma / eps ; rate per volume ~ A exp(-B) */
function bubble(sigma,eps){return{B:27*Math.PI*Math.PI*Math.pow(sigma,4)/(2*Math.pow(eps,3)),Rc:3*sigma/eps,log10Suppression:-27*Math.PI*Math.PI*Math.pow(sigma,4)/(2*Math.pow(eps,3))*LOG10E};}

const api={H0_TO_INV_GYR,M_PL_GEV,params,aE,ageGyr,expansionTable,epochs,flatLcdmA,POTENTIALS,inflationRun,predict,hubble,quantumToClassical,eternalThreshold,ensemble,volumeStats,dsEntropyFromScale,dsEntropyToday,wavefunctionWeights,bubble};
if(typeof module!=="undefined"&&module.exports)module.exports=api;root.CosmosGenesisCore=api;
})(typeof window!=="undefined"?window:globalThis);
