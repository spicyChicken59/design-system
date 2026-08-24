import * as React from 'react';
import { Chip, Row } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** Every tone. The word carries the meaning; colour only reinforces it. */
export const Tones = () => (
  <div style={page}>
    <Row>
      <Chip tone="brand">brand</Chip>
      <Chip tone="neutral">neutral</Chip>
      <Chip tone="spice">spice</Chip>
      <Chip tone="good">verified</Chip>
      <Chip tone="warn">stale</Chip>
      <Chip tone="danger">breached</Chip>
      <Chip tone="solid">solid</Chip>
    </Row>
  </div>
);

/** In use: status against a row of real records. */
export const InUse = () => (
  <div style={page}>
    <Row>
      <span>Manchester</span>
      <Chip tone="good">on target</Chip>
      <span>Leeds</span>
      <Chip tone="warn">watch</Chip>
      <span>Glasgow</span>
      <Chip tone="danger">breached</Chip>
    </Row>
  </div>
);
