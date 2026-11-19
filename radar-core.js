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
function extractClaim(abstract){const txt=clean(abstract);if(!txt)return"Δεν διατίθεται κείμενο abstract στο διαθέσιμο feed.";const sentences=txt.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)||[txt];const found=sentences.find(x=>/\b(we find|our results|results show|we show|we demonstrate|we observe|we detected|we detect|we measure|we conclude)\b/i.test(x))||sentences.find(x=>/\b(we present|we report|we propose|we derive|we introduce)\b/i.test(x));return clean(found||sentences[0]).slice(0,500);}

/* Every selected scientific sentence below is taken from the SOURCE ABSTRACT.
 * The Greek connective text classifies scope; it never pretends to translate
 * unknown details, invent an effect size, or read the full paper. */
const GLOSSARY=[
 ["quantum gravity","Κβαντική βαρύτητα","Προσπάθεια περιγραφής της βαρύτητας με αρχές κβαντικής φυσικής."],
 ["entanglement","Διεμπλοκή","Κβαντικές συσχετίσεις μεταξύ συστημάτων που δεν εξηγούνται ως απλές κλασικές συσχετίσεις."],
 ["decoherence","Αποσυνοχή","Απώλεια παρατηρήσιμης κβαντικής συμβολής λόγω αλληλεπίδρασης με άλλα συστήματα."],
 ["event horizon","Ορίζοντας γεγονότων","Όριο γύρω από μαύρη τρύπα πέρα από το οποίο το φως δεν μπορεί να φτάσει σε μακρινούς παρατηρητές."],
 ["black hole","Μαύρη τρύπα","Περιοχή του χωροχρόνου με ορίζοντα γεγονότων."],
 ["gravitational wave","Βαρυτικό κύμα","Διάδοση μεταβολών της καμπυλότητας του χωροχρόνου."],
 ["dark matter","Σκοτεινή ύλη","Υποθετική μορφή ύλης που συνάγεται από βαρυτικά φαινόμενα και δεν έχει ταυτοποιηθεί ως σωματίδιο."],
 ["dark energy","Σκοτεινή ενέργεια","Ονομασία του άγνωστου μηχανισμού πίσω από την επιταχυνόμενη κοσμική διαστολή."],
 ["cosmic microwave background","Κοσμική μικροκυματική ακτινοβολία","Κατάλοιπη ακτινοβολία του πρώιμου Σύμπαντος."],
 ["neutrino","Νετρίνο","Ελαφρύ, ηλεκτρικά ουδέτερο σωματίδιο με πολύ ασθενείς αλληλεπιδράσεις."],
 ["higgs","Μποζόνιο Higgs","Σωματίδιο που συνδέεται με το πεδίο Higgs στο Καθιερωμένο Πρότυπο."],
 ["cp violation","Παραβίαση CP","Διαφορά στη συμπεριφορά φυσικών διεργασιών όταν αντιστρέφονται τα φορτία και οι χωρικές συντεταγμένες."],
 ["baryogenesis","Βαρυογένεση","Πιθανοί μηχανισμοί δημιουργίας της ασυμμετρίας ύλης–αντιύλης."],
 ["standard model","Καθιερωμένο Πρότυπο","Η καθιερωμένη κβαντική θεωρία των γνωστών στοιχειωδών σωματιδίων και τριών θεμελιωδών αλληλεπιδράσεων."],
 ["cosmological constant","Κοσμολογική σταθερά","Όρος στις εξισώσεις της γενικής σχετικότητας που μπορεί να σχετίζεται με την κοσμική επιτάχυνση."],
 ["redshift","Μετατόπιση προς το ερυθρό","Μεταβολή της παρατηρούμενης συχνότητας προς μεγαλύτερα μήκη κύματος."],
 ["holographic","Ολογραφική αρχή","Ιδέα ότι πληροφορία ενός χωρικού συστήματος μπορεί σε κατάλληλες θεωρίες να αναπαρίσταται σε όριό του."],
 ["monte carlo","Monte Carlo","Υπολογιστικές μέθοδοι που χρησιμοποιούν τυχαία δειγματοληψία."],
 ["lattice","Πλέγμα","Διακριτό σύνολο σημείων πάνω στο οποίο ορίζονται οι βαθμοί ελευθερίας ενός μοντέλου."],
 ["simulation","Προσομοίωση","Υπολογιστική εξέλιξη μαθηματικού μοντέλου υπό δεδομένες παραδοχές."]
];
const DOMAIN_DESCRIPTIONS={
 cosmology:"την εξέλιξη του Σύμπαντος και τα κοσμολογικά μοντέλα",
 gravity:"τη βαρύτητα, τις μαύρες τρύπες ή τη γεωμετρία του χωροχρόνου",
 quantum:"την κβαντική συμπεριφορά και τις συσχετίσεις συστημάτων",
 particles:"τα στοιχειώδη σωματίδια και τις αλληλεπιδράσεις τους",
 foundations:"θεωρητικές προσεγγίσεις ενοποίησης και θεμελιώδεις νόμους",
 all:"ένα εξειδικευμένο ερώτημα φυσικής"
};
const METHOD_INTROS={
 empirical:"Το abstract περιγράφει πειραματική ή παρατηρησιακή προσέγγιση. Αυτό δεν αρκεί από μόνο του για να ελεγχθεί η ποιότητα των δεδομένων.",
 simulation:"Η έρευνα χρησιμοποιεί αριθμητικές προσομοιώσεις. Τα αποτελέσματα εξαρτώνται από τις εξισώσεις, τις αρχικές συνθήκες και τις παραμέτρους τους.",
 theory:"Πρόκειται κυρίως για θεωρητική/μαθηματική προσέγγιση, όχι κατ' ανάγκη για νέα μέτρηση της φύσης.",
 review:"Η εργασία ανασκοπεί και συνθέτει υπάρχουσα έρευνα· δεν σημαίνει αυτομάτως νέο πειραματικό αποτέλεσμα.",
 other:"Ο ακριβής τύπος μελέτης δεν εξακριβώνεται με ασφάλεια μόνο από το abstract."
};
const METHODS=[
 {re:/\b(we (study|investigate|analy[sz]e|examine|explore|consider|focus on|aim to|test)|this (paper|study|work) (studies|investigates|examines|explores)|our goal|we address)\b/i,weight:3,category:"objective"},
 {re:/\b(we (use|utilize|employ|simulate|model|compute|calculate|derive|perform|construct|develop|apply|fit|train|measure|observe|analy[sz]e)|using|based on|numerical simulation|monte carlo|experimental setup|observations from|data from|observational data|we solve)\b/i,weight:3,category:"method"},
 {re:/\b(we (find|show|demonstrate|observe|detect|measure|report|obtain|prove|conclude|establish|predict)|our results|results (show|indicate|suggest|reveal|demonstrate)|we confirm|we identify|we discover|we estimate|we constrain|we rule out|evidence for|the main result|we uncover)\b/i,weight:5,category:"result"},
 {re:/\b(however|although|nevertheless|preliminary|limitation|limited to|within our model|within the model|under (the|these|our) assumptions|may not|cannot|does not|do not|future work|remain(s)? (unknown|open|unclear)|further (studies|work|observations)|uncertainties|subject to)\b/i,weight:5,category:"caution"}
];
function abstractSentences(raw){
 const txt=clean(raw);if(!txt)return[];
 return txt.split(/(?<=[.!?])\s+(?=(?:["'(]?[A-ZΑ-Ω]))/u)
 .map(x=>x.trim()).filter(x=>x.length>15).slice(0,36);
}
function pickSentence(sentences,kind,blocked=[]){
 const re=METHODS.find(x=>x.category===kind)?.re;const candidates=sentences.map((sentence,index)=>{
 let score=0;if(re?.test(sentence))score+=5;
 if(kind==="result"&&/\b(?:is|are|was|were|becomes?|remains?|suppressed|increased?|decreased?|vanish(?:es)?|consistent with)\b/i.test(sentence))score+=1;
 if(kind==="method"&&/\b(?:based on|using|simulat|dataset|observ|analys|equation|measurement|samples?)\b/i.test(sentence))score+=2;
 if(kind==="caution"&&/\b(?:however|only|not|cannot|uncertainty)\b/i.test(sentence))score+=1;
 if(kind==="objective"&&index<Math.max(2,Math.floor(sentences.length/2)))score+=1;
 if(kind==="result"&&index>=Math.floor(sentences.length/2))score+=1;
 if(blocked.includes(index))score-=12;
 if(sentence.length<28)score-=3;
 return{sentence,index,score};
 }).sort((a,b)=>b.score-a.score||a.index-b.index);
 return candidates[0]?.score>=5?candidates[0]:null;
}
function summaryBreakdown(item){
 const raw=item.abstract||"",sentences=abstractSentences(raw),used=[];
 const objective=pickSentence(sentences,"objective",used);if(objective)used.push(objective.index);
 const method=pickSentence(sentences,"method",used);if(method)used.push(method.index);
 const firstResult=pickSentence(sentences,"result",[]);const result=firstResult||null;
 const secondResult=firstResult?pickSentence(sentences,"result",[firstResult.index]):null;
 const independentResults=[firstResult,secondResult].filter((x,i)=>x&&x.score>=5&&(i===0||x.index!==firstResult.index)&&!(i===1&&x.score<6));
 const caution=pickSentence(sentences,"caution",independentResults.map(x=>x.index));
 const topic=item.topic==="all"||!TOPICS[item.topic]?detectTopic(item):item.topic;
 const c=classify(raw||item.title),paper=item.kind==="paper";
 const objectiveText=objective?.sentence||sentences[0]||"Το διαθέσιμο κείμενο δεν περιγράφει σαφώς το ερευνητικό ερώτημα.";
 const methodText=method?.sentence||"Το διαθέσιμο abstract δεν εξηγεί με σαφήνεια τη μεθοδολογία.";
 const finding=independentResults.length?independentResults.map(x=>x.sentence).sort((a,b)=>sentences.indexOf(a)-sentences.indexOf(b)).join(" "):
 "Δεν εντοπίζεται ρητά συγκεκριμένο εύρημα στο διαθέσιμο κείμενο. Διάβασε την αρχική δημοσίευση πριν εξαχθεί συμπέρασμα.";
 const actualLimit=caution?.sentence||"Δεν διατυπώνεται ρητός περιορισμός στο διαθέσιμο abstract. Αυτό δεν σημαίνει ότι η μελέτη δεν έχει περιορισμούς.";
 const terms=GLOSSARY.filter(([word])=>(item.title+" "+raw).toLowerCase().includes(word)).slice(0,3).map(([,name,definition])=>({name,definition}));
 const intro=(paper?"Η δημοσίευση":"Η ανακοίνωση")+" εξετάζει "+DOMAIN_DESCRIPTIONS[topic]+". "+(paper?METHOD_INTROS[c.kind]:"Το κείμενο προέρχεται από ανακοίνωση φορέα· το είδος και η τεκμηρίωση του αρχικού ευρήματος απαιτούν έλεγχο στην πηγή.");
 let takeaway=IMPLICATIONS[topic]; 
 if(c.kind==="simulation")takeaway="Αν οι υπολογισμοί αναπαραχθούν, το εύρημα ενισχύει όσα υποστηρίζει το συγκεκριμένο μοντέλο. Δεν συνεπάγεται παρατήρηση του ίδιου φαινομένου στη φύση.";
 else if(c.kind==="theory")takeaway="Αν οι μαθηματικοί υπολογισμοί είναι σωστοί, προκύπτει ένα αποτέλεσμα εντός των παραδοχών της θεωρίας. Απαιτούνται επιπλέον έλεγχοι για να συνδεθεί με φυσικές παρατηρήσεις.";
 else if(c.kind==="empirical")takeaway="Αν οι μετρήσεις και οι αναλύσεις επιβεβαιωθούν ανεξάρτητα, το συγκεκριμένο αποτέλεσμα μπορεί να προσθέσει εμπειρικά στοιχεία στο ερευνητικό πεδίο. Το abstract μόνο δεν επιτρέπει έλεγχο της στατιστικής ισχύος.";
 else if(c.kind==="review")takeaway="Μπορεί να οργανώνει την υπάρχουσα γνώση και να αναδεικνύει ανοιχτά ζητήματα, όχι κατ' ανάγκη νέα μέτρηση.";
 const genericCaution=(paper?"Η δημοσίευση ως preprint δεν σημαίνει peer review. ":"Μια ανακοίνωση δεν ισοδυναμεί με ανεξάρτητη επιστημονική επικύρωση. ")+LIMITS[topic];
 return{intro,objective:objectiveText,method:methodText,finding,actualLimit,implication:takeaway,validation:genericCaution,terms,extractive:true,
 quality:sentences.length<3?"Το διαθέσιμο κείμενο είναι σύντομο, επομένως η ανάλυση έχει περιορισμένη λεπτομέρεια.":"Αποσπάσματα ακριβώς από το διαθέσιμο abstract / περιγραφή, όχι πλήρες paper."};
}

function explain(item){const topic=item.topic==="all"||!TOPICS[item.topic]?detectTopic(item):item.topic,method=classify(item.abstract||item.title),paper=item.kind==="paper";
 const expanded=summaryBreakdown(item);
 return{basis:paper?"Αυτόματη πρώτη ανάγνωση του abstract · όχι αξιολόγηση του πλήρους paper":"Περίληψη ανακοίνωσης φορέα · όχι ανεξάρτητος έλεγχος",
 claim:extractClaim(item.abstract||item.title),
 method:paper?method.tag:"Ανακοίνωση επιστημονικού φορέα",
 implication:IMPLICATIONS[topic]+(method.kind==="simulation"?" Η σύνδεση αφορά τα αποτελέσματα της προσομοίωσης, όχι άμεση παρατήρηση της φύσης.":method.kind==="theory"?" Πρόκειται για θεωρητικό συμπέρασμα που χρειάζεται ανεξάρτητες συνέπειες ή εμπειρικούς ελέγχους.":method.kind==="empirical"?" Η ισχύς της ερμηνείας εξαρτάται από αβεβαιότητες, ελέγχους και ανεξάρτητη επανάληψη των μετρήσεων.":method.kind==="review"?" Η ανασκόπηση οργανώνει υπάρχοντα στοιχεία και δεν σημαίνει κατ' ανάγκη νέο πειραματικό εύρημα.":""),
 caveat:(paper?"Το arXiv δημοσιεύει preprints· η παρουσία στο arXiv δεν επιβεβαιώνει επιστημονική αξιολόγηση από ομοτίμους. ":"Μια ανακοίνωση δεν ταυτίζεται απαραίτητα με νέα peer-reviewed ανακάλυψη. ")+LIMITS[topic],
 status:paper?"PREPRINT / PEER REVIEW UNVERIFIED":"INSTITUTIONAL NEWS",
 expanded};
}
return{TOPICS,decode,clean,xmlTag,safeUrl,parseAtom,parseRSS,dedupe,relevant,classify,detectTopic,extractClaim,abstractSentences,pickSentence,summaryBreakdown,explain};
});