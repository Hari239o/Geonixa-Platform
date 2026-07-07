import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId, targetProfileId, unlockType } = await request.json();

    if (!userId || !targetProfileId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const cost = unlockType === 'permanent' ? 50 : 1;

    // 1. Fetch user to check credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, credits: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (user.role !== 'brand') {
      return NextResponse.json({ success: false, error: "Only brands can unlock profiles" }, { status: 403 });
    }

    // Check if already permanently unlocked
    const existingUnlock = await prisma.unlockedProfile.findFirst({
      where: {
        brandId: userId,
        creatorId: targetProfileId,
        unlockType: 'lifelong'
      }
    });

    if (existingUnlock) {
      return NextResponse.json({ 
        success: true, 
        message: "Profile already permanently unlocked",
        remainingCredits: user.credits,
        unlockType: 'lifelong'
      });
    }

    if (user.credits < cost) {
      return NextResponse.json({ success: false, error: `Insufficient credits. You need ${cost} credits.` }, { status: 403 });
    }

    // 2. Transact: Deduct credits and record unlock
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          credits: user.credits - cost
        }
      }),
      prisma.unlockedProfile.create({
        data: {
          brandId: userId,
          creatorId: targetProfileId,
          unlockType: unlockType === 'permanent' ? 'lifelong' : 'once'
        }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "Profile unlocked successfully",
      remainingCredits: user.credits - cost,
      unlockType: unlockType || 'once'
    });

  } catch (error: any) {
    console.error("POST /api/wallet/unlock-profile error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
