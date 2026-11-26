// Real engine regression: coin limits, banking, profile and round isolation.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const SRC=fs.readFileSync(process.argv[2],'utf8');
const RealDate=Date;let NOW=new Date('2026-11-23T12:00:00').getTime();
global.Date=class extends RealDate{constructor(...a){super(...(a.length?a:[NOW]))}static now(){return NOW}};
let store={};global.window=global;global.navigator={};
global.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]};
global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
global.setInterval=()=>0;global.clearInterval=()=>{};global.setTimeout=()=>0;global.clearTimeout=()=>{};
function load(){vm.runInThisContext(SRC);window.NQ.start();return window.NQ}
let NQ=load();const p=NQ.profiles.create('Coin test','x'),id=p.id,key='notes|easy';
let checks=0;
function eq(a,b){assert.deepEqual(a,b);checks++}
function play(k=key,stars=2,n=10){
  const b=NQ.coins.begin(k),before=NQ.coins.balance();
  for(let i=0;i<n;i++)NQ.progress.record('C4t',true,b.roundId);
  const args={key:k,stars,act:'name',level:'easy',correct:n,total:n,startedAt:NOW,roundId:b.roundId};
  const result=NQ.progress.finishRound(args);
  eq(result.coins,NQ.coins.balance()-before);
  const after=NQ.coins.balance();eq(NQ.progress.finishRound(args).duplicate,true);eq(NQ.coins.balance(),after);
  return [b.rate,result.coins]
}
eq(play(),[1,15]);eq(play(),[.5,7]);eq(p.coinFrac,.5);
eq(play(),[.25,4]);eq(p.coinFrac,.25);eq(play(),[0,0]);eq(p.coinFrac,.25);
eq(play('different',3,2),[1,12]);eq(play('different',3,2),[0,0]);
NOW=new Date('2026-11-20T12:00:00').getTime();eq(play(),[0,0]);eq(p.coinPlays.hw,'2026-11-23');
NOW=new Date('2026-11-24T12:00:00').getTime();eq(play(),[1,15]);
const abandoned=NQ.coins.begin('abandon');eq(abandoned.rate,1);NQ.coins.roundStart();
eq(NQ.coins.begin('abandon').rate,.5);eq(NQ.coins.rewardNotes(1,abandoned.roundId),0);
const old=NQ.coins.begin('switch');const other=NQ.profiles.create('Other','y');
eq(NQ.coins.rewardNotes(8,old.roundId),0);eq(NQ.progress.record('C4t',true,old.roundId),false);eq(NQ.coins.balance(),0);
eq(play(),[1,15]);NQ.profiles.select(id);eq(NQ.coins.begin('switch').rate,.5);
const wrong=NQ.coins.begin('wrong-key');let before=NQ.coins.balance();
eq(NQ.progress.finishRound({key:'other-key',stars:3,act:'name',level:'easy',correct:1,total:1,startedAt:NOW,roundId:wrong.roundId}).reason,'wrong-key');eq(NQ.coins.balance(),before);
NQ.coins.roundStart();
// Compatibility: direct administrative gifts and unscoped legacy progress calls remain separate.
const game=NQ.coins.begin('different');eq(game.rate,0);before=NQ.coins.balance();
NQ.coins.add(1);const lesson=NQ.progress.startRound('learn:test');
NQ.progress.finishRound({key:'learn:test',stars:2,act:'learn-practice',level:'NQ-00',correct:1,total:1,startedAt:NOW,roundId:lesson});
eq(NQ.coins.balance()-before,6);NQ.coins.roundStart();
// Start with an independent learner to check rescue fractional banking exactly.
const rescueProfile=NQ.profiles.create('Rescue','z');const animals=Object.keys(NQ.content.WILD);
function rescue(a){const missing=NQ.wild.missing(a);for(const item of missing){const result=NQ.wild.awardChest(a,2);assert.ok(result.got)}const prev=NQ.coins.balance();const done=NQ.wild.rescue(a);assert.equal(done.ok,true);eq(done.coins,NQ.coins.balance()-prev);return done.coins}
eq([rescue(animals[0]),rescue(animals[0]),rescue(animals[0]),rescue(animals[0])],[5,2,1,0]);eq(rescueProfile.coinFrac,.75);eq(rescue(animals[1]),5);
const balance=NQ.coins.balance();NQ=load();NQ.profiles.select(rescueProfile.id);eq(NQ.coins.balance(),balance);eq(rescue(animals[0]),0);
NQ.profiles.select(other.id);eq(NQ.coins.begin(key).rate,.5);
// Local date strings, including DST transitions and retention.
NOW=new Date('2026-11-25T12:00:00').getTime();eq(NQ.coins.begin(key).rate,1);
NOW=new Date('2026-12-05T12:00:00').getTime();eq(NQ.coins.begin(key).rate,1);eq(Object.keys(NQ.profiles.current().coinPlays.days),['2026-12-05']);
NOW=new Date('2026-11-25T12:00:00').getTime();eq(NQ.coins.begin(key).rate,.5);
// Rev7: real curriculum skill practice/check/review, no direct mastery mutation.
NOW=new Date('2026-12-06T12:00:00').getTime();
const learner=NQ.profiles.create('Lessons','x'),skill='NQ-00-U01-S01';
function lessonPlay(mode){
  const start=NQ.learn.start(skill,mode);assert.equal(start.ok,true);
  const before=NQ.coins.balance();let q=start.question,res;
  for(let i=0;i<start.total;i++){assert.equal(q.type,'keyGroup');res=NQ.learn.answer(start.roundId,q.group===2?61:66);assert.equal(res.correct,true);q=res.next}
  assert.equal(res.done,true);eq(res.result.coins,NQ.coins.balance()-before);return res.result.coins
}
const full=lessonPlay('practice');assert.ok(full>0);
eq(lessonPlay('practice'),Math.floor(full*.5));
eq(lessonPlay('practice'),Math.floor(full*.75)-Math.floor(full*.5));
eq(lessonPlay('practice'),0);
assert.ok(lessonPlay('check')>0);
NOW=new Date('2026-12-07T12:00:00').getTime();
assert.ok(lessonPlay('check')>0);eq(NQ.learn.skillState(skill).state,'secure');
for(let i=0;i<5;i++)eq(lessonPlay('practice'),0);
eq(lessonPlay('check'),0);
eq(lessonPlay('review'),0); // not due; completing review advances its schedule
NOW=NQ.learn.skillState(skill).nextReview+1000;
assert.ok(lessonPlay('review')>0);
eq(lessonPlay('review'),0);eq(lessonPlay('check'),0);
learner.coinPlays={hw:'2026-12-20',days:'damaged'};
eq(NQ.coins.begin('repair').rate,0);eq(learner.coinPlays.hw,'2026-12-20');
eq(NQ.coins.begin('repair').rate,1);eq(NQ.coins.begin('repair').rate,.5);
console.log('coin policy:',checks,'checks passed');
