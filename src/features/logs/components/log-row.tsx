"use client";

import { ChevronRight } from "lucide-react";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/styling";
import { formatTimestamp } from "@/shared/lib/format";
import type { NormalizedLog } from "@/features/logs/api/normalize";
import { maybePrettyJson } from "@/features/logs/lib/pretty-json";
import { SeverityBadge } from "./severity-badge";
import { CopyPromptButton } from "./copy-prompt-button";
import { ResourceRow } from "./resource-row";

const COLUMN_COUNT = 4;

type Props = {
  log: NormalizedLog;
  expanded: boolean;
  onToggle: (id: string) => void;
};

export function LogRow({ log, expanded, onToggle }: Props) {
  const panelId = `log-panel-${log.id}`;
  const attrEntries = Object.entries(log.attributes);
  const scopeAttrEntries = Object.entries(log.scope.attributes);
  const handleRowClick = () => onToggle(log.id);

  return (
    <>
      <TableRow
        data-testid="log-row"
        className="border-hairline focus-within:bg-muted/40 hover:bg-muted/40 cursor-pointer align-top"
        onClick={handleRowClick}
      >
        <TableCell className="w-10 py-0 pr-0 pl-0">
          <button
            type="button"
            data-testid="log-row__expand-button"
            aria-label={expanded ? "Collapse row" : "Expand row"}
            aria-expanded={expanded}
            aria-controls={panelId}
            className="focus-visible:ring-ring flex h-full w-full items-center justify-center px-3 py-3 outline-none focus-visible:ring-2 focus-visible:ring-inset"
          >
            <ChevronRight
              aria-hidden
              className={cn(
                "text-muted-foreground size-4 transition-transform",
                expanded && "rotate-90",
              )}
            />
          </button>
        </TableCell>
        <TableCell className="w-32 py-3">
          <SeverityBadge level={log.severity} />
        </TableCell>
        <TableCell className="text-muted-foreground w-48 py-3 font-mono text-xs tabular-nums">
          {formatTimestamp(log.timeMs)}
        </TableCell>
        <TableCell className="text-foreground py-3 font-mono text-xs">
          <span className="block max-w-full truncate">{log.bodyText}</span>
        </TableCell>
      </TableRow>
      {expanded ? (
        <TableRow
          id={panelId}
          data-testid="log-row__expanded"
          className="border-hairline bg-surface-elevated hover:bg-surface-elevated"
        >
          <TableCell colSpan={COLUMN_COUNT} className="p-0 whitespace-normal">
            <div className="space-y-4 px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                  Body
                </p>
                <CopyPromptButton log={log} />
              </div>
              <pre className="border-hairline bg-surface text-foreground rounded-md border p-3 font-mono text-xs leading-relaxed wrap-break-word whitespace-pre-wrap">
                {maybePrettyJson(log.bodyText)}
              </pre>
              <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-xs">
                <p className="text-muted-foreground col-span-2 mb-0.5 text-[10px] font-semibold tracking-wider uppercase">
                  Log
                </p>
                <ResourceRow
                  label="time (UTC)"
                  value={formatTimestamp(log.timeMs)}
                />
                <ResourceRow
                  label="observedTime (UTC)"
                  value={formatTimestamp(log.observedTimeMs)}
                />
                <ResourceRow
                  label="severityNumber"
                  value={String(log.severityNumber)}
                />
                <ResourceRow label="severityText" value={log.severityText} />
                {log.droppedAttributesCount > 0 ? (
                  <ResourceRow
                    label="droppedAttributesCount"
                    value={String(log.droppedAttributesCount)}
                  />
                ) : null}
              </div>
              <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-xs">
                <p className="text-muted-foreground col-span-2 mb-0.5 text-[10px] font-semibold tracking-wider uppercase">
                  Service
                </p>
                <ResourceRow
                  label="service.namespace"
                  value={log.resource.namespace}
                />
                <ResourceRow label="service.name" value={log.resource.name} />
                <ResourceRow
                  label="service.version"
                  value={log.resource.version}
                />
                {log.resource.droppedAttributesCount > 0 ? (
                  <ResourceRow
                    label="droppedAttributesCount"
                    value={String(log.resource.droppedAttributesCount)}
                  />
                ) : null}
              </div>
              <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-xs">
                <p className="text-muted-foreground col-span-2 mb-0.5 text-[10px] font-semibold tracking-wider uppercase">
                  Scope
                </p>
                <ResourceRow label="scope.name" value={log.scope.name} />
                {log.scope.version ? (
                  <ResourceRow
                    label="scope.version"
                    value={log.scope.version}
                  />
                ) : null}
                {scopeAttrEntries.map(([key, value]) => (
                  <ResourceRow key={key} label={key} value={value} />
                ))}
                {log.scope.droppedAttributesCount > 0 ? (
                  <ResourceRow
                    label="droppedAttributesCount"
                    value={String(log.scope.droppedAttributesCount)}
                  />
                ) : null}
              </div>
              {attrEntries.length > 0 ? (
                <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-xs">
                  <p className="text-muted-foreground col-span-2 mb-0.5 text-[10px] font-semibold tracking-wider uppercase">
                    Attributes
                  </p>
                  {attrEntries.map(([key, value]) => (
                    <ResourceRow key={key} label={key} value={value} />
                  ))}
                </div>
              ) : null}
            </div>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}
