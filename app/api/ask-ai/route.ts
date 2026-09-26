import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const { question, course } = await req.json();
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(
      `You are an expert academic assistant for BMSCE engineering students.
       Course: ${course}. Question: ${question}.
       Give a clear answer for engineering students.`
    );
    return NextResponse.json({ answer: result.response.text() });
  } catch {
    return NextResponse.json({ answer: "Try again!" }, { status: 500 });
  }
}