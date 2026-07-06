import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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
    return NextResponse.json({ success: true, creators });
  } catch (error: any) {
    console.error("GET /api/creators error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}


