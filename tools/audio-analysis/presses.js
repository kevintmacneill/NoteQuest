// From the raw onset candidates (onsets2.json) keep real, pitched key presses and label them by walking the
// chromatic sequence using measured pitch ratios (robust to this piano's flat/stretched tuning).
const fs = require('fs'); const { loadWav, midiName, midiHz } = require('./lib'); const { estimate } = require('./pitch');
const { sr, x } = loadWav('analysis.wav'); const all = JSON.parse(fs.readFileSync('onsets2.json'));
const RUN_END = 206.5; // free playing (not part of the 88-key run) starts at ~207.3 s
const log = [];
let c = all.filter(o => o.t < RUN_END);
const nAll = c.length;
let strong = c.filter(o => o.rise >= 15 && o.peak >= -12);
// a weaker candidate immediately (<0.2 s) before a stronger one is the same attack (pre-noise): drop it
strong = strong.filter((o, i) => { const n = strong[i + 1]; if (n && n.t - o.t < 0.2 && n.rise > o.rise) { log.push({ t: o.t, why: 'pre-attack noise, merged into onset at ' + n.t.toFixed(3) }); return false; } return true; });
const presses = [];
for (const o of strong) {
  const idx = all.indexOf(o); const nextT = (strong[strong.indexOf(o) + 1] || { t: o.t + 1 }).t; const len = Math.max(4096, Math.min(16384, Math.floor((nextT - o.t - 0.03) * sr)));
  let e = estimate(x, sr, Math.round((o.t + 0.02) * sr), len); const M = e.S.M, bw = sr / e.S.n;
  let bi = 0, bv = 0; for (let k = Math.round(300 / bw); k < Math.round(6000 / bw); k++) if (M[k] > bv) { bv = M[k]; bi = k; }
  const domF = bi * bw; let f = e.f0, how = 'harmonic comb';
  const pitched = (e.nParts >= 4 && e.harmFrac >= 0.3) || o.hiProm >= 28;
  if (!pitched) { log.push({ t: o.t, why: `unpitched thump (key release / knock): peak ${o.peak.toFixed(0)} dBFS, ${e.nParts} partials, harmonic fraction ${e.harmFrac.toFixed(2)}` }); continue; }
  if (domF > 2500 && e.harmFrac < 0.45) { // top octave: one clear partial above the hammer thump
    const a = Math.log(M[bi - 1]), b = Math.log(M[bi]), g = Math.log(M[bi + 1]); f = (bi + 0.5 * (a - g) / (a - 2 * b + g)) * bw; how = 'dominant spectral peak (top octave)'; }
  else if (e.f0 < 200 && e.B > 2.5e-3) { const len2 = Math.max(8192, Math.min(32768, Math.floor((nextT - o.t - 0.25) * sr))); e = estimate(x, sr, Math.round((o.t + 0.2) * sr), len2, { fmax: 45 }); f = e.f0; how = 'harmonic comb on a 0.68 s window, f0 limited to <45 Hz (unrestricted fit locks onto the 3rd partial: no energy at the fundamental)'; }
  presses.push({ t: o.t, rise: o.rise, peak: o.peak, f, B: e.B, how, hf: e.harmFrac });
}
// walk the sequence
let prev = null; const seen = new Set();
for (const p of presses) {
  if (!prev) { p.midi = 21; p.step = 0; p.stepCents = null; }
  else { const cents = 1200 * Math.log2(p.f / prev.f); let st = Math.round(cents / 100); const frac = Math.abs(cents / 100 - Math.round(cents / 100));
    if (Math.abs(cents) < 30) st = 0; else if (frac > 0.35) { const up = Math.ceil(cents / 100), dn = Math.floor(cents / 100); const cand = [dn, up].filter(s => prev.midi + s <= 108 && prev.midi + s >= 21); const fresh = cand.find(s => !seen.has(prev.midi + s) && prev.midi + s === Math.max(...seen) + 1); st = fresh != null ? fresh : cand[0]; p.ambiguous = true; }
    p.midi = prev.midi + st; p.step = st; p.stepCents = cents; }
  p.name = midiName(p.midi); p.cents = 1200 * Math.log2(p.f / midiHz(p.midi)); p.repeat = seen.has(p.midi); seen.add(p.midi); prev = p;
}
presses.forEach((p, i) => console.log(String(i + 1).padStart(3), p.t.toFixed(3).padStart(8), p.name.padEnd(4), String(p.midi).padStart(3), p.f.toFixed(2).padStart(8), 'cents', p.cents.toFixed(0).padStart(4), 'step', p.step, p.stepCents == null ? '' : p.stepCents.toFixed(0).padStart(5), p.repeat ? 'REPEAT' : '', p.ambiguous ? 'AMBIG' : '', 'pk', p.peak.toFixed(0), '|', p.how));
console.log('candidates in run:', nAll, 'strong:', strong.length + log.filter(l => /merged/.test(l.why)).length, 'presses:', presses.length, 'distinct keys:', seen.size, 'min', Math.min(...seen), 'max', Math.max(...seen));
console.log(log);
fs.writeFileSync('presses.json', JSON.stringify({ nCandidates: nAll, runEnd: RUN_END, rejected: log, presses }, null, 1));
