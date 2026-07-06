const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRoles() {
  const result = await prisma.user.updateMany({
    where: {
      creatorProfile: {
        brandType: { not: null }
      }
    },
    data: { role: 'brand' }
  });
  console.log('Fixed', result.count, 'users to brand role');
}

fixRoles().catch(console.error).finally(() => prisma.$disconnect());
