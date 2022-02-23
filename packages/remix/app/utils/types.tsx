export type GraphqlEndpoint = {
  graphqlUrl: string;
  graphqlApiKey: string;
};

export type NonNullable<T> = Exclude<T, null | undefined>;
