/* City overlook presentation; no engine/save mutation. */
(function(){'use strict';
function setText(id,value){var x=document.getElementById(id);if(x)x.textContent=String(value==null?'':value)}
function mount(root,o){
 var p=o.profile,pet=o.pet;
 root.innerHTML=[
 '<section class="nq-village nq-city" aria-label="Your musical city">',
 '<header class="nq-city-header"><div class="nq-city-logo"><img src="assets/notequest-logo-icon.svg" alt="" width="40" height="40"><span><strong>NoteQuest</strong><small>A Musical Adventure</small></span></div>',
 '<div class="nq-city-account"><span>⭐ <b id="nq-village-stars"></b> · 🪙 <b id="coinBadge"></b></span><button type="button" class="nq-village-profile" id="nq-village-player" data-go="profiles"></button><button type="button" data-go="parentGate" aria-label="Grown-up Settings, hold required">⚙️</button></div></header>',
 '<h1 class="nq-city-welcome" id="nq-menu-title"></h1>',
 '<section class="nq-city-scene"><nav class="nq-city-panbar" aria-label="Explore the city"><button type="button" data-pan="-1">← Explore left</button><button type="button" data-pan="0">Learning district</button><button type="button" data-pan="1">Explore right →</button></nav>',
 '<div class="nq-city-viewport" tabindex="0" role="region" aria-label="Panoramic musical city. Swipe, drag, or use the Explore buttons to see more.">',
 '<div class="nq-city-track"><img class="nq-city-art nq-village-art" src="assets/nq-city-overlook-v1.avif" alt="" width="1000" height="333">',
 '<button type="button" class="nq-city-pin nq-city-sanctuary" data-go="home">🐾 <span>Companion Sanctuary</span></button>',
 '<button type="button" class="nq-city-pin nq-city-explorer" data-go="map">🧭 <span>Explorer Outpost</span></button>',
 '<button type="button" class="nq-city-pin nq-city-academy" data-go="lessonIndex">🎼 <span>Music Academy</span></button>',
 '<button type="button" class="nq-city-pin nq-city-gate" data-go="continueAdventure">✨ <span>Adventure Gate</span></button>',
 '<a class="nq-city-pin nq-city-library" href="./reference.html">📚 <span>Music Library</span></a>',
 '<button type="button" class="nq-city-pin nq-city-practice" data-go="games">🎹 <span>Practice Hall</span></button>',
 '<button type="button" class="nq-city-pin nq-city-market" data-go="shop">🪙 <span>Marketplace</span></button>',
 '<button type="button" class="nq-city-pin nq-city-trophies" data-go="stickers|menu">🏆 <span>Sticker &amp; Trophy House</span></button>',
 '</div></div><p class="nq-city-hint">Swipe sideways to explore. Your piano learning is always close by.</p></section>',
 '<nav class="nq-city-learning" aria-label="Piano learning">',
 '<button type="button" class="nq-menu-primary nq-village-continue nq-city-primary" data-go="continueAdventure">▶ Continue Adventure</button>',
 '<button type="button" data-go="nqwHub">🗺️ My Journey</button>',
 '<button type="button" data-go="lessonIndex">🎼 Lessons</button>',
 '<button type="button" class="nq-menu-card" data-go="games">🎹 Practice Games</button>',
 '<a href="./reference.html">📚 Music Library</a></nav>',
 '<nav class="nq-city-utility" aria-label="Personal progress and companions"><button type="button" data-go="progress">📊 My Music Progress</button><button type="button" data-go="home" id="nq-menu-pet"></button></nav>',
 '<details class="nq-city-other"><summary>Other places to explore</summary><nav aria-label="Other destinations"><button data-go="home">Companion Sanctuary</button><button data-go="map">Explorer Outpost</button><button data-go="shop">Marketplace</button><button data-go="stickers|menu">Sticker Book</button></nav></details>',
 '</section>'
 ].join('');
 setText('nq-menu-title','Ready to play, '+p.name+'?');setText('nq-village-player',(p.avatar||'')+' '+p.name+' ▾');
 setText('coinBadge',p.coins||0);setText('nq-village-stars',o.stars);
 setText('nq-menu-pet',pet?'🐾 Visit '+pet.name:'🐾 Pet Home');
 root.querySelector('.nq-village-profile').setAttribute('aria-label','Switch learner. Current player: '+p.name);
 var view=root.querySelector('.nq-city-viewport'),frame=root.querySelector('.nq-city-scene'),art=root.querySelector('.nq-city-art'),track=root.querySelector('.nq-city-track');
 var disposed=false,startX=null,startScroll=0,wasDrag=false;
 function center(){if(!disposed)view.scrollLeft=(view.scrollWidth-view.clientWidth)/2}
 var frameId=requestAnimationFrame(center);
 function pan(dir){var amount=Math.max(260,view.clientWidth*.82);var x=dir===0?(view.scrollWidth-view.clientWidth)/2:view.scrollLeft+dir*amount;view.scrollTo({left:x,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
 function onClick(e){var b=e.target.closest('[data-pan]');if(b){e.preventDefault();pan(Number(b.dataset.pan))}}
 function onKey(e){if(e.target!==view)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='Home'){e.preventDefault();pan(e.key==='Home'?0:e.key==='ArrowLeft'?-1:1)}}
 function onDown(e){if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('a,button'))return;startX=e.clientX;startScroll=view.scrollLeft;wasDrag=false;view.setPointerCapture(e.pointerId)}
 function onMove(e){if(startX===null)return;if(Math.abs(e.clientX-startX)>6)wasDrag=true;if(wasDrag)view.scrollLeft=startScroll+startX-e.clientX}
 function onUp(){startX=null}
 function onError(){track.classList.add('nq-city-art-fallback');art.hidden=true}
 frame.addEventListener('click',onClick);view.addEventListener('keydown',onKey);view.addEventListener('pointerdown',onDown);view.addEventListener('pointermove',onMove);view.addEventListener('pointerup',onUp);view.addEventListener('pointercancel',onUp);art.addEventListener('error',onError);
 return function(){disposed=true;cancelAnimationFrame(frameId);frame.removeEventListener('click',onClick);view.removeEventListener('keydown',onKey);view.removeEventListener('pointerdown',onDown);view.removeEventListener('pointermove',onMove);view.removeEventListener('pointerup',onUp);view.removeEventListener('pointercancel',onUp);art.removeEventListener('error',onError)}
}
window.NoteQuestCity={mount:mount};
})();