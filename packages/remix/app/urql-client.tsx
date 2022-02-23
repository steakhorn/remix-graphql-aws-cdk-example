import { ReactNode, FunctionComponent } from "react";
import {
  createClient,
  dedupExchange,
  cacheExchange,
  fetchExchange,
  ssrExchange,
  Provider as UrqlProvider,
  Client,
} from "urql";
import type { GraphqlEndpoint } from "~/utils/types";

/**
 * We're not actually using urql in this project currently. It's set up
 * for either server-side or client-side use, but the only time we'd
 * actually want to use it is for features that are a direct result
 * of a client-side user interaction, e.g. a typeahead/combobox.
 *
 * On the server-side, we're using graphql-request in our Remix loader
 * functions. The reason for using different libraries on the client vs
 * server comes down to convenience from their respective codegens.
 * Basically, graphql-request has codegen output that works better in a
 * Node setting, and urql has codegen output that works better within
 * a React tree (with an urql Provider ancestor).
 *
 * There's no performance penalty for using a different library on the
 * server, since it will never be sent over the wire to the client anyway.
 */

export const isServerSide = typeof document === "undefined";

export const urqlDataPlaceholder = "__~~URQL_FETCHED_DATA~~__";

export const ssr = ssrExchange({
  isClient: !isServerSide,
  initialState: !isServerSide ? window.__URQL_DATA__ : undefined,
});

let client: Client;
let Provider: FunctionComponent;
export function getUrql({ graphqlUrl, graphqlApiKey }: GraphqlEndpoint) {
  if (!client) {
    client = createClient({
      url: graphqlUrl,
      fetchOptions: () => {
        return {
          headers: { "x-api-key": graphqlApiKey },
        };
      },
      suspense: isServerSide,
      exchanges: [dedupExchange, cacheExchange, ssr, fetchExchange],
    });
  }

  if (!Provider) {
    Provider = ({ children }: { children?: ReactNode }) => {
      return <UrqlProvider value={client}>{children}</UrqlProvider>;
    };
  }

  return { client, Provider };
}

declare global {
  interface Window {
    __URQL_DATA__: any;
  }
}
