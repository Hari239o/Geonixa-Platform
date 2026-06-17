import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { db } from "./firebase";
import { isTechnicalDomain } from "../data/domainConfig";
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  candidateEmail: string;
  type: "REGISTRATION" | "COMPLETION" | "RESULT_SELECTED" | "RESULT_REJECTED" | "INTERVIEW_INVITATION" | "TERMINATION" | "ASSESSMENT_REPORT";
  attachments?: { filename: string; content: any; contentType?: string }[];
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isEtherealFallback = false;

  constructor() {}

  /**
   * Initializes or returns the existing SMTP transporter.
   * Uses a singleton pattern to maintain connection pooling.
   */
  private async getTransporter() {
    if (this.transporter) {
      try {
        await this.transporter.verify();
        return this.transporter;
      } catch (e) {
        console.warn("Transporter connection stale, re-initializing...");
        this.transporter = null;
      }
    }

    const normalizeEnvValue = (value: string | undefined) => {
      if (!value) return undefined;
      const trimmed = value.trim();
      return trimmed.replace(/^"(.*)"$/s, "$1").replace(/^\'(.*)\'$/s, "$1");
    };

    // Strip quotes from process.env if the user accidentally added them in Vercel
    let smtpUser = normalizeEnvValue(process.env.SMTP_USER);
    let smtpPass = normalizeEnvValue(process.env.SMTP_PASS);
    
    // Google App Passwords often shouldn't have spaces
    if (smtpPass) {
      smtpPass = smtpPass.replace(/\s+/g, '');
    }

    try {
      const envPath = path.resolve(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envConfig: Record<string, string> = {};
        envContent.split('\n').forEach(line => {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match && match[2]) envConfig[match[1]] = normalizeEnvValue(match[2]) || '';
        });
        if (envConfig.SMTP_USER) smtpUser = envConfig.SMTP_USER;
        if (envConfig.SMTP_PASS) smtpPass = envConfig.SMTP_PASS.replace(/\s+/g, '');
      }
    } catch (err) {
      console.warn("Could not read .env.local dynamically", err);
    }

    const config = smtpUser && smtpPass
      ? {
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
        }
      : null;

    console.log(`EmailService SMTP config loaded: user=${Boolean(smtpUser)}, pass=${Boolean(smtpPass)} (${smtpPass ? 'present' : 'missing'})`);

    if (config) {
      this.transporter = nodemailer.createTransport(config);
      this.isEtherealFallback = false;
    } else {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('SMTP_USER and SMTP_PASS are required in production for email delivery. Set these values in .env.local or the hosting environment.');
      }

      // Ethereal Fallback for development/testing
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      this.isEtherealFallback = true;
      console.warn("EmailService is using Ethereal fallback because SMTP_USER/SMTP_PASS are not configured. Emails will not be delivered to real recipients.");
    }

    // MANDATORY VERIFICATION
    try {
      await this.transporter.verify();
      console.log("SMTP Transport Verified & Active");
    } catch (error) {
      console.error("SMTP Transport Verification Failed:", error);
      throw error;
    }

    return this.transporter;
  }

  /**
   * Sends an email with automated retry logic and exponential backoff.
   */
  async sendEmail(options: EmailOptions, retryCount = 0): Promise<{ success: boolean; messageId?: string; previewUrl?: string | null; error?: string }> {
    const { to, subject, html, candidateEmail, type } = options;
    const MAX_RETRIES = 3;
    
    // Allow sending all configured email types including results
    if (type !== "REGISTRATION" && type !== "ASSESSMENT_REPORT" && type !== "COMPLETION" && type !== "RESULT_SELECTED" && type !== "RESULT_REJECTED" && type !== "INTERVIEW_INVITATION" && type !== "TERMINATION") {
      console.log(`[EmailService] Skipped sending email of type ${type} as per SMTP restrictions.`);
      return { success: true, messageId: "skipped_unsupported_type" };
    }

    // Initial Logging to Firestore (Status: PENDING)
    let logId = "";
    try {
      const logRef = await addDoc(collection(db, "email_logs"), {
        candidateEmail,
        type,
        subject,
        status: "PENDING",
        attempts: retryCount + 1,
        timestamp: serverTimestamp(),
      });
      logId = logRef.id;
    } catch (e) {
      console.error("Failed to initialize email log:", e);
    }

    try {
      const transporter = await this.getTransporter();
      
      // Dynamically get user again for the FROM address
      let fromAddress = process.env.SMTP_USER ? process.env.SMTP_USER.replace(/^"(.*)"$/s, "$1").replace(/^\'(.*)\'$/s, "$1").trim() : "noreply@geonixa.com";
      try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const envConfig: Record<string, string> = {};
          envContent.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match && match[2]) {
              const rawValue = match[2].trim();
              envConfig[match[1]] = rawValue.replace(/^"(.*)"$/s, "$1").replace(/^\'(.*)\'$/s, "$1");
            }
          });
          if (envConfig.SMTP_USER) fromAddress = envConfig.SMTP_USER;
        }
      } catch (e) {}
      
      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Geonixa Talent Acquisition'}" <${fromAddress}>`,
        replyTo: fromAddress,
        to,
        subject,
        headers: {
          'X-Entity-Ref-ID': logId || Date.now().toString(),
          'List-Unsubscribe': `<mailto:${fromAddress}?subject=unsubscribe>`,
          'X-Priority': '3 (Normal)',
          'X-Mailer': 'Nodemailer/GeonixaPlatform',
          'Precedence': 'transactional',
        },
        text: html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]*>?/gm, '\n').replace(/\n\s*\n/g, '\n\n').trim(),
        html,
        attachments: options.attachments,
      });

      // Update Log: DELIVERED
      if (logId) {
        await updateDoc(doc(db, "email_logs", logId), {
          status: "DELIVERED",
          messageId: info.messageId,
          deliveryTime: serverTimestamp(),
          previewUrl: !fromAddress.includes("gmail") ? (nodemailer.getTestMessageUrl(info) || null) : null,
        });
      }

      return { 
        success: true, 
        messageId: info.messageId, 
        previewUrl: this.isEtherealFallback ? (nodemailer.getTestMessageUrl(info) || null) : (!fromAddress.includes("gmail") ? (nodemailer.getTestMessageUrl(info) || null) : null)
      };

    } catch (error: any) {
      console.error(`Email dispatch attempt ${retryCount + 1} failed:`, error.message);

      // RETRY LOGIC with Exponential Backoff
      // CRITICAL: Do NOT retry on Authentication (535) errors as they require configuration changes, not time.
      const isAuthError = error.message?.includes("535") || error.response?.includes("535") || error.code === 'EAUTH' || error.responseCode === 535;
      
      if (retryCount < MAX_RETRIES && !isAuthError) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s...
        console.log(`Retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Update Log: RETRYING
        if (logId) {
          await updateDoc(doc(db, "email_logs", logId), {
            status: "RETRYING",
            lastError: error.message,
            nextAttemptAt: new Date(Date.now() + delay).toISOString(),
          });
        }

        return this.sendEmail(options, retryCount + 1);
      }

      // Final Failure Logging
      if (logId) {
        await updateDoc(doc(db, "email_logs", logId), {
          status: "FAILED",
          error: error.message,
          finalAttemptAt: serverTimestamp(),
        });
      }

      return { success: false, error: error.message };
    }
  }

  // --- TEMPLATES ---

  getRegistrationTemplate(data: {
    name: string;
    date: string;
    slot: string;
    loginUrl: string;
    username: string;
    passKey: string;
    candidateId: string;
    domain: string;
  }) {
    // Determine duration based on domain type
    const technical = isTechnicalDomain(data.domain || '');
    const durationLabel = technical ? '1 Hour 30 Minutes (90 Minutes)' : '50 Minutes';
    const durationValueMinutes = technical ? 90 : 50;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 700px; margin: 20px auto; background: #ffffff; border-radius: 0; overflow: hidden; box-shadow: none; border: none; }
          .header { background-color: #0f172a; padding: 40px 30px; text-align: center; border-bottom: none; }
          .logo { color: #ffffff; font-weight: 800; font-size: 24px; letter-spacing: -1px; }
          .content { padding: 30px; }
          .section-title { font-size: 14px; font-weight: 800; color: #0f172a; margin: 25px 0 15px 0; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
          .credential-box { background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 15px 0; }
          .credential-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 12px 0; }
          .credential-item { font-size: 13px; }
          .credential-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin-bottom: 5px; }
          .credential-value { font-size: 15px; font-weight: 700; color: #0f172a; }
          .event-details { background-color: #fff7ed; padding: 20px; border-radius: 8px; border-left: 4px solid #ff5a1f; margin: 20px 0; }
          .event-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 10px 0; }
          .event-field { font-size: 13px; }
          .event-field-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #7c2d12; letter-spacing: 1px; margin-bottom: 5px; }
          .event-field-value { font-size: 15px; font-weight: 700; color: #7c2d12; }
          .guidelines { margin: 25px 0; }
          .guideline-item { font-size: 13px; color: #475569; margin: 10px 0; line-height: 1.5; }
          .guideline-item strong { color: #0f172a; }
          .instruction-box { background-color: #ebf5ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0; }
          .instruction-box p { color: #1e40af; font-size: 13px; margin: 8px 0; }
          .instruction-box strong { color: #1e3a8a; }
          .contact-info { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .contact-info p { font-size: 13px; color: #475569; margin: 5px 0; }
          .contact-info a { color: #3b82f6; text-decoration: none; font-weight: 600; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .footer-note { font-size: 12px; font-weight: 600; color: #0f172a; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Geonixa Talent Acquisition</div>
            <p style="color: #cbd5e1; margin: 10px 0 0 0; font-size: 13px;">Assessment Confirmation</p>
          </div>
          
          <div class="content">
            <p style="font-size: 14px; color: #1e293b; margin: 0 0 15px 0;">
              Hello <strong>${data.name}</strong>,
            </p>
            
            <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
              This is a gentle reminder for the role of <strong>${data.domain}</strong>.
            </p>

            <!-- User Information -->
            <div class="section-title">User Information</div>
            <div class="credential-box">
              <div class="credential-row">
                <div class="credential-item">
                  <div class="credential-label">Registered Email</div>
                  <div class="credential-value">${data.username}</div>
                </div>
                <div class="credential-item">
                  <div class="credential-label">Candidate ID</div>
                  <div class="credential-value">${data.candidateId}</div>
                </div>
              </div>
              <div class="credential-row">
                <div class="credential-item">
                  <div class="credential-label">Access Code</div>
                  <div class="credential-value" style="font-family: 'JetBrains Mono', monospace; background: #0f172a; color: #22c55e; padding: 8px 12px; border-radius: 6px; display: inline-block; font-size: 14px;">${data.passKey}</div>
                </div>
              </div>
            </div>

            <!-- Event Details -->
            <div class="section-title">Event Details</div>
            <div class="event-details">
              <div class="event-row">
                <div class="event-field">
                  <div class="event-field-label">Date</div>
                  <div class="event-field-value">${data.date}</div>
                </div>
                <div class="event-field">
                  <div class="event-field-label">Time Slot</div>
                  <div class="event-field-value">${data.slot}</div>
                </div>
              </div>
              <div class="event-field" style="margin-top: 15px;">
                <div class="event-field-label">Duration</div>
                <div class="event-field-value">${durationLabel}</div>
              </div>
              <p style="font-size: 12px; color: #7c2d12; margin: 15px 0 0 0; line-height: 1.5;">
                <strong>Note:</strong> If you start the test at the scheduled time, you will have to complete it within ${technical ? '1 hour 30 minutes' : '50 minutes'}. The login window will remain open for only 30 minutes from your scheduled start time.
              </p>
            </div>

            <!-- Instructions -->
            <div class="section-title">How To Access The Test</div>
            <ol style="font-size: 13px; color: #475569; line-height: 1.8; padding-left: 20px;">
              <li>Visit the official Geonixa Exam Portal at: <a href="https://talent.geonixa.com/" style="color: #3b82f6; font-weight: 600;">https://talent.geonixa.com/</a></li>
              <li>Click on the "Student Login" option and sign in using your <strong>Registered Email</strong> and <strong>Access Code</strong> provided above to start the exam.</li>
              <li>You will be able to access the test <strong>only on your registered date and time slot</strong></li>
              <li>Any attempt to login outside the scheduled date and time will be rejected</li>
            </ol>

            <!-- Guidelines Section -->
            <div class="section-title">Important Guidelines</div>
            <div class="guidelines">
              <div class="guideline-item"><strong>✓ Internet Connection:</strong> Ensure you are connected to a stable Internet connection throughout the test. Recommended internet speed: 2 Mbps - 5 Mbps.</div>
              
              <div class="guideline-item"><strong>✓ Webcam Requirement:</strong> It is mandatory to have a working webcam on your system. Your face must be visible throughout the assessment.</div>
              
              <div class="guideline-item"><strong>✓ Browser Requirements:</strong> Use Google Chrome or Microsoft Edge browser version 91 or above with pop-up blocker disabled.</div>
              
              <div class="guideline-item"><strong>✓ Test Environment:</strong> Please remain on the assessment screen while taking the test. System activity is securely monitored.</div>
              
              <div class="guideline-item"><strong>✓ Device Usage:</strong> The use of mobile phones or additional electronic devices during the assessment is not permitted.</div>
              
              <div class="guideline-item"><strong>✓ Academic Integrity:</strong> All code submissions are evaluated for originality. Maintaining academic integrity is essential.</div>
            </div>

            <!-- Important Notice -->
            <div class="instruction-box">
              <p><strong>⚠ IMPORTANT:</strong> Please ensure you start the test within the 30-minute login window on your scheduled date and time. Late arrivals will not be permitted to take the test.</p>
              <p style="margin-top: 12px;"><strong>💡 Technical Issues:</strong> Refer to the user manual or system compatibility checker before the exam date to avoid any last-minute technical issues.</p>
            </div>

            <!-- Contact Information -->
            <div class="contact-info">
              <p style="margin-top: 0;"><strong>Have any difficulties or questions?</strong></p>
              <p>Please write to us at: <a href="mailto:talent@geonixa.com">talent@geonixa.com</a></p>
              <p style="font-size: 12px; color: #6b7280;">We are here to help you have a smooth assessment experience.</p>
            </div>
          </div>

          <div class="footer">
            <div class="footer-note">Geonixa Talent Acquisition</div>
            <p style="margin: 8px 0; font-size: 11px;">© ${new Date().getFullYear()} Geonixa Ltd. All rights reserved.</p>
            <p style="margin: 5px 0; font-size: 11px; color: #94a3b8;">Confidentiality Level: Internal / Recruitment</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getCompletionTemplate(data: { name: string; timestamp: string }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 700px; margin: 20px auto; background: #ffffff; border-radius: 0; overflow: hidden; box-shadow: none; border: none; }
          .header { background-color: #0f172a; padding: 40px 30px; text-align: center; }
          .logo { color: #ffffff; font-weight: 800; font-size: 24px; letter-spacing: -1px; }
          .subheader { color: #cbd5e1; font-size: 13px; margin: 10px 0 0 0; }
          .content { padding: 30px; }
          .section-title { font-size: 14px; font-weight: 800; color: #0f172a; margin: 25px 0 15px 0; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
          .submission-box { background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e; margin: 20px 0; }
          .submission-box-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #15803d; letter-spacing: 1px; margin-bottom: 5px; }
          .submission-box-value { font-size: 15px; font-weight: 700; color: #15803d; font-family: 'JetBrains Mono', monospace; }
          .info-box { background-color: #ebf5ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0; }
          .info-box p { color: #1e40af; font-size: 13px; margin: 8px 0; line-height: 1.6; }
          .next-steps { margin: 25px 0; }
          .step-item { font-size: 13px; color: #475569; margin: 12px 0; padding-left: 25px; position: relative; }
          .step-item:before { content: "✓"; position: absolute; left: 0; color: #22c55e; font-weight: 800; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .footer-note { font-size: 12px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Geonixa Talent Acquisition</div>
            <p class="subheader">Assessment Submission Receipt</p>
          </div>
          
          <div class="content">
            <p style="font-size: 14px; color: #1e293b; margin: 0 0 15px 0;">
              Hello <strong>${data.name}</strong>,
            </p>
            
            <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
              Your online technical assessment has been <strong>successfully submitted</strong>. This email serves as confirmation of your submission receipt.
            </p>

            <!-- Submission Confirmation -->
            <div class="section-title">Submission Confirmation</div>
            <div class="submission-box">
              <div class="submission-box-label">Submission Reference ID</div>
              <div class="submission-box-value">${data.timestamp}</div>
              <p style="color: #15803d; font-size: 12px; margin: 12px 0 0 0;">Your response data has been securely stored and logged in our system.</p>
            </div>

            <!-- Important Notice -->
            <div class="info-box">
              <p style="margin-top: 0;"><strong>ℹ Important Information:</strong></p>
              <p>Our evaluation team will review your responses and run all code submissions through plagiarism detection. Any candidate found using unfair means will be instantly disqualified.</p>
              <p>You will receive your assessment result via email within <strong>2 to 3 days</strong>. Our team will contact you with detailed feedback.</p>
            </div>

            <!-- What Happens Next -->
            <div class="section-title">What Happens Next</div>
            <div class="next-steps">
              <div class="step-item">Our technical evaluation team will review your responses and coding solutions.</div>
              <div class="step-item">All submissions will be analyzed for plagiarism and academic integrity compliance.</div>
              <div class="step-item">Your performance will be scored against our technical benchmarks and requirements.</div>
              <div class="step-item">An official result notification will be sent to your registered email address.</div>
              <div class="step-item">Qualified candidates will receive next-phase instructions (interview/onboarding details).</div>
            </div>

            <!-- Contact Section -->
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <p style="font-size: 13px; color: #475569; margin: 0 0 10px 0;"><strong>For any technical issues or queries:</strong></p>
              <p style="font-size: 13px; margin: 0;">
                <a href="mailto:talent@geonixa.com" style="color: #3b82f6; text-decoration: none; font-weight: 600;">talent@geonixa.com</a>
              </p>
            </div>

            <p style="font-size: 13px; color: #475569; margin-top: 25px;">Thank you for your participation in the Geonixa assessment process. We appreciate your time and effort.</p>
            
            <p style="margin-top: 20px;"><strong>Geonixa Talent Acquisition Team</strong></p>
          </div>

          <div class="footer">
            <div class="footer-note">Geonixa Ltd.</div>
            <p style="margin: 8px 0; font-size: 11px;">© ${new Date().getFullYear()} Geonixa. All rights reserved.</p>
            <p style="margin: 5px 0; font-size: 11px; color: #94a3b8;">Confidentiality Level: Internal / Recruitment</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getResultTemplate(data: { name: string; status: "SELECTED" | "REJECTED" | "INTERVIEW" }) {
    const isSelected = data.status === "SELECTED" || data.status === "INTERVIEW";
    const colors = {
      header: isSelected ? "#1e40af" : "#0f172a",
      accent: isSelected ? "#3b82f6" : "#ec4c3a",
      background: isSelected ? "#eff6ff" : "#fef2f2",
      border: isSelected ? "#bfdbfe" : "#fda4af",
      textAccent: isSelected ? "#1e40af" : "#991b1b"
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 700px; margin: 20px auto; background: #ffffff; border-radius: 0; overflow: hidden; box-shadow: none; border: none; }
          .header { background-color: ${colors.header}; padding: 40px 30px; text-align: center; }
          .logo { color: #ffffff; font-weight: 800; font-size: 24px; letter-spacing: -1px; }
          .subheader { color: #cbd5e1; font-size: 13px; margin: 10px 0 0 0; }
          .content { padding: 30px; }
          .title { font-size: 28px; font-weight: 900; color: ${colors.textAccent}; margin: 20px 0; letter-spacing: -1px; }
          .section-title { font-size: 14px; font-weight: 800; color: #0f172a; margin: 25px 0 15px 0; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
          .highlight-box { background-color: ${colors.background}; padding: 20px; border-radius: 8px; border-left: 4px solid ${colors.accent}; margin: 20px 0; }
          .highlight-box p { color: ${colors.textAccent}; font-size: 13px; margin: 8px 0; line-height: 1.6; font-weight: 600; }
          .next-steps { margin: 25px 0; }
          .step-item { font-size: 13px; color: #475569; margin: 12px 0; padding-left: 25px; position: relative; }
          .step-item:before { content: "→"; position: absolute; left: 0; color: ${colors.accent}; font-weight: 800; }
          .contact-box { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; }
          .contact-box p { font-size: 13px; color: #475569; margin: 5px 0; }
          .contact-box a { color: #3b82f6; text-decoration: none; font-weight: 600; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .footer-note { font-size: 12px; font-weight: 600; color: #0f172a; margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Geonixa Talent Acquisition</div>
            <p class="subheader">${data.status === "SELECTED" ? "Congratulations on Your Qualification" : data.status === "INTERVIEW" ? "Technical Interview Invitation" : "Assessment Result Update"}</p>
          </div>
          
          <div class="content">
            <p style="font-size: 14px; color: #1e293b; margin: 0 0 15px 0;">
              Hello <strong>${data.name}</strong>,
            </p>

            ${data.status === "SELECTED" ? `
              <div class="title">🎉 Congratulations!</div>
              <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
                We are delighted to inform you that you have successfully cleared the Geonixa Technical Competency Assessment. Your performance demonstrated exceptional technical acumen and problem-solving abilities.
              </p>
              
              <div class="highlight-box">
                <p>Your qualification status: <strong>ADVANCED TO NEXT PHASE</strong></p>
                <p>Our Human Resources and Onboarding team will contact you within <strong>48 hours</strong> with details regarding the next steps and offer package discussion.</p>
              </div>

              <div class="section-title">What's Next</div>
              <div class="next-steps">
                <div class="step-item">Formal offer documentation and employment contract review</div>
                <div class="step-item">Discussion of compensation, benefits, and position details</div>
                <div class="step-item">Scheduling of onboarding orientation and team integration</div>
              </div>
            ` : data.status === "INTERVIEW" ? `
              <div class="title">🎯 You're Invited to Interview</div>
              <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
                Your performance in the technical assessment has qualified you for a comprehensive technical interview with our Senior Engineering Leadership team. This is an exciting opportunity to discuss your technical background, solution approaches, and fit with Geonixa.
              </p>
              
              <div class="highlight-box">
                <p>Your interview qualification status: <strong>APPROVED FOR TECHNICAL INTERVIEW</strong></p>
                <p>A separate calendar invitation with interview scheduling, panel details, and virtual meeting link will be dispatched to you within <strong>24 hours</strong>.</p>
              </div>

              <div class="section-title">Interview Details</div>
              <div class="next-steps">
                <div class="step-item">Duration: Approximately 60-90 minutes</div>
                <div class="step-item">Format: Live technical discussion and architectural Q&A</div>
                <div class="step-item">Preparation: Review your assessment solutions and be ready to discuss your approach</div>
              </div>
            ` : `
              <div class="title">📋 Assessment Result Update</div>
              <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for your participation in the Geonixa Technical Competency Assessment. We have completed a thorough review of your responses and technical solutions.
              </p>
              
              <div class="highlight-box">
                <p>Your assessment status: <strong>NOT SELECTED FOR ADVANCEMENT</strong></p>
                <p>After careful evaluation against our technical benchmarks and hiring requirements, we have decided not to move forward with your application at this time.</p>
              </div>

              <div class="section-title">Feedback & Recommendations</div>
              <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
                We value the effort and time you invested in this assessment. To help you prepare for future opportunities, we recommend:
              </p>
              <div class="next-steps">
                <div class="step-item">Strengthen data structures and algorithm fundamentals</div>
                <div class="step-item">Practice complex problem-solving with time constraints</div>
                <div class="step-item">Focus on code optimization and edge case handling</div>
              </div>

              <p style="font-size: 13px; color: #475569; margin-top: 20px;">We encourage you to apply again in future recruitment cycles as your skills continue to develop. Geonixa maintains a candidate database for 12 months.</p>
            `}

            <!-- Contact Section -->
            <div class="contact-box">
              <p style="margin-top: 0; margin-bottom: 8px;"><strong>For any questions or clarifications:</strong></p>
              <p style="margin: 0;">
                <a href="mailto:talent@geonixa.com">talent@geonixa.com</a>
              </p>
            </div>

            <p style="font-size: 13px; color: #475569; margin-top: 25px;">Best regards,</p>
            <p style="margin: 5px 0;"><strong>Geonixa Talent Acquisition Team</strong></p>
          </div>

          <div class="footer">
            <div class="footer-note">Geonixa Ltd.</div>
            <p style="margin: 8px 0; font-size: 11px;">© ${new Date().getFullYear()} Geonixa. All rights reserved.</p>
            <p style="margin: 5px 0; font-size: 11px; color: #94a3b8;">Confidentiality Level: Internal / Recruitment</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  getTerminationTemplate(data: { name: string; examId: string; timestamp: string; reason: string }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #fef2f2; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #fecaca; }
          .header { background-color: #991b1b; padding: 40px 30px; text-align: center; }
          .logo { color: #ffffff; font-weight: 800; font-size: 24px; }
          .content { padding: 40px; }
          .violation-box { background-color: #fff1f2; border: 1px solid #fda4af; border-radius: 8px; padding: 25px; margin: 25px 0; }
          .label { font-size: 11px; font-weight: 800; color: #991b1b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
          .value { font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 15px; }
          .footer { background-color: #f9fafb; padding: 30px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #f3f4f6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">GEONIXA <span style="font-weight: 400; font-size: 14px; opacity: 0.8;">SECURITY AUDIT</span></div>
          </div>
          <div class="content">
            <h2 style="color: #991b1b; font-weight: 900; margin-top: 0;">Assessment Termination Notice</h2>
            <p style="font-size: 15px; color: #374151;">Dear <strong>${data.name}</strong>,</p>
            <p style="font-size: 15px; color: #374151; line-height: 1.7;">This is a formal notification that your assessment session has been **immediately terminated** and your candidate profile has been locked due to a critical violation of Geonixa's examination integrity policies.</p>
            
            <div class="violation-box">
              <div class="label">Exam Reference ID</div>
              <div class="value">${data.examId}</div>
              <div class="label">Termination Timestamp</div>
              <div class="value">${data.timestamp}</div>
              <div class="label">Primary Violation Detected</div>
              <div style="font-size: 16px; font-weight: 800; color: #991b1b;">${data.reason}</div>
            </div>

            <p style="font-size: 14px; color: #4b5563;">Geonixa maintains a zero-tolerance policy regarding academic and professional dishonesty. Our AI Proctoring suite has logged multiple high-confidence events including suspicious activity, tab switching, or unauthorized external assistance attempts during your session.</p>
            
            <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #991b1b;">
              <p style="margin: 0; font-size: 13px; font-weight: 700; color: #1f2937;">POLICY IMPLICATION:</p>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #4b5563;">Your current application for the Geonixa Technical Program is now void. Any scores obtained during this session are disqualified.</p>
            </div>
            
            <p style="margin-top: 40px; font-size: 14px; color: #6b7280;">This is an automated security notification. Do not reply to this email.</p>
            <p style="font-weight: 800; color: #111827;">Geonixa Integrity & Compliance Team</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Geonixa Corporation. Secure Session Logging ID: ${Math.random().toString(36).substring(7).toUpperCase()}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getAssessmentReportTemplate(data: {
    name: string;
    reportId: string;
    date: string;
    domain: string;
    score: number;
    maxScore: number;
    percentage: number;
    status: string;
    verificationUrl: string;
  }) {
    const isQual = data.status === 'QUALIFIED';
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
          .header { background-color: #0f172a; padding: 40px 30px; text-align: center; border-bottom: 4px solid #ff5a1f; }
          .logo { color: #ff5a1f; font-weight: 800; font-size: 26px; letter-spacing: -1px; }
          .content { padding: 40px; }
          .status-badge { display: inline-block; background-color: ${isQual ? '#ecfdf5' : '#fef2f2'}; color: ${isQual ? '#059669' : '#dc2626'}; font-weight: 800; font-size: 11px; padding: 6px 16px; border: 1px solid ${isQual ? '#10b981' : '#f87171'}; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 2px; border-radius: 20px; }
          .score-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; }
          .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 20px; text-align: center; }
          .footer { background-color: #f8fafc; padding: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">GEONIXA <span style="color: #ffffff; font-weight: 400; font-size: 14px; letter-spacing: 2px;">CORPORATE SYSTEMS</span></div>
          </div>
          <div class="content">
            <div class="status-badge">${data.status}</div>
            <h2 style="color: #0f172a; font-weight: 800; margin-top: 0; font-size: 24px;">Official Assessment Report</h2>
            <p style="font-size: 15px; color: #475569;">Dear <strong>${data.name}</strong>,</p>
            <p style="font-size: 15px; color: #475569; line-height: 1.7;">Congratulations on completing your technical assessment for the <strong>${data.domain}</strong> division. Your performance telemetry and cross-round evaluations have been formally compiled and archived.</p>
            
            <div class="score-box">
              <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Overall Evaluation Grade</div>
              <div style="font-size: 36px; font-weight: 900; color: #0f172a; line-height: 1;">${data.score} <span style="font-size: 18px; color: #64748b; font-weight: 600;">/ ${data.maxScore} (${data.percentage}%)</span></div>
              <div style="margin-top: 15px; font-size: 13px; color: #475569;">Report ID: <span style="font-family: monospace; font-weight: 700;">${data.reportId}</span></div>
            </div>

            <p style="font-size: 15px; color: #475569;">Attached to this email is your **Secure, Non-Editable Assessment PDF Report**. This document contains your detailed round-wise breakdown, coding challenge analytics, memory/runtime metrics, and official AI Proctoring integrity certification.</p>
            
            <p style="margin-top: 40px; font-size: 15px; color: #0f172a;">Thank you for your dedication to technical excellence.</p>
            <p style="font-weight: 800; color: #ff5a1f; margin-bottom: 5px;">Geonixa Talent Evaluation Core</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Geonixa Corporation. Secure immutable record verified via cryptographic hashing.
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
