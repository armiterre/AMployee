import { motion } from "framer-motion";
import { useBiz } from "../state/bizStore";

const badge: Record<string, string> = {
  owner: "bg-amber-500/20 text-amber-300",
  manager: "bg-accent/20 text-accent",
  hr: "bg-violet-500/20 text-violet-300",
  employee: "bg-line text-muted",
};

export function TeamPage() {
  const { org, state } = useBiz();
  if (!org) return null;

  const members = state.members.filter((m) => m.orgId === org.id);

  return (
    <div className="rounded-2xl border border-line bg-surface overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <h3 className="font-bold text-ink">Team directory</h3>
        <p className="text-sm text-muted">Shared roster for {org.name}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase text-muted">
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Dept</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <motion.tr
                key={m.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-line/80"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 overflow-hidden rounded-lg border border-line bg-[#0c0f14] text-center text-xs font-bold leading-9 text-accent">
                      {m.avatarDataUrl ? (
                        <img
                          src={m.avatarDataUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        m.name
                          .split(" ")
                          .map((x) => x[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-ink">{m.name}</div>
                      <div className="text-xs text-muted">{m.email || "—"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-accent">
                  {m.employeeCode}
                </td>
                <td className="px-4 py-3 text-muted">{m.title}</td>
                <td className="px-4 py-3 text-muted">{m.department}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${badge[m.role]}`}
                  >
                    {m.role}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
