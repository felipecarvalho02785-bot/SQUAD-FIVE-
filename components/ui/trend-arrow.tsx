import { IconArrowUpRight, IconArrowDownRight, IconMinus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/*
  TrendArrow — seta + delta percentual relativo.
  Tom: positivo (verde), negativo (vermelho), neutro (cinza).
  Quando reverse=true, considera baixar bom (ex: gaps abertos baixando = bom).
*/

interface TrendArrowProps {
  current: number;
  previous: number;
  /** Quando true, baixar é bom (gaps, baixas, etc.) */
  reverse?: boolean;
  className?: string;
  /** Tamanho compacto pra inline */
  size?: "sm" | "md";
}

export function TrendArrow({
  current,
  previous,
  reverse = false,
  className,
  size = "sm",
}: TrendArrowProps) {
  if (previous === 0 && current === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-text-dim font-mono",
          size === "sm" ? "text-[10px]" : "text-[12px]",
          className,
        )}
      >
        <IconMinus size={size === "sm" ? 10 : 12} stroke={2} aria-hidden />
        —
      </span>
    );
  }

  const delta = current - previous;
  const pct =
    previous === 0
      ? current > 0
        ? 100
        : 0
      : Math.round((delta / Math.abs(previous)) * 100);

  if (pct === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-text-dim font-mono",
          size === "sm" ? "text-[10px]" : "text-[12px]",
          className,
        )}
      >
        <IconMinus size={size === "sm" ? 10 : 12} stroke={2} aria-hidden />
        0%
      </span>
    );
  }

  const isUp = delta > 0;
  const isGood = reverse ? !isUp : isUp;
  const Icon = isUp ? IconArrowUpRight : IconArrowDownRight;
  const tone = isGood ? "text-status-ok-text" : "text-status-critical-text";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono tabular-nums",
        tone,
        size === "sm" ? "text-[10px]" : "text-[12px]",
        className,
      )}
    >
      <Icon size={size === "sm" ? 10 : 12} stroke={2} aria-hidden />
      {isUp ? "+" : ""}
      {pct}%
    </span>
  );
}
