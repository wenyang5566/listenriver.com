"""Prepare a single-page thesis from its DOCX; compare every retained paragraph.

Run with the bundled Python (lxml, Pillow, pypdf). The source files stay outside
the repository. The report belongs in an ignored local evidence directory.
"""
import argparse
import collections
import hashlib
import html
import io
import json
import re
from pathlib import Path
from zipfile import ZipFile

from lxml import etree as ET, html as LH
from PIL import Image, ImageOps
from pypdf import PdfReader
from thesis_reader import enhance_thesis

NS = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
}
W = '{' + NS['w'] + '}'
R = '{' + NS['r'] + '}'
CN = '一二三四五六七八九十'


def text_of(node):
    return ''.join(node.xpath('.//w:t/text()', namespaces=NS))


def normalized(text):
    return re.sub(r'\s+', '', text)


def number_text(value, fmt):
    if fmt == 'decimal':
        return str(value)
    if fmt == 'taiwaneseCountingThousand':
        if value < 10:
            return CN[value - 1]
        return ('十' if value < 20 else CN[value // 10 - 1] + '十') + (CN[value % 10 - 1] if value % 10 else '')
    if fmt == 'ideographLegalTraditional':
        return '壹貳參肆伍陸柒捌玖拾'[value - 1]
    if fmt == 'bullet':
        return '•'
    raise ValueError(f'Unsupported numbering format: {fmt}')


class Importer:
    def __init__(self, source, output):
        self.z = ZipFile(source)
        self.output = output
        self.root = ET.fromstring(self.z.read('word/document.xml'))
        self.body = self.root.find('w:body', NS)
        self.rels = {x.get('Id'): x.get('Target') for x in ET.fromstring(self.z.read('word/_rels/document.xml.rels'))}
        nums = ET.fromstring(self.z.read('word/numbering.xml'))
        self.abstracts = {x.get(W + 'abstractNumId'): x for x in nums.findall('w:abstractNum', NS)}
        self.nums = {x.get(W + 'numId'): x for x in nums.findall('w:num', NS)}
        self.counters = {}
        self.paragraphs = []
        self.headings = []
        self.images = []
        self.figures_at_caption = collections.defaultdict(list)
        self.tables = []
        self.references = collections.defaultdict(list)
        self.note_ids = []
        self.links = 0
        self.para_ids = {p: f'source-p-{i}' for i, p in enumerate(self.body.iter(W + 'p'))}
        self.bookmarks = {}
        for p, pid in self.para_ids.items():
            for bookmark in p.findall('.//w:bookmarkStart', NS):
                self.bookmarks[bookmark.get(W + 'name')] = pid
        self.source_table_ids = {t: i + 1 for i, t in enumerate(self.body.findall('w:tbl', NS))}
        self.current_chapter = None
        self.in_appendices = False
        self.omitted_sections = {'funding': [], 'english_abstract': []}
        self.caption_by_media = {
            'image4.jpg': '研究者身上各部位的蟹足腫',
            'image5.jpg': '研究者身上各部位的蟹足腫',
            'image6.jpg': '研究者身上各部位的蟹足腫',
            'image7.png': '研究者身上各部位的蟹足腫',
            'image8.jpg': '研究者身上各部位的蟹足腫',
            'image9.jpeg': '圖4.2.1 受訪者鎖骨位置的蟹足腫',
            'image10.jpeg': '圖4.2.2 受訪者大範圍的蟹足腫',
            'image11.jpeg': '圖4.2.2 受訪者大範圍的蟹足腫',
            'image12.jpeg': '圖4.3.1 類固醇貼片的剪裁模型',
            'image13.png': '圖4.3.2 受訪者手繪的蟹足腫',
            'image14.jpg': '圖4.3.3 蟹足腫患者的病痛難題和應對與管理',
            'image15.jpeg': '圖4.4.3 蟹足腫疤痕放射治療新增為自費項目',
            'image16.png': '圖5.1.2 三種類型患者的治療動力',
            'image17.jpg': '圖5.1.3 醫療視角與患者視角的落差',
            'image18.png': '附件二 患者和觀察者疤痕評估量表',
            'image19.png': '附件三 患者與觀察者疤痕評估量表應用於蟹足腫患者',
            'image20.png': '附件三 患者與觀察者疤痕評估量表應用於蟹足腫患者',
            'image21.png': '附件五 招募海報',
        }

    def label(self, p):
        pr = p.find('w:pPr/w:numPr', NS)
        if pr is None:
            return ''
        num_id = pr.find('w:numId', NS).get(W + 'val')
        level_node = pr.find('w:ilvl', NS)
        level = int(level_node.get(W + 'val')) if level_node is not None else 0
        num = self.nums[num_id]
        abstract_id = num.find('w:abstractNumId', NS).get(W + 'val')
        lvl = self.abstracts[abstract_id].find(f'w:lvl[@w:ilvl="{level}"]', NS)
        start = int(lvl.find('w:start', NS).get(W + 'val'))
        override = num.find(f'w:lvlOverride[@w:ilvl="{level}"]/w:startOverride', NS)
        if override is not None:
            start = int(override.get(W + 'val'))
        key = (num_id, level)
        self.counters[key] = self.counters.get(key, start - 1) + 1
        fmt = lvl.find('w:numFmt', NS).get(W + 'val')
        pattern = lvl.find('w:lvlText', NS).get(W + 'val')
        if fmt == 'bullet':
            return '•'
        return pattern.replace(f'%{level + 1}', number_text(self.counters[key], fmt))

    def inline(self, node):
        parts = []
        for child in node:
            tag = ET.QName(child).localname
            if tag == 't':
                parts.append(html.escape(child.text or ''))
            elif tag in ('br', 'cr'):
                # Print-page breaks are not a new paragraph in the web edition.
                if child.get(W + 'type') != 'page':
                    parts.append('<br>')
            elif tag == 'tab':
                parts.append(' ')
            elif tag == 'footnoteReference':
                note = child.get(W + 'id')
                self.note_ids.append(note)
                parts.append(f'<sup class="thesis-note-ref" id="note-ref-{note}"><a href="#note-{note}" aria-label="註腳 {note}">{note}</a></sup>')
            elif tag == 'hyperlink':
                label = self.inline(child)
                target = self.rels.get(child.get(R + 'id'))
                anchor = child.get(W + 'anchor')
                if target and target.startswith(('http://', 'https://', 'mailto:')):
                    parts.append(f'<a href="{html.escape(target, quote=True)}">{label}</a>')
                    self.links += 1
                elif anchor in self.bookmarks:
                    parts.append(f'<a href="#{self.bookmarks[anchor]}">{label}</a>')
                else:
                    parts.append(label)
            elif tag not in ('pPr', 'rPr', 'drawing', 'pict', 'instrText', 'del', 'txbxContent'):
                parts.append(self.inline(child))
        return ''.join(parts)

    def reference_links(self, value):
        # Work on text nodes, so original external hyperlinks and note links stay intact.
        fragment = LH.fragment_fromstring(f'<span>{value}</span>')
        for node in list(fragment.iter()):
            if node.tag == 'a' or node.tag == 'sup':
                continue
            for tail in (False, True):
                text = node.tail if tail else node.text
                if not text:
                    continue
                pieces = []
                offset = 0
                for m in re.finditer(r'附[件錄]\s*([一二三四五六七])', text):
                    appendix = CN.index(m.group(1)) + 1
                    index = len(self.references[appendix]) + 1
                    ref = f'appendix-ref-{appendix}-{index}'
                    self.references[appendix].append(ref)
                    pieces.append(html.escape(text[offset:m.start()]))
                    pieces.append(f'<a class="thesis-appendix-ref" id="{ref}" href="#appendix-{appendix}">{html.escape(m.group(0))}</a>')
                    offset = m.end()
                if offset:
                    pieces.append(html.escape(text[offset:]))
                    replacement = LH.fragment_fromstring('<span>' + ''.join(pieces) + '</span>')
                    # A span preserves both the original surrounding inline elements and text order.
                    if tail:
                        node.tail = None
                        node.addnext(replacement)
                    else:
                        node.text = None
                        node.insert(0, replacement)
        return (fragment.text or '') + ''.join(ET.tostring(c, encoding='unicode', method='html') for c in fragment)

    def image_html(self, p, in_cell=False):
        result = []
        for drawing in p.xpath('.//w:drawing', namespaces=NS):
            blip = drawing.find('.//a:blip', NS)
            if blip is None:
                continue
            target = self.rels[blip.get(R + 'embed')]
            name = Path(target).name
            xfrm = drawing.find('.//a:xfrm', NS)
            rotation = int(xfrm.get('rot', '0')) / 60000 if xfrm is not None else 0
            crop_node = drawing.find('.//a:srcRect', NS)
            crop = {side: int(crop_node.get(side, '0')) for side in ('l', 't', 'r', 'b')} if crop_node is not None else {}
            data = self.z.read('word/' + target)
            filename = name
            with Image.open(io.BytesIO(data)) as image:
                image = ImageOps.exif_transpose(image)
                if any(crop.values()):
                    w, h = image.size
                    image = image.crop((round(w * crop['l'] / 100000), round(h * crop['t'] / 100000), round(w * (1 - crop['r'] / 100000)), round(h * (1 - crop['b'] / 100000))))
                if rotation or any(crop.values()) or (xfrm is not None and (xfrm.get('flipH') == '1' or xfrm.get('flipV') == '1')):
                    if xfrm is not None and xfrm.get('flipH') == '1':
                        image = ImageOps.mirror(image)
                    if xfrm is not None and xfrm.get('flipV') == '1':
                        image = ImageOps.flip(image)
                    image = image.rotate(-rotation, expand=True)
                    filename = Path(name).stem + '-oriented.png'
                    image.save(self.output / filename)
                    original_copy = self.output / name
                    if original_copy.exists() and original_copy.read_bytes() == data:
                        original_copy.unlink()
                else:
                    (self.output / filename).write_bytes(data)
                width, height = image.size
            alt = self.caption_by_media.get(name, '論文原圖')
            figure = f'<figure class="post-figure thesis-figure"><img src="{filename}" width="{width}" height="{height}" loading="lazy" decoding="async" alt="{html.escape(alt, quote=True)}"></figure>'
            caption_number = re.match(r'^圖([0-9]+(?:\.[0-9]+)+)', alt)
            if caption_number and not in_cell:
                self.figures_at_caption[caption_number.group(1)].append(figure)
            else:
                result.append(figure)
            self.images.append({'source': target, 'output': filename, 'rotation_clockwise': rotation, 'crop_100000ths': crop, 'width': width, 'height': height})
        return ''.join(result)

    def paragraph(self, p, in_cell=False):
        text = text_of(p)
        identifier = self.para_ids.get(p, '')
        label = self.label(p)
        if text:
            self.paragraphs.append({'id': identifier, 'text': text, 'numbering': label})
        inline = self.inline(p)
        if not text and (inline or label):
            self.paragraphs.append({'id': identifier, 'text': '', 'numbering': label})
        stripped = text.strip()
        heading_id = None
        level = None
        if not in_cell:
            chapter = re.match(r'^第([一二三四五六])章', stripped)
            section = re.match(r'^第([一二三四五六七八九十]+)節', stripped)
            appendix = re.match(r'^附[件錄]([一二三四五六七])、', stripped)
            if chapter:
                number = CN.index(chapter.group(1)) + 1
                self.current_chapter = number
                level, heading_id = 2, f'chapter-{number}'
            elif appendix:
                self.in_appendices = True
                number = CN.index(appendix.group(1)) + 1
                level, heading_id = 2, f'appendix-{number}'
            elif section and self.current_chapter and not self.in_appendices:
                number = CN.index(section.group(1)) + 1 if len(section.group(1)) == 1 else 10
                level, heading_id = 3, f'chapter-{self.current_chapter}-section-{number}'
            elif stripped in ('本論文獲得', '致謝', '中文摘要', 'Abstract', '參考文獻'):
                level = 2
                heading_id = {'本論文獲得': 'funding', '致謝': 'acknowledgements', '中文摘要': 'abstract-zh', 'Abstract': 'abstract-en', '參考文獻': 'references'}[stripped]
            elif re.match(r'^[一二三四五六七八九十]+、', stripped) and len(stripped) < 65:
                # Preserve original lower-level headings, but keep the floating TOC short.
                level, heading_id = 4, 'heading-' + identifier
            elif re.match(r'^（[一二三四五六七八九十]+）', stripped) and len(stripped) < 65:
                level, heading_id = 5, 'heading-' + identifier
        attributes = f' data-thesis-source="{identifier}"'
        if heading_id:
            self.headings.append({'id': heading_id, 'level': level, 'text': stripped})
            result = f'<h{level} id="{heading_id}"{attributes}>{inline}</h{level}>'
            # Original bookmarks resolve through the source paragraph identifier.
            result = f'<span id="{identifier}" class="thesis-source-anchor"></span>' + result
            if appendix:
                result += f'<!--APPENDIX_BACKLINKS_{number}-->'
        elif inline or label:
            caption = re.match(r'^(圖|表)\s*([0-9]+(?:\.[0-9]+)+)', stripped)
            attrs = f' id="{identifier}"{attributes}'
            if caption:
                attrs += ' class="thesis-caption"'
            if label:
                inline = f'<span class="thesis-list-label" aria-hidden="true">{html.escape(label)} </span>' + inline
            result = f'<p{attrs}>{self.reference_links(inline)}</p>'
        else:
            result = ''
        return result + self.image_html(p, in_cell)

    def table(self, table):
        number = self.source_table_ids[table]
        rows = table.findall('w:tr', NS)
        image_table = number == 1
        fragments = []
        source_cells = 0
        rendered_cells = 0
        for row_index, row in enumerate(rows):
            cells = []
            col = 0
            for cell in row.findall('w:tc', NS):
                source_cells += 1
                span = cell.find('w:tcPr/w:gridSpan', NS)
                colspan = int(span.get(W + 'val')) if span is not None else 1
                merge = cell.find('w:tcPr/w:vMerge', NS)
                if merge is not None and merge.get(W + 'val') != 'restart':
                    if text_of(cell).strip():
                        raise ValueError('Nonempty vertical-merge continuation needs review')
                    col += colspan
                    continue
                rowspan = 1
                if merge is not None:
                    for next_row in rows[row_index + 1:]:
                        next_col = 0
                        continuation = False
                        for next_cell in next_row.findall('w:tc', NS):
                            next_span = next_cell.find('w:tcPr/w:gridSpan', NS)
                            next_width = int(next_span.get(W + 'val')) if next_span is not None else 1
                            if next_col == col:
                                next_merge = next_cell.find('w:tcPr/w:vMerge', NS)
                                continuation = next_merge is not None and next_merge.get(W + 'val') != 'restart'
                                break
                            next_col += next_width
                        if not continuation:
                            break
                        rowspan += 1
                tag = 'th' if row_index == 0 and not image_table else 'td'
                attrs = ' scope="col"' if tag == 'th' else ''
                if colspan > 1:
                    attrs += f' colspan="{colspan}"'
                if rowspan > 1:
                    attrs += f' rowspan="{rowspan}"'
                value = ''.join(self.paragraph(p, True) for p in cell.findall('w:p', NS))
                cells.append(f'<{tag}{attrs}>{value}</{tag}>')
                rendered_cells += 1
                col += colspan
            fragments.append('<tr>' + ''.join(cells) + '</tr>')
        self.tables.append({'number': number, 'rows': len(rows), 'source_cells': source_cells, 'rendered_cells': rendered_cells, 'image_layout_table': image_table})
        kind = ' thesis-photo-table' if image_table else ''
        return f'<div class="thesis-table-scroll{kind}" role="region" aria-label="論文原表格 {number}" tabindex="0"><table id="source-table-{number}"><tbody>' + ''.join(fragments) + '</tbody></table></div>'

    def render(self):
        blocks = []
        started = False
        in_funding = False
        skip_abstract = False
        for node in self.body:
            tag = ET.QName(node).localname
            if not started:
                # Front matter omitted from the web edition stays in the original PDF.
                if tag == 'p' and text_of(node).strip() == '致謝':
                    started = True
                else:
                    if tag == 'p' and text_of(node).strip() == '本論文獲得':
                        in_funding = True
                    if in_funding and tag == 'p' and text_of(node):
                        self.omitted_sections['funding'].append(self.para_ids[node])
                    continue
            if tag == 'p' and text_of(node).strip() == 'Abstract':
                skip_abstract = True
            if skip_abstract:
                if tag == 'p' and text_of(node).strip().startswith('第一章'):
                    skip_abstract = False
                else:
                    if tag == 'p' and text_of(node):
                        self.omitted_sections['english_abstract'].append(self.para_ids[node])
                    continue
            if tag == 'p':
                blocks.append(self.paragraph(node))
            elif tag == 'tbl':
                blocks.append(self.table(node))
            elif tag == 'sdt':
                # Replace the print TOC (including page fields) with the same headings as links.
                if node.xpath('.//w:instrText[contains(text(), "TOC")]', namespaces=NS):
                    continue
                raise ValueError('Unexpected content control; do not omit it')
        if not started:
            raise ValueError('Original body start was not found')
        chapter_ids = {h['id'] for h in self.headings if re.fullmatch(r'chapter-[1-6]', h['id'])}
        appendix_ids = {h['id'] for h in self.headings if re.fullmatch(r'appendix-[1-7]', h['id'])}
        if len(chapter_ids) != 6 or len(appendix_ids) != 7:
            raise ValueError('The original six chapters or seven appendices are incomplete')
        if len(self.tables) != 16 or len(self.images) != 18 or sorted(self.note_ids) != ['1', '2', '3', '4']:
            raise ValueError('Original table, figure or footnote counts changed; review before importing')
        note_xml = ET.fromstring(self.z.read('word/footnotes.xml'))
        notes = []
        for note in note_xml.findall('w:footnote', NS):
            note_id = note.get(W + 'id')
            if note_id not in self.note_ids:
                continue
            paragraphs = []
            for p in note.findall('w:p', NS):
                text = text_of(p)
                if text:
                    identifier = 'note-source-' + note_id + '-' + str(len(paragraphs) + 1)
                    self.paragraphs.append({'id': identifier, 'text': text, 'numbering': ''})
                    paragraphs.append(f'<p data-thesis-source="{identifier}">{self.inline(p)}</p>')
            notes.append(f'<li id="note-{note_id}">' + ''.join(paragraphs) + f'<a class="thesis-note-back" href="#note-ref-{note_id}" aria-label="返回註腳 {note_id} 引用處">↩</a></li>')
        blocks.append('<section class="thesis-footnotes" aria-labelledby="thesis-notes"><h2 id="thesis-notes">註腳</h2><ol>' + ''.join(notes) + '</ol></section>')
        rendered = '\n'.join(blocks)
        # Word stores floating drawings on an earlier text anchor. Place each
        # figure beside its original caption, matching the PDF reading order.
        for figure_number, figures in self.figures_at_caption.items():
            target = None
            for paragraph in self.body.findall('w:p', NS):
                if re.match(r'^圖\s*' + re.escape(figure_number) + r'(?![\d.])', text_of(paragraph).strip()):
                    target = self.para_ids[paragraph]
                    break
            if target is None:
                raise ValueError(f'Missing original caption for figure {figure_number}')
            pattern = '<p id="' + target + '"'
            if rendered.count(pattern) != 1:
                raise ValueError(f'Ambiguous caption for figure {figure_number}')
            rendered = rendered.replace(pattern, ''.join(figures) + pattern, 1)
        for appendix in range(1, 8):
            refs = self.references[appendix]
            backlinks = ''
            if refs:
                links = '、'.join(f'<a href="#{ref}">{i + 1}</a>' for i, ref in enumerate(refs))
                backlinks = f'<p class="thesis-backlinks" data-pagefind-ignore>返回內文引用：{links}</p>'
            rendered = rendered.replace(f'<!--APPENDIX_BACKLINKS_{appendix}-->', backlinks)
        primary = [h for h in self.headings if h['level'] == 2]
        outline = '<details class="thesis-outline" open data-pagefind-ignore><summary>論文章節與附件</summary><nav aria-label="論文章節與附件"><ul>' + ''.join(f'<li><a href="#{h["id"]}">{html.escape(h["text"])}</a></li>' for h in primary) + '<li><a href="#thesis-notes">註腳</a></li></ul></nav></details>'
        enhanced, self.reader_report = enhance_thesis(outline + '<div class="thesis-document">' + rendered + '</div>')
        return enhanced

    def compare(self, rendered):
        tree = LH.fromstring(rendered)
        errors = []
        expected = {row['id']: row for row in self.paragraphs}
        # Independently enumerate the input body, including every table cell.
        source_expected = {}
        started = False
        skip_abstract = False
        for block in self.body:
            tag = ET.QName(block).localname
            if not started:
                started = tag == 'p' and text_of(block).strip() == '致謝'
            if not started or tag not in ('p', 'tbl'):
                continue
            if tag == 'p' and text_of(block).strip() == 'Abstract':
                skip_abstract = True
            if skip_abstract:
                if tag == 'p' and text_of(block).strip().startswith('第一章'):
                    skip_abstract = False
                else:
                    continue
            source_paragraphs = [block] if tag == 'p' else block.findall('.//w:p', NS)
            for paragraph in source_paragraphs:
                if text_of(paragraph):
                    source_expected[self.para_ids[paragraph]] = text_of(paragraph)
        for key, source_text in source_expected.items():
            if key not in expected or expected[key]['text'] != source_text:
                errors.append({'kind': 'source_paragraph_not_transferred', 'id': key})
        nodes = tree.xpath('//*[@data-thesis-source]')
        ids = tree.xpath('//@id')
        seen = collections.Counter()
        for node in nodes:
            identifier = node.get('data-thesis-source')
            seen[identifier] += 1
            for extra in node.xpath('.//*[contains(concat(" ", normalize-space(@class), " "), " thesis-list-label ") or contains(concat(" ", normalize-space(@class), " "), " thesis-note-ref ")]'):
                extra.drop_tree()
            actual = ''.join(node.itertext())
            if normalized(actual) != normalized(expected[identifier]['text']):
                errors.append({'id': identifier, 'kind': 'text_mismatch', 'expected': expected[identifier]['text'], 'actual': actual})
        for key in expected:
            if seen[key] != 1:
                errors.append({'id': key, 'kind': 'missing_or_duplicate', 'count': seen[key]})
        duplicates = [key for key, count in collections.Counter(ids).items() if count > 1]
        for href in tree.xpath('//a[starts-with(@href,"#")]/@href'):
            if href[1:] not in ids:
                errors.append({'kind': 'missing_fragment', 'href': href})
        if duplicates:
            errors.append({'kind': 'duplicate_ids', 'ids': duplicates})
        return {'compared_paragraphs': len(expected), 'independently_counted_body_paragraphs': len(source_expected), 'compared_nonwhitespace_characters': sum(len(normalized(row['text'])) for row in expected.values()), 'text_differences': errors, 'footnotes': self.note_ids, 'tables': self.tables, 'images': self.images, 'appendix_reference_counts': {str(k): len(v) for k, v in self.references.items()}, 'headings': self.headings, 'external_hyperlinks': self.links, 'numbered_paragraphs': sum(bool(p['numbering']) for p in self.paragraphs)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('docx', type=Path)
    parser.add_argument('--pdf', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--report', type=Path, required=True)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    importer = Importer(args.docx, args.out)
    rendered = importer.render()
    report = importer.compare(rendered)
    report['reader'] = importer.reader_report
    report.update({'source_docx_sha256': hashlib.sha256(args.docx.read_bytes()).hexdigest(), 'source_pdf_sha256': hashlib.sha256(args.pdf.read_bytes()).hexdigest(), 'pdf_pages': len(PdfReader(args.pdf).pages), 'omitted_sections': importer.omitted_sections, 'scope': 'Author-requested exclusions: funding acknowledgement and English abstract. Retain acknowledgements, Chinese abstract, six chapters, references, seven appendices and all four footnotes. Cover/approval scans remain in PDF; web TOC replaces print TOC.'})
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    if report['text_differences']:
        raise ValueError(f'Comparison failed: {len(report["text_differences"])} differences; see {args.report}')
    (args.out / 'thesis-body.html').write_text(rendered, encoding='utf-8')
    # The author's PDF is private review material, never a website resource.
    print(json.dumps({key: report[key] for key in ('compared_paragraphs', 'compared_nonwhitespace_characters', 'footnotes', 'numbered_paragraphs', 'external_hyperlinks', 'appendix_reference_counts', 'pdf_pages')}, ensure_ascii=False))
    print(f'Tables: {len(importer.tables)}; images: {len(importer.images)}; text differences: 0')


if __name__ == '__main__':
    main()
