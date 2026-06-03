"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconPlus,
  IconUserPlus,
  IconTargetArrow,
  IconCalendar,
  IconChecks,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/*
  QuickAddFab — botão flutuante mobile-only com menu expansível.
  Atalho pra criar recruta / operação / briefing / squad task.
*/

const ACTIONS = [
  {
    href: "/recrutas/novo",
    label: "Recruta",
    Icon: IconUserPlus,
    tone: "bg-status-ok text-accent-cta-fg",
  },
  {
    href: "/operacoes/nova",
    label: "Operação",
    Icon: IconTargetArrow,
    tone: "bg-accent text-accent-cta-fg",
  },
  {
    href: "/briefings/novo",
    label: "Briefing",
    Icon: IconCalendar,
    tone: "bg-bronze text-accent-cta-fg",
  },
  {
    href: "/squad-tasks",
    label: "Tarefa",
    Icon: IconChecks,
    tone: "bg-border-strong text-accent-cta-fg",
  },
];

export function QuickAddFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? (
        <div
          className="lg:hidden fixed inset-0 z-modal bg-surface-base/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      ) : null}

      <div className="lg:hidden fixed bottom-20 right-4 z-modal flex flex-col items-end gap-3">
        {open
          ? ACTIONS.map((action, i) => {
              const { Icon } = action;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 pl-3 pr-4 h-11 rounded-full",
                    "shadow-lg ring-1 ring-black/20",
                    "animate-page-in",
                    action.tone,
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <Icon size={16} stroke={2} aria-hidden />
                  <span className="font-display uppercase tracking-[0.05em] text-[11px]">
                    {action.label}
                  </span>
                </Link>
              );
            })
          : null}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu rápido" : "Menu rápido"}
          aria-expanded={open}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-transform",
            "bg-accent-cta text-accent-cta-fg shadow-xl ring-2 ring-accent/40",
            "hover:bg-accent-hover active:scale-95",
            open && "rotate-45",
          )}
        >
          {open ? (
            <IconX size={20} stroke={2.5} aria-hidden />
          ) : (
            <IconPlus size={22} stroke={2.5} aria-hidden />
          )}
        </button>
      </div>
    </>
  );
}
