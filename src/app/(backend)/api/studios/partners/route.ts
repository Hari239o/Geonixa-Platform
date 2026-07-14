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
      // Return dummy data if DB is empty so the UI still looks like the design
      return NextResponse.json({
        success: true,
        partners: [
          { id: "mock-1", name: "Ravi Kumar", isVerified: true, rating: 4, reviews: 10, type: partnerType, image: "/placeholder-user.jpg" },
          { id: "mock-2", name: "Aditya Singh", isVerified: true, rating: 4.5, reviews: 20, type: partnerType, image: "/placeholder-user.jpg" },
        ]
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
