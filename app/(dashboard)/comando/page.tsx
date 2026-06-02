import {
  IconTarget,
  IconUserPlus,
  IconAlertTriangle,
  IconCalendar,
  IconArrowUpRight,
  IconChartBar,
} from "@tabler/icons-react";
import { auth } from "@/lib/auth";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusPill } from "@/components/ui/status-pill";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { PageHeader } from "@/components/squad/page-header";
import { HealthBar } from "@/components/squad/health-bar";
import { RecruitCard } from "@/components/recruta/recruit-card";
import { getGreeting } from "@/lib/greeting";

/*
  Comando Central v2 — refactor da Sprint 1.5.
  Dados sao MOCK (constantes locais) ate a Sprint 4 conectar as queries
  reais. Trocar pelos selects do Prisma quando chegar a Sprint 4.
*/

export const metadata = {
  title: "Comando Central — Squad Five",
};

const MOCK_HEALTH = {
  total: 31,
  emCampo: 19,
  atencao: 10,
  baixaIminente: 2,
  extracao: 0,
};

const MOCK_KPIS = {
  operacoesAtivas: 28,
  novosRecrutas: 4,
  baixasIminentes: 2,
  briefingsHoje: 6,
};

const MOCK_BAIXAS = [
  {
    id: "1",
    name: "Igor José Pinto",
    initials: "IJ",
    subtitle: "Semana 6 · Campanha ativa",
    health: "baixa_iminente" as const,
    priority: 1,
    progress: 44,
    progressLabel: "4/9 entregáveis",
    progressPercentDisplay: "44%",
    tags: ["1 crit."],
    avatarGradient: "casualty" as const,
  },
  {
    id: "2",
    name: "Daniele Souza",
    initials: "DS",
    subtitle: "Semana 6 · Campanha ativa",
    health: "baixa_iminente" as const,
    priority: 3,
    progress: 89,
    progressLabel: "8/9 entregáveis",
    progressPercentDisplay: "89%",
    tags: ["1 gap", "1 crit."],
    avatarGradient: "casualty" as const,
  },
];

const MOCK_ATENCAO = [
  {
    id: "3",
    name: "Luiz Maranhão",
    initials: "LM",
    subtitle: "Semana 6 · Campanha pausada",
    health: "atencao" as const,
    priority: 3,
    progress: 89,
    progressLabel: "8/9 entregáveis",
    progressPercentDisplay: "89%",
    avatarGradient: "bronze" as const,
  },
  {
    id: "4",
    name: "Brenda Veras",
    initials: "BV",
    subtitle: "Semana 7 · Campanha ativa",
    health: "atencao" as const,
    priority: 2,
    progress: 78,
    progressLabel: "7/9 entregáveis",
    progressPercentDisplay: "78%",
    avatarGradient: "bronze" as const,
  },
  {
    id: "5",
    name: "Rodrigo Sirahata",
    initials: "RS",
    subtitle: "Semana 7 · Campanha ativa",
    health: "atencao" as const,
    priority: 2,
    progress: 89,
    progressLabel: "8/9 entregáveis",
    progressPercentDisplay: "89%",
    avatarGradient: "bronze" as const,
  },
];

