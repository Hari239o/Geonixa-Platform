import { NextResponse } from "next/server";
import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;

    if (!file || !name) {
      return NextResponse.json({ success: false, error: "Missing file or name" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const client = new TextractClient({
      region: process.env.AWS_REKOGNITION_REGION || "ap-south-1",
      credentials: {
        accessKeyId: process.env.AWS_REKOGNITION_ACCESS_KEY_ID || "AKIA4IADKOHXBEXNEWH6",
        secretAccessKey: process.env.AWS_REKOGNITION_SECRET_ACCESS_KEY || "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",
      },
    });

    const command = new DetectDocumentTextCommand({
      Document: { Bytes: fileBuffer }
    });

    const response = await client.send(command);
    
    // Extract all text lines
    let fullText = "";
    if (response.Blocks) {
      for (const block of response.Blocks) {
        if (block.BlockType === "LINE" && block.Text) {
          fullText += block.Text + " \n";
        }
      }
    }

    fullText = fullText.toLowerCase();
    const targetName = name.toLowerCase().trim();

    // Verification 1: Check if it's an Aadhar card (looks for 12 digit number or Govt of India)
    const hasAadharKeywords = fullText.includes("government of india") || fullText.includes("govt of india") || fullText.includes("unique identification authority");
    // Look for 12 digits, possibly with spaces e.g. 1234 5678 9012
    const aadharNumberMatch = fullText.match(/\d{4}\s?\d{4}\s?\d{4}/);
    
    if (!hasAadharKeywords && !aadharNumberMatch) {
      return NextResponse.json({ 
        success: false, 
        error: "The uploaded image does not appear to be a valid Aadhar card. Please upload a clear photo of your original Aadhar." 
      }, { status: 400 });
    }

    // Verification 2: Check if name matches
    // Since OCR can be slightly imperfect, we check if the words from the name exist in the text
    const nameWords = targetName.split(/\s+/);
    let matchedWords = 0;
    
    for (const word of nameWords) {
      if (word.length > 2 && fullText.includes(word)) {
        matchedWords++;
      }
    }

    // If less than half the words matched, we consider it a failure
    if (nameWords.length > 0 && matchedWords < Math.ceil(nameWords.length / 2)) {
      return NextResponse.json({ 
        success: false, 
        error: "The name entered does not match the name printed on the Aadhar card. Please ensure there are no typos." 
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Aadhar verified successfully" });
  } catch (error: any) {
    console.error("Aadhar Verification Error", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Aadhar OCR verification failed due to a server error." 
    }, { status: 500 });
  }
}
