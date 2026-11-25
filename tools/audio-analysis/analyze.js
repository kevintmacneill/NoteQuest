// Step 3 + 4: per-press measurements and the game's two detectors (unmodified) -> results.json
const fs = require('fs'); const { loadWav, midiName, midiHz, rmsDb } = require('./lib'); const { estimate, peakNear } = require('./pitch'); const { autoCorrelate, DSP } = require('./game_detectors');
const { sr, x } = loadWav('analysis.wav'); const P = JSON.parse(fs.readFileSync('presses.json')); const presses = P.presses; const RUN_END = P.runEnd;
const db = (v) => 20 * Math.log10(v + 1e-12); const r1 = (v) => v == null ? null : Math.round(v * 10) / 10; const r2 = (v) => v == null ? null : Math.round(v * 100) / 100;
// ---- choose the primary press of each key: first press held >= 1.7 s before any other press; else the first press
presses.forEach((p, i) => { p.i = i; p.nextT = presses[i + 1] ? presses[i + 1].t : Math.min(RUN_END, p.t + 3); p.holdMs = (p.nextT - p.t) * 1000; });
const byKey = {}; presses.forEach(p => (byKey[p.midi] = byKey[p.midi] || []).push(p));
for (const k in byKey) { const l = byKey[k]; const prim = l.find(p => p.holdMs >= 1700 && (p.i === 0 || p.t - presses[p.i - 1].t >= 0.5)) || l[0]; l.forEach(p => p.primary = p === prim); }
// ---- global room noise: quietest 0.5 s window in the run
let room = 0; { let best = 1e9; const w = sr / 2; for (let s = 0; s + w < RUN_END * sr; s += sr / 10) { const v = rmsDb(x, s, s + w); if (v < best) best = v; } room = best; }
function classify(det, midi) { if (det == null) return 'none'; if (det === midi) return 'correct'; if ((det - midi) % 12 === 0) return 'wrong-octave'; return 'wrong-note'; }
function simA(tOn, tEnd, phase) { const fires = []; let last = null, count = 0, fired = false; const ticks = [];
  for (let k = 0; ; k++) { const t = tOn + phase + k * 0.06; if (t >= tEnd) break; const end = Math.round(t * sr); const buf = x.slice(end - 2048, end); const f = autoCorrelate(buf, sr);
    let m = null; if (f > 60 && f < 1400) { m = Math.round(12 * Math.log2(f / 440) + 69 - 0 / 100); if (m === last) { count++; } else { last = m; count = 1; fired = false; } if (count >= 3 && !fired) { fired = true; fires.push({ midi: m, ms: Math.round((t - tOn) * 1000) }); } } else { last = null; count = 0; fired = false; }
    ticks.push({ f, m }); }
  return { fires, ticks }; }
