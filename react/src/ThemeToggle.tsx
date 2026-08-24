import * as React from 'react';
import { cx } from './cx.js';

/** The three theme states: pinned dark, pinned light, or follow the OS. */
export type ThemeChoice = 'dark' | 'light' | 'auto';

export interface ThemeToggleProps extends React.ComponentPropsWithoutRef<'div'> {}

const KEY = 'sc-theme';
const OPTIONS: ThemeChoice[] = ['dark', 'light', 'auto'];

const subscribe = (onChange: () => void) => {
  if (typeof MutationObserver === 'undefined') return () => {};
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
};
const serverSnapshot = (): ThemeChoice => 'auto';

function read(): ThemeChoice {
  if (typeof document === 'undefined') return 'auto';
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'dark' || attr === 'light' ? attr : 'auto';
}

/**
 * The masthead's theme control: a three-way segmented pill (dark / light / auto).
 * It sets `data-theme` on the document and remembers the choice in
 * `localStorage` under `sc-theme` — the same contract `sc-theme.js` uses.
 *
 * For a no-flash first paint put `THEME_BOOT_SCRIPT` in an inline `<script>` in
 * `<head>`; the toggle then reads the document's state on its first render and
 * only reflects it. Without the script it applies the saved choice after mount.
 * The pressed pill is read straight from the document (`useSyncExternalStore`
 * over a `data-theme` observer): server markup renders `auto`, hydration
 * re-renders with the real state, and changes made elsewhere are followed.
 */
export const ThemeToggle = React.forwardRef<HTMLDivElement, ThemeToggleProps>(function ThemeToggle(
  { className, ...rest },
  ref,
) {
  const choice = React.useSyncExternalStore(subscribe, read, serverSnapshot);

  React.useEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute('data-theme')) {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(KEY);
      } catch {
        /* storage unavailable — the document's own state stands */
      }
      if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
    }
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
  };

  return (
    <div ref={ref} className={cx('sc-theme-toggle', className)} role="group" aria-label="Theme" {...rest}>
      {OPTIONS.map((option) => (
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
});
ThemeToggle.displayName = 'ThemeToggle';
