import { cn } from "@/lib/utils";

/*
  Gauge — chart circular tipo "score" usado pra "Saude media".
  SVG puro, sem dependencia externa. Renderiza um anel parcial colorido
  baseado no valor (0-100) sobre um anel de fundo tactical.

  Tokens: stroke colors via CSS vars (--color-status-ok, --color-bronze,
  --color-status-critical) — zero hex hardcoded.
*/

interface GaugeProps {
  value: number;
  max?: number;
  tone?: "patrol" | "bronze" | "casualty";
  size?: number;
  label?: string;
  hint?: string;
  className?: string;
}

function autoTone(value: number, max: number): NonNullable<GaugeProps["tone"]> {
  const pct = (value / max) * 100;
  if (pct >= 70) return "patrol";
  if (pct >= 40) return "bronze";
  return "casualty";
}

const STROKE_VAR: Record<NonNullable<GaugeProps["tone"]>, string> = {
  patrol: "var(--color-status-ok)",
  bronze: "var(--color-bronze)",
  casualty: "var(--color-status-critical)",
};

const GLOW_VAR: Record<NonNullable<GaugeProps["tone"]>, string> = {
  patrol: "rgba(74, 107, 69, 0.33)",
  bronze: "rgba(215, 138, 92, 0.33)",
  casualty: "rgba(200, 74, 74, 0.33)",
};

const TEXT_CLASS: Record<NonNullable<GaugeProps["tone"]>, string> = {
  patrol: "text-status-ok-text",
  bronze: "text-bronze",
  casualty: "text-status-critical-text",
};

export function Gauge({
  value,
  max = 100,
  tone,
  size = 180,
  label,
  hint,
  className,
}: GaugeProps) {
  const safeValue = Math.max(0, Math.min(value, max));
  const pct = safeValue / max;
  const resolvedTone = tone ?? autoTone(safeValue, max);

  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const dashOffset = arcLength * (1 - pct);

  return (
    <div
      className={cn("flex flex-col items-center gap-2", className)}
      style={{ width: size }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          className="transform -rotate-[135deg]"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-divider)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={STROKE_VAR[resolvedTone]}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 800ms ease-out",
              filter: `drop-shadow(0 0 8px ${GLOW_VAR[resolvedTone]})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "kpi-number text-[44px] leading-none animate-glow-bronze",
              TEXT_CLASS[resolvedTone],
            )}
          >
            {safeValue}
          </span>
          <span className="font-mono text-text-dim text-[11px] mt-1">
            {max === 100 ? `/ ${max}` : `de ${max}`}
          </span>
        </div>
      </div>

      {label ? (
        <div className="flex flex-col items-center gap-0.5 text-center">
          <span className="label-display text-[11px] text-text-secondary">
            {label}
          </span>
          {hint ? (
            <span className="text-[11px] text-text-dim">{hint}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
