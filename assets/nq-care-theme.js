/* Sanctuary assets for the Melody Harbor theme. Unknown worlds use Harbor in Phase 1. */
(function(){
  'use strict';
  const HARBOR=Object.freeze({
    pen:'assets/nq-sanctuary-pen.png',
    hospital:'assets/nq-sanctuary-hospital.png'
  });
  const WORLD_THEMES=Object.freeze({'NQ-00':HARBOR});
  function apply(root,engine){
    const world=engine.learn.themeWorld?.();
    const theme=Object.hasOwn(WORLD_THEMES,world)?WORLD_THEMES[world]:HARBOR;
    root.dataset.world=theme===HARBOR?'NQ-00':world;
    root.style.setProperty('--nq-sanctuary-pen','url("'+theme.pen+'")');
    root.style.setProperty('--nq-sanctuary-hospital','url("'+theme.hospital+'")');
  }
  window.NoteQuestCareTheme=Object.freeze({apply});
})();
