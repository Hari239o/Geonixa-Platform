const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const envPath = path.join(process.cwd(), '.env.local');
let uri = process.env.MONGODB_URI;
if (!uri && fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/^\s*MONGODB_URI\s*=\s*(.+)\s*$/m);
  if (match) {
    uri = match[1].trim().replace(/^"(.+)"$/, '$1');
  }
}

if (!uri) {
  console.error('MONGODB_URI not found in environment or .env.local');
  process.exit(2);
}

(async () => {
  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('CONNECTED');
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error('ERROR', err.message || err);
    process.exit(1);
  }
})();
