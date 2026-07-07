import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    
    if (!userId) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const amountInRupees = body.amountInRupees || 500;
    const creditsToAdd = Math.floor(amountInRupees / 10);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: creditsToAdd
        }
      }
    });

    return NextResponse.json({ success: true, newBalance: user.credits });
  } catch (error) {
    console.error("Error adding dummy funds:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
