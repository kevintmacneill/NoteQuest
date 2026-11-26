// Curriculum v3.2 swap tests (engine 1.8), against the REAL engine the game runs (no injected curriculum).
// Owner decisions (coordination/DECISIONS.md): C-B11 v3.2 approved; C-B12 coming soon never blocks; C-B13 teacher = any
// grown-up; S-1 26 corrected shapes + 3 listening judgments become grown-up checks; S-2 readiness = all of a world's
// skills, worlds NQ-00..NQ-07; S-3 fresh start (lesson progress, readiness and stars restart; pets, companion, coins,
// stickers, settings stay; old progress kept in p.legacy; placement offered); placement = readiness checks in order + grown-up pick.
const fs=require('fs');const vm=require('vm');const path=require('path');
const SRC=fs.readFileSync(process.argv[2],'utf8');
let ok=0,bad=0;const t=(n,c)=>{if(c)ok++;else{bad++;console.log('FAIL',n)}};
const eq=(n,a,b)=>{const A=JSON.stringify(a),B=JSON.stringify(b);if(A===B)ok++;else{bad++;console.log('FAIL',n,'got',A.slice(0,300),'want',B.slice(0,300))}};
let NOW=new Date('2026-11-23T15:00:00').getTime();const RealDate=Date;
global.Date=class extends RealDate{constructor(...a){super(...(a.length?a:[NOW]))}static now(){return NOW}};
// one swappable save store; each load() re-runs the engine script, as a new page load would (works in Node and tests.html)
let STORE={};global.window=global;global.navigator={};
global.localStorage={getItem:k=>k in STORE?STORE[k]:null,setItem:(k,v)=>{STORE[k]=String(v)},removeItem:k=>{delete STORE[k]}};
global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
function load(store){STORE=store||{};vm.runInThisContext(SRC);const NQ=window.NQ;NQ.start();return {NQ,store:STORE}}

// ---------- data ----------
let {NQ}=load();const C=NQ.learn.curriculum();
eq('engine version',NQ.version,'1.8.9');
eq('curriculum id and version',[C.id,C.version],['3.2','3.2']);
eq('9 worlds, 70 stops, 210 skills',[C.levels.length,C.stops.length,C.skills.length],[9,70,210]);
// the approved file lives in coordination/ (never published), so the browser runner skips this; build_v32.py --check covers it too
let src=null;try{src=JSON.parse(fs.readFileSync(path.join(__dirname,'..','coordination/curriculum/curriculum-v3-h02-candidate-v3.2.json'),'utf8'))}catch(e){console.log('note: approved curriculum file not available here; id comparison skipped')}
if(src){eq('same stop ids as the approved file, in world/order sequence',C.stops.map(s=>s.id),src.stops.slice().sort((a,b)=>a.level===b.level?a.order-b.order:a.level<b.level?-1:1).map(s=>s.id));
  eq('same skill ids as the approved file',C.skills.map(s=>s.id).sort(),src.skills.map(s=>s.id).sort())}
