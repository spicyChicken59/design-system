// sRGB <-> OKLCH, WCAG contrast, lightness-preserving hue remap.
// Port of build/color.py — same math, same constants, same gamut-mapping
// bisection. The only translations are Python semantics JS lacks: round()
// is half-to-even and float % takes the sign of the divisor. No dependencies.

const round = x => { const r = Math.round(x); return Math.abs(x % 1) === 0.5 && r % 2 ? r - 1 : r; };
const mod = (x, y) => { const m = x % y; return m && (y < 0) !== (m < 0) ? m + y : m; };
const radians = d => d * (Math.PI / 180);
const degrees = r => r * (180 / Math.PI);

export const hexToRgb = h => { h = h.replace(/^#+/, ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); };
export const rgbToHex = rgb => '#' + rgb.map(c => Math.max(0, Math.min(255, round(c * 255))).toString(16).toUpperCase().padStart(2, '0')).join('');
export const srgbToLinear = c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
export const linearToSrgb = c => c <= 0.0031308 ? 12.92 * c : 1.055 * (c ** (1 / 2.4)) - 0.055;

export function rgbToOklab(rgb) {
  const [r, g, b] = rgb.map(srgbToLinear);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = l ** (1 / 3), m_ = m ** (1 / 3), s_ = s ** (1 / 3);
  return [0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
          1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
          0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_];
}

export function oklabToRgb([L, a, b]) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  return [r, g, bb].map(linearToSrgb);
}

// -> [L, C, H] with H in [0, 360).
export function hexToOklch(h) {
  const [L, a, b] = rgbToOklab(hexToRgb(h));
  return [L, Math.hypot(a, b), mod(degrees(Math.atan2(b, a)), 360)];
}

const inGamut = rgb => rgb.every(c => -0.002 <= c && c <= 1.002);
const lchToRgb = (L, C, H) => oklabToRgb([L, C * Math.cos(radians(H)), C * Math.sin(radians(H))]);

export function oklchToHex(L, C, H) {
  const rgb = lchToRgb(L, C, H);
  if (inGamut(rgb)) return rgbToHex(rgb);
  // gamut-map by reducing chroma
  let lo = 0.0, hi = C;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(lchToRgb(L, mid, H))) lo = mid; else hi = mid;
  }
  return rgbToHex(lchToRgb(L, lo, H));
}

// Keep a colour's lightness (and, scaled, its chroma) but move it to `hue`.
export function remap(h, hue, chromaScale = 1.0, minChroma = null) {
  let [L, C] = hexToOklch(h);
  C = C * chromaScale;
  if (minChroma != null) C = Math.max(C, minChroma);
  return oklchToHex(L, C, hue);
}

export function luminance(h) {
  const [r, g, b] = hexToRgb(h).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(h1, h2) {
  let l1 = luminance(h1), l2 = luminance(h2);
  if (l1 < l2) [l1, l2] = [l2, l1];
  return (l1 + 0.05) / (l2 + 0.05);
}

// --- Alpha helpers (used by build/check.mjs for composited pairs) ---------

// "#RRGGBB" | "#RGB" | "rgb(a)(r, g, b[, a])" -> [r, g, b, a] in 0..1.
export function parseColor(v) {
  v = String(v).trim();
  if (v.startsWith('#')) {
    let h = v.slice(1);
    if (h.length === 3 || h.length === 4) h = [...h].map(c => c + c).join('');
    const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return [r, g, b, a];
  }
  const m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(v);
  if (m) return [+m[1] / 255, +m[2] / 255, +m[3] / 255, m[4] == null ? 1 : +m[4]];
  throw new Error(`parseColor: cannot parse "${v}"`);
}

// Composite `fg` (with its own alpha, times `alpha`) over opaque `bg`; returns hex.
export function over(fg, bg, alpha = 1) {
  const f = parseColor(fg), b = parseColor(bg);
  const a = f[3] * alpha;
  return rgbToHex([0, 1, 2].map(i => f[i] * a + b[i] * (1 - a)));
}

// Contrast between two colours, compositing a translucent foreground over the background first.
export const contrastOver = (fg, bg, alpha = 1) => contrast(over(fg, bg, alpha), over(bg, '#000000'));
