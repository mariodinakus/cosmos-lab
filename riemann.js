/* COSMOS LAB Riemann Zeta Lab UI: finite-height numerical experiments on the critical line. */
(function(){"use strict";
const R=window.CosmosRiemannCore,K=window.CosmosKit;
if(!R||!K){document.body.textContent="Riemann numerical engine unavailable.";return;}
const $=id=>document.getElementById(id);
const S={T:300,a:10,w:50},sh=K.Share.read();
if(sh)for(const k of["T","a","w"])if(typeof sh[k]==="number"&&Number.isFinite(sh[k]))S[k]=sh[k];
S.T=Math.min(1000,Math.max(100,Math.round(S.T/50)*50));
let zeros=[],ms=0,token=0;
const rT=$("rT"),rA=$("rA"),rW=$("rW");
function syncSliders(){rT.value=S.T;rW.value=S.w;rA.max=Math.max(1,S.T-S.w);S.a=Math.min(S.a,Number(rA.max));rA.value=S.a;$("oT").textContent=S.T;$("oA").textContent=S.a;$("oW").textContent=S.w;}
function sample(a,b,n){const t=[],z=[],re=[],im=[];for(let i=0;i<=n;i++){const x=a+(b-a)*i/n,zz=R.zeta(.5,x),th=R.theta(x);t.push(x);z.push(zz.re*Math.cos(th)-zz.im*Math.sin(th));re.push(zz.re);im.push(zz.im);}return{t,z,re,im};}
function drawWindow(){
  const a=S.a,b=a+S.w,n=Math.min(700,Math.max(240,Math.round(S.w*14))),d=sample(a,b,n),zin=zeros.filter(z=>z>=a&&z<=b);
  K.plot($("cZ"),{series:[{x:d.t,y:d.z,label:"Hardy Z(t)",color:"#00d4e8"},{x:[a,b],y:[0,0],color:"#ffffff55",width:1},{x:zin,y:zin.map(()=>0),type:"points",r:5,color:"#ffb347",label:"zeros ("+zin.length+")"}],xlim:[a,b],xlabel:"height t on the critical line",ylabel:"Z(t) = e^{iθ} ζ(½+it)"});
  K.plot($("cPath"),{series:[{x:d.re,y:d.im,label:"ζ(½+it), t in window",color:"#00d4e8",width:1.6},{x:[0],y:[0],type:"points",r:6,color:"#ffb347",label:"origin: a zero"}],xlabel:"Re ζ(½+it)",ylabel:"Im ζ(½+it)"});
  $("capZ").textContent="Each crossing of the white axis is a zero. The curve at the lower left passes through the origin of the complex plane at every zero — the same event seen two ways.";
}
function drawGlobal(){
  if(zeros.length<3)return;
  const x=[],y=[];zeros.forEach((z,i)=>{x.push(z);y.push(i+1-R.Nsmooth(z));});
  K.plot($("cN"),{series:[{x,y,type:"step",label:"N(T) − (θ(T)/π+1)",color:"#ff6b8b"},{x:[0,S.T],y:[0,0],color:"#ffffff55",width:1}],xlim:[0,S.T],xlabel:"height T",ylabel:"zero count minus smooth law"});
  const sp=R.spacings(zeros),h=K.histogram(sp,0,3,24,true),gx=[],gg=[],gp=[];for(let s=0;s<=3;s+=.03){gx.push(s);gg.push(R.gueWigner(s));gp.push(R.poisson(s));}
  K.plot($("cS"),{series:[{x:h.x,y:h.y,type:"bars",barWidth:h.width,label:"computed zero spacings ("+sp.length+")",color:"#00d4e8"},{x:gx,y:gg,label:"GUE (Wigner surmise)",color:"#ffb347"},{x:gx,y:gp,label:"Poisson (uncorrelated)",color:"#ff6b8b"}],xlim:[0,3],xlabel:"normalised spacing s",ylabel:"probability density"});
  const mean=sp.reduce((a,b)=>a+b,0)/sp.length,v=sp.reduce((a,b)=>a+(b-mean)*(b-mean),0)/sp.length,mx=Math.max(...y.map(Math.abs));
  $("reads").innerHTML=[["ZEROS FOUND",zeros.length],["SMOOTH LAW θ(T)/π+1",R.Nsmooth(S.T).toFixed(1)],["MAX |COUNT − SMOOTH|",mx.toFixed(2)],["SPACING VARIANCE",v.toFixed(3)+" (GUE≈0.18, Poisson=1)"],["COMPUTE TIME",ms.toFixed(0)+" ms"]].map(r=>"<div><small>"+r[0]+"</small><strong>"+r[1]+"</strong></div>").join("");
  $("hZeros").textContent=zeros.length;$("hMax").textContent=S.T;$("hVar").textContent=v.toFixed(3);
  const err=Math.max(...R.KNOWN.map((k,i)=>Math.abs(zeros[i]-k)));$("hErr").textContent=err.toExponential(0).replace("e-","e−");
  $("knownBody").innerHTML=R.KNOWN.map((k,i)=>"<tr><td>"+(i+1)+"</td><td>"+zeros[i].toFixed(9)+"</td><td>"+k.toFixed(9)+"</td><td>"+Math.abs(zeros[i]-k).toExponential(1)+"</td></tr>").join("");
}
async function run(){
  const my=++token,T=S.T,t0=performance.now();zeros=[];$("status").textContent="Finding zeros…";$("runBtn").disabled=true;
  const chunk=25,step=.04;
  for(let a=1;a<T;a+=chunk){if(my!==token)return;
    const part=R.findZeros(a,Math.min(a+chunk,T)+step,step).filter(z=>z>=a&&z<a+chunk&&z<=T);for(const z of part)zeros.push(z);
    $("status").textContent="Finding zeros… t ≈ "+Math.min(a+chunk,T).toFixed(0)+" / "+T+"  ("+zeros.length+" so far)";
    await new Promise(r=>setTimeout(r,0));}
  ms=performance.now()-t0;$("runBtn").disabled=false;$("csvBtn").disabled=false;$("jsonBtn").disabled=false;
  $("status").textContent="Done: "+zeros.length+" zeros up to T = "+T+" in "+ms.toFixed(0)+" ms. Every one found by sign change of Z(t).";
  syncSliders();drawGlobal();drawWindow();
}
rT.oninput=()=>{S.T=Number(rT.value);syncSliders();};rT.onchange=run;
rA.oninput=()=>{S.a=Number(rA.value);$("oA").textContent=S.a;requestAnimationFrame(drawWindow);};
rW.oninput=()=>{S.w=Number(rW.value);syncSliders();requestAnimationFrame(drawWindow);};
$("runBtn").onclick=run;
$("shareBtn").onclick=()=>K.Share.copy({...S},$("shareBtn"));
$("csvBtn").onclick=()=>K.download("riemann-zeros.csv",K.csv([["index","t"],...zeros.map((z,i)=>[i+1,z])]),"text/csv");
$("jsonBtn").onclick=()=>K.download("riemann-zeros.json",JSON.stringify({generated:new Date().toISOString(),note:"Numerical zeros of zeta on the critical line; evidence at finite height, not a proof of RH.",params:S,count:zeros.length,zeros,spacings:R.spacings(zeros)},null,2),"application/json");
syncSliders();run();
})();
