"use client";

import { useState } from "react";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

/*
  CopyButton — botao de copiar conteudo pra clipboard.
*/

interface CopyButtonProps {
  text: string;
  label?: string;
  size?: "sm" | "md";
}

export function CopyButton({ text, label = "Copiar conteúdo", size = "md" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback silencioso
    }
  }

  return (
    <Button
      type="button"
      variant={copied ? "secondary" : "primary"}
      size={size}
      onClick={handleCopy}
      aria-label={label}
    >
      {copied ? (
        <>
          <IconCheck size={14} aria-hidden />
          Copiado
        </>
      ) : (
        <>
          <IconCopy size={14} aria-hidden />
          {label}
        </>
      )}
    </Button>
  );
}
