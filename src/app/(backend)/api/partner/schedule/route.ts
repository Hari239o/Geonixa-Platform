import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "partner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id || (session.user as any).sub;

    const partnerProfile = await prisma.partnerProfile.findUnique({
      where: { userId },
      select: {
        isInstantAvailable: true,
        availableDays: true,
        availableDates: true
      }
    });

    if (!partnerProfile) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      schedule: partnerProfile
    });

  } catch (error) {
    console.error("Error fetching partner schedule:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "partner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id || (session.user as any).sub;
    const body = await req.json();

    const { isInstantAvailable, availableDays, availableDates } = body;

    const partnerProfile = await prisma.partnerProfile.update({
      where: { userId },
      data: {
        isInstantAvailable,
        availableDays,
        availableDates
      },
      select: {
        isInstantAvailable: true,
        availableDays: true,
        availableDates: true
      }
    });

    return NextResponse.json({
      success: true,
      schedule: partnerProfile
    });

  } catch (error) {
    console.error("Error updating partner schedule:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
