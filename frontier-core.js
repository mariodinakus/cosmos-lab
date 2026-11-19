/* COSMOS LAB | FRONTIER QUESTIONS — numerical toy models and epistemic guardrails.
   Every model presupposes a mathematical framework and its laws.
   These algorithms do NOT derive an ultimate origin, prove a creator or solve a Theory of Everything. */
(function(root,factory){const value=factory();if(typeof module==="object"&&module.exports)module.exports=value;root.CosmosFrontier=value;})(typeof window!=="undefined"?window:globalThis,function(){"use strict";
const PI=Math.PI,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const MODES=[
 {id:"vacuum",tag:"NOTHING / VACUUM",title:"IS THE VACUUM NOTHING?",question:"Why is there something rather than nothing?",formula:"E₀ = ℏω/2; Δx² = ℏ/(2mω); Δp² = ℏmω/2",level:"Established QM model · conceptual boundary",params:[["mass","Oscillator mass",.3,3,1,.05],["omega","Oscillator frequency",.3,3,1,.05],["hbar","Normalized ℏ",.3,2,1,.05]],what:"Ground-state zero-point energy and Gaussian Wigner sampling exist in an already-defined quantum system.",limit:"A quantum vacuum assumes degrees of freedom, a Hamiltonian and laws. It is NOT absolute philosophical nothing. Random samples depict measurement statistics, not particles emerging from nothing."},
 {id:"tunnel",tag:"ORIGIN / ANALOGY",title:"CAN SOMETHING TUNNEL INTO EXISTENCE?",question:"Can a quantum transition model the origin of a Universe?",formula:"T = [1 + V₀² sinh²(κa)/(4E(V₀−E))]⁻¹  for E<V₀",level:"Established barrier formula · cosmological analogy only",params:[["energy","Incident energy E",.2,5,1.2,.05],["height","Barrier V₀",.3,6,2.5,.05],["width","Barrier width a",.2,3,1.1,.05],["mass","Particle mass m",.2,3,1,.05]],what:"Stationary Schrödinger scattering through a rectangular barrier. This is an exact mathematical expression within its idealized assumptions.",limit:"The incoming wave, energy, time, Hamiltonian and space ALREADY exist. Tunnelling does not demonstrate a Universe forming from absolute nothing."},
 {id:"inflation",tag:"COSMOLOGY",title:"HOW CAN SPACE EXPAND?",question:"Could inflation help explain features of the early Universe?",formula:"H² ≈ V(φ)/3; φ̇ ≈ −V′(φ)/(3H); N = ∫ H dt",level:"Slow-roll-inspired toy · not measured inflation history",params:[["field","Initial field φ",.5,4,2.5,.1],["mass","Potential curvature m",.2,1.5,.7,.05],["offset","Potential floor V₀",.01,1,.17,.01]],what:"A smooth potential is chosen and the scalar field evolves using slow-roll-style equations in normalized units.",limit:"The toy presupposes a scalar field, its potential and a spacetime background. It neither proves inflation happened nor explains why physical laws exist."},
 {id:"laws",tag:"LAWS / EMERGENCE",title:"WHY THESE LAWS?",question:"How can extremely simple rules generate intricate behavior?",formula:"sᵢ(t+1) = Rule_R(sᵢ₋₁,sᵢ,sᵢ₊₁)",level:"Exact discrete cellular automaton · illustrative",params:[["rule","Elementary CA rule",0,255,110,1],["density","Initial black-cell probability",.02,.45,.13,.01]],what:"All 256 elementary cellular-automaton rules create different patterns from one local update prescription.",limit:"Generating complexity after specifying a law does NOT explain why that law holds in our Universe. Shannon row entropy is not a measure of meaning or consciousness."},
 {id:"geometry",tag:"INFORMATION / GEOMETRY",title:"DO CORRELATIONS DEFINE DISTANCE?",question:"Could geometry emerge from underlying correlations?",formula:"⟨s₀sᵣ⟩ = tanh(J/T)ʳ ; d_eff(r) = −ln|⟨s₀sᵣ⟩|",level:"1D Ising correlation identity · geometric analogy",params:[["J","Coupling J",.2,3,1.2,.05],["temp","Temperature T",.2,4,1.3,.05]],what:"The infinite, zero-field, equilibrium 1D Ising chain has an analytically known two-point correlation. A negative logarithm turns it into a toy effective separation.",limit:"This is NOT a derivation of spacetime from quantum entanglement. Spins and temperature already presuppose a model and an ordering of sites."},
 {id:"crossover",tag:"GRAVITY × QUANTUM",title:"WHERE DO QUANTUM AND GRAVITY MEET?",question:"At what mass scale do characteristic quantum and gravitational lengths compete?",formula:"rₛ = 2Gm/c² ; λ̄C = ℏ/(mc)",level:"Established characteristic lengths · heuristic crossover",params:[["logmass","log₁₀(m/m_P)",-3,3,0,.05]],what:"In Planck units, Schwarzschild radius grows as 2m while reduced Compton wavelength shrinks as 1/m.",limit:"Their intersection is a dimensional heuristic, not a complete quantum theory of gravity or a universal physical transition."},
 {id:"gup",tag:"QUANTUM GRAVITY / SPECULATIVE",title:"IS THERE A MINIMUM LENGTH?",question:"Could the uncertainty relation be modified close to the Planck scale?",formula:"Δx ≥ 1/(2Δp) + βΔp   (Planck units)",level:"Hypothetical generalized-uncertainty toy model",params:[["beta","Hypothetical β",0,3,.6,.05],["momentum","Momentum uncertainty Δp",.1,8,1.3,.05]],what:"An assumed β-dependent correction develops a positive minimum Δx_min = √(2β) for β>0.",limit:"The β term is NOT experimentally established; this is one family of speculative modifications. It does not establish a minimum physical length."},
 {id:"unify",tag:"THEORY OF EVERYTHING / GUT",title:"DO THE FORCES UNIFY?",question:"Do the known gauge couplings become one at high energy?",formula:"αᵢ⁻¹(μ)=αᵢ⁻¹(MZ) − [bᵢ/(2π)]ln(μ/MZ)",level:"Standard Model one-loop RG · exploratory extension",params:[["scale","log₁₀(E/GeV)",2,18,15,.1],["db1","Toy Δb₁ above 10¹⁰ GeV",-3,3,0,.1],["db2","Toy Δb₂ above 10¹⁰ GeV",-3,3,0,.1],["db3","Toy Δb₃ above 10¹⁰ GeV",-3,3,0,.1]],what:"Uses SU(5)-normalized one-loop Standard Model coefficients b=(41/10,−19/6,−7), with approximate reference inputs at MZ. Optional Δb knobs are hypothetical changes above a preset threshold.",limit:"A change in beta coefficients is not evidence of new particles. Gauge coupling convergence would NOT include gravity and would NOT by itself solve a Theory of Everything."},
 {id:"intervene",tag:"GOD / EXPLANATION",title:"CAN LAWS RUN WITHOUT INTERVENTION?",question:"Can a world evolve through internal rules, without further external actions?",formula:"S(t+1) = F₁₁₀(S(t)); optional manual perturbation",level:"Deterministic rule-110 experiment · philosophy boundary",params:[["rule","Closed-system rule",0,255,110,1],["density","Initial density",.04,.35,.15,.01]],what:"Two identical worlds follow the same chosen rule. You may click to alter one world and quantify how its future differs.",limit:"A self-evolving physical model needs no extra intervention *within the model*. This neither proves nor disproves God, divine creation, deism, theism or any metaphysical claim."},
 {id:"entropy",tag:"TIME / ENTROPY",title:"WHY DOES TIME HAVE AN ARROW?",question:"How does coarse-grained disorder evolve from an organized starting state?",formula:"H = −Σᵢ pᵢ log(pᵢ) / ln(B)",level:"Stochastic mixing model · coarse-grained entropy",params:[["noise","Random velocity kick",0,1,.45,.05],["speed","Particle speed",.2,3,1,.05]],what:"Many particles start in a small region and spread. Their spatial Shannon entropy across 12 bins is measured as they mix.",limit:"This model adds stochastic velocity kicks and thus does NOT prove irreversibility from time-reversal-invariant microscopic laws or explain the low-entropy early Universe."}
];
function seeded(seed=937){let v=seed>>>0;return()=>((v=(Math.imul(v,1664525)+1013904223)>>>0)/4294967296);}
function gaussian(rng){const u=Math.max(1e-12,rng()),v=rng();return Math.sqrt(-2*Math.log(u))*Math.cos(2*PI*v);}
function ruleStep(row,rule){const n=row.length,next=new Uint8Array(n);for(let i=0;i<n;i++){const code=(row[(i+n-1)%n]<<2)|(row[i]<<1)|row[(i+1)%n];next[i]=(rule>>code)&1;}return next;}
function shannon(row){let n=0;for(const x of row)n+=x;let p=n/row.length;if(p===0||p===1)return 0;return -p*Math.log2(p)-(1-p)*Math.log2(1-p);}
function transmission(E,V,a,m,hbar=1){if(!(E>0&&V>0&&a>=0&&m>0&&hbar>0))return NaN;
 const gap=E-V,x=a*Math.sqrt(2*m*Math.abs(gap))/hbar;
 if(Math.abs(gap)<1e-9)return 1/(1+m*V*a*a/(2*hbar*hbar));
 if(gap<0){if(x>350)return 0;const sinh=Math.sinh(x),coef=V*V*sinh*sinh/(4*E*(-gap));return 1/(1+coef);}
 const sin=Math.sin(x),coef=V*V*sin*sin/(4*E*gap);return 1/(1+coef);
}
function gup(beta,dp){if(beta<0||dp<=0)return NaN;return .5/dp+beta*dp;}
function gauge(logE,db1=0,db2=0,db3=0){const E=10**logE,MZ=91.1876,alphaEM=1/127.95,s2=.23122,alphaS=.1181,initial=[(5/3)*alphaEM/(1-s2),alphaEM/s2,alphaS],b=[4.1,-19/6,-7],delta=[db1,db2,db3],L=Math.log(E/MZ),X=Math.max(0,Math.log(E/1e10));return initial.map((a,i)=>1/a-b[i]*L/(2*PI)-delta[i]*X/(2*PI));}
function scalarV(phi,p){return p.offset+.5*p.mass*p.mass*phi*phi;}
function correlate(r,J,T){return Math.pow(Math.tanh(J/T),r);}
function gravityQuantum(m){return{rs:2*m,lambda:1/m,ratio:2*m*m};}
function make(id,settings={},seed=2026){
 const spec=MODES.find(q=>q.id===id);if(!spec)throw Error("Unknown frontier model "+id);
 const p=Object.fromEntries(spec.params.map(([k,,min,max,defaultV])=>[k,clamp(Number.isFinite(Number(settings[k]))?Number(settings[k]):defaultV,min,max)]));
 const rng=seeded(seed),state={id,p,seed,step:0,history:[],spec,mouse:null};
 const w=128,h=78;
 const initial=()=>{state.step=0;state.history=[];state.mouse=null;
 if(id==="vacuum"){state.samples=[];state.meanSq=0;state.count=0;state.shiftX=0;state.shiftP=0;}
 if(id==="inflation"){state.phi=p.field;state.N=0;state.H=Math.sqrt(scalarV(state.phi,p)/3);}
 if(id==="laws"||id==="intervene"){let row=new Uint8Array(w);for(let i=0;i<w;i++)row[i]=rng()<p.density?1:0;row[w>>1]=1;state.rows=[row];if(id==="intervene"){state.reference=row.slice();state.difference=0;state.edits=0;}}
 if(id==="entropy"){state.particles=Array.from({length:240},()=>({x:.14+rng()*.1,v:(rng()*2-1)*.007*p.speed}));}
 };
 function metric(){
  if(id==="vacuum")return{value:.5*p.hbar*p.omega,unit:"zero-point E₀",detail:"Ground state: nonzero energy under an assumed Hamiltonian"};
  if(id==="tunnel")return{value:transmission(p.energy,p.height,p.width,p.mass),unit:"transmission T",detail:"Stationary rectangular potential barrier"};
  if(id==="inflation")return{value:state.N,unit:"e-folds N",detail:"Potential-driven expansion under assumed slow-roll equations"};
  if(id==="laws")return{value:shannon(state.rows.at(-1)),unit:"row entropy H₂",detail:"Binary Shannon entropy of the newest cellular-automaton row"};
  if(id==="geometry")return{value:-Math.log(Math.max(1e-30,correlate(1,p.J,p.temp))),unit:"d_eff(1)",detail:"Negative log nearest-neighbor spin correlation"};
  if(id==="crossover")return{value:gravityQuantum(10**p.logmass).ratio,unit:"rₛ / λ̄C",detail:"Mass is expressed in Planck units"};
  if(id==="gup")return{value:gup(p.beta,p.momentum),unit:"Δx bound",detail:"Hypothetical generalized uncertainty relation"};
  if(id==="unify"){const c=gauge(p.scale,p.db1,p.db2,p.db3);return{value:Math.max(...c)-Math.min(...c),unit:"max−min(1/α)",detail:"Smaller spread means the three gauge couplings are numerically closer"};}
  if(id==="intervene")return{value:state.difference||0,unit:"bit fraction",detail:"Hamming distance between untouched and manually perturbed worlds"};
  if(id==="entropy"){const bins=new Array(12).fill(0);for(const a of state.particles)bins[Math.min(11,Math.floor(a.x*12))]++;let entropy=0;for(const n of bins)if(n>0){const q=n/state.particles.length;entropy-=q*Math.log(q);}return{value:entropy/Math.log(12),unit:"coarse entropy",detail:"Normalized positional Shannon entropy over twelve bins"};}
  return{value:0,unit:"",detail:""};
 }
 function step(){
  state.step++;
  if(id==="vacuum"){const sx=Math.sqrt(p.hbar/(2*p.mass*p.omega)),sp=Math.sqrt(p.hbar*p.mass*p.omega/2);
   const x=gaussian(rng)*sx+state.shiftX,pp=gaussian(rng)*sp+state.shiftP;state.samples.push({x,p:pp});if(state.samples.length>420)state.samples.shift();state.meanSq+=x*x;state.count++;}
  if(id==="inflation"){for(let i=0;i<4;i++){const H=Math.sqrt(scalarV(state.phi,p)/3),dt=.033;state.phi-=p.mass*p.mass*state.phi/(3*Math.max(H,.01))*dt;state.N+=H*dt;state.H=H;}}
  if(id==="laws"||id==="intervene"){const next=ruleStep(state.rows.at(-1),p.rule);state.rows.push(next);if(state.rows.length>h)state.rows.shift();
   if(id==="intervene"){state.reference=ruleStep(state.reference,p.rule);let diff=0;for(let i=0;i<w;i++)if(state.reference[i]!==next[i])diff++;state.difference=diff/w;}}
  if(id==="entropy"){for(const particle of state.particles){particle.v=clamp(particle.v+(rng()-.5)*.0015*p.noise,-.03,.03);particle.x=(particle.x+particle.v+1)%1;}}
  const value=metric().value;if(state.step%2===0){state.history.push({t:state.step,y:value});if(state.history.length>380)state.history.shift();}
  return value;
 }
 function interact(x,y,alt=false){
  x=clamp(x,0,.999999);y=clamp(y,0,.999999);state.mouse={x,y,alt};
  if(id==="vacuum"){const sx=Math.sqrt(p.hbar/(2*p.mass*p.omega)),sp=Math.sqrt(p.hbar*p.mass*p.omega/2);state.shiftX=(x-.5)*5*sx;state.shiftP=(.5-y)*5*sp;state.samples=[];state.meanSq=0;state.count=0;state.history=[];state.step=0;}
  if(id==="laws"){const last=state.rows.at(-1),index=Math.floor(x*w);last[index]^=1;}
  if(id==="intervene"){const last=state.rows.at(-1),index=Math.floor(x*w);last[index]^=1;state.edits++;
   let diff=0;for(let i=0;i<w;i++)if(state.reference[i]!==last[i])diff++;state.difference=diff/w;}
  if(id==="entropy"){for(const q of state.particles){q.x=clamp(x+(rng()-.5)*.07,0,.999);q.v=(rng()*2-1)*.006*p.speed;}}
  if(id==="tunnel")p.energy=clamp(.2+4.8*x,.2,5);
  if(id==="inflation"){state.phi=.5+3.5*x;state.N=0;state.H=Math.sqrt(scalarV(state.phi,p)/3);state.step=0;state.history=[];}
  if(id==="geometry"){p.temp=.2+3.8*x;}
  if(id==="crossover"){p.logmass=-3+6*x;}
  if(id==="gup"){p.momentum=.1+7.9*x;}
  if(id==="unify"){p.scale=2+16*x;}
  return metric();
 }
 initial();return{state,step,interact,metric,restart:initial};
}
return{MODES,make,seeded,gaussian,ruleStep,shannon,transmission,gup,gauge,correlate,gravityQuantum,scalarV,clamp};
});