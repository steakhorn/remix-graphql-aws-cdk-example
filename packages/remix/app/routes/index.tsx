import { MetaFunction, useLoaderData } from "remix";
import { gql, AlbumsQuery } from "~/gql.server";
import { Table, Column } from "~/components/Table";
import { Heading } from "~/components/Heading";
import { Link } from "~/components/Link";
import type { BreadcrumbHandle } from "~/components/Breadcrumbs";

export const loader = async () => {
  try {
    const { albums } = await gql.Albums();
    return { albums };
  } catch (err) {
    throw new Response("Not Found", { status: 404 });
  }
};

export let meta: MetaFunction = () => {
  return {
    title: "Music App",
    description: "Sample music app",
  };
};

export const handle: BreadcrumbHandle = {
  breadcrumb: () => "Albums",
};

type Album = AlbumsQuery["albums"][number];

const columns: Column<Album>[] = [
  {
    id: "title",
    title: "Title",
    accessor: (album) => <Link to={`album/${album.id}`}>{album.title}</Link>,
  },
  {
    id: "artist",
    title: "Artist",
    accessor: (album) => album.artist.name,
  },
  {
    id: "releaseDate",
    title: "Release date",
    accessor: (album) => (
      <time dateTime={album.releaseDate}>
        {new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(new Date(album.releaseDate))}
      </time>
    ),
  },
];

export default function Index() {
  const { albums } = useLoaderData<Awaited<ReturnType<typeof loader>>>();

  return (
    <main>
      <Heading title="Albums" />

      <Table<Album> columns={columns} rows={albums || []} />
    </main>
  );
}
