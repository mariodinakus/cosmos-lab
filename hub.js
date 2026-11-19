/* COSMOS HUB: no external network calls, just navigation of source-verified models. */
(()=>{"use strict";
const models=window.COSMOS_HUB_MODELS;
if(!Array.isArray(models)||models.length!==54)throw Error("Catalog unavailable or incomplete");
const $=id=>document.getElementById(id);
let group="all",search="";
const groups={toy:"TOY UNIVERSE",frontier:"FRONTIER QUESTIONS",gravity:"QUANTUM GRAVITY",reality:"REALITY ENGINE",open:"OPEN PROBLEMS"};
function visible(){return models.filter(m=>(group==="all"||m.category===group)&&[m.title,m.tag,m.question,m.category,m.id].join(" ").toLowerCase().includes(search));}
function render(){
 const list=visible(),root=$("results");root.textContent="";
 const fragment=document.createDocumentFragment();
 for(const item of list){
  const card=document.createElement("a");card.href=item.href;card.className="result-card";
  const category=document.createElement("span");category.className="category";category.textContent=groups[item.category]+" / "+item.tag;
  const title=document.createElement("strong");title.textContent=item.title;
  const question=document.createElement("small");question.textContent=item.question;
  const action=document.createElement("b");action.textContent="OPEN MODEL ↗";
  card.append(category,title,question,action);fragment.appendChild(card);
 }
 root.appendChild(fragment);
 $("resultCount").textContent=list.length+" EXPERIMENT"+(list.length===1?"":"S");
 $("emptyMessage").hidden=list.length!==0;
 const tabs=document.querySelectorAll("#filters button[data-group]");
 for(const tab of tabs){const selected=tab.dataset.group===group;tab.classList.toggle("selected",selected);tab.setAttribute("aria-pressed",String(selected));}
}
$("search").addEventListener("input",()=>{search=$("search").value.trim().toLowerCase();render();});
for(const btn of document.querySelectorAll("#filters button[data-group]")){btn.addEventListener("click",()=>{group=btn.dataset.group;render();});}
$("random").addEventListener("click",()=>{
 const list=visible();if(!list.length)return;
 const next=list[Math.floor(Math.random()*list.length)];window.location.assign(next.href);
});
render();
})();