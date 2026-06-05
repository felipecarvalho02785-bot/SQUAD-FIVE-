"use client";

import { useState, useTransition } from "react";
import {
  IconShare,
  IconLink,
  IconLockOpen,
  IconLock,
  IconCheck,
  IconCopy,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  enableOperationShareAction,
  disableOperationShareAction,
} from "@/lib/actions/share";

interface ShareLinkSectionProps {
  operationId: string;
  shareToken: string | null;
  baseUrl: string;
}

export function ShareLinkSection({
  operationId,
  shareToken,
  baseUrl,
}: ShareLinkSectionProps) {
  const [token, setToken] = useState(shareToken);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const shareUrl = token ? `${baseUrl}/share/operacao/${token}` : null;

  function handleEnable() {
    startTransition(async () => {
      const result = await enableOperationShareAction(operationId);
      if (result.ok) {
        setToken(result.token);
        toast.success("Link público gerado");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDisable() {
    startTransition(async () => {
      const result = await disableOperationShareAction(operationId);
      if (result.ok) {
        setToken(null);
        toast.success("Link público revogado");
      } else {
        toast.error(result.error);
      }
    });
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Falha ao copiar");
    }
  }

  return (
    <section className="surface-raised p-5 flex flex-col gap-3">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <IconShare
            size={14}
            className="text-bronze"
            stroke={1.5}
            aria-hidden
          />
          <h2 className="label-display text-[11px] text-text-secondary">
            Link público
          </h2>
        </div>
        {token ? (
          <span className="inline-flex items-center gap-1 text-status-ok-text text-[10px] font-display uppercase tracking-[0.08em]">
            <IconLockOpen size={9} stroke={2} aria-hidden />
            Ativo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-text-dim text-[10px] font-display uppercase tracking-[0.08em]">
            <IconLock size={9} stroke={2} aria-hidden />
            Privado
          </span>
        )}
      </header>

      {token && shareUrl ? (
        <>
          <p className="text-text-secondary text-[11px]">
            Qualquer pessoa com o link consegue ver um status report read-only
            (sem login). Revogue quando não precisar mais.
          </p>
          <div className="flex items-center gap-2 p-2.5 rounded-card bg-surface-deep border border-border-default/60">
            <IconLink
              size={12}
              className="text-text-dim shrink-0"
              stroke={1.5}
              aria-hidden
            />
            <code className="flex-1 font-mono text-[11px] text-text-secondary truncate">
              {shareUrl}
            </code>
            <Button
              type="button"
              variant={copied ? "secondary" : "primary"}
              size="sm"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <IconCheck size={11} aria-hidden />
                  Copiado
                </>
              ) : (
                <>
                  <IconCopy size={11} aria-hidden />
                  Copiar
                </>
              )}
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={handleDisable}
            className="self-start"
          >
            <IconLock size={11} aria-hidden />
            Revogar link
          </Button>
        </>
      ) : (
        <>
          <p className="text-text-secondary text-[12px]">
            Gere um link público pra compartilhar o status report com o recruta
            sem precisar dar acesso ao sistema.
          </p>
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={pending}
            onClick={handleEnable}
            className="self-start"
          >
            <IconShare size={14} aria-hidden />
            {pending ? "Gerando..." : "Gerar link público"}
          </Button>
        </>
      )}
    </section>
  );
}
