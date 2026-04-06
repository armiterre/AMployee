import type { BreakSegment } from "../types";

export function breakDurationMs(breaks: BreakSegment[], shiftEndIso: string): number {
  const endMs = new Date(shiftEndIso).getTime();
  let ms = 0;
  for (const b of breaks) {
    const s = new Date(b.start).getTime();
    const e = b.end ? new Date(b.end).getTime() : endMs;
    ms += Math.max(0, e - s);
  }
  return ms;
}

export function shiftTotals(entry: {
  clockIn: string;
  clockOut: string;
  breaks: BreakSegment[];
}): { totalHours: number; breakHours: number; paidHours: number } {
  const t0 = new Date(entry.clockIn).getTime();
  const t1 = new Date(entry.clockOut).getTime();
  const totalMs = Math.max(0, t1 - t0);
  const breakMs = breakDurationMs(entry.breaks, entry.clockOut);
  const paidMs = Math.max(0, totalMs - breakMs);
  return {
    totalHours: totalMs / 3_600_000,
    breakHours: breakMs / 3_600_000,
    paidHours: paidMs / 3_600_000,
  };
}

export function formatBreakLog(breaks: BreakSegment[], shiftEndIso: string): string {
  const endMs = new Date(shiftEndIso).getTime();
  return breaks
    .map((b) => {
      const s = new Date(b.start);
      const e = b.end ? new Date(b.end) : new Date(endMs);
      const fmt = (d: Date) =>
        d.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
      const mins = Math.round((e.getTime() - s.getTime()) / 60_000);
      return `${fmt(s)}–${fmt(e)} unpaid break (${mins} min)`;
    })
    .join(" | ");
}
