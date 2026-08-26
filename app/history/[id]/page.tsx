"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Utensils,
  Pill,
  Baby,
  FileText,
  MessageSquare,
  ShieldAlert,
  Calendar,
  Volume2,
  Sparkles,
} from "lucide-react";

// ============================================================================
// Clinical Detail Mock Registry
// ============================================================================
interface SymptomDetail {
  nameAm: string;
  nameEn: string;
  severity: "mild" | "moderate" | "severe";
  durationAm: string;
  durationEn: string;
  isDangerSign: boolean;
}

interface FoodDetail {
  name: string;
  foodGroupAm: string;
  foodGroupEn: string;
}

interface SupplementDetail {
  name: string;
  dosage: string;
  taken: boolean;
  timeLogged: string;
}

interface CheckinDetailData {
  id: string;
  dateAm: string;
  dateEn: string;
  gaWeeks: number;
  gaDays: number;
  hasDangerSign: boolean;
  dangerAlertAm?: string;
  dangerAlertEn?: string;
  transcript: string;
  symptoms: SymptomDetail[];
  foodLogs: FoodDetail[];
  supplements: SupplementDetail[];
  closingMentions: { textAm: string; textEn: string }[];
  midwifeGuidanceAm: string;
  midwifeGuidanceEn: string;
}

const MOCK_DETAILS: Record<string, CheckinDetailData> = {
  h1: {
    id: "h1",
    dateAm: "ዛሬ፣ ጳጉሜ 1 ቀን 2018",
    dateEn: "Today, Sep 6, 2026",
    gaWeeks: 24,
    gaDays: 3,
    hasDangerSign: false,
    transcript: "ዛሬ ጧት ቀላል የድካም ስሜት ተሰምቶኝ ነበር። ቁርስ እንጀራ በሽሮ እና የተቀቀለ እንቁላል ተመግቤያለሁ። የዛሬውን የብረት እንክብል (IFA) ወስጃለሁ።",
    symptoms: [
      {
        nameAm: "ቀላል የድካም ስሜት",
        nameEn: "Mild generalized fatigue",
        severity: "mild",
        durationAm: "ለጥቂት ሰዓታት",
        durationEn: "A few hours",
        isDangerSign: false,
      },
    ],
    foodLogs: [
      { name: "እንጀራ በሽሮ", foodGroupAm: "እህልና ጥራጥሬ", foodGroupEn: "Grains & Legumes" },
      { name: "የተቀቀለ እንቁላል", foodGroupAm: "ፕሮቲን", foodGroupEn: "Protein / Egg" },
      { name: "ሙዝ", foodGroupAm: "ፍራፍሬ", foodGroupEn: "Fruit" },
    ],
    supplements: [
      { name: "Iron & Folic Acid (IFA)", dosage: "60mg / 400µg", taken: true, timeLogged: "09:15 AM" },
      { name: "Calcium (ካልሲየም)", dosage: "1.5g", taken: false, timeLogged: "ያልተወሰደ" },
    ],
    closingMentions: [
      { textAm: "በቀን ውስጥ በቂ ውሃ መጠጣት እንደሚገባ ተጠይቋል", textEn: "Inquired about optimal daily water hydration" },
    ],
    midwifeGuidanceAm: "የጤና ሁኔታዎ በመልካም ደረጃ ላይ ይገኛል። የቀረዎትን የካልሲየም እንክብል ከምሳ በኋላ እንዲወስዱ ይመከራል።",
    midwifeGuidanceEn: "Vitals and intake look optimal. Remember to take your prescribed Calcium dose after lunch.",
  },
  h3: {
    id: "h3",
    dateAm: "ነሐሴ 28 ቀን 2018",
    dateEn: "Sep 3, 2026",
    gaWeeks: 24,
    gaDays: 0,
    hasDangerSign: true,
    dangerAlertAm: "ጽኑ ራስ ምታት እና የዓይን ብዥታ የአስቸኳይ ፕሪኤክላምፕሲያ (Preeclampsia) ምልክት ሊሆን ይችላል!",
    dangerAlertEn: "Severe persistent headache and blurred vision trigger urgent preeclampsia triage protocol!",
    transcript: "ከጧት ጀምሮ ከፍተኛ የራስ ምታት አለኝ። ዓይኔ ላይ የማየት ብዥታ እና ማዞር እየተሰማኝ ነው።",
    symptoms: [
      {
        nameAm: "ጽኑ እና የማያቋርጥ ራስ ምታት",
        nameEn: "Severe persistent headache",
        severity: "severe",
        durationAm: "ከጧት ጀምሮ",
        durationEn: "Since morning",
        isDangerSign: true,
      },
      {
        nameAm: "የዓይን ብዥታ እና ማዞር",
        nameEn: "Blurred vision & light dizziness",
        severity: "severe",
        durationAm: "የቀጠለ",
        durationEn: "Ongoing",
        isDangerSign: true,
      },
    ],
    foodLogs: [
      { name: "አጃ ሾርባ", foodGroupAm: "እህል", foodGroupEn: "Grains / Oats" },
      { name: "ሞቅ ያለ ሻይ", foodGroupAm: "ፈሳሽ", foodGroupEn: "Fluids" },
    ],
    supplements: [
      { name: "Iron & Folic Acid (IFA)", dosage: "60mg / 400µg", taken: true, timeLogged: "08:30 AM" },
    ],
    closingMentions: [
      { textAm: "የደም ግፊት ምርመራ በአስቸኳይ ያስፈልጋል", textEn: "Urgent BP screening advised" },
    ],
    midwifeGuidanceAm: "አስቸኳይ ክሊኒካል ምርመራ ያስፈልጋል። እባክዎ በአቅራቢያዎ ወደሚገኝ ጤና ጣቢያ ወይም ሆስፒታል በአፋጣኝ ይሂዱ።",
    midwifeGuidanceEn: "Urgent evaluation required. Please report to the maternal emergency triage at your nearest hospital.",
  },
};

