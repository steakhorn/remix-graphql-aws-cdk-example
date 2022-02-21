import { Outlet, LoaderFunction, useLoaderData } from "remix";
import { gql } from "~/gql.server";
import type { BreadcrumbHandle } from "~/components/Breadcrumbs";

export const loader = async ({ params }: Parameters<LoaderFunction>[0]) => {
  try {
    const { album } = await gql.Album({ albumId: params.albumId! });
    if (!album) {
      throw new Response("Album not found", { status: 404 });
    }
    return { album };
  } catch (err) {
    throw new Response("Album not found", { status: 404 });
  }
};

export type AlbumData = Awaited<ReturnType<typeof loader>>;

export const handle: BreadcrumbHandle<AlbumData> = {
  breadcrumb: ({ data }) => `Album: ${data.album.title}`,
};

export const meta = ({ data }: { data: AlbumData }) => {
  return {
    title: `Album: ${data.album.title}`,
  };
};

export default function AlbumPage() {
  const { album } = useLoaderData<AlbumData>();
  return <Outlet context={album} />;
}
