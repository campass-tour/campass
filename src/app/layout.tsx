import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ModelViewerScriptLoader from "@/components/common/ModelViewerScriptLoader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campass",
  description: "Campass",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ModelViewerScriptLoader />
      </body>
    </html>
  );
}
