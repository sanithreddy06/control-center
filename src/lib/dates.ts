import { differenceInCalendarDays, format, startOfDay } from "date-fns";

/** Parse yyyy-MM-dd (or ISO date prefix) at local calendar midnight — avoids UTC offset bugs. */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Whole calendar days from reference (default: start of today) until targetDate. */
export function calendarDaysUntil(
  targetDate: string,
  referenceDate: Date = new Date()
): number {
  return differenceInCalendarDays(
    parseLocalDate(targetDate),
    startOfDay(referenceDate)
  );
}

export function formatExamCountdown(daysLeft: number): string {
  if (daysLeft === 0) return "Today!";
  if (daysLeft === 1) return "Tomorrow";
  return `${daysLeft} days left`;
}

/** Dashboard widget label — "Today" without exclamation. */
export function formatExamWidgetCountdown(daysLeft: number): string {
  if (daysLeft === 0) return "Today";
  if (daysLeft === 1) return "Tomorrow";
  return `${daysLeft} days left`;
}

export function formatLocalDate(dateStr: string, pattern: string): string {
  return format(parseLocalDate(dateStr), pattern);
}
