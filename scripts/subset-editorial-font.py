"""Subset Noto Serif TC for the homepage display text.

Requires fonttools and brotli. Run from the repository root:
  python scripts/subset-editorial-font.py /path/to/NotoSerifTC-VF.ttf
Update DISPLAY_TEXT when the masthead, opening or lead headline changes.
"""
import argparse
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

DISPLAY_TEXT = '聆聽的河流在文字裡，慢慢聽見彼此。肯認每一種聲音的存在'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('font', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
font = TTFont(args.font, recalcTimestamp=False)
options = subset.Options()
options.flavor = 'woff2'
options.recalc_timestamp = False
options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=DISPLAY_TEXT)
subsetter.subset(font)
font.flavor = 'woff2'
output = root / 'static/fonts/river-editorial.woff2'
font.save(output)
print(f'{output.name}: {output.stat().st_size:,} bytes')
