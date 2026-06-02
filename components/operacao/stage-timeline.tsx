import { StageStatus } from "@prisma/client";
import { IconCheck, IconClock, IconLock } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/*
  StageTimeline — visualizacao das etapas da operacao em formato linear.
  Mostra status atual, etapas cumpridas (com check) e pendentes (lock).
*/

interface Stage {
  id: string;
  name: string;
  order: number;
  slaDays: number;
  status: StageStatus;
  startedAt: Date | null;
  completedAt: Date | null;
}

interface StageTimelineProps {
  stages: Stage[];
  className?: string;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysSince(date: Date | null): number {
  if (!date) return 0;
  return Math.floor((Date.now() - date.getTime()) / MS_PER_DAY);
}

function formatRelative(start: Date | null, end: Date | null): string {
  if (start && end) {
    const days = Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY);
    return `${days} ${days === 1 ? "dia" : "dias"}`;
  }
  if (start) {
    const d = daysSince(start);
    return `D+${d}`;
  }
  return "—";
}

export function StageTimeline({ stages, className }: StageTimelineProps) {
  if (stages.length === 0) {
    return (
      <p className="text-text-secondary text-[13px]">
        Operação sem etapas (retainer contínuo).
      </p>
    );
  }

  return (
    <ol className={cn("flex flex-col gap-1", className)}>
      {stages.map((stage, idx) => {
        const isLast = idx === stages.length - 1;
        const isCurrent = stage.status === StageStatus.EM_ANDAMENTO;
        const isDone = stage.status === StageStatus.CUMPRIDA;
        const isPending = stage.status === StageStatus.PENDENTE;

        const daysInStage = isCurrent ? daysSince(stage.startedAt) : 0;
        const slaProgress = isCurrent
          ? Math.min(100, Math.round((daysInStage / stage.slaDays) * 100))
          : isDone
            ? 100
            : 0;
        const slaExceeded = isCurrent && daysInStage > stage.slaDays;
        const slaNearLimit =
          isCurrent && stage.slaDays - daysInStage <= 2 && !slaExceeded;

        return (
          <li key={stage.id} className="relative flex gap-3">
            {!isLast ? (
              <span
                className={cn(
                  "absolute left-[17px] top-9 bottom-[-4px] w-px",
                  isDone ? "bg-status-ok" : "bg-border-default",
                )}
                aria-hidden
              />
            ) : null}

            <div
              className={cn(
                "shrink-0 w-9 h-9 rounded-full border flex items-center justify-center z-content",
                isDone &&
                  "bg-status-ok border-status-ok text-accent-cta-fg",
                isCurrent &&
                  "bg-surface-accent border-border-strong text-bronze ring-2 ring-bronze/30",
                isPending &&
                  "bg-surface-deep border-border-default text-text-dim",
              )}
            >
              {isDone ? (
                <IconCheck size={16} stroke={2.5} aria-hidden />
              ) : isCurrent ? (
                <IconClock size={16} stroke={2} aria-hidden />
              ) : (
                <IconLock size={14} stroke={1.5} aria-hidden />
              )}
            </div>

            <div className="flex-1 pb-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3
                  className={cn(
                    "text-[13px] font-medium",
                    isCurrent ? "text-text-primary" : "text-text-secondary",
                    isPending && "text-text-dim",
                  )}
                >
                  {stage.order}. {stage.name}
                </h3>
                <span
                  className={cn(
                    "label-display text-[9px]",
                    isDone && "text-status-ok-text",
                    isCurrent && slaExceeded && "text-status-critical-text",
                    isCurrent && slaNearLimit && "text-status-warn-text",
                    isCurrent && !slaExceeded && !slaNearLimit && "text-bronze",
                    isPending && "text-text-dim",
                  )}
                >
                  {isDone && "Cumprida"}
                  {isCurrent && slaExceeded && `SLA estourado · D+${daysInStage}`}
                  {isCurrent && !slaExceeded && `D+${daysInStage} de ${stage.slaDays}d`}
                  {isPending && `${stage.slaDays} dias previstos`}
                </span>
              </div>

              {isDone || isCurrent ? (
                <div className="h-1 rounded-full bg-surface-base overflow-hidden ring-1 ring-border-default/40">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isDone && "bg-status-ok",
                      isCurrent && slaExceeded && "bg-status-critical",
                      isCurrent && slaNearLimit && "bg-status-warn",
                      isCurrent && !slaExceeded && !slaNearLimit && "bar-gradient-warm",
                    )}
                    style={{ width: `${slaProgress}%` }}
                  />
                </div>
              ) : null}

              {(stage.startedAt || stage.completedAt) && !isPending ? (
                <p className="text-[10px] font-mono text-text-dim">
                  {formatRelative(stage.startedAt, stage.completedAt)}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
