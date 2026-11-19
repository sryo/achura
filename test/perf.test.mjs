import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { GLYPHS, url } from '../achura.js';
import { raster } from './raster.mjs';
import { STEPS, css } from '../css.js';

// Budgets: optimize to meet them, don't raise them.

test('a glyph url carries little more than its path', () => {
  // Only what a data URI needs escaping is escaped, and the SVG holds nothing a mask doesn't read.
  for (const g of GLYPHS) {
    const extra = url(g).length - g.d.length;
    assert.ok(extra <= 110, `${g.name}: ${extra} B around a ${g.d.length} B path`);
  }
});

test('the stylesheet stays small', () => {
  // A rule is a selector, a data URI and a path; the rest is fixed. Gzipped, a rule is little more than its path's numbers.
  const sheet = css(), rules = GLYPHS.length * STEPS.length, gz = gzipSync(sheet, { level: 9 }).length;
  assert.ok(sheet.length <= 861 + 272 * rules, `${sheet.length} B of ${861 + 272 * rules}`);
  assert.ok(gz <= 600 + 22 * rules, `${gz} B gzipped of ${600 + 22 * rules}`);
});

test('rasterizing is fast', () => {
  // Every glyph at 256 px across, as the slowest tests do, in well under a frame per glyph. The best of five runs,
  // so a busy machine doesn't fail it.
  raster(GLYPHS[0].d, 64);
  let ms = Infinity;
  for (let run = 0; run < 5; run++) {
    const t = performance.now();
    for (const g of GLYPHS) raster(g.d, 256);
    ms = Math.min(ms, performance.now() - t);
  }
  assert.ok(ms <= 8, `${ms.toFixed(1)} ms for ${GLYPHS.length} glyphs`);
});

test('the shipped scripts stay small', () => {
  // Comments ship with the source, so they keep to what the code can't say.
  // achura.js holds each glyph's name and path; shade.js a shape for each; css.js the stylesheet's fixed rules.
  const table = GLYPHS.reduce((n, g) => n + g.name.length + g.d.length + 23, 0);
  for (const [f, max] of [['achura.js', 2808 + table], ['shade.js', 280 * GLYPHS.length], ['css.js', 1760]]) {
    const n = readFileSync(new URL(`../${f}`, import.meta.url)).length;
    assert.ok(n <= max, `${f}: ${n} B of ${max}`);
  }
});