t('every stop skill exists and sits in its world',C.stops.every(st=>st.skills.every(id=>{const s=C.skills.find(x=>x.id===id);return s&&s.level===st.level&&s.stop===st.id})));
t('every prerequisite exists',C.skills.every(s=>(s.prereqs||[]).every(q=>C.skills.some(x=>x.id===q))));
const ANNOT=['objective','source','validation','designStatus','requiresEngineType','requiresEngineExtension','manualFollowup'];
t('curriculum annotations left out of the game data',C.skills.every(s=>ANNOT.every(k=>!(k in s.content))));
t('note lists kept (the pitches to ask about)',C.skills.filter(s=>['noteName','noteFind','notePlay'].includes(s.content.type)).every(s=>Array.isArray(s.content.notes)&&s.content.notes.length));
// S-1: corrected shapes
const FIX=JSON.parse(fs.readFileSync(path.join(__dirname,'generator_contract_v32.json'),'utf8')).skills;
t('all 26 corrected shapes applied',Object.keys(FIX).length===26&&Object.entries(FIX).every(([id,f])=>{const c=f.content||f;const s=C.skills.find(x=>x.id===id);return s&&s.content.type===c.type&&JSON.stringify(Object.keys(c).filter(k=>!ANNOT.includes(k)).sort().map(k=>[k,c[k]]))===JSON.stringify(Object.keys(s.content).sort().map(k=>[k,s.content[k]]))}));
const LJ=['NQ-07-U05-S01','NQ-08-U07-S01','NQ-08-U03-S02'];
t('the 3 listening judgments are grown-up (teacher) checks',LJ.every(id=>{const s=C.skills.find(x=>x.id===id);return s.content.type==='teacher'&&s.evidence.join()==='teacher'&&s.content.prompt&&s.content.checklist.length>=3}));
const AMAZON_TEACHER=["NQ-01-U01-S02","NQ-01-U04-S03","NQ-01-U05-S03","NQ-01-U08-S02"];
eq('teacher checks: 20 authored + 3 converted + 4 Amazon',C.skills.filter(s=>s.content.type==='teacher').length,27);
for(const id of AMAZON_TEACHER){const s=C.skills.find(x=>x.id===id);t('#124 teacher rubric '+id,s.content.type==='teacher'&&s.evidence.join()==='teacher'&&s.content.checklist.length===4&&NQ.learn.validate(s.content).length===0);t('#124 performance readiness '+id,C.levels.find(l=>l.id==='NQ-01').readiness.performance.includes(id))}
eq('#124 Amazon readiness validates',NQ.journey.validate('NQ-01'),[]);
// C-B12: coming soon
const cs=C.skills.filter(s=>!NQ.learn.playable(s.id).playable);
eq('13 coming-soon skills',cs.length,13);
eq('coming soon = 12 unauthored conceptChoice + 1 mic echo',[cs.filter(s=>s.content.type==='conceptChoice'&&NQ.learn.playable(s.id).reason==='authoring').length,cs.filter(s=>s.content.type==='echo'&&NQ.learn.playable(s.id).reason==='listening').length],[12,1]);
t('no stop is made only of coming-soon skills',C.stops.every(st=>st.skills.some(id=>NQ.learn.playable(id).playable)));
// every playable skill validates and generates questions
let genFail=[];for(const s of C.skills){if(!NQ.learn.playable(s.id).playable)continue;if(NQ.learn.validate(s.content).length){genFail.push(s.id+' invalid');continue}
  for(const seed of [1,2,3,4,5,6]){let r;try{r=NQ.learn.sample(s.content,{count:5,seed})}catch(e){genFail.push(s.id+' throws '+e.message);break}if(!r.ok||!r.questions.length){genFail.push(s.id+' '+r.reason);break}}}
eq('all 197 playable skills validate and generate questions (6 seeds)',genFail,[]);
// S-2: readiness
const worlds=C.levels.map(l=>l.id);
t('worlds NQ-00..NQ-07 have a readiness check; NQ-08 (last) has none',C.levels.slice(0,8).every(l=>l.readiness)&&!C.levels[8].readiness);
t('every readiness check is valid (all three parts, playable, this world only)',C.levels.slice(0,8).every(l=>NQ.journey.validate(l.id).length===0&&['navigation','timing','performance'].every(k=>l.readiness[k].length&&l.readiness[k].every(id=>NQ.learn.playable(id).playable&&C.skills.find(x=>x.id===id).level===l.id))));
t('readiness uses all of each world\'s playable skills',C.levels.slice(0,8).every(l=>{const all=C.stops.filter(s=>s.level===l.id).flatMap(s=>s.skills).filter(id=>NQ.learn.playable(id).playable).sort();return JSON.stringify(Object.values(l.readiness).flat().sort())===JSON.stringify(all)}));
t('rhythm skills are Timing, grown-up and played skills are Performance',C.levels.slice(0,8).every(l=>l.readiness.timing.every(id=>C.skills.find(x=>x.id===id).content.type==='rhythmTap')&&l.readiness.performance.every(id=>{const s=C.skills.find(x=>x.id===id);return ['self','caregiver','teacher','notePlay','song'].includes(s.content.type)||s.evidence.includes('mic')})));

