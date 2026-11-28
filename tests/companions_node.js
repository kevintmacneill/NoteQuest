// Engine 1.7 companions and friendship tests (contract v0.6 §B, §C, rows of §G), no page, fake clock and seeded randomness.
// Usage: node tests/companions_node.js <engine.js>
const fs=require('fs');const vm=require('vm');
const store={};global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}};
global.window=global;global.navigator={};global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
let NOW=new Date(2026,10,21,15,0,0).getTime();const RealDate=Date;
global.Date=class extends RealDate{constructor(...a){super(...(a.length?a:[NOW]))}static now(){return NOW}};
let seed=1;const seeded=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648};Math.random=seeded;
const HR=3600e3,DAY=24*HR;
const pet=(id,sp,hab)=>({id,sp,name:id,hab,h:90,hT:NOW,j:90,jT:NOW,c:90,cT:NOW,meals:0,petT:0,grow:6,gT:NOW});
const prof=(id,name)=>({id,name,avatar:'🎹',stars:{},stickers:[],notes:{},seconds:0,log:[],hints:'auto',unlockAll:false,exactOctave:false,coins:100,starterDone:true,
  pets:[pet(id+'1','puppy','home'),pet(id+'2','kitten','home'),pet(id+'3','bunny','home')],habs:['home'],inv:{},tools:['scooper'],decor:[],decorInv:{},mess:{},messT:{},curHab:'home',
  supplies:{soap:5,bags:10},companions:{primary:id+'1',sidekick:id+'2'},wild:{sup:{},mis:{},done:{},journal:{}}});
// an engine-1.6 save: primary + sidekick
store['noteQuest.v1']=JSON.stringify({v:2,updated:NOW,settings:{sound:true},profiles:[prof('pA','Ana'),prof('pB','Ben')]});
vm.runInThisContext(fs.readFileSync(process.argv[2],'utf8'));
const NQ=window.NQ;let ok=0,bad=0;const t=(n,c)=>{if(c)ok++;else{bad++;console.log('FAIL',n)}};
const bondEvents=[];NQ.on('companion:bond',e=>bondEvents.push(e));
NQ.start();
const C=NQ.companions,pts=id=>(C.bond(id)||{}).points;
const round=(stars=0)=>{const id=NQ.progress.startRound('t');return NQ.progress.finishRound({key:'L1:name',stars,act:'name',level:'L1',correct:0,total:1,startedAt:NOW,roundId:id})};

// ---------- G18: an old save with a sidekick ----------
let A=NQ.profiles.select('pA');
t('G18 old primary becomes the companion',C.get().companion.id==='pA1'&&A.companions.companion==='pA1');
t('G18 sidekick retired, still owned',C.get().sidekick===null&&A.pets.some(x=>x.id==='pA2')&&A.companions.retiredSidekick==='pA2');
t('G18 setPrimary alias, setSidekick retired',C.setPrimary('pA1').ok&&C.setSidekick('pA2').reason==='retired');
t('upgrade saved',JSON.parse(store['noteQuest.v1']).profiles[0].companions.companion==='pA1');
t('every pet starts at level 1, 0 points',A.pets.every(x=>{const b=C.bond(x.id);return b.level===1&&b.points===0}));
t('reading bond writes nothing',A.pets.every(x=>!x.bond));
t('bond of unknown or other-profile pet is null',C.bond('nope')===null&&C.bond('pB1')===null&&C.personality('pB1')===null);

// ---------- G3: care gives no friendship ----------
A.inv.kibble=5;A.tools.push('toy');NQ.pets.feed('pA1','kibble');NQ.pets.play('pA1');NQ.pets.pat('pA1');
const sb=NQ.pets.startBath('pA1');if(sb.ok)NQ.pets.finishBath('pA1',sb.bathId);
t('G3 care changes needs, not friendship',pts('pA1')===0&&!bondEvents.length);

// ---------- G2a / G4b: one date, 10 rounds ----------
const gains=[];for(let i=0;i<10;i++){const b=pts('pA1');round(i%4);gains.push(pts('pA1')-b)}
t('G4b rounds 1-7 give +2, round 8 gives +1, then 0',JSON.stringify(gains)==='[2,2,2,2,2,2,2,1,0,0]');
t('G2a active pet gains 15 on one date',pts('pA1')===15&&C.bond('pA1').todayLeft===0);
t('G2a idle pets gain 0',pts('pA2')===0&&pts('pA3')===0);
t('bond event reports music',bondEvents.length===8&&bondEvents.every(e=>e.reason==='music'&&e.petId==='pA1')&&bondEvents[7].points===15);

