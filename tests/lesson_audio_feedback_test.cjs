/* #109 source-contract regression: run node tests/lesson_audio_feedback_test.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../assets/nq-engine-lesson.js'),'utf8');
const checks=[
 ['audio respects engine setting',/NQ\.audio\.soundOn\(\)/],
 ['invalid MIDI rejected',/Number\.isFinite\(midi\)/],
 ['suspended context resumes',/await ctx\.resume\(\)/],
 ['cancelled screen cannot play',/!live\|\|!roundId/],
 ['engine owns question answers',/learn\.answer\(roundId,el\.dataset\.nq109Answer\)/],
 ['engine owns learning completion',/learn\.markLearned\(id\)/],
 ['engine owns assessment start',/learn\.start\(s\.id,mode\)/],
 ['engine retry feedback displayed',/hasOwnProperty\.call\(result,'reveal'\)/],
 ['no direct save mutation',/^((?!NQ\.save\(|localStorage\.setItem\().)*$/s]
];
for(const [label,pattern] of checks)assert.match(src,pattern,label);
console.log('lesson audio/feedback source contract: '+checks.length+' assertions passed');