export default function CheckinDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { lang, t } = useLanguage();
  const isAm = lang === "am";

  const checkinId = (params?.id as string) || "h1";
  const detail = MOCK_DETAILS[checkinId] || MOCK_DETAILS["h1"];

  return (
    <div className="min-h-dvh w-full bg-[#FAF7F2] text-[#2C2723] flex justify-center">
      <main className="w-full max-w-md flex flex-col justify-between p-5 pb-8 font-sans select-none min-h-dvh">
        
        {/* Top Header Bar */}
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-10 h-10 rounded-2xl bg-white border border-[#E8E1D5] flex items-center justify-center text-[#1F2937] hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer shadow-xs"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="text-center">
              <span className="text-[10px] font-bold tracking-widest text-[#2D6A4F] uppercase">
                {isAm ? "የምርመራ ዝርዝር" : "Check-in Summary"}
              </span>
              <h1 className="text-sm font-bold text-[#1F2937]">
                {isAm ? detail.dateAm : detail.dateEn}
              </h1>
            </div>

            <Header />
          </div>

          {/* Gestational Age Milestone Banner */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E8E1D5] shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center">
                <Baby size={17} />
              </span>
              <div>
                <p className="text-[10px] font-semibold text-[#6B7280]">
                  {isAm ? "የእርግዝና ዕድሜ" : "Gestational Age"}
                </p>
                <p className="text-xs font-bold text-[#1F2937]">
                  {isAm
                    ? `ሳምንት ${detail.gaWeeks} + ${detail.gaDays} ቀናት`
                    : `Week ${detail.gaWeeks} + ${detail.gaDays} days`}
                </p>
              </div>
            </div>

            {detail.hasDangerSign ? (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                <ShieldAlert size={12} />
                <span>{isAm ? "የአደጋ ምልክት" : "High Priority"}</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#2D6A4F] flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>{isAm ? "መደበኛ ሁኔታ" : "Normal"}</span>
              </span>
            )}
          </div>
        </header>

        {/* Main Content Sections */}
        <div className="flex-1 space-y-3.5 py-3 overflow-y-auto">
          
          {/* Urgent Danger Alert Banner */}
          {detail.hasDangerSign && (
            <div className="p-4 rounded-3xl bg-red-50 border border-red-200 text-red-900 space-y-1.5 shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-700">
                  {isAm ? "አስቸኳይ ክሊኒካል ማስጠንቀቂያ" : "Urgent Clinical Alert"}
                </h3>
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                {isAm ? detail.dangerAlertAm : detail.dangerAlertEn}
              </p>
            </div>
          )}

          {/* 1. Voice Intake Transcript Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E1D5] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                <Volume2 size={15} className="text-[#2D6A4F]" />
                <span>{isAm ? "የድምፅ ቃለ-መጠይቅ ቅጂ" : "Voice Transcript"}</span>
              </span>
              <span className="text-[10px] font-semibold bg-[#FAF7F2] text-[#6B7280] px-2 py-0.5 rounded-md border border-[#E8E1D5]">
                {isAm ? "በአማርኛ የተቀዳ" : "Amharic Audio"}
              </span>
            </div>
            <p className="text-xs text-[#4B5563] italic bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8E1D5]/70 leading-relaxed">
              "{detail.transcript}"
            </p>
          </div>

          {/* 2. Extracted Symptoms & Triage Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E1D5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                <FileText size={15} className="text-[#2D6A4F]" />
                <span>{isAm ? "የተመዘገቡ ምልክቶች" : "Reported Symptoms"}</span>
              </span>
              <span className="text-[10px] font-semibold text-[#6B7280]">
                {detail.symptoms.length} {isAm ? "ምልክት" : "items"}
              </span>
            </div>

            {detail.symptoms.length === 0 ? (
              <p className="text-xs text-gray-400 py-1">
                {isAm ? "ምንም ዓይነት የህመም ምልክት አልተመዘገበም።" : "No adverse symptoms reported."}
              </p>
            ) : (
              <div className="space-y-2">
                {detail.symptoms.map((s, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border flex items-center justify-between ${
                      s.isDangerSign
                        ? "bg-red-50/70 border-red-200"
                        : "bg-[#FAF7F2] border-[#E8E1D5]"
                    }`}
                  >
                    <div>
                      <p className={`text-xs font-bold ${s.isDangerSign ? "text-red-900" : "text-[#1F2937]"}`}>
                        {isAm ? s.nameAm : s.nameEn}
                      </p>
                      <p className="text-[10px] text-[#6B7280]">
                        {isAm ? `የቆይታ ጊዜ: ${s.durationAm}` : `Duration: ${s.durationEn}`}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.severity === "severe"
                          ? "bg-red-200 text-red-800"
                          : "bg-emerald-100 text-[#2D6A4F]"
                      }`}
                    >
                      {s.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Nutrition & Food Groups Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E1D5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                <Utensils size={15} className="text-amber-600" />
                <span>{isAm ? "የተመገቧቸው ምግቦች" : "Dietary Intake"}</span>
              </span>
              <span className="text-[10px] font-semibold text-[#6B7280]">
                {detail.foodLogs.length} {isAm ? "የምግብ አይነቶች" : "food items"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {detail.foodLogs.map((food, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-[#1F2937]">{food.name}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-[#E8E1D5]">
                    {isAm ? food.foodGroupAm : food.foodGroupEn}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Supplement Compliance Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E1D5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                <Pill size={15} className="text-[#2D6A4F]" />
                <span>{isAm ? "የቅድመ ወሊድ እንክብሎች" : "Prescribed Supplements"}</span>
              </span>
            </div>

            <div className="space-y-2">
              {detail.supplements.map((supp, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-2xl border ${
                    supp.taken ? "bg-[#F0F7F3] border-[#C8E1D3]" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        supp.taken ? "bg-[#2D6A4F] text-white" : "border-2 border-gray-300 bg-white"
                      }`}
                    >
                      {supp.taken && <CheckCircle2 size={13} />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${supp.taken ? "text-[#1F2937]" : "text-gray-400 line-through"}`}>
                        {supp.name}
                      </p>
                      <p className="text-[10px] text-[#6B7280]">{supp.dosage}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400">{supp.timeLogged}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Midwife Guidance & Telemetry Notes Card */}
          <div className="bg-gradient-to-br from-[#2D6A4F]/10 to-[#1E4D38]/5 rounded-3xl p-4 sm:p-5 border border-[#2D6A4F]/20 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D6A4F]">
              <Sparkles size={15} />
              <span>{isAm ? "የአዋላጅ እና የክሊኒክ ምክር" : "Clinical Midwife Guidance"}</span>
            </div>
            <p className="text-xs text-[#2D6A4F] leading-relaxed font-medium">
              {isAm ? detail.midwifeGuidanceAm : detail.midwifeGuidanceEn}
            </p>
          </div>
        </div>

        {/* Bottom Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full py-3.5 rounded-2xl bg-[#2D6A4F] hover:bg-[#1E4D38] text-white text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer mt-2"
        >
          {isAm ? "ወደ ታሪክ ዝርዝር ተመለስ" : "Back to History"}
        </button>
      </main>
    </div>
  );
}