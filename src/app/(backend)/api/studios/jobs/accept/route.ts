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

    // Accept application
    await (prisma as any).studioJobApplication.update({
      where: { id: applicationId },
      data: { status: "accepted" }
    });

    // Mark job as filled
    await (prisma as any).studioOpenJob.update({
      where: { id: application.jobId },
      data: { status: "filled" }
    });

    // Reject other applications
    await (prisma as any).studioJobApplication.updateMany({
      where: { 
        jobId: application.jobId,
        id: { not: applicationId }
      },
      data: { status: "rejected" }
    });

    // Create the actual StudioBooking
    const booking = await (prisma as any).studioBooking.create({
      data: {
        brandId: application.job.brandId,
        partnerId: application.partnerId,
        bookingMode: "Work Schedule",
        date: application.job.date,
        timeSlot: application.job.timeSlot,
        duration: application.job.duration,
        location: application.job.location,
        contentBrief: application.job.contentBrief,
        quoteAmount: application.quoteAmount,
        status: "pending_payment", // Waiting for brand/partner to pay
      }
    });

    // Notify the accepted partner
    try {
      const brand = await (prisma as any).user.findUnique({ where: { id: application.job.brandId } });
      const partnerProfile = await (prisma as any).partnerProfile.findUnique({ where: { id: application.partnerId }});
      if (partnerProfile) {
        await (prisma as any).notification.create({
          data: {
            userId: partnerProfile.userId,
            title: "Application Accepted!",
            message: `${brand?.name || 'A brand'} accepted your application for the Work Schedule!`,
            type: "job_alert",
            actionUrl: "/partner/campaigns",
            actionLabel: "View Details"
          }
        });
      }
    } catch (notifErr) {
      console.error("Failed to notify partner:", notifErr);
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error("Error accepting job application:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
