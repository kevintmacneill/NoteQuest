/* NoteQuest Journey UI v0.1 — original visual/navigation layer; no engine writes. */
(function () {
  "use strict";
  const D = window.NQ_WORLD_DATA;
  if (!D || !Array.isArray(D.worlds)) throw Error("NoteQuest world preview data missing");
  const byId = new Map(D.worlds.map(w => [w.id, w]));
  const toStop = new Map(D.worlds.flatMap(w => w.stops.map(s => [s.id, {world:w,stop:s}])));
  const div = (klass, text) => {
    const n = document.createElement("div");
    if (klass) n.className = klass;
    if (text != null) n.textContent = text;
    return n;
  };
  const elem = (tag, klass, text) => {
    const n = document.createElement(tag);
    if (klass) n.className = klass;
    if (text != null) n.textContent = text;
    return n;
  };
  const append = (parent, ...children) => { children.forEach(x => parent.append(x)); return parent; };
  const action = (label, cb, klass="nqw-btn") => {
    const b = elem("button", klass, label);
    b.type="button"; b.addEventListener("click", cb); return b;
  };
  const tag = text => elem("span","nqw-tag",text);
  const heading = (level, text) => elem("h"+level, null, text);
  const paragraph = (text, klass="") => elem("p",klass,text);
  const panel = () => elem("section","nqw-panel");
  function clearBody(root) { root.querySelectorAll(".nqw-shell").forEach(n => n.remove()); }
  function shell(root) {
    clearBody(root);
    const s=elem("div","nqw-shell");
    root.append(s);
    return s;
  }
  function scenery(world) {
    const art = div("nqw-scene");
    art.style.setProperty("--scene-sky",world.colors[0]);
    art.style.setProperty("--scene-hill",world.colors[1]);
    art.style.setProperty("--scene-deep",world.colors[2]);
    art.style.setProperty("--scene-accent",world.colors[3]);
    art.setAttribute("role","img");
    art.setAttribute("aria-label",world.name+" illustrated landscape study");
    art.dataset.scene=world.scene;
    const extra={
      harbor:'<path d="M0 225Q125 208 245 229T500 224T800 228T1000 225V340H0Z" fill="#317e9c"/><path d="M100 245h140l-20 29H123Z" fill="#734e53"/><path d="M170 180v72M170 180l80 64h-80Z" stroke="#eee2c7" stroke-width="7" fill="#fff6cc"/><path d="M760 218V80h70v138M745 80h100l-15-28h-70Z" fill="#fff7e9" stroke="#36596b" stroke-width="6"/><path d="M785 85v24" stroke="#d18c68" stroke-width="18"/>',
      rainforest:'<path d="M0 250Q300 205 550 250T1000 242V340H0Z" fill="#1b827b"/><path d="M0 305Q390 245 1000 314V340H0Z" fill="#78cec5"/><path d="M190 270V88M780 275V90" stroke="#705942" stroke-width="38"/><g fill="#205f4e"><circle cx="130" cy="75" r="93"/><circle cx="236" cy="62" r="102"/><circle cx="745" cy="60" r="98"/><circle cx="840" cy="101" r="94"/></g><path d="M520 0Q440 70 490 143" stroke="#3f7b58" fill="none" stroke-width="19"/>',
      savanna:'<path d="M0 260Q330 205 630 262T1000 258V340H0Z" fill="#c79855"/><path d="M0 315Q310 282 1000 310V340H0Z" fill="#987044"/><path d="M275 264V120" stroke="#6c5137" stroke-width="19"/><path d="M290 154Q190 160 110 125Q90 102 169 90Q242 27 344 83Q430 105 398 137Q368 154 290 154Z" fill="#739057"/><circle cx="825" cy="85" r="47" fill="#f7e7b2"/>',
      outback:'<path d="M0 270Q340 210 1000 262V340H0Z" fill="#cf835b"/><path d="M160 250l75-150h200l80 150Z" fill="#8e5551"/><path d="M230 140h220" stroke="#c48063" stroke-width="14"/><path d="M630 265V136" stroke="#755a49" stroke-width="18"/><path d="M630 170Q710 95 782 135Q745 171 630 184M630 191Q545 130 480 159Q513 194 630 207" fill="#849268"/>',
      polar:'<path d="M0 254Q250 239 500 254T1000 250V340H0Z" fill="#559cb3"/><path d="M42 247l115-146 95 130 89-65 89 87ZM475 244l120-179 124 160 91-91 144 113Z" fill="#e5f7ff" stroke="#8ebfd2" stroke-width="7"/><path d="M0 305Q300 279 520 298T1000 298" stroke="#b5e7e9" stroke-width="14" fill="none"/><path d="M200 56Q400 8 700 46" stroke="#b4e8d5" stroke-width="19" fill="none" opacity=".7"/>',
      reef:'<path d="M0 267Q230 238 540 265T1000 259V340H0Z" fill="#3c84ab"/><path d="M0 325Q230 285 490 319T1000 316V340H0Z" fill="#e1c48d"/><g stroke="#e88181" stroke-width="18" fill="none" stroke-linecap="round"><path d="M185 305v-76m0 29-46-31m46 8 42-26M795 310v-84m0 26-44-25m44 3 48-39"/></g><path d="M460 172q45-28 100 0q-55 42-100 0ZM478 173l-35-26v50Z" fill="#f7d46e"/><circle cx="522" cy="169" r="5" fill="#234e66"/>',
      mountains:'<path d="M0 284l240-217 165 155 145-198 190 210 123-140 137 183V340H0Z" fill="#7496a0"/><path d="M169 135l71-68 83 78-79-26-25 25ZM482 97l68-73 70 76-67-24-29 25ZM810 153l53-59 57 67-53-20-24 12Z" fill="#e8f4f4"/><path d="M0 301q370-65 1000 0V340H0Z" fill="#486b79"/>',
      space:'<circle cx="805" cy="125" r="135" fill="#6c72c1"/><path d="M677 120q131-130 290 37" fill="none" stroke="#e8c773" stroke-width="19"/><path d="M170 110h235v28H170Z" fill="#e3e8f5"/><path d="M250 80h75v85h-75Z" fill="#aebcdd" stroke="#4f6087" stroke-width="6"/><path d="M150 72l-110-20v122l110-20ZM422 72l110-20v122l-110-20Z" fill="#6696c6"/><g fill="#fff5d2"><circle cx="88" cy="26" r="4"/><circle cx="600" cy="45" r="5"/><circle cx="550" cy="227" r="3"/><circle cx="460" cy="300" r="3"/></g>',
      city:'<path d="M0 286V174h90v-78h122v124h73V90h92v159h82V130h110v140h77V74h131v153h82V156h141v130Z" fill="#596388"/><path d="M0 290q500-30 1000 0V340H0Z" fill="#8d6791"/><path d="M400 285V133l100-72 100 72v152Z" fill="#f1c77b" stroke="#5d4b6d" stroke-width="10"/><path d="M470 285V180q30-37 60 0v105" fill="#614d7a"/><g fill="#fff9d8"><circle cx="120" cy="210" r="9"/><circle cx="346" cy="153" r="8"/><circle cx="717" cy="118" r="8"/></g>'
    };
    const s=document.createElementNS("http://www.w3.org/2000/svg","svg");
    s.setAttribute("viewBox","0 0 1000 340");
    s.setAttribute("aria-hidden","true");
    s.innerHTML='<circle cx="850" cy="70" r="50" fill="#fff6d9" opacity=".7"/><path d="M0 265Q180 200 390 245T730 240T1000 258V340H0Z" fill="var(--scene-hill)"/>'+extra[world.scene];
    art.append(s);
    return art;
  }
  const introBanner = (world) => {
    const hero=div("nqw-hero");
    const art=scenery(world);
    append(hero,art);
    const copy=div("nqw-hero-copy");
    append(copy,elem("span","nqw-kicker","WORLD "+String(D.worlds.indexOf(world)+1).padStart(2,"0")+" OF 09"),heading(1,world.name),paragraph(world.intro));
    append(hero,copy);
    return hero;
  };
  function compatible(learn,world) {
    if (!learn || typeof learn.skill!=="function" || typeof learn.stopStatus!=="function") return false;
    try {return !!learn.skill(world.stops[0].skills[0].id) && !!learn.stopStatus(world.stops[0].id);} catch (_) {return false;}
  }
  function statusOf(learn,world,stop) {
    if (!compatible(learn,world)) return null;
    try {return learn.stopStatus(stop.id);} catch (_) {return null;}
  }
  function bannerText(s) {
    if (!s) return "Curriculum preview";
    if (s.complete) return "Engine: completed";
    if (s.unlocked) return "Engine: "+s.step;
    return "Engine: prerequisites pending";
  }
  function renderHub(root, route, profile, learn) {
    const out=shell(root);
    const hero=panel();hero.classList.add("nqw-welcome");
    append(hero,elem("span","nqw-kicker","THE MUSICAL ADVENTURE"),heading(1,"Where will your music take you?"),paragraph("Nine places to explore, from your first keyboard landmarks to independent performance. Your music journey belongs to your learner profile."),paragraph("World maps are open for exploration. Real lesson progress is only awarded by the approved learning engine.","nqw-muted"));
    const quick=div("nqw-quick");
    append(quick,action("🧭 Explore the journey",()=>document.getElementById("nqw-world-grid")?.scrollIntoView({behavior:"smooth"}),"nqw-btn nqw-primary"),action("🎹 Practice games",()=>route("games"),"nqw-btn"));
    const ref=action("📚 Music Reference",()=>{location.href="./reference.html"},"nqw-btn");ref.title="Glossary, scales, chords and metronome";append(quick,ref);
    const progress=action("📊 My Progress · coming soon",()=>{},"nqw-btn nqw-disabled");progress.disabled=true;progress.title="Skill history requires the reviewed learning engine";append(quick,progress);
    append(hero,quick);
    if(profile)append(hero,paragraph("Explorer: "+profile.name,"nqw-profile"));
    append(out,hero,heading(2,"Your nine worlds"));
    const note=paragraph("Explore each location and its lesson plan. These world previews do not mark lessons complete or unlock the next destination.","nqw-muted");append(out,note);
    const grid=div("nqw-world-grid");grid.id="nqw-world-grid";
    D.worlds.forEach((w,i)=>{
      const card=elem("article","nqw-world-card");
      card.style.setProperty("--nqw-accent",w.colors[3]);
      append(card,scenery(w));
      const copy=div("nqw-card-copy");
      append(copy,elem("span","nqw-kicker","CHAPTER "+String(i+1).padStart(2,"0")),heading(3,w.icon+" "+w.name),paragraph(w.focus,"nqw-card-desc"));
      const sample=compatible(learn,w)?w.stops.map(s=>statusOf(learn,w,s)).filter(Boolean):[];
      const msg=sample.length?sample.filter(s=>s.complete).length+" of "+w.stops.length+" stops completed (engine)":
        w.stops.length+" lesson stops · Preview";
      append(copy,paragraph(msg,"nqw-counter"),action("Explore "+w.name,()=>route("nqwWorld",w.id),"nqw-btn nqw-primary"));
      append(card,copy);grid.append(card);
    });
    out.append(grid);
  }
  function renderWorld(root, route, id, learn, {playHarbor=false,playReadiness=false}={}) {
    const w=byId.get(id);if(!w){route("nqwHub");return;}
    const out=shell(root);append(out,introBanner(w));
    const lead=panel();
    append(lead,heading(2,"Your path through "+w.name),paragraph(w.journey),paragraph("Learn an idea, practice it, and show what you can do.","nqw-muted"));
    if(playHarbor && id==="NQ-00") {
      append(lead,action("Play Melody Harbor lessons",()=>route("harborLessons"),"nqw-btn nqw-primary"));
    }
    append(out,lead);
    const stat=compatible(learn,w)?"Lesson statuses reflect your learner’s progress.":"This map previews the upcoming curriculum.";
    append(out,paragraph(stat,"nqw-notice"));
    const trail=div("nqw-stop-trail");
    w.stops.forEach((stop,i)=>{
      const row=elem("article","nqw-stop-card"),count=elem("span","nqw-stop-number",String(i+1).padStart(2,"0"));
      const copy=div("nqw-stop-copy");
      append(copy,heading(3,stop.title),paragraph(stop.summary,"nqw-muted"),paragraph(bannerText(statusOf(learn,w,stop)),"nqw-counter"));
      if(stop.optionalRescue)append(copy,paragraph("Optional wildlife discovery: "+stop.optionalRescue,"nqw-rescue"));
      append(row,count,copy,action("View skills",()=>route("nqwStop",stop.id),"nqw-btn nqw-primary"));trail.append(row);
    });
    append(out,heading(2,"Adventure stops"),trail);
    const next=panel();next.classList.add("nqw-departure");
    if(w.next){
      const destination=byId.get(w.next.to);
      append(next,elem("span","nqw-kicker","JOURNEY PREPARATION"),heading(2,"Before we travel to "+destination.name+"…"),paragraph(w.next.guide));
      append(next,action(playReadiness?"Prepare for the journey":"Preview readiness challenge",()=>route("nqwReadiness",w.id),"nqw-btn nqw-gold"));
    }else{
      append(next,elem("span","nqw-kicker","GRAND RECITAL"),heading(2,"The journey continues with your music"),paragraph("Show what you can perform, create and understand. Grand Music City leads into independent practice, not a forced tenth world."),action("View recital preparation",()=>route("nqwReadiness",w.id),"nqw-btn nqw-gold"));
    }
    append(out,next,action("← All nine worlds",()=>route("nqwHub"),"nqw-btn nqw-secondary"));
  }
  function renderStop(root,route,id,learn) {
    const entry=toStop.get(id);if(!entry){route("nqwHub");return;}
    const {world:w,stop:s}=entry,out=shell(root);
    append(out,elem("span","nqw-kicker",w.name+" · STOP "+String(w.stops.indexOf(s)+1).padStart(2,"0")),heading(1,s.title),paragraph(s.summary,"nqw-lead"),paragraph("Three musical abilities are introduced at this stop. These are curriculum objectives—not simulated student scores.","nqw-notice"));
    const flow=div("nqw-phase-grid");
    [["01","LEARN","Understand the new musical idea and see a clear example."],["02","PRACTICE","Try short, supportive exercises and receive specific hints."],["03","PROVE","Demonstrate the ability with an engine-checked task or explicitly identified human observation."]].forEach(x=>{
      const tile=panel();append(tile,elem("span","nqw-kicker",x[0]),heading(3,x[1]),paragraph(x[2]));flow.append(tile);
    });
    append(out,flow,heading(2,"What you'll learn"));
    const list=div("nqw-skills");
    s.skills.forEach(skill=>{
      const card=panel();
      append(card,heading(3,skill.objective),paragraph("Coaching clue: "+(skill.coach||"Specific guidance will be authored.")),paragraph("Evidence: "+skill.assessment.replaceAll("-"," ")+" · "+skill.type,"nqw-muted"));
      list.append(card);
    });
    out.append(list);
    const status=statusOf(learn,w,s);
    append(out,paragraph(status?"Read-only engine status: "+bannerText(status):"Full skill checks are not live on this curriculum preview.","nqw-notice"));
    const actions=div("nqw-quick");
    append(actions,action("← "+w.name,()=>route("nqwWorld",w.id),"nqw-btn nqw-secondary"),action("🎹 Practice existing games",()=>route("games"),"nqw-btn nqw-gold"));
    out.append(actions);
  }
  function renderReadiness(root,route,id) {
    const w=byId.get(id);if(!w){route("nqwHub");return;}const out=shell(root);
    const destination=w.next?byId.get(w.next.to):null;
    append(out,elem("span","nqw-kicker","JOURNEY READINESS · PREVIEW"),heading(1,destination?"Are you ready for "+destination.name+"?":"Ready for your Grand Music City recital?"),paragraph(w.next?w.next.guide:"This final showcase is about expressive performance, thoughtful reflection and continued independent musicianship.","nqw-lead"));
    append(out,paragraph("This is a story and requirements preview. It cannot certify your playing, record assessment results or unlock curriculum destinations.","nqw-notice"));
    const cats=[["🧭","Navigation","Show you can find or read the needed notes and patterns."],["🥁","Timing","Keep a steady pulse and recognize the rhythm you will encounter."],["🎹","Performance","Demonstrate a short musical skill at the piano; human checks remain explicitly labeled."]];
    const grid=div("nqw-phase-grid");cats.forEach(v=>{const card=panel();append(card,elem("span","nqw-phase-icon",v[0]),heading(3,v[1]),paragraph(v[2]),tag("Assessment engine pending"));grid.append(card)});
    append(out,grid,paragraph("If one area needs more practice, the eventual engine should preserve the areas already demonstrated and guide you to a targeted exercise. No lives, penalty or pet neglect.","nqw-muted"));
    const row=div("nqw-quick");append(row,action("← Back to "+w.name,()=>route("nqwWorld",w.id),"nqw-btn nqw-secondary"),action("🎹 Practice current games",()=>route("games"),"nqw-btn nqw-gold"));out.append(row);
  }
  window.NoteQuestWorlds={renderHub,renderWorld,renderStop,renderReadiness,compatible,statusOf,getWorld:id=>byId.get(id)||null,getStop:id=>toStop.get(id)||null};
})();
