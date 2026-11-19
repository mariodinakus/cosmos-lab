/* COSMOS LAB — QUANTUM GRAVITY PLAYGROUND: three explicitly limited mathematical toys.
 * Entanglement network: exact entropy for a PRODUCT OF INDEPENDENT PURE LINK PAIRS.
 * Causal order: event sprinkling in a PREDEFINED flat 1+1D Minkowski spacetime.
 * Page-like curve: explicitly rematched pure Bell-pair configurations, NOT Hawking evaporation.
 */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.CosmosGravity=api;})(typeof window!=="undefined"?window:globalThis,function(){"use strict";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const MODES=[
{id:"links",title:"ENTANGLEMENT BUILDS A TOY GEOMETRY",short:"ENTANGLEMENT NETWORK",tag:"QUANTUM LINKS",question:"Can entanglement help organize an effective notion of distance?",formula:"|ψ_e⟩=√p_e|00⟩+√(1−p_e)|11⟩ ; S(A)=Σ_{e∈∂A}H₂(p_e)",params:[["strength","Pair-state p",.02,.5,.45,.01],["disorder","Link disorder",0,1,.2,.05],["bridges","Long-distance links",0,1,.25,.05],["drive","Externally driven bonds",0,1,.65,.05]],what:"The bipartite entropy of the product-of-independent-pure-link-pairs state is exactly the sum of binary entropies of links crossing your chosen partition. A minimum graph cut and weighted shortest path are additional mathematical comparisons.",limit:"Each graph edge consumes separate endpoint qubits; this is not a single-qubit-per-node state. Effective distances are chosen heuristically and DO NOT establish Einstein geometry or an AdS/CFT correspondence. The animated bond variation is an imposed sequence, not Hamiltonian evolution."},
{id:"causal",title:"CAN CAUSAL ORDER SHAPE SPACETIME?",short:"CAUSAL SET",tag:"DISCRETE CAUSALITY",question:"Can event ordering encode features of a spacetime?",formula:"i≺j ⇔ t_j>t_i and |x_j−x_i|≤c(t_j−t_i)",params:[["events","Event count",25,110,65,1],["lightspeed","Light-cone slope c",.35,2,1,.05],["spread","Spatial extent",.35,1,.85,.05]],what:"Events are sprinkled in a prescribed 1+1-dimensional Minkowski slab. Causal relations form a partial order. The longest chain is a discrete order statistic and intervals are counted exactly for the sprinkled events.",limit:"Coordinates and light cones are inputs, not spacetime derived from quantum data. A finite causal set is not a verified theory of quantum gravity. Longest-chain counts depend on sprinkling density and finite-size effects."},
{id:"page",title:"CAN INFORMATION LEAVE A BLACK HOLE?",short:"PAGE CURVE PAIR TOY",tag:"BLACK HOLE INFORMATION",question:"Why might radiation entropy first increase, then decrease in a unitary picture?",formula:"S_R(k)=Σ_{j=1}^{min(k,N−k)}H₂(p_j) ; H₂(p)=−p log₂p−(1−p)log₂(1−p)",params:[["qubits","Total qubits N (even)",8,48,28,2],["strength","Pair-state p",.02,.5,.48,.01],["disorder","Pair entropy disorder",0,1,.18,.05]],what:"At each emission step k, construct an explicit pure state of independent entangled pairs crossing the radiation–interior split plus local pure qubits. Its radiation von Neumann entropy equals the sum of link entropies and forms a Page-shaped curve.",limit:"These pure states are freshly re-paired by prescription: this is NOT a unitary dynamical evaporation model, a calculation of Hawking radiation, the black hole information solution, or the exact Page theorem for random states. A monotonic comparison curve is only a deliberately naive reference."}
];
function seeded(seed=2026){let x=seed>>>0;return()=>((x=(Math.imul(x,1664525)+1013904223)>>>0)/4294967296);}
function binaryEntropy(p){if(p<=0||p>=1)return 0;return -p*Math.log2(p)-(1-p)*Math.log2(1-p);}
function edgeEntropy(edge){return binaryEntropy(edge.p);}
function networkEdges(seed,p){const rng=seeded(seed),edges=[],N=12;
const coords=Array.from({length:N},(_,i)=>({id:i,x:.16+(i%4)*.225,y:.18+Math.floor(i/4)*.31}));
function add(a,b){if(a===b||edges.some(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a)))return;
const phase=rng()*2*Math.PI,base=clamp(p.strength+(rng()-.5)*p.disorder*.60,.003,.5);
edges.push({a,b,base,p:base,phase,manuallyEdited:false});}
for(let y=0;y<3;y++)for(let x=0;x<4;x++){const i=y*4+x;if(x<3)add(i,i+1);if(y<2)add(i,i+4);}
for(let i=0;i<N;i++)for(let j=i+2;j<N;j++)if(rng()<p.bridges*.07)add(i,j);
return {nodes:coords,edges,region:coords.map(n=>n.x<.5)};
}
function boundaryEntropy(edges,region){return edges.reduce((s,e)=>s+(region[e.a]!==region[e.b]?edgeEntropy(e):0),0);}
function minSTCut(edges,n,source=0,sink=n-1){let best=Infinity,region=null;const free=[];for(let i=0;i<n;i++)if(i!==source&&i!==sink)free.push(i);
for(let mask=0;mask<(1<<free.length);mask++){const a=new Array(n).fill(false);a[source]=true;for(let k=0;k<free.length;k++)if(mask&(1<<k))a[free[k]]=true;
const v=boundaryEntropy(edges,a);if(v<best-1e-9){best=v;region=a;}}
return{value:best,region};
}
function shortestLinkPath(edges,n,source=0,sink=n-1){const d=new Array(n).fill(Infinity),prev=new Array(n).fill(-1),used=new Array(n).fill(false);d[source]=0;
for(let step=0;step<n;step++){let u=-1;for(let i=0;i<n;i++)if(!used[i]&&(u<0||d[i]<d[u]))u=i;if(u===-1||!Number.isFinite(d[u]))break;used[u]=true;if(u===sink)break;
for(const e of edges){let v=-1;if(e.a===u)v=e.b;else if(e.b===u)v=e.a;if(v<0)continue;const alt=d[u]+1/(.05+edgeEntropy(e));if(alt<d[v]){d[v]=alt;prev[v]=u;}}}
const path=[];if(Number.isFinite(d[sink])){let v=sink;for(let i=0;i<=n;i++){path.push(v);if(v===source)break;v=prev[v];if(v<0)return{distance:Infinity,path:[]};}path.reverse();}
return{distance:d[sink],path};
}
function buildCausal(seed,p){const rng=seeded(seed),events=[];const n=Math.round(p.events);
for(let i=0;i<n;i++)events.push({id:i,t:rng(),x:(rng()*2-1)*p.spread});
events.sort((a,b)=>a.t-b.t||a.id-b.id);
events.forEach((e,i)=>e.id=i);
return events;
}
function causallyBefore(a,b,c){const dt=b.t-a.t;return dt>0&&Math.abs(b.x-a.x)<=c*dt+1e-12;}
function causalStats(events,c){const n=events.length,dp=new Array(n).fill(1),parent=new Array(n).fill(-1);let relationCount=0,lastIndex=-1,maxDepth=0;
for(let i=0;i<n;i++)for(let j=0;j<i;j++)if(causallyBefore(events[j],events[i],c)){relationCount++;if(dp[j]+1>dp[i]){dp[i]=dp[j]+1;parent[i]=j;}}
for(let i=0;i<n;i++)if(dp[i]>maxDepth){maxDepth=dp[i];lastIndex=i;}
const longest=[];for(let i=lastIndex;i>=0;i=parent[i]){longest.push(i);if(parent[i]<0)break;}longest.reverse();
return{maxDepth,relationCount,causalFraction:n<2?0:relationCount/(n*(n-1)/2),longest};
}
function causalInterval(events,c,source,sink){if(!Number.isInteger(source)||!Number.isInteger(sink)||source<0||sink<0||source>=events.length||sink>=events.length)return{count:0,valid:false};
if(!causallyBefore(events[source],events[sink],c))return{count:0,valid:false};
let count=0;for(let k=0;k<events.length;k++)if(k!==source&&k!==sink&&causallyBefore(events[source],events[k],c)&&causallyBefore(events[k],events[sink],c))count++;
return{count,valid:true};
}
function pairWeights(n,strength,disorder,seed){const rng=seeded(seed),count=n/2,weights=[];
for(let i=0;i<count;i++)weights.push(clamp(strength+(rng()-.5)*disorder*.80,.001,.5));
return weights;}
function pageEntropy(weights,k){const N=weights.length*2,cross=Math.min(Math.max(0,Math.floor(k)),N-Math.min(N,Math.max(0,Math.floor(k))));
let sum=0;for(let i=0;i<cross;i++)sum+=binaryEntropy(weights[i]);return sum;}
function pageCurve(weights){return Array.from({length:weights.length*2+1},(_,k)=>({k,entropy:pageEntropy(weights,k)}));}
function make(id,settings={},seed=2026){const spec=MODES.find(m=>m.id===id);if(!spec)throw Error("Unknown toy "+id);
const p=Object.fromEntries(spec.params.map(([key,,min,max,start,step])=>{const raw=Number(settings[key]),v=Number.isFinite(raw)?raw:start;const rounded=step===1||step===2?Math.round(v/step)*step:v;return[key,clamp(rounded,min,max)];}));
const state={id,seed,params:p,spec,tick:0,history:[],selected:{},lastEvent:null};
function initialize(){state.tick=0;state.history=[];if(id==="links"){const a=networkEdges(seed,p);state.nodes=a.nodes;state.edges=a.edges;state.region=a.region;state.picked=-1;state.motion=0;state.stats={};}if(id==="causal"){state.events=buildCausal(seed,p);state.visible=3;state.picked=[];state.stats={};}if(id==="page"){state.weights=pairWeights(p.qubits,p.strength,p.disorder,seed);state.k=0;state.curve=pageCurve(state.weights);}}
function metric(){
 if(id==="links"){const entropy=boundaryEntropy(state.edges,state.region),minimum=minSTCut(state.edges,state.nodes.length),shortest=shortestLinkPath(state.edges,state.nodes.length);return{value:entropy,unit:"bits / selected cut",detail:"Exact entropy for selected cut of independent link-pair product state",minimum:minimum.value,minimumPartition:minimum.region,shortest:shortest.distance,path:shortest.path,source:0,sink:state.nodes.length-1};}
 if(id==="causal"){const visible=state.events.slice(0,state.visible),stats=causalStats(visible,p.lightspeed);let interval={count:0,valid:false};if(state.picked.length===2){const [a,b]=state.picked.slice().sort((x,y)=>x-y);if(b<state.visible)interval=causalInterval(visible,p.lightspeed,a,b);}
 return{value:stats.maxDepth,unit:"longest causal chain",detail:"Finite sprinkle in an assumed 1+1D Minkowski spacetime",...stats,intervalCount:interval.count,intervalValid:interval.valid,visible:visible.length};}
 const entropy=pageEntropy(state.weights,state.k),naive=state.k*binaryEntropy(p.strength);
 return{value:entropy,unit:"radiation entropy / bits",detail:"Exact for constructed independent pure pair states, not Hawking evaporation",emitted:state.k,total:p.qubits,naive,peak:Math.max(...state.curve.map(q=>q.entropy)),curve:state.curve,crossings:Math.min(state.k,p.qubits-state.k)};
}
function step(){
 state.tick++;
 if(id==="links"){state.edges.forEach(e=>{e.p=clamp(e.base+.065*p.drive*Math.sin(state.tick*.055+e.phase),.001,.5);});}
 if(id==="causal")state.visible=Math.min(state.events.length,3+Math.floor(state.tick/2));
 if(id==="page")state.k=state.k>=p.qubits?0:state.k+1;
 const m=metric();
 if(state.tick%2===0){state.history.push({t:state.tick,y:m.value});if(state.history.length>600)state.history.shift();}
 return m;
}
function interact(x,y,alt=false){
 x=clamp(x,0,1);y=clamp(y,0,1);
 if(id==="links"){
  const near=state.nodes.map(n=>({n,d:Math.hypot((n.x-x)*1.4,n.y-y)})).sort((a,b)=>a.d-b.d)[0];
  if(near?.d<.075&&!alt){state.region[near.n.id]=!state.region[near.n.id];state.picked=near.n.id;}
  else{let best=null,dist=Infinity;
   for(const e of state.edges){const a=state.nodes[e.a],b=state.nodes[e.b],ux=(b.x-a.x)*1.4,uy=b.y-a.y,vx=(x-a.x)*1.4,vy=y-a.y,den=ux*ux+uy*uy,projection=clamp((vx*ux+vy*uy)/den,0,1),d=Math.hypot(vx-ux*projection,vy-uy*projection);if(d<dist){dist=d;best=e;}}
   if(best&&dist<.085){best.base=best.base>.3?.025:.5;best.p=best.base;best.manuallyEdited=true;state.lastEvent={edge:[best.a,best.b],p:best.p};}
  }
 }else if(id==="causal"){
  const events=state.events.slice(0,state.visible),nearest=events.map(e=>({id:e.id,d:Math.hypot((e.x/(2*p.spread)+.5-x)*1.5,1-e.t-y)})).sort((a,b)=>a.d-b.d)[0];
  if(nearest?.d<.065){state.picked=state.picked.length===2?[nearest.id]:[...state.picked,nearest.id];state.lastEvent={selected:state.picked.slice()};}
 }else if(id==="page"){state.k=Math.max(0,Math.min(p.qubits,Math.round(x*p.qubits)));state.tick=0;state.history=[];}
 return metric();
}
initialize();return{state,metric,step,interact,reset:initialize};
}
return{MODES,clamp,seeded,binaryEntropy,networkEdges,boundaryEntropy,minSTCut,shortestLinkPath,buildCausal,causallyBefore,causalStats,causalInterval,pairWeights,pageEntropy,pageCurve,make};
});