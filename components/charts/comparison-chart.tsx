import { cn } from "@/lib/utils";

/*
  ComparisonChart — gráfico linha com duas séries (esta semana vs anterior).
  SVG puro, sem dependência. Eixo X = dias (0..N-1), Y = valor.
*/

export interface ComparisonSeries {
  label: string;
  values: number[];
  tone: "bronze" | "patrol" | "dim";
}

interface ComparisonChartProps {
  current: ComparisonSeries;
  previous: ComparisonSeries;
  dayLabels?: string[];
  width?: number;
  height?: number;
  className?: string;
}

const STROKE_BY_TONE = {
  bronze: "var(--color-bronze)",
  patrol: "var(--color-status-ok)",
  dim: "var(--color-text-dim)",
};

const FILL_BY_TONE = {
  bronze: "rgba(215, 138, 92, 0.14)",
  patrol: "rgba(74, 107, 69, 0.14)",
  dim: "rgba(140, 140, 140, 0.08)",
};

export function ComparisonChart({
  current,
  previous,
  dayLabels,
  width = 520,
  height = 180,
  className,
}: ComparisonChartProps) {
  const allValues = [...current.values, ...previous.values];
  const max = Math.max(...allValues, 1);
  const length = Math.max(current.values.length, previous.values.length, 2);
  const padX = 24;
  const padY = 18;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const stepX = innerW / (length - 1);

  function points(values: number[]) {
    return values.map((v, i) => {
      const x = padX + i * stepX;
      const y = padY + innerH - (v / max) * innerH;
      return { x, y };
    });
  }

  const currentPoints = points(current.values);
  const previousPoints = points(previous.values);

  function toPath(pts: { x: number; y: number }[]) {
    if (pts.length === 0) return "";
    return pts
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(" ");
  }

  function toAreaPath(pts: { x: number; y: number }[]) {
    if (pts.length === 0) return "";
    const base = toPath(pts);
    const last = pts[pts.length - 1];
    const first = pts[0];
    return `${base} L ${last.x} ${padY + innerH} L ${first.x} ${padY + innerH} Z`;
  }

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: padY + innerH - t * innerH,
    label: Math.round(t * max),
  }));

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="xMidYMid meet"
        aria-label="Comparação de semanas"
      >
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={padX}
              x2={width - padX}
              y1={t.y}
              y2={t.y}
              stroke="var(--color-border-default)"
              strokeWidth="0.5"
              strokeDasharray="2 3"
              opacity="0.4"
            />
            <text
              x={padX - 4}
              y={t.y + 3}
              textAnchor="end"
              fontSize="9"
              fontFamily="var(--font-mono, monospace)"
              fill="var(--color-text-dim)"
            >
              {t.label}
            </text>
          </g>
        ))}

        <path
          d={toAreaPath(previousPoints)}
          fill={FILL_BY_TONE[previous.tone]}
        />
        <path
          d={toPath(previousPoints)}
          stroke={STROKE_BY_TONE[previous.tone]}
          strokeWidth="1.2"
          strokeDasharray="3 3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d={toAreaPath(currentPoints)}
          fill={FILL_BY_TONE[current.tone]}
        />
        <path
          d={toPath(currentPoints)}
          stroke={STROKE_BY_TONE[current.tone]}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {currentPoints.map((p, i) => (
          <circle
            key={`c-${i}`}
            cx={p.x}
            cy={p.y}
            r="2.5"
            fill={STROKE_BY_TONE[current.tone]}
          />
        ))}

        {dayLabels?.map((label, i) => (
          <text
            key={`d-${i}`}
            x={padX + i * stepX}
            y={height - 4}
            textAnchor="middle"
            fontSize="9"
            fontFamily="var(--font-mono, monospace)"
            fill="var(--color-text-dim)"
          >
            {label}
          </text>
        ))}
      </svg>

      <div className="flex items-center justify-center gap-4 mt-1">
        <LegendChip label={current.label} tone={current.tone} solid />
        <LegendChip label={previous.label} tone={previous.tone} />
      </div>
    </div>
  );
}

function LegendChip({
  label,
  tone,
  solid = false,
}: {
  label: string;
  tone: "bronze" | "patrol" | "dim";
  solid?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] text-text-secondary">
      <span
        aria-hidden
        className="inline-block w-4 h-0.5 rounded"
        style={{
          backgroundColor: STROKE_BY_TONE[tone],
          opacity: solid ? 1 : 0.6,
          borderTop: solid ? "none" : `1px dashed ${STROKE_BY_TONE[tone]}`,
        }}
      />
      {label}
    </span>
  );
}
