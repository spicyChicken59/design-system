import * as React from 'react';
import { cx } from './cx';

/** The three theme states: pinned dark, pinned light, or follow the OS. */
export type ThemeChoice = 'dark' | 'light' | 'auto';

export interface ThemeToggleProps extends React.ComponentPropsWithoutRef<'div'> {}

const KEY = 'sc-theme';

function read(): ThemeChoice {
  if (typeof document === 'undefined') return 'auto';
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'dark' || attr === 'light' ? attr : 'auto';
}

/**
 * The masthead's theme control: a three-way segmented pill (dark / light / auto).
 * Self-contained — it sets `data-theme` on the document and remembers the choice
 * in `localStorage`, the same contract `starter.html` uses. Dark is the default
 * and auto follows the OS.
 */
export function ThemeToggle({ className, ...rest }: ThemeToggleProps) {
  const [choice, setChoice] = React.useState<ThemeChoice>('auto');

  React.useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {
      /* storage unavailable — fall back to the document's own state */
    }
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
    }
    setChoice(read());
  }, []);

  const pick = (next: ThemeChoice) => {
    const root = document.documentElement;
    if (next === 'auto') {
      root.removeAttribute('data-theme');
      try {
        localStorage.removeItem(KEY);
      } catch {
        /* ignore */
      }
    } else {
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* ignore */
      }
    }
    setChoice(next);
  };

  const options: ThemeChoice[] = ['dark', 'light', 'auto'];
  return (
    <div className={cx('sc-theme-toggle', className)} role="group" aria-label="Theme" {...rest}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          data-theme={option}
          aria-pressed={choice === option}
          onClick={() => pick(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
