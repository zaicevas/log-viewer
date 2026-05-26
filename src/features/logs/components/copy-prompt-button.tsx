"use client";

import { buildInvestigationPrompt } from "@/features/logs/lib/build-investigation-prompt";
import { useCopyToClipboard } from "@/shared/hooks/use-copy-to-clipboard";
import { Button } from "@/shared/components/ui/button";
import type { NormalizedLog } from "@/features/logs/api/normalize";

type Props = {
  log: NormalizedLog;
};

export function CopyPromptButton({ log }: Props) {
  const { copied, copy } = useCopyToClipboard();
  return (
    <Button
      variant="ghost"
      size="xs"
      onClick={() => copy(buildInvestigationPrompt(log))}
      data-testid="copy-prompt-button"
      data-state={copied ? "copied" : "idle"}
      className="text-muted-foreground hover:text-foreground data-[state=copied]:text-primary text-[10px] font-semibold tracking-wider uppercase"
    >
      {copied ? "Copied" : "Copy as prompt"}
    </Button>
  );
}
