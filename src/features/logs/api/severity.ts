/**
 * OTLP severity number → human level.
 * Spec: https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitynumber
 *   0     UNSPECIFIED
 *   1-4   TRACE
 *   5-8   DEBUG
 *   9-12  INFO
 *   13-16 WARN
 *   17-20 ERROR
 *   21-24 FATAL
 * Numbers outside 0-24 fall back to UNSPECIFIED.
 */
export type SeverityLevel =
  | "UNSPECIFIED"
  | "TRACE"
  | "DEBUG"
  | "INFO"
  | "WARN"
  | "ERROR"
  | "FATAL";

export function severityToLevel(severityNumber: number): SeverityLevel {
  if (severityNumber === 0) return "UNSPECIFIED";
  if (severityNumber >= 1 && severityNumber <= 4) return "TRACE";
  if (severityNumber >= 5 && severityNumber <= 8) return "DEBUG";
  if (severityNumber >= 9 && severityNumber <= 12) return "INFO";
  if (severityNumber >= 13 && severityNumber <= 16) return "WARN";
  if (severityNumber >= 17 && severityNumber <= 20) return "ERROR";
  if (severityNumber >= 21 && severityNumber <= 24) return "FATAL";
  return "UNSPECIFIED";
}
