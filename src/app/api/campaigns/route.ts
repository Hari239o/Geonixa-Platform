import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, campaigns });
  } catch (error: any) {
    console.error("GET /api/campaigns error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, subtitle, budget, dateRange, description, daysLeft } = body;

    if (!userId || !title) {
      return NextResponse.json({ success: false, error: "userId and title are required" }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        userId,
        title,
        subtitle,
        budget,
        dateRange,
        description,
        daysLeft
      }
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error("POST /api/campaigns error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
