import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AppState,
  ExportRow,
  Member,
  Org,
  PersonalInvite,
  RouteId,
  Shift,
  TimeEntry,
} from "../types";
import { buildDemoState } from "../lib/demoSeed";
import { DEMO_ORG_ID, SET_POWERS } from "../lib/setPowers";
import { formatBreakLog, shiftTotals } from "../lib/timeMath";

const STORAGE_KEY = "bizsuite_v2";

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function randomInvite(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function randomToken(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < length; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function nextEmployeeCode(members: Member[], orgId: string): string {
  const n =
    members.filter((m) => m.orgId === orgId).length + 1;
  return `EMP-${String(n).padStart(3, "0")}`;
}

function loadPersisted(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const p = JSON.parse(raw) as AppState;
    if (!p.orgs || !p.members) return emptyState();
    if (!p.exportRowsByOrg) p.exportRowsByOrg = {};
    if (!p.payStubs) p.payStubs = [];
    if (!p.personalInvites) p.personalInvites = [];
    return p;
  } catch {
    return emptyState();
  }
}

function emptyState(): AppState {
  return {
    orgs: [],
    members: [],
    shifts: [],
    timeEntries: [],
    exportRowsByOrg: {},
    payStubs: [],
    personalInvites: [],
    session: null,
  };
}

function savePersisted(s: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

type Action =
  | { type: "RESET"; payload: AppState }
  | { type: "SET_SESSION"; session: AppState["session"] }
  | { type: "CREATE_ORG"; orgName: string; founderName: string }
  | { type: "JOIN_ORG"; code: string; displayName: string }
  | { type: "UPDATE_PROFILE"; patch: Partial<Pick<Member, "name" | "avatarDataUrl" | "title" | "email">> }
  | { type: "CLOCK_IN" }
  | { type: "START_BREAK"; entryId: string }
  | { type: "END_BREAK"; entryId: string }
  | { type: "ADD_SHIFT"; shift: Omit<Shift, "id" | "orgId"> }
  | { type: "CLOCK_OUT"; completed: TimeEntry; row: ExportRow }
  | {
      type: "CREATE_PERSONAL_INVITE";
      orgId: string;
      ownerMemberId: string;
      assignedName: string;
      token: string;
    }
  | { type: "ACCEPT_PERSONAL_INVITE"; token: string; avatarDataUrl?: string }
  | {
      type: "REMOVE_MEMBER";
      orgId: string;
      actingMemberId: string;
      targetMemberId: string;
    }
  | { type: "REVOKE_PERSONAL_INVITE"; inviteId: string; orgId: string; ownerMemberId: string };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "RESET":
      return action.payload;
    case "SET_SESSION":
      return { ...state, session: action.session };
    case "UPDATE_PROFILE": {
      if (!state.session) return state;
      const members = state.members.map((m) =>
        m.id === state.session!.memberId ? { ...m, ...action.patch } : m
      );
      return { ...state, members };
    }
    case "CREATE_ORG": {
      const orgId = uid("org");
      const inviteCode = randomInvite();
      const org: Org = {
        id: orgId,
        name: action.orgName.trim(),
        inviteCode,
        createdAt: Date.now(),
      };
      const member: Member = {
        id: uid("m"),
        orgId,
        name: action.founderName.trim(),
        email: "",
        role: "owner",
        title: "Owner",
        department: "General",
        employeeCode: "EMP-001",
        hourlyRate: 0,
        salaryAnnual: null,
      };
      const now = new Date();
      const mk = (h: number, mi: number, addD: number) => {
        const d = new Date(now);
        d.setDate(d.getDate() + addD);
        d.setHours(h, mi, 0, 0);
        return d.toISOString();
      };
      const shifts: Shift[] = [
        {
          id: uid("s"),
          orgId,
          title: "Team shift — store floor",
          location: "Main",
          start: mk(9, 0, 1),
          end: mk(17, 0, 1),
          notes: "Everyone on this shift — shared calendar",
        },
        {
          id: uid("s"),
          orgId,
          title: "Afternoon coverage",
          location: "Main",
          start: mk(12, 0, 2),
          end: mk(20, 0, 2),
          notes: "Handoff at noon",
        },
      ];
      return {
        ...state,
        orgs: [...state.orgs, org],
        members: [...state.members, member],
        shifts: [...state.shifts, ...shifts],
        exportRowsByOrg: { ...state.exportRowsByOrg, [orgId]: [] },
        session: { orgId, memberId: member.id },
      };
    }
    case "JOIN_ORG": {
      const code = action.code.trim().toUpperCase();
      const org = state.orgs.find((o) => o.inviteCode === code);
      if (!org) return state;
      const member: Member = {
        id: uid("m"),
        orgId: org.id,
        name: action.displayName.trim(),
        email: "",
        role: "employee",
        title: "Team member",
        department: "General",
        employeeCode: nextEmployeeCode(state.members, org.id),
        hourlyRate: 18,
        salaryAnnual: null,
      };
      return {
        ...state,
        members: [...state.members, member],
        session: { orgId: org.id, memberId: member.id },
      };
    }
    case "CLOCK_IN": {
      if (!state.session) return state;
      const { orgId, memberId } = state.session;
      const open = state.timeEntries.find(
        (e) =>
          e.orgId === orgId &&
          e.memberId === memberId &&
          e.status !== "completed"
      );
      if (open) return state;
      const entry: TimeEntry = {
        id: uid("t"),
        orgId,
        memberId,
        clockIn: new Date().toISOString(),
        clockOut: null,
        status: "active_work",
        breaks: [],
      };
      return { ...state, timeEntries: [...state.timeEntries, entry] };
    }
    case "START_BREAK": {
      const eid = action.entryId;
      const timeEntries = state.timeEntries.map((e) => {
        if (e.id !== eid || e.status !== "active_work") return e;
        return {
          ...e,
          status: "on_break" as const,
          breaks: [...e.breaks, { start: new Date().toISOString(), end: null }],
        };
      });
      return { ...state, timeEntries };
    }
    case "END_BREAK": {
      const eid = action.entryId;
      const now = new Date().toISOString();
      const timeEntries = state.timeEntries.map((e) => {
        if (e.id !== eid || e.status !== "on_break") return e;
        const breaks = e.breaks.map((b, i) =>
          i === e.breaks.length - 1 && b.end === null ? { ...b, end: now } : b
        );
        return { ...e, status: "active_work" as const, breaks };
      });
      return { ...state, timeEntries };
    }
    case "ADD_SHIFT": {
      if (!state.session) return state;
      const orgId = state.session.orgId;
      const shift: Shift = {
        ...action.shift,
        id: uid("s"),
        orgId,
      };
      return { ...state, shifts: [...state.shifts, shift] };
    }
    case "CLOCK_OUT": {
      const { completed, row } = action;
      const orgId = completed.orgId;
      const timeEntries = state.timeEntries.map((t) =>
        t.id === completed.id ? completed : t
      );
      const prevRows = state.exportRowsByOrg[orgId] || [];
      return {
        ...state,
        timeEntries,
        exportRowsByOrg: {
          ...state.exportRowsByOrg,
          [orgId]: [...prevRows, row],
        },
      };
    }
    case "CREATE_PERSONAL_INVITE": {
      const actor = state.members.find((m) => m.id === action.ownerMemberId);
      if (
        !actor ||
        actor.role !== "owner" ||
        actor.orgId !== action.orgId
      ) {
        return state;
      }
      const name = action.assignedName.trim();
      if (!name) return state;
      const invite: PersonalInvite = {
        id: uid("pi"),
        orgId: action.orgId,
        token: action.token,
        assignedName: name,
        createdAt: Date.now(),
        used: false,
      };
      return {
        ...state,
        personalInvites: [...state.personalInvites, invite],
      };
    }
    case "ACCEPT_PERSONAL_INVITE": {
      const inv = state.personalInvites.find(
        (i) => i.token === action.token && !i.used
      );
      if (!inv) return state;
      const orgExists = state.orgs.some((o) => o.id === inv.orgId);
      if (!orgExists) return state;
      const member: Member = {
        id: uid("m"),
        orgId: inv.orgId,
        name: inv.assignedName,
        email: "",
        role: "employee",
        title: "Team member",
        department: "General",
        employeeCode: nextEmployeeCode(state.members, inv.orgId),
        hourlyRate: 18,
        salaryAnnual: null,
        ...(action.avatarDataUrl
          ? { avatarDataUrl: action.avatarDataUrl }
          : {}),
      };
      const personalInvites = state.personalInvites.map((i) =>
        i.id === inv.id
          ? {
              ...i,
              used: true,
              usedAt: Date.now(),
              usedByMemberId: member.id,
            }
          : i
      );
      return {
        ...state,
        members: [...state.members, member],
        personalInvites,
        session: { orgId: inv.orgId, memberId: member.id },
      };
    }
    case "REMOVE_MEMBER": {
      const actor = state.members.find((m) => m.id === action.actingMemberId);
      if (
        !actor ||
        actor.role !== "owner" ||
        actor.orgId !== action.orgId
      ) {
        return state;
      }
      if (action.targetMemberId === action.actingMemberId) return state;
      const target = state.members.find((m) => m.id === action.targetMemberId);
      if (!target || target.orgId !== action.orgId) return state;
      return {
        ...state,
        members: state.members.filter((m) => m.id !== action.targetMemberId),
        timeEntries: state.timeEntries.filter(
          (e) => e.memberId !== action.targetMemberId
        ),
      };
    }
    case "REVOKE_PERSONAL_INVITE": {
      const actor = state.members.find((m) => m.id === action.ownerMemberId);
      if (
        !actor ||
        actor.role !== "owner" ||
        actor.orgId !== action.orgId
      ) {
        return state;
      }
      const inv = state.personalInvites.find((i) => i.id === action.inviteId);
      if (!inv || inv.orgId !== action.orgId || inv.used) return state;
      return {
        ...state,
        personalInvites: state.personalInvites.filter(
          (i) => i.id !== action.inviteId
        ),
      };
    }
    default:
      return state;
  }
}

