import * as React from 'react';
import { Delta, Stack } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/**
 * All three tones. Tone says what the movement means, not which way it points —
 * a falling cost is `good`, and `bad` is amber because red is reserved for danger.
 */
export const Tones = () => (
  <div style={page}>
    <Stack>
      <Delta tone="good" arrow="up">3% vs last week</Delta>
      <Delta tone="good" arrow="down">4p per mile vs last week</Delta>
      <Delta tone="bad" arrow="up">1 depot off target vs last week</Delta>
      <Delta tone="flat" arrow="flat">no change vs last week</Delta>
    </Stack>
  </div>
);

/** A delta in words: the glyph still carries the direction, the words carry the period. */
export const WordsOnly = () => (
  <div style={page}>
    <Delta tone="good" arrow="up">best week since March</Delta>
  </div>
);
