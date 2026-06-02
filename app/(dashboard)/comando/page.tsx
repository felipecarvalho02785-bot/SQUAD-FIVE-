import Link from "next/link";
import { IconUserPlus, IconTargetArrow } from "@tabler/icons-react";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/squad/page-header";
import { HealthBar } from "@/components/squad/health-bar";
import { buttonVariants } from "@/components/ui/button";
import { getGreeting } from "@/lib/greeting";
import { getDashboardSnapshot } from "@/lib/queries/dashboard";
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
  const [session, snapshot] = await Promise.all([auth(), getDashboardSnapshot()]);

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
      <div className="flex flex-col gap-5">
        <PageHeader
          title={salute}
          subtitle="Quartel pronto para mobilização. Bora alistar o primeiro recruta."
          updatedAt={now}
          live
        />

        <section className="surface-raised p-10 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-surface-accent border border-border-strong flex items-center justify-center">
            <IconUserPlus
              size={26}
              stroke={1.5}
              className="text-bronze"
              aria-hidden
            />
          </div>
          <div className="flex flex-col gap-2 max-w-md">
            <h2 className="font-display text-[22px] font-medium leading-tight text-text-primary">
              Nenhuma operação no campo ainda.
            </h2>
            <p className="text-text-secondary text-[13px]">
              Comece alistando recrutas. Depois mobilize operações vinculadas
              aos produtos do squad. Os KPIs ganham vida assim que tiver dados
              reais.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href="/recrutas/novo"
              className={buttonVariants({ variant: "primary", size: "md" })}
            >
              <IconUserPlus size={14} aria-hidden />
              Recrutar primeiro
            </Link>
            <Link
              href="/operacoes/nova"
              className={buttonVariants({ variant: "secondary", size: "md" })}
            >
              <IconTargetArrow size={14} aria-hidden />
              Mobilizar operação
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={salute}
        subtitle={callToBriefing}
        updatedAt={now}
        live
      />

      <HealthBar
        total={snapshot.healthCounts.total}
        emCampo={snapshot.healthCounts.em_campo}
        atencao={snapshot.healthCounts.atencao}
        baixaIminente={snapshot.healthCounts.baixa_iminente}
        extracao={snapshot.healthCounts.extracao}
        label="Operações ativas"
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
