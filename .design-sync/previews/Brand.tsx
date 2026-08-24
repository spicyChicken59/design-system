import * as React from 'react';
import { Brand, Masthead, ThemeToggle } from '@spicychicken/react';

// Brand is an <a>, and only `.sc-masthead a { border: 0 }` clears the base link
// underline — so the masthead is the only context in which it renders true.

/** The lockup in the masthead it belongs to: mark, project name, four-word sub. */
export const InAMasthead = () => (
  <Masthead brand={<Brand name="Fleet Review" sub="depot performance, monthly" />} />
);

/** Without the sub-line, when the project name says it all. */
export const NameOnly = () => (
  <Masthead brand={<Brand name="Q3 Cost Review" />} right={<ThemeToggle />} />
);

/** The light-surface mark form, for a masthead on a light cover. */
export const LightMarkForm = () => (
  <Masthead brand={<Brand name="Depot Dashboard" sub="live, refreshed hourly" form="monoCream" />} />
);
