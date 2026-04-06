import type { ExportRow } from "../types";

/** Monday-based week key in local time (YYYY-MM-DD). */
export function mondayKeyFromDate(d: Date): string {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

export function shortWeekLabel(mondayIso: string): string {
  const d = new Date(mondayIso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Newest weeks first. First section is always "this week" (even if empty). */
export function weekSectionsForUi(rows: ExportRow[]): {
  id: string;
  title: string;
  rows: ExportRow[];
}[] {
  const nowKey = mondayKeyFromDate(new Date());
  const map = new Map<string, ExportRow[]>();
  for (const r of rows) {
    const d = new Date(r.exportedAt);
    if (Number.isNaN(d.getTime())) continue;
    const k = mondayKeyFromDate(d);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(r);
  }
  for (const list of map.values()) {
    list.sort(
      (a, b) =>
        new Date(b.exportedAt).getTime() - new Date(a.exportedAt).getTime()
    );
  }
  const keys = [...map.keys()].sort((a, b) => b.localeCompare(a));
  const sections: { id: string; title: string; rows: ExportRow[] }[] = [];
  const thisWeekRows = map.get(nowKey) || [];
  sections.push({
    id: nowKey,
    title: "This week (current)",
    rows: thisWeekRows,
  });
  for (const k of keys) {
    if (k === nowKey) continue;
    sections.push({
      id: k,
      title: `Past · Week of ${shortWeekLabel(k)}`,
      rows: map.get(k) || [],
    });
  }
  return sections;
}
