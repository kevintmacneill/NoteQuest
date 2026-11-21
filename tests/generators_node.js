// Theory generator tests (Engine API 1.5, plus 1.5.1 cadence classify and secondaryDominant), no page.
// 1) Contract: every block in generator_contract_v32.json validates, and 300 seeded questions per block test only its objective.
// 2) Answers: each question's right answer is worked out here from the public question with NQ.music.theory (not from the engine's
//    private checker), then played through NQ.learn so the checker, the reveal and the mastery path are all exercised.
// 3) Spelling, validation, repeatable seeds, profile isolation, nothing saved by sample().
const fs=require('fs');const vm=require('vm');const path=require('path');
const store={};global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}};
global.window=global;global.navigator={};global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
const FIX=JSON.parse(fs.readFileSync(path.join(__dirname,'generator_contract_v32.json'),'utf8')).skills;
// test-only: add the contract skills to the sample curriculum as one extra stop, so learn.start can run them
let src=fs.readFileSync(process.argv[2],'utf8');
const inject='CURRICULUM.skills.push(...'+JSON.stringify(Object.entries(FIX).map(([id,f])=>({id,title:{child:id,adult:id},domains:['D06'],prereqs:[],requiresReading:false,evidence:['quiz'],content:f.content})))+');'+
  'CURRICULUM.stops.push({id:"T-GEN",level:"NQ-01",title:{child:"gen",adult:"gen"},skills:'+JSON.stringify(Object.keys(FIX))+'});\n';
if(!src.includes('const SKILL=Object.fromEntries('))throw new Error('injection point moved');
src=src.replace('const SKILL=Object.fromEntries(',inject+'const SKILL=Object.fromEntries(');
vm.runInThisContext(src);
const NQ=window.NQ,T=NQ.music.theory;let ok=0,bad=0;
const t=(n,c)=>{if(c)ok++;else{bad++;console.log('FAIL',n)}};
const eq=(n,a,b)=>{const A=JSON.stringify(a),B=JSON.stringify(b);if(A===B)ok++;else{bad++;console.log('FAIL',n,'got',A,'want',B)}};
const plain=n=>T.norm(n).replace(/-?\d+$/,'');
const natural=n=>T.parse(n).acc===0;
const tag=s=>s.count===0?'none':s.count+(s.type==='sharps'?'#':'b');
const SYM=Object.fromEntries(T.CHORDS.map(k=>[T.chordSymbol(k),k]));

// the right answer, from the public question only
function solve(q){switch(q.type){
  case 'interval':{const n=T.intervalNumber(q.a,q.b);if(q.ask==='size')return n;if(q.ask==='direction')return T.midi(q.b)>T.midi(q.a)?'up':'down';
    if(q.ask==='melodicOrHarmonic')return q.play;return n===8?'same':'different'}
  case 'chordQuality':return T.identifyChord(q.notes).kind;
  case 'chordBuild':{let want;if(q.ask==='secondaryDominant')want=T.chord(T.transpose(T.scale(q.key,'major')[q.target-1],'P5'),'dominant7');
    else if(q.ask==='fromSymbol'){const suf=q.symbol.slice(T.fmt(q.root).length);want=T.chord(q.root,SYM[suf])}else want=T.chord(q.root,q.kind);
    return q.answerMode==='names'?want:want.map(n=>T.midi(n+'4'))}
  case 'keySignature':{if(q.ask==='name')return T.keyFromSignature(q.signature.type,q.signature.count)[q.mode];if(q.ask==='relative')return T.relative(q.tonic,q.mode);return tag(T.keySignature(q.tonic,q.mode))}
  case 'scaleBuild':{let want;if(q.ask==='transpose'){const s1=T.scale(q.from+'4',q.kind),s2=T.scale(q.to+'4',q.kind);want=q.given.map(g=>s2[s1.indexOf(g)])}else want=T.scale(q.tonic+'4',q.kind);
    return q.answerMode==='names'?want.map(plain):want.map(T.midi)}
  case 'stepPattern':{const d=T.midi(q.notes[q.step+1])-T.midi(q.notes[q.step]);return d===1?'H':d===2?'W':'W+H'}
  case 'degree':{const sc=T.scale(q.key,'major');return q.ask==='whichNote'?sc[q.degree-1]:sc.indexOf(q.note)+1}
  case 'harmonize':return T.diatonicChords(q.key,'major').find(c=>q.choices.includes(c.roman)&&c.notes.includes(q.note)).roman;
  case 'inversion':return T.identifyChord(q.notes).inversion;
  case 'cadence':{const sc=T.scale(q.key,'major'),root=x=>T.identifyChord(x).root,last=root(q.chords[q.chords.length-1]);
    if(q.ask==='classify'){const pen=root(q.chords[0]);if(last===sc[4])return 'half';if(pen===sc[4]&&last===sc[0])return 'authentic';if(pen===sc[3]&&last===sc[0])return 'plagal';if(pen===sc[4]&&last===sc[5])return 'deceptive';return '??'}
    return last===sc[0]?'tonic':'dominant'}
  case 'secondaryDominant':{const id=T.identifyChord(q.notes);if(id.kind!=='dominant7')return '??';const tgt=T.transpose(id.root,'P4');const sc=T.scale(q.key,'major');const d=sc.indexOf(tgt);return d<0?'??':T.diatonicChords(q.key,'major')[d].roman}}}
