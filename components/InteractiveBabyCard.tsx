"use client";

import { useState } from "react";
import { Sparkles, Heart, ShieldCheck, Utensils, Pill, Info, X } from "lucide-react";

interface InteractiveBabyCardProps {
  gaWeeks: number;
  gaDays: number;
  daysUntilEdd: number;
  trimesterTitle: string;
  allSupplementsTaken: boolean;
  isDietBalanced: boolean;
  foodGroupsCount: number;
  isAm: boolean;
}

export function getBabyMilestone(weeks: number) {
  if (weeks <= 8) {
    return {
      fruitAm: "የቡና ፍሬ (1.5cm)",
      fruitEn: "Coffee Bean (1.5cm)",
      emoji: "☕",
      factAm: "የትንሹ ልብ መምታት ጀምሯል፤ ጥቃቅን ጣቶች እየተፈጠሩ ነው!",
      factEn: "Baby's tiny heart is beating and limb buds are forming.",
      scale: 0.8,
    };
  }
  if (weeks <= 13) {
    return {
      fruitAm: "የሎሚ መጠን (7.5cm)",
      fruitEn: "Lime Size (7.5cm)",
      emoji: "🍋",
      factAm: "ጥፍሮች፣ አጥንቶችና የድምፅ አውታሮች እየተጠናከሩ ነው።",
      factEn: "Vocal cords and tiny fingernails are forming nicely.",
      scale: 0.85,
    };
  }
  if (weeks <= 17) {
    return {
      fruitAm: "የብርቱካን መጠን (12cm)",
      fruitEn: "Orange Size (12cm)",
      emoji: "🍊",
      factAm: "ብርሃን ማስተዋልና ድምፅ መስማት ይጀምራል።",
      factEn: "Baby can sense light and begins to hear your voice.",
      scale: 0.95,
    };
  }
  if (weeks <= 22) {
    return {
      fruitAm: "የአቦካዶ መጠን (27cm)",
      fruitEn: "Avocado Size (27cm)",
      emoji: "🥑",
      factAm: "የመጀመሪያዎቹን የህፃኑን እንቅስቃሴዎችና እርግጫዎች ያስተውላሉ!",
      factEn: "You can feel gentle quickening movements and kicks.",
      scale: 1.0,
    };
  }
  if (weeks <= 27) {
    return {
      fruitAm: "የፓፓያ መጠን (36cm)",
      fruitEn: "Papaya Size (36cm)",
      emoji: "🥭",
      factAm: "ህፃኑ ዓይኑን መክፈትና ጣቱን መጥባት ጀምሯል!",
      factEn: "Baby can open eyes, blink, and practice thumb sucking.",
      scale: 1.1,
    };
  }
  if (weeks <= 33) {
    return {
      fruitAm: "የኮኮናት መጠን (43cm)",
      fruitEn: "Coconut Size (43cm)",
      emoji: "🥥",
      factAm: "የአንጎልና የነርቭ ክፍሎች በፍጥነት እያደጉ ይገኛሉ።",
      factEn: "Brain pathways and sleep-wake cycles are fully active.",
      scale: 1.2,
    };
  }
  return {
    fruitAm: "የሐብሐብ መጠን (50cm)",
    fruitEn: "Watermelon (50cm)",
    emoji: "🍉",
    factAm: "ሳንባ ሙሉ ለሙሉ ተዘጋጅቷል፤ እርስዎን ለማየት ዝግጁ ነው!",
    factEn: "Lungs fully matured; baby is getting ready for delivery.",
    scale: 1.3,
  };
}

const BABY_THOUGHTS_AM = [
  "እማዬ፣ ፍቅርሽ ይሰማኛል! 👶💖",
  "ዛሬ ጥሩ ምግብ ስለመገብሽኝ አመሰግናለሁ! 🥑✨",
  "እየጠነከርኩ ነው፣ በቅርቡ እንገናኛለን! 🌟",
];

const BABY_THOUGHTS_EN = [
  "Mommy, I feel your love! 👶💖",
  "Thanks for the healthy food! 🥑✨",
  "I'm growing stronger every day! 🌟",
];

