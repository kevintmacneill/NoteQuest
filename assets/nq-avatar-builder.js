/* Avatar chooser. The approved art adapter supplies the preview and choice images. */
(function () {
  'use strict';

  const fields = {
    body: 'Body', hair: 'Hair', skin: 'Skin',
    hairColor: 'Hair Color', outfit: 'Outfit', accessory: 'Accessories'
  };
  const names = {
    'boy-side': 'Side part', 'boy-buzz': 'Buzz cut', 'hc-darkbrown': 'Dark brown',
    'hc-lightbrown': 'Light brown', 'hc-platinum': 'Light blonde',
    'acc-none': 'None', 'acc-glasses': 'Round glasses', 'acc-scarf': 'Neck scarf',
    'acc-music-pin': 'Music-note pin'
  };
  const ids = (catalog, look, key) => key === 'hair' ? catalog.hair[look.body] : catalog[key];
  const name = id => names[id] || (id.startsWith('skin-') ? 'Skin tone ' + id.slice(5) :
    id.split('-').at(-1).replace(/^./, letter => letter.toUpperCase()));

  function withChoice(catalog, look, key, id) {
    const next = {...look, [key]: id};
    if (key === 'body') {
      const previousIndex = catalog.hair[look.body].indexOf(look.hair);
      const hair = catalog.hair[id];
      next.hair = hair[previousIndex] || hair[0];
    }
    return next;
  }

  function makeLook(catalog, choose, body) {
    const look = {v: catalog.v, body: body ?? choose(catalog.body)};
    for (const key of Object.keys(fields)) {
      if (key !== 'body') look[key] = choose(ids(catalog, look, key));
    }
    return look;
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
    const first = choices => choices[0];
    const sample = choices => choices[Math.floor(Math.random() * choices.length)];
    let look = initial ? {...initial} : makeLook(catalog, body ? sample : first, body);
    let paintedLook = null;
    let field = 'body';
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
    const random = button('Surprise Me', () => {
      look = makeLook(catalog, sample, body ? look.body : undefined);
      paintPreview();
      renderChoices();
    });
    const actions = create('div', '', 'nq-avatar-actions');
    actions.append(button('Back', onBack), random, done);
    const categoryButtons = Object.entries(fields).map(([key, label]) => {
      const tab = button(label, () => { field = key; renderChoices(); });
      categories.append(tab);
      return [key, tab];
    });

    carousel.append(prev, stage, next);
    controls.append(title, categories, carousel, position, choices, status);
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
        const fallback = makeLook(catalog, first, look.body);
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
      if (look[field] !== id) {
        look = withChoice(catalog, look, field, id);
        paintPreview();
      }
      renderChoices(focusId);
    }

    function step(direction, control) {
      const options = ids(catalog, look, field);
      const id = options[options.indexOf(look[field]) + direction];
      if (!id) return;
      select(id);
      if (control?.disabled) carousel.focus({preventScroll: true});
    }

    function tile(id, card) {
      const label = name(id);
      const selected = id === look[field];
      const item = button('', () => {
        const choice = field === 'accessory' && id === look[field] ? 'acc-none' : id;
        select(choice, card ? null : choice);
      }, card ? 'nq-avatar-card' : 'nqh-btn');
      item.setAttribute('aria-label', label);
      item.setAttribute('aria-pressed', String(selected));
      if (card) item.tabIndex = -1;
      const swatch = create('span', '', 'nq-avatar-swatch');
      swatch.setAttribute('aria-hidden', 'true');
      item.append(swatch);
      if (!card) item.append(create('span', label));
      const sample = withChoice(catalog, look, field, id);
      const category = field;
      Promise.resolve().then(() => art.swatch(swatch, sample, category)).catch(() => {
        if (card) swatch.textContent = label;
      });
      return item;
    }

    function renderChoices(focusId) {
      const options = ids(catalog, look, field);
      const index = options.indexOf(look[field]);
      const title = fields[field];
      carousel.setAttribute('aria-label', title + ' carousel');
      choices.setAttribute('aria-label', title);
      for (const [key, tab] of categoryButtons) tab.setAttribute('aria-pressed', String(key === field));
      position.textContent = name(look[field]) + ' · ' + (index + 1) + ' of ' + options.length + ' · Selected';
      prev.disabled = index === 0;
      next.disabled = index === options.length - 1;
      stage.replaceChildren();
      for (const id of [options[index - 1], options[index], options[index + 1]]) {
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
      if (focusedThumb) choices.querySelector('[aria-pressed="true"]')?.focus({preventScroll: true});
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
