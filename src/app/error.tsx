"use client";

import { AlertTriangle } from "lucide-react";

type Props = {
  error: Error & { digest?: string };
};

export default function ErrorBoundary({ error }: Props) {
  // In production, Next.js scrubs server-thrown error messages and provides a
  // digest instead. Show the digest as a correlation handle. In development,
  // the raw message is visible to speed up debugging.
  const detail = error.digest ?? error.message;

  return (
    <main className="flex-1">
      <div className="flex w-full items-center justify-center px-6 py-20">
        <div
          data-testid="error-state"
          className="max-w-md space-y-4 text-center"
        >
          <div className="bg-severity-error-bg mx-auto flex size-12 items-center justify-center rounded-full">
            <AlertTriangle className="text-severity-error-fg size-6" />
          </div>
          <h1
            data-testid="error-state__heading"
            className="text-foreground font-mono text-base font-medium"
          >
            Failed to load logs
          </h1>
          {detail ? (
            <p className="text-muted-foreground font-mono text-xs wrap-break-word">
              {detail}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
