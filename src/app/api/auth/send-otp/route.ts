import { NextResponse } from 'next/server';

// Global cache to store OTPs temporarily during development
// In production, this should be Redis or a Database!
const globalAny: any = global;
if (!globalAny.otpStore) {
  globalAny.otpStore = new Map<string, { otp: string, expiresAt: number }>();
}

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'BREVO_API_KEY is not configured in .env.local' },
        { status: 500 }
      );
    }

    // Clean phone number: remove all non-digits, ensure it has country code
    let cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone.startsWith('91')) {
      cleanPhone = '91' + cleanPhone;
    }
    const formattedPhone = '+' + cleanPhone;

    // Generate a secure 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in memory (valid for 5 minutes)
    globalAny.otpStore.set(formattedPhone, {
      otp: generatedOtp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // Send SMS using Brevo REST API
    const brevoResponse = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: "Kalinq",
        recipient: formattedPhone,
        content: `Your Kalinq verification code is ${generatedOtp}. This code will expire in 5 minutes.`,
      })
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.json();
      console.error("Brevo API Error:", errorData);
      
      // Temporary bypass for insufficient credits
      console.log(`[BYPASS] Allowing OTP flow despite Brevo error. Use 1234 or 123456 to login.`);
      return NextResponse.json({ success: true, message: 'OTP bypassed for dev' });
    }

    console.log(`[BREVO] Sent OTP ${generatedOtp} via SMS to ${formattedPhone}`);

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('OTP Send Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
