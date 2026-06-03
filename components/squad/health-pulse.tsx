import Link from "next/link";
import { IconAlertTriangle, IconShieldCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/*
  HealthPulse — indicador compacto da saúde global do squad no topbar.
  Bolinha colorida pulsante com tooltip CSS no hover.
*/

interface HealthPulseProps {
  emCampo: number;
  atencao: number;
  baixaIminente: number;
}

export function HealthPulse({
  emCampo,
  atencao,
  baixaIminente,
}: HealthPulseProps) {
  const total = emCampo + atencao + baixaIminente;
  if (total === 0) return null;

  const tone: "ok" | "warn" | "critical" =
    baixaIminente > 0 ? "critical" : atencao > 0 ? "warn" : "ok";

  const TONE_CLASS = {
    ok: "bg-status-ok",
    warn: "bg-status-warn",
    critical: "bg-status-critical animate-pulse-status",
  }[tone];

  return (
    <Link
      href="/comando"
      className={cn(
        "hidden md:flex relative items-center gap-2 h-9 px-3 rounded-full",
        "bg-surface-deep border border-border-default text-text-secondary text-[11px]",
        "hover:text-text-primary hover:border-border-strong transition-colors group",
      )}
      title="Saúde global do squad"
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", TONE_CLASS)} aria-hidden />
      {baixaIminente > 0 ? (
        <IconAlertTriangle
          size={11}
          className="text-status-critical-text"
          stroke={1.5}
          aria-hidden
        />
      ) : (
        <IconShieldCheck
          size={11}
          className="text-status-ok-text"
          stroke={1.5}
          aria-hidden
        />
      )}
      <span className="font-mono tabular-nums">
        {emCampo}/{total}
      </span>

      {/* Tooltip CSS-only */}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute top-full mt-2 right-0 z-dropdown",
          "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
          "transition-opacity",
          "min-w-[180px] surface-raised px-3 py-2 text-[11px]",
        )}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-text-secondary">Em campo</span>
            <span className="font-mono text-status-ok-text">{emCampo}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-text-secondary">Em atenção</span>
            <span className="font-mono text-status-warn-text">{atencao}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-text-secondary">Baixa iminente</span>
            <span className="font-mono text-status-critical-text">
              {baixaIminente}
            </span>
          </div>
        </div>
      </span>
    </Link>
  );
}
