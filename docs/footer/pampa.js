// The site's footer: a cow in the pampa. Every layer is one shape with one achura fill, printed see-through,
// so the only mixing is where shapes overlap. Colors come from the page's --sky, --red… custom properties.
import { pattern } from '../../achura.js';
import { shade } from '../../shade.js';

let n = 0;
const defs = [];
// A texture in one ink. `at` is the point it turns around; `drift` is [degrees, seconds].
function tex(g, hue, { cover = .28, size = 8, rot = 0, at = [0, 0], drift } = {}) {
  const id = `pampa-${n++}`;
  const attrs = `patternTransform="rotate(${rot} ${at})"` + (drift ? ` data-drift="${rot},${at},${drift}"` : '');
  defs.push(`<g style="color:var(--${hue})">${pattern(shade(g, cover), { id, size, ink: 'currentColor' }).replace('<pattern ', `<pattern ${attrs} `)}</g>`);
  return `style="mix-blend-mode:var(--blend,multiply)" fill="url(#${id})"`;
}
const W = 1200, H = 440;
const f = v => +v.toFixed(1);

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
const shape = (d, fill) => `<path d="${d}" ${fill}/>`;

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
function cow({ x, y, s = 1, flip = false, far = false }) {
  const place = flip ? `translate(${x + 240 * s} ${y}) scale(${-s} ${s}) translate(0 -150)` : `translate(${x} ${y}) scale(${s}) translate(0 -150)`;
  const one = far && tex('dots', 'ink', { cover: .4, size: 4 / s });
  return `<g transform="${place}">`
    + COW.map(([d, g, hue, o]) => shape(d, one || tex(g, hue, { ...o, size: (o.size ?? 10) / s }))).join('')
    + (far ? '' : `<circle cx="30" cy="54" r="2.6" style="fill:var(--ink)"/>`) + '</g>';
}

const parts = [
  // sky, sun, clouds
  `<rect width="${W}" height="300" mask="url(#pampa-fade)" ${tex('rows', 'sky', { cover: .1, size: 12 })}/>`,
  `<circle cx="420" cy="240" r="100" ${tex('rows', 'orange', { cover: .3, size: 11, rot: 4, at: [420, 240], drift: [3, 24] })}/>`,
  shape(blob(150, 120, 96, 34, 1, 9, .22), tex('dots', 'pink', { cover: .22 })), shape(blob(210, 138, 80, 26, 2, 9, .22), tex('dots', 'sky', { cover: .22, size: 8.7 })),
  shape(blob(900, 104, 120, 38, 5, 9, .22), tex('dots', 'pink', { cover: .22 })), shape(blob(980, 126, 92, 30, 7, 9, .22), tex('dots', 'sky', { cover: .22, size: 8.7 })),
  // sierras
  shape('M0 262C120 230 200 250 300 236S470 200 560 232S760 262 860 240S1080 214 1200 246V304H0Z', tex('diag', 'blue', { cover: .2 })),
  shape('M0 282C160 250 260 284 420 262S640 240 760 268S1000 284 1200 258V308H0Z', tex('diag', 'purple', { cover: .2, size: 8.6, rot: -5, at: [600, 280], drift: [1.5, 28] })),
  // fields
  shape(`M0 296C300 280 700 304 1200 288V340H0Z`, tex('cols', 'green', { cover: .16 })),
  shape(`M0 326C260 304 520 344 800 322S1080 310 1200 320V384H0Z`, tex('squiggle', 'yellow', { cover: .22 })),
  shape(`M0 366C200 350 460 384 720 366S1040 356 1200 372V${H}H0Z`, tex('zigzag', 'green', { cover: .16 })),
  cow({ x: 500, y: 346, s: .3, far: true }),
  // ombú
  shape('M132 410C162 402 176 380 180 346C182 326 172 306 160 290L172 284C184 298 192 306 198 306C204 300 208 284 212 262L224 264C222 290 222 304 228 310C240 304 254 296 266 284L274 294C258 308 238 322 232 346C230 380 240 402 268 410C230 416 170 416 132 410Z', tex('cols', 'bark', { cover: .5, size: 5 })),
  shape(blob(140, 286, 78, 60, 4, 9, .18), tex('scales', 'green', { cover: .34 })),
  shape(blob(236, 252, 86, 66, 9, 9, .18), tex('scales', 'sky', { cover: .34, size: 8.7 })),
  shape(blob(290, 308, 62, 46, 6, 9, .18), tex('scales', 'green', { cover: .34, size: 7.4 })),
  // the cow
  cow({ x: 650, y: 420, s: 1.25 }),
];

const SVG = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" role="img" aria-label="A cow in the pampa, drawn in achura textures"><defs>`
  + `<linearGradient id="pampa-fg" x2="0" y2="1"><stop offset=".2" stop-color="#000"/><stop offset=".6" stop-color="#fff"/></linearGradient><mask id="pampa-fade"><rect width="${W}" height="300" fill="url(#pampa-fg)"/></mask>`
  + `${defs.join('')}</defs>${parts.join('')}</svg>`;

export function pampa(el) {
  el.innerHTML = SVG;
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const moving = [...el.querySelectorAll('[data-drift]')].map(p => [p, ...p.dataset.drift.split(',').map(Number)]);
  const tick = t => {
    for (const [p, rot, cx, cy, amp, secs] of moving)
      p.setAttribute('patternTransform', `rotate(${(rot + amp * Math.sin(t / 1000 / secs * 2 * Math.PI)).toFixed(3)} ${cx} ${cy})`);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
