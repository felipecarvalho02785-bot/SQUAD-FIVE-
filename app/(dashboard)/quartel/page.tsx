import { redirect } from "next/navigation";
import Link from "next/link";
import {
  IconBuildingFortress,
  IconUsersGroup,
  IconBox,
  IconUpload,
  IconChartArrows,
  IconDatabase,
} from "@tabler/icons-react";
import { FunnelChart } from "@/components/charts/funnel-chart";
import { getProductFunnels } from "@/lib/queries/funnel";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/squad/page-header";
import { FeedbackBanner } from "@/components/squad/feedback-banner";
import { StatusPill } from "@/components/ui/status-pill";
import { buttonVariants } from "@/components/ui/button";
import { StageTemplateRow } from "@/components/quartel/stage-template-row";
import { StageTemplateCreate } from "@/components/quartel/stage-template-create";
import { MemberRow } from "@/components/quartel/member-row";
import { listProductsForAdmin, listMembers } from "@/lib/queries/quartel";

export const metadata = { title: "Quartel General — Squad Five" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const JUST_MESSAGES: Record<string, string> = {
  "template-updated": "Etapa atualizada.",
  "template-created": "Nova etapa adicionada.",
  "template-deleted": "Etapa removida.",
  "member-updated": "Permissões atualizadas.",
};

export default async function QuartelPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/comando");

  const sp = await searchParams;
  const justKey = Array.isArray(sp.just) ? sp.just[0] : sp.just;
  const justMessage = justKey ? JUST_MESSAGES[justKey] : undefined;

  const [products, members, funnels] = await Promise.all([
    listProductsForAdmin(),
    listMembers(),
    getProductFunnels(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Quartel General"
        subtitle="Configurações da operação. Acesso restrito ao comando."
        actions={
          <div className="flex items-center gap-2">
            <a
              href="/api/admin/backup"
              className={buttonVariants({ variant: "secondary", size: "md" })}
              title="Backup JSON completo"
            >
              <IconDatabase size={14} aria-hidden />
              Backup
            </a>
            <Link
              href="/quartel/importar"
              className={buttonVariants({ variant: "secondary", size: "md" })}
            >
              <IconUpload size={14} aria-hidden />
              Importar recrutas
            </Link>
          </div>
        }
      />

      {justMessage ? <FeedbackBanner message={justMessage} /> : null}

      <section className="surface-raised p-5 flex flex-col gap-4">
        <header className="flex items-center gap-2">
          <IconChartArrows
            size={14}
            className="text-bronze"
            stroke={1.5}
            aria-hidden
          />
          <h2 className="label-display text-[11px] text-text-primary">
            Funil de operações ativas por produto
          </h2>
        </header>
        <p className="text-text-secondary text-[12px] -mt-1">
          Distribuição em tempo real das operações ATIVAs em cada etapa.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {funnels.map((funnel) => (
            <article
              key={funnel.id}
              className="surface-deep p-4 flex flex-col gap-3"
            >
              <header className="flex items-center justify-between gap-2">
                <h3 className="font-display text-[14px] font-medium text-text-primary">
                  {funnel.name}
                </h3>
                <span className="font-mono text-bronze text-[14px] tabular-nums">
                  {funnel.total}
                </span>
              </header>
              <FunnelChart
                stages={funnel.stages.map((s, i) => ({
                  name: s.name,
                  count: s.count,
                  tone:
                    s.count === 0
                      ? "warn"
                      : i === funnel.stages.length - 1
                        ? "patrol"
                        : "bronze",
                }))}
              />
            </article>
          ))}
        </div>
      </section>

      <section className="surface-raised p-5 flex flex-col gap-4">
        <header className="flex items-center gap-2">
          <IconBox
            size={14}
            className="text-bronze"
            stroke={1.5}
            aria-hidden
          />
          <h2 className="label-display text-[11px] text-text-primary">
            Produtos &amp; templates de etapa
          </h2>
        </header>
        <p className="text-text-secondary text-[12px] -mt-1">
          Alterações em template não afetam operações já mobilizadas — as
          etapas vivem como snapshot dentro da operação.
        </p>

        <div className="flex flex-col gap-5">
          {products.map((product) => (
            <article
              key={product.id}
              className="surface-deep p-4 flex flex-col gap-3"
            >
              <header className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-[14px] font-medium text-text-primary">
                    {product.name}
                  </h3>
                  <StatusPill
                    status={
                      product.archetype === "PROJECT"
                        ? "em_campo"
                        : "em_andamento"
                    }
                    label={
                      product.archetype === "PROJECT" ? "Projeto" : "Retainer"
                    }
                  />
                  {product.typicalDurationDays ? (
                    <span className="font-mono text-text-dim text-[11px]">
                      ~{product.typicalDurationDays} dias
                    </span>
                  ) : null}
                </div>
                <span className="font-mono text-text-secondary text-[11px] tabular-nums">
                  {product._count.operations} operações ativas
                </span>
              </header>

              <ul className="flex flex-col gap-2">
                {product.stageTemplates.map((t) => (
                  <StageTemplateRow
                    key={t.id}
                    template={t}
                    canDelete={product.stageTemplates.length > 1}
                  />
                ))}
              </ul>

              <StageTemplateCreate productId={product.id} />
            </article>
          ))}
        </div>
      </section>

      <section className="surface-raised p-5 flex flex-col gap-4">
        <header className="flex items-center gap-2">
          <IconUsersGroup
            size={14}
            className="text-bronze"
            stroke={1.5}
            aria-hidden
          />
          <h2 className="label-display text-[11px] text-text-primary">
            Membros do squad
          </h2>
          <span className="font-mono text-[11px] text-text-secondary">
            {members.length}
          </span>
        </header>
        <p className="text-text-secondary text-[12px] -mt-1">
          Novos membros viram OPERADOR ao logar pela primeira vez com Google.
          Promova a ADMIN aqui.
        </p>

        <ul className="flex flex-col gap-2">
          {members.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              currentUserId={session.user.id ?? ""}
            />
          ))}
        </ul>
      </section>

      <section className="surface-jungle p-5 flex items-center gap-4">
        <IconBuildingFortress
          size={24}
          className="text-bronze shrink-0"
          stroke={1.5}
          aria-hidden
        />
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-[14px] font-medium text-text-primary">
            Pendências de configuração
          </h3>
          <p className="text-text-secondary text-[12px]">
            Notificações por email, calibrações de gaps automáticos e
            integração com calendário entram na próxima fase. Por enquanto, o
            quartel cobre o essencial: produtos e permissões.
          </p>
        </div>
      </section>
    </div>
  );
}
