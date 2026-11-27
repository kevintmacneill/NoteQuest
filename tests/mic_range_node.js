// WP-0.10 Stage 1 range rule (engine 1.9.4), on the real engine's detector (NQ.mic.classify), with synthetic piano-like tones.
// Lessons must never get a WRONG note from a key the detector can't hear clearly: very high keys and bass keys report "unclear".
// Real-piano verification stays on the private 88-key replay and the tablet (Kevin's privacy rule: no recording in the repo).
const fs=require('fs');const vm=require('vm');
const SRC=fs.readFileSync(process.argv[2],'utf8');
let ok=0,bad=0;const t=(n,c,info)=>{if(c)ok++;else{bad++;console.log('FAIL',n,info===undefined?'':JSON.stringify(info))}};
let STORE={};global.window=global;global.navigator={};
global.localStorage={getItem:k=>k in STORE?STORE[k]:null,setItem:(k,v)=>{STORE[k]=String(v)},removeItem:k=>{delete STORE[k]}};
global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
global.setInterval=()=>0;global.clearInterval=()=>{};
vm.runInThisContext(SRC);const NQ=window.NQ;NQ.start();
t('engine version',NQ.version==='1.9.4',NQ.version);
const classify=NQ.mic.classify;t('classifier is exposed',typeof classify==='function');
const hz=m=>440*2**((m-69)/12);
// piano-like: harmonics with slight inharmonicity and a gentle decay; amps(n) shapes the spectrum
function tone(m,{sr=48000,n=8192,amps=k=>1/k,B=0.0004,level=0.3,offset=0.15,hum=0}={}){
  const f=hz(m),out=new Float32Array(n);const parts=[];for(let k=1;k<=16;k++){const fk=k*f*Math.sqrt(1+B*k*k);if(fk<sr/2.2)parts.push([fk,amps(k)])}
  const norm=parts.reduce((a,[,x])=>a+x,0);
  for(let i=0;i<n;i++){const tt=offset+i/sr;let v=0;for(const [fk,a] of parts)v+=a*Math.sin(2*Math.PI*fk*tt);out[i]=level*Math.exp(-tt*1.2)*v/norm+(hum?hum*Math.sin(2*Math.PI*60*tt):0)}
  return out}
const name=m=>['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][m%12]+(Math.floor(m/12)-1);
for(const sr of [48000,44100]){
  // the curriculum range and the middle of the piano: named correctly
  for(const m of [48,49,55,60,61,63,64,66,67,68,70,72,76,79,84]){const r=classify(tone(m,{sr}),sr);t(sr+' '+name(m)+' named',r&&r.note===m,r)}
  // newly in range: F#6 to D#7 (previously silent above 1400 Hz)
  for(const m of [90,91,93,96]){const r=classify(tone(m,{sr}),sr);t(sr+' '+name(m)+' named (new upper range)',r&&r.note===m,r)}
  {const r=classify(tone(99,{sr}),sr);t(sr+' D#7 named or reported too high, never a wrong note',r&&(r.note===99||r.unclear==='high'),r)}
  // E7 to C8: "too high", never a note (and never an octave-low wrong note)
  for(const m of [100,103,105,108]){const r=classify(tone(m,{sr,amps:k=>k===1?1:0.2/k}),sr);t(sr+' '+name(m)+' too high',r&&r.unclear==='high',r)}
  // bass keys whose fundamental is weak and whose energy sits in overtones: never a note
  for(const m of [21,24,28,33,36,40,43]){
    const r=classify(tone(m,{sr,amps:k=>k<3?0.15:Math.exp(-((k-9)**2)/18)}),sr);
    t(sr+' bass '+name(m)+' is unclear, silent or named correctly, never a wrong note',!r||r.unclear==='low'||r.note===m,r)}
}
// phone-like spectra: a second harmonic louder than the fundamental must not be called "too high" or "too low"
for(const m of [48,55,60,67,72,79]){const r=classify(tone(m,{amps:k=>k===1?0.6:k===2?0.9:0.5/k}),48000);t('strong 2nd harmonic: '+name(m)+' named',r&&r.note===m,r)}
// mains hum under a middle note does not make it "too low"
{const r=classify(tone(60,{hum:0.05}),48000);t('C4 with 60 Hz hum is still C4',r&&r.note===60,r)}
// tuning offset still applies
{const sharp=tone(60.6);const a=classify(sharp,48000),b=classify(sharp,48000,60);t('a piano 60 cents sharp reads C#4 without correction',a&&a.note===61,a);t('and C4 with the +60 cent correction',b&&b.note===60,b)}
// silence and very quiet input: nothing
{const z=new Float32Array(8192);t('silence is nothing',classify(z,48000)===null)}
{const q=tone(60,{level:0.004});t('very quiet input is nothing',classify(q,48000)===null)}
// a short buffer (old 2048 analysers) still names notes and still refuses very high ones without the spectrum
{const r=classify(tone(60,{n:2048}),48000);t('2048-sample buffer still names C4',r&&r.note===60,r)}

console.log(ok+' passed, '+bad+' failed');
if(bad)process.exit(1);
