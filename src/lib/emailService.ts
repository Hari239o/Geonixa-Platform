import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  candidateEmail: string;
  type: "REGISTRATION" | "COMPLETION" | "RESULT_SELECTED" | "RESULT_REJECTED" | "INTERVIEW_INVITATION";
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

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

    // DYNAMICALLY READ .env.local to avoid needing a server restart
    let smtpUser = process.env.SMTP_USER;
    let smtpPass = process.env.SMTP_PASS;

    try {
      const envPath = path.resolve(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envConfig: Record<string, string> = {};
        envContent.split('\n').forEach(line => {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match && match[2]) envConfig[match[1]] = match[2].trim();
        });
        if (envConfig.SMTP_USER) smtpUser = envConfig.SMTP_USER;
        if (envConfig.SMTP_PASS) smtpPass = envConfig.SMTP_PASS.trim(); // Only trim, don't remove internal spaces
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

    if (config) {
      this.transporter = nodemailer.createTransport(config);
    } else {
      // Ethereal Fallback for development/testing
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
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
      let fromAddress = process.env.SMTP_USER || "noreply@geonixa.com";
      try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const envConfig: Record<string, string> = {};
          envContent.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match && match[2]) envConfig[match[1]] = match[2].trim();
          });
          if (envConfig.SMTP_USER) fromAddress = envConfig.SMTP_USER;
        }
      } catch (e) {}
      
      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Geonixa Talent Acquisition'}" <${fromAddress}>`,
        to,
        subject,
        html,
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
        previewUrl: !fromAddress.includes("gmail") ? (nodemailer.getTestMessageUrl(info) || null) : null 
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
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
          .header { background-color: #0f172a; padding: 40px 30px; text-align: center; border-bottom: 4px solid #ff5a1f; }
          .logo { color: #ff5a1f; font-weight: 800; font-size: 28px; letter-spacing: -1px; }
          .content { padding: 40px; }
          .welcome { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 24px; border-left: 4px solid #ff5a1f; padding-left: 15px; }
          .credential-box { background-color: #f8fafc; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 30px 0; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05); }
          .label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1.5px; margin-bottom: 6px; }
          .value { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 20px; }
          .passkey { font-family: 'JetBrains Mono', monospace; background: #0f172a; color: #22c55e; padding: 6px 12px; border-radius: 6px; font-weight: 800; letter-spacing: 1px; }
          .btn { display: inline-block; background-color: #ff5a1f; color: #ffffff !important; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 14px; margin-top: 25px; text-align: center; box-shadow: 0 4px 6px -1px rgba(255, 90, 31, 0.4); }
          .footer { background-color: #f1f5f9; padding: 30px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .instructions { margin-top: 40px; padding-top: 30px; border-top: 2px dashed #e2e8f0; }
          .instruction-item { font-size: 13px; margin-bottom: 12px; color: #475569; display: flex; align-items: flex-start; gap: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">GEONIXA <span style="color: #ffffff; font-weight: 400; font-size: 14px; letter-spacing: 2px;">CORPORATE SYSTEMS</span></div>
          </div>
          <div class="content">
            <div class="welcome">Assessment Authorization: ${data.name}</div>
            <p style="color: #475569; font-size: 15px;">You have been formally authorized to participate in the Geonixa Technical Competency Evaluation for the <strong>${data.domain}</strong> division. Your credentials and scheduled session details are provided below.</p>
            
            <div class="credential-box">
              <div class="label">Candidate Reference</div>
              <div class="value" style="color: #ff5a1f;">${data.candidateId}</div>
              
              <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px;">
                <div>
                  <div class="label">Login Identity</div>
                  <div class="value">${data.username}</div>
                </div>
                <div>
                  <div class="label">Security Pass-Key</div>
                  <div class="value"><span class="passkey">${data.passKey}</span></div>
                </div>
              </div>

              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <div class="label">Deployment Schedule</div>
                <div class="value">${data.date} • ${data.slot}</div>
              </div>
            </div>

            <div style="background-color: #ebf5ff; padding: 25px; border-radius: 10px; border-left: 4px solid #3b82f6; margin-top: 30px;">
              <div style="font-weight: 800; font-size: 15px; color: #1e3a8a; margin-bottom: 12px; text-transform: uppercase;">Login Instructions:</div>
              <p style="color: #1e40af; font-size: 14px; margin: 0 0 10px 0;">
                1. Access the official assessment portal using the secured link provided by your administrator.
              </p>
              <p style="color: #1e40af; font-size: 14px; margin: 0 0 10px 0;">
                2. Enter your precise Login Identity and Security Pass-Key provided above to authenticate your session.
              </p>
              <p style="color: #1e40af; font-size: 14px; font-weight: 700; margin: 0;">
                IMPORTANT: Your credentials will strictly activate ONLY on your scheduled date (${data.date}) during your specific time slot (${data.slot}). Attempts to login outside this window will be rejected.
              </p>
            </div>

            <div class="instructions">
              <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">Pre-Flight Protocols:</div>
              <div class="instruction-item"><span>💻</span> <span><strong>Terminal Compatibility:</strong> Use Google Chrome (Desktop) for neural tracking stability.</span></div>
              <div class="instruction-item"><span>📷</span> <span><strong>Proctoring:</strong> Ensure high-definition camera visibility and clear lighting.</span></div>
              <div class="instruction-item"><span>📡</span> <span><strong>Network:</strong> Maintain a stable, low-latency connection (Min 5 Mbps).</span></div>
              <div class="instruction-item"><span>⚠</span> <span><strong>Integrity:</strong> Multi-tab interaction or external assistance triggers immediate disqualification.</span></div>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Geonixa Corporation. Unauthorized distribution of this document is prohibited. <br>
            <span style="display: inline-block; margin-top: 10px; font-weight: 700;">CONFIDENTIALITY LEVEL: INTERNAL / RECRUITMENT</span>
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
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
          .header { background-color: #059669; padding: 40px 30px; text-align: center; }
          .logo { color: #ffffff; font-weight: 800; font-size: 26px; }
          .content { padding: 40px; }
          .status-badge { display: inline-block; background-color: #ecfdf5; color: #059669; font-weight: 800; font-size: 12px; padding: 6px 16px; rounded-full; border: 1px solid #10b981; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; border-radius: 20px; }
          .info-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; margin: 25px 0; }
          .footer { background-color: #f1f5f9; padding: 30px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">GEONIXA <span style="font-weight: 400; font-size: 14px; opacity: 0.8;">SUCCESS</span></div>
          </div>
          <div class="content">
            <div class="status-badge">Submission Confirmed</div>
            <h2 style="color: #0f172a; font-weight: 800; margin-top: 0;">Assessment Logged Successfully</h2>
            <p>Dear ${data.name},</p>
            <p>This automated dispatch confirms that your technical assessment data has been successfully uploaded to the Geonixa Evaluation Core. Our automated integrity systems are now processing your session telemetry.</p>
            
            <div class="info-box">
              <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Submission Reference</div>
              <div style="font-size: 15px; font-weight: 700; color: #0f172a;">${data.timestamp}</div>
            </div>

            <h4 style="color: #0f172a; margin-bottom: 10px;">What's Next?</h4>
            <p style="font-size: 14px; color: #475569;">Our recruitment leads will meticulously review your performance across all modules. You can expect an official status update regarding the next steps in our hiring cycle <strong>within 7 business days</strong>.</p>
            
            <p style="margin-top: 30px;">Thank you for demonstrating your technical expertise with Geonixa.</p>
            <p style="font-weight: 700;">Geonixa Talent Acquisition Team</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Geonixa Corporation. This is an automated receipt of assessment submission.
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getResultTemplate(data: { name: string; status: "SELECTED" | "REJECTED" | "INTERVIEW" }) {
    const isSelected = data.status === "SELECTED" || data.status === "INTERVIEW";
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
          .header { background-color: ${isSelected ? "#1e40af" : "#0f172a"}; padding: 40px 30px; text-align: center; }
          .logo { color: #ffffff; font-weight: 800; font-size: 26px; }
          .content { padding: 40px; }
          .footer { background-color: #f1f5f9; padding: 30px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">GEONIXA <span style="font-weight: 400; font-size: 14px; opacity: 0.8;">NOTIFICATION</span></div>
          </div>
          <div class="content">
            <p style="font-size: 16px;">Dear ${data.name},</p>
            ${data.status === "SELECTED" ? `
              <h1 style="color: #1e40af; font-weight: 900; letter-spacing: -1px;">Congratulations!</h1>
              <p style="font-size: 15px; color: #475569;">We are thrilled to inform you that you have successfully cleared the Technical Evaluation phase. Your performance met our highest standards for technical excellence and analytical rigor.</p>
              <div style="background-color: #eff6ff; padding: 25px; border-radius: 12px; border: 1px solid #bfdbfe; margin: 25px 0;">
                <p style="margin: 0; font-weight: 700; color: #1e40af;">Our Onboarding & HR division will reach out to you within 48 hours to discuss the formal offer and employment logistics.</p>
              </div>
            ` : data.status === "INTERVIEW" ? `
              <h1 style="color: #1e40af; font-weight: 900; letter-spacing: -1px;">Technical Interview Invitation</h1>
              <p style="font-size: 15px; color: #475569;">Your performance in the assessment has qualified you for a deep-dive technical discussion with our Senior Engineering Leads.</p>
              <div style="background-color: #eff6ff; padding: 25px; border-radius: 12px; border: 1px solid #bfdbfe; margin: 25px 0;">
                <p style="margin: 0; font-weight: 700; color: #1e40af;">A separate calendar invitation with the virtual meeting link and interview panel details will be dispatched shortly.</p>
              </div>
            ` : `
              <h2 style="color: #0f172a; font-weight: 800;">Application Update</h2>
              <p style="font-size: 15px; color: #475569;">Thank you for your participation in the Geonixa Technical Competency Assessment.</p>
              <p style="font-size: 15px; color: #475569;">After a thorough review of your assessment telemetry and technical scores, we have decided not to proceed with your application at this time.</p>
              <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 25px 0;">
                <p style="margin: 0; font-size: 14px; color: #64748b; font-style: italic;">We appreciate the effort you invested and wish you significant success in your upcoming professional endeavors.</p>
              </div>
            `}
            <p style="margin-top: 40px;">Best regards,<br><span style="font-weight: 800; color: #0f172a;">Geonixa Talent Acquisition</span></p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Geonixa Corporation. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
