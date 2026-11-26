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
const paths=[...Object.values(T.HARBOR.village.panorama).map(x=>x.path),T.HARBOR.village.fallback.path,...Object.values(T.HARBOR.scenes).filter(x=>x.kind==='image').map(x=>x.path)];
for(const p of paths){eq(T.safePath(p),true);eq(fs.existsSync(path.join(__dirname,'..',p)),true)}
console.log('WP-T1 registry:',n,'checks passed');
