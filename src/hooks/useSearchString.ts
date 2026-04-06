import { useEffect, useState } from "react";

/** Re-renders when `history.pushState` / `replaceState` or `popstate` changes the query string. */
export function useSearchString(): string {
  const [search, setSearch] = useState(() => window.location.search);

  useEffect(() => {
    const sync = () => setSearch(window.location.search);

    const origPush = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);

    history.pushState = (...args: Parameters<History["pushState"]>) => {
      origPush(...args);
      sync();
    };
    history.replaceState = (...args: Parameters<History["replaceState"]>) => {
      origReplace(...args);
      sync();
    };

    window.addEventListener("popstate", sync);
    return () => {
      history.pushState = origPush;
      history.replaceState = origReplace;
      window.removeEventListener("popstate", sync);
    };
  }, []);

  return search;
}
