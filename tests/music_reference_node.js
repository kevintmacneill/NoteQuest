/* NoteQuest Music Reference theory check. Run: node tests/music_reference_node.js */
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const src=fs.readFileSync(path.join(__dirname,"../assets/music-reference-v0.1.js"),"utf8");
const a=src.indexOf(" const catalogs="),b=src.indexOf(" const tabButtons=");
if(a<0||b<=a)throw Error("Cannot find theory module");
const x=new Function(src.slice(a,b)+"\nreturn {catalogs,patterns,spellScale,chordsFor,pitch};")();
const patterns={
major:["major","minor","minor","major","major","minor","diminished"],
natural:["minor","diminished","major","minor","minor","major","major"],
harmonic:["minor","diminished","augmented","minor","major","major","diminished"]
};
let total=0;
function run(root,mode){
 const notes=x.spellScale(root,x.patterns[mode]);
 assert.equal(notes.length,7);
 assert.equal(new Set(notes.map(x.pitch)).size,7);
 assert.deepEqual(x.chordsFor(notes).map(c=>c.quality),patterns[mode]);
 total++;console.log("PASS "+root+" "+mode);
}
for(const key of x.catalogs.major)run(key,"major");
for(const key of x.catalogs.minor){run(key,"natural");run(key,"harmonic")}
assert.deepEqual(x.spellScale("C",x.patterns.major),["C","D","E","F","G","A","B"]);
assert.deepEqual(x.spellScale("A",x.patterns.harmonic),["A","B","C","D","E","F","G#"]);
console.log(total+" theory families verified");
