import {
  CheckinHistoryItem,
  DailyAggregatedCheckin,
  AggregatedDayDetail,
  AggregatedSupplement,
  RawSymptom,
  RawFoodLog,
  RawSupplementCheck,
} from "@/types/history";

export function parseRecordDate(record: CheckinHistoryItem): Date {
  const raw = record.timestamp || record.created_at || record.date;
  if (!raw) return new Date();
  if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mergeSymptoms(
  existing: RawSymptom[],
  incoming: RawSymptom[]
): RawSymptom[] {
  const combined = [...existing];
  for (const item of incoming) {
    const exists = combined.some(
      (s) => s.raw_text.toLowerCase() === item.raw_text.toLowerCase()
    );
    if (!exists) combined.push(item);
  }
  return combined;
}

function mergeFoodLogs(
  existing: RawFoodLog[],
  incoming: RawFoodLog | null
): RawFoodLog[] {
  if (!incoming || !incoming.raw_text?.trim()) return existing;
  const combined = [...existing];
  const exists = combined.some(
    (f) => f.raw_text.toLowerCase() === incoming.raw_text.toLowerCase()
  );
  if (!exists) combined.push(incoming);
  return combined;
}

function mergeSupplements(
  existing: AggregatedSupplement[],
  incoming: RawSupplementCheck | null
): AggregatedSupplement[] {
  if (!incoming || !incoming.supplement_name?.trim()) return existing;
  const list = [...existing];
  const index = list.findIndex(
    (s) =>
      s.name.toLowerCase() === incoming.supplement_name.toLowerCase()
  );
  if (index >= 0) {
    list[index].taken = list[index].taken || incoming.taken_today;
  } else {
    list.push({
      name: incoming.supplement_name,
      taken: incoming.taken_today,
    });
  }
  return list;
}

export function aggregateDailyCheckins(
  records: CheckinHistoryItem[]
): DailyAggregatedCheckin[] {
  const groupMap = new Map<string, DailyAggregatedCheckin>();

  for (const item of records) {
    const dateObj = parseRecordDate(item);
    const key = getDateKey(dateObj);
    const isDanger =
      item.danger_sign_triggered ||
      item.symptoms?.some((s) => s.danger_sign);
    const tookSupp = Boolean(item.supplement_check?.taken_today);
    const suppName = item.supplement_check?.supplement_name || "";

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        id: item.id,
        dateKey: key,
        dateObj,
        symptoms: item.symptoms || [],
        foodSummary: item.food_log?.raw_text || null,
        supplementName: suppName,
        supplementTaken: tookSupp,
        hasDangerSign: Boolean(isDanger),
        checkinCount: 1,
      });
      continue;
    }

    const current = groupMap.get(key)!;
    current.symptoms = mergeSymptoms(current.symptoms, item.symptoms || []);
    current.supplementTaken = current.supplementTaken || tookSupp;
    if (!current.supplementName && suppName) {
      current.supplementName = suppName;
    }
    current.hasDangerSign = current.hasDangerSign || Boolean(isDanger);
    if (!current.foodSummary && item.food_log?.raw_text) {
      current.foodSummary = item.food_log.raw_text;
    }
    current.checkinCount += 1;
  }

  return Array.from(groupMap.values()).sort(
    (a, b) => b.dateObj.getTime() - a.dateObj.getTime()
  );
}

function updateDayDetail(
  current: AggregatedDayDetail,
  item: CheckinHistoryItem,
  isDanger: boolean
): void {
  current.symptoms = mergeSymptoms(current.symptoms, item.symptoms || []);
  current.foodLogs = mergeFoodLogs(current.foodLogs, item.food_log);
  current.supplements = mergeSupplements(
    current.supplements,
    item.supplement_check
  );
  current.hasDangerSign = current.hasDangerSign || isDanger;
  if (item.closing_mentions?.length) {
    current.closingMentions = [
      ...current.closingMentions,
      ...item.closing_mentions,
    ];
  }
}

export function aggregateDayRecords(
  records: CheckinHistoryItem[]
): AggregatedDayDetail[] {
  const dayMap = new Map<string, AggregatedDayDetail>();

  for (const item of records) {
    const dateObj = parseRecordDate(item);
    const key = getDateKey(dateObj);
    const isDanger = Boolean(
      item.danger_sign_triggered ||
        item.symptoms?.some((s) => s.danger_sign)
    );

    if (!dayMap.has(key)) {
      dayMap.set(key, {
        id: item.id,
        dateKey: key,
        dateObj,
        symptoms: item.symptoms || [],
        foodLogs: mergeFoodLogs([], item.food_log),
        supplements: mergeSupplements([], item.supplement_check),
        hasDangerSign: isDanger,
        closingMentions: item.closing_mentions || [],
      });
      continue;
    }

    updateDayDetail(dayMap.get(key)!, item, isDanger);
  }

  return Array.from(dayMap.values()).sort(
    (a, b) => b.dateObj.getTime() - a.dateObj.getTime()
  );
}