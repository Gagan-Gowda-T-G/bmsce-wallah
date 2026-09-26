"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { db as database } from "@/lib/firebase";
import { ref, set, get, push, remove, update } from "firebase/database";
import Image from "next/image";
import Link from "next/link";
import {
  Home, BookOpen, FileText, Mail, GraduationCap,
  LogOut, Plus, Trash2, Upload, ChevronRight,
  FolderOpen, ArrowLeft, X
} from "lucide-react";
import toast from "react-hot-toast";

export default function FacultyDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState<"sem" | "course" | "units">("sem");
  const [selectedSem, setSelectedSem] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [showAddQP, setShowAddQP] = useState(false);
  const [targetUnitId, setTargetUnitId] = useState<string | null>(null);

  // Form states
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [unitTitle, setUnitTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [qpType, setQpType] = useState("cie1");
  const [qpYear, setQpYear] = useState("");
  const [qpFile, setQpFile] = useState<File | null>(null);

  const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/auth"); return; }
      const snap = await get(ref(database, `users/${u.uid}`));
      if (!snap.exists()) { router.push("/auth"); return; }
      const data = snap.val();
      if (data.role !== "faculty" || !data.approved) {
        toast.error("Faculty access required!");
        router.push("/pending");
        return;
      }
      setUser({ ...u, ...data });
    });
    return () => unsub();
  }, [router]);

  const loadCourses = async (sem: number) => {
    setLoading(true);
    const snap = await get(ref(database, "courses"));
    if (snap.exists()) {
      const all = snap.val();
      const list = Object.entries(all)
        .filter(([, v]: any) => v.semester === sem)
        .map(([id, v]: any) => ({ id, ...v }));
      setCourses(list);
    } else {
      setCourses([]);
    }
    setLoading(false);
  };

  const loadUnits = async (courseId: string) => {
    setLoading(true);
    const snap = await get(ref(database, `units/${courseId}`));
    if (snap.exists()) {
      const all = snap.val();
      const list = Object.entries(all)
        .map(([id, v]: any) => ({ id, ...v }))
        .sort((a, b) => a.unitNumber - b.unitNumber);
      setUnits(list);
    } else {
      setUnits([]);
    }
    setLoading(false);
  };

  const addCourse = async () => {
    if (!courseName.trim() || !courseCode.trim()) {
      toast.error("Fill all fields!");
      return;
    }
    const newRef = push(ref(database, "courses"));
    await set(newRef, {
      name: courseName.trim(),
      code: courseCode.trim().toUpperCase(),
      semester: selectedSem,
      facultyName: user?.displayName || user?.name,
      facultyEmail: user?.email,
      facultyUid: user?.uid,
      createdAt: Date.now(),
    });
    toast.success("Subject added!");
    setCourseName(""); setCourseCode("");
    setShowAddCourse(false);
    await loadCourses(selectedSem!);
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm("Delete this subject and all its notes?")) return;
    await remove(ref(database, `courses/${courseId}`));
    await remove(ref(database, `units/${courseId}`));
    toast.success("Subject deleted");
    await loadCourses(selectedSem!);
  };

  const addUnit = async () => {
    if (!unitNumber || !unitTitle.trim()) {
      toast.error("Fill all fields!");
      return;
    }
    const newRef = push(ref(database, `units/${selectedCourse.id}`));
    await set(newRef, {
      unitNumber: parseInt(unitNumber),
      title: unitTitle.trim(),
      courseId: selectedCourse.id,
      files: {},
      createdAt: Date.now(),
    });
    toast.success("Module added!");
    setUnitNumber(""); setUnitTitle("");
    setShowAddUnit(false);
    await loadUnits(selectedCourse.id);
  };

  const deleteUnit = async (unitId: string) => {
    if (!confirm("Delete this module and all its files?")) return;
    await remove(ref(database, `units/${selectedCourse.id}/${unitId}`));
    toast.success("Module deleted");
    await loadUnits(selectedCourse.id);
  };

  const uploadFile = async (file: File, unitId: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "bmsce_wallah");

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (!data.secure_url) throw new Error("Upload failed");

      const fileRef = push(ref(database, `units/${selectedCourse.id}/${unitId}/files`));
      await set(fileRef, {
        name: file.name,
        url: data.secure_url,
        uploaderEmail: user?.email,
        uploaderName: user?.displayName || user?.name,
        uploadedAt: Date.now(),
      });

      toast.success("File uploaded!");
      await loadUnits(selectedCourse.id);
    } catch (e) {
      toast.error("Upload failed. Check Cloudinary settings.");
    }
    setUploading(false);
    setShowUploadFile(false);
    setTargetUnitId(null);
  };

  const deleteFile = async (unitId: string, fileId: string) => {
    if (!confirm("Delete this file?")) return;
    await remove(ref(database, `units/${selectedCourse.id}/${unitId}/files/${fileId}`));
    toast.success("File deleted");
    await loadUnits(selectedCourse.id);
  };

  const uploadQP = async () => {
    if (!qpFile || !qpYear.trim()) {
      toast.error("Select file and enter year!");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", qpFile);
      formData.append("upload_preset", "bmsce_wallah");

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (!data.secure_url) throw new Error("Upload failed");

      const qpRef = push(ref(database, `question_papers/${selectedCourse.id}/${qpType}`));
      await set(qpRef, {
        name: qpFile.name,
        url: data.secure_url,
        year: qpYear.trim(),
        type: qpType,
        uploaderEmail: user?.email,
        uploaderName: user?.displayName || user?.name,
        uploadedAt: Date.now(),
      });

      toast.success("Question paper uploaded!");
      setQpFile(null); setQpYear(""); setQpType("cie1");
      setShowAddQP(false);
    } catch {
      toast.error("Upload failed");
    }
    setUploading(false);
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
              <p className="text-xs text-orange-500 font-semibold">Faculty Portal</p>
            </div>
          </div>
        </div>

        {user && (
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-bold">
                  {user?.displayName?.[0] || user?.name?.[0] || "F"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">
                  {user?.displayName || user?.name}
                </p>
                <p className="text-xs text-green-500 font-medium">✓ Approved Faculty</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1 mt-2">
          <Link href="/" className="nav-item"><Home size={16} /> Home</Link>
          <Link href="/dashboard" className="nav-item"><BookOpen size={16} /> Study Notes</Link>
          <Link href="/question-papers" className="nav-item"><FileText size={16} /> Question Papers</Link>
          <Link href="/contact-faculty" className="nav-item"><Mail size={16} /> Contact Faculty</Link>
          <Link href="/faculty/dashboard" className="nav-item active">
            <GraduationCap size={16} /> Faculty Portal
          </Link>
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

        {/* STEP 1 — SEMESTER */}
        {step === "sem" && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-800">Faculty Upload Portal</h1>
              <p className="text-slate-400 text-sm mt-1">
                Select a semester to manage subjects, notes and question papers
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SEMESTERS.map((sem) => (
                <button key={sem}
                  onClick={() => { setSelectedSem(sem); loadCourses(sem); setStep("course"); }}
                  className="card text-center cursor-pointer group hover:border-orange-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">
                    <span className="text-white font-black text-2xl">{sem}</span>
                  </div>
                  <p className="font-semibold text-slate-700">Semester {sem}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — COURSES */}
        {step === "course" && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep("sem")}
                className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition">
                <ArrowLeft size={16} className="text-slate-500" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-800">
                  Semester {selectedSem} Subjects
                </h1>
                <p className="text-slate-400 text-sm">Manage subjects and upload materials</p>
              </div>
              <button onClick={() => setShowAddCourse(true)}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg shadow-orange-200">
                <Plus size={16} /> Add Subject
              </button>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : courses.length === 0 ? (
              <div className="card text-center py-16">
                <FolderOpen size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold">No subjects yet</p>
                <p className="text-slate-400 text-sm mt-1 mb-4">Add your first subject for Semester {selectedSem}</p>
                <button onClick={() => setShowAddCourse(true)}
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-semibold">
                  <Plus size={14} /> Add Subject
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div key={course.id} className="card flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center">
                        <BookOpen size={20} className="text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-800">{course.name}</h3>
                          <span className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full">
                            {course.code}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">
                          Added by: {course.facultyEmail}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          loadUnits(course.id);
                          setStep("units");
                        }}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                        <FolderOpen size={14} /> Manage
                      </button>
                      {course.facultyUid === user?.uid && (
                        <button onClick={() => deleteCourse(course.id)}
                          className="w-9 h-9 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — UNITS */}
        {step === "units" && selectedCourse && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep("course")}
                className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition">
                <ArrowLeft size={16} className="text-slate-500" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-800">{selectedCourse.name}</h1>
                <p className="text-slate-400 text-sm">{selectedCourse.code} · Semester {selectedSem}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddQP(true)}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
                  <Plus size={14} /> Add QP
                </button>
                <button onClick={() => setShowAddUnit(true)}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
                  <Plus size={14} /> Add Module
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : units.length === 0 ? (
              <div className="card text-center py-12">
                <FileText size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold">No modules yet</p>
                <p className="text-slate-400 text-sm mt-1 mb-4">Add your first module to start uploading notes</p>
                <button onClick={() => setShowAddUnit(true)}
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-semibold">
                  <Plus size={14} /> Add Module
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {units.map((unit) => (
                  <div key={unit.id} className="card p-0 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{unit.unitNumber}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">
                            Module {unit.unitNumber}: {unit.title}
                          </h3>
                          <p className="text-slate-400 text-xs">
                            {Object.keys(unit.files || {}).length} file(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setTargetUnitId(unit.id); setShowUploadFile(true); }}
                          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                          <Upload size={12} /> Upload File
                        </button>
                        <button onClick={() => deleteUnit(unit.id)}
                          className="w-7 h-7 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Files */}
                    {Object.keys(unit.files || {}).length === 0 ? (
                      <div className="px-5 py-4 text-slate-400 text-sm">
                        No files yet — click Upload File to add notes.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {Object.entries(unit.files || {}).map(([fileId, file]: any) => (
                          <div key={fileId}
                            className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                                <FileText size={14} className="text-red-500" />
                              </div>
                              <div>
                                <p className="text-slate-700 text-sm font-medium">{file.name}</p>
                                <p className="text-slate-400 text-xs">{file.uploaderEmail}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <a href={file.url} target="_blank" rel="noopener noreferrer"
                                className="text-blue-500 hover:underline text-xs font-medium">
                                View
                              </a>
                              <button onClick={() => deleteFile(unit.id, fileId)}
                                className="w-7 h-7 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL — Add Course */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Add Subject</h2>
              <button onClick={() => setShowAddCourse(false)}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <input value={courseName} onChange={(e) => setCourseName(e.target.value)}
                placeholder="Subject Name (e.g. Data Structures)"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              <input value={courseCode} onChange={(e) => setCourseCode(e.target.value)}
                placeholder="Subject Code (e.g. CS301)"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddCourse(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold transition">
                Cancel
              </button>
              <button onClick={addCourse}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                Add Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL — Add Unit */}
      {showAddUnit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Add Module</h2>
              <button onClick={() => setShowAddUnit(false)}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <input type="number" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="Module Number (e.g. 1)"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              <input value={unitTitle} onChange={(e) => setUnitTitle(e.target.value)}
                placeholder="Module Title (e.g. Arrays and Linked Lists)"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddUnit(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold transition">
                Cancel
              </button>
              <button onClick={addUnit}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                Add Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL — Upload File */}
      {showUploadFile && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Upload Notes File</h2>
              <button onClick={() => { setShowUploadFile(false); setTargetUnitId(null); }}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition">
                <X size={16} />
              </button>
            </div>
            <label className="block w-full border-2 border-dashed border-slate-200 hover:border-blue-300 rounded-xl p-8 text-center cursor-pointer transition group">
              <Upload size={28} className="text-slate-300 group-hover:text-blue-400 mx-auto mb-2 transition" />
              <p className="text-slate-500 text-sm font-medium">Click to select PDF or file</p>
              <p className="text-slate-300 text-xs mt-1">PDF, PPT, DOC supported</p>
              <input type="file" className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && targetUnitId) uploadFile(file, targetUnitId);
                }} />
            </label>
            {uploading && (
              <div className="flex items-center justify-center gap-2 mt-4 text-blue-500 text-sm">
                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                Uploading to Cloudinary...
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL — Upload Question Paper */}
      {showAddQP && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Upload Question Paper</h2>
              <button onClick={() => setShowAddQP(false)}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <select value={qpType} onChange={(e) => setQpType(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400">
                <option value="cie1">CIE 1</option>
                <option value="cie2">CIE 2</option>
                <option value="cie3">CIE 3</option>
                <option value="endsem">End Semester</option>
              </select>
              <input value={qpYear} onChange={(e) => setQpYear(e.target.value)}
                placeholder="Year (e.g. 2023-24)"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400" />
              <label className="block w-full border-2 border-dashed border-slate-200 hover:border-green-300 rounded-xl p-5 text-center cursor-pointer transition">
                <Upload size={22} className="text-slate-300 mx-auto mb-1" />
                <p className="text-slate-500 text-sm">
                  {qpFile ? qpFile.name : "Click to select question paper"}
                </p>
                <input type="file" className="hidden"
                  onChange={(e) => setQpFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddQP(false)}
                className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl text-sm font-semibold">
                Cancel
              </button>
              <button onClick={uploadQP} disabled={uploading}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50">
                {uploading ? "Uploading..." : "Upload Paper"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}