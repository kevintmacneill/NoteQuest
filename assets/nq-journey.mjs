import {createMilestoneDragonImage} from "./characters/milestone-dragon/index.mjs";
import {graduationCueFromEngine} from "./characters/milestone-dragon/milestone-cues.mjs";

const PARTS = {
  navigation: ["🧭", "Find the Notes", "Recognize piano keys and listen for high and low notes."],
  timing: ["🥁", "Keep the Beat", "Tap and hold to follow a steady beat."],
  performance: ["🎹", "Play Your Song", "Show a grown-up how you sit and hold your hands at the piano."]
};

const HARBOR_V32_PARTS = {
  navigation: ["🧭", "Find the Notes", "Find groups of black keys and tell high, low, short, and long sounds apart."],
  timing: PARTS.timing,
  performance: ["🎹", "Play for a Grown-up", "Ask a grown-up to watch as you get comfortable at the piano and show what you can play."]
};

function render(root, go, worldId, engine, practice = () => go("games"), {placement = false} = {}) {
  const {node, button, supports, showQuestion} = window.NoteQuestActivity;
  const api = engine.journey;
  const parts = worldId === "NQ-00" && engine.learn.curriculum().id === "3.2" ? HARBOR_V32_PARTS : PARTS;
  const profileId = engine.profiles.current()?.id;
  const region = node("section", "", "nqh-shell nqh-journey");
  root.append(region);
  let attemptId;
  let clearQuestion;
  let graduation;

  const stopListening = engine.on("journey:unlocked", event => {
    if (event.worldId === worldId) {
      graduation = graduationCueFromEngine(engine, event, profileId);
    }
  });

  function reset() {
    clearQuestion?.();
    clearQuestion = undefined;
    if (attemptId) api.cancel(attemptId);
    attemptId = undefined;
  }

  function panel(title) {
    reset();
    region.replaceChildren();
    const main = node("div", "", "nqh-journey-panel");
    const heading = node("h2", title);
    heading.tabIndex = -1;
    main.append(heading);
    region.append(main);
    heading.focus({preventScroll: true});
    return main;
  }

  function village() { go("menu"); }

  function home(message) {
    const main = panel(placement ? "Show what you know" : "Ready for the Journey?");
    region.prepend(createMilestoneDragonImage({className: "nqh-journey-dragon"}));
    const requirements = api.requirements(worldId);
    const status = api.status(worldId);
    if (message) {
      const notice = node("p", message, "nqh-alert");
      notice.setAttribute("role", "status");
      main.append(notice);
    }
    if (!requirements.ok || !status.ok || !status.required) {
      main.append(node("p", "This challenge is coming soon."));
    } else if (status.unlocked && status.to) {
      const next = engine.learn.levels().find(level => level.id === status.to);
      if (next) {
        main.append(node("p", graduation ? "You finished all three challenges!" : "Your challenges are complete.", "nqh-success"),
          button("Visit " + next.title, () => go("nqwWorld", next.id), "nqh-btn nqh-main"));
      }
    } else {
      main.append(node("p", "Get " + requirements.pass + " of " + requirements.items +
        " right on your first try in each challenge to open the next world."));
      if (requirements.early && !placement) {
        main.append(node("p", "If you pass all three early, you will move past your remaining lessons.",
          "nqh-alert"));
      }
      const list = node("div", "", "nqh-readiness-grid");
      const playable = [];
      for (const part of requirements.parts) {
        const row = node("article", "", "nqh-stop nqh-readiness-card");
        const [emoji, title, text] = parts[part.id] || ["🎵", "Music challenge", ""];
        const icon = node("span", emoji, "nqh-readiness-icon");
        icon.setAttribute("aria-hidden", "true");
        const ready = part.skills.every(id => supports(engine.learn.skill(id)));
        row.append(icon, node("h3", title), node("p", text),
          node("p", status.parts[part.id]?.passed ? "Passed" : ready ? "Ready to try" : "Coming soon", "nqh-state"));
        if (ready && !status.parts[part.id]?.passed) {
          playable.push(part.id);
          row.append(button("Start " + title, () => begin(part.id)));
        }
        list.append(row);
      }
      main.append(list);
      if (playable.length) main.append(button("Begin Challenge", () => begin(playable[0]), "nqh-btn nqh-main"));
    }
    if (placement) main.append(button("Back to placement", () => go("placement")));
    else main.append(button("Practice First", practice));
    main.append(button("Back to Village", village));
  }

  function begin(partId) {
    const result = api.start(worldId, partId);
    if (!result.ok) {
      home("That challenge is unavailable right now. Choose another or practice first.");
      return;
    }
    const main = panel(parts[partId]?.[1] || "Music challenge");
    attemptId = result.attemptId;
    const board = node("div", "", "nqh-board");
    main.append(button("Leave challenge", () => home("Challenge ended. Your passed challenges are saved.")), board);
    draw(result.question);

    function draw(question, feedback) {
      clearQuestion?.();
      clearQuestion = undefined;
      function unavailable() {
        reset();
        board.replaceChildren(node("p", "This activity is coming soon. This challenge was ended without a result.", "nqh-alert"));
      }
      if (!question) { unavailable(); return; }
      const count = node("h3", "Question " + (question.index + 1) + " of " + question.total, "nqh-count");
      count.tabIndex = -1;
      const message = node("p", feedback, "nqh-feedback");
      message.setAttribute("role", "status");
      const box = node("div", "", "nqh-question");
      board.replaceChildren(count, message, box);
      clearQuestion = showQuestion(box, question, (value, meta) => respond(value, question.grownUp, meta), unavailable, {
        requireObserver: question.grownUp,
        decline: () => home("Challenge ended. Come back when a grown-up can watch you.")
      });
      if (count.isConnected) count.focus({preventScroll: true});
    }

    function respond(value, grownUp, meta) {
      if (!attemptId || engine.profiles.current()?.id !== profileId) {
        reset();
        return;
      }
      const reply = grownUp ? api.confirm(attemptId, {by: "caregiver", yes: value})
        : api.answer(attemptId, value, meta?.source === "mic" ? {source: "mic"} : undefined);
      if (!reply.ok) {
        home("That answer did not go through. Start a new challenge to try again.");
        return;
      }
      if (!reply.done) {
        draw(reply.next, reply.correct ? "Good work!" : "Keep going.");
        return;
      }
      const {passed, correct, total, practice: missedSkills} = reply.result;
      const result = panel(passed ? "Challenge passed" : "Practice and try again");
      result.append(node("p", correct + " of " + total + " correct on the first try."));
      const missed = missedSkills.map(id => engine.learn.skill(id)?.title?.child).filter(Boolean);
      if (!passed && missed.length) result.append(node("p", "Try practicing " + missed.join(", ") + "."));
      if (graduation) {
        region.prepend(createMilestoneDragonImage({className: "nqh-journey-dragon"}));
        result.append(node("p", "Your next destination is ready.", "nqh-success"));
      }
      result.append(button(placement ? "Back to placement" : "Back to travel preparation",
        () => placement ? go("placement") : home(), "nqh-btn nqh-main"),
        button("Back to Village", village));
    }
  }

  home();
  return () => { reset(); stopListening(); };
}

window.NoteQuestReadiness = {render};