function canSeeAllTime(role: Member["role"]) {
  return role === "owner" || role === "manager" || role === "hr";
}

function canManageShifts(role: Member["role"]) {
  return role === "owner" || role === "manager" || role === "hr";
}

function canPayroll(role: Member["role"]) {
  return role === "owner" || role === "hr";
}

function canCompany(role: Member["role"]) {
  return role === "owner";
}

function canManageEmployees(role: Member["role"]) {
  return role === "owner";
}

interface BizContextValue {
  state: AppState;
  member: Member | null;
  org: Org | null;
  route: RouteId;
  setRoute: (r: RouteId) => void;
  profileOpen: boolean;
  setProfileOpen: (v: boolean) => void;
  navItems: { id: RouteId; label: string }[];
  createOrg: (orgName: string, founderName: string) => void;
  joinOrg: (code: string, displayName: string) => boolean;
  enterDemoPower: (memberId: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<Member, "name" | "avatarDataUrl" | "title" | "email">>) => void;
  clockIn: () => void;
  startBreak: (entryId: string) => void;
  endBreak: (entryId: string) => void;
  clockOutShift: (entryId: string) => void;
  addShift: (s: Omit<Shift, "id" | "orgId">) => void;
  createPersonalInvite: (assignedName: string) => string | null;
  acceptPersonalInvite: (
    token: string,
    opts?: { avatarDataUrl?: string }
  ) => { ok: boolean; reason?: string };
  removeMember: (targetMemberId: string) => void;
  revokePersonalInvite: (inviteId: string) => void;
  canSeeAllTime: boolean;
  canManageShifts: boolean;
  canPayroll: boolean;
  canCompany: boolean;
  canManageEmployees: boolean;
}

