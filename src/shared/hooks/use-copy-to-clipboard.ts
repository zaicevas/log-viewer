"use client";

import { useState } from "react";

const DEFAULT_RESET_MS = 1500;

export function useCopyToClipboard(resetMs: number = DEFAULT_RESET_MS) {
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), resetMs);
      })
      .catch(() => {
        // clipboard refused (permission, insecure context); leave UI as-is.
      });
  };

  return { copied, copy };
}
