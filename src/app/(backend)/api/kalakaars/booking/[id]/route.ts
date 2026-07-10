import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing booking ID" }, { status: 400 });
    }

    if (id.startsWith("mock-")) {
      return NextResponse.json({
        success: true,
        booking: {
          id: id,
          status: "PENDING",
          bookingMode: "instant",
          kalakaar: {
            name: "Mock Kalakaar",
            image: "/placeholder-user.jpg",
            rating: 4.8
          },
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        }
      });
    }

    const booking = await prisma.userKalakaarBooking.findUnique({
      where: { id },
      include: {
        kalakaar: {
          select: {
            name: true,
            creatorProfile: {
              select: {
                profilePic: true,
                rating: true,
              }
            }
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        bookingMode: booking.bookingMode,
        expiresAt: booking.expiresAt,
        declineReason: booking.declineReason,
        kalakaar: {
          name: booking.kalakaar?.name || "Kalakaar",
          image: booking.kalakaar?.creatorProfile?.profilePic || "/placeholder-user.jpg",
          rating: booking.kalakaar?.creatorProfile?.rating || 0
        }
      }
    });
  } catch (error) {
    console.error("Error fetching Kalakaar booking:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch booking" }, { status: 500 });
  }
}
