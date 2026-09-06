import * as React from 'react';
import { Editorial, Eyebrow, Ghost } from '@spicychicken/react';

export const BrandStory = () => <Editorial art={<Ghost />} decorativeArt>
  <Eyebrow>the spicychicken point of view</Eyebrow>
  <h2>A little heat. A lot of clarity.</h2>
  <p>Give the story room to breathe and the original chick a place of its own.</p>
</Editorial>;
