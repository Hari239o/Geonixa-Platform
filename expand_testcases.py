import re
import json

file_path = "src/data/hardcore_dsa_pool.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Generate 10 testcases string
testcases = []
for i in range(1, 11):
    if i <= 3:
        tc = f'''      {{
        "id": {i},
        "input": "Sample Input {i}\\n...",
        "expectedOutput": "Sample Output {i}\\n...",
        "isHidden": false,
        "category": "SAMPLE",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Sample testcase {i}."
      }}'''
    else:
        tc = f'''      {{
        "id": {i},
        "input": "Hidden",
        "expectedOutput": "Hidden",
        "isHidden": true,
        "category": "EVALUATION",
        "difficulty": "HARD",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "description": "Evaluation testcase {i}."
      }}'''
    testcases.append(tc)

tests_str = '"tests": [\n' + ',\n'.join(testcases) + '\n    ]'

# Replace the existing tests arrays
new_content = re.sub(r'"tests":\s*\[\s*\{[^]]+\}\s*\]', tests_str, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Testcases expanded successfully!")
