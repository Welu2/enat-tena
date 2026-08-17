export type SupportedLanguage = "am" | "en";

export function toSupportedLanguage(
  lang?: string | null
): SupportedLanguage {
  return lang === "am" ? "am" : "en";
}

export interface SummaryDuration {
  value: number | null;
  unit: string;
}

export interface SummarySymptomItem {
  date: string;
  symptom?: string | null;
  category?: string | null;
  category_display?: string | null;
  category_display_en?: string | null;
  raw_text: string;
  duration?: SummaryDuration | null;
  severity?: string | null;
}

export type DangerSignItem = SummarySymptomItem;
export type SymptomLogItem = SummarySymptomItem;

export interface SummaryFoodLog {
  date: string;
  raw_text: string;
  food_text?: string | null;
}

export type FoodLogItem = SummaryFoodLog;

export interface SummarySupplementAdherence {
  taken_days: number;
  tracked_days: number;
  total_reported?: number;
  percentage?: number;
}

export type SupplementAdherenceData = SummarySupplementAdherence;

export interface SummaryClosingMention {
  date: string;
  topic?: string | null;
  raw_text: string;
}

export interface SummaryContentJson {
  danger_signs: SummarySymptomItem[];
  general_symptoms: SummarySymptomItem[];
  food_logs: SummaryFoodLog[];
  supplement_adherence: SummarySupplementAdherence | null;
  closing_mentions: SummaryClosingMention[];
  muac_reminder: string;
  provenance_note: string;
}

export type ReportContent = SummaryContentJson;

export interface ClinicianSummary {
  id: string;
  period_start: string;
  period_end: string;
  generated_at: string;
  content_json: SummaryContentJson;
  share_link_slug: string;
  qr_code_url: string;
}