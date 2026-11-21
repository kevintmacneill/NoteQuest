// Run the engine with NO document: proves it never draws.
const fs=require('fs');const vm=require('vm');
const store={};global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}};
global.window=global;global.navigator={};global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
vm.runInThisContext(fs.readFileSync(process.argv[2],'utf8'));
const NQ=window.NQ;let ok=0,bad=0;const t=(name,c)=>{if(c)ok++;else{bad++;console.log('FAIL',name)}};
let coinEvents=[];NQ.on('coins',e=>coinEvents.push(e));
NQ.start();
t('no profiles',NQ.profiles.list().length===0);
const p=NQ.profiles.create('Micaela','🦄');t('create+select',NQ.profiles.current()===p);
t('L1 unlocked',NQ.progress.isUnlocked(0)&&!NQ.progress.isUnlocked(1));
const items=NQ.items.forLevel(NQ.content.LEVELS[0]);t('items',items.length===5&&items[0].staff==='bass');
const it=NQ.items.pickWeighted(items,null);t('pick',!!it);
t('check letter',NQ.check.letter({note:'E4'},'E')&&!NQ.check.letter({note:'E4'},'F'));
t('check key',NQ.check.key({note:'C4'},60));
t('mic octave-free',NQ.check.mic({note:'C4'},72));NQ.profiles.setOption(p.id,'exactOctave',true);t('mic exact',!NQ.check.mic({note:'C4'},72));
NQ.coins.roundStart();for(let i=0;i<9;i++)NQ.progress.record('C3b',true);
t('coins from notes',NQ.coins.balance()===9&&coinEvents.length===9&&coinEvents[0].reward);
const fr=NQ.progress.finishRound({key:'L1:name',stars:NQ.scoring.drill(9),act:'name',level:'L1',correct:9,total:10,startedAt:Date.now()-30000});
t('3 stars',p.stars['L1:name']===3);t('bonus coins',NQ.coins.balance()===19&&fr.coins===19);t('sticker',!!fr.sticker);
t('hint fades',NQ.progress.hintOpacity('C3b')===0);
// unlock
p.stars['L1:find']=3;t('L2 unlocks at 6',NQ.progress.isUnlocked(1));
// pets
const bonus=NQ.pets.starterBonus();t('starter bonus',bonus===20+5*6);
NQ.pets.setNight('00:00','00:00');const pet=NQ.pets.chooseStarter('puppy','Biscuit');t('starter',pet&&p.pets.length===1&&p.habs[0]==='home'&&p.inv.kibble===3&&p.coins===19+bonus);
t('no second starter',NQ.pets.chooseStarter('kitten','x')===null);
// v1.3: starter arrives as an egg; 3 counted rounds hatch it
t('starter is egg',NQ.pets.display(pet).stage==='egg'&&NQ.pets.feed(pet,'kibble').reason==='egg');
const hatchRound=()=>{const id=NQ.progress.startRound('t');NQ.progress.finishRound({key:'t',stars:0,act:'t',level:'t',correct:0,total:1,startedAt:Date.now(),roundId:id})};
let hatched=null;NQ.on('pet:hatched',e=>hatched=e.pet);hatchRound();hatchRound();t('not yet',NQ.pets.display(pet).hatchRoundsLeft===1);hatchRound();
t('hatched after 3 rounds',hatched===pet&&NQ.pets.display(pet).stage==='baby');
const fed=NQ.pets.feed(pet,'kibble');t('feed fav',fed.ok&&fed.fav&&p.inv.kibble===2);
t('feed wrong diet',!NQ.pets.feed(pet,'pepper').ok);
t('play needs toy',NQ.pets.play(pet).reason==='tool');
t('clean has tool',NQ.pets.clean(pet).ok&&p.supplies.soap===4);
const c0=p.coins;t('buy toy',NQ.shop.buy('tool','toy').ok&&p.coins===c0-25&&NQ.pets.play(pet).ok);
t('buy toy twice',NQ.shop.buy('tool','toy').reason==='owned');
t('cant afford',NQ.shop.buy('hab','magic').reason==='coins');
t('adopt needs hab',NQ.pets.canAdopt('fish').reason==='no-habitat');
NQ.profiles.giveCoins(p.id,500);t('adopt',NQ.pets.adopt('kitten','Mittens').ok&&p.pets.length===2);
t('moods array',Array.isArray(NQ.pets.moods(pet)));
// mess
p.messT.home=Date.now()-6*3600e3;t('mess grows',NQ.pets.genMess('home')&&NQ.pets.messes('home').length>0);
const m0=NQ.pets.messes('home')[0];t('clean mess',NQ.pets.cleanMess('home',m0.id));
// decor
NQ.shop.buy('decor','🪨');const d=NQ.decor.place('🪨','shop','home');t('decor place',d&&p.decorInv['🪨']===0);
t('decor remove refunds',NQ.decor.remove(d.id)&&p.decorInv['🪨']===1);
t('sticker decor',!!NQ.decor.place(p.stickers[0],'sticker','home')&&!NQ.decor.place(p.stickers[0],'sticker','home'));
// caterpillar
NQ.profiles.giveCoins(p.id,1000);NQ.shop.buy('hab','terra');const cat=NQ.pets.adopt('caterpillar','Cat').pet;hatchRound();hatchRound();hatchRound();for(let i=0;i<8;i++){NQ.shop.buy('food','leaves');var r=NQ.pets.feed(cat,'leaves')}t('butterfly',r.evolved&&cat.sp==='butterfly');
// growth
pet.gT=Date.now()-6*86400e3;let grew=null;NQ.on('pet:grew',e=>grew=e);t('grows to kid',NQ.pets.growUpdate(pet)==='kid'&&grew&&grew.stage==='kid');
// wild
t('missing',NQ.wild.missing('sloth').length===2);
const ch=NQ.wild.awardChest('sloth',2);t('chest',ch.got==='bandage'&&!ch.ready);
NQ.wild.awardChest('sloth',2);t('ready',NQ.wild.missing('sloth').length===0);
// --- issue #2: rescues are engine-validated ---
t('invite before rescue refused',NQ.wild.invite('toucan','x').reason==='not-rescued');
t('rescue refused when missing',NQ.wild.rescue('toucan').reason==='missing');
const coinsBefore=p.coins;t('no reward on refusal',p.coins===coinsBefore&&!p.wild.journal.toucan);
t('give not-held refused',NQ.wild.giveSupply('toucan','snips').reason==='not-held');
t('give not-needed refused',NQ.wild.giveSupply('sloth','rope').reason==='not-needed');
t('give unknown animal refused',NQ.wild.giveSupply('dragon','bandage').reason==='unknown');
let g1=NQ.wild.giveSupply('sloth','bandage');t('give step',g1.ok&&!g1.done&&g1.left.join()==='leaves'&&p.wild.sup.bandage===0);
t('given persists',NQ.wild.remaining('sloth').join()==='leaves'&&NQ.wild.missing('sloth').length===0&&NQ.wild.needStatus('sloth')[0].given);
t('cant give twice',NQ.wild.giveSupply('sloth','bandage').reason==='not-needed');
const b0=p.coins;let g2=NQ.wild.giveSupply('sloth','leaves');
t('rescue completes in engine',g2.ok&&g2.done&&!!g2.fact&&p.coins===b0+5&&p.wild.journal.sloth.n===1&&NQ.wild.mission('sloth').need[0]==='blanket'&&!p.wild.given.sloth);
t('can invite after rescue',NQ.wild.canInvite('sloth'));
t('invite',NQ.wild.invite('sloth','Slowpoke').ok&&p.habs.includes('sanct'));
t('no second invite',NQ.wild.invite('sloth','Again').reason==='not-rescued'&&p.pets.filter(x=>x.sp==='sloth').length===1);
t('release needs rescue',NQ.wild.release('sloth').reason==='not-rescued');
// one-shot rescue when everything is held
p.wild.sup.snips=1;p.wild.sup.berries=1;const c1=p.coins;const r1=NQ.wild.rescue('toucan');
t('one-shot rescue',r1.ok&&p.wild.sup.snips===0&&p.wild.sup.berries===0&&p.coins===c1+5);
t('release uses invite',NQ.wild.release('toucan').ok&&!NQ.wild.canInvite('toucan'));
t('version',/^1\./.test(NQ.version));
// rhythm
const pat=NQ.rhythm.newPattern();t('pattern',pat.flat.reduce((a,b)=>a+b,0)===pat.totalBeats);
const spb=60/66;const on=pat.onsets.map(b=>b*spb),du=pat.flat.map(b=>b*spb);
const presses=on.map((o,i)=>[10+o+.05,10+o+du[i]*.9]);const j=NQ.rhythm.judge({start:10,onsets:on,durs:du,presses});t('judge perfect',j.perfect===on.length);
const j2=NQ.rhythm.judge({start:10,onsets:on,durs:du,presses:on.map((o,i)=>[10+o,10+o+.05])});t('judge short',j2.close+j2.perfect===on.length);
t('judge miss',NQ.rhythm.judge({start:10,onsets:on,durs:du,presses:[]}).miss===on.length);
// scoring
t('meteor score',NQ.scoring.meteor({shields:3,cleared:15,firstRight:15,total:15})===3&&NQ.scoring.meteor({shields:0,cleared:9,firstRight:5,total:12})===1);
t('meteor curve',NQ.meteor.fallTime(0,false)===10&&NQ.meteor.maxActive(25,true)===3);
const its=NQ.items.forLevel(NQ.content.LEVELS[0]).slice();const add=NQ.meteor.addNextLevel(0,its);t('endless adds',add.levelIndex===1&&add.added===5&&its.length===10);
// songs
const song=NQ.songs.get('hcb');t('measures',NQ.songs.measures(song).length===4);
// save code roundtrip
const code=NQ.saveCode.export();const o=NQ.saveCode.parse(code);t('code parse',o&&o.profiles[0].name==='Micaela');t('bad code',NQ.saveCode.parse('nope')===null);
t('apply',NQ.saveCode.apply(o)&&NQ.profiles.current()===null&&NQ.profiles.list().length===1);
// persistence
t('saved to localStorage',JSON.parse(store['noteQuest.v1']).profiles[0].pets.length===4);
console.log(`${ok} passed, ${bad} failed`);process.exit(bad?1:0);
