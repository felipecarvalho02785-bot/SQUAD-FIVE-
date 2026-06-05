"use client";

import { useState } from "react";
import {
  IconAlertTriangle,
  IconCalendar,
  IconChecks,
  IconActivity,
  IconArrowUpRight,
  IconChartBar,
  IconUsers,
} from "@tabler/icons-react";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusPill } from "@/components/ui/status-pill";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { RecruitCard } from "@/components/recruta/recruit-card";
import { Gauge } from "@/components/charts/gauge";
import { BarRanking, type BarRankingItem } from "@/components/charts/bar-ranking";
import {
  ProductBreakdown,
  type ProductBreakdownItem,
} from "@/components/squad/product-breakdown";
import { ViewToggle, type DashboardView } from "@/components/squad/view-toggle";

/*
  ComandoContent — area interativa do Comando Central (client island).
  Controla o toggle Graficos / Lista. Dados vem do server (page.tsx).
*/

interface MockRecruit {
  id: string;
  name: string;
  initials: string;
  subtitle?: string;
  health: "em_campo" | "atencao" | "baixa_iminente" | "extracao";
  priority?: number;
  progress: number;
  progressLabel?: string;
  progressPercentDisplay?: string;
  tags?: string[];
  avatarGradient?: "copper" | "patrol" | "casualty" | "bronze";
}

interface MockBriefing {
  id: string;
  time: string;
  recruit: string;
  duration: number;
}

interface ComandoContentProps {
  kpis: {
    clientesAtivos: number;
    tasksMedia: number;
    entregasMedia: number;
    gapsAbertos: number;
    gapsCriticos: number;
  };
  saudeMedia: number;
  topOperacoes: BarRankingItem[];
  baixas: MockRecruit[];
  atencao: MockRecruit[];
  briefingsHoje: MockBriefing[];
  produtos: ProductBreakdownItem[];
  weekRange: string;
}

export function ComandoContent({
  kpis,
  saudeMedia,
  topOperacoes,
  baixas,
  atencao,
  briefingsHoje,
  produtos,
  weekRange,
}: ComandoContentProps) {
  const [view, setView] = useState<DashboardView>("graficos");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <ViewToggle value={view} onChange={setView} />
        <span className="hidden sm:flex items-center gap-2 text-text-dim text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-patrol animate-pulse-live" />
          Dados sincronizando ao vivo
        </span>
      </div>

      <section
        aria-label="Indicadores"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <KPICard
          label="Clientes"
          value={kpis.clientesAtivos}
          icon={IconUsers}
          hint="Recrutas no radar"
          progress={Math.round((kpis.clientesAtivos / 40) * 100)}
          progressTone="cool"
        />
        <KPICard
          label="Tasks médias"
          value={`${kpis.tasksMedia}%`}
          icon={IconActivity}
          hint="Conclusão semanal"
          progress={kpis.tasksMedia}
          progressTone="warm"
        />
        <KPICard
          label="Entregas médias"
          value={`${kpis.entregasMedia}%`}
          icon={IconChecks}
          hint="Itens cumpridos"
          progress={kpis.entregasMedia}
          progressTone="cool"
        />
        <KPICard
          label="Gaps abertos"
          value={kpis.gapsAbertos}
          icon={IconAlertTriangle}
          hint={`${kpis.gapsCriticos} críticos`}
          negative={kpis.gapsCriticos > 0}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 flex flex-col gap-3">
          {view === "graficos" ? (
            <GraficosView saudeMedia={saudeMedia} topOperacoes={topOperacoes} />
          ) : (
            <ListaView baixas={baixas} atencao={atencao} />
          )}
        </div>

        <aside className="flex flex-col gap-3">
          <BriefingsHojeCard items={briefingsHoje} />
          <ResumoSemanalCard
            weekRange={weekRange}
            tasksDone={Math.round((kpis.tasksMedia * 28) / 100)}
            tasksTotal={28}
            tasksPct={kpis.tasksMedia}
            produtos={produtos}
          />
        </aside>
      </div>
    </div>
  );
}

