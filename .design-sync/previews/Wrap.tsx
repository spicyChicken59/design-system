import * as React from 'react';
import { Card, Wrap } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', paddingTop: 24, paddingBottom: 24 } as const;

/** The three measures. Content is the default; prose is for reading, wide for data. */
export const Measures = () => (
  <div style={page}>
    <Wrap width="prose">
      <Card title="prose — 800px" headingLevel={3} hint="Documents, memos, anything read start to finish." />
    </Wrap>
    <Wrap>
      <Card title="content — 1120px" headingLevel={3} hint="The default page measure." />
    </Wrap>
    <Wrap width="wide">
      <Card title="wide — 1280px" headingLevel={3} hint="Dashboards and wide tables." />
    </Wrap>
  </div>
);

/** As the page's primary region. */
export const AsMain = () => (
  <div style={page}>
    <Wrap as="main">
      <Card title="Page content" headingLevel={3}>
        <p>Wrap centres the measure and holds the gutter; everything else nests inside it.</p>
      </Card>
    </Wrap>
  </div>
);
