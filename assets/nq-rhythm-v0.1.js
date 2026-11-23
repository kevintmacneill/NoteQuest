/* NoteQuest rhythm tap pad — engine owns scoring. */
(function(){
"use strict";
function mount(container,q,submit){
 const area=document.createElement("div");area.className="nqh-rhythm";
 const title=document.createElement("h3");title.textContent="Keep the harbor beat";
 const detail=document.createElement("p");detail.textContent="Watch the count-in, then press and hold the pad for each note. Release before the next note.";
 const status=document.createElement("p");status.className="nqh-rhythm-status";status.setAttribute("aria-live","polite");status.textContent="Ready when you are";
 const beat=document.createElement("div");beat.className="nqh-rhythm-beats";
 const lengths=q.flat||q.measures?.flat()||[];
 lengths.forEach((n,i)=>{const span=document.createElement("span");span.className="nqh-beat";span.textContent=n+" beat"+(n===1?"":"s");beat.append(span)});
 const startBtn=document.createElement("button");startBtn.className="nqh-btn nqh-main";startBtn.type="button";startBtn.textContent="▶ Start count-in";
 const pad=document.createElement("button");pad.className="nqh-rhythm-pad";pad.type="button";pad.textContent="TAP THE BEAT";pad.disabled=true;
 const finish=document.createElement("button");finish.className="nqh-btn";finish.type="button";finish.textContent="Finish my rhythm";finish.disabled=true;
 let start=0,down=null,presses=[],timer=null,ready=false,submitted=false;
 const bpm=q.bpm||60,beatSeconds=60/bpm,totalBeats=lengths.reduce((a,b)=>a+b,0);
 const duration=totalBeats*beatSeconds;
 function clear(){if(timer){clearInterval(timer);timer=null}}
 function submitOnce(){if(submitted||performance.now()/1000<start)return;submitted=true;clear();pad.disabled=true;finish.disabled=true;submit({start,presses:presses.slice()})}
 startBtn.addEventListener("click",()=>{
  if(submitted)return;clear();presses=[];down=null;ready=false;startBtn.disabled=true;pad.disabled=false;finish.disabled=true;
  const begun=performance.now()/1000;start=begun+4*beatSeconds;
  status.textContent="Count in: 1 · 2 · 3 · 4";
  const tick=()=>{const t=performance.now()/1000;const left=start-t;
   if(left>0){status.textContent="Count in: "+Math.min(4,Math.max(1,Math.ceil(left/beatSeconds)))+" beats remaining";return}
   if(!ready){ready=true;pad.disabled=false;status.textContent="Now play the rhythm!";}
   const elapsed=t-start;if(elapsed>=duration-.15)finish.disabled=false;
   if(elapsed>=duration+1){if(down!==null){presses.push([down,t]);down=null}submitOnce()}
   else status.textContent="Playing · "+Math.min(totalBeats,Math.max(1,Math.floor(elapsed/beatSeconds)+1))+" / "+totalBeats+" beats";
  };
  pad.focus({preventScroll:true});
  tick();timer=setInterval(tick,60);
 });
 function press(){if(submitted||down!==null||!start)return;const now=performance.now()/1000;if(now<start-.25)return;down=now;pad.classList.add("nqh-pressed")}
 function release(){if(down===null)return;const t=performance.now()/1000;presses.push([down,t]);down=null;pad.classList.remove("nqh-pressed")}
 pad.addEventListener("pointerdown",e=>{e.preventDefault();press();try{pad.setPointerCapture(e.pointerId)}catch(_){}});
 pad.addEventListener("pointerup",release);pad.addEventListener("pointercancel",release);
 pad.addEventListener("keydown",e=>{if((e.code==="Space"||e.code==="Enter")&&!e.repeat){e.preventDefault();press()}});
 pad.addEventListener("keyup",e=>{if(e.code==="Space"||e.code==="Enter"){e.preventDefault();release()}});
 finish.addEventListener("click",()=>{if(down!==null)release();submitOnce()});
 area.append(title,detail,beat,status,startBtn,pad,finish);container.append(area);
 function interruption(){
  if(!timer||submitted)return;
  clear();start=0;down=null;presses=[];
  startBtn.disabled=false;pad.disabled=true;finish.disabled=true;
  pad.classList.remove("nqh-pressed");
  status.textContent="Count-in paused. Start again when you are ready.";
 }
 function onVisibility(){if(document.hidden)interruption()}
 document.addEventListener("visibilitychange",onVisibility);
 window.addEventListener("pagehide",interruption);
 return ()=>{
  clear();
  document.removeEventListener("visibilitychange",onVisibility);
  window.removeEventListener("pagehide",interruption);
 };
}
window.NoteQuestRhythm={mount};
})();
