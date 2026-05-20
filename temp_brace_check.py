from pathlib import Path
text = Path('src/app/admin/dashboard/page.tsx').read_text(encoding='utf-8')
start = text.index('loadingDetails ? (')
end = text.index(')}\n              </div>', start) + len(')}\n              </div>')
snippet = text[start:end]
print('---SNIPPET START---')
print(snippet)
print('---SNIPPET END---')
paren = brace = bracket = 0
for i,ch in enumerate(snippet):
    if ch == '(':
        paren += 1
    elif ch == ')':
        paren -= 1
    elif ch == '{':
        brace += 1
    elif ch == '}':
        brace -= 1
    elif ch == '[':
        bracket += 1
    elif ch == ']':
        bracket -= 1
    if paren < 0 or brace < 0 or bracket < 0:
        print('negative at', i, ch, 'paren', paren, 'brace', brace, 'bracket', bracket)
        break
print('final counts', paren, brace, bracket)
lines = snippet.splitlines()
for i,line in enumerate(lines[-15:], start=len(lines)-14):
    print(i+1, repr(line))
