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
function render(root,route,learn){
 const out=el("section","nqh-shell");root.append(out);
 const engineStops=learn.stops("NQ-00");
 if(!engineStops.length){add(out,el("p","nqh-alert","The learning engine has no Melody Harbor lessons available."));return}
 let active=null;
 function reset(){if(active){learn.cancel(active);active=null}}
 function page(){
  out.replaceChildren();
  add(out,el("p","nqh-eyebrow","MELODY HARBOR · PLAYABLE LEARNING PATH"),el("h2",null,"Your first musical adventure"),el("p","nqh-lead","Learn a new idea, practice with your piano, and prove what you know. The learning engine tracks your real progress."));
  const nav=el("div","nqh-toolbar");
  add(nav,btn("← World map",()=>{reset();route("nqwWorld","NQ-00")}),btn("🎹 Practice games",()=>{reset();route("games")}));
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
  add(out,el("p","nqh-eyebrow",mode==="check"?"SKILL CHECK":"LEARN · PRACTICE"),el("h2",null,skill?.name||skill?.title||"Music explorer"),el("p","nqh-lead",intro));
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
      [49,51,54,56,58,61,63,66,68,70,73,75].forEach(m=>choice("♪ "+({1:"C♯",3:"D♯",6:"F♯",8:"G♯",10:"A♯"}[m%12]||"Black key"),m));
      break;
    case "keyboardSide":
      add(box,el("h3",null,"Where are the "+q.ask+" sounds?"));choice("← Left side","left");choice("Right side →","right");break;
    case "highLow":
      add(box,el("h3",null,"Which sound is higher?"),el("p",null,"Compare these two piano notes: "+q.a+" and "+q.b+". MIDI note numbers are shown until audio playback is integrated."));choice("Sound A","a");choice("Sound B","b");break;
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
      add(box,el("h3",null,"Do the notes move up, down, or stay the same?"),el("p",null,"Notes "+q.a+" → "+q.b));
      ["up","down","same"].forEach(x=>choice(x,x));break;
    case "loudSoft":
      add(box,el("h3",null,"Listen for loud or soft"),el("p","nqh-alert","Audio comparison is not implemented in this screen. Use the existing practice games for this skill."));reset();break;
    default:
      add(box,el("h3",null,"This exercise needs a dedicated interaction"),el("p","nqh-alert","Question type: "+q.type+". No progress will be awarded from a simulated answer."));reset();
   }
  }
 }
 page();
}
window.NoteQuestHarbor={render};
})();