// ---------- a new learner ----------
const zoe=NQ.profiles.create('Zoe','🐰');
eq('new learner saved under v3.2 and offered placement',[NQ.profiles.current().curriculum,NQ.placement.status().pending,NQ.learn.today(10).items[0].kind],['3.2',true,'placement']);
eq('starts at Melody Harbor stop 1',NQ.learn.currentStop(),'NQ-00-U01');
t('the next world is gated by Melody Harbor readiness',(()=>{const s=NQ.learn.stopStatus('NQ-01-U01');return s.gate&&s.gate.worldId==='NQ-00'&&s.unlocked===false})());
// coming soon never blocks
eq('a coming-soon skill refuses to start',NQ.learn.start('NQ-00-U03-S03','practice').reason,'coming-soon');
{const st=NQ.learn.stopStatus('NQ-00-U03');const e=st.skills.find(s=>s.id==='NQ-00-U03-S03');t('stop status marks it coming soon',e.playable===false&&e.reason==='listening'&&st.skills.filter(s=>s.playable).length===2)}
const P=()=>NQ.profiles.current();
const secure=ids=>ids.forEach(id=>{P().learn.skills[id]={state:'secure',passDays:['a','b'],history:[],reviewIdx:0,nextReview:NOW+9e9,placed:false}});
secure(['NQ-00-U03-S01','NQ-00-U03-S02']);t('a stop completes without its coming-soon skill',NQ.learn.stopStatus('NQ-00-U03').complete);
t('a coming-soon prerequisite never blocks',(()=>{const r=NQ.learn.start('NQ-03-U01-S02','practice');return r.reason!=='locked'||!(r.missing||[]).includes('NQ-03-U01-S01')})());
t('the daily plan never offers a coming-soon skill',(()=>{const ids=new Set(cs.map(s=>s.id));for(let i=0;i<3;i++){if(NQ.learn.today(20).items.some(x=>x.skillId&&ids.has(x.skillId)))return false}return true})());
// C-B13: teacher = grown-up check with a label, no coins
{const testLearner=NQ.profiles.create('Teacher-check fixture','🐱');
  NQ.learn.place('NQ-05-U04');
  const tid='NQ-05-U04-S02';const s=C.skills.find(x=>x.id===tid);t('teacher skill exists',s&&s.content.type==='teacher');
  secure(s.prereqs);const c0=NQ.coins.balance();const r=NQ.learn.start(tid,'check');
  t('teacher round starts as a single grown-up check',r.ok&&r.total===1&&r.question.type==='teacher'&&r.question.checklist.length>0);
  eq('an unknown grown-up label is refused',NQ.learn.answer(r.roundId,true,{by:'child'}).reason,'bad-by');
  const a=NQ.learn.answer(r.roundId,true,{by:'caregiver'});t('confirmed by a parent',a.ok&&a.correct&&a.done);
  const h=P().learn.skills[tid].history.slice(-1)[0];eq('the label is saved with the pass',[h.by,h.pass],['caregiver',true]);
  eq('no coins for a grown-up check',NQ.coins.balance(),c0);
  const r2=NQ.learn.start(tid,'check');NQ.learn.answer(r2.roundId,true);eq('teacher label by default',P().learn.skills[tid].history.slice(-1)[0].by,'teacher');
  NQ.profiles.remove(testLearner.id);NQ.profiles.select(zoe.id)}
{const rubricLearner=NQ.profiles.create('Amazon rubric fixture','🎵');
NQ.learn.place('NQ-02-U01');
// #124: explicit caregiver evidence is recorded, never fabricated mic evidence. Test fixture only.
for(const tid of AMAZON_TEACHER){const s=C.skills.find(x=>x.id===tid);secure(s.prereqs);const before=NQ.coins.balance();const r=NQ.learn.start(tid,'check');
  t('#124 grown-up round '+tid,r.ok&&r.question.type==='teacher'&&r.total===1);
  if(r.ok){const a=NQ.learn.answer(r.roundId,true,{by:'caregiver'});t('#124 labeled completion '+tid,a.ok&&a.done&&P().learn.skills[tid].history.at(-1).by==='caregiver');eq('#124 no coins '+tid,NQ.coins.balance(),before)}}
NQ.profiles.remove(rubricLearner.id);NQ.profiles.select(zoe.id);}
// journey: grown-up items include teacher
{const lv=C.levels.find(l=>l.readiness&&l.readiness.performance.some(id=>C.skills.find(x=>x.id===id).content.type==='teacher'));
  const req=NQ.journey.requirements(lv.id);t('readiness performance accepts teacher evidence',req.ok&&req.parts.find(p=>p.id==='performance').evidence.includes('teacher'))}

// ---------- answers for Melody Harbor readiness ----------
function right(q){switch(q.type){case 'keyGroup':return q.group===2?61:66;case 'highLow':return (q.ask==='lower'?q.a<q.b:q.a>q.b)?'a':'b';
  case 'keyboardSide':return q.ask==='low'?'left':'right';case 'durationCompare':return (q.ask==='shorter'?q.a.beats<q.b.beats:q.a.beats>q.b.beats)?'a':'b';
  case 'rhythmTap':{const spb=60/q.bpm;return {start:10,presses:q.onsets.map((o,i)=>[10+o*spb+.03,10+(o+q.flat[i]*.9)*spb])}}
  default:throw new Error('no solver for '+q.type)}}
function playPart(world,part,pass){const s=NQ.journey.start(world,part);if(!s.ok)return s;let q=s.question,r;
  while(q){r=q.grownUp?NQ.journey.confirm(s.attemptId,{by:'caregiver',yes:pass}):NQ.journey.answer(s.attemptId,pass?right(q):-999);if(!r.ok)return r;q=r.next}return r.result}

