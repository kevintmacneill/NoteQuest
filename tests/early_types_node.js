// First-steps generator tests (Engine API 1.5.2), no page: keyboardSide, durationCompare, contourRead.
// The three content blocks are copied as-is from curriculum v3.2 (NQ-00-U01-S03, NQ-00-U04-S02, NQ-01-U04-S02),
// including fields the engine ignores (answerMode, designStatus, …). Each question's answer is worked out here from the
// public question only, then played through NQ.learn so the private checker, reveal and mastery path run too.
const fs=require('fs');const vm=require('vm');
const store={};global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}};
global.window=global;global.navigator={};global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
const FIX={
  'NQ-00-U01-S03':{type:'keyboardSide',prompt:'Touch the side of the keyboard where the lower notes live. Next, point to the higher-note end.',targets:['left','right'],answerMode:'keyboard-region-tap',requiresEngineType:true,designStatus:'pending-Claude-engine-type-or-UI-review'},
  'NQ-00-U04-S02':{type:'durationCompare',prompt:'Listen: which note lasts longer?',durationsBeats:[1,4],answerMode:'audio-choice-a-or-b',requiresEngineType:true,designStatus:'pending-Claude-engine-type-or-UI-review'},
  'NQ-01-U04-S02':{type:'contourRead',patterns:['up','down','same'],requiresEngineType:true,designStatus:'candidate-for-claude-engine-review'}
};
let src=fs.readFileSync(process.argv[2],'utf8');
const inject='CURRICULUM.skills.push(...'+JSON.stringify(Object.entries(FIX).map(([id,content])=>({id,title:{child:id,adult:id},domains:['D01'],prereqs:[],requiresReading:false,evidence:['quiz'],content})))+');'+
  'CURRICULUM.stops.push({id:"T-EARLY",level:"NQ-00",title:{child:"early",adult:"early"},skills:'+JSON.stringify(Object.keys(FIX))+'});\n';
if(!src.includes('const SKILL=Object.fromEntries('))throw new Error('injection point moved');
src=src.replace('const SKILL=Object.fromEntries(',inject+'const SKILL=Object.fromEntries(');
vm.runInThisContext(src);
const NQ=window.NQ;let ok=0,bad=0;
const t=(n,c)=>{if(c)ok++;else{bad++;console.log('FAIL',n)}};
const eq=(n,a,b)=>{const A=JSON.stringify(a),B=JSON.stringify(b);if(A===B)ok++;else{bad++;console.log('FAIL',n,'got',A,'want',B)}};
const SEMI={C:0,D:2,E:4,F:5,G:7,A:9,B:11};const midi=n=>(+n.slice(1)+1)*12+SEMI[n[0]];
const V=c=>NQ.learn.validate(c).length>0;

function solve(q){switch(q.type){
  case 'keyboardSide':return q.ask==='low'?'left':'right';
  case 'durationCompare':{const longer=q.a.beats>q.b.beats?'a':'b';return q.ask==='shorter'?(longer==='a'?'b':'a'):longer}
  case 'contourRead':{const m=q.notes.map(midi);return m[0]<m[1]&&m[1]<m[2]?'up':m[0]>m[1]&&m[1]>m[2]?'down':m[0]===m[1]&&m[1]===m[2]?'same':'??'}}}
const wrong=(q,right)=>q.choices.find(c=>c!==right);

