"use client";

import { Layers } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Toggle } from "@/shared/components/ui/toggle";
import { group } from "@/features/logs/lib/group";
import type { NormalizedLog } from "@/features/logs/api/normalize";
import { pluralize } from "@/shared/lib/format";
import { GroupedLogList } from "./grouped-log-list";
import { Histogram } from "./histogram";
import { LogTable } from "./log-table";

const GROUPED_PARAM = "grouped";

type Props = {
  logs: NormalizedLog[];
};

export function LogsView({ logs }: Props) {
  const searchParams = useSearchParams();
  const grouped = searchParams.get(GROUPED_PARAM) === "true";

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(),
  );

  const groups = grouped ? group(logs) : [];

  function toggleRow(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  }

  function toggleGroup(key: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);

      if (next.has(key)) next.delete(key);
      else next.add(key);

      return next;
    });
  }

  function toggleGrouped(pressed: boolean) {
    const params = new URLSearchParams(searchParams.toString());

    if (pressed) {
      params.set(GROUPED_PARAM, "true");
    } else {
      params.delete(GROUPED_PARAM);
    }

    const queryString = params.toString();
    window.history.replaceState(
      null,
      "",
      queryString ? `/?${queryString}` : "/",
    );
  }

  if (logs.length === 0) {
    return (
      <div
        data-testid="empty-state"
        className="border-hairline flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center"
      >
        <p className="text-foreground font-mono text-sm">No logs found</p>
        <p className="text-muted-foreground font-mono text-xs">
          The API returned an empty response. Try refreshing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Histogram logs={logs} />
      <div className="flex items-center justify-between gap-3">
        <h1
          data-testid="logs-count"
          className="text-foreground font-mono text-sm font-medium"
        >
          {pluralize(logs.length, "log")}
          {grouped ? ` · ${pluralize(groups.length, "service")}` : ""}
        </h1>
        <Toggle
          data-testid="group-by-toggle"
          pressed={grouped}
          onPressedChange={toggleGrouped}
          variant="outline"
          size="sm"
          aria-label="Group by service"
          className="data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:hover:bg-primary/15"
        >
          <Layers className="size-3.5" />
          <span>Group by service</span>
        </Toggle>
      </div>
      {grouped ? (
        <GroupedLogList
          groups={groups}
          expanded={expanded}
          expandedGroups={expandedGroups}
          onToggleRow={toggleRow}
          onToggleGroup={toggleGroup}
        />
      ) : (
        <LogTable logs={logs} expanded={expanded} onToggle={toggleRow} />
      )}
    </div>
  );
}
