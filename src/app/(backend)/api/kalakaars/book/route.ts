import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kalakaarId, bookingMode, brandId } = body;

    if (!kalakaarId || !bookingMode) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // In a real scenario, brandId comes from session.
    // For now we assume brandId is passed or we generate a mock one for testing.
    const resolvedBrandId = brandId || "mock-brand-id";

    if (kalakaarId.startsWith("mock-")) {
      return NextResponse.json({
        success: true,
        message: "Mock Kalakaar booking successful",
        bookingId: `mock-booking-${Date.now()}`
      });
    }

    // Set expiration to 2 hours from now
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const booking = await (prisma as any).userKalakaarBooking.create({
      data: {
        brandId: resolvedBrandId,
        kalakaarId,
        bookingMode,
        quoteAmount: body.quoteAmount, // NEW
        status: "PENDING",
        expiresAt
      }
    });

    return NextResponse.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error("Error creating Kalakaar booking:", error);
    return NextResponse.json({ success: false, error: "Failed to create booking" }, { status: 500 });
  }
}