// ---------- G2b: 5 + 5 over two dates (fresh profile pet pA3) ----------
C.set('pA3');for(let i=0;i<5;i++)round();NOW+=DAY;for(let i=0;i<5;i++)round();
t('G2b two dates give 20 (cap resets)',pts('pA3')===20&&pts('pA1')===15&&pts('pA2')===0);

// ---------- G9: duplicate finishes give nothing ----------
{const id=NQ.progress.startRound('t');const b=pts('pA3');NQ.progress.finishRound({key:'k',stars:1,act:'a',level:'L',correct:1,total:1,startedAt:NOW,roundId:id});
 NQ.progress.finishRound({key:'k',stars:1,act:'a',level:'L',correct:1,total:1,startedAt:NOW,roundId:id});
 t('G9 duplicate finish credits once',pts('pA3')===b+2)}
{const b=pts('pA3');NQ.progress.finishRound({key:'k',stars:3,act:'a',level:'L',correct:1,total:1,startedAt:NOW});t('uncounted round (no roundId) gives nothing',pts('pA3')===b)}

// ---------- G4: thresholds ----------
{const p=A.pets.find(x=>x.id==='pA2');const lv=[];[[49,1],[50,2],[119,2],[120,3],[209,3],[210,4],[319,4],[320,5],[999,5]].forEach(([n,l])=>{p.bond={points:n-2,level:1,unlocked:[],lean:{},day:null,today:0};C.set('pA2');round();lv.push(C.bond('pA2').level===l||[n,C.bond('pA2')])});
 t('G4 levels exactly at 50/120/210/320',lv.every(x=>x===true));
 t('next threshold reported',(p.bond={points:60,level:2,unlocked:[],lean:{},day:null,today:0},C.bond('pA2').next===120));
 delete p.bond}

// ---------- G16: score never matters ----------
NOW+=DAY;C.set('pA1');{const b=pts('pA1');round(0);const z=pts('pA1');round(3);t('G16 a 0-star round and a 3-star round both give +2',z===b+2&&pts('pA1')===b+4)}

// ---------- learn rounds and Journey Readiness parts are music adventures ----------
function solve(q){switch(q.type){case 'symbol':return q.show.replace(/^key-/,'');case 'highLow':return q.a>q.b?'a':'b';
  case 'rhythmTap':{const spb=60/q.bpm;return {start:50,presses:q.onsets.map((o,i)=>[50+o*spb+.03,50+(o+q.flat[i]*.9)*spb])}}default:return null}}
{const b=pts('pA1');const r=NQ.learn.start('k-blackwhite','practice');let q=r.question,res=null;while(q){res=NQ.learn.answer(r.roundId,solve(q));q=res.next}
 t('a finished learn round gives +2',r.ok&&res.done&&pts('pA1')===b+2);
 t('learn result unchanged in shape',res.result&&res.result.skillId==='k-blackwhite')}
{const b=pts('pA1');const r=NQ.journey.start('NQ-00','navigation');let q=r.question,x=null;while(q){x=NQ.journey.answer(r.attemptId,solve(q));q=x.next}
 t('a finished readiness part gives +2',r.ok&&x.done&&pts('pA1')===b+2);
 NQ.journey.finish(r.attemptId);t('journey finish() repeat gives nothing',pts('pA1')===b+2)}

// ---------- G4c / G14: wrong profile ----------
{const A0=JSON.stringify(NQ.state().profiles.map(p=>[p.coins,p.pets.map(x=>x.bond)]));
 const id=NQ.progress.startRound('t');const L=NQ.learn.start('k-blackwhite','practice');const J=NQ.journey.start('NQ-00','timing');
 NQ.profiles.select('pB');
 const f=NQ.progress.finishRound({key:'k',stars:3,act:'a',level:'L',correct:1,total:1,startedAt:NOW,roundId:id});
 t('G4c game round from A finished in B: wrong-profile',f.reason==='wrong-profile'&&f.counted===false);
 t('G4c learn round from A answered in B: wrong-profile',NQ.learn.answer(L.roundId,'black').reason==='wrong-profile');
 t('G4c journey attempt from A answered in B: wrong-profile',NQ.journey.answer(J.attemptId,'a').reason==='wrong-profile');
 t('G4c nothing credited in either profile',JSON.stringify(NQ.state().profiles.map(p=>[p.coins,p.pets.map(x=>x.bond)]))===A0);
 NQ.profiles.select('pA')}

