import assert from 'node:assert/strict';
import {inflateSync} from 'node:zlib';
import {fresh,compile,ORDER,keyOf,nextEntry,bounds,raster,rgbaPng} from './core.mjs';

assert.equal(new Set(ORDER.map(keyOf)).size,288);
assert.equal(keyOf(ORDER[0]),'girl/girl-ponytail/front/hc-brown');
assert.equal(keyOf(ORDER[11]),'boy/boy-wavy/front/hc-brown');
assert.equal(keyOf(ORDER[12]),'girl/girl-ponytail/wave/hc-brown');
assert.equal(keyOf(ORDER[24]),'girl/girl-ponytail/walk/hc-brown');
assert.equal(keyOf(ORDER[36]),'girl/girl-ponytail/front/hc-black');
assert.equal(keyOf(nextEntry({[keyOf(ORDER[0])]:'v1'})),keyOf(ORDER[1]));

const fit=fresh();
Object.assign(fit.affine,{x:-4,y:8,angle:3,sx:1.05,sy:.97});
const a=compile(fit);
fit.pins=[[420,270],[575,266]].map((source,i)=>{
  const [x,y]=a.forward(source);
  return {source,target:[x+(i?5:-7),y+(i?-4:2)],radius:150};
});
const world=compile(fit);
for (const pin of fit.pins) {
  const [x,y]=world.forward(pin.source);
  assert.ok(Math.hypot(x-pin.target[0],y-pin.target[1])<1e-8);
}
for (let y=130;y<470;y+=10) for(let x=300;x<700;x+=10) {
  const [rx,ry]=world.inverse(...world.forward([x,y]));
  assert.ok(Math.hypot(rx-x,ry-y)<.001);
}
const fold=fresh();
fold.pins=[{source:[512,310],target:[560,310],radius:60}];
assert.throws(()=>compile(fold),/distortion limit/);
const singular=fresh();
singular.pins=[{source:[512,300],target:[514,300],radius:70},{source:[512,300],target:[513,300],radius:70}];
assert.throws(()=>compile(singular),/too close/);

const size=12,src=new Uint8ClampedArray(size*size*4);
const index=(x,y)=>(y*size+x)*4;
src.set([202,78,145,255],index(4,4)); // A painted opaque bow pixel
src.set([255,255,255,0],index(5,4));  // Transparent white cannot bleach neighboring samples
const box=bounds(src,size);
assert.deepEqual(box,[4,4,4,4]);
const shift=fresh();
shift.affine.x=.5;
const scaled=raster({front:src,box},compile(shift),size);
assert.deepEqual([...scaled.front.slice(index(4,4),index(4,4)+4)],[202,78,145,128]);
assert.deepEqual([...scaled.front.slice(index(5,4),index(5,4)+4)],[202,78,145,128]);
const mask=new Uint8ClampedArray(src.length);
mask[index(4,4)+3]=255;
const moved=raster({front:src,box,mask},compile(fresh()),size);
assert.equal(moved.front[index(4,4)+3],0);
assert.deepEqual([...moved.back.slice(index(4,4),index(4,4)+4)],[202,78,145,255]);
const bytes=rgbaPng(moved.back,size);
assert.deepEqual(bytes,rgbaPng(moved.back,size));
assert.equal(bytes[25],6);
const idatLength=new DataView(bytes.buffer).getUint32(33);
const raw=inflateSync(bytes.subarray(41,41+idatLength));
assert.equal(raw.length,size*(size*4+1));
assert.deepEqual([...raw.subarray(4*(size*4+1)+1+4*4,4*(size*4+1)+1+4*5)],[202,78,145,255]);
const larger=new Uint8ClampedArray(130*130*4); // Multiple DEFLATE blocks
const large=rgbaPng(larger,130);
const largeLength=new DataView(large.buffer).getUint32(33);
assert.equal(inflateSync(large.subarray(41,41+largeLength)).length,130*(130*4+1));
console.log('Registration, sequence, inverse warp, premultiplied alpha, layer split and PNG tests passed.');
