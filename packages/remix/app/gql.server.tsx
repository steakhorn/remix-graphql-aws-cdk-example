import { GraphQLClient } from "graphql-request";
import { getSdk } from "~/graphql-request.server";
export * from "~/graphql-request.server";
import { getGraphqlEndpoint } from "~/utils/loader.server";

export function getGqlClient(request: Request) {
  const { graphqlUrl, graphqlApiKey } = getGraphqlEndpoint(request);
  const client = new GraphQLClient(graphqlUrl, {
    headers: { "x-api-key": graphqlApiKey },
  });
  return getSdk(client);
}
