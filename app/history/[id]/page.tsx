"use client";

import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { formatSyncedDate } from "@/lib/dateUtils";
import { toSupportedLanguage } from "@/types/report";
import { useAggregatedCheckinDetail } from "@/hooks/useAggregatedCheckinDetail";
import { DetailDangerAlert } from "@/components/history/DetailDangerAlert";
import { DetailSymptomsCard } from "@/components/history/DetailSymptomsCard";
import { DetailFoodCard } from "@/components/history/DetailFoodCard";
import { DetailSupplementCard } from "@/components/history/DetailSupplementCard";
import { DetailSectionCard } from "@/components/history/DetailSectionCard";
import { DetailBulletItem } from "@/components/history/DetailBulletItem";
import { Loader2, MessageSquare } from "lucide-react";

export default function CheckinDetailPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const checkinId = params?.id as string;

  const { detail, isLoading, error } = useAggregatedCheckinDetail(
    checkinId,
    lang
  );

  if (isLoading) {
    return (
      <main className="min-h-dvh flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
          <p className="text-xs font-semibold text-brand-subtle">
            {lang === "am" ? "ዝርዝሩን በመጫን ላይ..." : "Loading check-in..."}
          </p>
        </div>
      </main>
    );
  }

  if (error || !detail) {
    return (
      <main className="min-h-dvh px-6 sm:px-7 pt-16 max-w-lg mx-auto">
        <Header />
        <div className="mt-6 p-5 rounded-3xl bg-red-50 border border-red-200 text-center">
          <p className="text-sm font-semibold text-red-700">
            {error || (lang === "am" ? "መረጃ አልተገኘም" : "No record found.")}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-5 py-2.5 rounded-2xl bg-brand-green text-white text-xs font-bold"
          >
            {lang === "am" ? "ተመለስ" : "Go Back"}
          </button>
        </div>
      </main>
    );
  }

  const validLang = toSupportedLanguage(lang);
  const formattedDate = formatSyncedDate(detail.dateObj, validLang);

  return (
    <main className="flex-1 flex flex-col px-6 sm:px-7 pt-16 pb-8 min-h-dvh select-none font-sans max-w-lg mx-auto w-full">
      <Header />
      <div className="flex-1 space-y-4 pt-2">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text">
            {t.checkinDetailTitle}
          </h1>
          <p className="text-xs text-brand-subtle font-medium mt-0.5">
            {formattedDate.dayName}, {formattedDate.dayNum} {formattedDate.month}
          </p>
        </div>

        {detail.hasDangerSign && <DetailDangerAlert language={lang} />}

        <DetailSymptomsCard
          title={t.symptomsSection}
          symptoms={detail.symptoms}
          language={lang}
        />

        <DetailFoodCard
          title={t.foodSection}
          foodLogs={detail.foodLogs}
          language={lang}
        />

        <DetailSupplementCard
          sectionTitle={t.supplementSection}
          supplements={detail.supplements}
          language={lang}
        />

        {detail.closingMentions && detail.closingMentions.length > 0 && (
          <DetailSectionCard
            title={lang === "am" ? "ተጨማሪ መረጃ" : "Additional Notes"}
            icon={<MessageSquare className="w-4 h-4 stroke-current" />}
          >
            {detail.closingMentions.map((mention, index) => {
              const mentionText =
                typeof mention === "string"
                  ? mention
                  : (mention as { raw_text?: string; topic?: string })?.raw_text ||
                    (mention as { raw_text?: string; topic?: string })?.topic ||
                    "";

              if (!mentionText.trim()) return null;

              return (
                <DetailBulletItem
                  key={`mention-${index}-${mentionText}`}
                  title={mentionText}
                />
              );
            })}
          </DetailSectionCard>
        )}
      </div>
    </main>
  );
}