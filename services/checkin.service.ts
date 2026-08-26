import { apiClient } from '@/lib/api-client';
import {
  CheckInHistoryItem,
  CheckInStage,
  CompleteStageResponse,
  PendingItem,
  RespondCheckInResponse,
  StartCheckInResponse,
  VerifyItemPayload,
} from '@/types/api';

export const checkinService = {
  // Pre-recorded prompts
  async getPrompts(): Promise<Record<CheckInStage, string>> {
    return apiClient.get<Record<CheckInStage, string>>('/checkin/prompts');
  },

  getStageAudioUrl(stage: CheckInStage): string {
    return apiClient.getFullUrl(`/checkin/prompts/${stage}/audio`);
  },

  // Start voice intake session
  async startSession(): Promise<StartCheckInResponse> {
    return apiClient.post<StartCheckInResponse>('/checkin/start');
  },

  // Upload recorded voice audio (.webm / .wav)
  async sendVoiceResponse(sessionId: string, audioBlob: Blob): Promise<RespondCheckInResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'response.webm');

    return apiClient.post<RespondCheckInResponse>(`/checkin/${sessionId}/respond`, formData);
  },

  // Verify single item or bulk items
  async verifyItems(
    sessionId: string,
    payload: VerifyItemPayload | { items: VerifyItemPayload[] }
  ): Promise<{ session_id: string; stage: CheckInStage; pending_items: PendingItem[]; confirmed_count?: number }> {
    return apiClient.post(`/checkin/${sessionId}/verify`, payload);
  },

  // Single-item voice correction
  async voiceCorrectItem(
    sessionId: string,
    itemId: string,
    audioBlob: Blob
  ): Promise<{
    session_id: string;
    stage: CheckInStage;
    correction_transcript: string;
    item_updated: boolean;
    pending_items: PendingItem[];
  }> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'correction.webm');

    return apiClient.post(`/checkin/${sessionId}/items/${itemId}/voice-correct`, formData);
  },

  // Complete current stage & advance
  async completeStage(sessionId: string): Promise<CompleteStageResponse> {
    return apiClient.post<CompleteStageResponse>(`/checkin/${sessionId}/complete`);
  },

  // History & Check-in Details
  async getHistory(): Promise<CheckInHistoryItem[]> {
    return apiClient.get<CheckInHistoryItem[]>('/checkin/history');
  },

  async getCheckInDetail(checkinId: string): Promise<CheckInHistoryItem> {
    return apiClient.get<CheckInHistoryItem>(`/checkin/history/${checkinId}`);
  },
};