import * as React from 'react';
import { Eyebrow, Dek } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** The default brand-cobalt eyebrow opening a title block. */
export const Default = () => (
  <div style={page}>
    <Eyebrow>fleet · q3 review</Eyebrow>
    <h1>Utilisation held at 78% while the fleet grew.</h1>
    <Dek>The gain is real rather than a smaller denominator — here is how that was checked.</Dek>
  </div>
);

/** All three tones. Accent marks the one hot section; muted carries secondary rows. */
export const Tones = () => (
  <div style={page}>
    <Eyebrow tone="brand">brand · the default</Eyebrow>
    <Eyebrow tone="accent">accent · the one hot section</Eyebrow>
    <Eyebrow tone="muted">muted · secondary rows</Eyebrow>
  </div>
);
