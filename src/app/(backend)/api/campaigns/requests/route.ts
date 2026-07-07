import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";
import { Knock } from '@knocklabs/node';

const knock = new Knock(process.env.KNOCK_SECRET_API_KEY || 'dummy-key');

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;
    if (!userId && session?.user?.email) {
      const user = await prisma.user.findFirst({ where: { email: session.user.email } });
      if (user) userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId }
    });

    if (!creator) {
      return NextResponse.json({ success: false, error: "Only creators can respond to campaigns" }, { status: 403 });
    }

    const { campaignId, status, message } = await request.json();

    if (!campaignId || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Upsert the request so if they accept then reject it updates
    const campaignRequest = await prisma.campaignRequest.upsert({
      where: {
        campaignId_creatorId: {
          campaignId,
          creatorId: creator.id
        }
      },
      update: {
        status,
        message
      },
      create: {
        campaignId,
        creatorId: creator.id,
        status,
        message
      }
    });

    // Notify the Brand
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (campaign && campaign.userId) {
      const notifMsg = `${creator.fullName} has applied to your campaign ${campaign.title}`;
      try {
        await prisma.notification.create({
          data: {
            userId: campaign.userId,
            title: "New Campaign Request",
            message: notifMsg,
            actionUrl: "/brand/campaigns/requests",
            actionLabel: "View Requests",
            senderImage: creator.profilePic || null
          }
        });

        await knock.workflows.trigger('default-notification', {
          recipients: [campaign.userId],
          data: {
            message: notifMsg,
            actionLabel: "View Requests",
            actionUrl: "/brand/campaigns/requests",
            type: 'info'
          },
          actor: userId
        });
      } catch (e) { console.error("Notification error:", e); }
    }

    return NextResponse.json({ success: true, request: campaignRequest });
  } catch (error: any) {
    console.error("POST /api/campaigns/requests error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;
    if (!userId && session?.user?.email) {
      const user = await prisma.user.findFirst({ where: { email: session.user.email } });
      if (user) userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // A brand fetches requests for THEIR campaigns
    const brand = await prisma.brandProfile.findUnique({
      where: { userId }
    });

    if (!brand) {
      return NextResponse.json({ success: false, error: "Only brands can view incoming requests" }, { status: 403 });
    }

    const requests = await prisma.campaignRequest.findMany({
      where: {
        campaign: { userId }
      },
      include: {
        campaign: true,
        creator: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    console.error("GET /api/campaigns/requests error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
