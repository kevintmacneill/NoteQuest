
"use strict";
(() => {
 const $ = id => document.getElementById(id);
 const TERMS=[
 ["Accidental","Notation","A sharp (♯), flat (♭), or natural (♮) that changes a note from the key signature within its measure.","A sharp raises the written note by a semitone."],
 ["Arpeggio","Harmony","Notes of a chord played one after another rather than all together.","C–E–G–C is a C major arpeggio."],
 ["Bar / measure","Rhythm","A segment of music with the number of beats shown by its time signature.","In 4/4 a usual measure holds four quarter-note beats."],
 ["Bass clef","Notation","A clef placing F3 on the line between its two dots; often used for lower pitches.","The fourth line of the bass staff is F3."],
 ["Beat","Rhythm","An underlying regular pulse you can count or tap.","Count 1, 2, 3, 4 while tapping steadily."],
 ["BPM","Rhythm","Beats per minute; the rate at which counted beats or metronome clicks occur.","60 BPM means one click each second."],
 ["Cadence","Harmony","A harmonic ending or pause that gives a phrase a sense of arrival or continuation.","A V–I cadence often sounds conclusive."],
 ["Chord","Harmony","Three or more notes considered together as a harmonic unit; some styles also name two-note sonorities chords.","C–E–G is a C major triad."],
 ["Chord inversion","Harmony","A chord voicing with a chord tone other than its root as the lowest note.","C/E has E in the bass."],
 ["Chromatic","Theory","Moving in semitone steps, using pitches outside or inside a particular scale.","C–C♯–D moves chromatically."],
 ["Clef","Notation","A sign defining pitch reference points for a staff.","Treble and bass clefs identify different staff pitches."],
 ["Crescendo","Expression","Gradually growing louder.","A hairpin opening to the right often shows crescendo."],
 ["Diatonic","Harmony","Built from the notes of a particular scale or key.","In C major, the diatonic ii triad is D–F–A."],
 ["Diminished triad","Harmony","A triad containing a minor third above the root and a diminished fifth.","B–D–F is diminished in C major."],
 ["Dominant","Harmony","The fifth scale degree; dominant harmony often creates a pull toward the tonic.","G major is V in C major."],
 ["Dotted note","Rhythm","A dot adds half of the undotted note's duration.","A dotted half note lasts three quarter beats."],
 ["Dynamics","Expression","Markings or instructions for loudness.","p means soft; f means loud."],
 ["Eighth note","Rhythm","A note normally lasting half a quarter-note beat.","Two eighth notes fit one quarter beat."],
 ["Enharmonic","Theory","Two spellings for the same equal-tempered piano key.","F♯ and G♭ sound the same on a standard piano."],
 ["Fermata","Expression","A symbol asking the performer to hold a note or rest longer than written.","The hold length is interpreted musically."],
 ["Flat (♭)","Notation","Lowers a written pitch by one semitone.","B♭ is one semitone below B."],
 ["Forte (f)","Expression","A dynamic instruction meaning loud or strong.","Play confidently without forcing your hands."],
 ["Half note","Rhythm","Normally lasts two quarter-note beats.","In 4/4 two half notes fill a measure."],
 ["Harmonic minor","Theory","A minor scale with its seventh degree raised compared with natural minor.","A harmonic minor is A–B–C–D–E–F–G♯."],
 ["Interval","Theory","The distance between two pitches, named by letter-span and quality.","C to E is a major third."],
 ["Key signature","Notation","Sharps or flats printed after the clef that normally apply throughout the piece.","G major has one sharp: F♯."],
 ["Ledger line","Notation","A short line extending the staff above or below its five lines.","Middle C may appear on a ledger line."],
 ["Legato","Expression","Smoothly connected notes.","A slur often suggests legato."],
 ["Major scale","Theory","A seven-note pattern of whole and half steps: W–W–H–W–W–W–H.","C–D–E–F–G–A–B."],
 ["Metronome","Practice","A tool giving regular audible or visible beats at an adjustable tempo.","Set 72 BPM and count along."],
 ["Minor scale (natural)","Theory","A seven-note scale with steps W–H–W–W–H–W–W.","A–B–C–D–E–F–G."],
 ["Middle C","Notation","C4, a useful pitch near the middle of a standard piano keyboard.","Middle C is MIDI note 60."],
 ["Octave","Theory","An interval between one note and the next note with the same letter name.","C4 to C5 is an octave."],
 ["Phrase","Expression","A meaningful musical idea, much like a sentence.","Breathe musically at a phrase ending."],
 ["Piano (p)","Expression","A dynamic instruction meaning soft or quiet.","Play softly but clearly."],
 ["Quarter note","Rhythm","Normally lasts one quarter-note beat.","Four quarters fill a 4/4 measure."],
 ["Relative minor","Harmony","A minor key sharing a major key's key signature.","A minor is relative to C major."],
 ["Rest","Rhythm","A notated duration of silence.","A quarter rest lasts one counted quarter beat."],
 ["Scale","Theory","An ordered set of pitches chosen by a step pattern.","A major scale has seven distinct degrees."],
 ["Semitone","Theory","The smallest adjacent piano-key step in twelve-tone equal temperament.","E to F is a semitone."],
 ["Sharp (♯)","Notation","Raises a written note by one semitone.","F♯ is one semitone higher than F."],
 ["Sixteenth note","Rhythm","Usually lasts one quarter of a quarter-note beat.","Four sixteenth notes equal one quarter note."],
 ["Staccato","Expression","Short, separated notes with space between them.","A dot above or below a note often indicates staccato."],
 ["Staff","Notation","Five horizontal lines and four spaces used to notate pitches.","The clef determines which pitches the lines represent."],
 ["Tempo","Rhythm","The speed of a musical pulse.","Andante often means a walking pace, but BPM is precise."],
 ["Time signature","Rhythm","Numbers showing how beats or note divisions group into measures.","4/4 uses four quarter-note beats; 6/8 groups six eighths, often felt in two."],
 ["Tonic","Harmony","The first scale degree and tonal center.","C is the tonic of C major."],
 ["Treble clef","Notation","A clef curling around the G4 line, commonly used for higher pitches.","The second line of treble staff is G4."],
 ["Triad","Harmony","A three-note chord built from a root, third and fifth.","D–F–A is a D minor triad."],
 ["Whole note","Rhythm","Usually lasts four quarter-note beats.","One whole note fills a 4/4 measure."],
 ["Whole step","Theory","Two semitones between pitches.","C to D is a whole step."]
 ];
 const catalogs={major:["C","G","D","A","E","B","F#","Db","Ab","Eb","Bb","F"],
 minor:["A","E","B","F#","C#","G#","D#","Bb","F","C","G","D"]};
 const patterns={major:[2,2,1,2,2,2,1],natural:[2,1,2,2,1,2,2],harmonic:[2,1,2,2,1,3,1]};
 const NAT={C:0,D:2,E:4,F:5,G:7,A:9,B:11}, LETTERS=["C","D","E","F","G","A","B"];
 const romans=["I","II","III","IV","V","VI","VII"];
 const mod=(n,m)=>((n%m)+m)%m;
 const pitch=name=>mod(NAT[name[0]]+[...name.slice(1)].reduce((v,c)=>v+(c==="#"?1:c==="b"?-1:0),0),12);
 function spellScale(root,pat){
   let current=pitch(root), idx=LETTERS.indexOf(root[0]), notes=[];
   for(let i=0;i<7;i++){
     const letter=LETTERS[(idx+i)%7];
     let offset=mod(current-NAT[letter],12);if(offset>6)offset-=12;
     const suffix=offset===-2?"bb":offset===-1?"b":offset===0?"":offset===1?"#":offset===2?"##":null;
     if(suffix===null)throw Error("Unsupported note spelling");
     notes.push(letter+suffix);current=mod(current+pat[i],12);
   }
   return notes;
 }
 const readable=s=>s.replace(/bb/g,"♭♭").replace(/b/g,"♭").replace(/##/g,"♯♯").replace(/#/g,"♯");
 function chordQuality(notes){
    const p=notes.map(pitch),t=mod(p[1]-p[0],12),f=mod(p[2]-p[0],12);
    const q=t===4&&f===7?"major":t===3&&f===7?"minor":t===3&&f===6?"diminished":t===4&&f===8?"augmented":"other";
    let seventh="";
    if(notes.length===4){const v=mod(p[3]-p[0],12);seventh=q==="major"?(v===11?"maj7":v===10?"7":"other"):q==="minor"?(v===10?"m7":v===11?"m(maj7)":"other"):q==="diminished"?(v===10?"m7♭5":v===9?"dim7":"other"):q==="augmented"?(v===11?"aug(maj7)":v===10?"aug7":"other"):"other";}
    return {quality:q,seventh};
 }
 function chordName(root,quality){
   return readable(root)+(quality==="major"?"":quality==="minor"?"m":quality==="diminished"?"dim":quality==="augmented"?"aug":"?");
 }
 function roman(i,quality){
   return quality==="major"?romans[i]:quality==="minor"?romans[i].toLowerCase():quality==="diminished"?romans[i].toLowerCase()+"°":quality==="augmented"?romans[i]+"+":"?";
 }
 function chordsFor(notes){
   return notes.map((root,i)=>{const triad=[notes[i],notes[(i+2)%7],notes[(i+4)%7]],seven=[...triad,notes[(i+6)%7]],q=chordQuality(triad),t=chordQuality(seven);
      return {degree:i+1,roman:roman(i,q.quality),root,notes:triad,seven,quality:q.quality,seventh:t.seventh,label:chordName(root,q.quality)};
   });
 }
 const tabButtons=[...document.querySelectorAll("[data-tab]")];
 tabButtons.forEach(btn=>btn.addEventListener("click",()=>{
   const tab=btn.dataset.tab;tabButtons.forEach(b=>{b.setAttribute("aria-selected",String(b.dataset.tab===tab));b.tabIndex=b.dataset.tab===tab?0:-1});
   document.querySelectorAll("[data-panel]").forEach(s=>s.hidden=s.dataset.panel!==tab);
   if(tab==="glossary")$("glossarySearch").focus();
 }));
 function renderGlossary(){
   const text=$("glossarySearch").value.toLocaleLowerCase().trim(), cat=$("glossaryCategory").value;
   const found=TERMS.filter(([name,group,def,example])=>(cat==="All"||cat===group)&&[name,group,def,example].some(v=>v.toLocaleLowerCase().includes(text)));
   const body=$("glossaryItems");body.replaceChildren();
   found.sort((a,b)=>a[0].localeCompare(b[0]));
   for(const [name,group,definition,example] of found){
      const el=document.createElement("article");el.className="card term";
      const tag=document.createElement("div");tag.className="tag";tag.textContent=group;
      const h=document.createElement("h3");h.textContent=name;
      const p=document.createElement("p");p.textContent=definition;
      const ex=document.createElement("p");ex.className="small";ex.textContent="Example: "+example;
      el.append(tag,h,p,ex);body.append(el);
   }
   $("glossaryCount").textContent=found.length+" terms shown";
   if(!found.length){const p=document.createElement("p");p.textContent="No matching terms. Try another search or category.";body.append(p);}
 }
 const cat=$("glossaryCategory");
 const categories=[...new Set(TERMS.map(x=>x[1]))].sort();
 for(const name of ["All",...categories]){const o=document.createElement("option");o.value=name;o.textContent=name==="All"?"All categories":name;cat.append(o);}
 $("glossarySearch").addEventListener("input",renderGlossary);
 cat.addEventListener("change",renderGlossary);
 renderGlossary();
 function setKeys(){
   const minor=$("scaleMode").value!=="major",root=$("scaleRoot");const old=root.value;root.replaceChildren();
   const pool=catalogs[minor?"minor":"major"];
   for(const name of pool){const opt=document.createElement("option");opt.value=name;opt.textContent=readable(name);root.append(opt)}
   root.value=pool.includes(old)?old:minor?"A":"C";
 }
 function renderScale(){
   const root=$("scaleRoot").value,mode=$("scaleMode").value,notes=spellScale(root,patterns[mode]);
   const chords=chordsFor(notes);
   $("scaleTitle").textContent=readable(root)+" "+({major:"major",natural:"natural minor",harmonic:"harmonic minor"}[mode]);
   const noteWrap=$("scaleNotes");noteWrap.replaceChildren();
   for(const n of notes){const el=document.createElement("span");el.className="note-pill";el.textContent=readable(n);noteWrap.append(el);}
   $("stepPattern").textContent=patterns[mode].map(n=>n===1?"H":n===2?"W":"3 semitones").join(" · ");
   const body=$("chordBody");body.replaceChildren();
   const sevenths=$("showSevenths").checked;
   for(const c of chords){
     const tr=document.createElement("tr");
     const cells=[c.roman,c.label+(sevenths?" ("+c.seventh+")":""),c.quality,c[sevenths?"seven":"notes"].map(readable).join(" – ")];
     for(const v of cells){const td=document.createElement("td");td.textContent=v;tr.append(td);}
     body.append(tr);
   }
   const progression=$("progression");progression.replaceChildren();
   const degreeGroups=[[0,3,4,0],[0,5,3,4],[1,4,0]];
   for(const group of degreeGroups){
     const row=document.createElement("div");row.className="progressions";
     for(const i of group){const span=document.createElement("span");span.textContent=chords[i].roman+" · "+chords[i].label;row.append(span);}
     progression.append(row);
   }
   $("relativeGuide").textContent=mode==="major"?"The relative natural minor starts on "+readable(notes[5])+". Chords listed below use only the seven notes shown.":"The relative major shares the key signature with this natural minor when its seventh degree is not raised. Chord qualities are computed from the exact notes shown.";
 }
 $("scaleMode").addEventListener("change",()=>{setKeys();renderScale();});
 $("scaleRoot").addEventListener("change",renderScale);
 $("showSevenths").addEventListener("change",renderScale);
 setKeys();renderScale();
 const TEMPO_MIN=30,TEMPO_MAX=240;
 let tempo=88,beats=4,volume=.45,ctx=null,timer=null,nextClick=0,beatIndex=0,playing=false,uiTimers=[],taps=[];
 const controls={slider:$("tempoSlider"),number:$("tempoNumber"),output:$("tempoDisplay"),time:$("timeSignature"),vol:$("metVolume")};
 function renderTempo(){controls.slider.value=tempo;controls.number.value=tempo;controls.output.textContent=tempo+" BPM";$("tempoLabel").textContent=tempo+" clicks per minute";}
 function setTempo(value){
   const n=Math.round(Number(value));if(!Number.isFinite(n))return;
   tempo=Math.max(TEMPO_MIN,Math.min(TEMPO_MAX,n));
   renderTempo();
 }
 controls.slider.addEventListener("input",e=>setTempo(e.target.value));
 controls.number.addEventListener("change",e=>setTempo(e.target.value));
 controls.time.addEventListener("change",()=>{beats=Number(controls.time.value);renderDots();beatIndex=0;if(playing)$("metStatus").textContent=playingStatus();});
 controls.vol.addEventListener("input",()=>{volume=Number(controls.vol.value)/100;});
 function clickAccent(index,count){
   if(index===0)return "primary";
   if(count===6&&index===3)return "secondary";
   return "normal";
 }
 const CLICK={primary:{freq:[1450,900],gain:.40},secondary:{freq:[1175,710],gain:.32},normal:{freq:[900,520],gain:.25}};
 function renderDots(){const wrap=$("beatDots");wrap.replaceChildren();for(let i=0;i<beats;i++){const dot=document.createElement("span");dot.className="beat-dot";dot.dataset.accent=clickAccent(i,beats);dot.setAttribute("aria-hidden","true");wrap.append(dot);}}
 function visualPulse(i,at){const delay=Math.max(0,(at-(ctx?.currentTime||0))*1000);const handle=setTimeout(()=>{
     if(!playing)return;[...$("beatDots").children].forEach((d,j)=>d.classList.toggle("active",i===j));$("beatPosition").textContent="Beat "+(i+1)+" of "+beats;
   },delay);uiTimers.push(handle);}
 function scheduleClick(t,level){
    const tone=CLICK[level]||CLICK.normal;
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type="sine";osc.frequency.setValueAtTime(tone.freq[0],t);osc.frequency.exponentialRampToValueAtTime(tone.freq[1],t+.05);
    gain.gain.setValueAtTime(.0001,t);gain.gain.linearRampToValueAtTime(Math.max(.0001,volume*tone.gain),t+.003);
    gain.gain.exponentialRampToValueAtTime(.0001,t+.085);osc.connect(gain);gain.connect(ctx.destination);osc.start(t);osc.stop(t+.09);
 }
 function playingStatus(){
   return beats===6?"Playing. The first click is the strong one. In 6/8, click 4 is lighter.":"Playing. The first click of each measure is accented.";
 }
 function metTick(){
   if(!ctx||!playing)return;
   while(nextClick<ctx.currentTime+.12){
     const n=beatIndex;
     scheduleClick(nextClick,clickAccent(n,beats));visualPulse(n,nextClick);
     const dur=60/tempo;nextClick+=dur;beatIndex=(beatIndex+1)%beats;
   }
   if(uiTimers.length>80)uiTimers=uiTimers.slice(-40);
 }
 async function start(){
   if(playing)return;
   const A=window.AudioContext||window.webkitAudioContext;
   if(!A){$("metStatus").textContent="This browser does not support Web Audio. Use visual counting instead.";return;}
   try{
     if(!ctx)ctx=new A();
     await ctx.resume();
     playing=true;beatIndex=0;nextClick=ctx.currentTime+.06;
     $("metToggle").textContent="Stop metronome";$("metToggle").setAttribute("aria-pressed","true");
     $("metStatus").textContent=playingStatus();
     timer=setInterval(metTick,25);metTick();
   }catch(e){$("metStatus").textContent="Audio could not start. Tap Start after allowing sound.";}
 }
 function stop(){
   playing=false;clearInterval(timer);timer=null;uiTimers.forEach(clearTimeout);uiTimers=[];
   $("metToggle").textContent="Start metronome";$("metToggle").setAttribute("aria-pressed","false");
   [...$("beatDots").children].forEach(x=>x.classList.remove("active"));$("beatPosition").textContent="Stopped";
   $("metStatus").textContent="Metronome stopped. Choose a tempo and start again.";
 }
 $("metToggle").addEventListener("click",()=>playing?stop():start());
 $("tempoTap").addEventListener("click",()=>{
    const now=performance.now();if(taps.length&&now-taps[taps.length-1]>2200)taps=[];
    taps.push(now);if(taps.length>6)taps.shift();
    if(taps.length>=3){const deltas=taps.slice(1).map((x,i)=>x-taps[i]).filter(v=>v>0);let avg=deltas.reduce((a,b)=>a+b,0)/deltas.length;setTempo(Math.round(60000/avg));}
    $("tapCount").textContent=taps.length<3?"Tap again to measure the beat.":"Tap tempo: "+tempo+" BPM";
 });
 renderTempo();renderDots();
 document.addEventListener("visibilitychange",()=>{if(document.hidden&&playing)stop();});
 window.addEventListener("pagehide",stop);
 window.__notequestReference={spellScale,chordsFor,patterns,TERMS,clickAccent,CLICK}; // pure reference math, no game state
})();
