import { getAppointmentCalendarLinks } from "@/lib/api";

export async function openGoogleCalendar(): Promise<boolean> {
  const links = await getAppointmentCalendarLinks();
  if (!links?.google_calendar_url) {
    return false;
  }
  window.open(
    links.google_calendar_url,
    "_blank",
    "noopener,noreferrer"
  );
  return true;
}

export function downloadIcsCalendar(): void {
  const fallbackUrl = "https://enat-backend-2jlo.onrender.com";
  const apiBase = process.env.NEXT_PUBLIC_API_URL || fallbackUrl;
  const downloadAnchor = document.createElement("a");
  downloadAnchor.href = `${apiBase}/users/me/appointment/calendar.ics`;
  downloadAnchor.setAttribute("download", "appointment.ics");
  downloadAnchor.target = "_blank";
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
}