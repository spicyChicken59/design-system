(function () {
  'use strict';
  const root = document.documentElement;
  const $ = (id) => document.getElementById(id);
  const tok = (name) => getComputedStyle(root).getPropertyValue('--sc-' + name).trim();
  const el = (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    for (const k in attrs || {}) {
      if (k === 'class') { if (attrs[k]) n.className = attrs[k]; }
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
    for (const kid of kids) if (kid) n.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
    return n;
  };

  // ---- color math (WCAG) ----
  const toRgb = (h) => { const m = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(m.substr(i, 2), 16) / 255); };
  const lin = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lum = (h) => { const [r, g, b] = toRgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const contrast = (a, b) => { const l1 = lum(a), l2 = lum(b); const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]; return (hi + 0.05) / (lo + 0.05); };
  const isHex = (v) => /^#[0-9a-f]{6}$/i.test(v);
  // Alpha tokens (on-ink-3, the ink hairlines) are composited over the surface they sit on before measuring.
  const flatten = (v, over) => {
    if (isHex(v)) return v;
    const m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/i.exec(v);
    if (!m || !isHex(over)) return null;
    const a = m[4] === undefined ? 1 : +m[4], ov = toRgb(over).map((ch) => ch * 255);
    return '#' + [m[1], m[2], m[3]].map((ch, i) => Math.round(+ch * a + ov[i] * (1 - a)).toString(16).padStart(2, '0')).join('');
  };
  // Swatch label ink: whichever of the two system inks contrasts more with the swatch.
  const inkFor = (h) => { const ink = tok('ink'), on = tok('on-ink'); if (!isHex(h)) return on; return contrast(h, ink) >= contrast(h, on) ? ink : on; };

  // ---- cover bar ----
  function renderCover() {
    const host = $('cover-bar'); host.textContent = '';
    const steps = ['cobalt-300', 'cobalt-400', 'cobalt-500', 'cobalt-600', 'cobalt-700', 'cobalt-800', 'cobalt-950', 'spice-400', 'spice-700'];
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
  // kind: text (4.5:1 vs page and card) · text-on (4.5:1 vs the named token) · ui (3:1 vs page and card)
  //       ui-on (3:1 vs the named token) · line (ratio only) · surface (no check)
  const ROLES = [
    ['bg', 'Page background', 'surface'], ['surface', 'Cards, tables, inputs', 'surface'], ['raised', 'Code, chips, nested surfaces', 'surface'], ['hover', 'Row and control hover', 'surface'],
    ['border', 'Hairlines', 'line'], ['border-strong', 'Strong rules, kbd, tooltip edge', 'line'], ['border-control', 'Input and select edges', 'ui-on', 'surface'],
    ['ink', 'Masthead, footer, tooltips, covers (both modes)', 'surface'], ['on-ink', 'Text on ink', 'text-on', 'ink'], ['on-ink-2', 'Labels on ink', 'text-on', 'ink'], ['on-ink-3', 'Footer text on ink', 'text-on', 'ink'],
    ['heading', 'Headings', 'text'], ['text', 'Body', 'text'], ['text-2', 'Muted', 'text'], ['text-3', 'Faint — placeholders, codes', 'text'],
    ['brand', 'Eyebrows, labels, brand text', 'text'], ['brand-strong', 'Data emphasis, icons', 'text'], ['brand-fill', 'Tinted fills', 'surface'], ['brand-line', 'Left borders, table headers', 'line'],
    ['accent', 'Links, primary button', 'text'], ['accent', 'Spice chip and callout label', 'text-on', 'accent-fill'], ['accent-hover', 'Link hover', 'text'], ['accent-fill', 'Spice callout fill', 'surface'], ['on-accent', 'Text on a spice button', 'text-on', 'accent'],
    ['focus', 'Focus ring', 'ui'],
    ['good', 'Positive state', 'text'], ['good', 'Good chip text', 'text-on', 'good-fill'],
    ['warn', 'Caution state', 'text'], ['warn', 'Warn chip text', 'text-on', 'warn-fill'],
    ['danger', 'Stop state', 'text'], ['danger', 'Warning callout label', 'text-on', 'danger-fill'],
    ['info', 'Informational state', 'text'], ['info', 'Info chip text', 'text-on', 'info-fill'],
    ['chart-1', 'Series 1 (cobalt)', 'ui-on', 'surface'], ['chart-2', 'Series 2 (spice)', 'ui-on', 'surface'], ['chart-3', 'Series 3 (teal)', 'ui-on', 'surface'], ['chart-4', 'Series 4 (violet)', 'ui-on', 'surface'], ['chart-5', 'Series 5 (pink)', 'ui-on', 'surface'],
  ];
  function badge(cr, ui) {
    if (ui) {
      const ok = cr >= 3;
      return el('span', { class: 'sg-cr ' + (ok ? 'sg-cr--aa' : 'sg-cr--fail') }, `${cr.toFixed(1)}:1 ${ok ? 'AA ui' : 'below 3'}`);
    }
    const cls = cr >= 7 ? 'aaa' : cr >= 4.5 ? 'aa' : cr >= 3 ? 'lg' : 'fail';
    const txt = cr >= 7 ? 'AAA' : cr >= 4.5 ? 'AA' : cr >= 3 ? 'AA large' : 'below 3';
    return el('span', { class: 'sg-cr sg-cr--' + cls }, `${cr.toFixed(1)}:1 ${txt}`);
  }
  function renderRoles() {
    const t = $('roles'); t.textContent = '';
    t.appendChild(el('thead', null, el('tr', null, el('th', { scope: 'col' }, 'Token'), el('th', { scope: 'col' }, 'Value'), el('th', { scope: 'col' }, 'Use'), el('th', { scope: 'col' }, 'vs page'), el('th', { scope: 'col' }, 'vs card'))));
    const body = el('tbody');
    const bg = tok('bg'), surface = tok('surface');
    for (const [name, use, kind, against] of ROLES) {
      const v = tok(name);
      const cells = [el('td', null, '--sc-' + name), el('td', null, el('span', { class: 'sg-sw', style: `background:${v}` }), el('span', { class: 'sc-mono', style: 'font-size:12px' }, v.toUpperCase())), el('td', { class: 'sc-muted', style: 'font-size:13px' }, use)];
      const other = against ? tok(against) : null;
      const vv = against ? flatten(v, other) : v;
      if (!isHex(vv) || (against && !isHex(other))) { cells.push(el('td', { colspan: 2, class: 'sc-muted', style: 'font-size:12px' }, 'alpha — not measured')); }
      else if (kind === 'text') { cells.push(el('td', null, badge(contrast(v, bg))), el('td', null, badge(contrast(v, surface)))); }
      else if (kind === 'ui') { cells.push(el('td', null, badge(contrast(v, bg), true)), el('td', null, badge(contrast(v, surface), true))); }
      else if (kind === 'text-on' || kind === 'ui-on') { cells.push(el('td', { colspan: 2 }, badge(contrast(vv, other), kind === 'ui-on'), el('span', { class: 'sc-note' }, 'on --sc-' + against + (vv !== v ? ' (composited)' : '')))); }
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
    host.appendChild(strip(['chart-seq-1', 'chart-seq-2', 'chart-seq-3', 'chart-seq-4', 'chart-seq-5'], 'Sequential — one hue, light → dark', 'Magnitude. Heatmaps, choropleths, ordered tiers — filled cells with a 2px surface gap, never lines.'));
    host.appendChild(strip(['chart-emphasis', 'chart-context', 'chart-grid'], 'Emphasis pair + grid', 'The usual right answer: one series in cobalt, the rest in gray. Gridlines are solid hairlines in chart-grid.'));
  }

  // ---- shared chart pieces ----
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
  // The table twin: built once from the same data the SVG draws from.
  function twin(hostId, caption, head, rows) {
    const host = $(hostId); host.textContent = '';
    const table = el('table', { class: 'sc-table sc-table--compact' });
    table.appendChild(el('caption', { class: 'sc-sr-only' }, caption));
    table.appendChild(el('thead', null, el('tr', null, ...head.map((h, i) => el('th', { scope: 'col', class: i ? 'sc-num' : '' }, h)))));
    table.appendChild(el('tbody', null, ...rows.map((r) => el('tr', null, ...r.map((c, i) => el('td', { class: i ? 'sc-num' : '' }, String(c)))))));
    host.appendChild(el('details', { class: 'sc-details', style: 'margin-top:10px' }, el('summary', null, 'Table view'), el('div', { class: 'sc-table-scroll', style: 'margin-top:8px' }, table)));
  }
  // Tooltip placement inside a .sc-chart host: px is the anchor in host pixels; flips past 60% width.
  function placeTip(host, tip, px, top) {
    const flip = px > host.clientWidth * 0.6;
    tip.style.left = flip ? 'auto' : (px + 12) + 'px'; tip.style.right = flip ? (host.clientWidth - px + 12) + 'px' : 'auto';
    const maxTop = host.clientHeight - tip.offsetHeight - 4;   // never past the host's bottom edge
    tip.style.top = Math.max(0, Math.min(top, maxTop)) + 'px';
  }

  // ---- demo line chart ----
  const DAYS = ['Aug 12', 'Aug 13', 'Aug 14', 'Aug 15', 'Aug 16', 'Aug 17', 'Aug 18', 'Aug 19', 'Aug 20', 'Aug 21', 'Aug 22', 'Aug 23'];
  const LOW = [38900, 38900, 38400, 38400, 37900, 37868, 37868, 37200, 37200, 36900, 36646, 36646];
  const MED = [46400, 46550, 46500, 46700, 46620, 46548, 46600, 46652, 46500, 46480, 46652, 46653];
  function renderLine() {
    const host = $('demo-line'); host.textContent = '';
    const W = Math.max(300, host.clientWidth || 480), H = 220, m = { t: 14, r: 70, b: 30, l: 48 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const lo = 36000, hi = 48000, ticks = [36000, 40000, 44000, 48000];
    const x = (i) => m.l + i / (DAYS.length - 1) * iw, y = (v) => m.t + (hi - v) / (hi - lo) * ih;
    const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, 'aria-hidden': 'true' });
    for (const t of ticks) { s.appendChild(svg('line', { class: 'sc-chart__grid', x1: m.l, x2: W - m.r, y1: y(t), y2: y(t) })); s.appendChild(svg('text', { x: m.l - 8, y: y(t) + 4, 'text-anchor': 'end' }, '$' + t / 1000 + 'K')); }
    const step = W < 480 ? 4 : 3;   // label every 3rd day, every 4th on phones, always the last
    DAYS.forEach((d, i) => { if (i % step && i !== DAYS.length - 1) return; s.appendChild(svg('text', { x: x(i), y: H - m.b + 18, 'text-anchor': 'middle' }, d)); });
    const path = (arr, mod) => s.appendChild(svg('path', { class: 'sc-chart__series sc-chart__series--' + mod, d: arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ') }));
    path(MED, 'context'); path(LOW, 'emphasis');
    const dots = [];
    [[MED, 'context'], [LOW, 'emphasis']].forEach(([arr, tone]) => arr.forEach((v, i) => dots.push(s.appendChild(svg('circle', { class: 'sc-chart__marker', cx: x(i), cy: y(v), r: 4, style: `fill:var(--sc-chart-${tone})`, 'data-i': i })))));
    s.appendChild(svg('text', { class: 'sc-chart__label', x: x(DAYS.length - 1) + 10, y: y(LOW[LOW.length - 1]) + 4 }, money(LOW[LOW.length - 1])));
    s.appendChild(svg('text', { class: 'sc-chart__label', x: x(DAYS.length - 1) + 10, y: y(MED[MED.length - 1]) + 4, style: 'font-weight:500' }, money(MED[MED.length - 1])));
    const cross = s.appendChild(svg('line', { class: 'sc-chart__crosshair', x1: 0, x2: 0, y1: m.t, y2: H - m.b, 'stroke-width': 1, opacity: 0 }));
    const hit = s.appendChild(svg('rect', { x: m.l - 10, y: 0, width: iw + 20, height: H, fill: 'transparent', style: 'cursor:crosshair' }));
    host.appendChild(s);
    const tip = host.appendChild(el('div', { class: 'sc-tooltip', role: 'status' }));
    let active = -1;
    const set = (i) => {
      if (i < 0) { active = -1; cross.setAttribute('opacity', 0); tip.classList.remove('is-on'); tip.textContent = ''; dots.forEach((d) => d.setAttribute('r', 4)); return; }
      active = i; cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('opacity', 1);
      dots.forEach((d) => d.setAttribute('r', +d.getAttribute('data-i') === i ? 5.5 : 4));
      tip.classList.add('is-on');
      tip.textContent = '';
      tip.appendChild(el('div', { class: 'sc-tooltip__date' }, DAYS[i] + ', 2026'));
      tip.appendChild(el('div', { class: 'sc-tooltip__row' }, el('i', { style: 'background:var(--sc-chart-emphasis)' }), el('b', null, money(LOW[i])), el('span', null, 'lowest landed')));
      tip.appendChild(el('div', { class: 'sc-tooltip__row' }, el('i', { style: 'background:var(--sc-chart-context)' }), el('b', null, money(MED[i])), el('span', null, 'median landed')));
      placeTip(host, tip, x(i) * host.clientWidth / W, 4);
    };
    hit.addEventListener('pointermove', (e) => { const r = s.getBoundingClientRect(); const vx = (e.clientX - r.left) / r.width * W; let best = 0, bd = 1e9; DAYS.forEach((_, i) => { const d = Math.abs(x(i) - vx); if (d < bd) { bd = d; best = i; } }); set(best); });
    hit.addEventListener('pointerleave', () => set(-1));
    host.onkeydown = (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { set(active < 0 ? DAYS.length - 1 : Math.min(DAYS.length - 1, active + 1)); e.preventDefault(); } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { set(active < 0 ? DAYS.length - 1 : Math.max(0, active - 1)); e.preventDefault(); } else if (e.key === 'Escape') set(-1); };
    host.onblur = () => set(-1);
  }

  // ---- demo stacked bars ----
  const MARKETS = ['California', 'Texas', 'Florida', 'Illinois', 'Other'];
  const WEEKS = [['Wk 31', [18, 9, 8, 6, 22]], ['Wk 32', [21, 10, 9, 7, 24]], ['Wk 33', [22, 11, 8, 8, 26]], ['Wk 34', [24, 10, 9, 8, 28]]];
  const SLOTS = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-other'];
  function renderBars() {
    const host = $('demo-bar'); host.textContent = '';
    const lg = $('demo-bar-legend'); lg.textContent = '';
    MARKETS.forEach((mk, i) => lg.appendChild(el('span', null, el('i', { class: 'is-swatch', style: `background:var(--sc-${SLOTS[i]})` }), mk)));
    const W = Math.max(300, host.clientWidth || 480), rowH = 38, H = WEEKS.length * rowH + 34, m = { l: 54, r: 44, t: 6 };
    const iw = W - m.l - m.r, max = 100, bar = 22, gap = 2;
    const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, 'aria-hidden': 'true' });
    [0, 25, 50, 75, 100].forEach((t) => { const gx = m.l + t / max * iw; s.appendChild(svg('line', { class: 'sc-chart__grid', x1: gx, x2: gx, y1: m.t, y2: H - 28 })); s.appendChild(svg('text', { x: gx, y: H - 10, 'text-anchor': 'middle' }, String(t))); });
    const rows = [];
    WEEKS.forEach(([label, vals], r) => {
      const y = m.t + r * rowH + (rowH - bar) / 2;
      s.appendChild(svg('text', { x: m.l - 10, y: y + bar / 2 + 4, 'text-anchor': 'end', 'font-size': 11 }, label));
      let acc = 0; const total = vals.reduce((a, b) => a + b, 0);
      vals.forEach((v, i) => {
        const x0 = m.l + acc / max * iw, w = Math.max(0, v / max * iw - gap); const last = i === vals.length - 1;
        const d = last ? `M${x0},${y} h${Math.max(0, w - 4)} a4,4 0 0 1 4,4 v${bar - 8} a4,4 0 0 1 -4,4 h${-Math.max(0, w - 4)} z` : `M${x0},${y} h${w} v${bar} h${-w} z`;
        s.appendChild(svg('path', { d, style: `fill:var(--sc-${SLOTS[i]})` }));
        acc += v;
      });
      s.appendChild(svg('text', { class: 'sc-chart__label', x: m.l + total / max * iw + 8, y: y + bar / 2 + 4 }, String(total)));
      rows.push({ y, end: m.l + total / max * iw, total });
    });
    // Row focus ring (drawn in the crosshair tone) and a transparent hit strip per row.
    const ring = s.appendChild(svg('rect', { class: 'sc-chart__crosshair', x: m.l - 3, y: 0, width: iw + 6, height: bar + 6, rx: 4, fill: 'none', 'stroke-width': 1, opacity: 0 }));
    host.appendChild(s);
    const tip = host.appendChild(el('div', { class: 'sc-tooltip', role: 'status' }));
    let active = -1;
    const set = (r) => {
      if (r < 0) { active = -1; ring.setAttribute('opacity', 0); tip.classList.remove('is-on'); tip.textContent = ''; return; }
      active = r; const row = rows[r]; const [label, vals] = WEEKS[r];
      ring.setAttribute('y', row.y - 3); ring.setAttribute('opacity', 1);
      tip.classList.add('is-on');
      tip.textContent = '';
      tip.appendChild(el('div', { class: 'sc-tooltip__date' }, label + ' · listings by state'));
      vals.forEach((v, i) => tip.appendChild(el('div', { class: 'sc-tooltip__row' }, el('i', { style: `background:var(--sc-${SLOTS[i]})` }), el('b', null, String(v)), el('span', null, MARKETS[i].toLowerCase()))));
      tip.appendChild(el('div', { class: 'sc-tooltip__meta' }, row.total + ' listings'));
      const scale = host.clientWidth / W;
      placeTip(host, tip, Math.min(row.end, W * 0.55) * scale, Math.max(0, row.y * scale - 8));
    };
    WEEKS.forEach((_, r) => { const hit = s.appendChild(svg('rect', { x: m.l - 10, y: m.t + r * rowH, width: iw + 20 + m.r, height: rowH, fill: 'transparent' })); hit.addEventListener('pointerenter', () => set(r)); });
    s.addEventListener('pointerleave', () => set(-1));
    host.onkeydown = (e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { set(active < 0 ? 0 : Math.min(WEEKS.length - 1, active + 1)); e.preventDefault(); } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { set(active < 0 ? WEEKS.length - 1 : Math.max(0, active - 1)); e.preventDefault(); } else if (e.key === 'Escape') set(-1); };
    host.onblur = () => set(-1);
  }
  function renderTwins() {
    twin('demo-line-twin', 'Lowest and median landed price by day', ['Day', 'Lowest landed', 'Median landed'], DAYS.map((d, i) => [d, money(LOW[i]), money(MED[i])]));
    twin('demo-bar-twin', 'Listings by state per week', ['Week', ...MARKETS, 'Total'], WEEKS.map(([w, v]) => [w, ...v, v.reduce((a, b) => a + b, 0)]));
  }

  // ---- theme state line + nav ----
  function renderThemeState() {
    const t = root.getAttribute('data-theme'); const os = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    $('theme-state').textContent = t ? `Pinned to ${t}; the OS prefers ${os}.` : `Following the OS (${os}). Pick Dark or Light to pin it.`;
  }
  // Active section = the last one whose top has passed the 20% line; at the very bottom, the last section.
  function nav() {
    const links = [...document.querySelectorAll('#sg-nav a')];
    const pairs = links.map((a) => [a, document.querySelector(a.getAttribute('href'))]).filter(([, s]) => s);
    if (!pairs.length) return;
    let raf = null;
    const update = () => {
      raf = null;
      const line = innerHeight * 0.2;
      let cur = pairs[0][0];
      for (const [a, s] of pairs) if (s.getBoundingClientRect().top <= line) cur = a;
      if (scrollY + innerHeight >= root.scrollHeight - 2) cur = pairs[pairs.length - 1][0];
      links.forEach((a) => a.classList.toggle('is-active', a === cur));
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    update();
  }

  function renderAll() { renderCover(); renderRamps(); renderRoles(); renderPalettes(); renderLine(); renderBars(); renderThemeState(); }
  renderAll(); renderTwins(); nav();
  new MutationObserver(() => setTimeout(renderAll, 0)).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => setTimeout(renderAll, 0));
  let raf = null; window.addEventListener('resize', () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { renderLine(); renderBars(); }); });
})();
