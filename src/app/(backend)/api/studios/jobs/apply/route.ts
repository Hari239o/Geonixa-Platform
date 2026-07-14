import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    let { jobId, partnerId, quoteAmount, coverLetter } = data;

    if (!partnerId) {
      // For mock purposes if not authenticated
      let partner = await prisma.partnerProfile.findFirst();
      if (!partner) {
        let mockUser = await prisma.user.findFirst({ where: { role: "partner" } });
        if (!mockUser) {
          mockUser = await prisma.user.create({
            data: {
              email: "mockpartner@example.com",
              name: "Mock Partner",
              role: "partner",
              password: "mock",
            }
          });
        }
        partner = await (prisma as any).partnerProfile.create({
          data: {
            userId: mockUser.id,
            partnerType: "General",
          }
        });
      }
      partnerId = partner!.id;
    }

    if (!jobId) {
      return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });
    }

    // Check if already applied
    const existing = await prisma.studioJobApplication.findFirst({
      where: {
        jobId,
        partnerId,
      }
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "Already applied to this job" }, { status: 400 });
    }

    const application = await prisma.studioJobApplication.create({
      data: {
        jobId,
        partnerId,
        quoteAmount: quoteAmount || "",
        coverLetter: coverLetter || "",
      }
    });

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    console.error("Error applying to job:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
