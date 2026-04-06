import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { downloadTimeWorkbook } from "../lib/excelExport";
import { weekSectionsForUi } from "../lib/weekBuckets";
import type { ExportRow } from "../types";

function shortDate(isoOrLocale: string): string {
  const d = new Date(isoOrLocale);
  return Number.isNaN(d.getTime())
    ? isoOrLocale
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TimeExportsPanel({
  orgName,
  rows,
}: {
  orgName: string;
  rows: ExportRow[];
}) {
  const sections = weekSectionsForUi(rows);
  const [openId, setOpenId] = useState<string>("");

  useEffect(() => {
    if (!sections.length) return;
    if (!sections.some((s) => s.id === openId)) {
      setOpenId(sections[0].id);
    }
  }, [sections, openId]);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-ink">Weekly time</h3>
        <p className="mt-1 text-sm text-muted">
          One section per week. Download Excel when you need payroll backup.
        </p>
      </div>

      {sections.map((sec, i) => {
        const expanded = sec.id === openId;
        const paid = sec.rows.reduce((a, r) => a + r.paidHours, 0);
        return (
          <motion.section
            key={sec.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="overflow-hidden rounded-2xl border border-line bg-[#0c0f14]/90"
          >
            <button
              type="button"
              onClick={() => setOpenId(sec.id)}
              className="flex w-full items-center justify-between gap-3 border-b border-line/80 bg-surface/80 px-4 py-3 text-left transition-colors hover:bg-surface-hover/50"
            >
              <div>
                <h4 className="font-semibold text-ink">{sec.title}</h4>
                <p className="text-xs text-muted">
                  {sec.rows.length} shift{sec.rows.length === 1 ? "" : "s"} ·{" "}
                  {paid.toFixed(1)} paid hrs
                </p>
              </div>
              <span className="text-muted">{expanded ? "▼" : "▶"}</span>
            </button>

            {expanded && (
              <div className="border-b border-line/50 px-4 py-3">
                <button
                  type="button"
                  disabled={sec.rows.length === 0}
                  onClick={() =>
                    downloadTimeWorkbook(
                      orgName,
                      sec.rows,
                      sec.id.replace(/[^\w-]/g, "_")
                    )
                  }
                  className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-[#04120f] disabled:opacity-40"
                >
                  Download .xlsx
                </button>
              </div>
            )}

            {expanded && (
              <ul className="divide-y divide-line/40">
                {sec.rows.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-muted">
                    No shifts this week yet.
                  </li>
                ) : (
                  sec.rows.map((r) => (
                    <li
                      key={`${r.entryId}-${r.exportedAt}`}
                      className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <span className="font-medium text-ink">{r.employeeName}</span>
                        <span className="ml-2 font-mono text-xs text-accent">
                          {r.employeeId}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-mono text-accent">
                          {r.paidHours.toFixed(1)}h
                        </span>
                        <span className="text-xs text-muted">
                          out {shortDate(r.clockOut)}
                        </span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </motion.section>
        );
      })}

      {rows.length > 0 && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => downloadTimeWorkbook(orgName, rows, "all_weeks")}
            className="rounded-xl border border-line px-4 py-2 text-sm text-ink hover:bg-surface-hover"
          >
            All weeks → one file
          </button>
        </div>
      )}
    </div>
  );
}
