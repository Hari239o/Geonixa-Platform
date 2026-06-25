import { NextResponse } from 'next/server';
import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";
import { RekognitionClient, CompareFacesCommand } from "@aws-sdk/client-rekognition";

// Initialize AWS Clients
// In Next.js App Router, process.env.AWS_ACCESS_KEY_ID is automatically available from .env / .env.local
const awsConfig = {
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
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

    // Helper to convert base64 to Buffer
    const getBufferFromBase64 = (base64Str: string) => {
      const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, "");
      return Buffer.from(base64Data, "base64");
    };

    const aadharBuffer = getBufferFromBase64(aadharImage);
    const selfieBuffer = getBufferFromBase64(selfieImage);

    // 1. Textract: Verify Document Authenticity and Name
    console.log("Analyzing document with Textract...");
    const textractResponse = await textract.send(new AnalyzeDocumentCommand({
      Document: { Bytes: aadharBuffer },
      FeatureTypes: ["FORMS"]
    }));

    // Extract all text blocks to see what Textract found
    const blocks = textractResponse.Blocks || [];
    const lines = blocks.filter(b => b.BlockType === "LINE").map(b => b.Text);
    
    const fullExtractedText = lines.join(" ").toUpperCase();
    console.log("Extracted Text via Textract:", fullExtractedText);

    // Simple document type check
    const isAadhar = fullExtractedText.includes("GOVERNMENT OF INDIA") || 
                     fullExtractedText.includes("AADHAAR") || 
                     fullExtractedText.includes("DOB");
                     
    if (!isAadhar) {
      return NextResponse.json({ 
        success: false, 
        error: "Document does not appear to be a valid Aadhar card" 
      }, { status: 400 });
    }

    // Simple name matching (case insensitive)
    const normalizedExpectedName = fullName.trim().toUpperCase();
    
    // We check if the expected name string exists anywhere in the extracted text.
    // In a real production app, this would be much more sophisticated.
    if (!fullExtractedText.includes(normalizedExpectedName)) {
      return NextResponse.json({ 
        success: false, 
        error: `Name mismatch. Could not find '${fullName}' on the provided document.` 
      }, { status: 400 });
    }

    // 2. Rekognition: Verify Identity via Face Match
    console.log("Comparing faces with Rekognition...");
    const rekognitionResponse = await rekognition.send(new CompareFacesCommand({
      SourceImage: { Bytes: aadharBuffer },   // Face on the ID card
      TargetImage: { Bytes: selfieBuffer },   // Face from the live webcam
      SimilarityThreshold: 80,                // Require at least 80% confidence
    }));

    const faceMatches = rekognitionResponse.FaceMatches || [];
    
    if (faceMatches.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Face match failed. The selfie does not match the photo on the Aadhar card." 
      }, { status: 400 });
    }

    const similarity = faceMatches[0].Similarity;
    console.log(`Face match successful! Similarity: ${similarity}%`);

    // If both Textract and Rekognition checks pass
    return NextResponse.json({ 
      success: true, 
      message: "KYC Verification Successful",
      similarity: similarity
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    console.error("KYC Verification Error:", err);
    
    // Check if it's an AWS subscription issue
    if (err.name === 'SubscriptionRequiredException' || err.message?.includes('SubscriptionRequiredException')) {
      return NextResponse.json({ 
        success: false, 
        error: "AWS Account lacks active subscription for Textract/Rekognition API access." 
      }, { status: 403 });
    }

    if (err.name === 'InvalidParameterException' || err.message?.includes('InvalidParameterException')) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid input provided to AWS services. Please check the image format/size." 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: false, 
      error: err.message || "Failed to process KYC verification" 
    }, { status: 500 });
  }
}
