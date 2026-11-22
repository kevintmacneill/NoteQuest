#!/bin/sh
# Runs the engine tests with Node, no browser: extracts <script id="nq-engine"> from index.html.
set -e
cd "$(dirname "$0")/.."
node -e "const h=require('fs').readFileSync('index.html','utf8');const m=h.match(/<script id=\"nq-engine\">\n([\s\S]*?)\n<\/script>/);require('fs').writeFileSync('/tmp/nq-engine.js',m[1])"
node tests/engine_node.js /tmp/nq-engine.js
node tests/learn_node.js /tmp/nq-engine.js
node tests/pets_node.js /tmp/nq-engine.js
node tests/listen_node.js /tmp/nq-engine.js
node tests/theory_node.js /tmp/nq-engine.js
node tests/generators_node.js /tmp/nq-engine.js
node tests/early_types_node.js /tmp/nq-engine.js
node tests/journey_node.js /tmp/nq-engine.js
node tests/companions_node.js /tmp/nq-engine.js
node tests/sanctuary_node.js /tmp/nq-engine.js
node tests/music_reference_node.js
node tests/fuzz_node.js /tmp/nq-engine.js 3000

# Visual identity integrity test; does not mutate the engine.
node tests/milestone_dragon_node.js
