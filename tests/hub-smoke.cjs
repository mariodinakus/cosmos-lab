"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const load=file=>fs.readFileSync(path.join(root,file),"utf8");
const sandbox={window:{}};vm.runInNewContext(load("hub-catalog.js"),sandbox);
const catalog=sandbox.window.COSMOS_HUB_MODELS;
assert.equal(catalog.length,54,"expected 54 listed toy models");
const specs=[
 ["toy","toy-core.js","toybox.html",15],
 ["frontier","frontier-core.js","frontier.html",13],
 ["gravity","gravity-core.js","gravity.html",3],
 ["reality","reality-core.js","reality.html",10],
 ["open","open-core.js","open.html",13]
];
for(const [category,core,page,count]of specs){
 const api=require(path.join(root,core));
 const modes=api.MODES||api.MODULES||api.SPECS;
 assert.equal(modes.length,count,core+" engine count drift");
 const entries=catalog.filter(m=>m.category===category);
 assert.equal(entries.length,count,category+" catalog count drift");
 for(const model of modes){
 const entry=entries.find(x=>x.id===model.id);
 assert(entry,category+" missing model "+model.id);
 assert.equal(entry.href,"/"+page+"?model="+encodeURIComponent(model.id));
 assert.equal(entry.title,model.title);
 }
}
const set=new Set(catalog.map(x=>x.href));
assert.equal(set.size,54,"each model must have a unique deep link");
const page=load("hub.html");
for(const id of ["results","resultCount","search","filters","random","emptyMessage"])
 assert(page.includes('id="'+id+'"'),"missing hub UI control "+id);
for(const name of ["index.html","reality.html","gravity.html","frontier.html","toybox.html","chaos.html","studio.html","observatory.html","open.html"]){
 assert(load(name).includes('href="/hub.html"'),"missing all-labs navigation "+name);
}
const workspacePaths=["/","/studio.html","/observatory.html","/chaos.html","/toybox.html","/frontier.html","/gravity.html","/reality.html","/radar.html","/open.html"];
for(const href of workspacePaths)assert(page.includes('href="'+href+'"'),"workspace not found "+href);
for(const file of ["hub.html","hub.css","hub-catalog.js","hub.js"])assert(fs.existsSync(path.join(root,file)),file+" missing");
assert.doesNotThrow(()=>new Function(load("hub.js")),"hub script syntax");
const vercel=JSON.parse(load("vercel.json"));
for(const source of ["/hub","/all"])assert(vercel.rewrites.some(r=>r.source===source&&r.destination==="/hub.html"),"missing route "+source);
console.log("PASS COSMOS Hub: 54 verified models, 10 laboratories, deep links, menus, route config and syntax");
