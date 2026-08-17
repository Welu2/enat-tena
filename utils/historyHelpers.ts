import { DailyAggregatedCheckin } from "@/types/history";

// Option 1: Total distinct days with actual check-in cards
export function getRecordedDaysCount(
  records: DailyAggregatedCheckin[]
): number {
  return records.length;
}

// Option 2: Calendar span from the earliest check-in to today
export function getDaySpanFromFirstRecord(
  records: DailyAggregatedCheckin[]
): number {
  if (!records || records.length === 0) return 0;

  const timestamps = records.map((r) => r.dateObj.getTime());
  const earliest = new Date(Math.min(...timestamps));
  earliest.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - earliest.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  return Math.max(diffDays, 1);
}
export function getMentionDisplay(
  mention: string | { raw_text?: string | null; topic?: string | null }
): string {
  if (typeof mention === "string") return mention;
  return mention?.raw_text || mention?.topic || "";
}