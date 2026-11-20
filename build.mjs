import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { GLYPHS } from './achura.js';
import { STEPS, css } from './css.js';
import { pampa } from './docs/footer/pampa.js';

const read = f => readFileSync(new URL(`./${f}`, import.meta.url), 'utf8');

const weights = () => ['<span>cover %</span>' + STEPS.map(s => `<span>${s}</span>`).join(''),
  ...GLYPHS.map(g => `<code>${g.name}</code>` + STEPS.map(s => `<i class="tint w${s} achura achura-${g.name}-${s}"></i>`).join(''))]
  .map(l => `      ${l}\n`).join('');

// index.html keeps its cover table and its footer between comments, so the page is plain markup.
const fill = (html, name, body) => html.replace(new RegExp(`(<!--${name}-->\n)[^]*?( *<!--/${name}-->)`), (_, a, b) => a + body + b);
export const outputs = () => ({
  'achura.css': css() + '\n',
  'index.html': fill(fill(read('index.html'), 'weights', weights()), 'pampa', `    ${pampa()}\n`),
});

if (process.argv[1] === fileURLToPath(import.meta.url)) for (const [f, out] of Object.entries(outputs())) {
  writeFileSync(new URL(`./${f}`, import.meta.url), out);
  console.log(`${f} ${out.length} B`);
}
