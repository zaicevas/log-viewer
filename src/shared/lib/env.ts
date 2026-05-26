import "server-only";

import { z } from "zod";

const DEFAULT_LOGS_API_URL =
  "https://take-home-assignment-otlp-logs-api.vercel.app/api/v2/logs";

const envSchema = z.object({
  LOGS_API_URL: z.url().default(DEFAULT_LOGS_API_URL),
});

export const env = envSchema.parse({
  LOGS_API_URL: process.env.LOGS_API_URL,
});
