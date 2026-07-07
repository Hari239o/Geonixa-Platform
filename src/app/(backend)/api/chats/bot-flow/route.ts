import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

const QUESTIONS = [
  "What is the best time for our team to connect with you?",
  "Do you have any strict deadlines for this campaign?",
  "Are there any specific deliverables you'd like to highlight?",
  "Any special requirements or notes before we connect you?"
];

export async function POST(req: Request) {
  try {
    const { dealId, brandId, creatorId, answers } = await req.json();

    if (!dealId || !answers || answers.length === 0) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create DealChat
    // Note: dealId is unique, so we use upsert in case it already exists (if both parties accept somehow, though unlikely)
    const chat = await prisma.dealChat.upsert({
      where: { dealId },
      update: {},
      create: {
        dealId,
        brandId,
        creatorId,
        status: 'bot'
      }
    });

    // 2. Insert chat messages for bot and user
    // We'll interleave questions and answers
    const messagesToInsert = [];
    for (let i = 0; i < answers.length; i++) {
      // Bot question
      messagesToInsert.push({
        chatId: chat.id,
        senderId: 'bot',
        senderName: 'Kalinq Assistant',
        content: QUESTIONS[i] || "Question",
      });
      // User answer
      messagesToInsert.push({
        chatId: chat.id,
        senderId: brandId || creatorId || 'user', // Depending on who initiated, but we don't strictly need precise ID here
        senderName: 'User',
        content: answers[i]
      });
    }

    await prisma.chatMessage.createMany({
      data: messagesToInsert
    });

    // 3. Send email to admin
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Adjust if using different SMTP provider
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'hello@kalinq.com',
        pass: process.env.SMTP_PASS || 'your-smtp-password'
      }
    });

    // Even if SMTP is not configured properly, we won't crash the API entirely, but we'll try
    try {
      const emailHtml = `
        <h2>New Successful Deal!</h2>
        <p>A new deal (ID: ${dealId}) has just been accepted!</p>
        <p>Here are the preferences provided by the user in the automated chat:</p>
        <ul>
          ${answers.map((ans: string, i: number) => `<li><strong>${QUESTIONS[i]}:</strong> ${ans}</li>`).join('')}
        </ul>
        <br/>
        <p>Log in with <strong>admin@kalinq.com</strong> to view and join the chat.</p>
        <a href="https://kalinq.vercel.app/chats/${chat.id}">Go to Chat</a>
      `;

      await transporter.sendMail({
        from: '"Kalinq Admin" <hello@kalinq.com>',
        to: 'admin@kalinq.com',
        subject: `[Action Required] New Deal Accepted - ${dealId}`,
        html: emailHtml
      });
    } catch (emailError) {
      console.warn("Failed to send admin email, maybe SMTP not configured yet:", emailError);
      // We don't fail the request if email fails, because the chat is already saved to DB
    }

    return NextResponse.json({ success: true, chatId: chat.id });

  } catch (error: any) {
    console.error("Bot flow error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
