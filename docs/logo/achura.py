"""Generates the achura logo: a landscape made only of line textures beside
the name, each letter in a different achura texture, darker letter by letter.

The mark is a sky of cols, a hill of diag and a sun of back; nothing is
outlined, each shape is only where the lines turn and change colour. Shapes
in front cut the lines behind them with masks, so every SVG is transparent.
The name ramps dots, diag, grid, rows, squares and rings from 22% to 90%
cover, in one ink that follows light and dark.

Writes achura-light.svg, achura-dark.svg, achura.svg (follows
prefers-color-scheme) and achura-icon.svg (the mark alone, with coarser
lines so it still reads at 32 px).
"""
import os

# light, dark
SKY = ("#1f8fd0", "#3aa3e6")
HILL = ("#25c27a", "#34d68a")
SUN = ("#e07ad8", "#ea8be2")
INK = ("#18181b", "#f4f4f2")

HILL_D = "M4 66C20 56 30 72 46 62S74 48 96 58V96H4Z"
SUN_C = (64, 34, 16)
FIELD = (4, 4, 92, 92, 18)   # x, y, w, h, corner radius
ANGLE = {"rows": 0, "cols": 90, "diag": -45, "back": 45}

# shade(name, cover) from ../../shade.js, an 8×8 tile; above 50% cover the
# tile is inverted (holes in ink), as the library draws it.
TILES = [
    ("dots", 22, "M.503 2a1.497 1.497 0 1 0 2.994 0a1.497 1.497 0 1 0-2.994 0zM4.503 6a1.497 1.497 0 1 0 2.994 0a1.497 1.497 0 1 0-2.994 0z", False),
    ("diag", 36, "M0 6.56 6.56 0H8v1.44L1.44 8H0zM0 0h1.44L0 1.44zM8 6.56V8h-1.44z", False),
    ("grid", 50, "M0 0h8v2.343H0zM0 2.343h2.343V8H0z", False),
    ("rows", 64, "M0 2.56h8v2.88H0z", True),
    ("squares", 78, "M2.124 2.124h3.752v3.752h-3.752z", True),
    ("rings", 90, "M0 2a2 2 0 1 0 4 0a2 2 0 1 0-4 0zM.273 2a1.727 1.727 0 1 1 3.453 0a1.727 1.727 0 1 1-3.453 0zM4 6a2 2 0 1 0 4 0a2 2 0 1 0-4 0zM4.273 6a1.727 1.727 0 1 1 3.453 0a1.727 1.727 0 1 1-3.453 0z", True),
]
TILE = 8   # tile size in the wordmark, px

