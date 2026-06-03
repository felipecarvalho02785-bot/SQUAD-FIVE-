"use client";

import { useState, useTransition } from "react";
import { IconBell, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markAllNotificationsReadAction } from "@/lib/actions/notification";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  unreadCount: number;
}

export function NotificationBell({ unreadCount }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      toast.success("Notificações marcadas como lidas");
      setOpen(false);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notificações${
          unreadCount > 0 ? ` (${unreadCount} não lidas)` : ""
        }`}
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
              "w-[320px] surface-raised flex flex-col overflow-hidden shadow-xl",
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
              <p className="py-10 text-center text-text-secondary text-[12px]">
                {unreadCount === 0
                  ? "Quartel silencioso. Nenhuma notificação."
                  : "Carregando..."}
              </p>
              <p className="px-4 pb-3 text-text-dim text-[10px] text-center">
                Sino integra eventos do squad. Visualização completa em breve.
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
