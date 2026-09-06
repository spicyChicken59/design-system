import * as React from 'react';
import { Timeline } from '@spicychicken/react';

export const ReportEvidence = () => <Timeline aria-label="Illustrative review timeline" items={[
  { id: 'collect', stamp: '01 Sep', dateTime: '2026-09-01', title: 'Gather the evidence', description: 'A clear starting point for the review.' },
  { id: 'compare', stamp: '03 Sep', dateTime: '2026-09-03', title: 'Compare like for like', description: 'Keep assumptions beside the numbers.' },
  { id: 'share', stamp: '06 Sep', dateTime: '2026-09-06', title: 'Share the conclusion', description: 'The sequence stays readable at every width.' },
]} />;
