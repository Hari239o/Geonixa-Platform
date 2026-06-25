import { NextResponse } from 'next/server';

// Global cache to store OTPs temporarily during development
// In production, this should be Redis or a Database!
const globalAny: any = global;
if (!globalAny.otpStore) {
  globalAny.otpStore = new Map<string, { otp: string, expiresAt: number }>();
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Generate a secure 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in memory (valid for 5 minutes)
    globalAny.otpStore.set(email.toLowerCase(), {
      otp: generatedOtp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // Send email using Brevo REST API
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: "Kalinq Security", email: "noreply@kalinq.com" },
        to: [{ email: email }],
        subject: "Your Kalinq Verification Code",
        htmlContent: `
          <html>
            <body style="font-family: sans-serif; text-align: center; padding: 40px;">
              <h2>Welcome to Kalinq!</h2>
              <p>Your one-time verification code is:</p>
              <h1 style="font-size: 36px; letter-spacing: 4px; color: #EF4823;">${generatedOtp}</h1>
              <p>This code will expire in 5 minutes.</p>
            </body>
          </html>
        `
      })
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.json();
      console.error("Brevo API Error:", errorData);
      throw new Error("Failed to send email via Brevo");
    }

    console.log(`[BREVO] Sent OTP ${generatedOtp} to ${email}`);

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP Send Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
