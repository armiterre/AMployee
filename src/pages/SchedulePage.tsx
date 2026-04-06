import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useBiz } from "../state/bizStore";

function shiftDurationHours(startIso: string, endIso: string): string {
  const h = (new Date(endIso).getTime() - new Date(startIso).getTime()) / 3_600_000;
  return `${h.toFixed(1)} h`;
}

export function SchedulePage() {
  const { org, state, canManageShifts, addShift } = useBiz();
  const [title, setTitle] = useState("");
  const [loc, setLoc] = useState("Main");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");

  if (!org) return null;

  const now = Date.now();
  const shifts = useMemo(
    () =>
      state.shifts
        .filter((s) => s.orgId === org.id)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [state.shifts, org.id]
  );

  const upcoming = shifts.filter((s) => new Date(s.start).getTime() > now);
  const next = upcoming[0] ?? null;

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !start || !end) return;
    const s = new Date(start).toISOString();
    const en = new Date(end).toISOString();
    if (en <= s) return;
    addShift({
      title: title.trim(),
      location: loc.trim() || "Main",
      start: s,
      end: en,
      notes: notes.trim(),
    });
    setTitle("");
    setNotes("");
  };

  return (
    <div className="space-y-6">
      {next && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-accent/30 bg-accent-dim p-6"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-accent">
            Next team shift
          </div>
          <h3 className="mt-1 text-xl font-bold text-ink">{next.title}</h3>
          <p className="mt-2 text-sm text-muted">
            {new Date(next.start).toLocaleString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}{" "}
            →{" "}
            {new Date(next.end).toLocaleString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
            <span className="ml-2 font-mono text-accent">
              ({shiftDurationHours(next.start, next.end)})
            </span>
          </p>
          <p className="mt-1 text-xs text-muted">{next.location}</p>
          {next.notes && (
            <p className="mt-2 text-sm text-ink/90">{next.notes}</p>
          )}
          <p className="mt-3 text-xs text-muted">
            This calendar is shared — everyone in {org.name} sees the same shifts.
          </p>
        </motion.div>
      )}

      {!next && (
        <div className="rounded-2xl border border-line bg-surface p-6 text-sm text-muted">
          No upcoming shifts scheduled. {canManageShifts ? "Add one below." : "Ask a manager to publish shifts."}
        </div>
      )}

      <div className="rounded-2xl border border-line bg-surface overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-bold text-ink">All scheduled shifts</h3>
        </div>
        <ul className="divide-y divide-line">
          {shifts.length === 0 ? (
            <li className="px-5 py-8 text-center text-muted">No shifts yet.</li>
          ) : (
            shifts.map((s, i) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="px-5 py-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold text-ink">{s.title}</span>
                  <span className="font-mono text-sm text-accent">
                    {shiftDurationHours(s.start, s.end)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {new Date(s.start).toLocaleString()} — {new Date(s.end).toLocaleString()}
                </p>
                <p className="text-xs text-muted">{s.location}</p>
                {s.notes && <p className="mt-1 text-sm text-ink/80">{s.notes}</p>}
              </motion.li>
            ))
          )}
        </ul>
      </div>

      {canManageShifts && (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={onAdd}
          className="rounded-2xl border border-line bg-surface p-6"
        >
          <h3 className="font-bold text-ink">Add shift (shared)</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold uppercase text-muted sm:col-span-2">
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-[#0c0f14] px-3 py-2 text-sm text-ink"
                placeholder="Opening shift"
              />
            </label>
            <label className="text-xs font-semibold uppercase text-muted">
              Location
              <input
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-[#0c0f14] px-3 py-2 text-sm text-ink"
              />
            </label>
            <div />
            <label className="text-xs font-semibold uppercase text-muted">
              Start
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-[#0c0f14] px-3 py-2 text-sm text-ink"
              />
            </label>
            <label className="text-xs font-semibold uppercase text-muted">
              End
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-[#0c0f14] px-3 py-2 text-sm text-ink"
              />
            </label>
            <label className="text-xs font-semibold uppercase text-muted sm:col-span-2">
              Notes
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-[#0c0f14] px-3 py-2 text-sm text-ink"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-[#04120f]"
          >
            Publish shift
          </button>
        </motion.form>
      )}
    </div>
  );
}
