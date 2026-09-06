import * as React from 'react';
import { MetricSpotlight } from '@spicychicken/react';

export const WithUnit = () => <MetricSpotlight label="Range on a full charge" value="320" unit="mi"
  context="Illustrative estimate. Keep the method and conditions beside the headline figure." />;
export const Price = () => <MetricSpotlight label="Lowest asking" value="$42,600"
  context="Illustrative listing price, before taxes and fees." />;
