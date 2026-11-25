/* Companion Sanctuary: presentation and navigation only. */
(function(){'use strict';

function mount(root,{engine,learnerId,go,petArt}){
  const K=engine.content;
  const sameLearner=()=>engine.profiles.current()?.id===learnerId;
  let active=true, area='pen';
  const feedback=document.createElement('p');
  feedback.className='care-feedback';
  feedback.setAttribute('role','status');
  const page=document.createElement('section');
  page.className='care-studio nq-sanctuary';
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
      if(active&&sameLearner()&&page.isConnected)run();
    });
    return el;
  }
  function buy(kind,id,label){
    const price=engine.shop.price(kind,id);
    if(price==null)return null;
    const purchase=button(label+' · '+price+' coins',()=>{
      const result=engine.shop.buy(kind,id);
      update(result.ok?'Supplies added.':'You need more coins for that.');
    });
    purchase.dataset.action='buy-'+id;
    return purchase;
  }
  function update(message){
    const focus=document.activeElement;
    const action=focus?.dataset?.action;
    render();
    if(action){
      const replacement=[...panel.querySelectorAll('[data-action]')].find(el=>el.dataset.action===action);
      (replacement||panel.querySelector('h2'))?.focus();
    }
    feedback.textContent=message;
  }
  function petCard(pet,companion){
    const card=document.createElement('article');
    card.className='care-pet-choice';
    const art=node('span','');
    art.setAttribute('aria-hidden','true');
    art.innerHTML=petArt(pet);
    card.append(art,node('h3',pet.name));
    if(pet.egg){
      card.append(node('p','Still in its egg. Play music to help it hatch.'));
      return card;
    }
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
    panel.replaceChildren(heading);
    const issues=state.issues.filter(issue=>issue.kind===kind);
    if(issues.length){
      const notice=node('p',area==='pen'?'The pen still needs cleaning.':'Friends here still need care.');
      notice.id='nq-sanctuary-need';
      panel.append(notice,node('p','If you go on another adventure before helping, your companions may feel neglected.'));
      if(issues.some(issue=>!issue.observed)){
        const acknowledge=button('I see what needs care',()=>{
          if(document.hidden||!notice.isConnected||!notice.getClientRects().length)return;
          engine.sanctuary.viewed(area);
          update('This care is still needed.');
        });
        acknowledge.dataset.action='acknowledge';
        acknowledge.setAttribute('aria-describedby',notice.id);
        panel.append(acknowledge);
      }
    }
    const grid=document.createElement('div');
    grid.className='care-pet-grid';
    for(const id of state[area].animals){
      const pet=engine.pets.byId(id);
      if(pet)grid.append(petCard(pet,companion));
    }
    panel.append(grid);
    if(!grid.children.length)panel.append(node('p',area==='pen'?'No companions are in the pen yet.':'No friends need the hospital right now.'));
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
  render();
  title.tabIndex=-1;
  title.focus({preventScroll:true});
  return ()=>{active=false;};
}
window.NoteQuestSanctuary={mount};
})();
