import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    const userEmail = session?.user?.email;
    const userId = (session?.user as any)?.id;
    
    if (!userEmail && !userId) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user;
    if (userId) {
       user = await prisma.user.findUnique({ 
         where: { id: userId },
         include: { creatorProfile: true }
       });
    } else if (userEmail) {
       user = await prisma.user.findFirst({ 
         where: { email: userEmail },
         include: { creatorProfile: true }
       });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile: user.creatorProfile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
            fullName: profileData.fullName || profileData.name || undefined,
            bio: profileData.bio !== undefined ? profileData.bio : undefined,
            profilePic: profileData.profilePic !== undefined ? profileData.profilePic : undefined,
            category: profileData.category !== undefined ? profileData.category : undefined,
            website: profileData.website !== undefined ? profileData.website : undefined,
            phone: profileData.phone !== undefined ? profileData.phone : undefined,
            facebook: facebook !== undefined ? facebook : undefined,
            instagram: instagram !== undefined ? instagram : undefined,
            x: x !== undefined ? x : undefined,
            teamMembers: profileData.teamMembers !== undefined ? profileData.teamMembers : undefined,
            brandType: profileData.brandType || profileData.type || undefined,
            followers: profileData.followers !== undefined ? profileData.followers : undefined,
            viewership: profileData.viewership !== undefined ? profileData.viewership : undefined,
            engagement: profileData.engagement !== undefined ? profileData.engagement : undefined,
            projects: profileData.projects !== undefined ? profileData.projects : undefined,
            // @ts-ignore
            portfolioImages: profileData.portfolioImages !== undefined ? profileData.portfolioImages : undefined,
            isVerified: profileData.isVerified !== undefined ? profileData.isVerified : undefined,
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
            // @ts-ignore
            portfolioImages: profileData.portfolioImages || [],
            isVerified: profileData.isVerified || false,
          }
        });
      } catch (upsertError) {
        console.error("Upsert failed:", upsertError);
        // We don't return here so we can still mark the profile as completed below
      }
    }

    // Determine role based on profile data
    let roleToUpdate = user.role;
    if (profileData.type === 'company' || profileData.type === 'individual' || profileData.brandType) {
      roleToUpdate = 'brand';
    } else if (profileData.creatorType || profileData.category) {
      roleToUpdate = 'creator';
    }

    // Update profileCompleted to true and set the role
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        profileCompleted: true,
        role: roleToUpdate !== "user" ? roleToUpdate : undefined
      }
    });

    return NextResponse.json({ success: true, message: "Profile marked as completed and saved" });
  } catch (error) {
    console.error("Error completing profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
