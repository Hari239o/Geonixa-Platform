import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";
import { Knock } from '@knocklabs/node';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;
    if (!userId && session?.user?.email) {
      const user = await prisma.user.findFirst({ where: { email: session.user.email }});
      if (user) userId = user.id;
    }
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { dealId, brandId, creatorId } = await request.json();
    if (!dealId || !brandId || !creatorId) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    // Check if DealChat already exists
    let dealChat = await prisma.dealChat.findFirst({
      where: { dealId }
    });

    const userIsBrand = userId === brandId;
    const otherUserId = userIsBrand ? creatorId : brandId;

    let isNewChat = false;
    if (!dealChat) {
      dealChat = await prisma.dealChat.create({
        data: {
          dealId,
          brandId,
          creatorId,
          status: 'PENDING_BOT_FLOW'
        }
      });
      isNewChat = true;
    }

    // Always send a notification so the other person knows
    if (isNewChat) {
      let initiatorName = "A user";
      if (userIsBrand) {
        const brandProfile = await prisma.brandProfile.findUnique({ where: { userId: brandId }});
        if (brandProfile) initiatorName = brandProfile.fullName || brandProfile.companyName || "A Brand";
      } else {
        const creatorProfile = await prisma.creatorProfile.findUnique({ where: { userId: creatorId }});
        if (creatorProfile) initiatorName = creatorProfile.fullName || "A Creator";
      }

      const notifMsg = `${initiatorName} wants to connect with you about the accepted deal! Join the chat now.`;
      const actionUrl = `/chats/${dealChat.id}`;

      await prisma.notification.create({
        data: {
          userId: otherUserId,
          title: "Let's Connect!",
          message: notifMsg,
          actionUrl,
          actionLabel: "Join Chat",
        }
      });

      if (process.env.KNOCK_SECRET_API_KEY) {
        try {
          const knock = new Knock({ apiKey: process.env.KNOCK_SECRET_API_KEY });
          await knock.workflows.trigger('default-notification', {
            recipients: [otherUserId],
            data: { message: notifMsg, actionLabel: "Join Chat", actionUrl, type: 'info' },
            actor: userId
          });
        } catch(e) { console.error("Knock trigger error:", e); }
      }
    }

    return NextResponse.json({ success: true, chatId: dealChat.id });
  } catch (error: any) {
    console.error("POST /api/chats/initiate-connection error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
