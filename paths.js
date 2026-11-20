/* COSMOS LAB learning paths. Progress lives in localStorage only (wrapped in try/catch). */
(function(){"use strict";
const G=tab=>"/genesis.html#p="+encodeURIComponent(JSON.stringify({tab}));
const PATHS=[
 {id:"origin",no:"01",title:"FROM NOTHING TO GALAXIES",tag:"THE BIG QUESTION",blurb:"Why is there something rather than nothing? Follow the equations from the quantum vacuum through inflation and the multiverse hypothesis — and learn where physics stops.",steps:[
  {t:"The expanding universe",d:"Start with what is established: solve the Friedmann equation and see radiation, matter and dark energy take turns. Notice that ‘t = 0’ is where the model fails.",href:G("expansion"),go:"GENESIS · EXPANSION"},
  {t:"A vacuum is not nothing",d:"Explore quantum vacuum fluctuations and the something-versus-nothing toy. What does ‘nothing’ even mean in quantum field theory?",href:"/frontier.html?model=vacuum",go:"FRONTIER · VACUUM"},
  {t:"Tunnelling",d:"A particle crosses a barrier it classically cannot. This is the mechanism behind proposals of tunnelling creation — see what the transmission depends on.",href:"/frontier.html?model=tunnel",go:"FRONTIER · TUNNELLING"},
  {t:"Inflation and the CMB",d:"Roll a scalar field down a potential and read off n_s and r. Which potentials survive Planck and BICEP/Keck? Try φ² against the Starobinsky plateau.",href:G("inflation"),go:"GENESIS · INFLATION"},
  {t:"Eternal inflation: where quantum beats classical",d:"Switch on quantum noise and find the field value where inflation never ends. Then look at the volume-weight plot: that is the measure problem. This is a hypothesis, not an observation.",href:G("eternal"),go:"GENESIS · MULTIVERSE"},
  {t:"A universe from nothing?",d:"Compare Hartle–Hawking e^{+S} with Vilenkin e^{−S}. Same equation, opposite predictions. Which condition, if any, is right is unknown.",href:G("nothing"),go:"GENESIS · FROM NOTHING"},
  {t:"Does the universe need an intervention?",d:"A model-by-model look at whether the toy universes require an external push, and the explicit limits of what physics and philosophy can decide.",href:"/frontier.html?model=intervene",go:"FRONTIER · INTERVENTION"},
  {t:"Formal ON/OFF universes",d:"End on the open problems page: formal universe on/off states and why some questions may lie outside what any model can settle.",href:"/open.html?model=universe",go:"OPEN PROBLEMS"}]},
 {id:"bang",no:"02",title:"FROM THE BIG BANG TO DARK ENERGY",tag:"COSMOLOGY WITH REAL DATA",blurb:"Build the expansion history equation by equation, then test it against more than 1,500 real supernovae.",steps:[
  {t:"The ΛCDM expansion rate",d:"Open the first model in the atlas: H(z)/H₀ for flat matter plus Λ. Move Ωm and see what changes.",href:"/?model=M001",go:"ATLAS · M001"},
  {t:"The radiation era",d:"At early times the universe was radiation dominated: a ∝ t^½. Plot it and compare slopes.",href:"/?model=M008",go:"ATLAS · M008"},
  {t:"The matter era",d:"Then matter dominated: a ∝ t^{2/3}. Structure formation happens here.",href:"/?model=M007",go:"ATLAS · M007"},
  {t:"The whole history on one chart",d:"Genesis stitches the three eras together on a log–log time axis and marks equality and the start of acceleration.",href:G("expansion"),go:"GENESIS · EXPANSION"},
  {t:"Deceleration to acceleration",d:"The deceleration parameter q(z) changes sign when dark energy takes over. Find the redshift where it crosses zero.",href:"/?model=M004",go:"ATLAS · M004"},
  {t:"Test it on supernova data",d:"Fit 1,580 real Pantheon+ supernovae. See how decisively a universe without dark energy is rejected, and how little the data prefer w ≠ −1.",href:"/data.html",go:"REAL DATA"},
  {t:"Let dark energy evolve",d:"The wCDM expansion with constant w = b. Try w = −0.9 and compare with ΛCDM.",href:"/?model=M002",go:"ATLAS · M002"},
  {t:"Fit your own data",d:"The Research Observatory fits ΛCDM and wCDM to a CSV you upload and shows χ² heatmaps and residuals.",href:"/observatory.html",go:"OBSERVATORY"},
  {t:"What is new this month",d:"Finish with recent papers: DESI, JWST and Hubble-tension results change quickly, so read what the authors claim and what is not proven.",href:"/radar.html?kind=papers",go:"RESEARCH RADAR"}]},
 {id:"chaos",no:"03",title:"ORDER, CHAOS AND EMERGENCE",tag:"COMPLEX SYSTEMS",blurb:"From a single equation with a surprising bifurcation tree to flocks, sandpiles and synchronising oscillators.",steps:[
  {t:"One equation, infinite behaviour",d:"The logistic map: slide r and watch order become chaos. Look for the period-doubling cascade.",href:"/chaos.html",go:"CHAOS FORGE"},
  {t:"A two-dimensional map",d:"The Hénon map has a strange attractor; zoom in mentally and notice its fractal structure.",href:"/toybox.html?model=henon",go:"TOY · HÉNON"},
  {t:"Rules that make life",d:"Conway’s Game of Life: three local rules, endless structures. Click cells to seed your own.",href:"/toybox.html?model=life",go:"TOY · LIFE"},
  {t:"Self-organised criticality",d:"Drop grains on a sandpile. Avalanches of every size appear without any tuning.",href:"/toybox.html?model=sand",go:"TOY · SANDPILE"},
  {t:"Synchronisation",d:"Kuramoto oscillators lock together above a critical coupling, like fireflies or power-grid generators.",href:"/toybox.html?model=kuramoto",go:"TOY · KURAMOTO"},
  {t:"Flocking",d:"Boids follow three simple rules and produce coordinated flocks.",href:"/toybox.html?model=boids",go:"TOY · BOIDS"},
  {t:"Contagion on networks",d:"Financial contagion toy from the open-problems page: how local failures spread through links.",href:"/open.html?model=contagion",go:"OPEN · CONTAGION"},
  {t:"Emergence, with limits",d:"The COSMOS ∞ emergent-space module asks whether geometry itself could be an emergent property.",href:"/reality.html?model=emergent",go:"COSMOS ∞ · EMERGENT"}]},
 {id:"primes",no:"04",title:"NUMBERS AND THE PRIMES",tag:"MATHEMATICS",blurb:"From a partial sum of the zeta function to its zeros and the random-matrix statistics hiding in them.",steps:[
  {t:"The zeta function, partially summed",d:"Start with the finite partial sum in the atlas and see how slowly it converges on the critical line.",href:"/?model=M184",go:"ATLAS · M184"},
  {t:"Find the zeros yourself",d:"Compute Hardy’s Z(t) and locate the first hundred zeros. Compare with the published values in the table.",href:"/riemann.html",go:"RIEMANN LAB"},
  {t:"Go higher",d:"Raise the search height to 800 and check that the zero count follows θ(T)/π + 1 to within one.",href:"/riemann.html#p="+encodeURIComponent(JSON.stringify({T:800,a:700,w:50})),go:"RIEMANN · T = 800"},
  {t:"Random-matrix spacing",d:"Read the histogram: gaps follow GUE, not Poisson. Level repulsion is the hint behind the Hilbert–Pólya idea.",href:"/riemann.html",go:"RIEMANN · SPACING"},
  {t:"A simple rule no one can prove",d:"The Collatz iteration is easy to state and unsolved. Explore its trajectories.",href:"/open.html?model=collatz",go:"OPEN · COLLATZ"},
  {t:"Spectra everywhere",d:"A Fourier decomposition: the same idea of reading a signal by its frequencies that underlies the explicit formula for primes.",href:"/toybox.html?model=fourier",go:"TOY · FOURIER"}]}
];
const KEY="cosmos_paths_v1";let done={};
try{done=JSON.parse(localStorage.getItem(KEY)||"{}")||{};}catch{done={};}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(done));}catch{}};
const $=id=>document.getElementById(id);
let cur=(location.hash.match(/path=(\w+)/)||[])[1];if(!PATHS.some(p=>p.id===cur))cur="origin";
function count(){let n=0;for(const p of PATHS)p.steps.forEach((_,i)=>{if(done[p.id+":"+i])n++;});return n;}
function render(){
  $("hSteps").textContent=PATHS.reduce((a,p)=>a+p.steps.length,0);$("hDone").textContent=count();
  const box=$("paths");box.textContent="";
  PATHS.forEach(p=>{const b=document.createElement("button");b.type="button";b.className="path-card"+(p.id===cur?" active":"");b.role="tab";
    const n=p.steps.filter((_,i)=>done[p.id+":"+i]).length;
    b.innerHTML="<small>PATH "+p.no+" · "+p.tag+"</small><h3>"+p.title+"</h3><p>"+p.blurb+"</p><small>"+n+" / "+p.steps.length+" DONE</small>";
    b.onclick=()=>{cur=p.id;history.replaceState(null,"","#path="+cur);render();};box.appendChild(b);});
  const P=PATHS.find(p=>p.id===cur);$("pathTitle").textContent="PATH "+P.no+" / "+P.title;
  const s=$("steps");s.textContent="";
  P.steps.forEach((st,i)=>{const row=document.createElement("div");row.className="step"+(done[P.id+":"+i]?" done":"");
    const body=document.createElement("div");const h=document.createElement("h4");h.textContent=st.t;const d=document.createElement("p");d.textContent=st.d;
    const lab=document.createElement("label");lab.style.cssText="font-size:11px;font-weight:800;display:flex;gap:6px;align-items:center";const cb=document.createElement("input");cb.type="checkbox";cb.checked=!!done[P.id+":"+i];
    cb.onchange=()=>{if(cb.checked)done[P.id+":"+i]=1;else delete done[P.id+":"+i];save();render();};lab.append(cb,document.createTextNode("MARK AS DONE"));
    body.append(h,d,lab);const a=document.createElement("a");a.className="go";a.href=st.href;a.textContent=st.go+" ↗";row.append(body,a);s.appendChild(row);});
}
render();
})();
