// Learning engine tests, no page. Uses a fake clock to test days and reviews.
const fs=require('fs');const vm=require('vm');
const store={};global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}};
global.window=global;global.navigator={};global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
let NOW=new Date('2026-11-21T17:00:00').getTime();const RealDate=Date;
global.Date=class extends RealDate{constructor(...a){super(...(a.length?a:[NOW]))}static now(){return NOW}};
vm.runInThisContext(fs.readFileSync(process.argv[2],'utf8'));
const NQ=window.NQ;let ok=0,bad=0;const t=(n,c)=>{if(c)ok++;else{bad++;console.log('FAIL',n)}};
const day=()=>{NOW+=864e5};
NQ.start();const p=NQ.profiles.create('Zoe','🐰');
// play a round answering everything right (or wrong) using the engine's own answer when revealed
function play(skillId,mode,right=true){const s=NQ.learn.start(skillId,mode);if(!s.ok)return s;let q=s.question,res=null;
  while(q){const a=answerFor(skillId,q,right);const r=NQ.learn.answer(s.roundId,a);
    if(!r.correct&&!r.done&&!right&&!['rhythmTap','song','self','caregiver'].includes(q.type)){const r2=NQ.learn.answer(s.roundId,a);const r3=NQ.learn.answer(s.roundId,r2.reveal);if(r3.done){res=r3.result;break}q=r3.next;continue}
    if(r.done){res=r.result;break}q=r.next}return res}
function answerFor(id,q,right){const M=NQ.music;switch(q.type){
  case 'noteName':return right?q.note[0]:(q.note[0]==='C'?'D':'C');
  case 'noteFind':case 'notePlay':return right?M.midiOf(q.note):M.midiOf(q.note)+1;
  case 'letterFind':{for(let m=48;m<72;m++){const w=M.whiteFromMidi(m);if(w&&w[0]===q.letter)return right?m:m+(w[0]==='E'||w[0]==='B'?1:2)}}
  case 'keyGroup':return right?(q.group===2?61:66):60;
  case 'highLow':return right?(q.a>q.b?'a':'b'):(q.a>q.b?'b':'a');
  case 'contour':return right?(q.a===q.b?'same':q.b>q.a?'up':'down'):'nope';
  case 'loudSoft':return right?(q.volume>.2?'loud':'soft'):'nope';
  case 'finger':return right?q.finger:(q.finger%5)+1;
  case 'beats':return right?q.value:(q.value%4)+1;
  case 'symbol':return right?({'key-black':'black','key-white':'white','dyn-p':'soft','dyn-f':'loud'})[q.show]:'nope';
  case 'rhythmTap':{const spb=60/q.bpm;const start=100;return {start,presses:right?q.onsets.map((o,i)=>[start+o*spb+.03,start+(o+q.flat[i]*.9)*spb]):[]}}
  case 'song':return right?{completed:true,mistakes:1}:{completed:true,mistakes:5};
  case 'self':case 'caregiver':return right;}}
