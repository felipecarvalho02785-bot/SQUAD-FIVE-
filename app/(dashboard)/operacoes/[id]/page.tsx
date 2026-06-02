import Link from "next/link";
import { notFound } from "next/navigation";
import { OperationStatus, StageStatus } from "@prisma/client";
import {
  IconArrowLeft,
  IconCalendar,
  IconTarget,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/squad/page-header";
import { FeedbackBanner } from "@/components/squad/feedback-banner";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { StatusPill } from "@/components/ui/status-pill";
import { StageTimeline } from "@/components/operacao/stage-timeline";
import { StageActions } from "@/components/operacao/stage-actions";
import { getOperationById } from "@/lib/queries/operation";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const JUST_MESSAGES: Record<string, string> = {
  mobilized: "Operação mobilizada.",
  advanced: "Etapa avançada.",
  paused: "Operação pausada.",
  resumed: "Operação retomada.",
  extracted: "Operação encerrada. Histórico preservado.",
};

const HEALTH_PILL_MAP = {
  em_campo: "em_campo",
  atencao: "atencao",
  baixa_iminente: "baixa_iminente",
  extracao: "extracao",
} as const;

const HEALTH_LABEL = {
  em_campo: "Em campo",
  atencao: "Atenção",
  baixa_iminente: "Baixa iminente",
  extracao: "Extração",
} as const;

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const op = await getOperationById(id);
  return {
    title: op ? `${op.codeName} — Squad Five` : "Operação — Squad Five",
  };
}

export default async function OperacaoDetalhePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const operation = await getOperationById(id);

  if (!operation) notFound();

  const justKey = Array.isArray(sp.just) ? sp.just[0] : sp.just;
  const justMessage = justKey ? JUST_MESSAGES[justKey] : undefined;

  const currentStage = operation.stages.find(
    (s) => s.status === StageStatus.EM_ANDAMENTO,
  );
  const totalStages = operation.stages.length;
  const doneStages = operation.stages.filter(
    (s) => s.status === StageStatus.CUMPRIDA,
  ).length;
  const isLastStage = currentStage
    ? currentStage.order === Math.max(...operation.stages.map((s) => s.order))
    : false;

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/operacoes"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-[12px] transition-colors w-fit"
      >
        <IconArrowLeft size={14} aria-hidden />
        Voltar para Operações
      </Link>

      {justMessage ? <FeedbackBanner message={justMessage} /> : null}

      <PageHeader
        title={operation.codeName}
        subtitle={
          <>
            <Link
              href={`/recrutas/${operation.recruit.id}`}
              className="hover:text-text-primary underline-offset-2 hover:underline"
            >
              {operation.recruit.name}
            </Link>
            {" · "}
            {operation.product.name}
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <StatusIndicator status={operation.health} size="md" />
            <StatusPill
              status={HEALTH_PILL_MAP[operation.health]}
              label={HEALTH_LABEL[operation.health]}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <section className="surface-raised p-5 flex flex-col gap-4">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconTarget
                  size={14}
                  className="text-bronze"
                  stroke={1.5}
                  aria-hidden
                />
                <h2 className="label-display text-[11px] text-text-secondary">
                  Jornada
                </h2>
                <span className="font-mono text-[11px] text-text-dim">
                  {doneStages}/{totalStages} cumpridas
                </span>
              </div>
            </header>
            <StageTimeline stages={operation.stages} />
          </section>

          <section className="surface-raised p-5 flex flex-col gap-3">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconCalendar
                  size={14}
                  className="text-bronze"
                  stroke={1.5}
                  aria-hidden
                />
                <h2 className="label-display text-[11px] text-text-secondary">
                  Briefings recentes
                </h2>
                <span className="font-mono text-[11px] text-text-dim">
                  {operation.briefings.length}
                </span>
              </div>
            </header>
            {operation.briefings.length === 0 ? (
              <p className="py-6 text-center text-text-secondary text-[13px]">
                Nenhum briefing registrado nesta operação. O primeiro contato
                vale ouro.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {operation.briefings.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between p-3 rounded-card bg-surface-deep border border-border-default/60"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-text-primary text-[12px]">
                        {formatDate(b.date)}
                      </span>
                      {b.createdBy ? (
                        <span className="text-text-dim text-[11px]">
                          por {b.createdBy.name}
                        </span>
                      ) : null}
                    </div>
                    {b.npsScore !== null ? (
                      <span className="font-mono text-bronze text-[13px] tabular-nums">
                        NPS {b.npsScore}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {operation.gaps.length > 0 ? (
            <section className="surface-raised p-5 flex flex-col gap-3 border-l-4 border-status-warn/60">
              <header className="flex items-center gap-2">
                <h2 className="label-display text-[11px] text-status-warn-text">
                  Gaps em aberto
                </h2>
                <span className="font-mono text-[11px] text-status-warn-text">
                  {operation.gaps.length}
                </span>
              </header>
              <ul className="flex flex-col gap-2">
                {operation.gaps.map((gap) => (
                  <li
                    key={gap.id}
                    className="p-3 rounded-card bg-surface-deep border border-border-default/60 text-[12px] text-text-primary"
                  >
                    {gap.description}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="flex flex-col gap-3">
          <section className="surface-jungle p-5 flex flex-col gap-3">
            <h2 className="label-display text-[11px] text-text-primary">
              Comando
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-[12px] flex items-center gap-1.5">
                <IconUser size={11} stroke={1.5} aria-hidden />
                Responsável
              </span>
              <span className="text-text-primary text-[12px]">
                {operation.owner
                  ? (operation.owner.name ?? operation.owner.email)
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-[12px] flex items-center gap-1.5">
                <IconUsersGroup size={11} stroke={1.5} aria-hidden />
                Produto
              </span>
              <span className="text-text-primary text-[12px]">
                {operation.product.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-[12px]">Início</span>
              <span className="font-mono text-text-primary text-[11px]">
                {formatDate(operation.startedAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-[12px]">Meta fim</span>
              <span className="font-mono text-text-primary text-[11px]">
                {formatDate(operation.targetEndAt)}
              </span>
            </div>
            {operation.endedAt ? (
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-[12px]">
                  Encerrada
                </span>
                <span className="font-mono text-text-primary text-[11px]">
                  {formatDate(operation.endedAt)}
                </span>
              </div>
            ) : null}
          </section>

          <section className="surface-raised p-5 flex flex-col gap-3">
            <h2 className="label-display text-[11px] text-text-secondary">
              Ações
            </h2>
            <StageActions
              operationId={operation.id}
              operationStatus={operation.status as OperationStatus}
              currentStage={
                currentStage
                  ? {
                      id: currentStage.id,
                      name: currentStage.name,
                      order: currentStage.order,
                    }
                  : null
              }
              isLastStage={isLastStage}
            />
          </section>
        </aside>
      </div>
    </div>
  );
}
