const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const u = await prisma.user.findFirst({ include: { brandProfile: true, creatorProfile: true } });
  console.log("USER:", JSON.stringify(u, null, 2));
}
main().finally(() => prisma.$disconnect());
