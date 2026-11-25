'use strict';
const fs=require('fs');
const vm=require('vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2],'utf8');
const MAIN='noteQuest.game32', PREVIEW='noteQuest.preview.pr-test.game32';
const DAY=24*60*60*1000;
let now=10*DAY;
class Clock extends Date {static now(){return now;}}
const disk=new Map();
let failWrite=false;
function boot(src=source){
  const ctx={Date:Clock,navigator:{},setInterval:()=>0,
    localStorage:{getItem:k=>disk.get(k)??null,setItem(k,v){if(failWrite)throw Error('storage unavailable');disk.set(k,v);}},
    btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary')};
  ctx.window=ctx;
  vm.runInNewContext(src,ctx);
  ctx.NQ.start();
  return ctx.NQ;
}
const main=boot(), devices=main.deviceSetup;
let passed=0,failed=0;
function check(label,fn){
  try{fn();passed++;}
  catch(error){failed++;console.error('FAIL',label,error.message);}
}
check('fresh installation offers setup without writing',()=>{
  assert.equal(devices.shouldOffer(),true);
  assert.equal(disk.has(MAIN+'.devices'),false);
});
check('Later defers only this installation for 30 days',()=>{
  assert.equal(devices.defer().ok,true);
  now+=29*DAY;assert.equal(boot().deviceSetup.shouldOffer(),false);
  now+=DAY;assert.equal(boot().deviceSetup.shouldOffer(),true);
});
check('stores allowed microphone metadata only',()=>{
  const config={class:'tablet',placement:'music-stand',inputId:'local-mic',processing:{ec:false,ns:false,agc:true},sampleRate:48000,audio:'raw audio'};
  assert.equal(devices.rememberDevice(config).ok,true);
  const captured=JSON.parse(disk.get(MAIN+'.devices'));
  assert.equal(captured.device.processing.agc,true);
  assert.equal(captured.device.inputId,'local-mic');
  assert.equal(Object.hasOwn(captured.device,'audio'),false);
  assert.equal(boot().deviceSetup.shouldOffer(),true);
});
check('invalid settings leave persisted record unchanged',()=>{
  const previous=disk.get(MAIN+'.devices');
  assert.equal(devices.rememberDevice({class:'tablet',placement:'invalid'}).ok,false);
  assert.equal(devices.rememberDevice({class:'tablet',placement:'other',processing:{ns:'no'}}).ok,false);
  assert.equal(disk.get(MAIN+'.devices'),previous);
});
check('named pianos and active selection survive reload',()=>{
  const first=devices.createPiano(undefined,'upright');
  const second=devices.createPiano('Practice piano','digital-speakers');
  assert.equal(first.ok,true);
  assert.equal(second.ok,true);
  assert.notEqual(first.id,second.id);
  assert.equal(devices.renamePiano(first.id,'Living room').ok,true);
  assert.equal(devices.selectPiano(first.id).ok,true);
  const persisted=boot().deviceSetup.read();
  assert.equal(persisted.activePiano,first.id);
  assert.deepEqual(persisted.pianos.map(p=>p.name).join('|'),'Living room|Practice piano');
  assert.equal(Object.hasOwn(persisted.pianos[0],'quality'),false);
  assert.equal(devices.selectPiano('missing').ok,false);
});
check('plays with a separate preview namespace',()=>{
  const preview=boot(source.replace("'"+MAIN+"'","'"+PREVIEW+"'"));
  assert.equal(preview.deviceSetup.read().pianos.length,0);
  preview.deviceSetup.createPiano('Preview');
  assert.equal(devices.read().pianos.length,2);
  assert.equal(disk.has(PREVIEW+'.devices'),true);
});
check('learner saves and save codes omit device configuration',()=>{
  main.profiles.create('Learner','🎵');
  const code=JSON.stringify(main.saveCode.parse(main.saveCode.export()));
  const save=disk.get(MAIN);
  for(const token of ['local-mic','Living room','Practice piano','activePiano','deviceSetup']){
    assert.equal(code.includes(token)||save.includes(token),false);
  }
});
check('unreadable storage and unsupported schemas are preserved',()=>{
  const key=PREVIEW+'.devices',preview=boot(source.replace("'"+MAIN+"'","'"+PREVIEW+"'"));
  for(const raw of ['{', '{"v":2,"pianos":[]}']){
    disk.set(key,raw);
    assert.equal(preview.deviceSetup.createPiano().ok,false);
    assert.equal(disk.get(key),raw);
  }
});
check('write failure is reported without changing the selection',()=>{
  const previous=disk.get(MAIN+'.devices');
  failWrite=true;
  try{assert.equal(devices.createPiano().ok,false);}
  finally{failWrite=false;}
  assert.equal(disk.get(MAIN+'.devices'),previous);
});
console.log(passed+' passed, '+failed+' failed');
if(failed)process.exitCode=1;
