/* COSMOS ∞ Reality Engine — standalone numerical toy engines.
   Not an empirical cosmology simulator, not a general quantum gravity/TOE solver.
   Every module documents the limits of its mathematical model. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.CosmosInfinity=api;})(typeof window!=="undefined"?window:globalThis,function(){"use strict";
const PI=Math.PI,TAU=PI*2,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),sq=x=>x*x;
function rngFrom(seed=2026){let v=seed>>>0;return()=>((v=(Math.imul(v,1664525)+1013904223)>>>0)/4294967296);}
function randn(rng){return Math.sqrt(-2*Math.log(Math.max(1e-12,rng())))*Math.cos(TAU*rng());}
function mean(a){return a.reduce((s,v)=>s+v,0)/Math.max(1,a.length);}
function rmse(a,b){if(a.length!==b.length||!a.length)return NaN;return Math.sqrt(mean(a.map((v,i)=>sq(v-b[i]))));}
function entropy(p){return p<=0||p>=1?0:-p*Math.log2(p)-(1-p)*Math.log2(1-p);}
const MODULES=[
{id:"universe",title:"UNIVERSE CREATOR",tag:"CUSTOM COSMOS",question:"What structures appear when you change the force law and initial conditions?",formula:"aᵢ = Σⱼ Gmⱼ(rⱼ−rᵢ) / (|rⱼ−rᵢ|²+ε²)^(3/2) + Λrᵢ",params:[["count","Particles",12,90,44,1],["gravity","Attraction G",0,2,0.8,.05],["repulsion","Outward term Λ",0,.4,.02,.01],["swirl","Initial orbital swirl",0,2,.8,.05],["soft","Softening ε",.015,.25,.075,.005]],help:"Click to launch a cluster into the current universe; alter laws with the sliders.",what:"Numerical 2D softened N-body toy with a tunable outward acceleration. It visualizes clustering, dispersal and model sensitivity.",limit:"The outward term is an invented phenomenological force, not a cosmological-constant solution of Einstein's equations. The finite particle set is not a realistic universe."},
{id:"break",title:"BREAK THE LAWS",tag:"NUMERICAL FAILURE",question:"When do numerical algorithms cease to respect an otherwise valid law?",formula:"x'' = −kx ; E = (v²+kx²)/2 ; compare Euler and velocity-Verlet",params:[["k","Spring k",.2,4,1.5,.05],["dt","Time step Δt",.012,.2,.07,.004],["amplitude","Initial displacement",.4,2,1.1,.05]],help:"Click to restart the oscillator. The lines compare Euler, Verlet, and the exact harmonic solution.",what:"Measures the error and energy drift of two numerical integrators against an exact harmonic oscillator solution.",limit:"Numerical divergence is not a failure of the physical law. Only the approximation, step size and algorithm are changing."},
{id:"data",title:"REAL UNIVERSE DATA",tag:"DATA / VALIDATION",question:"How do you distinguish scientific measurements from generated example curves?",formula:"RMSE = √[Σ(y−ŷ)²/n] ; imported x,y points remain untouched",params:[["noise","Demo synthetic noise",0,.8,.15,.02],["signal","Demo oscillatory strength",0,2,1.2,.05]],help:"Use IMPORT CSV to load two numeric columns of measurements; until then the dataset is explicitly SYNTHETIC. Click to select a data point.",what:"A source-labelled plotting and validation station. It ingests user-supplied numerical CSV data, preserving provenance as entered and checking finite values.",limit:"No CERN, LIGO or Planck measurements are bundled or silently invented. The external catalog links provide access to actual archives; a numerical CSV must be imported to analyze measurements."},
{id:"tournament",title:"THEORY TOURNAMENT",tag:"MODEL SELECTION",question:"Which mathematical model explains the same dataset without overfitting?",formula:"AICc=n ln(SSE/n)+2k+2k(k+1)/(n−k−1)",params:[["complexity","Max polynomial degree",1,3,3,1],["noise","Demo synthetic noise",0,.8,.15,.02]],help:"Click RUN RANKING to fit candidate equations on a shared dataset. Cross-validation and complexity penalties rank the fits.",what:"Fits candidate linear, polynomial, sinusoidal and exponential-basis models with a held-out subset and training AICc.",limit:"A good statistical fit does not establish physical causality. Interleaved holdout is not a future time-series forecast. Model selection is limited to the provided candidate family."},
{id:"blackhole",title:"BLACK HOLE EXPLORER",tag:"RELATIVITY",question:"How do null geodesics bend around a non-spinning Schwarzschild black hole?",formula:"u''+u=3Mu² ; u=1/r ; r_ph=3M",params:[["r0","Closest approach r₀/M",3.15,25,7,.05],["mass","Black-hole mass scale",.5,2,1,.05]],help:"Click horizontally to change the closest approach. The orbit is a numerical Schwarzschild null geodesic in units of mass.",what:"RK4 numerical solution of the Schwarzschild orbital equation for light rays with a turning point outside the photon sphere.",limit:"Nonspinning black hole, vacuum, geometrized units and finite angular integration. No Kerr rotation, full ray-traced image or accretion physics."},
{id:"quantum",title:"QUANTUM COMPUTER LAB",tag:"QUBITS",question:"How do unitary gates create superposition and entanglement?",formula:"|ψ⟩=Σ aᵢ|i⟩ ; S(q₀)=H₂[(1+√(1−4|ad−bc|²))/2]",params:[["theta","Rotation θ / radians",0,6.28,1.57,.01]],help:"Use the gate buttons H0, H1, X0, CNOT, RZ0, RX1, MEASURE, and BELL. The probability bars show the actual state vector.",what:"Exact two-qubit pure-state complex amplitude simulation with unitary quantum gates and seeded projective measurements.",limit:"Ideal pure qubits only; no physical device, realistic noise, quantum advantage, macroscopic measurement model or unexplained claim about consciousness."},
{id:"initial",title:"INITIAL CONDITIONS MACHINE",tag:"EARLY UNIVERSE TOY",question:"How do the spectral tilt and growth assumptions change a seeded fluctuation field?",formula:"δ(x,a)=Σₖ Aₖ aᵍ cos(kx+φₖ), Aₖ∝k^(n/2)e^(−σk²)",params:[["tilt","Spectral tilt n",-3,1,-1,.1],["growth","Toy growth exponent g",0,2,.9,.05],["damping","High-k damping σ",0,.05,.008,.002]],help:"Click to inject a local perturbation; reseed to change phases without changing the power law.",what:"A 1D seeded Fourier random field and its user-chosen growth law with live field and power-spectrum diagnostics.",limit:"Not a Boltzmann solver or a Planck CMB map; scalar perturbations and their time dependence are chosen by prescription."},
{id:"discover",title:"EQUATION DISCOVERY",tag:"SYMBOLIC SEARCH",question:"Can you recover a compact formula from a noisy numerical signal?",formula:"ŷ=Σ βⱼφⱼ(x) ; rank by holdout RMSE and AICc",params:[["noise","Demo noise",0,.8,.15,.02],["strength","Demo sine amplitude",0,2,1.2,.05]],help:"Click SEARCH EQUATIONS. Try imported numerical CSV instead of demo data; candidate equations are limited and shown explicitly.",what:"Transparent local basis-function search over constant, polynomial, sinusoidal and exponential candidate equations, with fitting and validation.",limit:"Not an AI theorem prover or automatic discovery of natural laws; fitting a curve does not establish an explanatory equation."},
{id:"emergent",title:"EMERGENT SPACETIME ARENA",tag:"CORRELATION / GEOMETRY",question:"Can a graph of pure entangled pairs define useful effective distances?",formula:"S(A)=Σ_{e∈∂A}H₂(pₑ) ; ℓₑ=1/(.05+H₂(pₑ))",params:[["strength","Bond entanglement p",.02,.5,.43,.01],["shortcuts","Shortcut density",0,1,.3,.05],["disorder","Bond disorder",0,1,.3,.05]],help:"Click nodes to toggle region A; click an edge to alter link entropy. The white path is an imposed shortest path.",what:"The graph cut entropy is exact for a product of independent bipartite pure link states. Weighted graph distance is a separately defined heuristic.",limit:"Each graph edge has separate endpoint qubits. Nothing here derives physical spacetime, the Einstein equation or the Ryu–Takayanagi formula."},
{id:"research",title:"RESEARCH AUTOPILOT",tag:"EXPERIMENT DESIGN",question:"What can an automated numerical search actually establish?",formula:"k̂=argminₖ RMSE[cos(√k t), y(t)] ; verify against holdout",params:[["trueK","Demo hidden spring k",.3,3.5,1.8,.05],["noise","Noise σ",0,.3,.08,.01],["budget","Parameter trials",20,180,120,10]],help:"Click RUN EXPERIMENT to scan candidate parameters; export the complete assumptions, ranked trials and residuals.",what:"A deterministic, local hypothesis-search protocol that generates a synthetic oscillator dataset, sweeps candidate spring constants and reports holdout error.",limit:"This is an automated numerical researcher, NOT an LLM agent. It does not browse papers, invent hypotheses outside the search grid, establish a discovery or perform background monitoring."}
];
const MODULE_BY_ID=Object.fromEntries(MODULES.map(v=>[v.id,v]));
function syntheticData(seed=2026,noise=.15,signal=1.2){const rand=rngFrom(seed),out=[];for(let i=0;i<100;i++){const x=-3+6*i/99;const y=1+.42*x+signal*Math.sin(1.3*x)+randn(rand)*noise;out.push({x,y});}return out;}
function parseCSV(text,maxRows=3000){if(typeof text!=="string"||text.length>2000000)throw Error("CSV too large; limit 2 MB");const lines=text.split(/\r?\n/).map(v=>v.trim()).filter(v=>v&&!v.startsWith("#"));if(!lines.length)throw Error("Empty CSV");
 let rows=[];for(let i=0;i<lines.length;i++){const p=lines[i].replace(/^\ufeff/,"").split(/[,;\t]/);if(p.length<2)continue;const x=Number(p[0]),y=Number(p[1]);if(Number.isFinite(x)&&Number.isFinite(y)){rows.push({x,y});if(rows.length>=maxRows)break;}else if(i>0&&p.slice(0,2).some(v=>v.trim()))throw Error("Invalid numeric x,y in line "+(i+1));}
 if(rows.length<12)throw Error("Need at least 12 numeric pairs; first two columns x,y");
 rows.sort((a,b)=>a.x-b.x);for(let i=1;i<rows.length;i++)if(rows[i].x===rows[i-1].x)throw Error("Duplicate x value at "+rows[i].x+"; aggregate before import");return rows;}
function basis(name,x){switch(name){case"constant":return[1];case"linear":return[1,x];case"quadratic":return[1,x,x*x];case"cubic":return[1,x,x*x,x*x*x];case"sinusoid":return[1,x,Math.sin(1.3*x),Math.cos(1.3*x)];case"exponential":return[1,x,Math.exp(clamp(.55*x,-20,20))];default:throw Error("Unknown basis")}}
const CANDIDATES=["constant","linear","quadratic","cubic","sinusoid","exponential"];
function solve(A,b){const n=A.length,M=A.map((r,i)=>[...r,b[i]]);for(let i=0;i<n;i++){let best=i;for(let j=i+1;j<n;j++)if(Math.abs(M[j][i])>Math.abs(M[best][i]))best=j;[M[i],M[best]]=[M[best],M[i]];const diag=M[i][i];if(Math.abs(diag)<1e-15)return null;for(let k=i;k<=n;k++)M[i][k]/=diag;for(let j=0;j<n;j++)if(j!==i){const f=M[j][i];for(let k=i;k<=n;k++)M[j][k]-=f*M[i][k];}}return M.map(r=>r[n]);}
function fitBasis(rows,name){const k=basis(name,0).length,mat=Array.from({length:k},()=>Array(k).fill(0)),v=Array(k).fill(0);
 for(const row of rows){const b=basis(name,row.x);for(let i=0;i<k;i++){v[i]+=b[i]*row.y;for(let j=0;j<k;j++)mat[i][j]+=b[i]*b[j];}}
 const ridge=1e-9;for(let i=0;i<k;i++)mat[i][i]+=ridge;return solve(mat,v);}
function rankModels(data,degree=3){if(!Array.isArray(data)||data.length<12)throw Error("Need at least 12 data pairs");const train=data.filter((_,i)=>i%4!==0),test=data.filter((_,i)=>i%4===0);
 const names=CANDIDATES.filter(n=>!["quadratic","cubic"].includes(n)||((n==="quadratic"?2:3)<=degree)),out=[];
 for(const name of names){const beta=fitBasis(train,name);if(!beta)continue;const f=x=>basis(name,x).reduce((v,q,i)=>v+q*beta[i],0),k=beta.length,errs=train.map(a=>sq(a.y-f(a.x))),sse=errs.reduce((a,b)=>a+b,0),n=train.length;
 const aicc=n*Math.log(Math.max(1e-12,sse)/n)+2*k+(n>k+1?2*k*(k+1)/(n-k-1):Infinity),testRMSE=rmse(test.map(a=>a.y),test.map(a=>f(a.x)));
 out.push({name,beta,k,aicc,trainRMSE:Math.sqrt(sse/n),testRMSE,predictions:data.map(a=>({x:a.x,y:f(a.x)}))});}
 out.sort((a,b)=>a.testRMSE-b.testRMSE||a.aicc-b.aicc);
 return out;
}
function rkSchwarzschild(r0,M=1,dphi=.012,max=1400){const u0=M/r0,points=[{x:r0,y:0,r:r0,phi:0}],G=(u)=>3*u*u-u;
 let u=u0,v=0,phi=0,alpha=null,escaped=false;
 for(let i=0;i<max;i++){const du=dphi,dv=G(u);const k1u=v,k1v=dv,k2u=v+k1v*dphi/2,k2v=G(u+k1u*dphi/2),k3u=v+k2v*dphi/2,k3v=G(u+k2u*dphi/2),k4u=v+k3v*dphi,k4v=G(u+k3u*dphi);
 const nu=u+dphi*(k1u+2*k2u+2*k3u+k4u)/6,nv=v+dphi*(k1v+2*k2v+2*k3v+k4v)/6;
 phi+=dphi;if(nu<=0){const frac=clamp(u/(u-nu),0,1);const phi0=phi-dphi+dphi*frac;alpha=2*phi0-PI;escaped=true;break;}u=nu;v=nv;const r=M/u;if(r>170*M){const phi0=phi+Math.asin(clamp(u/Math.max(1e-8,Math.abs(v)),0,1));alpha=2*phi0-PI;escaped=true;break;}if(i%2===0){points.push({x:r*Math.cos(phi),y:r*Math.sin(phi),r,phi});}}
 const mirrored=points.slice(1).map(q=>({...q,x:q.x,y:-q.y,phi:-q.phi})).reverse();
 const b=r0/Math.sqrt(1-2*M/r0);return{points:[...mirrored,...points],alpha,weak:4*M/b,b,escaped,r0,photonSphere:3*M};
}
const c=(r=0,i=0)=>({r,i}),sum=(a,b)=>c(a.r+b.r,a.i+b.i),mul=(a,b)=>c(a.r*b.r-a.i*b.i,a.r*b.i+a.i*b.r),scale=(a,s)=>c(a.r*s,a.i*s),norm=a=>a.r*a.r+a.i*a.i;
function gate1(amp,q,m){const bit=q===0?2:1,out=amp.map(v=>({...v}));for(let i=0;i<4;i++)if((i&bit)===0){const j=i|bit;out[i]=sum(mul(m[0],amp[i]),mul(m[1],amp[j]));out[j]=sum(mul(m[2],amp[i]),mul(m[3],amp[j]));}return out;}
function quantumEntropy(amp){const det=sum(mul(amp[0],amp[3]),scale(mul(amp[1],amp[2]),-1)),inside=Math.max(0,1-4*norm(det)),lambda=(1+Math.sqrt(inside))/2;return entropy(lambda);}
function oscillatorSeries(k,noise=.08,seed=10){const r=rngFrom(seed);return Array.from({length:100},(_,i)=>{const t=i*8/99;return{x:t,y:Math.cos(Math.sqrt(k)*t)+noise*randn(r)};});}
function estimateK(rows,budget=120){const train=rows.filter((_,i)=>i%5!==0),test=rows.filter((_,i)=>i%5===0),results=[];
 for(let i=0;i<budget;i++){const k=.2+i*3.7/(budget-1),predict=x=>Math.cos(Math.sqrt(k)*x);results.push({k,trainRMSE:rmse(train.map(q=>q.y),train.map(q=>predict(q.x))),testRMSE:rmse(test.map(q=>q.y),test.map(q=>predict(q.x)))});}
 results.sort((a,b)=>a.trainRMSE-b.trainRMSE);return{best:results[0],runs:results,holdoutN:test.length};}
function create(id,settings={},seed=2026,externalRows=null){const spec=MODULE_BY_ID[id];if(!spec)throw Error("Unknown module "+id);const p=Object.fromEntries(spec.params.map(([k,,lo,hi,defaultV,step])=>{const provided=Number(settings[k]),v=Number.isFinite(provided)?provided:defaultV;return[k,clamp(step>=1?Math.round(v/step)*step:v,lo,hi)]}));const rng=rngFrom(seed),s={id,spec,p,seed,t:0,history:[],lastAction:"",imported:Array.isArray(externalRows)&&externalRows.length>=12,selected:0};
function init(){s.t=0;s.history=[];s.lastAction="";
 if(id==="universe"){s.parts=[];for(let i=0;i<p.count;i++)addParticle(true);}
 if(id==="break"){s.euler={x:p.amplitude,v:0};s.verlet={x:p.amplitude,v:0};s.time=0;s.errors=[];}
 if(id==="data"||id==="tournament"||id==="discover"){s.rows=s.imported?externalRows.map(v=>({...v})):syntheticData(seed,p.noise,p.signal??p.strength??1.2);s.ranking=rankModels(s.rows,id==="tournament"?p.complexity:3);}
 if(id==="blackhole"){s.orbit=rkSchwarzschild(p.r0*p.mass,p.mass);s.frame=0;}
 if(id==="quantum"){s.amp=[c(1),c(),c(),c()];s.actions=[];s.lastMeasurement=null;}
 if(id==="initial"){s.phases=Array.from({length:12},()=>rng()*TAU);s.local=[];s.grow=1;}
 if(id==="emergent"){s.nodes=Array.from({length:12},(_,i)=>({x:.18+(i%4)*.215,y:.19+Math.floor(i/4)*.30}));s.region=s.nodes.map(n=>n.x<.5);s.edges=[];function edge(a,b){if(s.edges.some(e=>e.a===a&&e.b===b))return;s.edges.push({a,b,value:clamp(p.strength+(rng()-.5)*p.disorder*.6,.002,.5)});}for(let i=0;i<12;i++){if(i%4<3)edge(i,i+1);if(i<8)edge(i,i+4);}for(let i=0;i<12;i++)for(let j=i+2;j<12;j++)if(rng()<p.shortcuts*.065)edge(i,j);}
 if(id==="research"){s.rows=oscillatorSeries(p.trueK,p.noise,seed);s.scan=null;}
}
function addParticle(initial=false,x=.5,y=.5){const ang=TAU*rng(),rad=.015+.34*Math.sqrt(rng()),X=initial?.5+rad*Math.cos(ang):x,Y=initial?.5+rad*Math.sin(ang):y;let dx=X-.5,dy=Y-.5,r=Math.hypot(dx,dy)||.1,v=p.swirl*.006/Math.sqrt(.12+r);s.parts.push({x:X,y:Y,vx:-dy/r*v,vy:dx/r*v,m:.6+rng()*.8});if(s.parts.length>130)s.parts.shift();}
function advance(){
 s.t++;
 if(id==="universe"){const dt=.6,eps=sq(p.soft),a=s.parts.map(()=>({x:0,y:0}));for(let i=0;i<s.parts.length;i++)for(let j=i+1;j<s.parts.length;j++){const A=s.parts[i],B=s.parts[j],dx=B.x-A.x,dy=B.y-A.y,inv=Math.pow(dx*dx+dy*dy+eps,-1.5),f=p.gravity*.00008*inv; a[i].x+=f*B.m*dx;a[i].y+=f*B.m*dy;a[j].x-=f*A.m*dx;a[j].y-=f*A.m*dy;}
 s.parts.forEach((b,i)=>{b.vx=clamp(b.vx+(a[i].x+p.repulsion*.00012*(b.x-.5))*dt,-.06,.06);b.vy=clamp(b.vy+(a[i].y+p.repulsion*.00012*(b.y-.5))*dt,-.06,.06);b.x+=b.vx*dt;b.y+=b.vy*dt;});}
 if(id==="break"){const dt=p.dt,k=p.k;let e=s.euler,v=s.verlet;e.x+=e.v*dt;e.v-=k*(e.x-e.v*dt)*dt;const a=-k*v.x;v.x+=v.v*dt+.5*a*dt*dt;v.v+=.5*(a-k*v.x)*dt;s.time+=dt;}
 if(id==="blackhole")s.frame=(s.frame+2)%Math.max(2,s.orbit.points.length);
 if(id==="quantum"){}
 if(id==="initial")s.grow=Math.pow(1+s.t/150,p.growth);
 if(id==="emergent"){}
 const value=metric().value;if(s.t%2===0){s.history.push({t:s.t,y:value});if(s.history.length>350)s.history.shift();}return value;
}
function field(){const growth=s.grow;const pts=[];for(let i=0;i<128;i++){let z=0,x=i*TAU/128;for(let k=1;k<=12;k++){const power=Math.pow(k,p.tilt/2)*Math.exp(-p.damping*k*k);z+=power*Math.cos(k*x+s.phases[k-1]);}for(const q of s.local)z+=q.amp*Math.exp(-sq((i/127-q.x)*12));pts.push({x:i/127,y:z*growth});}return pts;}
function emergentCut(){const h=q=>entropy(q.value);let cut=0;for(const e of s.edges)if(s.region[e.a]!==s.region[e.b])cut+=h(e);return cut;}
function metric(){
 if(id==="universe"){const spread=Math.sqrt(mean(s.parts.map(b=>sq(b.x-.5)+sq(b.y-.5))));return{value:spread,unit:"rms radius",detail:"2D particle dispersion; not a cosmological scale factor"};}
 if(id==="break"){const k=p.k,t=s.time,exact=p.amplitude*Math.cos(Math.sqrt(k)*t),en0=.5*k*sq(p.amplitude),energyE=.5*(sq(s.euler.v)+k*sq(s.euler.x)),energyV=.5*(sq(s.verlet.v)+k*sq(s.verlet.x));return{value:Math.abs(s.euler.x-exact),unit:"Euler abs. error",detail:"Verlet |error| "+Math.abs(s.verlet.x-exact).toPrecision(4)+" ; Euler energy drift "+(energyE/en0-1).toPrecision(4),exact,energyE,energyV};}
 if(id==="data"){const predicted=s.ranking[0];return{value:predicted.testRMSE,unit:"holdout RMSE",detail:(s.imported?"IMPORTED CSV":"SYNTHETIC DEMO")+" / "+s.rows.length+" numerical points. Best candidate: "+predicted.name};}
 if(id==="tournament"||id==="discover"){const a=s.ranking[0];return{value:a.testRMSE,unit:"holdout RMSE",detail:"Best "+a.name+"; training AICc "+a.aicc.toFixed(2)+"; "+(s.imported?"USER CSV":"SYNTHETIC DATA")};}
 if(id==="blackhole"){const o=s.orbit;return{value:o.alpha??NaN,unit:"deflection / radians",detail:"r₀/M "+p.r0.toFixed(2)+"; weak-field estimate "+o.weak.toFixed(3)+"; "+(o.escaped?"escape orbit":"incomplete integration")};}
 if(id==="quantum"){return{value:quantumEntropy(s.amp),unit:"qubit entropy / bits",detail:"Pure-state concurrence proxy "+(2*Math.sqrt(Math.max(0,norm(sum(mul(s.amp[0],s.amp[3]),scale(mul(s.amp[1],s.amp[2]),-1)))))).toFixed(4)};}
 if(id==="initial"){let arr=field().map(q=>q.y);return{value:Math.sqrt(mean(arr.map(v=>v*v))),unit:"field RMS",detail:"Seeded prescribed Fourier spectrum, growth ×"+s.grow.toFixed(2)};}
 if(id==="emergent")return{value:emergentCut(),unit:"cut entropy / bits",detail:"Exact for independent pure entangled link-pairs (separate edge qubits)"};
 if(id==="research")return{value:s.scan?s.scan.best.testRMSE:0,unit:"holdout RMSE",detail:s.scan?"Best k="+s.scan.best.k.toFixed(4)+" after "+p.budget+" trials":"Synthetic dataset. Press RUN EXPERIMENT."};
 return{value:0,unit:"",detail:""};
}
function act(action){if(id==="quantum"){const h=1/Math.sqrt(2),theta=p.theta;
 if(action==="H0"||action==="H1")s.amp=gate1(s.amp,action==="H0"?0:1,[c(h),c(h),c(h),c(-h)]);
 else if(action==="X0")s.amp=gate1(s.amp,0,[c(),c(1),c(1),c()]);
 else if(action==="RZ0")s.amp=gate1(s.amp,0,[c(Math.cos(-theta/2),Math.sin(-theta/2)),c(),c(),c(Math.cos(theta/2),Math.sin(theta/2))]);
 else if(action==="RX1")s.amp=gate1(s.amp,1,[c(Math.cos(theta/2)),c(0,-Math.sin(theta/2)),c(0,-Math.sin(theta/2)),c(Math.cos(theta/2))]);
 else if(action==="CNOT"){[s.amp[2],s.amp[3]]=[s.amp[3],s.amp[2]];}
 else if(action==="BELL"){s.amp=[c(h),c(),c(),c(h)];}
 else if(action==="MEASURE"){const probs=s.amp.map(norm),r=rng();let cum=0,chosen=3;for(let i=0;i<4;i++){cum+=probs[i];if(r<=cum){chosen=i;break;}}s.amp=[c(),c(),c(),c()];s.amp[chosen]=c(1);s.lastMeasurement=chosen;}
 else throw Error("Unknown quantum gate");
 s.actions.push(action);s.t++;s.lastAction=action;return metric();
 }
 if(action==="RUN RANKING"&&(id==="tournament"||id==="data"||id==="discover")){s.ranking=rankModels(s.rows,id==="tournament"?p.complexity:3);s.lastAction="RANKED "+s.ranking.length+" candidate equations";return metric();}
 if(action==="RUN EXPERIMENT"&&id==="research"){s.scan=estimateK(s.rows,p.budget);s.lastAction="Scanned "+s.scan.runs.length+" bounded parameters";return metric();}
 throw Error("Action unavailable for "+id);
}
function interact(x,y,alt=false){x=clamp(x,0,.999999);y=clamp(y,0,.999999);
 if(id==="universe")for(let k=0;k<8;k++)addParticle(false,x+(rng()-.5)*.035,y+(rng()-.5)*.035);
 if(id==="break"){s.euler={x:p.amplitude*(x<.5?-1:1),v:0};s.verlet={...s.euler};s.time=0;s.t=0;s.history=[];}
 if(["data","tournament","discover"].includes(id))s.selected=Math.min(s.rows.length-1,Math.floor(x*s.rows.length));
 if(id==="blackhole"){p.r0=3.15+x*21.85;s.orbit=rkSchwarzschild(p.r0*p.mass,p.mass);s.frame=0;}
 if(id==="quantum")act(x<.5?"H0":"CNOT");
 if(id==="initial"){s.local.push({x,amp:alt?-2:2});if(s.local.length>20)s.local.shift();}
 if(id==="emergent"){const near=s.nodes.map((q,i)=>({i,dist:Math.hypot((q.x-x)*1.6,q.y-y)})).sort((a,b)=>a.dist-b.dist)[0];if(near.dist<.10&&!alt)s.region[near.i]=!s.region[near.i];else{let target=null,best=Infinity;for(const e of s.edges){const a=s.nodes[e.a],b=s.nodes[e.b],vx=(b.x-a.x)*1.6,vy=b.y-a.y,wx=(x-a.x)*1.6,wy=y-a.y,t=clamp((wx*vx+wy*vy)/(vx*vx+vy*vy),0,1),dist=Math.hypot(wx-vx*t,wy-vy*t);if(dist<best){best=dist;target=e;}}if(target&&best<.11)target.value=target.value>.25?.01:.5;}}
 if(id==="research")act("RUN EXPERIMENT");return metric();}
init();return{state:s,step:advance,metric,interact,act,field,reset:init};
}
return{MODULES,create,rngFrom,randn,mean,rmse,entropy,syntheticData,parseCSV,basis,solve,fitBasis,rankModels,rkSchwarzschild,gate1,quantumEntropy,oscillatorSeries,estimateK};
});