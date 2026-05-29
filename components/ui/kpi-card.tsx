import { cn } from "@/lib/utils";

/*
  KPICard — card de indicador no Comando Central.
  Specs em docs/03_SISTEMA_DESIGN.md secao 5.2.
*/

interface KPICardProps {
  label: string;
  value: string | number;
  /** Quando true, usa o vermelho (casualty) no numero — para indicadores ruins. */
  negative?: boolean;
  /** Texto pequeno de contexto abaixo do numero. Ex.: "+3 esta semana". */
  hint?: string;
  className?: string;
}

export function KPICard({
  label,
  value,
  negative = false,
  hint,
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "bg-jungle border border-patrol rounded-card px-4 py-3.5 flex flex-col gap-1",
        className,
      )}
    >
      <span
        className={cn(
          "font-display font-medium leading-none text-[32px]",
          negative ? "text-casualty" : "text-bronze",
        )}
      >
        {value}
      </span>
      <span className="font-display uppercase tracking-[0.1em] text-[11px] text-cream-muted leading-none mt-2">
        {label}
      </span>
      {hint ? (
        <span className="text-[11px] text-cream-dim mt-0.5">{hint}</span>
      ) : null}
    </div>
  );
}
