import { Signal, SignalMatrix } from '../../react/src/index.js';

export default function SignalMatrixPreview() {
  return <div className="sc-table-scroll" tabIndex={0} role="region" aria-label="Candidate signal matrix">
    <SignalMatrix caption="Three paths checked against fit, evidence and risk"
      columns={[{ key: 'fit', label: 'fit' }, { key: 'evidence', label: 'evidence' }, { key: 'risk', label: 'risk' }]}
      rows={[
        { id: 'north', label: 'North star', note: 'preferred path', cells: { fit: <Signal glyph="✓" label="strong" tone="good" />, evidence: <Signal glyph="✓" label="clear" tone="good" />, risk: <Signal glyph="—" label="normal" /> } },
        { id: 'bold', label: 'Bold move', note: 'higher upside', cells: { fit: <Signal glyph="✓" label="strong" tone="good" />, evidence: <Signal glyph="!" label="thin" tone="caution" />, risk: <Signal glyph="!" label="watch" tone="caution" /> } },
        { id: 'safe', label: 'Safe harbor', note: 'lower variance', cells: { fit: <Signal glyph="—" label="mixed" />, evidence: <Signal glyph="✓" label="clear" tone="good" />, risk: <Signal glyph="✓" label="low" tone="good" /> } },
      ]} />
  </div>;
}
