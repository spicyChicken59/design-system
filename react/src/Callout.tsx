import * as React from 'react';
import { cx } from './cx.js';

export interface CalloutProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * What the block is for. `core` = the single takeaway (max one per section);
   * `ink` = must-remember, dark in both themes; `spice` = the one next action;
   * `warning` = something is wrong, adds the 2px danger border.
   */
  variant?: 'core' | 'ink' | 'spice' | 'warning';
  /** Lowercase mono label above the body. The `//` prefix is drawn by CSS. */
  label?: React.ReactNode;
  /** A lead figure between the label and the body — "$38,570 landed for $42,000 asking". */
  figure?: React.ReactNode;
}

/**
 * A tinted block with the family's file-fold corner. Callouts interrupt —
 * spend them sparingly: one `core` per section, one `spice` per view.
 */
export const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(function Callout(
  { variant = 'core', label, figure, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx('sc-callout', `sc-callout--${variant}`, className)} {...rest}>
      {label ? <div className="sc-callout__label">{label}</div> : null}
      {figure ? <div className="sc-callout__figure">{figure}</div> : null}
      {children}
    </div>
  );
});
Callout.displayName = 'Callout';
