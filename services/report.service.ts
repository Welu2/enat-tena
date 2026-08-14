// =============================================================================
// Report Service — health report
// =============================================================================

import { apiClient, withMock } from "@/lib/api-client";
import { mockHealthReport } from "@/lib/mock-data";
import type { HealthReport } from "@/types/api";

export const reportService = {
  async getHealthReport(): Promise<HealthReport> {
    return withMock(mockHealthReport, () =>
      apiClient.get<HealthReport>("/reports/health-summary")
    );
  },
};
