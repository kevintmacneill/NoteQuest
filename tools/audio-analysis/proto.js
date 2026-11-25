// PROTOTYPES for the recommendations (NOT the game's shipped behaviour). Writes proto.json.
const fs = require('fs'); const { loadWav, midiName, midiHz, hannMag } = require('./lib'); const { autoCorrelate, DSP } = require('./game_detectors');
const { sr, x } = loadWav('analysis.wav'); const R = JSON.parse(fs.readFileSync('results.json')); const all = R.presses, prim = all.filter(p => p.primary), extra = all.filter(p => !p.primary);
const RANGES = [['A0-B1', 21, 35], ['C2-B2', 36, 47], ['C3-B5', 48, 83], ['C6-F6', 84, 89], ['F#6-C8', 90, 108]];
const tally = (list, fn) => { const o = {}; for (const [n, a, b] of RANGES) { const l = list.filter(p => p.midi >= a && p.midi <= b); o[n] = l.filter(fn).length + '/' + l.length; } o.all = list.filter(fn).length + '/' + list.length; return o; };
const out = {};
// ---- A variants from the stored per-tick readings (autoCorrelate output unchanged; only band / confirmation count differ)
function fireFrom(ticks, lo, hi, need) { let last = null, count = 0, fired = false; for (let k = 0; k < ticks.length; k++) { const f = ticks[k]; if (f > lo && f < hi) { const m = Math.round(12 * Math.log2(f / 440) + 69); if (m === last) count++; else { last = m; count = 1; fired = false; } if (count >= need && !fired) return { midi: m, ms: k * 60 }; } else { last = null; count = 0; fired = false; } } return null; }
out.A_baseline = tally(prim, p => { const r = fireFrom(p.detectorA.ticksHz, 60, 1400, 3); return r && r.midi === p.midi; });
out.A_band25to4500 = tally(prim, p => { const r = fireFrom(p.detectorA.ticksHz, 25, 4500, 3); return r && r.midi === p.midi; });
out.A_band25to4500_confirm2 = tally(prim, p => { const r = fireFrom(p.detectorA.ticksHz, 25, 4500, 2); return r && r.midi === p.midi; });
out.A_band_detail_high = prim.filter(p => p.midi >= 90).map(p => { const r = fireFrom(p.detectorA.ticksHz, 25, 4500, 3), r2 = fireFrom(p.detectorA.ticksHz, 25, 4500, 2); return { key: p.name, confirm3: r ? midiName(r.midi) + '@' + r.ms : 'none', confirm2: r2 ? midiName(r2.midi) + '@' + r2.ms : 'none', silentTicks: p.detectorA.ticksSilent + '/' + p.detectorA.ticks, first5Hz: p.detectorA.first5Hz }; });
// with a per-key calibrated mapping (nearest measured f0 instead of round-to-equal-temperament)
const cal = prim.map(p => ({ midi: p.midi, f: p.f0Hz })); const nearestCal = (f) => { let b = null, bd = 1e9; for (const c of cal) { const d = Math.abs(Math.log2(f / c.f)); if (d < bd) { bd = d; b = c.midi; } } return b; };
function fireCal(ticks, lo, hi, need) { let last = null, count = 0; for (let k = 0; k < ticks.length; k++) { const f = ticks[k]; if (f > lo && f < hi) { const m = nearestCal(f); if (m === last) count++; else { last = m; count = 1; } if (count >= need) return { midi: m, ms: k * 60 }; } else { last = null; count = 0; } } return null; }
out.A_band25to4500_confirm2_calibratedMap = tally(prim, p => { const r = fireCal(p.detectorA.ticksHz, 25, 4500, 2); return r && r.midi === p.midi; });
// ---- A with longer buffers for the low keys (autoCorrelate unchanged), band 25-4500, 3 in a row, first 1.4 s
function simA(p, size, lo, hi, need) { let last = null, count = 0; for (let k = 1; k <= 23; k++) { const t = p.onsetSec + k * 0.06; if (t > p.onsetSec + p.holdMs / 1000) break; const end = Math.round(t * sr); const f = autoCorrelate(x.slice(end - size, end), sr); if (f > lo && f < hi) { const m = Math.round(12 * Math.log2(f / 440) + 69); if (m === last) count++; else { last = m; count = 1; } if (count >= need) return { midi: m, ms: k * 60 }; } else { last = null; count = 0; } } return null; }
const low = prim.filter(p => p.midi <= 47);
for (const size of [4096, 8192]) { const res = low.map(p => ({ p, r: simA(p, size, 25, 4500, 3) })); out['A_buffer' + size + '_lowKeys'] = { 'A0-B1': res.filter(z => z.p.midi <= 35 && z.r && z.r.midi === z.p.midi).length + '/15', 'C2-B2': res.filter(z => z.p.midi >= 36 && z.r && z.r.midi === z.p.midi).length + '/12', detail: res.map(z => z.p.name + '>' + (z.r ? midiName(z.r.midi) : 'none')).join(' ') }; console.log(size, JSON.stringify(out['A_buffer' + size + '_lowKeys'])); }
// ---- B unchanged code, different call options
for (const [label, len, opts] of [['B_frame4096', 4096, {}], ['B_frame8192', 8192, {}], ['B_frame16384', 16384, {}], ['B_frame16384_fft32768', 16384, { fft: 32768 }], ['B_frame4096_cents-20', 4096, { cents: -20 }], ['B_frame16384_cents-20', 16384, { cents: -20 }]]) {
  out[label] = tally(prim, p => { const s = Math.round((p.onsetSec + 0.05) * sr); const r = DSP.detectNotes(x.slice(s, s + len), sr, Object.assign({ lo: 21, hi: 108, maxNotes: 1 }, opts)); return r[0] && r[0].midi === p.midi; }); }
