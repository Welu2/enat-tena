// lib/dateUtils.ts

export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
}

const AM_WEEKDAYS = ["እሁድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "አርብ", "ቅዳሜ"];
const EN_WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const AM_MONTHS = [
  "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት",
  "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"
];

/**
 * Converts a Gregorian Date to an Ethiopian Calendar date (Year, Month 1-13, Day 1-30).
 */
export function toEthiopianDate(dateInput: Date | string | number): EthiopianDate {
  const date = typeof dateInput === "object" && dateInput instanceof Date
    ? dateInput
    : new Date(dateInput);

  if (isNaN(date.getTime())) {
    return { year: 2018, month: 1, day: 1 };
  }

  const gYear = date.getFullYear();
  const gMonth = date.getMonth() + 1;
  const gDay = date.getDate();

  // Julian Day Number (JDN) calculation from Gregorian Date
  const a = Math.floor((14 - gMonth) / 12);
  const y = gYear + 4800 - a;
  const m = gMonth + 12 * a - 3;
  const jdn =
    gDay +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // Ethiopian calendar epoch offset in JDN
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);

  const ethYear = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const ethMonth = Math.floor(n / 30) + 1;
  const ethDay = (n % 30) + 1;

  return {
    year: ethYear,
    month: ethMonth,
    day: ethDay,
  };
}

export interface FormattedDate {
  /** Full formatted string, e.g. "Monday, Aug 26" or "ሰኞ፣ ነሐሴ 20" */
  full: string;
  /** Month name abbreviation, e.g. "Aug" or "ነሐሴ" */
  month: string;
  /** Day number as string, e.g. "26" */
  dayNum: string;
  /** Weekday name, e.g. "Monday" or "ሰኞ" */
  dayName: string;
}

/**
 * Safely formats any Date, timestamp string, or undefined value for bilingual display.
 * Returns a structured object with full, month, dayNum, dayName properties.
 */
export function formatSyncedDate(
  dateInput: Date | string | number | undefined | null,
  lang: "am" | "en" = "am"
): FormattedDate {
  const fallback: FormattedDate = {
    full: lang === "am" ? "ዛሬ" : "Today",
    month: "",
    dayNum: "",
    dayName: "",
  };

  if (!dateInput) return fallback;

  const date = typeof dateInput === "object" && dateInput instanceof Date
    ? dateInput
    : new Date(dateInput);

  if (isNaN(date.getTime())) return fallback;

  const dayIndex = date.getDay();

  if (lang === "am") {
    try {
      const eth = toEthiopianDate(date);
      const weekday = AM_WEEKDAYS[dayIndex] || "";
      const monthName = AM_MONTHS[(eth.month || 1) - 1] || "";
      const dayNum = String(eth.day || 1);
      return {
        full: `${weekday}፣ ${monthName} ${dayNum}`,
        month: monthName,
        dayNum,
        dayName: weekday,
      };
    } catch {
      const weekday = AM_WEEKDAYS[dayIndex] || "";
      const dayNum = String(date.getDate());
      return {
        full: `${weekday}፣ ${dayNum}`,
        month: "",
        dayNum,
        dayName: weekday,
      };
    }
  }

  const weekday = EN_WEEKDAYS[dayIndex] || "";
  const monthName = date.toLocaleString("en-US", { month: "short" });
  const dayNum = String(date.getDate());
  return {
    full: `${weekday}, ${monthName} ${dayNum}`,
    month: monthName,
    dayNum,
    dayName: weekday,
  };
}