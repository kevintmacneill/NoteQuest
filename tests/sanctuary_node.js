// Engine 1.7 sanctuary and informed-neglect tests (contract v0.6 §D, §E, §F; rows 5-8, 10-15, 18 of §G). No page, fake clock, seeded randomness.
// Usage: node tests/sanctuary_node.js <engine.js>
const fs=require('fs');const vm=require('vm');
const store={};global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}};
global.window=global;global.navigator={};global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
let NOW=new Date(2026,10,21,15,0,0).getTime();const RealDate=Date;
global.Date=class extends RealDate{constructor(...a){super(...(a.length?a:[NOW]))}static now(){return NOW}};
let seed=7;Math.random=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648};
const HR=3600e3,DAY=24*HR;
const pet=(id,sp,hab)=>({id,sp,name:id,hab,h:90,hT:NOW,j:90,jT:NOW,c:90,cT:NOW,meals:0,petT:0,grow:6,gT:NOW});
const prof=(id,name,extra={})=>Object.assign({id,name,avatar:'🎹',stars:{},stickers:[],notes:{},seconds:0,log:[],hints:'auto',unlockAll:false,exactOctave:false,coins:100,starterDone:true,
  pets:[pet(id+'1','puppy','home'),pet(id+'2','kitten','home'),pet(id+'3','fish','pond')],habs:['home','pond'],inv:{},tools:['scooper'],decor:[],decorInv:{},mess:{},messT:{},curHab:'home',
  supplies:{soap:5,bags:20},companions:{primary:id+'1',sidekick:id+'2'},wild:{sup:{},mis:{},done:{},journal:{}}},extra);
// an engine-1.6 save: per-habitat messes (G18), 10 in all, one without a type
const legacy={home:[{id:'h1',i:'💩',x:20,y:70},{id:'h2',type:'toy',i:'🧦',x:30,y:70},{id:'h3',type:'poop',i:'💩',x:40,y:70},{id:'h4',type:'poop',i:'💩',x:50,y:70},{id:'h5',type:'poop',i:'💩',x:60,y:70},{id:'h6',type:'poop',i:'💩',x:70,y:70}],
  pond:[{id:'p1',type:'algae',i:'🟢',x:20,y:70},{id:'p2',type:'algae',i:'🟢',x:30,y:70},{id:'p3',type:'leaves',i:'🍂',x:40,y:70},{id:'p4',type:'leaves',i:'🍂',x:50,y:70}]};
store['noteQuest.v1']=JSON.stringify({v:2,updated:NOW,settings:{sound:true},profiles:[prof('pA','Ana',{mess:legacy,messT:{home:NOW-HR,pond:NOW-2*HR}}),prof('pB','Ben')]});
vm.runInThisContext(fs.readFileSync(process.argv[2],'utf8'));
const NQ=window.NQ;let ok=0,bad=0;const t=(n,c)=>{if(c)ok++;else{bad++;console.log('FAIL',n)}};
const ev=[];['sanctuary:issue','pet:ward','companion:bond'].forEach(n=>NQ.on(n,e=>ev.push([n,e])));
NQ.start();
const C=NQ.companions,SA=NQ.sanctuary,pts=id=>(C.bond(id)||{}).points;
const round=()=>{const id=NQ.progress.startRound('t');return NQ.progress.finishRound({key:'L1:name',stars:1,act:'name',level:'L1',correct:1,total:1,startedAt:NOW,roundId:id})};
const byId=(p,id)=>p.pets.find(x=>x.id===id);
const makeSick=x=>{Object.assign(x,{h:5,hT:NOW-3*DAY,j:5,jT:NOW-3*DAY,c:5,cT:NOW-3*DAY});delete x.lowSince};
const makeWell=x=>{Object.assign(x,{h:95,hT:NOW,j:95,jT:NOW,c:95,cT:NOW})};/* stands in for feeding, play and a bath */
const clearPen=()=>{const st=SA.state();st.pen.mess.forEach(m=>NQ.pens.cleanMess(m.id))};
const setPts=(x,n)=>{x.bond={points:n,level:C.LEVELS.filter(v=>n>=v).length,unlocked:[],lean:{},day:null,today:0}};

