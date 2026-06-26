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


 // Clean phone number (remove + and any spaces)
 const cleanPhone = phoneNumber.replace(/\D/g, '');
 
 // HARDCODED OTP FOR DEVELOPMENT (To bypass 3rd party API payments)
 const generatedOtp = "1234";

 // Store OTP in memory (valid for 5 minutes)
 globalAny.otpStore.set(phoneNumber, {
 otp: generatedOtp,
 expiresAt: Date.now() + 5 * 60 * 1000
 });

 // Development bypass - we pretend the SMS was sent successfully!
 console.log(`[MOCK SMS] Sent OTP ${generatedOtp} to ${phoneNumber}`);

 return NextResponse.json({ success: true, message: 'OTP sent successfully' });
 } catch (error) {
 console.error('OTP Send Error:', error);
 return NextResponse.json(
 { error: 'Internal server error' },
 { status: 500 }
 );
 }
}
