import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const sans = Noto_Sans_Thai({ subsets: ["thai", "latin"], variable: "--font-noto" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jb" });

export const metadata: Metadata = {
  title: "Hardware Inventory Jiffy | VTec Pos Retail • Jiffy Project",
  description: "ระบบตรวจสอบอุปกรณ์ฮาร์ดแวร์รายสาขา Jiffy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-[#F4F8FD] text-slate-900 font-sans pb-20">
        <Nav />
        {children}
      </body>
    </html>
  );
}
