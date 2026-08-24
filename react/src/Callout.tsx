import * as React from 'react';
import { cx } from './cx';

export interface CalloutProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * What the block is for. `core` = the single takeaway (max one per section);
   * `ink` = must-remember, dark in both themes; `spice` = the one next action;
   * `warning` = something is wrong, adds the 2px danger border.
   */
  variant?: 'core' | 'ink' | 'spice' | 'warning';
  /** Lowercase mono label above the body. The `//` prefix is drawn by CSS. */
  label?: React.ReactNode;
}

/**
 * A tinted block with the family's file-fold corner. Callouts interrupt —
 * spend them sparingly: one `core` per section, one `spice` per view.
 */
export function Callout({ variant = 'core', label, className, children, ...rest }: CalloutProps) {
  return (
    <div className={cx('sc-callout', `sc-callout--${variant}`, className)} {...rest}>
      {label ? <div className="sc-callout__label">{label}</div> : null}
      {children}
    </div>
  );
}
