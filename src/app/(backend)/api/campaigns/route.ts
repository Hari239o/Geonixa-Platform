import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/utils/mockDb";

export async function GET() {
  try {
    const db = readDb();
    // Return campaigns in descending order (newest first)
    const campaigns = [...db.campaigns].reverse();
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

    const db = readDb();
    
    const campaignData = {
      id: "campaign_" + Date.now(),
      userId,
      title,
      subtitle,
      budget,
      dateRange,
      description,
      daysLeft,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.campaigns.push(campaignData);
    writeDb(db);

    return NextResponse.json({ success: true, campaign: campaignData });
  } catch (error: any) {
    console.error("POST /api/campaigns error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
