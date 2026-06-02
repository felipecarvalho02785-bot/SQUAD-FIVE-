import {
  IconGripVertical,
  IconAlertHexagonFilled,
} from "@tabler/icons-react";
import {
  StatusIndicator,
  type IndicatorStatus,
} from "@/components/ui/status-indicator";
import { cn } from "@/lib/utils";

/*
  RecruitCard — card de recruta usado no Painel de Pelotao (kanban) e
  na lista do Comando Central.
*/

interface RecruitCardProps {
  name: string;
  initials: string;
  subtitle?: string;
  health: IndicatorStatus;
  priority?: number;
  progress: number;
  progressLabel?: string;
  progressPercentDisplay?: string;
  tags?: string[];
  draggable?: boolean;
  avatarGradient?: "copper" | "patrol" | "casualty" | "bronze";
  className?: string;
}

const AVATAR_GRADIENTS: Record<
  NonNullable<RecruitCardProps["avatarGradient"]>,
  string
> = {
  copper: "from-copper to-copper-deep",
  patrol: "from-patrol to-jungle-deep",
  casualty: "from-casualty to-casualty-deep",
  bronze: "from-bronze to-copper",
};

export function RecruitCard({
  name,
  initials,
  subtitle,
  health,
  priority,
  progress,
  progressLabel,
  progressPercentDisplay,
  tags,
  draggable = false,
  avatarGradient = "copper",
  className,
}: RecruitCardProps) {
  const safeProgress = Math.max(0, Math.min(100, progress));
  const isCritical = health === "baixa_iminente";
  const isExtraction = health === "extracao";

  return (
    <article
      className={cn(
        "relative surface-raised lift-hover p-3.5 flex flex-col gap-2.5",
        "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r-full",
        health === "em_campo" && "before:bg-status-ok",
        health === "atencao" && "before:bg-status-warn",
        isCritical && "before:bg-status-critical",
        isExtraction && "before:bg-status-idle",
        className,
      )}
    >
      <header className="flex items-start gap-3">
        {draggable ? (
          <button
            type="button"
            aria-label="Reordenar"
            className="mt-1 text-text-dim hover:text-text-secondary cursor-grab active:cursor-grabbing"
            tabIndex={-1}
          >
            <IconGripVertical size={14} stroke={1.5} aria-hidden />
          </button>
        ) : null}

        <div
          className={cn(
            "shrink-0 w-9 h-9 rounded-md bg-gradient-to-br flex items-center justify-center text-accent-cta-fg font-display font-medium text-[14px] tracking-[0.05em] ring-1 ring-border-default/60",
            AVATAR_GRADIENTS[avatarGradient],
          )}
          aria-hidden
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-text-primary text-[13px] font-medium truncate">
              {name}
            </h3>
            {priority !== undefined ? (
              <span
                className={cn(
                  "shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-medium",
                  isCritical
                    ? "bg-status-critical text-text-primary"
                    : health === "atencao"
                      ? "bg-status-warn text-accent-cta-fg"
                      : "bg-surface-accent text-text-primary",
                )}
                aria-label={`Prioridade ${priority}`}
              >
                {priority}
              </span>
            ) : (
              <StatusIndicator status={health} size="mini" />
            )}
          </div>
          {subtitle ? (
            <p className="text-text-dim text-[11px] mt-0.5 truncate">
              {subtitle}
            </p>
          ) : null}
        </div>
      </header>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-surface-base/60 ring-1 ring-border-default/60 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              isCritical ? "bg-status-critical" : "bar-gradient-warm",
            )}
            style={{ width: `${safeProgress}%` }}
          />
        </div>
        {progressPercentDisplay ? (
          <span className="font-mono font-medium text-text-primary text-[12px] tabular-nums shrink-0 min-w-[36px] text-right">
            {progressPercentDisplay}
          </span>
        ) : null}
      </div>

      <footer className="flex items-center justify-between gap-2">
        {progressLabel ? (
          <span className="text-text-dim text-[11px]">{progressLabel}</span>
        ) : (
          <span />
        )}

        {tags && tags.length > 0 ? (
          <ul className="flex items-center gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
                  "bg-status-critical/15 text-status-critical-text border border-status-critical/30",
                )}
              >
                <IconAlertHexagonFilled size={9} aria-hidden />
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </footer>
    </article>
  );
}
