/* NoteQuest journey readiness interface v0.1 — engine-owned assessment */
(function(){
"use strict";
const E=(t,c,x)=>{const n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n};
const A=(p,...ns)=>{ns.forEach(n=>p.append(n));return p};
const B=(x,fn,c="nqh-btn")=>{const b=E("button",c,x);b.type="button";b.addEventListener("click",fn);return b};
const LABEL={navigation:["🧭","Find your way","Recognize the keys and directions"],timing:["🥁","Keep the beat","Hear and follow a steady pulse"],performance:["🎹","Show your skills","Demonstrate your piano setup and playing"]};
let sound=null;
function play(midi,delay=0,volume=.14){
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
 try{sound=sound||new AC();if(sound.state==="suspended")sound.resume();const at=sound.currentTime+delay,o=sound.createOscillator(),g=sound.createGain();o.type="sine";o.frequency.value=440*2**((midi-69)/12);g.gain.setValueAtTime(.001,at);g.gain.exponentialRampToValueAtTime(volume,at+.03);g.gain.exponentialRampToValueAtTime(.001,at+.47);o.connect(g);g.connect(sound.destination);o.start(at);o.stop(at+.49)}catch(e){}
}
function render(root,go,worldId){
 const api=window.NQ&&NQ.journey;const area=E("section","nqh-shell nqh-journey");root.append(area);
 if(!api){area.append(E("p","nqh-alert","Journey Readiness engine unavailable."));return}
 let attempt=null;
 const stop=()=>{if(attempt){api.cancel(attempt);attempt=null}};
 function home(){
  stop();area.replaceChildren();
  const req=api.requirements(worldId),status=api.status(worldId);
  A(area,E("p","nqh-eyebrow","JOURNEY READINESS · THE TRAVEL GATE"),E("h2",null,"Pack your musical skills"),E("p","nqh-lead","Before setting off, prove you're prepared. Each challenge has five questions; four correct answers pass. The engine remembers passed areas."));
  if(!req.ok){A(area,E("p","nqh-alert","The engine cannot open this journey: "+req.reason),B("← Back to world",()=>go("nqwWorld",worldId)));return}
  if(req.early)A(area,E("p","nqh-alert","You're attempting this journey early. Passing all three areas can place you ahead of unfinished lesson stops. Choose this only if you're ready."));
  const grid=E("div","nqh-readiness-grid");
  req.parts.forEach(part=>{
   const [ico,title,desc]=LABEL[part.id]||["🎵",part.id,"Music challenge"];
   const card=E("article","nqh-stop nqh-readiness-card");
   A(card,E("span","nqh-readiness-icon",ico),E("h3",null,title),E("p","nqh-muted",desc),E("p","nqh-state",part.passed?"✓ Passed — saved by the engine":"Not passed yet"));
   if(!part.passed)card.append(B("Start "+title,()=>begin(part.id),"nqh-btn nqh-main"));
   grid.append(card);
  });
  area.append(grid);
  if(status.ok&&status.unlocked)A(area,E("p","nqh-success","All readiness areas passed. Your next destination is unlocked in the engine."));
  A(area,B("← Return to world",()=>go("nqwWorld",worldId)));
 }
 function begin(part){
  const r=api.start(worldId,part);
  if(!r.ok){area.append(E("p","nqh-alert","Could not start: "+r.reason));return}
  attempt=r.attemptId;area.replaceChildren();
  A(area,E("p","nqh-eyebrow","TRAVEL CHALLENGE · "+part.toUpperCase()),E("h2",null,LABEL[part]?.[1]||"Travel challenge"),B("← Exit challenge",home));
  const board=E("div","nqh-board");area.append(board);
  question(r.question);
  function respond(v,adult){
   const a=adult?api.confirm(attempt,{by:"caregiver",yes:v}):api.answer(attempt,v);
   if(!a.ok){A(board,E("p","nqh-alert","Engine response: "+a.reason));return}
   if(a.done){
    attempt=null;board.replaceChildren();
    A(board,E("h3",null,a.result.passed?"Journey skill proven!":"A little more practice will help"),E("p",null,a.result.correct+" of "+a.result.total+" correct · "+(a.result.passed?"PASSED":"TRY AGAIN")));
    if(!a.result.passed&&a.result.practice?.length)A(board,E("p","nqh-muted","Practice these skills: "+a.result.practice.join(", ")));
    A(board,B("Back to travel preparation",home,"nqh-btn nqh-main"));return
   }
   question(a.next,a.correct?"Nice work!":"Keep going. You can learn from each try.");
  }
  function question(q,feedback){
   board.replaceChildren();if(!q){A(board,E("p","nqh-alert","No engine question available."));return}
   A(board,E("p","nqh-count","QUESTION "+(q.index+1)+" / "+q.total));
   if(feedback)A(board,E("p","nqh-feedback",feedback));
   const card=E("div","nqh-question");board.append(card);
   const choice=(label,v,adult=false)=>card.append(B(label,()=>respond(v,adult),"nqh-btn nqh-choice"));
   switch(q.type){
    case "keyGroup":
      A(card,E("h3",null,"Find a group of "+q.group+" black keys"),E("p",null,"Choose a black key in a group of "+q.group+"."));
      card.append(NoteQuestHarbor.pianoKeyboard(v=>respond(v,false)));break;
    case "keyboardSide":
      A(card,E("h3",null,"Which end of the keyboard has "+q.ask+" sounds?"));choice("← Left","left");choice("Right →","right");break;
    case "highLow":
      A(card,E("h3",null,"Which sound is higher?"),B("▶ Listen",()=>{play(q.a);play(q.b,.7)},"nqh-btn nqh-listen"));
      choice("First sound","a");choice("Second sound","b");break;
    case "self":case "caregiver":
      A(card,E("h3",null,q.prompt||"Show your piano skill"),E("p","nqh-muted","This needs a real observation, not an automatic check."));
      (q.checklist||[]).forEach(x=>card.append(E("p","nqh-muted","• "+x)));
      if(q.grownUp||q.type==="caregiver"){A(card,E("p","nqh-alert","A caregiver must observe this skill before confirming."));choice("Caregiver confirms demonstrated",true,true);choice("Not demonstrated yet",false,true)}
      else{choice("I really demonstrated this",true,true);choice("Not yet",false,true)}
      break;
    case "letterFind":
      A(card,E("h3",null,"Find the "+q.letter+" key"),NoteQuestHarbor.pianoKeyboard(v=>respond(v,false)));break;
    case "noteName":
      A(card,E("h3",null,"What is this written note?"),NoteQuestHarbor.notation([q.note],q.staff));
      (q.choices||["A","B","C","D","E","F","G"]).forEach(x=>choice(String(x),x));break;
    case "noteFind":
      A(card,E("h3",null,"Find the written note on the keyboard"),NoteQuestHarbor.notation([q.note],q.staff),NoteQuestHarbor.pianoKeyboard(v=>respond(v,false)));break;
    case "contour":
      A(card,E("h3",null,"Do the sounds go up, down or stay the same?"),B("▶ Listen",()=>{play(q.a);play(q.b,.75)},"nqh-btn nqh-listen"));
      ["up","down","same"].forEach(x=>choice(x,x));break;
    case "contourRead":
      A(card,E("h3",null,"Which way do these written notes move?"),NoteQuestHarbor.notation(q.notes,q.clef));
      (q.choices||["up","down","same"]).forEach(x=>choice(x,x));break;
    case "durationCompare":
      A(card,E("h3",null,"Which sound lasts "+q.ask+"?"),B("▶ Listen",()=>{play(q.midi,0);play(q.midi,q.a.seconds+.45)},"nqh-btn nqh-listen"));
      choice("First sound","a");choice("Second sound","b");break;
    case "beats":
      A(card,E("h3",null,"How many beats does this note get?"),E("p",null,"Note value: "+q.value));
      (q.choices||[1,2,3,4]).forEach(x=>choice(String(x),x));break;
    case "finger":
      A(card,E("h3",null,"Which finger number is highlighted?"),E("p",null,(q.hand==="L"?"Left":"Right")+" hand"));
      (q.choices||[1,2,3,4,5]).forEach(x=>choice(String(x),x));break;
    case "rhythmTap":
      NoteQuestRhythm.mount(card,q,v=>respond(v,false));break;
    default:
      A(card,E("h3",null,"This question needs another interaction"),E("p","nqh-alert","The "+q.type+" activity is not implemented here. No answer will be submitted."),B("Exit without scoring",home));break;
   }
  }
 }
 home();
}
window.NoteQuestReadiness={render};
})();
