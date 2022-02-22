import { GraphQLClient } from "graphql-request";
import { getSdk } from "~/graphql-request.server";
export * from "~/graphql-request.server";

const client = new GraphQLClient("https://shanecav-music-app.graphcdn.app", {
  headers: { "x-api-key": "da2-4hwqyncgyfd3xndoawskzweu2e" },
});
export const gql = getSdk(client);
