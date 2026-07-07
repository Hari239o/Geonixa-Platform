const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const brands = await prisma.brandProfile.findMany({ include: { user: true } });
  console.log('Brands:', JSON.stringify(brands, null, 2));
}
main().finally(() => prisma.$disconnect());
