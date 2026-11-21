#!/bin/sh
# Runs the engine tests with Node, no browser: extracts <script id="nq-engine"> from index.html.
set -e
cd "$(dirname "$0")/.."
node -e "const h=require('fs').readFileSync('index.html','utf8');const m=h.match(/<script id=\"nq-engine\">\n([\s\S]*?)\n<\/script>/);require('fs').writeFileSync('/tmp/nq-engine.js',m[1])"
node tests/engine_node.js /tmp/nq-engine.js
node tests/learn_node.js /tmp/nq-engine.js
node tests/pets_node.js /tmp/nq-engine.js
