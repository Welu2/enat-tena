// lib/dateUtils.ts

export const AMHARIC_MONTHS = [
  "መስከረም",
  "ጥቅምት",
  "ኅዳር",
  "ታኅሣሥ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዝያ",
  "ግንቦት",
  "ሰኔ",
  "ሐምሌ",
  "ነሐሴ",
  "ጳጉሜ",
];

export const AMHARIC_WEEKDAYS = [
  "እሑድ",
  "ሰኞ",
  "ማክሰኞ",
  "ረቡዕ",
  "ሐሙስ",
  "ዓርብ",
  "ቅዳሜ",
];

export const AMHARIC_WEEKDAYS_SHORT = [
  "እሑድ",
  "ሰኞ",
  "ማክሰ",
  "ረቡዕ",
  "ሐሙስ",
  "ዓርብ",
  "ቅዳሜ",
];

export const ENGLISH_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const ENGLISH_MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const ENGLISH_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const ENGLISH_WEEKDAYS_SHORT = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
];

/**
 * Converts a Gregorian date to Ethiopian Calendar (Year, Month 1-13, Day)
 */
export function toEthiopianDate(gregorianDate: Date) {
  const gYear = gregorianDate.getFullYear();
  const gMonth = gregorianDate.getMonth() + 1; // 1-12
  const gDay = gregorianDate.getDate();

  // Julian Day Number Calculation
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

  // Convert JDN to Ethiopian Era
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const ethYear =
    4 * Math.floor((jdn - 1723856) / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  const ethMonth = Math.floor(n / 30) + 1;
  const ethDay = (n % 30) + 1;

  return {
    year: ethYear,
    month: ethMonth, // 1 to 13
    day: ethDay,
    monthName: AMHARIC_MONTHS[ethMonth - 1],
    weekdayName: AMHARIC_WEEKDAYS[gregorianDate.getDay()],
    weekdayShort: AMHARIC_WEEKDAYS_SHORT[gregorianDate.getDay()],
  };
}

/**
 * Formats any Date object based on current selected language
 */
export function formatSyncedDate(date: Date, lang: "am" | "en") {
  const dayIndex = date.getDay();

  if (lang === "am") {
    const eth = toEthiopianDate(date);
    return {
      full: `${eth.weekdayName}፣ ${eth.monthName} ${eth.day} ቀን ${eth.year} ዓ.ም`,
      monthDay: `${eth.monthName} ${eth.day}`,
      month: eth.monthName,
      dayNum: String(eth.day),
      dayName: eth.weekdayShort,
      year: String(eth.year),
    };
  }

  // English (Gregorian)
  const gMonth = date.getMonth();
  const gDay = date.getDate();
  const gYear = date.getFullYear();

  return {
    full: `${ENGLISH_WEEKDAYS[dayIndex]}, ${ENGLISH_MONTHS[gMonth]} ${gDay}, ${gYear}`,
    monthDay: `${ENGLISH_MONTHS_SHORT[gMonth]} ${gDay}`,
    month: ENGLISH_MONTHS_SHORT[gMonth],
    dayNum: String(gDay),
    dayName: ENGLISH_WEEKDAYS_SHORT[dayIndex],
    year: String(gYear),
  };
}

/**
 * Helper to get relative dates from today (-1 day, -2 days, etc.)
 */
export function getRelativeDate(daysOffset: number = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d;
}