import { motion } from "framer-motion";
import { useMemo } from "react";
import { useBiz } from "../state/bizStore";

export function PayPage() {
  const { member, org, state } = useBiz();
  if (!member || !org) return null;

  const orgMemberIds = new Set(
    state.members.filter((m) => m.orgId === org.id).map((m) => m.id)
  );

  const stubs = useMemo(() => {
    let list = state.payStubs.filter((p) => orgMemberIds.has(p.memberId));
    if (member.role === "employee") {
      list = list.filter((p) => p.memberId === member.id);
    } else if (member.role === "manager") {
      const retail = new Set(
        state.members
          .filter((m) => m.orgId === org.id && m.department === "Retail")
          .map((m) => m.id)
      );
      list = list.filter((p) => retail.has(p.memberId));
    }
    return list;
  }, [state.payStubs, state.members, org.id, member]);

  return (
    <div className="space-y-4">
      {stubs.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface p-8 text-center text-muted">
          No paycheck samples for this workplace yet. (Demo paychecks appear when you load “Try full demo”.)
        </p>
      ) : (
        stubs.map((p, i) => {
          const u = state.members.find((m) => m.id === p.memberId);
          const showName = member.role !== "employee";
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-line bg-[#0c0f14] p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold text-ink">
                  {showName && u ? `${u.name} · ` : ""}
                  {p.periodLabel}
                </span>
                <span className="font-mono text-lg text-accent">
                  {p.net.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                  <span className="ml-1 text-sm text-muted">net</span>
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted sm:grid-cols-4">
                <span>Gross</span>
                <span className="text-ink">
                  {p.gross.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </span>
                <span>Taxes</span>
                <span className="text-ink">
                  {p.taxes.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </span>
                <span>Other</span>
                <span className="text-ink">
                  {p.other.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </span>
                <span>Hours</span>
                <span className="text-ink">{p.hours}</span>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
