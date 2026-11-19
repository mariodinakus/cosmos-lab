/* COSMOS LAB Quantum Gravity Playground — browser-only visual computation.
   States are constructed mathematical toys, not evidence for quantum gravity. */
(()=>{"use strict";
const G=window.CosmosGravity;if(!G)throw Error("Quantum gravity core not loaded.");
const $=id=>document.getElementById(id),world=$("worldCanvas"),plot=$("chartCanvas"),ctx=world.getContext("2d"),pg=plot.getContext("2d");
const DARK="#06151b",CYAN="#00d4e8",WHITE="#f7fcff",MUTED="#8db3bd",GRID="#31505a88",TAU=Math.PI*2;
let mode="links",seed=2026,sim=null,playing=true,speed=1,last=0,accum=0,overlay=null,filterValue="",lastFrame=0;
const fmt=(x,p=3)=>!Number.isFinite(x)?"—":x===0?"0":Math.abs(x)<1e-4||Math.abs(x)>=100000?x.toExponential(2):String(Number(x.toFixed(p)));
function text(g,s,x,y,color=WHITE,size=12,align="left"){g.fillStyle=color;g.font="800 "+size+"px Arial,Helvetica,sans-serif";g.textAlign=align;g.fillText(s,x,y);}
function clear(g,W,H){g.fillStyle=DARK;g.fillRect(0,0,W,H);g.strokeStyle=GRID;g.lineWidth=.8;for(let x=0;x<W;x+=44){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();}for(let y=0;y<H;y+=44){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}}
function dot(g,x,y,r=4,color=CYAN){g.beginPath();g.arc(x,y,Math.max(.2,r),0,TAU);g.fillStyle=color;g.fill();}
function stroke(g,a,b,color=CYAN,width=2,dash=[]){g.setLineDash(dash);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.strokeStyle=color;g.lineWidth=width;g.stroke();g.setLineDash([]);}
function polylines(g,rows,mapX,mapY,color=CYAN,width=2,dash=[]){if(rows.length<2)return;g.setLineDash(dash);g.beginPath();let began=false;for(const row of rows){const x=mapX(row),y=mapY(row);if(!Number.isFinite(x)||!Number.isFinite(y)){began=false;continue;}if(!began){g.moveTo(x,y);began=true;}else g.lineTo(x,y);}g.strokeStyle=color;g.lineWidth=width;g.stroke();g.setLineDash([]);}
function notify(s){$("statusText").textContent=s;}
function modeButtons(){const host=$("modeList");host.textContent="";G.MODES.forEach((m,i)=>{const b=document.createElement("button");b.type="button";b.className="mode-button"+(mode===m.id?" active":"");b.setAttribute("aria-pressed",String(mode===m.id));const strong=document.createElement("strong"),small=document.createElement("small");strong.textContent=String(i+1).padStart(2,"0")+" / "+m.short;small.textContent=m.tag;b.append(strong,small);b.onclick=()=>select(m.id);host.appendChild(b);});}
function parameters(){const host=$("paramList");host.textContent="";for(const [key,label,min,max,start,step] of sim.state.spec.params){const box=document.createElement("div");box.className="param";const lab=document.createElement("label"),out=document.createElement("output"),input=document.createElement("input");input.id="gravity-"+key;lab.htmlFor=input.id;lab.textContent=label;out.textContent=fmt(sim.state.params[key],3);lab.append(out);input.type="range";input.min=min;input.max=max;input.step=step;input.value=sim.state.params[key];input.oninput=()=>{const updates={...sim.state.params,[key]:Number(input.value)};sim=G.make(mode,updates,seed);out.textContent=fmt(updates[key],3);last=0;accum=0;render();notify("Assumption changed: "+label+". Experiment restarted for a consistent comparison.");};box.append(lab,input);host.appendChild(box);}}
function preset(name){const p=mode==="links"?name==="weak"?{strength:.05,disorder:.4,bridges:0,drive:0}:{strength:.5,disorder:0,bridges:.6,drive:.7}:mode==="causal"?name==="weak"?{events:25,lightspeed:.4,spread:1}:{events:95,lightspeed:1,spread:.85}:name==="weak"?{qubits:16,strength:.05,disorder:.6}:{qubits:32,strength:.5,disorder:0};select(mode,p,seed);}
function select(id,params={},chosenSeed=seed){const spec=G.MODES.find(m=>m.id===id);if(!spec)return;mode=id;seed=chosenSeed;sim=G.make(id,params,seed);accum=0;last=0;
if(overlay&&overlay.mode!==mode)overlay=null;
modeButtons();parameters();$("modelTag").textContent=spec.tag;$("modelTitle").textContent=spec.title;$("modelQuestion").textContent=spec.question;
$("whatText").textContent=spec.what;$("limitText").textContent=spec.limit;$("formulaText").textContent=spec.formula;$("seedCount").textContent=String(seed);
$("modelHelp").textContent=mode==="links"?"Click a node to include/exclude it from region A. Shift-click or tap a link to strengthen/weaken entanglement.":mode==="causal"?"Click two events to inspect their causal interval. New events appear as the simulation advances.":"Click horizontally to select a radiation-emission step; play to evolve the constructed pure pair family.";
$("liveHint").textContent=mode==="page"?"RE-MATCHED PURE STATES · NOT EVAPORATION":"MODEL ASSUMPTIONS SHOWN BELOW";
notify("Selected "+spec.short+". Numerical outputs depend on the selected assumptions.");render();}
function drawLinks(g,W,H){const s=sim.state,m=sim.metric(),leftW=W*.7;
 const position=i=>{const n=s.nodes[i];return{x:W*(.05+n.x*.66),y:H*(.05+n.y*.9)};};
 const active=m.path||[],pathEdges=new Set;for(let i=1;i<active.length;i++)pathEdges.add([Math.min(active[i-1],active[i]),Math.max(active[i-1],active[i])].join(":"));
 const crossing=e=>s.region[e.a]!==s.region[e.b];
 for(const e of s.edges){const a=position(e.a),b=position(e.b),key=[Math.min(e.a,e.b),Math.max(e.a,e.b)].join(":"),colored=crossing(e),part=G.edgeEntropy?G.edgeEntropy(e):G.binaryEntropy(e.p);
 const color=pathEdges.has(key)?WHITE:colored?CYAN:"#315e6d",width=pathEdges.has(key)?4:1.5+3*part;stroke(g,a,b,color,width);
 const t=((s.tick*.017+e.phase/TAU)%1);dot(g,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,Math.max(2,2.5*part),color);
 }
 for(const n of s.nodes){const pt=position(n.id),selected=s.region[n.id];dot(g,pt.x,pt.y,selected?12:9,selected?CYAN:WHITE);dot(g,pt.x,pt.y,selected?4:3,DARK);text(g,String(n.id+1),pt.x+13,pt.y-13,selected?CYAN:WHITE,11);}
 g.strokeStyle="#7296a9";g.lineWidth=1;g.beginPath();g.moveTo(leftW+8,52);g.lineTo(leftW+8,H-43);g.stroke();
 const a=leftW+24;let y=100;text(g,"CUT / REGION A",a,55,CYAN,15);
 text(g,"SELECTED ENTROPY",a,y,WHITE,12);y+=35;text(g,fmt(m.value)+" bits",a,y,CYAN,31);y+=62;
 text(g,"MINIMUM 0→11 CUT",a,y,WHITE,12);y+=32;text(g,fmt(m.minimum)+" bits",a,y,WHITE,23);y+=66;
 text(g,"HEURISTIC PATH LENGTH",a,y,WHITE,12);y+=32;text(g,fmt(m.shortest),a,y,CYAN,25);y+=57;
 text(g,"WHITE: SHORTEST GRAPH PATH",a,y,MUTED,11);y+=28;text(g,"CYAN: LINKS CROSSING A",a,y,MUTED,11);y+=28;text(g,"DISTANCE = 1 / (0.05 + H₂)",a,y,MUTED,10);
 text(g,"LEFT NETWORK: 12 NODES / SEPARATE QUBIT PER INCIDENT EDGE",26,H-17,WHITE,12);
}
function drawCausal(g,W,H){const s=sim.state,p=s.params,m=sim.metric(),vis=s.events.slice(0,s.visible);
 const P=e=>({x:W*(.09+(e.x/(2*p.spread)+.5)*.80),y:H*(.91-e.t*.78)});
 const chosen=s.picked.map(i=>s.events[i]).filter(Boolean);
 if(chosen.length){const a=chosen[0],pt=P(a),coneW=H*.78*p.lightspeed/(2*p.spread)*(.80*W/(.78*H));g.strokeStyle="#00d4e8aa";g.setLineDash([7,8]);g.beginPath();g.moveTo(pt.x,pt.y);const top=H*.13,dist=(pt.y-top)*coneW;g.lineTo(pt.x-dist,top);g.moveTo(pt.x,pt.y);g.lineTo(pt.x+dist,top);g.stroke();g.setLineDash([]);}
 const pathIds=new Set(m.longest||[]);
 for(let i=0;i<vis.length;i++){const a=vis[i];const A=P(a);for(let j=i+1;j<vis.length;j++){const b=vis[j];if(!G.causallyBefore(a,b,p.lightspeed))continue;
 if(j-i>17||((i*13+j*7)%5!==0))continue;const B=P(b);stroke(g,A,B,pathIds.has(i)&&pathIds.has(j)?"#80b9c1":"#2d697a",pathIds.has(i)&&pathIds.has(j)?1.5:.6);
 }}
 for(let i=1;i<(m.longest||[]).length;i++){const a=vis[m.longest[i-1]],b=vis[m.longest[i]];if(a&&b)stroke(g,P(a),P(b),WHITE,3.5);}
 const selected=new Set(s.picked);
 for(const e of vis){const p=P(e);dot(g,p.x,p.y,selected.has(e.id)?9:4,selected.has(e.id)?WHITE:CYAN);}
 text(g,"LATER EVENTS ↑",22,29,WHITE,14);text(g,"VISIBLE / "+vis.length+" OF "+s.events.length,W-23,31,CYAN,15,"right");
 text(g,"LONGEST CHAIN "+m.maxDepth+"  ·  CAUSAL PAIR FRACTION "+fmt(m.causalFraction),22,H-25,WHITE,13);
 if(s.picked.length===2)text(g,"SELECTED INTERVAL "+(m.intervalValid?m.intervalCount+" EVENTS":"NOT CAUSALLY ORDERED"),W-24,H-25,CYAN,12,"right");
}
function drawPage(g,W,H){const s=sim.state,m=sim.metric(),N=s.params.qubits,k=s.k,nBH=N-k,nRad=k;
 const cxL=W*.25,cxR=W*.76,cy=H*.51,rad=Math.min(H*.31,W*.19),radius=7;
 const left=[],right=[];for(let i=0;i<nBH;i++){const a=TAU*(i+.5)/Math.max(1,nBH)-Math.PI/2;left.push({x:cxL+rad*Math.cos(a),y:cy+rad*Math.sin(a)});}
 for(let i=0;i<nRad;i++){const a=TAU*(i+.5)/Math.max(1,nRad)-Math.PI/2;right.push({x:cxR+rad*Math.cos(a),y:cy+rad*Math.sin(a)});}
 g.strokeStyle="#72929b";g.lineWidth=2;for(const [cx,n] of [[cxL,nBH],[cxR,nRad]]){g.beginPath();g.arc(cx,cy,rad+22,0,TAU);g.stroke();dot(g,cx,cy,Math.max(8,21*Math.sqrt(n/N)),n===0?"#324c57":"#385c66");}
 const b=Math.min(nBH,nRad);
 for(let i=0;i<b;i++){const a=left[i],r=right[i],ent=G.binaryEntropy(s.weights[i]),col=i%2===0?CYAN:WHITE;stroke(g,a,r,col,1+3*ent);const q=(s.tick*.034+i*.17)%1;dot(g,a.x*(1-q)+r.x*q,a.y*(1-q)+r.y*q,3,col);}
 for(const pt of left)dot(g,pt.x,pt.y,radius,WHITE);for(const pt of right)dot(g,pt.x,pt.y,radius,CYAN);
 text(g,"BLACK HOLE / "+nBH+" QUBITS",cxL,47,WHITE,18,"center");
 text(g,"RADIATION / "+nRad+" QUBITS",cxR,47,CYAN,18,"center");
 text(g,"CROSS-PARTITION PAIRS: "+b,W/2,H-78,WHITE,16,"center");
 text(g,"S_R = "+fmt(m.value)+" bits",W/2,H-43,CYAN,24,"center");
 text(g,"STATES RECONSTRUCTED AT EVERY k · NOT A DYNAMICAL BLACK-HOLE MODEL",W/2,H-13,MUTED,11,"center");
}
function drawWorld(){const W=world.width,H=world.height;clear(ctx,W,H);if(mode==="links")drawLinks(ctx,W,H);else if(mode==="causal")drawCausal(ctx,W,H);else drawPage(ctx,W,H);}
function drawChart(){const W=plot.width,H=plot.height;clear(pg,W,H);
 const pad={l:70,t:31,r:26,b:41},PW=W-pad.l-pad.r,PH=H-pad.t-pad.b;
 for(let i=0;i<=5;i++){let x=pad.l+PW*i/5,y=pad.t+PH*i/5;stroke(pg,{x,y:pad.t},{x,y:pad.t+PH},GRID,1);stroke(pg,{x:pad.l,y},{x:pad.l+PW,y},GRID,1);}
 const m=sim.metric(),history=sim.state.history;
 let series=history.map(v=>({x:v.t,y:v.y})),old=overlay?.mode===mode?overlay.history.map(v=>({x:v.t,y:v.y})):[];
 let upper=[];
 if(mode==="page"){series=m.curve.map(v=>({x:v.k,y:v.entropy}));upper=m.curve.map(v=>({x:v.k,y:v.k*G.binaryEntropy(sim.state.params.strength)}));}
 else if(mode==="links"){const flat=[{x:0,y:m.minimum},{x:Math.max(10,sim.state.tick),y:m.minimum}];upper=flat;}
 const all=[...series,...old,...upper];if(all.length<2){text(pg,"THE GRAPH FILLS AS THE EXPERIMENT EVOLVES",W/2,H/2,MUTED,15,"center");return;}
 let xmin=Math.min(...all.map(v=>v.x)),xmax=Math.max(...all.map(v=>v.x)),ymin=Math.min(0,...all.map(v=>v.y)),ymax=Math.max(1,...all.map(v=>v.y));if(xmax-xmin<1)xmax=xmin+1;const margin=(ymax-ymin)*.1||.5;ymin-=margin;ymax+=margin;
 const X=r=>pad.l+(r.x-xmin)/(xmax-xmin)*PW,Y=r=>pad.t+(ymax-r.y)/(ymax-ymin)*PH;
 polylines(pg,upper,X,Y,"#5d8d99",1.4,[5,5]);
 polylines(pg,old,X,Y,WHITE,2,[9,6]);polylines(pg,series,X,Y,CYAN,3);
 if(mode==="page"){const p={x:m.emitted,y:m.value};dot(pg,X(p),Y(p),8,WHITE);}
 else if(series.length){const v=series[series.length-1];dot(pg,X(v),Y(v),5,WHITE);}
 text(pg,fmt(ymax),pad.l-9,pad.t+5,MUTED,11,"right");text(pg,fmt(ymin),pad.l-9,H-pad.b,MUTED,11,"right");
 text(pg,fmt(xmin),pad.l,H-10,MUTED,11);text(pg,fmt(xmax),W-pad.r,H-10,MUTED,11,"right");
 text(pg,mode==="page"?"CYAN PURE-PAIR ENTROPY / DIM NAIVE INDEPENDENT-EMISSION REFERENCE":mode==="links"?"CYAN SELECTED CUT / DIM CURRENT MIN s–t CUT":"CYAN LONGEST CHAIN vs ITERATION",pad.l,20,WHITE,11);
}
function readouts(){const s=sim.state,m=sim.metric();$("mainValue").textContent=fmt(m.value,5);$("mainUnit").textContent=m.unit;$("mainDetail").textContent=m.detail;$("stepCount").textContent=String(s.tick);$("seedCount").textContent=String(seed);
$("runStatus").textContent=playing?"● RUNNING":"Ⅱ PAUSED";$("playButton").textContent=playing?"Ⅱ PAUSE":"▶ RESUME";
$("secondaryValue").textContent=mode==="links"?"Min s–t cut: "+fmt(m.minimum)+" bits | Heuristic path: "+fmt(m.shortest):mode==="causal"?"Visible events: "+m.visible+" | Causally ordered pairs: "+fmt(m.causalFraction)+" | Selected diamond: "+(m.intervalValid?m.intervalCount:"none"):"Emission step: "+m.emitted+"/"+m.total+" | Crossing pairs: "+m.crossings+" | Maximum: "+fmt(m.peak)+" bits";
$("chartLegend").textContent=overlay?.mode===mode?"CURRENT CYAN / SAVED WHITE":mode==="page"?"CURVE / NAIVE REFERENCE":"CURRENT NUMERICAL RESULT";
}
function render(){drawWorld();drawChart();readouts();}
function step(){sim.step();render();}
$("playButton").onclick=()=>{playing=!playing;readouts();};
$("stepButton").onclick=()=>{playing=false;step();notify("One model step completed.");};
$("resetButton").onclick=()=>{select(mode,{...sim.state.params},seed);notify("Model reset; parameters preserved.");};
$("reseedButton").onclick=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;select(mode,{...sim.state.params},seed);notify("Reproducible seed changed to "+seed+".");};
$("speedInput").oninput=()=>{speed=Number($("speedInput").value);$("speedValue").textContent=speed.toFixed(2)+"×";};
$("presetClean").onclick=()=>{preset("balanced");notify("Loaded a balanced toy preset.");};$("presetSparse").onclick=()=>{preset("weak");notify("Loaded a weak/sparse toy preset.");};
world.addEventListener("pointerdown",event=>{if(event.button!==0)return;event.preventDefault();const box=world.getBoundingClientRect(),x=G.clamp((event.clientX-box.left)/box.width,0,1),y=G.clamp((event.clientY-box.top)/box.height,0,1);const qx=mode==="links"?G.clamp((x-.05)/.66,0,1):mode==="causal"?G.clamp((x-.09)/.80,0,1):x,qy=mode==="links"?G.clamp((y-.05)/.9,0,1):mode==="causal"?G.clamp(1-(.91-y)/.78,0,1):y;
 sim.interact(qx,qy,event.shiftKey);render();notify("Interactive model state modified. Compare numerical diagnostics.");});
const STORAGE="cosmos-gravity-saved-runs-v1";
function saved(){try{const d=JSON.parse(localStorage.getItem(STORAGE)||"[]");return Array.isArray(d)?d:[];}catch{return[];}}
function experiment(){const s=sim.state;return{schema:"cosmos-gravity-v1",mode,parameters:{...s.params},seed,step:s.tick,history:s.history.map(a=>({...a})),metric:sim.metric(),selectedRegion:mode==="links"?s.region.slice():null,selectedEvents:mode==="causal"?s.picked.slice():null,note:s.spec.limit};}
$("saveRun").onclick=()=>{const e=experiment();if(e.history.length<2&&mode!=="page"){notify("Run several steps before saving a comparison.");return;}if(mode==="page"){e.history=e.metric.curve.map(q=>({t:q.k,y:q.entropy}));}try{const all=saved();all.push(e);localStorage.setItem(STORAGE,JSON.stringify(all.slice(-12)));notify("Run A saved in this browser. Change settings and select COMPARE B.");}catch{notify("Browser storage unavailable. Export JSON instead.");}};
$("compareRun").onclick=()=>{if(overlay){overlay=null;notify("Comparison overlay hidden.");}else{const prior=saved().filter(q=>q.mode===mode&&Array.isArray(q.history)).at(-1);if(!prior){notify("No stored run A for this model. Save a run first.");return;}overlay=prior;notify("Run B comparison active: CYAN current vs WHITE dashed saved A.");}render();};
function download(name,content,mime){const url=URL.createObjectURL(new Blob([content],{type:mime})),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1600);}
$("downloadCsv").onclick=()=>{const e=experiment(),rows=mode==="page"?e.metric.curve.map(q=>[q.k,q.entropy,q.k*G.binaryEntropy(sim.state.params.strength)]):e.history.map(q=>[q.t,q.y]);const header=mode==="page"?"radiation_qubits,entropy_bits,naive_reference":"step,model_metric";download("cosmos-gravity-"+mode+".csv",[header,...rows.map(x=>x.join(","))].join("\n"),"text/csv;charset=utf-8");notify("CSV exported. All quantities are toy-model outputs.");};
$("downloadJson").onclick=()=>{download("cosmos-gravity-"+mode+".json",JSON.stringify(experiment(),null,2),"application/json");notify("Experiment metadata and numerical history exported.");};
$("downloadPng").onclick=()=>{const out=document.createElement("canvas");out.width=1100;out.height=1010;const g=out.getContext("2d");g.fillStyle=DARK;g.fillRect(0,0,1100,1010);text(g,"COSMOS LAB / QUANTUM GRAVITY — "+mode.toUpperCase(),24,40,CYAN,24);g.drawImage(world,0,65,1100,600);g.drawImage(plot,0,685,1100,305);out.toBlob(blob=>{if(!blob){notify("PNG export unavailable.");return;}const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="cosmos-quantum-gravity-"+mode+".png";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1600);notify("Diagram and analytics exported as PNG.");},"image/png");};
$("copyLink").onclick=async()=>{const url=new URL(location.href);url.searchParams.set("model",mode);url.searchParams.set("seed",seed);for(const[k,v]of Object.entries(sim.state.params))url.searchParams.set(k,String(v));try{await navigator.clipboard.writeText(url.toString());notify("Initial parameters and seed link copied. Manual canvas edits are not replayed.");}catch{notify("Copy this URL: "+url);}};
window.addEventListener("keydown",event=>{if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName))return;if(event.code==="Space"){event.preventDefault();playing=!playing;readouts();}if(event.code==="ArrowRight"&&!playing)step();});
function frame(t){if(!last)last=t;const dt=G.clamp(t-last,0,100);last=t;if(playing){accum+=dt*speed/100;const ticks=Math.min(8,Math.floor(accum));if(ticks){accum-=ticks;for(let i=0;i<ticks;i++)sim.step();render();}}requestAnimationFrame(frame);}
const q=new URLSearchParams(location.search),id=G.MODES.some(m=>m.id===q.get("model"))?q.get("model"):"links",settings={},selected=G.MODES.find(m=>m.id===id);
for(const [key,,min,max]of selected.params){const v=Number(q.get(key));if(q.has(key)&&Number.isFinite(v))settings[key]=G.clamp(v,min,max);}
if(q.has("seed")){const s=Number(q.get("seed"));if(Number.isInteger(s)&&s>0)seed=s>>>0;}
select(id,settings,seed);requestAnimationFrame(frame);
})();