import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const brands = await prisma.brandProfile.findMany();
  console.log('Brands:', brands);
}
main().finally(() => prisma.$disconnect());