// ---------- G13b: a rescue counts only through its music round ----------
{const w=Object.keys(NQ.content.WILD)[0];const b=pts('pA1');NQ.wild.awardChest(w,3);const left=NQ.wild.remaining(w);left.forEach(s=>NQ.wild.giveSupply(w,s));NQ.wild.rescue(w);NQ.wild.invite(w,'Wildy');
 t('G13b awarding, giving supplies, rescuing and inviting give no friendship',pts('pA1')===b)}

// ---------- G13: idle 30 days ----------
{const snap=JSON.stringify(NQ.state().profiles.map(p=>p.pets.map(x=>x.bond||null)));NOW+=30*DAY;NQ.pets.tick();A.pets.forEach(x=>NQ.pets.display(x.id));NQ.pets.genMess('home');
 NOW-=40*DAY;NQ.pets.tick();NOW+=40*DAY;
 t('G13 30 days idle (and a backwards clock) never change friendship',JSON.stringify(NQ.state().profiles.map(p=>p.pets.map(x=>x.bond||null)))===snap)}

// ---------- eggs ----------
{const B=NQ.profiles.select('pB');B.pets.push({id:'pBegg',sp:'puppy',name:'Egg',hab:'home',h:80,hT:NOW,j:85,jT:NOW,c:90,cT:NOW,meals:0,petT:0,grow:0,gT:NOW,egg:{rounds:0,t:NOW}});
 t('an egg cannot be chosen',C.set('pBegg').reason==='egg'&&C.get().companion.id==='pB1');
 B.companions.companion='pBegg';round();t('an egg companion gains nothing',!B.pets.find(x=>x.id==='pBegg').bond&&pts('pB1')===0);
 round();round();t('the hatching round credits the hatched companion',!B.pets.find(x=>x.id==='pBegg').egg&&pts('pBegg')===2);
 NQ.profiles.select('pA')}

// ---------- personality and unlocks: the data hook mechanics, with stand-in data (real data checked in G17 below) ----------
{const D=C.data;const real={species:D.species,activityTraits:D.activityTraits,unlocks:D.unlocks};
 D.species={puppy:{performer:60,gentle:40}};D.activityTraits={'kind:journey':'braveheart','act:name':'scholar'};D.unlocks=[{id:'wave',level:2},{id:'bow',level:2,trait:'gentle'}];
 const p1=A.pets.find(x=>x.id==='pA1');p1.bond.lean={};
 t('baseline alone until any lean exists',JSON.stringify(C.personality('pA1'))==='{"baseline":{"performer":60,"gentle":40},"current":{"performer":60,"gentle":40},"top":"performer"}');
 NOW+=DAY;round();const P1=C.personality('pA1');
 t('70/30 mix of baseline and music lean',Math.abs(P1.current.performer-42)<1e-9&&Math.abs(P1.current.gentle-28)<1e-9&&Math.abs(P1.current.scholar-30)<1e-9&&P1.top==='performer');
 const sum=Object.values(P1.current).reduce((a,b)=>a+b,0);t('personality normalized to 100',Math.abs(sum-100)<1e-9);
 p1.bond.points=48;p1.bond.level=1;round();t('unlock at level 2; trait unlock needs the top trait',C.bond('pA1').level===2&&JSON.stringify(C.bond('pA1').unlocked)==='["wave"]');
 p1.bond.points=0;p1.bond.level=1;NOW+=DAY;round();t('unlocks stay when level falls',JSON.stringify(C.bond('pA1').unlocked)==='["wave"]');
 D.species=real.species;D.activityTraits=real.activityTraits;D.unlocks=real.unlocks;p1.bond.lean={};p1.bond.unlocked=[]}

