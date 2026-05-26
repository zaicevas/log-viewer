import { z } from "zod";

const IntValue = z.union([z.number(), z.string()]);

const AnyValueSchema = z.union([
  z.object({ stringValue: z.string() }),
  z.object({ intValue: IntValue }),
  z.object({ boolValue: z.boolean() }),
  z.object({ doubleValue: z.number() }),
  z.object({
    arrayValue: z.object({
      get values() {
        return z.array(AnyValueSchema).default([]);
      },
    }),
  }),
  z.object({
    kvlistValue: z.object({
      get values() {
        return z.array(KeyValueSchema).default([]);
      },
    }),
  }),
  z.object({ bytesValue: z.string() }),
]);

const KeyValueSchema = z.object({
  key: z.string(),
  value: AnyValueSchema,
});

export type AnyValue = z.infer<typeof AnyValueSchema>;
export type KeyValue = z.infer<typeof KeyValueSchema>;

const LogRecordSchema = z.object({
  timeUnixNano: z.string(),
  observedTimeUnixNano: z.string(),
  severityNumber: z.int().min(0).max(24),
  severityText: z.string(),
  body: AnyValueSchema,
  attributes: z.array(KeyValueSchema),
  droppedAttributesCount: z.int(),
});

const ScopeLogsSchema = z.object({
  scope: z.object({
    name: z.string(),
    version: z.string().optional(),
    attributes: z.array(KeyValueSchema),
    droppedAttributesCount: z.int(),
  }),
  logRecords: z.array(LogRecordSchema),
});

const ResourceLogsSchema = z.object({
  resource: z.object({
    attributes: z.array(KeyValueSchema),
    droppedAttributesCount: z.int(),
  }),
  scopeLogs: z.array(ScopeLogsSchema),
});

export const OTLPLogsResponseSchema = z.object({
  resourceLogs: z.array(ResourceLogsSchema),
});

export type OTLPLogsResponse = z.infer<typeof OTLPLogsResponseSchema>;
