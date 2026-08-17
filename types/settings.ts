export interface ToastNotification {
  type: "success" | "error";
  message: string;
}

export interface StoredPreferences {
  reminderTime: string;
  dailyReminder: boolean;
  checkinReminder: boolean;
  appointmentApproaching: boolean;
}