const MOCK_BRIEFINGS_HOJE = [
  { id: "b1", time: "10:00", recruit: "Veras e Saraiva", duration: 30 },
  { id: "b2", time: "11:30", recruit: "Albrechete Marketing", duration: 45 },
  { id: "b3", time: "14:00", recruit: "Pereira da Costa", duration: 60 },
  { id: "b4", time: "15:30", recruit: "Renata Ruban", duration: 30 },
];

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export default async function ComandoCentralPage() {
  const session = await auth();
  const firstName =
    session?.user?.name?.split(" ")[0] ?? session?.user?.email?.split("@")[0] ?? "Comandante";
  const { salute, callToBriefing } = getGreeting(firstName);

  const now = new Date();
  const weekStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  const weekRange = `${formatShortDate(weekStart)} a ${formatShortDate(now)}`;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={salute}
        subtitle={callToBriefing}
        updatedAt={now}
        live
      />

      <HealthBar
        total={MOCK_HEALTH.total}
        emCampo={MOCK_HEALTH.emCampo}
        atencao={MOCK_HEALTH.atencao}
        baixaIminente={MOCK_HEALTH.baixaIminente}
        extracao={MOCK_HEALTH.extracao}
        label="Recrutas em campo"
      />

      <section
        aria-label="Indicadores principais"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <KPICard
          label="Operações ativas"
          value={MOCK_KPIS.operacoesAtivas}
          icon={IconTarget}
          hint="+2 esta semana"
          progress={88}
          progressTone="cool"
        />
        <KPICard
          label="Novos recrutas"
          value={MOCK_KPIS.novosRecrutas}
          icon={IconUserPlus}
          hint="Últimos 7 dias"
        />
        <KPICard
          label="Baixas iminentes"
          value={MOCK_KPIS.baixasIminentes}
          icon={IconAlertTriangle}
          hint="Ação necessária"
          negative
        />
        <KPICard
          label="Briefings hoje"
          value={MOCK_KPIS.briefingsHoje}
          icon={IconCalendar}
          hint="3 confirmados"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="surface-raised p-4 lg:col-span-2 flex flex-col gap-3">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIndicator status="baixa_iminente" size="md" />
              <h2 className="label-display text-[11px] text-cream">
                Baixas iminentes
              </h2>
              <span className="font-mono text-[11px] text-casualty">
                {MOCK_BAIXAS.length}
              </span>
            </div>
            <button
              type="button"
              className="text-[11px] text-cream-dim hover:text-cream transition-colors flex items-center gap-1"
            >
              Ver todas <IconArrowUpRight size={12} stroke={1.5} />
            </button>
          </header>

          {MOCK_BAIXAS.length === 0 ? (
            <p className="py-8 text-center text-cream-muted text-[13px]">
              Setor calmo. Nenhuma operação em risco.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {MOCK_BAIXAS.map((r) => (
                <li key={r.id}>
                  <RecruitCard {...r} />
                </li>
              ))}
            </ul>
          )}

          <header className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <StatusIndicator status="atencao" size="md" />
              <h2 className="label-display text-[11px] text-cream">
                Em atenção
              </h2>
              <span className="font-mono text-[11px] text-bronze">
                {MOCK_ATENCAO.length}
              </span>
            </div>
            <button
              type="button"
              className="text-[11px] text-cream-dim hover:text-cream transition-colors flex items-center gap-1"
            >
              Ver todas <IconArrowUpRight size={12} stroke={1.5} />
            </button>
          </header>

          <ul className="flex flex-col gap-2">
            {MOCK_ATENCAO.map((r) => (
              <li key={r.id}>
                <RecruitCard {...r} />
              </li>
            ))}
          </ul>
        </div>

        <aside className="flex flex-col gap-3">
          <section className="surface-jungle p-4 flex flex-col gap-3">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconCalendar size={14} className="text-bronze" stroke={1.5} />
                <h2 className="label-display text-[11px] text-cream">
                  Briefings hoje
                </h2>
              </div>
              <span className="font-mono text-[11px] text-cream-muted">
                {MOCK_BRIEFINGS_HOJE.length}
              </span>
            </header>

            <ul className="flex flex-col gap-2.5">
              {MOCK_BRIEFINGS_HOJE.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center gap-3 py-1.5 border-b border-patrol/30 last:border-0"
                >
                  <span className="font-mono text-[12px] text-bronze tabular-nums shrink-0">
                    {b.time}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-cream text-[12px] truncate">
                      {b.recruit}
                    </p>
                    <p className="text-cream-muted text-[10px]">
                      {b.duration} min
                    </p>
                  </div>
                  <StatusIndicator status="em_campo" size="mini" />
                </li>
              ))}
            </ul>
          </section>

          <section className="surface-raised p-4 flex flex-col gap-3">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconChartBar size={14} className="text-cream-muted" stroke={1.5} />
                <h2 className="label-display text-[11px] text-cream">
                  Resumo semanal
                </h2>
              </div>
              <button
                type="button"
                className="font-display uppercase tracking-[0.05em] text-[10px] text-bronze hover:text-cream transition-colors"
              >
                Gerar
              </button>
            </header>

            <p className="text-cream-muted text-[11px] -mt-1">
              Semana de {weekRange}
            </p>

            <div className="grid grid-cols-4 gap-2 text-center mt-1">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[14px] text-patrol font-medium">19</span>
                <span className="label-display text-[8px] text-cream-dim">Saudáveis</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[14px] text-bronze font-medium">10</span>
                <span className="label-display text-[8px] text-cream-dim">Atenção</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[14px] text-casualty font-medium">2</span>
                <span className="label-display text-[8px] text-cream-dim">Críticos</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[14px] text-cream font-medium">3</span>
                <span className="label-display text-[8px] text-cream-dim">Avançaram</span>
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-cream text-[11px]">Tasks</span>
                <span className="font-mono text-cream-muted text-[11px]">9/28 · 32%</span>
              </div>
              <div className="h-1.5 rounded-full bg-combat/60 overflow-hidden ring-1 ring-tactical/40">
                <div
                  className="h-full bar-gradient-warm"
                  style={{ width: "32%" }}
                />
              </div>
            </div>
          </section>

          <section className="surface-raised p-4 flex flex-col gap-2">
            <h2 className="label-display text-[11px] text-cream-muted">
              Galeria de status
            </h2>
            <p className="text-cream-dim text-[10px] -mt-1">
              Componentes de referência (placeholder).
            </p>
            <div className="flex flex-wrap gap-1.5">
              <StatusPill status="em_campo" />
              <StatusPill status="atencao" />
              <StatusPill status="baixa_iminente" />
              <StatusPill status="extracao" />
              <StatusPill status="em_andamento" />
              <StatusPill status="cumprida" />
              <StatusPill status="a_fazer" />
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
