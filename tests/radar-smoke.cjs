"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=require("../radar-core.js"),root=path.resolve(__dirname,"..");
const atom=`<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">
<entry><id>http://arxiv.org/abs/2611.12345v1</id><title>Quantum gravity &amp; causal correlations</title>
<published>2026-11-19T16:00:00Z</published><updated>2026-11-19T17:00:00Z</updated>
<summary>We present a numerical toy model of correlated geometries. We do not derive Einstein equations.</summary>
<author><name>Researcher A</name></author>
<arxiv:primary_category xmlns:arxiv="http://arxiv.org/schemas/atom" term="gr-qc"/></entry></feed>`;
const rss=`<rss version="2.0"><channel><item><title><![CDATA[New detector results &amp; next steps]]></title>
<link>https://science.nasa.gov/example/</link><pubDate>Thu, 19 Nov 2026 12:00:00 GMT</pubDate>
<description><![CDATA[<p>Scientists report new measurements under review.</p>]]></description></item></channel></rss>`;
const papers=R.parseAtom(atom,"gravity");assert.equal(papers.length,1);
assert.equal(papers[0].source,"arXiv");
assert.equal(papers[0].url,"https://arxiv.org/abs/2611.12345v1");
assert.equal(papers[0].title,"Quantum gravity & causal correlations");
assert.equal(papers[0].authors[0],"Researcher A");
assert.equal(papers[0].peerReviewed,false);
assert.equal(papers[0].category,"gr-qc");
const news=R.parseRSS(rss,"NASA Science");assert.equal(news.length,1);
assert.equal(news[0].url,"https://science.nasa.gov/example/");
assert(news[0].abstract.includes("new measurements"));
assert.equal(R.safeUrl("javascript:alert(1)"),"");
assert.equal(R.clean("<script>alert(1)</script><b>Hello</b>"),"Hello");
assert.equal(R.dedupe([...papers,...papers,...news]).length,2);
assert(R.relevant(papers[0],"gravity"));
const analysis=R.explain(papers[0]);
assert(analysis.claim.includes("We present a numerical toy model"));
assert(analysis.implication.includes("Εφόσον"));
assert(analysis.caveat.includes("preprints"));
assert(analysis.caveat.includes("κβαντική βαρύτητα"));
assert(analysis.basis.includes("abstract"));
assert(analysis.status.includes("PREPRINT"));

const detailedSample={
 kind:"paper",source:"arXiv",topic:"gravity",
 title:"Not all black holes decohere quantum superpositions",
 abstract:"We study the decoherence induced by near-extremal charged black holes on quantum systems in their exterior. Specifically, we analyze a thought experiment where a charged particle is prepared in a spatial superposition. We show that, at late times, if the black hole is sufficiently close to extremality, these quantum gravity effects make the decoherence rate vanish. This phenomenon is due to a spin-induced energy gap in the quantum black hole spectrum. However, these results are limited to a specified near-extremal regime."
};
const expanded=R.summaryBreakdown(detailedSample);
assert(expanded.intro.includes("θεωρητική"),"thought experiment must not be described as a measured discovery");
assert(expanded.objective.includes("We study the decoherence"),"study objective should come from source");
assert(expanded.method.includes("thought experiment"),"methods should be source-specific");
assert(expanded.finding.includes("decoherence rate vanish"),"specific finding must be retained");
assert(expanded.finding.includes("energy gap"),"explanatory follow-up should be retained");
assert(expanded.actualLimit.includes("limited to"),"explicit source limitation retained");
assert(expanded.terms.some(x=>x.name==="Αποσυνοχή"),"glossary for discipline terms");
assert(!expanded.finding.includes("confirmed by NASA"),"do not invent independent confirmation");
assert(!expanded.finding.includes("Εφόσον"),"finding field should not contain invented generic inferences");
const limited=R.summaryBreakdown({kind:"paper",topic:"quantum",title:"New mathematical approach",abstract:"We present a mathematical relation. Details are reserved for a subsequent publication."});
assert(limited.finding.includes("Δεν εντοπίζεται"),"lack of explicit results must be acknowledged");
assert(limited.actualLimit.includes("Δεν διατυπώνεται"),"missing explicit limitation must be acknowledged");
assert(limited.quality.includes("σύντομο"),"incomplete source must not appear comprehensive");
const shortCard=fs.readFileSync(path.join(root,"radar.js"),"utf8");
assert(shortCard.includes("meta.expanded"),"UI must use source-specific breakdown");
assert(shortCard.includes("ΜΕ ΑΠΛΑ ΛΟΓΙΑ"),"Greek contextual reading");
assert(shortCard.includes("ΠΩΣ ΤΟ ΕΞΕΤΑΣΑΝ"),"methodology in detail");
assert(shortCard.includes("ΠΕΡΙΟΡΙΣΜΟΙ ΠΟΥ ΑΝΑΦΕΡΕΙ"),"source limitations in detail");
assert(!shortCard.includes("innerHTML"),"Never inject paper HTML");

const np=R.explain(news[0]);assert(np.caveat.includes("ανακοίνωση"));
assert.equal(Object.keys(R.TOPICS).length,6);
const page=fs.readFileSync(path.join(root,"radar.html"),"utf8");
for(const id of ["papersTab","newsTab","savedTab","sourcePicker","topic","days","newsSource","search","refresh","cards","status","digest","count","empty"])
 assert(page.includes('id="'+id+'"'),"Missing radar control: "+id);
for(const file of ["radar-core.js","radar.js","radar.css","radar.html","radar-preview.js","api/radar.js"])
 assert(fs.existsSync(path.join(root,file)),"Missing "+file);
for(const f of ["radar-core.js","radar.js","radar-preview.js","api/radar.js"])
 assert.doesNotThrow(()=>new Function(fs.readFileSync(path.join(root,f),"utf8")),f+" syntax");
const api=fs.readFileSync(path.join(root,"api/radar.js"),"utf8");
assert(api.includes("export.arxiv.org/api/query")&&api.includes("openalex.org/works"));
assert(api.includes("science.nasa.gov/feed/")&&api.includes("home.cern/api/news/news/feed.rss"));
assert(api.includes("s-maxage=900"),"Cache upstream API traffic");
const js=fs.readFileSync(path.join(root,"radar.js"),"utf8");
assert(!js.includes("innerHTML"),"Source data must be inserted as text, never untrusted HTML");
for(const f of ["index.html","hub.html","reality.html","studio.html","observatory.html","chaos.html","toybox.html","frontier.html","gravity.html"])
 assert(fs.readFileSync(path.join(root,f),"utf8").includes('href="/radar.html"'),"Navigation missing: "+f);
const hub=fs.readFileSync(path.join(root,"hub.html"),"utf8");
assert(hub.includes('id="radarPreviewItems"')&&hub.includes("09</strong>"),"Hub preview or nine workspace count missing");
const config=JSON.parse(fs.readFileSync(path.join(root,"vercel.json"),"utf8"));
assert(config.rewrites.some(r=>r.source==="/radar"&&r.destination==="/radar.html"));
console.log("PASS Research Radar: Atom and RSS metadata, source distinction, cautious implications, security, UI, navigation");
