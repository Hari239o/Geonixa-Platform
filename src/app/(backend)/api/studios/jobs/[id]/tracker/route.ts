import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

    const job = await prisma.studioOpenJob.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            partner: {
              select: {
                id: true,
                fullName: true,
                profilePic: true,
              }
            }
          }
        }
      }
    });

    if (!job) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });

    // Find if there is a confirmed partner
    const confirmedApp = job.applications.find(app => app.status === "partner_confirmed" || app.status === "accepted");
    
    let booking = null;
    if (confirmedApp) {
      // Find the booking for this brand and partner with similar details
      booking = await prisma.studioBooking.findFirst({
        where: {
          brandId: job.brandId,
          partnerId: confirmedApp.partnerId,
          date: job.date,
          timeSlot: job.timeSlot,
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json({ success: true, job, confirmedApp, booking });
  } catch (error: any) {
    console.error("Error fetching tracker info:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