// ---------- G18: old per-habitat messes merge into one pen ----------
let A=NQ.profiles.select('pA');
{const st=SA.state();
 t('G18 one pen, capped at 8 messes',st.pen.mess.length===8);
 t('G18 messes keep their old habitat as zone, and get a type',st.pen.mess.filter(m=>m.zone==='home').length===6&&st.pen.mess.filter(m=>m.zone==='pond').length===2&&st.pen.mess.every(m=>m.type)&&st.pen.mess[0].type==='poop');
 t('G18 old habitats become decor zones',JSON.stringify(st.pen.zones)==='["home","pond"]');
 t('G18 old lists are left in the save untouched',A.mess.home.length===6&&A.mess.pond.length===4);
 t('G18 every healthy animal lives in the pen; hospital empty',st.pen.animals.length===3&&st.hospital.animals.length===0);
 t('G18 the 1.3 per-habitat calls still work: messes(hab) is that zone',NQ.pets.messes('home').length===6&&NQ.pets.messes('pond').length===2);
 t('G18 the sidekick is an ordinary pen animal',C.get().companion.id==='pA1'&&st.pen.animals.includes('pA2'));
 t('upgrade saved',!!JSON.parse(store['noteQuest.v1']).profiles[0].sanctuary)}

// ---------- the pen: one dirty-pen issue, cleaned with bags; the last mess resolves it ----------
{const st=SA.state();const d=st.issues.filter(x=>x.kind==='dirty-pen');
 t('a dirty pen is one issue for every healthy pen animal, unseen',d.length===1&&d[0].petIds.length===3&&d[0].observed===false&&d[0].seq===0);
 t('an unseen issue is not at risk; frustration 1',C.bond('pA1').atRisk===false&&NQ.pets.display('pA1').frustration===1&&NQ.pets.display('pA1').ward==='pen');
 const b0=A.supplies.bags;const r1=NQ.pens.cleanMess(st.pen.mess[0].id);
 t('pens.cleanMess(messId) uses one bag',r1.ok&&A.supplies.bags===b0-1&&r1.left===7);
 t('the (hab, id) form still works and checks the zone',NQ.pens.cleanMess('pond',SA.state().pen.mess.find(m=>m.zone==='home').id).reason==='no-mess'&&NQ.pens.cleanMess('home',SA.state().pen.mess.find(m=>m.zone==='home').id).ok);
 clearPen();
 t('the last mess resolves dirty-pen',SA.state().issues.length===0&&ev.some(([n,e])=>n==='sanctuary:issue'&&e.kind==='dirty-pen'&&e.state==='resolved'));
 t('frustration 0 with no issue',NQ.pets.display('pA1').frustration===0)}

// ---------- mess keeps building in real time (C-B8), in the zones of the animals that live there ----------
{A.sanctuary.pen.messT=NOW-HR;NOW+=10*HR;const st=SA.state();
 t('messes build in real time while away',st.pen.mess.length>=5&&st.pen.mess.length<=8);
 t('each mess is in a zone where a pen animal lives, with that zone\'s types',st.pen.mess.every(m=>(m.zone==='home'&&['poop','toy'].includes(m.type))||(m.zone==='pond'&&['algae','leaves'].includes(m.type))));
 clearPen()}

// ---------- G5: sick while away, return without visiting, 5 rounds: nothing ----------
const pA3=byId(A,'pA3');
{setPts(pA3,30);makeSick(pA3);ev.length=0;NQ.pets.tick();const st=SA.state();
 t('G5 a sick pet moves to the hospital (event pet:ward)',st.hospital.animals.join()==='pA3'&&!st.pen.animals.includes('pA3')&&ev.some(([n,e])=>n==='pet:ward'&&e.petId==='pA3'&&e.ward==='hospital'&&e.was==='pen'));
 const sick=st.issues.find(x=>x.kind==='sick');
 t('G5 one sick issue, opened unseen',st.issues.filter(x=>x.kind==='sick').length===1&&sick.petIds.join()==='pA3'&&!sick.observed&&ev.some(([n,e])=>n==='sanctuary:issue'&&e.state==='opened'&&e.kind==='sick'));
 for(let i=0;i<5;i++)round();
 t('G5 five rounds without visiting cost nothing',pts('pA3')===30&&!ev.some(([n,e])=>n==='companion:bond'&&e.reason==='neglect'));
 t('G5 viewing the pen does not see the hospital',SA.viewed('pen').length===0&&!SA.state().issues.find(x=>x.kind==='sick').observed)}

