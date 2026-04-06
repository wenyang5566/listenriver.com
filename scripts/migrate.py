import os
import re
import argparse

CATEGORY_MAP = {
    "閱讀心得": "閱讀筆記",
    "書摘": "閱讀筆記",
    "閱讀書摘": "閱讀筆記",
    "一行禪師": "閱讀筆記",
    "電影心得": "電影筆記",
    "日常書寫": "日常書寫",
    "凝視日常": "日常書寫",
    "日常生活凝視": "日常書寫",
    "自我成長": "自我成長",
    "成為一個人": "自我成長",
    "受苦的倒影": "自我成長",
    "講座筆記": "社會工作",
    "講座心得": "社會工作",
    "會所模式": "社會工作",
    "會所工作日誌": "社會工作",
    "會所工作手冊": "社會工作",
    "會所實習": "社會工作",
    "開放式對話": "社會工作",
    "聆聽疼痛計畫": "社會工作",
    "創傷知情": "社會工作",
    "邁向助人工作": "社會工作",
    "家族治療": "社會工作",
    "親密關係": "社會工作",
    "建制民族誌": "社會工作"
}

MAIN_CATEGORIES = ["閱讀筆記", "電影筆記", "社會工作", "自我成長", "日常書寫"]

def migrate_file(filepath, dry_run):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Standardize line endings before checking
    content = content.replace('\r\n', '\n')
    
    match = re.match(r'^(---.*?---)(.*)$', content, re.DOTALL)
    if not match:
        return False
    
    fm_raw = match.group(1)
    body = match.group(2)
    
    lines = fm_raw.split('\n')
    fmLines = lines[1:-1]
    
    in_cat, in_tag, in_topic = False, False, False
    new_categories = []
    new_tags = []
    is_featured = False
    other_lines = []
    
    for line in fmLines:
        if not line.strip(): continue
        
        if line.startswith('categories:'):
            in_cat, in_tag, in_topic = True, False, False
            continue
        elif line.startswith('tags:'):
            in_tag, in_cat, in_topic = True, False, False
            continue
        elif line.startswith('topics:'):
            in_topic, in_cat, in_tag = True, False, False
            continue
        
        if re.match(r'^[a-zA-Z0-9_-]+:', line):
            in_cat, in_tag, in_topic = False, False, False
            if not line.startswith('featured:'):
                other_lines.append(line)
            continue
            
        m = re.match(r'^\s*-\s*["\']?([^"\'\n]+)["\']?', line)
        if m:
            val = m.group(1).strip()
            if in_cat:
                if val == "精選文章":
                    is_featured = True
                elif val in CATEGORY_MAP:
                    mapped = CATEGORY_MAP[val]
                    if mapped not in new_categories: new_categories.append(mapped)
                elif val in MAIN_CATEGORIES:
                    if val not in new_categories: new_categories.append(val)
                else:
                    if val not in new_tags: new_tags.append(val)
            elif in_tag:
                if val == "精選文章":
                    is_featured = True
                else:
                    if val not in new_tags: new_tags.append(val)
            elif in_topic:
                if val not in new_tags: new_tags.append(val)
            else:
                other_lines.append(line)
        else:
            other_lines.append(line)
            
    if not new_categories:
        new_categories.append("日常書寫")
        
    new_fm = ["---"] + other_lines
    if is_featured:
        new_fm.append("featured: true")
    
    if new_categories:
        new_fm.append("categories:")
        for c in new_categories: new_fm.append(f"  - {c}")
        
    if new_tags:
        new_fm.append("tags:")
        for t in new_tags: new_fm.append(f"  - {t}")
        
    new_fm.append("---")
    
    new_content = "\n".join(new_fm) + body
    if not new_content.endswith('\n'):
        new_content += '\n'
        
    if content.strip() != new_content.strip():
        if not dry_run:
            with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
                f.write(new_content)
        return True
    return False

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    
    blog_dir = 'content/blog'
    modified_count = 0
    for root, dirs, files in os.walk(blog_dir):
        for name in files:
            if name.endswith('.md'):
                path = os.path.join(root, name)
                try:
                    if migrate_file(path, args.dry_run):
                        modified_count += 1
                        print(f"Modified: {path}")
                except Exception as e:
                    print(f"Error processing {path}: {e}")
                    
    print(f"Total modified: {modified_count}")
