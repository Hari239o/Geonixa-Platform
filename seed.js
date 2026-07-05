const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Creating dummy user...");
  const user = await prisma.user.create({
    data: {
      phone: "+919876543210",
      role: "admin",
    }
  });
  console.log("Dummy user created successfully:", user);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
