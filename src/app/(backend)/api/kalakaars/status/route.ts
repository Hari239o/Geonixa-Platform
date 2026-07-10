import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, status, declineReason, invoiceId } = body;

    if (!bookingId || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (bookingId.startsWith("mock-")) {
      return NextResponse.json({
        success: true,
        message: `Mock status updated to ${status}`
      });
    }

    const validStatuses = ["PENDING", "DECLINED", "ON_MY_WAY", "LIVE_RECORDING", "COMPLETED", "EXPIRED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const booking = await prisma.userKalakaarBooking.update({
      where: { id: bookingId },
      data: {
        status,
        ...(declineReason && { declineReason }),
        ...(invoiceId && { invoiceId }),
      }
    });

    return NextResponse.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error("Error updating Kalakaar booking status:", error);
    return NextResponse.json({ success: false, error: "Failed to update booking status" }, { status: 500 });
  }
}
