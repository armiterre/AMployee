import { useMemo } from "react";
import { useSearchString } from "./hooks/useSearchString";
import { parseInviteFromSearch } from "./lib/inviteParam";
import { BizProvider, useBiz } from "./state/bizStore";
import { AppShell } from "./pages/AppShell";
import { Landing } from "./pages/Landing";

function Gate() {
  const search = useSearchString();
  const { state, member } = useBiz();

  const pendingInvite = useMemo(() => {
    const token = parseInviteFromSearch(search);
    if (!token) return null;
    return (
      state.personalInvites.find((i) => i.token === token && !i.used) ?? null
    );
  }, [search, state.personalInvites]);

  // Valid unused personal invite: always show landing so the link works even if someone is still signed in.
  if (pendingInvite) return <Landing />;

  if (!state.session || !member) return <Landing />;
  return <AppShell />;
}

export default function App() {
  return (
    <BizProvider>
      <Gate />
    </BizProvider>
  );
}
