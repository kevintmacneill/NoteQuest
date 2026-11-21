// Pet engine v1.3 tests (no page), with a fake clock.
const fs=require('fs');const vm=require('vm');
const store={};global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}};
global.window=global;global.navigator={};global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
let NOW=new Date(2026,10,21,15,0,0).getTime();const RealDate=Date;   // 3 pm local
global.Date=class extends RealDate{constructor(...a){super(...(a.length?a:[NOW]))}static now(){return NOW}};
const HR=3600e3,DAY=24*HR;
// an OLD v1 save, shaped exactly like the live version writes it
const now0=NOW;
const oldSave={v:1,updated:now0,settings:{sound:true},profiles:[
 {id:'pM',name:'Micaela',avatar:'🦄',stars:{'L1:name':3},stickers:['🐶'],notes:{},seconds:0,log:[],hints:'auto',unlockAll:false,exactOctave:false,coins:365,starterDone:true,
  pets:[{id:'aPup',sp:'puppy',name:'Biscuit',hab:'home',h:80,hT:now0,j:85,jT:now0,c:90,cT:now0,meals:2,petT:0,grow:6,gT:now0},{id:'aUni',sp:'unicorn',name:'Sparkle',hab:'magic',h:80,hT:now0,j:85,jT:now0,c:30,cT:now0,meals:0,petT:0,grow:1,gT:now0}],
  habs:['home','magic'],inv:{kibble:2},tools:['shampoo'],decor:[],decorInv:{},mess:{home:[{id:'m1',i:'💩',x:20,y:70},{id:'m2',i:'🧦',x:40,y:80}]},messT:{home:now0},curHab:'home',wild:{sup:{},mis:{},done:{},journal:{}}},
 {id:'pZ',name:'Zoe',avatar:'🐰',stars:{},stickers:[],notes:{},seconds:0,log:[],hints:'auto',unlockAll:false,exactOctave:false}]};
