(function () {
  'use strict';
  const root = document.documentElement;
  const $ = (id) => document.getElementById(id);
  const tok = (name) => getComputedStyle(root).getPropertyValue('--sc-' + name).trim();
  const el = (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    for (const k in attrs || {}) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'style') n.setAttribute('style', attrs[k]);
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    for (const kid of kids) if (kid !== null && kid !== undefined && kid !== false) n.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
    return n;
  };
  const svg = (tag, attrs, ...kids) => {
    const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const k in attrs || {}) n.setAttribute(k, attrs[k]);
    for (const kid of kids) if (kid) n.appendChild(kid);
    return n;
  };

  // ---- color math (WCAG) ----
  const toRgb = (h) => { const m = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(m.substr(i, 2), 16) / 255); };
  const lin = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lum = (h) => { const [r, g, b] = toRgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const contrast = (a, b) => { const l1 = lum(a), l2 = lum(b); const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]; return (hi + 0.05) / (lo + 0.05); };
  const inkFor = (h) => lum(h) > 0.35 ? '#111F31' : '#F4F7FB';
  const isHex = (v) => /^#[0-9a-f]{6}$/i.test(v);

  // ---- cover bar ----
  function renderCover() {
    const host = $('cover-bar'); host.textContent = '';
    const steps = ['cobalt-300', 'cobalt-400', 'cobalt-500', 'cobalt-600', 'cobalt-700', 'cobalt-800', 'cobalt-950', 'spice-400', 'spice-600'];
    for (const s of steps) { const v = tok(s); host.appendChild(el('div', { style: `background:${v}` }, el('span', { style: `color:${inkFor(v)}` }, s.replace('cobalt-', 'C').replace('spice-', 'S')))); }
  }

  // ---- primitive ramps ----
  function renderRamps() {
    const host = $('ramps'); host.textContent = '';
    const ramps = [
      ['Cobalt — structure', ['cobalt-50', 'cobalt-100', 'cobalt-200', 'cobalt-300', 'cobalt-400', 'cobalt-500', 'cobalt-600', 'cobalt-700', 'cobalt-800', 'cobalt-900', 'cobalt-950']],
      ['Spice — heat', ['spice-300', 'spice-400', 'spice-500', 'spice-600', 'spice-700', 'spice-800']],
      ['Night — dark surfaces', ['night-950', 'night-900', 'night-850', 'night-800', 'night-700', 'night-600']],
      ['Gray — light surfaces', ['gray-50', 'gray-100', 'gray-200', 'gray-300', 'gray-400', 'gray-500', 'gray-600', 'gray-800']],
      ['Status — current mode', ['good', 'warn', 'danger', 'info', 'good-fill', 'warn-fill', 'danger-fill', 'info-fill']],
    ];
    for (const [label, names] of ramps) {
      host.appendChild(el('div', { class: 'sg-ramp__label' }, label));
      const row = el('div', { class: 'sg-ramp' });
      for (const n of names) { const v = tok(n); row.appendChild(el('div', { style: `background:${v}`, title: `--sc-${n}: ${v}` }, el('b', { style: `color:${inkFor(v)}` }, n.replace(/^(cobalt|spice|night|gray)-/, '')), el('span', { style: `color:${inkFor(v)};opacity:.85` }, v.toUpperCase()))); }
      host.appendChild(row);
    }
  }

  // ---- semantic roles with live contrast ----
  const ROLES = [
    ['bg', 'Page background', 'surface'], ['surface', 'Cards, tables, inputs', 'surface'], ['raised', 'Code, chips, nested surfaces', 'surface'], ['hover', 'Row and control hover', 'surface'],
    ['border', 'Hairlines', 'line'], ['border-strong', 'Input borders, strong rules', 'line'],
    ['ink', 'Masthead, footer, tooltips, covers (both modes)', 'surface'], ['on-ink', 'Text on ink', 'text-on-ink'], ['on-ink-2', 'Labels on ink', 'text-on-ink'],
    ['heading', 'Headings', 'text'], ['text', 'Body', 'text'], ['text-2', 'Muted', 'text'], ['text-3', 'Faint — labels only', 'text'],
    ['brand', 'Eyebrows, labels, brand text', 'text'], ['brand-strong', 'Data emphasis, icons', 'text'], ['brand-fill', 'Tinted fills', 'surface'], ['brand-line', 'Left borders, table headers', 'line'],
    ['accent', 'Links, primary button, focus', 'text'], ['accent-hover', 'Link hover', 'text'], ['accent-fill', 'Spice callout fill', 'surface'], ['on-accent', 'Text on a spice button', 'text-on-accent'],
    ['good', 'Positive state', 'text'], ['warn', 'Caution state', 'text'], ['danger', 'Stop state', 'text'], ['info', 'Informational state', 'text'],
  ];
  function badge(cr) {
    const cls = cr >= 7 ? 'aaa' : cr >= 4.5 ? 'aa' : cr >= 3 ? 'lg' : 'na';
    const txt = cr >= 7 ? 'AAA' : cr >= 4.5 ? 'AA' : cr >= 3 ? 'AA large' : 'below 3';
    return el('span', { class: 'sg-cr sg-cr--' + cls }, `${cr.toFixed(1)}:1 ${txt}`);
  }
  function renderRoles() {
    const t = $('roles'); t.textContent = '';
    t.appendChild(el('thead', null, el('tr', null, el('th', null, 'Token'), el('th', null, 'Value'), el('th', null, 'Use'), el('th', null, 'vs page'), el('th', null, 'vs card'))));
    const body = el('tbody');
    const bg = tok('bg'), surface = tok('surface'), ink = tok('ink'), accent = tok('accent');
    for (const [name, use, kind] of ROLES) {
      const v = tok(name);
      const cells = [el('td', null, '--sc-' + name), el('td', null, el('span', { class: 'sg-sw', style: `background:${v}` }), el('span', { class: 'sc-mono', style: 'font-size:12px' }, v.toUpperCase())), el('td', { class: 'sc-muted', style: 'font-size:13px' }, use)];
      if (!isHex(v)) { cells.push(el('td', null, '—'), el('td', null, '—')); }
      else if (kind === 'text') { cells.push(el('td', null, badge(contrast(v, bg))), el('td', null, badge(contrast(v, surface)))); }
      else if (kind === 'text-on-ink') { const c = contrast(v, ink); cells.push(el('td', { colspan: 2 }, badge(c), el('span', { class: 'sc-muted', style: 'font-size:11px;margin-left:8px' }, 'on --sc-ink'))); }
      else if (kind === 'text-on-accent') { const c = contrast(v, accent); cells.push(el('td', { colspan: 2 }, badge(c), el('span', { class: 'sc-muted', style: 'font-size:11px;margin-left:8px' }, 'on --sc-accent'))); }
      else if (kind === 'line') { cells.push(el('td', null, el('span', { class: 'sg-cr sg-cr--na' }, contrast(v, bg).toFixed(1) + ':1')), el('td', null, el('span', { class: 'sg-cr sg-cr--na' }, contrast(v, surface).toFixed(1) + ':1'))); }
      else { cells.push(el('td', { colspan: 2, class: 'sc-muted', style: 'font-size:12px' }, 'surface')); }
      body.appendChild(el('tr', null, ...cells));
    }
    t.appendChild(body);
  }

  // ---- chart palettes ----
  function strip(names, label, hint) {
    const wrap = el('div', { style: 'margin-bottom:14px' });
    wrap.appendChild(el('div', { class: 'sg-ramp__label', style: 'margin-top:0' }, label));
    const row = el('div', { class: 'sg-ramp', style: 'grid-auto-columns:minmax(0,96px)' });
    for (const n of names) { const v = tok(n); row.appendChild(el('div', { style: `background:${v};height:44px`, title: `--sc-${n}: ${v}` }, el('b', { style: `color:${inkFor(v)}` }, n.replace('chart-', '')), el('span', { style: `color:${inkFor(v)};opacity:.85` }, v.toUpperCase()))); }
    wrap.appendChild(row);
    if (hint) wrap.appendChild(el('p', { class: 'sg-rule', style: 'margin-top:6px' }, hint));
    return wrap;
  }
  function renderPalettes() {
    const host = $('chart-palettes'); host.textContent = '';
    host.appendChild(strip(['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'chart-other'], 'Categorical — fixed order, never cycled', 'Bars and lines may use all five with a legend. Scatter, bubble and maps use 1–3 only. A sixth series folds into Other.'));
    host.appendChild(strip(['chart-seq-1', 'chart-seq-2', 'chart-seq-3', 'chart-seq-4', 'chart-seq-5'], 'Sequential — one hue, light → dark', 'Magnitude. Heatmaps, choropleths, ordered tiers.'));
    host.appendChild(strip(['chart-emphasis', 'chart-context', 'chart-grid'], 'Emphasis pair + grid', 'The usual right answer: one series in cobalt, the rest in gray. Gridlines are solid hairlines in chart-grid.'));
  }

  // ---- demo line chart ----
  const DAYS = ['Aug 12', 'Aug 13', 'Aug 14', 'Aug 15', 'Aug 16', 'Aug 17', 'Aug 18', 'Aug 19', 'Aug 20', 'Aug 21', 'Aug 22', 'Aug 23'];
  const LOW = [38900, 38900, 38400, 38400, 37900, 37868, 37868, 37200, 37200, 36900, 36646, 36646];
  const MED = [46400, 46550, 46500, 46700, 46620, 46548, 46600, 46652, 46500, 46480, 46652, 46653];
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
  function renderLine() {
    const host = $('demo-line'); host.textContent = '';
    const W = Math.max(300, host.clientWidth || 480), H = 220, m = { t: 14, r: 70, b: 30, l: 48 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const lo = 36000, hi = 48000, ticks = [36000, 40000, 44000, 48000];
    const x = (i) => m.l + i / (DAYS.length - 1) * iw, y = (v) => m.t + (hi - v) / (hi - lo) * ih;
    const C = { e: tok('chart-emphasis'), c: tok('chart-context'), grid: tok('chart-grid'), muted: tok('text-2'), ink: tok('heading'), surface: tok('surface') };
    const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img' });
    for (const t of ticks) { s.appendChild(svg('line', { x1: m.l, x2: W - m.r, y1: y(t), y2: y(t), stroke: C.grid })); s.appendChild(svg('text', { x: m.l - 8, y: y(t) + 4, 'text-anchor': 'end', 'font-family': 'IBM Plex Mono, monospace', 'font-size': 10.5, fill: C.muted }, document.createTextNode('$' + t / 1000 + 'K'))); }
    DAYS.forEach((d, i) => { if (i % 3 && i !== DAYS.length - 1) return; s.appendChild(svg('text', { x: x(i), y: H - m.b + 18, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono, monospace', 'font-size': 10.5, fill: C.muted }, document.createTextNode(d))); });
    const path = (arr, color) => s.appendChild(svg('path', { d: arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' '), fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    path(MED, C.c); path(LOW, C.e);
    const dots = [];
    [[MED, C.c], [LOW, C.e]].forEach(([arr, color]) => arr.forEach((v, i) => dots.push(s.appendChild(svg('circle', { cx: x(i), cy: y(v), r: 4, fill: color, stroke: C.surface, 'stroke-width': 2, 'data-i': i })))));
    s.appendChild(svg('text', { x: x(DAYS.length - 1) + 10, y: y(LOW[LOW.length - 1]) + 4, 'font-family': 'Instrument Sans, sans-serif', 'font-size': 12, 'font-weight': 700, fill: C.ink }, document.createTextNode(money(LOW[LOW.length - 1]))));
    s.appendChild(svg('text', { x: x(DAYS.length - 1) + 10, y: y(MED[MED.length - 1]) + 4, 'font-family': 'Instrument Sans, sans-serif', 'font-size': 12, 'font-weight': 500, fill: C.ink }, document.createTextNode(money(MED[MED.length - 1]))));
    const cross = s.appendChild(svg('line', { x1: 0, x2: 0, y1: m.t, y2: H - m.b, stroke: C.c, 'stroke-width': 1, opacity: 0 }));
    const hit = s.appendChild(svg('rect', { x: m.l - 10, y: 0, width: iw + 20, height: H, fill: 'transparent', style: 'cursor:crosshair' }));
    host.appendChild(s);
    const tip = host.appendChild(el('div', { class: 'sc-tooltip', role: 'status' }));
    let active = -1;
    const set = (i) => {
      if (i < 0) { active = -1; cross.setAttribute('opacity', 0); tip.classList.remove('is-on'); dots.forEach((d) => d.setAttribute('r', 4)); return; }
      active = i; cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('opacity', 1);
      dots.forEach((d) => d.setAttribute('r', +d.getAttribute('data-i') === i ? 5.5 : 4));
      tip.textContent = '';
      tip.appendChild(el('div', { class: 'sc-tooltip__date' }, DAYS[i] + ', 2026'));
      tip.appendChild(el('div', { class: 'sc-tooltip__row' }, el('i', { style: `background:${C.e}` }), el('b', null, money(LOW[i])), el('span', null, 'lowest landed')));
      tip.appendChild(el('div', { class: 'sc-tooltip__row' }, el('i', { style: `background:${C.c}` }), el('b', null, money(MED[i])), el('span', null, 'median landed')));
      tip.classList.add('is-on');
      const scale = host.clientWidth / W, px = x(i) * scale, flip = px > host.clientWidth * 0.6;
      tip.style.left = flip ? 'auto' : (px + 12) + 'px'; tip.style.right = flip ? (host.clientWidth - px + 12) + 'px' : 'auto'; tip.style.top = '4px';
    };
    hit.addEventListener('pointermove', (e) => { const r = s.getBoundingClientRect(); const vx = (e.clientX - r.left) / r.width * W; let best = 0, bd = 1e9; DAYS.forEach((_, i) => { const d = Math.abs(x(i) - vx); if (d < bd) { bd = d; best = i; } }); set(best); });
    hit.addEventListener('pointerleave', () => set(-1));
    host.onkeydown = (e) => { if (e.key === 'ArrowRight') { set(active < 0 ? DAYS.length - 1 : Math.min(DAYS.length - 1, active + 1)); e.preventDefault(); } else if (e.key === 'ArrowLeft') { set(active < 0 ? DAYS.length - 1 : Math.max(0, active - 1)); e.preventDefault(); } else if (e.key === 'Escape') set(-1); };
    host.onblur = () => set(-1);
  }

  // ---- demo stacked bars ----
  const MARKETS = ['California', 'Texas', 'Florida', 'Illinois', 'Other'];
  const WEEKS = [['Wk 31', [18, 9, 8, 6, 22]], ['Wk 32', [21, 10, 9, 7, 24]], ['Wk 33', [22, 11, 8, 8, 26]], ['Wk 34', [24, 10, 9, 8, 28]]];
  function renderBars() {
    const host = $('demo-bar'); host.textContent = '';
    const lg = $('demo-bar-legend'); lg.textContent = '';
    const cols = [1, 2, 3, 4].map((i) => tok('chart-' + i)).concat([tok('chart-other')]);
    MARKETS.forEach((mk, i) => lg.appendChild(el('span', null, el('i', { class: 'is-swatch', style: `background:${cols[i]}` }), mk)));
    const W = Math.max(300, host.clientWidth || 480), rowH = 38, H = WEEKS.length * rowH + 34, m = { l: 54, r: 44, t: 6 };
    const iw = W - m.l - m.r, max = 100, bar = 22, gap = 2;
    const C = { grid: tok('chart-grid'), muted: tok('text-2'), ink: tok('heading'), surface: tok('surface') };
    const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img' });
    [0, 25, 50, 75, 100].forEach((t) => { const gx = m.l + t / max * iw; s.appendChild(svg('line', { x1: gx, x2: gx, y1: m.t, y2: H - 28, stroke: C.grid })); s.appendChild(svg('text', { x: gx, y: H - 10, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono, monospace', 'font-size': 10.5, fill: C.muted }, document.createTextNode(String(t)))); });
    WEEKS.forEach(([label, vals], r) => {
      const y = m.t + r * rowH + (rowH - bar) / 2;
      s.appendChild(svg('text', { x: m.l - 10, y: y + bar / 2 + 4, 'text-anchor': 'end', 'font-family': 'IBM Plex Mono, monospace', 'font-size': 11, fill: C.muted }, document.createTextNode(label)));
      let acc = 0; const total = vals.reduce((a, b) => a + b, 0);
      vals.forEach((v, i) => {
        const x0 = m.l + acc / max * iw, w = Math.max(0, v / max * iw - gap); const last = i === vals.length - 1;
        const d = last ? `M${x0},${y} h${Math.max(0, w - 4)} a4,4 0 0 1 4,4 v${bar - 8} a4,4 0 0 1 -4,4 h${-Math.max(0, w - 4)} z` : `M${x0},${y} h${w} v${bar} h${-w} z`;
        const seg = svg('path', { d, fill: cols[i] }); seg.appendChild(svg('title', null, document.createTextNode(`${label} · ${MARKETS[i]}: ${v}`))); s.appendChild(seg);
        acc += v;
      });
      s.appendChild(svg('text', { x: m.l + total / max * iw + 8, y: y + bar / 2 + 4, 'font-family': 'Instrument Sans, sans-serif', 'font-size': 12, 'font-weight': 700, fill: C.ink }, document.createTextNode(String(total))));
    });
    host.appendChild(s);
  }

  // ---- theme state line + nav ----
  function renderThemeState() {
    const t = root.getAttribute('data-theme'); const os = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    $('theme-state').textContent = t ? `Pinned to ${t}; the OS prefers ${os}.` : `Following the OS (${os}). Pick Dark or Light to pin it.`;
  }
  function nav() {
    const links = [...document.querySelectorAll('#sg-nav a')];
    const secs = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id)); });
    }, { rootMargin: '-10% 0px -80% 0px' });
    secs.forEach((s) => io.observe(s));
  }

  function renderAll() { renderCover(); renderRamps(); renderRoles(); renderPalettes(); renderLine(); renderBars(); renderThemeState(); }
  renderAll(); nav();
  new MutationObserver(() => setTimeout(renderAll, 0)).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => setTimeout(renderAll, 0));
  let raf = null; window.addEventListener('resize', () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { renderLine(); renderBars(); }); });
})();
