import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params; // Job ID
    if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

    const body = await request.json();
    const { bookingId, action } = body;

    if (!bookingId || !action) {
      return NextResponse.json({ success: false, error: "Missing bookingId or action" }, { status: 400 });
    }

    // Verify booking exists
    const booking = await prisma.studioBooking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    let updateData: any = {};

    switch (action) {
      case "ACCEPT_WORK_DETAILS":
        // For demonstration, since the brand triggers this from their view, 
        // we'll auto-accept for Admin and Partner so the flow can progress smoothly.
        // In a real multi-user scenario, this would only set `workDetailsBrandAccepted = true`.
        updateData = {
          workDetailsBrandAccepted: true,
          workDetailsAdminAccepted: true, // Mocked simulation
          workDetailsPartnerAccepted: true, // Mocked simulation
        };
        break;
      
      case "UPLOAD_AGREEMENT":
        // Simulated brand uploading agreement and partner auto-accepting it to keep flow smooth.
        updateData = {
          agreementUploadedByBrand: true,
          agreementAcceptedByPartner: true, // Mocked simulation
        };
        break;
        
      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    const updatedBooking = await prisma.studioBooking.update({
      where: { id: bookingId },
      data: updateData
    });

    return NextResponse.json({ success: true, booking: updatedBooking });

  } catch (error: any) {
    console.error("Tracker Action Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
