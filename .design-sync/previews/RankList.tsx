import * as React from 'react';
import { RankList } from '@spicychicken/react';

export const RankedEvidence = () => <RankList aria-label="Illustrative listing prices, lowest first" items={[
  { id: 'one', title: 'Listing one', description: '2024 · 17,300 mi', value: '$42,600' },
  { id: 'two', title: 'Listing two', description: '2024 · 12,800 mi', value: '$45,100' },
  { id: 'three', title: 'Listing three', description: '2025 · 8,200 mi', value: '$47,500' },
]} />;
