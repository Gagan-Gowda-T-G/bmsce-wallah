"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup, GoogleAuthProvider,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { db as database } from "@/lib/firebase";
import { ref, set, get } from "firebase/database";
import Image from "next/image";
import { BookOpen, FileText, Mail, Shield } from "lucide-react";
import toast from "react-hot-toast";

export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const snap = await get(ref(database, `users/${u.uid}`));
        if (snap.exists()) {
          const data = snap.val();
          if (data.role === "admin") { router.push("/"); return; }
          if (data.role === "faculty" && data.approved) {
            router.push("/faculty/dashboard"); return;
          }
          if (data.role === "faculty" && !data.approved) {
            router.push("/pending"); return;
          }
        }
        router.push("/");
      } else {
        setChecking(false);
      }
    });
    return () => unsub();
  }, [router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const snap = await get(ref(database, `users/${user.uid}`));
      if (!snap.exists()) {
        await set(ref(database, `users/${user.uid}`), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: "student",
          approved: true,
          createdAt: Date.now(),
        });
      }
      toast.success("Welcome to BMSCE WALLAH!");
      router.push("/");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        toast.error("Login failed. Try again.");
      }
    }
    setLoading(false);
  };

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eef2ff] flex">
      <div className="logo-watermark" />

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* BG logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image src="/logo.png" alt="" width={400} height={400} className="opacity-10" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <Image src="/logo.png" alt="BMSCE" width={48} height={48} className="rounded-xl" />
            <div>
              <p className="text-white font-bold text-xl">BMSCE WALLAH</p>
              <p className="text-blue-200 text-sm">Academic Portal</p>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Your Academic<br />Hub at BMSCE
          </h1>
          <p className="text-blue-200 text-lg">
            Notes, question papers and faculty — all in one place.
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-4">
          {[
            { icon: BookOpen, text: "Semester-wise notes from faculty" },
            { icon: FileText, text: "CIE & End Semester question papers" },
            { icon: Mail, text: "Direct contact with faculty via Gmail" },
            { icon: Shield, text: "Secure faculty upload portal" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-white" />
              </div>
              <p className="text-blue-100 text-sm">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <Image src="/logo.png" alt="BMSCE" width={44} height={44} className="rounded-xl" />
            <div>
              <p className="font-bold text-slate-800 text-lg">BMSCE WALLAH</p>
              <p className="text-slate-400 text-sm">Academic Portal</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
              <p className="text-slate-400 text-sm">
                Sign in to access your notes and resources
              </p>
            </div>

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 font-semibold py-3.5 px-6 rounded-xl transition-all disabled:opacity-50 mb-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {loading ? "Signing in..." : "Continue with Google"}
            </button>

            <div className="text-center">
              <p className="text-slate-400 text-xs">
                Are you faculty?{" "}
                <a href="/faculty-login" className="text-orange-500 hover:underline font-medium">
                  Faculty login here
                </a>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-center text-slate-300 text-xs">
                B.M.S. College of Engineering, Bangalore — 560019
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}