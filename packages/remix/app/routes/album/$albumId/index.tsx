import { useOutletContext } from "remix";

import { Table, Column } from "~/components/Table";
import { Heading } from "~/components/Heading";
import { Link } from "~/components/Link";
import { formatDuration } from "./track/$trackId";
import type { AlbumData } from "../$albumId";

type Track = AlbumData["album"]["tracks"][number];

const columns: Column<Track>[] = [
  {
    id: "trackNumber",
    title: "",
    accessor: (track) => track.trackNumber,
    className: "w-16",
  },
  {
    id: "title",
    title: "Title",
    accessor: (track) => <Link to={`track/${track.id}`}>{track.title}</Link>,
  },
  {
    id: "duration",
    title: "Duration",
    accessor: ({ duration }) => {
      return formatDuration(duration);
    },
  },
];

export default function AlbumPage() {
  const album = useOutletContext<AlbumData["album"]>();

  const tracks =
    album.tracks.sort((a, b) => (a.trackNumber > b.trackNumber ? 1 : -1)) || [];

  return (
    <main>
      <Heading title={album.title} subHeading={album.artist.name} />

      <Table<Track> columns={columns} rows={tracks} />
    </main>
  );
}
