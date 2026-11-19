/* COSMOS LAB / Frontier Questions visual laboratory
   Models are conditional mathematical demonstrations, never metaphysical proofs. */
(()=>{"use strict";
const F=window.CosmosFrontier;if(!F)throw Error("Frontier mathematical engine missing.");
const $=id=>document.getElementById(id),world=$("world"),canvas=$("chart"),g=world.getContext("2d"),cg=canvas.getContext("2d");
const CYAN="#00d4e8",WHITE="#f8fdff",BG="#07151b",GRID="#31556288",DIM="#aecbd4",TAU=2*Math.PI;
let seed=2026,mode="vacuum",sim=null,playing=true,speed=1,accum=0,last=0,filter="",nothing="quantum",phase=0,paintCache=null;
function fmt(v,n=4){if(!Number.isFinite(v))return "—";if(v===0)return "0";if(Math.abs(v)<.0001||Math.abs(v)>=1e5)return v.toExponential(2);return Number(v.toFixed(n)).toString();}
function drawText(ctx,s,x,y,color=WHITE,px=12,align="left"){ctx.fillStyle=color;ctx.font="800 "+px+"px Arial, sans-serif";ctx.textAlign=align;ctx.fillText(s,x,y);}
function clear(ctx,W,H){ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);ctx.strokeStyle=GRID;ctx.lineWidth=1;for(let x=0;x<W;x+=42){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=0;y<H;y+=42){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}}
function dot(ctx,x,y,r,color=CYAN){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,Math.max(.2,r),0,TAU);ctx.fill();}
function circle(ctx,x,y,r,color=CYAN,width=1.5){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();}
function line(ctx,p,xx,yy,color=CYAN,width=2,pattern=[]){if(p.length<2)return;ctx.beginPath();let first=true;for(const v of p){const x=xx(v),y=yy(v);if(!Number.isFinite(x)||!Number.isFinite(y)){first=true;continue;}if(first){ctx.moveTo(x,y);first=false;}else ctx.lineTo(x,y);}ctx.lineWidth=width;ctx.strokeStyle=color;ctx.setLineDash(pattern);ctx.stroke();ctx.setLineDash([]);}
function modelList(){const host=$("modeList");host.textContent="";F.MODES.forEach((m,i)=>{if(![m.id,m.tag,m.title,m.question].join(" ").toLowerCase().includes(filter))return;const b=document.createElement("button");b.className="mode-option"+(m.id===mode?" active":"");b.type="button";b.setAttribute("aria-pressed",String(m.id===mode));const num=document.createElement("span"),wrap=document.createElement("div"),title=document.createElement("strong"),tag=document.createElement("small");num.textContent=String(i+1).padStart(2,"0");title.textContent=m.title;tag.textContent=m.tag;wrap.append(title,tag);b.append(num,wrap);b.onclick=()=>select(m.id);host.appendChild(b);});}
function controls(){const root=$("parameters");root.textContent="";for(const [k,name,min,max,value,step]of sim.state.spec.params){const box=document.createElement("div");box.className="param-field";const label=document.createElement("label"),out=document.createElement("output"),input=document.createElement("input");input.id="frontier-param-"+k;label.htmlFor=input.id;label.textContent=name;out.textContent=fmt(sim.state.p[k]);label.append(out);input.type="range";input.min=min;input.max=max;input.step=step;input.value=sim.state.p[k];input.oninput=()=>{const settings={...sim.state.p,[k]:Number(input.value)};const n=F.make(mode,settings,seed);sim=n;paintCache=null;out.textContent=fmt(settings[k]);phase=0;render();feedback("Changed "+name+". Model reset to preserve comparable conditions.");};box.append(label,input);root.appendChild(box);}}
function syncSliders(){for(const [k]of sim.state.spec.params){const inp=$("frontier-param-"+k);if(!inp)continue;inp.value=sim.state.p[k];inp.parentElement?.querySelector("output")&&(inp.parentElement.querySelector("output").textContent=fmt(sim.state.p[k]));}}
function select(id,settings={},newSeed=seed){const spec=F.MODES.find(m=>m.id===id);if(!spec)return;mode=id;seed=newSeed;sim=F.make(id,settings,seed);phase=0;accum=0;last=0;paintCache=null;modelList();controls();$("modelTag").textContent=spec.tag;$("modelTitle").textContent=spec.title;$("modelQuestion").textContent=spec.question;$("equation").textContent=spec.formula;$("evidenceLevel").textContent=spec.level;$("what").textContent=spec.what;$("limit").textContent=spec.limit;$("touchHint").textContent=mode==="vacuum"?"Click to shift a quantum oscillator state (now a coherent-state analogue)":mode==="intervene"?"Click to manually flip a bit in one world":mode==="laws"?"Click to flip a cell in the newest row":mode==="entropy"?"Click to relocate all particles near a chosen position":mode==="baryogenesis"?"Click horizontally to change signed CP-asymmetry and restart":mode==="bell"?"Click a pair column to highlight one setting; all four are still sampled":mode==="decoherence"?"Click to restart the coherence evolution with an initial phase":"Click horizontally to change the selected physical parameter";
$("seedLabel").textContent=String(seed);$("nothingPanel").hidden=id!=="vacuum";if(id==="vacuum")applyNothing();render();feedback("Selected "+spec.title+".");}
function applyNothing(){const p=$("nothingExplain");nothing=$("nothingSelect").value;
const info={quantum:"A ground state is a definite physical state of an already-postulated quantum oscillator. Fluctuation samples require a Hamiltonian and nonzero ℏ.",empty:"Classical empty space is a spacetime in a classical theory, not absence of all things. No quantum oscillator is simulated for this selection.",absolute:"Absolute nothing is defined here as no space, time, fields, mathematical dynamics or laws. By definition there is no physical state to compute. The simulation stops."};p.textContent=info[nothing];}
function bounds(W,H){return{l:68,r:26,t:37,b:40,w:W-94,h:H-77};}
function xyPoint(x,y,W,H,x0,x1,y0,y1){const p=bounds(W,H);return {x:p.l+(x-x0)/(x1-x0)*p.w,y:p.t+(1-(y-y0)/(y1-y0))*p.h};}
function plotCurves(ctx,W,H,curves,x0,x1,y0,y1){
 clear(ctx,W,H);const pad=bounds(W,H);
 ctx.strokeStyle="#ffffff66";ctx.strokeRect(pad.l,pad.t,pad.w,pad.h);
 for(let i=0;i<=5;i++){const x=pad.l+pad.w*i/5,y=pad.t+pad.h*i/5;ctx.strokeStyle=GRID;ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,pad.t+pad.h);ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+pad.w,y);ctx.stroke();}
 for(const c of curves){line(ctx,c.points,v=>xyPoint(v.x,v.y,W,H,x0,x1,y0,y1).x,v=>xyPoint(v.x,v.y,W,H,x0,x1,y0,y1).y,c.color||CYAN,c.width||2,c.dash||[]);}
 drawText(ctx,fmt(x0),pad.l,H-13,DIM,11);drawText(ctx,fmt(x1),pad.l+pad.w,H-13,DIM,11,"right");
 drawText(ctx,fmt(y1),pad.l-8,pad.t+5,DIM,11,"right");drawText(ctx,fmt(y0),pad.l-8,pad.t+pad.h,DIM,11,"right");
}
function drawMatrix(rows,W,H,compare=null){
 clear(g,W,H);const n=rows[0]?.length||128,k=rows.length;
 if(k===0)return;const off=document.createElement("canvas");off.width=n;off.height=k;const gg=off.getContext("2d"),pixels=gg.createImageData(n,k);
 for(let y=0;y<k;y++)for(let x=0;x<n;x++){const cell=rows[y][x],i=4*(y*n+x);const contrast=compare&&compare[y]&&compare[y][x]!==cell;
 pixels.data[i]=cell?0:7;pixels.data[i+1]=cell?212:21;pixels.data[i+2]=cell?232:27;pixels.data[i+3]=255;if(contrast){pixels.data[i]=255;pixels.data[i+1]=255;pixels.data[i+2]=255;}}
 gg.putImageData(pixels,0,0);g.imageSmoothingEnabled=false;g.drawImage(off,0,0,W,H);g.imageSmoothingEnabled=true;
}
function drawMain(){const s=sim.state,p=s.p,W=world.width,H=world.height;clear(g,W,H);
 if(mode==="baryogenesis"){
 const mid=H*.54,barW=W*.20,starts=[W*.24,W*.55],vals=[(1+s.Y)/2,(1-s.Y)/2];
 for(let k=0;k<2;k++){const x=starts[k],ht=vals[k]*H*.46;
 g.fillStyle=k===0?CYAN:WHITE;g.fillRect(x,mid+H*.22-ht,barW,ht);g.strokeStyle=k===0?CYAN:WHITE;g.lineWidth=2;g.strokeRect(x,mid-H*.24,barW,H*.46);
 drawText(g,k===0?"MATTER PROXY":"ANTIMATTER PROXY",x+barW/2,H*.83,k===0?CYAN:WHITE,14,"center");
 drawText(g,fmt(vals[k],4),x+barW/2,mid-H*.28,WHITE,21,"center");}
 drawText(g,"PARENT X(t) = "+fmt(s.X,4)+"  /  NET ASYMMETRY Y(t) = "+fmt(s.Y,5),W/2,55,WHITE,19,"center");
 drawText(g,"SOURCE ε·B·D·ΓX = "+fmt(p.epsilon*p.violation*p.departure*p.rate*s.X,6),W/2,H-30,CYAN,15,"center");
 for(let k=0;k<28;k++)dot(g,(k*73+phase*.2)%W,105+(k*97)%100,2,k%2?CYAN:WHITE);
 }else if(mode==="bell"){
 drawText(g,"BELL–CHSH / FOUR MEASUREMENT SETTINGS",23,31,WHITE,15);
 const predicted=2*Math.SQRT2*p.visibility,observed=F.bellCHSH(s.measured);
 for(let i=0;i<4;i++){const x=90+i*(W-180)/4,bw=(W-220)/4-14,n=s.measured.count[i],E=n?s.measured.sum[i]/n:0,angles=[[0,Math.PI/8],[0,-Math.PI/8],[Math.PI/4,Math.PI/8],[Math.PI/4,-Math.PI/8]],target=-p.visibility*Math.cos(2*(angles[i][0]-angles[i][1]));
 g.strokeStyle=i===s.focus?CYAN:"#5c8690";g.lineWidth=i===s.focus?4:1.5;g.strokeRect(x,H*.26,bw,H*.42);
 const length=Math.abs(E)*H*.18;g.fillStyle=E>=0?CYAN:WHITE;g.fillRect(x+bw*.29,E>=0?H*.47-length:H*.47,bw*.42,length);
 drawText(g,"PAIR "+(i+1),x+bw*.5,H*.73,i===s.focus?CYAN:WHITE,13,"center");drawText(g,"E = "+fmt(E,3),x+bw*.5,H*.78,WHITE,14,"center");drawText(g,"target "+fmt(target,3),x+bw*.5,H*.83,DIM,11,"center");}
 drawText(g,"S sample = "+fmt(observed,3)+"  |  S expected = "+fmt(predicted,3),W/2,89,CYAN,24,"center");drawText(g,"LOCAL BOUND 2  /  QUANTUM BOUND 2√2",W/2,H-29,WHITE,14,"center");
 for(let k=0;k<s.recent.length;k++){const sample=s.recent[k];dot(g,W*.2+k*W*.6/Math.max(1,s.recent.length-1),H*.92,3,sample.A*sample.B>0?CYAN:WHITE);}
 }else if(mode==="decoherence"){
 const R=Math.min(W,H)*.34,x=W*.41,y=H*.53,coh=Math.exp(-p.gamma*s.time);
 circle(g,x,y,R,"#6fa7b5",2);circle(g,x,y,R*.5,"#275867",1);
 g.strokeStyle="#ffffff55";g.lineWidth=1;g.beginPath();g.moveTo(x-R,y);g.lineTo(x+R,y);g.moveTo(x,y-R);g.lineTo(x,y+R);g.stroke();
 const tipX=x+R*coh*Math.cos(s.phase),tipY=y-R*coh*Math.sin(s.phase);
 g.strokeStyle=CYAN;g.lineWidth=6;g.beginPath();g.moveTo(x,y);g.lineTo(tipX,tipY);g.stroke();dot(g,tipX,tipY,9,WHITE);
 if(s.trail.length>1)line(g,s.trail,a=>x+a.x*R,a=>y-a.y*R,WHITE,2);
 drawText(g,"BLOCH EQUATOR / PURE DEPHASING",22,32,CYAN,15);
 drawText(g,"COHERENCE = "+fmt(coh,4),W*.77,H*.34,WHITE,20,"center");
 drawText(g,"PURITY = "+fmt((1+coh*coh)/2,4),W*.77,H*.44,CYAN,20,"center");
 drawText(g,"ρ₀₀ = ρ₁₁ = ½",W*.77,H*.58,WHITE,18,"center");
 drawText(g,"ENVIRONMENT ASSUMED",W*.77,H*.76,DIM,12,"center");
 }else if(mode==="vacuum"){
  if(nothing!=="quantum"){drawText(g,nothing==="absolute"?"NO DEFINED PHYSICAL STATE":"CLASSICAL EMPTY SPACETIME",W/2,H/2-15,CYAN,32,"center");drawText(g,nothing==="absolute"?"No lawful time evolution is defined by this choice.":"No quantum oscillator is modeled under this choice.",W/2,H/2+30,WHITE,17,"center");return;}
  const sx=Math.sqrt(p.hbar/(2*p.mass*p.omega)),sp=Math.sqrt(p.hbar*p.mass*p.omega/2);const scaleX=W/(9*sx),scaleP=H/(9*sp);
  for(let i=1;i<=3;i++){g.save();g.translate(W/2,H/2);g.scale(scaleX,scaleP);circle(g,0,0,i*Math.sqrt(2)*sx,"#00d4e84d",1.5);g.restore();}
  for(const sample of s.samples){const x=W/2+sample.x*scaleX,y=H/2-sample.p*scaleP;if(x>=0&&x<W&&y>=0&&y<H)dot(g,x,y,2,CYAN);}
  dot(g,W/2+s.shiftX*scaleX,H/2-s.shiftP*scaleP,7,WHITE);drawText(g,"x/p PHASE SPACE — GROUND STATE GAUSSIAN SAMPLES",24,30,WHITE,13);
  drawText(g,s.shiftX===0&&s.shiftP===0?"GROUND STATE CENTRED":"DISPLACED-STATE ANALOGUE",24,H-24,CYAN,14);
 }else if(mode==="tunnel"){
  const base=H*.72,top=H*.2,x0=W*.43,x1=x0+p.width/3.2*W*.28,level=base-p.height/6*H;
  g.fillStyle="#00d4e835";g.fillRect(x0,level,x1-x0,base-level);g.strokeStyle=CYAN;g.lineWidth=3;g.strokeRect(x0,level,x1-x0,base-level);
  const Tx=F.transmission(p.energy,p.height,p.width,p.mass),A=Math.sqrt(Tx);
  function wave(from,to,amp,offset){g.beginPath();for(let x=from;x<to;x+=2){const y=offset+amp*Math.sin((x-from)*.075-phase*.19);if(x===from)g.moveTo(x,y);else g.lineTo(x,y);}g.strokeStyle=WHITE;g.lineWidth=2;g.stroke();}
  wave(20,x0-1,70,H*.62);wave(x1+1,W-20,70*A,H*.62);
  drawText(g,"RECTANGULAR POTENTIAL / STATIONARY TRANSMISSION",20,30,CYAN,14);drawText(g,"T = "+fmt(Tx,5),W-20,35,WHITE,20,"right");drawText(g,"WAVE DRAWING IS SCHEMATIC — T USES THE SCATTERING FORMULA",20,H-19,DIM,12);
 }else if(mode==="inflation"){
  const cx=W/2,cy=H/2;for(let i=0;i<14;i++){const r=((i*51+s.N*145)%650);circle(g,cx,cy,r,CYAN+(i%3===0?"94":"45"),1.5);}
  dot(g,cx,cy,11,WHITE);
  drawText(g,"SCALAR-FIELD EXPANSION (SLOW-ROLL TOY)",22,31,CYAN,15);
  drawText(g,"N = "+fmt(s.N,3)+" e-folds",W-20,34,WHITE,21,"right");
  drawText(g,"φ = "+fmt(s.phi,4)+"   H = "+fmt(s.H,4),22,H-20,DIM,15);
 }else if(mode==="laws"){drawMatrix(s.rows,W,H);drawText(g,"RULE "+p.rule+" / TOP = OLDEST ROW / BOTTOM = NEWEST ROW",18,31,WHITE,13);}
 else if(mode==="intervene"){
  const rows=s.rows,W2=W,half=H/2;
  clear(g,W,H);drawText(g,"CURRENT WORLD / MANUAL INTERVENTIONS "+s.edits,20,27,CYAN,15);
  const halfRows=rows.slice(-40);g.save();g.beginPath();g.rect(0,45,W2,half-60);g.clip();drawMatrixSection(halfRows,45,half-60);g.restore();
  drawText(g,"REFERENCE WORLD / NO INTERVENTION",20,half+26,WHITE,14);
  const ref=new Uint8Array(s.reference);for(let i=0;i<ref.length;i++){g.fillStyle=ref[i]?"#ffffff":"#12303a";g.fillRect(i*W/ref.length,half+55,W/ref.length+1,half-70);}
  drawText(g,"WHITE: DIFFERENCE IS VISIBLE AFTER AN EDIT / BIT MISMATCH "+fmt(s.difference),20,H-17,WHITE,11);
 }else if(mode==="geometry"){
  const N=15,c=Math.tanh(p.J/p.temp),r=Math.min(W,H)*.36,cx=W/2,cy=H/2;
  for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){const dist=Math.min(j-i,N-(j-i)),strength=Math.pow(c,dist);if(strength<.02)continue;g.strokeStyle="rgba(0,212,232,"+Math.min(.8,strength*.85)+")";g.lineWidth=.3+3*strength;g.beginPath();g.moveTo(cx+r*Math.cos(i*TAU/N),cy+r*Math.sin(i*TAU/N));g.lineTo(cx+r*Math.cos(j*TAU/N),cy+r*Math.sin(j*TAU/N));g.stroke();}
  for(let i=0;i<N;i++){const q=i*TAU/N;dot(g,cx+r*Math.cos(q),cy+r*Math.sin(q),7,i===Math.floor(s.step/9)%N?WHITE:CYAN);}
  drawText(g,"ISING TWO-POINT CORRELATIONS / NOT SPACETIME",18,30,WHITE,14);drawText(g,"tanh(J/T) = "+fmt(c,4),20,H-20,CYAN,15);
 }else if(mode==="crossover"){
  const m=10**p.logmass,rs=2*m,lambda=1/m,r0=Math.sqrt(Math.max(0,Math.log10(rs)+4)/7.5)*210,r1=Math.sqrt(Math.max(0,Math.log10(lambda)+4)/7.5)*210;
  const cx=W/2,cy=H/2;
  circle(g,cx,cy,r0,CYAN,5);circle(g,cx,cy,r1,WHITE,3);dot(g,cx,cy,8,WHITE);
  drawText(g,"SCHWARZSCHILD RADIUS vs REDUCED COMPTON WAVELENGTH",20,32,CYAN,14);
  drawText(g,"CYAN rₛ = "+fmt(rs,5),20,H-61,CYAN,18);drawText(g,"WHITE λ̄C = "+fmt(lambda,5),20,H-27,WHITE,18);
 }else if(mode==="gup"){
  const x0=.5,y0=H*.52,r=55+F.clamp(p.momentum,0,8)*18,r2=90+F.clamp(F.gup(p.beta,p.momentum),0,8)*35;
  g.save();g.translate(W/2,y0);g.rotate(phase*.002);g.scale(Math.max(.2,r/250),Math.max(.2,r2/250));for(let i=0;i<12;i++){circle(g,0,0,35+i*20,CYAN+"66",1.5);}g.restore();
  drawText(g,"HYPOTHETICAL GENERALIZED UNCERTAINTY / β="+fmt(p.beta),20,32,CYAN,14);
  drawText(g,"Δx ≥ "+fmt(F.gup(p.beta,p.momentum),5),20,H-26,WHITE,24);
 }else if(mode==="unify"){
  const cols=[CYAN,WHITE,"#83b7c3"],at=F.gauge(p.scale,p.db1,p.db2,p.db3),cx=W/2,cy=H/2;
  for(let i=0;i<3;i++){const t=at[i],r=70+i*38+Math.abs(Math.sin(phase*.01+i*2))*21;circle(g,cx,cy,r,cols[i],3);dot(g,cx+r*Math.cos(phase*.01*(1+i)),cy+r*Math.sin(phase*.01*(1+i)),7,cols[i]);}
  drawText(g,"ONE-LOOP STANDARD MODEL GAUGE COUPLINGS",20,32,CYAN,14);
  drawText(g,"U(1) 1/α₁ = "+fmt(at[0],3),20,H-89,CYAN,16);
  drawText(g,"SU(2) 1/α₂ = "+fmt(at[1],3),20,H-59,WHITE,16);
  drawText(g,"SU(3) 1/α₃ = "+fmt(at[2],3),20,H-29,"#83b7c3",16);
 }else if(mode==="entropy"){
  for(let i=0;i<s.particles.length;i++){const p=s.particles[i],x=p.x*W,y=45+(i*53%421);dot(g,x,y,3.4,p.v>=0?CYAN:WHITE);}
  drawText(g,"PARTICLES MIXING IN A PERIODIC ONE-DIMENSIONAL BOX",20,32,CYAN,14);
  drawText(g,"INITIAL STATE IS PURPOSELY CONCENTRATED",20,H-20,DIM,12);
 }
}
function drawMatrixSection(rows,y0,h){if(!rows.length)return;const N=rows[0].length,M=rows.length,w=world.width/N,height=h/M;
 for(let j=0;j<M;j++)for(let i=0;i<N;i++){g.fillStyle=rows[j][i]?CYAN:"#092630";g.fillRect(i*w,y0+j*height,w+.5,height+.5);}}
