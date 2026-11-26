/* WP-T1 foundation: pure registry, no live root/engine integration yet. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.NoteQuestWorldTheme=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const BASE='NQ-00';
  const WORLDS=Object.freeze(Array.from({length:9},(_,i)=>'NQ-0'+i));
  const SURFACES=Object.freeze(['village','lesson','results','sanctuaryPen','sanctuaryHospital','settings','grownUp','profiles','practice','trophy','marketplace','outpost']);
  const PALETTE=Object.freeze(['surface','panel','text','muted','focus','border','accent']);
  const LAYERS=Object.freeze(['sky','mountains','city','foreground']);
  const own=(o,k)=>o!=null&&Object.prototype.hasOwnProperty.call(o,k);
  function freeze(o){if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o)}return o}
  // Existing approved/currently shipped assets only. Draft means NOT full Phase 1 coverage.
  // The baseline is usable as fallback but is not advertised as a completed theme.
  const HARBOR=freeze({
    id:BASE,status:'draft',
    palette:{surface:'#1E2248',panel:'#FFF8ED',text:'#FFFFFF',muted:'#D8DDF8',focus:'#FFE89A',border:'#D8DDF8',accent:'#34C6B3'},
    village:{panorama:{
      sky:{path:'assets/nq-overlook-sky-v2.webp'},
      mountains:{path:'assets/nq-overlook-mountains-v2.webp'},
      city:{path:'assets/nq-overlook-city-v2.webp'},
      foreground:{path:'assets/nq-overlook-foreground-v2.webp'}
    },fallback:{path:'assets/nq-city-overlook-v1.avif'},buildings:{}},
    scenes:{
      village:{kind:'panorama'},sanctuaryPen:{kind:'image',path:'assets/nq-sanctuary-pen.webp',fallback:'surface'},
      sanctuaryHospital:{kind:'image',path:'assets/nq-sanctuary-hospital.webp',fallback:'surface'}
    },header:null,audio:{ambience:null}
  });
  const REGISTRY=freeze({[BASE]:HARBOR});
  // Only explicit local published asset paths; never interpolate profile data.
  function safePath(path){
    return typeof path==='string'&&/^assets\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.(?:webp|avif|png|jpg|jpeg|svg|mp3|ogg|wav)$/i.test(path);
  }
  function assetURL(path,baseURI){
    if(!safePath(path))return null;
    try{
      const base=new URL(baseURI),url=new URL(path,base);
      if(!['http:','https:'].includes(base.protocol)||url.origin!==base.origin||!url.pathname.startsWith(new URL('assets/',base).pathname))return null;
      return url.href;
    }catch{return null}
  }
  function sceneValid(scene){
    if(!scene||typeof scene!=='object')return false;
    if(scene.kind==='surface')return scene.approved===true;
    if(scene.kind==='panorama')return true;
    return scene.kind==='image'&&safePath(scene.path)&&(scene.fallback==='surface'||safePath(scene.fallback));
  }
  function validateManifest(manifest,required=SURFACES){
    const errors=[];
    if(!manifest||typeof manifest!=='object')return ['manifest'];
    if(!WORLDS.includes(manifest.id))errors.push('id');
    if(!['draft','ready'].includes(manifest.status))errors.push('status');
    for(const key of PALETTE)if(!/^#[0-9a-f]{6}$/i.test(manifest.palette?.[key]||''))errors.push('palette:'+key);
    for(const key of LAYERS)if(!safePath(manifest.village?.panorama?.[key]?.path))errors.push('panorama:'+key);
    if(!safePath(manifest.village?.fallback?.path))errors.push('panorama:fallback');
    if(!manifest.village?.buildings||typeof manifest.village.buildings!=='object'||!Object.keys(manifest.village.buildings).length)errors.push('buildings');
    if(!manifest.header||typeof manifest.header!=='object'||!Object.keys(manifest.header).length)errors.push('header');
    for(const key of required)if(!sceneValid(manifest.scenes?.[key]))errors.push('scene:'+key);
    if(manifest.audio?.ambience!==null&&!safePath(manifest.audio?.ambience))errors.push('ambience');
    return errors;
  }
  function resolveTheme(worldId,registry=REGISTRY){
    const valid=WORLDS.includes(worldId),world=valid?worldId:BASE;
    // Always retain the canonical baseline if an injected registry omits or corrupts Harbor.
    const base=own(registry,BASE)&&registry[BASE]?.id===BASE&&(registry[BASE]===HARBOR||(registry[BASE].status==='ready'&&!validateManifest(registry[BASE]).length))?registry[BASE]:HARBOR;
    if(world===BASE)return Object.freeze({worldId:world,themeId:BASE,manifest:base,fallbackReason:valid?null:'invalid-world'});
    const candidate=own(registry,world)?registry[world]:null;
    const ready=candidate?.id===world&&candidate.status==='ready'&&!validateManifest(candidate).length;
    return Object.freeze({worldId:world,themeId:ready?world:BASE,manifest:ready?candidate:base,fallbackReason:ready?null:!candidate?'missing-theme':'incomplete-theme'});
  }
  // Dependency-injected for tests; pure with respect to the engine/DOM.
  function resolveForEngine(engine,registry=REGISTRY){
    let world;
    try{world=engine?.learn?.themeWorld?.()}catch{}
    return resolveTheme(world,registry);
  }
  return Object.freeze({BASE,WORLDS,SURFACES,PALETTE,LAYERS,HARBOR,REGISTRY,safePath,assetURL,validateManifest,resolveTheme,resolveForEngine});
});
