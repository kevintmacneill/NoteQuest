/* Melody Harbor UI adapted from PR #32. NQ owns scoring, locks and saving. */
(function () {
  "use strict";
  const INTRO = {
    "k-blackwhite": "Find the short, raised black keys and the long, flat white keys on your piano.",
    "e-highlow": "Play a key near each end of your piano. Keys on the left sound lower. Keys on the right sound higher.",
    "t-posture": "Sit tall with loose shoulders. Rest your feet on the floor or on a stool and keep your elbows near the height of the keys.",
    "t-hands": "Pretend you are holding a bubble. Keep that gentle curve in your fingers when you rest them on the keys.",
    "e-contour": "Play two notes. Moving right sounds like going up, moving left sounds like going down, and repeating a key sounds the same.",
    "r-pulse": "Tap along with steady footsteps. Keep the space between taps the same, like walking down the dock.",
    "e-loudsoft": "Try playing the same key gently, then a little more firmly. Listen to how its loudness changes."
  };
  const STATES = {
    "not-introduced": "New",
    exploring: "Exploring",
    developing: "Practiced",
    secure: "Mastered",
    transferable: "Mastered"
  };
  const CHILD_TITLE = (item) => item.title?.child || item.title?.adult || item.title || "Music lesson";

  const {supports, showQuestion, node, button, keyPicture, soundPlayer} = window.NoteQuestActivity;
  const DEMOS = {
    "e-highlow": [
      ["Hear low then high", [{midi: 48}, {midi: 72, delay: .7}]]
    ],
    "e-contour": [
      ["↑ Hear up", [{midi: 60}, {midi: 67, delay: .7}]],
      ["↓ Hear down", [{midi: 67}, {midi: 60, delay: .7}]],
      ["→ Hear the same sound twice", [{midi: 60}, {midi: 60, delay: .7}]]
    ],
    "r-pulse": [
      ["Hear four steady beats", [0, .91, 1.82, 2.73].map(delay => ({midi: 69, delay}))]
    ],
    "e-loudsoft": [
      ["Hear soft then loud", [{midi: 60, volume: .07}, {midi: 60, delay: .7, volume: .42}]]
    ]
  };

  function render(root, learn, go, stopId, back) {
    const out = node("section", "", "nqh-shell");
    root.append(out);
    let roundId;
    let clearQuestion;
    const demoSound = soundPlayer();

    function reset() {
      demoSound.stop();
      clearQuestion?.();
      clearQuestion = undefined;
      if (roundId) learn.cancel(roundId);
      roundId = undefined;
    }

    function panel(title, text) {
      reset();
      out.replaceChildren();
      const heading = node("h2", title);
      heading.tabIndex = -1;
      const hero = node("div", "", "nqh-lesson-hero");
      hero.append(heading);
      if (text) hero.append(node("p", text, "nqh-lead"));
      out.append(hero);
      heading.focus({preventScroll: true});
    }

    function statusLabel(status) {
      if (status.complete) return "Mastered";
      if (!status.unlocked) return "Locked";
      return {learn: "Ready to learn", practice: "Practicing", check: "Ready for a skill check"}[status.step];
    }

    function path() {
      panel("Your first musical adventure", "Choose a lesson in Melody Harbor.");
      const stops = learn.stops("NQ-00").map(id => learn.stopStatus(id)).filter(Boolean);
      const complete = stops.filter(stop => stop.complete).length;
      out.append(node("p", complete + " of " + stops.length + " lesson stops mastered", "nqh-progress-label"));
      for (const stop of stops) {
        const card = node("article", "", "nqh-stop");
        card.append(node("h3", CHILD_TITLE(stop)), node("p", statusLabel(stop), "nqh-state"));
        if (stop.unlocked) card.append(button("Open " + CHILD_TITLE(stop), () => go("engineLesson", stop.id)));
        else card.append(node("p", "Master the previous lesson to open this one."));
        out.append(card);
      }
    }

    function lesson() {
      const stop = learn.stopStatus(stopId);
      if (!stop || stop.level !== "NQ-00" || !stop.unlocked) {
        panel("Lesson unavailable", "Finish the earlier lessons, then try again.");
        return;
      }
      const skills = stop.skills.map(({id}) => learn.skill(id)).filter(Boolean);
      panel(CHILD_TITLE(stop), statusLabel(stop));
      const intro = node("div", "", "nqh-stop");
      intro.append(node("h3", "Learn"));
      for (const skill of skills) {
        intro.append(node("p", INTRO[skill.id] || CHILD_TITLE(skill)));
        if (skill.id === "k-blackwhite") {
          const examples = node("div", "", "nqh-toolbar");
          for (const [id, label] of [["key-black", "Black key"], ["key-white", "White key"]]) {
            const figure = node("figure");
            figure.append(keyPicture(id), node("figcaption", label));
            examples.append(figure);
          }
          intro.append(examples);
        }
        if (DEMOS[skill.id]) {
          const examples = node("div", "", "nqh-toolbar");
          const feedback = node("p", "", "nqh-feedback");
          feedback.setAttribute("role", "status");
          for (const [label, notes] of DEMOS[skill.id]) {
            examples.append(button(label, async () => {
              demoSound.stop();
              const played = await demoSound.play(notes);
              if (feedback.isConnected) feedback.textContent = played ? "" : "Sound is unavailable. Keep exploring on your piano.";
            }));
          }
          intro.append(examples, feedback);
        }
      }
      if (stop.step === "learn" && !stop.complete && skills.some(skill => supports(skill) && learn.skillState(skill.id).playable !== false)) {
        intro.append(button("I've explored it", () => {
          if (learn.stopStatus(stopId)?.unlocked && learn.markLearned(stopId)) lesson();
        }, "nqh-btn nqh-main"));
      }
      const reference = node("a", "Music Reference", "nqh-btn");
      reference.href = "./reference.html";
      intro.append(reference);
      out.append(intro);
      const grid = node("div", "", "nqh-skill-grid");
      for (const skill of skills) {
        const info = learn.skillState(skill.id);
        const card = node("article", "", "nqh-skill");
        card.append(node("h3", CHILD_TITLE(skill)), node("p", STATES[info.state], "nqh-state"));
        if (!supports(skill) || info.playable === false) {
          card.append(node("p", "This activity is coming soon."));
        } else if (!info.prereqsMet) {
          const names = info.missing.map(id => learn.skill(id)).filter(Boolean).map(CHILD_TITLE);
          card.append(node("p", "Practice first: " + names.join(", ")));
        } else if (stop.step !== "learn" || stop.complete) {
          card.append(button("Practice " + CHILD_TITLE(skill), () => start(skill, "practice")));
          if (["developing", "secure", "transferable"].includes(info.state)) {
            card.append(button("Check " + CHILD_TITLE(skill), () => start(skill, "check"), "nqh-btn nqh-main"));
          }
        }
        grid.append(card);
      }
      out.append(grid);
    }

    function start(skill, mode) {
      panel(CHILD_TITLE(skill), mode === "check" ? "Skill check" : "Practice");
      const board = node("div", "", "nqh-board");
      out.append(button("Back to lesson", lesson), board);
      if (!learn.stopStatus(stopId)?.unlocked) return unavailable();
      const result = learn.start(skill.id, mode);
      if (!result.ok) {
        board.append(node("p", result.reason === "needs-reading" ?
          "This activity needs reading. Go back to choose another." :
          "This activity cannot start yet. Go back to choose another.", "nqh-alert"));
        return;
      }
      roundId = result.roundId;
      draw(result.question);

      function unavailable() {
        reset();
        board.replaceChildren(node("p", "This activity is coming soon. No answer was submitted for this question.", "nqh-alert"));
      }

      function draw(question, message) {
        clearQuestion?.();
        clearQuestion = undefined;
        if (!question) { unavailable(); return; }
        const count = node("h3", "Question " + (question.index + 1) + " of " + question.total, "nqh-count");
        count.tabIndex = -1;
        const feedback = node("p", message, "nqh-feedback");
        feedback.setAttribute("role", "status");
        const box = node("div", "", "nqh-question");
        board.replaceChildren(count, feedback, box);
        clearQuestion = showQuestion(box, question, answer, unavailable);
        if (box.isConnected) count.focus({preventScroll: true});
      }

      function answer(value) {
        if (!roundId || !board.isConnected) return;
        const reply = learn.answer(roundId, value);
        if (!reply.ok) {
          reset();
          board.replaceChildren(node("p", "That answer did not go through. Go back to the lesson to try again.", "nqh-alert"));
          return;
        }
        if (!reply.done) {
          draw(reply.next, reply.correct ? "Good work!" :
            reply.reveal === undefined ? "Not quite. Give it another try." : "Try " + reply.reveal + ".");
          return;
        }
        reset();
        const {correct, total, pass, stateAfter} = reply.result;
        const heading = node("h3", mode === "check" ? (pass ? "Skill check passed" : "Keep practicing") : "Practice finished");
        heading.tabIndex = -1;
        board.replaceChildren(heading, node("p", correct + " of " + total + " correct on the first try."),
          node("p", "Saved progress: " + STATES[stateAfter] + ".", "nqh-feedback"));
        if (mode === "check" && pass && stateAfter === "developing") {
          board.append(node("p", "Pass again on another day to master this skill."));
        }
        board.append(button("Back to lesson", lesson, "nqh-btn nqh-main"),
          button("Try again", () => start(skill, mode)), button("Back to Village", back));
        heading.focus({preventScroll: true});
      }
    }

    if (stopId) lesson();
    else path();
    return reset;
  }

  window.NoteQuestHarbor = {render, supports};
})();
