// Music theory helper tests (NQ.music.theory), no page. Pure functions: spelling by letter.
const fs=require('fs');const vm=require('vm');
const store={};global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}};
global.window=global;global.navigator={};global.btoa=s=>Buffer.from(s,'binary').toString('base64');global.atob=s=>Buffer.from(s,'base64').toString('binary');
vm.runInThisContext(fs.readFileSync(process.argv[2],'utf8'));
const T=window.NQ.music.theory;let ok=0,bad=0;
const t=(n,c)=>{if(c)ok++;else{bad++;console.log('FAIL',n)}};
const eq=(n,a,b)=>{const A=JSON.stringify(a),B=JSON.stringify(b);if(A===B)ok++;else{bad++;console.log('FAIL',n,'got',A,'want',B)}};

// --- parsing, pitch, formatting ---
eq('parse F#4',T.parse('F#4'),{letter:'F',acc:1,octave:4});
eq('parse unicode flat',T.parse('B♭3'),{letter:'B',acc:-1,octave:3});
eq('parse double sharp x',T.parse('Fx'),{letter:'F',acc:2,octave:null});
t('parse rejects triple sharp',T.parse('C###')===null);
t('parse rejects junk',T.parse('H2')===null&&T.parse('')===null&&T.parse(null)===null&&T.parse(60)===null);
eq('midi C4=60',T.midi('C4'),60);eq('midi B#3=60',T.midi('B#3'),60);eq('midi Cb4=59',T.midi('Cb4'),59);eq('midi A0=21',T.midi('A0'),21);eq('midi C8=108',T.midi('C8'),108);
t('midi without octave is null',T.midi('C')===null);
eq('pc E#=5',T.pc('E#'),5);eq('pc Fb=4',T.pc('Fb'),4);eq('pc Dbb=0',T.pc('Dbb'),0);
eq('fmt',[T.fmt('C##'),T.fmt('Ebb'),T.fmt('F#4'),T.fmt('Bb'),T.fmt('B')],['C𝄪','E𝄫','F♯4','B♭','B']);
t('engine midiOf agrees on naturals',['C3','D3','E3','F3','G3','A3','B3','C4','G4','C5'].every(n=>T.midi(n)===window.NQ.music.midiOf(n)));

// --- intervals from two notes ---
const iv=(a,b)=>{const x=T.interval(a,b);return x&&x.short};
eq('C-E M3',iv('C4','E4'),'M3');eq('C-Eb m3',iv('C4','Eb4'),'m3');eq('C-G P5',iv('C4','G4'),'P5');eq('C-F# A4',iv('C4','F#4'),'A4');eq('C-Gb d5',iv('C4','Gb4'),'d5');
eq('C-C P8',iv('C4','C5'),'P8');eq('C-C P1',iv('C4','C4'),'P1');eq('E-F m2',iv('E4','F4'),'m2');eq('B-F d5',iv('B3','F4'),'d5');eq('F-B A4',iv('F4','B4'),'A4');
eq('C-D# A2 (not m3)',iv('C4','D#4'),'A2');eq('C-B# A7',iv('C4','B#4'),'A7');eq('C-E9 M10',iv('C4','E5'),'M10');eq('C-C6 P15',iv('C4','C6'),'P15');
eq('A-C# M3',iv('A3','C#4'),'M3');eq('G#-B m3',iv('G#4','B4'),'m3');eq('Db-F M3',iv('Db4','F4'),'M3');eq('E#-G# m3',iv('E#4','G#4'),'m3');
const down=T.interval('G4','C4');eq('downward interval',[down.short,down.direction,down.semitones],['P5','down',7]);
eq('same note direction',T.interval('C4','C4').direction,'same');
eq('names',[T.interval('C4','E4').name,T.interval('C4','C5').name,T.interval('C4','F#4').name,T.interval('C4','D4').name],['major 3rd','perfect octave','augmented 4th','major 2nd']);
eq('pitch-class interval (no octaves) up within octave',[iv('G','C'),iv('B','D'),iv('C','B'),iv('C','B#')],['P4','m3','M7','A7']);
t('too wide is null',T.interval('C1','C8')===null);
eq('intervalNumber staff shape',[T.intervalNumber('C4','E4'),T.intervalNumber('C4','C5'),T.intervalNumber('E4','C4'),T.intervalNumber('F4','F#4'),T.intervalNumber('A','C')],[3,8,3,1,3]);

