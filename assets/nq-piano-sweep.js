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

  const nominal=midi=>440*2**((midi-69)/12);
  const centsFrom=(hz,midi)=>1200*Math.log2(hz/nominal(midi));
  const MAX_MISSES=3;

  function start(){
    let phase='sweep',index=0,checkpoint=0,misses=0,paused=false;
    const keys=[];
    function snapshot(){
      const sequence=phase==='sweep'?KEYS:phase==='proof'?PROOF:[];
      const midi=sequence[index]??null;
      return Object.freeze({
        phase,midi,label:label(midi),position:midi===null?null:index+1,total:sequence.length,
        measured:keys.length,checkpoint,paused,misses
      });
    }
    const failure=reason=>({ok:false,reason,state:snapshot()});
    function advance(measurement){
      if(measurement)keys.push(measurement);
      index++;checkpoint++;misses=0;
      if(phase==='sweep'&&index===KEYS.length){phase='proof';index=0;}
      else if(phase==='proof'&&index===PROOF.length){phase='complete';index=0;}
      return {ok:true,state:snapshot()};
    }
    function guard(token){
      if(phase==='complete')return 'complete';
      if(paused)return 'paused';
      return token!==checkpoint?'stale-capture':null;
    }
    function miss(token){
      const blocked=guard(token);
      if(blocked)return failure(blocked);
      if(phase==='proof')return failure('unheard');
      misses++;
      if(misses<MAX_MISSES){checkpoint++;return failure('unheard');}
      return advance({midi:KEYS[index],unheard:true});
    }
    function skip(token){
      const blocked=guard(token);
      if(blocked)return failure(blocked);
      if(phase!=='sweep')return failure('not-in-sweep');
      return advance({midi:KEYS[index],unheard:true});
    }
    function accept(event){
      const blocked=guard(event?.checkpoint);
      if(blocked)return failure(blocked);
      if(event.quality!=='accepted'||!Number.isFinite(event.hz)||event.hz<=0||
        !Number.isFinite(event.confidence)||event.confidence<0||event.confidence>1)return failure('unheard');
      const expected=(phase==='sweep'?KEYS:PROOF)[index];
      const cents=centsFrom(event.hz,expected);
      if(phase==='sweep'){
        if(Math.abs(cents)>100.000001)return failure('wrong-key');
        return advance({midi:expected,heard:true,cents:Math.max(-100,Math.min(100,cents)),confidence:event.confidence});
      }
      const calibration=keys[expected-KEYS[0]];
      if(!calibration?.heard)return failure('unheard-calibration');
      if(Math.abs(cents-calibration.cents)>=50)return failure('wrong-key');
      return advance();
    }
    function pause(){
      if(!paused&&phase!=='complete'){paused=true;checkpoint++;}
      return snapshot();
    }
    function resume(){
      if(paused){paused=false;checkpoint++;}
      return snapshot();
    }
    function retryProof(){
      if(phase!=='proof')return failure('not-in-proof');
      if(paused)return failure('paused');
      index=0;checkpoint++;
      return {ok:true,state:snapshot()};
    }
    function saveMeasurements(deviceSetup,pianoId,metadata){
      if(keys.length!==KEYS.length)return failure('sweep-incomplete');
      if(!pianoId||deviceSetup?.read()?.activePiano!==pianoId)return failure('wrong-piano');
      const heard=keys.filter(key=>key.heard);
      const range=heard.length?{low:heard[0].midi,high:heard.at(-1).midi}:null;
      return deviceSetup.setCalibration(pianoId,{...metadata,range,keys:keys.map(key=>({...key}))});
    }
    return Object.freeze({snapshot,accept,miss,skip,pause,resume,retryProof,saveMeasurements});
  }

  return Object.freeze({KEYS,PROOF,label,start});
});
