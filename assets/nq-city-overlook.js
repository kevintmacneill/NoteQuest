/* City overlook presentation; no engine/save mutation. */
(function(){'use strict';
function setText(id,value){var x=document.getElementById(id);if(x)x.textContent=String(value==null?'':value)}
/* Tap-a-building village (M5, owner 2026-11-26). The first tap previews a building, then Visit
   or a second tap enters; tapping away or Esc dismisses. Polygons use the approved city
   layer's own pixels (2172×724), so they line up at every size. Live: Adventure Gate, Music
   Academy, Music Library, Companion Sanctuary (with Hospital Bay). Others: Coming soon. */
var BUILDINGS=[
 {id:'trophies',cls:'nq-city-trophies',icon:'🏆',name:'Sticker & Trophy House',invite:'Your stickers, trophies and Golden Encore seals will live here.',
  polygon:'305,265 305,217 333,187 375,165 388,147 401,165 425,185 442,208 438,265'},
 {id:'sanctuary',cls:'nq-city-sanctuary',icon:'🐾',name:'Companion Sanctuary',invite:'Visit your animal friends, or check on anyone who needs care.',
  doors:[{label:'Visit the pen',go:'sanctuary'},{label:'Visit Hospital Bay',go:'sanctuary|hospital'}],
  polygon:'55,420 55,370 105,360 115,310 180,290 242,276 290,300 315,330 300,345 300,365 350,368 352,405 300,410 200,412 120,415'},
 {id:'market',cls:'nq-city-market',icon:'🧺',name:'Marketplace',invite:'Spend your coins on clothes, accessories and animal supplies.',
  polygon:'292,562 292,455 315,438 315,397 337,397 337,425 387,400 452,450 495,452 497,488 512,488 520,472 640,475 642,500 645,562'},
 {id:'academy',cls:'nq-city-academy',icon:'🎼',name:'Music Academy',invite:'Lessons and skill checks for your piano journey.',
  doors:[{label:'Visit',go:'lessonIndex'}],
  polygon:'487,445 487,350 510,335 528,330 528,262 539,252 552,262 552,300 570,272 640,248 680,236 700,248 760,282 788,300 790,262 797,252 805,262 805,335 830,350 925,353 925,445'},
 {id:'gate',cls:'nq-city-gate',icon:'✨',name:'Adventure Gate',invite:'Step through to continue your adventure.',
  doors:[{label:'Visit',go:'continueAdventure'}],
  polygon:'907,450 907,292 930,262 955,292 985,292 987,262 1007,242 1012,175 1022,142 1040,152 1077,30 1117,152 1132,142 1145,175 1162,242 1180,262 1182,292 1210,292 1235,262 1257,292 1257,450'},
 {id:'practice',cls:'nq-city-practice',icon:'🎹',name:'Practice Hall',invite:'Practice games to warm up your fingers and ears.',
  polygon:'1335,455 1335,345 1357,318 1357,287 1370,267 1382,287 1382,300 1440,250 1520,280 1570,300 1570,267 1585,240 1600,267 1600,312 1635,325 1610,352 1660,352 1695,382 1690,440 1600,452'},
 {id:'library',cls:'nq-city-library',icon:'📚',name:'Music Library',invite:'Look up notes, rhythms and music words any time.',
  doors:[{label:'Visit',href:'./reference.html'}],
  polygon:'1655,578 1655,452 1632,450 1650,425 1705,412 1760,370 1790,357 1850,368 1925,392 1927,322 1955,315 1982,322 1982,395 2010,400 2065,445 2045,450 2045,540 1880,578'},
 {id:'explorer',cls:'nq-city-explorer',icon:'🧭',name:"Explorer's Outpost",invite:'Rescue expeditions and discoveries are on the way.',
  polygon:'1930,225 1932,175 1937,147 1958,140 1958,98 2018,108 2020,145 2025,88 2072,95 2072,118 2028,118 2048,147 2048,175 2085,200 2087,225'}
];
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function mount(root,o){
 var p=o.profile;
 root.innerHTML=[
 '<section class="nq-village nq-city" aria-label="Your musical city">',
 '<header class="nq-city-header"><div class="nq-city-logo"><img src="assets/notequest-logo-icon.svg" alt="" width="40" height="40"><span><strong>NoteQuest</strong><small>A Musical Adventure</small></span></div>',
 '<div class="nq-city-account"><span>⭐ <b id="nq-village-stars"></b> · 🪙 <b id="coinBadge"></b></span><button type="button" class="nq-village-profile" id="nq-village-player" data-go="profiles"></button><button type="button" data-go="parentGate" aria-label="Grown-up Settings, hold required">⚙️</button></div></header>',
 '<h1 class="nq-city-welcome" id="nq-menu-title"></h1>',
 '<section class="nq-city-scene"><nav class="nq-city-panbar" aria-label="Explore the city"><button type="button" data-pan="-1">← Explore left</button><button type="button" data-pan="0">Learning district</button><button type="button" data-pan="1">Explore right →</button></nav>',
 '<div class="nq-city-stage"><div class="nq-city-viewport" tabindex="0" role="region" aria-label="Panoramic musical city. Swipe, drag, or use the Explore buttons to see more.">',
 '<div class="nq-city-track"><img class="nq-city-art nq-village-art" src="assets/nq-city-overlook-v1.avif" alt="" width="1000" height="333">',
 '<svg class="nq-city-hotspots" viewBox="0 0 2172 724" preserveAspectRatio="none" role="group" aria-label="Buildings">',
 // Glow + gentle lift (owner 2026-11-26): the chosen building is a copy of the city layer cut
 // along its outline, raised a little with a gold edge glow. Separately painted building
 // layers will replace these cut-outs.
 '<defs>'+BUILDINGS.map(function(b){return '<clipPath id="nq-clip-'+b.id+'"><polygon points="'+b.polygon+'"/></clipPath>'}).join('')+'</defs>',
 BUILDINGS.map(function(b){return '<g class="nq-city-bld"><g class="nq-city-lift"><g clip-path="url(#nq-clip-'+b.id+')"><image href="assets/nq-overlook-city-v2.webp" width="2172" height="724" preserveAspectRatio="none"/></g></g>'+
  '<polygon data-building="'+b.id+'" points="'+b.polygon+'" role="button" tabindex="0" aria-label="'+esc(b.name)+'" aria-expanded="false" aria-controls="nq-city-preview"></polygon></g>'}).join(''),
 '</svg>',
 BUILDINGS.map(function(b){return '<button type="button" class="nq-city-pin '+b.cls+(b.doors?'':' nq-city-soon')+'" data-building="'+b.id+'" aria-expanded="false" aria-controls="nq-city-preview"><span aria-hidden="true">'+b.icon+'</span> <span>'+esc(b.name)+'</span></button>'}).join(''),
 '</div></div>',
 '<div class="nq-city-preview" id="nq-city-preview" role="region" aria-live="polite" hidden></div></div>',
 '<div class="nq-city-hintrow"><p class="nq-city-hint">Tap a building to peek inside. Swipe to explore.</p>',
 '<details class="nq-city-places"><summary>All places</summary><ul>',
 BUILDINGS.map(function(b){return '<li><button type="button" data-building="'+b.id+'"><span aria-hidden="true">'+b.icon+'</span> '+esc(b.name)+(b.doors?'':' <small>(coming soon)</small>')+'</button></li>'}).join(''),
 '</ul></details></div></section>',
 '<nav class="nq-city-learning" aria-label="Piano learning">',
 '<button type="button" class="nq-menu-primary nq-village-continue nq-city-primary" data-go="continueAdventure">▶ Continue Adventure</button>',
 '<button type="button" data-go="nqwHub">🗺️ My Journey</button>',
 '<button type="button" data-go="lessonIndex">🎼 Lessons</button>',
 '<a href="./reference.html">📚 Music Library</a></nav>',
 '<nav class="nq-city-utility" aria-label="Learner options">',
 o.placementActive?'<button type="button" data-go="placement">Resume placement</button>':
 o.placementPending?'<button type="button" data-go="placement">Choose where to start</button>':'',
 '<button type="button" data-go="progress">📊 My Music Progress</button><button type="button" data-go="sanctuary">🐾 Companion Sanctuary</button><button type="button" data-go="sanctuary|hospital"><span aria-hidden="true">✚</span> Hospital Bay</button></nav>',
 '</section>'
 ].join('');
 setText('nq-menu-title','Ready to play, '+p.name+'?');setText('nq-village-player',(p.avatar||'')+' '+p.name+' ▾');
 setText('coinBadge',p.coins||0);setText('nq-village-stars',o.stars);
 root.querySelector('.nq-village-profile').setAttribute('aria-label','Switch learner. Current player: '+p.name);
 var view=root.querySelector('.nq-city-viewport'),frame=root.querySelector('.nq-city-scene'),art=root.querySelector('.nq-city-art'),track=root.querySelector('.nq-city-track');
 var disposed=false,startX=null,startScroll=0,wasDrag=false;
 var preview=root.querySelector('.nq-city-preview'),selected=null,lastTrigger=null;
 // The building's own control: its painted shape when the layers are showing, else its label.
 function control(id){
  var layered=view.classList.contains('nq-city-viewport--layered');
  return root.querySelector((layered?'.nq-city-hotspots polygon':'.nq-city-pin')+'[data-building="'+id+'"]');
 }
 function building(id){for(var i=0;i<BUILDINGS.length;i++)if(BUILDINGS[i].id===id)return BUILDINGS[i];return null}
 function mark(id){
  root.querySelectorAll('.nq-city-track [data-building]').forEach(function(el){
   var on=el.dataset.building===id;el.classList.toggle('nq-city-selected',on);
   var group=el.closest('.nq-city-bld');if(group)group.classList.toggle('nq-city-selected',on);
   if(el.tagName==='BUTTON'||el.getAttribute('role')==='button')el.setAttribute('aria-expanded',String(on));
  });
 }
 function dismiss(restore){
  if(!selected)return;
  selected=null;mark(null);preview.hidden=true;preview.innerHTML='';
  if(restore&&lastTrigger&&lastTrigger.isConnected)lastTrigger.focus({preventScroll:true});
 }
 function show(id,trigger){
  var b=building(id);if(!b)return;
  if(selected===id&&b.doors&&b.doors.length){enter(b.doors[0]);return}   // second tap enters the main (first) door
  selected=id;lastTrigger=trigger&&(trigger.tagName==='BUTTON'||trigger.getAttribute('role')==='button')&&!trigger.closest('.nq-city-places')?trigger:control(id);
  mark(id);
  var doors=b.doors?b.doors.map(function(d,i){
   var cls='nq-city-door'+(i===0?' nq-city-door-main':'');
   var label=d.label==='Visit'?'Visit '+b.name:d.label;
   return d.href?'<a class="'+cls+'" href="'+d.href+'">'+esc(label)+'</a>':'<button type="button" class="'+cls+'" data-go="'+d.go+'">'+esc(label)+'</button>';
  }).join(''):'<p class="nq-city-soon-note">Coming soon! This building is still being built.</p>';
  preview.innerHTML='<h2 id="nq-city-preview-title"><span aria-hidden="true">'+b.icon+'</span> '+esc(b.name)+'</h2><p>'+esc(b.invite)+'</p><div class="nq-city-doors">'+doors+
   '</div><button type="button" class="nq-city-close" aria-label="Close">✕</button>';
  preview.setAttribute('aria-labelledby','nq-city-preview-title');
  preview.hidden=false;
  var first=preview.querySelector('.nq-city-door')||preview.querySelector('.nq-city-close');
  if(trigger&&trigger.closest('.nq-city-places'))first.focus({preventScroll:true});
  var own=control(id);
  if(own&&trigger&&trigger.closest('.nq-city-places'))own.scrollIntoView({block:'nearest',inline:'center'});
 }
 function enter(door){
  var el=preview.querySelector(door.href?'a.nq-city-door':'[data-go="'+door.go+'"]');
  if(el)el.click();
 }
 var stopLayers=window.NoteQuestCityParallax?.mount(track,view);
 function center(){if(!disposed)view.scrollLeft=(view.scrollWidth-view.clientWidth)/2}
 var frameId=requestAnimationFrame(center);
 function pan(dir){var amount=Math.max(260,view.clientWidth*.82);var x=dir===0?(view.scrollWidth-view.clientWidth)/2:view.scrollLeft+dir*amount;view.scrollTo({left:x,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
 function onClick(e){
  var b=e.target.closest('[data-pan]');if(b){e.preventDefault();pan(Number(b.dataset.pan));return}
  if(wasDrag){wasDrag=false;return}                      // a drag to explore is not a tap
  if(e.target.closest('.nq-city-close')){dismiss(true);return}
  var hit=e.target.closest('[data-building]');
  if(hit){e.preventDefault();show(hit.dataset.building,hit);return}
  if(selected&&e.target.closest('.nq-city-viewport'))dismiss(false);   // tap away
 }
 function onKey(e){
  if(e.key==='Escape'&&selected){e.preventDefault();dismiss(true);return}
  var shape=e.target.closest&&e.target.closest('.nq-city-hotspots [data-building]');
  if(shape&&(e.key==='Enter'||e.key===' ')){e.preventDefault();show(shape.dataset.building,shape);return}
  if(e.target!==view)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='Home'){e.preventDefault();pan(e.key==='Home'?0:e.key==='ArrowLeft'?-1:1)}}
 // Mouse drag pans. Capture only once it's really a drag, so a plain click still reaches the
 // building shape under the pointer.
 function onDown(e){if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('a,button'))return;startX=e.clientX;startScroll=view.scrollLeft;wasDrag=false}
 function onMove(e){if(startX===null)return;if(!wasDrag&&Math.abs(e.clientX-startX)>6){wasDrag=true;try{view.setPointerCapture(e.pointerId)}catch(_){}}if(wasDrag)view.scrollLeft=startScroll+startX-e.clientX}
 function onUp(){startX=null}
 function onCancel(){startX=null;wasDrag=false}
 function onError(){track.classList.add('nq-city-art-fallback');art.hidden=true}
 frame.addEventListener('click',onClick);view.addEventListener('pointerdown',onDown);view.addEventListener('pointermove',onMove);view.addEventListener('pointerup',onUp);view.addEventListener('pointercancel',onCancel);art.addEventListener('error',onError);root.addEventListener('keydown',onKey);
 return function(){disposed=true;stopLayers?.();cancelAnimationFrame(frameId);frame.removeEventListener('click',onClick);view.removeEventListener('pointerdown',onDown);view.removeEventListener('pointermove',onMove);view.removeEventListener('pointerup',onUp);view.removeEventListener('pointercancel',onCancel);art.removeEventListener('error',onError);root.removeEventListener('keydown',onKey)}
}
window.NoteQuestCity={mount:mount,buildings:BUILDINGS};
})();
