import { describe, expect, it } from "vitest";
import { buildInvestigationPrompt } from "./build-investigation-prompt";
import type { NormalizedLog } from "@/features/logs/api/normalize";

function fakeLog(overrides: Partial<NormalizedLog> = {}): NormalizedLog {
  return {
    id: "log-1",
    timeMs: Date.UTC(2026, 4, 25, 13, 37, 42, 123),
    observedTimeMs: Date.UTC(2026, 4, 25, 13, 37, 42, 123),
    severity: "ERROR",
    severityNumber: 17,
    severityText: "ERROR",
    bodyText: "Token validation failed",
    attributes: {},
    droppedAttributesCount: 0,
    resource: {
      namespace: undefined,
      name: undefined,
      version: undefined,
      attributes: {},
      droppedAttributesCount: 0,
    },
    // `NormalizedScope.name` is `string`, not optional; empty string serves as
    // the "missing" sentinel so `if (log.scope.name)` correctly omits the line.
    scope: {
      name: "",
      version: undefined,
      attributes: {},
      droppedAttributesCount: 0,
    },
    ...overrides,
  };
}

describe("buildInvestigationPrompt", () => {
  it("renders a minimal log: time, observed, severity, body, questions only", () => {
    const out = buildInvestigationPrompt(fakeLog());

    expect(out).toContain("**Time:** 2026-05-25T13:37:42.123Z");
    expect(out).toContain("**Observed:** 2026-05-25T13:37:42.123Z");
    expect(out).toContain("**Severity:** ERROR (17)");
    expect(out).toContain("Token validation failed");
    expect(out).toContain("## Questions");
    expect(out).not.toContain("**Service:");
    expect(out).not.toContain("**Scope:");
    expect(out).not.toContain("**Attributes:");
    expect(out).not.toContain("**Scope attributes:");
    expect(out).not.toContain("**Note:");
  });

  it("renders Observed even when it equals Time", () => {
    const t = Date.UTC(2026, 4, 25, 13, 37, 42, 123);

    const out = buildInvestigationPrompt(
      fakeLog({ timeMs: t, observedTimeMs: t }),
    );

    expect(out).toContain("**Time:** 2026-05-25T13:37:42.123Z");
    expect(out).toContain("**Observed:** 2026-05-25T13:37:42.123Z");
  });

  it("renders Observed with its own value when it differs from Time", () => {
    const t = Date.UTC(2026, 4, 25, 13, 37, 42, 123);

    const out = buildInvestigationPrompt(
      fakeLog({ timeMs: t, observedTimeMs: t + 2_000 }),
    );

    expect(out).toContain("**Time:** 2026-05-25T13:37:42.123Z");
    expect(out).toContain("**Observed:** 2026-05-25T13:37:44.123Z");
  });

  it("renders full service line when namespace, name, and version are all set", () => {
    const out = buildInvestigationPrompt(
      fakeLog({
        resource: {
          namespace: "backend",
          name: "auth-service",
          version: "2.4.1",
          attributes: {},
          droppedAttributesCount: 0,
        },
      }),
    );

    expect(out).toContain("**Service:** backend / auth-service @ 2.4.1");
  });

  it("renders partial service line when version is missing", () => {
    const out = buildInvestigationPrompt(
      fakeLog({
        resource: {
          namespace: "backend",
          name: "auth-service",
          version: undefined,
          attributes: {},
          droppedAttributesCount: 0,
        },
      }),
    );

    expect(out).toContain("**Service:** backend / auth-service");
    expect(out).not.toContain("@");
  });

  it("renders name-only service line when namespace and version are missing", () => {
    const out = buildInvestigationPrompt(
      fakeLog({
        resource: {
          namespace: undefined,
          name: "auth-service",
          version: undefined,
          attributes: {},
          droppedAttributesCount: 0,
        },
      }),
    );

    expect(out).toContain("**Service:** auth-service");
  });

  it("omits service line when all three resource fields are missing", () => {
    const out = buildInvestigationPrompt(fakeLog());

    expect(out).not.toContain("**Service:**");
  });

  it("renders scope with version when both are set", () => {
    const out = buildInvestigationPrompt(
      fakeLog({
        scope: {
          name: "auth.middleware",
          version: "1.0.0",
          attributes: {},
          droppedAttributesCount: 0,
        },
      }),
    );

    expect(out).toContain("**Scope:** auth.middleware @ 1.0.0");
  });

  it("renders scope without version when version is missing", () => {
    const out = buildInvestigationPrompt(
      fakeLog({
        scope: {
          name: "auth.middleware",
          version: undefined,
          attributes: {},
          droppedAttributesCount: 0,
        },
      }),
    );

    expect(out).toContain("**Scope:** auth.middleware");
    expect(out).not.toContain("@");
  });

  it("omits scope line when name is empty", () => {
    const out = buildInvestigationPrompt(fakeLog());

    expect(out).not.toContain("**Scope:**");
  });

  it("renders attributes section with backtick-wrapped keys", () => {
    const out = buildInvestigationPrompt(
      fakeLog({
        attributes: { "user.id": "12345", "http.method": "POST" },
      }),
    );

    expect(out).toContain("- **Attributes:**");
    expect(out).toContain("  - `user.id`: 12345");
    expect(out).toContain("  - `http.method`: POST");
  });

  it("omits attributes section when attributes are empty", () => {
    const out = buildInvestigationPrompt(fakeLog());

    expect(out).not.toContain("**Attributes:**");
  });

  it("renders scope attributes section with backtick-wrapped keys", () => {
    const out = buildInvestigationPrompt(
      fakeLog({
        scope: {
          name: "auth.middleware",
          version: undefined,
          attributes: { "library.lang": "node" },
          droppedAttributesCount: 0,
        },
      }),
    );

    expect(out).toContain("- **Scope attributes:**");
    expect(out).toContain("  - `library.lang`: node");
  });

  it("omits scope attributes section when scope attributes are empty", () => {
    const out = buildInvestigationPrompt(fakeLog());

    expect(out).not.toContain("**Scope attributes:**");
  });

  it("notes droppedAttributesCount on the log when > 0", () => {
    const out = buildInvestigationPrompt(
      fakeLog({
        attributes: { "user.id": "12345" },
        droppedAttributesCount: 3,
      }),
    );

    expect(out).toContain("3 attributes dropped");
  });

  it("uses the singular form when exactly one attribute is dropped", () => {
    const out = buildInvestigationPrompt(
      fakeLog({
        attributes: { "user.id": "12345" },
        droppedAttributesCount: 1,
      }),
    );

    expect(out).toContain("1 attribute dropped");
    expect(out).not.toContain("1 attributes dropped");
  });

  it("notes droppedAttributesCount on the resource when > 0", () => {
    const out = buildInvestigationPrompt(
      fakeLog({
        resource: {
          namespace: "backend",
          name: "auth-service",
          version: undefined,
          attributes: {},
          droppedAttributesCount: 2,
        },
      }),
    );

    expect(out).toContain("Resource: 2 attributes dropped");
  });

  it("notes droppedAttributesCount on the scope when > 0", () => {
    const out = buildInvestigationPrompt(
      fakeLog({
        scope: {
          name: "auth.middleware",
          version: undefined,
          attributes: {},
          droppedAttributesCount: 4,
        },
      }),
    );

    expect(out).toContain("Scope: 4 attributes dropped");
  });

  it("does not mention droppedAttributesCount when all are zero", () => {
    const out = buildInvestigationPrompt(fakeLog());

    expect(out).not.toContain("dropped");
  });

  it("matches snapshot for a realistic full-featured log", () => {
    const log: NormalizedLog = {
      id: "snap-1",
      timeMs: Date.UTC(2026, 4, 25, 13, 37, 42, 123),
      observedTimeMs: Date.UTC(2026, 4, 25, 13, 37, 44, 200),
      severity: "ERROR",
      severityNumber: 17,
      severityText: "ERROR",
      bodyText: "Token validation failed: expired signature",
      attributes: {
        "user.id": "12345",
        "request.id": "abc-def-ghi",
        "http.method": "POST",
        "http.route": "/api/sessions",
      },
      droppedAttributesCount: 0,
      resource: {
        namespace: "backend",
        name: "auth-service",
        version: "2.4.1",
        attributes: {},
        droppedAttributesCount: 0,
      },
      scope: {
        name: "auth.middleware",
        version: "1.0.0",
        attributes: { "library.lang": "node" },
        droppedAttributesCount: 0,
      },
    };

    expect(buildInvestigationPrompt(log)).toMatchSnapshot();
  });
});
