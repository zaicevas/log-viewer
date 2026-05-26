import { cn } from "@/shared/lib/styling";
import type { SeverityLevel } from "@/features/logs/api/severity";

const DOT_BG: Record<SeverityLevel, string> = {
  UNSPECIFIED: "bg-muted-foreground",
  TRACE: "bg-severity-trace-fg",
  DEBUG: "bg-severity-debug-fg",
  INFO: "bg-severity-info-fg",
  WARN: "bg-severity-warn-fg",
  ERROR: "bg-severity-error-fg",
  FATAL: "bg-severity-fatal-fg",
};

const TEXT_FG: Record<SeverityLevel, string> = {
  UNSPECIFIED: "text-muted-foreground",
  TRACE: "text-severity-trace-fg",
  DEBUG: "text-severity-debug-fg",
  INFO: "text-severity-info-fg",
  WARN: "text-severity-warn-fg",
  ERROR: "text-severity-error-fg",
  FATAL: "text-severity-fatal-fg",
};

type Props = {
  level: SeverityLevel;
};

export function SeverityBadge({ level }: Props) {
  return (
    <span
      className={cn(
        "inline-flex w-22 items-center gap-2 font-mono text-[11px] font-medium tracking-[0.06em] uppercase",
        TEXT_FG[level],
      )}
    >
      <span
        aria-hidden
        className={cn("size-2 shrink-0 rounded-full", DOT_BG[level])}
      />
      <span>{level}</span>
    </span>
  );
}
