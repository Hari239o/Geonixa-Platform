import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
    }

    // Verify OTP in Database
    const otpRecord = await prisma.otpRequest.findUnique({
      where: { phone },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    if (otpRecord.otp !== otp) {
      return NextResponse.json({ error: 'Incorrect OTP' }, { status: 400 });
    }

    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // OTP is valid. Delete it so it can't be reused.
    await prisma.otpRequest.delete({ where: { phone } });

    // Now interact with Firebase Admin
    let firebaseUid = '';

    try {
      // Try to find the user in Firebase Auth
      const userRecord = await adminAuth.getUserByPhoneNumber(phone);
      firebaseUid = userRecord.uid;
    } catch (error: any) {
      // If user does not exist in Firebase, create them
      if (error.code === 'auth/user-not-found') {
        const newUser = await adminAuth.createUser({
          phoneNumber: phone,
        });
        firebaseUid = newUser.uid;
      } else {
        throw error; // Unexpected Firebase error
      }
    }

    // Generate Custom Token
    const customToken = await adminAuth.createCustomToken(firebaseUid);

    return NextResponse.json({ success: true, customToken });

  } catch (error) {
    console.error('Error in verify-otp:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
