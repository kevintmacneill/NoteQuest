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
eq('engine version',NQ.version,'1.8.0');
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
eq('teacher checks: 20 authored + 3 converted',C.skills.filter(s=>s.content.type==='teacher').length,23);
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
eq('new learner saved under v3.2, no placement prompt',[NQ.profiles.current().curriculum,NQ.placement.status().pending],['3.2',false]);
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

// ---------- S-3: fresh start for an existing learner ----------
const oldLearn={skills:{'k-blackwhite':{state:'secure',passDays:['2026-11-20','2026-11-21'],history:[{t:1,mode:'check',rate:1,pass:true}],reviewIdx:0,nextReview:9,placed:false},'e-highlow':{state:'developing',passDays:[],history:[],reviewIdx:-1,nextReview:null,placed:false}},learned:{'NQ-00-S1':1700000000000},placedAt:null};
const oldJourney={'NQ-00':{parts:{navigation:{passedAt:5,evidence:['checked'],correct:5,total:5}},unlockedAt:null,placed:false,attempts:[]}};
const oldSave={v:2,updated:1,settings:{sound:false},profiles:[{id:'pMia',name:'Micaela',avatar:'🦄',stars:{'notes|easy':3,'tap|1':2},stickers:['s-star','s-moon'],notes:{C4:{seen:3}},seconds:900,log:[{d:'2026-11-20',m:15}],
  coins:42,starterDone:true,learn:oldLearn,journey:oldJourney,learner:{presentation:'child',reads:true}}]};
const store={'noteQuest.v1':JSON.stringify(oldSave)};
({NQ}=load(store));NQ.profiles.select('pMia');
const mia=P();
eq('saved under v3.2 after the upgrade',[mia.curriculum,NQ.state().v],['3.2',3]);
eq('old lesson progress, readiness and stars kept in the background',[mia.legacy['sample-0.1'].learn,mia.legacy['sample-0.1'].journey,mia.legacy['sample-0.1'].stars],[oldLearn,oldJourney,oldSave.profiles[0].stars]);
eq('lesson progress restarts',[Object.keys(mia.learn.skills).length,Object.keys(mia.learn.learned).length,NQ.learn.currentStop()],[0,0,'NQ-00-U01']);
eq('Journey Readiness restarts',mia.journey,{});
eq('stars restart',[mia.stars,NQ.profiles.list().find(x=>x.id==='pMia').stars],[{},{}]);
eq('coins, stickers, notes, practice time and settings stay',[NQ.coins.balance(),mia.stickers,mia.notes,mia.seconds,NQ.state().settings.sound,mia.learner.reads],[42,['s-star','s-moon'],{C4:{seen:3}},900,false,true]);
t('pets stay (starter done, pet data kept)',mia.starterDone===true&&Array.isArray(mia.pets));
eq('placement is offered',[NQ.placement.status().pending,NQ.learn.today(10).items[0].kind],[true,'placement']);
t('the upgrade is saved right away',JSON.parse(store['noteQuest.v1']).profiles[0].curriculum==='3.2'&&JSON.parse(store['noteQuest.v1']).profiles[0].legacy['sample-0.1'].stars['notes|easy']===3);
// idempotent: load again
const before=store['noteQuest.v1'];({NQ}=load(store));NQ.profiles.select('pMia');
eq('loading again changes nothing',JSON.stringify(NQ.state().profiles),JSON.stringify(JSON.parse(before).profiles));
// a 1.7 transfer code also upgrades
{const r=load({});t('a save code from before the upgrade also starts fresh',r.NQ.saveCode.apply(JSON.parse(JSON.stringify(oldSave))));
  const m=r.NQ.state().profiles[0];t('imported learner: fresh lessons, old progress kept, placement offered',m.curriculum==='3.2'&&m.legacy['sample-0.1'].learn.skills['k-blackwhite'].state==='secure'&&Object.keys(m.learn.skills).length===0&&m.learn.placement.pending);
  t('no internal flag left in the saved data',!('__fresh' in JSON.parse(r.store['noteQuest.v1'])))}

