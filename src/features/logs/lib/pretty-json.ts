// Mirrors Grafana's `restructureLog` prettify path:
// https://github.com/grafana/grafana/blob/b10025b40d21c047176f1f4384fddc165211e5e8/public/app/features/logs/components/LogRowMessage.tsx#L101
// Adds a size cap to avoid parsing pathologically large bodies.
const PRETTY_JSON_MAX_BYTES = 50_000;

export function maybePrettyJson(text: string): string {
  if (text.length > PRETTY_JSON_MAX_BYTES) {
    return text;
  }
  const trimmed = text.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return text;
  }
  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return text;
  }
}
