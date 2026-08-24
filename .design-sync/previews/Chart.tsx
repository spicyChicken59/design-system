import * as React from 'react';
import { Card, Chart, Details, Legend, Table } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

// A static line chart drawn by hand so the preview needs no chart library.
// Real charts compute the same geometry; the classes are what matter.
const W = 600;
const H = 200;
const PAD = { l: 40, r: 12, t: 12, b: 24 };
const days = ['1 aug', '8 aug', '15 aug', '22 aug', '29 aug'];
const series = {
  manchester: [74, 78, 77, 81, 82],
  birmingham: [70, 72, 75, 77, 79],
  fleet: [71, 73, 74, 76, 78],
};
const x = (i: number) => PAD.l + (i / (days.length - 1)) * (W - PAD.l - PAD.r);
const y = (v: number) => PAD.t + (1 - (v - 60) / 30) * (H - PAD.t - PAD.b);
const line = (values: number[]) => values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)} ${y(v)}`).join(' ');

const StaticSvg = () => (
  <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
    {[60, 70, 80, 90].map((v) => (
      <g key={v}>
        <line className="sc-chart__grid" x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} />
        <text x={PAD.l - 8} y={y(v) + 4} textAnchor="end">{v}%</text>
      </g>
    ))}
    {days.map((d, i) => (
      <text key={d} x={x(i)} y={H - 6} textAnchor="middle">{d}</text>
    ))}
    <path className="sc-chart__series sc-chart__series--context" d={line(series.birmingham)} />
    <path className="sc-chart__series sc-chart__series--context" d={line(series.fleet)} />
    <path className="sc-chart__series sc-chart__series--emphasis" d={line(series.manchester)} />
    <line className="sc-chart__crosshair" x1={x(3)} x2={x(3)} y1={PAD.t} y2={H - PAD.b} strokeDasharray="3 3" />
    <circle className="sc-chart__marker" cx={x(4)} cy={y(82)} r={4} fill="var(--sc-chart-emphasis)" />
    <text className="sc-chart__label" x={x(4) - 8} y={y(82) - 10} textAnchor="end">82%</text>
  </svg>
);

const twin = (
  <Details summary="table view">
    <Table
      compact
      columns={[
        { key: 'day', header: 'week of' },
        { key: 'manchester', header: 'manchester', numeric: true },
        { key: 'birmingham', header: 'birmingham', numeric: true },
        { key: 'fleet', header: 'fleet', numeric: true },
      ]}
      rows={days.map((d, i) => ({
        id: d,
        day: d,
        manchester: `${series.manchester[i]}%`,
        birmingham: `${series.birmingham[i]}%`,
        fleet: `${series.fleet[i]}%`,
      }))}
      caption="Utilisation by week, per depot"
    />
  </Details>
);

/**
 * The chart host contract: a focusable, named group around an `aria-hidden`
 * SVG, with a `Details` table twin holding the same numbers underneath.
 * One series in emphasis, the rest in context grey; a `Legend` for two or more.
 */
export const LineChart = () => (
  <div style={page}>
    <Card title="Utilisation by week" hint="Manchester against the fleet, August.">
      <Legend
        items={[
          { label: 'Manchester', color: 'var(--sc-chart-emphasis)' },
          { label: 'Birmingham', color: 'var(--sc-chart-context)' },
          { label: 'Fleet', color: 'var(--sc-chart-context)' },
        ]}
      />
      <Chart label="Utilisation by week: Manchester rose from 74% to 82% across August, ahead of the fleet's 71% to 78%.">
        <StaticSvg />
        {twin}
      </Chart>
    </Card>
  </div>
);

/** Bare, outside a card — the host still sizes the SVG to its container and draws the focus ring. */
export const Bare = () => (
  <div style={page}>
    <Chart label="Utilisation by week, three series.">
      <StaticSvg />
      {twin}
    </Chart>
  </div>
);
