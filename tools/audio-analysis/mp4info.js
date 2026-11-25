// Minimal MP4 box walker: prints container/track facts and (optionally) extracts the audio track as ADTS AAC.
const fs = require('fs');
const file = process.argv[2], out = process.argv[3];
const fd = fs.openSync(file, 'r');
const size = fs.fstatSync(fd).size;
function rd(pos, len) { const b = Buffer.alloc(len); fs.readSync(fd, b, 0, len, pos); return b; }
function boxes(start, end) {
  const res = []; let p = start;
  while (p + 8 <= end) {
    const h = rd(p, 16); let sz = h.readUInt32BE(0); const type = h.toString('latin1', 4, 8); let hdr = 8;
    if (sz === 1) { sz = Number(h.readBigUInt64BE(8)); hdr = 16; } else if (sz === 0) sz = end - p;
    if (sz < 8) break;
    res.push({ type, start: p, body: p + hdr, end: p + sz }); p += sz;
  }
  return res;
}
const find = (list, t) => list.find(b => b.type === t);
const top = boxes(0, size);
console.log('top-level boxes:', top.map(b => `${b.type}(${b.end - b.start})`).join(' '));
const ftyp = find(top, 'ftyp'); if (ftyp) { const b = rd(ftyp.body, ftyp.end - ftyp.body); console.log('ftyp major:', b.toString('latin1', 0, 4), 'compatible:', b.toString('latin1', 8).match(/.{4}/g)); }
const moov = find(top, 'moov'); const mb = boxes(moov.body, moov.end);
const mvhd = rd(find(mb, 'mvhd').body, 32); const v = mvhd[0];
const mts = v ? mvhd.readUInt32BE(20) : mvhd.readUInt32BE(12), mdur = v ? Number(mvhd.readBigUInt64BE(24)) : mvhd.readUInt32BE(16);
const ctime = v ? Number(mvhd.readBigUInt64BE(4)) : mvhd.readUInt32BE(4);
console.log('movie duration s:', mdur / mts, 'creation:', new Date((ctime - 2082844800) * 1000).toISOString());
// metadata: dump printable strings from udta/meta
function dumpMeta(list, depth) { for (const b of list) { if (['udta', 'meta', 'ilst', 'keys'].includes(b.type) || depth > 0) { const len = Math.min(b.end - b.body, 4096); const raw = rd(b.body, len); console.log(' '.repeat(depth) + 'meta box', b.type, b.end - b.start, JSON.stringify(raw.toString('latin1').replace(/[^\x20-\x7e]+/g, '|').slice(0, 600))); } } }
dumpMeta(mb, 0); dumpMeta(top.filter(b => b.type === 'meta' || b.type === 'udta'), 0);
let audio = null;
for (const trak of mb.filter(b => b.type === 'trak')) {
  const tb = boxes(trak.body, trak.end); const mdia = find(tb, 'mdia'); const db = boxes(mdia.body, mdia.end);
  const hd = rd(find(db, 'hdlr').body, 12).toString('latin1', 8, 12);
  const mdhd = rd(find(db, 'mdhd').body, 32); const mv = mdhd[0];
  const ts = mv ? mdhd.readUInt32BE(20) : mdhd.readUInt32BE(12), dur = mv ? Number(mdhd.readBigUInt64BE(24)) : mdhd.readUInt32BE(16);
  const minf = find(db, 'minf'); const stbl = find(boxes(minf.body, minf.end), 'stbl'); const sb = boxes(stbl.body, stbl.end);
  const stsd = find(sb, 'stsd'); const sd = rd(stsd.body, Math.min(stsd.end - stsd.body, 2048));
  const fmt = sd.toString('latin1', 12, 16);
  const info = { handler: hd, format: fmt, timescale: ts, durationSec: dur / ts };
  if (hd === 'vide') { info.width = sd.readUInt16BE(8 + 8 + 24); info.height = sd.readUInt16BE(8 + 8 + 26); }
  if (hd === 'soun') {
    const e = 8 + 8; // entry body start (after size+type)
    info.channels = sd.readUInt16BE(e + 16); info.sampleSize = sd.readUInt16BE(e + 18); info.sampleRate = sd.readUInt32BE(e + 24) / 65536;
    const i = sd.indexOf('esds');
    if (i > 0) { // parse descriptors
      let p = i + 8; const rdLen = () => { let l = 0, c; do { c = sd[p++]; l = (l << 7) | (c & 127); } while (c & 128); return l; };
      if (sd[p++] === 3) { rdLen(); p += 3; }
      if (sd[p++] === 4) { rdLen(); info.objectTypeIndication = sd[p]; info.maxBitrate = sd.readUInt32BE(p + 5); info.avgBitrate = sd.readUInt32BE(p + 9); p += 13; }
      if (sd[p++] === 5) { const l = rdLen(); const asc = sd.subarray(p, p + l); info.asc = asc.toString('hex'); info.aot = asc[0] >> 3; info.srIndex = ((asc[0] & 7) << 1) | (asc[1] >> 7); info.chanCfg = (asc[1] >> 3) & 15; }
    }
    // sample tables
    const stsz = rd(find(sb, 'stsz').body, find(sb, 'stsz').end - find(sb, 'stsz').body); const uni = stsz.readUInt32BE(4), n = stsz.readUInt32BE(8);
    const sizes = new Uint32Array(n); for (let k = 0; k < n; k++) sizes[k] = uni || stsz.readUInt32BE(12 + 4 * k);
    const stscB = find(sb, 'stsc'); const stsc = rd(stscB.body, stscB.end - stscB.body); const ne = stsc.readUInt32BE(4); const sc = [];
    for (let k = 0; k < ne; k++) sc.push([stsc.readUInt32BE(8 + 12 * k), stsc.readUInt32BE(12 + 12 * k)]);
    let co = find(sb, 'stco'), c64 = false; if (!co) { co = find(sb, 'co64'); c64 = true; }
    const cb = rd(co.body, co.end - co.body); const nc = cb.readUInt32BE(4); const offs = [];
    for (let k = 0; k < nc; k++) offs.push(c64 ? Number(cb.readBigUInt64BE(8 + 8 * k)) : cb.readUInt32BE(8 + 4 * k));
    const sttsB = find(sb, 'stts'); const stts = rd(sttsB.body, sttsB.end - sttsB.body); const nt = stts.readUInt32BE(4); const tt = [];
    for (let k = 0; k < Math.min(nt, 5); k++) tt.push([stts.readUInt32BE(8 + 8 * k), stts.readUInt32BE(12 + 8 * k)]);
    info.frames = n; info.stts = tt; info.totalBytes = sizes.reduce((a, b) => a + b, 0); info.bitrateKbps = info.totalBytes * 8 / info.durationSec / 1000;
    const edts = find(tb, 'edts'); if (edts) { const el = find(boxes(edts.body, edts.end), 'elst'); if (el) { const eb = rd(el.body, el.end - el.body); info.elst = eb.toString('hex').slice(0, 80); } }
    audio = { info, sizes, sc, offs };
  }
  console.log('track:', JSON.stringify(info));
}
if (out && audio && audio.info.format === 'mp4a') {
  const { info, sizes, sc, offs } = audio; let si = 0; const parts = [];
  for (let c = 0; c < offs.length; c++) {
    let spc = 0; for (const [first, cnt] of sc) if (c + 1 >= first) spc = cnt;
    let p = offs[c];
    for (let k = 0; k < spc && si < sizes.length; k++, si++) {
      const len = sizes[si] + 7; const h = Buffer.alloc(7);
      h[0] = 0xff; h[1] = 0xf1; h[2] = ((info.aot - 1) << 6) | (info.srIndex << 2) | (info.chanCfg >> 2);
      h[3] = ((info.chanCfg & 3) << 6) | (len >> 11); h[4] = (len >> 3) & 255; h[5] = ((len & 7) << 5) | 0x1f; h[6] = 0xfc;
      parts.push(h, rd(p, sizes[si])); p += sizes[si];
    }
  }
  fs.writeFileSync(out, Buffer.concat(parts)); console.log('wrote', out, si, 'frames');
}
