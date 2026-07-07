import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;
    if (!userId && session?.user?.email) {
      const user = await prisma.user.findFirst({ where: { email: session.user.email }});
      if (user) userId = user.id;
    }
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const brand = await prisma.brandProfile.findUnique({ where: { userId } });
    if (!brand) return NextResponse.json({ success: false, error: "Must be a brand" }, { status: 403 });

    const { campaignId, creatorId } = await request.json();
    if (!campaignId || !creatorId) return NextResponse.json({ success: false, error: "Missing ids" }, { status: 400 });

    const creatorProfile = await prisma.creatorProfile.findUnique({ where: { id: creatorId } });
    if (!creatorProfile) return NextResponse.json({ success: false, error: "Creator not found" }, { status: 404 });

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });

    // Ensure it's not a duplicate
    const existing = await prisma.campaignInvite.findUnique({
      where: {
        campaignId_creatorId: {
          campaignId,
          creatorId
        }
      }
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "Invite already sent" }, { status: 400 });
    }

    const invite = await prisma.campaignInvite.create({
      data: {
        campaignId,
        creatorId,
        brandId: brand.id,
        status: "PENDING"
      }
    });

    // Create a local notification for the creator
    await prisma.notification.create({
      data: {
        userId: creatorProfile.userId,
        title: "New Campaign Invite",
        message: `${brand.fullName || 'A brand'} invited you to their campaign: ${campaign.title}`,
        actionUrl: "/creator",
        actionLabel: "View Request"
      }
    });

    // Update the campaign's invitedCreators array for backwards compatibility (optional but safe)
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        invitedCreators: {
          push: creatorId
        }
      }
    });

    return NextResponse.json({ success: true, invite });
  } catch (error: any) {
    console.error("POST /api/campaigns/invite error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
