import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, rating, feedback } = await req.json();
    
    console.log(`[MOCK EMAIL] To: ${email}`);
    console.log(`[MOCK EMAIL] Subject: Exam Completed Successfully - GeoNixa`);
    console.log(`[MOCK EMAIL] Body: Your assessment has been secured. Rating: ${rating}. Feedback: ${feedback}. Results will be shared within 1 week.`);

    return NextResponse.json({ success: true, message: "Feedback recorded and notification dispatched." });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