// ---- calibrated harmonic-template detector (prototype): score every key at its own measured f0 and inharmonicity
const tpl = prim.map(p => { const B = p.inharmonicityB || 0; return { midi: p.midi, B, f0: p.f0Hz / Math.sqrt(1 + B) }; });
function template(start, len, mode) { let n = 1; while (n < len * 4) n <<= 1; const M = hannMag(x, start, len, n); const bw = sr / n; const seg = Array.from(M.subarray(Math.round(50 / bw), Math.round(8000 / bw))).sort((a, b) => a - b); const noise = seg[seg.length >> 1];
  const C = new Float64Array(M.length); for (let i = 0; i < M.length; i++) C[i] = Math.sqrt(Math.max(0, M[i] - 2 * noise)); const wm = (f, tol) => { const lo = Math.max(1, Math.round(f * (1 - tol) / bw)), hi = Math.min(C.length - 1, Math.round(f * (1 + tol) / bw)); let m = 0; for (let i = lo; i <= hi; i++) if (C[i] > m) m = C[i]; return m; };
  let best = null; const list = mode === 'generic' ? Array.from({ length: 88 }, (_, i) => ({ midi: 21 + i, f0: midiHz(21 + i), B: 0.0002 })) : tpl;
  for (const k of list) { let sc = 0; for (let h = 1; h <= 12; h++) { const fh = h * k.f0 * Math.sqrt(1 + k.B * h * h); if (fh > 10000) break; const tol = mode === 'generic' ? 0.02 : Math.max(0.006, 0.6 * (sr / len) / fh); sc += (wm(fh, tol) - 0.6 * wm((h - 0.5) * k.f0 * Math.sqrt(1 + k.B * (h - .5) * (h - .5)), tol * 0.6)) / Math.pow(h, 0.4); } if (!best || sc > best.sc) best = { midi: k.midi, sc }; }
  return best.midi; }
for (const len of [2048, 4096, 8192, 16384]) { out['T_calibrated_frame' + len + '_at50ms'] = tally(prim, p => template(Math.round((p.onsetSec + 0.05) * sr), len) === p.midi); }
out['T_calibrated_frame8192_at400ms(later audio than calibration start)'] = tally(prim.filter(p => p.holdMs > 700), p => template(Math.round((p.onsetSec + 0.4) * sr), 8192) === p.midi);
out['T_calibrated_frame8192_extraPresses(not used for calibration)'] = extra.map(p => p.name + '>' + midiName(template(Math.round((p.onsetSec + 0.05) * sr), Math.min(8192, Math.round((p.holdMs / 1000 - 0.06) * sr))))).join(' ');
out['T_uncalibrated_generic_frame8192'] = tally(prim, p => template(Math.round((p.onsetSec + 0.05) * sr), 8192, 'generic') === p.midi);
out['T_uncalibrated_generic_frame16384'] = tally(prim, p => template(Math.round((p.onsetSec + 0.05) * sr), 16384, 'generic') === p.midi);
// adaptive: 16384 below C3, 8192 C3-B5, 2048 above
out['T_calibrated_adaptiveWindow'] = tally(prim, p => { const guess = (len) => template(Math.round((p.onsetSec + 0.05) * sr), len); const g = guess(2048); return (g >= 84 ? g : (guess(8192) >= 48 ? guess(8192) : guess(16384))) === p.midi; });
out.misses_T_calibrated_frame4096 = prim.map(p => [p.name, midiName(template(Math.round((p.onsetSec + 0.05) * sr), 4096))]).filter(z => z[0] !== z[1]).map(z => z.join('>')).join(' ');
out.misses_T_calibrated_frame8192 = prim.map(p => [p.name, midiName(template(Math.round((p.onsetSec + 0.05) * sr), 8192))]).filter(z => z[0] !== z[1]).map(z => z.join('>')).join(' ');
out.misses_T_calibrated_frame16384 = prim.map(p => [p.name, midiName(template(Math.round((p.onsetSec + 0.05) * sr), 16384))]).filter(z => z[0] !== z[1]).map(z => z.join('>')).join(' ');
// combined prototype: 2048-sample look first; if the strongest peak (150-6000 Hz) is above 1 kHz, the note is fundamental-dominant -> nearest calibrated key to that peak; otherwise calibrated harmonic template on a long window
function combined(p, longLen) { const s0 = Math.round((p.onsetSec + 0.05) * sr); const n = 8192, M = hannMag(x, s0, 2048, n), bw = sr / n; let bi = 0, bv = 0; for (let k = Math.round(150 / bw); k < Math.round(6000 / bw); k++) if (M[k] > bv) { bv = M[k]; bi = k; }
  if (bi * bw > 1000) { const al = Math.log(M[bi - 1]), be = Math.log(M[bi]), ga = Math.log(M[bi + 1]); return nearestCal((bi + 0.5 * (al - ga) / (al - 2 * be + ga)) * bw); }
  return template(s0, Math.min(longLen, Math.max(2048, Math.round((p.holdMs / 1000 - 0.06) * sr)))); }
for (const L of [4096, 8192, 16384]) { out['T_combined_peakAbove1kHz_else_template' + L] = tally(prim, p => combined(p, L) === p.midi); out['misses_T_combined_' + L] = prim.map(p => [p.name, midiName(combined(p, L))]).filter(z => z[0] !== z[1]).map(z => z.join('>')).join(' '); }
out['T_combined_16384_extraPresses(not used for calibration)'] = extra.map(p => p.name + '>' + midiName(combined(p, 16384))).join(' ');
console.log(JSON.stringify(Object.fromEntries(Object.entries(out).filter(([k]) => /combined/.test(k))), null, 1)); fs.writeFileSync('proto.json', JSON.stringify(out, null, 1));
