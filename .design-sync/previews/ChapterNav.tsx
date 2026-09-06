import * as React from 'react';
import { ChapterNav } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** Native links remain usable without the optional sc-reading.js runtime. */
export const Default = () => {
  const id = React.useId();
  return <div style={page}>
    <ChapterNav aria-label="Brand guidance" items={[
      { id: 'mark', href: `#${id}-mark`, index: '01', label: 'The original mark' },
      { id: 'placement', href: `#${id}-placement`, index: '02', label: 'Clear space' },
    ]} />
    <section id={`${id}-mark`}><h2>The original mark</h2><p>Use the supplied SpicyChicken asset with its original proportions.</p></section>
    <section id={`${id}-placement`}><h2>Clear space</h2><p>Reserve an art region beside the content. Keep the mark outside chart plots and body copy.</p></section>
  </div>;
};
