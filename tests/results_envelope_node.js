// WP-0.7 result envelope (engine 1.9.1) against the REAL engine the game runs.
// Spec: coordination/IMPLEMENTATION_PLAN.md WP-0.7 (with rev2 #6 and rev3). Envelopes are display-only; payment never reads them.
const fs=require('fs');const vm=require('vm');
const SRC=fs.readFileSync(process.argv[2],'utf8');
let ok=0,bad=0;const t=(n,c)=>{if(c)ok++;else{bad++;console.log('FAIL',n)}};
const eq=(n,a,b)=>{const A=JSON.stringify(a),B=JSON.stringify(b);if(A===B)ok++;else{bad++;console.log('FAIL',n,'got',A.slice(0,400),'want',B.slice(0,400))}};
let NOW=new Date('2026-11-23T15:00:00').getTime();const RealDate=Date;
global.Date=class extends RealDate{constructor(...a){super(...(a.length?a:[NOW]))}static now(){return NOW}};
let STORE={};global.window=global;global.navigator={};
global.localStorage={getItem:k=>k in STORE?STORE[k]:null,setItem:(k,v)=>{STORE[k]=String(v)},removeItem:k=>{delete STORE[k]}};
global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
global.setInterval=()=>0;global.clearInterval=()=>{};
function load(store){STORE=store||{};vm.runInThisContext(SRC);const NQ=window.NQ;NQ.start();return NQ}
function right(q){switch(q.type){case 'keyGroup':return q.group===2?61:66;case 'highLow':return (q.ask==='lower'?q.a<q.b:q.a>q.b)?'a':'b';
  case 'keyboardSide':return q.ask==='low'?'left':'right';case 'durationCompare':return (q.ask==='shorter'?q.a.beats<q.b.beats:q.a.beats>q.b.beats)?'a':'b';
  case 'rhythmTap':{const spb=60/q.bpm;return {start:10,presses:q.onsets.map((o,i)=>[10+o*spb+.03,10+(o+q.flat[i]*.9)*spb])}}
  default:throw new Error('no solver for '+q.type)}}
function playLesson(NQ,skill,mode,opts){const s=NQ.learn.start(skill,mode);if(!s.ok)return s;let q=s.question,r;
  while(q){r=NQ.learn.answer(s.roundId,right(q),opts);if(!r.ok)return r;q=r.next}return Object.assign({roundId:s.roundId},r)}
function playPart(NQ,world,part,pass){const s=NQ.journey.start(world,part);if(!s.ok)return s;let q=s.question,r;
  while(q){r=q.grownUp?NQ.journey.confirm(s.attemptId,{by:'caregiver',yes:pass}):NQ.journey.answer(s.attemptId,pass?right(q):-999);if(!r.ok)return r;q=r.next}return Object.assign({attemptId:s.attemptId},r)}
const KEYS=['v','roundId','kind','outcome','coins','stars','evidence','mastery','next','at'];

let NQ=load({});
eq('engine version',NQ.version,'1.9.1');
const A=NQ.profiles.create('Micaela','🦄');NQ.placement.dismiss();

