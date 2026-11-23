/* Deterministic, no-UI milestone event tests. */
'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
  let n=0;
  const mod=await import(pathToFileURL(path.resolve(__dirname,
    '../assets/characters/milestone-dragon/milestone-cues.mjs')).href);
  const parts=()=>({
    navigation:{passed:true},timing:{passed:true},performance:{passed:true}
  });
  const base=()=>({
    event:{worldId:'NQ-00',to:'NQ-01',placed:false},
    activeProfile:{id:'learner-a'},
    expectedProfileId:'learner-a',
    journeyStatus:{
      ok:true,worldId:'NQ-00',to:'NQ-01',
      required:true,unlocked:true,unlockedAt:1795365600000,
      placed:false,parts:parts()
    }
  });
  const ok=mod.graduationCueFromVerifiedEvent(base());
  assert.ok(ok);n++;
  assert.equal(ok.kind,'world-graduated');n++;
  assert.equal(ok.characterId,'milestone-dragon');n++;
  assert.equal(ok.completedWorldId,'NQ-00');n++;
  assert.equal(ok.nextWorldId,'NQ-01');n++;
  assert.ok(Object.isFrozen(ok));n++;
  assert.equal(mod.graduationCueFromVerifiedEvent(base()).key,ok.key);n++;
  const rejects=[
    x=>{x.event=null},
    x=>{x.activeProfile=null},
    x=>{x.expectedProfileId='learner-b'},
    x=>{x.activeProfile.id='learner-b'},
    x=>{x.event.worldId='NQ-02'},
    x=>{x.event.to='NQ-02'},
    x=>{x.event.worldId='bad-world'},
    x=>{x.journeyStatus.ok=false},
    x=>{x.journeyStatus.required=false},
    x=>{x.journeyStatus.unlocked=false},
    x=>{x.journeyStatus.unlockedAt=null},
    x=>{x.journeyStatus.unlockedAt=0},
    x=>{x.journeyStatus.placed=true},
    x=>{x.journeyStatus.parts.timing.passed=false},
    x=>{x.journeyStatus.parts.navigation=null},
    x=>{x.journeyStatus.parts=null}
  ];
  for(const mutate of rejects){
    const x=base();mutate(x);
    assert.equal(mod.graduationCueFromVerifiedEvent(x),null);
    n++;
  }
  const placement=base();
  placement.event.placed=true;placement.journeyStatus.placed=true;
  assert.equal(mod.graduationCueFromVerifiedEvent(placement).placed,true);n++;
  const finish=base();finish.event.to=null;finish.journeyStatus.to=null;
  assert.equal(mod.graduationCueFromVerifiedEvent(finish).nextWorldId,null);n++;
  const stub={
    profiles:{current:()=>({id:'learner-a'})},
    journey:{status:()=>base().journeyStatus}
  };
  assert.deepEqual(mod.graduationCueFromEngine(stub,base().event,'learner-a'),ok);n++;
  assert.equal(mod.graduationCueFromEngine(stub,base().event,'learner-b'),null);n++;
  assert.equal(mod.graduationCueFromEngine(null,base().event,'learner-a'),null);n++;
  let changed=0;
  const observable={
    profiles:{current:()=>({id:'learner-a'})},
    journey:{status:()=>base().journeyStatus},
    save:()=>{changed++},
    journeyAward:()=>{changed++}
  };
  mod.graduationCueFromEngine(observable,base().event,'learner-a');
  assert.equal(changed,0);n++;
  console.log(n+' passed, 0 failed');
})().catch(e=>{console.error('FAIL milestone cue guard',e);process.exitCode=1});
