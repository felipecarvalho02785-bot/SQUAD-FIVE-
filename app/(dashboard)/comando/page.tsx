import { KPICard } from "@/components/ui/kpi-card";
import { StatusPill } from "@/components/ui/status-pill";
import { getGreeting } from "@/lib/greeting";

/*
  Comando Central — dashboard principal.
  Tela vazia (sem dados reais ainda) para validar o layout com a brand.
  Dados reais entrarao quando o schema Prisma estiver populado (Sprint 1 Sessao 2).
*/

export const metadata = {
  title: "Comando Central — Squad Five",
};

export default function ComandoCentralPage() {
  // Placeholder enquanto Auth.js nao esta plugado.
  const userName = "Comandante";
  const { salute, callToBriefing } = getGreeting(userName);

  return (
    <main className="max-w-[1280px] mx-auto w-full flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-[24px] font-medium leading-tight text-cream">
          {salute}
        </h1>
        <p className="text-cream-muted text-[13px]">{callToBriefing}</p>
      </header>

      <section
        aria-label="Indicadores"
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5"
      >
        <KPICard label="Operações ativas" value="—" hint="Sem dados ainda" />
        <KPICard label="Novos recrutas" value="—" hint="Sem dados ainda" />
        <KPICard
          label="Baixas iminentes"
          value="—"
          hint="Sem dados ainda"
          negative
        />
        <KPICard label="Briefings hoje" value="—" hint="Sem dados ainda" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <article className="bg-card-raised border border-tactical rounded-card p-4 flex flex-col gap-3">
          <header className="flex items-center justify-between">
            <h2 className="font-display uppercase tracking-[0.1em] text-[11px] text-cream-muted">
              Baixas iminentes
            </h2>
          </header>
          <div className="flex flex-col items-center justify-center py-10 text-center gap-1">
            <p className="text-cream text-[13px]">Setor calmo.</p>
            <p className="text-cream-muted text-[12px]">
              Nenhuma operação em risco no momento.
            </p>
          </div>
        </article>

        <article className="bg-card-raised border border-tactical rounded-card p-4 flex flex-col gap-3">
          <header className="flex items-center justify-between">
            <h2 className="font-display uppercase tracking-[0.1em] text-[11px] text-cream-muted">
              Briefings da semana
            </h2>
          </header>
          <div className="flex flex-col items-center justify-center py-10 text-center gap-1">
            <p className="text-cream text-[13px]">
              Nenhum briefing registrado nesta operação.
            </p>
            <p className="text-cream-muted text-[12px]">
              O primeiro contato vale ouro.
            </p>
          </div>
        </article>
      </section>

      <section
        aria-label="Galeria de status (preview do design system)"
        className="bg-card-raised border border-tactical rounded-card p-4 flex flex-col gap-3"
      >
        <h2 className="font-display uppercase tracking-[0.1em] text-[11px] text-cream-muted">
          Galeria de status
        </h2>
        <p className="text-cream-dim text-[11px]">
          Componentes de referência. Remover assim que houver dados reais.
        </p>
        <div className="flex flex-wrap gap-2">
          <StatusPill status="em_campo" />
          <StatusPill status="atencao" />
          <StatusPill status="baixa_iminente" />
          <StatusPill status="extracao" />
          <StatusPill status="em_andamento" />
          <StatusPill status="cumprida" />
          <StatusPill status="a_fazer" />
        </div>
      </section>
    </main>
  );
}
