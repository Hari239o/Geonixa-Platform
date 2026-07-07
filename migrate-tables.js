const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting migration...");

  try {
    // CampaignRequest
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CampaignRequest" (
          "id" TEXT NOT NULL,
          "campaignId" TEXT NOT NULL,
          "creatorId" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'pending',
          "message" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "CampaignRequest_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("Created CampaignRequest table");

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "CampaignRequest" ADD CONSTRAINT "CampaignRequest_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `).catch(e => console.log("FK CampaignRequest_campaignId_fkey might already exist"));

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "CampaignRequest" ADD CONSTRAINT "CampaignRequest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `).catch(e => console.log("FK CampaignRequest_creatorId_fkey might already exist"));

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "CampaignRequest_campaignId_creatorId_key" ON "CampaignRequest"("campaignId", "creatorId");
    `);

    // CampaignInvite
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CampaignInvite" (
          "id" TEXT NOT NULL,
          "campaignId" TEXT NOT NULL,
          "creatorId" TEXT NOT NULL,
          "brandId" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "negotiatedPrice" TEXT,
          "message" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "CampaignInvite_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("Created CampaignInvite table");

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "CampaignInvite" ADD CONSTRAINT "CampaignInvite_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `).catch(e => console.log("FK CampaignInvite_campaignId_fkey might already exist"));

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "CampaignInvite" ADD CONSTRAINT "CampaignInvite_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `).catch(e => console.log("FK CampaignInvite_creatorId_fkey might already exist"));

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "CampaignInvite" ADD CONSTRAINT "CampaignInvite_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "BrandProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `).catch(e => console.log("FK CampaignInvite_brandId_fkey might already exist"));

    // Notification senderImage
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Notification" ADD COLUMN "senderImage" TEXT;
    `).catch(e => console.log("Notification senderImage might already exist"));

    console.log("Migration complete!");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
