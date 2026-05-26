import type {
  NormalizedLog,
  NormalizedResource,
} from "@/features/logs/api/normalize";

export type ResourceGroup = {
  key: string;
  resource: NormalizedResource;
  logs: NormalizedLog[];
};

function resourceKey(resource: NormalizedResource): string {
  return `${resource.namespace ?? "—"}/${resource.name ?? "—"}/${resource.version ?? "—"}`;
}

/**
 * Bucket logs by (service.namespace, service.name, service.version).
 * Returns one group per unique resource fingerprint, in first-encountered
 * order. Records with the same fingerprint are kept in input order.
 */
export function group(logs: ReadonlyArray<NormalizedLog>): ResourceGroup[] {
  const byKey = new Map<string, ResourceGroup>();
  for (const log of logs) {
    const key = resourceKey(log.resource);
    const existing = byKey.get(key);
    if (existing) {
      existing.logs.push(log);
    } else {
      byKey.set(key, { key, resource: log.resource, logs: [log] });
    }
  }
  return [...byKey.values()];
}
