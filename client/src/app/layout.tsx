// client/src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RoastDirect | Fresh Coffee, Complete Transparency",
  description: "Freshly roasted coffee with complete farm and processing details",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-amber-50">
      <body className="min-h-screen bg-amber-50 w-full">
        <div className="bg-amber-50 w-full min-h-screen">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}