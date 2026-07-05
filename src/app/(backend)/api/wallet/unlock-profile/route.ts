import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId, targetProfileId } = await request.json();

    if (!userId || !targetProfileId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch user to check credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, credits: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (user.credits < 1) {
      return NextResponse.json({ success: false, error: "Insufficient credits. Please recharge your wallet." }, { status: 403 });
    }

    // 2. Deduct 1 credit
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: user.credits - 1
      }
    });

    // 3. (Optional) Record the unlock event in a separate table if needed in the future.
    // For now, we just deduct the credit and return success to let the client route to the profile.

    return NextResponse.json({ 
      success: true, 
      message: "Profile unlocked successfully",
      remainingCredits: user.credits - 1 
    });

  } catch (error: any) {
    console.error("POST /api/wallet/unlock-profile error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
