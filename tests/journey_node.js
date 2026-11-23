// Journey Readiness tests (Engine API 1.6), no page. Owner rules J1–J3 (coordination/DECISIONS.md):
// J1 4 of 5 first-try right passes a part, and passed parts stay passed; J2 a grown-up's yes counts only for items the
// engine can't check, saved as caregiver/teacher, never mic; J3 the check can be taken early, and passing it then places
// the world's stops. Uses the engine's sample curriculum (NQ-00 has readiness) plus injected readiness for NQ-01 and a
// deliberately broken NQ-02.
const fs=require('fs');const vm=require('vm');
const store={};global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}};
global.window=global;global.navigator={};global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
let NOW=new Date('2026-11-21T17:00:00').getTime();const RealDate=Date;
global.Date=class extends RealDate{constructor(...a){super(...(a.length?a:[NOW]))}static now(){return NOW}};
let src=fs.readFileSync(process.argv[2],'utf8');
const inject='CURRICULUM.levels[1].readiness={navigation:["n-treble","k-letters"],timing:["r-tap1"],performance:["p-midc-play","rec-perform"]};'+
  'CURRICULUM.levels.push({id:"NQ-02",location:"x",title:"Broken",readiness:{navigation:["no-such-skill"],timing:[],performance:["k-blackwhite"],extra:["k-blackwhite"]}});\n';
if(!src.includes('const SKILL=Object.fromEntries('))throw new Error('injection point moved');
src=src.replace('const SKILL=Object.fromEntries(',inject+'const SKILL=Object.fromEntries(');
vm.runInThisContext(src);
const NQ=window.NQ,J=NQ.journey;let ok=0,bad=0;
const t=(n,c)=>{if(c)ok++;else{bad++;console.log('FAIL',n)}};
const eq=(n,a,b)=>{const A=JSON.stringify(a),B=JSON.stringify(b);if(A===B)ok++;else{bad++;console.log('FAIL',n,'got',A,'want',B)}};
const M=NQ.music;
// the right (or a wrong) answer, worked out from the public question only
function answerFor(q,right){switch(q.type){
  case 'symbol':{const a=q.show.replace(/^key-/,'').replace(/^dyn-p$/,'soft').replace(/^dyn-f$/,'loud');return right?a:q.choices.find(c=>c!==a)}
  case 'highLow':{const a=q.a>q.b?'a':'b';return right?a:(a==='a'?'b':'a')}
  case 'noteName':return right?q.note[0]:(q.note[0]==='C'?'D':'C');
  case 'letterFind':{for(let m=48;m<72;m++){const w=M.whiteFromMidi(m);if(w&&w[0]===q.letter)return right?m:m+(w[0]==='E'||w[0]==='B'?1:2)}return null}
  case 'notePlay':return right?M.midiOf(q.note):M.midiOf(q.note)+1;
  case 'rhythmTap':{const spb=60/q.bpm;const start=100;return {start,presses:right?q.onsets.map((o,i)=>[start+o*spb+.03,start+(o+q.flat[i]*.9)*spb]):[]}}
  default:throw new Error('no answer for '+q.type)}}
// play one part; rights[i] says whether item i is answered right; grown-up items are confirmed with `by`
function playPart(world,part,rights,by='caregiver',opts){const s=J.start(world,part);if(!s.ok)return s;let q=s.question,r=null;
  for(let i=0;i<5;i++){r=q.grownUp?J.confirm(s.attemptId,{by,yes:rights[i]}):J.answer(s.attemptId,answerFor(q,rights[i]),opts);if(!r.ok)return r;q=r.next}
  return Object.assign({attemptId:s.attemptId},r.result)}
const ALL=[1,1,1,1,1].map(Boolean);
const secure=(p,ids)=>{NQ.learn.currentStop();/* creates p.learn */return ids.forEach(id=>{p.learn.skills[id]={state:'secure',passDays:['a','b'],history:[],reviewIdx:0,nextReview:NOW+864e5,placed:false}})};

