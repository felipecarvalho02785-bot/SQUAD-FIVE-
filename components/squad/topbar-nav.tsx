"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/*
  TopbarNav — navegacao principal (client) com indicacao de rota ativa
  e badges contadores.

  Recebe os contadores em prop. Quando os dados reais existirem (Sprint 4)
  o Topbar (server) faz a query e passa pra ca.
*/

export interface NavBadge {
  count: number;
  /** Cor do badge — "casualty" para criticos, "copper" para acao necessaria, default "tactical" */
  tone?: "casualty" | "copper" | "tactical";
}

export interface NavItem {
  href: string;
  label: string;
  badge?: NavBadge;
}

interface TopbarNavProps {
  items: NavItem[];
  className?: string;
}

export function TopbarNav({ items, className }: TopbarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex items-center gap-1 bg-card-deep border border-tactical rounded-full px-1.5 py-1",
        className,
      )}
      aria-label="Navegação principal"
    >
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-colors",
              "font-display uppercase tracking-[0.06em] text-[12px] font-medium",
              isActive
                ? "bg-jungle text-cream"
                : "text-cream-muted hover:text-cream hover:bg-combat/70",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <span>{item.label}</span>
            {item.badge && item.badge.count > 0 ? (
              <span
                className={cn(
                  "min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-mono font-medium flex items-center justify-center leading-none",
                  item.badge.tone === "casualty"
                    ? "bg-casualty text-cream"
                    : item.badge.tone === "copper"
                      ? "bg-copper text-combat"
                      : "bg-tactical text-cream-muted",
                )}
                aria-label={`${item.badge.count} pendências`}
              >
                {item.badge.count > 9 ? "9+" : item.badge.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
