const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../src/data/questions_data.ts');
const text = fs.readFileSync(file, 'utf8');

const re = /title:\s*(["'`])([\s\S]*?)\1[\s\S]*?tests:\s*\[([\s\S]*?)\]/g;
let m;
const results = [];
while ((m = re.exec(text)) !== null) {
  const title = m[2].replace(/\s+/g, ' ').trim();
  const testsBlock = m[3];
  const ids = testsBlock.match(/\b(id)\s*:\s*\d+/g);
  const total = ids ? ids.length : 0;
  const hiddenMatches = testsBlock.match(/isHidden\s*:\s*true/g);
  const hidden = hiddenMatches ? hiddenMatches.length : 0;
  const visible = total - hidden;
  results.push({ title, total, hidden, visible });
}

results.forEach(r => {
  if (r.visible < 10) console.log(`${r.visible} visible / ${r.total} total / ${r.hidden} hidden\t${r.title}`);
});
const low = results.filter(r => r.visible < 10);
fs.writeFileSync(path.resolve(__dirname, 'low_visible.json'), JSON.stringify(low, null, 2), 'utf8');
console.log(`Wrote ${low.length} items to scripts/low_visible.json`);
console.log(`\nTotal questions scanned: ${results.length}`);
