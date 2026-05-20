from pathlib import Path
import re

text = Path('src/data/questions_data.ts').read_text(encoding='utf-8')

for pool in ['WEB_DEV_POOL','JAVA_POOL','PYTHON_POOL','DATA_SCIENCE_POOL','DSA_HARD_POOL']:
    start = text.find(f'export const {pool} = [')
    if start == -1:
        print(pool, 'missing')
        continue
    snippet = text[start:]
    brace = 0
    objects = []
    cur = ''
    in_obj = False
    depth = 0
    for i,ch in enumerate(snippet):
        if ch == '{':
            depth += 1
            if depth == 1:
                in_obj = True
                cur = '{'
            elif in_obj:
                cur += '{'
        elif ch == '}':
            if in_obj:
                cur += '}'
            depth -= 1
            if in_obj and depth == 0:
                objects.append(cur)
                cur = ''
                in_obj = False
        elif in_obj:
            cur += ch
        if depth < 0:
            break
    print(pool, 'objects', len(objects))
    for idx,obj in enumerate(objects[:10],1):
        title_match = re.search(r'title:\s*"([^"]+)"', obj)
        title = title_match.group(1) if title_match else f'obj{idx}'
        tests_match = re.search(r'tests:\s*\[', obj)
        if not tests_match:
            print(' ', idx, title, 'NO tests key')
            continue
        start = tests_match.end()
        level = 0
        end = start
        while end < len(obj):
            if obj[end] == '[':
                level += 1
            elif obj[end] == ']':
                if level == 0:
                    break
                level -= 1
            end += 1
        tests_block = obj[start:end]
        tests_count = len(re.findall(r'id:\s*\d+', tests_block))
        print(' ', idx, title, 'tests', tests_count)
    print('---')
