export interface RawSymptom {
  raw_text: string;
  danger_sign: boolean;
  confirmed: boolean;
  severity?: string;
}

export interface RawFoodLog {
  raw_text: string;
  confirmed: boolean;
}

export interface RawSupplementCheck {
  supplement_name: string;
  taken_today: boolean;
  confirmed: boolean;
}

export interface AggregatedSupplement {
  name: string;
  taken: boolean;
}

export interface CheckinHistoryItem {
  id: string;
  timestamp?: string;
  created_at?: string;
  date?: string;
  symptoms: RawSymptom[];
  food_log: RawFoodLog | null;
  supplement_check: RawSupplementCheck | null;
  danger_sign_triggered: boolean;
  closing_mentions?: string[];
}

export interface DailyAggregatedCheckin {
  id: string;
  dateKey: string;
  dateObj: Date;
  symptoms: RawSymptom[];
  foodSummary: string | null;
  supplementName: string;
  supplementTaken: boolean;
  hasDangerSign: boolean;
  checkinCount: number;
}

export interface AggregatedDayDetail {
  id: string;
  dateKey: string;
  dateObj: Date;
  symptoms: RawSymptom[];
  foodLogs: RawFoodLog[];
  supplements: AggregatedSupplement[];
  hasDangerSign: boolean;
  closingMentions: string[];
}