// ---------- lesson ----------
{
  const c0=NQ.coins.balance();
  const r=playLesson(NQ,'NQ-00-U01-S01','practice');
  t('lesson round finishes',r.ok&&r.done);
  const e=r.result.result;
  eq('envelope has exactly the specified fields',Object.keys(e),KEYS);
  eq('lesson identity',[e.v,e.roundId,e.kind,e.outcome],[1,r.roundId,'lesson','passed']);
  eq('lesson coins are the real balance change',e.coins.earned,NQ.coins.balance()-c0);
  t('a lesson that pays reports it',e.coins.earned>0);
  eq('lesson stars before/after/round',e.stars,{before:0,after:3,round:3});
  eq('lesson evidence: engine-judged, no microphone',e.evidence,{source:'engine',count:r.result.total,mic:0});
  eq('lesson mastery from the engine record',e.mastery,{skillId:'NQ-00-U01-S01',before:'exploring',after:NQ.learn.skillState('NQ-00-U01-S01').state});
  eq('unfinished stop suggests staying in it',e.next,{route:'engineLesson',arg:'NQ-00-U01'});
  t('existing lesson fields are unchanged',['skillId','mode','correct','total','rate','pass','stateBefore','stateAfter','sticker','coins'].every(k=>k in r.result));
  eq('stored for display',NQ.results.get(r.roundId),e);
  // replay and forgery
  const c1=NQ.coins.balance();
  eq('answering a finished lesson round is refused',NQ.learn.answer(r.roundId,61).reason,'no-round');
  eq('and pays nothing',NQ.coins.balance(),c1);
  e.coins.earned=999;e.next.route='forged';
  eq('a caller cannot change the stored envelope',NQ.results.get(r.roundId).coins.earned,NQ.coins.balance()-c0);
  eq('a forged round id has no envelope',NQ.results.get('L1-forged'),null);
  // microphone evidence is only what the UI reported
  const m=playLesson(NQ,'NQ-00-U01-S01','practice',{source:'mic'});
  eq('every answer from the microphone',m.result.result.evidence,{source:'mic',count:m.result.total,mic:m.result.total});
  t('repeat practice pays per the existing rules and reports the change',Number.isFinite(m.result.result.coins.earned));
}

// ---------- grown-up lesson check ----------
{
  NQ.learn.place('NQ-00-U03');
  const c0=NQ.coins.balance();
  const s=NQ.learn.start('NQ-00-U02-S02','check');t('grown-up check starts',s.ok);
  const r=NQ.learn.answer(s.roundId,true,{by:'teacher'});
  const e=r.result.result;
  eq('grown-up evidence copies the confirming adult',e.evidence,{source:'teacher',count:1});
  eq('grown-up checks have no stars',e.stars,null);
  eq('and pay nothing',[e.coins.earned,NQ.coins.balance()],[0,c0]);
}

// ---------- practice game rounds ----------
{
  NQ.coins.roundStart();const c0=NQ.coins.balance();
  const id=NQ.progress.startRound('L1:name');
  t('round ids carry a counter and a session part',/^R[0-9a-z]+-[0-9a-z]+$/.test(id));
  const f=NQ.progress.finishRound({key:'L1:name',stars:2,act:'name',level:'L1',correct:8,total:10,startedAt:NOW,roundId:id});
  t('existing practice fields kept, ok added',f.ok===true&&f.counted===true&&f.duplicate===false&&'sticker' in f&&f.coins===NQ.coins.balance()-c0);
  const e=f.result;
  eq('practice envelope',[e.kind,e.outcome,e.roundId,e.stars,e.evidence,e.mastery,e.next],['practice','complete',id,{before:0,after:2,round:2},{source:'engine',count:10},null,null]);
  eq('practice coins match the round',e.coins.earned,NQ.coins.balance()-c0);
  const c1=NQ.coins.balance();
  const again=NQ.progress.finishRound({key:'L1:name',stars:3,act:'name',level:'L1',correct:10,total:10,startedAt:NOW,roundId:id});
  eq('finishing twice is refused as not live',[again.ok,again.reason,again.duplicate],[false,'not-live',true]);
  eq('and pays nothing',NQ.coins.balance(),c1);
  eq('and returns the same envelope',again.result,e);
  eq('best stars untouched by the replay',NQ.state().profiles.find(p=>p.id===A.id).stars['L1:name'],2);
  const forged=NQ.progress.finishRound({key:'L1:name',stars:3,act:'name',level:'L1',correct:10,total:10,startedAt:NOW,roundId:'R1-forged'});
  eq('a forged id pays nothing and has no envelope',[forged.ok,forged.reason,forged.result,NQ.coins.balance()],[false,'not-live',null,c1]);
  // another learner's live round
  const other=NQ.progress.startRound('L1:find');
  const B=NQ.profiles.create('Zoe','🐰');NQ.placement.dismiss();
  const cB=NQ.coins.balance();
  const cross=NQ.progress.finishRound({key:'L1:find',stars:3,act:'find',level:'L1',correct:10,total:10,startedAt:NOW,roundId:other});
  eq('another learner\'s round is refused',[cross.ok,cross.reason,cross.result,NQ.coins.balance()],[false,'wrong-profile',null,cB]);
  eq('envelopes are per learner',NQ.results.get(id),null);
  eq('a new learner has none',NQ.results.recent(),[]);
  NQ.profiles.select(A.id);
  eq('the owner still reads it',NQ.results.get(id),e);
}

