/* COSMOS LAB real-data page: Pantheon+ supernova fit in the browser. */
(function(){"use strict";
const D=window.CosmosDataCore,K=window.CosmosKit,P=window.PANTHEON_PLUS;
if(!D||!K||!P){document.body.textContent="Data engine unavailable.";return;}
const $=id=>document.getElementById(id);
const S={zmin:0.01},sh=K.Share.read();if(sh&&typeof sh.zmin==="number"&&sh.zmin>=0.001&&sh.zmin<=0.5)S.zmin=sh.zmin;
const Oms=D.linspace(0.05,0.7,66),ws=D.linspace(-2,-0.2,73);
let result=null,timer=null;
function heat(canvas,sc){
  const g=canvas.getContext("2d"),W=canvas.width,H=canvas.height,pad={l:68,r:22,t:28,b:48},x0=Oms[0],x1=Oms[Oms.length-1],y0=ws[0],y1=ws[ws.length-1];
  g.fillStyle="#06151b";g.fillRect(0,0,W,H);
  const X=v=>pad.l+(v-x0)/(x1-x0)*(W-pad.l-pad.r),Y=v=>H-pad.b-(v-y0)/(y1-y0)*(H-pad.t-pad.b),cw=(W-pad.l-pad.r)/(Oms.length-1)+1,ch=(H-pad.t-pad.b)/(ws.length-1)+1,min=sc.best.chi2;
  const cols=[[2.30,"#00d4e8"],[6.18,"#2a9db0"],[11.83,"#16606e"],[Infinity,"#0a2a33"]];
  for(let j=0;j<ws.length;j++)for(let i=0;i<Oms.length;i++){const d=sc.grid[j][i]-min,c=cols.find(c=>d<=c[0])[1];g.fillStyle=c;g.fillRect(X(Oms[i])-cw/2,Y(ws[j])-ch/2,cw,ch);}
  g.strokeStyle="#a1bec7";g.strokeRect(pad.l,pad.t,W-pad.l-pad.r,H-pad.t-pad.b);g.font="12px Arial,sans-serif";g.fillStyle="#a1bec7";g.textAlign="center";
  for(const v of K.niceTicks(x0,x1,6))g.fillText(v.toFixed(2),X(v),H-pad.b+17);g.textAlign="right";for(const v of K.niceTicks(y0,y1,6))g.fillText(v.toFixed(1),pad.l-8,Y(v)+4);
  g.fillStyle="#e5fdff";g.textAlign="center";g.fillText("matter density Ωm",pad.l+(W-pad.l-pad.r)/2,H-8);g.save();g.translate(15,pad.t+(H-pad.t-pad.b)/2);g.rotate(-Math.PI/2);g.fillText("dark-energy equation of state w",0,0);g.restore();
  g.setLineDash([5,4]);g.strokeStyle="#ffb347";g.beginPath();g.moveTo(pad.l,Y(-1));g.lineTo(W-pad.r,Y(-1));g.stroke();g.setLineDash([]);g.fillStyle="#ffb347";g.textAlign="left";g.fillText("w = −1 (cosmological constant)",pad.l+8,Y(-1)-6);
  g.fillStyle="#fff";g.beginPath();g.arc(X(sc.best.Om),Y(sc.best.w),6,0,6.3);g.fill();g.fillStyle="#fff";g.fillText("best fit",X(sc.best.Om)+9,Y(sc.best.w)+4);
}
function compute(){
  const d=D.fromPantheon(P,S.zmin,true),t0=performance.now();
  if(d.zhd.length<50){$("status").textContent="Too few supernovae after the cut; lower the minimum redshift.";return;}
  const L=D.fitLcdm(d,Oms),sc=D.scan(d,Oms,ws),pOm=D.profile(sc,"Om"),pW=D.profile(sc,"w"),eds=D.chi2(1,-1,d),lc=D.chi2(L.best.Om,-1,d),wc=D.chi2(sc.best.Om,sc.best.w,d),empty=D.chi2(0.001,-1,d);
  const zs=D.linspace(0.005,2.3,300),mu=(Om,w)=>D.residualCurve(Om,w,d,zs),ref=mu(L.best.Om,-1),shift=(m,off)=>m.map((v,i)=>v+off-lc.offset-ref[i]);
  const bins=D.binResiduals(d,L.best.Om,-1,lc.offset,22);
  result={d,L,sc,pOm,pW,eds,lc,wc,empty,zs,bins,ms:performance.now()-t0,ref,mu,shift};draw();
}
function draw(){
  const{d,L,sc,pOm,pW,eds,lc,wc,empty,zs,bins,ref,mu,shift}=result;
  const stride=Math.max(1,Math.floor(d.zhd.length/1700)),lx=[],ly=[];for(let i=0;i<d.zhd.length;i+=stride){lx.push(Math.log10(d.zhd[i]));ly.push(d.m[i]-lc.offset);}
  const cz=zs.filter(z=>z>=d.zhd.reduce((a,b)=>Math.min(a,b),9)*.9);
  K.plot($("cRaw"),{series:[{x:lx,y:ly,type:"points",r:1.7,color:"#00d4e888",label:"supernovae ("+d.zhd.length+")"},{x:zs.map(Math.log10),y:ref,color:"#ffb347",label:"best flat ΛCDM"}],xlim:[Math.log10(S.zmin)-.02,Math.log10(2.4)],xlabel:"log10 redshift z",ylabel:"m_B − offset  (≈ distance modulus)"});
  const eOff=eds.offset,wOff=wc.offset;
  K.plot($("cRes"),{series:[{x:zs,y:shift(mu(1,-1),eOff),color:"#ff6b8b",label:"Einstein–de Sitter (Ωm=1)"},{x:zs,y:shift(mu(sc.best.Om,sc.best.w),wOff),color:"#7bd88f",label:"best wCDM"},{x:[0,2.4],y:[0,0],color:"#ffb347",label:"best ΛCDM"},{x:bins.map(b=>b.z),y:bins.map(b=>b.r),err:bins.map(b=>b.err),type:"points",r:4.5,color:"#fff",label:"binned data"}],xlim:[0,2.3],ylim:[-.5,.5],xlabel:"redshift z",ylabel:"Δμ relative to best ΛCDM (mag)"});
  heat($("cHeat"),sc);
  const prof=L.curve.map(c=>c-L.best.chi2);
  K.plot($("cProf"),{series:[{x:Oms,y:prof,color:"#00d4e8",label:"flat ΛCDM: Δχ²(Ωm)"},{x:[Oms[0],Oms.at(-1)],y:[1,1],color:"#ff6b8b",label:"Δχ² = 1"}],ylim:[0,30],xlim:[Oms[0],Oms.at(-1)],xlabel:"matter density Ωm",ylabel:"Δχ²",vlines:[{x:0.334,color:"#7bd88f",label:"Pantheon+ (stat+sys) 0.334±0.018"}]});
  const dW=lc.chi2-wc.chi2,fm=(a,b,n)=>a==null?"—":a.toFixed(n)+" … "+b.toFixed(n);
  $("reads").innerHTML=[["ΛCDM Ωm (1σ, DIAG ERRORS)",L.best.Om.toFixed(3)+" ("+fm(L.lo,L.hi,3)+")"],["wCDM BEST (Ωm, w)",sc.best.Om.toFixed(2)+", "+sc.best.w.toFixed(2)],["w 1σ (PROFILE)",fm(pW.lo,pW.hi,2)],["χ² ΛCDM / N",lc.chi2.toFixed(1)+" / "+d.zhd.length],["Δχ² ΛCDM → wCDM",dW.toFixed(2)+" for 1 extra parameter"],["Δχ² NO DARK ENERGY",(eds.chi2-lc.chi2).toFixed(0)]].map(r=>"<div><small>"+r[0]+"</small><strong>"+r[1]+"</strong></div>").join("");
  $("hN").textContent=d.zhd.length;$("hOm").textContent=L.best.Om.toFixed(2);$("hW").textContent=sc.best.w.toFixed(2);$("hD").textContent=(eds.chi2-lc.chi2).toFixed(0);
  $("status").textContent="Fit done in "+result.ms.toFixed(0)+" ms. "+(dW<4?"wCDM does not significantly improve on a cosmological constant (Δχ² = "+dW.toFixed(1)+").":"wCDM improves χ² by "+dW.toFixed(1)+" with one extra parameter; with full covariance this shrinks.");
}
$("rz").oninput=()=>{S.zmin=Number($("rz").value);$("oz").textContent=S.zmin.toFixed(3);clearTimeout(timer);timer=setTimeout(compute,120);};
$("shareBtn").onclick=()=>K.Share.copy({...S},$("shareBtn"));
$("csvBtn").onclick=()=>result&&K.download("pantheon-binned-residuals.csv",K.csv([["z","residual_mag","err_mag","n"],...result.bins.map(b=>[b.z,b.r,b.err,b.n])]),"text/csv");
$("jsonBtn").onclick=()=>result&&K.download("pantheon-fit.json",JSON.stringify({generated:new Date().toISOString(),dataset:P.meta,zmin:S.zmin,n:result.d.zhd.length,limitations:P.meta.note,lcdm:{Om:result.L.best.Om,chi2:result.lc.chi2,range1sigma:[result.L.lo,result.L.hi]},wcdm:{Om:result.sc.best.Om,w:result.sc.best.w,chi2:result.wc.chi2,w1sigma:[result.pW.lo,result.pW.hi]},einsteinDeSitterChi2:result.eds.chi2},null,2),"application/json");
$("rz").value=S.zmin;$("oz").textContent=S.zmin.toFixed(3);compute();
})();
