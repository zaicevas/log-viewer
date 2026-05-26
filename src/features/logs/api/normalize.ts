import type { AnyValue, KeyValue, OTLPLogsResponse } from "./schema";
import { severityToLevel, type SeverityLevel } from "./severity";

export type NormalizedResource = {
  namespace: string | undefined;
  name: string | undefined;
  version: string | undefined;
  attributes: Record<string, string>;
  droppedAttributesCount: number;
};

export type NormalizedScope = {
  name: string;
  version: string | undefined;
  attributes: Record<string, string>;
  droppedAttributesCount: number;
};

export type NormalizedLog = {
  id: string;
  timeMs: number;
  observedTimeMs: number;
  severity: SeverityLevel;
  severityNumber: number;
  severityText: string;
  bodyText: string;
  attributes: Record<string, string>;
  droppedAttributesCount: number;
  resource: NormalizedResource;
  scope: NormalizedScope;
};

// Typed JSON projection so nested kvlist/array values keep their primitive
// shape (numbers as numbers, bools as bools) rather than getting quote-wrapped
// when serialized. OTLP int64 may arrive as a string for values > 2^53; keep
// it as a string in that case to preserve precision.
// AnyValue spec: opentelemetry-proto v1.10.0 common.proto AnyValue oneof.
// https://github.com/open-telemetry/opentelemetry-proto/blob/ca839c51f706f5d53bfb46f06c3e90c3af3a52c6/opentelemetry/proto/common/v1/common.proto#L28-L48
function anyValueToJson(value: AnyValue): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("intValue" in value) return value.intValue;
  if ("boolValue" in value) return value.boolValue;
  if ("doubleValue" in value) return value.doubleValue;
  if ("arrayValue" in value) return value.arrayValue.values.map(anyValueToJson);
  if ("kvlistValue" in value) {
    const result: Record<string, unknown> = {};
    for (const entry of value.kvlistValue.values) {
      result[entry.key] = anyValueToJson(entry.value);
    }
    return result;
  }
  if ("bytesValue" in value) return value.bytesValue;
  // Per common.proto: "It is valid for all values to be unspecified in which
  // case this AnyValue is considered to be 'empty'." Represent as null.
  return null;
}

function anyValueToString(value: AnyValue): string {
  if ("stringValue" in value) return value.stringValue;
  if ("intValue" in value) return String(value.intValue);
  if ("boolValue" in value) return String(value.boolValue);
  if ("doubleValue" in value) return String(value.doubleValue);
  if ("arrayValue" in value || "kvlistValue" in value) {
    return JSON.stringify(anyValueToJson(value));
  }
  // bytesValue: OTLP/JSON encodes `bytes` as base64 strings — pass through.
  if ("bytesValue" in value) return value.bytesValue;
  return "";
}

function attrsToRecord(attrs: ReadonlyArray<KeyValue>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const { key, value } of attrs) {
    result[key] = anyValueToString(value);
  }
  return result;
}

function nanosToMs(nsStr: string): number {
  return Number(BigInt(nsStr) / 1_000_000n);
}

export function normalize(raw: OTLPLogsResponse): NormalizedLog[] {
  const logs: NormalizedLog[] = [];

  raw.resourceLogs.forEach((resourceLog, resourceIdx) => {
    const resAttrs = attrsToRecord(resourceLog.resource.attributes);
    const resource: NormalizedResource = {
      namespace: resAttrs["service.namespace"],
      name: resAttrs["service.name"],
      version: resAttrs["service.version"],
      attributes: resAttrs,
      droppedAttributesCount: resourceLog.resource.droppedAttributesCount,
    };

    resourceLog.scopeLogs.forEach((scopeLog, scopeIdx) => {
      const scope: NormalizedScope = {
        name: scopeLog.scope.name,
        version: scopeLog.scope.version,
        attributes: attrsToRecord(scopeLog.scope.attributes),
        droppedAttributesCount: scopeLog.scope.droppedAttributesCount,
      };
      scopeLog.logRecords.forEach((record, recordIdx) => {
        const timeMs = nanosToMs(record.timeUnixNano);
        // logs.proto: observed_time_unix_nano value of 0 means "unknown or
        // missing timestamp." The proto itself prescribes the consumer
        // fallback: "Use time_unix_nano if it is present, otherwise use
        // observed_time_unix_nano." We apply the inverse — substitute
        // time_unix_nano for an unset observed_time rather than emit a 1970
        // value. opentelemetry-proto v1.10.0:
        // https://github.com/open-telemetry/opentelemetry-proto/blob/ca839c51f706f5d53bfb46f06c3e90c3af3a52c6/opentelemetry/proto/logs/v1/logs.proto#L139-L159
        const observedTimeMs =
          record.observedTimeUnixNano === "0"
            ? timeMs
            : nanosToMs(record.observedTimeUnixNano);
        logs.push({
          id: `${resourceIdx}-${scopeIdx}-${recordIdx}`, // ideally we'd get id from the backend or has it ourselves, but this will do for current scope of the app
          timeMs,
          observedTimeMs,
          severity: severityToLevel(record.severityNumber),
          severityNumber: record.severityNumber,
          severityText: record.severityText,
          bodyText: anyValueToString(record.body),
          attributes: attrsToRecord(record.attributes),
          droppedAttributesCount: record.droppedAttributesCount,
          resource,
          scope,
        });
      });
    });
  });

  return logs;
}
