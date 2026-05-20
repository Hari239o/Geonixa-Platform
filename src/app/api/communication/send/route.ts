import { NextResponse } from "next/server";
import { emailService } from "@/lib/emailService";

export async function POST(req: Request) {
  try {
    const { type, candidateEmail, candidateName, status } = await req.json();

    let subject = "";
    let html = "";

    if (type === "COMPLETION") {
      subject = "Geonixa Assessment Successfully Completed";
      html = emailService.getCompletionTemplate({
        name: candidateName,
        timestamp: new Date().toLocaleString()
      });
    } else if (type === "RESULT") {
      subject = status === "SELECTED" ? "Congratulations: Geonixa Selection Status" : 
                status === "INTERVIEW" ? "Interview Invitation: Geonixa Assessment" :
                "Geonixa Assessment Status Update";
      html = emailService.getResultTemplate({
        name: candidateName,
        status: status
      });
    } else {
      return NextResponse.json({ success: false, error: "INVALID_EMAIL_TYPE" }, { status: 400 });
    }

    const result = await emailService.sendEmail({
      to: candidateEmail,
      subject,
      html,
      candidateEmail,
      type: type === "COMPLETION" ? "COMPLETION" : 
            status === "SELECTED" ? "RESULT_SELECTED" :
            status === "INTERVIEW" ? "INTERVIEW_INVITATION" : "RESULT_REJECTED"
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: "Email dispatched successfully" });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Communication API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
