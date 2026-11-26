/* Browser-free UI navigation smoke for NoteQuest world foundations.
   Run: node tests/worlds_node.js
   Does not substitute for a real browser / accessibility / tablet test. */
"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
class FakeNode {
  constructor(tag){this.tag=tag;this.children=[];this.parent=null;this.className="";this.style={setProperty:()=>{}};this.dataset={};this.classList={add:x=>{this.className+=" "+x}}}
  append(...children){for(const child of children){this.children.push(child);child.parent=this}return this}
  setAttribute(k,v){this[k]=v}
  addEventListener(k,cb){(this.events??={})[k]=cb}
  querySelectorAll(selector){const result=[];const cl=selector.startsWith(".")?selector.slice(1):null;const walk=n=>{for(const child of n.children){if(cl&&child.className.split(" ").includes(cl))result.push(child);walk(child)}};walk(this);return result}
  remove(){if(this.parent){this.parent.children=this.parent.children.filter(x=>x!==this);this.parent=null}}
}
const doc={createElement:tag=>new FakeNode(tag),createElementNS:(uri,tag)=>new FakeNode(tag),getElementById:()=>null};
const window={};
const ctx=vm.createContext({window,document:doc});
vm.runInContext(read("assets/nq-worlds-data-v0.1.js"),ctx,{filename:"nq-worlds-data-v0.1.js"});
vm.runInContext(read("assets/nq-worlds-v0.1.js"),ctx,{filename:"nq-worlds-v0.1.js"});
const ui=window.NoteQuestWorlds, data=window.NQ_WORLD_DATA;
const routeCalls=[],route=(...args)=>routeCalls.push(args),rootNode=new FakeNode("main");
let passed=0;
function test(name,fn){try{fn();passed++;process.stdout.write("PASS "+name+"\n")}catch(error){process.stderr.write("FAIL "+name+": "+String(error)+"\n");process.exitCode=1}}
test("hub 9 world cards",()=>{ui.renderHub(rootNode,route,{name:"Test Explorer"},undefined);assert.equal(rootNode.querySelectorAll(".nqw-world-card").length,9)});
for(const world of data.worlds){
  test("world "+world.id,()=>{ui.renderWorld(rootNode,route,world.id,undefined);assert.equal(rootNode.querySelectorAll(".nqw-stop-card").length,world.stops.length);assert.equal(rootNode.querySelectorAll(".nqw-shell").length,1)});
  test("readiness "+world.id,()=>{ui.renderReadiness(rootNode,route,world.id);assert.equal(rootNode.querySelectorAll(".nqw-phase-grid").length,1)});
  for(const stop of world.stops)test("stop "+stop.id,()=>{ui.renderStop(rootNode,route,stop.id,undefined);assert.equal(rootNode.querySelectorAll(".nqw-skills").length,1);assert.equal(rootNode.querySelectorAll(".nqw-skills")[0].children.length,3)});
}
test("engine lacks candidate curriculum",()=>{ui.renderWorld(rootNode,route,"NQ-00",{skill:()=>null,stopStatus:()=>null});assert.equal(rootNode.querySelectorAll(".nqw-shell").length,1)});
test("compatible engine read-only",()=>{const learn={skill:id=>({id}),stopStatus:id=>({id,complete:false,unlocked:true,step:"practice"})};assert.ok(ui.compatible(learn,data.worlds[0]));ui.renderWorld(rootNode,route,"NQ-00",learn)});
test("world navigation button",()=>{ui.renderHub(rootNode,route,null,undefined);const card=rootNode.querySelectorAll(".nqw-world-card")[0],copy=card.children.find(c=>c.className==="nqw-card-copy"),btn=copy.children.find(c=>c.events?.click);assert.ok(btn);btn.events.click();assert.equal(routeCalls.at(-1)?.[0],"nqwWorld")});
// WP-2.3: authoritative IDs must not be derived from prototype labels or curriculum version.
const runtimeIds=new Map(data.worlds.map(w=>[w.id,[w.id+"-runtime-one",w.id+"-runtime-two"]]));
const runtime={curriculum:()=>({id:"renamed-curriculum-4.0"}),stops:id=>runtimeIds.get(id)||[],
  stopStatus:id=>({id,level:id.slice(0,5),title:{child:"Runtime "+id},complete:false,unlocked:true,step:"learn",skills:[],gate:null})};
test("live atlas never exposes legacy progress",()=>{ui.renderHub(rootNode,route,{name:"Test Explorer"},runtime);const quick=rootNode.querySelectorAll(".nqw-quick")[0];assert.ok(quick);assert.ok(quick.children.every(b=>!String(b.textContent).includes("My Progress")));const before=routeCalls.length;for(const b of quick.children){if(b.events?.click&&String(b.textContent).includes("Practice games"))b.events.click()}assert.ok(routeCalls.slice(before).every(args=>args[0]!=="progress"))});
test("renamed curriculum exposes runtime atlas",()=>{const atlas=ui.runtimeAtlas(runtime);assert.ok(atlas);assert.equal(atlas.size,9);assert.equal(atlas.get("NQ-00")[0].id,"NQ-00-runtime-one")});
test("renamed curriculum renders exact runtime titles and routes",()=>{ui.renderWorld(rootNode,route,"NQ-00",runtime,{playHarbor:true});const rows=rootNode.querySelectorAll(".nqw-stop-card");assert.equal(rows.length,2);const row=rows[0];const copy=row.children.find(c=>c.className==="nqw-stop-copy");assert.equal(copy.children[0].textContent,"Runtime NQ-00-runtime-one");const btn=row.children.find(c=>c.events?.click);assert.ok(btn);btn.events.click();assert.equal(routeCalls.at(-1)[0],"engineLesson");assert.equal(routeCalls.at(-1)[1],"NQ-00-runtime-one")});
test("runtime capability does not require curriculum method",()=>{assert.ok(ui.runtimeAtlas({stops:runtime.stops,stopStatus:runtime.stopStatus}))});
test("incomplete sample contract remains preview",()=>{assert.equal(ui.runtimeAtlas({...runtime,stops:id=>id==="NQ-00"?runtime.stops(id):[]}),null)});
test("malformed runtime status fails closed",()=>{assert.equal(ui.runtimeAtlas({...runtime,stopStatus:id=>({...runtime.stopStatus(id),unlocked:"yes"})}),null)});
test("duplicate runtime ID fails closed",()=>{assert.equal(ui.runtimeAtlas({...runtime,stops:()=>["NQ-00-runtime-one"]}),null)});
test("wrong stop world fails closed",()=>{assert.equal(ui.runtimeAtlas({...runtime,stopStatus:id=>({...runtime.stopStatus(id),level:"NQ-99"})}),null)});
test("throwing runtime API remains preview",()=>{assert.equal(ui.runtimeAtlas({...runtime,stops:()=>{throw Error("unavailable")}}),null)});
process.stdout.write(passed+" UI mock-DOM checks completed\n");
