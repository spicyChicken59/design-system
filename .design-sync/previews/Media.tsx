import * as React from 'react';
import { Chip, Figure, Frame, Media, Note, QuietLink, Stack, Table } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

const photo =
  'data:image/svg+xml,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 40'><rect width='56' height='40' fill='#2A394D'/><rect x='8' y='16' width='40' height='14' rx='4' fill='#4682CC'/><circle cx='17' cy='31' r='4' fill='#0E1622'/><circle cx='39' cy='31' r='4' fill='#0E1622'/></svg>",
  );

const links = (
  <>
    <QuietLink href="#listing" target="_blank">Listing ↗</QuietLink>
    <QuietLink href="#history" target="_blank">History ↗</QuietLink>
  </>
);

/** The row form: a framed photo beside title, sub, code and quiet links. */
export const RowForm = () => (
  <div style={page}>
    <Media
      frame={<Frame src={photo} alt="" />}
      title="2024 Vivaro-e Sportive"
      sub="Moonstone grey"
      code="VN24 KLX"
      links={links}
    />
  </div>
);

/** As a table cell — the vehicle column of a listings table. */
export const InATable = () => (
  <div style={page}>
    <Table
      columns={[
        { key: 'vehicle', header: 'vehicle' },
        { key: 'depot', header: 'depot' },
        { key: 'miles', header: 'miles', numeric: true },
        { key: 'price', header: 'price', numeric: true },
      ]}
      rows={[
        {
          id: 'klx',
          vehicle: <Media frame={<Frame src={photo} alt="" />} title="2024 Vivaro-e Sportive" sub="Moonstone grey" code="VN24 KLX" links={links} />,
          depot: 'Manchester',
          miles: '12,400',
          price: (
            <>
              <Figure>£28,950</Figure>
              <Note>£30,150 landed</Note>
            </>
          ),
        },
        {
          id: 'pfd',
          vehicle: <Media frame={<Frame alt="" />} title="2023 eSprinter 312" sub="Arctic white" code="LK23 PFD" links={links} />,
          depot: 'Leeds',
          miles: '31,800',
          price: (
            <>
              <Figure>£34,500</Figure>
              <Note>£35,700 landed</Note>
            </>
          ),
        },
      ]}
      caption="Vehicles for sale"
    />
  </div>
);

/**
 * The narrow-screen card twin: the same fields on a bordered surface, figures
 * in the aside, everything else in the foot row. Use it below 720px in place of the table row.
 */
export const CardForm = () => (
  <div style={{ ...page, maxWidth: 420 }}>
    <Stack>
      <Media
        card
        frame={<Frame src={photo} alt="" />}
        title="2024 Vivaro-e Sportive"
        sub="Moonstone grey"
        code="VN24 KLX"
        aside={
          <>
            <Figure>£28,950</Figure>
            <Note>£30,150 landed</Note>
          </>
        }
        foot={
          <>
            <span>12,400 mi</span>
            <span>41d listed</span>
            <span>Manchester</span>
            <Chip tone="good">cpo</Chip>
          </>
        }
        links={links}
      />
      <Media
        card
        frame={<Frame alt="" />}
        title="2023 eSprinter 312"
        sub="Arctic white"
        code="LK23 PFD"
        aside={
          <>
            <Figure>£34,500</Figure>
            <Note>£35,700 landed</Note>
          </>
        }
        foot={
          <>
            <span>31,800 mi</span>
            <span>9d listed</span>
            <span>Leeds</span>
            <Chip tone="brand">new</Chip>
          </>
        }
        links={links}
      />
    </Stack>
  </div>
);
