/* npm-free regression: node tests/city_parallax_node.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const api=require('../assets/nq-city-parallax.js');
const css=fs.readFileSync(require('node:path').join(__dirname,'../assets/nq-city-parallax.css'),'utf8');
assert.equal(typeof api.mount,'function');
assert.deepEqual(Object.keys(api.defaults),['sky','mountains','city','foreground']);
assert.equal(api.speeds.city,0,'City remains aligned with hotspot coordinates');
assert(api.speeds.foreground<0 && api.speeds.sky>0);
assert.equal(typeof api.mount(null,null),'function');
for(const name of Object.keys(api.defaults))assert.match(api.defaults[name],/\.webp$/);
assert(css.includes('.nq-parallax-fallback-hidden'));
assert(css.includes('prefers-reduced-motion:reduce'));
assert(css.includes('nq-cloud-wander'));
console.log('city parallax static contract: 10 checks passed');
