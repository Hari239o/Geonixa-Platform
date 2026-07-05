import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    let userId = (session?.user as any)?.id;
    if (!userId && session?.user?.email) {
      const user = await prisma.user.findFirst({ where: { email: session.user.email }});
      if (user) userId = user.id;
    }

    if (!userId) {
       return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user and all related data
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        creatorProfile: true,
        campaigns: true
      }
    });

    if (!userData) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Format the data for export
    const exportData = {
      account: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        joinedAt: userData.createdAt
      },
      profile: userData.creatorProfile || null,
      campaigns: userData.campaigns || []
    };

    return NextResponse.json({ success: true, data: exportData });
  } catch (error: any) {
    console.error("GET /api/user/export-data error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
