import type { AppSyncResolverEvent } from "aws-lambda";
import { Artist, Album, Track, Genre } from "@prisma/client";
import { resolvers } from "./appsync-data-source";
import type { QueryAlbumArgs, QueryTrackArgs } from "../appsync";

export type TypeName = typeof resolvers[number]["typeName"];
export type FieldName = typeof resolvers[number]["fieldName"];

/**
 * This is a helper type I've created to give more accurate types for our handler's
 * event argument. It basically recreates the aws-lambda AppSyncResolverEvent type,
 * with the added bonus of allowing info.fieldname and info.parentTypeName to be
 * string literals instead of just the `string` type.
 *
 * This allows us to do pattern matching with better type safety based on these values,
 * which makes it easier to route this handler to resolve the appropriate data.
 */
export type ResolverEvent<
  TParentTypeName extends TypeName = TypeName,
  TFieldName extends FieldName = FieldName,
  TArgs = {},
  TSource = Record<string, any> | null
> = AppSyncResolverEvent<TArgs, TSource> & {
  info: { fieldName: TFieldName; parentTypeName: TParentTypeName };
};

/**
 * Resolver events and handler
 */

export type QueryAlbumsEvent = ResolverEvent<"Query", "albums", {}>;
export type QueryAlbumEvent = ResolverEvent<"Query", "album", QueryAlbumArgs>;
export type QueryTrackEvent = ResolverEvent<"Query", "track", QueryTrackArgs>;
export type ArtistAlbumsEvent = ResolverEvent<"Artist", "albums", {}, Artist>;
export type ArtistTracksEvent = ResolverEvent<"Artist", "tracks", {}, Artist>;
export type AlbumArtistEvent = ResolverEvent<"Album", "artist", {}, Album>;
export type AlbumTracksEvent = ResolverEvent<"Album", "tracks", {}, Album>;
export type TrackAlbumEvent = ResolverEvent<"Track", "album", {}, Track>;
export type TrackArtistsEvent = ResolverEvent<"Track", "artists", {}, Track>;
export type TrackGenresEvent = ResolverEvent<"Track", "genres", {}, Track>;
export type GenreTracksEvent = ResolverEvent<"Genre", "tracks", {}, Genre>;

export type HandlerEvent =
  | QueryAlbumsEvent
  | QueryAlbumEvent
  | QueryTrackEvent
  | ArtistAlbumsEvent
  | ArtistTracksEvent
  | AlbumArtistEvent
  | AlbumTracksEvent
  | TrackAlbumEvent
  | TrackArtistsEvent
  | TrackGenresEvent
  | GenreTracksEvent;
