import * as React from 'react';
import { ChapterNav, Reading } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** A sticky chapter rail becomes a wrapping native index on smaller screens. */
export const WithChapterRail = () => {
  const id = React.useId();
  return <div style={page}>
    <Reading navigation={<ChapterNav rail aria-label="Report composition guidance" items={[
      { id: 'finding', href: `#${id}-finding`, index: '01', label: 'Lead with the finding' },
      { id: 'source', href: `#${id}-source`, index: '02', label: 'Attach the source' },
    ]} />}>
      <section id={`${id}-finding`}><h2>Lead with the finding</h2><p>Give each chapter one clear purpose. Put the conclusion before the supporting detail.</p></section>
      <section id={`${id}-source`}><h2>Attach the source</h2><p>Keep the source and exact values close to the visual. A caption signature belongs outside the measured plot.</p></section>
    </Reading>
  </div>;
};
