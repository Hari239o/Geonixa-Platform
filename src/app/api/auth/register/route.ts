import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import os from "os";

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        if (iface) {
            for (let i = 0; i < iface.length; i++) {
                const alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                    return alias.address;
            }
        }
    }
    return '127.0.0.1';
}

export async function POST(req: Request) {
  try {
    const { email, password, name, college, domain } = await req.json();
    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    let finalOrigin = origin;
    if (origin.includes("localhost")) {
       finalOrigin = origin.replace("localhost", getLocalIp());
    }

    let transporter;
    
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, 
            auth: {
                user: testAccount.user, 
                pass: testAccount.pass, 
            },
        });
    }

    // Removed specific date generation to prevent Gmail AI Event extraction

    const mncHtmlTemplate = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-top: 5px solid #0f172a; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="padding: 25px 30px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="margin: 0; font-size: 28px; font-family: 'Arial', sans-serif; font-weight: 900; letter-spacing: -0.5px;">
               <span style="color: #ea580c;">Geo</span><span style="color: #334155;">Nixa</span>
            </h1>
          </div>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="margin-top: 0; color: #1e293b; font-size: 20px;">Dear ${name || 'Candidate'},</h2>
          <p style="line-height: 1.6; color: #334155;">Congratulations! Your profile originating from <strong>${college || 'your institution'}</strong> has been approved for the <strong>${domain || 'specialized'}</strong> skill evaluation phase. You are hereby invited to attend the mandatory <strong>AI-Proctored Technical Assessment</strong> as the first round of the evaluation structure.</p>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 30px 0; border: 1px dashed #cbd5e1;">
            <h3 style="margin: 0 0 15px; color: #0f172a; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Strict Assessment Credentials</h3>
            <ul style="margin: 0; padding: 0; list-style: none;">
              <li style="margin-bottom: 10px; display: flex;"><strong style="width: 150px; color: #475569;">Target Role:</strong> <span>${domain || 'Software Assessment'}</span></li>
              <li style="margin-bottom: 10px; display: flex;"><strong style="width: 150px; color: #475569;">Access Window:</strong> <span style="font-weight: 600; color: #b91c1c;">Valid for 48 Hours</span></li>
              <li style="margin-bottom: 10px; display: flex;"><strong style="width: 150px; color: #475569;">Duration Allowed:</strong> <span>55 Minutes (Time Constrained)</span></li>
              <li style="margin-bottom: 10px; display: flex;"><strong style="width: 150px; color: #475569;">Allocated Login ID:</strong> <span>${email}</span></li>
              <li style="display: flex; align-items: center;"><strong style="width: 150px; color: #475569;">Secure Pass-Key:</strong> <span style="font-family: monospace; background: #22c55e; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; letter-spacing: 2px;">${password}</span></li>
            </ul>
          </div>

          <p style="margin: 0 0 10px; font-weight: bold; color: #1e293b;">Mandatory Hardware & Protocol Prerequisites:</p>
          <ul style="line-height: 1.6; color: #475569; padding-left: 20px; margin-top: 0;">
            <li>A working Web Camera and internal Microphone are explicitly required. Hardware is tested before entry.</li>
            <li>Advanced Face tracking, audio anomaly detection, and peripheral device bounds are ACTIVE.</li>
            <li>Tab-Switching or minimizing the browser will be flagged recursively. 3 Flags result in immediate disqualification.</li>
            <li>Ensure a stable 5Mbps+ constant internet pipeline.</li>
          </ul>

          <div style="margin-top: 40px; text-align: center;">
            <a href="${finalOrigin}/auth/login" style="background-color: #0f172a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Proceed to Secure Login Portal</a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0;">This is an auto-generated confidential system dispatch. Do not reply to this email.</p>
          <p style="margin: 5px 0 0;">&copy; ${new Date().getFullYear()} Geonixa Corporate Infrastructure. All rights reserved.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"Geonixa Talent Acquisition" <noreply@geonixa.com>',
      to: email,
      subject: "Action Required: Geonixa AI Technical Assessment - " + (domain || 'Interview'),
      html: mncHtmlTemplate,
    });

    let previewUrl = null;
    if (!process.env.SMTP_USER) {
        previewUrl = nodemailer.getTestMessageUrl(info);
    }

    return NextResponse.json({ 
       success: true, 
       message: 'Email dispatched securely', 
       previewUrl: previewUrl 
    });
  } catch (error: any) {
    console.error("Nodemailer error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
// Force Turbopack Cache Re-evaluation