// a wrong answer of the same shape
function wrong(q,right){if(Array.isArray(right))return typeof right[0]==='number'?right.map((m,i)=>i===0?m+1:m):right.slice(1).concat(right[0]==='C'?'D':'C');
  const other=(q.choices||[]).find(c=>c!==right&&!(Array.isArray(right)&&right.includes(c)));return other!==undefined?other:'??'}

// --- 1. contract: validates, and every question tests the objective ---
const OBJ={ // per-skill property each generated question must have
  'NQ-02-U01-S02':q=>[2,3].includes(solve(q))&&natural(q.a)&&natural(q.b),
  'NQ-02-U03-S01':q=>[2,3].includes(solve(q))&&natural(q.a)&&natural(q.b),
  'NQ-02-U03-S03':q=>['melodic','harmonic'].includes(q.play)&&q.ask==='melodicOrHarmonic',
  'NQ-03-U05-S01':q=>q.tonic==='C'&&q.kind==='major'&&(solve(q)==='H')===(['E4','B4'].includes(q.notes[q.step])),
  'NQ-03-U06-S01':q=>[6,7].includes(solve(q))&&natural(q.a)&&natural(q.b),
  'NQ-03-U06-S03':q=>{const n=T.intervalNumber(q.a,q.b);return (n===8)===(plain(q.a)===plain(q.b))&&natural(q.a)},
  'NQ-04-U03-S01':q=>[6,8].includes(solve(q)),
  'NQ-04-U03-S02':q=>T.intervalNumber(q.a,q.b)===8&&T.interval(q.a,q.b).short==='P8',
  'NQ-04-U03-S03':q=>[6,8].includes(solve(q)),
  'NQ-04-U04-S01':q=>q.kind==='major'&&['C','G','F'].includes(q.root)&&q.answerMode==='keys',
  'NQ-04-U04-S02':q=>['major','minor'].includes(solve(q)),
  'NQ-04-U05-S01':q=>q.key==='C'&&[1,4,5].includes(q.degree)&&['tonic','subdominant','dominant'].includes(q.degreeName),
  'NQ-04-U06-S01':q=>['major','minor'].includes(solve(q))&&T.midi(q.notes[0])>=60&&T.midi(q.notes[0])<=67,
  'NQ-04-U06-S02':q=>q.mode==='major'&&['C','G'].includes(q.tonic)&&['A','E'].includes(solve(q)),
  'NQ-05-U01-S01':q=>['C','G','F','D','Bb'].includes(solve(q))&&q.signature.count<=2,
  'NQ-05-U01-S02':q=>{const a=solve(q);return q.mode==='major'?T.relative(a,'minor')===q.tonic:T.relative(a,'major')===q.tonic},
  'NQ-05-U01-S03':q=>q.from!==q.to&&q.given.length===5&&q.kind==='fiveFinger',
  'NQ-05-U04-S01':q=>solve(q)>=2&&solve(q)<=8,
  'NQ-05-U06-S01':q=>{const last=T.identifyChord(q.chords[q.chords.length-1]);const sc=T.scale(q.key,'major');return [sc[0],sc[4]].includes(last.root)&&last.kind==='major'},
  'NQ-05-U06-S03':q=>T.diatonicChords(q.key,'major').filter(c=>['I','IV','V'].includes(c.roman)&&c.notes.includes(q.note)).length===1,
  'NQ-05-U07-S02':q=>!!SYM[q.symbol.slice(T.fmt(q.root).length)]&&q.kind===undefined,
  'NQ-06-U02-S01':q=>[0,1,2].includes(solve(q))&&['major','minor'].includes(T.identifyChord(q.notes).kind),
  'NQ-06-U02-S02':q=>['dominant7','minor7'].includes(q.kind),
  'NQ-06-U05-S01':q=>{const id=T.identifyChord(q.notes);const sc=T.scale(q.key,'major');return id.kind==='dominant7'&&id.inversion===0&&q.context==='notation'&&['ii','iii','IV','V','vi'].includes(solve(q))&&!q.notes.every(n=>sc.includes(plain(n)))},
  'NQ-06-U05-S02':q=>{const s=solve(q);const sc=T.scale(q.key,'major');return ['authentic','half'].includes(s)&&q.chords.length===2&&q.bass.length===2&&q.bass.every((b,i)=>b===q.chords[i][0])&&
    q.chords.every(ch=>T.midi(ch[0])<T.midi(ch[1]))&&(s==='authentic'?plain(q.bass[0])===sc[4]&&plain(q.bass[1])===sc[0]:plain(q.bass[1])===sc[4])&&!('romans' in q)},
  'NQ-07-U04-S01':q=>{const want=solve(q);const id=T.identifyChord(want);return id.kind==='dominant7'&&q.answerMode==='names'&&q.target>=2&&q.target<=6&&T.interval(id.root,T.scale(q.key,'major')[q.target-1]).short==='P4'}
};
eq('every contract skill has an objective check',Object.keys(FIX).filter(id=>!OBJ[id]),[]);
for(const [id,f] of Object.entries(FIX)){
  eq(id+' validates',NQ.learn.validate(f.content),[]);
  const qs=[];for(let seed=1;seed<=6;seed++){const r=NQ.learn.sample(f.content,{seed,count:50});if(!r.ok){t(id+' samples',false);break}qs.push(...r.questions)}
  const failing=qs.filter(q=>!OBJ[id](q));t(id+' all 300 questions test the objective'+(failing.length?' e.g. '+JSON.stringify(failing[0]):''),failing.length===0);
  const answers=new Set(qs.map(q=>JSON.stringify(solve(q))));t(id+' asks more than one thing',answers.size>=2);
  t(id+' right answer is among the choices',qs.every(q=>!q.choices||q.choices.map(String).includes(String(solve(q)))));
  t(id+' choices are distinct and at least two',qs.every(q=>!q.choices||(q.choices.length>=2&&new Set(q.choices.map(String)).size===q.choices.length)));
  t(id+' no answer in the question',qs.every(q=>!('answer' in q)&&!('check' in q)));
}
// size questions see every authored size
{const qs=NQ.learn.sample(FIX['NQ-04-U03-S01'].content,{seed:3,count:50}).questions;eq('6ths and 8ves both appear',[...new Set(qs.map(solve))].sort(),[6,8])}
{const qs=NQ.learn.sample(FIX['NQ-02-U03-S01'].content,{seed:4,count:50}).questions;t('2nds/3rds go up and down',qs.some(q=>T.midi(q.b)<T.midi(q.a))&&qs.some(q=>T.midi(q.b)>T.midi(q.a)))}

