import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    let { applicationId } = data;

    if (!applicationId) {
      return NextResponse.json({ success: false, error: "Application ID is required" }, { status: 400 });
    }

    const application = await (prisma as any).studioJobApplication.findUnique({
      where: { id: applicationId },
      include: { job: true }
    });

    if (!application) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    if (application.status !== "brand_accepted") {
      return NextResponse.json({ success: false, error: "Application is not in a state to be confirmed" }, { status: 400 });
    }

    // Partner confirms application
    await (prisma as any).studioJobApplication.update({
      where: { id: applicationId },
      data: { status: "partner_confirmed" }
    });

    // Mark job as filled
    await (prisma as any).studioOpenJob.update({
      where: { id: application.jobId },
      data: { status: "filled" }
    });

    // Create the actual StudioBooking
    const booking = await (prisma as any).studioBooking.create({
      data: {
        brandId: application.job.brandId,
        partnerId: application.partnerId,
        bookingMode: "Schedule",
        date: application.job.date,
        timeSlot: application.job.timeSlot,
        duration: application.job.duration,
        location: application.job.location,
        contentBrief: application.job.contentBrief,
        quoteAmount: application.quoteAmount,
        status: "pending_payment", // Waiting for brand/partner to pay
      }
    });

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error("Error confirming job application:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