// --- transpose ---
eq('transpose up',[T.transpose('C4','M3'),T.transpose('E4','M3'),T.transpose('B3','m2'),T.transpose('F#4','P5'),T.transpose('Bb3','M3')],['E4','G#4','C4','C#5','D4']);
eq('transpose down',[T.transpose('C4','m3','down'),T.transpose('C4','P5','down'),T.transpose('E','M6','down')],['A3','F3','G']);
eq('transpose octave',T.transpose('G3','P8'),'G4');
t('transpose refuses triple accidentals',T.transpose('B#','A2')===null);
t('transpose rejects bad interval names',T.transpose('C','M5')===null&&T.transpose('C','P3')===null&&T.transpose('C','X3')===null&&T.transpose('C','P16')===null);
// round trip: interval(a, transpose(a, x)) === x for every note and interval where the spelling exists
{const notes=[];['C','D','E','F','G','A','B'].forEach(l=>['bb','b','','#','##'].forEach(a=>notes.push(l+a+'4')));
 const ivls=['P1','m2','M2','A2','d3','m3','M3','A3','d4','P4','A4','d5','P5','A5','m6','M6','A6','d7','m7','M7','P8','m9','M9','m10','M10','P11','P12','M13','P15'];
 let tried=0,good=0,downGood=0;notes.forEach(n=>ivls.forEach(x=>{const up=T.transpose(n,x);if(up){tried++;if(iv(n,up)===x&&T.midi(up)-T.midi(n)===T.parseInterval(x).semitones)good++}
   const dn=T.transpose(n,x,'down');if(dn&&iv(dn,n)===x)downGood++}));
 t('round trip up '+good+'/'+tried,tried>500&&good===tried);t('round trip down',downGood>500);}

// --- scales ---
const S=(k,m)=>T.scale(k,m).join(' ');
eq('C major',S('C','major'),'C D E F G A B');eq('F# major',S('F#','major'),'F# G# A# B C# D# E#');eq('Gb major',S('Gb','major'),'Gb Ab Bb Cb Db Eb F');
eq('Cb major',S('Cb','major'),'Cb Db Eb Fb Gb Ab Bb');eq('C# major',S('C#','major'),'C# D# E# F# G# A# B#');
eq('A natural minor',S('A','natural'),'A B C D E F G');eq('A harmonic minor',S('A','harmonic'),'A B C D E F G#');
eq('D# harmonic minor',S('D#','harmonic'),'D# E# F# G# A# B C##');eq('G# harmonic minor',S('G#','harmonic'),'G# A# B C# D# E F##');
eq('A melodic minor up',S('A','melodic'),'A B C D E F# G#');eq('C five-finger',S('C','fiveFinger'),'C D E F G');eq('D minor five-finger',S('D','minorFiveFinger'),'D E F G A');
eq('G major pentatonic',S('G','majorPentatonic'),'G A B D E');
eq('scale with octave crosses correctly',T.scale('G4','major'),['G4','A4','B4','C5','D5','E5','F#5']);
t('unknown scale kind null',T.scale('C','lydian-ish')===null&&T.scale('Q','major')===null);
// each major scale: whole/half pattern 2 2 1 2 2 2 1, and every letter once
{const pat=[2,2,1,2,2,2,1];let good=0;T.MAJOR_KEYS.forEach(k=>{const sc=T.scale(k+'4','major').concat([T.transpose(k+'4','P8')]);
  const steps=sc.slice(1).map((n,i)=>T.midi(n)-T.midi(sc[i]));const letters=new Set(sc.slice(0,7).map(n=>n[0]));if(JSON.stringify(steps)===JSON.stringify(pat)&&letters.size===7)good++});
 eq('all 15 major scales W W H W W W H, 7 letters',good,15);}

// --- chords ---
eq('C major triad',T.chord('C4','major'),['C4','E4','G4']);eq('D minor',T.chord('D','minor'),['D','F','A']);eq('B dim',T.chord('B','diminished'),['B','D','F']);
eq('C aug',T.chord('C','augmented'),['C','E','G#']);eq('G7',T.chord('G','dominant7'),['G','B','D','F']);eq('Bb maj7',T.chord('Bb','major7'),['Bb','D','F','A']);
eq('F#m7b5',T.chord('F#','halfDiminished7'),['F#','A','C','E']);eq('C#dim7',T.chord('C#','diminished7'),['C#','E','G','Bb']);
eq('first inversion with octaves',T.chord('C4','major',1),['E4','G4','C5']);eq('second inversion',T.chord('C4','major',2),['G4','C5','E5']);
t('bad inversion null',T.chord('C4','major',3)===null);
const id=n=>{const x=T.identifyChord(n);return x&&[x.root,x.kind,x.inversion]};
eq('identify C major root',id(['C4','E4','G4']),['C','major',0]);eq('identify first inversion',id(['E3','G3','C4']),['C','major',1]);eq('identify second inversion',id(['G3','C4','E4']),['C','major',2]);
eq('identify A minor',id(['A','C','E']),['A','minor',0]);eq('identify G7 3rd inversion',id(['F3','G3','B3','D4']),['G','dominant7',3]);eq('identify doubled root',id(['C3','G3','C4','E4']),['C','major',0]);
eq('identify B dim',id(['B','D','F']),['B','diminished',0]);eq('spelling matters: C E G# aug',id(['C','E','G#']),['C','augmented',0]);eq('spelling matters: C E Ab is Ab augmented over C',id(['C','E','Ab']),['Ab','augmented',1]);
eq('symbol',[T.identifyChord(['F#','A','C#']).symbol,T.identifyChord(['Bb','D','F','Ab']).symbol],['F♯m','B♭7']);
t('identify junk null',T.identifyChord(['C'])===null&&T.identifyChord('CEG')===null&&T.identifyChord(['C','Z'])===null);

