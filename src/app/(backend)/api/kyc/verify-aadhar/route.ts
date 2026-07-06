import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;

    if (!file || !name) {
      return NextResponse.json({ success: false, error: "Missing file or name" }, { status: 400 });
    }

    // SIMULATION MODE
    // In production, send file to AWS Textract
    // Mocking 2 second processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate validation logic
    // Just for prototyping, let's pretend it succeeds
    // (We could parse the filename to simulate failure if it contains "fake")
    const isFake = file.name.toLowerCase().includes("fake");

    if (isFake) {
      return NextResponse.json({ 
        success: false, 
        error: "Not a valid Aadhar. Missing 12-digit number or Govt of India text." 
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Aadhar verified successfully" });
  } catch (error) {
    console.error("Aadhar Verification Error", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
