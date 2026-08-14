// =============================================================================
// Check-in Service — submit, history
// =============================================================================

import { apiClient, withMock } from "@/lib/api-client";
import { mockCheckinHistory } from "@/lib/mock-data";
import type { CheckinSubmission, CheckinRecord } from "@/types/api";

export const checkinService = {
  async submitCheckin(payload: CheckinSubmission): Promise<CheckinRecord> {
    const mockRecord: CheckinRecord = {
      id: `chk_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      symptoms: payload.symptoms,
      foods: payload.foods,
      supplement_taken: payload.supplement_taken,
      supplement_names: payload.supplement_names ?? [],
      overall_feeling: payload.overall_feeling,
      notes: payload.notes,
      created_at: new Date().toISOString(),
    };

    return withMock(mockRecord, () =>
      apiClient.post<CheckinRecord>("/checkins", payload)
    );
  },

  async getCheckinHistory(): Promise<CheckinRecord[]> {
    return withMock(mockCheckinHistory, () =>
      apiClient.get<CheckinRecord[]>("/checkins")
    );
  },

  async getTodayCheckin(): Promise<CheckinRecord | null> {
    const today = new Date().toISOString().split("T")[0];
    const todayRecord =
      mockCheckinHistory.find((r) => r.date === today) ?? null;

    return withMock(todayRecord, () =>
      apiClient.get<CheckinRecord | null>(`/checkins/today`)
    );
  },
};
