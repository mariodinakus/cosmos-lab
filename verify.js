/* COSMOS LAB Toy → Reality UI. Each module: toy equation, real data, a score, and the limits of that score. */
(function(){"use strict";
const V=window.CosmosVerifyCore,K=window.CosmosKit;
if(!V||!K){document.body.textContent="Toy → Reality engine unavailable.";return;}
const $=id=>document.getElementById(id),f2=(x,d=2)=>Number.isFinite(x)?x.toFixed(d):"—";
const state={tab:"cmb",cmb:{T:2.725,model:"planck"},mercury:{body:"Mercury",gr:"1",lg:5.2},kepler:{n:2},
  lv:{a:V.LV_START[0],b:V.LV_START[1],c:V.LV_START[2],g:V.LV_START[3]},quakes:{region:"world",Mc:4.8,alpha:0.21},
  hubble:{model:"lcdm",Om:0.35,zmin:0.01},hydrogen:{p:2},light:{gamma:1},climate:{body:"Earth",layers:0},population:{model:"logistic"},
  strings:{p:2},liv:{n:1,lgE:0},horizon:{chi:0},extra:{n:2,M:1}};
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
  canvases:[["cA",900,420],["cB",900,300]]},
 {id:"hubble",tab:"06 / ACCELERATION",sub:"Friedmann vs 1580 SNe",title:"IS THE UNIVERSE<br/>SPEEDING UP?",tags:[["est","ESTABLISHED"]],
  desc:"The Friedmann equation predicts how bright a standard candle looks at each redshift. Compare three toy universes with 1,580 Pantheon+ type Ia supernovae: matter only, completely empty, and matter plus a cosmological constant.",
  eq:"H(z)² = H₀² [Ωm (1+z)³ + 1 − Ωm]   (flat)\nd_L = (1+z) c ∫₀ᶻ dz'/H(z') ,  Milne: d_L = (c/H₀) z (1 + z/2)",
  fields:[{k:"model",label:"TOY UNIVERSE",options:[["lcdm","Flat: matter + Λ (your Ωm)"],["eds","Matter only (Einstein–de Sitter)"],["milne","Empty, coasting (Milne)"]]},{k:"Om",label:"MATTER DENSITY Ωm (FLAT MODEL)",min:0,max:1,step:.005,fmt:v=>v.toFixed(3)},{k:"zmin",label:"MINIMUM REDSHIFT",min:.01,max:.1,step:.005,fmt:v=>v.toFixed(3)}],
  btn:["◎ BEST-FIT Ωm",()=>{const f=V.sneFit(sneD());setField("hubble","Om",f.Om);setField("hubble","model","lcdm");}],
  note:"Diagonal statistical errors only (the full Pantheon+ covariance is not used), so χ² differences are exaggerated and Ωm’s uncertainty is underestimated. H₀ is degenerate with the supernova absolute magnitude and is marginalised.",
  canvases:[["cA",900,400],["cB",900,300]]},
 {id:"hydrogen",tab:"07 / HYDROGEN",sub:"Bohr vs NIST",title:"THE ATOM’S<br/>BARCODE",tags:[["est","ESTABLISHED"]],
  desc:"Bohr’s 1913 toy atom — an electron on quantised orbits — predicts every visible hydrogen line from one constant. Fit it to seven Balmer lines from NIST, then change the 1/n² law and see the barcode smear.",
  eq:"1/λ = R (1/2² − 1/nᵖ)   Bohr: p = 2\nR_H = m_e e⁴ / (8 ε₀² h³ c) · μ/m_e = 10 967 758 m⁻¹",
  fields:[{k:"p",label:"ENERGY-LEVEL EXPONENT p",min:1.5,max:2.5,step:.001,fmt:v=>v.toFixed(3)}],
  btn:["◎ SET p = 2",()=>setField("hydrogen","p",2)],
  note:"Air wavelengths are converted to vacuum (Edlén 1966). The remaining few-ppm scatter is fine structure and the Lamb shift, which Bohr’s model cannot know about.",
  canvases:[["cA",900,240],["cB",900,320]]},
 {id:"light",tab:"08 / BENDING LIGHT",sub:"Eddington → Cassini",title:"DOES GRAVITY<br/>BEND LIGHT TWICE?",tags:[["est","ESTABLISHED"]],
  desc:"A Newtonian light corpuscle grazing the Sun is deflected 0.87″. General relativity doubles it to 1.75″ because space is curved too. The parametrised post-Newtonian γ interpolates: Newton γ = 0, Einstein γ = 1.",
  eq:"θ = (1+γ)/2 · 4GM☉/(c²R☉) = (1+γ)/2 · 1.751″\nShapiro delay ∝ (1+γ)/2 as well",
  fields:[{k:"gamma",label:"PPN PARAMETER γ",min:-0.2,max:1.4,step:.001,fmt:v=>v.toFixed(3)}],
  btn:["◎ BEST-FIT γ",()=>{let b=1,bc=1e99;for(let g=.9;g<=1.1;g+=1e-6){const c=V.lightChi2(g);if(c<bc){bc=c;b=g;}}setField("light","gamma",b);}],
  note:"The 1919 plates were few and debated; their historic weight is far larger than their statistical weight. The modern constraint is dominated by Cassini radio timing: γ − 1 = (2.1 ± 2.3)×10⁻⁵.",
  canvases:[["cA",900,380]]},
 {id:"climate",tab:"09 / PLANET TEMPS",sub:"Greenhouse test",title:"WHY ISN’T EARTH<br/>FROZEN?",tags:[["est","ESTABLISHED"],["hyp","TOY MODEL"]],
  desc:"Sunlight in = heat radiated out gives each planet an equilibrium temperature with no free parameter. Where the toy fails, the failure measures something real: an atmosphere’s greenhouse effect, or a planet’s internal heat.",
  eq:"T_eq = [S₀ (1 − A) / (4σ a²)]^¼ ,  S₀ = 1361 W/m²\nn grey layers:  T_s = T_eq (n + 1)^¼",
  fields:[{k:"body",label:"BODY",options:V.DATA.climate.rows.map(r=>[r[0],r[0]])},{k:"layers",label:"GREY ATMOSPHERE LAYERS n",min:0,max:120,step:.05,fmt:v=>v.toFixed(2)}],
  btn:["◎ LAYERS NEEDED",()=>{const c=V.climate().find(x=>x.name===state.climate.body);setField("climate","layers",Math.max(0,c.layers));}],
  note:"A single grey-layer stack is a cartoon of radiative transfer. Jupiter’s value is its effective (emission) temperature; its excess over T_eq is internal heat from slow contraction, not greenhouse warming.",
  canvases:[["cA",900,380]]},
 {id:"population",tab:"10 / HUMANITY",sub:"Exponential vs logistic",title:"WILL WE GROW<br/>FOREVER?",tags:[["hyp","TOY MODEL"]],
  desc:"Malthus: constant growth rate, exponential explosion. Verhulst: growth slows as a carrying capacity K is approached. Fit both to world population since 1950 and read off what each claims about 2100.",
  eq:"Exponential: P = P₀ e^{rt}\nLogistic:   P = K / (1 + (K/P₀ − 1) e^{−rt})",
  fields:[{k:"model",label:"TOY",options:[["logistic","Logistic (Verhulst 1838)"],["exp","Exponential (Malthus 1798)"]]}],
  note:"Nine data points cannot pin down K; the logistic K is an extrapolation, not a measurement. Human population is driven by fertility choices, not food-limited carrying capacity. UN 2024 projects a peak near 10.3 billion in the 2080s.",
  canvases:[["cA",900,380]]},
 {id:"strings",tab:"11 / STRINGS",sub:"Where strings began",title:"STRING THEORY’S<br/>FIRST SUCCESS",tags:[["est","HADRONS: WORKS"],["spec","QUANTUM GRAVITY: UNTESTED"]],
  desc:"String theory was born in 1968–70 to explain mesons. A spinning relativistic string has angular momentum J growing like mass squared — Regge trajectories. Fit real mesons from the PDG and measure the string tension. Then change the power.",
  eq:"Rotating string:  J = α₀ + α′ M²\nTension σ = 1 / (2π α′)",
  fields:[{k:"p",label:"POWER p IN J = α₀ + c Mᵖ",min:.5,max:3.5,step:.01,fmt:v=>v.toFixed(2)}],
  btn:["◎ SET p = 2 (STRING)",()=>setField("strings","p",2)],
  note:"This is a real success — but of QCD flux tubes behaving like strings, not of string theory as quantum gravity. String theory at the Planck scale has, as of today, no confirmed experimental prediction; this lab cannot test it, and says so.",
  canvases:[["cA",600,420],["cB",600,420]],two:2},
 {id:"liv",tab:"12 / QUANTUM SPACETIME",sub:"Gamma-ray burst race",title:"IS SPACETIME<br/>GRAINY?",tags:[["hyp","QUANTUM GRAVITY TOY"],["est","REAL BOUND"]],
  desc:"Many quantum-gravity ideas let light’s speed depend weakly on energy near the Planck scale. A 31 GeV photon from GRB 090510, 7 billion light-years away, would then lag the low-energy flash. It arrived within 0.86 s. Set the quantum-gravity energy scale and see if the toy survives.",
  eq:"v(E) ≈ c [1 − (n+1)/2 · (E/E_QG)ⁿ]\nΔt = (1+n)/2 · (E/E_QG)ⁿ · H₀⁻¹ ∫ (1+z)ⁿ / E(z) dz",
  fields:[{k:"n",label:"ORDER OF THE EFFECT",options:[["1","Linear, n = 1"],["2","Quadratic, n = 2"]]},{k:"lgE",label:"E_QG / E_PLANCK = 10^x",min:-3,max:3,step:.01,fmt:v=>"10^"+v.toFixed(2)}],
  note:"Assumes the high-energy photon was emitted no earlier than the low-energy onset (subluminal case). Published conservative bound: E_QG,1 > 1.19 E_Planck. This rules out the simplest linear effects at the Planck scale; quadratic effects remain far beyond reach.",
  canvases:[["cA",900,380]]},
 {id:"horizon",tab:"13 / BLACK HOLES",sub:"Hawking area theorem",title:"CAN A HORIZON<br/>SHRINK?",tags:[["est","SUPPORTED BY LIGO"],["spec","HAWKING RADIATION: UNOBSERVED"]],
  desc:"Hawking’s 1971 area theorem: in classical gravity a black hole’s horizon area can never decrease — the second law for black holes. Check it with the initial and final masses and spins of real LIGO–Virgo mergers, and compute the Bekenstein–Hawking entropy.",
  eq:"Kerr: A = 8π (GM/c²)² (1 + √(1−χ²))\nS = k_B A / (4 ℓ_P²) ,  T_H = ħc³ / (8πGMk_B)",
  fields:[{k:"chi",label:"ASSUMED SPIN OF THE TWO INITIAL HOLES χ",min:0,max:.99,step:.01,fmt:v=>v.toFixed(2)}],
  note:"Median values only; posterior uncertainties are not propagated (the LIGO analysis of GW150914 found the area grew with ~97% probability using separate inspiral and ringdown fits). Hawking temperatures of nanokelvin are far too cold to detect — Hawking radiation remains unobserved.",
  canvases:[["cA",900,380]]},
 {id:"extra",tab:"14 / EXTRA DIMENSIONS",sub:"Is gravity 1/r² at 50 µm?",title:"HIDDEN<br/>DIMENSIONS?",tags:[["spec","STRING-INSPIRED"],["est","REAL BOUND"]],
  desc:"String theory needs extra dimensions. In the ADD idea some are large, which would make gravity’s true strength the TeV scale. Pick how many and the fundamental scale; the toy tells you their size — and whether planets or a torsion balance in Seattle have already ruled it out.",
  eq:"M_Pl² = M*^{n+2} Rⁿ   (reduced Planck mass)\nfor r ≪ R:  V(r) ∝ 1/r^{1+n}   (gravity leaks into n extra dims)",
  fields:[{k:"n",label:"NUMBER OF LARGE EXTRA DIMENSIONS n",min:1,max:6,step:1,fmt:v=>v.toFixed(0)},{k:"M",label:"FUNDAMENTAL GRAVITY SCALE M* (TeV)",min:.5,max:20,step:.1,fmt:v=>v.toFixed(1)}],
  note:"Size is order-of-magnitude (factors of 2π depend on conventions). Only the short-distance inverse-square test is applied; LHC searches and supernova/neutron-star bounds exclude much more, especially for n = 2–3.",
  canvases:[["cA",900,380]]}
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
function board(){const items=[["CMB · PLANCK","cmb"],["MERCURY · GR","mercury"],["KEPLER · 1/r²","kepler"],["HARE–LYNX · LV","lv"],["EARTHQUAKES · OFC","quakes"],["ACCELERATION · Λ","hubble"],["HYDROGEN · BOHR","hydrogen"],["LIGHT · γ","light"],["PLANET TEMPS","climate"],["POPULATION","population"],["STRINGS · REGGE","strings"],["QG · GRB 090510","liv"],["BH AREA · LIGO","horizon"],["EXTRA DIMS · ADD","extra"]];
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


/* ---------- 6. Friedmann vs Pantheon+ ---------- */
let SNE=null,SNEkey="",SNEfit=null,SNEcmp=null;
function sneD(){const z=state.hubble.zmin;if(SNEkey!==String(z)){SNE=V.sneData(window.PANTHEON_PLUS,z);SNEkey=String(z);SNEfit=null;SNEcmp=null;}return SNE;}
draw.hubble=function(){if(!window.PANTHEON_PLUS){verdict("hubble","mid","Pantheon+ data file not loaded.");return;}
  const s=state.hubble,d=sneD();if(!SNEfit){SNEfit=V.sneFit(d);SNEcmp={eds:V.sneChi2(d,1).chi2,milne:V.sneChi2(d,0,true).chi2};}
  const Om=s.model==="eds"?1:s.Om,cur=V.sneChi2(d,Om,s.model==="milne"),ref=V.sneChi2(d,0,true);
  /* binned residuals relative to empty universe */
  const idx=d.z.map((_,i)=>i).sort((a,b)=>d.z[a]-d.z[b]),nb=24,per=Math.ceil(idx.length/nb),bx=[],by=[],be=[];
  for(let k=0;k<idx.length;k+=per){let W=0,zs=0,rs=0;for(const i of idx.slice(k,k+per)){const iv=1/(d.e[i]*d.e[i]);W+=iv;zs+=iv*d.z[i];rs+=iv*(d.m[i]-ref.off-ref.mu[i]);}bx.push(zs/W);by.push(rs/W);be.push(1/Math.sqrt(W));}
  const zg=[],yl=[],ye=[],ym=[];const milneMu=z=>5*Math.log10(V.lumDist(z,0,true));
  for(let z=.01;z<=2.3;z*=1.08){zg.push(Math.log10(z));const m0=milneMu(z);yl.push(5*Math.log10(V.lumDist(z,Om,s.model==="milne"))+cur.off-ref.off-m0);ye.push(5*Math.log10(V.lumDist(z,1))+V.sneChi2(d,1).off-ref.off-m0);}
  K.plot($("hubblecA"),{series:[{x:[-2,.4],y:[0,0],color:"#ffffff66",width:1,label:"empty (Milne)"},{x:zg,y:ye,color:"#ff6b8b",width:1.6,label:"matter only"},{x:zg,y:yl,color:"#00d4e8",width:2.4,label:"your toy"},{x:bx.map(Math.log10),y:by,err:be,type:"points",r:4,color:"#ffb347",label:"Pantheon+ (binned)"}],xlim:[-2,.4],ylim:[-.6,.35],xlabel:"log₁₀ redshift z",ylabel:"Δ magnitude vs empty universe"});
  const ch=[];for(let o=0;o<=1;o+=.01)ch.push(V.sneChi2(d,o).chi2-SNEfit.chi2);
  K.plot($("hubblecB"),{series:[{x:ch.map((_,i)=>i/100),y:ch,color:"#00d4e8",label:"Δχ² of flat Λ model"},{x:[s.Om],y:[V.sneChi2(d,s.Om).chi2-SNEfit.chi2],type:"points",r:6,color:"#ffb347",label:"your Ωm"}],ylim:[0,Math.min(800,Math.max(...ch))],xlabel:"Ωm (ΩΛ = 1 − Ωm)",ylabel:"χ² − best"});
  const dc=cur.chi2-SNEfit.chi2,n=d.z.length;
  reads("hubble",[["χ² (YOUR TOY)",f2(cur.chi2,1)],["BEST FLAT Ωm",SNEfit.Om.toFixed(3)],["ΩΛ = 1 − Ωm",(1-SNEfit.Om).toFixed(3)],["Δχ² MATTER-ONLY",f2(SNEcmp.eds-SNEfit.chi2,0)],["Δχ² EMPTY",f2(SNEcmp.milne-SNEfit.chi2,0)],["AGE (H₀ 67.4)",V.ageGyr(67.4,SNEfit.Om).toFixed(2)+" Gyr"],["SUPERNOVAE",n]]);
  score.hubble=["ΩΛ = "+(1-SNEfit.Om).toFixed(2),"matter-only Δχ² = "+f2(SNEcmp.eds-SNEfit.chi2,0)];
  if(dc<4)verdict("hubble","ok","Accelerating universe: a flat model with Ωm = "+Om.toFixed(3)+" (ΩΛ = "+(1-Om).toFixed(3)+") fits "+n+" supernovae. Distant supernovae are fainter than any decelerating universe allows.");
  else if(dc<100)verdict("hubble","mid","Close but disfavoured: Δχ² = "+f2(dc,0)+" above the best flat model.");
  else verdict("hubble","bad",(s.model==="eds"?"A matter-only universe":s.model==="milne"?"An empty universe":"This Ωm")+" is ruled out: Δχ² = "+f2(dc,0)+". "+(s.model==="milne"?"Even zero matter is not enough — something must accelerate the expansion.":"Distant supernovae are too faint."));
  cap("hubble","Top: supernova brightness relative to an empty coasting universe. Points above zero are fainter, i.e. farther: the expansion has sped up. This is the 2011 Nobel result, re-run on today’s data in your browser.");
  last.hubble={state:s,Om,chi2:cur.chi2,best:SNEfit,compare:SNEcmp,n};board();};

/* ---------- 7. Hydrogen ---------- */
draw.hydrogen=function(){const p=state.hydrogen.p,f=V.balmerFit(p),f2b=V.balmerFit(2),cv=$("hydrogencA"),g=cv.getContext("2d"),W=cv.width,Hh=cv.height;
  g.fillStyle="#080e11";g.fillRect(0,0,W,Hh);const X=l=>40+(l-370)/(670-370)*(W-80);
  const col=l=>{const t=(l-380)/(660-380);return"hsl("+(270-270*Math.max(0,Math.min(1,t)))+",95%,60%)";};
  g.font="11px Inter,Arial";g.textAlign="center";
  f.rows.forEach((q,i)=>{g.fillStyle=col(q.lv);g.fillRect(X(q.lv)-2,20,4,Hh/2-30);g.fillStyle="#fff";g.fillText("n="+q.n,X(q.lv),14);
    g.fillStyle="#00d4e8";g.fillRect(X(f.pred[i])-1,Hh/2+10,3,Hh/2-40);});
  g.fillStyle="#ffb347";g.textAlign="left";g.fillText("top: NIST lines (vacuum)   bottom: toy prediction, p = "+p.toFixed(3),14,Hh-10);
  K.plot($("hydrogencB"),{series:[{x:[2.5,9.5],y:[0,0],color:"#ffffff66",width:1},{x:f.rows.map(q=>q.n),y:f.ppm,type:"points",r:5,color:"#00d4e8",label:"toy − NIST (ppm)"}],xlim:[2.5,9.5],xlabel:"upper level n",ylabel:"wavelength error (ppm)"});
  reads("hydrogen",[["FITTED R",f.R.toFixed(0)+" m⁻¹"],["R_H (CODATA, μ-CORRECTED)",V.R_H.toFixed(0)],["R DIFFERENCE",((f.R/V.R_H-1)*1e6).toFixed(1)+" ppm"],["RMS LINE ERROR",f.rmsppm<1000?f.rmsppm.toFixed(1)+" ppm":(f.rmsppm/1e4).toFixed(2)+" %"]]);
  score.hydrogen=["R within "+Math.abs((f2b.R/V.R_H-1)*1e6).toFixed(0)+" ppm","lines rms "+f2b.rmsppm.toFixed(1)+" ppm"];
  if(f.rmsppm<20)verdict("hydrogen","ok","One constant predicts all seven lines to "+f.rmsppm.toFixed(1)+" parts per million, and the fitted R matches the value computed from the electron’s mass and charge to "+Math.abs((f.R/V.R_H-1)*1e6).toFixed(0)+" ppm.");
  else if(f.rmsppm<2000)verdict("hydrogen","mid","Off by "+f.rmsppm.toFixed(0)+" ppm: a spectroscope from 1885 would already notice.");
  else verdict("hydrogen","bad","With p = "+p.toFixed(3)+" the lines miss by "+(f.rmsppm/1e4).toFixed(1)+"%. Energy levels must go as 1/n².");
  cap("hydrogen","Bohr’s model is wrong about orbits (quantum mechanics replaced them) yet right about the energies — a toy can be wrong in its picture and still exact in its numbers.");
  last.hydrogen={p,R:f.R,ppm:f.ppm};board();};

/* ---------- 8. Light bending ---------- */
draw.light=function(){const gm=state.light.gamma,t=(1+gm)/2,rows=V.DATA.lightGravity.rows,c2=V.lightChi2(gm);
  K.plot($("lightcA"),{series:[{x:[1910,2012],y:[1,1],color:"#00d4e8",width:1.4,label:"Einstein (γ = 1)"},{x:[1910,2012],y:[.5,.5],color:"#ff6b8b",width:1.4,label:"Newton (γ = 0)"},{x:[1910,2012],y:[t,t],color:"#ffffff",width:2.2,label:"your γ"},{x:rows.map(r=>r[1]),y:rows.map(r=>r[2]),err:rows.map(r=>r[3]),type:"points",r:5,color:"#ffb347",label:"measurements ÷ GR"}],xlim:[1910,2012],ylim:[.2,1.4],xlabel:"year of measurement",ylabel:"deflection / 1.751″"});
  reads("light",[["DEFLECTION AT LIMB",(1.7512*t).toFixed(3)+"″"],["χ², 5 MEASUREMENTS",c2<1e4?f2(c2,1):c2.toExponential(1)],["CASSINI PULL",((1.0000105-t)/0.0000115).toExponential(1)+" σ"]]);
  score.light=["γ = 1 ± 2×10⁻⁵","Newton excluded by >40 000σ"];
  if(c2<11)verdict("light","ok","γ = "+gm.toFixed(4)+" agrees with a century of measurements; Cassini alone pins γ to 1 within 2×10⁻⁵.");
  else if(c2<100)verdict("light","mid","χ² = "+f2(c2,1)+": the 1919 plates tolerate this, modern radio data do not.");
  else verdict("light","bad","χ² = "+c2.toExponential(1)+". "+(Math.abs(gm)<.05?"Newtonian light bending is half the observed value.":"Modern VLBI and Cassini data exclude this γ."));
  cap("light","Only two numbers distinguish theories here — 0.87″ or 1.75″ — and nature picked the curved-space value. The tiny error bars at right are why γ ≠ 1 alternatives to GR are now squeezed to 10⁻⁵.");
  last.light={gamma:gm,chi2:c2};board();};

/* ---------- 9. Climate ---------- */
draw.climate=function(){const s=state.climate,all=V.climate(),c=all.find(x=>x.name===s.body),Ts=c.te*Math.pow(1+s.layers,.25);
  const xs=all.map((_,i)=>i+1);
  K.plot($("climatecA"),{series:[{x:xs,y:all.map(r=>r.T),type:"points",r:6,color:"#ffb347",label:"observed"},{x:xs.map(x=>x+.1),y:all.map(r=>r.te),type:"points",r:6,color:"#00d4e8",label:"toy, no atmosphere"},{x:[all.indexOf(c)+1.2],y:[Ts],type:"points",r:7,color:"#ff6b8b",label:"toy + "+s.layers.toFixed(2)+" layers"}],xlim:[.5,all.length+.5],ylim:[0,800],xlabel:all.map((r,i)=>(i+1)+" "+r.name).join("    "),ylabel:"temperature (K)"});
  const gap=c.T-c.te;
  reads("climate",[["T_eq (NO AIR)",c.te.toFixed(0)+" K"],["OBSERVED",c.T+" K ("+c.kind+")"],["GAP",(gap>=0?"+":"")+gap.toFixed(0)+" K"],["YOUR T_s",Ts.toFixed(0)+" K"],["LAYERS NEEDED",Math.max(0,c.layers).toFixed(2)]]);
  const me=all.find(x=>x.name==="Mars");score.climate=["Mars: "+me.te.toFixed(0)+" K vs "+me.T,"Earth +34 K greenhouse; Venus +508"];
  const e=(Ts-c.T)/c.T;
  if(Math.abs(e)<.03)verdict("climate","ok",c.name+": toy gives "+Ts.toFixed(0)+" K vs "+c.T+" K observed"+(s.layers>.05?" — with "+s.layers.toFixed(2)+" greenhouse layers.":" with no atmosphere at all."));
  else if(Math.abs(e)<.2)verdict("climate","mid",c.name+": off by "+(Ts-c.T).toFixed(0)+" K. "+(c.name==="Earth"?"Earth would be ~254 K (−19 °C) without its greenhouse effect.":c.name==="Jupiter"?"Jupiter radiates more than it absorbs: internal heat.":"Add or remove atmosphere layers."));
  else verdict("climate","bad",c.name+": off by "+(Ts-c.T).toFixed(0)+" K. "+(c.name==="Venus"?"Venus needs ~"+c.layers.toFixed(0)+" layers: a 92-bar CO₂ runaway greenhouse.":"The toy is missing physics."));
  cap("climate","The failures are the interesting part: Earth’s 34 K and Venus’s 500 K gaps are greenhouse effects; Mars’s thin air leaves almost none.");
  last.climate={state:s,table:all};board();};

/* ---------- 10. Population ---------- */
let POP=null;
draw.population=function(){if(!POP)POP=V.popModels();const d=V.DATA.population,m=state.population.model,M=POP[m],o=POP[m==="exp"?"logistic":"exp"];
  const ty=[],ya=[],yb=[];for(let y=1950;y<=2100;y+=1){ty.push(y);ya.push(M.f(y-1950));yb.push(o.f(y-1950));}
  K.plot($("populationcA"),{series:[{x:ty,y:ya,color:"#00d4e8",width:2.4,label:m==="exp"?"exponential":"logistic"},{x:ty,y:yb,color:"#ffffff55",width:1.2,label:m==="exp"?"logistic":"exponential"},{x:d.year,y:d.pop,type:"points",r:5,color:"#ffb347",label:"UN estimates"},{x:[2100],y:[10.2],type:"points",r:6,color:"#ff6b8b",label:"UN 2024 projection, 2100"}],xlim:[1950,2100],ylim:[0,Math.min(60,Math.max(...ya)*1.05)],xlabel:"year",ylabel:"billions"});
  const rms=Math.sqrt(M.loss/d.year.length)*100;
  reads("population",[["FIT ERROR (RMS)",rms.toFixed(2)+" %"],["GROWTH RATE r",(M.r*100).toFixed(2)+" %/yr"],["2100 (THIS TOY)",M.f(150).toFixed(1)+" bn"],["CARRYING CAPACITY K",m==="logistic"?POP.logistic.K.toFixed(1)+" bn":"∞"],["DOUBLING TIME",m==="exp"?(Math.LN2/M.r).toFixed(0)+" yr":"—"]]);
  score.population=["logistic K ≈ "+POP.logistic.K.toFixed(0)+" bn","fits 1950–2024 to "+(Math.sqrt(POP.logistic.loss/9)*100).toFixed(1)+"%"];
  if(m==="logistic")verdict("population","mid","Fits 1950–2024 to "+rms.toFixed(1)+"% and levels off near "+POP.logistic.K.toFixed(0)+" billion — but the past cannot fix K; the UN expects ~10 billion because of falling fertility, a mechanism this toy lacks.");
  else verdict("population","bad","The exponential fits the past to "+rms.toFixed(1)+"% yet predicts "+M.f(150).toFixed(0)+" billion by 2100. Growth rates have been falling since the 1960s, so the constant-rate assumption is already wrong.");
  cap("population","Both toys fit the data you have; they disagree wildly about the data you don’t. A good fit to the past is not a forecast.");
  last.population={model:m,exp:{P0:POP.exp.P0,r:POP.exp.r},logistic:{P0:POP.logistic.P0,r:POP.logistic.r,K:POP.logistic.K}};board();};

/* ---------- 11. Regge / strings ---------- */
draw.strings=function(){const p=state.strings.p,f=V.regge(p),f2s=V.regge(2),rows=V.DATA.regge.rows;
  const gx=[],gy=[];for(let m=.5;m<=2.6;m+=.02){gx.push(m*m);gy.push(f.a0+f.alphaP*Math.pow(m,p));}
  K.plot($("stringscA"),{series:[{x:gx,y:gy,color:"#00d4e8",width:2.2,label:"toy J = α₀ + c M^"+p.toFixed(2)},{x:rows.map(r=>Math.pow(r[2]/1000,2)),y:rows.map(r=>r[1]),type:"points",r:6,color:"#ffb347",label:"PDG mesons"}],xlim:[0,6],ylim:[0,6],xlabel:"M² (GeV²)",ylabel:"spin J"});
  const ps=[],rs=[];for(let q=.5;q<=3.5;q+=.05){ps.push(q);rs.push(V.regge(q).rms);}
  K.plot($("stringscB"),{series:[{x:ps,y:rs,color:"#ff6b8b",label:"rms spin error vs power p"},{x:[p],y:[f.rms],type:"points",r:6,color:"#ffb347",label:"you"}],xlabel:"power p",ylabel:"rms error in J"});
  reads("strings",[["SLOPE α′",p===2?f.alphaP.toFixed(3)+" GeV⁻²":"—"],["INTERCEPT α₀",f.a0.toFixed(2)],["STRING TENSION",p===2?V.stringTensionGeVfm(f.alphaP).toFixed(2)+" GeV/fm":"—"],["RMS SPIN ERROR",f.rms.toFixed(3)],["BEST p",ps[rs.indexOf(Math.min(...rs))].toFixed(2)]]);
  score.strings=["α′ = "+f2s.alphaP.toFixed(2)+" GeV⁻²","tension ≈ "+V.stringTensionGeVfm(f2s.alphaP).toFixed(2)+" GeV/fm"];
  const best=ps[rs.indexOf(Math.min(...rs))];
  if(Math.abs(p-2)<.15)verdict("strings","ok","Mesons line up on J ≈ "+f.a0.toFixed(2)+" + "+f.alphaP.toFixed(2)+" M²: a string with tension ≈ "+V.stringTensionGeVfm(f.alphaP).toFixed(2)+" GeV/fm (lattice QCD: ~0.9). Honest caveat: five points mildly prefer p ≈ "+best.toFixed(1)+"; the string picture is supported, not proven, by this data alone.");
  else verdict("strings",f.rms<.15?"mid":"bad","Power "+p.toFixed(2)+": rms spin error "+f.rms.toFixed(3)+". The relativistic string predicts exactly p = 2.");
  cap("strings","What this does and does not show: the strong force between quarks behaves like a string ~1 GeV/fm stiff. String theory as a theory of quantum gravity lives 10¹⁹ times higher in energy and has no confirmed test yet.");
  last.strings={p,alphaP:f.alphaP,a0:f.a0,rms:f.rms};board();};

/* ---------- 12. Lorentz violation ---------- */
draw.liv=function(){const n=Number(state.liv.n),Eqg=V.E_PLANCK*Math.pow(10,state.liv.lgE),g=V.DATA.grb,dt=V.livDelay(g.E,g.z,Eqg,n),bound=V.livBound(n);
  const xs=[],ys=[];for(let e=.1;e<=100;e*=1.08){xs.push(Math.log10(e));ys.push(V.livDelay(e,g.z,Eqg,n));}
  K.plot($("livcA"),{series:[{x:xs,y:ys,color:"#00d4e8",width:2.4,label:"toy delay vs photon energy"},{x:[Math.log10(g.E)],y:[g.dtMax],type:"points",r:7,color:"#ffb347",label:"31 GeV photon: ≤ 0.859 s"}],logy:true,ylim:[1e-12,1e4],xlabel:"log₁₀ photon energy (GeV)",ylabel:"arrival delay (s)"});
  reads("liv",[["TOY DELAY @ 31 GeV",dt<1e-3?dt.toExponential(2)+" s":dt.toFixed(3)+" s"],["OBSERVED LIMIT","≤ 0.859 s"],["THIS LAB’S BOUND",(bound/V.E_PLANCK).toExponential(2)+" E_Pl"],["PUBLISHED",g.published]]);
  score.liv=["E_QG,1 > "+(V.livBound(1)/V.E_PLANCK).toFixed(2)+" E_Pl","linear Planck-scale effect excluded"];
  if(dt<=g.dtMax)verdict("liv",dt<g.dtMax/10?"ok":"mid","Survives: predicted lag "+(dt<1e-3?dt.toExponential(1):dt.toFixed(2))+" s ≤ 0.859 s. "+(n===2?"Quadratic effects are invisible even at "+(Eqg/1e9).toExponential(0)+" GeV.":"The quantum-gravity scale must be at least "+(bound/V.E_PLANCK).toFixed(2)+" × Planck."));
  else verdict("liv","bad","Ruled out: the 31 GeV photon would have arrived "+dt.toFixed(1)+" s late, but it came within 0.859 s. A linear effect at or below the Planck energy is excluded by one photon.");
  cap("liv","A single photon that travelled 7 billion years constrains physics at 10¹⁹ GeV. Caveat: if the source emitted high-energy photons first, a delay could be hidden; the bound assumes it did not.");
  last.liv={n,EqgOverPlanck:Eqg/V.E_PLANCK,delay:dt,bound:bound/V.E_PLANCK};board();};

/* ---------- 13. Black-hole area theorem ---------- */
draw.horizon=function(){const t=V.areaTest(state.horizon.chi),xs=t.map((_,i)=>i+1);
  K.plot($("horizoncA"),{series:[{x:[.5,t.length+.5],y:[1,1],color:"#ff6b8b",width:1.4,label:"area unchanged (theorem boundary)"},{x:xs,y:t.map(r=>r.ratio),type:"points",r:7,color:"#00d4e8",label:"final / initial horizon area"}],xlim:[.5,t.length+.5],ylim:[.8,1.8],xlabel:t.map((r,i)=>(i+1)+" "+r.name).join("    "),ylabel:"A_final / A_initial"});
  const a=t[0];
  reads("horizon",[["GW150914 AREA RATIO",a.ratio.toFixed(3)],["ENERGY RADIATED",a.Erad.toFixed(1)+" M☉c²"],["FINAL ENTROPY S/k_B",a.Sf.toExponential(2)],["HAWKING T",(a.TH*1e9).toFixed(2)+" nK"],["MIN RATIO, ALL",Math.min(...t.map(r=>r.ratio)).toFixed(3)]]);
  score.horizon=["area grows ×"+V.areaTest(0)[0].ratio.toFixed(2),"4/4 mergers obey Hawking"];
  const mn=Math.min(...t.map(r=>r.ratio));
  verdict("horizon",mn>1?"ok":"bad",mn>1?"In all four mergers the final horizon is larger than the two initial ones combined (min ratio "+mn.toFixed(3)+"), even though "+a.Erad.toFixed(1)+" solar masses were radiated in GW150914 alone. The second law of black-hole mechanics survives.":"With these assumed spins the area would shrink — a violation. Real spins are measured to be small.");
  cap("horizon","Raise the assumed initial spin: spinning holes have smaller horizons, so the test gets easier, not harder. The real test uses measured spins and their uncertainties.");
  last.horizon={chiInit:state.horizon.chi,mergers:t};board();};

/* ---------- 14. Extra dimensions ---------- */
draw.extra=function(){const s=state.extra,m=V.addModel(s.n,s.M),lim=V.DATA.eotwash.lambdaMax;
  const rs=[],ys=[];for(let lr=-7;lr<=-2;lr+=.02){const r=Math.pow(10,lr);rs.push(lr+6);ys.push(m.ratioAt(r));}
  K.plot($("extracA"),{series:[{x:rs,y:ys,color:"#00d4e8",width:2.4,label:"toy: gravity / Newton (Yukawa approx.)"},{x:[-1,4],y:[1,1],color:"#ffffff55",width:1}],logy:true,ylim:[.8,100],xlim:[-1,4],vlines:[{x:Math.log10(lim*1e6),label:"Eöt-Wash: tested to 38.6 µm",color:"#ffb347"}],xlabel:"log₁₀ separation (µm)",ylabel:"force ratio"});
  const fmtR=R=>R>1e3?(R/1e3).toExponential(1)+" km":R>1?R.toFixed(1)+" m":R>1e-3?(R*1e3).toFixed(2)+" mm":R>1e-6?(R*1e6).toFixed(1)+" µm":R>1e-9?(R*1e9).toFixed(2)+" nm":R.toExponential(1)+" m";
  reads("extra",[["SIZE OF EXTRA DIMS R",fmtR(m.R)],["TESTED DOWN TO","38.6 µm"],["FORCE CHANGE BELOW R","1/r^"+(2+s.n)],["M* NEEDED FOR R = 38.6 µm",s.n===2?(s.M*Math.pow(m.R/lim,.5)).toFixed(1)+" TeV":"—"]]);
  score.extra=["n = 2 needs M* ≳ "+(1*Math.pow(V.addModel(2,1).R/lim,.5)).toFixed(1)+" TeV","n = 1 excluded (planet-size R)"];
  if(m.R>1e6)verdict("extra","bad","n = 1 needs a dimension "+fmtR(m.R)+" wide: gravity would change at planetary distances. Kepler’s law (module 03) already kills it.");
  else if(m.R>lim)verdict("extra","bad","R = "+fmtR(m.R)+" — larger than 38.6 µm. A torsion balance would already see gravity strengthen. Raise M* or add dimensions.");
  else verdict("extra",m.R>1e-9?"mid":"ok","Survives the inverse-square test: R = "+fmtR(m.R)+" is below what tabletop gravity can probe. "+(s.n<=3?"But LHC and astrophysical limits push M* higher still for n ≤ 3.":"Large extra dimensions this small are hard to test at all.")+" Surviving is not evidence they exist.");
  cap("extra","Gravity is the only force never measured below ~0.05 mm. That gap is where many string-inspired ideas still hide.");
  last.extra={n:s.n,MstarTeV:s.M,R:m.R,allowed:m.allowed};board();};

function exportJSON(id){draw[id]();K.download("cosmos-toy-reality-"+id+".json",JSON.stringify({module:id,generated:new Date().toISOString(),note:"Toy-model output compared with published or live measurements. See the page for the limits of each comparison.",data_source:{cmb:V.DATA.firas.source,mercury:V.DATA.perihelion.source,kepler:V.DATA.planets.source+"; "+V.DATA.galilean.source,lv:V.DATA.hareLynx.source,quakes:"USGS FDSN event web service (live)",hubble:window.PANTHEON_PLUS?window.PANTHEON_PLUS.meta.citation:"Pantheon+",hydrogen:V.DATA.balmer.source,light:V.DATA.lightGravity.source,climate:V.DATA.climate.source,population:V.DATA.population.source,strings:V.DATA.regge.source,liv:V.DATA.grb.source,horizon:V.DATA.mergers.source,extra:V.DATA.eotwash.source}[id],result:last[id]},null,2),"application/json");}

/* ---------- start ---------- */
board();perTable();draw.kepler();["hydrogen","light","climate","population","strings","liv","horizon","extra"].forEach(k=>draw[k]());board();setTab(state.tab);setTimeout(()=>{draw.hubble();},120);
if(!(sh&&sh.lv))setTimeout(()=>{fitLV();},60);loadQuakes();runOFC();
})();
