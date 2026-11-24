/* NoteQuest #109: engine-authoritative next lesson routing.
 * Pure UI adapter: never mutates mastery or maps preview curriculum IDs.
 * Exposed as CommonJS for tests and as window.NoteQuestLessonRoute in browser.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NoteQuestLessonRoute=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
  'use strict';
  function resolve(learn){
    if(!learn||typeof learn.currentStop!=='function'||typeof learn.stopStatus!=='function'||typeof learn.curriculum!=='function')
      return {ok:false,reason:'engine-unavailable'};
    const id=learn.currentStop();
    if(typeof id!=='string'||!id)return {ok:false,reason:'no-next-stop'};
    const data=learn.curriculum();
    const stop=data&&Array.isArray(data.stops)&&data.stops.find(s=>s&&s.id===id);
    if(!stop)return {ok:false,reason:'stop-not-in-engine',id};
    const status=learn.stopStatus(id);
    if(!status||status.id!==id)return {ok:false,reason:'invalid-status',id};
    if(!status.unlocked)return {ok:false,reason:'locked',id,status};
    if(status.complete)return {ok:false,reason:'already-complete',id,status};
    const step=status.step;
    if(!['learn','practice','check'].includes(step))return {ok:false,reason:'unsupported-step',id,status};
    if(step==='learn'&&typeof learn.markLearned!=='function')return {ok:false,reason:'learn-unavailable',id,status};
    if(step!=='learn'&&(!Array.isArray(status.skills)||!status.skills.some(s=>s&&typeof s.id==='string')||typeof learn.start!=='function'||typeof learn.answer!=='function'||typeof learn.skill!=='function'))
      return {ok:false,reason:'practice-unavailable',id,status};
    return {ok:true,id,stop,status,step};
  }
  return Object.freeze({resolve});
});
