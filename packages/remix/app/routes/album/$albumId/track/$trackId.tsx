import type { ReactNode } from "react";
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
        subHeading={listFormatter.format(track.artists.map((a) => a.name))}
      />
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="border-t border-gray-200 p-0">
          <dl className="divide-y divide-gray-200">
            <Row label="Album">
              <Link to={`/album/${track.album.id}`}>{track.album.title}</Link>
            </Row>
            <Row label="Duration">{formatDuration(track.duration)}</Row>
            <Row label="Artist(s)">
              {listFormatter.format(track.artists.map((a) => a.name))}
            </Row>
            <Row label="Genre(s)">
              {listFormatter.format(track.genres.map((a) => a.name))}
            </Row>
          </dl>
        </div>
      </div>
    </main>
  );
}

type RowProps = { children: ReactNode; label: ReactNode };
function Row({ children, label }: RowProps) {
  return (
    <div className="p-4 sm:flex">
      <dt className="text-sm font-medium text-gray-500 flex-none w-36">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:flex-1">
        {children}
      </dd>
    </div>
  );
}

export const handle: BreadcrumbHandle<TrackData> = {
  breadcrumb: ({ data }) => ({
    content: data ? `Track: ${data.track.title}` : "Track not found",
    preventLink: !data,
  }),
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