function GraficosView({
  saudeMedia,
  topOperacoes,
}: {
  saudeMedia: number;
  topOperacoes: BarRankingItem[];
}) {
  return (
    <>
      <section className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <article className="surface-raised p-5 sm:col-span-2 flex flex-col gap-3">
          <header className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <h2 className="font-display text-[14px] font-medium text-text-primary">
                Saúde média
              </h2>
              <p className="text-text-dim text-[11px]">
                Score consolidado do squad
              </p>
            </div>
            <span
              className="w-7 h-7 rounded-md bg-surface-deep border border-border-default text-text-secondary flex items-center justify-center"
              aria-hidden
            >
              <IconActivity size={14} stroke={1.5} />
            </span>
          </header>

          <div className="flex-1 flex items-center justify-center py-2">
            <Gauge
              value={saudeMedia}
              max={100}
              size={200}
              label="Saúde média"
              hint="Atualizado agora"
            />
          </div>
        </article>

        <article className="surface-raised p-5 sm:col-span-3 flex flex-col gap-3">
          <header className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <h2 className="font-display text-[14px] font-medium text-text-primary">
                Top operações
              </h2>
              <p className="text-text-dim text-[11px]">
                Maior progresso combinado
              </p>
            </div>
            <span
              className="w-7 h-7 rounded-md bg-surface-deep border border-border-default text-text-secondary flex items-center justify-center"
              aria-hidden
            >
              <IconChartBar size={14} stroke={1.5} />
            </span>
          </header>

          <BarRanking
            items={topOperacoes}
            showLegend
            primaryLabel="Entregas"
            secondaryLabel="Tasks"
          />
        </article>
      </section>

      <section className="surface-raised p-5 flex flex-col gap-3">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIndicator status="atencao" size="md" />
            <h2 className="font-display text-[14px] font-medium text-text-primary">
              Operações em atenção
            </h2>
            <span className="font-mono text-[11px] text-bronze">10</span>
          </div>
          <button
            type="button"
            className="text-[11px] text-text-dim hover:text-text-primary transition-colors flex items-center gap-1"
          >
            Ver todas <IconArrowUpRight size={12} stroke={1.5} />
          </button>
        </header>

        <p className="text-text-secondary text-[12px] -mt-1">
          Distribuição de tasks por operação na semana atual.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {topOperacoes.slice(0, 6).map((op) => (
            <div
              key={`mini-${op.id}`}
              className="flex items-center gap-3 p-2.5 rounded-md bg-surface-deep border border-border-default/40"
            >
              <span className="font-display text-[18px] text-bronze tabular-nums leading-none">
                {op.trailing}
              </span>
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <span className="text-text-primary text-[12px] truncate">{op.label}</span>
                <div className="h-1.5 rounded-full bg-surface-base overflow-hidden ring-1 ring-tactical/30">
                  <div
                    className="h-full bar-gradient-warm"
                    style={{ width: `${op.primary}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ListaView({
  baixas,
  atencao,
}: {
  baixas: MockRecruit[];
  atencao: MockRecruit[];
}) {
  return (
    <div className="surface-raised p-4 flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIndicator status="baixa_iminente" size="md" />
            <h2 className="label-display text-[11px] text-text-primary">
              Baixas iminentes
            </h2>
            <span className="font-mono text-[11px] text-casualty">
              {baixas.length}
            </span>
          </div>
          <button
            type="button"
            className="text-[11px] text-text-dim hover:text-text-primary transition-colors flex items-center gap-1"
          >
            Ver todas <IconArrowUpRight size={12} stroke={1.5} />
          </button>
        </header>

        {baixas.length === 0 ? (
          <p className="py-6 text-center text-text-secondary text-[13px]">
            Setor calmo. Nenhuma operação em risco.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {baixas.map((r) => (
              <li key={r.id}>
                <RecruitCard {...r} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIndicator status="atencao" size="md" />
            <h2 className="label-display text-[11px] text-text-primary">Em atenção</h2>
            <span className="font-mono text-[11px] text-bronze">{atencao.length}</span>
          </div>
          <button
            type="button"
            className="text-[11px] text-text-dim hover:text-text-primary transition-colors flex items-center gap-1"
          >
            Ver todas <IconArrowUpRight size={12} stroke={1.5} />
          </button>
        </header>

        <ul className="flex flex-col gap-2">
          {atencao.map((r) => (
            <li key={r.id}>
              <RecruitCard {...r} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function BriefingsHojeCard({ items }: { items: MockBriefing[] }) {
  return (
    <section className="surface-jungle p-4 flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconCalendar size={14} className="text-bronze" stroke={1.5} />
          <h2 className="label-display text-[11px] text-text-primary">
            Briefings hoje
          </h2>
        </div>
        <span className="font-mono text-[11px] text-text-secondary">
          {items.length}
        </span>
      </header>

      <ul className="flex flex-col">
        {items.map((b) => (
          <li
            key={b.id}
            className="flex items-center gap-3 py-2 border-b border-border-default/40 last:border-0"
          >
            <span className="font-mono text-[12px] text-bronze tabular-nums shrink-0">
              {b.time}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-[12px] truncate">{b.recruit}</p>
              <p className="text-text-secondary text-[10px]">{b.duration} min</p>
            </div>
            <StatusIndicator status="em_campo" size="mini" />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ResumoSemanalCard({
  weekRange,
  tasksDone,
  tasksTotal,
  tasksPct,
  produtos,
}: {
  weekRange: string;
  tasksDone: number;
  tasksTotal: number;
  tasksPct: number;
  produtos: ProductBreakdownItem[];
}) {
  return (
    <section className="surface-raised p-4 flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconChartBar size={14} className="text-text-secondary" stroke={1.5} />
          <h2 className="label-display text-[11px] text-text-primary">
            Relatório semanal
          </h2>
        </div>
        <button
          type="button"
          className="font-display uppercase tracking-[0.05em] text-[10px] text-bronze hover:text-text-primary transition-colors"
        >
          Gerar agora
        </button>
      </header>

      <p className="text-text-secondary text-[11px] -mt-2">Semana de {weekRange}</p>

      <ProductBreakdown items={produtos} />

      <div className="flex flex-col gap-1 pt-3 border-t border-border-default/40">
        <div className="flex items-baseline justify-between">
          <span className="text-text-primary text-[11px]">Tasks gerais</span>
          <span className="font-mono text-text-secondary text-[11px] tabular-nums">
            {tasksDone}/{tasksTotal} · {tasksPct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-deep overflow-hidden ring-1 ring-tactical/40">
          <div
            className="h-full bar-gradient-warm"
            style={{ width: `${tasksPct}%` }}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-border-default/40 flex items-center justify-between">
        <span className="label-display text-[10px] text-text-secondary">
          Galeria de status
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <StatusPill status="em_campo" />
        <StatusPill status="atencao" />
        <StatusPill status="baixa_iminente" />
        <StatusPill status="extracao" />
      </div>
    </section>
  );
}
