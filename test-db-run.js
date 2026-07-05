const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log("-----------------------------------------")
  console.log("🛠️  CREATING DUMMY DATA IN DATABASE...")
  console.log("-----------------------------------------\n")

  try {
    // 1. Create a dummy user
    const user = await prisma.user.create({
      data: {
        email: `dummy_${Date.now()}@example.com`,
        name: "Test User",
        role: "creator",
        profileCompleted: true
      }
    })
    console.log("✅ DUMMY USER CREATED:")
    console.log(JSON.stringify(user, null, 2))
    console.log("\n")

    // 2. Create a dummy CreatorProfile
    const profile = await prisma.creatorProfile.create({
      data: {
        userId: user.id,
        fullName: "Test Creator",
        bio: "This is a dummy bio created for testing purposes.",
        category: "Content Creator",
        website: "https://www.example.com",
        phone: "555-123-4567",
        teamMembers: "1-10",
        brandType: "UGC"
      }
    })
    console.log("✅ DUMMY CREATOR PROFILE CREATED:")
    console.log(JSON.stringify(profile, null, 2))
    console.log("\n")

    // 3. Create a dummy Campaign
    const campaign = await prisma.campaign.create({
      data: {
        userId: user.id,
        title: "Dummy Fall Collection Campaign",
        subtitle: "Looking for 10 creators",
        budget: "$1000 - $5000",
        dateRange: "Oct 2026 - Nov 2026",
        description: "This is a dummy campaign used to verify database connectivity and schema integrity.",
        daysLeft: "30"
      }
    })
    console.log("✅ DUMMY CAMPAIGN CREATED:")
    console.log(JSON.stringify(campaign, null, 2))
    console.log("\n")

    console.log("🎉 ALL DATA CREATED SUCCESSFULLY!")

  } catch (error) {
    console.error("❌ ERROR CREATING DUMMY DATA:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
