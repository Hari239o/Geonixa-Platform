import { NextResponse } from "next/server";
import { getExamPatternForDomain, normalizeDomainLabel } from "@/data/domainConfig";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password, name, college, domain, slot, day } = await req.json();
    const normalizedDomain = normalizeDomainLabel(domain);
    const examPattern = getExamPatternForDomain(normalizedDomain);
    
    console.log("[REGISTER API] ====== NEW STUDENT REGISTRATION ======");
    console.log("[REGISTER API] Student:", email);
    console.log("[REGISTER API] Name:", name);
    console.log("[REGISTER API] Domain:", normalizedDomain);
    console.log("[REGISTER API] Slot:", slot);
    console.log("[REGISTER API] Day:", day);
    
    if (!email || !password || !name) {
      console.error("[REGISTER API] Missing required fields");
      return NextResponse.json({ success: false, error: "Missing required fields: email, password, name" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/[^/]*$/, "") || "http://localhost:3000";
    const loginUrl = `${origin}/auth/login`;
    const candidateId = `GNX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Lazy-import to avoid module resolution failures at compile time
    const { emailService } = await import("@/lib/emailService");

    console.log("[REGISTER API] Generating registration email template...");
    const html = emailService.getRegistrationTemplate({
      name,
      date: day,
      slot,
      loginUrl,
      username: email,
      passKey: password,
      candidateId,
      domain: normalizedDomain
    });

    console.log("[REGISTER API] Email template generated. Sending email to:", email);

    const result = await emailService.sendEmail({
      to: email,
      subject: `Geonixa Technical Assessment - Invitation & Access Details for ${name}`,
      html,
      candidateEmail: email,
      type: "REGISTRATION"
    });

    console.log("[REGISTER API] Email service result:", {
      success: result.success,
      error: result.error,
      messageId: result.messageId
    });

    if (result.success) {
      console.log("[REGISTER API] ✅ Registration successful! Email delivered to:", email);
      return NextResponse.json({ 
        success: true, 
        message: 'Registration credentials dispatched securely.', 
        previewUrl: result.previewUrl,
        domain: normalizedDomain,
        examPattern,
        candidateId
      });
    } else {
      console.error("[REGISTER API] ❌ Email delivery failed:", result.error);
      return NextResponse.json({ 
        success: false, 
        error: `Email delivery failed: ${result.error}` 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[REGISTER API] ❌ FATAL ERROR:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json({ 
      success: false, 
      error: `Server error: ${error.message}` 
    }, { status: 500 });
  }
}
