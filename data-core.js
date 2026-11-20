/* COSMOS LAB data core: flat wCDM luminosity distances and chi-squared fits to supernova Hubble diagrams.
   The absolute-magnitude offset (degenerate with H0) is marginalised analytically. */
(function(root){"use strict";
const ZMAX=2.4,NG=640,DZ=ZMAX/(NG-1);
/* comoving distance in units of c/H0 on a uniform grid, flat universe, E^2 = Om(1+z)^3 + (1-Om)(1+z)^{3(1+w)} */
function comovingTable(Om,w){
  const D=new Float64Array(NG);let prev=1,acc=0;
  for(let i=1;i<NG;i++){const z=i*DZ,E=Math.sqrt(Om*Math.pow(1+z,3)+(1-Om)*Math.pow(1+z,3*(1+w))),f=1/E;acc+=.5*(f+prev)*DZ;D[i]=acc;prev=f;}
  return D;}
function Dc(D,z){const x=z/DZ,i=Math.min(NG-2,Math.floor(x)),f=x-i;return D[i]*(1-f)+D[i+1]*f;}
/* data: {zhd[],zhel[],m[],e[]} ; returns chi2 with offset M marginalised (profiled) */
function chi2(Om,w,data,D){
  D=D||comovingTable(Om,w);let A=0,B=0,C=0;const n=data.zhd.length;
  for(let i=0;i<n;i++){const dl=(1+data.zhel[i])*Dc(D,data.zhd[i]),r=data.m[i]-5*Math.log10(dl),iv=1/(data.e[i]*data.e[i]);A+=r*r*iv;B+=r*iv;C+=iv;}
  return{chi2:A-B*B/C,offset:B/C};}
function residualCurve(Om,w,data,zs){const D=comovingTable(Om,w);return zs.map(z=>5*Math.log10((1+z)*Dc(D,z)));}
function linspace(a,b,n){return Array.from({length:n},(_,i)=>a+(b-a)*i/(n-1));}
/* 2D scan over (Om,w) */
function scan(data,Oms,ws){
  const g=[];let best={chi2:Infinity};
  for(let j=0;j<ws.length;j++){const row=[];for(let i=0;i<Oms.length;i++){const c=chi2(Oms[i],ws[j],data).chi2;row.push(c);if(c<best.chi2)best={chi2:c,i,j,Om:Oms[i],w:ws[j]};}g.push(row);}
  return{grid:g,best,Oms,ws};}
/* profile-likelihood 1-sigma interval (delta chi2 <= 1) of one axis */
function profile(s,axis){
  const n=axis==="Om"?s.Oms.length:s.ws.length,prof=new Array(n).fill(Infinity);
  for(let j=0;j<s.ws.length;j++)for(let i=0;i<s.Oms.length;i++){const k=axis==="Om"?i:j;if(s.grid[j][i]<prof[k])prof[k]=s.grid[j][i];}
  const vals=axis==="Om"?s.Oms:s.ws,m=Math.min(...prof);let lo=null,hi=null;
  for(let k=0;k<n;k++)if(prof[k]-m<=1){if(lo===null)lo=vals[k];hi=vals[k];}
  return{lo,hi,prof};}
/* flat LCDM: 1-D profile in Om with w=-1 */
function fitLcdm(data,Oms){let best={chi2:Infinity};const c=Oms.map(Om=>{const r=chi2(Om,-1,data).chi2;if(r<best.chi2)best={chi2:r,Om};return r;});
  let lo=null,hi=null;for(let k=0;k<Oms.length;k++)if(c[k]-best.chi2<=1){if(lo===null)lo=Oms[k];hi=Oms[k];}return{best,curve:c,lo,hi};}
/* bin residuals in equal-count redshift bins using weights 1/e^2 */
function binResiduals(data,Om,w,off,nb){
  const idx=data.zhd.map((_,i)=>i).sort((a,b)=>data.zhd[a]-data.zhd[b]),D=comovingTable(Om,w),out=[],per=Math.ceil(idx.length/nb);
  for(let s=0;s<idx.length;s+=per){const part=idx.slice(s,s+per);let W=0,zs=0,rs=0;for(const i of part){const iv=1/(data.e[i]*data.e[i]),dl=(1+data.zhel[i])*Dc(D,data.zhd[i]),r=data.m[i]-off-5*Math.log10(dl);W+=iv;zs+=iv*data.zhd[i];rs+=iv*r;}out.push({z:zs/W,r:rs/W,err:1/Math.sqrt(W),n:part.length});}
  return out;}
function fromPantheon(P,zmin,excludeCalib=true){
  const d={zhd:[],zhel:[],m:[],e:[]};for(const r of P.rows){if(r[0]<zmin||(excludeCalib&&r[4]))continue;d.zhd.push(r[0]);d.zhel.push(r[1]);d.m.push(r[2]);d.e.push(r[3]);}return d;}
const api={comovingTable,Dc,chi2,residualCurve,linspace,scan,profile,fitLcdm,binResiduals,fromPantheon};
if(typeof module!=="undefined"&&module.exports)module.exports=api;root.CosmosDataCore=api;
})(typeof window!=="undefined"?window:globalThis);
