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
  if(p.companions){const ids=(p.pets||[]).map(x=>x.id);['primary','sidekick','companion'].forEach(r=>{const v=p.companions[r];if(v&&!ids.includes(v)&&has(NQ,'companions')&&NQ.profiles.current()===p&&NQ.companions.get()[r])violations.push(where+': companion not owned')})}
  if(NQ.companions&&NQ.companions.LEVELS)for(const pet of p.pets||[])if(pet.bond){const b=pet.bond,L=NQ.companions.LEVELS;
    if(!(b.points>=0))violations.push(where+': bond points below 0');if(b.level!==L.filter(x=>b.points>=x).length)violations.push(where+': bond level mismatch');
    if(b.today>NQ.companions.DAY_CAP)violations.push(where+': bond above daily cap')}
  for(const [hab,list] of Object.entries(p.mess||{}))if(list.length>8)violations.push(where+': more than 8 messes');
  if(p.sanctuary){const sc=p.sanctuary;if(sc.pen.mess.length>8)violations.push(where+': more than 8 messes in the pen');const sick=new Set();
    for(const is of sc.issues){if(is.kind==='sick'){if(sick.has(is.petIds[0]))violations.push(where+': two sick issues for one pet');sick.add(is.petIds[0]);const pet=(p.pets||[]).find(x=>x.id===is.petIds[0]);if(!pet||pet.ward!=='hospital')violations.push(where+': sick issue for a pet not in hospital')}
      else if(is.petIds.some(id=>{const pet=(p.pets||[]).find(x=>x.id===id);return !pet||pet.ward==='hospital'||pet.egg}))violations.push(where+': dirty-pen issue lists a hospital pet or egg')}
    if(sc.issues.filter(x=>x.kind==='dirty-pen').length>1)violations.push(where+': two dirty-pen issues');
    if(NQ.sanctuary.DIRTY_AT&&sc.issues.some(x=>x.kind==='dirty-pen')&&sc.pen.mess.length<NQ.sanctuary.DIRTY_AT)violations.push(where+': dirty-pen issue below the threshold')}}
  const other=NQ.profiles.list().find(x=>x!==NQ.profiles.current());if(other&&NQ.profiles.current()){const mine=new Set((NQ.profiles.current().pets||[]).map(x=>x.id));(other.pets||[]).forEach(x=>{if(mine.has(x.id))violations.push(where+': pet in two profiles')})}}
/* Journey Readiness (1.6): random starts, answers, grown-up confirms, finishes and cancels across both profiles */
const JOPEN=[];const JEV=['checked','tap','keys','mic','caregiver','teacher','placement'];
function jcheck(where){if(!NQ.journey)return;for(const p of NQ.state().profiles)for(const [w,j] of Object.entries(p.journey||{})){
  for(const [k,v] of Object.entries(j.parts)){if(!['navigation','timing','performance'].includes(k))violations.push(where+': unknown part '+k);
    if(!(v.evidence[0]==='placement'||v.correct>=4))violations.push(where+': part passed with '+v.correct+' of 5');
    v.evidence.forEach(e=>{if(!JEV.includes(e))violations.push(where+': bad evidence '+e)})}
  if(j.unlockedAt&&!['navigation','timing','performance'].every(k=>j.parts[k]))violations.push(where+': unlocked without every part')}}
function jsolve(q,right){const M=NQ.music;switch(q.type){
  case 'symbol':{const x=q.show.replace(/^key-/,'').replace(/^dyn-p$/,'soft').replace(/^dyn-f$/,'loud');return right?x:q.choices.find(c=>c!==x)}
  case 'highLow':{const x=q.a>q.b?'a':'b';return right?x:(x==='a'?'b':'a')}
  case 'noteName':return right?q.note[0]:(q.note[0]==='C'?'D':'C');
  case 'letterFind':{for(let m=48;m<72;m++){const w=M.whiteFromMidi(m);if(w&&w[0]===q.letter)return right?m:m+1}return 0}
  case 'notePlay':return right?M.midiOf(q.note):M.midiOf(q.note)+1;
  case 'rhythmTap':{const spb=60/q.bpm;return {start:50,presses:right?q.onsets.map((o,i)=>[50+o*spb+.03,50+(o+q.flat[i]*.9)*spb]):[]}}
  default:return null}}
