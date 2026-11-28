/* Avatar chooser. The approved art adapter supplies the preview and choice images. */
(function () {
  'use strict';

  // Owner 2026-11-27: eye color gets its own Eyes tab (engine 1.10.0).
  const allFields = {
    body: 'Body', hair: 'Hair', skin: 'Skin', eyeColor: 'Eyes',
    hairColor: 'Hair Color', outfit: 'Outfit', accessory: 'Accessories'
  };
  const names = {
    'boy-side': 'Side part', 'boy-buzz': 'Buzz cut', 'hc-darkbrown': 'Dark brown',
    'hc-lightbrown': 'Light brown', 'hc-platinum': 'Light blonde',
    'acc-none': 'None', 'acc-glasses': 'Round glasses', 'acc-scarf': 'Neck scarf',
    'acc-music-pin': 'Music-note pin', 'ec-darkbrown': 'Dark brown', 'ec-bluegreen': 'Blue-green'
  };
  const ids = (catalog, look, key) => key === 'hair' ? catalog.hair[look.body] : catalog[key];
  const name = id => names[id] || (id.startsWith('skin-') ? 'Skin tone ' + id.slice(5) :
    id.split('-').at(-1).replace(/^./, letter => letter.toUpperCase()));

  // Engine 1.9.0: more than one accessory, one per spot. `accessories` wins; an older look
  // only has `accessory` ('acc-none' = nothing).
  const worn = look => Array.isArray(look.accessories) ? look.accessories
    : (!look.accessory || look.accessory === 'acc-none' ? [] : [look.accessory]);
  const spot = (catalog, id) => catalog.accessorySlot?.[id] || id;

  function withChoice(catalog, look, key, id) {
    if (key === 'accessory') {        // tap toggles; a new one replaces its spot; None clears
      const now = worn(look);
      const chosen = id === 'acc-none' ? [] : now.includes(id) ? now.filter(x => x !== id)
        : [...now.filter(x => spot(catalog, x) !== spot(catalog, id)), id];
      const list = catalog.accessory.filter(x => chosen.includes(x));
      return {...look, accessory: list[0] || 'acc-none', accessories: list};
    }
    const next = {...look, [key]: id};
    if (key === 'body') {
      const previousIndex = catalog.hair[look.body].indexOf(look.hair);
      const hair = catalog.hair[id];
      next.hair = hair[previousIndex] || hair[0];
    }
    return next;
  }


  // Default girl = the girl in the approved Melody Harbor mockup (owner 2026-11-26): ponytail,
  // brown hair, pink hoodie outfit, round glasses and backpack. Skin and hair-color IDs follow
  // the approved repaint; the default boy follows his approved look. Until then the art adapter
  // swaps any unpainted part for a painted one.
  function defaultLook(catalog, body = catalog.body[0]) {
    if (body === 'girl') {
      const accessories = catalog.accessory.filter(id => id === 'acc-backpack' || id === 'acc-glasses');
      return {v: catalog.v, body, hair: 'girl-ponytail', skin: 'skin-2', hairColor: 'hc-brown',
        outfit: 'of-pink', accessory: accessories[0] || 'acc-none', accessories};
    }
    return {v: catalog.v, body, hair: 'boy-short', skin: 'skin-2', hairColor: 'hc-lightbrown',
      outfit: 'of-teal', accessory: 'acc-none', accessories: []};
  }
  // Brown eyes by default: the eye color painted into the approved bases.
  const withEyes = (catalog, look) => catalog.eyeColor ? {eyeColor: catalog.eyeColorBase, ...look} : look;

  // Simple UI icons for the approved Melody Harbor "Create Your Avatar" screen (tabs and
  // buttons). Decorative only: every control keeps its text name.
  const ICONS = {
    body: '<circle cx="12" cy="7.5" r="4.5"/><path d="M3.5 21c.6-5 4-7.8 8.5-7.8s7.9 2.8 8.5 7.8z"/>',
    hair: '<path d="M4 15c-1-7 3-12 8.5-12S21 7.5 20 15c-.4-3.4-2-5.6-4.6-6.6C14 10.6 10.4 12 6.6 11.6 5.4 12.6 4.6 13.7 4 15z"/>',
    eyeColor: '<path d="M12 5.2C6.6 5.2 2.7 9 1.2 12c1.5 3 5.4 6.8 10.8 6.8s9.3-3.8 10.8-6.8C21.3 9 17.4 5.2 12 5.2zm0 11.3a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"/><circle cx="12" cy="12" r="2.2"/>',
    skin: '<circle cx="8" cy="9" r="4.4"/><circle cx="16" cy="9" r="4.4" opacity=".75"/><circle cx="12" cy="16" r="4.4" opacity=".55"/>',
    hairColor: '<path d="M12 3C6.5 3 2.5 7 2.5 12c0 4.2 3 7.5 6.6 7.5 1.6 0 2-1.1 1.7-2.2-.4-1.4.4-2.6 2-2.6h2.6c3.5 0 6.1-2.2 6.1-5.6C21.5 5.9 17.4 3 12 3zM7 12.2a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2zm3-4.2a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2zm5 0a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2zm3 4a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2z"/>',
    outfit: '<path d="M8.5 3 3 6.2l2.2 4.3 2.3-1.1V21h9V9.4l2.3 1.1L21 6.2 15.5 3c-.6 1.6-1.9 2.5-3.5 2.5S9.1 4.6 8.5 3z"/>',
    accessory: '<g fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="6.8" cy="13" r="4"/><circle cx="17.2" cy="13" r="4"/><path d="M10.8 12.4c.8-.7 1.6-.7 2.4 0M2.8 12.2 1.6 9.6M21.2 12.2l1.2-2.6"/></g>',
    back: '<path d="M10.5 5 3.5 12l7 7 1.6-1.6L7.8 13.2H21v-2.4H7.8l4.3-4.2z"/>',
    dice: '<rect x="3" y="3" width="18" height="18" rx="4" fill="#fff" stroke="currentColor" stroke-width="1.8"/><circle cx="8" cy="8" r="1.6"/><circle cx="16" cy="8" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="8" cy="16" r="1.6"/><circle cx="16" cy="16" r="1.6"/>',
    check: '<path d="M9.2 16.2 4.8 11.8 3 13.6l6.2 6.2L21 8l-1.8-1.8z"/>',
    none: '<circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="m6.3 6.3 11.4 11.4" stroke="currentColor" stroke-width="2.4"/>',
  };
  function icon(name, className = 'nq-avatar-icon') {
    const span = document.createElement('span');
    span.className = className;
    span.setAttribute('aria-hidden', 'true');
    span.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" focusable="false">' + ICONS[name] + '</svg>';
    return span;
  }

  function create(tag, label, className) {
    const el = document.createElement(tag);
    if (label) el.textContent = label;
    if (className) el.className = className;
    return el;
  }

  function button(label, action, className = 'nqh-btn') {
    const el = create('button', label, className);
    el.type = 'button';
    el.addEventListener('click', action);
    return el;
  }

  function mount(root, {catalog, art, initial, body, onDone, onBack}) {
    const fields = Object.fromEntries(Object.entries(allFields).filter(([key]) => key !== 'eyeColor' || catalog.eyeColor));
    const sample = choices => choices[Math.floor(Math.random() * choices.length)];
    // The art adapter knows which choices are painted. A choice it can't paint yet is
    // "coming soon": shown greyed out, never selected. Adapters without `choose` (tests,
    // a complete manifest) treat every choice as available.
    const pick = (from, key, id) => art.choose ? art.choose(from, key, id) : withChoice(catalog, from, key, id);
    const painted = (from, key) => ids(catalog, from, key).filter(id => pick(from, key, id));
    const startLook = chosenBody => {
      const base = withEyes(catalog, defaultLook(catalog, chosenBody));
      return art.fit ? art.fit(base) || base : base;
    };
    let look = initial ? withEyes(catalog, {...initial}) : startLook(body);
    let paintedLook = null;
    let field = 'body';
    let accFocus = worn(look)[0] || 'acc-none';     // the accessory shown in the centre card
    const centreOf = key => key === 'accessory' ? accFocus : look[key];
    let revision = 0;
    let pointer = null;
    let swiped = false;

    const page = create('section', '', 'nq-avatar-builder');
    page.setAttribute('aria-labelledby', 'nq-avatar-title');
    const title = create('h1', 'Create Your Avatar');
    title.id = 'nq-avatar-title';
    title.tabIndex = -1;
    const preview = create('div', '', 'nq-avatar-preview');
    preview.setAttribute('aria-hidden', 'true');
    const controls = create('div', '', 'nq-avatar-controls');
    const categories = create('nav');
    categories.setAttribute('aria-label', 'Avatar parts');
    const carousel = create('div', '', 'nq-avatar-carousel');
    carousel.tabIndex = 0;
    carousel.setAttribute('role', 'group');
    const stage = create('div', '', 'nq-avatar-stage');
    const position = create('p', '', 'nq-avatar-position');
    position.setAttribute('role', 'status');
    const choices = create('div', '', 'nq-avatar-choices');
    choices.setAttribute('role', 'group');
    const status = create('p', '', 'nq-avatar-status');
    status.setAttribute('role', 'status');

    const prev = button('‹', () => step(-1, prev), 'nqh-btn nq-avatar-arrow');
    prev.setAttribute('aria-label', 'Previous choice');
    const next = button('›', () => step(1, next), 'nqh-btn nq-avatar-arrow');
    next.setAttribute('aria-label', 'Next choice');
    const done = button('Done', () => {
      if (!onDone({...look})) status.textContent = 'Your avatar could not be saved. Try again.';
    }, 'nqh-btn nqh-main');
    done.prepend(icon('check'));
    const random = button('Surprise Me', () => {
      let next = {...look};
      for (const key of Object.keys(fields)) {
        if (key === 'body' && body) continue;
        if (key === 'accessory') {            // a few spots, each maybe filled
          next = pick(next, key, 'acc-none') || next;
          for (const id of catalog.accessory.slice(1).sort(() => Math.random() - .5)) {
            if (Math.random() < .35 && !worn(next).some(x => spot(catalog, x) === spot(catalog, id))) {
              next = pick(next, key, id) || next;
            }
          }
          accFocus = worn(next)[0] || 'acc-none';
          continue;
        }
        const options = painted(next, key);
        if (options.length) next = pick(next, key, sample(options)) || next;
      }
      look = next;
      paintPreview();
      renderChoices();
    });
    random.prepend(icon('dice'));
    const back = button('Back', onBack);
    back.prepend(icon('back'));
    const actions = create('div', '', 'nq-avatar-actions');
    actions.append(back, random, done);
    const sign = create('div', 'NoteQuest', 'nq-avatar-sign');
    sign.setAttribute('aria-hidden', 'true');
    const categoryButtons = Object.entries(fields).map(([key, label]) => {
      const tab = button(label, () => { field = key; renderChoices(); });
      tab.prepend(icon(key));
      categories.append(tab);
      return [key, tab];
    });

    carousel.append(prev, stage, next);
    controls.append(sign, title, categories, carousel, position, choices, status);
    page.append(preview, controls, actions);
    root.replaceChildren(page);

    function paintPreview(tryDefault = true) {
      const current = ++revision;
      const selected = {...look};
      status.textContent = '';
      done.disabled = true;
      const painting = create('div', '', 'nq-avatar-painting');
      painting.classList.add('pending');
      preview.querySelector('.pending')?.remove();
      preview.append(painting);
      Promise.resolve().then(() => art.draw(painting, selected, 'front')).then(() => {
        if (revision !== current || !page.isConnected) return;
        painting.classList.remove('pending');
        preview.replaceChildren(painting);
        paintedLook = selected;
        done.disabled = false;
      }).catch(() => {
        if (revision !== current || !page.isConnected) return;
        painting.remove();
        if (paintedLook) {
          const refocus = choices.contains(document.activeElement);
          look = {...paintedLook};
          renderChoices(refocus ? look[field] : null);
          status.textContent = 'That option couldn’t load. Your last look is selected.';
          done.disabled = false;
          return;
        }
        const fallback = startLook(look.body);
        if (tryDefault && Object.keys(fields).some(key => look[key] !== fallback[key])) {
          look = fallback;
          renderChoices(choices.contains(document.activeElement) ? look[field] : null);
          paintPreview(false);
          return;
        }
        painting.classList.remove('pending');
        preview.replaceChildren(painting);
        status.textContent = 'This look did not load. Try another option or tap Back.';
        if (!painting.childElementCount) Promise.resolve().then(() => art.silhouette(painting)).catch(() => {});
      });
    }

    function select(id, focusId) {
      if (field === 'accessory') accFocus = id;
      if (field === 'accessory' || look[field] !== id) {
        const chosen = pick(look, field, id);
        if (!chosen) {
          status.textContent = name(id) + ' is coming soon. It’s still being painted!';
          renderChoices(focusId);
          return;
        }
        look = chosen;
        paintPreview();
      }
      renderChoices(focusId);
    }

    // Arrows and swipes move between painted choices only.
    function neighbor(direction) {
      const options = painted(look, field);
      return options[options.indexOf(centreOf(field)) + direction];
    }

    // Accessories: the arrows browse (tap a card to wear it); other parts select directly.
    function step(direction, control) {
      const id = neighbor(direction);
      if (!id) return;
      if (field === 'accessory') { accFocus = id; renderChoices(); }
      else select(id);
      if (control?.disabled) carousel.focus({preventScroll: true});
    }

    function tile(id, card) {
      const label = name(id);
      const accessory = field === 'accessory';
      const selected = accessory ? (id === 'acc-none' ? !worn(look).length : worn(look).includes(id)) : id === look[field];
      const sample = pick(look, field, id);
      const soon = !sample;
      const item = button('', () => select(id, card ? null : id), card ? 'nq-avatar-card' : 'nqh-btn');
      item.setAttribute('aria-label', soon ? label + ', coming soon' : label);
      item.setAttribute('aria-pressed', String(selected));
      if (soon) {
        item.classList.add('nq-avatar-soon');
        item.setAttribute('aria-disabled', 'true');
      }
      if (card) item.tabIndex = -1;
      const swatch = create('span', '', 'nq-avatar-swatch');
      swatch.setAttribute('aria-hidden', 'true');
      item.append(swatch);
      if (id === 'acc-none') swatch.append(icon('none', 'nq-avatar-none'));
      if (!card) item.append(create('span', label));
      if (soon) item.append(create('span', 'Coming soon', 'nq-avatar-soon-label'));
      const category = field;
      const shown = accessory ? {...look, accessory: id, accessories: [id]} : sample || withChoice(catalog, look, field, id);
      if (id !== 'acc-none') Promise.resolve().then(() => art.swatch(swatch, shown, category)).catch(() => {
        if (card && !soon) swatch.textContent = label;
      });
      return item;
    }

    function renderChoices(focusId) {
      const options = ids(catalog, look, field);
      const ready = painted(look, field);
      const centre = centreOf(field);
      const index = options.indexOf(centre);
      const place = ready.indexOf(centre);
      const soon = options.length - ready.length;
      const title = fields[field];
      carousel.setAttribute('aria-label', title + ' carousel');
      choices.setAttribute('aria-label', title);
      for (const [key, tab] of categoryButtons) tab.setAttribute('aria-pressed', String(key === field));
      const state = field !== 'accessory' ? 'Selected'
        : centre === 'acc-none' ? (worn(look).length ? 'Tap to take all off' : 'Selected')
        : worn(look).includes(centre) ? 'Wearing' : 'Tap to wear';
      position.textContent = soon ? name(centre) + ' · ' + state + ' · ' + soon + ' more coming soon'
        : name(centre) + ' · ' + (index + 1) + ' of ' + options.length + ' · ' + state;
      prev.disabled = !neighbor(-1);
      next.disabled = !neighbor(1);
      stage.replaceChildren();
      for (const id of [ready[place - 1], centre, ready[place + 1]]) {
        stage.append(id ? tile(id, true) : create('span', '', 'nq-avatar-card-empty'));
      }
      choices.replaceChildren();
      for (const id of options) {
        const thumb = tile(id, false);
        choices.append(thumb);
        if (focusId === id) thumb.focus({preventScroll: true});
      }
      const current = choices.children[index];
      if (current) choices.scrollLeft = current.offsetLeft - (choices.clientWidth - current.offsetWidth) / 2;
    }

    function onArrow(event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      const focusedThumb = choices.contains(document.activeElement);
      step(direction);
      if (focusedThumb) (field === 'accessory' ? choices.children[ids(catalog, look, field).indexOf(accFocus)]
        : choices.querySelector('[aria-pressed="true"]'))?.focus({preventScroll: true});
    }
    carousel.addEventListener('keydown', onArrow);
    choices.addEventListener('keydown', onArrow);
    stage.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      swiped = false;
      pointer = {id: event.pointerId, x: event.clientX, y: event.clientY};
    });
    stage.addEventListener('pointerup', event => {
      if (pointer?.id !== event.pointerId) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      pointer = null;
      if (Math.abs(dx) < 35 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
      swiped = true;
      step(dx < 0 ? 1 : -1);
    });
    stage.addEventListener('pointercancel', () => { pointer = null; });
    stage.addEventListener('click', event => {
      if (!swiped) return;
      swiped = false;
      event.stopPropagation();
      event.preventDefault();
    }, true);

    renderChoices();
    paintPreview();
    title.focus({preventScroll: true});
    return () => { revision++; };
  }

  window.NoteQuestAvatarBuilder = Object.freeze({mount});
})();
