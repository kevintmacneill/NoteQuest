// Harbor variety quick fix (engine 1.9.3; Kevin 2026-11-26 22:40: "very shallow and repetitive"), against the REAL engine.
// Same v3.2 IDs; richer questions: black keys ask groups of two AND three (U01-S01) and a named key inside a group (U05-S01);
// high/low asks higher AND lower (U01-S02), and closer notes in U03-S01. Content without the new options behaves as before.
const fs=require('fs');const vm=require('vm');
const SRC=fs.readFileSync(process.argv[2],'utf8');
let ok=0,bad=0;const t=(n,c)=>{if(c)ok++;else{bad++;console.log('FAIL',n)}};
const eq=(n,a,b)=>{const A=String(JSON.stringify(a)),B=String(JSON.stringify(b));if(A===B)ok++;else{bad++;console.log('FAIL',n,'got',A.slice(0,300),'want',B.slice(0,300))}};
let STORE={};global.window=global;global.navigator={};
global.localStorage={getItem:k=>k in STORE?STORE[k]:null,setItem:(k,v)=>{STORE[k]=String(v)},removeItem:k=>{delete STORE[k]}};
global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
global.setInterval=()=>0;global.clearInterval=()=>{};
vm.runInThisContext(SRC);const NQ=window.NQ;NQ.start();
eq('engine version',NQ.version,'1.9.3');
NQ.profiles.create('Variety','🎵');NQ.placement.dismiss();NQ.learn.place('NQ-01-U01');
const C=NQ.learn.curriculum(),skill=id=>C.skills.find(s=>s.id===id);
const KEY={left:61,right:63,middle:68};
function right(q){if(q.type==='keyGroup')return q.position?KEY[q.position]:(q.group===2?61:66);
  if(q.type==='highLow')return (q.ask==='lower'?q.a<q.b:q.a>q.b)?'a':'b';
  if(q.type==='keyboardSide')return q.ask==='low'?'left':'right';
  if(q.type==='durationCompare')return (q.ask==='shorter'?q.a.beats<q.b.beats:q.a.beats>q.b.beats)?'a':'b';
  throw new Error(q.type)}
function rounds(id,n){const qs=[];for(let k=0;k<n;k++){const r=NQ.learn.start(id,'practice');if(!r.ok)throw new Error(id+' '+r.reason);
  let q=r.question;while(q){qs.push(Object.assign({round:k},q));const a=NQ.learn.answer(r.roundId,right(q));if(!a.correct)throw new Error('solver wrong for '+JSON.stringify(q));q=a.next}}return qs}
const kinds=qs=>[...new Set(qs.map(({index,total,round,...v})=>JSON.stringify(v)))];

// ---------- content ----------
eq('U01-S01 asks both groups',skill('NQ-00-U01-S01').content,{type:'keyGroup',groups:[2,3]});
eq('U05-S01 asks named keys',skill('NQ-00-U05-S01').content,{type:'keyGroup',groups:[2,3],positions:true});
eq('U05-S01 title matches its new task',skill('NQ-00-U05-S01').title,{child:'Find the exact black key',adult:'Find a named key inside a black-key group'});
t('U01-S02 and U03-S01 are no longer copies',JSON.stringify(skill('NQ-00-U01-S02').content)!==JSON.stringify(skill('NQ-00-U03-S01').content));
t('U01-S01 and U05-S01 are no longer copies',JSON.stringify(skill('NQ-00-U01-S01').content)!==JSON.stringify(skill('NQ-00-U05-S01').content));
t('every playable Harbor skill still validates',C.skills.filter(s=>s.level==='NQ-00'&&NQ.learn.playable(s.id).playable).every(s=>NQ.learn.validate(s.content).length===0));

