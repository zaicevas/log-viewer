import "server-only";

import { z } from "zod";
import { env } from "@/shared/lib/env";
import { logger } from "@/shared/lib/logger";
import { normalize, type NormalizedLog } from "@/features/logs/api/normalize";
import { OTLPLogsResponseSchema } from "@/features/logs/api/schema";

export type FetchedLogs = {
  logs: NormalizedLog[];
};

export async function fetchLogs(): Promise<FetchedLogs> {
  const response = await fetch(env.LOGS_API_URL, { cache: "no-store" });
  if (!response.ok) {
    logger.error("OTLP fetch failed", {
      status: response.status,
      url: env.LOGS_API_URL,
    });
    throw new Error(`OTLP API returned ${response.status}`);
  }
  const rawResponse: unknown = await response.json();
  const result = OTLPLogsResponseSchema.safeParse(rawResponse);
  if (!result.success) {
    logger.error("OTLP schema parse failed", {
      issues: result.error.issues,
    });

    // Suffices for the scope of this project, but could be improved by having graceful error handling instead of causing an error boundary
    throw new Error(
      `OTLP response did not match the expected schema:\n${z.prettifyError(result.error)}`,
    );
  }
  return {
    logs: normalize(result.data).sort(
      (first, second) => second.timeMs - first.timeMs,
    ),
  };
}
