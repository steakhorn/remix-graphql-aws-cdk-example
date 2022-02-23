import { MetaFunction, useLoaderData } from "remix";
import { getGqlClient, AlbumsQuery } from "~/gql.server";
import { Table, Column } from "~/components/Table";
import { Heading } from "~/components/Heading";
import { Link } from "~/components/Link";
import type { LoaderFunction } from "~/utils/loader.server";
import type { BreadcrumbHandle } from "~/components/Breadcrumbs";

type Albums = AlbumsQuery["albums"];
type Album = Albums[number];
type LoaderData = {
  albums: Albums;
};

export const loader: LoaderFunction<LoaderData> = async ({ request }) => {
  try {
    const gql = getGqlClient(request);
    const { albums } = await gql.Albums();
    return {
      albums,
    };
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
  breadcrumb: () => ({ content: "Albums" }),
};

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
  const { albums } = useLoaderData<LoaderData>();

  return (
    <main>
      <Heading title="Albums" />

      <Table<Album> columns={columns} rows={albums || []} />
    </main>
  );
}
