"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { UserProfile, Supplement } from "@/types/api";
import {
  Pill,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ChevronRight,
  Building2,
  Loader2,
  Clock,
  ExternalLink,
  Edit2,
  Save,
  X,
} from "lucide-react";

interface ToastNotification {
  type: "success" | "error";
  message: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const isAm = lang === "am";

  // Real Backend Data State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [hospital, setHospital] = useState<string>("");

  // Loading & Async Action States
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAppt, setIsSavingAppt] = useState(false);
  const [isEditingHospital, setIsEditingHospital] = useState(false);
  const [isSavingHospital, setIsSavingHospital] = useState(false);
  const [tempHospital, setTempHospital] = useState("");

  // Add Supplement Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSuppName, setNewSuppName] = useState("");
  const [newSuppTime, setNewSuppTime] = useState("09:00:00");
  const [isAddingSupp, setIsAddingSupp] = useState(false);

  // Calendar Link States
  const [calendarLinks, setCalendarLinks] = useState<{
    google_calendar_url: string;
    ical_download_url: string;
  } | null>(null);

  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // =========================================================
  // 1. Fetch Live User Profile & Settings (GET /users/me)
  // =========================================================
  const loadUserSettings = useCallback(async () => {
    try {
      const userProfile = await userService.getProfile();
      setProfile(userProfile);
      setSupplements(userProfile.supplements || []);
      setHospital(userProfile.hospital || "");
      setTempHospital(userProfile.hospital || "");

      if (userProfile.appointment?.appointment_date) {
        setAppointmentDate(userProfile.appointment.appointment_date);
      }

      // Fetch calendar sync links if appointment is set
      if (userProfile.appointment) {
        userService
          .getCalendarLinks()
          .then((links) => setCalendarLinks(links))
          .catch(() => setCalendarLinks(null));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load user profile";
      showNotification(msg, "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserSettings();
  }, [loadUserSettings]);

  // =========================================================
  // 2. Supplement CRUD Handlers
  // =========================================================
  const handleAddSupplement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuppName.trim()) return;

    setIsAddingSupp(true);
    try {
      const created = await userService.addSupplement({
        name: newSuppName.trim().toLowerCase(),
        active: true,
        reminder_enabled: true,
        reminder_time: newSuppTime.includes(":") && newSuppTime.split(":").length === 2
          ? `${newSuppTime}:00`
          : newSuppTime,
      });

      setSupplements((prev) => [...prev, created]);
      setNewSuppName("");
      setNewSuppTime("09:00:00");
      setShowAddModal(false);
      showNotification(isAm ? "አዲስ ማሟያ ተጨምሯል!" : "Supplement added successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add supplement";
      showNotification(msg, "error");
    } finally {
      setIsAddingSupp(false);
    }
  };

  const handleToggleSupplementActive = async (supplement: Supplement) => {
    const nextActive = !supplement.active;

    // Optimistic Update
    setSupplements((prev) =>
      prev.map((s) => (s.id === supplement.id ? { ...s, active: nextActive } : s))
    );

    try {
      await userService.updateSupplement(supplement.id, {
        active: nextActive,
        reminder_enabled: nextActive,
      });
    } catch {
      // Rollback
      setSupplements((prev) =>
        prev.map((s) => (s.id === supplement.id ? { ...s, active: !nextActive } : s))
      );
      showNotification(isAm ? "ማስተካከል አልተቻለም" : "Failed to update supplement", "error");
    }
  };

  const handleRemoveSupplement = async (id: string) => {
    const previous = [...supplements];
    setSupplements((prev) => prev.filter((s) => s.id !== id));

    try {
      await userService.deleteSupplement(id);
      showNotification(isAm ? "ማሟያው ተሰርዟል" : "Supplement deleted");
    } catch {
      setSupplements(previous);
      showNotification(isAm ? "ማሟያውን መሰረዝ አልተቻለም" : "Failed to delete supplement", "error");
    }
  };

  // =========================================================
  // 3. Update ANC Appointment (POST /users/me/appointment)
  // =========================================================
  const handleSaveAppointment = async (dateStr: string) => {
    setAppointmentDate(dateStr);
    if (!dateStr) return;

    setIsSavingAppt(true);
    try {
      await userService.setAppointment({
        appointment_date: dateStr,
        reminder_lead_days: 2,
      });
      showNotification(isAm ? "የቀጠሮ ቀን ተቀይሯል!" : "Appointment updated successfully!");

      const links = await userService.getCalendarLinks().catch(() => null);
      setCalendarLinks(links);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update appointment";
      showNotification(msg, "error");
    } finally {
      setIsSavingAppt(false);
    }
  };

  // =========================================================
  // 4. Update Preferred Hospital (PUT /users/me/hospital)
  // =========================================================
  const handleSaveHospital = async () => {
    if (!tempHospital.trim()) return;

    setIsSavingHospital(true);
    try {
      const updated = await userService.updateHospital(tempHospital.trim());
      setHospital(updated.hospital || tempHospital.trim());
      setIsEditingHospital(false);
      showNotification(isAm ? "የጤና ተቋም ተቀይሯል!" : "Facility updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update hospital";
      showNotification(msg, "error");
    } finally {
      setIsSavingHospital(false);
    }
  };

  // =========================================================
  // 5. Account & Auth
  // =========================================================
  const handleLogout = () => {
    authService.logOut();
    router.replace("/login");
  };

  // Calculate days away from appointment
  const calculateDaysAway = (targetDateStr: string) => {
    if (!targetDateStr) return null;
    const diffTime = new Date(targetDateStr).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const daysAway = calculateDaysAway(appointmentDate);

  const userName =
    (typeof window !== "undefined" && localStorage.getItem("user_name")) ||
    profile?.email.split("@")[0] ||
    "Mother";

  const gaWeeks = profile?.current_pregnancy_status?.gestational_age_weeks ?? profile?.gestational_age_weeks ?? 0;
  const gaDays = profile?.current_pregnancy_status?.gestational_age_days ?? profile?.gestational_age_days ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-dvh max-w-md mx-auto w-full flex flex-col justify-center items-center p-6 bg-[#FAF7F2] text-[#2C2723]">
        <Loader2 size={30} className="animate-spin text-[#2D6A4F] mb-2" />
        <p className="text-xs font-semibold text-[#7A7165]">
          {isAm ? "ቅንብሮችን በማዘጋጀት ላይ..." : "Loading settings..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full bg-[#FAF7F2] text-[#2C2723] flex justify-center">
      <div className="w-full max-w-md flex flex-col justify-between pb-24 font-sans select-none min-h-dvh">
        {/* Floating Toast Notification */}
        {toast && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-in slide-in-from-top-4 duration-300">
            <div
              className={`p-3.5 rounded-2xl border shadow-lg flex items-center gap-3 backdrop-blur-md ${
                toast.type === "success"
                  ? "bg-[#F0F7F3]/95 border-[#C8E1D3] text-[#2D6A4F]"
                  : "bg-[#FDF2F2]/95 border-[#F5C6C6] text-red-700"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={16} className="flex-shrink-0 text-[#2D6A4F]" />
              ) : (
                <AlertCircle size={16} className="flex-shrink-0 text-red-600" />
              )}
              <p className="text-xs font-semibold leading-snug">{toast.message}</p>
            </div>
          </div>
        )}

        {/* Top Header */}
        <header className="px-5 pt-4 pb-2 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] tracking-tight">
              {isAm ? "ቅንብሮች" : "Settings"}
            </h1>
            <p className="text-xs text-[#6B7280] font-medium mt-0.5">
              {isAm ? "የህክምና መረጃ እና ማስታወሻዎች" : "Personal profile & clinical preferences"}
            </p>
          </div>
          <Header />
        </header>

        {/* Main Settings Body */}
        <main className="flex-1 px-4 sm:px-5 py-2 space-y-3.5 overflow-y-auto">
          {/* 1. Maternal Profile Header Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0 uppercase">
                {userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-[#1F2937] truncate">{userName}</h2>
                  <span className="text-[10px] font-semibold bg-[#E8F5E9] text-[#2D6A4F] px-2 py-0.5 rounded-full whitespace-nowrap">
                    {isAm ? `${gaWeeks} ሳምንት + ${gaDays}d` : `Week ${gaWeeks} + ${gaDays}d`}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5 truncate">{profile?.email}</p>
              </div>
            </div>

            {/* Hospital Preference */}
            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 size={15} className="text-[#2D6A4F]" />
                  <span className="text-xs font-bold text-[#1F2937]">
                    {isAm ? "የተመረጠ የጤና ተቋም" : "Preferred Facility"}
                  </span>
                </div>
                {!isEditingHospital && (
                  <button
                    type="button"
                    onClick={() => setIsEditingHospital(true)}
                    className="text-[11px] font-bold text-[#2D6A4F] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Edit2 size={11} />
                    <span>{isAm ? "ቀይር" : "Edit"}</span>
                  </button>
                )}
              </div>

              {isEditingHospital ? (
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={tempHospital}
                    onChange={(e) => setTempHospital(e.target.value)}
                    placeholder="e.g. St. Paul Hospital MMC"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#2D6A4F] text-xs font-medium text-[#1F2937] focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    disabled={isSavingHospital}
                    onClick={handleSaveHospital}
                    className="px-3 py-1.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {isSavingHospital ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    <span>{isAm ? "አስቀምጥ" : "Save"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempHospital(hospital);
                      setIsEditingHospital(false);
                    }}
                    className="p-1.5 rounded-xl bg-neutral-200 text-neutral-600 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[#4B5563] font-medium">
                  {hospital || (isAm ? "ተቋም አልተመረጠም" : "Facility not specified")}
                </p>
              )}
            </div>
          </div>

          {/* 2. Prescribed Supplements Management */}
          <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#2D6A4F] flex items-center justify-center">
                  <Pill size={15} />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-[#1F2937]">
                    {isAm ? "የቅድመ ወሊድ ማሟያዎች (Supplements)" : "Active Supplements"}
                  </h3>
                  <p className="text-[10px] text-[#6B7280]">
                    {isAm ? "ዕለታዊ የIFA እና ካልሲየም ማስታወሻዎች" : "Daily IFA & Micronutrient alarms"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="w-7 h-7 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center hover:bg-[#1E4D38] transition-colors cursor-pointer"
                title="Add Supplement"
              >
                <Plus size={15} />
              </button>
            </div>

            <div className="space-y-1.5 pt-0.5">
              {supplements.length === 0 ? (
                <p className="text-xs text-gray-400 py-2 text-center">
                  {isAm ? "ምንም የተመዘገበ ማሟያ የለም" : "No supplements registered"}
                </p>
              ) : (
                supplements.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleSupplementActive(s)}
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                          s.active ? "bg-[#2D6A4F] text-white" : "border-2 border-gray-300 bg-white"
                        }`}
                      >
                        {s.active && <CheckCircle2 size={12} />}
                      </button>
                      <div>
                        <p
                          className={`text-xs font-bold capitalize ${
                            s.active ? "text-[#1F2937]" : "text-gray-400 line-through"
                          }`}
                        >
                          {s.name}
                        </p>
                        <p className="text-[10px] text-[#6B7280]">
                          {s.reminder_enabled ? `Alarm: ${s.reminder_time}` : "Protocol Active"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSupplement(s.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. Next ANC Appointment Scheduler & Calendar Sync */}
          <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar size={15} />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-[#1F2937]">
                    {isAm ? "የቀጣይ የቅድመ ወሊድ ክትትል ቀን" : "Next ANC Contact Date"}
                  </h3>
                  <p className="text-[10px] text-[#6B7280]">
                    {isAm ? "የክሊኒክ ቀጠሮዎን ያስተካክሉ" : "Sync clinic consultation schedule"}
                  </p>
                </div>
              </div>

              {isSavingAppt && <Loader2 size={14} className="animate-spin text-blue-600" />}
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => handleSaveAppointment(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs font-bold text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              />
              {daysAway !== null && (
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-2 rounded-xl border border-blue-100 whitespace-nowrap">
                  {daysAway >= 0
                    ? isAm
                      ? `${daysAway} ቀናት ይቀራሉ`
                      : `In ${daysAway} days`
                    : isAm
                    ? "ቀኑ አልፏል"
                    : "Overdue"}
                </span>
              )}
            </div>

            {/* Calendar Export Links */}
            {calendarLinks && (
              <div className="pt-2 border-t flex items-center gap-2">
                <a
                  href={calendarLinks.google_calendar_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={12} />
                  <span>Google Calendar</span>
                </a>
                <a
                  href={userService.getICalDownloadUrl()}
                  download="anc_appointment.ics"
                  className="py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <span>iCal (.ics)</span>
                </a>
              </div>
            )}
          </div>

          {/* 4. Logout Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <LogOut size={14} />
              <span>{isAm ? "ከመለያ ውጣ (Log Out)" : "Log Out"}</span>
            </button>
          </div>
        </main>

        {/* Modal: Add Supplement */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center">
                  <Pill size={18} />
                </span>
                <h3 className="text-sm font-bold text-[#1F2937]">
                  {isAm ? "አዲስ ማሟያ ጨምር" : "Add Supplement"}
                </h3>
              </div>

              <form onSubmit={handleAddSupplement} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] mb-1">
                    {isAm ? "የማሟያው ስም" : "Supplement Name"}
                  </label>
                  <input
                    type="text"
                    value={newSuppName}
                    onChange={(e) => setNewSuppName(e.target.value)}
                    placeholder="e.g. Iron & Folic Acid, Calcium, Vitamin D"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] text-[#1F2937]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] mb-1">
                    {isAm ? "የማስታወሻ ሰዓት" : "Reminder Time"}
                  </label>
                  <input
                    type="time"
                    value={newSuppTime}
                    onChange={(e) => setNewSuppTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] text-[#1F2937]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isAddingSupp}
                    className="flex-1 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1E4D38] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    {isAddingSupp && <Loader2 size={13} className="animate-spin" />}
                    <span>{isAm ? "አስቀምጥ" : "Save"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-neutral-200 text-neutral-700 text-xs font-semibold cursor-pointer"
                  >
                    {isAm ? "ሰርዝ" : "Cancel"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
}