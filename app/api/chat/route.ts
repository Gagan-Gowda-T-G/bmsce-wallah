import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";
    const lower = lastMessage.toLowerCase();

    let reply = "";

    if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey")) {
      reply = "Hello! 👋 Welcome to BMSCE WALLAH! I'm Vaibhu, your AI assistant. How can I help you today? 😊";
    } else if (lower.includes("note") || lower.includes("subject")) {
      reply = "📚 To find notes:\n1. Click Study Notes in sidebar\n2. Select your Year\n3. Choose Semester\n4. Select Subject\n5. Download notes! ✅";
    } else if (lower.includes("question") || lower.includes("paper") || lower.includes("cie") || lower.includes("exam")) {
      reply = "📝 Question Papers available:\n• CIE 1, CIE 2, CIE 3\n• End Semester papers\n\nClick Question Papers in sidebar! 🎯";
    } else if (lower.includes("faculty") || lower.includes("upload") || lower.includes("teacher")) {
      reply = "👨‍🏫 Faculty Portal:\n• Login via Faculty Portal\n• Admin approval required first\n• After approval, upload notes and papers\n• Students contact faculty via Contact Faculty page 📧";
    } else if (lower.includes("login") || lower.includes("sign")) {
      reply = "🔐 Login Options:\n• Students: Google login on main page\n• Faculty: Click Faculty Portal → Login → Wait for admin approval ✨";
    } else if (lower.includes("semester") || lower.includes("sem") || lower.includes("year")) {
      reply = "📅 Semester Structure:\n• 1st Year → Sem 1 & 2\n• 2nd Year → Sem 3 & 4\n• 3rd Year → Sem 5 & 6\n• 4th Year → Sem 7 & 8 🎓";
    } else if (lower.includes("placement") || lower.includes("job") || lower.includes("interview")) {
      reply = "💼 Placement Resources:\n• GeeksforGeeks - DSA prep\n• LeetCode - Coding practice\n• InterviewBit - Interview prep\n• IndiaBix - Aptitude tests 🚀";
    } else if (lower.includes("contact") || lower.includes("email") || lower.includes("gmail")) {
      reply = "📧 Contact Faculty:\n• Go to Contact Faculty in sidebar\n• All approved faculty emails listed\n• Click Send Email to open Gmail directly ✉️";
    } else if (lower.includes("bmsce") || lower.includes("college")) {
      reply = "🏫 BMSCE - B.M.S. College of Engineering\nEstablished 1946 in Bangalore\nOne of India's oldest engineering colleges! 🌟";
    } else if (lower.includes("thank")) {
      reply = "You're welcome! 😊 Good luck with your studies! 🎓✨";
    } else if (lower.includes("help") || lower.includes("what can you do")) {
      reply = "I can help with:\n📚 Notes & Subjects\n📝 Question Papers\n👨‍🏫 Faculty Contact\n🔐 Login Help\n📅 Semester Info\n💼 Placement Prep\n\nJust ask! 😊";
    } else if (lower.includes("vaibhu") || lower.includes("who are you") || lower.includes("your name")) {
      reply = "I'm Vaibhu! 🤖 Your AI assistant for BMSCE WALLAH portal. I'm here 24/7 to help you with notes, papers, and anything about BMSCE! 😊";
    } else if (lower.includes("deploy") || lower.includes("vercel") || lower.includes("website")) {
      reply = "🌐 BMSCE WALLAH is built with:\n• Next.js + TypeScript\n• Firebase for database\n• Cloudinary for files\n• Deployed on Vercel\n\nAsk admin for the live website link! 🚀";
    } else {
      reply = `Thanks for asking about "${lastMessage}"! 🤔\n\nI can help you with:\n• Notes & Subjects 📚\n• Question Papers 📝\n• Faculty Contact 👨‍🏫\n• Login Help 🔐\n• Placement Prep 💼\n\nAsk me anything about BMSCE WALLAH! 😊`;
    }

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({
      reply: "Hi! 👋 I'm Vaibhu! Ask me about notes, papers, or how to use BMSCE WALLAH! 😊"
    });
  }
}