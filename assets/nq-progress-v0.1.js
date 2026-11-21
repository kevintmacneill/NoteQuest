/* NoteQuest learner progress dashboard — read-only engine data */
(function(){
"use strict";
const E=(t,c,x)=>{const n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n};
const A=(p,...n)=>{n.forEach(x=>p.append(x));return p};
const B=(x,fn,c="nqp-button")=>{const n=E("button",c,x);n.type="button";n.addEventListener("click",fn);return n};
const label=s=>s.replaceAll("-"," ");
function render(root,go,learn,profile){
 const out=E("section","nqp-dashboard");root.append(out);
 A(out,E("p","nqp-kicker","EXPLORER'S JOURNAL"),E("h2",null,(profile?.name||"Your")+" musical journey"),E("p","nqp-intro","Your real lesson progress, saved by the learning engine. Keep practicing and the story will grow with you."));
 const levels=learn.levels(),stops=learn.stops(),skills=learn.curriculum().skills;
 const completed=stops.filter(id=>learn.stopStatus(id)?.complete).length;
 const secure=skills.filter(s=>["secure","fluent","automatic","transferable"].includes(learn.skillState(s.id).state)).length;
 const due=learn.due();
 const stats=E("div","nqp-stats");
 [[completed+"/"+stops.length,"Lesson stops mastered"],[secure+"/"+skills.length,"Skills secured"],[Array.isArray(due)?due.length:0,"Skills ready for review"]].forEach(([value,title])=>{const card=E("article","nqp-stat");A(card,E("strong",null,String(value)),E("span",null,title));stats.append(card)});
 out.append(stats);
 const current=learn.currentStop(),today=E("div","nqp-today");
 A(today,E("p","nqp-kicker","YOUR NEXT ADVENTURE"),E("h3",null,current?(learn.stopStatus(current)?.title?.child||learn.stopStatus(current)?.title?.adult||learn.stopStatus(current)?.title||"Your next lesson"):"All current lessons completed"),E("p",null,current?"A little practice today can take you further.":"You have completed the current learning path. Keep reviewing your skills."),B("Continue learning",()=>go("nqhHarbor",current&&learn.stopStatus(current)?.level==="NQ-01"?"NQ-01":"NQ-00"),"nqp-button nqp-primary"));
 out.append(today);
 A(out,E("h3","nqp-heading","Your learning trail"));
 const list=E("div","nqp-levels");
 levels.forEach((level,i)=>{
  const levelStops=stops.filter(id=>learn.stopStatus(id)?.level===level.id);
  const done=levelStops.filter(id=>learn.stopStatus(id)?.complete).length;
  const section=E("article","nqp-level"),head=E("div","nqp-level-head");
  A(head,E("span","nqp-chapter",String(i+1).padStart(2,"0")),E("div","nqp-level-name",level.name||level.title||"World "+(i+1)),E("span","nqp-level-count",done+" / "+levelStops.length));
  const track=E("div","nqp-track"),fill=E("div","nqp-fill");fill.style.width=(levelStops.length?done/levelStops.length*100:0)+"%";track.setAttribute("role","progressbar");track.setAttribute("aria-label",(level.name||level.id)+" completion");track.setAttribute("aria-valuenow",String(done));track.setAttribute("aria-valuemax",String(levelStops.length));track.append(fill);
  A(section,head,track);
  if(levelStops.length){const rows=E("div","nqp-stop-list");levelStops.forEach(id=>{const s=learn.stopStatus(id),row=E("div","nqp-stop-row");A(row,E("span",null,s.complete?"✓":s.unlocked?"♪":"○"),E("span",null,s.title?.child||s.title?.adult||s.title||id),E("small",null,s.complete?"Mastered":s.unlocked?label(s.step):"Not yet unlocked"));rows.append(row)});section.append(rows)}
  list.append(section);
 });
 out.append(list);
 A(out,B("← Adventure atlas",()=>go("nqwHub")),B("🎹 Practice games",()=>go("games")));
}
window.NoteQuestProgress={render};
})();
