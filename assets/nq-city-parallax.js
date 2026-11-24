/* Optional visual-only layered overlook. No engine or learner-state changes. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NoteQuestCityParallax=api;})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const names=['sky','mountains','city','foreground'];
const speeds=Object.freeze({sky:.14,mountains:.07,city:0,foreground:-.11});
const defaults=Object.freeze({sky:'assets/nq-overlook-sky-v2.webp',mountains:'assets/nq-overlook-mountains-v2.webp',city:'assets/nq-overlook-city-v2.webp',foreground:'assets/nq-overlook-foreground-v2.webp'});
function mount(track,viewport,options={}){
 if(!track||!viewport)return function(){};
 const paths=Object.assign({},defaults,options.assets||{});
 const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const original=track.querySelector('.nq-city-art');
 const scene=document.createElement('div');scene.className='nq-parallax-scene';scene.setAttribute('aria-hidden','true');
 const layers={};
 names.forEach(key=>{const img=document.createElement('img');img.className='nq-parallax-layer nq-parallax-'+key;img.alt='';img.decoding='async';img.draggable=false;img.dataset.layer=key;img.src=paths[key];layers[key]=img;scene.appendChild(img)});
 track.insertBefore(scene,track.firstChild);
 let disposed=false,enabled=false,raf=0;
 function paint(){
  raf=0;if(!enabled||disposed)return;
  const pan=viewport.scrollLeft-(viewport.scrollWidth-viewport.clientWidth)/2;
  names.forEach(key=>{const px=reduced?0:Math.max(-70,Math.min(70,pan*speeds[key]));layers[key].style.transform='translate3d('+px.toFixed(2)+'px,0,0)'});
 }
 function onScroll(){if(!raf)raf=requestAnimationFrame(paint)}
 viewport.addEventListener('scroll',onScroll,{passive:true});
 Promise.all(names.map(async key=>{
  try{await layers[key].decode();return true}catch{return false}
 })).then(results=>{
  if(disposed)return;
  if(!results.every(Boolean)||layers.city.naturalWidth!==3*layers.city.naturalHeight||
      names.some(key=>layers[key].naturalWidth!==layers.city.naturalWidth||
      layers[key].naturalHeight!==layers.city.naturalHeight)){scene.remove();return}
  const distance=viewport.scrollWidth-viewport.clientWidth;
  const position=distance>0?viewport.scrollLeft/distance:.5;
  enabled=true;
  viewport.classList.add('nq-city-viewport--layered');
  scene.classList.add('nq-parallax-active');
  if(original)original.classList.add('nq-parallax-fallback-hidden');
  viewport.scrollLeft=(viewport.scrollWidth-viewport.clientWidth)*position;
  paint();
 });
 return function(){disposed=true;viewport.removeEventListener('scroll',onScroll);if(raf)cancelAnimationFrame(raf);scene.remove();viewport.classList.remove('nq-city-viewport--layered');if(original)original.classList.remove('nq-parallax-fallback-hidden')};
}
return Object.freeze({mount,speeds,defaults});
});
