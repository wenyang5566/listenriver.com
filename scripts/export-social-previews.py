"""Export the approved preview images; run preview-social-cards.mjs first."""
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[1]
pairs = [('home', 'static/images/brand/share-home-v1.jpg'), ('steady', 'content/clubhouse/工作手冊/05忍不住、氣不過、沉住氣/share-v1.jpg'), ('body', 'content/clubhouse/工作日誌/19身心狀態留下的痕跡/share-v1.jpg'), ('still', 'content/clubhouse/工作手冊/04以靜制動/share-v1.jpg'), ('oasis', 'content/blog/電影心得/綠洲/share-v1.jpg')]
for name, target in pairs:
    with Image.open(root / '.tmp/social-preview' / (name + '.png')) as im:
        im.convert('RGB').save(root / target, quality=88)
Image.new('RGB', (1200, 630), '#fff9f0').save(root / 'assets/images/social/cream.png')
