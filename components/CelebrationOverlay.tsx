"use client";

import { useEffect, useState } from "react";
import { Sparkles, Heart, Star, Award, CheckCircle2 } from "lucide-react";

interface CelebrationOverlayProps {
  show: boolean;
  type: "supplement" | "diet" | "all_done";
  titleAm: string;
  titleEn: string;
  messageAm: string;
  messageEn: string;
  isAm: boolean;
  onClose: () => void;
}

export function CelebrationOverlay({
  show,
  type,
  titleAm,
  titleEn,
  messageAm,
  messageEn,
  isAm,
  onClose,
}: CelebrationOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
      {/* Floating Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              top: `${15 + (i * 5) % 70}%`,
              left: `${10 + (i * 6) % 80}%`,
              animationDuration: `${1.2 + (i % 4) * 0.4}s`,
              animationDelay: `${(i % 5) * 0.15}s`,
            }}
          >
            {i % 3 === 0 ? (
              <Sparkles size={20 + (i % 3) * 6} className="text-amber-400 opacity-80" />
            ) : i % 3 === 1 ? (
              <Heart size={18 + (i % 2) * 6} className="text-rose-400 opacity-80" />
            ) : (
              <Star size={18} className="text-emerald-400 opacity-80" />
            )}
          </div>
        ))}
      </div>

      {/* Pop-in Affirmation Toast Card */}
      <div className="pointer-events-auto max-w-xs sm:max-w-sm w-full bg-gradient-to-b from-[#1F4E39] to-[#123324] text-white p-5 rounded-3xl shadow-2xl border border-emerald-400/40 text-center space-y-3 animate-in zoom-in-90 fade-in duration-300">
        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md text-amber-300 flex items-center justify-center mx-auto shadow-inner ring-4 ring-white/10">
          {type === "supplement" ? (
            <Award size={28} className="text-amber-300 animate-pulse" />
          ) : (
            <Sparkles size={28} className="text-emerald-300 animate-spin" />
          )}
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>{isAm ? titleAm : titleEn}</span>
            <span>✨</span>
          </h3>
          <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
            {isAm ? messageAm : messageEn}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setVisible(false);
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-white text-[#1F4E39] font-bold text-xs hover:bg-emerald-50 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          {isAm ? "አመሰግናለሁ" : "Got it"}
        </button>
      </div>
    </div>
  );
}