// --- key signatures ---
const ks=(k,m)=>{const x=T.keySignature(k,m);return x&&[x.type,x.count,x.accidentals.join(' ')]};
eq('C major none',ks('C'),['none',0,'']);eq('G one sharp',ks('G'),['sharps',1,'F#']);eq('D two',ks('D'),['sharps',2,'F# C#']);eq('F one flat',ks('F'),['flats',1,'Bb']);
eq('Bb two flats',ks('Bb'),['flats',2,'Bb Eb']);eq('C# seven sharps',ks('C#'),['sharps',7,'F# C# G# D# A# E# B#']);eq('Cb seven flats',ks('Cb'),['flats',7,'Bb Eb Ab Db Gb Cb Fb']);
eq('A minor none',ks('A','minor'),['none',0,'']);eq('E minor F#',ks('E','minor'),['sharps',1,'F#']);eq('D minor Bb',ks('D','minor'),['flats',1,'Bb']);eq('C minor 3 flats',ks('C','minor'),['flats',3,'Bb Eb Ab']);
t('theoretical key G# major null',T.keySignature('G#')===null);
{let good=0;T.MAJOR_KEYS.forEach((k,i)=>{const x=T.keySignature(k);const want=i-7;if(x&&(x.type==='sharps'?x.count:-x.count)===want)good++});eq('15 major keys around the circle',good,15);}
{let good=0;T.MINOR_KEYS.forEach((k,i)=>{const x=T.keySignature(k,'minor');const want=i-7;if(x&&(x.type==='sharps'?x.count:-x.count)===want&&T.keySignature(x.relative,'major').count===x.count)good++});eq('15 minor keys and their relative majors',good,15);}
eq('relative minor/major',[T.relative('C'),T.relative('G'),T.relative('F'),T.relative('Bb'),T.relative('A','minor'),T.relative('C#','minor'),T.relative('F#')],['A','E','D','G','C','E','D#']);
eq('keyFromSignature',[T.keyFromSignature('sharps',2),T.keyFromSignature('flats',3),T.keyFromSignature('none',0)],[{major:'D',minor:'B'},{major:'Eb',minor:'C'},{major:'C',minor:'A'}]);
t('keyFromSignature bad null',T.keyFromSignature('sharps',8)===null&&T.keyFromSignature('wat',2)===null);

// --- diatonic chords, degrees ---
const dc=(k,m,s)=>T.diatonicChords(k,m,s).map(c=>c.roman).join(' ');
eq('C major romans',dc('C','major'),'I ii iii IV V vi vii°');eq('A natural minor romans',dc('A','natural'),'i ii° III iv v VI VII');
eq('D# harmonic minor romans',dc('D#','harmonic'),'i ii° III+ iv V VI vii°');eq('C major sevenths',dc('C','major',true),'Imaj7 ii7 iii7 IVmaj7 V7 vi7 viiø7');
eq('A harmonic minor sevenths',dc('A','harmonic',true),'i(maj7) iiø7 III+maj7 iv7 V7 VImaj7 vii°7');
const C=T.diatonicChords('C','major');eq('primary chords I IV V in C',[C[0].notes,C[3].notes,C[4].notes],[['C','E','G'],['F','A','C'],['G','B','D']]);
eq('degree names',[C[0].name,C[3].name,C[4].name,C[6].name,T.diatonicChords('A','natural')[6].name],['tonic','subdominant','dominant','leading tone','subtonic']);
const G=T.diatonicChords('G','major');eq('V in G is D major',[G[4].root,G[4].kind,G[4].notes],['D','major',['D','F#','A']]);

// --- naming a heard key in a key ---
eq('nameInKey',[T.nameInKey(66,'G'),T.nameInKey(70,'F'),T.nameInKey(70,'D'),T.nameInKey(60,'C#'),T.nameInKey(71,'Gb'),T.nameInKey(61,'C')],['F#4','Bb4','A#4','B#3','Cb5','C#4']);
t('nameInKey keeps the right pitch',[60,61,62,63,64,65,66,67,68,69,70,71,72].every(m=>T.MAJOR_KEYS.every(k=>T.midi(T.nameInKey(m,k))===m)));

// --- pure: no save writes ---
const before=JSON.stringify(store);T.scale('C','major');T.keySignature('D');T.identifyChord(['C','E','G']);T.interval('C4','G4');
t('theory helpers never touch the save',JSON.stringify(store)===before);
t('version 1.4.1',window.NQ.version==='1.4.1');

console.log(ok+' passed, '+bad+' failed');process.exit(bad?1:0);
