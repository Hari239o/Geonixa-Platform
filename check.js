const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const creators = await prisma.creatorProfile.findMany({ include: { user: true } });
  console.log('Creators:', creators.length);
  const users = await prisma.user.findMany();
  console.log('Users:', users.map(u => ({ id: u.id, role: u.role, name: u.name, email: u.email })));
}

main().finally(() => prisma.$disconnect());
