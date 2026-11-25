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
eq('engine version',NQ.version,'1.8.2');
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
{const tid='NQ-05-U04-S02';const s=C.skills.find(x=>x.id===tid);t('teacher skill exists',s&&s.content.type==='teacher');
  secure(s.prereqs);const c0=NQ.coins.balance();const r=NQ.learn.start(tid,'check');
  t('teacher round starts as a single grown-up check',r.ok&&r.total===1&&r.question.type==='teacher'&&r.question.checklist.length>0);
  eq('an unknown grown-up label is refused',NQ.learn.answer(r.roundId,true,{by:'child'}).reason,'bad-by');
  const a=NQ.learn.answer(r.roundId,true,{by:'caregiver'});t('confirmed by a parent',a.ok&&a.correct&&a.done);
  const h=P().learn.skills[tid].history.slice(-1)[0];eq('the label is saved with the pass',[h.by,h.pass],['caregiver',true]);
  eq('no coins for a grown-up check',NQ.coins.balance(),c0);
  const r2=NQ.learn.start(tid,'check');NQ.learn.answer(r2.roundId,true);eq('teacher label by default',P().learn.skills[tid].history.slice(-1)[0].by,'teacher')}
// #124: explicit caregiver evidence is recorded, never fabricated mic evidence. Test fixture only.
for(const tid of AMAZON_TEACHER){const s=C.skills.find(x=>x.id===tid);secure(s.prereqs);const before=NQ.coins.balance();const r=NQ.learn.start(tid,'check');
  t('#124 grown-up round '+tid,r.ok&&r.question.type==='teacher'&&r.total===1);
  if(r.ok){const a=NQ.learn.answer(r.roundId,true,{by:'caregiver'});t('#124 labeled completion '+tid,a.ok&&a.done&&P().learn.skills[tid].history.at(-1).by==='caregiver');eq('#124 no coins '+tid,NQ.coins.balance(),before)}}
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
  eq('cloud uses only the new game document',paths,['data/users/fixture/notequest-game32']);
  eq('wrong-game cloud data is ignored',local.profiles.list().map(p=>p.name),['Fresh player']);
  t('cloud writes only current game data',writes.length===1&&JSON.parse(writes[0].json).game==='notequest-3.2');
  eq('original device save after cloud sync',cloudStore[legacyKey],legacyJSON);
  delete window.claude;
}

async function main(){
  await checkCloudIsolation();
  // every new learner is offered placement (Kevin 2026-11-23), and it belongs to each learner
({NQ}=load({}));const pm=NQ.profiles.create('Micaela','🦄');NQ.placement.dismiss();NQ.profiles.create('Zoe','🐰');
t('every new learner is offered placement',NQ.placement.status().pending===true);
NQ.profiles.select(pm.id);t('skipping it for one learner leaves the others offered',NQ.placement.status().pending===false&&NQ.placement.status().how==='skipped');
console.log(ok+' passed, '+bad+' failed');
  if(bad)process.exit(1);
}
main().catch(error=>{console.error(error);process.exit(1)});
