#!/usr/bin/env python3
"""Builds the handwritten "Pokhrel Ankit" signature used on the home page.

The font outline (Mr Dafoe) gives the filled ink. To make it *write* like a pen
instead of tracing outlines, we rasterise the glyphs, skeletonise them to get the
centre line, trace that into ordered pen strokes and use those strokes as a mask:
a thick round "nib" sweeps along each stroke at a steady speed and reveals the
ink underneath. A tapered underline swoosh is added at the end.

Writes the two SVGs into index.html between <!-- sig:loader --> and <!-- sig:home -->
markers. Needs: fonttools, scikit-image, numpy, pillow.

  python3 tools/build-signature.py path/to/MrDafoe-Regular.ttf
"""
import math
import re
import sys
from pathlib import Path

import numpy as np
from fontTools.pens.basePen import BasePen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from scipy import ndimage as ndi
from skimage.draw import polygon as fill_poly
from skimage.measure import approximate_polygon
from skimage.morphology import skeletonize

ROOT = Path(__file__).resolve().parent.parent
TEXT = ["Pokhrel", "Ankit"]
WORD_GAP = 230          # extra space between the words, font units
SCALE = 0.5             # raster pixels per font unit
WRITE_S = 2.3          # total time spent writing the letters
SWOOSH_S = 0.42         # underline
LIFT_S = 0.04           # pen lift between strokes
START_S = 0.3


class FlatPen(BasePen):
    """Collects contours as flattened point lists."""
    def __init__(self, gs):
        super().__init__(gs)
        self.contours, self.cur = [], []
    def _moveTo(self, p): self.cur = [p]
    def _lineTo(self, p): self.cur.append(p)
    def _curveToOne(self, a, b, c):
        p0 = self.cur[-1]
        for i in range(1, 13):
            t = i / 12; u = 1 - t
            self.cur.append((u**3*p0[0] + 3*u*u*t*a[0] + 3*u*t*t*b[0] + t**3*c[0],
                             u**3*p0[1] + 3*u*u*t*a[1] + 3*u*t*t*b[1] + t**3*c[1]))
    def _qCurveToOne(self, a, b):
        p0 = self.cur[-1]
        for i in range(1, 9):
            t = i / 8; u = 1 - t
            self.cur.append((u*u*p0[0] + 2*u*t*a[0] + t*t*b[0], u*u*p0[1] + 2*u*t*a[1] + t*t*b[1]))
    def _closePath(self):
        if len(self.cur) > 2: self.contours.append(self.cur)
        self.cur = []
    _endPath = _closePath


def layout(font):
    cmap, hmtx, gs = font.getBestCmap(), font['hmtx'], font.getGlyphSet()
    x, placed, word_end = 0, [], []
    for wi, word in enumerate(TEXT):
        for ch in word:
            g = cmap[ord(ch)]
            placed.append((g, x, wi))
            x += hmtx[g][0]
        word_end.append(x)
        x += hmtx[cmap[32]][0] + WORD_GAP
    return gs, placed, word_end


def signed_area(pts):
    return 0.5 * sum(x0 * y1 - x1 * y0 for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]))


