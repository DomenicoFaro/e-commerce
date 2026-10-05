import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Shop House Giarre — Casalinghi, tessile casa, intimo", template: "%s | Shop House Giarre" },
  description:
    "Casalinghi, biancheria per la casa, intimo e cura persona. Spedizione in tutta Italia o ritiro gratuito in negozio a Giarre.",
  openGraph: { locale: "it_IT", type: "website", siteName: "Shop House Giarre" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
