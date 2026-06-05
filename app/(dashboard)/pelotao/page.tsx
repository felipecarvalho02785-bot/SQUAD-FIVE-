import Link from "next/link";
import { OperationStatus } from "@prisma/client";
import {
  IconLayoutKanban,
  IconArrowUpRight,
  IconTarget,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/squad/page-header";
import { buttonVariants } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { DraggableKanban } from "@/components/pelotao/draggable-kanban";
import { EmptyState } from "@/components/squad/empty-state";
import { listOperations } from "@/lib/queries/operation";
import type { IndicatorStatus } from "@/components/ui/status-indicator";
import { cn } from "@/lib/utils";

export const metadata = { title: "Painel de Pelotão — Squad Five" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function asString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

const HEALTH_COLUMNS: Array<{
  health: IndicatorStatus;
  label: string;
  headerClass: string;
  countClass: string;
}> = [
  {
    health: "baixa_iminente",
    label: "Baixa iminente",
    headerClass: "border-status-critical",
    countClass: "text-status-critical-text",
  },
  {
    health: "atencao",
    label: "Atenção",
    headerClass: "border-status-warn",
    countClass: "text-status-warn-text",
  },
  {
    health: "em_campo",
    label: "Em campo",
    headerClass: "border-status-ok",
    countClass: "text-status-ok-text",
  },
  {
    health: "extracao",
    label: "Extração",
    headerClass: "border-border-default",
    countClass: "text-text-secondary",
  },
];

export default async function PelotaoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const view = asString(sp.view) === "saude" ? "saude" : "status";

  const operations = await listOperations({ status: "all", health: "all" });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Painel de Pelotão"
        subtitle={
          view === "status"
            ? "Drag & drop para mover operações entre estados."
            : "Distribuição por estado de saúde (read-only)."
        }
        actions={
          <div className="flex items-center gap-2">
            <nav
              className="flex items-center gap-1 bg-surface-deep border border-border-default rounded-full p-1"
              aria-label="Modo de visualização"
            >
              <Link
                href="?view=status"
                aria-current={view === "status" ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors",
                  "font-display uppercase tracking-[0.06em] text-[11px] font-medium",
                  view === "status"
                    ? "bg-surface-accent text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                Status (drag)
              </Link>
              <Link
                href="?view=saude"
                aria-current={view === "saude" ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors",
                  "font-display uppercase tracking-[0.06em] text-[11px] font-medium",
                  view === "saude"
                    ? "bg-surface-accent text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                Saúde
              </Link>
            </nav>
            <Link
              href="/operacoes/nova"
              className={buttonVariants({ variant: "primary", size: "md" })}
            >
              <IconLayoutKanban size={14} aria-hidden />
              Mobilizar
            </Link>
          </div>
        }
      />

      {operations.length === 0 ? (
        <EmptyState
          title="Painel vazio."
          description="Mobilize operações para o pelotão começar a aparecer."
          mood="sleepy"
          cta={{
            href: "/operacoes/nova",
            label: "Mobilizar operação",
            icon: <IconLayoutKanban size={14} aria-hidden />,
          }}
        />
      ) : view === "status" ? (
        <DraggableKanban
          operations={operations.map((op) => ({
            id: op.id,
            codeName: op.codeName,
            status: op.status as OperationStatus,
            recruit: op.recruit,
            product: op.product,
            stages: op.stages.map((s) => ({
              status: s.status,
              name: s.name,
              order: s.order,
            })),
          }))}
        />
      ) : (
        <HealthKanban operations={operations} />
      )}
    </div>
  );
}

function HealthKanban({
  operations,
}: {
  operations: Awaited<ReturnType<typeof listOperations>>;
}) {
  const grouped: Record<IndicatorStatus, typeof operations> = {
    em_campo: [],
    atencao: [],
    baixa_iminente: [],
    extracao: [],
  };
  for (const op of operations) grouped[op.health].push(op);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {HEALTH_COLUMNS.map((col) => {
        const ops = grouped[col.health];
        return (
          <section
            key={col.health}
            className={cn(
              "surface-deep border-t-2 rounded-card flex flex-col min-h-[200px]",
              col.headerClass,
            )}
            aria-label={col.label}
          >
            <header className="px-4 py-3 flex items-center justify-between border-b border-border-default/60">
              <div className="flex items-center gap-2">
                <StatusIndicator status={col.health} size="md" />
                <h2 className="label-display text-[11px] text-text-primary">
                  {col.label}
                </h2>
              </div>
              <span className={`font-mono text-[12px] ${col.countClass}`}>
                {ops.length}
              </span>
            </header>

            <div className="p-2 flex flex-col gap-2 flex-1">
              {ops.length === 0 ? (
                <p className="text-center text-text-dim text-[11px] py-6">
                  Setor calmo.
                </p>
              ) : (
                ops.map((op) => {
                  const total = op.stages.length || 1;
                  const done = op.stages.filter(
                    (s) => s.status === "CUMPRIDA",
                  ).length;
                  const progress = Math.round((done / total) * 100);
                  const current = op.stages.find(
                    (s) => s.status === "EM_ANDAMENTO",
                  );
                  return (
                    <Link
                      key={op.id}
                      href={`/operacoes/${op.id}`}
                      className="surface-raised p-3 flex flex-col gap-2 lift-hover group"
                    >
                      <header className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <IconTarget
                            size={12}
                            stroke={1.5}
                            className="text-bronze shrink-0"
                            aria-hidden
                          />
                          <span className="text-text-primary text-[12px] font-medium truncate group-hover:text-accent-hover transition-colors">
                            {op.codeName}
                          </span>
                        </div>
                        <IconArrowUpRight
                          size={11}
                          stroke={1.5}
                          className="text-text-dim group-hover:text-accent-hover shrink-0"
                          aria-hidden
                        />
                      </header>
                      <p className="text-text-dim text-[10px] truncate">
                        {op.recruit.name}
                      </p>
                      {current ? (
                        <p className="text-text-secondary text-[10px] truncate">
                          {current.order}. {current.name}
                        </p>
                      ) : (
                        <p className="text-text-dim text-[10px] italic flex items-center gap-1">
                          {op.status === OperationStatus.ENCERRADA ? (
                            "Encerrada"
                          ) : (
                            <>
                              <IconAlertTriangle size={9} aria-hidden /> Sem etapa
                            </>
                          )}
                        </p>
                      )}
                      <div className="h-1 rounded-full bg-surface-base/60 overflow-hidden ring-1 ring-border-default/30">
                        <div
                          className="h-full bar-gradient-warm"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
