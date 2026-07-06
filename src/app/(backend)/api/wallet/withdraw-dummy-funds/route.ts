import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amountInRupees } = body; // e.g. 500, 1000, 2000

    if (!amountInRupees || isNaN(amountInRupees)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Dummy conversion: 100 rupees = 10 credits (so 10 rupees = 1 credit)
    const creditsToWithdraw = Math.floor(amountInRupees / 10);

    // Verify user has enough credits
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { credits: true }
    });

    if (!user || user.credits < creditsToWithdraw) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        credits: {
          decrement: creditsToWithdraw
        }
      }
    });

    return NextResponse.json({ success: true, credits: updatedUser.credits });
  } catch (error) {
    console.error("Withdraw dummy funds error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
