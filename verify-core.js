/* COSMOS LAB "Toy → Reality" core: small equations confronted with real measurements.
   Each function is a toy model; the data are published measurements cited in DATA.*.source.
   A good match tests the toy within its domain; it is not evidence that the toy is the whole story. */
(function(root){"use strict";
const C=299792458,H=6.62607015e-34,KB=1.380649e-23,G=6.6743e-11,AU=1.495978707e11,GM_SUN=1.32712440018e20,DAY=86400,YR=365.25*DAY;

/* ---------------- DATA ---------------- */
const DATA={
 firas:{source:"COBE/FIRAS CMB monopole, Fixsen et al. 1996 ApJ 473, 576; Fixsen & Mather 2002 ApJ 581, 817. NASA LAMBDA file firas_monopole_spec_v1.txt",
  note:"Columns: frequency (cm⁻¹), monopole intensity (MJy/sr), residual from 2.725 K blackbody (kJy/sr), 1σ uncertainty (kJy/sr). Errors are diagonal; the published bins are correlated.",
  rows:[[2.27,200.723,5,14],[2.72,249.508,9,19],[3.18,293.024,15,25],[3.63,327.770,4,23],[4.08,354.081,19,22],[4.54,372.079,-30,21],[4.99,381.493,-30,18],[5.45,383.478,-10,18],[5.90,378.901,32,16],[6.35,368.833,4,14],[6.81,354.063,-2,13],[7.26,336.278,13,12],[7.71,316.076,-22,11],[8.17,293.924,8,10],[8.62,271.432,8,11],[9.08,248.239,-21,12],[9.53,225.940,9,14],[9.98,204.327,12,16],[10.44,183.262,11,18],[10.89,163.830,-29,22],[11.34,145.750,-46,22],[11.80,128.835,58,23],[12.25,113.568,6,23],[12.71,99.451,-6,23],[13.16,87.036,6,22],[13.61,75.876,-17,21],[14.07,65.766,6,20],[14.52,57.008,26,19],[14.97,49.223,-12,19],[15.43,42.267,-19,19],[15.88,36.352,8,21],[16.34,31.062,7,23],[16.79,26.580,14,26],[17.24,22.644,-33,28],[17.70,19.255,6,30],[18.15,16.391,26,32],[18.61,13.811,-26,33],[19.06,11.716,-6,35],[19.51,9.921,8,41],[19.97,8.364,26,55],[20.42,7.087,57,88],[20.87,5.801,-116,155],[21.33,4.523,-432,282]]},
 planets:{source:"Semi-major axes and sidereal periods: NASA/JPL planetary fact sheets (J2000 mean elements)",
  rows:[["Mercury",0.38710,0.24085],["Venus",0.72333,0.61520],["Earth",1.00000,1.00002],["Mars",1.52368,1.88085],["Jupiter",5.20288,11.8620],["Saturn",9.53667,29.4571],["Uranus",19.1892,84.0205],["Neptune",30.0699,164.8],]},
 galilean:{source:"Galilean moons of Jupiter: semi-major axis (km) and sidereal period (days), JPL satellite mean elements",
  rows:[["Io",421700,1.769138],["Europa",671034,3.551181],["Ganymede",1070412,7.154553],["Callisto",1882709,16.689018]]},
 perihelion:{source:"Anomalous perihelion advance (after subtracting planetary perturbations): classic compilation, Weinberg 1972, Gravitation and Cosmology, Table 8.1",
  /* name, a (AU), e, period (yr), observed arcsec/century, 1σ */
  rows:[["Mercury",0.387098,0.205630,0.240846,43.11,0.45],["Venus",0.723332,0.006772,0.615198,8.4,4.8],["Earth",1.000001,0.016709,1.000017,5.0,1.2],["Icarus",1.0778,0.8269,1.1190,9.8,0.8]]},
 hareLynx:{source:"Hudson's Bay Company pelt records 1900–1920 (thousands), as tabulated by Odum 1953 / MacLulich 1937",
  note:"Pelts traded, not population counts. The classic teaching dataset; trapping effort varied year to year.",
  year:[1900,1901,1902,1903,1904,1905,1906,1907,1908,1909,1910,1911,1912,1913,1914,1915,1916,1917,1918,1919,1920],
  hare:[30,47.2,70.2,77.4,36.3,20.6,18.1,21.4,22,25.4,27.1,40.3,57,76.6,52.3,19.5,11.2,7.6,14.6,16.2,24.7],
  lynx:[4,6.1,9.8,35.2,59.4,41.7,19,13,8.3,9.1,7.4,8,12.3,19.5,45.7,51.1,29.7,15.8,9.7,10.1,8.6]}
};

/* ---------------- 1. CMB: Planck's law ---------------- */
/* intensity in MJy/sr for wavenumber nu (cm^-1); model: "planck" | "wien" | "rj" */
function radiance(nu,T,model){
  const f=C*nu*100,x=H*f/(KB*T),pre=2*H*f*f*f/(C*C)/1e-20;
  if(model==="wien")return pre*Math.exp(-x);
  if(model==="rj")return 2*f*f*KB*T/(C*C)/1e-20;
  return pre/Math.expm1(x);}
function firasData(){return DATA.firas.rows.map(r=>({nu:r[0],I:r[1],err:r[3]/1000,res:r[2]/1000}));}
function chi2T(T,model,d){d=d||firasData();let s=0;for(const p of d){const r=(p.I-radiance(p.nu,T,model))/p.err;s+=r*r;}return s;}
/* golden-section minimum of chi2 in T, for each model; amplitude kept physical (no free scale) */
function golden(f,a,b,tol){const g=(Math.sqrt(5)-1)/2;let c=b-g*(b-a),d=a+g*(b-a),fc=f(c),fd=f(d);
  while(b-a>tol){if(fc<fd){b=d;d=c;fd=fc;c=b-g*(b-a);fc=f(c);}else{a=c;c=d;fc=fd;d=a+g*(b-a);fd=f(d);}}return(a+b)/2;}
function fitCMB(model){const d=firasData(),T=golden(t=>chi2T(t,model,d),1,5,1e-8),c=chi2T(T,model,d);
  /* 1-sigma from curvature of chi2 */
  const h=1e-5,c2=(chi2T(T+h,model,d)-2*c+chi2T(T-h,model,d))/(h*h);
  return{T,chi2:c,dof:d.length-1,sigma:Math.sqrt(2/c2)};}

/* ---------------- 2. Kepler III ---------------- */
function linfit(x,y){const n=x.length;let sx=0,sy=0,sxx=0,sxy=0;for(let i=0;i<n;i++){sx+=x[i];sy+=y[i];sxx+=x[i]*x[i];sxy+=x[i]*y[i];}
  const b=(n*sxy-sx*sy)/(n*sxx-sx*sx),a=(sy-b*sx)/n;let ss=0;for(let i=0;i<n;i++){const r=y[i]-a-b*x[i];ss+=r*r;}
  const se=Math.sqrt(ss/(n-2)/(sxx-sx*sx/n));return{a,b,se,rms:Math.sqrt(ss/n)};}
/* toy: central force F ∝ 1/r^n gives circular-orbit period P ∝ a^{(n+1)/2}. Fit slope of log P vs log a. */
function kepler(nForce){
  const pl=DATA.planets.rows,ga=DATA.galilean.rows;
  const lx=pl.map(r=>Math.log10(r[1])),ly=pl.map(r=>Math.log10(r[2])),fit=linfit(lx,ly);
  const k=(nForce+1)/2;
  /* toy prediction anchored at Earth: P = (a/1AU)^k  -> rms log error */
  const pred=pl.map(r=>Math.pow(r[1],k)),rmsLog=Math.sqrt(pl.reduce((s,r,i)=>s+Math.pow(Math.log10(pred[i])-ly[i],2),0)/pl.length);
  const msun=pl.map(r=>4*Math.PI*Math.PI*Math.pow(r[1]*AU,3)/(G*Math.pow(r[2]*YR,2)));
  const mjup=ga.map(r=>4*Math.PI*Math.PI*Math.pow(r[1]*1e3,3)/(G*Math.pow(r[2]*DAY,2)));
  const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
  return{fit,k,pred,rmsLog,msun,mjup,Msun:mean(msun),Mjup:mean(mjup)};}

/* ---------------- 3. Perihelion precession: Newton + 1PN effective force ---------------- */
/* Units GM=1, a=1. Acceleration = -r/|r|^3 (1 + lam*3 L^2/(c2 r^2)), c2 = c^2 a / GM.
   Integrates `orbits` radial periods with RK4, finds perihelia by sign change of r·v, returns mean advance per orbit (rad). */
function precessOrbit(e,c2,lam,orbits,steps){
  steps=steps||6000;orbits=orbits||3;
  const rp=1-e,vp=Math.sqrt((1+e)/(1-e));let x=rp,y=0,vx=0,vy=vp;const L=rp*vp,k=lam*3*L*L/c2;
  const acc=(x,y)=>{const r2=x*x+y*y,r=Math.sqrt(r2),f=-(1+k/r2)/(r2*r);return[f*x,f*y];};
  const dt=2*Math.PI/steps,peri=[],path=[];let prev=x*vx+y*vy,t=0;
  const total=Math.ceil(orbits*steps*1.05)+10;
  for(let i=0;i<total;i++){
    const a1=acc(x,y),k1=[vx,vy,a1[0],a1[1]];
    const a2=acc(x+.5*dt*k1[0],y+.5*dt*k1[1]),k2=[vx+.5*dt*k1[2],vy+.5*dt*k1[3],a2[0],a2[1]];
    const a3=acc(x+.5*dt*k2[0],y+.5*dt*k2[1]),k3=[vx+.5*dt*k2[2],vy+.5*dt*k2[3],a3[0],a3[1]];
    const a4=acc(x+dt*k3[0],y+dt*k3[1]),k4=[vx+dt*k3[2],vy+dt*k3[3],a4[0],a4[1]];
    const ox=x,oy=y;
    x+=dt/6*(k1[0]+2*k2[0]+2*k3[0]+k4[0]);y+=dt/6*(k1[1]+2*k2[1]+2*k3[1]+k4[1]);
    vx+=dt/6*(k1[2]+2*k2[2]+2*k3[2]+k4[2]);vy+=dt/6*(k1[3]+2*k2[3]+2*k3[3]+k4[3]);t+=dt;
    if(i%Math.max(1,Math.floor(steps/400))===0)path.push([x,y]);
    const rv=x*vx+y*vy;
    if(prev<0&&rv>=0){ /* perihelion between steps: linear interpolation of the angle */
      const f=-prev/(rv-prev),px=ox+(x-ox)*f,py=oy+(y-oy)*f;peri.push(Math.atan2(py,px));if(peri.length>=orbits)break;}
    prev=rv;}
  const unwrap=[];let off=0;for(let i=0;i<peri.length;i++){if(i&&peri[i]+off<unwrap[i-1]-Math.PI)off+=2*Math.PI;if(i&&peri[i]+off>unwrap[i-1]+Math.PI)off-=2*Math.PI;unwrap.push(peri[i]+off);}
  const adv=unwrap.length?unwrap[unwrap.length-1]/unwrap.length:NaN;
  return{advance:adv,perihelia:unwrap,path};}
function analyticAdvance(a,e){return 6*Math.PI*GM_SUN/(C*C*a*AU*(1-e*e));}
const RAD2AS=180/Math.PI*3600;
function perihelionTable(){
  return DATA.perihelion.rows.map(([name,a,e,P,obs,sig])=>{
    const c2=C*C*a*AU/GM_SUN,num=precessOrbit(e,c2,1,3,e>.5?40000:8000).advance,newton=precessOrbit(e,c2,0,3,e>.5?40000:8000).advance;
    const perCent=100/P,gr=(num-newton)*RAD2AS*perCent;
    return{name,a,e,P,obs,sig,c2,gr,analytic:analyticAdvance(a,e)*RAD2AS*perCent,numErr:newton*RAD2AS*perCent,pull:(obs-gr)/sig};});}

/* ---------------- 4. Lotka–Volterra ---------------- */
/* dH/dt = a H - b H L ; dL/dt = d b H L - g L   (params p=[a,b,c,g,H0,L0] with c = conversion) */
function lv(p,years,dt){dt=dt||0.01;const[a,b,c,g,H0,L0]=p;let h=H0,l=L0;const out={t:[],H:[],L:[]};const T=years;let t=0;
  const f=(h,l)=>[a*h-b*h*l,c*b*h*l-g*l];
  out.t.push(0);out.H.push(h);out.L.push(l);
  const n=Math.round(T/dt),every=Math.max(1,Math.round(0.1/dt));
  for(let i=1;i<=n;i++){const k1=f(h,l),k2=f(h+dt/2*k1[0],l+dt/2*k1[1]),k3=f(h+dt/2*k2[0],l+dt/2*k2[1]),k4=f(h+dt*k3[0],l+dt*k3[1]);
    h+=dt/6*(k1[0]+2*k2[0]+2*k3[0]+k4[0]);l+=dt/6*(k1[1]+2*k2[1]+2*k3[1]+k4[1]);t+=dt;
    if(!Number.isFinite(h)||!Number.isFinite(l)||h<0||l<0||h>1e6||l>1e6)return null;
    if(i%every===0){out.t.push(+t.toFixed(6));out.H.push(h);out.L.push(l);}}
  return out;}
/* sum of squared log residuals at the yearly data points */
function lvLoss(p){if(p.some(v=>!(v>0)))return 1e9;const d=DATA.hareLynx,s=lv(p,20,0.02);if(!s)return 1e9;let e=0;
  for(let i=0;i<d.year.length;i++){const k=i*5;/* t step 0.1 yr -> index 10 per yr? every=5 at dt .02 => 0.1 yr */
    const j=i*10;/* samples every 0.1 yr */if(!(j<s.H.length))return 1e9;e+=Math.pow(Math.log(s.H[j])-Math.log(d.hare[i]),2)+Math.pow(Math.log(s.L[j])-Math.log(d.lynx[i]),2);}
  return e;}
function nelderMead(f,x0,scale,iters){const n=x0.length;let S=[x0.slice()];for(let i=0;i<n;i++){const x=x0.slice();x[i]+=scale[i];S.push(x);}
  let F=S.map(f);
  for(let it=0;it<iters;it++){const idx=F.map((v,i)=>i).sort((a,b)=>F[a]-F[b]);S=idx.map(i=>S[i]);F=idx.map(i=>F[i]);
    const c=new Array(n).fill(0);for(let i=0;i<n;i++)for(let j=0;j<n;j++)c[j]+=S[i][j]/n;
    const xr=c.map((v,j)=>v+(v-S[n][j])),fr=f(xr);
    if(fr<F[0]){const xe=c.map((v,j)=>v+2*(v-S[n][j])),fe=f(xe);if(fe<fr){S[n]=xe;F[n]=fe;}else{S[n]=xr;F[n]=fr;}}
    else if(fr<F[n-1]){S[n]=xr;F[n]=fr;}
    else{const xc=c.map((v,j)=>v+.5*(S[n][j]-v)),fc=f(xc);if(fc<F[n]){S[n]=xc;F[n]=fc;}else{for(let i=1;i<=n;i++){S[i]=S[i].map((v,j)=>S[0][j]+.5*(v-S[0][j]));F[i]=f(S[i]);}}}}
  const i=F.indexOf(Math.min(...F));return{x:S[i],f:F[i]};}
const LV_START=[0.55,0.028,0.84,0.8,30,4];
function fitLV(iters){let best=nelderMead(lvLoss,LV_START,[.1,.005,.1,.1,5,1],iters||900);
  for(let r=0;r<2;r++)best=nelderMead(lvLoss,best.x,best.x.map(v=>v*.1),iters||900);
  return best;}
/* naive baseline: constant (geometric mean) populations */
function lvBaseline(){const d=DATA.hareLynx,gm=a=>Math.exp(a.reduce((s,v)=>s+Math.log(v),0)/a.length),mh=gm(d.hare),ml=gm(d.lynx);
  let e=0;for(let i=0;i<d.year.length;i++)e+=Math.pow(Math.log(mh/d.hare[i]),2)+Math.pow(Math.log(ml/d.lynx[i]),2);return e;}

/* ---------------- 5. Earthquakes: OFC model vs Gutenberg–Richter ---------------- */
/* Olami–Feder–Christensen (1992) spring-block model, open boundaries, uniform drive.
   alpha = fraction passed to each of 4 neighbours (0.25 = conservative). Returns event sizes (topplings). */
function ofc(N,alpha,events,seed){
  let s=seed>>>0||1;const rnd=()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};
  const F=new Float64Array(N*N);for(let i=0;i<F.length;i++)F[i]=rnd();
  const sizes=[],stack=new Int32Array(N*N*8);
  const total=events+Math.max(2000,events);   /* discard transient */
  for(let ev=0;ev<total;ev++){
    let mx=0,im=0;for(let i=0;i<F.length;i++)if(F[i]>mx){mx=F[i];im=i;}
    const add=1-mx;for(let i=0;i<F.length;i++)F[i]+=add;F[im]=1;
    let top=0,size=0;stack[top++]=im;
    while(top){const i=stack[--top];const f=F[i];if(f<1)continue;F[i]=0;size++;const x=i%N,y=(i/N)|0,df=alpha*f;
      if(x>0){const j=i-1;F[j]+=df;if(F[j]>=1&&top<stack.length)stack[top++]=j;}
      if(x<N-1){const j=i+1;F[j]+=df;if(F[j]>=1&&top<stack.length)stack[top++]=j;}
      if(y>0){const j=i-N;F[j]+=df;if(F[j]>=1&&top<stack.length)stack[top++]=j;}
      if(y<N-1){const j=i+N;F[j]+=df;if(F[j]>=1&&top<stack.length)stack[top++]=j;}}
    if(ev>=total-events)sizes.push(size);}
  return sizes;}
/* complementary cumulative N(>=x) on a log grid */
function ccdf(vals,nb){const v=vals.filter(x=>x>0).sort((a,b)=>a-b),n=v.length;if(!n)return{x:[],y:[]};
  const lo=Math.log10(v[0]),hi=Math.log10(v[n-1]),x=[],y=[];let j=0;
  for(let k=0;k<nb;k++){const t=lo+(hi-lo)*k/(nb-1),xv=Math.pow(10,t);while(j<n&&v[j]<xv-1e-12)j++;x.push(xv);y.push((n-j)/n);}
  return{x,y};}
/* Aki (1965) maximum-likelihood b-value with Utsu bin correction */
function bValue(mags,Mc,dM){const m=mags.filter(v=>v>=Mc-1e-9);if(m.length<10)return null;const mean=m.reduce((s,v)=>s+v,0)/m.length;
  const b=Math.LOG10E/(mean-(Mc-(dM||0)/2));return{b,err:b/Math.sqrt(m.length),n:m.length};}
/* OFC sizes -> toy magnitudes: seismic moment ∝ rupture area ∝ s, M = (2/3) log10(s) + const.
   b_toy is the MLE b of those magnitudes above a size cut. */
function ofcB(sizes,smin){const m=sizes.filter(s=>s>=smin).map(s=>2/3*Math.log10(s));return bValue(m,2/3*Math.log10(smin),0);}

const api={C,H,KB,G,AU,GM_SUN,DATA,radiance,firasData,chi2T,fitCMB,linfit,kepler,precessOrbit,analyticAdvance,perihelionTable,RAD2AS,
  lv,lvLoss,nelderMead,fitLV,lvBaseline,LV_START,ofc,ccdf,bValue,ofcB};

/* ================= EXTENSION: five more toys ================= */
Object.assign(DATA,{
 balmer:{source:"Hydrogen Balmer lines, air wavelengths (nm), NIST Atomic Spectra Database",
  rows:[[3,656.279],[4,486.135],[5,434.047],[6,410.174],[7,397.007],[8,388.905],[9,383.539]]},
 lightGravity:{source:"Light deflection by the Sun as a fraction of the GR value: Dyson, Eddington & Davidson 1920 (Sobral, Príncipe); Texas–Mauritanian eclipse 1973; VLBI, Shapiro et al. 2004 PRL 92, 121101. Shapiro delay: Cassini, Bertotti et al. 2003 Nature 425, 374",
  /* label, year, measured/GR, 1σ */
  rows:[["Sobral 1919 (plates)",1919,1.98/1.75,0.16/1.75],["Príncipe 1919",1919,1.61/1.75,0.40/1.75],["Eclipse 1973",1973,0.95,0.11],["VLBI quasars 2004",2004,0.99992,0.00023],["Cassini 2003 (delay)",2003,1.0000105,0.0000115]]},
 climate:{source:"Bond albedo, mean distance and mean surface (or 1-bar / effective) temperature: NASA planetary fact sheets. Solar constant 1361 W/m² (Kopp & Lean 2011)",
  /* name, a (AU), Bond albedo, observed T (K), kind */
  rows:[["Venus",0.723,0.76,737,"surface"],["Earth",1.0,0.306,288,"surface"],["Mars",1.524,0.25,210,"surface"],["Jupiter",5.203,0.343,124.4,"effective"],["Titan",9.537,0.265,94,"surface"]]},
 population:{source:"World population (billions), UN World Population Prospects 2024, mid-year estimates (rounded)",
  year:[1950,1960,1970,1980,1990,2000,2010,2020,2024],pop:[2.499,3.019,3.695,4.444,5.316,6.149,6.986,7.856,8.162]}
});
/* --- Hydrogen: Rydberg-type toy 1/λ = R (1/4 − 1/n^p) --- */
function airToVac(lnm){const s2=Math.pow(1000/lnm,2),n=1+1e-8*(8342.13+2406030/(130-s2)+15997/(38.9-s2));return lnm*n;}
function balmerFit(p){p=p||2;const r=DATA.balmer.rows.map(([n,l])=>({n,lv:airToVac(l)}));
  /* least squares through origin for R: y = 1/λ, x = 1/4 − 1/n^p */
  let sxy=0,sxx=0;for(const q of r){const x=.25-Math.pow(q.n,-p),y=1e9/q.lv;sxy+=x*y;sxx+=x*x;}const R=sxy/sxx;
  const pred=r.map(q=>1e9/(R*(.25-Math.pow(q.n,-p))));const ppm=r.map((q,i)=>(pred[i]-q.lv)/q.lv*1e6);
  return{R,rows:r,pred,ppm,rmsppm:Math.sqrt(ppm.reduce((a,v)=>a+v*v,0)/ppm.length)};}
const R_H=10967758.34;/* m^-1, reduced-mass Rydberg for hydrogen */
/* --- Light and gravity: PPN gamma --- */
function lightChi2(gamma){const t=(1+gamma)/2;let c=0;for(const r of DATA.lightGravity.rows){c+=Math.pow((r[2]-t)/r[3],2);}return c;}
/* --- Climate: radiative equilibrium with n grey absorbing layers --- */
const SIGMA=5.670374419e-8,S0=1361;
function tEq(a,A){return Math.pow(S0*(1-A)/(4*SIGMA*a*a),.25);}
function climate(){return DATA.climate.rows.map(([name,a,A,T,kind])=>{const te=tEq(a,A);return{name,a,A,T,kind,te,layers:Math.pow(T/te,4)-1,err:(te-T)/T};});}
/* --- Population: exponential vs logistic --- */
function popModels(){const d=DATA.population,t=d.year.map(y=>y-1950),P=d.pop;
  const lsq=f=>t.reduce((s,ti,i)=>s+Math.pow(Math.log(f(ti))-Math.log(P[i]),2),0);
  const ex=nelderMead(q=>lsq(x=>q[0]*Math.exp(q[1]*x)),[2.5,.02],[.3,.005],800);
  const lo=nelderMead(q=>q[2]<=0?1e9:lsq(x=>q[2]/(1+(q[2]/q[0]-1)*Math.exp(-q[1]*x))),[2.5,.03,12],[.3,.005,2],3000);
  return{exp:{P0:ex.x[0],r:ex.x[1],loss:ex.f,f:x=>ex.x[0]*Math.exp(ex.x[1]*x)},logistic:{P0:lo.x[0],r:lo.x[1],K:lo.x[2],loss:lo.f,f:x=>lo.x[2]/(1+(lo.x[2]/lo.x[0]-1)*Math.exp(-lo.x[1]*x))}};}
/* --- Friedmann vs Pantheon+: flat (Om, 1−Om), Milne (empty) --- */
function lumDist(z,Om,milne){if(milne)return z*(1+z/2);const n=200;let s=0;for(let i=0;i<=n;i++){const zi=z*i/n,E=Math.sqrt(Om*Math.pow(1+zi,3)+1-Om),w=(i===0||i===n)?.5:1;s+=w/E;}return(1+z)*s*z/n;}
function sneData(P,zmin){const d={z:[],zh:[],m:[],e:[]};for(const r of P.rows){if(r[4]||r[0]<zmin)continue;d.z.push(r[0]);d.zh.push(r[1]);d.m.push(r[2]);d.e.push(r[3]);}return d;}
function sneChi2(d,Om,milne){/* tabulate Dc on grid then interpolate for speed */
  const zs=[],D=[];const N=480,zmax=2.4;for(let i=0;i<=N;i++){const z=zmax*i/N;zs.push(z);D.push(milne?z*(1+z/2)/(1+z):lumDist(z,Om,false)/(1+z));}
  const Dc=z=>{const x=z/zmax*N,i=Math.min(N-1,Math.floor(x)),f=x-i;return D[i]*(1-f)+D[i+1]*f;};
  let A=0,B=0,Cc=0;const mu=[];for(let i=0;i<d.z.length;i++){const dl=(1+d.zh[i])*Dc(d.z[i]),r=d.m[i]-5*Math.log10(dl),iv=1/(d.e[i]*d.e[i]);A+=r*r*iv;B+=r*iv;Cc+=iv;mu.push(5*Math.log10(dl));}
  return{chi2:A-B*B/Cc,off:B/Cc,mu};}
function sneFit(d){let best={chi2:Infinity};for(let Om=0;Om<=1.0001;Om+=.005){const c=sneChi2(d,Om).chi2;if(c<best.chi2)best={Om,chi2:c};}return best;}
/* age of flat universe in Gyr */
function ageGyr(H0,Om){const n=4000;let s=0;for(let i=1;i<=n;i++){const a=i/n,am=(i-.5)/n;s+=1/(am*Math.sqrt(Om/Math.pow(am,3)+1-Om))/n;}return s*977.792/H0;}
Object.assign(api,{airToVac,balmerFit,R_H,lightChi2,SIGMA,S0,tEq,climate,popModels,lumDist,sneData,sneChi2,sneFit,ageGyr});

/* ================= EXTENSION 2: quantum gravity & string-theory toys ================= */
Object.assign(DATA,{
 regge:{source:"Meson masses (MeV), Particle Data Group 2024: ρ(770), a₂(1320), ρ₃(1690), a₄(1970), ρ₅(2350)",
  rows:[["ρ(770)",1,775.26],["a₂(1320)",2,1318.2],["ρ₃(1690)",3,1688.8],["a₄(1970)",4,1967],["ρ₅(2350)",5,2330]]},
 grb:{source:"GRB 090510, Fermi LAT/GBM: 31 GeV photon, redshift 0.903, arrival within 0.859 s of the burst onset (Abdo et al. 2009, Nature 462, 331)",E:31,z:0.903,dtMax:0.859,published:"E_QG,1 > 1.19 E_Planck (conservative)"},
 mergers:{source:"Binary black-hole mergers, source-frame median masses (M☉) and final spin: LIGO–Virgo GWTC-1/GWTC-2",
  rows:[["GW150914",35.6,30.6,63.1,0.69],["GW170814",30.6,25.2,53.2,0.72],["GW170104",30.8,20.0,48.9,0.66],["GW190521",85,66,142,0.72]]},
 eotwash:{source:"Eöt-Wash torsion-balance test of the inverse-square law: Lee et al. 2020, PRL 124, 101101 — Yukawa range λ ≤ 38.6 µm for |α| = 1 (95% CL)",lambdaMax:38.6e-6}
});
/* --- Regge: J = a0 + alpha' M^2 ; toy break: J = a0 + c M^p --- */
function regge(p){p=p||2;const r=DATA.regge.rows,x=r.map(q=>Math.pow(q[2]/1000,p)),y=r.map(q=>q[1]),f=linfit(x,y);
  const res=r.map((q,i)=>y[i]-(f.a+f.b*x[i]));return{fit:f,alphaP:f.b,a0:f.a,res,rms:Math.sqrt(res.reduce((s,v)=>s+v*v,0)/res.length),sigma:1/(2*Math.PI*f.b)};}
/* string tension from alpha' (GeV^-2): sigma = 1/(2 pi alpha') GeV^2 -> GeV/fm */
function stringTensionGeVfm(alphaP){return 1/(2*Math.PI*alphaP)/0.1973;}
/* --- Lorentz-invariance violation: linear (n=1) or quadratic (n=2) dispersion, Jacob & Piran 2008 --- */
function livDelay(EGeV,z,EqgGeV,n,H0,Om){H0=H0||67.4;Om=Om==null?0.315:Om;const N=400;let s=0;
  for(let i=0;i<=N;i++){const zi=z*i/N,w=(i===0||i===N)?.5:1;s+=w*Math.pow(1+zi,n)/Math.sqrt(Om*Math.pow(1+zi,3)+1-Om);}s*=z/N;
  const H0s=H0/3.0856775814913673e19;return (1+n)/2*Math.pow(EGeV/EqgGeV,n)*s/H0s;}
const E_PLANCK=1.220890e19;
function livBound(n){const g=DATA.grb,f=x=>livDelay(g.E,g.z,x,n)-g.dtMax;let lo=1e5,hi=1e25;for(let i=0;i<200;i++){const m=Math.sqrt(lo*hi);if(f(m)>0)lo=m;else hi=m;}return hi;}
/* --- Black-hole area theorem: Kerr horizon area A = 8 pi M^2 (1 + sqrt(1 - chi^2)) (G=c=1, M in solar masses) --- */
const MSUN_KG=1.98847e30,HBAR=1.054571817e-34,LP2=HBAR*G/Math.pow(C,3);
function kerrArea(M,chi){return 8*Math.PI*M*M*(1+Math.sqrt(1-chi*chi));}
function areaTest(chiInit){chiInit=chiInit||0;return DATA.mergers.rows.map(([name,m1,m2,mf,cf])=>{const Ai=kerrArea(m1,chiInit)+kerrArea(m2,chiInit),Af=kerrArea(mf,cf);
  const Mm=G*MSUN_KG/(C*C),Si=Ai*Mm*Mm/(4*LP2),Sf=Af*Mm*Mm/(4*LP2);return{name,m1,m2,mf,cf,Ai,Af,ratio:Af/Ai,Erad:m1+m2-mf,Si,Sf,TH:HBAR*Math.pow(C,3)/(8*Math.PI*G*mf*MSUN_KG*KB)};});}
/* --- Extra dimensions (ADD): n large dims of size R. Toy potential: Newton for r >> R, 1/r^{1+n} for r << R.
   Effective deviation is captured as a Yukawa term with range ~R (alpha = 2n for torus compactification, Kehagias & Sfetsos 2000).
   Survives if R (as lambda) is below the Eöt-Wash bound. Fundamental gravity scale M_* from M_Pl^2 = M_*^{n+2} R^n. --- */
function addModel(n,MstarTeV){const hbarc=1.973269804e-16/*GeV·m*/,MPl=E_PLANCK/Math.sqrt(8*Math.PI);/* reduced Planck mass */
  const M=MstarTeV*1e3,R=Math.pow(MPl*MPl/Math.pow(M,n+2),1/n)*hbarc;
  return{n,M:MstarTeV,R,alpha:2*n,allowed:R<=DATA.eotwash.lambdaMax,ratioAt:r=>1+2*n*Math.exp(-r/R)};}
function addMaxR(){return DATA.eotwash.lambdaMax*1e6;}
Object.assign(api,{regge,stringTensionGeVfm,livDelay,livBound,E_PLANCK,kerrArea,areaTest,addModel,addMaxR});
if(typeof module!=="undefined"&&module.exports)module.exports=api;root.CosmosVerifyCore=api;
})(typeof window!=="undefined"?window:globalThis);
