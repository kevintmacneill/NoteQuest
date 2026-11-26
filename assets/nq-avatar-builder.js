/* Avatar chooser. The approved art adapter supplies the preview and choice images. */
(function () {
  'use strict';

  const fields = {
    body: 'Body', hair: 'Hair', skin: 'Skin tone',
    hairColor: 'Hair color', outfit: 'Outfit', accessory: 'Accessory'
  };
  const names = {
    'boy-side': 'Side part', 'boy-buzz': 'Buzz cut', 'hc-darkbrown': 'Dark brown',
    'acc-none': 'No accessory'
  };
  const ids = (catalog, look, key) => key === 'hair' ? catalog.hair[look.body] : catalog[key];
  const name = id => names[id] || (id.startsWith('skin-') ? 'Skin tone ' + id.slice(5) :
    id.split('-').at(-1).replace(/^./, letter => letter.toUpperCase()));

  function withChoice(catalog, look, key, id) {
    const next = {...look, [key]: id};
    if (key === 'body' && !catalog.hair[id].includes(next.hair)) next.hair = catalog.hair[id][0];
    return next;
  }

  function makeLook(catalog, choose) {
    const look = {v: catalog.v};
    for (const key of Object.keys(fields)) look[key] = choose(ids(catalog, look, key));
    return look;
  }

  function create(tag, label) {
    const el = document.createElement(tag);
    if (label) el.textContent = label;
    return el;
  }

  function button(label, action, className = 'nqh-btn') {
    const el = create('button', label);
    el.type = 'button';
    el.className = className;
    el.addEventListener('click', action);
    return el;
  }

  function mount(root, {catalog, art, initial, onDone, onBack}) {
    let look = initial ? {...initial} : makeLook(catalog, choices => choices[0]);
    let field = 'body';
    let revision = 0;

    const page = create('section');
    page.className = 'nq-avatar-builder';
    page.setAttribute('aria-labelledby', 'nq-avatar-title');
    const title = create('h1', 'Choose your avatar');
    title.id = 'nq-avatar-title';
    title.tabIndex = -1;
    const head = create('header');
    const preview = create('div');
    preview.className = 'nq-avatar-preview';
    preview.setAttribute('aria-hidden', 'true');
    const controls = create('div');
    controls.className = 'nq-avatar-controls';
    const categories = create('nav');
    categories.setAttribute('aria-label', 'Avatar parts');
    const choices = create('div');
    choices.setAttribute('role', 'group');
    choices.className = 'nq-avatar-choices';
    const status = create('p');
    status.setAttribute('role', 'status');
    const done = button('Done', () => {
      if (!onDone({...look})) status.textContent = 'Your avatar could not be saved. Try again.';
    }, 'nqh-btn nqh-main');
    const random = button('Surprise me', () => {
      look = makeLook(catalog, values => values[Math.floor(Math.random() * values.length)]);
      update();
    });
    const actions = create('div');
    actions.className = 'nq-avatar-actions';
    actions.append(random, done);
    const categoryButtons = Object.entries(fields).map(([key, label]) => {
      const tab = button(label, () => { field = key; update(); });
      categories.append(tab);
      return [key, tab];
    });

    head.append(button('Back', onBack), title);
    controls.append(categories, choices);
    page.append(head, preview, controls, actions, status);
    root.replaceChildren(page);

    function update(focusId) {
      const current = ++revision;
      status.textContent = '';
      done.disabled = true;
      const painted = create('div');
      preview.replaceChildren(painted);
      Promise.resolve().then(() => art.draw(painted, {...look}, 'front')).then(() => {
        if (revision === current && page.isConnected) done.disabled = false;
      }).catch(() => {
        if (revision === current && page.isConnected) status.textContent = 'The avatar picture could not load. Choose a different option or go back.';
      });

      for (const [key, tab] of categoryButtons) tab.setAttribute('aria-pressed', String(key === field));
      choices.setAttribute('aria-label', fields[field]);
      choices.replaceChildren();
      for (const id of ids(catalog, look, field)) {
        const next = withChoice(catalog, look, field, id);
        const tile = button('', () => { look = next; update(id); });
        tile.setAttribute('aria-label', name(id));
        tile.setAttribute('aria-pressed', String(look[field] === id));
        const swatch = create('span');
        swatch.setAttribute('aria-hidden', 'true');
        tile.append(swatch);
        choices.append(tile);
        Promise.resolve().then(() => art.swatch(swatch, next, field)).catch(() => {
          if (revision === current && page.isConnected) swatch.textContent = name(id);
        });
        if (focusId === id) tile.focus({preventScroll: true});
      }
    }

    update();
    title.focus({preventScroll: true});
    return () => { revision++; };
  }

  window.NoteQuestAvatarBuilder = Object.freeze({mount});
})();