// ---------- S-3: fresh game, no legacy imports ----------
const oldSave={v:2,updated:1,settings:{sound:false},profiles:[{
  id:'pOld',name:'Original player',avatar:'🦄',stars:{'notes|easy':3},
  coins:42,pets:[{name:'Original pet'}],stickers:['s-star'],starterDone:true
}]};
const legacyKey='noteQuest.v1', gameKey='noteQuest.game32', legacyJSON=JSON.stringify(oldSave);
const legacyCode='NQ1:'+btoa(unescape(encodeURIComponent(legacyJSON)));
const withLegacy={[legacyKey]:legacyJSON};
({NQ}=load(withLegacy));
eq('launch ignores original profiles and settings',[NQ.profiles.list(),NQ.state().settings.sound],[[],true]);
eq('original data untouched on launch',withLegacy[legacyKey],legacyJSON);
eq('cannot parse legacy code',NQ.saveCode.parse(legacyCode),null);
eq('cannot parse legacy data under new prefix',NQ.saveCode.parse(legacyCode.replace('NQ1:','NQ32:')),null);
t('cannot directly apply legacy data',!NQ.saveCode.apply(oldSave));
const learner=NQ.profiles.create('Fresh player','🐰');
t('new learner begins at first Harbor stop with no copied data',
  NQ.learn.currentStop()==='NQ-00-U01'&&!P().legacy&&!P().starterDone&&Object.keys(P().stars).length===0);
const code=NQ.saveCode.export();
t('new code has its own prefix and accepts a new save',code.startsWith('NQ32:')&&NQ.saveCode.parse(code)?.game==='notequest-3.2');
t('cannot smuggle sample profiles in a new envelope',
  !NQ.saveCode.apply({...oldSave,game:'notequest-3.2'}));
eq('original storage stays byte-identical after new writes',withLegacy[legacyKey],legacyJSON);
({NQ}=load(withLegacy));
eq('reload reads only the fresh profile',[NQ.profiles.list().map(p=>p.name),JSON.parse(withLegacy[gameKey]).game],
  [['Fresh player'],'notequest-3.2']);
eq('fresh selection survives as a distinct profile',NQ.profiles.select(learner.id)&&P().id,learner.id);
({NQ}=load({[gameKey]:legacyJSON}));
eq('wrong-game data in the new slot is ignored',NQ.profiles.list(),[]);
t('v3.2 transfer works',NQ.saveCode.apply(NQ.saveCode.parse(code))&&NQ.profiles.list()[0]?.id===learner.id);

function startPlacementLearner(){
  ({NQ}=load({}));
  NQ.profiles.create('Placement candidate','🐰');
}

// ---------- #119: enforce locks at the engine entry points ----------
startPlacementLearner();
{
  const learnerId=P().id;
  const gate={target:'NQ-01',requires:'NQ-00'};
  const amazon='NQ-01-U01-S01';
  eq('direct practice refuses a locked world',NQ.learn.start(amazon,'practice'),{ok:false,reason:'locked',gate});
  eq('legacy Unlock all planets does not unlock lessons',(P().unlockAll=true,NQ.learn.start(amazon,'practice').gate),gate);
  eq('markLearned refuses a locked world',NQ.learn.markLearned('NQ-01-U01'),false);
  eq('unknown mode refused',NQ.learn.start(amazon,'forged').reason,'bad-mode');
  secure([amazon,'NQ-02-U01-S01']);
  eq('stale secure skill does not unlock Amazon',[NQ.learn.stopStatus('NQ-01-U01').unlocked,NQ.learn.start(amazon,'review').reason],[false,'locked']);
  eq('direct practice also refuses later stops',NQ.learn.start('NQ-01-U04-S01','practice').gate,gate);
  eq('cannot skip ahead via readiness',NQ.journey.start('NQ-03','navigation').reason,'locked');
  NQ.save();
  ({NQ}=load(STORE));
  NQ.profiles.select(learnerId);
  eq('reloaded stale progress cannot open the gate',NQ.learn.start(amazon,'practice').gate,gate);
  eq('Harbor still first after denied mutation',NQ.learn.currentStop(),'NQ-00-U01');
  for(const part of ['navigation','timing','performance'])t('pass Harbor '+part,playPart('NQ-00',part,true).passed);
  t('Harbor readiness unlocks Amazon practice and review',NQ.learn.start(amazon,'practice').ok&&NQ.learn.start(amazon,'review').ok);
  const later=NQ.learn.start('NQ-01-U04-S01','practice');
  t('ordinary stop prerequisites remain protected',later.reason==='locked'&&!later.gate&&Array.isArray(later.missing));
}
startPlacementLearner();
{
  NQ.placement.pick('NQ-01');
  const amazon='NQ-01-U01-S01';
  secure([amazon]);
  t('grown-up placement permits Amazon practice and own review',NQ.learn.start(amazon,'practice').ok&&NQ.learn.start(amazon,'review').ok);
}
startPlacementLearner();
{
  const id=P().id;
  NQ.placement.begin();
  for(const part of ['navigation','timing','performance'])playPart('NQ-00',part,true);
  t('placement can start its next world',NQ.journey.start('NQ-01','performance').ok);
  eq('placement cannot skip its next world',NQ.journey.start('NQ-02','performance').reason,'locked');
  NQ.profiles.create('Isolated learner','🐱');
  eq('other learner cannot use placement to open Amazon',NQ.journey.start('NQ-01','performance').reason,'locked');
  NQ.profiles.select(id);
}

