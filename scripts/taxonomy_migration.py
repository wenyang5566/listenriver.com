#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parent.parent
CONTENT_ROOT = ROOT / "content"
BLOG_ROOT = CONTENT_ROOT / "blog"
REPORT_PATH = ROOT / "migration-report.md"

FINAL_CATEGORIES = {
    "閱讀與筆記",
    "病痛經驗",
    "工作者反思",
    "自我成長",
    "日常書寫",
}

LEGACY_CATEGORY_TO_FINAL = {
    "閱讀筆記": "閱讀與筆記",
    "電影筆記": "閱讀與筆記",
    "社會工作": "工作者反思",
    "書摘": "閱讀與筆記",
    "講座筆記": "閱讀與筆記",
    "講座心得": "閱讀與筆記",
    "閱讀心得": "閱讀與筆記",
    "電影心得": "閱讀與筆記",
    "素描": "閱讀與筆記",
    "親密關係": "自我成長",
    "成為一個人": "自我成長",
    "正念的河流": "自我成長",
    "邁向助人工作": "工作者反思",
    "開放式對話": "工作者反思",
    "創傷知情": "工作者反思",
    "家族治療": "工作者反思",
    "受苦的倒影": "工作者反思",
    "建制民族誌": "工作者反思",
    "會所模式": "工作者反思",
    "會所實習": "工作者反思",
    "會所工作日誌": "工作者反思",
    "會所工作手冊": "工作者反思",
    "聆聽疼痛計畫": "病痛經驗",
}

SOURCE_TO_TAGS = {
    "書摘": ["書摘"],
    "講座筆記": ["講座筆記"],
    "講座心得": ["講座心得"],
    "閱讀心得": ["閱讀心得"],
    "電影心得": ["電影心得"],
    "素描": ["素描"],
    "親密關係": ["親密關係"],
    "成為一個人": ["成為一個人"],
    "正念的河流": ["正念的河流"],
    "邁向助人工作": ["邁向助人工作"],
    "開放式對話": ["開放式對話"],
    "創傷知情": ["創傷知情"],
    "家族治療": ["家族治療"],
    "受苦的倒影": ["受苦的倒影"],
    "建制民族誌": ["建制民族誌"],
    "會所模式": ["會所模式", "會所"],
    "會所實習": ["會所實習", "會所", "實習"],
    "會所工作日誌": ["會所工作日誌", "會所", "工作日誌"],
    "會所工作手冊": ["會所工作手冊", "會所", "工作手冊"],
    "聆聽疼痛計畫": ["聆聽疼痛計畫"],
}

LEGACY_FALLBACK_FROM_PATH = {
    "一行禪師": "閱讀筆記",
}

KEY_RE = re.compile(r"^([A-Za-z0-9_-]+):(.*)$")
LIST_ITEM_RE = re.compile(r"^\s*-\s*(.+?)\s*$")


@dataclass
class FileChange:
    path: Path
    final_category: str | None
    categories_before: list[str]
    categories_after: list[str]
    tags_before: list[str]
    tags_after: list[str]
    removed_topics: list[str]
    reason: str
    changed: bool


def normalize_list_value(value: str) -> str:
    value = value.strip()
    if value.startswith(("'", '"')) and value.endswith(("'", '"')) and len(value) >= 2:
        value = value[1:-1]
    return value.strip()


def split_front_matter(text: str) -> tuple[str, str, str] | None:
    normalized = text.replace("\r\n", "\n")
    if not normalized.startswith("---\n"):
        return None
    end = normalized.find("\n---\n", 4)
    if end == -1:
        return None
    return "---", normalized[4:end], normalized[end + 5 :]


def parse_front_matter_block(front_matter: str) -> tuple[list[str], dict[str, list[str]]]:
    lines = front_matter.split("\n")
    preserved: list[str] = []
    taxonomies = {"category": [], "categories": [], "tag": [], "tags": [], "topic": [], "topics": []}
    active_key: str | None = None

    for line in lines:
        key_match = KEY_RE.match(line)
        if key_match:
            key = key_match.group(1)
            raw_value = key_match.group(2).strip()
            if key in taxonomies:
                active_key = key
                if raw_value:
                    taxonomies[key].append(normalize_list_value(raw_value))
                continue
            preserved.append(line)
            active_key = None
            continue

        item_match = LIST_ITEM_RE.match(line)
        if item_match and active_key in taxonomies:
            taxonomies[active_key].append(normalize_list_value(item_match.group(1)))
            continue

        preserved.append(line)
        if line.strip():
            active_key = None

    return preserved, taxonomies


def path_tokens(path: Path) -> list[str]:
    tokens: list[str] = []
    try:
        relative = path.relative_to(CONTENT_ROOT)
    except ValueError:
        return tokens

    for part in relative.parts[:-1]:
        if part == "blog":
            continue
        tokens.append(part)
    return tokens


def pick_final_category(path: Path, categories_before: list[str]) -> tuple[str, str]:
    tokens = path_tokens(path)

    for token in tokens:
        if token in LEGACY_CATEGORY_TO_FINAL:
            return LEGACY_CATEGORY_TO_FINAL[token], f"path:{token}"
        if token in FINAL_CATEGORIES:
            return token, f"path:{token}"
        if token in LEGACY_FALLBACK_FROM_PATH:
            return LEGACY_FALLBACK_FROM_PATH[token], f"path-fallback:{token}"

    for category in categories_before:
        if category in LEGACY_CATEGORY_TO_FINAL:
            return LEGACY_CATEGORY_TO_FINAL[category], f"category:{category}"
        if category in FINAL_CATEGORIES:
            return category, f"category:{category}"

    return "日常書寫", "default:日常書寫"


