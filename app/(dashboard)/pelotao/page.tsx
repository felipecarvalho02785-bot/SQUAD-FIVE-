import Link from "next/link";
import { OperationStatus } from "@prisma/client";
import {
  IconLayoutKanban,
  IconArrowUpRight,
  IconTarget,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/squad/page-header";
import { buttonVariants } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { listOperations } from "@/lib/queries/operation";
import type { IndicatorStatus } from "@/components/ui/status-indicator";
import { cn } from "@/lib/utils";

export const metadata = { title: "Painel de Pelotão — Squad Five" };
export const dynamic = "force-dynamic";

const COLUMNS: Array<{
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

export default async function PelotaoPage() {
  const operations = await listOperations({ status: "all", health: "all" });

  const grouped: Record<IndicatorStatus, typeof operations> = {
    em_campo: [],
    atencao: [],
    baixa_iminente: [],
    extracao: [],
  };
  for (const op of operations) {
    grouped[op.health].push(op);
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Painel de Pelotão"
        subtitle="Distribuição de operações por estado de saúde."
        actions={
          <Link
            href="/operacoes/nova"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            <IconLayoutKanban size={14} aria-hidden />
            Mobilizar
          </Link>
        }
      />

      {operations.length === 0 ? (
        <section className="surface-raised p-10 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-surface-accent border border-border-strong flex items-center justify-center">
            <IconLayoutKanban
              size={26}
              stroke={1.5}
              className="text-bronze"
              aria-hidden
            />
          </div>
          <p className="text-text-secondary text-[13px] max-w-sm">
            Painel vazio. Mobilize operações para o pelotão começar a aparecer.
          </p>
        </section>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {COLUMNS.map((col) => {
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
                            <p className="text-text-dim text-[10px] italic">
                              {op.status === OperationStatus.ENCERRADA
                                ? "Encerrada"
                                : "Sem etapa ativa"}
                            </p>
                          )}
                          <div className="h-1 rounded-full bg-surface-base/60 overflow-hidden ring-1 ring-border-default/40">
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
      )}
    </div>
  );
}