// ---------- each practice envelope counts only its own round (ChatGPT review) ----------
{NQ.coins.roundStart();
  const one=NQ.progress.startRound('L4:name');const c0=NQ.coins.balance();
  const e1=NQ.progress.finishRound({key:'L4:name',stars:1,act:'name',level:'L4',correct:5,total:10,startedAt:NOW,roundId:one}).result;const d1=NQ.coins.balance()-c0;
  const two=NQ.progress.startRound('L4:find');const c1=NQ.coins.balance();
  const e2=NQ.progress.finishRound({key:'L4:find',stars:1,act:'find',level:'L4',correct:5,total:10,startedAt:NOW,roundId:two}).result;const d2=NQ.coins.balance()-c1;
  eq('two rounds after one roundStart: each envelope is its own balance change',[e1.coins.earned,e2.coins.earned],[d1,d2]);
  const bare=NQ.progress.finishRound({key:'L4:play',stars:1,act:'play',level:'L4',correct:5,total:10,startedAt:NOW});
  eq('a call without a round id gets no envelope',bare.result,null);
  t('and nothing nameless is stored',NQ.results.recent().every(x=>typeof x.roundId==='string'&&x.roundId));}

// ---------- reload: same envelope, never pays again ----------
let liveId,doneId,doneEnv,lessonId;
{
  liveId=NQ.progress.startRound('L2:name');
  doneId=NQ.progress.startRound('L2:find');
  doneEnv=NQ.progress.finishRound({key:'L2:find',stars:1,act:'find',level:'L2',correct:5,total:10,startedAt:NOW,roundId:doneId}).result;
  lessonId=NQ.results.recent().find(x=>x.kind==='lesson').roundId;
  const saved=JSON.parse(JSON.stringify(STORE));
  const ids1=NQ.learn.start('NQ-00-U01-S02','practice').roundId;
  NQ=load(saved);NQ.profiles.select(A.id);
  const c0=NQ.coins.balance();
  eq('after reload the results screen gets the same envelope',NQ.results.get(doneId),doneEnv);
  t('after reload the lesson envelope is still there',NQ.results.get(lessonId)?.kind==='lesson');
  const re=NQ.progress.finishRound({key:'L2:find',stars:3,act:'find',level:'L2',correct:10,total:10,startedAt:NOW,roundId:doneId});
  eq('re-finishing after reload pays nothing and shows the stored envelope',[re.ok,re.reason,re.result,NQ.coins.balance()],[false,'not-live',doneEnv,c0]);
  const lost=NQ.progress.finishRound({key:'L2:name',stars:3,act:'name',level:'L2',correct:10,total:10,startedAt:NOW,roundId:liveId});
  eq('a round left unfinished before reload pays nothing',[lost.ok,lost.reason,lost.result,NQ.coins.balance()],[false,'not-live',null,c0]);
  eq('a lesson round from before reload is gone',NQ.learn.answer(ids1,1).reason,'no-round');
  const ids2=NQ.learn.start('NQ-00-U01-S02','practice').roundId;
  t('round ids never repeat across reloads: each page load has its own session part',ids1!==ids2&&ids1.split('-')[1]!==ids2.split('-')[1]);
  NQ.learn.cancel(ids2);
}

// ---------- the cache keeps the last 50; eviction never re-enables payment ----------
{
  const first=NQ.progress.startRound('L3:name');
  const firstEnv=NQ.progress.finishRound({key:'L3:name',stars:1,act:'name',level:'L3',correct:5,total:10,startedAt:NOW,roundId:first}).result;
  for(let i=0;i<NQ.results.MAX;i++){const id=NQ.progress.startRound('L3:find');NQ.progress.finishRound({key:'L3:find',stars:0,act:'find',level:'L3',correct:0,total:10,startedAt:NOW,roundId:id})}
  eq('at most 50 kept',NQ.results.recent().length,50);
  eq('the oldest was dropped',NQ.results.get(first),null);
  const c0=NQ.coins.balance();
  const ev=NQ.progress.finishRound({key:'L3:name',stars:3,act:'name',level:'L3',correct:10,total:10,startedAt:NOW,roundId:first});
  eq('finishing an evicted id pays nothing',[ev.ok,ev.reason,ev.result,NQ.coins.balance()],[false,'not-live',null,c0]);
  t('first envelope existed before eviction',firstEnv.roundId===first);
  eq('recent(0) is empty',NQ.results.recent(0),[]);
  eq('recent(3) is the newest three',NQ.results.recent(3).length,3);
}