// ---------- G6 / G15: view the hospital, leave, finish a round: one charge of 1 (an inactive pet, C-B7) ----------
{ev.length=0;const r=SA.viewed('hospital');
 t('G6 viewed() returns the issues now at risk and costs nothing',r.length===1&&r[0].kind==='sick'&&r[0].observed===true&&pts('pA3')===30);
 t('G6 at risk while seen',C.bond('pA3').atRisk===true&&C.bond('pA1').atRisk===false&&NQ.pets.display('pA3').frustration===1);
 t('G6 observed event',ev.some(([n,e])=>n==='sanctuary:issue'&&e.state==='observed'));
 t('G6 viewing twice is the same as once',SA.viewed('hospital').length===1);
 const comp=pts('pA1');round();
 t('G6/G15 the inactive sick pet is charged 1',pts('pA3')===29&&C.get().companion.id==='pA1');
 t('G6 the companion still gains',pts('pA1')===comp+2);
 const is=SA.state().issues.find(x=>x.kind==='sick');
 t('G6 seq becomes 1, no longer seen',is.seq===1&&is.observed===false&&C.bond('pA3').atRisk===false&&NQ.pets.display('pA3').frustration===2);
 t('G6 events: charged, and a neglect bond event',ev.some(([n,e])=>n==='sanctuary:issue'&&e.state==='charged'&&e.seq===1)&&ev.some(([n,e])=>n==='companion:bond'&&e.reason==='neglect'&&e.petId==='pA3'&&e.points===29&&e.was===1))}

// ---------- G7: more rounds without viewing again: nothing ----------
{for(let i=0;i<4;i++)round();t('G7 more rounds without a new view cost nothing',pts('pA3')===29)}

// ---------- G8: view again and finish, repeated: 2, 4, 8, 8 ----------
{const steps=[];for(let i=0;i<4;i++){const b=pts('pA3');SA.viewed('hospital');round();steps.push(b-pts('pA3'))}
 t('G8 charges 2, then 4, then 8, then 8',JSON.stringify(steps)==='[2,4,8,8]'&&pts('pA3')===7);
 t('frustration caps at 3',NQ.pets.display('pA3').frustration===3)}

// ---------- G9: duplicate finish, uncounted round, journey finish() repeat: no extra charge ----------
{SA.viewed('hospital');const id=NQ.progress.startRound('t');const b=pts('pA3');
 NQ.progress.finishRound({key:'k',stars:1,act:'a',level:'L',correct:1,total:1,startedAt:NOW,roundId:id});
 NQ.progress.finishRound({key:'k',stars:1,act:'a',level:'L',correct:1,total:1,startedAt:NOW,roundId:id});
 t('G9 a duplicate finish charges once',pts('pA3')===b-7||pts('pA3')===0);
 SA.viewed('hospital');const b2=pts('pA3');NQ.progress.finishRound({key:'k',stars:1,act:'a',level:'L',correct:1,total:1,startedAt:NOW});
 t('G9 a round with no roundId is not an adventure: no charge',pts('pA3')===b2&&SA.state().issues.find(x=>x.kind==='sick').observed===true)}

// ---------- G11: floor at 0 / level 1; a level can drop; unlocks are kept ----------
{setPts(pA3,52);pA3.bond.unlocked=['wave'];const is=A.sanctuary.issues.find(x=>x.kind==='sick');is.seq=3;
 SA.viewed('hospital');round();t('G11 a charge can drop a level (52 → 44, level 2 → 1)',pts('pA3')===44&&C.bond('pA3').level===1);
 setPts(pA3,3);pA3.bond.unlocked=['wave'];SA.viewed('hospital');round();
 t('G11 points floor at 0, level 1, unlocks kept',pts('pA3')===0&&C.bond('pA3').level===1&&JSON.stringify(C.bond('pA3').unlocked)==='["wave"]')}

