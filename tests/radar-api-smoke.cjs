"use strict";
const assert=require("node:assert/strict");
const handler=require("../api/radar.js");
const oldFetch=global.fetch;
const today=new Date().toISOString(),rssDate=new Date().toUTCString();
const atom='<?xml version="1.0"?><feed><entry><id>http://arxiv.org/abs/2611.55555</id><title>New quantum gravity toy</title><published>'+today+'</published><summary>We find an exact formula inside a prescribed simulation.</summary><author><name>Researcher</name></author></entry></feed>';
const rss='<rss><channel><item><title>NASA science briefing</title><link>https://science.nasa.gov/press/example/</link><pubDate>'+rssDate+'</pubDate><description>Scientists announce a new instrument result.</description></item></channel></rss>';
function mockResponse(text,code=200){return{ok:code>=200&&code<300,status:code,headers:{get:()=>String(text.length)},text:async()=>text};}
function response(){return{code:0,headers:{},body:null,setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(v){this.body=v;return this;}};}
(async()=>{
try{
 let calls=[];
 global.fetch=async url=>{calls.push(url);if(url.includes("export.arxiv.org"))return mockResponse(atom);if(url.includes("science.nasa.gov"))return mockResponse(rss);throw Error("Other mock feeds offline");};
 let res=response();await handler({method:"GET",query:{kind:"papers",topic:"gravity",days:"30"}},res);
 assert.equal(res.code,200);assert.equal(res.body.items.length,1);assert.equal(res.body.items[0].source,"arXiv");assert.equal(res.body.items[0].url,"https://arxiv.org/abs/2611.55555");assert(calls.some(x=>x.includes("sortBy=submittedDate")));
 assert(res.headers["Cache-Control"].includes("s-maxage=900"));
 res=response();await handler({method:"GET",query:{kind:"news",topic:"all",days:"30",source:"nasa"}},res);
 assert.equal(res.code,200);assert.equal(res.body.items.length,1);assert.equal(res.body.items[0].source,"NASA Science");
 res=response();await handler({method:"POST",query:{}},res);assert.equal(res.code,405);
 global.fetch=async()=>{throw Error("offline upstream");};
 res=response();await handler({method:"GET",query:{kind:"papers",topic:"quantum"}},res);
 assert.equal(res.code,503);assert.equal(res.body.items.length,0);assert(!res.body.items.some(x=>x.title==="Sample research"));
 console.log("PASS Research Radar API: live-source normalization, bounded filters, source provenance, news, no-fabrication failure");
}catch(e){console.error(e);process.exitCode=1;}finally{global.fetch=oldFetch;}
})();
