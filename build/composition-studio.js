// Curated page compositions: plain HTML in, portable plain HTML out.
(() => {
  'use strict';
  const $ = (id) => document.getElementById(`composer-${id}`);
  const form = $('form'), frame = $('frame'), source = $('source');
  const code = source?.matches('code') ? source : source?.querySelector('code');
  const status = $('status'), outline = $('outline');
  const copyButton = $('copy'), downloadButton = $('download');
  const layout = $('layout'), surface = $('surface'), art = $('art');
  const motion = $('motion'), title = $('title'), width = $('width');
  if (![form, frame, code, status, outline, copyButton, downloadButton,
    layout, surface, art, motion, title, width].every(Boolean)) return;

  const root = new URL('.', document.baseURI);
  const layouts = new Set(['landing', 'dashboard', 'screener', 'report', 'deliverable']);
  const surfaces = new Set(['ink', 'wine', 'paper']);
  const arts = new Set(['none', 'orbit', 'ledger']);
  const widths = new Set(['320', '390', '768', '1120']);
  const runtime = new Set(['sc.css', 'sc-theme.js', 'sc-motion.js', 'sc-reading.js']);
  const cache = new Map();
  let generation = 0, output = '', currentLayout = '', copyNotice = 0, previewURL = '';

  function available(value) {
    copyButton.disabled = !value;
    downloadButton.disabled = !value;
  }
  function serialize(doc) { return `<!doctype html>\n${doc.documentElement.outerHTML}\n`; }
  function setWidth() {
    if (widths.has(width.value)) frame.style.width = `${width.value}px`;
  }
  function stripMotion(doc) {
    doc.querySelectorAll('*').forEach((node) => {
      Array.from(node.classList).forEach((name) => {
        if (/^sc-(?:reveal|stagger|chick-arrive|rule-reveal|hover-lift|press|motion-in)$/.test(name)) node.classList.remove(name);
      });
      Array.from(node.attributes).forEach(({ name }) => {
        if (name.startsWith('data-sc-motion')) node.removeAttribute(name);
      });
      node.style?.removeProperty('--sc-motion-order');
    });
    doc.querySelectorAll('script[src]').forEach((node) => {
      if (new URL(node.getAttribute('src'), root).pathname.endsWith('/sc-motion.js')) node.remove();
    });
  }
  function portableRefs(doc, templateURL) {
    doc.querySelectorAll('[src], [href]').forEach((node) => {
      for (const attr of ['src', 'href']) {
        const value = node.getAttribute(attr);
        if (!value || value.startsWith('#') || /^(?:mailto:|tel:|data:)/i.test(value)) continue;
        const url = new URL(value, templateURL);
        const name = url.pathname.split('/').pop();
        const relative = url.href.startsWith(root.href) ? url.href.slice(root.href.length) : '';
        if (url.origin === root.origin && runtime.has(name)) {
          node.setAttribute(attr, `design-system/${name}`);
        } else if (relative.startsWith('assets/')) {
          node.setAttribute(attr, `design-system/${relative}`);
        } else {
          // Specimen/reference links remain valid after the HTML is downloaded.
          node.setAttribute(attr, url.href);
        }
      }
    });
    doc.querySelectorAll('base').forEach((node) => node.remove());
  }
  function previewHTML(exportHTML) {
    const doc = new DOMParser().parseFromString(exportHTML, 'text/html');
    doc.querySelectorAll('[src], [href]').forEach((node) => {
      for (const attr of ['src', 'href']) {
        const value = node.getAttribute(attr);
        if (value?.startsWith('design-system/')) node.setAttribute(attr, new URL(value.slice(14), root).href);
      }
    });
    return serialize(doc);
  }
  async function template(name) {
    if (cache.has(name)) return cache.get(name);
    const url = new URL(`templates/${name}.html`, root);
    const response = await fetch(url, { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Template unavailable');
    const text = await response.text();
    cache.set(name, text);
    return text;
  }
  async function generate() {
    const ticket = ++generation;
    const chosen = { layout: layout.value, surface: surface.value, art: art.value,
      motion: motion.checked, title: title.value.trim() };
    available(false); output = ''; code.textContent = ''; outline.replaceChildren();
    status.textContent = 'Preparing your composition…';
    frame.setAttribute('aria-busy', 'true');
    try {
      if (!layouts.has(chosen.layout) || !surfaces.has(chosen.surface) || !arts.has(chosen.art)) throw new Error('Unknown preset');
      const text = await template(chosen.layout);
      if (ticket !== generation) return;
      const doc = new DOMParser().parseFromString(text, 'text/html');
      const cover = doc.querySelector('.sc-cover'), heading = doc.querySelector('h1');
      const stage = cover?.querySelector('.sc-cover__art'), mark = stage?.querySelector('img');
      if (!cover || !heading || !stage || !mark) throw new Error('Incomplete template');
      if (Array.from(doc.querySelectorAll('[class]')).some((node) => Array.from(node.classList).some((name) => name.startsWith('example-')))
        || doc.querySelector('[src*="build/"], [href*="build/"]')) throw new Error('Template requires studio-only assets');
      cover.classList.remove('sc-cover--wine', 'sc-cover--paper', 'sc-on-ink');
      if (chosen.surface !== 'ink') cover.classList.add(`sc-cover--${chosen.surface}`);
      if (chosen.surface !== 'paper') cover.classList.add('sc-on-ink');
      const markForm = chosen.surface === 'paper' ? 'color-light' : chosen.surface === 'wine' ? 'mono-cream' : 'color-dark';
      mark.setAttribute('src', `../assets/sc-mark-${markForm}.svg`);
      stage.classList.remove('sc-brand-stage', 'sc-brand-stage--orbit', 'sc-brand-stage--ledger');
      if (chosen.art !== 'none') stage.classList.add('sc-brand-stage', `sc-brand-stage--${chosen.art}`);
      if (chosen.title) heading.textContent = chosen.title;
      doc.title = `${heading.textContent.trim()} · SpicyChicken design specimen`;
      stripMotion(doc);
      if (chosen.motion) {
        stage.classList.add('sc-reveal'); stage.setAttribute('data-sc-motion', 'fade');
        const script = doc.createElement('script'); script.src = '../sc-motion.js'; script.defer = true;
        doc.body.append(script);
      }
      if (!doc.querySelector('nav')) doc.querySelectorAll('script[src]').forEach((node) => {
        if (node.getAttribute('src').endsWith('/sc-reading.js')) node.remove();
      });
      portableRefs(doc, new URL(`templates/${chosen.layout}.html`, root));
      output = serialize(doc); currentLayout = chosen.layout;
      code.textContent = output;
      doc.querySelectorAll('h2').forEach((node) => {
        const item = document.createElement('li'); item.textContent = node.textContent.trim(); outline.append(item);
      });
      const previousPreview = previewURL;
      previewURL = URL.createObjectURL(new Blob([previewHTML(output)], { type: 'text/html;charset=utf-8' }));
      frame.removeAttribute('srcdoc');
      frame.src = previewURL; setWidth();
      if (previousPreview) URL.revokeObjectURL(previousPreview);
      frame.title = `${chosen.layout} composition preview`;
      available(true);
      status.textContent = 'Composition ready. Copy or download the complete HTML, then replace the illustrative content.';
    } catch (_) {
      if (ticket !== generation) return;
      output = ''; code.textContent = ''; outline.replaceChildren();
      frame.removeAttribute('srcdoc'); frame.removeAttribute('src');
      if (previewURL) URL.revokeObjectURL(previewURL);
      previewURL = '';
      status.textContent = 'This composition could not be prepared. Choose a preset to try again; export is unavailable until it is ready.';
    } finally {
      if (ticket === generation) frame.removeAttribute('aria-busy');
    }
  }
  function selectSource() {
    code.closest('details')?.setAttribute('open', '');
    const pre = code.closest('pre'); pre?.setAttribute('tabindex', '0'); pre?.focus();
    const range = document.createRange(); range.selectNodeContents(code);
    const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range);
    status.textContent = 'Clipboard access is unavailable. The complete HTML is selected; use your browser’s Copy command.';
  }
  copyButton.addEventListener('click', async () => {
    if (!output) return;
    const ticket = generation, html = output;
    try {
      if (!window.isSecureContext || !navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(html);
      if (ticket !== generation) return;
      status.textContent = 'Complete HTML copied. Keep its design-system folder beside the page.';
      window.clearTimeout(copyNotice); copyButton.textContent = 'Copied';
      copyNotice = window.setTimeout(() => { copyButton.textContent = 'Copy complete page'; }, 1800);
    } catch (_) { if (ticket === generation && output) selectSource(); }
  });
  downloadButton.addEventListener('click', () => {
    if (!output) return;
    const url = URL.createObjectURL(new Blob([output], { type: 'text/html;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url;
    link.download = `spicychicken-${currentLayout}.html`; document.body.append(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    status.textContent = 'HTML download started. Keep its design-system folder beside the page.';
  });
  form.addEventListener('submit', (event) => { event.preventDefault(); generate(); });
  form.addEventListener('change', (event) => { if (event.target !== width && event.target !== title) generate(); });
  title.addEventListener('input', generate);
  width.addEventListener('change', setWidth);
  $('tools')?.removeAttribute('hidden');
  generate();
})();
