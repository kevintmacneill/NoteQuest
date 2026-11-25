/* Companion Sanctuary: presentation and navigation only. */
(function(){'use strict';

function mount(root,{engine,learnerId,go,petArt,startArea,petId}){
  const K=engine.content;
  const sameLearner=()=>engine.profiles.current()?.id===learnerId;
  let active=true, area=startArea==='hospital'?'hospital':'pen';
  const selected={pen:null,hospital:null};
  let discovery=null, needNotice=null;
  selected[area]=petId??null;
  const feedback=document.createElement('p');
  feedback.className='care-feedback';
  feedback.setAttribute('role','status');
  const page=document.createElement('section');
  page.className='nq-sanctuary';
  NoteQuestCareTheme.apply(page,engine);
  page.setAttribute('aria-labelledby','nq-sanctuary-title');
  root.replaceChildren(page);
  const header=document.createElement('header');
  const tabs=document.createElement('nav');
  tabs.setAttribute('aria-label','Sanctuary areas');
  const panel=document.createElement('section');
  panel.id='nq-sanctuary-area';
  const title=document.createElement('h1');
  title.id='nq-sanctuary-title';
  title.textContent='Companion Sanctuary';
  header.append(button('Back to Village',()=>go('menu')),title);
  for(const [id,label] of [['pen','Shared Pen'],['hospital','Hospital Bay']]){
    const tab=button(label,()=>{area=id;feedback.textContent='';render();});
    tab.dataset.area=id;
    tab.setAttribute('aria-controls',panel.id);
    tabs.append(tab);
  }
  page.append(header,tabs,panel,feedback);

  function node(tag,label){
    const el=document.createElement(tag);
    el.textContent=label;
    return el;
  }
  function button(label,run){
    const el=node('button',label);
    el.type='button';
    el.className='nqh-btn';
    el.addEventListener('click',()=>{
      if(active&&sameLearner()&&el.isConnected)run();
    });
    return el;
  }
  function buy(kind,id,label){
    const price=engine.shop.price(kind,id);
    if(price==null)return null;
    const purchase=button(label+' · '+price+' coins',()=>{
      const result=engine.shop.buy(kind,id);
      update(result.ok?'Supplies added.':result.reason==='coins'?'You need more coins for that.':'That item is unavailable.');
    });
    purchase.dataset.action='buy-'+id;
    return purchase;
  }
  function update(message){
    const focus=document.activeElement;
    const action=focus?.dataset?.action;
    const left=panel.querySelector('.nq-sanctuary-roster')?.scrollLeft||0;
    render();
    const roster=panel.querySelector('.nq-sanctuary-roster');
    if(roster)roster.scrollLeft=left;
    if(action){
      const replacement=[...panel.querySelectorAll('[data-action]')].find(el=>el.dataset.action===action);
      if(replacement){
        replacement.focus({preventScroll:true});
        if(replacement.closest('.nq-sanctuary-roster'))replacement.scrollIntoView({block:'nearest',inline:'nearest'});
      }else panel.querySelector('h2')?.focus();
    }
    feedback.textContent=message;
  }
  const largePets=new Set(['capybara','cow','pony','llama','unicorn','dragon','jaguar','dog']);
  const flyers=new Set(['owl','parrot','toucan','bee','butterfly']);
  function selectButton(pet,source){
    const item=button('',()=>{selected[area]=pet.id;update('');});
    item.className='nq-sanctuary-animal';
    item.dataset.action=source+'-'+pet.id;
    item.setAttribute('aria-label',(source==='scene'?'Visit ':'Select ')+pet.name);
    item.setAttribute('aria-pressed',String(selected[area]===pet.id));
    const art=node('span','');
    art.className='nq-sanctuary-pet-art';
    art.setAttribute('aria-hidden','true');
    art.innerHTML=petArt(pet);
    item.append(art,node('strong',pet.name));
    return item;
  }
  function population(animals,companion){
    const scene=node('div',''),roster=node('div','');
    scene.className='nq-sanctuary-scene nq-sanctuary-'+area;
    scene.setAttribute('role','group');
    scene.setAttribute('aria-label',area==='pen'?'Animals in the shared pen':'Recovery bays');
    roster.className='nq-sanctuary-roster';
    roster.setAttribute('role','group');
    roster.setAttribute('aria-label',area==='pen'?'Animal portraits':'Patient portraits');
    const inArea=animals.find(pet=>pet.id===selected[area])||
      animals.find(pet=>pet.id===companion?.id)||animals[0];
    selected[area]=inArea?.id??null;
    const sceneOrder=area==='pen'
      ? [...animals.filter(pet=>!flyers.has(pet.sp)),...animals.filter(pet=>flyers.has(pet.sp))]
      : animals;
    for(const pet of sceneOrder){
      const item=selectButton(pet,'scene');
      item.classList.toggle('nq-sanctuary-perch',area==='pen'&&flyers.has(pet.sp));
      item.classList.toggle('nq-sanctuary-wide-mat',area==='hospital'&&largePets.has(pet.sp));
      scene.append(item);
    }
    if(area==='hospital'&&animals.length<3){
      const spare=node('div','');
      spare.className='nq-sanctuary-empty-bay';
      spare.setAttribute('aria-hidden','true');
      scene.append(spare);
    }
    for(const pet of animals)roster.append(selectButton(pet,'portrait'));
    panel.append(scene);
    if(animals.length)panel.append(roster);
    return inArea;
  }
  function watchDiscovery(notice){
    discovery?.disconnect();
    needNotice=notice;
    if(!notice)return;
    const openArea=area;
    discovery=new IntersectionObserver(entries=>{
      if(!active||!sameLearner()||document.hidden||area!==openArea||!notice.isConnected||
         !entries.some(entry=>entry.isIntersecting))return;
      discovery.disconnect();
      engine.sanctuary.viewed(openArea);
    },{threshold:0});
    discovery.observe(notice);
  }
  function onVisibility(){
    if(!document.hidden&&needNotice?.isConnected)watchDiscovery(needNotice);
  }
  function petCard(pet,companion){
    const card=node('article','');
    card.className='nq-sanctuary-care';
    card.append(node('h3',pet.name));
    if(area==='hospital')card.append(node('p','Needs care'));
    if(pet.egg){
      card.append(node('p','Still in its egg. Play music to help it hatch.'));
      return card;
    }
    const display=engine.pets.display(pet.id);
    const mood=['Content','Restless','Upset','Very upset'][display?.frustration]||'Content';
    const cue=node('p',mood);
    cue.className='nq-sanctuary-mood';
    cue.dataset.frustration=String(display?.frustration||0);
    card.append(cue);
    if(companion?.id===pet.id)card.append(node('p','Your adventure companion'));
    else if(area==='pen'){
      const choose=button('Choose '+pet.name+' as companion',()=>{
        const result=engine.companions.set(pet.id);
        update(result.ok?pet.name+' will join your adventures.':'This companion is unavailable.');
      });
      choose.dataset.action='choose-'+pet.id;
      card.append(choose);
    }
    const food=K.SPECIES_BY_ID[pet.sp]?.fav;
    if(food&&K.FOODS[food]){
      const count=engine.profiles.current().inv?.[food]||0;
      if(count){
        const feed=button('Feed '+pet.name+' ('+count+' left)',()=>{
          const result=engine.pets.feed(pet.id,food);
          update(result.ok?pet.name+' enjoyed the snack.':'That snack is unavailable.');
        });
        feed.dataset.action='feed-'+pet.id;
        card.append(feed);
      }else{
        const snack=buy('food',food,'Get '+K.FOODS[food].n);
        if(snack)card.append(snack);
      }
    }
    const play=button('Play with '+pet.name,()=>{
      const result=engine.pets.play(pet.id);
      update(result.ok?(result.napping?pet.name+' is ready for a nap.':pet.name+' enjoyed playing.'):
        result.reason==='sleeping'?pet.name+' is sleeping.':'Playing needs a toy.');
    });
    play.dataset.action='play-'+pet.id;
    if(engine.profiles.current().tools?.includes('toy'))card.append(play);
    else{
      const toy=buy('tool','toy','Get a toy');
      if(toy)card.append(toy);
    }
    if(display?.condition==='sleeping'){
      const wake=button('Wake '+pet.name+' gently',()=>{
        const result=engine.pets.wake(pet.id);
        update(result.ok?pet.name+' is awake.':'This pet cannot be woken now.');
      });
      wake.dataset.action='wake-'+pet.id;
      card.append(wake);
    }
    const bath=button('Bathe '+pet.name,()=>go('sanctuaryBath',pet.id));
    card.append(bath);
    return card;
  }
  function render(){
    if(!active||!sameLearner())return;
    const state=engine.sanctuary.state();
    const supplies=engine.pets.supplies();
    const companion=engine.companions.get().companion;
    const kind=area==='pen'?'dirty-pen':'sick';
    const heading=node('h2',area==='pen'?'Shared Pen':'Hospital Bay');
    heading.tabIndex=-1;
    for(const tab of tabs.children)tab.setAttribute('aria-pressed',String(tab.dataset.area===area));
    watchDiscovery(null);
    panel.replaceChildren(heading);
    const animals=state[area].animals.map(id=>engine.pets.byId(id)).filter(Boolean);
    const issues=state.issues.filter(issue=>issue.kind===kind);
    if(issues.length){
      const notice=node('p',area==='pen'?'The pen still needs cleaning.':'Friends here still need care.');
      notice.id='nq-sanctuary-need';
      if(area==='hospital'){
        const patients=animals.filter(pet=>issues.some(issue=>issue.petIds.includes(pet.id)));
        if(patients.length)notice.textContent='Still needs care: '+patients.map(pet=>pet.name).join(', ')+'.';
      }
      panel.append(notice,node('p','If you go on another adventure before helping, your companions may feel neglected.'));
      if(issues.some(issue=>!issue.observed))watchDiscovery(notice);
    }
    const chosen=population(animals,companion);
    if(chosen)panel.append(petCard(chosen,companion));
    else panel.append(node('p',area==='pen'?'No companions are in the pen yet.':'No friends need the hospital right now.'));
    if(area==='pen'){
      const messes=state.pen.mess;
      panel.append(node('h3','Clean the pen'),node('p','Cleaning bags: '+supplies.bags));
      if(!messes.length)panel.append(node('p','The pen is clean.'));
      const canClean=engine.pens.canClean();
      const chores=document.createElement('div');
      chores.className='nq-sanctuary-chores';
      for(const [index,mess] of messes.entries()){
        const clean=button('Clean spot '+(index+1),()=>{
          const result=engine.pens.cleanMess(mess.id);
          update(result.ok?'This spot is clean.':'This spot could not be cleaned.');
        });
        clean.dataset.action='clean-'+mess.id;
        clean.disabled=!canClean.ok;
        chores.append(clean);
      }
      panel.append(chores);
      if(!supplies.bags){
        const bags=buy('supply','bags','Get cleaning bags');
        if(bags)panel.append(bags);
      }
    }
    if(!supplies.soap){
      const soap=buy('supply','soap','Get soap');
      if(soap)panel.append(soap);
    }
  }
  const off=engine.on('pet:ward',()=>queueMicrotask(()=>{
    if(active&&sameLearner())update('');
  }));
  document.addEventListener('visibilitychange',onVisibility);
  render();
  title.tabIndex=-1;
  title.focus({preventScroll:true});
  return ()=>{active=false;off();watchDiscovery(null);document.removeEventListener('visibilitychange',onVisibility);};
}
window.NoteQuestSanctuary={mount};
})();
