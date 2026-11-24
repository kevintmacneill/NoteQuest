// The original Note Quest, frozen at classic/ (Kevin 2026-11-23). Proves the copy is byte-for-byte what tools/classic/freeze.sh
// recorded, has every asset it loads, keeps the original game's own save names, and its engine still starts.
const fs=require('fs');const path=require('path');const crypto=require('crypto');const vm=require('vm');
const DIR=path.join(__dirname,'..','classic');let ok=0,bad=0;const t=(n,c)=>{if(c)ok++;else{bad++;console.log('FAIL',n)}};
const rows=[...fs.readFileSync(path.join(DIR,'FROZEN.md'),'utf8').matchAll(/^\| ([^|]+?) \| ([0-9a-f]{64}) \|$/gm)].map(m=>[m[1],m[2]]);
const files=[];(function walk(d,rel){for(const f of fs.readdirSync(d)){const p=path.join(d,f),r=rel?rel+'/'+f:f;if(fs.statSync(p).isDirectory())walk(p,r);else if(r!=='FROZEN.md')files.push(r)}})(DIR,'');
t('FROZEN.md lists every file, and only those',rows.length>0&&JSON.stringify(rows.map(r=>r[0]).sort())===JSON.stringify(files.sort()));
for(const [f,h] of rows)t('unchanged: '+f,fs.existsSync(path.join(DIR,f))&&crypto.createHash('sha256').update(fs.readFileSync(path.join(DIR,f))).digest('hex')===h);
const html=fs.readFileSync(path.join(DIR,'index.html'),'utf8');
const refs=new Set();for(const f of ['index.html',...files.filter(f=>/\.(js|css)$/.test(f))])for(const m of fs.readFileSync(path.join(DIR,f),'utf8').matchAll(/assets\/[A-Za-z0-9_.\/-]+/g))refs.add(m[0].replace(/[.]$/,''));
const missing=[...refs].filter(r=>!fs.existsSync(path.join(DIR,r)));t('every asset it loads is in classic/assets ('+refs.size+')',missing.length===0)||0;if(missing.length)console.log('missing',missing);
t('keeps the original save names (device, last player, cloud, codes)',html.includes("const KEY='noteQuest.v1'")&&html.includes("LAST_PLAYER_KEY='noteQuest.lastPlayer.v1'")&&html.includes("'/notequest'")&&html.includes("'NQ1:'"));
t('never touches the new game\'s save names',!/game32|NQ32/.test(html));
const m=html.match(/<script id="nq-engine">\n([\s\S]*?)\n<\/script>/);t('engine block present',!!m);
if(m){const store={};const ctx={console,Math,JSON,Date,Object,Array,String,Number,Boolean,Set,Map,Promise,Error,setTimeout:()=>0,clearTimeout:()=>{},setInterval:()=>0,
    localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},navigator:{},btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary')};
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(m[1],ctx);const NQ=ctx.window.NQ;NQ.start();NQ.profiles.create('Micaela','🦄');
  t('the original engine starts and saves under noteQuest.v1',NQ.version==='1.7.0'&&Object.keys(store).join()==='noteQuest.v1'&&NQ.saveCode.export().startsWith('NQ1:'))}
console.log(ok+' passed, '+bad+' failed');if(bad)process.exit(1);