const out = [];
for (const p of presses) {
  const m = p.midi, nom = midiHz(m), on = Math.round(p.t * sr), nxt = Math.round(p.nextT * sr);
  // ---- levels
  let pk = 0; for (let i = on; i < Math.min(nxt, on + sr / 2); i++) pk = Math.max(pk, Math.abs(x[i]));
  const hop = 240, w = 960; const env = []; for (let s = on - w / 2; s + w <= nxt + w / 2; s += hop) env.push(rmsDb(x, s, s + w));
  let im = 0; for (let i = 0; i < Math.min(env.length, 60); i++) if (env[i] > env[im]) im = i; const eMax = env[im];
  const noise = rmsDb(x, on - 0.25 * sr, on - 0.03 * sr);
  const decay = (d) => { for (let i = im; i < env.length; i++) if (env[i] < eMax - d) return Math.round(i * hop / sr * 1000); return null; };
  // ---- pitch: key-specific fit (search -130..+100 cents around nominal), long window starting 50 ms after onset
  const avail = nxt - on - Math.round(0.06 * sr); const want = m < 48 ? 32768 : m < 84 ? 16384 : 8192; const len = Math.max(2048, Math.min(want, avail));
  const e = estimate(x, sr, on + Math.round(0.05 * sr), len, { fmin: nom * Math.pow(2, -130 / 1200), fmax: nom * Math.pow(2, 100 / 1200) });
  const S = e.S; const amp = (h) => { const q = e.parts.find(z => z.h === h); if (q) return q.a; const f = h * e.f0 * Math.sqrt(1 + e.B * h * h); if (f > sr / 2 - 500) return 0; const z = peakNear(S, f, 0.012); return z ? z.a : 0; };
  const hA = []; for (let h = 1; h <= 16; h++) hA.push(amp(h)); const strongest = hA.indexOf(Math.max(...hA)) + 1;
  const f1fit = e.f0 * Math.sqrt(1 + e.B); let part1 = e.parts.find(z => z.h === 1); if (part1) { const bw = sr / S.n; const seg = []; for (let k = Math.round(part1.f * 0.7 / bw); k <= Math.round(part1.f * 1.3 / bw); k++) if (Math.abs(k * bw / part1.f - 1) > 0.04) seg.push(S.M[k]); seg.sort((a, b) => a - b); const prom = part1.a / (seg[seg.length >> 1] + 1e-15); if (prom < 4 || (e.nParts >= 4 && Math.abs(1200 * Math.log2(part1.f / f1fit)) > 30)) part1 = null; } const f0 = part1 ? part1.f : f1fit;
  const sp = e.parts.find(z => z.h === strongest); const effF0 = sp ? sp.f / strongest : null;
  // independent blind check (no knowledge of the key)
  const blind = (() => { const b = estimate(x, sr, on + Math.round(0.05 * sr), len); let f = b.f0; const M = b.S.M, bw = sr / b.S.n; let bi = 0, bv = 0; for (let k = Math.round(300 / bw); k < Math.round(6000 / bw); k++) if (M[k] > bv) { bv = M[k]; bi = k; } if (bi * bw > 2500 && b.harmFrac < 0.45) f = bi * bw; return f; })();
  const rec = { pressIndex: p.i + 1, midi: m, name: midiName(m), primary: p.primary, onsetSec: Math.round(p.t * 1000) / 1000, holdMs: Math.round(p.holdMs), attackRiseDb: r1(p.rise),
    peakDbfs: r1(db(pk)), peakRmsDbfs: r1(eMax), noiseDbfs: r1(noise), snrDb: r1(eMax - noise), f0Hz: r2(f0), nominalHz: r2(nom), cents: r1(1200 * Math.log2(f0 / nom)), f0Derived: !part1,
    inharmonicityB: e.nParts >= 4 ? +e.B.toExponential(2) : null, partialsFound: e.nParts, strongestPartial: strongest, centsFromStrongestPartial: effF0 ? r1(1200 * Math.log2(effF0 / nom)) : null,
    h1Db: r1(db(hA[0])), h2Db: r1(db(hA[1])), fundamentalWeaker: hA[1] > hA[0], fundamentalBelowStrongestDb: r1(db(Math.max(...hA)) - db(hA[0])),
    decay20Ms: decay(20), decay40Ms: decay(40), blindF0Hz: r2(blind), blindCentsFromKey: r1(1200 * Math.log2(blind / nom)) };
  // ---- Detector A (Mic): phase 0 over the whole hold; 3 more phases for robustness (first 1.2 s)
  const A = simA(p.t, p.nextT, 0); const first = A.fires[0] || null; const tk = A.ticks; const inR = tk.filter(z => z.m != null);
  const hist = {}; inR.forEach(z => hist[z.m] = (hist[z.m] || 0) + 1); const modal = Object.keys(hist).sort((a, b) => hist[b] - hist[a])[0];
  const ph = [0.015, 0.03, 0.045].map(d => { const r = simA(p.t, Math.min(p.nextT, p.t + 1.2), d).fires[0]; return r ? r.midi : null; });
  const first12 = A.fires.find(f => f.ms <= 1200); const phAll = [first12 ? first12.midi : null, ...ph];
  rec.detectorA = { fired: !!first, midi: first ? first.midi : null, correct: first ? first.midi === m : false, result: classify(first ? first.midi : null, m), latencyMs: first ? first.ms : null,
    allFired: A.fires, ticks: tk.length, ticksSilent: tk.filter(z => z.f === -1).length, ticksBelow60Hz: tk.filter(z => z.f !== -1 && z.f <= 60).length, ticksAbove1400Hz: tk.filter(z => z.f >= 1400).length, ticksInRange: inR.length,
    modalReadMidi: modal != null ? +modal : null, modalReadCount: modal != null ? hist[modal] : 0, first5Hz: tk.slice(1, 6).map(z => z.f === -1 ? -1 : Math.round(z.f * 10) / 10), correctInPhases: phAll.filter(v => v === m).length + '/4', ticksHz: tk.map(z => z.f === -1 ? -1 : Math.round(z.f * 100) / 100) };
  // ---- Detector B (DSP.detectNotes): 4096-sample frames at +50, +150, +300 ms
  const B = {}; for (const d of [50, 150, 300]) { const s = on + Math.round(d / 1000 * sr); const fr = x.slice(s, s + 4096);
    const full1 = DSP.detectNotes(fr, sr, { lo: 21, hi: 108, maxNotes: 1 }); const def = DSP.detectNotes(fr, sr, {}); const full4 = DSP.detectNotes(fr, sr, { lo: 21, hi: 108, maxNotes: 4 });
    B[d] = { full: full1[0] ? full1[0].midi : null, def: def[0] ? def[0].midi : null, defAll: def.map(n => n.midi), full4: full4.map(n => n.midi), full4sal: full4.map(n => Math.round(n.salience * 100) / 100) }; }
  const b = B[50];
  rec.detectorB_default = { midi: b.def, correct: b.def === m, result: classify(b.def, m), allNotes: b.defAll, at150: { midi: B[150].def, correct: B[150].def === m, allNotes: B[150].defAll }, at300: { midi: B[300].def, correct: B[300].def === m, allNotes: B[300].defAll } };
  rec.detectorB_full = { midi: b.full, correct: b.full === m, result: classify(b.full, m), extras: b.full4.filter(v => v !== m), maxNotes4: b.full4, salience4: b.full4sal,
    at150: { midi: B[150].full, correct: B[150].full === m, extras: B[150].full4.filter(v => v !== m) }, at300: { midi: B[300].full, correct: B[300].full === m, extras: B[300].full4.filter(v => v !== m) } };
  out.push(rec);
  console.log(String(rec.pressIndex).padStart(3), rec.name.padEnd(4), p.primary ? 'P' : 'x', rec.onsetSec.toFixed(2).padStart(7), 'pk', String(rec.peakDbfs).padStart(6), 'snr', String(rec.snrDb).padStart(5), 'f0', String(rec.f0Hz).padStart(8), rec.f0Derived ? 'd' : ' ', 'c', String(rec.cents).padStart(6), 'blind', String(rec.blindCentsFromKey).padStart(7), 'sp', String(strongest).padStart(2), 'h1-h2', String(r1(rec.h1Db - rec.h2Db)).padStart(6), 'd20', String(rec.decay20Ms).padStart(5), 'd40', String(rec.decay40Ms).padStart(5),
    '| A', (first ? midiName(first.midi) + '@' + first.ms : 'none').padEnd(9), rec.detectorA.result.padEnd(12), rec.detectorA.correctInPhases, '| Bdef', b.def == null ? 'none' : midiName(b.def), '| Bfull', b.full == null ? 'none' : midiName(b.full), 'x4', b.full4.map(midiName).join(','), '| 150:', B[150].full == null ? '-' : midiName(B[150].full), '300:', B[300].full == null ? '-' : midiName(B[300].full));
}
// ---- end-to-end: the game's streaming Listener (defaults) over the run
const ev = []; { const L = new DSP.Listener(sr, {}); const N = Math.round(RUN_END * sr); for (let s = 0; s < N; s += 2048) { L.push(x.subarray(s, Math.min(N, s + 2048)), s / sr); while (L.events.length) ev.push(L.events.shift()); } }
const onsetsL = ev.filter(e => e.type === 'onset'), notesL = ev.filter(e => e.type === 'notes');
for (const rec of out) { const o = onsetsL.find(e => Math.abs(e.t - rec.onsetSec) < 0.08); const n = notesL.find(e => Math.abs(e.t - rec.onsetSec) < 0.08); rec.listener = { onsetDetected: !!o, onsetErrMs: o ? Math.round((o.t - rec.onsetSec) * 1000) : null, top: n ? n.top : null, correct: n ? n.top === rec.midi : false, notes: n ? n.midis : [] }; }
const matched = new Set(out.map(r => r.listener.onsetDetected ? onsetsL.find(e => Math.abs(e.t - r.onsetSec) < 0.08) : null).filter(Boolean));
const summary = { roomNoiseDbfs: r1(room), listener: { onsets: onsetsL.length, noteEvents: notesL.length, onsetsMatchedToPresses: matched.size, spuriousOnsets: onsetsL.length - matched.size, spuriousNoteEvents: notesL.filter(n => !out.some(r => Math.abs(n.t - r.onsetSec) < 0.08)).map(n => ({ t: Math.round(n.t * 100) / 100, top: n.top })) } };
console.log(JSON.stringify(summary.listener).slice(0, 1500));
fs.writeFileSync('results.json', JSON.stringify({ summary, presses: out }, null, 1));
