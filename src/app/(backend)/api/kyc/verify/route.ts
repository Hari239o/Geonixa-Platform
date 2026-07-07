import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { fullName, aadharImage, selfieImage } = await request.json();

    if (!fullName || !aadharImage || !selfieImage) {
      return NextResponse.json({ error: "Missing required KYC fields" }, { status: 400 });
    }

    console.log(`Received KYC request for: ${fullName}`);

    // MOCK BYPASS: Since AWS is throwing SubscriptionRequiredException regardless of region, 
    // we bypass the actual API calls for now so development can continue.
    console.log("AWS Account is blocked - Bypassing API calls and returning Mock Success...");
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return a guaranteed success
    return NextResponse.json({ 
      success: true, 
      message: "KYC Verification Successful (Mock Bypass)",
      similarity: 99.9
    });

  } catch (error: unknown) {
    console.error("KYC Verification Error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to process KYC verification";
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
