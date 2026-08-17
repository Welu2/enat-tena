import Link from "next/link";
import { Mic, ChevronRight } from "lucide-react";

interface VoiceCheckinCTAProps {
  title: string;
  subtitle: string;
}

export function VoiceCheckinCTA({ title, subtitle }: VoiceCheckinCTAProps) {
  return (
    <Link
      href="/checkin"
      className="w-full bg-[#2E5243] hover:bg-brand-green text-white p-4.5 rounded-3xl flex items-center justify-between shadow-md active:scale-[0.99] transition-all group cursor-pointer"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs group-hover:scale-105 transition-transform">
          <Mic size={22} className="text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold leading-tight">{title}</h3>
          <p className="text-xs text-white/75 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
        <ChevronRight size={18} className="text-white" />
      </div>
    </Link>
  );
}