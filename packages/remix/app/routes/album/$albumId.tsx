import { Outlet, useLoaderData } from "remix";
import { getGqlClient, AlbumQuery } from "~/gql.server";
import { ResourceErrorPage } from "~/components/ResourceErrorPage";
import type { LoaderFunction } from "~/utils/loader.server";
import type { BreadcrumbHandle } from "~/components/Breadcrumbs";
import type { NonNullable } from "~/utils/types";

type LoaderData = { album: NonNullable<AlbumQuery["album"]> };

export const loader: LoaderFunction<LoaderData> = async ({
  params,
  request,
}) => {
  try {
    const gql = getGqlClient(request);
    const { album } = await gql.Album({ albumId: params.albumId! });
    if (!album) {
      throw new Response("Album not found", { status: 404 });
    }
    return { album };
  } catch (err) {
    throw new Response("Album not found", { status: 404 });
  }
};

export const handle: BreadcrumbHandle<LoaderData> = {
  breadcrumb: ({ data }) => ({
    content: data ? `Album: ${data.album.title}` : "Album not found",
    preventLink: !data,
  }),
};

export const meta = ({ data }: { data?: LoaderData }) => {
  return {
    title: data ? `Album: ${data.album.title}` : "Album not found",
  };
};

export default function AlbumPage() {
  const { album } = useLoaderData<LoaderData>();
  return <Outlet context={album} />;
}

export function CatchBoundary() {
  return <ResourceErrorPage resourceName="album" />;
}
