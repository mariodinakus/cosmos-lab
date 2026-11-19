/* COSMOS LAB — live papers and official science news; no invented articles or summaries.
 * Vercel serverless endpoint: GET /api/radar?kind=papers|news&topic=...&days=7|30|90
 * Source metadata: arXiv Atom, fallback OpenAlex, NASA Science / CERN / APS RSS.
 * No API key required for primary sources. Every request uses fixed upstream URLs.
 */
const R=require("../radar-core.js");
const NEWS_SOURCES={
 nasa:{name:"NASA Science",url:"https://science.nasa.gov/feed/"},
 cern:{name:"CERN",url:"https://home.cern/api/news/news/feed.rss"},
 aps:{name:"APS Physics",url:"https://feeds.aps.org/rss/recent/physics.xml"}
};
const OPENALEX_QUERIES={
 all:"quantum gravity cosmology",
 cosmology:"cosmology dark energy",
 gravity:"gravitational waves black holes",
 quantum:"quantum entanglement",
 particles:"particle physics neutrinos",
 foundations:"quantum gravity unification"
};
function timeout(ms=10500){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),ms);return{signal:controller.signal,done:()=>clearTimeout(timer)};}
async function readFeed(url,limit=2700000){const timer=timeout();try{
 const response=await fetch(url,{signal:timer.signal,headers:{"User-Agent":"COSMOS-LAB-Research-Radar/1.0 (+https://github.com/mariodinakus/cosmos-lab)","Accept":"application/atom+xml, application/rss+xml, application/xml, text/xml, application/json;q=0.9"}});
 if(!response.ok)throw Error("Upstream returned HTTP "+response.status);
 const len=Number(response.headers.get("content-length")||0);if(len>limit)throw Error("Feed too large");
 const body=await response.text();if(body.length>limit)throw Error("Feed too large");return body;
 }finally{timer.done();}}
async function arxiv(topic){const u=new URL("https://export.arxiv.org/api/query");u.searchParams.set("search_query",R.TOPICS[topic].arxiv);u.searchParams.set("start","0");u.searchParams.set("max_results","75");u.searchParams.set("sortBy","submittedDate");u.searchParams.set("sortOrder","descending");return R.parseAtom(await readFeed(u.toString()),topic);}
function reconstruct(index){if(!index||typeof index!=="object")return"";const words=[];for(const [word,positions]of Object.entries(index)){if(!Array.isArray(positions))continue;for(const pos of positions)if(Number.isInteger(pos)&&pos>=0&&pos<3000)words[pos]=word;}return words.map(v=>v||"").join(" ").replace(/\s+/g," ").trim();}
async function openAlex(topic,days){const from=new Date(Date.now()-days*86400000).toISOString().slice(0,10);const u=new URL("https://api.openalex.org/works");
 u.searchParams.set("search",OPENALEX_QUERIES[topic]);u.searchParams.set("filter","from_publication_date:"+from+",has_abstract:true");u.searchParams.set("sort","publication_date:desc");u.searchParams.set("per_page","35");
 if(process.env.OPENALEX_API_KEY)u.searchParams.set("api_key",process.env.OPENALEX_API_KEY);
 const raw=JSON.parse(await readFeed(u.toString()));return(raw.results||[]).map(x=>{const title=R.clean(x.display_name||x.title),url=R.safeUrl(x.doi||x.primary_location?.landing_page_url||x.id),abstract=R.clean(reconstruct(x.abstract_inverted_index));
 return{id:"openalex:"+x.id,kind:"paper",source:"OpenAlex",topic,title,abstract,published:x.publication_date?new Date(x.publication_date+"T12:00:00Z").toISOString():"",authors:(x.authorships||[]).slice(0,6).map(a=>a.author?.display_name).filter(Boolean),category:"indexed paper",url,pdfUrl:R.safeUrl(x.best_oa_location?.pdf_url||""),peerReviewed:null};}).filter(x=>x.url&&x.title&&x.abstract&&Number.isFinite(Date.parse(x.published)));}
async function papers(topic,days){try{const items=await arxiv(topic);if(items.length)return{items,feed:"arXiv",warnings:[]};throw Error("empty arXiv response");}catch(first){try{const alt=await openAlex(topic,days);return{items:alt,feed:"OpenAlex",warnings:["arXiv unavailable; OpenAlex bibliographic records used instead. Peer review is not independently verified."]};}
catch(second){const error=new Error("Neither arXiv nor OpenAlex was available");error.details=[String(first.message||first),String(second.message||second)];throw error;}}}
async function news(source){const keys=source==="all"?["nasa","cern","aps"]:[source];const res=await Promise.allSettled(keys.map(async key=>R.parseRSS(await readFeed(NEWS_SOURCES[key].url),NEWS_SOURCES[key].name)));
const items=[],warnings=[];res.forEach((part,i)=>{if(part.status==="fulfilled")items.push(...part.value);else warnings.push(NEWS_SOURCES[keys[i]].name+": upstream unavailable");});if(!items.length)throw Error("All institutional science news feeds were unavailable");return{items,feed:keys.map(k=>NEWS_SOURCES[k].name).join(", "),warnings};}
module.exports=async function handler(req,res){
 if(req.method!=="GET"){res.setHeader("Allow","GET");return res.status(405).json({error:"Method not allowed"});}
 const kind=req.query.kind==="news"?"news":"papers",topic=Object.hasOwn(R.TOPICS,req.query.topic)?req.query.topic:"all";
 const days=[7,30,90].includes(Number(req.query.days))?Number(req.query.days):30;
 const source=Object.hasOwn(NEWS_SOURCES,req.query.source)?req.query.source:"all";
 res.setHeader("Content-Type","application/json; charset=utf-8");
 res.setHeader("Cache-Control","public, s-maxage=900, stale-while-revalidate=3600");
 try{const result=kind==="news"?await news(source):await papers(topic,days);
 const now=Date.now(),range=days*86400000;
 const filtered=R.dedupe(result.items).filter(x=>{const t=Date.parse(x.published);return Number.isFinite(t)&&t<=now+86400000&&now-t<=range &&(kind==="papers"||R.relevant(x,topic));}).slice(0,45);
 return res.status(200).json({kind,topic,days,source:result.feed,asOf:new Date().toISOString(),count:filtered.length,items:filtered,warnings:result.warnings,notes:"Papers are abstracts/metadata, not independently reviewed full texts. News entries originate from the named institutional feeds. This endpoint does not generate new scientific claims."});
 }catch(e){res.setHeader("Cache-Control","no-store");return res.status(503).json({error:"Live scientific feeds temporarily unavailable",details:Array.isArray(e.details)?e.details:[String(e.message||e)],items:[],asOf:new Date().toISOString(),kind,topic,days});}
};
