"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { InteractiveBabyCard } from "@/components/InteractiveBabyCard";
import { userService } from "@/services/user.service";
import { checkinService } from "@/services/checkin.service";
import { summaryService } from "@/services/summary.service";
import {
  UserProfile,
  AncScheduleResponse,
  CheckInHistoryItem,
  ClinicianSummaryResponse,
  FoodGroup,
  Supplement,
} from "@/types/api";
import {
  Mic,
  Calendar,
  Pill,
  CheckCircle2,
  QrCode,
  Utensils,
  ChevronRight,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  PhoneCall,
  ShoppingBag,
  Heart,
  X,
  Flame,
} from "lucide-react";

interface LocalSupplementItem extends Supplement {
  takenToday?: boolean;
}

const getTodayDateKey = () => new Date().toISOString().split("T")[0];

const GO_BAG_ITEMS = [
  { id: "netela", labelAm: "ንጹህ የጥበብ ነጠላ እና ጋቢ", labelEn: "Cotton Netela & Gabi" },
  { id: "id_card", labelAm: "የጤና ካርድ እና የቀጠሮ ደብተር", labelEn: "Hospital Card & Booklet" },
  { id: "clothes", labelAm: "የጨቅላ ህፃን ልብሶች እና ዳይፐር", labelEn: "Baby Clothes & Diapers" },
  { id: "thermos", labelAm: "የአጥሚት ወይም የሻይ ቴርሞስ", labelEn: "Thermos Flask" },
  { id: "pads", labelAm: "የእናቶች ንፅህና መጠበቂያ (Pads)", labelEn: "Maternity Pads" },
];

