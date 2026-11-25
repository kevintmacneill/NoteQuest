// The game's two detectors, copied verbatim from the task brief (no changes). Only the module.exports line is added.
function autoCorrelate(buf,sr){let SIZE=buf.length,rms=0;for(let i=0;i<SIZE;i++)rms+=buf[i]*buf[i];rms=Math.sqrt(rms/SIZE);if(rms<.012)return -1;
  let r1=0,r2=SIZE-1;const th=.2;for(let i=0;i<SIZE/2;i++)if(Math.abs(buf[i])<th){r1=i;break}for(let i=1;i<SIZE/2;i++)if(Math.abs(buf[SIZE-i])<th){r2=SIZE-i;break}
  const b=buf.slice(r1,r2);SIZE=b.length;const c=new Float32Array(SIZE);for(let i=0;i<SIZE;i++)for(let j=0;j<SIZE-i;j++)c[i]+=b[j]*b[j+i];
  let d=0;while(d<SIZE-1&&c[d]>c[d+1])d++;let mv=-1,mp=-1;for(let i=d;i<SIZE;i++)if(c[i]>mv){mv=c[i];mp=i}if(mp<1||mp>=SIZE-1)return -1;
  const x1=c[mp-1],x2=c[mp],x3=c[mp+1],A=(x1+x3-2*x2)/2,B=(x3-x1)/2;const T=A?mp-B/(2*A):mp;return sr/T}

