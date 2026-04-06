import { motion } from "framer-motion";
import { TimeExportsPanel } from "../components/TimeExportsPanel";
import { useBiz } from "../state/bizStore";

export function PayrollPage() {
  const { org, state, canPayroll } = useBiz();
  if (!org || !canPayroll) {
    return (
      <p className="text-muted">Payroll run is for Owner and HR. Managers use Dashboard for time exports.</p>
    );
  }

  const rows = state.exportRowsByOrg[org.id] || [];
  const totalPaid = rows.reduce((a, r) => a + r.paidHours, 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-line bg-surface p-5"
        >
          <div className="text-xs font-semibold uppercase text-muted">Logged shifts</div>
          <div className="mt-1 font-mono text-2xl font-bold text-accent">{rows.length}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-line bg-surface p-5"
        >
          <div className="text-xs font-semibold uppercase text-muted">Sum paid hours (stored)</div>
          <div className="mt-1 font-mono text-2xl font-bold text-accent">{totalPaid.toFixed(2)}</div>
        </motion.div>
      </div>

      <p className="text-sm text-muted">
        Same week-by-week exports as the dashboard. Use this page when you’re focused on payroll
        tasks; stub paychecks are still under Pay &amp; paychecks.
      </p>

      <TimeExportsPanel orgName={org.name} rows={rows} />
    </div>
  );
}
