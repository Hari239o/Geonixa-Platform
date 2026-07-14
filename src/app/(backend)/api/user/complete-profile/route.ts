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
         include: { creatorProfile: true, brandProfile: true, partnerProfile: true }
       });
    } else if (userEmail) {
       user = await prisma.user.findFirst({ 
         where: { email: userEmail },
         include: { creatorProfile: true, brandProfile: true, partnerProfile: true }
       });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let profile;
    if (user.role === 'brand') {
      profile = user.brandProfile;
    } else if (user.role === 'partner') {
      profile = user.partnerProfile;
    } else {
      profile = user.creatorProfile;
    }

    return NextResponse.json({ success: true, profile: profile });
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

    // Determine role based on profile data first so we know which profile to update
    let roleToUpdate = user.role;
    if (profileData.type === 'company' || profileData.type === 'individual' || profileData.brandType) {
      roleToUpdate = 'brand';
    } else if (profileData.creatorType || profileData.category) {
      roleToUpdate = 'creator';
    }

    // Upsert Profile with whatever data was provided
    if (Object.keys(profileData).length > 0) {
      const facebook = profileData.facebook || profileData.socials?.facebook;
      const instagram = profileData.instagram || profileData.socials?.instagram;
      const x = profileData.x || profileData.socials?.x;
      const linkedin = profileData.linkedin || profileData.socials?.linkedin;
      const budgets = profileData.budgets || null;
      
      try {
        if (roleToUpdate === 'brand') {
          await prisma.brandProfile.upsert({
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
              linkedin: linkedin !== undefined ? linkedin : undefined,
              teamMembers: profileData.teamMembers !== undefined ? profileData.teamMembers : undefined,
              brandType: profileData.brandType || profileData.type || undefined,
              // @ts-ignore
              portfolioImages: profileData.portfolioImages !== undefined ? profileData.portfolioImages : undefined,
              isVerified: profileData.isVerified !== undefined ? profileData.isVerified : undefined,
              registrationNumber: profileData.registrationNumber !== undefined ? profileData.registrationNumber : undefined,
              registrationDoc: profileData.registrationDoc !== undefined ? profileData.registrationDoc : undefined,
              panNumber: profileData.panNumber !== undefined ? profileData.panNumber : undefined,
              panDoc: profileData.panDoc !== undefined ? profileData.panDoc : undefined,
              gstNumber: profileData.gstNumber !== undefined ? profileData.gstNumber : undefined,
              gstDoc: profileData.gstDoc !== undefined ? profileData.gstDoc : undefined,
              authorizedPerson: profileData.authorizedPerson !== undefined ? profileData.authorizedPerson : undefined,
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
              linkedin,
              teamMembers: profileData.teamMembers || null,
              brandType: profileData.brandType || profileData.type || null,
              // @ts-ignore
              portfolioImages: profileData.portfolioImages || [],
              isVerified: profileData.isVerified || false,
              registrationNumber: profileData.registrationNumber || null,
              registrationDoc: profileData.registrationDoc || null,
              panNumber: profileData.panNumber || null,
              panDoc: profileData.panDoc || null,
              gstNumber: profileData.gstNumber || null,
              gstDoc: profileData.gstDoc || null,
              authorizedPerson: profileData.authorizedPerson || null,
            }
          });
        } else if (roleToUpdate === 'partner') {
          await prisma.partnerProfile.upsert({
            where: { userId: user.id },
            update: {
              fullName: profileData.fullName || profileData.name || undefined,
              bio: profileData.bio !== undefined ? profileData.bio : undefined,
              profilePic: profileData.profilePic !== undefined ? profileData.profilePic : undefined,
              partnerType: profileData.partnerType || profileData.type || 'cameraman', // Default if missing
              rating: profileData.rating !== undefined ? profileData.rating : undefined,
              reviews: profileData.reviews !== undefined ? profileData.reviews : undefined,
              portfolioImages: profileData.portfolioImages !== undefined ? profileData.portfolioImages : undefined,
              equipment: profileData.equipment !== undefined ? profileData.equipment : undefined,
              website: profileData.website !== undefined ? profileData.website : undefined,
              phone: profileData.phone !== undefined ? profileData.phone : undefined,
              facebook: facebook !== undefined ? facebook : undefined,
              instagram: instagram !== undefined ? instagram : undefined,
              x: x !== undefined ? x : undefined,
              linkedin: linkedin !== undefined ? linkedin : undefined,
              hourlyRate: profileData.hourlyRate !== undefined ? profileData.hourlyRate : undefined,
              dailyRate: profileData.dailyRate !== undefined ? profileData.dailyRate : undefined,
              isVerified: profileData.isVerified !== undefined ? profileData.isVerified : undefined,
            },
            create: {
              userId: user.id,
              fullName: profileData.fullName || profileData.name || null,
              bio: profileData.bio || null,
              profilePic: profileData.profilePic || null,
              partnerType: profileData.partnerType || profileData.type || 'cameraman',
              rating: profileData.rating || 0,
              reviews: profileData.reviews || 0,
              portfolioImages: profileData.portfolioImages || [],
              equipment: profileData.equipment || [],
              website: profileData.website || null,
              phone: profileData.phone || null,
              facebook,
              instagram,
              x,
              linkedin,
              hourlyRate: profileData.hourlyRate || null,
              dailyRate: profileData.dailyRate || null,
              isVerified: profileData.isVerified || false,
            }
          } as any);
        } else {
          // Build tags array
          let tags: string[] = [];
          if (profileData.creatorType) {
            tags.push(profileData.creatorType);
          }
          if (profileData.isPartner) {
            tags.push('Partners');
          }

          await prisma.creatorProfile.upsert({
            where: { userId: user.id },
            update: {
              fullName: profileData.fullName || profileData.name || undefined,
              bio: profileData.bio !== undefined ? profileData.bio : undefined,
              profilePic: profileData.profilePic !== undefined ? profileData.profilePic : undefined,
              category: profileData.category !== undefined ? profileData.category : undefined,
              tags: tags.length > 0 ? { set: tags } : undefined,
              website: profileData.website !== undefined ? profileData.website : undefined,
              phone: profileData.phone !== undefined ? profileData.phone : undefined,
              facebook: facebook ? facebook : undefined,
              instagram: instagram ? instagram : undefined,
              x: x ? x : undefined,
              // @ts-ignore
              linkedin: linkedin ? linkedin : undefined,
              budgets: budgets !== undefined ? budgets : undefined,
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
              tags: tags,
              website: profileData.website || null,
              phone: profileData.phone || null,
              facebook,
              instagram,
              x,
              // @ts-ignore
              linkedin,
              budgets,
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
        }
      } catch (upsertError) {
        console.error("Upsert failed:", upsertError);
        // We don't return here so we can still mark the profile as completed below
      }
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
