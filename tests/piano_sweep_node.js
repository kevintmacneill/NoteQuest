'use strict';
const assert=require('node:assert/strict');
const {KEYS,PROOF,label,start}=require('../assets/nq-piano-sweep.js');
let passed=0,failed=0;
function check(name,fn){
  try{fn();passed++;}
  catch(error){failed++;console.error('FAIL',name,error.message);}
}
const accept=(s,midi,quality='accepted',checkpoint=s.snapshot().checkpoint)=>s.accept({midi,quality,checkpoint});
const sweep=s=>KEYS.forEach(midi=>assert.equal(accept(s,midi).ok,true));
check('full sweep covers every physical piano key in order',()=>{
  assert.equal(KEYS.length,88);
  assert.equal(new Set(KEYS).size,88);
  assert.equal(KEYS.every((midi,i)=>midi===21+i),true);
  assert.equal(label(KEYS[0]),'A0');
  assert.equal(label(KEYS[87]),'C8');
  assert.equal(label(60),'C4');
  assert.equal(label(61),'C♯4');
  assert.equal(label(20),null);
  assert.equal(label(109),null);
});
check('uncertain and unexpected notes keep the current key',()=>{
  const s=start(), before=s.snapshot();
  assert.equal(accept(s,21,'uncertain').reason,'uncertain');
  assert.equal(accept(s,22).reason,'wrong-key');
  assert.deepEqual(s.snapshot(),before);
});
check('delayed events cannot advance the next prompt',()=>{
  const s=start(),token=s.snapshot().checkpoint;
  assert.equal(accept(s,21).ok,true);
  assert.equal(accept(s,22,'accepted',token).reason,'stale-capture');
  assert.equal(s.snapshot().midi,22);
});
check('proof is required after all 88 keys',()=>{
  const s=start();sweep(s);
  assert.equal(s.snapshot().phase,'proof');
  assert.deepEqual(PROOF,[60,62,64]);
  assert.equal(s.snapshot().measured,88);
  assert.equal(accept(s,60).ok,true);
  assert.equal(accept(s,64).reason,'wrong-key');
  assert.equal(accept(s,62).ok,true);
  assert.equal(s.snapshot().phase,'proof');
  assert.equal(accept(s,64).state.phase,'complete');
  assert.equal(accept(s,64).reason,'complete');
});
check('proof retry invalidates pending events and keeps all measured keys',()=>{
  const s=start();
  assert.equal(s.retryProof().reason,'not-in-proof');
  sweep(s);accept(s,60);
  const stale=s.snapshot().checkpoint;
  assert.equal(s.retryProof().ok,true);
  assert.equal(s.snapshot().midi,60);
  assert.equal(s.snapshot().measured,88);
  assert.equal(accept(s,60,'accepted',stale).reason,'stale-capture');
});
check('a new setup has isolated progress',()=>{
  const left=start(),right=start();
  accept(left,21);
  assert.equal(left.snapshot().midi,22);
  assert.equal(right.snapshot().midi,21);
  assert.equal(Object.isFrozen(right.snapshot()),true);
});
console.log(passed+' passed, '+failed+' failed');
if(failed)process.exitCode=1;
