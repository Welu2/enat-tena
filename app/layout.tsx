import type { Metadata, Viewport } from "next";
import { Noto_Sans_Ethiopic, Plus_Jakarta_Sans } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

const notoSansEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ethiopic",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-latin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "እናት ጤና — Enat Tena",
  description: "Daily voice check-ins for maternal health monitoring",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="am"
      className={`${notoSansEthiopic.variable} ${plusJakartaSans.variable}`}
    >
      <body className="font-sans antialiased bg-brand-cream text-brand-text min-h-dvh w-full flex flex-col selection:bg-brand-green/20">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}