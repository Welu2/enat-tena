"use client";

import { useLanguage } from "@/context/LanguageContext";
import { BottomNav } from "@/components/BottomNav";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useUserSettings } from "@/hooks/useUserSettings";
import { ToastAlert } from "@/components/settings/ToastAlert";
import { ProfileHeader } from "@/components/settings/ProfileHeader";
import { SupplementSection } from "@/components/settings/SupplementSection";
import { ReminderSection } from "@/components/settings/ReminderSection";
import { AppointmentSection } from "@/components/settings/AppointmentSection";
import {
  NotificationPreferencesSection,
} from "@/components/settings/NotificationPreferencesSection";
import { LogoutSection } from "@/components/settings/LogoutSection";

export default function SettingsPage() {
  const { t, lang } = useLanguage();
  const { toast, showToast } = useToast();
  const {
    patientName,
    patientEmail,
    isLoading,
    isSaving,
    reminderTime,
    appointmentDate,
    supplements,
    dailyReminder,
    checkinReminder,
    apptApproaching,
    handleAddSupplement,
    handleRemoveSupplement,
    handleAppointmentChange,
    handleReminderToggle,
    handleTimeChange,
    toggleCheckin,
    toggleApptApproaching,
  } = useUserSettings(showToast, lang);

  return (
    <div className="flex-1 flex flex-col justify-between min-h-dvh pb-20 md:pb-8 select-none font-sans">
      <ToastAlert notification={toast} />

      <ProfileHeader
        patientName={patientName}
        patientEmail={patientEmail}
        language={lang}
      />

      <main className="flex-1 px-6 sm:px-7 py-4 space-y-5 overflow-y-auto">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
            <p className="text-xs font-semibold text-brand-subtle">
              {lang === "am" ? "ቅንብሮችን በመጫን ላይ..." : "Loading settings..."}
            </p>
          </div>
        ) : (
          <>
            <SupplementSection
              title={
                t?.supplementsSection ||
                (lang === "am" ? "ተጨማሪ መድሃኒቶች" : "Supplements")
              }
              placeholderText={
                t?.addNewSupplement ||
                (lang === "am"
                  ? "አዲስ መድሃኒት ይጨምሩ..."
                  : "Add new supplement...")
              }
              supplements={supplements}
              isSaving={isSaving}
              onAdd={handleAddSupplement}
              onRemove={handleRemoveSupplement}
            />

            <ReminderSection
              title={
                t?.supplementReminderSection ||
                (lang === "am" ? "የመድሃኒት ማስታወሻ" : "Supplement Reminders")
              }
              reminderLabel={
                t?.dailyReminder ||
                (lang === "am" ? "ዕለታዊ ማስታወሻ" : "Daily Reminder")
              }
              reminderSubtext={
                t?.dailyReminderSub ||
                (lang === "am"
                  ? "በየቀኑ መድሃኒት እንዲወስዱ ያስታውሳል"
                  : "Get daily notification to take supplements")
              }
              timeLabel={
                t?.timeLabel ||
                (lang === "am" ? "የማስታወሻ ሰዓት" : "Reminder Time")
              }
              dailyReminder={dailyReminder}
              reminderTime={reminderTime}
              onToggleReminder={handleReminderToggle}
              onTimeChange={handleTimeChange}
            />

            <AppointmentSection
              title={
                t?.appointmentSection ||
                (lang === "am" ? "የቀጠሮ መረጃ" : "ANC Appointment")
              }
              dateLabel={
                t?.appointmentDateLabel ||
                (lang === "am" ? "የቀጣይ ቀጠሮ ቀን" : "Appointment Date")
              }
              editLabel={t?.edit || (lang === "am" ? "ቀይር" : "Edit")}
              appointmentDate={appointmentDate}
              language={lang}
              onDateChange={handleAppointmentChange}
              onError={(msg) => showToast(msg, "error")}
            />

            <NotificationPreferencesSection
              title={
                t?.notificationsSection ||
                (lang === "am"
                  ? "የማሳወቂያ ምርጫዎች"
                  : "Notification Preferences")
              }
              checkinLabel={
                t?.dailyCheckinReminder ||
                (lang === "am"
                  ? "የዕለታዊ ምርመራ ማስታወሻ"
                  : "Daily Check-in Reminder")
              }
              approachingLabel={
                t?.appointmentApproaching ||
                (lang === "am"
                  ? "የቀጠሮ መቃረብ ማስታወቂያ"
                  : "Appointment Approaching Alerts")
              }
              checkinReminder={checkinReminder}
              apptApproaching={apptApproaching}
              onToggleCheckin={toggleCheckin}
              onToggleApproaching={toggleApptApproaching}
            />

            <LogoutSection
              title={
                t?.accountSection ||
                (lang === "am" ? "መለያ" : "Account")
              }
              logoutLabel={
                t?.logOut || (lang === "am" ? "ውጣ" : "Log Out")
              }
            />
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}