// ---------- G17: ChatGPT's §H data (messages/2026-11-21-1625-…-companion-data-handoff.md) ----------
{const D=C.data,SP=NQ.content.SPECIES,TR=['performer','scholar','explorer','braveheart','gentle'];
 t('G17 five canonical traits, in order',JSON.stringify(D.traits)===JSON.stringify(TR));
 t('G17 every species has a baseline: the five traits, nonnegative integers, summing to 100',SP.length>40&&SP.every(s=>{const b=D.species[s.id];return b&&JSON.stringify(Object.keys(b))===JSON.stringify(TR)&&TR.every(k=>Number.isInteger(b[k])&&b[k]>=0)&&TR.reduce((a,k)=>a+b[k],0)===100}));
 t('G17 no baseline for a species that does not exist',Object.keys(D.species).every(id=>SP.some(s=>s.id===id)));
 const W=id=>TR.map(k=>D.species[id][k]).join('/');
 t('G17 authored baselines',W('capybara')==='10/15/15/10/50'&&W('fox')==='15/20/35/20/10'&&W('owl')==='5/45/20/15/15'&&W('puppy')==='25/10/20/20/25'&&W('kitten')==='15/20/20/10/35');
 t('G17 every other species uses the 20s placeholder',SP.filter(s=>!['capybara','fox','owl','puppy','kitten'].includes(s.id)).every(s=>W(s.id)==='20/20/20/20/20'));
 const fox=SP.find(s=>s.id==='fox'),owl=SP.find(s=>s.id==='owl');
 t('G17 fox and owl registered (diet uses real foods), hidden from the shop',fox&&owl&&fox.hidden&&owl.hidden&&[fox,owl].every(s=>s.diet.length&&s.diet.every(f=>NQ.content.FOODS[f])&&s.diet.includes(s.fav)));
 const A0=JSON.stringify(A.pets.map(x=>x.id)),c0=A.coins;if(!A.habs.includes('sanct'))A.habs.push('sanct');
 t('G17 fox and owl cannot be adopted yet (availability waits on ChatGPT details)',NQ.pets.adopt('fox','F').reason==='not-yet'&&NQ.pets.adopt('owl','O').reason==='not-yet'&&JSON.stringify(A.pets.map(x=>x.id))===A0&&A.coins===c0);
 A.habs=A.habs.filter(h=>h!=='sanct');
 t('G17 species baselines give the expected top trait',(()=>{const top=id=>{const b=D.species[id];return TR.reduce((m,k)=>b[k]>b[m]?k:m,TR[0])};return top('capybara')==='gentle'&&top('fox')==='explorer'&&top('owl')==='scholar'})());
 t('G17 activity map uses exact engine tags only',JSON.stringify(D.activityTraits)==='{"kind:game":"performer","kind:learn":"scholar","kind:journey":"braveheart","domain:D05":"gentle"}');
 t('G17 unlock list',JSON.stringify(D.unlocks.map(u=>[u.id,u.level,u.trait||'']))===JSON.stringify([['bond-wave',2,''],['bond-happy-dance',3,'performer'],['bond-study-pose',3,'scholar'],['bond-explorer-pose',3,'explorer'],['bond-brave-pose',3,'braveheart'],['bond-cozy-pose',3,'gentle'],['bond-sparkle',4,''],['bond-celebration',5,'']]));
 // real music tags build the lean, for the active companion only
 const p1=A.pets.find(x=>x.id==='pA1'),p2=A.pets.find(x=>x.id==='pA2');C.set('pA1');NOW+=DAY;
 round();t('G17 a game round leans performer',JSON.stringify(p1.bond.lean)==='{"performer":1}');
 {const r=NQ.learn.start('k-blackwhite','practice');let q=r.question,res;while(q){res=NQ.learn.answer(r.roundId,solve(q));q=res.next}}
 t('G17 a learn round leans scholar',JSON.stringify(p1.bond.lean)==='{"performer":1,"scholar":1}');
 {const r=NQ.learn.start('e-highlow','practice');let q=r.question,res;while(q){res=NQ.learn.answer(r.roundId,solve(q));q=res.next}t('listening learn round finished',res&&res.done)}
 t('G17 a listening (D05) learn round leans scholar and gentle',JSON.stringify(p1.bond.lean)==='{"performer":1,"scholar":2,"gentle":1}');
 {const r=NQ.journey.start('NQ-00','timing');let q=r.question,x;while(q){x=NQ.journey.answer(r.attemptId,solve(q));q=x.next}t('readiness timing part finished',r.ok&&x&&x.done)}
 t('G17 a readiness part leans braveheart',p1.bond.lean.braveheart===1)
 t('G17 the idle pet gets no lean',!p2.bond||JSON.stringify(p2.bond.lean)==='{}');
 const P=C.personality('pA1');t('G17 shown personality: 70% puppy baseline + 30% lean',Math.abs(P.current.performer-(.7*25+.3*20))<1e-9&&Math.abs(P.current.scholar-(.7*10+.3*40))<1e-9&&Math.abs(P.current.explorer-.7*20)<1e-9&&P.top==='performer');
 // unlocks at levels 2-5, the level 3 pose follows the top trait, and they survive a level loss
 const ev0=bondEvents.length;p1.bond.points=48;p1.bond.level=1;p1.bond.unlocked=[];NOW+=DAY;round();
 t('G17 level 2 unlocks the wave',C.bond('pA1').level===2&&JSON.stringify(C.bond('pA1').unlocked)==='["bond-wave"]'&&JSON.stringify(bondEvents[bondEvents.length-1].unlocked)==='["bond-wave"]');
 p1.bond.points=118;round();t('G17 level 3 unlocks only the top trait pose (performer)',C.bond('pA1').level===3&&JSON.stringify(C.bond('pA1').unlocked)==='["bond-wave","bond-happy-dance"]');
 p1.bond.points=208;round();p1.bond.points=318;round();t('G17 levels 4 and 5 unlock sparkle and celebration',C.bond('pA1').level===5&&JSON.stringify(C.bond('pA1').unlocked)==='["bond-wave","bond-happy-dance","bond-sparkle","bond-celebration"]');
 p1.bond.points=0;p1.bond.level=1;NOW+=DAY;round();t('G17 unlocks stay after friendship falls to level 1',C.bond('pA1').level===1&&C.bond('pA1').unlocked.length===4);
 // capybara: gentle top, so its level 3 pose is the cozy one
 A.pets.push({id:'pAc',sp:'capybara',name:'Capy',hab:'spring',h:90,hT:NOW,j:90,jT:NOW,c:90,cT:NOW,meals:0,petT:0,grow:6,gT:NOW});C.set('pAc');
 const pc=A.pets.find(x=>x.id==='pAc');pc.bond={points:118,level:2,unlocked:['bond-wave'],lean:{gentle:5},day:null,today:0};round();
 t('G17 a capybara (gentle top) earns the cozy pose at level 3',C.personality('pAc').top==='gentle'&&JSON.stringify(C.bond('pAc').unlocked)==='["bond-wave","bond-cozy-pose"]');
 A.pets=A.pets.filter(x=>x.id!=='pAc');C.set('pA1');p1.bond.points=0;p1.bond.level=1}

