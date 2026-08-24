import * as React from 'react';
import { Footer } from '@spicychicken/react';

/** Every page ends with this: provenance left, the watermark right. */
export const Default = () => (
  <Footer source="Source: telematics export · Method: vehicle-days · Updated 24 Aug 2026" />
);

/** A shorter source line for a page with one obvious origin. */
export const Short = () => <Footer source="Fleet ops · updated today" />;
