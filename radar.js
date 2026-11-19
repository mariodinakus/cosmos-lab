/* Research Radar — source-extractive summaries with Greek contextual explanations.
 * No fabricated finding, guessed translation or claim to read full papers.
 */
(()=>{"use strict";
const R=window.CosmosRadarCore;if(!R)throw Error("Radar parser not loaded");
const $=id=>document.getElementById(id);
const KEYS={papers:"papersTab",news:"newsTab",saved:"savedTab"};
let tab="papers",topic="all",days=30,source="all",term="",active=[],asOf="",lastFeed="",warnings=[],currentRequest=null;
const STORE="cosmos-radar-bookmarks-v1",cache=new Map;
const el=(tag,cls,content)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(content!==undefined)x.textContent=content;return x;};
function bookmarks(){try{const data=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(data)?data.filter(x=>x&&x.url&&x.title).slice(-120):[];}catch{return[];}}
function isSaved(url){return bookmarks().some(x=>x.url===url);}
function persist(item){try{const prev=bookmarks().filter(x=>x.url!==item.url);if(prev.length===bookmarks().length)prev.unshift({...item,savedAt:new Date().toISOString()});localStorage.setItem(STORE,JSON.stringify(prev.slice(0,100)));$("savedCount").textContent=String(bookmarks().length);return true;}catch{return false;}}
const greekDate=date=>{const d=new Date(date);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat("el-GR",{day:"2-digit",month:"short",year:"numeric",timeZone:"Europe/Athens"}).format(d):"Ημ/νία μη διαθέσιμη";};
const daysAgo=date=>Math.max(0,Math.floor((Date.now()-Date.parse(date))/86400000));
const short=(s,n=260)=>{const t=R.clean(s||"");return t.length>n?t.slice(0,n-1).replace(/\s+\S*$/,"")+"…":t;};
function setTabs(){for(const [name,id]of Object.entries(KEYS)){const selected=tab===name;$(id).classList.toggle("selected",selected);$(id).setAttribute("aria-pressed",String(selected));}$("sourcePicker").hidden=tab!=="news";}
function updateMetrics(items){$("count").textContent=String(items.length);$("sourceCount").textContent=String(new Set(items.map(a=>a.source)).size);$("latest").textContent=items.length?greekDate(items[0].published):"—";$("savedCount").textContent=String(bookmarks().length);}
function updateDigest(items){const root=$("digest"),list=$("digestList");list.textContent="";
 if(!items.length){root.hidden=true;return;}root.hidden=false;const ul=el("ul");
 for(const article of items.slice(0,5)){const li=el("li"),a=el("a","",article.title);a.href=R.safeUrl(article.url)||"#";a.target="_blank";a.rel="noopener noreferrer";li.appendChild(a);ul.appendChild(li);}
 list.appendChild(ul);
}
function addSection(parent,cls,title,value){const div=el("section","analysis-section "+cls),h=el("strong","",title),p=el("p","",value);div.append(h,p);parent.appendChild(div);}
function card(item){const meta=R.explain(item),article=el("article","paper");
 const header=el("div","paper-head"),badges=el("div","paper-labels");
 for(const t of [item.source,item.kind==="paper"?"PAPER / ΠΡΟΔΗΜΟΣΙΕΥΣΗ":"ΕΠΙΣΤΗΜΟΝΙΚΗ ΕΙΔΗΣΗ",daysAgo(item.published)<=3?"ΠΡΟΣΦΑΤΟ":"ΑΡΧΕΙΟ"])badges.appendChild(el("span","",t));
 const title=el("h3","",item.title),author=item.authors?.length?item.authors.join(", "):"Στοιχεία συγγραφέων μη διαθέσιμα";
 const info=el("div","meta");info.append(el("b","",greekDate(item.published)+" · "+meta.method),el("div","",item.kind==="paper"?short(author,150):"Επίσημη πηγή: "+item.source));
 header.append(badges,title,info);article.appendChild(header);
 const body=el("div","analysis"),expanded=meta.expanded||{};
 addSection(body,"overview","ΜΕ ΑΠΛΑ ΛΟΓΙΑ / ΤΟ ΠΛΑΙΣΙΟ",expanded.intro||"Η πηγή δεν περιγράφει επαρκώς το θέμα.");
 addSection(body,"finding","ΤΙ ΑΝΑΦΕΡΟΥΝ ΩΣ ΚΥΡΙΟ ΕΥΡΗΜΑ",short(expanded.finding||meta.claim,850));
 addSection(body,"implication","ΤΙ ΜΠΟΡΕΙ ΝΑ ΣΗΜΑΙΝΕΙ",expanded.implication||meta.implication);
 addSection(body,"limit","ΤΙ ΔΕΝ ΕΧΕΙ ΑΠΟΔΕΙΧΘΕΙ",expanded.validation||meta.caveat);
 const deep=el("details","deep-dive"),deepTitle=el("summary","","Αναλυτικότερα: ερώτημα, μεθοδολογία, επιφυλάξεις και όροι");
 deep.appendChild(deepTitle);
 addSection(deep,"objective","ΤΙ ΠΡΟΣΠΑΘΟΥΝ ΝΑ ΑΠΑΝΤΗΣΟΥΝ",expanded.objective||"Δεν προσδιορίζεται στο διαθέσιμο abstract.");
 addSection(deep,"method","ΠΩΣ ΤΟ ΕΞΕΤΑΣΑΝ",expanded.method||"Δεν προσδιορίζεται στο διαθέσιμο abstract.");
 addSection(deep,"actual-limit","ΠΕΡΙΟΡΙΣΜΟΙ ΠΟΥ ΑΝΑΦΕΡΕΙ ΤΟ ΚΕΙΜΕΝΟ",expanded.actualLimit||"Δεν προσδιορίζονται στο διαθέσιμο abstract.");
 if(expanded.terms?.length){
 const terms=el("div","glossary"),heading=el("strong","","ΒΑΣΙΚΟΙ ΟΡΟΙ ΜΕ ΑΠΛΑ ΛΟΓΙΑ");terms.appendChild(heading);
 for(const term of expanded.terms){const p=el("p","",term.name+" — "+term.definition);terms.appendChild(p);}
 deep.appendChild(terms);
 }
 const original=el("details","original-abstract"),origTitle=el("summary","","Διάβασε το πλήρες διαθέσιμο abstract / απόσπασμα");
 original.append(origTitle,el("p","",short(item.abstract||item.title,8000)));deep.appendChild(original);
 deep.appendChild(el("p","summary-quality",expanded.quality||meta.basis));
 body.appendChild(deep);
 body.appendChild(el("p","summary-basis","Αυτόματη, αποσπασματική ανάγνωση της πρωτογενούς πηγής · τα αγγλικά αποσπάσματα διατηρούν την αυθεντική διατύπωση."));
 article.appendChild(body);
 const actions=el("div","paper-actions"),link=el("a","",item.kind==="paper"?"ΠΡΩΤΟΤΥΠΟ PAPER ↗":"ΠΗΓΗ ΕΙΔΗΣΗΣ ↗");link.href=R.safeUrl(item.url)||"#";link.target="_blank";link.rel="noopener noreferrer";actions.appendChild(link);
 if(item.pdfUrl&&R.safeUrl(item.pdfUrl)){const pdf=el("a","","PDF ↗");pdf.href=R.safeUrl(item.pdfUrl);pdf.target="_blank";pdf.rel="noopener noreferrer";actions.appendChild(pdf);}
 const btn=el("button",isSaved(item.url)?"saved":"",isSaved(item.url)?"★ ΑΠΟΘΗΚΕΥΤΗΚΕ":"☆ ΑΠΟΘΗΚΕΥΣΗ");btn.type="button";btn.onclick=()=>{if(!persist(item)){$("status").textContent="Η τοπική αποθήκευση δεν είναι διαθέσιμη.";return;}if(tab==="saved")render();else{btn.textContent=isSaved(item.url)?"★ ΑΠΟΘΗΚΕΥΤΗΚΕ":"☆ ΑΠΟΘΗΚΕΥΣΗ";btn.className=isSaved(item.url)?"saved":"";}};actions.appendChild(btn);article.appendChild(actions);return article;
}
function visible(){const items=tab==="saved"?bookmarks():active;return items.filter(item=>{
 if(tab==="saved"&&topic!=="all"&&!R.relevant(item,topic))return false;
 return!term||[item.title,item.abstract,item.source,item.category,(item.authors||[]).join(" ")].join(" ").toLowerCase().includes(term);
 });}
function render(){const shown=visible(),host=$("cards");host.textContent="";const f=document.createDocumentFragment();for(const item of shown)f.appendChild(card(item));host.appendChild(f);
 $("empty").hidden=shown.length>0;updateMetrics(shown);updateDigest(shown);
 if(tab==="saved")$("status").textContent=shown.length+" αποθηκευμένα άρθρα στον browser της συσκευής.";else if(!shown.length)$("status").textContent=active.length?"Δεν βρέθηκαν αντιστοιχίες για την αναζήτηση.":"Δεν βρέθηκαν διαθέσιμες δημοσιεύσεις στη συγκεκριμένη περίοδο.";
}
function stateURL(){const u=new URL(location.href);u.searchParams.set("kind",tab==="saved"?"papers":tab);u.searchParams.set("topic",topic);u.searchParams.set("days",String(days));if(tab==="news")u.searchParams.set("source",source);else u.searchParams.delete("source");history.replaceState(null,"",u.toString());}
async function load(force=false){setTabs();if(tab==="saved"){if(currentRequest)currentRequest.abort();render();return;}
 const query={kind:tab,topic,days,source:tab==="news"?source:"all"},key=JSON.stringify(query),cached=cache.get(key);
 if(cached&&!force&&Date.now()-cached.time<8*60*1000){active=cached.items;lastFeed=cached.feed;asOf=cached.asOf;warnings=cached.warnings;render();$("asOf").textContent="Τελευταία ανάκτηση: "+greekDate(asOf)+" · "+lastFeed;return;}
 if(currentRequest)currentRequest.abort();const controller=new AbortController();currentRequest=controller;const u=new URL("/api/radar",location.origin);Object.entries(query).forEach(([k,v])=>u.searchParams.set(k,String(v)));
 $("status").textContent="Ανάκτηση από πραγματικές επιστημονικές πηγές…";$("refresh").disabled=true;
 try{const response=await fetch(u.toString(),{signal:controller.signal,headers:{"Accept":"application/json"}});const data=await response.json();if(!response.ok)throw Error((data.error||"Αποτυχία πηγής")+" — "+(data.details||[]).join("; "));
 if(controller.signal.aborted)return;
 active=Array.isArray(data.items)?data.items:[];lastFeed=data.source||"";asOf=data.asOf||"";warnings=data.warnings||[];cache.set(key,{items:active,feed:lastFeed,asOf,warnings,time:Date.now()});render();
 $("status").textContent="Πηγή: "+lastFeed+" · "+active.length+" δημοσιεύσεις"+(warnings.length?" · Μερικές πηγές δεν ήταν διαθέσιμες":"");
 $("asOf").textContent="Ενημέρωση: "+greekDate(asOf)+" · Πρωτότυπα δεδομένα πηγών";
 }catch(err){if(controller.signal.aborted)return;active=[];render();$("status").textContent="Η ζωντανή τροφοδοσία δεν είναι διαθέσιμη τώρα: "+String(err.message||err).slice(0,250);$("asOf").textContent="Δεν εμφανίζονται συνθετικές ειδήσεις ή κατασκευασμένα papers.";}
 finally{if(currentRequest===controller){currentRequest=null;$("refresh").disabled=false;}}
}
function changeTab(next){tab=next;setTabs();stateURL();load();}
$("papersTab").onclick=()=>changeTab("papers");$("newsTab").onclick=()=>changeTab("news");$("savedTab").onclick=()=>changeTab("saved");
$("topic").onchange=()=>{topic=$("topic").value;stateURL();load();};
$("days").onchange=()=>{days=Number($("days").value);stateURL();load();};
$("newsSource").onchange=()=>{source=$("newsSource").value;stateURL();load();};
$("search").oninput=()=>{term=$("search").value.trim().toLowerCase();render();};
$("refresh").onclick=()=>load(true);
const incoming=new URLSearchParams(location.search);const initial=incoming.get("kind");if(initial==="news")tab="news";
if(Object.hasOwn(R.TOPICS,incoming.get("topic")))topic=incoming.get("topic");
if([7,30,90].includes(Number(incoming.get("days"))))days=Number(incoming.get("days"));
if(["all","nasa","cern","aps"].includes(incoming.get("source")))source=incoming.get("source");
$("topic").value=topic;$("days").value=String(days);$("newsSource").value=source;
$("savedCount").textContent=String(bookmarks().length);setTabs();load();
})();