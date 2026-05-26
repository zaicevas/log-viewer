import type { ResourceGroup } from "@/features/logs/lib/group";
import { GroupItem } from "./group-item";

type Props = {
  groups: ResourceGroup[];
  expanded: ReadonlySet<string>;
  expandedGroups: ReadonlySet<string>;
  onToggleRow: (id: string) => void;
  onToggleGroup: (key: string) => void;
};

export function GroupedLogList({
  groups,
  expanded,
  expandedGroups,
  onToggleRow,
  onToggleGroup,
}: Props) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <GroupItem
          key={group.key}
          group={group}
          isOpen={expandedGroups.has(group.key)}
          expanded={expanded}
          onToggleRow={onToggleRow}
          onToggleGroup={onToggleGroup}
        />
      ))}
    </div>
  );
}
