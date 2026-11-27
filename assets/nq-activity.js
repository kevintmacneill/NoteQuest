/* Shared lesson and readiness controls, adapted from the interaction patterns in PR #32. */
(function () {
  "use strict";
  const TYPES = new Set(["symbol", "highLow", "contour", "loudSoft", "caregiver", "teacher", "self", "rhythmTap", "keyGroup", "keyboardSide", "durationCompare"]);
  const KEY_PICTURES = {
    "key-black": ["dark", "Short raised piano key"],
    "key-white": ["light", "Long flat piano key"]
  };
  const Audio = window.AudioContext || window.webkitAudioContext;
  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function button(label, action, className = "nqh-btn") {
    const control = node("button", label, className);
    control.type = "button";
    control.addEventListener("click", action);
    return control;
  }

  function keyPicture(id) {
    const [color, description] = KEY_PICTURES[id];
    const picture = node("div", "", "nqh-key-sample nqh-key-sample-" + color);
    picture.setAttribute("role", "img");
    picture.setAttribute("aria-label", description);
    return picture;
  }

  function supports(skill) {
    const content = skill?.content;
    if (!content || skill.playable === false || !TYPES.has(content.type)) return false;
    if (content.type === "symbol") {
      return Array.isArray(content.items) && content.items.length > 0 &&
        content.items.every(({show}) => Object.hasOwn(KEY_PICTURES, show));
    }
    if (content.type === "rhythmTap") return !!window.NoteQuestRhythm;
    if (["highLow", "contour", "loudSoft", "durationCompare"].includes(content.type)) return !!Audio;
    return true;
  }

  function soundPlayer() {
    let context;
    return {
      async play(notes) {
        try {
          context ??= new Audio();
          const audio = context;
          if (audio.state === "suspended") await audio.resume();
          if (audio !== context || audio.state !== "running") return false;
          const start = audio.currentTime + .03;
          for (const {midi, delay = 0, volume = .15, seconds = .45} of notes) {
            const at = start + delay;
            const tone = audio.createOscillator();
            const gain = audio.createGain();
            tone.frequency.value = 440 * 2 ** ((midi - 69) / 12);
            gain.gain.setValueAtTime(.001, at);
            gain.gain.exponentialRampToValueAtTime(volume, at + Math.min(.025, seconds / 4));
            gain.gain.setValueAtTime(volume, at + seconds - Math.min(.04, seconds / 4));
            gain.gain.exponentialRampToValueAtTime(.001, at + seconds);
            tone.connect(gain).connect(audio.destination);
            tone.onended = () => { tone.disconnect(); gain.disconnect(); };
            tone.start(at);
            tone.stop(at + seconds + .01);
          }
          return true;
        } catch {
          return false;
        }
      },
      stop() {
        if (!context) return;
        context.close().catch(() => {});
        context = null;
      }
    };
  }

  function grownUpHold(submit) {
    const label = "Grown-up: I observed this";
    const control = button(label, () => {}, "nqh-btn nqh-main nqh-grownup-hold");
    control.setAttribute("aria-label", label + " (hold for three seconds)");
    let timer;
    function clear() {
      clearTimeout(timer);
      timer = undefined;
      control.textContent = label;
    }
    function start(event) {
      if (event.type === "keydown" && !["Enter", "Space"].includes(event.code)) return;
      if (event.type === "pointerdown" && event.button !== 0) return;
      if (event.repeat || timer !== undefined) return;
      control.textContent = "Keep holding for 3 seconds…";
      timer = setTimeout(() => {
        clear();
        if (control.isConnected && !document.hidden) submit(true);
      }, 3000);
    }
    control.addEventListener("pointerdown", start);
    control.addEventListener("keydown", start);
    for (const event of ["pointerup", "pointerleave", "pointercancel", "keyup", "blur"]) {
      control.addEventListener(event, clear);
    }
    return control;
  }

  // Returns cleanup for audio and the rhythm timer. Unsupported questions have no submit path.
  function showQuestion(box, question, submit, unavailable, { requireObserver = false, decline } = {}) {
    let cleanup;
    /* Response time for the engine's effort cool-down (and later Tier 3 fluency): from the end of the prompt to the answer.
       A listening question's prompt ends when its sound finishes; replaying restarts the clock. */
    let promptEnd = performance.now();
    const reportAnswer = submit;
    submit = (value, meta) => reportAnswer(value, Object.assign({ms: Math.max(0, Math.round(performance.now() - promptEnd))}, meta || {}));
    function prompt(text) { box.append(node("h3", text)); }
    function choice(label, value) {
      const control = button(label, () => submit(value), "nqh-btn nqh-choice");
      box.append(control);
      return control;
    }
    function listen(text, notes, choices) {
      if (!Audio) { unavailable(); return; }
      prompt(text);
      const sound = soundPlayer();
      cleanup = sound.stop;
      const feedback = node("p", "", "nqh-feedback");
      feedback.setAttribute("role", "status");
      const listenButton = button("▶ Listen", async () => {
        listenButton.disabled = true;
        sound.stop();
        const played = await sound.play(notes);
        if (!box.isConnected) return;
        promptEnd = performance.now();
        answerButtons.forEach(control => { control.disabled = !played; });
        feedback.textContent = played ? "" : "Sound is unavailable. Try listening again or go back.";
        listenButton.disabled = false;
      }, "nqh-btn nqh-listen");
      box.append(listenButton, feedback);
      const answerButtons = choices.map(([label, value]) => choice(label, value));
      answerButtons.forEach(control => { control.disabled = true; });
    }

    const pair = [
      {midi: question.a}, {midi: question.b, delay: .68}
    ];
    switch (question.type) {
      case "symbol":
        if (!Object.hasOwn(KEY_PICTURES, question.show) ||
            !Array.isArray(question.choices) || !question.choices.length) { unavailable(); break; }
        prompt("Which kind of piano key is pictured?");
        box.append(keyPicture(question.show));
        question.choices.forEach(value => choice(value === "black" ? "Black key" : "White key", value));
        break;
      case "keyGroup": {
        if (![2, 3].includes(question.group)) { unavailable(); break; }
        prompt("Tap a black key in a group of " + question.group + ".");
        const keyboard = node("div", "", "nqh-mini-keyboard");
        keyboard.setAttribute("role", "group");
        keyboard.setAttribute("aria-label", "One octave with five black keys");
        for (const [index, name, midi, gap] of [
          [1, "C sharp", 61, 1], [2, "D sharp", 63, 2], [3, "F sharp", 66, 4],
          [4, "G sharp", 68, 5], [5, "A sharp", 70, 6]
        ]) {
          const key = button("", () => submit(midi), "nqh-mini-black-key");
          key.setAttribute("aria-label", "Black key " + index + " from the left (" + name + ")");
          key.style.left = "calc(" + gap + " * 100% / 7)";
          keyboard.append(key);
        }
        box.append(keyboard);
        break;
      }
      case "keyboardSide":
        if (!["low", "high"].includes(question.ask)) { unavailable(); break; }
        prompt("Which side of the piano has the " + question.ask + " sounds?");
        choice("← Left side", "left");
        choice("Right side →", "right");
        break;
      case "durationCompare": {
        const a = question.a?.seconds, b = question.b?.seconds;
        if (![a, b].every(n => Number.isFinite(n) && n > 0) || a === b ||
            !Number.isFinite(question.midi) || !["longer", "shorter"].includes(question.ask)) {
          unavailable(); break;
        }
        listen("Which sound is " + question.ask + "?", [
          {midi: question.midi, seconds: a},
          {midi: question.midi, seconds: b, delay: a + .3}
        ], [["First sound", "a"], ["Second sound", "b"]]);
        break;
      }
      case "highLow":
        listen("Which sound is higher?", pair, [["First sound", "a"], ["Second sound", "b"]]);
        break;
      case "contour":
        listen("Which way do the notes move?", pair, [["↑ Up", "up"], ["↓ Down", "down"], ["→ Same", "same"]]);
        break;
      case "loudSoft":
        listen("Is the sound loud or soft?", [{midi: question.midi, volume: question.volume}],
          [["Soft", "soft"], ["Loud", "loud"]]);
        break;
      case "self":
      case "teacher":
      case "caregiver": {
        prompt(question.prompt || "Show this skill on your piano");
        const list = node("ul", "", "nqh-checklist");
        (question.checklist || []).forEach(item => list.append(node("li", item)));
        box.append(list);
        if (question.type !== "self" || requireObserver) {
          box.append(node("p", "Ask a grown-up to watch and hold the confirmation button for three seconds."),
            grownUpHold(submit));
        } else {
          choice("I tried this on my piano", true);
        }
        if (decline) box.append(button("Not ready yet", decline));
        else choice("Not ready yet", false);
        break;
      }
      case "rhythmTap":
        if (window.NoteQuestRhythm) cleanup = window.NoteQuestRhythm.mount(box, question, submit);
        else unavailable();
        break;
      default:
        unavailable();
    }
    return cleanup;
  }

  window.NoteQuestActivity = {supports, showQuestion, node, button, soundPlayer, keyPicture};
})();
