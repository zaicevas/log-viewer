import type {
  NormalizedLog,
  NormalizedResource,
  NormalizedScope,
} from "@/features/logs/api/normalize";
import { pluralize } from "@/shared/lib/format";

const QUESTIONS = `## Questions

1. In plain terms, what is this log most likely telling me?
2. List 3–5 plausible root causes, ranked by likelihood, with the reasoning for each.
3. What should I investigate next — other services to check, time windows to widen, attributes to filter on, related patterns to search for?
4. Is this typically a transient/expected condition or a signal of a deeper problem?`;

function serviceLines(resource: NormalizedResource): string[] {
  const parts: string[] = [];
  if (resource.namespace) parts.push(resource.namespace);
  if (resource.name) parts.push(resource.name);
  const base = parts.join(" / ");
  if (!base) return [];
  const line = resource.version ? `${base} @ ${resource.version}` : base;
  return [`- **Service:** ${line}`];
}

function scopeLines(scope: NormalizedScope): string[] {
  if (!scope.name) return [];
  const line = scope.version ? `${scope.name} @ ${scope.version}` : scope.name;
  return [`- **Scope:** ${line}`];
}

function attributeBlock(
  title: string,
  attrs: Record<string, string>,
): string[] {
  const entries = Object.entries(attrs);
  if (entries.length === 0) return [];
  return [
    `- **${title}:**`,
    ...entries.map(([key, value]) => `  - \`${key}\`: ${value}`),
  ];
}

function droppedNote(log: NormalizedLog): string[] {
  const notes: string[] = [];
  if (log.droppedAttributesCount > 0) {
    notes.push(`${pluralize(log.droppedAttributesCount, "attribute")} dropped`);
  }
  if (log.resource.droppedAttributesCount > 0) {
    notes.push(
      `Resource: ${pluralize(log.resource.droppedAttributesCount, "attribute")} dropped`,
    );
  }
  if (log.scope.droppedAttributesCount > 0) {
    notes.push(
      `Scope: ${pluralize(log.scope.droppedAttributesCount, "attribute")} dropped`,
    );
  }
  if (notes.length === 0) return [];
  return [`- **Note:** ${notes.join("; ")}`];
}

export function buildInvestigationPrompt(log: NormalizedLog): string {
  const metadata = [
    `- **Time:** ${new Date(log.timeMs).toISOString()}`,
    `- **Observed:** ${new Date(log.observedTimeMs).toISOString()}`,
    `- **Severity:** ${log.severity} (${log.severityNumber})`,
    ...serviceLines(log.resource),
    ...scopeLines(log.scope),
    ...attributeBlock("Attributes", log.attributes),
    ...attributeBlock("Scope attributes", log.scope.attributes),
    ...droppedNote(log),
  ].join("\n");

  return `I'm investigating a single log entry from an OpenTelemetry (OTLP) backend.
Help me understand what it means and what to look at next.

## The log

${metadata}
- **Body:**
\`\`\`
${log.bodyText}
\`\`\`

${QUESTIONS}`;
}
