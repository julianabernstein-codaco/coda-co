const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// "2025-03-12" → "March 2025". Falls back to the raw string for inputs that
// aren't ISO so older seed values (or future locale work) don't crash.
export function formatMonthYear(iso: string): string {
  const m = /^(\d{4})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const month = MONTHS[Number(m[2]) - 1];
  if (!month) return iso;
  return `${month} ${m[1]}`;
}

// "2025-03-12" or a Date → "March 12, 2025". Formats off the ISO calendar
// date (UTC), matching formatMonthYear; falls back to the raw string for
// non-ISO input. Used for precise dates like a trial's end.
export function formatFullDate(input: string | Date): string {
  const iso = typeof input === "string" ? input : input.toISOString();
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return typeof input === "string" ? input : iso;
  const month = MONTHS[Number(m[2]) - 1];
  if (!month) return iso;
  return `${month} ${Number(m[3])}, ${m[1]}`;
}