// ---------- G10: care fixes it; the same pet sick again starts at seq 0 ----------
{SA.viewed('hospital');makeWell(pA3);ev.length=0;NQ.pets.display('pA3');const st=SA.state();
 t('G10 well again: back to the pen, issue resolved',st.pen.animals.includes('pA3')&&st.hospital.animals.length===0&&!st.issues.some(x=>x.kind==='sick')&&ev.some(([n,e])=>n==='pet:ward'&&e.ward==='pen')&&ev.some(([n,e])=>n==='sanctuary:issue'&&e.state==='resolved'&&e.kind==='sick'));
 setPts(pA3,20);round();t('G10 a resolved issue charges nothing, even though it was seen',pts('pA3')===20);
 t('G10 friendship is not refunded by care',C.bond('pA3').level===1);
 makeSick(pA3);NQ.pets.tick();const is=SA.state().issues.find(x=>x.kind==='sick');
 t('G10 sick again: a new issue at seq 0, unseen',is&&is.seq===0&&!is.observed);
 SA.viewed('hospital');round();t('G10 its first charge is 1 again',pts('pA3')===19);
 makeWell(pA3);NQ.pets.tick()}

// ---------- G12: dirty pen seen and bypassed, one pet also sick and seen: once each ----------
{clearPen();const pA2=byId(A,'pA2');setPts(byId(A,'pA1'),40);setPts(pA2,40);setPts(pA3,40);
 makeSick(pA2);NQ.pets.tick();A.sanctuary.pen.messT=NOW-6*HR;const st=SA.state();
 const d=st.issues.find(x=>x.kind==='dirty-pen');
 t('G12 setup: pA2 in hospital, pen dirty, dirty-pen lists only healthy pen animals',st.hospital.animals.join()==='pA2'&&d&&d.petIds.slice().sort().join()==='pA1,pA3');
 A.sanctuary.issues.find(x=>x.kind==='sick').seq=1;/* the sick issue is at a higher step (2) than dirty-pen (1) */
 SA.viewed('pen');SA.viewed('hospital');ev.length=0;const was=pts('pA1');round();
 t('G12 each healthy pen animal charged once (1); the companion still gains its +2',pts('pA1')===was+2-1&&pts('pA3')===39);
 t('G12 the hospital pet is charged only for its own issue, once (2)',pts('pA2')===38);
 t('G12 no animal gets two neglect events for one completion',['pA1','pA2','pA3'].every(id=>ev.filter(([n,e])=>n==='companion:bond'&&e.reason==='neglect'&&e.petId===id).length===1));
 t('G12 both issues advanced once',SA.state().issues.every(x=>x.seq===(x.kind==='sick'?2:1)&&!x.observed));
 /* a pet with both a sick issue and a dirty-pen issue is impossible: hospital pets leave the dirty-pen list */
 makeWell(pA2);NQ.pets.tick();t('G12 recovered pet rejoins the dirty-pen list',SA.state().issues.find(x=>x.kind==='dirty-pen').petIds.includes('pA2'));
 clearPen()}

// ---------- eggs are never charged ----------
{A.pets.push({id:'pAegg',sp:'puppy',name:'Egg',hab:'home',h:80,hT:NOW,j:85,jT:NOW,c:90,cT:NOW,meals:0,petT:0,grow:0,gT:NOW,egg:{rounds:-99,t:NOW}});
 A.sanctuary.pen.messT=NOW-6*HR;const d=SA.state().issues.find(x=>x.kind==='dirty-pen');
 t('an egg is in the pen but not on the dirty-pen list',SA.state().pen.animals.includes('pAegg')&&!d.petIds.includes('pAegg'));
 SA.viewed('pen');round();t('an egg is never charged',!byId(A,'pAegg').bond);
 A.pets=A.pets.filter(x=>x.id!=='pAegg');clearPen()}

