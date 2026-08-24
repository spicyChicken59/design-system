import * as React from 'react';
import { Card, Eyebrow, Section } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** Two sections in sequence — the 48px rhythm between them is the point. */
export const Rhythm = () => (
  <div style={page}>
    <Section>
      <Eyebrow>utilisation</Eyebrow>
      <Card title="How hard the fleet worked" headingLevel={3} hint="Rolling 30 days." />
    </Section>
    <Section>
      <Eyebrow>cost</Eyebrow>
      <Card title="What it cost to run" headingLevel={3} hint="Rolling 30 days." />
    </Section>
  </div>
);
