/* COSMOS LAB command palette: Ctrl/Cmd+K (or "/") searches every page, 301 atlas models and all playable toy models. */
(function(){"use strict";
if(window.__cosmosPalette)return;window.__cosmosPalette=true;
const STYLE=`#cmdk-back{position:fixed;inset:0;background:#030607cc;z-index:9999;display:none;align-items:flex-start;justify-content:center;padding-top:11vh}
#cmdk-back.open{display:flex}
#cmdk{width:min(720px,92vw);background:#fff;border:3px solid #080e11;box-shadow:0 0 0 4px #00d4e8;max-height:70vh;display:flex;flex-direction:column;font-family:Inter,Arial,sans-serif}
#cmdk input{border:0;border-bottom:3px solid #080e11;padding:18px;font-size:17px;outline:none;background:#f7fcfd}
#cmdk ul{list-style:none;margin:0;padding:0;overflow:auto}
#cmdk li{padding:11px 16px;border-bottom:1px solid #d5e5e8;display:grid;grid-template-columns:62px 1fr auto;gap:12px;cursor:pointer;align-items:baseline}
#cmdk li b{font-size:10px;letter-spacing:.8px;color:#007d8d}#cmdk li span{font-weight:800;font-size:14px}#cmdk li small{font-size:11px;color:#35545d;grid-column:2/3}
#cmdk li em{font-style:normal;font-size:9px;font-weight:900;letter-spacing:.8px;background:#e9faff;border:1px solid #00abc3;padding:2px 6px}
#cmdk li.sel{background:#00d4e8}#cmdk li.sel b,#cmdk li.sel small{color:#080e11}
#cmdk .foot{padding:8px 14px;font-size:10px;font-weight:800;letter-spacing:.6px;color:#35545d;background:#eef9fb;display:flex;justify-content:space-between}`;
const PAGES=[
 ["Toy → Reality","/verify.html","Planck vs COBE CMB, Mercury perihelion GR, Kepler, Lotka-Volterra hare lynx, earthquakes USGS b-value"],
 ["Genesis Lab","/genesis.html","Big Bang, inflation, multiverse, universe from nothing, vacuum bubbles"],
 ["Riemann Zeta Lab","/riemann.html","Critical line, Z(t), zeros, GUE spacing, prime numbers"],
 ["Real Cosmology Data","/data.html","Pantheon+ supernovae, chi-squared fit, LCDM vs wCDM, dark energy"],
 ["Learning Paths","/paths.html","Guided routes through the labs"],
 ["Research Observatory","/observatory.html","Four live simulations, LCDM fit, residuals, data upload"],
 ["Visual Studio","/studio.html","Bloch sphere, Lorenz, N-body, wave fields, reaction-diffusion"],
 ["Chaos Forge","/chaos.html","Logistic map, bifurcation, Lyapunov exponent"],
 ["Toy Universe","/toybox.html","15 playable worlds: waves, boids, percolation, fractals"],
 ["Frontier Questions","/frontier.html","Why is there something, vacuum, tunnelling, inflation, gauge unification"],
 ["Quantum Gravity Playground","/gravity.html","Entanglement networks, causal sets, Page curve"],
 ["COSMOS ∞ Reality Engine","/reality.html","Toy universes, Schwarzschild photons, qubits, equation search"],
 ["Research Radar","/radar.html","Recent papers and official science news"],
 ["Open Problems","/open.html","31 unsolved questions across disciplines"],
 ["All Labs Hub","/hub.html","Every workspace and playable model"],
 ["Model Atlas and Continuous Lab","/","301 equations, numerical experiments, research journal"]
].map(p=>({kind:"PAGE",title:p[0],href:p[1],desc:p[2],hay:(p[0]+" "+p[2]).toLowerCase()}));
let items=null,loading=null,back,box,input,list,sel=0,shown=[];
function load(src,test){return new Promise(res=>{if(test()){res();return;}const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=res;document.head.appendChild(s);});}
function build(){
  const models=(window.COSMOS_MODELS||[]).map(m=>({kind:m.id,title:m.name,href:"/?model="+m.id,desc:m.category+" · "+m.description,hay:(m.id+" "+m.name+" "+m.category+" "+m.description+" "+m.expr).toLowerCase()}));
  const toys=(window.COSMOS_HUB_MODELS||[]).map(m=>{const t=m.id.replace(/[-_]/g," ").replace(/\b\w/g,c=>c.toUpperCase()),pg=(m.href.split("?")[0].replace(/^\//,"").replace(".html","")||"home"),pgn=pg==="toybox"?"Toy Universe":pg.charAt(0).toUpperCase()+pg.slice(1);return{kind:(m.tag||"TOY").slice(0,9),title:t+" · "+pgn,href:m.href,desc:(m.question||"").slice(0,140),hay:(m.id+" "+pg+" "+(m.tag||"")+" "+(m.category||"")+" "+(m.question||"")).toLowerCase()};});
  items=PAGES.concat(toys,models);
}
function ensure(){if(items)return Promise.resolve();if(!loading)loading=Promise.all([load("/models.js",()=>window.COSMOS_MODELS),load("/hub-catalog.js",()=>window.COSMOS_HUB_MODELS)]).then(build);return loading;}
function search(q){
  const toks=q.toLowerCase().split(/\s+/).filter(Boolean);if(!toks.length)return PAGES.slice();
  const out=[];for(const it of items){let sc=0,ok=true;const t=it.title.toLowerCase();for(const k of toks){if(t.startsWith(k))sc+=4;else if(t.includes(k))sc+=3;else if(it.kind.toLowerCase()===k)sc+=5;else if(it.hay.includes(k))sc+=1;else{ok=false;break;}}if(ok)out.push([sc+(it.kind==="PAGE"?1:0),it]);}
  out.sort((a,b)=>b[0]-a[0]);return out.slice(0,40).map(x=>x[1]);
}
function render(){
  list.textContent="";shown.forEach((it,i)=>{const li=document.createElement("li");li.className=i===sel?"sel":"";li.role="option";
    const b=document.createElement("b");b.textContent=it.kind;const s=document.createElement("span");s.textContent=it.title;const e=document.createElement("em");e.textContent=it.kind==="PAGE"?"OPEN":"LAUNCH";const sm=document.createElement("small");sm.textContent=it.desc;
    li.append(b,s,e,sm);li.onmousedown=ev=>{ev.preventDefault();go(it);};li.onmousemove=()=>{if(sel!==i){sel=i;[...list.children].forEach((c,k)=>c.classList.toggle("sel",k===i));}};list.appendChild(li);});
  if(!shown.length){const li=document.createElement("li");li.textContent="No match. Try “inflation”, “zeta”, “lorenz” or a model id such as M001.";list.appendChild(li);}
  const cur=list.children[sel];if(cur&&cur.scrollIntoView)cur.scrollIntoView({block:"nearest"});
}
function go(it){close();location.href=it.href;}
function open(){
  if(!back)mount();back.classList.add("open");input.value="";sel=0;shown=PAGES.slice();render();input.focus();
  ensure().then(()=>{if(back.classList.contains("open")){shown=search(input.value);sel=0;render();}});
}
function close(){if(back)back.classList.remove("open");}
function mount(){
  const st=document.createElement("style");st.textContent=STYLE;document.head.appendChild(st);
  back=document.createElement("div");back.id="cmdk-back";back.onmousedown=e=>{if(e.target===back)close();};
  box=document.createElement("div");box.id="cmdk";box.role="dialog";box.setAttribute("aria-modal","true");box.setAttribute("aria-label","Search COSMOS LAB");
  input=document.createElement("input");input.type="search";input.placeholder="Search 301 models, 15 labs, toys… e.g. inflation, zeta, lorenz, M001";input.setAttribute("aria-label","Search COSMOS LAB");
  list=document.createElement("ul");list.role="listbox";
  const f=document.createElement("div");f.className="foot";f.innerHTML="<span>↑ ↓ MOVE · ENTER OPEN · ESC CLOSE</span><span>COSMOS LAB SEARCH</span>";
  box.append(input,list,f);back.appendChild(box);document.body.appendChild(back);
  input.addEventListener("input",()=>{shown=items?search(input.value):PAGES.filter(p=>p.hay.includes(input.value.toLowerCase()));sel=0;render();});
  input.addEventListener("keydown",e=>{if(e.key==="ArrowDown"){e.preventDefault();sel=Math.min(sel+1,shown.length-1);render();}else if(e.key==="ArrowUp"){e.preventDefault();sel=Math.max(sel-1,0);render();}else if(e.key==="Enter"){e.preventDefault();if(shown[sel])go(shown[sel]);}else if(e.key==="Escape"){close();}});
}
document.addEventListener("keydown",e=>{
  const typing=/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement&&document.activeElement.tagName)||document.activeElement&&document.activeElement.isContentEditable;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();back&&back.classList.contains("open")?close():open();}
  else if(e.key==="/"&&!typing&&!e.ctrlKey&&!e.metaKey){e.preventDefault();open();}
  else if(e.key==="Escape")close();
});
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("[data-cmdk]");if(t){e.preventDefault();open();}});
})();
