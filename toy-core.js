/* COSMOS LAB / Toy Universe — standalone bounded, seeded computational models.
   Toy models are explicitly simplified: no experimental validation is implied. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.CosmosToyCore=api;})(typeof window!=="undefined"?window:globalThis,function(){"use strict";
const TAU=2*Math.PI,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const MODES=[
{id:"wave",name:"Wave Universe",tag:"WAVES",desc:"2D finite-difference wave equation. Tap to launch a pulse; Shift+tap to draw a barrier.",formula:"u(t+Δt) = 2u(t)−u(t−Δt) + c²Δt²∇²u",params:[["speed","Wave speed",.3,1.3,.85,.05],["loss","Damping",0,1,.10,.05]],help:"Tap: pulse. Shift+tap: toggle obstacle. Fixed zero-value boundaries."},
{id:"heat",name:"Heat Diffusion",tag:"PDE",desc:"Inject warmth or cold into a 2D surface and watch diffusion.",formula:"∂T/∂t = α ∇²T − κT",params:[["diff","Diffusion",.2,1.8,.95,.05],["cool","Cooling",0,1,.2,.05]],help:"Tap to add heat; Shift+tap to cool. Explicit stable finite differences."},
{id:"life",name:"Game of Life",tag:"EMERGENCE",desc:"Conway's B3/S23 cellular automaton with live editing.",formula:"Birth on 3 neighbors; survival on 2 or 3",params:[["density","Initial density",.05,.7,.27,.01]],help:"Click a cell to toggle it. Change density to regenerate."},
{id:"ant",name:"Langton's Ant",tag:"EMERGENCE",desc:"An ant turns according to a binary grid; elaborate patterns emerge.",formula:"White: turn right, flip; Black: turn left, flip",params:[["steps","Moves / frame",1,75,14,1]],help:"Tap to move the ant. Shift+tap flips a tile."},
{id:"sand",name:"Sandpile Avalanches",tag:"CRITICALITY",desc:"Abelian sandpile: grains topple when four accumulate.",formula:"hᵢ≥4 ⇒ hᵢ←hᵢ−4; neighbors +1",params:[["rain","Grains / tick",0,60,14,1]],help:"Tap to deposit 240 grains; Shift+tap to remove grains."},
{id:"percolation",name:"Percolation Threshold",tag:"PROBABILITY",desc:"Random site percolation with clusters connected from left edge.",formula:"Occupied site probability p; span probability emerges near threshold",params:[["p","Site probability",.35,.75,.59,.005],["refresh","Refresh / frames",5,120,40,5]],help:"Tap a cell to open/close it. Press 'Reseed' to draw another random lattice."},
{id:"boids",name:"Flocking Intelligence",tag:"EMERGENCE",desc:"Autonomous agents respond to alignment, cohesion and separation.",formula:"v̇ = F_alignment + F_cohesion + F_separation",params:[["align","Alignment",0,2,.9,.05],["cohere","Cohesion",0,2,.65,.05],["separate","Separation",0,3,1.1,.05]],help:"Tap to move the flock's attractor. Stylized flocking, not animal prediction."},
{id:"field",name:"Field Architect",tag:"ELECTROMAGNETISM",desc:"Place positive and negative charges and watch passive tracers respond.",formula:"E(r) ∝ Σ qᵢ(r−rᵢ)/(|r−rᵢ|²+ε²)^(3/2)",params:[["strength","Field strength",.2,2.5,.9,.05],["tracers","Tracer speed",.1,2,1,.05]],help:"Tap: positive charge. Shift+tap: negative charge. Softened electrostatics."},
{id:"kuramoto",name:"Synchronization",tag:"COLLECTIVE DYNAMICS",desc:"Oscillators with distinct natural frequencies may spontaneously synchronize.",formula:"dθᵢ/dt = ωᵢ + K R sin(ψ−θᵢ)",params:[["K","Coupling K",0,5,2.3,.05],["spread","Frequency spread",.05,2,.7,.05]],help:"Tap the circular view to set an oscillator's phase. Order parameter R measures coherence."},
{id:"henon",name:"Hénon Attractor",tag:"CHAOS",desc:"Iterate a quadratic two-dimensional map and discover an attractor.",formula:"x(n+1)=1−ax(n)²+y(n); y(n+1)=bx(n)",params:[["a","Parameter a",1.0,1.43,1.4,.005],["b","Parameter b",.12,.33,.3,.005]],help:"Tap to select a new starting point. Trajectories may escape for some parameters."},
{id:"epidemic",name:"Epidemic Networks",tag:"NETWORKS",desc:"Stochastic SIR diffusion on a fixed spatial contact graph.",formula:"S → I with probability β/contact; I → R with probability γ/tick",params:[["beta","Transmission",.01,.6,.26,.01],["gamma","Recovery",.01,.35,.08,.01]],help:"Tap a node to infect it. Toy model, never a forecast."},
{id:"orbit",name:"Orbital Architect",tag:"GRAVITY",desc:"Massless test particles orbit a fixed central mass, with velocity-Verlet integration.",formula:"r̈=−GM r / (|r|²+ε²)^(3/2)",params:[["mass","Central mass",.3,2,1,.05],["boost","Circular velocity scale",.6,1.4,1,.025]],help:"Tap to insert an orbiter with tangential velocity. Central star is fixed."},
{id:"fourier",name:"Fourier Composer",tag:"SIGNALS",desc:"Build and animate a complex wave using a finite set of sine harmonics.",formula:"f(x,t)=Σₙ sin(nx−ωnt)/n^α",params:[["terms","Harmonics",1,25,9,1],["decay","Amplitude exponent",.5,3,1.25,.05],["freq","Phase speed",0,2,.65,.05]],help:"Tap horizontally to set the phase origin; wave sum is illustrative."},
{id:"dla",name:"Crystal Growth",tag:"STOCHASTIC",desc:"Diffusion-limited aggregation from random walkers sticking to a growing cluster.",formula:"Random walk + irreversible nearest-neighbor attachment",params:[["walkers","Walkers / tick",1,80,14,1]],help:"Tap to add a fixed seed. This is a bounded lattice approximation."},
{id:"newton",name:"Newton Fractal",tag:"COMPLEX ANALYSIS",desc:"Basins of attraction for roots of z³−1 under Newton iteration.",formula:"z(n+1) = z(n) − (z(n)³−1)/(3z(n)²)",params:[["zoom","Field of view",.55,3,1.7,.05],["depth","Max iterations",3,35,18,1]],help:"Click a point in the complex plane to trace its Newton iterations."}
];
function seeded(seed=12345){let s=seed>>>0;return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
function newtonStep(z){const x=z.x,y=z.y,a=3*(x*x-y*y),b=6*x*y,d=a*a+b*b;if(d<1e-15)return{x:NaN,y:NaN};const c=x*x*x-3*x*y*y-1,e=3*x*x*y-y*y*y;return{x:x-(c*a+e*b)/d,y:y-(e*a-c*b)/d};}
function newtonPoint(x,y,maxIter=25){let z={x,y},k=0;const roots=[{x:1,y:0},{x:-.5,y:Math.sqrt(3)/2},{x:-.5,y:-Math.sqrt(3)/2}];for(;k<maxIter;k++){const nearest=roots.findIndex(q=>Math.hypot(z.x-q.x,z.y-q.y)<1e-5);if(nearest>=0)return{root:nearest,iterations:k,x:z.x,y:z.y};z=newtonStep(z);if(!Number.isFinite(z.x)||!Number.isFinite(z.y)||Math.max(Math.abs(z.x),Math.abs(z.y))>1e9)break;}return{root:-1,iterations:k,x:z.x,y:z.y};}
function create(id,values={},seed=1729){
 const spec=MODES.find(m=>m.id===id);if(!spec)throw Error("Unknown toy model "+id);
 const p=Object.fromEntries(spec.params.map(([key,,min,max,initial])=>[key,clamp(Number.isFinite(Number(values[key]))?Number(values[key]):initial,min,max)]));
 const rng=seeded(seed),s={id,spec,p,t:0,seed};
 const W=96,H=64,wh=W*H;
 const ix=(x,y)=>y*W+x;
 const grid=()=>new Uint8Array(wh);
 const rnd=(a,b)=>a+(b-a)*rng();
 const target=(x,y)=>({x:clamp(x,0,.999999),y:clamp(y,0,.999999)});
 function regenerate(){
   s.t=0;s.history=[];s.metric=0;s.detail="";
   if(id==="wave"){s.u=new Float32Array(wh);s.v=new Float32Array(wh);s.next=new Float32Array(wh);s.wall=grid();pulse(.38,.5,1);pulse(.62,.5,-1);}
   else if(id==="heat"){s.u=new Float32Array(wh);s.next=new Float32Array(wh);pulse(.43,.5,2);}
   else if(id==="life"){s.u=grid();s.next=grid();for(let i=0;i<wh;i++)s.u[i]=rng()<p.density?1:0;}
   else if(id==="ant"){s.u=grid();s.ant={x:W>>1,y:H>>1,dir:0};}
   else if(id==="sand"){s.u=new Uint32Array(wh);s.u[ix(W>>1,H>>1)]=800;s.toppled=0;}
   else if(id==="percolation"){percoInit();}
   else if(id==="boids"){s.agents=Array.from({length:90},()=>({x:rng(),y:rng(),vx:rnd(-.01,.01),vy:rnd(-.01,.01)}));s.target={x:.5,y:.5};}
   else if(id==="field"){s.charges=[{x:.3,y:.5,q:1},{x:.7,y:.5,q:-1}];s.tracers=Array.from({length:160},()=>({x:rng(),y:rng()}));}
   else if(id==="kuramoto"){s.phases=Array.from({length:120},()=>rnd(0,TAU));s.freq=s.phases.map(()=>rnd(-1,1));}
   else if(id==="henon"){s.xy={x:.1,y:.2};s.points=[];}
   else if(id==="epidemic"){s.agents=Array.from({length:145},()=>({x:rng(),y:rng(),state:0}));for(let j=0;j<4;j++)s.agents[j].state=1;}
   else if(id==="orbit"){s.bodies=[];for(let i=0;i<6;i++)makeOrbit(.18+i*.048,.3+(i%2)*.08);}
   else if(id==="fourier"){s.phase=0;s.cursor=.5;}
   else if(id==="dla"){s.cols=100;s.rows=72;s.u=new Uint8Array(100*72);s.u[36*100+50]=1;s.radius=1;s.count=1;s.walkers=Array.from({length:70},spawnWalker);}
   else if(id==="newton"){s.selected={x:.5,y:.4};s.path=[{...s.selected}];}
   s.metric=measure().value;
 }
 function pulse(x,y,intensity=1){const cx=Math.floor(clamp(x,0,.999)*W),cy=Math.floor(clamp(y,0,.999)*H);for(let dy=-8;dy<=8;dy++)for(let dx=-8;dx<=8;dx++){const X=cx+dx,Y=cy+dy;if(X<1||Y<1||X>=W-1||Y>=H-1)continue;const z=Math.exp(-(dx*dx+dy*dy)/16)*intensity;s.u[ix(X,Y)]+=z;}}
 function percoInit(){s.u=grid();s.wet=grid();for(let i=0;i<wh;i++)s.u[i]=rng()<p.p?1:0;percoFlood();}
 function percoFlood(){s.wet.fill(0);let q=new Int32Array(wh),h=0,tail=0;for(let y=0;y<H;y++){const j=ix(0,y);if(s.u[j]){s.wet[j]=1;q[tail++]=j;}}let spanning=false;while(h<tail){const j=q[h++],x=j%W,y=(j/W)|0;if(x===W-1)spanning=true;for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]])if(nx>=0&&nx<W&&ny>=0&&ny<H){const k=ix(nx,ny);if(s.u[k]&&!s.wet[k]){s.wet[k]=1;q[tail++]=k;}}}s.spanning=spanning;s.wetCount=tail;}
 function makeOrbit(x,y){if(s.bodies.length>=30)s.bodies.shift();let dx=x-.5,dy=y-.5,r=Math.max(.075,Math.hypot(dx,dy));const vel=p.boost*Math.sqrt(p.mass/r)*.009;s.bodies.push({x,y,vx:-dy/r*vel,vy:dx/r*vel,trail:[],r});}
 function spawnWalker(){const a=rnd(0,TAU),r=clamp(s.radius+9,10,Math.min(s.cols,s.rows)*.48);return{x:Math.round(s.cols/2+Math.cos(a)*r),y:Math.round(s.rows/2+Math.sin(a)*r)};}
 function interact(x,y,shift=false){
   ({x,y}=target(x,y));
   if(id==="wave"){if(shift){const xx=Math.floor(x*W),yy=Math.floor(y*H);for(let k=-2;k<=2;k++){let j=ix(xx,clamp(yy+k,1,H-2));s.wall[j]^=1;s.u[j]=0;s.v[j]=0;}}else pulse(x,y,3*(shift?-1:1));}
   else if(id==="heat")pulse(x,y,shift?-10:10);
   else if(id==="life"){const j=ix(Math.floor(x*W),Math.floor(y*H));s.u[j]^=1;}
   else if(id==="ant"){const xx=Math.floor(x*W),yy=Math.floor(y*H);if(shift)s.u[ix(xx,yy)]^=1;else {s.ant.x=xx;s.ant.y=yy;}}
   else if(id==="sand"){const j=ix(Math.floor(x*W),Math.floor(y*H));s.u[j]=shift?Math.max(0,s.u[j]-200):s.u[j]+240;}
   else if(id==="percolation"){const j=ix(Math.floor(x*W),Math.floor(y*H));s.u[j]^=1;percoFlood();}
   else if(id==="boids")s.target={x,y};
   else if(id==="field"){if(s.charges.length>=12)s.charges.shift();s.charges.push({x,y,q:shift?-1:1});}
   else if(id==="kuramoto"){const k=clamp(Math.floor(x*s.phases.length),0,s.phases.length-1);s.phases[k]=Math.atan2(y-.5,x-.5);}
   else if(id==="henon"){s.xy={x:(x-.5)*3,y:(.5-y)*1.4};s.points=[];}
   else if(id==="epidemic"){let near=s.agents[0],d=Infinity;for(const a of s.agents){const z=(a.x-x)**2+(a.y-y)**2;if(z<d){near=a;d=z;}}if(near)near.state=1;}
   else if(id==="orbit")makeOrbit(x,y);
   else if(id==="fourier")s.cursor=x;
   else if(id==="dla"){const xx=clamp(Math.floor(x*s.cols),0,s.cols-1),yy=clamp(Math.floor(y*s.rows),0,s.rows-1),j=yy*s.cols+xx;if(!s.u[j]){s.u[j]=1;s.count++;}}
   else if(id==="newton"){const z=p.zoom;s.selected={x:(x-.5)*2*z,y:(.5-y)*2*z};s.path=[{...s.selected}];}
 }
 function update(){
   s.t++;
   if(id==="wave"){
     const k=.14*p.speed*p.speed;
     for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const j=ix(x,y);
       if(s.wall[j]){s.next[j]=0;continue;}const lap=s.u[j-1]+s.u[j+1]+s.u[j-W]+s.u[j+W]-4*s.u[j];
       s.next[j]=clamp(2*s.u[j]-s.v[j]+k*lap-p.loss*.007*(s.u[j]-s.v[j]),-30,30);
     }const old=s.v;s.v=s.u;s.u=s.next;s.next=old;
   }else if(id==="heat"){const a=.115*p.diff;for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const j=ix(x,y),z=s.u[j];s.next[j]=clamp(z+a*(s.u[j-1]+s.u[j+1]+s.u[j-W]+s.u[j+W]-4*z)-p.cool*.003*z,-15,15);}const old=s.u;s.u=s.next;s.next=old;}
   else if(id==="life"){for(let y=0;y<H;y++)for(let x=0;x<W;x++){let neighbors=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(dx===0&&dy===0)continue;neighbors+=s.u[ix((x+dx+W)%W,(y+dy+H)%H)];}const j=ix(x,y);s.next[j]=neighbors===3||(s.u[j]&&neighbors===2)?1:0;}const old=s.u;s.u=s.next;s.next=old;}
   else if(id==="ant"){for(let k=0;k<p.steps;k++){const a=s.ant,j=ix(a.x,a.y),black=s.u[j];a.dir=(a.dir+(black?3:1))%4;s.u[j]^=1;a.x=(a.x+[0,1,0,-1][a.dir]+W)%W;a.y=(a.y+[-1,0,1,0][a.dir]+H)%H;}}
   else if(id==="sand"){const j=ix(W>>1,H>>1);s.u[j]+=p.rain;let top=0;for(let pass=0;pass<8;pass++)for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const j=ix(x,y),n=Math.min(100,Math.floor(s.u[j]/4));if(n){s.u[j]-=4*n;s.u[j-1]+=n;s.u[j+1]+=n;s.u[j-W]+=n;s.u[j+W]+=n;top+=n;}}s.toppled=top;}
   else if(id==="percolation"){if(s.t%p.refresh===0)percoInit();}
   else if(id==="boids"){
     const agents=s.agents,updates=[];for(const a of agents){let ax=0,ay=0,cx=0,cy=0,sx=0,sy=0,c=0;
       for(const b of agents){if(a===b)continue;let dx=b.x-a.x,dy=b.y-a.y;if(dx>.5)dx-=1;if(dx<-.5)dx+=1;if(dy>.5)dy-=1;if(dy<-.5)dy+=1;const d2=dx*dx+dy*dy;if(d2<.012){ax+=b.vx;ay+=b.vy;cx+=dx;cy+=dy;c++;if(d2<.003){sx-=dx/(d2+.0002);sy-=dy/(d2+.0002);}}}
       let vx=a.vx,vy=a.vy;if(c){vx+=.013*p.align*(ax/c-a.vx)+.0012*p.cohere*cx/c+.00004*p.separate*sx;vy+=.013*p.align*(ay/c-a.vy)+.0012*p.cohere*cy/c+.00004*p.separate*sy;}
       vx+=.00014*(s.target.x-a.x);vy+=.00014*(s.target.y-a.y);
       const d=Math.hypot(vx,vy)||1;vx=vx/d*.007;vy=vy/d*.007;
       updates.push({vx,vy,x:(a.x+vx+1)%1,y:(a.y+vy+1)%1});
     }updates.forEach((u,i)=>Object.assign(agents[i],u));
   }else if(id==="field"){for(const tracer of s.tracers){let fx=0,fy=0;for(const q of s.charges){const dx=tracer.x-q.x,dy=tracer.y-q.y,d=(dx*dx+dy*dy+.004)**1.5;fx+=q.q*dx/d;fy+=q.q*dy/d;}const z=Math.hypot(fx,fy)||1;tracer.x=(tracer.x+clamp(fx/z,-1,1)*.005*p.strength*p.tracers+1)%1;tracer.y=(tracer.y+clamp(fy/z,-1,1)*.005*p.strength*p.tracers+1)%1;}}
   else if(id==="kuramoto"){let mx=0,my=0;for(const ph of s.phases){mx+=Math.cos(ph);my+=Math.sin(ph);}mx/=s.phases.length;my/=s.phases.length;const R=Math.hypot(mx,my),psi=Math.atan2(my,mx);for(let i=0;i<s.phases.length;i++)s.phases[i]+= .09*(p.spread*s.freq[i]+p.K*R*Math.sin(psi-s.phases[i]));}
   else if(id==="henon"){for(let k=0;k<30;k++){let {x,y}=s.xy;const nx=1-p.a*x*x+y,ny=p.b*x;if(!Number.isFinite(nx)||Math.abs(nx)>1e5){s.xy={x:.1,y:.2};break;}s.xy={x:nx,y:ny};s.points.push({x:nx,y:ny});if(s.points.length>4500)s.points.shift();}}
   else if(id==="epidemic"){const a=s.agents,next=new Uint8Array(a.length);for(let i=0;i<a.length;i++){const person=a[i];next[i]=person.state;if(person.state===1&&rng()<p.gamma)next[i]=2;if(person.state===0){let exposure=0;for(const other of a)if(other.state===1&&(other.x-person.x)**2+(other.y-person.y)**2<.015)exposure++;if(exposure&&rng()<1-(1-p.beta)**exposure)next[i]=1;}}a.forEach((q,i)=>q.state=next[i]);}
   else if(id==="orbit"){for(const b of s.bodies){const accel=(x,y)=>{let dx=x-.5,dy=y-.5,d=(dx*dx+dy*dy+.00015)**1.5;return{ax:-.00012*p.mass*dx/d,ay:-.00012*p.mass*dy/d};};const a=accel(b.x,b.y);b.vx+=a.ax*.5;b.vy+=a.ay*.5;b.x+=b.vx;b.y+=b.vy;const aa=accel(b.x,b.y);b.vx+=aa.ax*.5;b.vy+=aa.ay*.5;if(b.trail.length>280)b.trail.shift();b.trail.push([b.x,b.y]);}}
   else if(id==="fourier"){s.phase+=.045*p.freq;}
   else if(id==="dla"){for(let k=0;k<p.walkers;k++){const j=k%s.walkers.length,walk=s.walkers[j];const v=(rng()*4)|0;walk.x+=v===0?1:v===1?-1:0;walk.y+=v===2?1:v===3?-1:0;const {x,y}=walk;if(x<2||x>=s.cols-2||y<2||y>=s.rows-2){s.walkers[j]=spawnWalker();continue;}const pos=y*s.cols+x;if(s.u[pos]||s.u[pos-1]||s.u[pos+1]||s.u[pos-s.cols]||s.u[pos+s.cols]){if(!s.u[pos]){s.u[pos]=1;s.count++;s.radius=Math.max(s.radius,Math.hypot(x-s.cols/2,y-s.rows/2));}s.walkers[j]=spawnWalker();}}}
   else if(id==="newton"){if(s.path.length<35){const cur=s.path[s.path.length-1],next=newtonStep(cur);if(Number.isFinite(next.x)&&Number.isFinite(next.y)&&Math.max(Math.abs(next.x),Math.abs(next.y))<1e8)s.path.push(next);}}
   const m=measure();s.metric=m.value;s.detail=m.detail;if(s.t%2===0){s.history.push({t:s.t,y:s.metric});if(s.history.length>480)s.history.shift();}
   return s.metric;
 }
 function measure(){
   if(id==="wave"||id==="heat"){let energy=0;for(const a of s.u)energy+=a*a;return{value:Math.sqrt(energy/wh),unit:"RMS",detail:"Field amplitude (numerical)"};}
   if(id==="life"||id==="ant"){let active=0;for(const a of s.u)active+=a;return{value:active/wh,unit:"fraction",detail:"Active grid fraction"};}
   if(id==="sand")return{value:s.toppled||0,unit:"topples",detail:"Topples per iteration (finite-pass approximation)"};
   if(id==="percolation")return{value:s.spanning?1:0,unit:"0 / 1",detail:"Left-to-right occupied path: "+(s.spanning?"YES":"NO")};
   if(id==="boids"){let x=0,y=0;for(const q of s.agents){x+=q.vx;y+=q.vy;}return{value:Math.hypot(x,y)/s.agents.length/.007,unit:"order",detail:"Directional alignment R∈[0,1]"};}
   if(id==="field")return{value:s.charges.reduce((a,b)=>a+b.q,0),unit:"net q",detail:"Total source charge (softened)"};
   if(id==="kuramoto"){let x=0,y=0;for(const a of s.phases){x+=Math.cos(a);y+=Math.sin(a);}return{value:Math.hypot(x,y)/s.phases.length,unit:"R",detail:"Kuramoto mean-field order parameter"};}
   if(id==="henon")return{value:s.points.length,unit:"points",detail:"Attractor iterates retained"};
   if(id==="epidemic")return{value:s.agents.filter(a=>a.state===1).length/s.agents.length,unit:"infected",detail:"Infected fraction; synthetic graph"};
   if(id==="orbit"){let total=0;for(const b of s.bodies)total+=.5*(b.vx*b.vx+b.vy*b.vy)-.00012*p.mass/Math.sqrt((b.x-.5)**2+(b.y-.5)**2+.00015);return{value:total,unit:"energy",detail:"Test-particle total scaled energy"};}
   if(id==="fourier"){let y=0;for(let n=1;n<=p.terms;n++)y+=Math.sin(n*(TAU*s.cursor-s.phase))/n**p.decay;return{value:y,unit:"amplitude",detail:"Wave at selected phase"};}
   if(id==="dla")return{value:s.count,unit:"sites",detail:"Attached cluster sites"};
   if(id==="newton"){let z=s.path[s.path.length-1]||s.selected;const a=z.x,b=z.y;return{value:Math.hypot(a*a*a-3*a*b*b-1,3*a*a*b-b*b*b),unit:"|z³−1|",detail:"Residual at latest Newton iteration"};}
   return{value:0,unit:"",detail:""};
 }
 regenerate();
 return{state:s,step:update,interact,reset:regenerate,measure};
}
return{MODES,create,seeded,clamp,newtonStep,newtonPoint};
});