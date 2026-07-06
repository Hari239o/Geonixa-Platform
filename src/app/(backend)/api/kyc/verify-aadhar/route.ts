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
    // Simulating AWS Textract delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate validation logic
    const filename = file.name.toLowerCase();
    if (filename.includes("fake")) {
      return NextResponse.json({ 
        success: false, 
        error: "The uploaded image does not appear to be a valid Aadhar card. Please upload a clear photo of your original Aadhar." 
      }, { status: 400 });
    }
    
    if (filename.includes("wrongname")) {
      return NextResponse.json({ 
        success: false, 
        error: "The name entered does not match the name printed on the Aadhar card. Please ensure there are no typos." 
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Aadhar verified successfully (Simulated)" });
  } catch (error: any) {
    console.error("Aadhar Verification Error", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Aadhar OCR verification failed due to a server error." 
    }, { status: 500 });
  }
}
