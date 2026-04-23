import type { Metadata } from "next";
import ModelViewerScriptLoader from "@/components/common/ModelViewerScriptLoader";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <ModelViewerScriptLoader />
      </body>
    </html>
  );
}
