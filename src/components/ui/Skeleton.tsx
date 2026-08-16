import clsx from "../../utils/clsx";

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx("animate-pulse rounded-md bg-black/[0.06] dark:bg-white/[0.08]", className)}
      aria-hidden="true"
    />
  );
}
