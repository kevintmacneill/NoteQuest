// Synthetic manifest only: no art assets or UI activation.
const assert=require('node:assert/strict');
const A=require('../assets/nq-avatar-art-factory.js');
const c={v:1,body:['boy','girl'],skin:['skin-1','skin-2'],outfit:['of-blue','of-red'],hair:{boy:['boy-short','boy-curly'],girl:['girl-bob','girl-braids']},hairColor:['hc-black','hc-brown'],accessory:['acc-none','acc-hat','acc-backpack']};
const paths=ids=>Object.fromEntries(ids.map(id=>[id,'assets/test/'+id+'.webp']));
const planes=ids=>Object.fromEntries(ids.map(id=>[id,{back:'assets/test/'+id+'-back.webp',front:'assets/test/'+id+'-front.webp'}]));
const fixture=()=>({status:'approved',catalogVersion:1,width:512,height:512,silhouette:'assets/test/silhouette.webp',portrait:{x:128,y:0,width:256,height:256},swatches:{...Object.fromEntries(A.PARTS.filter(k=>k!=='hair').map(k=>[k,paths(c[k])])),hair:Object.fromEntries(c.body.map(b=>[b,paths(c.hair[b])]))},poses:Object.fromEntries(A.POSES.map(p=>[p,{bodies:Object.fromEntries(c.body.map(b=>[b,{skin:paths(c.skin),outfit:paths(c.outfit),hair:Object.fromEntries(c.hair[b].map(h=>[h,planes(c.hairColor)])),accessory:planes(c.accessory.filter(a=>a!=='acc-none'))}]))}]))});
// Canonical look shape since engine 1.9.0: `accessories` plus the legacy single `accessory`.
const W=l=>{const ids=Array.isArray(l.accessories)?l.accessories:(l.accessory&&l.accessory!=='acc-none'?[l.accessory]:[]);return {...l,accessory:ids[0]||'acc-none',accessories:ids}};
const m=fixture(),look={v:1,body:'boy',skin:'skin-1',outfit:'of-blue',hair:'boy-short',hairColor:'hc-black',accessory:'acc-hat'};
let n=0;const eq=(a,b)=>{assert.deepEqual(a,b);n++};
async function main(){
 eq(A.validate(m,c),[]);
 eq(A.validate({...m,status:'draft'},c),['unapproved manifest']);
 eq(A.layers(m,c,look,'front'),['assets/test/hc-black-back.webp','assets/test/acc-hat-back.webp','assets/test/skin-1.webp','assets/test/of-blue.webp','assets/test/hc-black-front.webp','assets/test/acc-hat-front.webp']);
 eq(A.layers(m,c,{...look,accessory:'acc-none'},'walk').length,4);
 eq(A.swatchPath(m,c,look,'hair'),'assets/test/boy-short.webp');
 eq(A.swatchPath(m,c,look,'accessory'),'assets/test/acc-hat.webp');
 const single=fixture();single.poses.front.bodies.boy.hair['boy-short']['hc-black'].back=null;
 eq(A.layers(single,c,look,'front').length,5);
 const empty=fixture();empty.poses.front.bodies.boy.hair['boy-short']['hc-black']={front:null,back:null};
 eq(A.validate(empty,c),['front/boy/boy-short/hc-black']);
 const noSwatch=fixture();delete noSwatch.swatches.accessory['acc-none'];eq(A.validate(noSwatch,c),['swatch/accessory/acc-none']);
 eq(A.layers(m,c,{...look,hair:'girl-bob'},'front'),null);
 eq(A.layers(m,c,look,'unknown'),null);
 const bad=fixture();delete bad.poses.wave.bodies.girl.hair['girl-braids']['hc-brown'];
 eq(A.validate(bad,c),['wave/girl/girl-braids/hc-brown']);
 eq(A.create({manifest:bad,catalog:c,document:{}}).ready(c),false);
 eq(A.create({manifest:m,catalog:c,document:{}}).ready(c),true);
 eq(A.create({manifest:m,catalog:c,document:{}}).ready({...c}),false);
 const crop=fixture();crop.portrait.x=500;eq(A.validate(crop,c),['portrait crop']);
 for(const p of ['../evil.webp','/assets/a.webp','https://other.test/a.webp','assets/a.png','assets/%2e%2e/a.webp','assets/a.webp?x=1'])eq(A.safePath(p),false);
 eq(A.assetURL('assets/test/a.webp','https://example.test/NoteQuest/previews/pr-1/index.html'),'https://example.test/NoteQuest/previews/pr-1/assets/test/a.webp');
 eq(A.assetURL('assets/test/a.webp','file:///tmp/index.html'),null);
 eq(A.key(look,'front')===A.key({...look},'front'),true);
 eq(A.key(look,'front')===A.key(look,'walk'),false);
 const memo=A.cache(2);let builds=0;
 const build=()=>++builds;
 const p1=memo.get('a',build),p2=memo.get('a',build);eq(p1===p2,true);eq(await p1,1);
 eq(await memo.get('b',build),2);eq(await memo.get('a',build),1);eq(await memo.get('c',build),3);
 eq(memo.size(),2);eq(await memo.get('b',build),4);
 await assert.rejects(memo.get('bad',()=>Promise.reject(Error('decode'))));n++;
 eq(await memo.get('bad',build),5);memo.clear();eq(memo.size(),0);
 // Mock the browser canvas and decoder while using real Blob/object URL support in Node.
 const decoded=[],draws=[],urlCreates=[],urlRevokes=[];
 const originalCreate=URL.createObjectURL,originalRevoke=URL.revokeObjectURL;
 URL.createObjectURL=blob=>{const u=originalCreate.call(URL,blob);urlCreates.push(u);return u};
 URL.revokeObjectURL=u=>{urlRevokes.push(u);originalRevoke.call(URL,u)};
 const document={baseURI:'https://example.test/NoteQuest/index.html',createElement(tag){
   assert.equal(tag,'canvas');
   return {getContext:()=>({drawImage:(...a)=>draws.push(a)}),toBlob:cb=>cb(new Blob(['test'],{type:'image/webp'})),setAttribute(){}};
 }};
 const target=()=>({isConnected:true,children:[],replaceChildren(...children){this.children=children}});
 let resume;
 const delayed=new Promise(resolve=>{resume=resolve});
 const art=A.create({manifest:m,catalog:c,document,loadImage:async url=>{
   decoded.push(url);
   if(url.endsWith('/hc-brown-back.webp'))await delayed;
   if(url.endsWith('/of-red.webp'))throw Error('missing outfit');
   return {naturalWidth:512,naturalHeight:512,setAttribute(){}};
 }});
 try{
   const first=target(),second=target();
   await art.draw(first,look,'front');
   eq(draws.length,7);eq(first.children[0].width,512);
   await art.draw(second,look,'portrait');
   eq(draws.length,8);eq(second.children[0].width,256);
   eq(decoded.filter(u=>u.startsWith('https:')).length,6);
   const swatch=target(),beforeDraws=draws.length;
   await art.swatch(swatch,look,'hair');eq(draws.length,beforeDraws);eq(decoded.at(-1),'https://example.test/NoteQuest/assets/test/boy-short.webp');eq(swatch.children.length,1);
   const failed=target();await assert.rejects(art.draw(failed,{...look,outfit:'of-red'},'front'));n++;
   eq(decoded.at(-1),'https://example.test/NoteQuest/assets/test/silhouette.webp');eq(failed.children.length,1);
   const slow=art.draw(first,{...look,hairColor:'hc-brown'},'front');
   const fast=art.draw(first,look,'portrait');await fast;resume();await slow;
   eq(first.children[0].width,256);
   const detached=target();detached.isConnected=false;await art.draw(detached,look,'front');
   eq(detached.children.length,0);
   eq(urlCreates,urlRevokes);
 }finally{URL.createObjectURL=originalCreate;URL.revokeObjectURL=originalRevoke}
 // Partial approved manifest: only what is painted is listed; everything else is "coming soon".
 const pm=()=>{
   const one=(body,skin,outfit,hair,color)=>({skin:{[skin]:'assets/test/'+body+'-'+skin+'.webp'},outfit:{[outfit]:'assets/test/'+body+'-'+outfit+'.webp'},hair:{[hair]:{[color]:{back:null,front:'assets/test/'+body+'-'+hair+'.webp'}}}});
   return {status:'approved',scope:'partial',approvedBy:'TEST',catalogVersion:1,width:512,height:512,portrait:{x:128,y:0,width:256,height:256},
     swatches:{accessory:{'acc-hat':'assets/test/acc-hat.webp'}},
     poses:Object.fromEntries(A.POSES.map(p=>[p,{bodies:{boy:{...one('boy','skin-2','of-blue','boy-short','hc-brown'),accessory:{'acc-hat':{back:null,front:'assets/test/hat.webp'}}},girl:one('girl','skin-2','of-blue','girl-bob','hc-brown')}}]))};
 };
 const P=pm(),def={v:1,body:'boy',skin:'skin-2',outfit:'of-blue',hair:'boy-short',hairColor:'hc-brown',accessory:'acc-none'};
 eq(A.validate(P,c),[]);
 eq(A.validate({...P,scope:'everything'},c),['unknown manifest scope']);
 eq(A.validate({...P,status:'draft'},c),['unapproved manifest']);
 const extra=pm();extra.poses.front.bodies.boy.skin['skin-9']='assets/test/x.webp';eq(A.validate(extra,c),['front/boy/skin/skin-9']);
 const hole=pm();delete hole.poses.front.bodies.girl.outfit;eq(A.validate(hole,c),['girl: no complete painted look']);
 const frontFirst=pm();frontFirst.poses.front.bodies.boy.skin['skin-1']='assets/test/boy-skin-1.webp';delete frontFirst.poses.walk.bodies.girl.outfit;
 eq(A.validate(frontFirst,c),[]);                                   // front pose first: wave/walk may lag
 eq(A.choose(frontFirst,c,def,'skin','skin-1'),W({...def,skin:'skin-1'}));
 eq(A.layers(frontFirst,c,{...def,skin:'skin-1'},'wave'),null);
 const nulls=pm();nulls.poses.front.bodies.boy.hair['boy-short']['hc-brown']={back:null,front:null};eq(A.validate(nulls,c).includes('front/boy/boy-short/hc-brown'),true);
 const sil=pm();sil.silhouette='../x.webp';eq(A.validate(sil,c),['silhouette']);
 eq(A.renderable(P,c,def),true);
 eq(A.renderable(P,c,{...def,skin:'skin-1'}),false);
 eq(A.choose(P,c,def,'skin','skin-1'),null);                       // coming soon
 eq(A.choose(P,c,def,'accessory','acc-hat'),W({...def,accessory:'acc-hat'}));
 eq(A.choose(P,c,def,'accessory','acc-backpack'),null);
 eq(A.choose(P,c,{...def,accessory:'acc-hat'},'body','girl'),W({...def,body:'girl',hair:'girl-bob',accessory:'acc-none'}));
 eq(A.choose(P,c,def,'hair','boy-curly'),null);
 eq(A.choose(P,c,def,'hairColor','hc-black'),null);
 eq(A.fit(P,c,{...def,body:'girl',hair:'girl-braids',skin:'skin-1',hairColor:'hc-black',outfit:'of-red'},null),W({...def,body:'girl',hair:'girl-bob'}));
 eq(A.choose(m,c,look,'skin','skin-2'),W({...look,skin:'skin-2'})); // a complete manifest: every choice works
 // Engine 1.9.0: more than one accessory, one per spot; tapping toggles.
 const ALL=['acc-none','acc-goggles','acc-backpack','acc-hat','acc-glasses','acc-headphones','acc-scarf','acc-music-pin'];
 const cs={...c,accessory:ALL,accessorySlot:{'acc-goggles':'face','acc-glasses':'face','acc-hat':'head','acc-headphones':'head','acc-backpack':'back','acc-scarf':'neck','acc-music-pin':'chest'}};
 const msx=fixture();
 for(const p of A.POSES)for(const b of c.body)Object.assign(msx.poses[p].bodies[b].accessory,planes(ALL.filter(a=>!c.accessory.includes(a))));
 const L0=W({...look,accessory:'acc-none'});
 const g=A.choose(msx,cs,L0,'accessory','acc-glasses');eq(g.accessories,['acc-glasses']);
 const gb=A.choose(msx,cs,g,'accessory','acc-backpack');eq([gb.accessory,gb.accessories],['acc-backpack',['acc-backpack','acc-glasses']]);
 eq(A.choose(msx,cs,gb,'accessory','acc-goggles').accessories,['acc-goggles','acc-backpack']);     // same spot: swapped
 eq(A.choose(msx,cs,gb,'accessory','acc-glasses').accessories,['acc-backpack']);                   // tap again: off
 eq(A.choose(msx,cs,gb,'accessory','acc-none').accessories,[]);                                     // None clears all
 const five=['acc-backpack','acc-hat','acc-glasses','acc-scarf','acc-music-pin'].reduce((l,id)=>A.choose(msx,cs,l,'accessory',id),L0);
 eq(five.accessories,['acc-backpack','acc-hat','acc-glasses','acc-scarf','acc-music-pin']);
 // Drawn back to front: backpack back, (hair back), skin, outfit, hair front, then pin, scarf, glasses, hat on top.
 const acc=id=>msx.poses.front.bodies[look.body].accessory[id];
 const order=A.layers(msx,cs,five,'front');
 const at=p=>order.indexOf(p);
 eq(Boolean(at(acc('acc-backpack').back)>=0&&at(acc('acc-backpack').back)<at(m.poses.front.bodies[look.body].skin[look.skin])),true);
 const fronts=['acc-backpack','acc-music-pin','acc-scarf','acc-glasses','acc-hat'].map(id=>acc(id).front).filter(Boolean).map(at);
 eq(fronts,[...fronts].sort((a,b)=>a-b));
 eq(Boolean(fronts[0]>at(m.poses.front.bodies[look.body].outfit[look.outfit])),true);
 eq(A.validLook(cs,{...look,accessories:['acc-hat','acc-headphones']}),false);
 eq(A.validLook(cs,{...look,accessories:['acc-future']}),false);
 eq(A.validLook(cs,{...look,accessories:['acc-none']}),false);
 eq(A.validLook(cs,{...look,accessory:undefined,accessories:[]}),true);
 eq(Boolean(A.key(five,'front')!==A.key(gb,'front')),true);
 // Partial art: an unpainted accessory is coming soon, and taking a worn one off always works.
 eq(A.choose(P,cs,W({...def,accessory:'acc-hat'}),'accessory','acc-glasses'),null);
 eq(A.choose(P,cs,W({...def,accessory:'acc-hat'}),'accessory','acc-hat').accessories,[]);
 const pdocs=[];
 const partialArt=A.create({manifest:P,catalog:c,document:{baseURI:'https://example.test/NoteQuest/index.html',createElement(){return {getContext:()=>({drawImage(){}}),toBlob:cb=>cb(new Blob(['t'],{type:'image/webp'})),setAttribute(){}}}},loadImage:async url=>{pdocs.push(url);return {naturalWidth:512,naturalHeight:512,setAttribute(){}}}});
 eq(partialArt.ready(c),true);eq(partialArt.partial,true);eq(A.create({manifest:m,catalog:c,document:{}}).partial,false);
 eq(partialArt.choose(def,'outfit','of-red'),null);
 const ps=target();await partialArt.swatch(ps,def,'skin');eq(ps.children[0].width,256);     // painted head crop, no swatch file
 const po=target();await partialArt.swatch(po,def,'outfit');eq(po.children[0].width,512);
 const pa=target();await partialArt.swatch(pa,{...def,accessory:'acc-hat'},'accessory');eq(pdocs.at(-1),'https://example.test/NoteQuest/assets/test/acc-hat.webp');
 await assert.rejects(partialArt.swatch(target(),{...def,skin:'skin-1'},'skin'));n++;
 const ff=A.create({manifest:frontFirst,catalog:c,document:{baseURI:'https://example.test/NoteQuest/index.html',createElement(){return {getContext:()=>({drawImage(){}}),toBlob:cb=>cb(new Blob(['t'],{type:'image/webp'})),setAttribute(){}}}},loadImage:async url=>{pdocs.push(url);return {naturalWidth:512,naturalHeight:512,setAttribute(){}}}});
 const wave=target();pdocs.length=0;await ff.draw(wave,{...def,skin:'skin-1'},'wave');               // falls back to front
 eq(wave.children[0].width,512);eq(pdocs.includes('https://example.test/NoteQuest/assets/test/boy-skin-1.webp'),true);
 const empty2=target();empty2.children=['old'];await assert.rejects(partialArt.draw(empty2,{...def,skin:'skin-1'},'front'));n++;
 eq(empty2.children.length,0);                                       // no silhouette art: slot left empty
 const blankSlot=target();blankSlot.children=['old'];await partialArt.silhouette(blankSlot);eq(blankSlot.children.length,0);
 // Outfit-matched goggles: lenses follow the outfit; each variant is its own painting.
 const gm=fixture();
 for(const p of A.POSES)for(const b of c.body)gm.poses[p].bodies[b].accessory['acc-hat']={byOutfit:{'of-blue':{back:null,front:'assets/test/hat-blue.webp'},'of-red':{back:null,front:'assets/test/hat-red.webp'}}};
 eq(A.validate(gm,c),[]);
 const blueHat=A.layers(gm,c,{...look,outfit:'of-blue'},'front'),redHat=A.layers(gm,c,{...look,outfit:'of-red'},'front');
 eq([blueHat.includes('assets/test/hat-blue.webp'),redHat.includes('assets/test/hat-red.webp'),redHat.includes('assets/test/hat-blue.webp')],[true,true,false]);
 const short=fixture();
 for(const p of A.POSES)for(const b of c.body)short.poses[p].bodies[b].accessory['acc-hat']={byOutfit:{'of-blue':{back:null,front:'assets/test/hat-blue.webp'}}};
 eq(A.validate(short,c).includes('front/boy/acc-hat'),true);              // a complete manifest needs every outfit
 const badHat=fixture();badHat.poses.front.bodies.boy.accessory['acc-hat']={byOutfit:{'of-gold':{back:null,front:'assets/test/x.webp'}}};
 eq(A.validate(badHat,c).includes('front/boy/acc-hat'),true);
 const ps2=pm();for(const p of A.POSES){ps2.poses[p].bodies.boy.accessory={'acc-hat':{byOutfit:{'of-blue':{back:null,front:'assets/test/hat-blue.webp'}}}};ps2.poses[p].bodies.boy.outfit['of-red']='assets/test/boy-of-red.webp'}
 eq(A.validate(ps2,c),[]);                                                 // partial: any painted subset
 const withHat=A.choose(ps2,c,W(def),'accessory','acc-hat');eq(withHat.accessories,['acc-hat']);
 eq(A.choose(ps2,c,W({...def,outfit:'of-red'}),'accessory','acc-hat'),null);          // no red lens yet: coming soon
 eq(A.choose(ps2,c,withHat,'outfit','of-red').accessories,[]);                        // switching outfit drops the unmatched one
 console.log(n+' avatar art foundation checks passed');
}
main().catch(e=>{console.error(e);process.exitCode=1});
