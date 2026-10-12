from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
from PIL import Image
import json, sys
root=Path(sys.argv[1] if len(sys.argv)>1 else 'public-build-check')
class Meta(HTMLParser):
    def __init__(self): super().__init__(); self.tags={}
    def handle_starttag(self,tag,attrs):
        if tag=='meta':
            a=dict(attrs); key=a.get('property',a.get('name',''))
            self.tags.setdefault(key,[]).append(a.get('content',''))
issues=[]; count=0; sizes={}; largest=0
for f in root.rglob('*.html'):
    m=Meta();m.feed(f.read_text(encoding='utf-8'))
    if 'og:image' not in m.tags: continue
    count+=1;t=m.tags;url=t['og:image'][0];p=root/unquote(urlparse(url).path).lstrip('/')
    if not p.exists():issues.append([str(f),'missing',url]);continue
    try:
        with Image.open(p) as im:size=im.size
        sizes[str(size)]=sizes.get(str(size),0)+1;largest=max(largest,p.stat().st_size)
        if size!=(1200,630):issues.append([str(f),'size',size])
        if t.get('twitter:image')!=t['og:image']:issues.append([str(f),'twitter mismatch'])
        if len(t['og:image'])!=1:issues.append([str(f),'duplicate OG'])
    except Exception as e:issues.append([str(f),str(e)])
print(json.dumps({'pages':count,'sizes':sizes,'largestBytes':largest,'issues':issues[:20],'issueCount':len(issues)},ensure_ascii=False))
raise SystemExit(bool(issues))
