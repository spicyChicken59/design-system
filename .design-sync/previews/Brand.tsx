import * as React from 'react';
import { Brand, Masthead, ThemeToggle } from '@spicychicken/react';

// Brand is an <a>; the masthead is its home, and the on-ink context there is
// what gives the name and sub their colours.

/** The lockup in the masthead it belongs to: mark, project name, four-word sub. */
export const InAMasthead = () => (
  <Masthead brand={<Brand name="Fleet Review" sub="depot performance, monthly" />} />
);

/** Without the sub-line, when the project name says it all. */
export const NameOnly = () => (
  <Masthead brand={<Brand name="Q3 Cost Review" />} right={<ThemeToggle />} />
);

/** The mono cream form of the mark, for a single-colour masthead. */
export const MonoForm = () => (
  <Masthead brand={<Brand name="Depot Dashboard" sub="live, refreshed hourly" form="monoCream" />} />
);
