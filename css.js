import { GLYPHS, TILE, ink, url } from './achura.js';
import { shade } from './shade.js';

// Covers in percent, a class each: achura-dots-30. A glyph's own path is its 20, and inverted its 80.
export const STEPS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

// The tile a step draws on, in tiles: the lightest and heaviest get sparser lines, not thinner ones.
export const coarse = s => Math.min(s, 100 - s) < 15 ? 2 : 1;

export function css({ prefix = 'achura', steps = STEPS } = {}) {
  if (!/^[a-z_][\w-]*$/i.test(prefix)) throw new RangeError(`achura: bad prefix "${prefix}"`);
  const color = `var(--${prefix}-ink,${ink(`var(--${prefix}-on,currentColor)`)})`;
  // --_m is worked out on the element: its ::after can't see --k, which doesn't inherit.
  const m = `var(--${prefix}-g,linear-gradient(#0000,#0000)) 0 0/calc(var(--${prefix}-size,${TILE}px)*var(--${prefix}-k,1))`;
  return `@property --${prefix}-k{syntax:"<number>";inherits:false;initial-value:1}`
    + `:where(.${prefix}){position:relative;--_m:${m}}`
    + `.${prefix}::after{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;`
    + `background:${color};opacity:var(--${prefix}-a,.85);-webkit-mask:var(--_m);mask:var(--_m);`
    + `print-color-adjust:exact;forced-color-adjust:none}`
    + `@media (forced-colors:active){*{--${prefix}-ink:CanvasText!important;--${prefix}-a:1!important}}`
    + `.${prefix}-key{display:inline-block;width:${2 * TILE}px;height:${2 * TILE}px;border-radius:3px;overflow:hidden;vertical-align:-3px}`
    + `.${prefix}-edge::after{right:auto;width:var(--${prefix}-edge,${TILE}px)}`
    + `.${prefix}-ink{fill:${color};opacity:var(--${prefix}-a,.85)}`
    + GLYPHS.map(g => {
      const c = `.${prefix}-${g.name}`, rule = (sel, of, k = 1) => `${sel}{--${prefix}-g:${url(of)}${k > 1 ? `;--${prefix}-k:${k}` : ''}}`;
      return (steps.includes(20) ? '' : rule(c, g)) + steps.map(s => {
        if (!Number.isInteger(s)) throw new RangeError(`achura: bad step ${s}`);
        return s === 20 ? rule(`${c}-20,${c}`, g) : rule(`${c}-${s}`, s === 80 ? { ...g, invert: true } : shade(g, s / 100), coarse(s));
      }).join('');
    }).join('');
}
