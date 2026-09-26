import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ChatBot from "@/components/ChatBot";

export const metadata: Metadata = {
  title: "BMSCE WALLAH",
  description: "Academic Portal for B.M.S. College of Engineering",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" />
        <ChatBot />
      </body>
    </html>
  );
}