// The catalog is progressive enhancement: every recipe is usable without JS.
// Capture HTML before the optional motion runtime adds its transient state.
(() => {
  'use strict';
  const recipes = Array.from(document.querySelectorAll('[data-recipe]'));
  const search = document.getElementById('library-search');
  const filters = Array.from(document.querySelectorAll('[data-library-category]'));
  const count = document.getElementById('library-count');
  const empty = document.getElementById('library-empty');
  const status = document.getElementById('library-status');
  const toolbar = document.getElementById('library-tools');
  const sources = new Map();
  const copyTimers = new WeakMap();
  let category = 'all';

  recipes.forEach((recipe) => {
    const source = recipe.querySelector('.library-preview').innerHTML.trim();
    sources.set(recipe.id, source);
    const code = recipe.querySelector('code');
    if (code) code.textContent = source;
  });

  function update() {
    const terms = search.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    let visible = 0;
    recipes.forEach((recipe) => {
      const haystack = `${recipe.dataset.search} ${recipe.querySelector('.library-recipe-head').textContent}`.toLocaleLowerCase();
      const matches = (category === 'all' || recipe.dataset.category === category) && terms.every((term) => haystack.includes(term));
      recipe.hidden = !matches;
      if (matches) visible += 1;
    });
    count.textContent = `${visible} ${visible === 1 ? 'recipe' : 'recipes'}${category === 'all' ? '' : ` · ${category}`}`;
    empty.hidden = visible !== 0;
    filters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.libraryCategory === category)));
  }

  filters.forEach((button) => button.addEventListener('click', () => {
    category = button.dataset.libraryCategory;
    update();
  }));
  search.addEventListener('input', update);
  document.getElementById('library-reset').addEventListener('click', () => {
    search.value = '';
    category = 'all';
    update();
    search.focus();
  });

  async function copy(source, button, label) {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(source);
      status.textContent = `${label} copied. Paste it into a page that loads sc.css.`;
      const original = button.dataset.copyLabel || button.textContent;
      button.dataset.copyLabel = original;
      window.clearTimeout(copyTimers.get(button));
      button.textContent = 'Copied';
      copyTimers.set(button, window.setTimeout(() => { button.textContent = original; }, 1800));
    } catch (_) {
      const recipe = button.closest('[data-recipe]');
      const details = recipe && recipe.querySelector('details');
      if (details) details.open = true;
      const code = recipe ? recipe.querySelector('code') : document.getElementById('library-setup-source');
      if (code && window.getSelection) {
        const range = document.createRange();
        range.selectNodeContents(code);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        code.closest('pre').focus();
      }
      status.textContent = `Clipboard access is unavailable. ${label} is selected; use your browser’s Copy command.`;
    }
  }

  document.querySelectorAll('[data-library-copy]').forEach((button) => button.addEventListener('click', () => {
    const recipe = button.closest('[data-recipe]');
    copy(sources.get(recipe.id), button, recipe.querySelector('h3').textContent);
  }));
  const setup = document.getElementById('library-copy-setup');
  setup.addEventListener('click', () => copy(document.getElementById('library-setup-source').textContent, setup, 'Page setup'));

  // Keep the catalog count honest if recipes are added in a later release.
  document.getElementById('library-total').textContent = String(recipes.length).padStart(2, '0');
  toolbar.hidden = false;
  document.documentElement.classList.add('library-ready');
  update();
})();
