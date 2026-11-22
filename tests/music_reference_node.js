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
const accentStart=src.indexOf("function clickAccent(");
const accentEnd=src.indexOf("function renderDots(");
if(accentStart<0||accentEnd<=accentStart)throw Error("Cannot find clickAccent");
const accent=new Function(src.slice(accentStart,accentEnd)+"\nreturn {clickAccent,CLICK};")();
function expect(name,actual,wanted){
 assert.equal(actual,wanted,name);
 total++;
}
for(const beats of [2,3,4]){
 expect(beats+"/4 downbeat",accent.clickAccent(0,beats),"primary");
 for(let i=1;i<beats;i++)expect(beats+"/4 click "+(i+1),accent.clickAccent(i,beats),"normal");
}
expect("6/8 click 1",accent.clickAccent(0,6),"primary");
expect("6/8 click 2",accent.clickAccent(1,6),"normal");
expect("6/8 click 3",accent.clickAccent(2,6),"normal");
expect("6/8 click 4",accent.clickAccent(3,6),"secondary");
expect("6/8 click 5",accent.clickAccent(4,6),"normal");
expect("6/8 click 6",accent.clickAccent(5,6),"normal");
const {primary,secondary,normal}=accent.CLICK;
assert.ok(secondary.freq[0]<primary.freq[0]&&secondary.freq[0]>normal.freq[0],"secondary pitch sits between the strong click and a normal click");
assert.ok(secondary.gain<primary.gain&&secondary.gain>normal.gain,"secondary loudness sits between the strong click and a normal click");
assert.ok(src.includes("scheduleClick(nextClick,clickAccent(n,beats))"),"the scheduler must use clickAccent");
assert.ok(!src.includes("scheduleClick(nextClick,n===0)"),"6/8 must not accent only click 1");
total+=3;
console.log(total+" passed, 0 failed");
