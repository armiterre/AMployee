import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Member } from "../types";
import { useBiz } from "../state/bizStore";

export function ProfileModal({
  member,
  open,
  onClose,
}: {
  member: Member;
  open: boolean;
  onClose: () => void;
}) {
  const { updateProfile } = useBiz();
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [title, setTitle] = useState(member.title);
  const [avatar, setAvatar] = useState(member.avatarDataUrl ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(member.name);
      setEmail(member.email);
      setTitle(member.title);
      setAvatar(member.avatarDataUrl ?? "");
    }
  }, [open, member]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = () => setAvatar(String(r.result));
    r.readAsDataURL(f);
  };

  const save = () => {
    updateProfile({
      name: name.trim() || member.name,
      email: email.trim(),
      title: title.trim(),
      avatarDataUrl: avatar || undefined,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-labelledby="profile-title"
            className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-glow"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="profile-title" className="text-lg font-bold text-ink">
              Your profile
            </h2>
            <p className="mt-1 text-sm text-muted">
              {member.employeeCode} · {member.role}
            </p>

            <div className="mt-5 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative h-24 w-24 overflow-hidden rounded-2xl border border-line bg-[#0c0f14] text-2xl font-bold text-accent"
              >
                {avatar ? (
                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFile}
              />
              <span className="text-xs text-muted">Tap to change photo</span>
            </div>

            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-muted">
              Display name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-[#0c0f14] px-3 py-2 text-sm text-ink"
              />
            </label>
            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-muted">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-[#0c0f14] px-3 py-2 text-sm text-ink"
              />
            </label>
            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-muted">
              Job title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-[#0c0f14] px-3 py-2 text-sm text-ink"
              />
            </label>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-muted hover:bg-surface-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-[#04120f]"
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
