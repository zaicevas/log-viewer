import { describe, expect, it } from "vitest";
import { group } from "./group";
import type {
  NormalizedLog,
  NormalizedResource,
} from "@/features/logs/api/normalize";

function fakeLog(
  id: string,
  resource: Partial<NormalizedResource> = {},
): NormalizedLog {
  return {
    id,
    timeMs: 0,
    observedTimeMs: 0,
    severity: "INFO",
    severityNumber: 9,
    severityText: "INFO",
    bodyText: "",
    attributes: {},
    droppedAttributesCount: 0,
    resource: {
      namespace: resource.namespace,
      name: resource.name,
      version: resource.version,
      attributes: resource.attributes ?? {},
      droppedAttributesCount: resource.droppedAttributesCount ?? 0,
    },
    scope: {
      name: "test",
      version: undefined,
      attributes: {},
      droppedAttributesCount: 0,
    },
  };
}

describe("group", () => {
  it("returns an empty array when input is empty", () => {
    expect(group([])).toEqual([]);
  });

  it("collapses logs sharing the same (namespace/name/version) into one group", () => {
    const logs = [
      fakeLog("a", { namespace: "ns", name: "svc", version: "1" }),
      fakeLog("b", { namespace: "ns", name: "svc", version: "1" }),
      fakeLog("c", { namespace: "ns", name: "svc", version: "1" }),
    ];

    const out = group(logs);

    expect(out).toHaveLength(1);
    expect(out[0]!.logs).toHaveLength(3);
    expect(out[0]!.key).toBe("ns/svc/1");
  });

  it("creates one group per distinct fingerprint and preserves first-encountered order", () => {
    const logs = [
      fakeLog("a", { namespace: "ns1", name: "svc", version: "1" }),
      fakeLog("b", { namespace: "ns2", name: "svc", version: "1" }),
      fakeLog("c", { namespace: "ns1", name: "svc", version: "1" }),
      fakeLog("d", { namespace: "ns3", name: "svc", version: "1" }),
    ];

    const out = group(logs);

    expect(out.map((g) => g.key)).toEqual([
      "ns1/svc/1",
      "ns2/svc/1",
      "ns3/svc/1",
    ]);
    expect(out[0]!.logs.map((l) => l.id)).toEqual(["a", "c"]);
  });

  it("treats different versions as different resources", () => {
    const logs = [
      fakeLog("a", { namespace: "ns", name: "svc", version: "1" }),
      fakeLog("b", { namespace: "ns", name: "svc", version: "2" }),
    ];

    expect(group(logs)).toHaveLength(2);
  });

  it("handles undefined resource fields via '—' placeholders", () => {
    const logs = [fakeLog("a"), fakeLog("b")];

    const out = group(logs);

    expect(out).toHaveLength(1);
    expect(out[0]!.key).toBe("—/—/—");
  });

  it("preserves the resource object on the group", () => {
    const logs = [
      fakeLog("a", {
        namespace: "checkout",
        name: "api",
        version: "1.2.3",
        attributes: { "host.name": "node-7" },
      }),
    ];

    const out = group(logs);

    expect(out[0]!.resource.namespace).toBe("checkout");
    expect(out[0]!.resource.attributes["host.name"]).toBe("node-7");
  });
});
