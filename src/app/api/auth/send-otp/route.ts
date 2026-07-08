import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Upsert the OTP in the database
    await prisma.otpRequest.upsert({
      where: { phone },
      update: { otp: otpCode, expiresAt },
      create: { phone, otp: otpCode, expiresAt },
    });

    // Send the OTP via Fast2SMS
    const fast2SmsKey = process.env.FAST2SMS_API_KEY;
    if (!fast2SmsKey) {
      console.error('FAST2SMS_API_KEY is missing');
      return NextResponse.json({ error: 'SMS Provider not configured' }, { status: 500 });
    }

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': fast2SmsKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'v3',
        sender_id: 'TXTIND', // or your Fast2SMS approved sender ID
        message: `Your Kalinq verification code is ${otpCode}. Please do not share this with anyone.`,
        language: 'english',
        flash: 0,
        numbers: phone.replace('+', '')
      })
    });

    const result = await response.json();

    if (result.return) {
      return NextResponse.json({ success: true, message: 'OTP sent successfully' });
    } else {
      console.error('Fast2SMS Error:', result.message);
      return NextResponse.json({ error: 'Failed to send OTP via SMS Provider' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in send-otp:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
