import * as React from 'react';
import { Comparison } from '@spicychicken/react';

export const EqualWeight = () => <Comparison aria-label="Illustrative price comparison" items={[
  { id: 'lowest', label: 'Lowest asking', value: '$42,600', note: 'A single illustrative listing, before fees.' },
  { id: 'median', label: 'Median asking', value: '$47,500', note: 'Illustrative midpoint across compared listings.' },
  { id: 'highest', label: 'Highest asking', value: '$48,600', note: 'The upper end of this example range.' },
]} />;
