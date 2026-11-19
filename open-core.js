/* COSMOS OPEN PROBLEMS — explicit educational toy models.
   Nothing here proves existence/nonexistence, consciousness, origin of life,
   the Riemann hypothesis, a theory of everything or an economic forecast. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.CosmosOpenProblems=api;})(typeof window!=="undefined"?window:globalThis,function(){"use strict";
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),mean=a=>a.reduce((s,x)=>s+x,0)/Math.max(1,a.length);
function rng(seed=2026){let x=seed>>>0;return()=>{x=(Math.imul(1664525,x)+1013904223)>>>0;return x/4294967296;};}
function normal(random){return Math.sqrt(-2*Math.log(Math.max(1e-12,random())))*Math.cos(2*Math.PI*random());}
const DOMAINS=[
{id:"physics",name:"Φυσική & κοσμολογία",subtitle:"Γιατί υπάρχει κάτι; Θεωρία των Πάντων"},
{id:"math",name:"Άλυτα μαθηματικά",subtitle:"Ρίμαν, P vs NP, Navier–Stokes"},
{id:"economics",name:"Ανοιχτά οικονομικά",subtitle:"Κρίσεις, προβλέψεις, συστημικός κίνδυνος"},
{id:"chemistry",name:"Άλυτη χημεία",subtitle:"Αντιδράσεις, κατάλυση, αυτο-οργάνωση"},
{id:"biology",name:"Άλυτη βιολογία",subtitle:"Προέλευση ζωής, γήρανση, εξέλιξη"},
{id:"psychology",name:"Ψυχολογία & συνείδηση",subtitle:"Εμπειρία, μνήμη, αποφάσεις"}
];
const QUESTIONS=[
["physics","Γιατί υπάρχει κάτι αντί για τίποτα;","Η φυσική περιγράφει εξελισσόμενες καταστάσεις, όχι αποδεδειγμένη δημιουργία από απόλυτο τίποτα.","universe"],
["physics","Μπορεί να υπάρξει ενοποιημένη Θεωρία των Πάντων;","Δεν υπάρχει πειραματικά επιβεβαιωμένη ενοποιημένη θεωρία όλων των αλληλεπιδράσεων.",null,"/frontier.html?model=unify"],
["physics","Τι είναι πραγματικά η σκοτεινή ύλη και η σκοτεινή ενέργεια;","Η φύση των δύο αυτών κοσμολογικών συστατικών δεν έχει ταυτοποιηθεί πλήρως."],
["physics","Πώς προκύπτει ο χωροχρόνος από την κβαντική φυσική;","Η αναδυόμενη γεωμετρία είναι ενεργό ερευνητικό πρόγραμμα.",null,"/gravity.html?model=entanglement"],
["physics","Τι συμβαίνει με την πληροφορία στις μαύρες τρύπες;","Υπάρχουν θεωρητικές προσεγγίσεις, αλλά όχι πλήρης επιβεβαιωμένη μικροσκοπική περιγραφή.",null,"/gravity.html?model=page"],
["math","Ισχύει η Υπόθεση Ρίμαν;","Έχουν ελεγχθεί πολλά μη τετριμμένα μηδενικά, αλλά καμία πεπερασμένη υπολογιστική επαλήθευση δεν αποτελεί απόδειξη."],
["math","Είναι P ίσο με NP;","Δεν γνωρίζουμε αν κάθε πρόβλημα με γρήγορα επαληθεύσιμη λύση έχει και γρήγορα υπολογίσιμη λύση."],
["math","Ισχύει η εικασία Collatz για όλους τους θετικούς ακεραίους;","Οι υπολογιστικές δοκιμές δεν αποδεικνύουν τον ισχυρισμό για όλους τους ακεραίους.","collatz"],
["math","Υπάρχουν πάντα ομαλές λύσεις Navier–Stokes σε 3D;","Παραμένει ανοικτή η γενική κανονικότητα και ύπαρξη λύσεων για κατάλληλα αρχικά δεδομένα."],
["math","Πώς περιγράφονται οι λύσεις των εξισώσεων Yang–Mills με χάσμα μάζας;","Το γενικό μαθηματικό πρόβλημα παραμένει άλυτο."],
["economics","Πότε γίνεται μια χρηματοπιστωτική κρίση συστημική;","Η μετάδοση κινδύνου εξαρτάται από το δίκτυο εκθέσεων, τη ρευστότητα, τη συμπεριφορά και τους θεσμούς.","contagion"],
["economics","Μπορούμε να προβλέψουμε αξιόπιστα την επόμενη ύφεση;","Τα γεγονότα είναι σπάνια και τα οικονομικά καθεστώτα αλλάζουν· δεν υπάρχει καθολικά αξιόπιστη πρόβλεψη."],
["economics","Γιατί παραμένουν οι ανισότητες;","Αλληλεπιδρούν τεχνολογία, θεσμοί, εκπαίδευση, κεφάλαιο και κληρονομικότητα."],
["economics","Πότε μια αγορά είναι πραγματικά αποτελεσματική;","Οι υποθέσεις πληροφόρησης, ορθολογισμού και ανταγωνισμού δεν ισχύουν πάντα."],
["economics","Πώς συνδυάζονται πληθωρισμός, προσδοκίες και προσφορά;","Οι μηχανισμοί και οι χρονικές υστερήσεις διαφέρουν ανά καθεστώς."],
["chemistry","Μπορούμε να προβλέψουμε απόλυτα το αποτέλεσμα οποιασδήποτε χημικής αντίδρασης;","Οι συνθήκες, το περιβάλλον, οι ενδιάμεσες καταστάσεις και η κινητική δυσκολεύουν τη γενική πρόβλεψη.","reaction"],
["chemistry","Πώς προκύπτει αυτοκατάλυση και χημική αυτο-οργάνωση;","Αντιδράσεις μακριά από την ισορροπία μπορεί να δημιουργούν μοτίβα, χωρίς να αποτελούν απαραίτητα ζωή.","autocatalysis"],
["chemistry","Πώς επιλέγουμε καταλύτη για άγνωστες αντιδράσεις;","Η ετερογενής κατάλυση και οι πολλαπλές επιφάνειες αντιδράσεων παραμένουν δύσκολες προς γενίκευση."],
["chemistry","Πώς υπολογίζουμε πλήρως τη δυναμική πολύπλοκων μορίων;","Οι προσεγγίσεις διαλύτη, ηλεκτρονικής δομής και υψηλής διαστατικότητας έχουν περιορισμούς.","folding"],
["chemistry","Μπορεί η χημεία να εξελιχθεί σε αυτοσυντηρούμενο πληροφοριακό σύστημα;","Η σύνδεση δικτύων αντιδράσεων, αναπαραγωγής και κληρονομικότητας δεν έχει αποσαφηνιστεί πλήρως.","autocatalysis"],
["biology","Πώς ξεκίνησε η ζωή από μη ζωντανή ύλη;","Δεν υπάρχει πλήρως επιβεβαιωμένη ιστορική αλληλουχία από προβιοτική χημεία σε οργανισμούς.","autocatalysis"],
["biology","Γιατί γερνούν οι οργανισμοί;","Πολλοί μοριακοί και εξελικτικοί μηχανισμοί έχουν τεκμηριωθεί, αλλά η συνολική αιτιότητα παραμένει σύνθετη.","aging"],
["biology","Πώς προκύπτει νέα βιολογική πολυπλοκότητα;","Η εξέλιξη περιλαμβάνει μετάλλαξη, επιλογή, τυχαιότητα και οικολογικές αλληλεπιδράσεις.","genetics"],
["biology","Πώς διατηρούνται σταθερά τα οικοσυστήματα;","Η σταθερότητα εξαρτάται από είδη, τροφικά δίκτυα, εξωτερικές διαταραχές και πολλαπλές κλίμακες.","predator"],
["biology","Πώς συνδέεται ο γονότυπος με τον φαινότυπο σε διαφορετικά περιβάλλοντα;","Οι αλληλεπιδράσεις γονιδίων, ρύθμισης και περιβάλλοντος είναι δύσκολες στην ακριβή πρόβλεψη.","genetics"],
["psychology","Γιατί υπάρχει υποκειμενική εμπειρία;","Δεν υπάρχει καθολικά αποδεκτή, πειραματικά επιβεβαιωμένη εξήγηση της υποκειμενικής συνείδησης.","workspace"],
["psychology","Πώς παίρνουμε αποφάσεις υπό αβεβαιότητα;","Συνδυάζονται συσσώρευση αποδείξεων, προτιμήσεις, μάθηση και περιβάλλον.","decision"],
["psychology","Γιατί ορισμένες εμπειρίες γίνονται μακροχρόνιες μνήμες;","Η κωδικοποίηση, η ανάκληση, ο ύπνος και η παρεμβολή αποτελούν ενεργή έρευνα.","memory"],
["psychology","Πώς μαθαίνει ο εγκέφαλος από επιβράβευση και σφάλμα;","Η μάθηση ενίσχυσης εξηγεί ορισμένα μοτίβα, όχι κάθε ανθρώπινη συμπεριφορά.","learning"],
["psychology","Πώς παράγονται τα συναισθήματα και η αυτοαντίληψη;","Διαφορετικές θεωρίες αποδίδουν διαφορετικό ρόλο σε σωματικές, γνωστικές και κοινωνικές διαδικασίες."],
["psychology","Πώς ελέγχονται οι ανταγωνιστικές θεωρίες συνείδησης;","Χρειάζονται προδιαγεγραμμένες, διακριτές και εμπειρικά ελέγξιμες προβλέψεις.","workspace"]
].map(([domain,title,description,model=null,link=null],i)=>({id:"q"+i,domain,title,description,model,link}));
const SPECS=[
{id:"universe",domain:"physics",title:"UNIVERSE: ON / OFF",description:"Στο toy «υπάρχει» ενεργή κατάσταση μόνο αν ξεπεραστεί ένα κατώφλι εκκίνησης.",formula:"P(ON by t)=1−(1−p_eff)^t, p_eff=p(1−θ)",params:[["chance","Πιθανότητα ενεργοποίησης",.001,.2,.03,.001],["threshold","Κατώφλι δραστηριότητας",.05,1,.45,.05]],limit:"ON/OFF είναι συμβολική μεταβλητή προσομοίωσης. Δεν αναπαριστά πραγματική δημιουργία από το τίποτα ή την ύπαρξη του Σύμπαντος.",mode:"status"},
{id:"collatz",domain:"math",title:"COLLATZ EXPLORER",description:"Έλεγξε μια τροχιά ακεραίων και δες αν φτάνει στο 1.",formula:"n → n/2 (άρτιος), 3n+1 (περιττός)",params:[["n","Αρχικός ακέραιος",5,999,27,1]],limit:"Μία ή εκατομμύρια επιτυχημένες τροχιές δεν αποδεικνύουν την εικασία για όλους τους θετικούς ακεραίους.",mode:"sequence"},
{id:"contagion",domain:"economics",title:"BANK CONTAGION",description:"Δίκτυο τραπεζών με έκθεση σε ορισμένους αντισυμβαλλομένους και κεφαλαιακά όρια.",formula:"defaultᵢ = 1{lossᵢ > equityᵢ}",params:[["capital","Όριο κεφαλαίου",.03,.35,.14,.01],["exposure","Διατραπεζική έκθεση",.05,.5,.22,.01],["density","Πυκνότητα δικτύου",.15,.9,.45,.05]],limit:"Ο απλοποιημένος μηχανισμός δεν αναπαριστά ρευστότητα, εποπτεία, συμπεριφορά καταθετών ή πραγματικά τραπεζικά δεδομένα.",mode:"network"},
{id:"reaction",domain:"chemistry",title:"REACTION–DIFFUSION",description:"Μοτίβα Gray–Scott από δύο υποθετικές χημικές ουσίες που αντιδρούν και διαχέονται.",formula:"∂U=Dᵤ∇²U−UV²+F(1−U); ∂V=Dᵥ∇²V+UV²−(F+k)V",params:[["feed","Τροφοδοσία F",.01,.08,.036,.001],["kill","Απομάκρυνση k",.03,.075,.061,.001],["diff","Σχετική διάχυση",.2,.9,.5,.05]],limit:"Μόνο πρότυπο αντίδρασης–διάχυσης σε πλέγμα· δεν προβλέπει προϊόντα πραγματικών αντιδράσεων, καταλύτες ή τη δημιουργία ζωής.",mode:"field"},
{id:"autocatalysis",domain:"chemistry",title:"AUTOCATALYTIC NETWORK",description:"Μια υποθετική αντίδραση που καταναλώνει A και παράγει περισσότερο B υπό συνεχή τροφοδοσία.",formula:"dA/dt=F(1−A)−kAB; dB/dt=kAB−dB",params:[["rate","Ρυθμός k",.1,2,.95,.05],["feed","Εισροή F",.01,.3,.12,.01],["decay","Απώλεια d",.01,.4,.14,.01]],limit:"Η αυτοκατάλυση δεν είναι αυτομάτως ζωή· λείπουν πληροφορία, κληρονομικότητα, μεμβράνες και πραγματικές αντιδράσεις.",mode:"balance"},
{id:"folding",domain:"chemistry",title:"MOLECULAR LANDSCAPE",description:"Τυχαία κίνηση ενός βαθμού ελευθερίας σε διπλό ενεργειακό πηγάδι.",formula:"dX=−∂E/∂X dt+σdW; E=x⁴/4−ax²/2+bx",params:[["well","Βάθος πηγαδιού a",.4,3,1.6,.1],["temp","Θόρυβος / T",.01,1,.32,.01],["bias","Ασυμμετρία b",-.7,.7,0,.05]],limit:"Δεν είναι δομική πρόβλεψη πρωτεΐνης ούτε μοριακή δυναμική. Είναι εκπαιδευτικό σχήμα ενεργειακής επιφάνειας.",mode:"landscape"},
{id:"predator",domain:"biology",title:"ECOSYSTEM DYNAMICS",description:"Δύο αλληλεπιδρώντες πληθυσμοί θηραμάτων και θηρευτών.",formula:"dx/dt=αx−βxy; dy/dt=δxy−γy",params:[["growth","Αύξηση α",.2,2,.9,.1],["capture","Θήρευση β",.1,1.5,.55,.05],["mortality","Θνησιμότητα γ",.1,1,.5,.05]],limit:"Το Lotka–Volterra αγνοεί πολλαπλά είδη, εποχικότητα, χωρική δομή και περιορισμούς πόρων.",mode:"balance"},
{id:"genetics",domain:"biology",title:"EVOLUTION / GENETIC DRIFT",description:"Στοχαστική μεταβολή συχνότητας ενός αλληλομόρφου σε πεπερασμένο πληθυσμό.",formula:"Kₜ₊₁∼Binomial(2N,pₜ′)",params:[["pop","Διπλοειδής πληθυσμός N",10,250,80,10],["selection","Επιλογή s",-.2,.2,.02,.01],["mutation","Μετάλλαξη μ",0,.02,.002,.001]],limit:"Απλοποιημένο Wright–Fisher, χωρίς πραγματικά γονιδιώματα, πληθυσμιακή δομή ή σύνθετους φαινότυπους.",mode:"frequency"},
{id:"aging",domain:"biology",title:"CELL DAMAGE VS REPAIR",description:"Ισορροπία υποθετικής κυτταρικής βλάβης και επιδιόρθωσης.",formula:"dD/dt=λ(1−D)−ρD",params:[["damage","Σχηματισμός βλάβης λ",.002,.15,.06,.002],["repair","Επιδιόρθωση ρ",.002,.15,.04,.002]],limit:"Το D δεν είναι βιολογική ηλικία ή πρόβλεψη υγείας. Καμία ρύθμιση δεν αναπαριστά αγωγή αναζωογόνησης.",mode:"single"},
{id:"decision",domain:"psychology",title:"DECISION UNDER UNCERTAINTY",description:"Συσσώρευση θορυβώδους πληροφορίας μέχρι να φτάσει σε όριο απόφασης.",formula:"dX=v dt+σdW; απόφαση όταν |X|≥a",params:[["drift","Στοιχείο / drift",-.3,.3,.06,.01],["noise","Θόρυβος σ",.05,.7,.28,.01],["bound","Όριο απόφασης a",.3,1.7,1,.05]],limit:"Το drift-diffusion περιγράφει μία απλή γνωστική διαδικασία, όχι προσωπικότητα, ψυχική υγεία ή όλες τις ανθρώπινες αποφάσεις.",mode:"decision"},
{id:"learning",domain:"psychology",title:"REWARD LEARNING",description:"Δύο επιλογές ανταμοιβής και εκμάθηση προσδοκιών με σφάλμα πρόβλεψης.",formula:"Qₐ ← Qₐ+α(r−Qₐ)",params:[["alpha","Ρυθμός μάθησης α",.02,.95,.3,.01],["explore","Πιθανότητα εξερεύνησης",0,.8,.16,.02],["reward","Ανταμοιβή επιλογής Α",.05,.95,.65,.05]],limit:"Δεν αποτελεί προσομοίωση ανθρώπινου νου, διάγνωσης ή πραγματικής νευρωνικής δραστηριότητας.",mode:"balance"},
{id:"memory",domain:"psychology",title:"MEMORY & INTERFERENCE",description:"Απλή καμπύλη αποδυνάμωσης και ανανέωσης συμβολικής μνημονικής ισχύος.",formula:"dM/dt=−λM−ιM; recall: M←M+(1−M)r",params:[["forget","Ρυθμός λ",.005,.12,.045,.005],["interfere","Παρεμβολή ι",0,.07,.018,.002],["boost","Ενίσχυση ανάκλησης r",.1,.8,.4,.05]],limit:"Δεν προσομοιώνει πραγματικά επεισοδιακές αναμνήσεις, συναισθήματα ή την κλινική λειτουργία της μνήμης.",mode:"single"},
{id:"workspace",domain:"psychology",title:"GLOBAL BROADCAST TOY",description:"Δίκτυο κόμβων όπου μια ενεργή είσοδος μπορεί να διαδοθεί καθολικά.",formula:"aᵢ(t+1)=1{wΣⱼaⱼ+stimᵢ>θ}",params:[["coupling","Σύζευξη w",.05,1,.35,.05],["threshold","Κατώφλι θ",.1,.9,.43,.05],["stimulus","Ερέθισμα",0,1,.6,.05]],limit:"Η καθολική μετάδοση πληροφορίας ΔΕΝ μετρά υποκειμενική εμπειρία ούτε αποδεικνύει θεωρία συνείδησης.",mode:"network"}
];
const BY_ID=Object.fromEntries(SPECS.map(x=>[x.id,x]));
function create(id,custom={},seed=2026){const spec=BY_ID[id];if(!spec)throw Error("Unknown toy "+id);const random=rng(seed),s={id,spec,seed,p:{},t:0,history:[],events:0};
 for(const [k,,lo,hi,val]of spec.params){const v=Number(custom[k]);s.p[k]=clamp(Number.isFinite(v)?v:val,lo,hi);}
 const p=s.p;
 function init(){s.t=0;s.history=[];s.events=0;
 if(id==="universe"){s.active=false;s.energy=0;}
 else if(id==="collatz"){s.value=Math.round(p.n);s.origin=s.value;s.max=s.value;s.finished=s.value===1;s.sequence=[s.value];}
 else if(id==="contagion"){s.banks=Array.from({length:12},(_,i)=>({x:.5+.37*Math.cos(2*Math.PI*i/12),y:.5+.37*Math.sin(2*Math.PI*i/12),equity:p.capital*(.75+.5*random()),failed:i===0}));
 s.links=[];for(let i=0;i<12;i++)for(let j=i+1;j<12;j++)if(random()<p.density)s.links.push({i,j,w:p.exposure*(.5+random())});}
 else if(id==="reaction"){s.size=55;s.u=new Float64Array(55*55);s.v=new Float64Array(55*55);for(let y=0;y<55;y++)for(let x=0;x<55;x++){const k=y*55+x;s.u[k]=1;if(Math.abs(x-27)<7&&Math.abs(y-27)<7){s.v[k]=.5+.5*random();s.u[k]=.5;}}}
 else if(id==="autocatalysis"){s.A=.92;s.B=.08;}
 else if(id==="folding"){s.x=-Math.sqrt(p.well);s.energy=0;}
 else if(id==="predator"){s.x=1.4;s.y=.8;}
 else if(id==="genetics"){s.frequency=.5;s.copies=Math.round(2*p.pop*s.frequency);}
 else if(id==="aging"){s.damage=.12;}
 else if(id==="decision"){s.evidence=0;s.decision=0;s.trials=0;s.positive=0;s.latency=0;s.trialSteps=0;}
 else if(id==="learning"){s.Q=[.5,.5];s.count=[0,0];s.success=0;s.lastAction=0;}
 else if(id==="memory"){s.memory=1;s.recalls=0;}
 else if(id==="workspace"){s.nodes=Array.from({length:25},(_,i)=>({x:.08+(i%5)*.21,y:.09+Math.floor(i/5)*.205,a:i===12?1:0}));s.broadcast=0;}
 s.history.push({t:0,y:metric().value});}
 function metric(){
 if(id==="universe")return{value:s.active?1:0,label:s.active?"TOY: ON":"TOY: OFF",status:s.active?"ΕΝΕΡΓΗ ΚΑΤΑΣΤΑΣΗ":"ΑΝΕΝΕΡΓΗ ΚΑΤΑΣΤΑΣΗ"};
 if(id==="collatz")return{value:s.value,label:"Τρέχων ακέραιος",status:s.finished?"ΕΦΤΑΣΕ ΣΤΟ 1":"ΥΠΟΛΟΓΙΖΕΤΑΙ"};
 if(id==="contagion"){const n=s.banks.filter(x=>x.failed).length;return{value:n,label:"Αθετήσεις / 12",status:n===12?"ΟΛΙΚΗ ΜΕΤΑΔΟΣΗ":n===1?"ΜΟΝΟ ΑΡΧΙΚΟ ΣΟΚ":"ΔΙΑΔΟΣΗ ΣΤΟ ΔΙΚΤΥΟ"};}
 if(id==="reaction"){const avg=mean(Array.from(s.v));return{value:avg,label:"Μέση συγκέντρωση V",status:"ΧΗΜΙΚΟ ΜΟΤΙΒΟ"};}
 if(id==="autocatalysis")return{value:s.B,label:"Υποθετική συγκέντρωση B",status:"ΧΗΜΙΚΗ ΑΥΤΟΚΑΤΑΛΥΣΗ"};
 if(id==="folding")return{value:s.energy,label:"Toy ενέργεια E(x)",status:"ΣΤΟΧΑΣΤΙΚΗ ΚΙΝΗΣΗ"};
 if(id==="predator")return{value:s.y,label:"Πληθυσμός θηρευτών",status:"ΔΥΝΑΜΙΚΗ ΠΛΗΘΥΣΜΩΝ"};
 if(id==="genetics")return{value:s.frequency,label:"Συχνότητα αλληλομόρφου",status:"ΤΥΧΑΙΑ ΓΕΝΕΤΙΚΗ ΜΕΤΑΒΟΛΗ"};
 if(id==="aging")return{value:s.damage,label:"Υποθετικό φορτίο D",status:"ΜΟΝΤΕΛΟ ΒΛΑΒΗΣ"};
 if(id==="decision")return{value:s.evidence,label:"Συσσωρευμένη ένδειξη",status:s.decision?"ΕΠΙΛΟΓΗ "+(s.decision>0?"Α":"Β"):"ΣΥΣΣΩΡΕΥΣΗ"};
 if(id==="learning")return{value:s.Q[0]-s.Q[1],label:"Διαφορά αξιών QΑ−QΒ",status:"ΔΟΚΙΜΕΣ "+s.t};
 if(id==="memory")return{value:s.memory,label:"Toy μνημονική ισχύς",status:"ΑΝΑΚΛΗΣΕΙΣ "+s.recalls};
 if(id==="workspace")return{value:s.broadcast,label:"Ενεργοί κόμβοι / 25",status:s.broadcast>=20?"ΕΚΤΕΤΑΜΕΝΗ ΜΕΤΑΔΟΣΗ":"ΤΟΠΙΚΗ ΔΡΑΣΤΗΡΙΟΤΗΤΑ"};
 return{value:0,label:"",status:""};
 }
 function step(){
 s.t++;
 if(id==="universe"){if(!s.active&&random()<p.chance*(1-p.threshold))s.active=true;if(s.active)s.energy=clamp(s.energy+.05*(1-s.energy),0,1);}
 else if(id==="collatz"){if(!s.finished){const n=s.value,nn=n%2===0?n/2:3*n+1;if(!Number.isSafeInteger(nn)){s.finished=true;s.stoppedForPrecision=true;}else{s.value=nn;s.max=Math.max(s.max,nn);s.sequence.push(nn);if(nn===1)s.finished=true;}}}
 else if(id==="contagion"){const failedNow=new Set(s.banks.map((b,i)=>b.failed?i:-1).filter(i=>i>=0)),loss=Array(12).fill(0);
 for(const e of s.links){if(failedNow.has(e.i))loss[e.j]+=e.w;if(failedNow.has(e.j))loss[e.i]+=e.w;}
 s.banks.forEach((b,i)=>{if(!b.failed&&loss[i]>b.equity)b.failed=true;});}
 else if(id==="reaction"){const N=s.size,len=N*N,U=s.u,V=s.v,nu=new Float64Array(len),nv=new Float64Array(len);for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,L=y*N+(x+N-1)%N,R=y*N+(x+1)%N,T=((y+N-1)%N)*N+x,B=((y+1)%N)*N+x,u=U[i],v=V[i],uvv=u*v*v;
 const lapU=U[L]+U[R]+U[T]+U[B]-4*u,lapV=V[L]+V[R]+V[T]+V[B]-4*v;
 nu[i]=clamp(u+p.diff*.25*lapU-uvv+p.feed*(1-u),0,1.5);nv[i]=clamp(v+.13*lapV+uvv-(p.feed+p.kill)*v,0,1.5);}
 s.u=nu;s.v=nv;}
 else if(id==="autocatalysis"){const dt=.12,flux=p.rate*s.A*s.B;s.A=clamp(s.A+dt*(p.feed*(1-s.A)-flux),0,2);s.B=clamp(s.B+dt*(flux-p.decay*s.B),0,2);}
 else if(id==="folding"){const dt=.045,grad=Math.pow(s.x,3)-p.well*s.x+p.bias;s.x=clamp(s.x-grad*dt+Math.sqrt(dt)*p.temp*normal(random),-3.2,3.2);s.energy=Math.pow(s.x,4)/4-p.well*s.x*s.x/2+p.bias*s.x;}
 else if(id==="predator"){const dt=.055,dx=p.growth*s.x-p.capture*s.x*s.y,dy=.38*p.capture*s.x*s.y-p.mortality*s.y;s.x=clamp(s.x+dt*dx,0,7);s.y=clamp(s.y+dt*dy,0,7);}
 else if(id==="genetics"){const N=Math.round(p.pop)*2,f=s.frequency,selected=clamp((f*(1+p.selection))/(1+p.selection*f),0,1),q=clamp(selected*(1-p.mutation)+(1-selected)*p.mutation,0,1);let count=0;for(let i=0;i<N;i++)if(random()<q)count++;s.copies=count;s.frequency=count/N;}
 else if(id==="aging"){s.damage=clamp(s.damage+.25*(p.damage*(1-s.damage)-p.repair*s.damage),0,1);}
 else if(id==="decision"){s.decision=0;s.trialSteps++;s.evidence+=p.drift*.08+p.noise*Math.sqrt(.08)*normal(random);if(Math.abs(s.evidence)>=p.bound){s.decision=Math.sign(s.evidence);s.positive+=s.decision>0?1:0;s.trials++;s.latency=s.trialSteps*.08;s.evidence=0;s.trialSteps=0;}}
 else if(id==="learning"){let choice=random()<p.explore?(random()<.5?0:1):s.Q[0]>=s.Q[1]?0:1;let success=random()<(choice===0?p.reward:1-p.reward);s.Q[choice]+=p.alpha*((success?1:0)-s.Q[choice]);s.count[choice]++;if(success)s.success++;s.lastAction=choice;}
 else if(id==="memory"){s.memory=clamp(s.memory*Math.exp(-.14*(p.forget+p.interfere)),0,1);}
 else if(id==="workspace"){const old=s.nodes.map(x=>x.a),meanOn=mean(old),activeCount=old.filter(v=>v>0).length;s.nodes.forEach((n,i)=>{const local=(old[(i+24)%25]+old[(i+1)%25]+old[(i+20)%25]+old[(i+5)%25])/4;const stim=i===12&&s.t%8===0?p.stimulus:0;const x=p.coupling*(1.25*local+meanOn*.8)+stim+.08*random();n.a=x>p.threshold?1:0;});s.broadcast=s.nodes.filter(n=>n.a).length;}
 if(id!=="reaction"&&id!=="collatz"&&id!=="workspace"||s.t%2===0){s.history.push({t:s.t,y:metric().value});if(s.history.length>360)s.history.shift();}
 return metric();
 }
 function interact(x=.5,y=.5){
 if(id==="universe"){s.active=!s.active;s.energy=s.active?.15:0;}
 else if(id==="collatz"){p.n=clamp(Math.round(5+x*994),5,999);init();}
 else if(id==="contagion"){const i=clamp(Math.floor(x*12),0,11);s.banks[i].failed=true;}
 else if(id==="reaction"){const N=s.size,cx=Math.floor(x*N),cy=Math.floor(y*N);for(let yy=-4;yy<=4;yy++)for(let xx=-4;xx<=4;xx++){const i=((cy+yy+N)%N)*N+((cx+xx+N)%N);s.v[i]=.8;s.u[i]=.2;}}
 else if(id==="autocatalysis"){s.B=clamp(s.B+.2,0,2);}
 else if(id==="folding"){s.x=-3+6*x;}
 else if(id==="predator"){s.x+=x;s.y+=y;}
 else if(id==="genetics"){s.frequency=x;s.copies=Math.round(x*2*p.pop);}
 else if(id==="aging"){s.damage=clamp(x,0,1);}
 else if(id==="decision"){s.evidence=(x-.5)*2*p.bound;}
 else if(id==="learning"){s.Q[0]=x;s.Q[1]=y;}
 else if(id==="memory"){s.memory+=p.boost*(1-s.memory);s.recalls++;}
 else if(id==="workspace"){const i=clamp(Math.floor(y*5)*5+Math.floor(x*5),0,24);s.nodes[i].a=1;}
 }
 function reset(){init();}
 init();return{state:s,step,interact,reset,metric};
}
return{DOMAINS,QUESTIONS,SPECS,create,rng,normal,clamp};
});