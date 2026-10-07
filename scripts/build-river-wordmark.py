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
        if self.index >= 3:
            # Bend the vertical stems and ease horizontal strokes into a current.
            x += 2.6 * math.sin((y - 10) / 72 * math.pi)
            y += 1.8 * math.sin(x / 80 * math.pi * 1.3)
        return round(x + self.index * 84, 2), round(y, 2)

    def _moveTo(self, p): self.output.moveTo(self.point(p))
    def _lineTo(self, p): self.output.lineTo(self.point(p))
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
    <path d="M400 82C414 92 430 94 448 86S468 79 478 82" stroke-width="3.2"/>
    <path d="M373 84C386 95 404 106 425 102S459 89 478 93" stroke-width="1.15" opacity=".55"/>
  </g>
</svg></h1>
'''
Path('layouts/partials/river-wordmark.html').write_text(markup, encoding='utf-8')
