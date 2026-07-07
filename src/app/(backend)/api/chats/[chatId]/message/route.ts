import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/(backend)/api/auth/[...nextauth]/route';

export async function POST(req: Request, { params }: { params: { chatId: string } }) {
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

    const { content } = await req.json();
    if (!content) return NextResponse.json({ success: false, error: 'Missing content' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const senderName = user?.name || (user?.role === 'admin' || user?.email === 'admin@kalinq.com' ? 'Kalinq Admin' : 'User');

    const message = await prisma.chatMessage.create({
      data: {
        chatId: params.chatId,
        senderId: userId,
        senderName,
        content
      }
    });

    // Update chat updatedAt
    await prisma.dealChat.update({
      where: { id: params.chatId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