// --- 1. the v3.2 blocks validate, and every question tests its objective ---
const letterSteps=(a,b)=>Math.abs(('CDEFGAB'.indexOf(b[0])+7*+b[1])-('CDEFGAB'.indexOf(a[0])+7*+a[1]));
const OBJ={
  'NQ-00-U01-S03':q=>['low','high'].includes(q.ask)&&q.split===60&&eq2(q.choices,['left','right']),
  'NQ-00-U04-S02':q=>q.a.beats!==q.b.beats&&[1,4].includes(q.a.beats)&&[1,4].includes(q.b.beats)&&q.ask==='longer'&&Number.isInteger(q.midi)&&q.midi>=60&&q.midi<=72&&
    Math.abs(q.a.seconds-q.a.beats*60/q.bpm)<1e-3&&Math.abs(q.b.seconds-q.b.beats*60/q.bpm)<1e-3,
  'NQ-01-U04-S02':q=>q.context==='notation'&&q.clef==='treble'&&q.notes.length===3&&q.notes.every(n=>/^[A-G][0-8]$/.test(n)&&midi(n)>=60&&midi(n)<=67)&&
    solve(q)!=='??'&&[0,1].every(i=>{const s=letterSteps(q.notes[i],q.notes[i+1]);return solve(q)==='same'?s===0:s>=1&&s<=2})
};
function eq2(a,b){return JSON.stringify(a)===JSON.stringify(b)}
for(const [id,c] of Object.entries(FIX)){
  eq(id+' validates',NQ.learn.validate(c),[]);
  const qs=[];for(let seed=1;seed<=6;seed++)qs.push(...NQ.learn.sample(c,{seed,count:50}).questions);
  eq(id+' 300 questions made',qs.length,300);
  eq(id+' every question tests the objective',qs.filter(q=>!OBJ[id](q)).length,0);
  const answers=[...new Set(qs.map(solve))].sort();
  eq(id+' every answer appears',answers,{'NQ-00-U01-S03':['left','right'],'NQ-00-U04-S02':['a','b'],'NQ-01-U04-S02':['down','same','up']}[id]);
  const counts={};qs.forEach(q=>{const s=solve(q);counts[s]=(counts[s]||0)+1});
  t(id+' answers are balanced (none under 20%)',Object.values(counts).every(n=>n>=300*.2/(answers.length/2)));
  let runs=0;for(let i=2;i<qs.length;i++)if(i%50>=2&&solve(qs[i])===solve(qs[i-1])&&solve(qs[i-1])===solve(qs[i-2]))runs++;
  t(id+' long same-answer runs are rare',runs<qs.length*.2);
  t(id+' public question has no answer field',qs.every(q=>!('answer' in q)&&!('dir' in q)&&!('side' in q)))}
{const qs=NQ.learn.sample(FIX['NQ-00-U04-S02'],{seed:3,count:50}).questions;t('durationCompare: both sounds share one pitch (only length differs)',qs.every(q=>!('midiA' in q)&&Number.isInteger(q.midi)));}
{const qs=NQ.learn.sample(FIX['NQ-01-U04-S02'],{seed:5,count:50}).questions;t('contourRead: some patterns skip (a third), not only steps',qs.some(q=>solve(q)!=='same'&&(letterSteps(q.notes[0],q.notes[1])===2||letterSteps(q.notes[1],q.notes[2])===2)))}

// --- 2. through NQ.learn: right answers pass, wrong ones are refused, coins only for first-try right ---
NQ.profiles.create('Mia','🦊');
for(const id of Object.keys(FIX)){
  const coin=()=>NQ.profiles.current().coins||0;let s=NQ.learn.start(id,'check');t(id+' starts',s.ok);let q=s.question,n=0,wrongTried=false,perAnswer=[];
  while(q&&n<20){let r;if(!wrongTried){wrongTried=true;const c0=coin();const w=NQ.learn.answer(s.roundId,wrong(q,solve(q)));t(id+' a wrong answer is refused',w.ok&&w.correct===false);perAnswer.push(['wrong',coin()-c0])}
    const c0=coin();r=NQ.learn.answer(s.roundId,solve(q));t(id+' the solved answer is right ('+q.type+' '+JSON.stringify(q).slice(0,60)+')',r.ok&&r.correct);n++;q=r.done?null:r.next;
    if(!r.done)perAnswer.push([n===1?'retry':'first',coin()-c0]);else t(id+' round finishes with a result',!!r.result)}
  eq(id+' coins: 1 per first-try right, 0 for a wrong or a retry (star bonus only at the end)',[...new Set(perAnswer.map(x=>x.join(':')))].sort(),['first:1','retry:0','wrong:0']);
  t(id+' skill moved past not-introduced',NQ.learn.skillState(id).state!=='not-introduced')}

// --- 3. answer shapes ---
function roundAt(id,want){for(let i=0;i<40;i++){const s=NQ.learn.start(id,'practice');if(solve(s.question)===want)return s;}throw new Error('no '+want)}
{const L=roundAt('NQ-00-U01-S03','left');
  eq('keyboardSide: key 60 (the split) is neither side',NQ.learn.answer(L.roundId,60).correct,false);
  eq('keyboardSide: true is not a key',NQ.learn.answer(L.roundId,true).correct,false);
  eq('keyboardSide: a low key counts as left',NQ.learn.answer(L.roundId,48).correct,true);
  const R=roundAt('NQ-00-U01-S03','right');
  eq('keyboardSide: a low key is wrong for the high side',NQ.learn.answer(R.roundId,'48').correct,false);
  eq('keyboardSide: a key as a string works',NQ.learn.answer(R.roundId,'72').correct,true);
  const R2=roundAt('NQ-00-U01-S03','right');eq('keyboardSide: 2.5 is not a key',NQ.learn.answer(R2.roundId,'61.5').correct,false);
  eq('keyboardSide: empty string is not a key',NQ.learn.answer(R2.roundId,'').correct,false)}
{const qs=NQ.learn.sample({type:'keyboardSide',targets:['right'],split:64},{seed:2,count:10}).questions;t('keyboardSide: one target only asks for it, with the given split',qs.every(q=>q.ask==='high'&&q.split===64))}
{const qs=NQ.learn.sample({type:'durationCompare',durationsBeats:[1,2,4],ask:'shorter',bpm:120,midi:67},{seed:4,count:60}).questions;
  t('durationCompare: ask shorter, fixed pitch, three lengths',qs.every(q=>q.ask==='shorter'&&q.midi===67&&q.bpm===120&&q.a.beats!==q.b.beats));
  eq('durationCompare: all three lengths are used',[...new Set(qs.flatMap(q=>[q.a.beats,q.b.beats]))].sort(),[1,2,4]);
  eq('durationCompare: 4 beats at 120 bpm is 2 s',qs.flatMap(q=>[q.a,q.b]).find(x=>x.beats===4).seconds,2)}
{const qs=NQ.learn.sample({type:'contourRead',patterns:['up','down'],clef:'bass',range:['F2','C3'],maxStep:1},{seed:8,count:60}).questions;
  t('contourRead: options respected (bass, range, steps only, no same)',qs.every(q=>q.clef==='bass'&&q.notes.every(n=>midi(n)>=midi('F2')&&midi(n)<=midi('C3'))&&['up','down'].includes(solve(q))&&letterSteps(q.notes[0],q.notes[1])===1&&letterSteps(q.notes[1],q.notes[2])===1));
  eq('contourRead: choices are the authored patterns',qs[0].choices,['up','down'])}
{const qs=NQ.learn.sample({type:'contourRead',range:['C4','E4']},{seed:1,count:40}).questions;t('contourRead: the smallest range (three notes) still works',qs.every(q=>solve(q)!=='??'))}