# "achura" in Unbounded (SIL OFL 1.1), weight 900, 64 px, outlined at
# baseline 0, one path per letter; total advance and x-height below.
LETTERS = [
    "M35.52 0 33.66 -12.99 35.52 -18.37 33.66 -23.68 35.52 -36.8H52.42L49.86 -18.43L52.42 0ZM38.91 -18.37Q38.27 -12.48 35.74 -8.1Q33.22 -3.71 29.15 -1.28Q25.09 1.15 19.84 1.15Q14.46 1.15 10.4 -1.28Q6.34 -3.71 4.06 -8.13Q1.79 -12.54 1.79 -18.37Q1.79 -24.26 4.06 -28.67Q6.34 -33.09 10.4 -35.52Q14.46 -37.95 19.84 -37.95Q25.09 -37.95 29.15 -35.55Q33.22 -33.15 35.78 -28.77Q38.34 -24.38 38.91 -18.37ZM18.18 -18.37Q18.18 -16.26 19.04 -14.62Q19.9 -12.99 21.47 -12.03Q23.04 -11.07 25.09 -11.07Q27.2 -11.07 29.18 -12.03Q31.17 -12.99 32.67 -14.62Q34.18 -16.26 34.75 -18.37Q34.18 -20.48 32.67 -22.14Q31.17 -23.81 29.18 -24.77Q27.2 -25.73 25.09 -25.73Q23.04 -25.73 21.47 -24.77Q19.9 -23.81 19.04 -22.14Q18.18 -20.48 18.18 -18.37Z",
    "M103.55 -16.19Q103.1 -11.01 99.9 -7.1Q96.7 -3.2 91.55 -1.02Q86.4 1.15 79.94 1.15Q72.9 1.15 67.52 -1.31Q62.14 -3.78 59.14 -8.19Q56.13 -12.61 56.13 -18.37Q56.13 -24.19 59.14 -28.58Q62.14 -32.96 67.52 -35.46Q72.9 -37.95 79.94 -37.95Q86.4 -37.95 91.55 -35.78Q96.7 -33.6 99.9 -29.73Q103.1 -25.86 103.55 -20.61H87.49Q86.91 -23.36 84.9 -24.74Q82.88 -26.11 79.94 -26.11Q77.7 -26.11 76 -25.25Q74.3 -24.38 73.41 -22.66Q72.51 -20.93 72.51 -18.37Q72.51 -15.81 73.41 -14.11Q74.3 -12.42 76 -11.55Q77.7 -10.69 79.94 -10.69Q82.88 -10.69 84.9 -12.19Q86.91 -13.7 87.49 -16.19Z",
    "M107.97 -49.28H124.22V0H107.97ZM136.96 -37.95Q142.34 -37.95 146.11 -35.81Q149.89 -33.66 151.9 -29.79Q153.92 -25.92 153.92 -20.74V0H137.66V-18.43Q137.66 -21.5 135.97 -23.17Q134.27 -24.83 131.2 -24.83Q129.02 -24.83 127.46 -23.97Q125.89 -23.1 125.06 -21.47Q124.22 -19.84 124.22 -17.54L119.42 -19.97Q120.32 -25.98 122.88 -29.98Q125.44 -33.98 129.09 -35.97Q132.74 -37.95 136.96 -37.95Z",
    "M175.68 1.09Q170.5 1.09 166.78 -1.06Q163.07 -3.2 161.12 -7.07Q159.17 -10.94 159.17 -16.06V-36.8H175.42V-18.37Q175.42 -15.36 176.99 -13.7Q178.56 -12.03 181.44 -12.03Q183.68 -12.03 185.12 -12.83Q186.56 -13.63 187.3 -15.26Q188.03 -16.9 188.03 -19.26L192.83 -16.83Q192 -10.88 189.47 -6.88Q186.94 -2.88 183.39 -0.9Q179.84 1.09 175.68 1.09ZM190.59 0 188.03 -15.68V-36.8H204.29V-13.18L206.85 0Z",
    "M209.54 -36.8H226.18L228.35 -23.81V0H212.1V-24ZM244.61 -37.57V-23.81Q242.43 -24.19 240.7 -24.35Q238.98 -24.51 237.63 -24.51Q235.2 -24.51 233.09 -23.65Q230.98 -22.78 229.66 -20.54Q228.35 -18.3 228.35 -14.14L225.47 -17.73Q226.11 -21.7 227.1 -25.31Q228.1 -28.93 229.76 -31.78Q231.42 -34.62 233.98 -36.29Q236.54 -37.95 240.38 -37.95Q241.34 -37.95 242.37 -37.86Q243.39 -37.76 244.61 -37.57Z",
    "M281.15 0 279.3 -12.99 281.15 -18.37 279.3 -23.68 281.15 -36.8H298.05L295.49 -18.43L298.05 0ZM284.54 -18.37Q283.9 -12.48 281.38 -8.1Q278.85 -3.71 274.78 -1.28Q270.72 1.15 265.47 1.15Q260.1 1.15 256.03 -1.28Q251.97 -3.71 249.7 -8.13Q247.42 -12.54 247.42 -18.37Q247.42 -24.26 249.7 -28.67Q251.97 -33.09 256.03 -35.52Q260.1 -37.95 265.47 -37.95Q270.72 -37.95 274.78 -35.55Q278.85 -33.15 281.41 -28.77Q283.97 -24.38 284.54 -18.37ZM263.81 -18.37Q263.81 -16.26 264.67 -14.62Q265.54 -12.99 267.1 -12.03Q268.67 -11.07 270.72 -11.07Q272.83 -11.07 274.82 -12.03Q276.8 -12.99 278.3 -14.62Q279.81 -16.26 280.38 -18.37Q279.81 -20.48 278.3 -22.14Q276.8 -23.81 274.82 -24.77Q272.83 -25.73 270.72 -25.73Q268.67 -25.73 267.1 -24.77Q265.54 -23.81 264.67 -22.14Q263.81 -20.48 263.81 -18.37Z",
]
WORD_W, WORD_X = 300.16, 36.80


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def lines(pid, kind, cls, period, width):
    """Parallel lines at achura's rows/cols/diag/back angles, width as a share of the period."""
    return (f'<pattern id="{pid}" width="{f(period)}" height="{f(period)}" patternUnits="userSpaceOnUse" '
            f'patternTransform="rotate({ANGLE[kind]})"><rect width="{f(period)}" height="{f(period*width)}" {cls}/></pattern>')


