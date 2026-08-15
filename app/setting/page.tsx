"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import {
  getUserProfile,
  addSupplement,
  updateSupplement,
  deleteSupplement,
  setAppointment,
  getAppointmentCalendarLinks,
} from "@/lib/api";
import { SupplementItem } from "@/types/api";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Pill,
  Bell,
  Calendar,
  Clock,
  Plus,
  Trash2,
  LogOut,
  ExternalLink,
  Download,
} from "lucide-react";

interface ToastNotification {
  type: "success" | "error";
  message: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const dateInputRef = useRef<HTMLInputElement>(null);

  // User Profile State
  const [patientName, setPatientName] = useState<string>("ሳራ ተካ");
  const [patientEmail, setPatientEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Time and Date State
  const [reminderTime, setReminderTime] = useState<string>("08:00:00");
  const [appointmentDate, setAppointmentDate] = useState<string>("2026-08-20");

  // Supplements State
  const [supplements, setSupplements] = useState<SupplementItem[]>([]);
  const [newSupplement, setNewSupplement] = useState("");

  // Notification Preferences State (Persisted in localStorage + Backend)
  const [dailyReminder, setDailyReminder] = useState(true);
  const [checkinReminder, setCheckinReminder] = useState(true);
  const [apptApproaching, setApptApproaching] = useState(true);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Initial Load: Restore LocalStorage Preferences + Fetch Backend Profile
  const loadSettings = useCallback(async () => {
    try {
      // 1A. Restore client-side saved preferences first
      const savedTime = localStorage.getItem("reminder_time");
      if (savedTime) setReminderTime(savedTime);

      const savedDailyReminder = localStorage.getItem("pref_daily_reminder");
      if (savedDailyReminder !== null) {
        setDailyReminder(savedDailyReminder === "true");
      }

      const savedCheckinPref = localStorage.getItem("pref_checkin_reminder");
      if (savedCheckinPref !== null) {
        setCheckinReminder(savedCheckinPref === "true");
      }

      const savedApptPref = localStorage.getItem("pref_appt_approaching");
      if (savedApptPref !== null) {
        setApptApproaching(savedApptPref === "true");
      }

      // 1B. Fetch profile from backend
      const profile = await getUserProfile();

      if (profile.email) setPatientEmail(profile.email);
      if (profile.full_name) setPatientName(profile.full_name);

      // Normalize supplements list
      const suppList = (profile.supplements || []).map((s: any, idx: number) => {
        if (typeof s === "string") {
          return {
            id: `supp_${idx}`,
            name: s,
            active: true,
            reminder_enabled: true,
            reminder_time: savedTime || "08:00:00",
          };
        }
        return s;
      });
      setSupplements(suppList);

      // Sync appointment date
      if (profile.appointment?.appointment_date) {
        setAppointmentDate(profile.appointment.appointment_date);
        localStorage.setItem("appointment_date", profile.appointment.appointment_date);
      } else if (profile.next_appointment_date) {
        setAppointmentDate(profile.next_appointment_date);
        localStorage.setItem("appointment_date", profile.next_appointment_date);
      }

      // Sync active supplement reminder time and toggle
      const activeSupp = suppList.find((s: SupplementItem) => s.active);
      if (activeSupp) {
        if (activeSupp.reminder_enabled !== undefined) {
          setDailyReminder(activeSupp.reminder_enabled);
          localStorage.setItem("pref_daily_reminder", String(activeSupp.reminder_enabled));
        }
        if (activeSupp.reminder_time) {
          setReminderTime(activeSupp.reminder_time);
          localStorage.setItem("reminder_time", activeSupp.reminder_time);
        }
      }
    } catch (err: unknown) {
      console.error("Failed to load user settings:", err);
      showToast(
        lang === "am" ? "መረጃዎችን መጫን አልተቻለም።" : "Could not load settings.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    const cachedName = localStorage.getItem("user_name");
    if (cachedName) setPatientName(cachedName);

    loadSettings();
  }, [router, loadSettings]);

  // 2. Add Supplement (POST /users/me/supplements)
  const handleAddSupplement = async () => {
    if (!newSupplement.trim()) return;
    setIsSaving(true);

    try {
      await addSupplement({
        name: newSupplement.trim(),
        active: true,
        reminder_enabled: dailyReminder,
        reminder_time: reminderTime,
      });

      // Refresh list from backend
      const updatedProfile = await getUserProfile();
      setSupplements(updatedProfile.supplements || []);
      setNewSupplement("");
      showToast(
        lang === "am" ? "ተጨማሪ መድሃኒት ተመዝግቧል!" : "Supplement added!"
      );
    } catch (err: unknown) {
      console.error("Failed to add supplement:", err);
      showToast(
        lang === "am" ? "መድሃኒቱን ማስቀመጥ አልተሳካም።" : "Failed to add supplement.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Remove Supplement (DELETE /users/me/supplements/{id})
  const handleRemoveSupplement = async (id: string) => {
    try {
      await deleteSupplement(id);
      setSupplements((prev) => prev.filter((item) => item.id !== id));
      showToast(
        lang === "am" ? "ተጨማሪ መድሃኒት ተወግዷል።" : "Supplement removed."
      );
    } catch (err: unknown) {
      console.error("Failed to delete supplement:", err);
      try {
        await updateSupplement(id, { active: false });
        setSupplements((prev) => prev.filter((item) => item.id !== id));
        showToast(
          lang === "am" ? "ተጨማሪ መድሃኒት ተወግዷል።" : "Supplement removed."
        );
      } catch {
        showToast(
          lang === "am" ? "ማስወገድ አልተቻለም።" : "Failed to remove supplement.",
          "error"
        );
      }
    }
  };

  // 4. Update ANC Appointment Date (POST/PUT /users/me/appointment)
  const handleAppointmentChange = async (newDate: string) => {
    if (!newDate) return;
    setAppointmentDate(newDate);

    try {
      await setAppointment(newDate, 2);
      localStorage.setItem("appointment_date", newDate);
      showToast(
        lang === "am"
          ? "የቀጠሮ ቀን በተሳካ ሁኔታ ተቀይሯል!"
          : "Appointment date updated!"
      );
    } catch (err: unknown) {
      console.error("Failed to update appointment:", err);
      showToast(
        lang === "am" ? "ቀጠሮውን መቀየር አልተቻለም።" : "Failed to update appointment.",
        "error"
      );
    }
  };

  // 5. Calendar Exports (1-Tap Google & iCal)
  const handleAddToGoogleCalendar = async () => {
    try {
      const data = await getAppointmentCalendarLinks();
      if (data?.google_calendar_url) {
        window.open(data.google_calendar_url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Failed to get Google Calendar URL:", err);
      showToast(
        lang === "am" ? "የጉግል ካሌንደር ሊንክ ማግኘት አልተቻለም።" : "Could not generate Google Calendar link.",
        "error"
      );
    }
  };

  const handleDownloadICal = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://enat-backend-2jlo.onrender.com";
    const link = document.createElement("a");
    link.href = `${baseUrl}/users/me/appointment/calendar.ics`;
    link.setAttribute("download", "appointment.ics");
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 6. Update Daily Supplement Reminder Toggle
  const handleReminderToggle = async () => {
    const nextState = !dailyReminder;
    setDailyReminder(nextState);
    localStorage.setItem("pref_daily_reminder", String(nextState));

    try {
      const activeSupps = supplements.filter((s) => s.active);
      if (activeSupps.length > 0) {
        await Promise.all(
          activeSupps.map((supp) =>
            updateSupplement(supp.id, {
              reminder_enabled: nextState,
              reminder_time: reminderTime,
            })
          )
        );
      }
      showToast(
        lang === "am" ? "የማስታወሻ ቅንብር ተቀይሯል!" : "Reminder settings updated!"
      );
    } catch (err) {
      console.error("Failed to update reminder toggle on backend:", err);
    }
  };

  // 7. Update Reminder Time (Persisted locally + synced to backend)
  const handleTimeChange = async (newTimeStr: string) => {
    if (!newTimeStr) return;

    const formatted = newTimeStr.length === 5 ? `${newTimeStr}:00` : newTimeStr;
    setReminderTime(formatted);
    localStorage.setItem("reminder_time", formatted);

    try {
      const activeSupps = supplements.filter((s) => s.active);
      if (activeSupps.length > 0) {
        await Promise.all(
          activeSupps.map((supp) =>
            updateSupplement(supp.id, {
              reminder_time: formatted,
              reminder_enabled: dailyReminder,
            })
          )
        );
      }
      showToast(
        lang === "am" ? "የማስታወሻ ሰዓት ተቀይሯል!" : "Reminder time updated!"
      );
    } catch (err) {
      console.error("Failed to update reminder time on backend:", err);
    }
  };

  // 8. Toggle and Persist Preference Flags
  const handleToggleCheckinReminder = () => {
    const nextVal = !checkinReminder;
    setCheckinReminder(nextVal);
    localStorage.setItem("pref_checkin_reminder", String(nextVal));
  };

  const handleToggleApptApproaching = () => {
    const nextVal = !apptApproaching;
    setApptApproaching(nextVal);
    localStorage.setItem("pref_appt_approaching", String(nextVal));
  };

  const handleOpenDatePicker = () => {
    if (dateInputRef.current) {
      if ("showPicker" in HTMLInputElement.prototype) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  // 9. Sign Out
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    localStorage.removeItem("appointment_date");
    router.replace("/login");
  };

  return (
    <div className="flex-1 flex flex-col justify-between min-h-dvh pb-20 md:pb-8 select-none font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-in slide-in-from-top-4 duration-300">
          <div
            className={`p-4 rounded-2xl border shadow-lg flex items-center gap-3 backdrop-blur-md ${
              toast.type === "success"
                ? "bg-[#F0F7F3]/95 border-[#C8E1D3] text-brand-green"
                : "bg-[#FDF2F2]/95 border-[#F5C6C6] text-red-700"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} className="flex-shrink-0 text-brand-green" />
            ) : (
              <AlertCircle size={18} className="flex-shrink-0 text-red-600" />
            )}
            <p className="text-xs font-semibold leading-snug">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Top Header & User Identity */}
      <div className="relative pt-16 px-6 sm:px-7">
        <Header />

        <div className="flex items-center gap-3.5 mt-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-green text-white font-bold text-base flex items-center justify-center shadow-xs uppercase">
            {patientName.charAt(0) || (lang === "am" ? "ሳ" : "S")}
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-text">{patientName}</h2>
            <p className="text-xs text-brand-subtle">
              {patientEmail || (lang === "am" ? "የተጠቃሚ መለያ" : "Enat Care User")}
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Body */}
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
            {/* SECTION 1: SUPPLEMENTS */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">
                {t?.supplementsSection || (lang === "am" ? "ተጨማሪ መድሃኒቶች" : "Supplements")}
              </p>
              <div className="bg-[#FAF7F2] border border-[#E4DCD0] rounded-3xl divide-y divide-[#EDE5DA] overflow-hidden shadow-xs">
                {supplements
                  .filter((s) => s.active !== false)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#E2ECE6] text-brand-green flex items-center justify-center">
                          <Pill size={16} />
                        </div>
                        <span className="text-xs font-bold text-brand-text">
                          {item.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSupplement(item.id)}
                        className="w-7 h-7 rounded-lg bg-[#EFE9DF] text-[#7A7062] hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                        title="Remove supplement"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                {/* Add New Supplement Input */}
                <div className="p-2.5 pl-3.5 flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={newSupplement}
                    disabled={isSaving}
                    onChange={(e) => setNewSupplement(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSupplement();
                      }
                    }}
                    placeholder={t?.addNewSupplement || (lang === "am" ? "አዲስ መድሃኒት ይጨምሩ..." : "Add new supplement...")}
                    className="bg-transparent text-xs text-brand-text placeholder-[#A3998C] focus:outline-none flex-1"
                  />
                  <button
                    type="button"
                    disabled={isSaving || !newSupplement.trim()}
                    onClick={handleAddSupplement}
                    className="w-8 h-8 rounded-xl bg-brand-green text-white flex items-center justify-center hover:bg-brand-green-hover active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 2: SUPPLEMENT REMINDER */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">
                {t?.supplementReminderSection || (lang === "am" ? "የመድሃኒት ማስታወሻ" : "Supplement Reminders")}
              </p>
              <div className="bg-[#FAF7F2] border border-[#E4DCD0] rounded-3xl divide-y divide-[#EDE5DA] overflow-hidden shadow-xs">
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#E2ECE6] text-brand-green flex items-center justify-center">
                      <Bell size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-brand-text">
                        {t?.dailyReminder || (lang === "am" ? "ዕለታዊ ማስታወሻ" : "Daily Reminder")}
                      </h4>
                      <p className="text-[11px] text-brand-subtle">
                        {t?.dailyReminderSub || (lang === "am" ? "በየቀኑ መድሃኒት እንዲወስዱ ያስታውሳል" : "Get daily notification to take supplements")}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleReminderToggle}
                    className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                      dailyReminder ? "bg-brand-green" : "bg-[#DDD5C7]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                        dailyReminder ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Editable Time Row */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#E2ECE6] text-brand-green flex items-center justify-center">
                      <Clock size={16} />
                    </div>
                    <span className="text-xs font-bold text-brand-text">
                      {t?.timeLabel || (lang === "am" ? "የማስታወሻ ሰዓት" : "Reminder Time")}
                    </span>
                  </div>
                  <input
                    type="time"
                    value={reminderTime.slice(0, 5)}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="bg-transparent text-xs font-bold text-brand-green cursor-pointer focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: ANC APPOINTMENT & CALENDAR SYNC */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">
                {t?.appointmentSection || (lang === "am" ? "የቀጠሮ መረጃ" : "ANC Appointment")}
              </p>
              <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#E2ECE6] text-brand-green flex items-center justify-center">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-brand-text">
                        {t?.appointmentDateLabel || (lang === "am" ? "የቀጣይ ቀጠሮ ቀን" : "Appointment Date")}
                      </h4>
                      <input
                        ref={dateInputRef}
                        type="date"
                        value={appointmentDate}
                        onChange={(e) => handleAppointmentChange(e.target.value)}
                        className="text-[11px] text-brand-subtle bg-transparent focus:outline-none cursor-pointer block mt-0.5 font-medium"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenDatePicker}
                    className="px-3 py-1 bg-[#EBE5DA] hover:bg-[#DDD5C7] text-brand-text text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    {t?.edit || (lang === "am" ? "ቀይር" : "Edit")}
                  </button>
                </div>

                {/* 1-Tap Calendar Export Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#EDE5DA]">
                  <button
                    type="button"
                    onClick={handleAddToGoogleCalendar}
                    className="py-2.5 px-3 rounded-xl bg-white border border-[#E4DCD0] text-brand-text text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#F5EFE6] transition-all cursor-pointer"
                  >
                    <ExternalLink size={13} className="text-brand-green" />
                    <span>Google Calendar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadICal}
                    className="py-2.5 px-3 rounded-xl bg-white border border-[#E4DCD0] text-brand-text text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#F5EFE6] transition-all cursor-pointer"
                  >
                    <Download size={13} className="text-brand-green" />
                    <span>iCal / Apple (.ics)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 4: NOTIFICATION PREFERENCES */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">
                {t?.notificationsSection || (lang === "am" ? "የማሳወቂያ ምርጫዎች" : "Notification Preferences")}
              </p>
              <div className="bg-[#FAF7F2] border border-[#E4DCD0] rounded-3xl divide-y divide-[#EDE5DA] overflow-hidden shadow-xs">
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#E2ECE6] text-brand-green flex items-center justify-center">
                      <Bell size={16} />
                    </div>
                    <h4 className="text-xs font-bold text-brand-text">
                      {t?.dailyCheckinReminder || (lang === "am" ? "የዕለታዊ ምርመራ ማስታወሻ" : "Daily Check-in Reminder")}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleCheckinReminder}
                    className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                      checkinReminder ? "bg-brand-green" : "bg-[#DDD5C7]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                        checkinReminder ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#E2ECE6] text-brand-green flex items-center justify-center">
                      <Bell size={16} />
                    </div>
                    <h4 className="text-xs font-bold text-brand-text">
                      {t?.appointmentApproaching || (lang === "am" ? "የቀጠሮ መቃረብ ማስታወቂያ" : "Appointment Approaching Alerts")}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleApptApproaching}
                    className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                      apptApproaching ? "bg-brand-green" : "bg-[#DDD5C7]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                        apptApproaching ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 5: ACCOUNT & LOGOUT */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">
                {t?.accountSection || (lang === "am" ? "መለያ" : "Account")}
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl flex items-center gap-3 text-[#963838] hover:bg-[#FDF2F2] transition-colors shadow-xs active:scale-[0.99] cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#F8EEEE] flex items-center justify-center">
                  <LogOut size={16} />
                </div>
                <span className="text-xs font-bold">{t?.logOut || (lang === "am" ? "ውጣ" : "Log Out")}</span>
              </button>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}