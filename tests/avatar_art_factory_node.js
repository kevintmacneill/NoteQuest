// Synthetic manifest only: no art assets or UI activation.
const assert=require('node:assert/strict');
const A=require('../assets/nq-avatar-art-factory.js');
const c={v:1,body:['boy','girl'],skin:['skin-1','skin-2'],outfit:['of-blue','of-red'],hair:{boy:['boy-short','boy-curly'],girl:['girl-bob','girl-braids']},hairColor:['hc-black','hc-brown'],accessory:['acc-none','acc-hat','acc-backpack']};
const paths=ids=>Object.fromEntries(ids.map(id=>[id,'assets/test/'+id+'.webp']));
const fixture=()=>({status:'approved',catalogVersion:1,width:512,height:512,silhouette:'assets/test/silhouette.webp',portrait:{x:128,y:0,width:256,height:256},poses:Object.fromEntries(A.POSES.map(p=>[p,{bodies:Object.fromEntries(c.body.map(b=>[b,{skin:paths(c.skin),outfit:paths(c.outfit),hair:Object.fromEntries(c.hair[b].map(h=>[h,paths(c.hairColor)])),accessory:paths(c.accessory.filter(a=>a!=='acc-none'))}]))}]))});
const m=fixture(),look={v:1,body:'boy',skin:'skin-1',outfit:'of-blue',hair:'boy-short',hairColor:'hc-black',accessory:'acc-hat'};
let n=0;const eq=(a,b)=>{assert.deepEqual(a,b);n++};
async function main(){
 eq(A.validate(m,c),[]);
 eq(A.validate({...m,status:'draft'},c),['unapproved manifest']);
 eq(A.layers(m,c,look,'front'),['assets/test/skin-1.webp','assets/test/of-blue.webp','assets/test/hc-black.webp','assets/test/acc-hat.webp']);
 eq(A.layers(m,c,{...look,accessory:'acc-none'},'walk').length,3);
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
   if(url.endsWith('/hc-brown.webp'))await delayed;
   return {naturalWidth:512,naturalHeight:512};
 }});
 try{
   const first=target(),second=target();
   await art.draw(first,look,'front');
   eq(draws.length,5);eq(first.children[0].width,512);
   await art.draw(second,look,'portrait');
   eq(draws.length,6);eq(second.children[0].width,256);
   eq(decoded.filter(u=>u.startsWith('https:')).length,4);
   const slow=art.draw(first,{...look,hairColor:'hc-brown'},'front');
   const fast=art.draw(first,look,'portrait');await fast;resume();await slow;
   eq(first.children[0].width,256);
   const detached=target();detached.isConnected=false;await art.draw(detached,look,'front');
   eq(detached.children.length,0);
   eq(urlCreates,urlRevokes);
 }finally{URL.createObjectURL=originalCreate;URL.revokeObjectURL=originalRevoke}
 console.log(n+' avatar art foundation checks passed');
}
main().catch(e=>{console.error(e);process.exitCode=1});
