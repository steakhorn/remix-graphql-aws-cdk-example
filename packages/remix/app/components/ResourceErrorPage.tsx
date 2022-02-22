import { useCatch } from "remix";
import { Link } from "./Link";

type Props = {
  resourceName: string; // lowercase
};

export function ResourceErrorPage({ resourceName }: Props) {
  const caught = useCatch();

  const { heading, message } =
    caught.status === 404
      ? {
          heading: `${resourceName} not found`,
          message: `Sorry, we couldn't find the ${resourceName} you're looking for.`,
        }
      : {
          heading: `Error finding this ${resourceName}`,
          message: `Sorry, we encountered an unexpected error while trying to find this ${resourceName}.`,
        };

  return (
    <main className="flex-grow mx-auto max-w-7xl w-full flex flex-col">
      <div className="flex-shrink-0 my-auto py-4 sm:py-8">
        <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
          {caught.status} error
        </p>
        <h1 className="mt-2 text-2xl text-gray-900 tracking-tight sm:text-3xl capitalize">
          {heading}
        </h1>
        <p className="mt-2 text-base text-gray-500">{message}</p>
        <div className="mt-6">
          <Link to="/">
            Go back home<span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
