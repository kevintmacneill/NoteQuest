/* Phase 1 calibration order and progress. The capture layer supplies note evidence. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.NoteQuestPianoSweep=api;
})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';

  const KEYS=Object.freeze(Array.from({length:88},(_,i)=>21+i));
  const PROOF=Object.freeze([60,62,64]);
  const NOTE_NAMES=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];

  function label(midi){
    if(!Number.isInteger(midi)||midi<KEYS[0]||midi>KEYS.at(-1))return null;
    return NOTE_NAMES[midi%12]+(Math.floor(midi/12)-1);
  }

  function start(){
    let phase='sweep', index=0, checkpoint=0;
    function snapshot(){
      const sequence=phase==='sweep'?KEYS:phase==='proof'?PROOF:[];
      const midi=sequence[index]??null;
      return Object.freeze({
        phase, midi, label:label(midi), position:midi===null?null:index+1, total:sequence.length,
        measured:phase==='sweep'?index:KEYS.length, checkpoint
      });
    }
    function accept(event){
      if(phase==='complete')return {ok:false,reason:'complete',state:snapshot()};
      if(event?.checkpoint!==checkpoint)return {ok:false,reason:'stale-capture',state:snapshot()};
      if(event?.quality!=='accepted')return {ok:false,reason:'uncertain',state:snapshot()};
      const expected=(phase==='sweep'?KEYS:PROOF)[index];
      if(event.midi!==expected)return {ok:false,reason:'wrong-key',state:snapshot()};
      index++;checkpoint++;
      if(phase==='sweep'&&index===KEYS.length){phase='proof';index=0;}
      else if(phase==='proof'&&index===PROOF.length){phase='complete';index=0;}
      return {ok:true,state:snapshot()};
    }
    function retryProof(){
      if(phase!=='proof')return {ok:false,reason:'not-in-proof',state:snapshot()};
      index=0;checkpoint++;
      return {ok:true,state:snapshot()};
    }
    return Object.freeze({snapshot,accept,retryProof});
  }

  return Object.freeze({KEYS,PROOF,label,start});
});
