"""Validate reviewed tag consolidation: permanent routes, SEO and original members."""
import argparse
import importlib.util
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

spec = importlib.util.spec_from_file_location('reading_migration', Path(__file__).with_name('check-reading-migration.py'))
reading = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reading)
guard = reading.guard
ROOT = Path(__file__).resolve().parent.parent
MERGES = [('shamless', '無恥之徒', 1), ('Shamless', '無恥之徒', 1),
          ('電影', '電影心得', 3), ('閱讀', '閱讀心得', 1)]


def check(site):
    snapshot = guard.scan(site)
    # First match wins on the host; do not hide an earlier conflicting rule.
    rules = {}
    for rule in snapshot['redirect_rules']:
        source, *rest = rule.split()
        rules.setdefault(source, rest)
    count = 0
    for old, new, pages in MERGES:
        source, target = f'/tags/{old}', f'/tags/{new}/'
        expected = {source: target, source + '/': target, source + '/index.html': target,
                    source + '/index.xml': target + 'index.xml'}
        for number in range(1, pages + 1):
            for suffix in ('', '/', '/index.html'):
                expected[f'{source}/page/{number}{suffix}'] = target
        for path, destination in expected.items():
            assert rules.get(path) == [destination, '301'], f'Missing direct 301: {path}'
            assert destination in snapshot['pages'], f'Missing destination: {destination}'
            assert not snapshot['pages'][destination]['redirect'], f'Redirect chain: {path}'
            assert guard.resolve(snapshot, path)[1] is None, f'Broken redirect: {path}'
            count += 1
    sitemap = ET.parse(site / 'sitemap.xml')
    locations = {unquote(urlsplit(e.text or '').path) for e in sitemap.iter() if e.tag.endswith('}loc')}
    retired = {f'/tags/{old}/' for old, _, _ in MERGES}
    for name in ('無恥之徒', '電影心得', '閱讀心得'):
        target = f'/tags/{name}/'
        assert snapshot['pages'][target]['canonical'] == target, f'Wrong canonical: {name}'
        head = reading.Links()
        head.feed((site / target.lstrip('/') / 'index.html').read_text(encoding='utf-8'))
        # Preserve the site's existing tag archive policy; article indexing is separate.
        assert head.meta.get('robots') == 'noindex, follow', f'Tag robots policy changed: {name}'
        assert unquote(urlsplit(head.meta['og:url']).path) == target, f'Wrong OG URL: {name}'
        assert target not in locations, f'Noindex tag unexpectedly in sitemap: {name}'
        feed = ET.parse(site / target.lstrip('/') / 'index.xml')
        assert feed.findtext('./channel/title', '').startswith(name), f'Wrong RSS title: {name}'
        for e in feed.iter():
            if e.tag == 'link' or e.tag.endswith('}link'):
                path = unquote(urlsplit(e.text or e.attrib.get('href', '')).path)
                assert not any(path.startswith(old) for old in retired), f'Stale RSS link: {path}'
    assert not any(any(path.startswith(old) for old in retired) for path in locations), 'Retired tag in sitemap'
    for page in site.rglob('*.html'):
        text = page.read_text(encoding='utf-8')
        head = guard.Head(); head.feed(text)
        if head.redirect:
            continue
        links = reading.Links(); links.feed(text)
        assert not any(any(path == old.rstrip('/') or path.startswith(old) for old in retired)
                       for path in links.links), f'Stale internal tag link: {page}'
    inventory = {row['tag']: set(row['articles']) for row in json.loads(
        (ROOT / 'docs/taxonomy-audit-2026-09-25/tag-inventory.json').read_text(encoding='utf-8'))}
    members = {}
    for folder in ('blog', 'clubhouse'):
        for page in (ROOT / 'content' / folder).rglob('*.md'):
            source = page.read_text(encoding='utf-8-sig')
            if not source.startswith('---'):
                continue
            front = source.split('---', 2)[1]
            block = re.search(r'^tags:\s*\n((?:[ \t]+.*\n)*)', front, re.M)
            names = set(re.findall(r'^\s*-\s*(.+?)\s*$', block.group(1), re.M)) if block else set()
            assert not names.intersection({'電影', 'Shamless', '閱讀'}), f'Retired tag still used: {page}'
            members[page.relative_to(ROOT).as_posix()] = names
    for old, new in [('Shamless', '無恥之徒'), ('電影', '電影心得')]:
        expected = inventory[old] | inventory[new]
        assert all(new in members.get(path, set()) for path in expected), f'Missing original members: {new}'
    print(f'Tag migration: {count} direct 301 variants, SEO/RSS/internal links and all original members passed.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site', type=Path, required=True)
    check(parser.parse_args().site)
