/* COSMOS LAB shared kit: canvas plots, URL-hash sharing, downloads, seeded RNG.
   Pure browser helpers; no network access, no storage, no dynamic code. */
(function(root){"use strict";
const COLORS=["#00d4e8","#ffffff","#ffb347","#7bd88f","#ff6b8b","#b19cff"];
const BG="#06151b",GRID="#294c5570",AXIS="#a1bec7",TEXT="#e5fdff";

function niceTicks(min,max,count=5){
  if(!(max>min)){max=min+1;}
  const span=max-min,raw=span/count,mag=Math.pow(10,Math.floor(Math.log10(raw))),norm=raw/mag;
  const step=(norm<1.5?1:norm<3?2:norm<7?5:10)*mag;
  const start=Math.ceil(min/step-1e-9)*step,out=[];
  for(let v=start;v<=max+step*1e-9;v+=step)out.push(Math.abs(v)<step*1e-9?0:v);
  return out;
}
function fmt(v){
  if(v===0)return"0";const a=Math.abs(v);
  if(a>=1e5||a<1e-3)return v.toExponential(1).replace("e+","e");
  if(a>=100)return v.toFixed(0);if(a>=10)return v.toFixed(1);if(a>=1)return v.toFixed(2);return v.toPrecision(2);
}
function finiteRange(arrs,logy){
  let lo=Infinity,hi=-Infinity;
  for(const a of arrs)for(const v of a){if(!Number.isFinite(v))continue;if(logy&&v<=0)continue;if(v<lo)lo=v;if(v>hi)hi=v;}
  if(!Number.isFinite(lo)){lo=0;hi=1;}
  if(lo===hi){lo-=.5;hi+=.5;}
  return[lo,hi];
}
/** opts: {series:[{x,y,color,label,type:'line'|'points'|'step'|'bars',width,barWidth}],xlim,ylim,xlabel,ylabel,logy,vlines:[{x,color,label}]} */
function plot(canvas,opts){
  const g=canvas.getContext("2d"),W=canvas.width,H=canvas.height,pad={l:70,r:22,t:30,b:48};
  g.setTransform(1,0,0,1,0,0);g.fillStyle=BG;g.fillRect(0,0,W,H);
  const S=opts.series||[],logy=!!opts.logy;
  let [x0,x1]=opts.xlim||finiteRange(S.map(s=>s.x),false);
  let [y0,y1]=opts.ylim||finiteRange(S.map(s=>s.y),logy);
  if(logy){y0=Math.pow(10,Math.floor(Math.log10(Math.max(y0,1e-300))));y1=Math.pow(10,Math.ceil(Math.log10(y1)));if(y1<=y0)y1=y0*10;}
  else if(!opts.ylim){const m=(y1-y0)*.06;y0-=m;y1+=m;if(S.some(s=>s.type==="bars"))y0=Math.min(0,y0);}
  const X=v=>pad.l+(v-x0)/(x1-x0)*(W-pad.l-pad.r);
  const Y=v=>{const t=logy?(Math.log10(Math.max(v,1e-300))-Math.log10(y0))/(Math.log10(y1)-Math.log10(y0)):(v-y0)/(y1-y0);return H-pad.b-t*(H-pad.t-pad.b);};
  g.font="12px Arial, sans-serif";g.lineWidth=1;
  const xt=niceTicks(x0,x1,7);
  const yt=logy?(()=>{const o=[],e0=Math.round(Math.log10(y0)),e1=Math.round(Math.log10(y1)),st=Math.max(1,Math.ceil((e1-e0)/7));for(let e=e0;e<=e1;e+=st)o.push(Math.pow(10,e));return o;})():niceTicks(y0,y1,5);
  g.strokeStyle=GRID;g.fillStyle=AXIS;g.textAlign="center";
  for(const v of xt){const px=X(v);if(px<pad.l-1||px>W-pad.r+1)continue;g.beginPath();g.moveTo(px,pad.t);g.lineTo(px,H-pad.b);g.stroke();g.fillText(fmt(v),px,H-pad.b+17);}
  g.textAlign="right";
  for(const v of yt){const py=Y(v);if(py<pad.t-1||py>H-pad.b+1)continue;g.beginPath();g.moveTo(pad.l,py);g.lineTo(W-pad.r,py);g.stroke();g.fillText(fmt(v),pad.l-8,py+4);}
  g.strokeStyle=AXIS;g.strokeRect(pad.l,pad.t,W-pad.l-pad.r,H-pad.t-pad.b);
  g.fillStyle=TEXT;g.textAlign="center";if(opts.xlabel)g.fillText(opts.xlabel,pad.l+(W-pad.l-pad.r)/2,H-8);
  if(opts.ylabel){g.save();g.translate(15,pad.t+(H-pad.t-pad.b)/2);g.rotate(-Math.PI/2);g.fillText(opts.ylabel,0,0);g.restore();}
  g.save();g.beginPath();g.rect(pad.l,pad.t,W-pad.l-pad.r,H-pad.t-pad.b);g.clip();
  for(const vl of opts.vlines||[]){g.strokeStyle=vl.color||"#ffb347";g.setLineDash([5,4]);g.beginPath();g.moveTo(X(vl.x),pad.t);g.lineTo(X(vl.x),H-pad.b);g.stroke();g.setLineDash([]);}
  S.forEach((s,i)=>{
    const col=s.color||COLORS[i%COLORS.length];g.strokeStyle=col;g.fillStyle=col;g.lineWidth=s.width||2;
    const n=Math.min(s.x.length,s.y.length);
    if(s.type==="bars"){const bw=Math.max(1,Math.abs(X((s.barWidth||1))-X(0))*.88);for(let k=0;k<n;k++){if(!Number.isFinite(s.y[k]))continue;const px=X(s.x[k]),py=Y(s.y[k]),base=Y(logy?y0:Math.max(y0,0));g.globalAlpha=.55;g.fillRect(px-bw/2,Math.min(py,base),bw,Math.abs(base-py));g.globalAlpha=1;}return;}
    if(s.type==="points"){for(let k=0;k<n;k++){if(!Number.isFinite(s.y[k])||(logy&&s.y[k]<=0))continue;if(s.err&&Number.isFinite(s.err[k])){g.lineWidth=1.4;g.beginPath();g.moveTo(X(s.x[k]),Y(s.y[k]-s.err[k]));g.lineTo(X(s.x[k]),Y(s.y[k]+s.err[k]));g.stroke();}g.beginPath();g.arc(X(s.x[k]),Y(s.y[k]),s.r||2.4,0,6.2832);g.fill();}return;}
    g.beginPath();let on=false,prevY=0;
    for(let k=0;k<n;k++){const yy=s.y[k];if(!Number.isFinite(yy)||(logy&&yy<=0)){on=false;continue;}const px=X(s.x[k]),py=Y(yy);
      if(!on){g.moveTo(px,py);on=true;}else if(s.type==="step"){g.lineTo(px,prevY);g.lineTo(px,py);}else g.lineTo(px,py);prevY=py;}
    g.stroke();
  });
  g.restore();
  let lx=pad.l+10;g.font="12px Arial, sans-serif";g.textAlign="left";
  S.forEach((s,i)=>{if(!s.label)return;const col=s.color||COLORS[i%COLORS.length];g.fillStyle=col;g.fillRect(lx,pad.t+8,14,4);g.fillStyle=TEXT;g.fillText(s.label,lx+19,pad.t+14);lx+=g.measureText(s.label).width+46;});
  for(const vl of opts.vlines||[]){if(!vl.label)continue;g.fillStyle=vl.color||"#ffb347";g.textAlign="left";g.fillText(vl.label,Math.min(X(vl.x)+5,W-pad.r-110),pad.t+30);}
  return{X,Y};
}
/** histogram -> {x:centers,y:values,width} ; density=true gives a probability density. */
function histogram(values,min,max,bins,density){
  const w=(max-min)/bins,c=new Array(bins).fill(0);let n=0;
  for(const v of values){if(!Number.isFinite(v)||v<min||v>=max)continue;c[Math.floor((v-min)/w)]++;n++;}
  return{x:c.map((_,i)=>min+(i+.5)*w),y:c.map(v=>density?(n?v/(n*w):0):v),width:w,n};
}
/* ---------- sharing: parameters live in the URL hash (#p=...), never on a server ---------- */
const Share={
  read(){const h=location.hash;if(!h.startsWith("#p="))return null;try{const o=JSON.parse(decodeURIComponent(h.slice(3)));return o&&typeof o==="object"?o:null;}catch{return null;}},
  url(obj){return location.origin+location.pathname+"#p="+encodeURIComponent(JSON.stringify(obj));},
  async copy(obj,button){const url=Share.url(obj),old=button?button.textContent:"";
    try{await navigator.clipboard.writeText(url);if(button)button.textContent="✓ LINK COPIED";}
    catch{if(button)button.textContent="LINK IN ADDRESS BAR";history.replaceState(null,"",url);}
    if(button)setTimeout(()=>{button.textContent=old;},1700);return url;}
};
function download(name,content,mime){const b=new Blob([content],{type:mime||"text/plain"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),4000);}
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function gaussian(rand){let u=0,v=0;while(u===0)u=rand();v=rand();return Math.sqrt(-2*Math.log(u))*Math.cos(6.283185307179586*v);}
function csv(rows){return rows.map(r=>r.map(v=>typeof v==="string"?JSON.stringify(v):v).join(",")).join("\n");}
root.CosmosKit={plot,histogram,Share,download,rng,gaussian,csv,fmt,niceTicks};
})(typeof window!=="undefined"?window:globalThis);
