import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: "KerjaTumbuh - Platform Pemberdayaan Kerja dan UMKM Lokal",
  description: "Temukan pekerjaan yang cocok dengan keterampilanmu dan bantu UMKM lokal tumbuh. SDG 8: Pekerjaan Layak dan Pertumbuhan Ekonomi.",
  icons: { icon: "/logo/kerjatumbuh-icon.svg" },
  applicationName: "KerjaTumbuh",
};

export const viewport: Viewport = {
  themeColor: "#0F766E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
