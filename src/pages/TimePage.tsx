import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { BlurWords } from "../components/react-bits/BlurWords";
import { GradientText } from "../components/react-bits/GradientText";
import { shiftTotals } from "../lib/timeMath";
import { useBiz } from "../state/bizStore";

export function TimePage() {
  const {
    member,
    org,
    state,
    canSeeAllTime,
    clockIn,
    startBreak,
    endBreak,
    clockOutShift,
  } = useBiz();
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!member || !org) return null;

  const nowLabel = useMemo(
    () =>
      new Date().toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }),
    [tick]
  );

  const entries = useMemo(
    () =>
      state.timeEntries
        .filter((e) => e.orgId === org.id)
        .filter((e) => canSeeAllTime || e.memberId === member.id)
        .sort((a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime())
        .slice(0, 40),
    [state.timeEntries, org.id, canSeeAllTime, member.id]
  );

  const active = state.timeEntries.find(
    (e) =>
      e.orgId === org.id &&
      e.memberId === member.id &&
      e.status !== "completed"
  );

  const livePaidPreview = useMemo(() => {
    if (!active || !active.clockIn) return null;
    const now = new Date().toISOString();
    const breaks = active.breaks.map((b) =>
      b.end === null ? { ...b, end: now } : b
    );
    return shiftTotals({
      clockIn: active.clockIn,
      clockOut: now,
      breaks,
    });
  }, [active, tick]);

  const crewFocus = member.role === "employee";

  return (
    <div className="space-y-6">
      <div
        className={`rounded-3xl border border-dashed border-line bg-[#0c0f14]/90 ${
          crewFocus
            ? "border-accent/35 p-8 shadow-[0_0_60px_rgba(61,214,195,0.08)] md:p-12"
            : "p-6"
        }`}
      >
        <div
          className={`flex gap-6 ${
            crewFocus
              ? "flex-col items-center text-center"
              : "flex-wrap items-end justify-between"
          }`}
        >
          <div className={crewFocus ? "w-full max-w-xl" : ""}>
            {crewFocus && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <GradientText className="text-2xl font-bold md:text-3xl">Your shift</GradientText>
                <BlurWords
                  text="Clock in when you start. Breaks are unpaid until you end break."
                  className="mt-2 text-sm text-muted"
                />
              </motion.div>
            )}
            <div
              className={`font-mono text-accent ${
                crewFocus
                  ? "text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl"
                  : "text-2xl sm:text-3xl"
              }`}
            >
              {nowLabel}
            </div>
            <p className={`mt-2 text-muted ${crewFocus ? "text-base" : "text-sm"}`}>
              {active
                ? active.status === "on_break"
                  ? "On unpaid break — timer paused for pay."
                  : "You’re on the clock — use Break for meal or rest."
                : crewFocus
                  ? "You’re not clocked in yet."
                  : "Not clocked in."}
            </p>
            {livePaidPreview && (
              <p className={`mt-2 text-muted ${crewFocus ? "text-sm" : "text-xs"}`}>
                So far:{" "}
                <span className="text-ink">
                  {livePaidPreview.totalHours.toFixed(2)}h total
                </span>{" "}
                ·{" "}
                <span className="text-ink">
                  {livePaidPreview.breakHours.toFixed(2)}h break
                </span>{" "}
                ·{" "}
                <span className="font-semibold text-accent">
                  {livePaidPreview.paidHours.toFixed(2)}h paid
                </span>
              </p>
            )}
          </div>
          <div
            className={`flex flex-wrap gap-3 ${crewFocus ? "w-full max-w-md justify-center" : ""}`}
          >
            {!active && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => clockIn()}
                className={`rounded-2xl bg-accent font-bold text-[#04120f] ${
                  crewFocus ? "w-full px-8 py-5 text-lg md:text-xl" : "px-4 py-2.5 text-sm font-semibold"
                }`}
              >
                Clock in
              </motion.button>
            )}
            {active?.status === "active_work" && (
              <>
                <button
                  type="button"
                  onClick={() => startBreak(active.id)}
                  className={`rounded-xl border border-line font-semibold text-ink hover:bg-surface-hover ${
                    crewFocus ? "px-6 py-3 text-base" : "px-4 py-2.5 text-sm"
                  }`}
                >
                  Start break (unpaid)
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmEnd(true)}
                  className={`rounded-xl border border-red-400/40 bg-red-500/10 font-semibold text-red-300 ${
                    crewFocus ? "px-6 py-3 text-base" : "px-4 py-2.5 text-sm"
                  }`}
                >
                  End shift
                </button>
              </>
            )}
            {active?.status === "on_break" && (
              <>
                <button
                  type="button"
                  onClick={() => endBreak(active.id)}
                  className={`rounded-xl bg-accent font-semibold text-[#04120f] ${
                    crewFocus ? "px-6 py-3 text-base" : "px-4 py-2.5 text-sm"
                  }`}
                >
                  End break — resume
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmEnd(true)}
                  className={`rounded-xl border border-red-400/40 bg-red-500/10 font-semibold text-red-300 ${
                    crewFocus ? "px-6 py-3 text-base" : "px-4 py-2.5 text-sm"
                  }`}
                >
                  End shift from break
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {confirmEnd && active && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-line bg-surface p-5"
        >
          <p className="text-sm text-ink">
            End this shift completely? We’ll close any open break and save your{" "}
            <strong>paid hours</strong> (total time minus unpaid breaks). Your lead can export
            everyone’s hours from the dashboard — no file downloads to your device.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmEnd(false)}
              className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                clockOutShift(active.id);
                setConfirmEnd(false);
              }}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-[#04120f]"
              >
              Confirm end shift
            </button>
          </div>
        </motion.div>
      )}

      <div className="rounded-2xl border border-line bg-surface overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-bold text-ink">
            {canSeeAllTime ? "All time entries" : "My entries"}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase text-muted">
                {canSeeAllTime && <th className="px-4 py-3">Person</th>}
                <th className="px-4 py-3">In</th>
                <th className="px-4 py-3">Out</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Paid hrs</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={canSeeAllTime ? 5 : 4}
                    className="px-4 py-10 text-center text-muted"
                  >
                    No entries yet.
                  </td>
                </tr>
              ) : (
                entries.map((e) => {
                  const u = state.members.find((m) => m.id === e.memberId);
                  const paid =
                    e.clockOut && e.status === "completed"
                      ? shiftTotals({
                          clockIn: e.clockIn,
                          clockOut: e.clockOut,
                          breaks: e.breaks,
                        }).paidHours.toFixed(2)
                      : "—";
                  return (
                    <tr key={e.id} className="border-b border-line/80">
                      {canSeeAllTime && (
                        <td className="px-4 py-3 text-ink">{u?.name ?? e.memberId}</td>
                      )}
                      <td className="px-4 py-3 text-muted">
                        {new Date(e.clockIn).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {e.clockOut ? new Date(e.clockOut).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            e.status === "completed"
                              ? "text-muted"
                              : e.status === "on_break"
                                ? "text-amber-300"
                                : "text-accent"
                          }
                        >
                          {e.status === "completed"
                            ? "Done"
                            : e.status === "on_break"
                              ? "On break"
                              : "Working"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-accent">{paid}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
