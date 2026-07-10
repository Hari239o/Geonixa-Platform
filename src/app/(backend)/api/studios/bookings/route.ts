import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { partnerId, bookingMode, brandId } = body;

    if (!partnerId || !bookingMode) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // In a real scenario, brandId comes from session
    // For now we assume brandId is passed or we just mock a successful response if it's a mock partner
    if (partnerId.startsWith("mock-")) {
      return NextResponse.json({
        success: true,
        message: "Mock booking successful",
        bookingId: "mock-booking-id"
      });
    }

    if (!brandId) {
      return NextResponse.json({ success: false, error: "Unauthorized: Missing brandId" }, { status: 401 });
    }

    const booking = await prisma.studioBooking.create({
      data: {
        brandId,
        partnerId,
        bookingMode,
        status: "pending"
      }
    });

    return NextResponse.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ success: false, error: "Failed to create booking" }, { status: 500 });
  }
}
