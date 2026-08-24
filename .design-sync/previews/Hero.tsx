import * as React from 'react';
import { Eyebrow, Hero, Delta } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** The one figure a page leads with — exactly one per view. */
export const Default = () => (
  <div style={page}>
    <Eyebrow>utilisation · rolling 30 days</Eyebrow>
    <Hero>78.4%</Hero>
    <Delta tone="good" arrow="up">2.1 pts vs the previous 30 days</Delta>
  </div>
);
