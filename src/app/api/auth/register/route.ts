import { NextResponse } from "next/server";
import { getExamPatternForDomain, normalizeDomainLabel } from "@/data/domainConfig";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password, name, college, domain, slot, day } = await req.json();
    const normalizedDomain = normalizeDomainLabel(domain);
    const examPattern = getExamPatternForDomain(normalizedDomain);
    
    console.log("[REGISTER API] Incoming request for:", email);
    
    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/[^/]*$/, "") || "http://localhost:3000";
    const loginUrl = `${origin}/auth/login`;
    const candidateId = `GNX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Lazy-import to avoid module resolution failures at compile time
    const { emailService } = await import("@/lib/emailService");

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

    console.log("[REGISTER API] Sending email to:", email);

    const result = await emailService.sendEmail({
      to: email,
      subject: `Geonixa Assessment Portal – Login Credentials for ${name}`,
      html,
      candidateEmail: email,
      type: "REGISTRATION"
    });

    console.log("[REGISTER API] Email result:", JSON.stringify(result));

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Registration credentials dispatched securely.', 
        previewUrl: result.previewUrl,
        domain: normalizedDomain,
        examPattern
      });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[REGISTER API] FATAL ERROR:", error.message, error.stack);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
