Node.js scripts used for the analysis, in run order:
 mp4info.js <video> audio.aac   (container facts, copy AAC track out)
 extract.mjs                   (decode, mono mix -> analysis.wav, mono24k.s16)
 detect2.js                    (onset candidates -> onsets2.json)
 presses.js                    (keep pitched presses, label keys -> presses.json)
 analyze.js                    (measurements + the game detectors -> results.json)
 proto.js                      (prototype variants -> proto.json)
 flac.js <out.flac> 206.5      (fixture)
 deliver.js <outdir>           (keys.json, keys.csv, expected.json, plots)
Needs: npm install @audio/aac-decode libflacjs
game_detectors.js holds the two game detectors copied unchanged from the brief.
