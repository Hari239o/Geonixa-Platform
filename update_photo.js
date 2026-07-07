const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.wcqwezsngpcewmluezbu:Kalinq%402026@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
  });
  
  await client.connect();
  
  try {
    const userId = 'a1ff544b-cdc0-4265-8276-feb5b91ff7c9';
    const photoUrl = 'https://pub-28781f5e00a345e5a46019b14becca74.r2.dev/2a243d44-227c-4b61-b382-bfbd5999a196.jpeg';
    
    await client.query('UPDATE "BrandProfile" SET "profilePic" = $1 WHERE "userId" = $2', [photoUrl, userId]);
    
    console.log("Successfully restored Kohli photo!");
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await client.end();
  }
}

main();
