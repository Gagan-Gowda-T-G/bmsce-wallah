"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { db as database } from "@/lib/firebase";
import { ref, get, update } from "firebase/database";
import Image from "next/image";
import Link from "next/link";
import {
  Home, BookOpen, FileText, Mail,
  GraduationCap, LogOut, Users, CheckCircle,
  XCircle, Clock, Shield
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [approved, setApproved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/auth"); return; }
      const snap = await get(ref(database, `users/${u.uid}`));
      if (!snap.exists() || snap.val().role !== "admin") {
        toast.error("Admin access only!");
        router.push("/");
        return;
      }
      setProfile(snap.val());
      await loadData();
    });
    return () => unsub();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const snap = await get(ref(database, "users"));
      if (snap.exists()) {
        const all = snap.val();
        const pending = Object.entries(all)
          .filter(([, v]: any) => v.role === "faculty" && !v.approved)
          .map(([id, v]: any) => ({ id, ...v }));
        const approvedList = Object.entries(all)
          .filter(([, v]: any) => v.role === "faculty" && v.approved)
          .map(([id, v]: any) => ({ id, ...v }));
        setRequests(pending);
        setApproved(approvedList);
      }
    } catch (e) {
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  const approve = async (uid: string, name: string) => {
    try {
      await update(ref(database, `users/${uid}`), { approved: true });
      await update(ref(database, `faculty_requests/${uid}`), { status: "approved" });
      toast.success(`${name} approved!`);
      await loadData();
    } catch {
      toast.error("Failed to approve");
    }
  };

  const reject = async (uid: string, name: string) => {
    try {
      await update(ref(database, `users/${uid}`), {
        approved: false,
        role: "student"
      });
      await update(ref(database, `faculty_requests/${uid}`), { status: "rejected" });
      toast.success(`${name} rejected`);
      await loadData();
    } catch {
      toast.error("Failed to reject");
    }
  };

  const revoke = async (uid: string, name: string) => {
    try {
      await update(ref(database, `users/${uid}`), {
        approved: false,
        role: "student"
      });
      toast.success(`${name}'s access revoked`);
      await loadData();
    } catch {
      toast.error("Failed to revoke");
    }
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
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 mt-2">
          <Link href="/" className="nav-item"><Home size={16} /> Home</Link>
          <Link href="/dashboard" className="nav-item"><BookOpen size={16} /> Study Notes</Link>
          <Link href="/question-papers" className="nav-item"><FileText size={16} /> Question Papers</Link>
          <Link href="/contact-faculty" className="nav-item"><Mail size={16} /> Contact Faculty</Link>
          <Link href="/faculty-login" className="nav-item"><GraduationCap size={16} /> Faculty Portal</Link>
          <Link href="/admin" className="nav-item active"><Users size={16} /> Admin Panel</Link>
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
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
              <p className="text-slate-400 text-sm">Manage faculty access and approvals</p>
            </div>
            <button onClick={loadData}
              className="ml-auto text-sm bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg text-slate-600 transition">
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock size={22} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{requests.length}</p>
                <p className="text-slate-400 text-sm">Pending Requests</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={22} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{approved.length}</p>
                <p className="text-slate-400 text-sm">Approved Faculty</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => setTab("pending")}
              className={`px-5 py-2 rounded-xl text-sm font-semibold border transition ${
                tab === "pending"
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}>
              ⏳ Pending ({requests.length})
            </button>
            <button onClick={() => setTab("approved")}
              className={`px-5 py-2 rounded-xl text-sm font-semibold border transition ${
                tab === "approved"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}>
              ✅ Approved ({approved.length})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            </div>
          ) : tab === "pending" ? (
            requests.length === 0 ? (
              <div className="card text-center py-16">
                <CheckCircle size={36} className="text-green-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold">No pending requests</p>
                <p className="text-slate-400 text-sm mt-1">All faculty requests have been handled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div key={req.id} className="card flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-700 font-bold text-lg">
                          {req.name?.[0] || req.email?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{req.name || "Unknown"}</p>
                        <p className="text-slate-400 text-sm">{req.email}</p>
                        <p className="text-slate-300 text-xs mt-0.5">
                          {req.createdAt ? new Date(req.createdAt).toLocaleString() : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => approve(req.id, req.name)}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button onClick={() => reject(req.id, req.name)}
                        className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-semibold transition">
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            approved.length === 0 ? (
              <div className="card text-center py-16">
                <Users size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold">No approved faculty yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {approved.map((fac) => (
                  <div key={fac.id} className="card flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-700 font-bold text-lg">
                          {fac.name?.[0] || fac.email?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-800">{fac.name || "Unknown"}</p>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            ✓ Approved
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">{fac.email}</p>
                      </div>
                    </div>
                    <button onClick={() => revoke(fac.id, fac.name)}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-semibold transition">
                      <XCircle size={14} /> Revoke
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}