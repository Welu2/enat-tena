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
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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
      <body className="font-sans antialiased bg-[#141210] text-brand-text min-h-dvh flex items-center justify-center p-0 md:p-6 lg:p-10 selection:bg-brand-green/20">
        {/* Responsive Mobile Container: Full-screen on mobile, elevated card on desktop */}
        <div className="w-full min-h-dvh md:min-h-[844px] md:max-h-[920px] md:max-w-[420px] bg-brand-cream flex flex-col relative overflow-y-auto overflow-x-hidden md:rounded-[40px] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] md:border md:border-white/10">
          <LanguageProvider>{children}</LanguageProvider>
        </div>
      </body>
    </html>
  );
}