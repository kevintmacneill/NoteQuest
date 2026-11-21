// Synthetic piano-like tones for offline listening tests.
const SR=44100;
function midiHz(m,c=0){return 440*Math.pow(2,(m-69)/12+c/1200)}
function tone(buf,m,startSec,durSec,opts={}){const amp=opts.amp||.25,c=opts.cents||0,B=.0003,f0=midiHz(m,c);const s0=Math.round(startSec*SR),n=Math.round(durSec*SR);
  for(let h=1;h<=12;h++){const fh=f0*h*Math.sqrt(1+B*h*h);if(fh>SR/2-500)break;const ah=amp/Math.pow(h,1.1)*(h===1&&m<52?.6:1);const decay=1.2+h*.5+(m-60)*.02;const ph=Math.random()*6.28;
    for(let i=0;i<n&&s0+i<buf.length;i++){const t=i/SR;const env=Math.min(1,t/.004)*Math.exp(-t*decay)*(i>n-800?(n-i)/800:1);buf[s0+i]+=ah*env*Math.sin(2*Math.PI*fh*t+ph)}}
  for(let i=0;i<220&&s0+i<buf.length;i++)buf[s0+i]+=(Math.random()*2-1)*amp*.3*(1-i/220)}
function noise(buf,level){for(let i=0;i<buf.length;i++)buf[i]+=(Math.random()*2-1)*level}
function render(events,totalSec,opts={}){const buf=new Float32Array(Math.round(totalSec*SR));events.forEach(e=>[].concat(e.m).forEach(m=>tone(buf,m,e.t,e.d||.8,{cents:opts.cents||0,amp:e.amp})));if(opts.noise)noise(buf,opts.noise);return buf}
module.exports={SR,tone,noise,render,midiHz};
