// Robust blind f0 estimator for piano tones: harmonic comb on a long-window spectrum with inharmonicity search,
// then least-squares refinement from the measured partial frequencies.
const { hannMag, midiHz } = require('./lib');
const BS = [0, 5e-5, 1e-4, 2e-4, 4e-4, 8e-4, 1.6e-3, 3e-3, 6e-3, 1e-2];
function spectrum(x, sr, start, len) { let n = 1; while (n < len * 4) n <<= 1; return { M: hannMag(x, start, len, n), n, sr, len }; }
function peakNear(S, f, tol) { // strongest local bin within ±tol (ratio), parabolic-interpolated -> {f, a} or null
  const { M, n, sr, len } = S; const bw = sr / n; const res = 1.0 * sr / len; // ~half main-lobe
  const lo = Math.max(1, Math.floor((f * (1 - tol) - 0) / bw)), hi = Math.min(M.length - 2, Math.ceil(f * (1 + tol) / bw));
  let bi = -1, bv = 0; for (let i = lo; i <= hi; i++) if (M[i] > bv) { bv = M[i]; bi = i; }
  if (bi < 1) return null; const isPeak = M[bi] >= M[bi - 1] && M[bi] >= M[bi + 1];
  let d = 0; if (isPeak) { const a = Math.log(M[bi - 1] + 1e-15), b = Math.log(M[bi] + 1e-15), g = Math.log(M[bi + 1] + 1e-15); const den = a - 2 * b + g; d = den ? 0.5 * (a - g) / den : 0; }
  return { f: (bi + d) * bw, a: bv, isPeak };
}
function estimate(x, sr, start, len, opts = {}) {
  const S = spectrum(x, sr, start, len); const { M, n } = S; const bw = sr / n;
  const fmin = opts.fmin || 25, fmax = opts.fmax || 4500, H = 12, fTop = Math.min(sr / 2 - 500, 10000);
  // noise reference: median magnitude 50..8000 Hz
  const seg = Array.from(M.subarray(Math.round(50 / bw), Math.round(8000 / bw))).sort((a, b) => a - b); const noise = seg[seg.length >> 1];
  const C = new Float64Array(M.length); for (let i = 0; i < M.length; i++) C[i] = Math.sqrt(Math.max(0, M[i] - 2 * noise));
  const winMax = (f, tol) => { const lo = Math.max(1, Math.round(f * (1 - tol) / bw)), hi = Math.min(C.length - 1, Math.round(f * (1 + tol) / bw)); let m = 0; for (let i = lo; i <= hi; i++) if (C[i] > m) m = C[i]; return m; };
  let best = null; const steps = Math.round(1200 * Math.log2(fmax / fmin) / 5);
  for (let s = 0; s <= steps; s++) { const f0 = fmin * Math.pow(2, s * 5 / 1200);
    for (const B of BS) { let sc = 0, hits = 0;
      for (let h = 1; h <= H; h++) { const fh = h * f0 * Math.sqrt(1 + B * h * h); if (fh > fTop) break; const tol = Math.max(0.006, 1.2 * (sr / S.len) / fh * 0.5);
        const a = winMax(fh, tol); const fq = (h - 0.5) * f0 * Math.sqrt(1 + B * (h - .5) * (h - .5)); const q = winMax(fq, tol * 0.6);
        sc += (a - 0.6 * q) / Math.pow(h, 0.4); if (a > 0) hits++; }
      if (!best || sc > best.sc) best = { f0, B, sc, hits }; } }
  // refine: collect partials near predicted positions, fit f_h = h f0 sqrt(1+B h^2)
  let { f0, B } = best; const parts = [];
  for (let iter = 0; iter < 3; iter++) { parts.length = 0;
    for (let h = 1; h <= 20; h++) { const fh = h * f0 * Math.sqrt(1 + B * h * h); if (fh > fTop) break; const p = peakNear(S, fh, Math.max(0.012, 0.6 * (sr / S.len) / fh)); if (p && p.isPeak && p.a > 8 * noise) parts.push({ h, f: p.f, a: p.a }); }
    if (parts.length >= 3 && parts[parts.length - 1].h >= 4) { // linear LS on (f/h)^2 = f0^2 + f0^2 B h^2, weighted by amplitude^0.5
      let sw = 0, sx = 0, sy = 0, sxx = 0, sxy = 0; for (const p of parts) { const w = Math.sqrt(p.a), X = p.h * p.h, Y = (p.f / p.h) ** 2; sw += w; sx += w * X; sy += w * Y; sxx += w * X * X; sxy += w * X * Y; }
      const den = sw * sxx - sx * sx; if (den > 0) { const b = (sw * sxy - sx * sy) / den, a = (sy - b * sx) / sw; if (a > 0 && b >= 0) { f0 = Math.sqrt(a); B = b / a; } else if (a > 0) { f0 = Math.sqrt(sy / sw); B = 0; } }
    } else if (parts.length) { const p = parts[0]; f0 = p.f / (p.h * Math.sqrt(1 + B * p.h * p.h)); }
  }
  const p1 = parts.find(p => p.h === 1), p2 = parts.find(p => p.h === 2);
  let tot = 0; for (let i = Math.round(20 / bw); i < Math.round(fTop / bw); i++) tot += M[i] * M[i]; let harm = 0; for (const p of parts) harm += p.a * p.a * (S.n / S.len) * 1.5; // approx energy under a Hann peak in bins
  const midi = 69 + 12 * Math.log2(f0 / 440);
  return { f0, B, midi: Math.round(midi), cents: 100 * (midi - Math.round(midi)), nParts: parts.length, parts, p1, p2, noise, harmFrac: Math.min(1, harm / (tot + 1e-30)), score: best.sc, S };
}
module.exports = { estimate, spectrum, peakNear };
if (require.main === module) {
  const fs = require('fs'); const { loadWav, midiName } = require('./lib'); const { sr, x } = loadWav('analysis.wav'); const on = JSON.parse(fs.readFileSync(process.argv[2] || 'onsets_raw.json'));
  on.forEach((o, i) => { const next = on[i + 1] ? on[i + 1].t : x.length / sr; const len = Math.max(4096, Math.min(16384, Math.floor((next - o.t - 0.03) * sr))); const e = estimate(x, sr, Math.round((o.t + 0.02) * sr), len);
    console.log(String(i + 1).padStart(3), o.t.toFixed(3).padStart(8), 'pk', o.peak.toFixed(0).padStart(4), 'pre', o.pre.toFixed(0).padStart(4), 'len', len, midiName(e.midi).padEnd(4), String(e.midi).padStart(3), e.f0.toFixed(1).padStart(7), (e.cents >= 0 ? '+' : '') + e.cents.toFixed(0), 'B', e.B.toExponential(1), 'np', e.nParts, 'hf', e.harmFrac.toFixed(2)); });
}
