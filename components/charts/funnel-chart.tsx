import { cn } from "@/lib/utils";

/*
  FunnelChart — funil horizontal por etapa. Cada barra mostra quantas
  operações estão em cada etapa do produto. Largura proporcional ao total.
*/

export interface FunnelStage {
  name: string;
  count: number;
  /** Cor tonal — bronze=ativo, patrol=ok, casualty=critico */
  tone?: "bronze" | "patrol" | "casualty" | "warn";
}

interface FunnelChartProps {
  stages: FunnelStage[];
  className?: string;
}

const TONE_BG = {
  bronze: "bg-bronze",
  patrol: "bg-status-ok",
  casualty: "bg-status-critical",
  warn: "bg-status-warn",
};

export function FunnelChart({ stages, className }: FunnelChartProps) {
  const maxCount = Math.max(...stages.map((s) => s.count), 1);
  const totalCount = stages.reduce((acc, s) => acc + s.count, 0);

  if (totalCount === 0) {
    return (
      <p className="text-text-dim text-[12px] py-4 text-center">
        Sem operações nesta visão.
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {stages.map((stage, i) => {
        const pct = (stage.count / maxCount) * 100;
        const tone = stage.tone ?? (stage.count === 0 ? "warn" : "bronze");
        return (
          <div key={i} className="flex items-center gap-3 group">
            <span className="font-mono text-[10px] text-text-dim w-6 text-right shrink-0">
              {i + 1}.
            </span>
            <div className="flex-1 relative h-6 rounded bg-surface-deep border border-border-default/40 overflow-hidden">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 transition-all",
                  TONE_BG[tone],
                  "opacity-80 group-hover:opacity-100",
                )}
                style={{ width: `${pct}%` }}
              />
              <div className="absolute inset-0 flex items-center px-3 z-10">
                <span className="text-text-primary text-[11px] font-medium truncate">
                  {stage.name}
                </span>
              </div>
            </div>
            <span className="font-mono text-bronze text-[12px] tabular-nums w-8 text-right shrink-0">
              {stage.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