export default function HomePage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const isAm = lang === "am";

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ancSchedule, setAncSchedule] = useState<AncScheduleResponse | null>(null);
  const [rawHistory, setRawHistory] = useState<CheckInHistoryItem[]>([]);
  const [supplements, setSupplements] = useState<LocalSupplementItem[]>([]);
  const [summaryData, setSummaryData] = useState<ClinicianSummaryResponse | null>(null);

  const [isFastingMode, setIsFastingMode] = useState(false);
  const [selectedFoodGroups, setSelectedFoodGroups] = useState<FoodGroup[]>([]);
  const [activeRoutineTab, setActiveRoutineTab] = useState<"supplements" | "nutrition">("supplements");

  const [showKickModal, setShowKickModal] = useState(false);
  const [kickCount, setKickCount] = useState(0);
  const [kickTimerSeconds, setKickTimerSeconds] = useState(0);
  const [isKickTimerRunning, setIsKickTimerRunning] = useState(false);

  const [showSosModal, setShowSosModal] = useState(false);
  const [showGoBagModal, setShowGoBagModal] = useState(false);
  const [packedItems, setPackedItems] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    const todayKey = getTodayDateKey();

    try {
      const [userProfile, schedule, history] = await Promise.all([
        userService.getProfile(),
        userService.getAncSchedule().catch(() => null),
        checkinService.getHistory().catch(() => []),
      ]);

      if (!userProfile.onboarding_completed) {
        router.replace("/onboarding");
        return;
      }

      setProfile(userProfile);
      setAncSchedule(schedule);
      setRawHistory(history);

      const cachedSuppMap = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem(`supp_status_${todayKey}`) || "{}")
        : {};
      const cachedFoodGroups = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem(`food_groups_${todayKey}`) || "[]")
        : [];
      const cachedFasting = typeof window !== "undefined"
        ? localStorage.getItem("is_fasting_mode") === "true"
        : false;
      const cachedPacked = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("packed_go_bag_items") || "[]")
        : [];

      setIsFastingMode(cachedFasting);
      setPackedItems(cachedPacked);

      const todaysLogs = history.filter((c) => c.timestamp?.startsWith(todayKey));

      const hydratedSupps: LocalSupplementItem[] = (userProfile.supplements || []).map((s) => {
        const isTakenLocally = !!cachedSuppMap[s.id];
        const isTakenInHistory = todaysLogs.some(
          (c) =>
            c.supplement_check?.taken_today &&
            c.supplement_check.supplement_name?.toLowerCase().includes(s.name.toLowerCase())
        );
        return {
          ...s,
          takenToday: isTakenLocally || isTakenInHistory || false,
        };
      });
      setSupplements(hydratedSupps);

      const historyFoodGroups: FoodGroup[] = [];
      todaysLogs.forEach((l) => {
        if (l.food_log?.food_groups) {
          l.food_log.food_groups.forEach((fg) => {
            if (!historyFoodGroups.includes(fg)) historyFoodGroups.push(fg);
          });
        }
      });

      if (historyFoodGroups.length > 0) {
        setSelectedFoodGroups(historyFoodGroups);
      } else if (cachedFoodGroups.length > 0) {
        setSelectedFoodGroups(cachedFoodGroups);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard";
      setErrorToast(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isKickTimerRunning) {
      interval = setInterval(() => {
        setKickTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isKickTimerRunning]);

  const handleToggleSupplement = async (supplement: LocalSupplementItem) => {
    const todayKey = getTodayDateKey();
    const nextState = !supplement.takenToday;

    setSupplements((prev) =>
      prev.map((s) => (s.id === supplement.id ? { ...s, takenToday: nextState } : s))
    );

    if (typeof window !== "undefined") {
      const currentCache = JSON.parse(localStorage.getItem(`supp_status_${todayKey}`) || "{}");
      currentCache[supplement.id] = nextState;
      localStorage.setItem(`supp_status_${todayKey}`, JSON.stringify(currentCache));
    }

    try {
      await userService.verifySupplementIntake({
        supplement_id: supplement.id,
        supplement_name: supplement.name,
        taken_today: nextState,
      });
    } catch {
      setSupplements((prev) =>
        prev.map((s) => (s.id === supplement.id ? { ...s, takenToday: !nextState } : s))
      );
      setErrorToast(isAm ? "መረጃውን ማስቀመጥ አልተቻለም" : "Failed to save");
    }
  };

  const handleToggleFoodGroup = async (group: FoodGroup) => {
    const todayKey = getTodayDateKey();
    const updatedGroups = selectedFoodGroups.includes(group)
      ? selectedFoodGroups.filter((g) => g !== group)
      : [...selectedFoodGroups, group];

    setSelectedFoodGroups(updatedGroups);

    if (typeof window !== "undefined") {
      localStorage.setItem(`food_groups_${todayKey}`, JSON.stringify(updatedGroups));
    }

    try {
      await userService.verifyFoodLog({
        food_groups: updatedGroups,
        raw_text: updatedGroups.join(", "),
      });
    } catch {
      setErrorToast(isAm ? "መረጃውን ማስቀመጥ አልተቻለም" : "Failed to save");
    }
  };

  const handleOpenQrModal = async () => {
    setShowQrModal(true);
    setIsGeneratingQr(true);
    try {
      let summary = await summaryService.getLatestSummary().catch(() => null);
      if (!summary) summary = await summaryService.generateSummary();
      setSummaryData(summary);
    } catch {
      setErrorToast(isAm ? "QR ኮድ ማመንጨት አልተቻለም" : "Failed to generate QR");
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const userName =
    (typeof window !== "undefined" && localStorage.getItem("user_name")) ||
    profile?.email.split("@")[0] ||
    "Mother";

  const pregnancyStatus = profile?.current_pregnancy_status;
  const gaWeeks = pregnancyStatus?.gestational_age_weeks ?? profile?.gestational_age_weeks ?? 24;
  const gaDays = pregnancyStatus?.gestational_age_days ?? profile?.gestational_age_days ?? 0;
  const daysUntilEdd = pregnancyStatus?.days_until_edd ?? 112;

  const nextContact = ancSchedule?.next_anc_contact;
  const nextApptDate = profile?.appointment?.appointment_date || nextContact?.target_date || "";

  const calculateDaysAway = (targetDateStr: string) => {
    if (!targetDateStr) return null;
    const diffTime = new Date(targetDateStr).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const daysAway = calculateDaysAway(nextApptDate);

  const takenSupplementsCount = supplements.filter((s) => s.takenToday).length;
  const totalSupplementsCount = supplements.length;
  const allSupplementsTaken = totalSupplementsCount > 0 && takenSupplementsCount === totalSupplementsCount;
  const isDietBalanced = selectedFoodGroups.length >= 3;

  const todayCompletedCheckin = useMemo(() => {
    const todayKey = getTodayDateKey();
    return rawHistory.some((c) => c.timestamp?.startsWith(todayKey));
  }, [rawHistory]);

  const foodOptions = useMemo(() => {
    if (isFastingMode) {
      return [
        { key: "grains" as FoodGroup, labelAm: "እህል (እንጀራ/አጃ)", labelEn: "Grains (Injera)" },
        { key: "proteins" as FoodGroup, labelAm: "የፆም ፕሮቲን (ሽሮ/ምስር)", labelEn: "Shiro / Lentils" },
        { key: "dairy" as FoodGroup, labelAm: "ተልባ / ሱፍ / ኑግ", labelEn: "Flaxseed / Suf" },
        { key: "fruits_and_vegetables" as FoodGroup, labelAm: "አትክልት (ጎመን/ሰላጣ)", labelEn: "Greens (Gomen)" },
      ];
    }
    return [
      { key: "grains" as FoodGroup, labelAm: "እህል (እንጀራ/ዳቦ)", labelEn: "Grains (Injera)" },
      { key: "proteins" as FoodGroup, labelAm: "ፕሮቲን (ስጋ/እንቁላል/ሽሮ)", labelEn: "Meat / Eggs / Shiro" },
      { key: "dairy" as FoodGroup, labelAm: "የወተት ተዋፅኦ (ወተት/እርጎ)", labelEn: "Milk / Yogurt" },
      { key: "fruits_and_vegetables" as FoodGroup, labelAm: "አትክልትና ፍራፍሬ", labelEn: "Fruits & Greens" },
    ];
  }, [isFastingMode]);

  if (isLoading) {
    return (
      <div className="min-h-dvh max-w-lg mx-auto w-full flex flex-col justify-center items-center p-6 bg-[#FAF7F2] text-[#2C2723]">
        <Loader2 size={28} className="animate-spin text-[#2D6A4F] mb-2" />
        <p className="text-xs font-semibold text-[#7A7165]">
          {isAm ? "የእናት ጤና መረጃዎችን በማዘጋጀት ላይ..." : "Loading dashboard..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh max-w-lg mx-auto w-full flex flex-col justify-between pb-24 font-sans select-none bg-[#FAF7F2] text-[#2C2723]">
      {errorToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-in slide-in-from-top-3">
          <div className="p-3 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorToast}</span>
            </div>
            <button type="button" onClick={() => setErrorToast(null)}>✕</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-4 sm:px-5 pt-3.5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-xs shadow-xs uppercase">
            {userName.charAt(0)}
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-[#1F2937] leading-tight">{userName}</h1>
            <p className="text-[10px] text-[#6B7280]">
              {profile?.hospital || (isAm ? "ቅዱስ ጳውሎስ ሆስፒታል" : "St. Paul Hospital")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowSosModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold hover:bg-red-100 transition-all cursor-pointer"
          >
            <PhoneCall size={11} className="animate-pulse text-red-600" />
            <span>SOS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRefreshing(true);
              fetchDashboardData();
            }}
            className="p-1.5 rounded-full text-[#7A7165] hover:bg-black/5 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-[#2D6A4F]" : ""} />
          </button>
          <Header />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-4 sm:px-5 py-1.5 space-y-3 overflow-y-auto">
        
        {/* 1. Compact Baby Milestone Banner */}
        <InteractiveBabyCard
          gaWeeks={gaWeeks}
          gaDays={gaDays}
          daysUntilEdd={daysUntilEdd}
          trimesterTitle={
            isAm
              ? pregnancyStatus?.trimester_info?.name_am || "2ኛ ትሪሚስተር"
              : pregnancyStatus?.trimester_info?.name_en || "2nd Trimester"
          }
          allSupplementsTaken={allSupplementsTaken}
          isDietBalanced={isDietBalanced}
          foodGroupsCount={selectedFoodGroups.length}
          isAm={isAm}
        />

        {/* 2. Hero Action: Spoken Voice Intake */}
        <Link
          href="/checkin"
          className="group block rounded-2xl bg-white border border-[#E8E1D5] p-3.5 shadow-xs hover:border-[#2D6A4F]/50 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#2D6A4F]">
                <span className={`w-1.5 h-1.5 rounded-full ${todayCompletedCheckin ? "bg-emerald-500" : "bg-[#2D6A4F] animate-ping"}`} />
                <span>
                  {todayCompletedCheckin
                    ? isAm ? "የዛሬው ምርመራ ተጠናቋል ✓" : "Check-in Logged ✓"
                    : isAm ? "የዛሬው የድምፅ ክትትል" : "Daily Voice Intake"}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#1F2937]">
                {todayCompletedCheckin
                  ? isAm ? "ተጨማሪ ምልክቶችን በድምፅ ይመዝግቡ" : "Update spoken check-in"
                  : isAm ? "የዛሬውን የጤና ምርመራ በድምፅ ያድርጉ" : "Start daily voice health check-in"}
              </h3>
            </div>

            <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] group-hover:bg-[#2D6A4F] text-[#2D6A4F] group-hover:text-white flex items-center justify-center transition-colors shadow-inner flex-shrink-0">
              <Mic size={18} />
            </div>
          </div>
        </Link>

        {/* 3. Combined Routine Tabs (Supplements & Diet in One Card) */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#E8E1D5] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setActiveRoutineTab("supplements")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  activeRoutineTab === "supplements"
                    ? "bg-[#2D6A4F] text-white"
                    : "bg-[#FAF7F2] text-[#7A7165]"
                }`}
              >
                {isAm ? `ማሟያ (${takenSupplementsCount}/${totalSupplementsCount})` : `Supplements (${takenSupplementsCount}/${totalSupplementsCount})`}
              </button>

              <button
                type="button"
                onClick={() => setActiveRoutineTab("nutrition")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  activeRoutineTab === "nutrition"
                    ? "bg-[#2D6A4F] text-white"
                    : "bg-[#FAF7F2] text-[#7A7165]"
                }`}
              >
                {isAm ? `ምግብ (${selectedFoodGroups.length}/4)` : `Diet (${selectedFoodGroups.length}/4)`}
              </button>
            </div>

            {activeRoutineTab === "nutrition" && (
              <button
                type="button"
                onClick={() => {
                  const next = !isFastingMode;
                  setIsFastingMode(next);
                  if (typeof window !== "undefined") localStorage.setItem("is_fasting_mode", String(next));
                }}
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 transition-all cursor-pointer ${
                  isFastingMode ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-neutral-50 text-neutral-600 border-neutral-200"
                }`}
              >
                <Flame size={9} className={isFastingMode ? "text-amber-600 fill-amber-600" : ""} />
                <span>{isFastingMode ? (isAm ? "ፆም ✓" : "Fasting") : (isAm ? "የፆም ምግብ" : "Fasting")}</span>
              </button>
            )}
          </div>

          {/* Supplements List */}
          {activeRoutineTab === "supplements" && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              {supplements.length === 0 ? (
                <p className="text-[11px] text-gray-400 py-1 text-center">
                  {isAm ? "ምንም ማሟያ አልተመዘገበም" : "No active supplements"}
                </p>
              ) : (
                supplements.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleToggleSupplement(s)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer text-left ${
                      s.takenToday
                        ? "bg-[#F0F7F3] border-[#C8E1D3]"
                        : "bg-[#FAF7F2] border-[#E8E1D5]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                          s.takenToday ? "bg-[#2D6A4F] text-white" : "border border-gray-300 bg-white"
                        }`}
                      >
                        {s.takenToday && <CheckCircle2 size={10} />}
                      </div>
                      <span className={`text-[11px] font-semibold ${s.takenToday ? "line-through text-gray-500" : "text-[#1F2937]"}`}>
                        {s.name}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-gray-400">
                      {s.takenToday ? "✓" : isAm ? "መዝግብ" : "Mark"}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Nutrition Checklist */}
          {activeRoutineTab === "nutrition" && (
            <div className="grid grid-cols-2 gap-1.5 animate-in fade-in duration-150">
              {foodOptions.map((g) => {
                const isChecked = selectedFoodGroups.includes(g.key);
                return (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => handleToggleFoodGroup(g.key)}
                    className={`p-2 rounded-xl border text-[10px] font-semibold text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                      isChecked
                        ? "bg-[#FEF9E7] border-amber-300 text-amber-900 font-bold"
                        : "bg-[#FAF7F2] border-[#E8E1D5] text-gray-500"
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${
                        isChecked ? "bg-amber-600 text-white" : "border border-gray-300 bg-white"
                      }`}
                    >
                      {isChecked && "✓"}
                    </span>
                    <span className="truncate">{isAm ? g.labelAm : g.labelEn}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Compact Clinical Pass & ANC Contact */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-2xl p-3 border border-[#E8E1D5] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar size={13} />
              </span>
              {daysAway !== null && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {daysAway >= 0 ? `${daysAway}d` : "Past"}
                </span>
              )}
            </div>
            <div className="mt-1.5">
              <p className="text-[9px] text-[#6B7280] font-medium">{isAm ? "ቀጣይ ቀጠሮ" : "Next ANC"}</p>
              <h4 className="text-[11px] font-bold text-[#1F2937] truncate">{nextApptDate || "TBD"}</h4>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenQrModal}
            className="bg-white rounded-2xl p-3 border border-[#E8E1D5] shadow-xs flex flex-col justify-between text-left hover:border-purple-300 active:scale-98 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                <QrCode size={13} />
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                {isAm ? "ለሀኪም" : "Doctor"}
              </span>
            </div>
            <div className="mt-1.5">
              <p className="text-[9px] text-[#6B7280] font-medium">{isAm ? "የክሊኒክ QR" : "Clinic Pass"}</p>
              <h4 className="text-[11px] font-bold text-[#1F2937] flex items-center gap-0.5">
                <span>{isAm ? "ክፈት" : "Open"}</span>
                <ChevronRight size={10} />
              </h4>
            </div>
          </button>
        </div>

        {/* 5. Mother's Quick Toolkit (Scrollable Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => setShowKickModal(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E8E1D5] text-[11px] font-bold text-[#1F2937] shadow-xs hover:border-pink-300 transition-all cursor-pointer"
          >
            <Heart size={12} className="text-pink-600 fill-pink-600" />
            <span>{kickCount > 0 ? `${kickCount} Kicks` : isAm ? "እርግጫ መቁጠሪያ" : "Kick Counter"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowGoBagModal(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E8E1D5] text-[11px] font-bold text-[#1F2937] shadow-xs hover:border-amber-300 transition-all cursor-pointer"
          >
            <ShoppingBag size={12} className="text-amber-600" />
            <span>{isAm ? `የወሊድ ቦርሳ (${packedItems.length}/5)` : `Go-Bag (${packedItems.length}/5)`}</span>
          </button>

          {/* <Link
            href="/history"
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E8E1D5] text-[11px] font-bold text-[#2D6A4F] shadow-xs transition-all"
          >
            <Clock size={12} />
            <span>{isAm ? "የቀን ታሪክ" : "Timeline"}</span>
          </Link> */}
        </div>
      </main>

      {/* Kick Modal */}
      {showKickModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 text-center space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-xs text-[#1F2937]">
                {isAm ? "የፅንስ እንቅስቃሴ መቁጠሪያ" : "Kick Counter"}
              </span>
              <button type="button" onClick={() => setShowKickModal(false)}>
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!isKickTimerRunning) setIsKickTimerRunning(true);
                if (typeof window !== "undefined" && "vibrate" in navigator) navigator.vibrate?.([30, 40, 30]);
                setKickCount((p) => p + 1);
              }}
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-md active:scale-90 transition-transform flex flex-col items-center justify-center cursor-pointer"
            >
              <span className="text-2xl font-black">{kickCount}</span>
              <span className="text-[8px] uppercase font-bold">{isAm ? "እርግጫ" : "Kicks"}</span>
            </button>

            <p className="text-[10px] text-[#7A7165]">
              {isAm ? "የቆየበት ሰዓት:" : "Time:"} {Math.floor(kickTimerSeconds / 60)}:{kickTimerSeconds % 60 < 10 ? "0" : ""}{kickTimerSeconds % 60}
            </p>

            <button
              type="button"
              onClick={() => setShowKickModal(false)}
              className="w-full py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold cursor-pointer"
            >
              {isAm ? "ጨርስ" : "Done"}
            </button>
          </div>
        </div>
      )}

      {/* SOS Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2 text-red-600 font-bold text-sm">
              <span>{isAm ? "የአስቸኳይ ጊዜ እርዳታ" : "Emergency Hotlines"}</span>
              <button type="button" onClick={() => setShowSosModal(false)}>
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-2">
              <a href="tel:8028" className="block p-3 rounded-xl bg-red-50 text-red-900 text-xs font-bold border border-red-200">
                📞 8028 — {isAm ? "የጤና ጥበቃ የአደጋ ጊዜ" : "MOH Emergency"}
              </a>
              <a href="tel:907" className="block p-3 rounded-xl bg-neutral-50 text-neutral-800 text-xs font-bold border border-neutral-200">
                🚑 907 — {isAm ? "ቀይ መስቀል አምቡላንስ" : "Red Cross Ambulance"}
              </a>
            </div>

            <button
              type="button"
              onClick={() => setShowSosModal(false)}
              className="w-full py-2 rounded-xl bg-neutral-100 text-xs font-bold text-neutral-700 cursor-pointer"
            >
              {isAm ? "ዝጋ" : "Close"}
            </button>
          </div>
        </div>
      )}

      {/* Go-Bag Modal */}
      {showGoBagModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2 font-bold text-xs text-[#1F2937]">
              <span>{isAm ? "የወሊድ ሆስፒታል ቦርሳ" : "Hospital Go-Bag"}</span>
              <button type="button" onClick={() => setShowGoBagModal(false)}>
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {GO_BAG_ITEMS.map((item) => {
                const isPacked = packedItems.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      const next = isPacked ? packedItems.filter((i) => i !== item.id) : [...packedItems, item.id];
                      setPackedItems(next);
                      if (typeof window !== "undefined") localStorage.setItem("packed_go_bag_items", JSON.stringify(next));
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs text-left cursor-pointer ${
                      isPacked ? "bg-emerald-50 border-emerald-200 text-[#2D6A4F] font-bold" : "bg-neutral-50 text-neutral-700"
                    }`}
                  >
                    <span>{isAm ? item.labelAm : item.labelEn}</span>
                    <span>{isPacked ? "✓" : "○"}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowGoBagModal(false)}
              className="w-full py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold cursor-pointer"
            >
              {isAm ? "ዝጋ" : "Done"}
            </button>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 text-center space-y-3 shadow-xl animate-in zoom-in-95">
            <h3 className="text-xs font-bold text-[#1F2937]">
              {isAm ? "ለሀኪም ማሳያ QR" : "Clinician Sync QR"}
            </h3>

            <div className="p-3 bg-[#FAF7F2] rounded-2xl border flex items-center justify-center min-h-[140px]">
              {isGeneratingQr ? (
                <Loader2 size={24} className="animate-spin text-[#2D6A4F]" />
              ) : summaryData?.qr_code_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={summaryData.qr_code_url} alt="Doctor QR" className="w-28 h-28 object-contain" />
              ) : (
                <QrCode size={70} className="text-[#1F2937]" />
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold cursor-pointer"
            >
              {isAm ? "ዝጋ" : "Done"}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}