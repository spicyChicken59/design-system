import * as React from 'react';
import { cx } from './cx.js';

export interface CardProps extends Omit<React.ComponentPropsWithoutRef<'section'>, 'title'> {
  /** Heading for the card. Omit for a card that is pure content. */
  title?: React.ReactNode;
  /** One line of context under the heading. */
  hint?: React.ReactNode;
  /** Right-aligned action in the head row — at most one, usually a small Button. */
  action?: React.ReactNode;
  /** Heading level for `title`. Pick the one the document outline needs. */
  headingLevel?: 2 | 3;
  /** Use the raised surface instead of the base card surface. */
  raised?: boolean;
}

/**
 * One discrete idea per card: a hairline-bordered surface with an optional
 * head row (heading + hint on the left, one action on the right). The heading
 * is sized by the stylesheet (`--sc-h3`) — no inline font sizes.
 */
export const Card = React.forwardRef<HTMLElement, CardProps>(function Card(
  { title, hint, action, headingLevel = 2, raised = false, className, children, ...rest },
  ref,
) {
  const Heading = (headingLevel === 3 ? 'h3' : 'h2') as React.ElementType;
  const head = title || hint || action;
  return (
    <section ref={ref} className={cx('sc-card', raised && 'sc-card--raised', className)} {...rest}>
      {head ? (
        <div className="sc-card__head">
          <div>
            {title ? <Heading>{title}</Heading> : null}
            {hint ? <p className="sc-hint">{hint}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
});
Card.displayName = 'Card';
