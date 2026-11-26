/* COSMOS LAB Toy → Reality UI. Each module: toy equation, real data, a score, and the limits of that score. */
(function(){"use strict";
const V=window.CosmosVerifyCore,K=window.CosmosKit;
if(!V||!K){document.body.textContent="Toy → Reality engine unavailable.";return;}
const $=id=>document.getElementById(id),f2=(x,d=2)=>Number.isFinite(x)?x.toFixed(d):"—";
const state={tab:"cmb",cmb:{T:2.725,model:"planck"},mercury:{body:"Mercury",gr:"1",lg:5.2},kepler:{n:2},
  lv:{a:V.LV_START[0],b:V.LV_START[1],c:V.LV_START[2],g:V.LV_START[3]},quakes:{region:"world",Mc:4.8,alpha:0.21}};
const sh=K.Share.read();
if(sh)for(const k of Object.keys(state)){if(k==="tab"){if(typeof sh.tab==="string"&&sh.tab in state)state.tab=sh.tab;continue;}
  if(sh[k]&&typeof sh[k]==="object")for(const f of Object.keys(state[k])){const v=sh[k][f];if((typeof v==="number"&&Number.isFinite(v))||(typeof v==="string"&&typeof state[k][f]==="string"))state[k][f]=v;}}

const MODS=[
 {id:"cmb",tab:"01 / BIG BANG LIGHT",sub:"Planck vs COBE",title:"THE MOST PERFECT<br/>BLACKBODY",tags:[["est","ESTABLISHED"]],
  desc:"If the early universe was a hot plasma in equilibrium, its leftover light must follow Planck’s law with a single number, the temperature. COBE/FIRAS measured 43 frequencies. Fit T yourself — then try the two classical approximations Planck replaced.",
  eq:"I(ν) = 2hν³/c² · 1/(e^{hν/kT} − 1)\nWien: e^{−hν/kT}   Rayleigh–Jeans: 2ν²kT/c²",
  fields:[{k:"model",label:"TOY LAW",options:[["planck","Planck (quantum, 1900)"],["wien","Wien (1896)"],["rj","Rayleigh–Jeans (classical)"]]},{k:"T",label:"TEMPERATURE T (K)",min:2,max:3.5,step:.001,fmt:v=>v.toFixed(3)}],
  btn:["◎ BEST-FIT T",()=>{const f=V.fitCMB(state.cmb.model);setField("cmb","T",f.T);}],
  note:"Data = NASA LAMBDA monopole (2.725 K blackbody + measured residuals). Uncertainties are taken as independent; the real bins are correlated and FIRAS’s absolute calibration limits T to ±0.001 K.",
  canvases:[["cA",900,400],["cB",900,300]]},
 {id:"mercury",tab:"02 / MERCURY",sub:"Einstein vs 43″",title:"THE ORBIT THAT<br/>NEWTON MISSED",tags:[["est","ESTABLISHED"]],
  desc:"Newtonian orbits close on themselves. Add the first correction of general relativity and the ellipse slowly rotates. The integrator finds each perihelion numerically; there is no free parameter to tune.",
  eq:"r̈ = −GM r/r³ · (1 + 3L²/(c²r²))\nΔϖ per orbit = 6πGM / (c² a (1−e²))",
  fields:[{k:"body",label:"BODY",options:V.DATA.perihelion.rows.map(r=>[r[0],r[0]])},{k:"gr",label:"PHYSICS",options:[["1","Newton + GR correction"],["0","Newton only"]]},{k:"lg",label:"PICTURE ONLY: EXAGGERATE GR BY 10^x",min:0,max:5.5,step:.1,fmt:v=>"×10^"+v.toFixed(1)}],
  note:"“Observed” = advance left after subtracting the pull of the other planets (≈ 532″/century for Mercury). The exaggeration slider changes only the drawing; all scores use the real strength.",
  canvases:[["cA",600,480],["cB",600,480]],two:2},
 {id:"kepler",tab:"03 / KEPLER",sub:"Why 1/r²?",title:"WEIGH THE SUN<br/>WITH A RULER",tags:[["est","ESTABLISHED"]],
  desc:"A force falling like 1/rⁿ makes circular-orbit periods grow like a^{(n+1)/2}. Slide n and see which law the eight planets choose. With G, the same orbits weigh the Sun and Jupiter.",
  eq:"F ∝ 1/rⁿ  ⇒  P ∝ a^{(n+1)/2}\nn = 2:  M = 4π² a³ / (G P²)",
  fields:[{k:"n",label:"FORCE LAW EXPONENT n",min:1,max:4,step:.01,fmt:v=>v.toFixed(2)}],
  btn:["◎ SET n = 2",()=>setField("kepler","n",2)],
  note:"Planets are slightly eccentric and feel each other; that is why the fitted exponent is not 1.5 to every digit. Reference masses: Sun 1.989×10³⁰ kg, Jupiter 1.898×10²⁷ kg.",
  canvases:[["cA",600,440],["cB",600,440]],two:2},
 {id:"lv",tab:"04 / HARE & LYNX",sub:"Predator–prey",title:"TWO EQUATIONS,<br/>A 10-YEAR CYCLE",tags:[["hyp","TOY MODEL"]],
  desc:"Hares grow, lynx eat hares, lynx starve without them. Two coupled equations give an endless cycle. Fit their four rates to 21 years of Hudson’s Bay Company pelt records and compare with the dumbest possible model: constant numbers.",
  eq:"dH/dt = a H − b H L\ndL/dt = c b H L − g L",
  fields:[{k:"a",label:"HARE GROWTH a (1/yr)",min:.1,max:1.5,step:.005,fmt:v=>v.toFixed(3)},{k:"b",label:"PREDATION b",min:.005,max:.08,step:.0005,fmt:v=>v.toFixed(4)},{k:"c",label:"CONVERSION c",min:.2,max:2,step:.01,fmt:v=>v.toFixed(2)},{k:"g",label:"LYNX DEATH g (1/yr)",min:.2,max:1.6,step:.005,fmt:v=>v.toFixed(3)}],
  btn:["◎ FIT TO DATA",()=>fitLV()],
  note:"Pelts traded measure trapping as well as animals. Gilpin (1973) noticed that in some years the phase runs backwards — “do hares eat lynx?” — and hares also cycle where lynx are absent. A good fit here supports the shape of the mechanism, not that it is the only cause.",
  canvases:[["cA",900,380],["cB",900,340]]},
 {id:"quakes",tab:"05 / EARTHQUAKES",sub:"Toy faults vs live USGS",title:"SPRING BLOCKS<br/>VS THE PLANET",tags:[["hyp","TOY MODEL"],["est","LIVE DATA"]],
  desc:"Real earthquakes obey Gutenberg–Richter: each magnitude step is about ten times rarer (b ≈ 1). The Olami–Feder–Christensen toy fault — blocks on springs that slip at a threshold — produces power-law quakes too. Load this year’s catalogue live and compare exponents.",
  eq:"log₁₀ N(≥M) = a − b M      (Aki MLE: b = log₁₀e / (M̄ − Mc + ΔM/2))\nOFC: F_i ≥ 1 ⇒ F_i → 0, F_nbr += α F_i ;  M_toy = ⅔ log₁₀(size)",
  fields:[{k:"region",label:"LIVE CATALOGUE (LAST 365 DAYS, USGS)",options:[["world","World, M ≥ 4.5"],["greece","Greece & Aegean, M ≥ 2.5"]]},{k:"Mc",label:"COMPLETENESS MAGNITUDE Mc",min:2.5,max:6,step:.1,fmt:v=>v.toFixed(1)},{k:"alpha",label:"TOY DISSIPATION α (0.25 = none)",min:.15,max:.24,step:.005,fmt:v=>v.toFixed(3)}],
  btn:["▶ RE-RUN TOY FAULT",()=>runOFC()],
  note:"The toy’s exponent depends on α, so tuning α until b matches is a fit, not a prediction. What the toy does show is that threshold + dissipation is enough for scale-free events. Below Mc the catalogue is incomplete; choose Mc where the curve becomes straight.",
  canvases:[["cA",900,420],["cB",900,300]]}
];

/* ---------- build ---------- */
const tabsEl=$("tabs"),modsEl=$("modules");
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
const fieldFmt={};
MODS.forEach(m=>{
  const tb=el("button",null,m.tab+"<small>"+m.sub+"</small>");tb.type="button";tb.setAttribute("role","tab");tb.dataset.id=m.id;tb.onclick=()=>setTab(m.id);tabsEl.appendChild(tb);
  const box=el("section","module");box.id="mod-"+m.id;
  const c=el("div","controls");c.append(el("div","kicker","MODULE "+m.tab.slice(0,2)),el("h2",null,m.title),el("div",null,m.tags.map(t=>'<span class="tag '+t[0]+'">'+t[1]+"</span>").join("")),el("p",null,m.desc),el("div","eq",m.eq));
  m.fields.forEach(f=>{const w=el("div","field"),id="f-"+m.id+f.k;
    if(f.options){w.innerHTML='<div class="ft"><label for="'+id+'">'+f.label+"</label></div>";const s=document.createElement("select");s.id=id;
      f.options.forEach(o=>{const op=document.createElement("option");op.value=o[0];op.textContent=o[1];s.appendChild(op);});s.value=state[m.id][f.k];
      s.onchange=()=>{state[m.id][f.k]=s.value;onChange(m.id,f.k);};w.appendChild(s);}
    else{fieldFmt[id]=f.fmt;w.innerHTML='<div class="ft"><label for="'+id+'">'+f.label+'</label><output id="o-'+m.id+f.k+'"></output></div>';
      const r=document.createElement("input");r.type="range";r.id=id;r.min=f.min;r.max=f.max;r.step=f.step;r.value=state[m.id][f.k];
      const out=w.querySelector("output");out.textContent=f.fmt(Number(r.value));
      r.oninput=()=>{state[m.id][f.k]=Number(r.value);out.textContent=f.fmt(Number(r.value));onChange(m.id,f.k,true);};w.appendChild(r);}
    c.appendChild(w);});
  const b=el("div","btns");
  if(m.btn){const x=el("button","btn primary",m.btn[0]);x.type="button";x.onclick=m.btn[1];b.appendChild(x);}
  const sb=el("button","btn","↗ COPY LINK");sb.type="button";sb.onclick=()=>K.Share.copy({...state,tab:m.id},sb);
  const eb=el("button","btn","↓ EXPORT JSON");eb.type="button";eb.onclick=()=>exportJSON(m.id);b.append(sb,eb);
  const stt=el("div","status","");stt.id="st-"+m.id;stt.setAttribute("role","status");c.append(b,stt,el("div","note",m.note));
  const st=el("div","stage"),vd=el("div","verdict","<b>…</b><span>computing</span>");vd.id="vd-"+m.id;st.appendChild(vd);
  const rd=el("div","reads");rd.id="rd-"+m.id;st.appendChild(rd);
  const mk=cv=>{const k=el("canvas");k.id=m.id+cv[0];k.width=cv[1];k.height=cv[2];return k;};
  if(m.two){const row=el("div","two");m.canvases.slice(0,m.two).forEach(cv=>row.appendChild(mk(cv)));st.appendChild(row);m.canvases.slice(m.two).forEach(cv=>st.appendChild(mk(cv)));}
  else m.canvases.forEach(cv=>st.appendChild(mk(cv)));
  const cap=el("p","cap","");cap.id="cap-"+m.id;st.appendChild(cap);
  box.append(c,st);modsEl.appendChild(box);});
function setField(id,k,v){state[id][k]=v;const r=$("f-"+id+k);if(r){r.value=v;const o=$("o-"+id+k);if(o)o.textContent=fieldFmt["f-"+id+k](Number(v));}onChange(id,k);}
function setTab(id){state.tab=id;document.querySelectorAll("#tabs button").forEach(b=>b.classList.toggle("active",b.dataset.id===id));document.querySelectorAll(".module").forEach(s=>s.classList.toggle("active",s.id==="mod-"+id));draw[id]&&draw[id]();}
const reads=(id,items)=>{$("rd-"+id).innerHTML=items.map(i=>"<div><small>"+i[0]+"</small><strong>"+i[1]+"</strong></div>").join("");};
const status=(id,t)=>{$("st-"+id).textContent=t;};
const cap=(id,t)=>{$("cap-"+id).textContent=t;};
function verdict(id,level,text){const lab={ok:"✓ SURVIVES",mid:"~ PARTLY",bad:"✗ FAILS"}[level];$("vd-"+id).innerHTML='<b class="'+level+'">'+lab+"</b><span>"+text+"</span>";}
const last={},score={};
let pending=0;
function onChange(id,k,live){if(id==="quakes"&&k==="region"){state.quakes.Mc=state.quakes.region==="world"?4.8:3.0;const r=$("f-quakesMc");r.value=state.quakes.Mc;$("o-quakesMc").textContent=state.quakes.Mc.toFixed(1);loadQuakes();return;}
  if(id==="quakes"&&k==="alpha"){if(live){cancelAnimationFrame(pending);}clearTimeout(ofcTimer);ofcTimer=setTimeout(runOFC,350);return;}
  cancelAnimationFrame(pending);pending=requestAnimationFrame(()=>draw[id]());}

/* ---------- scoreboard ---------- */
function board(){const items=[["CMB · PLANCK","cmb"],["MERCURY · GR","mercury"],["KEPLER · 1/r²","kepler"],["HARE–LYNX · LV","lv"],["EARTHQUAKES · OFC","quakes"]];
  $("board").innerHTML=items.map(([n,k])=>"<div><small>"+n+"</small><strong>"+(score[k]?score[k][0]:"…")+"</strong><em>"+(score[k]?score[k][1]:"computing")+"</em></div>").join("");}

/* ---------- 1. CMB ---------- */
const DATAC=V.firasData(),BEST={};["planck","wien","rj"].forEach(m=>BEST[m]=V.fitCMB(m));
score.cmb=["T = "+BEST.planck.T.toFixed(4)+" K","χ²/dof = "+f2(BEST.planck.chi2/BEST.planck.dof)];$("hT").textContent=BEST.planck.T.toFixed(4);
const draw={};
draw.cmb=function(){const s=state.cmb,T=s.T,m=s.model,c2=V.chi2T(T,m,DATAC),dof=DATAC.length-1,red=c2/dof;
  const nu=[],I=[];for(let x=1;x<=23;x+=.1){nu.push(x);I.push(V.radiance(x,T,m));}
  const name={planck:"Planck",wien:"Wien",rj:"Rayleigh–Jeans"}[m];
  K.plot($("cmbcA"),{series:[{x:nu,y:I,label:name+" law, T = "+T.toFixed(3)+" K",color:"#00d4e8",width:2.4},{x:DATAC.map(p=>p.nu),y:DATAC.map(p=>p.I),type:"points",r:3.2,color:"#ffb347",label:"COBE/FIRAS (43 bins)"}],
    xlim:[1,23],ylim:[0,Math.max(420,Math.min(1200,Math.max(...I)*1.05))],xlabel:"frequency ν (cm⁻¹)   [1 cm⁻¹ ≈ 30 GHz]",ylabel:"intensity (MJy/sr)"});
  const res=DATAC.map(p=>(p.I-V.radiance(p.nu,T,m))*1000);
  K.plot($("cmbcB"),{series:[{x:[1,23],y:[0,0],color:"#ffffff66",width:1},{x:DATAC.map(p=>p.nu),y:res,err:DATAC.map(p=>p.err*1000),type:"points",r:3,color:"#ff6b8b",label:"data − toy (kJy/sr), with 1σ bars"}],
    xlim:[1,23],xlabel:"frequency ν (cm⁻¹)",ylabel:"residual (kJy/sr)"});
  const peak=V.radiance(5.45,2.725,"planck"),rms=Math.sqrt(res.reduce((a,v)=>a+v*v,0)/res.length)/1000;
  reads("cmb",[["χ² / dof (YOUR T)",f2(red,red>100?0:2)],["BEST T, THIS LAW",BEST[m].T.toFixed(5)+" K"],["STAT. σ_T",(BEST.planck.sigma*1e6).toFixed(0)+" µK"],["RMS RESIDUAL / PEAK",(rms/peak*1e6).toFixed(0)+" ppm"],["PEAK (WIEN, ν)",(1.9609*T).toFixed(2)+" cm⁻¹"],["PHOTONS / cm³",(410.7*Math.pow(T/2.7255,3)).toFixed(0)]]);
  if(red<2)verdict("cmb","ok","Planck’s law with T = "+T.toFixed(3)+" K matches all 43 bins to within noise. Deviations are below ~50 parts per million of the peak.");
  else if(red<50)verdict("cmb","mid","Right shape, wrong temperature: χ²/dof = "+f2(red)+". Press BEST-FIT T.");
  else verdict("cmb","bad",name+" cannot fit: even its best temperature gives χ²/dof ≈ "+f2(BEST[m].chi2/dof,0)+". "+(m==="rj"?"The classical law diverges at high frequency — the ultraviolet catastrophe.":m==="wien"?"Wien misses the low-frequency side: quantum statistics matter.":"Move T closer to 2.725 K."));
  cap("cmb","The residual panel is where physics lives: with Planck’s law the points scatter around zero; with a wrong law or temperature they form a curve. The orange points are real satellite measurements from 1989–1990.");
  last.cmb={T,model:m,chi2:c2,dof,best:BEST};};

/* ---------- 2. Mercury ---------- */
let PT=null;
function perTable(){if(!PT){PT=V.perihelionTable();const me=PT[0];score.mercury=[f2(me.gr)+"″ vs "+me.obs+"″ ± "+me.sig,"pull "+f2(me.pull)+"σ, 0 free parameters"];$("hM").textContent=f2(me.gr);}return PT;}
draw.mercury=function(){const s=state.mercury,tab=perTable(),row=tab.find(r=>r.name===s.body),lam=s.gr==="1"?Math.pow(10,s.lg):0;
  const o=V.precessOrbit(row.e,row.c2,lam,12,4000),cv=$("mercurycA"),g=cv.getContext("2d"),W=cv.width,Hh=cv.height;
  g.fillStyle="#080e11";g.fillRect(0,0,W,Hh);const sc=Math.min(W,Hh)/2/(1+row.e)*.86,cx=W/2+sc*row.e*.3,cy=Hh/2;
  g.strokeStyle="#00d4e8";g.lineWidth=1.3;g.beginPath();o.path.forEach((p,i)=>{const x=cx+p[0]*sc,y=cy-p[1]*sc;i?g.lineTo(x,y):g.moveTo(x,y);});g.stroke();
  g.fillStyle="#ffb347";g.beginPath();g.arc(cx,cy,7,0,7);g.fill();
  g.strokeStyle="#ff6b8b";g.setLineDash([4,4]);o.perihelia.forEach(a=>{g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*sc*(1-row.e)*1.25,cy-Math.sin(a)*sc*(1-row.e)*1.25);g.stroke();});g.setLineDash([]);
  g.fillStyle="#fff";g.font="12px Inter,Arial";g.fillText(row.name+" — 12 orbits, GR exaggerated ×"+(lam?lam.toExponential(1):"0 (Newton)"),14,22);
  g.fillStyle="#ff6b8b";g.fillText("dashed: perihelia found by the integrator",14,40);
  const xs=tab.map((r,i)=>i+1);
  K.plot($("mercurycB"),{series:[{x:xs,y:tab.map(r=>r.obs),err:tab.map(r=>r.sig),type:"points",r:5,color:"#ffb347",label:"observed ± 1σ"},{x:xs.map(x=>x+.12),y:tab.map(r=>s.gr==="1"?r.gr:0),type:"points",r:5,color:"#00d4e8",label:s.gr==="1"?"toy: Newton + GR":"toy: Newton only"}],
    xlim:[.5,tab.length+.5],ylim:[-3,50],xlabel:tab.map((r,i)=>(i+1)+" "+r.name).join("   "),ylabel:"anomalous advance (″ per century)"});
  const pred=s.gr==="1"?row.gr:row.numErr,pull=(row.obs-pred)/row.sig,chi=tab.reduce((a,r)=>a+Math.pow((r.obs-(s.gr==="1"?r.gr:r.numErr))/r.sig,2),0);
  reads("mercury",[["TOY PREDICTION",f2(pred,s.gr==="1"?2:5)+"″ / cy"],["OBSERVED",row.obs+" ± "+row.sig+"″"],["PULL",f2(pull)+" σ"],["ANALYTIC 6πGM/c²a(1−e²)",f2(row.analytic,3)+"″"],["INTEGRATOR NOISE",row.numErr.toExponential(1)+"″"],["χ², 4 BODIES",f2(chi,1)]]);
  if(s.gr==="1")verdict("mercury",Math.abs(pull)<2?"ok":"mid",row.name+": general relativity predicts "+f2(row.gr)+"″ per century; observed "+row.obs+" ± "+row.sig+"″. With no adjustable parameter, all four bodies agree (χ² = "+f2(chi,1)+" for 4 points).");
  else verdict("mercury","bad","Newton alone predicts zero extra advance; "+row.name+" is "+f2(Math.abs(pull),1)+"σ away. This 43″ puzzle stood from 1859 until Einstein in 1915.");
  cap("mercury","Left: the real effect is 0.1″ per orbit, so the drawing multiplies the GR term by the slider value. Right: the scores use the true strength, computed by integrating the orbit and locating each perihelion.");
  last.mercury={state:s,table:tab};};

/* ---------- 3. Kepler ---------- */
draw.kepler=function(){const n=state.kepler.n,k=V.kepler(n),pl=V.DATA.planets.rows;
  if(!score.kepler){const k2=V.kepler(2);score.kepler=["exponent "+k2.fit.b.toFixed(5),"n = "+(2*k2.fit.b-1).toFixed(4)+" ± "+(2*k2.fit.se).toFixed(4)];$("hK").textContent=k2.fit.b.toFixed(4);}
  const lx=pl.map(r=>Math.log10(r[1])),ly=pl.map(r=>Math.log10(r[2])),gx=[-.6,1.6];
  K.plot($("keplercA"),{series:[{x:gx,y:gx.map(x=>k.k*x),label:"toy: P ∝ a^"+k.k.toFixed(2),color:"#00d4e8",width:2.4},{x:lx,y:ly,type:"points",r:5,color:"#ffb347",label:"8 planets"}],xlim:gx,ylim:[-1,2.6],xlabel:"log₁₀ a (AU)",ylabel:"log₁₀ P (years)"});
  /* implied central mass if the toy exponent were used: M ∝ a^{2k}/P^2 normalised to Earth */
  const imp=pl.map(r=>Math.pow(r[1],2*k.k)/Math.pow(r[2],2));
  K.plot($("keplercB"),{series:[{x:[.5,8.5],y:[1,1],color:"#ffffff66",width:1},{x:pl.map((r,i)=>i+1),y:imp,type:"points",r:5,color:"#ff6b8b",label:"inferred Sun mass ÷ value from Earth"}],xlim:[.5,8.5],logy:true,xlabel:pl.map((r,i)=>(i+1)+" "+r[0].slice(0,3)).join("  "),ylabel:"M(planet) / M(Earth)"});
  reads("kepler",[["DATA SLOPE",k.fit.b.toFixed(5)+" ± "+k.fit.se.toFixed(5)],["⇒ FORCE EXPONENT",(2*k.fit.b-1).toFixed(4)],["TOY RMS ERROR",(100*(Math.pow(10,k.rmsLog)-1)).toFixed(n===2?3:1)+" %"],["SUN MASS (n = 2)",k.Msun.toExponential(4)+" kg"],["JUPITER (MOONS)",k.Mjup.toExponential(4)+" kg"],["M_SUN / M_JUP",(k.Msun/k.Mjup).toFixed(0)]]);
  const err=100*(Math.pow(10,k.rmsLog)-1);
  if(err<.1)verdict("kepler","ok","An inverse-square force predicts every planet’s period to "+err.toFixed(3)+"% on average — and the same law, applied to Jupiter’s moons, weighs Jupiter at 1/"+(k.Msun/k.Mjup).toFixed(0)+" of the Sun.");
  else if(err<10)verdict("kepler","mid","With n = "+n.toFixed(2)+" the periods are off by "+err.toFixed(1)+"% on average; the inferred Sun mass drifts from planet to planet.");
  else verdict("kepler","bad","n = "+n.toFixed(2)+" fails: periods off by "+err.toFixed(0)+"% and each planet ‘weighs’ a different Sun. Only n ≈ 2 gives one Sun.");
  cap("kepler","Right panel: if the force law is wrong, every planet implies a different mass for the Sun. Only at n = 2 do all eight agree — that is Newton’s argument, done with modern data.");
  last.kepler={n,result:{slope:k.fit,Msun:k.Msun,Mjup:k.Mjup,msun:k.msun,mjup:k.mjup}};};

/* ---------- 4. Lotka–Volterra ---------- */
let LVFIT=null,lvInit=[V.LV_START[4],V.LV_START[5]];const LVBASE=V.lvBaseline();
function lvParams(){const s=state.lv;return[s.a,s.b,s.c,s.g,lvInit[0],lvInit[1]];}
function fitLV(){status("lv","Fitting six numbers by Nelder–Mead…");setTimeout(()=>{const t0=performance.now();LVFIT=V.fitLV();const x=LVFIT.x;lvInit=[x[4],x[5]];
  ["a","b","c","g"].forEach((k,i)=>setField("lv",k,x[i]));score.lv=["R²(log) = "+f2(1-LVFIT.f/LVBASE,2),"6 fitted numbers, 42 points"];board();
  status("lv","Fit done in "+(performance.now()-t0).toFixed(0)+" ms. Loss "+f2(LVFIT.f,2)+" vs "+f2(LVBASE,2)+" for constant populations.");},30);}
draw.lv=function(){const d=V.DATA.hareLynx,p=lvParams(),sim=V.lv(p,20,.02),loss=V.lvLoss(p),r2=1-loss/LVBASE;
  if(!sim){verdict("lv","bad","These rates blow up the populations. Press FIT TO DATA.");return;}
  const ty=sim.t.map(t=>1900+t);
  K.plot($("lvcA"),{series:[{x:ty,y:sim.H,label:"toy hares",color:"#00d4e8",width:2.2},{x:ty,y:sim.L,label:"toy lynx",color:"#ff6b8b",width:2.2},{x:d.year,y:d.hare,type:"points",r:4,color:"#00d4e8",label:"hare pelts"},{x:d.year,y:d.lynx,type:"points",r:4,color:"#ff6b8b",label:"lynx pelts"}],xlim:[1900,1920],xlabel:"year",ylabel:"thousands"});
  K.plot($("lvcB"),{series:[{x:sim.H,y:sim.L,label:"toy orbit in (hares, lynx)",color:"#00d4e8",width:1.8},{x:d.hare,y:d.lynx,type:"points",r:4,color:"#ffb347",label:"data 1900–1920"}],xlabel:"hares (thousands)",ylabel:"lynx (thousands)"});
  const s=state.lv,per=2*Math.PI/Math.sqrt(s.a*s.g);
  reads("lv",[["R² ON LOG SCALE",f2(r2,3)],["LOSS (TOY / CONSTANT)",f2(loss,2)+" / "+f2(LVBASE,2)],["SMALL-CYCLE PERIOD 2π/√(ag)",f2(per,1)+" yr"],["EQUILIBRIUM HARES g/(cb)",f2(s.g/(s.c*s.b),1)+"k"],["EQUILIBRIUM LYNX a/b",f2(s.a/s.b,1)+"k"]]);
  if(r2>.8)verdict("lv","ok","Two equations explain "+(100*r2).toFixed(0)+"% of the log-variation in 21 years of records, with the lynx peak lagging the hares by 1–2 years as in the ledgers.");
  else if(r2>.3)verdict("lv","mid","Partial: R² = "+f2(r2,2)+". The cycle is there but the timing or size is off. Try FIT TO DATA.");
  else verdict("lv","bad","No better than assuming constant populations (R² = "+f2(r2,2)+").");
  cap("lv","Top: years on the horizontal axis. Bottom: the same model as a closed loop in the hare–lynx plane — Lotka–Volterra conserves a quantity, so the toy cycle never damps, unlike real ecosystems.");
  last.lv={params:p,loss,baseline:LVBASE,r2};};

/* ---------- 5. Earthquakes ---------- */
const QK={},REG={world:"minmagnitude=4.5",greece:"minmagnitude=2.5&minlatitude=34&maxlatitude=42&minlongitude=19&maxlongitude=30"};
let ofcSizes=null,ofcTimer=0,ofcToken=0;
async function loadQuakes(){const r=state.quakes.region;if(QK[r]){draw.quakes();return;}
  const end=new Date(),start=new Date(end.getTime()-365*864e5),iso=d=>d.toISOString().slice(0,10);
  const url="https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=magnitude&limit=20000&starttime="+iso(start)+"&endtime="+iso(end)+"&"+REG[r];
  status("quakes","Downloading the last 365 days from USGS…");
  try{const res=await fetch(url);if(!res.ok)throw new Error("HTTP "+res.status);const js=await res.json();
    const mags=js.features.map(f=>f.properties.mag).filter(m=>Number.isFinite(m)).map(m=>Math.round(m*10)/10);
    const big=js.features.slice(0,3).map(f=>"M"+f.properties.mag+" "+f.properties.place);
    QK[r]={mags,big,from:iso(start),to:iso(end),url};status("quakes",mags.length+" events loaded live ("+iso(start)+" → "+iso(end)+"). Largest: "+big.join(" · "));}
  catch(e){status("quakes","Could not reach USGS ("+e.message+"). The toy fault still runs; real data need a connection.");QK[r]=null;if(!score.quakes){score.quakes=["offline","USGS unreachable"];board();}}
  draw.quakes();}
function runOFC(){const my=++ofcToken;status("quakes",(QK[state.quakes.region]?"":"")+"Running the toy fault (32×32 blocks, 6000 events)…");
  setTimeout(()=>{if(my!==ofcToken)return;const t0=performance.now();ofcSizes=V.ofc(32,state.quakes.alpha,6000,20261126);
    if(my!==ofcToken)return;status("quakes","Toy fault: "+ofcSizes.length+" events in "+(performance.now()-t0).toFixed(0)+" ms (largest slipped "+Math.max(...ofcSizes)+" blocks).");draw.quakes();},20);}
function grCurve(mags,Mc){const m=mags.filter(v=>v>=Mc-1e-9),n=m.length,x=[],y=[];if(!n)return{x,y,n};const mx=Math.max(...m);
  for(let M=Mc;M<=mx+1e-9;M+=.1){const c=m.filter(v=>v>=M-1e-9).length;x.push(M-Mc);y.push(c/n);}return{x,y,n};}
draw.quakes=function(){const s=state.quakes,q=QK[s.region],series=[],out=[];let breal=null,btoy=null;
  if(q){breal=V.bValue(q.mags,s.Mc,.1);const c=grCurve(q.mags,s.Mc);series.push({x:c.x,y:c.y,type:"points",r:3.5,color:"#ffb347",label:"USGS, M ≥ "+s.Mc.toFixed(1)+" ("+c.n+")"});
    if(breal)series.push({x:[0,4],y:[1,Math.pow(10,-4*breal.b)],color:"#ffb347",width:1.4,label:"b = "+breal.b.toFixed(2)});}
  if(ofcSizes){const smin=4;btoy=V.ofcB(ofcSizes,smin);const mt=ofcSizes.filter(v=>v>=smin).map(v=>Math.round(20/3*Math.log10(v))/10);const c=grCurve(mt,Math.min(...mt));
    series.push({x:c.x,y:c.y,type:"points",r:3,color:"#00d4e8",label:"toy fault, α = "+s.alpha.toFixed(3)});if(btoy)series.push({x:[0,4],y:[1,Math.pow(10,-4*btoy.b)],color:"#00d4e8",width:1.4,label:"b_toy = "+btoy.b.toFixed(2)});}
  if(series.length)K.plot($("quakescA"),{series,logy:true,xlim:[0,4],ylim:[1e-4,1.2],xlabel:"magnitude above the cut, M − Mc",ylabel:"fraction with magnitude ≥ M"});
  if(q){const h=K.histogram(q.mags,Math.min(...q.mags),Math.max(...q.mags)+.1,Math.min(60,Math.round((Math.max(...q.mags)-Math.min(...q.mags))*10)+1),false);
    K.plot($("quakescB"),{series:[{x:h.x,y:h.y.map(v=>v||NaN),type:"bars",barWidth:h.width,color:"#ffb347",label:"events per 0.1 magnitude (live)"}],logy:true,vlines:[{x:s.Mc,label:"Mc",color:"#ff6b8b"}],xlabel:"magnitude",ylabel:"count"});}
  if(breal&&!score.quakes||(breal&&s.region==="world")){score.quakes=["b = "+breal.b.toFixed(2)+" ± "+breal.err.toFixed(2)+(s.region==="world"?" (world)":" (Greece)"),btoy?"toy b = "+btoy.b.toFixed(2)+" at α = "+s.alpha.toFixed(3):"live USGS"];$("hB").textContent=breal.b.toFixed(2);board();}
  reads("quakes",[["REAL b (AKI MLE)",breal?breal.b.toFixed(3)+" ± "+breal.err.toFixed(3):"—"],["EVENTS ≥ Mc",breal?breal.n:"—"],["TOY b",btoy?btoy.b.toFixed(3)+" ± "+btoy.err.toFixed(3):"—"],["TOY α",s.alpha.toFixed(3)],["10× RARER PER",breal?f2(1/breal.b,2)+" mag":"—"]]);
  if(breal&&btoy){const z=Math.abs(breal.b-btoy.b)/Math.hypot(breal.err,btoy.err);
    verdict("quakes",z<2?"ok":z<5?"mid":"bad",z<2?"At α = "+s.alpha.toFixed(3)+" the toy fault’s exponent ("+btoy.b.toFixed(2)+") agrees with this year’s real earthquakes ("+breal.b.toFixed(2)+"). Remember: α was chosen, so this is a fit.":"Exponents differ by "+z.toFixed(1)+"σ (toy "+btoy.b.toFixed(2)+" vs real "+breal.b.toFixed(2)+"). "+(btoy.b>breal.b?"Less dissipation (larger α) makes big toy quakes commoner.":"More dissipation (smaller α) makes big toy quakes rarer."));}
  else if(btoy)verdict("quakes","mid","Toy fault ready (b = "+btoy.b.toFixed(2)+"); waiting for real data.");
  cap("quakes","Both curves are power laws — straight lines on this log scale. The live catalogue is downloaded from USGS each time the page loads; nothing about it is stored in this site. The toy curve bends down at large sizes because the fault has only 32×32 blocks.");
  last.quakes={state:s,real:breal,toy:btoy,source:q?q.url:null,period:q?[q.from,q.to]:null};};

function exportJSON(id){draw[id]();K.download("cosmos-toy-reality-"+id+".json",JSON.stringify({module:id,generated:new Date().toISOString(),note:"Toy-model output compared with published or live measurements. See the page for the limits of each comparison.",data_source:{cmb:V.DATA.firas.source,mercury:V.DATA.perihelion.source,kepler:V.DATA.planets.source+"; "+V.DATA.galilean.source,lv:V.DATA.hareLynx.source,quakes:"USGS FDSN event web service (live)"}[id],result:last[id]},null,2),"application/json");}

/* ---------- start ---------- */
board();perTable();draw.kepler();board();setTab(state.tab);
if(!(sh&&sh.lv))setTimeout(()=>{fitLV();},60);loadQuakes();runOFC();
})();
