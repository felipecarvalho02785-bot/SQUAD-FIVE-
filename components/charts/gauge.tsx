import { cn } from "@/lib/utils";

/*
  Gauge — chart circular tipo "score" usado pra "Saude media".
  SVG puro, sem dependencia externa. Renderiza um anel parcial colorido
  baseado no valor (0-100) sobre um anel de fundo tactical.
*/

interface GaugeProps {
  /** 0-100 */
  value: number;
  /** Max do dominio (default 100) */
  max?: number;
  /** Cor do anel — escolhe automatico baseado no value se nao for passado */
  tone?: "patrol" | "bronze" | "casualty";
  /** Tamanho em px (default 180) */
  size?: number;
  /** Label abaixo do numero */
  label?: string;
  /** Texto auxiliar abaixo do label */
  hint?: string;
  className?: string;
}

function autoTone(value: number, max: number): NonNullable<GaugeProps["tone"]> {
  const pct = (value / max) * 100;
  if (pct >= 70) return "patrol";
  if (pct >= 40) return "bronze";
  return "casualty";
}

const STROKE_COLOR: Record<NonNullable<GaugeProps["tone"]>, string> = {
  patrol: "#4a6b45",
  bronze: "#d78a5c",
  casualty: "#c84a4a",
};

const TEXT_COLOR: Record<NonNullable<GaugeProps["tone"]>, string> = {
  patrol: "text-patrol",
  bronze: "text-bronze",
  casualty: "text-casualty",
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
  // Comeca em -90deg (topo) e desenha 270deg (3/4 do circulo) — semi-gauge
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
          {/* Anel de fundo */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2a2724"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
          />
          {/* Anel preenchido */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={STROKE_COLOR[resolvedTone]}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 800ms ease-out",
              filter: `drop-shadow(0 0 8px ${STROKE_COLOR[resolvedTone]}55)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "kpi-number text-[44px] leading-none animate-glow-bronze",
              TEXT_COLOR[resolvedTone],
            )}
          >
            {safeValue}
          </span>
          {max !== 100 ? (
            <span className="font-mono text-cream-dim text-[11px] mt-1">
              de {max}
            </span>
          ) : (
            <span className="font-mono text-cream-dim text-[11px] mt-1">
              / {max}
            </span>
          )}
        </div>
      </div>

      {label ? (
        <div className="flex flex-col items-center gap-0.5 text-center">
          <span className="label-display text-[11px] text-cream-muted">
            {label}
          </span>
          {hint ? (
            <span className="text-[11px] text-cream-dim">{hint}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