function jact(fn){if(!NQ.journey)return;const c=NQ.profiles.list().map(x=>x.coins||0).join();fn();if(NQ.profiles.list().map(x=>x.coins||0).join()!==c)violations.push('journey action changed coins')}
const ACTIONS=[
 ['switch',()=>NQ.profiles.select(pick([A.id,B.id]))],
 ['j-start',()=>jact(()=>{const r=NQ.journey.start(pick(['NQ-00','NQ-01','NQ-00','nope']),pick(['navigation','timing','performance','x']));if(r.ok)JOPEN.push(r)})],
 ['j-answer',()=>jact(()=>{if(!JOPEN.length)return;const a=pick(JOPEN);const q=a.question||{};const v=q.choices&&rnd()<.6?pick(q.choices):pick([60,61,'C','black','a',true,null,{start:0,presses:[]},{start:0,onsets:[0,1]}]);const r=NQ.journey.answer(a.attemptId,v,rnd()<.3?{source:pick(['mic','keys','x'])}:undefined);if(r.ok&&r.next)a.question=r.next})],
 ['j-confirm',()=>jact(()=>{if(!JOPEN.length)return;const a=pick(JOPEN);const r=NQ.journey.confirm(a.attemptId,{by:pick(['caregiver','teacher','child']),yes:pick([true,true,false,'yes'])});if(r.ok&&r.next)a.question=r.next})],
 ['j-play',()=>jact(()=>{const r=NQ.journey.start(pick(['NQ-00','NQ-01']),pick(['navigation','timing','performance']));if(!r.ok)return;let q=r.question;
   while(q){const right=rnd()<.85;const x=q.grownUp?NQ.journey.confirm(r.attemptId,{by:pick(['caregiver','teacher']),yes:right}):NQ.journey.answer(r.attemptId,jsolve(q,right),rnd()<.5?{source:'mic'}:undefined);if(!x.ok)break;q=x.next}})],
 ['j-finish',()=>jact(()=>{if(JOPEN.length)NQ.journey.finish(pick(JOPEN).attemptId)})],
 ['j-cancel',()=>jact(()=>{if(JOPEN.length)NQ.journey.cancel(JOPEN.splice(Math.floor(rnd()*JOPEN.length),1)[0].attemptId)})],
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
 ['companion',()=>{if(!has(NQ,'companions'))return;const pets=NQ.profiles.current().pets||[];const p=pick(pets.concat([{id:'nope'}]));const x=rnd();if(has(NQ.companions,'set')&&x<.5)NQ.companions.set(p.id);else if(x<.75)NQ.companions.setPrimary(p.id);else NQ.companions.setSidekick(rnd()<.2?null:p.id)}],
 ['learn',()=>{if(!NQ.learn)return;const s=pick(NQ.learn.curriculum().skills);const r=NQ.learn.start(s.id,pick(['practice','check','review']));if(!r.ok)return;let q=r.question,n=0;while(q&&n++<20){const res=NQ.learn.answer(r.roundId,pick(['a','b','up','C',60,1,true,{start:0,presses:[]}]));if(res.done||!res.ok)break;q=res.next}
   if(rnd()<.2){NQ.profiles.select(pick([A.id,B.id]));}}],
 ['saveCode',()=>{const code=NQ.saveCode.export();const o=NQ.saveCode.parse(code);if(!o){violations.push('export did not parse');return}const before=JSON.stringify(NQ.state().profiles);NQ.saveCode.apply(o);if(JSON.stringify(NQ.state().profiles)!==before)violations.push('save round-trip changed data');NQ.profiles.select(pick([A.id,B.id]))}],
 ['view',()=>{if(NQ.sanctuary)NQ.sanctuary.viewed(pick(['pen','hospital','pen','hospital','x']))}],
 ['away',()=>{if(NQ.sanctuary){NOW+=pick([2,3,5])*DAY;NQ.pets.tick()}}],
 ['scoop',()=>{if(!NQ.sanctuary)return;const st=NQ.sanctuary.state();if(st.pen.mess.length)NQ.pens.cleanMess(pick(st.pen.mess).id)}],
 ['reload',()=>{const cur=NQ.profiles.current()&&NQ.profiles.current().id;const saved=store[NQ.learn.curriculum().id==='3.2'?'noteQuest.game32':'noteQuest.v1'];if(!saved)return;const o=JSON.parse(saved);if(JSON.stringify(o.profiles)!==JSON.stringify(NQ.state().profiles))violations.push('localStorage out of sync with state');}]
];
NQ.profiles.select(A.id);
/* friendship (1.7): only finished music adventures add points, and only to the pet that was its profile's companion */
const DAY=24*3600e3;const COMPLETES=['round','learn','j-play','j-answer','j-confirm'];
function bondSnap(){const m={};for(const p of NQ.state().profiles)for(const pet of p.pets||[])m[p.id+'|'+pet.id]={pts:pet.bond?pet.bond.points:0,comp:!!(p.companions&&p.companions.companion===pet.id)};return m}
/* neglect (1.7): friendship falls only at a music adventure, only for a pet in an issue that was SEEN before it, by at most 8 (1/2/4/8 steps; floor 0) */
function armedSnap(){const m=new Set();if(!NQ.sanctuary)return m;for(const p of NQ.state().profiles)for(const is of (p.sanctuary&&p.sanctuary.issues)||[])if(is.observed)is.petIds.forEach(id=>m.add(p.id+'|'+id));
  for(const p of NQ.state().profiles)for(const is of (p.sanctuary&&p.sanctuary.issues)||[])if(is.observed&&is.kind==='dirty-pen')(p.pets||[]).forEach(x=>m.add(p.id+'|'+x.id+'|pen'));return m}
