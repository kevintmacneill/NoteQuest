// Decode the demuxed AAC, downmix to mono (0.5L+0.5R, same as ffmpeg -ac 1), write analysis.wav (48k f32)
// and mono24k.s16 (24 kHz 16-bit raw, via a Kaiser-windowed-sinc half-band decimator). No normalisation or denoising.
import fs from 'fs';
import decode from '@audio/aac-decode';
const { channelData, sampleRate } = await decode(new Uint8Array(fs.readFileSync('audio.aac')));
const [L, R] = channelData; const n = L.length;
console.log('decoded', channelData.length, 'ch', sampleRate, 'Hz', n, 'samples', (n / sampleRate).toFixed(3), 's');
const st = (x) => { let pk = 0, s = 0, clip = 0; for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > pk) pk = a; s += x[i] * x[i]; if (a >= 0.999) clip++; } return { peakDb: 20 * Math.log10(pk), rmsDb: 10 * Math.log10(s / x.length), clipped: clip }; };
const mono = new Float32Array(n); for (let i = 0; i < n; i++) mono[i] = 0.5 * (L[i] + (R ? R[i] : L[i]));
let dd = 0, ll = 0; for (let i = 0; i < n; i++) { dd += (L[i] - R[i]) ** 2; ll += L[i] * L[i]; }
console.log('L', st(L), 'R', st(R), 'mono', st(mono), 'L-R diff rel dB', 10 * Math.log10(dd / ll));
function wav(path, data, sr) { const h = Buffer.alloc(58); const bytes = data.length * 4;
  h.write('RIFF', 0); h.writeUInt32LE(50 + bytes, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(18, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(sr, 24); h.writeUInt32LE(sr * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(32, 34); h.writeUInt16LE(0, 36);
  h.write('fact', 38); h.writeUInt32LE(4, 42); h.writeUInt32LE(data.length, 46); h.write('data', 50); h.writeUInt32LE(bytes, 54);
  fs.writeFileSync(path, Buffer.concat([h, Buffer.from(data.buffer, data.byteOffset, bytes)])); }
wav('analysis.wav', mono, sampleRate);
// decimate by 2
const taps = 255, half = (taps - 1) / 2, beta = 9.0, fc = 11400 / sampleRate; // cutoff 11.4 kHz, ~-90 dB by 12.6 kHz
const I0 = (x) => { let s = 1, t = 1; for (let k = 1; k < 40; k++) { t *= (x / (2 * k)) ** 2; s += t; } return s; };
const h = new Float64Array(taps); let hs = 0;
for (let i = 0; i < taps; i++) { const m = i - half; const sinc = m === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * m) / (Math.PI * m); h[i] = sinc * I0(beta * Math.sqrt(1 - (m / half) ** 2)) / I0(beta); hs += h[i]; }
for (let i = 0; i < taps; i++) h[i] /= hs;
const m2 = Math.floor(n / 2); const out = new Int16Array(m2); let clip = 0;
for (let j = 0; j < m2; j++) { let acc = 0; const c = 2 * j; for (let i = 0; i < taps; i++) { const k = c + i - half; if (k >= 0 && k < n) acc += h[i] * mono[k]; }
  let v = Math.round(acc * 32768); if (v > 32767) { v = 32767; clip++; } else if (v < -32768) { v = -32768; clip++; } out[j] = v; }
fs.writeFileSync('mono24k.s16', Buffer.from(out.buffer)); console.log('24k samples', m2, 'clipped', clip);
