import { db } from "./firebase";
import {
  ref, set, push, get, remove, update, query,
  orderByChild, equalTo, onValue, off
} from "firebase/database";

// ===== USER FUNCTIONS =====

export const saveUser = async (uid: string, userData: any) => {
  await set(ref(db, `users/${uid}`), userData);
};

export const getUser = async (uid: string) => {
  const snap = await get(ref(db, `users/${uid}`));
  return snap.exists() ? snap.val() : null;
};

export const getUsersByRole = async (role: string) => {
  const snap = await get(ref(db, "users"));
  if (!snap.exists()) return [];
  const users = snap.val();
  return Object.values(users).filter((u: any) => u.role === role && u.approved === true);
};

// ===== COURSE FUNCTIONS =====

export const addCourse = async (courseData: any) => {
  const newRef = push(ref(db, "courses"));
  await set(newRef, { ...courseData, id: newRef.key });
  return newRef.key;
};

export const getCoursesBySemester = async (semester: number) => {
  const snap = await get(ref(db, "courses"));
  if (!snap.exists()) return [];
  const courses = snap.val();
  return Object.values(courses).filter((c: any) => c.semester === semester);
};

export const getCoursesByFaculty = async (email: string) => {
  const snap = await get(ref(db, "courses"));
  if (!snap.exists()) return [];
  const courses = snap.val();
  return Object.values(courses).filter((c: any) => c.facultyEmail === email);
};

export const deleteCourse = async (courseId: string) => {
  await remove(ref(db, `courses/${courseId}`));
};

// ===== UNIT FUNCTIONS =====

export const addUnit = async (unitData: any) => {
  const newRef = push(ref(db, "units"));
  await set(newRef, { ...unitData, id: newRef.key, files: [] });
  return newRef.key;
};

export const getUnitsByCourse = async (courseId: string) => {
  const snap = await get(ref(db, "units"));
  if (!snap.exists()) return [];
  const units = snap.val();
  return Object.values(units)
    .filter((u: any) => u.courseId === courseId)
    .sort((a: any, b: any) => a.unitNumber - b.unitNumber);
};

export const addFileToUnit = async (unitId: string, fileData: any) => {
  const snap = await get(ref(db, `units/${unitId}/files`));
  const existing = snap.exists() ? snap.val() : [];
  const updated = Array.isArray(existing) ? [...existing, fileData] : [fileData];
  await set(ref(db, `units/${unitId}/files`), updated);
};

export const removeFileFromUnit = async (unitId: string, fileId: string) => {
  const snap = await get(ref(db, `units/${unitId}/files`));
  if (!snap.exists()) return;
  const files = snap.val();
  const updated = (Array.isArray(files) ? files : Object.values(files))
    .filter((f: any) => f.id !== fileId);
  await set(ref(db, `units/${unitId}/files`), updated);
};

// ===== QUESTION PAPER FUNCTIONS =====

export const addQuestionPaper = async (paperData: any) => {
  const newRef = push(ref(db, "question_papers"));
  await set(newRef, { ...paperData, id: newRef.key });
  return newRef.key;
};

export const getQuestionPapers = async (courseId: string, type: string) => {
  const snap = await get(ref(db, "question_papers"));
  if (!snap.exists()) return [];
  const papers = snap.val();
  return Object.values(papers)
    .filter((p: any) => p.courseId === courseId && p.type === type)
    .sort((a: any, b: any) => b.year - a.year);
};

// ===== FACULTY REQUEST FUNCTIONS =====

export const saveFacultyRequest = async (uid: string, requestData: any) => {
  await set(ref(db, `faculty_requests/${uid}`), requestData);
};

export const getPendingFacultyRequests = async () => {
  const snap = await get(ref(db, "faculty_requests"));
  if (!snap.exists()) return [];
  const requests = snap.val();
  return Object.values(requests).filter((r: any) => r.status === "pending");
};

export const updateFacultyRequest = async (uid: string, status: string) => {
  await update(ref(db, `faculty_requests/${uid}`), { status });
};

export const approveFaculty = async (uid: string) => {
  await update(ref(db, `users/${uid}`), { approved: true, role: "faculty" });
  await update(ref(db, `faculty_requests/${uid}`), { status: "approved" });
};

export const rejectFaculty = async (uid: string) => {
  await update(ref(db, `faculty_requests/${uid}`), { status: "rejected" });
};