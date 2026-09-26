"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { db as database } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Mail, BookOpen, FileText,
  GraduationCap, Home, Users, LogOut
} from "lucide-react";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";

export default function ContactFacultyPage() {
  const router = useRouter();
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/auth"); return; }
      setUser(u);
      await loadFaculty();
    });
    return () => unsub();
  }, [router]);

  const loadFaculty = async () => {
    try {
      const snap = await get(ref(database, "users"));
      if (snap.exists()) {
        const all = snap.val();
        const approved = Object.entries(all)
          .filter(([, v]: any) => v.role === "faculty" && v.approved === true)
          .map(([id, v]: any) => ({ id, ...v }));
        setFacultyList(approved);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/auth");
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
          <Link href="/question-papers" className="nav-item"><FileText size={16} /> Question Papers</Link>
          <Link href="/contact-faculty" className="nav-item active"><Mail size={16} /> Contact Faculty</Link>
          <Link href="/faculty-login" className="nav-item"><GraduationCap size={16} /> Faculty Portal</Link>
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button onClick={handleSignOut} className="nav-item text-red-500 hover:bg-red-50">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content relative z-10 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link href="/" className="text-slate-400 hover:text-slate-600 transition">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Contact Faculty</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Click any email to open Gmail and message directly
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            </div>
          ) : facultyList.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={28} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-semibold">No approved faculty yet</p>
              <p className="text-slate-400 text-sm mt-1">
                Faculty members will appear here after admin approval
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {facultyList.map((faculty) => (
                <div key={faculty.id} className="card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-lg">
                        {faculty.name?.[0] || faculty.email?.[0]?.toUpperCase() || "F"}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {faculty.name || "Faculty"}
                      </p>
                      <p className="text-slate-400 text-sm">{faculty.email}</p>
                      {faculty.department && (
                        <p className="text-blue-500 text-xs mt-0.5">{faculty.department}</p>
                      )}
                    </div>
                  </div>
                  
                   <a
                      href={`mailto:${faculty.email}`}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                     >
                      <Mail size={14} /> Send Email
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