const BizContext = createContext<BizContextValue | null>(null);

export function BizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadPersisted);
  const [route, setRoute] = useState<RouteId>("dashboard");
  const [profileOpen, setProfileOpen] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    savePersisted(state);
  }, [state]);

  const session = state.session;
  const member = useMemo(
    () =>
      session
        ? state.members.find((m) => m.id === session.memberId) ?? null
        : null,
    [session, state.members]
  );
  const org = useMemo(
    () =>
      session ? state.orgs.find((o) => o.id === session.orgId) ?? null : null,
    [session, state.orgs]
  );

  const role = member?.role ?? "employee";
  const navItems = useMemo(() => {
    const base: { id: RouteId; label: string }[] =
      role === "employee"
        ? [
            { id: "time", label: "Clock in" },
            { id: "dashboard", label: "Overview" },
            { id: "pay", label: "Pay" },
            { id: "schedule", label: "Schedule" },
            { id: "team", label: "Team" },
          ]
        : [
            { id: "dashboard", label: "Dashboard" },
            { id: "time", label: "Time & attendance" },
            { id: "team", label: "Team" },
            { id: "schedule", label: "Schedule" },
            { id: "pay", label: "Pay & paychecks" },
          ];
    if (canPayroll(role)) base.push({ id: "payroll", label: "Payroll run" });
    if (canManageEmployees(role))
      base.splice(2, 0, {
        id: "employees",
        label: "Employees & invites",
      });
    if (canCompany(role)) base.push({ id: "company", label: "Company" });
    return base;
  }, [role]);

  const createOrg = useCallback((orgName: string, founderName: string) => {
    dispatch({ type: "CREATE_ORG", orgName, founderName });
    setRoute("dashboard");
  }, []);

  const joinOrg = useCallback((code: string, displayName: string) => {
    const prev = stateRef.current;
    const org = prev.orgs.find(
      (o) => o.inviteCode === code.trim().toUpperCase()
    );
    if (!org) return false;
    dispatch({ type: "JOIN_ORG", code, displayName });
    setRoute("dashboard");
    return true;
  }, []);

  const enterDemoPower = useCallback((memberId: string, password: string) => {
    const power = SET_POWERS.find((p) => p.memberId === memberId);
    if (!power || power.password !== password.trim()) return false;
    const demo = buildDemoState();
    const next: AppState = {
      ...demo,
      session: { orgId: DEMO_ORG_ID, memberId },
    };
    dispatch({ type: "RESET", payload: next });
    setRoute("dashboard");
    return true;
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: "SET_SESSION", session: null });
    setRoute("dashboard");
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<Pick<Member, "name" | "avatarDataUrl" | "title" | "email">>) => {
      dispatch({ type: "UPDATE_PROFILE", patch });
    },
    []
  );

  const clockIn = useCallback(() => {
    dispatch({ type: "CLOCK_IN" });
  }, []);

  const startBreak = useCallback((entryId: string) => {
    dispatch({ type: "START_BREAK", entryId });
  }, []);

  const endBreak = useCallback((entryId: string) => {
    dispatch({ type: "END_BREAK", entryId });
  }, []);

  const clockOutShift = useCallback((entryId: string) => {
    const s = stateRef.current;
    const entry = s.timeEntries.find((e) => e.id === entryId);
    if (!entry || entry.status === "completed" || !entry.clockIn) return;
    const now = new Date().toISOString();
    const breaks = entry.breaks.map((b) =>
      b.end === null ? { ...b, end: now } : b
    );
    const completed: TimeEntry = {
      ...entry,
      clockOut: now,
      status: "completed",
      breaks,
    };
    const member = s.members.find((m) => m.id === entry.memberId);
    const totals = shiftTotals({
      clockIn: completed.clockIn,
      clockOut: completed.clockOut!,
      breaks: completed.breaks,
    });
    const row: ExportRow = {
      employeeId: member?.employeeCode ?? entry.memberId,
      employeeName: member?.name ?? "Unknown",
      clockIn: new Date(entry.clockIn).toLocaleString(),
      clockOut: new Date(now).toLocaleString(),
      totalHours: totals.totalHours,
      breakHours: totals.breakHours,
      paidHours: totals.paidHours,
      breakLog: formatBreakLog(completed.breaks, completed.clockOut!),
      entryId: entry.id,
      exportedAt: new Date().toISOString(),
    };
    dispatch({ type: "CLOCK_OUT", completed, row });
  }, []);

  const addShift = useCallback(
    (shift: Omit<Shift, "id" | "orgId">) => {
      dispatch({ type: "ADD_SHIFT", shift });
    },
    []
  );

  const createPersonalInvite = useCallback((assignedName: string) => {
    const s = stateRef.current;
    if (!s.session) return null;
    const me = s.members.find((m) => m.id === s.session!.memberId);
    if (!me || me.role !== "owner") return null;
    const token = randomToken(18);
    dispatch({
      type: "CREATE_PERSONAL_INVITE",
      orgId: me.orgId,
      ownerMemberId: me.id,
      assignedName,
      token,
    });
    return token;
  }, []);

  const acceptPersonalInvite = useCallback(
    (token: string, opts?: { avatarDataUrl?: string }) => {
      const s = stateRef.current;
      const inv = s.personalInvites.find((i) => i.token === token && !i.used);
      if (!inv) return { ok: false as const, reason: "invalid_or_used" };
      dispatch({
        type: "ACCEPT_PERSONAL_INVITE",
        token,
        avatarDataUrl: opts?.avatarDataUrl,
      });
      window.history.replaceState({}, "", window.location.pathname || "/");
      setRoute("dashboard");
      return { ok: true as const };
    },
    []
  );

  const removeMember = useCallback((targetMemberId: string) => {
    const s = stateRef.current;
    if (!s.session) return;
    dispatch({
      type: "REMOVE_MEMBER",
      orgId: s.session.orgId,
      actingMemberId: s.session.memberId,
      targetMemberId,
    });
  }, []);

  const revokePersonalInvite = useCallback((inviteId: string) => {
    const s = stateRef.current;
    if (!s.session) return;
    dispatch({
      type: "REVOKE_PERSONAL_INVITE",
      inviteId,
      orgId: s.session.orgId,
      ownerMemberId: s.session.memberId,
    });
  }, []);

  const value = useMemo<BizContextValue>(
    () => ({
      state,
      member,
      org,
      route,
      setRoute,
      profileOpen,
      setProfileOpen,
      navItems,
      createOrg,
      joinOrg,
      enterDemoPower,
      logout,
      updateProfile,
      clockIn,
      startBreak,
      endBreak,
      clockOutShift,
      addShift,
      createPersonalInvite,
      acceptPersonalInvite,
      removeMember,
      revokePersonalInvite,
      canSeeAllTime: canSeeAllTime(role),
      canManageShifts: canManageShifts(role),
      canPayroll: canPayroll(role),
      canCompany: canCompany(role),
      canManageEmployees: canManageEmployees(role),
    }),
    [
      state,
      member,
      org,
      route,
      profileOpen,
      navItems,
      createOrg,
      joinOrg,
      enterDemoPower,
      logout,
      updateProfile,
      clockIn,
      startBreak,
      endBreak,
      clockOutShift,
      addShift,
      createPersonalInvite,
      acceptPersonalInvite,
      removeMember,
      revokePersonalInvite,
      role,
    ]
  );

  return <BizContext.Provider value={value}>{children}</BizContext.Provider>;
}

export function useBiz() {
  const ctx = useContext(BizContext);
  if (!ctx) throw new Error("useBiz outside BizProvider");
  return ctx;
}
