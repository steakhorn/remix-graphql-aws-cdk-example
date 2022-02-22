import type { ReactNode } from "react";
import { NavLink, useMatches } from "remix";

export type BreadcrumbHandle<TData = any> = {
  breadcrumb: ({ data }: { data?: TData }) => {
    content: ReactNode;
    preventLink?: boolean;
  };
};

export function BreadcrumbLink({
  children,
  to,
}: {
  children: ReactNode;
  to: string;
}) {
  return (
    <NavLink
      to={to}
      className="font-medium text-gray-500 hover:text-gray-700"
      prefetch="intent"
    >
      {children}
    </NavLink>
  );
}

export function Breadcrumbs() {
  const matches = useMatches();
  const items = matches.filter(
    (match) => match.handle && match.handle.breadcrumb
  );
  return (
    <nav
      className="bg-white border-b border-gray-200 flex"
      aria-label="Breadcrumb"
    >
      <ol
        role="list"
        className="max-w-screen-xl w-full mx-auto px-4 flex space-x-3 text-xs sm:text-sm sm:space-x-4 sm:px-6 lg:px-8 text-gray-400"
      >
        {items.map((match, index) => {
          const { content, preventLink } = match.handle.breadcrumb(match);
          return (
            <BreadcrumbItem
              key={index}
              isLast={index === items.length - 1}
              pathname={match.pathname}
              preventLink={preventLink}
            >
              {content}
            </BreadcrumbItem>
          );
        })}
      </ol>
    </nav>
  );
}

function BreadcrumbItem({
  children,
  isLast,
  pathname,
  preventLink,
}: {
  children: ReactNode;
  isLast: boolean;
  pathname: string;
  preventLink?: boolean;
}) {
  const inner =
    preventLink || isLast ? (
      children
    ) : (
      <BreadcrumbLink to={pathname}>{children}</BreadcrumbLink>
    );
  return (
    <li className="flex">
      <div className="flex items-center">
        <span className="mr-3 sm:mr-4">{inner}</span>
        <svg
          className={`flex-shrink-0 w-6 h-full text-gray-200 ${
            isLast ? "opacity-0" : ""
          }`}
          viewBox="0 0 24 44"
          preserveAspectRatio="none"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
        </svg>
      </div>
    </li>
  );
}
