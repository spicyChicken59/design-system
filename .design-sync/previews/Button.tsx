import * as React from 'react';
import { Button, Row } from '@spicychicken/react';

/** The three variants side by side. Primary is spice and there is one per view. */
export const Variants = () => (
  <Row>
    <Button variant="primary">Publish the report →</Button>
    <Button variant="secondary">Export CSV</Button>
    <Button variant="ghost">Cancel</Button>
  </Row>
);

/** The compact size, for card heads and dense toolbars. */
export const Small = () => (
  <Row>
    <Button variant="primary" size="sm">One next action →</Button>
    <Button variant="secondary" size="sm">Last 30 days</Button>
    <Button variant="ghost" size="sm">Reset</Button>
  </Row>
);

/** Disabled reads at 45% and refuses the pointer. */
export const Disabled = () => (
  <Row>
    <Button variant="primary" disabled>Publish the report →</Button>
    <Button variant="secondary" disabled>Export CSV</Button>
  </Row>
);

/** Rendered as an anchor — same styling, real navigation. */
export const AsLink = () => (
  <Row>
    <Button variant="primary" href="#report">Open the dashboard →</Button>
    <Button variant="secondary" href="#docs">Read the method</Button>
  </Row>
);
