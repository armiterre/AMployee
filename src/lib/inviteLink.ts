/** Full URL — employee should be signed out when they open it. */
export function buildInviteLink(token: string): string {
  if (typeof window === "undefined") return "";
  const { origin, pathname } = window.location;
  const path = pathname && pathname !== "" ? pathname : "/";
  return `${origin}${path}?invite=${encodeURIComponent(token)}`;
}
