import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { buildInviteLink } from "../lib/inviteLink";
import { useBiz } from "../state/bizStore";

export function EmployeeManagementPage() {
  const {
    org,
    member,
    state,
    canManageEmployees,
    createPersonalInvite,
    removeMember,
    revokePersonalInvite,
    setRoute,
  } = useBiz();
  const [assignedName, setAssignedName] = useState("");
  const [lastLink, setLastLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState("");

  if (!org || !member || !canManageEmployees) {
    return (
      <p className="text-muted">Only the workplace owner can manage employees and invite links.</p>
    );
  }

  const team = useMemo(
    () => state.members.filter((m) => m.orgId === org.id),
    [state.members, org.id]
  );

  const pendingInvites = useMemo(
    () =>
      state.personalInvites.filter((i) => i.orgId === org.id && !i.used),
    [state.personalInvites, org.id]
  );

  const usedInvites = useMemo(
    () =>
      state.personalInvites.filter((i) => i.orgId === org.id && i.used),
    [state.personalInvites, org.id]
  );

  const onGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const name = assignedName.trim();
    if (!name) {
      setErr("Enter the employee name as it should appear on their account.");
      return;
    }
    const token = createPersonalInvite(name);
    if (!token) {
      setErr("Could not create invite. Make sure you are the owner.");
      return;
    }
    setLastLink(buildInviteLink(token));
    setAssignedName("");
    setCopied(false);
  };

  const copyLink = async () => {
    if (!lastLink) return;
    try {
      await navigator.clipboard.writeText(lastLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErr("Could not copy — select the link and copy manually.");
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-line bg-surface p-5"
      >
        <p className="text-sm text-muted">
          <strong className="text-ink">Time &amp; Excel:</strong> open{" "}
          <button
            type="button"
            onClick={() => setRoute("dashboard")}
            className="text-accent underline-offset-2 hover:underline"
          >
            Home (Dashboard)
          </button>{" "}
          — you and other leads export by week there. Crew members no longer get files when they
          clock out.
        </p>
      </motion.div>

      <div className="rounded-2xl border border-line bg-surface p-6">
        <h3 className="font-bold text-ink">Invite link (name chosen by you)</h3>
        <p className="mt-2 text-sm text-muted">
          Enter the employee&apos;s name exactly as they should appear. Share the link — they
          won&apos;t type their name; they only confirm and enter the app. They should open the
          link while <strong className="text-ink">signed out</strong> (or use a private browser
          window).
        </p>
        <form onSubmit={onGenerate} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-xs font-semibold uppercase text-muted">
            Employee display name
            <input
              value={assignedName}
              onChange={(e) => setAssignedName(e.target.value)}
              placeholder="e.g. Maria Santos"
              className="mt-1 w-full rounded-xl border border-line bg-[#0c0f14] px-3 py-2 text-sm text-ink"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-[#04120f]"
          >
            Create invite link
          </button>
        </form>
        {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
        {lastLink && (
          <div className="mt-5 rounded-xl border border-line bg-[#0c0f14] p-4">
            <div className="text-xs font-semibold uppercase text-muted">Link to send</div>
            <p className="mt-2 break-all font-mono text-xs text-accent">{lastLink}</p>
            <button
              type="button"
              onClick={copyLink}
              className="mt-3 rounded-lg border border-line px-3 py-1.5 text-sm text-ink hover:bg-surface-hover"
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-surface overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-bold text-ink">Pending invites</h3>
          <p className="text-sm text-muted">Links not used yet — revoke if you sent the wrong name.</p>
        </div>
        <ul className="divide-y divide-line">
          {pendingInvites.length === 0 ? (
            <li className="px-5 py-6 text-center text-sm text-muted">No open invites.</li>
          ) : (
            pendingInvites.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <div className="font-medium text-ink">{inv.assignedName}</div>
                  <div className="mt-1 break-all font-mono text-xs text-muted">
                    {buildInviteLink(inv.token)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(buildInviteLink(inv.token));
                      } catch {
                        /* ignore */
                      }
                    }}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => revokePersonalInvite(inv.id)}
                    className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-300"
                  >
                    Revoke
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-2xl border border-line bg-surface overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-bold text-ink">Everyone in this workplace</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase text-muted">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {team.map((m) => (
                <tr key={m.id} className="border-b border-line/80">
                  <td className="px-4 py-3 text-ink">{m.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-accent">{m.employeeCode}</td>
                  <td className="px-4 py-3 capitalize text-muted">{m.role}</td>
                  <td className="px-4 py-3 text-right">
                    {m.id !== member.id && m.role !== "owner" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              `Remove ${m.name} from this workplace? Their time entries here will be deleted from this device.`
                            )
                          ) {
                            removeMember(m.id);
                          }
                        }}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {usedInvites.length > 0 && (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="font-bold text-ink">Used invite links</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {usedInvites.map((inv) => (
              <li key={inv.id}>
                <span className="text-ink">{inv.assignedName}</span> — claimed
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
