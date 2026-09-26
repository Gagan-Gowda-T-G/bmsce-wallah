import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { facultyName, facultyEmail, facultyPhoto } = await req.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_EMAIL_PASSWORD, // Gmail App Password
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const mailOptions = {
    from: `"BMSCE WALLAH" <${process.env.ADMIN_EMAIL}>`,
    to: process.env.ADMIN_EMAIL, // YOUR Gmail
    subject: `🔔 New Faculty Login Request — ${facultyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f8ff; padding: 30px; border-radius: 16px;">
        <div style="background: linear-gradient(135deg, #1e3a5f, #1a56db); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">BMSCE WALLAH</h1>
          <p style="color: #bfdbfe; margin: 4px 0 0;">Faculty Access Request</p>
        </div>
        
        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e0e7ff;">
          <h2 style="color: #1e3a5f; margin-top: 0;">New Faculty Login Request</h2>
          <p style="color: #4b5563;">A faculty member has requested access to BMSCE WALLAH:</p>
          
          <div style="background: #f0f4ff; border-radius: 8px; padding: 16px; margin: 16px 0;">
            ${facultyPhoto ? `<img src="${facultyPhoto}" alt="Faculty Photo" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 12px; display: block;">` : ""}
            <p style="margin: 4px 0;"><strong>Name:</strong> ${facultyName}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${facultyEmail}</p>
            <p style="margin: 4px 0;"><strong>Requested At:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
          </div>
          
          <div style="display: flex; gap: 12px; margin-top: 20px;">
            <a href="${appUrl}/admin" 
               style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              ✅ Go to Admin Panel to Approve
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 13px; margin-top: 16px;">
            Login to your admin panel and navigate to Faculty Requests to approve or reject.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}