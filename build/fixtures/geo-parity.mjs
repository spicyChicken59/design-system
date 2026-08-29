// The extracted geo must be byte-identical to the copy it replaces, or every
// dot on the map moves. Runs both against the same inputs, in Node — which is
// itself the point: these are pure, so they need no DOM.
import { readFileSync } from 'node:fs';
const w = {};
new Function('window', readFileSync('/home/user/design-system/build/map.js','utf8'))(w);
const SC = w.SC;

// --- the original, lifted verbatim from the page before extraction ---
const albers48 = (() => {
  const rad = Math.PI / 180, y0 = 29.5 * rad, y1 = 45.5 * rad;
  const n = (Math.sin(y0) + Math.sin(y1)) / 2;
  const c = 1 + Math.sin(y0) * (2 * n - Math.sin(y0));
  const r0 = Math.sqrt(c) / n;
  const raw = (lam, phi) => { const r = Math.sqrt(c - 2 * n * Math.sin(phi)) / n; return [r * Math.sin(lam * n), r0 - r * Math.cos(lam * n)]; };
  const k = 1300, tx = 487.5, ty = 305, cc = raw(-0.6 * rad, 38.7 * rad);
  return (lon, lat) => { const p = raw((lon + 96) * rad, lat * rad); return [tx + k * (p[0] - cc[0]), ty - k * (p[1] - cc[1])]; };
})();
function ringPointsOld(lat, lon, miles) {
  const rad = Math.PI / 180, d = miles / 3958.8, p1 = lat * rad, l1 = lon * rad;
  const pts = [];
  for (let i = 0; i <= 72; i++) {
    const th = (i / 72) * 2 * Math.PI;
    const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(th));
    const l2 = l1 + Math.atan2(Math.sin(th) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
    pts.push(albers48(l2 / rad, p2 / rad));
  }
  return pts;
}

let pass=0, fail=0;
const t=(n,c,d='')=>{ (c?pass++:fail++); console.log((c?'  PASS  ':'  FAIL  ')+n+(d?'  ['+d+']':'')); };

// --- projection, over a spread of real US cities ---
const cities = [['Chicago',41.8781,-87.6298],['Seattle',47.6062,-122.3321],['Miami',25.7617,-80.1918],
                ['Boston',42.3601,-71.0589],['San Diego',32.7157,-117.1611],['Fargo',46.8772,-96.7898]];
let same = true, worst = 0;
for (const [name,lat,lon] of cities) {
  const a = albers48(lon,lat), b = SC.geo.albersUsa48(lon,lat);
  const d = Math.max(Math.abs(a[0]-b[0]), Math.abs(a[1]-b[1]));
  if (d > worst) worst = d;
  if (a[0]!==b[0] || a[1]!==b[1]) same = false;
}
t('projection is bit-identical for 6 cities', same, 'max delta ' + worst);
// every projected city must land inside the frame
const inside = cities.every(([,lat,lon]) => { const p = SC.geo.albersUsa48(lon,lat);
  return p[0]>=0 && p[0]<=975 && p[1]>=0 && p[1]<=610; });
t('every city lands inside the 975x610 frame', inside);

// --- geodesic ring ---
const r1 = ringPointsOld(41.8781,-87.6298,250), r2 = SC.geo.ring(41.8781,-87.6298,250);
t('ring has the same point count', r1.length === r2.length, `${r1.length} vs ${r2.length}`);
t('ring is bit-identical', r1.every((p,i)=>p[0]===r2[i][0] && p[1]===r2[i][1]));
t('ring closes on itself', Math.abs(r2[0][0]-r2[72][0])<1e-9);
// a km ring of the same physical size must match a miles ring
const km = SC.geo.ring(41.8781,-87.6298, 250*1.609344, { earth: 6371.0088 });
const close = km.every((p,i)=>Math.abs(p[0]-r2[i][0])<0.5 && Math.abs(p[1]-r2[i][1])<0.5);
t('the same distance in km draws the same ring', close);

// --- fitBoxes ---
const f = SC.geo.fitBoxes([[100,100,200,200]]);
t('fit locks the extent aspect', Math.abs(f.w/f.h - 975/610) < 1e-9, (f.w/f.h).toFixed(4));
t('fit pads by 12%', Math.abs(f.h - 100*1.24) < 1e-9, 'h=' + f.h.toFixed(2));
t('fit accepts {x,y,w,h} too', JSON.stringify(SC.geo.fitBoxes([{x:100,y:100,w:100,h:100}])) === JSON.stringify(f));
const empty = SC.geo.fitBoxes([]);
t('fit with nothing returns the whole extent', empty.w===975 && empty.h===610);
const mixed = SC.geo.fitBoxes([[100,100,200,200], null, undefined]);
t('fit ignores null boxes', JSON.stringify(mixed)===JSON.stringify(f));

// --- topology decode, against the real atlas ---
const topo = JSON.parse(readFileSync(process.env.S + '/live-lh/states-albers-10m.json','utf8'));
const states = SC.geo.decodeTopology(topo, 'states');
t('decodes every state', states.length >= 50, String(states.length));
const mi = states.find(s=>s.name==='Michigan'), fl = states.find(s=>s.name==='Florida');
t('Michigan anchors on land, not the lake', mi && mi.center[1] > (mi.bbox[1]+mi.bbox[3])/2, mi ? 'centre y ' + mi.center[1].toFixed(0) + ' vs bbox mid ' + ((mi.bbox[1]+mi.bbox[3])/2).toFixed(0) : '');
// Florida's peninsula outweighs its panhandle, so its anchor pulls EAST of
// the bbox centre — the direction is not the invariant. What matters is that
// the anchor is the largest ring's centroid and not the bbox's, and that it
// lands inside the state.
const offBbox = (s) => Math.hypot(s.center[0]-(s.bbox[0]+s.bbox[2])/2, s.center[1]-(s.bbox[1]+s.bbox[3])/2);
t('Florida anchors away from its bbox centre', fl && offBbox(fl) > 10, fl ? offBbox(fl).toFixed(0)+'px off' : '');
t('every anchor lands inside its own state box', states.every(s =>
  s.center[0]>=s.bbox[0] && s.center[0]<=s.bbox[2] && s.center[1]>=s.bbox[1] && s.center[1]<=s.bbox[3]));
t('every state has a path', states.every(s=>s.d.startsWith('M') && s.d.endsWith('Z')));
t('every abbreviation resolves', states.filter(s=>SC.geo.STATE_ABBR[s.name]).length >= 50);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
