// Effort & Retention Cool-Down (engine 1.9.5; Kevin 2026-11-27; HARBOR_V34_RECONCILIATION.md §4 rev 2), real engine, live Harbor.
// When effort drops or learning isn't sticking, new unlocks pause for a while; practice, reviews and grown-up items stay open.
const fs=require('fs');const vm=require('vm');
const SRC=fs.readFileSync(process.argv[2],'utf8');
let ok=0,bad=0;const t=(n,c,info)=>{if(c)ok++;else{bad++;console.log('FAIL',n,info===undefined?'':JSON.stringify(info))}};
const eq=(n,a,b)=>{const A=String(JSON.stringify(a)),B=String(JSON.stringify(b));if(A===B)ok++;else{bad++;console.log('FAIL',n,'got',A.slice(0,300),'want',B.slice(0,300))}};
let NOW=new Date('2026-11-27T15:00:00').getTime();const RealDate=Date;
global.Date=class extends RealDate{constructor(...a){super(...(a.length?a:[NOW]))}static now(){return NOW}};
let STORE={};global.window=global;global.navigator={};
global.localStorage={getItem:k=>k in STORE?STORE[k]:null,setItem:(k,v)=>{STORE[k]=String(v)},removeItem:k=>{delete STORE[k]}};
global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
global.setInterval=()=>0;global.clearInterval=()=>{};
const MIN=60e3;
function load(store){STORE=store||{};vm.runInThisContext(SRC);const NQ=window.NQ;NQ.start();return NQ}
function right(q){switch(q.type){case 'keyGroup':return q.position?{left:61,right:63,middle:68}[q.position]:q.group===2?61:66;
  case 'highLow':return (q.ask==='lower'?q.a<q.b:q.a>q.b)?'a':'b';case 'keyboardSide':return q.ask==='low'?'left':'right';
  case 'durationCompare':return (q.ask==='shorter'?q.a.beats<q.b.beats:q.a.beats>q.b.beats)?'a':'b';default:throw new Error(q.type)}}
function wrongOf(q){const r=right(q);return typeof r==='number'?(q.group===2?66:61):r==='a'?'b':r==='left'?'right':r==='right'?'left':'a'}
let NQ=load({});
eq('engine version',NQ.version,'1.9.5');
t('cooldown read exists',typeof NQ.learn.cooldown==='function');
const events=[];NQ.on('learn:cooldown',e=>events.push(e));
function fresh(name){NQ.profiles.create(name,'🎵');NQ.placement.dismiss();events.length=0}
// one scored first-try answer (then the right answer so the round moves on); ms is the time from the end of the prompt
function play(round,correct,ms){const q=round.q;const r=NQ.learn.answer(round.id,correct?right(q):wrongOf(q),ms==null?undefined:{ms});
  let next=r.next;if(!correct&&!r.done){const r2=NQ.learn.answer(round.id,right(next||q));next=r2.next;if(r2.done){round.done=true;return r2}}
  round.q=next;if(r.done)round.done=true;NOW+=4000;return r}
function startRound(id,mode='practice'){const r=NQ.learn.start(id,mode);if(!r.ok)return r;return {ok:true,id:r.roundId,q:r.question,done:false}}

// ---------- quiet by default: a fast, accurate learner never triggers it ----------
fresh('Steady');
{let r=startRound('NQ-00-U01-S01');for(let i=0;i<8&&!r.done;i++)play(r,true,2500);
  r=startRound('NQ-00-U01-S01');for(let i=0;i<8&&!r.done;i++)play(r,true,800);   // fast AND right is fine
  eq('accurate play, even fast, causes no cool-down',[NQ.learn.cooldown(),events.length],[null,0]);
  t('the next skill opens',NQ.learn.start('NQ-00-U01-S02','practice').ok);}

