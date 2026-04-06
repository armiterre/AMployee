import { AnimatePresence, motion } from "framer-motion";
import { ProfileModal } from "../components/ProfileModal";
import type { RouteId } from "../types";
import { useBiz } from "../state/bizStore";
import { CompanyPage } from "./CompanyPage";
import { Dashboard } from "./Dashboard";
import { EmployeeManagementPage } from "./EmployeeManagementPage";
import { PayPage } from "./PayPage";
import { PayrollPage } from "./PayrollPage";
import { SchedulePage } from "./SchedulePage";
import { TeamPage } from "./TeamPage";
import { TimePage } from "./TimePage";

const titles: Record<RouteId, { title: string; sub: string }> = {
  dashboard: { title: "Dashboard", sub: "Overview for your role" },
  time: { title: "Time & attendance", sub: "Clock in, breaks, and paid hours" },
  team: { title: "Team", sub: "Shared roster" },
  schedule: { title: "Schedule", sub: "Next shifts for everyone" },
  pay: { title: "Pay & paychecks", sub: "History and earnings" },
  payroll: { title: "Payroll run", sub: "Time exports and payroll context" },
  company: { title: "Company", sub: "Invite and policy" },
  employees: {
    title: "Employees & invites",
    sub: "Personal links and roster",
  },
};

export function AppShell() {
  const {
    member,
    org,
    route,
    setRoute,
    navItems,
    logout,
    profileOpen,
    setProfileOpen,
  } = useBiz();

  if (!member || !org) return null;

  const { title, sub } =
    route === "time" && member.role === "employee"
      ? { title: "Clock in", sub: "Your shift starts and ends here" }
      : route === "dashboard" && member.role === "employee"
        ? { title: "Overview", sub: "Your shift, pay, and schedule" }
        : titles[route] ?? titles.dashboard;

  const initials = member.name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const body = (() => {
    switch (route) {
      case "dashboard":
        return <Dashboard />;
      case "time":
        return <TimePage />;
      case "team":
        return <TeamPage />;
      case "schedule":
        return <SchedulePage />;
      case "pay":
        return <PayPage />;
      case "payroll":
        return <PayrollPage />;
      case "company":
        return <CompanyPage />;
      case "employees":
        return <EmployeeManagementPage />;
      default:
        return <Dashboard />;
    }
  })();

  return (
    <>
      <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
        <aside className="hidden flex-col border-r border-line bg-surface md:flex">
          <div className="flex items-center gap-2 border-b border-line p-5">
            <div className="h-9 w-9 rounded-lg bg-accent/20 text-center text-lg leading-9 text-accent">
              ⧉
            </div>
            <div>
              <div className="text-sm font-bold text-ink">AMployee</div>
              <div className="text-xs text-muted">{org.name}</div>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
              Invite code
            </div>
            <div className="rounded-xl border border-line bg-[#0c0f14] px-3 py-2 font-mono text-sm tracking-wider text-accent">
              {org.inviteCode}
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 px-3">
            {navItems.map((n) => (
              <motion.button
                key={n.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setRoute(n.id)}
                className={`rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  route === n.id
                    ? "bg-accent-dim text-accent"
                    : "text-muted hover:bg-surface-hover hover:text-ink"
                }`}
              >
                {n.label}
              </motion.button>
            ))}
          </nav>

          <div className="border-t border-line p-4">
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-surface-hover"
            >
              <div className="h-10 w-10 overflow-hidden rounded-xl border border-line bg-[#0c0f14] text-center text-sm font-bold leading-10 text-accent">
                {member.avatarDataUrl ? (
                  <img
                    src={member.avatarDataUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink">
                  {member.name}
                </div>
                <div className="truncate text-xs capitalize text-muted">
                  {member.role} · {member.employeeCode}
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={logout}
              className="mt-2 w-full rounded-xl border border-line py-2 text-sm text-muted hover:text-ink"
            >
              Leave workplace
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 md:hidden">
            <span className="font-bold text-ink">AMployee</span>
            <select
              value={route}
              onChange={(e) => setRoute(e.target.value as RouteId)}
              className="ml-auto max-w-[55%] rounded-lg border border-line bg-[#0c0f14] px-2 py-1 text-sm text-ink"
            >
              {navItems.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </header>

          <header className="px-6 pb-2 pt-6 md:px-8">
            <motion.h1
              key={route}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold tracking-tight text-ink"
            >
              {title}
            </motion.h1>
            <p className="mt-1 text-sm text-muted">{sub}</p>
          </header>

          <main className="flex-1 px-6 pb-10 md:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={route}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {body}
              </motion.div>
            </AnimatePresence>
          </main>

          <div className="border-t border-line bg-surface p-4 md:hidden">
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl border border-line p-3"
            >
              <div className="h-10 w-10 overflow-hidden rounded-lg bg-[#0c0f14] text-center text-sm font-bold leading-10 text-accent">
                {member.avatarDataUrl ? (
                  <img
                    src={member.avatarDataUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="text-left text-sm font-medium text-ink">Profile</div>
            </button>
            <button
              type="button"
              onClick={logout}
              className="mt-2 w-full rounded-xl py-2 text-sm text-muted"
            >
              Leave workplace
            </button>
          </div>
        </div>
      </div>

      <ProfileModal
        member={member}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
}
