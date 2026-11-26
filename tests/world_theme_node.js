// WP-T1: pure registry tests. No real profile, DOM, or storage needed.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const T=require('../assets/nq-world-theme.js');
let n=0;function eq(a,b){assert.deepEqual(a,b);n++}
function pair(r){return [r.worldId,r.themeId,r.fallbackReason]}
eq(pair(T.resolveTheme('NQ-00')),['NQ-00','NQ-00',null]);
eq(pair(T.resolveTheme('NQ-01')),['NQ-01','NQ-00','missing-theme']);
eq(pair(T.resolveTheme('NQ-08')),['NQ-08','NQ-00','missing-theme']);
for(const bad of [undefined,null,'unknown','__proto__','NQ-09',{},1])eq(pair(T.resolveTheme(bad)),['NQ-00','NQ-00','invalid-world']);
eq(pair(T.resolveForEngine({})),['NQ-00','NQ-00','invalid-world']);
eq(pair(T.resolveForEngine({learn:{themeWorld(){throw Error('test')}}})),['NQ-00','NQ-00','invalid-world']);
const engine={learn:{themeWorld:()=> 'NQ-01'}};eq(pair(T.resolveForEngine(engine)),['NQ-01','NQ-00','missing-theme']);
const fake={...T.HARBOR,id:'NQ-01',status:'ready',village:{...T.HARBOR.village,buildings:{academy:{}}},header:{test:true},scenes:Object.fromEntries(T.SURFACES.map(x=>[x,{kind:'surface',approved:true}]))};
eq(T.validateManifest(fake),[]);
eq(pair(T.resolveTheme('NQ-01',{'NQ-01':fake})),['NQ-01','NQ-01',null]);
eq(pair(T.resolveTheme('NQ-01',{'NQ-01':{...fake,status:'draft'}})),['NQ-01','NQ-00','incomplete-theme']);
eq(pair(T.resolveTheme('NQ-01',{'NQ-01':{...fake,scenes:{}}})),['NQ-01','NQ-00','incomplete-theme']);
eq(pair(T.resolveTheme('NQ-01',{'NQ-01':{...fake,id:'NQ-02'}})),['NQ-01','NQ-00','incomplete-theme']);
eq(pair(T.resolveTheme('NQ-00',{'NQ-00':{...fake,id:'NQ-00'}})),['NQ-00','NQ-00',null]);
eq(T.HARBOR.status,'draft');eq(T.validateManifest(T.HARBOR).includes('scene:lesson'),true);
eq(Object.isFrozen(T.HARBOR.village.panorama.sky),true);
const base='https://example.test/NoteQuest/previews/pr-155/index.html';
eq(T.assetURL('assets/nq-sanctuary-pen.webp',base),'https://example.test/NoteQuest/previews/pr-155/assets/nq-sanctuary-pen.webp');
for(const bad of ['https://evil.test/assets/a.webp','//evil.test/a.webp','/assets/a.webp','assets/../a.webp','assets/%2e%2e/a.webp','assets/a.webp?x=1','assets/a.webp#x','assets/a.exe','assets\\a.webp'])eq(T.assetURL(bad,base),null);
eq(T.assetURL('assets/a.webp','file:///tmp/index.html'),null);
// Validate every published path, including future building, header, ambience and fallback entries.
function allPaths(value,out=[]){
  if(typeof value==='string'&&value.startsWith('assets/'))out.push(value);
  else if(value&&typeof value==='object')for(const item of Object.values(value))allPaths(item,out);
  return out;
}
const paths=allPaths(T.REGISTRY);eq(paths.length>0,true);
for(const p of new Set(paths)){eq(T.safePath(p),true);eq(fs.existsSync(path.join(__dirname,'..',p)),true)}
// Use the shipped curriculum rather than a duplicated test-only list.
const index=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const block=index.split('/*NQ-CURRICULUM-BEGIN*/')[1].split('/*NQ-CURRICULUM-END*/')[0];
const curriculum=JSON.parse(block.trim().replace(/^const CURRICULUM=/,'').replace(/;$/,''));
eq(T.WORLDS,curriculum.levels.map(x=>x.id));
console.log('WP-T1 registry:',n,'checks passed');
