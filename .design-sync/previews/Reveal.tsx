import * as React from 'react';
import { Card, Reveal } from '@spicychicken/react';

// sc-motion.js is optional. These remain visible before it loads and with reduced motion.
export const Rise = () => <Reveal effect="rise"><Card title="A considered entrance">
  <p>Use a short entrance to establish hierarchy, then let the content stay still.</p>
</Card></Reveal>;

export const StaggeredSequence = () => <div className="sc-stagger sc-stack">
  <Reveal effect="fade"><Card title="One clear idea"><p>Start with the conclusion.</p></Card></Reveal>
  <Reveal effect="fade"><Card title="Evidence close by"><p>Keep the supporting context in reach.</p></Card></Reveal>
</div>;
