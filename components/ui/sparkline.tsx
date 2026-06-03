import { cn } from "@/lib/utils";

/*
  Sparkline — mini gráfico linha SVG sem dependências.
  Renderiza últimos N valores numéricos, com area fill + linha.
*/

interface SparklineProps {
  values: number[];
  /** Cor da linha. Default: bronze */
  tone?: "bronze" | "patrol" | "casualty" | "warn";
  width?: number;
  height?: number;
  className?: string;
  /** Mostra o último valor como label sobreposto */
  showLast?: boolean;
}

const STROKE_BY_TONE = {
  bronze: "var(--color-bronze)",
  patrol: "var(--color-status-ok)",
  casualty: "var(--color-status-critical)",
  warn: "var(--color-status-warn)",
};

const FILL_BY_TONE = {
  bronze: "rgba(215, 138, 92, 0.18)",
  patrol: "rgba(74, 107, 69, 0.18)",
  casualty: "rgba(200, 74, 74, 0.18)",
  warn: "rgba(215, 138, 92, 0.18)",
};

export function Sparkline({
  values,
  tone = "bronze",
  width = 120,
  height = 32,
  className,
  showLast = false,
}: SparklineProps) {
  if (values.length < 2) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-text-dim text-[10px]",
          className,
        )}
        style={{ width, height }}
        aria-hidden
      >
        —
      </div>
    );
  }

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return { x, y };
  });

  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div
      className={cn("relative inline-flex", className)}
      style={{ width, height }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="overflow-visible"
        aria-hidden
      >
        <path d={areaPath} fill={FILL_BY_TONE[tone]} />
        <path
          d={linePath}
          stroke={STROKE_BY_TONE[tone]}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.length > 0 ? (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="2"
            fill={STROKE_BY_TONE[tone]}
          />
        ) : null}
      </svg>
      {showLast ? (
        <span className="absolute right-0 -top-3 font-mono text-[9px] text-text-dim">
          {values[values.length - 1]}
        </span>
      ) : null}
    </div>
  );
}