function analytics(){
 const s=sim.state,p=s.p,W=canvas.width,H=canvas.height;
 if(mode==="vacuum"&&nothing!=="quantum"){clear(cg,W,H);drawText(cg,nothing==="absolute"?"NOT DEFINED: NO PHYSICAL DYNAMICS":"NO QUANTUM MODEL FOR CLASSICAL EMPTY SPACE",W/2,H/2,CYAN,17,"center");return;}
 if(mode==="bell"){
 const expected=2*Math.SQRT2*p.visibility,end=Math.max(10,s.step);
 plotCurves(cg,W,H,[{points:s.history.map(a=>({x:a.t,y:a.y})),color:CYAN},{points:[{x:0,y:expected},{x:end,y:expected}],color:WHITE,dash:[6,5]},{points:[{x:0,y:2},{x:end,y:2}],color:"#85a3b0",dash:[2,4]}],0,end,0,4.1);
 drawText(cg,"CYAN SAMPLE / WHITE QUANTUM EXPECTATION / DIM LOCAL BOUND",75,22,WHITE,11);return;
 }
 if(mode==="decoherence"){
 const end=Math.max(8,s.time),rows=Array.from({length:130},(_,i)=>{const x=end*i/129,y=Math.exp(-p.gamma*x);return{x,y,purity:(1+y*y)/2}});
 plotCurves(cg,W,H,[{points:rows,color:CYAN},{points:rows.map(a=>({x:a.x,y:a.purity})),color:WHITE,dash:[6,5]}],0,end,0,1.05);
 drawText(cg,"CYAN COHERENCE / WHITE PURITY",75,22,WHITE,12);return;
 }
 if(mode==="tunnel"){const rows=Array.from({length:150},(_,i)=>{const x=.2+i*(4.8/149);return{x,y:F.transmission(x,p.height,p.width,p.mass)}});plotCurves(cg,W,H,[{points:rows,color:CYAN}],0.2,5,0,1.02);const q=xyPoint(p.energy,F.transmission(p.energy,p.height,p.width,p.mass),W,H,.2,5,0,1.02);dot(cg,q.x,q.y,6,WHITE);drawText(cg,"TRANSMISSION vs ENERGY / WHITE SELECTED",75,22,WHITE,12);return;}
 if(mode==="geometry"){const rows=Array.from({length:16},(_,i)=>({x:i,y:F.correlate(i,p.J,p.temp)}));plotCurves(cg,W,H,[{points:rows,color:CYAN}],0,15,0,1);drawText(cg,"SPIN CORRELATION vs SEPARATION",75,22,WHITE,12);return;}
 if(mode==="crossover"){const r=Array.from({length:130},(_,i)=>{const x=-3+i*6/129;return{x,rs:Math.log10(2*10**x),lambda:-x};});plotCurves(cg,W,H,[{points:r.map(q=>({x:q.x,y:q.rs})),color:CYAN},{points:r.map(q=>({x:q.x,y:q.lambda})),color:WHITE}],-3,3,-3.1,3.8);const a=xyPoint(p.logmass,Math.log10(2)+p.logmass,W,H,-3,3,-3.1,3.8);dot(cg,a.x,a.y,6,WHITE);drawText(cg,"log₁₀ MASS / log₁₀ LENGTH — CYAN rₛ / WHITE λ̄C",75,22,WHITE,11);return;}
 if(mode==="gup"){const rows=Array.from({length:140},(_,i)=>{const x=.1+i*7.9/139;return{x,y:F.gup(p.beta,x),ref:F.gup(0,x)}});const yHi=Math.min(18,Math.max(6,...rows.map(q=>Math.min(18,q.y))));plotCurves(cg,W,H,[{points:rows.map(q=>({x:q.x,y:Math.min(yHi,q.y)})),color:CYAN},{points:rows.map(q=>({x:q.x,y:Math.min(yHi,q.ref)})),color:WHITE,dash:[7,5]}],.1,8,0,yHi);const a=xyPoint(p.momentum,Math.min(yHi,F.gup(p.beta,p.momentum)),W,H,.1,8,0,yHi);dot(cg,a.x,a.y,6,WHITE);drawText(cg,"CYAN HYPOTHETICAL β / DASHED WHITE ORDINARY UNCERTAINTY",75,22,WHITE,11);return;}
 if(mode==="unify"){const r=Array.from({length:220},(_,i)=>{const x=2+i*16/219,y=F.gauge(x,p.db1,p.db2,p.db3);return{x,y};}),colors=[CYAN,WHITE,"#86b8c3"];
 const curves=colors.map((color,i)=>({color,points:r.map(q=>({x:q.x,y:q.y[i]}))}));let all=r.flatMap(q=>q.y),low=Math.floor(Math.min(...all)-2),high=Math.ceil(Math.max(...all)+2);
 plotCurves(cg,W,H,curves,2,18,low,high);
 const a=F.gauge(p.scale,p.db1,p.db2,p.db3);a.forEach((v,i)=>{const q=xyPoint(p.scale,v,W,H,2,18,low,high);dot(cg,q.x,q.y,5,colors[i]);});
 drawText(cg,"INVERSE GAUGE COUPLINGS vs log₁₀(E/GeV)",75,22,WHITE,12);return;}
 const rows=s.history;
 clear(cg,W,H);if(rows.length<2){drawText(cg,"RUN THE MODEL TO FILL THE TIME SERIES",W/2,H/2,DIM,15,"center");return;}
 let lo=Math.min(...rows.map(q=>q.y)),hi=Math.max(...rows.map(q=>q.y));if(hi-lo<1e-12){lo-=1;hi+=1;}const margin=.12*(hi-lo);lo-=margin;hi+=margin;const time0=rows[0].t,time1=rows.at(-1).t||1;
 plotCurves(cg,W,H,[{points:rows.map(q=>({x:q.t,y:q.y})),color:CYAN}],time0,time1,lo,hi);
 drawText(cg,"LIVE "+s.spec.tag+" DIAGNOSTIC",75,22,WHITE,12);
}
function render(){drawMain();analytics();const m=sim.metric(),blank=mode==="vacuum"&&nothing!=="quantum";
 $("metric").textContent=blank?"N/A":fmt(m.value,5);$("metricUnit").textContent=blank?"undefined / no computation":m.unit;$("metricDetail").textContent=blank?"No quantum oscillator is computed under this choice.":m.detail;
 $("steps").textContent=String(sim.state.step);$("running").textContent=playing?"● RUNNING":"Ⅱ PAUSED";$("play").textContent=playing?"Ⅱ PAUSE":"▶ RESUME";}
