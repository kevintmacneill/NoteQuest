/* WP-3.1: pure admission for the replacement UI. The engine still enforces lesson access. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.NoteQuestRoutes=api;
})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';

  function route(args,needs,fallback,lifecycle='none'){
    return Object.freeze({args,needs,fallback,lifecycle});
  }
  const ROUTES=Object.freeze({
    profiles:route('none','none','profiles'),
    newProfile:route('none','none','profiles'),
    avatarBuilder:route('avatar','none','profiles'),
    nameCompanion:route('none','learner','profiles'),
    menu:route('none','onboarded','profiles'),
    progress:route('none','onboarded','menu'),
    harborLessons:route('none','onboarded','menu','lesson'),
    engineLesson:route('harborStop','onboarded','menu','lesson'),
    continueAdventure:route('none','onboarded','menu'),
    lessonIndex:route('none','onboarded','menu'),
    nqwHub:route('none','onboarded','menu'),
    nqwWorld:route('world','onboarded','menu'),
    nqwStop:route('stop','onboarded','menu'),
    nqwReadiness:route('readiness','onboarded','menu','readiness'),
    placement:route('none','onboarded','menu'),
    placementCheck:route('none','gate','menu','readiness'),
    parentGate:route('none','onboarded','menu')
  });
  const REFERENCE_ROUTES=new Set(['menu','engineLesson','harborLessons']);
  const REPLAY_ORIGINS=new Set(['history','reference']);
  const policyFor=view=>Object.hasOwn(ROUTES,view)?ROUTES[view]:null;

  function activeLearner(ctx){
    return Number.isInteger(ctx.learnerCount)&&ctx.learnerCount>0&&typeof ctx.activeId==='string'&&ctx.activeId.length>0;
  }
  function onboarding(ctx,active){
    if(!active)return null;
    if(ctx.onboardingStep==='complete')return null;
    if(ctx.onboardingStep==='nameCompanion'||ctx.onboardingStep==='newProfile')return ctx.onboardingStep;
    return 'profiles';
  }
  function validArgument(schema,arg,ctx){
    if(schema==='none')return arg==null;
    if(typeof arg!=='string'||!arg)return false;
    const admitted=ctx.routeArgs?.[schema];
    return Array.isArray(admitted)&&admitted.includes(arg);
  }
  function landing(view,arg){
    return {view,arg:arg??null,lifecycle:ROUTES[view].lifecycle};
  }
  function allow(view,arg){
    return {deny:null,landing:landing(view,arg)};
  }
  function refuse(reason,view){
    return {deny:reason,landing:landing(view)};
  }
  function resolveAvatar(arg,ctx,active,pending,fallback){
    // A matching in-memory grant is supplied only by the live builder opener.
    if(REPLAY_ORIGINS.has(ctx.origin)||ctx.origin==='remote')return refuse('bad-origin',fallback);
    if(ctx.avatarDraft!==arg)return refuse('avatar-draft-missing',fallback);
    if(arg==='new')return active&&pending!=='newProfile'?refuse('stale-learner',fallback):allow('avatarBuilder',arg);
    const match=/^(migrate|edit|grownup):([A-Za-z0-9_-]+)$/.exec(arg);
    if(!match)return refuse('bad-argument',fallback);
    const [,mode,id]=match;
    if(mode==='grownup')return ctx.gateOpen===true?allow('avatarBuilder',arg):refuse('gate-closed',fallback);
    if(!active||id!==ctx.activeId)return refuse('stale-learner',fallback);
    if(mode==='edit'&&pending)return refuse('onboarding',pending);
    return allow('avatarBuilder',arg);
  }
  function resolveRoute(request={},ctx={}){
    const {view,arg,learnerId}=request??{};
    const active=activeLearner(ctx);
    const pending=onboarding(ctx,active);
    const fallback=active?(pending||'menu'):'profiles';

    if(ctx.origin==='launch'){
      if(ctx.learnerCount!==1||!active)return allow('profiles');
      return allow(fallback);
    }

    const policy=typeof view==='string'?policyFor(view):null;
    if(!policy)return refuse('unknown-route',fallback);
    if(ctx.origin==='reference'&&!REFERENCE_ROUTES.has(view))return refuse('bad-origin',fallback);
    if(REPLAY_ORIGINS.has(ctx.origin)&&(policy.needs!=='none'||learnerId!=null)&&(!active||learnerId!==ctx.activeId)){
      return refuse('stale-learner',fallback);
    }
    if(!validArgument(policy.args,arg,ctx))return refuse('bad-argument',active?fallback:'profiles');
    if(view==='avatarBuilder')return resolveAvatar(arg,ctx,active,pending,fallback);
    if(policy.needs!=='none'&&!active)return refuse('needs-learner','profiles');
    if(view==='profiles')return allow('profiles');
    if(pending&&view!==pending)return refuse('onboarding',pending);
    if(view==='nameCompanion'&&!pending)return refuse('already-onboarded','menu');
    if(policy.needs==='gate'&&ctx.gateOpen!==true)return refuse('gate-closed',policy.fallback);
    if(view==='placementCheck'&&ctx.placementActive!==true)return refuse('placement-inactive','placement');
    return allow(view,arg);
  }
  return Object.freeze({ROUTES,resolveRoute});
});
