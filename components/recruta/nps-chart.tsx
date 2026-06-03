import { cn } from "@/lib/utils";

interface NpsChartProps {
  briefings: Array<{
    id: string;
    date: Date;
    npsScore: number | null;
  }>;
  className?: string;
}

/*
  Mini-chart de NPS — bolinhas por briefing, conectadas por linha,
  coloridas pelo score (verde >=9, bronze >=7, vermelho abaixo).
*/

function toneFor(score: number): string {
  if (score >= 9) return "var(--color-status-ok)";
  if (score >= 7) return "var(--color-bronze)";
  return "var(--color-status-critical)";
}

export function NpsChart({ briefings, className }: NpsChartProps) {
  const scored = briefings
    .filter((b) => b.npsScore !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (scored.length === 0) {
    return (
      <p className="text-text-dim text-[12px] py-4 text-center">
        Sem briefings com NPS ainda.
      </p>
    );
  }

  const width = 280;
  const height = 70;
  const padX = 12;
  const padY = 14;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const xStep = scored.length > 1 ? innerW / (scored.length - 1) : 0;

  const points = scored.map((b, i) => {
    const x = padX + i * xStep;
    const y = padY + innerH - ((b.npsScore ?? 0) / 10) * innerH;
    return { x, y, score: b.npsScore ?? 0 };
  });

  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label="Histórico de NPS"
      >
        {[0, 5, 10].map((v) => {
          const y = padY + innerH - (v / 10) * innerH;
          return (
            <g key={v}>
              <line
                x1={padX}
                x2={width - padX}
                y1={y}
                y2={y}
                stroke="var(--color-border-default)"
                strokeWidth="0.5"
                strokeDasharray="2 3"
                opacity="0.5"
              />
            </g>
          );
        })}
        {points.length > 1 ? (
          <path
            d={linePath}
            stroke="var(--color-bronze)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />
        ) : null}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={toneFor(p.score)}
            stroke="var(--color-surface-raised)"
            strokeWidth="1.5"
          />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-text-dim font-mono">
        <span>
          {new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "short",
          }).format(scored[0]?.date ?? new Date())}
        </span>
        <span>{scored.length} briefings</span>
        <span>
          {new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "short",
          }).format(scored[scored.length - 1]?.date ?? new Date())}
        </span>
      </div>
    </div>
  );
}
