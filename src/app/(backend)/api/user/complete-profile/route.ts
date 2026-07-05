import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
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

    // Try to parse body for profile data, but don't fail if empty (for backwards compatibility)
    let profileData: any = {};
    try {
      profileData = await req.json();
    } catch (e) {
      // Body might be empty, that's okay
    }

    // Upsert CreatorProfile with whatever data was provided
    if (Object.keys(profileData).length > 0) {
      await prisma.creatorProfile.upsert({
        where: { userId: user.id },
        update: {
          fullName: profileData.fullName || profileData.name || null,
          bio: profileData.bio || null,
          profilePic: profileData.profilePic || null,
          category: profileData.category || null,
          website: profileData.website || null,
          phone: profileData.phone || null,
          facebook: profileData.facebook || null,
          instagram: profileData.instagram || null,
          x: profileData.x || null,
          teamMembers: profileData.teamMembers || null,
          brandType: profileData.brandType || profileData.type || null,
        },
        create: {
          userId: user.id,
          fullName: profileData.fullName || profileData.name || null,
          bio: profileData.bio || null,
          profilePic: profileData.profilePic || null,
          category: profileData.category || null,
          website: profileData.website || null,
          phone: profileData.phone || null,
          facebook: profileData.facebook || null,
          instagram: profileData.instagram || null,
          x: profileData.x || null,
          teamMembers: profileData.teamMembers || null,
          brandType: profileData.brandType || profileData.type || null,
        }
      });
    }

    // Update profileCompleted to true
    await prisma.user.update({
      where: { id: user.id },
      data: { profileCompleted: true }
    });

    return NextResponse.json({ success: true, message: "Profile marked as completed and saved" });
  } catch (error) {
    console.error("Error completing profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
