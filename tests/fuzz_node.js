// Stress test: thousands of random engine actions across two profiles, checking invariants after every step.
// Usage: node fuzz_node.js <engine.js> [steps]. Uses only API features the engine actually has.
const fs=require('fs');const vm=require('vm');
const store={};global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}};
global.window=global;global.navigator={};global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
let NOW=new Date(2026,10,21,12,0,0).getTime();const RealDate=Date;global.Date=class extends RealDate{constructor(...a){super(...(a.length?a:[NOW]))}static now(){return NOW}};
let seed=+process.argv[4]||12345;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648};const pick=a=>a[Math.floor(rnd()*a.length)];
vm.runInThisContext(fs.readFileSync(process.argv[2],'utf8'));const NQ=window.NQ;const STEPS=+process.argv[3]||3000;
NQ.start();const A=NQ.profiles.create('A','🦄'),B=NQ.profiles.create('B','🐰');
const has=(o,k)=>o&&typeof o[k]==='function';const V13=has(NQ.pets,'display'); /* ID-based pet actions and cross-profile guards arrived in engine 1.3 */const C=NQ.content;let errors=0,violations=[],actions={};
function check(where){const S=NQ.state();for(const p of S.profiles){
  if((p.coins||0)<0)violations.push(where+': negative coins '+p.name);
  if(p.supplies&&(p.supplies.soap<0||p.supplies.bags<0))violations.push(where+': negative supplies');
  for(const pet of p.pets||[]){for(const k of ['h','j','c'])if(!(pet[k]>=0&&pet[k]<=100))violations.push(where+': need out of range '+k+'='+pet[k]);}
  if(p.companions){const ids=(p.pets||[]).map(x=>x.id);['primary','sidekick'].forEach(r=>{const v=p.companions[r];if(v&&!ids.includes(v)&&has(NQ,'companions')&&NQ.profiles.current()===p&&NQ.companions.get()[r])violations.push(where+': companion not owned')})}
  for(const [hab,list] of Object.entries(p.mess||{}))if(list.length>8)violations.push(where+': more than 8 messes')}
  const other=NQ.profiles.list().find(x=>x!==NQ.profiles.current());if(other&&NQ.profiles.current()){const mine=new Set((NQ.profiles.current().pets||[]).map(x=>x.id));(other.pets||[]).forEach(x=>{if(mine.has(x.id))violations.push(where+': pet in two profiles')})}}