// ---------- placement ----------
// grown-up pick
startPlacementLearner();
{const r=NQ.placement.pick('NQ-02');t('grown-up pick: start in the African Savanna',r.ok&&!r.pending&&r.how==='grown-up'&&r.startStop==='NQ-02-U01');
  t('earlier worlds count as passed (placement), so the gate opens',NQ.journey.status('NQ-00').unlocked&&NQ.journey.status('NQ-01').unlocked&&NQ.learn.stopStatus('NQ-02-U01').unlocked);
  t('earlier skills placed with review reminders',C.stops.filter(s=>s.level!=='NQ-02'&&worlds.indexOf(s.level)<2).flatMap(s=>s.skills).filter(id=>NQ.learn.playable(id).playable).every(id=>{const x=P().learn.skills[id];return x&&x.state==='secure'&&x.placed}));
  t('no placement item in the plan any more',!NQ.learn.today(10).items.some(i=>i.kind==='placement'))}
startPlacementLearner();
{const r=NQ.placement.pick('NQ-00');t('grown-up pick of the first world = start at the beginning',r.ok&&r.startStop==='NQ-00-U01'&&!NQ.journey.status('NQ-00').unlocked)}
startPlacementLearner();
{const r=NQ.placement.dismiss();t('skip placement',r.ok&&!r.pending&&r.how==='skipped'&&r.startStop==='NQ-00-U01')}
eq('unknown world refused',NQ.placement.pick('NQ-99').reason,'unknown');
// "Show what you know": readiness checks in order
startPlacementLearner();
{const balance=NQ.coins.balance();const done=[];NQ.on('placement:done',e=>done.push(e));
  const b=NQ.placement.begin();t('begin: checking Melody Harbor first',b.ok&&b.active&&b.nextWorld==='NQ-00');
  for(const part of ['navigation','timing','performance']){const r=playPart('NQ-00',part,true);t('Melody Harbor '+part+' passed',r&&r.passed)}
  const s=NQ.placement.status();t('Melody Harbor placed, now checking the Rainforest',s.active&&s.nextWorld==='NQ-01'&&NQ.journey.status('NQ-00').placed);
  t('Melody Harbor stops complete',C.stops.filter(x=>x.level==='NQ-00').every(x=>NQ.learn.stopStatus(x.id).complete));
  const f=playPart('NQ-01','performance',false);t('a Rainforest part not passed',f&&f.passed===false);
  const e=NQ.placement.status();t('placement ends there; the learner starts in the Rainforest',!e.active&&!e.pending&&e.how==='checks'&&e.startStop==='NQ-01-U01'&&NQ.learn.stopStatus('NQ-01-U01').unlocked);
  eq('placement:done event',done.map(x=>[x.how,x.world,x.startStop]),[['checks','NQ-01','NQ-01-U01']]);
  t('no coins from placement checks',NQ.coins.balance()===balance)}
// Placement belongs to the new learner who started it.
startPlacementLearner();
const activeLearner=P().id;
NQ.placement.begin();
NQ.profiles.create('Other learner','🐱');
t('the other learner is not in placement',!NQ.placement.status().active);
NQ.profiles.select(activeLearner);
t('the first learner is still in placement',NQ.placement.status().active);
eq('placement needs a learner',(()=>{const r=load({});return r.NQ.placement.status().reason})(),'no-profile');

async function checkCloudIsolation(){
  const paths=[], writes=[];
  window.claude={use:async name=>name==='user'?{id:async ()=>'fixture'}:{
    doc:path=>{
      paths.push(path);
      return {
        get:async ()=>({exists:true,data:()=>({updated:Date.now()+1,json:legacyJSON})}),
        set:async value=>writes.push(value)
      };
    }
  }};
  const cloudStore={[gameKey]:JSON.stringify(NQ.saveCode.parse(code)),[legacyKey]:legacyJSON};
  const local=load(cloudStore).NQ;
  await new Promise(resolve=>setTimeout(resolve,0));
  t('cloud uses only the new game\'s documents (its slot, then a backup beside it)',paths[0]==='data/users/fixture/notequest-game32'&&paths.length===2&&/^data\/users\/fixture\/notequest-game32-unreadable-\d+$/.test(paths[1]));
  eq('wrong-game cloud data is ignored',local.profiles.list().map(p=>p.name),['Fresh player']);
  t('#120: the unreadable cloud save is copied aside, unchanged, before anything is written over it',writes.length===2&&writes[0].json===legacyJSON&&writes[0].movedAt>0);
  t('cloud then writes only current game data',JSON.parse(writes[1].json).game==='notequest-3.2');
  eq('original device save after cloud sync',cloudStore[legacyKey],legacyJSON);
  delete window.claude;
}

