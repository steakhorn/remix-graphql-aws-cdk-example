import { ReactNode } from "react";
import {
  createClient,
  dedupExchange,
  cacheExchange,
  fetchExchange,
  ssrExchange,
  Provider,
} from "urql";

/**
 * We're not actually using urql currently. It's set up to work
 * on this project (including SSR), but we're using graphql-request
 * within Remix route loaders right now.
 */

export const isServerSide = typeof document === "undefined";

export const urqlDataPlaceholder = "__~~URQL_FETCHED_DATA~~__";

export const ssr = ssrExchange({
  isClient: !isServerSide,
  initialState: !isServerSide ? window.__URQL_DATA__ : undefined,
});

export const client = createClient({
  url: "https://shanecav-music-app.graphcdn.app",
  fetchOptions: () => {
    return {
      headers: { "x-api-key": "da2-4hwqyncgyfd3xndoawskzweu2e" },
    };
  },
  suspense: isServerSide,
  exchanges: [dedupExchange, cacheExchange, ssr, fetchExchange],
});

export function UrqlProvider({ children }: { children: ReactNode }) {
  return <Provider value={client}>{children}</Provider>;
}

declare global {
  interface Window {
    __URQL_DATA__: any;
  }
}
