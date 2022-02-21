import type { ReactNode } from "react";

import { Avatar, AvatarProps } from "./Avatar";

type Props = {
  title: ReactNode;
  subHeading?: ReactNode;
  avatar?: AvatarProps;
};

export function Heading({ title, subHeading, avatar }: Props) {
  return (
    <div className="flex items-center space-x-5 mb-6">
      {avatar ? (
        <div className="flex-shrink-0">
          <Avatar {...avatar} />
        </div>
      ) : null}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm font-medium text-gray-500">{subHeading}</p>
      </div>
    </div>
  );
}

const example = (
  <div className="flex items-center space-x-5 mb-6">
    <div className="flex-shrink-0">
      <div className="relative">
        <img
          className="h-16 w-16 rounded-full"
          src="https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80"
          alt=""
        />
        <span
          className="absolute inset-0 shadow-inner rounded-full"
          aria-hidden="true"
        />
      </div>
    </div>
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Ricardo Cooper</h1>
      <p className="text-sm font-medium text-gray-500">
        Applied for{" "}
        <a href="#" className="text-gray-900">
          Front End Developer
        </a>{" "}
        on <time dateTime="2020-08-25">August 25, 2020</time>
      </p>
    </div>
  </div>
);
