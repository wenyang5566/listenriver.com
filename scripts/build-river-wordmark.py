"""Build the homepage SVG lettering from the site's OFL Noto Sans TC subset.

Authoring-only requirements: fonttools and brotli. No website runtime dependency.
Run from the repository root. The checked-in partial is the deployable asset.
"""
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
        return round(x + self.index * 84, 2), round(y, 2)

    def _moveTo(self, p): self.output.moveTo(self.point(p))
    def _lineTo(self, p):
        self.output.lineTo(self.point(p))
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
<h1 class="river-wordmark-title"><span class="sr-only">聆聽的河流</span><svg class="river-publication-wordmark" viewBox="-42 0 522 112" fill="none" aria-hidden="true">
  <g class="river-wordmark-lettering" fill="currentColor">
''' + '\n'.join(paths) + '''
  </g>
  <g class="river-wordmark-water" stroke="currentColor" stroke-linecap="round">
    <path pathLength="1" class="river-wordmark-ear" d="M-34 44C-36 30-28 20-18 21c12 1 17 14 12 25-3 6-8 8-11 13-2 5-4 8-9 8-5 0-8-4-8-8" stroke-width="2.1"/>
    <path pathLength="1" d="M-25 40c-1-7 2-12 8-11 8 1 10 10 5 15-4 4-11 3-11 9 0 5 6 7 13 5C-10 70 19 85 43 91S96 94 130 98 184 91 220 93 270 103 309 96 351 91 387 98 433 101 477 88" stroke-width="1.4"/>
    <path pathLength="1" d="M259 104C295 109 313 101 337 103S378 112 402 106 444 103 477 99" stroke-width="1" opacity=".45"/>
  </g>
</svg></h1>
'''
Path('layouts/partials/river-wordmark.html').write_text(markup, encoding='utf-8')
