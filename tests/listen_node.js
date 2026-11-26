const fs=require('fs'),vm=require('vm');const {SR,render}=require('./synth.js');
const store={};global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}};global.window=global;global.navigator={};
vm.runInThisContext(fs.readFileSync(process.argv[2],'utf8'));const NQ=window.NQ;NQ.start();NQ.profiles.create('T','🎹');
const DSP=NQ.listen.dsp;const ctx={judgeOnsets:NQ.listen.judgeOnsets,makeFollower:NQ.listen.follow};const name=m=>['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][m%12]+(Math.floor(m/12)-1);
let ok=0,bad=0;const t=(n,c,info)=>{if(c)ok++;else{bad++;console.log('FAIL',n,info||'')}};
function detect(ms,opts={}){const buf=render([{m:ms,t:0,d:1}],1,opts);const x=buf.slice(Math.round(.02*SR),Math.round(.02*SR)+8192);return DSP.detectNotes(x,SR,{cents:opts.det||0}).map(n=>n.midi).sort((a,b)=>a-b)}
// single notes across range
let singleFail=[];for(let m=48;m<=84;m++){const d=detect([m]);if(!(d.length===1&&d[0]===m))singleFail.push(name(m)+'→'+d.map(name).join(','))}
t('single notes C3–C6',!singleFail.length,singleFail.join(' '));
const chords={'C major':[60,64,67],'A minor':[57,60,64],'G major':[55,59,62],'F major':[53,57,60],'C3+E4 (two hands)':[48,64],'C3+G4':[48,67],'third C4-E4':[60,64],'fifth C4-G4':[60,67],'D3+F#4':[50,66]};
for(const [k,v] of Object.entries(chords)){let good=0;const runs=10;let last;for(let r=0;r<runs;r++){const d=detect(v);last=d;if(JSON.stringify(d)===JSON.stringify(v))good++}t('chord '+k+' ≥8/10',good>=8,good+'/10 last '+last.map(name))}
// verification mode (what games use when they know the expected chord)
function verify(play,expect,opts={}){const buf=render([{m:play,t:0,d:1}],1,opts);const x=buf.slice(Math.round(.02*SR),Math.round(.02*SR)+8192);return DSP.verifyNotes(x,SR,expect,{cents:opts.det||0})}
const vcases=[['octave C4-C5',[60,72],[60,72],true],['C3+C4+E4+G4',[48,60,64,67],[48,60,64,67],true],['C major',[60,64,67],[60,64,67],true],['two hands C3+E4',[48,64],[48,64],true],
 ['missing E (played C+G, expected C+E+G)',[60,67],[60,64,67],false],['single C4 is not an octave',[60],[60,72],false],['wrong chord (A minor vs C major)',[57,60,64],[60,64,67],false],['C3 alone is not C3+C4',[48],[48,60],false]];
for(const [k,play,exp,want] of vcases){let good=0;for(let r=0;r<10;r++){const v=verify(play,exp);if(v.ok===want)good++}t('verify '+k+' ≥9/10',good>=9,good+'/10 '+JSON.stringify(verify(play,exp)))}
// detuned
let detFail=[];for(const m of [52,60,67,72]){const d=detect([m],{cents:30});if(!(d.length===1&&d[0]===m))detFail.push(name(m)+'→'+d.map(name))}t('+30 cents untuned still right',!detFail.length,detFail.join(' '));
const c=DSP.centsOf(render([{m:69,t:0,d:1}],1,{cents:30}).slice(882,882+16384),SR,69);t('cents measured ~30',Math.abs(c-30)<4,c);
// noise
let nf=[];for(const v of [[60],[60,64,67],[48,64]]){let good=0;for(let r=0;r<10;r++){const d=detect(v,{noise:.01});if(JSON.stringify(d)===JSON.stringify(v))good++}if(good<8)nf.push(v.map(name)+':'+good)}t('with room noise ≥8/10',!nf.length,nf.join(' '));
// onsets
function stream(buf,opts={}){const evs=[];const L=new DSP.Listener(SR,Object.assign({onEvent:e=>evs.push(e)},opts));for(let i=0;i<buf.length;i+=1024)L.push(buf.slice(i,i+1024),i/SR);return evs}
const spb=60/66;const pat=[1,1,2,1,1,.5,.5,1,2];let tt=.5;const evts=[];pat.forEach((b,i)=>{evts.push({m:[60,62,64,65,67][i%5],t:tt,d:b*spb*.95});tt+=b*spb});
const buf=render(evts,tt+1,{noise:.003});const ev=stream(buf);const ons=ev.filter(e=>e.type==='onset').map(e=>e.t);
t('onset count = notes',ons.length===evts.length,ons.length+' vs '+evts.length);
const errs=evts.map(e=>{const n=ons.reduce((b,o)=>Math.abs(o-e.t)<Math.abs(b-e.t)?o:b,1e9);return Math.abs(n-e.t)});t('onset timing ≤ 20 ms',Math.max(...errs)<=.02,Math.max(...errs).toFixed(4));
const notes=ev.filter(e=>e.type==='notes');t('pitch after each onset',notes.length===evts.length&&notes.every((n,i)=>n.top===evts[i].m),notes.map(n=>name(n.top)).join(','));
// repeated same note
const rep=render([0,1,2,3].map(i=>({m:64,t:.3+i*.45,d:.4})),2.5);const ro=stream(rep).filter(e=>e.type==='onset');t('repeated same note: 4 onsets',ro.length===4,ro.length);
// long decaying note: no false onsets
const longN=render([{m:48,t:.2,d:2.5}],3);t('one long note = 1 onset',stream(longN).filter(e=>e.type==='onset').length===1);
// chord stream
const cs=render([{m:[60,64,67],t:.3,d:.9},{m:[48,64],t:1.4,d:.9}],2.6);const cn=stream(cs).filter(e=>e.type==='notes');t('chords in stream',cn.length===2&&JSON.stringify(cn[0].midis)==='[60,64,67]'&&JSON.stringify(cn[1].midis)==='[48,64]',JSON.stringify(cn.map(e=>e.midis)));
// rhythm judge from onsets
const J=ctx.judgeOnsets({start:.5,onsets:[0,1,2,3],heard:[.55,1.48,2.7,3.9]});t('judgeOnsets',J.perfect===2&&J.close===1&&J.miss===1,JSON.stringify(J));
// follower: Hot Cross Buns with one wrong note
const hcb=[64,62,60,64,62,60,60,60,62,62,64,62,60].map((m,i)=>({midi:m,beats:[1,1,2,1,1,2,.5,.5,.5,.5,1,1,2][i]}));
const F=ctx.makeFollower(hcb,{octaveFree:false});let b=0;hcb.forEach((s,i)=>{if(i===4)F.feed({t:1+b*.9,midis:[65]});F.feed({t:1+b*.9+(i===8?.1:0),midis:[s.midi]});b+=s.beats});
const st=F.state();t('follower done + 1 mistake + tempo',st.done&&st.mistakes===1&&Math.abs(st.bpm-67)<=3&&st.timing.filter(x=>!x.ok).length===0,JSON.stringify({done:st.done,m:st.mistakes,bpm:st.bpm,bad:st.timing.filter(x=>!x.ok)}));
// follower from audio
const hb=[];b=0;hcb.forEach(s=>{hb.push({m:s.midi,t:.5+b*.6,d:s.beats*.6*.9});b+=s.beats});const ha=render(hb,.5+b*.6+1,{noise:.002});
const F2=ctx.makeFollower(hcb,{octaveFree:false});stream(ha).filter(e=>e.type==='notes').forEach(e=>F2.feed(e));const s2=F2.state();t('follower from synthesized audio',s2.done&&s2.mistakes===0,JSON.stringify({i:s2.index,m:s2.mistakes,bpm:s2.bpm}));
// learning rhythmTap answered from piano onsets
const st2=NQ.learn.place&&NQ.learn.start('r-pulse','practice');if(st2&&st2.ok){const q=st2.question;const sp=60/q.bpm;const r=NQ.learn.answer(st2.roundId,{start:10,onsets:q.onsets.map(o=>10+o*sp+.04)});t('learn rhythm from piano onsets',r.correct===true,JSON.stringify(r.judge))}
// tuning calibration applies to the mic rounding
NQ.settings.set('tuneCents',0);t('follow song helper',NQ.listen.followSong('hcb').expected().midis[0]===64);
// #12 chord play-along: extra wrong notes must not count, through makeFollower (not only verifyNotes)
const CEG=[60,64,67];const chordFrame=play=>{const evs=stream(render([{m:play,t:.3,d:.9}],1.4)).filter(e=>e.type==='notes');return evs[0]};
{let held=0,adv=0,miss=0;for(let r=0;r<10;r++){
  const F=ctx.makeFollower([{midis:CEG,beats:2},{midis:[62],beats:2}],{octaveFree:false});
  const e1=chordFrame([60,64,67,70]);if(e1)F.feed(e1);let s=F.state();if(s.index===0&&s.mistakes===1)held++;
  const e2=chordFrame([60,67]);if(e2)F.feed(e2);s=F.state();if(s.index===0)miss++;
  const e3=chordFrame(CEG);if(e3)F.feed(e3);s=F.state();if(s.index===1&&s.hits[0].verified===true)adv++}
  t('follower: C-E-G + B♭ is not C-E-G (stays, mistake) ≥9/10',held>=9,held+'/10');
  t('follower: C+G (missing E) does not advance ≥9/10',miss>=9,miss+'/10');
  t('follower: then a clean C-E-G advances, verified ≥9/10',adv>=9,adv+'/10')}
{const F=ctx.makeFollower([{midis:CEG},{midis:[62]}],{octaveFree:false});F.feed({t:1,midis:[60,64,67,70]});let s=F.state();
  t('follower without audio: superset refused',s.index===0&&s.mistakes===1,JSON.stringify(s));
  F.feed({t:2,midis:[60,64]});s=F.state();t('follower without audio: subset refused',s.index===0&&s.mistakes===2);
  F.feed({t:3,midis:[60,64,67]});s=F.state();t('follower without audio: exact set advances, verified:false',s.index===1&&s.hits[0].verified===false,JSON.stringify(s.hits));
  const G=ctx.makeFollower([{midis:CEG},{midis:[62]}],{octaveFree:true});G.feed({t:1,midis:[48,52,55]});t('follower without audio: octave-free exact pitch classes',G.state().index===1)}
{let ok2=0;for(let r=0;r<10;r++){const F=ctx.makeFollower([{midis:CEG}],{octaveFree:false,allowExtra:1});const e=chordFrame([60,64,67,70]);if(e)F.feed(e);if(F.state().done)ok2++}
  t('follower allowExtra:1 tolerates one stray note ≥8/10',ok2>=8,ok2+'/10')}

// #13 noise calibration through the real capture path (fake microphone + ScriptProcessor fallback), not just settings
(async()=>{
  let sp=null,connections=0,disconnects=0;
  global.isSecureContext=true;global.document={};
  navigator.mediaDevices={getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})};
  global.AudioContext=class{constructor(){this.sampleRate=SR;this.state='running';this.destination={};this.audioWorklet={addModule:()=>Promise.reject(new Error('no worklet in node'))}}
    resume(){return Promise.resolve()}createMediaStreamSource(){return {connect(){connections++},disconnect(){disconnects++}}}
    createAnalyser(){return {fftSize:2048}}createGain(){return {gain:{value:1},connect(){},disconnect(){}}}
    createScriptProcessor(){sp={connect(){},disconnect(){},onaudioprocess:null};return sp}};
  let clock=0;const play=buf=>{for(let i=0;i<buf.length;i+=2048){const d=buf.slice(i,i+2048);clock+=d.length/SR;sp.onaudioprocess({inputBuffer:{getChannelData:()=>d},playbackTime:clock})}};
  const noise=(amp,n=SR)=>new Float32Array(n).map(()=>(Math.random()*2-1)*amp);
  const square=(v,n=SR)=>new Float32Array(n).map((_,i)=>i%2?v:-v);   // rms is exactly v
  t('measureNoise refuses when not listening',(await NQ.listen.measureNoise(10)).reason==='not-listening');
  t('listen.start with fake mic',await NQ.listen.start({})===true&&NQ.listen.isOn()&&!!sp);
  NQ.settings.set('noiseFloor',0);
  play(noise(.3));let r=await NQ.listen.measureNoise(300);
  t('loud room refused (too-loud) and nothing saved',r.ok===false&&r.reason==='too-loud'&&NQ.listen.settings().noiseFloor===0,JSON.stringify(r));
  play(noise(.003));r=await NQ.listen.measureNoise(300);const q=NQ.listen.settings().noiseFloor;
  t('quiet room accepted and saved',r.ok===true&&q>0&&q<.003&&Math.abs(q-r.floor)<1e-9,JSON.stringify(r));
  t('quiet level persisted in the save',JSON.parse(store['noteQuest.v1']).settings.noiseFloor===q);
  play(noise(.3));r=await NQ.listen.measureNoise(300);
  t('loud room after a good calibration keeps the good level',r.ok===false&&NQ.listen.settings().noiseFloor===q);
  play(square(.0199));r=await NQ.listen.measureNoise(300);t('boundary: rms 0.0199 accepted',r.ok===true&&Math.abs(r.floor-.0199)<1e-4,JSON.stringify(r));
  play(square(.0201));r=await NQ.listen.measureNoise(300);t('boundary: rms 0.0201 refused, level kept',r.ok===false&&Math.abs(NQ.listen.settings().noiseFloor-.0199)<1e-4,JSON.stringify(r));
  NQ.listen.stop();t('stop: not listening, measureNoise refuses',!NQ.listen.isOn()&&(await NQ.listen.measureNoise(10)).reason==='not-listening');
  // The simple single-note mic must stay off if navigation wins the permission race.
  const deferred=[];
  navigator.mediaDevices.getUserMedia=constraints=>new Promise((resolve,reject)=>deferred.push({constraints,resolve,reject}));
  let stopped=0;
  const stream=()=>({getTracks:()=>[{stop(){stopped++}}]});
  const baselineConnections=connections, baselineDisconnects=disconnects;
  const pending=NQ.mic.start(()=>{throw new Error('stale callback')});
  const repeated=NQ.mic.start(()=>{throw new Error('stale repeated callback')});
  t('repeat starts share one permission request',deferred.length===1);
  t('requested unprocessed audio',Object.values(deferred[0].constraints.audio).every(value=>value===false));
  NQ.mic.stop();
  const restarted=NQ.mic.start(()=>{});
  deferred[0].resolve(stream());
  t('stale stream is stopped without connecting',!(await pending)&&!(await repeated)&&stopped===1&&connections===baselineConnections);
  deferred[1].resolve(stream());
  t('new request survives the stale one resolving',await restarted&&NQ.mic.isOn()&&connections===baselineConnections+1);
  NQ.mic.stop();
  t('active stream is disconnected and stopped',!NQ.mic.isOn()&&stopped===2&&disconnects===baselineDisconnects+1);
  const denied=NQ.mic.start(()=>{});
  deferred[2].reject(new Error('denied'));
  t('permission denial leaves mic off',!(await denied)&&!NQ.mic.isOn());
  console.log(`${ok} passed, ${bad} failed`);process.exit(bad?1:0)})();
