"""Check built clubhouse series links and presentation without deleting legacy tags."""
import argparse
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

SERIES = ('會所實習', '會所工作日誌', '會所工作手冊')
DESTINATIONS = {name: f'/clubhouse/{name}/' for name in SERIES}
DESTINATIONS['會所模式'] = '/clubhouse/'


class Links(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links = []
        self.current = None
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            attrs = dict(attrs)
            self.current = {'href': unquote(urlsplit(attrs.get('href', '')).path),
                            'classes': attrs.get('class', '').split(),
                            'label': attrs.get('aria-label', ''), 'text': ''}

    def handle_data(self, text):
        if self.current is not None:
            self.current['text'] += text

    def handle_endtag(self, tag):
        if tag == 'a' and self.current is not None:
            self.links.append(self.current)
            self.current = None


def check(site):
    articles = 0
    cards = 0
    for name in SERIES:
        directory = site / 'clubhouse' / name
        pages = [p for p in directory.rglob('index.html')
                 if 'post-single' in p.read_text(encoding='utf-8')]
        assert pages, f'No built articles for {name}'
        for page in pages:
            links = Links(page.read_text(encoding='utf-8')).links
            series = [a for a in links if 'post-header-chip--series' in a['classes']]
            assert len(series) == 1, f'Series must appear once as a header link: {page}'
            assert series[0]['href'] == DESTINATIONS[name], f'Wrong series destination: {page}'
            assert name in series[0]['text'], f'Full series keyword missing: {page}'
            tags = [a for a in links if 'post-header-chip--tag' in a['classes']]
            assert not any(a['text'].strip('# ') == name for a in tags), f'Duplicate series chip: {page}'
            mode = [a for a in tags if a['text'].strip('# ') == '會所模式']
            assert len(mode) == 1 and mode[0]['href'] == '/clubhouse/', f'Wrong topic entry: {page}'
            assert any(a['href'] == DESTINATIONS[name] and 'post-inline-link' in a['classes']
                       for a in links), f'Missing continue-reading series link: {page}'
            articles += 1
        # Old tag routes still exist; this batch is not a URL removal.
        assert (site / 'tags' / name / 'index.html').is_file(), f'Legacy tag removed: {name}'
    for page in site.rglob('*.html'):
        for link in Links(page.read_text(encoding='utf-8')).links:
            if not any(c in link['classes'] for c in ('taxonomy-story-card__tag', 'clubhouse-story-card__tag')):
                continue
            name = (link['label'] or link['text']).strip('# ')
            if name in DESTINATIONS:
                assert link['href'] == DESTINATIONS[name], f'Card goes to duplicate tag listing: {page}'
                assert name != '會所模式', f'Redundant clubhouse topic on card: {page}'
                cards += 1
    assert articles == 30, f'Expected current 30 published clubhouse articles, got {articles}; review content changes'
    assert cards > 0, 'No clubhouse series cards checked'
    print(f'Clubhouse entries: {articles} article headers and continue-reading links; '
          f'{cards} series card links; legacy tag routes preserved.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site', type=Path, required=True)
    check(parser.parse_args().site)
