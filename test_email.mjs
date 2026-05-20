import nodemailer from "nodemailer";

async function test() {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "talent@geonixa.com",
      pass: "uromhbnorasfurhy",
    },
  });

  try {
    await transporter.verify();
    console.log("Transporter verification SUCCESS!");
    
    const info = await transporter.sendMail({
      from: '"Geonixa Talent Acquisition" <talent@geonixa.com>',
      to: "talent@geonixa.com", // send to self as a test
      subject: "Test Email from Script",
      text: "If you get this, SMTP works.",
    });
    
    console.log("Email sent successfully! Message ID:", info.messageId);
  } catch (err) {
    console.error("Transporter test FAILED:", err);
  }
}

test();
