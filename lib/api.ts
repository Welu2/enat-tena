// lib/api.ts

import {
  AuthResponse,
  ApiErrorResponse,
  UserProfile,
  SupplementItem,
  CalendarLinkResponse,
  AppNotification,
  CheckinStartResponse,
  CheckinRespondResponse,
  CompleteStageResponse,
  CheckinHistoryItem,
  ClinicianSummary,
  ClinicianSummaryContent,
} from "@/types/api";

// Re-export types for direct imports
export type {
  ClinicianSummary,
  ClinicianSummaryContent,
  CompleteStageResponse,
  CheckinHistoryItem,
  CalendarLinkResponse,
  AppNotification,
  SupplementItem,
  UserProfile,
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://enat-backend-2jlo.onrender.com";

// =========================================================
// Base API Client Helper
// =========================================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 45-second timeout to handle Render free-tier cold starts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json();

    if (!res.ok) {
      let errorMessage = "An unexpected error occurred.";
      if (typeof data.detail === "string") {
        errorMessage = data.detail;
      } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
        errorMessage = data.detail[0].msg;
      } else if (data.message) {
        errorMessage = data.message;
      }
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Server took too long to respond. The backend might be waking up.");
    }
    throw error;
  }
}

// =========================================================
// 1. Authentication Endpoints
// =========================================================

