import { NextResponse } from 'next/server';
import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";
import { RekognitionClient, CompareFacesCommand } from "@aws-sdk/client-rekognition";

// Initialize AWS Clients
// In Next.js App Router, process.env.AWS_ACCESS_KEY_ID is automatically available from .env / .env.local
const awsConfig = {
 region: "us-east-1",
 credentials: {
 accessKeyId: "AKIA4IADKOHXBEXNEWH6",
 secretAccessKey: "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",
 }
};

const textract = new TextractClient(awsConfig);
const rekognition = new RekognitionClient(awsConfig);

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

  } catch (error: any) {
    console.error("KYC Verification Error:", error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to process KYC verification" 
    }, { status: 500 });
  }
}
