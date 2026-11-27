# Phase 1 tablet walkthrough: Kevin + Claude, before the 2-week family trial

**When:** after the Phase 1 work has merged and Claude's full crawler and scenario run on `main` is green (ROADMAP §0). This replaces the older `SAMSUNG_TABLET_PILOT_PLAN.md` for Phase 1.
**Where:** the Android tablet in its case, on the upright piano's music stand, Chrome, the live site.
**Time:** about 45 minutes, plus about 5 for the 88-key sweep.
**Rule:** use **test learners** ("Test A", "Test B"). Don't touch Micaela's or Zoe's saves until the end. Write down anything odd, with the step number; a phone photo of the screen is the best evidence.

Each step says what to do, then what you should see or hear. ✅ = fine, ❌ = write it down. Steps marked **(when it lands)** depend on work that isn't on main yet; skip them if the screen isn't there.

## 0. Before you start
1. Back up the real saves: hold Grown-ups for 3 seconds → copy the save code for each girl and paste it into a note. *See:* a long code starting with the game's prefix.
2. Sound on, tablet volume about two-thirds, room quiet. Turn rotation lock **off**.
3. Note Chrome's version (Chrome menu → Settings → About Chrome).

## 1. First launch
4. Open the site. *See:* the painted harbor title, then **Tap to Play**. Nothing behind it reacts to taps until you tap Tap to Play.
5. **(when it lands)** *See:* "Welcome to NoteQuest! Set this device up to hear your piano?" with **Set up** and **Later**. Tap **Later**. *See:* you go on to Who's playing. Close Chrome completely and reopen. *See:* the welcome asks again (your 11-25 decision).
6. Rotate the tablet both ways on every screen in this walkthrough. *See:* nothing cut off, no sideways scrolling, buttons easy to hit with a fingertip.

## 2. Piano setup (when it lands; about 5 minutes)
7. Tap **Set up**. Allow the microphone. *See:* the privacy line ("listens on this device only").
8. Name the piano "Home piano". Stay quiet for the 2-second check.
9. **Full sweep:** play each highlighted key from the bottom A to the top C, one at a time. *Listen and watch:* every key advances once. Play a **wrong key** on purpose once: it must **not** advance. Stay silent on one key: after 3 tries it's marked unheard and moves on (or a grown-up taps Skip).
10. **Proof:** play C, D, E (middle C upward). *See:* the three names appear and "NoteQuest can hear your piano". Play E, D, C instead first: it must not pass.
11. Write down any key that needed more than one try. That's real data for the listener.

## 3. New player (Test A)
12. Who's playing → **New player**. Type "Test A". Pick **Girl**.
13. **Avatar builder (when #166 lands):** *See:* the Melody Harbor builder with the default girl. Swipe each category (Hair, Skin, Hair Color, Outfit, Accessories). Every choice shows a painted picture; nothing is blank, emoji or broken. Tap **Surprise Me** a few times: always a sensible look. Tap **Back**: your choices are discarded. Go in again and tap **Done**.
14. *See:* **Meet your kitten** with a name box. Type "Melody" → continue. Pull the tablet's power to sleep and wake it in the middle of this step once: you come back to kitten naming, not a broken screen.
15. *See:* the village, "Ready to play, Test A?", with your avatar **(when it lands)** and the kitten walking near her **(when it lands)**.

## 4. Village
16. Swipe the village left and right. *See:* smooth panning, no white edges.
17. Tap a building once. **(when the new village lands)** *See:* a preview card; a second tap or **Visit** goes in. Today on main, one tap goes straight in.
18. **Old screens hidden (decided for Phase 1; check once it lands):** you should **not** find Practice Games, Sticker Book or My Music Progress anywhere in the village.
19. Tap **Companion Sanctuary**. *See:* the painted pen with the kitten. Feed, play, bath. Go back. Tap **Hospital Bay** from the village. *See:* the hospital opens directly.

## 5. Lessons on the real piano (the heart of Phase 1)
20. Tap **Continue Adventure**. *See:* the first Melody Harbor lesson.
21. **(when lesson listening lands)** *See:* "Play it on your piano", with "No piano right now? Use the keys" underneath. Play the right key on the piano. *Listen:* the game hears it and moves on.
22. Play a **wrong** key. *See:* a gentle "try again" that counts as wrong, never as right.
23. Play the right key, **let it ring** and fade out completely. *See:* it counts **once**; the fading sound doesn't trigger a second answer.
24. Play the same note twice quickly ("C, C") at the same loudness, in any question that asks for a repeat. *See:* both are heard. (This is the case the new filter might miss; question 2 in `messages/2026-11-26-1841-…`.)
25. Play very high (top octave) and very low (bottom octave) keys. *See:* "too high/too low to hear clearly", never a wrong answer **(when range limits land)**.
26. Use the on-screen keys for one question. *See:* they still work.
27. Finish the lesson. *See:* a results screen with stars and coins **(new results screen when it lands)**. Tap back to the village.
28. Lock the tablet in the middle of a question, then unlock. *See:* listening has stopped (no mic dot); tap to carry on.

## 6. Grown-up checks and progress
29. Reach a grown-up check (a stop that asks a grown-up to watch). *See:* it needs the 3-second hold and is clearly a grown-up action, and the child can carry on without it.
30. Play Harbor until the end-of-world check (Journey Readiness) appears. Fail one part on purpose. *See:* the child stays in Harbor and is told what to practice. Nothing unlocks.

## 7. Second player and switching
31. Create **Test B** (Boy) and go through to the village.
32. Switch learner (the name button at the top). *See:* Test A's coins, stars, kitten and lesson position are exactly as you left them; Test B's are separate.
33. Start a lesson as Test A, switch to Test B mid-question, then play a key. *See:* nothing is credited to the wrong child.

## 8. Coins can't be farmed
34. Replay the same finished lesson 4 times in a row. *See:* coins shrink and then stop (full, half, quarter, then none). There's no message about it; that's by design. **(when #154 lands)**
35. Change the tablet's date back a day and replay. *See:* still no extra coins.

## 9. Grown-up area
36. Hold Grown-ups for 3 seconds. *See:* piano setup, sound, save code and learners **(new grown-up area when it lands)**. A short tap must not open it.
37. Rename "Home piano"; run setup again; check you can't delete a piano without a second confirmation.

## 10. The girls' real saves
38. Remove the test learners **(when the grown-up area has it)**.
39. Pick Micaela, then Zoe. *See:* their progress, coins and companions are intact. Each sees the avatar builder once (first visit after the update); their progress stays.

## 11. Sign-off
- [ ] No step blocked a child or needed Kevin to rescue.
- [ ] Every ❌ written down, with its step number.
- [ ] Claude files each ❌ as a GitHub issue before the 2-week trial starts.
- [ ] The two weeks start: about 5 days a week, both girls, tablet + piano.
