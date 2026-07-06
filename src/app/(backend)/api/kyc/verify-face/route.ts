import { NextResponse } from "next/server";
import { RekognitionClient, CompareFacesCommand } from "@aws-sdk/client-rekognition";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const selfieFile = formData.get("selfieFile") as File;
    const aadharFile = formData.get("aadharFile") as File;

    if (!selfieFile || !aadharFile) {
      return NextResponse.json({ success: false, error: "Missing images" }, { status: 400 });
    }

    const selfieBuffer = Buffer.from(await selfieFile.arrayBuffer());
    const aadharBuffer = Buffer.from(await aadharFile.arrayBuffer());

    const client = new RekognitionClient({
      region: process.env.AWS_REKOGNITION_REGION || "ap-south-1",
      credentials: {
        accessKeyId: process.env.AWS_REKOGNITION_ACCESS_KEY_ID || "AKIA4IADKOHXBEXNEWH6",
        secretAccessKey: process.env.AWS_REKOGNITION_SECRET_ACCESS_KEY || "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",
      },
    });

    const command = new CompareFacesCommand({
      SourceImage: { Bytes: selfieBuffer },
      TargetImage: { Bytes: aadharBuffer },
      SimilarityThreshold: 96,
    });

    const response = await client.send(command);

    if (response.FaceMatches && response.FaceMatches.length > 0) {
      const match = response.FaceMatches[0];
      if (match.Similarity && match.Similarity >= 96) {
        return NextResponse.json({ 
          success: true, 
          message: "Face match successful", 
          similarity: match.Similarity 
        });
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: "Face match failed. The person in the selfie does not match the Aadhar photo." 
    }, { status: 400 });

  } catch (error: any) {
    console.error("Face Verification Error", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Face Verification Failed" 
    }, { status: 500 });
  }
}
