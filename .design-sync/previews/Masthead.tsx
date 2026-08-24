import * as React from 'react';
import { Brand, Masthead, Nav, ThemeToggle } from '@spicychicken/react';

/** The full masthead: project lockup left, nav, divider and theme toggle right. */
export const Full = () => (
  <Masthead
    brand={<Brand name="Fleet Review" sub="depot performance, monthly" />}
    right={
      <>
        <Nav
          items={[
            { href: '#overview', label: 'Overview', current: true },
            { href: '#data', label: 'Data' },
            { href: '#about', label: 'About' },
          ]}
        />
        <span className="sc-sep" aria-hidden="true" />
        <ThemeToggle />
      </>
    }
  />
);

/** Brand only — for a single-page report with nowhere to navigate. */
export const BrandOnly = () => (
  <Masthead brand={<Brand name="Q3 Cost Review" sub="one page, one number" />} />
);

/** Brand and the theme toggle, without navigation. */
export const WithToggle = () => (
  <Masthead
    brand={<Brand name="Depot Dashboard" sub="live, refreshed hourly" />}
    right={<ThemeToggle />}
  />
);
