#!/usr/bin/env python3
# Passport Covers v3 — illustrated, collectible icons. Direction from the
# user's reference sheet: full painterly scenes behind the mark, porcelain
# white W with coloured pin-holes for legibility, grain + bokeh + vignette
# for depth. Mark geometry identical to the approved icon.
import colorsys, math, os, subprocess, random
from PIL import Image, ImageDraw

S = "/tmp/claude-0/-home-user-explorer/934adb10-f9e4-5d5b-ba33-bf901765bb7b/scratchpad"
OUT = "/home/user/explorer/mobile/assets/icons/covers"
os.makedirs(OUT, exist_ok=True)
CHROME = "/opt/pw-browsers/chromium"

PIN_XY = [(178, 302), (340, 688), (512, 415), (685, 695), (852, 300)]
R_BALL, TIP_DY, R_HOLE, LINE_W = 88, 118, 36, 54
rng = random.Random(7)


def lighten(hexc, f):
    r, g, b = int(hexc[1:3], 16), int(hexc[3:5], 16), int(hexc[5:7], 16)
    if f >= 0:
        r, g, b = [round(c + (255 - c) * f) for c in (r, g, b)]
    else:
        r, g, b = [round(c * (1 + f)) for c in (r, g, b)]
    return f"#{r:02X}{g:02X}{b:02X}"


def pin_path(cx, cy):
    r = R_BALL
    return (f"M{cx},{cy + TIP_DY} C{cx - r * 0.62},{cy + TIP_DY * 0.52} {cx - r},{cy + r * 0.42} {cx - r},{cy} "
            f"A{r},{r} 0 1 1 {cx + r},{cy} C{cx + r},{cy + r * 0.42} {cx + r * 0.62},{cy + TIP_DY * 0.52} {cx},{cy + TIP_DY} Z")


def w_line():
    return "M" + " L".join(f"{x},{y}" for x, y in PIN_XY)


def sparkle4(x, y, s):
    k = 0.16 * s
    return (f"M{x} {y - s} Q{x + k} {y - k} {x + s} {y} Q{x + k} {y + k} {x} {y + s} "
            f"Q{x - k} {y + k} {x - s} {y} Q{x - k} {y - k} {x} {y - s} Z")


FILTERS = (
    '<filter id="soft" x="-40%" y="-40%" width="180%" height="180%">'
    '<feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity="0.42"/></filter>'
    '<filter id="linesh" x="-40%" y="-40%" width="180%" height="180%">'
    '<feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#000" flood-opacity="0.36"/></filter>'
    '<filter id="glow" x="-80%" y="-80%" width="260%" height="260%">'
    '<feGaussianBlur stdDeviation="14" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    '<filter id="bigglow" x="-120%" y="-120%" width="340%" height="340%">'
    '<feGaussianBlur stdDeviation="34" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    '<filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>'
    '<filter id="blur12"><feGaussianBlur stdDeviation="12"/></filter>'
    '<filter id="blur24"><feGaussianBlur stdDeviation="24"/></filter>'
    '<filter id="grainf"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>'
    '<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.6 0.6 0.6 0 0"/>'
    '<feComposite operator="in" in2="SourceGraphic"/></filter>'
    '<filter id="wobble"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" result="n"/>'
    '<feDisplacementMap in="SourceGraphic" in2="n" scale="26"/></filter>'
)


def grain(op=0.05):
    return f'<rect width="1024" height="1024" fill="#fff" filter="url(#grainf)" opacity="{op}"/>'


def vignette(op=0.38):
    return ('<radialGradient id="vig" cx="0.5" cy="0.46" r="0.75">'
            '<stop offset="0.55" stop-color="#000" stop-opacity="0"/>'
            f'<stop offset="1" stop-color="#000" stop-opacity="{op}"/></radialGradient>',
            '<rect width="1024" height="1024" fill="url(#vig)"/>')


def gloss():
    return ('<linearGradient id="glossg" x1="0" y1="0" x2="0.3" y2="1">'
            '<stop offset="0" stop-color="#fff" stop-opacity="0.16"/>'
            '<stop offset="0.5" stop-color="#fff" stop-opacity="0.02"/>'
            '<stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>',
            '<path d="M0,0 H1024 V280 Q512,450 0,310 Z" fill="url(#glossg)"/>')


