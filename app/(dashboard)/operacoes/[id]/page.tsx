import Link from "next/link";
import { notFound } from "next/navigation";
import { OperationStatus, StageStatus } from "@prisma/client";
import {
  IconArrowLeft,
  IconCalendar,
  IconChecklist,
  IconHistory,
  IconAlertTriangle,
  IconPrinter,
  IconTarget,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/squad/page-header";
import { FeedbackBanner } from "@/components/squad/feedback-banner";
import { ConfettiBurst } from "@/components/squad/confetti-burst";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { StatusPill } from "@/components/ui/status-pill";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, getActiveTab } from "@/components/ui/tabs";
import { StageTimeline } from "@/components/operacao/stage-timeline";
import { StageActions } from "@/components/operacao/stage-actions";
import { ActivityLog } from "@/components/operacao/activity-log";
import { GapSection } from "@/components/operacao/gap-section";
import { OrderListItem } from "@/components/ordem/order-list-item";
import { OrderForm } from "@/components/ordem/order-form";
import { getOperationById } from "@/lib/queries/operation";
import { listSquadMembers } from "@/lib/queries/user";
import { listOperationActivity } from "@/lib/domain/activity-logger";
import { createOrderAction } from "@/lib/actions/order";
import { buildActivityLog } from "@/lib/domain/activity-log";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const JUST_MESSAGES: Record<string, string> = {
  mobilized: "Operação mobilizada.",
  advanced: "Etapa avançada.",
  paused: "Operação pausada.",
  resumed: "Operação retomada.",
  extracted: "Operação encerrada. Histórico preservado.",
  "order-created": "Ordem cadastrada na operação.",
  "order-deleted": "Ordem removida.",
  "briefing-registered": "Briefing registrado.",
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

function formatDateTime(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
  const [operation, squadMembers, persistentActivity] = await Promise.all([
    getOperationById(id),
    listSquadMembers(),
    listOperationActivity(id, 50),
  ]);

  if (!operation) notFound();

  const justKey = Array.isArray(sp.just) ? sp.just[0] : sp.just;
  const justMessage = justKey ? JUST_MESSAGES[justKey] : undefined;
  const completed = sp.completed === "true";

  const redirectTo = `/operacoes/${operation.id}`;
  const stageOptions = operation.stages.map((s) => ({
    id: s.id,
    label: `${s.order}. ${s.name}`,
  }));
  const newOrderAction = createOrderAction.bind(null, redirectTo);

  const ordersByStage = operation.stages.map((stage) => ({
    stage,
    orders: stage.orders,
  }));
  const totalOrders = ordersByStage.reduce(
    (acc, s) => acc + s.orders.length,
    0,
  );

  const derivedActivity = buildActivityLog({
    id: operation.id,
    codeName: operation.codeName,
    startedAt: operation.startedAt,
    endedAt: operation.endedAt,
    status: operation.status,
    stages: operation.stages,
    briefings: operation.briefings.map((b) => ({
      id: b.id,
      date: b.date,
      npsScore: b.npsScore,
      createdBy: b.createdBy ? { name: b.createdBy.name } : null,
    })),
    gaps: operation.gaps.map((g) => ({
      id: g.id,
      description: g.description,
      createdAt: g.createdAt,
      resolvedAt: g.resolvedAt,
      type: g.type,
    })),
  });

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

  const openGaps = operation.gaps.filter((g) => g.status !== "RESOLVIDO");

  const activeTab = getActiveTab(sp, "tab", "visao");

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
      {completed ? <ConfettiBurst intensity="full" /> : null}

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
          <div className="flex items-center gap-2 flex-wrap">
            <StatusIndicator status={operation.health} size="md" />
            <StatusPill
              status={HEALTH_PILL_MAP[operation.health]}
              label={HEALTH_LABEL[operation.health]}
            />
            <Link
              href={`/operacoes/${operation.id}/imprimir`}
              target="_blank"
              className={buttonVariants({ variant: "secondary", size: "md" })}
            >
              <IconPrinter size={14} aria-hidden />
              Status report
            </Link>
          </div>
        }
      />

      <Tabs
        defaultValue="visao"
        tabs={[
          {
            value: "visao",
            label: "Visão geral",
            icon: <IconTarget size={12} stroke={1.5} />,
          },
          {
            value: "ordens",
            label: "Ordens",
            icon: <IconChecklist size={12} stroke={1.5} />,
            count: totalOrders,
          },
          {
            value: "briefings",
            label: "Briefings",
            icon: <IconCalendar size={12} stroke={1.5} />,
            count: operation.briefings.length,
          },
          {
            value: "gaps",
            label: "Gaps",
            icon: <IconAlertTriangle size={12} stroke={1.5} />,
            count: openGaps.length,
            badgeTone: openGaps.length > 0 ? "warn" : "default",
          },
          {
            value: "atividade",
            label: "Atividade",
            icon: <IconHistory size={12} stroke={1.5} />,
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 flex flex-col gap-3">
          {activeTab === "visao" ? (
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
          ) : null}

          {activeTab === "ordens" ? (
            <section className="surface-raised p-5 flex flex-col gap-4">
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconChecklist
                    size={14}
                    className="text-bronze"
                    stroke={1.5}
                    aria-hidden
                  />
                  <h2 className="label-display text-[11px] text-text-secondary">
                    Ordens por etapa
                  </h2>
                  <span className="font-mono text-[11px] text-text-dim">
                    {totalOrders}
                  </span>
                </div>
              </header>

              {ordersByStage.every((s) => s.orders.length === 0) ? (
                <p className="py-4 text-center text-text-secondary text-[13px]">
                  Nenhuma ordem registrada. Crie a primeira no formulário ao lado.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {ordersByStage.map(({ stage, orders }) =>
                    orders.length > 0 ? (
                      <div key={stage.id} className="flex flex-col gap-2">
                        <h3 className="label-display text-[10px] text-text-label">
                          {stage.order}. {stage.name}
                        </h3>
                        <ul className="flex flex-col gap-2">
                          {orders.map((order) => (
                            <li key={order.id}>
                              <OrderListItem
                                order={{
                                  ...order,
                                  stage: {
                                    id: stage.id,
                                    name: stage.name,
                                    order: stage.order,
                                    operation: {
                                      id: operation.id,
                                      codeName: operation.codeName,
                                      recruit: operation.recruit,
                                    },
                                  },
                                  assignee: null,
                                }}
                                redirectTo={redirectTo}
                                showContext={false}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null,
                  )}
                </div>
              )}
            </section>
          ) : null}

          {activeTab === "briefings" ? (
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
                    Briefings desta operação
                  </h2>
                  <span className="font-mono text-[11px] text-text-dim">
                    {operation.briefings.length}
                  </span>
                </div>
                <Link
                  href={`/briefings/novo?operationId=${operation.id}`}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  <IconCalendar size={12} aria-hidden />
                  Registrar
                </Link>
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
                          {formatDateTime(b.date)}
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
          ) : null}

          {activeTab === "gaps" ? (
            <GapSection
              operationId={operation.id}
              gaps={operation.gaps.map((g) => ({
                id: g.id,
                description: g.description,
                source: g.source,
                status: g.status,
                type: g.type,
                createdAt: g.createdAt,
              }))}
            />
          ) : null}

          {activeTab === "atividade" ? (
            <section className="surface-raised p-5 flex flex-col gap-3">
              <header className="flex items-center gap-2">
                <IconHistory
                  size={14}
                  className="text-bronze"
                  stroke={1.5}
                  aria-hidden
                />
                <h2 className="label-display text-[11px] text-text-secondary">
                  Atividade
                </h2>
                <span className="font-mono text-[11px] text-text-dim">
                  {persistentActivity.length + derivedActivity.length}
                </span>
              </header>

              {persistentActivity.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <h3 className="label-display text-[9px] text-text-label">
                    Eventos do log
                  </h3>
                  <ul className="flex flex-col gap-1.5">
                    {persistentActivity.slice(0, 20).map((event) => (
                      <li
                        key={event.id}
                        className="flex items-baseline justify-between gap-3 text-[12px] py-1 border-b border-border-default/40 last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-text-primary truncate">
                            {event.description ?? event.type}
                          </p>
                          {event.actor ? (
                            <p className="text-text-dim text-[10px]">
                              por {event.actor.name ?? event.actor.email}
                            </p>
                          ) : null}
                        </div>
                        <span className="font-mono text-[10px] text-text-dim shrink-0">
                          {new Intl.DateTimeFormat("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(event.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex flex-col gap-2 pt-3 border-t border-border-default/40">
                <h3 className="label-display text-[9px] text-text-label">
                  Timeline derivada
                </h3>
                <ActivityLog events={derivedActivity} limit={20} />
              </div>
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

          {activeTab === "ordens" &&
          operation.status !== OperationStatus.ENCERRADA &&
          stageOptions.length > 0 ? (
            <section className="surface-raised p-5 flex flex-col gap-3">
              <h2 className="label-display text-[11px] text-text-secondary">
                Nova ordem
              </h2>
              <OrderForm
                action={newOrderAction}
                squadMembers={squadMembers}
                stages={stageOptions}
                cancelHref={redirectTo}
              />
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
