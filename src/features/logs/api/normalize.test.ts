import { describe, expect, it } from "vitest";
import { normalize } from "./normalize";
import type { OTLPLogsResponse } from "./schema";

const SAMPLE: OTLPLogsResponse = {
  resourceLogs: [
    {
      resource: {
        attributes: [
          { key: "service.namespace", value: { stringValue: "checkout" } },
          { key: "service.name", value: { stringValue: "api" } },
          { key: "service.version", value: { stringValue: "1.2.3" } },
          { key: "host.name", value: { stringValue: "node-7" } },
        ],
        droppedAttributesCount: 0,
      },
      scopeLogs: [
        {
          scope: {
            name: "instrumentation",
            version: "0.4.1",
            attributes: [
              { key: "scope.tag", value: { stringValue: "primary" } },
            ],
            droppedAttributesCount: 0,
          },
          logRecords: [
            {
              timeUnixNano: "1779461861919000000",
              observedTimeUnixNano: "1779461861920000000",
              severityNumber: 9,
              severityText: "INFO",
              body: { stringValue: "user logged in" },
              attributes: [
                { key: "user.id", value: { stringValue: "u_42" } },
                { key: "http.status_code", value: { intValue: 200 } },
              ],
              droppedAttributesCount: 0,
            },
            {
              timeUnixNano: "1779461861920000000",
              observedTimeUnixNano: "1779461861920000000",
              severityNumber: 17,
              severityText: "ERROR",
              body: { intValue: 42 },
              attributes: [],
              droppedAttributesCount: 3,
            },
          ],
        },
      ],
    },
    {
      resource: {
        attributes: [],
        droppedAttributesCount: 7,
      },
      scopeLogs: [
        {
          scope: {
            name: "anonymous",
            attributes: [],
            droppedAttributesCount: 5,
          },
          logRecords: [
            {
              timeUnixNano: "1779461861921000000",
              observedTimeUnixNano: "1779461861921000000",
              severityNumber: 0,
              severityText: "UNSPECIFIED",
              body: { boolValue: true },
              attributes: [],
              droppedAttributesCount: 0,
            },
          ],
        },
      ],
    },
  ],
};

