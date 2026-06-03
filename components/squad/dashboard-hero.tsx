import { IconActivity } from "@tabler/icons-react";
import { Gauge } from "@/components/charts/gauge";
import { cn } from "@/lib/utils";

/*
  DashboardHero — hero do Comando Central. Saudação grande + gauge global +
  3-4 KPIs em coluna lateral. Substitui o PageHeader + HealthBar genéricos.
*/

interface DashboardHeroProps {
  salute: string;
  callToAction: string;
  updatedAt: Date;
  saudeMedia: number;
  /** Lista de operações distribuídas */
  health: {
    emCampo: number;
    atencao: number;
    baixaIminente: number;
    extracao: number;
    total: number;
  };
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

export function DashboardHero({
  salute,
  callToAction,
  updatedAt,
  saudeMedia,
  health,
}: DashboardHeroProps) {
  const totalAtivas = health.total - health.extracao;

  return (
    <section className="surface-raised overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        <div className="lg:col-span-2 p-6 sm:p-8 flex flex-col justify-between gap-6 relative">
          {/* Gradient ambient sutil */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(168,90,58,0.10), transparent 50%)",
            }}
            aria-hidden
          />

          <div className="relative flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-dim text-[11px] font-mono">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-status-ok animate-pulse-live"
                aria-hidden
              />
              <span>Atualizado {formatTime(updatedAt)}</span>
            </div>
            <h1 className="font-display text-[30px] sm:text-[36px] font-medium leading-[1.05] text-text-primary">
              {salute}
            </h1>
            <p className="text-text-secondary text-[14px]">{callToAction}</p>
          </div>

          {/* HealthBar inline */}
          <div className="relative flex flex-col gap-2">
            <div className="flex items-baseline justify-between flex-wrap gap-3">
              <span className="font-display text-[14px] text-text-primary">
                <span className="text-[24px]">{totalAtivas}</span>{" "}
                <span className="label-display text-[10px] text-text-label ml-1">
                  Operações ativas
                </span>
              </span>
              <ul className="flex items-center gap-4 text-[11px]">
                <Legend
                  color="bg-status-ok"
                  label="Em campo"
                  value={health.emCampo}
                  toneClass="text-status-ok-text"
                />
                <Legend
                  color="bg-status-warn"
                  label="Atenção"
                  value={health.atencao}
                  toneClass="text-status-warn-text"
                />
                <Legend
                  color="bg-status-critical"
                  label="Críticos"
                  value={health.baixaIminente}
                  toneClass="text-status-critical-text"
                />
              </ul>
            </div>
            <div
              className="flex w-full h-2 rounded-full overflow-hidden bg-surface-base/60 ring-1 ring-border-default"
              role="img"
              aria-label="Distribuição"
            >
              {[
                { value: health.emCampo, bg: "bg-status-ok" },
                { value: health.atencao, bg: "bg-status-warn" },
                {
                  value: health.baixaIminente,
                  bg: "bg-status-critical",
                },
                { value: health.extracao, bg: "bg-status-idle" },
              ]
                .filter((s) => s.value > 0)
                .map((s, i) => (
                  <div
                    key={i}
                    className={cn("h-full", s.bg)}
                    style={{ width: `${(s.value / health.total) * 100}%` }}
                  />
                ))}
            </div>
          </div>
        </div>

        <div
          className="relative flex flex-col items-center justify-center p-6 border-t lg:border-t-0 lg:border-l border-border-default bg-surface-deep/40"
        >
          <Gauge
            value={saudeMedia}
            max={100}
            size={180}
            label="Saúde média do squad"
            hint="Score consolidado em tempo real"
          />
          <div className="absolute top-4 right-4 w-7 h-7 rounded-md bg-surface-base/40 border border-border-default text-text-secondary flex items-center justify-center">
            <IconActivity size={14} stroke={1.5} aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}

function Legend({
  color,
  label,
  value,
  toneClass,
}: {
  color: string;
  label: string;
  value: number;
  toneClass: string;
}) {
  return (
    <li className="flex items-center gap-1.5 text-text-secondary">
      <span className={cn("w-1.5 h-1.5 rounded-full", color)} aria-hidden />
      <span>{label}</span>
      <span className={cn("font-mono font-medium", toneClass)}>{value}</span>
    </li>
  );
}