def bokeh(colors, n=10, seed=21, rmin=18, rmax=64, op=(0.10, 0.30)):
    rng.seed(seed)
    out = []
    for i in range(n):
        x, y = rng.uniform(20, 1004), rng.uniform(20, 1004)
        r = rng.uniform(rmin, rmax)
        c = colors[i % len(colors)]
        out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.0f}" fill="{c}" opacity="{rng.uniform(*op):.2f}" filter="url(#blur12)"/>')
    return "".join(out)


def radial_bg(stops, cy=0.3):
    inner = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<radialGradient id="bg" cx="0.5" cy="{cy}" r="1.05">{inner}</radialGradient>', '<rect width="1024" height="1024" fill="url(#bg)"/>'


def linear_bg(stops, x2=0.35, y2=1.0):
    inner = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<linearGradient id="bg" x1="0" y1="0" x2="{x2}" y2="{y2}">{inner}</linearGradient>', '<rect width="1024" height="1024" fill="url(#bg)"/>'


# ---- the porcelain mark ------------------------------------------------------

LINE_GRAD = ('<linearGradient id="lg" x1="0" y1="0" x2="0" y2="1024" gradientUnits="userSpaceOnUse">'
             '<stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D7DCE8"/></linearGradient>')
PIN_GRAD = ('<linearGradient id="porc" x1="0" y1="0" x2="0" y2="1">'
            '<stop offset="0" stop-color="#FFFFFF"/><stop offset="0.62" stop-color="#F2F4F9"/>'
            '<stop offset="1" stop-color="#C6CCDB"/></linearGradient>')


def porcelain_mark(hole_colors, line="url(#lg)", pins_fill="url(#porc)", eye_dark=None, extra_on_line=""):
    """White porcelain W with coloured pin-holes (the collection's signature).
    hole_colors: 5 colours; eye_dark: indices whose holes are dark cut-outs."""
    body = []
    # grounded contact shadow under the whole mark
    body.append(f'<path d="{w_line()}" fill="none" stroke="#000" stroke-width="{LINE_W + 26}" stroke-linecap="round" stroke-linejoin="round" opacity="0.20" filter="url(#blur24)" transform="translate(0,26)"/>')
    body.append(f'<path d="{w_line()}" fill="none" stroke="{line}" stroke-width="{LINE_W}" stroke-linecap="round" stroke-linejoin="round" filter="url(#linesh)"/>')
    # bevel highlight along the top of the line
    body.append(f'<path d="{w_line()}" fill="none" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" opacity="0.55" transform="translate(0,-13)"/>')
    if extra_on_line:
        body.append(extra_on_line)
    for i, hc in enumerate(hole_colors):
        cx, cy = PIN_XY[i]
        dark = eye_dark and i in eye_dark
        body.append(
            f'<g filter="url(#soft)">'
            f'<path d="{pin_path(cx, cy)}" fill="{pins_fill}"/>'
            f'<path d="{pin_path(cx, cy)}" fill="none" stroke="#FFFFFF" stroke-width="7" opacity="0.75"/>'
            f'<ellipse cx="{cx - 32}" cy="{cy - 44}" rx="27" ry="15" fill="#fff" opacity="0.85" transform="rotate(-24 {cx - 32} {cy - 44})"/>'
            + (f'<circle cx="{cx}" cy="{cy}" r="{R_HOLE}" fill="{hc}"/>' if not dark else f'<circle cx="{cx}" cy="{cy}" r="{R_HOLE + 4}" fill="{hc}"/>')
            + (f'<circle cx="{cx}" cy="{cy}" r="{R_HOLE}" fill="none" stroke="#000" stroke-opacity="0.22" stroke-width="6"/>' if not dark else '')
            + (f'<circle cx="{cx - 11}" cy="{cy - 12}" r="9" fill="#fff" opacity="{0.5 if not dark else 0.9}"/>')
            + '</g>')
    return body


# ---- scene primitives --------------------------------------------------------

def hills(bands):
    """bands: list of (baseY, amp, color, opacity, blur?)."""
    out = []
    for i, b in enumerate(bands):
        y, amp, col, op = b[:4]
        blur = b[4] if len(b) > 4 else None
        f = f' filter="url(#{blur})"' if blur else ''
        out.append(f'<path d="M-60,{y} Q200,{y - amp} 460,{y} T1090,{y - amp * 0.4} V1120 H-60 Z" fill="{col}" opacity="{op}"{f}/>')
    return "".join(out)


def cloud(x, y, s, col="#FFFFFF", op=0.9, shade="#C9D4E8"):
    return (f'<g transform="translate({x},{y}) scale({s})" opacity="{op}">'
            f'<ellipse cx="0" cy="10" rx="120" ry="34" fill="{shade}"/>'
            f'<circle cx="-55" cy="-4" r="42" fill="{col}"/><circle cx="0" cy="-24" r="56" fill="{col}"/>'
            f'<circle cx="58" cy="-2" r="44" fill="{col}"/><ellipse cx="0" cy="6" rx="118" ry="30" fill="{col}"/></g>')


def pine(x, y, s, col="#123B2A", snow=None):
    layers = f'<path d="M0,-120 L34,-58 H-34 Z" fill="{col}"/><path d="M0,-84 L44,-8 H-44 Z" fill="{col}"/><path d="M0,-44 L54,44 H-54 Z" fill="{col}"/><rect x="-8" y="44" width="16" height="22" fill="#2E1D12"/>'
    snowcap = f'<path d="M0,-120 L20,-84 H-20 Z" fill="{snow}"/><path d="M0,-84 L26,-52 H-26 Z" fill="{snow}" opacity="0.8"/>' if snow else ''
    return f'<g transform="translate({x},{y}) scale({s})">{layers}{snowcap}</g>'


def stars(n=30, color="#FFFFFF", seed=3, y1=640, glints=((150, 150, 24, .9), (880, 120, 17, .8), (764, 540, 13, .55))):
    rng.seed(seed)
    dots = "".join(f'<circle cx="{rng.uniform(30, 994):.0f}" cy="{rng.uniform(30, y1):.0f}" r="{rng.uniform(2, 5.5):.1f}" fill="{color}" opacity="{rng.uniform(0.3, 0.9):.2f}"/>' for _ in range(n))
    gl = "".join(f'<path d="{sparkle4(x, y, s)}" fill="{color}" opacity="{o}"/>' for x, y, s, o in glints)
    return dots + gl


def leafy_corner(x, y, rot, cols, scale=1.0):
    """Framing foliage cluster (reference-style corners)."""
    leaves = []
    rng.seed(int(x + y))
    for i in range(6):
        a = rot + i * 26 - 60 + rng.uniform(-8, 8)
        L = 220 * scale * rng.uniform(0.75, 1.15)
        w = 62 * scale * rng.uniform(0.8, 1.1)
        col = cols[i % len(cols)]
        leaves.append(
            f'<g transform="translate({x},{y}) rotate({a:.0f})">'
            f'<path d="M0,0 Q{w},{-L * 0.35} 0,{-L} Q{-w},{-L * 0.35} 0,0 Z" fill="{col}"/>'
            f'<path d="M0,-14 L0,{-L + 18}" stroke="{lighten(col, 0.28)}" stroke-width="7" opacity="0.8"/></g>')
    return "".join(leaves)


# ---- scenes ------------------------------------------------------------------

def scene_midnight():
    bg = radial_bg([(0, "#42507A"), (0.5, "#1B2138"), (1, "#06070F")])
    crescent = ('<mask id="cres"><rect width="1024" height="1024" fill="#000"/>'
                '<circle cx="836" cy="150" r="92" fill="#fff"/><circle cx="796" cy="124" r="78" fill="#000"/></mask>'
                '<rect width="1024" height="1024" fill="#F5EFDA" mask="url(#cres)" opacity="0.95"/>'
                '<circle cx="852" cy="164" r="160" fill="#F5EFDA" opacity="0.10" filter="url(#blur24)"/>')
    sky = stars(30, y1=460) + crescent

    def block(x, w, h, col, wincol, seed, lit):
        rng.seed(seed)
        out = [f'<rect x="{x}" y="{1024 - h}" width="{w}" height="{h}" rx="5" fill="{col}"/>']
        for r in range(int((h - 70) // 48)):
            for c in range(int((w - 22) // 34)):
                if rng.random() < lit:
                    out.append(f'<rect x="{x + 14 + c * 34}" y="{1024 - h + 28 + r * 48}" width="16" height="24" rx="2" fill="{wincol}" opacity="{rng.uniform(0.7, 1.0):.2f}"/>')
        return "".join(out)

    backrow = "".join(block(x, w, h, "#2E3A61", "#8FA3D9", i + 60, 0.42)
                      for i, (x, w, h) in enumerate([(-20, 92, 340), (82, 74, 430), (166, 100, 300), (276, 78, 490), (468, 82, 370), (562, 98, 310), (700, 78, 460), (924, 104, 370)]))
    frontrow = "".join(block(x, w, h, "#131A30", "#FFDF8C", i + 80, 0.66)
                       for i, (x, w, h) in enumerate([(16, 104, 265), (130, 86, 350), (326, 98, 255), (428, 82, 310), (614, 104, 265), (728, 90, 340), (832, 98, 245), (952, 76, 305)]))
    spire = ('<rect x="311" y="462" width="8" height="76" fill="#2A3357"/><circle cx="315" cy="456" r="7" fill="#F25D5D"/>'
             '<rect x="735" y="514" width="7" height="56" fill="#2A3357"/><circle cx="738" cy="508" r="6" fill="#F25D5D" opacity="0.8"/>')
    haze = '<rect x="0" y="720" width="1024" height="304" fill="#0A0E1E" opacity="0.30" filter="url(#blur24)"/>'
    return bg, sky + backrow + spire + frontrow + haze, ["#FD3D62", "#01C9B7", "#FE9D04", "#9261FB", "#2583FE"]


def scene_pearl():
    bg = radial_bg([(0, "#FFFFFF"), (0.55, "#F3EDDD"), (1, "#D9CCA9")])
    silk = ('<g filter="url(#wobble)">'
            '<path d="M-60,700 Q260,600 560,700 T1100,660 V1120 H-60 Z" fill="#E9DFC6" opacity="0.8"/>'
            '<path d="M-60,820 Q300,740 640,820 T1100,790 V1120 H-60 Z" fill="#DCCEA9" opacity="0.85"/></g>'
            '<circle cx="270" cy="230" r="210" fill="#FFFFFF" opacity="0.55" filter="url(#blur24)"/>'
            + "".join(f'<path d="{sparkle4(x, y, s)}" fill="#C9A86A" opacity="{o}"/>' for x, y, s, o in [(830, 180, 16, .7), (150, 560, 11, .5), (900, 620, 12, .55)]))
    return bg, silk, ["#C9A86A"] * 5


def scene_earth():
    bg = linear_bg([(0, "#BFE0F0"), (0.45, "#8FC2A6"), (1, "#4E7A3A")])
    sun = '<circle cx="200" cy="170" r="90" fill="#FFF4CE" opacity="0.9" filter="url(#blur6)"/>'
    clouds = cloud(700, 160, 0.8, op=0.95) + cloud(420, 240, 0.5, op=0.8)
    land = hills([(640, 90, "#7FA95B", 0.9), (760, 70, "#5D8A42", 0.95), (880, 60, "#3F672C", 1.0)])
    trees = "".join(pine(x, y, s, "#2E5222") for x, y, s in [(120, 800, 0.7), (220, 830, 0.5), (860, 790, 0.65), (950, 830, 0.5)])
    return bg, sun + clouds + land + trees, ["#4E7A3A", "#FE9D04", "#7FA95B", "#8B5A2B", "#2583FE"]


def scene_sunset():
    bg = linear_bg([(0, "#FFD98A"), (0.4, "#FF9A5A"), (0.72, "#F45B69"), (1, "#7E2B5E")], x2=0, y2=1)
    sun = ('<circle cx="512" cy="430" r="200" fill="#FFE9B8" opacity="0.95"/>'
           '<rect x="292" y="430" width="440" height="16" fill="#FF9A5A" opacity="0.7"/>'
           '<rect x="312" y="472" width="400" height="12" fill="#FF9A5A" opacity="0.55"/>'
           '<circle cx="512" cy="430" r="260" fill="#FFE9B8" opacity="0.25" filter="url(#blur24)"/>')
    clouds = cloud(220, 210, 0.7, "#FFD9B8", 0.9, "#E8927C") + cloud(820, 300, 0.9, "#FFD9B8", 0.85, "#E8927C")
    birds = '<path d="M300,180 q14,-14 28,0 q14,-14 28,0" stroke="#5E2340" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M700,140 q11,-11 22,0 q11,-11 22,0" stroke="#5E2340" stroke-width="6" fill="none" stroke-linecap="round"/>'
    sea = hills([(830, 40, "#B23A63", 0.85), (920, 30, "#7E2B5E", 0.95)])
    return bg, sun + clouds + birds + sea, ["#F45B69", "#FE9D04", "#FFD166", "#B23A63", "#FF8552"]


def scene_ocean():
    bg = linear_bg([(0, "#5FD8E8"), (0.5, "#1590C4"), (1, "#083D6E")], x2=0, y2=1)
    shafts = ('<g opacity="0.35" filter="url(#blur24)">'
              '<path d="M240,-40 L420,-40 L300,560 L180,560 Z" fill="#BFF3FF"/>'
              '<path d="M600,-40 L720,-40 L640,480 L520,480 Z" fill="#BFF3FF" opacity="0.7"/></g>')
    waves = ('<g filter="url(#wobble)">'
             + hills([(700, 60, "#1FA6D0", 0.7), (800, 55, "#1273A8", 0.85), (900, 45, "#0B4C82", 0.95)]) + '</g>'
             + '<path d="M-40,708 Q140,668 320,708 T680,700 T1060,696" stroke="#CFF3FF" stroke-width="10" fill="none" opacity="0.5" stroke-linecap="round"/>')
    rng.seed(31)
    bubbles = "".join(f'<circle cx="{rng.uniform(60, 964):.0f}" cy="{rng.uniform(560, 980):.0f}" r="{rng.uniform(4, 12):.0f}" fill="#DFF7FF" opacity="{rng.uniform(0.25, 0.6):.2f}"/>' for _ in range(12))
    return bg, shafts + waves + bubbles, ["#0B4C82", "#01C9B7", "#1FA2FF", "#2583FE", "#7FE3F0"]


def scene_aurora():
    bg = linear_bg([(0, "#1A2C5C"), (0.55, "#231655"), (1, "#0A0620")], x2=0, y2=1)
    curtains = ('<g filter="url(#wobble)" opacity="0.85">'
                '<path d="M120,-40 Q80,300 220,620 L300,620 Q180,300 240,-40 Z" fill="#45E0A8" opacity="0.5" filter="url(#blur12)"/>'
                '<path d="M420,-40 Q380,260 500,560 L570,560 Q470,260 520,-40 Z" fill="#24D1C3" opacity="0.45" filter="url(#blur12)"/>'
                '<path d="M720,-40 Q690,300 820,600 L890,600 Q770,300 830,-40 Z" fill="#9B7CFF" opacity="0.5" filter="url(#blur12)"/></g>')
    ground = hills([(860, 80, "#131B3D", 1.0)]) + pine(150, 900, 0.8, "#0C1330") + pine(880, 920, 0.7, "#0C1330")
    return bg, curtains + stars(24, seed=8) + ground, ["#45E0A8", "#24D1C3", "#FF5FD2", "#9B7CFF", "#4AB8FF"]


def scene_flyer():
    bg = linear_bg([(0, "#8FBFEF"), (0.6, "#4E7DC0"), (1, "#22406F")], x2=0, y2=1)
    cl = cloud(200, 700, 1.3, op=0.95) + cloud(700, 820, 1.6, op=0.98) + cloud(880, 620, 0.9, op=0.9) + cloud(360, 560, 0.6, op=0.75) + cloud(60, 460, 0.5, op=0.6)
    route = ('<path d="M-30,340 Q260,180 520,260 T1050,150" stroke="#FFFFFF" stroke-width="8" fill="none" stroke-dasharray="2 30" opacity="0.9" stroke-linecap="round"/>'
             '<g transform="translate(910,168) rotate(-14)"><path d="M0,0 L64,10 L0,20 L12,10 Z" fill="#FFFFFF"/><path d="M18,10 L-14,-16 L-2,10 L-14,36 Z" fill="#EDF3FF"/></g>')
    return bg, cl + route, ["#22406F", "#FD3D62", "#2583FE", "#FE9D04", "#4E7DC0"]


def scene_luxury():
    bg = radial_bg([(0, "#3A2F1B"), (0.55, "#171008"), (1, "#070502")])
    silk = ('<g filter="url(#wobble)" opacity="0.9">'
            '<path d="M-60,640 Q240,540 560,660 T1100,600 V1120 H-60 Z" fill="#2A1F0F"/>'
            '<path d="M-60,780 Q300,700 660,800 T1100,760 V1120 H-60 Z" fill="#1C1409"/></g>'
            '<path d="M-60,652 Q240,552 560,672 T1100,612" stroke="#F5D67A" stroke-width="5" fill="none" opacity="0.5"/>')
    rng.seed(13)
    flecks = "".join(f'<circle cx="{rng.uniform(30, 994):.0f}" cy="{rng.uniform(30, 994):.0f}" r="{rng.uniform(2, 5):.1f}" fill="#F2D078" opacity="{rng.uniform(0.3, 0.85):.2f}"/>' for _ in range(34))
    glints = f'<path d="{sparkle4(170, 170, 24)}" fill="#F5D67A" opacity="0.95"/><path d="{sparkle4(866, 540, 15)}" fill="#F5D67A" opacity="0.7"/><path d="{sparkle4(900, 140, 12)}" fill="#F5D67A" opacity="0.6"/>'
    gold = ['<linearGradient id="goldp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9A8"/><stop offset="0.55" stop-color="#E4B851"/><stop offset="1" stop-color="#8A6516"/></linearGradient>',
            '<linearGradient id="goldl" x1="0" y1="0" x2="0" y2="1024" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#C89B32"/></linearGradient>']
    return bg, silk + flecks + bokeh(["#F5D67A"], 8, 40, 20, 46) + glints, ["#171008"] * 5, dict(pins_fill="url(#goldp)", line="url(#goldl)", extra_defs="".join(gold))


def scene_neon():
    bg = linear_bg([(0, "#2A0A45"), (0.55, "#12031F"), (1, "#05010A")], x2=0, y2=1)
    sunset = ('<g><circle cx="512" cy="300" r="190" fill="#FF2ED2" opacity="0.85"/>'
              + "".join(f'<rect x="322" y="{300 + i * 34}" width="380" height="{18 - i * 2}" fill="#12031F"/>' for i in range(5))
              + '<circle cx="512" cy="300" r="230" fill="#FF2ED2" opacity="0.3" filter="url(#blur24)"/></g>')
    grid = ('<g opacity="0.8">'
            + "".join(f'<line x1="0" y1="{660 + i * 56}" x2="1024" y2="{660 + i * 56}" stroke="#4DEEEA" stroke-width="3" opacity="{0.5 - i * 0.055:.2f}"/>' for i in range(7))
            + "".join(f'<line x1="{x}" y1="640" x2="{(x - 512) * 3 + 512:.0f}" y2="1024" stroke="#4DEEEA" stroke-width="3" opacity="0.22"/>' for x in range(0, 1025, 128))
            + '</g>')
    return bg, sunset + grid + stars(14, "#FF9DEB", 19, 260, ()), ["#FF2ED2", "#4DEEEA", "#B026FF", "#FF61A6", "#6A5CFF"]


def scene_sakura():
    bg = radial_bg([(0, "#FFF3F6"), (0.5, "#FBD3DF"), (1, "#EFA3BE")])
    branch = ('<g stroke="#6E4A3A" stroke-linecap="round" fill="none">'
              '<path d="M1060,80 Q820,150 700,120 Q760,150 640,190" stroke-width="26"/>'
              '<path d="M840,120 Q800,190 730,230" stroke-width="14"/>'
              '<path d="M-40,940 Q200,880 330,900" stroke-width="22"/></g>')
    rng.seed(23)
    blossoms = "".join(
        f'<g transform="translate({x:.0f},{y:.0f})">'
        + "".join(f'<circle cx="{18 * math.cos(math.radians(a)):.0f}" cy="{18 * math.sin(math.radians(a)):.0f}" r="15" fill="{c}"/>' for a in range(0, 360, 72))
        + '<circle r="8" fill="#F7C948"/></g>'
        for x, y, c in [(700, 122, "#FF9EC0"), (770, 165, "#FFC1D6"), (652, 182, "#FF7FAD"), (838, 118, "#FFC1D6"), (905, 95, "#FF9EC0"), (250, 892, "#FF9EC0"), (320, 905, "#FFC1D6")])
    rng.seed(11)
    petals = "".join(f'<ellipse cx="{rng.uniform(60, 964):.0f}" cy="{rng.uniform(80, 940):.0f}" rx="{rng.uniform(10, 17):.0f}" ry="{rng.uniform(6, 9):.0f}" fill="{"#FFFFFF" if i % 2 else "#FF8FB3"}" opacity="{rng.uniform(0.5, 0.9):.2f}" transform="rotate({rng.uniform(0, 360):.0f} 512 512)"/>' for i in range(14))
    return bg, branch + blossoms + petals + bokeh(["#FFFFFF", "#FFB8CE"], 8, 33, 24, 60), ["#E14E7E", "#FF8FB3", "#C93A6B", "#F7C948", "#E14E7E"]


def scene_tropical():
    bg = linear_bg([(0, "#37C8A2"), (0.55, "#3FBF63"), (1, "#F5D45C")], x2=0.2, y2=1)
    sun = '<circle cx="850" cy="160" r="110" fill="#FFF3C9" opacity="0.9" filter="url(#blur6)"/>'
    corners = (leafy_corner(-20, -10, 150, ["#0B6B4A", "#0E7F58", "#0A5A3E"], 1.25)
               + leafy_corner(1044, 60, 210, ["#0B6B4A", "#0E7F58"], 1.1)
               + leafy_corner(30, 1040, 55, ["#0A5A3E", "#0E7F58"], 1.2)
               + leafy_corner(1000, 1010, -35, ["#0B6B4A", "#0A5A3E"], 1.15))
    water = '<path d="M-40,930 Q200,900 440,930 T920,925 T1240,930 V1120 H-40 Z" fill="#2AB9D8" opacity="0.75"/><path d="M60,955 h80 M240,970 h60 M520,960 h90 M760,972 h70" stroke="#DFF9FF" stroke-width="8" opacity="0.7" stroke-linecap="round"/>'
    return bg, sun + water + corners, ["#FF6B9A", "#FE9D04", "#2583FE", "#FF8552", "#01C9B7"]


def scene_winter():
    bg = linear_bg([(0, "#EAF4FE"), (0.5, "#C3DCF2"), (1, "#8FB4D9")], x2=0, y2=1)
    halo = '<circle cx="260" cy="200" r="120" fill="#FFFFFF" opacity="0.75" filter="url(#blur24)"/>'
    dunes = hills([(700, 60, "#FFFFFF", 0.85), (820, 50, "#E4EFFA", 0.95), (930, 40, "#CBDEF1", 1.0)])
    pines = pine(140, 780, 0.9, "#5E82B8", "#FFFFFF") + pine(250, 830, 0.6, "#6E92C4", "#FFFFFF") + pine(870, 800, 0.8, "#5E82B8", "#FFFFFF")
    rng.seed(5)
    snow = "".join(f'<circle cx="{rng.uniform(30, 994):.0f}" cy="{rng.uniform(30, 994):.0f}" r="{rng.uniform(3, 8):.1f}" fill="#FFFFFF" opacity="{rng.uniform(0.4, 0.9):.2f}"/>' for _ in range(30))
    return bg, halo + dunes + pines + snow, ["#4A90C9", "#2E6FA3", "#7FB8E8", "#5FA8D9", "#4A90C9"]


def scene_coffee():
    # warm latte tones: caramel light falling from the top, cream everywhere
    bg = radial_bg([(0, "#D9AE7C"), (0.5, "#A9713F"), (1, "#59331A")], cy=0.28)
    cream = ('<g filter="url(#wobble)" opacity="0.9">'
             '<path d="M-60,700 Q240,620 560,700 T1100,650 V1120 H-60 Z" fill="#E8CBA2" opacity="0.55"/>'
             '<path d="M-60,830 Q300,760 660,840 T1100,800 V1120 H-60 Z" fill="#F2E2C8" opacity="0.5"/></g>')
    # top-down latte with rosetta art, lower left
    latte = ('<g transform="translate(228,884)">'
             '<circle r="234" fill="#8A5A32"/><circle r="216" fill="#F5EDE0"/>'
             '<circle r="178" fill="#C98A4E"/>'
             '<g filter="url(#wobble)">'
             '<path d="M0,120 C-96,64 -78,-58 0,-128 C78,-58 96,64 0,120 Z" fill="#F2E6D3"/>'
             '<path d="M0,-128 L0,112" stroke="#C98A4E" stroke-width="12" fill="none" stroke-linecap="round"/>'
             '<path d="M-58,-40 Q0,-4 58,-40 M-64,10 Q0,48 64,10 M-52,58 Q0,92 52,58" stroke="#C98A4E" stroke-width="9" fill="none" stroke-linecap="round"/></g>'
             '<circle r="216" fill="none" stroke="#FFFFFF" stroke-width="10" opacity="0.6"/></g>')
    # to-go cup, right-middle below the pin so it reads fully, kraft sleeve + coral badge
    cup = ('<g transform="translate(842,672) rotate(6)" filter="url(#soft)">'
           '<path d="M-92,-128 L92,-128 L72,196 Q0,220 -72,196 Z" fill="#F7F1E6"/>'
           '<path d="M-92,-128 L-20,-128 L-36,204 Q-58,204 -72,196 Z" fill="#FFFFFF" opacity="0.55"/>'
           '<rect x="-104" y="-168" width="208" height="44" rx="16" fill="#FFFFFF"/>'
           '<rect x="-96" y="-190" width="192" height="28" rx="11" fill="#E5DCCB"/>'
           '<rect x="-30" y="-196" width="60" height="12" rx="6" fill="#C9BFA9"/>'
           '<path d="M-86,-20 L86,-20 L78,110 L-78,110 Z" fill="#B98A5A"/>'
           '<path d="M-86,-20 L86,-20 L84,6 L-84,6 Z" fill="#A9784A"/>'
           '<circle cy="48" r="34" fill="#FF6A55"/><path d="M-14,48 L-4,58 L16,36" stroke="#FFF" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>')
    steam = ('<g stroke="#FFF6E8" fill="none" stroke-linecap="round" opacity="0.6">'
             '<path d="M812,468 Q786,420 812,372 Q838,326 812,282" stroke-width="15" filter="url(#blur6)"/>'
             '<path d="M896,478 Q874,434 896,390" stroke-width="12" filter="url(#blur6)"/></g>')
    rng.seed(9)
    beans = "".join(
        f'<g transform="rotate({rng.uniform(0, 360):.0f} {x:.0f} {y:.0f})" opacity="0.85">'
        f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="27" ry="19" fill="#4A2A12"/>'
        f'<path d="M{x - 3:.0f},{y - 16:.0f} Q{x + 11:.0f},{y:.0f} {x - 3:.0f},{y + 16:.0f}" stroke="#8A5A32" stroke-width="6" fill="none"/></g>'
        for x, y in [(560, 906), (642, 962), (500, 986)])
    return bg, cream + latte + cup + steam + beans + bokeh(["#FFF2DC", "#F2C99A"], 8, 44, 20, 50), ["#8A5A32", "#F2E6D3", "#C98A4E", "#FF6A55", "#6F4423"]


def scene_pride():
    # the full flag, full-bleed — six bold horizontal bands with a silk ripple
    cols = ["#E40303", "#FF8C00", "#FFED00", "#008026", "#24408E", "#732982"]
    h = 1024 / 6
    bands = ('<g filter="url(#wobble)">'
             + "".join(f'<rect x="-60" y="{i * h - 30:.0f}" width="1144" height="{h + 60:.0f}" fill="{c}"/>' for i, c in reversed(list(enumerate(cols))))
             + '</g>')
    seams = "".join(f'<rect x="0" y="{i * h - 9:.0f}" width="1024" height="18" fill="#000" opacity="0.10" filter="url(#blur6)"/>' for i in range(1, 6))
    bg = ("", bands + seams)
    shine = ('<ellipse cx="300" cy="150" rx="420" ry="130" fill="#FFFFFF" opacity="0.22" filter="url(#blur24)" transform="rotate(-16 300 150)"/>'
             '<ellipse cx="820" cy="900" rx="340" ry="110" fill="#000000" opacity="0.12" filter="url(#blur24)" transform="rotate(-14 820 900)"/>')
    glints = "".join(f'<path d="{sparkle4(x, y, s)}" fill="#FFFFFF" opacity="{o}"/>' for x, y, s, o in [(140, 120, 20, .9), (900, 160, 15, .8), (110, 900, 13, .7)])
    return bg, shine + glints, ["#E40303", "#008026", "#FF8C00", "#732982", "#24408E"]


def scene_pride_neon():
    # a glowing neon rainbow arch rising behind the mark, club-dark backdrop
    bg = radial_bg([(0, "#1F0C33"), (0.6, "#0D0418"), (1, "#030108")], cy=0.7)
    cols = ["#FF2A2A", "#FF9500", "#FFE600", "#00E561", "#2E8CFF", "#C438FF"]
    wash = "".join(f'<circle cx="512" cy="1190" r="{945 - i * 48}" stroke="{c}" stroke-width="60" fill="none" opacity="0.16" filter="url(#blur24)"/>' for i, c in enumerate(cols))
    arcs = "".join(f'<circle cx="512" cy="1190" r="{945 - i * 48}" stroke="{c}" stroke-width="26" fill="none" opacity="0.95" filter="url(#glow)"/>' for i, c in enumerate(cols))
    floor = '<ellipse cx="512" cy="1030" rx="620" ry="90" fill="#C438FF" opacity="0.18" filter="url(#blur24)"/>'
    return bg, wash + arcs + floor + stars(20, "#FFD9F5", 37, 360, ((150, 150, 18, .85), (880, 120, 14, .75))), ["#FF2A2A", "#FF9500", "#00E561", "#C438FF", "#2E8CFF"]


def scene_pride_night():
    # quiet pride: navy calm with a soft rainbow aurora and the flag in the line
    bg = radial_bg([(0, "#25365B"), (0.55, "#14213D"), (1, "#080D1C")])
    cols = ["#E40303", "#FF8C00", "#FFED00", "#008026", "#24408E", "#732982"]
    aurora = "".join(f'<path d="M-60,{258 + i * 24} Q512,{136 + i * 24} 1084,{258 + i * 24}" stroke="{c}" stroke-width="22" fill="none" opacity="0.15" filter="url(#blur24)"/>' for i, c in enumerate(cols))
    shoot = ('<path d="M660,190 L866,104" stroke="url(#rain)" stroke-width="9" stroke-linecap="round" opacity="0.9"/>'
             f'<path d="{sparkle4(880, 98, 16)}" fill="#FFFFFF" opacity="0.9"/>')
    ground = hills([(880, 60, "#0C1430", 1.0)])
    rain = ('<linearGradient id="rain" x1="0" y1="0" x2="1" y2="0">'
            + "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in [(0, "#E40303"), (0.2, "#FF8C00"), (0.4, "#FFED00"), (0.6, "#008026"), (0.8, "#24408E"), (1, "#732982")])
            + '</linearGradient>')
    return bg, aurora + stars(30, seed=41) + shoot + ground, ["#F4F1E8"] * 5, dict(line="url(#rain)", extra_defs=rain)


def scene_christmas():
    bg = radial_bg([(0, "#1E7A44"), (0.55, "#0D3B21"), (1, "#04140B")], cy=0.25)
    # one grand decorated tree, centred behind the mark
    rng.seed(77)
    baubles = "".join(
        f'<circle cx="{x}" cy="{y}" r="17" fill="{c}" filter="url(#glow)"/><circle cx="{x - 5}" cy="{y - 6}" r="5" fill="#fff" opacity="0.9"/>'
        for x, y, c in [(-92, -152, "#E43F3F"), (86, -160, "#F2C14E"), (-160, 22, "#6BC4FF"), (150, 14, "#E43F3F"),
                        (-58, -22, "#FF9DE0"), (66, 52, "#F2C14E"), (-220, 190, "#E43F3F"), (216, 182, "#6BC4FF"), (-30, 210, "#F2C14E")])
    tree = ('<g transform="translate(512,556)">'
            '<circle cx="0" cy="-322" r="80" fill="#FFD166" opacity="0.4" filter="url(#bigglow)"/>'
            f'<path d="{sparkle4(0, -322, 46)}" fill="#FFD166"/>'
            '<path d="M0,-296 L152,-118 H-152 Z" fill="#14532E"/>'
            '<path d="M0,-186 L212,44 H-212 Z" fill="#0F4726"/>'
            '<path d="M0,-36 L282,252 H-282 Z" fill="#0B3B1F"/>'
            '<path d="M0,-296 L152,-118 H-152 Z M0,-186 L212,44 H-212 Z M0,-36 L282,252 H-282 Z" fill="#FFFFFF" opacity="0.07"/>'
            '<path d="M-118,-142 Q0,-92 120,-146" stroke="#F2C14E" stroke-width="11" fill="none" opacity="0.95"/>'
            '<path d="M-178,12 Q0,72 180,6" stroke="#F2C14E" stroke-width="11" fill="none" opacity="0.95"/>'
            '<path d="M-246,176 Q0,244 248,170" stroke="#F2C14E" stroke-width="11" fill="none" opacity="0.95"/>'
            + baubles +
            '<rect x="-34" y="252" width="68" height="66" rx="10" fill="#4A2E18"/></g>')
    gifts = ('<g transform="translate(320,962)"><rect x="-64" y="-74" width="128" height="74" rx="10" fill="#B3252F"/>'
             '<rect x="-10" y="-74" width="20" height="74" fill="#F2C14E"/><rect x="-64" y="-46" width="128" height="16" fill="#F2C14E"/>'
             '<path d="M-24,-74 Q-30,-104 0,-96 Q30,-104 24,-74 Z" fill="#F2C14E"/></g>'
             '<g transform="translate(700,972)"><rect x="-52" y="-60" width="104" height="60" rx="9" fill="#2E6FA3"/>'
             '<rect x="-8" y="-60" width="16" height="60" fill="#EAF7EF"/></g>')
    sidepines = pine(92, 880, 1.0, "#0B2E1A", "#EAF7EF") + pine(936, 900, 0.9, "#0B2E1A", "#EAF7EF")
    rng.seed(5)
    snow = "".join(f'<circle cx="{rng.uniform(30, 994):.0f}" cy="{rng.uniform(30, 994):.0f}" r="{rng.uniform(3.5, 8):.1f}" fill="#FFFFFF" opacity="{rng.uniform(0.4, 0.9):.2f}"/>' for _ in range(34))
    # fairy lights: glowing bulbs strung along the W line itself
    cols = ["#FFD166", "#FF6B6B", "#7BE07B", "#6BC4FF", "#FF9DE0"]
    bulbs = []
    k = 0
    for (x1, y1), (x2, y2) in zip(PIN_XY, PIN_XY[1:]):
        for t in (0.28, 0.5, 0.72):
            qx, qy = x1 + (x2 - x1) * t, y1 + (y2 - y1) * t
            c = cols[k % len(cols)]
            bulbs.append(f'<circle cx="{qx:.0f}" cy="{qy:.0f}" r="20" fill="{c}" filter="url(#glow)"/>'
                         f'<circle cx="{qx - 6:.0f}" cy="{qy - 7:.0f}" r="6" fill="#fff" opacity="0.9"/>')
            k += 1
    lights = "".join(bulbs)
    warm = bokeh(["#FFD166", "#F2C14E"], 8, 61, 16, 40, (0.12, 0.3))
    return bg, tree + gifts + sidepines + snow + warm, ["#E43F3F", "#F2C14E", "#3FA46A", "#E43F3F", "#F2C14E"], dict(extra_on_line=lights)


def scene_candy():
    # white candy base with bold glossy red cane stripes (reference tile #92)
    bg = radial_bg([(0, "#FFFFFF"), (0.6, "#FBF2EE"), (1, "#EFD4CC")], cy=0.35)
    grad = ('<linearGradient id="canes" x1="0" y1="0" x2="1" y2="0">'
            '<stop offset="0" stop-color="#F25B6C"/><stop offset="0.35" stop-color="#DE2B40"/>'
            '<stop offset="1" stop-color="#B01D30"/></linearGradient>')
    stripes = ['<g transform="rotate(28 512 512)">']
    for i in range(7):
        x = -640 + i * 264
        stripes.append(f'<rect x="{x}" y="-500" width="92" height="2100" fill="url(#canes)"/>')
        stripes.append(f'<rect x="{x + 6}" y="-500" width="22" height="2100" fill="#FFFFFF" opacity="0.5"/>')
        stripes.append(f'<rect x="{x + 118}" y="-500" width="20" height="2100" fill="#F6A9B4" opacity="0.5"/>')
    stripes.append('</g>')
    diag = "".join(stripes)

    def mint(x, y, s):
        wedges = "".join(f'<path d="M0,0 L{86 * math.cos(math.radians(a)):.0f},{86 * math.sin(math.radians(a)):.0f} A86,86 0 0 1 {86 * math.cos(math.radians(a + 24)):.0f},{86 * math.sin(math.radians(a + 24)):.0f} Z" fill="#DE2B40"/>' for a in range(0, 360, 48))
        return (f'<g transform="translate({x},{y}) scale({s})" filter="url(#soft)"><circle r="86" fill="#FFFFFF"/>{wedges}'
                '<circle r="86" fill="none" stroke="#C22736" stroke-width="5" opacity="0.6"/>'
                '<ellipse cx="-30" cy="-38" rx="26" ry="14" fill="#FFF" opacity="0.8" transform="rotate(-28 -30 -38)"/></g>')

    mints = mint(118, 892, 1.0) + mint(912, 142, 0.72) + mint(880, 930, 0.5)
    stripes_on_line = f'<path d="{w_line()}" fill="none" stroke="#DE2B40" stroke-width="{LINE_W}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="30 30"/>'
    return bg, diag + mints, ["#DE2B40"] * 5, dict(extra_on_line=stripes_on_line, extra_defs=grad)


def scene_cozy():
    # a whole snowed-in village at night, windows glowing warm
    bg = linear_bg([(0, "#121C3A"), (0.45, "#2C3F6B"), (1, "#6E8FBF")], x2=0, y2=1)
    crescent = ('<mask id="cres2"><rect width="1024" height="1024" fill="#000"/>'
                '<circle cx="176" cy="152" r="84" fill="#fff"/><circle cx="144" cy="130" r="70" fill="#000"/></mask>'
                '<rect width="1024" height="1024" fill="#F5EFDA" mask="url(#cres2)" opacity="0.95"/>'
                '<circle cx="188" cy="168" r="150" fill="#F5EFDA" opacity="0.10" filter="url(#blur24)"/>')
    sky = stars(24, seed=15, y1=420) + crescent
    hillsx = hills([(730, 80, "#DCE9F8", 0.95), (860, 55, "#C2D6EE", 1.0)])

    def house(x, y, s, body, roof):
        return (f'<g transform="translate({x},{y}) scale({s})" filter="url(#soft)">'
                f'<circle cy="-20" r="150" fill="#FFC96B" opacity="0.20" filter="url(#bigglow)"/>'
                f'<rect x="-72" y="-58" width="144" height="88" rx="8" fill="{body}"/>'
                f'<path d="M-88,-52 L0,-124 L88,-52 Z" fill="{roof}"/>'
                '<path d="M-88,-52 L0,-124 L88,-52" stroke="#EAF3FB" stroke-width="15" fill="none" stroke-linecap="round"/>'
                '<rect x="-48" y="-34" width="32" height="32" rx="4" fill="#FFC96B"/><rect x="16" y="-34" width="32" height="32" rx="4" fill="#FFC96B"/>'
                '<rect x="-34" y="-32" width="6" height="28" fill="#3A2617" opacity="0.5"/><rect x="30" y="-32" width="6" height="28" fill="#3A2617" opacity="0.5"/>'
                '<rect x="34" y="-112" width="20" height="40" fill="#3A2617"/>'
                '<path d="M44,-122 Q36,-152 56,-178" fill="none" stroke="#DCE8F5" stroke-width="11" stroke-linecap="round" opacity="0.7" filter="url(#blur6)"/></g>')

    village = (house(196, 872, 0.92, "#4A3120", "#6B4630")
               + house(452, 918, 0.74, "#54341C", "#7A5238")
               + house(788, 862, 1.05, "#43301E", "#5E4028")
               + house(624, 946, 0.6, "#4A3120", "#6B4630"))
    pines = (pine(80, 830, 0.9, "#28406B", "#E8F1FB") + pine(330, 880, 0.6, "#31507F", "#E8F1FB")
             + pine(950, 860, 0.8, "#28406B", "#E8F1FB") + pine(560, 900, 0.5, "#31507F", "#E8F1FB"))
    rng.seed(5)
    snow = "".join(f'<circle cx="{rng.uniform(30, 994):.0f}" cy="{rng.uniform(30, 994):.0f}" r="{rng.uniform(3.5, 8.5):.1f}" fill="#FFFFFF" opacity="{rng.uniform(0.4, 0.95):.2f}"/>' for _ in range(38))
    return bg, sky + hillsx + pines + village + snow, ["#FFC96B", "#4A90C9", "#E8925A", "#5FA8D9", "#FFC96B"]


def scene_halloween():
    bg = radial_bg([(0, "#6B3AAE"), (0.55, "#331A5E"), (1, "#100826")], cy=0.32)
    # giant harvest moon dead-centre so the mark silhouettes against it
    moon = ('<circle cx="512" cy="360" r="252" fill="#FFDF9E"/>'
            '<circle cx="432" cy="300" r="42" fill="#EFC988" opacity="0.6"/><circle cx="588" cy="430" r="30" fill="#EFC988" opacity="0.55"/>'
            '<circle cx="620" cy="290" r="20" fill="#EFC988" opacity="0.5"/>'
            '<circle cx="512" cy="360" r="320" fill="#FFB84D" opacity="0.28" filter="url(#blur24)"/>')
    bat = 'M0,0 Q-16,-18 -34,-9 Q-25,3 -38,12 Q-18,12 0,5 Q18,12 38,12 Q25,3 34,-9 Q16,-18 0,0 Z'
    bats = "".join(f'<g transform="translate({x},{y}) scale({s})" fill="#12081F"><path d="{bat}"/></g>'
                   for x, y, s in [(392, 250, 1.9), (560, 180, 1.3), (250, 170, 1.0), (680, 300, 0.9), (170, 420, 0.8)])
    hill = ('<path d="M-40,860 Q300,770 620,850 T1100,810 V1120 H-40 Z" fill="#140A2C"/>'
            '<g transform="translate(180,842)" stroke="#0B0518" stroke-linecap="round" fill="none">'
            '<path d="M0,0 L0,-130 M0,-76 Q-50,-104 -66,-162 M0,-98 Q44,-130 48,-184 M0,-44 L34,-66" stroke-width="17"/></g>')
    manor = ('<g transform="translate(838,742)" fill="#140A2C">'
             '<rect x="-78" y="-96" width="156" height="130"/>'
             '<path d="M-92,-96 L0,-186 L92,-96 Z"/>'
             '<rect x="-100" y="-96" width="26" height="130"/><path d="M-116,-96 L-87,-158 L-58,-96 Z"/>'
             '<rect x="34" y="-166" width="24" height="56"/>'
             '<rect x="-38" y="-66" width="28" height="34" fill="#FFB84D"/><rect x="14" y="-66" width="28" height="34" fill="#FFB84D" opacity="0.85"/>'
             '<rect x="-24" y="-62" width="5" height="26" fill="#140A2C"/><rect x="28" y="-62" width="5" height="26" fill="#140A2C"/></g>')

    def jack(x, y, s, col):
        return (f'<g transform="translate({x},{y}) scale({s})">'
                f'<ellipse rx="66" ry="50" fill="{col}"/><ellipse cx="-25" rx="22" ry="48" fill="#D9660C" opacity="0.7"/><ellipse cx="25" rx="22" ry="48" fill="#D9660C" opacity="0.7"/>'
                '<rect x="-8" y="-66" width="15" height="24" rx="6" fill="#3F6B2A"/>'
                '<path d="M-36,-16 L-14,-4 L-36,2 Z" fill="#FFDF6B"/><path d="M36,-16 L14,-4 L36,2 Z" fill="#FFDF6B"/>'
                '<path d="M-30,20 L-18,30 L-8,20 L0,32 L8,20 L18,30 L30,20 L20,38 Q0,46 -20,38 Z" fill="#FFDF6B"/></g>')

    pumpkins = jack(220, 928, 1.0, "#F27B13") + jack(340, 962, 0.62, "#E86A0C")
    fog = ('<ellipse cx="330" cy="990" rx="420" ry="66" fill="#8A5CD6" opacity="0.3" filter="url(#blur24)"/>'
           '<ellipse cx="800" cy="960" rx="330" ry="52" fill="#8A5CD6" opacity="0.22" filter="url(#blur24)"/>')
    return bg, stars(18, "#CBA9F5", 47, 500, ()) + moon + bats + hill + manor + pumpkins + fog, ["#F27B13", "#B026FF", "#F2C14E", "#E85D04", "#8A5CD6"]


def scene_ghost():
    # reference-style: one billowing sheet ghost fills the tile, and the W is
    # CUT OUT of it — black line, five black holes rimmed in bright colours,
    # the two top-outer holes reading as the eyes. No porcelain mark here.
    bg = radial_bg([(0, "#5B2FA0"), (0.55, "#2A1454"), (1, "#0E0724")], cy=0.3)
    bat = ('M0,-2 C-6,-12 -16,-16 -30,-14 C-25,-7 -27,-2 -34,3 C-23,2 -15,5 -9,10 L0,18 L9,10 '
           'C15,5 23,2 34,3 C27,-2 25,-7 30,-14 C16,-16 6,-12 0,-2 Z')
    bats = "".join(f'<g transform="translate({x},{y}) scale({s})" fill="#12081F"><path d="{bat}"/></g>'
                   for x, y, s in [(120, 140, 2.0), (215, 84, 1.3), (68, 240, 1.0), (900, 170, 2.1), (816, 84, 1.4), (955, 285, 1.1)])
    clouds = ('<ellipse cx="80" cy="70" rx="220" ry="90" fill="#7A4BC8" opacity="0.35" filter="url(#blur24)"/>'
              '<ellipse cx="950" cy="60" rx="230" ry="90" fill="#7A4BC8" opacity="0.35" filter="url(#blur24)"/>')
    spires = ('<g fill="#1A0C33" opacity="0.9">'
              '<path d="M964,760 V560 L984,520 L1004,560 V760 Z M920,760 V640 L936,610 L952,640 V760 Z"/>'
              '<rect x="900" y="700" width="140" height="90"/>'
              '<path d="M40,780 L40,640 Q60,600 64,560 Q70,600 92,632 L92,780 Z"/></g>'
              '<path d="M-40,830 Q300,770 620,820 T1100,790 V1120 H-40 Z" fill="#160B30"/>')
    fog = '<ellipse cx="512" cy="1000" rx="600" ry="80" fill="#8A5CD6" opacity="0.28" filter="url(#blur24)"/>'

    sheet_grad = ('<linearGradient id="sheet" x1="0" y1="0" x2="0" y2="1024" gradientUnits="userSpaceOnUse">'
                  '<stop offset="0" stop-color="#FFFFFF"/><stop offset="0.72" stop-color="#F2EFFB"/>'
                  '<stop offset="1" stop-color="#D9D2EF"/></linearGradient>')
    # billowing skirt hem: soft lobes hanging down, organic widths
    hem_pts, hx = [], 940
    for w, dip, rise in [(200, 980, 846), (170, 1002, 868), (190, 966, 842), (150, 996, 872), (146, 978, 856)]:
        hem_pts.append(f'Q{hx - w / 2:.0f},{dip} {hx - w:.0f},{rise}')
        hx -= w
    hem = " ".join(hem_pts)
    # rounded dome, cinched waist, then a skirt that billows wide at the bottom
    body = (f'M512,128 C664,128 778,220 814,378 C834,462 788,540 794,630 '
            f'C800,732 878,774 940,824 {hem} C146,774 224,732 230,630 '
            'C236,540 190,462 210,378 C246,220 360,128 512,128 Z')
    # everything painted on the sheet stays clipped inside its silhouette
    clip = f'<clipPath id="gclip"><path d="{body}"/></clipPath>'
    folds = ('<path d="M296,548 C290,660 258,800 208,900" stroke="#D9D2EF" stroke-width="14" fill="none" opacity="0.85" stroke-linecap="round"/>'
             '<path d="M428,630 C420,760 428,860 412,944" stroke="#DDD7F2" stroke-width="11" fill="none" opacity="0.7" stroke-linecap="round"/>'
             '<path d="M598,630 C606,760 598,860 616,940" stroke="#DDD7F2" stroke-width="11" fill="none" opacity="0.7" stroke-linecap="round"/>'
             '<path d="M728,548 C734,660 766,800 822,896" stroke="#D9D2EF" stroke-width="14" fill="none" opacity="0.85" stroke-linecap="round"/>')
    shade = (f'<path d="{body}" fill="none" stroke="#B9AEDE" stroke-width="44" opacity="0.5" filter="url(#blur12)"/>'
             '<ellipse cx="440" cy="230" rx="220" ry="90" fill="#FFFFFF" opacity="0.6" filter="url(#blur24)"/>')
    ground_shadow = '<ellipse cx="512" cy="965" rx="460" ry="52" fill="#0B0417" opacity="0.5" filter="url(#blur24)"/>'
    ghost = (ground_shadow + f'<g filter="url(#soft)"><path d="{body}" fill="url(#sheet)"/></g>'
             + f'<g clip-path="url(#gclip)">{shade}{folds}</g>')

    # just the five pin holes, cut out of the sheet — no connector lines.
    # Same W constellation, scaled down so the sheet reads like the reference.
    def teardrop(cx, cy, ring):
        return (f'<g transform="translate({cx},{cy}) scale(0.78) translate({-cx},{-cy})">'
                f'<path d="{pin_path(cx, cy)}" fill="#15081F" stroke="{ring}" stroke-width="24"/></g>'
                f'<circle cx="{cx - 28}" cy="{cy - 38}" r="12" fill="#FFF" opacity="0.85"/>')

    def eye(cx, cy, ring):
        return (f'<circle cx="{cx}" cy="{cy}" r="76" fill="#15081F" stroke="{ring}" stroke-width="18"/>'
                f'<circle cx="{cx - 26}" cy="{cy - 28}" r="14" fill="#FFF" opacity="0.9"/>')

    holes = (eye(178, 302, "#FF4F8B") + eye(852, 300, "#35B5F5")
             + teardrop(512, 415, "#FFB300") + teardrop(340, 688, "#8B5CF6") + teardrop(685, 695, "#C445E0"))
    cutout = f'<g transform="translate(512,468) scale(0.62) translate(-512,-468)">{holes}</g>'
    return bg, clouds + stars(24, "#CBB8F0", 51, 300) + bats + spires + fog + ghost + cutout, ["#15081F"] * 5, dict(no_mark=True, extra_defs=sheet_grad + clip)


def scene_witching():
    bg = radial_bg([(0, "#6A38B4"), (0.55, "#39206B"), (1, "#150B2E")], cy=0.3)
    crescent = ('<mask id="cres3"><rect width="1024" height="1024" fill="#000"/>'
                '<circle cx="850" cy="150" r="78" fill="#fff"/><circle cx="818" cy="128" r="64" fill="#000"/></mask>'
                '<rect width="1024" height="1024" fill="#F5EFDA" mask="url(#cres3)" opacity="0.95"/>')
    # the witch hat sits ON the first pin (drawn over the mark as an overlay)
    hat = ('<g transform="translate(178,222) rotate(-10)" filter="url(#soft)">'
           '<ellipse cx="0" cy="16" rx="126" ry="27" fill="#241245"/>'
           '<path d="M-82,10 Q-22,-18 -12,-138 Q66,-56 84,10 Z" fill="#38206B"/>'
           '<path d="M-12,-138 Q8,-94 0,-60" stroke="#241245" stroke-width="9" fill="none"/>'
           '<rect x="-60" y="-14" width="120" height="24" rx="11" fill="#F2C14E"/>'
           '<rect x="12" y="-18" width="26" height="30" rx="5" fill="#E8A33C"/>'
           f'<path d="{sparkle4(-64, -70, 13)}" fill="#F2C14E" opacity="0.9"/></g>')
    # spell trail arcing across the sky behind the mark
    trail = ('<path d="M60,620 Q300,470 560,560 T980,420" stroke="#4DEEEA" stroke-width="8" fill="none" opacity="0.5" stroke-linecap="round" stroke-dasharray="2 26" filter="url(#glow)"/>'
             + "".join(f'<path d="{sparkle4(x, y, s)}" fill="{c}" opacity="{o}"/>'
                       for x, y, s, o, c in [(920, 430, 20, .95, "#4DEEEA"), (620, 545, 13, .8, "#F2C14E"), (300, 512, 15, .85, "#FF9DE0"),
                                             (760, 480, 10, .7, "#B47CFF"), (150, 590, 11, .75, "#4DEEEA")]))
    cauldron = ('<g transform="translate(200,884)" filter="url(#soft)"><ellipse cx="0" cy="66" rx="96" ry="20" fill="#0E0722"/>'
                '<path d="M-92,-14 Q-92,64 0,64 Q92,64 92,-14 Z" fill="#241245"/>'
                '<ellipse cx="0" cy="-14" rx="92" ry="22" fill="#3FA46A"/>'
                '<ellipse cx="0" cy="-14" rx="92" ry="22" fill="none" stroke="#5BD98A" stroke-width="6" opacity="0.7"/>'
                '<circle cx="-30" cy="-38" r="12" fill="#5BD98A"/><circle cx="18" cy="-48" r="8" fill="#5BD98A"/><circle cx="48" cy="-30" r="9" fill="#5BD98A"/>'
                '<circle cx="0" cy="-70" r="6" fill="#5BD98A" opacity="0.8"/>'
                '<circle cy="-20" r="130" fill="#5BD98A" opacity="0.16" filter="url(#bigglow)"/></g>')
    broom = ('<g transform="translate(800,860) rotate(-24)">'
             '<rect x="-150" y="-7" width="230" height="14" rx="7" fill="#8A5A32"/>'
             '<path d="M80,-26 L190,-10 L190,10 L80,26 Z" fill="#C9A05C"/>'
             '<path d="M92,-22 L180,-6 M92,22 L180,6 M96,0 L186,0" stroke="#8A6A3A" stroke-width="5"/></g>')
    return bg, stars(26, "#E8D4FF", 53) + crescent + trail + cauldron + broom, ["#B47CFF", "#3FA46A", "#F27B13", "#F2C14E", "#4DEEEA"], dict(overlay=hat)


SCENES = {
    "midnight": scene_midnight, "pearl": scene_pearl, "earth": scene_earth, "sunset": scene_sunset,
    "ocean": scene_ocean, "aurora": scene_aurora, "frequent-flyer": scene_flyer, "luxury": scene_luxury,
    "neon": scene_neon, "sakura": scene_sakura, "tropical": scene_tropical, "winter": scene_winter,
    "coffee": scene_coffee, "pride": scene_pride, "pride-neon": scene_pride_neon, "pride-night": scene_pride_night,
    "christmas": scene_christmas, "candy-cane": scene_candy, "cozy-winter": scene_cozy,
    "halloween": scene_halloween, "ghost": scene_ghost, "witching-hour": scene_witching,
}


def build(name, fn):
    out = fn()
    bg, deco, holes = out[0], out[1], out[2]
    opts = out[3] if len(out) > 3 else {}
    bg_defs, bg_body = bg
    gl_defs, gl_body = gloss()
    vg_defs, vg_body = vignette(0.30 if name in ("pearl", "winter", "sakura") else 0.4)
    mark_body = "" if opts.get("no_mark") else "".join(porcelain_mark(
        holes,
        line=opts.get("line", "url(#lg)"),
        pins_fill=opts.get("pins_fill", "url(#porc)"),
        eye_dark=opts.get("eye_dark"),
        extra_on_line=opts.get("extra_on_line", ""),
    ))
    svg = (f'<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><defs>'
           f'{bg_defs}{gl_defs}{vg_defs}{LINE_GRAD}{PIN_GRAD}{FILTERS}{opts.get("extra_defs", "")}</defs>'
           f'{bg_body}{deco}{mark_body}{opts.get("overlay", "")}{gl_body}{vg_body}{grain(0.045)}</svg>')
    html = os.path.join(S, "cover_tmp.html")
    with open(html, "w") as f:
        f.write('<style>html,body{margin:0;padding:0;width:1024px;height:1024px;overflow:hidden;background:#000}'
                'svg{display:block;width:1024px;height:1024px}</style>' + svg)
    shot = os.path.join(S, "cover_tmp.png")
    subprocess.run([CHROME, "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
                    "--window-size=1024,1200", f"--screenshot={shot}", f"file://{html}"],
                   check=True, capture_output=True)
    Image.open(shot).crop((0, 0, 1024, 1024)).convert("RGB").save(os.path.join(OUT, f"{name}.png"), optimize=True)


for name, fn in SCENES.items():
    build(name, fn)
    print("built", name, flush=True)

prev = os.path.join(OUT, "previews")
os.makedirs(prev, exist_ok=True)
for f in os.listdir(OUT):
    if f.endswith(".png"):
        Image.open(os.path.join(OUT, f)).resize((256, 256), Image.LANCZOS).save(os.path.join(prev, f), optimize=True)
Image.open("/home/user/explorer/mobile/assets/images/icon.png").resize((256, 256), Image.LANCZOS).convert("RGB").save(os.path.join(prev, "classic.png"), optimize=True)

names = list(SCENES)
cols, cell, pad = 6, 200, 22
rows = (len(names) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (cell + pad) + pad, rows * (cell + pad + 26) + pad), (14, 16, 24))
d = ImageDraw.Draw(sheet)
for i, n in enumerate(names):
    x = pad + (i % cols) * (cell + pad)
    y = pad + (i // cols) * (cell + pad + 26)
    im = Image.open(os.path.join(OUT, f"{n}.png")).resize((cell, cell))
    m = Image.new("L", (cell, cell), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, cell, cell], radius=44, fill=255)
    sheet.paste(im, (x, y), m)
    d.text((x + 4, y + cell + 6), n, fill=(200, 205, 220))
sheet.save(os.path.join(S, "covers3_sheet.png"))
print("sheet done", len(names))
