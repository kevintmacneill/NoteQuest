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
function pianoKeyboard(onPick,{showMiddleC=false}={}){
 const wrap=el("div","nqh-piano-wrap");
 add(wrap,el("p","nqh-piano-caption","PIANO EXPLORER · TWO OCTAVES"));
 const board=el("div","nqh-piano");
 const whites=[48,50,52,53,55,57,59,60,62,64,65,67,69,71];
 const blackOffsets={49:0,51:1,54:3,56:4,58:5,61:7,63:8,66:10,68:11,70:12};
 whites.forEach((m,i)=>{
  const b=btn("",()=>onPick(m),"nqh-key nqh-white");
  b.setAttribute("aria-label","White piano key "+(i+1)+" from left");
  b.style.setProperty("--key-index",i);
  if(m===60&&showMiddleC)add(b,el("span","nqh-middle-c","Middle C"));
  board.append(b);
 });
 Object.entries(blackOffsets).forEach(([pitch,after])=>{
  const m=Number(pitch),b=btn("",()=>onPick(m),"nqh-key nqh-black");
  b.setAttribute("aria-label","Black piano key "+(Object.keys(blackOffsets).indexOf(String(m))+1)+" from left");
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
 if(!(window.AudioContext||window.webkitAudioContext)){add(box,el("p","nqh-alert","This browser cannot play the listening exercise. No answer will be submitted."));return false}
 add(box,el("h3",null,title));
 const b=btn("▶ Listen again",()=>notes.forEach(n=>tone(n.midi,n.duration||.48,n.volume||.15,n.delay||0)),"nqh-btn nqh-listen");
 box.append(b);
 add(box,el("p","nqh-muted","Tap Listen again as often as you like. Use your ears, not the note numbers."));
 return true;
}
function notation(notes,clef="treble"){
 const wrap=el("div","nqh-notation");wrap.setAttribute("role","img");wrap.setAttribute("aria-label",notes.length+" notes written on "+clef+" staff");
 const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox","0 0 440 190");svg.setAttribute("aria-hidden","true");
 const ns="http://www.w3.org/2000/svg";
 const line=(x1,y1,x2,y2,w=2)=>{const n=document.createElementNS(ns,"line");for(const [k,v] of Object.entries({x1,y1,x2,y2,"stroke-width":w,stroke:"#566d62"}))n.setAttribute(k,v);svg.append(n)};
 const text=(x,y,value,size=38)=>{const n=document.createElementNS(ns,"text");n.setAttribute("x",x);n.setAttribute("y",y);n.setAttribute("font-size",size);n.setAttribute("fill","#476e60");n.textContent=value;svg.append(n)};
 if(clef!=="bass"&&clef!=="treble"){wrap.append(el("p","nqh-alert","This note needs a different picture. Try another activity."));return wrap;}
 for(let i=0;i<5;i++)line(25,130-i*20,420,130-i*20);
 text(33,121,clef==="bass"?"𝄢":"𝄞",64);
 const naturals=["C","D","E","F","G","A","B"];
 notes.forEach((note,i)=>{
  const match=/^([A-G])([0-8])$/.exec(note);if(!match)return;
  const step=Number(match[2])*7+naturals.indexOf(match[1])-(clef==="bass"?2*7+4:4*7+2);
  const x=135+i*100,y=130-step*10;
  for(let j=-2;j>=step;j-=2)if(j<0)line(x-21,130-j*10,x+21,130-j*10,2);
  const oval=document.createElementNS(ns,"ellipse");oval.setAttribute("cx",x);oval.setAttribute("cy",y);oval.setAttribute("rx","12");oval.setAttribute("ry","8");oval.setAttribute("fill","#2f765e");oval.setAttribute("transform","rotate(-20 "+x+" "+y+")");svg.append(oval);
  line(x+11,y,x+11,y-45,3);
 });
 wrap.append(svg);return wrap;
}
function grownUpHold(label,callback){
 const b=btn(label,()=>{},"nqh-btn nqh-main nqh-grownup-hold");b.setAttribute("aria-label",label+" — hold for three seconds");
 let timer=null,done=false;
 const clear=()=>{if(timer!==null){clearTimeout(timer);timer=null}if(!done)b.textContent=label};
 const start=e=>{if(e.type==="keydown"&&!["Space","Enter"].includes(e.code))return;if(e.repeat||timer!==null||done)return;
  b.textContent="Keep holding for 3 seconds…";timer=setTimeout(()=>{timer=null;done=true;b.textContent="Confirmed";callback()},3000)};
 b.addEventListener("pointerdown",start);b.addEventListener("pointerup",clear);b.addEventListener("pointercancel",clear);b.addEventListener("pointerleave",clear);b.addEventListener("keydown",start);b.addEventListener("keyup",clear);b.addEventListener("blur",clear);
 return b;
}
function render(root,route,learn,worldId="NQ-00"){
 const out=el("section","nqh-shell");root.append(out);
 const engineStops=learn.stops(worldId);
 if(!engineStops.length){add(out,el("p","nqh-alert","The learning engine has no lessons available in this world."));return}
 let active=null;
 function reset(){if(window.NQ?.mic?.isOn())NQ.mic.stop();if(active){learn.cancel(active);active=null}}
 function page(){
  out.replaceChildren();
  const hero=el("div","nqh-harbor-hero");
  const image=el("img","nqh-harbor-image");image.src=worldId==="NQ-00"?"assets/worlds/nq-00-harbor.svg":"assets/worlds/nq-01-rainforest.svg";image.alt=worldId==="NQ-00"?"Illustrated route through Melody Harbor":"Illustrated route through Amazon Rainforest";
  const copy=el("div","nqh-harbor-copy");
  add(copy,el("p","nqh-eyebrow",worldId==="NQ-00"?"MELODY HARBOR · CHAPTER ONE":"AMAZON RAINFOREST · CHAPTER TWO"),el("h2",null,worldId==="NQ-00"?"Your first musical adventure":"The rainforest music trail"),el("p","nqh-lead",worldId==="NQ-00"?"Explore your piano, learn the sounds of the harbor, and grow your musical skills.":"Follow the rhythm of the rainforest, learn your notes, and discover the piano one skill at a time."));
  add(hero,image,copy);out.append(hero);
  const completed=engineStops.filter(id=>learn.stopStatus(id).complete).length;
  const meter=el("div","nqh-progress");meter.setAttribute("role","progressbar");meter.setAttribute("aria-label","Completed lesson stops in this world");meter.setAttribute("aria-valuemin","0");meter.setAttribute("aria-valuemax",String(engineStops.length));meter.setAttribute("aria-valuenow",String(completed));
  const fill=el("div","nqh-progress-fill");fill.style.width=(completed/engineStops.length*100)+"%";meter.append(fill);
  add(out,el("p","nqh-progress-label",completed+" of "+engineStops.length+" stops mastered"),meter);
  const nav=el("div","nqh-toolbar");
  add(nav,btn("← World map",()=>{reset();route("nqwWorld",worldId)}),btn("🎹 Practice games",()=>{reset();route("games")}),btn("🧭 Prepare to travel",()=>{reset();route("nqwReadiness",worldId)},"nqh-btn nqh-main"));
  add(out,nav);
  engineStops.forEach((id,i)=>{
   const st=learn.stopStatus(id),card=el("article","nqh-stop"+(st.complete?" nqh-done":""));
   add(card,el("span","nqh-step","STOP "+(i+1)+" · "+(st.complete?"COMPLETE":st.unlocked?"AVAILABLE":"LOCKED")),el("h3",null,typeof st.title==="string"?st.title:st.title?.child||"Music lesson"));
   const skills=el("div","nqh-skill-grid");
   st.skills.forEach(item=>{
    const skill=learn.skill(item.id),state=learn.skillState(item.id);
    const tile=el("div","nqh-skill");
    add(tile,el("strong",null,skill?.title?.child||skill?.title?.adult||skill?.name||item.id),el("span","nqh-state",state.state.replaceAll("-"," ")));
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
  const intro=INTRO[skillId]||skill?.title?.child||skill?.title?.adult||skill?.name||"Explore this musical skill.";
  const lessonHero=el("div","nqh-lesson-hero");
  add(lessonHero,el("p","nqh-eyebrow",mode==="check"?"SKILL CHECK · SHOW WHAT YOU KNOW":"LEARN · PRACTICE · GROW"),el("h2",null,skill?.title?.child||skill?.title?.adult||skill?.name||"Music explorer"),el("p","nqh-lead",intro));
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
    add(board,el("h3",null,mode==="check"?"Skill check finished":"Practice round finished"),el("p",null,r.result?.pass?"Great work — you passed!":"Good effort — keep practicing!"),el("p","nqh-muted","Progress and rewards come from the engine. Skill checks may require successful work on more than one day."),btn("Back to lesson path",page,"nqh-btn nqh-main"));return}
   question(r.next,r.reveal!==undefined?"Try another answer. The correct answer is "+String(r.reveal)+".":r.correct?"Good work!":"Not quite. Try again.");
  }
  function question(q,feedback=""){
   if(window.NQ?.mic?.isOn())NQ.mic.stop();
   board.replaceChildren();
   if(!q){add(board,el("p","nqh-alert","The engine returned no question."));return}
   add(board,el("p","nqh-count","QUESTION "+(q.index+1)+" OF "+q.total));
   if(feedback)add(board,el("p","nqh-feedback",feedback));
   const box=el("div","nqh-question");board.append(box);
   const choice=(label,value)=>add(box,btn(label,()=>answer(value),"nqh-btn nqh-choice"));
   if(["noteName","noteFind","notePlay","contourRead"].includes(q.type)&&(q.staff==="none"||q.clef==="none")){add(box,el("h3",null,"This music picture is not ready yet"),el("p","nqh-alert","No answer will be scored. Return to the lesson path and try another activity."),btn("Return to lesson path",()=>{reset();page()}));reset();return;}
   switch(q.type){
    case "keyGroup":
      add(box,el("h3",null,"Find a group of "+q.group+" black keys"),el("p",null,"Tap a black key in that group on this piano guide."));
      add(box,pianoKeyboard(answer));
      break;
    case "keyboardSide":
      add(box,el("h3",null,"Where are the "+q.ask+" sounds?"),el("p",null,"Look at the keyboard and choose a side. Then try it on your own piano."));add(box,pianoKeyboard(answer));choice("← Left side","left");choice("Right side →","right");break;
    case "highLow":
      if(!audioChoice(box,"Which sound is higher?",[{midi:q.a,delay:0},{midi:q.b,delay:.75}])){reset();break}choice("First sound","a");choice("Second sound","b");break;
    case "self":case "caregiver":
      add(box,el("h3",null,q.prompt||"Show this skill on your piano"));
      (q.checklist||[]).forEach(t=>add(box,el("p","nqh-muted","• "+t)));
      add(box,el("p","nqh-alert","This requires a real observation. The app cannot verify posture or technique automatically."));
      if(q.type==="caregiver"){add(box,el("p","nqh-muted","Ask a grown-up to watch. The confirmation must be held for three seconds."),grownUpHold("Grown-up: I observed this",()=>answer(true)))}else choice("I completed this activity",true);
      choice("Not yet — practice again",false);break;
    case "finger":
      add(box,el("h3",null,"Which finger number matches the highlighted finger?"),el("p",null,(q.hand==="L"?"Left":"Right")+" hand"));const hand=el("div","nqh-finger-hand");hand.setAttribute("role","img");hand.setAttribute("aria-label","Hand with one numbered finger highlighted");for(let n=1;n<=5;n++){const finger=el("span","nqh-finger"+(n===q.finger?" nqh-finger-active":""),n===q.finger?"?":"");finger.style.setProperty("--finger",n);hand.append(finger)}box.append(hand);
      q.choices.forEach(x=>choice(String(x),x));break;
    case "beats":
      add(box,el("h3",null,"How many beats does this note last?"));const beatGlyph={1:"♩",2:"𝅗𝅥",3:"𝅗𝅥.",4:"𝅝"}[Number(q.value)];if(!beatGlyph){add(box,el("p","nqh-alert","This note is not available yet."));reset();break;}const beatPicture=el("div","nqh-beat-picture",beatGlyph);beatPicture.setAttribute("role","img");beatPicture.setAttribute("aria-label","Musical note symbol");beatPicture.style.fontSize="5rem";add(box,beatPicture);
      q.choices.forEach(x=>choice(String(x),x));break;
    case "symbol":
      add(box,el("h3",null,q.show==="dyn-p"||q.show==="dyn-f"?"Which dynamic marking is pictured?":"Which kind of piano key is pictured?"));
      if(q.show==="dyn-p"||q.show==="dyn-f"){const mark=el("div","nqh-dynamic-mark",q.show==="dyn-p"?"𝆏":"𝆑");mark.setAttribute("role","img");mark.setAttribute("aria-label","Musical dynamic marking");mark.style.fontSize="5rem";box.append(mark)}else if(q.show==="key-black"||q.show==="key-white"){const sample=el("div","nqh-key-sample "+(q.show==="key-black"?"nqh-key-sample-dark":"nqh-key-sample-light"));sample.setAttribute("role","img");sample.setAttribute("aria-label","Piano key illustration");box.append(sample)}else {add(box,el("p","nqh-alert","This music picture is not available yet."));reset();break;}
      (q.choices||[]).forEach(x=>choice(String(x),x));break;
    case "contour":
      if(!audioChoice(box,"Do the notes move up, down, or stay the same?",[{midi:q.a,delay:0},{midi:q.b,delay:.75}])){reset();break}
      ["up","down","same"].forEach(x=>choice(x,x));break;
    case "notePlay":
      add(box,el("h3",null,"Play this note on your real piano"),notation([q.note],q.staff),el("p","nqh-muted","The tablet listens to the acoustic piano. You cannot earn credit by tapping the on-screen keyboard."));
      if(!window.NQ?.mic?.possible()){add(box,el("p","nqh-alert","Microphone access is unavailable. Use a secure HTTPS connection and allow microphone access. No score will be submitted."));break}
      const listen=btn("🎤 Listen to my piano",async()=>{
        listen.disabled=true;listen.textContent="Listening… play the note";
        const id=active;let used=false;
        const ok=await NQ.mic.start(midi=>{if(used||active!==id)return;used=true;NQ.mic.stop();answer(midi)});
        if(!ok){listen.disabled=false;listen.textContent="🎤 Try microphone again";add(box,el("p","nqh-alert","Microphone permission was denied or the device could not start listening."))}
      },"nqh-btn nqh-main");box.append(listen);break;
    case "letterFind":
      add(box,el("h3",null,"Find the "+q.letter+" key"),el("p",null,"Tap the correct piano key. Try it on your own piano too."),pianoKeyboard(answer));break;
    case "noteName":
      if(q.staff!=="treble"&&q.staff!=="bass"){add(box,el("p","nqh-alert","This note needs a different picture. No score will be recorded."));reset();break;}

      add(box,el("h3",null,"Name this written note"),notation([q.note],q.staff));
      (q.choices||["A","B","C","D","E","F","G"]).forEach(x=>choice(String(x),x));break;
    case "noteFind":
      if(q.staff!=="treble"&&q.staff!=="bass"){add(box,el("p","nqh-alert","This note needs a keyboard-position picture. No score will be recorded."));reset();break;}

      add(box,el("h3",null,"Find this note on the piano"),notation([q.note],q.staff),pianoKeyboard(answer));break;
    case "contourRead":
      add(box,el("h3",null,"Which way do the written notes move?"),notation(q.notes,q.clef));
      (q.choices||["up","down","same"]).forEach(x=>choice(x,x));break;
    case "durationCompare":
      if(!audioChoice(box,"Which sound lasts "+q.ask+"?",[{midi:q.midi,duration:q.a.seconds,delay:0},{midi:q.midi,duration:q.b.seconds,delay:q.a.seconds+.4}])){reset();break}
      choice("First sound","a");choice("Second sound","b");break;
    case "rhythmTap":
      NoteQuestRhythm.mount(box,q,answer);break;
    case "loudSoft":
      if(!audioChoice(box,"Is the sound loud or soft?",[{midi:q.midi,volume:q.volume}])){reset();break}choice("Soft","soft");choice("Loud","loud");break;
    default:
      add(box,el("h3",null,"This exercise needs a dedicated interaction"),el("p","nqh-alert","Question type: "+q.type+". No progress will be awarded from a simulated answer."));reset();
   }
  }
 }
 page();
}
window.NoteQuestHarbor={render,pianoKeyboard,notation,tone};
})();
