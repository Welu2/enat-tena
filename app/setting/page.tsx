"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Time and Date state
  const [reminderTime, setReminderTime] = useState("08:00");
  const [appointmentDate, setAppointmentDate] = useState("2026-03-24");

  // Supplements list state
  const [supplements, setSupplements] = useState([
    { id: 1, name: t.ironLabel },
    { id: 2, name: t.folicAcidLabel },
  ]);
  const [newSupplement, setNewSupplement] = useState("");

  // Notification Toggles state
  const [dailyReminder, setDailyReminder] = useState(true);
  const [checkinReminder, setCheckinReminder] = useState(true);
  const [apptApproaching, setApptApproaching] = useState(true);

  const handleAddSupplement = () => {
    if (!newSupplement.trim()) return;
    setSupplements((prev) => [...prev, { id: Date.now(), name: newSupplement.trim() }]);
    setNewSupplement("");
  };

  const handleRemoveSupplement = (id: number) => {
    setSupplements((prev) => prev.filter((item) => item.id !== id));
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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  return (
    <div className="flex-1 flex flex-col justify-between min-h-dvh">
      {/* Top Header */}
      <div className="relative pt-16 px-6 sm:px-7">
        <Header />

        {/* User Identity Card */}
        <div className="flex items-center gap-3.5 mt-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-green text-white font-bold text-base flex items-center justify-center shadow-sm">
            ሳ
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-text">{t.patientName}</h2>
            <p className="text-xs text-brand-subtle">{t.phoneNumber}</p>
          </div>
        </div>
      </div>

      {/* Main Settings Sections */}
      <main className="flex-1 px-6 sm:px-7 py-4 space-y-5 overflow-y-auto">
        {/* SECTION 1: SUPPLEMENTS */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">
            {t.supplementsSection}
          </p>
          <div className="bg-[#FAF7F2] border border-[#E4DCD0] rounded-3xl divide-y divide-[#EDE5DA] overflow-hidden shadow-sm">
            {supplements.map((item) => (
              <div key={item.id} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#E2ECE6] text-brand-green flex items-center justify-center">
                    <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-brand-text">{item.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSupplement(item.id)}
                  className="w-6 h-6 rounded-lg bg-[#EFE9DF] text-[#7A7062] hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Add New Supplement Row */}
            <div className="p-2.5 pl-3.5 flex items-center justify-between gap-2">
              <input
                type="text"
                value={newSupplement}
                onChange={(e) => setNewSupplement(e.target.value)}
                placeholder={t.addNewSupplement}
                className="bg-transparent text-xs text-brand-text placeholder-[#A3998C] focus:outline-none flex-1"
              />
              <button
                type="button"
                onClick={handleAddSupplement}
                className="w-8 h-8 rounded-xl bg-brand-green text-white flex items-center justify-center hover:bg-brand-green-hover active:scale-95 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: SUPPLEMENT REMINDER */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">
            {t.supplementReminderSection}
          </p>
          <div className="bg-[#FAF7F2] border border-[#E4DCD0] rounded-3xl divide-y divide-[#EDE5DA] overflow-hidden shadow-sm">
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#E2ECE6] text-brand-green flex items-center justify-center">
                  <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-text">{t.dailyReminder}</h4>
                  <p className="text-[11px] text-brand-subtle">{t.dailyReminderSub}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDailyReminder((prev) => !prev)}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${
                  dailyReminder ? "bg-brand-green" : "bg-[#DDD5C7]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    dailyReminder ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Editable Time Row */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#E2ECE6] text-brand-green flex items-center justify-center">
                  <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-brand-text">{t.timeLabel}</span>
              </div>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="bg-transparent text-xs font-bold text-brand-green cursor-pointer focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: APPOINTMENT */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">
            {t.appointmentSection}
          </p>
          <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-3.5 rounded-3xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#E2ECE6] text-brand-green flex items-center justify-center">
                <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-brand-text">{t.appointmentDateLabel}</h4>
                {/* Editable Date Input */}
                <input
                  ref={dateInputRef}
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="text-[11px] text-brand-subtle bg-transparent focus:outline-none cursor-pointer block"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenDatePicker}
              className="px-3 py-1 bg-[#EBE5DA] hover:bg-[#DDD5C7] text-brand-text text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {t.edit}
            </button>
          </div>
        </div>

        {/* SECTION 4: NOTIFICATIONS */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">
            {t.notificationsSection}
          </p>
          <div className="bg-[#FAF7F2] border border-[#E4DCD0] rounded-3xl divide-y divide-[#EDE5DA] overflow-hidden shadow-sm">
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#E2ECE6] text-brand-green flex items-center justify-center">
                  <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h4 className="text-xs font-bold text-brand-text">{t.dailyCheckinReminder}</h4>
              </div>
              <button
                type="button"
                onClick={() => setCheckinReminder((prev) => !prev)}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${
                  checkinReminder ? "bg-brand-green" : "bg-[#DDD5C7]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    checkinReminder ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#E2ECE6] text-brand-green flex items-center justify-center">
                  <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h4 className="text-xs font-bold text-brand-text">{t.appointmentApproaching}</h4>
              </div>
              <button
                type="button"
                onClick={() => setApptApproaching((prev) => !prev)}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${
                  apptApproaching ? "bg-brand-green" : "bg-[#DDD5C7]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    apptApproaching ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 5: ACCOUNT / LOGOUT */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider">
            {t.accountSection}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl flex items-center gap-3 text-[#963838] hover:bg-[#FDF2F2] transition-colors shadow-sm active:scale-[0.99] cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-[#F8EEEE] flex items-center justify-center">
              <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span className="text-xs font-bold">{t.logOut}</span>
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}