// #120: if the cloud backup can't be written, the game stays on the device and never overwrites the cloud save
async function checkCloudBackupFailure(){
  const writes=[];window.claude={use:async name=>name==='user'?{id:async ()=>'fixture'}:{doc:path=>({
    get:async ()=>({exists:true,data:()=>({updated:1,json:'{"not":"ours"}'})}),
    set:async value=>{if(/unreadable/.test(path))throw {code:'permission-denied'};writes.push([path,value])}})}};
  const r=load({});await new Promise(resolve=>setTimeout(resolve,0));r.NQ.profiles.create('Zoe','🐰');await new Promise(resolve=>setTimeout(resolve,1300));
  t('#120: backup failed, so nothing is written over the cloud save',writes.length===0);
  delete window.claude;
}

async function checkCloudLoadWhileLocked(){
  const good=JSON.stringify({...JSON.parse(JSON.stringify(NQ.saveCode.parse(code))),updated:Date.now()+5});
  window.claude={use:async name=>name==='user'?{id:async ()=>'fixture'}:{doc:path=>({get:async ()=>({exists:true,data:()=>({updated:Date.now()+9,json:good})}),set:async ()=>{}})}};
  const raw='{oops';const st={[gameKey]:raw};STORE=st;const real=global.localStorage;
  global.localStorage={getItem:k=>k in STORE?STORE[k]:null,setItem:(k,v)=>{if(/\.unreadable\./.test(k))throw new Error('QuotaExceeded');STORE[k]=String(v)},removeItem:k=>{delete STORE[k]}};
  vm.runInThisContext(SRC);const N=window.NQ;N.start();await new Promise(r=>setTimeout(r,0));
  t('#126: a newer cloud save loads into memory',N.profiles.list().length===1);
  t('#126: …but never overwrites the locked device original',st[gameKey]===raw);
  global.localStorage=real;delete window.claude;
}

