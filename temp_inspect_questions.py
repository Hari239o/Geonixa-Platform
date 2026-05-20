import re
from pathlib import Path
path = Path('src/data/questions_data.ts')
text = path.read_text(encoding='utf-8')
for pool in ['WEB_DEV_POOL','JAVA_POOL','PYTHON_POOL','DATA_SCIENCE_POOL', 'DSA_HARD_POOL']:
    idx = text.find(f'export const {pool} = [')
    if idx == -1:
        print(pool, 'not found')
        continue
    sub = text[idx:]
    titles = re.findall(r"\n\s*title:\s*\"", sub)
    print(pool, 'objects', len(titles))
    tests_idx = sub.find('tests: [')
    if tests_idx != -1:
        after = sub[tests_idx:tests_idx+1200]
        tests = re.findall(r'\{[^}]*id:\s*\d+[^}]*\}', after)
        print(pool, 'first tests count estimated', len(tests))
        print('snippet:', after[:500].replace('\n','\\n'))
    print('---')
