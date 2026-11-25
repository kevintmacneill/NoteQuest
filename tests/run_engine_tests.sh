#!/bin/sh
# Runs the engine tests with Node, no browser: extracts <script id="nq-engine"> from index.html.
#   /tmp/nq-engine.js         the real engine with the approved v3.2 curriculum (what the game runs)
#   /tmp/nq-engine-sample.js  the same engine with tests/curriculum_sample_0_1.js swapped in for the curriculum block,
#                             so the suites written against the old 2-world sample keep testing engine behavior
set -e
cd "$(dirname "$0")/.."
node -e "
const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const m=h.match(/<script id=\"nq-engine\">\n([\s\S]*?)\n<\/script>/);
fs.writeFileSync('/tmp/nq-engine.js',m[1]);
const a=m[1].indexOf('/*NQ-CURRICULUM-BEGIN*/'),b=m[1].indexOf('/*NQ-CURRICULUM-END*/');if(a<0||b<0)throw new Error('curriculum markers missing');
const sample=fs.readFileSync('tests/curriculum_sample_0_1.js','utf8');
fs.writeFileSync('/tmp/nq-engine-sample.js',m[1].slice(0,a)+'/*NQ-CURRICULUM-BEGIN*/\n'+sample+'\n'+m[1].slice(b))"
python3 tools/curriculum/build_v32.py --check
node tests/engine_node.js /tmp/nq-engine-sample.js
node tests/learn_node.js /tmp/nq-engine-sample.js
node tests/pets_node.js /tmp/nq-engine-sample.js
node tests/listen_node.js /tmp/nq-engine-sample.js
node tests/theory_node.js /tmp/nq-engine-sample.js
node tests/generators_node.js /tmp/nq-engine-sample.js
node tests/early_types_node.js /tmp/nq-engine-sample.js
node tests/journey_node.js /tmp/nq-engine-sample.js
node tests/companions_node.js /tmp/nq-engine-sample.js
node tests/sanctuary_node.js /tmp/nq-engine-sample.js
node tests/music_reference_node.js
node tests/fuzz_node.js /tmp/nq-engine-sample.js 1500
# the real curriculum: data, coming soon, grown-up checks, readiness, fresh start, placement
node tests/curriculum_v32_node.js /tmp/nq-engine.js
node tests/fuzz_node.js /tmp/nq-engine.js 3000

# Visual identity integrity test; does not mutate the engine.
node tests/milestone_dragon_node.js
# Pure milestone guide presentation cue guard (no game state writes)
node tests/milestone_cues_node.js
# Runtime atlas capability and exact routing (WP-2.3).
node tests/worlds_node.js
