/* COSMOS LAB Genesis Lab UI. Numerical model exploration only: see the status table on the page. */
(function(){"use strict";
const G=window.CosmosGenesisCore,K=window.CosmosKit;
if(!G||!K){document.body.textContent="Genesis numerical engine unavailable.";return;}
const $=id=>document.getElementById(id),sci=(x,d=2)=>Number.isFinite(x)?x.toExponential(d).replace("e+","e"):"—";
const PLANCK={ns:0.9649,sig:0.0042,rMax:0.036};
const state={tab:"expansion",expansion:{H0:67.4,Om:0.315,OL:0.685},inflation:{pot:"power2",Ntot:62,Nstar:60},
  eternal:{lm:-2,kappa:0.9,n:300,Nmax:2000,seed:7},nothing:{lr:16},bubble:{ls:0,le:-0.1}};
let eternalResult=null,runToken=0;
const sharedIn=K.Share.read();
if(sharedIn){for(const k of Object.keys(state)){if(k==="tab"){if(typeof sharedIn.tab==="string"&&sharedIn.tab in state)state.tab=sharedIn.tab;continue;}
  if(sharedIn[k]&&typeof sharedIn[k]==="object")for(const f of Object.keys(state[k])){const v=sharedIn[k][f];if(typeof v==="number"&&Number.isFinite(v)||typeof v==="string"&&f==="pot")state[k][f]=v;}}}

/* ---------- declarative modules ---------- */
const MODS=[
 {id:"expansion",tab:"01 / EXPANSION",sub:"Big Bang → today",title:"HOT BIG BANG<br/>TO DARK ENERGY",tags:[["est","ESTABLISHED"]],
  desc:"Solve the Friedmann equation from a = 10⁻⁹ to the far future. Watch radiation (a ∝ t½), matter (a ∝ t⅔) and dark energy (exponential growth) take turns.",
  eq:"H² = H₀² (Ωr a⁻⁴ + Ωm a⁻³ + Ωk a⁻² + ΩΛ)\nt(a) = ∫ da / (a H(a)) ,  T = 2.7255 K / a",
  fields:[{k:"H0",label:"HUBBLE CONSTANT H₀ (km/s/Mpc)",min:50,max:90,step:.1,fmt:v=>v.toFixed(1)},{k:"Om",label:"MATTER DENSITY Ωm",min:.05,max:1,step:.005,fmt:v=>v.toFixed(3)},{k:"OL",label:"DARK ENERGY ΩΛ",min:0,max:1.2,step:.005,fmt:v=>v.toFixed(3)}],
  note:"Ωr is fixed at 9.2×10⁻⁵ (photons + neutrinos). “t = 0” is where this classical model breaks down; it is not a measured beginning.",
  canvases:[["cA",900,420],["cB",900,360]]},
 {id:"inflation",tab:"02 / INFLATION",sub:"Slow roll vs CMB",title:"THE FIRST<br/>10⁻³² SECONDS",tags:[["est","SUPPORTED"],["hyp","MODEL-DEPENDENT"]],
  desc:"A scalar field rolling down a potential drives accelerated expansion. The full equation is integrated in e-fold time, then the CMB observables n_s and r are read off and compared with data.",
  eq:"φ'' + (3−ε)φ' + (3−ε) V'/V = 0 ,  ε = φ'²/2  (M = 1)\nn_s = 1 − 6ε + 2η ,  r = 16ε   at N* e-folds before the end",
  fields:[{k:"pot",label:"POTENTIAL",options:[["power1","V ∝ φ"],["power2","V ∝ φ²  (chaotic)"],["power4","V ∝ φ⁴"],["staro","Starobinsky plateau"]]},{k:"Ntot",label:"TOTAL e-FOLDS OF INFLATION",min:55,max:90,step:1,fmt:v=>v.toFixed(0)},{k:"Nstar",label:"OBSERVABLE e-FOLDS BEFORE THE END N*",min:40,max:65,step:1,fmt:v=>v.toFixed(0)}],
  note:"Overall potential scale only sets the amplitude of fluctuations, so it does not enter n_s or r. Bounds: Planck 2018 n_s = 0.9649 ± 0.0042; BICEP/Keck 2021 r < 0.036 (95%).",
  canvases:[["cA",600,380],["cB",600,380],["cC",900,420]],two:2},
 {id:"eternal",tab:"03 / MULTIVERSE",sub:"Eternal inflation",title:"WHEN QUANTUM<br/>BEATS THE ROLL",tags:[["hyp","HYPOTHESIS"]],
  desc:"Add quantum fluctuations of size H/2π per e-fold to the classical roll. Above a threshold field value the kicks win, and some regions inflate forever while others exit as “pocket universes”.",
  eq:"dφ = −(V'/V) dN + (H/2π) √dN ξ ,  H² = V/3 ,  V = ½ m² φ²\neternal when (H/2π) > V'/V   (Q = 1)",
  fields:[{k:"lm",label:"INFLATON MASS log₁₀ m (Planck units)",min:-4,max:-1.5,step:.05,fmt:v=>"10^"+v.toFixed(2)},{k:"kappa",label:"START φ₀ / φ_eternal",min:.3,max:1.4,step:.05,fmt:v=>v.toFixed(2)},{k:"n",label:"NUMBER OF HUBBLE PATCHES",min:50,max:1200,step:50,fmt:v=>v.toFixed(0)},{k:"Nmax",label:"e-FOLD CAP PER PATCH",min:500,max:4000,step:250,fmt:v=>v.toFixed(0)},{k:"seed",label:"RANDOM SEED",min:1,max:99,step:1,fmt:v=>v.toFixed(0)}],
  run:true,
  note:"Volume weighting e^{3N} makes the average dominated by a few patches with extreme N: the measure problem. No observation confirms regions beyond our horizon. The observed CMB scale corresponds to φ ≈ 15, far below the eternal regime for realistic m.",
  canvases:[["cA",600,380],["cB",600,380],["cC",900,360]],two:2},
 {id:"nothing",tab:"04 / FROM NOTHING",sub:"dS entropy, e^±S",title:"A UNIVERSE<br/>FROM NOTHING?",tags:[["spec","SPECULATIVE"]],
  desc:"Semiclassical quantum cosmology weights de Sitter universes by the exponential of their entropy. The Hartle–Hawking no-boundary state goes as e^{+S}, Vilenkin tunnelling as e^{−S}: opposite predictions from the same equation.",
  eq:"S = 8π²M²/H² = 24π² M⁴ / V\nP_HH ∝ e^{+S} ,  P_Vilenkin ∝ e^{−S}",
  fields:[{k:"lr",label:"VACUUM ENERGY SCALE log₁₀ V^{1/4} (GeV)",min:-12,max:18.3,step:.05,fmt:v=>"10^"+v.toFixed(2)}],
  note:"“Nothing” in these proposals is not absence of laws: the wave function of the universe still lives in a framework of quantum gravity. The two proposals disagree, and this lab cannot decide between them. Near the Planck scale (S ≲ 100) the semiclassical formula is not trustworthy.",
  canvases:[["cA",900,420]]},
 {id:"bubble",tab:"05 / VACUUM BUBBLES",sub:"Thin-wall decay",title:"HOW A FALSE<br/>VACUUM DECAYS",tags:[["hyp","HYPOTHESIS"]],
  desc:"A region of false vacuum can nucleate a bubble of lower-energy true vacuum. In the thin-wall limit the bounce action B sets the suppression e^{−B} of the nucleation rate.",
  eq:"B = 27π² σ⁴ / (2 ε³) ,  R_c = 3σ / ε\nrate per volume ∝ e^{−B}",
  fields:[{k:"ls",label:"WALL TENSION log₁₀ σ (arbitrary units)",min:-1,max:1,step:.02,fmt:v=>"10^"+v.toFixed(2)},{k:"le",label:"ENERGY GAP log₁₀ ε (arbitrary units)",min:-1.5,max:1.2,step:.02,fmt:v=>"10^"+v.toFixed(2)}],
  note:"Flat-space thin-wall formula only: gravity (Coleman–De Luccia), thick walls and the real vacuum structure change B. B ≳ 100 means the false vacuum is effectively stable on any cosmological time.",
  canvases:[["cA",900,420]]}
];

/* ---------- build UI ---------- */
const tabsEl=$("tabs"),modsEl=$("modules");
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
MODS.forEach(m=>{
  const tb=el("button",null,m.tab+"<small>"+m.sub+"</small>");tb.type="button";tb.role="tab";tb.dataset.id=m.id;tb.onclick=()=>setTab(m.id);tabsEl.appendChild(tb);
  const box=el("section","module");box.id="mod-"+m.id;
  const c=el("div","controls");c.append(el("div","kicker","MODULE "+m.tab.slice(0,2)),el("h2",null,m.title),el("div",null,m.tags.map(t=>'<span class="tag '+t[0]+'">'+t[1]+"</span>").join("")),el("p",null,m.desc),el("div","eq",m.eq));
  m.fields.forEach(f=>{const w=el("div","field");
    if(f.options){w.innerHTML='<div class="ft"><label for="f-'+m.id+f.k+'">'+f.label+"</label></div>";const s=document.createElement("select");s.id="f-"+m.id+f.k;f.options.forEach(o=>{const op=document.createElement("option");op.value=o[0];op.textContent=o[1];s.appendChild(op);});s.value=state[m.id][f.k];s.onchange=()=>{state[m.id][f.k]=s.value;refresh(m.id);};w.appendChild(s);}
    else{w.innerHTML='<div class="ft"><label for="f-'+m.id+f.k+'">'+f.label+'</label><output id="o-'+m.id+f.k+'"></output></div>';const r=document.createElement("input");r.type="range";r.id="f-"+m.id+f.k;r.min=f.min;r.max=f.max;r.step=f.step;r.value=state[m.id][f.k];
      const out=w.querySelector("output"),upd=()=>{state[m.id][f.k]=Number(r.value);out.textContent=f.fmt(Number(r.value));};upd();r.oninput=()=>{upd();refresh(m.id,true);};w.appendChild(r);}
    c.appendChild(w);});
  const b=el("div","btns");
  if(m.run){const rb=el("button","btn primary","▶ RUN ENSEMBLE");rb.type="button";rb.onclick=()=>runEternal();b.appendChild(rb);}
  const sb=el("button","btn","↗ COPY LINK");sb.type="button";sb.onclick=()=>K.Share.copy({...state,tab:m.id},sb);
  const eb=el("button","btn","↓ EXPORT JSON");eb.type="button";eb.onclick=()=>exportJSON(m.id);b.append(sb,eb);c.append(b,el("div","status",""),el("div","note",m.note));
  c.querySelector(".status").id="st-"+m.id;
  const st=el("div","stage");const reads=el("div","reads");reads.id="rd-"+m.id;st.appendChild(reads);
  if(m.two){const row=el("div","two");m.canvases.slice(0,m.two).forEach(cv=>{const k=el("canvas");k.id=m.id+cv[0];k.width=cv[1];k.height=cv[2];row.appendChild(k);});st.appendChild(row);m.canvases.slice(m.two).forEach(cv=>{const k=el("canvas");k.id=m.id+cv[0];k.width=cv[1];k.height=cv[2];st.appendChild(k);});}
  else m.canvases.forEach(cv=>{const k=el("canvas");k.id=m.id+cv[0];k.width=cv[1];k.height=cv[2];st.appendChild(k);});
  st.appendChild(el("p","cap","",)).id="cap-"+m.id;
  box.append(c,st);modsEl.appendChild(box);
});
function setTab(id){state.tab=id;document.querySelectorAll("#tabs button").forEach(b=>b.classList.toggle("active",b.dataset.id===id));document.querySelectorAll(".module").forEach(s=>s.classList.toggle("active",s.id==="mod-"+id));refresh(id);}
function reads(id,items){$("rd-"+id).innerHTML=items.map(i=>"<div><small>"+i[0]+"</small><strong>"+i[1]+"</strong></div>").join("");}
function status(id,t){$("st-"+id).textContent=t;}
const cv=(id,c)=>$(id+c);
let lastExport={};

/* ---------- renderers ---------- */
function drawExpansion(){
  const s=state.expansion,p=G.params(s),age=G.ageGyr(p);
  if(!Number.isFinite(age)||p.Om<=0){status("expansion","These parameters have no hot Big Bang followed by expansion to a=1 (negative energy density term). Try Ωm + ΩΛ ≈ 1.");return;}
  const t=G.expansionTable(p),X=t.map(r=>Math.log10(r.tGyr)),ep=G.epochs(p),at=a=>{let b=0;for(let i=1;i<t.length;i++)if(Math.abs(t[i].a-a)<Math.abs(t[b].a-a))b=i;return Math.log10(t[b].tGyr);};
  const vl=[{x:at(ep.aEq),label:"matter = radiation",color:"#ffb347"}];if(Number.isFinite(ep.aAcc))vl.push({x:at(ep.aAcc),label:"acceleration starts",color:"#7bd88f"});
  K.plot(cv("expansion","cA"),{series:[{x:X,y:t.map(r=>r.a),label:"scale factor a(t)",color:"#00d4e8"},{x:[Math.log10(age)],y:[1],type:"points",r:6,color:"#fff",label:"today"}],logy:true,xlabel:"log10 t  (t in Gyr)",ylabel:"scale factor a",vlines:vl});
  K.plot(cv("expansion","cB"),{series:[{x:X,y:t.map(r=>r.T),label:"CMB temperature T = 2.7255 K / a",color:"#ff6b8b"}],logy:true,xlabel:"log10 t  (t in Gyr)",ylabel:"temperature (K)",vlines:vl});
  reads("expansion",[["AGE OF UNIVERSE",age.toFixed(2)+" Gyr"],["MATTER–RADIATION z",ep.zEq.toFixed(0)],["ACCELERATION STARTS z",Number.isFinite(ep.zAcc)?ep.zAcc.toFixed(2):"never"],["CURVATURE Ωk",p.Ok.toFixed(3)]]);
  $("cap-expansion").textContent="Slopes on the log–log curve: ½ in the radiation era, ⅔ in the matter era, then a runaway as ΩΛ dominates. Temperature falls as 1/a.";
  status("expansion","Closed-form flat ΛCDM check: matches the numerical integral to <0.2% when Ωr→0 (see tests).");
  $("hAge").textContent=age.toFixed(1);lastExport.expansion={params:p,ageGyr:age,epochs:ep,table:t.filter((_,i)=>i%6===0)};
}
function solveNtot(pot,Ntot){ // choose phi0 so that inflation lasts ~Ntot e-folds
  let lo=pot.phiEnd*1.01,hi=pot.phiEnd*1.01+60;for(let i=0;i<45;i++){const mid=(lo+hi)/2,r=G.inflationRun(pot,mid,{h:.02,Nmax:200});(r.Nend==null?1e9:r.Nend)>Ntot?hi=mid:lo=mid;}return(lo+hi)/2;}
function drawInflation(){
  const s=state.inflation,pot=s.pot==="staro"?G.POTENTIALS.starobinsky():G.POTENTIALS.power(Number(s.pot.slice(5)));
  const phi0=solveNtot(pot,s.Ntot),run=G.inflationRun(pot,phi0,{h:.01}),Nstar=Math.min(s.Nstar,run.Nend||0),pr=G.predict(pot,run,Nstar);
  if(!pr){status("inflation","Slow roll did not end within the integration window.");return;}
  K.plot(cv("inflation","cA"),{series:[{x:run.N,y:run.phi,label:"inflaton φ (Planck units)",color:"#00d4e8"}],xlabel:"e-folds N since start",ylabel:"φ / M",vlines:[{x:run.Nend-Nstar,label:"N* (CMB scales)",color:"#ffb347"}]});
  K.plot(cv("inflation","cB"),{series:[{x:run.N,y:run.eps,label:"ε (full equation)",color:"#fff"},{x:run.N,y:run.epsSR,label:"ε slow-roll",color:"#00d4e8"},{x:[0,run.Nend],y:[1,1],label:"ε = 1: inflation ends",color:"#ff6b8b"}],logy:true,xlabel:"e-folds N since start",ylabel:"slow-roll ε"});
  const pts=[];for(let n=40;n<=Math.min(65,run.Nend);n++){const q=G.predict(pot,run,n);if(q)pts.push([q.ns,q.r]);}
  K.plot(cv("inflation","cC"),{series:[{x:pts.map(p=>p[0]),y:pts.map(p=>p[1]),type:"points",r:3,label:"model, N* = 40…65",color:"#00d4e8"},{x:[pr.ns],y:[pr.r],type:"points",r:7,label:"selected N*",color:"#fff"},{x:[0.93,1],y:[PLANCK.rMax,PLANCK.rMax],label:"r < 0.036 (BICEP/Keck)",color:"#ff6b8b"}],xlim:[0.93,1],logy:true,xlabel:"scalar tilt n_s",ylabel:"tensor-to-scalar ratio r",
    vlines:[{x:PLANCK.ns-PLANCK.sig,color:"#7bd88f"},{x:PLANCK.ns+PLANCK.sig,color:"#7bd88f",label:"Planck n_s ±1σ"}]});
  const sig=(pr.ns-PLANCK.ns)/PLANCK.sig,okR=pr.r<PLANCK.rMax,verdict=(Math.abs(sig)<2?"n_s within 2σ of Planck":"n_s outside 2σ of Planck ("+sig.toFixed(1)+"σ)")+"; "+(okR?"r below the current bound.":"r ABOVE the current bound.");
  reads("inflation",[["TOTAL e-FOLDS",run.Nend.toFixed(1)],["φ AT N*",pr.phiStar.toFixed(2)],["SCALAR TILT n_s",pr.ns.toFixed(4)],["TENSOR RATIO r",pr.r.toFixed(4)]]);
  status("inflation",verdict);$("cap-inflation").textContent=pot.name+". Dashed band: Planck 2018 n_s ±1σ. The pink line is the BICEP/Keck 95% upper limit on r.";
  lastExport.inflation={potential:pot.name,phi0,Nend:run.Nend,Nstar,prediction:pr,verdict};
}
function drawEternalStatic(){
  const s=state.eternal,m=Math.pow(10,s.lm),Vs=.5*m*m,phiE=G.eternalThreshold(Vs,2),phi0=s.kappa*phiE;
  const lo=Math.log10(1.5),hi=Math.log10(phiE*20),X=[],Y=[];for(let i=0;i<=240;i++){const l=lo+(hi-lo)*i/240;X.push(l);Y.push(G.quantumToClassical(Vs,2,Math.pow(10,l)));}
  K.plot(cv("eternal","cA"),{series:[{x:X,y:Y,label:"Q = (H/2π)/(V'/V)",color:"#00d4e8"},{x:[lo,hi],y:[1,1],label:"Q = 1",color:"#ff6b8b"}],logy:true,xlabel:"log10 φ / M",ylabel:"quantum / classical step per e-fold",vlines:[{x:Math.log10(phiE),label:"φ_eternal",color:"#ffb347"},{x:Math.log10(phi0),label:"start φ₀",color:"#fff"}]});
  const Nc=(phi0*phi0-2)/4,Vstart=Vs*phi0*phi0,ratio=G.quantumToClassical(Vs,2,phi0);
  if(!eternalResult)reads("eternal",[["φ_eternal",phiE.toFixed(1)],["V^{1/4} AT φ_eternal",(Math.pow(Vs*phiE*phiE,.25)).toFixed(3)+" M"],["CLASSICAL e-FOLDS FROM φ₀",Nc.toFixed(0)],["Q AT START",ratio.toFixed(2)]]);
  $("cap-eternal").textContent="Left: the ratio Q crosses 1 at φ_eternal. Right: after you press RUN, the distribution of e-folds before each patch exits, then how fast the e^{3N} volume weight collapses with rank: a handful of rare patches carry almost all the volume.";
  return{phiE,phi0,Vs,Nc};
}
async function runEternal(){
  const s=state.eternal,info=drawEternalStatic(),token=++runToken,rand0=s.seed,chunk=50,N=[];let capped=0;
  status("eternal","Running…");
  for(let done=0;done<s.n;done+=chunk){
    if(token!==runToken)return;
    const n=Math.min(chunk,s.n-done),rand=K.rng(rand0*7919+done),r=G.ensemble({Vs:info.Vs,p:2,phi0:info.phi0,n,Nmax:s.Nmax,dN:.25},rand,u=>K.gaussian(u));
    for(const v of r.Nexit)N.push(v);capped+=r.capped;status("eternal","Running… "+Math.min(done+chunk,s.n)+" / "+s.n+" patches");
    await new Promise(r=>setTimeout(r,0));
  }
  eternalResult={N,capped,info};drawEternalResult();
}
function drawEternalResult(){
  if(!eternalResult)return;const{N,capped,info}=eternalResult,fin=N.filter(Number.isFinite),vs=G.volumeStats(N);
  const mx=fin.length?Math.max(...fin):1,mn=fin.length?Math.min(...fin):0,span=Math.max(mx-mn,1),h=K.histogram(fin,Math.max(0,mn-span*.05),mx+span*.05,30,true);
  K.plot(cv("eternal","cB"),{series:[{x:h.x,y:h.y,type:"bars",barWidth:h.width,label:"patches that exited",color:"#00d4e8"}],xlabel:"e-folds before exit",ylabel:"probability density",vlines:[{x:info.Nc,label:"classical (no noise)",color:"#ffb347"}]});
  const sorted=fin.slice().sort((a,b)=>b-a),rel=sorted.map(v=>(v-sorted[0])*3*Math.LOG10E);
  K.plot(cv("eternal","cC"),{series:[{x:rel.map((_,i)=>i+1),y:rel,label:"log10 of e^{3N} volume weight relative to the largest patch",color:"#ff6b8b"}],xlabel:"patches ranked by e-folds (largest first)",ylabel:"log10 relative volume"});
  reads("eternal",[["NEVER EXITED (CAP)",(100*capped/N.length).toFixed(1)+" %"],["MEAN e-FOLDS (BY COUNT)",Number.isFinite(vs.meanN)?vs.meanN.toFixed(0):"—"],["MEAN e-FOLDS (BY VOLUME)",Number.isFinite(vs.volMeanN)?vs.volMeanN.toFixed(0):"—"],["VOLUME IN LARGEST PATCH",Number.isFinite(vs.share1)?(100*vs.share1).toFixed(0)+" %":"—"]]);
  status("eternal",capped>0?"Some patches never exited within the cap: that is the eternal-inflation regime.":"All patches exited; the average is still volume-weighted differently from the count-weighted one.");
  lastExport.eternal={params:state.eternal,phiEternal:info.phiE,phi0:info.phi0,patches:N.length,capped,volumeStats:vs,nExit:fin.slice(0,500)};
}
function drawNothing(){
  const s=state.nothing,rho=Math.pow(10,s.lr),S=G.dsEntropyFromScale(rho),w=G.wavefunctionWeights(S),St=G.dsEntropyToday(.674,.685);
  const X=[],Y=[];for(let l=-12;l<=18.3;l+=.1){X.push(l);Y.push(G.dsEntropyFromScale(Math.pow(10,l)));}
  K.plot(cv("nothing","cA"),{series:[{x:X,y:Y,label:"de Sitter entropy S(V)",color:"#00d4e8"},{x:[s.lr],y:[S],type:"points",r:7,color:"#fff",label:"your scale"}],logy:true,xlabel:"log10 V^{1/4}  (GeV)",ylabel:"S = 24π² M⁴/V",vlines:[{x:-11.64,label:"dark energy today",color:"#7bd88f"},{x:2.39,label:"electroweak",color:"#ffb347"},{x:16,label:"inflation scale ≲",color:"#ff6b8b"}]});
  reads("nothing",[["ENTROPY S",sci(S)],["log₁₀ P(Hartle–Hawking)",S>1e300?"> 10^300":("+"+sci(w.log10HH))],["log₁₀ P(Vilenkin)",S>1e300?"< −10^300":sci(w.log10Vilenkin)],["REGIME",S<100?"Planckian: unreliable":"semiclassical"]]);
  $("cap-nothing").textContent="S for today's dark-energy scale ≈ "+sci(St,1)+" (Gibbons–Hawking, h = 0.674, ΩΛ = 0.685). No-boundary weights favour low energy (huge S); tunnelling favours high energy. The disagreement is the point.";
  status("nothing","Weights are unnormalised exponents of a semiclassical approximation; they are not probabilities you can observe.");
  $("hS").textContent=sci(St,1);lastExport.nothing={logScaleGeV:s.lr,S,weights:w,SdeSitterToday:St};
}
function drawBubble(){
  const s=state.bubble,sg=Math.pow(10,s.ls),ep=Math.pow(10,s.le),b=G.bubble(sg,ep),X=[],Y=[];
  for(let l=-1.5;l<=1.2;l+=.02){X.push(l);Y.push(G.bubble(sg,Math.pow(10,l)).B);}
  K.plot(cv("bubble","cA"),{series:[{x:X,y:Y,label:"bounce action B(ε) at your σ",color:"#00d4e8"},{x:[s.le],y:[b.B],type:"points",r:7,color:"#fff",label:"your ε"},{x:[-1.5,1.2],y:[100,100],label:"B = 100: effectively stable",color:"#ff6b8b"}],logy:true,xlabel:"log10 ε  (energy gap)",ylabel:"bounce action B"});
  reads("bubble",[["BOUNCE ACTION B",sci(b.B,2)],["CRITICAL RADIUS R_c",b.Rc.toFixed(2)],["log₁₀ e^{−B}",sci(b.log10Suppression,2)],["FALSE VACUUM",b.B>100?"effectively stable":b.B>5?"long-lived":"decays quickly"]]);
  $("cap-bubble").textContent="Smaller energy gap ε or larger wall tension σ makes the decay exponentially slower: B ∝ σ⁴/ε³.";
  status("bubble","Thin-wall approximation valid when R_c is much larger than the wall thickness.");
  lastExport.bubble={sigma:sg,epsilon:ep,...b};
}
const draw={expansion:drawExpansion,inflation:drawInflation,eternal:()=>{drawEternalStatic();if(eternalResult)drawEternalResult();},nothing:drawNothing,bubble:drawBubble};
let pending=null;
function refresh(id,debounce){if(!debounce){draw[id]();return;}if(pending)cancelAnimationFrame(pending);pending=requestAnimationFrame(()=>{draw[id]();});}
function exportJSON(id){if(!draw[id])return;draw[id]();K.download("cosmos-genesis-"+id+".json",JSON.stringify({module:id,generated:new Date().toISOString(),note:"Numerical model output, not observational evidence.",state:state[id],result:lastExport[id]},null,2),"application/json");}
/* header numbers need the expansion + nothing modules even if not the active tab */
drawExpansion();drawNothing();
setTab(state.tab);
})();
