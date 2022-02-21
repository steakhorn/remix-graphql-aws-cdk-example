import { renderToString } from "react-dom/server";
import { RemixServer } from "remix";
import prepass from "react-ssr-prepass";
import DOMPurify from "isomorphic-dompurify";
import type { EntryContext } from "remix";

import { ssr, urqlDataPlaceholder } from "./utils/urql-client";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const element = <RemixServer context={remixContext} url={request.url} />;

  /**
   * We're using a two-pass approach to fetch all of the data for the current
   * route in our server-side rendering.
   *
   * The first pass uses `react-ssr-prepass` to render the app at this route with
   * an unofficial Suspense implementation, which allows us to wait for all urql
   * data to be fetched before the rendering completes. We then extract that
   * fetched data and store it to a `data` variable.
   *
   * The second pass renders the app at this route into a string (as normal for
   * SSR) and stores it to a `markup` variable. We then insert our collected data
   * into that markup string so that the urql Client can use it to hydrate its
   * initial state once JS loads in the browser (client-side).
   *
   * The affect on server-side rendering speed with this approach is tiny. We're
   * not doing any DOM manipulations here so the renders are super fast. Doing an
   * extra one should only add a couple milliseconds.
   *
   * Note: This two-pass approach will no longer be necessary once React supports
   * Suspense in server-side rendering. At that point we can just render into a
   * string once, with Suspense.
   */
  await prepass(element);

  let markup = renderToString(element);

  // Extract the data after prepass and rendering
  const data = JSON.stringify(ssr.extractData());

  markup = markup.replace(
    urqlDataPlaceholder,
    `<script>window.__URQL_DATA__ = ${DOMPurify.sanitize(data)};</script>`
  );

  responseHeaders.set("Content-Type", "text/html");

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
