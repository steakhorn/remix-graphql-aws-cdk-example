import { Link as RemixLink, LinkProps } from "remix";

export function Link(props: LinkProps) {
  return (
    <RemixLink
      prefetch="intent"
      {...props}
      className={
        "text-indigo-600 hover:text-indigo-900 font-medium" + props.className ||
        ""
      }
    />
  );
}
