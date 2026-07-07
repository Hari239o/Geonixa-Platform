const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.wcqwezsngpcewmluezbu:Kalinq%402026@aws-1-ap-south-1.pooler.supabase.com:6543/postgres' });
client.connect().then(() => {
  console.log('Connected!');
  return client.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT, ADD COLUMN IF NOT EXISTS "resetToken" TEXT, ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3);');
}).then(() => {
  console.log('Altered table successfully!');
}).catch(e => console.log('Error:', e.message)).finally(() => client.end());
