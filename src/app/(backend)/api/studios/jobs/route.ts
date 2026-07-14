import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // In a real app we would get the user ID from the session.
    // For now we assume brandId is passed or we find a mock user.
    let { brandId, partnerType, date, timeSlot, duration, location, contentBrief } = data;
    
    if (!brandId) {
      // find first user
      let user = await prisma.user.findFirst({ where: { role: "brand" } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: "mockbrand@example.com",
            name: "Mock Brand",
            role: "brand",
            password: "mock",
          }
        });
      }
      brandId = user.id;
    }

    const job = await prisma.studioOpenJob.create({
      data: {
        brandId,
        partnerType,
        date,
        timeSlot,
        duration: duration || "1 Hour",
        location: location || "",
        contentBrief: contentBrief || "",
        status: "open",
      }
    });

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    console.error("Error creating open job:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role"); // "brand" or "partner"
    const userId = searchParams.get("userId"); // if provided
    const partnerType = searchParams.get("partnerType");

    let whereClause: any = {};
    
    if (role === "brand") {
      if (userId) whereClause.brandId = userId;
    } else if (role === "partner") {
      if (userId) {
        // Find partner profile for this user
        const partnerProfile = await prisma.partnerProfile.findUnique({
          where: { userId }
        });
        
        if (partnerProfile) {
          whereClause = {
            OR: [
              { status: "open", ...(partnerType ? { partnerType } : {}) },
              {
                applications: {
                  some: { partnerId: partnerProfile.id }
                }
              }
            ]
          };
        } else {
          whereClause.status = "open";
          if (partnerType) whereClause.partnerType = partnerType;
        }
      } else {
        whereClause.status = "open";
        if (partnerType) whereClause.partnerType = partnerType;
      }
    }

    const jobs = await prisma.studioOpenJob.findMany({
      where: whereClause,
      include: {
        brand: {
          select: {
            name: true,
            email: true,
          }
        },
        applications: {
          include: {
            partner: {
              select: {
                id: true,
                fullName: true,
                profilePic: true,
                rating: true,
                reviews: true,
                bio: true,
                hourlyRate: true,
                dailyRate: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
