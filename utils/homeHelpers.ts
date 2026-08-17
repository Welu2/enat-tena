export function calculateDaysAway(
  apptDateStr?: string | null
): number | null {
  if (!apptDateStr?.trim()) return null;
  const apptDate = new Date(apptDateStr);
  if (Number.isNaN(apptDate.getTime())) return null;

  const today = new Date();
  apptDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = apptDate.getTime() - today.getTime();
  const calculatedDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return calculatedDays >= 0 ? calculatedDays : 0;
}