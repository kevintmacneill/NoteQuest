/* Run: node tests/lesson_route_test.cjs */
'use strict';
const assert=require('node:assert/strict');
const {resolve}=require('../assets/nq-lesson-route.js');
const sample={id:'NQ-00-S1',level:'NQ-00',title:'Find the keys'};
function engine(overrides={}){
 const status={id:sample.id,unlocked:true,complete:false,step:'learn',skills:[{id:'k-group2',state:'exploring'}],...overrides.status};
 return {currentStop:()=>sample.id,curriculum:()=>({stops:[sample]}),stopStatus:()=>status,markLearned:()=>true,start:()=>({ok:true}),answer:()=>({ok:true}),skill:()=>({id:'k-group2'}),...Object.fromEntries(Object.entries(overrides).filter(([key])=>key!=='status'))};
}
assert.equal(resolve(engine()).id,'NQ-00-S1');
assert.equal(resolve(engine()).step,'learn');
assert.equal(resolve(engine({status:{step:'practice'}})).step,'practice');
assert.equal(resolve(engine({status:{step:'check'}})).step,'check');
assert.equal(resolve(engine({status:{unlocked:false}})).reason,'locked');
assert.equal(resolve(engine({status:{complete:true}})).reason,'already-complete');
assert.equal(resolve(engine({status:{step:'unknown'}})).reason,'unsupported-step');
assert.equal(resolve(engine({curriculum:()=>({stops:[{id:'NQ-00-U01'}]})})).reason,'stop-not-in-engine');
assert.equal(resolve(engine({start:undefined,status:{step:'practice'}})).reason,'practice-unavailable');
assert.equal(resolve(null).reason,'engine-unavailable');
assert.equal(resolve(engine({currentStop:()=>null})).reason,'no-next-stop');
assert.equal(resolve(engine({stopStatus:()=>null})).reason,'invalid-status');
assert.equal(resolve(engine({status:{id:'different-stop'}})).reason,'invalid-status');
assert.equal(resolve(engine({markLearned:undefined})).reason,'learn-unavailable');
assert.equal(resolve(engine({status:{step:'practice',skills:[]}})).reason,'practice-unavailable');
assert.equal(resolve(engine({status:{step:'check'},answer:undefined})).reason,'practice-unavailable');
console.log('lesson route: 16 assertions passed');
