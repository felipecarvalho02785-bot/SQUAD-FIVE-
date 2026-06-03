"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  IconBell,
  IconCheck,
  IconUserPlus,
  IconTarget,
  IconAlertTriangle,
  IconCalendar,
  IconChecks,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { NotificationType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/actions/notification";
import type { NotificationItem } from "@/lib/queries/notification";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  unreadCount: number;
  notifications: NotificationItem[];
}

const ICON_BY_TYPE = {
  [NotificationType.ORDER_DUE]: IconChecks,
  [NotificationType.ORDER_ASSIGNED]: IconChecks,
  [NotificationType.OPERATION_RISK]: IconTarget,
  [NotificationType.BRIEFING_SOON]: IconCalendar,
  [NotificationType.GAP_OPEN]: IconAlertTriangle,
} as const;

const TONE_BY_TYPE = {
  [NotificationType.ORDER_DUE]: "text-status-warn-text",
  [NotificationType.ORDER_ASSIGNED]: "text-bronze",
  [NotificationType.OPERATION_RISK]: "text-status-critical-text",
  [NotificationType.BRIEFING_SOON]: "text-status-ok-text",
  [NotificationType.GAP_OPEN]: "text-status-warn-text",
} as const;

function getTitle(notif: NotificationItem): {
  title: string;
  detail?: string;
  href?: string;
} {
  const payload = notif.payload as Record<string, unknown>;
  switch (notif.type) {
    case NotificationType.ORDER_ASSIGNED: {
      const title = (payload?.title as string) ?? "Ordem atribuída";
      return {
        title: "Nova ordem do dia",
        detail: title,
      };
    }
    case NotificationType.ORDER_DUE: {
      const title = (payload?.title as string) ?? "Ordem vencendo";
      return {
        title: "Ordem com prazo próximo",
        detail: title,
      };
    }
    case NotificationType.OPERATION_RISK: {
      const reason = (payload?.reason as string) ?? "Operação em risco";
      const opId = payload?.operationId as string | undefined;
      return {
        title: "Operação com mudança",
        detail: reason,
        href: opId ? `/operacoes/${opId}` : undefined,
      };
    }
    case NotificationType.BRIEFING_SOON: {
      const opId = payload?.operationId as string | undefined;
      return {
        title: "Briefing programado",
        detail: "Confira detalhes na operação",
        href: opId ? `/operacoes/${opId}` : undefined,
      };
    }
    case NotificationType.GAP_OPEN: {
      const description = (payload?.description as string) ?? "Gap detectado";
      const opId = payload?.operationId as string | undefined;
      return {
        title: "Novo gap detectado",
        detail: description,
        href: opId ? `/operacoes/${opId}` : undefined,
      };
    }
    default:
      return { title: "Notificação" };
  }
}

function formatRelative(date: Date): string {
  const now = Date.now();
  const diffMin = Math.floor((now - date.getTime()) / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function NotificationBell({
  unreadCount,
  notifications,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      toast.success("Notificações marcadas como lidas");
      setOpen(false);
    });
  }

  function handleClickItem(notif: NotificationItem, href?: string) {
    if (!notif.read) {
      startTransition(async () => {
        await markNotificationReadAction(notif.id);
      });
    }
    if (href) {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ""}`}
        aria-expanded={open}
        className="relative min-w-11 min-h-11 lg:min-w-9 lg:min-h-9 w-9 h-9 rounded-full flex items-center justify-center text-text-dim hover:text-text-primary hover:bg-surface-deep transition-colors"
      >
        <IconBell size={16} stroke={1.5} aria-hidden />
        {unreadCount > 0 ? (
          <span
            className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-status-critical text-[9px] font-medium text-text-primary flex items-center justify-center leading-none animate-pulse-status"
            aria-hidden
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-dropdown"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-label="Central de notificações"
            className={cn(
              "absolute right-0 top-full mt-2 z-dropdown",
              "w-[360px] surface-raised flex flex-col overflow-hidden shadow-xl",
            )}
          >
            <header className="flex items-center justify-between px-4 py-3 border-b border-border-default">
              <h2 className="label-display text-[11px] text-text-primary">
                Notificações
              </h2>
              {unreadCount > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAll}
                  disabled={pending}
                >
                  <IconCheck size={12} aria-hidden />
                  Marcar todas
                </Button>
              ) : null}
            </header>

            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="py-10 text-center text-text-secondary text-[12px]">
                  Quartel silencioso.
                  <br />
                  Nenhuma notificação ainda.
                </p>
              ) : (
                <ul>
                  {notifications.map((notif) => {
                    const meta = getTitle(notif);
                    const Icon = ICON_BY_TYPE[notif.type] ?? IconUserPlus;
                    const tone = TONE_BY_TYPE[notif.type] ?? "text-bronze";
                    const body = (
                      <>
                        <Icon
                          size={14}
                          stroke={1.5}
                          className={cn("shrink-0 mt-0.5", tone)}
                          aria-hidden
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <span
                              className={cn(
                                "text-[12px]",
                                notif.read
                                  ? "text-text-secondary"
                                  : "text-text-primary font-medium",
                              )}
                            >
                              {meta.title}
                            </span>
                            <span className="font-mono text-[10px] text-text-dim shrink-0">
                              {formatRelative(notif.createdAt)}
                            </span>
                          </div>
                          {meta.detail ? (
                            <p className="text-text-dim text-[11px] truncate mt-0.5">
                              {meta.detail}
                            </p>
                          ) : null}
                        </div>
                        {!notif.read ? (
                          <span
                            className="shrink-0 w-1.5 h-1.5 rounded-full bg-status-critical mt-1.5"
                            aria-label="Não lida"
                          />
                        ) : null}
                      </>
                    );
                    return (
                      <li
                        key={notif.id}
                        className={cn(
                          "border-b border-border-default/40 last:border-0",
                          !notif.read && "bg-surface-accent/30",
                        )}
                      >
                        {meta.href ? (
                          <Link
                            href={meta.href}
                            onClick={() => handleClickItem(notif, meta.href)}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-surface-deep transition-colors cursor-pointer"
                          >
                            {body}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleClickItem(notif, undefined)
                            }
                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-surface-deep transition-colors cursor-pointer text-left"
                          >
                            {body}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
