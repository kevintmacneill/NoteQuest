/* Run: node tests/lesson_ui_contract_test.cjs
   Source-level regression checks, NOT browser gameplay verification. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ui=fs.readFileSync(path.join(__dirname,'../assets/nq-engine-lesson.js'),'utf8');
const index=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
assert.match(ui,/What color is this piano key\?/);
assert.doesNotMatch(ui,/Find the black key|Find the white key/);
assert.match(ui,/question\.show==='key-black'\?'#171717':'#fff'/);
assert.match(ui,/learn\.markLearned\(id\)/);
assert.match(ui,/learn\.start\(s\.id,mode\)/);
assert.match(ui,/learn\.answer\(roundId,el\.dataset\.nq109Answer\)/);
assert.match(ui,/learn\.cancel\(roundId\)/);
assert.match(index,/assets\/nq-engine-lesson\.js/);
assert.match(ui,/ctx\.state==='suspended'&&typeof ctx\.resume==='function'/);
assert.match(ui,/await ctx\.resume\(\)/);
assert.match(ui,/if\(!live\|\|!roundId\|\|!question\|\|question\.type!=='highLow'\)return/);
assert.match(ui,/if\(ctx\.state==='suspended'\)throw Error\('audio-suspended'\)/);
console.log('lesson UI contract: 12 assertions passed');
