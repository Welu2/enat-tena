import { apiClient } from '@/lib/api-client';
import {
  AncAppointment,
  AncScheduleResponse,
  FoodGroup,
  GestationalAgeCalculation,
  OnboardingPayload,
  Supplement,
  UserProfile,
} from '@/types/api';

export const userService = {
  // Live Gestational Age Preview (without saving)
  async calculateGestationalAge(payload: {
    pregnancy_counting_method: string;
    lnmp_date?: string;
    manual_gestational_weeks?: number;
    manual_gestational_days?: number;
  }): Promise<GestationalAgeCalculation> {
    return apiClient.post<GestationalAgeCalculation>('/users/calculate-gestational-age', payload);
  },

  // Onboarding Form Submission
  async submitOnboarding(payload: OnboardingPayload): Promise<UserProfile> {
    return apiClient.post<UserProfile>('/users/me/onboarding', payload);
  },

  // Full User Profile & Settings
  async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/users/me');
  },

  async updateHospital(hospital: string): Promise<UserProfile> {
    return apiClient.put<UserProfile>('/users/me/hospital', { hospital });
  },

  async updateSettings(settings: {
    appointment?: Partial<AncAppointment>;
    supplements?: Partial<Supplement>[];
  }): Promise<UserProfile> {
    return apiClient.put<UserProfile>('/users/me/settings', settings);
  },

  // Supplement Management
  async addSupplement(supplement: Omit<Supplement, 'id'>): Promise<Supplement> {
    return apiClient.post<Supplement>('/users/me/supplements', supplement);
  },

  async updateSupplement(supplementId: string, supplement: Partial<Supplement>): Promise<Supplement> {
    return apiClient.put<Supplement>(`/users/me/supplements/${supplementId}`, supplement);
  },

  async deleteSupplement(supplementId: string): Promise<{ status: string }> {
    return apiClient.delete<{ status: string }>(`/users/me/supplements/${supplementId}`);
  },

  // Manual Supplement Verification (Skips Stage 3 in voice intake)
  async verifySupplementIntake(payload: {
    supplement_id?: string;
    supplement_name: string;
    taken_today: boolean;
  }): Promise<{ status: string; logged_at: string }> {
    return apiClient.post('/users/me/supplements/verify', payload);
  },

  // Manual 4-Food-Group Logging (Skips Stage 2 in voice intake)
  async verifyFoodLog(payload: {
    food_groups: FoodGroup[];
    raw_text: string;
    items?: string[];
  }): Promise<{ status: string; food_groups: FoodGroup[]; logged_at: string }> {
    return apiClient.post('/users/me/food/verify', payload);
  },

  // ANC Appointment & WHO Schedule
  async setAppointment(appointment: AncAppointment): Promise<AncAppointment> {
    return apiClient.post<AncAppointment>('/users/me/appointment', appointment);
  },

  async deleteAppointment(): Promise<{ status: string }> {
    return apiClient.delete<{ status: string }>('/users/me/appointment');
  },

  async getAncSchedule(): Promise<AncScheduleResponse> {
    return apiClient.get<AncScheduleResponse>('/users/me/anc-schedule');
  },

  async getCalendarLinks(): Promise<{ google_calendar_url: string; ical_download_url: string }> {
    return apiClient.get('/users/me/appointment/calendar-link');
  },

  getICalDownloadUrl(): string {
    return apiClient.getFullUrl('/users/me/appointment/calendar.ics');
  },

  async registerPushToken(token: string, platform: 'web' | 'ios' | 'android' = 'web'): Promise<{ status: string }> {
    return apiClient.post('/users/me/push-tokens', { token, platform });
  },
};