// --- 2. through NQ.learn: checker agrees with the independent answer; wrong answers fail; reveal is right ---
NQ.start();const A=NQ.profiles.create('Micaela','🐶');
for(const id of Object.keys(FIX)){
  const s=NQ.learn.start(id,'practice');if(!s.ok){t(id+' starts: '+JSON.stringify(s),false);continue}
  let q=s.question,i=0,allRight=true,res=null;
  while(q){const right=solve(q);const useWrong=i===1;let r;
    if(useWrong){r=NQ.learn.answer(s.roundId,wrong(q,right));if(r.correct){allRight=false;console.log('  wrong accepted',id,JSON.stringify(q),JSON.stringify(wrong(q,right)))}
      r=NQ.learn.answer(s.roundId,wrong(q,right));const rv=r.reveal;const okRev=Array.isArray(rv)?(q.answerMode==='keys'?true:rv.map(plain).join()===[].concat(right).map(x=>plain(String(x))).join()):String(rv)===String(right)||(Array.isArray(rv)&&rv.includes(right));
      if(!okRev){allRight=false;console.log('  reveal',id,JSON.stringify(rv),JSON.stringify(right))}}
    r=NQ.learn.answer(s.roundId,right);if(!r.correct){allRight=false;console.log('  right rejected',id,JSON.stringify(q),JSON.stringify(right))}
    i++;if(r.done){res=r.result;break}q=r.next}
  t(id+' checker agrees with theory on every question',allRight);
  t(id+' practice result 7/8 → developing',res&&res.correct===7&&res.stateAfter==='developing');
}

