import { cn } from "@/lib/utils";

/*
  ProductBreakdown — micro-stats por produto/categoria usado na sidebar
  do Comando Central.

  Layout:
    Produto X
    [N] clientes ativos
    [SAUDÁVEIS]  [ATENÇÃO]  [CRÍTICOS]  [AVANÇARAM]
    Tasks       X/Y · Z%
    [Cliente em destaque com pill]
*/

export interface ProductBreakdownItem {
  id: string;
  name: string;
  activeCount: number;
  stats: {
    saudaveis: number;
    atencao: number;
    criticos: number;
    avancaram: number;
  };
  tasksProgress: {
    done: number;
    total: number;
  };
  /** Cliente em destaque (opcional) */
  highlight?: {
    name: string;
    tag: string;
    pct: number;
  };
}

interface ProductBreakdownProps {
  items: ProductBreakdownItem[];
  className?: string;
}

export function ProductBreakdown({ items, className }: ProductBreakdownProps) {
  return (
    <ul className={cn("flex flex-col gap-4", className)}>
      {items.map((item) => {
        const taskPct =
          item.tasksProgress.total > 0
            ? Math.round(
                (item.tasksProgress.done / item.tasksProgress.total) * 100,
              )
            : 0;

        return (
          <li
            key={item.id}
            className="flex flex-col gap-2 pb-4 border-b border-tactical/50 last:border-0 last:pb-0"
          >
            <header className="flex flex-col gap-0.5">
              <h3 className="text-cream text-[13px] font-medium leading-none">
                {item.name}
              </h3>
              <p className="text-cream-dim text-[10px]">
                {item.activeCount} {item.activeCount === 1 ? "cliente ativo" : "clientes ativos"}
              </p>
            </header>

            <div className="grid grid-cols-4 gap-1 text-center mt-1">
              <Micro value={item.stats.saudaveis} label="Saudáveis" tone="patrol" />
              <Micro value={item.stats.atencao} label="Atenção" tone="bronze" />
              <Micro value={item.stats.criticos} label="Críticos" tone="casualty" />
              <Micro value={item.stats.avancaram} label="Avançaram" tone="cream" arrow />
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-baseline justify-between">
                <span className="text-cream text-[11px]">Tasks</span>
                <span className="font-mono text-cream-muted text-[11px] tabular-nums">
                  {item.tasksProgress.done}/{item.tasksProgress.total} · {taskPct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-combat/60 overflow-hidden ring-1 ring-tactical/40">
                <div
                  className="h-full bar-gradient-warm"
                  style={{ width: `${taskPct}%` }}
                />
              </div>
            </div>

            {item.highlight ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-bronze" />
                <span className="text-cream text-[11px] flex-1 truncate">
                  {item.highlight.name}
                </span>
                <span className="font-display text-[10px] text-cream-muted tracking-[0.05em]">
                  {item.highlight.tag} · {item.highlight.pct}%
                </span>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function Micro({
  value,
  label,
  tone,
  arrow = false,
}: {
  value: number;
  label: string;
  tone: "patrol" | "bronze" | "casualty" | "cream";
  arrow?: boolean;
}) {
  const TONE_CLASS = {
    patrol: "text-patrol",
    bronze: "text-bronze",
    casualty: "text-casualty",
    cream: "text-cream",
  }[tone];

  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={cn(
          "font-mono text-[14px] font-medium tabular-nums leading-none",
          TONE_CLASS,
        )}
      >
        {arrow ? "↗" : ""}
        {value}
      </span>
      <span className="label-display text-[8px] text-cream-dim">{label}</span>
    </div>
  );
}
