import type { ComponentType, ReactNode } from "react";
import type { Icon, IconProps } from "@tabler/icons-react";
import { Sparkline } from "./sparkline";
import { TrendArrow } from "./trend-arrow";
import { cn } from "@/lib/utils";

/*
  KPICard v3 — ícone + número + glow + sparkline + trend arrow + hint.
  Layout otimizado para dar contexto temporal num único card.
*/

type IconComponent = Icon | ComponentType<IconProps>;

interface KPICardProps {
  label: string;
  value: string | number;
  icon?: IconComponent;
  negative?: boolean;
  hint?: string;
  /** Valor anterior pra calcular trend */
  previous?: number;
  /** Quando true, baixar é bom (gaps, baixas) */
  reverseTrend?: boolean;
  /** Série histórica curta — últimos 7 valores. Renderiza sparkline. */
  sparkline?: number[];
  /** Cor do sparkline. Default infere de negative. */
  sparklineTone?: "bronze" | "patrol" | "casualty" | "warn";
  /** Progress bar mantida pra retrocompatibilidade. */
  progress?: number;
  progressTone?: "warm" | "cool";
  variant?: "raised" | "jungle";
  /** Slot extra abaixo do hint (ex: rotulo customizado) */
  footer?: ReactNode;
  className?: string;
}

export function KPICard({
  label,
  value,
  icon: IconComp,
  negative = false,
  hint,
  previous,
  reverseTrend = false,
  sparkline,
  sparklineTone,
  progress,
  progressTone = "warm",
  variant = "raised",
  footer,
  className,
}: KPICardProps) {
  const currentNumber = typeof value === "number" ? value : Number(value) || 0;
  const tone = sparklineTone ?? (negative ? "casualty" : "bronze");

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
            "bg-surface-base/40 border border-border-default text-text-secondary",
          )}
          aria-hidden
        >
          <IconComp size={15} stroke={1.5} />
        </span>
      ) : null}

      <span className="label-display text-[10px] text-text-label">{label}</span>

      <div className="flex items-baseline gap-2 flex-wrap">
        <span
          className={cn(
            "kpi-number text-[34px] font-display animate-glow-bronze leading-none",
            negative ? "text-status-critical-text" : "text-bronze",
          )}
        >
          {value}
        </span>
        {typeof previous === "number" ? (
          <TrendArrow
            current={currentNumber}
            previous={previous}
            reverse={reverseTrend}
          />
        ) : null}
      </div>

      {sparkline && sparkline.length >= 2 ? (
        <div className="mt-0.5 -mx-1">
          <Sparkline values={sparkline} tone={tone} width={160} height={28} />
        </div>
      ) : typeof progress === "number" ? (
        <div className="mt-1 w-full h-1 rounded-full bg-surface-base/50 overflow-hidden">
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
            negative ? "text-status-critical-text/90" : "text-text-dim",
          )}
        >
          {hint}
        </span>
      ) : null}

      {footer}
    </div>
  );
}
