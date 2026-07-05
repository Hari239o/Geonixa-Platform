import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("⏳ Connecting to Supabase PostgreSQL...");
    
    // Create a test user
    const testUser = await prisma.user.upsert({
      where: { phone: "+918888888888" },
      update: {},
      create: {
        phone: "+918888888888",
        role: "admin",
      }
    });

    console.log("✅ SUCCESS! Connected to Supabase perfectly!");
    console.log("🎉 Test User Created:", testUser);
    
  } catch (error) {
    console.error("❌ ERROR CONNECTING TO SUPABASE:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