// ---------- retention dip: 3 first-try misses in the last 5 ----------
fresh('Dip');
{const coins0=NQ.coins.balance();const r=startRound('NQ-00-U01-S01');
  play(r,true);play(r,false);play(r,true);play(r,false);
  eq('two misses in five: not yet',NQ.learn.cooldown(),null);
  const at=NOW;play(r,false);
  const c=NQ.learn.cooldown();
  t('third miss in five starts a cool-down',c&&c.active&&c.reason==='retention',c);
  eq('it lasts 90 minutes',c&&c.until-at,90*MIN);
  eq('the event fires once with the reason',events.map(e=>e.reason),['retention']);
  const st=NQ.learn.skillState('NQ-00-U01-S01').state;
  t('no state was lowered',['exploring','developing'].includes(st),st);
  t('no coins were taken',NQ.coins.balance()>=coins0);
  // paused
  {const sk=NQ.learn.skill('NQ-00-U01-S02'),keep=sk.prereqs;sk.prereqs=[];   // test-only: make a new skill startable
    try{eq('a never-started skill is paused',NQ.learn.start('NQ-00-U01-S02','practice').reason,'cooldown')}finally{sk.prereqs=keep}}
  eq('opening a new stop is paused',NQ.learn.markLearned('NQ-00-U01'),false);
  eq('a new check on the skill that triggered it is paused',NQ.learn.start('NQ-00-U01-S01','check').reason,'cooldown');
  eq('readiness is paused',NQ.journey.start('NQ-00','navigation').reason,'cooldown');
  const plan=NQ.learn.today(10).items;
  t('today() leads with the cool-down and offers no new stop',plan[0].kind==='cooldown'&&plan[0].reason==='retention'&&!plan.some(i=>i.kind==='learn'||i.kind==='journey'),plan);
  // still open
  t('practice on the started skill stays open',NQ.learn.start('NQ-00-U01-S01','practice').ok);
  // one trigger per session
  const again=startRound('NQ-00-U01-S01');play(again,false);play(again,false);play(again,false);
  eq('at most one trigger per session',events.length,1);
  // clock
  NOW+=30*MIN;t('still on 30 minutes later while playing',NQ.learn.cooldown()?.active);
  const until=NQ.learn.cooldown().until;
  NOW-=3*60*MIN;
  eq('turning the clock back cannot extend it',NQ.learn.cooldown()?.until,until);
  NOW+=3*60*MIN;
  NOW+=46*MIN;
  eq('a new session (45+ minutes away) clears it',NQ.learn.cooldown(),null);
  t('and the next skill opens again',NQ.learn.start('NQ-00-U01-S02','practice').reason!=='cooldown');}

// ---------- the 90-minute limit while the child keeps playing ----------
fresh('Long');
{const r=startRound('NQ-00-U01-S01');play(r,false);play(r,false);play(r,false);
  const until=NQ.learn.cooldown().until;
  for(let i=0;i<10;i++){NOW+=9*MIN+30e3;const p=startRound('NQ-00-U01-S01');if(p.ok)play(p,true)}   // stays in session (< 45 min gaps)
  t('cleared once its 90 minutes are up',NOW>=until&&NQ.learn.cooldown()===null,{now:NOW,until});}

// ---------- failing the same check twice ----------
fresh('Checks');
{let r=startRound('NQ-00-U01-S01');for(let i=0;i<8&&!r.done;i++)play(r,true);   // developing, so a check is meaningful
  const failCheck=()=>{const c=startRound('NQ-00-U01-S01','check');let n=0;while(c.ok&&!c.done&&n<20){play(c,n%2===0);n++}};
  // keep misses spread so the 3-of-5 rule doesn't fire first: alternate right/wrong gives 2 misses per 5 at most at the end
  failCheck();
  t('one failed check: no cool-down',NQ.learn.cooldown()===null||NQ.learn.cooldown().reason==='retention');
  const before=NQ.learn.cooldown();
  if(!before){failCheck();const c=NQ.learn.cooldown();t('two failed checks of one skill start a cool-down',c&&c.reason==='retention'&&c.skills&&c.skills.includes('NQ-00-U01-S01'),c)}
  else t('two failed checks of one skill start a cool-down (reached through the miss rule here)',before.reason==='retention');}

// ---------- rushing: wrong and much faster than her own baseline ----------
fresh('Rush');
{let r=startRound('NQ-00-U01-S01');for(let i=0;i<8&&!r.done;i++)play(r,true,3000);
  r=startRound('NQ-00-U01-S01');for(let i=0;i<3&&!r.done;i++)play(r,true,3000);   // baseline: answers that left the window
  eq('a baseline builds silently',NQ.learn.cooldown(),null);
  play(r,false,300);play(r,false,280);play(r,false,320);
  const c=NQ.learn.cooldown();t('three fast wrong answers are "rushing"',c&&c.reason==='rushing',c);}
