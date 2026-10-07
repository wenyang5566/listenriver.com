"""Rebuild the home font from an official Noto Sans TC variable TTF.

Requires fonttools and brotli. Usage:
  python scripts/subset-home-font.py /path/to/NotoSansTC-VF.ttf
The input font is not committed. Keep its OFL alongside the derived WOFF2.
"""
import argparse
import re
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("font", type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    text = "".join(chr(code) for code in range(32, 127))
    for pattern in ("layouts/partials/river-*.html", "data/river-home.yaml", "data/taxonomy-landing.yaml"):
        for source in sorted(root.glob(pattern)):
            text += source.read_text(encoding="utf-8")
    # Include current article titles, plus fallback filenames for untitled notes.
    # Future characters missing from the subset use the CSS system sans fallback.
    for source in sorted((root / "content").rglob("*.md")):
        content = source.read_text(encoding="utf-8-sig")
        frontmatter = content.split("---", 2)[1] if content.startswith("---") else ""
        text += "".join(re.findall(r"^(?:title|displayTitle):\s*(.*)$", frontmatter, re.MULTILINE))
        text += source.stem
    options = subset.Options()
    options.flavor = "woff2"
    options.recalc_timestamp = False
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]
    font = TTFont(args.font, recalcTimestamp=False)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    font.flavor = "woff2"
    output = root / "static/fonts/river-sans.woff2"
    output.parent.mkdir(parents=True, exist_ok=True)
    font.save(output)
    print(f"Saved {output.relative_to(root)}: {output.stat().st_size:,} bytes; {len(set(text))} requested characters")


if __name__ == "__main__":
    main()
