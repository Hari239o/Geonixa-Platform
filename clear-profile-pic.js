const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Clear the hardcoded/inbuilt photo for all creators to remove it permanently
    await prisma.creatorProfile.updateMany({
      data: {
        profilePic: null,
      }
    });
    console.log("✅ Successfully removed profile photos from the database.");
  } catch (error) {
    console.error("❌ Error clearing photos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
