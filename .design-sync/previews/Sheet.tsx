import * as React from 'react';
import { Sheet, SheetBody, SheetFoot, SheetHead } from '@spicychicken/react';

export const DecisionBriefPage = () => <div style={{ background: 'var(--sc-raised)', padding: 24 }}>
  <Sheet preview>
    <SheetHead><span>SpicyChicken / decision brief</span><span>06 Sep 2026</span></SheetHead>
    <SheetBody><p className="sc-eyebrow">the finding</p><h2>Make the decision legible.</h2><p className="sc-measure-note">Keep the conclusion, its evidence, and its source together.</p></SheetBody>
    <SheetFoot folio="02 / 03">Illustrative content</SheetFoot>
  </Sheet>
</div>;
