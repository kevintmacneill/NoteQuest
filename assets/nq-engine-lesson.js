/* #109 engine-backed lesson surface. Uses existing buttons and engine-owned progress. */
(function(root){
'use strict';
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const name=v=>typeof v==='string'?v:(v&&(v.child||v.adult))||'Lesson';
function supportsSkill(skill){
 const content=skill?.content;
 if(content?.type==='highLow')return true;
 return content?.type==='symbol'&&Array.isArray(content.items)&&content.items.length>0&&
  content.items.every(item=>item.show==='key-black'||item.show==='key-white');
}
function canRender(learn,status){
 return (status?.skills||[]).some(s=>supportsSkill(learn.skill(s.id)));
}
function mount(app,go,NQ,id,topBar){
 const learn=NQ.learn,route=root.NoteQuestLessonRoute&&root.NoteQuestLessonRoute.resolve(learn);
 let live=true,roundId=null,question=null,feedback='',lastResult=null;
 function cancel(){live=false;if(roundId&&typeof learn.cancel==='function')learn.cancel(roundId);roundId=null}
 function available(s){
  const skill=learn.skill(s.id);
  return supportsSkill(skill)&&
    typeof learn.skillState==='function'&&learn.skillState(s.id).prereqsMet!==false;
 }
 function nextSkill(st){
  const states=['not-introduced','exploring','developing'];
  const skills=(st.skills||[]).filter(s=>states.includes(s.state)&&available(s));
  if(st.step==='practice')return skills.find(s=>s.state!=='developing');
  // Give each skill a first check before repeating a skill already checked once.
  return skills.sort((a,b)=>learn.skillState(a.id).passDays-learn.skillState(b.id).passDays)[0];
 }
 async function play(midi){
  try{
   if(NQ.audio&&typeof NQ.audio.soundOn==='function'&&!NQ.audio.soundOn())throw Error('sound-disabled');
   if(!Number.isFinite(midi))throw Error('invalid-midi');
   const ctx=NQ.audio.ctx();
   if(!ctx||typeof ctx.createOscillator!=='function')throw Error('no-audio-context');
   if(ctx.state==='suspended'&&typeof ctx.resume==='function')await ctx.resume();
   if(!live||!roundId||!question||question.type!=='highLow')return;
   if(ctx.state==='suspended')throw Error('audio-suspended');
   const osc=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;
   osc.frequency.value=440*Math.pow(2,(midi-69)/12);
   gain.gain.setValueAtTime(.1,now);
   gain.gain.exponentialRampToValueAtTime(.001,now+.4);
   osc.connect(gain);gain.connect(ctx.destination);
   osc.start(now);osc.stop(now+.42);
  }catch(e){
   if(!live)return;
   feedback='Sound unavailable. Enable audio or use another browser before answering.';
   render();
  }
 }
 function render(){
  if(!live)return;
  const st=learn.stopStatus(id);
  if(!st||!st.unlocked){app.innerHTML=topBar('Lesson','menu')+'<section class="panel"><h2>Lesson unavailable</h2><button class="btn" data-go="menu">Back to Village</button></section>';return}
  const skill=nextSkill(st),info=skill&&learn.skill(skill.id);
  let body='';
  if(lastResult)body='<h2>Round finished</h2><p>'+esc(lastResult.correct)+' of '+esc(lastResult.total)+' first-try answers correct.</p><p>'+esc(lastResult.pass?'Great practice!':'Try again to improve.')+'</p><button class="btn" id="nq109-next">Continue</button>';
  else if(st.complete)body='<h2>Lesson complete</h2><p>Your progress is saved.</p><button class="btn" data-go="continueAdventure">Continue Adventure</button>';
  else if(st.step==='learn')body='<h2>'+esc(name(route.stop.title))+'</h2><p>Explore the piano. Notice the black and white keys and listen to higher and lower sounds.</p><button class="btn" id="nq109-learn">I explored the piano</button>';
  else if(!skill)body='<h2>Activity not yet available</h2><p>This lesson needs an activity that is not supported here. No progress was awarded.</p>';
  else if(!roundId)body='<h2>'+esc(name(info.title))+'</h2><p>'+esc(st.step==='check'?'Knowledge check':'Practice')+'</p><button class="btn" id="nq109-start">Start</button>';
  else if(question&&question.type==='symbol')body='<h2>What color is this piano key?</h2><div aria-label="Piano key to identify" role="img" style="display:flex;justify-content:center;margin:1rem auto"><span style="display:block;width:64px;height:130px;border:3px solid #555;border-radius:4px;background:'+(question.show==='key-black'?'#171717':'#fff')+'"></span></div><div class="row">'+(question.choices||[]).filter(v=>v==='black'||v==='white').map(v=>'<button class="btn alt" data-nq109-answer="'+esc(v)+'">'+esc(v)+'</button>').join('')+'</div>';
  else if(question&&question.type==='highLow')body='<h2>Which sound is higher?</h2><button class="btn alt" id="nq109-play-a">Play sound A</button> <button class="btn alt" id="nq109-play-b">Play sound B</button><div class="row"><button class="btn" data-nq109-answer="a">A is higher</button><button class="btn" data-nq109-answer="b">B is higher</button></div>';
  else body='<h2>Unsupported question</h2><p>This activity cannot be completed on this screen.</p><button class="btn" id="nq109-cancel">Leave activity</button>';
  app.innerHTML=topBar('Music Lesson','menu')+'<section class="panel">'+body+(feedback?'<p role="status">'+esc(feedback)+'</p>':'')+'<p><button class="btn alt" data-go="menu">Back to Village</button></p></section>';
  const bind=(selector,fn)=>{const el=app.querySelector(selector);if(el)el.addEventListener('click',fn)};
  bind('#nq109-learn',()=>{if(learn.markLearned(id)){feedback='Exploration recorded.';render()}else{feedback='Could not save exploration.';render()}});
  bind('#nq109-start',()=>{
   const current=learn.stopStatus(id),s=nextSkill(current);
   if(!s){feedback='No supported skill available.';return render()}
   const mode=current.step==='check'?'check':'practice',r=learn.start(s.id,mode);
   if(!r||!r.ok){feedback='Activity unavailable: '+(r&&r.reason||'unknown');return render()}
   roundId=r.roundId;question=r.question;feedback='';lastResult=null;render();
  });
  app.querySelectorAll('[data-nq109-answer]').forEach(el=>el.addEventListener('click',()=>{
   if(!roundId)return;
   const result=learn.answer(roundId,el.dataset.nq109Answer);
   if(!result||!result.ok){feedback='Answer could not be recorded.';return render()}
   feedback=result.correct?'Correct!':(Object.prototype.hasOwnProperty.call(result,'reveal')&&result.reveal!=null?'Not quite. Correct answer: '+String(result.reveal)+'. Try once more.':'Try again.');
   if(result.done){roundId=null;question=null;lastResult=result.result}
   else question=result.next;
   render();
  }));
  bind('#nq109-play-a',()=>play(question.a));
  bind('#nq109-play-b',()=>play(question.b));
  bind('#nq109-cancel',()=>{if(roundId)learn.cancel(roundId);roundId=null;question=null;feedback='Activity cancelled.';render()});
  bind('#nq109-next',()=>{lastResult=null;feedback='';render()});
 }
 if(!route||!route.ok||route.id!==id||!canRender(learn,route.status)){app.innerHTML=topBar('Lesson','menu')+'<section class="panel"><h2>Lesson unavailable</h2><p>Return to your journey to select an unlocked lesson.</p><button class="btn" data-go="menu">Back to Village</button></section>';return cancel}
 render();return cancel;
}
root.NoteQuestEngineLesson=Object.freeze({mount,canRender});
})(typeof window!=='undefined'?window:globalThis);
