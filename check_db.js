require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const creators = await prisma.creatorProfile.findMany({
    select: {
      id: true,
      userId: true,
      fullName: true,
      instagram: true,
      facebook: true,
      x: true,
      linkedin: true
    }
  });
  console.log("CREATORS IN DB:");
  console.table(creators);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
