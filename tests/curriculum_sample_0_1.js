/* The engine's original test sample curriculum (2 worlds, 13 stops, 26 skills), kept as test data after the v3.2
   swap. tests/run_engine_tests.sh swaps it in for the NQ-CURRICULUM block so the older engine suites keep testing
   engine behavior against the stops and skills they were written for. Not used by the game. */
const CURRICULUM={
  id:'sample-0.1',
  version:'engine-test-sample-0.1',
  levels:[
    {id:'NQ-00',location:'harbor',title:'Melody Harbor',
     /* Journey Readiness (API 1.6): the skills each part checks before traveling on to the next world */
     readiness:{navigation:['k-blackwhite','e-highlow'],timing:['r-pulse'],performance:['t-posture','t-hands']}},
    {id:'NQ-01',location:'rain',title:'Amazon Rainforest'}
  ],
  stops:[
    {id:'NQ-00-S1',level:'NQ-00',title:{child:'Meet the piano',adult:'Meet the instrument'},skills:['k-blackwhite','e-highlow']},
    {id:'NQ-00-S2',level:'NQ-00',title:{child:'Sit like a pianist',adult:'Healthy setup'},skills:['t-posture','t-hands']},
    {id:'NQ-00-S3',level:'NQ-00',title:{child:'Hear and echo',adult:'Listening and pulse'},skills:['e-contour','r-pulse']},
    {id:'NQ-00-S4',level:'NQ-00',title:{child:'Loud and soft',adult:'Sound exploration'},skills:['e-loudsoft']},
    {id:'NQ-01-S1',level:'NQ-01',title:{child:'Black-key groups',adult:'Black-key landmarks'},skills:['k-group2','k-group3','t-fingers']},
    {id:'NQ-01-S2',level:'NQ-01',title:{child:'Beats and notes',adult:'Beat and duration'},skills:['r-values1','r-tap1','s-pf']},
    {id:'NQ-01-S3',level:'NQ-01',title:{child:'White-key names',adult:'White-key names'},skills:['k-letters']},
    {id:'NQ-01-S4',level:'NQ-01',title:{child:'Middle C position',adult:'Middle C position'},skills:['p-midc-find','p-midc-play']},
    {id:'NQ-01-S5',level:'NQ-01',title:{child:'C position and 3/4',adult:'C position, dotted half, 3/4'},skills:['r-values2','r-tap34','p-cpos-play']},
    {id:'NQ-01-S6',level:'NQ-01',title:{child:'Bass staff',adult:'Bass staff'},skills:['n-bass','n-bass-play']},
    {id:'NQ-01-S7',level:'NQ-01',title:{child:'Treble staff',adult:'Treble staff'},skills:['n-treble','n-treble-play']},
    {id:'NQ-01-S8',level:'NQ-01',title:{child:'Grand staff',adult:'Grand staff'},skills:['n-grand','n-grand-find']},
    {id:'NQ-01-S9',level:'NQ-01',title:{child:'Rainforest recital',adult:'Level recital'},skills:['song-hcb','rec-perform'],recital:true}
  ],
  skills:[
    {id:'k-blackwhite',title:{child:'Black keys and white keys',adult:'Key types'},domains:['D01'],prereqs:[],requiresReading:false,evidence:['quiz'],content:{type:'symbol',items:[{show:'key-black',answer:'black'},{show:'key-white',answer:'white'}],choices:['black','white']},alfredRef:'Prep A pp. 6–7'},
    {id:'e-highlow',title:{child:'High or low?',adult:'Register: high and low'},domains:['D05','D01'],prereqs:[],requiresReading:false,evidence:['listen'],content:{type:'highLow',lo:48,hi:79,minGap:7}},
    {id:'t-posture',title:{child:'Sit tall at the piano',adult:'Bench height and posture'},domains:['D04','D10'],prereqs:[],requiresReading:false,evidence:['caregiver'],content:{type:'caregiver',prompt:'Watch them sit at the piano.',checklist:['Feet flat (or on a stool)','Back tall, shoulders loose','Elbows level with the keys']},alfredRef:'Prep A p. 4'},
    {id:'t-hands',title:{child:'Bubble hands',adult:'Relaxed curved hands'},domains:['D04'],prereqs:['t-posture'],requiresReading:false,evidence:['self'],content:{type:'self',prompt:'Hold a pretend bubble in each hand, then put your hands on the keys.',checklist:['Fingers curved','Wrists level','Nothing hurts']},alfredRef:'Prep A p. 5'},
    {id:'e-contour',title:{child:'Up, down or same?',adult:'Melodic contour'},domains:['D05'],prereqs:['e-highlow'],requiresReading:false,evidence:['listen'],content:{type:'contour',lo:55,hi:72}},
    {id:'r-pulse',title:{child:'Tap the steady beat',adult:'Steady pulse'},domains:['D03'],prereqs:[],requiresReading:false,evidence:['tap'],content:{type:'rhythmTap',bpm:66,beatsPerMeasure:4,patterns:[[[1,1,1,1],[1,1,1,1]]],count:2}},
    {id:'e-loudsoft',title:{child:'Loud or soft?',adult:'Dynamics by ear'},domains:['D05','D07'],prereqs:[],requiresReading:false,evidence:['listen'],content:{type:'loudSoft',lo:55,hi:72}},
    {id:'k-group2',title:{child:'Find the 2 black keys',adult:'Two-black-key groups'},domains:['D01'],prereqs:['k-blackwhite'],requiresReading:false,evidence:['keys'],content:{type:'keyGroup',group:2},alfredRef:'Prep A pp. 6–9'},
    {id:'k-group3',title:{child:'Find the 3 black keys',adult:'Three-black-key groups'},domains:['D01'],prereqs:['k-blackwhite'],requiresReading:false,evidence:['keys'],content:{type:'keyGroup',group:3},alfredRef:'Prep A pp. 10–13'},
    {id:'t-fingers',title:{child:'Finger numbers',adult:'Finger numbers 1–5'},domains:['D04'],prereqs:[],requiresReading:false,evidence:['quiz'],content:{type:'finger'},alfredRef:'Prep A p. 5'},
    {id:'r-values1',title:{child:'How many beats? (quarter, half, whole)',adult:'Quarter, half and whole notes'},domains:['D03','D02'],prereqs:['r-pulse'],requiresReading:false,evidence:['quiz'],content:{type:'beats',values:[1,2,4]},alfredRef:'Prep A pp. 6–15'},
    {id:'r-tap1',title:{child:'Tap quarters and halves',adult:'Reading quarter and half notes'},domains:['D03'],prereqs:['r-values1'],requiresReading:false,evidence:['tap'],content:{type:'rhythmTap',bpm:66,beatsPerMeasure:4,patterns:[[[1,1,1,1],[2,2]],[[2,2],[1,1,2]],[[1,1,2],[4]],[[4],[2,1,1]]],count:3}},
    {id:'s-pf',title:{child:'p and f',adult:'Piano and forte'},domains:['D07','D02'],prereqs:['e-loudsoft'],requiresReading:false,evidence:['quiz'],content:{type:'symbol',items:[{show:'dyn-p',answer:'soft'},{show:'dyn-f',answer:'loud'}],choices:['soft','loud']},alfredRef:'Prep A pp. 6–15'},
    {id:'k-letters',title:{child:'White-key names',adult:'White keys A–G'},domains:['D01','D02'],prereqs:['k-group2','k-group3'],requiresReading:false,evidence:['keys'],content:{type:'letterFind',letters:['C','D','E','F','G','A','B']},alfredRef:'Prep A pp. 16–17'},
    {id:'p-midc-find',title:{child:'Middle C position: find it',adult:'Middle C position'},domains:['D01'],prereqs:['k-letters','t-fingers'],requiresReading:false,evidence:['keys'],content:{type:'noteFind',notes:['F3','G3','A3','B3','C4','D4','E4','F4','G4'],staff:'none'},alfredRef:'Prep A pp. 18–25'},
    {id:'p-midc-play',title:{child:'Middle C position: play it',adult:'Middle C position on the piano'},domains:['D01','D04'],prereqs:['p-midc-find'],requiresReading:false,evidence:['mic','keys'],content:{type:'notePlay',notes:['F3','G3','A3','B3','C4','D4','E4','F4','G4'],staff:'none'},alfredRef:'Prep A pp. 18–25'},
    {id:'r-values2',title:{child:'Dotted half notes',adult:'Dotted half notes'},domains:['D03','D02'],prereqs:['r-values1'],requiresReading:false,evidence:['quiz'],content:{type:'beats',values:[1,2,3,4]},alfredRef:'Prep A pp. 26–30'},
    {id:'r-tap34',title:{child:'Tap in 3/4',adult:'Rhythm in 3/4'},domains:['D03'],prereqs:['r-tap1','r-values2'],requiresReading:false,evidence:['tap'],content:{type:'rhythmTap',bpm:66,beatsPerMeasure:3,patterns:[[[1,1,1],[3]],[[2,1],[1,2]],[[3],[1,1,1]]],count:3},alfredRef:'Prep A pp. 26–30'},
    {id:'p-cpos-play',title:{child:'C position: play it',adult:'C position, both hands'},domains:['D01','D04'],prereqs:['p-midc-play'],requiresReading:false,evidence:['mic','keys'],content:{type:'notePlay',notes:['C3','D3','E3','F3','G3','C4','D4','E4','F4','G4'],staff:'none'},alfredRef:'Prep A pp. 26–30'},
    {id:'n-bass',title:{child:'Bass staff notes',adult:'Reading the bass staff'},domains:['D02'],prereqs:['p-cpos-play'],requiresReading:false,evidence:['quiz'],content:{type:'noteName',notes:['C3','D3','E3','F3','G3'],staff:'bass',transfer:{type:'noteName',notes:['A2','B2','C3','D3','E3','F3','G3','A3'],staff:'bass'}},alfredRef:'Prep A pp. 31–35'},
    {id:'n-bass-play',title:{child:'Play bass staff notes',adult:'Bass staff to piano'},domains:['D02','D01'],prereqs:['n-bass'],requiresReading:false,evidence:['mic','keys'],content:{type:'notePlay',notes:['C3','D3','E3','F3','G3'],staff:'bass'},alfredRef:'Prep A pp. 31–35'},
    {id:'n-treble',title:{child:'Treble staff notes',adult:'Reading the treble staff'},domains:['D02'],prereqs:['p-cpos-play'],requiresReading:false,evidence:['quiz'],content:{type:'noteName',notes:['C4','D4','E4','F4','G4'],staff:'treble',transfer:{type:'noteName',notes:['C4','D4','E4','F4','G4','A4','B4','C5'],staff:'treble'}},alfredRef:'Prep A pp. 36–39'},
    {id:'n-treble-play',title:{child:'Play treble staff notes',adult:'Treble staff to piano'},domains:['D02','D01'],prereqs:['n-treble'],requiresReading:false,evidence:['mic','keys'],content:{type:'notePlay',notes:['C4','D4','E4','F4','G4'],staff:'treble'},alfredRef:'Prep A pp. 36–39'},
    {id:'n-grand',title:{child:'Grand staff notes',adult:'Reading the grand staff'},domains:['D02'],prereqs:['n-bass','n-treble'],requiresReading:false,evidence:['quiz'],content:{type:'noteName',notes:['C3','D3','E3','F3','G3','C4','D4','E4','F4','G4'],staff:'grand'},alfredRef:'Prep A pp. 40–48'},
    {id:'n-grand-find',title:{child:'Grand staff on the keys',adult:'Grand staff to keyboard'},domains:['D02','D01'],prereqs:['n-grand'],requiresReading:false,evidence:['keys','mic'],content:{type:'noteFind',notes:['C3','D3','E3','F3','G3','C4','D4','E4','F4','G4'],staff:'grand'},alfredRef:'Prep A pp. 40–48'},
    {id:'song-hcb',title:{child:'Play Hot Cross Buns',adult:'First piece: Hot Cross Buns'},domains:['D07','D02'],prereqs:['n-treble-play'],requiresReading:false,evidence:['mic','keys'],content:{type:'song',song:'hcb',maxMistakes:2}},
    {id:'rec-perform',title:{child:'Recital for your family',adult:'Perform for someone'},domains:['D07','D10'],prereqs:['song-hcb'],requiresReading:false,evidence:['caregiver'],content:{type:'caregiver',prompt:'Listen to them play a piece from this level, start to finish.',checklist:['Steady beat','Sat tall with curved fingers','Kept going after a mistake']}}
  ]
};