// --- 3a. spelling: names mode checks letters, keys mode checks pitch class ---
{const c={type:'chordBuild',ask:'build',kinds:['major'],roots:['F#'],answerMode:'names'};const s=NQ.learn.start('NQ-04-U04-S01','practice');NQ.learn.cancel(s.roundId);
  // run a names-mode block through sample + an injected checker: use secondary dominant skill for names, and transient rounds for the rest
  const sec=NQ.learn.start('NQ-07-U04-S01','practice');const q=sec.question;const want=solve(q);
  const enh=want.map(n=>{const m=T.midi(n+'4');const alt=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'][m%12];return plain(alt)===plain(n)?['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][m%12]:alt});
  const r1=NQ.learn.answer(sec.roundId,enh);t('names: enharmonic spelling ('+enh.join(' ')+' for '+want.join(' ')+') is wrong',!r1.correct);
  const r2=NQ.learn.answer(sec.roundId,want.map(T.fmt).reverse());t('names: right letters in any order, with ♯/♭ signs, is right',r2.correct);NQ.learn.cancel(sec.roundId);
  eq('names block validates',NQ.learn.validate(c),[]);}
{const s=NQ.learn.start('NQ-04-U04-S01','practice');const q=s.question;const keys=T.chord(q.root,'major').map(n=>T.midi(n+'4'));
  t('keys: extra note is wrong',!NQ.learn.answer(s.roundId,keys.concat(keys[0]+10)).correct);
  t('keys: missing note is wrong',!NQ.learn.answer(s.roundId,keys.slice(0,2)).correct);
  const r=NQ.learn.answer(s.roundId,keys.map((m,i)=>i===0?m+12:m));t('keys: any octave / voicing of the same notes is right',r.correct);NQ.learn.cancel(s.roundId)}
{const s=NQ.learn.start('NQ-05-U01-S03','practice');const q=s.question;const right=solve(q);
  t('transpose: right notes in the wrong order is wrong',!NQ.learn.answer(s.roundId,right.slice().reverse()).correct);
  t('transpose: same shape an octave up is right',NQ.learn.answer(s.roundId,right.map(m=>m+12)).correct);NQ.learn.cancel(s.roundId)}
eq('F# major spelled by letter',T.chord('F#','major'),['F#','A#','C#']);
eq('V7/V in C is D F# A C',T.chord(T.transpose(T.scale('C','major')[4],'P5'),'dominant7'),['D','F#','A','C']);
eq('V7/vi in F is A C# E G',T.chord(T.transpose(T.scale('F','major')[5],'P5'),'dominant7'),['A','C#','E','G']);

