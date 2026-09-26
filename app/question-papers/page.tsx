"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { db as database } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, FileText, Home, BookOpen,
  Mail, GraduationCap, LogOut, Download,
  Sparkles, ChevronRight
} from "lucide-react";

const TYPES = [
  { key: "cie1", label: "CIE 1", color: "blue" },
  { key: "cie2", label: "CIE 2", color: "purple" },
  { key: "cie3", label: "CIE 3", color: "orange" },
  { key: "endsem", label: "End Sem", color: "green" },
];

export default function QuestionPapersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const courseName = searchParams.get("courseName");

  const [activeType, setActiveType] = useState("cie1");
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/auth");
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    loadPapers(activeType);
  }, [activeType, courseId]);

  const loadPapers = async (type: string) => {
    setLoading(true);
    try {
      const path = courseId
        ? `question_papers/${courseId}/${type}`
        : `question_papers/general/${type}`;
      const snap = await get(ref(database, path));
      if (snap.exists()) {
        const val = snap.val();
        const list = Object.entries(val).map(([id, v]: any) => ({ id, ...v }));
        setPapers(list);
      } else {
        setPapers([]);
      }
    } catch (e) {
      setPapers([]);
    }
    setLoading(false);
  };

  const askAI = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiAnswer("");
    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: aiQuestion,
          course: courseName || "Engineering",
        }),
      });
      const data = await res.json();
      setAiAnswer(data.answer || "No answer received.");
    } catch {
      setAiAnswer("AI is unavailable right now. Try again!");
    }
    setAiLoading(false);
  };

  const colorMap: any = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    green: "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <div className="min-h-screen bg-[#eef2ff] flex">
      <div className="logo-watermark" />

      {/* SIDEBAR */}
      <aside className="sidebar flex flex-col">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="BMSCE" width={40} height={40} className="rounded-lg" />
            <div>
              <p className="font-bold text-slate-800 text-sm">BMSCE WALLAH</p>
              <p className="text-xs text-slate-400">Academic Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 mt-2">
          <Link href="/" className="nav-item"><Home size={16} /> Home</Link>
          <Link href="/dashboard" className="nav-item"><BookOpen size={16} /> Study Notes</Link>
          <Link href="/question-papers" className="nav-item active"><FileText size={16} /> Question Papers</Link>
          <Link href="/contact-faculty" className="nav-item"><Mail size={16} /> Contact Faculty</Link>
          <Link href="/faculty-login" className="nav-item"><GraduationCap size={16} /> Faculty Portal</Link>
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button onClick={() => { signOut(auth); router.push("/auth"); }}
            className="nav-item text-red-500 hover:bg-red-50">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link href={courseId ? `/dashboard` : "/"}>
              <button className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition">
                <ArrowLeft size={16} className="text-slate-500" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Question Papers</h1>
              {courseName && (
                <p className="text-slate-400 text-sm mt-0.5">{decodeURIComponent(courseName)}</p>
              )}
            </div>
            <button
              onClick={() => setShowAi(!showAi)}
              className="ml-auto flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-purple-200 hover:shadow-purple-300 transition">
              <Sparkles size={14} /> Ask AI
            </button>
          </div>

          {/* AI Panel */}
          {showAi && (
            <div className="card mb-6 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-purple-500" />
                <h3 className="font-semibold text-purple-800">Ask Vaibhu AI about this paper</h3>
              </div>
              <div className="flex gap-2">
                <input
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askAI()}
                  placeholder="e.g. Explain question 5 from CIE 1..."
                  className="flex-1 border border-purple-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400 bg-white"
                />
                <button onClick={askAI} disabled={aiLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50">
                  {aiLoading ? "..." : "Ask"}
                </button>
              </div>
              {aiAnswer && (
                <div className="mt-3 bg-white border border-purple-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                  {aiAnswer}
                </div>
              )}
            </div>
          )}

          {/* Type Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {TYPES.map((t) => (
              <button key={t.key}
                onClick={() => setActiveType(t.key)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold border transition ${
                  activeType === t.key
                    ? colorMap[t.color]
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Papers List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            </div>
          ) : papers.length === 0 ? (
            <div className="card text-center py-16">
              <FileText size={36} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">No papers uploaded yet</p>
              <p className="text-slate-400 text-sm mt-1">
                Faculty will upload {TYPES.find(t => t.key === activeType)?.label} papers soon!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {papers.map((paper: any) => (
                <div key={paper.id} className="card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-red-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{paper.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {paper.year && (
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            📅 {paper.year}
                          </span>
                        )}
                        <span className="text-slate-400 text-xs">
                          By: {paper.uploaderEmail}
                        </span>
                      </div>
                    </div>
                  </div>
                  <a href={paper.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition">
                    <Download size={12} /> View
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}