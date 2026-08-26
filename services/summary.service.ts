// src/services/summary.service.ts
import { apiClient } from '@/lib/api-client';
import { ClinicianSummaryResponse } from '@/types/api';

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
    return apiClient.get<ClinicianSummaryResponse>(`/summary/public/${shareSlug}`);
  },
};