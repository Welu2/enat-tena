import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SupplementItem } from "@/types/api";
import {
  getUserProfile,
  addSupplement,
  updateSupplement,
  deleteSupplement,
  setAppointment,
} from "@/lib/api";

function parseStoredPreferences() {
  return {
    time: localStorage.getItem("reminder_time") || "08:00:00",
    daily: localStorage.getItem("pref_daily_reminder") !== "false",
    checkin: localStorage.getItem("pref_checkin_reminder") !== "false",
    appt: localStorage.getItem("pref_appt_approaching") !== "false",
  };
}

export function useUserSettings(
  notify: (msg: string, type?: "success" | "error") => void,
  language: string
) {
  const router = useRouter();
  const getTodayString = () => new Date().toISOString().split('T')[0];
  const [patientName, setPatientName] = useState<string>("");
  const [patientEmail, setPatientEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reminderTime, setReminderTime] = useState<string>("08:00:00");
  const [appointmentDate, setAppointmentDate] = useState<string>(getTodayString());
  const [supplements, setSupplements] = useState<SupplementItem[]>([]);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [checkinReminder, setCheckinReminder] = useState(true);
  const [apptApproaching, setApptApproaching] = useState(true);

  const loadPreferences = useCallback(() => {
    const prefs = parseStoredPreferences();
    setReminderTime(prefs.time);
    setDailyReminder(prefs.daily);
    setCheckinReminder(prefs.checkin);
    setApptApproaching(prefs.appt);
  }, []);

  const syncProfileData = useCallback(async () => {
    try {
      const profile = await getUserProfile();
      if (profile.email) setPatientEmail(profile.email);
      if (profile.full_name) setPatientName(profile.full_name);
      setSupplements(profile.supplements || []);
      const date = profile.appointment?.appointment_date ||
        profile.next_appointment_date;
      if (date) setAppointmentDate(date);
    } catch (err) {
      const errorMsg = language === "am"
        ? "መረጃዎችን መጫን አልተቻለም።"
        : "Could not load settings.";
      notify(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  }, [language, notify]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    loadPreferences();
    syncProfileData();
  }, [router, loadPreferences, syncProfileData]);

  const handleAddSupplement = async (name: string) => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await addSupplement({
        name: name.trim(),
        active: true,
        reminder_enabled: dailyReminder,
        reminder_time: reminderTime,
      });
      const updated = await getUserProfile();
      setSupplements(updated.supplements || []);
      notify(language === "am" ? "ተጨማሪ ተመዝግቧል!" : "Supplement added!");
    } catch {
      notify(
        language === "am" ? "ማስቀመጥ አልተሳካም።" : "Failed to add.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSupplement = async (id: string) => {
    try {
      await deleteSupplement(id);
      setSupplements((prev) => prev.filter((item) => item.id !== id));
      notify(language === "am" ? "ተወግዷል።" : "Supplement removed.");
    } catch {
      notify(
        language === "am" ? "ማስወገድ አልተቻለም።" : "Failed to remove.",
        "error"
      );
    }
  };

  const handleAppointmentChange = async (newDate: string) => {
    if (!newDate) return;
    setAppointmentDate(newDate);
    try {
      await setAppointment(newDate, 2);
      localStorage.setItem("appointment_date", newDate);
      notify(language === "am" ? "ቀጠሮ ተቀይሯል!" : "Appointment updated!");
    } catch {
      notify(
        language === "am" ? "ቀጠሮ መቀየር አልተቻለም።" : "Update failed.",
        "error"
      );
    }
  };

  const handleReminderToggle = async () => {
    const nextState = !dailyReminder;
    setDailyReminder(nextState);
    localStorage.setItem("pref_daily_reminder", String(nextState));
    const active = supplements.filter((item) => item.active);
    await Promise.all(
      active.map((s) =>
        updateSupplement(s.id, {
          reminder_enabled: nextState,
          reminder_time: reminderTime,
        })
      )
    );
  };

  const handleTimeChange = async (timeValue: string) => {
    if (!timeValue) return;
    const formatted = timeValue.length === 5 ? `${timeValue}:00` : timeValue;
    setReminderTime(formatted);
    localStorage.setItem("reminder_time", formatted);
    const active = supplements.filter((item) => item.active);
    await Promise.all(
      active.map((s) =>
        updateSupplement(s.id, {
          reminder_time: formatted,
          reminder_enabled: dailyReminder,
        })
      )
    );
  };

  const toggleCheckin = () => {
    const nextVal = !checkinReminder;
    setCheckinReminder(nextVal);
    localStorage.setItem("pref_checkin_reminder", String(nextVal));
  };

  const toggleApptApproaching = () => {
    const nextVal = !apptApproaching;
    setApptApproaching(nextVal);
    localStorage.setItem("pref_appt_approaching", String(nextVal));
  };

  return {
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
  };
}