NQ.start();
// ---- before any profile ----
eq('requirements needs a profile',J.requirements('NQ-00').reason,'no-profile');
eq('start needs a profile',J.start('NQ-00','navigation').reason,'no-profile');
eq('status needs a profile',J.status('NQ-00').reason,'no-profile');
const zoe=NQ.profiles.create('Zoe','🐰');
// ---- requirements ----
const req=J.requirements('NQ-00');
t('requirements ok',req.ok);eq('to the next world',req.to,'NQ-01');eq('items and pass bar (J1)',[req.items,req.pass,J.ITEMS,J.PASS],[5,4,5,4]);
eq('three parts in order',req.parts.map(x=>x.id),['navigation','timing','performance']);
t('early before the stops are done (J3)',req.early&&req.missingStops.length===4);
t('performance evidence is grown-up only',req.parts[2].evidence.includes('caregiver')&&req.parts[2].evidence.includes('teacher')&&!req.parts[2].evidence.includes('mic'));
eq('unknown world',J.requirements('NQ-99').reason,'unknown');eq('unknown part',J.start('NQ-00','singing').reason,'unknown');
eq('last world has no check',J.requirements('NQ-01').ok,true);
// ---- validation of curriculum data ----
eq('sample readiness is valid',J.validate('NQ-00'),[]);
const errs=J.validate('NQ-02');
t('broken readiness reported',errs.some(e=>e.includes('unknown skill no-such-skill'))&&errs.some(e=>e.includes('timing: no skills'))&&errs.some(e=>e.includes('unknown part extra')));
eq('broken readiness refuses to start',J.start('NQ-02','performance').reason,'bad-readiness');
eq('broken readiness refuses requirements',J.requirements('NQ-02').reason,'bad-readiness');
t('broken readiness never gates anyone',J.status('NQ-02').required===false&&J.status('NQ-02').unlocked===true);

// ---- the gate: first stop of the next world ----
const P=()=>NQ.profiles.current();
eq('current stop is the first one',NQ.learn.currentStop(),'NQ-00-S1');
const n00=NQ.learn.curriculum().stops.filter(s=>s.level==='NQ-00');
n00.forEach(s=>{secure(P(),s.skills);P().learn.learned[s.id]=NOW});
eq('stops done, next is the new world',NQ.learn.currentStop(),'NQ-01-S1');
let st=NQ.learn.stopStatus('NQ-01-S1');
t('new world locked until readiness',st.unlocked===false&&st.gate&&st.gate.worldId==='NQ-00'&&st.gate.unlocked===false);
t('later stops in a world are not gated',NQ.learn.stopStatus('NQ-01-S2').gate===null);
t('first world is never gated',NQ.learn.stopStatus('NQ-00-S1').gate===null&&NQ.learn.stopStatus('NQ-00-S1').unlocked);
let plan=NQ.learn.today(10).items;
t('today offers the readiness check',plan.some(i=>i.kind==='journey'&&i.worldId==='NQ-00'&&i.to==='NQ-01'&&i.parts.length===3));
t('no early flag once the stops are done',J.requirements('NQ-00').early===false);

// ---- navigation: all right ----
const coins0=NQ.coins.balance();const states0=JSON.stringify(P().learn.skills);
const nv=J.start('NQ-00','navigation');
t('start ok',nv.ok&&nv.total===5&&nv.pass===4&&nv.early===false);
t('question names its skill, not a grown-up item',['k-blackwhite','e-highlow'].includes(nv.question.skillId)&&nv.question.grownUp===false&&nv.question.index===0&&nv.question.total===5);
eq('grown-up confirm refused on an engine-checked item (J2)',J.confirm(nv.attemptId,{by:'caregiver',yes:true}).reason,'checkable');
eq('finish before the end',J.finish(nv.attemptId),{ok:false,reason:'not-done',remaining:5});
J.cancel(nv.attemptId);
const r1=playPart('NQ-00','navigation',ALL);
t('navigation passed',r1.ok&&r1.passed&&r1.correct===5&&r1.unlocked===false);eq('navigation evidence',r1.evidence,['checked']);
eq('no coins for readiness',NQ.coins.balance(),coins0);
eq('no mastery change from readiness',JSON.stringify(P().learn.skills),states0);
const dup=J.finish(r1.attemptId);t('finish after the end is a duplicate',dup.ok&&dup.duplicate===true&&dup.passed===true);
eq('answer after the end',J.answer(r1.attemptId,'black').reason,'no-attempt');
eq('passed part stays passed (J1)',J.start('NQ-00','navigation').reason,'passed');
t('status shows the passed part',J.status('NQ-00').parts.navigation.passed&&!J.status('NQ-00').parts.timing.passed&&J.status('NQ-00').unlocked===false);

