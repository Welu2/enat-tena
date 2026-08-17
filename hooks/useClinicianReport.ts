import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getLatestSummary,
  generateSummary,
  getUserProfile,
  ClinicianSummary,
} from "@/lib/api";
import { resolvePatientDisplayName } from "@/utils/reportHelpers";

export function useClinicianReport(
  notify: (msg: string) => void,
  language: string
) {
  const router = useRouter();
  const [summary, setSummary] = useState<ClinicianSummary | null>(null);
  const [patientName, setPatientName] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const syncProfile = useCallback(async () => {
    try {
      const profile = await getUserProfile();
      if (!profile) return;
      const appt = profile.appointment?.appointment_date ||
        profile.next_appointment_date;
      if (appt) setAppointmentDate(appt);
      const fallback = language === "am" ? "ያልታወቀ" : "Unknown";
      const resolved = resolvePatientDisplayName(
        profile.full_name,
        localStorage.getItem("user_name"),
        profile.email,
        localStorage.getItem("user_email"),
        fallback
      );
      setPatientName(resolved);
      if (resolved && resolved !== fallback) {
        localStorage.setItem("user_name", resolved);
      }
    } catch (profileErr) {
      console.warn("Profile fetch skipped:", profileErr);
    }
  }, [language]);

  const loadSummaryData = useCallback(async () => {
    const latest = await getLatestSummary();
    if (latest) {
      setSummary(latest);
    } else {
      const initialSummary = await generateSummary();
      setSummary(initialSummary);
    }
  }, []);

  const initReport = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      await syncProfile();
      await loadSummaryData();
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message?.includes("401") ||
          error.message?.includes("Unauthorized")) {
        localStorage.removeItem("access_token");
        router.replace("/login");
        return;
      }
      setFetchError(error.message || "Failed to load clinician report.");
    } finally {
      setIsLoading(false);
    }
  }, [router, syncProfile, loadSummaryData]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    const cachedName = localStorage.getItem("user_name");
    if (cachedName?.trim()) setPatientName(cachedName.trim());
    initReport();
  }, [router, initReport]);

  const handleRegenerate = async () => {
    setIsGenerating(true);
    setFetchError(null);
    try {
      const refreshed = await generateSummary();
      setSummary(refreshed);
      notify(
        language === "am"
          ? "የህክምና ሪፖርት በአዲስ መልኩ ተዘጋጅቷል!"
          : "Clinician summary updated successfully!"
      );
    } catch (err: unknown) {
      const error = err as Error;
      notify(
        error.message ||
          (language === "am" ? "ማመንጨት አልተቻለም።" : "Failed to generate.")
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    summary,
    patientName,
    appointmentDate,
    isLoading,
    isGenerating,
    fetchError,
    initReport,
    handleRegenerate,
  };
}