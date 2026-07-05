import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/utils/mockDb";

export async function GET() {
  try {
    const db = readDb();
    // Return creators in descending order (newest first)
    const creators = [...db.creators].reverse();
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

    const db = readDb();
    const existingIndex = db.creators.findIndex((c: any) => c.userId === userId);
    
    const creatorData = {
      id: existingIndex >= 0 ? db.creators[existingIndex].id : "creator_" + Date.now(),
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
      isVerified: isVerified || false,
      createdAt: existingIndex >= 0 ? db.creators[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      db.creators[existingIndex] = creatorData;
    } else {
      db.creators.push(creatorData);
    }
    
    writeDb(db);

    return NextResponse.json({ success: true, creator: creatorData });
  } catch (error: any) {
    console.error("POST /api/creators error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
