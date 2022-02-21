import { match } from "ts-pattern";
import { PrismaClient, Artist, Album, Track, Genre } from "@prisma/client";
import { Context } from "aws-lambda";
import type {
  HandlerEvent,
  QueryAlbumsEvent,
  QueryAlbumEvent,
  QueryTrackEvent,
  ArtistAlbumsEvent,
  ArtistTracksEvent,
  AlbumArtistEvent,
  AlbumTracksEvent,
  TrackAlbumEvent,
  TrackArtistsEvent,
  TrackGenresEvent,
  GenreTracksEvent,
} from "./types";

export const db = new PrismaClient({
  log: ["query", "info", `warn`, `error`],
  rejectOnNotFound: true,
});

export const resolvers = [
  { typeName: "Query", fieldName: "albums" },
  { typeName: "Query", fieldName: "album" },
  { typeName: "Query", fieldName: "track" },
  { typeName: "Artist", fieldName: "albums" },
  { typeName: "Artist", fieldName: "tracks" },
  { typeName: "Album", fieldName: "artist" },
  { typeName: "Album", fieldName: "tracks" },
  { typeName: "Track", fieldName: "album" },
  { typeName: "Track", fieldName: "artists" },
  { typeName: "Track", fieldName: "genres" },
  { typeName: "Genre", fieldName: "tracks" },
] as const;

export async function handler(
  event: QueryAlbumsEvent,
  context: Context
): Promise<Album[]>;
export async function handler(
  event: QueryAlbumEvent,
  context: Context
): Promise<Album>;
export async function handler(
  event: QueryTrackEvent,
  context: Context
): Promise<Track>;
export async function handler(
  event: ArtistAlbumsEvent,
  context: Context
): Promise<Album[]>;
export async function handler(
  event: ArtistTracksEvent,
  context: Context
): Promise<Track[]>;
export async function handler(
  event: AlbumArtistEvent,
  context: Context
): Promise<Artist>;
export async function handler(
  event: AlbumTracksEvent,
  context: Context
): Promise<Track[]>;
export async function handler(
  event: TrackAlbumEvent,
  context: Context
): Promise<Album>;
export async function handler(
  event: TrackArtistsEvent,
  context: Context
): Promise<Artist[]>;
export async function handler(
  event: TrackGenresEvent,
  context: Context
): Promise<Genre[]>;
export async function handler(
  event: GenreTracksEvent,
  context: Context
): Promise<Track[]>;
export async function handler(event: HandlerEvent, context: Context) {
  context.callbackWaitsForEmptyEventLoop = false;

  const result = await match(event)
    .with({ info: { parentTypeName: "Query", fieldName: "albums" } }, () => {
      return db.album.findMany();
    })
    .with({ info: { parentTypeName: "Query", fieldName: "album" } }, (e) => {
      return db.album.findUnique({
        where: { id: e.arguments.albumId },
      });
    })
    .with({ info: { parentTypeName: "Query", fieldName: "track" } }, (e) => {
      return db.track.findUnique({
        where: { id: e.arguments.trackId },
      });
    })
    .with({ info: { parentTypeName: "Artist", fieldName: "albums" } }, (e) => {
      return db.album.findMany({
        where: { artistId: e.source.id },
      });
    })
    .with({ info: { parentTypeName: "Artist", fieldName: "tracks" } }, (e) => {
      return db.track.findMany({
        where: { artists: { some: { id: e.source.id } } },
      });
    })
    .with({ info: { parentTypeName: "Album", fieldName: "artist" } }, (e) => {
      return db.artist.findUnique({
        where: { id: e.source.artistId },
      });
    })
    .with({ info: { parentTypeName: "Album", fieldName: "tracks" } }, (e) => {
      return db.track.findMany({
        where: { albumId: e.source.id },
      });
    })
    .with({ info: { parentTypeName: "Track", fieldName: "album" } }, (e) => {
      return db.album.findUnique({
        where: { id: e.source.albumId },
      });
    })
    .with({ info: { parentTypeName: "Track", fieldName: "artists" } }, (e) => {
      return db.artist.findMany({
        where: { tracks: { some: { id: e.source.id } } },
      });
    })
    .with({ info: { parentTypeName: "Track", fieldName: "genres" } }, (e) => {
      return db.genre.findMany({
        where: { tracks: { some: { id: e.source.id } } },
      });
    })
    .with({ info: { parentTypeName: "Genre", fieldName: "tracks" } }, (e) => {
      return db.track.findMany({
        where: { genres: { some: { id: e.source.id } } },
      });
    })
    .exhaustive();

  return result;
}
