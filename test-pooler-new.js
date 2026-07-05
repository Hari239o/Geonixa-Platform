const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
