/* COSMOS LAB Chaos Forge — interactive, deterministic logistic map.
   Numerical observations are finite-run estimates, not empirical claims. */
(function(){"use strict";
const C=window.CosmosChaosCore;
if(!C){document.body.textContent="Chaos numerical engine unavailable.";return;}
const $=id=>document.getElementById(id),cyan="#00d4e8",white="#f4fdff",black="#06151b",line="#34535c",dim="#a1bec7";
const rMin=2.7,rMax=4;
const canvases=["bifCanvas","lyapCanvas","cobwebCanvas","orbitCanvas","sensitivityCanvas"].map($);
const [bif,lyap,cobweb,orbits,sensitivity]=canvases;
const bifPoints=C.bifurcation(rMin,rMax,750,75,550);
const expCurve=C.exponentCurve(rMin,rMax,400);
let r=3.9,x0=.2133,logEps=-8,speed=1,playing=true,n=0,x=x0,xTwin=x0+1e-8,history=[],lastTime=0,accumulator=0,selectedLyap=0,period=null,paintedOnce=false;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pad={l:62,r:25,t:24,b:38};
function context(canvas){return canvas.getContext("2d",{alpha:false});}
function base(canvas,withGrid=true){
  const g=context(canvas),W=canvas.width,H=canvas.height;
  g.fillStyle=black;g.fillRect(0,0,W,H);
  if(withGrid){g.strokeStyle="#294c5570";g.lineWidth=1;for(let i=0;i<=8;i++){let xx=pad.l+(W-pad.l-pad.r)*i/8;g.beginPath();g.moveTo(xx,pad.t);g.lineTo(xx,H-pad.b);g.stroke();}
  for(let i=0;i<=4;i++){let yy=pad.t+(H-pad.t-pad.b)*i/4;g.beginPath();g.moveTo(pad.l,yy);g.lineTo(W-pad.r,yy);g.stroke();}}
  g.font="12px Arial, sans-serif";g.textAlign="left";g.fillStyle=dim;
  return g;
}
function text(g,s,x,y,color=dim,align="left",size=12){g.font="700 "+size+"px Arial, sans-serif";g.fillStyle=color;g.textAlign=align;g.fillText(s,x,y);}
function xpos(canvas,z,xmin=rMin,xmax=rMax){return pad.l+(z-xmin)/(xmax-xmin)*(canvas.width-pad.l-pad.r);}
function ypos(canvas,z,ymin=0,ymax=1){return canvas.height-pad.b-(z-ymin)/(ymax-ymin)*(canvas.height-pad.t-pad.b);}
function polyline(g,points,xx,yy,color,width=1.8){
  if(points.length===0)return;g.strokeStyle=color;g.lineWidth=width;g.beginPath();
  let started=false;for(const p of points){const x=xx(p),y=yy(p);if(!Number.isFinite(x)||!Number.isFinite(y)){started=false;continue;}if(!started){g.moveTo(x,y);started=true;}else g.lineTo(x,y);}
  g.stroke();
}
function dash(g,x1,y1,x2,y2,color="#bdd8de"){g.strokeStyle=color;g.lineWidth=1;g.setLineDash([6,6]);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.setLineDash([]);}
function mark(g,x,y,color=cyan,rad=5){g.beginPath();g.arc(x,y,rad,0,2*Math.PI);g.fillStyle=color;g.fill();}
function drawBif(){
 const g=base(bif);g.fillStyle="#a7c6cf88";
 for(const p of bifPoints){g.fillRect(xpos(bif,p[0]),ypos(bif,p[1]),1.05,1.05);}
 const xx=xpos(bif,r);dash(g,xx,pad.t,xx,bif.height-pad.b,cyan);
 text(g,"r = "+r.toFixed(4),clamp(xx,90,bif.width-105),35,cyan,"center",13);
 text(g,"2.7",pad.l,bif.height-12,white);text(g,"4.0",bif.width-pad.r,bif.height-12,white,"right");
 text(g,"LONG-RUN STATE x",pad.l+6,16,dim);text(g,"0",pad.l-13,ypos(bif,0)+3,dim,"right");text(g,"1",pad.l-13,ypos(bif,1)+3,dim,"right");
}
function drawLyap(){
 const g=base(lyap),min=-2.3,max=.85;
 const yy=v=>ypos(lyap,clamp(v,min,max),min,max);
 dash(g,pad.l,yy(0),lyap.width-pad.r,yy(0),"#ffffff99");
 for(let i=1;i<expCurve.length;i++){
 const a=expCurve[i-1],b=expCurve[i];g.beginPath();g.moveTo(xpos(lyap,a.r),yy(a.lambda));g.lineTo(xpos(lyap,b.r),yy(b.lambda));g.strokeStyle=b.lambda>=0?cyan:white;g.lineWidth=1.7;g.stroke();}
 const xx=xpos(lyap,r);dash(g,xx,pad.t,xx,lyap.height-pad.b,cyan);
 mark(g,xx,yy(selectedLyap),cyan,5);
 text(g,"λ = "+selectedLyap.toFixed(4),clamp(xx,100,lyap.width-125),34,cyan,"center",13);
 text(g,"λ = 0",pad.l+8,yy(0)-7,white);text(g,"r = 2.7",pad.l,lyap.height-11,dim);text(g,"r = 4",lyap.width-pad.r,lyap.height-11,dim,"right");
}
function drawCobweb(){
 const g=base(cobweb,false),W=cobweb.width,H=cobweb.height;
 const size=Math.min(W-110,H-95),L=(W-size)/2,T=(H-size)/2;
 const X=v=>L+v*size,Y=v=>T+(1-v)*size;
 g.strokeStyle="#385865";g.strokeRect(L,T,size,size);
 g.beginPath();g.moveTo(X(0),Y(0));g.lineTo(X(1),Y(1));g.strokeStyle=white;g.lineWidth=1.2;g.stroke();
 g.beginPath();for(let i=0;i<=300;i++){const t=i/300;const yy=r*t*(1-t);if(i===0)g.moveTo(X(t),Y(yy));else g.lineTo(X(t),Y(yy));}
 g.strokeStyle=cyan;g.lineWidth=3;g.stroke();
 const recent=history.slice(-25);
 if(recent.length>1){
   g.strokeStyle="#ffffffa8";g.lineWidth=1.5;g.beginPath();let began=false;
   for(let i=1;i<recent.length;i++){const a=recent[i-1].a,b=recent[i].a;
     if(!began){g.moveTo(X(a),Y(a));began=true;}
     g.lineTo(X(a),Y(b));g.lineTo(X(b),Y(b));}
   g.stroke();const current=recent[recent.length-1].a;mark(g,X(current),Y(current),white,6);
 }
 text(g,"x(n+1) = r·x(n)·(1-x(n))",20,25,cyan);
 text(g,"IDENTITY / y=x",W-20,25,white,"right");
 text(g,"0",L,H-12);text(g,"1",L+size,H-12,white,"right");
}
function drawOrbits(){
 const g=base(orbits);
 const rows=history.slice(-165);if(rows.length<2)return;
 const lo=rows[0].n,hi=Math.max(rows[rows.length-1].n,lo+1);
 const X=q=>xpos(orbits,q.n,lo,hi),Y=q=>ypos(orbits,q.a,0,1),Y2=q=>ypos(orbits,q.b,0,1);
 polyline(g,rows,X,Y,cyan,2.7);polyline(g,rows,X,Y2,white,1.6);
 const last=rows[rows.length-1];mark(g,X(last),Y(last),cyan,5);mark(g,X(last),Y2(last),white,3);
 text(g,"CYAN: xₙ",pad.l+8,17,cyan);text(g,"WHITE: xₙ + δ",orbits.width-pad.r,17,white,"right");
 text(g,"n = "+lo,pad.l,orbits.height-10,dim);
 text(g,"n = "+hi,orbits.width-pad.r,orbits.height-10,dim,"right");
}
function drawSensitivity(){
 const g=base(sensitivity),rows=history.slice(-260);if(rows.length<2)return;
 const lo=rows[0].n,hi=rows[rows.length-1].n;
 const X=q=>xpos(sensitivity,q.n,lo,hi);
 const Y=q=>ypos(sensitivity,clamp(Math.log10(Math.max(1e-15,q.separation)),-15,0),-15,0);
 polyline(g,rows,X,Y,cyan,2.8);
 const last=rows[rows.length-1];mark(g,X(last),Y(last),white,4);
 text(g,"log₁₀ Δx",pad.l+6,17,white);text(g,"−15",pad.l-6,sensitivity.height-pad.b,dim,"right");text(g,"0",pad.l-6,pad.t+6,dim,"right");
 text(g,"n = "+lo,pad.l,sensitivity.height-10,dim);text(g,"n = "+hi,sensitivity.width-pad.r,sensitivity.height-10,dim,"right");
}
function updateReadouts(){
 const a=history[history.length-1];const lambda=selectedLyap;
 $("stepReadout").textContent=String(n);
 $("sepReadout").textContent=a.separation<1e-4?a.separation.toExponential(2):a.separation.toFixed(5);
 $("periodReadout").textContent=period===null?"NOT RESOLVED":String(period);
 $("regimeReadout").textContent=lambda>.015?"POSITIVE λ":lambda<-.015?"NEGATIVE λ":"NEAR ZERO";
 $("headlineR").textContent=r.toFixed(4);
 $("headlineLyap").textContent=lambda.toFixed(3);
 $("modeBadge").textContent=lambda>.015?"● SENSITIVE REGIME":lambda<-.015?"● STABLE / PERIODIC":"● NEAR TRANSITION";
}
function step(){
 x=C.logistic(r,x);xTwin=C.logistic(r,xTwin);n++;
 history.push({n,a:x,b:xTwin,separation:Math.abs(x-xTwin)});
 if(history.length>800)history.shift();
}
function drawDynamic(){drawCobweb();drawOrbits();drawSensitivity();updateReadouts();}
function restart(){
 n=0;x=x0;xTwin=clamp(x0+Math.pow(10,logEps),0,1);
 history=[{n:0,a:x,b:xTwin,separation:Math.abs(x-xTwin)}];
 accumulator=0;
 drawDynamic();
}
function updateParameters(type){
 r=Number($("rInput").value);x0=Number($("xInput").value);logEps=Number($("epsInput").value);
 $("rOut").textContent=r.toFixed(4);$("xOut").textContent=x0.toFixed(5);
 $("epsOut").textContent="1e"+(logEps<0?"−"+Math.abs(logEps):logEps);
 selectedLyap=C.lyapunov(r,x0,950,2200);
 period=C.approxPeriod(r,x0,1500,16,1e-5);
 drawBif();drawLyap();restart();
 if(type==="parameter")$("interactionStatus").textContent="Parameters changed; the experiment restarted to keep the history consistent.";
}
function syncPreset(v){$("rInput").value=v;updateParameters("parameter");}
$("preset").addEventListener("change",()=>syncPreset($("preset").value));
$("rInput").addEventListener("input",()=>{$("preset").selectedIndex=-1;updateParameters("parameter");});
$("xInput").addEventListener("input",()=>updateParameters("parameter"));
$("epsInput").addEventListener("input",()=>updateParameters("parameter"));
$("speedInput").addEventListener("input",()=>{speed=Number($("speedInput").value);$("speedOut").textContent=speed.toFixed(2)+"×";});
$("playButton").addEventListener("click",()=>{playing=!playing;$("playButton").textContent=playing?"Ⅱ PAUSE":"▶ RESUME";$("interactionStatus").textContent=playing?"Animation resumed.":"Animation paused.";});
$("stepButton").addEventListener("click",()=>{playing=false;$("playButton").textContent="▶ RESUME";step();drawDynamic();$("interactionStatus").textContent="Advanced one exact logistic-map iteration.";});
$("resetButton").addEventListener("click",()=>{restart();$("interactionStatus").textContent="Iteration reset; parameters preserved.";});
bif.addEventListener("click",event=>{
 const bounds=bif.getBoundingClientRect();const pixel=(event.clientX-bounds.left)/bounds.width*bif.width;
 const value=clamp(rMin+(pixel-pad.l)/(bif.width-pad.l-pad.r)*(rMax-rMin),rMin,rMax);
 $("rInput").value=value.toFixed(4);$("preset").selectedIndex=-1;updateParameters("parameter");
 $("interactionStatus").textContent="Bifurcation selected: r = "+r.toFixed(4)+".";
});
function download(name,data,type){
 const url=URL.createObjectURL(new Blob([data],{type}));const anchor=document.createElement("a");
 anchor.href=url;anchor.download=name;document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
$("downloadButton").addEventListener("click",()=>{
 const header="iteration,x,x_perturbed,separation,r,x0,delta0,lyapunov_estimate";
 const data=history.map(h=>[h.n,h.a,h.b,h.separation,r,x0,Math.pow(10,logEps),selectedLyap].join(","));
 download("cosmos-chaos-"+r.toFixed(4)+".csv",[header,...data].join("\n"),"text/csv;charset=utf-8");
});
$("captureButton").addEventListener("click",()=>{
 const composite=document.createElement("canvas");composite.width=1200;composite.height=1600;
 const g=composite.getContext("2d");g.fillStyle="#080e11";g.fillRect(0,0,1200,1600);
 text(g,"COSMOS LAB  /  CHAOS FORGE",40,50,cyan,"left",27);
 text(g,"r = "+r.toFixed(4)+"    λ ≈ "+selectedLyap.toFixed(4)+"    n = "+n,40,78,white,"left",18);
 g.drawImage(bif,40,110,1120,420);g.drawImage(lyap,40,553,1120,255);
 g.drawImage(cobweb,40,833,545,380);g.drawImage(orbits,615,833,545,380);
 g.drawImage(sensitivity,40,1232,1120,265);
 text(g,"Finite-time numerical illustration — not physical measurement.",40,1560,white);
 composite.toBlob(blob=>{if(blob){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="cosmos-chaos-forge.png";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}},"image/png");
});
$("shareButton").addEventListener("click",async()=>{
 const u=new URL(location.href);u.searchParams.set("r",r.toFixed(4));u.searchParams.set("x0",x0.toFixed(5));u.searchParams.set("delta",logEps);
 try{if(!navigator.clipboard)throw Error("clipboard not available");await navigator.clipboard.writeText(u.href);$("interactionStatus").textContent="Experiment link copied.";}
 catch{$("interactionStatus").textContent="Copy this address to share the setup: "+u.href;}
});
function frame(t){
 if(!lastTime)lastTime=t;const dt=clamp(t-lastTime,0,100);lastTime=t;
 if(playing){accumulator+=dt*speed/100;
   const steps=Math.min(Math.floor(accumulator),24);
   if(steps){accumulator-=steps;for(let i=0;i<steps;i++)step();drawDynamic();}
 }
 requestAnimationFrame(frame);
}
const initial=new URLSearchParams(location.search);
if(initial.has("r")){$("rInput").value=clamp(Number(initial.get("r"))||3.9,rMin,rMax);}
if(initial.has("x0")){$("xInput").value=clamp(Number(initial.get("x0"))||.2133,.001,.999);}
if(initial.has("delta")){$("epsInput").value=clamp(Number(initial.get("delta"))||-8,-12,-3);}
updateParameters("init");requestAnimationFrame(frame);
})();