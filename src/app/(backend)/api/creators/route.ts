import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const creators = await prisma.creatorProfile.findMany({
      where: {
        user: { 
          role: { in: ['creator', 'partner'] }
        }
      },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // If logged in as brand, fetch unlocked profiles
    let unlockedIds: string[] = [];
    if (userId) {
      const unlocks = await prisma.unlockedProfile.findMany({
        where: { brandId: userId, unlockType: 'lifelong' },
        select: { creatorId: true }
      });
      unlockedIds = unlocks.map(u => u.creatorId);
    }

    const creatorsWithUnlockStatus = creators.map(c => ({
      ...c,
      isUnlocked: unlockedIds.includes(c.userId) || unlockedIds.includes(c.id)
    }));

    return NextResponse.json({ success: true, creators: creatorsWithUnlockStatus });
  } catch (error: any) {
    console.error("GET /api/creators error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}


