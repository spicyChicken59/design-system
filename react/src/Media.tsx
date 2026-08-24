import * as React from 'react';
import { cx } from './cx.js';
import { Frame } from './Frame.js';

export interface MediaProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  /** The photo slot on the left — a `Frame`. The card form draws the empty twin when it is omitted, so the grid keeps its shape. */
  frame?: React.ReactNode;
  /** The name line, bold heading colour. */
  title: React.ReactNode;
  /** One line of context under the title, 12px muted. */
  sub?: React.ReactNode;
  /** A code line — VIN, registration, id — small tracked mono. */
  code?: React.ReactNode;
  /** The row's links, usually `QuietLink`s: "Listing ↗", "Carfax ↗". */
  links?: React.ReactNode;
  /** Card form only: the right-hand column — a `Figure` and its `Note`. Always rendered (empty if omitted) so the grid holds. */
  aside?: React.ReactNode;
  /** Card form only: the foot row under a hairline — miles, days listed, dealer, flags. */
  foot?: React.ReactNode;
  /** The narrow-screen card twin: a bordered surface with a three-column grid. */
  card?: boolean;
}

/**
 * The media object: a framed photo beside title / sub / code / links. It is a
 * table cell on wide screens and, with `card`, the whole row as a card on
 * phones — the same fields, plus `aside` (the figures) and `foot` (the rest).
 */
export const Media = React.forwardRef<HTMLDivElement, MediaProps>(function Media(
  { frame, title, sub, code, links, aside, foot, card = false, className, ...rest },
  ref,
) {
  if (card) {
    return (
      <div ref={ref} className={cx('sc-media', 'sc-media--card', className)} {...rest}>
        {frame ?? <Frame alt="" />}
        <div className="sc-media__title">{title}</div>
        <div className="sc-media__aside">{aside}</div>
        {sub ? <div className="sc-media__sub">{sub}</div> : null}
        {code ? <div className="sc-media__code">{code}</div> : null}
        {foot || links ? (
          <div className="sc-media__foot">
            {foot}
            {links ? <span className="sc-media__links sc-right">{links}</span> : null}
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <div ref={ref} className={cx('sc-media', className)} {...rest}>
      {frame}
      <div className="sc-media__body">
        <div className="sc-media__title">{title}</div>
        {sub ? <div className="sc-media__sub">{sub}</div> : null}
        {code ? <div className="sc-media__code">{code}</div> : null}
        {links ? <div className="sc-media__links">{links}</div> : null}
      </div>
    </div>
  );
});
Media.displayName = 'Media';
