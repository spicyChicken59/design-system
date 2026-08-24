import * as React from 'react';
import { Frame, Row } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

// A stand-in photo: a flat SVG so the preview carries no binary asset.
const photo =
  'data:image/svg+xml,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 40'><rect width='56' height='40' fill='#2A394D'/><rect x='8' y='16' width='40' height='14' rx='4' fill='#4682CC'/><circle cx='17' cy='31' r='4' fill='#0E1622'/><circle cx='39' cy='31' r='4' fill='#0E1622'/></svg>",
  );

/** The photo slot beside its empty twin — the same box, so rows keep their shape. */
export const Default = () => (
  <div style={page}>
    <Row>
      <Frame src={photo} alt="Van VN24 KLX, side view" />
      <Frame alt="" />
    </Row>
  </div>
);

/** The large size, for a lead card or a detail page. */
export const Large = () => (
  <div style={page}>
    <Row>
      <Frame src={photo} alt="Van VN24 KLX, side view" size="lg" />
      <Frame alt="" size="lg" />
    </Row>
  </div>
);

/** The empty twin's wording is yours — keep it to two lowercase words. */
export const EmptyWording = () => (
  <div style={page}>
    <Row>
      <Frame alt="" empty="no photo" />
      <Frame alt="" empty="pending" />
    </Row>
  </div>
);
