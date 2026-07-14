import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerType = searchParams.get("type") || "Cameraman";

    const isOnlineStr = searchParams.get("isOnline");
    const isOnline = isOnlineStr === "true";

    const whereClause: any = {
      partnerType: {
        equals: partnerType,
        mode: 'insensitive',
      },
    };

    if (isOnline) {
      whereClause.isOnline = true;
    }

    const partners = await prisma.partnerProfile.findMany({
      where: whereClause,
      select: {
        id: true,
        fullName: true,
        profilePic: true,
        rating: true,
        reviews: true,
        isVerified: true,
        partnerType: true,
        bio: true,
        hourlyRate: true,
        dailyRate: true,
        availableSlots: true,
        isOnline: true,
      } as any,
    });

    if (partners.length === 0) {
      return NextResponse.json({
        success: true,
        partners: []
      });
    }

    return NextResponse.json({
      success: true,
      partners: partners.map((p: any) => ({
        id: p.id,
        name: p.fullName || "Partner",
        isVerified: p.isVerified,
        rating: p.rating,
        reviews: p.reviews,
        type: p.partnerType,
        image: p.profilePic || "/placeholder-user.jpg",
        bio: p.bio,
        hourlyRate: p.hourlyRate,
        dailyRate: p.dailyRate,
        availableSlots: p.availableSlots || [],
        isOnline: p.isOnline || false,
      }))
    });
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch partners" }, { status: 500 });
  }
}
