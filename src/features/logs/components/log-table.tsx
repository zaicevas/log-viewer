import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { NormalizedLog } from "@/features/logs/api/normalize";
import { LogRow } from "./log-row";

type Props = {
  logs: NormalizedLog[];
  expanded: ReadonlySet<string>;
  onToggle: (id: string) => void;
  bordered?: boolean;
  showHeader?: boolean;
};

export function LogTable({
  logs,
  expanded,
  onToggle,
  bordered = true,
  showHeader = true,
}: Props) {
  const table = (
    <Table>
      {showHeader ? (
        <TableHeader className="bg-surface-elevated sticky top-0 z-10 shadow-[0_1px_0_0_var(--color-hairline)]">
          <TableRow className="border-hairline hover:bg-transparent">
            <TableHead className="h-10 w-10 pr-0 pl-3" aria-label="expand" />
            <TableHead className="text-muted-foreground h-10 w-32 text-[10px] tracking-wider uppercase">
              Severity
            </TableHead>
            <TableHead className="text-muted-foreground h-10 w-48 text-[10px] tracking-wider uppercase">
              Time (UTC)
            </TableHead>
            <TableHead className="text-muted-foreground h-10 text-[10px] tracking-wider uppercase">
              Body
            </TableHead>
          </TableRow>
        </TableHeader>
      ) : null}
      <TableBody>
        {logs.map((log) => (
          <LogRow
            key={log.id}
            log={log}
            expanded={expanded.has(log.id)}
            onToggle={onToggle}
          />
        ))}
      </TableBody>
    </Table>
  );

  if (!bordered) return table;

  return (
    <div className="border-hairline bg-surface-raised rounded-lg border">
      {table}
    </div>
  );
}