// --- 4. validation: a bad block never reaches a child ---
t('keyboardSide bad target',V({type:'keyboardSide',targets:['up']}));
t('keyboardSide empty targets',V({type:'keyboardSide',targets:[]}));
t('keyboardSide repeated target',V({type:'keyboardSide',targets:['left','left']}));
t('keyboardSide split off the piano',V({type:'keyboardSide',split:200}));
t('durationCompare equal lengths',V({type:'durationCompare',durationsBeats:[2,2]}));
t('durationCompare zero length',V({type:'durationCompare',durationsBeats:[0,1]}));
t('durationCompare too long',V({type:'durationCompare',durationsBeats:[1,16]}));
t('durationCompare bad ask',V({type:'durationCompare',ask:'louder'}));
t('durationCompare bad bpm',V({type:'durationCompare',bpm:5}));
t('durationCompare bad midi',V({type:'durationCompare',midi:200}));
t('durationCompare lo above hi',V({type:'durationCompare',lo:80,hi:60}));
t('contourRead one pattern',V({type:'contourRead',patterns:['up']}));
t('contourRead unknown pattern',V({type:'contourRead',patterns:['up','zigzag']}));
t('contourRead range with a sharp',V({type:'contourRead',range:['C#4','G4']}));
t('contourRead range too small',V({type:'contourRead',range:['C4','D4']}));
t('contourRead range backwards',V({type:'contourRead',range:['G4','C4']}));
t('contourRead bad clef',V({type:'contourRead',clef:'alto'}));
t('contourRead bad maxStep',V({type:'contourRead',maxStep:9}));
eq('learn.start refuses a bad block',(()=>{const sk=NQ.learn.skill('NQ-01-U04-S02');const keep=sk.content.patterns;sk.content.patterns=['up'];const r=NQ.learn.start('NQ-01-U04-S02','practice');sk.content.patterns=keep;return [r.ok,r.reason]})(),[false,'bad-content']);

// --- 5. seeds, saving, profiles, listing ---
const before=JSON.stringify(store);
for(const c of Object.values(FIX)){eq(c.type+' same seed, same questions',NQ.learn.sample(c,{seed:11,count:20}),NQ.learn.sample(c,{seed:11,count:20}));
  t(c.type+' different seed, different questions',JSON.stringify(NQ.learn.sample(c,{seed:11,count:20}))!==JSON.stringify(NQ.learn.sample(c,{seed:12,count:20})))}
t('sample saves nothing',JSON.stringify(store)===before);
t('early types listed',['keyboardSide','durationCompare','contourRead'].every(x=>NQ.learn.types().includes(x)));
eq('engine version',NQ.version,'1.5.2');
t('teacher is still unsupported (waits on the evidence decision)',NQ.learn.validate({type:'teacher'})[0].startsWith('unsupported'));
{const s=NQ.learn.start('NQ-01-U04-S02','check');const right=solve(s.question);const B=NQ.profiles.create('Zoe','🐰');NQ.profiles.switchTo?NQ.profiles.switchTo(B.id):NQ.profiles.select(B.id);
  const r=NQ.learn.answer(s.roundId,right);eq('answer from another profile is refused',[r.ok,r.reason],[false,'wrong-profile']);
  eq('other profile has no record of the skill',NQ.learn.skillState('NQ-01-U04-S02').state,'not-introduced')}

console.log(ok+' passed, '+bad+' failed');if(bad)process.exit(1);
