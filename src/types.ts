export type Role = "owner" | "manager" | "hr" | "employee";

export interface Org {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: number;
}

export interface Member {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  department: string;
  employeeCode: string;
  avatarDataUrl?: string;
  hourlyRate: number;
  salaryAnnual: number | null;
}

export interface Shift {
  id: string;
  orgId: string;
  title: string;
  location: string;
  start: string;
  end: string;
  notes: string;
}

export interface BreakSegment {
  start: string;
  end: string | null;
}

export type TimeStatus = "active_work" | "on_break" | "completed";

export interface TimeEntry {
  id: string;
  orgId: string;
  memberId: string;
  clockIn: string;
  clockOut: string | null;
  status: TimeStatus;
  breaks: BreakSegment[];
}

export interface ExportRow {
  employeeId: string;
  employeeName: string;
  clockIn: string;
  clockOut: string;
  totalHours: number;
  breakHours: number;
  paidHours: number;
  breakLog: string;
  entryId: string;
  exportedAt: string;
}

export interface PayStub {
  id: string;
  memberId: string;
  periodLabel: string;
  gross: number;
  net: number;
  taxes: number;
  other: number;
  hours: number;
}

/** Owner-created link; employee name is fixed before sharing. */
export interface PersonalInvite {
  id: string;
  orgId: string;
  token: string;
  assignedName: string;
  createdAt: number;
  used: boolean;
  usedAt?: number;
  usedByMemberId?: string;
}

export interface AppState {
  orgs: Org[];
  members: Member[];
  shifts: Shift[];
  timeEntries: TimeEntry[];
  exportRowsByOrg: Record<string, ExportRow[]>;
  payStubs: PayStub[];
  personalInvites: PersonalInvite[];
  session: { orgId: string; memberId: string } | null;
}

export type RouteId =
  | "dashboard"
  | "time"
  | "team"
  | "schedule"
  | "pay"
  | "payroll"
  | "company"
  | "employees";
