"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { DetailSectionCard } from "@/components/history/DetailSectionCard";
import { DetailBulletItem } from "@/components/history/DetailBulletItem";
import { getCheckinDetail } from "@/lib/api";
import { CheckinHistoryItem } from "@/types/api";
import { formatSyncedDate } from "@/lib/dateUtils";
import { Loader2, AlertTriangle } from "lucide-react";

export default function CheckinDetailPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const params = useParams();

  // /history/[id]
  const checkinId = params?.id as string;

  const [record, setRecord] = useState<CheckinHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkinId) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadCheckin() {
      try {
        setLoading(true);
        setError(null);

        // Fetch the selected check-in from FastAPI
        const data = await getCheckinDetail(checkinId);

        setRecord(data);
      } catch (err) {
        console.error("Failed to load check-in detail:", err);

        setError(
          lang === "am"
            ? "የምርመራውን ዝርዝር መረጃ መጫን አልተቻለም።"
            : "Could not load check-in details."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCheckin();
  }, [checkinId, router, lang]);

  // ---------------------------------------
  // Loading
  // ---------------------------------------

  if (loading) {
    return (
      <main className="min-h-dvh flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin" />

          <p className="text-xs font-semibold text-brand-subtle">
            {lang === "am"
              ? "ዝርዝሩን በመጫን ላይ..."
              : "Loading check-in..."}
          </p>
        </div>
      </main>
    );
  }

  // ---------------------------------------
  // Error
  // ---------------------------------------

  if (error) {
    return (
      <main className="min-h-dvh px-6 sm:px-7 pt-16 max-w-lg mx-auto">
        <Header />

        <div className="mt-6 p-5 rounded-3xl bg-red-50 border border-red-200 text-center">
          <p className="text-sm font-semibold text-red-700">
            {error}
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

  // ---------------------------------------
  // No record returned
  // ---------------------------------------

  if (!record) {
    return (
      <main className="min-h-dvh px-6 sm:px-7 pt-16 max-w-lg mx-auto">
        <Header />

        <div className="mt-6 p-5 rounded-3xl bg-[#FAF7F2] border border-[#E4DCD0] text-center">
          <p className="text-sm font-semibold text-brand-text">
            {lang === "am"
              ? "የምርመራ መረጃ አልተገኘም።"
              : "No check-in data found."}
          </p>
        </div>
      </main>
    );
  }

  // ---------------------------------------
  // Backend data
  // ---------------------------------------

  const formattedDate = formatSyncedDate(
    new Date(record.timestamp),
    lang
  );

  const hasDangerSign =
    record.danger_sign_triggered ||
    record.symptoms?.some((symptom) => symptom.danger_sign) === true;

  return (
    <main className="flex-1 flex flex-col px-6 sm:px-7 pt-16 pb-8 min-h-dvh select-none font-sans max-w-lg mx-auto w-full">

      {/* Header */}
      <Header />

      <div className="flex-1 space-y-4 pt-2">

        {/* ---------------------------------------
            Title / Date
        --------------------------------------- */}

        <div>
          <h1 className="text-2xl font-extrabold text-brand-text">
            {t.checkinDetailTitle}
          </h1>

          <p className="text-xs text-brand-subtle font-medium mt-0.5">
            {formattedDate.dayName},{" "}
            {formattedDate.dayNum}{" "}
            {formattedDate.month}
          </p>
        </div>

        {/* ---------------------------------------
            Danger Sign
        --------------------------------------- */}

        {hasDangerSign && (
          <div className="flex items-start gap-3 p-4 rounded-3xl bg-red-50 border border-red-200">

            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-red-700">
                {lang === "am"
                  ? "አስቸኳይ ምልክት"
                  : "Danger Sign Detected"}
              </h3>

              <p className="text-xs text-red-600 mt-1 leading-relaxed">
                {lang === "am"
                  ? "በዚህ ምርመራ ወቅት አስቸኳይ ምልክት ተመዝግቧል።"
                  : "A danger sign was detected during this check-in."}
              </p>
            </div>

          </div>
        )}

        {/* ---------------------------------------
            Symptoms
        --------------------------------------- */}

        <DetailSectionCard
          title={t.symptomsSection}
          icon={
            <svg
              className="w-4 h-4 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M22 12h-4l-3 9L9 3l-3 9H2"
              />
            </svg>
          }
        >
          {record.symptoms && record.symptoms.length > 0 ? (
            record.symptoms.map((symptom, index) => (
              <DetailBulletItem
                key={`${symptom.raw_text}-${index}`}
                title={symptom.raw_text}
                subtitle={
                  symptom.confirmed
                    ? lang === "am"
                      ? "ተረጋግጧል"
                      : "Confirmed"
                    : undefined
                }
              />
            ))
          ) : (
            <p className="text-xs text-brand-subtle">
              {lang === "am"
                ? "ምንም ምልክት አልተመዘገበም"
                : "No symptoms recorded."}
            </p>
          )}
        </DetailSectionCard>

        {/* ---------------------------------------
            Food
        --------------------------------------- */}

        <DetailSectionCard
          title={t.foodSection}
          icon={
            <svg
              className="w-4 h-4 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          }
        >
          {record.food_log ? (
            <DetailBulletItem
              title={record.food_log.raw_text}
              subtitle={
                record.food_log.confirmed
                  ? lang === "am"
                    ? "ተረጋግጧል"
                    : "Confirmed"
                  : undefined
              }
            />
          ) : (
            <p className="text-xs text-brand-subtle">
              {lang === "am"
                ? "የምግብ መረጃ አልተመዘገበም"
                : "No food information recorded."}
            </p>
          )}
        </DetailSectionCard>

        {/* ---------------------------------------
            Supplement
        --------------------------------------- */}

        {record.supplement_check && (
          <div className="bg-[#E4ECE7] border border-[#D0DFD6] p-4 rounded-3xl flex items-center gap-3.5 shadow-sm">

            <div className="w-11 h-11 rounded-2xl bg-brand-green text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg
                className="w-5 h-5 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-bold text-brand-text">
                {t.supplementSection}
              </h3>

              <p className="text-xs font-semibold text-brand-green mt-0.5">
                {record.supplement_check.supplement_name}
              </p>

              <p className="text-xs font-medium text-brand-subtle mt-1">
                {record.supplement_check.taken_today
                  ? lang === "am"
                    ? "ዛሬ ተወስዷል"
                    : "Taken today"
                  : lang === "am"
                  ? "ዛሬ አልተወሰደም"
                  : "Not taken today"}
              </p>
            </div>

          </div>
        )}

        {/* ---------------------------------------
            Closing mentions
        --------------------------------------- */}

        {record.closing_mentions &&
          record.closing_mentions.length > 0 && (
            <DetailSectionCard
              title={
                lang === "am"
                  ? "ተጨማሪ መረጃ"
                  : "Additional Notes"
              }
              icon={
                <svg
                  className="w-4 h-4 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h8M8 14h5m-9 6l-1-4V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-6l-5 4z"
                  />
                </svg>
              }
            >
              {record.closing_mentions.map((mention, index) => (
                <DetailBulletItem
                  key={`${mention}-${index}`}
                  title={mention}
                />
              ))}
            </DetailSectionCard>
          )}
      </div>
    </main>
  );
}