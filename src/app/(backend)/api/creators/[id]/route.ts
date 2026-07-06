import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const creatorId = params.id;

    if (!creatorId) {
      return NextResponse.json({ success: false, error: "Missing creator ID" }, { status: 400 });
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: {
        id: creatorId
      },
      include: {
        user: {
          select: {
            role: true
          }
        }
      }
    });

    if (!creator) {
      return NextResponse.json({ success: false, error: "Creator not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, creator });
  } catch (error: any) {
    console.error("GET /api/creators/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
