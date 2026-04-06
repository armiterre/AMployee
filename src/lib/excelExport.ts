import * as XLSX from "xlsx";
import type { ExportRow } from "../types";

const COLS = [
  "Employee ID",
  "Employee Name",
  "Clock In",
  "Clock Out",
  "Total Hours",
  "Break Hours (unpaid)",
  "Paid Hours",
  "Break Activity Log",
  "Entry ID",
  "Log Saved At",
] as const;

function rowToObject(r: ExportRow): Record<(typeof COLS)[number], string | number> {
  return {
    "Employee ID": r.employeeId,
    "Employee Name": r.employeeName,
    "Clock In": r.clockIn,
    "Clock Out": r.clockOut,
    "Total Hours": Number(r.totalHours.toFixed(4)),
    "Break Hours (unpaid)": Number(r.breakHours.toFixed(4)),
    "Paid Hours": Number(r.paidHours.toFixed(4)),
    "Break Activity Log": r.breakLog,
    "Entry ID": r.entryId,
    "Log Saved At": r.exportedAt,
  };
}

export function downloadTimeWorkbook(
  orgName: string,
  rows: ExportRow[],
  fileTag?: string
): void {
  if (rows.length === 0) return;
  const flat = rows.map(rowToObject);
  const ws = XLSX.utils.json_to_sheet(flat, { header: [...COLS] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Time Records");
  const safe = orgName.replace(/[^\w\-]+/g, "_").slice(0, 40);
  const d = new Date().toISOString().slice(0, 10);
  const tag = fileTag
    ? `_${fileTag.replace(/[^\w\-]+/g, "_").slice(0, 28)}`
    : "";
  XLSX.writeFile(wb, `AMployee_Time_${safe}${tag}_${d}.xlsx`);
}
