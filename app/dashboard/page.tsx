"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getCoursesBySemester, getUnitsByCourse } from "@/lib/database";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, BookOpen, Download, FileText,
  Home, Mail, GraduationCap, LogOut,
  ChevronRight, ExternalLink, Trophy, Zap
} from "lucide-react";

const YEARS = [
  { year: 1, label: "1st Year", semesters: [1, 2], gradient: "linear-gradient(135deg,#3b82f6,#1d4ed8)", shadow: "0 8px 20px rgba(59,130,246,0.35)" },
  { year: 2, label: "2nd Year", semesters: [3, 4], gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)", shadow: "0 8px 20px rgba(139,92,246,0.35)" },
  { year: 3, label: "3rd Year", semesters: [5, 6], gradient: "linear-gradient(135deg,#10b981,#059669)", shadow: "0 8px 20px rgba(16,185,129,0.35)" },
  { year: 4, label: "4th Year", semesters: [7, 8], gradient: "linear-gradient(135deg,#f59e0b,#d97706)", shadow: "0 8px 20px rgba(245,158,11,0.35)" },
];

const PLACEMENT_LINKS = [
  { name: "GeeksforGeeks", desc: "DSA & Placement", url: "https://www.geeksforgeeks.org/placement-preparation/", emoji: "🧠", bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
  { name: "LeetCode", desc: "Coding Practice", url: "https://leetcode.com/", emoji: "💻", bg: "#fefce8", border: "#fde68a", text: "#b45309" },
  { name: "InterviewBit", desc: "Interview Prep", url: "https://www.interviewbit.com/", emoji: "🎯", bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
  { name: "IndiaBix", desc: "Aptitude Tests", url: "https://www.indiabix.com/", emoji: "📊", bg: "#fdf4ff", border: "#e9d5ff", text: "#7c3aed" },
];

const DAILY_FACTS = [
  "💡 The first computer bug was an actual bug — a moth found in a relay of Harvard's Mark II computer in 1947.",
  "🚀 NASA's Apollo 11 guidance computer had less processing power than a modern calculator.",
  "🔬 The human brain processes images 60,000 times faster than text.",
  "⚡ The word 'engineer' comes from the Latin 'ingeniare' — to devise or design.",
  "🌍 BMSCE was established in 1946 and is one of India's oldest engineering colleges.",
];

export default function DashboardPage() {
  const router = useRouter();
  const [step, setStep] = useState<"year" | "sem" | "course" | "units">("year");
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [selectedSem, setSelectedSem] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fact] = useState(DAILY_FACTS[Math.floor(Math.random() * DAILY_FACTS.length)]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/auth");
    });
    return () => unsub();
  }, [router]);

  const pickSemester = async (sem: number) => {
    setLoading(true);
    setSelectedSem(sem);
    const data = await getCoursesBySemester(sem);
    setCourses(data as any[]);
    setStep("course");
    setLoading(false);
  };

  const pickCourse = async (course: any) => {
    setLoading(true);
    setSelectedCourse(course);
    const data = await getUnitsByCourse(course.id);
    setUnits(data as any[]);
    setStep("units");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg,#f0f4ff 0%,#faf5ff 50%,#f0fff4 100%)" }}>
      <div className="logo-watermark" />

      {/* SIDEBAR */}
      <aside className="sidebar flex flex-col" style={{ background: "rgba(255,255,255,0.93)", backdropFilter: "blur(20px)" }}>
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="BMSCE" width={38} height={38} className="rounded-lg" />
            <div>
              <p className="font-bold text-slate-800 text-sm">BMSCE WALLAH</p>
              <p className="text-xs text-slate-400">Academic Portal</p>
            </div>
          </div>
        </div>

        {/* Breadcrumb trail */}
        <div className="px-3 py-3 border-b border-slate-100" style={{ background: "#f8fafc" }}>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider px-1 mb-2">You are here</p>
          <div className="space-y-1">
            {[
              { label: "📅 Select Year", active: step === "year", onClick: () => setStep("year"), show: true },
              { label: `📚 ${selectedYear?.label || ""}`, active: step === "sem", onClick: () => selectedYear && setStep("sem"), show: !!selectedYear },
              { label: `📖 Semester ${selectedSem || ""}`, active: step === "course", onClick: () => selectedSem && setStep("course"), show: !!selectedSem },
              { label: `📄 ${selectedCourse?.name?.substring(0, 14) || ""}...`, active: step === "units", onClick: () => {}, show: !!selectedCourse },
            ].filter(x => x.show).map((item, i) => (
              <button key={i} onClick={item.onClick}
                className="w-full text-left text-xs px-3 py-1.5 rounded-lg transition font-medium"
                style={{ background: item.active ? "#eff6ff" : "transparent", color: item.active ? "#1d4ed8" : "#94a3b8" }}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 mt-1">
          <Link href="/" className="nav-item"><Home size={15} /> Home</Link>
          <Link href="/dashboard" className="nav-item active"><BookOpen size={15} /> Study Notes</Link>
          <Link href="/question-papers" className="nav-item"><FileText size={15} /> Question Papers</Link>
          <Link href="/contact-faculty" className="nav-item"><Mail size={15} /> Contact Faculty</Link>
          <Link href="/faculty-login" className="nav-item"><GraduationCap size={15} /> Faculty Portal</Link>
        </nav>

        {/* Daily Fact in sidebar */}
        <div className="mx-3 mb-3 p-3 rounded-xl" style={{ background: "linear-gradient(135deg,#eff6ff,#f5f3ff)", border: "1px solid #e0e7ff" }}>
          <p className="text-xs font-semibold text-indigo-600 mb-1">💡 Did you know?</p>
          <p className="text-xs text-slate-500 leading-relaxed">{fact}</p>
        </div>

        <div className="p-3 border-t border-slate-100">
          <button onClick={() => { signOut(auth); router.push("/auth"); }}
            className="nav-item text-red-500 hover:bg-red-50">
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content relative z-10 flex items-start justify-center py-10 px-6">
        <div className="w-full" style={{ maxWidth: "720px" }}>

          {/* YEAR SELECTION */}
          {step === "year" && (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-black text-slate-800 mb-2">Study Notes</h1>
                <p className="text-slate-500">Select your year to browse subjects and notes</p>
              </div>

              {/* Year Cards */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {YEARS.map((y) => (
                  <button key={y.year}
                    onClick={() => { setSelectedYear(y); setStep("sem"); }}
                    className="group text-left rounded-2xl p-6 transition-all hover:-translate-y-1"
                    style={{ background: "white", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = y.shadow)}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)")}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                      style={{ background: y.gradient, boxShadow: y.shadow }}>
                      <span className="text-white font-black text-xl">{y.year}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">{y.label}</h3>
                    <div className="flex gap-2">
                      {y.semesters.map(s => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-lg font-medium"
                          style={{ background: "#f1f5f9", color: "#64748b" }}>
                          Sem {s}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              {/* Placement Section */}
              <div className="rounded-2xl p-6 mb-6" style={{ background: "white", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#fefce8" }}>
                    <Trophy size={20} style={{ color: "#ca8a04" }} />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800">Placement Preparation</h2>
                    <p className="text-slate-400 text-xs">Top resources to crack your dream company</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {PLACEMENT_LINKS.map((link) => (
                    <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
                      style={{ background: link.bg, border: `1.5px solid ${link.border}` }}>
                      <span className="text-xl flex-shrink-0">{link.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: link.text }}>{link.name}</p>
                        <p className="text-xs opacity-60 truncate" style={{ color: link.text }}>{link.desc}</p>
                      </div>
                      <ExternalLink size={13} className="ml-auto flex-shrink-0 opacity-40" style={{ color: link.text }} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Daily Knowledge Update */}
              <div className="rounded-2xl p-5 flex items-start gap-4"
                style={{ background: "linear-gradient(135deg,#1d4ed8,#4f46e5)", boxShadow: "0 8px 25px rgba(29,78,216,0.3)" }}>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Zap size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1">Today's Knowledge Boost</p>
                  <p className="text-white text-sm leading-relaxed">{fact}</p>
                  <a href="https://www.geeksforgeeks.org/" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-blue-200 text-xs hover:text-white transition">
                    Explore more on GFG <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </>
          )}

          {/* SEMESTER SELECTION */}
          {step === "sem" && selectedYear && (
            <>
              <div className="flex items-center gap-3 mb-8">
                <button onClick={() => setStep("year")}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition hover:bg-white"
                  style={{ background: "white", border: "1.5px solid #e2e8f0" }}>
                  <ArrowLeft size={16} className="text-slate-500" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">{selectedYear.label}</h1>
                  <p className="text-slate-400 text-sm">Choose your semester</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                {selectedYear.semesters.map((sem: number) => (
                  <button key={sem} onClick={() => pickSemester(sem)}
                    className="group rounded-2xl p-10 text-center transition-all hover:-translate-y-1"
                    style={{ background: "white", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = selectedYear.shadow)}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)")}>
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                      style={{ background: selectedYear.gradient, boxShadow: selectedYear.shadow }}>
                      <span className="text-white font-black text-4xl">{sem}</span>
                    </div>
                    <p className="font-bold text-slate-800 text-xl">Semester {sem}</p>
                    <p className="text-slate-400 text-sm mt-1">{selectedYear.label}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* COURSE SELECTION */}
          {step === "course" && (
            <>
              <div className="flex items-center gap-3 mb-8">
                <button onClick={() => setStep("sem")}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition"
                  style={{ background: "white", border: "1.5px solid #e2e8f0" }}>
                  <ArrowLeft size={16} className="text-slate-500" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Semester {selectedSem} Subjects</h1>
                  <p className="text-slate-400 text-sm">Select a subject to view notes</p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-16 rounded-2xl" style={{ background: "white", border: "1.5px solid #e2e8f0" }}>
                  <BookOpen size={36} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold">No subjects added yet</p>
                  <p className="text-slate-400 text-sm mt-1">Faculty will add subjects soon!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {courses.map((course: any) => (
                    <button key={course.id} onClick={() => pickCourse(course)}
                      className="w-full text-left rounded-2xl p-5 flex items-center justify-between group transition-all hover:-translate-y-0.5"
                      style={{ background: "white", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(29,78,216,0.12)")}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)")}>
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "#eff6ff" }}>
                          <BookOpen size={20} style={{ color: "#1d4ed8" }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-slate-800">{course.name}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                              style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
                              {course.code}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm">
                            👨‍🏫 {course.facultyName}
                            <span className="mx-1 text-slate-200">·</span>
                            <span className="text-blue-400 text-xs">{course.facultyEmail}</span>
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-400 transition flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* UNITS VIEW */}
          {step === "units" && selectedCourse && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep("course")}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "white", border: "1.5px solid #e2e8f0" }}>
                  <ArrowLeft size={16} className="text-slate-500" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">{selectedCourse.name}</h1>
                  <p className="text-slate-400 text-sm">{selectedCourse.code} · Sem {selectedSem} · 👨‍🏫 {selectedCourse.facultyName}</p>
                </div>
              </div>

              <Link href={`/question-papers?courseId=${selectedCourse.id}&courseName=${encodeURIComponent(selectedCourse.name)}`}
                className="flex items-center justify-between rounded-2xl px-5 py-4 mb-6 transition hover:shadow-md"
                style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#dcfce7" }}>
                    <FileText size={18} style={{ color: "#16a34a" }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#15803d" }}>Previous Year Question Papers</p>
                    <p className="text-xs" style={{ color: "#86efac" }}>CIE 1 · CIE 2 · CIE 3 · End Semester</p>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: "#86efac" }} />
              </Link>

              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Study Modules</p>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                </div>
              ) : units.length === 0 ? (
                <div className="text-center py-12 rounded-2xl" style={{ background: "white", border: "1.5px solid #e2e8f0" }}>
                  <FileText size={32} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold">No notes uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {units.map((unit: any) => (
                    <div key={unit.id} className="rounded-2xl overflow-hidden"
                      style={{ background: "white", border: "1.5px solid #e2e8f0" }}>
                      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100"
                        style={{ background: "linear-gradient(to right, #f8fafc, white)" }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#1d4ed8,#4f46e5)" }}>
                          <span className="text-white font-bold text-sm">{unit.unitNumber}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">Module {unit.unitNumber}: {unit.title}</h3>
                          <p className="text-slate-400 text-xs">{(unit.files || []).length} file(s)</p>
                        </div>
                      </div>
                      {(unit.files || []).length === 0 ? (
                        <div className="px-5 py-4 text-slate-400 text-sm">No files yet.</div>
                      ) : (
                        <div className="divide-y divide-slate-50">
                          {(unit.files || []).map((file: any) => (
                            <div key={file.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#fff1f2" }}>
                                  <FileText size={14} style={{ color: "#f43f5e" }} />
                                </div>
                                <div>
                                  <p className="text-slate-700 text-sm font-medium">{file.name}</p>
                                  <p className="text-slate-400 text-xs">By: {file.uploaderEmail}</p>
                                </div>
                              </div>
                              <a href={file.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-90"
                                style={{ background: "linear-gradient(135deg,#1d4ed8,#4f46e5)" }}>
                                <Download size={12} /> View
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}