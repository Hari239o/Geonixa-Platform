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
      select: { id: true, credits: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (user.credits < cost) {
      return NextResponse.json({ success: false, error: `Insufficient credits. You need ${cost} credits.` }, { status: 403 });
    }

    // 2. Deduct credits
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: user.credits - cost
      }
    });

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
