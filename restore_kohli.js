const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.wcqwezsngpcewmluezbu:Kalinq%402026@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
  });
  
  await client.connect();
  
  try {
    const userId = 'a1ff544b-cdc0-4265-8276-feb5b91ff7c9';
    
    // Insert the Kohli profile manually
    const query = `
      INSERT INTO "BrandProfile" ("id", "userId", "fullName", "bio", "website", "phone", "brandType", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'company', NOW())
      ON CONFLICT ("userId") DO UPDATE
      SET "fullName" = EXCLUDED."fullName", "bio" = EXCLUDED."bio", "website" = EXCLUDED."website", "phone" = EXCLUDED."phone", "updatedAt" = EXCLUDED."updatedAt"
    `;
    
    await client.query(query, [
      userId,
      'Kohli',
      'Jersey no 18',
      'www.kohli.com',
      '1470852369'
    ]);
    
    console.log("Successfully restored Kohli profile!");
    
    const brands = await client.query('SELECT * FROM "BrandProfile"');
    console.table(brands.rows);
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await client.end();
  }
}

main();
