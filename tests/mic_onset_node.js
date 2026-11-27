// Onset gate on the real engine Mic (engine 1.9.4; ChatGPT review of #172). After a note fires, nothing else fires until the sound goes
// quiet (2 frames) or a fresh strike lifts the level ~6 dB: a ringing note whose harmonics shift, or a frame with no clear pitch, can't answer twice.
const fs=require('fs');const vm=require('vm');
const SRC=fs.readFileSync(process.argv[2],'utf8');
let ok=0,bad=0;const t=(n,c,info)=>{if(c)ok++;else{bad++;console.log('FAIL',n,info===undefined?'':JSON.stringify(info))}};
let STORE={};global.window=global;global.navigator={};global.isSecureContext=true;global.document={};
global.localStorage={getItem:k=>k in STORE?STORE[k]:null,setItem:(k,v)=>{STORE[k]=String(v)},removeItem:k=>{delete STORE[k]}};
global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
const SR=48000;let frame={kind:'tone',midi:60,level:.2},phase=0;
function fill(b){const f=440*2**((frame.midi-69)/12);for(let i=0;i<b.length;i++){phase+=1;
  b[i]=frame.kind==='noise'?frame.level*(Math.random()*2-1):frame.level*(Math.sin(2*Math.PI*f*phase/SR)+.4*Math.sin(2*Math.PI*2*f*phase/SR))}}
global.AudioContext=class{constructor(){this.sampleRate=SR;this.state='running';this.currentTime=0}resume(){return Promise.resolve()}
  createMediaStreamSource(){return {connect(){},disconnect(){}}}createAnalyser(){return {fftSize:8192,getFloatTimeDomainData:fill}}};
navigator.mediaDevices={getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})};
let tick=null;global.setInterval=cb=>{tick=cb;return 1};global.clearInterval=()=>{};
vm.runInThisContext(SRC);const NQ=window.NQ;NQ.start();
(async()=>{
  const heard=[],unclear=[];
  t('mic starts',await NQ.mic.start(m=>heard.push(m),{onUnclear:k=>unclear.push(k)}));
  const run=(f,n)=>{frame=f;for(let i=0;i<n;i++)tick()};
  run({kind:'tone',midi:60,level:.2},8);
  t('a held note fires once',JSON.stringify(heard)==='[60]',heard);
  run({kind:'tone',midi:72,level:.18},6);
  t('its harmonics shifting while it rings does not fire again',JSON.stringify(heard)==='[60]',heard);
  run({kind:'noise',level:.18},1);run({kind:'tone',midi:60,level:.17},6);
  t('a frame with no clear pitch, then the same ringing note, does not fire again',JSON.stringify(heard)==='[60]',heard);
  run({kind:'tone',midi:64,level:.16},6);
  t('a different pitch at the same loudness (decay, not a strike) does not fire',JSON.stringify(heard)==='[60]',heard);
  run({kind:'tone',midi:64,level:0},2);run({kind:'tone',midi:60,level:.2},6);
  t('after the key is lifted (2 quiet frames) the same note fires again',JSON.stringify(heard)==='[60,60]',heard);
  run({kind:'tone',midi:67,level:.5},6);
  t('a clearly louder new strike fires at once',JSON.stringify(heard)==='[60,60,67]',heard);
  run({kind:'tone',midi:67,level:0},2);run({kind:'tone',midi:105,level:.3},6);run({kind:'tone',midi:105,level:.28},6);
  t('an unclear note is reported once, not repeatedly',JSON.stringify(unclear)==='["high"]',unclear);
  NQ.mic.stop();
  t('a stopped mic is off',!NQ.mic.isOn());
  console.log(ok+' passed, '+bad+' failed');process.exit(bad?1:0);
})();
