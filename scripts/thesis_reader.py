"""Add reversible reading markup; never rewrite original thesis text."""
import collections
import json
import re
from pathlib import Path
from lxml import etree as ET, html as H

DATA = Path(__file__).resolve().parents[1] / 'data/thesis-references.json'
YEAR = r'(?:18|19|20)\d{2}(?:\s*/\s*(?:18|19|20)\d{2})?'


def enhance_thesis(rendered):
    root = H.fragment_fromstring(rendered, create_parent='div')
    document = root.xpath('.//div[@class="thesis-document"]')[0]
    original = {n.get('data-thesis-source'): n.text_content() for n in document.xpath('.//*[@data-thesis-source]')}
    config = json.loads(DATA.read_text(encoding='utf8'))
    starts = {r['source']: r for r in config['entries']}
    entries = []
    current = None
    in_references = False
    # Explicitly reviewed boundaries avoid treating wrapped coauthors as new entries.
    for node in list(document):
        if node.get('id') == 'references':
            in_references = True
        if node.get('id') == 'appendix-1':
            break
        if not in_references or node.tag != 'p':
            continue
        source = node.get('data-thesis-source')
        if source in starts:
            current = H.Element('div', {'class': 'thesis-reference-entry', 'id': 'reference-' + source})
            document.insert(document.index(node), current)
            entries.append({'id': current.get('id'), 'source': source, 'group': starts[source]['group'], 'node': current})
        if current is None:
            raise ValueError('Reference paragraph without reviewed boundary: ' + str(source))
        current.append(node)
    if len(entries) != len(starts):
        raise ValueError('Reference boundary map no longer matches thesis')

    # Build exact author/year alternatives. Unknown spellings and years stay unlinked.
    alternatives = collections.defaultdict(set)
    entry_report = []
    for entry in entries:
        text = entry['node'].text_content()
        year_match = re.search(r'[（(]\s*(' + YEAR + r')\s*[）)]', text)
        if not year_match:
            raise ValueError('Missing reference year: ' + entry['source'])
        year = re.sub(r'\s', '', year_match[1])
        header = text[:year_match.start()].strip()
        if re.match(r'^[\u4e00-\u9fff]', header):
            names = header.split('、')
        elif entry['source'] in ('source-p-2097', 'source-p-2099'):
            names = [header.rstrip(".")]
        elif entry['source'] == 'source-p-1903':
            names = ['Cleeland']
        else:
            names = re.findall(r"([A-ZÀ-ÖØ-Þ][\w’'‐–-]*(?: [A-Za-z]+)*),\s*[^\W\d_]\.", header)
        if not names:
            raise ValueError('Missing reference author: ' + entry['source'])
        def flexible(name):
            return r'\s*'.join(re.escape(part) for part in name.split())
        first = flexible(names[0])
        authors = [first + r'(?:\s*(?:et\s+al\.?|等人?))?']
        if len(names) > 1:
            connector = r'(?:\s*[,，、&＆和與]\s*(?:&\s*)?|\s+and\s+)'
            authors.append(connector.join(flexible(n) for n in names))
        years = [year] + config['compound_years'].get(entry['source'], [])
        for author in authors:
            for value in years:
                # A slash prevents matching only the original year of a translated work.
                pattern = (r'(?<![A-Za-zÀ-ÿ])' + author + r'\s*(?:[,，]\s*|[（(]\s*)' +
                           re.escape(value).replace('/', r'\s*/\s*') + r'(?![\d/a-zA-Z])' +
                           r'(?:\s*[:：]\s*\d+(?:\s*[-–—]\s*\d+)?)?(?:[）)])?')
                alternatives[pattern].add(entry['id'])
        entry_report.append({'id': entry['id'], 'source': entry['source'], 'group': entry['group'], 'authors': names, 'years': years, 'text': text})
    patterns = [(p, next(iter(ids))) for p, ids in alternatives.items() if len(ids) == 1]
    patterns.sort(key=lambda x: len(x[0]), reverse=True)
    combined = re.compile('|'.join(f'(?P<c{i}>{p})' for i, (p, _) in enumerate(patterns)))
    links = []
    unresolved = []
    # Only body paragraphs, captions and table text before the bibliography.
    body_nodes = [n for n in document.xpath('.//*[@data-thesis-source]')
                  if n.get('data-thesis-source', '').startswith('source-p-')
                  and int(n.get('data-thesis-source').split('-')[-1]) < 1768]
    for paragraph in body_nodes:
        for slot in list(paragraph.xpath('.//text()')):
            owner = slot.getparent()
            if (not slot.is_tail and owner.tag == 'a') or owner.xpath('ancestor::a'):
                continue
            text = str(slot)
            matches = [(m.start(), m.end(), [patterns[int(m.lastgroup[1:])][1]]) for m in combined.finditer(text)]
            # Group an entirely resolved parenthetical citation into one multi-reference preview.
            for bracket in re.finditer(r'[（(][^（）()]{1,300}[）)]', text):
                contained = [m for m in matches if bracket.start() < m[0] and m[1] <= bracket.end()]
                if not contained:
                    if re.search(r'[,，]\s*(?:19|20)\d{2}', bracket[0]):
                        unresolved.append({'source': paragraph.get('data-thesis-source'), 'text': bracket[0]})
                    continue
                residue = text[bracket.start():bracket.end()]
                for a, b, _ in reversed(contained):
                    residue = residue[:a-bracket.start()] + residue[b-bracket.start():]
                if re.fullmatch(r'[\s;；()（）]*', residue):
                    matches = [m for m in matches if m not in contained]
                    matches.append((bracket.start(), bracket.end(), list(dict.fromkeys(i for _, _, ids in contained for i in ids))))
                elif re.search(r'(?:19|20)\d{2}', residue):
                    unresolved.append({'source': paragraph.get('data-thesis-source'), 'text': bracket[0]})
            if not matches:
                continue
            matches.sort()
            # Each text slot is replaced without flattening any surrounding emphasis/links.
            container = owner.getparent() if slot.is_tail else owner
            position = container.index(owner) + 1 if slot.is_tail else 0
            if slot.is_tail:
                owner.tail = text[:matches[0][0]]
            else:
                owner.text = text[:matches[0][0]]
            for i, (start, end, ids) in enumerate(matches):
                anchor = H.Element('a', {'class': 'thesis-citation', 'href': '#' + ids[0],
                    'data-reference-ids': ' '.join(ids), 'aria-haspopup': 'dialog'})
                anchor.text = text[start:end]
                anchor.tail = text[end:matches[i+1][0] if i+1 < len(matches) else len(text)]
                container.insert(position+i, anchor)
                links.append({'source': paragraph.get('data-thesis-source'), 'text': anchor.text, 'references': ids})

    # Keep the original headings and source IDs, now inside native disclosure controls.
    group_ids = {'heading-source-p-1769': 'references-zh', 'heading-source-p-1861': 'references-en', 'heading-source-p-2086': 'references-web'}
    active = None
    for node in list(document):
        if node.get('id') in group_ids or re.fullmatch(r'appendix-[1-7]', node.get('id', '')):
            group_id = group_ids.get(node.get('id'), 'disclosure-' + node.get('id'))
            active = H.Element('details', {'class': 'thesis-disclosure', 'id': group_id})
            document.insert(document.index(node), active)
            summary = ET.SubElement(active, 'summary')
            source_anchor = document.xpath('.//span[@id=$id]', id=node.get('data-thesis-source'))
            if source_anchor:
                summary.append(source_anchor[0])
            summary.append(node)
        elif node.tag == 'section' and 'thesis-footnotes' in node.get('class', ''):
            active = None
        elif active is not None:
            active.append(node)
    actual = {n.get('data-thesis-source'): n.text_content() for n in document.xpath('.//*[@data-thesis-source]')}
    if actual != original:
        raise ValueError('Reader enhancement changed original thesis text')
    return ''.join(H.tostring(n, encoding='unicode') for n in root), {
        'entries': entry_report, 'citations': links, 'unresolved_parenthetical': unresolved,
        'ambiguous_patterns': [p for p, ids in alternatives.items() if len(ids) > 1],
        'original_text_preserved': True,
    }
