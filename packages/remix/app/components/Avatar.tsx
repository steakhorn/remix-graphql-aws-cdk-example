const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
};

export type AvatarProps = {
  url: string;
  size: keyof typeof sizeClasses;
};

export function Avatar({ url, size }: AvatarProps) {
  return (
    <div className="relative">
      <img className={`${sizeClasses[size]} rounded-full`} src={url} alt="" />
      <span
        className="absolute inset-0 shadow-inner rounded-full"
        aria-hidden="true"
      />
    </div>
  );
}
