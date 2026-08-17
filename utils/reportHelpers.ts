import {
  ClinicianSummary,
  SummaryContentJson,
  SummarySupplementAdherence,
  toSupportedLanguage,
} from "@/types/report";
import { formatSyncedDate } from "@/lib/dateUtils";

export function parseContentJson(
  summaryData?: ClinicianSummary | null
): SummaryContentJson | undefined {
  if (!summaryData?.content_json) return undefined;
  if (typeof summaryData.content_json === "string") {
    try {
      return JSON.parse(summaryData.content_json);
    } catch {
      return undefined;
    }
  }
  return summaryData.content_json;
}

function extractEmailPrefix(email?: string | null): string | null {
  if (!email || !email.includes("@")) return null;
  const prefix = email.split("@")[0];
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

export function resolvePatientDisplayName(
  profileName?: string | null,
  cachedName?: string | null,
  profileEmail?: string | null,
  cachedEmail?: string | null,
  fallback: string = "Unknown"
): string {
  if (profileName?.trim()) return profileName.trim();
  if (cachedName?.trim()) return cachedName.trim();
  const fromProfileEmail = extractEmailPrefix(profileEmail);
  if (fromProfileEmail) return fromProfileEmail;
  const fromCachedEmail = extractEmailPrefix(cachedEmail);
  if (fromCachedEmail) return fromCachedEmail;
  return fallback;
}

export function extractAllReportDates(
  content?: SummaryContentJson
): string[] {
  if (!content) return [];
  const dates: string[] = [];
  content.danger_signs?.forEach((d) => d.date && dates.push(d.date));
  content.general_symptoms?.forEach((s) => s.date && dates.push(s.date));
  content.food_logs?.forEach((f) => f.date && dates.push(f.date));
  content.closing_mentions?.forEach((m) => m.date && dates.push(m.date));
  return Array.from(new Set(dates)).sort();
}

export function formatSummaryPeriod(
  startDate?: string,
  endDate?: string,
  content?: SummaryContentJson,
  lang: string = "en",
  fallback: string = "Recent"
): string {
  const contentDates = extractAllReportDates(content);
  const actualStart =
    contentDates.length > 0 ? contentDates[0] : startDate;
  const actualEnd =
    contentDates.length > 0
      ? contentDates[contentDates.length - 1]
      : endDate;

  if (!actualStart || !actualEnd) return fallback;
  const validLang = toSupportedLanguage(lang);
  try {
    const s = formatSyncedDate(new Date(actualStart), validLang);
    const e = formatSyncedDate(new Date(actualEnd), validLang);
    return `${s.month} ${s.dayNum} – ${e.month} ${e.dayNum}`;
  } catch {
    return `${actualStart} – ${actualEnd}`;
  }
}

export function buildDoctorShareUrl(shareSlug?: string): string {
  if (!shareSlug) return "";
  const fallbackOrigin = "https://enat-tena.onrender.com";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return `${siteUrl}/summary/public/${shareSlug}`;
  if (typeof window !== "undefined" && window.location?.origin) {
    const isLocal = window.location.origin.includes("localhost");
    const origin = isLocal ? fallbackOrigin : window.location.origin;
    return `${origin}/summary/public/${shareSlug}`;
  }
  return `${fallbackOrigin}/summary/public/${shareSlug}`;
}

export function formatLogEntryDate(
  dateStr?: string,
  lang: string = "en"
): string {
  if (!dateStr) return lang === "am" ? "የቅርብ" : "Recent";
  const validLang = toSupportedLanguage(lang);
  try {
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return dateStr;
    const formatted = formatSyncedDate(parsed, validLang);
    return `${formatted.month} ${formatted.dayNum}`;
  } catch {
    return dateStr;
  }
}

export function getSafeAdherencePercentage(
  adherence?:
    | (SummarySupplementAdherence & { total_reported?: number })
    | null
): number {
  if (!adherence) return 0;
  if (
    typeof adherence.percentage === "number" &&
    !Number.isNaN(adherence.percentage)
  ) {
    return Math.min(100, Math.max(0, Math.round(adherence.percentage)));
  }
  const total = adherence.tracked_days ?? adherence.total_reported ?? 0;
  const taken = adherence.taken_days ?? 0;
  if (total <= 0) return 0;
  const calculated = (taken / total) * 100;
  return Math.min(100, Math.max(0, Math.round(calculated)));
}