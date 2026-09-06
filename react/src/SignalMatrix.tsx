import * as React from 'react';
import { cx } from './cx.js';

export type SignalTone = 'neutral' | 'good' | 'caution' | 'blocked' | 'info';

export interface SignalProps extends React.HTMLAttributes<HTMLSpanElement> {
  glyph: React.ReactNode;
  label: React.ReactNode;
  tone?: SignalTone;
}

export const Signal = React.forwardRef<HTMLSpanElement, SignalProps>(function Signal(
  { glyph, label, tone = 'neutral', className, ...rest }, ref,
) {
  return <span ref={ref} className={cx('sc-signal', tone !== 'neutral' && `sc-signal--${tone}`, className)} {...rest}>
    <span className="sc-signal__glyph" aria-hidden="true">{glyph}</span>
    <span className="sc-signal__label">{label}</span>
  </span>;
});
Signal.displayName = 'Signal';

export interface SignalMatrixColumn { key: string; label: React.ReactNode }
export interface SignalMatrixRow {
  id: React.Key;
  label: React.ReactNode;
  note?: React.ReactNode;
  cells: Record<string, React.ReactNode>;
}

export interface SignalMatrixProps extends React.TableHTMLAttributes<HTMLTableElement> {
  columns: SignalMatrixColumn[];
  rows: SignalMatrixRow[];
  caption: string;
}

export const SignalMatrix = React.forwardRef<HTMLTableElement, SignalMatrixProps>(function SignalMatrix(
  { columns, rows, caption, className, ...rest }, ref,
) {
  return <table ref={ref} className={cx('sc-table', 'sc-signal-matrix', className)} {...rest}>
    <caption className="sc-sr-only">{caption}</caption>
    <thead><tr><th scope="col">candidate</th>{columns.map(column => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead>
    <tbody>{rows.map(row => <tr key={row.id}>
      <th scope="row"><span className="sc-signal-matrix__name">{row.label}</span>{row.note != null && <span className="sc-signal-matrix__note">{row.note}</span>}</th>
      {columns.map(column => <td key={column.key}>{row.cells[column.key]}</td>)}
    </tr>)}</tbody>
  </table>;
});
SignalMatrix.displayName = 'SignalMatrix';
