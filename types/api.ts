// =============================================================================
// Enat Tena — API Type Definitions (FastAPI/Pydantic-compatible)
// =============================================================================

// ---------------------------------------------------------------------------
// Generic API Wrappers
// ---------------------------------------------------------------------------

/** Standard FastAPI validation error shape (422) */
export interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

/** FastAPI 422 response body */
export interface ValidationErrorResponse {
  detail: ValidationErrorDetail[];
}

/** FastAPI generic error response */
export interface ApiErrorResponse {
  detail: string;
}

/** Custom error class for API errors */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: ApiErrorResponse | ValidationErrorResponse
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Paginated list response wrapper */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface LoginRequest {
  phone_number: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  phone_number: string;
  password: string;
}

export interface ForgotPasswordRequest {
  phone_number: string;
}

export interface AuthUser {
  id: string;
  phone_number: string;
  full_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface ForgotPasswordResponse {
  message: string;
}

// ---------------------------------------------------------------------------
// Onboarding / User Profile
// ---------------------------------------------------------------------------

export interface OnboardingPayload {
  taking_supplements: boolean;
  supplements: string[];
  appointment_date: string | null;
  mic_permission_granted: boolean;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone_number: string;
  taking_supplements: boolean;
  supplements: string[];
  next_appointment_date: string | null;
  mic_permission_granted: boolean;
  onboarding_completed: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Check-in
// ---------------------------------------------------------------------------

export interface CheckinSymptom {
  name: string;
  duration?: string;
}

export interface CheckinFood {
  name: string;
  details?: string;
}

export interface CheckinSubmission {
  symptoms: CheckinSymptom[];
  foods: CheckinFood[];
  supplement_taken: boolean;
  supplement_names?: string[];
  overall_feeling: string;
  notes?: string;
}

export interface CheckinRecord {
  id: string;
  date: string;
  symptoms: CheckinSymptom[];
  foods: CheckinFood[];
  supplement_taken: boolean;
  supplement_names: string[];
  overall_feeling: string;
  notes?: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Health Report
// ---------------------------------------------------------------------------

export interface SymptomLogEntry {
  date: string;
  symptom: string;
}

export interface FoodLogEntry {
  date: string;
  food: string;
}

export interface SupplementAdherence {
  types: string[];
  days_taken: number;
  total_days: number;
  ratio: string;
}

export interface HealthReport {
  patient_name: string;
  period_start: string;
  period_end: string;
  danger_signs_detected: boolean;
  danger_signs: string[];
  supplement_adherence: SupplementAdherence;
  symptoms_log: SymptomLogEntry[];
  food_log: FoodLogEntry[];
  no_symptoms_days: number;
  generated_at: string;
  next_appointment: string | null;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export interface SupplementItem {
  id: number;
  name: string;
}

export interface UserSettings {
  supplements: SupplementItem[];
  reminder_time: string;
  appointment_date: string;
  daily_reminder_enabled: boolean;
  checkin_reminder_enabled: boolean;
  appointment_reminder_enabled: boolean;
}
