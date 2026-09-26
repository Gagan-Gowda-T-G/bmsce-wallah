"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getUser } from "@/lib/database";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen, FileText, Mail, GraduationCap,
  Users, LogOut, Home, ChevronRight, Bell
} from "lucide-react";
import toast from "react-hot-toast";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) { router.push("/auth"); return; }
      setUser(firebaseUser);
      const data = await getUser(firebaseUser.uid);
      setProfile(data);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success("Signed out!");
    router.push("/auth");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading BMSCE WALLAH...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* LOGO WATERMARK */}
      <div className="logo-watermark" />

      {/* SIDEBAR */}
      <aside className="sidebar flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="BMSCE" width={40} height={40} className="rounded-lg" />
            <div>
              <p className="font-bold text-slate-800 text-sm leading-tight">BMSCE WALLAH</p>
              <p className="text-xs text-slate-400">Academic Portal</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img src={user.photoURL} className="w-9 h-9 rounded-full border border-slate-200" alt="" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">
                  {user?.displayName?.[0] || "U"}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">
                {user?.displayName || "Student"}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          <Link href="/" className="nav-item active">
            <Home size={16} /> Home
          </Link>
          <Link href="/dashboard" className="nav-item">
            <BookOpen size={16} /> Study Notes
          </Link>
          <Link href="/question-papers" className="nav-item">
            <FileText size={16} /> Question Papers
          </Link>
          <Link href="/contact-faculty" className="nav-item">
            <Mail size={16} /> Contact Faculty
          </Link>
          <Link href="/faculty-login" className="nav-item">
            <GraduationCap size={16} /> Faculty Portal
          </Link>
          {profile?.role === "admin" && (
            <Link href="/admin" className="nav-item">
              <Users size={16} /> Admin Panel
            </Link>
          )}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-slate-100">
          <button onClick={handleSignOut} className="nav-item w-full text-red-500 hover:bg-red-50 hover:text-red-600">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content relative z-10 p-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute right-6 top-4 opacity-10">
            <Image src="/logo.png" alt="" width={120} height={120} />
          </div>
          <p className="text-blue-200 text-sm font-medium mb-1">Welcome back 👋</p>
          <h1 className="text-3xl font-bold mb-1">
            {user?.displayName || "Student"}
          </h1>
          <p className="text-blue-200 text-sm">B.M.S. College of Engineering — Academic Portal</p>
        </div>

        {/* Quick Access */}
        <h2 className="text-base font-semibold text-slate-500 mb-4 uppercase tracking-wide">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">

          <Link href="/dashboard">
            <div className="card cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition">
                  <BookOpen size={20} className="text-blue-600" />
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-400 transition" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Study Notes</h3>
              <p className="text-slate-400 text-sm">Semester-wise notes by faculty</p>
            </div>
          </Link>

          <Link href="/question-papers">
            <div className="card cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition">
                  <FileText size={20} className="text-green-600" />
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-green-400 transition" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Question Papers</h3>
              <p className="text-slate-400 text-sm">CIE & End Semester papers</p>
            </div>
          </Link>

          <Link href="/contact-faculty">
            <div className="card cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition">
                  <Mail size={20} className="text-purple-600" />
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-purple-400 transition" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Contact Faculty</h3>
              <p className="text-slate-400 text-sm">Email faculty directly</p>
            </div>
          </Link>

          <Link href="/faculty-login">
            <div className="card cursor-pointer group border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition">
                  <GraduationCap size={20} className="text-orange-600" />
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-orange-400 transition" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Faculty Portal</h3>
              <p className="text-slate-400 text-sm">Upload notes and papers</p>
            </div>
          </Link>

          {profile?.role === "admin" && (
            <Link href="/admin">
              <div className="card cursor-pointer group border-red-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition">
                    <Users size={20} className="text-red-600" />
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-red-400 transition" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Admin Panel</h3>
                <p className="text-slate-400 text-sm">Manage faculty approvals</p>
              </div>
            </Link>
          )}
        </div>

        {/* Notice */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <Bell size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-700">How it works</p>
            <p className="text-xs text-blue-500 mt-0.5">
              Select a semester → choose your subject → view notes uploaded by your faculty. Faculty can upload files after admin approval.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}