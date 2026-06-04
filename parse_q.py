import re
import json

with open("question_bank/20_hard_questions.md", "r", encoding="utf-8") as f:
    content = f.read()

questions = []
# split by ## Q
parts = re.split(r'## Q\d+ — ', content)
for part in parts[1:]:
    # parse out the fields
    lines = part.strip().split('\n')
    title = lines[0].strip()
    
    desc_match = re.search(r'Problem statement:\s*(.*?)\s*Constraints:', part, re.DOTALL)
    constraints_match = re.search(r'Constraints:\s*(.*?)\s*(?:Input format|Input/output format|I/O|Input/Output):', part, re.DOTALL)
    io_match = re.search(r'(?:Input format|Input/output format|I/O|Input/Output)[:s]*\s*(.*?)\s*(?:Output format|Time|Example)', part, re.DOTALL)
    
    desc = desc_match.group(1).strip() if desc_match else ""
    constraints = constraints_match.group(1).strip() if constraints_match else ""
    
    q_obj = {
        "title": title,
        "desc": desc + "\n\nConstraints:\n" + constraints,
        "objective": "Solve the problem optimally.",
        "task": "Implement an optimized approach.",
        "inputFormat": io_match.group(1).strip() if io_match else "Refer to problem description.",
        "outputFormat": "Refer to problem description.",
        "initialCode": "function solve(input) {\n    // Complete your solution here\n}",
        "difficulty": "HARD",
        "tests": [
            {
                "id": 1,
                "input": "Hidden",
                "expectedOutput": "Hidden",
                "isHidden": True,
                "category": "EVALUATION",
                "difficulty": "HARD",
                "timeLimit": 2000,
                "memoryLimit": 256,
                "description": "Standard hidden testcase."
            }
        ]
    }
    questions.append(q_obj)

# Create TS file
ts_content = "export const NEW_HARDCORE_DSA_POOL = " + json.dumps(questions, indent=2) + ";\n"
with open("src/data/hardcore_dsa_pool.ts", "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"Generated {len(questions)} questions.")
