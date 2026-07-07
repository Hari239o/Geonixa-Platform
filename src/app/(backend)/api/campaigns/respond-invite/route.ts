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

      // Notify Brand
      await prisma.notification.create({
        data: {
          userId: invite.brand.userId,
          title: "Creator Responded",
          message: `${invite.creator.fullName} has ${newStatus.toLowerCase()} your invite for ${invite.campaign.title}.`,
          actionUrl: "/brand/campaigns/requests",
          actionLabel: "View Requests"
        }
      });
    }

    if (isBrand) {
      if (action === "ACCEPT") newStatus = "BRAND_ACCEPTED_NEGOTIATION";
      else if (action === "REJECT") newStatus = "BRAND_REJECTED_NEGOTIATION";

      await prisma.campaignInvite.update({
        where: { id: inviteId },
        data: { status: newStatus }
      });

      // Notify Creator
      await prisma.notification.create({
        data: {
          userId: invite.creator.userId,
          title: "Brand Responded to Negotiation",
          message: `${invite.brand.fullName} has ${action.toLowerCase()}ed your negotiated price for ${invite.campaign.title}.`,
          actionUrl: "/creator",
          actionLabel: "View Dashboard"
        }
      });
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error: any) {
    console.error("POST /api/campaigns/respond-invite error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
