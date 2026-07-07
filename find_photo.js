const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.wcqwezsngpcewmluezbu:Kalinq%402026@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
  });
  
  await client.connect();
  
  try {
    const res = await client.query('SELECT "profilePic" FROM "CreatorProfile" WHERE "profilePic" IS NOT NULL LIMIT 10');
    console.log("Creator profile pics:", res.rows);
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await client.end();
  }
}

main();
