"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { db as database } from "@/lib/firebase";
import { ref, set, get } from "firebase/database";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Mail, ShieldCheck, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function FacultyLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const snap = await get(ref(database, `users/${u.uid}`));
        if (snap.exists()) {
          const data = snap.val();
          if (data.role === "faculty" && data.approved) {
            router.push("/faculty/dashboard");
            return;
          }
          if (data.role === "faculty" && !data.approved) {
            router.push("/pending");
            return;
          }
        }
      }
      setChecking(false);
    });
    return () => unsub();
  }, [router]);

  const handleFacultyLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if already exists
      const snap = await get(ref(database, `users/${user.uid}`));
      
      if (snap.exists()) {
        const data = snap.val();
        if (data.role === "faculty" && data.approved) {
          toast.success("Welcome back!");
          router.push("/faculty/dashboard");
          return;
        }
        if (data.role === "faculty" && !data.approved) {
          toast("Waiting for admin approval...", { icon: "⏳" });
          router.push("/pending");
          return;
        }
        // Student trying to use faculty login
        if (data.role === "student") {
          await set(ref(database, `users/${user.uid}`), {
            ...data,
            role: "faculty",
            approved: false,
            facultyRequestedAt: Date.now(),
          });
        }
      } else {
        // New faculty registration
        await set(ref(database, `users/${user.uid}`), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: "faculty",
          approved: false,
          createdAt: Date.now(),
        });
      }

      // Save faculty request
      await set(ref(database, `faculty_requests/${user.uid}`), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        requestedAt: Date.now(),
        status: "pending",
      });

      // Notify admin via email
      try {
        await fetch("/api/notify-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            facultyName: user.displayName,
            facultyEmail: user.email,
            facultyUid: user.uid,
          }),
        });
      } catch (e) {
        console.log("Email notify failed:", e);
      }

      toast.success("Request sent! Waiting for admin approval.");
      router.push("/pending");
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
    <div className="min-h-screen bg-[#eef2ff] flex items-center justify-center p-4">
      <div className="logo-watermark" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm mb-6 transition">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Faculty Portal</h1>
            <p className="text-orange-100 text-sm mt-1">
              B.M.S. College of Engineering
            </p>
          </div>

          <div className="p-8">
            {/* Info boxes */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <Mail size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-800 text-sm font-semibold">Admin Notification</p>
                  <p className="text-blue-500 text-xs mt-0.5">
                    Admin receives your Gmail when you login. Approval needed before uploading.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-xl p-4">
                <Clock size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-orange-800 text-sm font-semibold">Pending Approval</p>
                  <p className="text-orange-500 text-xs mt-0.5">
                    After login, wait for admin to approve your account before uploading files.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
                <ShieldCheck size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-800 text-sm font-semibold">Faculty Only</p>
                  <p className="text-green-500 text-xs mt-0.5">
                    Only approved BMSCE faculty can upload notes and question papers.
                  </p>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleFacultyLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-700 font-semibold py-3.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-orange-500 rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {loading ? "Signing in..." : "Continue with Google as Faculty"}
            </button>

            <p className="text-center text-slate-400 text-xs mt-4">
              Are you a student?{" "}
              <Link href="/auth" className="text-blue-500 hover:underline">
                Student login here
              </Link>
            </p>
          </div>
        </div>

        {/* Logo */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center gap-2">
            <Image src="/logo.png" alt="BMSCE" width={28} height={28} className="rounded-md" />
            <span className="text-slate-400 text-sm font-medium">BMSCE WALLAH</span>
          </div>
        </div>
      </div>
    </div>
  );
}