describe("normalize", () => {
  it("flattens nested resource→scope→record into a single array", () => {
    expect(normalize(SAMPLE)).toHaveLength(3);
  });

  it("converts timeUnixNano (ns string) to ms number", () => {
    const out = normalize(SAMPLE);

    // 1779461861919000000 ns → 1779461861919 ms
    expect(out[0]!.timeMs).toBe(1779461861919);
    expect(out[1]!.timeMs).toBe(1779461861920);
  });

  it("converts observedTimeUnixNano (ns string) to observedTimeMs number", () => {
    const out = normalize(SAMPLE);

    expect(out[0]!.observedTimeMs).toBe(1779461861920);
    expect(out[1]!.observedTimeMs).toBe(1779461861920);
    expect(out[2]!.observedTimeMs).toBe(1779461861921);
  });

  it("maps severityNumber to a SeverityLevel and surfaces the raw number", () => {
    const out = normalize(SAMPLE);

    expect(out[0]!.severity).toBe("INFO");
    expect(out[0]!.severityNumber).toBe(9);
    expect(out[1]!.severity).toBe("ERROR");
    expect(out[1]!.severityNumber).toBe(17);
    expect(out[2]!.severity).toBe("UNSPECIFIED");
    expect(out[2]!.severityNumber).toBe(0);
  });

  it("extracts body across all AnyValue shapes", () => {
    const out = normalize(SAMPLE);

    expect(out[0]!.bodyText).toBe("user logged in");
    expect(out[1]!.bodyText).toBe("42");
    expect(out[2]!.bodyText).toBe("true");
  });

  it("renders structured AnyValue (arrayValue/kvlistValue/bytesValue) into JSON-shaped strings", () => {
    const out = normalize({
      resourceLogs: [
        {
          resource: { attributes: [], droppedAttributesCount: 0 },
          scopeLogs: [
            {
              scope: {
                name: "test",
                attributes: [],
                droppedAttributesCount: 0,
              },
              logRecords: [
                {
                  timeUnixNano: "1000000000",
                  observedTimeUnixNano: "1000000000",
                  severityNumber: 0,
                  severityText: "UNSPECIFIED",
                  body: {
                    arrayValue: {
                      values: [
                        { stringValue: "a" },
                        { intValue: 1 },
                        { boolValue: false },
                      ],
                    },
                  },
                  attributes: [
                    {
                      key: "user",
                      value: {
                        kvlistValue: {
                          values: [
                            { key: "id", value: { intValue: 42 } },
                            { key: "name", value: { stringValue: "ada" } },
                          ],
                        },
                      },
                    },
                    {
                      key: "payload",
                      value: { bytesValue: "aGVsbG8=" },
                    },
                  ],
                  droppedAttributesCount: 0,
                },
              ],
            },
          ],
        },
      ],
    });

    expect(out[0]!.bodyText).toBe('["a",1,false]');
    expect(out[0]!.attributes["user"]).toBe('{"id":42,"name":"ada"}');
    expect(out[0]!.attributes["payload"]).toBe("aGVsbG8=");
  });

  it("recurses into nested kvlistValue attributes (object inside object)", () => {
    const out = normalize({
      resourceLogs: [
        {
          resource: { attributes: [], droppedAttributesCount: 0 },
          scopeLogs: [
            {
              scope: {
                name: "test",
                attributes: [],
                droppedAttributesCount: 0,
              },
              logRecords: [
                {
                  timeUnixNano: "1000000000",
                  observedTimeUnixNano: "1000000000",
                  severityNumber: 0,
                  severityText: "UNSPECIFIED",
                  body: { stringValue: "" },
                  attributes: [
                    {
                      key: "user",
                      value: {
                        kvlistValue: {
                          values: [
                            {
                              key: "address",
                              value: {
                                kvlistValue: {
                                  values: [
                                    {
                                      key: "city",
                                      value: { stringValue: "Vilnius" },
                                    },
                                  ],
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                  droppedAttributesCount: 0,
                },
              ],
            },
          ],
        },
      ],
    });

    expect(out[0]!.attributes["user"]).toBe('{"address":{"city":"Vilnius"}}');
  });

  it("recurses into arrayValue of kvlistValue entries (array of objects)", () => {
    const out = normalize({
      resourceLogs: [
        {
          resource: { attributes: [], droppedAttributesCount: 0 },
          scopeLogs: [
            {
              scope: {
                name: "test",
                attributes: [],
                droppedAttributesCount: 0,
              },
              logRecords: [
                {
                  timeUnixNano: "1000000000",
                  observedTimeUnixNano: "1000000000",
                  severityNumber: 0,
                  severityText: "UNSPECIFIED",
                  body: {
                    arrayValue: {
                      values: [
                        {
                          kvlistValue: {
                            values: [{ key: "id", value: { intValue: 1 } }],
                          },
                        },
                        {
                          kvlistValue: {
                            values: [{ key: "id", value: { intValue: 2 } }],
                          },
                        },
                      ],
                    },
                  },
                  attributes: [],
                  droppedAttributesCount: 0,
                },
              ],
            },
          ],
        },
      ],
    });

    expect(out[0]!.bodyText).toBe('[{"id":1},{"id":2}]');
  });

  it("renders empty arrayValue/kvlistValue as '[]' / '{}'", () => {
    const out = normalize({
      resourceLogs: [
        {
          resource: { attributes: [], droppedAttributesCount: 0 },
          scopeLogs: [
            {
              scope: {
                name: "test",
                attributes: [],
                droppedAttributesCount: 0,
              },
              logRecords: [
                {
                  timeUnixNano: "1000000000",
                  observedTimeUnixNano: "1000000000",
                  severityNumber: 0,
                  severityText: "UNSPECIFIED",
                  body: { arrayValue: { values: [] } },
                  attributes: [
                    {
                      key: "obj",
                      value: { kvlistValue: { values: [] } },
                    },
                  ],
                  droppedAttributesCount: 0,
                },
              ],
            },
          ],
        },
      ],
    });

    expect(out[0]!.bodyText).toBe("[]");
    expect(out[0]!.attributes["obj"]).toBe("{}");
  });

  it("flattens attributes including coerced intValue to string", () => {
    const out = normalize(SAMPLE);

    expect(out[0]!.attributes).toEqual({
      "user.id": "u_42",
      "http.status_code": "200",
    });
  });

  it("surfaces droppedAttributesCount on the record, the resource, and the scope", () => {
    const out = normalize(SAMPLE);

    expect(out[1]!.droppedAttributesCount).toBe(3);
    expect(out[2]!.resource.droppedAttributesCount).toBe(7);
    expect(out[0]!.scope.droppedAttributesCount).toBe(0);
    expect(out[2]!.scope.droppedAttributesCount).toBe(5);
  });

  it("parses service.namespace/name/version off the resource", () => {
    const out = normalize(SAMPLE);

    expect(out[0]!.resource.namespace).toBe("checkout");
    expect(out[0]!.resource.name).toBe("api");
    expect(out[0]!.resource.version).toBe("1.2.3");
    expect(out[0]!.resource.attributes["host.name"]).toBe("node-7");
  });

  it("leaves resource fields undefined when missing", () => {
    const out = normalize(SAMPLE);

    expect(out[2]!.resource.namespace).toBeUndefined();
    expect(out[2]!.resource.name).toBeUndefined();
    expect(out[2]!.resource.version).toBeUndefined();
  });

  it("threads scope name + version + attributes through", () => {
    const out = normalize(SAMPLE);

    expect(out[0]!.scope.name).toBe("instrumentation");
    expect(out[0]!.scope.version).toBe("0.4.1");
    expect(out[0]!.scope.attributes).toEqual({ "scope.tag": "primary" });
    expect(out[2]!.scope.name).toBe("anonymous");
    expect(out[2]!.scope.version).toBeUndefined();
    expect(out[2]!.scope.attributes).toEqual({});
  });

  it("emits stable, unique ids per record (resourceIdx-scopeIdx-recordIdx)", () => {
    const out = normalize(SAMPLE);

    expect(out.map((r) => r.id)).toEqual(["0-0-0", "0-0-1", "1-0-0"]);
    expect(new Set(out.map((r) => r.id)).size).toBe(out.length);
  });

  it("returns an empty array when there are no resourceLogs", () => {
    expect(normalize({ resourceLogs: [] })).toEqual([]);
  });

  it("falls back to timeMs when observedTimeUnixNano is the '0' unset sentinel", () => {
    const out = normalize({
      resourceLogs: [
        {
          resource: { attributes: [], droppedAttributesCount: 0 },
          scopeLogs: [
            {
              scope: {
                name: "test",
                attributes: [],
                droppedAttributesCount: 0,
              },
              logRecords: [
                {
                  timeUnixNano: "1779461861919000000",
                  observedTimeUnixNano: "0",
                  severityNumber: 9,
                  severityText: "INFO",
                  body: { stringValue: "no observed time" },
                  attributes: [],
                  droppedAttributesCount: 0,
                },
              ],
            },
          ],
        },
      ],
    });

    expect(out[0]!.observedTimeMs).toBe(1779461861919);
    expect(out[0]!.observedTimeMs).toBe(out[0]!.timeMs);
  });
});