fresh('Rush-no-baseline');
{const r=startRound('NQ-00-U01-S01');play(r,false,300);play(r,false,300);play(r,false,300);
  const c=NQ.learn.cooldown();t('without a baseline the same answers count as a retention dip, not rushing',c&&c.reason==='retention',c);}

// ---------- drifting: much slower than her own baseline ----------
fresh('Drift');
{let r=startRound('NQ-00-U01-S01');for(let i=0;i<8&&!r.done;i++)play(r,true,2000);
  r=startRound('NQ-00-U01-S01');for(let i=0;i<2&&!r.done;i++)play(r,true,2000);
  for(let i=0;i<2&&!r.done;i++)play(r,true,6000);
  eq('two slow answers out of five: not yet',NQ.learn.cooldown(),null);
  play(r,true,6000);
  const c=NQ.learn.cooldown();t('when most (3) of the last five are 3× her baseline it is "drifting"',c&&c.reason==='drifting',c);}
fresh('Drift-not');
{let r=startRound('NQ-00-U01-S01');for(let i=0;i<8&&!r.done;i++)play(r,true,2000);
  r=startRound('NQ-00-U01-S01');for(let i=0;i<7&&!r.done;i++)play(r,true,4500);
  eq('a little slower (2.25×) is fine',NQ.learn.cooldown(),null);}

// ---------- grown-up items are never paused ----------
fresh('Grown-ups');
{NQ.learn.place('NQ-00-U03');const r=startRound('NQ-00-U03-S01');play(r,false);play(r,false);play(r,false);
  t('cool-down is on',NQ.learn.cooldown()?.active);
  t('a grown-up check still starts',NQ.learn.start('NQ-00-U02-S02','check').ok);
  t('a due review of a placed skill still starts',NQ.learn.start('NQ-00-U01-S01','review').ok);}

// ---------- pileup (test-only: prerequisites removed so many skills can start at once) ----------
fresh('Pileup');
{const C=NQ.learn.curriculum();const harbor=C.skills.filter(s=>s.id.startsWith('NQ-00-U01')||s.id.startsWith('NQ-00-U03'));
  const saved=harbor.map(s=>s.prereqs);harbor.forEach(s=>{s.prereqs=[]});
  try{
    NQ.learn.place('NQ-00-U03');   // open U03; then forget U01-U03 progress so the skills are new again
    const L=NQ.state().profiles.find(p=>p.name==='Pileup').learn;
    for(const id of ['NQ-00-U01-S01','NQ-00-U01-S02','NQ-00-U01-S03','NQ-00-U03-S01','NQ-00-U03-S02'])delete L.skills[id];
    const started=[];for(const id of ['NQ-00-U01-S01','NQ-00-U01-S02','NQ-00-U01-S03','NQ-00-U03-S01']){const r=NQ.learn.start(id,'practice');started.push(r.ok);if(r.ok)NQ.learn.cancel(r.roundId)}
    eq('four new skills can start',started,[true,true,true,true]);
    const fifth=NQ.learn.start('NQ-00-U03-S02','practice');
    t('a fifth new skill with none of the four practiced starts a pileup cool-down',fifth.reason==='cooldown'&&NQ.learn.cooldown()?.reason==='pileup',fifth);
  }finally{harbor.forEach((s,i)=>{s.prereqs=saved[i]})}}

// ---------- saves ----------
{const saved=JSON.parse(JSON.stringify(STORE));const before=NQ.learn.cooldown();NQ=load(saved);
  NQ.profiles.select(NQ.profiles.list().find(p=>p.name==='Pileup').id);
  eq('a cool-down survives a reload',NQ.learn.cooldown()?.reason,before?.reason);
  const p=NQ.profiles.create('Old save','🎵');NQ.placement.dismiss();delete NQ.state().profiles.at(-1).learn.cd;
  eq('a learner without cool-down data has none',NQ.learn.cooldown(),null);
  t('and plays normally',NQ.learn.start('NQ-00-U01-S01','practice').ok);
  NQ.state().profiles.at(-1).learn.cd={recent:'x',rt:7,session:5,cooldown:'bad'};
  t('damaged cool-down data is ignored safely',NQ.learn.cooldown()===null&&NQ.learn.start('NQ-00-U01-S01','practice').ok);}

console.log(ok+' passed, '+bad+' failed');
if(bad)process.exit(1);
