import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
} from "@tabler/icons-react";
import type { ProductWeeklyComparison } from "@/lib/queries/funnel";
import { cn } from "@/lib/utils";

/*
  ProductWeeklyComparisonSection — para cada produto, mostra 4 métricas
  (mobilizadas, etapas concluídas, briefings, ordens cumpridas) comparando
  esta semana vs a anterior, com barras paralelas + delta %.
*/

interface Props {
  products: ProductWeeklyComparison[];
}

function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export function ProductWeeklyComparisonSection({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: ProductWeeklyComparison }) {
  const metrics = [
    product.metrics.mobilized,
    product.metrics.stages,
    product.metrics.briefings,
    product.metrics.orders,
  ];

  const max = Math.max(
    1,
    ...metrics.flatMap((m) => [m.current, m.previous]),
  );

  return (
    <article className="surface-deep p-4 flex flex-col gap-3">
      <header className="flex items-baseline justify-between gap-2 flex-wrap">
        <h3 className="font-display text-[14px] font-medium text-text-primary">
          {product.name}
        </h3>
        <span className="font-mono text-text-secondary text-[11px] tabular-nums">
          {product.activeOperations} ativas
        </span>
      </header>

      <ul className="flex flex-col gap-2.5">
        {metrics.map((m) => (
          <MetricRow
            key={m.label}
            label={m.label}
            current={m.current}
            previous={m.previous}
            max={max}
          />
        ))}
      </ul>
    </article>
  );
}

function MetricRow({
  label,
  current,
  previous,
  max,
}: {
  label: string;
  current: number;
  previous: number;
  max: number;
}) {
  const delta = deltaPct(current, previous);
  const isUp = delta !== null && delta > 0;
  const isDown = delta !== null && delta < 0;
  const currentPct = (current / max) * 100;
  const previousPct = (previous / max) * 100;

  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-text-secondary text-[11px]">{label}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 font-mono text-[10px] tabular-nums",
            isUp && "text-status-ok-text",
            isDown && "text-status-critical-text",
            delta === null && "text-text-dim",
            delta === 0 && "text-text-dim",
          )}
        >
          {delta === null ? (
            <>
              <IconMinus size={10} aria-hidden /> n/a
            </>
          ) : delta > 0 ? (
            <>
              <IconTrendingUp size={10} aria-hidden /> +{delta}%
            </>
          ) : delta < 0 ? (
            <>
              <IconTrendingDown size={10} aria-hidden /> {delta}%
            </>
          ) : (
            <>
              <IconMinus size={10} aria-hidden /> 0%
            </>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-mono text-text-primary text-[11px] tabular-nums w-6 text-right shrink-0">
          {current}
        </span>
        <div className="flex-1 flex flex-col gap-0.5">
          <div className="h-1.5 rounded-full bg-surface-base/60 overflow-hidden ring-1 ring-border-default/30">
            <div
              className="h-full bar-gradient-warm"
              style={{ width: `${currentPct}%` }}
            />
          </div>
          <div className="h-1 rounded-full bg-surface-base/60 overflow-hidden ring-1 ring-border-default/20">
            <div
              className="h-full bg-text-dim/50"
              style={{ width: `${previousPct}%` }}
            />
          </div>
        </div>
        <span className="font-mono text-text-dim text-[10px] tabular-nums w-6 text-right shrink-0">
          {previous}
        </span>
      </div>
    </li>
  );
}
