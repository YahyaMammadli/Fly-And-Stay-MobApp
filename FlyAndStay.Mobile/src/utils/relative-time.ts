import { formatShort, toISO } from "./dates";

export function formatRelative(isoUtc: string): string {
  const then = new Date(isoUtc);
  const seconds = Math.floor((Date.now() - then.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)} d ago`;
  return formatShort(toISO(then));
}
