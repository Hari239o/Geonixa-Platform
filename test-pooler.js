const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.wcqwezsngpcewmluezbu:Kalinq%402026@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
});

async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log("SUCCESS! Connected to pooler. Found user:", user?.id || "None");
  } catch (e) {
    console.error("FAILED TO CONNECT TO POOLER:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
