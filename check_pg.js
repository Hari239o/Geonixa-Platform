const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.wcqwezsngpcewmluezbu:Kalinq%402026@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
  });
  
  await client.connect();
  
  try {
    const res = await client.query('SELECT * FROM "User"');
    console.log("USERS:");
    console.table(res.rows.map(r => ({ id: r.id, email: r.email, role: r.role, profileCompleted: r.profileCompleted })));
    
    const brands = await client.query('SELECT * FROM "BrandProfile"');
    console.log("\nBRAND PROFILES:");
    console.table(brands.rows);
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await client.end();
  }
}

main();
