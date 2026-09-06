import * as React from 'react';
import { Stepper } from '@spicychicken/react';

export const ReviewProgress = () => <Stepper aria-label="Illustrative report progress" items={[
  { id: 'evidence', title: 'Evidence', state: 'complete', description: 'Sources collected' },
  { id: 'review', title: 'Review', state: 'current', description: 'Check the conclusions' },
  { id: 'publish', title: 'Share', description: 'Prepare the final report' },
]} />;
