import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const selfieFile = formData.get("selfieFile") as File;
    const aadharFile = formData.get("aadharFile") as File;

    if (!selfieFile || !aadharFile) {
      return NextResponse.json({ success: false, error: "Missing images" }, { status: 400 });
    }

    // SIMULATION MODE
    // In production, send both files to AWS Rekognition CompareFacesCommand
    // Mocking 2 second processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const isFake = selfieFile.name.toLowerCase().includes("fake");

    if (isFake) {
      return NextResponse.json({ 
        success: false, 
        error: "Face match failed. The person in the selfie does not match the Aadhar photo." 
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Face match successful" });
  } catch (error) {
    console.error("Face Verification Error", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
