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

    let chats = [];

    // Admin sees all chats
    if (user.role === 'admin' || user.email === 'admin@kalinq.com') {
      chats = await prisma.dealChat.findMany({
        include: { messages: true },
        orderBy: { updatedAt: 'desc' }
      });
    } else {
      // Find Brand or Creator profile
      let brandProfile = await prisma.brandProfile.findUnique({ where: { userId } });
      let creatorProfile = await prisma.creatorProfile.findUnique({ where: { userId } });

      chats = await prisma.dealChat.findMany({
        where: {
          OR: [
            { brandId: brandProfile?.id || userId },
            { creatorId: creatorProfile?.id || userId },
            { brandId: userId },
            { creatorId: userId }
          ]
        },
        include: { messages: true },
        orderBy: { updatedAt: 'desc' }
      });
    }

    return NextResponse.json({ success: true, chats });
  } catch (error: any) {
    console.error('Fetch chats error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