store['noteQuest.v1']=JSON.stringify(oldSave);
vm.runInThisContext(fs.readFileSync(process.argv[2],'utf8'));
const NQ=window.NQ;let ok=0,bad=0;const t=(n,c)=>{if(c)ok++;else{bad++;console.log('FAIL',n)}};
const round=()=>{const id=NQ.progress.startRound('t');return NQ.progress.finishRound({key:'t',stars:0,act:'t',level:'t',correct:0,total:1,startedAt:NOW,roundId:id})};
NQ.start();
// ---------- upgrade ----------
const S=NQ.state();t('save upgraded to v2',S.v===2);
const M=NQ.profiles.select('pM');
t('pets kept',M.pets.length===2&&M.coins===365&&M.stars['L1:name']===3&&M.stickers[0]==='🐶');
t('existing pets are not eggs',M.pets.every(x=>!x.egg)&&NQ.pets.display('aPup').stage==='adolescent');
t('free scooper + starter supplies',M.tools.includes('scooper')&&M.supplies.soap===5&&M.supplies.bags===10);
t('primary = first pet',NQ.pets.init().companions.primary==='aPup'&&NQ.companions.get().primary.name==='Biscuit');
t('old messes typed',M.mess.home[0].type==='poop'&&M.mess.home[1].type==='toy');
const again=JSON.parse(JSON.stringify(NQ.state()));NQ.saveCode.apply(NQ.saveCode.parse(NQ.saveCode.export()));
t('upgrade twice changes nothing',JSON.stringify(NQ.state().profiles)===JSON.stringify(again.profiles));
NQ.profiles.select('pM');
const oldCode='NQ1:'+Buffer.from(unescape(encodeURIComponent(JSON.stringify(oldSave))),'binary').toString('base64');
t('old NQ1 code imports + upgrades',NQ.saveCode.apply(NQ.saveCode.parse(oldCode))&&NQ.state().profiles[0].supplies.soap===5);
NQ.profiles.select('pM');const m=NQ.profiles.current();
// ---------- display ----------
const d=NQ.pets.display('aUni');t('display shape',d.stage==='baby'&&d.dirty===true&&d.asset==='animal-unicorn-baby-normal'&&typeof d.needs.h==='number');
t('display not-owned',NQ.pets.display('nope')===null);
// ---------- bath ----------
let r=NQ.pets.startBath('aUni');t('start bath uses no soap',r.ok&&m.supplies.soap===5&&NQ.pets.display('aUni').activity==='bath');
t('one bath at a time',NQ.pets.startBath('aPup').reason==='busy');
t('finish wrong id',NQ.pets.finishBath('aUni','zzz').reason==='no-bath'&&m.supplies.soap===5);
const bid=r.bathId;r=NQ.pets.finishBath('aUni',bid);t('finish uses 1 soap, cleans',r.ok&&r.soapLeft===4&&NQ.pets.display('aUni').dirty===false);
t('repeat finish refused',NQ.pets.finishBath('aUni',bid).reason==='no-bath'&&m.supplies.soap===4);
t('excited after bath',NQ.pets.display('aUni').condition==='excited');
r=NQ.pets.startBath('aUni');NQ.pets.cancelBath('aUni');t('cancel costs nothing',m.supplies.soap===4&&!NQ.pets.display('aUni').activity);
r=NQ.pets.startBath('aUni');NOW+=11*60e3;t('stale bath auto-cancels',NQ.pets.finishBath('aUni',r.bathId).reason==='no-bath'&&m.supplies.soap===4);
t('bath needs habitat tool',NQ.pets.canBathe('aUni').ok&&(()=>{m.tools=m.tools.filter(x=>x!=='shampoo');const c=NQ.pets.canBathe('aUni').reason;m.tools.push('shampoo');return c==='no-tool'})());
m.supplies.soap=0;t('no soap refused',NQ.pets.startBath('aUni').reason==='no-soap'&&NQ.pets.clean('aUni').reason==='no-soap');
t('buy soap pack',NQ.shop.buy('supply','soap').ok&&m.supplies.soap===3&&m.coins===362);
t('old clean() uses the checked path',NQ.pets.clean('aUni').ok&&m.supplies.soap===2);
// ---------- pen ----------
const b0=m.supplies.bags;r=NQ.pens.cleanMess('home','m1');t('scoop uses 1 bag',r.ok&&m.supplies.bags===b0-1&&r.left===1);
t('no such mess',NQ.pens.cleanMess('home','m1').reason==='no-mess'&&m.supplies.bags===b0-1);
t('habitat not owned',NQ.pens.cleanMess('pond','x').reason==='not-owned');
m.supplies.bags=0;t('no bags refused',NQ.pens.cleanMess('home','m2').reason==='no-bags'&&NQ.pets.cleanMess('home','m2').reason==='no-bags');
m.tools=m.tools.filter(x=>x!=='scooper');m.supplies.bags=1;t('scooper is always re-granted (free)',NQ.pens.canClean('home').ok&&m.tools.includes('scooper'));
t('bags pack',NQ.shop.buy('supply','bags').ok&&m.supplies.bags===11);
t('bath does not clean pen',NQ.pets.messes('home').length===1);
// pond never gets poop
NQ.profiles.giveCoins(m.id,5000);NQ.shop.buy('hab','pond');const fish=NQ.pets.adopt('fish','Finn').pet;round();round();round();
m.messT.pond=NOW-40*HR;NQ.pets.genMess('pond');t('pond messes are not poop',NQ.pets.messes('pond').length>0&&NQ.pets.messes('pond').every(x=>x.type!=='poop'));
// ---------- eggs ----------
const egg=NQ.pets.adopt('kitten','Mittens').pet;t('adopted pet is an egg',NQ.pets.display(egg.id).stage==='egg'&&NQ.pets.display(egg.id).hatchRoundsLeft===3);
const hB=egg.h;NOW+=3*DAY;t('egg needs frozen',NQ.pets.need(egg,'h')===hB);
t('eggs make no mess',(()=>{const before=NQ.pets.messes('home').length;m.messT.home=NOW-100*HR;m.pets.filter(x=>x.hab==='home'&&!x.egg).forEach(x=>x._skip=1);return true})());
const rid=NQ.progress.startRound('t');NQ.progress.finishRound({key:'t',stars:1,act:'t',level:'t',correct:1,total:1,startedAt:NOW,roundId:rid});
NQ.progress.finishRound({key:'t',stars:1,act:'t',level:'t',correct:1,total:1,startedAt:NOW,roundId:rid});
t('duplicate finish counts once',egg.egg.rounds===1);
NQ.progress.finishRound({key:'t',stars:1,act:'t',level:'t',correct:1,total:1,startedAt:NOW});t('round without id not counted',egg.egg.rounds===1);
let hatched=null;NQ.on('pet:hatched',e=>hatched=e.pet);round();round();t('hatches at 3',hatched===egg&&NQ.pets.display(egg.id).stage==='baby'&&NQ.pets.display(egg.id).condition==='excited');
// ---------- conditions ----------
NQ.pets.setNight('20:30','06:30');NOW=new Date(2026,10,25,22,0,0).getTime();
const pup=NQ.pets.byId('aPup');['h','j','c'].forEach(k=>{pup[k]=90;pup[k+'T']=NOW});
t('sleeping at night',NQ.pets.display('aPup').condition==='sleeping');
t('no bath while asleep',NQ.pets.canBathe('aPup').reason==='sleeping');
NQ.pets.wake('aPup');t('tap wakes for 30 min',NQ.pets.display('aPup').condition!=='sleeping');
NOW+=31*60e3;t('dozes off again',NQ.pets.display('aPup').condition==='sleeping');
NOW=new Date(2026,10,26,12,0,0).getTime();['h','j','c'].forEach(k=>{pup[k]=90;pup[k+'T']=NOW});pup.excitedUntil=0;pup.awakeUntil=0;
t('awake at noon',NQ.pets.display('aPup').condition==='normal');
NQ.profiles.giveCoins(m.id,50);m.tools.includes('toy')||NQ.shop.buy('tool','toy');NQ.pets.play('aPup');NQ.pets.play('aPup');r=NQ.pets.play('aPup');t('3 plays in an hour → nap',r.napping&&NQ.pets.display('aPup').condition==='sleeping');
NQ.pets.wake('aPup');t('wake ends nap',NQ.pets.display('aPup').condition!=='sleeping');
NOW+=2*HR;['h','j','c'].forEach(k=>{pup[k]=30;pup[k+'T']=NOW});t('tired when low',NQ.pets.display('aPup').condition==='tired');
['h','j','c'].forEach(k=>{pup[k]=20;pup[k+'T']=NOW});NOW+=1*DAY;t('not sick after 1 day',NQ.pets.display('aPup').condition!=='sick');
NOW+=3*DAY;let dd=NQ.pets.display('aPup');t('sick after long neglect',dd.condition==='sick'&&NQ.pets.byId('aPup').lowSince<NOW-2*DAY);
NQ.profiles.giveCoins(m.id,100);m.inv.kibble=5;NQ.pets.feed('aPup','kibble');NQ.pets.feed('aPup','kibble');NQ.pets.feed('aPup','kibble');
m.supplies.soap=5;r=NQ.pets.clean('aPup');m.tools.includes('toy')||NQ.shop.buy('tool','toy');pup.awakeUntil=NOW+DAY;NQ.pets.play('aPup');
t('care cures sickness',NQ.pets.display('aPup').condition!=='sick'&&!NQ.pets.byId('aPup').lowSince);
// ---------- companions ----------
t('set sidekick',NQ.companions.setSidekick(egg.id).ok&&NQ.companions.get().sidekick===egg);
t('primary := sidekick swaps',NQ.companions.setPrimary(egg.id).ok&&NQ.companions.get().primary===egg&&NQ.companions.get().sidekick.id==='aPup');
t('clear sidekick',NQ.companions.setSidekick(null).ok&&NQ.companions.get().sidekick===null);
t('companion not owned',NQ.companions.setPrimary('nope').reason==='not-owned');
// ---------- profile isolation ----------
const zoeView=NQ.profiles.select('pZ');NQ.pets.init();
t('cannot feed other profile pet',NQ.pets.feed(pup,'kibble').reason==='not-owned');
t('cannot bathe other profile pet',NQ.pets.startBath('aPup').reason==='not-owned');
t('cannot clean other profile pen',NQ.pens.cleanMess('home','m2').reason==='not-owned');
t('cannot pick other profile pet',NQ.companions.setPrimary('aPup').reason==='not-owned');
t('rename other profile pet refused',NQ.pets.rename(pup,'Hacked')===false&&pup.name==='Biscuit');
t('Zoe has own supplies',zoeView.supplies.soap===5&&zoeView.supplies.bags===10);
t('Zoe starter is egg + primary',(()=>{const z=NQ.pets.chooseStarter('isopod','Rolly');return z.egg&&NQ.companions.get().primary===z})());
// issue #9: night hours are validated
NQ.profiles.select('pM');const nh=JSON.stringify(NQ.pets.nightHours());
t('invalid night hours refused',NQ.pets.setNight('99:99','77:77')===false&&NQ.pets.setNight('24:00','06:30')===false&&NQ.pets.setNight('20:60','06:30')===false&&NQ.pets.setNight('8pm','6')===false&&JSON.stringify(NQ.pets.nightHours())===nh);
t('valid night hours saved',NQ.pets.setNight('21:15','07:00')&&NQ.pets.nightHours().nightStart==='21:15');NQ.pets.setNight('20:30','06:30');
// ---------- events ----------
NQ.profiles.select('pM');let changed=0;NQ.on('pet:changed',()=>changed++);NQ.pets.tick();NOW=new Date(2026,10,26,23,0,0).getTime();NQ.pets.byId('aPup').awakeUntil=0;NQ.pets.tick();
t('pet:changed fires on condition change',changed>0);
// ---------- persistence ----------
const saved=JSON.parse(store['noteQuest.v1']);t('saved v2 with new fields',saved.v===2&&saved.profiles[0].companions&&saved.profiles[1].supplies);
console.log(`${ok} passed, ${bad} failed`);process.exit(bad?1:0);
