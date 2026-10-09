"""Verify clubhouse parent-folder migration against its reviewed manifest and old build."""
import argparse
import importlib.util
import json
import re
from pathlib import Path
from urllib.parse import unquote

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('url_guard', root / 'scripts/url-guard.py')
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--site', type=Path, required=True)
parser.add_argument('--before', type=Path, help='Optional pre-folder-migration build for media and URL checks')
args = parser.parse_args()
manifest = json.loads((root / 'docs/clubhouse-folder-migration-manifest.json').read_text(encoding='utf-8'))
mapping = {'會所工作日誌': '工作日誌', '會所實習': '實習紀錄', '會所工作手冊': '工作手冊'}
snapshot = guard.scan(args.site)
published = 0
for entry in manifest:
    source = root / entry['newSource']
    assert source.is_file(), source
    assert Path(entry['source']).parent.name == source.parent.name, 'Leaf folder changed'
    raw = source.read_text(encoding='utf-8')
    assert re.search(r'(?m)^title: (工作日誌|實習紀錄|工作手冊) [0-9]{2}｜[^\n_]+$', raw), source
    assert re.search(r'(?m)^seriesLabel: (工作日誌|實習紀錄|工作手冊) [0-9]{2}$', raw), source
    if entry['draft']:
        assert not (args.site / entry['newURL'].lstrip('/') / 'index.html').exists(), 'Draft published'
        continue
    published += 1
    output = args.site / entry['newURL'].lstrip('/') / 'index.html'
    rendered = output.read_text(encoding='utf-8')
    key = entry['interactionKey']
    for attribute in ['data-post-path', 'data-path']:
        values = re.findall(attribute + r'="([^"]+)"', rendered)
        assert values and all(value == key for value in values), (entry['newURL'], attribute, values)
    actual, error = guard.resolve(snapshot, entry['oldURL'])
    assert error is None and actual == entry['newURL'], (entry['oldURL'], actual, error)
    alias = args.site / entry['oldURL'].lstrip('/') / 'index.html'
    assert entry['newURL'] in unquote(alias.read_text(encoding='utf-8')), 'Missing alias destination'
assert len(manifest) == 31 and published == 30

media_count = 0
if args.before:
    old_snapshot = guard.scan(args.before)
    all_moves = json.loads((root / 'docs/taxonomy-url-moves.json').read_text(encoding='utf-8'))
    moves = {key: value for key, value in all_moves.items() if key in old_snapshot['pages']}
    failures, known = guard.check(old_snapshot, snapshot, moves)
    assert not failures, failures
    for old, new in mapping.items():
        for media in (args.before / 'clubhouse' / old).rglob('*'):
            if not media.is_file() or media.suffix in ('.html', '.xml'):
                continue
            path = '/' + media.relative_to(args.before).as_posix()
            target = path.replace('/clubhouse/' + old + '/', '/clubhouse/' + new + '/')
            assert f'{path} {target} 301' in snapshot['redirect_rules'], path
            destination = args.site / target.lstrip('/')
            assert destination.is_file() and destination.read_bytes() == media.read_bytes(), target
            media_count += 1
    print(f'Pre-folder URL baseline: zero regressions; {len(known)} existing issues')
print(f'Validated {published} published articles, one retained draft, aliases and stable interaction keys; {media_count} media files')
