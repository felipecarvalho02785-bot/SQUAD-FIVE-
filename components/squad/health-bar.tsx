import { cn } from "@/lib/utils";

/*
  HealthBar — barra horizontal multi-segmento que mostra a distribuicao
  de saude do squad inteiro (X em campo · Y atencao · Z baixa iminente).
*/

interface HealthBarProps {
  total: number;
  emCampo: number;
  atencao: number;
  baixaIminente: number;
  extracao?: number;
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
    bg: string;
    text: string;
    name: string;
    shortName: string;
  }> = [
    {
      key: "em_campo",
      value: emCampo,
      bg: "bg-status-ok",
      text: "text-status-ok-text",
      name: "Em campo",
      shortName: "Saudáveis",
    },
    {
      key: "atencao",
      value: atencao,
      bg: "bg-status-warn",
      text: "text-status-warn-text",
      name: "Em atenção",
      shortName: "Atenção",
    },
    {
      key: "baixa_iminente",
      value: baixaIminente,
      bg: "bg-status-critical",
      text: "text-status-critical-text",
      name: "Baixa iminente",
      shortName: "Críticos",
    },
    {
      key: "extracao",
      value: extracao,
      bg: "bg-status-idle",
      text: "text-text-secondary",
      name: "Extração",
      shortName: "Extração",
    },
  ].filter((s) => s.value > 0);

  return (
    <section
      className={cn(
        "surface-raised px-5 py-4 flex flex-col gap-3",
        className,
      )}
      aria-label="Distribuição de saúde dos recrutas"
    >
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[28px] font-medium leading-none text-text-primary">
            {total}
          </span>
          <span className="label-display text-[11px] text-text-label">
            {label}
          </span>
        </div>

        <ul className="flex items-center gap-4 text-[11px]">
          {segments.map((s) => (
            <li
              key={s.key}
              className="flex items-center gap-1.5 text-text-secondary"
            >
              <span
                className={cn("w-1.5 h-1.5 rounded-full", s.bg)}
                aria-hidden
              />
              <span>{s.shortName}</span>
              <span className={cn("font-mono font-medium", s.text)}>
                {s.value}
              </span>
            </li>
          ))}
        </ul>
      </header>

      <div
        className="flex w-full h-2 rounded-full overflow-hidden bg-surface-base/60 ring-1 ring-border-default"
        role="img"
        aria-label="Barra de distribuição"
      >
        {segments.map((s) => (
          <div
            key={s.key}
            className={cn("h-full", s.bg)}
            style={{ width: `${(s.value / safeTotal) * 100}%` }}
            title={`${s.name}: ${s.value}`}
          />
        ))}
      </div>
    </section>
  );
}