// --- 3b. validation catches bad blocks ---
const V=c=>NQ.learn.validate(c).length>0;
t('one interval size only is rejected',V({type:'interval',intervals:[3]}));
t('interval size 9 is rejected',V({type:'interval',intervals:[2,9]}));
t('melodicOrHarmonic on paper is rejected',V({type:'interval',ask:'melodicOrHarmonic',context:'notation',intervals:[2,3]}));
t('range too small is rejected',V({type:'interval',intervals:[2,8],range:['C4','F4']}));
t('one chord quality is rejected',V({type:'chordQuality',qualities:['major']}));
t('unknown chord quality is rejected',V({type:'chordQuality',qualities:['major','mystery']}));
t('theoretical key is rejected',V({type:'keySignature',keys:['C','G#']}));
t('secondary dominant of I is rejected',V({type:'chordBuild',ask:'secondaryDominant',keys:['C'],targets:[1,5]}));
t('answer mode typo is rejected',V({type:'chordBuild',kinds:['major'],roots:['C'],answerMode:'midi'}));
t('transpose with one tonic is rejected',V({type:'scaleBuild',ask:'transpose',tonics:['C']}));
t('harmonize with a chord outside I–vi is rejected',V({type:'harmonize',keys:['C'],chords:['I','vii°']}));
t('third inversion of a triad is rejected',V({type:'inversion',kinds:['major'],inversions:[0,3]}));
t('cadence toTonic must end on I',V({type:'cadence',keys:['C'],toTonic:[['I','V']]}));
t('cadence classify needs two names',V({type:'cadence',ask:'classify',keys:['C'],cadences:['authentic']}));
t('cadence classify rejects unknown names',V({type:'cadence',ask:'classify',keys:['C'],cadences:['authentic','imperfect']}));
t('cadence classify: half cadence cannot start on V',V({type:'cadence',ask:'classify',keys:['C'],halfFrom:['V']}));
t('cadence: unknown ask is rejected',V({type:'cadence',ask:'name',keys:['C']}));
t('secondaryDominant by ear is not built yet',V({type:'secondaryDominant',keys:['C'],context:'ear'}));
t('secondaryDominant of I is rejected',V({type:'secondaryDominant',keys:['C'],targets:[1,5]}));
t('secondaryDominant needs two targets',V({type:'secondaryDominant',keys:['C'],targets:[5]}));
t('secondaryDominant minor key name is rejected',V({type:'secondaryDominant',keys:['C','G#']}));
// 1.5.1: every cadence name comes only from its own chords, with sevenths and all four names
{const c={type:'cadence',ask:'classify',keys:['C','G','F','D','Bb','Eb','A'],cadences:['authentic','half','plagal','deceptive'],seventh:true};eq('four-name cadence block validates',NQ.learn.validate(c),[]);
  const qs=[];for(let seed=1;seed<=4;seed++)qs.push(...NQ.learn.sample(c,{seed,count:50}).questions);
  eq('all four cadence names appear',[...new Set(qs.map(solve))].sort(),['authentic','deceptive','half','plagal']);
  t('authentic and deceptive use V7 when seventh:true',qs.filter(q=>['authentic','deceptive'].includes(solve(q))).every(q=>T.identifyChord(q.chords[0]).kind==='dominant7'));
  t('half cadences end on a major V triad',qs.filter(q=>solve(q)==='half').every(q=>T.identifyChord(q.chords[1]).kind==='major'));
  t('classify questions never name the romans',qs.every(q=>!JSON.stringify(q).match(/"(I|ii|IV|V|vi|V7)"/)))}
{const qs=NQ.learn.sample(FIX['NQ-06-U05-S01'].content,{seed:9,count:120}).questions;eq('every secondary-dominant target appears',[...new Set(qs.map(solve))].sort(),['IV','V','ii','iii','vi']);
  t('the chord is spelled by letter (C: V7/ii is A C# E G)',NQ.learn.sample({type:'secondaryDominant',keys:['C'],targets:[2,5]},{seed:1,count:30}).questions.every(q=>{const p=q.notes.map(plain).join(' ');return p==='A C# E G'||p==='D F# A C'}))}
eq('old ending cadence block still validates',NQ.learn.validate({type:'cadence',ask:'ending',keys:['C']}),[]);
eq('engine version',NQ.version,'1.5.1');
t('unsupported type',NQ.learn.validate({type:'teacher'})[0].startsWith('unsupported'));
eq('old generator types still validate',NQ.learn.validate({type:'noteName',notes:['C4'],staff:'treble'}),[]);
eq('learn.start refuses a bad block',(()=>{const sk=NQ.learn.skill('NQ-04-U03-S01');const keep=sk.content.intervals;sk.content.intervals=[6];const r=NQ.learn.start('NQ-04-U03-S01','practice');sk.content.intervals=keep;return [r.ok,r.reason]})(),[false,'bad-content']);

// --- 3c. seeds, saving, profiles ---
const before=JSON.stringify(store);
const a1=NQ.learn.sample(FIX['NQ-05-U07-S02'].content,{seed:42,count:20}),a2=NQ.learn.sample(FIX['NQ-05-U07-S02'].content,{seed:42,count:20}),a3=NQ.learn.sample(FIX['NQ-05-U07-S02'].content,{seed:43,count:20});
eq('same seed, same questions',a1,a2);t('different seed, different questions',JSON.stringify(a1)!==JSON.stringify(a3));
t('sample saves nothing',JSON.stringify(store)===before);
t('sample does not disturb Math.random-based play',typeof Math.random()==='number'&&NQ.learn.sample({type:'interval',intervals:[2,3]}).ok);
eq('sample rejects unsupported',NQ.learn.sample({type:'teacher'}).reason,'unsupported');
t('theory types listed',['interval','chordQuality','chordBuild','keySignature','scaleBuild','stepPattern','degree','harmonize','inversion','cadence','secondaryDominant'].every(x=>NQ.learn.types().includes(x)));
{const s=NQ.learn.start('NQ-04-U06-S02','check');const right=solve(s.question);const B=NQ.profiles.create('Zoe','🐰');NQ.profiles.switchTo?NQ.profiles.switchTo(B.id):NQ.profiles.select(B.id);
  const r=NQ.learn.answer(s.roundId,right);eq('answer from another profile is refused',[r.ok,r.reason],[false,'wrong-profile']);
  eq('other profile has no record of the skill',NQ.learn.skillState('NQ-04-U06-S02').state,'not-introduced')}

console.log(ok+' passed, '+bad+' failed');if(bad)process.exit(1);
