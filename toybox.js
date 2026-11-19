/* COSMOS LAB / Toy Universe — canvas rendering, input, live time-series.
   Engine: toy-core.js. The models remain finite and synthetic. */
(()=>{"use strict";
const C=window.CosmosToyCore;if(!C)throw Error("Toy Universe numerical engine missing");
const $=id=>document.getElementById(id),canvas=$("toyCanvas"),g=canvas.getContext("2d"),plot=$("metricCanvas"),pg=plot.getContext("2d");
const CYAN="#00d4e8",WHITE="#fff",DARK="#07151b",DIM="#9dbdc7",SLATE="#385862",TAU=Math.PI*2;
let current=null,model="wave",seed=1729,playing=true,alt=false,accum=0,last=0,activeMouse=false,filter="",newtonCache=null,lastGridImage=null,lastInteraction=0;
const list=C.MODES;
function fmt(n,d=4){if(!Number.isFinite(n))return "—";if(n===0)return "0";if(Math.abs(n)<1e-4||Math.abs(n)>=10000)return n.toExponential(2);return String(Number(n.toFixed(d)));}
function notice(s){$("actionStatus").textContent=s;}
function note(s){$("interactionStatus").textContent=s;}
function tag(s){return s.toUpperCase().replace(/[^A-Z0-9 ]/g,"");}
function buildList(){let shown=0;const host=$("modelList");host.textContent="";list.forEach((m,i)=>{const searchable=[m.id,m.name,m.tag,m.desc].join(" ").toLowerCase();if(!searchable.includes(filter))return;shown++;const b=document.createElement("button");b.type="button";b.className="model-opt"+(model===m.id?" active":"");b.setAttribute("aria-pressed",String(model===m.id));const num=document.createElement("span");num.textContent=String(i+1).padStart(2,"0");const inner=document.createElement("div"),title=document.createElement("strong"),category=document.createElement("small");title.textContent=m.name;category.textContent=m.tag;inner.append(title,category);b.append(num,inner);b.onclick=()=>select(m.id);host.appendChild(b);});$("modelCount").textContent=String(shown);}
function paramsHtml(){const host=$("paramGrid");host.textContent="";for(const [key,label,min,max,,,step] of []){}for(const [key,label,min,max,initial,step] of current.state.spec.params){const p=current.state.p;const container=document.createElement("div");container.className="pfield";const name=document.createElement("label"),output=document.createElement("output"),input=document.createElement("input");input.id="toyparam-"+key;name.htmlFor=input.id;name.textContent=label;output.textContent=fmt(p[key],3);name.appendChild(output);input.type="range";input.min=min;input.max=max;input.step=step;input.value=p[key];input.oninput=()=>{const values={...current.state.p,[key]:Number(input.value)};output.textContent=fmt(values[key],3);select(model,values,seed,true);};container.append(name,input);host.appendChild(container);}}
function select(id,values=null,newSeed=null,retain=false){const spec=list.find(m=>m.id===id);if(!spec)return;
model=id;if(newSeed!==null)seed=Number(newSeed)>>>0;if(!seed)seed=1729;
const params=values||{};current=C.create(id,params,seed);newtonCache=null;lastGridImage=null;accum=0;last=0;alt=false;
$("altButton").textContent="⊞ ALT ACTION: OFF";$("altButton").setAttribute("aria-pressed","false");
$("modelName").textContent=spec.name.toUpperCase();$("modelTag").textContent=spec.tag+" / MODEL "+String(list.indexOf(spec)+1).padStart(2,"0");
$("modelDesc").textContent=spec.desc;$("interactionHelp").textContent=spec.help;
$("modelHelp").textContent=spec.help+" All parameters and initial states are toy-model assumptions.";
$("formula").textContent=spec.formula;
$("metricName").textContent="MODEL METRIC / "+spec.tag;$("seedValue").textContent=String(seed);$("graphLabel").textContent=spec.tag+" / NUMERICAL TIME SERIES";
buildList();if(!retain)paramsHtml();else{const els=$("paramGrid").querySelectorAll("input");els.forEach(input=>{const key=input.id.replace("toyparam-","");if(Object.hasOwn(current.state.p,key))input.value=current.state.p[key];});}
if(id==="newton")generateNewton();
render();refreshReadouts();
if(!retain)notice("Selected "+spec.name+". Tap the simulation to interact.");
}
function reset(reseed=false){if(reseed)seed=(Math.imul(seed,1664525)+1013904223)>>>0;select(model,{...current.state.p},seed);notice(reseed?"New reproducible seed: "+seed:"Model restarted with current parameters.");}
function base(ctx,W=canvas.width,H=canvas.height){ctx.fillStyle=DARK;ctx.fillRect(0,0,W,H);
ctx.strokeStyle="#2b576033";ctx.lineWidth=1;for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}}
function label(ctx,s,x,y,color=WHITE,size=14,align="left"){ctx.fillStyle=color;ctx.font="800 "+size+"px Inter,Arial,sans-serif";ctx.textAlign=align;ctx.fillText(s,x,y);}
function circle(ctx,x,y,r,col){ctx.beginPath();ctx.arc(x,y,Math.max(0,r),0,TAU);ctx.fillStyle=col;ctx.fill();}
function strokeCircle(ctx,x,y,r,col,lineW=2){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.strokeStyle=col;ctx.lineWidth=lineW;ctx.stroke();}
function drawGridPixels(w,h,pixel){const off=lastGridImage&&lastGridImage.width===w&&lastGridImage.height===h?lastGridImage:document.createElement("canvas");off.width=w;off.height=h;lastGridImage=off;const oc=off.getContext("2d"),img=oc.createImageData(w,h);
for(let j=0;j<w*h;j++){const col=pixel(j),k=4*j;img.data[k]=col[0];img.data[k+1]=col[1];img.data[k+2]=col[2];img.data[k+3]=255;}
oc.putImageData(img,0,0);g.imageSmoothingEnabled=false;g.drawImage(off,0,0,canvas.width,canvas.height);g.imageSmoothingEnabled=true;
}
function mapMonochrome(v){const t=C.clamp(v,0,1);return [Math.round(4+25*t),Math.round(22+205*t),Math.round(31+221*t)];}
function drawField(){
 const s=current.state,W=canvas.width,H=canvas.height,id=s.id;
 base(g,W,H);const measure=current.measure();
 if(["wave","heat","life","ant","sand","percolation","dla"].includes(id)){
  const w=id==="dla"?s.cols:96,h=id==="dla"?s.rows:64;
  drawGridPixels(w,h,j=>{
   let z=s.u[j]||0;
   if(id==="wave"){if(s.wall[j])return[235,247,250];const t=C.clamp(Math.abs(z)/3,0,1);return z<0?[Math.round(15+225*t),Math.round(38+210*t),Math.round(55+197*t)]:mapMonochrome(t);}
   if(id==="heat")return z<0?[Math.round(4+240*C.clamp(-z/9,0,1)),Math.round(17+230*C.clamp(-z/9,0,1)),Math.round(21+230*C.clamp(-z/9,0,1))]:mapMonochrome(C.clamp(z/9,0,1));
   if(id==="life"||id==="ant")return z?[0,212,232]:[7,21,27];
   if(id==="sand"){const v=Math.min(4,z);return v<1?[7,21,27]:v<2?[24,72,80]:v<3?[0,150,167]:v<4?[0,212,232]:[246,252,255];}
   if(id==="percolation")return !z?[7,21,27]:s.wet[j]?[0,212,232]:[92,125,137];
   if(id==="dla")return z?[0,212,232]:[7,21,27];
   return[7,21,27];
  });
  if(id==="ant"){circle(g,(s.ant.x+.5)/w*W,(s.ant.y+.5)/h*H,7,WHITE);}
  if(id==="dla"){for(const t of s.walkers){circle(g,t.x/w*W,t.y/h*H,2,WHITE);}}
 }else if(id==="boids"){
  for(const a of s.agents){const X=a.x*W,Y=a.y*H,angle=Math.atan2(a.vy,a.vx);g.save();g.translate(X,Y);g.rotate(angle);g.fillStyle=CYAN;g.beginPath();g.moveTo(10,0);g.lineTo(-7,-4);g.lineTo(-7,4);g.fill();g.restore();}
  strokeCircle(g,s.target.x*W,s.target.y*H,17,WHITE,2);label(g,"ATTRACTOR",s.target.x*W+22,s.target.y*H-9,WHITE,12);
 }else if(id==="field"){
  const smallW=120,smallH=70;drawGridPixels(smallW,smallH,j=>{const x=(j%smallW)/smallW,y=Math.floor(j/smallW)/smallH;let fx=0,fy=0;for(const q of s.charges){const dx=x-q.x,dy=y-q.y,d=(dx*dx+dy*dy+.004)**1.5;fx+=q.q*dx/d;fy+=q.q*dy/d;}return mapMonochrome(C.clamp(Math.log1p(Math.hypot(fx,fy)*.3)/6,0,.6));});
  for(const t of s.tracers)circle(g,t.x*W,t.y*H,2.2,CYAN);
  for(const q of s.charges){const X=q.x*W,Y=q.y*H;strokeCircle(g,X,Y,14,WHITE,2);circle(g,X,Y,12,q.q>0?CYAN:WHITE);label(g,q.q>0?"+":"−",X,Y+5,DARK,17,"center");}
 }else if(id==="kuramoto"){
  const cx=W*.5,cy=H*.5,r=Math.min(W*.38,H*.37);strokeCircle(g,cx,cy,r,"#7db2bf",2);
  let mx=0,my=0;for(let i=0;i<s.phases.length;i++){const theta=s.phases[i],rr=r*(.72+(.28*i/s.phases.length)),x=cx+rr*Math.cos(theta),y=cy+rr*Math.sin(theta);circle(g,x,y,3.6,i%3===0?WHITE:CYAN);mx+=Math.cos(theta);my+=Math.sin(theta);}
  mx/=s.phases.length;my/=s.phases.length;g.strokeStyle=WHITE;g.lineWidth=5;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+mx*r,cy+my*r);g.stroke();circle(g,cx+mx*r,cy+my*r,8,CYAN);circle(g,cx,cy,6,WHITE);
  label(g,"ORDER PARAMETER / R = "+fmt(Math.hypot(mx,my)),20,H-27,WHITE,14);
 }else if(id==="henon"){
  g.fillStyle=CYAN;
  for(const p of s.points){const x=W*(p.x+1.65)/3.3,y=H*(.6-p.y)/1.2;if(x>=0&&y>=0&&x<W&&y<H)g.fillRect(x,y,1.6,1.6);}
  label(g,s.points.length+" ITERATES",20,H-24,WHITE,14);
 }else if(id==="epidemic"){
  const agents=s.agents;g.strokeStyle="#48717b55";g.lineWidth=.6;
  for(let i=0;i<agents.length;i++)for(let j=i+1;j<agents.length;j++){const a=agents[i],b=agents[j];if((a.x-b.x)**2+(a.y-b.y)**2<.014){g.beginPath();g.moveTo(a.x*W,a.y*H);g.lineTo(b.x*W,b.y*H);g.stroke();}}
  for(const a of agents)circle(g,a.x*W,a.y*H,a.state===1?6:4,a.state===1?CYAN:a.state===2?WHITE:"#476875");
  label(g,"CYAN: INFECTED   WHITE: RECOVERED   DIM: SUSCEPTIBLE",20,H-18,WHITE,12);
 }else if(id==="orbit"){
  const X=x=>x*W,Y=y=>y*H;circle(g,W/2,H/2,18,WHITE);strokeCircle(g,W/2,H/2,27,CYAN,1);
  for(let k=0;k<s.bodies.length;k++){const b=s.bodies[k];g.strokeStyle=k%2?WHITE:CYAN;g.globalAlpha=.75;g.lineWidth=1.5;g.beginPath();for(let i=0;i<b.trail.length;i++){const[x,y]=b.trail[i];if(i===0)g.moveTo(X(x),Y(y));else g.lineTo(X(x),Y(y));}g.stroke();g.globalAlpha=1;circle(g,X(b.x),Y(b.y),4.5,k%2?WHITE:CYAN);}
  label(g,s.bodies.length+" TEST PARTICLES",20,H-20,WHITE,13);
 }else if(id==="fourier"){
  const s0=s.phase,Y0=H*.52;
  g.strokeStyle="#ffffff3a";g.lineWidth=1;g.beginPath();g.moveTo(0,Y0);g.lineTo(W,Y0);g.stroke();
  for(let layer=0;layer<Math.min(5,s.p.terms);layer++){g.beginPath();for(let x=0;x<W;x+=3){const phase=TAU*x/W;const y=Math.sin((layer+1)*(phase-s0))/((layer+1)**s.p.decay);const Y=Y0-y*90;if(x===0)g.moveTo(x,Y);else g.lineTo(x,Y);}g.strokeStyle="#8caab460";g.lineWidth=1;g.stroke();}
  let at=0;g.beginPath();for(let x=0;x<W;x+=2){const phase=TAU*x/W;let sum=0;for(let k=1;k<=s.p.terms;k++)sum+=Math.sin(k*(phase-s0))/Math.pow(k,s.p.decay);const Y=Y0-sum*95;if(x===0)g.moveTo(x,Y);else g.lineTo(x,Y);if(Math.abs(x/W-s.cursor)<.002)at=Y;}
  g.strokeStyle=CYAN;g.lineWidth=3.6;g.stroke();const x=s.cursor*W;g.setLineDash([5,6]);g.strokeStyle=WHITE;g.beginPath();g.moveTo(x,50);g.lineTo(x,H-35);g.stroke();g.setLineDash([]);label(g,"HARMONICS: "+s.p.terms+" | CURRENT TIME "+fmt(s.phase),20,H-22,WHITE,12);
 }else if(id==="newton"){
  if(!newtonCache)generateNewton();g.imageSmoothingEnabled=true;g.drawImage(newtonCache,0,0,W,H);
  const coord=z=>({x:W*(.5+z.x/(2*s.p.zoom)),y:H*(.5-z.y/(2*s.p.zoom))});
  g.strokeStyle=WHITE;g.lineWidth=2;g.beginPath();for(let i=0;i<s.path.length;i++){const pt=coord(s.path[i]);if(i===0)g.moveTo(pt.x,pt.y);else g.lineTo(pt.x,pt.y);}g.stroke();
  for(const z of s.path){const pt=coord(z);circle(g,pt.x,pt.y,4,CYAN);}
  const picked=coord(s.selected);strokeCircle(g,picked.x,picked.y,10,WHITE,2);
  label(g,"NEWTON ITERATES / "+s.path.length,20,H-20,WHITE,13);
 }
 label(g,(list.indexOf(s.spec)+1).toString().padStart(2,"0")+" / "+s.spec.tag,19,29,WHITE,12);
 label(g,"t = "+s.t,W-20,29,WHITE,12,"right");
}
function generateNewton(){
 const s=current.state;if(s.id!=="newton")return;
 const off=document.createElement("canvas");off.width=260;off.height=175;const ng=off.getContext("2d"),img=ng.createImageData(off.width,off.height);
 for(let y=0;y<off.height;y++)for(let x=0;x<off.width;x++){
  const xx=(x/off.width-.5)*2*s.p.zoom,yy=(.5-y/off.height)*2*s.p.zoom;
  const v=C.newtonPoint(xx,yy,Math.round(s.p.depth)),k=(y*off.width+x)*4;
  const scale=C.clamp(1-v.iterations/Math.max(1,s.p.depth),.18,1);
  const palette=v.root===0?[0,212,232]:v.root===1?[255,255,255]:v.root===2?[65,114,128]:[7,21,27];
  for(let j=0;j<3;j++)img.data[k+j]=Math.max(j===0?3:12,Math.round(palette[j]*scale));
  img.data[k+3]=255;
 }
 ng.putImageData(img,0,0);newtonCache=off;
}
function graph(){
 const W=plot.width,H=plot.height;pg.fillStyle=DARK;pg.fillRect(0,0,W,H);
 pg.strokeStyle="#274a5266";pg.lineWidth=1;
 const pad={l:65,r:20,t:30,b:34};
 for(let i=0;i<=6;i++){const x=pad.l+(W-pad.l-pad.r)*i/6;pg.beginPath();pg.moveTo(x,pad.t);pg.lineTo(x,H-pad.b);pg.stroke();}
 for(let i=0;i<=4;i++){const y=pad.t+(H-pad.t-pad.b)*i/4;pg.beginPath();pg.moveTo(pad.l,y);pg.lineTo(W-pad.r,y);pg.stroke();}
 const rows=current.state.history;if(rows.length<2){label(pg,"Model measurements will appear as it evolves…",W*.5,H*.53,DIM,17,"center");return;}
 let lo=Math.min(...rows.map(q=>q.y)),hi=Math.max(...rows.map(q=>q.y));if(Math.abs(hi-lo)<1e-12){lo-=1;hi+=1;}const margin=(hi-lo)*.12;hi+=margin;lo-=margin;
 const t0=rows[0].t,t1=Math.max(t0+1,rows[rows.length-1].t),X=q=>pad.l+(q.t-t0)/(t1-t0)*(W-pad.l-pad.r),Y=q=>H-pad.b-(q.y-lo)/(hi-lo)*(H-pad.t-pad.b);
 pg.beginPath();rows.forEach((q,i)=>{const x=X(q),y=Y(q);if(i===0)pg.moveTo(x,y);else pg.lineTo(x,y);});pg.strokeStyle=CYAN;pg.lineWidth=3;pg.stroke();
 const last=rows[rows.length-1];circle(pg,X(last),Y(last),5,WHITE);
 label(pg,"LIVE METRIC / "+current.state.spec.tag,pad.l,19,WHITE,12);
 label(pg,fmt(hi),pad.l-10,pad.t,DIM,11,"right");label(pg,fmt(lo),pad.l-10,H-pad.b,DIM,11,"right");
 label(pg,"STEP "+last.t,W-pad.r,H-10,DIM,11,"right");
}
function refreshReadouts(){
 const s=current.state,metric=current.measure();
 $("metricName").textContent=s.id.toUpperCase()+" / CURRENT METRIC";
 $("metricValue").textContent=fmt(metric.value,5);$("metricUnit").textContent=metric.unit;
 $("metricDetail").textContent=metric.detail;$("modelTime").textContent=String(s.t);
 $("runStatus").textContent=playing?"● RUNNING":"Ⅱ PAUSED";$("playButton").textContent=playing?"Ⅱ PAUSE":"▶ RESUME";
}
function render(){drawField();graph();refreshReadouts();}
function step(times=1){for(let i=0;i<times;i++)current.step();render();}
function pos(event){const box=canvas.getBoundingClientRect();return{x:C.clamp((event.clientX-box.left)/box.width,0,.999999),y:C.clamp((event.clientY-box.top)/box.height,0,.999999)};}
function interact(event,forceAlt=false){
 const stamp=performance.now();if(stamp-lastInteraction<40)return;lastInteraction=stamp;
 const q=pos(event);current.interact(q.x,q.y,forceAlt||alt||event.shiftKey||event.button===2);if(model==="newton"){}render();notice("Experiment modified at x="+q.x.toFixed(2)+", y="+q.y.toFixed(2)+".");
}
canvas.addEventListener("pointerdown",event=>{if(event.button!==0&&event.button!==2)return;activeMouse=true;interact(event);});
canvas.addEventListener("pointermove",event=>{if(activeMouse&&event.buttons===1&&["wave","heat","life","sand"].includes(model))interact(event);});
window.addEventListener("pointerup",()=>{activeMouse=false;});
canvas.addEventListener("contextmenu",event=>{event.preventDefault();interact(event,true);});
$("playButton").onclick=()=>{playing=!playing;refreshReadouts();};
$("stepButton").onclick=()=>{playing=false;step();notice("One numerical tick advanced.");};
$("resetButton").onclick=()=>reset(false);
$("reseedButton").onclick=()=>reset(true);
$("altButton").onclick=()=>{alt=!alt;$("altButton").textContent=alt?"⊟ ALT ACTION: ON":"⊞ ALT ACTION: OFF";$("altButton").setAttribute("aria-pressed",String(alt));notice(alt?"Alternate canvas interaction is enabled.":"Primary interaction enabled.");};
$("simSpeed").oninput=()=>{$("simSpeedOut").textContent=Number($("simSpeed").value).toFixed(2)+"×";};
$("filterModels").oninput=()=>{filter=$("filterModels").value.trim().toLowerCase();buildList();};
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const anchor=document.createElement("a");anchor.href=url;anchor.download=name;document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function experiment(){const s=current.state,metric=current.measure();return{schema:"cosmos-toy-universe-v1",model:s.id,parameters:{...s.p},seed:s.seed,ticks:s.t,metric,history:s.history.slice(),note:"Toy model. Not physical proof or an empirical measurement."};}
$("saveCsv").onclick=()=>{const s=current.state;download("cosmos-"+s.id+"-"+s.t+".csv",["step,measurement",...s.history.map(q=>q.t+","+q.y)].join("\n"),"text/csv;charset=utf-8");notice("Numerical series exported.");};
$("saveJson").onclick=()=>{download("cosmos-toy-experiment.json",JSON.stringify(experiment(),null,2),"application/json");notice("Experiment parameters and measurements exported.");};
$("savePng").onclick=()=>{const off=document.createElement("canvas");off.width=960;off.height=880;const gg=off.getContext("2d");gg.fillStyle="#080e11";gg.fillRect(0,0,off.width,off.height);gg.fillStyle=WHITE;gg.font="bold 25px Arial";gg.fillText("COSMOS LAB / "+current.state.spec.name.toUpperCase(),24,38);gg.drawImage(canvas,0,60,960,550);gg.drawImage(plot,0,620,960,228);off.toBlob(blob=>{if(!blob){notice("Canvas export is not available.");return;}const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="cosmos-"+model+".png";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);notice("Simulation and chart exported.");},"image/png");};
$("shareLink").onclick=async()=>{const url=new URL(location.href);url.searchParams.set("toy",model);url.searchParams.set("seed",String(seed));for(const [k,v]of Object.entries(current.state.p))url.searchParams.set(k,String(v));try{await navigator.clipboard.writeText(url.toString());notice("Shareable experiment URL copied.");}catch{notice("Copy this URL: "+url);}};
window.addEventListener("keydown",event=>{if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName))return;if(event.code==="Space"){event.preventDefault();playing=!playing;refreshReadouts();}else if(event.key==="ArrowRight"&&!playing)step();});
function animation(time){if(!last)last=time;const dt=C.clamp(time-last,0,100);last=time;if(playing){accum+=dt/75*Number($("simSpeed").value);const n=Math.min(12,Math.floor(accum));if(n>0){accum-=n;for(let i=0;i<n;i++)current.step();render();}}requestAnimationFrame(animation);}
const qs=new URLSearchParams(location.search);const start=qs.get("toy")||"wave",values={};const spec=list.find(m=>m.id===start)||list[0];for(const [key,,min,max]of spec.params){const v=Number(qs.get(key));if(qs.has(key)&&Number.isFinite(v))values[key]=C.clamp(v,min,max);}
const urlSeed=Number(qs.get("seed"));if(qs.has("seed")&&Number.isInteger(urlSeed)&&urlSeed>0)seed=urlSeed>>>0;
select(spec.id,values,seed);requestAnimationFrame(animation);
})();