"use client";

import { useState } from "react";
import { IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";
import { ComparisonChart } from "@/components/charts/comparison-chart";
import { cn } from "@/lib/utils";

/*
  ComparisonSection — toggle entre métricas semanais (ordens / briefings /
  recrutas / gaps) e renderiza chart linha comparando esta semana vs a anterior.
*/

interface ComparisonMetric {
  key: string;
  label: string;
  current: number[];
  previous: number[];
  tone: "bronze" | "patrol";
}

interface ComparisonSectionProps {
  metrics: ComparisonMetric[];
  dayLabels: string[];
}

function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export function ComparisonSection({
  metrics,
  dayLabels,
}: ComparisonSectionProps) {
  const [activeKey, setActiveKey] = useState(metrics[0]?.key ?? "");
  const active = metrics.find((m) => m.key === activeKey) ?? metrics[0];

  if (!active) return null;

  const currentTotal = sum(active.current);
  const previousTotal = sum(active.previous);
  const delta = deltaPct(currentTotal, previousTotal);
  const isReverse = active.key === "gapsOpened";

  const deltaIsPositive =
    delta === null || delta === 0
      ? null
      : isReverse
        ? delta < 0
        : delta > 0;

  return (
    <section className="surface-raised p-5 flex flex-col gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="label-display text-[11px] text-text-primary">
            Comparativo semanal
          </h2>
          <p className="text-text-secondary text-[12px]">
            Esta semana vs anterior — clique nas métricas para alternar.
          </p>
        </div>

        <nav
          className="flex flex-wrap items-center gap-1 bg-surface-deep border border-border-default rounded-full p-1"
          aria-label="Métrica em destaque"
        >
          {metrics.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setActiveKey(m.key)}
              aria-pressed={m.key === active.key}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors",
                "font-display uppercase tracking-[0.06em] text-[10px] font-medium",
                m.key === active.key
                  ? "bg-surface-accent text-text-primary"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        <div className="md:col-span-1 flex flex-col gap-2">
          <div className="surface-deep p-3 flex flex-col gap-1">
            <span className="label-display text-[10px] text-text-secondary">
              Esta semana
            </span>
            <span className="font-display text-[28px] text-text-primary tabular-nums leading-none">
              {currentTotal}
            </span>
          </div>
          <div className="surface-deep p-3 flex flex-col gap-1">
            <span className="label-display text-[10px] text-text-secondary">
              Semana anterior
            </span>
            <span className="font-display text-[20px] text-text-secondary tabular-nums leading-none">
              {previousTotal}
            </span>
          </div>
          <div
            className={cn(
              "surface-deep p-3 flex items-center justify-between gap-2",
              deltaIsPositive === true && "ring-1 ring-status-ok/50",
              deltaIsPositive === false && "ring-1 ring-status-critical/50",
            )}
          >
            <span className="label-display text-[10px] text-text-secondary">
              Variação
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 font-mono text-[14px] tabular-nums",
                deltaIsPositive === true && "text-status-ok-text",
                deltaIsPositive === false && "text-status-critical-text",
                deltaIsPositive === null && "text-text-secondary",
              )}
            >
              {delta === null ? (
                <>
                  <IconMinus size={12} aria-hidden /> n/a
                </>
              ) : delta > 0 ? (
                <>
                  <IconTrendingUp size={12} aria-hidden /> +{delta}%
                </>
              ) : delta < 0 ? (
                <>
                  <IconTrendingDown size={12} aria-hidden /> {delta}%
                </>
              ) : (
                <>
                  <IconMinus size={12} aria-hidden /> 0%
                </>
              )}
            </span>
          </div>
        </div>

        <div className="md:col-span-3 surface-deep p-3">
          <ComparisonChart
            current={{
              label: "Esta semana",
              values: active.current,
              tone: active.tone,
            }}
            previous={{
              label: "Anterior",
              values: active.previous,
              tone: "dim",
            }}
            dayLabels={dayLabels}
            height={200}
          />
        </div>
      </div>
    </section>
  );
}
