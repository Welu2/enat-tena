import { CheckInStage, PendingItem } from "@/types/api";

export type { CheckInStage, PendingItem };


export const STAGE_STEP_MAP: Record<string, 1 | 2 | 3 | 4> = {
  symptoms: 1,
  food: 2,
  supplement: 3,
  supplements: 3,
  supplement_check: 3,
  closing: 4,
};

export const STAGE_SEQUENCE: CheckInStage[] = [
  "symptoms",
  "food",
  "supplement",
  "closing",
];

export function normalizeStage(raw?: string | null): CheckInStage {
  const norm = raw?.toLowerCase().trim();
  if (
    norm === "supplement" ||
    norm === "supplements" ||
    norm === "supplement_check"
  ) {
    return "supplement";
  }
  if (norm === "food") return "food";
  if (norm === "closing") return "closing";
  return "symptoms";
}

export function getForcedNextStage(
  current: CheckInStage,
  serverNext?: string | null
): CheckInStage | null {
  if (current === "food" && serverNext === "closing") {
    return "supplement";
  }
  if (serverNext) {
    const norm = normalizeStage(serverNext);
    if (norm !== current) return norm;
  }
  const idx = STAGE_SEQUENCE.indexOf(current);
  if (idx >= 0 && idx < STAGE_SEQUENCE.length - 1) {
    return STAGE_SEQUENCE[idx + 1];
  }
  return null;
}