// ---------- G14: profile A's view, then profile B finishes a round: nothing in either ----------
{makeSick(pA3);NQ.pets.tick();SA.viewed('hospital');setPts(pA3,30);
 const B=NQ.profiles.select('pB');const b3=byId(B,'pB3');makeSick(b3);NQ.pets.tick();
 const snapA=JSON.stringify(A.sanctuary),bpts=JSON.stringify(B.pets.map(x=>x.bond||null));round();
 t('G14 B\'s round charges nothing in A',JSON.stringify(A.sanctuary)===snapA&&C.bond('pA3')===null&&byId(A,'pA3').bond.points===30);
 t('G14 B\'s own unseen issue charges nothing',!b3.bond&&SA.state().issues.find(x=>x.kind==='sick').observed===false);
 t('G14 sanctuary.state() is per profile',SA.state().hospital.animals.join()==='pB3');
 NQ.profiles.select('pA');t('G14 A\'s issue is still seen and at risk',C.bond('pA3').atRisk===true)}

// ---------- G4c: a round started in A and finished after switching to B: no charges in either ----------
{const id=NQ.progress.startRound('t');NQ.profiles.select('pB');SA.viewed('hospital');const s0=JSON.stringify(NQ.state().profiles.map(p=>[p.sanctuary,p.pets.map(x=>x.bond||null)]));
 const f=NQ.progress.finishRound({key:'k',stars:1,act:'a',level:'L',correct:1,total:1,startedAt:NOW,roundId:id});
 t('G4c wrong-profile finish charges nothing anywhere',f.reason==='wrong-profile'&&JSON.stringify(NQ.state().profiles.map(p=>[p.sanctuary,p.pets.map(x=>x.bond||null)]))===s0);
 NQ.profiles.select('pA')}

// ---------- G13: 30 days away (and a backwards clock): conditions change, friendship does not, issues start unseen ----------
{makeWell(pA3);NQ.pets.tick();clearPen();A.pets.forEach(x=>setPts(x,25));
 const snap=JSON.stringify(NQ.state().profiles.map(p=>p.pets.map(x=>x.bond||null)));
 NOW+=30*DAY;NQ.pets.tick();const st=SA.state();
 t('G13 after 30 days: every pet sick, in the hospital (real time, C-B8)',st.hospital.animals.length===3);
 t('G13 issues opened while away start unseen',st.issues.length>=3&&st.issues.every(x=>!x.observed));
 for(let i=0;i<3;i++)round();
 NOW-=40*DAY;NQ.pets.tick();round();NOW+=40*DAY;NQ.pets.tick();
 t('G13 30 days idle, rounds without a view, and a backwards clock never change friendship (beyond the companion\'s +2s)',JSON.stringify(NQ.state().profiles.map(p=>p.pets.filter(x=>x.id!=='pA1').map(x=>x.bond||null)))===JSON.stringify(JSON.parse(snap).map((l,i)=>l.filter((x,j)=>NQ.state().profiles[i].pets[j].id!=='pA1'))))}

// ---------- persistence: issues survive a reload; a reload never replays a charge ----------
{SA.viewed('hospital');const before=JSON.stringify(A.sanctuary);const saved=JSON.parse(store['noteQuest.v1']).profiles.find(p=>p.id==='pA');
 t('issues and seen state are saved',JSON.stringify(saved.sanctuary)===before);
 t('round trip through an NQ1: code keeps the sanctuary',(()=>{const o=NQ.saveCode.parse(NQ.saveCode.export());NQ.saveCode.apply(o);NQ.profiles.select('pA');return JSON.stringify(NQ.profiles.current().sanctuary)===before})())}

// ---------- reading never changes friendship; unknown areas do nothing ----------
{const s0=JSON.stringify(NQ.profiles.current().pets.map(x=>x.bond));SA.state();SA.viewed('pen');SA.viewed('nowhere');NQ.pets.tick();C.bond('pA1');
 t('state(), viewed(), tick() and bond() never change friendship',JSON.stringify(NQ.profiles.current().pets.map(x=>x.bond))===s0);
 t('viewed() of an unknown area returns []',JSON.stringify(SA.viewed('nowhere'))==='[]')}

console.log(`${ok} passed, ${bad} failed`);process.exit(bad?1:0);
