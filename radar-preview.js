/* COSMOS hub preview: recent titles only from the actual upstream research endpoint. */
(()=>{"use strict";const target=document.getElementById("radarPreviewItems"),status=document.getElementById("radarPreviewStatus");if(!target||!status)return;
const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12500);
fetch("/api/radar?kind=papers&topic=all&days=30",{signal:controller.signal}).then(r=>{if(!r.ok)throw Error("Research feed not available");return r.json();}).then(data=>{
 target.textContent="";if(!data.items?.length){status.textContent="Δεν διατίθενται νέοι τίτλοι από το feed αυτή τη στιγμή. Δες τις αρχικές πηγές στο Research Radar.";return;}
 status.textContent="Νεότερα papers · Πηγή: "+(data.source||"επιστημονικά abstracts")+" · Προδημοσιεύσεις δεν σημαίνουν επιβεβαιωμένες ανακαλύψεις";
 for(const item of data.items.slice(0,3)){
 const a=document.createElement("a");a.href="/radar.html?kind=papers";a.className="radar-preview-card";
 const label=document.createElement("span");label.textContent=(item.source||"RESEARCH")+" / "+(item.published||"").slice(0,10);
 const heading=document.createElement("strong");heading.textContent=item.title||"Νέα δημοσίευση";
 const meta=document.createElement("small");meta.textContent="Δες την περίληψη, τι μπορεί να σημαίνει και τι δεν αποδεικνύει";
 const action=document.createElement("b");action.textContent="RESEARCH RADAR ↗";
 a.append(label,heading,meta,action);target.appendChild(a);
 }
 }).catch(()=>{status.textContent="Η ζωντανή ροή δεν είναι διαθέσιμη αυτή τη στιγμή. Δεν εμφανίζουμε τεχνητά ή παλιά papers ως νέα.";}).finally(()=>clearTimeout(timeout));
})();