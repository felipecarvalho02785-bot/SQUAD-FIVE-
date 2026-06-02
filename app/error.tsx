"use client";

import { useEffect } from "react";
import { IconRefresh, IconAlertTriangle } from "@tabler/icons-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Squad 5 error:", error);
  }, [error]);

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 bg-surface-base">
      <div className="w-full max-w-md flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-status-critical/15 border border-status-critical/30 flex items-center justify-center">
          <IconAlertTriangle
            size={28}
            stroke={1.5}
            className="text-status-critical-text"
            aria-hidden
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="font-display uppercase tracking-[0.4em] text-[10px] text-status-critical-text">
            Falha de comunicação
          </span>
          <h1 className="font-display text-[24px] font-medium leading-tight text-text-primary">
            Comunicação interrompida com o quartel.
          </h1>
          <p className="text-text-secondary text-[13px] max-w-[34ch] mt-1">
            Tente novamente em alguns instantes. Se persistir, acione o
            suporte.
          </p>
        </div>

        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 min-h-11 h-11 px-6 rounded-input bg-accent-cta text-accent-cta-fg font-display uppercase tracking-[0.06em] text-[13px] font-medium hover:bg-accent-hover active:scale-[0.98] transition-all"
        >
          <IconRefresh size={16} aria-hidden />
          Tentar novamente
        </button>

        {error.digest ? (
          <p className="font-mono text-[10px] text-text-dim">
            ID do incidente: {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
