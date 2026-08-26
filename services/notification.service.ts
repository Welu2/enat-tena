// src/services/notification.service.ts
import { apiClient } from '@/lib/api-client';
import { AppNotification } from '@/types/api';

export const notificationService = {
  async getActiveNotifications(): Promise<AppNotification[]> {
    return apiClient.get<AppNotification[]>('/notifications');
  },

  async dismissNotification(notificationId: string): Promise<{ status: string }> {
    return apiClient.post<{ status: string }>(`/notifications/${notificationId}/dismiss`);
  },
};