// ---- timing: 3 of 5 fails, 4 of 5 passes (J1 boundary) ----
const r2=playPart('NQ-00','timing',[true,false,true,false,true]);
t('3 of 5 does not pass',r2.ok&&r2.passed===false&&r2.correct===3);eq('targeted practice after a miss',r2.practice,['r-pulse']);
t('failed part not saved as passed',!J.status('NQ-00').parts.timing.passed);
const r3=playPart('NQ-00','timing',[true,true,false,true,true]);
t('4 of 5 passes',r3.passed&&r3.correct===4);eq('tapped rhythm is tap evidence, not mic',r3.evidence,['tap']);
eq('attempt history kept',P().journey['NQ-00'].attempts.map(a=>[a.part,a.correct,a.passed]),[['navigation',5,true],['timing',3,false],['timing',4,true]]);

// ---- performance: grown-up items only (J2) ----
const pf=J.start('NQ-00','performance');t('performance items are grown-up items',pf.question.grownUp===true);
eq('child cannot answer a grown-up item',J.answer(pf.attemptId,true).reason,'needs-grown-up');
eq('confirm needs who',J.confirm(pf.attemptId,{yes:true}).reason,'bad-confirm');
eq('confirm needs a real yes/no',J.confirm(pf.attemptId,{by:'caregiver',yes:'yes'}).reason,'bad-confirm');
eq('confirm rejects other roles',J.confirm(pf.attemptId,{by:'child',yes:true}).reason,'bad-confirm');
const unlockedEv=[];NQ.on('journey:unlocked',e=>unlockedEv.push(e));
J.cancel(pf.attemptId);
const r4=playPart('NQ-00','performance',ALL,'caregiver');
t('performance passed',r4.passed);eq('grown-up evidence, never mic (J2)',r4.evidence,['caregiver']);
t('all parts passed unlocks the next world',r4.unlocked===true&&r4.placed===false&&r4.to==='NQ-01');
eq('unlock event',unlockedEv,[{worldId:'NQ-00',to:'NQ-01',placed:false}]);
st=NQ.learn.stopStatus('NQ-01-S1');t('next world open',st.unlocked&&st.gate.unlocked);
t('today no longer offers the check',!NQ.learn.today(10).items.some(i=>i.kind==='journey'));
t('status unlocked',J.status('NQ-00').unlocked&&J.status('NQ-00').unlockedAt===NOW&&J.status('NQ-00').placed===false);

// ---- profiles: an attempt belongs to the profile that started it ----
const mic=NQ.profiles.create('Micaela','🦄');NQ.profiles.select(zoe.id);
const zs=J.start('NQ-01','navigation');NQ.profiles.select(mic.id);
eq('another profile cannot answer',J.answer(zs.attemptId,'C').reason,'wrong-profile');
eq('another profile cannot confirm',J.confirm(zs.attemptId,{by:'caregiver',yes:true}).reason,'wrong-profile');
eq('another profile cannot finish',J.finish(zs.attemptId).reason,'wrong-profile');
t('readiness is per profile',J.status('NQ-00').unlocked===false&&NQ.learn.stopStatus('NQ-01-S1').unlocked===false);
NQ.profiles.select(zoe.id);t('owner can still answer',J.answer(zs.attemptId,answerFor(zs.question,true)).ok);
NQ.profiles.remove(mic.id);

// ---- one open attempt per part, cancel, and dropping attempts ----
const a1=J.start('NQ-01','timing'),a2=J.start('NQ-01','timing');
eq('a new attempt replaces the open one',J.answer(a1.attemptId,{start:0,presses:[]}).reason,'no-attempt');
t('cancel',J.cancel(a2.attemptId)===true&&J.cancel(a2.attemptId)===false);
const a3=J.start('NQ-01','timing');NQ.profiles.resetProgress(zoe.id);
eq('reset drops open attempts',J.answer(a3.attemptId,{start:0,presses:[]}).reason,'no-attempt');

// ---- evidence honesty for played notes ----
const pp=J.start('NQ-01','performance');let q=pp.question,played=0,res;
while(q){let r;if(q.grownUp)r=J.confirm(pp.attemptId,{by:'teacher',yes:true});else{r=J.answer(pp.attemptId,answerFor(q,true),played?{source:'mic'}:undefined);played++}if(r.done)res=r.result;q=r.next}
t('two skills alternate, so at least 2 played notes',played>=2);
eq('played note with no source is keys; mic only when the screen says the mic heard it; grown-up is teacher',res.evidence,['keys','mic','teacher']);
const onsetsQ=(()=>{const s=J.start('NQ-01','timing');const q=s.question;const spb=60/q.bpm;const r=J.answer(s.attemptId,{start:10,onsets:q.onsets.map(o=>10+o*spb+.02)});J.cancel(s.attemptId);return r})();
t('heard rhythm onsets are judged',onsetsQ.ok&&onsetsQ.correct===true&&!!onsetsQ.judge);

