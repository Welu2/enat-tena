// types/api.ts

// =========================================================
// 1. Authentication & Errors
// =========================================================

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
}

export interface ApiErrorResponse {
  detail?: string | { msg: string; loc?: (string | number)[]; type?: string }[];
  message?: string;
}

// =========================================================
// 2. User Profile & Settings (GET /users/me)
// =========================================================

export interface SupplementItem {
  id: string;
  user_id: string;
  name: string;
  active: boolean;
  reminder_enabled: boolean;
  reminder_time: string;
  created_at: string;
}

export interface UserAppointment {
  id: string;
  user_id: string;
  appointment_date: string;
  reminder_lead_days: number;
  last_summary_generated_at: string | null;
}

export interface ReminderNotification {
  id: string;
  user_id: string;
  type: "supplement" | "appointment" | "report_generated";
  message: string;
  due_at: string;
  dismissed: boolean;
  created_at: string;
}


export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  next_appointment_date?: string | null;
  created_at?: string;
  supplements?: Array<any>;
  appointment?: UserAppointment | null;
  pending_reminders?: Array<any>;
}


// =========================================================
// 3. Voice Check-in Intake Workflow
// =========================================================

export type CheckinStage = "symptoms" | "food" | "supplement" | "closing";

export interface CheckinStartResponse {
  session_id: string;
  stage: CheckinStage;
  question_prompt: string;
}


export interface CheckinRespondResponse {
  session_id: string;
  stage: CheckinStage | string;
  transcript: string;
  pending_items: PendingItem[];
}

export interface CompleteStageResponse {
  session_id: string;
  stage_completed: string;
  next_stage: CheckinStage | null;
  question_prompt: string | null;
  session_completed: boolean;
  danger_sign_triggered: boolean;
  check_in_id?: string;
}

// =========================================================
// 4. Check-in History (GET /checkin/history)
// =========================================================

export interface CheckinHistoryItem {
  id: string;
  timestamp: string;
  symptoms: Array<{
    raw_text: string;
    danger_sign: boolean;
    confirmed: boolean;
    severity?: string;
  }>;
  food_log: {
    raw_text: string;
    confirmed: boolean;
  } | null;
  supplement_check: {
    supplement_name: string;
    taken_today: boolean;
    confirmed: boolean;
  } | null;
  closing_mentions?: string[];
  danger_sign_triggered: boolean;
}

// =========================================================
// 5. Clinician Summaries & Reports
// =========================================================

export interface ClinicianSummaryContent {
  danger_signs: Array<
    | {
        raw_text?: string;
        category?: string;
        severity?: string;
        date?: string;
      }
    | string
  >;
  symptoms_summary: Array<{
    date?: string;
    symptom?: string;
    raw_text?: string;
    severity?: string;
  }>;
  food_logs: Array<{
    date?: string;
    raw_text: string;
  }>;
  supplement_adherence: {
    taken_days: number;
    total_reported: number;
    percentage: number;
  };
  patient_questions?: Array<{
    question?: string;
    raw_text?: string;
  }>;
}

export interface ClinicianSummary {
  id: string;
  period_start: string;
  period_end: string;
  generated_at: string;
  content_json: ClinicianSummaryContent;
  share_link_slug: string;
  qr_code_url?: string;
}

export interface CalendarLinkResponse {
  google_calendar_url: string;
  ical_download_url: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: "supplement" | "appointment" | "report_generated";
  message: string;
  due_at: string;
  dismissed: boolean;
  created_at: string;
}
export interface PendingItem {
  item_id: string;
  raw_text: string;
  confirmed: boolean;
  stage?: string;
  category?: string | null;
  category_display?: string | null;
  category_display_en?: string | null;
  verification_phrase?: string | null;
  verification_audio_url?: string | null;
  severity?: string | null;
  danger_sign?: boolean;
  duration?: {
    value: number | null;
    unit: string;
  } | null;
}