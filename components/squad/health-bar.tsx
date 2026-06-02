import { cn } from "@/lib/utils";

/*
  HealthBar — barra horizontal multi-segmento que mostra a distribuicao de saude
  do squad inteiro (X em campo · Y atencao · Z baixa iminente).

  Componente novo da Sprint 1.5.
*/

interface HealthBarProps {
  total: number;
  emCampo: number;
  atencao: number;
  baixaIminente: number;
  extracao?: number;
  /** Titulo curto a esquerda (default: "Recrutas") */
  label?: string;
  className?: string;
}

export function HealthBar({
  total,
  emCampo,
  atencao,
  baixaIminente,
  extracao = 0,
  label = "Recrutas",
  className,
}: HealthBarProps) {
  const safeTotal = total > 0 ? total : 1;
  const segments: Array<{
    key: string;
    value: number;
    color: string;
    accent: string;
    name: string;
  }> = [
    { key: "em_campo", value: emCampo, color: "bg-patrol", accent: "text-patrol", name: "Em campo" },
    { key: "atencao", value: atencao, color: "bg-bronze", accent: "text-bronze", name: "Em atenção" },
    { key: "baixa_iminente", value: baixaIminente, color: "bg-casualty", accent: "text-casualty", name: "Baixa iminente" },
    { key: "extracao", value: extracao, color: "bg-tactical", accent: "text-cream-dim", name: "Extração" },
  ].filter((s) => s.value > 0);

  return (
    <section
      className={cn(
        "surface-raised px-5 py-4 flex flex-col gap-3",
        className,
      )}
      aria-label="Distribuição de saúde dos recrutas"
    >
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[28px] font-medium leading-none text-cream">
            {total}
          </span>
          <span className="label-display text-[11px] text-cream-dim">
            {label}
          </span>
        </div>

        <ul className="flex items-center gap-4 text-[11px]">
          {segments.map((s) => (
            <li
              key={s.key}
              className="flex items-center gap-1.5 text-cream-muted"
            >
              <span
                className={cn("w-1.5 h-1.5 rounded-full", s.color)}
                aria-hidden
              />
              <span>{s.name.split(" ")[0] === "Baixa" ? "Críticos" : s.name}</span>
              <span className={cn("font-mono font-medium", s.accent)}>
                {s.value}
              </span>
            </li>
          ))}
        </ul>
      </header>

      <div
        className="flex w-full h-2 rounded-full overflow-hidden bg-combat/60 ring-1 ring-tactical"
        role="img"
        aria-label="Barra de distribuição"
      >
        {segments.map((s) => (
          <div
            key={s.key}
            className={cn("h-full", s.color)}
            style={{ width: `${(s.value / safeTotal) * 100}%` }}
            title={`${s.name}: ${s.value}`}
          />
        ))}
      </div>
    </section>
  );
}
