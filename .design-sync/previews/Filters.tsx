import * as React from 'react';
import { Checkbox, Field, Filters, Input, Select, Table } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** The filter bar in position: one row, directly above what it scopes. */
export const AboveATable = () => (
  <div style={page}>
    <Filters>
      <Field label="period">
        <Select defaultValue="30">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
        </Select>
      </Field>
      <Field label="depot">
        <Select defaultValue="all">
          <option value="all">All depots</option>
          <option value="mcr">Manchester</option>
        </Select>
      </Field>
      <Field label="search">
        <Input placeholder="Registration…" />
      </Field>
      <Checkbox label="Exclude provisional" defaultChecked />
    </Filters>
    <Table
      columns={[
        { key: 'depot', header: 'depot' },
        { key: 'vehicles', header: 'vehicles', numeric: true },
        { key: 'utilisation', header: 'utilisation', numeric: true },
      ]}
      rows={[
        { depot: 'Manchester', vehicles: '184', utilisation: '82%' },
        { depot: 'Birmingham', vehicles: '141', utilisation: '79%' },
      ]}
    />
  </div>
);
