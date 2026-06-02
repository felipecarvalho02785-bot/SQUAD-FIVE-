import Link from "next/link";
import { OperationStatus, StageStatus } from "@prisma/client";
import {
  IconArrowUpRight,
  IconTarget,
  IconUser,
} from "@tabler/icons-react";
import {
  StatusIndicator,
  type IndicatorStatus,
} from "@/components/ui/status-indicator";
import { cn } from "@/lib/utils";

interface OperationListCardProps {
  operation: {
    id: string;
    codeName: string;
    status: OperationStatus;
    health: IndicatorStatus;
    startedAt: Date;
    recruit: { id: string; name: string };
    product: { name: string };
    owner: { name: string | null; email: string } | null;
    stages: Array<{ status: StageStatus; name: string; order: number }>;
  };
}

const HEALTH_BORDER: Record<IndicatorStatus, string> = {
  em_campo: "before:bg-status-ok",
  atencao: "before:bg-status-warn",
  baixa_iminente: "before:bg-status-critical",
  extracao: "before:bg-status-idle",
};

function getInitials(name: string | null, fallback: string): string {
  const source = name && name.trim() ? name : fallback;
  return source
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function OperationListCard({ operation }: OperationListCardProps) {
  const totalStages = operation.stages.length;
  const doneStages = operation.stages.filter(
    (s) => s.status === StageStatus.CUMPRIDA,
  ).length;
  const currentStage = operation.stages.find(
    (s) => s.status === StageStatus.EM_ANDAMENTO,
  );
  const progress =
    totalStages > 0 ? Math.round((doneStages / totalStages) * 100) : 0;

  return (
    <Link
      href={`/operacoes/${operation.id}`}
      className={cn(
        "relative surface-raised lift-hover p-4 flex flex-col gap-3 group",
        "before:absolute before:left-0 before:top-3 before:bottom-3 before:w-[3px] before:rounded-r-full",
        HEALTH_BORDER[operation.health],
      )}
    >
      <header className="flex items-start gap-3">
        <span
          className="shrink-0 w-10 h-10 rounded-md bg-gradient-to-br from-jungle-glow to-jungle-deep flex items-center justify-center text-bronze ring-1 ring-border-default/60"
          aria-hidden
        >
          <IconTarget size={18} stroke={1.5} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-text-primary text-[14px] font-medium truncate group-hover:text-accent-hover transition-colors">
              {operation.codeName}
            </h3>
            <IconArrowUpRight
              size={14}
              stroke={1.5}
              className="text-text-dim group-hover:text-accent-hover shrink-0 mt-0.5"
              aria-hidden
            />
          </div>
          <p className="text-text-dim text-[11px] mt-0.5 truncate">
            {operation.recruit.name} · {operation.product.name}
          </p>
        </div>
      </header>

      <div className="flex items-center gap-3">
        <StatusIndicator status={operation.health} size="md" />
        <div className="flex-1 min-w-0">
          {currentStage ? (
            <p className="text-text-secondary text-[11px] truncate">
              {currentStage.order}. {currentStage.name}
            </p>
          ) : (
            <p className="text-text-dim text-[11px] italic">
              {operation.status === OperationStatus.ENCERRADA
                ? "Encerrada"
                : "Sem etapa ativa"}
            </p>
          )}
          <div className="h-1.5 mt-1 rounded-full bg-surface-base/60 ring-1 ring-border-default/40 overflow-hidden">
            <div
              className="h-full bar-gradient-warm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="font-mono text-text-primary text-[11px] tabular-nums shrink-0 min-w-[32px] text-right">
          {progress}%
        </span>
      </div>

      <footer className="flex items-center justify-between text-[10px] text-text-dim">
        <span className="flex items-center gap-1">
          <IconUser size={11} stroke={1.5} aria-hidden />
          {operation.owner ? (
            <span>{operation.owner.name ?? operation.owner.email}</span>
          ) : (
            <span className="italic">sem responsável</span>
          )}
        </span>
        <span className="font-mono tabular-nums">
          {doneStages}/{totalStages} etapas
        </span>
      </footer>
    </Link>
  );
}

export function getOperationInitials(name: string): string {
  return getInitials(name, name);
}
