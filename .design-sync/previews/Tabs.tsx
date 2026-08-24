import * as React from 'react';
import { Tabs } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** Switching the subject of a view. The selected pill fills with brand cobalt. */
export const Default = () => {
  const [value, setValue] = React.useState('utilisation');
  return (
    <div style={page}>
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
    </div>
  );
};

/** `keepCase` preserves proper nouns that must not be lowercased. */
export const ProperNouns = () => {
  const [value, setValue] = React.useState('i5');
  return (
    <div style={page}>
      <Tabs
        label="Model"
        value={value}
        onChange={setValue}
        items={[
          { id: 'i5', label: 'BMW i5', keepCase: true },
          { id: 'eV', label: 'Vauxhall Vivaro-e', keepCase: true },
          { id: 'sprinter', label: 'Mercedes eSprinter', keepCase: true },
        ]}
      />
    </div>
  );
};
