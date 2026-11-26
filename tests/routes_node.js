'use strict';
const assert=require('node:assert/strict');
const {ROUTES,resolveRoute}=require('../assets/nq-routes.js');
const contexts={
  empty:{learnerCount:0,activeId:null},
  idle:{learnerCount:2,activeId:null},
  complete:{learnerCount:1,activeId:'A',onboardingStep:'complete'},
  pending:{learnerCount:2,activeId:'A',onboardingStep:'nameCompanion'},
  editing:{learnerCount:1,activeId:'A',onboardingStep:'newProfile'}
};
const routeArgs={world:['NQ-00','NQ-01'],stop:['NQ-00-U01','NQ-01-U01'],harborStop:['NQ-00-U01'],readiness:['NQ-00'],avatar:['new','migrate:A','migrate:B','edit:A','grownup:B','bogus:A']};
const cases=[
  ['empty launch',{},'profiles',null,'empty',{origin:'launch'}],
  ['single launch ignores deep link',{view:'home'},'menu',null,'complete',{origin:'launch'}],
  ['shared launch ignores a remembered learner',{view:'menu'},'profiles',null,'complete',{origin:'launch',learnerCount:2}],
  ['unfinished sole learner resumes naming',{},'nameCompanion',null,'pending',{origin:'launch',learnerCount:1}],
  ['shared unfinished learner waits at picker',{},'profiles',null,'pending',{origin:'launch'}],
  ['empty picker','profiles','profiles',null,'empty'],
  ['new player from picker','newProfile','newProfile',null,'idle'],
  ['new avatar can open for an empty device',{view:'avatarBuilder',arg:'new'},'avatarBuilder',null,'empty',{avatarDraft:'new'}],
  ['new avatar needs a live draft',{view:'avatarBuilder',arg:'new'},'profiles','avatar-draft-missing','empty'],
  ['history cannot reopen a new avatar draft',{view:'avatarBuilder',arg:'new'},'profiles','bad-origin','idle',{avatarDraft:'new',origin:'history'}],
  ['migration may precede kitten naming',{view:'avatarBuilder',arg:'migrate:A'},'avatarBuilder',null,'pending',{avatarDraft:'migrate:A'}],
  ['migration cannot target a different active learner',{view:'avatarBuilder',arg:'migrate:B'},'menu','stale-learner','complete',{avatarDraft:'migrate:B'}],
  ['active learner can edit',{view:'avatarBuilder',arg:'edit:A'},'avatarBuilder',null,'complete',{avatarDraft:'edit:A'}],
  ['remote callback cannot start avatar editing',{view:'avatarBuilder',arg:'edit:A'},'menu','bad-origin','complete',{avatarDraft:'edit:A',origin:'remote'}],
  ['grown-up must pass hold to edit',{view:'avatarBuilder',arg:'grownup:B'},'profiles','gate-closed','idle',{avatarDraft:'grownup:B'}],
  ['grown-up can edit the selected learner after holding',{view:'avatarBuilder',arg:'grownup:B'},'avatarBuilder',null,'idle',{avatarDraft:'grownup:B',gateOpen:true}],
  ['avatar rejects an unknown mode',{view:'avatarBuilder',arg:'bogus:A'},'menu','bad-argument','complete',{avatarDraft:'bogus:A'}],
  ['switch learner from naming','profiles','profiles',null,'pending'],
  ['village needs learner','menu','profiles','needs-learner','idle'],
  ['naming needs learner','nameCompanion','profiles','needs-learner','empty'],
  ['returning learner enters village','menu','menu',null],
  ['unfinished learner resumes instead of entering village','menu','nameCompanion','onboarding','pending'],
  ['unfinished learner resumes instead of taking a lesson',{view:'engineLesson',arg:'NQ-00-U01'},'nameCompanion','onboarding','pending'],
  ['in-progress name can render','newProfile','newProfile',null,'editing'],
  ['kitten naming allowed','nameCompanion','nameCompanion',null,'pending'],
  ['onboarded learner cannot re-run naming','nameCompanion','menu','already-onboarded'],
  ['profile without a recognized onboarding step falls back','menu','profiles','onboarding','complete',{onboardingStep:'future'}],
  ['remote removed active learner','progress','profiles','needs-learner','idle',{origin:'remote'}],
  ['remote retains valid active learner','menu','menu',null,'complete',{origin:'remote'}],
  ['progress available','progress','progress',null],
  ['Harbor list available','harborLessons','harborLessons',null],
  ['continue available','continueAdventure','continueAdventure',null],
  ['lesson index alias available','lessonIndex','lessonIndex',null],
  ['Harbor lesson validates live stop',{view:'engineLesson',arg:'NQ-00-U01'},'engineLesson',null],
  ['Amazon cannot start through Harbor renderer',{view:'engineLesson',arg:'NQ-01-U01'},'menu','bad-argument'],
  ['missing lesson id','engineLesson','menu','bad-argument'],
  ['object lesson id',{view:'engineLesson',arg:{id:'NQ-00-U01'}},'menu','bad-argument'],
  ['valid preview world can be browsed',{view:'nqwWorld',arg:'NQ-01'},'nqwWorld',null],
  ['valid Amazon stop can be previewed',{view:'nqwStop',arg:'NQ-01-U01'},'nqwStop',null],
  ['missing world is denied',{view:'nqwWorld',arg:'NQ-99'},'menu','bad-argument'],
  ['cross-family ID rejected',{view:'nqwWorld',arg:'NQ-00-U01'},'menu','bad-argument'],
  ['unknown preview stop denied',{view:'nqwStop',arg:'NQ-01-U99'},'menu','bad-argument'],
  ['Harbor readiness candidate allowed',{view:'nqwReadiness',arg:'NQ-00'},'nqwReadiness',null],
  ['unavailable readiness candidate denied',{view:'nqwReadiness',arg:'NQ-01'},'menu','bad-argument'],
  ['strict no-argument route',{view:'menu',arg:''},'menu','bad-argument'],
  ['no-argument route accepts serialized null',{view:'menu',arg:null},'menu',null],
  ['prototype route denied','constructor','menu','unknown-route'],
  ['prototype setter route denied','__proto__','menu','unknown-route'],
  ['protected screen requires hold','placementCheck','menu','gate-closed','complete',{placementActive:true}],
  ['gate must be a boolean','placementCheck','menu','gate-closed','complete',{gateOpen:1,placementActive:true}],
  ['authorized placement check allowed','placementCheck','placementCheck',null,'complete',{gateOpen:true,placementActive:true}],
  ['expired placement returns to start','placementCheck','placement','placement-inactive','complete',{gateOpen:true}],
  ['grown-up gate entry is allowed','parentGate','parentGate',null],
  ['legacy grown-up settings withheld','parent','menu','unknown-route','complete',{gateOpen:true}],
  ['stale browser history cannot switch learner',{view:'progress',learnerId:'B'},'menu','stale-learner','complete',{origin:'history'}],
  ['missing learner on history entry denied',{view:'menu'},'menu','stale-learner','complete',{origin:'history'}],
  ['valid browser history can restore its route',{view:'progress',learnerId:'A'},'progress',null,'complete',{origin:'history'}],
  ['browser picker history has no learner association','profiles','profiles',null,'idle',{origin:'history'}],
  ['reference origin restores current learner',{view:'menu',learnerId:'A'},'menu',null,'complete',{origin:'reference'}],
  ['forged reference origin denied',{view:'placement',learnerId:'A'},'menu','bad-origin','complete',{origin:'reference'}],
  ['stale reference learner denied',{view:'menu',learnerId:'B'},'menu','stale-learner','complete',{origin:'reference'}]
];
for(const view of ['starter','home','games','shop','stickers','rescue','journal','companions','map','explorer','tracks']){
  cases.push(['withheld legacy route '+view,view,'menu','unknown-route']);
}
let failed=0;
for(const [label,request,view,deny,context='complete',extra={}] of cases){
  try{
    const req=Object.freeze(typeof request==='string'?{view:request}:request);
    const snapshot=Object.freeze({...contexts[context],routeArgs,...extra});
    const result=resolveRoute(req,snapshot);
    assert.equal(result.landing.view,view);
    assert.equal(result.deny,deny);
    assert.equal(result.landing.arg,deny?null:(req.arg??null));
    assert.ok(Object.hasOwn(ROUTES,result.landing.view));
  }catch(error){failed++;console.error('FAIL',label,error.message);}
}
console.log((cases.length-failed)+' passed, '+failed+' failed');
if(failed)process.exitCode=1;
