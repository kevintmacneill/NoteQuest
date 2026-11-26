// Cosmetic egg catalog tests against the real engine.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const SRC=fs.readFileSync(process.argv[2],'utf8');
let store={};global.window=global;global.navigator={};global.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]};
global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');global.setInterval=()=>0;global.clearInterval=()=>{};
function load(){vm.runInThisContext(SRC);window.NQ.start();return window.NQ}
let NQ=load(),checks=0;function eq(a,b){assert.deepEqual(a,b);checks++}
const catalog=Array.from({length:13},(_,i)=>'egg-'+String(i+1).padStart(2,'0'));
eq(NQ.pets.eggColors,catalog);eq(Object.isFrozen(NQ.pets.eggColors),true);eq(NQ.pets.eggColor('missing'),null);
const random=Math.random,seen=new Set(),ids=new Set();let active;
try{
  for(let i=0;i<13;i++){
    // Create the profile before stubbing randomness; pet ID draw comes before color draw.
    NQ.profiles.create('Color '+i,'x');let calls=0;
    Math.random=()=>calls++===1?(i+.5)/13:.12345;
    const pet=NQ.pets.chooseStarter(i%2===0?'puppy':'kitten','Egg');
    Math.random=random;
    assert.ok(pet&&pet.egg);eq(pet.eggColor,catalog[i]);eq(NQ.pets.eggColor(pet.id),catalog[i]);eq(NQ.pets.eggColor(pet),catalog[i]);
    seen.add(pet.eggColor);active={id:NQ.profiles.current().id,petId:pet.id,color:pet.eggColor};
  }
}finally{Math.random=random}
eq(seen.size,13);
NQ=load();NQ.profiles.select(active.id);let pet=NQ.pets.byId(active.petId);
eq(NQ.pets.eggColor(pet),active.color);eq(NQ.pets.display(pet).eggColor,active.color);
delete pet.eggColor; // test-only representation of a pre-color egg
const original=JSON.stringify(NQ.state()),saved=JSON.stringify(store);
const fallback=NQ.pets.eggColor(pet);assert.ok(catalog.includes(fallback));
eq(NQ.pets.eggColor(pet.id),fallback);eq(JSON.stringify(NQ.state()),original);eq(JSON.stringify(store),saved);
const species=pet.sp;pet.sp=species==='kitten'?'puppy':'kitten';eq(NQ.pets.eggColor(pet),fallback);pet.sp=species;
const other=NQ.profiles.create('New learner','x'),starter=NQ.pets.startKitten('Melody');
eq(starter.ok,true);eq(NQ.pets.eggColor(starter.pet),null);eq(NQ.pets.eggColor(pet),null);
NQ.profiles.select(active.id);
for(let i=0;i<NQ.content.HATCH_ROUNDS;i++){const key='test-hatch',roundId=NQ.progress.startRound(key);NQ.progress.finishRound({key,roundId,stars:0,act:'test',level:'test',correct:0,total:1,startedAt:Date.now()})}
eq(!!pet.egg,false);eq(pet.eggColor,fallback);eq(NQ.pets.eggColor(pet),fallback);
NQ=load();NQ.profiles.select(active.id);eq(NQ.pets.eggColor(active.petId),fallback);
console.log('egg color:',checks,'checks passed');
