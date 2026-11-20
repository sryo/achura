<h1>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/logo/achura-dark.svg">
    <img alt="achura" src="docs/logo/achura-light.svg" width="400">
  </picture>
</h1>

Textures and shades for anything with a fill.

```bash
git clone https://github.com/sryo/achura
```

Link `achura.css`, add `achura` and a texture class such as `achura-dots` to an element with a background, and set `--achura-on` to that background's color. For a lighter or heavier shade add a cover from 10 to 90 in tens: `achura achura-dots-30`. Size is separate from cover: add `achura-x2`, `achura-x3` or `achura-x4` for a tile that many times the size, or set `--achura-size` (8px by default). With no size class, thin textures draw the 10 and 90 steps on a tile twice the size, so their lines get sparser instead of thinner; `achura-x1` turns that off. For any other cover, set `--achura-g` on the `achura` element to what `url(shade('dots', .63))` returns (`url` from `achura.js`, `shade` from `shade.js`), or build a sheet with your own steps with `css({ steps })` from `css.js`. Serve the folder and open `index.html` to see them all.
