import * as React from "react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from "remix";
import { LoaderFunction, getGraphqlEndpoint } from "~/utils/loader.server";
import { getUrql, isServerSide, urqlDataPlaceholder } from "~/urql-client";
import { Breadcrumbs, BreadcrumbHandle } from "./components/Breadcrumbs";
import { Link } from "./components/Link";
import tailwindStyles from "./tailwind.css";
import favicon from "~/images/favicon.png";

import type { LinksFunction } from "remix";
import type { GraphqlEndpoint } from "~/utils/types";

export const loader: LoaderFunction<GraphqlEndpoint> = ({ request }) => {
  try {
    /**
     * This app is designed so that the AppSync API Key is the authentication
     * method used for publicly accessible data. So in our case this isn't a
     * secret we're concerned about exposing to the client side.
     */
    return getGraphqlEndpoint(request);
  } catch (err) {
    throw new Response("Unable to retrieve data from the server", {
      status: 500,
    });
  }
};
/**
 * The root loader is only used to hydrate our GraphQL endpoint data
 * once - we never need it to load again.
 */
export const unstable_shouldReload = () => false;

export const handle: BreadcrumbHandle = {
  breadcrumb: () => ({ content: "Home" }),
};

export let links: LinksFunction = () => {
  return [
    { rel: "icon", href: favicon },
    { rel: "stylesheet", href: tailwindStyles },
  ];
};

/**
 * The root module's default export is a component that renders the current
 * route via the `<Outlet />` component. Think of this as the global layout
 * component for your app.
 */
export default function App() {
  const graphqlEndpoint = useLoaderData();
  const { Provider } = getUrql(graphqlEndpoint);
  return (
    <Provider>
      <Document>
        <Layout>
          <Outlet />
        </Layout>
      </Document>
    </Provider>
  );
}

function Document({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en" className="h-full bg-gray-100">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
        {/*
         * In SSR we inject a string which will be replaced by a <script> tag
         * used for hydrating urql data on the client side. See entry.server.tsx.
         */}
        {isServerSide ? urqlDataPlaceholder : null}
      </body>
    </html>
  );
}

function Layout({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="min-h-full">
      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="group">
              <Link to="/">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img
                      className="h-8 w-8 group-hover:rotate-180 duration-300 ease-out"
                      src={favicon}
                      alt="Music App"
                    />
                  </div>
                  <h3 className="ml-4 text-md font-semibold text-indigo-100 uppercase tracking-widest">
                    Music App
                  </h3>
                </div>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6"></div>
            </div>
          </div>
        </div>
      </div>

      <header className="bg-white shadow">
        <Breadcrumbs />
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export function CatchBoundary() {
  let caught = useCatch();

  let message;
  switch (caught.status) {
    case 401:
      message = (
        <p>
          Looks like you tried to visit a page that you do not have access to.
        </p>
      );
      break;
    case 404:
      message = (
        <p>Looks like you tried to visit a page that does not exist.</p>
      );
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <Layout>
        <h1>
          {caught.status}: {caught.statusText}
        </h1>
        {message}
      </Layout>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <Document title="Error!">
      <Layout>
        <div>
          <h1>There was an error</h1>
          <p>{error.message}</p>
        </div>
      </Layout>
    </Document>
  );
}
