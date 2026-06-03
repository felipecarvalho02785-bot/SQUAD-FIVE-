import {
  IconActivity,
  IconArrowRight,
  IconCheck,
  IconCalendar,
  IconAlertTriangle,
  IconChecks,
  IconPlayerPause,
  IconPlayerPlay,
  IconLogout2,
  IconTargetArrow,
} from "@tabler/icons-react";
import type { ActivityEvent } from "@/lib/domain/activity-log";
import { cn } from "@/lib/utils";

interface ActivityLogProps {
  events: ActivityEvent[];
  limit?: number;
}

const ICON_BY_TYPE = {
  "operation-created": IconTargetArrow,
  "stage-started": IconArrowRight,
  "stage-completed": IconCheck,
  "briefing": IconCalendar,
  "gap-opened": IconAlertTriangle,
  "gap-resolved": IconChecks,
  "order-created": IconCheck,
  "order-completed": IconCheck,
  "operation-paused": IconPlayerPause,
  "operation-resumed": IconPlayerPlay,
  "operation-extracted": IconLogout2,
} as const;

const TONE_BY_TYPE = {
  "operation-created": "text-bronze",
  "stage-started": "text-bronze",
  "stage-completed": "text-status-ok-text",
  "briefing": "text-bronze",
  "gap-opened": "text-status-warn-text",
  "gap-resolved": "text-status-ok-text",
  "order-created": "text-text-secondary",
  "order-completed": "text-status-ok-text",
  "operation-paused": "text-text-secondary",
  "operation-resumed": "text-bronze",
  "operation-extracted": "text-status-critical-text",
} as const;

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 60)
    return diffMin < 1 ? "agora" : `há ${diffMin} min`;
  if (diffHour < 24)
    return `há ${diffHour} ${diffHour === 1 ? "hora" : "horas"}`;
  if (diffDay < 7)
    return `há ${diffDay} ${diffDay === 1 ? "dia" : "dias"}`;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function ActivityLog({ events, limit = 20 }: ActivityLogProps) {
  const visible = events.slice(0, limit);

  if (visible.length === 0) {
    return (
      <p className="py-6 text-center text-text-secondary text-[13px]">
        Sem atividade registrada ainda.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-0">
      {visible.map((event, idx) => {
        const Icon = ICON_BY_TYPE[event.type];
        const tone = TONE_BY_TYPE[event.type];
        const isLast = idx === visible.length - 1;
        return (
          <li key={idx} className="relative flex gap-3 pb-3 last:pb-0">
            {!isLast ? (
              <span
                className="absolute left-[11px] top-6 bottom-0 w-px bg-border-default"
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "shrink-0 w-[22px] h-[22px] rounded-full bg-surface-deep border border-border-default flex items-center justify-center z-content",
                tone,
              )}
              aria-hidden
            >
              <Icon size={11} stroke={1.8} />
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-text-primary text-[12px]">
                  {event.title}
                </span>
                <span className="font-mono text-text-dim text-[10px] shrink-0">
                  {formatRelativeDate(event.at)}
                </span>
              </div>
              {event.detail ? (
                <span className="text-text-dim text-[11px]">
                  {event.detail}
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export { IconActivity };
