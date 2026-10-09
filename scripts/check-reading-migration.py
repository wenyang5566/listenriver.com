"""Check the built reading category migration, including exact pagination and RSS routes."""
import argparse
import importlib.util
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

spec = importlib.util.spec_from_file_location('url_guard', Path(__file__).with_name('url-guard.py'))
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)

OLD = '/categories/閱讀與筆記'
NEW = '/categories/閱讀筆記'


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.meta = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'href' in attrs:
            self.links.append(unquote(urlsplit(attrs['href']).path))
        if tag == 'meta':
            self.meta[attrs.get('name', attrs.get('property'))] = attrs.get('content', '')


def check(site):
    snapshot = guard.scan(site)
    rules = {line.split()[0]: line.split()[1:] for line in snapshot['redirect_rules']}
    expected = {OLD: NEW + '/', OLD + '/': NEW + '/',
                OLD + '/index.html': NEW + '/', OLD + '/index.xml': NEW + '/index.xml'}
    for number in range(1, 13):
        target = NEW + '/' if number == 1 else f'{NEW}/page/{number}/'
        for suffix in ('', '/', '/index.html'):
            expected[f'{OLD}/page/{number}{suffix}'] = target
    for source, target in expected.items():
        assert rules.get(source) == [target, '301'], f'Missing direct permanent redirect: {source}'
        if target in snapshot['pages']:
            assert not snapshot['pages'][target]['redirect'], f'Redirect chain: {source}'
        else:
            # Larger archive batches retire old pagination pages. Only accept
            # an explicit permanent redirect to the current reading archive.
            assert target.startswith(NEW + '/page/'), f'Missing destination: {target}'
            assert rules.get(target) == [NEW + '/', '301'], f'Missing retired page redirect: {target}'
        assert guard.resolve(snapshot, source)[1] is None, f'Broken route: {source}'

    main = snapshot['pages'][NEW + '/']
    assert main['canonical'] == NEW + '/', 'Wrong new category canonical'
    html = (site / NEW.lstrip('/') / 'index.html').read_text(encoding='utf-8')
    head = Links(); head.feed(html)
    assert 'noindex' not in head.meta.get('robots', ''), 'New category is not indexable'
    assert unquote(urlsplit(head.meta['og:url']).path) == NEW + '/', 'Wrong Open Graph URL'
    assert head.meta['og:title'] == '閱讀筆記', 'Wrong Open Graph title'
    sitemap = ET.parse(site / 'sitemap.xml')
    urls = [unquote(e.text or '') for e in sitemap.iter() if e.tag.endswith('}loc')]
    assert any(urlsplit(u).path == NEW + '/' for u in urls), 'New category missing from sitemap'
    assert not any(OLD in u for u in urls), 'Old category remains in sitemap'
    feed = ET.parse(site / NEW.lstrip('/') / 'index.xml')
    assert feed.findtext('./channel/title', '').split(' on ', 1)[0] == '閱讀筆記', 'Wrong RSS title'
    feed_urls = [unquote(e.text or e.attrib.get('href', '')) for e in feed.iter()
                 if e.tag == 'link' or e.tag.endswith('}link')]
    assert not any(OLD in u for u in feed_urls), 'Old category remains in RSS links'
    for path in site.rglob('*.html'):
        text = path.read_text(encoding='utf-8')
        h = guard.Head(); h.feed(text)
        if h.redirect:
            continue
        links = Links(); links.feed(text)
        assert not any(u.startswith(OLD + '/') or u == OLD for u in links.links), f'Stale internal link: {path}'
    print(f'Reading migration: {len(expected)} direct 301 routes; canonical, Open Graph, sitemap, RSS and internal links passed.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site', type=Path, required=True)
    check(parser.parse_args().site)
