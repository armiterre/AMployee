/** Parse and normalize ?invite= token from the URL (handles encoding). */

export function normalizeInviteToken(raw: string): string {
  const t = (raw || "").trim();
  if (!t) return "";
  try {
    return decodeURIComponent(t);
  } catch {
    return t;
  }
}

export function parseInviteFromSearch(search: string): string {
  try {
    const q = search.startsWith("?") ? search.slice(1) : search;
    const v = new URLSearchParams(q).get("invite");
    return normalizeInviteToken(v || "");
  } catch {
    return "";
  }
}
