import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const creators = await prisma.creatorProfile.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, creators });
  } catch (error: any) {
    console.error("GET /api/creators error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, fullName, bio, profilePic, category, tags, followers, viewership, engagement, projects, successRate, isVerified } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
    }

    // Upsert creator profile
    const creator = await prisma.creatorProfile.upsert({
      where: { userId },
      update: {
        fullName,
        bio,
        profilePic,
        category,
        tags: tags || [],
        followers,
        viewership,
        engagement,
        projects,
        successRate,
        isVerified
      },
      create: {
        userId,
        fullName,
        bio,
        profilePic,
        category,
        tags: tags || [],
        followers: followers || "0",
        viewership: viewership || "0",
        engagement: engagement || "0",
        projects: projects || "0",
        successRate: successRate || "0%",
        isVerified: isVerified || false
      }
    });

    return NextResponse.json({ success: true, creator });
  } catch (error: any) {
    console.error("POST /api/creators error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
