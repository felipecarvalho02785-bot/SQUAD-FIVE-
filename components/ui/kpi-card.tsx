import type { ComponentType } from "react";
import type { Icon, IconProps } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/*
  KPICard v2 — card de indicador com icone, glow no numero, progress bar opcional.
  Specs base: docs/03_SISTEMA_DESIGN.md secao 5.2 (versao v2 ampliada na Sprint 1.5).
*/

type IconComponent = Icon | ComponentType<IconProps>;

interface KPICardProps {
  label: string;
  value: string | number;
  /** Icone Tabler no canto superior direito */
  icon?: IconComponent;
  /** Quando true, numero em vermelho-tatico (KPIs ruins tipo "baixas iminentes"). */
  negative?: boolean;
  /** Texto pequeno de contexto abaixo do numero. Ex: "+3 esta semana" ou "6 criticos". */
  hint?: string;
  /** Progresso 0-100. Mostra mini barra abaixo do numero quando definido. */
  progress?: number;
  /** Estilo da progress bar */
  progressTone?: "warm" | "cool";
  /** Surface alternativa: padrao usa surface-raised. Use "jungle" pra destaque (Comando Central principal). */
  variant?: "raised" | "jungle";
  className?: string;
}

export function KPICard({
  label,
  value,
  icon: IconComp,
  negative = false,
  hint,
  progress,
  progressTone = "warm",
  variant = "raised",
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "relative px-4 py-3.5 flex flex-col gap-2 lift-hover",
        variant === "jungle" ? "surface-jungle" : "surface-raised",
        className,
      )}
    >
      {IconComp ? (
        <span
          className={cn(
            "absolute top-3 right-3 w-7 h-7 rounded-md flex items-center justify-center",
            "bg-combat/40 border border-tactical text-cream-muted",
          )}
          aria-hidden
        >
          <IconComp size={15} stroke={1.5} />
        </span>
      ) : null}

      <span className="label-display text-[10px] text-cream-dim">{label}</span>

      <span
        className={cn(
          "kpi-number text-[34px] font-display animate-glow-bronze",
          negative ? "text-casualty" : "text-bronze",
        )}
      >
        {value}
      </span>

      {typeof progress === "number" ? (
        <div className="mt-1 w-full h-1 rounded-full bg-combat/50 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              progressTone === "warm" ? "bar-gradient-warm" : "bar-gradient-cool",
            )}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      ) : null}

      {hint ? (
        <span
          className={cn(
            "text-[11px] mt-0.5",
            negative ? "text-casualty/85" : "text-cream-dim",
          )}
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
}
