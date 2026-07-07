import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";
import { Knock } from '@knocklabs/node';

export async function POST(request: Request) {
  try {
    const knock = new Knock({ apiKey: process.env.KNOCK_SECRET_API_KEY || 'dummy-key' });
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;
    if (!userId && session?.user?.email) {
      const user = await prisma.user.findFirst({ where: { email: session.user.email }});
      if (user) userId = user.id;
    }
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { inviteId, action, negotiatedPrice, message } = await request.json();
    if (!inviteId || !action) return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });

    const invite = await prisma.campaignInvite.findUnique({
      where: { id: inviteId },
      include: { campaign: true, creator: true, brand: true }
    });

    if (!invite) return NextResponse.json({ success: false, error: "Invite not found" }, { status: 404 });

    const isCreator = invite.creator.userId === userId;
    const isBrand = invite.brand.userId === userId;

    if (!isCreator && !isBrand) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    let newStatus = invite.status;

    if (isCreator) {
      if (action === "ACCEPT") newStatus = "ACCEPTED";
      else if (action === "REJECT") newStatus = "REJECTED";
      else if (action === "NEGOTIATE") newStatus = "NEGOTIATING";

      await prisma.campaignInvite.update({
        where: { id: inviteId },
        data: {
          status: newStatus,
          negotiatedPrice: action === "NEGOTIATE" ? negotiatedPrice : invite.negotiatedPrice,
          message: action === "NEGOTIATE" ? message : invite.message
        }
      });

      // Also upsert a CampaignRequest so it appears in the Brand's requests dashboard
      await prisma.campaignRequest.upsert({
        where: {
          campaignId_creatorId: {
            campaignId: invite.campaign.id,
            creatorId: invite.creator.id
          }
        },
        update: {
          status: newStatus,
          message: action === "NEGOTIATE" ? message : invite.message
        },
        create: {
          campaignId: invite.campaign.id,
          creatorId: invite.creator.id,
          status: newStatus,
          message: action === "NEGOTIATE" ? message : invite.message
        }
      });

      // Notify Brand
      const notifMsg = `${invite.creator.fullName} has ${newStatus.toLowerCase()} your invite for ${invite.campaign.title}.`;
      await prisma.notification.create({
        data: {
          userId: invite.brand.userId,
          title: "Creator Responded",
          message: notifMsg,
          actionUrl: "/brand/campaigns/requests",
          actionLabel: "View Requests",
          senderImage: invite.creator.profilePic || null
        }
      });

      try {
        await knock.workflows.trigger('default-notification', {
          recipients: [invite.brand.userId],
          data: {
            message: notifMsg,
            actionLabel: "View Requests",
            actionUrl: "/brand/campaigns/requests",
            type: 'info'
          },
          actor: invite.creator.userId
        });
      } catch(e) { console.error("Knock trigger error:", e); }
    }

    if (isBrand) {
      if (action === "ACCEPT") newStatus = "BRAND_ACCEPTED_NEGOTIATION";
      else if (action === "REJECT") newStatus = "BRAND_REJECTED_NEGOTIATION";

      await prisma.campaignInvite.update({
        where: { id: inviteId },
        data: { status: newStatus }
      });

      // Notify Creator
      const notifMsg = `${invite.brand.fullName} has ${action.toLowerCase()}ed your negotiated price for ${invite.campaign.title}.`;
      await prisma.notification.create({
        data: {
          userId: invite.creator.userId,
          title: "Brand Responded to Negotiation",
          message: notifMsg,
          actionUrl: "/creator",
          actionLabel: "View Dashboard",
          senderImage: invite.brand.profilePic || null
        }
      });

      try {
        await knock.workflows.trigger('default-notification', {
          recipients: [invite.creator.userId],
          data: {
            message: notifMsg,
            actionLabel: "View Dashboard",
            actionUrl: "/creator",
            type: 'info'
          },
          actor: invite.brand.userId
        });
      } catch(e) { console.error("Knock trigger error:", e); }
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error: any) {
    console.error("POST /api/campaigns/respond-invite error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