// ---- fresh variants ----
const fx=NQ.profiles.create('Fresh','🦊');
const lr=NQ.learn.start('k-blackwhite','practice');const lastShow=lr.question.show;NQ.learn.answer(lr.roundId,answerFor(lr.question,true));NQ.learn.cancel(lr.roundId);
let freshOk=true,sawBW=0;for(let i=0;i<20;i++){const s=J.start('NQ-00','navigation');let q=s.question,prevBW=null;
  for(let j=0;j<5;j++){if(q.skillId==='k-blackwhite'){sawBW++;if(i===0&&prevBW===null&&q.show===lastShow)freshOk=false;if(prevBW!==null&&q.show===prevBW)freshOk=false;prevBW=q.show}
    const r=J.answer(s.attemptId,answerFor(q,false));q=r.next}}
t('readiness questions are fresh variants (never the last practice item, never the same twice in a row)',freshOk&&sawBW>10);

// ---- early check counts as placement (J3) ----
const early=NQ.profiles.create('Early','🐢');const en=NQ.learn.curriculum().stops.filter(s=>s.level==='NQ-00');
t('fresh learner: early check available',J.requirements('NQ-00').early===true&&J.start('NQ-00','navigation').ok);
['navigation','timing'].forEach(part=>playPart('NQ-00',part,ALL));const re=playPart('NQ-00','performance',ALL,'teacher');
t('early pass unlocks and places',re.unlocked&&re.placed&&J.status('NQ-00').placed);
t('placed stops are complete with review reminders',en.every(s=>NQ.learn.stopStatus(s.id).complete)&&en.flatMap(s=>s.skills).every(id=>{const x=NQ.learn.skillState(id);return x.state==='secure'&&x.placed&&x.nextReview>NOW}));
t('placed stops count as learned',en.every(s=>P().learn.learned[s.id]));
t('the next world opens after an early pass',NQ.learn.stopStatus('NQ-01-S1').unlocked);
eq('teacher evidence recorded',J.status('NQ-00').parts.performance.evidence,['teacher']);

// ---- existing progress is never relocked ----
const old=NQ.profiles.create('Started','🐙');secure(P(),['k-blackwhite']);P().learn.skills['k-group2']={state:'exploring',passDays:[],history:[],reviewIdx:-1,nextReview:null,placed:false};
t('a learner who already started the next world keeps it',NQ.learn.stopStatus('NQ-01-S1').unlocked===true);

// ---- placement past a world counts as its readiness ----
const pl=NQ.profiles.create('Placed','🦉');NQ.learn.place('NQ-01-S3');
const ps=J.status('NQ-00');t('placement passes the skipped world',ps.unlocked&&ps.placed&&ps.parts.navigation.evidence[0]==='placement');
t('placed learner is not stranded at the gate',NQ.learn.stopStatus('NQ-01-S1').unlocked&&NQ.learn.stopStatus('NQ-01-S3').unlocked);
const pl2=NQ.profiles.create('PlacedInWorld','🐝');NQ.learn.place('NQ-00-S3');t('placement inside a world does not pass its check',J.status('NQ-00').unlocked===false);

// ---- eggs count readiness parts as music rounds (D1) ----
const eg=NQ.profiles.create('Egg','🐣');NQ.pets.state&&NQ.pets.state();
P().pets=[{id:'egg1',sp:'puppy',name:'Eggy',hab:'home',egg:{rounds:0},grow:0,gT:NOW}];
playPart('NQ-00','navigation',ALL);t('a readiness part counts toward hatching',P().pets[0].egg&&P().pets[0].egg.rounds===1);

// ---- saved ----
const saved=JSON.parse(store['noteQuest.v1']);const sz=saved.profiles.find(x=>x.name==='Zoe');
t('readiness saved per profile',sz.journey['NQ-00'].unlockedAt===NOW&&sz.journey['NQ-00'].parts.timing.correct===4&&!saved.profiles.find(x=>x.name==='Placed').journey['NQ-00'].parts.timing.correct);
t('profiles without readiness have no journey data',!saved.profiles.find(x=>x.name==='Started').journey);
t('engine version 1.6.0 or later',(()=>{const [a,b]=NQ.version.split('.').map(Number);return a>1||(a===1&&b>=6)})());

console.log(ok+' passed, '+bad+' failed');if(bad)process.exit(1);
