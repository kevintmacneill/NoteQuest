// WP-0.1 / #126: independent fault-injection probe. Test-only; no engine edits.
// Usage: node tests/save_safety_independent_node.cjs (from repository root).
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const html = fs.readFileSync('index.html');
const blob = crypto.createHash('sha1').update('blob ' + html.length + '\0').update(html).digest('hex');
assert.equal(blob, '1d10623a94d4c4d7c9eba16908a47d09fe740602', 'review must execute the exact PR #125 index.html blob');
const src = html.toString('utf8').match(/<script id="nq-engine">\n([\s\S]*?)\n<\/script>/)[1];
const KEY = 'noteQuest.game32', OLD = 'noteQuest.v1';
let passed = 0, failed = 0;
function check(label, test) {
  return Promise.resolve().then(test).then(() => { passed++; console.log('PASS', label); },
    e => { failed++; console.error('FAIL', label, e.stack || e); });
}
function boot(initial = {}, faults = {}, cloud) {
  const data = new Map(Object.entries(initial));
  const events = [], writes = [];
  let failRead = !!faults.firstRead;
  const box = {
    console, navigator: {},
    btoa: s => Buffer.from(s, 'binary').toString('base64'),
    atob: s => Buffer.from(s, 'base64').toString('binary'),
    setTimeout: (fn, ms) => { const t = setTimeout(fn, ms); t.unref(); return t; },
    clearTimeout,
    localStorage: {
      getItem(k) {
        if (k === KEY && failRead) { failRead = false; throw Error('injected read failure'); }
        return data.has(k) ? data.get(k) : null;
      },
      setItem(k,v) {
        writes.push(k);
        if (k.startsWith(KEY + '.unreadable.') && faults.backup === 'throw') throw Error('quota');
        if (k.startsWith(KEY + '.unreadable.') && faults.backup === 'corrupt') { data.set(k, 'bad-copy'); return; }
        data.set(k, String(v));
      },
      removeItem(k) { data.delete(k); }
    }
  };
  box.window = box;
  if (cloud) box.claude = cloud;
  vm.createContext(box);
  vm.runInContext(src, box, {filename:'exact-pr125-engine.js'});
  const n = box.NQ;
  for (const event of ['save:blocked','save:backup','remote','savemode']) n.on(event, payload => events.push([event,payload]));
  n.start();
  return {n,data,events,writes};
}
function create(r) { r.n.profiles.create('Independent fixture', 'x'); r.n.coins.add(2); }
const backups = r => [...r.data.entries()].filter(([k]) => k.startsWith(KEY + '.unreadable.'));
const pause = ms => new Promise(resolve => setTimeout(resolve,ms));
(async () => {
  const valid = boot(); create(valid);
  const rawValid = valid.data.get(KEY);
  assert.ok(rawValid);
  for (const raw of ['{invalid', '']) {
    for (const backup of ['throw', 'corrupt']) await check('unreadable ' + JSON.stringify(raw) + ' / ' + backup, () => {
      const r=boot({[KEY]:raw,[OLD]:'untouched original game'}, {backup});
      create(r);
      assert.equal(r.data.get(KEY),raw);
      assert.equal(r.data.get(OLD),'untouched original game');
      assert.ok(r.n.profiles.current());
      assert.ok(r.events.some(([e]) => e==='save:blocked'));
      assert.ok(!r.writes.includes(KEY),'canonical write must not even be attempted');
    });
    await check('verified exact backup ' + JSON.stringify(raw), () => {
      const r=boot({[KEY]:raw});
      assert.equal(backups(r).length,1); assert.equal(backups(r)[0][1],raw);
      create(r); assert.equal(backups(r)[0][1],raw);
      assert.equal(JSON.parse(r.data.get(KEY)).profiles[0].name,'Independent fixture');
    });
  }
  await check('initial read throws, populated canonical remains intact', () => {
    const r=boot({[KEY]:rawValid}, {firstRead:true}); create(r);
    assert.equal(r.data.get(KEY),rawValid); assert.ok(!r.writes.includes(KEY));
  });
  await check('initial read throws, truly empty canonical can recover', () => {
    const r=boot({}, {firstRead:true}); create(r);
    assert.equal(JSON.parse(r.data.get(KEY)).profiles[0].name,'Independent fixture');
  });
  await check('foreign curriculum rejected, original preserved', () => {
    const obj=JSON.parse(rawValid); obj.profiles[0].curriculum='foreign-program';
    const raw=JSON.stringify(obj), r=boot({[KEY]:raw}); assert.equal(r.n.profiles.list().length,0);
    assert.equal(backups(r)[0][1],raw); create(r); assert.equal(backups(r)[0][1],raw);
  });
  await check('migration failure is backed up before any replacement', () => {
    const obj=JSON.parse(rawValid); obj.profiles[0].mess={home:'not-an-array'};
    const raw=JSON.stringify(obj), r=boot({[KEY]:raw});
    assert.equal(r.n.profiles.list().length,0); assert.equal(backups(r)[0][1],raw);
    assert.equal(r.n.saveCode.apply(obj),false); assert.equal(r.data.get(KEY),raw);
    create(r); assert.equal(backups(r)[0][1],raw);
  });
  await check('newer valid cloud candidate cannot overwrite a locked device original', async () => {
    const raw='{broken'; const remote=JSON.parse(rawValid); remote.updated=Date.now()+100000;
    const cloudWrites=[];
    const cloud={use:async name=>name==='user'?{id:async()=> 'review-fixture'}:{doc:path=>({
      get:async()=>({exists:true,data:()=>({json:JSON.stringify(remote),updated:remote.updated})}),
      set:async value=>{cloudWrites.push([path,value]);}
    })}};
    const r=boot({[KEY]:raw},{backup:'throw'},cloud); await pause(50);
    assert.equal(r.n.profiles.list().length,1); assert.equal(r.data.get(KEY),raw);
    assert.ok(!r.writes.includes(KEY));
  });
  await check('failed unreadable cloud backup blocks subsequent canonical cloud writes', async () => {
    const cloudWrites=[];
    const cloud={use:async name=>name==='user'?{id:async()=> 'review-fixture'}:{doc:path=>({
      get:async()=>({exists:true,data:()=>({json:'',updated:1})}),
      set:async value=>{if(path.includes('-unreadable-'))throw Error('backup denied'); cloudWrites.push([path,value]);}
    })}};
    const r=boot({}, {}, cloud); await pause(50); create(r); await pause(1400);
    assert.equal(cloudWrites.length,0); assert.ok(r.n.profiles.current());
  });
  console.log(passed + ' passed, ' + failed + ' failed');
  process.exitCode=failed?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
