# Samsung tablet — NoteQuest pilot test script

**Owner:** ChatGPT test design · **Status:** not executed; use an intentionally disposable test profile first, not a live family save.

## Preparation (read-only before data changes)
1. Confirm current deployed GitHub Pages build commit and its approval. Do not assume the `chatgpt/ui` draft branch has been deployed.
2. Open the game in portrait and landscape; note device model, Android version, browser, external keyboard and microphone.
3. Export/back up disposable test profiles with `NQ1:` move-progress code. Never use an unbacked-up real student profile for migration tests.
4. If microphone permission is refused, the app must show an honest supported fallback, not silently mark music correct.

## Learner scenarios
| # | Action | Expected observation | Evidence to record |
|---|---|---|---|
| 1 | Open on Samsung landscape | All touch targets and staff fit; no sideways scroll | Screenshot + device resolution |
| 2 | Rotate to portrait | Layout reflows without lost game state | Screenshot |
| 3 | Open 390px simulated phone | 5/7 letter choices do not accidentally overlap | Screenshot |
| 4 | Choose picture-first profile | Can begin simple exercise without reading prose | Demonstration video |
| 5 | Choose adult profile | Respectful text and equivalent mastery criteria | Screenshot |
| 6 | Switch between two profiles | Each learner's scores/pets/coins remain distinct | Before/after values |
| 7 | Start learning round in A and switch to B | Old round cannot score/award in B | Test log |
| 8 | Practice wrong note then correct note | One targeted coaching hint; correctly detected pitch only | Observed pitch + UI |
| 9 | Play acoustic single note | Displayed target and detected pitch agree with instrument | Pitch/cents if provided |
| 10 | Play chord or two hands | No false claim that monophonic mic certified entire chord | Explanation visible |
| 11 | Tap rhythm early/late | Engine judges timings; feedback differentiated by actual timing data | Event log |
| 12 | Finish check twice same day | No immediate `Secure` through duplicate checks | Skill state |
| 13 | Re-check following day | Secure only after approved criterion and evidence | State dates |
| 14 | Attempt journey to next world with missing requirement | Targeted practice suggested; earlier world and care still available | Screen + states |
| 15 | Complete valid journey proofs | Next structured region unlocks exactly once | Before/after |
| 16 | Switch profiles mid-journey | No cross-profile badge/unlock credit | Test log |
| 17 | Start bath, cancel and refresh | No soap spent and pet not falsely cleaned | Inventory snapshots |
| 18 | Finish bath | One soap spent; no pen mess removed | Inventory/habitat |
| 19 | Clean one pen mess | One bag spent, one mess removed; no pet bath effect | Inventory/habitat |
| 20 | Run out of care supplies | Practice-for-coins path accessible; no real-money gate | UI |
| 21 | Change primary pet and sidekick | Only owned pets selectable; two roles distinct | Profile state |
| 22 | Import legacy `NQ1:` code | All prior learner data preserved, idempotent migration | Diff of test profile |
| 23 | Turn on reduced motion | Readable static outcome for all care/task animations | Screenshot |
| 24 | Simulate missing animal-art asset | Lessons still work with neutral fallback | Console |
| 25 | Observe 10–20 minute practice | No unsafe repetitive strain demands; learner may pause | Observational notes |
| 26 | Finish advanced human-assessed task | UI labels human check and does not pretend mic certified posture | Screen + evidence |
| 27 | Background and resume | Active session handled safely; no double rewards | Logs |
| 28 | Offline or degraded network after initial load | Clear available/offline state, no spurious successful audio claims | Screenshot |

## Sign-off procedure
Each item records **pass/fail/not run**, exact branch/commit, tester, device, screenshots/console notes. Unperformed tests remain NOT RUN. Regressions become one GitHub review issue each if attributable to a PR. A release candidate is not accepted while any blocking failure remains.

**Human observation note:** For a pre-reader, ask whether they understood picture-first instructions, whether confusion feels reversible, and whether the motivating journey feels inviting—not whether they can read the words.
