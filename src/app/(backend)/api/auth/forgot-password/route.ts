import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email address.' }, { status: 404 });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send email using Nodemailer
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Forgot password error: EMAIL_USER or EMAIL_PASS environment variables are missing in Vercel.');
      return NextResponse.json({ error: 'Email service is not configured on the server. Please add EMAIL_USER and EMAIL_PASS to Vercel.' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
      || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null)
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Kalinq" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Password Reset</h2>
          <p>You requested to reset your Kalinq password.</p>
          <p>Click the link below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #EF4423; color: #ffffff; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, please ignore this email. This link will expire in 1 hour.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Reset link sent successfully to your email!' }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
