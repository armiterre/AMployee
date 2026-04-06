import { useBiz } from "../state/bizStore";

export function CompanyPage() {
  const { org, canCompany } = useBiz();
  if (!org || !canCompany) {
    return <p className="text-muted">Only the workplace owner can edit company details here.</p>;
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h3 className="font-bold text-ink">{org.name}</h3>
      <p className="mt-2 text-sm text-muted">
        Share this short code for quick join, or use{" "}
        <strong className="text-ink">Employees &amp; invites</strong> to send a personal link with
        each person&apos;s name already set.
      </p>
      <div className="mt-6 rounded-xl border border-accent/30 bg-accent-dim p-6 text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted">
          Invite code
        </div>
        <div className="mt-2 font-mono text-3xl font-bold tracking-wider text-accent">
          {org.inviteCode}
        </div>
      </div>
      <table className="mt-8 w-full text-sm">
        <tbody className="text-muted">
          <tr className="border-b border-line">
            <th className="py-3 pr-4 text-left font-semibold text-ink">Pay schedule</th>
            <td className="py-3">Bi-weekly (demo policy)</td>
          </tr>
          <tr className="border-b border-line">
            <th className="py-3 pr-4 text-left font-semibold text-ink">Breaks</th>
            <td className="py-3">Unpaid — tracked separately from paid hours</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
