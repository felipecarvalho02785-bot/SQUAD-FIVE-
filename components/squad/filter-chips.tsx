"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/*
  FilterChips — exibe os filtros ativos como chips removíveis.
  Cada chip remove o respectivo search param ao ser clicado, atualizando a URL.
  Funciona com qualquer rota — só passar a lista de chips ativos.
*/

export interface FilterChip {
  /** Chave do search param (ex: "status", "q", "category") */
  param: string;
  /** Label visível no chip */
  label: string;
  /** Tom visual */
  tone?: "default" | "warn" | "critical" | "ok" | "accent";
}

interface FilterChipsProps {
  chips: FilterChip[];
  className?: string;
}

const TONE_CLASS: Record<NonNullable<FilterChip["tone"]>, string> = {
  default: "bg-surface-deep text-text-secondary border-border-default",
  warn: "bg-status-warn/15 text-status-warn-text border-status-warn/40",
  critical:
    "bg-status-critical/15 text-status-critical-text border-status-critical/40",
  ok: "bg-status-ok/15 text-status-ok-text border-status-ok/40",
  accent: "bg-accent/15 text-accent border-accent/40",
};

export function FilterChips({ chips, className }: FilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (chips.length === 0) return null;

  function removeChip(param: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(param);
    const qs = next.toString();
    router.push(`?${qs}`);
  }

  function clearAll() {
    router.push("?");
  }

  return (
    <div
      className={cn("flex items-center gap-2 flex-wrap", className)}
      aria-label="Filtros ativos"
    >
      {chips.map((chip) => (
        <button
          key={chip.param}
          type="button"
          onClick={() => removeChip(chip.param)}
          className={cn(
            "inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full border text-[11px] font-medium transition-colors min-h-9 lg:min-h-7",
            TONE_CLASS[chip.tone ?? "default"],
            "hover:opacity-80",
          )}
          aria-label={`Remover filtro ${chip.label}`}
        >
          {chip.label}
          <IconX size={11} stroke={2} aria-hidden />
        </button>
      ))}
      {chips.length > 1 ? (
        <button
          type="button"
          onClick={clearAll}
          className="text-text-dim text-[11px] hover:text-text-primary transition-colors"
        >
          Limpar tudo
        </button>
      ) : null}
    </div>
  );
}
