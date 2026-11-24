/* Title vista. The painted picture includes the wordmark and subtitle.
   Loading and Tap to Play are rendered separately.
   Copies: assets/nq-opening-640.webp, nq-opening-1024.webp, nq-opening-1672.webp
   from coordination/design/reference/notequest-opening-screen-concept-v1.png. */
(function(){'use strict';
var ART_W=1672,ART_H=941,WIDTHS=[640,1024,1672];
function mount(){
 var app=document.getElementById('app');if(!app)return;
 document.body.classList.add('nq-menu-ready');
 if(window.NoteQuestResumeReference?.())return;
 var screen=document.createElement('section');
 screen.className='nq-launch';
 screen.setAttribute('role','dialog');
 screen.setAttribute('aria-modal','true');
 screen.setAttribute('aria-label','Welcome to NoteQuest');
 screen.setAttribute('aria-busy','true');
 screen.tabIndex=-1;
 screen.innerHTML=''
  +'<div class="nq-launch-fade">'
  +'<div class="nq-launch-vista" hidden><img class="nq-launch-art" alt=""></div>'
  +'<div class="nq-launch-stack">'
  +'<div class="nq-launch-brand"><img class="nq-launch-logo" src="assets/notequest-logo-icon.svg" alt="" width="180" height="180"><h1 class="nq-launch-title">NoteQuest</h1><p class="nq-launch-subtitle">A Musical Adventure</p></div>'
  +'<div class="nq-launch-dock"><p class="nq-launch-loading" id="nq-launch-loading">Loading Your Adventure…</p>'
  +'<div class="nq-launch-meter" role="progressbar" aria-labelledby="nq-launch-loading" aria-valuemin="0" aria-valuemax="100"><span class="nq-launch-meter-fill"></span></div>'
  +'<button class="nq-launch-start" type="button" hidden>Tap to Play</button></div></div></div>'
  +'<button class="nq-launch-skip" type="button" hidden>Skip</button>';
 document.body.append(screen);
 var fade=screen.querySelector('.nq-launch-fade');
 var vista=screen.querySelector('.nq-launch-vista');
 var art=screen.querySelector('.nq-launch-art');
 var stack=screen.querySelector('.nq-launch-stack');
 var loading=screen.querySelector('.nq-launch-loading');
 var meter=screen.querySelector('.nq-launch-meter');
 var fill=screen.querySelector('.nq-launch-meter-fill');
 var start=screen.querySelector('.nq-launch-start');
 var skip=screen.querySelector('.nq-launch-skip');
 var state={image:0,known:false,fonts:0,ok:false,picture:false,ready:false};
 var gone=false,entered=false;
 var openingController=new AbortController();
 function artRect(){
  var vw=window.innerWidth,vh=window.innerHeight;
  var scale=Math.min(vw/ART_W,vh/ART_H);
  var w=ART_W*scale,h=ART_H*scale;
  return {left:(vw-w)/2,top:(vh-h)/2,width:w,height:h};
 }
 function place(){
  var r=artRect();
  vista.style.left=r.left+'px';
  vista.style.top=r.top+'px';
  vista.style.width=r.width+'px';
  vista.style.height=r.height+'px';
  if(!screen.classList.contains('nq-launch-has-art')){
   stack.style.left='';stack.style.top='';stack.style.width='';
   return;
  }
  var roomBelow=window.innerHeight-(r.top+r.height);
  var below=roomBelow>150;
  var dockW=below?Math.min(460,window.innerWidth-32):Math.max(240,Math.min(r.width*0.5,640));
  stack.style.width=dockW+'px';
  var halfW=dockW/2,halfH=(stack.offsetHeight||96)/2;
  var cx=r.left+r.width*0.5,cy=r.top+r.height*0.585;
  if(below){
   cx=window.innerWidth/2;
   cy=Math.min(window.innerHeight-12-halfH, r.top+r.height+10+halfH);
  }
  var margin=12;
  cx=Math.min(window.innerWidth-margin-halfW,Math.max(margin+halfW,cx));
  cy=Math.min(window.innerHeight-margin-halfH,Math.max(margin+halfH,cy));
  stack.style.left=cx+'px';
  stack.style.top=cy+'px';
 }
 function percent(){
  return Math.max(0,Math.min(100,Math.round(state.image*85+state.fonts*15)));
 }
 function paint(){
  if(gone||state.ready)return;
  if(!state.known&&state.image<1){
   meter.removeAttribute('aria-valuenow');
   fill.style.width='0%';
  }else{
   var pct=percent();
   meter.setAttribute('aria-valuenow',String(pct));
   fill.style.width=pct+'%';
  }
 }
 function showReady(){
  if(state.ready||gone)return;
  state.ready=true;
  loading.hidden=true;
  meter.hidden=true;
  start.hidden=false;
  screen.setAttribute('aria-busy','false');
  if(state.ok)place();
  start.focus({preventScroll:true});
 }
 function reveal(){
  if(gone||!state.ok)return;
  screen.classList.add('nq-launch-has-art');
  vista.hidden=false;
  place();
 }
 function finish(){
  if(gone)return;
  gone=true;
  if(screen.isConnected)screen.remove();
  // querySelector('.primary,.pcard,button') picks the FIRST DOM match,
  // not the first selector's priority. In the city that would pick learner switch.
  // Explicit fallback order keeps Continue Adventure as the keyboard entry point.
  var first=app.querySelector('.nq-village-continue')
    ||app.querySelector('.nq-menu-primary')
    ||app.querySelector('.pcard')
    ||app.querySelector('.tile.add')
    ||app.querySelector('button');
  if(first)first.focus({preventScroll:true});
 }
 function play(){
  if(entered||!state.ready||gone)return;
  entered=true;
  start.disabled=true;
  if(typeof window.NoteQuestEnter==='function'){
   try{window.NoteQuestEnter()}catch(err){}
  }
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce||!state.ok){finish();return}
  screen.classList.add('is-leaving');
  skip.hidden=false;
  skip.focus({preventScroll:true});
  var done=false;
  function finishOnce(){
   if(done)return;
   done=true;
   finish();
  }
  // Approved four-second journey: hold vista 0–1s, push in 1–3.2s,
  // softly reveal the city during 3.2–4s. Skip and reduced motion bypass it.
  fade.addEventListener('animationend',function(e){
   if(e.target===fade&&e.animationName==='nq-village-reveal')finishOnce();
  });
  // Fail safe for suspended/unsupported CSS animation; only one entrance.
  window.setTimeout(finishOnce,4500);
 }
 function openingURL(){
  var r=artRect();
  var target=Math.max(1,Math.ceil(r.width*(window.devicePixelRatio||1)));
  var chosen=WIDTHS[WIDTHS.length-1];
  for(var i=0;i<WIDTHS.length;i++){if(WIDTHS[i]>=target){chosen=WIDTHS[i];break}}
  return 'assets/nq-opening-'+chosen+'.webp';
 }
 function whenFonts(){
  if(!document.fonts||!document.fonts.ready)return Promise.resolve();
  return document.fonts.ready.then(function(){},function(){});
 }
 function noteBytes(ratio,known){
  if(gone||state.ready)return;
  state.known=!!known;
  if(known)state.image=Math.max(0,Math.min(1,ratio));
  paint();
 }
 function decodeBlob(blob){
  return new Promise(function(resolve,reject){
   var url=URL.createObjectURL(blob);
   art.onload=function(){URL.revokeObjectURL(url);resolve()};
   art.onerror=function(){URL.revokeObjectURL(url);reject(new Error('picture'))};
   art.src=url;
  });
 }
 function loadOpening(){
  return fetch(openingURL(),{signal:openingController.signal}).then(function(res){
   if(!res.ok)throw new Error('picture');
   if(!res.body||typeof res.body.getReader!=='function'){
    return res.blob().then(function(blob){noteBytes(1,true);return blob});
   }
   var total=+res.headers.get('content-length')||0;
   var reader=res.body.getReader();
   var chunks=[],loaded=0;
   function pump(){
    return reader.read().then(function(step){
     if(step.done)return new Blob(chunks,{type:res.headers.get('content-type')||'image/webp'});
     chunks.push(step.value);
     loaded+=step.value.byteLength;
     if(total>0)noteBytes(loaded/total,true);
     else noteBytes(0,false);
     return pump();
    });
   }
   return pump();
  }).then(decodeBlob);
 }
 start.addEventListener('click',play);
 skip.addEventListener('click',function(){if(entered)finish()});
 document.addEventListener('keydown',function trap(e){
  if(!screen.isConnected){document.removeEventListener('keydown',trap);return}
  if(e.key==='Escape'){
   e.preventDefault();
   if(entered)finish();
   else if(state.ready)play();
   return;
  }
  if(e.key==='Tab'){
   e.preventDefault();
   if(entered&&!skip.hidden)skip.focus();
   else if(state.ready)start.focus();
   else screen.focus();
  }
 },{passive:false});
 window.addEventListener('resize',function(){if(!gone)place()});
 screen.focus({preventScroll:true});
 place();
 var picture=loadOpening().then(function(){if(state.ready)return;state.ok=true;state.picture=true;state.image=1;state.known=true;reveal();paint()}).catch(function(){if(state.ready)return;state.ok=false;state.picture=true;state.image=1;state.known=true;paint()});
 var fonts=whenFonts().then(function(){state.fonts=1;paint()});
 var loadDeadline=window.setTimeout(function(){
  openingController.abort();
  showReady();
 },8000);
 Promise.all([picture,fonts]).then(function(){
  window.clearTimeout(loadDeadline);
  showReady();
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
