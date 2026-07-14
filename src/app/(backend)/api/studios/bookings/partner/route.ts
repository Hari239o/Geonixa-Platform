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

    // First find the partner profile for this user
    const partnerProfile = await prisma.partnerProfile.findUnique({
      where: { userId }
    });

    if (!partnerProfile) {
      return NextResponse.json({ success: false, error: "Partner profile not found" }, { status: 404 });
    }

    // Fetch the bookings where this user is the partner
    const bookings = await prisma.studioBooking.findMany({
      where: { partnerId: partnerProfile.id },
      include: {
        brand: true // Includes the user who booked them (brand)
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.error("GET /api/studios/bookings/partner error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
