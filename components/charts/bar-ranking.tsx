import { cn } from "@/lib/utils";

/*
  BarRanking — lista de barras horizontais usada pra "Top clientes" /
  "Top operacoes". Duas barras stackadas (entregas + tasks) com gradient warm.
*/

export interface BarRankingItem {
  id: string;
  label: string;
  /** Valor principal (0-100) — barra grossa */
  primary: number;
  /** Valor secundario opcional (0-100) — barra fina abaixo */
  secondary?: number;
  /** Pequeno texto direita (ex: "89%") */
  trailing?: string;
}

interface BarRankingProps {
  items: BarRankingItem[];
  /** Mostra rotulos das duas barras na primeira linha */
  showLegend?: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
  className?: string;
}

export function BarRanking({
  items,
  showLegend = false,
  primaryLabel = "Entregas",
  secondaryLabel = "Tasks",
  className,
}: BarRankingProps) {
  return (
    <div className={cn("flex flex-col gap-3.5", className)}>
      {showLegend ? (
        <div className="flex items-center gap-4 text-[10px] text-text-dim">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bar-gradient-warm" />
            {primaryLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-patrol" />
            {secondaryLabel}
          </span>
        </div>
      ) : null}

      <ul className="flex flex-col gap-3.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <span className="text-text-primary text-[12px] min-w-[110px] sm:min-w-[140px] truncate">
              {item.label}
            </span>

            <div className="flex-1 flex flex-col gap-1">
              <div className="h-2 rounded-full bg-surface-deep ring-1 ring-border-default/40 overflow-hidden">
                <div
                  className="h-full rounded-full bar-gradient-warm"
                  style={{ width: `${Math.max(0, Math.min(100, item.primary))}%` }}
                />
              </div>
              {typeof item.secondary === "number" ? (
                <div className="h-1.5 rounded-full bg-surface-deep ring-1 ring-border-default/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-patrol"
                    style={{
                      width: `${Math.max(0, Math.min(100, item.secondary))}%`,
                    }}
                  />
                </div>
              ) : null}
            </div>

            {item.trailing ? (
              <span className="font-mono text-text-primary text-[11px] tabular-nums min-w-[36px] text-right">
                {item.trailing}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