const CHARGES=new Set();if(NQ.sanctuary)NQ.on('sanctuary:issue',e=>{if(e.state!=='charged')return;const p=NQ.profiles.current();const is=p.sanctuary.issues.find(x=>x.id===e.id);const k=p.id+'|'+e.id+'|'+(is&&is.lastCharged);if(CHARGES.has(k))violations.push('two charges for one issue and one completion');CHARGES.add(k);if(is&&is.observed)violations.push('charged issue still observed')});
let ARMED=new Set();
function bondCheck(name,before,where){if(!(NQ.companions&&NQ.companions.LEVELS))return;const after=bondSnap();for(const k in after){const b=before[k]||{pts:0,comp:false},a=after[k];if(a.pts===b.pts)continue;
  if(a.pts<b.pts){if(!NQ.sanctuary)violations.push(where+': friendship fell without neglect');else if(!COMPLETES.includes(name))violations.push(where+': friendship fell outside a music adventure');else if(!ARMED.has(k)&&!ARMED.has(k+'|pen'))violations.push(where+': friendship fell without a seen issue');else if(b.pts-a.pts>8*(name==='round'?1:1))violations.push(where+': neglect charge above 8');continue}else if(!COMPLETES.includes(name))violations.push(where+': friendship rose without a music adventure');else if(!b.comp)violations.push(where+': friendship rose for a non-companion')}}
for(let i=0;i<STEPS;i++){const [name,fn]=pick(ACTIONS);actions[name]=(actions[name]||0)+1;const bs=bondSnap();ARMED=armedSnap();try{fn()}catch(e){errors++;if(errors<=5)console.log('FAIL exception in '+name+': '+e.message)}check(name+'#'+i);bondCheck(name,bs,name+'#'+i);jcheck(name+'#'+i);if(violations.length>20)break}
const uniq=[...new Set(violations)];uniq.slice(0,10).forEach(v=>console.log('FAIL '+v));
{let n=0,mx=0;for(const p of NQ.state().profiles)for(const pet of p.pets||[])if(pet.bond){n++;mx=Math.max(mx,pet.bond.points)}if(NQ.companions&&NQ.companions.LEVELS)console.log('friendship: '+n+' pets with points, max '+mx)}
if(NQ.sanctuary){let ch=0,iss=0,hos=0;for(const p of NQ.state().profiles){iss+=((p.sanctuary||{}).issues||[]).length;hos+=(p.pets||[]).filter(x=>x.ward==='hospital').length}console.log('sanctuary: '+CHARGES.size+' neglect charges, '+iss+' open issues, '+hos+' pets in hospital at the end')}
console.log('actions: '+Object.entries(actions).map(([k,v])=>k+'='+v).join(' '));
if(NQ.journey){let n=0,u=0;for(const p of NQ.state().profiles)for(const j of Object.values(p.journey||{})){n+=Object.keys(j.parts).length;if(j.unlockedAt)u++}console.log('journey: '+n+' parts passed, '+u+' worlds unlocked (invariants checked on these)')}
const ok=errors===0&&uniq.length===0;console.log(`${ok?STEPS:0} passed, ${errors+uniq.length} failed`);process.exit(ok?0:1);