const DSP=(function(){
  const cache={};
  function tw(n){if(cache[n])return cache[n];const c=new Float64Array(n/2),s=new Float64Array(n/2);for(let i=0;i<n/2;i++){c[i]=Math.cos(2*Math.PI*i/n);s[i]=-Math.sin(2*Math.PI*i/n)}const rev=new Uint32Array(n);const bits=Math.log2(n);for(let i=0;i<n;i++){let r=0,x=i;for(let b=0;b<bits;b++){r=(r<<1)|(x&1);x>>=1}rev[i]=r}return cache[n]={c,s,rev}}
  /* magnitude spectrum of real signal x (length ≤ n, zero-padded), n power of 2 */
  function mag(x,n){const {c,s,rev}=tw(n);const re=new Float64Array(n),im=new Float64Array(n);for(let i=0;i<x.length&&i<n;i++)re[rev[i]]=x[i];
    for(let size=2;size<=n;size<<=1){const half=size>>1,step=n/size;for(let i=0;i<n;i+=size)for(let j=0;j<half;j++){const k=j*step,a=i+j,b=a+half;const tr=re[b]*c[k]-im[b]*s[k],ti=re[b]*s[k]+im[b]*c[k];re[b]=re[a]-tr;im[b]=im[a]-ti;re[a]+=tr;im[a]+=ti}}
    const m=new Float64Array(n/2);for(let i=0;i<n/2;i++)m[i]=Math.hypot(re[i],im[i]);return m}
  const hannCache={};function hann(n){if(hannCache[n])return hannCache[n];const w=new Float64Array(n);for(let i=0;i<n;i++)w[i]=.5-.5*Math.cos(2*Math.PI*i/(n-1));return hannCache[n]=w}
  function windowed(x){const w=hann(x.length);const y=new Float64Array(x.length);for(let i=0;i<x.length;i++)y[i]=x[i]*w[i];return y}
  function rms(x){let s=0;for(let i=0;i<x.length;i++)s+=x[i]*x[i];return Math.sqrt(s/x.length)}
  const midiHz=(m,cents=0)=>440*Math.pow(2,(m-69)/12+cents/1200);
  /* spectral peaks with parabolic interpolation: [{f, a}] */
  function peaks(M,sr,n,floorRel=.004){let mx=0;for(let i=1;i<M.length;i++)if(M[i]>mx)mx=M[i];const floor=mx*floorRel;const out=[];
    for(let i=2;i<M.length-2;i++){const v=M[i];if(v>floor&&v>=M[i-1]&&v>M[i+1]){const a=Math.log(M[i-1]+1e-12),b=Math.log(v+1e-12),g=Math.log(M[i+1]+1e-12);const d=(a-2*b+g)?.5*(a-g)/(a-2*b+g):0;out.push({f:(i+d)*sr/n,a:Math.exp(b-.25*(a-g)*d)})}}
    return {list:out,max:mx}}
  const H=8,TOL=.035; /* harmonics considered; ±35 cents window (ratio) */
  function ampNear(pk,f){let best=null;for(const p of pk){if(Math.abs(p.f/f-1)<TOL*(f<200?1.4:1)){if(!best||p.a>best.a)best=p}}return best}
  /* detect up to maxNotes simultaneous notes in a frame of samples */
  function detectNotes(x,sr,opts={}){const lo=opts.lo||36,hi=opts.hi||96,maxNotes=opts.maxNotes||4,cents=opts.cents||0,rel=opts.rel||.22;
    const n=opts.fft||(x.length<=4096?8192:16384);const M=mag(windowed(x),n);const P=peaks(M,sr,n);const pk=P.list.map(p=>({f:p.f,a:p.a}));
    if(!pk.length)return [];const found=[];let first=0;
    for(let it=0;it<maxNotes;it++){let best=null;
      for(let m=lo;m<=hi;m++){if(found.some(f=>f.midi===m))continue;const f0=midiHz(m,cents);const fund=ampNear(pk,f0);if(!fund||fund.a<P.max*.02)continue;
        let s=0;const hs=[];for(let h=1;h<=H;h++){const fh=f0*h*Math.sqrt(1+.0002*h*h);if(fh>sr/2-200)break;const p=ampNear(pk,fh);const a=p?p.a:0;hs.push({p,a});s+=a/Math.pow(h,.55)}
        /* penalise "notes" whose odd harmonics are missing: those are usually an octave of a real lower note */
        if(m>lo+11){const sub=ampNear(pk,f0/2);if(sub&&sub.a>fund.a*.7&&!found.some(f=>f.midi===m-12))s*=.45}
        if(!best||s>best.s)best={midi:m,s,hs}}
      if(!best)break;if(it===0)first=best.s;else if(best.s<first*rel)break;
      found.push({midi:best.midi,salience:it===0?1:best.s/first});
      /* explain away: subtract a spectrally smooth version of this note's harmonics */
      const a=best.hs.map(h=>h.a);best.hs.forEach((h,i)=>{if(!h.p)return;const nb=[a[i-1],a[i+1]].filter(v=>v!=null&&v>0);const smooth=i===0||!nb.length?a[i]:Math.min(a[i],(nb.reduce((x,y)=>x+y,0)/nb.length)*1.15);h.p.a=Math.max(0,h.p.a-smooth)})}
    return found}
  /* verify an EXPECTED set of notes (more reliable than blind detection): each expected note must have its own
     fundamental, and where it coincides with a harmonic of a lower expected note it must stand clearly above that
     note's fitted harmonic envelope. Also reports strong extra notes. */
  function verifyNotes(x,sr,expected,opts={}){const cents=opts.cents||0;const E=[...new Set(expected.map(Number))].sort((a,b)=>a-b);const n=16384;
    const M=mag(windowed(x),n);const P=peaks(M,sr,n);const pk=P.list;const res={ok:false,present:[],missing:[],extra:[]};if(!pk.length){res.missing=E;return res}
    const fq=m=>midiHz(m,cents);const harm=(m,h)=>fq(m)*h*Math.sqrt(1+.0002*h*h);
    const coincides=(f,g)=>Math.abs(f/g-1)<TOL;
    function envelope(L,h){const pts=[];for(let k=1;k<=H;k++){const f=harm(L,k);if(f>sr/2-200)break;const clean=!E.some(o=>o!==L&&Array.from({length:H},(_,j)=>harm(o,j+1)).some(g=>coincides(f,g)));
        if(!clean)continue;const p=ampNear(pk,f);if(p)pts.push([Math.log(k),Math.log(p.a)])}
      const a1=ampNear(pk,fq(L));if(pts.length<2)return a1?a1.a/h:0;let sx=0,sy=0,sxx=0,sxy=0;pts.forEach(([u,v])=>{sx+=u;sy+=v;sxx+=u*u;sxy+=u*v});const m=pts.length,den=m*sxx-sx*sx;
      const slope=den?(m*sxy-sx*sy)/den:-1;const icpt=(sy-slope*sx)/m;return Math.exp(icpt+Math.min(-.3,slope)*Math.log(h))}
    E.forEach(e=>{const f0=fq(e);const fund=ampNear(pk,f0);if(!fund||fund.a<P.max*.012){res.missing.push(e);return}
      /* compare this note's first harmonics with what lower expected notes alone would put there (sums average out phase effects) */
      let obs=0,est=0,cleanHits=0,cleanTotal=0;
      for(let j=1;j<=4;j++){const f=harm(e,j);if(f>sr/2-200)break;let low=0;E.forEach(L=>{if(L>=e)return;const h=Math.round(f/fq(L));if(h>=1&&coincides(harm(L,h),f))low+=h<=H?envelope(L,h):0});
        const p=ampNear(pk,f);const a=p?p.a:0;if(low>0){obs+=a;est+=low}else{cleanTotal++;if(a>P.max*.004)cleanHits++}}
      /* a fundamental that no lower expected note explains is enough on its own; the comparison matters for octaves and twelfths */
      const fundClean=!E.some(L=>L<e&&(()=>{const h=Math.round(f0/fq(L));return h>=1&&coincides(harm(L,h),f0)})());
      const present=fundClean||est===0||obs>=1.35*est||(cleanHits>=1&&obs>=1.1*est);
      if(present)res.present.push(e);else res.missing.push(e)});
    const blind=detectNotes(x,sr,{cents,maxNotes:5});res.extra=blind.filter(b=>b.salience>=.4&&!E.some(e=>e===b.midi||(e%12===b.midi%12&&Math.abs(e-b.midi)===12&&E.includes(b.midi-12)))).map(b=>b.midi).filter(b=>!E.includes(b));
    res.ok=!res.missing.length&&res.extra.length<=(opts.allowExtra||0);return res}
  /* cents offset of the strongest note's fundamental from equal temperament */
  function centsOf(x,sr,midi){const n=16384;const M=mag(windowed(x),n);const P=peaks(M,sr,n);const f0=midiHz(midi);const p=ampNear(P.list,f0);if(!p)return null;return 1200*Math.log2(p.f/f0)}
  /* streaming analyser: push raw audio, get onset and note events with audio-clock times */
  class Listener{
    constructor(sr,opts={}){this.sr=sr;this.opts=opts;this.win=2048;this.hop=Math.round(sr*.01);this.ring=new Float32Array(1<<17);this.mask=this.ring.length-1;this.n=0;this.t0=null;
      this.next=this.win;this.prevL=null;this.flux=[];this.lastOn=-1e9;this.pending=[];this.gate=opts.gate||.006;this.fluxMin=opts.fluxMin||25;this.events=[];this.cents=opts.cents||0;this.onEvent=opts.onEvent||null;this.muteUntil=0;this.pitchLen=Math.min(8192,1<<Math.round(Math.log2(sr*.17)))}
    time(i){return this.t0+i/this.sr}
    slice(a,len){const out=new Float32Array(len);for(let i=0;i<len;i++)out[i]=this.ring[(a+i)&this.mask];return out}
    push(chunk,t0){if(this.t0===null)this.t0=t0-this.n/this.sr;for(let i=0;i<chunk.length;i++)this.ring[(this.n+i)&this.mask]=chunk[i];this.n+=chunk.length;
      while(this.next<=this.n){this.frame(this.next);this.next+=this.hop}
      while(this.pending.length&&this.pending[0].ready<=this.n){const p=this.pending.shift();this.pitch(p)}}
    frame(end){const x=this.slice(end-this.win,this.win);const r=rms(x);const M=mag(windowed(x),this.win);const kmax=Math.min(M.length,Math.round(5000*this.win/this.sr));
      const L=new Float64Array(kmax);let f=0;for(let k=1;k<kmax;k++){L[k]=Math.log(1+100*M[k]);if(this.prevL){const d=L[k]-this.prevL[k];if(d>0)f+=d}}this.prevL=L;
      this.flux.push({f,r,end});if(this.flux.length>40)this.flux.shift();const F=this.flux,k=F.length-2;if(k<3)return;
      const c=F[k];const isPeak=c.f>F[k-1].f&&c.f>=F[k+1].f;const hist=F.slice(Math.max(0,k-12),k-1).map(e=>e.f);const mean=hist.length?hist.reduce((a,b)=>a+b,0)/hist.length:0;
      const before=F[Math.max(0,k-3)].r;const rising=Math.max(c.r,F[k+1].r)>before*1.15+this.gate*.5;
      if(isPeak&&rising&&c.f>Math.max(this.fluxMin,mean*2.5)&&(c.r>this.gate||F[k+1].r>this.gate)){const on=this.refine(c.end);const t=this.time(on);
        if(t-this.lastOn>.06){this.lastOn=t;if(t>=this.muteUntil){const ev={type:'onset',t};this.emit(ev);this.pending.push({at:on,t,ready:on+Math.round(this.sr*.02)+this.pitchLen})}}}}
    refine(end){const b=128;let best=end-this.win,bestR=0;let prev=null;for(let s=end-this.win;s+b<=end;s+=b){const e=rms(this.slice(s,b))+1e-6;if(prev!=null){const r=e/prev;if(r>bestR){bestR=r;best=s}}prev=e}return best}
    pitch(p){const x=this.slice(p.at+Math.round(this.sr*.02),this.pitchLen);if(rms(x)<this.gate*.6)return;const notes=detectNotes(x,this.sr,{cents:this.cents,maxNotes:this.opts.maxNotes||4});
      if(!notes.length)return;const cents=centsOf(x,this.sr,notes[0].midi);const ev={type:'notes',t:p.t,notes,top:notes[0].midi,midis:notes.map(n=>n.midi).sort((a,b)=>a-b),cents};Object.defineProperty(ev,'frame',{value:x,enumerable:false});Object.defineProperty(ev,'sr',{value:this.sr,enumerable:false});this.emit(ev)}
    emit(ev){this.events.push(ev);if(this.events.length>200)this.events.shift();if(this.onEvent)this.onEvent(ev)}
  }
  return {mag,peaks,detectNotes,verifyNotes,centsOf,rms,midiHz,Listener}
})();
module.exports={autoCorrelate,DSP};
