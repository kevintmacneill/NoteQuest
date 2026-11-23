/* Run: node tests/lesson_route_test.cjs */
'use strict';
const assert=require('node:assert/strict');
const {resolve}=require('../assets/nq-lesson-route.js');
const sample={id:'NQ-00-S1',level:'NQ-00',title:'Find the keys'};
function engine(overrides={}){
 const status={id:sample.id,unlocked:true,complete:false,step:'learn',skills:['k-group2'],...overrides.status};
 return {currentStop:()=>sample.id,curriculum:()=>({stops:[sample]}),stopStatus:()=>status,markLearned:()=>true,start:()=>({ok:true}),answer:()=>({ok:true}),skill:()=>({id:'k-group2'}),...overrides};
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
console.log('lesson route: 10 assertions passed');
