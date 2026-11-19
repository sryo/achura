import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { GLYPHS } from './achura.js';
import { STEPS, css } from './css.js';

const read = f => readFileSync(new URL(`./${f}`, import.meta.url), 'utf8');

const weights = () => ['<span>cover %</span>' + STEPS.map(s => `<span>${s}</span>`).join(''),
  ...GLYPHS.map(g => `<code>${g.name}</code>` + STEPS.map(s => `<i class="tint w${s} achura achura-${g.name}-${s}"></i>`).join(''))]
  .map(l => `      ${l}\n`).join('');

// index.html keeps its cover table between two comments, so the page is plain markup.
export const outputs = () => ({
  'achura.css': css() + '\n',
  'index.html': read('index.html').replace(/(<!--weights-->\n)[^]*?( *<!--\/weights-->)/, (_, a, b) => a + weights() + b),
});

if (process.argv[1] === fileURLToPath(import.meta.url)) for (const [f, out] of Object.entries(outputs())) {
  writeFileSync(new URL(`./${f}`, import.meta.url), out);
  console.log(`${f} ${out.length} B`);
}
