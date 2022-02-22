import { Outlet, LoaderFunction, useLoaderData } from "remix";
import { gql } from "~/gql.server";
import type { BreadcrumbHandle } from "~/components/Breadcrumbs";
import { ResourceErrorPage } from "~/components/ResourceErrorPage";

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
  breadcrumb: ({ data }) =>
    data ? `Album: ${data.album.title}` : "Album not found",
};

export const meta = ({ data }: { data?: AlbumData }) => {
  return {
    title: data ? `Album: ${data.album.title}` : "Album not found",
  };
};

export default function AlbumPage() {
  const { album } = useLoaderData<AlbumData>();
  return <Outlet context={album} />;
}

export function CatchBoundary() {
  return <ResourceErrorPage resourceName="album" />;
}
