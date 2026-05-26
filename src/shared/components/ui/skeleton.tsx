import { cn } from "@/shared/lib/styling";

type Props = React.ComponentProps<"div">;

function Skeleton({ className, ...props }: Props) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
