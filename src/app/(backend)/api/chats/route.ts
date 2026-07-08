import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/(backend)/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;
    let email = session?.user?.email;

    if (!userId && email) {
      const user = await prisma.user.findFirst({ where: { email } });
      if (user) userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    let combinedChats: any[] = [];

    // Admin sees all chats
    if (user.role === 'admin' || user.email === 'admin@kalinq.com') {
      const dealChats = await prisma.dealChat.findMany({
        include: { messages: true },
        orderBy: { updatedAt: 'desc' }
      });
      combinedChats = dealChats.map(c => ({
        type: 'chat',
        id: c.id,
        dealId: c.dealId,
        status: c.status,
        updatedAt: c.updatedAt,
        messagesCount: c.messages?.length || 0,
        title: `Deal: ${c.dealId.slice(0, 8)}...`
      }));
    } else {
      // Find Brand or Creator profile
      let brandProfile = await prisma.brandProfile.findUnique({ where: { userId } });
      let creatorProfile = await prisma.creatorProfile.findUnique({ where: { userId } });

      const dealChats = await prisma.dealChat.findMany({
        where: {
          OR: [
            { brandId: brandProfile?.id || userId },
            { creatorId: creatorProfile?.id || userId },
            { brandId: userId },
            { creatorId: userId }
          ]
        },
        include: { messages: true }
      });

      let mappedChats = dealChats.map(c => ({
        type: 'chat',
        id: c.id,
        dealId: c.dealId,
        status: c.status,
        updatedAt: c.updatedAt,
        messagesCount: c.messages?.length || 0,
        title: `Deal: ${c.dealId.slice(0, 8)}...`
      }));

      let mappedInvites: any[] = [];
      let mappedRequests: any[] = [];

      if (creatorProfile) {
        const invites = await prisma.campaignInvite.findMany({
          where: { creatorId: creatorProfile.id, status: { not: 'PENDING' } },
          include: { campaign: true }
        });
        mappedInvites = invites.map(inv => ({
          type: 'invite',
          id: inv.id,
          campaignId: inv.campaignId,
          status: inv.status,
          updatedAt: inv.updatedAt,
          title: `${inv.campaign?.title || 'Unknown Campaign'}`,
          messagesCount: 0
        }));

        const requests = await prisma.campaignRequest.findMany({
          where: { creatorId: creatorProfile.id },
          include: { campaign: true }
        });
        mappedRequests = requests.map(req => ({
          type: 'request',
          id: req.id,
          campaignId: req.campaignId,
          status: 'APPLIED',
          updatedAt: req.updatedAt,
          title: `${req.campaign?.title || 'Unknown Campaign'}`,
          messagesCount: 0
        }));
      }

      if (brandProfile) {
        const invites = await prisma.campaignInvite.findMany({
          where: { campaign: { userId: userId }, status: { not: 'PENDING' } },
          include: { campaign: true, creator: true }
        });
        mappedInvites = [...mappedInvites, ...invites.map(inv => ({
          type: 'invite',
          id: inv.id,
          campaignId: inv.campaignId,
          status: inv.status,
          updatedAt: inv.updatedAt,
          title: `${inv.creator?.fullName || 'Creator'} (${inv.campaign?.title || 'Campaign'})`,
          messagesCount: 0
        }))];

        const requests = await prisma.campaignRequest.findMany({
          where: { campaign: { userId: userId } },
          include: { campaign: true, creator: true }
        });
        mappedRequests = [...mappedRequests, ...requests.map(req => ({
          type: 'request',
          id: req.id,
          campaignId: req.campaignId,
          status: req.status === 'pending' ? 'APPLIED' : req.status.toUpperCase(),
          updatedAt: req.updatedAt,
          title: `${req.creator?.fullName || 'Creator'} (${req.campaign?.title || 'Campaign'})`,
          messagesCount: 0
        }))];
      }

      combinedChats = [...mappedChats, ...mappedInvites, ...mappedRequests];
      // Deduplicate in case brand and creator are on the same user somehow
      const seen = new Set();
      combinedChats = combinedChats.filter(c => {
        const key = `${c.type}-${c.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      combinedChats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    return NextResponse.json({ success: true, chats: combinedChats });
  } catch (error: any) {
    console.error('Fetch chats error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
