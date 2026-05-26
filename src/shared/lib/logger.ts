import "server-only";

type Level = "info" | "warn" | "error";
type Context = Record<string, unknown>;

// FIXME: replace console with a real telemetry provider
function emit(level: Level, message: string, context?: Context): void {
  const payload = context ? { level, message, ...context } : { level, message };
  console[level](JSON.stringify(payload));
}

export const logger = {
  info: (message: string, context?: Context) => emit("info", message, context),
  warn: (message: string, context?: Context) => emit("warn", message, context),
  error: (message: string, context?: Context) =>
    emit("error", message, context),
};
