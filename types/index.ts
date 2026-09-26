export type UserRole = "student" | "faculty" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  approved: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  semester: number;
  facultyEmail: string;
  facultyName: string;
  createdAt: string;
}

export interface Unit {
  id: string;
  courseId: string;
  unitNumber: number;
  title: string;
  files: UploadedFile[];
  createdAt: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  uploadedBy: string;
  uploaderEmail: string;
  uploadedAt: string;
  type: string;
}

export interface QuestionPaper {
  id: string;
  courseId: string;
  year: string;
  type: "CIE1" | "CIE2" | "CIE3" | "EndSem";
  fileUrl: string;
  fileName: string;
  uploadedBy: string;
  uploaderEmail: string;
  uploadedAt: string;
}