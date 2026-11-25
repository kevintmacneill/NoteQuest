// Log-frequency spectrogram PNGs for visual inspection. usage: node specgram.js t0 t1 out.png [pxPerSec] [onsets.json]
const fs = require('fs'); const { loadWav, hannMag, rmsDb } = require('./lib'); const { Canvas } = require('./png');
const { sr, x } = loadWav('analysis.wav'); const t0 = +process.argv[2], t1 = +process.argv[3], out = process.argv[4], pps = +(process.argv[5] || 30);
const marks = process.argv[6] ? JSON.parse(fs.readFileSync(process.argv[6])) : [];
const W = Math.round((t1 - t0) * pps), H = 520, LEVH = 70, ML = 30, fLo = 25, fHi = 6000, win = 4096, n = 16384;
const cv = new Canvas(W + ML, H + LEVH + 14, [0, 0, 0]);
const yOf = (f) => H - 1 - Math.round((H - 1) * Math.log(f / fLo) / Math.log(fHi / fLo));
for (let px = 0; px < W; px++) { const c = Math.round((t0 + px / pps) * sr); const M = hannMag(x, c - win / 2, win, n);
  for (let y = 0; y < H; y++) { const fA = fLo * Math.pow(fHi / fLo, (H - 1 - y - 0.5) / (H - 1)), fB = fLo * Math.pow(fHi / fLo, (H - 1 - y + 0.5) / (H - 1)); let m = 0; const a = Math.floor(fA * n / sr), b = Math.max(a, Math.floor(fB * n / sr)); for (let k = a; k <= b; k++) if (M[k] > m) m = M[k];
    const db = 20 * Math.log10(m + 1e-9); const v = Math.max(0, Math.min(1, (db + 85) / 70)); cv.px(ML + px, y, [Math.round(255 * Math.min(1, v * 2)), Math.round(255 * Math.max(0, v * 2 - 0.6) / 1.4), Math.round(255 * Math.max(0, 0.5 - Math.abs(v - 0.3)) * 1.2)]); }
  const lv = rmsDb(x, c - 240, c + 240); const ly = H + LEVH - Math.round(LEVH * Math.max(0, Math.min(1, (lv + 70) / 70))); cv.line(ML + px, H + LEVH, ML + px, ly, [90, 200, 90]); }
for (let m = 24; m <= 108; m += 12) { const f = 440 * Math.pow(2, (m - 69) / 12); const y = yOf(f); for (let px = 0; px < W; px += 6) cv.px(ML + px, y, [70, 70, 110]); cv.text(2, y - 3, 'C' + (m / 12 - 1), [200, 200, 255]); }
for (let s = Math.ceil(t0); s <= t1; s++) { const px = ML + Math.round((s - t0) * pps); const big = s % 5 === 0; cv.line(px, H + LEVH, px, H + LEVH + (big ? 5 : 2), [255, 255, 255]); if (big) { cv.text(px - 8, H + LEVH + 6, String(s), [255, 255, 255]); for (let y = 0; y < H; y += 8) cv.px(px, y, [60, 60, 60]); } }
for (const m of marks) { if (m.t < t0 || m.t > t1) continue; const px = ML + Math.round((m.t - t0) * pps); for (let y = 0; y < 12; y++) cv.px(px, y, [0, 255, 255]); if (m.label) cv.text(px + 2, 2 + (m.row || 0) * 9, m.label, [0, 255, 255]); }
cv.save(out); console.log('wrote', out, cv.w, cv.h);
