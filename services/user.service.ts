// =============================================================================
// User Service — onboarding, profile
// =============================================================================

import { apiClient, withMock } from "@/lib/api-client";
import { mockUserProfile } from "@/lib/mock-data";
import type { OnboardingPayload, UserProfile } from "@/types/api";

export const userService = {
  async submitOnboarding(payload: OnboardingPayload): Promise<UserProfile> {
    return withMock(mockUserProfile, () =>
      apiClient.post<UserProfile>("/user/onboarding", payload)
    );
  },

  async getProfile(): Promise<UserProfile> {
    return withMock(mockUserProfile, () =>
      apiClient.get<UserProfile>("/user/profile")
    );
  },

  async updateProfile(
    data: Partial<Pick<UserProfile, "full_name" | "supplements" | "next_appointment_date">>
  ): Promise<UserProfile> {
    return withMock({ ...mockUserProfile, ...data }, () =>
      apiClient.patch<UserProfile>("/user/profile", data)
    );
  },
};
