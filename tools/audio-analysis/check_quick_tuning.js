// WP-L3 baseline: fit 11 measured tuning anchors, then test the unmeasured keys.
// Usage: node tools/audio-analysis/check_quick_tuning.js <keys.json>
// Only derived tuning measurements are read. The command fails when the fit misses the approved tolerance.
const fs = require('node:fs');

const QUICK_KEYS = [21, 24, 36, 43, 48, 60, 67, 72, 84, 96, 108];
const PROOF_LOW = 36;
const PROOF_HIGH = 96;
const TOLERANCE_CENTS = 10;

function interpolate(anchors, midi) {
  const index = anchors.findIndex(key => key.midi >= midi);
  const right = anchors[index];
  if (right.midi === midi) return right.cents;
  const left = anchors[index - 1];
  const fraction = (midi - left.midi) / (right.midi - left.midi);
  return left.cents + fraction * (right.cents - left.cents);
}

function checkQuickTuning(measurements) {
  if (!Array.isArray(measurements)) throw new Error('Expected the per-key measurements array');
  const byMidi = new Map();
  for (const key of measurements) {
    if (!Number.isInteger(key?.midi) || key.midi < 21 || key.midi > 108 ||
        !Number.isFinite(key.cents) || byMidi.has(key.midi)) {
      throw new Error('Expected one finite cents measurement per key from A0 through C8');
    }
    byMidi.set(key.midi, key);
  }
  if (byMidi.size !== 88) throw new Error('Expected all 88 full-sweep measurements');
  const anchors = QUICK_KEYS.map(midi => byMidi.get(midi));
  const compared = [];
  for (let midi = PROOF_LOW; midi <= PROOF_HIGH; midi++) {
    if (QUICK_KEYS.includes(midi)) continue;
    const measured = byMidi.get(midi);
    const estimate = interpolate(anchors, midi);
    compared.push({midi, name:measured.name, measured:measured.cents, estimate, error:Math.abs(measured.cents-estimate)});
  }
  return {proofRange:'C2–C7', toleranceCents:TOLERANCE_CENTS, anchors:anchors.map(({midi,name,cents})=>({midi,name,cents})),
    holdoutKeys:compared.length, outsideTolerance:compared.filter(key=>key.error>TOLERANCE_CENTS),
    maximumErrorCents:Math.max(...compared.map(key=>key.error)),
    meanErrorCents:compared.reduce((sum,key)=>sum+key.error,0)/compared.length};
}

if (require.main === module) {
  const fixture = process.argv[2];
  if (!fixture) {
    console.error('Usage: node tools/audio-analysis/check_quick_tuning.js <keys.json>');
    process.exitCode = 2;
  } else {
    try {
      const result = checkQuickTuning(JSON.parse(fs.readFileSync(fixture, 'utf8')));
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = result.outsideTolerance.length ? 1 : 0;
    } catch (error) {
      console.error(error.message);
      process.exitCode = 2;
    }
  }
}
module.exports = {checkQuickTuning};
