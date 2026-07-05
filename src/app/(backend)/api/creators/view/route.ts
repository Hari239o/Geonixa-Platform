import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/utils/mockDb";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "ID required" });

    const db = readDb();
    const creatorIndex = db.creators.findIndex((c: any) => c.id === id);
    
    if (creatorIndex !== -1) {
      let currentViews = parseInt(db.creators[creatorIndex].viewership) || 0;
      db.creators[creatorIndex].viewership = (currentViews + 1).toString();
      writeDb(db);
      return NextResponse.json({ success: true, viewership: db.creators[creatorIndex].viewership });
    }
    
    return NextResponse.json({ success: false, error: "Creator not found" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
