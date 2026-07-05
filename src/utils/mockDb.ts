import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'local_db.json');

// Initialize DB file if it doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ creators: [], campaigns: [] }), 'utf-8');
}

export function readDb() {
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
}

export function writeDb(data: any) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}