export function InteractiveBabyCard({
  gaWeeks,
  gaDays,
  daysUntilEdd,
  trimesterTitle,
  allSupplementsTaken,
  isDietBalanced,
  foodGroupsCount,
  isAm,
}: InteractiveBabyCardProps) {
  const milestone = getBabyMilestone(gaWeeks);
  const [tapCount, setTapCount] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);
  const [showFactModal, setShowFactModal] = useState(false);

  const handleBabyTap = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([25, 30, 25]);
    }
    setIsWiggling(true);
    setTapCount((prev) => prev + 1);
    setTimeout(() => setIsWiggling(false), 600);
  };

  const currentThought = isAm
    ? BABY_THOUGHTS_AM[tapCount % BABY_THOUGHTS_AM.length]
    : BABY_THOUGHTS_EN[tapCount % BABY_THOUGHTS_EN.length];

  const hasSuperGlow = allSupplementsTaken && isDietBalanced;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-3.5 text-white shadow-xs transition-all duration-500 ${
        hasSuperGlow
          ? "bg-gradient-to-r from-[#1E5638] via-[#2D6A4F] to-[#C27803]"
          : isDietBalanced
          ? "bg-gradient-to-r from-[#2D6A4F] to-[#9A4C03]"
          : "bg-gradient-to-r from-[#2D6A4F] to-[#1E4D38]"
      }`}
    >
      {/* Top Meta Line: Week + Countdown */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-100">
        <div className="flex items-center gap-1.5">
          <span className="bg-black/20 backdrop-blur-xs px-2 py-0.5 rounded-full text-white font-bold text-[10px]">
            {isAm ? `${gaWeeks} ሳምንት + ${gaDays} ቀን` : `Week ${gaWeeks} + ${gaDays}d`}
          </span>
          <span className="text-white/80">• {trimesterTitle}</span>
        </div>

        <button
          type="button"
          onClick={() => setShowFactModal(true)}
          className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full text-[10px] font-bold text-white transition-colors cursor-pointer"
        >
          <Info size={10} className="text-amber-200" />
          <span>{isAm ? "ዕድገት" : "Fact"}</span>
        </button>
      </div>

      {/* Main Row: Info Left, Compact Interactive Avatar Right */}
      <div className="mt-2 flex items-center justify-between gap-3">
        {/* Left Side: Fruit Size & Status Chips */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{milestone.emoji}</span>
            <h2 className="text-sm font-extrabold text-white truncate tracking-tight">
              {isAm ? milestone.fruitAm : milestone.fruitEn}
            </h2>
          </div>

          {/* Micro Habit Reaction Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                isDietBalanced
                  ? "bg-amber-400/30 text-amber-200 border border-amber-300/40"
                  : "bg-black/20 text-white/70"
              }`}
            >
              <Utensils size={9} />
              <span>{isDietBalanced ? (isAm ? "ምግብ ✓" : "Diet ✓") : `${foodGroupsCount}/4`}</span>
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                allSupplementsTaken
                  ? "bg-emerald-400/30 text-emerald-100 border border-emerald-300/40"
                  : "bg-black/20 text-white/70"
              }`}
            >
              <Pill size={9} />
              <span>{allSupplementsTaken ? (isAm ? "IFA ✓" : "IFA ✓") : isAm ? "IFA" : "IFA"}</span>
            </span>

            <span className="text-[10px] text-white/90 font-semibold ml-0.5">
              {isAm ? `ቀሪ: ${daysUntilEdd} ቀን` : `${daysUntilEdd}d to EDD`}
            </span>
          </div>
        </div>

        {/* Right Side: Compact Interactive Baby Icon */}
        <button
          type="button"
          onClick={handleBabyTap}
          aria-label="Tap baby avatar"
          className={`relative flex-shrink-0 w-12 h-12 rounded-full border border-white/40 flex items-center justify-center cursor-pointer transition-all ${
            isWiggling ? "scale-110" : "active:scale-95"
          } ${hasSuperGlow ? "bg-amber-400/30 ring-2 ring-amber-300/50" : "bg-white/20"}`}
        >
          <span
            className="text-2xl transition-transform duration-300 select-none"
            style={{ transform: `scale(${milestone.scale})` }}
          >
            👶
          </span>

          {isWiggling && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-xs">
              <Heart size={10} fill="white" />
            </div>
          )}
        </button>
      </div>

      {/* Single-Line Micro Thought */}
      <div
        onClick={handleBabyTap}
        className="mt-2 pt-1.5 border-t border-white/15 flex items-center gap-1.5 text-[10px] text-emerald-100 font-medium cursor-pointer"
      >
        <Sparkles size={10} className="text-amber-300 flex-shrink-0" />
        <span className="truncate">{currentThought}</span>
      </div>

      {/* Fact Drawer */}
      {showFactModal && (
        <div className="absolute inset-0 bg-neutral-900/95 p-3.5 flex flex-col justify-between rounded-2xl z-20 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span>{isAm ? `ሳምንት ${gaWeeks} ዕድገት` : `Week ${gaWeeks} Development`}</span>
            <button
              type="button"
              onClick={() => setShowFactModal(false)}
              className="text-white hover:text-gray-300 p-0.5"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-[11px] text-white/90 leading-relaxed line-clamp-3">
            {isAm ? milestone.factAm : milestone.factEn}
          </p>
          <button
            type="button"
            onClick={() => setShowFactModal(false)}
            className="w-full py-1 rounded-lg bg-white/20 text-white text-[10px] font-bold"
          >
            {isAm ? "እሺ" : "Got it"}
          </button>
        </div>
      )}
    </div>
  );
}