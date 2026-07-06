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
    // Mocking 2 second processing time (the UI handles the 5-second total wait)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const isFake = selfieFile.name.toLowerCase().includes("fake");

    if (isFake) {
      return NextResponse.json({ 
        success: false, 
        error: "Face match failed. The person in the selfie does not match the Aadhar photo." 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Face match successful (Simulated)", 
      similarity: 99.9
    });

  } catch (error: any) {
    console.error("Face Verification Error", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Face Verification Failed" 
    }, { status: 500 });
  }
}