export async function signupWithFastAPI(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function loginWithFastAPI(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function forgotPassword(email: string): Promise<{ status: string; message: string }> {
  return apiRequest<{ status: string; message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// =========================================================
// 2. User Profile & Settings
// =========================================================

export async function getUserProfile(): Promise<UserProfile> {
  return apiRequest<UserProfile>("/users/me", {
    method: "GET",
  });
}

export interface SupplementPayload {
  name: string;
  active?: boolean;
  reminder_enabled?: boolean;
  reminder_time?: string;
}

export interface OnboardingPayload {
  supplements?: (string | SupplementPayload)[];
  appointmentDate?: string;
  reminderLeadDays?: number;
}

export async function addSupplement(payload: SupplementPayload) {
  return apiRequest("/users/me/supplements", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      active: payload.active ?? true,
      reminder_enabled: payload.reminder_enabled ?? true,
      reminder_time: payload.reminder_time ?? "09:00:00",
    }),
  });
}

export async function updateSupplement(
  supplementId: string,
  payload: { active?: boolean; reminder_enabled?: boolean; reminder_time?: string }
) {
  return apiRequest(`/users/me/supplements/${supplementId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteSupplement(supplementId: string): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/users/me/supplements/${supplementId}`, {
    method: "DELETE",
  });
}

export async function setAppointment(appointmentDate: string, reminderLeadDays: number = 2) {
  try {
    return await apiRequest("/users/me/appointment", {
      method: "POST",
      body: JSON.stringify({
        appointment_date: appointmentDate,
        reminder_lead_days: reminderLeadDays,
      }),
    });
  } catch (err: any) {
    if (err.message?.includes("already exists") || err.message?.includes("409")) {
      return await apiRequest("/users/me/appointment", {
        method: "PUT",
        body: JSON.stringify({
          appointment_date: appointmentDate,
          reminder_lead_days: reminderLeadDays,
        }),
      });
    }
    throw err;
  }
}

export async function deleteAppointment(): Promise<{ status: string }> {
  return apiRequest<{ status: string }>("/users/me/appointment", {
    method: "DELETE",
  });
}

export async function submitOnboardingData(data: OnboardingPayload) {
  const tasks: Promise<any>[] = [];

  if (data.supplements && data.supplements.length > 0) {
    for (const item of data.supplements) {
      const payload: SupplementPayload =
        typeof item === "string"
          ? { name: item, active: true, reminder_enabled: true, reminder_time: "09:00:00" }
          : item;

      tasks.push(addSupplement(payload));
    }
  }

  if (data.appointmentDate) {
    tasks.push(setAppointment(data.appointmentDate, data.reminderLeadDays ?? 2));
  }

  return Promise.all(tasks);
}

// =========================================================
// 3. Calendar & Notifications System
// =========================================================

export async function getAppointmentCalendarLinks(): Promise<CalendarLinkResponse> {
  return apiRequest<CalendarLinkResponse>("/users/me/appointment/calendar-link", {
    method: "GET",
  });
}

export async function getNotifications(): Promise<AppNotification[]> {
  return apiRequest<AppNotification[]>("/notifications", {
    method: "GET",
  });
}

export async function dismissNotification(notificationId: string): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/notifications/${notificationId}/dismiss`, {
    method: "POST",
  });
}

export async function registerPushToken(token: string, platform: string = "web") {
  return apiRequest("/users/me/push-tokens", {
    method: "POST",
    body: JSON.stringify({ token, platform }),
  });
}

// =========================================================
// 4. Voice Check-in Intake Workflow
// =========================================================

export async function startVoiceCheckin(): Promise<CheckinStartResponse> {
  return apiRequest<CheckinStartResponse>("/checkin/start", {
    method: "POST",
  });
}

export async function sendVoiceResponse(
  sessionId: string,
  audioBlob: Blob
): Promise<CheckinRespondResponse> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  const res = await fetch(`${BASE_URL}/checkin/${sessionId}/respond`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData: ApiErrorResponse = await res.json().catch(() => ({}));
    throw new Error(typeof errorData.detail === "string" ? errorData.detail : "Voice processing failed.");
  }

  return res.json();
}

export async function verifyCheckinItem(
  sessionId: string,
  itemId: string,
  confirmed: boolean,
  correctedText?: string
) {
  return apiRequest(`/checkin/${sessionId}/verify`, {
    method: "POST",
    body: JSON.stringify({
      item_id: itemId,
      confirmed,
      ...(correctedText ? { corrected_value: { raw_text: correctedText } } : {}),
    }),
  });
}

export async function completeCheckinStage(sessionId: string): Promise<CompleteStageResponse> {
  return apiRequest<CompleteStageResponse>(`/checkin/${sessionId}/complete`, {
    method: "POST",
  });
}

// =========================================================
// 5. Check-in History
// =========================================================

export async function getCheckinHistory(): Promise<CheckinHistoryItem[]> {
  return apiRequest<CheckinHistoryItem[]>("/checkin/history", {
    method: "GET",
  });
}

export async function getCheckinById(checkinId: string): Promise<CheckinHistoryItem> {
  return apiRequest<CheckinHistoryItem>(`/checkin/history/${checkinId}`, {
    method: "GET",
  });
}

export async function getCheckinDetail(checkinId: string): Promise<CheckinHistoryItem> {
  return apiRequest<CheckinHistoryItem>(`/checkin/history/${checkinId}`);
}

// =========================================================
// 6. Clinician Summaries & Reports
// =========================================================

export async function getLatestSummary(): Promise<ClinicianSummary | null> {
  try {
    const data = await apiRequest<ClinicianSummary>("/summary/latest", {
      method: "GET",
    });

    if (!data) return null;

    if (typeof data.content_json === "string") {
      try {
        data.content_json = JSON.parse(data.content_json);
      } catch (e) {
        console.error("Failed to parse content_json string:", e);
      }
    }

    return data;
  } catch (error: any) {
    if (
      error.message?.includes("404") ||
      error.message?.toLowerCase().includes("not found") ||
      error.message?.toLowerCase().includes("no summary")
    ) {
      return null;
    }
    throw error;
  }
}

export async function generateSummary(): Promise<ClinicianSummary> {
  const data = await apiRequest<ClinicianSummary>("/summary/generate", {
    method: "POST",
  });

  if (typeof data.content_json === "string") {
    try {
      data.content_json = JSON.parse(data.content_json);
    } catch (e) {
      console.error("Failed to parse content_json string:", e);
    }
  }

  return data;
}

export async function checkAutomaticSummary(): Promise<ClinicianSummary | null> {
  try {
    const data = await apiRequest<ClinicianSummary>("/summary/check-automatic", {
      method: "POST",
    });

    if (!data) return null;

    if (typeof data.content_json === "string") {
      try {
        data.content_json = JSON.parse(data.content_json);
      } catch (e) {
        console.error("Failed to parse content_json string:", e);
      }
    }

    return data;
  } catch {
    return null;
  }
}