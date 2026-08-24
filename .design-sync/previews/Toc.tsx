import * as React from 'react';
import { Dek, Doc, Eyebrow, Toc } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

const items = [
  { href: '#method', label: 'Method' },
  { href: '#landed-price', label: 'Landed price' },
  { href: '#sources', label: 'Sources' },
  { href: '#caveats', label: 'Caveats' },
];

/** The contents line under a document's title: a wrapping mono row of anchors. */
export const Default = () => (
  <div style={page}>
    <Toc items={items} />
  </div>
);

/** In place, at the top of a flat document. */
export const InADocument = () => (
  <div style={page}>
    <Doc flat>
      <Eyebrow>fleet review · method</Eyebrow>
      <h1>How the numbers are made</h1>
      <Dek>Every figure on the dashboard traces back to one of four sources described here.</Dek>
      <Toc items={items} />
      <h2 id="method">Method</h2>
      <p>Utilisation is vehicle-days on the road divided by vehicle-days available, per depot, per week.</p>
      <h2 id="landed-price">Landed price</h2>
      <p>Asking price plus transport from the seller's depot, at the standard per-mile rate.</p>
    </Doc>
  </div>
);
