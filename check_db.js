const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const brands = await prisma.brandProfile.findMany();
    console.log("BRAND PROFILES:", brands);
    
    const users = await prisma.user.findMany({
      include: { brandProfile: true, creatorProfile: true }
    });
    console.log("\nALL USERS:", JSON.stringify(users, null, 2));
  } catch (e) {
    console.error("DB ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
