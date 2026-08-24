import * as React from 'react';
import { Mark, Row } from '@spicychicken/react';

const ink = { background: 'var(--sc-ink)', padding: 24 } as const;
const light = { background: 'var(--sc-white)', padding: 24 } as const;

/** The colour forms: dark-surface form on ink, light-surface form on white. */
export const ColorForms = () => (
  <div>
    <div style={ink}>
      <Mark form="colorDark" size="lg" />
    </div>
    <div style={light}>
      <Mark form="colorLight" size="lg" />
    </div>
  </div>
);

/** The mono forms, for watermarks and single-colour uses. */
export const MonoForms = () => (
  <div>
    <div style={ink}>
      <Mark form="monoCream" size="lg" />
    </div>
    <div style={light}>
      <Mark form="monoInk" size="lg" />
    </div>
  </div>
);

/** The standard 26px size beside the 48px size. */
export const Sizes = () => (
  <div style={ink}>
    <Row>
      <Mark form="colorDark" />
      <Mark form="colorDark" size="lg" />
    </Row>
  </div>
);
