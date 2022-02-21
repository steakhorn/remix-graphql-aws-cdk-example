import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({
  log: ["query", "info", `warn`, `error`],
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

async function seed() {
  /**
   * Genres
   */
  const [rock, hipHop, folk] = await Promise.all([
    db.genre.create({ data: { name: "Rock" } }),
    db.genre.create({ data: { name: "Hip Hop" } }),
    db.genre.create({ data: { name: "Folk" } }),
  ]);

  /**
   * Artists
   */
  const [davidBowie, outkast, queen] = await Promise.all([
    db.artist.create({ data: { name: "David Bowie" } }),
    db.artist.create({ data: { name: "Outkast" } }),
    db.artist.create({ data: { name: "Queen" } }),
  ]);

  /**
   * Albums + Tracks
   */
  const [hotSpace, hunkyDory, atliens] = await Promise.all([
    db.album.create({
      data: {
        title: "Hot Space",
        releaseDate: new Date("1982-05-24").toISOString(),
        artist: { connect: { id: queen.id } },
        tracks: {
          create: [
            { title: "Staying Power", duration: 251 },
            { title: "Dancer", duration: 229 },
            { title: "Back Chat", duration: 274 },
            { title: "Body Language", duration: 472 },
            { title: "Action This Day", duration: 212 },
            { title: "Put Out The Fire", duration: 198 },
            { title: "Life Is Real (Song For Lennon)", duration: 212 },
            { title: "Calling All Girls", duration: 231 },
            { title: "Las Palabras De Amore", duration: 271 },
            { title: "Cool Cat", duration: 209 },
            {
              title: "Under Pressure",
              duration: 245,
              artists: { connect: [{ id: davidBowie.id }] },
            },
          ].map(
            addTrackData({
              genres: [{ id: rock.id }],
              artists: [{ id: queen.id }],
            })
          ),
        },
      },
    }),
    db.album.create({
      data: {
        title: "Hunky Dory",
        releaseDate: new Date("1971-12-17").toISOString(),
        artist: { connect: { id: davidBowie.id } },
        tracks: {
          create: [
            { title: "Changes", duration: 217 },
            { title: "Oh! You Pretty Things", duration: 197 },
            { title: "Eight Line Poem", duration: 175 },
            { title: "Life on Mars?", duration: 235 },
            { title: "Kooks", duration: 173 },
            { title: "Quicksand", duration: 306 },
            { title: "Fill Your Heart", duration: 190 },
            { title: "Andy Warhol", duration: 234 },
            { title: "Song for Bob Dylan", duration: 253 },
            { title: "Queen Bitch", duration: 200 },
            { title: "The Bewlay Brothers", duration: 329 },
          ].map(
            addTrackData({
              genres: [{ id: rock.id }],
              artists: [{ id: davidBowie.id }],
            })
          ),
        },
      },
    }),
    db.album.create({
      data: {
        title: "ATLiens",
        releaseDate: new Date("1996-08-27").toISOString(),
        artist: { connect: { id: outkast.id } },
        tracks: {
          create: [
            {
              title: "You May Die (Intro)",
              duration: 66,
              genres: { connect: [{ id: folk.id }] },
            },
            { title: "Two Dope Boyz (In a Cadillac)", duration: 222 },
            { title: "ATLiens", duration: 230 },
            { title: "Wheelz of Steel", duration: 243 },
            { title: "Jazzy Belle", duration: 251 },
            { title: "Elevators (Me & You)", duration: 217 },
            { title: "Ova Da Wudz", duration: 227 },
            { title: "Babylon", duration: 264 },
            { title: "Wailin'", duration: 118 },
            { title: "Mainstream", duration: 318 },
            { title: "Decatur Psalm", duration: 238 },
            { title: "Millenium", duration: 189 },
            { title: "E.T. (Extraterrestrial)", duration: 186 },
            { title: "13th Floor/Growing Old", duration: 410 },
          ].map(
            addTrackData({
              genres: [{ id: hipHop.id }],
              artists: [{ id: outkast.id }],
            })
          ),
        },
      },
    }),
  ]);
}

seed();

type Connection = { id: string };
type TrackConfig = {
  title: string;
  duration: number;
  artists?: { connect: Connection[] };
  genres?: { connect: Connection[] };
};
function addTrackData({
  artists,
  genres,
}: {
  artists: Connection[];
  genres: Connection[];
}) {
  return (t: TrackConfig, i: number) => ({
    ...t,
    trackNumber: i + 1,
    artists: {
      ...t.artists,
      connect: [...(t.artists?.connect || []), ...artists],
    },
    genres: {
      ...t.genres,
      connect: [...(t.genres?.connect || []), ...genres],
    },
  });
}