// ---------- black keys ----------
{const qs=rounds('NQ-00-U01-S01',6);const groups=new Set(qs.map(q=>q.group));
  t('groups of two and three are both asked',groups.has(2)&&groups.has(3));
  t('no position is asked at stop 1',qs.every(q=>q.position===undefined));
  const many=rounds('NQ-00-U01-S01',40);let longest=1,run=1;
  for(let i=1;i<many.length;i++){run=many[i].round===many[i-1].round&&many[i].group===many[i-1].group?run+1:1;longest=Math.max(longest,run)}
  t('stop 1 never asks the same group three times in a row (Grok F2)',longest<=2);
  const r=NQ.learn.start('NQ-00-U01-S01','practice');const q=r.question;
  eq('a key from the other group is wrong',NQ.learn.answer(r.roundId,q.group===2?66:61).correct,false);NQ.learn.cancel(r.roundId);}
{const qs=rounds('NQ-00-U05-S01',6);
  eq('stop 5 asks exactly the three named keys',kinds(qs).map(k=>JSON.parse(k)).map(q=>q.group+':'+q.position).sort(),['2:left','2:right','3:middle']);
  t('within a round, stop 5 never asks the same key twice in a row',qs.every((q,i)=>i===0||q.round!==qs[i-1].round||q.position!==qs[i-1].position||q.group!==qs[i-1].group));
  // the right group but the wrong key is wrong; any octave of the named key is right
  let r=NQ.learn.start('NQ-00-U05-S01','practice'),q=r.question;
  const wrongSameGroup=q.group===2?(q.position==='left'?63:61):66;
  eq('right group, wrong key is wrong',NQ.learn.answer(r.roundId,wrongSameGroup).correct,false);
  eq('the named key in another octave is right',NQ.learn.answer(r.roundId,KEY[q.position]-12).correct,true);
  NQ.learn.cancel(r.roundId);}

// ---------- high and low ----------
{const qs=rounds('NQ-00-U01-S02',6);const asks=new Set(qs.map(q=>q.ask));
  t('stop 1 asks higher and lower',asks.has('higher')&&asks.has('lower'));
  t('stop 1 notes stay at least 6 apart',qs.every(q=>Math.abs(q.a-q.b)>=6));
  const r=NQ.learn.start('NQ-00-U01-S02','practice');let q=r.question;
  const wrong=right(q)==='a'?'b':'a';eq('"lower" is judged the other way round',NQ.learn.answer(r.roundId,wrong).correct,false);NQ.learn.cancel(r.roundId);}
{const qs=rounds('NQ-00-U03-S01',8);
  t('stop 3 asks both ways too',new Set(qs.map(q=>q.ask)).size===2);
  t('stop 3 uses close notes: 3 to 7 semitones apart (Grok F4)',qs.every(q=>Math.abs(q.a-q.b)>=3&&Math.abs(q.a-q.b)<=7));}
{const qs=rounds('NQ-00-U01-S02',30);
  t('high/low never asks the identical question twice in a row (Grok nit)',qs.every((q,i)=>i===0||q.round!==qs[i-1].round||q.a!==qs[i-1].a||q.b!==qs[i-1].b||q.ask!==qs[i-1].ask));}

// ---------- readiness still works with the new shapes ----------
{const placed=NQ.profiles.current().id;NQ.profiles.create('Reader','🎵');NQ.placement.dismiss();
  const s=NQ.journey.start('NQ-00','navigation');t('Harbor navigation readiness starts',s.ok);
  if(s.ok){let q=s.question,r;while(q){r=q.grownUp?NQ.journey.confirm(s.attemptId,{by:'caregiver',yes:true}):NQ.journey.answer(s.attemptId,right(q));q=r.next}
    t('and passes with correct answers',r.result.passed===true)}
  NQ.profiles.select(placed);}

