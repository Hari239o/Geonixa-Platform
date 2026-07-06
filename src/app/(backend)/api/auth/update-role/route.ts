import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const userEmail = session?.user?.email;
    
    if (!userId && !userEmail) {
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

    const { role } = await req.json();

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    // Update role
    await prisma.user.update({
      where: { id: user.id },
      data: { role }
    });

    return NextResponse.json({ success: true, message: "Role updated" });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
