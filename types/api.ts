// ==========================================
// Authentication Types
// ==========================================
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
}

export interface UserCredentials {
  email: string;
  password?: string;
}

export interface ResetPasswordPayload {
  access_token: string;
  new_password: string;
}

// ==========================================
// User & Maternal Profile Types
// ==========================================
export type TrimesterKey = 'first_trimester' | 'second_trimester' | 'third_trimester';
export type PregnancyCountingMethod = 'lnmp' | 'manual' | 'ultrasound';
export type FoodGroup = 'grains' | 'proteins' | 'dairy' | 'fruits_and_vegetables';

export interface TrimesterInfo {
  number: number;
  key: TrimesterKey;
  name_en: string;
  name_am: string;
  week_range: string;
}

export interface GestationalAgeCalculation {
  gestational_age_weeks: number;
  gestational_age_days: number;
  gestational_age_total_days: number;
  formatted_age_am: string;
  formatted_age_en: string;
  trimester: TrimesterKey;
  trimester_info: TrimesterInfo;
  estimated_due_date: string;
  effective_lnmp_date: string;
  is_gestational_age_manual: boolean;
  days_until_edd: number;
}

export interface Supplement {
  id: string;
  user_id?: string;
  name: string;
  active: boolean;
  reminder_enabled: boolean;
  reminder_time: string;
  created_at?: string;
}

export interface AncAppointment {
  id?: string;
  user_id?: string;
  appointment_date: string;
  reminder_lead_days: number;
  anc_contact_number?: number;
  anc_contact_title?: string;
  last_summary_generated_at?: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  age?: number;
  area?: 'urban' | 'rural';
  pregnancy_counting_method: PregnancyCountingMethod;
  lnmp_date?: string | null;
  ultrasound_date?: string | null;
  ultrasound_weeks?: number | null;
  gestational_age_weeks: number;
  gestational_age_days: number;
  is_gestational_age_manual: boolean;
  effective_lnmp_date?: string;
  estimated_due_date: string;
  trimester: TrimesterKey;
  total_pregnancies?: number;
  live_births?: number;
  had_c_section?: boolean;
  child_passed_away?: boolean;
  past_pregnancy_complications?: string[];
  known_medical_conditions?: string[];
  custom_medical_condition?: string | null;
  malaria_endemic_area?: boolean;
  current_medications?: string | null;
  hospital?: string;
  full_name?: string;
  onboarding_completed: boolean;
  current_pregnancy_status: GestationalAgeCalculation;
  supplements: Supplement[];
  appointment?: AncAppointment | null;
  pending_reminders?: PendingReminder[];
}

export interface PendingReminder {
  id: string;
  type: string;
  message: string;
  due_at: string;
}

export interface OnboardingPayload {
  age: number;
  area: 'urban' | 'rural';
  pregnancy_counting_method: PregnancyCountingMethod;
  lnmp_date?: string;
  manual_gestational_weeks?: number;
  manual_gestational_days?: number;
  total_pregnancies?: number;
  live_births?: number;
  had_c_section?: boolean;
  child_passed_away?: boolean;
  past_pregnancy_complications?: string[];
  known_medical_conditions?: string[];
  custom_medical_condition?: string;
  malaria_endemic_area?: boolean;
  current_medications?: string;
  supplements?: string[];
  hospital?: string;
}

export interface AncScheduleContact {
  contact_number: number;
  trimester: TrimesterKey;
  trimester_en?: string;
  trimester_am?: string;
  gestational_weeks: number;
  gestational_label_en?: string;
  gestational_label_am?: string;
  title_en: string;
  title_am: string;
  target_date: string;
  schedule_next_weeks: number | null;
  current_gestational_weeks?: number;
}

export interface AncScheduleResponse {
  current_gestational_age_weeks: number;
  current_gestational_age_days: number;
  effective_lnmp_date: string;
  estimated_due_date: string;
  next_anc_contact: AncScheduleContact;
  all_contacts: AncScheduleContact[];
}

// ==========================================
// Voice Check-in Intake Types
// ==========================================
export type CheckInStage = 'symptoms' | 'food' | 'supplement' | 'closing';

export interface PendingItem {
  item_id: string;
  raw_text: string;
  category?: string | null;
  duration?: {
    value: number | null;
    unit: string;
  };
  severity?: 'mild' | 'moderate' | 'severe';
  danger_sign: boolean;
  confirmed: boolean;
  verification_phrase: string;
  verification_audio_url?: string;
}

export interface StartCheckInResponse {
  session_id: string;
  stage: CheckInStage;
  question_prompt: string;
  question_audio_url: string;
}

export interface RespondCheckInResponse {
  session_id: string;
  stage: CheckInStage;
  transcript: string;
  pending_items: PendingItem[];
}

export interface VerifyItemPayload {
  item_id: string;
  confirmed: boolean;
  corrected_value?: Partial<PendingItem>;
}

export interface CompleteStageResponse {
  session_id: string;
  stage_completed: CheckInStage;
  next_stage: CheckInStage | null;
  question_prompt: string | null;
  question_audio_url?: string | null;
  session_completed: boolean;
  danger_sign_triggered: boolean;
  summary_text_am?: string;
  summary_text_en?: string;
  check_in_id?: string;
}

export interface ClosingMention {
  raw_text: string;
  topic?: string | null;
}

export interface CheckInHistoryItem {
  id: string;
  timestamp: string;
  symptoms: PendingItem[];
  food_log: { raw_text: string; confirmed: boolean; food_groups?: FoodGroup[] };
  supplement_check: { supplement_name: string; taken_today: boolean; confirmed: boolean };
  closing_mentions: ClosingMention[];
  danger_sign_triggered: boolean;
  summary_text_am: string;
  summary_text_en: string;
}

// ==========================================
// Clinician Summary & Notification Types
// ==========================================
export interface ClinicianSummaryResponse {
  id: string;
  period_start: string;
  period_end: string;
  generated_at: string;
  anc_contact_number: number;
  anc_contact_title: string;
  anc_contact_title_am: string;
  target_gestational_weeks: number;
  content_json: SummaryContentJsonApi;
  share_link_slug: string;
  qr_code_url: string;
}

export interface SummaryDangerSign {
  date: string;
  raw_text: string;
  severity?: string;
  category?: string | null;
  category_display?: string | null;
  category_display_en?: string | null;
  duration?: { value: number | null; unit: string };
}

export interface SummarySymptom {
  date: string;
  raw_text: string;
  severity?: string;
  category?: string | null;
  category_display?: string | null;
}

export interface SummaryFoodLog {
  date: string;
  raw_text: string;
  food_groups?: FoodGroup[];
}

export interface AncContactInfo {
  contact_number: number;
  title_en: string;
  title_am: string;
  target_gestational_weeks: number;
}

export interface SummaryContentJsonApi {
  anc_contact: AncContactInfo;
  danger_signs: SummaryDangerSign[];
  recorded_symptoms: SummarySymptom[];
  food_logs: SummaryFoodLog[];
  nutritional_variation: {
    total_items_classified: number;
    tracked_days: number;
    percentages: Record<FoodGroup, number>;
  };
  supplement_adherence: {
    taken_days: number;
    tracked_days: number;
    total_days_in_period: number;
    percentage: number;
  };
  closing_mentions: ClosingMention[];
  muac_reminder: string;
  provenance_note: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: 'supplement' | 'report_generated' | 'appointment';
  message: string;
  due_at: string;
  dismissed: boolean;
  created_at: string;
}