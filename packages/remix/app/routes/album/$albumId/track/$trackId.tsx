import { LoaderFunction, useLoaderData } from "remix";
import { gql } from "~/gql.server";
import { BreadcrumbHandle } from "~/components/Breadcrumbs";

import { Heading } from "~/components/Heading";
import { Link } from "~/components/Link";
import { ResourceErrorPage } from "~/components/ResourceErrorPage";

export const loader = async ({ params }: Parameters<LoaderFunction>[0]) => {
  try {
    const { track } = await gql.Track({ trackId: params.trackId! });
    if (!track) {
      throw new Response("Track not found", { status: 404 });
    }
    return { track };
  } catch (err) {
    throw new Response("Track not found", { status: 404 });
  }
};

export type TrackData = Awaited<ReturnType<typeof loader>>;

export default function TrackPage() {
  const { track } = useLoaderData<Awaited<ReturnType<typeof loader>>>();
  const listFormatter = new Intl.ListFormat("en", {
    style: "long",
    type: "conjunction",
  });
  return (
    <main>
      <Heading
        title={track.title}
        subHeading={track.artists.map((a) => a.name).join(", ")}
      />
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Album</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <Link to={`/album/${track.album.id}`}>{track.album.title}</Link>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Duration</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDuration(track.duration)}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Artist(s)</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {listFormatter.format(track.artists.map((a) => a.name))}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Genre(s)</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {listFormatter.format(track.genres.map((a) => a.name))}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}

export const handle: BreadcrumbHandle<TrackData> = {
  breadcrumb: ({ data }) =>
    data ? `Track: ${data.track.title}` : "Track not found",
};

export const meta = ({ data }: { data?: TrackData }) => {
  return {
    title: data ? `Track: ${data.track.title}` : "Track not found",
  };
};

export function CatchBoundary() {
  return <ResourceErrorPage resourceName="track" />;
}

export function formatDuration(duration: number) {
  const minutes = Math.floor(duration / 60);
  const seconds = duration - minutes * 60;
  return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
}

declare namespace Intl {
  type ListType = "conjunction" | "disjunction";

  interface ListFormatOptions {
    localeMatcher?: "lookup" | "best fit";
    type?: ListType;
    style?: "long" | "short" | "narrow";
  }

  interface ListFormatPart {
    type: "element" | "literal";
    value: string;
  }

  class ListFormat {
    constructor(locales?: string | string[], options?: ListFormatOptions);
    format(values: any[]): string;
    formatToParts(values: any[]): ListFormatPart[];
    supportedLocalesOf(
      locales: string | string[],
      options?: ListFormatOptions
    ): string[];
  }
}
