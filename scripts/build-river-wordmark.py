"""Build the homepage SVG lettering from the site's OFL Noto Sans TC subset.

Authoring-only requirements: fonttools and brotli. No website runtime dependency.
Run from the repository root. The checked-in partial is the deployable asset.
"""
import math
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.basePen import BasePen
from fontTools.pens.svgPathPen import SVGPathPen


class RiverPen(BasePen):
    def __init__(self, glyphs, output, index):
        super().__init__(glyphs)
        self.output, self.index = output, index

    def point(self, p):
        x, y = p
        x, y = x * .08, 84 - y * .08
        if self.index < 2 and x < 36:
            # Open the ear radical gently, echoing the header's listening contour.
            envelope = max(0, math.sin((y - 14) / 78 * math.pi))
            x += 4.4 * envelope * (x - 20) / 20
            y += 1.4 * math.sin(x / 36 * math.pi)
        if self.index >= 3:
            # The stems bend as riverbanks; horizontal strokes follow the current.
            x += 5.4 * math.sin((y - 12) / 72 * math.pi)
            y += 3.2 * math.sin(x / 80 * math.pi * 1.3)
        return round(x + self.index * 84, 2), round(y, 2)

    def _moveTo(self, p): self.output.moveTo(self.point(p))
    def _lineTo(self, p):
        start = self._getCurrentPoint()
        if self.index == 2:
            self.output.lineTo(self.point(p))
            return
        # Convert straight font segments to true curves. Moving only their end
        # points would skew the characters without giving their strokes flow.
        points = [self.point(tuple(start[j] + (p[j] - start[j]) * t for j in (0, 1))) for t in (0, 1/3, 2/3, 1)]
        a, b, c, d = points
        first = tuple(round((-5*a[j] + 18*b[j] - 9*c[j] + 2*d[j])/6, 2) for j in (0, 1))
        second = tuple(round((2*a[j] - 9*b[j] + 18*c[j] - 5*d[j])/6, 2) for j in (0, 1))
        self.output.curveTo(first, second, d)
    def _curveToOne(self, a, b, c): self.output.curveTo(self.point(a), self.point(b), self.point(c))
    def _qCurveToOne(self, a, b): self.output.qCurveTo(self.point(a), self.point(b))
    def _closePath(self): self.output.closePath()
    def _endPath(self): self.output.endPath()


font = instantiateVariableFont(TTFont('static/fonts/river-sans.woff2'), {'wght': 520})
glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
paths = []
for index, character in enumerate('聆聽的河流'):
    pen = SVGPathPen(glyphs)
    glyphs[cmap[ord(character)]].draw(RiverPen(glyphs, pen, index))
    paths.append(f'    <path d="{pen.getCommands()}"/>')
markup = '''{{- /* Lettering derived from OFL Noto Sans TC; see static/fonts/OFL-NotoSansTC.txt.
       Rebuild with scripts/build-river-wordmark.py. Text alternative remains the h1. */ -}}
<h1 class="river-wordmark-title"><span class="sr-only">聆聽的河流</span><svg class="river-publication-wordmark" viewBox="0 0 480 112" fill="none" aria-hidden="true">
  <g class="river-wordmark-lettering" fill="currentColor">
''' + '\n'.join(paths) + '''
  </g>
  <g class="river-wordmark-water" stroke="currentColor" stroke-linecap="round">
    <path d="M400 82C414 91 429 94 446 87S467 78 478 82" stroke-width="3.2"/>
    <path d="M374 84C388 96 407 105 427 101S459 88 478 93" stroke-width="1.15" opacity=".55"/>
  </g>
</svg></h1>
'''
Path('layouts/partials/river-wordmark.html').write_text(markup, encoding='utf-8')
