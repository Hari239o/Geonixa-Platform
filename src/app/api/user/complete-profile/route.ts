import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session || !session.user || !(session.user as any).email) {
      // Wait, if they are using phone login, email might be missing or ending in @kalinq.auth.
      // We can check by email or ID if available. Let's rely on the session user object.
    }
    
    const userEmail = session?.user?.email;
    const userId = (session?.user as any)?.id;
    
    if (!userEmail && !userId) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user;
    if (userId) {
       user = await prisma.user.findUnique({ where: { id: userId } });
    } else if (userEmail) {
       user = await prisma.user.findFirst({ where: { email: userEmail } });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update profileCompleted to true
    await prisma.user.update({
      where: { id: user.id },
      data: { profileCompleted: true }
    });

    return NextResponse.json({ success: true, message: "Profile marked as completed" });
  } catch (error) {
    console.error("Error completing profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
