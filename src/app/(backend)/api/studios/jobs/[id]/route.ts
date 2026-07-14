import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });
    }

    const job = await (prisma as any).studioOpenJob.findUnique({
      where: { id }
    });

    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    // Allow deleting only if it hasn't been filled yet
    if (job.status === "filled") {
      return NextResponse.json({ success: false, error: "Cannot delete a filled job" }, { status: 400 });
    }

    await (prisma as any).studioOpenJob.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Job deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting job:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
