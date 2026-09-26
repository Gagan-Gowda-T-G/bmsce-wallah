# 🎓 BMSCE WALLAH

> Official Academic Portal for B.M.S. College of Engineering, Bangalore (Est. 1946)

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-Realtime_DB-orange?style=flat&logo=firebase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-blue?style=flat&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat&logo=vercel)

---

## ✨ Features

- 🔐 **Google Login** — Students and Faculty sign in with Google
- 📚 **Study Notes** — Year → Semester → Subject → Download Notes
- 📝 **Question Papers** — CIE 1, CIE 2, CIE 3 & End Semester papers
- 👨‍🏫 **Faculty Portal** — Upload notes and papers after admin approval
- 📧 **Contact Faculty** — Direct Gmail contact with approved faculty
- 🤖 **Vaibhu AI** — 24/7 AI chatbot assistant for students
- 🛡️ **Admin Panel** — Approve or reject faculty access requests
- 💼 **Placement Prep** — Links to GFG, LeetCode, InterviewBit & IndiaBix

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Authentication | Firebase Auth (Google) |
| Database | Firebase Realtime Database |
| File Storage | Cloudinary |
| AI Chatbot | Vaibhu (Gemini AI) |
| Email Alerts | Nodemailer (Gmail) |
| Hosting | Vercel (Free) |

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/bmsce-wallah.git
cd bmsce-wallah
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in root:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_db_url
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
ADMIN_EMAIL=your_gmail
ADMIN_EMAIL_PASSWORD=your_app_password
GEMINI_API_KEY=your_gemini_key
```

### 4. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure
bmsce-wallah/
├── app/
│ ├── page.tsx # Home page
│ ├── auth/ # Login page
│ ├── dashboard/ # Study notes
│ ├── question-papers/ # QP page
│ ├── contact-faculty/ # Faculty contact
│ ├── faculty-login/ # Faculty login
│ ├── faculty/dashboard # Faculty upload portal
│ ├── admin/ # Admin panel
│ ├── pending/ # Pending approval page
│ └── api/ # API routes
├── components/
│ └── ChatBot.tsx # Vaibhu AI chatbot
├── lib/
│ ├── firebase.ts # Firebase config
│ └── database.ts # Database helpers
└── public/
└── logo.png # BMSCE logo

---

## 🔐 User Roles

| Role | Access |
|------|--------|
| Student | View notes, papers, contact faculty |
| Faculty | Upload notes & papers (after approval) |
| Admin | Approve/reject faculty, full access |

---

## 🌐 Live Demo

👉 [https://bmsce-wallah.vercel.app](https://bmsce-wallah.vercel.app)

---

## 👨‍💻 Developer

Built with ❤️ for BMSCE students

**Gagan Gowda TG** — gagangowdatg2007@gmail.com

---

## 📜 License

This project is for educational use only.
© 2026 BMSCE WALLAH. All rights reserved.