async function main(){
  await checkCloudIsolation();
  await checkCloudBackupFailure();
  await checkCloudLoadWhileLocked();
  // ---------- #120: curriculum updates keep progress; unreadable saves are never overwritten ----------
{const base=load({});base.NQ.profiles.create('Micaela','🦄');const mia=base.NQ.profiles.current();
  base.NQ.learn.markLearned('NQ-00-U01');base.NQ.coins.add(37);
  const saved=JSON.parse(base.store[gameKey]);
  // the same save as a previous curriculum (3.1) wrote it, with progress on a skill and a stop that no longer exist
  const older=JSON.parse(JSON.stringify(saved));older.profiles[0].curriculum='3.1';
  older.profiles[0].learn.skills['NQ-99-U01-S01']={state:'secure',passDays:['a','b'],history:[],reviewIdx:0,nextReview:9,placed:false};
  older.profiles[0].learn.learned['NQ-99-U01']=5;older.profiles[0].journey=older.profiles[0].journey||{};older.profiles[0].journey['NQ-99']={parts:{},unlockedAt:null,placed:false,attempts:[]};
  const st={[gameKey]:JSON.stringify(older)};const r=load(st);r.NQ.profiles.select(mia.id);const m=r.NQ.profiles.current();
  t('a save from an earlier curriculum is accepted, not wiped',r.NQ.profiles.list().length===1&&m.name==='Micaela');
  eq('learner moves to this curriculum and keeps everything',[m.curriculum,m.curriculumFrom,r.NQ.coins.balance(),!!m.learn.learned['NQ-00-U01'],m.learn.skills['NQ-99-U01-S01'].state],['3.2','3.1',37,true,'secure']);
  t('nothing was backed up (the save was readable)',!Object.keys(st).some(k=>k.includes('unreadable')));
  t('progress on things that no longer exist is harmless',(()=>{try{r.NQ.learn.today(20);r.NQ.learn.currentStop();C.stops.forEach(x=>r.NQ.learn.stopStatus(x.id));C.levels.forEach(l=>r.NQ.journey.status(l.id));return true}catch(e){console.log(e);return false}})());
  const again=load(st);eq('reloading keeps the moved learner (moved again in memory until the next save)',[again.NQ.profiles.list().length,again.NQ.state().profiles[0].curriculum],[1,'3.2']);
  again.NQ.profiles.select(mia.id);again.NQ.coins.add(1);eq('the next save writes it under this curriculum',[JSON.parse(st[gameKey]).profiles[0].curriculum,JSON.parse(st[gameKey]).profiles[0].coins],['3.2',38]);
  const newer=JSON.parse(JSON.stringify(saved));newer.profiles[0].curriculum='3.3';
  t('a save from a later curriculum (a rollback) is also kept',load({[gameKey]:JSON.stringify(newer)}).NQ.profiles.list().length===1);
  t('a v3.2 save code from another curriculum still transfers',(()=>{const x=load({});const c='NQ32:'+btoa(unescape(encodeURIComponent(JSON.stringify(older))));return x.NQ.saveCode.apply(x.NQ.saveCode.parse(c))&&x.NQ.profiles.list().length===1})());
  // still refused: original-game data, with or without the marker
  for(const [label,bad] of [['no marker',oldSave],['marker but learners with no curriculum',{...oldSave,game:'notequest-3.2'}],['marker but sample-curriculum learners',{...oldSave,game:'notequest-3.2',profiles:[{...oldSave.profiles[0],curriculum:'sample-0.1'}]}],['broken JSON','{oops']]){
    const raw=typeof bad==='string'?bad:JSON.stringify(bad);const s2={[gameKey]:raw};const x=load(s2);
    const bk=Object.keys(s2).filter(k=>/^noteQuest\.game32\.unreadable\.\d+$/.test(k));
    t('unreadable save ('+label+'): not loaded, copied unchanged to a backup slot first',x.NQ.profiles.list().length===0&&bk.length===1&&s2[bk[0]]===raw);
    x.NQ.profiles.create('Zoe','🐰');t('…and the backup survives the next save ('+label+')',s2[bk[0]]===raw&&JSON.parse(s2[gameKey]).profiles[0].name==='Zoe');
    load(s2);t('…and is not copied again on the next load ('+label+')',Object.keys(s2).filter(k=>k.includes('unreadable')).length===1)}
}
// #126: if the backup can't be written, the device save stays locked and the original survives every write path
function loadFailingBackup(raw){const st={[gameKey]:raw};STORE=st;const real=global.localStorage;
  global.localStorage={getItem:k=>k in STORE?STORE[k]:null,setItem:(k,v)=>{if(/\.unreadable\./.test(k))throw new Error('QuotaExceeded');STORE[k]=String(v)},removeItem:k=>{delete STORE[k]}};
  vm.runInThisContext(SRC);const N=window.NQ;N.start();return {N,st,restore:()=>{global.localStorage=real}}}
for(const [label,raw] of [['broken JSON','{oops'],['empty string','']]){
  const {N,st,restore}=loadFailingBackup(raw);const ev=[];N.on('save:blocked',e=>ev.push(e));
  N.profiles.create('Zoe','🐰');N.coins.add(3);
  t('#126 failed backup ('+label+'): ordinary saves never overwrite the original',st[gameKey]===raw&&!Object.keys(st).some(k=>k.includes('unreadable')));
  t('#126 failed backup ('+label+'): the game still works in memory',N.profiles.list().length===1);
  restore()}
eq('#126: an empty stored save counts as unreadable and is backed up',(()=>{const s2={[gameKey]:''};load(s2);return Object.entries(s2).filter(([k])=>k.includes('unreadable')).map(([,v])=>v)})(),['']);
eq('#126: a non-v3 curriculum id is refused',(()=>{const b0=load({});b0.NQ.profiles.create('Zoe','🐰');const bad=JSON.parse(b0.store[gameKey]);bad.profiles[0].curriculum='foreign-program';const s2={[gameKey]:JSON.stringify(bad)};return load(s2).NQ.profiles.list().length})(),0);
// #126 round 2: a save that passes the shape check but breaks migration is unreadable, and nothing writes during the attempt
{const raw=JSON.stringify({game:'notequest-3.2',profiles:[{curriculum:'3.2',name:'Mica',pets:[],coins:20,starterDone:true,mess:{home:'wrong-shape'}}]});
  const st={[gameKey]:raw};let x;let threw=false;try{x=load(st)}catch(e){threw=true}
  t('#126: a save that breaks migration does not crash the game',!threw&&x.NQ.profiles.list().length===0);
  const bk=Object.keys(st).filter(k=>k.includes('unreadable'));
  t('#126: …is backed up unchanged before anything else',bk.length===1&&st[bk[0]]===raw);
  x.NQ.profiles.create('Zoe','🐰');t('#126: …and the backup survives the next save',st[bk[0]]===raw);
  eq('#126: a save code that breaks migration is refused',x.NQ.saveCode.apply(JSON.parse(raw)),false)}
// #126 round 2: if reading the slot throws, nothing overwrites it until a later read shows it is empty
for(const [label,later] of [['still holds data','{bad'],['turns out empty',null]]){
  const st=later===null?{}:{[gameKey]:later};STORE=st;const real=global.localStorage;let first=true;
  global.localStorage={getItem:k=>{if(k===gameKey&&first){first=false;throw new Error('SecurityError')}return k in STORE?STORE[k]:null},setItem:(k,v)=>{STORE[k]=String(v)},removeItem:k=>{delete STORE[k]}};
  vm.runInThisContext(SRC);const N=window.NQ;N.start();N.profiles.create('Zoe','🐰');N.coins.add(2);
  if(later===null)t('#126 read failed, slot '+label+': saving resumes',JSON.parse(st[gameKey]||'{}').profiles?.[0]?.name==='Zoe');
  else t('#126 read failed, slot '+label+': never overwritten',st[gameKey]===later);
  global.localStorage=real}
// every new learner is offered placement (Kevin 2026-11-23), and it belongs to each learner
({NQ}=load({}));const pm=NQ.profiles.create('Micaela','🦄');NQ.placement.dismiss();NQ.profiles.create('Zoe','🐰');
t('every new learner is offered placement',NQ.placement.status().pending===true);
NQ.profiles.select(pm.id);t('skipping it for one learner leaves the others offered',NQ.placement.status().pending===false&&NQ.placement.status().how==='skipped');
// WP-0.6: availability is a read; content readiness does not grant admission.
{
  const {NQ: game,store}=load({});
  eq('unknown world is safely unavailable',game.learn.worldState('unknown'),{exists:false,unlocked:false,contentReady:false,types:[],grownUp:0,childStops:0,adultOnlyStops:0,notReadyStops:[]});
  t('no active learner means no world is unlocked',!game.learn.worldState('NQ-00').unlocked);
  game.profiles.create('Harbor learner','🎵');
  const before=JSON.stringify(game.state()), disk=JSON.stringify(store);
  const harbor=game.learn.worldState('NQ-00'), amazon=game.learn.worldState('NQ-01');
  t('Harbor stays ready with intentional adult-only stops',harbor.exists&&harbor.unlocked&&harbor.contentReady&&harbor.childStops===4&&harbor.adultOnlyStops===2&&harbor.grownUp===8);
  const table=game.learn.levels().map(l=>game.learn.worldState(l.id));
  eq('v3.2 readiness table',table.map(w=>w.contentReady),[true,true,true,true,false,true,true,false,false]);
  eq('unavailable child stops stay blocking',table.map(w=>w.notReadyStops),[[],[],[],[],['NQ-04-U08'],[],[],['NQ-07-U03'],[]]);
  t('capstone has no child-learning stops',table[8].childStops===0&&table[8].adultOnlyStops===8);
  t('world result and both arrays frozen',Object.isFrozen(harbor)&&Object.isFrozen(harbor.types)&&Object.isFrozen(harbor.notReadyStops));
  t('fresh result and arrays',harbor!==game.learn.worldState('NQ-00')&&harbor.types!==game.learn.worldState('NQ-00').types);
   const capstone=game.learn.worldState('NQ-08');
   t('grown-up-only capstone is not child-content ready',capstone.exists&&!capstone.contentReady&&capstone.types.length===0&&capstone.grownUp>0);
  t('Amazon has discoverable types but stays locked for a new learner',amazon.exists&&!amazon.unlocked&&amazon.types.length>0);
  const expected=[...new Set(C.stops.filter(s=>s.level==='NQ-00').flatMap(s=>s.skills).filter(id=>game.learn.playable(id).playable&&!['self','teacher','caregiver'].includes(game.learn.skill(id).content.type)).map(id=>game.learn.skill(id).content.type))];
  eq('available types match live Harbor skill generators',harbor.types,expected);
  try{harbor.types.length=0}catch(_){}
  eq('caller cannot change later availability results',game.learn.worldState('NQ-00').types,expected);
  eq('world query leaves in-memory and persisted saves alone',[JSON.stringify(game.state()),JSON.stringify(store)],[before,disk]);
  // Test-only authoring mutations; classify by authored type, not generator availability.
  const st=game.learn.curriculum().stops.find(x=>x.id==='NQ-00-U01');
  const child=st.skills.map(id=>game.learn.skill(id)), saved=child.map(x=>x.content);
  try{
    child.forEach(x=>{x.content={...x.content,type:'futureTestOnly'}});
    const missing=game.learn.worldState('NQ-00');
    t('authored child stop is not exempt when no generators exist',!missing.contentReady&&missing.notReadyStops.includes(st.id)&&missing.childStops===4);
    child.forEach(x=>{x.content={...x.content,type:'caregiver'}});
    const adult=game.learn.worldState('NQ-00');
    t('authored adult-only stop is exempt if other child stops exist',adult.contentReady&&adult.adultOnlyStops===3&&adult.childStops===3);
  }finally{child.forEach((x,i)=>{x.content=saved[i]})}
  game.placement.pick('NQ-01');
  t('grown-up placement unlocks only the active learner',game.learn.worldState('NQ-01').unlocked);
  game.profiles.create('Other learner','🎵');
  t('switching learners rechecks admission',!game.learn.worldState('NQ-01').unlocked);
}
console.log(ok+' passed, '+bad+' failed');
  if(bad)process.exit(1);
}
main().catch(error=>{console.error(error);process.exit(1)});
