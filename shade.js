import { TILE, name } from './achura.js';

const f = v => String(+v.toFixed(3)).replace(/^(-?)0\./, '$1.');
const OFF = [-TILE, 0, TILE];

const around = (cx, cy, e, draw) => OFF.flatMap(ox => OFF.map(oy => [cx + ox, cy + oy]))
  .filter(([x, y]) => x + e > 0 && x - e < TILE && y + e > 0 && y - e < TILE)
  .map(([x, y]) => draw(x, y)).join('');

const circle = (x, y, r, back) =>
  `M${f(x - r)} ${f(y)}a${f(r)} ${f(r)} 0 1 ${back ? 1 : 0} ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 ${back ? 1 : 0}-${f(2 * r)} 0z`;

const halfRing = (cx, up, t) => {
  const R = 2 + t / 2, r = 2 - t / 2, s = up ? 1 : 0;
  return `M${f(cx - R)} 4A${f(R)} ${f(R)} 0 0 ${s} ${f(cx + R)} 4H${f(cx + r)}A${f(r)} ${f(r)} 0 0 ${1 - s} ${f(cx - r)} 4z`;
};

const SHAPES = {
  diag: w => { const h = 4 * w; return `M0 ${f(8 - h)} ${f(8 - h)} 0H8v${f(h)}L${f(h)} 8H0zM0 0h${f(h)}L0 ${f(h)}zM8 ${f(8 - h)}V8h-${f(h)}z`; },
  back: w => { const h = 4 * w; return `M0 0h${f(h)}L8 ${f(8 - h)}V8h-${f(h)}L0 ${f(h)}zM0 ${f(8 - h)} ${f(h)} 8H0zM${f(8 - h)} 0H8v${f(h)}z`; },
  dots: w => { const r = Math.sqrt(32 * w / Math.PI); return [[2, 2], [6, 6]].map(([x, y]) => around(x, y, r, (a, b) => circle(a, b, r))).join(''); },
  squiggle: w => { const t = Math.min(4, 16 * w / Math.PI); return halfRing(2, true, t) + halfRing(6, false, t) + halfRing(-2, false, t) + halfRing(10, true, t); },
  grid: w => { const t = 8 * (1 - Math.sqrt(1 - w)); return `M0 0h8v${f(t)}H0zM0 ${f(t)}h${f(t)}V8H0z`; },
  zigzag: w => { const t = 8 * w; return `M${f(5.5 - t / 2)} 0L${f(2 - t / 2)} 4L${f(5.5 - t / 2)} 8H${f(5.5 + t / 2)}L${f(2 + t / 2)} 4L${f(5.5 + t / 2)} 0z`; },
  squares: w => { const s = 8 * Math.sqrt(w), o = 4 - s / 2; return `M${f(o)} ${f(o)}h${f(s)}v${f(s)}h-${f(s)}z`; },
  // The hole stops shrinking at r = 1.3 so rings never turn into dots; R stays under 2.83, where neighbors touch.
  rings: w => {
    const a = 32 * w / Math.PI, r = Math.sqrt(Math.max(1.69, 4 - a)), R = Math.sqrt(r * r + a);
    return [[2, 2], [6, 6]].map(([x, y]) => around(x, y, R, (a, b) => circle(a, b, R) + circle(a, b, r, true))).join('');
  },
  rows: w => { const t = 8 * w; return `M0 ${f(4 - t / 2)}h8v${f(t)}H0z`; },
  cols: w => { const t = 8 * w; return `M${f(4 - t / 2)} 0h${f(t)}v8h-${f(t)}z`; },
  // No shape overlaps itself: past half cover it is cut out of the tile under evenodd.
  meander: (w, t = 32 * w / 7) => `M0 2H${f(4 + t)}V5H8v${f(t)}H4V${f(2 + t)}H${f(t)}V${f(5 + t)}H0z`,
  // The star four touching circles leave, scaled; past 1 - π/4 the circles shrink instead.
  stars: w => {
    const k = 1 - Math.PI / 4, R = w < k ? 4 * Math.sqrt(w / k) : Math.sqrt(64 * (1 - w) / Math.PI), x = w < k ? 4 : R;
    const a = `A${f(R)} ${f(R)} 0 0 0 `, p = f(x), q = f(8 - x), u = f(x - R), v = f(8 - x + R);
    return `M${q} ${u}${a}${v} ${p}V${q}${a}${q} ${v}H${p}${a}${u} ${q}V${p}${a}${p} ${u}z`;
  },
  cross: w => {
    const h = 4 - 4 * Math.sqrt(1 - w), a = f(h), k = f(8 - h), m = f(4 - h), n = f(4 + h);
    return `M0 0h${a}L4 ${m} ${k} 0H8v${a}L${n} 4 8 ${k}V8h-${a}L4 ${n} ${a} 8H0v-${a}L${m} 4 0 ${a}z`;
  },
  scales: (w, r = Math.sqrt(16 - 64 * w / Math.PI)) =>
    [[0, 4], [-4, 8], [4, 8]].map(([x, y]) => `M${x} ${y}a4 4 0 0 1 8 0h-${f(4 - r)}a${f(r)} ${f(r)} 0 0 0-${f(2 * r)} 0z`).join(''),
  // Zigzag bands v thick, stems .6v wide: 64w = 16v + 1.2v(2 - v).
  hex: w => {
    const v = (18.4 - Math.sqrt(338.56 - 307.2 * w)) / 2.4, h = v / 2, s = f(.6 * v);
    const band = (y, d) => `M-2 ${f(y - h)}l4 ${-d} 4 ${d} 4 ${-d}v${f(v)}l-4 ${d}-4 ${-d}-4 ${d}z`;
    const stem = (x, y) => `M${f(x - .3 * v)} ${f(y + h)}h${s}v${f(2 - v)}h-${s}z`;
    return band(3, 2) + band(5, -2) + stem(6, 3) + stem(2, 7) + stem(2, -1);
  },
};

export function shade(g, cover) {
  const n = name(g), v = cover > .5 ? 1 - cover : cover;
  if (!Object.hasOwn(SHAPES, n) || !(v >= 0)) throw new RangeError(`achura: no shade of ${n} at ${cover}`);
  return { name: n, key: `${n}-${+(cover * 100).toFixed(1)}`, d: v ? SHAPES[n](v) : '', invert: cover > .5 };
}

export const ramp = (n, { from = .1, to = .85 } = {}) =>
  Array.from({ length: n }, (_, i) => n < 2 ? from : from + (to - from) * i / (n - 1));
