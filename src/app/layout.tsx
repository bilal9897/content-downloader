import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google"; // distinctive font
import "./globals.css";

import { Toaster } from "@/components/ui/Toaster";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SIPHON | The Future of Media Extraction",
  description: "Advanced AI-Powered Media Laboratory by Bilal Salmani",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SIPHON",
  }
};

export const viewport: Viewport = {
  themeColor: "#00d2ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.className} antialiased bg-black text-white selection:bg-neon-pink selection:text-white`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
