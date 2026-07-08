import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";
import { Knock } from '@knocklabs/node';

const knock = new Knock({ apiKey: process.env.KNOCK_SECRET_API_KEY || 'dummy-key' });

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
          },
          requests: {
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

    const campaigns = await prisma.campaign.findMany({
      where: {
        OR: [
          { visibility: "Public" },
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
          select: { id: true, status: true, message: true, creatorId: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const campaignsWithStatus = campaigns.map(c => ({
      ...c,
      creatorStatus: c.visibility === 'Private' 
        ? (c.campaignInvites && c.campaignInvites.length > 0 ? c.campaignInvites[0].status : "pending")
        : (c.requests && c.requests.length > 0 ? c.requests[0].status : "pending"),
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

    const brand = await prisma.brandProfile.findUnique({ where: { userId } });
    if (!brand) {
      return NextResponse.json({ success: false, error: "Brand profile not found. Please complete your profile." }, { status: 400 });
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
        const notifMsg = `You have been invited to a Private Campaign: ${title}`;
        try {
          await prisma.campaignInvite.create({
            data: {
              campaignId: campaignData.id,
              creatorId: creator.id,
              brandId: brand.id,
              status: "PENDING"
            }
          });

          await prisma.notification.create({
            data: {
              userId: creator.userId,
              title: "New Campaign Alert",
              message: notifMsg,
              actionLabel: 'View Campaign',
              actionUrl: '/creator',
              senderImage: brand?.profilePic || null
            }
          });
          
          await knock.workflows.trigger('default-notification', {
            recipients: [creator.userId],
            data: {
              message: notifMsg,
              actionLabel: 'View Campaign',
              actionUrl: '/creator',
              type: 'info'
            },
            actor: userId
          });
        } catch(e) {
          console.error("Failed to trigger notification for invited creator", creator.userId, e);
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
          const notifMsg = `New campaign matching your profile: ${title}`;
          try {
            await prisma.notification.create({
              data: {
                userId: creator.userId,
                title: "New Campaign Alert",
                message: notifMsg,
                actionLabel: 'View Campaign',
                actionUrl: '/creator',
                senderImage: brand?.profilePic || null
              }
            });
            
            await knock.workflows.trigger('default-notification', {
              recipients: [creator.userId],
              data: {
                message: notifMsg,
                actionLabel: 'View Campaign',
                actionUrl: '/creator',
                type: 'info'
              },
              actor: userId
            });
          } catch(e) {
            console.error("Failed to trigger notification for", creator.userId, e);
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
