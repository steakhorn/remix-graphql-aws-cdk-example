import type { LoaderFunction as RemixLoaderFunction } from "remix";
import type { GraphqlEndpoint } from "~/utils/types";

type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (
  ...a: Parameters<T>
) => TNewReturn;

export type LoaderFunction<TReturn = any> = ReplaceReturnType<
  RemixLoaderFunction,
  TReturn | Promise<TReturn>
>;

export function getGraphqlEndpoint(request: Request): GraphqlEndpoint {
  /**
   * When this Remix app is served from our Lambda @ Edge function, we get
   * these values from the custom headers we set there (Lambda @ Edge doesn't
   * support environment variables).
   *
   * When it's served from anywhere else (e.g. `npm run remix:dev`) these
   * values come from environment variables (i.e. our .env file).
   */

  const graphqlUrl =
    request.headers.get("graphqlUrl") || process?.env?.GRAPHQL_URL || "";
  const graphqlApiKey =
    request.headers.get("graphqlApiKey") || process?.env?.GRAPHQL_API_KEY || "";

  return { graphqlUrl, graphqlApiKey };
}
