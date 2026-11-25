// Encode mono 24 kHz 16-bit PCM (trimmed to the 88-key run) to FLAC with libFLAC (wasm), then decode it back and verify bit-exactness.
const fs = require('fs'); const Flac = require('libflacjs')('release');
const outPath = process.argv[2], endSec = +process.argv[3];
const main = () => {
  const raw = fs.readFileSync('mono24k.s16'); const all = new Int16Array(raw.buffer, raw.byteOffset, raw.length / 2); const n = Math.min(all.length, Math.round(endSec * 24000)); const pcm = all.subarray(0, n);
  const enc = Flac.create_libflac_encoder(24000, 1, 16, 8, n, true, 0); if (!enc) throw new Error('encoder'); const chunks = [];
  const st = Flac.init_encoder_stream(enc, (data) => { chunks.push(Buffer.from(data)); }, () => { }); if (st !== 0) throw new Error('init ' + st);
  for (let s = 0; s < n; s += 65536) { const e = Math.min(n, s + 65536); const b = new Int32Array(e - s); for (let i = s; i < e; i++) b[i - s] = pcm[i]; if (!Flac.FLAC__stream_encoder_process_interleaved(enc, b, e - s)) throw new Error('process'); }
  Flac.FLAC__stream_encoder_finish(enc); Flac.FLAC__stream_encoder_delete(enc);
  // libflac writes STREAMINFO first with placeholders when it cannot seek; rebuild header from a second pass is not needed for decoding, but patch total samples + keep as is
  const buf = Buffer.concat(chunks);
  // patch STREAMINFO total_samples (36 bits at byte offset 4+4+13.5): bytes 21..25 of file
  const hi = Math.floor(n / 4294967296) & 0x0f; buf[21] = (buf[21] & 0xf0) | hi; buf.writeUInt32BE(n >>> 0, 22);
  // MD5 of the unencoded PCM (little-endian 16-bit) into STREAMINFO bytes 26..41
  const md5 = require('crypto').createHash('md5').update(Buffer.from(pcm.buffer, pcm.byteOffset, n * 2)).digest(); md5.copy(buf, 26);
  // min/max frame size unknown (0) is allowed by the spec
  fs.writeFileSync(outPath, buf);
  // verify
  const dec = Flac.create_libflac_decoder(true); let pos = 0; const outS = []; let meta = null;
  const ds = Flac.init_decoder_stream(dec, (n2) => { const c = buf.subarray(pos, pos + n2); pos += c.length; return { buffer: c, readDataLength: c.length, error: false }; }, (data) => { outS.push(Buffer.from(data[0])); }, (e, m) => { console.log('decode error', e, m); }, (m) => { meta = m; });
  if (ds !== 0) throw new Error('dinit ' + ds); Flac.FLAC__stream_decoder_process_until_end_of_stream(dec); Flac.FLAC__stream_decoder_finish(dec); Flac.FLAC__stream_decoder_delete(dec);
  const d = Buffer.concat(outS); const same = d.equals(Buffer.from(pcm.buffer, pcm.byteOffset, n * 2));
  console.log('flac bytes', buf.length, 'samples', n, 'sec', (n / 24000).toFixed(3), 'meta', JSON.stringify(meta), 'decoded bytes', d.length, 'bit-exact round trip:', same);
}; if (Flac.isReady()) main(); else Flac.on('ready', main);