// ---------- readiness and placement ----------
{
  NQ=load({});const L=NQ.profiles.create('Reader','🎵');NQ.placement.dismiss();
  const r=playPart(NQ,'NQ-00','navigation',true);
  t('readiness part finishes',r.ok&&r.done&&r.result.passed);
  const e=r.result.result;
  eq('readiness envelope',[e.kind,e.outcome,e.coins.earned,e.stars,e.mastery],['readiness','passed',0,null,null]);
  const mapped=[...new Set(r.result.evidence.map(x=>['mic','caregiver','teacher'].includes(x)?x:'engine'))];
  eq('readiness evidence maps what the engine recorded',e.evidence,{source:mapped.length===1?mapped[0]:'mixed',count:5,recorded:r.result.evidence});
  eq('more parts to go: back to the readiness screen',e.next,{route:'nqwReadiness',arg:'NQ-00'});
  const dup=NQ.journey.finish(r.attemptId);
  eq('journey.finish replays the same envelope',[dup.duplicate,dup.result],[true,e]);
  dup.result.next=null;eq('a caller cannot change the replayed envelope',NQ.journey.finish(r.attemptId).result,e);
  playPart(NQ,'NQ-00','timing',true);const last=playPart(NQ,'NQ-00','performance',true);
  t('Amazon unlocks',last.result.unlocked===true);
  eq('world passed: continue the adventure',last.result.result.next,{route:'continueAdventure',arg:null});
  const failed=(()=>{NQ.profiles.create('Second','🎵');NQ.placement.dismiss();return playPart(NQ,'NQ-00','timing',false)})();
  eq('a failed part reports not-passed and stays on readiness',[failed.result.result.outcome,failed.result.result.next],['not-passed',{route:'nqwReadiness',arg:'NQ-00'}]);

  NQ.profiles.create('Placed','🎵');NQ.placement.begin();
  const p1=playPart(NQ,'NQ-00','navigation',true);
  eq('placement part while placement continues',[p1.result.result.kind,p1.result.result.next],['placement',{route:'placementCheck',arg:null}]);
  const p2=playPart(NQ,'NQ-00','timing',false);
  eq('a part that ends placement sends the learner on',[p2.result.result.kind,p2.result.result.next,NQ.placement.status().active],['placement',{route:'continueAdventure',arg:null},false]);
}

// ---------- saves ----------
{
  NQ=load({});const p=NQ.profiles.create('Old save','🎵');NQ.placement.dismiss();
  delete NQ.state().profiles[0].results;
  const saved=JSON.parse(JSON.stringify(STORE));NQ=load(saved);NQ.profiles.select(p.id);
  eq('a save without results loads with none',NQ.results.recent(),[]);
  NQ.state().profiles[0].results=[null,7,{v:1},{v:1,roundId:5},{v:2,roundId:'x'}];
  eq('malformed entries in the history are skipped',NQ.results.recent(),[]);
  NQ.state().profiles[0].results='damaged';
  eq('a damaged results field reads as empty',NQ.results.recent(),[]);
  const id=NQ.progress.startRound('L1:name');NQ.progress.finishRound({key:'L1:name',stars:1,act:'name',level:'L1',correct:4,total:10,startedAt:NOW,roundId:id});
  eq('the next finished round replaces it with a list',NQ.results.recent().length,1);
  NQ.profiles.resetProgress(p.id);
  eq('resetting progress clears the results history',NQ.results.recent(),[]);
}

console.log(ok+' passed, '+bad+' failed');
if(bad)process.exit(1);
