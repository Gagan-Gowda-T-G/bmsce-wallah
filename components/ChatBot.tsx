"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! 👋 I'm Vaibhu!\n\nYour BMSCE WALLAH AI assistant 🤖\n\nAsk me anything about:\n📚 Notes & Subjects\n📝 Question Papers\n🗺️ How to use this portal",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Sorry, try again!" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection issue. Try again!" },
      ]);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 99999 }}>

      {/* CHAT WINDOW */}
      {open && (
        <div style={{
          position: "absolute",
          bottom: "70px",
          right: "0",
          width: "320px",
          height: "430px",
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #1d4ed8, #4f46e5)",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px"
              }}>🤖</div>
              <div>
                <div style={{ color: "white", fontWeight: "700", fontSize: "14px" }}>Vaibhu</div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "6px", height: "6px", background: "#4ade80", borderRadius: "50%" }} />
                  <span style={{ color: "#bfdbfe", fontSize: "11px" }}>Online · BMSCE AI</span>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: "rgba(255,255,255,0.15)",
              border: "none", cursor: "pointer",
              width: "28px", height: "28px",
              borderRadius: "8px",
              color: "white", fontSize: "16px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto",
            padding: "16px",
            display: "flex", flexDirection: "column", gap: "12px",
            background: "#f8fafc",
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: "8px",
              }}>
                {msg.role === "assistant" && (
                  <div style={{
                    width: "28px", height: "28px",
                    background: "linear-gradient(135deg,#1d4ed8,#4f46e5)",
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px", flexShrink: 0,
                  }}>🤖</div>
                )}
                <div style={{
                  maxWidth: "75%",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: msg.role === "user" ? "linear-gradient(135deg,#1d4ed8,#4f46e5)" : "white",
                  color: msg.role === "user" ? "white" : "#1e293b",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  whiteSpace: "pre-line",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                }}>
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div style={{
                    width: "28px", height: "28px",
                    background: "#eff6ff",
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: "700", color: "#1d4ed8", flexShrink: 0,
                  }}>U</div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "28px", height: "28px",
                  background: "linear-gradient(135deg,#1d4ed8,#4f46e5)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px",
                }}>🤖</div>
                <div style={{
                  background: "white", padding: "10px 14px",
                  borderRadius: "18px 18px 18px 4px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                  display: "flex", gap: "4px", alignItems: "center",
                }}>
                  {[0, 1, 2].map(n => (
                    <div key={n} style={{
                      width: "7px", height: "7px",
                      background: "#93c5fd", borderRadius: "50%",
                      animation: "bounce 1s infinite",
                      animationDelay: `${n * 150}ms`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "12px",
            borderTop: "1px solid #f1f5f9",
            background: "white",
            flexShrink: 0,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "#f8fafc",
              border: "1.5px solid #e2e8f0",
              borderRadius: "14px",
              padding: "8px 12px",
            }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Ask Vaibhu anything..."
                style={{
                  flex: 1, background: "transparent",
                  border: "none", outline: "none",
                  fontSize: "13px", color: "#1e293b",
                }}
              />
              <button onClick={send} disabled={loading || !input.trim()}
                style={{
                  width: "30px", height: "30px",
                  background: input.trim() ? "linear-gradient(135deg,#1d4ed8,#4f46e5)" : "#e2e8f0",
                  border: "none", cursor: input.trim() ? "pointer" : "default",
                  borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", transition: "all 0.2s",
                }}>
                <span style={{ color: "white" }}>➤</span>
              </button>
            </div>
            <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "10px", marginTop: "6px" }}>
              Powered by Gemini AI ✨
            </p>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: open ? "52px" : "auto",
          height: "52px",
          background: open ? "#ef4444" : "linear-gradient(135deg, #1d4ed8, #4f46e5)",
          border: "none",
          borderRadius: open ? "50%" : "50px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: open ? "0" : "0 18px",
          boxShadow: "0 8px 25px rgba(29,78,216,0.45)",
          transition: "all 0.3s",
          color: "white",
          fontWeight: "700",
          fontSize: "14px",
          position: "relative",
        }}
      >
        {open ? (
          <span style={{ fontSize: "20px" }}>✕</span>
        ) : (
          <>
            <span style={{ fontSize: "20px" }}>🤖</span>
            <span>Vaibhu AI</span>
            {/* Green dot */}
            <span style={{
              position: "absolute",
              top: "-3px", right: "-3px",
              width: "12px", height: "12px",
              background: "#4ade80",
              borderRadius: "50%",
              border: "2px solid white",
            }} />
          </>
        )}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}