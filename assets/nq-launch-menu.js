/* Branded entry overlay; delegates player selection to the UI startup flow. */
(function(){'use strict';
function mount(){
 const app=document.getElementById('app');if(!app)return;
 document.body.classList.add('nq-menu-ready');
 const screen=document.createElement('section');screen.className='nq-launch';screen.setAttribute('role','dialog');screen.setAttribute('aria-modal','true');screen.setAttribute('aria-label','Welcome to NoteQuest');
 screen.innerHTML='<div class="nq-launch-panel"><img class="nq-launch-logo" src="assets/notequest-logo-icon.svg" alt="" width="180" height="180"><h1 class="nq-launch-title">NoteQuest</h1><p class="nq-launch-subtitle">Your musical adventure begins here</p><button class="nq-launch-start" type="button">▶ Click to Play</button><p class="nq-launch-hint">Your adventure continues after you press Play</p></div>';
 document.body.append(screen);const start=screen.querySelector('button');
 let entered=false;
 function enter(){
  if(entered)return;
  entered=true;screen.remove();
  if(typeof window.NoteQuestEnter==='function')window.NoteQuestEnter();
  const first=app.querySelector('.nq-menu-primary,.pcard,.tile.add,button');
  if(first)first.focus({preventScroll:true});
 }
 start.addEventListener('click',enter,{once:true});
 document.addEventListener('keydown',function trap(e){if(!screen.isConnected){document.removeEventListener('keydown',trap);return}if(e.key==='Escape'){e.preventDefault();enter();return}if(e.key==='Tab'){e.preventDefault();start.focus()}},{passive:false});
 start.focus({preventScroll:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
