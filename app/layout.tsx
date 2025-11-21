import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./context/UserContext";
import PWAInstall from './components/PWAInstall';
import Navigation from './components/Navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wildlife Guardian AI | Animal Health Prediction & Conservation",
  description: "Web-based intelligent system for animal health prediction and endangered species awareness using machine learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <UserProvider>
          {/* ✅ ADD NAVIGATION HERE - This will show on ALL pages */}
          <Navigation />
          
          {/* Main content area */}
          <main className="min-h-screen">
            {children}
          </main>
          
          <footer className="bg-white border-t py-6">
            <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
              <p>© {new Date().getFullYear()} PawthCare. All rights reserved.</p>
              <p className="mt-1">The path to better animal health and awareness.</p>
            </div>
          </footer>
          <PWAInstall />
        </UserProvider>
      </body>
    </html>
  );
}