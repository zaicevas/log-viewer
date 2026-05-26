import { ChevronRight } from "lucide-react";
import { pluralize } from "@/shared/lib/format";
import { cn } from "@/shared/lib/styling";
import type { ResourceGroup } from "@/features/logs/lib/group";
import { LogTable } from "./log-table";

type Props = {
  group: ResourceGroup;
  isOpen: boolean;
  expanded: ReadonlySet<string>;
  onToggleRow: (id: string) => void;
  onToggleGroup: (key: string) => void;
};

export function GroupItem({
  group,
  isOpen,
  expanded,
  onToggleRow,
  onToggleGroup,
}: Props) {
  const groupLabel = `${group.resource.namespace ?? "—"} / ${group.resource.name ?? "—"}${group.resource.version ? ` v${group.resource.version}` : ""}`;

  return (
    <div
      data-testid="group"
      className="border-hairline bg-surface-raised overflow-hidden rounded-lg border"
    >
      <button
        type="button"
        data-testid="group-header"
        onClick={() => onToggleGroup(group.key)}
        aria-expanded={isOpen}
        aria-label={`${isOpen ? "Collapse" : "Expand"} ${groupLabel}`}
        className={cn(
          "hover:bg-surface-elevated flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
          isOpen && "border-hairline border-b",
        )}
      >
        <ChevronRight
          aria-hidden
          className={cn(
            "text-muted-foreground size-4 shrink-0 transition-transform",
            isOpen && "rotate-90",
          )}
        />
        <div className="min-w-0 flex-1">
          <p
            data-testid="group-header__title"
            className="text-foreground truncate font-mono text-sm font-medium"
          >
            {group.resource.namespace ?? "—"} / {group.resource.name ?? "—"}
          </p>
          <p
            data-testid="group-header__version"
            className="text-muted-foreground truncate font-mono text-xs"
          >
            {group.resource.version
              ? `v${group.resource.version}`
              : "unversioned"}
          </p>
        </div>
        <span
          data-testid="group-header__count"
          className="text-muted-foreground shrink-0 font-mono text-xs tabular-nums"
        >
          {pluralize(group.logs.length, "log")}
        </span>
      </button>
      {isOpen ? (
        <LogTable
          logs={group.logs}
          expanded={expanded}
          onToggle={onToggleRow}
          bordered={false}
          showHeader={false}
        />
      ) : null}
    </div>
  );
}
