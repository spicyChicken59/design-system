import * as React from 'react';
import { Bento, Card, MetricSpotlight, Tile } from '@spicychicken/react';

export const LeadAndSupport = () => <Bento aside={<>
  <Tile label="Compared" value="74" sub="Illustrative listings" />
  <Tile label="Median asking" value="$47,500" sub="Before fees · illustrative" />
</>}>
  <Card><MetricSpotlight label="Lowest asking" value="$42,600"
    context="A clear lead figure, with the evidence close by. Illustrative data." /></Card>
</Bento>;