// --- curriculum shape ---
const C=NQ.learn.curriculum();
t('every stop skill exists',C.stops.every(s=>s.skills.every(id=>NQ.learn.skill(id))));
t('every prereq exists',C.skills.every(s=>s.prereqs.every(q=>NQ.learn.skill(q))));
t('every content type supported',C.skills.every(s=>{const r=NQ.learn.start(s.id,'review');if(r.ok){NQ.learn.cancel(r.roundId);return true}return r.reason!=='unsupported'}));
t('first stop',NQ.learn.currentStop()==='NQ-00-S1');
t('locked prereq',NQ.learn.start('k-letters','practice').reason==='locked'&&NQ.learn.start('k-letters','practice').missing.length===2);
t('unknown',NQ.learn.start('nope').reason==='unknown');
// --- learn / practice / check ---
t('step learn',NQ.learn.stopStatus('NQ-00-S1').step==='learn');NQ.learn.markLearned('NQ-00-S1');
t('step practice',NQ.learn.stopStatus('NQ-00-S1').step==='practice');
let r=play('e-highlow','practice');t('practice → developing',r.stateAfter==='developing'&&r.total===8&&r.correct===8);
const coins1=NQ.coins.balance();t('coins for practice',coins1>=8);
r=play('e-highlow','check');t('check day 1 not yet secure',r.pass&&r.stateAfter==='developing');
r=play('e-highlow','check');t('same day twice still not secure',r.stateAfter==='developing');
day();r=play('e-highlow','check');t('second day → secure',r.stateAfter==='secure');
t('review scheduled 1 day',NQ.learn.skillState('e-highlow').nextReview===NOW+864e5);
r=play('e-highlow','check',false);t('failed check keeps secure',NQ.learn.skillState('e-highlow').state==='secure');
// symbol + wrong answers + reveal
r=play('k-blackwhite','practice',false);t('wrong practice stays exploring',r.stateAfter==='exploring'&&r.correct===0);
// review drop
day();t('due review',NQ.learn.due().includes('e-highlow'));
r=play('e-highlow','review',false);t('failed review drops one state',r.stateAfter==='developing'&&NQ.learn.skillState('e-highlow').passDays===0);
// caregiver / self checks: no coins, still mastery
const c0=NQ.coins.balance();r=play('t-posture','check');t('caregiver no coins',NQ.coins.balance()===c0&&r.pass);
day();r=play('t-posture','check');t('caregiver 2 days → secure',r.stateAfter==='secure');
r=play('t-hands','check',false);t('self no = not pass',!r.pass);
// rhythm tap judged by engine
r=play('r-pulse','check');t('tap perfect passes',r.pass&&r.total===2);
r=play('r-pulse','practice',false);t('no taps fails',r.correct===0);
// reading gate
NQ.learn.setLearner({reads:false,presentation:'picture'});t('learner set',NQ.learn.learner().reads===false&&NQ.learn.learner().presentation==='picture');
C.skills[0].requiresReading=true;t('needs reading',NQ.learn.start('k-blackwhite','practice').reason==='needs-reading');C.skills[0].requiresReading=false;
// placement for Micaela
const m=NQ.profiles.create('Micaela','🦄');NQ.learn.place('NQ-01-S8');
t('placed: earlier skills secure',NQ.learn.skillState('n-treble').state==='secure'&&NQ.learn.skillState('n-treble').placed);
t('current stop is grand staff',NQ.learn.currentStop()==='NQ-01-S8');
t('grand staff unlocked',NQ.learn.start('n-grand','practice').ok);
day();day();day();t('placed skills come up for review',NQ.learn.due().length>0);
// today plan
const plan=NQ.learn.today(10);t('plan has review, work, piano, reflect',plan.items.some(i=>i.kind==='review')&&plan.items.some(i=>i.kind==='practice'||i.kind==='check')&&plan.items[plan.items.length-1].kind==='reflect');
t('plan 20 has more',NQ.learn.today(20).items.length>=plan.items.length);
// note questions update note stats
r=play('n-grand','practice');t('note stats recorded',Object.keys(m.notes).length>0);
// transfer
NQ.profiles.select(m.id);t('transfer needs secure',NQ.learn.start('n-grand','transfer').reason==='no-transfer'||NQ.learn.start('n-grand','transfer').reason==='not-secure');
r=play('n-treble','transfer');t('transfer → transferable',r.stateAfter==='transferable');
// song: UI-reported outcome
r=play('song-hcb','check');t('song pass',r.pass);r=play('song-hcb','check',false);t('song too many mistakes',!r.pass);
// round dedupe
const rid=NQ.progress.startRound('x');const f1=NQ.progress.finishRound({key:'x',stars:1,act:'t',level:'t',correct:1,total:1,startedAt:NOW,roundId:rid});
const f2=NQ.progress.finishRound({key:'x',stars:3,act:'t',level:'t',correct:1,total:1,startedAt:NOW,roundId:rid});
t('finishRound once per roundId',f1.counted&&f2.duplicate&&m.stars.x===1);
t('no roundId still works, not counted',NQ.progress.finishRound({key:'y',stars:2,act:'t',level:'t',correct:1,total:1,startedAt:NOW}).counted===false&&m.stars.y===2);
// roundId is bound to the profile that started it
const rz=NQ.progress.startRound('z');NQ.profiles.select(p.id);const fz=NQ.progress.finishRound({key:'z',stars:3,act:'t',level:'t',correct:1,total:1,startedAt:NOW,roundId:rz});
t('cross-profile finish refused',fz.reason==='wrong-profile'&&!fz.counted&&!p.stars.z);NQ.profiles.select(m.id);
const fz2=NQ.progress.finishRound({key:'z',stars:3,act:'t',level:'t',correct:1,total:1,startedAt:NOW,roundId:rz});t('owner can still finish it',fz2.counted&&m.stars.z===3);
t('unknown roundId refused',NQ.progress.finishRound({key:'q',stars:3,act:'t',level:'t',correct:1,total:1,startedAt:NOW,roundId:'R-fake'}).duplicate&&!m.stars.q);
// profiles separate
NQ.profiles.select(p.id);t('Zoe untouched by Micaela placement',!NQ.learn.skillState('n-treble').placed&&NQ.learn.skillState('n-treble').state!=='secure');
// stale answer
t('answer after done',NQ.learn.answer('L999-x','a').reason==='no-round');
// persistence
const saved=JSON.parse(store['noteQuest.v1']);t('learn saved per profile',saved.profiles[0].learn.skills['e-highlow']&&saved.profiles[1].learn.placedAt.stopId==='NQ-01-S8');
console.log(`${ok} passed, ${bad} failed`);process.exit(bad?1:0);
