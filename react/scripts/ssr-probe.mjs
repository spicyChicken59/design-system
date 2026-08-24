// SSR proof for the v2.1 wrappers: renders a few components with react-dom/server
// and prints the markup. Run from react/: node scripts/ssr-probe.mjs
import * as React from 'react';
import { renderToStaticMarkup as r } from 'react-dom/server';
import {
  Row, Tabs, Table, Media, Frame, Figure, Note, QuietLink, ThemeToggle, Button, Tooltip, Footer,
  Checkbox, Delta, Notice, Watermark, Masthead, Brand, Spark, Chart, Empty, Chip, Callout, Input,
  THEME_BOOT_SCRIPT,
} from '../dist/index.mjs';

const h = React.createElement;
const out = {};
out.tabs = r(h(Tabs, { label: 'Model', value: 'i5', items: [{ id: 'i5', label: 'BMW i5', keepCase: true }, { id: 'all', label: 'all models' }] }));
out.tableSort = r(h(Table, {
  caption: 'Fleet utilisation by depot',
  columns: [{ key: 'depot', header: 'depot', sortable: true }, { key: 'util', header: 'utilisation', numeric: true, sortable: true, sort: 'descending' }],
  rows: [{ id: 'mcr', depot: 'Manchester', util: '82%' }],
  onSort: () => {},
}));
out.rowEnd = r(h(Row, { end: h(Button, { size: 'sm' }, 'Open') }, h('span', null, 'Manchester'), h(Chip, { tone: 'good' }, 'on target')));
out.mediaCard = r(h(Media, {
  card: true,
  frame: h(Frame, { alt: '' }),
  title: '2024 Vivaro-e', sub: 'Moonstone grey', code: 'VN24 KLX',
  aside: h(React.Fragment, null, h(Figure, null, '£28,950'), h(Note, null, '£30,150 landed')),
  foot: h(React.Fragment, null, h('span', null, '12,400 mi'), h('span', null, '41d listed')),
  links: h(QuietLink, { href: '#l', target: '_blank' }, 'Listing ↗'),
}));
out.mediaRow = r(h(Media, { frame: h(Frame, { src: 'x.jpg', alt: 'Van' }), title: 'T', code: 'VIN', links: h(QuietLink, { href: '#l' }, 'Listing ↗') }));
out.toggle = r(h(ThemeToggle, null));
out.tooltipClosed = r(h(Tooltip, { open: false, rows: [{ color: 'red', label: 'L', value: 'V' }] }));
out.btnAnchorBlank = r(h(Button, { href: 'https://e.com', target: '_blank' }, 'x'));
out.btnAnchorDisabled = r(h(Button, { href: 'https://e.com', disabled: true }, 'x'));
out.btnDisabled = r(h(Button, { variant: 'primary', disabled: true }, 'x'));
out.footerEmpty = r(h(Footer, null));
out.footerBoth = r(h(Footer, { source: 'S' }, 'CHILD'));
out.checkbox = r(h(Checkbox, { label: 'L', className: 'c', style: { margin: 1 }, id: 'x' }));
out.delta = r(h(Delta, { tone: 'good', arrow: 'up' }, '3% vs last week'));
out.notice = r(h(Notice, { label: 'l' }, 'body'));
out.noticeLive = r(h(Notice, { label: 'l', live: true }, 'body'));
out.watermark = r(h(Watermark, null));
out.mastheadSkip = r(h(Masthead, { skipTo: '#main', brand: h(Brand, { name: 'Fleet', sub: 'x' }) }));
out.spark = r(h(Spark, { values: [1, 3, 2, 4], emphasis: true, inTile: true }));
out.chart = r(h(Chart, { label: 'Utilisation by week' }, h('svg', { 'aria-hidden': 'true' })));
out.emptyRow = r(h('table', null, h('tbody', null, h(Empty, { as: 'row', colSpan: 3 }, 'none'))));
out.chipCase = r(h(Chip, { tone: 'info', keepCase: true }, 'TX'));
out.calloutFigure = r(h(Callout, { label: 'takeaway', figure: '$38,570 landed' }, h('p', null, 'x')));
out.callout = r(h(Callout, { variant: 'ink', label: 'takeaway', figure: '$38,570 landed' }, h('p', null, 'x')));
for (const [k, v] of Object.entries(out)) console.log(k + ': ' + v.replace(/src="data:[^"]{30}[^"]*"/g, 'src="data:…"'));
console.log('forwardRef?', [Input, Button, Table, Tooltip, Checkbox].every((c) => c.$$typeof === Symbol.for('react.forward_ref')));
console.log('displayNames:', [Input, Button, Table, Media, ThemeToggle].map((c) => c.displayName).join(','));
console.log('THEME_BOOT_SCRIPT starts:', JSON.stringify(THEME_BOOT_SCRIPT.slice(0, 60)), 'length', THEME_BOOT_SCRIPT.length);
