import Link from "next/link";
import {
  IconUserPlus,
  IconTargetArrow,
  IconCalendar,
  IconChecks,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { auth } from "@/lib/auth";
import { DashboardHero } from "@/components/squad/dashboard-hero";
import { KPICard } from "@/components/ui/kpi-card";
import { EmptyState } from "@/components/squad/empty-state";
import { getGreeting } from "@/lib/greeting";
import { getDashboardSnapshot } from "@/lib/queries/dashboard";
import { getKpisWithTrends } from "@/lib/queries/kpi-snapshot";
import { ComandoContent } from "./comando-content";

export const metadata = {
  title: "Comando Central — Squad Five",
};

export const dynamic = "force-dynamic";

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export default async function ComandoCentralPage() {
  const [session, snapshot, kpisOrError] = await Promise.all([
    auth(),
    getDashboardSnapshot(),
    getKpisWithTrends().catch(() => null),
  ]);

  const kpis = kpisOrError ?? {
    tasksCompleted: {
      label: "Ordens cumpridas",
      value: 0,
      previous: 0,
      sparkline: [],
    },
    briefings: {
      label: "Briefings registrados",
      value: 0,
      previous: 0,
      sparkline: [],
    },
    newRecruits: {
      label: "Novos recrutas",
      value: 0,
      previous: 0,
      sparkline: [],
    },
    gapsOpened: {
      label: "Gaps detectados",
      value: 0,
      previous: 0,
      sparkline: [],
      reverseTrend: true,
    },
  };

  const firstName =
    session?.user?.name?.split(" ")[0] ??
    session?.user?.email?.split("@")[0] ??
    "Comandante";
  const { salute, callToBriefing } = getGreeting(firstName);

  const now = new Date();
  const weekStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  const weekRange = `${formatShortDate(weekStart)} a ${formatShortDate(now)}`;

  if (snapshot.isEmpty) {
    return (
      <EmptyState
        title="Nenhuma operação no campo ainda."
        description="Comece alistando recrutas. Depois mobilize operações vinculadas aos produtos do squad. Os KPIs ganham vida assim que tiver dados reais."
        mood="sleepy"
        mascotSize={140}
        cta={{
          href: "/recrutas/novo",
          label: "Recrutar primeiro",
          icon: <IconUserPlus size={14} aria-hidden />,
        }}
        secondaryCta={{
          href: "/operacoes/nova",
          label: "Mobilizar operação",
          icon: <IconTargetArrow size={14} aria-hidden />,
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <DashboardHero
        salute={salute}
        callToAction={callToBriefing}
        updatedAt={now}
        saudeMedia={snapshot.saudeMedia}
        health={{
          emCampo: snapshot.healthCounts.em_campo,
          atencao: snapshot.healthCounts.atencao,
          baixaIminente: snapshot.healthCounts.baixa_iminente,
          extracao: snapshot.healthCounts.extracao,
          total: snapshot.healthCounts.total,
        }}
      />

      <section
        aria-label="Indicadores da semana"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <KPICard
          label={kpis.tasksCompleted.label}
          value={kpis.tasksCompleted.value}
          icon={IconChecks}
          previous={kpis.tasksCompleted.previous}
          sparkline={kpis.tasksCompleted.sparkline}
          sparklineTone="patrol"
          hint="Últimos 7 dias"
        />
        <KPICard
          label={kpis.briefings.label}
          value={kpis.briefings.value}
          icon={IconCalendar}
          previous={kpis.briefings.previous}
          sparkline={kpis.briefings.sparkline}
          sparklineTone="bronze"
          hint="Últimos 7 dias"
        />
        <KPICard
          label={kpis.newRecruits.label}
          value={kpis.newRecruits.value}
          icon={IconUserPlus}
          previous={kpis.newRecruits.previous}
          sparkline={kpis.newRecruits.sparkline}
          sparklineTone="bronze"
          hint="Últimos 7 dias"
        />
        <KPICard
          label={kpis.gapsOpened.label}
          value={kpis.gapsOpened.value}
          icon={IconAlertTriangle}
          negative={kpis.gapsOpened.value > 0}
          previous={kpis.gapsOpened.previous}
          reverseTrend
          sparkline={kpis.gapsOpened.sparkline}
          sparklineTone="casualty"
          hint="Últimos 7 dias"
        />
      </section>

      <Link
        href="/comando"
        className="hidden"
        aria-hidden
      />

      <ComandoContent
        kpis={snapshot.kpis}
        saudeMedia={snapshot.saudeMedia}
        topOperacoes={snapshot.topOperacoes}
        baixas={snapshot.baixas}
        atencao={snapshot.atencao}
        briefingsHoje={snapshot.briefingsHoje}
        produtos={snapshot.produtos}
        weekRange={weekRange}
      />
    </div>
  );
}
