/* NoteQuest Melody Harbor learning bridge v0.1.
   Engine-owned progress only. Never synthesize passes, unlocks, or scores. */
(function(){
"use strict";
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=txt;return n};
const add=(p,...ns)=>{ns.forEach(n=>p.append(n));return p};
const btn=(txt,fn,cls="nqh-btn")=>{const b=el("button",cls,txt);b.type="button";b.addEventListener("click",fn);return b};
const INTRO={
 "k-blackwhite":"Look at your piano. Black keys form repeating groups. Can you find them?",
 "e-highlow":"The left end of a piano sounds lower. The right end sounds higher.",
 "t-posture":"A comfortable bench and relaxed shoulders help your music flow.",
 "t-hands":"Let your hands and wrists rest comfortably. Never push through pain.",
 "e-contour":"Listen for notes moving up, moving down, or staying the same.",
 "r-pulse":"A steady beat is like footsteps along the harbor dock.",
 "e-loudsoft":"You can play a sound gently or strongly without forcing your hands."
};
function pianoKeyboard(onPick){
 const wrap=el("div","nqh-piano-wrap");
 add(wrap,el("p","nqh-piano-caption","PIANO EXPLORER · TWO OCTAVES"));
 const board=el("div","nqh-piano");
 const whites=[48,50,52,53,55,57,59,60,62,64,65,67,69,71];
 const blackOffsets={49:0,51:1,54:3,56:4,58:5,61:7,63:8,66:10,68:11,70:12};
 whites.forEach((m,i)=>{
  const b=btn("",()=>onPick(m),"nqh-key nqh-white");
  b.setAttribute("aria-label","White piano key "+m);
  b.style.setProperty("--key-index",i);
  if(m===60)add(b,el("span","nqh-middle-c","Middle C"));
  board.append(b);
 });
 Object.entries(blackOffsets).forEach(([pitch,after])=>{
  const m=Number(pitch),b=btn("",()=>onPick(m),"nqh-key nqh-black");
  b.setAttribute("aria-label","Black piano key "+m);
  b.style.left=(((after+1)/14)*100-1.7)+"%";
  board.append(b);
 });
 wrap.append(board);return wrap;
}
// Browser sound is a listening aid. The engine judges answers.
let audioCtx=null;
function tone(midi,seconds=.5,volume=.16,delay=0){
 const AC=window.AudioContext||window.webkitAudioContext;
 if(!AC)return false;
 try{
  audioCtx=audioCtx||new AC();
  if(audioCtx.state==="suspended")audioCtx.resume();
  const now=audioCtx.currentTime+delay;
  const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
  osc.type="sine";osc.frequency.value=440*Math.pow(2,(midi-69)/12);
  gain.gain.setValueAtTime(.0001,now);
  gain.gain.exponentialRampToValueAtTime(Math.max(.002,volume),now+.025);
  gain.gain.exponentialRampToValueAtTime(.0001,now+seconds);
  osc.connect(gain);gain.connect(audioCtx.destination);
  osc.start(now);osc.stop(now+seconds+.02);return true;
 }catch(e){return false}
}
function audioChoice(box,title,notes){
 add(box,el("h3",null,title));
 const b=btn("▶ Listen again",()=>notes.forEach(n=>tone(n.midi,n.duration||.48,n.volume||.15,n.delay||0)),"nqh-btn nqh-listen");
 box.append(b);
 add(box,el("p","nqh-muted","Tap Listen again as often as you like. Use your ears, not the note numbers."));
}
function render(root,route,learn){
 const out=el("section","nqh-shell");root.append(out);
 const engineStops=learn.stops("NQ-00");
 if(!engineStops.length){add(out,el("p","nqh-alert","The learning engine has no Melody Harbor lessons available."));return}
 let active=null;
 function reset(){if(active){learn.cancel(active);active=null}}
 function page(){
  out.replaceChildren();
  const hero=el("div","nqh-harbor-hero");
  const image=el("img","nqh-harbor-image");image.src="assets/worlds/nq-00-harbor.svg";image.alt="Illustrated route through Melody Harbor with six musical landmarks";
  const copy=el("div","nqh-harbor-copy");
  add(copy,el("p","nqh-eyebrow","MELODY HARBOR · CHAPTER ONE"),el("h2",null,"Your first musical adventure"),el("p","nqh-lead","Explore your piano, learn the sounds of the harbor, and grow your musical skills."));
  add(hero,image,copy);out.append(hero);
  const completed=engineStops.filter(id=>learn.stopStatus(id).complete).length;
  const meter=el("div","nqh-progress");meter.setAttribute("role","progressbar");meter.setAttribute("aria-label","Completed Melody Harbor lesson stops");meter.setAttribute("aria-valuemin","0");meter.setAttribute("aria-valuemax",String(engineStops.length));meter.setAttribute("aria-valuenow",String(completed));
  const fill=el("div","nqh-progress-fill");fill.style.width=(completed/engineStops.length*100)+"%";meter.append(fill);
  add(out,el("p","nqh-progress-label",completed+" of "+engineStops.length+" stops mastered"),meter);
  const nav=el("div","nqh-toolbar");
  add(nav,btn("← World map",()=>{reset();route("nqwWorld","NQ-00")}),btn("🎹 Practice games",()=>{reset();route("games")}),btn("🧭 Prepare to travel",()=>{reset();route("nqwReadiness","NQ-00")},"nqh-btn nqh-main"));
  add(out,nav);
  engineStops.forEach((id,i)=>{
   const st=learn.stopStatus(id),card=el("article","nqh-stop"+(st.complete?" nqh-done":""));
   add(card,el("span","nqh-step","STOP "+(i+1)+" · "+(st.complete?"COMPLETE":st.unlocked?"AVAILABLE":"LOCKED")),el("h3",null,typeof st.title==="string"?st.title:st.title?.child||"Music lesson"));
   const skills=el("div","nqh-skill-grid");
   st.skills.forEach(item=>{
    const skill=learn.skill(item.id),state=learn.skillState(item.id);
    const tile=el("div","nqh-skill");
    add(tile,el("strong",null,skill?.name||skill?.title||item.id),el("span","nqh-state",state.state.replaceAll("-"," ")));
    if(st.unlocked){
      add(tile,btn("Learn & practice",()=>lesson(id,item.id,"practice"),"nqh-btn nqh-main"));
      add(tile,btn("Check my skill",()=>lesson(id,item.id,"check")));
    }
    skills.append(tile);
   });
   card.append(skills);
   if(!st.unlocked)add(card,el("p","nqh-muted","Complete the earlier engine lessons or their required Journey Readiness before this stop opens."));
   out.append(card);
  });
 }
 function lesson(stopId,skillId,mode){
  reset();out.replaceChildren();
  const skill=learn.skill(skillId);
  const intro=INTRO[skillId]||skill?.name||skill?.title||"Explore this musical skill.";
  const lessonHero=el("div","nqh-lesson-hero");
  add(lessonHero,el("p","nqh-eyebrow",mode==="check"?"SKILL CHECK · SHOW WHAT YOU KNOW":"LEARN · PRACTICE · GROW"),el("h2",null,skill?.name||skill?.title||"Music explorer"),el("p","nqh-lead",intro));
  out.append(lessonHero);
  add(out,btn("← Lesson path",()=>{reset();page()}));
  const board=el("div","nqh-board");out.append(board);
  if(mode==="practice"&&learn.stopStatus(stopId).step==="learn"){
    const introPanel=el("div","nqh-question");
    add(introPanel,el("h3",null,"First, explore this idea"),el("p",null,"Try it on your acoustic piano. When you are ready, begin the engine's practice questions."),btn("I've explored it · Start practice",()=>{
      learn.markLearned(stopId);start();
    },"nqh-btn nqh-main"));
    board.append(introPanel);
  }else start();
  function start(){
   const r=learn.start(skillId,mode);
   if(!r.ok){board.replaceChildren(el("p","nqh-alert","This skill cannot start yet: "+r.reason+(r.missing?.length?" · prerequisite skills: "+r.missing.join(", "):"")));return}
   active=r.roundId;question(r.question);
  }
  function answer(value){
   const r=learn.answer(active,value);
   if(!r.ok){board.replaceChildren(el("p","nqh-alert","The learning engine could not accept this answer: "+r.reason));return}
   if(r.done){active=null;board.replaceChildren();
    add(board,el("h3",null,"Practice round finished"),el("p",null,"Engine result: "+(r.result?.pass?"Passed":"Finished — keep practicing")),el("p","nqh-muted","Progress and rewards come from the engine. Skill checks may require successful work on more than one day."),btn("Back to lesson path",page,"nqh-btn nqh-main"));return}
   question(r.next,r.correct?"Good work!":"Not quite. Try again.");
  }
  function question(q,feedback=""){
   board.replaceChildren();
   if(!q){add(board,el("p","nqh-alert","The engine returned no question."));return}
   add(board,el("p","nqh-count","QUESTION "+(q.index+1)+" OF "+q.total));
   if(feedback)add(board,el("p","nqh-feedback",feedback));
   const box=el("div","nqh-question");board.append(box);
   const choice=(label,value)=>add(box,btn(label,()=>answer(value),"nqh-btn nqh-choice"));
   switch(q.type){
    case "keyGroup":
      add(box,el("h3",null,"Find a group of "+q.group+" black keys"),el("p",null,"Tap a black key in that group on this piano guide."));
      add(box,pianoKeyboard(answer));
      break;
    case "keyboardSide":
      add(box,el("h3",null,"Where are the "+q.ask+" sounds?"),el("p",null,"Look at the keyboard and choose a side. Then try it on your own piano."));add(box,pianoKeyboard(answer));choice("← Left side","left");choice("Right side →","right");break;
    case "highLow":
      audioChoice(box,"Which sound is higher?",[{midi:q.a,delay:0},{midi:q.b,delay:.75}]);choice("First sound","a");choice("Second sound","b");break;
    case "self":case "caregiver":
      add(box,el("h3",null,q.prompt||"Show this skill on your piano"));
      (q.checklist||[]).forEach(t=>add(box,el("p","nqh-muted","• "+t)));
      add(box,el("p","nqh-alert","This requires a real observation. The app cannot verify posture or technique automatically."));
      choice(q.type==="caregiver"?"A grown-up observed and confirms":"I completed this activity",true);
      choice("Not yet — practice again",false);break;
    case "finger":
      add(box,el("h3",null,"Which finger number is shown?"),el("p",null,(q.hand==="L"?"Left":"Right")+" hand · finger "+q.finger));
      q.choices.forEach(x=>choice(String(x),x));break;
    case "beats":
      add(box,el("h3",null,"How many beats?"),el("p",null,"Note value: "+q.value));
      q.choices.forEach(x=>choice(String(x),x));break;
    case "symbol":
      add(box,el("h3",null,"What does this symbol mean?"),el("p",null,String(q.show)));
      (q.choices||[]).forEach(x=>choice(String(x),x));break;
    case "contour":
      audioChoice(box,"Do the notes move up, down, or stay the same?",[{midi:q.a,delay:0},{midi:q.b,delay:.75}]);
      ["up","down","same"].forEach(x=>choice(x,x));break;
    case "rhythmTap":
      NoteQuestRhythm.mount(box,q,answer);break;
    case "loudSoft":
      audioChoice(box,"Is the sound loud or soft?",[{midi:q.midi,volume:q.volume}]);choice("Soft","soft");choice("Loud","loud");break;
    default:
      add(box,el("h3",null,"This exercise needs a dedicated interaction"),el("p","nqh-alert","Question type: "+q.type+". No progress will be awarded from a simulated answer."));reset();
   }
  }
 }
 page();
}
window.NoteQuestHarbor={render};
})();
