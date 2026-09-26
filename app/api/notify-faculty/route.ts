import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { facultyEmail, facultyName, approved } = await req.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.ADMIN_EMAIL, pass: process.env.ADMIN_EMAIL_PASSWORD },
  });

  await transporter.sendMail({
    from: `"BMSCE WALLAH Admin" <${process.env.ADMIN_EMAIL}>`,
    to: facultyEmail,
    subject: approved ? "✅ Faculty Access Approved — BMSCE WALLAH" : "❌ Faculty Access Rejected — BMSCE WALLAH",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px;">
        <h2 style="color: ${approved ? "#16a34a" : "#dc2626"};">
          ${approved ? "✅ Access Approved!" : "❌ Access Rejected"}
        </h2>
        <p>Dear ${facultyName},</p>
        <p>${approved
          ? "Your faculty access to BMSCE WALLAH has been approved. You can now login and upload notes and question papers."
          : "Unfortunately, your faculty access request has been rejected. Please contact the admin for more information."
        }</p>
        ${approved ? `<a href="${process.env.NEXT_PUBLIC_APP_URL}/faculty-login" 
          style="display: inline-block; background: #1a56db; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
          Login to Faculty Portal
        </a>` : ""}
        <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">BMSCE WALLAH Team</p>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}