function feedback(s){$("feedback").textContent=s;}
function pos(evt){const b=world.getBoundingClientRect();return{x:F.clamp((evt.clientX-b.left)/b.width,0,.9999),y:F.clamp((evt.clientY-b.top)/b.height,0,.9999)};}
world.addEventListener("pointerdown",evt=>{if(evt.button!==0)return;evt.preventDefault();const p=pos(evt);if(mode==="vacuum"&&nothing!=="quantum"){feedback("Absolute nothing or classical empty spacetime is not a quantum-oscillator state.");return;}
sim.interact(p.x,p.y,evt.shiftKey);syncSliders();render();feedback("Manual experiment intervention: x="+p.x.toFixed(2)+" y="+p.y.toFixed(2));});
$("play").onclick=()=>{playing=!playing;render();};$("step").onclick=()=>{playing=false;if(mode==="vacuum"&&nothing!=="quantum"){render();feedback("No numerical dynamics exist for this definition of nothing.");return;}sim.step();render();};$("reset").onclick=()=>{select(mode,{...sim.state.p},seed);feedback("Model restarted. Parameters preserved.");};
$("reseed").onclick=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;select(mode,{...sim.state.p},seed);feedback("Seed changed to "+seed);};
$("speed").oninput=()=>{speed=Number($("speed").value);$("speedValue").textContent=speed.toFixed(2)+"×";};
$("searchMode").oninput=()=>{filter=$("searchMode").value.toLowerCase().trim();modelList();};
$("nothingSelect").onchange=()=>{applyNothing();render();feedback("Definition switched: "+nothing+".");};
const interpretations={
 science:"Physics can calculate the evolution of physical systems once mathematical laws and initial conditions are specified. A physically self-contained dynamical description does not establish the ultimate origin of those laws.",
 theism:"Theism can regard the existence of laws or the Universe as grounded in a divine reality. This toy cannot scientifically establish that interpretation; particular empirical theological claims would need separately defined tests.",
 naturalism:"Naturalism can regard the world and its laws as arising from impersonal physical or metaphysical facts. This toy cannot prove that ultimate grounding either.",
 agnostic:"There is no scientifically verified final answer to why anything exists, why these exact laws hold or whether an ultimate divine ground exists. Withholding a conclusion is a coherent epistemic position."
};
for(const button of document.querySelectorAll(".position"))button.onclick=()=>{for(const b of document.querySelectorAll(".position"))b.classList.toggle("active",b===button);$("positionDescription").textContent=interpretations[button.dataset.position]||interpretations.science;};
function rowsCsv(){const s=sim.state,p=s.p;if(mode==="tunnel")return["E,Transmission",...Array.from({length:100},(_,i)=>{const E=.2+i*4.8/99;return[E,F.transmission(E,p.height,p.width,p.mass)].join(",");})].join("\n");
 if(mode==="geometry")return["distance,correlation",...Array.from({length:16},(_,i)=>[i,F.correlate(i,p.J,p.temp)].join(","))].join("\n");
 if(mode==="crossover")return["log10_mass,log10_schwarzschild,log10_reduced_compton",...Array.from({length:100},(_,i)=>{const x=-3+i*6/99;return[x,Math.log10(2)+x,-x].join(",")})].join("\n");
 if(mode==="gup")return["delta_p,delta_x_assumed,delta_x_beta_zero",...Array.from({length:100},(_,i)=>{const x=.1+i*7.9/99;return[x,F.gup(p.beta,x),F.gup(0,x)].join(",")})].join("\n");
 if(mode==="unify")return["log10_energy_GeV,inverse_alpha1,inverse_alpha2,inverse_alpha3",...Array.from({length:120},(_,i)=>{const x=2+i*16/119;return[x,...F.gauge(x,p.db1,p.db2,p.db3)].join(",")})].join("\n");
 return ["step,model_metric",...s.history.map(q=>q.t+","+q.y)].join("\n");
}
function download(name,body,mime){const url=URL.createObjectURL(new Blob([body],{type:mime})),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
$("exportCsv").onclick=()=>{download("cosmos-frontier-"+mode+".csv",rowsCsv(),"text/csv;charset=utf-8");feedback("CSV model diagnostics exported.");};
$("exportJson").onclick=()=>{const s=sim.state;download("cosmos-frontier-"+mode+".json",JSON.stringify({model:mode,params:s.p,seed:s.seed,steps:s.step,metric:sim.metric(),history:s.history,definitionOfNothing:mode==="vacuum"?nothing:null,warning:s.spec.limit},null,2),"application/json");feedback("Numerical record exported.");};
$("exportPng").onclick=()=>{const W=1100,H=970,off=document.createElement("canvas");off.width=W;off.height=H;const ctx=off.getContext("2d");ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);drawText(ctx,"COSMOS LAB / FRONTIER QUESTIONS — "+mode.toUpperCase(),25,41,CYAN,21);ctx.drawImage(world,0,65,1100,570);ctx.drawImage(canvas,0,650,1100,299);
 off.toBlob(blob=>{if(!blob){feedback("PNG export unavailable.");return;}const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="cosmos-frontier-"+mode+".png";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1800);feedback("Image exported.");},"image/png");};
