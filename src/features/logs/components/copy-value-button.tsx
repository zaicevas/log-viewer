"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useCopyToClipboard } from "@/shared/hooks/use-copy-to-clipboard";
import { cn } from "@/shared/lib/styling";

type Props = {
  value: string;
  label: string;
};

export function CopyValueButton({ value, label }: Props) {
  const { copied, copy } = useCopyToClipboard();
  const Icon = copied ? Check : Copy;

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={() => copy(value)}
      aria-label={`Copy ${label}`}
      data-testid="resource-row__copy-button"
      data-state={copied ? "copied" : "idle"}
      className={cn(
        "text-muted-foreground hover:text-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
        "data-[state=copied]:text-primary",
        "[@media(hover:none)]:opacity-100",
      )}
    >
      <Icon aria-hidden className="size-3.5" />
    </Button>
  );
}