// ---------- placement ----------
// grown-up pick
({NQ}=load({'noteQuest.v1':JSON.stringify(oldSave)}));NQ.profiles.select('pMia');
{const r=NQ.placement.pick('NQ-02');t('grown-up pick: start in the African Savanna',r.ok&&!r.pending&&r.how==='grown-up'&&r.startStop==='NQ-02-U01');
  t('earlier worlds count as passed (placement), so the gate opens',NQ.journey.status('NQ-00').unlocked&&NQ.journey.status('NQ-01').unlocked&&NQ.learn.stopStatus('NQ-02-U01').unlocked);
  t('earlier skills placed with review reminders',C.stops.filter(s=>s.level!=='NQ-02'&&worlds.indexOf(s.level)<2).flatMap(s=>s.skills).filter(id=>NQ.learn.playable(id).playable).every(id=>{const x=P().learn.skills[id];return x&&x.state==='secure'&&x.placed}));
  t('no placement item in the plan any more',!NQ.learn.today(10).items.some(i=>i.kind==='placement'))}
({NQ}=load({'noteQuest.v1':JSON.stringify(oldSave)}));NQ.profiles.select('pMia');
{const r=NQ.placement.pick('NQ-00');t('grown-up pick of the first world = start at the beginning',r.ok&&r.startStop==='NQ-00-U01'&&!NQ.journey.status('NQ-00').unlocked)}
({NQ}=load({'noteQuest.v1':JSON.stringify(oldSave)}));NQ.profiles.select('pMia');
{const r=NQ.placement.dismiss();t('skip placement',r.ok&&!r.pending&&r.how==='skipped'&&r.startStop==='NQ-00-U01')}
eq('unknown world refused',NQ.placement.pick('NQ-99').reason,'unknown');
// "Show what you know": readiness checks in order
({NQ}=load({'noteQuest.v1':JSON.stringify(oldSave)}));NQ.profiles.select('pMia');
{const done=[];NQ.on('placement:done',e=>done.push(e));
  const b=NQ.placement.begin();t('begin: checking Melody Harbor first',b.ok&&b.active&&b.nextWorld==='NQ-00');
  for(const part of ['navigation','timing','performance']){const r=playPart('NQ-00',part,true);t('Melody Harbor '+part+' passed',r&&r.passed)}
  const s=NQ.placement.status();t('Melody Harbor placed, now checking the Rainforest',s.active&&s.nextWorld==='NQ-01'&&NQ.journey.status('NQ-00').placed);
  t('Melody Harbor stops complete',C.stops.filter(x=>x.level==='NQ-00').every(x=>NQ.learn.stopStatus(x.id).complete));
  const f=playPart('NQ-01','performance',false);t('a Rainforest part not passed',f&&f.passed===false);
  const e=NQ.placement.status();t('placement ends there; the learner starts in the Rainforest',!e.active&&!e.pending&&e.how==='checks'&&e.startStop==='NQ-01-U01'&&NQ.learn.stopStatus('NQ-01-U01').unlocked);
  eq('placement:done event',done.map(x=>[x.how,x.world,x.startStop]),[['checks','NQ-01','NQ-01-U01']]);
  t('no coins from placement checks',NQ.coins.balance()===42)}
// placement belongs to the learner
({NQ}=load({'noteQuest.v1':JSON.stringify(oldSave)}));const z=NQ.profiles.create('Zoe','🐰');
t('a learner created after the upgrade is not asked to place',NQ.placement.status().pending===false);
NQ.profiles.select('pMia');t('the upgraded learner still is',NQ.placement.status().pending===true);
eq('placement needs a learner',(()=>{const r=load({});return r.NQ.placement.status().reason})(),'no-profile');

console.log(ok+' passed, '+bad+' failed');if(bad)process.exit(1);
