"use client";

import { useEffect } from "react";
import { IconRefresh, IconAlertTriangle } from "@tabler/icons-react";

/*
  Erro 500 / runtime — Tier 2.
  Copy oficial: docs/02_MANUAL_VOZ_E_TOM.md secao "Tela 500".
*/

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry entra aqui na Sprint 7.
    console.error("Squad 5 error:", error);
  }, [error]);

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 bg-combat">
      <div className="w-full max-w-md flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-casualty/15 border border-casualty/30 flex items-center justify-center">
          <IconAlertTriangle size={28} stroke={1.5} className="text-casualty" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="font-display uppercase tracking-[0.4em] text-[10px] text-casualty">
            Falha de comunicação
          </span>
          <h1 className="font-display text-[24px] font-medium leading-tight text-cream">
            Comunicação interrompida com o quartel.
          </h1>
          <p className="text-cream-muted text-[13px] max-w-[34ch] mt-1">
            Tente novamente em alguns instantes. Se persistir, acione o suporte.
          </p>
        </div>

        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-input bg-copper text-combat font-display uppercase tracking-[0.06em] text-[13px] font-medium hover:bg-bronze active:scale-[0.98] transition-all"
        >
          <IconRefresh size={16} />
          Tentar novamente
        </button>

        {error.digest ? (
          <p className="font-mono text-[10px] text-cream-dim">
            ID do incidente: {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
