import * as React from 'react';
import { Button, Card, Chip, Grid } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** The canonical card: heading, hint, one action on the right, body below. */
export const WithHeadAndAction = () => (
  <div style={page}>
    <Card
      title="Fleet utilisation"
      hint="Vehicles on the road as a share of the active fleet."
      action={<Button variant="primary" size="sm">Open the dashboard →</Button>}
    >
      <p>
        Utilisation held at 78% through Q3 while the fleet grew by 40 vehicles, so the
        gain is real rather than a smaller denominator. <a href="#method">How this is measured</a>.
      </p>
      <Chip tone="good">verified</Chip>
    </Card>
  </div>
);

/** No head row — a card that is pure content. */
export const ContentOnly = () => (
  <div style={page}>
    <Card>
      <p>
        A card without a head row carries a single idea and nothing else. Use it when the
        surrounding section already says what the block is.
      </p>
    </Card>
  </div>
);

/** The raised surface, for a card sitting on top of another card. */
export const Raised = () => (
  <div style={page}>
    <Card raised title="Method" hint="How the utilisation figure is derived." headingLevel={3}>
      <p>Vehicle-days on the road divided by vehicle-days available, excluding workshop time.</p>
    </Card>
  </div>
);

/** Cards deck into a Grid — the standard section layout. */
export const InAGrid = () => (
  <div style={page}>
    <Grid cols={2}>
      <Card title="Uptime" headingLevel={3} hint="Rolling 30 days.">
        <p>99.2% across all depots, with the Leeds outage the only breach.</p>
      </Card>
      <Card title="Cost per mile" headingLevel={3} hint="Rolling 30 days.">
        <p>Down to £0.41 as the electric vans took over the city routes.</p>
      </Card>
    </Grid>
  </div>
);
