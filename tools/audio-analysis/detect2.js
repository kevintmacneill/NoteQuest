// Onset candidates v2: sharp rise of 150 Hz-8 kHz band level (5 ms hop), then blind pitch for each candidate.
const fs = require('fs'); const { loadWav, hannMag, rmsDb, midiName } = require('./lib'); const { estimate } = require('./pitch');
const { sr, x } = loadWav('analysis.wav'); const hop = 240, win = 1024, nF = Math.floor((x.length - win) / hop);
const L = new Float64Array(nF); const k0 = Math.round(150 * win / sr), k1 = Math.round(8000 * win / sr);
for (let f = 0; f < nF; f++) { const M = hannMag(x, f * hop, win, win); let s = 0; for (let k = k0; k < k1; k++) s += M[k] * M[k]; L[f] = 10 * Math.log10(s + 1e-12); }
const RISE = +(process.argv[2] || 6); const c = [];
for (let f = 12; f < nF - 50; f++) { let mn = 1e9; for (let k = f - 12; k < f - 1; k++) mn = Math.min(mn, L[k]); // min over previous 60 ms
  let mx = -1e9; for (let k = f; k < f + 8; k++) mx = Math.max(mx, L[k]); // max over next 40 ms
  let sus = 0; for (let k = f + 10; k < f + 40; k++) sus += L[k]; sus /= 30; // mean level 50..200 ms later
  const rise = mx - mn; if (rise > RISE && sus - mn > RISE * 0.6 && mx > -62 && L[f] - L[f - 1] > 1.5) c.push({ f, rise, mx, sus, mn }); }
// group candidates within 120 ms, keep the frame with steepest single-step rise
const on = []; for (const q of c) { const l = on[on.length - 1]; const st = L[q.f] - L[q.f - 1]; if (l && (q.f - l.fLast) * hop / sr < 0.12) { l.fLast = q.f; if (st > l.st) { l.f = q.f; l.st = st; } l.rise = Math.max(l.rise, q.rise); l.mx = Math.max(l.mx, q.mx); } else on.push({ f: q.f, fLast: q.f, st, rise: q.rise, mx: q.mx, mn: q.mn }); }
for (const o of on) { const a = Math.max(0, o.f * hop - 480), b = o.f * hop + win; let best = a, br = 0, pv = null; for (let s = a; s + 128 <= b; s += 32) { let e = 0; for (let i = s; i < s + 128; i++) e += x[i] * x[i]; e = Math.sqrt(e / 128) + 2e-4; if (pv != null && e / pv > br) { br = e / pv; best = s + 64; } pv = e; } o.t = best / sr;
  let pk = 0; for (let i = best; i < best + 0.25 * sr && i < x.length; i++) pk = Math.max(pk, Math.abs(x[i])); o.peak = 20 * Math.log10(pk); }
on.forEach((o, i) => { const next = on[i + 1] ? on[i + 1].t : x.length / sr; const len = Math.max(4096, Math.min(16384, Math.floor((next - o.t - 0.03) * sr))); const e = estimate(x, sr, Math.round((o.t + 0.02) * sr), len);
  // strongest peak 1.8-5 kHz and how much it stands above the median there
  const M = e.S.M, bw = sr / e.S.n; let bi = 0, bv = 0; const seg = []; for (let k = Math.round(1800 / bw); k < Math.round(5000 / bw); k++) { seg.push(M[k]); if (M[k] > bv) { bv = M[k]; bi = k; } } seg.sort((a, b) => a - b);
  o.midi = e.midi; o.f0 = e.f0; o.cents = e.cents; o.B = e.B; o.hf = e.harmFrac; o.np = e.nParts; o.hiF = bi * bw; o.hiDb = 20 * Math.log10(bv + 1e-12); o.hiProm = 20 * Math.log10(bv / (seg[seg.length >> 1] + 1e-12)); o.sus = rmsDb(x, Math.round((o.t + 0.1) * sr), Math.round((o.t + 0.4) * sr));
  console.log(String(i + 1).padStart(3), o.t.toFixed(3).padStart(8), 'gap', (i ? o.t - on[i - 1].t : 0).toFixed(2).padStart(5), 'rise', o.rise.toFixed(0).padStart(3), 'pk', o.peak.toFixed(0).padStart(4), 'sus', o.sus.toFixed(0).padStart(4), midiName(e.midi).padEnd(4), String(e.midi).padStart(3), e.f0.toFixed(1).padStart(7), (e.cents >= 0 ? '+' : '') + e.cents.toFixed(0).padStart(3), 'B', e.B.toExponential(0), 'np', String(e.nParts).padStart(2), 'hf', e.harmFrac.toFixed(2), '| hi', o.hiF.toFixed(0).padStart(5), o.hiDb.toFixed(0), 'prom', o.hiProm.toFixed(0)); });
fs.writeFileSync('onsets2.json', JSON.stringify(on));
