import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get('role');
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;
    if (!userId && session?.user?.email) {
      const user = await prisma.user.findFirst({ where: { email: session.user.email }});
      if (user) userId = user.id;
    }

    if (!userId) {
       return NextResponse.json({ success: true, campaigns: [] });
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId }
    });

    const brand = await prisma.brandProfile.findUnique({
      where: { userId }
    });

    if (brand && roleParam !== 'creator') {
      // If user is a brand, return their own created campaigns
      const brandCampaigns = await prisma.campaign.findMany({
        where: { userId },
        include: {
          user: { select: { brandProfile: { select: { profilePic: true } } } },
          campaignInvites: {
            include: { creator: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, campaigns: brandCampaigns });
    }

    if (!creator || !creator.isVerified) {
      return NextResponse.json({ success: true, campaigns: [] });
    }

    const orConditions: any[] = [
      { category: "Creators" } // Fallback for legacy campaigns created before category options were updated
    ];
    if (creator.category) orConditions.push({ category: creator.category });
    if (creator.tags && creator.tags.length > 0) orConditions.push({ tags: { hasSome: creator.tags } });

    const campaigns = await prisma.campaign.findMany({
      where: {
        OR: [
          {
            AND: [
              { OR: orConditions },
              { visibility: "Public" }
            ]
          },
          { visibility: "Private", invitedCreators: { has: creator.id } }
        ]
      },
      include: {
        user: { select: { brandProfile: { select: { profilePic: true } } } },
        campaignInvites: {
          where: { creatorId: creator.id }
        },
        requests: {
          where: { creatorId: creator.id },
          select: { status: true, message: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const campaignsWithStatus = campaigns.map(c => ({
      ...c,
      creatorStatus: c.requests && c.requests.length > 0 ? c.requests[0].status : "pending",
      requests: c.requests
    }));
    
    return NextResponse.json({ success: true, campaigns: campaignsWithStatus });
  } catch (error: any) {
    console.error("GET /api/campaigns error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    let userId = (session?.user as any)?.id;
    if (!userId && session?.user?.email) {
      const user = await prisma.user.findFirst({ where: { email: session.user.email }});
      if (user) userId = user.id;
    }

    if (!userId) {
       return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, subtitle, budget, dateRange, description, daysLeft, category, tags, visibility, invitedCreators } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "title is required" }, { status: 400 });
    }

    const campaignData = await prisma.campaign.create({
      data: {
        userId,
        title,
        subtitle,
        budget,
        dateRange,
        description,
        daysLeft,
        category,
        visibility: visibility || "Public",
        tags: tags || [],
        invitedCreators: invitedCreators || [],
      }
    });

    // Trigger Push Notifications
    if (visibility === "Private" && invitedCreators && invitedCreators.length > 0) {
      // For private campaigns, only notify the invited creators
      const invitedProfiles = await prisma.creatorProfile.findMany({
        where: { id: { in: invitedCreators } }
      });
      for (const creator of invitedProfiles) {
        try {
          await prisma.notification.create({
            data: {
              userId: creator.userId,
              title: "New Campaign Alert",
              message: `You have been invited to a Private Campaign: ${title}`,
              actionLabel: 'View Campaign',
              actionUrl: '/creator',
            }
          });
        } catch(e) {
          console.error("Failed to trigger DB notification for invited creator", creator.userId, e);
        }
      }
    } else if (visibility !== "Private") {
      // For public campaigns, notify matching creators
      const orConditions = [];
      if (category) orConditions.push({ category: category });
      if (tags && tags.length > 0) orConditions.push({ tags: { hasSome: tags } });

      if (orConditions.length > 0) {
        const matchingCreators = await prisma.creatorProfile.findMany({
          where: { OR: orConditions }
        });

        for (const creator of matchingCreators) {
          try {
            await prisma.notification.create({
              data: {
                userId: creator.userId,
                title: "New Campaign Alert",
                message: `New campaign matching your profile: ${title}`,
                actionLabel: 'View Campaign',
                actionUrl: '/creator',
              }
            });
          } catch(e) {
            console.error("Failed to trigger DB notification for", creator.userId, e);
          }
        }
      }
    }

    return NextResponse.json({ success: true, campaign: campaignData });
  } catch (error: any) {
    console.error("POST /api/campaigns error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
