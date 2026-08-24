import * as React from 'react';
import { Dek, Eyebrow, Meta, Tabs, Title } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: '0 24px 24px' } as const;

/** The block that opens every page: eyebrow, h1, dek, meta. */
export const Default = () => (
  <div style={page}>
    <Title>
      <Eyebrow>fleet · q3 review</Eyebrow>
      <h1>Utilisation held at 78% while the fleet grew.</h1>
      <Dek>The gain is real rather than a smaller denominator.</Dek>
      <Meta items={['Updated 24 Aug 2026', 'Source: telematics export', 'Method: vehicle-days']} />
    </Title>
  </div>
);

/** With a tab row underneath — the stylesheet spaces it, no margins to add. */
export const WithTabs = () => {
  const [value, setValue] = React.useState('utilisation');
  return (
    <div style={page}>
      <Title>
        <Eyebrow>fleet · q3 review</Eyebrow>
        <h1>Utilisation held at 78% while the fleet grew.</h1>
        <Dek>The gain is real rather than a smaller denominator.</Dek>
        <Meta items={['Updated 24 Aug 2026', 'Source: telematics export']} />
        <Tabs
          label="Measure"
          value={value}
          onChange={setValue}
          items={[
            { id: 'utilisation', label: 'utilisation' },
            { id: 'cost', label: 'cost per mile' },
            { id: 'uptime', label: 'uptime' },
          ]}
        />
      </Title>
    </div>
  );
};
