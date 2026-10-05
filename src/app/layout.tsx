import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import CartProvider from "@/components/cart/CartProvider";
import NavigationProgress from "@/components/layout/NavigationProgress";

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
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
