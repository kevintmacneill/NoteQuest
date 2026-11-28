'use strict';
const assert=require('node:assert/strict');
const {KEYS,PROOF,label,start}=require('../assets/nq-piano-sweep.js');
let passed=0,failed=0;
function check(name,fn){
  try{fn();passed++;}
  catch(error){failed++;console.error('FAIL',name,error.message);}
}
const hz=(midi,cents=0)=>440*2**((midi-69+cents/100)/12);
const accept=(s,midi,quality='accepted',checkpoint=s.snapshot().checkpoint,cents=0)=>s.accept({hz:hz(midi,cents),confidence:.9,quality,checkpoint});
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
  assert.equal(accept(s,21,'uncertain').reason,'unheard');
  assert.equal(accept(s,23).reason,'wrong-key');
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
check('three misses or a grown-up skip progress without inventing a measurement',()=>{
  const s=start(),token=s.snapshot().checkpoint;
  assert.equal(s.miss(token).reason,'unheard');
  assert.equal(s.miss(token).reason,'stale-capture');
  assert.equal(s.miss(s.snapshot().checkpoint).reason,'unheard');
  assert.equal(s.miss(s.snapshot().checkpoint).ok,true);
  assert.equal(s.skip(s.snapshot().checkpoint).ok,true);
  assert.equal(s.snapshot().midi,23);
  for(const midi of KEYS.slice(2,-1))assert.equal(accept(s,midi).ok,true);
  assert.equal(s.skip(s.snapshot().checkpoint).state.phase,'proof');
  const device={read:()=>({activePiano:'home'}),setCalibration:(id,data)=>({id,data})};
  assert.equal(s.saveMeasurements(device,'elsewhere',{}).reason,'wrong-piano');
  const {id,data}=s.saveMeasurements(device,'home',{deviceClass:'tablet',placement:'music-stand'});
  assert.equal(id,'home');
  assert.deepEqual(data.keys[0],{midi:21,unheard:true});
  assert.deepEqual(data.keys[87],{midi:108,unheard:true});
  assert.deepEqual(data.range,{low:23,high:107});
});
check('expected pianokey allows a tuning offset and proof uses that offset',()=>{
  const s=start();
  for(const midi of KEYS)assert.equal(accept(s,midi,'accepted',s.snapshot().checkpoint,-70).ok,true);
  assert.equal(accept(s,60).reason,'wrong-key');
  for(const midi of PROOF)assert.equal(accept(s,midi,'accepted',s.snapshot().checkpoint,-70).ok,true);
  assert.equal(s.snapshot().phase,'complete');
});
check('pause and resume keep position and invalidate pending captures',()=>{
  const s=start(),token=s.snapshot().checkpoint;
  assert.equal(s.pause().paused,true);
  assert.equal(accept(s,21).reason,'paused');
  assert.equal(s.resume().midi,21);
  assert.equal(accept(s,21,'accepted',token).reason,'stale-capture');
  assert.equal(accept(s,21).ok,true);
});
console.log(passed+' passed, '+failed+' failed');
if(failed)process.exitCode=1;
