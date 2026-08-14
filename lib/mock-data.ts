// =============================================================================
// Enat Tena — Mock Data (used when NEXT_PUBLIC_ENABLE_MOCKS=true)
// =============================================================================

import type {
  AuthResponse,
  ForgotPasswordResponse,
  UserProfile,
  CheckinRecord,
  HealthReport,
  UserSettings,
} from "@/types/api";

// ---------------------------------------------------------------------------
// Auth Mocks
// ---------------------------------------------------------------------------

export const mockAuthResponse: AuthResponse = {
  access_token: "mock-jwt-token-enat-tena-2026",
  token_type: "bearer",
  user: {
    id: "usr_mock_001",
    phone_number: "0912345678",
    full_name: "Sara Teka",
  },
};

export const mockForgotPasswordResponse: ForgotPasswordResponse = {
  message: "Reset code sent to your phone number.",
};

// ---------------------------------------------------------------------------
// User / Onboarding Mocks
// ---------------------------------------------------------------------------

export const mockUserProfile: UserProfile = {
  id: "usr_mock_001",
  full_name: "Sara Teka",
  phone_number: "0912345678",
  taking_supplements: true,
  supplements: ["Iron", "Folic Acid"],
  next_appointment_date: "2026-09-04",
  mic_permission_granted: true,
  onboarding_completed: true,
  created_at: "2026-08-01T10:00:00Z",
};

// ---------------------------------------------------------------------------
// Check-in Mocks
// ---------------------------------------------------------------------------

export const mockCheckinHistory: CheckinRecord[] = [
  {
    id: "chk_001",
    date: "2026-08-12",
    symptoms: [{ name: "Swelling", duration: "2 days" }],
    foods: [
      { name: "እንጀራ ከ ክክ ፍጥፍጥ ጋር" },
      { name: "ፍራፍሬ" },
    ],
    supplement_taken: true,
    supplement_names: ["Iron", "Folic Acid"],
    overall_feeling: "Good",
    created_at: "2026-08-12T09:30:00Z",
  },
  {
    id: "chk_002",
    date: "2026-08-11",
    symptoms: [],
    foods: [
      { name: "ዳቦ ከ አቮካዶ ጋር" },
      { name: "አትክልት ሾርባ" },
    ],
    supplement_taken: true,
    supplement_names: ["Iron", "Folic Acid"],
    overall_feeling: "Great",
    created_at: "2026-08-11T08:45:00Z",
  },
  {
    id: "chk_003",
    date: "2026-08-10",
    symptoms: [{ name: "Mild headache" }],
    foods: [{ name: "እንጀራ ከ ምስር ጋር" }],
    supplement_taken: false,
    supplement_names: [],
    overall_feeling: "Okay",
    created_at: "2026-08-10T10:15:00Z",
  },
  {
    id: "chk_004",
    date: "2026-08-09",
    symptoms: [
      { name: "Fatigue" },
      { name: "Face swelling" },
    ],
    foods: [
      { name: "እንጀራ ከ ቅቤ ጋር" },
      { name: "ወጥ" },
    ],
    supplement_taken: true,
    supplement_names: ["Iron"],
    overall_feeling: "Tired",
    created_at: "2026-08-09T09:00:00Z",
  },
  {
    id: "chk_005",
    date: "2026-08-08",
    symptoms: [],
    foods: [{ name: "እንጀራ ከ አልጫ ወጥ ጋር" }],
    supplement_taken: true,
    supplement_names: ["Iron", "Folic Acid"],
    overall_feeling: "Good",
    created_at: "2026-08-08T11:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Report Mocks
// ---------------------------------------------------------------------------

export const mockHealthReport: HealthReport = {
  patient_name: "Sara Teka",
  period_start: "2026-08-08",
  period_end: "2026-08-14",
  danger_signs_detected: false,
  danger_signs: [],
  supplement_adherence: {
    types: ["Iron", "Folic Acid"],
    days_taken: 4,
    total_days: 5,
    ratio: "4/5 days",
  },
  symptoms_log: [
    { date: "2026-08-12", symptom: "Swelling" },
    { date: "2026-08-10", symptom: "Mild headache" },
    { date: "2026-08-09", symptom: "Fatigue, Face swelling" },
  ],
  food_log: [
    { date: "2026-08-12", food: "እንጀራ ከ ክክ ፍጥፍጥ ጋር, ፍራፍሬ" },
    { date: "2026-08-11", food: "ዳቦ ከ አቮካዶ ጋር, አትክልት ሾርባ" },
    { date: "2026-08-10", food: "እንጀራ ከ ምስር ጋር" },
    { date: "2026-08-09", food: "እንጀራ ከ ቅቤ ጋር, ወጥ" },
  ],
  no_symptoms_days: 2,
  generated_at: "2026-08-14T12:00:00Z",
  next_appointment: "2026-09-04",
};

// ---------------------------------------------------------------------------
// Settings Mocks
// ---------------------------------------------------------------------------

export const mockUserSettings: UserSettings = {
  supplements: [
    { id: 1, name: "ብረት / Iron" },
    { id: 2, name: "ፎሊክ አሲድ / Folic Acid" },
  ],
  reminder_time: "08:00",
  appointment_date: "2026-09-04",
  daily_reminder_enabled: true,
  checkin_reminder_enabled: true,
  appointment_reminder_enabled: true,
};
