"use client";

import { IconChartBar, IconList } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/*
  ViewToggle — Graficos / Lista (segmento de duas opcoes).
  Controlado externamente via prop value + onChange.
*/

export type DashboardView = "graficos" | "lista";

interface ViewToggleProps {
  value: DashboardView;
  onChange: (next: DashboardView) => void;
  className?: string;
}

const OPTIONS: { value: DashboardView; label: string; Icon: typeof IconChartBar }[] = [
  { value: "graficos", label: "Gráficos", Icon: IconChartBar },
  { value: "lista", label: "Lista", Icon: IconList },
];

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex bg-card-deep border border-tactical rounded-full p-1",
        className,
      )}
      role="tablist"
    >
      {OPTIONS.map(({ value: optValue, label, Icon }) => {
        const isActive = optValue === value;
        return (
          <button
            key={optValue}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(optValue)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-colors",
              "font-display uppercase tracking-[0.06em] text-[11px] font-medium",
              isActive
                ? "bg-jungle text-cream"
                : "text-cream-muted hover:text-cream hover:bg-combat/60",
            )}
          >
            <Icon size={13} stroke={1.5} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
