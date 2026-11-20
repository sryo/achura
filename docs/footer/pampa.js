// The site's footer: a cow in the pampa, as markup. Every layer is one element with one achura class, printed
// see-through, so the only mixing is where shapes overlap. Colors come from the page's --sky, --red… custom
// properties. build.mjs writes this into index.html; the page needs no script for it.
import { STEPS } from '../../css.js';

const W = 1200, H = 440;
const f = v => +v.toFixed(1);
const pc = v => `${+v.toFixed(2)}%`;
const step = cover => STEPS.reduce((a, s) => Math.abs(s - cover * 100) < Math.abs(a - cover * 100) ? s : a);

// A closed, smooth, slightly lumpy shape around (cx, cy); `seed` picks the lumps.
function blob(cx, cy, rx, ry, seed, n = 9, lump = .16) {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = i * 2 * Math.PI / n, r = 1 + lump * Math.sin(seed * 12.9898 + i * 4.7);
    return [cx + rx * r * Math.cos(a), cy + ry * r * Math.sin(a)];
  });
  const at = i => pts[(i + n) % n];
  return `M${f(pts[0][0])} ${f(pts[0][1])}` + pts.map((p, i) => {
    const [a, b, c] = [at(i - 1), at(i + 1), at(i + 2)];
    return `C${f(p[0] + (b[0] - a[0]) / 6)} ${f(p[1] + (b[1] - a[1]) / 6)} ${f(b[0] - (c[0] - p[0]) / 6)} ${f(b[1] - (c[1] - p[1]) / 6)} ${f(b[0])} ${f(b[1])}`;
  }).join('') + 'Z';
}

// The corners of a path, its curves cut into short lines: clip-path takes a polygon in percentages, which scales
// with the drawing. Absolute M L H V C S Z only.
function outline(d, cuts = 6) {
  const pts = [], n = d.match(/[MLHVCSZ]|-?[\d.]+/g);
  let x = 0, y = 0, cx = 0, cy = 0, i = 0, cmd;
  const num = () => +n[i++];
  const curve = (x1, y1, x2, y2, x3, y3) => {
    for (let k = 1; k <= cuts; k++) {
      const t = k / cuts, u = 1 - t;
      pts.push([u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]);
    }
    [cx, cy, x, y] = [x2, y2, x3, y3];
  };
  while (i < n.length) {
    if (/[A-Z]/.test(n[i])) cmd = n[i++];
    if (cmd === 'Z') continue;
    if (cmd === 'C') curve(num(), num(), num(), num(), num(), num());
    else if (cmd === 'S') curve(2 * x - cx, 2 * y - cy, num(), num(), num(), num());
    else {
      if (cmd === 'H') x = num(); else if (cmd === 'V') y = num(); else [x, y] = [num(), num()];
      [cx, cy] = [x, y];
      pts.push([x, y]);
    }
  }
  return pts;
}

// A texture in one ink. `at` is the point it turns around; `drift` is [degrees, seconds].
const ink = (g, hue, { cover = .28, size = 8 } = {}) =>
  [`achura achura-x1 achura-${g}-${step(cover)}`, `--achura-ink:var(--${hue});--achura-size:round(calc(var(--u)*${f(size)}),1px)`];
const box = (x, y, w, h) => `left:${pc(x / W * 100)};top:${pc(y / H * 100)};width:${pc(w / W * 100)};height:${pc(h / H * 100)}`;

// One element: the shape's box, clipped to its outline.
function shape(pts, g, hue, o = {}) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys), w = Math.max(...xs) - x, h = Math.max(...ys) - y;
  const clip = `clip-path:polygon(${pts.map(p => `${pc((p[0] - x) / w * 100)} ${pc((p[1] - y) / h * 100)}`).join(',')})`;
  const [cls, vars] = ink(g, hue, o);
  if (!o.drift) return `<i class="${cls}" style="${box(x, y, w, h)};${clip};${vars}"></i>`;
  return `<i style="${box(x, y, w, h)};${clip}">${turning(x, y, w, h, cls, vars, o)}</i>`;
}

// A texture that sways sits in a bigger box inside its shape, so turning it never uncovers a corner.
function turning(x, y, w, h, cls, vars, { rot = 0, at = [x + w / 2, y + h / 2], drift: [amp, secs] }) {
  const pad = Math.max(w, h) * .2, iw = w + 2 * pad, ih = h + 2 * pad;
  return `<i class="sway ${cls}" style="left:${pc(-pad / w * 100)};top:${pc(-pad / h * 100)};width:${pc(iw / w * 100)};height:${pc(ih / h * 100)};`
    + `transform-origin:${pc((at[0] - x + pad) / iw * 100)} ${pc((at[1] - y + pad) / ih * 100)};--from:${f(rot - amp)}deg;--to:${f(rot + amp)}deg;animation-duration:${secs / 2}s;${vars}"></i>`;
}
const path = (d, g, hue, o) => shape(outline(d), g, hue, o);