def main(font_path):
    font = TTFont(font_path)
    gs, placed, word_end = layout(font)

    # ---------- filled outline (SVG, y flipped) + flattened contours
    svg_pen = SVGPathPen(gs)
    glyph_contours = []
    for g, x, wi in placed:
        gs[g].draw(TransformPen(svg_pen, (1, 0, 0, -1, x, 0)))
        fp = FlatPen(gs)
        gs[g].draw(TransformPen(fp, (1, 0, 0, -1, x, 0)))
        glyph_contours.append((fp.contours, wi))
    fill_d = svg_pen.getCommands()

    pts = np.array([p for cs, _ in glyph_contours for c in cs for p in c])
    x0, y0 = pts.min(0) - 40
    x1, y1 = pts.max(0) + 40
    W, H = int((x1 - x0) * SCALE) + 1, int((y1 - y0) * SCALE) + 1
    to_px = lambda p: ((p[0] - x0) * SCALE, (p[1] - y0) * SCALE)
    to_fu = lambda c, r: (c / SCALE + x0, r / SCALE + y0)

    # ---------- rasterise with the nonzero rule, glyph by glyph
    mask = np.zeros((H, W), bool)
    for cs, _ in glyph_contours:
        wind = np.zeros((H, W), np.int16)
        for c in cs:
            px = np.array([to_px(p) for p in c])
            rr, cc = fill_poly(px[:, 1], px[:, 0], (H, W))
            wind[rr, cc] += 1 if signed_area(c) > 0 else -1
        mask |= wind != 0
    dist = ndi.distance_transform_edt(mask)
    skel = skeletonize(mask)

    # ---------- skeleton graph
    on = set(zip(*np.nonzero(skel)))
    nb = lambda p: [(p[0] + dr, p[1] + dc) for dr in (-1, 0, 1) for dc in (-1, 0, 1)
                    if (dr or dc) and (p[0] + dr, p[1] + dc) in on]
    deg = {p: len(nb(p)) for p in on}
    nodes = {p for p in on if deg[p] != 2}
    # junction pixels that touch are one node
    node_id, nid = {}, 0
    for p in nodes:
        if p in node_id: continue
        stack = [p]; node_id[p] = nid
        while stack:
            q = stack.pop()
            for r in nb(q):
                if r in nodes and r not in node_id:
                    node_id[r] = nid; stack.append(r)
        nid += 1

    edges, used = [], set()
    def walk(start, nxt):
        path = [start, nxt]
        prev, cur = start, nxt
        while cur not in nodes:
            used.add(cur)
            cand = [r for r in nb(cur) if r != prev and r not in path[-3:]]
            if not cand: break
            prev, cur = cur, cand[0]
            path.append(cur)
        return path
    seen_pairs = set()
    for p in nodes:
        for q in nb(p):
            if q in nodes and node_id[q] == node_id[p]: continue
            if q in used: continue
            path = walk(p, q)
            key = (path[0], path[-1], len(path))
            if (path[-1], path[0], len(path)) in seen_pairs: continue
            seen_pairs.add(key)
            for r in path: used.add(r) if r not in nodes else None
            edges.append(path)
    # closed loops with no junctions (e.g. an "o")
    for p in on:
        if p in used or p in nodes: continue
        path = [p]; used.add(p); prev = None; cur = p
        while True:
            cand = [r for r in nb(cur) if r != prev and r not in used]
            if not cand: break
            prev, cur = cur, cand[0]; used.add(cur); path.append(cur)
        path.append(p)
        edges.append(path)

    # prune short spurs (skeleton whiskers at corners)
    ends = lambda e: (e[0], e[-1])
    for _ in range(3):
        count = {}
        for e in edges:
            for p in ends(e):
                k = node_id.get(p, p); count[k] = count.get(k, 0) + 1
        keep = []
        for e in edges:
            a, b = (node_id.get(p, p) for p in ends(e))
            spur = (count[a] == 1) != (count[b] == 1)
            thick = max(dist[p] for p in e)
            if spur and len(e) < thick * 1.6: continue
            keep.append(e)
        edges = keep

    # ---------- order edges into pen strokes, roughly how a hand writes
    word_of_x = lambda x: 0 if x < word_end[0] + WORD_GAP / 2 else 1
    def col(p): return to_fu(p[1], p[0])[0]
    unused = list(range(len(edges)))
    node_edges = {}
    for i, e in enumerate(edges):
        for end in (0, -1):
            node_edges.setdefault(node_id.get(e[end], e[end]), []).append((i, end))

    def direction(path, at_end):
        seg = path[-6:] if at_end else path[:6][::-1]
        (r0, c0), (r1, c1) = seg[0], seg[-1]
        n = math.hypot(r1 - r0, c1 - c0) or 1
        return ((r1 - r0) / n, (c1 - c0) / n)

    comp, ncomp = ndi.label(mask, structure=np.ones((3, 3)))
    sizes = ndi.sum(mask, comp, range(1, ncomp + 1))
    lone = [sizes[comp[e[0]] - 1] < 0.02 * mask.sum() for e in edges]
    strokes = []
    while unused:
        # start the next stroke at the leftmost free end, small marks (dots, crosses) last per word
        def start_key(i):
            e = edges[i]
            x = min(col(e[0]), col(e[-1]))
            # only marks that stand alone in the ink (an i-dot) wait for the end of the word
            return (word_of_x(x), lone[i], x)
        i = min(unused, key=start_key)
        e = edges[i]
        path = e if col(e[0]) <= col(e[-1]) else e[::-1]
        unused.remove(i)
        while True:
            k = node_id.get(path[-1], path[-1])
            d = direction(path, True)
            best, best_dot = None, -2
            for j, end in node_edges.get(k, []):
                if j not in unused: continue
                cand = edges[j] if end == 0 else edges[j][::-1]
                q = cand[min(5, len(cand) - 1)]
                vr, vc = q[0] - cand[0][0], q[1] - cand[0][1]
                dot = (d[0] * vr + d[1] * vc) / (math.hypot(vr, vc) or 1)   # 1 = straight on
                if dot > best_dot: best, best_dot, best_path = j, dot, cand
            if best is None or best_dot < -0.35: break
            unused.remove(best)
            path = path + best_path[1:]
        strokes.append(path)

    # ---------- strokes -> smooth SVG paths in font units, with a nib width each
    def smooth_d(path):
        pts = approximate_polygon(np.array(path, float), tolerance=0.9)
        p = [to_fu(c, r) for r, c in pts]
        if len(p) < 2: p = p * 2
        d = f"M{p[0][0]:.0f} {p[0][1]:.0f}"
        for k in range(len(p) - 1):
            a = p[k - 1] if k else p[k]
            b, c = p[k], p[k + 1]
            e = p[k + 2] if k + 2 < len(p) else c
            c1 = (b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6)
            c2 = (c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6)
            d += f"C{c1[0]:.0f} {c1[1]:.0f} {c2[0]:.0f} {c2[1]:.0f} {c[0]:.0f} {c[1]:.0f}"
        return d, sum(math.dist(p[k], p[k + 1]) for k in range(len(p) - 1))

    pen = []
    for s in strokes:
        d, length = smooth_d(s)
        width = (2 * np.percentile([dist[p] for p in s], 98) + 9) / SCALE
        pen.append((d, length, width))

    # ---------- underline swoosh: a tapered filled shape, revealed the same way
    bx0, bx1 = pts[:, 0].min(), pts[:, 0].max()
    base = np.percentile(pts[:, 1], 88)
    sx0, sx1 = bx0 + (bx1 - bx0) * 0.12, bx1 + 140
    def curve(t):
        x = sx0 + (sx1 - sx0) * t
        y = base + 190 - 150 * t ** 1.4 + 55 * math.sin(math.pi * t)
        return x, y
    N = 48
    centre = [curve(i / N) for i in range(N + 1)]
    half = [2 + 21 * math.sin(math.pi * (i / N) ** 0.75) for i in range(N + 1)]
    upper, lower = [], []
    for i, (x, y) in enumerate(centre):
        a, b = centre[max(i - 1, 0)], centre[min(i + 1, N)]
        tx, ty = b[0] - a[0], b[1] - a[1]; n = math.hypot(tx, ty) or 1
        nx, ny = -ty / n, tx / n
        upper.append((x + nx * half[i], y + ny * half[i]))
        lower.append((x - nx * half[i], y - ny * half[i]))
    ring = upper + lower[::-1]
    swoosh_fill = "M" + "L".join(f"{x:.0f} {y:.0f}" for x, y in ring) + "Z"
    swoosh_pen = "M" + "L".join(f"{x:.0f} {y:.0f}" for x, y in centre[::3] + [centre[-1]])
    swoosh_len = sum(math.dist(centre[k], centre[k + 1]) for k in range(N))

    # ---------- timing: steady pen speed, short lifts between strokes
    # a real pen only lifts when the next stroke starts somewhere else
    starts = [to_fu(s[0][1], s[0][0]) for s in strokes]
    stops = [to_fu(s[-1][1], s[-1][0]) for s in strokes]
    lifts = [0] + [LIFT_S if math.dist(stops[k - 1], starts[k]) > 90 else 0.0 for k in range(1, len(pen))]
    total_len = sum(l for _, l, _ in pen)
    speed = total_len / (WRITE_S - sum(lifts))   # WRITE_S includes the lifts
    t = START_S
    timed = []
    for (d, length, width), lift in zip(pen, lifts):
        t += lift
        dur = max(length / speed, 0.03)
        timed.append((d, width, t, dur))
        t += dur
    timed.append((swoosh_pen, 90, t + 0.05, SWOOSH_S))
    total = t + 0.05 + SWOOSH_S

    vb = f"{x0:.0f} {y0:.0f} {x1 - x0:.0f} {max(y1, base + 280) - y0:.0f}"
    mx, my, mw, mh = (round(v) for v in (x0 - 200, y0 - 200, x1 - x0 + 600, max(y1, base + 280) - y0 + 400))
    ink = f'<path class="sig-ink" d="{fill_d}{swoosh_fill}"/>'
    nib = "".join(
        f'<path pathLength="1" stroke-width="{w:.0f}" style="--d:{st:.2f}s;--t:{du:.2f}s" d="{d}"/>'
        for d, w, st, du in timed)
    loader = (f'<svg class="sig" viewBox="{vb}" data-dur="{total:.2f}" aria-hidden="true">'
              f'<defs><mask id="sig-pen" maskUnits="userSpaceOnUse" x="{mx}" y="{my}" width="{mw}" height="{mh}">{nib}</mask></defs>'
              f'<g mask="url(#sig-pen)">{ink}</g><g class="sig-settle" style="--d:{total:.2f}s">{ink}</g></svg>')
    home = f'<svg class="sig" viewBox="{vb}" role="img" aria-label="Signature: Pokhrel Ankit">{ink}</svg>'

    html_path = ROOT / "index.html"
    html = html_path.read_text()
    html = re.sub(r'(<div class="sig-loader" aria-hidden="true">)<svg.*?</svg>', lambda m: m[1] + loader, html, count=1, flags=re.S)
    html = re.sub(r'(<figcaption class="sig-home">)<svg.*?</svg>', lambda m: m[1] + home, html, count=1, flags=re.S)
    html_path.write_text(html)
    print(f"{len(pen)} pen strokes, {total:.2f}s, viewBox {vb}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "/tmp/sigfonts/MrDafoe-Regular.ttf")
