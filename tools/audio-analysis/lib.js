const fs = require('fs');
function loadWav(path) { const b = fs.readFileSync(path); const sr = b.readUInt32LE(24); const off = 58; const ab = b.buffer.slice(b.byteOffset + off, b.byteOffset + b.length); return { sr, x: new Float32Array(ab) }; }
// iterative radix-2 FFT, returns {re, im}
const tc = {};
function fft(x, n) { let t = tc[n]; if (!t) { const c = new Float64Array(n / 2), s = new Float64Array(n / 2); for (let i = 0; i < n / 2; i++) { c[i] = Math.cos(2 * Math.PI * i / n); s[i] = -Math.sin(2 * Math.PI * i / n); } const rev = new Uint32Array(n), bits = Math.log2(n); for (let i = 0; i < n; i++) { let r = 0, v = i; for (let b = 0; b < bits; b++) { r = (r << 1) | (v & 1); v >>= 1; } rev[i] = r; } t = tc[n] = { c, s, rev }; }
  const { c, s, rev } = t; const re = new Float64Array(n), im = new Float64Array(n); for (let i = 0; i < x.length && i < n; i++) re[rev[i]] = x[i];
  for (let size = 2; size <= n; size <<= 1) { const half = size >> 1, step = n / size; for (let i = 0; i < n; i += size) for (let j = 0; j < half; j++) { const k = j * step, a = i + j, b = a + half; const tr = re[b] * c[k] - im[b] * s[k], ti = re[b] * s[k] + im[b] * c[k]; re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti; } }
  return { re, im }; }
function hannMag(x, start, len, n) { const y = new Float64Array(len); for (let i = 0; i < len; i++) y[i] = (x[start + i] || 0) * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (len - 1))); const { re, im } = fft(y, n); const m = new Float64Array(n / 2); for (let i = 0; i < n / 2; i++) m[i] = Math.hypot(re[i], im[i]) * 4 / len; return m; } // amplitude-calibrated (sine amp A -> A... x2/len*2 for hann)
function rmsDb(x, a, b) { let s = 0; a = Math.max(0, a); b = Math.min(x.length, b); for (let i = a; i < b; i++) s += x[i] * x[i]; return 10 * Math.log10(s / Math.max(1, b - a) + 1e-20); }
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const midiName = (m) => NAMES[m % 12] + (Math.floor(m / 12) - 1);
const midiHz = (m) => 440 * Math.pow(2, (m - 69) / 12);
module.exports = { loadWav, fft, hannMag, rmsDb, midiName, midiHz };
