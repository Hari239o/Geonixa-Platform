import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/(backend)/api/auth/[...nextauth]/route';

export async function GET(req: Request, { params }: { params: { chatId: string } }) {
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

    const chat = await prisma.dealChat.findUnique({
      where: { id: params.chatId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!chat) return NextResponse.json({ success: false, error: 'Chat not found' }, { status: 404 });

    // Mark as admin_joined if an admin accesses it
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if ((user?.role === 'admin' || user?.email === 'admin@kalinq.com') && chat.status === 'bot') {
      await prisma.dealChat.update({
        where: { id: chat.id },
        data: { status: 'admin_joined' }
      });
      chat.status = 'admin_joined';
    }

    return NextResponse.json({ success: true, chat });
  } catch (error: any) {
    console.error('Fetch chat detail error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
