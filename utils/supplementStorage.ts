export function getStoredCompletedSupplements(
  dateKey: string
): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`completed_supps_${dateKey}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function storeCompletedSupplements(
  dateKey: string,
  ids: string[]
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `completed_supps_${dateKey}`,
      JSON.stringify(ids)
    );
  } catch (err) {
    console.error("Failed to cache completed supplements:", err);
  }
}