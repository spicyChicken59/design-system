import * as React from 'react';
import { Doc, Eyebrow, Dek, Meta } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', paddingTop: 8, paddingBottom: 8 } as const;

/** The on-screen document: 800px of prose, each h2 opening under a cobalt rule. */
export const Memo = () => (
  <div style={page}>
    <Doc>
      <Eyebrow>memo · fleet ops</Eyebrow>
      <h1>Electric vans should take the Leeds city routes next.</h1>
      <Dek>The Manchester rollout paid back in nine weeks; Leeds has the same route profile.</Dek>
      <Meta items={['24 Aug 2026', 'A. Whitfield']} />
      <h2>What happened</h2>
      <p>
        Twenty electric vans replaced diesel on the Manchester city routes in June. Cost per
        mile on those routes fell from £0.52 to £0.38, and the depot has not missed a slot since.
      </p>
      <h2>What to do</h2>
      <p>
        Move the next twenty vans to Leeds rather than splitting them across four depots.
        Concentration is what made Manchester legible.
      </p>
    </Doc>
  </div>
);
