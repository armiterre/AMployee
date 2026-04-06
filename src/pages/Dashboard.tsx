import { motion } from "framer-motion";
import { TimeExportsPanel } from "../components/TimeExportsPanel";
import { GlareCard } from "../components/react-bits/GlareCard";
import { StaggerReveal } from "../components/react-bits/StaggerReveal";
import { useBiz } from "../state/bizStore";

export function Dashboard() {
  const { member, org, state, canSeeAllTime, canManageEmployees, setRoute } = useBiz();
  if (!member || !org) return null;

  const entries = state.timeEntries.filter((e) => e.orgId === org.id);
  const open = entries.filter((e) => e.status !== "completed").length;
  const empCount = state.members.filter((m) => m.orgId === org.id && m.role === "employee").length;

  const myEntries = entries.filter((e) => e.memberId === member.id && e.status === "completed");
  const myHours = myEntries.reduce((acc, e) => {
    if (!e.clockOut) return acc;
    const ms = new Date(e.clockOut).getTime() - new Date(e.clockIn).getTime();
    return acc + ms / 3_600_000;
  }, 0);

  const exportRows = state.exportRowsByOrg[org.id] || [];

  const stats =
    member.role === "employee"
      ? [
          { label: "Completed shifts", value: String(myEntries.length) },
          { label: "Hours (completed)", value: myHours.toFixed(1) },
          { label: "Workplace", value: org.name },
        ]
      : [
          { label: "Active clocks", value: String(open) },
          { label: "Employees", value: String(empCount) },
          { label: "Workplace", value: org.name },
        ];

  const orgShifts = state.shifts
    .filter((s) => s.orgId === org.id)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const now = Date.now();
  const nextShift =
    orgShifts.find((s) => new Date(s.end).getTime() >= now) ?? null;

  const myStubs = state.payStubs.filter((p) => p.memberId === member.id);
  const lastStub = myStubs[0] ?? null;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-line bg-surface p-5"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              {s.label}
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-accent">{s.value}</div>
          </motion.div>
        ))}
      </div>

      {member.role === "employee" && (
        <StaggerReveal className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setRoute("time");
            }}
            onClick={() => setRoute("time")}
            className="cursor-pointer rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <GlareCard className="flex h-full flex-col p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-accent">
                Time
              </div>
              <div className="mt-2 text-lg font-bold text-ink">Clock in &amp; out</div>
              <p className="mt-2 flex-1 text-sm text-muted">
                Start and end shifts, breaks stay off paid time.
              </p>
              <span className="mt-4 text-sm font-semibold text-accent">Open clock →</span>
            </GlareCard>
          </div>

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setRoute("pay");
            }}
            onClick={() => setRoute("pay")}
            className="cursor-pointer rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <GlareCard className="flex h-full flex-col p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-accent">
                Pay
              </div>
              <div className="mt-2 text-lg font-bold text-ink">Paychecks</div>
              <p className="mt-2 flex-1 text-sm text-muted">
                {lastStub
                  ? `Latest stub: ${lastStub.periodLabel} · net $${lastStub.net.toFixed(2)}`
                  : "View pay history when stubs are posted."}
              </p>
              <span className="mt-4 text-sm font-semibold text-accent">View pay →</span>
            </GlareCard>
          </div>

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setRoute("schedule");
            }}
            onClick={() => setRoute("schedule")}
            className="cursor-pointer rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:col-span-2 lg:col-span-1"
          >
            <GlareCard className="flex h-full flex-col p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-accent">
                Schedule
              </div>
              <div className="mt-2 text-lg font-bold text-ink">Shifts</div>
              <p className="mt-2 flex-1 text-sm text-muted">
                {nextShift
                  ? `Next: ${nextShift.title} · ${new Date(nextShift.start).toLocaleString()}`
                  : "See what’s on the team calendar."}
              </p>
              <span className="mt-4 text-sm font-semibold text-accent">Open schedule →</span>
            </GlareCard>
          </div>
        </StaggerReveal>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-8 rounded-2xl border border-line bg-surface p-6"
      >
        <h3 className="font-bold text-ink">
          {member.role === "employee"
            ? `Hi, ${member.name.split(" ")[0]}`
            : `Hello, ${member.name.split(" ")[0]}`}
        </h3>
        <p className="mt-2 text-sm text-muted">
          {member.role === "employee"
            ? "Use the cards above for day-to-day work, or the menu anytime."
            : canSeeAllTime
              ? "Review team time below, export by week, and use other tabs for schedules and pay."
              : "Use the menu to move between tools."}
        </p>
      </motion.div>

      {canManageEmployees && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          onClick={() => setRoute("employees")}
          className="mt-6 w-full rounded-2xl border border-accent/30 bg-accent-dim/50 p-5 text-left transition-colors hover:bg-accent-dim sm:w-auto sm:min-w-[280px]"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-accent">Owner</div>
          <div className="mt-1 text-lg font-bold text-ink">Employees &amp; invite links</div>
          <p className="mt-2 text-sm text-muted">
            Personal links with names preset, roster, revoke invites.
          </p>
        </motion.button>
      )}

      {canSeeAllTime && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mt-10"
        >
          <TimeExportsPanel orgName={org.name} rows={exportRows} />
        </motion.div>
      )}
    </div>
  );
}