def paint(mode, cls, colours):
    return f'class="{cls}"' if mode == "adaptive" else f'fill="{colours[0 if mode == "light" else 1]}"'


def mark(mode, p="m", coarse=False):
    """Sky, hill and sun in a rounded square; sun cuts hill and sky, hill cuts sky."""
    x, y, w, h, r = FIELD
    cx, cy, cr = SUN_C
    k = 1.6 if coarse else 1.0
    sun = f'<circle cx="{cx}" cy="{cy}" r="{cr}" fill="#000"/>'
    hill = f'<path d="{HILL_D}" fill="#000"/>'
    box = 'x="0" y="0" width="100" height="100"'
    defs = (lines(f"{p}s", "cols", paint(mode, "sky", SKY), 6 * k, .42)
            + lines(f"{p}h", "diag", paint(mode, "hill", HILL), 6 * k, .5)
            + lines(f"{p}d", "back", paint(mode, "sun", SUN), 5 * k, .5)
            + f'<clipPath id="{p}c"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}"/></clipPath>'
            + f'<mask id="{p}ms" maskUnits="userSpaceOnUse" {box}><rect {box} fill="#fff"/>{hill}{sun}</mask>'
            + f'<mask id="{p}mh" maskUnits="userSpaceOnUse" {box}><rect {box} fill="#fff"/>{sun}</mask>')
    body = (f'<g clip-path="url(#{p}c)">'
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="url(#{p}s)" mask="url(#{p}ms)"/>'
            f'<path d="{HILL_D}" fill="url(#{p}h)" mask="url(#{p}mh)"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{cr}" fill="url(#{p}d)"/></g>')
    return defs, body


def word(mode, x0, base, p="w"):
    defs, body = "", ""
    for i, ((name, cover, d, invert), letter) in enumerate(zip(TILES, LETTERS)):
        s = TILE / 8
        tile = f"M0 0h8v8H0z{d}" if invert else d
        rule = ' fill-rule="evenodd"' if invert else ""
        defs += (f'<pattern id="{p}{i}" width="{TILE}" height="{TILE}" patternUnits="userSpaceOnUse" '
                 f'x="{f(x0)}" y="{f(base)}"><path transform="scale({s})" d="{tile}"{rule} '
                 f'{paint(mode, "ink", INK)}/></pattern>')
        body += f'<path transform="translate({f(x0)} {f(base)})" d="{letter}" fill="url(#{p}{i})"/>'
    return defs, body


STYLE = ("<style>.sky{fill:%s}.hill{fill:%s}.sun{fill:%s}.ink{fill:%s}"
         "@media (prefers-color-scheme:dark){.sky{fill:%s}.hill{fill:%s}.sun{fill:%s}.ink{fill:%s}}</style>"
         % (SKY[0], HILL[0], SUN[0], INK[0], SKY[1], HILL[1], SUN[1], INK[1]))


def logo(mode, gap=26):
    s = 0.92
    md, mb = mark(mode)
    base = 46 + WORD_X / 2
    x0 = 100 * s + gap
    wd, wb = word(mode, x0, base)
    vb = (-4, -4, x0 + WORD_W + 12, 100)
    style = STYLE if mode == "adaptive" else ""
    return svg(vb, f"{style}<defs>{md}{wd}</defs><g transform=\"scale({s})\">{mb}</g>{wb}")


def icon():
    md, mb = mark("adaptive", "i", coarse=True)
    return svg((0, 0, 100, 100), f"{STYLE}<defs>{md}</defs>{mb}")


def svg(vb, inner):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{" ".join(f(v) for v in vb)}" '
            f'width="{f(vb[2]*2)}" height="{f(vb[3]*2)}">{inner}</svg>\n')


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    out = {"achura-light.svg": logo("light"), "achura-dark.svg": logo("dark"),
           "achura.svg": logo("adaptive"), "achura-icon.svg": icon()}
    for name, text in out.items():
        with open(os.path.join(here, name), "w") as fh:
            fh.write(text)


if __name__ == "__main__":
    main()
