// src/services/summary.service.ts
import { apiClient } from '@/lib/api-client';
import { ClinicianSummaryResponse } from '@/types/api';

/** Validates that a share slug contains only safe URL path characters */
function validateSlug(slug: string): string {
  const sanitized = slug.trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
    throw new Error('Invalid share link slug');
  }
  return sanitized;
}

export const summaryService = {
  async generateSummary(): Promise<ClinicianSummaryResponse> {
    return apiClient.post<ClinicianSummaryResponse>('/summary/generate');
  },

  async checkAutomaticSummary(): Promise<ClinicianSummaryResponse | { status: string; message: string }> {
    return apiClient.post('/summary/check-automatic');
  },

  async getLatestSummary(): Promise<ClinicianSummaryResponse> {
    return apiClient.get<ClinicianSummaryResponse>('/summary/latest');
  },

  async getPublicSummary(shareSlug: string): Promise<ClinicianSummaryResponse> {
    const safeSlug = validateSlug(shareSlug);
    return apiClient.get<ClinicianSummaryResponse>(`/summary/public/${safeSlug}`);
  },
};