import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Photography-Hub — Fine Art Portfolio & Gemini Vision Platform",
  description: "Minimalist platform for photographers to showcase portfolios, analyze images with Google Gemini AI, and license prints.",
  keywords: ["photography", "fine art", "gemini ai", "vision ai", "exif", "portfolio", "leica", "hasselblad", "fujifilm", "sony"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 selection:bg-neutral-800 selection:text-white">
        <ToastProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
