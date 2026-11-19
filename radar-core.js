/* COSMOS LAB Research Radar — deterministic source-anchored metadata and interpretation.
 * Headlines, dates, abstracts and links are from the original source feeds.
 * Analyses are explicitly labelled heuristics, NOT AI full-paper reading.
 */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.CosmosRadarCore=api;})(typeof window!=="undefined"?window:globalThis,function(){"use strict";
const TOPICS={
 all:{name:"Όλα τα πεδία",arxiv:"cat:gr-qc OR cat:hep-th OR cat:quant-ph OR cat:astro-ph.CO OR cat:hep-ph",keywords:[]},
 cosmology:{name:"Κοσμολογία",arxiv:"cat:astro-ph.CO",keywords:["cosmolog","galax","universe","cosmic","dark matter","dark energy","cmb","inflation","webb","telescope","black hole"]},
 gravity:{name:"Βαρύτητα / χωροχρόνος",arxiv:"cat:gr-qc",keywords:["gravit","spacetime","black hole","relativity","einstein","lensing","wave","singularit"]},
 quantum:{name:"Κβαντική φυσική",arxiv:"cat:quant-ph",keywords:["quantum","entangle","qubit","bell","superposition","decoherence","photon","quantum comput"]},
 particles:{name:"Σωματίδια / αντιύλη",arxiv:"cat:hep-ph",keywords:["particle","higgs","neutrino","antimatter","matter","cp violation","collider","lhc","standard model"]},
 foundations:{name:"Θεωρία των Πάντων",arxiv:"cat:hep-th",keywords:["string theor","unif","quantum gravit","holograph","information paradox","theory","fundamental"]} 
};
function decode(s){return String(s||"").replace(/&#x([0-9a-f]+);/gi,(_,h)=>String.fromCodePoint(parseInt(h,16))).replace(/&#([0-9]+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&(amp|lt|gt|quot|apos|nbsp);/gi,(_,a)=>({amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:" "})[a.toLowerCase()]||" ");}
function clean(text){return decode(String(text||"").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]*>/g," ")).replace(/\s+/g," ").trim().slice(0,12000);}
function xmlTag(s,tag){const re=new RegExp("<(?:[\\w.-]+:)?"+tag+"(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?"+tag+">","i");return clean(s.match(re)?.[1]||"");}
function safeUrl(raw){try{const u=new URL(clean(raw));return["https:","http:"].includes(u.protocol)?u.toString():"";}catch{return"";}}
function canonicalArxiv(id){const found=String(id).match(/(?:arxiv\.org\/(?:abs|pdf)\/)([^?#/]+)(?:\.pdf)?/i);return found?"https://arxiv.org/abs/"+found[1]:"";}
function parseAtom(xml,topic="all"){
 if(typeof xml!=="string"||xml.length>2000000)throw Error("Invalid Atom feed");
 const out=[],re=/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi;let match;
 while((match=re.exec(xml))&&out.length<80){const x=match[1],id=xmlTag(x,"id"),url=canonicalArxiv(id);
 const title=xmlTag(x,"title"),abstract=xmlTag(x,"summary"),date=xmlTag(x,"published")||xmlTag(x,"updated");
 const authors=[...x.matchAll(/<author\b[^>]*>([\s\S]*?)<\/author>/gi)].map(a=>xmlTag(a[1],"name")).filter(Boolean).slice(0,8);
 if(!url||!title||!abstract||!Number.isFinite(Date.parse(date)))continue;
 const pdf=url.replace("/abs/","/pdf/"),cat=x.match(/<(?:arxiv:)?primary_category\b[^>]*term=["']([^"']+)/i)?.[1]||"";
 out.push({id:"arxiv:"+url.split("/").at(-1),kind:"paper",source:"arXiv",topic,title,abstract,published:new Date(date).toISOString(),authors,category:cat,url,pdfUrl:pdf,peerReviewed:false});}
 return out;
}
function parseRSS(xml,source="NASA Science"){
 if(typeof xml!=="string"||xml.length>2500000)throw Error("Invalid RSS feed");const out=[],re=/<item\b[^>]*>([\s\S]*?)<\/item>/gi;let match;
 while((match=re.exec(xml))&&out.length<90){const x=match[1],title=xmlTag(x,"title"),summary=xmlTag(x,"description"),date=xmlTag(x,"pubDate")||xmlTag(x,"date"),url=safeUrl(xmlTag(x,"link")||xmlTag(x,"guid"));
 if(!title||!url||!Number.isFinite(Date.parse(date)))continue;
 out.push({id:"news:"+url,kind:"news",source,topic:"all",title,abstract:summary,published:new Date(date).toISOString(),authors:[],url,pdfUrl:"",peerReviewed:null});}
 return out;
}
function dedupe(items){const seen=new Set;return items.filter(x=>{if(!x||!x.url||seen.has(x.url))return false;seen.add(x.url);return true;}).sort((a,b)=>Date.parse(b.published)-Date.parse(a.published));}
function relevant(item,topic){if(topic==="all")return true;const words=TOPICS[topic]?.keywords||[];return words.some(k=>(item.title+" "+item.abstract).toLowerCase().includes(k));}
function classify(text){const s=String(text).toLowerCase();if(/\b(review|survey|meta-analysis|overview)\b/.test(s))return{tag:"Ανασκόπηση",kind:"review"};if(/\b(we (observed|observe|measured|measure|detected|detect)|experimentally|observational data|experimental results)\b/.test(s))return{tag:"Μετρήσεις (κατά το abstract)",kind:"empirical"};if(/\b(we simulate|numerical simulations|monte carlo|simulations show|computational)\b/.test(s))return{tag:"Αριθμητική μελέτη",kind:"simulation"};if(/\b(we propose|we introduce|we develop|we derive|we demonstrate|theoretical framework)\b/.test(s))return{tag:"Θεωρητική εργασία",kind:"theory"};return{tag:"Τύπος μελέτης μη επαληθευμένος",kind:"other"};}
const LIMITS={
 cosmology:"Δεν τεκμηριώνεται από το abstract ότι το αποτέλεσμα ισχύει για όλο το παρατηρήσιμο Σύμπαν ή ότι αποκλείει άλλες κοσμολογίες.",
 gravity:"Δεν συνεπάγεται από μόνο του λύση για την κβαντική βαρύτητα ή επιβεβαίωση νέας θεωρίας χωροχρόνου.",
 quantum:"Δεν αποδεικνύει συγκεκριμένη φιλοσοφική ερμηνεία της κβαντομηχανικής ή λύση του προβλήματος της μέτρησης.",
 particles:"Δεν επιλύει αυτόματα την κοσμολογική ασυμμετρία ύλης–αντιύλης ή το πρόβλημα πέρα από το Καθιερωμένο Πρότυπο.",
 foundations:"Δεν αποτελεί πλήρη Θεωρία των Πάντων ούτε επιβεβαίωση μιας ενοποιημένης θεωρίας χωρίς ανεξάρτητες, ελέγξιμες προβλέψεις.",
 all:"Το abstract από μόνο του δεν επαρκεί για επιβεβαίωση της μεθοδολογίας, αναπαραγωγιμότητας ή γενίκευσης."
};
const IMPLICATIONS={
 cosmology:"Εάν το αποτέλεσμα επιβεβαιωθεί ανεξάρτητα, μπορεί να βελτιώσει τους περιορισμούς ή τις υποθέσεις των κοσμολογικών μοντέλων.",
 gravity:"Εφόσον επαληθευτεί, μπορεί να ελέγξει προσεγγίσεις για τη βαρύτητα, τον χωροχρόνο ή ακραίες βαρυτικές συνθήκες.",
 quantum:"Εφόσον επαληθευτεί, μπορεί να αποσαφηνίσει συγκεκριμένες κβαντικές συσχετίσεις, δυναμικές ή πειραματικές δυνατότητες.",
 particles:"Εφόσον επαληθευτεί, μπορεί να περιορίσει παραμέτρους ή να δοκιμάσει μηχανισμούς της σωματιδιακής φυσικής.",
 foundations:"Αν τεκμηριωθεί, μπορεί να προσφέρει ένα ακόμη θεωρητικό εργαλείο ή ελέγξιμη συνέπεια σε προγράμματα ενοποίησης.",
 all:"Αν το εύρημα επιβεβαιωθεί ανεξάρτητα, μπορεί να αποτελέσει αφετηρία για νέους ελέγχους ή περιορισμούς στο σχετικό μοντέλο."
};
function detectTopic(item){const s=(item.title+" "+item.abstract).toLowerCase();let best="all",score=0;for(const [key,obj]of Object.entries(TOPICS)){if(key==="all")continue;const matches=obj.keywords.reduce((n,w)=>n+(s.includes(w)?1:0),0);if(matches>score){best=key;score=matches;}}return best;}
function extractClaim(abstract){const txt=clean(abstract);if(!txt)return"Δεν διατίθεται κείμενο abstract στο διαθέσιμο feed.";const sentences=txt.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)||[txt];const found=sentences.find(x=>/\b(we find|we show|we demonstrate|we observe|we present|we report|our results|we propose|we derive|we detect|results show)\b/i.test(x));return clean(found||sentences[0]).slice(0,500);}
function explain(item){const topic=item.topic==="all"||!TOPICS[item.topic]?detectTopic(item):item.topic,method=classify(item.abstract||item.title),paper=item.kind==="paper";
 return{basis:paper?"Αυτόματη πρώτη ανάγνωση του abstract · όχι αξιολόγηση του πλήρους paper":"Περίληψη ανακοίνωσης φορέα · όχι ανεξάρτητος έλεγχος",
 claim:extractClaim(item.abstract||item.title),
 method:paper?method.tag:"Ανακοίνωση επιστημονικού φορέα",
 implication:IMPLICATIONS[topic],
 caveat:(paper?"Το arXiv δημοσιεύει preprints· η παρουσία στο arXiv δεν επιβεβαιώνει επιστημονική αξιολόγηση από ομοτίμους. ":"Μια ανακοίνωση δεν ταυτίζεται απαραίτητα με νέα peer-reviewed ανακάλυψη. ")+LIMITS[topic],
 status:paper?"PREPRINT / PEER REVIEW UNVERIFIED":"INSTITUTIONAL NEWS"};
}
return{TOPICS,decode,clean,xmlTag,safeUrl,parseAtom,parseRSS,dedupe,relevant,classify,detectTopic,extractClaim,explain};
});