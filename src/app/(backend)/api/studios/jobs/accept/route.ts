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
      data: { status: "brand_accepted" }
    });

    // Reject other applications
    await (prisma as any).studioJobApplication.updateMany({
      where: { 
        jobId: application.jobId,
        id: { not: applicationId }
      },
      data: { status: "rejected" }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error accepting job application:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
