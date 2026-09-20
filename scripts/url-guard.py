"""Freeze/check Hugo page URLs before taxonomy work (Python standard library only).

Always supply a NEW, clean Hugo build directory. This is an offline regression
guard, not an HTTP/Cloudflare emulator. Existing _redirects rules are frozen;
new exact 301/302 rules are supported, new wildcard rules require manual review.
"""
import argparse
import json
import re
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit


def route(url):
    parsed = urlsplit(url)
    if parsed.netloc and parsed.netloc != 'listenriver.com':
        raise ValueError(f'External destination requires review: {url}')
    return unquote(parsed.path) or '/'


class Head(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonical = None
        self.redirect = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'link' and 'canonical' in a.get('rel', '').split():
            self.canonical = route(a['href'])
        if tag == 'meta' and a.get('http-equiv', '').lower() == 'refresh':
            match = re.search(r'url\s*=\s*(.*)', a.get('content', ''), re.I)
            if match:
                self.redirect = match[1].strip().strip('\"\'')


def scan(site):
    if not (site / 'sitemap.xml').is_file():
        raise ValueError('Expected a complete Hugo build containing sitemap.xml')
    pages = {}
    for p in sorted(site.rglob('*')):
        if not p.is_file() or p.suffix not in ('.html', '.xml'):
            continue
        relative = p.relative_to(site).as_posix()
        url = '/' + (relative[:-10] if relative.endswith('index.html') else relative)
        h = Head()
        if p.suffix == '.html':
            h.feed(p.read_text(encoding='utf-8'))
        pages[url] = {'canonical': h.canonical,
                      'redirect': route(urljoin('https://listenriver.com' + url, h.redirect)) if h.redirect else None}
    rp = site / '_redirects'
    rules = [line.strip() for line in rp.read_text(encoding='utf-8').splitlines()
             if line.strip() and not line.lstrip().startswith('#')] if rp.exists() else []
    return {'pages': pages, 'redirect_rules': rules}


def resolve(snapshot, url):
    visited = set()
    for _ in range(15):
        if url in visited:
            return None, f'redirect loop at {url}'
        visited.add(url)
        # Pages applies redirect rules before serving matching assets.
        target = None
        for rule in snapshot['redirect_rules']:
            fields = rule.split()
            if len(fields) != 3 or fields[2] not in ('301', '302', '303', '307', '308'):
                return None, f'unsupported redirect rule: {rule}'
            source, dest, _ = fields
            names = []
            pattern = ''
            for part in re.split(r'(\*|:[A-Za-z][A-Za-z0-9_]*)', source):
                if part == '*':
                    names.append('splat')
                    pattern += '(.*)'
                elif part.startswith(':'):
                    names.append(part[1:])
                    pattern += '([^/]+)'
                else:
                    pattern += re.escape(unquote(part))
            match = re.fullmatch(pattern, url)
            if match:
                for name, value in zip(names, match.groups()):
                    dest = dest.replace(':' + name, value)
                target = route(dest)
                break
        if target:
            url = target
            continue
        page = snapshot['pages'].get(url)
        if page is None:
            return None, f'missing output: {url}'
        if page['redirect']:
            url = page['redirect']
            continue
        return page['canonical'] or url, None
    return None, 'too many redirects'


def check(old, new, moves):
    failures = []
    for rule in old['redirect_rules']:
        if rule not in new['redirect_rules']:
            failures.append(f'Historical redirect changed/removed; review required: {rule}')
    for rule in new['redirect_rules']:
        if rule not in old['redirect_rules'] and re.search(r'\*|:[A-Za-z]', rule.split()[0]):
            failures.append(f'New wildcard redirect requires manual review: {rule}')
    known = []
    urls = set(old['pages'])
    for rule in old['redirect_rules']:
        source = rule.split()[0]
        if not re.search(r'\*|:[A-Za-z]', source):
            urls.add(route(source))
    for url in sorted(urls):
        expected, prior_error = resolve(old, url)
        actual, error = resolve(new, url)
        if prior_error:
            known.append({'url': url, 'error': prior_error})
            if url in old['pages'] and url not in new['pages'] and error:
                failures.append(f'Previously generated route removed: {url}')
            continue
        expected = moves.get(expected, expected)
        if error or actual != expected:
            failures.append(f'{url}: expected {expected}; got {actual or error}')
        elif url in moves and error is None:
            target = new['pages'].get(expected)
            if not target or target['redirect'] or target['canonical'] != expected:
                failures.append(f'Migration target must be a canonical page: {expected}')
    for source, target in moves.items():
        if source not in old['pages']:
            failures.append(f'Unknown migration source: {source}')
        if source == target:
            failures.append(f'Redundant migration mapping: {source}')
    return failures, known


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('mode', choices=['capture', 'check'])
    p.add_argument('--site', type=Path, required=True)
    p.add_argument('--baseline', type=Path, default=Path('docs/taxonomy-2026-09-20/url-baseline.json'))
    p.add_argument('--moves', type=Path, help='Reviewed JSON object mapping old canonical paths to new paths')
    args = p.parse_args()
    current = scan(args.site)
    if args.mode == 'capture':
        current['captured_at'] = datetime.now(timezone.utc).isoformat()
        current['scope'] = 'Fresh local Hugo HTML/XML output, not a production crawl'
        args.baseline.parent.mkdir(parents=True, exist_ok=True)
        # Never overwrite the pre-migration baseline by accident.
        with args.baseline.open('x', encoding='utf-8') as f:
            json.dump(current, f, ensure_ascii=False, indent=2)
        print(f'Captured {len(current["pages"])} routes and {len(current["redirect_rules"])} redirect rules')
        return
    old = json.loads(args.baseline.read_text(encoding='utf-8'))
    moves = json.loads(args.moves.read_text(encoding='utf-8')) if args.moves else {}
    failures, known = check(old, current, moves)
    print(f'Checked {len(old["pages"])} baseline routes; {len(failures)} regressions; {len(known)} pre-existing resolution issues')
    for issue in known:
        print('BASELINE ISSUE:', issue['url'], issue['error'])
    for failure in failures:
        print('FAIL:', failure)
    if failures:
        sys.exit(1)


if __name__ == '__main__':
    main()
