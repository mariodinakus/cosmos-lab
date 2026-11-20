/* COSMOS LAB Riemann core: zeta on the critical line via Borwein's algorithm, Hardy Z(t), zero finding,
   N(T), spacing statistics. Finite-height numerical evidence only; it does not prove the Riemann Hypothesis. */
(function(root){"use strict";
const TWO_PI=2*Math.PI;
/* Borwein weights w_k = (d_k - d_n)/d_n computed from the stable backward recurrence (no overflow). */
const weightCache=new Map();
function weights(n){
  if(weightCache.has(n))return weightCache.get(n);
  const t=new Float64Array(n+1);t[n]=1;
  for(let i=n-1;i>=0;i--)t[i]=t[i+1]*(2*i+1)*(2*i+2)/(4*(n+i)*(n-i));
  const S=new Float64Array(n+1);let c=0;for(let i=0;i<=n;i++){c+=t[i];S[i]=c;}
  const w=new Float64Array(n);for(let k=0;k<n;k++)w[k]=S[k]/S[n]-1;
  weightCache.set(n,w);if(weightCache.size>400)weightCache.delete(weightCache.keys().next().value);
  return w;}
const lnCache=[0];
function ln(k){while(lnCache.length<=k)lnCache.push(Math.log(lnCache.length||1));return lnCache[k];}
/* complex zeta at s = sigma + i t, sigma in (0,1]-ish; truncation error ~ e^{1.571 t} 5.83^{-n}, so n ~ 0.92 t + 34 gives >1e-13 */
function zeta(sigma,t){
  const n=Math.max(30,Math.ceil(0.92*Math.abs(t)+34)),w=weights(n);
  let re=0,im=0;
  for(let k=0;k<n;k++){const lk=ln(k+1),mag=Math.exp(-sigma*lk),ph=-t*lk,sgn=k&1?-1:1,c=sgn*w[k]*mag;re+=c*Math.cos(ph);im+=c*Math.sin(ph);}
  // eta-type sum S; zeta = -S / (1 - 2^{1-s})
  const a=1-Math.pow(2,1-sigma)*Math.cos(-t*Math.LN2),b=-Math.pow(2,1-sigma)*Math.sin(-t*Math.LN2);
  const den=a*a+b*b;return{re:-(re*a+im*b)/den,im:-(im*a-re*b)/den};
}
/* Riemann–Siegel theta from Stirling series of ln Gamma(1/4 + i t/2) with a 8-step shift (accurate for t >= 0) */
function theta(t){
  let zr=.25,zi=t/2,argSum=0;
  for(let k=0;k<8;k++)argSum+=Math.atan2(zi,zr+k);
  const wr=zr+8,wi=zi,lw=Math.log(Math.hypot(wr,wi)),aw=Math.atan2(wi,wr);
  const w2=wr*wr+wi*wi;
  // Im[(w-1/2) ln w - w + 1/(12 w) - 1/(360 w^3) + 1/(1260 w^5)]
  let im=(wr-.5)*aw+wi*lw-wi;
  const inv=[wr/w2,-wi/w2];                    // 1/w
  const cmul=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];
  const i2=cmul(inv,inv),i3=cmul(i2,inv),i5=cmul(i3,i2);
  im+=inv[1]/12-i3[1]/360+i5[1]/1260;
  return im-argSum-(t/2)*Math.log(Math.PI);}
/* Hardy Z(t) = e^{i theta} zeta(1/2 + i t), real valued */
function Z(t){const z=zeta(.5,t),th=theta(t);return z.re*Math.cos(th)-z.im*Math.sin(th);}
function absZeta(t){const z=zeta(.5,t);return Math.hypot(z.re,z.im);}
/* find zeros of Z on [a,b]: sign changes on a fine grid then bisection/secant refinement */
function findZeros(a,b,step=0.04){
  const zs=[];let t0=a,z0=Z(a);
  for(let t=a+step;t<=b+step*.5;t+=step){const z1=Z(t);
    if(z0===0)zs.push(t0);else if(z0*z1<0){let lo=t-step,hi=t,flo=z0;
      for(let i=0;i<60;i++){const mid=.5*(lo+hi),fm=Z(mid);if(fm*flo<=0)hi=mid;else{lo=mid;flo=fm;}if(hi-lo<1e-11)break;}zs.push(.5*(lo+hi));}
    t0=t;z0=z1;}
  return zs;}
/* smooth zero counting: N(T) = theta(T)/pi + 1 (+ S(T)) */
function Nsmooth(T){return theta(T)/Math.PI+1;}
/* normalised (unfolded) spacings: s_n = (g_{n+1}-g_n) * ln(g_n/2pi)/(2pi) , mean ~ 1 */
function spacings(zs){const out=[];for(let i=0;i<zs.length-1;i++){const g=.5*(zs[i]+zs[i+1]);out.push((zs[i+1]-zs[i])*Math.log(g/TWO_PI)/TWO_PI);}return out;}
/* reference densities */
const gueWigner=s=>32/(Math.PI*Math.PI)*s*s*Math.exp(-4*s*s/Math.PI);
const poisson=s=>Math.exp(-s);
const gueExact=s=>{ // sine-kernel (GUE) spacing, via the Gaudin Painlevé-free series is long; use the surmise as reference
  return gueWigner(s);};
const KNOWN=[14.134725141734693,21.022039638771555,25.010857580145688,30.424876125859513,32.935061587739190,37.586178158825671,40.918719012147495,43.327073280914999,48.005150881167159,49.773832477672302];
const api={zeta,theta,Z,absZeta,findZeros,Nsmooth,spacings,gueWigner,poisson,gueExact,KNOWN};
if(typeof module!=="undefined"&&module.exports)module.exports=api;root.CosmosRiemannCore=api;
})(typeof window!=="undefined"?window:globalThis);