// ---------- old content is unchanged ----------
{const sample=o=>NQ.learn.sample(o,{count:12,seed:7});
  const old=sample({type:'keyGroup',group:3});
  t('a plain {group:3} still asks only that group, with no position',old.ok&&old.questions.every(q=>q.group===3&&q.position===undefined));
  const hl=sample({type:'highLow',lo:48,hi:72});
  t('highLow without asks still always asks "higher"',hl.ok&&hl.questions.every(q=>q.ask==='higher'));
  const v=NQ.learn.validate;
  eq('bad groups refused',v({type:'keyGroup',groups:[2,4]}).length>0,true);
  eq('duplicate groups refused',v({type:'keyGroup',groups:[3,3]}).length>0,true);
  eq('positions must be boolean',v({type:'keyGroup',groups:[2],positions:'yes'}).length>0,true);
  eq('bad asks refused',v({type:'highLow',lo:48,hi:72,asks:['louder']}).length>0,true);
  eq('a gap that cannot fit is refused',v({type:'highLow',lo:60,hi:62,minGap:5}).length>0,true);
  eq('group and groups together refused (Grok F3)',v({type:'keyGroup',group:2,groups:[3]}).length>0,true);
  eq('positions with only the group of three refused (Grok F3)',[v({type:'keyGroup',groups:[3],positions:true}).length>0,v({type:'keyGroup',group:3,positions:true}).length>0],[true,true]);
  eq('maxGap below minGap refused',v({type:'highLow',lo:48,hi:72,minGap:5,maxGap:4}).length>0,true);
  eq('maxGap wider than the range refused',v({type:'highLow',lo:48,hi:60,maxGap:13}).length>0,true);
  eq('the shipped shapes are valid',[v({type:'keyGroup',groups:[2,3],positions:true}),v({type:'highLow',lo:48,hi:76,minGap:3,maxGap:7,asks:['higher','lower']})],[[],[]]);
  const g2=sample({type:'keyGroup',group:2});t('a plain {group:2} still asks only the group of two',g2.ok&&g2.questions.every(q=>q.group===2&&q.position===undefined));
  // even a range with a single possible pair never repeats the identical question (ChatGPT review of #170)
  {let repeats=0;for(let seed=1;seed<=300;seed++){const qs=NQ.learn.sample({type:'highLow',lo:60,hi:61,minGap:1,maxGap:1,asks:['higher']},{seed,count:20}).questions;
    for(let i=1;i<qs.length;i++)if(qs[i].a===qs[i-1].a&&qs[i].b===qs[i-1].b&&qs[i].ask===qs[i-1].ask)repeats++}
    eq('narrow range: no identical question twice in a row over 300 seeds',repeats,0);}
  // old content draws no extra random numbers, so seeded sequences elsewhere are unchanged
  const a=sample({type:'highLow',lo:48,hi:72}),b=sample({type:'highLow',lo:48,hi:72,asks:['higher']});
  eq('a single ask draws no extra random number',a.questions.map(q=>[q.a,q.b]),b.questions.map(q=>[q.a,q.b]));
}

// ---------- the hint after two misses says the answer in words (Grok F1) ----------
{const path=require('path');const H=fs.readFileSync(path.join(__dirname,'..','assets','nq-harbor.js'),'utf8');
  const win={NoteQuestActivity:{supports(){return true},showQuestion(){},node(){},button(){},keyPicture(){},soundPlayer(){}}};
  new Function('window','document',H)(win,{});const say=win.NoteQuestHarbor.revealText;
  eq('named key: right of two',say({type:'keyGroup',group:2,position:'right'},2),'Try the right black key in a group of two.');
  eq('named key: middle of three',say({type:'keyGroup',group:3,position:'middle'},3),'Try the middle black key in a group of three.');
  eq('plain group',say({type:'keyGroup',group:3},3),'Try a black key in a group of three.');
  eq('high/low says which sound',[say({type:'highLow',ask:'lower'},'a'),say({type:'highLow',ask:'higher'},'b')],['Try the first sound.','Try the second sound.']);
  eq('keyboard side',say({type:'keyboardSide',ask:'low'},'left'),'Try the left side.');
  t('never "Try 2." or "Try 3." for black keys',[2,3].every(g=>!/^Try \d\.$/.test(say({type:'keyGroup',group:g},g))));}

console.log(ok+' passed, '+bad+' failed');
if(bad)process.exit(1);
