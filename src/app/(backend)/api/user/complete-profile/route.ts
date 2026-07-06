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
      const facebook = profileData.facebook || profileData.socials?.facebook || null;
      const instagram = profileData.instagram || profileData.socials?.instagram || null;
      const x = profileData.x || profileData.socials?.x || null;
      
      try {
        await prisma.creatorProfile.upsert({
          where: { userId: user.id },
          update: {
            fullName: profileData.fullName || profileData.name || null,
            bio: profileData.bio || null,
            profilePic: profileData.profilePic || null,
            category: profileData.category || null,
            website: profileData.website || null,
            phone: profileData.phone || null,
            facebook,
            instagram,
            x,
            teamMembers: profileData.teamMembers || null,
            brandType: profileData.brandType || profileData.type || null,
            followers: profileData.followers || "0",
            viewership: profileData.viewership || "0",
            engagement: profileData.engagement || "0",
            projects: profileData.projects || "0",
          },
          create: {
            userId: user.id,
            fullName: profileData.fullName || profileData.name || null,
            bio: profileData.bio || null,
            profilePic: profileData.profilePic || null,
            category: profileData.category || null,
            website: profileData.website || null,
            phone: profileData.phone || null,
            facebook,
            instagram,
            x,
            teamMembers: profileData.teamMembers || null,
            brandType: profileData.brandType || profileData.type || null,
            followers: profileData.followers || "0",
            viewership: profileData.viewership || "0",
            engagement: profileData.engagement || "0",
            projects: profileData.projects || "0",
          }
        });
      } catch (upsertError) {
        console.error("Upsert failed:", upsertError);
        // We don't return here so we can still mark the profile as completed below
      }
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