// Cow, facing left in a 240×150 box with the hooves on y = 150. Back to front, each part one fill.
const COW = [
  ['M124 96C138 92 148 98 146 108C144 122 144 136 145 147C145 151 128 151 128 147C129 134 124 114 124 96Z', 'cols', 'red', { cover: .25, size: 6 }],
  ['M174 90C188 86 200 92 198 104C196 114 198 122 200 130C201 138 202 143 202 147C202 151 185 151 185 147C186 138 186 128 182 118C178 108 172 98 174 90Z', 'cols', 'red', { cover: .25, size: 6 }],
  ['M208 38C226 36 240 50 241 72C242 86 241 96 240 104L234 104C235 94 236 84 235 72C234 56 224 46 208 46Z', 'diag', 'red', { cover: .6, size: 5 }],
  ['M237 98C244 103 246 117 241 126C236 131 231 124 231 115C231 108 233 101 237 98Z', 'back', 'ink', { cover: .5, size: 5 }],
  ['M70 40C100 28 170 28 206 38C228 44 232 70 226 92C220 108 196 110 170 106C140 112 110 110 90 104C68 100 58 80 60 62C61 50 64 44 70 40Z', 'diag', 'red', { cover: .45 }],
  ['M166 100C176 96 194 98 198 106C198 116 188 120 180 119C172 118 164 110 166 100Z', 'dots', 'pink', { cover: .45, size: 5 }],
  ['M76 88C90 82 106 90 104 104C101 120 100 134 101 147C101 151 82 151 82 147C83 132 78 110 76 88Z', 'cols', 'red', { cover: .5, size: 6 }],
  ['M192 82C210 74 230 84 228 100C226 110 220 116 222 126C224 134 224 142 224 147C224 151 205 151 205 147C206 138 207 130 203 120C196 108 188 94 192 82Z', 'cols', 'red', { cover: .5, size: 6 }],
  ['M92 30C112 26 132 34 130 52C128 70 104 76 92 66C80 56 78 36 92 30Z', 'back', 'ink', { cover: .42 }],
  ['M176 44C192 36 214 44 214 62C214 80 194 90 180 82C166 74 162 52 176 44Z', 'back', 'ink', { cover: .42 }],
  ['M134 84C144 78 158 82 158 92C158 104 142 110 134 104C128 98 128 88 134 84Z', 'back', 'ink', { cover: .42 }],
  ['M60 28C72 28 80 40 76 56C70 78 42 92 18 90C4 89 -2 76 4 66C14 52 28 40 42 31C48 27 54 27 60 28Z', 'rows', 'red', { cover: .42, size: 6 }],
  ['M-2 70C4 62 18 64 22 74C24 86 12 92 3 88C-4 84 -6 76 -2 70Z', 'dots', 'pink', { cover: .45, size: 5 }],
  ['M56 34C66 25 80 30 77 40C68 46 60 44 56 34Z', 'diag', 'red', { cover: .6, size: 5 }],
  ['M44 30C35 24 34 13 41 6C41 15 46 22 52 27Z', 'rows', 'ink', { cover: .6, size: 4 }],
];
function cow({ x, y, s = 1, far = false }) {
  const place = ([px, py]) => [x + s * px, y + s * (py - 150)];
  return COW.map(([d, g, hue, o]) => shape(outline(d).map(place), ...(far ? ['dots', 'ink', { cover: .4, size: 4 }] : [g, hue, { ...o, size: o.size ?? 10 }]))).join('')
    + (far ? '' : `<i class="eye" style="${box(...place([27.4, 51.4]), 5.2 * s, 5.2 * s)}"></i>`);
}

const parts = () => [
  // sky, sun, clouds
  `<i class="fade" style="${box(0, 0, W, 300)}">${(([cls, vars]) => `<i class="${cls}" style="inset:0;${vars}"></i>`)(ink('rows', 'sky', { cover: .1, size: 12 }))}</i>`,
  `<i class="round" style="${box(320, 140, 200, 200)}">${turning(320, 140, 200, 200, ...ink('rows', 'orange', { cover: .3, size: 11 }), { rot: 4, drift: [3, 24] })}</i>`,
  path(blob(150, 120, 96, 34, 1, 9, .22), 'dots', 'pink', { cover: .22 }), path(blob(210, 138, 80, 26, 2, 9, .22), 'dots', 'sky', { cover: .22, size: 8.7 }),
  path(blob(900, 104, 120, 38, 5, 9, .22), 'dots', 'pink', { cover: .22 }), path(blob(980, 126, 92, 30, 7, 9, .22), 'dots', 'sky', { cover: .22, size: 8.7 }),
  // sierras
  path('M0 262C120 230 200 250 300 236S470 200 560 232S760 262 860 240S1080 214 1200 246V304H0Z', 'diag', 'blue', { cover: .2 }),
  path('M0 282C160 250 260 284 420 262S640 240 760 268S1000 284 1200 258V308H0Z', 'diag', 'purple', { cover: .2, size: 8.6, rot: -5, at: [600, 280], drift: [1.5, 28] }),
  // fields
  path(`M0 296C300 280 700 304 1200 288V340H0Z`, 'cols', 'green', { cover: .16 }),
  path(`M0 326C260 304 520 344 800 322S1080 310 1200 320V384H0Z`, 'squiggle', 'yellow', { cover: .22 }),
  path(`M0 366C200 350 460 384 720 366S1040 356 1200 372V${H}H0Z`, 'zigzag', 'green', { cover: .16 }),
  cow({ x: 500, y: 346, s: .3, far: true }),
  // ombú
  path('M132 410C162 402 176 380 180 346C182 326 172 306 160 290L172 284C184 298 192 306 198 306C204 300 208 284 212 262L224 264C222 290 222 304 228 310C240 304 254 296 266 284L274 294C258 308 238 322 232 346C230 380 240 402 268 410C230 416 170 416 132 410Z', 'cols', 'bark', { cover: .5, size: 5 }),
  path(blob(140, 286, 78, 60, 4, 9, .18), 'scales', 'green', { cover: .34 }),
  path(blob(236, 252, 86, 66, 9, 9, .18), 'scales', 'sky', { cover: .34, size: 8.7 }),
  path(blob(290, 308, 62, 46, 6, 9, .18), 'scales', 'green', { cover: .34, size: 7.4 }),
  // the cow
  cow({ x: 650, y: 420, s: 1.25 }),
];

export const pampa = () => `<div class="pampa" role="img" aria-label="A cow in the pampa, drawn in achura textures">\n${parts().map(p => `      ${p}\n`).join('')}    </div>`;