// ---------- G1: companions never change learning, coins, stickers or journey ----------
function session(compId){
  store['noteQuest.v1']=JSON.stringify({v:2,updated:NOW,settings:{sound:true},profiles:[prof('pS','Sam')]});
  seed=42;NQ.start();NQ.profiles.select('pS');C.set(compId);NQ.coins.roundStart();
  const out=[];for(let i=0;i<4;i++)out.push(round(i));
  const r=NQ.learn.start('k-blackwhite','check');let q=r.question,res;let n=0;while(q){res=NQ.learn.answer(r.roundId,n++%3?solve(q):'nope');q=res.next}out.push(res.result);
  const j=NQ.journey.start('NQ-00','navigation');q=j.question;let x;while(q){x=NQ.journey.answer(j.attemptId,solve(q));q=x.next}out.push(x.result);
  const p=JSON.parse(JSON.stringify(NQ.profiles.current()));delete p.pets;delete p.companions;
  // round ids are unique per round by design (WP-0.7), so they are the one thing allowed to differ between the two sessions
  return JSON.stringify([out,p,NQ.learn.skillState('k-blackwhite'),NQ.learn.stopStatus('NQ-00-S1'),NQ.journey.status('NQ-00')],(k,v)=>k==='roundId'?'(id)':v)}
{const T=NOW;const s1=session('pS1');NOW=T;const s2=session('pS2');t('G1 same session, different companion: identical learning, coins, stickers, journey and results',s1===s2&&s1.length>500)}

console.log(`${ok} passed, ${bad} failed`);process.exit(bad?1:0);
