"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUser } from "@/lib/database";

export default function PendingPage() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/auth"); return; }
      // Check every 10 seconds if approved
      const interval = setInterval(async () => {
        const profile = await getUser(user.uid);
        if (profile?.approved && profile?.role === "faculty") {
          clearInterval(interval);
          router.push("/faculty/dashboard");
        }
      }, 10000);
      return () => clearInterval(interval);
    });
    return () => unsub();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
        <div className="text-6xl mb-6 animate-bounce">⏳</div>
        <h1 className="text-2xl font-bold text-white mb-3">Awaiting Approval</h1>
        <p className="text-blue-200 text-sm mb-6">
          Your faculty request has been sent to the admin.
          You will get an email once approved. This page checks automatically every 10 seconds.
        </p>
        <div className="flex gap-1 justify-center mb-6">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
        <button
          onClick={() => signOut(auth).then(() => router.push("/auth"))}
          className="text-blue-400 hover:text-white text-sm transition"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}