def ordered_unique(values: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        cleaned = value.strip()
        if not cleaned or cleaned in seen:
            continue
        seen.add(cleaned)
        result.append(cleaned)
    return result


def derive_tags(path: Path, categories_before: list[str], tags_before: list[str], topics_before: list[str], final_category: str) -> list[str]:
    tags = ordered_unique([*tags_before, *topics_before])

    for source in [*path_tokens(path), *categories_before]:
        for tag in SOURCE_TO_TAGS.get(source, []):
            if tag not in tags:
                tags.append(tag)

    tags = [tag for tag in tags if tag not in FINAL_CATEGORIES]
    tags = [tag for tag in tags if tag != final_category]

    return ordered_unique(tags)


def rebuild_front_matter(preserved: list[str], category: str, tags: list[str]) -> str:
    lines = ["---"]
    while preserved and preserved[0] == "":
        preserved = preserved[1:]
    while preserved and preserved[-1] == "":
        preserved = preserved[:-1]

    lines.extend(preserved)
    if preserved:
        lines.append("")

    lines.append("categories:")
    lines.append(f"  - {category}")

    if tags:
        lines.append("tags:")
        for tag in tags:
            lines.append(f"  - {tag}")

    lines.append("---")
    return "\n".join(lines)


def migrate_file(path: Path, dry_run: bool) -> FileChange | None:
    text = path.read_text(encoding="utf-8", errors="ignore")
    parts = split_front_matter(text)
    if not parts:
        return None

    _, front_matter, body = parts
    preserved, taxonomies = parse_front_matter_block(front_matter)

    categories_before = ordered_unique([*taxonomies["category"], *taxonomies["categories"]])
    tags_before = ordered_unique([*taxonomies["tag"], *taxonomies["tags"]])
    topics_before = ordered_unique([*taxonomies["topic"], *taxonomies["topics"]])

    final_category, reason = pick_final_category(path, categories_before)
    tags_after = derive_tags(path, categories_before, tags_before, topics_before, final_category)
    categories_after = [final_category]

    new_front_matter = rebuild_front_matter(preserved, final_category, tags_after)
    new_content = f"{new_front_matter}\n{body.lstrip(chr(10))}"
    if not new_content.endswith("\n"):
        new_content += "\n"

    old_normalized = text.replace("\r\n", "\n")
    changed = old_normalized != new_content

    if changed and not dry_run:
        path.write_text(new_content, encoding="utf-8", newline="\n")

    return FileChange(
        path=path.relative_to(ROOT),
        final_category=final_category,
        categories_before=categories_before,
        categories_after=categories_after,
        tags_before=tags_before,
        tags_after=tags_after,
        removed_topics=topics_before,
        reason=reason,
        changed=changed,
    )


def scan_markdown_files() -> list[Path]:
    return sorted(
        path
        for path in BLOG_ROOT.rglob("*.md")
        if path.is_file() and path.name != "_index.md"
    )


def write_report(results: list[FileChange], dry_run: bool) -> None:
    changed = [result for result in results if result.changed]
    category_counts = Counter()
    tag_counts = Counter()
    topic_removed_count = 0
    changed_by_category: defaultdict[str, list[FileChange]] = defaultdict(list)

    for result in results:
        if result.final_category:
            category_counts[result.final_category] += 1
        tag_counts.update(result.tags_after)
        topic_removed_count += len(result.removed_topics)
        if result.changed and result.final_category:
            changed_by_category[result.final_category].append(result)

    lines = [
        "# Taxonomy Migration Report",
        "",
        f"- Mode: {'dry-run' if dry_run else 'write'}",
        f"- Markdown files scanned: {len(results)}",
        f"- Files changed: {len(changed)}",
        f"- Topics fields removed: {topic_removed_count}",
        "",
        "## Final Category Counts",
        "",
    ]

    for category in ["閱讀與筆記", "日常書寫", "自我成長", "工作者反思", "病痛經驗"]:
        lines.append(f"- {category}: {category_counts.get(category, 0)}")

    lines.extend([
        "",
        "## Files Changed By Category",
        "",
    ])

    for category in ["閱讀與筆記", "日常書寫", "自我成長", "工作者反思", "病痛經驗"]:
        lines.append(f"### {category}")
        items = changed_by_category.get(category, [])
        if not items:
            lines.append("")
            lines.append("- No changes")
            lines.append("")
            continue

        lines.append("")
        for result in items:
            before_cats = ", ".join(result.categories_before) if result.categories_before else "none"
            after_tags = ", ".join(result.tags_after) if result.tags_after else "none"
            removed_topics = ", ".join(result.removed_topics) if result.removed_topics else "none"
            lines.append(f"- `{result.path.as_posix()}`")
            lines.append(f"  category: {before_cats} -> {result.final_category}")
            lines.append(f"  tags: {after_tags}")
            lines.append(f"  removed topics: {removed_topics}")
            lines.append(f"  decision: {result.reason}")
        lines.append("")

    lines.extend([
        "## Top Tags After Migration",
        "",
    ])

    for tag, count in tag_counts.most_common(20):
        lines.append(f"- {tag}: {count}")

    REPORT_PATH.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8", newline="\n")


def main() -> int:
    parser = argparse.ArgumentParser(description="Normalize ListenRiver taxonomies.")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without modifying markdown files.")
    args = parser.parse_args()

    results: list[FileChange] = []
    for path in scan_markdown_files():
        change = migrate_file(path, dry_run=args.dry_run)
        if change is not None:
            results.append(change)

    write_report(results, dry_run=args.dry_run)

    changed = [result for result in results if result.changed]
    print(f"Scanned {len(results)} markdown files.")
    print(f"{'Would change' if args.dry_run else 'Changed'} {len(changed)} files.")
    print(f"Report written to {REPORT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
