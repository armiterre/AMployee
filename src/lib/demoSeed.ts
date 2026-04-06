import type { AppState, Member, Org, PayStub, Shift } from "../types";

const DEMO_CODE = "AMPY01";

export function buildDemoState(): AppState {
  const orgId = "org_demo";
  const org: Org = {
    id: orgId,
    name: "AMployee (Demo)",
    inviteCode: DEMO_CODE,
    createdAt: Date.now(),
  };

  const members: Member[] = [
    {
      id: "m1",
      orgId,
      email: "owner@setco.demo",
      name: "Jordan Reyes",
      role: "owner",
      title: "Owner & CEO",
      department: "Executive",
      employeeCode: "EMP-001",
      hourlyRate: 0,
      salaryAnnual: 185000,
    },
    {
      id: "m2",
      orgId,
      email: "manager@setco.demo",
      name: "Sam Okonkwo",
      role: "manager",
      title: "Operations Manager",
      department: "Operations",
      employeeCode: "EMP-002",
      hourlyRate: 42,
      salaryAnnual: null,
    },
    {
      id: "m3",
      orgId,
      email: "hr@setco.demo",
      name: "Taylor Chen",
      role: "hr",
      title: "HR & Payroll",
      department: "People",
      employeeCode: "EMP-003",
      hourlyRate: 38,
      salaryAnnual: null,
    },
    {
      id: "m4",
      orgId,
      email: "alex@setco.demo",
      name: "Alex Morgan",
      role: "employee",
      title: "Floor Lead",
      department: "Retail",
      employeeCode: "EMP-004",
      hourlyRate: 22.5,
      salaryAnnual: null,
    },
    {
      id: "m5",
      orgId,
      email: "riley@setco.demo",
      name: "Riley Park",
      role: "employee",
      title: "Sales Associate",
      department: "Retail",
      employeeCode: "EMP-005",
      hourlyRate: 18,
      salaryAnnual: null,
    },
  ];

  const now = new Date();
  const addDays = (d: number, h: number, min: number) => {
    const x = new Date(now);
    x.setDate(x.getDate() + d);
    x.setHours(h, min, 0, 0);
    return x.toISOString();
  };

  const shifts: Shift[] = [
    {
      id: "s1",
      orgId,
      title: "Opening — Retail floor",
      location: "Main store",
      start: addDays(0, 9, 0),
      end: addDays(0, 17, 0),
      notes: "Shared shift — all retail staff",
    },
    {
      id: "s2",
      orgId,
      title: "Mid shift coverage",
      location: "Main store",
      start: addDays(1, 11, 0),
      end: addDays(1, 19, 0),
      notes: "Backup register + floor",
    },
    {
      id: "s3",
      orgId,
      title: "Weekend opening",
      location: "Main store",
      start: addDays(3, 8, 30),
      end: addDays(3, 16, 30),
      notes: "Weekend team",
    },
    {
      id: "s4",
      orgId,
      title: "Inventory evening",
      location: "Warehouse",
      start: addDays(5, 18, 0),
      end: addDays(5, 22, 0),
      notes: "Optional overtime — manager approval",
    },
  ];

  const payStubs: PayStub[] = [
    {
      id: "p1",
      memberId: "m4",
      periodLabel: "Mar 1–15, 2026",
      gross: 1840,
      net: 1486.32,
      taxes: 245.18,
      other: 108.5,
      hours: 80,
    },
    {
      id: "p2",
      memberId: "m4",
      periodLabel: "Feb 16–28, 2026",
      gross: 1935,
      net: 1558.9,
      taxes: 258.4,
      other: 117.7,
      hours: 84,
    },
    {
      id: "p3",
      memberId: "m5",
      periodLabel: "Mar 1–15, 2026",
      gross: 1472,
      net: 1201.04,
      taxes: 196.12,
      other: 74.84,
      hours: 80,
    },
    {
      id: "p4",
      memberId: "m2",
      periodLabel: "Mar 1–15, 2026",
      gross: 3360,
      net: 2512.88,
      taxes: 647.2,
      other: 199.92,
      hours: 80,
    },
    {
      id: "p5",
      memberId: "m3",
      periodLabel: "Mar 1–15, 2026",
      gross: 3040,
      net: 2288.45,
      taxes: 585.55,
      other: 166,
      hours: 80,
    },
  ];

  return {
    orgs: [org],
    members,
    shifts,
    timeEntries: [],
    exportRowsByOrg: { [orgId]: [] },
    payStubs,
    personalInvites: [],
    session: { orgId, memberId: "m1" },
  };
}

export { DEMO_CODE };