$("share").onclick=async()=>{const url=new URL(location.href);url.searchParams.set("model",mode);url.searchParams.set("seed",seed);for(const [k,v]of Object.entries(sim.state.p))url.searchParams.set(k,v);if(mode==="vacuum")url.searchParams.set("nothing",nothing);try{await navigator.clipboard.writeText(url.toString());feedback("Initial-setup URL copied. Manual interventions are not replayed.");}catch{feedback("Copy this URL: "+url);}};
function frame(t){if(!last)last=t;const dt=F.clamp(t-last,0,100);last=t;phase+=dt*speed*.3;
 if(playing){accum+=dt*speed/65;const ticks=Math.min(8,Math.floor(accum));if(ticks){accum-=ticks;
 for(let i=0;i<ticks;i++)if(!(mode==="vacuum"&&nothing!=="quantum"))sim.step();render();}
 else if(["tunnel","geometry","crossover","gup","unify","baryogenesis","bell","decoherence"].includes(mode))drawMain();}
 requestAnimationFrame(frame);
}
const qs=new URLSearchParams(location.search),id=F.MODES.some(x=>x.id===qs.get("model"))?qs.get("model"):"vacuum",preset=F.MODES.find(x=>x.id===id),init={};for(const [k,,min,max]of preset.params){if(qs.has(k)){const n=Number(qs.get(k));if(Number.isFinite(n))init[k]=F.clamp(n,min,max);}}
if(qs.has("seed")){const n=Number(qs.get("seed"));if(Number.isInteger(n)&&n>0)seed=n>>>0;}if(qs.has("nothing")&&["quantum","empty","absolute"].includes(qs.get("nothing")))$("nothingSelect").value=qs.get("nothing");
select(id,init,seed);requestAnimationFrame(frame);
})();