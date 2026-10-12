from pathlib import Path
from PIL import Image
folder = Path(__file__).resolve().parents[1] / 'static/images/brand'
# Preserve each rendered size, including the thicker 16px drawing.
with Image.open(folder / 'favicon-48.png') as large, Image.open(folder / 'favicon-32.png') as medium, Image.open(folder / 'favicon-16.png') as small:
    large.save(folder / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)], append_images=[medium, small])