const ACTIONS=[
 ['switch',()=>NQ.profiles.select(pick([A.id,B.id]))],
 ['time',()=>{NOW+=pick([60e3,3600e3,6*3600e3,26*3600e3])}],
 ['coins',()=>NQ.profiles.giveCoins(NQ.profiles.current().id,pick([5,50,300]))],
 ['record',()=>NQ.progress.record(pick(['C4t','E3b','G4t']),rnd()<.7)],
 ['round',()=>{const id=has(NQ.progress,'startRound')?NQ.progress.startRound('f'):undefined;const stars=pick([0,1,2,3]);NQ.progress.finishRound({key:pick(['L1:name','L2:find','unicorn']),stars,act:'f',level:'f',correct:3,total:10,startedAt:NOW-60e3,roundId:id});if(id&&rnd()<.3)NQ.progress.finishRound({key:'dup',stars:3,act:'f',level:'f',correct:1,total:1,startedAt:NOW,roundId:id})}],
 ['starter',()=>NQ.pets.chooseStarter(pick(C.STARTER_PETS),'S'+Math.floor(rnd()*99))],
 ['buy',()=>{const k=pick(['food','tool','hab','decor'].concat(C.SUPPLIES?['supply']:[]));const id=k==='food'?pick(Object.keys(C.FOODS)):k==='tool'?pick(Object.keys(C.TOOLS)):k==='hab'?pick(C.HAB_ORDER):k==='decor'?pick(C.DECOR)[0]:pick(Object.keys(C.SUPPLIES));NQ.shop.buy(k,id)}],
 ['adopt',()=>{const s=pick(C.SPECIES.filter(x=>!x.hidden));NQ.pets.adopt(s.id,'P')}],
 ['feed',()=>{const p=NQ.profiles.current();if(!(p.pets||[]).length)return;const pet=pick(p.pets);NQ.pets.feed(V13?pet.id:pet,pick(Object.keys(C.FOODS)))}],
 ['play',()=>{const ps=NQ.profiles.current().pets||[];if(!ps.length)return;const pet=pick(ps);NQ.pets.play(V13?pet.id:pet)}],
 ['clean',()=>{const ps=NQ.profiles.current().pets||[];if(!ps.length)return;const pet=pick(ps);NQ.pets.clean(V13?pet.id:pet)}],
 ['bath',()=>{if(!has(NQ.pets,'startBath'))return;const ps=NQ.profiles.current().pets||[];if(!ps.length)return;const pet=pick(ps);const r=NQ.pets.startBath(pet.id);if(r.ok){if(rnd()<.7)NQ.pets.finishBath(pet.id,r.bathId);else NQ.pets.cancelBath(pet.id);NQ.pets.finishBath(pet.id,r.bathId)}}],
 ['crossProfile',()=>{if(!V13)return;const other=NQ.profiles.list().find(x=>x!==NQ.profiles.current());const ops=(other&&other.pets)||[];if(!ops.length)return;const pet=pick(ops);const before=JSON.stringify(other);
   NQ.pets.feed(pet,'kibble');NQ.pets.play(pet);if(has(NQ.pets,'startBath'))NQ.pets.startBath(pet.id);NQ.pets.rename(pet,'X');if(JSON.stringify(other)!==before)violations.push('cross-profile action changed the other profile')}],
 ['mess',()=>{const p=NQ.profiles.current();const hab=pick(p.habs||['home']);if(!hab)return;NOW+=6*3600e3;NQ.pets.genMess(hab);const ms=NQ.pets.messes(hab)||[];if(ms.length){const m=pick(ms);NQ.pets.cleanMess(hab,m.id)}}],
 ['decor',()=>{const tray=NQ.decor.tray();const it=pick(tray.shop.concat(tray.stickers.map(s=>({i:s,sticker:1}))).concat([{}]));if(it.i){const d=NQ.decor.place(it.i,it.sticker?'sticker':'shop',NQ.pets.habitat());if(d&&rnd()<.5)NQ.decor.remove(d.id)}}],
 ['wild',()=>{const a=pick(Object.keys(C.WILD));NQ.wild.awardChest(a,pick([2,3]));if(has(NQ.wild,'giveSupply')){const left=NQ.wild.remaining(a);if(left.length)NQ.wild.giveSupply(a,pick(left));if(rnd()<.3)NQ.wild.invite(a,'W')}}],
 ['companion',()=>{if(!has(NQ,'companions'))return;const pets=NQ.profiles.current().pets||[];const p=pick(pets.concat([{id:'nope'}]));rnd()<.5?NQ.companions.setPrimary(p.id):NQ.companions.setSidekick(rnd()<.2?null:p.id)}],
 ['learn',()=>{if(!NQ.learn)return;const s=pick(NQ.learn.curriculum().skills);const r=NQ.learn.start(s.id,pick(['practice','check','review']));if(!r.ok)return;let q=r.question,n=0;while(q&&n++<20){const res=NQ.learn.answer(r.roundId,pick(['a','b','up','C',60,1,true,{start:0,presses:[]}]));if(res.done||!res.ok)break;q=res.next}
   if(rnd()<.2){NQ.profiles.select(pick([A.id,B.id]));}}],
 ['saveCode',()=>{const code=NQ.saveCode.export();const o=NQ.saveCode.parse(code);if(!o){violations.push('export did not parse');return}const before=JSON.stringify(NQ.state().profiles);NQ.saveCode.apply(o);if(JSON.stringify(NQ.state().profiles)!==before)violations.push('save round-trip changed data');NQ.profiles.select(pick([A.id,B.id]))}],
 ['reload',()=>{const cur=NQ.profiles.current()&&NQ.profiles.current().id;const saved=store['noteQuest.v1'];if(!saved)return;const o=JSON.parse(saved);if(JSON.stringify(o.profiles)!==JSON.stringify(NQ.state().profiles))violations.push('localStorage out of sync with state');}]
];
NQ.profiles.select(A.id);
for(let i=0;i<STEPS;i++){const [name,fn]=pick(ACTIONS);actions[name]=(actions[name]||0)+1;try{fn()}catch(e){errors++;if(errors<=5)console.log('FAIL exception in '+name+': '+e.message)}check(name+'#'+i);if(violations.length>20)break}
const uniq=[...new Set(violations)];uniq.slice(0,10).forEach(v=>console.log('FAIL '+v));
console.log('actions: '+Object.entries(actions).map(([k,v])=>k+'='+v).join(' '));
const ok=errors===0&&uniq.length===0;console.log(`${ok?STEPS:0} passed, ${errors+uniq.length} failed`);process.exit(ok?0:1);
