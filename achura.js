export const TILE = 8;

export const GLYPHS = [
  { name: 'diag', d: 'M0 7.22 7.22 0H8v.78L.78 8H0zM0 0h.78L0 .78zM8 7.22V8h-.78z' },
  { name: 'dots', d: 'M.6 2a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0-2.8 0zm4 4a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0-2.8 0z' },
  { name: 'back', d: 'M0 0h.78L8 7.22V8h-.78L0 .78zM0 7.22.78 8H0zM7.22 0H8v.78z' },
  { name: 'squiggle', d: 'M-.5 4a2.5 2.5 0 0 1 5 0h-1a1.5 1.5 0 0 0-3 0zm8 0a2.5 2.5 0 0 1 5 0h-1a1.5 1.5 0 0 0-3 0zm-4 0a2.5 2.5 0 0 0 5 0h-1a1.5 1.5 0 0 1-3 0zm-8 0a2.5 2.5 0 0 0 5 0h-1a1.5 1.5 0 0 1-3 0z' },
  { name: 'grid', d: 'M0 0h8v.82H0zM0 .82h.82V8H0z' },
  { name: 'zigzag', d: 'M4.75 0 1.25 4l3.5 4h1.5l-3.5-4 3.5-4z' },
  { name: 'hex', d: 'M-2 2.5l4-2 4 2 4-2v.7l-4 2-4-2-4 2zM-2 4.5l4 2 4-2 4 2v.7l-4-2-4 2-4-2zM5.8 3h.4v2h-.4zM1.8 7h.4v2h-.4zM1.8-1h.4v2h-.4z' },
  { name: 'squares', d: 'M2 2h3.5v3.5H2z' },
  { name: 'rings', d: 'M0 2a2 2 0 1 0 4 0a2 2 0 1 0-4 0zM.58 2a1.42 1.42 0 1 1 2.84 0a1.42 1.42 0 1 1-2.84 0zM4 6a2 2 0 1 0 4 0a2 2 0 1 0-4 0zM4.58 6a1.42 1.42 0 1 1 2.84 0a1.42 1.42 0 1 1-2.84 0z' },
  { name: 'rows', d: 'M0 3h8v1.5H0z' },
  { name: 'scales', d: 'M0 4a4 4 0 0 1 8 0h-.53a3.47 3.47 0 0 0-6.94 0zM-4 8a4 4 0 0 1 8 0h-.53a3.47 3.47 0 0 0-6.94 0zM4 8a4 4 0 0 1 8 0h-.53a3.47 3.47 0 0 0-6.94 0z' },
  { name: 'cols', d: 'M3 0h1.5v8H3z' },
  { name: 'cross', d: 'M-.4 8 8-.4 8.4 0 0 8.4zM-.4 0 0-.4 8.4 8 8 8.4z' },
  { name: 'meander', d: 'M0 2h4.88v3H8v.88H4V2.88H.88v3H0z' },
  { name: 'stars', d: 'M4 0a3.82 3.82 0 0 0 4 4a3.82 3.82 0 0 0-4 4a3.82 3.82 0 0 0-4-4a3.82 3.82 0 0 0 4-4z' },
];

const byName = new Map(GLYPHS.map(g => [g.name, g]));

export function glyph(g) {
  const n = GLYPHS.length;
  const found = typeof g === 'string' ? byName.get(g) : Number.isInteger(g) ? GLYPHS[(g % n + n) % n] : typeof g?.d === 'string' && g;
  if (!found) throw new RangeError(typeof g === 'string' ? `achura: no glyph named "${g}"` : 'achura: not a glyph');
  return found;
}

export const name = g => glyph(g).name;

const key = g => glyph(g).key ?? name(g);

const path = (g, attrs) => g.invert
  ? `<path${attrs} fill-rule="evenodd" d="M0 0h${TILE}v${TILE}H0z${g.d}"/>`
  : `<path${attrs} d="${g.d}"/>`;

export function svg(g, { size = TILE, ink = '#000' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${TILE} ${TILE}">${path(glyph(g), ` fill="${ink}"`)}</svg>`;
}

// In an HTML style attribute, escape the double quotes.
export function url(g) {
  g = glyph(g);
  const d = g.invert ? `M0 0h${TILE}v${TILE}H0z${g.d}` : g.d;
  return `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${TILE} ${TILE}'><path${g.invert ? " fill-rule='evenodd'" : ''} d='${d}'/></svg>")`;
}

// `on` is the fill as it looks on screen, so mix a translucent fill with what's behind it. Don't raise the step
// for contrast: it makes the fill look paler. clamp() because older engines lack sign().
export const INK = { mid: 0.6, step: 0.4 };

export function ink(on, { mid = INK.mid, step = INK.step } = {}) {
  const n = v => String(+v.toFixed(6)).replace(/^0\./, '.');
  return `oklch(from ${on} calc(l - clamp(-1,(l - ${n(mid - 1e-6)})*1e9,1)*${n(step)}) c h)`;
}

// currentColor inside a pattern resolves where the pattern is defined, not on the shape it fills, so the ink is
// fixed. For an ink that follows the shape, use mask().
export function pattern(g, { id = `achura-${key(g)}`, size = TILE, ink = '#000', opacity = 1 } = {}) {
  const k = size / TILE;
  return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${size}" height="${size}">${path(glyph(g), ` fill="${ink}"${opacity < 1 ? ` fill-opacity="${opacity}"` : ''}${k !== 1 ? ` transform="scale(${k})"` : ''}`)}</pattern>`;
}

// Duplicate ids or a <base href> break url(#…).
export function mask(g, { id = `achura-${key(g)}-mask`, size = TILE } = {}) {
  return pattern(g, { id: `${id}-p`, size, ink: '#fff' })
    + `<mask id="${id}"><rect x="-1e4" y="-1e4" width="2e4" height="2e4" fill="url(#${id}-p)"/></mask>`;
}

export function keyed(order = GLYPHS.map(g => g.name)) {
  if (!order.length) throw new RangeError('achura: keyed() needs glyphs');
  const seen = new Map();
  return key => {
    if (!seen.has(key)) seen.set(key, order[seen.size % order.length]);
    return seen.get(key);
  };
}
