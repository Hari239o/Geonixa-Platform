import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";
import { Knock } from '@knocklabs/node';

const knock = new Knock({ apiKey: process.env.KNOCK_SECRET_API_KEY || 'dummy-key-for-build' });

export async function GET() {
  try {
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

    if (brand) {
      // If user is a brand, return their own created campaigns
      const brandCampaigns = await prisma.campaign.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, campaigns: brandCampaigns });
    }

    if (!creator || !creator.isVerified) {
      return NextResponse.json({ success: true, campaigns: [] });
    }

    const hasCategoryOrTags = creator.category || (creator.tags && creator.tags.length > 0);
    let filterCondition: any = {};

    if (hasCategoryOrTags) {
      const orConditions: any[] = [
        { category: "Creators" } // Fallback for legacy campaigns created before category options were updated
      ];
      if (creator.category) orConditions.push({ category: creator.category });
      if (creator.tags && creator.tags.length > 0) orConditions.push({ tags: { hasSome: creator.tags } });
      
      filterCondition = { OR: orConditions };
    }

    const campaigns = await prisma.campaign.findMany({
      where: {
        AND: [
          filterCondition,
          {
            OR: [
              { visibility: "Public" },
              { visibility: "Private", invitedCreators: { has: creator.id } }
            ]
          }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ success: true, campaigns });
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

    // Trigger Push Notifications to matching creators
    const orConditions = [];
    if (category) orConditions.push({ category: category });
    if (tags && tags.length > 0) orConditions.push({ tags: { hasSome: tags } });

    if (orConditions.length > 0) {
      const matchingCreators = await prisma.creatorProfile.findMany({
        where: { OR: orConditions }
      });

      for (const creator of matchingCreators) {
        try {
          await knock.workflows.trigger('default-notification', {
            recipients: [creator.userId],
            data: {
              message: `New campaign matching your profile: ${title}`,
              actionLabel: 'View Campaign',
              actionUrl: '/creator',
              type: 'campaign'
            }
          });
        } catch(e) {
          console.error("Failed to trigger Knock workflow for", creator.userId, e);
        }
      }
    }

    return NextResponse.json({ success: true, campaign: campaignData });
  } catch (error: any) {
    console.error("POST /api/campaigns error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
